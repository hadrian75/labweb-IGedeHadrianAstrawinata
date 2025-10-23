from django.db import models

# Create your models here.
Grade = [
  {'excellent', 1},
  {'average', 0},
  {'bad', -1},
]

class DRFPost(models.Model):
  name = models.CharField(max_length=100)
  author = models.CharField(max_length=100)
  uploaded = models.DateTimeField(auto_now_add=True)
  rating = models.CharField(max_length=10, choices=Grade, default='average')
  
  class Meta:
    ordering = ['-uploaded']
  
  def __str__(self):
    return self.name 
  
class Dosen(models.Model):
    class ProdiChoices(models.TextChoices):
        MANAJEMEN = 'manajemen', 'S1 Business / Manajemen'
        MARKETING = 'marketing', 'S1 Branding / Marketing'
        FINANCE = 'finance', 'S1 Finance & Banking'
        FINTECH = 'fintech', 'S1 Financial Technology'
        ACCOUNTING = 'accounting', 'S1 Accounting / Akuntansi'
        EKONOMI_BISNIS = 'ekonomi_bisnis', 'S1 Business Economics / Ekonomi Bisnis'
        HOSPITALITY = 'hospitality', 'S1 Hospitality & Tourism Management'
        EVENT = 'event', 'S1 Event Management / MICE'
        HUKUM_BISNIS = 'hukum_bisnis', 'S1 Business Law / Hukum Bisnis'
        
        TEKNIK_KOMPUTER = 'teknik_komputer', 'S1 Computer Systems Engineering'
        SOFTWARE_ENGINEERING = 'software_engineering', 'S1 Software Engineering'
        TEKNOLOGI_PANGAN = 'teknologi_pangan', 'S1 Food Business Technology'
        ENERGI_TERBARUKAN = 'energi_terbarukan', 'S1 Renewable Energy Engineering'
        DESAIN_PRODUK = 'desain_produk', 'S1 Product Design Engineering'
        MATEMATIKA_BISNIS = 'matematika_bisnis', 'S1 Business Mathematics'
    
    nama = models.CharField(max_length=100)
    prodi = models.CharField(max_length=50, choices=ProdiChoices.choices)
    
    def __str__(self):
        return f"{self.nama} - {self.get_prodi_display()}"

class Mahasiswa(models.Model):
    nama = models.CharField(max_length=100)
    nim = models.CharField(max_length=20, unique=True)
    mentor = models.ForeignKey(Dosen, on_delete=models.CASCADE, null=False, blank=True, default=1, related_name='mahasiswa')
    
    class Meta:
        verbose_name_plural = "Mahasiswa"
    
    def __str__(self):
        return f"{self.nama} ({self.nim})"