from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .models import Mahasiswa
from django.template import loader
from .forms import MahasiswaForm
# def mahasiswa(request):
#     mymahasiswa = Mahasiswa.objects.all().order_by('nim')
#     template = loader.get_template('mahasiswa.html')
    
#     context = {
#         'mymahasiswa': mymahasiswa,
#     }
#     return HttpResponse(template.render(context, request))
def mahasiswa(request):
    if request.method == "POST":
        action = request.POST.get("action")  # bukan nim, pakai hidden field 'action'
        
        if action == "add":
            Mahasiswa.objects.create(
                nim=request.POST.get("nim"),
                firstname=request.POST.get("firstname"),
                lastname=request.POST.get("lastname"),
                jurusan=request.POST.get("jurusan"),
            )
            return redirect("mahasiswa")

        elif action == "update":
            mhs = Mahasiswa.objects.get(id=request.POST.get("id"))
            mhs.nim = request.POST.get("nim")
            mhs.firstname = request.POST.get("firstname")
            mhs.lastname = request.POST.get("lastname")
            mhs.jurusan = request.POST.get("jurusan")
            mhs.save()
            return redirect("mahasiswa")

        elif action == "delete":
            Mahasiswa.objects.filter(id=request.POST.get("id")).delete()
            return redirect("mahasiswa")

    # bagian GET
    mymahasiswa = Mahasiswa.objects.all()
    return render(request, "mahasiswa.html", {"mymahasiswa": mymahasiswa})


def home(request):
    return render(request, "home.html")



# def mahasiswa_create(request):
#     if request.method == "POST":
#         form = MahasiswaForm(request.POST)
#         if form.is_valid():
#             form.save()
#             return redirect("mahasiswa")  # kembali ke list
#     else:
#         form = MahasiswaForm()
#     return render(request, "mahasiswa_form.html", {"form": form, "mode": "create"})

# def mahasiswa_update(request, pk):
#     mhs = get_object_or_404(Mahasiswa, pk=pk)
#     if request.method == "POST":
#         form = MahasiswaForm(request.POST, instance=mhs)
#         if form.is_valid():
#             form.save()
#             return redirect("mahasiswa_detail", pk=mhs.pk)
#     else:
#         form = MahasiswaForm(instance=mhs)
#     return render(request, "mahasiswaForms.html", {"form": form, "mode": "update", "mhs": mhs})

# # DELETE (konfirmasi + hapus)
# def mahasiswa_delete(request, pk):
#     mhs = get_object_or_404(Mahasiswa, pk=pk)
#     if request.method == "POST":
#         mhs.delete()
#         return redirect("mahasiswa")
#     return render(request, "mahasiswaConfirmDelete.html", {"mhs": mhs})