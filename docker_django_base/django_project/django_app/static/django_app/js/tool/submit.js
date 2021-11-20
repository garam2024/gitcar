function submitFunc(el){
    const submitBtn = document.querySelector(el)
    submitBtn.addEventListener('click', e => {
        // console.log('작동')
        // window.location.assign('/mytask')

        let variable = {
            name: 'asdf',
            empty: '123123'
        }

        $.ajax({
            type: 'POST',
            url: 'task_complete',
            dataType: 'json',
            data: JSON.stringify(variable),
            success: function(data){
                // loading.classList.remove('active')
                window.location.assign('/mytask')
                console.log('success')
            },
            error: function(err){
                console.log(err)
            }//,
            // complete: function(){
            //     window.location.assign('/mytask')
            // }
        })

    })
}


submitFunc('#jsonDataToServer')

const intermediateStorage = document.querySelector('#intermediateStorage')
intermediateStorage.addEventListener('click', e => {
    console.log('작동')
    window.location.assign('/mytask')
})

const modalWindow = {   
    modalEl: '.modal-background',
    messageEl: '.modal-background .message',

    modalOpen(){
        const modalEl = document.querySelector(modalWindow.modalEl)
        console.log(modalEl)
        modalEl.classList.add('active')
    },

    modalClose(){
        const modalEl = document.querySelector(modalWindow.modalEl)
        modalEl.classList.remove('active')
    }
} 

