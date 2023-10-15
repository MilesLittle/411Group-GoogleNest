from django.db import models
from django.utils import timezone
import uuid

# Create your models here.

#This is test info i put in to test the app
class TempInfo(models.Model):
    temp = models.CharField(max_length = 4)
    humidity = models.CharField(max_length = 4)

    def __str__(self):
        return self.temp
    
class Job(models.Model): #mirror table for apscheduler jobs to make mapping data to front end easier
    Id = models.CharField(primary_key=True, max_length=50) #set by user (like a username, must be unique)
    GoogleId = models.CharField(max_length=100) #google ids are LONG, not even in the int range for the ORM
    ThermostatId = models.CharField(max_length=200) #These are also long
    Description = models.TextField()

    def __str__(self):
        return f'Id: {self.Id}, GoogleId: {self.GoogleId}, ThermostatId: {self.ThermostatId}, Description: {self.Description}'
    
class JobLog(models.Model):
    Id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) #in case we run out of ints perhaps 
    JobId = models.ForeignKey(Job, on_delete=models.CASCADE) #delete logs associated with a job
    ActualTemp = models.DecimalField(max_digits=9,decimal_places=6) #store it raw, convert on front end for graphing. Remember Google API uses C so it will be stored in C
    SetPointTemp = models.DecimalField(max_digits=9,decimal_places=6) #same here
    TimeLogged = models.DateTimeField(default=timezone.now) #USE_TZ = True in settings.py so this handles offset stuff i think?

    def __str__(self):
        return f'Id: {self.Id}, JobId: {self.JobId}, ActualTemp: {self.ActualTemp}, SetPointTemp: {self.SetPointTemp}, TimeLogged: {self.TimeLogged}'

