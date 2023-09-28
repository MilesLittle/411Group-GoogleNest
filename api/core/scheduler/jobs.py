from django.conf import settings
import random
import requests
from ..models import TempInfo


# For getting info from user, not for importing to updater. From Ashton's notebook
def __getTempInfo(access_token):

    access_token = "Bearer " + str(access_token)
    
    # get devices
    url_structures = 'https://smartdevicemanagement.googleapis.com/v1/enterprises/f4f5bdc3-964c-466b-bf80-9508f2709ad5/devices'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': access_token,
    }
    
    try:
        responseStc = requests.get(url_structures, headers=headers)

        # device json
        responseStc_json = responseStc.json()
        deviceName = responseStc_json['devices'][0]['name']

        # get temp info
        url_get_device = 'https://smartdevicemanagement.googleapis.com/v1/' + deviceName

        responseDvc = requests.get(url_get_device, headers=headers)

        responseDvc_json = responseDvc.json()
        humidity = responseDvc_json['traits']['sdm.devices.traits.Humidity']['ambientHumidityPercent']
        temperature = responseDvc_json['traits']['sdm.devices.traits.Temperature']['ambientTemperatureCelsius']
        temperature = (temperature * (9/5) + 32)
    except:
        print("something went wrong getting temp info for database")

    return temperature, humidity


# Jobs ----------------------
# refresh token to avoid losing access to devices
def refreshToken(refresh_token):
    project_id = 'f4f5bdc3-964c-466b-bf80-9508f2709ad5'
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
    access_token = response_json['token_type'] + ' ' + response_json['access_token']


# record temperature info and time to DB
def logTemp(access_token):

    print(str(access_token))

    retemp, rehumid = __getTempInfo(str(access_token))
    
    newInfo = TempInfo( temp=str(retemp), humidity=str(rehumid))
    newInfo.save()

    print(newInfo)