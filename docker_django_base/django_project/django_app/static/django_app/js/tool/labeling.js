//툴 박스 옵션
let labelingToolValue = {
    selectBoxValue: ['제품명', '주의 사항', '영양 정보', '제품 정보', '제품'],
    productInfo: []
}//툴 박스 옵션

//데이터 바인딩 화면 툴 데이터를 가지고 있고 변하는 값을 ImageLabeling Class에 전달 
function createToolBox(tool){
    //제품
    const labelProductBox = document.querySelector('.label-product-box')
    const labelProductSelected = document.querySelector('.label-product-box .product-selected')
    const ProductValue = document.querySelector('.label-product-box .selected')
    const fixCheck = document.querySelector('.fix-check')

    for(let i=0; i<tool.productInfo.length; i++){
        const li = document.createElement('li')
        li.append(tool.productInfo[i])
        labelProductSelected.append(li)
    }

    ProductValue.innerText = tool.productInfo[0]

    labelProductBox.addEventListener('click', function(e){
        labelProductBox.classList.toggle('active')
        if(e.target.nodeName === 'LI'){
            ProductValue.innerText = e.target.innerText
            let variable = {
                productValue: e.target.innerText
            }
            createCanvas.changeToolOption(variable)
        }
    })

    //셀렉트
    const labelSelectBox = document.querySelector('.label-select-box')
    const labelSelected = document.querySelector('.label-select-box .label-selected')
    const selectValue = document.querySelector('.label-select-box .selected')
    let beforeSelect

    selectValue.innerText = tool.selectBoxValue[0]

    for(let i=0; i<tool.selectBoxValue.length; i++){
        const li = document.createElement('li')
        li.append(tool.selectBoxValue[i])
        labelSelected.append(li)
        if(i === 0) {
            li.classList.add('active')
            beforeSelect = li
        }
    }

    labelSelectBox.addEventListener('click', function(e){
        if(e.target.nodeName === 'LI'){
            if(beforeSelect) beforeSelect.classList.remove('active')
            
            // selectValue.innerText = e.target.innerText

            let variable = {
                selectValue: e.target.innerText
            }

            e.target.classList.add('active')
            beforeSelect = e.target
            console.log(variable)
            createCanvas.changeToolOption(variable)
        }
    })

    //반려 체크
    fixCheck.addEventListener('change', e => {
        let selected 
        let variable

        console.log(e.target.value)
        if(e.target.value == 'default'){

            variable = {
                fixCheck: '0'
            }

        }else{
            selected = e.currentTarget.querySelectorAll('option')[e.currentTarget.value]
            console.log(e.currentTarget.value)
            variable = {
                fixCheck: selected.value
            }
        }

        console.log(variable)
    
        createCanvas.changeToolOption(variable)
    })

    //반려 체크

    //키 이벤트
    window.addEventListener('keydown', e => {
        if(e.ctrlKey === true && parseInt(e.key)){
            for(let i = 0; i<tool.selectBoxValue.length; i++){
                if(e.ctrlKey === true && e.key === `${i+1}`){
                    selectValue.innerText = tool.selectBoxValue[i]
                    let variable = {
                        selectValue: tool.selectBoxValue[i]
                    }
                    createCanvas.changeToolOption(variable)
                }
            }
        }

        if(e.key === 'ArrowUp' || e.key === 'ArrowDown'){
            let toolStatus =createCanvas._toolStatus.drawingLabel
            let idx = tool.selectBoxValue.indexOf(toolStatus.selectedLabel)

            if(e.key === 'ArrowUp'){
                idx--
                if(idx >= 0){
                    selectValue.innerText = tool.selectBoxValue[idx]
                }else{
                    idx = tool.selectBoxValue.length - 1
                    selectValue.innerText = tool.selectBoxValue[idx]
                }
            }

            if(e.key === 'ArrowDown'){
                idx++
                if(idx < tool.selectBoxValue.length){
                    selectValue.innerText = tool.selectBoxValue[idx]
                }else{
                    idx = 0
                    selectValue.innerText = tool.selectBoxValue[idx]
                }
            }

            let variable ={
                selectValue: tool.selectBoxValue[idx]
            }

            createCanvas.changeToolOption(variable)
        }
    })//키 이벤트

    //컬러
    const selectColor = document.querySelector('#selectColor')
    selectColor.addEventListener('change', function(e){
        let variable = {
            color: e.target.value
        }
        createCanvas.changeToolOption(variable)
    })//컬러

    //흐린 이미지 체크
    const blurCheck = document.querySelector('#blurCheck')
    blurCheck.addEventListener('input', function(){
        blurCheck.checked
        let variable = {
            isBlurImage: blurCheck.checked
        }
        createCanvas.changeToolOption(variable)
    })//흐린 이미지 체크
}//데이터 바인딩 화면 툴 데이터를 가지고 있고 변하는 값을 ImageLabeling Class에 전달

