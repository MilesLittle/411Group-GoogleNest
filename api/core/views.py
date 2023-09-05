from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import TempInfoSerializer
from .models import TempInfo

import requests
# Create your views here.

def front(request):
    context = {
        }

    return render(request, "index.html", context)

@api_view(['GET', 'POST'])
def tempinfo(request):

    if request.method == 'GET':
        temp = TempInfo.objects.all()
        serializer = TempInfoSerializer(temp, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer =TempInfoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def temp_detail(request, pk):
    try:
        temp = TempInfo.objects.get(pk=pk)
    except TempInfo.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        temp.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def google_Nest_Login_URL(request):
    try:
        project_id = 'f4f5bdc3-964c-466b-bf80-9508f2709ad5'
        client_id = '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com'
        redirect_uri = 'https://google.com'
        url = 'https://nestservices.google.com/partnerconnections/'+project_id+'/auth?redirect_uri='+redirect_uri+'&access_type=offline&prompt=consent&client_id='+client_id+'&response_type=code&scope=https://www.googleapis.com/auth/sdm.service'
        return Response(url)
    except:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def google_Nest_Token(request, code):
    client_id = '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com'
    client_secret = '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'
    params = (
    ('client_id', client_id),
    ('client_secret', client_secret),
    ('code', code),
    ('grant_type', 'authorization_code'),
    ('redirect_uri', redirect_uri),)
    response = requests.post('https://www.googleapis.com/oauth2/v4/token', params=params)
    return Response(response.json())