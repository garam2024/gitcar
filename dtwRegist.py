import os
import subprocess
from datetime import datetime


import psycopg2
import psycopg2.extras
import re
import xml.etree.ElementTree as elemTree
from xml.etree.ElementTree import parse
import json

class sqlMethod:
    #생성자
    def __init__(self):
        # nhn 52
        self.conn = psycopg2.connect("dbname='gaic_db' user='gaic' host='133.186.146.169' port='15502' password='gaic123!@#' ")
        ## bts 52
        # self.conn = psycopg2.connect( "dbname='gaic_db' user='gaic' host='175.201.6.4' port='15502' password='gaic123!@#' ")

        if self.conn == False:
            raise ConnectionError("## DB connection pool created Fail")

        self.cursor = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        print("db connection..ok")

    def select_workList(self, table_name, data_dic, status_list=None, column_list=None, option = None):
        # conn = psycopg2.connect(dbinfo.conn_info)

        sql = "select "
        if column_list != None:
            sql += ",".join(column_list)
        else:
            sql += " * "
        sql += " from " + table_name
        where = " where 1 = 1"

        for key, value in data_dic.items():
            where += " and " + key + " = '" + value + "'"

        if status_list != None:
            status_str = "','".join(status_list)
            where += " and work_status in ('" + status_str + "')"

        if option != None:
            where += " " + option

        sql += where + ";"

        print(sql)
        self.cursor.execute(sql)
        result = self.cursor.fetchall()

        # self.conn.commit()
        # self.conn.close()

        result_dic =[]
        for data in result:
            result_dic.append(dict(data))
        return result_dic

    def update_status(self, table_name, data_dic, con_dic):
        # conn = psycopg2.connect(dbinfo.conn_info)
        # cursor = conn.cursor()
        try :
            cnt1 = 0
            set_query = " set "
            for key, value in data_dic.items():
                set_query += key + " = '" + value + "'"
                cnt1 += 1
                if len(data_dic) > cnt1:
                    set_query += ","
            where_query = " where 1=1 "
            for key, value in con_dic.items():
                where_query += " and " + key + " = '" + value + "'"
            sql = "update " + table_name + set_query + where_query + ";"

            self.cursor.execute(sql)
            print(sql)
        except :
            self.conn.rollback()
            raise
        # self.conn.commit()
        # self.conn.close()

    # sqlMappid  : xml파일명.수행아이디
    # Mabatis (차후 psycopg2를 Mabatis로 변경할 것)
    # sqlMapperid : filename.(select, update, delete IdName)

    def insert_workList(self, table_name, data_dic):
        # conn = psycopg2.connect(dbinfo.conn_info)
        # cursor = conn.cursor()
        try :
            sql = "insert into " + table_name
            tmp_query1 = " ("
            tmp_query2 = " ("
            cnt = 0
            print(data_dic)

            for key in data_dic.keys():
                tmp_query1 += key
                if '@$' in str(data_dic[key]):
                    tmp_str=re.sub("[-=+,#/\?:^$.@*\"※~&%ㆍ!』\\‘|\[\]\<\>`…》]", "", data_dic[key])
                    tmp_query2 += tmp_str
                else :
                    tmp_query2 += "'" + data_dic[key] + "'"
                cnt += 1
                if len(data_dic) > cnt:
                    tmp_query1 += ","
                    tmp_query2 += ","
            tmp_query1 += ")"
            tmp_query2 += ")"

            sql += tmp_query1 + " values" + tmp_query2 + ";"
            print(sql)

            self.cursor.execute(sql)
        except Exception as e:
            print(e)
            self.conn.rollback()
            raise
        # self.conn.commit()
        # self.conn.close()

    def get_select(self, sqlMapperid=None, parameter=None):
        sqlStr = self.getSql(sqlMapperid, "select")

        if sqlStr == "":
            raise ConnectionError("not Query parse error: %s" % sqlMapperid)

        # 변수 파싱
        for key in parameter:
            findStr = ("#{%s}" % key)
            while sqlStr.find(findStr) > -1:
                sqlStr = sqlStr.replace(findStr,  parameter[key] )

        while (sqlStr.find('[if test="') > -1):
            start_porint = sqlStr.find('[if test="')
            ifStrEnd = sqlStr.find('"]')
            end_point = sqlStr.find("[/if]")

            ifStr = sqlStr[start_porint + 10:ifStrEnd]  # <if test=' <--위치를 찾는다

            ifTrueStr = sqlStr[ifStrEnd + 3: end_point]

            sqlStrStart_Str = sqlStr[:start_porint]
            sqlStrend_str = sqlStr[end_point + 6:]

            if ifStr.find(" and ") > 0:  # and 연산자 처리
                ifStrArr = ifStr.split(" and ")
            else:
                ifStrArr = ifStr

            ifpro = "N"
            for ifStr in ifStrArr:
                if ifStr.find("==") > 0:
                    ifStrArr = ifStr.split("==")
                    print("%s == %s" % (parameter[ifStrArr[0].strip()], ifStrArr[1].strip()))

                    if parameter[ifStrArr[0].strip()] == ifStrArr[1].strip().replace("''", ""):
                        ifpro = "Y"
                    else:
                        ifpro = "N"

                if ifStr.find("!=") > 0:
                    ifStrArr = ifStr.split("!=")
                    print("%s != %s" % (parameter[ifStrArr[0].strip()], ifStrArr[1].strip()))

                    if parameter[ifStrArr[0].strip()] != ifStrArr[1].strip().replace("''", ""):
                        ifpro = "Y"
                    else:
                        ifpro = "N"

            if ifpro == "N":  # if값이 참이 아니면
                sqlStr = sqlStrStart_Str + sqlStrend_str
            else:
                sqlStr = sqlStrStart_Str + ifTrueStr + sqlStrend_str

        # sql 실행
        print(sqlStr)

        self.cursor.execute(sqlStr)
        result = self.cursor.fetchall()

        # 딕셔너리로 변환해서 반환
        result_dic = []
        for data in result:
            result_dic.append(dict(data))
        return result_dic

    def set_insertQuery(self, sqlMapperid=None, parameter=None):
        sqlStr = self.getSql(sqlMapperid,"insert")

        if sqlStr =="":
            raise ConnectionError("not Query parse error: %s" % sqlMapperid)

        #변수 파싱
        for key in parameter:
            findStr = ("#{%s}" % key)
            while sqlStr.find(findStr) > -1:
                sqlStr = sqlStr.replace( findStr, "'"+parameter[key]+"'")

        self.cursor.execute(sqlStr)

    def commit(self):
        self.conn.commit()

    def rollbak(self):
        self.rollbak()

    def close(self):
        self.conn.commit()
        self.conn.closed()
    #소멸자
    def __del__(self):
        try:
            self.conn.commit()
            self.conn.closed()
        except:
            pass

    def getSql(self, sqlMapperid, queryType = "select"):
        if sqlMapperid == None:
            raise Exception("XML mapper None error..")
        print("sqlMapperid:%s" % sqlMapperid)
        sqlInfo = sqlMapperid.split(".")
        sqlXml = parse("./%s.xml" % sqlInfo[0]).getroot()#xml파일읽기


        sqlStr = ""
        for selObj in sqlXml.findall(queryType):

            selid = selObj.attrib["id"]

            if selid == sqlInfo[1]:
                sqlStr = selObj.text
                break
        print("sql-->%s" %sqlStr )
        return sqlStr