//이미지 라벨링
class ImageLabeling{
    constructor(element, tool){
        this.element = element
        this.canvasElement = document.createElement('canvas')
        element.append(this.canvasElement)
        this.canvas = new fabric.Canvas(this.canvasElement, {
            height: '639'
        })

        this.projectJsonData = { } //라벨을 그리면서 생기는 데이터
        this.jsonDataToServer = { } //서버로 전송할 최소 데이터
        this.isProjectLoaded = false 
        this.imageNumber = 0 // 몇 번째 이미지
        this.labelIdCount = 0 // 라벨 그릴 때 마다 아이디 숫자

        //현재 페이지의 이미지 정보
        this.imageInfo = {
            id: '',
            src: '',
            blurImage: false,
            completedImage: false,
            labels: []
        }

        this.prevNumber = []

        //툴 박스 밸류
        this.labelValue = tool.selectBoxValue

        //현재 상태
        this.toolStatus = {
            existImage: false,
            drawingLabel: {
                strokeColor: '#E71D36',
                fill: 'transparent',
                selectedLabel: this.labelValue[0],
                labelFontFamilly: 'Helvetica Neue',
                labelFontSize: 16,
                labelFontColor: 'white',
                labelFill: '#E71D36',
                labelId: 'label_'
            },
            scale: 1,
            page: this.imageNumber,
            isBlurImage: false
        }

        this.canvasEvent()//캔버스 이벤트 활성화
        this.beforeunloadEvent()//페이지를 나갈 때 발생하는 이벤트
    }

    changeToolOption(option){//변경된 툴 옵션 적용
        let labelSet = this.toolStatus.drawingLabel

        if(option.selectValue){
            labelSet.selectedLabel = option.selectValue
        }

        if(option.color){
            labelSet.strokeColor = option.color
            labelSet.labelFill = option.color
        }

        if(option.productValue){

        }

        if(option.fixCheck){
            this.projectJsonData.images[this.imageNumber].fix = option.fixCheck
            this.jsonDataToServer.images[this.imageNumber].fix = option.fixCheck
            let button = document.querySelectorAll('.labeling-page-nav .inner > div button')[this.imageNumber]

            if(option.fixCheck == '0'){
                button.classList.remove('fix')
            }else{
                button.classList.add('fix')
            }

        }

        if(option.isBlurImage){
            this.toolStatus.isBlurImage = option.isBlurImage
            this.projectJsonData.images[this.imageNumber].blurImage = option.isBlurImage
            this.jsonDataToServer.images[this.imageNumber].blurImage = option.isBlurImage
        }
    }//변경된 툴 옵션 적용

    //캔버스를 감싸고 있는 틀 요소에 css를 통해서 보더와 패딩을 줄 수 있게 만듬
    bringCssStyle(){
        let getStyle = window.getComputedStyle(this.element, null)
        let elementStyle = { 
                borderLeft: getStyle.getPropertyValue('border-left-width').replace('px', ''),
                borderRight: getStyle.getPropertyValue('border-right-width').replace('px', ''),
                borderTop: getStyle.getPropertyValue('border-top-width').replace('px', ''),
                borderBottom: getStyle.getPropertyValue('border-bottom-width').replace('px', ''),
                paddingLeft: getStyle.getPropertyValue('padding-left').replace('px', ''),
                paddingRight: getStyle.getPropertyValue('padding-right').replace('px', ''),
                paddingTop: getStyle.getPropertyValue('padding-top').replace('px', ''),
                paddingBottom: getStyle.getPropertyValue('padding-bottom').replace('px', '')
            }

        return elementStyle 
    }//캔버스를 감싸고 있는 틀 요소에 css를 통해서 보더와 패딩을 줄 수 있게 만듬

    //이벤트
    canvasEvent(){
        let canvas = this.canvas
        this.element.tabIndex = -1

        window.addEventListener('keydown', e => {
            if(e.ctrlKey === true && e.key === 'x'){
                if(!canvas.getActiveObject()) return
                this.removeLabel(canvas.getActiveObject())
            }
        })

        canvas.on('mouse:dblclick', e => {
            if(!this.toolStatus.existImage){
                return console.log('이미지가 존재하지 않습니다.')
            }

            if(!e.target){
                // disable all labels selection
                this.projectJsonData.images[this.imageNumber].labels.forEach(label => label.selectable = false)
            }else{
                this.drawingLabelUpdate(canvas.getActiveObject())
            }
        })
        //여기서 에러
        canvas.on('mouse:down', (e) => {
            if(!this.toolStatus.existImage){
                return console.log('이미지가 존재하지 않습니다.')
            }
            if(!e.target){
                this.mouseStart = e
                // disable all labels selection
                // console.log(la)
                this.projectJsonData.images[this.imageNumber].labels.forEach(label => label.selectable = false)
            }else{
                this.mouseStart = null
            }
        })

        canvas.on('mouse:up', (e) => {
            if(!this.toolStatus.existImage){
               return console.log('이미지가 존재하지 않습니다.')
            }

            this.projectJsonData.images[this.imageNumber].labels.forEach(label => label.selectable = true)
            if(!this.mouseStart) return

            //down과 up 차이가 없을 때 라벨 생성하지 않음 ▼
            if(this.mouseStart.e.offsetX === e.e.offsetX 
                && this.mouseStart.e.offsetY === e.e.offsetY) return
            
            let left = Math.min(this.mouseStart.e.offsetX, e.e.offsetX)
            let top = Math.min(this.mouseStart.e.offsetY, e.e.offsetY)
            let width = Math.abs(e.e.offsetX - this.mouseStart.e.offsetX)
            let height = Math.abs(e.e.offsetY - this.mouseStart.e.offsetY)

            let rect = this.drawingLabel(
                left,
                top,
                width,
                height,
                this.toolStatus.drawingLabel
            )
        
            canvas.setActiveObject(rect)
        })
    }//이벤트

