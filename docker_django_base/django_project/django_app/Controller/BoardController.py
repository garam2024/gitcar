from ..Controller.getTaskInfo import *

class BoardController():
    def __init__(self):
        self.res_dic = {}

    def getList(self, request):
        sql = sqlMethod()
        option = json.loads(request.body)

        userOption = "and account_id='" + str(request.user) + "'"
        userInfo = sql.select_workList('django_app_profile', data_dic={}, column_list=['*'], option=userOption)[0]

        page = (int(option['start']) - 1) * int(option['showListLength'])
        column_list = ['content_id', 'regdate', 'views', 'writer', 'title', 'option']

        if userInfo['group_id'] == '-':  # 최상위 관리자는 항상 전체 게시글을 본다.
            option = 'order by content_id desc Limit ' + str(option['showListLength']) + 'offset ' + str(page)
            lengthOption = None
        else:  # 회사 관리자와 일반 유저들은 자기 그룹 + 최상위 관리자의 글을 볼 수 있다.
            option = "and group_id IN('" + str(
                userInfo['group_id']) + "', '-' )" + 'order by content_id desc Limit ' + str(
                option['showListLength']) + 'offset ' + str(page)
            lengthOption = "and group_id='" + str(userInfo['group_id']) + "'"

        self.res_dic['boardList'] = sql.select_workList('django_app_board', data_dic={}, column_list=column_list, option=option)
        self.res_dic['boardLength'] = sql.select_workList('django_app_board', data_dic={}, column_list=['count(*)'],
                                          option=lengthOption)
        self.res_dic['userInfo'] = userInfo

        return self.res_dic

    def create(self, request):

        sql = sqlMethod()

        userOption = "and account_id='" + str(request.user) + "'"
        userInfo = sql.select_workList('django_app_profile', data_dic={}, column_list=['*'], option=userOption)[0]

        dict = {
            'board_id': 'notice_board',
            'writer': str(request.user),
            'title': request.POST['title'],
            'content': request.POST['editor'],
            'option': request.POST['option'],
            'group_id': userInfo['group_id']
        }

        sql.insert_workList('django_app_board', dict)

    def read(self, request):
        sql = sqlMethod()
        self.res_dic['board_content'] = \
        sql.select_workList('django_app_board', data_dic={'content_id': str(request.GET['content_id'])})[0]
        userOption = "and account_id='" + str(request.user) + "'"
        userInfo = sql.select_workList('django_app_profile', data_dic={}, column_list=['*'], option=userOption)[0]

        if userInfo['is_superuser'] == True:
            self.res_dic['check'] = True

        return self.res_dic

    def update(self, request):
        sql = sqlMethod()

        dict = {
            'writer': str(request.user),
            'title': request.POST['title'],
            'content': request.POST['editor'],
            'option': request.POST['option']
        }

        con_dic = {
            'content_id': request.POST['content_id']
        }

        sql.update_status('django_app_board', data_dic=dict, con_dic=con_dic)

    def delete(self, request):
        sql = sqlMethod()
        sql.delete('django_app_board', data_dic={'content_id': str(request.GET['content_id'])})