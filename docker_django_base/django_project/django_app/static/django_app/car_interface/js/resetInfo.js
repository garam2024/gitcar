/**
 * delete-region bind controls.
 */
 function deleteRegion(){
    let regionId = form.dataset.region;  // eg. wavesurfer_efohn92htho
    var regionInfo = wavesurfer.regions.list[regionId]
    if(!regionInfo) return alert('선택된 클립이 없습니다.')
    const confirmed = confirm("삭제 후 클립 복구가 불가능합니다.\n클립을 삭제하시겠습니까?");

    if (confirmed) {
        let form = document.forms.edit;

        if (regionId) {
            // db region instance 삭제
            let work_id = $("#work_id").val();
            let worker_id = $("#worker_id").val();
            let param = {
                "id": regionId,
                "start": regionInfo.start,
                "end": regionInfo.end,
                "attributes": regionInfo.attributes,
                "work_id": work_id,
                "worker_id": worker_id,
                "data":{
                    "note": regionInfo.data.note,
                    "handpose": regionInfo.data.handpose,
                    "skeleton":regionInfo.data.skeleton
                }
            }
            $.ajax({
                type : 'POST',
                url : 'task_region_delete',
                dataType : 'json',
                data : JSON.stringify(param),
                success : function(data){
                    console.log('Success');
                    setTimeout(chkFinalCmpl, 2000)
                    window.wavesurfer.clearMarkers();
                    clearCanvas();
                    sortClip()
                    setMarkInit()
                    interfaceApp.sidebar.viewRejection()
                },
                error : function(e){
                    console.log('Error');
                    console.log(e);
                }


            });



            // 브라우저 저장정보 삭제
            let framse = document.querySelector('#frames')

            if (framse && framse.dataset.regionId === regionId) {
                framse.innerHTML = ''
                framse.dataset.regionId = ''
                deleteAllFrame(wavesurfer.regions.list[regionId])
            }

            wavesurfer.regions.list[regionId].remove();
            document.getElementById(regionId).remove()
            clipInfo.delete(regionId);
            form.reset();

            sptRegions[nowSet[0]].splice(nowClip[0], 1);
            if(sptRegions[nowSet[0]].length < 1){
                // delete sptRegions element
                sptRegions.splice(nowSet[0], 1)

                // delete setBtn
                document.querySelectorAll('#sets')[nowSet[0]].remove();

                // reset nowSet
                const beforeSet = nowSet[0]
                nowSet = []
                if(beforeSet > 0)  nowSet.push(beforeSet -1)
            }
            alert("영역이 삭제되었습니다.")
            //경진 클립 삭제후 버튼 끄기
            document.querySelector(".btn-danger").disabled = true;
            if(document.getElementById("modelLoad")){
                 document.getElementById("modelLoad").disabled = false;
             }
            if(document.getElementById("modelReload")){
                document.getElementById("modelReload").disabled = false;
             }
            document.getElementById("handpose").disabled = true;
            document.getElementById("note").disabled = true;

        }
    }
};


function resetForm(){
    // reset form
    let form = document.forms.edit;
    if(!form) return
    form.reset();
}

function resetFrames(){
    // reset all frames
    let framse = document.querySelector('#frames');
    if(!frames) return
    framse.innerHTML = '';
    framse.dataset.regionId = '';
}

function resetClips(){
    // reset all clips
    $("#clips").empty();
    clips.dataset.regionId = '';
    // clipInfo.clear()를 지우면 xml import 작업 시 export에서 5개 세트 clipInfo의 순서가 꼬여 key를 읽지 못해 undefined를 export한다.
    // clipInfo.clear()를 지우면 out of memory 발생할 것
    clipInfo.clear();
}

function resetRegions(){
    // reset all region
    window.wavesurfer.clearMarkers();
    var regionsElm = document.getElementsByTagName("region"), index;
    for (index = regionsElm.length - 1; index >= 0; index--) {
        regionsElm[index].parentNode.removeChild(regionsElm[index]);
    }
    // wavesurfer.regions.list = {};
    // localStorage.regions = "";
}

function chkFinalCmpl(){
      // final_complete check
      let completeCnt = 0
      document.querySelectorAll('#sets').forEach(el => {
          if(el.classList.contains('complete')){
              completeCnt++;
          }
      });
      var ele = document.getElementById('div_btn');
      var eleCount = ele.childElementCount;
      if(completeCnt == eleCount){
          document.getElementById("final_complete").disabled = false;
      }
}

function chkFinalWorkCmpl(){
      // final_complete check
      let completeCnt = 0
      document.querySelectorAll('#sets').forEach(el => {
          if(el.classList.contains('complete')){
              completeCnt++;
          }
      });
      var ele = document.getElementById('div_btn');
      var eleCount = ele.childElementCount;
      if(completeCnt == eleCount){
          return 'Complete'
      }
      return 'notComplete'
}

function useDisable(boolean){
    var array = []
    array.push(document.querySelector('.btn-save'))
    array.push(document.querySelector(".btn-success"))
    array.push(document.getElementById("modelLoad"))
    array.push(document.getElementById("modelReload"))
    array.push(document.getElementById("handpose"))
    array.push(document.getElementById("note"))
    array.push(document.querySelector(".btn-danger"))
    array.push(document.querySelector(".btn-danger"))

    if(boolean){
        array.foreach(arr => arr.disabled)
    }else{
        array.foreach(arr => arr.disabled = '')
    }
}