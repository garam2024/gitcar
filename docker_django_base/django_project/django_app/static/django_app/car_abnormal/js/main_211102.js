// Create an instance
var wavesurfer;
var indexValue = 0;
var regionInfo = new Map();
let labeler;
let storedBBoxData = new Map();
let currentRegionId;
let occupantNum = 0;
let sensor = new Map();
let jsonData;
let json;
let taskId = 0;
let rejectStatus;

/**작업 저장 */
//작업완료 버튼
function checkWorkComplete(){
    var clips = document.getElementById("clips");
    var totCntClips = clips.getElementsByTagName("video").length;
    var totCntStoredBbox = 0;
    for (let key of storedBBoxData.keys()){
        if(storedBBoxData.get(key).taskComplete){
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


function changeWorkComplete(){
    var param = {
        "group" : group_id

    }
    workCompleteAjax(param)
}

function workCompleteAjax(param){
    $.ajax({
        url : 'task_complete',
        type : 'POST',
        data : JSON.stringify(param),
        success : function (data) {
            alert("success");
            window.location.href = '/mywork_record';
        },error : function(request, status, error){
            alert("code : "+request.status+"\nmessage : "+request.responseText+"\nerror"+error);
        }
    })
}

// 작업저장 버튼 클릭시 json 만들기
 function DataToString() {
    if(checkTaskComplete()){
        document.getElementById("playBtn").disabled = false;
        console.log("DataToString",labeler.bboxData.taskComplete)
        labeler.bboxData.taskComplete = "완료";
        let tmpExportArray=[];
        jsonData = new exportData(labeler.bboxData.startTime, labeler.bboxData.endTime);
        labeler.saveOccupantData();
        labeler.saveClipInfo();
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
        tmpExportArray.push(tmpExportData);
        // json = JSON.stringify(tmpExportArray);
        json = tmpExportArray;
        saveLabeledDataAjax();
        if (checkWorkComplete())
            document.getElementById("workComplete").disabled = false;
    }else{
        alert("탑승자 정보와 라벨링 정보가 일치하지 않습니다.")
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
            alert('success');
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
     let id = labeler.bboxData.startTime
       // let id = labeler.bboxData.startTime + '/' + labeler.bboxData.endTime;
        let data = labeler.bboxData
        storedBBoxData.set(id, data);
    }
}



/**작업 이력 불러오기 */
// 작업 이력이 있는 경우 region 정보 가져오기
function loadRegions(regions) {
    regions.forEach(function (region) {
        rejectStatus = region.reject_status;
        taskId = region.task_id;
        const obj = region.task_data;
        obj.drag = false;
        obj.resize = false;
        obj.color = randomColor(0.25);
        wavesurfer.addRegion(obj);
        createClip(obj)
            .then(sortClip())
            .catch(err => { throw new Error(err) })
        loadTaskHistory(obj, taskId)
        
    });
    removeCanvas();
    if (checkWorkComplete())
            document.getElementById("workComplete").disabled = false;
}


// 작업 이력이 있는 경우 labeler.bboxdata에 값 넣기
function loadTaskHistory(region, taskId){

    labeler = new ImageLabeler(document.getElementById('demo'), videoHeight, videoWidth, taskId);
    let occupantInfo = region.data[0].occupantInfo[0];
    let occupantData = [{
        occupantId : occupantInfo.occupantId,
        occupant : occupantInfo.occupant,
        occupantSex : occupantInfo.occupantSex,
        occupantAgeGroup : getKeyByValue(ageGroupMap, occupantInfo.occupantAgeGroup)
    }]

    labeler.bboxData.occupant = occupantData          

    var startTime = region.start;
    var endTime = region.end;
    var frameList = [];
    // var video = document.querySelector('video#' + region.id);
    var video = document.querySelector('#clips').children[taskId]
    for(var key of region.data[0].clip.labeled){
        // imageInfo, frameList
        var src = orgVideo.src;
        var id = 'video{(' + src + ')' + startTime + '/' + endTime + '}';
        labeler.bringClipInfo(id, startTime, endTime);             

        let currentTime = key.currentTime;
        var dataURL = canvas.toDataURL('image/jpeg');
        frameList.push(new Image(currentTime, dataURL));
        labeler.bringImageData(currentTime);

        labeler.labelNum = 0;

        // labeler.bboxData.labels 값 넣기
        for(var tmpOcpt of key.occupant){
            var bodyBBox = tmpOcpt.bodyBBox
            if(bodyBBox!= undefined || bodyBBox != null){
                labeler.labelNum++;
                var action = "action," + getKeyByValue(actionMap, key.occupant[0].action)


                labeler.putLabel(bodyBBox[0], bodyBBox[1], bodyBBox[2], bodyBBox[3], labeler.labelNum, labeler.labelOption, randomColor(1), key.currentTime, action)
            }

            var faceBBox = tmpOcpt.faceBBox
            if(faceBBox!= undefined || faceBBox != null){
                labeler.labelNum++;
                var emotion = "emotion," + getKeyByValue(emotionMap, key.occupant[0].emotion)
                labeler.putLabel(faceBBox[0], faceBBox[1], faceBBox[2], faceBBox[3], labeler.labelNum, labeler.labelOption, randomColor(1), key.currentTime, emotion)
            }
        }
    }
    labeler.bboxData.taskComplete = '완료';
    regionInfo.set(video.id, frameList);
    putBBoxData();
}

// value로 key 확인
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}




// db에 작업 정보가 있는 경우 bboxdata를 가져와서 storedBBoxData에 값 넣기
function putBBoxData() {
let id = labeler.bboxData.startTime
   // let id = labeler.bboxData.startTime + '/' + labeler.bboxData.endTime;
    let data = labeler.bboxData
    storedBBoxData.set(id, data);
    changeImageStatus();
    taskId++;
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
    constructor(time, dataURL) {
        this.time = time;
        this.dataURL = dataURL;
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

    storeBBoxData();
    if (e.target.nodeName !== 'VIDEO') return
    let region = wavesurfer.regions.list[e.target.id]
    region.play();


    storeRegionID(wavesurfer.regions.list[e.target.id]);
    indexValue = 0;
    document.getElementById("preBtn").disabled = true;
    document.getElementById("nextBtn").disabled = false;
    document.getElementById("playBtn").disabled = true;
    // document.getElementById("exportBtn").disabled = true;
    document.getElementById("saveBtn").disabled = true;


    // 클립 선택 영역 표시
    $('#clips').children('video').removeClass('show');
    $('#'+region.id).addClass('show');


    cinfirmCanvas();
    
    region.once('out', function () {
        id = region.start + '/' + region.end
        occupantNum = 0;
        if (!storedBBoxData.has(id)) {                      
            labeler = new ImageLabeler(document.getElementById('demo'), videoHeight, videoWidth, taskId);            
        }else{
            labeler = new ImageLabeler(document.getElementById('demo'), videoHeight, videoWidth, storedBBoxData.get(id).taskId);
        }
        loadBBoxData(id);
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

//canvas 여부 확인
function cinfirmCanvas() {
    if (document.querySelector('.canvas-container') == null)  return
    removeCanvas();
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
    let clipInfoArea = document.getElementById('clip');
    clipInfoArea;
}

function removeStoredBBox(startTime, endTime){
    let id = startTime + '/' + endTime;
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

// 클립 영역에 클립 생성
async function createClip(region) {
    if (document.getElementById(region.id)) return await (function () {
        updateClip(region)
    })()

    let clips = document.querySelector("#clips");
    let clip = document.createElement('video');
    let clipStatus = document.createElement('div');

    if(region.id === undefined || region.id === null){
        Object.keys(wavesurfer.regions.list).map(id => {
            let region = wavesurfer.regions.list[id]
            region.status = rejectStatus;
            clip.id = region.id;
        })
    }else {
        clip.id = region.id;
    }
    clip.style = 'display:block; margin: 0 auto 4px; width: 200px';
    clip.src = orgVideo.src + '#t=' + region.start + ',' + region.end;
    clip.type = 'video/mpeg';

    clips.appendChild(clip);


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
    let clipStatus = document.createElement('div');

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
            if (array.status == 'Y') {
                clipStatus.className = 'clip-status rejection'
                clipStatus.innerHTML = "<i class='glyphicon glyphicon-remove'></i> 반려";
                clips.appendChild(clipStatus);
            }
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
    var video = document.querySelector('video#' + region.id);
    var canvas = document.querySelector('#canvas');
    var context = canvas.getContext('2d');

    var frameList = [];
    if (regionInfo.has(region.id)) {
        frameList = regionInfo.get(region.id);

        orgVideo.currentTime = frameList[indexNum].time;
        if(labeler.bboxData.images.length == 0){
            var startTime = region.start;
            var endTime = region.end;

            var src = orgVideo.src;
            var id = 'video{(' + src + ')' + startTime + '/' + endTime + '}';
            labeler.bringClipInfo(id, startTime, endTime);
            for (let index = 0; index<frameList.length; index++) {

                let currentTime = startTime + index * (endTime - startTime) / 5;
    
                var dataURL = canvas.toDataURL('image/jpeg');
                labeler.bringImageData(currentTime);
            }
        }
        if (indexNum == 0) {
            labeler.taskLoading(0);
        }

    } else {
        var startTime = region.start;
        var endTime = region.end;

        var src = orgVideo.src;
        var id = 'video{(' + src + ')' + startTime + '/' + endTime + '}';
        labeler.bringClipInfo(id, startTime, endTime);

        for (let index = 0; index < 5; index++) {

            let currentTime = startTime + index * (endTime - startTime) / 5;
            video.currentTime = currentTime;

            context.drawImage(video, 0, 0, 1200, 675);

            var dataURL = canvas.toDataURL('image/jpeg');
            frameList.push(new Image(video.currentTime, dataURL));
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
    let labelCnt = $('.labelform').length;
    var occupantList = $(".occupant_info");
    let occupantCnt = occupantList.length * 2;
    let labeledDataCnt = 0
    let occupant
    for (let i of labeler.bboxData.labels){
        labeledDataCnt += Object.keys(i.labeledData).length != 0 ? 1 : 0;
    }
    if (labelCnt == occupantCnt) {
        return true;
    } else {
        return false;
    }
}

// next 버튼 클릭
function ClickNextBtn() {
    if(checkTaskComplete()){
        let regionId = currentRegionId;
        var preBtn = document.getElementById("preBtn");
        var nextBtn = document.getElementById("nextBtn");
        var saveBtn = document.getElementById("saveBtn");
        if (indexValue == 0)
            preBtn.disabled = false;
        indexValue += 1;

        if (indexValue <= 4) {
            showFrames(wavesurfer.regions.list[regionId], indexValue);
            labeler.taskLoading(indexValue);
            if (indexValue == 4) {
                nextBtn.disabled = true;
                saveBtn.disabled = false;
                
            } else {
                nextBtn.disabled = false;
            }
        }
    }else{
        alert('작업이 완료되지 않았습니다.');
    }
}


// pre 버튼 클릭
function ClickPreBtn() {
    let regionId = currentRegionId;

    var preBtn = document.getElementById("preBtn");
    var nextBtn = document.getElementById("nextBtn");
    var saveBtn = document.getElementById("saveBtn");
    // var exportBtn = document.getElementById("exportBtn");

    if (indexValue == 4)
        nextBtn.disabled = false;
    saveBtn.disabled = true;
    // exportBtn.disabled = true;
    indexValue -= 1;

    if (indexValue >= 0) {
        showFrames(wavesurfer.regions.list[regionId], indexValue);
        labeler.taskLoading(indexValue);
        if (indexValue == 0) {
            preBtn.disabled = true;
        } else {
            preBtn.disabled = false;
        }
    }
}


// region 중복 구간 확인 
function regionOver(region) {
    let regionId = region.id;
    let startList = [];
    let endList = [];

    for (var key in wavesurfer.regions.list) {
        startList.push(wavesurfer.regions.list[key].start);
        endList.push(wavesurfer.regions.list[key].end);
    }
    startList = startList.sort(function (a, b) {
        return a - b;
    });;
    endList = endList.sort(function (a, b) {
        return a - b;
    });;
    let currntNum = startList.findIndex((e) => e === region.start);
    let backRegionEnd = endList[currntNum - 1];
    let nextRegionStart = startList[currntNum + 1];

    if (region.end > nextRegionStart || region.start < backRegionEnd) {
        if(wavesurfer.regions.list[regionId]){
            wavesurfer.regions.list[regionId].remove();
        }
        alert('구간설정 중복은 불가능 합니다.')
        const clips = document.querySelector('#clips')
        const regionEl = clips.querySelector(`#${regionId}`)
        if(regionEl){
            regionEl.remove()
        }
    }
}

// region 삭제 버튼 클릭 
function ClickRemoveBtn() {
    let regionId = currentRegionId;
    let clipId = document.getElementById(regionId);
    removeTaskId = labeler.bboxData.taskId;

    let param = {};
    let changeTaskIdList = [];
    if (regionId) {
        let num = labeler.imageInfo.maxLabelNum > labeler.labelNum ? labeler.imageInfo.maxLabelNum : labeler.labelNum;
        for(let key of storedBBoxData.keys()){
            if(storedBBoxData.get(key).taskComplete){
                if(storedBBoxData.get(key).taskId > labeler.bboxData.taskId){
                    changeTaskIdList.push(storedBBoxData.get(key).taskId);
                }
            }
        }
        param = {
            'task_id' : labeler.bboxData.taskId,
            'start' : labeler.bboxData.startTime,
            'end' : labeler.bboxData.endTime,
            'chgTaskIdList' : changeTaskIdList
        }
        removeStoredBBox(labeler.bboxData.startTime, labeler.bboxData.endTime);
        removeLabelRegion();
        // removeSensor();
        removeRegion(regionId);
        removeClipInfo();
        clipId.remove();
        cinfirmCanvas();
        removeBBox();

        document.getElementById("playBtn").disabled = false;
        document.getElementById("nextBtn").disabled = true;
        for(let key of storedBBoxData.keys()){
            if (storedBBoxData.get(key).taskId > removeTaskId){
                var tmpId = storedBBoxData.get(key).taskId;
                tmpId --;
                storedBBoxData.get(key).taskId = tmpId;
            }
        }
        taskId --;
    }
    $.ajax({
        url : 'task_region_delete',
        type : 'POST',
        data : JSON.stringify((param)),
        success : function(data){
            alert('success');
            if (checkWorkComplete())
                document.getElementById("workComplete").disabled = false;
        },
        error : function(request, status, error){
            alert("code : "+request.status+"\nmessage : "+request.responseText+"\nerror"+error);
        }
    })
};

// window.GLOBAL_ACTIONS['export'] = function () {
//     let dataStr = json;
//     let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

//     let exportFileDefaultName = 'result_annotation.json';

//     let linkElement = document.createElement('a');
//     linkElement.setAttribute('href', dataUri);
//     linkElement.setAttribute('download', exportFileDefaultName);
//     linkElement.click();
    
// };



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
            str += "<div id='" + occupantId + "' class='occupant_info' style='margin-top:8px;'>";
            str += "<div id='occupantId'>"
            str += "<div><strong>" + occupantId + "</strong></div>";
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
    plus += "<div><button id='plusPerson' onclick ='addOccupantInfo()'><i class='glyphicon glyphicon-plus'></i></button></div>";

    var str = "";
    str += "<div id='occupant" + occupantNum + "' class='occupant_info' style='margin-top:8px;'>";
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
    }
}

//클립인포 정보가 있는 경우 클립 인포 정보 불러오기
function loadClipInfo(){
    $("#clipArea").empty();
    if(Object.keys(labeler.bboxData.clipInfo).length != 0){
        var categoryName = labeler.bboxData.clipInfo.categoryName;
        var tmpStr = "";
        tmpStr += "<div id='clip' class='clip_info' style='margin-top:8px;'>"
        tmpStr += "<div style='margin-bottom: 4px;'><strong>이상행동 정보</strong></div>"
        tmpStr += "<div id='clipInfo'>";
        tmpStr += "<div style='display: flex; align-items: center;'><select id='clip_select' onchange='changeActionLabelBox()'>";
        tmpStr += "<option value='' >이상행동 선택</option>";
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
    tmpStr += "<div id='clip' class='clip_info' style='margin-top:8px;'>"
    tmpStr += "<div style='margin-bottom: 4px;'><strong>이상행동 정보</strong></div>"
    tmpStr += "<div id='clipInfo'>";
    tmpStr += "<div style='display: flex; align-items: center;'><select id='clip_select' onchange='changeActionLabelBox()'>";
    tmpStr += "<option value='' >이상행동 선택</option>";
    for (var key in abnormalMap){
        tmpStr += "<option value='" + key + "'>" + abnormalMap[key] + "</option>";
    }
    tmpStr += "</select>";
    tmpStr += "</div>";
    tmpStr += "</div>";
    $("#clipArea").append(tmpStr);
}

//클립포즈 셀렉트 변경시 액션 라벨링 박스 선택지 변경
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
    let occupantId = 'occupant' + num;
    let labelCnt = labeler.labelNum;
    for (var i = 1; i <= labelCnt; i++) {
        let selectOption = $("#label-box-occupantId" + i + " option:selected").val();
        if (selectOption == occupantId) {
            let labelid = "label" + i;
            for (k = 0; k < labeler.canvas.getObjects().length; k++) {
                if (labelid == labeler.canvas.getObjects()[k].id) {
                    labeler.removeLabel(labeler.canvas.getObjects()[k]);
                }
            }

        }
    }


    let delDiv = document.getElementById(occupantId);
    delDiv.remove();

    if (sensor.has(occupantId)) {
        sensor.delete(occupantId);
    }
    $("select[name=label-box-occupantId] option[value='" + occupantId + "']").remove();
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