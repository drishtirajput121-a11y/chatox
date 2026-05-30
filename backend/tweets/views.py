from rest_framework import generics, status
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from .models import Tweet, Like
from .serializers import TweetSerializer, PollSerializer
from notifications.models import Notification
from .models import Tweet, TweetImage, Poll, PollOption, PollVote
import json
from django.utils import timezone
from datetime import timedelta
from .tasks import publish_scheduled_tweet
from django.db.models import Count
import re
from django.core.cache import cache

class IsAuthorOrReadOnly:
    def has_object_permission(self, request, view, obj):
        from rest_framework.permissions import SAFE_METHODS
        if request.method in SAFE_METHODS:
            return True
        return obj.author == request.user

class FeedView(generics.ListAPIView):
    serializer_class = TweetSerializer

    def get_queryset(self):
        user = self.request.user
        ids = list(user.following.values_list('id', flat=True)) + [user.id]
        return Tweet.objects.filter(
            author_id__in=ids,
            is_published=True,       # ← only published
        ).select_related('author').prefetch_related('likes', 'images', 'poll__options')

class TweetListCreateView(generics.ListCreateAPIView):
    serializer_class = TweetSerializer
    def get_queryset(self):
        username = self.request.query_params.get('username')
        qs = Tweet.objects.filter(
            is_published=True        # ← only published
        ).select_related('author').prefetch_related('likes', 'images', 'poll__options')
        if username:
            return qs.filter(author__username=username)
        return qs

    def perform_create(self, serializer):
        tweet = serializer.save(author=self.request.user)
        scheduled_at_str = self.request.data.get('scheduled_at')
        is_published = True
        scheduled_at = None

        if scheduled_at_str:
            from dateutil.parser import parse as parse_date
            scheduled_at = parse_date(scheduled_at_str)
            is_published = False  # hide until publish time
            
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
                poll_data = json.loads(poll_data)  # FormData sends strings
            duration = int(poll_data.get('duration_hours', 24))
            poll = Poll.objects.create(
                tweet=tweet,
                duration_hours=duration,
                ends_at=timezone.now() + timedelta(hours=duration),
            )
            for i, opt in enumerate(poll_data.get('options', [])):
                if opt.strip():
                    PollOption.objects.create(poll=poll, text=opt.strip(), order=i)
        # schedule celery task to auto-publish
        if scheduled_at and not is_published:
            publish_scheduled_tweet.apply_async(
                args=[tweet.id],
                eta=scheduled_at,  # run exactly at this time
            )

class PollVoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, option_id):
        try:
            option = PollOption.objects.select_related('poll').get(pk=option_id)
        except PollOption.DoesNotExist:
            return Response({'error': 'Option not found'}, status=404)

        if option.poll.is_expired():
            return Response({'error': 'Poll has ended'}, status=400)

        # check if user already voted in this poll
        existing_vote = PollVote.objects.filter(
            option__poll=option.poll, user=request.user
        ).first()

        if existing_vote:
            if existing_vote.option == option:
                # clicked same option — remove vote (unvote)
                existing_vote.delete()
            else:
                # clicked different option — switch vote
                existing_vote.option = option
                existing_vote.save()
        else:
            # first time voting
            PollVote.objects.create(option=option, user=request.user)

        poll = option.poll
        return Response(PollSerializer(poll, context={'request': request}).data)

class TweetDetailView(generics.RetrieveDestroyAPIView):
    queryset = Tweet.objects.select_related('author').prefetch_related('likes')
    serializer_class = TweetSerializer

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
                'likes_count': tweet.likes_count
            })

        return Response({
            'is_liked': True,
            'likes_count': tweet.likes_count
        })

        # create notification when tweet is liked
        if tweet.author != request.user:
            Notification.objects.create(
                recipient=tweet.author,
                sender=request.user,
                notification_type=Notification.LIKE,
                tweet=tweet,
            )

        return Response({
            'status': 'liked',
            'likes_count': tweet.likes_count
        })

class TrendingHashtagsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # only tweets from last 24 hours
        since = timezone.now() - timedelta(hours=24)

        recent_tweets = Tweet.objects.filter(
            is_published=True,
            created_at__gte=since,
        ).annotate(
            like_count=Count('likes')
        ).values_list('content', 'like_count')

        if not recent_tweets:
            return Response([])

        # build hashtag scores
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

        # normalize + score
        max_posts = max(v['posts'] for v in counts.values()) or 1
        max_likes = max(v['likes'] for v in counts.values()) or 1

        scored = []
        for tag, data in counts.items():
            post_score  = data['posts'] / max_posts
            like_score  = data['likes'] / max_likes
            score = (like_score * 0.6) + (post_score * 0.4)
            scored.append({
                'tag':   f'#{tag}',
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
