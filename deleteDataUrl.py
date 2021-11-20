# -*- coding: utf-8 -*-
#저장된 tasklist 데이터에서

import psycopg2
import psycopg2.extras
import xml.etree.ElementTree as elemTree
from xml.etree.ElementTree import parse
import json

class SqlMapper:
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


class deteDataUrl:

    def __init__(self):
        self.res_dic = {}

    def change_task_data(self, work_id):
        sql = SqlMapper();
        # data_dic = {"work_id": work_id}
        option = " and task_data::text like '%data:image/jpeg;base64%'"
        try:
            get_task_list = sql.select_workList(table_name="django_app_tasklist", data_dic={}, option=option)

            for task_data in get_task_list:
                con_dic = {'work_id': str(task_data.get('work_id')), 'task_id': str(task_data.get('task_id'))}
                tmp_data = str(json.dumps(task_data.get('task_data')))
                print(type(tmp_data))
                isStat = False
                while tmp_data.find('data:image/jpeg;base64') > -1:
                    start = tmp_data.find('data:image/jpeg;base64')
                    end = tmp_data.find('", "skeleton"', start)
                    tmp_data = tmp_data[:start] + tmp_data[end:]
                    isStat = True
                print(tmp_data)
                print("--------------------------")
                print(json.loads(tmp_data))
                update_dic = {'task_data': tmp_data}
                if isStat:
                    sql.update_status(table_name="django_app_tasklist", data_dic=update_dic, con_dic=con_dic)
            sql.conn.commit()
        except:
            sql.conn.rollback()
            raise




ddt = deteDataUrl().change_task_data('0')
