from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer
from notifications.models import Notification
from django.shortcuts import get_object_or_404
from .otp import generate_otp, store_otp, verify_otp, send_otp_email
from django.core.cache import cache


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

class SendOTPView(APIView):
    """Step 1 — validate data + send OTP. No account created yet."""
    permission_classes = [AllowAny]

    def post(self, request):
        # Rate limit: max 3 OTP requests per IP per hour
        ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
        rate_key = f'otp_send_limit:{ip}'
        send_count = cache.get(rate_key, 0)
        if send_count >= 3:
            return Response(
                {'error': 'Too many requests. Try again in an hour.'},
                status=429
            )

        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data['email']
        username = serializer.validated_data['username']

        # Check if email or username already exists
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken'}, status=400)

        otp = generate_otp()
        store_otp(email, otp, serializer.validated_data)

        try:
            send_otp_email(email, otp, username)
        except Exception as e:
            return Response({'error': f'Email failed: {type(e).__name__}: {str(e)}'}, status=500)

        # Increment send count after successful send
        cache.set(rate_key, send_count + 1, timeout=3600)

        return Response({
            'message': 'OTP sent to your email',
            'email': email,
        }, status=200)


class VerifyOTPView(APIView):
    """Step 2 — verify OTP + create account + return tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        otp_input = request.data.get('otp', '').strip()

        if not email or not otp_input:
            return Response({'error': 'Email and OTP are required'}, status=400)

        # Rate limit: max 5 wrong attempts per email
        attempt_key = f'otp_attempts:{email}'
        attempts = cache.get(attempt_key, 0)
        if attempts >= 5:
            cache.delete(f'otp:{email}')  # invalidate OTP
            return Response(
                {'error': 'Too many failed attempts. Please request a new code.'},
                status=429
            )

        user_data, error = verify_otp(email, otp_input)
        if error:
            # Increment failed attempt counter
            cache.set(attempt_key, attempts + 1, timeout=600)
            remaining = 5 - (attempts + 1)
            return Response(
                {'error': f'{error}. {remaining} attempt(s) remaining.'},
                status=400
            )

        # Clear attempt counter on success
        cache.delete(attempt_key)

        # Create the account now
        try:
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
            )
        except Exception as e:
            return Response({'error': 'Account creation failed'}, status=500)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=201)