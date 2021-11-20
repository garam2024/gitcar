from django.contrib import admin
from django.urls import path
# from django_app import views
from django.conf.urls.static import static
from django.conf import settings
# from django.views.static import serve 

from .views import base_views, task_views, task_views_abnormal, inspect_views_1st, inspect_views_2nd, inspect_views_3rd, api_views, mypage_views

## URL 변경 호출
from django.conf.urls import url, include


urlpatterns = [

    ## 관리자 URL 추가
    url(r'^admin/', include('django_app.admin_urls')),	

    ## 로그인 페이지
    path('', base_views.Index.as_view(), name='index'),

    ## 로그인 이후 기본 메인 페이지
    path('main', base_views.Main.as_view(), name='main'),

    ## 회원 가입 페이지 
    path('register', base_views.Register.as_view(), name = 'register'),

    ## 회원 가입 완료 시 회원 정보 저장 기능 모듈
    path('register_form', base_views.Register_module, name="register_form"),

    ## 로그인, 로그아웃 모듈
    path('login_module', base_views.Login_module, name="login_module"),
    path('logout_module', base_views.Logout_module, name="logout_module"),

    ## 중복 체크
    path('duplicate_check/', base_views.duplicateCheck, name="duplicate_check"),

    ## 작업 리스트
    path('task_list', base_views.Task_list.as_view(), name = "task_list"),
    path('abnormal_task_list', base_views.Abnormal_task_list.as_view(), name = "abnormal_task_list"),
    path('interface_task_list', base_views.Interface_task_list.as_view(), name = "interface_task_list"),

    ## 1차 검수 리스트 페이지
    path('inspect_list_1st', base_views.Inspect_list_1st.as_view(), name = 'inspect_list_1st'),

    ## 2차 검수 리스트 페이지
    path('inspect_list_2nd', base_views.Inspect_list_2nd.as_view(), name = 'inspect_list_2nd'),

    ## 3차 검수 리스트 페이지
    path('inspect_list_3rd', base_views.Inspect_list_3rd.as_view(), name = 'inspect_list_3rd'),

    ## 작업 페이지 
    path('task_process/<str:task_num>/', task_views.Task_process.as_view(), name = 'task_process'),
    
    ## 작업 페이지 동작 기능 모듈
    path('task_process/<str:task_num>/task_api', task_views.task_api, name = 'task_api'),
    path("task_process/<str:task_num>/task_complete", task_views.task_complete_module, name ='task_complete'),
    path("task_process/<str:task_num>/task_middle_cancel", task_views.task_middle_cancel_module, name ='task_middle_cancel'),
    path('task_process/<str:task_num>/task_region_delete', task_views.task_region_delete, name = 'task_region_delete'),
    

    ## 재작업 페이지
    path("re_task_process/<str:task_num>/", task_views.Re_Task_process.as_view(), name = 're_task_process'),

    ## 재작업 페이지 동작 기능 모듈
    path("re_task_process/<str:task_num>/task_api", task_views.task_api, name = 'task_api'),
    path("re_task_process/<str:task_num>/check_api", task_views.check_api, name = 'check_api'),
    path("re_task_process/<str:task_num>/task_complete", task_views.task_complete_module, name ='task_complete'),
    path("re_task_process/<str:task_num>/task_middle_cancel", task_views.task_middle_cancel_module, name ='task_middle_cancel'),
    path('re_task_process/<str:task_num>/task_region_delete', task_views.task_region_delete, name = 'task_region_delete'),




    ## 이상행동 작업 페이지 
    path('task_process_abnormal/<str:task_num>/', task_views_abnormal.Task_process.as_view(), name = 'task_process_abnormal'),
    
    ## 이상행동 작업 페이지 동작 기능 모듈
    path('task_process_abnormal/<str:task_num>/task_api', task_views_abnormal.task_api, name = 'task_api'),
    path("task_process_abnormal/<str:task_num>/task_complete", task_views_abnormal.task_complete_module, name ='task_complete'),
    path("task_process_abnormal/<str:task_num>/task_middle_cancel", task_views_abnormal.task_middle_cancel_module, name ='task_middle_cancel'),

    ## 이상행동 재작업 페이지
    path("re_task_process_abnormal/<str:task_num>/", task_views_abnormal.Re_Task_process.as_view(), name = 're_task_process_abnormal'),

    ## 이상행동 재작업 페이지 동작 기능 모듈
    path("re_task_process_abnormal/<str:task_num>/task_api", task_views_abnormal.task_api, name = 'task_api'),
    path("re_task_process_abnormal/<str:task_num>/check_api", task_views_abnormal.check_api, name = 'check_api'),
    path("re_task_process_abnormal/<str:task_num>/task_complete", task_views_abnormal.task_complete_module, name ='task_complete'),
    path("re_task_process_abnormal/<str:task_num>/task_middle_cancel", task_views_abnormal.task_middle_cancel_module, name ='task_middle_cancel'),



    ## 1차 검수 페이지
    path('inspect_process_1st/<str:task_num>/', inspect_views_1st.Inspect_process.as_view(), name = 'inspect_process_1st'),

    ## 검수 페이지 동작 기능 모듈
    path("inspect_process_1st/<str:task_num>/task_api", inspect_views_1st.task_api, name = 'task_api'),
    path("inspect_process_1st/<str:task_num>/check_api", inspect_views_1st.check_api, name = 'check_api'),
    path("inspect_process_1st/<str:task_num>/task_complete", inspect_views_1st.task_complete_module, name ='task_complete'),
    path("inspect_process_1st/<str:task_num>/inspect_middle_cancel", inspect_views_1st.inspect_middle_cancel_module, name ='inspect_middle_cancel'),

    ## 재검수 페이지
    path('re_inspect_process_1st/<str:task_num>/', inspect_views_1st.Re_Inspect_process.as_view(), name = 're_inspect_process_1st'),

    ## 재검수 페이지 동작 기능 모듈
    path("re_inspect_process_1st/<str:task_num>/task_api", inspect_views_1st.task_api, name = 'task_api'),
    path("re_inspect_process_1st/<str:task_num>/check_api", inspect_views_1st.check_api, name = 'check_api'),
    path("re_inspect_process_1st/<str:task_num>/task_complete", inspect_views_1st.task_complete_module, name ='task_complete'),
    path("re_inspect_process_1st/<str:task_num>/inspect_middle_cancel", inspect_views_1st.inspect_middle_cancel_module, name ='inspect_middle_cancel'),







    ## 2차 검수 페이지
    path('inspect_process_2nd/<str:task_num>/', inspect_views_2nd.Inspect_process.as_view(), name = 'inspect_process_2nd'),

    ## 2차 검수 페이지 동작 기능 모듈
    path("inspect_process_2nd/<str:task_num>/task_api", inspect_views_2nd.task_api, name = 'task_api'),
    path("inspect_process_2nd/<str:task_num>/check_api", inspect_views_2nd.check_api, name = 'check_api'),
    path("inspect_process_2nd/<str:task_num>/task_complete", inspect_views_2nd.task_complete_module, name ='task_complete'),
    path("inspect_process_2nd/<str:task_num>/inspect_middle_cancel", inspect_views_2nd.inspect_middle_cancel_module, name ='inspect_middle_cancel'),

    ## 2차 재검수 페이지
    path('re_inspect_process_2nd/<str:task_num>/', inspect_views_2nd.Re_Inspect_process.as_view(), name = 're_inspect_process_2nd'),

    ## 2차 재검수 페이지 동작 기능 모듈
    path("re_inspect_process_2nd/<str:task_num>/task_api", inspect_views_2nd.task_api, name = 'task_api'),
    path("re_inspect_process_2nd/<str:task_num>/check_api", inspect_views_2nd.check_api, name = 'check_api'),
    path("re_inspect_process_2nd/<str:task_num>/task_complete", inspect_views_2nd.task_complete_module, name ='task_complete'),
    path("re_inspect_process_2nd/<str:task_num>/inspect_middle_cancel", inspect_views_2nd.inspect_middle_cancel_module, name ='inspect_middle_cancel'),






    ## 3차 검수 페이지
    path('inspect_process_3rd/<str:task_num>/', inspect_views_3rd.Inspect_process.as_view(), name = 'inspect_process_3rd'),


    ## 3차 검수 페이지 동작 기능 모듈
    path("inspect_process_3rd/<str:task_num>/task_api", inspect_views_3rd.task_api, name = 'task_api_3rd'),
    path("inspect_process_3rd/<str:task_num>/check_api", inspect_views_3rd.check_api, name = 'check_api_3rd'),
    path("inspect_process_3rd/<str:task_num>/task_complete", inspect_views_3rd.task_complete_module, name ='task_complete_3rd'),
    path("inspect_process_3rd/<str:task_num>/inspect_middle_cancel", inspect_views_3rd.inspect_middle_cancel_module, name ='inspect_middle_cancel_3rd'),

    ## 3차 재검수 페이지
    path('re_inspect_process_3rd/<str:task_num>/', inspect_views_3rd.Re_Inspect_process.as_view(), name = 're_inspect_process_3rd'),

    ## 3차 재검수 페이지 동작 기능 모듈
    path("re_inspect_process_3rd/<str:task_num>/task_api", inspect_views_3rd.task_api, name = 'task_api'),
    path("re_inspect_process_3rd/<str:task_num>/check_api", inspect_views_3rd.check_api, name = 'check_api'),
    path("re_inspect_process_3rd/<str:task_num>/task_complete", inspect_views_3rd.task_complete_module, name ='task_complete'),
    path("re_inspect_process_3rd/<str:task_num>/inspect_middle_cancel", inspect_views_3rd.inspect_middle_cancel_module, name ='inspect_middle_cancel'),




    ## 나의 작업 페이지
    path('mytask', mypage_views.My_Task.as_view(), name = 'mytask'),
    path('mytask_record', mypage_views.My_Task_Record.as_view(), name = 'mytask_record'),

    path('task_cancel/<str:task_num>', mypage_views.task_cancel_module, name = 'task_cancel'),
    path('inspect_cancel_1st/<str:task_num>', mypage_views.inspect_cancel_module_1st, name = 'inspect_cancel_1st'),
    path('inspect_cancel_2nd/<str:task_num>', mypage_views.inspect_cancel_module_2nd, name = 'inspect_cancel_2nd'),
    path('inspect_cancel_3nd/<str:task_num>', mypage_views.inspect_cancel_module_3rd, name = 'inspect_cancel_3rd'),

    ## 가이드라인 
    path('interface_guide_list', base_views.interface_guide_list.as_view(), name = "interface_guide_list"),
]