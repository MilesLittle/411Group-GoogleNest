import json
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import TempInfoSerializer
from .scheduler.updater import startLogging
from .models import User, Tokens, TempInfo
from django.core.exceptions import ObjectDoesNotExist

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



# TEMPORARY: makes user, token records in db. This endpoint should be used after the user gives permission
# for the app to use Google info or something, since it's storing potentially sensitive information.
# When revoking access, these records should be deleted
@api_view(['POST'])
def setup_user(request):

    try:
        # create user
        print("request.data['accInfo']: ", request.data['accInfo'])
        accData = request.data['accInfo']
        gId = accData['id']
        print(gId)

        if User.objects.filter(_google_id=gId).exists():
            print("Google user exists")

            usId = User.objects.get(_google_id=gId).getId()

            print("google id: ", usId)
        else:
            print("google_id not exist in database. Attempting to save...")
            User( _google_id = gId ).save()

        

        # tokens
        access_token = request.data['tokens']['access_token']
        refresh_token = request.data['tokens']['refresh_token']

        # make sure to add tokens to existing user
        user = User.objects.get(_google_id=gId)

        try:
            # don't have duplicate token records for the same user
            if Tokens.objects.filter(user_owner=user).exists():
                print("edit token object")
                tokenObj = Tokens.objects.get(user_owner=user)
                tokenObj._access = access_token
                tokenObj._refresh = refresh_token
                tokenObj.save()

            else:
                print("create token object")
                Tokens(user_owner=user, _access=access_token, _refresh=refresh_token).save()

        except User.DoesNotExist:
            print("user doesn't exist")
            

        if (access_token != None):
            startLogging(access_token, refresh_token)

        return Response(status=status.HTTP_201_CREATED)

    except:
        print("Something went wrong in setup_user")
        return Response(status=status.HTTP_400_BAD_REQUEST)