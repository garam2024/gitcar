import psycopg2
import json
import sys



global conn, cur ,save_path

if len(sys.argv)>=1:
    save_path = sys.argv[1]
else:
    save_path = "./"


try:
    conn = psycopg2.connect("dbname='gaic_db' user='postgres' host='192.168.50.217' password='gjac' ")
    cur = conn.cursor()

except Exception as e:
    print("Not connection..")


try:
    work_type = ["normal","interface"]

    for workType in work_type:

        #이상행동 json 데이터 읽기
        sqlNorlistid  = "select "
        sqlNorlistid += " work_id "
        sqlNorlistid += " from django_app_worklist where 1=1 "
        sqlNorlistid += " and work_type ='"+workType+"'"
        sqlNorlistid += " and json_export_status ='N'"
        cur.execute(sqlNorlistid)

        rows = cur.fetchall()


        for key in rows:
            print("%s 작업 %s json 데이터 추출.." % (workType, str(key[0])))
            sqlString  = " select "
            sqlString += "  task_id,"
            sqlString += "  work_id,"
            sqlString += "  associated_video_path,"
            sqlString += "  task_data,"
            sqlString += "  end_time,"
            sqlString += "  start_time"
            sqlString += " from django_app_tasklist where 1=1"
            sqlString += " and work_id = '"+ str(key[0]) +"'"


            #print(sqlString)

            cur.execute(sqlString)

            jsonrows = cur.fetchall()
            file_data = []
            for jsonSrt in jsonrows:
                file_data.append(str(jsonSrt[3]))

            if len(file_data):
                filenameStr = workType+"_"+str(key[0])+".json"
                print(file_data)

                outputFile = open(save_path+filenameStr,'w')
                json.dump(file_data, outputFile)
                outputFile.close()

            #json down stat db update
            upQueryStr = " update django_app_worklist set  json_export_status = 'Y' where  work_id = '"+ str(key[0]) +"'"
            cur.execute(upQueryStr)
            conn.commit()

    conn.close()


except Exception as e:
    print(e)
    conn.rollbak()
    conn.close()




