from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import TempInfoSerializer, JobSerializer
from .models import TempInfo, Job, JobLog, JobType
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
client_id = '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com'
client_secret = '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'

myscheduler = BackgroundScheduler(settings.SCHEDULER_CONFIG)
def resetScheduler():
    myscheduler.remove_all_jobs()

def startScheduler():
    if settings.DEBUG:
        logging.basicConfig()
        logging.getLogger('apscheduler').setLevel(logging.DEBUG)
    register_events(myscheduler)
    myscheduler.start()
    
def front(request):
    context = {
        }
    return render(request, "index.html", context)

def FtoC(temp):
    return (temp - 32) * (5/9)


# For getting temperature info via access token, not for importing to updater. From Ashton's notebook
def saveLog(jobId, refresh_token):
    job = Job.objects.get(pk=jobId)
    # get access token with refresh token
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
    actualTemp = response_json["traits"]["sdm.devices.traits.Temperature"]["ambientTemperatureCelsius"]
    if response_json["traits"]["sdm.devices.traits.ThermostatMode"]["mode"] == 'HEAT': #if thermo is in heat mode
        setPointTemp = response_json["traits"]["sdm.devices.traits.ThermostatTemperatureSetpoint"]["heatCelsius"]
        mode = response_json["traits"]["sdm.devices.traits.ThermostatMode"]["mode"] #redundant, just insert the mode already in if case?
        newJobLog = JobLog(JobId=job, ActualTemp=actualTemp, SetPointTemp=setPointTemp, HeatTemp=None, CoolTemp=None, Mode=mode, TimeLogged=datetime.now())
        newJobLog.save()
    elif response_json["traits"]["sdm.devices.traits.ThermostatMode"]["mode"] == 'COOL': #if thermo is in cool mode
        setPointTemp = response_json["traits"]["sdm.devices.traits.ThermostatTemperatureSetpoint"]["coolCelsius"]
        mode = response_json["traits"]["sdm.devices.traits.ThermostatMode"]["mode"]
        newJobLog = JobLog(JobId=job, ActualTemp=actualTemp, SetPointTemp=setPointTemp, HeatTemp=None, CoolTemp=None, Mode=mode, TimeLogged=datetime.now())
        newJobLog.save()
    elif response_json["traits"]["sdm.devices.traits.ThermostatMode"]["mode"] == 'HEATCOOL': #if the thermo is in heatcool mode
        heat = response_json["sdm.devices.traits.ThermostatTemperatureSetpoint"]["heatCelsius"]
        cool = response_json["sdm.devices.traits.ThermostatTemperatureSetpoint"]["coolCelsius"]
        mode = response_json["traits"]["sdm.devices.traits.ThermostatMode"]["mode"]
        newJobLog = JobLog(JobId=job, ActualTemp=actualTemp, SetPointTemp=None, HeatTemp=heat, CoolTemp=cool, Mode=mode, TimeLogged=datetime.now())
        newJobLog.save()
    elif response_json["traits"]["sdm.devices.traits.ThermostatEco"]["mode"] == 'MANUAL_ECO': #if the thermo is in eco mode
        heat = response_json["traits"]["sdm.devices.traits.ThermostatEco"]["heatCelsius"]
        cool = response_json["traits"]["sdm.devices.traits.ThermostatEco"]["coolCelsius"]
        mode = response_json["traits"]["sdm.devices.traits.ThermostatEco"]["mode"]
        newJobLog = JobLog(JobId=job, ActualTemp=actualTemp, SetPointTemp=None, HeatTemp=heat, CoolTemp=cool, Mode=mode, TimeLogged=datetime.now())
        newJobLog.save()
    else: #off
        newJobLog = JobLog(JobId=job, ActualTemp=None, SetPointTemp=None, HeatTemp=None, CoolTemp=None, Mode='OFF', TimeLogged=datetime.now()) 
        newJobLog.save()


