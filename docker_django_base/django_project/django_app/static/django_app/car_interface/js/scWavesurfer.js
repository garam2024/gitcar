let ws = window.wavesurfer;
let isStart = true;
let startTime = 0;
let endTime = 0;
var newRegion;

var GLOBAL_ACTIONS = { // eslint-disable-line

    addRegion: function() {
        if(isStart){
            startTime = window.wavesurfer.getCurrentTime();
            isStart = false;
            // console.log("start : " + startTime);

            window.wavesurfer.clearMarkers();

            window.wavesurfer.addMarker({
                time: startTime,
                label: "START"
            })
        }else{
            endTime = window.wavesurfer.getCurrentTime();
            isStart = true;
            // console.log("end : " + endTime);

            window.wavesurfer.addMarker({
                time: endTime,
                label: "END"
            })

            region = window.wavesurfer.addRegion({
                start: startTime,
                end: endTime,
                color: randomColor(0.25)
            });
            // createClip(newRegion);      
            // clipInfo.set(newRegion.id, []);
            // sortClip();

            window.wavesurfer.clearMarkers();
            if(regionOver(region)) return

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
                    // true : setFrames
                    loadOneRegion(elm, false);
                })

                // img#tmpImage -> imgElement "alt" -> imageAlt.split("^")[0] -> if clipInfo.has(regionId) -> saveSkeleton
                var imageAlt = imgElement.getAttribute('alt');
                if (imageAlt != null) {
                    var imageInfo = imgElement.getAttribute('alt').split("^");
                    if (clipInfo.has(imageInfo[0])) {
                        saveSkeleton();
                    }
                }


                // set now clipNum value to nowClip
                nowClip = [];
                nowClip.push(clipNum);


                // show video with now created clip
                const nowClipId = $("#clips").children()[clipNum].getAttribute('id');
                let video = document.getElementById(nowClipId).querySelector('video')
                video.pause()
                clearCanvas();


                // editAnnotation, showNot, setFrames with the region info of nowClipId
                const clipRegion = wavesurfer.regions.list[nowClipId];
                //console.log(clipRegion)
                editAnnotation(clipRegion);
                showNote(clipRegion);
                // setFrames(clipRegion);


                // highlight now clip
                var clips = document.querySelectorAll('#clips div video');
                for (let elem of clips) {
                    elem.classList.remove('yellow');
                }
                var highlight = document.querySelector(`#clips #${nowClipId} video`);
                highlight.classList.add('yellow');


                // show loading view on frames
                const framesCon = document.querySelector(".frames-container");
                if(framesCon){
                    const framesBcRect = framesCon.getBoundingClientRect();
                    const frameLoader = document.querySelector(".loader");
                    frameLoader.style.top = framesBcRect.top + (framesBcRect.height - 120) / 2 + "px";
                    frameLoader.style.left = framesBcRect.left + (framesBcRect.width - 120) / 2 + "px";

                    frameLoader.classList.toggle("hide");

                    setTimeout(function () {
                        frameLoader.classList.toggle("hide");
                    }, 1000);
                }
            } else {
                console.log("sptRegion[setNum].length == 0")
            }
            // console.log(sptRegions);









        }
    },

    play: function() {
        if(document.querySelector(".tool>div>button:nth-child(1)").disabled) return alert('현재 동작하지 않는 기능입니다.')
        window.wavesurfer.playPause();
    },

    back: function() {
        window.wavesurfer.skipBackward();
    },

    forth: function() {
        window.wavesurfer.skipForward();
    },

    clipSave: function() {
        //해당 버튼의 타입이 disabled라면 동작을 막음
        if(document.getElementById("clibSave").disabled) return alert('현재 동작하지 않는 기능입니다.')
        document.getElementById("clibSave").click();
    },

    clipDelete: function() {
        if(document.getElementById("clibDelete").disabled) return alert('현재 동작하지 않는 기능입니다.')
        document.getElementById("clibDelete").click();
    },

    spaceBar: function() {
        return
    },

    'toggle-mute': function() {
        window.wavesurfer.toggleMute();
    }
};

// Bind actions to buttons and keypresses
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(e) {
        let map = {
            87: 'addRegion', // r
            66: 'play', //b
            32: 'spaceBar', // space
            37: 'back', // left
            39: 'forth', // right
            83: 'clipSave', // s
            68: 'clipDelete'
        };
        if(e.keyCode === 87 && (window.mode === '검수' || window.mode === '재검수')) return
        let action = map[e.keyCode];
        if (action in GLOBAL_ACTIONS) {
            if (document == e.target || document.body == e.target || e.target.attributes["data-action"]) {
                e.preventDefault();
            }
            //D일때는 66만 작동
            if(workStatus.value == 'D' && e.keyCode != 66) return
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