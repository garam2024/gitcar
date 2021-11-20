from django.contrib import auth
from django.contrib.auth.models import User
## auth Check import

from django.contrib.auth.hashers import check_password
from django.conf import settings
## Password Check import
from PIL import Image

import json,bson,os

from ..models import *
from datetime import datetime

from .status_dic import porocess_status, record_status, deny_status, pay_status
import psycopg2 

try:
  conn = psycopg2.connect("dbname='gaic_db' user='gaic' host='192.168.50.187' password='gaic123!@#'")
except:
  print ("not connect")

cur = conn.cursor()

try:
  sqlString = "INSERT INTO django_app_workrecord ('work_category') VALUES ('AB')"
except:
  print ("cannot SQL Execute")
  









# class TaskInterfaceAdapter:
#    def __init__(self):
        
#         self.res_dic = {}

#    def task_complte_check_interface(self,request,task_num):
