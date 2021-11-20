// Create an instance
var wavesurfer;
var regionInfo = new Map();
let sensor = new Map();
let pageMap=new Map();
let storedBBoxData = new Map();
let rejectMap = new Map();
let currentRegionId;
let occupantNum = 0;
let labeler;
let jsonData;
let json;
let taskId = 0;
let rejectStatus;
let nowSetPage=1;
var blurImgCreateStatus = 'not'
var blurImgCreateWating = []

function copyPreLabel(){
    // if(confirm('현재 프레임의 작업이 사라집니다')){
    if(labeler != undefined) {
        let currentImageIndex = parseInt(labeler.imageInfo.id.charAt(labeler.imageInfo.id.length - 1));
        if (currentImageIndex != 0) {
            if (labeler.bboxData.labels.length != 0) {
                // for(var i = 0; i < labeler.bboxData.labels.length; i++){
                //     if(labeler.bboxData.labels[i].associatedImage == labeler.imageInfo.id){
                //         labeler.bboxData.labels.splice(i,1);
                //     }
                // }
                var labelCnt = 0;
                for (var tmpLabel of labeler.bboxData.labels) {
                    if (tmpLabel.associatedImage == labeler.imageInfo.id) {
                        labelCnt++;
                    }
                }
                if (labelCnt == 0) {
                    for (var tmpLabel of labeler.bboxData.labels) {
                        if (tmpLabel.associatedImage == labeler.bboxData.images[currentImageIndex - 1].id) {
                            var left = tmpLabel.left;
                            var top = tmpLabel.top;
                            var width = tmpLabel.width;
                            var height = tmpLabel.height;
                            var labeledData = tmpLabel.labeledData;
                            labeler.loadPreLabel(left, top, width, height, labeler.labelNum, labeler.labelOption, randomColor(1), labeler.imageInfo.currentTime, labeledData, labeler.imageInfo.id)
                        }
                    }
                    labeler.taskLoading(currentImageIndex);
                } else {
                    alert('현재 페이지에 라벨이 존재하는 경우 이전 작업을 불러올 수 없습니다.');
                }
            } else {
                alert('이전 작업이 없습니다.');
            }
        } else {
            alert('이전 작업이 없습니다.');
        }
    }else{
        alert('이전작업이 없습니다.')
    }
    // }
}


// 프레임 변경을 위한 모달 fade-in
function frameChagne(){
    if(labeler != undefined && labeler.bboxData != undefined) {
        $(".modal").fadeIn();

        let frameStartTime;
        let frameEndTime;
        let currentImageIndex = parseInt(labeler.imageInfo.id.charAt(labeler.imageInfo.id.length - 1));
        let preCurrentTime = labeler.bboxData.images[currentImageIndex].currentTime;

        if (currentImageIndex == 0) {
            frameStartTime = labeler.bboxData.startTime;
            frameEndTime = labeler.bboxData.images[currentImageIndex + 1].currentTime;
        } else if (currentImageIndex == 4) {
            frameStartTime = labeler.bboxData.images[currentImageIndex - 1].currentTime;
            frameEndTime = labeler.bboxData.endTime;
        } else {
            frameStartTime = labeler.bboxData.images[currentImageIndex - 1].currentTime;
            frameEndTime = labeler.bboxData.images[currentImageIndex + 1].currentTime;
        }

        for (let index = 0; index < 10; index++) {
            let frameCurrentTime = parseFloat(frameStartTime) + parseFloat((index + 1) * (frameEndTime - frameStartTime) / 11);
            createImg(frameCurrentTime, preCurrentTime, currentImageIndex)
        }
    }else{
        alert('프레임 변경할 이미지가 선택되지 않았습니다.')
    }
}

//프레임 변경시 미리보기 이미지 생성
function createImg(frameCurrentTime, preCurrentTime, currentImageIndex){
    if(blurImgCreateStatus === 'run'){
        return blurImgCreateWating.push([frameCurrentTime, preCurrentTime, currentImageIndex])
    }
    blurImgCreateStatus = 'run'
    var video = document.querySelector('video#'+currentRegionId);
    var canvas = document.querySelector('#canvas');
    var context = canvas.getContext('2d');
    video.currentTime = frameCurrentTime

    return video.addEventListener('canplay', async function(){
        await context.drawImage(video, 0, 0, videoWidth, videoHeight);
        var dataURL = canvas.toDataURL('image/jpeg');
        let imageStr = "";
        imageStr += "<div class='img-box'>";
        imageStr += "<img src='" + dataURL + "' title='" + frameCurrentTime + "' onclick='changeImage(labeler.imageInfo.id," + frameCurrentTime + "," + preCurrentTime + "," + currentImageIndex + ")'>";
        imageStr += "<span>" + frameCurrentTime + "</span>";
        imageStr += "</div>";
        $(".change-image-list").append(imageStr);
        sequentialExecutionImg();
    }, { once: true })
}

//
function sequentialExecutionImg(){
    blurImgCreateStatus = 'not'
    if(blurImgCreateWating.length > 0){
        createImg(blurImgCreateWating[0][0],blurImgCreateWating[0][1],blurImgCreateWating[0][2])
        blurImgCreateWating.shift()
    }
}

//모달 닫기
function modalFadeOut(){
    var video = document.querySelector('video#orgVideo');
    video.currentTime = labeler.imageInfo.currentTime;
    $(".modal").fadeOut();
    $(".change-image-list").empty();
}

//프레임 이미지 변경
function changeImage(id, time, preTime, index){
    var video = document.querySelector('video#orgVideo');
    if(confirm('프레임을 변경하시겠습니까?')){
        labeler.imageInfo.currentTime = time;
        for(var tmpImg of labeler.bboxData.images){
            if(tmpImg.id == id){
                tmpImg.currentTime = time;
            }
        }
        for(var tmpImg of regionInfo.get(currentRegionId)){
            if(tmpImg.time == preTime){
                tmpImg.time = time;
            }
        }
        if(labeler.bboxData.labels.length != 0){
            for(var tmpLabel of labeler.bboxData.labels){
                if(tmpLabel.associatedImage == id){
                    tmpLabel.currentTime = time;
                }
            }
        }
        if(storedBBoxData.has(labeler.bboxData.startTime)){
            for(var tmpImg of storedBBoxData.get(labeler.bboxData.startTime).images){
                if(tmpImg.id == id){
                    tmpImg.currentTime = time;
                }
            }
            if(storedBBoxData.get(labeler.bboxData.startTime).labels.length != 0){
                for(var tmpLabel of storedBBoxData.get(labeler.bboxData.startTime).labels){
                    if(tmpLabel.associatedImage == id){
                        tmpLabel.currentTime = time;
                    }
                }
            }
        }
        if(wavesurfer.regions.list[currentRegionId].data.clip != undefined){
            for(var tmpLabel of wavesurfer.regions.list[currentRegionId].data.clip.labeled){
                if(tmpLabel.currentTime == preTime){
                    tmpLabel.currentTime = time;
                }
            }
        }
        modalFadeOut()
        showFrames(wavesurfer.regions.list[currentRegionId], index);
        labeler.taskLoading(index);
    }else{
        video.currentTime = preTime;
        modalFadeOut();
    }
}




