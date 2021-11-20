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
let framesContainer = document.querySelector('.frames-container')
let changeImgModalClose = document.querySelector('#changeImgModalClose')
let imageList = document.querySelector('.change-image-list')

imageList.addEventListener('click', function(e){
    var div = e.target.closest('div.img-box')
    if(!div) return
    var img = div.querySelector('img')
    var frames = document.querySelectorAll('#frames > div img')
    var indexImg = frames[frameUpdate.index]

    for(var i = 0; i < frames.length; i++){
        frames[i].classList.remove('yellow')
    }

    indexImg.classList.add('yellow')
    frameUpdate.imgURL = img.src
    indexImg.src = img.src

    console.log(clipInfo.get(frameUpdate.regionId)[frameUpdate.index])

    orgVideo.currentTime = Number(Number(img.title).toFixed(6))
    clipInfo.get(frameUpdate.regionId)[frameUpdate.index].time = Number(Number(img.title).toFixed(6))
    clipInfo.get(frameUpdate.regionId)[frameUpdate.index].dataURL = img.src

    var region = wavesurfer.regions.list[frameUpdate.regionId]
    region.data.skeleton = clipInfo.get(frameUpdate.regionId)

    var modal = document.querySelector('.modal-change-image')
    modal.classList.remove('open')

    showFrame(region, frameUpdate.index, clipInfo.get(wavesurfer.regions.list[region.id].id))
})

var frameUpdate = {
    regionId: '',
    index: '',
}

if(framesContainer){
    framesContainer.addEventListener('click', function(e){
        var button = e.target.closest('button')
        if(!button) return
        console.log(button)
        blurModal(e)
    })
}

changeImgModalClose.addEventListener('click', function(e){
    var modal = document.querySelector('.modal-change-image')
    modal.classList.remove('open')
    frameUpdate.regionId = ''
    frameUpdate.index = ''
})

function blurModal(e){
    var frames = document.querySelector('#frames')
    var div = e.target.parentNode
    var imageList = document.querySelector('.change-image-list')
    imageList.innerHTML = ''
    let index

    for(index = 0; index < frames.children.length; index++){
        if(frames.children[index] === div){
            index
            break
        }
    }

    console.log(index)
    var modal = document.querySelector('.modal-change-image')
    modal.classList.add('open')

    var nowRegion = sptRegions[nowSet][nowClip]

     var start = ''
     var end = ''
     var framesTime = clipInfo.get(nowRegion.id)

     if(index === 0){
        start = nowRegion.start
        end = framesTime[index + 1].time
     }else if(index === 4){
        start = framesTime[index].time
        end = nowRegion.end
     }else{
        start = framesTime[index].time
        end = framesTime[index + 1].time
     }

    var time = timeDivid(start, end, 10)
    time.forEach(time => createImg(time, nowRegion.id))
    frameUpdate.index = index
    frameUpdate.regionId = nowRegion.id
}

function timeDivid(start, end, split, option){
    if(!split) return
    var num = end - start
    var splitNum = num/(split - 1)
    var array = []

    for(var i = 1; i <= split - 2; i++){
        array.push(start + splitNum * i)
    }

    return [start, ...array, end]
}

var blurImgCreateStatus = 'not'
var blurImgCreateWating = []

function createImg(time, id){
    if(blurImgCreateStatus === 'run'){
        return blurImgCreateWating.push([time, id])
    }
    blurImgCreateStatus = 'run'
    var div = document.querySelector('div#' + id);
    const videoElement = div.querySelector('video');
    var canvas = document.querySelector('#canvas');
    var context = canvas.getContext('2d');
    var changeImageList = document.querySelector('.change-image-list')
    videoElement.currentTime = time

    return videoElement.addEventListener('canplay', async function(){
        /*
                context.drawImage(videoElement, 0, 0, 800, 450);
                dataURL = canvas.toDataURL('image/jpeg');
        */

        await context.drawImage(videoElement, 0, 0, 800, 450);
        var div = document.createElement('div')
        var img = document.createElement('img')
        var span = document.createElement('span')

        div.className = 'img-box'
        img.src = canvas.toDataURL('image/jpeg');
        img.title = time
        span.textContent = time

        div.append(img)
        div.append(span)
        changeImageList.append(div)
        sequentialExecutionImg()
    }, { once: true })
}

function sequentialExecutionImg(){
    blurImgCreateStatus = 'not'
    if(blurImgCreateWating.length > 0){
        createImg(blurImgCreateWating[0][0], blurImgCreateWating[0][1])
        blurImgCreateWating.shift()
    }
}

