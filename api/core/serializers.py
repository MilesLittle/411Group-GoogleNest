from rest_framework import serializers
from .models import TempInfo, Job, JobLog, JobType
#This is test info i put to test the app -Miles :^)
class TempInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TempInfo
        fields = ('id', 'temp', 'humidity')

class JobLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobLog
        fields = ('Id', 'JobId', 'ActualTemp', 'SetPointTemp', 'HeatTemp', 'CoolTemp', 'Mode', 'TimeLogged')

class JobTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobType
        fields = ('Id', 'Type')

class JobSerializer(serializers.ModelSerializer):
    JobLogs = JobLogSerializer(many=True)
    JobTypeId = JobTypeSerializer()
    class Meta:
        model = Job
        fields = ('Id', 'Name', 'GoogleId', 'ThermostatId', 'Description', 'SettingTemp', 'JobTypeId', 'DateCreated', 'JobLogs')