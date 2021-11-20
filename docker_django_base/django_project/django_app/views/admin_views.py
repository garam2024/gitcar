# -*- coding: utf-8 -*-
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
from ..Controller.Pagination import *
from ..Controller.BoardController import *

from datetime import datetime
from django.http import JsonResponse
from db_info import dbinfo
import openpyxl

'''
@@ START :  ---------------------- 관리자 페이지 View -------------------------------
'''


## [관리자] 기본 페이지

class adminIndex(TemplateView):
    template_name = 'django_app/manage/admin_index.html'

    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

    def get(self, request, *args, **kwargs):

        # ## 관리자 권한 체크
        is_superuser = UserAdapter().get_is_superuser(request)
        whatGroup = UserAdapter().get_group(request)
        print("-----------------------------------------wahtgroup=============================")
        print(whatGroup)

        # print(request.user.is_authenticated)

        if request.user.is_authenticated and is_superuser:


            if whatGroup['group_id'] != '-': # 그룹별
                groupData = adminAdapter().getGroupInfo(request, whatGroup['group_id'])

                self.res_dic = groupData
                # 여기


            else: # '-' 전체 정보
                user_list = adminAdapter().getUserList(request)
                # all_task_list = adminAdapter().get_current_process(request)

                # self.res_dic['page_range'], self.res_dic['all_task_list'] = Pagination().PaginatorManager(request, all_task_list)

                self.res_dic['user_list'] = user_list
                self.res_dic["gogo"] = dbinfo.status


            res_dic = adminAdapter().getProjectProgress(request) #작업 현황(?)
            self.res_dic.update(res_dic) #업데이트로 딕셔너리 병합
            self.res_dic["group_id"] = whatGroup[ "group_id"]
            print('디비 인포 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ')

            self.res_dic["dbinfostatus"] = UserAdapter().get_code_mst(request)
            scores = dbinfo.status
            workviewList2 = ['status_work_deagi', 'status_1cha_companion_cansel','status_2cha_companion_cansel','status_job_cansel'
                             ,'status_3cha_companion_cansel','status_complet']
            scores.values()

            workviewOk = []
            for i in workviewList2:
                if i in scores:
                    value = scores[i]
                    workviewOk.append(value)
            # workviewOk = {name:score for name, score in scores.items() if name in workviewList2}


            self.res_dic['workviewConfirm'] =workviewOk


            return render(request, self.template_name, self.res_dic)
        else:

            messages.info(request, dbinfo.message["mes_admin_auth_need"])

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
        #print(data_dic)
        dataCnt=0
        for key in data_dic.keys():
            if data_dic[key] != '':
                dataCnt += 1


        is_superuser = UserAdapter().get_is_superuser(request)

        get_message = str(adminAdapter().user_info_change(request))

        if get_message == "True" or dataCnt !=0 :

            if is_superuser:

                user_list = adminAdapter().getUserList(request)

                #print(adminAdapter().getProjectProgress(request))
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

                try:
                    # all_task_list = adminAdapter().get_current_process(request, data_dic=data_dic)
                    # self.res_dic['page_range'], self.res_dic['all_task_list'] = Pagination().PaginatorManager(request, all_task_list)
                    check_task_list = adminAdapter().get_task_check_data(request)


                    self.res_dic['check_task_list'] = check_task_list

                    return render(request, self.template_name, self.res_dic)
                except:
                    raise

            else:

                messages.info(request, dbinfo.message["mes_admin_auth_need"])

                return redirect("main")

        else:
            messages.error(request, '정보 갱신 실패')

            return redirect("admin_index")

def changeAuth(request):
    dic = json.loads(request.body)
    print('상태 변경ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ')

    sql = sqlMethod()

    value = {
        'is_staff': str(dic['workAuth']).lower(),  # 작업자
        'is_inspector': str(dic['inspectAuth']).lower(),  # 검수
        'user_name' : str(dic['worker'])
    }

    condition = {
        'account_id': str(dic['worker_id'])
    }

    value_1 = {
        'is_staff': str(dic['workAuth']).lower(),  # 작업자
        'is_active': 'true'  # 검수
    }

    condition_1 = {
        'username': str(dic['worker_id'])
    }

    selectOption = {
        'account_id': str(dic['worker_id']),
        'is_staff': str(dic['workAuth']).lower(),  # 작업자
        'is_inspector': str(dic['inspectAuth']).lower()  # 검수
    }

    sql.update_status('django_app_profile', value, condition)
    sql.update_status('auth_user', value_1, condition_1)
    result = sql.select_workList('django_app_profile', selectOption, None, None, None)
    print("is_staff %s == %s and %s== %s "%(result[0]['is_staff'], dic['workAuth'],result[0]['is_inspector'],dic['inspectAuth']))

    if str(result[0]['is_staff']) == str(dic['workAuth']) and str(result[0]['is_inspector']) == str(dic['inspectAuth']):
        result = True
    else:
        result = False

    return HttpResponse(result)

