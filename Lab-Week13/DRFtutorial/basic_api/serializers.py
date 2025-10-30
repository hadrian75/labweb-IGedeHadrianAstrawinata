from rest_framework import serializers
from basic_api.models import DRFPost

class DRFPostSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = DRFPost
        fields = ['id', 'name', 'author', 'rating', 'uploaded', 'image']
        read_only_fields = ['id', 'uploaded']
    
    def validate_image(self, value):
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Image size should not exceed 5MB")
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("Only JPEG, PNG, and WebP images are allowed")
        
        return value