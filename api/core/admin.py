from django.contrib import admin
from .models import Job, JobLog

class JobAdmin(admin.ModelAdmin):
    list_display = ('Id', 'GoogleId', 'ThermostatId', 'Description')

class JobLogAdmin(admin.ModelAdmin):
    list_display = ('Id', 'JobId', 'ActualTemp', 'SetPointTemp', 'TimeLogged')

# Register your models here.

admin.site.register(Job, JobAdmin) 
admin.site.register(JobLog, JobLogAdmin)