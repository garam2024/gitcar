var util = (function(){
    return {
        test: function(val){
            console.log('util code! ' + (val? val : ''))
        },

        element: {
            mode: '',
            list: [],
            enable: function(...el){
                if(el.length){
                    for(var i = 0; i < el.length; i++){
                        var el = document.querySelector(el[i])
                        if(el){
                            el.disabled = false
                        }
                    }
                }else{
                    var array = util.element.list

                    for(var i = 0; i < array.length; i++){
                        if(array[i]){
                            array[i].disabled = false
                        }
                    }
                }
            },

            disable: function(...el){
                if(el.length){
                    for(var i = 0; i < el.length; i++){
                        var el = document.querySelector(el[i])
                        if(el){
                            el.disabled = true
                        }
                    }
                }else{
                    var array = util.element.list

                    for(var i = 0; i < array.length; i++){
                        if(array[i]){
                            array[i].disabled = true
                        }
                    }
                }
            },

            subscribe: function(...list){
                for(var i = 0; i < list.length; i++){
                    var el = document.querySelector(list[i])
                    util.element.list.push(el)
                }
            },

            unSubscribe: function(...list){
                var array = util.element.list

                list.forEach(el => {
                    var index = array.findIndex(list => {
                        list === document.querySelector(el)
                    })

                    array.splice(index, 1)
                })
            }
        },

        sort: function(array){
            array.sort((a, b) => {
                // allRegions : arr(생성된 region 개수) [{regionId, startTime}, {regionId, startTime} ......] 정렬
                if (a.start > b.start) return 1
                if (a.start < b.start) return -1
                return 0
            })
        },

        loading: {
            element: document.querySelector('.black-screen'),
            status: 'not loading',
            message: '',
            on: function(){
                util.loading.status = 'loading'
                util.loading.element.classList.remove('hide')
            },
            off: function(){
                util.loading.status = 'not loading'
                util.loading.element.classList.add('hide')
            }
        },

        modal: {
            element: document.querySelector('.modal-confirm'),
            yesEl: document.querySelector('#modalSure'),
            noEl: document.querySelector('#modalCancel'),
            callback: '',
            on: function(message, yes, no, callback){
                var util = util.modal
                util.callback = ''

                var message = document.querySelector('.modal-confirm .message')

                message.textContent = message
                util.yesEl.textContent = yes
                util.noEl.textContent = no

                util.element.classList.add('on')
                util.callback = callback
            },
            off: function(){
                var util = util.modal
                util.callback = ''
                util.element.classList.remove('on')
            }
        },

        formatTime: function(time){
            return [
                Math.floor((time % 3600) / 60), // minutes
                ('00' + Math.floor(time % 60)).slice(-2) // seconds
            ].join(':')
        },

        calcScale: function(plainWidth, plainHeight, changedWidth, changedHeight){
            var scaleX = changedWidth/plainWidth
            var scaleY = changedHeight/plainHeight
            return { x: scaleX, y: scaleY }
        },

        clipHi: function(regionId){
            var clips = document.querySelectorAll('#clips div video')
            for(let elem of clips){
                elem.classList.remove('yellow')
            }
            var highlight = document.querySelector(`#clips #${regionId} video`)

            var clipContainer = document.querySelector('.clips-container h2')
            clipContainer.textContent = '클립 영역 [' + wavesurfer.regions.list[regionId].attributes +']'

            if(document.forms.returned){
                var returnedWork = document.forms.returned.querySelector('textarea')
                var returnedWork_select = document.forms.returned.querySelector('#returnedWork')

                if(returnedWork){
                    returnedWork.value = ''
                    returnedWork_select.value = document.forms.returned.rejection.options[0].value
    //                document.forms.returned.options[0].value
                }
            }

            return highlight.classList.add('yellow')
        }
    }
}())
//
//util.modal.noEl.addEventListener('click', function(){
//    util.modal.off()
//})

var MoveElement = (function(){
    function MoveElement(element, originElement){
        this.element = element
        this.status = 'not clicked'
        this.startX = 0
        this.startY = 0
        this.originElement = originElement
        this.originX = this.originElement.getBoundingClientRect().left
        this.originY = this.originElement.getBoundingClientRect().top
    }

    MoveElement.prototype.active = function(option){
        this.element.classList[option]('moving')
    }

    MoveElement.prototype.startPos = function(x, y){
        this.status = 'clicked'
        this.startX = x + this.originX
        this.startY = y + this.originY
        this.active('add')
    }

    MoveElement.prototype.transform = function(x, y){
        if(x - this.startX < 0 || y - this.startY < 0) return
        this.element.style.transform = `translate(${x - this.startX}px, ${y - this.startY}px)`
    }

    MoveElement.prototype.posInit = function(){
        this.status = 'not clicked'
        this.startX = 0
        this.startY = 0
        this.active('remove')
    }

    return MoveElement
}())