var dbinfo
var get_statusDic_url
if(window.location.pathname == '/admin/index/adminview'){
get_statusDic_url = '/admin/index/adminview/get_statusDic'
}
else{
get_statusDic_url = '/get_statusDic'
}

$.ajax({
    type:'POST',
    url : get_statusDic_url,
    async:false,
    success : function(data){
        dbinfo = data
        console.log(dbinfo)
    },
    error:function(err){
    alert('작업상태불러오기실패_새로고침을눌러주세요')
    },
    })



const inputFile = document.getElementById("file");
const fileLoad = document.getElementById('fileLoad')
const orgVideo = document.getElementById("orgVideo");
const tmpVideo = document.getElementById("tmpVideo");

let videoName;
let videoWidth;
let videoHeight;
let ratioVideo;

let appStatus = {
    isVideo: false
}

function setSize(wantSize){
    let videoRatio = video.videoWidth / video.videoHeight
    let width = wantSize
    let height = width * videoRatio
    let elementRatio = width/height

    if(elementRatio > videoRatio) width = height * videoRatio
    else height = width / videoRatio

    const captureCanavs = document.getElementById('canvas')
    const videoForm = document.querySelector('.video-form')
    const tmpImage = document.querySelector('#tmpImage')
    const emptySpace = document.querySelector('.empty-space')

    video.style.width = width + 'px'
    video.style.height = height + 'px'
    captureCanavs.width = width
    captureCanavs.height = height
    videoForm.style.minWidth = width + 'px'
    videoForm.style.width = width + 'px'
    tmpImage.style.width = width + 'px'
    tmpImage.style.height = height + 'px'
    emptySpace.style.height = height + 'px'

    render(width, height)
    // videoForm.style.height = height + 'px'

    canvas.setDimensions({
        width: width,
        height: height
    })

    changedVideoData.width = width
    changedVideoData.height = height
}




const saveBtn = document.getElementById('saveBtn')
if (saveBtn != null) {
   saveBtn.addEventListener('keydown', function(event) {
            if (event.keyCode === 32) {
            event.preventDefault();
        };
    });
}


fileLoad.addEventListener('click', e => {
    inputFile.click()
})

fileLoad.addEventListener('keydown', function(event) {
        if (event.keyCode === 32) {
        event.preventDefault();
    };
});

//function checkStatus(_var){
//
//
//    var boolean = statusArray.map(arr => {
//         if(arr == _var){
//            return true
//         }
//    })
//
//    if(boolean){
//        return boolean
//    }else{
//        return false
//    }
//}
var statusArray = [dbinfo['status_work_run'],dbinfo['status_1cha_inspect_deagi'],dbinfo['status_1cha_inspect_run'],dbinfo['status_2cha_inspect_deagi'], dbinfo['status_manage_return'], dbinfo['status_1cha_man_companion_return']]


