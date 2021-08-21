from django.http import request
from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, "crypto_api/index.html")