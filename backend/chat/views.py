from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Max, Subquery, OuterRef
from django.contrib.auth import get_user_model
from .models import Message

User = get_user_model()

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Get the latest message per conversation partner
        messages = Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('-created_at')

        seen = set()
        conversations = []
        for msg in messages:
            other = msg.receiver if msg.sender == user else msg.sender
            if other.id not in seen:
                seen.add(other.id)
                conversations.append({
                    'username': other.username,
                    'first_name': other.first_name,
                    'last_name': other.last_name,
                    'avatar': request.build_absolute_uri(other.avatar.url) if other.avatar else None,
                    'last_message': msg.content,
                    'last_message_time': msg.created_at.isoformat(),
                    'unread_count': Message.objects.filter(
                        sender=other, receiver=user, is_read=False
                    ).count(),
                })
        return Response(conversations)

class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if len(q) < 1:
            return Response([])

        users = User.objects.filter(
            Q(username__icontains=q) |
            Q(first_name__icontains=q) |
            Q(last_name__icontains=q)
        ).exclude(id=request.user.id)[:8]  # exclude self, max 8 results

        return Response([
            {
                'username': u.username,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'avatar': request.build_absolute_uri(u.avatar.url) if u.avatar else None,
            }
            for u in users
        ])