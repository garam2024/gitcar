from django.contrib import admin
from django.urls import path
# from django_app import views
from django.conf.urls.static import static
from django.conf import settings
# from django.views.static import serve 

from .views import base_views, task_views, task_views_abnormal, inspect_views_1st, inspect_views_2nd, inspect_views_3rd, \
    api_views, mypage_views
from .views import admin_views, admin_return_views
## URL 변경 호출
from django.conf.urls import url, include


urlpatterns = [


    # 관리자 URL 추가
    url(r'^admin/', include('django_app.admin_urls')),



    # 로그인 페이지
    path('', base_views.Index.as_view(), name='index'),

    # 로그인 이후 기본 메인 페이지
    path('main', base_views.Main.as_view(), name='main'),

    # 회원 가입 페이지
    path('register', base_views.Register.as_view(), name='register'),

    # 회원 가입 완료 시 회원 정보 저장 기능 모듈
    path('register_form', base_views.Register_module, name="register_form"),

    # 로그인, 로그아웃 모듈
    path('login_module', base_views.Login_module, name="login_module"),
    path('logout_module', base_views.Logout_module, name="logout_module"),

    # 중복 체크
    path('duplicate_check/', base_views.duplicateCheck, name="duplicate_check"),


    # 작업상태목록불러오기
    path('get_statusDic',base_views.get_statusDic,name = 'get_statusDic'),

    # 라벨링 작업 리스트 페이지
    path('work_list', base_views.Work_list.as_view(), name="work_list"),

    # 1차 검수 리스트 페이지
    path('inspect_list_1st', base_views.Inspect_list_1st.as_view(), name='inspect_list_1st'),

    # 2차 검수 리스트 페이지
    path('inspect_list_2nd', base_views.Inspect_list_2nd.as_view(), name='inspect_list_2nd'),

    # 3차 검수 리스트 페이지
    path('inspect_list_3rd', base_views.Inspect_list_3rd.as_view(), name='inspect_list_3rd'),

    # 가이드라인
    path('interface_guide_list', base_views.interface_guide_list.as_view(), name="interface_guide_list"),

    # 진행중인 작업 리스트 페이지
    path('mywork', mypage_views.My_Task.as_view(), name = 'mywork'),

    # 나의 작업목록
    path('mywork_record', mypage_views.My_Task_Record.as_view(), name='mywork_record'),
    path('myinspect-record', mypage_views.My_Inspect_Record.as_view(), name='myinspect-record'),


    # 진행중인 작업 취소
    path('work_cancel/<str:task_num>', mypage_views.task_cancel_module, name='work_cancel'),

    # 진행중인 1차 검수 취소
    path('inspect_cancel_1st/<str:task_num>', mypage_views.inspect_cancel_module_1st, name='inspect_cancel_1st'),

    # 진행중인 2차 검수 취소
    path('inspect_cancel_2nd/<str:task_num>', mypage_views.inspect_cancel_module_2nd, name='inspect_cancel_2nd'),

    # 진행중인 3차 검수 취소
    path('inspect_cancel_3nd/<str:task_num>', mypage_views.inspect_cancel_module_3rd, name='inspect_cancel_3rd'),

    # 진행중인 작업의 반려사유 확인
    path('mywork/bring_memo', mypage_views.bring_memo, name='bring_memo'),


    # 작업 페이지
    path('work_process/<str:work_id>/<str:work_type>/', task_views_abnormal.Work_process.as_view(), name='work_process'),

    # 작업 페이지 동작 기능 모듈 : 클립 저장
    path('work_process/<str:task_num>/<str:work_type>/task_api', task_views.task_api, name='task_api'),

    # 작업 페이지 동작 기능 모듈 : 클립 모두 저장
    # path('work_process/<str:task_num>/<str:work_type>/all_task_api', task_views.all_task_api, name='task_api'),

    # 작업 페이지 동작 기능 모듈 : 클립 삭제
    path('work_process/<str:task_num>/<str:work_type>/task_region_delete', task_views.task_region_delete, name='task_region_delete'),

    # 재작업 페이지 xml Region 선택 기능
    path('work_process/<str:task_num>/<str:work_type>/xml_insert', task_views.task_xml_insert, name='work_xml_delete'),

    # 작업 페이지 동작 기능 모듈 : 최종 제출
    path("work_process/<str:task_num>/<str:work_type>/task_complete", task_views.task_complete_module, name='task_complete'),

    # 작업 페이지 동작 기능 모듈 : 이전 버젼 잔재 모듈
    path("work_process/<str:task_num>/<str:work_type>/check_task", task_views.check_task, name='check_api'),
    path("work_process/<str:task_num>/<str:work_type>/task_middle_cancel", task_views.task_middle_cancel_module, name='task_middle_cancel'),




    # 재작업 페이지
    path("re_work_process/<str:task_num>/<str:work_type>/", task_views.Re_Task_process.as_view(), name='re_work_process'),

    # 재작업 이전 작업 불러오기
    path("re_work_process/<str:task_num>/<str:work_type>/check_task", task_views.check_task, name='check_task'),

    # 작업 페이지 동작 기능 모듈 : 클립 저장
    path("re_work_process/<str:task_num>/<str:work_type>/task_api", task_views.task_api, name='task_api'),

    # 작업 페이지 동작 기능 모듈 : 클립 삭제
    path('re_work_process/<str:task_num>/<str:work_type>/task_region_delete', task_views.task_region_delete, name='task_region_delete'),

    # 재작업 페이지 xml Region 선택 기능
    path('re_work_process/<str:task_num>/<str:work_type>/xml_insert', task_views.task_xml_insert, name='re_work_xml_delete'),

    # 작업 페이지 동작 기능 모듈 : 최종 제출
    path("re_work_process/<str:task_num>/<str:work_type>/task_complete", task_views.task_complete_module, name='task_complete'),

    # 작업 페이지 동작 기능 모듈 : 이전 버젼 잔재 모듈
    path("re_work_process/<str:task_num>/<str:work_type>/check_api", task_views.check_api, name='check_api'),
    path("re_work_process/<str:task_num>/<str:work_type>/task_middle_cancel", task_views.task_middle_cancel_module, name='task_middle_cancel'),
    path("re_work_process/<str:task_num>/<str:work_type>/get_statusDic", base_views.get_statusDic, name = "get_statusDic"),


  ##


    ## 1차 검수 페이지
    path('inspect_process_1st/<str:task_num>/<str:work_type>/', inspect_views_1st.Inspect_process.as_view(), name = 'inspect_process_1st'),
    #작업 상태 검색 모듈
    path('inspect_process_1st/<str:task_num>/<str:work_type>/get_statusDic', base_views.get_statusDic, name = 'get_statusDic'),
    # 1차 검수 페이지 동작 기능 모듈 : 클립 저장
    path("inspect_process_1st/<str:task_num>/<str:work_type>/task_api", inspect_views_1st.task_api, name = 'task_api'),
    # 1차 검수 페이지 동작 기능 모듈 : 클립 반려 사유 및 상태 저장
    path("inspect_process_1st/<str:task_num>/<str:work_type>/task_inspect", inspect_views_1st.task_inspect, name = 'task_inspect'),
    # 1차 검수 페이지 동작 기능 모듈 : 최종 제출
    path("inspect_process_1st/<str:task_num>/<str:work_type>/task_complete", inspect_views_1st.task_complete_module, name ='task_complete'),

    # 1차 검수 페이지 동작 기능 모듈 : 이전 버젼 잔재 모듈
    path("inspect_process_1st/<str:task_num>/check_api", inspect_views_1st.check_api, name = 'check_api'),
    path("inspect_process_1st/<str:task_num>/inspect_middle_cancel", inspect_views_1st.inspect_middle_cancel_module, name ='inspect_middle_cancel'),
    path("inspect_process_1st/<str:task_num>/<str:work_type>/check_task", inspect_views_1st.check_task, name ='check_task'),





    ## 1차 재검수 페이지
    path('re_inspect_process_1st/<str:task_num>/<str:work_type>/', inspect_views_1st.Re_Inspect_process.as_view(), name = 're_inspect_process_1st'),

    # 1차 재검수 페이지 동작 기능 모듈 : 클립 저장
    path("re_inspect_process_1st/<str:task_num>/<str:work_type>/task_api", inspect_views_1st.task_api, name = 'task_api'),

    # 1차 재검수 페이지 동작 기능 모듈 : 최종 제출
    path("re_inspect_process_1st/<str:task_num>/<str:work_type>/task_complete", inspect_views_1st.task_complete_module, name ='task_complete'),

    # 1차 검수 페이지 동작 기능 모듈 : 클립 반려 사유 및 상태 저장
    path("re_inspect_process_1st/<str:task_num>/<str:work_type>/task_inspect", inspect_views_1st.task_inspect, name = 'task_inspect'),

    # 1차 재검수 페이지 동작 기능 모듈 : 이전 버젼 잔재 모듈
    path("re_inspect_process_1st/<str:task_num>/check_api", inspect_views_1st.check_api, name = 'check_api'),
    path("re_inspect_process_1st/<str:task_num>/inspect_middle_cancel", inspect_views_1st.inspect_middle_cancel_module, name ='inspect_middle_cancel'),
    path("re_inspect_process_1st/<str:task_num>/<str:work_type>/check_task", inspect_views_1st.check_task, name ='check_task'),




    ## 2차 검수 페이지
    path('inspect_process_2nd/<str:task_num>/<str:work_type>/', inspect_views_2nd.Inspect_process.as_view(), name = 'inspect_process_2nd'),

    # 2차 검수 페이지 동작 기능 모듈 : 클립 저장
    path("inspect_process_2nd/<str:task_num>/<str:work_type>/task_api", inspect_views_2nd.task_api, name = 'task_api'),

    # 2차 검수 페이지 동작 기능 모듈 : 최종 제출
    path("inspect_process_2nd/<str:task_num>/<str:work_type>/task_complete", inspect_views_2nd.final_complete_inspect2, name ='final_complete_inspect2 '),

    # 2차 검수 페이지 동작 기능 모듈 : 이전 버젼 잔재 모듈
    path("inspect_process_2nd/<str:task_num>/check_api", inspect_views_2nd.check_api, name = 'check_api'),
    path("inspect_process_2nd/<str:task_num>/inspect_middle_cancel", inspect_views_2nd.inspect_middle_cancel_module, name ='inspect_middle_cancel'),
    path("inspect_process_2nd/<str:task_num>/<str:work_type>/check_task", inspect_views_2nd.check_task, name='check_task'),
    # 2차 검수 동작 기능 모듈 : 클립 삭제
    path('inspect_process_2nd/<str:task_num>/<str:work_type>/task_region_delete', task_views.task_region_delete, name='task_region_delete_inspect2'),




    ## 2차 재검수 페이지
    path('re_inspect_process_2nd/<str:task_num>/<str:work_type>/', inspect_views_2nd.Re_Inspect_process.as_view(), name = 're_inspect_process_2nd'),

    # 2차 재검수 페이지 동작 기능 모듈 : 클립 저장
    path("re_inspect_process_2nd/<str:task_num>/<str:work_type>/task_api", inspect_views_2nd.task_api, name = 'task_api'),

    # 2차 재검수 페이지 동작 기능 모듈 : 최종 제출
    path("re_inspect_process_2nd/<str:task_num>/<str:work_type>/task_complete", inspect_views_2nd.final_complete_inspect2, name ='final_complete_inspect2'),

    # 2차 재검수 페이지 동작 기능 모듈 : 이전 버젼 잔재 모듈
    path("re_inspect_process_2nd/<str:task_num>/check_api", inspect_views_2nd.check_api, name = 'check_api'),
    path("re_inspect_process_2nd/<str:task_num>/inspect_middle_cancel", inspect_views_2nd.inspect_middle_cancel_module, name ='inspect_middle_cancel'),
    path("re_inspect_process_2nd/<str:task_num>/<str:work_type>/check_task", inspect_views_2nd.check_task, name='check_task'),
    # 2차 재검수 동작 기능 모듈 : 클립 삭제
    path('re_inspect_process_2nd/<str:task_num>/<str:work_type>/task_region_delete', task_views.task_region_delete, name='task_region_delete_re_inspect2'),




    ## 3차 검수 페이지
    path('inspect_process_3rd/<str:task_num>/<str:work_type>/', inspect_views_3rd.Inspect_process.as_view(), name = 'inspect_process_3rd'),

    # 3차 검수 페이지 동작 기능 모듈 : 클립 저장
    path("inspect_process_3rd/<str:task_num>/task_api", inspect_views_3rd.task_api, name = 'task_api_3rd'),

    # 3차 검수 페이지 동작 기능 모듈 : 최종 제출
    path("inspect_process_3rd/<str:task_num>/<str:work_type>/final_complete_inspect2", inspect_views_3rd.task_complete_module, name ='task_complete_3rd'),

    # 3차 검수 페이지 동작 기능 모듈 : 이전 버젼 잔재 모듈
    path("inspect_process_3rd/<str:task_num>/check_api", inspect_views_3rd.check_api, name = 'check_api_3rd'),
    path("inspect_process_3rd/<str:task_num>/inspect_middle_cancel", inspect_views_3rd.inspect_middle_cancel_module, name ='inspect_middle_cancel_3rd'),
    path("inspect_process_3rd/<str:task_num>/<str:work_type>/check_task", inspect_views_3rd.check_task, name='check_task'),




    ## 3차 재검수 페이지
    path('re_inspect_process_3rd/<str:task_num>/<str:work_type>/', inspect_views_3rd.Re_Inspect_process.as_view(), name = 're_inspect_process_3rd'),

    # 3차 재검수 페이지 동작 기능 모듈 : 클립 저장
    path("re_inspect_process_3rd/<str:task_num>/task_api", inspect_views_3rd.task_api, name = 'task_api'),

    # 3차 재검수 페이지 동작 기능 모듈 : 최종 제출
    path("re_inspect_process_3rd/<str:task_num>/<str:work_type>/final_complete_inspect2", inspect_views_3rd.task_complete_module, name ='task_complete'),

    # 3차 재검수 페이지 동작 기능 모듈 : 이전 버젼 잔재 모듈
    path("re_inspect_process_3rd/<str:task_num>/check_api", inspect_views_3rd.check_api, name = 'check_api'),
    path("re_inspect_process_3rd/<str:task_num>/inspect_middle_cancel", inspect_views_3rd.inspect_middle_cancel_module, name ='inspect_middle_cancel'),
    path("re_inspect_process_3rd/<str:task_num>/<str:work_type>/check_task", inspect_views_3rd.check_task, name='check_task'),

    # 공통의 기능 url 등록하기
    path('bring_notice', task_views.bringNotice, name='bring_notice'),  # 공지 사항 띄워주기
    path('update_bookmark', task_views.updateBookmark, name='update_bookmark'),  # 북마크 업데이트

    ## 게시판 페이지
    path('board_list', mypage_views.BoardList.as_view(), name= 'mypage_board_list'),
    path('borad_write', mypage_views.WriteBoard.as_view(), name= 'mypage_borad_write'),
    path('board_read', mypage_views.ReadBoard.as_view(), name= 'mypage_board_read'),
    path('board_update', mypage_views.UpdateBoard.as_view(), name= 'mypage_board_update'),
    path('board_delete', mypage_views.DeleteBoard.as_view(), name= 'mypage_board_delete'),
    path('board_update_option', mypage_views.UpdateOptionBoard, name= 'mypage_board_update_option'),
]
