import psycopg2, os
import datetime

# DB 연경
conn = psycopg2.connect("dbname='gaic_db' user='gaic' host='postgres_vehicle_task_2' port='5432' password='gaic123!@#' ")
cursor = conn.cursor()

print("Connected")


# project_name 등록 여부 확인
project_name = 'vehicle_2'

sql = "select count(*) from django_app_projectinfo where project_name='" + project_name + "';"

cursor.execute(sql)
projectinfo = cursor.fetchall()[0][0]

# project_name 있으면 패쓰
if not projectinfo == 0:
    print('프로젝트 테이블이 존재합니다')
    
    print(projectinfo)

# project_name 없으면 등록
else:
    print('프로젝트 테이블을 생성합니다')

    sql = ""
    sql += "insert into django_app_projectinfo \
            values ('COM210', 'vehicle_2', '차량내외부_상황인식_데이터','학습데이터구축','(주)광주인공지능센터', '2021-06-01', '2021-12-31', 'admin', now(), now(), 'A');"

    # 쿼리 보냄
    cursor.execute(sql)
    # 저장
    conn.commit()




# data_info 등록 여부 확인
sql = "select count(*) from django_app_datainfo where data_set_name='차량내외부_상황인식_데이터';"

cursor.execute(sql)
datainfo = cursor.fetchall()[0][0]

# data_info 있으면 패쓰
if not datainfo == 0:
    print('데이터 정보 테이블이 존재합니다')
    
    print(datainfo)
    
# data_info 없으면 등록
else:
    print('데이터 정보 테이블을 생성합니다')

    sql = ""
    sql += "insert into django_app_datainfo (project_code_id, data_set_name, start_cs, end_cs, reg_id,reg_date, modify_date, data_base_path) \
            values('COM210', '차량내외부_상황인식_데이터', '2021-06-01', '2021-12-31', 'admin', now(), now(), '/django_app');"
    
    # 쿼리 보냄
    cursor.execute(sql)
    # 저장
    conn.commit()
    # print(sql)



# 작업 등록할 폴더 경로
action_video_absolute_path = "/code/django_project/media/django_app/action_video"

# 파일 리스트 가져오기
action_video_list = os.listdir(action_video_absolute_path)
# print(action_video_list)

# 데이터베이스에 등록할 경로 설정
action_video_folder_path = "/media/django_app/action_video"

# 외부키 설정을 위한 값 조회
sql = "SELECT id from django_app_datainfo WHERE data_set_name='차량내외부_상황인식_데이터'"
cursor.execute(sql)
data_set_name = cursor.fetchall()[0][0]
# print(data_set_name)


# 파일 리스트 데이터베이스 등록
sql = ""
task_type = "행동, 감정 라벨링"

for idx, _action_video_name in enumerate(action_video_list):

    # 파일 경로 생성
    _action_video_path = action_video_folder_path + '/' + _action_video_name
    # print(_action_video_path)

    # 등록된 파일 있는지 조회
    sql_select = "SELECT count(*) from django_app_worklist WHERE video_path='" + _action_video_path + "';"
    cursor.execute(sql_select)
    video_path = cursor.fetchall()[0][0]
    # print(video_path)

    # 등록된 파일 없으면 추가
    if video_path == 0:

        sql += "insert into django_app_worklist (work_type, data_set_name_id, video_path, \
                task_point, task_status, task_user_id, task_start_date, task_end_date, \
                inspect_point, inspect_status, inspect_user_id, inspect_start_date, inspect_end_date, \
                inspect_point_2, inspect_status_2, inspect_user_id_2, inspect_start_date_2, inspect_end_date_2, \
                inspect_point_3, inspect_status_3, inspect_user_id_3, inspect_start_date_3, inspect_end_date_3) \
                values ('" + task_type + "', " + str(data_set_name) + ", '" + _action_video_path + "', \
                0, 'F', null, null, null, \
                0, 'Z', null, null, null, \
                0, 'Z', null, null, null, \
                0, 'Z', null, null, null);"

        sql += '\n'

    # 쿼리 보냄
    if idx > 0 and idx % 10000 and sql:

        cursor.execute(sql)
        sql = ""

# 쿼리 보냄
if sql:
    cursor.execute(sql)
    sql = ""

# 저장
conn.commit()
# 종료
cursor.close()
conn.close()


