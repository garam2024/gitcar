import psycopg2, os
import datetime

try:

    conn = psycopg2.connect("dbname='dtwo' user='dtwo' host='211.223.65.189' port='15432' password='dtwo!@#' ")

    print("Connected")

except:

    print("Not Connected")

image_absolute_path = "/mnt/disk2/dtworesource_tool_db/docker_django_base/django_project/media/django_app/product_image"

image_file_list = os.listdir(image_absolute_path)


for file_name in image_file_list:

    image_count = len(os.listdir(image_absolute_path + '/' + file_name))

    cur = conn.cursor()

    path = "/django_app/product_image/" + str(file_name)

    # sql_query = "select * from django_app_worklist;"

    sql_query = "INSERT INTO django_app_worklist (data_id,task_num,image_count,image_save_path,task_status,task_user_id,task_start_date,task_end_date,inspect_status,inspect_user_id,inspect_start_date,inspect_end_date,complete_check) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"

    date = str(datetime.datetime.now())

    print("INSERT INTO django_app_worklist (data_set_name_id,task_num,image_count,image_save_path,task_point,task_status,task_user_id,task_start_date,task_end_date,inspect_point,inspect_status,inspect_user_id,inspect_start_date,inspect_end_date,complete_check) VALUES " + "('2'"+","+"'"+file_name+"'"+","+"'"+str(image_count)+"'"+","+"'"+path+"'"+","+"'12000'"+","+"'"+"A"+"'"+","+"'"+'NULL'+"'"+","+"'"+date+"'"+","+"'"+date+"'"+","+"'7000'"+","+"'"+'A'+"'"+","+"'"+'NULL'+"'"+","+"'"+date+"'"+","+"'"+date+"'"+","+"'A');")

    # cur.execute(sql_query,('1', file_name,image_count_path,'A','NULL',date,date,'A','NULL',date,date,'A',))


    # print(cur.fetchall())
    

    # try:
    #     sql_query = "INSERT INTO django_app_worklist (data_id,task_num,image_count,image_save_path,task_status,task_user_id,task_start_date,task_end_date,inspect_status,inspect_user_id,inspect_start_date,inspect_end_date,complete_check) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"

    #     cur.execute(sql_query, (1, file_name, image_count, path, 'A', '', '2021-06-01', '2021-12-31', 'A', '', '2021-06-01', '2021-12-31', 'A',))

    #     cur.execute(sql_query)

    #     print(cur.fetchall())
        

        
        
        

    # except:

    #     print("Failed")
    
    conn.commit()

cur.close()
conn.close()



# try:
#   sqlString = "INSERT INTO ptest (gid, description, size) VALUES (%s, %s, %s);"
#   cur.execute(sqlString, (1, 'd_string', '{123, 456, 789}',) )
# except:
#   print "cannot SQL Execute"

# conn.commit()
# cur.close()
# conn.close()


# import os 

# absolute_path = "/mnt/disk3/data_dtworesource"

# # os.chdir("/mnt/disk3/")

# file_check = os.listdir(absolute_path)

# print("File Check : ", file_check)

# file_length = len(file_check)

# print("File length Check : ", file_length)

# django_absolute_path = "/mnt/disk3/dtworesource_tool_db/docker_django_base/django_project/media/django_app/product_image"

# if not os.path.exists(django_absolute_path):
#     os.makedirs(django_absolute_path)


# for task_num in file_check:

#     print("name : ", task_num)

#     file_name = task_num.split(".")[0]
#     file_name = file_name.replace(" ","")
#     file_name = file_name.split('_')[1]
    

#     print("File_name : ", file_name)

#     original_path = absolute_path + '/' + task_num 
#     save_path = django_absolute_path + '/' + file_name

#     if not os.path.exists(save_path):
#         os.makedirs(save_path)

#     os.system("ffmpeg -ss 00:00:00 -i " + original_path + " -vf scale=1280:720" +" -r 5 " + " -qscale:v 2 " + save_path + "/" + "%d.jpg")
