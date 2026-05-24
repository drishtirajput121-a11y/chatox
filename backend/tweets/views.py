from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Tweet, Like
from .serializers import TweetSerializer
from notifications.models import Notification

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
        serializer.save(author=self.request.user)

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