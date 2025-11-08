from django.db.models import Sum, F
from django.contrib.auth import get_user_model
from decimal import Decimal, InvalidOperation
from .models import Matakuliah, NilaiAkhir

CustomUser = get_user_model()

GRADING_SCALE = [
    (80, 'A'),
    (75, 'AB'),
    (70, 'B'),
    (65, 'BC'),
    (60, 'C'),
    (50, 'D'),
    (0, 'E'),
]

def get_nilai_huruf(nilai_angka):
    try:
        nilai_angka = Decimal(nilai_angka)
    except InvalidOperation:
        return 'E' 
    
    for threshold, grade in GRADING_SCALE:
        if nilai_angka >= Decimal(threshold):
            return grade
    return 'E'

def hitung_dan_simpan_nilai_akhir(mahasiswa_id, matakuliah_kode):

    try:
        mahasiswa = CustomUser.objects.get(id=mahasiswa_id, role=CustomUser.Role.MAHASISWA)
        matakuliah = Matakuliah.objects.get(kode_mk=matakuliah_kode)
    except CustomUser.DoesNotExist:
        return False, "Mahasiswa tidak ditemukan atau bukan role Mahasiswa."
    except Matakuliah.DoesNotExist:
        return False, "Mata Kuliah tidak ditemukan."
    assessment_data = mahasiswa.assessment_scores.filter(
        komponen__matakuliah=matakuliah
    ).annotate(
        weighted_score=(F('nilai_angka') * F('komponen__bobot_persen')) / Decimal('100.0')
    )

    nilai_total_query = assessment_data.aggregate(total=Sum('weighted_score'))
    nilai_total = nilai_total_query.get('total')
    
    if nilai_total is None:
        return False, "Tidak ada nilai assessment yang ditemukan untuk mata kuliah ini."

    nilai_huruf = get_nilai_huruf(nilai_total)

    nilai_akhir, created = NilaiAkhir.objects.update_or_create(
        mahasiswa=mahasiswa,
        matakuliah=matakuliah,
        defaults={
            'nilai_total': nilai_total,
            'nilai_huruf': nilai_huruf,
        }
    )
    
    return True, nilai_akhir