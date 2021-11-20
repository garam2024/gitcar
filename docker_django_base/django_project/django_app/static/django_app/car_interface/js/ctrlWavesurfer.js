/**
 *  waveSurfer 변수
 **/
var wavesurfer;

var createNum = function(list){
  var number = []
  console.log(list)
  if(Object.keys(list).length === 0) return 0
  for(let key in list){
    console.log(list[`${key}`].attributes)
    number.push(parseInt(list[`${key}`].attributes))
  }
    console.log(Math.max(...number) + 1)
  return Math.max(...number) + 1
}

 /**
  * 비디오 로딩
  */
 // document.addEventListener('DOMContentLoaded', function loadVideo() {
 function loadVideo(jsonFile, modeSelect) {
    var waveform = document.querySelector('#waveform')
     console.log('비디오 로드 작동')
     window.mode = modeSelect;
     // console.log(modeSelect)
     wavesurfer = WaveSurfer.create({
         container: waveform,
         waveColor: "#FFFFFF",
         progressColor: "#FFFFFF",
         cursorColor: "#333",
         cursorWidth: "4",
         height: 60,
         pixelRatio: 1,
         minPxPerSec: 100,
         scrollParent: true,
         normalize: true,
         splitChannels: false,
         backend: 'MediaElement',
         plugins: [
             WaveSurfer.regions.create(),
             WaveSurfer.minimap.create({
                 height: 20,
                 waveColor: '#ddd',
                 progressColor: '#999'
             }),
             WaveSurfer.timeline.create({
                 container: '#wave-timeline'
             }),
             WaveSurfer.cursor.create(),
             WaveSurfer.markers.create()
         ]
     });
 
 
     let mediaElt = document.querySelector('#demo video');
 
     //  canvas.setDimensions({
     //     width: mediaElt.width, 
     //     height: mediaElt.height
     // })
 
     wavesurfer.on('error', function (e) {
         console.warn(e);
     });
 
     wavesurfer.load(mediaElt);

     // 저장된 JSON 정보 불러오기
     wavesurfer.on('ready', function () {
        util.loading.off()
//        interfaceApp.createImg.setSize()
        interfaceApp.sidebar.viewRejection()
        interfaceApp.bookmark.init()
        console.log('작동 이닛')

         task_id = createNum(wavesurfer.regions.list)
         console.log(task_id)
         wavesurfer.enableDragSelection({
             // color: randomColor(0.25),
             slop: 1,
             loop: false
         })

         if (jsonFile) {
             wavesurfer.enableDragSelection();
             wavesurfer.util
                 .fetchFile({
                     responseType: 'json',
                     url: jsonFile
                 })
                 .on('success', function (data) {
                     console.log(data)
                     loadRegions(data);
                     saveRegions();
                 });
         }
     });
     //웨이브 서퍼 리전 클릭시 이동을위해 재생성후 아래 이전 사용하던것 주석처리 이전 코드는 아래로
     wavesurfer.on('region-click', function (region, e) {

     });

     if (mode == '작업' || mode == '재작업') {
         // region create, move, resize
         wavesurfer.on('region-update-end', function (region) {
            if(workStatus.value == 'D'){
                delete wavesurfer.regions.list[region.id]
                document.querySelector(`region[data-id=${region.id}]`).remove()
                return
            }

            console.log('업데이트 작동')
             if(regionOver(region)) return
             resetRegionInfo(region)

             console.log("------------------------------")
             console.log("nowSet : " + nowSet[0])
             console.log("nowClip : " + nowClip[0])
             console.log("------------------------------")
             //여기가 이벤트의 끝인가(?)
            interfaceApp.bookmark.draw()
            setMarkInit()
            util.clipHi(region.id)

             // disable final submit btn
         })
         wavesurfer.on('region-updated', saveRegions);
         wavesurfer.on('region-removed', saveRegions);
 
     } else if (mode == '검수' || mode == '재검수') {
         // disable region create, move, resize
         wavesurfer.on('region-updated', function (region) {
             var regions = region.wavesurfer.regions.list;
             // if new created region -> remove
             if (Object.keys(region.data).length === 0){
                if(regions[region.id]){
                 regions[region.id].remove();
                 }
             }
         });
     }

     function resetRegionInfo(region) {
        console.log('resetRegionInfo 작동')
        console.log(region.id)
         // merge sptRegions
         let mergeSptRegions = []
         sptRegions.forEach(elm => {
             elm.forEach(m => {
                 mergeSptRegions.push(m)
             })
         })
 
         let checkInRegionTag = false;
         mergeSptRegions.forEach(elm => {
             if (elm.id == region.id) {
                 // move, resize region : true
                 // create : false
                 checkInRegionTag = true
             }
         })
 
         // check console.log(move, resize, create)
         if (checkInRegionTag) {
             // console.log("-------------------------------------------------")
             console.log('region-update-end 작동 : move, resize')
             // console.log("region not in sptRegions")
             // console.log("resize or moved reion.id : " + region.id)
             // console.log("existed region.id : ")
             // for(var i=0; i<mergeSptRegions.length; i++){
             //     console.log(mergeSptRegions[i].id)
             // }
             // console.log("-------------------------------------------------")
         } else {
             console.log('region-update-end 작동 : create')
         }
 
 
         if (!checkInRegionTag) { // if create region
             // 생성한 region에는 attributes, note, handpose, skeleton 값이 없으므로 설정
             region.attributes = task_id
             task_id++
             region.data = {
                 "note": "",
                 "handpose": "",
                 "skeleton": []
             }
         }
 
         // array : sort wavesurfer.regions.list 
         var array = [];
         Object.keys(wavesurfer.regions.list).map(function (id) {
             array.push(wavesurfer.regions.list[id])
         })
         array.sort((a, b) => { // array : arr(생성된 region 개수) [{regionId, startTime}, {regionId, startTime} ......] 정렬
             if (a.start > b.start) return 1
             if (a.start < b.start) return -1
             return 0
         })
 
         sptRegions = []
         var tmpArr = []
         let isNowClip = false;
         var clipNum = 0,
             setNum = 0; // clipNum : 5개 클립 중 순서, setNum : 세트 번호 중 순서
 
         for (var k = 0; k < array.length; k++) {
             // set the attributes value of region order by acending
             // array[k].attributes = k;
             // console.log("array k attributes-------------------------------")
             // console.log(array[k].attributes)
 
             if (tmpArr.length < 5) {
                 tmpArr.push(array[k]);
                 sptRegions.pop()
                 sptRegions.push(tmpArr)
             } else {
                 tmpArr = [];
                 tmpArr.push(array[k]);
                 sptRegions.push(tmpArr);
             }
 
             if (!isNowClip && array[k].id == region.id) {
                 clipNum = k % 5;
                 setNum = sptRegions.length - 1
                 isNowClip = true;
             }
         }
         console.log("------------------------")
         console.log("setNum : " + setNum)
         console.log("clipNum : " + clipNum)
         console.log("------------------------")
 
         // sptRegions 개수 보고 세트 버튼 생성
         $('#div_btn').html('');
         setClipButton(sptRegions.length);
 
 
         // setNum 순서 해당하는 set 버튼 하이라이트
         var setBtns = document.querySelectorAll('#sets');
         for (var j = 0; j < setBtns.length; j++) {
             setBtns[j].classList.remove('yellow');
         }
         setBtns[setNum].classList.add('yellow');
 
 
         if (sptRegions[setNum].length > 0) {
             // set now setNum value to nowSet
             nowSet = [];
             nowSet.push(setNum);
 
             // reset view
             clearCanvas();
             window.wavesurfer.clearMarkers();
             resetForm();
             resetFrames();
             deleteAllFrame(region);
             // if (sptRegions[setNum].length < 2) { // when create new setBtn
             //     resetClips();
             // }
             resetClips();
 
             // if (sptRegions[setNum].length < 2) { // when over 5 clips, reset Region except now created region
             //     resetClips();
             //     window.wavesurfer.clearMarkers();
             //     var regionsElm = document.getElementsByTagName("region"),
             //         index;
             //     for (index = regionsElm.length - 2; index >= 0; index--) {
             //         regionsElm[index].parentNode.removeChild(regionsElm[index]);
             //     }
             // }
 
 
 
             saveRegions(sptRegions[setNum]); // save json{start, end, attributes, note, handpose, sekleton} to localStorage.regions
             // if (!checkInRegionTag) { // if create region
             //     loadOneRegion(sptRegions[setNum][clipNum]); // addRegion, new clipInfo, createClip, sortClip with 'sptRegions[setNum][clipNum]'
             // } else {
             //     // resize, move
             //     sptRegions[setNum].forEach(elm => {
             //         loadOneRegion(elm);
             //     })
             // }
             sptRegions[setNum].forEach(elm => {
                 loadOneRegion(elm, true);
             })

             //211020
             // img#tmpImage -> imgElement "alt" -> imageAlt.split("^")[0] -> if clipInfo.has(regionId) -> saveSkeleton
             // var imageAlt = imgElement.getAttribute('alt');
             // if (imageAlt != null) {
             //     var imageInfo = imgElement.getAttribute('alt').split("^");
             //     if (clipInfo.has(imageInfo[0])) {
             //         saveSkeleton();
             //     }
             // }
 
 
             // set now clipNum value to nowClip
             nowClip = [];
             nowClip.push(clipNum);
 
 
             // show video with now created clip
             const nowClipId = $("#clips").children()[clipNum].getAttribute('id');
             clearCanvas();
 
 
             // editAnnotation, showNot, setFrames with the region info of nowClipId
             const clipRegion = wavesurfer.regions.list[nowClipId];
             //console.log(clipRegion)
             editAnnotation(clipRegion);
             showNote(clipRegion);
             // setFrames(clipRegion);
 
 
             // highlight now clip
//             var clips = document.querySelectorAll('#clips div video');
//             for (let elem of clips) {
//                 elem.classList.remove('yellow');
//             }
//             var highlight = document.querySelector(`#clips #${nowClipId} img`);
//             highlight.classList.add('yellow');
//
 
             // show loading view on frames

//             const framesCon = document.querySelector(".frames-container");
//            if(framesCon){
//                 const framesBcRect = framesCon.getBoundingClientRect();
//                 const frameLoader = document.querySelector(".loader");
//                 frameLoader.style.top = framesBcRect.top + (framesBcRect.height - 120) / 2 + "px";
//                 frameLoader.style.left = framesBcRect.left + (framesBcRect.width - 120) / 2 + "px";
//
//                 frameLoader.classList.toggle("hide");
//
//                 setTimeout(function () {
//                     frameLoader.classList.toggle("hide");
//                 }, 1000);
//             }
         } else {
             console.log("sptRegion[setNum].length == 0")
         }
         // console.log(sptRegions);
         console.log(region.id)

         return (function(region){
            console.log('리셋 리전 셋 프레임스' , region.id)
             setFrames(region)
            document.querySelector(".btn-success").disabled = true;

         }(region))


     };
 
 
     wavesurfer.on('region-created', region => {
         // console.log(region)
         // console.log(region.id)
         // console.log(wavesurfer.regions.list)
         //리전 수정 불가
        console.log('region 드래그 불가')
        region.drag = false
        region.resize = false
     })
 
     // else {
     //     wavesurfer.on('region-click', editAnnotation);
     // }
     wavesurfer.on('region-in', showNote);
     wavesurfer.on('region-out', hideNote);
//     wavesurfer.on('region-play', function (region) {
//         region.once('out', function () {
//             wavesurfer.play(region.start);
//             wavesurfer.pause();
//         });
//     });
//
     /* Toggle play/pause buttons. */
     let playButton = document.querySelector('#play');
     let pauseButton = document.querySelector('#pause');
 
     wavesurfer.on('play', function () {
         pauseButton.style.display = 'block';
         playButton.style.display = 'none';
 
         clearCanvas();
     });
 
     wavesurfer.on('pause', function () {
         playButton.style.display = 'block';
         pauseButton.style.display = 'none';
//         toggleModal(1,"hide")
     });
 
     wavesurfer.on('waveform-ready', function () {
         loader.classList.toggle("hide");
     });

 }


 
 
 //  videoElement.addEventListener("loadedmetadata", render);
 var renderCanvas
 const videoElement = document.querySelector('#orgVideo');

