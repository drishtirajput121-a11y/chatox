from django.db import models
from django.conf import settings

class Tweet(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tweets',
    )
    content = models.CharField(max_length=280)
    image = models.ImageField(
        upload_to='tweet_images/',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}"

    @property
    def likes_count(self):
        return self.likes.count()

    def is_liked_by(self, user):
        return self.likes.filter(user=user).exists()


class Like(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes',
    )
    tweet = models.ForeignKey(
        Tweet,
        on_delete=models.CASCADE,
        related_name='likes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'tweet')  # prevents duplicate likes

class TweetImage(models.Model):
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='tweet_images/')