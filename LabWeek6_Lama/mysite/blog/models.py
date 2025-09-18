from django.db import models

# Create your models here.
class Mahasiswa(models.Model):
  nim = models.PositiveIntegerField(max_length=20, null=False, blank=False, unique=True, db_index=True)
  firstname = models.CharField(max_length=100)
  lastname = models.CharField(max_length=100)
  jurusan = models.CharField(max_length=100)
def __str__(self):
    return self.nim
