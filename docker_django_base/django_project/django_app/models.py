from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.utils import timezone

## 세션 미들웨어로 생성되는 Session Model Import 
from django.contrib.sessions.models import Session
import datetime


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance) #, user_pk=instance.id)
    
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

## 계정 1개당 세션 1개씩만 허용
class UserSession(models.Model):

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    session = models.OneToOneField(Session, on_delete=models.CASCADE)


class Profile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    account_id = models.CharField(max_length = 200, default = '', null = False, verbose_name = "아이디")
    user_name = models.CharField(max_length = 100, default = '', null = False, verbose_name = "이름")
    phone_number = models.CharField(max_length = 30, default = '', null = False, verbose_name = "전화번호")
    email_address = models.CharField(max_length = 50, default = '', null = False, verbose_name = "이메일 주소")
    is_staff = models.BooleanField(default = False, verbose_name = "접속 권한")
    is_superuser = models.BooleanField(default = False, verbose_name = "관리자 권한")
    is_inspector = models.BooleanField(default = False, verbose_name = "검수 권한")
    last_login = models.DateTimeField(auto_now=True, verbose_name  = "최종 로그인 날짜")
    creation_date = models.DateTimeField(auto_now_add=True, verbose_name = "가입 날짜")
    group_id = models.CharField(max_length = 20, default = 'gjac', null = False, verbose_name = "소속 그룹")


    def set_info(self, account_id=None, password=None, user_name=None, phone_number=None, email_address=None, group_id=None, is_staff=None, is_superuser=None, is_inspector=None):

        if account_id != None :
            self.account_id = account_id

        if password != None:
            self.user.set_password(password)
            
        if user_name != None :
            self.user_name = user_name

        if phone_number != None:
            self.phone_number = phone_number
        
        if email_address != None:
            self.user.email = email_address
            self.email_address = email_address

        if group_id != None:
            self.group_id = group_id
        
        if is_staff == None:
            self.user.is_staff = False
            self.is_staff = False
        
        if is_superuser == None:
            self.user.is_superuser = False
            self.is_superuser = False
        
        if is_inspector == None:
            self.is_inspector = False

        self.user.save()
        self.save()



class ProjectInfo(models.Model):

    project_code = models.CharField(max_length = 20, primary_key = True, null = False, verbose_name = "프로젝트 코드")
    project_name = models.CharField(max_length = 20, null = False, verbose_name = "프로젝트 이름")
    project_dc= models.CharField(max_length = 200, null = False, verbose_name = "프로젝트 설명")
    bsn_nm = models.CharField(max_length = 20, null = False, verbose_name = "수행사업 이름")
    hst_cmpy = models.CharField(max_length = 20, null = False, verbose_name = "주관기업 이름")
    start_bn = models.DateTimeField(null = False, verbose_name = "사업시작일")
    end_bn = models.DateTimeField(null = False, verbose_name = "사업종료일")
    
    reg_id =  models.CharField(max_length = 20, null = False, verbose_name = "등록자 ID")
    reg_date = models.DateTimeField(auto_now_add=True, verbose_name = "등록 일자")
    modify_date = models.DateTimeField(auto_now=True, verbose_name = "수정 일자")

    project_status_choice = [('A', '프로젝트 대기'), ('B', '프로젝트 진행'), ('C', '프로젝트 완료'), ('D', '프로젝트 취소')]
    project_status = models.CharField(max_length=1, choices=project_status_choice, default='A', verbose_name = '작업상태')


class DataInfo(models.Model):

    project_code = models.ForeignKey(ProjectInfo, on_delete = models.CASCADE, verbose_name = "프로젝트 코드")
    data_set_name = models.CharField(max_length = 20, null = False, verbose_name = "데이터 구축명")

    start_cs = models.DateTimeField(null = False, verbose_name = "크라우드소싱 시작일")
    end_cs = models.DateTimeField(null = False,verbose_name = "크라우드소싱 종료일")

    reg_id = models.CharField(max_length = 20, null = False, verbose_name = "등록자 ID")
    reg_date = models.DateTimeField(auto_now_add = True, verbose_name = "등록 일짜")
    modify_date = models.DateTimeField(auto_now=True, verbose_name = "수정 일자")
    
    data_base_path = models.CharField(max_length = 200, null = False, verbose_name = "데이터 저장 경로")

