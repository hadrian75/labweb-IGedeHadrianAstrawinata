# views.py
from rest_framework import generics, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from basic_api.models import DRFPost, Mahasiswa, Dosen
from basic_api.serializers import (
    DRFPostSerializer, 
    MahasiswaSerializer, 
    DosenSerializer,
    DosenDetailSerializer
)

class API_objects(generics.ListCreateAPIView):
    queryset = DRFPost.objects.all()
    serializer_class = DRFPostSerializer

class API_objects_detail(generics.RetrieveUpdateDestroyAPIView):
    queryset = DRFPost.objects.all()
    serializer_class = DRFPostSerializer

class DosenViewSet(viewsets.ModelViewSet):
    queryset = Dosen.objects.all()
    serializer_class = DosenSerializer
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DosenDetailSerializer
        return DosenSerializer
    
    @action(detail=False, methods=['get'])
    def by_prodi(self, request):
        prodi = request.query_params.get('prodi', None)
        if prodi:
            dosen = Dosen.objects.filter(prodi=prodi)
            serializer = self.get_serializer(dosen, many=True)
            return Response(serializer.data)
        return Response({'error': 'Prodi parameter required'}, status=400)

class MahasiswaViewSet(viewsets.ModelViewSet):
    queryset = Mahasiswa.objects.all()
    serializer_class = MahasiswaSerializer
    
    @action(detail=False, methods=['get'])
    def by_mentor(self, request):
        mentor_id = request.query_params.get('mentor_id', None)
        if mentor_id:
            mahasiswa = Mahasiswa.objects.filter(mentor_id=mentor_id)
            serializer = self.get_serializer(mahasiswa, many=True)
            return Response(serializer.data)
        return Response({'error': 'Mentor ID required'}, status=400)