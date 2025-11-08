from django.contrib import admin
from django.urls import path, include
from users.urls import (auth_urls, academic_urls)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include(auth_urls)),
    path('api/academic/', include(academic_urls)) 
]