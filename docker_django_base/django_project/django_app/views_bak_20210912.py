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
from .models import *

import json, cv2, os, csv

from django.contrib import messages
## Controller import
from .Controller.UserAdapter import *
from .Controller.TaskAdapter import *
from .Controller.TaskInfoAdapter import * 
from .Controller.getTaskInfo import *
from .Controller.InspectAdapter import *
from .Controller.InspectAdapter_2nd import *
from .Controller.InspectAdapter_3rd import *
from .Controller.adminAdapter import * 

from datetime import datetime

from .Controller.status_dic import *

URL_LOGIN = 'index'
decorators = [csrf_exempt, login_required(login_url=URL_LOGIN)]

'''
 ================= 도움말 =================

함수 기반 뷰 (Function Based View) --> Module
클래스 기반 뷰(Class Based View) --> View

 =========================================
'''

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
















'''
@@ START :  ---------------------- 로그인, 회원가입 View -------------------------------
'''


## 회원가입 페이지
@method_decorator(csrf_exempt, name='dispatch')
class Register(TemplateView):

    template_name = 'django_app/register.html'

    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        return render(request, self.template_name, self.res_dic)


    def post(self, request, *args, **kwargs):

        return redirect('register_form')


## 로그인 페이지 
class Index(TemplateView):

    template_name = 'django_app/index.html'
        
    def __init__(self):
        self.res_dic = {}
        
        
    def get(self, request, *args, **kwargs):

        if request.user.is_authenticated:

            return redirect("main")
        ## 기본 메인 페이지
        else:

            print('index GET Method Activate')

            return render(request, self.template_name, self.res_dic)





'''
** END :  ------------------------ 로그인, 회원가입 View -------------------------------
'''














'''
@@ START :  ---------------------- 로그인, 회원가입 Module -------------------------------
'''

## 유저가 로그인 시 최종 로그인 시간대 갱신
@receiver(user_logged_in)
def sig_user_logged_in(sender, user, request, **kwargs):
    # logger = logging.getLogger(__name__)
    # logger.debug("user logged in: %s at %s" % (user, request.META['REMOTE_ADDR']))

    user_id = str(user)

    query_set = Profile.objects.filter(account_id = user_id)

    if query_set.exists() :

        profile = Profile.objects.get(account_id = user_id)
        
        profile.last_login = datetime.now()

        profile.save()

    else :

        print("최종 로그인 정보 갱신 실패")


## 회원가입 페이지 내 아이디 중복 체크 모듈
def duplicateCheck(request):

    nid=request.POST.get('nid')
    user_list=User.objects.all()
    message=1
    
    for user in user_list:
        if(nid==user.username and nid !=""):
            message=0
    ret={"message":message}

    return HttpResponse(json.dumps(ret), content_type="application/json")


## 회원가입 시 유저 정보 저장 모듈
@method_decorator(csrf_exempt, name='dispatch')
def Register_module(request):

    if request.method == "POST":
        print("Register_Form Activate")

        nid = request.POST.get("nid", "")
        npw = request.POST.get("npw", "")
        nemail = request.POST.get("nemail", "")
        nphone = request.POST.get("nphone", "")
        nname = request.POST.get("nname", "")

        user=User.objects.create_user(nid, nemail, npw)#create_superuser 파라미터 동일
        # user.save()

        profile=Profile.objects.get(user=user)
        profile.set_info(nid, npw, nname, nphone, nemail)

        profile.save()

    
    return redirect("index")

## 로그인 모듈
@method_decorator(csrf_exempt, name='dispatch')
def Login_module(request):
    
    if request.method == "POST":

        print("Login Module Activate")
        user_id = request.POST.get("login_id", "")
        user_pw = request.POST.get("login_pw", "")
        
        login_res = UserAdapter().login(request, user_id, user_pw)
        login_res = str(login_res)
        
        if login_res == "True":

            messages.success(request, '로그인 되었습니다.')
            return redirect("main")
        else:
            messages.error(request, '일치하는 정보가 없습니다.')
            return redirect("index")


## 로그아웃 모듈
@method_decorator(csrf_exempt, name='dispatch')
def Logout_module(request):
    
    if request.method == "POST":

        messages.success(request, '로그아웃 되었습니다.')
        UserAdapter().logout(request)

        return redirect("index")


'''
** END :  ------------------------ 로그인, 회원가입 Module -------------------------------
'''


'''
@@ START :  ---------------------- 세션 처리 Module -------------------------------
'''

