"""
URL configuration for api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from core.views import front
from core.views import tempinfo, temp_detail, deleteLogJob, getLogJobs, createLogJob

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", front, name ="front"),
    path("tempinfo/", tempinfo, name="tempinfo"),
    path("tempinfo/<int:pk>/", temp_detail, name = "detail"),

    path('logjob', createLogJob),
    path('logjob/<str:name>/delete', deleteLogJob),
    path('logjobs', getLogJobs),
]
