from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import TempInfoSerializer
from .models import TempInfo, Job, JobLog
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import requests
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.executors.pool import ProcessPoolExecutor, ThreadPoolExecutor
from django_apscheduler.jobstores import register_events, register_job
from django.conf import settings

# Create your views here.

project_id = 'f4f5bdc3-964c-466b-bf80-9508f2709ad5'

myscheduler = BackgroundScheduler(settings.SCHEDULER_CONFIG)
def something():
    print('Something being logged.')

def startScheduler():
    if settings.DEBUG:
      	# Hook into the apscheduler logger
        logging.basicConfig()
        logging.getLogger('apscheduler').setLevel(logging.DEBUG)

    # Adding this job here instead of to crons.
    # This will do the following:
    # - Add a scheduled job to the job store on application initialization
    # - The job will execute a model class method at midnight each day
    # - replace_existing in combination with the unique ID prevents duplicate copies of the job
    myscheduler.add_job(something, trigger=IntervalTrigger(minutes=5), id='this is a test', replace_existing=True)
    # Add the scheduled jobs to the Django admin interface
    register_events(myscheduler)
    myscheduler.start()

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

#the fuck shit
@api_view(['POST'])
def createLogJob(request):
    def newJob():
        projectid = project_id
        deviceid = request.data.deviceId
        accesstoken = request.data.access_token
        refreshtoken = request.data.refresh_token #how to handle token refresh?
        jobid = request.data.name
        getdevice = 'https://smartdevicemanagement.googleapis.com/v1/enterprises/' + projectid + '/devices/' + deviceid
        headers = {
            'Content-Type': 'application/json',
            'Authorization': accesstoken
        } 
        response = requests.get(getdevice, headers=headers)
        if response.status_code == 200:
            response_json = response.json()
            actualTemp = response_json["traits"]["sdm.devices.traits.Temperature"]["ambientTemperatureCelsius"]
            setPointTemp = response_json["traits"]["sdm.devices.traits.ThermostatTemperatureSetpoint"]["coolCelsius"]
            newJobLog = JobLog(JobId = jobid, ActualTemp = actualTemp, SetPointTemp = setPointTemp, TimeLogged = datetime.now())
            newJobLog.save()
        else:
            print('Something went wrong')
    if myscheduler.get_job(job_id=request.data.name):
        return Response(data={'status': 400, "message": "There's already a job with this name"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        if request.data.timetype == 'minutes':
            myscheduler.add_job(newJob, trigger=IntervalTrigger(minutes=request.data.increment), id=request.data.name)
            newJobMirror = Job(GoogleId = request.data.googleId, ThermostatId = request.data.thermostatId, Description=f'Log temperatures every {request.data.increment} minutes')
            newJobMirror.save()
        elif request.data.timetype == 'hours':
            myscheduler.add_job(newJob, trigger=IntervalTrigger(hours=request.data.increment), id=request.data.name)
            newJobMirror = Job(GoogleId = request.data.googleId, ThermostatId = request.data.thermostatId, Description=f'Log temperatures every {request.data.increment} hours')
            newJobMirror.save()
        else: #days
            myscheduler.add_job(newJob, trigger=IntervalTrigger(days=request.data.increment), id=request.data.name)
            newJobMirror = Job(GoogleId = request.data.googleId, ThermostatId = request.data.thermostatId, Description=f'Log temperatures every {request.data.increment} days')
            newJobMirror.save()
        return Response(data={'status': 201, 'message': "Log job succesfully created."}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def deleteLogJob(name):
    if myscheduler.get_job(job_id=name):
        myscheduler.remove_job(job_id=name)
        jobtodelete = Job.objects.get(Id = name)
        jobtodelete.delete()
        return Response(data={'status': 200, 'message': 'Log job successfully deleted.'}, status=status.HTTP_200_OK)
    else:
        return Response(data={'status': 404, 'message': 'No job was found, or something went wrong'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def getLogJobs(googleId, thermoId):
    ljs = Job.objects.get(GoogleId=googleId, ThermostatId=thermoId) #need serializer
    if ljs is None:
        return Response(data={'status': 404, 'message': 'No jobs found for this thermostat created by the logged in user'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response(data={'status': 200, 'message': 'Got the jobs and their logs', 'data': ljs}, status=status.HTTP_200_OK)
