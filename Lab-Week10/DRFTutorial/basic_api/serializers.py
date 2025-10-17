from rest_framework import routers, serializers, viewsets
from basic_api.models import DRFPost, Dosen, Mahasiswa

class DRFPostSerializer(serializers.ModelSerializer):
  class Meta:
    model = DRFPost
    fields = "__all__"
    

class DosenSerializer(serializers.ModelSerializer):
    prodi_display = serializers.CharField(source='get_prodi_display', read_only=True)
    
    class Meta:
        model = Dosen
        fields = ['id', 'nama', 'prodi', 'prodi_display',]
    
    def get_mahasiswa_count(self, obj):
        return obj.mahasiswa.count()

class MahasiswaSerializer(serializers.ModelSerializer):
    detail = DosenSerializer(source='mentor', read_only=True)

    class Meta:
        model = Mahasiswa
        fields = ['id', 'nama', 'nim', 'mentor', 'detail'] 
        extra_kwargs = {
            'mentor': {
                'required': True, 
                'allow_null': False  
            }
        }

class DosenDetailSerializer(serializers.ModelSerializer):
    prodi_display = serializers.CharField(source='get_prodi_display', read_only=True)
    mahasiswa = MahasiswaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Dosen
        fields = ['id', 'nama', 'prodi', 'prodi_display', 'mahasiswa']