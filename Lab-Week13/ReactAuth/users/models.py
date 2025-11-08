
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager 
from decimal import Decimal

class Jurusan(models.Model):
    kode = models.CharField(max_length=10, unique=True, primary_key=True)
    nama = models.CharField(max_length=100)
    
    def __str__(self):
        return self.nama
        
    class Meta:
        verbose_name_plural = "Jurusan"
class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        MAHASISWA = 'MAHASISWA', _('Mahasiswa')
        DOSEN = 'DOSEN', _('Dosen')

    username = None 
    
    email = models.EmailField(_('email address'), unique=True)
    USERNAME_FIELD = 'email'
    
    full_name = models.CharField(max_length=100)
    
    major = models.ForeignKey(
        Jurusan, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name=_('Jurusan')
    )
    
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.MAHASISWA)

    REQUIRED_FIELDS = ['full_name'] 
    
    objects = CustomUserManager()

    def __str__(self):
        return self.email

class Matakuliah(models.Model):
    kode_mk = models.CharField(max_length=10, unique=True, primary_key=True)
    nama_mk = models.CharField(max_length=150)
    sks = models.IntegerField(default=3)
    
    jurusan = models.ForeignKey(Jurusan, on_delete=models.CASCADE, related_name='matakuliah_set')
    
    pengajar = models.ManyToManyField(
        CustomUser, 
        limit_choices_to={'role': CustomUser.Role.DOSEN},
        related_name='matakuliah_diajar',
        blank=True,
        verbose_name=_('Dosen Pengajar')
    )

    def __str__(self):
        return f"{self.kode_mk} - {self.nama_mk}"
    
    class Meta:
        verbose_name_plural = "Mata Kuliah"

class KomponenNilai(models.Model):
    
    NAMA_KOMPONEN_CHOICES = [
        ('UTS', 'Ujian Tengah Semester'),
        ('UAS', 'Ujian Akhir Semester'),
        ('Tugas', 'Tugas/Proyek'),
        ('Kehadiran', 'Kehadiran'),
        ('Lainnya', 'Lainnya')
    ]
    
    matakuliah = models.ForeignKey(Matakuliah, on_delete=models.CASCADE, related_name='komponen_set')
    
    nama_komponen = models.CharField(max_length=50, choices=NAMA_KOMPONEN_CHOICES)
    
    bobot_persen = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        help_text="Bobot dalam persen (misal: 30.00)",
        default=Decimal('0.00')
    )

    class Meta:
        unique_together = ('matakuliah', 'nama_komponen')
        verbose_name_plural = "Komponen Penilaian"
        
    def __str__(self):
        return f"{self.matakuliah.kode_mk} - {self.nama_komponen} ({self.bobot_persen}%)"

class Assessment(models.Model):
    
    mahasiswa = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': CustomUser.Role.MAHASISWA},
        related_name='assessment_scores'
    )
    
    komponen = models.ForeignKey(KomponenNilai, on_delete=models.CASCADE)
    
    nilai_angka = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        help_text="Nilai mentah (0-100)"
    )

    class Meta:
        unique_together = ('mahasiswa', 'komponen')
        verbose_name_plural = "Assessment Scores"
        
    def __str__(self):
        return f"{self.mahasiswa.email} - {self.komponen.nama_komponen}: {self.nilai_angka}"
    
class NilaiAkhir(models.Model):
    
    NILAI_HURUF_CHOICES = [
        ('A', 'A'), ('AB', 'AB'), ('B', 'B'), ('BC', 'BC'), 
        ('C', 'C'), ('D', 'D'), ('E', 'E')
    ]
    
    mahasiswa = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': CustomUser.Role.MAHASISWA},
        related_name='transkrip'
    )
    
    matakuliah = models.ForeignKey(Matakuliah, on_delete=models.CASCADE)
    
    nilai_total = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        help_text="Nilai akhir terbobot (0-100)",
        null=True, blank=True
    )
    
    nilai_huruf = models.CharField(
        max_length=2, 
        choices=NILAI_HURUF_CHOICES,
        null=True, blank=True
    )
    
    class Meta:
        unique_together = ('mahasiswa', 'matakuliah')
        verbose_name_plural = "Nilai Akhir (Transkrip)"
        
    def __str__(self):
        return f"{self.mahasiswa.full_name} - {self.matakuliah.kode_mk}: {self.nilai_huruf or 'Belum Dihitung'}"

                