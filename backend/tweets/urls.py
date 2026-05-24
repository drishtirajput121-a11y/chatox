from django.urls import path
from . import views

urlpatterns = [
    path('', views.TweetListCreateView.as_view()),
    path('feed/', views.FeedView.as_view()),
    path('<int:pk>/', views.TweetDetailView.as_view()),
    path('<int:pk>/like/', views.LikeToggleView.as_view()),
    path('poll/vote/<int:option_id>/', views.PollVoteView.as_view()),
]