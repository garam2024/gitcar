function NWC(x) {
//콤마처리
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

let currentPage = 0;
console.log('작동')

if (window.location.pathname == '/admin/index/'){

$.ajax({
    type:'POST',
    url : '/admin/index/get_statusDic',
    async:false,
    success : function(data){
        dbinfo = data
        console.log(dbinfo)
    },
    error:function(err){
        alert('작업상태불러오기실패_새로고침을눌러주세요')
    },
})


function SortTable(table){
    this.table = table
} 

SortTable.prototype.sorting = function(n){
    let rows, switching, i, x, y, shouldSwitch, switchCount = 0
    table = document.querySelector(this.table)
    dir = 'asc'
    switching = true

    while(switching){
        switching = false
        rows = table.rows
        for(i = 1; i < (rows.length - 1); i++){
            shouldSwitch = false
            x = rows[i].getElementsByTagName('TD')[n]
            y = rows[i + 1].getElementsByTagName('TD')[n]

            if(dir === 'asc'){
                if(x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()){
                    shouldSwitch = true;
                    break
                }
            }else if(dir === 'desc'){
                if(x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()){
                    shouldSwitch = true;
                    break
                }
            }else{
                break
            }
        }

        if(shouldSwitch){
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
            switching = true
            switchCount++
        }else{
            if(switchCount === 0 && dir === 'asc'){
                dir = 'desc'
                switching = true
            }
        }
    }

}

const tableTab01 = new SortTable('#table-tab-01')
const tableTab02 = new SortTable('#table-tab-02')

if (window.location.pathname == '/admin/index/'){
const tableSortingButton01 = document.querySelector('#table-tab-01 thead tr')
tableSortingButton01.addEventListener('click', function(e){
    if(!e.target.dataset.number) return
    tableTab01.sorting(e.target.dataset.number)
})
}
else {
const tableSortingButton02 = document.querySelector('#table-tab-02 thead tr')
tableSortingButton02.addEventListener('click', function(e){
    if(!e.target.dataset.number) return
    tableTab02.sorting(e.target.dataset.number)
})
}

function jsf_change(){

    $("#workerNm").attr("placeholder",$("#workerType option:checked").text())
}







if (window.location.pathname == '/admin/index/'){
function Tabmenu(tabEl, btnEl){
    this.tabEl = tabEl
    this.btnEl = btnEl

    this._tabEl = document.querySelectorAll(this.tabEl)
    this._btnEl = document.querySelectorAll(this.btnEl)

    this.activeBtn
    this.activeTab
}

Tabmenu.prototype.showTab = function(activeBtn, activeTab){
    let { _btnEl, _tabEl } = this

    _btnEl.forEach(function(el, i){
        el.addEventListener('click', function(){

            if(activeBtn){
                activeBtn.classList.remove('active')
                activeTab.classList.remove('active')
            }
            el.classList.add('active')
            _tabEl[i].classList.add('active')
            activeBtn = el
            activeTab = _tabEl[i]
        })
    })
}


let searchData = {
    workerNm: '',
    workType: '',
    workStatus: '',
    searchBgn: '',
    searchEnd: '',
    groupId: ''
}

var searchForm = document.forms.searchForm

searchForm.addEventListener('submit', e => {
    e.preventDefault()
    jsf_ajax_dataloading(0)
})


function jsf_ajax_dataloading(page){
    let user_group_id = $("#group_id").val();
    if(user_group_id == "-"){
        var { workerType, workerNm, workType, workStatus, searchBgn, searchEnd, workGroup } = searchForm;
        console.log(workerType.value,workerNm.value, workType.value, workStatus.value, searchBgn.value, searchEnd.value);
        searchData = {
            workerNm: workerNm.value,
            workerType: $("#workerType").val(),
            workType: workType.value,
            workStatus: workStatus.value,
            searchBgn: searchBgn.value,
            searchEnd: searchEnd.value,
            groupId: workGroup.value,
            page : page
        }
    }else{
        var { workerType,workerNm, workType, workStatus, searchBgn, searchEnd} = searchForm;
        console.log(workerType.value,workerNm.value, workType.value, workStatus.value, searchBgn.value, searchEnd.value);
        searchData = {
            workerNm: workerNm.value,
            workerType: $("#workerType").val(),
            workType: workType.value,
            workStatus: workStatus.value,
            searchBgn: searchBgn.value,
            searchEnd: searchEnd.value,
            groupId: user_group_id,
            page : page
        }
    }

    console.log(searchData)

    $.ajax({
        type: 'post',
        url: 'get_search_data',
        data : JSON.stringify(searchData),
        async: false,
        success: function(data){
            console.table(data)
           if(data.messages == 'false'){
                alert('검색 조건을 입력하세요.')
           }else if(data.messages == 'NoSearch'){
                alert('등록되지 않는 사용자입니다.')
           }else{
            var workViewTable = document.querySelector('.workViewTable')
            var workProgress = document.querySelector*('.work-progress')

                if(data.length != 0){

                    workViewTable.innerHTML = ''
                    var worklist_len = $("#postLength").val(data[0].tot_cnt);
                    for(let i = 0; i < data.length; i ++){
                        var status = statusButton(data[i].work_status)

                        var tr = document.createElement('tr')
                        var work_status= data[i]['work_status']
                        workViewTable.append(tr)
                        var group_id = group(data[i].group_id)
                        // var statusNum = userByStatus(data[i].work_status)
                        var worker_name1 = data[i]['worker_name1']? data[i]['worker_name1'] : '-';
                        var worker_name2 = data[i]['worker_name2']? data[i]['worker_name2'] : '-';
                        var worker_name3 = data[i]['worker_name3']? data[i]['worker_name3'] : '-';
                        var worker_name4 = data[i]['worker_name4']? data[i]['worker_name4'] : '-';
                        var array = data[i]['video_path'].split('/')
                        var clip_cnt_total = NWC(data[i]['clip_cnt_total'])
                        var clip_cnt_complete = NWC(data[i]['clip_cnt_complete'])
                        var clip_cnt_stay = NWC(data[i]['clip_cnt_total'] - data[i]['clip_cnt_complete'])
                        // var worker_name = worker_name1 + "/" + worker_name2 + "/" + worker_name3 + "/" + worker_name4
                        tr.innerHTML +=`
                            <td>${data[i].work_id}</td>
                            <td>${data[i].str_type? data[i].str_type: '-'}</td>
                            <td>${array[array.length - 1]}</td>
                            <td><button data-work="admin_work_view" onclick = "showWorker('`+data[i].work_id+`')">${worker_name1} (${data[i].reg_date1? data[i].reg_date1.split('T')[0]: '-'})</button></td>
                            <td>${worker_name2} (${data[i].reg_date2? data[i].reg_date2.split('T')[0]: '-'})</td>
                            <td>${worker_name3} (${data[i].reg_date3? data[i].reg_date3.split('T')[0]: '-'})</td>
                            <td>${worker_name4} (${data[i].reg_date4? data[i].reg_date4.split('T')[0]: '-'})</td>
                            <td>${clip_cnt_total} [${clip_cnt_complete} / ${clip_cnt_stay}]</td>
                            <td>${data[i].str_status? data[i].str_status: '-'}</td>`

                        tr.innerHTML += status? `<input data-work='id${data[i].work_id}' type='hidden' value=${data[i].work_id}>
                                <input data-work='type' type='hidden' value=${data[i].work_type}>
                                <input data-work='status' type='hidden' value=${data[i].work_status}>` : ''

                        tr.innerHTML += `<td>${data[i].reg_date? data[i].reg_date.split('T')[0]: '-'}</td>`

                        if (user_group_id == "-"){
                            tr.innerHTML +=`
                                <td>${group_id? group_id: '-'}</td>`
                             tr.innerHTML += status? `<td><button data-work="admin_work_view" onclick = "viewWork('`+data[i].work_id+`','`+data[i].work_type+`','`+data[i].work_status+`')">작업보기</button></td>` : '<td>-</td>'
                        }else{
                           tr.innerHTML += status? `<td><button data-work="admin_work_view" onclick = "viewWork('`+data[i].work_id+`','`+data[i].work_type+`','`+data[i].work_status+`')">작업보기</button></td>` : '<td>-</td>'

                        }
                        if(work_status =="B"){
                            tr.innerHTML += `<td><button onclick = "cancleWork('`+data[i].work_id+`')">작업취소</button>/<button onclick = "work_giveUp('`+data[i].work_status+`','`+data[i].work_id+`','`+data[i].group_id+`')">작업포기</button></td>`
                        }else{
                            tr.innerHTML +=`<td></td>`
                        }
                    }
                    $("#totalcnt").text("[전체건수:"+NWC(data[0].tot_cnt)+"건  검색클립건수:"+NWC(data[0].list_tot_cnt)+"건]")

                    //상단 결과 출력
                    $("#total_worklist_len").text(data[0].top_dic.total_worklist_len);
                    $("#work_complete_len").text(data[0].top_dic.work_complete_len);
                    $("#task_ready_len").text(data[0].top_dic.task_ready_len);
                    $("#task_working_len").text(data[0].top_dic.task_working_len);
                    $("#inspect1_ready_len").text(data[0].top_dic.inspect1_ready_len+"/"+data[0].top_dic.inspect1_working_len+"/"+data[0].top_dic.inspect2_ready_len);
                    $("#inspect2_ready_len").text(data[0].top_dic.inspect2_ready_len+"/"+data[0].top_dic.inspect2_working_len+"/"+data[0].top_dic.inspect3_ready_len);
                    $("#inspect3_ready_len").text(data[0].top_dic.inspect3_ready_len+"/"+data[0].top_dic.inspect3_working_len+"/"+data[0].top_dic.task_complete_len);
                    $("#task_complete_len").text(data[0].top_dic.task_complete_len);
                    $("#totalwork").text(NWC(data[0].top_dic.work_state.totalwork));
                    $("#complete").text(NWC(data[0].top_dic.work_state.complete));
                    $("#fullcomit").text(NWC(data[0].top_dic.work_state.fullcomit));
                    $("#completewait").text(NWC(data[0].top_dic.work_state.completewait));
                    // paging.init()
                }else{
                    if (user_group_id == "-") {
                        workViewTable.innerHTML = `<tr><td colspan='12'>검색 결과가 없습니다.</td></tr>`
                    }else{
                        workViewTable.innerHTML = `<tr><td colspan='11'>검색 결과가 없습니다.</td></tr>`
                    }
                    $("#totalcnt").text("[전체건수:0건]")
                }

           }
            paging(page);
        },
        error: function(err){
            alert('검색 목록을 확인해 주세요')
        }
    })
}

function viewWork(id, type, status){

    workId = id
    workType = type
    workStatus = status
    //var pop= window.open("",'작업확인',"")

    var admin = document.forms.admin_view
    admin.action = '/admin/index/adminview'
    admin.target = "_new"
    admin.work_id.value = workId
    admin.work_type.value = workType
    admin.work_status.value = workStatus

    admin.submit()
}

var dbinfo
//pathname 에 따라 페이지 설정해주기

//a , j, k, r4, l, i,
function statusButton(val){
    var condition = [dbinfo['status_work_deagi'], dbinfo['status_1cha_companion_cansel'], dbinfo['status_2cha_companion_cansel'], dbinfo['status_job_cansel'], dbinfo['status_3cha_companion_cansel'], dbinfo['status_complet']]

    if(condition.indexOf(val) == -1){
        return true
    }else{
        return false
    }
}

function group(group){
    var array_1 = ['tbit', 'dtw', 'gjac']
    var array_2 = ['으뜸정보기술', '디투리소스', '광주 인공지능센터']
    return array_2[array_1.findIndex(arr => arr == group)]
}



function paging(page){

    $(".paging").empty();
    let tot_cnt = $("#postLength").val();
    console.log(tot_cnt)
    let pageSize = 10;
    //가장 큰 수를 반환
    let pageTotNum = Math.floor(tot_cnt/pageSize) + (tot_cnt%pageSize > 0 ? 1 : 0);
    let pageStr = "<ul class = \"pageTable start\">";
    let startPage = Math.floor(page/pageSize);
    startPage = startPage*pageSize;
    let endPage = startPage + pageSize;
    endPage = endPage > pageTotNum ? pageTotNum : endPage;
    let prevPageSet = ((Math.floor(page/pageSize)*pageSize)-1) >= 0 ? ((Math.floor(page/pageSize)*pageSize)-1) : page;
    let nextPageSet = (Math.floor((page+pageSize)/pageSize)*pageSize) >= pageTotNum ? (pageTotNum - 1) : (Math.floor((page+pageSize)/pageSize)*pageSize);
    let prevPage = (page - 1) >= 0 ? (page - 1) : page;
    let nextPage = (page + 1) >= pageTotNum ? (pageTotNum - 1) : (page + 1);

    pageStr += "<li><a class=\"first\" href='#' onclick='jsf_ajax_dataloading(0)' \">처음</a></li>";
    pageStr += "<li><a class=\"prev\" href='#' onclick='jsf_ajax_dataloading(" + prevPageSet + ")' \"><<</a></li>";
    pageStr += "<li><a class=\"prevPageSet\" href='#' onclick='jsf_ajax_dataloading(" + prevPage + ")' \"><</a></li>";
    for(var i = startPage; i < endPage; i ++){
        if (page == i){
            pageStr += "<li><a class=\"active num\" href='#' onclick='jsf_ajax_dataloading(" + i + ")'\">"+ (i+1) +"</a></li>";
        }else{
            pageStr += "<li><a class=\"num\" href='#' onclick='jsf_ajax_dataloading(" + i + ")'\">"+ (i+1) +"</a></li>";
        }
    }
    pageStr += "<li><a class=\"next\" href='#' onclick='jsf_ajax_dataloading(" + nextPage + ")'\">></a></li>"
    pageStr += "<li><a class=\"nextPageSet\" href='#' onclick='jsf_ajax_dataloading(" + nextPageSet + ")'\">>></a></li>"
    pageStr += "<li><a class=\"last\" href='#' onclick='jsf_ajax_dataloading(" + (pageTotNum - 1) + ")'\">끝</a></li>"
    pageStr += "</ul>"
    $(".paging").html(pageStr);
}
}


    function showData(search, data){

        switch(search){
            case 'product':
                const productEl = document.querySelectorAll('.selected-product ul')[1]

                data.forEach(data => {
                    const li = document.createElement('li')
                    li.append(data)
                    productEl.append(li)
                })

            break

            case 'worker':
                const workerEl = document.querySelectorAll(`.selected-workman ul`)[1]

                data.forEach(data => {
                    const li = document.createElement('li')
                    li.append(data)
                    workerEl.append(li)
                })

            // default:
        }
    }

}
var AuthSaveYn = false;

(function(){
const AuthSearchFormBtn = document.querySelector('#AuthSearchFormBtn');
if(!AuthSearchFormBtn) return
console.log(AuthSearchFormBtn)
AuthSearchFormBtn.addEventListener('click', e => {
    e.preventDefault()
    jsf_ajax_AuthSearchForm(0)
})

function jsf_ajax_AuthSearchForm(page){
    AuthSaveYn = true;
    console.log(workerNm.value);
    AuthSearchForm = {
        workerNm: workerNm.value,
        //groupId: $('#workGroup').value,
        page : page
    }

    console.log(AuthSearchForm)

    $.ajax({
        type: 'post',
        url: 'get_auth_search_data',
        data : JSON.stringify(AuthSearchForm),
        async: false,
        success: function(data){
           if(data.messages == 'false'){
                alert('검색 조건을 입력하세요.')
           }else{
                if(data.length != 0){
                    var inputChangeCheck = $('#inputChangeCheck');
                    var paging = $('.paging');
                    paging.empty();
                    var htmlstr = '';
                    for(let i = 0; i < data.length; i ++){

                        htmlstr += "<tr>";
                        htmlstr += " <td> " + (data[i]['id']? data[i]['id'] : '-');
                        if(data[i]['user_name'] == ''){
                            htmlstr += '<td><input name="user_name" id="user_name'+data[i]['account_id']+'" value></td>';
                        }else{
                            htmlstr += '<td> <input type="hidden" name="user_name" id="user_name'+data[i]['account_id']+'" value="'+ data[i]['user_name']+'">' + (data[i]['user_name']? data[i]['user_name'] : '-') +  "</td>";
                        }
                        htmlstr += " <td> " + (data[i]['account_id']? data[i]['account_id'] : '-') +  "</td>";
                        htmlstr +='<input TYPE="hidden" name="user_account_id" id ="user_account_id'+data[i]['account_id']+'" value  = "'+data[i].account_id+'" >'
                        htmlstr += "</td>";

                        htmlstr += "<td>" + (data[i]['phone_number']? data[i]['phone_number'] : '-') +  "</td>";
                        htmlstr += "<td>" + (data[i].creation_date? data[i].creation_date.split('T')[0]: '-') +  "</td>";
                        if(data[i]['group_id']=='-'){
                            htmlstr += "<td>전체관리자</td>";
                        }else if(data[i]['group_id']=='gjac'){
                            htmlstr += "<td>광주인공지능센터</td>";
                        }else if(data[i]['group_id']=='tbit'){
                            htmlstr += "<td>으뜸정보기술</td>";
                        }else if(data[i]['group_id']=='dtw'){
                            htmlstr += "<td>디투리소스</td>";
                        }
                        htmlstr += '<td><input id = "workAuth'+data[i]['account_id']+'" type="checkbox" name="workAuth" '+ (data[i]['is_staff'] ? "checked":"")+'>' + "</td>";
                        htmlstr += '<td><input id = "inpsectAuth'+data[i]['account_id']+'" type="checkbox" name="inpsectAuth" '+ (data[i]['is_inspector'] ? "checked":"")+'>' + "</td>";
                        htmlstr += '<td><input id = "adminAuth'+data[i]['account_id']+'" type="checkbox" name="adminAuth" '+ (data[i]['is_superuser'] ? "checked":"")+' disabled = "disabled" >' + "</td>";
                        htmlstr += '<td><button type="button" id="changeUserAuth" class="button-first save-value" onclick="jsf_save(\''+ data[i]['account_id'] +'\')">저장</button></td>';
                        htmlstr += "</tr>";
                    }//for
                     inputChangeCheck.html(htmlstr);
                }else{
                    inputChangeCheck.html("<tr><td colspan='10'>검색 결과가 없습니다.</td></tr>");
                }
            }//if
        },
        error: function(err){
            alert('호출 실패')
        }
    })
}
}())

const inputChangeCheck = document.querySelector('#inputChangeCheck')
const inputChangeTr = document.querySelectorAll('#inputChangeCheck tr')
const inputChangeBtn = document.querySelectorAll('#changeUserAuth')

if(inputChangeCheck){
    inputChangeCheck.addEventListener('click', function(e){
        // $('#changeUserAuth').on('click',function (e){
        if(e.target.className.indexOf('save-value') !== -1){
            if(AuthSaveYn) return;// 검색 후 저장하는 모듈에서 제어하는 부분임
            var param = {};

            e.preventDefault()
            let value = []
            // let tr = document.querySelector(e.target.parentNode)
            for(let i=0; i<inputChangeBtn.length; i++){
                if(e.target === inputChangeBtn[i]){
                    for(let j=0; j<inputChangeTr[i].children.length; j++){
                        if(inputChangeTr[i].children[j].querySelector('input')){
                            if(inputChangeTr[i].children[j].querySelector('input[type="checkbox"]')){
                                value.push(inputChangeTr[i].children[j].querySelector('input').checked)
                            }else{
                                value.push(inputChangeTr[i].children[j].querySelector('input').value)
                            }
                        }
                    }
                }
            }

             param = {
                worker: value[0],
                worker_id: value[1],
                workAuth: value[2],
                inspectAuth: value[3],
                adminAuth: value[4]
            }

            jsf_inSave(param); //ajax 권한 저장 grampus 2021.11.15
        }
    })
}

function jsf_inSave(param){
    $.ajax({
        type: 'post',
        url: '/admin/index/userAuth/change_auth',
        data : JSON.stringify(param),
        success: function(data){
            if(data === 'True'){
                alert('저장 성공');
                window.location.replace("/admin/userAuth/?page=1");
            }else{
                alert('저장 실패');
            }
            AuthSaveYn = false;
        },
        error: function(err){
            alert('저장 실패');
            AuthSaveYn = false;
        }
    })
}
function jsf_save(user_id){
        var workAuth = $('#workAuth'+user_id).prop("checked");
        var inpsectAuth = $('#inpsectAuth'+user_id).prop("checked");
        var adminAuth = $('#adminAuth'+user_id).prop("checked");

         param = {
            worker: $("#user_name"+user_id).val(),
            worker_id: $("#user_account_id"+user_id).val(),
            workAuth: (workAuth == true ? "True":"False"),
            inspectAuth: (inpsectAuth == true ? "True":"False"),
            adminAuth: (adminAuth == true ? "True":"False")
        }
        jsf_inSave(param);
}

//작업 현황 엑셀 내보내기
(function(){
    var _exportExcel = document.getElementById('exportExcelData')
    if(!_exportExcel) return
    var excelHandler = {
       getExcelFileName: '인터페이스 작업현황.xlsx', //이름 수정
       getSheetName: '작업 현황', //현황
       excelData: [
           ['이름' , '나이', '부서'],
           ['도사원' , '21', '인사팀'],
           ['김부장' , '27', '비서실'],
           ['엄전무' , '45', '기획실']
       ],
    }

    _exportExcel.addEventListener('click', function(e){
        exportExcel()
        console.log('엑셀만들기')
    })

    async function _request(){
        await $.ajax({
            url: 'getExcelData',
            type: 'post',
            data: '',
            success: function(_data){
                if(_data.length < 0) return alert('data가 없습니다.')
                excelHandler.excelData = []
                excelHandler.excelData.push([
                '소속', '작업자 이름', '작업 번호', '파일명',
                '작업자 아이디', '시작한 날짜', '1차 검수자', '1차 검수자 시작한 날짜',
                '2차 검수자', '2차 검수자 시작한 날짜', '3차 검수자', '3차 검수자 시작한 날짜', '전체 클립',
                '작업 상태', '파일 등록일', '처음 클립 시작 시간', '마지막 클립 끝 시간'
                ])

                console.log(_data)

                for(var i = 0; i < _data.length; i++){

                    switch(_data[i].group_id){
                        case 'gjac':
                            _data[i].group_id = '광주인공지능센터'
                        break
                        case 'dtw':
                            _data[i].group_id = '디투리소스'
                        break
                        case 'tbit':
                            _data[i].group_id = '으뜸정보기술'
                        break
                    }

                    _data[i].video_path = _data[i].video_path.split('/')
                    _data[i].video_path = _data[i].video_path[_data[i].video_path.length - 1]
                    _data[i].clip_cnt_total = _data[i].clip_cnt_total.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")

                    _data[i].work_start_time = _data[i].work_start_time? new Date(_data[i].work_start_time).toISOString().replace("T", " ").replace(/\..*/, '') : ''
                    _data[i].inspect_1_time = _data[i].inspect_1_time? new Date(_data[i].inspect_1_time).toISOString().replace("T", " ").replace(/\..*/, '') : ''
                    _data[i].inspect_2_time = _data[i].inspect_2_time? new Date(_data[i].inspect_2_time).toISOString().replace("T", " ").replace(/\..*/, '') : ''
                    _data[i].inspect_3_time = _data[i].inspect_3_time? new Date(_data[i].inspect_3_time).toISOString().replace("T", " ").replace(/\..*/, '') : ''
                    _data[i].reg_date = _data[i].reg_date? new Date(_data[i].reg_date).toISOString().replace("T", " ").replace(/\..*/, '') : ''

                    excelHandler.excelData.push([_data[i].group_id, _data[i].user_name, _data[i].work_id, _data[i].video_path,_data[i].worker_id, _data[i].work_start_time, _data[i].inspect_id1, _data[i].inspect_1_time, _data[i].inspect_id2, _data[i].inspect_2_time, _data[i].inspect_id3, _data[i].inspect_3_time, _data[i].clip_cnt_total, _data[i].work_status, _data[i].reg_date, _data[i].first_clip_time, _data[i].last_clip_time])
                    console.log(excelHandler.excelData)
                }

                return true
            },
            error: function(){
                return false
            }
        })
    }

    async function exportExcel(){
        await _request()
        var wb = XLSX.utils.book_new()
        var newWorksheet = XLSX.utils.aoa_to_sheet(excelHandler.excelData)

        XLSX.utils.book_append_sheet(wb, newWorksheet, excelHandler.getSheetName)

        var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'})
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), excelHandler.getExcelFileName)
    }

    function s2ab(s) {
        var buf = new ArrayBuffer(s.length) //convert s to arrayBuffer
        var view = new Uint8Array(buf)  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF //convert to octet
        return buf
    }
})()

function cancleWork(id){
    const confirmed = confirm("작업 취소시 작업 불가능 파일로 판별되어 보여지지 않습니다 \n실행하시겠습니까?");
    if(!confirmed) return
    var work_id = id
    Data = {
       work_id : work_id
    }
    $.ajax({
        type: 'post',
        url: 'cancel_work',
        data: JSON.stringify(Data),
        success: function(data){
            alert('갱신 완료')
        },
        error: function(err){
            alert('갱신 실패.')
        }
    })

}

function work_giveUp(status,id,group_id){
    const confirmed = confirm("작업 포기시 작업한 모든 내역이 사라집니다\n진행하시겠습니까?");
    if(!confirmed) return
    var work_status = status
    var work_id = id
    var group_id = group_id
    Data = {
       work_status: work_status,
       work_id : work_id,
       group_id : group_id
    }
    $.ajax({
        type: 'post',
        url: 'work_giveUp',
        data: JSON.stringify(Data),
        success: function(data){
            alert('포기 완료')
        },
        error: function(err){
            alert('포기 실패.')
        }
    })

}