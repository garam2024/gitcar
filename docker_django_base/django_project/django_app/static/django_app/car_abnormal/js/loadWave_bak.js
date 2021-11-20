

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
saveBtn.addEventListener('keydown', function(event) {
        if (event.keyCode === 32) {
        event.preventDefault();
    };
});


fileLoad.addEventListener('click', e => {
    inputFile.click()
})

fileLoad.addEventListener('keydown', function(event) {
        if (event.keyCode === 32) {
        event.preventDefault();
    };
});

inputFile.addEventListener("change", function(){

    const canvasArea = document.querySelector('#canvas-area')
    const editingArea = document.querySelector('.editing-area')

    removeLabelRegion();
    removeClipRegion();
    removeSensor();
    removeCanvas();

    const file = inputFile.files[0];
    const videourl = URL.createObjectURL(file);

    orgVideo.setAttribute("src", videourl);
    orgVideo.setAttribute('alt', file.name);

    orgVideo.classList.remove('active')
    fileLoad.querySelector('span').textContent = file.name
    videoName = file.name;  


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


    // Load audio from existing media element
        let mediaElt = document.querySelector('#demo video');

        wavesurfer.on('error', function (e) {
            console.warn(e);
        });

        wavesurfer.load(mediaElt);

        wavesurfer.on('ready', function () {
            canvasArea.classList.remove('disable')
            wavesurfer.enableDragSelection({
                drag: false,
                resize : false,
                color: randomColor(0.25)
            });

            appStatus.isVideo = true

            const h2 = editingArea.querySelector('h2')
            const _clips = document.querySelector('#clips')
            const _occupantArea = document.querySelector('#occupantArea') 
            const _labelingArea = document.querySelector('#labelingArea')

            _clips.style.height = (editingArea.offsetHeight + 30) - (h2.offsetHeight) + 'px'

            _occupantArea.style.height = (editingArea.offsetHeight/2 + 15) - (h2.offsetHeight + 47) + 'px'

            _labelingArea.style.height = (editingArea.offsetHeight/2 + 15) - (h2.offsetHeight + 47) + 'px'
        });

        wavesurfer.on('region-update-end', function(region, e){
            //saveClip()
            createClip(region)
                .then(sortClip())
                .catch(err => { throw new Error(err) })

            if(Object.keys(wavesurfer.regions.list).length>1){
                regionOver(region)
            }
        });
        // wavesurfer.on('region-updated', function(region,e){
        //     if(Object.keys(wavesurfer.regions.list).length>1){
        //         regionOver(region);
        //     }

        // });
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

        orgVideo.addEventListener("loadedmetadata", render);

        function render() {
            if(orgVideo.videoHeight > orgVideo.videoWidth){
                videoHeight = orgVideo.videoHeight > 800 ||  orgVideo.videoWidth > 800 ? 800 : orgVideo.videoHeight ;
                videoWidth = orgVideo.videoHeight > 800 ||  orgVideo.videoWidth > 800  ? 800 * (orgVideo.videoWidth/orgVideo.videoHeight) : orgVideo.videoWidth ;
                
            }else if(orgVideo.videoHeight < orgVideo.videoWidth){
                videoHeight = orgVideo.videoHeight > 800 ||  orgVideo.videoWidth > 800 ? 800 * (orgVideo.videoHeight/orgVideo.videoWidth) : orgVideo.videoHeight ;
                videoWidth = orgVideo.videoHeight > 800 ||  orgVideo.videoWidth > 800  ? 800 : orgVideo.videoWidth ;
            }else{
                videoHeight = orgVideo.videoHeight > 800 ||  orgVideo.videoWidth > 800 ? 800 : orgVideo.videoHeight ;
                videoWidth = orgVideo.videoHeight > 800 ||  orgVideo.videoWidth > 800  ? 800 : orgVideo.videoWidth ;
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
    })