    //bringCssStyle 에서 얻은 css 값 적용
    elementResize(image, elementStyle){
        console.log(image)
        this.element.style.width = (image.width * image.scaleX) + 
        parseFloat(elementStyle.borderLeft) + parseFloat(elementStyle.borderRight)  + 
        parseFloat(elementStyle.paddingLeft) + parseFloat(elementStyle.paddingRight) +
        'px'
    }//bringCssStyle 에서 얻은 css 값 적용

    //박스 그리기
    drawingLabel(left, top, width, height, labelSet, labelName, color, id, affiliatedImage, imageNum){
        let canvas = this.canvas

        //selectBoxValue: ['제품명', '주의 사항', '영양 정보', '제품 정보', '제품'],
        //aee4ff, ffabfb0, f2cfa5, b5c7ed, caa6fe
        let colorSelect = labelName || labelSet.selectedLabel
        
        switch(colorSelect){
            case '제품명':
            color =  '#2979FF'

            break

            case '주의 사항':
            color =  '#FF1744'
            
            break

            case '영양 정보':
            color =  '#FF9100'
            
            break

            case '제품 정보':
            color =  '#607D8B'
            
            break

            case '제품':
            color =  '#00E5FF'
            
            break
        }
        
        let text = new fabric.IText(`${labelName? labelName : labelSet.selectedLabel}`, {
            fontFamily: labelSet.labelFontFamilly,
            left: left + 1,
            top: top + 1,
            fill: 'white',
            fontSize: labelSet.labelFontSize,
            backgroundColor: color? color : labelSet.strokeColor,
            opacity: 0.5,
        })

        let rect = new fabric.Rect({
            left: left,
            top: top,
            width: width,
            height: height,
            stroke: color? color : labelSet.strokeColor,
            strokeWidth : 2,
            fill: labelSet.fill,
            strokeUniform: true,
        })

        let group = new fabric.Group([rect, text], {
            transparentCorners: false,
            lockRotation: true,
            left: left,
            top: top,
            angle: 0,
            cornerSize: 12,
            cornerStyle: 'circle',
            cornerColor: labelSet.strokeColor,
            borderColor: labelSet.strokeColor,
            hasRotatingPoint: false,
            affiliatedImage: affiliatedImage? affiliatedImage : this.imageInfo.id,
            id: id? id : labelSet.labelId + this.labelIdCount,
        })

        group.on('modified', e => {
            this.adjustRectResize(group)
        })

        let variable = {
            left, 
            top, 
            width, 
            height,
            labelName: labelName? labelName : labelSet.selectedLabel,
            color: color? color : labelSet.strokeColor, 
            id: id? id : labelSet.labelId + this.labelIdCount,
            affiliatedImage: affiliatedImage? affiliatedImage : this.imageInfo.id,
        }

        canvas.add(group)
    
        if(id){ //재작업 시
            let idx = this.projectJsonData.images[imageNum].labels.findIndex(x => x.id === id)
            this.projectJsonData.images[imageNum].labels[idx] = group
        }else{ 
            console.log(this.jsonDataToServer)
            this.projectJsonData.images[this.imageNumber].labels.push(group)
            this.jsonDataToServer.images[this.imageNumber].labels.push(variable)
            this.hasLabel()
            this.labelIdCount++
        }

        return group
    }//박스 그리기

    beforeunloadEvent(){
        window.addEventListener('beforeunload', () => {
            if(beforeDisable) return
            this.dataToServer()
        })
    }

    //색상과 라벨링 업데이트 부분
    drawingLabelUpdate(label){
        let labelSet = this.toolStatus.drawingLabel

        label._objects[0].set({
            stroke: labelSet.strokeColor
        })

        label._objects[1].set({
            backgroundColor: labelSet.strokeColor,
            text: labelSet.selectedLabel
        })

        const order = this.jsonDataToServer.images[this.imageNumber].labels.find(_find)
        function _find(array)  {
            if(array.id === label.id){
                return true
            }
        }

        order.labelName = labelSet.selectedLabel
        order.color = labelSet.strokeColor
        this.canvas.renderAll()
    }//색상과 라벨링 업데이트 부분

