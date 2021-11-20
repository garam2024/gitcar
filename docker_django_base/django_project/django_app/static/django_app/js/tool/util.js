const formatTime = function(time){
    return [
        Math.floor((time % 3600) / 60), // minutes
        ('00' + Math.floor(time % 60)).slice(-2) // seconds
    ].join(':')
}

function videoDimensions(video) {
    var videoRatio = video.videoWidth / video.videoHeight
    var width = video.offsetWidth, height = video.offsetHeight
    var elementRatio = width/height

    if(elementRatio > videoRatio) width = height * videoRatio
    else height = width / videoRatio

    return {
        width: width,
        height: height
    }
}

function isEqual(a, b){ //<-- 이거 틀린듯
    // Math.abs는 절댓값을 반환한다.
    // 즉 a와 b의 차이가 JavaScript에서 표현할 수 있는 가장 작은 수인 Number.EPSILON보다 작으면 같은 수로 인정할 수 있다.
    return Math.abs(a - b) < Number.EPSILON;
  }

function precise(x){
    return Number.parseFloat(x).toPrecision(4);
}

//포함 비교 함수
function comparison(start, end, number){
    let first = isEqual(start, number)
    let last = isEqual(end, number)
    let middle = start <= number && number <= end 

    if(first || last || middle) return true
    return false
}

//객체 깊은 복사
function deepCopy(obj){
    if(obj === null || typeof obj !== "object"){ // 객체가 아닐 때
        return obj 
    }
    
    let copy = {}
    
    for (let key in obj){ //복사
        copy[key] = this.deepCopy(obj[key])
    }

    return copy
}//객체 깊은 복사


//로딩 함수