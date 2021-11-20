import os 

absolute_path = "/mnt/disk3/data_dtworesource"

# os.chdir("/mnt/disk3/")

re_file_check = os.listdir(absolute_path)

# print(file_check)

for item in re_file_check:
    
    re_item = item.replace(" ","")
    os.rename(absolute_path +'/'+item, absolute_path + '/' + re_item)


file_check = os.listdir(absolute_path)


print("File Check : ", file_check)

file_length = len(file_check)

print("File length Check : ", file_length)

django_absolute_path = "/mnt/disk3/dtworesource_tool_db/docker_django_base/django_project/media/django_app/product_image"

if not os.path.exists(django_absolute_path):
    os.makedirs(django_absolute_path)

check_number = 1

for task_num in file_check:

    length_count = len(file_check)
    
    print("name : ", task_num)

    file_name = task_num.split(".")[0]
    file_name = file_name.replace(" ","")
    file_name = file_name.split('_')[1]
    

    print("File_name : ", file_name)

    original_path = absolute_path + '/' + task_num 
    save_path = django_absolute_path + '/' + file_name

    if not os.path.exists(save_path):
        os.makedirs(save_path)

    # os.system("ffmpeg -ss 00:00:00 -i " + original_path + " -vf scale=1280:720" +" -r 5 " + " -qscale:v 2 " + save_path + "/" + "%d.jpg")
    os.system("ffmpeg -ss 00:00:00 -i " + original_path + " -vf scale=1280:720" + " -r 5 " + save_path + "/" + "%d.png")

    print (" Remain Task : " + str(check_number) +' / '+str(length_count))

    check_number += 1



## 2021-08-25 이전 소스

# import os 

# absolute_path = "/mnt/disk3/data_dtworesource"

# # os.chdir("/mnt/disk3/")

# re_file_check = os.listdir(absolute_path)

# # print(file_check)

# for item in re_file_check:
    
#     re_item = item.replace(" ","")
#     os.rename(absolute_path +'/'+item, absolute_path + '/' + re_item)


# file_check = os.listdir(absolute_path)


# print("File Check : ", file_check)

# file_length = len(file_check)

# print("File length Check : ", file_length)

# django_absolute_path = "/mnt/disk3/dtworesource_tool_db/docker_django_base/django_project/media/django_app/product_image"

# if not os.path.exists(django_absolute_path):
#     os.makedirs(django_absolute_path)

# check_number = 1

# for task_num in file_check:

#     length_count = len(file_check)
    
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

#     print (" Remain Task : " + str(check_number) +' / '+str(length_count))

#     check_number += 1
