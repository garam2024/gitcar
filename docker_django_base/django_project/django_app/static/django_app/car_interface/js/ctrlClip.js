/**
 * 구간 클립 정보 (Key : regionId, Value : Frame(array))
 */

var task_id = 0;
 var clipInfo = new Map();

 const clipsContainer = document.querySelector('.clips-container')
 
// let recentlyPlay
//
// clipsContainer.addEventListener('click', e => {
//     if (setFramesRun) return
//     let div = e.target.closest('DIV')
//     console.log(div)
//     if (!div.id || div.id === 'clips') return
//     let region = wavesurfer.regions.list[div.id]
//     let video = div.querySelector('video')
//     recentlyPlay = region
//     video.src = orgVideo.src + '#t=' + region.start + ',' + region.end
//     video.play()
// })
//
// clipsContainer.addEventListener('mouseout', e => {
//     // console.log('mouseout 작동')
//     if (setFramesRun) return
//     if (!recentlyPlay) return
//     if (e.target.id === recentlyPlay.id) {
//         let region = wavesurfer.regions.list[recentlyPlay.id]
//         let video = document.getElementById(recentlyPlay.id)
//         // video.currentTime = region.start;
//         // video.pause()
//         // change constructure : video -> div/video
//         video.querySelector('video').currentTime = region.start;
//         video.querySelector('video').pause();
//
//         recentlyPlay = null
//     } else if (e.target.id !== recentlyPlay.id && e.target.nodeName === 'VIDEO') {
//         let region = wavesurfer.regions.list[e.target.id]
//         recentlyPlay = region
//     }
// })
//

 var clipsContainerOnce = false;

 clipsContainer.addEventListener('dblclick', function(e){
    if(clipsContainerOnce) return
     let div = e.target.closest('DIV')
     if (!div.id || div.id === 'clips') return
     clipsContainerOnce = true

     // 삭제 시 tmpImage가 삭제된 regionId를 가지므로 오류발생
     var imageAlt = imgElement.getAttribute('alt');
     if (imageAlt != null) {
         var imageInfo = imgElement.getAttribute('alt').split("^");
         if(clipInfo.has(imageInfo[0])){
             //saveSkeleton(); //20211028 정성효 핸드포즈빠지는 문제로 주석처리함
         }
     }

     let _div = document.getElementById(div.id)
     let region = wavesurfer.regions.list[div.id]
     let video = _div.querySelector('video')
     setFrames(wavesurfer.regions.list[div.id])

     region.play()


//     toggleModal(1,"show")

     clearCanvas();
     editAnnotation(wavesurfer.regions.list[div.id])
     showNote(wavesurfer.regions.list[div.id])
     // setFrames -> createFrames -> showFrame

//     function clipHl(){
//         // 클립 선택한 것 하이라이트
//         var clips = document.querySelectorAll('#clips div video');
//
//         for(let elem of clips){
//             elem.classList.remove('yellow');
//         }
//
//         var highlight = document.querySelector(`#clips #${wavesurfer.regions.list[div.id].id} video`);
//         highlight.classList.add('yellow');
//
//          //경진
//          if (mode == '작업' || mode == '재작업'){
//            if(document.getElementById("modelLoad")){
//                 document.getElementById("modelLoad").disabled = false;
//             }
//            if(document.getElementById("modelReload")){
//                document.getElementById("modelReload").disabled = false;
//             }
//             document.querySelector(".btn-danger").disabled = false;
//             document.getElementById("handpose").disabled = false;
//             document.getElementById("note").disabled = false;
//         }
//
//         viewNowClipRejection()
//     }
     util.clipHi(div.id)
     viewNowClipRejection()
     document.querySelector(".btn-danger").disabled = false;
     // 세트, 현재 클립 번호(0부터 시작한다.)
     var clipsObject = document.querySelectorAll('#clips div video');
     var yellow_num;

     for(var k=0; k<clipsObject.length; k++){
         if(clipsObject[k].classList.contains('yellow')){
             yellow_num = k;
             break;
         }
     }

     nowClip = [];
     nowClip.push(yellow_num);

     clipsContainerOnce = false;
 })

 function statusDisplayElement(){
     var _div =  document.createElement('div')
     _div.classList.add('clip-status')
     return _div
 }

 async function createClip(region, isNowClip) {

     // update clip
     //211020
     // if (document.getElementById(region.id)) return await (function () {
     //     console.log("createClip region.id : " + region.id)
     //     updateClip(region)
     //     if (document.getElementById('frames').children.length) {
     //         setFrames(region)
     //     }
     // })()


     // create clip
     let clips = document.querySelector("#clips")
     let clip = document.createElement('div')
     let video = document.createElement('video')

     clip.appendChild(video)
     //클립상태 div

     clip.appendChild(statusDisplayElement())
     clipStatusMark(clip.querySelector('.clip-status'), region.data.status)

     clip.id = region.id;
     video.src = orgVideo.src + '#t=' + region.start + ',' + region.end;
     video.type = 'video/mpeg';
     video.title = region.attributes
     // video.id = region.id;

     // highlight the now created clip
     var clipsVideo = document.querySelectorAll('#clips div video');
     for (var i = 0; i < clipsVideo.length; i++) {
         clipsVideo[i].classList.remove('yellow');
     }
     video.classList.add('yellow')

     clips.appendChild(clip);

     //경진
     if (mode == '작업' || mode == '재작업'){
         if(document.getElementById("modelLoad")){
             document.getElementById("modelLoad").disabled = false;
         }
         if(document.getElementById("modelReload")){
            document.getElementById("modelReload").disabled = false;
         }
         document.querySelector(".btn-danger").disabled = false;
         document.getElementById("handpose").disabled = false;
         document.getElementById("note").disabled = false;
     }

     //211020
     // if(isNowClip){
     //     // set frames
     //     setFrames(region)
     //
     // }
 }

 function updateClip(region) {
     let clip = document.getElementById(region.id)
     let video = clip.querySelector('video')
     video.src = orgVideo.src + '#t=' + region.start + ',' + region.end;
 }

 function sortClip() {
     let array = []
     let clips = document.querySelector("#clips")
     
     Object.keys(wavesurfer.regions.list).map(id => {
         let region = wavesurfer.regions.list[id]
         array.push({ id: id, start: region.start, status: region.status })
     })
 
     array.sort((a, b) => {
         if (a.start > b.start) return 1
         if (a.start < b.start) return -1
         return 0
     })
 
     array.map(array => {
         let region = document.getElementById(array.id)
         if(region != null) {
             clips.append(region)
         }  // if not use "if(region != null)" -> null will be shown on clips
     })
 
 }
 
 //  function saveClip() {
 //      var clipTime = [];
 
 //      Object.keys(wavesurfer.regions.list).map(function (id) {
 //          console.log(id)
 //          let region = wavesurfer.regions.list[id];
 
 //          let clips = document.querySelector("#clips");
 //          let clip = document.createElement('video');
 
 //          clip.id = region.id;
 //          clip.src = orgVideo.src + '#t=' + region.start + ',' + region.end;
 //          clip.type = 'video/mpeg';
 
 //          var tIdx = clipTime.length-1;
 
 //          if (tIdx < 0){
 //             clips.appendChild(clip);
 //             clipTime.push(region.start);
 //          }else{
 //             var isChecked = false;
 
 //             while(tIdx >=0){
 //                 if(clipTime[tIdx] <= region.start){
 //                     if(tIdx==clipTime.length-1){
 //                         clips.appendChild(clip);
 //                     }else{
 //                         clips.insertBefore(clip, clips.childNodes[tIdx+1]);
 //                     }
 //                     clipTime.splice(tIdx+1, 0, region.start);
 //                     isChecked = true;
 //                     break;
 //                 }
 //                 tIdx--;
 //             }
 
 //             if(!isChecked){
 //                 if(clipTime[0] >= region.start){
 //                     clips.prepend(clip);
 //                     clipTime.unshift(region.start);
 //                 }else{
 //                     clips.appendChild(clip);
 //                     clipTime.push(region.start);
 //                 }
 //             }
 //          }
 //      })
 
 //  }
 
 //상민
 //데이터 찍기 용
 function viewData(){
     console.log('모든 클립 객체 배열: ')
     console.log(allRegions)
     console.log('모든 클립 5개 묶음 객체 배열: ')
     console.log(sptRegions)
     console.log('작업 중인 세트: ')
     console.log(nowSet)
     console.log('작업 중인 클립: ')
     console.log(nowClip)
     console.log('작업 중인 클립의 완료한 프레임 배열: ')
     console.log(workedFrames)
     console.log('작업 완료한 클립 배열: ')
     console.log(workedClips)
 }

 function viewNowClipRejection(){
    var returned_work = document.forms.returned
    var BeforeRejection = document.querySelector('.BeforeRejection textarea')
    var attributesNum = document.querySelector('#attributes').value

    if(BeforeRejection){
         for(let key in wavesurfer.regions.list){
            BeforeRejection.value = ''
            if(wavesurfer.regions.list[key].attributes == attributesNum){
                var str = wavesurfer.regions.list[key].data.rejection
               if(str){
                   if(BeforeRejection){
                    BeforeRejection.value = str
                   }
               }else{
                   if(BeforeRejection){
                        BeforeRejection.value = ''
                   }
               }
               return
            }
         }
    }
 }
 
 //상민
 function formChangeCheck(){
     var labeling_form = document.forms.edit
     var returned_work = document.forms.returned
     var addRejection = document.querySelector('#addRejection')
     var removeRejection = document.querySelector('#removeRejection')
     var textarea = document.querySelector('.middle textarea')
     var attributesNum = document.querySelector('#attributes')
     var once = 0

    if(labeling_form){
         labeling_form.addEventListener('change', e => {
             statusWorking()
         })
     }
 
     if(returned_work){
         addRejection.addEventListener('click', e => {
             e.preventDefault()
             if(attributesNum.value != ''){

                 var rejectionInfo =  returned_work.rejection.value == '반려 사유 없음'?
                 textarea.value : returned_work.rejection.value

                 var tmp = textarea.value

                 tmp == ''? '' : tmp + '/'
                 textarea.value = rejectionInfo + " " +tmp

                 console.log(textarea.value)
                 statusRejection('반려', textarea.value)

                 if(once === 0){
                    once = 1
                    var inspectRejection = document.getElementById('inspectRejection')
                    inspectRejection.disabled = false
                 }
            }else{
                alert('선택된 클립이 없습니다.')
            }
         })
 
         removeRejection.addEventListener('click', e => {
             e.preventDefault()
             statusRejection('제거')
         })
     }

 }
 
 function statusRejection(status, val){

    const confirmed = confirm("반려 내역을 변경 하시겠습니까?");
    if(!confirmed) return
     if(val == '0') return

     for(let i = 0; i < sptRegions[nowSet[0]].length; i++){
            if(sptRegions[nowSet[0]][i].attributes == sptRegions[nowSet[0]][nowClip[0]].attributes){
             let element = document.getElementById(sptRegions[nowSet[0]][i].id)//리전

             if(status === '제거' && sptRegions[nowSet[0]][i].data['status'] != '완료'){
                sptRegions[nowSet[0]][i].data['status'] = '완료'
                clipStatusMark(element.querySelector('.clip-status'), status)
             }else if(status === '제거' && sptRegions[nowSet[0]][i].data['status'] == '완료'){
                return
             }else{
                sptRegions[nowSet[0]][i].data['status'] = status
                clipStatusMark(element.querySelector('.clip-status'), status)
             }

            if(val){
                sptRegions[nowSet[0]][i].data['rejection'] = val
             }

             return (function(){
               console.log(status)
               let task_api_url;
               var param;
               if (window.location.pathname == '/admin/index/adminview'){
                task_api_url = "/admin/index/adminview/task_api";
                sptRegions[nowSet[0]][nowClip[0]].data.skeleton.forEach(function (i){
                    i.dataURL = '';
                })
                param = {
                     id: sptRegions[nowSet[0]][i].id,
                     start: form.elements.start.value,
                     end: form.elements.end.value,
                     attributes: form.elements.attributes.value,
                     group: document.getElementById("groupId").value,
                     work_id : document.getElementById("work_id").value,
                     data: {
                         note: form.elements.note.value,
                         handpose: form.elements.handpose.value,
                         skeleton: sptRegions[nowSet[0]][i].data.skeleton,
                         status: status === '반려'? status : '완료',
                     }
                 }

                }else{
                    task_api_url = 'task_api';
                    console.log(sptRegions[nowSet[0]][nowClip[0]])
                    sptRegions[nowSet[0]][nowClip[0]].data.skeleton.forEach(function (i){
                        i.dataURL = '';
                    })
                    param = {
                         id: sptRegions[nowSet[0]][i].id,
                         start: form.elements.start.value,
                         end: form.elements.end.value,
                         attributes: form.elements.attributes.value,
                         group: document.getElementById("groupId").value,
                         data: {
                             note: form.elements.note.value,
                             handpose: form.elements.handpose.value,
                             skeleton: sptRegions[nowSet[0]][i].data.skeleton,
                             status: status === '반려'? status : '완료',
                         }
                     }
                }

                if(val){
                    param.data.rejection = val
                }else{
                    param.data.rejection = sptRegions[nowSet[0]][i].data.rejection? sptRegions[nowSet[0]][i].data.rejection : ''
                }

               let arrayIndex = memoArray.findIndex(arr => arr.attributes == form.elements.attributes.value)

                if(arrayIndex != -1){ //있으면 업데이트
                    memoArray[arrayIndex] = {
                        attributes: form.elements.attributes.value,
                        rejection: val? val : ''
                    }
                }else{ //없으면 추가
                     memoArray.push({
                        attributes: form.elements.attributes.value,
                        rejection: val? val : ''
                    })
                }

                 $.ajax({
                     type : 'POST',
                     url : task_api_url,
                     dataType : 'json',
                     data : JSON.stringify(param),
                     success : function(data){
                         // console.log('Success');
                         // console.log(data)
                         //여기에 클립 완료 표시
                         //상민
                         // alert("정보가 업데이트되었습니다.")
                         console.log('정보 업데이트')
                         interfaceApp.sidebar.viewRejection()
                         setMarkInit()
                     },
                     error : function(e){
                         // console.log('Error');
                         // console.log(e);
                     }
                 }); //ajax
             }())//IIFE
         }//if
     }//for
 }


 function statusWorking(){
    var attributesNum = document.querySelector('#attributes').value
     for(let key in wavesurfer.regions.list){
         if(wavesurfer.regions.list[key].attributes == attributesNum){
             region = wavesurfer.regions.list[key]
             let element = document.getElementById(wavesurfer.regions.list[key].id)//리전 아이디로 요소 선택
             if(region.data['status'] !== '반려' || region.data['status'] !== '완료'){
                 console.log('업데이트')
                 //반려또는 완료가 아닐 때 작업중으로 업데이트 한다.
                 region.data['status'] = '작업중'
                 // console.log('조건 1: ')
                 // console.log(wavesurfer.regions.list[key])
                 clipStatusMark(element.querySelector('.clip-status'), '작업중')

                 region.data.note = document.forms.edit.note.value
                 region.data.handpose = document.forms.edit.handpose.value
             }

             return (function(){


               let task_api_url;
               var param;
               if (window.location.pathname == '/admin/index/adminview'){
                    task_api_url = "/admin/index/adminview/inspect_task_api";
                    console.log(wavesurfer.regions.list[key])
                    wavesurfer.regions.list[key].data.skeleton.forEach(function (i){
                        i.dataURL = '';
                    })
                    param = {
                     id: wavesurfer.regions.list[key].id,
                     start: form.elements.start.value,
                     end: form.elements.end.value,
                     attributes: form.elements.attributes.value,
                     group: $("#groupId").val(),
                     work_id : $("#work_id").val(),
                     worker_id : $("#worker_id").val(),
                     data: {
                         note: form.elements.note.value,
                         handpose: form.elements.handpose.value,
                         skeleton: wavesurfer.regions.list[key].data.skeleton,
                         status: status === '반려'? status : '',
                         rejection: wavesurfer.regions.list[key].data.rejection? wavesurfer.regions.list[key].data.rejection : ''
                     }
                 }
                }else {
                    task_api_url = 'task_api';
                    wavesurfer.regions.list[key].data.skeleton.forEach(function (i){
                        i.dataURL = '';
                    })
                    param = {
                         id: wavesurfer.regions.list[key].id,
                         start: form.elements.start.value,
                         end: form.elements.end.value,
                         attributes: form.elements.attributes.value,
                         group: document.getElementById("groupId").value,
                         data: {
                             note: form.elements.note.value,
                             handpose: form.elements.handpose.value,
                             skeleton: wavesurfer.regions.list[key].data.skeleton,
                             status:  wavesurfer.regions.list[key].data.status,
                             rejection: wavesurfer.regions.list[key].data.rejection? wavesurfer.regions.list[key].data.rejection : ''
                         }
                     }
                }

                 $.ajax({
                     type : 'POST',
                     url : task_api_url,
                     dataType : 'json',
                     data : JSON.stringify(param),
                     success : function(data){
                         if(data.message != "1" ){
                             alert(data.message);
                             window.location.replace("/");
                         }
//                         console.log(param)
//                         console.log('정보가 저장')
                         setMarkInit()            
                     },
                     error : function(e){
                         //alert(e);
                     }
                 });
             }())
         }
     }
 }
 
 // function statusWorkingInit(){
 
 // }//set버튼 클릭시 발생하는 함수
 
 formChangeCheck()//한번만