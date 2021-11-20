(function(){
    const modalOuter = document.querySelector('.modal-outer'),
    modalInner = document.querySelector('.modal-inner'),
    modalTextEl = document.querySelector('.modal-text'),
    modalBtnSureEl = document.querySelector('#modal-btn-sure'),
    modalBtnCancelEl = document.querySelector('#modal-btn-cancel'),
    modalOpen = document.querySelector('#modalOpen')

    // let text = '모달창 입니다.'

    // modalTextEl.innerHTML = text
    modalBtnSureEl.innerHTML = '확인'
    modalBtnCancelEl.innerHTML = '취소'
    
    modalOuter.addEventListener('click', e => {
        console.log((e.target == e.currentTarget))
        console.log(e.currentTarget)
        if(e.target == e.currentTarget) modalOuter.classList.remove('active')
    })

    modalOpen.addEventListener('click', e => {
        modalOuter.classList.add('active')
    })
})()