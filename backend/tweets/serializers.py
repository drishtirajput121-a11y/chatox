from rest_framework import serializers
from .models import Tweet
from users.serializers import UserSerializer
from .models import TweetImage


class TweetImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TweetImage
        fields = ['id', 'image']

class TweetSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    images = TweetImageSerializer(many=True, read_only=True)

    class Meta:
        model = Tweet
        fields = ['id','author','content','images','created_at','likes_count','is_liked']
        read_only_fields = ['id','author','created_at']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_liked_by(request.user)
        return False

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Tweet cannot be empty.')
        return value