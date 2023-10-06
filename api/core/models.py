from django.db import models
import datetime
from django_cryptography.fields import encrypt


# Create your models here.

# User info, connected to tokens, devices
class User(models.Model):

    _google_id = models.CharField(max_length=12, unique=True)

    def getId(self):
        return self._google_id


class Tokens(models.Model):

    user_owner = models.ForeignKey(User, null=False, on_delete=models.CASCADE)
    _access = models.CharField(max_length=300)
    _refresh = models.CharField(max_length=300)

    def getTokens(self):
        return self._access, self._refresh


#This is test info i put in to test the app
class TempInfo(models.Model):

    temp = models.CharField(max_length = 4)
    humidity = models.CharField(max_length = 4)
    time_stamp = models.DateTimeField(auto_now = True)

    def __str__(self):
        return self.temp