videoElement.onended = function(){
    cancelAnimationFrame(renderCanvas)
}
//
//videoElement.ontimeupdate = function(e){
//    console.log('?')
//    onceUpdateRender(e.target.currentTime)
//}
//
//function onceUpdateRender(currentTime){
//    const canvas = document.querySelector('#canvas');
//    const ctx = canvas.getContext('2d');
//
//    videoElement.currentTime = currentTime
//    videoElement.addEventListener('canplay', function(){
//        ctx.drawImage(videoElement, 0, 0, 800, 450);
//    }, { once: true })
//}
//
// function onceRender(){
//    const canvas = document.querySelector('#canvas');
//    const ctx = canvas.getContext('2d');
//
//    videoElement.currentTime = 0.000001
//    videoElement.addEventListener('canplay', function(){
//        ctx.drawImage(videoElement, 0, 0, 800, 450);
//    }, { once: true })
// }
//
// function render() {
//     const canvas = document.querySelector('#canvas');
//     const ctx = canvas.getContext('2d');
//
//     ctx.drawImage(videoElement, 0, 0, 800, 450);
//
//     // 첫 번째 인자로 비디오를 넣어준다.
//     renderCanvas = requestAnimationFrame(render);
// }
//
 
 /**
  * 로컬스토리지에 전사, 라벨링, 스켈레톤 정보 저장
  */
 function saveRegions() {
     // console.log('saveRegions')
     localStorage.regions = JSON.stringify(
         Object.keys(wavesurfer.regions.list).map(function (id) {
             let region = wavesurfer.regions.list[id];
             if (region.attributes == {}) {
                 region.attributes = 0
             }
 
             var frameList = clipInfo.get(id);
             var frameJson = [];
 
             if (frameList != null) {
                 frameList.forEach(frame => {
                     frameJson.push({
                         'time': frame.time,
                         'skeleton_positions': frame.skeleton
                     });
                 });
             }
 
             // console.log("saveRegions attributes ----------------------")
             // console.log(region.attributes)
 
             return {
                 start: Math.round(region.start * 1000000) / 1000000,
                 end: Math.round(region.end * 1000000) / 1000000,
                 attributes: region.attributes,
                 data: {
                     note: region.data.note,
                     handpose: region.data.handpose,
                     skeleton: frameJson
                 }
             };
         })
     );
 }
 
 
 /**
  *  addRegion, new clipInfo, createClip, sortClip from json
  */
 function loadRegions(regions) {
     // console.log("loadRegions--------------------------")
 
     regions.forEach(function (elm) {
         // console.log(elm)
         tmpFramelist = [];
         // elm.color = randomColor(0.25);
         if (elm.data.skeleton.length > 0) {
             tmpFramelist = elm.data.skeleton
         }
 
         // add region to wavesurfer
         var newRegion = wavesurfer.addRegion(elm);
 
         // // 생성한 region을 drag, resize 방지
         // for(var i=0; i<wavesurfer.regions.list.length; i++){
         //     wavesurfer.regions.list[i].update({drag: false, resize: false});
         // }
 
         clipInfo.set(newRegion.id, tmpFramelist);
         createClip(newRegion, true);

     });
     sortClip();
     //상민
     // setMarkInit()
 }
 
 
 
 /**
  *  addRegion, new clipInfo, createClip, sortClip with 'sptRegions[setNum][clipNum]'
  */
 async function loadOneRegion(elm, isNowClip) {
//      console.log("loadRegions--------------------------")
//      console.log(elm)
//      console.log(isNowClip)
     let tmpFramelist = [];
     // elm.color = randomColor(0.25);
     if (elm.data.skeleton && elm.data.skeleton.length > 0) { //
         tmpFramelist = elm.data.skeleton
     }


     // add region to wavesurfer
     // var newRegion = wavesurfer.addRegion(elm);
 
     // // 생성한 region을 drag, resize 방지
     // for(var i=0; i<wavesurfer.regions.list.length; i++){
     //     wavesurfer.regions.list[i].update({drag: false, resize: false});
     // }
     if (elm.hasOwnProperty("id")){
         clipInfo.set(elm.id, tmpFramelist);
         createClip(elm, isNowClip);
     }else{
         var newRegion = wavesurfer.addRegion(elm);

         clipInfo.set(newRegion.id, tmpFramelist);
         createClip(newRegion, isNowClip);
     }

     sortClip();
 }


 /**
  * Random RGBA color.
  */
 function randomColor(alpha) {
     return (
         'rgba(' + [
             ~~(Math.random() * 255),
             ~~(Math.random() * 255),
             ~~(Math.random() * 255),
             alpha || 1
         ] +
         ')'
     );
 }
 
 
 /**
  * Web Audio not supported의 경우 sample wave img 보여주기
  */
 // Misc
 document.addEventListener('DOMContentLoaded', function () {
     // Web Audio not supported
     if (!window.AudioContext && !window.webkitAudioContext) {
         let demo = document.querySelector('#demo');
         if (demo) {
             demo.innerHTML = '<img src="/example/screenshot.png" />';
         }
     }
 });


function regionOver(region) {
    let regionId = region.id;
    let startList = [];
    let endList = [];
    let backRegionEnd ;
    let nextRegionStart ;
    let currntNum ;

    for (var key in wavesurfer.regions.list) {
        startList.push(wavesurfer.regions.list[key].start);
        endList.push(wavesurfer.regions.list[key].end);
    }
    if (region.start == region.end ){
        startList = startList.sort(function (a, b) {
            return a - b;
        });
        endList = endList.sort(function (a, b) {
            return a - b;
        });
        currntNum = startList.findIndex((e) => e === region.start);
        backRegionEnd = endList[currntNum];
        nextRegionStart = startList[currntNum - 1];
    }else{
        startList = startList.sort(function (a, b) {
            return a - b;
        });
        endList = endList.sort(function (a, b) {
            return a - b;
        });
        currntNum = startList.findIndex((e) => e === region.start);
        backRegionEnd = endList[currntNum - 1];
        nextRegionStart = startList[currntNum + 1];
    }

    if (region.end > nextRegionStart || region.start < backRegionEnd) {
        if(wavesurfer.regions.list[regionId]){
            wavesurfer.regions.list[regionId].remove();
        }

        alert('구간설정 중복은 불가능 합니다.')
        return true
    }

    return false
}