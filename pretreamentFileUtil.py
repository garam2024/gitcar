import psycopg2
import psycopg2.extras

import copy
import datetime
import os
import shutil
import xml.etree.ElementTree as elemTree
from xml.etree.ElementTree import parse
import paramiko
from scp import SCPClient, SCPException


import glob

class SqlMapper:
    #생성자
    def __init__(self):
        self.conn = psycopg2.connect("dbname='gaic_db' user='postgres' host='192.168.50.217' port='5432' password='gjac' ")

        if self.conn == False:
            raise ConnectionError("## DB connection pool created Fail")

        self.cursor = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        print("db connection..ok")

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

class SSHManager:

    def __init__(self):
        self.ssh_client = None

    def create_ssh_client(self, hostname, username, password):
        """Create SSH client session to remote server"""
        if self.ssh_client is None:
            self.ssh_client = paramiko.SSHClient()
            self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.ssh_client.connect(hostname, username=username, password=password)
        else:
            print("SSH client session exist.")

    def close_ssh_client(self):
        """Close SSH client session"""
        self.ssh_client.close()

    def send_file(self, local_path, remote_path):
        """Send a single file to remote path"""
        try:
            with SCPClient(self.ssh_client.get_transport()) as scp:
                scp.put(local_path, remote_path, preserve_times=True)
        except SCPException:
            raise SCPException.message

    def get_file(self, remote_path, local_path):
        """Get a single file from remote path"""
        try:
            with SCPClient(self.ssh_client.get_transport()) as scp:
                scp.get(remote_path, local_path)
        except SCPException: raise SCPException.message

    def send_command(self, command):
        """Send a single command"""
        stdin, stdout, stderr = self.ssh_client.exec_command(command)
        return stdout.readlines()

class utils:
    def inserJson(self, work_id, job_id, workerDir, filework):
        # json db 등록
        # 1.json 파일찾기
        json_file_list = glob.glob(workerDir + "/json/" + filework + "*")
        if len(json_file_list) > 0:  # json 파일이 있다
            # db에 *.mp4파일명으로 등록되어있는지 체크
            tempFilework = filework.replace(".mp4", "")
            param = {"video_path": ("/media/django_app/%s/%s/%s_Y.mp4" % (job_dir_list[job_id], work_id, tempFilework))}
            result = mapperSql.get_select("worklist.selectWorklist", param)
            if result["cnt"] == "0":  # 디비에 등록된 내역이 없으면 디비 등록한다.
                now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                data_dic = {
                    'work_type': 'interface' if 'action_video' in job_id else 'normal',
                    'video_path': param["video_path"],
                    'work_status': 'A',
                    'reg_id': 'admin',
                    'reg_date': now,
                    'group_id': work_id
                }

                history_dic = {
                    "work_id": "@$currval('django_app_worklist_task_num_seq')",
                    "work_status": "I",
                    "reg_id": "admin",
                    "reg_date": now,
                    "group_id": work_id
                }
                # 2. db에 mp4를 등록한다.
                mapperSql.set_insertQuery("worklist.insertWorklist", data_dic)
                mapperSql.set_insertQuery("worklist.insertHislist", history_dic)

                # 3. 등록번호를 취득한다.
                f = open(workerDir + "/json/" + tempFilework + ".json", 'r')
                task_data = f.readlines()

                task_dic = {
                    "associated_video_path": param["video_path"],
                    "task_data": task_data,
                    "work_id": param["work_id"],
                    "end_time": param["end_time"],
                    "start_time": param["start_time"],
                    "reg_id": param["video_path"],
                    "reject_status": 'N',
                    "group_id": work_id
                }

                resilt = mapperSql.get_select("worklist.selectKeyid")  # workLST

                # 4. 등록번호의 task 테이블에 json데이터를 등록한다.
                mapperSql.set_insertQuery("worklist.workinsert", task_dic)
                # 5. bts서버 json폴더로 파이을 scp로 복사한다.
                mapperSql.commit()

#job_list=['interface','normal'] # 인터페이스와 이상행동

job_list=['interface'] # 인터페이스와 이상행동
job_dir_list = {'normal':'abnormal_video/', 'interface': 'action_video/'}
#환경설정 --인터페이스
workList ={}
'''
workList['interface'] = {
            "tbit" : "/mnt/disk2/papa/ftp/files/processed_data/tbit",         #으뜸
            "dtw" : "/mnt/disk2/papa/ftp/files/processed_data/dtwocorp", #디투리
            "gjac" : "/mnt/disk2/papa/ftp/files/processed_data/gaic"          #광주인공지능센터
}
'''
workList['interface'] = {"tbit" : "D:/temp/data/processed_data/tbit"}


