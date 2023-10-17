from rest_framework import serializers
from .models import TempInfo, Job, JobLog
#This is test info i put to test the app -Miles :^)
class TempInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TempInfo
        fields = ('id', 'temp', 'humidity')

class JobLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobLog
        fields = ('Id', 'JobId', 'ActualTemp', 'SetPointTemp', 'TimeLogged')

class JobSerializer(serializers.ModelSerializer):
    JobLogs = JobLogSerializer(many=True)
    class Meta:
        model = Job
        fields = ('Id', 'GoogleId', 'ThermostatId', 'Description', 'JobLogs')