## 유저가 로그인 시 최종 로그인 시간대 갱신
@receiver(user_logged_in)
def sig_user_logged_in(sender, user, request, **kwargs):
    # logger = logging.getLogger(__name__)
    # logger.debug("user logged in: %s at %s" % (user, request.META['REMOTE_ADDR']))

    user_id = str(user)

    query_set = Profile.objects.filter(account_id = user_id)

    if query_set.exists() :

        profile = Profile.objects.get(account_id = user_id)
        
        profile.last_login = datetime.now()

        profile.save()

    else :

        print("최종 로그인 정보 갱신 실패")

## 세션 처리용 모듈, 타 브라우저 로그인 시 샤로운 세션 정보를 받고 기존 세션 정보는 삭제

@receiver(user_logged_in)
def remove_other_sessions(sender, user, request, **kwargs):

    # remove other sessions
    Session.objects.filter(usersession__user=user).delete()
    
    # Save Current Session Data
    request.session.save()

    # create a link from the user to the current session (for later removal)
    UserSession.objects.get_or_create(

        user=user,
        session_id=request.session.session_key

    )


'''
** END :  ------------------------ 세션 처리 Module -------------------------------
'''








'''
** START :  -------------------- 작업, 검수 관련 View -------------------------------
'''


## [유저] 라벨링 작업 리스트 페이지
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Task_list(TemplateView):

    template_name = 'django_app/task_list.html'
        
    def __init__(self):
        self.res_dic = {}
        
        
    def get(self, request, *args, **kwargs):

        task_table_list = TaskAdapter().get_task_list(request)
        self.res_dic['task_list'] = task_table_list

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name
        
        return render(request, self.template_name, self.res_dic)


## [유저] 라벨링 검수 리스트 페이지
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Inspect_list_1st(TemplateView):

    template_name = 'django_app/inspect_list_1st.html'
         
    def __init__(self):
        self.res_dic = {}
        
        
    def get(self, request, *args, **kwargs):

        inspect_table_list = InspectAdapter().get_inspect_list(request)
        self.res_dic['inspect_list'] = inspect_table_list

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name
        
        print('검수 리스트 get')

        print(inspect_table_list)

        return render(request, self.template_name, self.res_dic)


@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Inspect_list_2nd(TemplateView):

    template_name = 'django_app/inspect_list_2nd.html'
         
    def __init__(self):
        self.res_dic = {}
        
        
    def get(self, request, *args, **kwargs):

        inspect_table_list = InspectAdapter_2nd().get_inspect_list(request)
        self.res_dic['inspect_list_2nd'] = inspect_table_list

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name
        
        print('검수 리스트 get')

        print(inspect_table_list)

        return render(request, self.template_name, self.res_dic)



@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Inspect_list_3rd(TemplateView):

    template_name = 'django_app/inspect_list_3rd.html'
         
    def __init__(self):
        self.res_dic = {}
        
        
    def get(self, request, *args, **kwargs):

        inspect_table_list = InspectAdapter_2nd().get_inspect_list(request)
        self.res_dic['inspect_list_3rdd'] = inspect_table_list

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name
        
        print('검수 리스트 get')

        print(inspect_table_list)

        return render(request, self.template_name, self.res_dic)





## [유저] 작업 신청 시 접속되는 기본 작업 페이지
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Task_process(TemplateView):

    template_name = 'django_app/task_process.html'
    
    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        print("task_process get")

        return redirect("/")

    def post(self, request, task_num, *args, **kwargs):

        user_name = str(request.user)
        # task_num
        
        staff_permission = UserAdapter().get_is_staff(request)
        staff_permission = str(staff_permission)
        print(staff_permission)
        if staff_permission == "True":

            get_message = TaskInfoAdapter().change_db_info(request, user_name, task_num)
            get_message = str(get_message)

            print("Message : ", get_message)

            if get_message == 'True':

                task_info_list = TaskInfoAdapter().get_task_info(request, user_name, task_num)

                self.res_dic['task_info_list'] = task_info_list

                return render(request, self.template_name, self.res_dic)

            elif get_message == '304' :

                print("작업은 1개씩만 할 수 있습니다.")

                messages.info(request, '작업은 1개씩만 진행이 가능합니다. \n 기존 작업을 완료해주세요.')
                return redirect("task_list")

            elif get_message == "404" :

                print("잘못된 접근인 경우")
                
                messages.info(request, '이미 할당된 작업입니다.')
                return redirect('mytask')
            
            elif get_message == "False" :
                
                print("이미 할당된 작업인 경우")
                
                messages.info(request, '이미 할당된 작업입니다.')
                return redirect('task_list')
                
        else:

            messages.info(request, '작업자 권한이 필요합니다.')

            return redirect("task_list")