/**작업 저장 */
//작업완료 버튼
function checkWorkComplete(){
    var totCntClips = Object.keys(wavesurfer.regions.list).length;
    var totCntStoredBbox = 0;
    for (var i of Object.keys(wavesurfer.regions.list)){
        if(wavesurfer.regions.list[`${i}`].workStatus =='완료'){
            totCntStoredBbox ++;
        }
    }
    if(totCntStoredBbox != 0 && totCntClips != 0)
        if (totCntClips == totCntStoredBbox)
            return true
        else
            return false
    return false
}

// 최종저장 로직
function changeWorkComplete(){
    if(confirm("최종 완료 하시겠습니까?")){
        if(checkWorkComplete()){
            var param = {"group" : group_id}
            workCompleteAjax(param)
        }else{
            alert("모든 클립에 대한 작업이 완료되지 않았습니다.");
        }
    }
}

// 최종 저장 Ajax
function workCompleteAjax(param){
    $.ajax({
        url : 'task_complete',
        type : 'POST',
        data : JSON.stringify(param),
        success : function (data) {
            window.location.href = '/mywork_record';
        },error : function(request, status, error){
            alert("code : "+request.status+"\nmessage : "+request.responseText+"\nerror"+error);
        }
    })
}
// 작업저장 버튼 클릭시 json 만들기
 function DataToString() {
    if(confirm("저장하시겠습니까?")){
        if(checkTaskComplete()){
            if(checkAllTaskComplete()){
                document.getElementById("playBtn").disabled = false;
                //taskComplete => 완료gg

                var videoAll = document.querySelectorAll("#clips video")
                for (var i=0; i<videoAll.length; i++){
                    if (document.querySelectorAll("#clips video")[i].classList.contains("showClip")){
                        var waveIDD = document.querySelectorAll("#clips video")[i].id
                        wavesurfer.regions.list[waveIDD].workStatus= '완료'
                    }
                }
                // let tmpExportArray=[];
                jsonData = new exportData(labeler.bboxData.startTime, labeler.bboxData.endTime);
                storeBBoxData();
                changeImageStatus();
                jsonData.saveMetaData(videoName);
                jsonData.saveOccupantData();
                // jsonData.saveSensorData();
                jsonData.saveLabeledData(labeler.bboxData.labels, ratioVideo);
                jsonData.saveSceneInfo();
                let tmpExportData = {
                    metadata : jsonData.metaData,
                    occupantInfo : jsonData.occupantInfo,
                    sceneInfo : jsonData.sceneInfo,
                    clip : jsonData.sceneData
                };
                // tmpExportArray.push(tmpExportData);
                // json = JSON.stringify(tmpExportArray);
                // json = tmpExportArray;
                json = tmpExportData;
                saveLabeledDataAjax();
                clipStatusSet();
                setsStatusAll(nowSetPage)

//                document.querySelector("#"+id).style.setProperty("border", "4px solid #5cb85c", "important");
                }
            }else{
                alert("작업이 완료되지 않았습니다.")
            }
        }
    }
// 작업저장 버튼 클릭시 ajax로 작업 저장
function saveLabeledDataAjax(){
    let start_time = labeler.bboxData.startTime;
    let end_time = labeler.bboxData.endTime;
    let task_id = labeler.bboxData.taskId;

    let param = {
        'start' : start_time,
        'end' : end_time,
        'attributes' : task_id,
        'group' : group_id,
        'data' : json
    }

    $.ajax({
        url : 'task_api',
        type : 'POST',
        data : JSON.stringify(param),
        success : function(data){
        },
        error : function(request, status, error){
            alert("code : "+request.status+"\nmessage : "+request.responseText+"\nerror"+error);
        }
    })
}

// labeler.bboxData.images.status 수정
function changeImageStatus() {
    for (var i = 0; i < labeler.bboxData.images.length; i++) {
        labeler.bboxData.images[i].status = true;
    }
}


// labeler.bboxData를 storedBBoxData에 저장 
// 210913 revise
function storeBBoxData() {
    if(labeler != undefined && labeler.bboxData != undefined){
        labeler.saveOccupantData();
        labeler.saveClipInfo();
        let id = labeler.bboxData.startTime
    //let id = labeler.bboxData.startTime + '/' + labeler.bboxData.endTime;
        let data = labeler.bboxData
        storedBBoxData.set(id, data);
    }
}

 function clipStatusMark(clipStatus, status) {

    if (!status || !clipStatus) return

    switch (status) {
        case '완료':
            clipStatus.classList.remove('clipworking')
             clipStatus.classList.remove('showClip')
            clipStatus.classList.remove('rejection')
            clipStatus.classList.add('complete')
            break
        case '반려':
            clipStatus.classList.remove('complete')
            clipStatus.classList.remove('clipworking')
             clipStatus.classList.remove('showClip')
            clipStatus.classList.add('rejection')
            break

        case '작업중':
            clipStatus.classList.remove('complete')
           // clipStatus.classList.remove('showClip')
            clipStatus.classList.remove('rejection')
            clipStatus.classList.add('clipworking')
            break
        case '제거':
            clipStatus.innerHTML = ''
            if (clipStatus.classList.contains('complete')) {
                clipStatus.classList.remove('complete')
            }
            if (clipStatus.classList.contains('rejection')) {
                clipStatus.classList.remove('rejection')
                clipStatus.classList.add('complete')
                clipStatus.innerHTML = `<i class='glyphicon glyphicon-ok'></i> 완료`
            }
            if (clipStatus.classList.contains('working')) {
                clipStatus.classList.remove('working')
            }
            break
    }
}


/**작업 이력 불러오기 */
// 작업 이력이 있는 경우 region 정보 가져오기
function loadRegions(regions) {
    let printCnt = 0;
    var maxTaskId = 0;
    regions.forEach(function (region) {
        taskId = region.task_id;
        var reject_memo = region.reject_memo;
        if(reject_memo != null){
            rejectMap.set(taskId, reject_memo);
        }

        var rejectStatus = region.reject_status;
        const obj = region.task_data;
        let reject_or_complete;
        if (rejectStatus=='Y'){
            reject_or_complete = '반려';
        }else{
            reject_or_complete = '완료';
        }
        obj.workStatus = reject_or_complete;
        obj.drag = false;
        obj.resize = false;
        obj.color = randomColor(1)
        obj.taskid = taskId
        wavesurfer.addRegion(obj);
        if(printCnt < 10){
            createClip(obj, taskId, rejectStatus)
            .then(sortClip())
            .catch(err => { throw new Error(err) })

        }else if(printCnt%10 == 0){
            var setViewNum = "";
            var maxSetNum = $("#sets").children().length+1;
            var btnNum ="";
            if (maxSetNum < 10){
                btnNum = "00"+maxSetNum;
            }else if(10 <= maxSetNum && maxSetNum < 100){
                btnNum = "0"+maxSetNum;
            }else{
                btnNum = maxSetNum;
            }
            setViewNum += "<button id='maxSetNum"+maxSetNum+"' onClick='setPagination("+maxSetNum+")'>"+btnNum+"</button>";
            $("#sets").append(setViewNum);
        }
        printCnt++;
        loadTaskHistory(obj, taskId)
        maxTaskId = maxTaskId > taskId ? maxTaskId : taskId;
    });
    taskId = maxTaskId + 1;
    var totClipCnt = Object.keys(wavesurfer.regions.list).length;
    pageMap.set("nowSetPage", totClipCnt%10 != 0 ? Math.floor(totClipCnt/10)+1 : Math.floor(totClipCnt/10));
    pageMap.set("nowPageClipCnt",totClipCnt%10);
    clipStatusSet();
    setsStatusAll(nowSetPage)
    removeCanvas();
    addRejectMemo();
}