    //박스 수정
    adjustRectResize(label){
        console.log(label)
        const minSize = 25
        
        let width = label.width * label.scaleX
        let height = label.height * label.scaleY
        let left = label.left
        let top = label.top
        let canvas = this.canvas

        // start x is out of right edge
        if (left >= canvas.width - minSize){
            left = canvas.width - minSize
        }
        // start y is out of bottom edge
        if (top >= canvas.height - minSize){
            top = canvas.height - minSize
        }
        // end x is out of right edge
        if ((left + width) > canvas.width){
            width = canvas.width - left
        }
        // end y is out of bottom edge
        if ((top + height) > canvas.height){
            height = canvas.height - top
        }
        // start x is out of left edge
        if (left < 0){
            width += left
            left = 0
        }
        // start y is out of top edge
        if (top < 0){
            height += top
            top = 0
        }
        // end x is out of left edge
        if ((left + width) < 0){
            width = minSize
        }
        // end y is out of left edge
        if ((top + height) < 0){
            height = minSize
        }

        label.set({
            left: left,
            top: top,
            width: width,
            height: height,
            scaleX: 1,
            scaleY: 1,
        })
        
        label._objects[0].set({ //수정한 배열 업데이트
            left: -(width/2),
            top: -(height/2),
            scaleX: 1,
            scaleY: 1,
            width: width,
            height: height,
        })

        label._objects[1].set({ //수정한 배열 업데이트
            left: -(width/2),
            top: -(height/2),
            scaleX: 1,
            scaleY: 1,
        })

        const order = (this.jsonDataToServer.images[this.imageNumber].labels).find(_find)
        function _find(array)  {
            if(array.id === label.id){
                return true
            }
        }

        if(order){ 
            //라벨을 빠르게 그리면서 빨리 페이지를 넘기면 
            //그려짐과 동시에 수정 작업을 하기도 하고 또 동시에 페이지를 넘기기도 하는데 
            //그 때 수정하는 도중에 이미지 넘버가 바뀌면서 버그가 발생함 
            //오더가 없어졌을 때 실행 안하게
            order.left = left
            order.top = top
            order.width = width
            order.height = height
        }

        label.setCoords()
    }//박스 수정

    //배열 삭제
    arrayDelete(array, findArray){
        const itemToFind = array.find((item) => { 
            return item.id === findArray.id
        })

        const idx = array.indexOf(itemToFind)

        if(idx > -1){
            array.splice(idx, 1)
        }
    }//배열 삭제

    //박스 삭제
    removeLabel(label){
        if(!label) return

        this.arrayDelete(this.projectJsonData.images[this.imageNumber].labels, label)
        this.arrayDelete(this.jsonDataToServer.images[this.imageNumber].labels, label)

        this.hasLabel()
        this.canvas.discardActiveObject() //선택 해제
        this.canvas.remove(label)
    }//박스 삭제

    //객체 깊은 복사
    deepCopy(obj){//재귀 함수
        if(obj === null || typeof obj !== "object"){ // 객체가 아닐 때 배열도 객체임
            return obj 
        }
      
        let copy = {}
        
        for (let key in obj){ //복사
            copy[key] = this.deepCopy(obj[key])
        }

        return copy
    }//객체 깊은 복사

    //데이터 로드 맨 처음 작동
    projectLoad(projectJsonData){
        // if(!image) return this.toolStatus.existImage = false
        this.projectJsonData = projectJsonData //데이터 받음
        this.jsonDataToServer = this.deepCopy(projectJsonData)
        this.jsonDataToServer.images = Object.values(this.jsonDataToServer.images) //객체를 배열로 바꿔줌

        for(let i = 0; i < this.jsonDataToServer.images.length; i++){ // 객체를 배열로
            this.jsonDataToServer.images[i].labels = Object.values(this.jsonDataToServer.images[i].labels)
        }

        console.log(this.projectJsonData)
        let saveLabelMaxNumber = []
        let saveImageMaxNumber = []

        let imagesLength = this.projectJsonData.images.length
        this.workCompleteCheck()

        if(this.projectJsonData.images.length){
            for(let i = 0; i < imagesLength; i++){
                if(projectJsonData.images[i].labels){
                    for(let j = 0; j < projectJsonData.images[i].labels.length; j++){
                        let label = this.projectJsonData.images[i].labels[j]

                        let _label = this.drawingLabel(
                            label.left, 
                            label.top, 
                            label.width,
                            label.height,
                            this.toolStatus.drawingLabel,
                            label.labelName,
                            label.color,
                            label.id,
                            label.affiliatedImage,
                            i
                        )

                        _label.set({
                            visible: false,
                            selectable: false,
                            evented: false
                        })

                        let intStr = (label.id).replace(/[^0-9]/g, '')
                        saveLabelMaxNumber.push(parseInt(intStr))
                    }
                }
            }

            //가장 큰 수를 찾아서 업데이트 set사용해도 될 거 같음
            this.labelIdCount = saveLabelMaxNumber.length === 0? 0 : Math.max(...saveLabelMaxNumber) + 1
            // console.log(this.labelIdCount)
            for(let i = 0; i < this.projectJsonData.images.length; i++){
                let image = this.projectJsonData.images[i]

                let intStr = (image.id).replaceAll('[^0-9]', '')
                saveImageMaxNumber.push(parseInt(intStr))
            }

            // this.imageNumber = Math.max(...saveImageMaxNumber) + 1
            //가장 큰 수를 찾아서 업데이트
        }

        this.hasLabelUpdate()
        
        return this.pageLoad(0)
    }//데이터 로드 맨 처음 작동

    /* 
        현재 페이지가 1 페이지 일 때 
        다음 또는 이전 페이지로 이동 시 
        1 페이지의 라벨 데이터와 이미지 데이터를 보낸다.
    ▼ */
    dataToServer(){ //매 페이지 이동 시 서버로 데이터 전송 이전 페이지의 정보만 전송

        let variable = {
            id: this.jsonDataToServer.id,
            width: this.jsonDataToServer.width,
            height: this.jsonDataToServer.height,
            scaleX: this.jsonDataToServer.scaleX,
            scaleY: this.jsonDataToServer.scaleY,
            name: this.jsonDataToServer.name,
            images: [this.jsonDataToServer.images[this.imageNumber]],
            length: this.jsonDataToServer.length,
            path: (this.jsonDataToServer.path).replaceAll('/media/', ''),
            type: this.jsonDataToServer.type
        }
            
        console.log("variable Json : ")
        console.log(variable)

        $.ajax({
            type: 'POST',
            url: 'task_api',
            dataType : 'json',
            data: JSON.stringify(variable),
            success: function(data){
                console.log('Success: ' + data)
            },
            error: function(err){
                console.log(err)
            }
        })

    }//매 페이지 이동 시 서버로 데이터 전송 현재 페이지의 정보만 전송

