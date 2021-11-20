from django.shortcuts import render, redirect
import subprocess
import glob
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

# 기본 유저 관리 호출
from django.contrib import auth
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password

## 유저 세션 처리용 호출
from django.contrib.auth import user_logged_in
from django.dispatch.dispatcher import receiver

# DB Table 호출
#from dtwo_video_convert import task_num
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
from django.http import JsonResponse

# 검수대기 기준
class adminStandard(TemplateView):
    template_name = 'django_app/manage/inspect_ready_standard.html'

    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

    def get(self, request, *args, **kwargs):

        # ## 관리자 권한 체크
        is_superuser = UserAdapter().get_is_superuser(request)

        # print(request.user.is_authenticated)

        if request.user.is_authenticated and is_superuser:

            print('admin Index GET Activate')

            user_list = adminAdapter().getUserList(request)
            print("user_list------------------------------------------------------------------------")
            self.res_dic['user_list'] = user_list
            #     print("---------------------------------------------------------------------------------")

            res_dic = adminAdapter().getProjectProgress(request)
            print("res_dic--------------------------------------------------------------------------")
            print(res_dic)
            self.res_dic.update(res_dic)
            print("---------------------------------------------------------------------------------")

            all_task_list = adminAdapter().get_current_process(request)
            print("all_task_list--------------------------------------------------------------------")
            # check_task_list = adminAdapter().get_task_check_data(request)
            print("check_task_list--------------------------------------------------------------------")
            #     print(all_task_list)
            #     print("check_task_list------------------------------------------------------------------")
            #     print(check_task_list)
            self.res_dic['all_task_list'] = all_task_list
            # self.res_dic['check_task_list'] = check_task_list
            #     print("---------------------------------------------------------------------------------")

            print("self.res_dic!!!!!!!!-----------------------------------------------------------------------")
            # print(self.res_dic)
            return render(request, self.template_name, self.res_dic)

        else:

            messages.info(request, '관리자 권한이 필요합니다.')

            return redirect("main")

    def post(self, request, *args, **kwargs):

        print("POST -------------------------------------------------")
        data_dic = {
            "workerNm": request.POST.get('workerNm'),
            "workType": request.POST.get('workType'),
            "workStatus": request.POST.get('workStatus'),
            "searchBgn": request.POST.get('searchBgn'),
            "searchEnd": request.POST.get('searchEnd')
        }
        print(data_dic)
        dataCnt = 0
        for key in data_dic.keys():
            if data_dic[key] != '':
                dataCnt += 1

        is_superuser = UserAdapter().get_is_superuser(request)

        get_message = str(adminAdapter().user_info_change(request))

        if get_message == "True" or dataCnt != 0:

            if is_superuser:

                user_list = adminAdapter().getUserList(request)

                print(adminAdapter().getProjectProgress(request))
                # task_process, inspect_process, task_count, inspect_count = adminAdapter().getProjectProgress(request)

                prj_progress = adminAdapter().getProjectProgress(request)
                # 전체 작업수
                total_worklist_len = prj_progress['total_worklist_len']
                # 작업 대기 수
                task_ready_len = prj_progress['task_ready_len']
                # 전체 완료 수
                task_complete_len = prj_progress['task_complete_len']
                # 작업 진행 수
                task_working_len = prj_progress['task_working_len']
                # 전체 진행율
                # tatal_rate= prj_progress['tatal_rate']
                # 작업 완료 수

                # 1차 검수 대기 수
                inspect1_ready_len = prj_progress['inspect1_ready_len']
                # 2차 검수 대기 수
                inspect2_ready_len = prj_progress['inspect2_ready_len']
                # 3차 검수 대기 수
                inspect3_ready_len = prj_progress['inspect3_ready_len']
                # 1차 검수 진행 수
                inspect1_working_len = prj_progress['inspect1_working_len']
                # 2차 검수 진행 수
                inspect2_working_len = prj_progress['inspect2_working_len']
                # 3차 검수 진행 수
                inspect3_working_len = prj_progress['inspect3_working_len']

                print('total_worklist_lenㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ')
                print(total_worklist_len)
                # task_process = float(task_process) * 100
                # inspect_process = float(inspect_process) * 100
                # task_count = int(task_count)
                # inspect_count = int(inspect_count)

                # print("Check : " + str(task_process) + ' | ' + str(inspect_process) + ' | ' + str(task_count) + ' | ' + str(inspect_count))

                # # self.res_dic['task_process','inspect_process','task_count','inspect_count'] = task_process, inspect_process, task_count, inspect_count
                # self.res_dic['task_process'] = task_process
                # self.res_dic['inspect_process'] = inspect_process
                # self.res_dic['task_count'] = task_count
                # self.res_dic['inspect_count'] = inspect_count

                self.res_dic['total_worklist_len'] = total_worklist_len
                self.res_dic['task_ready_len'] = task_ready_len
                self.res_dic['task_working_len'] = task_working_len
                self.res_dic['task_complete_len'] = task_complete_len
                self.res_dic['inspect1_ready_len'] = inspect1_ready_len
                self.res_dic['inspect2_ready_len'] = inspect2_ready_len
                self.res_dic['inspect3_ready_len'] = inspect3_ready_len
                self.res_dic['inspect1_working_len'] = inspect1_working_len
                self.res_dic['inspect2_working_len'] = inspect2_working_len
                self.res_dic['inspect3_working_len'] = inspect3_working_len
                # self.res_dic['inspect_complete_len'] = inspect_complete_len
                # self.res_dic['tatal_rate'] = tatal_rate

                self.res_dic['user_list'] = user_list

                all_task_list = adminAdapter().get_current_process(request, data_dic=data_dic)
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

