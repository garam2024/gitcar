from django.contrib import admin
from django.urls import path

from django_app import views

urlpatterns = [

    ## 관리자 메인 페이지
	# path('index/', views.adminIndex.as_view(), name='admin_index'),
    
    # ## 진행 현황 데이터 Update Module(ajax)
    # path('index/product_data', views.admin_update_module, name = 'update'),


    # ## 관리자 페이지 내 작업 확인용 페이지
    # path('adminTaskCheck/<str:task_num>/', views.adminTaskCheck.as_view(), name = 'adminTaskCheck'),
    # ## 관리자 페이지 내 검수 확인용 페이지
    # path('adminInspectCheck/<str:task_num>/', views.adminInspectCheck.as_view(), name = 'adminInspectCheck'),



    # ## 작업 내용 확인 시 DB를 참고하여 작업 페이지 재구성용 모듈(ajax)
    # path("adminTaskCheck/<str:task_num>/task_check_api", views.task_check_api, name = 'task_check_api'),
    # ## 검수 내용 확인 시 DB를 참고하여 검수 페이지 재구성용 모듈(ajax)
    # path("adminInspectCheck/<str:task_num>/inspect_check_api", views.inspect_check_api, name = 'inspect_check_api'),



    # ## 작업 승인용 모듈
    # path("adminTaskApprove/<str:record_key>", views.admin_task_approve_module, name = 'admin_task_approve'),
    # ## 작업 반려용 모듈
    # path('adminTaskCancel/<str:record_key>', views.admin_task_cancel_module, name = 'admin_task_cancel'),

    # ## 작업 반려 메시지 전송 모듈
    # path('refusemessage/<str:record_key>', views.get_refuse_message, name = 'refuse_message'),

    # 작업 저장

	
]

 