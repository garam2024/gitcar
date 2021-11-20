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
/**
 * Save annotations to localStorage.
 */
 function DataToString() {
    if(checkTaskComplete()){
        document.getElementById("playBtn").disabled = false;
        let tmpExportArray=[];
        jsonData = new exportData(labeler.bboxData.startTime, labeler.bboxData.endTime);
        labeler.saveOccupantData();   
        storeBBoxData();
        changeImageStatus();
        jsonData.saveMetaData(videoName);
        jsonData.saveOccupantData();
        // jsonData.saveSensorData();
        jsonData.saveLabeledData(labeler.bboxData.labels, ratioVideo);
        let tmpExportData = {
            metadata : jsonData.metaData,
            occupantInfo : jsonData.occupant,
            clip : jsonData.clip
        };
        tmpExportArray.push(tmpExportData);
        // json = JSON.stringify(tmpExportArray);
        json = tmpExportArray;
        saveLabeledDataAjax();
    }else{
        alert("작업이 완료되지 않았습니다.")
    }
}

function saveLabeledDataAjax(){
    let start_time = labeler.bboxData.startTime;
    let end_time = labeler.bboxData.endTime;
    let task_id = labeler.bboxData.taskId;

    let param = {
        'start' : start_time,
        'end' : end_time,
        'attributes' : task_id,
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

function changeImageStatus() {
    for (var i = 0; i < labeler.bboxData.images.length; i++) {
        labeler.bboxData.images[i].status = true;
    }
}

// 210913 revise
function storeBBoxData() {
    let id = labeler.bboxData.startTime //+ '/' + labeler.bboxData.endTime;
    let data = labeler.bboxData
    storedBBoxData.set(id, data);

/**
 * Load regions from localStorage.
 */
 function loadRegions(regions) {
    regions.forEach(function (region) {
        region.drag = false;
        region.resize = false;
        region.color = randomColor(0.25);
        wavesurfer.addRegion(region);
    });
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

/**
 * Random RGBA color.
 */
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
        occupantNum = 0;
        labeler = new ImageLabeler(document.getElementById('demo'), videoHeight, videoWidth, taskId);
        loadBBoxData(region.start + '/' + region.end);
        loadOccupantInfo();
        showFrames(wavesurfer.regions.list[this.id], 0);
    });



    document.getElementById("playBtn").onclick = function () {
        cinfirmCanvas();
        removeBBox();
        removeLabelRegion();
        
    }
})


//canvas 확인
function cinfirmCanvas() {
    if (document.querySelector('.canvas-container') == null)  return
    removeCanvas();
}

//canvas 삭제
function removeCanvas(){
    let canvasArea = document.getElementById('canvas-area');
    let tmpCanvas = document.getElementById('c');
    tmpCanvas.style.position = 'relative';
    canvasArea.appendChild(tmpCanvas);
    $("div.canvas-container").remove();
}

//bbox 삭제
function removeBBox(){
    var objects = labeler.canvas.getObjects();
    for (var i = 0; i < objects.length; i++) {
        labeler.canvas.remove(objects[i]);
    }
    delete labeler.bboxData;
}

//라벨링 영역 삭제
function removeLabelRegion(){  
    if(labeler === undefined) return
    for (var k = 0; k < labeler.labelNum; k++) {
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


async function createClip(region) {
    if (document.getElementById(region.id)) return await (function () {
        updateClip(region)
    })()

    let clips = document.querySelector("#clips");
    let clip = document.createElement('video');

    clip.id = region.id;
    clip.style = 'display:block; margin: 0 auto 4px; width: 200px';
    clip.src = orgVideo.src + '#t=' + region.start + ',' + region.end;
    clip.type = 'video/mpeg';

    clips.appendChild(clip);
}

function updateClip(region) {
    let clip = document.getElementById(region.id)
    clip.src = orgVideo.src + '#t=' + region.start + ',' + region.end;
}

function sortClip() {
    let array = []
    let clips = document.querySelector("#clips")

    Object.keys(wavesurfer.regions.list).map(id => {
        let region = wavesurfer.regions.list[id]
        array.push({ id: id, start: region.start })
    })

    array.sort((a, b) => {
        if (a.start > b.start) return 1
        if (a.start < b.start) return -1
        return 0
    })

    array.map(array => {
        let region = document.getElementById(array.id)
        if(region != null)  clips.append(region)  // if not use "if(region != null)" -> null will be shown on clips
    })
}


function loadBBoxData(id) { 
    if (storedBBoxData.has(id)) {
        let bboxData = storedBBoxData.get(id);
        labeler.bboxData = bboxData;
    }else{
        taskId++; 
    }
}

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

function checkTaskComplete() {
    let label = labeler.bboxData.labels;
    let currentImage = labeler.imageInfo.id;
    let labelCnt = 0;
    let labeledCnt = 0;
    label.find(_find);
    var occupantList = $(".occupant_info");
    let occupantCnt = occupantList.length * 2;
    if (labelCnt == occupantCnt && labeledCnt == occupantCnt) {
        return true;
    } else {
        return false;
    }
    function _find(array) {
        if (array.associatedImage === currentImage) {
            labelCnt++;
            if (Object.keys(array.labeledData).length != 0)
                labeledCnt++;
        }
    }
}

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

/**
 * Bind controls.
 */
function ClickRemoveBtn() {
    let regionId = currentRegionId;
    let clipId = document.getElementById(regionId);

    if (regionId) {
        let num = labeler.imageInfo.maxLabelNum > labeler.labelNum ? labeler.imageInfo.maxLabelNum : labeler.labelNum;
        
        removeLabelRegion();
        removeSensor();
        removeRegion(regionId);
        clipId.remove();
        cinfirmCanvas();
        removeBBox();

        document.getElementById("playBtn").disabled = false;
        document.getElementById("nextBtn").disabled = true;
    }
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
            str += "<div><button id='minusPerson' class='btn btn-danger btn-xs' onclick ='deleteOccupantInfo(" + occptNum + ")'><i class='glyphicon glyphicon-minus'></i></button></div></div>";
            str += "<div id='occupantInfo'>";
            str += "<div><select id='occupant_select'>";
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

function addOccupantInfo(){
    occupantNum++;
    var plus = "";
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
    str += "<button id='minusPerson' style='margin-left: auto;' class='btn btn-danger btn-xs' onclick ='deleteOccupantInfo(" + occupantNum + ")'><i class='glyphicon glyphicon-minus'></i></button></div>";
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

    var occupantList = $(".occupant_info");
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