# 가공 / 검수
class adminManufact(TemplateView):
    template_name = 'django_app/manage/man_inspect.html'

    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        # ## 관리자 권한 체크
        is_superuser = UserAdapter().get_is_superuser(request)

        # print(request.user.is_authenticated)

        if request.user.is_authenticated and is_superuser:

            print('admin Index GET Activate')

            user_list = adminAdapter().getUserList(request)
            print("user_list------------------------------------------------------------------------")
            self.res_dic['user_list'] = user_list
            #     print("---------------------------------------------------------------------------------")

            res_dic = adminAdapter().getProjectProgress(request)
            print("res_dic--------------------------------------------------------------------------")
            print(res_dic)
            self.res_dic.update(res_dic)
            print("---------------------------------------------------------------------------------")

            all_task_list = adminAdapter().get_current_process(request)
            print("all_task_list--------------------------------------------------------------------")
            # check_task_list = adminAdapter().get_task_check_data(request)
            print("check_task_list--------------------------------------------------------------------")
            #     print(all_task_list)
            #     print("check_task_list------------------------------------------------------------------")
            #     print(check_task_list)
            self.res_dic['all_task_list'] = all_task_list
            # self.res_dic['check_task_list'] = check_task_list
            #     print("---------------------------------------------------------------------------------")

            print("self.res_dic!!!!!!!!-----------------------------------------------------------------------")
            # print(self.res_dic)
            return render(request, self.template_name, self.res_dic)

        else:

            messages.info(request, '관리자 권한이 필요합니다.')

            return redirect("main")

    def post(self, request, *args, **kwargs):

        print("POST -------------------------------------------------")
        data_dic = {
            "workerNm": request.POST.get('workerNm'),
            "workType": request.POST.get('workType'),
            "workStatus": request.POST.get('workStatus'),
            "searchBgn": request.POST.get('searchBgn'),
            "searchEnd": request.POST.get('searchEnd')
        }
        print(data_dic)
        dataCnt = 0
        for key in data_dic.keys():
            if data_dic[key] != '':
                dataCnt += 1

        is_superuser = UserAdapter().get_is_superuser(request)

        get_message = str(adminAdapter().user_info_change(request))

        if get_message == "True" or dataCnt != 0:

            if is_superuser:

                user_list = adminAdapter().getUserList(request)

                print(adminAdapter().getProjectProgress(request))
                # task_process, inspect_process, task_count, inspect_count = adminAdapter().getProjectProgress(request)

                prj_progress = adminAdapter().getProjectProgress(request)
                # 전체 작업수
                total_worklist_len = prj_progress['total_worklist_len']
                # 작업 대기 수
                task_ready_len = prj_progress['task_ready_len']
                # 전체 완료 수
                task_complete_len = prj_progress['task_complete_len']
                # 작업 진행 수
                task_working_len = prj_progress['task_working_len']
                # 전체 진행율
                # tatal_rate= prj_progress['tatal_rate']
                # 작업 완료 수

                # 1차 검수 대기 수
                inspect1_ready_len = prj_progress['inspect1_ready_len']
                # 2차 검수 대기 수
                inspect2_ready_len = prj_progress['inspect2_ready_len']
                # 3차 검수 대기 수
                inspect3_ready_len = prj_progress['inspect3_ready_len']
                # 1차 검수 진행 수
                inspect1_working_len = prj_progress['inspect1_working_len']
                # 2차 검수 진행 수
                inspect2_working_len = prj_progress['inspect2_working_len']
                # 3차 검수 진행 수
                inspect3_working_len = prj_progress['inspect3_working_len']

                print('total_worklist_lenㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ')
                print(total_worklist_len)
                # task_process = float(task_process) * 100
                # inspect_process = float(inspect_process) * 100
                # task_count = int(task_count)
                # inspect_count = int(inspect_count)

                # print("Check : " + str(task_process) + ' | ' + str(inspect_process) + ' | ' + str(task_count) + ' | ' + str(inspect_count))

                # # self.res_dic['task_process','inspect_process','task_count','inspect_count'] = task_process, inspect_process, task_count, inspect_count
                # self.res_dic['task_process'] = task_process
                # self.res_dic['inspect_process'] = inspect_process
                # self.res_dic['task_count'] = task_count
                # self.res_dic['inspect_count'] = inspect_count

                self.res_dic['total_worklist_len'] = total_worklist_len
                self.res_dic['task_ready_len'] = task_ready_len
                self.res_dic['task_working_len'] = task_working_len
                self.res_dic['task_complete_len'] = task_complete_len
                self.res_dic['inspect1_ready_len'] = inspect1_ready_len
                self.res_dic['inspect2_ready_len'] = inspect2_ready_len
                self.res_dic['inspect3_ready_len'] = inspect3_ready_len
                self.res_dic['inspect1_working_len'] = inspect1_working_len
                self.res_dic['inspect2_working_len'] = inspect2_working_len
                self.res_dic['inspect3_working_len'] = inspect3_working_len
                # self.res_dic['inspect_complete_len'] = inspect_complete_len
                # self.res_dic['tatal_rate'] = tatal_rate

                self.res_dic['user_list'] = user_list

                all_task_list = adminAdapter().get_current_process(request, data_dic=data_dic)
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