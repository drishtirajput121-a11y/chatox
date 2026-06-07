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
    location = models.CharField(max_length=100, blank=True, default='')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=True)
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

class Poll(models.Model):
    tweet = models.OneToOneField(Tweet, on_delete=models.CASCADE, related_name='poll')
    duration_hours = models.PositiveIntegerField(default=24)
    ends_at = models.DateTimeField()

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.ends_at

    def total_votes(self):
        return sum(o.votes.count() for o in self.options.all())


class PollOption(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=25)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def vote_count(self):
        return self.votes.count()

    def vote_percent(self, total):
        if not total:
            return 0
        return round((self.votes.count() / total) * 100)


class PollVote(models.Model):
    option = models.ForeignKey(PollOption, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('option', 'user')  # one vote per option per user

class Reply(models.Model):
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='replies')
    content = models.CharField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.author.username} replied: {self.content[:50]}"