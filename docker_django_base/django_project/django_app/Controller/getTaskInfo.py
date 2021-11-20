# -*- coding: utf-8 -*-

from django.contrib import auth
from django.contrib.auth.models import User
from django.db.models import query
## auth Check import

from .sqlMethod import sqlMethod
from django.contrib.auth.hashers import check_password
from django.conf import settings
## Password Check import
from PIL import Image

import json, base64, bson

from ..models import *
from datetime import datetime
from ast import literal_eval
from io import StringIO

from django.db import connection
from db_info import dbinfo

from ..Controller.UserAdapter import *
import psycopg2


class getTaskInfo:

    def __init__(self):

        self.res_dic = {}

    ## WorkRecord 테이블에서 작업 정보를 가져오는 로직
    def get_task_record(self, request):
        sqlMethodClsss = sqlMethod()

        get_user_name = UserAdapter().get_profile(request)

        try:
            column_list = [
                "work_id",
                "work_type",
                "work_status",
                "video_path",
                "(select code_nm  from django_app_code_mst where code_id = work_status)  work_status_nm",
                "(select code_nm  from django_app_code_mst where code_id = work_type) work_type_nm",
                "(select memo from django_app_workhistory daw2 where daw2.work_id= daw.work_id and daw2.history_id = (select max(history_id) from django_app_workhistory daw2 where daw2.work_id= daw.work_id  ) ) memo",
                "(select reg_date from django_app_workhistory daw2 where daw2.work_id= daw.work_id and daw2.history_id = (select max(history_id) from django_app_workhistory daw2 where daw2.work_id= daw.work_id  and daw2.reg_id = '"+get_user_name+"') )  reg_date",
                "(select daw2.reg_date from django_app_workhistory daw2 where daw.work_id = daw2.work_id and daw.inspect_id1 = daw2.reg_id and daw2.work_status = 'D' order by daw2.reg_date asc limit 1) inspect1_start",
                "(select daw2.reg_date from django_app_workhistory daw2 where daw.work_id = daw2.work_id and daw.inspect_id2 = daw2.reg_id and daw2.work_status = 'F' order by daw2.reg_date asc limit 1) inspect2_start",
                "(select daw2.reg_date from django_app_workhistory daw2 where daw.work_id = daw2.work_id and daw.inspect_id3 = daw2.reg_id and daw2.work_status = 'H' order by daw2.reg_date asc limit 1) inspect3_start",
                "(select sum(case when (dat.task_data::text like '%완료%' and task_data::text not like '%[]%' and to_char(reg_date,'YYYYMMDDHH24') >='2021110513' ) then 1 end) from django_app_tasklist dat where daw.work_id = dat.work_id) clip_handpose_success",
                "(select sum(case when (task_data::text like '%완료%' and task_data::text like '%[]%' and to_char(reg_date,'YYYYMMDDHH24') >='2021110513' and handpose_job_yn = 'Y') then 1 end) from django_app_tasklist dat where daw.work_id = dat.work_id) clip_handpose_fail",
                "(select count(*) from  django_app_tasklist dat where daw.work_id = dat.work_id) clip_cnt_total",
                "(select count(*) from  django_app_tasklist dat where daw.work_id = dat.work_id and daw.worker_id = dat.reg_id) clip_cnt_workers"
            ]
            work_list = sqlMethodClsss.select_workList(table_name="django_app_worklist daw ",
                                                       data_dic={"worker_id": get_user_name},
                                                       status_list={dbinfo.status['status_1cha_inspect_deagi'],
                                                                    dbinfo.status['status_1cha_inspect_run'],
                                                                    dbinfo.status['status_2cha_inspect_deagi'],
                                                                    dbinfo.status['status_2cha_inspect_run'],
                                                                    dbinfo.status['status_3cha_inspect_deagi'],
                                                                    dbinfo.status['status_3cha_inspect_run'],
                                                                    dbinfo.status['status_complet'],
                                                                    dbinfo.status['status_manage_return'],
                                                                    dbinfo.status['status_1cha_companion_return']
                                                                    },
                                                       column_list=column_list)
            print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
            print(work_list)

        except:
            sqlMethodClsss.close()
            raise

        sqlMethodClsss.close()

        return work_list

    ## WorkRecord 테이블에서 작업 정보를 가져오는 로직
    def get_inspect_record(self, request):
        get_user_name = UserAdapter().get_profile(request)
        sqlMethodClsss = sqlMethod()
        try:
            column_list = [
                "work_id",
                "work_status",
                "work_type",
                "reg_date",
                "inspect_id1",
                "inspect_id2",
                "inspect_id3",
                "video_path",
                "(select code_nm  from django_app_code_mst where code_id = work_status)  work_status_nm",
                "(select code_nm  from django_app_code_mst where code_id = work_type) work_type_nm",
                "(select dap.account_id from django_app_profile dap where dap.account_id = '"+get_user_name+"') worker",
                "(select memo from django_app_workhistory daw2 where daw2.work_id= daw.work_id and daw2.history_id = (select max(history_id) from django_app_workhistory daw2 where daw2.work_id= daw.work_id  ) ) memo",
                "(select daw2.reg_date from django_app_workhistory daw2 where daw.work_id = daw2.work_id and daw.inspect_id1 = daw2.reg_id and daw2.work_status = 'D' order by daw2.reg_date asc limit 1) inspect1_start",
                "(select daw2.reg_date from django_app_workhistory daw2 where daw.work_id = daw2.work_id and daw.inspect_id2 = daw2.reg_id and daw2.work_status = 'F' order by daw2.reg_date asc limit 1) inspect2_start",
                "(select daw2.reg_date from django_app_workhistory daw2 where daw.work_id = daw2.work_id and daw.inspect_id3 = daw2.reg_id and daw2.work_status = 'H' order by daw2.reg_date asc limit 1) inspect3_start",
                "(select sum(case when (dat.task_data::text like '%완료%' and dat.task_data::text not like '%[]%' and to_char(reg_date,'YYYYMMDDHH24') >='2021110513' ) then 1 end) from django_app_tasklist dat where daw.work_id = dat.work_id) clip_handpose_success",
                "(select sum(case when (dat.task_data::text like '%완료%' and dat.task_data::text like '%[]%' and to_char(reg_date,'YYYYMMDDHH24') >='2021110513' and handpose_job_yn = 'Y') then 1 end) from django_app_tasklist dat where daw.work_id = dat.work_id) clip_handpose_fail"
            ]
            option = "and (inspect_id1 = '" + get_user_name + "' or inspect_id2 = '" + get_user_name +"' or inspect_id3 = '"+ get_user_name +"')"

            ##본인이 반려시킨 작업을 나의 작업목록에서 보여줘야 해서 추가로 삽입
            inspect_list2 = sqlMethodClsss.select_workList(table_name="django_app_worklist daw ", data_dic={},
                                                           status_list={
                                                                        dbinfo.status['status_2cha_inspect_deagi'], dbinfo.status['status_2cha_inspect_run'],
                                                                        dbinfo.status['status_3cha_inspect_deagi'], dbinfo.status['status_3cha_inspect_run'],
                                                                        dbinfo.status['status_complet'],dbinfo.status['status_1cha_companion_return'],
                                                                        dbinfo.status['status_2cha_companion_return'], dbinfo.status['status_3cha_companion_return']},
                                                           column_list=column_list, option=option)

            inspect_list = sqlMethodClsss.select_workList(table_name="django_app_worklist daw ", column_list=column_list,
                                                           data_dic={"inspect_id1": str(request.user)},
                                                           status_list={dbinfo.status['status_1cha_inspect_deagi']})
            inspect_list.extend(inspect_list2)

        except:
            sqlMethodClsss.close()
            raise
        print(inspect_list)

        return inspect_list

    ## WorkRecord 테이블에서 작업 정보를 가져오는 로직
    def get_task_record_bak(self, request):

        print("get_task_record")

        ## 반려 메시지는 반려일 경우에만 해당하므로 조합할 리스트 길이에 맞춰서 재조합
        deny_message_list = []

        try:
            task_add_history = WorkRecord.objects.filter(work_category='T', reg_id=request.user)
            task_complete_history = WorkRecord.objects.filter(work_category='Q', reg_id=request.user)
            task_cancel_history = WorkRecord.objects.filter(work_category='K', reg_id=request.user)
            admin_cancel_history = WorkRecord.objects.filter(work_category="N", reg_id=request.user)
            admin_approve_history = WorkRecord.objects.filter(work_category="Y", reg_id=request.user)
        except:
            raise

        for item in task_add_history:
            deny_message = "None"
            deny_message_list.append(deny_message)

        for item in task_complete_history:
            deny_message = "None"
            deny_message_list.append(deny_message)

        for item in task_cancel_history:
            deny_message = "None"
            deny_message_list.append(deny_message)

        ## cancel일 경우에 반려 메시지가 존재하므로 메시지는 따로 리스트 append 처리
        for item in admin_cancel_history:

            query_check = admin_cancel_history = WorkRecord.objects.filter(work_category='N', reg_id=request.user)

            if query_check.exists():

                record_check = WorkRecord.objects.filter(work_category='T', reg_id=request.user)

                for item in record_check:

                    deny_check = DenyReason.objects.filter(record_num_id=item.id)

                    if deny_check.exists():

                        get_deny_message = DenyReason.objects.filter(record_num_id=item.id)

                        for item in get_deny_message:
                            deny_message_list.append(str(item.reason_data_field))

        for item in admin_approve_history:
            deny_message = "None"
            deny_message_list.append(deny_message)

        task_add_history = list(task_add_history)
        task_complete_history = list(task_complete_history)
        task_cancel_history = list(task_cancel_history)
        admin_cancel_history = list(admin_cancel_history)
        admin_approve_history = list(admin_approve_history)

        task_add_history += task_complete_history
        task_add_history += task_cancel_history
        task_add_history += admin_cancel_history
        task_add_history += admin_approve_history

        inspect_add_history = WorkRecord.objects.filter(work_category='I', reg_id=request.user)
        inspect_complete_history = WorkRecord.objects.filter(work_category='U', reg_id=request.user)
        inspect_cancel_history = WorkRecord.objects.filter(work_category='H', reg_id=request.user)

        inspect_add_history = list(inspect_add_history)
        inspect_complete_history = list(inspect_complete_history)
        inspect_cancel_history = list(inspect_cancel_history)

        inspect_add_history += inspect_complete_history
        inspect_add_history += inspect_cancel_history

        # return zip(range(1, len(my_assigned_task) + 1), my_assigned_task, my_task_list, my_reward)

        ## 반려 메시지는 작업에만 존재하므로 zip으로 따로 작업 부분만 묶어서 처리함

        return zip(task_add_history, deny_message_list), inspect_add_history

        ## DB 정보 체크

    def check_db_data(self, request, user_name, task_num):

        try:
            print("Check DB Data")

            def return_string(*argument):

                trans_data = bytes(*argument, 'utf8')
                trans_data = trans_data.decode('utf-8')

                return trans_data

            # ajax로 받은 데이터를 체크

            get_json_data = json.loads(request.body)

            # print("Get Json Data : ",get_json_data)

            condition_check = WorkRecord.objects.filter(task_num=task_num, work_category="Q")

            ## 검수 신청에 해당하므로 검수 데이터 구성 로직 활성화
            if condition_check.exists():

                user_name = request.user

                print(" Inspect Data Check Detect ")

                get_record = WorkRecord.objects.get(reg_id=user_name, work_category="I", task_num=task_num,
                                                    worklist_task_num_id=get_json_data)
                record_unique_key = get_record.id

                get_tasklist = InspectHistory.objects.filter(work_num_id=record_unique_key).order_by(
                    'inspect_image_num')

                get_id_list, get_width_list, get_height_list = [], [], []
                get_scaleX_list, get_scaleY_list, get_name_list = [], [], []
                get_images_list, get_path_list, get_type_list, get_length_list = [], [], [], []

                for item in get_tasklist:
                    task_data = bytes(item.inspect_data)
                    task_data = bson.loads(task_data)

                    data_id = return_string(task_data['id'])
                    get_id_list.append(data_id)

                    data_width = task_data['width']
                    get_width_list.append(data_width)

                    data_height = task_data['height']
                    get_height_list.append(data_height)

                    data_scaleX = task_data['scaleX']
                    get_scaleX_list.append(data_scaleX)

                    data_scaleY = task_data['scaleY']
                    get_scaleY_list.append(data_scaleY)

                    data_name = return_string(task_data['name'])
                    get_name_list.append(data_name)

                    data_images = str(task_data['images'])

                    get_images_list.append(data_images)

                    # print("Inspect Label Check : ", data_images)

                    data_path = return_string(task_data['path'])
                    get_path_list.append(data_path)

                    data_length = task_data['length']
                    get_length_list.append(data_length)

                    data_type = return_string(task_data['type'])
                    get_type_list.append(data_type)

                # get_images_list = str(get_images_list)
                # recombine_dict = {"id": get_id_list[item], "width": get_width_list[item], "height" : get_height_list[item], "scaleY": get_scaleY_list[item], "scaleX":get_scaleX_list[item], "name":get_name_list[item], "images": "[" + "]", "length":get_length_list[item], "path":get_path_list[item], "type":get_type_list[item]}

                print("*********** || Dict Combine Data Check || *************")

                # print("ID : ",get_id_list[0])
                # print("Width : ",get_width_list[0])
                # print("height : ",get_height_list[0])
                # print("scaleX : ",get_scaleX_list[0])
                # print("scaleY : ",get_scaleY_list[0])
                # print("name : ", get_name_list[0])

                # # print(get_images_list[0])
                # print("path : ", get_path_list[0])
                # print("length : ", get_length_list[0])
                # # print(len(get_images_list))

                recombine_dict = {"id": get_id_list[0], "width": get_width_list[0], "height": get_height_list[0],
                                  "scaleX": get_scaleX_list[0], "scaleY": get_scaleY_list[0], "name": get_name_list[0],
                                  "images": "[" + "]", "length": get_length_list[0], "path": get_path_list[0],
                                  "type": get_type_list[0]}
                # recombine_dict = {"id": get_id_list[0], "width": get_width_list[0], "height" : get_height_list[0], "scaleY": get_scaleY_list[0], "scaleX":get_scaleX_list[0], "name":get_name_list[0], "images": "[" + "]", "labels": "[" + "]", "length":get_length_list[0], "path":get_path_list[0], "type":get_type_list[0]}

                # recombine_dict = recombine_dict.replace("\\","")

                return recombine_dict, get_images_list


            ## 재작업에 해당하므로 재작업 데이터 구성 로직 활성화
            else:

                print(" Task Data Check Detect ")

                get_record = WorkRecord.objects.get(reg_id=user_name, work_category="T", task_num=task_num,
                                                    worklist_task_num_id=get_json_data)

                record_key_2 = get_record.id

                get_tasklist = TaskHistory.objects.filter(work_num_id=record_key_2).order_by('task_image_num')

                get_id_list, get_width_list, get_height_list = [], [], []
                get_scaleX_list, get_scaleY_list, get_name_list = [], [], []
                get_images_list, get_path_list, get_type_list, get_length_list = [], [], [], []

                for item in get_tasklist:
                    task_data = bytes(item.task_data)
                    task_data = bson.loads(task_data)

                    data_id = return_string(task_data['id'])
                    get_id_list.append(data_id)

                    data_width = task_data['width']
                    get_width_list.append(data_width)

                    data_height = task_data['height']
                    get_height_list.append(data_height)

                    data_scaleX = task_data['scaleX']
                    get_scaleX_list.append(data_scaleX)

                    data_scaleY = task_data['scaleY']
                    get_scaleY_list.append(data_scaleY)

                    data_name = return_string(task_data['name'])
                    get_name_list.append(data_name)

                    data_images = str(task_data['images'])

                    get_images_list.append(data_images)

                    print("Task Label Check : ", data_images)

                    data_path = return_string(task_data['path'])
                    get_path_list.append(data_path)

                    data_length = task_data['length']
                    get_length_list.append(data_length)

                    data_type = return_string(task_data['type'])
                    get_type_list.append(data_type)

                print("*********** || Dict Combine Data Check || *************")

                # print("ID : ",get_id_list[0])
                # print("Width : ",get_width_list[0])
                # print("height : ",get_height_list[0])
                # print("scaleX : ",get_scaleX_list[0])
                # print("scaleY : ",get_scaleY_list[0])
                # print("name : ", get_name_list[0])

                # # print(get_images_list[0])
                # print("path : ", get_path_list[0])
                # print("length : ", get_length_list[0])
                # # print(len(get_images_list))

                recombine_dict = {}

                if get_tasklist:
                    recombine_dict = {"id": get_id_list[0], "width": get_width_list[0], "height": get_height_list[0],
                                      "scaleX": get_scaleX_list[0], "scaleY": get_scaleY_list[0],
                                      "name": get_name_list[0],
                                      "images": "[" + "]", "length": get_length_list[0], "path": get_path_list[0],
                                      "type": get_type_list[0]}
                # recombine_dict = {"id": get_id_list[0], "width": get_width_list[0], "height" : get_height_list[0], "scaleY": get_scaleY_list[0], "scaleX":get_scaleX_list[0], "name":get_name_list[0], "images": "[" + "]", "labels": "[" + "]", "length":get_length_list[0], "path":get_path_list[0], "type":get_type_list[0]}

                # recombine_dict = recombine_dict.replace("\\","")

                return recombine_dict, get_images_list
        except:
            raise

    ## 작업 페이지에서 번호 이동 할때마다 ajax로 데이터를 받아서 저장하는 로직
    # 저작도구에서 label info save 버튼을 누를 경우 ajax로 데이터를 받아서 db 저장하는 것으로 사용
    def get_task_db_insert(self, request, user_name, task_num):
        query_set = sqlMethod()

        get_json_data = json.loads(request.body.decode('utf-8-sig'))
        parsing_data = json.loads(request.body)
        print(get_json_data)
        #반려 상태가 있는지 체크하는 부분 추가 정성효 2021 11 17 22 20
        if "status" in get_json_data["data"]:
            if(get_json_data["data"]["status"]== '반려'):
                print(get_json_data["data"]["rejection"])
                get_json_data["data"]["rejection"] = get_json_data["data"]["rejection"].replace("'", "`").replace('"', '`').replace("\\", "`")


        get_json_data = json.dumps(get_json_data, ensure_ascii=False)

        get_json_data = self.change_json_data(get_json_data)

        print("12!@#!@#!@#!#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#@!#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#@!#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#@!#!@#!@")
        print(get_json_data)

        startTime = parsing_data.get('start')
        endTime = parsing_data.get('end')
        task_id = parsing_data.get('attributes')
        group_id = parsing_data.get('group')

        print("get_task_db_insert 중간저장")
        print("-------------------insert 시작-----------------------------")
        conn = psycopg2.connect(dbinfo.conn_info)
        print("-------------------db 커넥션 완료---------------------------")
        cursor = conn.cursor()
        user_name = str(user_name)
        try:
            # "'" + group_id + "'" + \
            _sql = "insert into django_app_tasklist " + \
                   "( task_id, associated_video_path, task_data, work_id, end_time," + \
                   "reg_id, reg_date, start_time, group_id)" + \
                   "values (" + \
                   "'" + str(task_id) + "'," + \
                   "''," + \
                   "'" + get_json_data + "'," + \
                   "'" + task_num + "'," + \
                   "'" + str(endTime) + "'," + \
                   "'" + user_name + "'," + \
                   " now()," + \
                   "'" + str(startTime) + "'," + \
                   "(select group_id from django_app_profile where account_id ='" + user_name + "')" + \
                   ")" + \
                   " on conflict (work_id, task_id) DO " + \
                   "update set task_data = '" + get_json_data + "'," + \
                   "reg_date = now()," + \
                   "end_time = '" + str(endTime) + "'," + \
                   "start_time = '" + str(startTime) + "'," + \
                   "reject_status = 'N' ;"

            cursor.execute(_sql)
            conn.commit()
            print("-------------------db 등록 완료---------------------------")
        except Exception as e:
            print(
                "--------------------------------------------------error---------------------------------------------------")
            print(e)
            conn.rollback()
            raise


        conn.close()

    # 저작도구에서 region delete를 하면 db taskhistory instance 삭제
    def task_db_delete(self, request, user_name, task_num):
        parsing_data = json.loads(request.body)
        startTime = parsing_data.get('start')
        endTime = parsing_data.get('end')
        attributes = parsing_data.get('attributes')
        print("---------------------------------------------------------------")
        print("Delete Region : start_time : " + str(startTime) + ", end_time : " + str(endTime) + ", reg_id : " + str(
            user_name) + ", work_id : " + str(task_num))
        print("---------------------------------------------------------------")

        sql_query = sqlMethod()
        data_dic = {
            # "start_time": str(startTime),
            # "end_time": str(endTime),
            "reg_id": str(user_name),
            "work_id": str(task_num),
            "task_id": str(attributes)
        }
        try:
            instance = sql_query.delete(table_name="django_app_tasklist", data_dic=data_dic, option=None)
            sql_query.close()
        except Exception as e:

            sql_query.close()
            raise



    # 저작도구에서 label info save 버튼을 누를 경우 ajax로 데이터를 받아서 db 저장하는 것으로 사용
    def get_all_task_db_insert(self, request, user_name, task_num):

        query_set = sqlMethod()

        get_json_data = json.loads(request.body.decode('utf-8-sig'))
        parsing_data = json.loads(request.body)
        get_json_data = json.dumps(get_json_data, ensure_ascii=False)



        startTime = parsing_data.get('start')
        endTime = parsing_data.get('end')
        task_id = parsing_data.get('attributes')
        group_id = parsing_data.get('group')
        print("----------------------중간 저장---------------------------")
        print("-------------------insert 시작-----------------------------")
        conn = psycopg2.connect(dbinfo.conn_info)
        print("-------------------db 커넥션 완료---------------------------")
        cursor = conn.cursor()
        user_name = str(user_name)
        # current_time = datetime.now()


        print("_______________________________________________________!")
        print(task_id)
        print("_______________________________________________________!")
        print(task_num)
        print("_______________________________________________________!")
        print(endTime)
        print("_______________________________________________________!")
        print(user_name)
        print("_______________________________________________________!")
        print(startTime)
        print("_______________________________________________________!")
        print(group_id)
        print("_______________________________________________________!")

        try:
            data = {"task_id" : str(task_id) ,
                    "associated_video_path": '',
                    "task_data": get_json_data ,
                    "work_id": task_num ,
                    "end_time":  str(endTime),
                    "reg_id": user_name,
                    "reg_date" : str(datetime.datetime.now()),
                    "start_time" : str(startTime),
                    "group_id": group_id
            }
            query_set.insert_workList(table_name="django_app_tasklist", data_dic=data)

        except Exception as e:

            raise
            print(e)




    # 이상행동 저작도구에서 region delete를 하면 db taskhistory instance 삭제
    def task_db_delete_abnormal(self, request, user_name, task_num):
        parsing_data = json.loads(request.body)
        startTime = parsing_data.get('start')
        endTime = parsing_data.get('end')
        TaskIdList = parsing_data.get('chgTaskIdList')
        removeTaskId = parsing_data.get('task_id')
        sql_query = sqlMethod()
        try:
            print("---------------------------------------------------------------")
            print(
                "Delete Region : start_time : " + str(startTime) + ", end_time : " + str(endTime) + ", reg_id : " + str(
                    user_name) + ", work_id : " + str(task_num))
            print("---------------------------------------------------------------")

            data_dic = {
                "start_time": str(startTime),
                "end_time": str(endTime),
                "reg_id": str(user_name),
                "work_id": str(task_num)
            }
            delete_region = sql_query.delete(table_name="django_app_tasklist", data_dic=data_dic, option=None)
            for task_id in TaskIdList:
                tmpId = task_id - 1
                update_dic = {
                    'task_id': str(tmpId)
                }
                con_dic = {
                    'task_id': str(task_id),
                    'work_id': str(task_num)
                }
                update_region = sql_query.update_status(table_name="django_app_tasklist", data_dic=update_dic,
                                                        con_dic=con_dic)
            sql_query.close()
        except Exception as e:

            sql_query.close()
            raise

    #경진 xml insert
    def tasklist_reset(self, request, task_num):
        try:
            a= sqlMethod()
            data_dic = {'work_id': task_num}
            a.delete(table_name="django_app_tasklist", data_dic=data_dic)
        except:
            raise

    # 작업을 시작하면 task_num, user_name 해당하는 taskhistory 모두 select
    def task_db_select_all(self, user_name, task_num):
        try:
            sql_query = sqlMethod()
            data_dic = {
                "work_id": task_num,
            }
            column_list = {"task_data"}
            option = " order by start_time"
            instance = sql_query.select_workList(table_name="django_app_tasklist", data_dic=data_dic,
                                                 column_list=column_list, option=option)
            # instance = TaskHistory.objects.filter(work_num_id = task_num).values('task_data').order_by('start_time')

            for i in instance:
                if "rejection" in i["task_data"]["data"]:
                    i["task_data"]["data"]["rejection"] = i["task_data"]["data"]["rejection"].replace('"','`')
                #i.replace('"','`')

            sql_query.close()
            task_data_list = []
            for i in range(len(instance)):
                task_data_list.append(instance[i]['task_data'])

            return task_data_list
        except:
            raise

    def task_db_select_all2(self, work_id):
        try:
            sql_query = sqlMethod()
            data_dic = {
                "work_id": work_id,
            }
            column_list = {"task_data"}
            option = " order by start_time"
            instance = sql_query.select_workList(table_name="django_app_tasklist", data_dic=data_dic,
                                                 column_list=column_list, option=option)
            for i in instance:
                if "rejection" in i["task_data"]["data"]:
                    i["task_data"]["data"]["rejection"] = i["task_data"]["data"]["rejection"].replace('"','`')

            sql_query.close()
            task_data_list = []
            for i in range(len(instance)):
                # print(instance[i]['task_data'])
                task_data_list.append(instance[i]['task_data'])

            return task_data_list
        except:
            raise

    # 이상행동 작업 파일 업로드 시 db 작업 이력 조회
    def task_db_select(self, user_name, task_num):

        # task_data =  list(TaskHistory.objects.filter(work_num_id = task_num).values('task_id', 'task_data').order_by('task_id'))
        sql_query = sqlMethod()
        column_list = {"task_data", "task_id", "reject_status", "reject_memo" }
        data_dic = {
            "work_id": task_num
            # "reg_id": user_name
        }
        option = "order by start_time"
        try:
            task_data = sql_query.select_workList(table_name="django_app_tasklist", data_dic=data_dic,
                                                  column_list=column_list, option=option)

        except:
            raise
        # task_data 쌍따옴표 변경처리
        # for i in task_data:
        #     if "rejection" in i["task_data"]["data"]:
        #         i["task_data"]["data"]["rejection"] = i["task_data"]["data"]["rejection"].replace('"', '`')

        sql_query.close()

        print("task_data : ", task_data)

        return task_data

    def get_memo(self, task_num):
        try:
            sql_query = sqlMethod()
            column_list = {'memo', 'history_id'}
            data_dic = {
                "work_id": task_num
            }
            option = 'order by history_id desc limit 1'
            memo = sql_query.select_workList(table_name="django_app_workhistory", data_dic=data_dic,
                                             column_list=column_list, option=option, status_list=None)
            sql_query.close()

            return memo
        except:
            raise

    # #가장 최신의 memo 데이터 가져오기
    # def history_db_latest_memo(self, task_num):
    #     sql_query = sqlMethod()
    #     data_dic = {
    #         "work_id" : task_num,
    #     }
    #     column_list = {"memo"}
    #     option = "order by reg_date"
    #     history_memo = sql_query.select_workList(table_name="django_app_workhistory", data_dic=data_dic, column_list=column_list,option=option)
    #     # instance = TaskHistory.objects.filter(work_num_id = task_num).values('task_data').order_by('start_time')
    #     #print("instance--------------------------------------------------")
    #     # print(instance)
    #
    #     sql_query.close()
    #     return history_memo


    def change_json_data(self, json_data):
        while json_data.find('data:image/jpeg;base64') > -1:
            start = json_data.find('data:image/jpeg;base64')
            end = json_data.find('", "skeleton"', start)
            json_data = json_data[:start] + json_data[end:]
        print(json_data)
        print("--------------------------")
        print(json.loads(json_data))
        return json_data