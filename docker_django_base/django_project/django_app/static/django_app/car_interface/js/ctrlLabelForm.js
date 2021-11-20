var memoArray = []

const hand_labelling = {
    "손바닥 보이기": ["시작", "제스처", "입력", "음성녹음시작해줘", "음성녹음시작", "재생", "플레이", "문열어줘", "문열어"],
    "소지 펴기": ["소리", "음악"],
    "주먹 바닥 보이기": ["정지", "멈춰", "자율주행종료", "종료", "수동운전", "안내음성꺼줘", "음성꺼줘", "꺼줘", "문잠궈줘", "문잠궈"],
    "엄지 왼쪽": ["이전곡으로", "이전"],
    "엄지 오른쪽": ["다음곡으로", "다음"],
    "검지 흔들기": ["랜덤플레이", "랜덤"],
    "엄지 위": ["창문열어줘", "창문열어", "속도올려줘", "속도업", "안내음성크게해줘", "음성크게", "크게", "소리키워줘", "키워줘", "업"],
    "엄지 아래": ["창문닫아줘", "창문닫아", "속도줄여줘", "속도다운", "안내음성작게해줘", "음성작게", "작게", "소리줄여줘", "줄여줘", "다운"],
    "피스 포즈": ["자율주행", "반자동"],
    "검지 중지 펴기": ["속도설정", "설정", "최근영상저장해줘", "영상저장", "저장"],
    "손바닥 좁혔다펴기": ["지도확대해줘", "지도확대", "확대", "차간거리벌려줘", "멀리", "멀게", "트렁크열어줘", "트렁크열어"],
    "손바닥 좁히기": ["지도축소해줘", "지도축소", "축소", "차간거리좁혀줘", "좁게", "좁혀줘", "트렁크닫아줘", "트렁크닫아"],
    "엄지 소지 펴기(전화해 손모양)": ["차량제어", "차량", "제어"],
    "반짝반짝 흔들기": ["비상등켜줘", "비상등", "비상등꺼줘"],
    "엄지 검지 펴기": ["내비게이션", "내비", "지도"],
    "검지 손바닥 보이기": ["경로검색해줘", "경로검색", "경로"],
    "손등 보이기": ["음성녹음중지해줘", "음성녹음중지", "중지", "경로취소해줘", "경로취소", "취소"],
    "검지 손등 보이기": ["경로재검색해줘", "경로재검색", "재검색"],
    "오케이": ["블랙박스", "블박"]
}

let form = document.forms.edit;
let hand_form = form? form.elements.handpose : '';
let note_form = form? form.elements.note : '';

if(form){
    hand_form.addEventListener("change", function () {
        note_form.options.length = 0;
        for (var i in hand_labelling[hand_form.value]) {
            note_form.innerHTML += `<option>${hand_labelling[hand_form.value][i]}</option>`
        }
    });
}

/**
 * 구간 전사, 라벨링 편집
 */
