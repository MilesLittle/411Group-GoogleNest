from rest_framework import serializers
from .models import TempInfo
#This is test info i put to test the app -Miles :^)
class TempInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TempInfo
        fields = ('id', 'temp', 'humidity')