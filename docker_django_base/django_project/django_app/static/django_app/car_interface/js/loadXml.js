//상민 2021 11 05 ~
//workStatus
var workStatus = document.querySelector('#workStatus')
if(workStatus.value == 'D'){
    document.forms.edit.classList = 'hide'
    document.querySelector('#modelLoad').classList = 'hide'
    document.querySelector('#modelReload').classList = 'hide'
    document.querySelector('#xmlDownload').disabled = true
}
//workStatus

var _util = util.element
var video = document.querySelector("#orgVideo")

_util.subscribe('#handpose', '#note', '.tool>div>button:nth-child(1)', '#modelLoad', '#modelReload', '.btn-success', '.btn-danger', '.btn-save', '#xmlLoad')
_util.disable()
alert("\"작업 순서\" : video 업로드 => 작업 시작")

var interfaceApp = {
    file: {
        path: document.getElementById('exportVideo').value,
        downloadBtn: document.getElementById("fileDownload"),
        load: function(){

        },
        download: function(){

            let linkElement = document.createElement('a')

            linkElement.setAttribute('href', interfaceApp.file.path)
            linkElement.setAttribute('download', interfaceApp.file.name)
            linkElement.click()

            $(':focus').blur()
        },
        loadBtn: document.getElementById('fileLoad'),
        load: function(){

        },
        input: document.getElementById('file'),
        xml: {

        },
    },

    video: {
        element: document.querySelector("#orgVideo"),

    },

    inspect: {
        check: function(){
            for(var i = 0; i < sptRegions.length; i++){
                for(var j = 0; j < sptRegions[i].length; j++){
                    if(sptRegions[i][j].data.status == '반려'){
                        return 'rejection'
                    }
                }
            }

            return 'complete'
        }//init
    },

    sidebar: {
        element: document.querySelector('.side-nav'),
        toggleBtn: function(){
            var hamburger = document.querySelector('.hamburger-btn')
            interfaceApp.sidebar.element.classList.toggle('active')
            hamburger.classList.toggle('active')
        },
        viewRejection: function(){
            console.log('viewRejection')
            var listEl = document.querySelector('.rejection-list')
            listEl.innerHTML = ''
            var count = 0

            for(var i = 0; i < sptRegions.length; i++){
                for(var j = 0; j < sptRegions[i].length; j++){
                    if(sptRegions[i][j].data.status == '반려'){
                        count++
                        listEl.innerHTML += `<p><span class='attribute'>${sptRegions[i][j].attributes} 번:</span> ${sptRegions[i][j].data.rejection}</p>`
                    }
                }
            }

            if(count === 0){
                listEl.innerHTML += `<p>반려 내역이 없습니다.</p>`
            }
        }//init
    },
    //검수 페이지 C D E F G H I 67 ~ 73 1차 검수 ~ 3차 진행까지
    workStatus: document.querySelector('#workStatus')? document.querySelector('#workStatus').value : null,
    //북마크 객체 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
    bookmark: {
        status: 'not',
        addBtn: null,
        removeBtn: null,
        data: null, //북마크 데이터
        init: function(){
                var addBtn = document.querySelector('#addBookmark')
                var removeBtn = document.querySelector('#removeBookmark')
                var data = document.querySelector('#bookmark').value
                var ascii = interfaceApp.workStatus.charCodeAt(0)
                var admin = document.querySelector('#userCheck')

                if((67 <= ascii && ascii <= 73) || admin){ //검수 페이지 or 운영자 페이지다.
                    console.log(interfaceApp.workStatus)
                    interfaceApp.bookmark.status = 'run'
                    interfaceApp.bookmark.addBtn = addBtn
                    interfaceApp.bookmark.removeBtn = removeBtn
                    interfaceApp.bookmark.eventActivated()
                }else{ //검수가 아니다.
                    removeBtn.remove()
                    addBtn.remove() // 북마크 관련 버튼 제거
                    return // bookmark 객체 실행 안함
                }

                if(data != 'None'){ //서버로부터 받은 북마크 데이터 파싱
                    interfaceApp.bookmark.data = data.split('|')
                    //regions 검사 regions에 있는 attributes를 전부 가져와
                    //북마크에 attributes와 비교하고 regions가 북마크의 attributes를 가지고 있지 않는 경우
                    //매치되지 않는ㄷ 북마크의 attributes도 제거한다. 그러지 않으면 새로운 attributes가 생성될 때 북마크는 attributes를 가지고 있어서
                    //북마크를 만들지도 않았는데 생성되는 경우가 생김
                    var regionsAttributes = Object.keys(wavesurfer.regions.list).map(id => wavesurfer.regions.list[id].attributes) //새로운 배열 생성
                    interfaceApp.bookmark.data = interfaceApp.bookmark.data.filter(attributes => regionsAttributes.includes(attributes)) // 두 배열의 공통 값만
                    interfaceApp.bookmark.addBookmark('update')//데이터베이스와 동기화

                    interfaceApp.bookmark.draw()
                }else{ //서버로부터 받은 데이터가 없을 때 배열 생성
                    interfaceApp.bookmark.data = []
                }
        },
        addBookmark: function(option){
            if(interfaceApp.bookmark.status == 'not') return
            //선택된 클립 확인
            var data = interfaceApp.bookmark.data

            if(option != 'update'){
                var regionId = document.forms.edit.dataset.region
                if(!regionId) return //리전 값이 undefined 일 때 중지

                var region = wavesurfer.regions.list[regionId]
                var attribute = region.attributes

                var index = data.findIndex(arr => arr == attribute) // 해당 클립의 북마크가 존재한다.

                if(index == -1){ // 값이 없다.
                    data.push(attribute)
                }
            }

            $.ajax({ //데이터 전송 값이 있으나 없으나 일단 업데이트 이전에 업데이트를 했는지 알 수 없으니
                url: '/update_bookmark', //sql update
                type: 'post',
                data: { 'work_id': document.querySelector('#tasknumber').value, 'data': data },
                success: function(result){ //성공 여부
                    console.log(result)
                },
                error: function(error){
                    console.log(error)
                }
            })
        },
        draw: function(){ //set
            if(interfaceApp.bookmark.status == 'not') return
            var array = interfaceApp.bookmark.data
            console.log(nowSet)

            //클립 영역은 현재 보여주는 부분만 그리면 된다.
            var clipDiv = document.querySelectorAll('#clips > div')
            if(clipDiv.length > 0){ //비디오가 한개라도 있을 때 비디오가 없다는 건 셋버튼이 클릭되지 않았다는 것
                //비디오가 한개라도 있을 때 해당하는 attribute를 찾아서 표시
                for(let i = 0; i < clipDiv.length; i++){
                    let index =  array.findIndex(arr => arr == wavesurfer.regions.list[clipDiv[i].id].attributes)
                    if(index != -1){ // -1이 아니면 북마크다.
                        var iTag = document.createElement('i')
                        iTag.className = 'glyphicon glyphicon-bookmark bookmark'
                        clipDiv[i].append(iTag)
                    }
                }
            }

            //셋 영역은 sptRegion를 검색해서 북마크를 가지고 있으면 모두 표시한다.
            var sets = document.querySelectorAll('#sets')

            for(let i = 0; i < sptRegions.length; i++){
                for(let j = 0; j < sptRegions[i].length; j++){
                    let index =  array.findIndex(arr => arr == sptRegions[i][j].attributes)
                    if(index != -1){
                        var beforeItag = sets[i].querySelector('i')
                        if(beforeItag) beforeItag.remove() //이전 i 태그가 있다면
                        var iTag = document.createElement('i') // 절대 한개만 생성해
                        iTag.className = 'glyphicon glyphicon-bookmark bookmark'
                        sets[i].append(iTag)
                        //한개라도 있으면 j 루프를 벗어난다.
                        break
                    }
                }//j
            }//i
        },
        removeBookmark: function(){
            if(interfaceApp.bookmark.status == 'not') return
            var data = interfaceApp.bookmark.data
            var regionId = document.forms.edit.dataset.region
            if(!regionId) return alert('선택된 클립이 없습니다.')//리전 값이 undefined 일 때 중지

            var region = wavesurfer.regions.list[regionId]
            var attribute = region.attributes

            var index = data.findIndex(arr => arr == attribute) // 해당 클립의 북마크가 존재한다.
            if(index >= 0){ //북마크가 존재한다. 주의 findIndex 때문에 0번째 배열일수도 있으므로 >=으로 해야한다.
                var regionDiv = document.querySelector(`div#${regionId} i.bookmark`) //아이콘 제거
                if(regionDiv){ //리전 div i가 존재할 경우
                    regionDiv.remove() //요소 제거
                }

                var attributesLength = 0
                 //sptRegions[nowSet[0]] 현재 선택된 세트에 북마크가 전부 없는지 체크
                for(var i = 0; i < sptRegions[nowSet[0]].length; i++){
                    console.log(data.includes(sptRegions[nowSet[0]][i].attributes))
                    if(data.includes(sptRegions[nowSet[0]][i].attributes)){ //해당 세트에 attributes가 존재한다.
                        attributesLength++
                        if(i > 1){ //for문을 두번 이상 돌고, attibutes가 두번 다 존재했다면 이 세트의 아이콘을 제거하지 않는다.
                            break
                        }
                    }
                }

                if(attributesLength == 1){ // 만약 attibutes가 한개라면 세트의 아이콘을 제거
                   var _nowSet = document.querySelectorAll(`#sets`)[nowSet[0]] //현재 세트의 요소
                   var icon = _nowSet.querySelector('i.bookmark') //아이콘
                   if(icon){//아이콘이 있으면
                    icon.remove()
                   }
                }

                interfaceApp.bookmark.data.splice(index, 1) // 데이터 제거 이거를 나중에 해야한다. 안그러면 위의 구문 작동 안함
                interfaceApp.bookmark.addBookmark('update') // 데이터베이스 동기화

                //나중에 문제가 생긴다면 전체 검사후 제거하는것을 만들어야 할듯
            }
            //북마크가 존재하지 않는다.
        },
        eventActivated: function(){//이벤트를 활성화 시키는 메소드
            if(interfaceApp.bookmark.status == 'not') return
            var bookmark = interfaceApp.bookmark
            bookmark.addBtn.addEventListener('click', async function(){
                await bookmark.addBookmark()
                //아작스 실패 여부 상관없이 북마크를 그린다.
                interfaceApp.bookmark.draw()
            })

            bookmark.removeBtn.addEventListener('click', async function(){
                await bookmark.removeBookmark()
                //아작스 실패 여부 상관없이 북마크를 그린다.
            })
        }//이 메소드는 한번만 실행
    }
}

