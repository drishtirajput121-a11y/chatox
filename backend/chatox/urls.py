"""
URL configuration for chatox project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.core.files.storage import default_storage

def check_cloudinary(request):
    return JsonResponse({
        'cloud_name': os.environ.get('CLOUDINARY_CLOUD_NAME', 'NOT SET'),
        'api_key': str(os.environ.get('CLOUDINARY_API_KEY', 'NOT SET'))[:6] + '...',
        'storage': str(default_storage.__class__.__name__),
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/tweets/', include('tweets.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/chat/', include('chat.urls')),
    path('debug-storage/', check_cloudinary),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
