import copy

import psycopg2
from xml.etree.ElementTree import parse
import json
from ..models import *
from datetime import datetime
import re

import django_app.Controller.status_dic
from ..apps import *
from db_info import dbinfo

class sqlMethod:
    def __init__(self):
        self.conn = psycopg2.connect(dbinfo.conn_info)
        self.cursor = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def select_workList(self, table_name, data_dic, status_list=None, column_list=None, option = None):
        # conn = psycopg2.connect(dbinfo.conn_info)
        # print(self)
        # print(table_name)
        # print(data_dic)
        # print(status_list)
        # print(column_list)
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
            self.cursor.execute(sql)
        except Exception as e:
            print(e)
            self.conn.rollback()
            raise
        # self.conn.commit()
        # self.conn.close()

    def update_status(self, table_name, data_dic, con_dic):
        # conn = psycopg2.connect(dbinfo.conn_info)
        # cursor = conn.cursor()
        print(data_dic.items())
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
            print(sql)
            self.cursor.execute(sql)
            print(sql)
        except :
            self.conn.rollback()
            raise
        # self.conn.commit()
        # self.conn.close()


    def delete(self, table_name, data_dic, option = None):
        # conn = psycopg2.connect(dbinfo.conn_info)
        # cursor = conn.cursor()
        try:
            sql = "delete from " + table_name
            where_sql = " where 1 = 1"
            for key, value in data_dic.items():
                where_sql += " and " + key + " = '" + value + "'"
            if option != None:
                where_sql += " " + option
            sql += where_sql + ";"
            self.cursor.execute(sql)
            print(sql)
        except:
            self.conn.rollback()
            raise
        # self.conn.commit()


    def close(self):
        self.conn.commit()
        self.conn.close()


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

        return sqlStr

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
                sqlStr = sqlStr.replace(findStr, parameter[key])

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
                ifStrArr = ifStr.split("((")

            ifpro = "N"

            ifcmd = []
            for ifStr in ifStrArr:
                if ifStr.find("==") > 0:
                    ifStrArr = ifStr.split("==")

                    ifstrOne = parameter[ifStrArr[0].strip()]
                    ifstrTow = ifStrArr[1].strip().replace("'", "")
                    if ifstrTow=='None':
                        ifstrTow = ''

                    print("[%s] == [%s]" % (ifstrOne, ifstrTow))

                    if ifstrOne == ifstrTow:
                        ifpro = "Y"
                    else:
                        ifpro = "N"
                    ifcmd.append(copy.deepcopy(ifpro))

                if ifStr.find("!=") > 0:
                    ifStrArr = ifStr.split("!=")

                    ifstrOne = parameter[ifStrArr[0].strip()]
                    ifstrTow = ifStrArr[1].strip().replace("'","")
                    if ifstrTow == 'None':
                        ifstrTow = ''

                    print("[%s] != [%s]" % (ifstrOne, ifstrTow))

                    if ifstrOne != ifstrTow:
                        ifpro = "Y"
                    else:
                        ifpro = "N"
                    ifcmd.append(copy.deepcopy(ifpro))

            #조건값이 참인지 거짓인지 판별
            ifpro = "N"
            for tif in ifcmd:
                if tif =="N":
                    ifpro = "N"
                    break
                else:
                    ifpro = "Y"

            if ifpro =="N" :  # if값이 참이 아니면
                sqlStr = sqlStrStart_Str + sqlStrend_str
            else:
                sqlStr = sqlStrStart_Str + ifTrueStr + sqlStrend_str

        #sql 실행 $[211115 주석처리]
        #print(sqlStr)

        self.cursor.execute(sqlStr)
        result = self.cursor.fetchall()

        #딕셔너리로 변환해서 반환
        result_dic =[]
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

    def set_updateQuery(self, sqlMapperid=None, parameter=None):
        sqlStr = self.getSql(sqlMapperid,"update")

        if sqlStr =="":
            raise ConnectionError("not Query parse error: %s" % sqlMapperid)

        #변수 파싱
        for key in parameter:
            findStr = ("#{%s}" % key)
            while sqlStr.find(findStr) > -1:
                sqlStr = sqlStr.replace( findStr, "'"+str(parameter[key])+"'")
        print("sql-->%s" % sqlStr)

        self.cursor.execute(sqlStr)


    #소멸자
    def __del__(self):
        try:
            self.conn.commit()
            self.conn.closed()
        except:
            pass
