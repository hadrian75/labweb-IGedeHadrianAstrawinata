from django.shortcuts import render
from rest_framework import generics
from basic_api.models import DRFPost
from basic_api.serializers import DRFPostSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .filters import BookFilter

class API_objects(generics.ListCreateAPIView):
    queryset = DRFPost.objects.all()
    serializer_class = DRFPostSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = BookFilter

class API_objects_details(generics.RetrieveUpdateDestroyAPIView):
    queryset = DRFPost.objects.all()
    serializer_class = DRFPostSerializer