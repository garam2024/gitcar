from django.apps import AppConfig
import psycopg2
from db_info import dbinfo
from django.conf import settings

class DjangoAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'django_app'

#rr
class StartupAppConfig(AppConfig):
    name = 'django_app'
    verbose_name = "Startup App"

    def ready(self):

        table_name = "django_app_code_mst"  
        data_dic = {}
        status_list = None
        column_list = {"code_id", "code_nm", "parent_id", "use_yn", "print_seq","program_var_nm"}
        option = " order by parent_id, code_id"
        
        from .Controller.sqlMethod import sqlMethod
        sql_query = sqlMethod()

        result = sql_query.select_workList(table_name, data_dic, status_list, column_list, option)

        result_dic =[]
        for data in result:
            result_dic.append(dict(data))
        
        # db code_mst : set global value to settings.py
        setattr(settings, 'GLOBAL_CODE', result_dic)

        for codeRow in result_dic:
            #print("=====================%s" % codeRow)
            #print("%s=%s" % (codeRow["program_var_nm"],codeRow["code_id"]))
            dbinfo.status[codeRow["program_var_nm"]] = codeRow["code_id"]
            dbinfo.message[codeRow["program_var_nm"]] = codeRow["code_nm"]

        #print(getattr(settings, 'GLOBAL_CODE', None))
        #print("======ffffff====ffff====%s" % dbinfo.status)
