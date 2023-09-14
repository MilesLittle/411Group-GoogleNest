from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from core.scheduler.jobs import refreshToken, recordTemp, test

def start():
	scheduler = BackgroundScheduler()

	scheduler.add_job(refreshToken, 'interval', minutes=55)
	scheduler.add_job(recordTemp, 'interval', seconds=10)

	scheduler.start()