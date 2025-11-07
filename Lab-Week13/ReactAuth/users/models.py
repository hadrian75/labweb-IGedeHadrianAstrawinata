
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
# WAJIB: Import CustomUserManager (Pastikan Anda membuatnya di users/managers.py)
from .managers import CustomUserManager 

class CustomUser(AbstractUser):
    
    class Role(models.TextChoices):
        MAHASISWA = 'MAHASISWA', _('Mahasiswa')
        DOSEN = 'DOSEN', _('Dosen')

    class Jurusan(models.TextChoices): 
        AI_ROBOTICS = 'AIR', _('Artificial Intelligence and Robotics')
        DIGITAL_BUSINESS_TECH = 'DBT', _('Digital Business Technology (Rekayasa Perangkat Lunak)')
        ENERGY_BUSINESS_TECH = 'EBT', _('Energy Business Technology (Renewable Energy Engineering)')
        FOOD_BUSINESS_TECH = 'FBT', _('Food Business Technology')
        PRODUCT_DESIGN_INNOVATION = 'PDI', _('Product Design Innovation')
        BUSINESS_MATHEMATICS = 'BMT', _('Business Mathematics')
        
        ACCOUNTING = 'ACC', _('Akuntansi')
        BRANDING = 'BRD', _('Branding')
        BUSINESS = 'BUS', _('Bisnis')
        BUSINESS_ECONOMICS = 'BEC', _('Ekonomi Bisnis')
        EVENT = 'EVT', _('Event')
        FINANCE_BANKING = 'FNB', _('Keuangan dan Perbankan')
        FINANCIAL_TECHNOLOGY = 'FTE', _('Teknologi Keuangan')
        HOSPITALITY_BUSINESS = 'HOS', _('Hospitality Business')
        INTERNATIONAL_BUSINESS_LAW = 'IBL', _('Hukum Bisnis Internasional')
        NONE = 'NON', _('N/A (Bukan Mahasiswa)') 
    
    username = None 
    
    email = models.EmailField(_('email address'), unique=True)
    USERNAME_FIELD = 'email'
    
    full_name = models.CharField(max_length=100)
    
    major = models.CharField(
        max_length=100, 
        choices=Jurusan.choices, 
        blank=True, 
        null=True,
        default=Jurusan.NONE 
    )
    
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.MAHASISWA)

    REQUIRED_FIELDS = ['full_name'] 
    
    objects = CustomUserManager()

    def __str__(self):
        return self.email