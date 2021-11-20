import copy
import subprocess
import os

import cv2
import mediapipe as mp
import psycopg2
import psycopg2.extras
import xml.etree.ElementTree as elemTree
from xml.etree.ElementTree import parse
import json
import traceback

#디비 접속util
class SqlMapper:
    #생성자
    def __init__(self):
        self.connect()

    def connect(self):
        ## nhn 52
        #self.conn = psycopg2.connect("dbname='gaic_db' user='gaic' host='133.186.146.169' port='15502' password='gaic123!@#' ")
        ## bts 52
        # self.conn = psycopg2.connect( "dbname='gaic_db' user='gaic' host='175.201.6.4' port='15502' password='gaic123!@#' ")
        ## local
        self.conn = psycopg2.connect( "dbname='gaic_db' user='postgres' host='192.168.50.217' port='5432' password='gjac' ")

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

        try:
            self.cursor.execute(sqlStr)
        except:
            self.close()
            self.connect()
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

        try:
            self.cursor.execute(sqlStr)
        except:
            try:
                self.conn.closed()
            except:
                pass
            self.connect()
            self.cursor.execute(sqlStr)

    def commit(self):
        self.conn.commit()

    def rollbak(self):
        try:
            self.rollbak()
        except:
            pass

    def close(self):
        try:
            self.conn.commit()
            self.conn.closed()
        except:
            pass
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
        path = os.path.dirname(os.path.abspath(__file__))
        sqlInfo = sqlMapperid.split(".")
        sqlXml = parse(path+"/%s.xml" % sqlInfo[0]).getroot()#xml파일읽기


        sqlStr = ""
        for selObj in sqlXml.findall(queryType):

            selid = selObj.attrib["id"]

            if selid == sqlInfo[1]:
                sqlStr = selObj.text
                break
        print("sql-->%s" %sqlStr )
        return sqlStr




print("___________프로세서 탐색 시작___________________________________________")
command = "ps -ef | grep getHandPose.sh | grep -v 'grep' | wc -l"
fd_popen = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
(stdoutdata, stderrdata) = fd_popen.communicate()
dataCnt = stdoutdata.decode('utf8')
print("____________프로세서 탐색 끝___________________________________:%d" % dataCnt)
if int(dataCnt) >0:
    exit(0);


#mp_drawing = mp.solutions.drawing_utils
#mp_drawing_styles = mp.solutions.drawing_styles
mp_hands = mp.solutions.hands

#0.디비 접속
sqlmap = SqlMapper()

testCnt = 0