interfaceApp.sidebar.element.addEventListener('click', function(e){
    var div = e.target.closest('div.menu-open')
    if(!div) return
    interfaceApp.sidebar[div.id]()
})

interfaceApp.file.name = interfaceApp.file.path.substring(interfaceApp.file.path.lastIndexOf('/') + 1)



//파일 불러오기
interfaceApp.file.bringFile = async function(file){

    util.loading.on()
    var _file = interfaceApp.file

    const videoURL = URL.createObjectURL(file);

    await video.setAttribute("src", videoURL);

    video.setAttribute('alt', file.name);

    _file.loadBtn.querySelector('span').textContent = file.name.split('.')[0]

    loadVideo(null, '재작업')

    // 로딩화면
    const video_rect = video.getBoundingClientRect();
    _util.enable()

    allRegions = [];

    if (inputRegion.length > 2) {  // '[]'의 sting 크기는 2
        inputRegion = inputRegion.replace(/'/gi, '"'); //20211111 정성효
        inputRegion = inputRegion.replace(/\n/gi, '');
        allRegions = JSON.parse(inputRegion)
        inputRegion = null // 메모리 제거

        let regionsLen = allRegions.length;

        allRegions.forEach(elm=>{
            wavesurfer.addRegion(elm);
        })

        var allRegions = []
        Object.keys(wavesurfer.regions.list).map(function (id) {
            allRegions.push(wavesurfer.regions.list[id])
        })
        allRegions.sort((a, b) => { // allRegions : arr(생성된 region 개수) [{regionId, startTime}, {regionId, startTime} ......] 정렬
            if (a.start > b.start) return 1
            if (a.start < b.start) return -1
            return 0
        })

        sptRegions = [];
        // regions 5 요소씩 하위배열생성
        for (var i = 0; i < regionsLen; i += 5) sptRegions.push(allRegions.slice(i, i + 5));

        // 클립 5개 묶음 버튼 생성
        setClipButton(sptRegions.length);

        // final_complete check
        let completeCnt = 0
        document.querySelectorAll('#sets').forEach(el => {
            if(el.classList.contains('complete')){
                completeCnt++;
            }
        })

        var ele = document.getElementById('div_btn')
        var eleCount = ele.childElementCount
    }
    setMarkInit()
}

// xml 다운로드 버튼을 누르는 것으로 변경
// var xml_path = "/media/django_app/action_xml/p01_1h_if_f40_20210829_103918(1) - 1of2.bcpf";
interfaceApp.file.xml.name = 'xml_name_error'
if(interfaceApp.file.name.split('.')[0].slice(-2) === '_Y'){
    interfaceApp.file.xml.name = interfaceApp.file.name.split('.')[0].slice(0, -2) + '.bcpf'
}else{
    interfaceApp.file.xml.name = interfaceApp.file.name.split('.')[0] + '.bcpf'
}

interfaceApp.file.xml.url = "/media/django_app/action_xml/" + interfaceApp.file.xml.name
interfaceApp.file.xml.downloadBtn = document.getElementById("xmlDownload")

interfaceApp.file.xml.download = function(){
    var xml = interfaceApp.file.xml.url

    $.get(xml.url)
    .done(function () {
        // exists code
        let xmlLinkElement = document.createElement('a')
        xmlLinkElement.setAttribute('href', '/media/django_app/action_xml/' + xml.name)
        xmlLinkElement.setAttribute('download', xml.name)
        xmlLinkElement.click()
    }).fail(function () {
        // not exists code
        alert("대응하는 xml파일이 없습니다.\n관리자 문의바랍니다.")
    })

    $(':focus').blur()
}

//이벤트 분리
interfaceApp.file.downloadBtn.addEventListener('click', function(e){
    interfaceApp.file.download()

})

interfaceApp.file.loadBtn.addEventListener('keydown', function(e){
    if (e.keyCode === 32) { //스페이스바
        e.preventDefault()
    }
})

interfaceApp.file.xml.downloadBtn.addEventListener('click', e => {
    interfaceApp.file.xml.download()
})

interfaceApp.file.loadBtn.addEventListener('click', e => { // video load button
    video.setAttribute('src', '');
    interfaceApp.file.input.click()
    console.log(interfaceApp)
})

var fileLoadfileLoad = document.querySelector('#fileLoad')
fileLoadfileLoad.onclick = function(){
    console.log('fileBTN 클릭')
    console.log(interfaceApp)
}

interfaceApp.file.input.addEventListener("change", function (e) {


    const file = e.target.files[0]; // 업로드한 파일이름
    if (!file) return
    if (file.name != interfaceApp.file.name) return alert("다운로드한 video 파일과 다른 업로드 파일입니다.")
    interfaceApp.file.bringFile(file)
})

var modalFinalComplete = document.querySelector('.modal-final-complete')
var final_sure = document.querySelector('#final_sure')
var final_cancel = document.querySelector('#final_cancel')

  const final_complete = document.getElementById('final_complete')

  if(final_complete){
    final_complete.addEventListener('click', e => {
        modalFinalComplete.classList.add('open')
    })
  }

  final_sure.addEventListener('click', e => {
    let workCheck = chkFinalWorkCmpl()

    if(workCheck == 'Complete'){
        $.ajax({
            url: "task_complete",
            type: "POST",
            data: JSON.stringify({
              task_num : document.getElementById('tasknumber').value,
              group: document.getElementById("groupId").value
            },),
            success: function(response){
                if(response.message == 'notsuccess'){
                    alert("작업 내용이 반려되었습니다.");
                    window.location.assign('/mywork_record')
                }
                else{
                    alert("작업 내용이 최종 제출되었습니다.");
                    window.location.assign('/mywork')
                }
            },
            error: function(){
                // console.log('error')
            }
        })
     }else{
        alert("모든 작업이 완료되지 않았습니다.")
        modalFinalComplete.classList.remove('open')
     }
})

final_cancel.addEventListener('click', e => {
    modalFinalComplete.classList.remove('open')
})
//

let isUploadedXml = false;

// xml파일을 #content-target의 text-area로 text load, json parse
const inputXmlFile = document.getElementById("xmlFile");
const xmlFileLoad = document.getElementById('xmlLoad')

xmlFileLoad.addEventListener('click', e => {
    let isExecuted = confirm("작업 내용을 모두 지우고\n새롭게 xml 정보를 로딩할까요?");
    if(isExecuted){
        clearCanvas();
        resetForm();
        resetFrames();
        resetClips()
        resetRegions();
        wavesurfer.regions.list = {};
        localStorage.regions = "";
        sptRegions = [];
        nowSet = [];
        nowClip = [];
        workedFrames = [];
        workedClips = [];
        $('#div_btn').innerHTML = '';
        Delete_Xml();
        inputXmlFile.click();
    }
})
//경진 xml 지우기
function Delete_Xml() {
    $.ajax({
           url: "xml_insert",
           type: "POST",
           success: function() {
       }
    });
     task_id = 0;
}

inputXmlFile.addEventListener('change', getFile)

function getFile(event) {
    isUploadedXml = true;

    const input = event.target
    const file = input.files[0];  // 업로드한 파일이름
    if (!file) return
    if(file.name != xml_name){
        alert("다운로드한 xml 파일과 다른 업로드 파일입니다.")
    }else{
        if ('files' in input && input.files.length > 0) {
            placeFileContent(document.getElementById('content-target'), file)
            xmlFileLoad.querySelector('span').textContent = input.files[0].name.split('.')[0]
        }

        let task_api_url;
        if (window.location.pathname == '/admin/index/adminview') {
            _url = "/admin/index/adminview/inspect_task_api"
        }else {
            task_api_url = "task_api"
        }

        xmlDbInsert();

        // 업로드한 xml 전체 내용을 db insert
        function xmlDbInsert(){
            sptRegions.forEach(fiveRegions =>
                fiveRegions.forEach(param => {
                        let variable = {
                            "id": param.id,
                            "start": param.start,
                            "end": param.end,
                            "attributes": param.attributes,
                            "group" : document.getElementById("groupId").value,
                            "data":{
                                "note": param.data.note,
                                "handpose": param.data.handpose,
                                "skeleton": param.data.skeleton,
                                "status": param.data.status
                            }
                        }

                        $.ajax({
                            type : 'POST',
                            // 한 인스턴스에 모든 xml을 저장시켜 최종적으로 마지막 정보만 저장되는 문제
                            url : task_api_url,
                            dataType : 'json',
                            data : JSON.stringify(variable),
                            success : function(data){
                                // console.log('Success');
                                // console.log(data);
                            },
                            error : function(e){
                                // console.log('Error');
                                // console.log(e);
                            }
                        })//ajax
                    })//forEach
            )//forEach
        }//xmlDbInsert
    }
}


// 모든 클립 객체 배열
var allRegions = [];

// 모든 클립 5개 묶음 객체 배열
var sptRegions = [];

// 작업 중인 세트
var nowSet = [];

// 작업 중인 클립
var nowClip = [];

// 작업 중인 클립의 완료한 프레임 배열
var workedFrames = [];

// 작업 완료한 클립 배열
var workedClips = [];

function placeFileContent(target, file) {
    readFileContent(file).then(content => {
        target.value = content
        // console.log(content);

        // text to xml
        // parseXml(content)

        // xmlText to json
        // regions : JSON Array
        let regions = xmlText2Json(content)
        allRegions = regions;

        // regions : 227 개 배열
        let regionsLen = allRegions.length;

        if(allRegions.length > 0 && !allRegions[0].hasOwnProperty("id")){
            allRegions.forEach(elm=>{
                wavesurfer.addRegion(elm);
            })
            // allRegions : sort regionTag
            var allRegions = [];
            Object.keys(wavesurfer.regions.list).map(function (id) {
                allRegions.push(wavesurfer.regions.list[id])
            })
        }

        allRegions.sort((a, b) => { // allRegions : arr(생성된 region 개수) [{regionId, startTime}, {regionId, startTime} ......] 정렬
            if (a.start > b.start) return 1
            if (a.start < b.start) return -1
            return 0
        })

        sptRegions = [];
        // regions 5 요소씩 하위배열생성
        for (var i = 0; i < regionsLen; i += 5) sptRegions.push(allRegions.slice(i, i + 5));
        // for(var i=0; i<sptRegions.length; i++) console.log(sptRegions[i]);
        // console.log(sptRegions);

        // 클립 5개 묶음 버튼 생성
        setClipButton(sptRegions.length);

        var regionsasd = document.querySelectorAll('region')
        console.log(regionsasd.length)
    }).catch(error => console.log(error))
}

function readFileContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}

