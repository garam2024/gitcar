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
from ..Controller.Pagination import *

from datetime import datetime
from db_info import dbinfo
from django.http import JsonResponse





URL_LOGIN = 'index'
decorators = [csrf_exempt, login_required(login_url=URL_LOGIN)]





'''
@@ START :  ---------------------- 로그인, 회원가입 View -------------------------------
'''


## 회원가입 페이지
@method_decorator(csrf_exempt, name='dispatch')
class Register(TemplateView):

    template_name = 'django_app/register.html'

    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb
    def get(self, request, *args, **kwargs):

        return render(request, self.template_name, self.res_dic)


    def post(self, request, *args, **kwargs):

        return redirect('register_form')


## 로그인 페이지 
class Index(TemplateView):

    template_name = 'django_app/index.html'
        
    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

        
        
    def get(self, request, *args, **kwargs):

        if request.user.is_authenticated:

            return redirect("main")
        ## 기본 메인 페이지
        else:

            print('index GET Method Activate')
            return render(request, self.template_name, self.res_dic)



## [유저] 로그인 이후 접속되는 기본 페이지, 로그인 정보가 있을 경우 해당 페이지로 이동
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Main(TemplateView):

    template_name = 'django_app/main.html'
        
    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb
        
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
    a = sqlMethod()
    user_list = a.select_workList(table_name="django_app_profile",data_dic={},column_list={'account_id'})
    a.close()
    message=1
    account_list = [i["account_id"] for i in user_list]
    if(nid in account_list and nid !=""):
        message=0
    ret={"message":message}
    return HttpResponse(json.dumps(ret), content_type="application/json")


## 회원가입 시 유저 정보 저장 모듈
@method_decorator(csrf_exempt, name='dispatch')
def Register_module(request):

    if request.method == "POST":
        print("Register_Module Activate")

        nid = request.POST.get("nid", "")
        print("nid", nid)
        npw = request.POST.get("npw", "")
        nemail = request.POST.get("nemail", "")
        ngroup = request.POST.get("ngroup", "")
        nphone = request.POST.get("nphone", "")
        nname = request.POST.get("nname", "")



        user=User.objects.create_user(nid, nemail, npw)
        # create_superuser 파라미터 동일
        user.save()

        profile=Profile.objects.get(user=user)
        profile.set_info(nid, npw, nname, nphone, nemail, ngroup)

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
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb
        
    def get(self, request, *args, **kwargs):

        task_table_list = TaskAdapter().get_task_list(request)
        self.res_dic['task_list'] = task_table_list

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name
        
        return render(request, self.template_name, self.res_dic)

@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Abnormal_task_list(TemplateView):

    template_name = 'django_app/abnormal_task_list.html'
        
    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb
        
    def get(self, request, *args, **kwargs):

        task_table_list = TaskAdapter().get_abnormal_task_list(request)
        self.res_dic['task_list'] = task_table_list

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name
        
        return render(request, self.template_name, self.res_dic)


# @method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
# class normal_task_list(TemplateView):
#     template_name = 'django_app/normal_task_list.html'
#
#     def __init__(self):
#         self.res_dic = {}
#
#     def get(self, request, *args, **kwargs):
#         task_table_list = TaskAdapter().get_normal_task_list(request)
#
#         print(task_table_list)
#
#         self.res_dic['task_list'] = task_table_list
#
#         get_user_name = UserAdapter().get_profile(request)
#         self.res_dic['profile'] = get_user_name
#
#         return render(request, self.template_name, self.res_dic)
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Work_list(TemplateView):
    template_name = 'django_app/work_list.html'

    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

    def get(self, request, *args, **kwargs):

        work_table_list = TaskAdapter().get_normal_work_list(request)
        self.res_dic['page_range'], self.res_dic['work_list'] = Pagination().PaginatorManager(request, work_table_list)

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name

        return render(request, self.template_name, self.res_dic)

#경진
# @method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
# class normal_work_list(TemplateView):
#     template_name = 'django_app/work_list.html'

#     def __init__(self):
#         self.res_dic = {}

#     def get(self, request, *args, **kwargs):
#         work_table_list = TaskAdapter().get_normal_work_list(request)

#         print(work_table_list)

#         self.res_dic['work_list'] = work_table_list

#         get_user_name = UserAdapter().get_profile(request)
#         self.res_dic['profile'] = get_user_name

#         return render(request, self.template_name, self.res_dic)

@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Interface_task_list(TemplateView):

    template_name = 'django_app/task_list.html'
        
    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb
        
        
    def get(self, request, *args, **kwargs):

        task_table_list = TaskAdapter().get_interface_task_list(request)
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
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb
        
        
    def get(self, request, *args, **kwargs):

        inspect_table_list = InspectAdapter_1st().get_inspect_list(request)
        print(inspect_table_list)
        self.res_dic['inspect_list'] = inspect_table_list

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name
        
        print('검수 리스트 get...................')

        print(inspect_table_list)

        return render(request, self.template_name, self.res_dic)


@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class Inspect_list_2nd(TemplateView):

    template_name = 'django_app/inspect_list_2nd.html'
         
    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb
        
        
    def get(self, request, *args, **kwargs):

        inspect_table_list = InspectAdapter_2nd().get_inspect_list(request)
        self.res_dic['inspect_list'] = inspect_table_list



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
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb
        
        
    def get(self, request, *args, **kwargs):

        inspect_table_list = InspectAdapter_3rd().get_inspect_list(request)
        self.res_dic['inspect_list'] = inspect_table_list

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name
        
        print('검수 리스트 get')

        print(inspect_table_list)

        return render(request, self.template_name, self.res_dic)



# 가이드라인
@method_decorator(login_required(login_url=URL_LOGIN), name='dispatch')
class interface_guide_list(TemplateView):

    template_name = 'django_app/interface_guide_list.html'

    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb
    
        
        
    def get(self, request, *args, **kwargs):

        get_user_name = UserAdapter().get_profile(request)
        self.res_dic['profile'] = get_user_name

        return render(request, self.template_name, self.res_dic)


@method_decorator(csrf_exempt, name='dispatch')
def get_statusDic(request):
    result = dbinfo.status
    return JsonResponse(result, safe = False)


