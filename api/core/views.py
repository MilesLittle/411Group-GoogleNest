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
    #register_events(myscheduler)
    myscheduler.start()

    
def front(request):
    context = {
        }

    return render(request, "index.html", context)



# For getting temperature info via access token, not for importing to updater. From Ashton's notebook
def saveLog(jobId, refresh_token):

    job = Job.objects.get(pk=jobId)

    # get access token with refresh token
    client_id = '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com'
    client_secret = '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'

    params = (
        ('client_id', client_id),
        ('client_secret', client_secret),
        ('refresh_token', refresh_token),
        ('grant_type', 'refresh_token'),
    )

    response = requests.post('https://www.googleapis.com/oauth2/v4/token', params=params)

    response_json = response.json()
    access_token = response_json['access_token']
    
    # use access token
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


"""
def refresh(refresh_token):
    print("refresh!")
    client_id = '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com'
    client_secret = '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'

    params = (
        ('client_id', client_id),
        ('client_secret', client_secret),
        ('refresh_token', refresh_token),
        ('grant_type', 'refresh_token'),
    )

    response = requests.post('https://www.googleapis.com/oauth2/v4/token', params=params)

    response_json = response.json()
    print("access token: " + response_json['token_type'] + ' ' + response_json['access_token'])
    print(response.json())
"""



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
    timeNum = int(request.data['number'])
    timeType = request.data['timeType']
    refresh_token = request.data['refresh_token']
    deviceId = request.data['deviceId']
    googleId = request.data['googleId']

    timeTypeDesc = timeType if (timeNum > 1) else timeType.replace('s', "")    # just for neatness, prevents "1 days" or etc. for description
    description = str(timeNum) + " " + timeTypeDesc

    print("access token in createLogJob: " + refresh_token)


    #return Response(status=status.HTTP_200_OK)

    def newJob():

       # get access token with refresh token
        client_id = '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com'
        client_secret = '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'

        params = (
            ('client_id', client_id),
            ('client_secret', client_secret),
            ('refresh_token', refresh_token),
            ('grant_type', 'refresh_token'),
        )

        response = requests.post('https://www.googleapis.com/oauth2/v4/token', params=params)

        response_json = response.json()
        access_token = response_json['access_token']
        
        # use access token
        projectid = project_id
        getdevice = 'https://smartdevicemanagement.googleapis.com/v1/enterprises/' + projectid + '/devices/' + deviceId
        headers = {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + access_token
        } 
        response = requests.get(getdevice, headers=headers)

        
        # make Job record (our model)
        if response.status_code == 200:

            # new job
            newJob = Job(name=jobname, GoogleId = googleId, ThermostatId = deviceId, Description = description)
            newJob.save()

            saveLog(newJob.Id, refresh_token)

            return newJob.Id
        
        else:
            print('Something went wrong')
            return None
    


    def saveJob(jobId, refresh_token):   # refresh_token is passed to the add_job, necessary for saving logs

        job = Job.objects.get(pk=jobId)

        if job != None:
            if myscheduler.get_job(job.Id):
                return Response(data={'status': 400, "message": "There's already a job with this id"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                Id = str(job.Id)
                print(Id)

                if timeType == 'minutes':
                    myscheduler.add_job(saveLog, trigger=IntervalTrigger(minutes=timeNum), id=Id, args=[job.Id, refresh_token])
                    #newJobMirror = Job(GoogleId = googleId, ThermostatId = job.ThermostatId, Description=f'Log temperatures every {timeNum} minutes')
                    #newJobMirror.save()
                elif timeType == 'hours':
                    myscheduler.add_job(saveLog, trigger=IntervalTrigger(hours=timeNum), id=Id, args=[job.Id, refresh_token])
                    #newJobMirror = Job(GoogleId = googleId, ThermostatId = job.ThermostatId, Description=f'Log temperatures every {timeNum} hours')
                    #newJobMirror.save()
                else: #days
                    myscheduler.add_job(saveLog, trigger=IntervalTrigger(days=timeNum), id=Id, args=[job.Id, refresh_token])
                    #newJobMirror = Job(GoogleId = googleId, ThermostatId = job.ThermostatId, Description=f'Log temperatures every {timeNum} days')
                    #newJobMirror.save()
                
                print("added job")
                return Response(data={'status': 201, 'message': "Log job succesfully created."}, status=status.HTTP_201_CREATED)
        else:
            print("job is fake!!" + job)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    
    jobId = newJob()
    print(Job.objects.get(pk=jobId))

    return saveJob(jobId, refresh_token)
        

        
        
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

        try:
            myscheduler.remove_job(jobtodelete.Id)
        except:
            print("scheduler job of id " + str(jobtodelete.Id) + " not found")

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
    

# won't need this. Just use refresh tokens within job logger to get access tokens
"""
# refresh tokens job
@api_view(['POST'])
def refreshJobs(request):
    refresh_token = request.data['refresh_token']
    googleId = request.data['googleId']
    print("token: " + refresh_token)

    try:
        Job.objects.get(name="refresh", GoogleId=googleId)
        
    except Job.DoesNotExist:
        # should probably not have googleId visible in db, this should be encrypted somehow?
        # maybe refresh jobs should be a separate model, on their own table
        refreshjob = Job(name="refresh", GoogleId=googleId, ThermostatId='', Description='')
        refreshjob.save()
        jobid = refreshjob.Id

    if (myscheduler.get_job(googleId) == None):
        myscheduler.add_job(refresh, trigger=IntervalTrigger(minutes=55), id=googleId, args=[refresh_token])

    else:
        job = myscheduler.get_job(googleId)
        print(job.args)

        # can't change args of jobs within the job store, going with a copy-replace method. next_run_time being the same means it won't reset the timer every time tokens are changed
        # maybe id of refresh job should be 'googleId'+id in the scenario there's enough users to cause an overlap in Id ints between log jobs and refresh jobs. My head hurts
        myscheduler.add_job(refresh, trigger=job.trigger, id=job.id, next_run_time=job.next_run_time, args=[refresh_token], replace_existing=True)
        newjob = myscheduler.get_job(googleId)
        print("new job args: " + str(newjob.args))

    return Response(status=status.HTTP_201_CREATED)

    return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
"""