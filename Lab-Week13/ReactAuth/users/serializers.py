
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import re
from django.utils.translation import gettext_lazy as _
from .models import *
User = get_user_model()

STUDENT_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@student\.prasetiyamulya\.ac\.id$', re.IGNORECASE)
INSTRUCTOR_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@prasetiyamulya\.ac\.id$', re.IGNORECASE)


class CustomUserSerializer(serializers.ModelSerializer):
    
    password_confirmation = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        label=_('Konfirmasi Password')
    )
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'major', 'role', 'password', 'password_confirmation']
        
        read_only_fields = ['id'] 
        
        extra_kwargs = {
          'password': {'write_only': True, 'style': {'input_type': 'password'}},
          'full_name': {'required': True},
          'major': {'required': False},
        }
        
    def validate_role(self, value):
        allowed_roles = [User.Role.MAHASISWA, User.Role.DOSEN]
        if value not in allowed_roles:
            raise serializers.ValidationError(
                f"Pilihan role '{value}' tidak valid. Hanya boleh {User.Role.MAHASISWA} atau {User.Role.DOSEN}."
            )
        return value


    def validate_email(self, value):
      email = value.lower()
      
      if STUDENT_PATTERN.match(email) or INSTRUCTOR_PATTERN.match(email):
          if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email sudah terdaftar.")
          return email
        
      raise serializers.ValidationError("Email harus berakhiran @student.prasetiyamulya.ac.id atau @prasetiyamulya.ac.id")
    
    def validate(self, attrs):
       if attrs['password'] != attrs['password_confirmation']:
         raise serializers.ValidationError({"password_confirmation": "Password tidak sama"}) 
       return attrs
       
    def create(self, validated_data):
      validated_data.pop('password_confirmation') 
      major_instance = validated_data.pop('major', None)
      role = validated_data.pop('role', User.Role.MAHASISWA)

      email = validated_data['email'].lower()
      
      user = User.objects.create_user( 
        email = email,
        password = validated_data['password'], 
        full_name = validated_data["full_name"],
        major = major_instance, 
        role = role 
      )
      return user
    
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['username'] = user.username 
        token['full_name'] = user.full_name
        token['major'] = user.major.kode if user.major else None
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        token_data = {'access': data['access'], 'refresh': data['refresh']}
        data.update({
            'email': self.user.email,
            'username': self.user.username,
            'full_name': self.user.full_name,
            'major': self.user.major.kode if self.user.major else None,
            'role': self.user.role,
            'token': token_data,
        })
        return data
      
class JurusanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jurusan
        fields = ['kode', 'nama']
        
class MatakuliahReadSerializer(serializers.ModelSerializer):
    jurusan = JurusanSerializer(read_only=True)
    pengajar = serializers.SerializerMethodField()
    total_mahasiswa = serializers.SerializerMethodField()

    class Meta:
        model = Matakuliah
        fields = ['kode_mk', 'nama_mk', 'sks', 'jurusan', 'pengajar', 'total_mahasiswa']
        
    def get_pengajar(self, obj):
        return [{'full_name': user.full_name, 'email': user.email} 
                for user in obj.pengajar.all()]

    def get_total_mahasiswa(self, obj):
        count = obj.nilaiakhir_set.values('mahasiswa').distinct().count()
        return count
      
class MatakuliahWriteSerializer(serializers.ModelSerializer):
    jurusan = serializers.SlugRelatedField(
        queryset=Jurusan.objects.all(),
        slug_field='kode',
        write_only=True
    )
    pengajar = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.DOSEN),
        many=True,
        required=False
    )
    
    class Meta:
        model = Matakuliah
        fields = ['kode_mk', 'nama_mk', 'sks', 'jurusan', 'pengajar']

class KomponenNilaiSerializer(serializers.ModelSerializer):
    matakuliah = serializers.SlugRelatedField(
        queryset=Matakuliah.objects.all(),
        slug_field='kode_mk',
        write_only=True
    )
    
    matakuliah_info = serializers.CharField(source='matakuliah.nama_mk', read_only=True)
    
    class Meta:
        model = KomponenNilai
        fields = ['id', 'matakuliah', 'matakuliah_info', 'nama_komponen', 'bobot_persen']

class AssessmentSerializer(serializers.ModelSerializer):
    mahasiswa_nama = serializers.CharField(source='mahasiswa.full_name', read_only=True)
    komponen_nama = serializers.CharField(source='komponen.nama_komponen', read_only=True)

    class Meta:
        model = Assessment
        fields = ['id', 'mahasiswa', 'mahasiswa_nama', 'komponen', 'komponen_nama', 'nilai_angka']
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=Assessment.objects.all(),
                fields=['mahasiswa', 'komponen'],
                message="Nilai untuk komponen ini pada mahasiswa tersebut sudah ada."
            )
        ]

class NilaiAkhirSerializer(serializers.ModelSerializer):
    matakuliah_nama = serializers.CharField(source='matakuliah.nama_mk', read_only=True)
    class Meta:
        model = NilaiAkhir
        fields = ['id', 'mahasiswa', 'matakuliah', 'matakuliah_nama', 'nilai_total', 'nilai_huruf']
        read_only_fields = ['mahasiswa', 'matakuliah', 'nilai_total', 'nilai_huruf'] 
        
class MahasiswaSerializer(serializers.ModelSerializer):
    major_nama = serializers.CharField(source='major.nama', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'major', 'major_nama']