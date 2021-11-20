from django.contrib import auth
from django.contrib.auth.models import User
## auth Check import

from django.contrib.auth.hashers import check_password
## Password Check import

from ..models import *
from .status_dic import porocess_status, record_status, deny_status, pay_status
from .sqlMethod import sqlMethod
from db_info import dbinfo


class TaskAdapter:

    def __init__(self):

        self.res_dic = {}

    ## 라벨링 작업 목록 리스트 데이터를 가져오는 로직
    def get_task_list(self, request):

        try:
            query_set = WorkList.objects.all()

            task_list = query_set.filter(task_status=porocess_status['작업 대기'])

            return zip(range(1, len(task_list) + 1), task_list)
        except:
            raise

    def get_abnormal_task_list(self, request):

        try:
            query_set = WorkList.objects.all()

            task_list = query_set.filter(task_status=porocess_status['작업 대기'], work_type='이상행동')

            return zip(range(1, len(task_list) + 1), task_list)
        except:
            raise

    # 이상행동/인터페이스 동시검색
    def get_normal_work_list(self, request):

        sqlMethodClsss = sqlMethod()

        # table_name = "((select work_id,work_type,work_status, "+\
        # "(select code_nm  from django_app_code_mst where code_id = work_status)  work_status_nm,"+\
        # "(select code_nm  from django_app_code_mst where code_id = work_type) work_type_nm "+\
        # " from django_app_worklist where 1 = 1 and work_status in ('A') "+\
        # "and (select dap.group_id from django_app_profile dap where dap.account_id ='" +str(request.user)+ "') = group_id "+\
        # "and work_type = 'interface' limit 5) "+\
        # "union all "+\
        # "(select work_id,work_type,work_status, "+\
        # "(select code_nm  from django_app_code_mst where code_id = work_status)  work_status_nm, "+\
        # "(select code_nm  from django_app_code_mst where code_id = work_type) work_type_nm "+\
        # "from django_app_worklist "+\
        # "where 1 = 1 "+\
        # "and work_status in ('A') "+\
        # "and (select dap.group_id from django_app_profile dap where dap.account_id ='" +str(request.user)+ "') = group_id "+\
        # "and work_type = 'normal' limit 5) "+\
        # "order by work_id limit 10) a"
        # work_list = sqlMethodClsss.select_workList(table_name=table_name, data_dic ={"1":"1"})


        column = {"work_id, work_type, work_status,"
                  "(select code_nm from django_app_code_mst where code_id = work_status) work_status_nm,"
                  "(select code_nm from django_app_code_mst where code_id = work_type) work_type_nm"
                  }
        table = "django_app_worklist"
        status = {dbinfo.status['status_work_deagi']}
        option = "and (select dap.group_id from django_app_profile dap where dap.account_id ='" +str(request.user)+ "') = group_id order by work_id"
        work_list = sqlMethodClsss.select_workList(table_name=table, data_dic={}, status_list=status, column_list=column, option=option)
        sqlMethodClsss.close()

        return work_list

    def get_interface_task_list(self, request):

        try:
            query_set = WorkList.objects.all()

            task_list = query_set.filter(task_status=porocess_status['작업 대기'], work_type='인터페이스')
        except:
            raise

        return zip(range(1, len(task_list) + 1), task_list)

    ## 나의 작업 페이지의 데이터를 가져오는 로직
    def get_my_task_list(self, request):

        try:
            sql_query = sqlMethod()

            get_user_name = request.user

            ## 반려일 경우를 체크하기 위해 추가로 리스트를 생성해서 조합
            # task_list = query_set.filter(task_status = porocess_status['작업 진행'], task_user_id = get_user_name)

            deny_list = []
            join_column = {" * , "
                           "(select dacm.code_nm from django_app_code_mst dacm where dacm.code_id = daw.work_status ) str_status, "
                           "(select dacm.code_nm from django_app_code_mst dacm where dacm.code_id = daw.work_type) str_type, "
                           "(select count(dawh.work_status) from django_app_workhistory dawh where dawh.work_id = daw.work_id and dawh.work_status='"+dbinfo.status['status_1cha_companion_return']+"') work_his"}
            dic = {
                "daw.worker_id": str(get_user_name)
            }
            option = "and daw.work_status in('" + dbinfo.status['status_work_run'] + "')"
            task_list = sql_query.select_workList(table_name="django_app_worklist daw", data_dic=dic, status_list=None,
                                                  column_list=join_column, option=option)
            print(sql_query)
            sql_query.close()
        except:
            pass

        for item in task_list:



            # record_key = WorkRecord.objects.filter(worklist_task_num_id = item.task_num, work_category = record_status['작업 신청']).order_by('reg_date').last()

            try:
                sql_query = sqlMethod()
                dic = {"work_id": str(item.get('work_id'))}
                option = "order by reg_date desc limit 1"
                record_key = sql_query.select_workList(table_name="django_app_workhistory", data_dic=dic,
                                                       status_list=None, option=option)

                sql_query.close()

                # deny_check = DenyReason.objects.filter(record_num_id = record_key.id)
            except:
                raise

            if len(record_key) > 0:

                try:
                    sql_query = sqlMethod()
                    deny_dic = {"history_id": str(record_key[0].get("history_id"))}
                    deny_option = "and memo is not null"
                    deny_check = sql_query.select_workList(table_name="django_app_workhistory", data_dic=deny_dic,
                                                           status_list=None, option=deny_option)

                    sql_query.close()

                    if len(deny_check) > 0:

                        # check_message = "Yes"
                        # deny_list.append(check_message)
                        deny_list.append(deny_check[0].get("memo"))


                    else:
                        check_message = "NO"
                        deny_list.append(check_message)

                except:
                    raise

        return zip(task_list, deny_list)