joblist= {}
'''
joblist['interface'] = {
    "processor_data_old" : "/mnt/disk2/papa/ftp/files/processed_data_old",
    "processor_data" : "/mnt/disk2/papa/ftp/files/processed_data",
}
'''
joblist['interface'] = {
    'processor_data' : "D:/temp/data/processed_data/tbit",
    'processor_data_old' : "D:/temp/data/processed_data_old/tbit",
}



jobScplist = {}

'''
jobScplist['interface'] = {
    "bts" : "/mnt/disk3/donggyeong/210913/media/django_app",                    #bts 운영데이터 (복사될 서버)
    "lovyis" : "/mnt/disk2/papa/ftp/files/processed_data"                      #ftp 원본 데이터
}
'''

jobScplist["interface"] = {"bts" : "/mnt"}

'''
#환경설정 --이상행동
workList['normal'] = {
            "tbit" : "/mnt/disk2/papa/ftp/files/processed_data/tbit",         #으뜸
            "dtw" : "/mnt/disk2/papa/ftp/files/processed_data/dtwocorp", #디투리
            "gjac" : "/mnt/disk2/papa/ftp/files/processed_data/gaic"          #광주인공지능센터
}
joblist['normal'] = {
    "processor_data_old" : "/mnt/disk2/papa/ftp/files/processed_data_old",
    "processor_data" : "/mnt/disk2/papa/ftp/files/processed_data",
}
jobScplist['normal'] = {
    "bts" : "/mnt/disk3/donggyeong/210913/media/django_app",                    #bts 운영데이터 (복사될 서버)
    "lovyis" : "/mnt/disk2/papa/ftp/files/processed_data"                      #ftp 원본 데이터
}
'''
ssh_manager = SSHManager()
#ssh bts 연결
#print("ssh bts 연결..")
#ssh_manager.create_ssh_client("175.201.6.4", "bts", "bts3770!") # 세션생성
print("ssh devl 연결..")
ssh_manager.create_ssh_client("192.168.50.217", "development", "gjac!@#") # 세션생성

#SQL TEST

mapperSql = SqlMapper()#sql 멥퍼
param= {
    'limit' : " limit 50 offset 50",
    'searchBgn':'',
    'searchEnd':'',
    'groupId'  :'all',
    'workerNm' : '',
    'workType' : '',
    'workStatus': ''
}
result = mapperSql.get_select("worklist.selectKeyidIfs", param)
print(result)
exit(0)


