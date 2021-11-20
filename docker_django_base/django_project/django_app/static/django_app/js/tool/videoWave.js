let videoWave =  (function(videoObj, video, copyVideo){
    copyVideo.src = video.src
    copyVideo.classList.add('hidden')

    // video.addEventListener('loadedmetadata', (event) => {
    //     console.log('The duration and dimensions ' + 'of the media and tracks are now known. ')
    // })
    
    let wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        height: '80',
        backend: 'MediaElement',
        mediaType: 'video',
        scrollParent: true,
        normalize: true,
        splitChannels: false,

        plugins: [
            WaveSurfer.regions.create({
                dragSelection: {
                    
                },
                color: workStatus.regionColor,

                regions: [
                    //!!! 로드 시 사용 !!!
                    /*  예시 생성 됨
                        {
                            id: "your id",   
                            start: 60,
                            end: 80,
                            loop: false,
                            color: '#cccccc'
                        }
                    
                    */
                ],
            }),

            WaveSurfer.timeline.create({
                wavesurfer: this,
                container: '#waveform-timeline'
            }),

            WaveSurfer.minimap.create({
                height: 30,
                waveColor: '#ddd',
                progressColor: '#999'
            }),
        ],
    })

    async function init(){
        wavesurfer.load(video)
    }

    function regionHandler(){
        wavesurfer.on('region-created', region => {
            let _region = document.querySelector(`region[data-id=${region.id}]`),
            handle = _region.querySelectorAll('handle')
            handle[0].style.left = '1px'
            handle[1].style.right = '1px'

        })

        wavesurfer.on('region-update-end', region => {
            createRegion(region)
        })

        wavesurfer.on('region-click', region => {
            playDivide(region, null, 'region')
            video.addEventListener('canplay', e => {
                noticeCurrentTime(video.currentTime)
            }, { once: true })
        })

        const videoTool = document.querySelector('.video-tool')
        videoTool.addEventListener('click', e => {
            if(e.target.tagName !== 'ION-ICON') return
            playPauseAction()
        })

        const wavesurferContainer = document.querySelector('.wavesurfer-container')
        wavesurferContainer.addEventListener('click', e => {
            let wave = e.target.closest('wave')
            if(!wave) return

            video.addEventListener('canplaythrough', e => {
                console.log('canplaythrough')
                $('#progressTime').text(formatTime(video.currentTime))
                if(workStatus.activeRegion.length){
                    boudnigBox.showBoundingBox(video.currentTime)
                }
            }, { once: true })
        })

        // Show clip duration
        wavesurfer.on('ready', () => {
            console.log('작동')
            $('#endTime').text(formatTime(wavesurfer.getDuration()))

            const videoListContainer = document.querySelector('.crop-list-container')
            videoListContainer.style.height = 'calc(100vh - 32px)'

            videoListContainer.addEventListener('click', e => {
                let item

                if(e.target.nodeName === 'IMG'){
                    item = e.target.parentNode.parentNode,
                    arr = [...item.querySelectorAll('img')],
                    idx = arr.findIndex(arr => arr === e.target),
                    region = workData.regionList.find(array => array.regionId === item.dataset.divId)
                    
                    playDivide(region, idx, 'img')

                }else if(e.target.classList.contains('outer')){
                    item = e.target.parentNode
                    region = workData.regionList.find(array => array.regionId === item.dataset.divId)

                    playDivide(region, null, 'outer')
                }else{
                    return
                }
            })
        })
    }

    async function playDivide(region, idx, click){
        let render

        if(workStatus.activeRegion.length){
            render = await workStatus.regionChange(region)
        }

        let id = region.regionId? region.regionId : region.id 

        const regionEl = document.querySelector(`region[data-id=${id}]`)
        const div = document.querySelector(`div[data-div-id=${id}]`)

        workStatus.selectCancel()
        .then(
            wavesurfer.regions.list[id].color = `rgb(241, 82, 82, 0.2)`,
            workStatus.activeRegion = [regionEl, div],
            regionEl.style.backgroundColor = `rgb(241, 82, 82, 0.2)`,
            div.classList.add('active'),
    
            regionEl.parentNode.append(regionEl)
        ).catch(err => {
            throw new Error(err)
        })

        if(idx === 0? true : idx){
            const image = document.querySelectorAll(`div[data-div-id=${id}] img`)
            video.pause()

            if(idx === 0){
                video.currentTime = region.start
                noticeCurrentTime(region.start)
                // wavesurfer.play(region.start, region.divideDetail[idx])
            }else{
                video.currentTime = region.divideDetail[idx].start
                noticeCurrentTime(region.divideDetail[idx].start)
                // wavesurfer.play(region.divide[idx - 1], region.divideDetail[idx])
            }

            // wavesurfer.pause()
        }

        switch(click){
            case 'region':
                return div.scrollIntoView({ behavior: "smooth" })
                // noticeCurrentTime(time)
            break
        }

        if(render) boudnigBox.renderAll()
        $('#progressTime').text(formatTime(video.currentTime))
    }

    function createRegion(region){

        let length = region.start > region.end? region.start - region.end : region.end - region.start
        let sum
        let detail
        
        let variable = {
            regionId: region.id,
            start: parseFloat(region.start.toFixed(6)),
            end: parseFloat(region.end.toFixed(6)),
            divide: [],
            divideDetail: [],
        }

        for(let k = 0; k < workStatus.imageDivideRepeat; k++){
            if(k === 0){
                sum = parseFloat(region.start) + length/workStatus.imageDivideRepeat
                detail = {
                    start: region.start,
                    end: sum,
                    time: sum - region.start,
                    // middle: (region.start + sum)/2
                }

            }else if(k === workStatus.imageDivideRepeat){
                sum = parseFloat(region.end)
                detail = {
                    start: variable.divide[k - 1],
                    end: region.end,
                    time: region.end - variable.divide[k - 1],
                    // middle: (variable.divide[k - 1] + sum)/2
                }

            }else{
                sum += length/workStatus.imageDivideRepeat
                detail = {
                    start: variable.divide[k - 1],
                    end: sum,
                    time: sum - variable.divide[k - 1],
                    // middle: (variable.divide[k - 1] + sum)/2
                }
            }

            detail.boundingBox = []
            detail.start = parseFloat(detail.start.toFixed(2))
            detail.end = parseFloat(detail.end.toFixed(2))
            detail.time = parseFloat(detail.time.toFixed(2))
            // detail.middle = parseFloat(detail.middle.toFixed(2))

            variable.divide.push(sum)
            variable.divideDetail.push(detail)
        }
    
        let idx = workData.regionList.findIndex(array => array.regionId === variable.regionId)
        delete variable.divide

        if(idx !== -1){ // 존재 업데이트
            workData.regionList[idx] = variable
            createImageField.update(region, variable.divideDetail)
        }else{ // 생성
            workData.regionList.push(variable)
            createImageField.export(region, variable.divideDetail)

            workStatus.divideLength++
            dataBinding({ divideLength: workStatus.divideLength })
        }

        console.log(workData)
    }

    function playPauseAction(action){
        if(!wavesurfer.isPlaying()){
            wavesurfer.play()
        }else{
            wavesurfer.pause()
        }
    }

    wavesurfer.on('play', () => {
        const playPause = document.querySelector('.play-pause') 
        playPause.classList.add('active')
    })
    wavesurfer.on('pause', () => {
        const playPause = document.querySelector('.play-pause') 
        playPause.classList.remove('active')
    })

    init()
    .then(resolve => {
        regionHandler()
        createImageField = new CreateImage()
    })
    .catch(err => {
        throw new Error('에러:' + err)
    })

    let createImageField

    function CreateImage(){
        this.canvas = document.createElement('canvas') 
        this.copyVideo = copyVideo
        this.canvas.classList.add('hidden')
        this.canvas.id = 'imageDraw'
        this.canvas.width = video.videoWidth
        this.canvas.height = video.videoHeight
        this.ctx = this.canvas.getContext('2d')
    }

    CreateImage.prototype.export = async function(region, time){
        if(workStatus.imageCreating === 'run'){
             workStatus.drawingList++
             workStatus.drawingParameter.push({region, time})
             return
        }

        console.log(time)

        workStatus.imageCreating = 'run'
        // let repeatStart = 1
        let count = 0
        // let repeatEnd = time.length

        let cropList = document.querySelector('.crop-list')
        let rootDiv

        rootDiv = document.createElement('div')
        rootDiv.className = 'item'
        rootDiv.setAttribute('data-div-id', region.id)

        let outerDiv = document.createElement('div')
        outerDiv.className = 'outer'

        const obj = this

        cropList.append(rootDiv)

        function exportInner(){
            if(count === 0){
                obj.copyVideo.currentTime = region.start
            }else if(count > workStatus.imageDivideRepeat - 1){
                workStatus.imageCreating = 'stop'
                return obj.remainingWork(workStatus.drawingList, workStatus.drawingParameter)
            }else{
                obj.copyVideo.currentTime = time[count].start
            }

            let img = document.createElement('img')
            img.className = 'thumnail'
        
            outerDiv.append(img)
            rootDiv.append(outerDiv)

            obj.copyVideo.addEventListener('canplaythrough', e => {
                drawImage(obj, rootDiv, img)
                .then(
                    count++, exportInner()
                    // createImageField.checkSrc()
                    // .then(
                    //     resolve => {
                    //         if(workStatus.addSrc === 'run') return
                    //         let idxList = []
        
                    //         for(let j = 0; j < resolve.length; j++){
                    //             let idx = workData.regionList.findIndex(arr => arr.id === resolve[j])
                    //             idxList.push(idx)
                    //         }
        
                    //         if(idxList.length) return addSrc(obj, idxList)
                    //     }
                    // )
                    // .catch(err => {throw new Error('에러' + err)})
                )
                .catch(err => {throw new Error('너무 많은 region 생성, 업데이트 시 작업이 정상 출력되지 않을 수 있습니다.')})
            }, { once: true })
        }

        exportInner()
    }

    CreateImage.prototype.remainingWork = function(length, arr){ //남은 작업
        if(length){
            workStatus.drawingList--
            this.export(arr[0].region, arr[0].time)
            arr.shift()
            console.log(workStatus.drawingParameter)
        }else{
            return
        }
    }

    //만약에 씹히면 만들겠음
    // function addSrcFn(obj, list){
    //     if(workStatus.addSrc === 'run') return
    //     workStatus.addSrc = 'run'
    //     let count = 1
        
    //     function updateImage(){ //씹히면 동작
    //         this.copyVideo.oncanplay = () => {
    //             canvas = obj.canvas
    //             let _div = document.querySelector(`[data-div-id='${list[count - 1]}]`)

    //             canvas.width = _div.offsetWidth
    //             canvas.height = _div.offsetWidth * (video.videoHeight/video.videoWidth)

    //             let img = _div.querySelector('.thumnail')

    //             obj.ctx.drawImage(obj.copyVideo, 0, 0, canvas.width, canvas.height)
    //             img.src = canvas.toDataURL()

    //             if(list.length === count){
    //                 return workStatus.addSrc = 'stop'
    //             }else{
    //                 updateImage()
    //                 count++
    //             }
    //         }
    //     }

    //     updateImage()
    // }//만약에 씹히면 만들겠음

    async function drawImage(obj, div, imgEl){
        canvas = obj.canvas
        canvas.width = div.offsetWidth
        canvas.height = div.offsetWidth * (video.videoHeight/video.videoWidth)
        obj.ctx.drawImage(obj.copyVideo, 0, 0, canvas.width, canvas.height)
        imgEl.src = canvas.toDataURL()
    }

    CreateImage.prototype.update = async function(region, array){
        let count = 0
        // let updatelength = array.length

        const obj = this

        const div = document.querySelector(`[data-div-id='${region.id}']`),
        img = div.querySelectorAll('img')

        function updateDriving(){
            if(count === 0){
                obj.copyVideo.currentTime = region.start
            }else if(count > workStatus.imageDivideRepeat - 1){
                return
            }else{
                obj.copyVideo.currentTime = array[count].start
            }

            obj.copyVideo.addEventListener('canplay', e => {
                drawImage(obj, div, img[count])
                .then(
                    count++, updateDriving()
                ).catch(err => {
                    // //src 에러 일 때
                    // console.log('너무 많은 크롭 동작 시 작업이 올바르게 출력되지 않을 수 있습니다.')
                    // if(img[count]) img[count].remove() 
                    // count--, updateDriving() <- 무한 루프
                    throw new Error('너무 많은 region 생성, 업데이트 시 작업이 정상 출력되지 않을 수 있습니다.')
                })
            }, { once: true })
        }

        updateDriving()
    }

    CreateImage.prototype.load = async function(){
        // wavesurfer.regions = [...array]
    }

    //사용 X
    // CreateImage.prototype.checkSrc = async function(){
    //     const cropListImg = document.querySelectorAll('.crop-list img')
    //     let hasNotSrc = []

    //     for(let i = 0; i < cropListImg.length; i++){
    //         let check = cropListImg[i].src? true : false
    //         if(!check) hasNotSrc.push(cropListImg[i].parentElement.dataset.divId)
    //     }
        
    //     if(hasNotSrc.length){
    //         // throw new Error('생성되지 않은 이미지가 있습니다.' + hasNotSrc.toString() + '...')
    //     }
    //     return hasNotSrc
    // }

    // ▲ 밀린 작업이 있나 없나 체크 후 있으면 없는 부분 생성
    //src 없는 것 체크

    //삭제
    /*
        cropItem.remove()
        wavesurfer.regions.list[regionId].remove()
        work 배열에서도 삭제
    */

    //줌 기능 추가할 것
    //임시


    return {
        _wavesurfer: wavesurfer,

        playPauseFn: function(boolean){
            playPauseAction()
        }  
    }

})(video, video.me, video.copyVideo)
