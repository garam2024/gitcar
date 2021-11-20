let occupantMap = {driver:"운전자", passenger : "승객"};
let dataMap = {emotion:'감정', action:'이상행동'};
let emotionMap = { e1:'기쁨', e2:'분노', e3:'놀람', e4:'슬픔', e5:'중립'};
let actionMap = {a1:'졸음운전', a2:'음주운전', a3:'물건찾기', a4:'통화', a5:'휴대폰조작',a6:'차량제어',a7:'운전자폭행'};
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
            occupant : []
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
            let rect = this.addLabel(
                this.mouseStart.e.layerX,
                this.mouseStart.e.layerY,
                event.e.layerX,
                event.e.layerY,
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
        str += "<select name='label=box-emotion' id='label-box-emotion" + num + "' onchange='labeler.saveLabeledData(" + num + ")'>";
        str += "<option value=''>선택</option>";
        for(var key in emotionMap){
            str += "<option value='" + key + "'>" + emotionMap[key] + "</option>";
        }
        str += "</select>";
        str += "<select name='label-box-action' id='label-box-action" + num + "' onchange='labeler.saveLabeledData(" + num + ")'>";
        str += "<option value=''>선택</option>";
        for(var key in actionMap){
            str += "<option value='" + key + "'>" + actionMap[key] + "</option>";
        }
        str += "</select>";
        str += "</div>";
        str += "</div>";
        str += "</div>";

        $("#accordion").append(str);
        this.hide(num);

    }
    
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

    bringImageData(currentTime){
        let imageInfo = {
            id : this.bboxData.id + '_img_' + this.imageNum,
            currentTime : currentTime,
            blurImage : false,
            status : false,
            maxLabelNum : 0
        }
        this.imageNum ++;
        this.bboxData.images.push(imageInfo);
    }

    bringClipInfo(id, startTime, endTime){
        this.bboxData.id = id;
        this.bboxData.startTime = startTime;
        this.bboxData.endTime = endTime;
    }

    taskLoading(indexValue){
        let bboxData = this.bboxData;
        if(bboxData.images.length <= indexValue || indexValue < 0 ){
            alert("error");
        }else{
            let canvas = this.canvas;
            this.labelNum = 0;
            this.imageInfo = bboxData.images[indexValue];
            if(this.imageInfo.status == true){
                for(var i = 0; i < bboxData.labels.length; i++){
                    canvas.add(bboxData.labels[i]);
                }
            }
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
                    str += "<div class='panel panel-default' id='labelform" + num + "'>";
                    str += "<div class='panel-heading' role='tab'>";
                    str += "<a role='button' data-toggle='collapse' data-parent='#accordion' href='#collapse" + num + "' aria-expanded='false';> label"+ num + " </a>";
                    str += "</div>";
                    str += "<div id='collapse" + num + "' class='panel-collapse collapse' role='tabpanel'>";
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
                    str += "<select name='label=box-emotion' id='label-box-emotion" + num + "' onchange='labeler.saveLabeledData(" + num + ")'>";
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
                        if(bboxData.labels[i].labeledData.dataValue === key){
                            str += "<option value='" + key + "' selected>" + actionMap[key] + "</option>";
                        }else{
                            str += "<option value='" + key + "'>" + actionMap[key] + "</option>";
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

    saveLabeledData(num){
        let imageId = this.imageInfo.id;
        let id = 'label' + num;
        const label = this.bboxData.labels.find(_find);
        let occupantId = $('#label-box-occupantId' + num).val();
        let dataKinds =  $('#label-box-data' + num).val();
        let dataValue = dataKinds ? dataKinds == 'emotion' ? $('#label-box-emotion' + num).val() : $('#label-box-action' + num).val() : 'error' ;
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
            alert("잘못된 값을 선택하였습니다. 다시 선택해 주세요");
        }

        function _find(array) {
            if(array.associatedImage === imageId){
                if(array.id === id){
                    return true;
                }
            }
        }
    }

    saveOccupantData(){
        let occupantList = $(".occupant_info");
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

            let cnt = 0;
            for(var j = 0; j < this.bboxData.occupant.length; j++){
                if(this.bboxData.occupant[j].occupantId == occupantId){
                    cnt++;
                }
            }
            if(cnt ==0)
                this.bboxData.occupant.push(occupantData);
        }
    }
}