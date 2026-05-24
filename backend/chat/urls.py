from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view()),
    path('search-users/', views.UserSearchView.as_view()), 
]