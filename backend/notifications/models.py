from django.db import models
from django.conf import settings

class Notification(models.Model):
    LIKE    = 'like'
    REPLY   = 'reply'
    FOLLOW  = 'follow'
    RETWEET = 'retweet'

    TYPE_CHOICES = [
        (LIKE,    'Like'),
        (REPLY,   'Reply'),
        (FOLLOW,  'Follow'),
        (RETWEET, 'Retweet'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_notifications'
    )
    notification_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    tweet = models.ForeignKey(
        'tweets.Tweet',
        on_delete=models.CASCADE,
        null=True, blank=True  # follow notifications have no tweet
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']