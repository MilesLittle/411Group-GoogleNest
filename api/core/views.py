from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import TempInfoSerializer, JobSerializer
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

def resetScheduler():
    myscheduler.remove_all_jobs()

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
    
    #myscheduler.add_job(something, trigger=IntervalTrigger(minutes=1), id='this is a test', replace_existing=True)
    
    # Add the scheduled jobs to the Django admin interface
    register_events(myscheduler)
    myscheduler.start()

    
def front(request):
    context = {
        }

    return render(request, "index.html", context)



# For getting temperature info via access token, not for importing to updater. From Ashton's notebook
def saveLog(jobId, access_token):

    job = Job.objects.get(pk=jobId)

    projectid = project_id
    getdevice = 'https://smartdevicemanagement.googleapis.com/v1/enterprises/' + projectid + '/devices/' + job.ThermostatId
    headers = {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + access_token
    } 
    response = requests.get(getdevice, headers=headers)

    # initial temp log
    response_json = response.json()
    actualTemp = int(response_json["traits"]["sdm.devices.traits.Temperature"]["ambientTemperatureCelsius"])

    # this might change based on heat/cool setting? should test out and make sure
    try:
        setPointTemp = int(response_json["traits"]["sdm.devices.traits.ThermostatTemperatureSetpoint"]["heatCelsius"])

    except:
        setPointTemp = int(response_json["traits"]["sdm.devices.traits.ThermostatTemperatureSetpoint"]["coolCelsius"])

    newJobLog = JobLog(JobId = job, ActualTemp = actualTemp, SetPointTemp = setPointTemp, TimeLogged = datetime.now())
    newJobLog.save()
    print(newJobLog)



# ---------------------------------------------------------
# Endpoints
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
    
    #print(request.data)
    jobname = request.data['name']
    description = request.data['description']
    timeNum = int(request.data['number'])
    timeType = request.data['timeType']
    access_token = request.data['access_token']
    deviceId = request.data['deviceId']
    googleId = request.data['googleId']


    #return Response(status=status.HTTP_200_OK)

    def newJob():

        projectid = project_id
        #refreshtoken = request.data.refresh_token #how to handle token refresh?
        #jobid = request.data.name
        getdevice = 'https://smartdevicemanagement.googleapis.com/v1/enterprises/' + projectid + '/devices/' + deviceId
        headers = {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + access_token
        } 
        response = requests.get(getdevice, headers=headers)

        
        if response.status_code == 200:

            # new job
            newJob = Job(name=jobname, GoogleId = googleId, ThermostatId = deviceId, Description = description)
            newJob.save()
            print(newJob.Id)

            saveLog(newJob.Id, access_token)

            return newJob.Id
        
        else:
            print('Something went wrong')
            return None
    


    def saveJob(jobId, access_token):   # access_token is passed to the add_job, necessary for saving logs

        job = Job.objects.get(pk=jobId)

        if job != None:
            if myscheduler.get_job(job.Id):
                return Response(data={'status': 400, "message": "There's already a job with this id"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                Id = str(job.Id)
                print(Id)

                if timeType == 'minutes':
                    myscheduler.add_job(saveLog, trigger=IntervalTrigger(minutes=timeNum), id=Id, args=[job.Id, access_token])
                    #newJobMirror = Job(GoogleId = googleId, ThermostatId = job.ThermostatId, Description=f'Log temperatures every {timeNum} minutes')
                    #newJobMirror.save()
                elif timeType == 'hours':
                    myscheduler.add_job(saveLog, trigger=IntervalTrigger(hours=timeNum), id=Id, args=[job.Id, access_token])
                    #newJobMirror = Job(GoogleId = googleId, ThermostatId = job.ThermostatId, Description=f'Log temperatures every {timeNum} hours')
                    #newJobMirror.save()
                else: #days
                    myscheduler.add_job(saveLog, trigger=IntervalTrigger(days=timeNum), id=Id, args=[job.Id, access_token])
                    #newJobMirror = Job(GoogleId = googleId, ThermostatId = job.ThermostatId, Description=f'Log temperatures every {timeNum} days')
                    #newJobMirror.save()
                
                print("added job")
                return Response(data={'status': 201, 'message': "Log job succesfully created."}, status=status.HTTP_201_CREATED)
        else:
            print("job is fake!!" + job)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    
    jobId = newJob()
    print(Job.objects.get(pk=jobId))

    return saveJob(jobId, access_token)
        

        
        
@api_view(['DELETE'])
def deleteLogJob(request, name): #keep request even if not used, fixes 500 got multiple values for argument 'name' TypeError
#    if myscheduler.get_job(job_id=name):  #code for Django apscheduler job
#        myscheduler.remove_job(job_id=name)
#        jobtodelete = Job.objects.get(Id = name)
#        jobtodelete.delete()
#        return Response(data={'status': 200, 'message': 'Log job successfully deleted.'}, status=status.HTTP_200_OK)
#    else:
#        return Response(data={'status': 404, 'message': 'No job was found, or something went wrong'}, status=status.HTTP_404_NOT_FOUND)
    try:
        jobtodelete = Job.objects.get(Id=name)
        myscheduler.remove_job(jobtodelete.Id)
        jobtodelete.delete()
        return Response(data={'status': 200, 'message': 'Log job successfully deleted.'}, status=status.HTTP_200_OK)
    except Job.DoesNotExist:
        return Response(data={'status': 404, 'message': 'No job was found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def getLogJobs(request):
    googleId = request.GET['googleId']
    thermoId = request.GET['thermostatId']
    try:
        logsandjobs = Job.objects.prefetch_related('JobLogs').filter(GoogleId=googleId, ThermostatId=thermoId)
        serializedlogsandjobs = JobSerializer(logsandjobs, many=True)
        return Response(data={'status': 200, 'message': 'Got the jobs and their logs', 'data': serializedlogsandjobs.data}, status=status.HTTP_200_OK)
    except Job.DoesNotExist:
        return Response(data={'status': 404, 'message': 'No jobs found for this thermostat created by the logged in user'}, status=status.HTTP_404_NOT_FOUND)