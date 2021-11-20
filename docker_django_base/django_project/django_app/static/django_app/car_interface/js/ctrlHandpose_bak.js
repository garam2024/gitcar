function onResults(results) { 
    try{
        if (results.multiHandLandmarks) {
            if (results.multiHandLandmarks.length != 0) {
                for (const landmarks of results.multiHandLandmarks) {
                    // console.log("landmarks length : " + landmarks.length);
                    // console.log("landmarks : " + JSON.stringify(landmarks));
                    // console.log("HAND_CONNECTIONS length : " + HAND_CONNECTIONS.length);
                    // console.log("HAND_CONNECTIONS : " + HAND_CONNECTIONS);
                    (landmarks);
                }
            } else {
                drawSkeleton(getDefaultSkeleton());
            }
        } else {
            drawSkeleton(getDefaultSkeleton());
        }
    }catch(e){
       console.log(e)
    }
   
}

function getDefaultSkeleton() {
    var landmarks = [];

    // default point 변수 생성
    landmarks.push({ 'x': 0.6893983483314514, 'y': 0.41034919023513794, 'z': 0 }); // point0
    landmarks.push({ 'x': 0.7182379364967346, 'y': 0.3887568414211273, 'z': 0 }); // point1
    landmarks.push({ 'x': 0.7429661154747009, 'y': 0.34370389580726624, 'z': 0 }); // point2
    landmarks.push({ 'x': 0.7572599649429321, 'y': 0.30431851744651794, 'z': 0 }); // point3
    landmarks.push({ 'x': 0.7732353210449219, 'y': 0.27840402722358704, 'z': 0 }); // point4
    landmarks.push({ 'x': 0.7257417440414429, 'y': 0.26909592747688293, 'z': 0 }); // point5
    landmarks.push({ 'x': 0.7331976890563965, 'y': 0.21025656163692474, 'z': 0 }); // point6
    landmarks.push({ 'x': 0.7364169359207153, 'y': 0.17068487405776978, 'z': 0 }); // point7
    landmarks.push({ 'x': 0.7389306426048279, 'y': 0.13172690570354462, 'z': 0 }); // point8
    landmarks.push({ 'x': 0.707935094833374, 'y': 0.260882705450058, 'z': 0 }); // point9
    landmarks.push({ 'x': 0.7151468396186829, 'y': 0.2014409899711609, 'z': 0 }); // point10
    landmarks.push({ 'x': 0.7205862998962402, 'y': 0.16023008525371552, 'z': 0 }); // point11
    landmarks.push({ 'x': 0.724775493144989, 'y': 0.12008535861968994, 'z': 0 }); // point12
    landmarks.push({ 'x': 0.6900228261947632, 'y': 0.2650149166584015, 'z': 0 }); // point13
    landmarks.push({ 'x': 0.6946114897727966, 'y': 0.20848749577999115, 'z': 0 }); // point14
    landmarks.push({ 'x': 0.7003583908081055, 'y': 0.16920417547225952, 'z': 0 }); // point15
    landmarks.push({ 'x': 0.7056689858436584, 'y': 0.13184143602848053, 'z': 0 }); // point16
    landmarks.push({ 'x': 0.6712929606437683, 'y': 0.2804179787635803, 'z': 0 }); // point17
    landmarks.push({ 'x': 0.6692480444908142, 'y': 0.2383607029914856, 'z': 0 }); // point18
    landmarks.push({ 'x': 0.6712938547134399, 'y': 0.2095225602388382, 'z': 0 }); // point19
    landmarks.push({ 'x': 0.6739214062690735, 'y': 0.17934751510620117, 'z': 0 }); // point20

    return landmarks;
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 2,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

var loadCount = 0;
hands.onResults(onResults);

function modelLoad() {

    try {
        setTimeout(2000,hands.send({ image: imgElement }));
    }catch(e){
        hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        hands.setOptions({
            maxNumHands: 2,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

    }

    if(loadCount == 0 ){
        // 로딩화면
        const video = document.querySelector("#orgVideo");
        const bcRect = video.getBoundingClientRect();
        const loader = document.querySelector(".loader");
        loader.style.top = bcRect.top+(bcRect.height-120)/2+"px";
        // console.log(bcRect.top)
        loader.style.left = bcRect.left+(bcRect.width-120)/2+"px";

        loader.classList.toggle("hide");

        setTimeout(function(){
            loader.classList.toggle("hide");
        },1800);
        
        loadCount++;
    }

    statusWorking()// 클립의 상태가 반려, 완료가 아닐 떄 작업중으로 만듬
}


class Point {
    constructor(index, line) {
        this.index = index;
        this.line = line;
    }
}

function drawSkeleton(landmarks) {
    console.log('drawSkeleton')
    console.log(landmarks)
    clearCanvas();

    function makeCircle(text, left, top) {
        var c = new fabric.Circle({
            left: left,
            top: top,
            strokeWidth: 4,
            radius: 7,
            fill: '#fff',
            stroke: '#666'
        });

        var circleText = new fabric.Text('' + text, {
            fontSize: 22,
            left: left,
            top: top
        });

        var group = new fabric.Group([c, circleText], {});

        group.hasControls = c.hasBorders = false;
        return group;
    }

    var imageInfo = imgElement.getAttribute('alt').split("^");
    var frameList = clipInfo.get(imageInfo[0]);

    frameList[imageInfo[1]].skeleton = landmarks;
    clipInfo.set(imageInfo[0], frameList);

    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
    fabric.Canvas.prototype.getAbsoluteCoords = function (object) {
        return {
            left: object.left + this._offset.left,
            top: object.top + this._offset.top
        };
    }

    // 점 그리기
    for (var i = 0, len = landmarks.length; i < len; i++) {
        canvas.add(makeCircle(i, landmarks[i].x * 800, landmarks[i].y * 450));
    }

    canvas.renderAll();


}


canvas.on('object:moved', function (event) {
    canvas.discardActiveObject().renderAll();
});


function saveSkeleton() {

    var imageAlt = imgElement.getAttribute('alt');  // e.g. "wavesurfer_e1742v3euh^3"
    if (imageAlt != null) {
        var imageInfo = imgElement.getAttribute('alt').split("^");  // e.g. imageInfo = (2) ['wavesurfer_e1742v3euh', '3']
        var frameList = clipInfo.get(imageInfo[0]);  // imageInfo[0] : regionId, clipInfo(regionId => array(5) [{time: 1, skeleton: array(21)}])
        // console.log(frameList);
        var landmarks = [];

        canvas.discardActiveObject();

        canvas.getObjects().forEach(object => {
            var group = object._objects;
            if (group[1].isType('text')) {
                landmarks.splice(group[1].text, 0, { 'x': group[0].group.left / 800, 'y': group[0].group.top / 450, 'z': 0 });
            }
        });

        if(frameList.length != 0){
            frameList[imageInfo[1]].skeleton = landmarks;
        }

        console.log(clipInfo.set(imageInfo[0], frameList));
    }
}

function removeSkeleton() { 
    canvas.getActiveObjects().forEach((obj) => {
        canvas.remove(obj)
    });
    canvas.discardActiveObject().renderAll()
}

