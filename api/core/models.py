from django.db import models
import datetime


# Create your models here.

#This is test info i put in to test the app
class TempInfo(models.Model):

    temp = models.CharField(max_length = 4)
    humidity = models.CharField(max_length = 4)
    time_stamp = models.DateTimeField(auto_now = True)

    def __str__(self):
        return self.temp