inputFile.addEventListener("change", function() {

    if (window.location.pathname == '/admin/index/adminview') {

        var work_status_admin = document.getElementById("work_status").value
        if (statusArray.includes(work_status_admin)) {
            console.log(work_status_admin, "true")
            document.getElementById("inspectBtn").disabled = false
            document.getElementById("restorationBtn").disabled = false
            document.getElementById("addRejection").disabled = false
        } else {
            console.log(work_status_admin, "false")
            document.getElementById("inspectBtn").disabled = true
            document.getElementById("restorationBtn").disabled = true
            document.getElementById("addRejection").disabled = true
        }
    }else if(window.location.pathname.includes('inspect')){
        document.getElementById("inspectBtn").disabled = false
        document.getElementById("restorationBtn").disabled = false
        document.getElementById("addRejection").disabled = false
    }else{
        document.getElementById("workComplete").disabled = false;
    }


    let check_api_url;
    if (window.location.pathname == '/admin/index/adminview') {
        check_api_url = "/admin/index/adminview/check_task"

        function checkTask() {
            $.ajax({
                url: check_api_url,
                type: 'POST',
                data: JSON.stringify({work_id: document.getElementById("work_id").value}),
                success: function (data) {
                    if (data.length != 0) {
                        ajaxSuccess = true;
                        loadRegions(data);
                    }
                },
                error: function (err) {
                    console.log(err)
                }
            })
        }
    } else {
        check_api_url = 'check_task'

        function checkTask() {
            $.ajax({
                url: check_api_url,
                type: 'POST',
                success: function (data) {
                    if (data.length != 0) {
                        ajaxSuccess = true;
                        loadRegions(data)
                    }
                },
                error: function (err) {
                    console.log(err)
                }
            })
        }
    }

    var work_status = document.getElementById("work_status").value;




    const canvasArea = document.querySelector('#canvas-area')
    const editingArea = document.querySelector('.editing-area')

    removeLabelRegion();
    removeClipRegion();
    removeSensor();
    removeCanvas();

    const file = inputFile.files[0];
    if (file.name == fileName) {
        const videourl = URL.createObjectURL(file);

        orgVideo.setAttribute("src", videourl);
        orgVideo.setAttribute('alt', file.name);

        orgVideo.classList.remove('active')
        fileLoad.querySelector('span').textContent = file.name
        videoName = file.name;
        orgVideo.addEventListener("loadedmetadata", render);

    // Init
    if(wavesurfer == null){
        wavesurfer = WaveSurfer.create({
            container: document.querySelector('#waveform'),
            height: 100,
            pixelRatio: 1,
            minPxPerSec: 100,
            scrollParent: true,
            normalize: true,
            splitChannels: false,
            backend: 'MediaElement',
            plugins: [
                WaveSurfer.regions.create(),
                WaveSurfer.minimap.create({
                    height: 30,
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
    }
    removeSetPagination();
    var setStr = "";
    setStr += "<button id='maxSetNum1' onclick='setPagination(1)' class='showClip'>001</button>";
    $("#sets").append(setStr);


            // Load audio from existing media element
            let mediaElt = document.querySelector('#demo video');

            wavesurfer.on('error', function (e) {
                console.warn(e);
            });

            wavesurfer.load(mediaElt);

            wavesurfer.on('ready', function () {

                canvasArea.classList.remove('disable')
                if (work_status == 'B') {
                    wavesurfer.enableDragSelection({
                        drag: false,
                        resize: false,
                        color: randomColor(1)
                    });

                }

                checkTask();

                appStatus.isVideo = true

                const h2 = editingArea.querySelector('h2')
                const _sets = document.querySelector('#sets')
                const _clips = document.querySelector('#clips')
                const _reject = document.querySelector('#rejcetMemo')
                const _occupantArea = document.querySelector('#occupantArea')
                const _labelingArea = document.querySelector('#labelingArea')
                const _clipArea = document.querySelector('#clipArea')

                if (_reject != undefined){
                    _sets.style.height = ((editingArea.offsetHeight / 48) * 11 + 15) - (h2.offsetHeight + 47) + 'px'
                    _clips.style.height = ((editingArea.offsetHeight / 48) * 24 + 15) - (h2.offsetHeight + 47) + 'px'
                    _reject.style.height = ((editingArea.offsetHeight / 48) * 13 + 15) - (h2.offsetHeight + 47) + 'px'
                }else{
                    _sets.style.height = ((editingArea.offsetHeight / 3) * 1 + 15) - (h2.offsetHeight + 47) + 'px'
                    _clips.style.height = ((editingArea.offsetHeight / 3) * 2 + 15) - (h2.offsetHeight + 47) + 'px'
                }

                _clipArea.style.height = ((editingArea.offsetHeight / 48) * 7 + 15) - (h2.offsetHeight + 47) + 'px'

                _occupantArea.style.height = ((editingArea.offsetHeight / 48) * 11 + 15) - (h2.offsetHeight + 47) + 'px'

                _labelingArea.style.height = ((editingArea.offsetHeight / 48) * 30 + 15) - (h2.offsetHeight + 47) + 'px'
                });

            wavesurfer.on('region-update-end', function (region, e) {

                // if(work_status == dbinfo['status_work_run']){

                //saveClip()
                if(regionOver(region)){
                    if(pageMap.get("nowSetPage") != undefined && pageMap.get("nowSetPage") != nowSetPage){
                        setPagination(pageMap.get("nowSetPage"));
                    }
                    var currentClipCnt = $("#clips").children().length;
                    if(currentClipCnt < 10){
                        pageMap.set('nowSetPage',nowSetPage);
                        pageMap.set('nowPageClipCnt', $("#clips").children().length+1);
                        createClip(region)
                            .then(sortClip())
                            .catch(err => { throw new Error(err) })
                    }else{
                        var setViewNum = "";
                        var maxSetNum = $("#sets").children().length+1;
                        var btnNum ="";
                        if (maxSetNum < 10){
                            btnNum = "00"+maxSetNum;
                        }else if(10 <= maxSetNum && maxSetNum < 100){
                            btnNum = "0"+maxSetNum;
                        }else{
                            btnNum = maxSetNum;
                        }
                        setsStatusAll(nowSetPage);

                        setViewNum += "<button id='maxSetNum"+maxSetNum+"' onClick='setPagination("+maxSetNum+")'>"+btnNum+"</button>";
                        $("#sets").append(setViewNum);
                        setPagination(maxSetNum);
                        pageMap.set('nowSetPage',nowSetPage);
                        pageMap.set('nowPageClipCnt', $("#clips").children().length);
                    }
                }

            });
        wavesurfer.on('region-play', function (region) {
            region.once('out', function () {
                wavesurfer.play(region.start);
                wavesurfer.pause();
            });
        });

        /* Toggle play/pause buttons. */
        let playButton = document.querySelector('#play');
        let pauseButton = document.querySelector('#pause');
        wavesurfer.on('play', function () {
            playButton.style.display = 'none';
            pauseButton.style.display = 'block';

            let canPlayState = false;

        });
        wavesurfer.on('pause', function () {
            playButton.style.display = 'block';
            pauseButton.style.display = 'none';

        });



    } else {
        alert("파일 이름을 확인해주세요")
    }

    function render() {
        if (orgVideo.videoHeight > orgVideo.videoWidth) {
            videoHeight = orgVideo.videoHeight > 800 || orgVideo.videoWidth > 800 ? 800 : orgVideo.videoHeight;
            videoWidth = orgVideo.videoHeight > 800 || orgVideo.videoWidth > 800 ? 800 * (orgVideo.videoWidth / orgVideo.videoHeight) : orgVideo.videoWidth;

        } else if (orgVideo.videoHeight < orgVideo.videoWidth) {
            videoHeight = orgVideo.videoHeight > 800 || orgVideo.videoWidth > 800 ? 800 * (orgVideo.videoHeight / orgVideo.videoWidth) : orgVideo.videoHeight;
            videoWidth = orgVideo.videoHeight > 800 || orgVideo.videoWidth > 800 ? 800 : orgVideo.videoWidth;
        } else {
            videoHeight = orgVideo.videoHeight > 800 || orgVideo.videoWidth > 800 ? 800 : orgVideo.videoHeight;
            videoWidth = orgVideo.videoHeight > 800 || orgVideo.videoWidth > 800 ? 800 : orgVideo.videoWidth;
        }
        ratioVideo = orgVideo.videoHeight / videoHeight;

        orgVideo.setAttribute('width', videoWidth);
        orgVideo.setAttribute('height', videoHeight);
        let can1 = document.getElementById("canvas");
        let can2 = document.getElementById("c");
        can1.width = videoWidth;
        can1.height = videoHeight;
        can2.width = videoWidth;
        can2.height = videoHeight;


        const canvas = document.querySelector('#canvas');
        const ctx = canvas.getContext('2d');

        ctx.drawImage(orgVideo, 0, 0, videoWidth, videoHeight);
    }



});

