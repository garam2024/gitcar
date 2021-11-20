/**
 * 클립 별 프레임 정보
 */
 class Frame {
    constructor(time, dataURL, skeleton) {
        this.time = time;
        this.dataURL = dataURL;
        this.skeleton = skeleton;
    };
}

let frames = document.querySelector("#frames");
//바뀜
frames.addEventListener('dblclick', function (e) {
    if (e.target.nodeName !== 'IMG') return
    let region = wavesurfer.regions.list[frames.dataset.regionId]

    var frameNo = 0;
    for (frameNo = 0; frameNo < frames.children.length; frameNo++) {
        if (frames.children[frameNo] === e.target) {
            console.log(frames.children[frameNo])
            console.log(e.target)
            break
        }
    }
    console.log(frameNo)
    // 프레임 클릭하면 hand pose coord 저장
    saveSkeleton();

    // showFrame하기 위한 clipInfo의 frameList 선언
    var imageAlt = imgElement.getAttribute('alt');
    if (imageAlt != null) {
        var imageInfo = imgElement.getAttribute('alt').split("^");
        frameList = clipInfo.get(imageInfo[0]);
        
        clearCanvas();
        showFrame(region, frameNo, frameList);
        // console.log(frameNo)
        // console.log(frameList)
    }

    var allFrames = document.querySelectorAll('#frames img');

    for (var i=0; i<allFrames.length; i++){
        allFrames[i].classList.remove('yellow');
    }

    var highlight = document.querySelector(`#frames #${region.id + "_" + frameNo}`);
    highlight.classList.add('yellow');

    //경진
    if (mode == '작업' || mode == '재작업'){
        document.getElementById("modelLoad").disabled = false;
        document.getElementById("modelReload").disabled = false;
        document.getElementById("handpose").disabled = false;
        document.getElementById("note").disabled = false;   
    }
    
});

function createFrames(region, frameList) {
    let key = region.id;
    let value = frameList;

     console.log(region.id)
    frames.dataset.regionId = region.id
    frames.innerHTML = '';
    //바뀜
    for (let i = 0; i < value.length; i++) {
        let frame = document.createElement('img');
        frame.id = key + "_" + i;
        frame.style = 'display:block; margin: 0 auto 8px;';
        frame.src = value[i].dataURL;
        frame.type = 'image/jpeg';
        frames.appendChild(frame);
    }

    // highlight first frame
    var allFrames = document.querySelectorAll('#frames img');
    if(allFrames.length > 0){
        for (var i=0; i<allFrames.length; i++){
            allFrames[i].classList.remove('yellow');
        }
        var highlight = document.querySelector(`#frames #${region.id + "_0"}`);
        highlight.classList.add('yellow');
    }
}

// var frameList = [];
let setFramesRun

async function setFrames(region) {
    console.log("setFrames region.id : " + region.id);
    console.log("---------------------------------------")
    setFramesRun = true
    // video, canvas 변수 생성
    // videoElement는 regions 대응되는 클립
    var div = document.querySelector('div#' + region.id);
    // console.log(div)
    const videoElement = div.querySelector('video');
    var canvas = document.querySelector('#canvas');
    var context = canvas.getContext('2d');

    // 결과 frameList 배열 변수 생성
    var frameList = []
    var dataURL = '';
    console.log(region)

    // Parameter region으로부터 start, end 변수 생성
    var start = region.start;
    var end = region.end;
    var count = 0
    
    let wait = (region) => {
        let innerFunc = () => {
            if (count > 4) return (function () {  // 프레임 5개가 모두 생성됐다.
                console.log(region)
                if (!clipInfo.has(region.id) || clipInfo.get(region.id).length == 0) {  
                    //clipInfo가 영역 정보가 없다.
                    clipInfo.set(region.id, frameList)
                }
                
                createFrames(region, frameList);
                showFrame(wavesurfer.regions.list[region.id], 0, clipInfo.get(wavesurfer.regions.list[region.id].id));
                setFramesRun = false;
                videoElement.currentTime = region.start;
            })()

            videoElement.currentTime = Math.round((start + count * (end - start) / 5) * 1000000) / 1000000;
            
            videoElement.addEventListener('canplay', e => {
                context.drawImage(videoElement, 0, 0, 800, 450);
                dataURL = canvas.toDataURL('image/jpeg');
                frameList.push(new Frame(videoElement.currentTime, dataURL, []));
                count++
                innerFunc()
            }, { once: true })
        }

        innerFunc()

        // 파라미터 프레임의 시작, 종료

        // for (let index = 0; index < 5; index++) {

        //     videoElement.currentTime = start + index * (end - start) / 5;
        //     await sleep(500);

        //     context.drawImage(videoElement, 0, 0, 1200, 675);
        //     dataURL = canvas.toDataURL('image/jpeg');
        //     frameList.push(new Frame(videoElement.currentTime, dataURL, []));
        // }
    }

    return wait(region)
}

async function showFrame(region, frameNum, frameList) {

    const div = document.querySelector('div#' + region.id);
    if(!div) return
    const videoElement = div.querySelector('video')
    var canvas = document.querySelector('#canvas');
    var context = canvas.getContext('2d');

    var frameTime = frameList[frameNum].time;
    var frameDataURL = frameList[frameNum].dataURL;
    var frameSkeleton = frameList[frameNum].skeleton;

    if (frameTime == null || frameTime.length == '0') {
        frameTime = start + frameNum * (end - start) / 5;
        frameList[frameNum].time = frameTime;
    }
    if (frameDataURL == null || frameDataURL.length == '0') {
        videoElement.currentTime = frameTime;

        videoElement.addEventListener('canplay', e => {
            context.drawImage(videoElement, 0, 0, 800, 450);

            frameDataURL = canvas.toDataURL('image/jpeg');
            frameList[frameNum].dataURL = frameDataURL;
        }, { once: true })
    }

    clipInfo.set(region.id, frameList);

    orgVideo.currentTime = frameTime;

    orgVideo.addEventListener('canplay', e => {
        imgElement.setAttribute('alt', region.id + "^" + frameNum);
        imgElement.setAttribute('src', frameDataURL);

        console.log("frameskeleton -------------------------------------")
        console.log(frameSkeleton)
        if (frameSkeleton == null || frameSkeleton.length == 0) {
            // modelLoad();
        } else {
            drawSkeleton(frameSkeleton);
        }

//        wrapper(frameSkeleton, region, frameNum, frameDataURL)
    }, { once: true })

    // 프레임을 보여주면서 작업한 프레임으로 번호 기억
    if(!workedFrames.includes(frameNum)){
        workedFrames.push(frameNum);
    }
    // console.log(workedFrames);
}
//바뀜
 function sleep(ms) {
     return new Promise(resolve => setTimeout(resolve, ms));
 }

function deleteAllFrame(region) {
    if (clipInfo.has(region.id)) {
        clipInfo.set(region.id, []);
    }
}


function modelReload(){
    console.log(clipInfo)
    var regionId = document.querySelector(`#frames`).dataset.regionId
    var framesImage = document.querySelectorAll('#frames img')
    var yellow_num

    for(var k = 0; k < framesImage.length; k++){
        if(framesImage[k].classList.contains('yellow')){
            yellow_num = k
            break
        }
    }

    let clips = clipInfo.get(regionId)

    console.log('현재 스켈레톤 정보: ' + clips[yellow_num].skeleton)
    console.log('현재 선택된 번호: ' + yellow_num)

    if(!yellow_num || !clips[yellow_num - 1].skeleton.length) return alert('이전 작업이 없습니다.')

    drawSkeleton(clips[yellow_num - 1].skeleton)
}