function xmlText2Json(content){
    var xml2json = new XMLtoJSON();
    var objson = xml2json.fromStr(content);   // object 형식
    // var strjson = xml2json.fromStr(content, 'string');   // string 형식
    // console.log(objson)
    // console.log(strjson)

    let videoItem = objson.BandicutProjectFile.VideoItem;

    let videoItemLen = Object.keys(videoItem).length;

    // console.log(videoItemLen);
    var regions = new Array();
    var elmJson = new Object();
    for(var i=0; i<videoItemLen; i++){
        let seq = videoItem[i]["@attributes"].Index;
        let title = videoItem[i]["@attributes"].Title;
        let start = String(videoItem[i]["@attributes"].Start / 1000000);
        let end = String(videoItem[i]["@attributes"].End / 1000000);
        // console.log("title : " + title + " | start : " + start + " | end : " + end);


        elmJson = {
            "start": start,
            "end": end,
            "attributes": seq,
            "group" : document.getElementById("groupId").value,
            "data":{
                "note": title,
                "handpose": "",
                "skeleton":[],
                "status": ""
            }
        }

        regions.push(elmJson);

    }
    task_id = videoItemLen++

    return regions
}

var inspectRejection = document.getElementById('inspectRejection')
if(inspectRejection){
    inspectRejection.addEventListener('click', async function(){
        if(interfaceApp.inspect.check() === 'complete'){
            alert('반려가 없습니다.')
        }else{
            const confirmed = confirm("최종 반려 하시겠습니까?");
            if(!confirmed) return
            inspectSuccessFn('반려')
        }
    })
}

