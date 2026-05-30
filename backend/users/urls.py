from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('login/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('me/', views.MeView.as_view()),
    path('<str:username>/', views.ProfileView.as_view()),
    path('<str:username>/follow/', views.FollowView.as_view()),
    path('<str:username>/followers/', views.FollowersListView.as_view()),
    path('<str:username>/following/', views.FollowingListView.as_view()),
    path('register/send-otp/', views.SendOTPView.as_view()),
    path('register/verify-otp/', views.VerifyOTPView.as_view()),
]