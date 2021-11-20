let occupantMap = {front:"운전자", back: "승객"};
let dataMap = {emotion:'감정', action:'이상행동'};
let emotionMap = { e1:'기쁨', e2:'분노', e3:'놀람', e4:'슬픔', e5:'중립'};
let abnormalMap = { a1:'졸음운전', a2:'음주운전', a3:'물건찾기', a4:'통화', a5:'휴대폰조작',a6:'차량제어',a7:'운전자폭행' }
let actionMap = {
    a1:{ sa01:'하품',sa02:'고개숙이다/흔들다',sa03:'박수치다',sa04:'뺨을 때리다',sa05:'목을 만지다',sa06:'어깨를 두드리다',sa34:'무언가를 쥐다', sa35: '무언가를 보다', sa36:'운전하다'},
    a2:{ sa07:'불안정한 동작',sa08:'핸들을 흔들다',sa09:'무언가를 마시다',sa10:'창문을 열다',sa37:'무언가를 쥐다', sa38: '무언가를 보다', sa39:'운전하다'},
    a3:{ sa11:'몸을 돌리다',sa12:'손을 뻗다',sa13:'허리 굽히다',sa14:'줍다', sa40: '무언가를 보다', sa41:'운전하다' },
    a4:{ sa15:'손을 뻗다',sa16:'고개를 돌리다',sa17:'옆으로 기대다',sa18:'무언가를 손에 쥐다',sa19:'말하다', sa42: '무언가를 보다', sa43:'운전하다'},
    a5:{ sa20:'손을 뻗다',sa21:'고개를 돌리다',sa22:'무언가를 손에 쥐다',sa23:'힐끗 거리다',sa44:'운전하다' },
    a6:{ sa24:'손을 뻗다',sa25:'고개를 돌리다',sa26:'힐끗 거리다',sa27:'기기사용',sa45:'무언가를 쥐다', sa46:'운전하다'},
    a7:{ sa28:'손을 뻗다',sa29:'발을 올리다',sa30:'일어서다',sa31:'휘두르다',sa32:'말하다',sa33:'하차하다',sa47:'무언가를 쥐다', sa48: '무언가를 보다', sa49:'운전하다'}
};
let genderMap = {male:'남성', female:'여성'};
let ageGroupMap = {age1:'20대~30대', age2:'40대~50대', age3:'60대이상'};

class ImageLabeler {
    constructor(mountElm, videoHeight, videoWidth, taskId) {
        this.mountElm = mountElm;
        this.canvas = new fabric.Canvas("c", {
            width: videoWidth,
            height: videoHeight
        });
        this.labelNum = 0;
        this.imageNum = 0;
        this.bboxData = {
            id : '',
            taskId : taskId,
            startTime : '',
            endTime : '',
            width : '',
            height :'',
            scaleX : '',
            scaleY : '',
            images : [],
            labels : [],
            occupant : [],
            clipInfo : {},
            taskComplete : ''
        };

        this.imageInfo = {};

        this.labelOption = {
            strokeColor: randomColor(1),
            fill: 'transparent',
            labelFontFamilly: 'Helvetica Neue',
            labelFontSize: 16,
            labelFontColor: 'white',
            labelFill: '#E71D36',
            labelId: 'label'
        };

        this.mountElmRO = new ResizeObserver(this.resize.bind(this));
        this.mountElmRO.observe(mountElm);
        this._registerCanvasEvents();
    }

    clearCanvas() {
        this.canvas.discardActiveObject();
        var sel = new fabric.ActiveSelection( this.canvas.getObjects(), {
            canvas:  this.canvas,
        });
         this.canvas.setActiveObject(sel);
         this.canvas.requestRenderAll();

         this.canvas.getActiveObjects().forEach((obj) => {
             this.canvas.remove(obj)
        });
         this.canvas.discardActiveObject().renderAll()
    }

