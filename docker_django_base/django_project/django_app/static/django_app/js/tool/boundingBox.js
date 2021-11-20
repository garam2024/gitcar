function DrawingBoundingBox(video, videoObj){
    this.element = document.querySelector('#bounding-canvas') 
    this.canvas = new fabric.Canvas(this.element)

    this.container = this.element.parentElement
    this.container.style.position = 'absolute'
    this.container.style.left = 0
    this.container.style.top = 0
    this.video = video
    this.videoObj = videoObj
    this.copyVideo = document.createElement('video')
    this.copyVideo.src = this.video.src
    this.copyVideo.classList.add('hidden')

    this.hiddenCanvas = document.createElement('canvas')
    this.hiddenCanvas.width = video.videoWidth
    this.hiddenCanvas.height = video.videoHeight
    this.hiddenCanvasCtx = this.hiddenCanvas.getContext('2d')

    this.hiddenImage = document.createElement('img')
    this.hiddenImage.style.width = this.video.videoWidth
    this.hiddenImage.style.height = this.video.videoHeight

    this.event()
}

DrawingBoundingBox.prototype.setSize = function(){
    videoSize = videoDimensions(this.video)
    
    this.container.style.width = videoSize.width
    this.container.style.height = videoSize.height

    this.canvas.setDimensions({
        width: videoSize.width, 
        height: videoSize.height
    })
}

DrawingBoundingBox.prototype.event = function(){
    let canvas = this.canvas
    let video = this.video

    canvas.on('mouse:down', e => {
        video.pause()

        if(!e.target){
            this.mouseStart = e
        }else{
            this.mouseStart = null
        }
    })

    canvas.on('mouse:up', e => {
        if(!workStatus.activeRegion.length){
            this.mouseStart = null
            return alert('현재 선택된 구간이 없습니다.')
        }

        if(!this.mouseStart) return
        if(this.mouseStart.e.offsetX === e.e.offsetX 
            && this.mouseStart.e.offsetY === e.e.offsetY) return
            
        let currentTime = video.currentTime
        
            
        let region = workStatus.activeRegionInfo()

        if(region.start + workStatus.tolerance > currentTime || currentTime > region.end + workStatus.tolerance){
            if(!comparison(region.start, region.end, currentTime)){
                return alert('선택된 구간 안에서 그려야 됩니다.')
            }
        }

        let left = Math.min(this.mouseStart.e.offsetX, e.e.offsetX)
        let top = Math.min(this.mouseStart.e.offsetY, e.e.offsetY)
        let width = Math.abs(e.e.offsetX - this.mouseStart.e.offsetX)
        let height = Math.abs(e.e.offsetY - this.mouseStart.e.offsetY)

        let variable = {
            left: left,
            top: top,
            width: width,
            height: height,
            currentTime: video.currentTime,
            region : region,
            currentTime: currentTime
        } 

        let rect = this.drawBoundingBox(variable, 'create')
    })
}

DrawingBoundingBox.prototype.drawBoundingBox = function(variable, option){
    let canvas = this.canvas
    let { left, top, width, height, region, currentTime } = variable
    let { label } = tooloption.toolSelectedOption

    let rect = new fabric.Rect({
        left: left,
        top: top,
        width: width,
        height: height,
        fill: label.fill,
        stroke: label.stroke,
        strokeWidth: label.strokeWidth,
        strokeUniform: true,
        hasRotatingPoint: false,
        lockRotation: true,
    })

    console.log(currentTime)
    let selectRegion    
    let l
    let start
    console.log(region)
    for(l = 0; l < region.divideDetail.length; l++){
        let where = region.divideDetail[l]

        if(comparison(where.start, where.end, currentTime)){
            start = where.start
            selectRegion = region.divideDetail[l]
            break
        }
    }

    // 만약 l 5일 경우 curretTime 과 가장 가까운 곳에 포함되게 함 

    let object = {
        left: left,
        top: top,
        width: width,
        height: height,
        currentTime: currentTime,
        reference: rect,
        id: BOUNDING_BOX_NAME  
    } 

    console.log(l)
    selectRegion.boundingBox.push(object)
    workStatus.labelList.push(selectRegion.boundingBox[selectRegion.boundingBox.length - 1])
    console.log(workStatus.labelList)
    canvas.add(rect)
    wavesurfer.regions.list[region.regionId].drag = false //드래그 안되게

    this.imageUpdate(region.regionId, l, start)
    .then(
        canvas.setActiveObject(rect)
    ).catch(
        err => {
            console.log(err)
        }
    )
    return rect
}

