from rest_framework import serializers
from .models import Tweet
from users.serializers import UserSerializer
from .models import TweetImage
from .models import Tweet, TweetImage, Poll, PollOption, PollVote, Reply

class TweetImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TweetImage
        fields = ['id', 'image']

class PollOptionSerializer(serializers.ModelSerializer):
    vote_count = serializers.SerializerMethodField()
    vote_percent = serializers.SerializerMethodField()
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model = PollOption
        fields = ['id', 'text', 'order', 'vote_count', 'vote_percent', 'has_voted']

    def get_vote_count(self, obj):
        return obj.vote_count()

    def get_vote_percent(self, obj):
        total = obj.poll.total_votes()
        return obj.vote_percent(total)

    def get_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.votes.filter(user=request.user).exists()
        return False

class PollSerializer(serializers.ModelSerializer):
    options = PollOptionSerializer(many=True, read_only=True)
    total_votes = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    user_voted = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = ['id', 'duration_hours', 'ends_at', 'options', 'total_votes', 'is_expired', 'user_voted']

    def get_total_votes(self, obj):
        return obj.total_votes()

    def get_is_expired(self, obj):
        return obj.is_expired()

    def get_user_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PollVote.objects.filter(
                option__poll=obj, user=request.user
            ).exists()
        return False

class TweetSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    images = TweetImageSerializer(many=True, read_only=True)
    poll = PollSerializer(read_only=True)

    class Meta:
        model = Tweet
        fields = [
            'id', 'author', 'content', 'images', 'poll',
            'location', 'scheduled_at', 'is_published',
            'created_at', 'likes_count', 'is_liked'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'poll', 'is_published']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_liked_by(request.user)
        return False

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Tweet cannot be empty.')
        return value

class ReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Reply
        fields = ['id', 'author', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']