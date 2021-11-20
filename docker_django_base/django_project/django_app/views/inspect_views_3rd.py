# -*- coding: utf-8 -*-
from django.shortcuts import render, redirect

# Create your views here.

from django.views import View
from django.conf import settings


from django.shortcuts import render
from django.http.response import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView


## 페이지 접속 시 로그인 체크 호출
from django.contrib.auth.decorators import login_required

#기본 유저 관리 호출
from django.contrib import auth
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password

## 유저 세션 처리용 호출
from django.contrib.auth import user_logged_in
from django.dispatch.dispatcher import receiver


# DB Table 호출
from ..models import *

import json, cv2, os, csv

from django.contrib import messages
## Controller import
from ..Controller.UserAdapter import *
from ..Controller.TaskAdapter import *
from ..Controller.TaskInfoAdapter import * 
from ..Controller.getTaskInfo import *
from ..Controller.InspectAdapter_1st import *
from ..Controller.InspectAdapter_2nd import *
from ..Controller.InspectAdapter_3rd import *
from ..Controller.adminAdapter import * 

from datetime import datetime
from db_info import dbinfo

URL_LOGIN = 'index'
decorators = [csrf_exempt, login_required(login_url=URL_LOGIN)]




## [유저] 검수 신청 시 접속되는 기본 검수 페이지

@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Inspect_process(TemplateView):

    template_name = 'django_app/inspect_process_1st.html'
    template_name1 = 'django_app/inspect_process_1st_abnormal.html'
    
    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

    def get(self, request, *args, **kwargs):



        return redirect("/")

    def post(self, request, task_num, work_type, *args, **kwargs):
        user_name = str(request.user)

        if work_type == "normal":
            self.template_name = self.template_name1

        ### Task Table mirror to Inspect Table

    
        inspect_permission = UserAdapter().get_is_inspector(request)
        compare_result = InspectAdapter_3rd().get_compare_result(request, task_num)


        if inspect_permission:
            
            if compare_result:
                ## Info INSERT to DB
                get_message = InspectAdapter_3rd().change_db_info(request, user_name, task_num)
                get_message = str(get_message)



                if get_message == "304" :
                    
                    messages.info(request, dbinfo.message["mes_inspect_max_1"])

                    return redirect('mywork')

                # InspectAdapter_3rd().mirror_db(request, task_num)

                get_message_2 = InspectAdapter_3rd().rework_logic(request, user_name, task_num)
                get_message_2 = str(get_message_2)

                print("Change DB Data : ",get_message)

                print("Rework Rogic : ", get_message_2)

                
                if get_message == 'True' and get_message_2 == '4':

                    task_info_list = InspectAdapter_3rd().get_inspect_info(request, user_name, task_num)
                    message_context = 'Exists'

                    self.res_dic['task_info_list'] = task_info_list
                    self.res_dic['message_info'] = message_context

                    task_db_list = getTaskInfo().task_db_select_all(user_name, task_num)
                    self.res_dic['task_region'] = str(task_db_list)

                    return render(request, self.template_name, self.res_dic)

                elif get_message == 'True' and get_message_2 == '5':

                    message_context = "NotExists"

                    self.res_dic['message_info'] = message_context

                    return render(request, self.template_name, self.res_dic)


                else:

                    messages.info(request, dbinfo.message["mes_already_allocation_work"])
                    return redirect('mywork')
                    
                    
            else : 

                messages.info(request, dbinfo.message["mes_same_worker_cant"])
                return redirect("inspect_list_3rd")
        
        else :

            messages.info(request, dbinfo.message["mes_inspect_allow_needed"])

            return redirect("inspect_list_3rd")