    // 작업이력이 있는 경우 bboxData 생성(작업)
    putLabel(startX, startY, endX, endY, labelNum, labelOption, color, currentTime, labeledData, associatedImage) {


        let left = startX/ratioVideo;
        let top = startY/ratioVideo;
        let width = endX/ratioVideo;
        let height = endY/ratioVideo;
        let canvas = this.canvas;
        let maxLabelNum = this.imageInfo.maxLabelNum;
        let num = maxLabelNum + 1 > labelNum ? maxLabelNum + 1 : labelNum;
        let id = labelOption.labelId + num;

        let text = new fabric.IText('label' + num, {
            fontFamily: labelOption.labelFontFamilly,
            left: left + 1,
            top: top + 1,
            fill: 'white',
            fontSize: labelOption.labelFontSize,
            backgroundColor: color ? color : labelOption.strokeColor,
            opacity: 0.5,
        });
        let rect = new fabric.Rect({
            labelId: id,
            left: left,
            top: top,
            originX: 'left',
            originY: 'top',
            width: width,
            height: height,
            hasRotatingPoint: false,
            stroke: color ? color : labelOption.strokeColor,
            strokeWidth: 2,
            fill: 'rgba(0,0,0,0)',
            cornerSize: 12,
            cornerStyle: 'circle',
            cornerColor: color ? color : labelOption.strokeColor,
            borderColor: color ? color : labelOption.strokeColor,
            associatedImage: associatedImage? associatedImage : this.imageInfo.id,
            transparentCorners: false
        });

        let group = new fabric.Group([rect, text], {
            transparentCorners: false,
            lockRotation: true,
            left: left,
            top: top,
            angle: 0,
            cornerSize: 12,
            cornerStyle: 'circle',
            cornerColor: color ? color : labelOption.strokeColor,
            borderColor: color ? color : labelOption.strokeColor,
            hasRotatingPoint: false,
            associatedImage: associatedImage? associatedImage : this.imageInfo.id,
            currentTime : currentTime? currentTime : this.imageInfo.currentTime,
            id: id,
            labeledData: labeledData
        });
        group.on('modified', event => {
            this._adjustRectSizePosition(group);
        });
        this.bboxData.labels.push(group);
        this.imageInfo.maxLabelNum ++;

        return group;
    }

    // 이전작업 불러오기기능
    loadPreLabel(left, top, width, height, labelNum, labelOption, color, currentTime, labeledData, associatedImage) {

        let canvas = this.canvas;
        let maxLabelNum = this.imageInfo.maxLabelNum;
        let num = maxLabelNum + 1 > labelNum ? maxLabelNum + 1 : labelNum;
        let id = labelOption.labelId + num;

        let text = new fabric.IText('label' + num, {
            fontFamily: labelOption.labelFontFamilly,
            left: left + 1,
            top: top + 1,
            fill: 'white',
            fontSize: labelOption.labelFontSize,
            backgroundColor: color ? color : labelOption.strokeColor,
            opacity: 0.5,
        });

        let rect = new fabric.Rect({
            labelId: id,
            left: left,
            top: top,
            originX: 'left',
            originY: 'top',
            width: width,
            height: height,
            hasRotatingPoint: false,
            stroke: color ? color : labelOption.strokeColor,
            strokeWidth: 2,
            fill: 'rgba(0,0,0,0)',
            cornerSize: 12,
            cornerStyle: 'circle',
            cornerColor: color ? color : labelOption.strokeColor,
            borderColor: color ? color : labelOption.strokeColor,
            associatedImage: associatedImage? associatedImage : this.imageInfo.id,
            transparentCorners: false
        });

        let group = new fabric.Group([rect, text], {
            transparentCorners: false,
            lockRotation: true,
            left: left,
            top: top,
            angle: 0,
            cornerSize: 12,
            cornerStyle: 'circle',
            cornerColor: color ? color : labelOption.strokeColor,
            borderColor: color ? color : labelOption.strokeColor,
            hasRotatingPoint: false,
            associatedImage: associatedImage? associatedImage : this.imageInfo.id,
            currentTime : currentTime? currentTime : this.imageInfo.currentTime,
            id: id,
            labeledData: labeledData
        });

        group.on('modified', event => {
            this._adjustRectSizePosition(group);
        });

        canvas.add(group);
        this.bboxData.labels.push(group);
        this.imageInfo.maxLabelNum ++;

        return group;
    }

