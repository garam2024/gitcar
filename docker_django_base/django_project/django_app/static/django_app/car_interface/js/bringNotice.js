/*
    공지사항 가져와서 보여주기
    쿠키이름: notice_ids
    쿠키 이름에 해당하는 공지사항 쿠키가 있다면 보여주지 않겠다.
    없으면 공지사항 글을 보여주겠다.
*/
var interfaceAppNotice = (function(){
    var notice = {
        idArray: [],
        registeredCookies: [],
        group: document.querySelector('#groupId').value,
        intervalId: '',
        data: '',
        time: 365, //쿠키 시간 설정 365일
        status: 0,
    }

    // 서버로부터 공지사항 아이디만 가져오고
    // 브라우저 쿠키 정보를 보고 없는 아이디만 배열에 담은 후 해당 하는 글의 정보를 배열에 담긴 아이디로 아작스 요청
    notice.noticeCheck = function(){
        console.log(notice)
        console.log('notice 작동')

        $.ajax({
            url: '/bring_notice',
            type: 'post',
            data: { groupId: notice.group, option: 'check' },
            success: function(data){
                //아이디만 가져와서 배열에 담는다.
                notice.idArray = []

                for(var i = 0; i < data.content_id_list.length; i++){
                    notice.idArray.push(data.content_id_list[i].content_id)
                }

                notice.cookieCheck()
                //쿠키에 저장된 값이 있는 지 확인 후 비교 체크 후
                //추가 된게 있으면 공지로 띄움
                //쿠키가 없을 때는 공지 전부다 띄움
            },
            error: function(){

            }
        })
    }

    notice.cookieCheck = function(){
        var value = getCookie('notice_ids')
        //없는 값을 리스트로 리턴하기
        if(value){
            var array = value.split(',') // 봐서 쿠키에 저장된 공지
            console.log('쿠키가 있습니다.')
            //전체 공지에 대한 아이디 값들
            var newArray = notice.idArray.filter(id => !array.includes(String(id))) //차집합
            var newArray_2 = notice.idArray.filter(id => array.includes(String(id))) //교집합

            notice.registeredCookies = newArray_2
            notice.bring(newArray) // 쿠키에 없는 공지
            //안 본 값들 공지 띄우기
        }else{ //쿠키가 없다.
            console.log('쿠키가 없습니다.')
            setCookie('notice_ids', '', notice.time) //쿠키 등록 후
            //모든 공지 가져오기
            notice.bring(notice.idArray)
        }
    }

    notice.bring = function(list){
        console.count('bring') //한번씩만 작동하는 지 확인
//        console.log(list)
        if(list && list.length === 0) return //아이디 배열이 없다면 공지를 다 읽은 것

        $.ajax({
            url: '/bring_notice',
            type: 'post',
            data: { content_ids: list },
            success: function(data){
                notice.data = data
                //모든 공지 띄우기
                notice.openModal(data)
            },
            error: function(){

            }
        })

    }


    notice.openModal = function(data){
        if(notice.status > 0) return

        var modal_ground = document.querySelector('.modal_ground')
        modal_ground.classList.remove('hide')

        for(var i = 0; i < data.length; i++){
           console.log(data[i])
           notice.status++
           modal_ground.innerHTML +=
                `<div class='modal_content modal-dialog' style='position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; padding: 16px 0; background-color: rgb(255,255,255,1); border-radius: 4px; z-index: 1000'>
                    <div class='modal-header'>
                       <h3 class='modal-title' style='font-size: 18px'>[공지사항] ${data[i].title}</h3>
                    </div>
                    <div class='modal-body'>
                      <p>${data[i].content}</p>
                    </div>
                    <div class='modal-footer'>
                      <button class='read btn btn-primary' data-content-id=${data[i].content_id} onclick='interfaceAppNotice.closeModal(event)'>확인</button>
                    </div>
                </div>`
        }
    }


    //1분마다 추가된 공지를 체크하고 기존 배열과 비교후 새로 생긴 값이 있나 체크
    //있으면 추가
    notice.setInterval = function(){ //한번만 실행
        console.log('똑똑 체크합니다.')
        notice.noticeCheck()

        notice.intervalId = setInterval(notice.noticeCheck, 60000) //1분 주기 공지 체크
    }

    notice.closeModal = function(event){
        if(notice.status === 1){
            var modal_ground = document.querySelector('.modal_ground')
            modal_ground.classList.add('hide')
        }
            event.target.closest('.modal_content').remove()
            notice.registeredCookies.push(event.target.dataset.contentId)
            console.log(notice.registeredCookies)
            console.log(event.target.dataset.contentId)
            setCookie('notice_ids', notice.registeredCookies, notice.time)
            notice.status--

            console.log(notice.status)
    }

    return notice
}())

interfaceAppNotice.setInterval()

function setCookie(cookie_name, value, days) {
    var exDate = new Date()
    exDate.setDate(exDate.getDate() + days)
    // 설정 일수만큼 현재시간에 만료값으로 지정
    var cookie_value = escape(value) + ((days == null) ? '' : '; expires=' + exDate.toUTCString())
    document.cookie = cookie_name + '=' + cookie_value + '; path=/'
}

function getCookie(cookie_name) {
    var x, y
    var val = document.cookie.split(';')

    for (var i = 0; i < val.length; i++) {
        x = val[i].substr(0, val[i].indexOf('='))
        y = val[i].substr(val[i].indexOf('=') + 1)
        x = x.replace(/^\s+|\s+$/g, '')
        // 앞과 뒤의 공백 제거하기
        if (x == cookie_name) {
            return unescape(y)
            // unescape로 디코딩 후 값 리턴
        }
    }
}