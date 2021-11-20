"""django_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
# from django_app import views
from django.conf.urls.static import static
from django.conf import settings
# from django.views.static import serve 

## URL 변경 호출
from django.conf.urls import url, include

urlpatterns = [

    ## django_app안의 url 추가
    path('', include('django_app.urls')), 

    # ## 관리자 URL 추가
    # url(r'^admin/', include('django_project.admin_urls')),	

    # ## 로그인 페이지
    # path('', views.Index.as_view(), name='index'),

    # ## 로그인 이후 기본 메인 페이지
    # path('main', views.Main.as_view(), name='main'),

    # ## 회원 가입 페이지 
    # path('register', views.Register.as_view(), name = 'register'),

    # ## 회원 가입 완료 시 회원 정보 저장 기능 모듈
    # path('register_form', views.Register_module, name="register_form"),

    # ## 로그인, 로그아웃 모듈
    # path('login_module', views.Login_module, name="login_module"),
    # path('logout_module', views.Logout_module, name="logout_module"),

    # ## 중복 체크
    # path('duplicate_check/', views.duplicateCheck, name="duplicate_check"),

    # ## 작업 리스트
    # path('task_list', views.Task_list.as_view(), name = "task_list"),

    # ## 작업 페이지 
    # path('task_process/<str:task_num>/', views.Task_process.as_view(), name = 'task_process'),
    
    # ## 작업 페이지 동작 기능 모듈
    # path('task_process/<str:task_num>/task_api', views.task_api, name = 'task_api'),
    # path("task_process/<str:task_num>/task_complete", views.task_complete_module, name ='task_complete'),
    # path("task_process/<str:task_num>/task_middle_cancel", views.task_middle_cancel_module, name ='task_middle_cancel'),

    # ## 재작업 페이지
    # path("re_task_process/<str:task_num>/", views.Re_Task_process.as_view(), name = 're_task_process'),

    # ## 재작업 페이지 동작 기능 모듈
    # path("re_task_process/<str:task_num>/task_api", views.task_api, name = 'task_api'),
    # path("re_task_process/<str:task_num>/check_api", views.check_api, name = 'check_api'),
    # path("re_task_process/<str:task_num>/task_complete", views.task_complete_module, name ='task_complete'),
    # path("re_task_process/<str:task_num>/task_middle_cancel", views.task_middle_cancel_module, name ='task_middle_cancel'),


    # ## 검수 리스트 페이지
    # path('inspect_list_1st', views.Inspect_list_1st.as_view(), name = 'inspect_list_1st'),

    # ## 검수 페이지
    # path('inspect_process_1st/<str:task_num>/', views.Inspect_process_1st.as_view(), name = 'inspect_process_1st'),

    # ## 검수 페이지 동작 기능 모듈
    # path("inspect_process_1st/<str:task_num>/task_api", views.task_api, name = 'task_api'),
    # path("inspect_process_1st/<str:task_num>/check_api", views.check_api, name = 'check_api'),
    # path("inspect_process_1st/<str:task_num>/task_complete", views.task_complete_module, name ='task_complete'),
    # path("inspect_process_1st/<str:task_num>/inspect_middle_cancel", views.inspect_middle_cancel_module, name ='inspect_middle_cancel'),

    # ## 재검수 페이지
    # path('re_inspect_process/<str:task_num>/', views.Re_Inspect_process.as_view(), name = 're_inspect_process'),

    # ## 재검수 페이지 동작 기능 모듈
    # path("re_inspect_process/<str:task_num>/task_api", views.task_api, name = 'task_api'),
    # path("re_inspect_process/<str:task_num>/check_api", views.check_api, name = 'check_api'),
    # path("re_inspect_process/<str:task_num>/task_complete", views.task_complete_module, name ='task_complete'),
    # path("re_inspect_process/<str:task_num>/inspect_middle_cancel", views.inspect_middle_cancel_module, name ='inspect_middle_cancel'),



    # ## 2차 검수 리스트 페이지
    # path('inspect_list_2nd', views.Inspect_list_2nd.as_view(), name = 'inspect_list_2nd'),

    # ## 2차 검수 페이지
    # path('inspect_process_2nd/<str:task_num>/', views.Inspect_process_2nd.as_view(), name = 'inspect_process_2nd'),

    # ## 2차 검수 페이지 동작 기능 모듈
    # path("inspect_process_2nd/<str:task_num>/task_api", views.task_api, name = 'task_api'),
    # path("inspect_process_2nd/<str:task_num>/check_api", views.check_api, name = 'check_api'),
    # path("inspect_process_2nd/<str:task_num>/task_complete", views.task_complete_module, name ='task_complete'),
    # path("inspect_process_2nd/<str:task_num>/inspect_middle_cancel", views.inspect_middle_cancel_module, name ='inspect_middle_cancel'),

    # ## 2차 재검수 페이지
    # path('re_inspect_process_2nd/<str:task_num>/', views.Re_Inspect_process_2nd.as_view(), name = 're_inspect_process_2nd'),

    # ## 2차 재검수 페이지 동작 기능 모듈
    # path("re_inspect_process_2nd/<str:task_num>/task_api", views.task_api, name = 'task_api'),
    # path("re_inspect_process_2nd/<str:task_num>/check_api", views.check_api, name = 'check_api'),
    # path("re_inspect_process_2nd/<str:task_num>/task_complete", views.task_complete_module, name ='task_complete'),
    # path("re_inspect_process_2nd/<str:task_num>/inspect_middle_cancel", views.inspect_middle_cancel_module, name ='inspect_middle_cancel'),


    

    # ## 3차 검수 리스트 페이지
    # path('inspect_list_3rd', views.Inspect_list_3rd.as_view(), name = 'inspect_list_3rd'),

    # ## 3차 검수 페이지
    # path('inspect_process_3rd/<str:task_num>/', views.Inspect_process_3rd.as_view(), name = 'inspect_process_3rd'),


    

    # ## 3차 검수 페이지 동작 기능 모듈
    # path("inspect_process_3rd/<str:task_num>/task_api", views.task_api, name = 'task_api_3rd'),
    # path("inspect_process_3rd/<str:task_num>/check_api", views.check_api, name = 'check_api_3rd'),
    # path("inspect_process_3rd/<str:task_num>/task_complete", views.task_complete_module, name ='task_complete_3rd'),
    # path("inspect_process_3rd/<str:task_num>/inspect_middle_cancel", views.inspect_middle_cancel_module, name ='inspect_middle_cancel_3rd'),

    # ## 3차 재검수 페이지
    # path('re_inspect_process_3rd/<str:task_num>/', views.Re_Inspect_process_3rd.as_view(), name = 're_inspect_process_3rd'),

    # ## 3차 재검수 페이지 동작 기능 모듈
    # path("re_inspect_process_3rd/<str:task_num>/task_api", views.task_api, name = 'task_api'),
    # path("re_inspect_process_3rd/<str:task_num>/check_api", views.check_api, name = 'check_api'),
    # path("re_inspect_process_3rd/<str:task_num>/task_complete", views.task_complete_module, name ='task_complete'),
    # path("re_inspect_process_3rd/<str:task_num>/inspect_middle_cancel", views.inspect_middle_cancel_module, name ='inspect_middle_cancel'),




    # ## 작업 정보 요청 모듈
    # path('info_api', views.duplicateCheck, name="duplicate_check"),

    # ## 나의 작업 페이지

    # path('mytask', views.My_Task.as_view(), name = 'mytask'),
    # path('mytask_record', views.My_Task_Record.as_view(), name = 'mytask_record'),
    
    # path('task_cancel/<str:task_num>', views.task_cancel_module, name = 'task_cancel'),
    # path('inspect_cancel/<str:task_num>', views.inspect_cancel_module, name = 'inspect_cancel'),

    # # path('task_middle_cancel', views.task_middle_cancel_module, name = 'task_middle_cancel'),
    # # path('inspect_middle_cancel', views.inspect_middle_cancel_module, name = 'inspect_middle_cancel'),
]

urlpatterns += \
    static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
urlpatterns += \
    static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)