def setJob(jobId, refresh_token):

    try:
        job = Job.objects.get(pk=jobId)
        deviceId = job.ThermostatId
    except:
        return Response(data={'status': 404, "message": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
    
    setTemp = job.SettingTemp

    # convert temp
    setTemp = int(setTemp)
    setTemp = FtoC(setTemp)

    # get access token with refresh token
    params = (
        ('client_id', client_id),
        ('client_secret', client_secret),
        ('refresh_token', refresh_token),
        ('grant_type', 'refresh_token'),
    )
    response = requests.post('https://www.googleapis.com/oauth2/v4/token', params=params)
    response_json = response.json()
    access_token = response_json['access_token']

    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
    }
    devResponse = requests.get(f'https://smartdevicemanagement.googleapis.com/v1/enterprises/{project_id}/devices/{deviceId}', headers=headers)
    devResponse_json = devResponse.json()
    mode = devResponse_json["traits"]["sdm.devices.traits.ThermostatMode"]["mode"]
    print(mode)

    url = f'https://smartdevicemanagement.googleapis.com/v1/enterprises/{project_id}/devices/{deviceId}:executeCommand'
    
    # assign based on mode
    if (mode == "COOL"):
        cmd = '{"command" : "sdm.devices.commands.ThermostatTemperatureSetpoint.SetCool", "params" : {"coolCelsius" : ' + str(setTemp) + '} }'
        
    elif (mode == "HEAT"):
        cmd = '{"command" : "sdm.devices.commands.ThermostatTemperatureSetpoint.SetHeat", "params" : {"heatCelsius": ' + str(setTemp) + '} }'
    
    # send command stuff
    print("subject")
    print(cmd)
    cmdResponse = requests.post(url=url, data=cmd, headers=headers)
    print(cmdResponse)
    print(cmdResponse.json())



# Endpoints-----------------------------------------------------------------------------------------------------------------
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


@api_view(['POST'])
def createLogJob(request):
    #print(request.data)
    jobname = request.data['name']
    timeNum = int(request.data['number'])
    timeType = request.data['timeType']
    refresh_token = request.data['refresh_token']
    deviceId = request.data['deviceId']
    googleId = request.data['googleId']

    description = ''
    if timeType == 'minutes':
        description = f'Logging every {timeNum} minutes'
    elif timeType == 'hours':
        description = f'Logging every {timeNum} hours'
    else: #days
        description = f'Logging every {timeNum} days'

    def newJob():
       # get access token with refresh token
        loggingType = JobType.objects.get(pk=1) #The JobType with id 1 is Logging, seeded 2 types (logging, setting) already
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
            newJob = Job(Name=jobname, GoogleId=googleId, ThermostatId=deviceId, Description=description, SettingTemp=None, JobTypeId=loggingType)
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
                elif timeType == 'hours':
                    myscheduler.add_job(saveLog, trigger=IntervalTrigger(hours=timeNum), id=Id, args=[job.Id, refresh_token])
                else: #days
                    myscheduler.add_job(saveLog, trigger=IntervalTrigger(days=timeNum), id=Id, args=[job.Id, refresh_token])
                print("added job")
                return Response(data={'status': 201, 'message': "Log job succesfully created."}, status=status.HTTP_201_CREATED) #should response go inside each if statement?
        else:
            print("job is fake!!" + job)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    alljobsbyuser = Job.objects.filter(GoogleId=googleId)
    if alljobsbyuser.count() == 3: #Is 3 a good number of jobs a user can have? The query above is counting ALL jobs of a user, not just the ones on a single thermostat. It's == 3 and not >= 3 bc if this code is working correctly, no one should have more than 3 jobs (unless we change the limit).
        return Response(data={'status': 400, 'message': "Your account is at its limit of 3 jobs. Try deleting one before making another."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        jobId = newJob()
        print(Job.objects.get(pk=jobId))
        return saveJob(jobId, refresh_token)


@api_view(['POST'])
def createSetJob(request):
    jobname = request.data['name']
    setTemp = request.data['setTemp']
    timeNum = int(request.data['number'])
    timeType = request.data['timeType']
    refresh_token = request.data['refresh_token']
    deviceId = request.data['deviceId']
    googleId = request.data['googleId']

    description = ''
    if timeType == 'minutes':
        description = f'Setting thermostat to {setTemp} every {timeNum} minutes'
    elif timeType == 'hours':
        description = f'Setting thermostat to {setTemp} every {timeNum} hours'
    else: #days
        description = f'Setting thermostat to {setTemp} every {timeNum} days'
    
    # get access token with refresh token
    loggingType = JobType.objects.get(pk=2)
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
        newJob = Job(Name=jobname, GoogleId=googleId, ThermostatId=deviceId, Description=description, SettingTemp=setTemp, JobTypeId=loggingType)
        newJob.save()
    else:
        print('Something went wrong')
        return Response(data={'status': 500, 'message': "There was a problem creating setting job"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # make APS job
    if myscheduler.get_job(newJob.Id):
        return Response(data={'status': 400, "message": "There's already a job with this id"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        Id = str(newJob.Id)
        print(Id)
        if timeType == 'minutes':
            myscheduler.add_job(setJob, trigger=IntervalTrigger(minutes=timeNum), id=Id, args=[newJob.Id, refresh_token])
        elif timeType == 'hours':
            myscheduler.add_job(setJob, trigger=IntervalTrigger(hours=timeNum), id=Id, args=[newJob.Id, refresh_token])
        else: #days
            myscheduler.add_job(setJob, trigger=IntervalTrigger(days=timeNum), id=Id, args=[newJob.Id, refresh_token])
        print("added job")
        return Response(data={'status': 201, 'message': "Log job succesfully created."}, status=status.HTTP_201_CREATED) #should response go inside each if statement?


@api_view(['DELETE'])
def deleteJob(request, id): #keep request even if not used, fixes 500 got multiple values for argument 'name' TypeError. Change name to id so it makes more sense
    try:
        jobtodelete = Job.objects.get(Id=id)
        try:
            myscheduler.remove_job(jobtodelete.Id)
        except:
            print("scheduler job of id " + str(jobtodelete.Id) + " not found")
            #raise JobLookupError – if the job was not found: from APS docs?
        jobtodelete.delete()
        return Response(data={'status': 200, 'message': 'Job successfully deleted.'}, status=status.HTTP_200_OK)
    except Job.DoesNotExist:
        return Response(data={'status': 404, 'message': 'No job was found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def getJobs(request):
    googleId = request.GET['googleId']
    thermoId = request.GET['thermostatId']
    logsandjobs = Job.objects.prefetch_related('JobLogs', 'JobTypeId').filter(GoogleId=googleId, ThermostatId=thermoId)
    serializedlogsandjobs = JobSerializer(logsandjobs, many=True)
    if logsandjobs.exists():
        return Response(data={'status': 200, 'message': 'Got the jobs and their logs', 'data': serializedlogsandjobs.data}, status=status.HTTP_200_OK)
    else:
        return Response(data={'status': 404, 'message': 'No jobs found for this thermostat created by the logged in user'}, status=status.HTTP_404_NOT_FOUND)
    