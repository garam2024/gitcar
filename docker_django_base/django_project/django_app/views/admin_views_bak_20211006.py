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

URL_LOGIN = 'index'
decorators = [csrf_exempt, login_required(login_url=URL_LOGIN)]



'''
@@ START :  ---------------------- 관리자 페이지 View -------------------------------
'''

## [관리자] 기본 페이지 

class adminIndex(TemplateView):

    template_name = 'django_app/manage/admin_index.html'
        
    def __init__(self):
        self.res_dic = {}
        
        
    def get(self, request, *args, **kwargs):

        ## 관리자 권한 체크
        is_superuser = UserAdapter().get_is_superuser(request)

        if request.user.is_authenticated and is_superuser:
        
            print('admin Index GET Activate')

            user_list = adminAdapter().getUserList(request)            
            self.res_dic['user_list'] = user_list


            res_dic = adminAdapter().getProjectProgress(request)
            self.res_dic.update(res_dic)


            all_task_list = adminAdapter().get_current_process(request)
            check_task_list = adminAdapter().get_task_check_data(request)

            self.res_dic['all_task_list'] = all_task_list
            self.res_dic['check_task_list'] = check_task_list

            
            return render(request, self.template_name, self.res_dic)
        
        else:
            
            messages.info(request, '관리자 권한이 필요합니다.')

            return redirect("main")

        

    def post(self, request, *args, **kwargs):

        is_superuser = UserAdapter().get_is_superuser(request)

        get_message = str(adminAdapter().user_info_change(request))

        if get_message == "True":

            if is_superuser:
                    
                user_list = adminAdapter().getUserList(request)

                task_process, inspect_process, task_count, inspect_count = adminAdapter().getProjectProgress(request)

    
                task_process = float(task_process) * 100
                inspect_process = float(inspect_process) * 100
                task_count = int(task_count)
                inspect_count = int(inspect_count)

                print("Check : " + str(task_process) + ' | ' + str(inspect_process) + ' | ' + str(task_count) + ' | ' + str(inspect_count))

                self.res_dic['user_list'] = user_list
                # self.res_dic['task_process','inspect_process','task_count','inspect_count'] = task_process, inspect_process, task_count, inspect_count
                self.res_dic['task_process'] = task_process
                self.res_dic['inspect_process'] = inspect_process
                self.res_dic['task_count'] = task_count
                self.res_dic['inspect_count'] = inspect_count

                all_task_list = adminAdapter().get_current_process(request)
                check_task_list = adminAdapter().get_task_check_data(request)

                self.res_dic['all_task_list'] = all_task_list
                self.res_dic['check_task_list'] = check_task_list

                return render(request, self.template_name, self.res_dic)

            else:

                messages.info(request, '관리자 권한이 필요합니다.')

                return redirect("main")

        else:
            messages.error(request, '정보 갱신 실패')

            return redirect("admin_index")



## [관리자] 작업 확인 페이지

# class adminTaskCheck(TemplateView):

#     template_name = 'django_app/manage/admin_task_check.html'
        
#     def __init__(self):
#         self.res_dic = {}

#     ## 그냥 페이지를 들어갈 일이 없으므로 post 요청만 존재하면 됨

#     def post(self, request, task_num):

#         ## 관리자 내 작업 체크 페이지

#         is_superuser = UserAdapter().get_is_superuser(request)

#         if request.user.is_authenticated and is_superuser:

#             get_message = str(adminAdapter().task_rework_logic(request, task_num))

#             if get_message == "True" : 

#                 task_info_list = adminAdapter().get_task_info(request, task_num)
#                 message_context = "Exists"

#                 self.res_dic['task_info_list'] = task_info_list
#                 self.res_dic['message_info'] = message_context
#                 print('admin Task Check  POST Activate')

#             else :

#                 message_context = 'NotExists'
#                 self.res_dic['message_info'] = message_context

            
#             return render(request, self.template_name, self.res_dic)
        
#         else:
            
#             messages.info(request, '관리자 권한이 필요합니다.')