## [유저] 검수 신청 시 접속되는 기본 검수 페이지

@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Inspect_process_1st(TemplateView):

    template_name = 'django_app/inspect_process_1st.html'
    
    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        print("inspect_process get")

        return redirect("/")

    def post(self, request, task_num, *args, **kwargs):

        user_name = str(request.user)

        ### Task Table mirror to Inspect Table

    
        inspect_permission = UserAdapter().get_is_inspector(request)
        compare_result = str(InspectAdapter().get_compare_result(request, task_num))

        print("Compare Result &&&&&&&& : ", compare_result )
        if inspect_permission == "True" : 
            
            if compare_result == "False" :
                ## Info INSERT to DB
                get_message = InspectAdapter().change_db_info(request, user_name, task_num)
                get_message = str(get_message)

                print("message text : ", get_message)

                if get_message == "304" :
                    
                    messages.info(request, '검수는 1개씩만 진행할 수 있습니다. \n 기존 검수를 완료해주세요.')

                    return redirect('mytask')

                InspectAdapter().mirror_db(request, task_num)

                get_message_2 = InspectAdapter().rework_logic(request, user_name, task_num)
                get_message_2 = str(get_message_2)

                print("Change DB Data : ",get_message)

                print("Rework Rogic : ", get_message_2)

                
                if get_message == 'True' and get_message_2 == '4':

                    task_info_list = InspectAdapter().get_inspect_info(request, user_name, task_num)
                    message_context = 'Exists'

                    self.res_dic['task_info_list'] = task_info_list
                    self.res_dic['message_info'] = message_context

                    return render(request, self.template_name, self.res_dic)

                elif get_message == 'True' and get_message_2 == '5':

                    message_context = "NotExists"

                    self.res_dic['message_info'] = message_context

                    return render(request, self.template_name, self.res_dic)


                else:

                    messages.info(request, '이미 할당된 작업입니다.')
                    return redirect('mytask')
                    
                    
            else : 

                messages.info(request, '같은 작업자가 검수를 할 수 없습니다.')
                return redirect("inspect_list_1st")
        
        else :

            messages.info(request, '검수 권한이 필요합니다.')

            return redirect("inspect_list_1st")



## [유저] 2차 검수 신청 시 접속되는 기본 검수 페이지

@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Inspect_process_2nd(TemplateView):

    template_name = 'django_app/inspect_process_2nd.html'
    
    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        print("inspect_process_2nd get")

        return redirect("/")

    def post(self, request, task_num, *args, **kwargs):

        user_name = str(request.user)

        ### Task Table mirror to Inspect Table

    
        inspect_permission = UserAdapter().get_is_inspector(request)
        compare_result = str(InspectAdapter_2nd().get_compare_result(request, task_num))

        print("Compare Result &&&&&&&& : ", compare_result )
        if inspect_permission == "True" : 
            
            if compare_result == "False" :
                ## Info INSERT to DB
                get_message = InspectAdapter_2nd().change_db_info(request, user_name, task_num)
                get_message = str(get_message)

                print("message text : ", get_message)

                if get_message == "304" :
                    
                    messages.info(request, '검수는 1개씩만 진행할 수 있습니다. \n 기존 검수를 완료해주세요.')

                    return redirect('mytask')

                InspectAdapter_2nd().mirror_db(request, task_num)

                get_message_2 = InspectAdapter_2nd().rework_logic(request, user_name, task_num)
                get_message_2 = str(get_message_2)

                print("Change DB Data : ", get_message)

                print("Rework Rogic : ", get_message_2)

                
                if get_message == 'True' and get_message_2 == '4':
                    print('aaaaa')
                    task_info_list = InspectAdapter_2nd().get_inspect_info(request, user_name, task_num)
                    message_context = 'Exists'

                    self.res_dic['task_info_list'] = task_info_list
                    self.res_dic['message_info'] = message_context

                    return render(request, self.template_name, self.res_dic)

                elif get_message == 'True' and get_message_2 == '5':

                    message_context = "NotExists"

                    self.res_dic['message_info'] = message_context

                    return render(request, self.template_name, self.res_dic)


                else:

                    messages.info(request, '이미 할당된 작업입니다.')
                    return redirect('mytask')
                    
                    
            else : 

                messages.info(request, '같은 작업자가 검수를 할 수 없습니다.')
                return redirect("inspect_list_2nd")
        
        else :

            messages.info(request, '검수 권한이 필요합니다.')

            return redirect("inspect_list_2nd")




