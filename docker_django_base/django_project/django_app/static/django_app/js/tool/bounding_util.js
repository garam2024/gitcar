(function(){
    function FixedElement(standard, element, ...addClass){
        this.standard = standard
        this.element = element
        this.addClass = [...addClass]
    }

    FixedElement.prototype.init = function(e){
        const standardElement = document.querySelector(this.standard)
        const flowElement = document.querySelector(this.element)

        const element_position = standardElement.getBoundingClientRect().top
        const screen_position = standardElement.scrollTop

        if(element_position < screen_position){
            this.addClass.forEach(_class => {
                flowElement.classList.add(_class)
            })
        }else{
            this.addClass.forEach(_class => {
                flowElement.classList.remove(_class)
            })
        }
    }

    let fixedToolBox = new FixedElement('.image-labeling-main', '.flow-element', 'fixed', 'container')

    window.addEventListener('scroll', (e) => {
        fixedToolBox.init(e)
    })

    const labelingPageNav = document.querySelector('.labeling-page-nav')
    const toggleBtn = document.querySelector('.labeling-page-nav .toggle-button')

    toggleBtn.addEventListener('click', function(){
        let open = this.classList.toggle('active')

        if(open){
            labelingPageNav.classList.add('active')
        }else{
            labelingPageNav.classList.remove('active')
        }
    })
})()