## [유저] 나의 작업 페이지에서 신청 시 접속되는 재 검수 페이지
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Re_Inspect_process(TemplateView):

    template_name = 'django_app/re_inspect_process_1st.html'
    template_name1 = 'django_app/inspect_process_1st_abnormal.html'

    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        print("inspect_process_3rd get")

        return redirect("/")

    def post(self, request, task_num, work_type, *args, **kwargs):

        if work_type == "normal":
            self.template_name = self.template_name1
        ## 재작업 로직이므로 해당 사항이 없음

        inspect_permission = UserAdapter().get_is_inspector(request)

        if inspect_permission:

            user_name = str(request.user)

            get_message_2 = InspectAdapter_3rd().rework_logic(request, user_name, task_num)
            get_message_2 = str(get_message_2)

            
            if get_message_2 == '4':

                task_info_list = InspectAdapter_3rd().get_inspect_info(request, user_name, task_num)
                message_context = 'Exists'

                self.res_dic['task_info_list'] = task_info_list
                self.res_dic['message_info'] = message_context

                task_db_list = getTaskInfo().task_db_select_all(user_name, task_num)
                self.res_dic['task_region'] = str(task_db_list)

                return render(request, self.template_name, self.res_dic)

            elif get_message_2 == '5':

                message_context = "NotExists"

                self.res_dic['message_info'] = message_context

                return render(request, self.template_name, self.res_dic)

            else:

                messages.info(request, dbinfo.message["mes_error"])

                return redirect('mywork')
        
        else :

            messages.info(request, dbinfo.message["mes_inspect_allow_needed"])

            return redirect("task_list")


## [유저] 작업 완료 시 DB 정보 갱신 모듈
def task_complete_module(request, task_num,work_type):

    if request.method == "POST" : 
        print('==========')

        InspectAdapter_3rd().inspect_complete_check(request, task_num)

        print("task_complete_module Activate")

        message = "success"
        ret={"message":message}

        return HttpResponse(json.dumps(ret), content_type="application/json", status = 200)

def task_complete_module2(request, work_id,work_type):
    task_num = work_id
    print('도착')
    if request.method == "POST":


        TaskInfoAdapter().task_complete_check(request, task_num)

        print("task_complete_module Activate")

        message = "success"
        ret = {"message": message}

        return HttpResponse(json.dumps(ret), content_type="application/json", status=200)

## [유저] 작업 페이지내에서 동작하는 검수 중간 취소 모듈
def inspect_middle_cancel_module(request, task_num):

    if request.method == "POST" :

        

        get_message = str(InspectAdapter_3rd().inspect_middle_cancel(request, task_num))

        print("inspect_middle_cancel_module Activate")

        if get_message == "True":

            message = {"message":"success"}
            return HttpResponse(json.dumps(message), content_type = "application/json", status = 200)

        else:

            messages.info(request, dbinfo.message["mes_inspect_cancel_error"])
            message = {"message":"failed"}
            return HttpResponse(json.dumps(message), content_type = "application/json", status = 200)



## [유저] 작업 정보 요청(갱신) 및 정보 반환 모듈
def info_api(request):
    ## POST 값을 가져옴
    get_unique_id=request.POST.get('nid')

    query_set = WorkLIst.objects.all()

    ## 프론트에서 보내주는 WorkList의 primary_key 값
    get_task_value = WorkList.objects.get(task_num = get_unique_id)
    
    
    for user in user_list:
        if(nid==user.username and nid !=""):
            message=0
    ret={"message":message}

    return HttpResponse(json.dumps(ret), content_type="application/json")


## [유저] My_Task 페이지 접속 시 무조건 처음에 DB 데이터를 한번 요청
def check_api(request, task_num):

    print("task_num : ", task_num)
    user_name = str(request.user)


    recombine_dict, get_images_list = getTaskInfo().check_db_data(request, user_name, task_num)
    
    ret_list = []
    ret_list.append(recombine_dict)
    ret_list.append("&")
    ret_list.append(get_images_list)


    return HttpResponse(ret_list, {'success' : True}, status = 200)




## [유저] 작업, 검수 페이지에서 번호 이동 시 번호별 데이터 저장용 모듈
def task_api(request, task_num):
    ## POST 값을 가져옴
    
    user_name = request.user
    task_num = task_num

    print("task_num : " + str(task_num) + "UserName : " + str(user_name))
    

    getTaskInfo().get_task_db_insert(request,user_name, task_num)

    ## 정보가 없다고 하면 고유 ID and image Path
    ## 정보가 있다고 하면 JSON 정보만
    message = 1

    ret={"message":message}
    return HttpResponse(json.dumps(ret), content_type="application/json")


def check_task(request, task_num, work_type):
    user_name = str(request.user)
    task_num = task_num

    task_db_list = getTaskInfo().task_db_select(user_name, task_num)

    return HttpResponse(json.dumps(task_db_list), content_type="application/json")