def getSearchData(request):
    dic = json.loads(request.body)
    print('getSearchDataㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ')
    print(dic)
    page = dic.get("page")
    if len(dic) == 0:
        return JsonResponse({'messages': 'false'}, safe=False)
    else:
        #worker_id
        #work_type
        #work_status
        result = adminAdapter().get_current_process(request,data_dic=dic,page=page)
        print(result)
        if(result == 'NoSearch'):
            return JsonResponse({'messages': 'NoSearch'}, safe=False)
        return JsonResponse(result, safe=False)

#유저인증 검색 모듈
def getAuthSearchData(request):
    dic = json.loads(request.body)
    print('~~~~~~~~~~~~~~~~~~~~~~~~~getAuthSearchData~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    print(dic)
    page = dic.get("page")
    if len(dic) == 0:
        return JsonResponse({'messages': 'false'}, safe=False)
    else:
        result = adminAdapter().get_auth_data(request, data_dic=dic, page=page)
        return JsonResponse(result, safe=False)

'''
** END :  ------------------------ 관리자 페이지 View -------------------------------
'''

'''
@@ START :  ---------------------- 관리자 페이지 Module -------------------------------
'''


## [관리자] 작업 승인 모듈
def admin_task_approve_module(request, record_key):
    if request.method == "POST":

        message = "approve"

        print("관리자 페이지 작업 승인 모듈 동작")

        message_2 = str(adminAdapter().task_status_change(request, record_key, message))

        if message_2 == "200":
            messages.info(request, dbinfo.message["mes_work_already_success"])

        return redirect("admin_index")


## [관리자] 작업 반려 모듈
def admin_task_cancel_module(request, record_key):
    if request.method == "POST":

        print("관리자 페이지 작업 반려 모듈 동작")

        message = "cancel"

        ## 반려 메시지
        refuse_message = str(request.POST.get('fix_text', ""))

        result_message = str(adminAdapter().task_deny_message_insert(request, record_key, refuse_message))

        print("result Message : ", result_message)

        message_2 = str(adminAdapter().task_status_change(request, record_key, message))

        if message_2 == "200" and result_message == "True":
            messages.info(request, dbinfo.message["mes_work_already_Companion"])

        return redirect("admin_index")


## [관리자] 유저 정보 갱신 모듈
# def admin_update_module(request):

#     if request.method == "POST":

#         task_num = request.POST.get('product')

#         tasker, inspector, task_process, inspect_process = adminAdapter().get_detail_info(request, task_num)

#         message = {"tasker_id": tasker, "inspector_id":inspector, "task_process":task_process,"inspect_process":inspect_process}

#         return HttpResponse(json.dumps(message), content_type = "application/json", status = 200)


## [관리자] 작업 확인 페이지의 DB 데이터 요청 모듈
def task_check_api(request, task_num):
    print("prouct_name : ", task_num)

    ## Task Check

    recombine_dict, get_images_list = adminAdapter().task_check_db_data(request, task_num)

    ret_list = []
    ret_list.append(recombine_dict)
    ret_list.append("&")
    ret_list.append(get_images_list)

    return HttpResponse(ret_list, {'success': True}, status=200)


## [관리자] 검수 확인 페이지의 DB 데이터 요청 모듈
def inspect_check_api(request, task_num):
    print("prouct_name : ", task_num)

    ## Inspect Check 

    recombine_dict, get_images_list = adminAdapter().inspect_check_db_data(request, task_num)

    ret_list = []
    ret_list.append(recombine_dict)
    ret_list.append("&")
    ret_list.append(get_images_list)

    return HttpResponse(ret_list, {'success': True}, status=200)


# 상민
def insert_work(request):
    try:
        print('______________________________insert_work 작동________________________________________')

        path = r'/code/django_project/media/django_app/action_video/*.mp4'

        org_file_path = '/code/django_project/media/django_app'
        folder_list1 = ['/action_video/dtw/', '/action_video/tbit/', '/action_video/gjac/']  # intface
        folder_list2 = [ '/abnormal_video/dtw/','/abnormal_video/tbit/', '/abnormal_video/gjac/']  # abnormal
        if dbinfo.serverName == 'abnormal':
            folder_list = folder_list2
        else:
            folder_list = folder_list1
        for key in folder_list:
            print("___________폴더 탐색 시작___________________________________________")
            command = "find " + org_file_path + key + " -type f -and ! -name '*_Y.mp4' -and ! -name '*.bcpf' -and ! -name '*.json'"
            fd_popen = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
            (stdoutdata, stderrdata) = fd_popen.communicate()
            print("____________폴더 탐색 끝_____________________________________")

            data = stdoutdata.decode('utf-8')

            data = data.replace("\n", "^")
            file_list = data.split("^")

            print("파일갯수 : ", len(file_list))

            sql = sqlMethod()
            for file in file_list:
                file_org_name = file.strip()
                if len(file_org_name) == 0:
                    continue

                file_trans_name = file.replace('.mp4', '_Y.mp4')
                print('파일 원본 비디오명 : ', file_org_name, ' 파일 변경 비디오명 : ', file_trans_name)
                file_trans_name_last = file_trans_name.split('/')[-1]
                data_dic = {
                    'video_path': '/media/django_app' + key + file_trans_name_last,
                }

                option =" and video_path like '%"+ file_trans_name_last +"%'"
                result = sql.select_workList('django_app_worklist', data_dic={}, column_list=['work_id'], option= option)
                print("..........", result)

                group_id = 'gjac'
                if 'dtw' in key:
                    group_id = 'dtw'
                elif 'tbit' in key:
                    group_id = 'tbit'
                else:
                    group_id = 'gjac'
                # 인설트
                if len(result) == 0:
                    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    data_dic = {
                        'work_type': 'interface' if 'action_video' in key else 'normal',
                        'video_path': data_dic["video_path"],
                        'work_status':dbinfo.status['status_work_deagi'],
                        'reg_id': 'admin',
                        'reg_date': now,
                        'group_id': group_id
                    }

                    history_dic = {
                        "work_id": "@$currval('django_app_worklist_task_num_seq')",
                        "work_status": dbinfo.status['status_work_deagi'],
                        "reg_id": "admin",
                        "reg_date": now,
                        "group_id": group_id
                    }
                    print("..........999")
                    sql.insert_workList(table_name='django_app_worklist', data_dic=data_dic)
                    print(
                        "---------------------------------------worklist insert complete--------------------------------------")
                    sql.insert_workList(table_name="django_app_workhistory", data_dic=history_dic)
                    print("..........7898u87")

                    # 파이썬 파일 이름 변경
                    sql.conn.commit()
                    os.rename(file_org_name, file_trans_name)
            sql.close()
            print("작업 끝!")
            # return HttpResponse({'success' : True}, status = 200)
        messages.info(request, dbinfo.message["mes_work_inserted"])
        return redirect("admin_index")

    except Exception as e:

        # return HttpResponse({'success' : False}, status = 200)
        messages.info(request, dbinfo.message["mes_error"])
        sql.close()
        return redirect("admin_index")



## 공지사항 코드 시작
class board_list(TemplateView): #list 게시판 검색 로직 같이 쓸 것
    template_name = 'django_app/manage/admin_board.html'
    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        self.res_dic["pageInfo"] = "list"
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

    def get(self, request, *args, **kwargs):

        sql = sqlMethod()
        option = "and account_id='" + str(request.user)+ "'"
        self.res_dic['user'] = sql.select_workList('django_app_profile', data_dic={}, column_list=['*'], option= option)[0]
        print(self.res_dic['user'])
        return render(request, self.template_name, self.res_dic)

    def post(self, request, *args, **kwargs):
        dict = BoardController.getList(self, request)
        print(dict)
        return JsonResponse({ 'boardList': dict['boardList'], 'boardLength': dict['boardLength'][0]['count'], 'is_superuser': dict['userInfo']['is_superuser'] })

class board_write(TemplateView): #create
    template_name = 'django_app/manage/admin_board.html'

    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        self.res_dic["pageInfo"] = "create"
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name, self.res_dic)

    def post(self, request, *args, **kwargs):
        BoardController.create(self, request)
        return redirect('admin_board_list')