## 작업 종류마다 수정 필요
class WorkList(models.Model):

    task_num = models.AutoField(primary_key = True, verbose_name = "자동 할당 번호(작업 리스트)")
    work_type = models.CharField(max_length = 100, null = False, verbose_name = "작업 종류")
    data_set_name = models.ForeignKey(DataInfo, on_delete = models.CASCADE, verbose_name = "데이터 ID")
    video_path = models.CharField(max_length = 100, null = False, verbose_name = "비디오 저장 경로")

    ## task(작업)
    task_point = models.IntegerField(default = 0, null = False, verbose_name = "작업 단가")
    task_status_choice = [('F', '작업 대기'), ('G', '작업 진행'), ('H', '작업 완료'), ('I', '작업 취소')]
    task_status = models.CharField(max_length=1, choices=task_status_choice, default='F', verbose_name = '작업 상태')

    task_user_id = models.CharField(max_length = 40, null = True, verbose_name = "작업자 ID")

    task_start_date = models.DateTimeField(null = True, verbose_name = "작업 시작 날짜")
    task_end_date = models.DateTimeField(null = True, verbose_name = "작업 종료 날짜")
    
    ## 1차 검수
    inspect_point = models.IntegerField(default = 0, null = False, verbose_name = "1차 검수 단가")
    inspect_status_choice = [('K', '1차 검수 대기'), ('L', '1차 검수 진행'), ('M', '1차 검수 완료'), ('N', '1차 검수 취소')]
    inspect_status = models.CharField(max_length=1, choices=inspect_status_choice, default='Z', verbose_name = '1차 검수 상태')

    inspect_user_id = models.CharField(max_length = 40, null = True, verbose_name = "검수자 ID")

    inspect_start_date = models.DateTimeField(null = True, verbose_name = "1차 검수 시작 날짜")
    inspect_end_date = models.DateTimeField(null = True, verbose_name = "1차 검수 종료 날짜")

    ## 2차 검수
    inspect_point_2 = models.IntegerField(default = 0, null = False, verbose_name = "2차 검수 단가")
    inspect_status_2_choice = [('P', '2차 검수 대기'), ('Q', '2차 검수 진행'), ('R', '2차 검수 완료'), ('S', '2차 검수 취소')]
    inspect_status_2 = models.CharField(max_length=1, choices=inspect_status_2_choice, default='Z', verbose_name = '2차 검수 상태')

    inspect_user_id_2 = models.CharField(max_length = 40, null = True, verbose_name = "검수자 ID")

    inspect_start_date_2 = models.DateTimeField(null = True, verbose_name = "2차 검수 시작 날짜")
    inspect_end_date_2 = models.DateTimeField(null = True, verbose_name = "2차 검수 종료 날짜")

    ## 3차 검수
    inspect_point_3 = models.IntegerField(default = 0, null = False, verbose_name = "3차 검수 단가")
    inspect_status_3_choice = [('U', '3차 검수 대기'), ('V', '3차 검수 진행'), ('W', '3차 검수 완료'), ('X', '3차 검수 취소')]
    inspect_status_3 = models.CharField(max_length=1, choices=inspect_status_3_choice, default='Z', verbose_name = '3차 검수 상태')

    inspect_user_id_3 = models.CharField(max_length = 40, null = True, verbose_name = "검수자 ID")

    inspect_start_date_3 = models.DateTimeField(null = True, verbose_name = "3차 검수 시작 날짜")
    inspect_end_date_3 = models.DateTimeField(null = True, verbose_name = "3차 검수 종료 날짜")

    # complete_check_choice = [('A', '대기'), ('B', '작업'), ('R', '승인대기'), ('C', '검수'), ('D', '종료')]
    # complete_check = models.CharField(max_length=1, choices=complete_check_choice, default = 'A', verbose_name = '작업 현황')

