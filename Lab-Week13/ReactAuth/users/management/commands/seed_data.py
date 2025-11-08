from django.core.management.base import BaseCommand
from django.db import transaction
from users.models import Jurusan, Matakuliah
from django.utils.translation import gettext_lazy as _

class Command(BaseCommand):
    help = 'Seeds initial data for Jurusan and Matakuliah.'

    def handle(self, *args, **options):
        # Data Jurusan Prasetiya Mulya (S1)
        JURUSAN_DATA = [
            # Technology & Science Tracks
            {'kode': 'DBT', 'nama': _('Digital Business Technology')},
            {'kode': 'AIR', 'nama': _('Artificial Intelligence and Robotics')},
            {'kode': 'BMT', 'nama': _('Business Mathematics')},
            {'kode': 'EBT', 'nama': _('Energy Business Technology')},
            {'kode': 'FBT', 'nama': _('Food Business Technology')},
            {'kode': 'PDI', 'nama': _('Product Design Innovation')},
            
            # Business & Management Tracks
            {'kode': 'BUS', 'nama': _('Bisnis')},
            {'kode': 'ACC', 'nama': _('Akuntansi')},
            {'kode': 'BRD', 'nama': _('Branding')},
            {'kode': 'BEC', 'nama': _('Ekonomi Bisnis')},
            {'kode': 'EVT', 'nama': _('Event')},
            {'kode': 'FNB', 'nama': _('Keuangan dan Perbankan')},
            {'kode': 'FTE', 'nama': _('Teknologi Keuangan (FinTech)')},
            {'kode': 'HOS', 'nama': _('Hospitality Business')},
            {'kode': 'IBL', 'nama': _('Hukum Bisnis Internasional')},
        ]
        
        # Data Mata Kuliah (Sampel untuk Relasi)
        MATAKULIAH_DATA = [
            # Matkul DBT
            {'kode_mk': 'DBT101', 'nama_mk': _('Pengantar Bisnis Digital'), 'sks': 3, 'jurusan_kode': 'DBT'},
            {'kode_mk': 'DBT202', 'nama_mk': _('Database Lanjutan'), 'sks': 3, 'jurusan_kode': 'DBT'},
            # Matkul AIR
            {'kode_mk': 'AIR101', 'nama_mk': _('Dasar Algoritma AI'), 'sks': 3, 'jurusan_kode': 'AIR'},
            # Matkul BUS
            {'kode_mk': 'BUS101', 'nama_mk': _('Manajemen Bisnis Inti'), 'sks': 3, 'jurusan_kode': 'BUS'},
            {'kode_mk': 'BUS202', 'nama_mk': _('Strategi Pemasaran'), 'sks': 3, 'jurusan_kode': 'BUS'},
            # Matkul ACC
            {'kode_mk': 'ACC101', 'nama_mk': _('Akuntansi Dasar I'), 'sks': 4, 'jurusan_kode': 'ACC'},
            # Matkul FTE
            {'kode_mk': 'FTE101', 'nama_mk': _('Dasar Keuangan Digital'), 'sks': 3, 'jurusan_kode': 'FTE'},
        ]

        self.stdout.write("--- Seeding Data Awal (Jurusan & Matakuliah) ---")
        
        try:
            with transaction.atomic():
                
                # 1. SEED JURUSAN
                self.stdout.write("Seeding Jurusan...")
                jurusan_objects = {}
                for data in JURUSAN_DATA:
                    jurusan, created = Jurusan.objects.update_or_create(
                        kode=data['kode'],
                        defaults={'nama': data['nama']}
                    )
                    jurusan_objects[jurusan.kode] = jurusan
                    if created:
                        self.stdout.write(self.style.SUCCESS(f"  + Jurusan '{jurusan.nama}' ({jurusan.kode}) dibuat."))

                # 2. SEED MATAKULIAH
                self.stdout.write("\nSeeding Matakuliah...")
                for data in MATAKULIAH_DATA:
                    jurusan_instance = jurusan_objects.get(data['jurusan_kode'])
                    
                    if not jurusan_instance:
                        self.stdout.write(self.style.WARNING(f"  - Jurusan '{data['jurusan_kode']}' tidak ditemukan. Melewati Matkul {data['kode_mk']}."))
                        continue
                        
                    matkul, created = Matakuliah.objects.update_or_create(
                        kode_mk=data['kode_mk'],
                        defaults={
                            'nama_mk': data['nama_mk'],
                            'sks': data['sks'],
                            'jurusan': jurusan_instance 
                        }
                    )
                    if created:
                        self.stdout.write(self.style.SUCCESS(f"  + Matkul '{matkul.nama_mk}' dibuat untuk {jurusan_instance.kode}."))

                self.stdout.write(self.style.SUCCESS('\n--- Seeding Selesai ---'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"\nSeeding GAGAL: {e}"))
            self.stdout.write(self.style.ERROR("Pastikan database bersih, dan model Matakuliah/Jurusan sudah dimigrasi."))