# users/views.py

from django.shortcuts import render
from rest_framework import generics, permissions, viewsets, status
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import CustomUserSerializer, CustomTokenObtainPairSerializer,JurusanSerializer, MatakuliahReadSerializer, MatakuliahWriteSerializer, KomponenNilaiSerializer, AssessmentSerializer, NilaiAkhirSerializer, MahasiswaSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .models import Jurusan, Matakuliah, KomponenNilai, Assessment, NilaiAkhir, CustomUser
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
    

class IsDosenOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and (
            request.user.role == CustomUser.Role.DOSEN or request.user.is_staff
        )
class MahasiswaListView(generics.ListAPIView):
    queryset = User.objects.filter(role=CustomUser.Role.MAHASISWA)
    serializer_class = MahasiswaSerializer
    permission_classes = [IsAuthenticated, IsDosenOrReadOnly] 
class IsMahasiswaSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == CustomUser.Role.DOSEN or request.user.is_staff:
            return True
        return obj.mahasiswa == request.user

class JurusanViewSet(viewsets.ModelViewSet):
    queryset = Jurusan.objects.all()
    serializer_class = JurusanSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()] 
        
        return [permissions.AllowAny()]

class MatakuliahViewSet(viewsets.ModelViewSet):
    queryset = Matakuliah.objects.all()
    permission_classes = [IsDosenOrReadOnly] 

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MatakuliahWriteSerializer
        return MatakuliahReadSerializer
        
    def perform_create(self, serializer):
        serializer.save()

class KomponenNilaiViewSet(viewsets.ModelViewSet):
    queryset = KomponenNilai.objects.all()
    serializer_class = KomponenNilaiSerializer
    permission_classes = [IsDosenOrReadOnly]
    
    # ✅ TAMBAHKAN INI - Filter komponen berdasarkan mata kuliah
    def get_queryset(self):
        queryset = super().get_queryset()
        matakuliah_kode_mk = self.request.query_params.get('matakuliah_kode_mk')
        if matakuliah_kode_mk:
            return queryset.filter(matakuliah__kode_mk=matakuliah_kode_mk)
        return queryset

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [IsDosenOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        matakuliah_kode_mk = self.request.query_params.get('matakuliah_kode_mk')
        if matakuliah_kode_mk:
            return queryset.filter(komponen__matakuliah__kode_mk=matakuliah_kode_mk)
        return queryset

class NilaiAkhirViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NilaiAkhir.objects.all()
    serializer_class = NilaiAkhirSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if self.request.user.role == CustomUser.Role.MAHASISWA and not self.request.user.is_staff:
            return NilaiAkhir.objects.filter(mahasiswa=self.request.user)
        return NilaiAkhir.objects.all()

    @action(detail=False, methods=['POST'], permission_classes=[IsDosenOrReadOnly])
    def calculate_final_score(self, request):
        mahasiswa_id = request.data.get('mahasiswa_id')
        matakuliah_kode = request.data.get('matakuliah_kode')

        if not mahasiswa_id or not matakuliah_kode:
            return Response(
                {"detail": "mahasiswa_id dan matakuliah_kode harus disediakan."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from .utils import hitung_dan_simpan_nilai_akhir
        
        success, result = hitung_dan_simpan_nilai_akhir(mahasiswa_id, matakuliah_kode)

        if success:
            serializer = NilaiAkhirSerializer(result)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"detail": result}, status=status.HTTP_400_BAD_REQUEST)