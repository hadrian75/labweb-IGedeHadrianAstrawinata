# users/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Assessment
from .utils import hitung_dan_simpan_nilai_akhir # Fungsi perhitungan nilai yang sudah kita buat

@receiver(post_save, sender=Assessment)
def recalculate_nilai_akhir(sender, instance, **kwargs):
    mahasiswa_id = instance.mahasiswa.id
    matakuliah_kode = instance.komponen.matakuliah.kode_mk
    success, result = hitung_dan_simpan_nilai_akhir(mahasiswa_id, matakuliah_kode)
    
    if success:
        print(f"DEBUG: Nilai akhir untuk {mahasiswa_id} - {matakuliah_kode} berhasil diupdate.")
    else:
        print(f"DEBUG: Gagal update nilai: {result}")