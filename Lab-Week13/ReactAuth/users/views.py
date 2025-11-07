# users/views.py

from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import CustomUserSerializer, CustomTokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

User = get_user_model()

class RegisterView(generics.CreateAPIView):
  queryset = User.objects.all()
  permission_classes = (permissions.AllowAny,)
  serializer_class = CustomUserSerializer
  

class CustomTokenObtainPairView(TokenObtainPairView):
  serializer_class = CustomTokenObtainPairSerializer
  
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_data_view(request):
    return Response({
        "message": f"Akses berhasil! Anda adalah {request.user.role}.",
        "full_name": request.user.full_name
    })