from celery import shared_task
from django.utils import timezone

@shared_task
def publish_scheduled_tweet(tweet_id):
    from .models import Tweet
    try:
        tweet = Tweet.objects.get(pk=tweet_id, is_published=False)
        if tweet.scheduled_at and tweet.scheduled_at <= timezone.now():
            tweet.is_published = True
            tweet.save()
    except Tweet.DoesNotExist:
        pass