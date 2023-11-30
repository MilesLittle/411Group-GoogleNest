from django.db import models
import uuid

# Create your models here.

#This is test info i put in to test the app
class TempInfo(models.Model):
    temp = models.CharField(max_length = 4)
    humidity = models.CharField(max_length = 4)

    def __str__(self):
        return self.temp

class JobType(models.Model):
    Id = models.AutoField(primary_key=True)
    Type = models.CharField(max_length=50)

    def __str__(self):
        return f'Id: {self.Id}, Type: {self.Type}'
    
class Job(models.Model): #mirror table for apscheduler jobs to make mapping data to front end easier
    Id = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=50) #set by user
    GoogleId = models.CharField(max_length=100) #google ids are LONG, not even in the int range for the ORM
    ThermostatId = models.CharField(max_length=200) #These are also long
    Description = models.TextField() #enforce length constraint on front end bc its not enforced at db level
    SettingTemp = models.IntegerField(null=True) #temp to set thermo to if its a setting job, if its a logging job its null, store in C?
    JobTypeId = models.ForeignKey(JobType, on_delete=models.SET_NULL, null=True) #does it need related_name='JobType'?
    DateCreated = models.DateTimeField(auto_now_add=True, null=True) #for showing when job will expire on front end
    #do status boolean later for if the job is running or not. May not be possible though, will have to look into it more

    def __str__(self):
        return f'Id: {self.Id}, Name: {self.Name}'
    
class JobLog(models.Model):
    Id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) #in case we run out of ints perhaps 
    JobId = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='JobLogs') #delete logs associated with a job
    ActualTemp = models.DecimalField(max_digits=9,decimal_places=6, null=True) #store it raw, convert on front end for graphing. Remember Google API uses C so it will be stored in C
    SetPointTemp = models.DecimalField(max_digits=9,decimal_places=6, null=True) #same here
    HeatTemp = models.DecimalField(max_digits=9,decimal_places=6, null=True)
    CoolTemp = models.DecimalField(max_digits=9,decimal_places=6, null=True)
    Mode = models.CharField(max_length=100, null=True)
    TimeLogged = models.DateTimeField(auto_now_add=True) #USE_TZ = True in settings.py so this handles offset stuff i think?

    def __str__(self):
        return f'Id: {self.Id}, JobId: {self.JobId}'