class WorkRecord(models.Model):

    worklist_task_num = models.ForeignKey(WorkList, on_delete = models.CASCADE, verbose_name = "외래키 : 작업 리스트 고유 번호")
    task_num = models.CharField(max_length = 40, null = False, verbose_name = "작업 번호")
    work_category_choice = [('AA', '작업 신청'), ('AB', '작업 완료'), ('AC', '작업 취소'), ('AD', "작업 반려"), 
                            ('AF', '1차 검수 신청'), ('AG', '1차 검수 완료'), ('AH', '1차 검수 취소'), ('AI', '1차 검수 반려'), 
                            ('AK', '2차 검수 신청'), ('AL', '2차 검수 완료'), ('AM', '2차 검수 취소'), ('AN', '2차 검수 반려')]

    work_category = models.CharField(max_length=10, choices=work_category_choice, verbose_name = "카테고리")
    reg_id = models.CharField(max_length = 30, null = False, verbose_name = "해당 작업자 ID")
    reg_date = models.DateTimeField(null = False, verbose_name = "등록 일자")

    ## 작업이 승인되지 않은 경우 False, 작업이 승인 되었으면 True

    # work_state = models.BooleanField(default = "False", verbose_name = "승인 상태")
    work_approved_date = models.DateTimeField(null = True, verbose_name = "승인 일자")
    # work_refuse_text = models.TextField(max_length = 300, null = True, verbose_name = "반려 사유")


## 작업 내역 저장 테이블
class TaskHistory(models.Model):

    task_id = models.AutoField(primary_key = True, verbose_name = "자동 할당 번호(clip ID)")
    work_num = models.ForeignKey(WorkRecord, on_delete = models.CASCADE, verbose_name = "외래키 : 자동 할당 번호 (WorkRecord)")
    work_fold_path = models.CharField(max_length = 100, null = False, verbose_name = "대상 폴더 경로")
    task_data = models.JSONField(null = False, default=dict, verbose_name = "JSON 데이터(작업)")
    task_image_num = models.IntegerField(null = False, default=0, verbose_name = "작업한 이미지 번호")
    tasker_id = models.CharField(max_length = 20, null = False, verbose_name = "작업자 ID")
    reg_date = models.DateTimeField(auto_now_add = True, null = False, verbose_name = "등록일자")
    start_time = models.FloatField(max_length = 20, null = True, verbose_name = "clip 시작시각")
    end_time = models.FloatField(max_length = 20, null = True, verbose_name = "clip 종료시각")

## 신청 기록 저장 테이블 (1차 검수)
class InspectHistory(models.Model):

    inspect_id = models.AutoField(primary_key = True, verbose_name = "자동 할당 번호(검수 내역)")
    work_num = models.ForeignKey(WorkRecord, on_delete = models.CASCADE, verbose_name = "외래키 : 자동 할당 번호 (WorkRecord)")
    work_fold_path = models.CharField(max_length = 100, null = False, verbose_name = "대상 폴더 경로")
    inspect_data = models.BinaryField(null = True, verbose_name = "JSON 데이터(검수)")
    inspect_image_num = models.IntegerField(null = False, verbose_name = "작업한 이미지 번호")
    inspector_id = models.CharField(max_length = 20, null = False, verbose_name = "검수자 ID")
    reg_date = models.DateTimeField(auto_now_add = True, null = False, verbose_name = "등록일자")


## 신청 기록 저장 테이블 (2차 검수)
class InspectHistory2(models.Model):

    inspect_id = models.AutoField(primary_key = True, verbose_name = "자동 할당 번호(검수 내역)")
    work_num = models.ForeignKey(WorkRecord, on_delete = models.CASCADE, verbose_name = "외래키 : 자동 할당 번호 (WorkRecord)")
    work_fold_path = models.CharField(max_length = 100, null = False, verbose_name = "대상 폴더 경로")
    inspect_data = models.BinaryField(null = True, verbose_name = "JSON 데이터(검수)")
    inspect_image_num = models.IntegerField(null = False, verbose_name = "작업한 이미지 번호")
    inspector_id = models.CharField(max_length = 20, null = False, verbose_name = "검수자 ID")
    reg_date = models.DateTimeField(auto_now_add = True, null = False, verbose_name = "등록일자")


