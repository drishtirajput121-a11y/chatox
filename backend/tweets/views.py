from rest_framework import generics
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Tweet, Like, TweetImage, Poll, PollOption, PollVote
from .serializers import TweetSerializer, PollSerializer
from notifications.models import Notification
import json
from django.utils import timezone
from datetime import timedelta
from .tasks import publish_scheduled_tweet
from django.db.models import Count, Prefetch
import re
from django.core.cache import cache



class IsAuthorOrReadOnly:
    def has_object_permission(self, request, view, obj):
        from rest_framework.permissions import SAFE_METHODS
        if request.method in SAFE_METHODS:
            return True
        return obj.author == request.user
# ── N+1 fix mixin ─────────────────────────────────────────
class TweetContextMixin:
    def get_serializer_context(self):
        context = super().get_serializer_context()
        request = self.request
        if not request or not request.user.is_authenticated:
            return context

        qs = self.get_queryset()
        tweet_ids = list(qs.values_list('id', flat=True))

        liked_ids = set(
            Like.objects.filter(
                user=request.user,
                tweet_id__in=tweet_ids
            ).values_list('tweet_id', flat=True)
        )

        voted_option_ids = set(
            PollVote.objects.filter(
                user=request.user,
                option__poll__tweet_id__in=tweet_ids
            ).values_list('option_id', flat=True)
        )

        context['liked_tweet_ids'] = liked_ids
        context['voted_option_ids'] = voted_option_ids
        return context


# ── Shared optimised queryset ──────────────────────────────
def tweet_queryset():
    return Tweet.objects.select_related('author').prefetch_related(
        'likes',
        'images',
        Prefetch(
            'poll__options',
            queryset=PollOption.objects.annotate(_vote_count=Count('votes'))
        )
    )


# ── Views ──────────────────────────────────────────────────

class FeedView(TweetContextMixin, generics.ListAPIView):
    serializer_class = TweetSerializer

    def get_queryset(self):
        user = self.request.user
        ids = list(user.following.values_list('id', flat=True)) + [user.id]
        return tweet_queryset().filter(
            author_id__in=ids,
            is_published=True,
        ).order_by('-created_at')


class TweetListCreateView(TweetContextMixin, generics.ListCreateAPIView):
    serializer_class = TweetSerializer

    def get_queryset(self):
        username = self.request.query_params.get('username')
        qs = tweet_queryset().filter(is_published=True).order_by('-created_at')
        if username:
            return qs.filter(author__username=username)
        return qs

    def perform_create(self, serializer):
        scheduled_at_str = self.request.data.get('scheduled_at')
        is_published = True
        scheduled_at = None

        if scheduled_at_str:
            from dateutil.parser import parse as parse_date
            scheduled_at = parse_date(scheduled_at_str)
            is_published = False

        # Save ONCE only
        tweet = serializer.save(
            author=self.request.user,
            is_published=is_published,
            scheduled_at=scheduled_at,
            location=self.request.data.get('location', ''),
        )

        for img in self.request.FILES.getlist('images'):
            TweetImage.objects.create(tweet=tweet, image=img)

        poll_data = self.request.data.get('poll')
        if poll_data:
            if isinstance(poll_data, str):
                poll_data = json.loads(poll_data)
            duration = int(poll_data.get('duration_hours', 24))
            poll = Poll.objects.create(
                tweet=tweet,
                duration_hours=duration,
                ends_at=timezone.now() + timedelta(hours=duration),
            )
            for i, opt in enumerate(poll_data.get('options', [])):
                if opt.strip():
                    PollOption.objects.create(poll=poll, text=opt.strip(), order=i)

        if scheduled_at and not is_published:
            publish_scheduled_tweet.apply_async(
                args=[tweet.id],
                eta=scheduled_at,
            )


class TweetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TweetSerializer

    def get_queryset(self):
        return tweet_queryset()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        request = self.request
        if request and request.user.is_authenticated:
            tweet_id = self.kwargs.get('pk')
            context['liked_tweet_ids'] = set(
                Like.objects.filter(
                    user=request.user, tweet_id=tweet_id
                ).values_list('tweet_id', flat=True)
            )
            context['voted_option_ids'] = set(
                PollVote.objects.filter(
                    user=request.user,
                    option__poll__tweet_id=tweet_id
                ).values_list('option_id', flat=True)
            )
        return context

    def update(self, request, *args, **kwargs):
        tweet = self.get_object()
        if tweet.author != request.user:
            return Response({'error': 'Not your tweet'}, status=403)
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        tweet = self.get_object()
        if tweet.author != request.user:
            return Response({'error': 'Not your tweet'}, status=403)
        tweet.delete()
        return Response(status=204)


class LikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            tweet = Tweet.objects.get(pk=pk)
        except Tweet.DoesNotExist:
            return Response({'error': 'Tweet not found'}, status=404)

        like, created = Like.objects.get_or_create(
            user=request.user,
            tweet=tweet
        )

        if not created:
            like.delete()
            return Response({
                'is_liked': False,
                'likes_count': tweet.likes.count(),
            })

        # Send notification only to other users
        if tweet.author != request.user:
            Notification.objects.get_or_create(
                recipient=tweet.author,
                sender=request.user,
                notification_type=Notification.LIKE,
                tweet=tweet,
            )

        return Response({
            'is_liked': True,
            'likes_count': tweet.likes.count(),
        })


class PollVoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, option_id):
        try:
            option = PollOption.objects.select_related('poll').get(pk=option_id)
        except PollOption.DoesNotExist:
            return Response({'error': 'Option not found'}, status=404)

        if option.poll.is_expired():
            return Response({'error': 'Poll has ended'}, status=400)

        existing_vote = PollVote.objects.filter(
            option__poll=option.poll, user=request.user
        ).first()

        if existing_vote:
            if existing_vote.option == option:
                existing_vote.delete()
            else:
                existing_vote.option = option
                existing_vote.save()
        else:
            PollVote.objects.create(option=option, user=request.user)

        poll = option.poll
        return Response(PollSerializer(poll, context={'request': request}).data)


class TrendingHashtagsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        since = timezone.now() - timedelta(hours=24)

        recent_tweets = Tweet.objects.filter(
            is_published=True,
            created_at__gte=since,
        ).annotate(
            like_count=Count('likes')
        ).values_list('content', 'like_count')

        if not recent_tweets:
            return Response([])

        counts = {}
        for content, like_count in recent_tweets:
            tags = re.findall(r'#(\w+)', content, re.IGNORECASE)
            for tag in tags:
                key = tag.lower()
                if key not in counts:
                    counts[key] = {'posts': 0, 'likes': 0}
                counts[key]['posts'] += 1
                counts[key]['likes'] += like_count

        if not counts:
            return Response([])

        max_posts = max(v['posts'] for v in counts.values()) or 1
        max_likes = max(v['likes'] for v in counts.values()) or 1

        scored = []
        for tag, data in counts.items():
            score = (data['likes'] / max_likes * 0.6) + (data['posts'] / max_posts * 0.4)
            scored.append({
                'tag': f'#{tag}',
                'score': score,
                'posts': data['posts'],
                'likes': data['likes'],
            })

        scored.sort(key=lambda x: x['score'], reverse=True)

        return Response([
            {
                'tag': t['tag'],
                'label': (
                    f"{t['posts']} post{'s' if t['posts'] != 1 else ''}"
                    f" · {t['likes']} like{'s' if t['likes'] != 1 else ''}"
                ),
            }
            for t in scored[:5]
        ])