    //페이지 로드
    pageLoad(num){
        let fixCheckOption = document.querySelectorAll('.fix-check option')
        console.log(this.projectJsonData.images[num].fix = this.projectJsonData.images[num].fix? this.projectJsonData.images[num].fix : 0)
        fixCheckOption[this.projectJsonData.images[num].fix].selected = true

        let projectJsonData = this.projectJsonData
 
        if(num + 1 > projectJsonData.images.length || num < 0){
            return 'error'
        }

        this.dataToServer()
        this.prevNumber.push(num)

        if(this.prevNumber.length > 2){
            this.prevNumber.shift()
        }

        let canvas = this.canvas
        this.imageNumber = num
        
        let path = projectJsonData.path + (num + 1) + '.' + 'png'

        canvas.setWidth(projectJsonData.width * projectJsonData.scaleX)
        canvas.setHeight(projectJsonData.height * projectJsonData.scaleY)
        canvas.calcOffset()
        canvas.setBackgroundImage(path , canvas.renderAll.bind(canvas), {
            scaleX: projectJsonData.scaleX,
            scaleY: projectJsonData.scaleY
        })

        let elementStyle = this.bringCssStyle()
        this.elementResize(projectJsonData, elementStyle)
        this.toolStatus.existImage = true

        this.imageInfo.src = projectJsonData.images[num].src
        this.imageInfo.id = projectJsonData.images[num].id
        this.imageInfo.blurImage = projectJsonData.images[num].blurImage

        if(projectJsonData.images[this.prevNumber[0]].labels.length){
            for(let i=0; i < projectJsonData.images[this.prevNumber[0]].labels.length; i++){
                projectJsonData.images[this.prevNumber[0]].labels[i].set({
                    visible: false,
                    selectable: false,
                    evented: false
                })
            }
        }

        canvas.discardActiveObject() //선택 해제

        document.getElementById('blurCheck').checked = this.imageInfo.blurImage 
        if(!projectJsonData.images[num].labels.length) return

        //this.labels [num].id 찾아서 현재 페이지의 라벨을 보이게 하고 다른 페이지들은 안 보이게 만듬
        for(let i=0; i < projectJsonData.images[num].labels.length; i++){
            projectJsonData.images[num].labels[i].set({
                visible: true,
                selectable: true,
                evented: true
            })
        }

        canvas.discardActiveObject() //선택 해제
    }//페이지 로드

    uploadImage(src){ //이미지 테스트용
        fabric.Image.fromURL(src, (img) => {
            this.image = img
            this.drawingImage(img)
        })
    }//이미지 테스트용

    //클라이언트로 JSON 내보내기
    saveToFile(fileName, content){
        let blob = new blob([content], { type: 'text/plain' })
        
        objURL = window.URL.createObjectURL(blob)
            
        // 이전에 생성된 메모리 해제
        if (window.__Xr_objURL_forCreatingFile__) {
            window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__)
        }

        window.__Xr_objURL_forCreatingFile__ = objURL
        var a = document.createElement('a')
        a.download = fileName
        a.href = objURL
        a.click()
    }//클라이언트로 JSON 내보내기

    //클라이언트로 이미지 내보내기
    downloadCanvas(link, filename){
        let canvas = this.canvas

        link.addEventListener('click', function(){
            this.setAttribute('download', filename)
            this.setAttribute('href', canvas.toDataURL('image/jpeg'))
        })
    }//클라이언트로 이미지 내보내기

    //작업 완료 확인 부분
    workCompleteCheck(){
        let projectJsonData = this.projectJsonData

        let inner = document.querySelector('.labeling-page-nav .inner > div')

        for(let i = 0; i < projectJsonData.images.length; i++){
            let button = document.createElement('button')
            button.append(i + 1)
            button.dataset.pageNum = i + 1
            inner.append(button)
        }
    }//작업 완료 확인 부분

    //작업 완료 체크 (라벨을 그리거나 삭제 할 때 작동하게 만듬)
    hasLabel(){
        let button = document.querySelectorAll('.labeling-page-nav .inner > div button')
        console.log('haslabel 작동')
        if(this.projectJsonData.images[this.imageNumber].labels.length){
            button[this.imageNumber].classList.add('active')
            this.imageInfo.completedImage = true
            this.projectJsonData.images[this.imageNumber].completedImage = true
            this.jsonDataToServer.images[this.imageNumber].completedImage = true
        }else{
            button[this.imageNumber].classList.remove('active')
            this.imageInfo.completedImage = false
            this.projectJsonData.images[this.imageNumber].completedImage = false
            this.jsonDataToServer.images[this.imageNumber].completedImage = false
        }

        if(this.projectJsonData.images[this.imageNumber].fix == '0'){
            button[this.imageNumber].classList.remove('fix')
        }else{
            button[this.imageNumber].classList.add('fix')
        }

    }//작업 완료 체크 (라벨을 그리거나 삭제 할 때 작동하게 만듬)

    hasLabelUpdate(){
        let imageLength = this.projectJsonData.images.length

        for(let i=0; i<imageLength; i++){
            let image = this.projectJsonData.images[i]
            let button = document.querySelectorAll('.labeling-page-nav .inner > div button')[i]

            if(image.completedImage){
                button.classList.add('active')
            }
            //fix
            console.log(image.fix)
            if(image.fix != '0' || image.fix == undefined){
                button.classList.add('fix')
            }
            
        }
    }

    get labelingData(){
        return this.projectJsonData
    }

    get labelingDataToServer(){
        return this.jsonDataToServer
    }

    get _toolStatus(){
        return this.toolStatus
    }

    get canvasInfo(){
        return this.canvas
    }

}//이미지 라벨링