## [유저] 3차 검수 신청 시 접속되는 기본 검수 페이지

@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Inspect_process_3rd(TemplateView):

    template_name = 'django_app/inspect_process_3rd.html'
    
    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        print("inspect_process_3rd get")

        return redirect("/")

    def post(self, request, task_num, *args, **kwargs):

        user_name = str(request.user)

        ### Task Table mirror to Inspect Table

    
        inspect_permission = UserAdapter().get_is_inspector(request)
        compare_result = str(InspectAdapter_2nd().get_compare_result(request, task_num))

        print("Compare Result &&&&&&&& : ", compare_result )
        if inspect_permission == "True" : 
            
            if compare_result == "False" :
                ## Info INSERT to DB
                get_message = InspectAdapter_2nd().change_db_info(request, user_name, task_num)
                get_message = str(get_message)

                print("message text : ", get_message)

                if get_message == "304" :
                    
                    messages.info(request, '검수는 1개씩만 진행할 수 있습니다. \n 기존 검수를 완료해주세요.')

                    return redirect('mytask')

                InspectAdapter_2nd().mirror_db(request, task_num)

                get_message_2 = InspectAdapter_2nd().rework_logic(request, user_name, task_num)
                get_message_2 = str(get_message_2)

                print("Change DB Data : ", get_message)

                print("Rework Rogic : ", get_message_2)

                
                if get_message == 'True' and get_message_2 == '4':
                    print('aaaaa')
                    task_info_list = InspectAdapter_2nd().get_inspect_info(request, user_name, task_num)
                    message_context = 'Exists'

                    self.res_dic['task_info_list'] = task_info_list
                    self.res_dic['message_info'] = message_context

                    return render(request, self.template_name, self.res_dic)

                elif get_message == 'True' and get_message_2 == '5':

                    message_context = "NotExists"

                    self.res_dic['message_info'] = message_context

                    return render(request, self.template_name, self.res_dic)


                else:

                    messages.info(request, '이미 할당된 작업입니다.')
                    return redirect('mytask')
                    
                    
            else : 

                messages.info(request, '같은 작업자가 검수를 할 수 없습니다.')
                return redirect("inspect_list_3rd")
        
        else :

            messages.info(request, '검수 권한이 필요합니다.')

            return redirect("inspect_list_3rd")



## [유저] 나의 작업 페이지에서 신청 시 접속되는 재 작업 페이지
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Re_Task_process(TemplateView):

    template_name = 'django_app/re_task_process.html'
    
    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        print("task_process get")

        return redirect("/")

    def post(self, request, task_num, *args, **kwargs):

        user_name = str(request.user)

        get_message = TaskInfoAdapter().rework_logic(request, user_name, task_num)
        staff_permission = UserAdapter().get_is_staff(request)

        get_message = str(get_message)
        
        if staff_permission == "True" : 

            if get_message == '4':



                task_info_list = TaskInfoAdapter().get_task_info(request, user_name, task_num)
                message_context = "Exists"

                self.res_dic['task_info_list'] = task_info_list
                self.res_dic['message_info'] = message_context
                
                return render(request, self.template_name, self.res_dic)
            
            elif get_message == '5':

                message_context = "NotExists"

                self.res_dic['message_info'] = message_context

                return render(request, self.template_name, self.res_dic)

            else:

                messages.info(request, '오류가 발생했습니다.')

                return redirect('main')
        
        else : 

            messages.info(request, '작업자 권한이 필요합니다.')

            return redirect("mytask")


## [유저] 나의 작업 페이지에서 신청 시 접속되는 재 검수 페이지
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Re_Inspect_process(TemplateView):

    template_name = 'django_app/re_inspect_process.html'
    
    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        print("inspect_process get")

        return redirect("/")

    def post(self, request, task_num, *args, **kwargs):
        
        ## 재작업 로직이므로 해당 사항이 없음

        inspect_permission = UserAdapter().get_is_inspector(request)

        if inspect_permission == "True" : 

            user_name = str(request.user)

            get_message_2 = InspectAdapter().rework_logic(request, user_name, task_num)
            get_message_2 = str(get_message_2)

            
            if get_message_2 == '4':

                task_info_list = InspectAdapter().get_inspect_info(request, user_name, task_num)
                message_context = 'Exists'

                self.res_dic['task_info_list'] = task_info_list
                self.res_dic['message_info'] = message_context

                return render(request, self.template_name, self.res_dic)

            elif get_message_2 == '5':

                message_context = "NotExists"

                self.res_dic['message_info'] = message_context

                return render(request, self.template_name, self.res_dic)

            else:

                messages.info(request, '오류가 발생했습니다.')

                return redirect('mytask')
        
        else :

            messages.info(request, '검수 권한이 필요합니다.')

            return redirect("task_list")





