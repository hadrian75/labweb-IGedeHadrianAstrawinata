# blog/admin.py
from django.contrib import admin
from .models import Mahasiswa

@admin.register(Mahasiswa)
class MahasiswaAdmin(admin.ModelAdmin):
    list_display = ('nim', 'firstname', 'lastname', 'jurusan')
    search_fields = ('nim', 'firstname', 'lastname', 'jurusan')
    list_filter = ('jurusan',)   