const imageLabelForm = document.querySelector('.image-labeling-form')
const createCanvas = new ImageLabeling(imageLabelForm, labelingToolValue)

// 이미지 테스트 용
const uploadForm = document.querySelector('.image-labeling-toolbox input[type="file"]')
uploadForm.addEventListener('change', imageUpload)
function imageUpload(){
    let file = uploadForm.files[0]   

    if(!file.type.match('image/.*')){
        return alert('이미지 확장자만 업로드 가능합니다.')
    }

    const reader = new FileReader()
    reader.addEventListener('load', function(e){
        imageLabelForm.style.background = `url(${e.target.result})`
        createCanvas.uploadImage(e.target.result)
    })

    reader.readAsDataURL(file)
}//이미지 테스트 용

createCanvas.downloadCanvas(document.getElementById('imageToClient'), '테스트')

//page 이동
const Paging = (function(){
    let imagesLength = 0
    let start = 1
    let nowPage

    const nowPageMark = document.querySelector('#nowPage')
    const allPageList = document.querySelector('#allPageList')

    const prevButton = document.querySelector('#imagePrevButton')
    const nextButton = document.querySelector('#imageNextButton')

    const inputPage = document.querySelector('#inputPage')
    let saveButton

    const innerDiv = document.querySelector('.labeling-page-nav .inner > div')

    function activePage(){
        if(saveButton){
            saveButton.classList.remove('activePage')
        }
        const button = document.querySelectorAll('.labeling-page-nav .inner > div button')[nowPage - 1]
        
        // console.log(button.innerHeight)
        saveButton = button
        button.classList.add('activePage')
        let calc = button.offsetTop - innerDiv.getBoundingClientRect().top
        innerDiv.scrollTo(0, calc)
    }

    innerDiv.addEventListener('click', function(e){
        if(e.target.nodeName !== 'BUTTON') return
        nowPage = e.target.dataset.pageNum 
        nowPageMark.innerText = nowPage
        inputPage.setAttribute('placeholder', nowPage)
        createCanvas.pageLoad(nowPage - 1)
        activePage() 
    })

    function load(_imagesLength){
        imagesLength = _imagesLength
        nowPageMark.innerText = nowPage
        allPageList.innerText = imagesLength
        inputPage.setAttribute('placeholder', nowPage)
        activePage()
    }

    function left(){
        if(nowPage <= start) return alert('맨 앞 이미지입니다.')
        nowPage--
        nowPageMark.innerText = nowPage
        inputPage.setAttribute('placeholder', nowPage)
        createCanvas.pageLoad(nowPage - 1)
        activePage()
    }

    function right(){
        if(nowPage >= imagesLength) return alert('맨 뒤 이미지입니다.')
        nowPage++
        nowPageMark.innerText = nowPage
        inputPage.setAttribute('placeholder', nowPage)
        createCanvas.pageLoad(nowPage - 1)
        activePage()
    }

    prevButton.addEventListener('click', function(){
        left()
    })

    nextButton.addEventListener('click', function(){
        right()
    })

    document.addEventListener('keydown', e => {
        if(e.key === 'ArrowLeft') left()
        if(e.key === 'ArrowRight') right()
    })

    inputPage.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){
            if(isNaN(e.currentTarget.value)) return inputPage.value = ''
            let result = createCanvas.pageLoad(e.currentTarget.value - 1)

            if(result === 'error'){
                return alert('존재하지 않는 이미지 페이지입니다.')
            }else{
                nowPage = e.currentTarget.value
                nowPageMark.innerText = nowPage
                inputPage.setAttribute('placeholder', nowPage)
                activePage()
            }

            inputPage.value = ''
        }
    })

    return {
        setData: function(_imagesLength, num){
            nowPage = num?? 1
            load(_imagesLength)
        },
    }
})()//page 이동

