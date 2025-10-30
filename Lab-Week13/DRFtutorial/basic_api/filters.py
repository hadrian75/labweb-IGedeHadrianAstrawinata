import django_filters
from .models import DRFPost as Book

class BookFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    
    author = django_filters.CharFilter(lookup_expr='icontains')
    
    rating = django_filters.CharFilter(lookup_expr='iexact')

    uploaded_after = django_filters.DateFilter(field_name='uploaded', lookup_expr='gte')
    uploaded_before = django_filters.DateFilter(field_name='uploaded', lookup_expr='lte')
    
    class Meta:
        model = Book
        fields = ['name', 'author', 'rating']