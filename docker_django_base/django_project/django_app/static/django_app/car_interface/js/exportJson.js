function exportJson(){
    //saveSkeleton();
    let dataStr;
    let dataJson;
    let exportFileDefaultName;

    if (_mode == '검수') {
        dataStr = '{"metadata" : {"description":"interface data", "video_id" :"';
        dataStr += getFileName(orgVideo.getAttribute('alt')) + '", "creator" : "광주인공지능센터" , "distributor" : "광주인공지능센터", ';
        dataStr += '"date":"' + getCurrentDate() + '"},';
        dataStr += '"occupant_info" : { "ocupant_id":"WK00001","ocuupant_name":"WK00001","occupant_age":"30대", "occupant_sex":"F","occupant_position":"front"},';
        dataStr += '"clip":[' + localStorage.regions;
        dataStr += "]}";
        exportFileDefaultName = getFileName(orgVideo.getAttribute('alt')) + '.json';

        let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    } else {
        // 전체 클립을 하나의 JSON 파일 export 코드 START
        // dataStr = localStorage.regions;
        // exportFileDefaultName = "work_" + getFileName(orgVideo.getAttribute('alt')) + '.json';
        // let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        // let linkElement = document.createElement('a');
        // linkElement.setAttribute('href', dataUri);
        // linkElement.setAttribute('download', exportFileDefaultName);
        // linkElement.click();
        // 전체 export 코드 END




        // 전체 클립을 여러 JSON으로 압축하여 export 코드 START
        // dataStr = localStorage.regions;
        // dataJson = JSON.parse(dataStr);
        
        // let dataJsonLen = Object.keys(dataJson).length;
        // var zip = new JSZip();
        // var jsonElm, strElm;
        // for(var i=0; i<dataJsonLen; i++){
        //     jsonElm = dataJson[i];
        //     strElm = JSON.stringify(jsonElm);
        //     zip.file("work_" + getFileName(orgVideo.getAttribute('alt')) + "_" + (i+1) + '.json', strElm)
        // }

        // zip.generateAsync({type:"blob"})
        //     .then(function(blob)
        //     {
        //         saveAs(blob, "work_" + getFileName(orgVideo.getAttribute('alt')) +".zip");
        //     });
        // 전체 클립을 여러 JSON으로 압축하여 export 코드 END




        // 더블클릭하여 선택한 clip만 export 코드 START
        let form = document.forms.edit;
        let regionId = form.dataset.region;
        let regionStart = clipInfo.get(regionId)[0].time;

        dataStr = localStorage.regions;
        dataJson = JSON.parse(dataStr);
        var jsonIdx;
        for(var m=0; m<dataJson.length; m++){
            if(dataJson[m].start == regionStart){
                jsonIdx = m;
                break;
            }
        }
        dataStr = JSON.stringify(dataJson[jsonIdx]);
        
        var clipNum = nowSet[0] * 5 + nowClip[0] + 1;
        exportFileDefaultName = fillZero(3, clipNum) + "_work_" + getFileName(orgVideo.getAttribute('alt')) + '.json';
        let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        // 더블클릭하여 선택한 clip만 export 코드 END
    }


    workedFrames = [];
    
};

function fillZero(width, num){
    var str = String(num);
    return str.length >= width ? str:new Array(width-str.length+1).join('0')+str;//남는 길이만큼 0으로 채움
}

function getFileName(filePath) {
    var index = filePath.lastIndexOf('.')
    return filePath.substring(0, index);
}

function getCurrentDate() {

    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let date = now.getDate();
    month = month >= 10 ? month : "0" + month;
    date = date >= 10 ? date : "0" + date;
    return year + month + date;
}
