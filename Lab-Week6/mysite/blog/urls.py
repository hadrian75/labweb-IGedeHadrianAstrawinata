from django.urls import path
from . import views
urlpatterns = [
    path("", views.home, name="home"),
    path("mahasiswa/", views.mahasiswa, name="mahasiswa"),                
    # path("mahasiswa/new/", views.mahasiswa_create, name="mahasiswa_create"),
    # path("mahasiswa/<int:pk>/", views.mahasiswa_detail, name="mahasiswa_detail"),
    # path("mahasiswa/<int:pk>/edit/", views.mahasiswa_update, name="mahasiswa_update"),
    # path("mahasiswa/<int:pk>/delete/", views.mahasiswa_delete, name="mahasiswa_delete"),
]