// 서버로 부터 받은 데이터 읽기 //
function bringDataFromServer(){
    const imageId = document.querySelector('#imageId').innerText
    const imageName = document.querySelector('#imageName').innerText
    const imageSrc = document.querySelector('#imagePath').innerText
    const imageLength = document.querySelector('#imageLength').innerText
    const imageUpdate = document.querySelector('#imageUpdate')? document.querySelector('#imageUpdate').innerText : ''
    const loading = document.querySelector('.page-loading')
    loading.classList.add('active')

    let imageDataIdNumber = 1
    let productLabelingData = {
        id: imageId,
        name: imageName,
        width: '',
        height: '',
        scaleX: '',
        scaleY: '',
        path: '/media' + imageSrc + '/',
        length: imageLength,
        images: [],
        type: 'png'
    }

    labelingToolValue.productInfo = [imageName] //툴 박스 설정
    let image = document.createElement('img')

    if(imageUpdate === 'Exists'){
        // console.log('동작')
        $.ajax({
            type: 'POST',
            url: 'check_api',
            data: imageId,
            success: function(data){
                // console.log(data)
                let strArr = data.split('&')

                strArr[0] = strArr[0]
                .replaceAll('\'', '"')
                .replaceAll(' ', '')
                .replaceAll('"{"', '{"')
                .replaceAll('}"', '}')
                .replaceAll('True', '"True"')
                .replaceAll('False', '"False"')
                // console.log(strArr[0])

                // console.log(strArr[1])
                strArr[1] = strArr[1]
                .replaceAll('\'', '"')
                .replaceAll(' ', '')
                .replaceAll('"{"', '{"')
                .replaceAll('}"', '}')
                .replaceAll('True', '"True"')
                .replaceAll('False', '"False"')
                .replaceAll('"[', '')
                .replaceAll(']"', '')
                console.log(strArr[1])

                let jsonData = JSON.parse(strArr[0])
                let jsonData_images = JSON.parse(strArr[1])

                jsonData.images = jsonData_images

                console.log(jsonData)

                reconstruction(jsonData)
            },
            error: function(err){
                console.log('오류: ' + err)
            }
        })

        function reconstruction(data){
            for(let i=0; i<data.length; i++){
        
                let variable = {
                    id: 'image-' + imageDataIdNumber,
                    blurImage: false,
                    completedImage: false,
                    labels: [],
                    fix: 0
                }
                
                productLabelingData.images.push(variable)
                imageDataIdNumber++
            }

            for(let i=0; i<data.images.length; i++){
                console.log(data.images[i])
                let idx = productLabelingData.images.findIndex(arr => arr.id === data.images[i].id)
                console.log(idx)
                data.images[i].blurImage = data.images[i].blurImage === 'False'? false : true
                data.images[i].completedImage = data.images[i].completedImage === 'False'? false : true
                data.images[i].labels = data.images[i].labels === ''? [] : data.images[i].labels  
                data.images[i].fix = data.images[i].fix? data.images[i].fix : 0  

                productLabelingData.images[idx] = data.images[i]
            }
            
            console.log(productLabelingData)

                productLabelingData.id = imageId,
                productLabelingData.name = imageName,
                productLabelingData.width = parseInt(data.width),
                productLabelingData.height = parseInt(data.height),
                productLabelingData.scaleX = parseFloat(data.scaleX),
                productLabelingData.scaleY = parseFloat(data.scaleY),
                // productLabelingData.path = data.path,
                productLabelingData.length = parseInt(data.length),
                productLabelingData.type = data.type

                console.log(productLabelingData)

            loading.classList.remove('active')
            createCanvas.projectLoad(productLabelingData)
            Paging.setData(productLabelingData.images.length)
            createToolBox(labelingToolValue)
        }
    }else{
        window.onload = () => {
            // console.log(productLabelingData) productLabelingData.type
            image.src = productLabelingData.path  + 1 + '.' + 'png'
        
            const imageLabelingForm = document.querySelector('.image-labeling-form')
        
            image.addEventListener('load', function(){
                let { naturalWidth, naturalHeight } = this
                let { clientWidth, clientHeight } = imageLabelingForm

                console.log(window.innerHeight)
        
                productLabelingData.width = naturalWidth
                productLabelingData.height = naturalHeight
                productLabelingData.scaleX = 1136/naturalWidth
                productLabelingData.scaleY = 639/naturalHeight
                // productLabelingData.scaleX = clientWidth/naturalWidth
                // productLabelingData.scaleY = clientHeight/naturalHeight

                runLabeling()
            })
            createToolBox(labelingToolValue)
        }
    }

    function runLabeling(){
        for(let i=1; i<=imageLength; i++){

            let variable = {
                id: 'image-' + imageDataIdNumber,
                blurImage: false,
                completedImage: false,
                labels: [],
                fix: 0
            }
    
            productLabelingData.images.push(variable)
            imageDataIdNumber++
        }
    
        loading.classList.remove('active')
        createCanvas.projectLoad(productLabelingData)
        Paging.setData(productLabelingData.images.length)
    }
}// 서버로 부터 받은 데이터 읽기 //

bringDataFromServer()

//서버로 데이터 전송

let beforeDisable