//페이지네이션 로직
function setPagination(setNum){
    $("#clips").empty();
    let totClipCnt = wavesurfer.regions.list.length;
    let startCipNum = (setNum-1)*10+1;
    var l = 0;
    let array = []
    let clips = document.querySelector("#clips")
    Object.keys(wavesurfer.regions.list).map(id => {
        let region = wavesurfer.regions.list[id]
        array.push({ id: id, start: region.start, status: region.status})
    })
    array.sort((a, b) => {
        if (a.start > b.start) return 1
        if (a.start < b.start) return -1
        return 0
    })
    array.map(array => {
            l++;
            if ( startCipNum <= l && (startCipNum+10) > l){
                createClip(wavesurfer.regions.list[array.id]);
            }
    })
    nowSetPage = setNum;
    $('#sets').children('button').removeClass('showClip');
    $('#maxSetNum'+nowSetPage).addClass('showClip');
    clipStatusSet()
    setsStatusAll(nowSetPage)
}

//클립 상태(border)
function clipStatusSet(){
       Object.keys(wavesurfer.regions.list).map(id => {
        clipStatusMark(document.querySelector("#"+id), wavesurfer.regions.list[id].workStatus)

    })
}




// 세트 상태(border)
function setsStatusAll(nowsets) {

    var completeCnt = 0;
    var rejectCnt = 0;
    var workingCnt =0;
    var setsId = document.querySelector("#maxSetNum" + nowsets);
    var setVideo = document.querySelectorAll("#clips video")

    for (var i=0; i<setVideo.length; i++){
        if (setVideo[i].classList.contains("complete")){
            completeCnt++;
        }
        else if (setVideo[i].classList.contains("rejection")){
            rejectCnt++;
        }
        else if (setVideo[i].classList.contains("clipworking")){
            workingCnt++;
        }
    }
    if (completeCnt==setVideo.length){
        clipStatusMark(setsId, '완료')
    }
    else if (rejectCnt>0){
        clipStatusMark(setsId, '반려')
    }
    else if (workingCnt>0){
        clipStatusMark(setsId, '작업중')
    }
    else {
        setsId.classList.remove("complete")
        setsId.classList.add("showClip")
    }
}

// 작업 이력이 있는 경우 labeler.bboxdata에 값 넣기
function loadTaskHistory(region, task_id){

    labeler = new ImageLabeler(document.getElementById('demo'), videoHeight, videoWidth, task_id);
    let occupantList=[]
    for(let occupantInfo of region.data.occupantInfo){
        let occupantData={
            occupantId : occupantInfo.occupantId,
            occupant : occupantInfo.occupantPosition,
            occupantSex : occupantInfo.occupantSex,
            occupantAgeGroup : getKeyByValue(ageGroupMap, occupantInfo.occupantAgeGroup)
        }
        occupantList.push(occupantData);
    }
    labeler.bboxData.occupant = occupantList;
    let clipInfo = {
        sceneId : region.data.sceneInfo.sceneId,
        categoryId : region.data.sceneInfo.categoryId,
        categoryName : getKeyByValue(abnormalMap, region.data.sceneInfo.categoryName)
    }
    labeler.bboxData.clipInfo = clipInfo;

    var startTime = region.data.clip.start;
    var endTime = region.data.clip.end;
    var frameList = [];
    // var video = document.querySelector('video#' + region.id);
    var tmpRegionId;
    for(var key of Object.keys(wavesurfer.regions.list)){
        if(wavesurfer.regions.list[key].data.clip.start == startTime){
            tmpRegionId = key;
        }
    }

    for(var value of region.data.clip.labeled){
        // imageInfo, frameList
        var src = orgVideo.src;
        var id = 'video{(' + src + ')' + startTime + '/' + endTime + '}';
        labeler.bringClipInfo(id, startTime, endTime);

        let currentTime = value.currentTime;
        // var dataURL = canvas.toDataURL('image/jpeg');
        // frameList.push(new Image(currentTime, dataURL));
        frameList.push(new Image(currentTime));
        labeler.bringImageData(currentTime);

        labeler.labelNum = 0;

        // labeler.bboxData.labels 값 넣기
        for(var tmpOcpt of value.occupant){
            var bodyBBox = tmpOcpt.bodyBBox
            if(bodyBBox!= undefined || bodyBBox != null){
                labeler.labelNum++;
                var occupantPosition;
                var occupantSex;
                var occupantAgeGroup;
                for (var occupant of occupantList){
                    if(occupant.occupantId == tmpOcpt.occupantId){
                        occupantPosition = occupant.occupant;
                        occupantSex = occupant.occupantSex;
                        occupantAgeGroup = occupant.occupantAgeGroup;
                    }
                }
                let data = {
                    relatedLabel: labeler.labelOption.labelId + labeler.labelNum,
                    occupantId : tmpOcpt.occupantId,
                    occupant : occupantPosition,
                    occupantSex : occupantSex,
                    occupantAgeGroup : occupantAgeGroup,
                    dataKinds : 'action',
                    dataValue : getKeyByValue(actionMap[clipInfo.categoryName], tmpOcpt.action)
                }
                // var action = "action," + getKeyByValue(actionMap[clipInfo.categoryName], tmpOcpt.action)
                labeler.putLabel(bodyBBox[0], bodyBBox[1], bodyBBox[2], bodyBBox[3], labeler.labelNum, labeler.labelOption, randomColor(1), value.currentTime, data)
            }

            var faceBBox = tmpOcpt.faceBBox
            if(faceBBox!= undefined || faceBBox != null){
                labeler.labelNum++;
                var occupantPosition;
                var occupantSex;
                var occupantAgeGroup;
                for (var occupant of occupantList){
                    if(occupant.occupantId == tmpOcpt.occupantId){
                        occupantPosition = occupant.occupant;
                        occupantSex = occupant.occupantSex;
                        occupantAgeGroup = occupant.occupantAgeGroup;
                    }
                }
                let data = {
                    relatedLabel: labeler.labelOption.labelId + labeler.labelNum,
                    occupantId : tmpOcpt.occupantId,
                    occupant : occupantPosition,
                    occupantSex : occupantSex,
                    occupantAgeGroup : occupantAgeGroup,
                    dataKinds : 'emotion',
                    dataValue : getKeyByValue(emotionMap, tmpOcpt.emotion)
                }
                // var emotion = "emotion," + getKeyByValue(emotionMap, tmpOcpt.emotion)
                labeler.putLabel(faceBBox[0], faceBBox[1], faceBBox[2], faceBBox[3], labeler.labelNum, labeler.labelOption, randomColor(1), value.currentTime, data)
            }
        }
    }
    regionInfo.set(tmpRegionId, frameList);
    putBBoxData();

    var waveid = tmpRegionId
    let reject_or_complete;
    if (region.workStatus=='반려'){
        reject_or_complete = '반려';
    }
    else{
        reject_or_complete = '완료';
    }
    wavesurfer.regions.list[waveid].workStatus = reject_or_complete;
}

