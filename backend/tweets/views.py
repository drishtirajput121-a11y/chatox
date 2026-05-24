from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Tweet, Like
from .serializers import TweetSerializer, PollSerializer
from notifications.models import Notification
from .models import Tweet, TweetImage, Poll, PollOption, PollVote
import json
from django.utils import timezone
from datetime import timedelta


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
            author_id__in=ids
        ).select_related('author').prefetch_related('likes')

class TweetListCreateView(generics.ListCreateAPIView):
    serializer_class = TweetSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        username = self.request.query_params.get('username')
        qs = Tweet.objects.select_related('author').prefetch_related('likes')
        if username:
            return qs.filter(author__username=username)
        return qs

    def perform_create(self, serializer):
        tweet = serializer.save(author=self.request.user)
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
                'status': 'unliked',
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