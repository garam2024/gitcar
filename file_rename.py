import subprocess
import os

import psycopg2
import psycopg2.extras
from xml.etree.ElementTree import parse
import traceback
from datetime import datetime

try:

    org_file_path = '/vol1/media/django_app'  # ext  folder
    folder_list = ['/action_video/tbit/']
    # For webcam input:
    for key in folder_list:
        print("___________폴더 탐색 시작___________________________________________")
        command = "find " + org_file_path + key + " -name '*.mp4' -mtime -1"
        fd_popen = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        (stdoutdata, stderrdata) = fd_popen.communicate()
        print("____________폴더 탐색 끝_____________________________________")

        data = stdoutdata.decode('utf-8')

        data = data.replace("\n", "^")
        file_list = data.split("^")

        print("파일갯수 : ", len(file_list))
        for file in file_list:
            file_org_name = file.strip()
            if len(file_org_name) == 0:
                continue

            file_trans_name = file.replace('.mp4', '_Y.mp4')
            print('파일 원본 비디오명 : ', file_org_name, ' 파일 변경 비디오명 : ', file_trans_name)
            file_trans_name_last = file_trans_name.split('/')[-1]
            os.remove(file_trans_name)
            os.rename(file_org_name, file_trans_name)
        print("작업 끝!")

except Exception as e:
    traceback.print_exc()