DrawingBoundingBox.prototype.imageUpdate = async function(id, num, start){
    workStatus.imageUpdate = 'run'
    let obj = this,
    copyVideo = this.copyVideo
    copyVideo.currentTime = start

    copyVideo.addEventListener('canplay', e => {
        const item = document.querySelector(`div[data-div-id=${id}]`),
        img = item.querySelectorAll('img')[num]
        obj.hiddenImage.src = this.canvas.toDataURL()

        copyVideo.width = item.offsetWidth
        copyVideo.height = item.offsetWidth * (obj.video.videoHeight/obj.video.videoWidth)
        obj.hiddenCanvasCtx.drawImage(copyVideo, 0, 0, obj.hiddenCanvas.width, obj.hiddenCanvas.height)

        obj.hiddenImage.addEventListener('load', e => {
            obj.hiddenCanvasCtx.drawImage(obj.hiddenImage, 0, 0, obj.hiddenCanvas.width, obj.hiddenCanvas.height)
            img.src = this.hiddenCanvas.toDataURL()
            obj.canvas.requestRenderAll()
            workStatus.imageUpdate = 'stop'
        }, { once: true })
    }, { once: true })

}

DrawingBoundingBox.prototype.showBoundingBox = function(currentTime){
    let region = workStatus.activeRegionInfo()

    if(workStatus.beforeWork){
        let hideLabel = workStatus.hideLabel(workStatus.beforeWork[0], workStatus.beforeWork[1])

        if(hideLabel){
            for(let j = 0; j < hideLabel.length; j++){
                hideLabel[j].reference.set({
                    visible: false,
                    selectable: false,
                    evented: false
                })
            }
        }
        workStatus.beforeWork = false
    }

    this.canvas.discardActiveObject() //선택 해제
    let showLabel = workStatus.activeLabel(currentTime)

    if(showLabel){
        for(let i = 0; i < showLabel.length; i++){
            showLabel[i].reference.set({
                visible: true,
                selectable: true,
                evented: true
            })
        }
        workStatus.beforeWork = [region, currentTime]
    }

    workStatus.outRegion(currentTime)
    this.canvas.requestRenderAll()
}

DrawingBoundingBox.prototype.updateBoundingBox = function(){

}

DrawingBoundingBox.prototype.deleteBoundingBox = function(box){

}

DrawingBoundingBox.prototype.loadBoundingBox = function(){

}

DrawingBoundingBox.prototype.savedBoundingBox = function(){

}

DrawingBoundingBox.prototype.renderAll = function(){
    this.canvas.requestRenderAll()
}

let boudnigBox
let wavesurfer = videoWave._wavesurfer

video.me.addEventListener('loadedmetadata', (event) => {
    boudnigBox = new DrawingBoundingBox(video.me, video)
    boudnigBox.setSize()    
}, { once: true })


wavesurfer.on('audioprocess', () => {
    $('#progressTime').text(formatTime(wavesurfer.getCurrentTime()))

    if(!workStatus.beforeWork) return

    let activeRegionInfo = workStatus.activeRegionInfo()
    if(workStatus.activeRegion.length){
        if(activeRegionInfo.start <= wavesurfer.getCurrentTime() && wavesurfer.getCurrentTime() <= activeRegionInfo.end){
            noticeCurrentTime(wavesurfer.getCurrentTime())
        }else{
            workStatus.outRegion(wavesurfer.getCurrentTime())
        }

        boudnigBox.renderAll()
    }else{
        return
    }
  
})

function noticeCurrentTime(currentTime){
    currentTime = parseFloat(currentTime)

    if(workStatus.activeRegion.length){
        boudnigBox.showBoundingBox(currentTime)
    }

    workStatus.nonOverlappingNumbers(workData)

    
}

