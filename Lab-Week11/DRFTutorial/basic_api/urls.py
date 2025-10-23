# basic_api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    API_objects, 
    API_objects_detail,
    DosenViewSet,
    MahasiswaViewSet
)

router = DefaultRouter()
router.register(r'dosen', DosenViewSet, basename='dosen')
router.register(r'mahasiswa', MahasiswaViewSet, basename='mahasiswa')

urlpatterns = [
    path('basic/', API_objects.as_view(), name='drfpost-list'),
    path('basic/<int:pk>/', API_objects_detail.as_view(), name='drfpost-detail'),
    
    path('campus/', include(router.urls)),
]