## 신청 기록 저장 테이블 (3차 검수)
class InspectHistory3(models.Model):

    inspect_id = models.AutoField(primary_key = True, verbose_name = "자동 할당 번호(검수 내역)")
    work_num = models.ForeignKey(WorkRecord, on_delete = models.CASCADE, verbose_name = "외래키 : 자동 할당 번호 (WorkRecord)")
    work_fold_path = models.CharField(max_length = 100, null = False, verbose_name = "대상 폴더 경로")
    inspect_data = models.BinaryField(null = True, verbose_name = "JSON 데이터(검수)")
    inspect_image_num = models.IntegerField(null = False, verbose_name = "작업한 이미지 번호")
    inspector_id = models.CharField(max_length = 20, null = False, verbose_name = "검수자 ID")
    reg_date = models.DateTimeField(auto_now_add = True, null = False, verbose_name = "등록일자")


## 전체 반려 사유 
class DenyReason(models.Model) :

    deny_primary_key = models.AutoField(primary_key = True, verbose_name = "자동 할당(기본키")
    record_num = models.ForeignKey(WorkRecord, on_delete = models.CASCADE, verbose_name = "외래키 : 자동 할당 번호 (WorkRecord)")
    task_num = models.CharField(max_length = 40, null = False, verbose_name = "상품 이름")
    reason_data_field = models.TextField(max_length = 300, null = True, verbose_name = "해당 작업에 대한 전체 반려 사유")
    task_type_choice = [('BA', '1차 검수 반려'), ('BB', '2차 검수 반려'), ('BC', '3차 검수 반려')]
    task_type = models.CharField(max_length=10, choices=task_type_choice, verbose_name = "카테고리")
    reg_id = models.CharField(max_length = 30, null = False, verbose_name = '등록자 ID')
    reg_date = models.DateTimeField(auto_now = True, null = False, verbose_name = "등록 날짜")


## 세부 반려 사유
class DenyResonDetail(models.Model) :

    denyreason_num = models.ForeignKey(WorkRecord, on_delete = models.CASCADE, verbose_name = "외래키(DenyReason)")
    task_image_num = models.IntegerField(null = False, default=0, verbose_name = "이미지 번호")
    reason_detail_data = models.TextField(max_length = 300, null = False, verbose_name = "이미지 번호에 해당하는 반려 사유")
    reg_id = models.CharField(max_length = 30, null = False, verbose_name = "등록자 ID")
    reg_data = models.DateTimeField(auto_now = True, null = False, verbose_name = "등록 날짜")


## 금액 계산 테이블

class PayList(models.Model) :
    
    pay_num  = models.AutoField(primary_key = True, verbose_name = "기본키(자동할당)")

    task_num = models.CharField(max_length = 30, null = False, verbose_name = "상품 이름")
    
    work_type_choice = [('A', '작업'), ('B', '1차 검수'), ('C', '2차 검수'), ('D', '3차 검수')]
    work_type = models.CharField(max_length=1, choices=work_type_choice, verbose_name = "카테고리")

    task_pay_count = models.IntegerField(null = False, default = 0, verbose_name = "작업 합산 금액")
    inspect_1_pay_count = models.IntegerField(null = False, default = 0, verbose_name = "1차 검수 합산 금액")
    inspect_2_pay_count = models.IntegerField(null = False, default = 0, verbose_name = "2차 검수 합산 금액")
    inspect_3_pay_count = models.IntegerField(null = False, default = 0, verbose_name = "3차 검수 합산 금액")

    total_pay_count = models.IntegerField(null = False, verbose_name = "총 합산 금액")

    reg_id = models.CharField(max_length = 40, null = False, verbose_name = "유저 이름")
    reg_date = models.DateTimeField(auto_now = True, null = False, verbose_name = "등록 날짜")
    