#파일찾기
try:
    print("파일 전처리 시작...")
    mapperSql = SqlMapper()#sql 멥퍼
    for job_id in job_list:
        server_type_path = ''
        if job_id == 'interface':
            server_type_path = 'action_video'
        else:
            server_type_path = 'abnormal_video'

        for work_id, workerDir in workList[job_id].items():
            print("작업아이디: %s 작업경로: %s" % (work_id, workerDir  ))
            file_list = os.listdir(workerDir+"/mp4")
            print("%s" % (file_list))

            file_list_mp4     = []


            for file_temp in file_list:
                if os.path.isfile(workerDir+"/mp4/"+file_temp):
                    if file_temp.endswith(".mp4"):
                        file_list_mp4.append(copy.deepcopy(file_temp))

            print("%s" % (file_list_mp4))

            print("작업아이디: %s 작업파일갯수: %d" % (work_id, len(file_list_mp4) ) )

            #mp4기준 bag파일이 2개 이상이면 합쳐서 bts로 복사 과 json파일 bts로 복사 후 오늘 날자 폴더 만들어서 이동한다.
            for filework in file_list_mp4:
                if work_id == 'tbit': # 으뜸
                    #bcpf 파일 찾기
                    bcpf_file_list = glob.glob(workerDir+"/bcpf/"+filework+"*")

                    print("%s" % (bcpf_file_list))


                    if len(bcpf_file_list)>1:
                        #bcpf 파일 합치기
                        fileCnt = 0
                        maxIndex = 0
                        for bcf_file in bcpf_file_list:
                            tree = elemTree.parse(bcf_file)
                            root = tree.getroot()
                            if fileCnt == 0 :
                                o_VideoItem = root.findall("VideoItem")
                                #for ii in o_VideoItem:
                                #    index = ii.attrib["Index"]
                                #    if int(index) > int(maxIndex) :
                                #        maxIndex = int(index)

                                fileCnt +=1;
                            else:
                                fileCnt +=1;

                                #append xml VideoItem
                                onexmlCnt = len(o_VideoItem)
                                x_VideoItem = root.findall("VideoItem")
                                for VideoItem in x_VideoItem:

                                    new_VideoItem = elemTree.Element("VideoItem")
                                    new_VideoItem.set("Index",onexmlCnt)
                                    new_VideoItem.set("Crc", '0')
                                    new_VideoItem.set("AudioIndex", '0')
                                    new_VideoItem.set("Start", VideoItem.attrib["Start"])
                                    new_VideoItem.set("End", VideoItem.attrib["End"])
                                    new_VideoItem.set("Title", VideoItem.attrib["Title"])
                                    new_VideoItem.set("File", VideoItem.attrib["File"])
                                    root.append(copy.deepcopy(new_VideoItem))
                                    print("%d: %s" % (onexmlCnt, VideoItem.attrib["Title"]))
                                    onexmlCnt += 1
                                #n번외 파일 복사 및 삭제
                                temp_bcf_file_arr = bcf_file.split("\\")
                                print("%s" % temp_bcf_file_arr)
                                targetFilename = joblist[job_id]['processor_data_old'] +"/bcpf/" + temp_bcf_file_arr[1]
                                print("%d번외 bcpf 파일 복사 및 삭제: %s" % (fileCnt,targetFilename) )
                                shutil.copy(bcf_file, targetFilename );
                                os.remove(bcf_file)
                        #print(root)
                        exit(0);

                        #xml파일저장
                        temp_file_name = filework.replace(".mp4", ".bcpf")
                        xml_new_file = workerDir + "/bcpf/" + temp_file_name
                        print("xml파일저장:%s" % xml_new_file)
                        tree.write(xml_new_file);

                        remote_file_name = jobScplist[work_id]['bts']+  "/action_xml/" + work_id + '/'+ xml_new_file
                        print("xml bts로 전송 :%s --> %s " %(xml_new_file, remote_file_name))
                        #xml bts로 전송
                        ssh_manager.send_file(xml_new_file, remote_file_name)  # 파일전송

                        print("#xml 파일삭제 .....:%s" % xml_new_file)
                        #xml 파일삭제
                        os.remove(xml_new_file)

                        temp_bcf_file_arr = bcf_file.split("\\")
                        bcfFilName = joblist['processor_data_old'] +'/'+ work_id+ "/bcpf/"+filework+"(1).bcpf"
                        print("#기존xml 1번파일 복사 및 삭제:%s" % bcfFilName )
                        #기존xml 1번파일 복사 
                        shutil.copy(workerDir+"/bcpf/"+filework+"(1).bcpf", bcfFilName );
                        os.remove(workerDir+"/bcpf/"+filework+"(1).bcpf")

                    local_mp4_fileName = workerDir + "/mp4/" + filework
                    remote_mp4_fileName = jobScplist[work_id]['bts'] + server_type_path + '/'+work_id+'/' + filework


                    print("%s  ==> %s" % (local_mp4_fileName,remote_mp4_fileName))
                    ssh_manager.send_file(local_mp4_fileName , remote_mp4_fileName )  # 파일전송

                    print("#json 저장 .....")
                    #json 저장
                    utils().inserJson(work_id, job_id, workerDir, filework)
                #if

                #으뜸공간
                elif work_id == 'dtw' or work_id == 'gaic': # 디투리  or # 광주인공지능센터
                    tempFilename = jobScplist[work_id]['bts'] + server_type_path + '/'+work_id+'/' + filework
                    print("mp4 파일전송:%s ....." %  tempFilename)
                    ssh_manager.send_file(workerDir + "/mp4/" + filework , tempFilename )  # 파일전송

                    #xml 파일전송
                    tempFilework = filework.replace(".mp4", ".bcpf")
                    local_fileName = workerDir + "/bcpf/" + tempFilework
                    remote_filName = jobScplist[work_id]['bts'] + "/action_xml/" + work_id + '/' +tempFilework
                    print("xml(bcpf) 파일전송:%s --> %s....." % (local_fileName, tempFilename ))
                    try:
                        ssh_manager.send_file( local_fileName, tempFilename )  # 파일전송
                    except:
                        print(" 전송할 파일이 없습니다.[%s]" %( workerDir + "/bcpf/" + tempFilework))
                    
                    #json 저장
                    tempFilework = filework.replace(".mp4", ".json")
                    print("xml(bcpf) 파일저장:%s ....." % tempFilename)
                    utils().inserJson(work_id, job_id, workerDir+"/json/", tempFilework)
                # 디투리 # 광주인공지능 센터
        #for workList
    # ssh_manager.get_file('remote_path', 'local_path')  # 파일다운로드
    ssh_manager.close_ssh_client()  # 세션종료

except Exception as e:
    print(e)
    raise e










