
function setClipButton(btnLen){
    var str_html = '';
    
    for (var i = 1; i <= btnLen; i++) {
        var html_btn = '<button id="sets" class="btn btn-default btn-small">Set {}</button>';
        html_btn = html_btn.replace(/{}/g, i);
        str_html = str_html + html_btn + '\n';
    }
    
    $('#div_btn').html(str_html);
    
    setMarkInit()
}

let setBtnRun = false

$(document).on("click", "#sets", async function(e){
    if(setBtnRun) return
    setBtnRun = true

    var i = $(this).index();

    var setBtns = document.querySelectorAll('#sets');
    for (var j=0; j<setBtns.length; j++){
        setBtns[j].classList.remove('yellow');
    }

    e.target.classList.add('yellow');

    if(sptRegions[i].length > 0){

        nowSet = [];
        nowSet.push(i);

        clearCanvas();
        resetForm();
        resetFrames();
        resetClips();

        saveRegions(sptRegions[i]);

        nowClip = [0]
        let isNowClip = false;
         for(var p=0; p<sptRegions[nowSet[0]].length; p++){
            if(p == nowClip[0]){
                isNowClip = true
            }else{
                isNowClip = false
            }
            await loadOneRegion(sptRegions[nowSet[0]][p], isNowClip)
        }

        interfaceApp.bookmark.draw()


        var imageAlt = imgElement.getAttribute('alt');
        if (imageAlt != null) {
            var imageInfo = imgElement.getAttribute('alt').split("^");
            if(clipInfo.has(imageInfo[0])){
                //saveSkeleton();
            }  
        }

        const firstClipId = $("#clips").children().first().attr('id');
         console.log("firstClipId---------------");
        console.log(firstClipId)
        let video = document.getElementById(firstClipId).querySelector('video')
        video.pause()
        clearCanvas();

        const clipRegion = wavesurfer.regions.list[firstClipId];

        editAnnotation(clipRegion);
        showNote(clipRegion);

        util.clipHi(firstClipId)

        var clipsObject = document.querySelectorAll('#clips > div video')
        var yellow_num;

        for(var k=0; k<clipsObject.length; k++){
            console.log(clipsObject[k].classList)
            if(clipsObject[k].classList.contains('yellow')){
                yellow_num = k;
                break;
            }
        }
        
        nowClip = [];
        nowClip.push(yellow_num);

        const nowClipId = $("#clips").children()[0].getAttribute('id');
        var clips = document.querySelectorAll('#clips div video');
        for (let elem of clips) {
            elem.classList.remove('yellow');
        }
        var highlight = document.querySelector(`#clips #${nowClipId} video`);
        highlight.classList.add('yellow');

        
        var clipsDiv = document.querySelectorAll('#clips .clip-status')

        for(let z = 0; z < sptRegions[i].length; z++){
            if(!sptRegions[i][z].data.status){
                continue
            }else{
                let status = sptRegions[i][z].data.status
                clipStatusMark(clipsDiv[z], status)
            }
        }

        setMark(i, setCheck(sptRegions[i]))

        const framesCon = document.querySelector(".frames-container");
        if(framesCon){
            const framesBcRect = framesCon.getBoundingClientRect();
            const frameLoader = document.querySelector(".loader");
            frameLoader.style.top = framesBcRect.top+(framesBcRect.height-120)/2+"px";
            // console.log(bcRect.top)
            frameLoader.style.left = framesBcRect.left+(framesBcRect.width-120)/2+"px";

            frameLoader.classList.toggle("hide");

            setTimeout(function(){
                frameLoader.classList.toggle("hide");
            },1000);
        }
    }

    setMarkInit()
    viewNowClipRejection()
    setBtnRun = false
})


function setCheck(data, index){
     console.log(data)
    let count = 0
    let sets = document.querySelectorAll('#sets')

    for(let index = 0; index < data.length; index++){
        if(data[index].data.status){
            if(data[index].data.status === '반려'){
                return '반려'
            }else if(data[index].data.status === '완료'){
                count++
            }
        }
    }

    if(count !== data.length){
        return '전체 제거'
    }else{
        if(sets[index]){
            console.log(sets[index])
            if(sets[index].classList.contains('rejection')){
                sets[index].classList.remove('rejection')
                sets[index].classList.add('complete')
            }
        }
        return '완료'
    }
}

function setMark(num, status){
    if(!status) return
    let sets = document.querySelectorAll('#sets')
    console.log(status)
    switch(status){
        case '반려':
            sets[num].classList.add('rejection')
        break
        case '완료 제거':
            if(sets[num].classList.contains('complete')){
                sets[num].classList.remove('complete')
            }
        break
        case '완료':
            sets[num].classList.add('complete')
        break
        case '반려 제거':
            if(sets[num].classList.contains('rejection')){
                sets[num].classList.remove('rejection')
            }
        break
        case '전체 제거':
            if(sets[num].classList.contains('complete')){
                sets[num].classList.remove('complete')
            }
            if(sets[num].classList.contains('rejection')){
                sets[num].classList.remove('rejection')
            }
        break
    }
}

function setMarkInit(){
    var sets = document.querySelectorAll('#sets') 
    console.log(sets)
    for(let i = 0; i < sets.length; i++){
        setMark(i, setCheck(sptRegions[i], i))

        if(sptRegions[i].length === 0){
            document.querySelectorAll('#sets')[i].remove()
        }
    }
}