class board_read(TemplateView): #read
    template_name = 'django_app/manage/admin_board.html'

    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        self.res_dic["pageInfo"] = "read"
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

    def get(self, request, *args, **kwargs):
        self.res_dic = BoardController.read(self, request)
        return render(request, self.template_name, self.res_dic)

class board_update(TemplateView): #update
    template_name = 'django_app/manage/admin_board.html'

    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        self.res_dic["pageInfo"] = "update"
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

    def get(self, request, *args, **kwargs):
        sql = sqlMethod()
        self.res_dic['board_content'] = sql.select_workList('django_app_board', data_dic={ 'content_id': str(request.GET['content_id']) })[0]

        print(self.res_dic['board_content'])
        return render(request, self.template_name, self.res_dic)

    def post(self, request, *args, **kwargs):
        BoardController.update(self, request)
        return redirect('admin_board_list')

class board_delete(TemplateView): #delete
    template_name = 'django_app/manage/admin_board.html'

    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        self.res_dic["pageInfo"] = "delete"
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

    def get(self, request, *args, **kwargs):
        BoardController.delete(self, request)
        return redirect('admin_board_list')

def board_update_option(request): #업데이트 옵션
    '''
        게시판 목록 페이지에서 요청
        관리자 인지 체크 후
        관리자이면 업데이트
        관리자 아니면 실패 메시지
    '''
    sql = sqlMethod()
    result = sql.select_workList('django_app_profile', data_dic={ 'account_id': str(request.user) }, column_list=['is_superuser'])

    if result[0]['is_superuser'] == True:
        sql.update_status('django_app_board', data_dic={ 'option': str(request.POST['option']) }, con_dic= { 'content_id': str(request.POST['content_id']) } )
        return JsonResponse({ 'message': '업데이트를 성공했습니다.' }, safe=False)
    else:
        return JsonResponse({ 'message': '관리자가 아닙니다.' }, safe=False)