    resize(entries, observer) {
        this._drawImage(this.image);
    }

    loadImage(src) {
        let canvas = this.canvas;
        fabric.Image.fromURL(src, img => {
            this.image = img;
            this._drawImage(img);
        });
    }

    // 캔버스 이벤트
    _registerCanvasEvents() {
        let canvas = this.canvas;

        canvas.on('custom:keydom', event => {
            if(event.key == 'Delete'){
                this.removeLabel(canvas.getActiveObject());

            }
        });
        // make mountElm focusable, so that keydown event can be triggered.
        this.mountElm.tabIndex = 1;
        this.mountElm.addEventListener('keydown', e => {
            canvas.fire('custom:keydom', e);
        });

        canvas.on('mouse:down', event => {
            if (!event.target) {
                this.mouseStart = event;
                // disable all labels selection
            } else {
                this.mouseStart = null;
            }
        });

        canvas.on('mouse:up', event => {
            // enable all labels selection

            this.bboxData.labels.forEach(label => label.selectable = true);
            if (!this.mouseStart) {
                return;
            }

            if (this.mouseStart.e.layerX === event.e.layerX
                && this.mouseStart.e.layerY === event.e.layerY) {
                return;
            }

            this.labelNum++;
            var occupantList = $(".occupant_info");
            var labelCnt = 0;
            for(var i of this.bboxData.labels){
                if (i.associatedImage == this.imageInfo.id)
                    labelCnt++;
            }
            if (labelCnt >= occupantList.length*2){
                alert("라벨 갯수가 너무 많습니다.")
                return
            }
            var endX = event.e.layerX >= videoWidth? videoWidth : event.e.layerX;
            var endY = event.e.layerY >= videoHeight ? videoHeight : event.e.layerY;
            let rect = this.addLabel(
                this.mouseStart.e.layerX,
                this.mouseStart.e.layerY,
                endX,
                endY,
                this.labelNum,
                this.labelOption,
                randomColor(1)
            );

            canvas.setActiveObject(rect);
        })
    }

