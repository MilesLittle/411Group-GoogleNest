from django.contrib import admin
from .models import Job, JobLog, JobType

class JobAdmin(admin.ModelAdmin):
    list_display = ('Id', 'Name', 'GoogleId', 'ThermostatId', 'Description', 'SettingTemp', 'JobTypeId')

class JobLogAdmin(admin.ModelAdmin):
    list_display = ('Id', 'JobId', 'ActualTemp', 'SetPointTemp', 'HeatTemp', 'CoolTemp', 'Mode', 'TimeLogged')

class JobTypeAdmin(admin.ModelAdmin):
    list_display = ('Id', 'Type')

# Register your models here.

admin.site.register(Job, JobAdmin) 
admin.site.register(JobLog, JobLogAdmin)
admin.site.register(JobType, JobTypeAdmin)