def insert_work():
    try:
        print('______________________________insert_work 작동________________________________________')

        # 리눅스 명령어 실행 - 없는 것만 찾는 명령어
        # 결과 값에서 패스 수정
        # insert 명령문
        # find 경로
        path = r'/code/django_project/media/django_app/action_video/*.mp4'
        # subprocess.call(['find', path, '-name', '*_i'])

        # select_workList(self, data_dic, status_list)
        # insert_workList(self, table_name, data_dic)
        # update_status(self, status , work_id)

        # 읽기
        # path = '/mnt/disk2/vehicle_task_2/docker_django_base/django_project/media/django_app/action_video/' #어드민 파이 기준
        # #not
        # #find . -type f -and ! -name main.cpp -and ! -name *.h
        # print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        # cmd = ['sudo','find', path, ' -type f -and ! -name "*_Y.mp4"']
        # print("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
        # fd_popen = subprocess.Popen(cmd, stdout=subprocess.PIPE).stdout
        # print("###########################################################")
        # data = str(fd_popen.read().strip())
        # print("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        # fd_popen.close()
        # print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
        # file_name = r'*.mp4'
        # fd_popen = subprocess.Popen(['find',' /code/django_project/media/django_app/action_video/ -type f -and ! -name *_Y.mp4'], stdout=subprocess.PIPE).stdout
        org_file_path = '/vol1/media/django_app'
        folder_list = ['/action_video/dtw/']
        for key in folder_list:
            print("___________폴더 탐색 시작___________________________________________")
            command = "find " + org_file_path + key + " -type f -and ! -name '*_Y.mp4' -and ! -name '*.bcpf' -and ! -name '*.json'"
            # command = "find " + org_file_path + key + " -type f -and ! -name '*.bcpf' -and ! -name '*.json'"
            # print(command)
            fd_popen = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
            (stdoutdata, stderrdata) = fd_popen.communicate()
            print("____________폴더 탐색 끝_____________________________________")

            data = stdoutdata.decode('utf-8')
            data = data.replace("\n", "^")
            # print(stdoutdata)
            file_list = data.split("^")

            print("파일갯수 : ", len(file_list))

            sql = sqlMethod()
            for file in file_list:
                file_org_name = file.strip()
                if len(file_org_name) == 0:
                    continue

                # file_trans_name = file.replace('_Y.mp4', '.mp4')
                org_json_path = '/vol1/media/django_app/json/dtw/'
                command = "find " + org_json_path + " -type f -name '*"+file_org_name+"*.json' | wc -l"
                fd_popen = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
                (stdoutdata, stderrdata) = fd_popen.communicate()

                data_json_cnt = stdoutdata.decode('utf-8')
                if int(data_json_cnt) > 0:
                    continue

                # file_trans_name = file.replace('.mp4', '_Y.mp4')
                # print('파일 원본 비디오명 : ', file_org_name, ' 파일 변경 비디오명 : ', file_trans_name)
                # file_trans_name_last = file_trans_name.split('/')[-1]
                file_org_name_last = file_org_name.split('/')[-1]
                data_dic = {
                    # 'video_path': '/media/django_app' + key + file_trans_name_last,
                    'video_path': '/media/django_app' + key + file_org_name_last,
                }

                result = sql.select_workList('django_app_worklist', data_dic=data_dic, column_list=['work_id'])
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
                        'work_status': 'A',
                        'reg_id': 'admin',
                        'reg_date': now,
                        'group_id': group_id
                    }

                    history_dic = {
                        "work_id": "@$currval('django_app_worklist_task_num_seq')",
                        "work_status": 'A',
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
                    # os.rename(file_org_name, file_trans_name)
            print("작업 끝!")
            # return HttpResponse({'success' : True}, status = 200)
    except Exception as e:
        raise
        # return HttpResponse({'success' : False}, status = 200)
        sql.close()



insert_work();