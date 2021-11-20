from django.contrib import admin
from django.urls import path
# from django_app import views
from django.conf.urls.static import static
from django.conf import settings
# from django.views.static import serve 

from .views import admin_views, admin_return_views
from .views import base_views, task_views, task_views_abnormal, inspect_views_1st, inspect_views_2nd, inspect_views_3rd, \
    api_views, mypage_views

urlpatterns = [

    ## 관리자 메인 페이지
    path('index/', admin_views.adminIndex.as_view(), name='admin_index'),
    path('userAuth/',admin_views.userAuth.as_view(), name ='userAuth'),
    path('index/userAuth/change_auth', admin_views.changeAuth, name='change_auth'), #(작업권한, 검수권한) 바꾸기
    path('index/get_search_data', admin_views.getSearchData, name='get_search_data'), #아작스 서치

    path('userAuth/get_auth_search_data', admin_views.getAuthSearchData, name='get_auth_search_data'), #유저관리 검색

    path('index/adminview', admin_return_views.adminTaskCheck.as_view(), name='adminview'), #작업보기
    
    path("index/get_statusDic", base_views.get_statusDic, name = "get_statusDic"),
    path("index/adminview/get_statusDic", base_views.get_statusDic, name = "get_statusDic"),
    path("index/progress", base_views.get_statusDic, name = "progress"),

    path('index/adminview/inspect_task_api', admin_return_views.inspect_task_api, name='task_api'), #작업저장
    path("index/adminview/check_task", admin_return_views.check_task, name='check_task'),
    path('index/task_region_delete', admin_return_views.task_region_delete, name='adminview_task_region_delete'), # 작업 보기 기능 모듈 : 클립 삭제
    path("index/adminview/task_api", admin_return_views.task_api, name='adminview_task_api'), # 반려 적용
    path('index/admin_complete', admin_return_views.admin_complete, name='admin_complete'), # 최종 제출
    path('index/adminview/admin_inspect', admin_return_views.admin_inspect_check, name='admin_inspect_check'), # 관리자 반려
    
    
    # 윤주
    path('standard/', admin_views.adminStandard.as_view(), name='admin_standard'),
    #path('index/man/', admin_views.adminManufact.as_view(), name='admin_man'),
    path('man/', admin_views.adminManufact.as_view(), name='man'),

    # 게시판 공지사항
    path('index/adminview/board_list', admin_views.board_list.as_view(), name='admin_board_list'), #글 목록 가져오기
    path('index/adminview/borad_write', admin_views.board_write.as_view(), name='admin_borad_write'), #글 쓰기
    path('index/adminview/board_read', admin_views.board_read.as_view(), name='admin_board_read'), #글 읽기
    path('index/adminview/board_update', admin_views.board_update.as_view(), name='admin_board_update'), #글 수정
    path('index/adminview/board_delete', admin_views.board_delete.as_view(), name='admin_board_delete'), #글 삭제
    path('index/adminview/board_update_option', admin_views.board_update_option, name='admin_board_update_option'), #글 목록에서 옵션 수정 - 공지사항 또는 일반

    #엑셀 데이터
    path('index/getExcelData', admin_views.getExcelData, name='getExcelData'),

    # 상민
    # 작업 등록
    path('index/insert_work', admin_views.insert_work, name='insert_work'),
    
    #경진
    path('index/cancel_work', admin_views.cancel_work, name='cancel_work'), #작업 현황 리스트 중 검색 취소
    path('index/work_giveUp', admin_views.work_giveUp, name='work_giveUp'), #작업 현황 리스트 중 검색 포기

]
