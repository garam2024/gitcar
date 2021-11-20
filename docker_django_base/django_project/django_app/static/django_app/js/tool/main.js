// Create an instance
var wavesurfer;
var indexValue = 0;

var regionInfo = new Map();

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
        WaveSurfer.cursor.create()
    ]
});

// Init & load audio file
    let mediaElt = document.querySelector('#orgVideo');
    wavesurfer.load(mediaElt);

    mediaElt.onload = () => {
        wavesurfer.current.backend.ac.resume()
    }

    // Load audio from existing media element
    wavesurfer.on('error', function (e) {
        console.warn(e);
    });


    wavesurfer.on('ready', function () {    
        wavesurfer.enableDragSelection({
            color: randomColor(0.25)
        });

        wavesurfer.util
            .fetchFile({
                responseType: 'json',
                url: '../media/result_annotation.json'
            })
            .on('success', function (data) {
                loadRegions(data);
                saveRegions();
            });
    });
    wavesurfer.on('region-click', function (region, e) {
        e.stopPropagation();
        // Play on click, loop on shift click
        e.shiftKey ? region.playLoop() : region.play();
        showFrames(region, 0);
    });
    wavesurfer.on('region-click', editAnnotation);

    wavesurfer.on('region-update-end', function () {
        saveClip();
    });
    wavesurfer.on('region-update-end', saveRegions);
    wavesurfer.on('region-updated', saveRegions);
    wavesurfer.on('region-removed', saveRegions);
    wavesurfer.on('region-in', showNote);
    wavesurfer.on('region-out', hideNote);

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

    const videoElement = document.querySelector('#orgVideo');

    videoElement.addEventListener("loadedmetadata", render);

    function render() {
        const canvas = document.querySelector('#canvas');
        const ctx = canvas.getContext('2d');

        ctx.drawImage(videoElement, 0, 0, 1200, 675);
        // 첫 번째 인자로 비디오를 넣어준다.
        requestAnimationFrame(render);
    }

/**
 * Save annotations to localStorage.
 */
function saveRegions() {
    localStorage.regions = JSON.stringify(
        Object.keys(wavesurfer.regions.list).map(function (id) {
            let region = wavesurfer.regions.list[id];

            return {
                start: region.start,
                end: region.end,
                attributes: region.attributes,
                data: { note: region.data.note, skeleton: region.data.skeleton }
            };
        })
    );
}

/**
 * Load regions from localStorage.
 */
function loadRegions(regions) {
    regions.forEach(function (region) {
        region.color = randomColor(0.25);
        wavesurfer.addRegion(region);
    });
}

/**
 * Extract regions separated by silence.
 */
function extractRegions(peaks, duration) {
    // Silence params
    let minValue = 0.0015;
    let minSeconds = 0.25;

    let length = peaks.length;
    let coef = duration / length;
    let minLen = minSeconds / coef;

    // Gather silence indeces
    let silences = [];
    Array.prototype.forEach.call(peaks, function (val, index) {
        if (Math.abs(val) <= minValue) {
            silences.push(index);
        }
    });

    // Cluster silence values
    let clusters = [];
    silences.forEach(function (val, index) {
        if (clusters.length && val == silences[index - 1] + 1) {
            clusters[clusters.length - 1].push(val);
        } else {
            clusters.push([val]);
        }
    });

    // Filter silence clusters by minimum length
    let fClusters = clusters.filter(function (cluster) {
        return cluster.length >= minLen;
    });

    // Create regions on the edges of silences
    let regions = fClusters.map(function (cluster, index) {
        let next = fClusters[index + 1];
        return {
            start: cluster[cluster.length - 1],
            end: next ? next[0] : length - 1
        };
    });

    // Add an initial region if the audio doesn't start with silence
    let firstCluster = fClusters[0];
    if (firstCluster && firstCluster[0] != 0) {
        regions.unshift({
            start: 0,
            end: firstCluster[firstCluster.length - 1]
        });
    }

    // Filter regions by minimum length
    let fRegions = regions.filter(function (reg) {
        return reg.end - reg.start >= minLen;
    });

    // Return time-based regions
    return fRegions.map(function (reg) {
        return {
            start: Math.round(reg.start * coef * 100) / 100,
            end: Math.round(reg.end * coef * 100) / 100
        };
    });
}

/**
 * Random RGBA color.
 */
function randomColor(alpha) {
    return (
        'rgba(' +
        [
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            alpha || 1
        ] +
        ')'
    );
}

/**
 * Edit annotation for a region.
 */
function editAnnotation(region) {
    let form = document.forms.edit;
    form.style.opacity = 1;
    (form.elements.start.value = Math.round(region.start * 100) / 100),
    (form.elements.end.value = Math.round(region.end * 100) / 100);
    (form.elements.attributes.value = region.attributes),
    form.elements.note.value = region.data.note || '';
    form.elements.skeleton.value = region.data.skeleton || '';

    form.onsubmit = function (e) {
        e.preventDefault();
        region.update({
            start: form.elements.start.value,
            end: form.elements.end.value,
            attributes: form.elements.attributes.value,
            data: {
                note: form.elements.note.value,
                skeleton: form.elements.skeleton.value
            }
        });
        form.style.opacity = 0;
    };
    form.onreset = function () {
        form.style.opacity = 0;
        form.dataset.region = null;
    };
    form.dataset.region = region.id;
}