// value로 key 확인
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}




// db에 작업 정보가 있는 경우 bboxdata를 가져와서 storedBBoxData에 값 넣기
function putBBoxData() {
    let id = labeler.bboxData.startTime
    //let id = labeler.bboxData.startTime + '/' + labeler.bboxData.endTime;
    let data = labeler.bboxData
    storedBBoxData.set(id, data);
    changeImageStatus();
}






/**
 * Extract regions separated by silence.
 */
function extractRegions(peaks, duration) {
    // Silence params
    let minValue = 0.0015;
    let minSeconds = 0.25;

    let length = peaks.length;
    let coef = duration / length;
    let minLen = minSeconds / coef;

    // Gather silence indeces
    let silences = [];
    Array.prototype.forEach.call(peaks, function (val, index) {
        if (Math.abs(val) <= minValue) {
            silences.push(index);
        }
    });

    // Cluster silence values
    let clusters = [];
    silences.forEach(function (val, index) {
        if (clusters.length && val == silences[index - 1] + 1) {
            clusters[clusters.length - 1].push(val);
        } else {
            clusters.push([val]);
        }
    });

    // Filter silence clusters by minimum length
    let fClusters = clusters.filter(function (cluster) {
        return cluster.length >= minLen;
    });

    // Create regions on the edges of silences
    let regions = fClusters.map(function (cluster, index) {
        let next = fClusters[index + 1];
        return {
            start: cluster[cluster.length - 1],
            end: next ? next[0] : length - 1
        };
    });

    // Add an initial region if the audio doesn't start with silence
    let firstCluster = fClusters[0];
    if (firstCluster && firstCluster[0] != 0) {
        regions.unshift({
            start: 0,
            end: firstCluster[firstCluster.length - 1]
        });
    }

    // Filter regions by minimum length
    let fRegions = regions.filter(function (reg) {
        return reg.end - reg.start >= minLen;
    });

    // Return time-based regions
    return fRegions.map(function (reg) {
        return {
            start: Math.round(reg.start * coef * 100) / 100,
            end: Math.round(reg.end * coef * 100) / 100
        };
    });
}


// 랜덤 컬러 생성
function randomColor(alpha) {
    return (
        'rgba(' +
        [
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            alpha || 1
        ] +
        ')'
    );
}

function storeRegionID(region) {
    currentRegionId = region.id;
}

class Image {
    constructor(time) {
        this.time = time;
    }
}


// 클립 영역 이벤트
const clipsContainer = document.querySelector('#clips')

let recentlyPlay

clipsContainer.addEventListener('click', e => {

    if (e.target.nodeName !== 'VIDEO') return
    let region = wavesurfer.regions.list[e.target.id]
    recentlyPlay = region
    e.target.play()
})

clipsContainer.addEventListener('mouseout', e => {

    if (!recentlyPlay) return
    if (e.target.id === recentlyPlay.id) {
        let region = wavesurfer.regions.list[recentlyPlay.id]
        let video = document.getElementById(recentlyPlay.id)
        video.currentTime = region.start;
        video.pause()
        recentlyPlay = null
    } else if (e.target.id !== recentlyPlay.id && e.target.nodeName === 'VIDEO') {
        let region = wavesurfer.regions.list[e.target.id]
        recentlyPlay = region
    }
})



clipsContainer.addEventListener('dblclick', e => {
    document.getElementById("playBtn").disabled = true;
    storeBBoxData();

    if (e.target.nodeName !== 'VIDEO') return
    let region = wavesurfer.regions.list[e.target.id]
    region.play();
    //더블클릭했을 때 여기서 currentId 생성한다
    storeRegionID(wavesurfer.regions.list[e.target.id]);
    // indexValue = 0;
    // document.getElementById("preBtn").disabled = true;
    // document.getElementById("nextBtn").disabled = false;
    document.getElementById("playBtn").disabled = true;
    // document.getElementById("exportBtn").disabled = true;
    document.getElementById("saveBtn").disabled = false;
    // 클립 선택 영역 표시
    $('#clips').children('video').removeClass('showClip');
    $('#'+region.id).addClass('showClip');
    cinfirmCanvas();
    //끝까지 재생됬을 때
    region.once('out', function () {
        // id = region.start + '/' + region.end
        id = region.start
        occupantNum = 0;
        if (!storedBBoxData.has(id)) {                      
            labeler = new ImageLabeler(document.getElementById('demo'), videoHeight, videoWidth, taskId);
            addRejectMemo(taskId);
        }else{
            labeler = new ImageLabeler(document.getElementById('demo'), videoHeight, videoWidth, storedBBoxData.get(id).taskId);
            addRejectMemo(storedBBoxData.get(id).taskId);
        }
        loadBBoxData(id);
        addPageNationBtn(0);
        loadClipInfo();
        loadOccupantInfo();
        showFrames(wavesurfer.regions.list[this.id], 0);

    });


    document.getElementById("playBtn").onclick = function () {
        cinfirmCanvas();
        removeBBox();
        removeLabelRegion();
        
    }

})

//반려사유 추가
function addRejectMemo(taskId){
    if(taskId == undefined){
        let rejectMemo = document.querySelector('#rejcetMemo');
            rejectMemo.innerHTML = '<h2>반려사유</h2>' +
                '<div id="reject" style="height:80%;">' +
                '<textarea readonly="" id="markRejection" class="form-control" style="height:98%; resize: none;">'+memoArray.join("\n")+'</textarea>' +
                '</div>';

    }else{
        if(rejectMap.has(taskId)){
            let rejectMemo = document.querySelector('#rejcetMemo');
            rejectMemo.innerHTML = '<h2>반려사유</h2>' +
                '<div id="reject" style="height: 80%;">' +
                '<textarea readonly="" id="markRejection" class="form-control" style="height:98%; resize: none;">'+rejectMap.get(taskId)+'</textarea>' +
                '</div>';
        }else{
            let rejectMemo = document.querySelector('#rejcetMemo');
            rejectMemo.innerHTML = '<h2>반려사유</h2>' +
                '<div id="reject" style="height:80%;">' +
                '<textarea readonly="" id="markRejection" class="form-control" style="height:98%; resize: none;"></textarea>' +
                '</div>';
        }
    }

}