//바뀜
if(framesContainer){
    frames.addEventListener('dblclick', function (e) {
        if (e.target.nodeName !== 'IMG') return
        let region = wavesurfer.regions.list[frames.dataset.regionId]

        var frameNo = 0;
        for (frameNo = 0; frameNo < frames.children.length; frameNo++) {
            if (frames.children[frameNo].querySelector('img') === e.target) {
                break
            }
        }
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
}

function createFrames(region, frameList) {
    let key = region.id;
    let value = frameList;

    frames.dataset.regionId = region.id
    frames.innerHTML = '';
    //바뀜
    for (let i = 0; i < value.length; i++) {
        let clip = document.createElement('div')
        let frame = document.createElement('img')
        let button = document.createElement('button')
        frame.id = key + "_" + i;
        frame.src = value[i].dataURL;
        frame.type = 'image/jpeg';

        button.id = key+"_frameControl_"+i;

        if(workStatus.value === 'D'){ // 1차 검수 에서는 프레임 조절이 안된다.
              button.className = 'btn btn-primary btn-block frame-btn hide' //히든 처리
        }else{
             button.className = 'btn btn-primary btn-block frame-btn'
        }

        clip.appendChild(frame)

        var t = document.createTextNode("프레임 조절");       // Create a text node
        button.appendChild(t);
        clip.appendChild(button)
        frames.appendChild(clip);
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
    if(!framesContainer) return
    setFramesRun = true
    // video, canvas 변수 생성
    // videoElement는 regions 대응되는 클립
    var div = document.querySelector('div#' + region.id);
    const videoElement = div.querySelector('video');
    var canvas = document.querySelector('#canvas');
    var context = canvas.getContext('2d');

    // 결과 frameList 배열 변수 생성
    var frameList = []
    var dataURL = '';

    // Parameter region으로부터 start, end 변수 생성
    var start = region.start;
    var end = region.end;
    var count = 0
    
    let wait = (region) => {
        let innerFunc = () => {
            if(workStatus.value != 'D'){
                if (count > 4) return (function () {  // 프레임 5개가 모두 생성됐다.
                    if (!clipInfo.has(region.id) || clipInfo.get(region.id).length == 0) {
                        //clipInfo가 영역 정보가 없다.
                        clipInfo.set(region.id, frameList)
                    }

                    createFrames(region, frameList);
                    showFrame(wavesurfer.regions.list[region.id], 0, clipInfo.get(wavesurfer.regions.list[region.id].id));
                    setFramesRun = false;
                    videoElement.currentTime = region.start;
                })()
            }else{ //D이면
                  if (count > 4) return (function () {
                    if(region.data.skeleton.length == 0) return (function(){
                        var frames = document.querySelector('#frames')
                        frames.innerHTML = ''
                    }())
                    if (!clipInfo.has(region.id) || clipInfo.get(region.id).length == 0) {
                        //clipInfo가 영역 정보가 없다.
                        clipInfo.set(region.id, frameList)
                    }

                    createFrames(region, frameList);
                    showFrame(wavesurfer.regions.list[region.id], 0, clipInfo.get(wavesurfer.regions.list[region.id].id));
                    setFramesRun = false;
                    videoElement.currentTime = region.start;
                })()
            }

            if(clipInfo.get(region.id)[count] && clipInfo.get(region.id)[count].time){
                videoElement.currentTime = Number(Number(clipInfo.get(region.id)[count].time).toFixed(6));
            }else{
                videoElement.currentTime = Math.round((start + count * (end - start) / 5) * 1000000) / 1000000;
            }

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

    if(!clipInfo.get(region.id)){
        if (frameTime == null || frameTime.length == '0') {
            frameTime = start + frameNum * (end - start) / 5;
            frameList[frameNum].time = frameTime;
        }
    }else{
        frameList[frameNum].time = clipInfo.get(region.id)[frameNum].time;
    }

    if (frameDataURL == null || frameDataURL.length == '0') {
        videoElement.currentTime = frameTime;

        videoElement.addEventListener('canplay', e => {
            context.drawImage(videoElement, 0, 0, 800, 450);

             // frameDataURL = canvas.toDataURL('image/jpeg');
            // frameList[frameNum].dataURL = frameDataURL;
            frameList[frameNum].dataURL = '';
        }, { once: true })
    }

    clipInfo.set(region.id, frameList);
    orgVideo.currentTime = frameTime;
        orgVideo.addEventListener('canplay', e => {

        imgElement.setAttribute('alt', region.id + "^" + frameNum);
        imgElement.setAttribute('src', frameDataURL);

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
    if(!yellow_num || !clips[yellow_num - 1].skeleton.length) return alert('이전 작업이 없습니다.')

    drawSkeleton(clips[yellow_num - 1].skeleton)

}