from django.contrib import admin
from .models import DRFPost, Mahasiswa, Dosen

@admin.register(DRFPost)
class DRFPostAdmin(admin.ModelAdmin):
    list_display = ['name', 'author', 'rating', 'uploaded']
    list_filter = ['rating']

@admin.register(Dosen)
class DosenAdmin(admin.ModelAdmin):
    list_display = ['nama', 'prodi', 'get_mahasiswa_count']
    list_filter = ['prodi']
    search_fields = ['nama']
    
    def get_mahasiswa_count(self, obj):
        return obj.mahasiswa.count()
    get_mahasiswa_count.short_description = 'Jumlah Mahasiswa'

@admin.register(Mahasiswa)
class MahasiswaAdmin(admin.ModelAdmin):
    list_display = ['nama', 'nim', 'mentor']
    list_filter = ['mentor']
    search_fields = ['nama', 'nim']