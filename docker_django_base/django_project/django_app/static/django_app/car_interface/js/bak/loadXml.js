//상민 2021 11 05 ~


var video = document.querySelector("#orgVideo")

util.element.subscribe('#handpose', '#note', '.tool>div>button:nth-child(1)', '#modelLoad', '#modelReload', '.btn-success', '.btn-danger', '.btn-save', '#xmlLoad')
util.element.disable()
alert("\"작업 순서\" : video 업로드 => 작업 시작")

var interfaceApp = {
    file: {
        path: document.getElementById('exportVideo').value,
        downloadBtn: document.getElementById("fileDownload"),
        load: function(){

        },
        download: function(){

            let linkElement = document.createElement('a')

            linkElement.setAttribute('href', this.path)
            linkElement.setAttribute('download', this.name)
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

    canvas: {
        me: '',
        element: '',
    },

    video: {
        element: document.querySelector("#orgVideo"),
        scaleX: '',
        scaleY: ''
    },

    data: {

    },

    canvasForImage: {
        element: ''
    },

    workArea: {
        originElement: document.querySelector('.work-space'),
        element: document.querySelector('.video-form')
    },

}

interfaceApp.file.name = interfaceApp.file.path.substring(interfaceApp.file.path.lastIndexOf('/') + 1)

//파일 불러오기
interfaceApp.file.bringFile = async function(file){
    util.loading.on()

    var _file = interfaceApp.file
    var fileName = document.querySelector('.work-space .video-name')

    const videoURL = URL.createObjectURL(file);
    await video.setAttribute("src", videoURL);
    video.setAttribute('alt', file.name);
    fileName.textContent = file.name

    loadVideo(null, '재작업') // 로드

    util.element.enable()
    allRegions = []

    if (inputRegion.length > 2) {  // '[]'의 sting 크기는 2
        allRegions = JSON.parse(inputRegion.replace(/'/gi, '"'))
        inputRegion = null // 메모리 제거

        allRegions.forEach(elm => {
            wavesurfer.addRegion(elm)
        })

        allRegions = []

        Object.keys(wavesurfer.regions.list).map(function (id) {
            allRegions.push(wavesurfer.regions.list[id])
        })

        util.sort(allRegions)

        sptRegions = []
        // regions 5 요소씩 하위배열생성
        for (var i = 0; i < allRegions.length; i += 5) sptRegions.push(allRegions.slice(i, i + 5))

        // 클립 5개 묶음 버튼 생성
        setClipButton(sptRegions.length)

        // final_complete check
        let completeCnt = 0
        document.querySelectorAll('#sets').forEach(el => {
            if(el.classList.contains('complete')){
                completeCnt++;
            }
        })
    }

    if(!interfaceApp.canvasForImage.element){
        canvasforImage = document.createElement('canvas')
        canvasforImage.id = 'canvasforImage'
        interfaceApp.canvasForImage.element = canvasforImage
        interfaceApp.canvasForImage.context = canvasforImage.getContext('2d')
        console.log(interfaceApp.canvasForImage.context)
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

interfaceApp.centerArea = function(){
    var origin = interfaceApp.workArea.originElement
    var workArea = interfaceApp.workArea.element
    var x = origin.offsetWidth * 0.5 - workArea.offsetWidth * 0.5
    var y = origin.offsetHeight * 0.5 - workArea.offsetHeight * 0.5

    workArea.style.transform = `translate(${x}px, ${y}px)`
}

interfaceApp.initSize = function(){
    var originElement = interfaceApp.workArea.originElement
    var workArea = interfaceApp.workArea.element
    var video = interfaceApp.video.element
    var canvasForImage = interfaceApp.canvasForImage.element

    canvasForImage.width = video.videoWidth
    canvasForImage.height = video.videoHeight

    var diffWidth = workArea.offsetWidth - video.offsetWidth
    var diffHeight = workArea.offsetHeight - video.offsetHeight
    var value

    if(originElement.offsetWidth < workArea.offsetWidth || originElement.offsetHeight < workArea.offsetHeight){
        var scale = util.calcScale(workArea.offsetWidth, workArea.offsetHeight, originElement.offsetWidth - diffWidth, originElement.offsetHeight - diffHeight)
        value = Math.min(scale.x, scale.y)
    }
    console.log(value)
    this.updateScale(value)
    this.centerArea()
}

interfaceApp.updateScale = function(...value){
    value[0] == undefined? value[0] = 1 : value
    console.log(value)
    var video = interfaceApp.video.element
    var width = video.videoWidth * value[0]
    var height = video.videoHeight * (value[1] || value[0])

    console.log(width, height)
    video.style.width = width + 'px'
    video.style.height = height + 'px'

    interfaceApp.canvas.setSize(video)

    interfaceApp.markScale()
}

interfaceApp.canvas.setSize = function(element, width, height){
    switch(element? true : false){
        case true:
            // console.log(this.canvas)
            interfaceApp.canvas.me.setDimensions({ width: element.offsetWidth, height: element.offsetHeight })
        break
        case false:
            interfaceApp.canvas.me.setDimensions({ width: width, height: height })
        break
    }
}

interfaceApp.markScale = function(){
//    var markScale = document.querySelectorAll('.work-footer .work-scale span')
    var video = interfaceApp.video.element
    var scale = util.calcScale(video.videoWidth, video.videoHeight, video.offsetWidth, video.offsetHeight)

//    markScale[1].textContent = scale.x.toFixed(2)
//    markScale[1].title = scale.x
//    markScale[3].textContent = scale.y.toFixed(2)
//    markScale[3].title = scale.y

    interfaceApp.video.scaleX = scale.x
    interfaceApp.video.scaleY = scale.y
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
  final_complete.addEventListener('click', e => {
    modalFinalComplete.classList.add('open')
  })

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

        util.sor(allRegions)
//        allRegions.sort((a, b) => { // allRegions : arr(생성된 region 개수) [{regionId, startTime}, {regionId, startTime} ......] 정렬
//            if (a.start > b.start) return 1
//            if (a.start < b.start) return -1
//            return 0
//        })

        sptRegions = [];
        // regions 5 요소씩 하위배열생성
        for (var i = 0; i < regionsLen; i += 5) sptRegions.push(allRegions.slice(i, i + 5));
        // for(var i=0; i<sptRegions.length; i++) console.log(sptRegions[i]);
        // console.log(sptRegions);

        // 클립 5개 묶음 버튼 생성
        setClipButton(sptRegions.length);
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
    var objson = xml2json.fromStr(content);	// object 형식
    // var strjson = xml2json.fromStr(content, 'string');	// string 형식
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

const inspectSuccess = document.getElementById('inspectSuccess')
const inspect_complete_sure = document.getElementById('inspect_complete_sure')
const inspect_complete_cancel = document.getElementById('inspect_complete_cancel')

if(inspectSuccess){
   var modalInspectCheck = document.querySelector('.modal-inspect-complete')

    inspectSuccess.addEventListener('click', e => {
       modalInspectCheck.classList.add('open')
    })

    inspect_complete_sure.addEventListener('click', e => {
      $.ajax({
            url: 'task_complete',
            type: "POST",
            data: JSON.stringify({
              task_num : document.getElementById('tasknumber').value,
              group: document.getElementById("groupId").value
            }),
            success: function(){
                window.location.assign('/mywork')
            },
            error: function(){
                // console.log('error')
            }
      })

      modalInspectCheck.classList.remove('open')
    })

    inspect_complete_cancel.addEventListener('click', e => {
       modalInspectCheck.classList.remove('open')
    })
}