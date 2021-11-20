from django.contrib import auth
from django.contrib.auth.models import User
## auth Check import

from django.contrib.auth.hashers import check_password
## Password Check import

from ..models import *
from .sqlMethod import *
from Crypto.Hash import SHA256


# import hashlib
## DB import


class UserAdapter:

    def __init__(self):

        self.res_dic = {}

    ## 로그인 기능 로직
    def login(self, request, user_id, user_pw):

        if request.method == "POST":

            login_check = auth.authenticate(request, username=user_id, password=user_pw)

            if login_check is not None:

                auth.login(request, login_check)

                return True

            else:

                return False

    # 유저 프로필 정보 GET
    def get_profile(self, request):

        try:

            a = sqlMethod()
            profile = a.select_workList(table_name="django_app_profile",data_dic={'account_id':str(request.user)},column_list={'account_id'})
            a.close()
            profile = profile[0]['account_id']
            print("request.user",request.user)
            print("profile", profile)
            return profile

        except:

            print("User Info 갱신 실패")
            a.close()
            return False
            raise

    # 로그아웃 기능 
    def logout(self, request):
        auth.logout(request)

    # 작업자 권한 확인
    def get_is_staff(self, request):
        try:
            ## DB 내 권한 체크 2가지가 필요
            # staff_check_1 = User.objects.get(username=request.user).is_staff
            # staff_check_2 = Profile.objects.get(account_id = request.user).is_staff
            sql_query = sqlMethod()
            user_dic = {
                "username": str(request.user)
            }
            column_list = {"is_staff"}
            profile_dic = {
                "account_id": str(request.user)
            }
            user_staff_check = sql_query.select_workList(table_name="auth_user", data_dic=user_dic, status_list=None,
                                                         column_list=column_list)
            profile_staff_check = sql_query.select_workList(table_name="django_app_profile", data_dic=profile_dic,
                                                            status_list=None, column_list=column_list)

            sql_query.close()
            print(user_staff_check)
            print(profile_staff_check)
            return user_staff_check[0].get("is_staff") and profile_staff_check[0].get("is_staff")
        except:

            is_staff = "False"
            sql_query.close()
            return is_staff
            raise

    # 검수자 권한 확인
    def get_is_inspector(self, request):

        try:
            # inspect_check_1 = Profile.objects.get(account_id = request.user).is_inspector
            #
            # if inspect_check_1 :
            #
            #     is_inspector = "True"
            #
            #     return is_inspector
            sql_query = sqlMethod()
            column_list = {"is_inspector"}
            profile_dic = {
                "account_id": str(request.user)
            }
            profile_inspector_check = sql_query.select_workList(table_name="django_app_profile", data_dic=profile_dic,
                                                                status_list=None, column_list=column_list)
            sql_query.close()
            print("_____________________________inspect___________________________")
            print(profile_inspector_check[0].get("is_inspector"))
            return profile_inspector_check[0].get("is_inspector")
        except:
            print("fail!!!!!!!!!!!!!!!!!!")
            print("inspector아님", request.user)
            is_inspector = "False"
            sql_query.close()
            return is_inspector
            raise

    # 관리자 권한 확인
    def get_is_superuser(self, request):
        # is_superuser = User.objects.get(username=request.user).is_superuser
        try:
            # is_superuser = Profile.objects.get(account_id = request.user).is_superuser
            # return is_superuser
            sql_query = sqlMethod()
            column_list = {"is_superuser"}
            profile_dic = {
                "account_id": str(request.user)
            }
            profile_inspector_check = sql_query.select_workList(table_name="django_app_profile", data_dic=profile_dic,
                                                                status_list=None, column_list=column_list)
            sql_query.close()

            print(type(profile_inspector_check[0].get("is_superuser")))

            return profile_inspector_check[0].get("is_superuser")
        except:

            is_superuser = "False"

            return is_superuser
            raise

    def get_group(self, request):

        try:
            sql_query = sqlMethod()
            column_list = {"group_id"}
            profile_dic = {
                "account_id": str(request.user)
            }
            profile_inspector_check = sql_query.select_workList(table_name="django_app_profile", data_dic=profile_dic,
                                                                status_list=None, column_list=column_list)
            sql_query.close()

            print(profile_inspector_check)

            return profile_inspector_check[0]

        except:

            print("group_id 가져오기 실패")

            return False
            raise

    def get_code_mst(self, request):
        try:
            sql_query = sqlMethod()

            column_list = {
                "code_nm",
                "program_var_nm",
                "code_id"
            }

            profile_dic = {
                "parent_id": 'status'
            }

            code_mst = sql_query.select_workList(table_name="django_app_code_mst", data_dic=profile_dic,
                                                                status_list=None, column_list=column_list)
            sql_query.close()

            print(type(code_mst))
            print(code_mst)

            return code_mst

        except:

            print("code_mst 가져오기 실패")

            return False
            raise