const inspectSuccess = document.getElementById('inspectSuccess')
if(inspectSuccess){
    inspectSuccess.addEventListener('click', async function(){
        if(interfaceApp.inspect.check() === 'complete'){
            const confirmed = confirm("다음 단계로 넘기시겠습니까?");
            if(!confirmed) return
            inspectSuccessFn('통과')
        }else{
            alert('반려가 있습니다.')
        }
    })
}

function inspectSuccessFn(check){
    if (window.location.pathname == '/admin/index/adminview') {
        _url = "/admin/index/"
        $.ajax({
            url: "admin_complete",
            type: "POST",
            data: JSON.stringify({
                group: document.getElementById("groupId").value,
                memo: memoArray,
                check: check,
                work_type: document.getElementById("work_type").value,
                work_id:  document.getElementById("work_id").value,
                work_status: document.getElementById("workStatus").value
            }),
            success: function(data){
                if(data == 'false'){
                    alert("작업중 작업 상태가 변경되었습니다 확인 바랍니다.")
                }else{
                    alert("최종 검사 성공")
                }
                window.open('','_self').close();
            },
            error: function(){
            // console.log('error')
            alert("저장에 실패하셨습니다.")
            }
        })

    }else {
        task_api_url = "task_api"
            console.log('asdsad')
           $.ajax({
            url: "task_complete",
            type: "POST",
            data: JSON.stringify({
                group: document.getElementById("groupId").value,
                memo: memoArray,
                check: check
            }),
            success: function(){
                alert("최종 검사 성공")
                window.location.assign('/mywork')
            },
            error: function(){
            // console.log('error')
            }
        })
    }
}