/**
 * Display annotation.
 */
function showNote(region) {
    if (!showNote.el) {
        showNote.el = document.querySelector('#subtitle');
    }
    showNote.el.style.color = 'Red';
    showNote.el.style.fontSize = 'large';
    showNote.el.textContent = region.data.note;
}

function hideNote(region) {
    if (!hideNote.el) {
        hideNote.el = document.querySelector('#subtitle');
    }
    hideNote.el.style.color = 'Red';
    hideNote.el.style.fontSize = 'large';
    hideNote.el.textContent = '–';
}

class Image {
    constructor(time, dataURL) {
        this.time = time;
        this.dataURL = dataURL;
    }
}

function saveClip() {

    document.querySelector("#clips").innerHTML = '';
    Object.keys(wavesurfer.regions.list).map(function (id) {
        console.log(id)
        let region = wavesurfer.regions.list[id];

        let clips = document.querySelector("#clips");
        let video = document.createElement('video');
        video.id = region.id;
        video.style = 'display:block; margin: 0 auto; width: 200px';
        video.src = '../media/my_video.mp4#t=' + region.start + ',' + region.end;
        video.type = 'video/mpeg';

        video.addEventListener('mouseover', function () {
            console.log('asd')
            this.src = '../media/my_video.mp4#t=' + region.start + ',' + region.end;
            this.play();
        });
        video.addEventListener('mouseout', function () {
            this.pause();
            this.currentTime = region.start;
        });
        video.addEventListener('click', function (e) {
            e.stopPropagation();
            // Play on click, loop on shift click
            e.shiftKey ? region.playLoop() : region.play();

            this.pause();
            this.currentTime = region.start;

            editAnnotation(wavesurfer.regions.list[this.id]);
            showNote(wavesurfer.regions.list[this.id]);
            showFrames(wavesurfer.regions.list[this.id], 0);

            indexValue = 0;
            document.getElementById("preBtn").disabled = true;
            document.getElementById("nextBtn").disabled = false;
            
            if(document.querySelector('.canvas-container') != null){
                let canvasArea = document.getElementById('canvas-area');
                canvasArea.appendChild(document.getElementById('c'));
                $("div.canvas-container").remove();
            }

            let labeler = new ImageLabeler(document.getElementById('demo'));
        });

        clips.appendChild(video);
    })
}

async function showFrames(region, indexNum) {

    var video = document.querySelector('video#' + region.id);

    var orgVideo = document.querySelector('#orgVideo');
    var canvas = document.querySelector('#canvas');
    // var frames = document.querySelector('#frames');
    var context = canvas.getContext('2d');

    var frameList = [];
    if (regionInfo.has(region.id)) {
        frameList = regionInfo.get(region.id);

        orgVideo.currentTime = frameList[indexNum].time;
        var imgElement = document.querySelector('#tmpImage');

        imgElement.setAttribute('src', frameList[indexNum].dataURL);

    } else {
        var start = region.start;
        var end =  region.end;

        for (let index = 0; index < 5; index++) {

            video.currentTime = start + index * (end - start) / 5;

            await sleep(500);
            context.drawImage(video, 0, 0, 1200, 675);

            var dataURL = canvas.toDataURL('image/jpeg');
            frameList.push(new Image(video.currentTime, dataURL));
        }

        var imgElement = document.querySelector('#tmpImage');
        imgElement.setAttribute('src', frameList[0].dataURL);

        regionInfo.set(region.id, frameList);

    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function ClickNextBtn() {
    var preBtn = document.getElementById("preBtn");
    var nextBtn = document.getElementById("nextBtn");
    
    if (indexValue == 0)
        preBtn.disabled = false;
    indexValue += 1;
    
    console.log(indexValue);
    if (indexValue <= 4) {
        Object.keys(wavesurfer.regions.list).map(function (id) {
            showFrames(wavesurfer.regions.list[id], indexValue)
        });
        if (indexValue == 4) {
            nextBtn.disabled = true;
        } else {

            nextBtn.disabled = false;
        }
    }
}

function ClickPreBtn() {
    var preBtn = document.getElementById("preBtn");
    var nextBtn = document.getElementById("nextBtn");
   
    if (indexValue == 4)
        nextBtn.disabled = false;
    indexValue -= 1;
    console.log(indexValue);
    if (indexValue >= 0) {
        Object.keys(wavesurfer.regions.list).map(function (id) {
            showFrames(wavesurfer.regions.list[id], indexValue)
        });
        if (indexValue == 0) {
            preBtn.disabled = true;
        } else {
            preBtn.disabled = false;
        }
    }
}

/**
 * Bind controls.
 */

window.GLOBAL_ACTIONS['delete-region'] = function () {
    let form = document.forms.edit;
    let regionId = form.dataset.region;
    if (regionId) {
        wavesurfer.regions.list[regionId].remove();
        form.reset();
    }
};

window.GLOBAL_ACTIONS['export'] = function () {

    let dataStr = localStorage.regions;
    let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    let exportFileDefaultName = 'result_annotation.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};
