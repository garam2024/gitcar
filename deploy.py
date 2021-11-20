import os
import subprocess

print("___________프로세서 탐색 시작___________________________________________")
command = "ps -ef | grep copySrc.sh | grep -v 'grep' | wc -l"
fd_popen = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
(stdoutdata, stderrdata) = fd_popen.communicate()
dataCnt = stdoutdata.decode('utf8')
print("____________프로세서 탐색 끝_____________________________________")

#프로세서가 수행되지 않을때 수행한다.
if int(dataCnt) >0:
    print("___________폴더 탐색 시작___________________________________________")
    command = 'sudo sshpass -f /vol2/deploy/bin/btspass.txt sudo ssh root@175.201.6.4 -p 22200 "ls -l /mnt/disk3/deploy | wc -l"'
    fd_popen = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    (stdoutdata, stderrdata) = fd_popen.communicate()
    print("____________폴더 탐색 끝_____________________________________")

    dataCnt = stdoutdata.decode('utf8')
    print("--dataCnt:%s" % dataCnt)
    if int(dataCnt) > 2 :
        print("-------------bts--->local copy startting....")
        #subprocess.call('sudo /vol2/deploy/bin/copySrcRun.sh' , shell=True)
        subprocess.call( 'sudo sshpass -f /vol2/deploy/bin/btspass.txt scp -P 22200 -r -o StrictHostKeyChecking=no bts@175.201.6.4:/mnt/disk3/deploy/* /vol2/deploy/src/', shell=True)
        subprocess.call( 'sudo sshpass -f /vol2/deploy/bin/btspass.txt sudo ssh root@175.201.6.4 -p 22200 "rm -rf /mnt/disk3/deploy/*"', shell=True)

        print("-------------local to local copy startting....")
        path_dir = '/vol2/deploy/src'
        toCopyPath ='/vol1/docker_django_base' #run folder
        #toCopyPath = '/vol2/docker_django_base'  # test folder
        file_list = os.listdir(path_dir)
        # 파일이 있는경우 배포 시작
        if len(file_list) > 0:
            print("Deploy Running..")
            # 파일 복사
            # /django_project/django_app/*
            # /django_project/django_project/admin_urls.py
            # /django_project/worklist.xml
            copyCnt = 0
            try:
                print("Copying django_app Running..")
                formPath = path_dir + "/django_project/django_app/*"
                toPath = toCopyPath + "/django_project/django_app/"
                #shutil.copytree(formPath, toPath)
                subprocess.call('sudo cp -R '+formPath + ' '+ toPath, shell=True)
                copyCnt = copyCnt + 1
            except Exception as e:
                print(e)

            try:
                print("Copying django_project admin_url Running..")
                formPath = path_dir + "/django_project/django_project/admin_urls.py"
                toPath = toCopyPath + "/django_project/django_project/"
                #shutil.copy2(formPath, toPath)
                subprocess.call('sudo cp -R ' + formPath + ' ' + toPath, shell=True)
                copyCnt = copyCnt + 1
            except Exception as e:
                print(e)

            try:
                print("Copying django_project url Running..")
                formPath = path_dir + "/django_project/django_project/urls.py"
                toPath = toCopyPath + "/django_project/django_project/"
                #shutil.copy2(formPath, toPath)
                subprocess.call('sudo cp -R ' + formPath + ' ' + toPath, shell=True)
                copyCnt = copyCnt + 1
            except Exception as e:
                print(e)

            try:
                print("Copying worklist.xml Running..")
                formPath = path_dir + "/django_project/*.xml"
                toPath = toCopyPath + "/django_project/"
                #shutil.copy2(formPath, toPath)
                subprocess.call('sudo cp -R ' + formPath + ' ' + toPath, shell=True)
                copyCnt = copyCnt + 1
            except Exception as e:
                print(e)

            if copyCnt > 0:
                # 파일 삭제
                #shutil.rmtree(path_dir + "/django_project")
                subprocess.call('sudo rm -rf ' + path_dir + "/django_project", shell=True)

                # 펴미션 및 소유권 교체
                subprocess.call('sudo chown -R centos:centos /vol1/docker_django_base/django_project', shell=True)
                subprocess.call('sudo chmod -R 777 /vol1/docker_django_base/django_project', shell=True)

                # 도거 재시작
                subprocess.call('docker-compose -f /vol1/docker_django_base/docker-compose.yml down', shell=True)
                subprocess.call('sleep 10');
                subprocess.call('docker-compose -f /vol1/docker_django_base/docker-compose.yml up -d --build', shell=True)
                print("copyies ok and restared...")
            else:
                print("copyies None..")
        else:
            print("NO Running..")


