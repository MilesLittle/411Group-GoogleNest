from django.db import models

# Create your models here.

#This is test info i put in to test the app
class TempInfo(models.Model):
    temp = models.CharField(max_length = 4)
    humidity = models.CharField(max_length = 4)

    def __str__(self):
        return self.temp