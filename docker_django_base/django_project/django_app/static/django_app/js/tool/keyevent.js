const key = { //사용할 key 등록
    'a': function(key){
        keyEvent(key)
    },
    'b': function(key){

    },
    'z': function(key){

    },
    'Control': function(key){

    },
    'alt + a': function(key){
        keyEvent(key)
    },
    ' ': function(){ 
        videoWave.playPauseFn() 
    },
}

function keyEvent(key){
    console.log(key)
}

window.addEventListener('keydown', e => {
    if(!(e.altKey && e.key || e.ctrlKey && e.key || e.key)) return

    if(e.altKey && e.key){
        key['alt + ' + e.key]? key['alt + ' + e.key]('alt + ' + e.key) : false
    }else if(e.ctrlKey && e.key){
        key['ctrlKey + ' + e.key]? key['ctrlKey + ' + e.key]('ctrl + ' + e.key) : false
    }else if(e.key){
        key[e.key]? key[e.key](e.key) : false
    }
})