# 공지사항 추가해야 하는 기능
'''
    1. 수정 삭제 버튼은 작성자와 글을 보고 있는 사람이 같은 사람인지 체크 후 같은 사람이면 보여주기
    2. 수정 삭제 버튼 클릭 시 작성자와 글을 보고 있는 사람이 같은 사람인지 체크
    3. 삭제 시 정말 삭제 할거냐 물어보기
    4. 수정 시 정말 수정 할거냐 물어보기
    5. 테이블 그룹 컬럼 추가 - 게시 글도 그룹별로 보이게 해야 할듯 
    6. 디자인 넘 구림 
'''
## 공지사항 코드 끝


## [관리자] 기본 페이지
# 검수대기 기준
class adminStandard(TemplateView):
    template_name = 'django_app/manage/inspect_ready_standard.html'

    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

    def get(self, request, *args, **kwargs):

        standard_C_list, standard_E_list  = adminAdapter().inspect_standard(request)

        self.res_dic['standard_list_c'] = standard_C_list
        self.res_dic['standard_list_e'] = standard_E_list

        print("res.dic", self.res_dic)

        return render(request, self.template_name, self.res_dic)



# 가공 / 검수
class adminManufact(TemplateView):
    template_name = 'django_app/manage/man_inspect.html'

    def __init__(self):
        self.res_dic = {}

    def get(self, request, *args, **kwargs):

        print("in--------get-----man_inspect")
        worker_select, total_select = adminAdapter().man_inspect(request)
        self.res_dic['worker_list'] = worker_select
        self.res_dic['total_list'] = total_select

        return render(request, self.template_name, self.res_dic)

    def post(self, request, *args, **kwargs):

        print("in---------post----man_inspect")

        worker_select, total_select = adminAdapter().man_inspect(request)

        self.res_dic['workName'] = request.POST['workerNm']
        self.res_dic['startday'] = request.POST['startday']
        self.res_dic['endday'] = request.POST['endday']

        print("확인", self.res_dic['workName'])

        self.res_dic['worker_list'] = worker_select
        self.res_dic['total_list'] = total_select

        print("res.dic", self.res_dic)

        # 검색 값 엑셀로 저장하기 위한 부분
        # excel_save = openpyxl.Workbook()
        # sheet = excel_save.active
        # sheet.append(worker_select)
        # sheet.append(total_select)
        # excel_save.save("list.xlsx")
        # excel_save.close()

        return render(request, self.template_name, self.res_dic)


    #def ExcelSave(self, request):


        #return redirect("man_inspect")







'''
** END :  ------------------------ 관리자 페이지 Module -------------------------------
'''


