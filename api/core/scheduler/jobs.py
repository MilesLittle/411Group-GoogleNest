from django.conf import settings
import random
import requests
from ..models import TempInfo

# for credentials and refresh
refresh_token = ''
client_id = '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com'
client_secret = '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'

# credentials
project_id = 'f4f5bdc3-964c-466b-bf80-9508f2709ad5'
redirect_uri = 'https://google.com'


# get tokens
code = '4/0Adeu5BUAtqJvQcHafoeWKnGeIBKh1S_IDL33p7wSCPbC4TWvnpOO_0AWEe9tiBSdO2PH_A'

params0 = (
    ('client_id', client_id),
    ('client_secret', client_secret),
    ('code', code),
    ('grant_type', 'authorization_code'),
    ('redirect_uri', redirect_uri),
)

response = requests.post('https://www.googleapis.com/oauth2/v4/token', params=params0)

response_json = response.json()
access_token = response_json['token_type'] + ' ' + str(response_json['access_token'])
refresh_token = response_json['refresh_token']


# get structures
url_structures = 'https://smartdevicemanagement.googleapis.com/v1/enterprises/' + project_id + '/structures'

headers = {
    'Content-Type': 'application/json',
    'Authorization': access_token,
}

response = requests.get(url_structures, headers=headers)


# get devices
url_get_devices = 'https://smartdevicemanagement.googleapis.com/v1/enterprises/' + project_id + '/devices'

response = requests.get(url_get_devices, headers=headers)

print(response.json())

response_json = response.json()
device_0_name = response_json['devices'][0]['name']


# For getting info from user, not for importing to updater. From Ashton's notebook
def __getTempInfo():


    # get device stats
    url_get_device = 'https://smartdevicemanagement.googleapis.com/v1/' + device_0_name

    response = requests.get(url_get_device, headers=headers)

    response_json = response.json()
    humidity = response_json['traits']['sdm.devices.traits.Humidity']['ambientHumidityPercent']
    print('Humidity:', humidity)
    temperature = response_json['traits']['sdm.devices.traits.Temperature']['ambientTemperatureCelsius']
    print('Temperature:', temperature * 9 /5 + 32)

    return (temperature * 9 / 5 + 32), humidity
    



# Jobs ----------------------
# refresh token to avoid losing access to devices
def refreshToken():
    params1 = (
        ('client_id', client_id),
        ('client_secret', client_secret),
        ('refresh_token', refresh_token),
        ('grant_type', 'refresh_token'),
    )

    response = requests.post('https://www.googleapis.com/oauth2/v4/token', params=params1)

    response_json = response.json()
    access_token = response_json['token_type'] + ' ' + response_json['access_token']
    print('Access token: ' + access_token)


# record temperature info and time to DB
def recordTemp():

    # temporary random vars, to be used before api calls are figured out
    retemp, rehumid = __getTempInfo()
    
    newInfo = TempInfo( temp=str(retemp), humidity=str(rehumid))
    newInfo.save()

    print(newInfo)