function editAnnotation(region) {
    // region 정보가 없으면 form reset
    var returned_work = document.forms.returned

    if (!region) {
//          returned_work.reset()
        form.reset();
        return
    }

    // form default 정보 설정
    form.style.visibility = 'visible';
    (form.elements.start.value = Math.round(region.start * 1000000) / 1000000);
    (form.elements.end.value = Math.round(region.end * 1000000) / 1000000);

    if (typeof region.attributes === 'object') {
        region.attributes = 0
        form.elements.attributes.value = 0
    } else {
        form.elements.attributes.value = String(region.attributes) || '';
    }


    form.elements.handpose.value = region.data.handpose || '';

//    if (returned_work) {
//        returned_work.rejection.value = region.data.rejection ? region.data.rejection : returned_work.rejection.options[0].value
//    }

    if (region.data.note) {
        note_form.options.length = 0;
        for (var i in hand_labelling[hand_form.value]) {
            if (hand_labelling[hand_form.value][i] == region.data.note) {
                note_form.innerHTML += `<option selected>${hand_labelling[hand_form.value][i]}</option>`
            } else {
                note_form.innerHTML += `<option>${hand_labelling[hand_form.value][i]}</option>`
            }
        }
        // note_form.options[4].selected=true;
    } else {
        form.elements.note.value = '';
        note_form.options.length = 0;
    }
    // form의 sumbit이 클릭되면 실행할 내용 클립 저장 버튼

    form.dataset.region = region.id;
}
// form의 sumbit이 클릭되면 실행할 내용 클립 저장 버튼
if(form){
    form.onsubmit = function (e) {
        e.preventDefault();
        const confirmed = confirm("클립을 저장 하시겠습니까?");
        if (confirmed) {
            console.log(form.dataset.region)
            var region = wavesurfer.regions.list[form.dataset.region]
            if(!region) return alert('선택된 클립이 없습니다.')

            //상민
            if (!form.elements.note.value || !form.elements.handpose.value) {
                return alert('손모양 라벨링 또는 구간 전사 값이 없습니다.')
            }
            //상민

            if (form.elements.attributes.value == '') {
                console.log("the value of region.attributes is ''")
            }

            var tmpFrameList = [];
            var imageAlt = imgElement.getAttribute('alt');  // e.g. "wavesurfer_e1742v3euh^3"
            if (imageAlt != null) {
                var imageInfo = imgElement.getAttribute('alt').split("^");  // e.g. imageInfo = (2) ['wavesurfer_e1742v3euh', '3']
                tmpFrameList = clipInfo.get(imageInfo[0]);  // imageInfo[0] : regionId, clipInfo(regionId => array[{time: 1, skeleton: array(21)}])
            }
            let task_api_url;
            let param;
            if (window.location.pathname == '/admin/index/adminview') {
                task_api_url = "/admin/index/adminview/inspect_task_api";
                region.data.skeleton.forEach(function (i) {
                    i.dataURL = '';
                })
                console.log("작업자 클립 저장")
                param = {
                    id: region.id,
                    start: form.elements.start.value,
                    end: form.elements.end.value,
                    attributes: form.elements.attributes.value,
                    group: document.getElementById("groupId").value,
                    work_id: $("#work_id").val(),
                    worker_id :$("#worker_id").val(),
                    data: {
                        note: form.elements.note.value,
                        handpose: form.elements.handpose.value,
                        skeleton: tmpFrameList,
                        status: '완료'
                    }
                }

            } else {
                task_api_url = 'task_api';
                param = {
                    id: region.id,
                    start: form.elements.start.value,
                    end: form.elements.end.value,
                    attributes: form.elements.attributes.value,
                    group: document.getElementById("groupId").value,
                    data: {
                        note: form.elements.note.value,
                        handpose: form.elements.handpose.value,
                        skeleton: tmpFrameList,
                        status: '완료'
                    }
                }
            }

            var checkCompleteCnt = 0;
            for (var i of wavesurfer.regions.list[region.id].data.skeleton){
                if(i.skeleton.length == 21)
                    checkCompleteCnt ++;
            }

            var framesContainer = document.querySelector('.frames-container')

            if (checkCompleteCnt == 5 || !framesContainer){
                $.ajax({
                    type: 'POST',
                    url: task_api_url,
                    dataType: 'json',
                    data: JSON.stringify(param),
                    success: function (data) {
                        // console.log('Success');
                        // console.log(data)
                        //여기에 클립 완료 표시
                        //상민
                        var clipsDiv = document.querySelectorAll('#clips .clip-status')
                        region.update(param)
                        clipStatusMark(clipsDiv[nowClip[0]], '완료')
                        alert("정보가 업데이트되었습니다.")
                        setMarkInit()
                    },
                    error: function (e) {
                        // console.log('Error');
                        // console.log(e);
                    }
                });
                setTimeout(chkFinalCmpl, 2000)
                $(':focus').blur();
            }else{
                alert("작업이 완료되지 않았습니다.") //checkCompleteCnt
            }
        }
    }
}

// form의 reset이 실행되면 내용
if(form){
    form.onreset = function () {
        // form.style.visibility = 'hidden';
        form.dataset.region = null
    }
}