## [유저] 나의 작업 페이지에서 신청 시 접속되는 2차 재 검수 페이지
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Re_Inspect_process_2nd(TemplateView):

    template_name = 'django_app/re_inspect_process_2nd.html'
    
    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        print("inspect_process get")

        return redirect("/")

    def post(self, request, task_num, *args, **kwargs):
        
        ## 재작업 로직이므로 해당 사항이 없음

        inspect_permission = UserAdapter().get_is_inspector(request)

        if inspect_permission == "True" : 

            user_name = str(request.user)

            get_message_2 = InspectAdapter().rework_logic(request, user_name, task_num)
            get_message_2 = str(get_message_2)

            
            if get_message_2 == '4':

                task_info_list = InspectAdapter().get_inspect_info(request, user_name, task_num)
                message_context = 'Exists'

                self.res_dic['task_info_list'] = task_info_list
                self.res_dic['message_info'] = message_context

                return render(request, self.template_name, self.res_dic)

            elif get_message_2 == '5':

                message_context = "NotExists"

                self.res_dic['message_info'] = message_context

                return render(request, self.template_name, self.res_dic)

            else:

                messages.info(request, '오류가 발생했습니다.')

                return redirect('mytask')
        
        else :

            messages.info(request, '검수 권한이 필요합니다.')

            return redirect("task_list")





## [유저] 나의 작업 페이지에서 신청 시 접속되는 3차 재 검수 페이지
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Re_Inspect_process_3rd(TemplateView):

    template_name = 'django_app/re_inspect_process_3rd.html'
    
    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        print("inspect_process get")

        return redirect("/")

    def post(self, request, task_num, *args, **kwargs):
        
        ## 재작업 로직이므로 해당 사항이 없음

        inspect_permission = UserAdapter().get_is_inspector(request)

        if inspect_permission == "True" : 

            user_name = str(request.user)

            get_message_2 = InspectAdapter().rework_logic(request, user_name, task_num)
            get_message_2 = str(get_message_2)

            
            if get_message_2 == '4':

                task_info_list = InspectAdapter().get_inspect_info(request, user_name, task_num)
                message_context = 'Exists'

                self.res_dic['task_info_list'] = task_info_list
                self.res_dic['message_info'] = message_context

                return render(request, self.template_name, self.res_dic)

            elif get_message_2 == '5':

                message_context = "NotExists"

                self.res_dic['message_info'] = message_context

                return render(request, self.template_name, self.res_dic)

            else:

                messages.info(request, '오류가 발생했습니다.')

                return redirect('mytask')
        
        else :

            messages.info(request, '검수 권한이 필요합니다.')

            return redirect("task_list")



'''
@@ END :  ---------------------- 작업, 검수 관련 View -------------------------------
'''








'''
@@ START :  ---------------------- 작업, 검수 관련 기능 Module -------------------------------
'''


## [유저] 작업 취소 모듈
def task_cancel_module(request, task_num):

    if request.method == "POST" :

        get_message = str(TaskInfoAdapter().task_cancel(request, task_num))

        print("task_cancel_module Activate")

        if get_message == "True":

            return redirect('mytask')

        else:
            messages.info(request, '작업 취소 기능 오류')

            return redirect('mytask')


## [유저] 검수 취소 모듈
def inspect_cancel_module(request, task_num):

    if request.method == "POST" :

        get_message = str(InspectAdapter().inspect_cancel(request, task_num))

        print("inspect_cancel_module Activate")

        if get_message == "True":

            return redirect('mytask')

        else:
            messages.info(request, '검수 취소 기능 오류')

            return redirect('mytask')



## [유저] 검수 취소 모듈
def inspect_cancel_module_2(request, task_num):

    if request.method == "POST" :

        get_message = str(InspectAdapter_2nd().inspect_cancel(request, task_num))

        print("inspect_cancel_module Activate")

        if get_message == "True":

            return redirect('mytask')

        else:
            messages.info(request, '검수 취소 기능 오류')

            return redirect('mytask')



