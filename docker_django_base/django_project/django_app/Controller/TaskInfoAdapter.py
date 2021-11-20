from django.contrib import auth
from django.contrib.auth.models import User
## auth Check import

from django.contrib.auth.hashers import check_password
from django.conf import settings
## Password Check import
from PIL import Image

import json, bson, os
from .sqlMethod import *

from ..models import *
from datetime import datetime

from .status_dic import porocess_status, record_status, deny_status, pay_status
from ..apps import *
from db_info import dbinfo


class TaskInfoAdapter:

    def __init__(self):

        self.res_dic = {}

    ## 작업 신청 시 로직 구동
    # 경진
    def change_db_info(self, request, user_name, task_num):

        try:
            # check_task = WorkList.objects.filter(task_status = porocess_status['작업 진행'], task_user_id = request.user)
            sql_str = sqlMethod()
            dic = {'work_status': dbinfo.status['status_work_run'], 'worker_id': str(user_name), 'work_id': str(task_num)}
            check_task = sql_str.select_workList(table_name='django_app_worklist', data_dic=dic, status_list={dbinfo.status['status_work_run']})
            sql_str.close()

            print("task length : ", len(check_task))
            task_length = len(check_task)

            print("=============================================================================================")
            ## 같은 작업이 2개 이상 신청될 수 없도록 제한하는 로직
            if task_length > 0:
                return 304

            # check_query = WorkRecord.objects.filter(task_num = task_num, work_category = record_status['작업 신청'])

            print("Change_db_info Activate")

            # if check_query.exists():

            # task_query = WorkList.objects.get(task_num=task_num)
            tasker_name = str(
                sql_str.select_workList(table_name='django_app_worklist', data_dic={'work_id': str(task_num)},
                                        status_list=None, column_list={'worker_id'}))
            sql_str.close()
            # tasker_name = str(task_query.task_user_id)
        except:
            raise

        print("tasker_name : ", tasker_name)
        print("request user name : ", request.user)

        print(tasker_name)
        print(request.user)

        print()
        print("=============================================================================================")

        if not tasker_name == request.user or \
                not tasker_name or tasker_name == 'None':

            print("Task DB Check & Insert Event Activate")
            print("UserName : ", user_name + 'ProductName :', task_num)

            workrecord = WorkRecord()
            try:
                # get_task_info = query_set.filter(task_num = task_num)
                get_task_info = WorkList.objects.get(task_num=task_num)
            except:
                raise

            get_task_info.task_status = porocess_status['작업 진행']
            get_task_info.task_user_id = user_name
            get_task_info.task_start_date = datetime.now()

            task_unique_number = get_task_info.task_num
            print("Task Unique Number : ", task_unique_number)

            workrecord.worklist_task_num_id = task_unique_number
            workrecord.task_num = task_num
            workrecord.work_category = record_status['작업 신청']
            workrecord.reg_id = user_name
            workrecord.reg_date = datetime.now()

            get_task_info.save()
            workrecord.save()

            return True

        else:

            if tasker_name != request.user:
                return 404

        # else:

        #     print("db change event activate")
        #     print("UserName : ",user_name + 'ProductName :', task_num)

        #     workrecord = WorkRecord()

        #     # get_task_info = query_set.filter(task_num = task_num)
        #     get_task_info = WorkList.objects.get(task_num = task_num)

        #     get_task_info.task_status = porocess_status['작업 진행']
        #     get_task_info.task_user_id = user_name
        #     get_task_info.task_start_date = datetime.now()

        #     task_unique_number = get_task_info.task_num
        #     print("Task Unique Number : ", task_unique_number)

        #     workrecord.worklist_task_num_id = task_unique_number
        #     workrecord.task_num = task_num
        #     workrecord.work_category = record_status['작업 신청']
        #     workrecord.reg_id = user_name
        #     workrecord.reg_date = datetime.now()

        #     get_task_info.save()
        #     workrecord.save()

        #     return True

    def normal_change_db_info(self, request, user_name, work_id):

        try:
            sqlMethodClsss = sqlMethod()
            # 중복작업 존재 여부 확인
            check_work = sqlMethodClsss.select_workList(table_name="django_app_worklist", data_dic={"work_id": work_id},
                                                        status_list={dbinfo.status['status_work_run'], dbinfo.status['status_1cha_inspect_run'], dbinfo.status['status_2cha_inspect_run'], dbinfo.status['status_3cha_inspect_run'], dbinfo.status['status_1cha_companion_return'], dbinfo.status['status_2cha_companion_return'],  dbinfo.status['status_3cha_companion_return'], dbinfo.status['status_manage_return'], dbinfo.status['status_1cha_man_companion_return'],
                                                                     dbinfo.status['status_3cha_man_companion_return']},
                                                        column_list=None)

            work_length = len(check_work)
            if work_length > 0:
                sqlMethodClsss.close()
                return 304

            ## 같은 작업이 시행중인 작업 여부확인(B)
            strRequestuser = str(request.user)
            check_work2 = sqlMethodClsss.select_workList(table_name="django_app_worklist",
                                                         data_dic={"worker_id": strRequestuser, 'work_status': dbinfo.status['status_work_run']},
                                                         status_list=None,
                                                         column_list=None)
            if len(check_work2) > 0:
                sqlMethodClsss.close()
                return 304

            # check_query = WorkRecord.objects.filter(task_num = task_num, work_category = record_status['작업 신청'])

            print("Change_db_info Activate")

            # if check_query.exists():

            work_query = sqlMethodClsss.select_workList(table_name="django_app_worklist", data_dic={"work_id": work_id},
                                                        status_list=None, column_list=None, option=None)
        except:
            raise
        # print(len(work_query))
        worker_name = str(work_query[0]['worker_id'])
        group_id = str(work_query[0]['group_id'])

        print("tasker_name : ", worker_name)
        print("request user name : ", request.user)

        # print(worker_name)
        # print(request.user)

        if not worker_name == str(request.user) or \
                not worker_name or worker_name == 'None':

            try:
                print("Task DB Check & Insert Event Activate")
                print("UserName : ", user_name, '   ProductName :', work_id)

                strrequestuser = str(request.user)

                print(strrequestuser)

                table_name = 'django_app_worklist'
                data_dic = {"work_status": dbinfo.status['status_work_run'], " worker_id": strrequestuser}
                con_dic = {'work_id': work_id}
                sqlMethodClsss.update_status(table_name, data_dic, con_dic)

                ## django_app_history 업데이트시  datetime 문제로 업데이트 되지않음
                now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                data_dic = {'work_id': work_id, 'work_status': dbinfo.status['status_work_run'], 'reg_id': str(request.user), 'reg_date': now,
                            'group_id': group_id}
                sqlMethodClsss.insert_workList(table_name="django_app_workhistory", data_dic=data_dic)

                sqlMethodClsss.close()
                return True
            except:
                raise

        else:

            if worker_name != request.user:
                sqlMethodClsss.close()
                return 404

    ## 재 작업 시 로직 구동
    def rework_logic(self, request, user_name, task_num):

        try:

            print("rework_logic")
            #
            # #해당 작업이 가능한지 여부 확인
            # sql_query = sqlMethod()
            # data_dic = {
            #     "work_id": task_num,
            #     "work_status": dbinfo.status['status_work_run'],
            #     'worker_id': user_name
            # }
            # query = sql_query.select_workList(table_name="django_app_worklist", data_dic=data_dic, status_list=None)

            # 해당 작업자가 작업중인 내역이 있는지 확인
            sql_str = sqlMethod()
            dic = {'work_status': dbinfo.status['status_work_run'], 'worker_id': str(user_name)}
            check_task = sql_str.select_workList(table_name='django_app_worklist', data_dic=dic)

            print("task length : ", len(check_task))

            dic = {'worker_id': user_name, "work_id": task_num}
            status = {dbinfo.status['status_1cha_inspect_deagi'],  dbinfo.status['status_manage_return'], dbinfo.status['status_1cha_companion_return']}
            check_status = sql_str.select_workList(table_name='django_app_worklist', data_dic=dic,
                                                   status_list=status)
            print("check_status, ", check_status)
            print("len(check_status)", len(check_status))


            # 경진 1초과로 체크하지 않으면 나의 작업 작업진행시 나의작업리스트가 동작하지 않음(본인까지 검사하여 최소한 1개는 존재)
            if len(check_task) != 0 and len(check_status) != 0 :
                print("작업중인 내역 있음")
                sql_str.close()
                return 304

            elif len(check_task) != 0:
                print("Data Detect")

                con_dic = {'worker_id': user_name, "work_id": task_num}
                set_dic = {
                    "work_status": dbinfo.status['status_work_run']
                }
                sql_str.update_status(table_name='django_app_worklist', data_dic=set_dic, con_dic=con_dic)

                sql_str.close()
                return 4

            elif len(check_status) != 0:

                con_dic = {'worker_id': user_name, "work_id": task_num}
                set_dic = {
                    "work_status":  dbinfo.status['status_work_run']
                }
                sql_str.update_status(table_name='django_app_worklist', data_dic=set_dic, con_dic=con_dic)

                val_dic = {
                    "work_id": str(task_num),
                    "work_status":  dbinfo.status['status_work_run'],
                    "reg_id": str(user_name),
                    "reg_date": str(datetime.now()),
                    "group_id": check_status[0].get("group_id")
                }
                sql_str.insert_workList(table_name='django_app_workhistory', data_dic=val_dic)

                sql_str.close()

                return 4

        except:
            print("rework Data GET Error")
            sql_str.close()
            return False

    ## 작업 정보를 가져오는 모듈
    def get_task_info(self, request, user_name, task_num):

        print("User Name : ", user_name)
        print("Task Num : ", task_num)

        sql_query = sqlMethod()
        # query_set = WorkList.objects.all()
        try:
            # task_info = query_set.filter(task_status = porocess_status['작업 진행'], task_user_id = user_name, task_num = task_num)
            data_dic = {
                "work_status": dbinfo.status['status_work_run'],
                "worker_id": user_name,
                "work_id": task_num
            }
            column = {" * ,"
                      "(select memo from django_app_workhistory i where i.work_id= '"+task_num+"' "
                      "and i.history_id = (SELECT MAX(history_id) prehistory FROM django_app_workhistory WHERE "
                      "length(coalesce(memo, '')) != 0 and work_id = '"+task_num+"' GROUP BY work_id )) memo"
                      }
            task_info = sql_query.select_workList(table_name="django_app_worklist", data_dic=data_dic, status_list=None, column_list=column)
            print("!_________________________________________________________!")
            print(task_info[0])
            sql_query.close()

            return task_info[0]
        except:
            raise

    def get_history_info(self, task_num):
        sql_query = sqlMethod()
        print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        try:
            data_dic = {
                "work_status": 'R1',
                "work_id": task_num
            }
            option = 'order by history_id desc limit 1'
            history_info = sql_query.select_workList(table_name="django_app_workhistory", data_dic=data_dic, status_list=None, option=option)
            sql_query.close()
            print(history_info)
            if len(history_info) == 0:
                return None
            else:
                return history_info[0]
        except:
            raise

    def get_task_info_admin(self, request, work_id, work_status):

        try:
            print("work_status : ", work_status)

            print("Task Num : ", work_id)

            sql_query = sqlMethod()

            data_dic = {
                "work_status": work_status,
                "work_id": work_id
            }
            column = {" * ,"
                      "(select memo from django_app_workhistory i where i.work_id= '" + work_id + "' "
                      "and i.history_id = (SELECT MAX(history_id) prehistory FROM django_app_workhistory WHERE  "
                      "length(coalesce(memo, '')) != 0 and work_id = '" + work_id + "' GROUP BY work_id )) memo"
                      }

            task_info = sql_query.select_workList(table_name="django_app_worklist", data_dic=data_dic, status_list=None, column_list=column)
            print(task_info)
            if (len(task_info) > 0):
                print(task_info[0])
            sql_query.close()

            # for i in range(len(code_dic.keys())):
            #     if (str(work_status)==code_dic.keys()[i]):
            #         print("workstatus랑 code_dic 같은status",code_dic.keys()[i])

            # print("code_dic key리스트",code_dic.keys())


            return task_info[0]
        except:
            raise

            ## 작업 도중에 작업을 취소하는 기능

    def task_middle_cancel(self, request, task_num):

        user_name = request.user

        try:
            query_set = WorkList.objects.get(task_status=porocess_status['작업 진행'], task_user_id=user_name,
                                             task_num=task_num)

            worklist_key = query_set.task_num

            query_set_check = WorkRecord.objects.filter(work_category=record_status['작업 신청'], reg_id=user_name,
                                                        worklist_task_num_id=worklist_key).order_by('reg_date').last()
        except:
            raise

        if query_set_check.exists():

            try:
                query_set_add = WorkRecord.objects.get(work_category=record_status['작업 신청'], reg_id=user_name,
                                                       worklist_task_num_id=worklist_key).order_by('reg_date').last()

                deny_query = WorkRecord.objects.filter(work_category=record_status['작업 반려'],
                                                       worklist_task_num_id=worklist_key).order_by('reg_date').last()

                for item in deny_query:
                    # item.work_category = 'NK'
                    item.work_category = record_status['작업 취소']

                    item.reg_date = datetime.now()

                    item.save()

                deny_query_set = DenyReason.objects.filter(record_num_id=query_set_add.id)

                task_unique_number = query_set.task_num

                workrecord = WorkRecord()

                workrecord.worklist_task_num_id = task_unique_number
                workrecord.task_num = task_num
                workrecord.work_category = record_status['작업 취소']
                workrecord.reg_id = user_name
                workrecord.reg_date = datetime.now()

                workrecord.save()

                query_set.task_status = porocess_status['작업 대기']
                query_set.task_user_id = 'None'

                query_set.complete_check = porocess_status['작업 대기']

                query_set.save()

                print("task information Check")

                return True
            except:
                raise

        else:

            print("task information No Detect")

            return False

    ## 나의 작업 페이지에서 작업을 포기하는 기능
    def task_cancel(self, request, task_num):

        user_name = request.user

        try:

            sql_query = sqlMethod()

            update_val = {"work_status": dbinfo.status['status_work_deagi'], "worker_id": ""}
            update_con = {"work_id": str(task_num)}

            sql_query.update_status(table_name="django_app_worklist", data_dic=update_val, con_dic=update_con)

            print("update 성공 ")

            del_val = {"work_id": str(task_num)}
            del_option = "and reg_date > (select Min(reg_date) from (select reg_date from django_app_workhistory where work_id = '" + str(
                task_num) + "' order by reg_date asc) a)"
            sql_query.delete(table_name="django_app_workhistory", data_dic=del_val, option=del_option)

            print("delete_history")

            sql_query.delete(table_name="django_app_tasklist", data_dic=del_val, option=None)
            print("delete_tasklist")

            sql_query.close()
            return True



        except:

            sql_query.close()
            return False

    ## 작업 완료 시 JSON 정보와 저장 정보를 마무리 하는 기능
    def task_complete_check(self, request, task_num):

        ## decode() 시 "\ufeff" 같은 문제가 붙는 문제를 해결하기 위해 sig를 추가한 utf-8-sig를 적용
        ## ex) ['\ufeffmain text','next text'] --> utf-8
        ## ex) ['main text','next text'] --> utf-8-sig
        # get_json_data = json.loads(request.body.decode('utf-8-sig'))
        # get_json_images = bson.dumps(get_json_data)
        try:
            user_name = request.user
            json_data = json.loads(request.body)
            group_id = json_data.get("group")
            ## 작업 완료
            # query_set_ = WorkList.objects.filter(task_num=task_num, task_status=porocess_status['작업 진행'],
            #                                      task_user_id=user_name)
            a = sqlMethod()
            query_set = a.select_workList(table_name='django_app_worklist',
                                          data_dic={'work_id': str(task_num), 'worker_id ': str(user_name)},
                                          status_list={dbinfo.status['status_work_run']})

            print(query_set)
        except:
            a.close()
            raise

        if len(query_set) == 0:
            #운영자 반려시 이상처리 리턴
            return '4'

        elif query_set:
            # query_set = query_set[0]

            # save_json_data = json.loads(request.body)
            # json_save_path = settings.MEDIA_ROOT + '/django_app' + '/json' + '/task_json'
            #
            # if not os.path.exists(json_save_path):
            #     os.makedirs(json_save_path)
            #
            # with open(json_save_path + '/' + task_num + ".json", "w", encoding="utf-8") as json_file:
            #
            #     json_file.write(json.dumps(save_json_data, ensure_ascii=False, indent="\t"))
            #     json_file.close()

            ## 작업 완료 시 작업 저장
            try:
                a = sqlMethod()
                a.update_status(table_name='django_app_worklist', data_dic={'work_status': dbinfo.status['status_1cha_inspect_deagi']},
                                con_dic={'work_id': str(task_num)})

                # query_set.task_status = porocess_status['작업 완료']
                # query_set.complete_check = porocess_status['작업 완료']
                # query_set.task_end_date = datetime.now()
                # query_set.inspect_status = porocess_status['1차 검수 대기']
                # task_number = query_set.task_num

                # image_count = query_set.image_count

                # list_complete.save()

                # get_history_key = WorkRecord.objects.get(worklist_task_num_id = task_number, work_category = record_status['작업 신청'], task_num = task_num)
                # history_key = get_history_key.id

                # query_set_2 = WorkRecord()
                #
                # query_set_2.worklist_task_num_id = task_number
                # query_set_2.work_category = record_status['작업 완료']
                # query_set_2.reg_id = user_name
                # query_set_2.reg_date = datetime.now()
                # query_set_2.task_num = task_num

                # query_set_2.work_state = True
                dic = {'work_id': str(task_num), 'work_status': dbinfo.status['status_1cha_inspect_deagi'], 'reg_id': str(user_name),
                       'reg_date': str(datetime.now()), 'group_id': group_id}
                a.insert_workList(table_name='django_app_workhistory', data_dic=dic)

                # history_complete.save()
                a.close()
            except:
                a.close()
                raise

        #경진 태스팅 모듈
    def admin_complete_check(self, request):

        sql = sqlMethod()
        dict = json.loads(request.body)
        group = dict['group']
        work_id = dict['work_id']
        work_status = dict['work_status']
        work_status = str(work_status)
        check = dict["check"]
        except_status='C'
        next_work_status='C'
        if(work_status == dbinfo.status['status_work_run'] or work_status == dbinfo.status['status_1cha_companion_return']):
            next_work_status = dbinfo.status['status_1cha_inspect_deagi']
        elif(work_status == dbinfo.status['status_1cha_inspect_deagi'] or work_status == dbinfo.status['status_1cha_inspect_run'] or work_status == dbinfo.status['status_2cha_companion_return']):
            except_status = dbinfo.status['status_1cha_inspect_run']
            next_work_status = dbinfo.status['status_2cha_inspect_deagi']
        elif (work_status == dbinfo.status['status_2cha_inspect_deagi'] or work_status == dbinfo.status['status_2cha_inspect_run'] or work_status == dbinfo.status['status_3cha_companion_return']):
            except_status = dbinfo.status['status_2cha_inspect_run']
            next_work_status = dbinfo.status['status_3cha_inspect_deagi']
        elif (work_status == dbinfo.status['status_3cha_inspect_deagi'] or work_status == dbinfo.status['status_3cha_inspect_run']):
            except_status = dbinfo.status['status_3cha_inspect_run']
            next_work_status = dbinfo.status['status_complet']

        data = sql.select_workList(table_name="django_app_worklist",column_list={'work_status'}, data_dic={'work_id': work_id})

        print(data[0]["work_status"])
        if(data[0]["work_status"] != work_status):
            #작업중 상태값이 변경되면 갱신실패 처리
            return 'false'

        dataDic = {"reg_id": str(request.user), "work_id": str(work_id),
                   "work_status": next_work_status,
                   "reg_date": str(datetime.now()), 'memo': '', 'group_id': group}

        rework_dataDic = {"reg_id": str(request.user), "work_id": str(work_id),
                   "work_status": dbinfo.status['status_manage_return'],
                   "reg_date": str(datetime.now()), 'memo': '', 'group_id': group}

        save_json_data = json.loads(request.body)
        try:
            #CEG 일때는 검수자에 이름 넣기
            if (work_status == dbinfo.status['status_1cha_inspect_deagi'] or work_status == dbinfo.status['status_2cha_inspect_deagi'] or work_status == dbinfo.status['status_3cha_inspect_deagi']):
                #반려시 처리
                if(check == "반려"):
                    sql.update_status(table_name='django_app_worklist', data_dic={'work_status': dbinfo.status['status_manage_return']},
                                      con_dic={"work_id": str(work_id)})
                    new_string = ''
                    dataDic['memo'] = new_string
                    for key in save_json_data['memo']:
                        new_string += '클립' + str(key['attributes']) + '번:' + str(key['rejection']) + '/ '

                    rework_dataDic['memo'] = new_string
    
                    sql.insert_workList(table_name='django_app_workhistory', data_dic=rework_dataDic)
    
                #정상시 처리
                else:
                    if (work_status == dbinfo.status['status_1cha_inspect_deagi']):
                        sql.update_status(table_name='django_app_worklist',
                                          data_dic={'work_status': next_work_status,
                                                    'inspect_id1': str(request.user)},
                                          con_dic={"work_id": str(work_id)})

                    elif (work_status == dbinfo.status['status_2cha_inspect_deagi']):
                        sql.update_status(table_name='django_app_worklist',
                                          data_dic={'work_status': next_work_status,
                                                    'inspect_id2': str(request.user)},
                                          con_dic={"work_id": str(work_id)})

                    else:
                        sql.update_status(table_name='django_app_worklist',
                                          data_dic={'work_status': next_work_status,
                                                    'inspect_id3': str(request.user)},
                                          con_dic={"work_id": str(work_id)})
                    dataDic['work_status'] = except_status
                    sql.insert_workList(table_name='django_app_workhistory', data_dic= dataDic)

                    dataDic['work_status'] = next_work_status
                    sql.insert_workList(table_name='django_app_workhistory', data_dic= dataDic)

            else:
                if (check == "반려"):
                    sql.update_status(table_name='django_app_worklist',
                                      data_dic={'work_status': dbinfo.status['status_manage_return']},
                                      con_dic={"work_id": str(work_id)})
                    new_string = ''
                    dataDic['memo'] = new_string
                    for key in save_json_data['memo']:
                        new_string += '클립' + str(key['attributes']) + '번:' + str(key['rejection']) + '/ '
                    rework_dataDic['memo'] = new_string

                    sql.insert_workList(table_name='django_app_workhistory', data_dic=rework_dataDic)

                # 정상시 처리
                else:
                    sql.update_status(table_name='django_app_worklist', data_dic={'work_status': next_work_status},
                                      con_dic={"work_id": str(work_id)})

                    sql.insert_workList(table_name='django_app_workhistory', data_dic=dataDic)
                sql.close();
        except:
            raise
        # D, G, R1

        return 'true'

    def admin_complete_check_abnormal(self, request):

        a = sqlMethod()
        try:
            user_name = request.user
            data = json.loads(request.body)
            work_id = data.get("work_id")
            group_id = data.get("group")
            work_stat = data.get("work_status")
            work_status = data.get("work_status")
            memo = data.get("memo")

            if (work_stat == dbinfo.status['status_work_run']) or (work_stat == dbinfo.status['status_1cha_inspect_deagi']) or (work_stat == dbinfo.status['status_manage_return']):
                work_status = dbinfo.status['status_manage_return']

            elif (work_stat == dbinfo.status['status_1cha_inspect_run']) or (work_stat == dbinfo.status['status_2cha_inspect_deagi']) or (work_stat == dbinfo.status['status_1cha_man_companion_return']):
                work_status = dbinfo.status['status_1cha_man_companion_return']
            print("이상행동관리자작업환경", work_status)
            print("이상행동관리자작업번호", work_id)
            a.update_status(table_name='django_app_worklist', data_dic={'work_status': work_status},
                            con_dic={'work_id': work_id})
            dic = {'work_id': work_id,
                   'work_status': work_status,
                   'reg_id': str(user_name),
                   'memo': memo,
                   'reg_date': str(datetime.now()),
                   'group_id': group_id
                   }
            print(dic)

            query_set_2 = a.insert_workList(table_name='django_app_workhistory', data_dic=dic)
            a.close()
        except Exception as e:
            a.close()
            raise

