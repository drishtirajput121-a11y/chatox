from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
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
        return Response({'status': 'followed'})