class userAuth(TemplateView):
    template_name = 'django_app/manage/admin_index_userAuth.html'

    def __init__(self):
        self.res_dic = {}
        self.res_dic["serverNameTitle"] = dbinfo.serverNameTitle
        #self.res_dic["serverNameTitleAb"] = dbinfo.serverNameTitleAb

    def get(self, request, *args, **kwargs):

        # ## 관리자 권한 체크
        is_superuser = UserAdapter().get_is_superuser(request)
        whatGroup = UserAdapter().get_group(request)
        print("-----------------------------------------wahtgroup=============================")
        print(whatGroup)

        # print(request.user.is_authenticated)

        if request.user.is_authenticated and is_superuser:


            if whatGroup['group_id'] != '-':  # 그룹별
                group = whatGroup['group_id']

                user_list = adminAdapter().getGroupUserList(request , group)

                # 여기

                self.res_dic["gogo"] = dbinfo.status
                self.res_dic["user_list_len"] = len(user_list)
                print("user_list", len(user_list))
                self.res_dic['page_range'], self.res_dic['user_list'] = Pagination().PaginatorManager(request, user_list)


            else:  # '-' 전체 정보
                user_list = adminAdapter().getUserList(request)
                # all_task_list = adminAdapter().get_current_process(request)

                # self.res_dic['page_range'], self.res_dic['user_list'] = Pagination().PaginatorManager(request, user_list)
                self.res_dic['page_range'], self.res_dic['user_list'] = Pagination().PaginatorManager(request,
                                                                                                      user_list)

                self.res_dic["gogo"] = dbinfo.status
                self.res_dic["user_list_len"] = len(user_list)
                print("user_list",len(user_list))

            res_dic = adminAdapter().getProjectProgress(request)  # 작업 현황(?)
            self.res_dic.update(res_dic)  # 업데이트로 딕셔너리 병합
            self.res_dic["group_id"] = whatGroup["group_id"]
            print('디비 인포 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ!')
            self.res_dic["dbinfostatus"] = UserAdapter().get_code_mst(request)
            scores = dbinfo.status
            workviewList2 = ['status_work_deagi', 'status_1cha_companion_cansel', 'status_2cha_companion_cansel',
                             'status_job_cansel'
                , 'status_3cha_companion_cansel', 'status_complet']
            scores.values()

            workviewOk = []
            for i in workviewList2:
                if i in scores:
                    value = scores[i]
                    workviewOk.append(value)
            # workviewOk = {name:score for name, score in scores.items() if name in workviewList2}

            self.res_dic['workviewConfirm'] = workviewOk

            return render(request, self.template_name, self.res_dic)
        else:

            messages.info(request, dbinfo.message["mes_admin_auth_need"])

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

                try:
                    # all_task_list = adminAdapter().get_current_process(request, data_dic=data_dic)
                    # self.res_dic['page_range'], self.res_dic['user_list'] = Pagination().PaginatorManager(request, user_list)
                    check_task_list = adminAdapter().get_task_check_data(request)

                    self.res_dic['check_task_list'] = check_task_list

                    return render(request, self.template_name, self.res_dic)
                except:
                    raise

            else:

                messages.info(request, dbinfo.message["mes_admin_auth_need"])

                return redirect("main")

        else:
            messages.error(request, '정보 갱신 실패')

            return redirect("admin_index")

#엑셀 데이터
def getExcelData(request):
    sql = sqlMethod()
    group_id = sql.select_workList('django_app_profile', data_dic={'account_id': str(request.user)}, column_list=['group_id'])[0]['group_id']
    data = sql.get_select("worklist.selectExcel", {"group_id": str(group_id)})
    return JsonResponse(data, safe=False)

#작업 취소기능  work_back
def cancel_work(request):
    dic = json.loads(request.body)
    print(dic.get("work_id"))
    sql = sqlMethod()
    sql.update_status(table_name='django_app_worklist', data_dic={'work_status': dbinfo.status['status_job_cansel']},
                             con_dic={'work_id': dic.get("work_id")})
    sql.close()

    return JsonResponse(None, safe=False)

def work_giveUp(request):
    dic = json.loads(request.body)
    print(dic.get("work_id"))
    print(dic.get("work_status"))
    print(dic.get("group_id"))
    try:
        sql = sqlMethod()
        if(dic.get("work_status")=='B'):
            print(dic.get("work_status"))
            sql.delete(table_name='django_app_tasklist',data_dic={'work_id': dic.get("work_id")})

            now = datetime.now().strftime("%Y%m%d %H%M%S")
            history_dic = {
                "work_id": dic.get("work_id"),
                "work_status": 'A',
                "reg_id": "admin",
                "reg_date": now,
                "group_id": dic.get("group_id")
            }
            sql.insert_workList(table_name="django_app_workhistory", data_dic=history_dic)
            print("1")

            param = {
                "work_id": dic.get("work_id"),
                'work_status': dbinfo.status['status_work_deagi']
            }
            sql.set_updateQuery("worklist.worklist_update", param)

    except:
        raise
    sql.close()

    return JsonResponse(None, safe=False)