//canvas 여부 확인
function cinfirmCanvas() {
    //캔버스 통째로 삭제해서 있는지 없는지 확인
    if (document.querySelector('.canvas-container') == null)  return
    removeCanvas();
}

//세트 영역과 클립영역 비우기
function removeSetPagination(){
    $("#sets").empty();
    $("#clips").empty();
    if(wavesurfer.regions != undefined){
            wavesurfer.regions.list={};
    }
}

//마지막 클립 삭제시 세트 번호 버튼도 지우기
function removeSetBtn(){
    var nowClipCnt = $("#clips").children().length;
    if(nowSetPage != 1){
        if(nowClipCnt == 1){
            $("#maxSetNum"+nowSetPage).remove();
            pageMap.set("nowSetPage", nowSetPage -1);
            pageMap.set("nowPageClipCnt", 10);
            setPagination(nowSetPage-1);
        }
    }
}

//canvas 삭제
function removeCanvas(){
    let canvasArea = document.getElementById('canvas-area');
    let tmpCanvas = document.getElementById('c');
    if (labeler != undefined)
        labeler.clearCanvas();
    tmpCanvas.style.position = 'relative';
    canvasArea.appendChild(tmpCanvas);
    $("div.canvas-container").remove();
}

//clipInfo 삭제
function removeClipInfo(){
    let clip = document.getElementById('clip');
    if (clip){
        clip.remove();
    }
}

function removeStoredBBox(startTime, endTime){
let id = startTime
    //let id = startTime + '/' + endTime;
    if(storedBBoxData.has(id)){
        storedBBoxData.delete(id);
    }
}

//bbox 삭제
function removeBBox(){
    if(labeler.canvas != undefined){
        var objects = labeler.canvas.getObjects();
        for (var i = 0; i < objects.length; i++) {
            labeler.canvas.remove(objects[i]);
        }
        delete labeler.bboxData;
    }
}

//라벨링 영역 삭제
function removeLabelRegion(){  
    if(labeler === undefined) return
    labelNum = labeler.labelNum <= labeler.imageInfo.maxLabelNum ? labeler.imageInfo.maxLabelNum : labeler.labelNum;
    for (var k = 0; k < labelNum; k++) {
        labeler.removeLabelform(k + 1);
    }
}

//클립 영역 삭제
function removeClipRegion(){
    let clipRegion = $('#clips video');

    for (var j = 0; j < clipRegion.length ;j++) {
        clipRegion[j].remove();
        let videoId = clipRegion[j].id;
        removeRegion(videoId);
    }
}

//occupant&sensor 삭제
function removeSensor(){  
    let occupantList = $(".occupant_info");
    for(var i = 0; i < occupantList.length; i++){
        let occupant = occupantList[i].id.substr(8,);
        deleteOccupantInfo(occupant)
    }	
}

//wavesurfer region 삭제
function removeRegion(regionId){  
    delete regionInfo.delete(regionId);
    wavesurfer.regions.list[regionId].remove();
}

//클립 작업 상태 보여주는 div 생성
 function statusDisplayElement(){
     var _div =  document.createElement('div')
     _div.classList.add('clip-status')
     return _div
 }

// 클립 영역에 클립 생성
async function createClip(region,task_id,viewYN) {

    if (document.getElementById(region.id)) return await (function () {
        updateClip(region)
    })()

    let clips = document.querySelector("#clips");
    //비디오와 status 담는 div
    let video = document.createElement('video');
    if(region.id === undefined || region.id === null){
        Object.keys(wavesurfer.regions.list).map(id => {
            let region = wavesurfer.regions.list[id]
            region.status = rejectStatus;
            video.id = region.id;

        })
    }else {
        video.id = region.id;
    }
    video.style = 'margin: 0px 4px; width: 100px; display:inlin';
    video.src = orgVideo.src + '#t=' + region.start + ',' + region.end;
    video.type = 'video/mpeg';
    video.task_id = task_id;
    $('#clips').children('video').removeClass('showClip');

    clips.appendChild(video);
    //document.getElementById(`${video.id}`).classList.add("showClip")

    setsStatusAll(nowSetPage);
    rejectStatus = '';
}



function updateClip(region) {

    let clip = document.getElementById(region.id)
    clip.src = orgVideo.src + '#t=' + region.start + ',' + region.end;


}

// 클립 영역 정렬
function sortClip() {
    let array = []
    let clips = document.querySelector("#clips")

    Object.keys(wavesurfer.regions.list).map(id => {
        let region = wavesurfer.regions.list[id]
        array.push({ id: id, start: region.start, status: region.status})
    })

    array.sort((a, b) => {
        if (a.start > b.start) return 1
        if (a.start < b.start) return -1
        return 0
    })

    array.map(array => {
        let region = document.getElementById(array.id)
        if(region != null)

            clips.append(region);

            // if not use "if(region != null)" -> null will be shown on clips
    })
}


// 클라이언트에서 저장되어 있는 경우 bbox 데이터를 불러오기
function loadBBoxData(id) { 
    if (storedBBoxData.has(id)) {
        let bboxData = storedBBoxData.get(id);
        labeler.bboxData = bboxData;
        // if(storedBBoxData.get(id).taskComplete != true)
        //     labeler.bboxData.labels = [];
    }else{
        taskId++; 
    }
}


