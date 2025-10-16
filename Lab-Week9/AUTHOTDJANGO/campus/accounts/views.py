# accounts/views.py
from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import F
from .models import Profile  
def login_view(request):
    if request.user.is_authenticated:
        return redirect('accounts:dashboard')

    form = AuthenticationForm(request, data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = authenticate(
            request,
            username=form.cleaned_data.get('username'),
            password=form.cleaned_data.get('password')
        )
        if user:
            login(request, user)
            messages.success(request, "Login successful.")
            return redirect('accounts:dashboard')
        messages.error(request, "Kamu siapa? Salah Pass atau Username.")
    return render(request, 'accounts/login.html', {'form': form})

@login_required
def dashboard(request):
    role = getattr(getattr(request.user, 'profile', None), 'role', 'MAHASISWA')
    nilai = getattr(getattr(request.user, 'profile', None), 'nilai', None) 

    students = []
    if role == "DOSEN":
        students = (
            Profile.objects
            .filter(role="MAHASISWA")
            .select_related("user")
            .order_by(F("nilai").desc(nulls_last=True), "user__last_name", "user__first_name")
        )

    context = {
        'role': role,
        'nilai': nilai,
        'students': students,  
    }
    return render(request, 'accounts/dashboard.html', context)

@login_required
def logout_view(request):
    next_url = request.POST.get("next") or request.GET.get("next") or reverse('accounts:login')
    if request.method == "POST":
        logout(request)
        messages.info(request, "Kamu sudah logout.")
        return redirect(next_url)
    return render(request, "accounts/logout_confirm.html", {"next": next_url})
