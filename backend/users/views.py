from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer
from notifications.models import Notification
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
from .throttles import LoginRateThrottle, RegisterRateThrottle
User = get_user_model()

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [RegisterRateThrottle]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user
 
    def update(self, request, *args, **kwargs):
        # Handle image removal — frontend sends empty string to clear a field
        for field in ('avatar', 'banner'):
            if field in request.data and request.data[field] == '':
                file_field = getattr(request.user, field)
                if file_field:
                    file_field.delete(save=False)
                setattr(request.user, field, None)
                request.user.save(update_fields=[field])
 
        kwargs['partial'] = True   # always treat as partial update (same as PATCH)
        return super().update(request, *args, **kwargs)
 

class ProfileView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'username'

class FollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        try:
            target = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        if target == request.user:
            return Response({'error': 'Cannot follow yourself'}, status=400)
        if request.user.following.filter(pk=target.pk).exists():
            request.user.following.remove(target)
            return Response({'status': 'unfollowed'})
        request.user.following.add(target)
        Notification.objects.get_or_create(
            recipient=target,
            sender=request.user,
            notification_type=Notification.FOLLOW,
        )
        return Response({'status': 'followed'})

class FollowersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        followers = user.followers.all()  # adjust if your related_name differs
        data = [
            {
                'username': u.username,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'is_following': request.user.following.filter(pk=u.pk).exists()
            }
            for u in followers
        ]
        return Response(data)


class FollowingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        following = user.following.all()  # adjust if your related_name differs
        data = [
            {
                'username': u.username,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'is_following': request.user.following.filter(pk=u.pk).exists()
            }
            for u in following
        ]
        return Response(data)
class LoginView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]