#task_inspect2_complete_check
    def task_cancel(self, request, task_num):

        user_name = request.user

        try:

            sql_query = sqlMethod()

            update_val = {"work_status": dbinfo.status['status_work_deagi'], "worker_id": ""}
            update_con = {"work_id": str(task_num)}

            sql_query.update_status(table_name="django_app_worklist", data_dic=update_val, con_dic=update_con)

            print("update 성공 ")

            del_val = {"work_id": str(task_num)}
            del_option = "and reg_date > (select Min(reg_date) from (select reg_date from django_app_workhistory where work_id = '" + str(
                task_num) + "' order by reg_date asc) a)"
            sql_query.delete(table_name="django_app_workhistory", data_dic=del_val, option=del_option)

            print("delete_history")

            sql_query.delete(table_name="django_app_tasklist", data_dic=del_val, option=None)
            print("delete_tasklist")

            sql_query.close()
            return True



        except:

            sql_query.close()
            return False

    ## 작업 완료 시 JSON 정보와 저장 정보를 마무리 하는 기능
    def task_inspect2_complete_check(self, request, task_num):

        try:
            user_name = request.user
            json_data = json.loads(request.body)
            group_id = json_data.get("group")
            ## 작업 완료
            # query_set_ = WorkList.objects.filter(task_num=task_num, task_status=porocess_status['작업 진행'],
            #                                      task_user_id=user_name)
            a = sqlMethod()
            query_set = a.select_workList(table_name='django_app_worklist',
                                          data_dic={'work_id': str(task_num), 'inspect_id2 ': str(user_name)},
                                          status_list={dbinfo.status['status_2cha_inspect_run']})

            print(query_set)

            if query_set:


                a = sqlMethod()
                a.update_status(table_name='django_app_worklist', data_dic={'work_status': dbinfo.status['status_3cha_inspect_deagi']},
                                con_dic={'work_id': str(task_num)})
                a.close()

                a = sqlMethod()
                dic = {'work_id': str(task_num), 'work_status': dbinfo.status['status_3cha_inspect_deagi'], 'reg_id': str(user_name),
                       'reg_date': str(datetime.now()), 'group_id': group_id}
                a.insert_workList(table_name='django_app_workhistory', data_dic=dic)

                # history_complete.save()
                a.close()
        except:
            raise


    #관리자 클립 반려 메모 저장 및 상태 바꾸기
    def admin_task_inspect(self, request):
        sql = sqlMethod()

        data = json.loads(request.body)
        work_id = str(data.get("work_id"))
        task_id = str(data.get("task_id"))
        reject_memo = str(data.get("reject_memo"))

        try:
            if len(reject_memo) != 0:
                reject_status = 'Y'
            else:
                reject_status = 'N'

            data_dic = {
                'reject_memo' : reject_memo,
                'reject_status' : reject_status
            }
            con_dic = {
                'work_id' : work_id,
                'task_id' : task_id
            }
            sql.update_status(table_name='django_app_tasklist', data_dic=data_dic, con_dic=con_dic)

            sql.close()
        except:
            sql.close()
            raise

    # 검수자 클립 반려 메모 저장 및 상태 바꾸기
    def task_inspect(self, request):
        sql = sqlMethod()

        data = json.loads(request.body)
        work_id = str(data.get("work_id"))
        task_id = str(data.get("task_id"))
        reject_memo = str(data.get("reject_memo"))

        try:
            if len(reject_memo) != 0:
                reject_status = 'Y'
            else:
                reject_status = 'N'

            data_dic = {
                'reject_memo' : reject_memo,
                'reject_status' : reject_status
            }
            con_dic = {
                'work_id' : work_id,
                'task_id' : task_id
            }
            sql.update_status(table_name='django_app_tasklist', data_dic=data_dic, con_dic=con_dic)

            sql.close()
        except:
            sql.close()
            raise