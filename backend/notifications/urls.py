from django.urls import path
from . import views

urlpatterns = [
    path('',            views.NotificationListView.as_view()),
    path('unread/',     views.UnreadCountView.as_view()),
    path('mark-read/',  views.MarkAllReadView.as_view()),
]