## [유저] 검수 취소 모듈
def inspect_cancel_module_3(request, task_num):

    if request.method == "POST" :

        get_message = str(InspectAdapter_3rd().inspect_cancel(request, task_num))

        print("inspect_cancel_module Activate")

        if get_message == "True":

            return redirect('mytask')

        else:
            messages.info(request, '검수 취소 기능 오류')

            return redirect('mytask')



## [유저] 작업 완료 시 DB 정보 갱신 모듈
def task_complete_module(request, task_num):

    if request.method == "POST" : 
        print('==========')
        print(task_num)
        
        TaskInfoAdapter().task_complete_check(request, task_num)

        print("task_complete_module Activate")

        message = "success"
        ret={"message":message}

        return HttpResponse(json.dumps(ret), content_type="application/json", status = 200)




## [유저] 작업 페이지내에서 동작하는 중간 취소 모듈
def task_middle_cancel_module(request, task_num):

    if request.method == "POST" :

        get_message = str(TaskInfoAdapter().task_middle_cancel(request, task_num))

        print("task_middle_cancel_module Activate")

        if get_message == "True":
            message = {"message":"success"}

            return HttpResponse(json.dumps(message), content_type = "application/json", status = 200)

        else:
            messages.info(request, '작업 취소 기능 오류')
            message = {"message":"failed"}

            return HttpResponse(json.dumps(message), content_type = "application/json", status = 200)
            

## [유저] 작업 페이지내에서 동작하는 검수 중간 취소 모듈
def inspect_middle_cancel_module(request, task_num):

    if request.method == "POST" :

        

        get_message = str(InspectAdapter().inspect_middle_cancel(request, task_num))

        print("inspect_middle_cancel_module Activate")

        if get_message == "True":

            message = {"message":"success"}
            return HttpResponse(json.dumps(message), content_type = "application/json", status = 200)

        else:

            messages.info(request, '검수 취소 기능 오류')
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


'''
** END :  ------------------------ 작업, 검수 관련 기능 Module -------------------------------
'''
 








'''
@@ START :  ---------------------- 각종 기본 페이지 View -------------------------------
'''



## [유저] 로그인 이후 접속되는 기본 페이지, 로그인 정보가 있을 경우 해당 페이지로 이동
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Main(TemplateView):

    template_name = 'django_app/main.html'
        
    def __init__(self):
        self.res_dic = {}
        
        
    def get(self, request, *args, **kwargs):

        ## 관리자 계정일 경우 관리자 페이지로 redirect 처리
        is_superuser = UserAdapter().get_is_superuser(request)
        
        if is_superuser:

            return redirect('admin_index')


        get_user_name = UserAdapter().get_profile(request)
        get_info_check = str(UserAdapter().get_profile(request))

        if get_info_check == 'False':

            return redirect('index')

        else :

            self.res_dic['profile'] = get_user_name

        return render(request, self.template_name, self.res_dic)


## [유저] 나의 작업 페이지 ( 재작업 기능 )
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class My_Task(TemplateView):

    template_name = 'django_app/mytask.html'
         
    def __init__(self):
        self.res_dic = {}
        
        
    def get(self, request, *args, **kwargs):

        ## 기본 메인 페이지

        task_table_list = TaskAdapter().get_my_task_list(request)
        inspect_table_list = InspectAdapter().get_my_inspect_list(request)
        inspect_table_list_2 = InspectAdapter_2nd().get_my_inspect_list(request)
        inspect_table_list_3 = InspectAdapter_3rd().get_my_inspect_list(request)

        self.res_dic['task_list'] = task_table_list
        self.res_dic['inspect_list'] = inspect_table_list
        self.res_dic['inspect_list_2'] = inspect_table_list_2
        self.res_dic['inspect_list_3'] = inspect_table_list_3

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name


        return render(request, self.template_name, self.res_dic)



## [유저] 전체 작업 내역 페이지
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class My_Task_Record(TemplateView):

    template_name = 'django_app/mytask_record.html'
         
    def __init__(self):
        self.res_dic = {}
        
        
    def get(self, request, *args, **kwargs):

        ## 기본 메인 페이지

        task_record_list, inspect_record_list = getTaskInfo().get_task_record(request)

        self.res_dic['task_record_list'] = task_record_list
        self.res_dic['inspect_record_list'] = inspect_record_list

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name


        return render(request, self.template_name, self.res_dic)

        


'''
** END :  ------------------------ 각종 기본 페이지 View -------------------------------
'''