// 프레임 추출
async function showFrames(region, indexNum) {
//해당 페이지에 나와야 되는 region 정보로 바운딩 박스 그려야 되서
    var video = document.querySelector('video#' + region.id);
    var canvas = document.querySelector('#canvas');
    var context = canvas.getContext('2d');

    var frameList = [];
    //regionInfo 에는 프레임 정보가 담김
    if (regionInfo.has(region.id)) {
        frameList = regionInfo.get(region.id);
        //지금 현재 비디의 currentTime 을 가져온다 근데 더블클릭하고 나서 region 구간을 선택하면 안된다 어차피 그런 시간 x
        orgVideo.currentTime = frameList[indexNum].time;
        //프레임 리스트에 현재 페이지 인덱스 정보와 시간 저장
        //여기는 예전 작업 없을 때
        if(labeler.bboxData.images.length == 0){
            var labeler_1 = labeler.bboxData.images.length
            var startTime = region.start;
            var endTime = region.end;

            var src = orgVideo.src;
            var id = 'video{(' + src + ')' + startTime + '/' + endTime + '}';
            labeler.bringClipInfo(id, startTime, endTime);
            for (let index = 0; index<frameList.length; index++) {

                // let currentTime = startTime + index * (endTime - startTime) / 5;
                let currentTime = startTime + index * (endTime - startTime) / 4;
                labeler.bringImageData(String(currentTime));
            }
        }
        //현재페이지가 1페이지면
        if (indexNum == 0) {
            var indexNum_1 = indexNum
            labeler.taskLoading(0);
        }

    } else {
        var startTime = region.start;
        var endTime = region.end;

        var src = orgVideo.src;
        var id = 'video{(' + src + ')' + startTime + '/' + endTime + '}';
        labeler.bringClipInfo(id, startTime, endTime);

        for (let index = 0; index < 5; index++) {

            // let currentTime = startTime + index * (endTime - startTime) / 5;
            let currentTime = startTime + index * (endTime - startTime) / 4;
            video.currentTime = String(currentTime);

            context.drawImage(video, 0, 0, 1200, 675);
            frameList.push(new Image(currentTime));
            labeler.bringImageData(currentTime);
        }

        regionInfo.set(region.id, frameList);
        labeler.taskLoading(0);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// 작업 저장시 탑승자 정보와 라벨링 정보 확인 
function checkTaskComplete() {
    // let labels = $('.labelform');
    let occupantList = $(".occupant_info");
    let checkCnt = 0;
    let messageStr="";
    //탑승자 한명당 감정 이상행동 두개 바인딩 박스
    for(var occupant of occupantList){
        let emotionCnt = 0;
        let actionCnt = 0;
        //탑승자 한 명에 대한 감정,이상행동 정보 갯수를 센다
        for (var label of labeler.bboxData.labels){
            if(label.associatedImage == labeler.imageInfo.id){
                if(label.labeledData.occupantId == occupant.id){
                    if(label.labeledData.dataKinds == "emotion"){
                        emotionCnt++;
                    }else if(label.labeledData.dataKinds == "action"){
                        actionCnt++;
                    }
                }
            }
        }
        if(emotionCnt == 1){
            if(actionCnt == 1){

                checkCnt ++;
            }else if(actionCnt > 1){
                messageStr += occupant.id + ": 이상행동 라벨링 갯수가 너무 많습니다./";
            }else{
                messageStr += occupant.id + ": 이상행동이 라벨링 되지 않았습니다./";
            }
        }else if(emotionCnt > 1){
            if(actionCnt == 1){
                messageStr += occupant.id + ": 감정 라벨링 갯수가 너무 많습니다./";
            }else if(actionCnt > 1){
                messageStr += occupant.id + ": 이상행동과 감정 라벨링 갯수가 너무 많습니다./";
            }else{
                messageStr += occupant.id + ": 감정 라벨링 갯수가 많고 이상행동이 라벨링 되지 않았습니다./";
            }
        }else{
            if(actionCnt == 1){
                messageStr += occupant.id + ": 감정이 라벨링 되지 않았습니다./";
            }else if(actionCnt > 1){
                messageStr += occupant.id + ": 이상행동 라벨링 갯수가 많고 감정이 라벨링 되지 않앗습니다./";
            }else{
               messageStr += occupant.id + ": 감정과 이상행동이 라벨링 되지 않았습니다./";
            }
        }
    }
    if(occupantList.length == checkCnt){
        return true;
    }else{
        alert(messageStr);
        return false;
    }

}

//저장시 작업완료 확인
function checkAllTaskComplete(){
    let occupantList = $(".occupant_info");
    let labeledDataCnt = 0;
    for (let i of labeler.bboxData.labels){
    //작업저장을 해야지 labeledData 가 저장되나봄
        labeledDataCnt += Object.keys(i.labeledData).length != 0 ? 1 : 0;
    }
    if (labeledDataCnt == occupantList.length*10)
        return true;
    else
        return false;
}
// region 중복 구간 확인 
function regionOver(region) {
    if(Object.keys(wavesurfer.regions.list).length>1){
        let regionId = region.id;
        let startList = [];
        let endList = [];

        for (var key in wavesurfer.regions.list) {
            startList.push(wavesurfer.regions.list[key].start);
            endList.push(wavesurfer.regions.list[key].end);
        }
        startList = startList.sort(function (a, b) {
            return a - b;
        });
        endList = endList.sort(function (a, b) {
            return a - b;
        });
        let currntNum = startList.findIndex((e) => e === region.start);
        let backRegionEnd = endList[currntNum - 1];
        let nextRegionStart = startList[currntNum + 1];

        if (region.end > nextRegionStart || region.start < backRegionEnd) {
            if(wavesurfer.regions.list[regionId]){
                wavesurfer.regions.list[regionId].remove();
            }
            alert('구간설정 중복은 불가능 합니다.')
            const clips = document.querySelector('#clips')
            const regionEl = clips.querySelector('#'+regionId)
            if(regionEl){
                regionEl.remove()
            }
            return false;
        }
        return true;
    }else{
        return true;
    }
}

// region 삭제 버튼 클릭 
function ClickRemoveBtn() {
   //if(Object.keys(wavesurfer.regions.list).length
    let regionId = currentRegionId;
    if (regionId != undefined && labeler != undefined && labeler.bboxData != undefined){
        if(confirm("삭제하시겠습니까?")){
            let clipId = document.getElementById(regionId);
            removeTaskId = labeler.bboxData.taskId;

            let param = {};
            // let changeTaskIdList = [];
            if (regionId) {
                // let num = labeler.imageInfo.maxLabelNum > labeler.labelNum ? labeler.imageInfo.maxLabelNum : labeler.labelNum;
                // for(let key of storedBBoxData.keys()){
                //     if(storedBBoxData.get(key).taskComplete){
                //         if(storedBBoxData.get(key).taskId > labeler.bboxData.taskId){
                //             changeTaskIdList.push(storedBBoxData.get(key).taskId);
                //         }
                //     }
                // }
                param = {
                    'attributes' : labeler.bboxData.taskId,
                    'start' : labeler.bboxData.startTime,
                    'end' : labeler.bboxData.endTime
                    // 'chgTaskIdList' : changeTaskIdList
                }
                removeStoredBBox(labeler.bboxData.startTime, labeler.bboxData.endTime);
                removeLabelRegion();
                // removeSensor();
                document.querySelector(".pagination").remove()
                removeRegion(regionId);
                removeClipInfo();
                $('#occupantArea').empty();
                removeSetBtn();
                clipId.remove();
                cinfirmCanvas();
                removeBBox();
                sortClip();
                sortClip();

                // document.getElementById("playBtn").disabled = false;
                // document.getElementById("nextBtn").disabled = true;
                // for(let key of storedBBoxData.keys()){
                //     if (storedBBoxData.get(key).taskId > removeTaskId){
                //         var tmpId = storedBBoxData.get(key).taskId;
                //         tmpId --;
                //         storedBBoxData.get(key).taskId = tmpId;
                //     }
                // }
                // taskId --;
            }
            $.ajax({
                url : 'task_region_delete',
                type : 'POST',
                data : JSON.stringify((param)),
                success : function(data){
                    document.getElementById("playBtn").disabled = false;
                },
                error : function(request, status, error){
                    alert("code : "+request.status+"\nerror : "+error);
                }
            });
        }
    }
    else{
        alert("삭제할 클립이 선택되지 않았습니다")
    }
};





// 탑승자 정보 이력이 있는 경우 불러오기
function loadOccupantInfo(){
    $('#occupantArea').empty();
    if(labeler.bboxData.occupant.length != 0){
        let maxNum = 0;
        var plus = "";
        plus += "<div><button id='plusPerson' onclick ='addOccupantInfo()'><i class='glyphicon glyphicon-plus'></i></button></div>";

        $('#occupantArea').prepend(plus);

        for(var i = 0; i < labeler.bboxData.occupant.length; i++){
            var str = "";
            var occupantId = labeler.bboxData.occupant[i].occupantId;
            var occupant = labeler.bboxData.occupant[i].occupant;
            var occupantSex = labeler.bboxData.occupant[i].occupantSex;
            var occupantAgeGroup = labeler.bboxData.occupant[i].occupantAgeGroup;
            var occptNum = occupantId.charAt(occupantId.length-1);
            maxNum = maxNum >= occptNum ? maxNum : occptNum; 
            str += "<div id='" + occupantId + "' class='occupant_info' style='margin-top:0px'>";
            str += "<div id='occupantId'>"
            str += "<div style='margin-bottom: 4px;'><strong>" + occupantId + "</strong></div>";
            str += "</div>";
            str += "<div id='occupantInfo'>";
            str += "<div style='display: flex; align-items: center;'><select id='occupant_select'>";
            str += "<option value='' >선택</option>";
            for (var key in occupantMap) {
                if(key == occupant){
                    str += "<option value='" + key + "' selected>" + occupantMap[key] + "</option>";
                }else{
                    str += "<option value='" + key + "'>" + occupantMap[key] + "</option>";   
                }
            }
            str += "</select>";
            str += "<select id='occupant_sex'>";
            str += "<option value='' >선택</option>";
            for (var key in genderMap) {
                if(key == occupantSex){
                    str += "<option value='" + key + "' selected>" + genderMap[key] + "</option>";
                }else{
                    str += "<option value='" + key + "'>" + genderMap[key] + "</option>";
                }
            }
            str += "</select>";
            str += "<select id='occupant_age'>";
            str += "<option value='' >선택</option>";
            for (var key in ageGroupMap) {
                if(key == occupantAgeGroup){
                    str += "<option value='" + key + "' selected>" + ageGroupMap[key] + "</option>";
                }else{
                    str += "<option value='" + key + "'>" + ageGroupMap[key] + "</option>";
                }
            }
            str += "</select>";
            var occupantList = $(".occupant_info");
            if (occupantList.length >= 1){
                str += "<button id='minusPerson' style='margin-left: auto;' class='btn btn-danger btn-xs' onclick ='deleteOccupantInfo(" + maxNum + ")'><i class='glyphicon glyphicon-minus'></i></button></div>";
            }
            str += "</div>";
            str += "</div>";

            // var sensorData = "";
            // sensorData += "<div id='occupant_sensor'><div class='col-sm-12'><input class='occupant_sensorloader' id='sensorloader" + occptNum + "' type='file'accept='text/plain' onchange='loadFile(" + occptNum + ")'>"
            // sensorData += "<label for='sensorloader" + occptNum + "'><i class='glyphicon glyphicon-open-file'/>&nbsp;센서</label><span id='fileName" + occptNum + "'>선택된 파일없음</span>";
            // sensorData += "</div></div>";

            $("#occupantArea").append(str);
            // $('#occupant' + occptNum).append(sensorData);
        }
        occupantNum = maxNum;
    }else{
        addOccupantInfo();
    }
}

// 탑승자 정보 추가
function addOccupantInfo(){
    occupantNum++;
    var plus = "";
    var occupantList = $(".occupant_info");
    //탑승자 2명까지만 허락
    if (occupantList.length >= 2){
        alert("탑승자는 최대 두명까지만 생성이 가능합니다.");
        return
    }
    plus += "<div><button id='plusPerson' onclick ='addOccupantInfo()'><i class='glyphicon glyphicon-plus'></i></button></div>";

    var str = "";
    //탑승자 정보 div 만들기
    str += "<div id='occupant" + occupantNum + "' class='occupant_info' style='margin-top:0px;'>";
    str += "<div id='occupantId'>"
    str += "<div style='margin-bottom: 4px;'><strong>occupant" + occupantNum + "</strong></div>";
    str += "<div id='occupantInfo'>";
    str += "<div style='display: flex; align-items: center;'><select id='occupant_select'>";
    str += "<option value='' >선택</option>";
    for (var key in occupantMap) {
        str += "<option value='" + key + "'>" + occupantMap[key] + "</option>";
    }
    str += "</select>";
    str += "<select id='occupant_sex'>";
    str += "<option value='' >선택</option>";
    for (var key in genderMap) {
        str += "<option value='" + key + "'>" + genderMap[key] + "</option>";
    }
    str += "</select>";
    str += "<select id='occupant_age'>";
    str += "<option value='' >선택</option>";
    for (var key in ageGroupMap) {
        str += "<option value='" + key + "'>" + ageGroupMap[key] + "</option>";
    }
    str += "</select>";
    if (occupantList.length >= 1){
        str += "<button id='minusPerson' style='margin-left: auto;' class='btn btn-danger btn-xs' onclick ='deleteOccupantInfo(" + occupantNum + ")'><i class='glyphicon glyphicon-minus'></i></button></div>";
    }
    str += "</div>";
    str += "</div>";

    // var sensorData = "";
    // sensorData += "<div id='occupant_sensor'><div class='col-sm-12'><input class='occupant_sensorloader' id='sensorloader" + occupantNum + "' type='file'accept='text/plain' onchange='loadFile(" + occupantNum + ")'>"
    // sensorData += "<label for='sensorloader" + occupantNum + "'><i class='glyphicon glyphicon-open-file'/>&nbsp;센서</label><span id='fileName" + occupantNum + "'>선택된 파일없음</span>";
    // sensorData += "</div></div>";
    if ($('#plusPerson').length == 0) {
        $('#occupantArea').prepend(plus);
    }
    $("#occupantArea").append(str);
    // $('#occupant' + occupantNum).append(sensorData);
    occupantList = $(".occupant_info");
    if (document.getElementsByName("label-box-occupantId").length != 0) {
        var occptStr = "";
        occptStr += "<option value='' >선택</option>";
        for (var i = 0; i < occupantList.length; i++) {
            var occupantid = occupantList[i].id;
            occptStr += "<option value='" + occupantid + "'>" + occupantid + "</option>";
        }
        $("select[name=label-box-occupantId]").empty();
        $("select[name=label-box-occupantId]").append(occptStr);
        $("select[name=label-box-data]").val('');
        $("select[name=label-box-emotion]").val('');
        $("select[name=label-box-action]").val('');
        $("select[name=label-box-emotion]").hide();
        $("select[name=label-box-action]").hide();
    }
}

//클립인포 정보가 있는 경우 클립 인포 정보 불러오기
function loadClipInfo(){
    $("#clipArea").empty();

    if(Object.keys(labeler.bboxData.clipInfo).length != 0){
        var categoryName = labeler.bboxData.clipInfo.categoryName;
        var tmpStr = "";
        tmpStr += "<div id='clip' class='clip_info' style='margin-top:0px;'>"
        tmpStr += "<div style='margin-bottom: 4px;'><strong>이상행동 정보</strong></div>"
        tmpStr += "<div id='clipInfo'>";
        tmpStr += "<div style='display: flex; align-items: center;'><select id='clip_select' onchange='changeActionLabelBox()'>";
        tmpStr += "<option value='' >선택</option>";
        for (var key in abnormalMap){
            if(key == categoryName)
                tmpStr += "<option value='" + key + "' selected>" + abnormalMap[key] + "</option>";
            else
                tmpStr += "<option value='" + key + "'>" + abnormalMap[key] + "</option>";
        }
        tmpStr += "</select>";
        tmpStr += "</div>";
        tmpStr += "</div>";
        $("#clipArea").append(tmpStr);
    }else{
        addClipInfo();
    }
}
//클립 인포 셀렉트 생성
function addClipInfo(){
    var tmpStr = "";
    tmpStr += "<div id='clip' class='clip_info' style='margin-top:0px;'>"
    tmpStr += "<div style='margin-bottom: 4px;'><strong>이상행동 정보</strong></div>"
    tmpStr += "<div id='clipInfo'>";
    tmpStr += "<div style='display: flex; align-items: center;'><select id='clip_select' onchange='changeActionLabelBox()'>";
    tmpStr += "<option value='' >선택</option>";
    for (var key in abnormalMap){
        tmpStr += "<option value='" + key + "'>" + abnormalMap[key] + "</option>";
    }
    tmpStr += "</select>";
    tmpStr += "</div>";
    tmpStr += "</div>";
    $("#clipArea").append(tmpStr);
}

//클립포즈 셀렉트 변경시 액션 라벨링 박스 선택지 변경
//여기다가 행동 데이터 넣자
function changeActionLabelBox(){
    let tmpStr="";
    tmpStr += "<option value='' >선택</option>";
    for(var key in actionMap){
        if($("#clip_select").val() == key){
            for(var action_key in actionMap[key]){
                tmpStr += "<option value='" + action_key + "'>" + actionMap[key][action_key] + "</option>";
            }
        }
    }
    // 액션이 포함된 labeledData 모두 삭제
    for(var tmpLabel of labeler.bboxData.labels){
        if(tmpLabel.labeledData.dataKinds == "action"){
            tmpLabel.labeledData = {};
        }
    }
    $("select[name=label-box-action]").empty();
    $("select[name=label-box-action]").append(tmpStr);


}


// 비디오 파일 업로드 
function loadFile(num) {
    var name = "occupant" + num;
    const occupantSensor = new Map();
    const sensorForm = document.querySelector('#sensorloader' + num);
    let file = sensorForm.files[0]
    var filename = document.getElementById('fileName' + num);
    filename.innerText = file.name;

    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var result = e.target.result;
            result = result.replace(/(\r\n|\n|\r|)/gm, "");
            result = result.replace(/(\t)/gm, ",");
            result = result.replace(/(\s)/gm, "");
            var arr = result.split(',');
            arr = arr.filter(Boolean);

            var ECG = [];
            var EEG1 = [];
            var ECG2 = [];
            var PPG = [];


            for (var i = 0; i < arr.length; i++) {
                if (i % 4 == 0) {
                    ECG.push(arr[i]);
                } if (i % 4 == 1) {
                    EEG1.push(arr[i]);
                } if (i % 4 == 2) {
                    ECG2.push(arr[i]);
                } if (i % 4 == 3) {
                    PPG.push(arr[i]);
                }
            }

            occupantSensor.set("ECG", ECG);
            occupantSensor.set("EEG1", EEG1);
            occupantSensor.set("EEG2", ECG2);
            occupantSensor.set("PPG", PPG);
            sensor.set(name, occupantSensor);
        }

        reader.readAsText(file);
    };
}



