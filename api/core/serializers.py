from rest_framework import serializers
from .models import TempInfo, Job, JobLog
#This is test info i put to test the app -Miles :^)
class TempInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TempInfo
        fields = ('id', 'temp', 'humidity')

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ('Id', 'GoogleId', 'ThermostatId', 'Description')

class JobLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobLog
        fields = ('Id', 'JobId', 'ActualTemp', 'SetPointTemp', 'TimeLogged')