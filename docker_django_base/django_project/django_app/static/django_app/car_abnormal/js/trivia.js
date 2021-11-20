let isStart = true;
let startTime = 0;
let endTime = 0;
var newRegion;

var GLOBAL_ACTIONS = { // eslint-disable-line

    // spacebar 키로 영역 설정
    addRegion: function() {
        if(isStart){
            startTime = window.wavesurfer.getCurrentTime();
            isStart = false;
            console.log("start : " + startTime);

            window.wavesurfer.clearMarkers();

            window.wavesurfer.addMarker({
                time: startTime,
                label: "START",
                color: '#ff990a',
                position: 'top'
            })
        }else{
            endTime = window.wavesurfer.getCurrentTime();
            isStart = true;
            console.log("end : " + endTime);

            if(startTime != endTime){
                window.wavesurfer.addMarker({
                    time: endTime,
                    label: "END",
                    color: '#ff990a',
                    position: 'top'
                })
                newRegion = window.wavesurfer.addRegion({
                    start: startTime,
                    end: endTime,
                    drag: false,
                    resize : false,
                    color: randomColor(1)
                });
                if(regionOver(newRegion)){
                    if(pageMap.get("nowSetPage") != undefined && pageMap.get("nowSetPage") != nowSetPage){
                        setPagination(pageMap.get("nowSetPage"));
                    }
                    var currentClipCnt = $("#clips").children().length;
                    if(currentClipCnt < 10){
                        pageMap.set('nowSetPage',nowSetPage);
                        pageMap.set('nowPageClipCnt', $("#clips").children().length+1);
                        createClip(newRegion)
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

                        setViewNum += "<button id='maxSetNum"+maxSetNum+"' onClick='setPagination("+maxSetNum+")'>"+btnNum+"</button>";
                        $("#sets").append(setViewNum);
                        setPagination(maxSetNum);
                        pageMap.set('nowSetPage',nowSetPage);
                        pageMap.set('nowPageClipCnt', $("#clips").children().length);
                    }
                }
                window.wavesurfer.clearMarkers();

            }else{alert("비디오의 시작시간과 끝시간이 같습니다")}


        }
    },          


    play: function() {
        if(!appStatus.isVideo) return alert('비디오를 업로드 하세요.')
        if (!document.getElementById("playBtn").disabled){
        window.wavesurfer.playPause();
        if( labeler != undefined){

            storeBBoxData();
            removeBBox();
            labeler=undefined;
            removeCanvas();
            document.getElementById("playBtn").disabled = false;
            // document.getElementById("saveBtn").disabled = true;
            $('#occupantArea').empty();
            $('#accordion').empty();
            removeClipInfo()
        }
        }


    },

    back: function() {
    if (!document.getElementById("playBtn").disabled){
      window.wavesurfer.skipBackward();
    }

    },

    forth: function() {
     if (!document.getElementById("playBtn").disabled){
     window.wavesurfer.skipForward();
     }

    },

    'toggle-mute': function() {
        window.wavesurfer.toggleMute();
    },
    clipDelete: function() {

       if(document.getElementById("clibDelete").disabled) {alert('현재 동작하지 않는 기능입니다.')}
       else {document.getElementById("clibDelete").click()}
    },
//    taskLoad:function(){
//
//    }
};

// Bind actions to buttons and keypresses
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(e) {
        let map = {
            87: 'addRegion', // w(add region)
            32: 'play', // space
            37: 'back', // left
            39: 'forth', // right
            68: 'clipDelete',
            //68 : 'taskLoad' //d(이전 바운딩 박스 불러오기)

        };
        let action = map[e.keyCode];
        if (action in GLOBAL_ACTIONS) {
            if (document == e.target || document.body == e.target || document.getElementById('demo') == e.target || e.target.attributes["data-action"]) {
                e.preventDefault();
            }
        let clip = document.createElement('video');
        clip.addEventListener('dblclick', function (e) {
            e.preventDefault();
        })

            GLOBAL_ACTIONS[action](e);
        }
    });

    [].forEach.call(document.querySelectorAll('[data-action]'), function(el) {
        el.addEventListener('click', function(e) {
            let action = e.currentTarget.dataset.action;
            if (action in GLOBAL_ACTIONS) {
                e.preventDefault();
                GLOBAL_ACTIONS[action](e);
            }
        });
    });
});
// Misc
document.addEventListener('DOMContentLoaded', function() {
    // Web Audio not supported
    if (!window.AudioContext && !window.webkitAudioContext) {
        let demo = document.querySelector('#demo');
        if (demo) {
            demo.innerHTML = '<img src="/example/screenshot.png" />';
        }
    }
    // Navbar links
    let ul = document.querySelector('.nav-pills');
    if ( !ul ) {
        return;
    }

    let pills = ul.querySelectorAll('li');
    let active = pills[0];
    if (location.search) {
        let first = location.search.split('&')[0];
        let link = ul.querySelector('a[href="' + first + '"]');
        if (link) {
            active = link.parentNode;
        }}
    active && active.classList.add('active');
});



