import subprocess
import os


import psycopg2
import psycopg2.extras

class sqlMethod:
    #생성자
    def __init__(self):
        # nhn 52
        self.conn = psycopg2.connect("dbname='gaic_db' user='gaic' host='133.186.146.169' port='11130' password='gaic123!@#' ")
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

    def close(self):
        self.conn.commit()
        self.conn.close()


#_Y빼기
def check_filenameY():
    try:
        print('______________________________insert_work 작동________________________________________')

        org_file_path = '/vol1/media/django_app/abnormal_video/gjac/'

        print("___________폴더 탐색 시작___________________________________________")
        # 지정한 폴더해서 해당 조건을 가진 파일을 탐색
        command = "find " + org_file_path + " -type f -name '*_Y.mp4'"
        # 파이썬에서 시스템 접근하는 코드?
        # 멀티 프로세싱 : 서로 협력하여 작업을 하고 있는 두 대 이상의 컴퓨터 중 한ㄷ ㅐ에 프로그램을 동적으로 할당하는 것을 의미
        fd_popen = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        (stdoutdata, stderrdata) = fd_popen.communicate()
        print("____________폴더 탐색 끝_____________________________________")
        data = stdoutdata.decode('utf-8')
        data = data.replace("\n", "^")
        file_list = data.split("^")

        notin_list = []
        in_list = []
        # 로컬에 있는 파일을 worklist 에 등록하는 작업 -> 등록된 작업의 파일의 이름을 db에서 변경한다음 로컬에서도 변경
        sql = sqlMethod()
        result = sql.select_workList('django_app_worklist', data_dic={}, column_list=['video_path'])
        sql.close()
        result_list=[]
        for i in result:
            result_list.append(i['video_path'])
        newfile_list = []
        for file in file_list:

            file = file.strip()
            file_org_name = file.replace("/vol1","")
            newfile_list.append(file_org_name)
        for new in newfile_list:
            if not new in result_list:
                file_trans_name = new.replace('_Y.mp4', '.mp4')
                notin_list.append(new)

                os.rename("/vol1"+new, "/vol1"+file_trans_name)
            else:
                in_list.append(new)

            
        # print("작업 끝!")
        #
        print("바뀐파일갯수 : ", len(notin_list))
        print("안바뀐거몇개 75개나와야함",len(in_list))
        # return HttpResponse({'success' : True}, status = 200)

    except Exception as e:
        print(e)




check_filenameY()
