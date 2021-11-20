 function statusDisplayElement(){
     var _div =  document.createElement('div')
     _div.classList.add('clip-status')
     return _div
 }



function clipStatusMark(clipStatus, status) {
    if (!status || !clipStatus) return

    switch (status) {
        case '완료':
            clipStatus.innerHTML = ''
            clipStatus.innerHTML = `<i class='glyphicon glyphicon-ok'></i> 완료`
            clipStatus.classList.remove('working')
            clipStatus.classList.remove('rejection')
            clipStatus.classList.add('complete')
            break

        case '반려':
            clipStatus.innerHTML = ''
            clipStatus.innerHTML = `<i class='glyphicon glyphicon-remove'></i> 반려`
            clipStatus.classList.remove('complete')
            clipStatus.classList.remove('working')
            clipStatus.classList.add('rejection')
            break

        case '작업중':
            clipStatus.innerHTML = ''
            clipStatus.innerHTML = `<i class='glyphicon glyphicon-fire'></i> 작업중...`
            clipStatus.classList.remove('complete')
            clipStatus.classList.remove('rejection')
            clipStatus.classList.add('working')
            break

        case '제거':
            clipStatus.innerHTML = ''
            if (clipStatus.classList.contains('complete')) {
                clipStatus.classList.remove('complete')
            }

            if (clipStatus.classList.contains('rejection')) {
                clipStatus.classList.remove('rejection')
                clipStatus.classList.add('complete')
                clipStatus.innerHTML = `<i class='glyphicon glyphicon-ok'></i> 완료`
            }

            if (clipStatus.classList.contains('working')) {
                clipStatus.classList.remove('working')
            }
            break
    }
}