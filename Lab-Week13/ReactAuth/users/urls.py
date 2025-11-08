from django.urls import path, include
from .views import RegisterView, CustomTokenObtainPairView, JurusanViewSet, MatakuliahViewSet, KomponenNilaiViewSet,AssessmentViewSet,NilaiAkhirViewSet, MahasiswaListView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'jurusan', JurusanViewSet, basename='jurusan')
router.register(r'matakuliah', MatakuliahViewSet, basename='matakuliah')
router.register(r'komponen', KomponenNilaiViewSet, basename='komponen')
router.register(r'assessment', AssessmentViewSet, basename='assessment')
router.register(r'nilai-akhir', NilaiAkhirViewSet, basename='nilai-akhir')


auth_urls = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

academic_urls = [
    path('mahasiswa/', MahasiswaListView.as_view(), name='mahasiswa-list'),
    path('', include(router.urls)),
]