function jsonDataToServerFunc(){
    const jsonDataToServerBtn = document.querySelector('#jsonDataToServer')
    const modal = document.querySelector('.modal-background')
    const loading = document.querySelector('.page-loading')
    const modalWindowMessage = document.querySelector('.modal-background .message')
    const checkButton = document.querySelector('.modal-background .button-check')
    const normalButton = document.querySelector('.modal-background .button-normal')
    const jsonDataToServer_1 = document.querySelector('#jsonDataToServer_1')
    console.log(jsonDataToServer_1)
    let preventDefaultValue 

    let holdModalOpen = false

    jsonDataToServer_1.addEventListener('click', e => {
        if(holdModalOpen) return
        preventDefaultValue = e
        preventDefaultValue.preventDefault()
        holdModal(e)
    })

    function holdModal(e){
        holdModalOpen = true
        modal.classList.add('active')

        modalWindowMessage.innerHTML = 
        `작업을 임시 저장하시겠습니까?`

        checkButton.textContent = '확인'
        normalButton.textContent = '취소'
    }

    jsonDataToServerBtn.addEventListener('click', function(){
        createCanvas.labelingDataToServer.path = createCanvas.labelingDataToServer.path.replaceAll('/media/', '')
        let buttonActive = document.querySelectorAll('.labeling-page-nav .inner > div button.active')
        let compareLength = buttonActive.length === createCanvas.labelingDataToServer.images.length
        
        beforeDisable = true
        console.log(compareLength)  

        modal.classList.add('active')

        if(compareLength){ // 다 완료 했을 경우
            modalWindowMessage.innerHTML = 
            `작업을 완료할 경우 재작업을 할 수 없습니다.<br>
            작업을 완료하시겠습니까?`
    
            checkButton.textContent = '확인'
            normalButton.textContent = '취소'
        }else{
            modalWindowMessage.innerHTML = 
            `작업이 완료되지 않았습니다.`
    
            checkButton.textContent = '계속하기'
            normalButton.textContent = '작업삭제'
        }
    })//jsonDataToserverBtn

    modal.addEventListener('click', function(e){
        let buttonActive = document.querySelectorAll('.labeling-page-nav .inner > div button.active')
        let compareLength = buttonActive.length === createCanvas.labelingDataToServer.images.length

        if(!holdModalOpen){
            if(compareLength){ // 다 완료 했을 경우
                if(e.target.dataset.modal === 'sure'){
                    modal.classList.remove('active')
                    loading.classList.add('active')

                    $.ajax({
                        type: 'POST',
                        url: 'task_complete',
                        dataType: 'json',
                        data: JSON.stringify(createCanvas.labelingDataToServer),
                        success: function(data){
                            loading.classList.remove('active')
                            window.location.assign('/mytask')
                        },
                        error: function(err){
                            console.log(err)
                        },
                    })

                }
                if(e.target.dataset.modal === 'cancel'){
                    modal.classList.remove('active')
                }
            }else{ // 다 완료 하지 못 했을 경우
                if(e.target.dataset.modal === 'sure'){ // 보류
                    modal.classList.remove('active')
                }
                if(e.target.dataset.modal === 'cancel'){ // 포기
                    modal.classList.remove('active')

                    task_num = document.getElementById('imageName').innerText

                    url_check = window.location.pathname.split('/')[1]
                    url_check = url_check.replace('"','')

                    console.log("URL : ", url_check)

                    console.log("Product : ", task_num)

                    if (url_check == 're_task_process') {

                        $.ajax({
                            type:"POST",
                            url: 'task_middle_cancel',
                            dataType: 'json',
                            data : {'product': task_num },
                            success: function(response){
        
                                window.location.assign('/mytask')
                            },
                            error: function(err){
        
                            }
                        })

                    }

                    if (url_check =='task_process') {

                        $.ajax({
                            type:"POST",
                            url: 'task_middle_cancel',
                            dataType: 'json',
                            data : {'product': task_num },
                            success: function(response){
        
                                window.location.assign('/mytask')
                            },
                            error: function(err){
        
                            }
                        })
                    }

                    if (url_check =='re_inspect_process') {

                        $.ajax({
                            type:"POST",
                            url: 'inspect_middle_cancel',
                            dataType: 'json',
                            data : {'product': task_num },
                            success: function(response){
        
                                window.location.assign('/mytask')
                            },
                            error: function(err){
        
                            }
                        })
                    }

                    if (url_check == 'inspect_process') {

                        $.ajax({
                            type:"POST",
                            url: 'inspect_middle_cancel',
                            dataType: 'json',
                            data : {'product': task_num },
                            success: function(response){
        
                                window.location.assign('/mytask')
                            },
                            error: function(err){
          
                            }
                        })
                    }
                    

                }
            }
        }else{
            console.log(preventDefaultValue.preventDefault)
            holdModalOpen = false
            preventDefaultValue.preventDefault = false

            if(e.target.dataset.modal === 'sure'){ // 임시 저장
                modal.classList.remove('active')
                location.assign('/mytask')

            }

            if(e.target.dataset.modal === 'cancel'){ // 취소
                modal.classList.remove('active')
                console.log('작동')

            }
        }

    })//modal

}//서버로 데이터 전송

jsonDataToServerFunc()

//이미지 내보내기
    // const testImgExport = document.querySelector('#testImg')

    // function exportImage(){
    //     //새로운 캔버스 생성
    //     //원래 스케일로 그리기 
    /*
        스케일 공식
        1000
        1000

        scaleX: 0.6 <- imageScale
        scaleY: 0.6 <- imageScale

        600
        600

        100 
        100

        scaleX: 1 < - 1000/600 > 1.666666666666667 <- labelScale
        scaleY: 1 < - 1000/600 > 1.666666666666667 <- labelScale
        이렇게 하는 이유
        라벨같은 경우 이미지 기준으로 스케일 1인 상태로 그려짐
        그래서 이미지를 그려줘야 할 때 다시 라벨 스케일을 늘려주는 작업을 해줘야함
        
        원래 비율로 
        1000
        1000
        166.6666666666667
        166.6666666666667
    */
    //     //내보내기
    // }
//

/*
    

*/