#db에서 처리목록을 가져온다.
task_list = sqlmap.get_select("worklist_ext.selectTasklist",{})
for task_row in task_list:
    try:
        '''
        if testCnt >0 :
            break
        else:
            testCnt += 1
        '''
        # For webcam input:
        #video_file = task_row["video_path"] #운용
        rootPath = '/mnt/disk3/donggyeong/210913' #bts
        video_file = rootPath+"./mp4/p01_1h_if_f40_20210814_144037(3)_Y.mp4" #테스트

        taskData = {}

        taskData = task_row["task_data"]
        taskData["data"]["skeleton"] = []

        cap = cv2.VideoCapture(video_file)

        #image = cap.read()
        length = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        print("총프레임:", length, "화면크기", width, "*",height, "프레임:", fps)

        #test
        #start_time = 12.215
        #end_time = 14.665

        ##운용
        start_time = float(taskData["start"])
        end_time   = float(taskData["end"])

        frame_start = 0
        frame_end   = 0

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_start = fps * start_time
        frame_end = fps * end_time

        run_frame = int(frame_start)

        # 2.5등분한다.
        total_frame = frame_end - frame_start
        total_frame_mid = total_frame / 5

        frameCnt = 0 #프레임 취하는 번호

        hadposeLsit = []

        with mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5) as hands:
            while cap.isOpened():
                cap.set(cv2.CAP_PROP_POS_FRAMES, run_frame)
                success, image = cap.read()
                if success:
                    timest = cap.get(cv2.CAP_PROP_POS_MSEC)/1000
                    print("for frame : %s   timestamp is %s:  fps:%f framePoint : %f end frame : %f  frame cnt: %d " % (str(run_frame), str(timest) ,fps, frame_start + (total_frame_mid * frameCnt )  , frame_end, frameCnt+1  ) )
                else:
                    break

                run_frame += 1

                if not success:
                    print("Ignoring empty camera frame.")
                    # If loading a video, use 'break' instead of 'continue'.
                    continue

                #if end

                # Flip the image horizontally for a later selfie-view display, and convert
                # the BGR image to RGB.
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

                # To improve performance, optionally mark the image as not writeable to
                # pass by reference.
                image.flags.writeable = False
                results = hands.process(image)

                image_height, image_width, _ = image.shape

                # Draw the hand annotations on the image.
                #image.flags.writeable = True
                #image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

                # 4.dic형태의 객체를로 데이터를 담는다.
                skupdata = {}

                if results.multi_hand_landmarks:
                    skupdata["time"] = timest
                    skupdata["dataURL"] = ""

                    skeleton_data = []
                    for hand_landmarks in results.multi_hand_landmarks:
                        hanpsoseCnt = 1
                        # Here is How to Get All the Coordinates
                        for ids, landmrk in enumerate(hand_landmarks.landmark):
                            if hanpsoseCnt <= 21:
                                # print(ids, landmrk)
                                cx, cy = landmrk.x * image_width, landmrk.y*image_height
                                #print(cx, cy)
                                skeleton = {}
                                #print (ids, cx, cy)
                                skeleton["x"] = (cx/width)
                                skeleton["y"] = (cy/height)
                                skeleton["z"] = 0
                                skeleton_data.append(copy.deepcopy(skeleton))
                                hanpsoseCnt += 1
                            #if end
                        #for end
                        print("frameCnt:%d" % frameCnt)
                    #for end
                    skupdata["skeleton"] = copy.deepcopy(skeleton_data)
                    hadposeLsit.append(copy.deepcopy(skupdata))
                    #taskData["data"]["skeleton"].append(copy.deepcopy(skupdata));
                    frameCnt += 1  # 프레임 번호

                    #다른 푸레임 핸드포즈 위치
                    #run_frame += total_frame_mid
                #end if

                #cv2.imshow('MediaPipe Hands', image)
                #if cv2.waitKey(5) & 0xFF == 27:
                #    break
                if run_frame >= frame_end :
                    break
            #end while
        #with
        cap.release()

        # 핸드포즈 선택및 저장
        runCnt = 1
        saveCnt = 0
        betweenCnt = (frameCnt - 2) / 3  # 건너 뛰는 수량
        jumpCnt = 1  # 건너 뛰는 위치
        for rowhand_data in hadposeLsit:

            if runCnt == 1 or runCnt >= frameCnt or runCnt == int(jumpCnt):  # 처음과 마지막건은 넣는다.
                print("total cnt : %d in hand pose num: %d runCnt: %d jumpCnt:%f" % (frameCnt, saveCnt, runCnt, jumpCnt))
                taskData["data"]["skeleton"].append(rowhand_data)
                jumpCnt += betweenCnt
                saveCnt += 1
                if saveCnt >= 5:
                    break
            runCnt += 1

        temp_data = str(json.dumps(taskData))
        print("taskData: %s" % temp_data)


        #DB 업데이트
        #json 데이터 업데이트

        sqlmap.set_updateQuery("worklist_ext.updateTaskData", {'task_data':temp_data
                                                            , 'work_id': task_row["work_id"]
                                                            , 'task_id': task_row["task_id"]
                               })
        #처리내용 업데이트
        sqlmap.set_updateQuery("worklist_ext.updateTaskPro",  { 'work_id': task_row["work_id"]
                                                            ,   'task_id': task_row["task_id"]
                               })

        sqlmap.commit()

    except Exception as e:
        traceback.print_exc()
        cap.release()
        sqlmap.rollbak()

#for end





