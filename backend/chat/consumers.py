import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        other_username = self.scope['url_route']['kwargs']['username']
        try:
            self.other_user = await database_sync_to_async(
                User.objects.get)(username=other_username)
        except User.DoesNotExist:
            await self.close()
            return

        users = sorted([self.user.username, other_username])
        self.room_name = f'dm_{"__".join(users)}'

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()
        await self.mark_messages_read()
        messages = await self.get_messages()
        await self.send(text_data=json.dumps({
            'type': 'history',
            'messages': messages
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(
                self.room_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'typing':
            await self.channel_layer.group_send(self.room_name, {
                'type': 'typing_indicator',
                'username': self.user.username,
                'is_typing': data.get('is_typing', False),
            })
            return
        
        content = data.get('content', '').strip()
        if not content:
            return

        msg = await self.save_message(content)

        # send to chat room
        await self.channel_layer.group_send(self.room_name, {
            'type': 'chat_message',
            'message': msg,
        })

        # send notification to receiver's notification channel
        await self.channel_layer.group_send(
            f'notifications_{self.other_user.username}',
            {
                'type': 'new_message_notification',
                'sender': self.user.username,
                'preview': content[:60] + ('…' if len(content) > 60 else ''),
                'avatar': await self.get_sender_avatar(),
            }
        )
    
    async def typing_indicator(self, event):
    # don't send typing back to the person who is typing
        if event['username'] != self.user.username:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'username': event['username'],
                'is_typing': event['is_typing'],
            }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message']
        }))

    @database_sync_to_async
    def get_sender_avatar(self):
        return self.user.avatar.url if self.user.avatar else None

    @database_sync_to_async
    def get_messages(self):
        msgs = Message.objects.filter(
            sender__in=[self.user, self.other_user],
            receiver__in=[self.user, self.other_user],
        ).select_related('sender', 'receiver').order_by('-created_at')[:50]
        return [
            {
                'id': m.id,
                'content': m.content,
                'sender': m.sender.username,
                'created_at': m.created_at.isoformat(),
                'is_read': m.is_read,
            }
            for m in reversed(list(msgs))
        ]

    @database_sync_to_async
    def save_message(self, content):
        msg = Message.objects.create(
            sender=self.user,
            receiver=self.other_user,
            content=content,
        )
        return {
            'id': msg.id,
            'content': msg.content,
            'sender': msg.sender.username,
            'created_at': msg.created_at.isoformat(),
            'is_read': msg.is_read,
        }
    @database_sync_to_async
    def mark_messages_read(self):
        Message.objects.filter(
            receiver=self.user,
            sender=self.other_user,
            is_read=False,
        ).update(is_read=True)