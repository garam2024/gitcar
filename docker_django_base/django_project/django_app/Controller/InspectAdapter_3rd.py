from django.contrib import auth
from django.contrib.auth.models import User
## auth Check import

from django.contrib.auth.hashers import check_password
## Password Check import
from ..models import *
from datetime import datetime

from PIL import Image

from .sqlMethod import *

import json, bson, os

from .status_dic import porocess_status, record_status, deny_status, pay_status
from db_info import dbinfo


class InspectAdapter_3rd:

    def __init__(self):

        self.res_dic = {}

    ## 검수 페이지에서 신청 가능한 검수 목록 데이터를 가져오는 로직
    def get_inspect_list(self, request):

        # query_set = WorkList.objects.all()
        try:
            ## 작업이 완료되었을 경우에 해당하는 데이터를 먼저 가져온다.
            sql_query = sqlMethod()
            # 로그인 사용자 등록 회사 검색
            select_group_id = sql_query.select_workList(table_name='django_app_profile', column_list=['group_id'],
                                                        data_dic={"account_id": str(request.user)}, option=None)
            column_list = [
                "work_id",
                "work_type",
                "work_status",
                "(select code_nm  from django_app_code_mst where code_id = work_status)  work_status_nm",
                "(select code_nm  from django_app_code_mst where code_id = work_type) work_type_nm",
            ]
            option = "and (select dap.group_id from django_app_profile dap where dap.account_id = '" + str(
                request.user) + "') = group_id order by work_id limit 10"
            inspect_list = sql_query.select_workList(table_name='django_app_worklist', data_dic={
                'work_status': dbinfo.status['status_3cha_inspect_deagi'], "group_id": select_group_id[0]['group_id']}, status_list=None, column_list=column_list,
                                                     option=option)
        except:
            raise

        # filter_inspect_list = []

        # ## 작업 승인이 된 경우에만 검수 리스트에 나타나야하므로 조건에 해당하는 데이터만 list에 추가
        # for item in inspect_list :

        #     record = WorkRecord.objects.filter(work_category = "Q", work_state = "True", worklist_task_num_id = item.task_num)

        #     if record.exists() :

        #         filter_inspect_list.append(item)

        return zip(range(1, len(inspect_list) + 1), inspect_list)

    # def mirror_db(self, request, task_num):
    #
    #     print("작업 기록 테이블 --> 검수 기록 테이블에 해당 데이터들을 미러링")
    #
    #     get_task_record = WorkRecord.objects.filter(work_category = record_status['2차 검수 완료'], task_num = task_num).order_by('reg_date').last()
    #     get_inspect_record = WorkRecord.objects.filter(work_category = record_status['3차 검수 신청'], task_num = task_num).order_by('reg_date').last()
    #
    #     inspect_history_check_query = InspectHistory.objects.filter(work_num_id = get_inspect_record.id)
    #
    #     if inspect_history_check_query.exists():
    #
    #         ## 이미 검수 기록 테이블에 데이터가 있는 경우이므로 미러링 실패
    #         print("Query Check DB Mirror Failed")
    #
    #     else :
    #
    #          ## inspect_history가 존재하지 않는 경우
    #
    #         task_history_key = get_task_record.id
    #         inspect_history_key = get_inspect_record.id
    #
    #         task_history_set = TaskHistory.objects.filter(work_num_id = task_history_key)
    #         # task_history_set = TaskHistory.objects.filter(work_num_id = task_history_key).order_by('task_image_num')
    #
    #         user_name = request.user
    #
    #         ## 검수 기록 테이블에 데이터가 존재하지 않는 경우이므로 테이블 데이터 미러링 로직 구동
    #         for count, item in enumerate(task_history_set, start = 1) :
    #
    #             inspect_history_set = InspectHistory()
    #
    #             inspect_history_set.work_num_id = inspect_history_key
    #             inspect_history_set.work_fold_path = item.work_fold_path
    #             inspect_history_set.inspect_data = item.task_data
    #             inspect_history_set.inspect_image_num = item.task_image_num
    #             inspect_history_set.inspector_id = user_name
    #             inspect_history_set.reg_date = datetime.now()
    #
    #             print("**** DB INSERT COUNT : ", str(count))
    #
    #             inspect_history_set.save()

    ##  나의 작업 페이지에서 검수 리스트 데이터를 가져옴
    def get_my_inspect_list(self, request):

        work_list_all = WorkList.objects.all()
        get_user_name = request.user

        # task_list = work_list_all.filter(inspect_status_3 = porocess_status['3차 검수 진행'], inspect_user_id_3 = get_user_name)

        try:
            sql_query = sqlMethod()
            join_column = {" * , "
                           "(select dacm.code_nm from django_app_code_mst dacm where dacm.code_id = daw.work_status ) str_status, "
                           "(select dacm.code_nm from django_app_code_mst dacm where dacm.code_id = daw.work_type) str_type "}
            dic = {
                "daw.work_status": dbinfo.status['status_3cha_inspect_run'],
                "daw.inspect_id3": str(get_user_name)
            }
            task_list = sql_query.select_workList(table_name="django_app_worklist daw", data_dic=dic, status_list=None,
                                                  column_list=join_column, option=None)
            sql_query.close()

        except:
            raise

        return zip(range(1, len(task_list) + 1), task_list)

    ## 검수 신청 시 로직 구동
    def change_db_info(self, request, user_name, task_num):

        # work_record_1st_inspec = WorkRecord.objects.filter(task_num = task_num, work_category = record_status['3차 검수 신청'])
        # check_query = WorkRecord.objects.filter(task_num = task_num, work_category = record_status['2차 검수 신청'])

        # check_inspect = WorkList.objects.filter(inspect_status_2 = porocess_status['3차 검수 진행'], inspect_user_id_3 = request.user)
        try:
            sql_query = sqlMethod()
            check_inspect_dic = {
                "work_status": dbinfo.status['status_3cha_inspect_deagi'],
                "inspect_id3": str(request.user)
            }
            check_inspect = sql_query.select_workList(table_name="django_app_worklist", data_dic=check_inspect_dic,
                                                      status_list=None)
            ## 똑같은 같은 검수 작업이 2개 이상 신청될 수 없도록 하는 로직

            if len(check_inspect) > 0:
                sql_query.close()
                return 304

            ## inspect_query = WorkList.objects.get(task_num = task_num)
            inspect_dic = {"work_id": task_num}
            inspect_query = sql_query.select_workList(table_name="django_app_worklist", data_dic=inspect_dic,
                                                      status_list=None)
        except:
            raise

        # inspector_name = str(inspect_query.inspect_user_id_2)
        inspector_name = str(inspect_query[0].get("inspect_id3"))

        tasker_name = str(inspect_query[0].get("worker_id"))
        inspector_name_1st = str(inspect_query[0].get("inspect_id1"))
        inspector_name_2nd = str(inspect_query[0].get("inspect_id2"))
        inspect_group_id = str(inspect_query[0].get("group_id"))

        if not tasker_name == request.user or \
                not inspector_name_1st == request.user or \
                not inspector_name_2nd == request.user or \
                not inspector_name or inspector_name == 'None':

            ## 검수 체크 로직 구동
            # if inspector_name == request.user :



            # work_record = WorkRecord()
            #
            # # get_task_info = query_set.filter(task_num = task_num)
            # work_list_info = WorkList.objects.get(task_num = task_num)
            # work_list_info.inspect_status_3 = porocess_status['3차 검수 진행']
            # work_list_info.inspect_user_id_3 = user_name
            # work_list_info.inspect_start_date_3 = datetime.now()
            #
            # task_unique_number = work_list_info.task_num
            #
            # work_record.worklist_task_num_id = task_unique_number
            # work_record.task_num = task_num
            # work_record.work_category = record_status['3차 검수 신청']
            # work_record.reg_id = user_name
            # work_record.reg_date = datetime.now()
            #
            # work_list_info.save()
            # work_record.save()
            try:
                now = datetime.now().strftime("%Y%m%d %H%M%S")
                set_dic = {
                    "work_status": dbinfo.status['status_3cha_inspect_deagi'],
                    "inspect_id3": str(request.user),
                }
                update_dic = {
                    "work_id": task_num
                }
                sql_query.update_status(table_name="django_app_worklist", data_dic=set_dic, con_dic=update_dic)

                insert_dic = {
                    "work_id": task_num,
                    "work_status": dbinfo.status['status_3cha_inspect_deagi'],
                    "reg_id": str(request.user),
                    "reg_date": now,
                    "group_id": inspect_group_id
                }
                sql_query.insert_workList(table_name="django_app_workhistory", data_dic=insert_dic)

                sql_query.close()
                return True
            except:
                raise

        else:

            ## 잘못된 접근인 경우
            if inspector_name != request.user:
                sql_query.close()
                return 404
            sql_query.close()

        # ## 해당하는 Query가 없는 경우
        # else:
        #     print("Inspect DB Query INSERT EVENT")

        #     work_record = WorkRecord()

        #     # get_task_info = query_set.filter(task_num = task_num)
        #     work_list_info = WorkList.objects.get(task_num = task_num)
        #     work_list_info.inspect_status_2 = porocess_status['3차 검수 진행']
        #     work_list_info.inspect_user_id_3_2 = user_name
        #     work_list_info.inspect_start_date_2 = datetime.now()

        #     task_unique_number = work_list_info.task_num

        #     work_record.worklist_task_num_id = task_unique_number
        #     work_record.task_num = task_num
        #     work_record.work_category = record_status['3차 검수 신청']
        #     work_record.reg_id = user_name
        #     work_record.reg_date = datetime.now()

        #     work_list_info.save()
        #     work_record.save()

        #     return True

    ## 유저 정보에 해당하는 검수 리스트 데이터를 가져오는 로직
    def get_inspect_info(self, request, user_name, task_num):

        # work_list_all = WorkList.objects.all()
        #
        # work_list_info = work_list_all.filter(inspect_status_2 = porocess_status['3차 검수 진행'], inspect_user_id_3 = user_name, task_num = task_num)
        #
        # return work_list_info
        try:
            sql_query = sqlMethod()
            data_dic = {
                "work_status": dbinfo.status['status_3cha_inspect_deagi'],
                "inspect_id3": str(user_name),
                "work_id": task_num
            }
            work_list_info = sql_query.select_workList(table_name="django_app_worklist", data_dic=data_dic,
                                                       status_list=None)
            sql_query.close()
            return work_list_info[0]
        except:
            raise

    ## 재 작업 시 로직 구동
    def rework_logic(self, request, user_name, task_num):

        try:


            # query = WorkRecord.objects.filter(task_num = task_num, work_category= record_status['2차 검수 신청'], reg_id = user_name)
            sql_query = sqlMethod()
            data_dic = {
                "work_id": task_num,
                "work_status": dbinfo.status['status_3cha_inspect_deagi'],
                "reg_id": user_name
            }
            query = sql_query.select_workList(table_name="django_app_workhistory", data_dic=data_dic, status_list=None)



            if len(query) != 0:

                sql_query.close()
                return 4

            else:

                sql_query.close()
                return 5

        except:

            sql_query.close()
            return False

    ## 검수 작업 중 중간에 취소하기 위한 로직
    def inspect_middle_cancel(self, request, task_num):



        user_name = request.user

        try:
            query_set = WorkList.objects.get(inspect_status_2=porocess_status['3차 검수 진행'], inspect_user_id_3=user_name,
                                             task_num=task_num)

            worklist_key = query_set.task_num

            query_set_check = WorkRecord.objects.filter(work_category=record_status['3차 검수 신청'], reg_id=user_name,
                                                        worklist_task_num_id=worklist_key)
        except:
            raise

        if query_set_check.exists():

            task_unique_number = query_set.task_num

            workrecord = WorkRecord()

            workrecord.worklist_task_num_id = task_unique_number
            workrecord.task_num = task_num
            workrecord.work_category = record_status['3차 검수 취소']
            workrecord.reg_id = user_name
            workrecord.reg_date = datetime.now()

            workrecord.save()

            query_set.inspect_status_2 = porocess_status['3차 검수 대기']
            query_set.inspect_user_id_3 = 'None'

            query_set.complete_check = porocess_status['3차 검수 대기']

            query_set.save()



            return True

        else:



            return False

    ## 검수 작업 취소 기능 로직
    def inspect_cancel(self, request, task_num):

        user_name = request.user

        # query_set = WorkList.objects.get(inspect_status_3 = porocess_status['3차 검수 진행'], inspect_user_id_3 = user_name, task_num = task_num)
        #
        # worklist_key = query_set.task_num
        #
        # query_set_check = WorkRecord.objects.filter(work_category = record_status['3차 검수 신청'], reg_id = user_name, worklist_task_num_id = worklist_key)
        #
        # if query_set_check:
        #     print("inspect_cancel activate")
        #
        #     query_set_add = WorkRecord.objects.filter(work_category = record_status['3차 검수 신청'], reg_id = user_name, worklist_task_num_id = worklist_key).last()
        #
        #     query_set_add.work_category = record_status['3차 검수 취소']
        #     query_set_add.reg_date = datetime.now()
        #
        #     query_set.inspect_status_3 = porocess_status['3차 검수 대기']
        #     query_set.inspect_user_id_3 = 'None'
        #
        #     query_set.complete_check = porocess_status['3차 검수 대기']
        #
        #     query_set_add.save()
        #     query_set.save()

        try:

            sql_query = sqlMethod()

            update_val = {"work_status": dbinfo.status['status_3cha_inspect_deagi'], "inspect_id3": ""}
            update_con = {"work_id": str(task_num)}

            sql_query.update_status(table_name="django_app_worklist", data_dic=update_val, con_dic=update_con)



            del_val = {
                "work_id": str(task_num),
                "reg_id": str(user_name)
            }

            sql_query.delete(table_name="django_app_workhistory", data_dic=del_val, option=None)


            sql_query.close()
            return True

        except:

            sql_query.close()
            return False

    ## 같은 작업자가 작업과 검수를 동시에 할 수 없도록 처리하는 로직
    def get_compare_result(self, request, task_num):

        try:
            sql_query = sqlMethod()
            data_dic = {"work_id": task_num}
            get_info = sql_query.select_workList(table_name="django_app_worklist", data_dic=data_dic, status_list=None)

            # tasker_id = get_info.task_user_id
            user_id = request.user


            worker_id = get_info[0].get("worker_id")
            inspector_1st_id = get_info[0].get("inspect_id1")
            inspector_2nd_id = get_info[0].get("inspect_id2")

            if str(worker_id) == str(user_id) or \
                    str(inspector_1st_id) == str(user_id) or \
                    str(inspector_2nd_id) == str(user_id):
                sql_query.close()
                return False

            else:
                sql_query.close()
                return True
        except:
            raise

    ## 작업 완료 시 JSON 정보와 저장 정보를 마무리 하는 기능
    def inspect_complete_check(self, request, task_num, work_type):
        a = sqlMethod()
        try:
            ## decode() 시 "\ufeff" 같은 문제가 붙는 문제를 해결하기 위해 sig를 추가한 utf-8-sig를 적용
            ## ex) ['\ufeffmain text','next text'] --> utf-8
            ## ex) ['main text','next text'] --> utf-8-sig

            # get_json_data = json.loads(request.body.decode('utf-8-sig'))
            # get_json_images = bson.dumps(get_json_data)
            user_name = request.user

            ## 검수인 경우
            ## 작업을 검수보다 먼저 확인할 경우 검수 로직이 동작하기 어려우므로 검수 로직을 먼저 검사
            ## 검수 중인지 확인하는 로직을 먼저 구성해서 objects.get으로 쿼리를 돌려서 없을 경우 except로 로직을 돌려서 처리함

            # inspect_history = WorkRecord.objects.get(inspect_status = "B", task_num = task_num)

            # query_set = WorkList.objects.get(inspect_status=porocess_status['1차 검수 진행'], inspect_user_id=request.user,
            # task_num=task_num)

            data = json.loads(request.body)
            work_id = data.get("work_id")
            group_id = data.get("group")
            work_stat = data.get("work_stat")
            memo = data.get("memo")
            memo_stat = data.get("memo_stat")
            work_status = ""
            if work_stat == dbinfo.status['status_1cha_inspect_run']:
                if memo_stat:
                    work_status = dbinfo.status['status_2cha_inspect_deagi']
                else:
                    work_status = dbinfo.status['status_2cha_inspect_deagi']
            elif work_stat == dbinfo.status['status_3cha_inspect_run']:
                if memo_stat:
                    work_status = dbinfo.status['status_complet']
                else:
                    work_status = dbinfo.status['status_3cha_companion_return']
            a.update_status(table_name='django_app_worklist', data_dic={'work_status': work_status},
                            con_dic={'work_id': work_id})
            if not memo_stat:
                tmp_list = memo.split("/")

                for tmp_str in tmp_list:
                    if len(tmp_str) != 0:

                        tmp_num = str(tmp_str).strip()[3]
                        a.update_status(table_name='django_app_tasklist', data_dic={'reject_status': 'Y'},
                                        con_dic={'work_id': work_id, 'task_id': tmp_num})

            # save_json_data = json.loads(request.body)
            # json_save_path = settings.MEDIA_ROOT + '/django_app' + '/json' + '/final_json'

            # if not os.path.exists(json_save_path):
            #     os.makedirs(json_save_path)

            # with open(json_save_path +'/'+ task_num + ".json",  "w" , encoding = "utf-8") as json_file:

            #     json_file.write(json.dumps(save_json_data, ensure_ascii=False, indent="\t"))
            #     json_file.close()

            ## 검수 완료 시 검수 내용을 저장함

            # query_set.inspect_status = porocess_status['1차 검수 완료']
            # query_set.complete_check = porocess_status['1차 검수 완료']
            # query_set.inspect_end_date = datetime.now()
            # query_set.inspect_status_2 = porocess_status['2차 검수 대기']

            # task_number = query_set.work_id

            # image_count = query_set.image_count

            # query_set.save()

            ## WorkRecord Table Info Change
            # get_history_key = WorkRecord.objects.filter(worklist_task_num_id=task_number,
            # work_category=record_status['1차 검수 신청'],
            # task_num=task_num).order_by('reg_date').last()
            # history_key = get_history_key.id

            # query_set_2 = WorkRecord()


            dic = {'work_id': work_id,
                   'work_status': work_status,
                   'reg_id': str(user_name),
                   'memo': memo,
                   'reg_date': str(datetime.now()),
                   'group_id': group_id
                   }


            query_set_2 = a.insert_workList(table_name='django_app_workhistory', data_dic=dic)
            # query_set_2.worklist_task_num_id = task_number
            # query_set_2.work_category = record_status['1차 검수 완료']
            # query_set_2.reg_id = user_name
            # query_set_2.reg_date = datetime.now()
            # query_set_2.task_num = task_num

            # query_set_2.save()

            a.close()

            # #print("Image Count : ", image_count)

            ## Binary To String 변환 함수
            # def return_string(*argument):

            #     input_data = bytes(*argument, 'utf8')
            #     output_data = input_data.decode('utf-8')

            #     return output_data

            # query_set_3 = InspectHistory()

            # #print("id : ", get_json_data.get('id'))
            # #print('name : ', get_json_data.get('name'))
            # #print('width : ', get_json_data.get('width'))
            # #print('height : ', get_json_data.get('height'))
            # #print('scaleX : ', get_json_data.get('scaleX'))
            # #print('scaleY : ', get_json_data.get('scaleY'))
            # #print('path : ', get_json_data.get('path'))
            # #print('length : ', get_json_data.get('length'))
            # #print('type : ', get_json_data.get('type'))
        except Exception as e:
            a.close()
            raise