// 탑승자 정보 삭제
function deleteOccupantInfo(num) {
    if(confirm("정말 삭제하시겠습니까?")){
        let occupantId = 'occupant' + num;

        //삭제할 occupantId가 포함된 labeledData 초기화
        var tmpLabels = [];
        for (var tmpLabel of labeler.bboxData.labels){
            if (occupantId == tmpLabel.labeledData.occupantId){
                labeler.canvas.remove(tmpLabel);
                continue;
            }else{
                tmpLabels.push(tmpLabel);
            }
        }
        labeler.bboxData.labels = tmpLabels;

        //ocuupantId가 선택된 라벨링 영역 셀렉트 박스 삭제
        let labelFormList = $("select[name=label-box-occupantId]");
        for(var tmpLabelForm of labelFormList){
            if(tmpLabelForm.value == occupantId){
                tmpLabelForm.parentElement.parentElement.parentElement.remove();
            }
        }

        //탑승자 정보에 셀렉트 박스 삭제
        let delDiv = document.getElementById(occupantId);
        delDiv.remove();

        //삭제한 occupantId가 포함된 옵션 삭제 로직
        $("select[name=label-box-occupantId] option[value='" + occupantId + "']").remove();
    }
}

//이미지 페이지네이션 버튼 생성
function addPageNationBtn(pageNum){
    //이미지 12345 넘기는 버튼 비우고,
    $('#pageBtnArea').empty();
    var btnStr = "<ul class='pagination' style='margin: 0 0 1px; padding: 0 0;'>";
    for(var i = 0; i < 5; i++){
        if( i < pageNum)
            btnStr += "<li class='page-item'><a class='page-link' style='padding: 2px 8px;' href='javascript:void(0);' onclick='movePage("+i+")';>"+ (i + 1) +"</a></li>";
        else if(i == pageNum){
            btnStr += "<li class='page-item active'><a class='page-link' style='padding: 2px 8px;' href='javascript:void(0);' onclick='movePage("+i+")';>"+ (i + 1) +"</a></li>";
        }else{
            btnStr += "<li class='page-item'><a class='page-link' style='padding: 2px 8px;' href='javascript:void(0);' onclick='movePage("+i+")'; disabled='true'>"+ (i + 1) +"</a></li>";
        }
    }
    btnStr += "</ul>";
    $('#pageBtnArea').append(btnStr);
}

//이미지 페이지네이션 이동 함수
function movePage(pageNum){
    if(checkTaskComplete()) {
        let regionId = currentRegionId;
        showFrames(wavesurfer.regions.list[regionId], pageNum);
        labeler.taskLoading(pageNum);
    }
}

//데이터 기준별로 묶기
function groupBy(data, key){
    return data.reduce(function(carry, el){
        var group = el[key];

        if(carry[group] === undefined){
            carry[group] = [];
        }

        carry[group].push(el);
        return carry;
    }, {})
}

document.getElementById("labelResult").addEventListener('change',chaneLabell)

function chaneLabell() {
    var videoAll = document.querySelectorAll("video")
    for (var i=0; i<videoAll.length; i++){
        if (document.querySelectorAll("video")[i].classList.contains("showClip")){
            var waveIDD = document.querySelectorAll("video")[i].id
            wavesurfer.regions.list[waveIDD].workStatus= '작업중'
        }
    }
    clipStatusSet()
    setsStatusAll(nowSetPage)
}