#             return redirect("main")


# ## [관리자] 검수 확인 페이지 
# class adminInspectCheck(TemplateView):

#     template_name = 'django_app/manage/admin_inspect_check.html'
        
#     def __init__(self):
#         self.res_dic = {}

#     ## 그냥 페이지를 들어갈 일이 없으므로 post 요청만 존재하면 됨

#     def post(self, request, task_num):
#         ## 관리자 내 검수 체크 페이지


#         is_superuser = UserAdapter().get_is_superuser(request)

#         if request.user.is_authenticated and is_superuser:
        
#             get_message = str(adminAdapter().inspect_rework_logic(request, task_num))

#             if get_message == "True" : 
                
#                 task_info_list = adminAdapter().get_inspect_info(request, task_num)

#                 message_context = "Exists"

#                 self.res_dic['task_info_list'] = task_info_list
#                 self.res_dic['message_info'] = message_context
#                 print('admin Inpsect Check  POST Activate')
            
#             else :

#                 message_context = "NotExists"

#                 self.res_dic['message_info'] = message_context
                
            
#             return render(request, self.template_name, self.res_dic)
        
#         else:
            
#             messages.info(request, '관리자 권한이 필요합니다.')

#             return redirect("main")


'''
** END :  ------------------------ 관리자 페이지 View -------------------------------
'''












'''
@@ START :  ---------------------- 관리자 페이지 Module -------------------------------
'''



## [관리자] 작업 승인 모듈
def admin_task_approve_module(request, record_key):

    if request.method == "POST" :
        
        message = "approve"

        print("관리자 페이지 작업 승인 모듈 동작")

        message_2 = str(adminAdapter().task_status_change(request, record_key, message))
        
        if message_2 == "200" :

            messages.info(request, "해당 작업은 승인 처리되었습니다.")

        return redirect("admin_index")
        
        
## [관리자] 작업 반려 모듈
def admin_task_cancel_module(request, record_key):

    if request.method == "POST" :

        print("관리자 페이지 작업 반려 모듈 동작")

        message = "cancel"

        ## 반려 메시지
        refuse_message = str(request.POST.get('fix_text', ""))

        result_message = str(adminAdapter().task_deny_message_insert(request, record_key, refuse_message))


        print("result Message : ", result_message)

        message_2 = str(adminAdapter().task_status_change(request, record_key, message))

        if message_2 == "200" and result_message == "True" :

            messages.info(request, "해당 작업은 반려 처리되었습니다.")

        return redirect("admin_index")


## [관리자] 유저 정보 갱신 모듈
def admin_update_module(request):

    if request.method == "POST":

        task_num = request.POST.get('product')

        tasker, inspector, task_process, inspect_process = adminAdapter().get_detail_info(request, task_num)

        message = {"tasker_id": tasker, "inspector_id":inspector, "task_process":task_process,"inspect_process":inspect_process}

        return HttpResponse(json.dumps(message), content_type = "application/json", status = 200)


## [관리자] 작업 확인 페이지의 DB 데이터 요청 모듈
def task_check_api(request, task_num):

    print("prouct_name : ", task_num)
    
    ## Task Check

    recombine_dict, get_images_list = adminAdapter().task_check_db_data(request, task_num)
    
    ret_list = []
    ret_list.append(recombine_dict)
    ret_list.append("&")
    ret_list.append(get_images_list)

    return HttpResponse(ret_list, {'success' : True}, status = 200)


## [관리자] 검수 확인 페이지의 DB 데이터 요청 모듈
def inspect_check_api(request, task_num):

    print("prouct_name : ", task_num)
    
    ## Inspect Check 

    recombine_dict, get_images_list = adminAdapter().inspect_check_db_data(request, task_num)
    
    ret_list = []
    ret_list.append(recombine_dict)
    ret_list.append("&")
    ret_list.append(get_images_list)


    return HttpResponse(ret_list, {'success' : True}, status = 200)


'''
** END :  ------------------------ 관리자 페이지 Module -------------------------------
'''


