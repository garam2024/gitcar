class exportData{
    constructor(startTime, endTime){
        this.id = startTime + '/' + endTime;
        this.metaData = {
            description : "",
            videoId : "",
            creator : "",
            distributor : "",
            date : ""
        }
        this.sceneInfo = {
            sceneId : "",
            categoryId : "",
            categoryName : ""
        }
        this.occupantInfo = [];
        this.sceneData = {
            start : startTime,
            end : endTime,
            sensor : [],
            labeled : []
        };
        this.labeledData = {
            currentTime : '',
            occupant:[],
            gSensor:{
                x : 0,
                y : 0,
                z : 0
            }
        }
    }

    saveMetaData(videoId, description, creator, distributor){
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        let date = now.getDate();
        month = month >= 10 ? month : "0" + month;
        date = date >= 10 ? date : "0" + date;

        this.metaData.description = description ? description : "abnormal monitoring data";
        this.metaData.videoId = videoId;
        this.metaData.creator = creator ? creator : "광주인공지능센터";
        this.metaData.distributor = distributor ? distributor : "광주인공지능센터";
        this.metaData.date = year + month + date;
    }

    saveOccupantData(){
        let occupantList = $(".occupant_info");
        for(var i = 0; i < occupantList.length; i++){
            let occupantId = occupantList[i].id;
            let occupantPosition = $("#" + occupantId + "  #occupant_select").val();
            let occupantSex = $("#" + occupantId + "  #occupant_sex").val();
            let occupantAgeGroup = $("#" + occupantId + "  #occupant_age").val();
            
            let occupantData = {
                occupantId : occupantId,
                occupantPosition: occupantPosition,
                occupantSex : occupantSex,
                occupantAgeGroup : ageGroupMap[occupantAgeGroup]
            }

            this.occupantInfo.push(occupantData);
        }
    }

    saveSceneInfo(sceneId, categoryId){
        let categoryName = $("#clip_select").val();
        this.sceneInfo.sceneId = sceneId ? sceneId : "";
        this.sceneInfo.categoryId = categoryId ? categoryId : "abnormal";
        this.sceneInfo.categoryName = abnormalMap[categoryName];
    }


    // saveClipData(region){
    //     this.clip.start = region.start;
    //     this.clip.end = region.end;
    // }

    // saveSensorData(){
    //     let occupantList = $(".occupant_info");
    //     if(sensor.size != 0 && sensor.size == occupantList.length){
    //         for(var i = 0; i < occupantList.length; i++){
    //             let occupantId = occupantList[i].id;
    //             let sensorInfo= sensor.get(occupantId);
    //             let ECG =sensorInfo.get("ECG");
    //             let EEG1 =sensorInfo.get("EEG1");
    //             let EEG2 =sensorInfo.get("EEG2");
    //             let PPG =sensorInfo.get("PPG");
    //             let sensorData = {
    //                 occupantId : occupantId,
    //                 ECG : ECG,
    //                 EEG : [EEG1, EEG2],
    //                 PPG : PPG
    //             }
    //             this.clip.sensor.push(sensorData);
    //         }
    //     }else{
    //         alert("센서데이터를 업로드해주세요!");
    //     }
    // }

    saveLabeledData(data, ratioVideo){
        let groupByCrrtTime = groupBy(data, 'currentTime');
        let labeled=[];
        let categoryName = labeler.bboxData.clipInfo.categoryName;
        Object.keys(groupByCrrtTime).map(function(id){
            let tmpData = [];
            for(var i = 0; i < groupByCrrtTime[id].length; i++){
                let left = groupByCrrtTime[id][i].left*ratioVideo;
                let top = groupByCrrtTime[id][i].top*ratioVideo;
                let width = groupByCrrtTime[id][i].width*ratioVideo;
                let height = groupByCrrtTime[id][i].height*ratioVideo;
                let associatedImage = groupByCrrtTime[id][i].associatedImage;
                let occupantId = groupByCrrtTime[id][i].labeledData.occupantId;
                let dataKinds = groupByCrrtTime[id][i].labeledData.dataKinds;
                let dataValue = groupByCrrtTime[id][i].labeledData.dataValue;
                let data={
                    occupantId : occupantId,
                    bboxArea : [left, top, width, height],
                    associatedImage : associatedImage,
                    dataKinds : dataKinds,
                    dataValue : dataValue
                };
                tmpData.push(data);
            }

            let groupByOccptId = groupBy(tmpData, 'occupantId');
            let emotionArea;
            let actionArea;
            let emotionValue;
            let actionValue;
            let occptData=[];
            Object.keys(groupByOccptId).map(function(key){
                for(var j = 0; j < groupByOccptId[key].length; j++){
                    if(groupByOccptId[key][j].dataKinds === "emotion"){
                        emotionArea = groupByOccptId[key][j].bboxArea;
                        emotionValue = groupByOccptId[key][j].dataValue;
                    }else if(groupByOccptId[key][j].dataKinds === "action"){
                        actionArea = groupByOccptId[key][j].bboxArea;
                        actionValue = groupByOccptId[key][j].dataValue;
                    }
                }
                let tmpOccptData = {
                    occupantId : key,
                    bodyBBox : actionArea,
                    faceBBox : emotionArea,
                    action : actionMap[categoryName][actionValue],
                    emotion : emotionMap[emotionValue]
                }
                occptData.push(tmpOccptData);
            })
            let tmpLabled={
                currentTime : id,
                imgName : "",
                occupant : occptData,
                gSensor : {
                    x : 0,
                    y : 0,
                    z : 0
                }
            }
            labeled.push(tmpLabled);
        })
        this.sceneData.labeled = labeled;
    }
}