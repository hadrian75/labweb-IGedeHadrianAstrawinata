
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import re
from django.utils.translation import gettext_lazy as _

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

      role = validated_data.pop('role', User.Role.MAHASISWA)

      email = validated_data['email'].lower()
      
      user = User.objects.create_user( 
        email = email,
        password = validated_data['password'], 
        full_name = validated_data["full_name"],
        major = validated_data.get('major', User.Jurusan.NONE), 
        role = role 
      )
      return user
    
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # ... (Sisa kode untuk token)
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['username'] = user.username 
        token['full_name'] = user.full_name
        token['major'] = user.major
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        token_data = {'access': data['access'], 'refresh': data['refresh']}
        data.update({
            'email': self.user.email,
            'username': self.user.username,
            'full_name': self.user.full_name,
            'major': self.user.major,
            'role': self.user.role,
            'token': token_data,
        })
        return data