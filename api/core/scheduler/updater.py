from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from core.scheduler.jobs import refreshToken, logTemp

def start():
	scheduler = BackgroundScheduler()

	#scheduler.add_job(refreshToken, 'interval', minutes=55)
	#scheduler.add_job(recordTemp, 'interval', seconds=10)

	scheduler.start()


def startLogging(access_token, refresh_token):
	scheduler = BackgroundScheduler()

	scheduler.add_job(refreshToken, 'interval', minutes=55, args=[str(refresh_token)])
	scheduler.add_job(logTemp, 'interval', seconds=10, args=[str(access_token)])

	scheduler.start()