//상민
function clipSave(region) {
    //saveSkeleton();
    //상민
    if (!form.elements.note.value || !form.elements.handpose.value) {
        return alert('손모양 라벨링 또는 구간 전사 값이 없습니다.')
    }
    //상민

    if (form.elements.attributes.value == '') {
        console.log("the value of region.attributes is ''")
    }

    var tmpFrameList = [];
    var imageAlt = imgElement.getAttribute('alt');  // e.g. "wavesurfer_e1742v3euh^3"
    if (imageAlt != null) {
        var imageInfo = imgElement.getAttribute('alt').split("^");  // e.g. imageInfo = (2) ['wavesurfer_e1742v3euh', '3']
        tmpFrameList = clipInfo.get(imageInfo[0]);  // imageInfo[0] : regionId, clipInfo(regionId => array[{time: 1, skeleton: array(21)}])
    }
    let task_api_url;
    let param;
    if (window.location.pathname == '/admin/index/adminview') {
        task_api_url = "/admin/index/adminview/inspect_task_api";
        region.data.skeleton.forEach(function (i) {
            i.dataURL = '';
        })
        param = {
            id: wavesurfer.regions.list[key].id,
            start: form.elements.start.value,
            end: form.elements.end.value,
            // attributes: form.elements.attributes.value,
            attributes: task_id,
            group: document.getElementById("groupId").value,
            work_id: document.getElementById("work_id").value,
            data: {
                note: form.elements.note.value,
                handpose: form.elements.handpose.value,
                skeleton: region.data.skeleton,
                status: status === '반려' ? status : '',
            }
        }
    } else {
        task_api_url = 'task_api';
        param = {
            id: region.id,
            start: form.elements.start.value,
            end: form.elements.end.value,
            attributes: form.elements.attributes.value,
            group: document.getElementById("groupId").value,
            data: {
                note: form.elements.note.value,
                handpose: form.elements.handpose.value,
                skeleton: tmpFrameList,
                status: '완료'
            }
        }

        console.log(param)
    }

    $.ajax({
        type: 'POST',
        url: task_api_url,
        dataType: 'json',
        data: JSON.stringify(param),
        success: function (data) {
            var clipsDiv = document.querySelectorAll('#clips .clip-status')
            region.update(param)
            //지우기
            alert("정보가 업데이트되었습니다.")
            setMarkInit()
        },
        error: function (e) {
        }
    });

    setTimeout(chkFinalCmpl, 2000)
    $(':focus').blur();

};


function clipStatusMark(clipStatus, status) {
    if (!status || !clipStatus) return

    switch (status) {
        case '완료':
            clipStatus.innerHTML = ''
            clipStatus.innerHTML = `<i class='glyphicon glyphicon-ok'></i> 완료`
            clipStatus.classList.remove('working')
            clipStatus.classList.remove('rejection')
            clipStatus.classList.add('complete')
            break

        case '반려':
            clipStatus.innerHTML = ''
            clipStatus.innerHTML = `<i class='glyphicon glyphicon-remove'></i> 반려`
            clipStatus.classList.remove('complete')
            clipStatus.classList.remove('working')
            clipStatus.classList.add('rejection')
            break

        case '작업중':
            clipStatus.innerHTML = ''
            clipStatus.innerHTML = `<i class='glyphicon glyphicon-fire'></i> 작업중...`
            clipStatus.classList.remove('complete')
            clipStatus.classList.remove('rejection')
            clipStatus.classList.add('working')
            break

        case '제거':
            clipStatus.innerHTML = ''
            if (clipStatus.classList.contains('complete')) {
                clipStatus.classList.remove('complete')
            }

            if (clipStatus.classList.contains('rejection')) {
                clipStatus.classList.remove('rejection')
                clipStatus.classList.add('complete')
                clipStatus.innerHTML = `<i class='glyphicon glyphicon-ok'></i> 완료`
            }

            if (clipStatus.classList.contains('working')) {
                clipStatus.classList.remove('working')
            }
            break
    }
}


/**
 * Display annotation.
 */
if(form){
    note.addEventListener('keydown', function (event) {
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        else event.isImmediatePropagationEnabled = false;
    });
}

function showNote(region) {

    if (!showNote.el) {
        showNote.el = document.querySelector('#subtitle');
    }

    showNote.el.style.color = 'Blue';
    showNote.el.style.fontSize = '16px';
    showNote.el.textContent = region.data.note;

}

function hideNote(region) {
    if (!hideNote.el) {
        hideNote.el = document.querySelector('#subtitle');
    }
    hideNote.el.style.color = 'Blue';
    hideNote.el.style.fontSize = 'large';
    hideNote.el.textContent = '';
}
  
  