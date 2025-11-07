from django.contrib import admin
from django.urls import path, include
from users import urls as urlsuser 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include(urlsuser)) 
]