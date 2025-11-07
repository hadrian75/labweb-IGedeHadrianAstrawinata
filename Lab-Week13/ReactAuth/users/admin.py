from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    list_display = (
        'email', 
        'username',
        'full_name', 
        'role',          
        'major',         
    )
    
    list_filter = (
        'role',         
        'major',        
    )
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}), 
        
        ('Personal Info', {'fields': (
            'full_name', 
            'role', 
            'major'
        )}), 
        
        ('Status', {'fields': ('is_active', 'last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'full_name', 'role', 'major'),
        }),
    )
    
    search_fields = ('email', 'full_name')
    ordering = ('email',)
    
admin.site.register(CustomUser, CustomUserAdmin)