    _drawImage(image) {
        if (!image) {
            return;
        }

        let maxSize = this._getMountElmInnerSize();
        let scaledSize = this._getScaleImageInfo(
            image.width, image.height,
            maxSize.width, maxSize.height
        );

        let canvas = this.canvas;
        canvas.setWidth(scaledSize.width);
        canvas.setHeight(scaledSize.height);
        canvas.calcOffset();
        canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / image.width,
            scaleY: canvas.height / image.height
        });
    }

    // 박스 생성
    addLabel(startX, startY, endX, endY, labelNum, labelOption, color, associatedImage, currentTime) {
        let left = Math.min(startX, endX);
        let top = Math.min(startY, endY);
        let width = Math.abs(endX - startX);
        let height = Math.abs(endY - startY);
        let canvas = this.canvas;
        let maxLabelNum = this.imageInfo.maxLabelNum;
        let num = maxLabelNum + 1 > labelNum ? maxLabelNum + 1 : labelNum;
        let id = labelOption.labelId + num;

        let text = new fabric.IText('label' + num, {
            fontFamily: labelOption.labelFontFamilly,
            left: left + 1,
            top: top + 1,
            fill: 'white',
            fontSize: labelOption.labelFontSize,
            backgroundColor: color ? color : labelOption.strokeColor,
            opacity: 0.5,
        });

        let rect = new fabric.Rect({
            labelId: id,
            left: left,
            top: top,
            originX: 'left',
            originY: 'top',
            width: width,
            height: height,
            hasRotatingPoint: false,
            stroke: color ? color : labelOption.strokeColor,
            strokeWidth: 2,
            fill: 'rgba(0,0,0,0)',
            cornerSize: 12,
            cornerStyle: 'circle',
            cornerColor: color ? color : labelOption.strokeColor,
            borderColor: color ? color : labelOption.strokeColor,
            associatedImage: associatedImage? associatedImage : this.imageInfo.id,
            transparentCorners: false
        });

        let group = new fabric.Group([rect, text], {
            transparentCorners: false,
            lockRotation: true,
            left: left,
            top: top,
            angle: 0,
            cornerSize: 12,
            cornerStyle: 'circle',
            cornerColor: color ? color : labelOption.strokeColor,
            borderColor: color ? color : labelOption.strokeColor,
            hasRotatingPoint: false,
            associatedImage: associatedImage? associatedImage : this.imageInfo.id,
            currentTime : currentTime? currentTime : this.imageInfo.currentTime,
            id: id,
            labeledData:{}
        });

        group.on('modified', event => {
            this._adjustRectSizePosition(group);
        });

        canvas.add(group);
        this.bboxData.labels.push(group);
        this.addLabelform(num);
        this.imageInfo.maxLabelNum ++;

        return group;
    }

    addLabelUpdate(Object) {
        let labelOption = this.labelOption;

        Object._object[0].set({
            stroke: labelOption.strokeColor
        });

        Object._object[1].set({
            backgroundColor: labelOption.strokeColor,
        });
        this.canvas.renderAll();
    }

    getLabels() {
        let scale = this.canvas.width / this.image.width;

        return this.bboxData.labels.map(label => {
            let xmin = label.left * scale;
            let ymin = label.top * scale;
            let xmax = xmin + label.width * scale;
            let ymax = ymin + label.height * scale;

            return {
                xmin: xmin,
                ymin: ymin,
                xmax: xmax,
                ymax: ymax,
                width: this.image.width,
                height: this.image.height
            }
        });
    }

    removeLabel(label) {
        if (!label)
            return;

            var num = label.id.substr(label.id.length - 1, 1);
            this.removeLabelform(num);
            let delLabel = this.bboxData.labels.find(_find);
            let delLabelIndex = this.bboxData.labels.indexOf(delLabel);
            if(delLabelIndex>-1){
                this.bboxData.labels.splice(delLabelIndex, 1);
            }
            this.canvas.remove(label);

            function _find(array){
                if(array.id === label.id){
                    if(array.associatedImage === label.associatedImage)
                        return true;
                }
            }

    }

    _adjustRectSizePosition(object) {
        const minSize = 25;

        let width = object.width * object.scaleX;
        let height = object.height * object.scaleY;
        let left = object.left;
        let top = object.top;
        let canvas = this.canvas;

        // start x is out of right edge
        if (left >= canvas.width - minSize) {
            left = canvas.width - minSize;
        }
        // start y is out of bottom edge
        if (top >= canvas.height - minSize) {
            top = canvas.height - minSize;
        }
        // end x is out of right edge
        if ((left + width) > canvas.width) {
            width = canvas.width - left;
        }
        // end y is out of bottom edge;
        if ((top + height) > canvas.height) {
            height = canvas.height - top;
        }
        // start x is out of left edge
        if (left < 0) {
            width += left;
            left = 0;
        }
        // start y is out of top edge
        if (top < 0) {
            height += top;
            top = 0;
        }
        // end x is out of left edge
        if ((left + width) < 0) {
            width = minSize;
        }
        // end y is out of left edge
        if ((top + height) < 0) {
            height = minSize;
        }

        object.set({
            left: left,
            top: top,
            width: width,
            height: height,
            scaleX: 1,
            scaleY: 1
        });

        object._objects[0].set({
            left: -(width/2),
            top: -(height/2),
            scaleX: 1,
            scaleY: 1,
            width: width,
            height: height
        });

        object._objects[1].set({
            left: -(width/2),
            top: -(height/2),
            scaleX: 1,
            scaleY: 1,
        });

        object.setCoords();
    }

    _getScaleImageInfo(imgWidth, imgHeight, maxWidth, maxHeight) {
        let wRatio = maxWidth / imgWidth;
        let hRatio = maxHeight / imgHeight;

        let scale = 1;
        if (imgWidth > maxWidth && wRatio < hRatio) {
            scale = wRatio;
        } else if (imgHeight > maxHeight && hRatio < wRatio) {
            scale = hRatio;
        }
        let width = Number((imgWidth * scale).toFixed(0));
        let height = Number((imgHeight * scale).toFixed(0));

        return { width, height, scale };
    }

    _getMountElmInnerSize() {
        let el = this.mountElm;
        let height = el.clientHeight;
        let width = el.clientWidth;
        let paddingLeft = window.getComputedStyle(el, null).getPropertyValue('padding-left');
        let paddingRight = window.getComputedStyle(el, null).getPropertyValue('padding-right');
        let paddingTop = window.getComputedStyle(el, null).getPropertyValue('padding-top');
        let paddingBottom = window.getComputedStyle(el, null).getPropertyValue('padding-bottom');

        width = width - parseFloat(paddingLeft) - parseFloat(paddingRight);
        height = height - parseFloat(paddingTop) - parseFloat(paddingBottom);

        return { width, height };
    }


    // 라벨링 영역 추가 생성 
    addLabelform(num) {
        
        var str = "";
        str += `<div id='labelform${num}' class='labelform' >`;
        str += "<div style='margin-bottom: 4px;'>";
        str += `<strong>label${num} </strong>`;
        str += "</div>";
        str += "<div id='collapse" + num + "' class='panel-collapse'>";
        str += "<div class='panel-body'>";
        str += "<select name='label-box-occupantId' id='label-box-occupantId" + num + "' onchange='labeler.changeDataKinds(" + num + ")'>";
        str += "<option value='' >선택</option>";
        let occupantList = $(".occupant_info");
        for(var i = 0; i < occupantList.length; i++){
            let occupantId = occupantList[i].id;
            str += "<option value='" + occupantId + "'>" + occupantId + "</option>";
        }
        str += "</select>";
        str += "<select name='label-box-data' id='label-box-data" + num + "' onchange='labeler.callFunction(" + num + ")'>";
        str += "<option value=''>선택</option>";
        for(var key in dataMap){
            str += "<option value='" + key + "'>" + dataMap[key] + "</option>";
        }
        str += "</select>";
        str += "<select name='label-box-emotion' id='label-box-emotion" + num + "' onchange='labeler.saveLabeledData(" + num + ")'>";
        str += "<option value=''>선택</option>";
        for(var key in emotionMap){
            str += "<option value='" + key + "'>" + emotionMap[key] + "</option>";
        }
        str += "</select>";
        str += "<select name='label-box-action' id='label-box-action" + num + "' onchange='labeler.saveLabeledData(" + num + ")'>";
        str += "<option value=''>선택</option>";
        for(var key in actionMap){
            if($("#clip_select").val() == key){
                for(var action_key in actionMap[key]){
                    str += "<option value='" + action_key + "'>" + actionMap[key][action_key] + "</option>";
                }
            }
        }
        str += "</select>";
        str += "</div>";
        str += "</div>";
        str += "</div>";

        $("#accordion").append(str);
        this.hide(num);

    }
    
    // 라벨링 영역 지우기
    removeLabelform(num) {
        $("#labelform" + num).remove();
    }


    hide(num) {
        $('#label-box-emotion' + num).hide();
        $('#label-box-action' + num).hide();
    }

    changeDataKinds(num){
        $('#label-box-data' + num).val('');
        $('#label-box-emotion' + num).val('');
        $('#label-box-action' + num).val('');
        $('#label-box-action' + num).hide();
        $('#label-box-emotion' + num).hide();
    }

    callFunction(num) {
        var state = $('#label-box-data' + num).val();
        if (state == 'emotion') {
            $('#label-box-emotion' + num).show();
            $('#label-box-action' + num).hide();
        } else if(state == 'action'){
            $('#label-box-action' + num).show();
            $('#label-box-emotion' + num).hide();
        }
    }

    // 프레임 추출된 이미지 정보 생성 
    bringImageData(currentTime){
        this.imageInfo = {
            id : this.bboxData.id + '_img_' + this.imageNum,
            currentTime : currentTime,
            blurImage : false,
            status : false,
            maxLabelNum : 0
        }
        this.imageNum ++;
        this.bboxData.images.push(this.imageInfo);
    }

    // 클립 정보 저장
    bringClipInfo(id, startTime, endTime){
        this.bboxData.id = id;
        this.bboxData.startTime = startTime;
        this.bboxData.endTime = endTime;
    }


    // 저장된 작업 이력이 있는 경우(캔버스, 라벨링 데이터 로딩)  
    taskLoading(indexValue){
        let bboxData = this.bboxData;
        addPageNationBtn(indexValue);
        if(bboxData.images.length <= indexValue || indexValue < 0 ){
            alert("error");
        }else{
            this.clearCanvas();
            let canvas = this.canvas;
            this.labelNum = 0;
            this.imageInfo = bboxData.images[indexValue];
            // if(this.imageInfo.status == true){
                for(var k= 0; k < bboxData.labels.length; k++){
                    canvas.add(bboxData.labels[k]);
                }
            // }
            canvas.setWidth(videoWidth);
            canvas.setHeight(videoHeight);
            canvas.calcOffset();
            canvas.setBackgroundImage();
            

            $("#accordion").empty();
            
            for(var i = 0; i < bboxData.labels.length; i++){
                if(bboxData.labels[i].associatedImage === bboxData.images[indexValue].id){
                    bboxData.labels[i].set({
                        visible : true,
                        selectable : true,
                        evented : true
                    });
                    let occupantList = $(".occupant_info");
                    var num= bboxData.labels[i].id.substr(bboxData.labels[i].id.length - 1, 1);
                    var str = "";
                    str += `<div id='labelform${num}' class='labelform' >`;
                    str += "<div style='margin-bottom: 4px;'>";
                    str += `<strong>label${num} </strong>`;
                    str += "</div>";
                    str += "<div id='collapse" + num + "' class='panel-collapse'>";
                    str += "<div class='panel-body'>";
                    str += "<select name='label-box-occupantId' id='label-box-occupantId" + num + "' onchange='labeler.changeDataKinds(" + num + ")'>";
                    str += "<option value='' >선택</option>";
                    for(var j = 0; j < occupantList.length; j++){
                        let occupantId = occupantList[j].id;
                        if(bboxData.labels[i].labeledData.occupantId == occupantId){
                            str += "<option value='" + occupantId + "' selected>" + occupantId + "</option>";
                        }else{
                            str += "<option value='" + occupantId + "'>" + occupantId + "</option>";
                        }
                    }
                    str += "</select>";
                    str += "<select name='label-box-data' id='label-box-data" + num + "' onchange='labeler.callFunction(" + num + ")'>";
                    str += "<option value=''>선택</option>";
                    for(var key in dataMap){
                        if(bboxData.labels[i].labeledData.dataKinds === key){
                            str += "<option value='" + key + "' selected>" + dataMap[key] + "</option>";
                        }else{
                            str += "<option value='" + key + "'>" + dataMap[key] + "</option>";
                        }
                    }
                    str += "</select>";
                    str += "<select name='label-box-emotion' id='label-box-emotion" + num + "' onchange='labeler.saveLabeledData(" + num + ")'>";
                    str += "<option value=''>선택</option>";
                    for(var key in emotionMap){
                        if(bboxData.labels[i].labeledData.dataValue === key){
                            str += "<option value='" + key + "' selected>" + emotionMap[key] + "</option>";
                        }else{
                            str += "<option value='" + key + "'>" + emotionMap[key] + "</option>";
                        }
                    }
                    str += "</select>";
                    str += "<select name='label-box-action' id='label-box-action" + num + "' onchange='labeler.saveLabeledData(" + num + ")'>";
                    str += "<option value=''>선택</option>";
                    for(var key in actionMap){
                        if($("#clip_select").val() == key){
                            for(var action_key in actionMap[key]){
                                if(bboxData.labels[i].labeledData.dataValue === action_key) {
                                    str += "<option value='" + action_key + "' selected>" + actionMap[key][action_key] + "</option>";
                                }else{
                                    str += "<option value='" + action_key + "' >" + actionMap[key][action_key] + "</option>";
                                }
                            }
                        }
                    }

                    str += "</select>";
                    str += "</div>";
                    str += "</div>";
                    str += "</div>";

                    $("#accordion").append(str);
                    if (bboxData.labels[i].labeledData.dataKinds == 'emotion') {
                        $('#label-box-emotion' + num).show();
                        $('#label-box-action' + num).hide();
                    } else if(bboxData.labels[i].labeledData.dataKinds == 'action'){
                        $('#label-box-action' + num).show();
                        $('#label-box-emotion' + num).hide();
                    }else{
                        $('#label-box-action' + num).hide();
                        $('#label-box-emotion' + num).hide();
                    }

                }else{
                    bboxData.labels[i].set({
                        visible : false,
                        selectable : false,
                        evented : false
                    });
                }
            }
            canvas.discardActiveObject();
        }
    }

    // 탑승자, 라벨링 정보 저장
    saveLabeledData(num){
        let imageId = this.imageInfo.id;
        let id = 'label' + num;
        const label = this.bboxData.labels.find(_find);
        let occupantId = $('#label-box-occupantId' + num).val();
        let dataKinds =  $('#label-box-data' + num).val();

        let dataValue = dataKinds ? dataKinds == 'emotion' ? $('#label-box-emotion' + num).val() : $('#label-box-action' + num).val() : 'error' ;
        let noDataValue = dataKinds ? dataKinds == 'emotion' ? $('#label-box-action' + num).val('') : $('#label-box-emotion' + num).val('') : 'error';
        let occupant = $("#" + occupantId + " #occupant_select").val();
        let occupantSex = $("#" + occupantId + " #occupant_sex").val();
        let occupantAgeGroup = $("#" + occupantId + " #occupant_age").val();

        if(occupant != ''){
            let data = {
                relatedLabel : id,
                occupantId : occupantId,
                occupant : occupant,
                occupantSex : occupantSex,
                occupantAgeGroup : occupantAgeGroup,
                dataKinds : dataKinds,
                dataValue : dataValue
            }
            label.labeledData = data;
        }else{
             $('#label-box-occupantId' + num).val("");
             $('#label-box-data' + num).val("");
             dataKinds ? dataKinds == 'emotion' ? $('#label-box-emotion' + num).val("") : $('#label-box-action' + num).val("") : 'error' ;


           alert("탑승자 정보를 먼저 선택해주세요.");
        }

        function _find(array) {
            if(array.associatedImage === imageId){
                if(array.id === id){
                    return true;
                }
            }
        }
    }

    // 탑승자 정보 저장
    saveOccupantData(){
        let occupantList = $(".occupant_info");
        let tmpArray=[];
        for(var i = 0; i < occupantList.length; i++){
            let occupantId = occupantList[i].id;
            let occupant = $("#" + occupantId + "  #occupant_select").val();
            let occupantSex = $("#" + occupantId + "  #occupant_sex").val();
            let occupantAgeGroup = $("#" + occupantId + "  #occupant_age").val();
            
            let occupantData = {
                occupantId : occupantId,
                occupant : occupant,
                occupantSex : occupantSex,
                occupantAgeGroup : occupantAgeGroup
            }
            tmpArray.push(occupantData)
        }
        this.bboxData.occupant = tmpArray;
    }

    saveClipInfo(sceneId, categoryId) {
        let categoryName = $("#clip_select").val();
        if(categoryName != undefined){
            let clipInfoData = {
                sceneId: sceneId ? sceneId : "",
                categoryId: categoryId ? categoryId : "abnormal",
                categoryName: categoryName
            }
            this.bboxData.clipInfo=clipInfoData;
        }
    }
}






