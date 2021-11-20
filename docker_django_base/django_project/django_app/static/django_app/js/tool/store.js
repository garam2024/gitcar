const BOUNDING_BOX_NAME = 'boundingBox_' //id 
let bounding_box_count = 0
/*
comparison(region.divideDetail[index].start, region.divideDetail[index].end, currentTime)
*/

let workData = {
    id: 'projectId',
    regionList: [ //
        //{} < - 구간 정보, 구간 라벨 정보
    ],
    scaleX: '', //비디오 원본 크기에 따른 스케일X
    scaleY: '', //비디오 원본 크기에 따른 스케일Y
    path: '', //비디오 경로
}

let workStatus = {
    tolerance: 0.01,
    imageCreating: 'stop', //이미지 생성 중이면 run 아니면 stop
    imageUpdate: 'stop',
    addSrc: 'stop', //src 없는 거 있을 때 사용하려고 만듬
    divideLength: 0, //생성된 region 개수
    activeRegion: [], //현재 선택한 region <- 요소를 담음 wave, 오른쪽 이미지 박스
    activeId: function(){ //현재 region의 id
        if(!this.activeRegion) return
        return id = this.activeRegion[0].dataset.id
    },
    activeRegionInfo: function(){ //현재 region 정보 찾기
        if(!this.activeRegion) return
        return workData.regionList.find(array => array.regionId === this.activeId())
    },
    activeLabel: function(currentTime){ //현재 region에서 curretTime에 라벨이 있나 확인
        let region = this.activeRegionInfo() //현재 region 정보 찾기
        let index = this.belongRegionIndex(region, currentTime)
        if(index != 0 && !index) return
        if(index < 0 || index > workStatus.imageDivideRepeat - 1) return  
        return region.divideDetail[index].boundingBox? region.divideDetail[index].boundingBox : false
    },
    hideLabel: function(region, currentTime){ //해당 region 해당 구간의 hide
       let index = this.belongRegionIndex(region, currentTime)
       return region.divideDetail[index].boundingBox? region.divideDetail[index].boundingBox : 0
    },
    findRegion: function(region){ // region 찾기
        return workData.regionList.find(array => array.regionId === region.regionId)
    },
    belongRegionIndex: function(region, currentTime){ //active 된 region에서 curretTime이 어디에 속하는 지
        let index
        if(!region) return
        for(index = 0; index < region.divideDetail.length; index++){
            if(comparison(region.divideDetail[index].start, region.divideDetail[index].end, currentTime)){
                return index
            }
        }
    },
    outRegion: function(currentTime){ // 액티브된 region의 영역 밖일 때
        let region = workStatus.activeRegionInfo()

        if(region.start > currentTime || region.end < currentTime){
            this.curretRegionHide(region)
        }
    },
    regionChange: async function(region){ //region만 변화 했을 경우 이전 region hide
        //선택한 region이 이전 과 같은지 확인 후 작동
        let beforeRegion = this.activeRegionInfo()

        if(!beforeRegion) return
        if(beforeRegion.regionId !== region.regionId){
            this.curretRegionHide(beforeRegion)
            return true
        }
        return false 
    },
    curretRegionHide: function(region){ //해당 region 전부 hide
        for(let j = 0; j < region.divideDetail.length; j++){
            for(let k = 0; k < region.divideDetail[j].boundingBox.length; k++){
                region.divideDetail[j].boundingBox[k].reference.set({
                    visible: false,
                    selectable: false,
                    evented: false
                })
            }
        }
    },
    selectCancel: async function(){ //선택 해제
        if(workStatus.activeRegion.length){
            console.log(workStatus.activeRegion)
            let beforeRegion = this.activeRegionInfo()

            wavesurfer.regions.list[workStatus.activeRegion[0].dataset.id].color = workStatus.regionColor
            workStatus.activeRegion[0].style.backgroundColor = 
            workStatus.regionColor
            workStatus.activeRegion[1].classList.remove('active')
            workStatus.activeRegion = []

            return beforeRegion
        }
    },
    nonOverlappingNumbers: function(project){ //겹치지 않는 번호 만들기
        // console.log(project.regionList)
        // console.log(project.regionList.length)
        

        // console.log(project.regionList.divideDetail.length) //regionList[num] 5
        // console.log(project.regionList.divideDetail.boundingBox.length) //divideDetail[num]
        // // let arr = [project.regionList]

    },
    labelList: [],
    beforeWork: null,
    regionColor: 'rgba(0, 0, 0, 0.2)',
    drawingList: 0, //남은 작업 횟수
    drawingParameter: [], //남은 작업 parameter
    updateList: 0, //남은 업데이트 횟수
    updateParameter: [], //남은 업데이트 parameter
    imageDivideRepeat: 5 //이미지 생성 횟수
}

let tooloption = {
    labelSelectList: [ //부위
        '얼굴', '손', '몸'
    ],

    emotionList: [ //감정
        '분노', '기쁨', '행복'
    ],

    actionList: [ //행동
        '행동...'
    ],
    
    toolSelectedOption: {
        label: {
            stroke: '#E71D36',
            strokeWidth : 3,
            fill: 'transparent' 
        },

        video: {

        }
    }
}

let video = {
    me: document.querySelector('.video-form video'),
    copyVideo: document.createElement('video')
}

let submitData = {}

function dataBinding(status){
    const divideLength = document.querySelector('#divideLength')
    
    if(status['divideLength'] || status['divideLength'] === 0){
        divideLength.textContent = status.divideLength
    }
}

let prjButtonFn = { //blending-tool
    tool: document.querySelector('.blending-tool'),

    active: function(){
        this.tool.addEventListener('click', e => {
            switch(e.target.id){
                case 'deleteRegion': 
                    prjButtonFn.deleteRegion()
                    break
                case 'selectedLabelDelete': 
                    console.log('미완')
                    break
                case 'selectedRegionRelese': 
                    workStatus.selectCancel()
                    .then(resolve => {
                        workStatus.curretRegionHide(resolve)
                        boudnigBox.renderAll()
                    })
                    .catch(err => {

                    })
                    break
                case false:
                    break
            }
        })
    }
}

prjButtonFn.active()
prjButtonFn.deleteRegion = function(){
    console.log(workStatus.divideLength)
    if(workStatus.activeRegion.length){
        let id = workStatus.activeRegion[0].dataset.id
        wavesurfer.regions.list[id].remove()
        document.querySelector(`div[data-div-id=${id}]`).remove()

        workStatus.divideLength === 0? workStatus.divideLength : workStatus.divideLength--   
        workStatus.activeRegion = []

        let idx = workData.regionList.findIndex(arr => arr.id === id)
        workData.regionList.splice(idx, 1)

        dataBinding({ divideLength: workStatus.divideLength })
    }
}

video.me.onload = function() {
    // var context = new AudioContext()
    // Setup all nodes
    // ...
    console.log('작동')
  }
  

//줌 기능

video.me.addEventListener("loadedmetadata", function() {
    console.log('로드 메타데이타')
    this.currentTime = 28 // 해당 시간

}, false)
