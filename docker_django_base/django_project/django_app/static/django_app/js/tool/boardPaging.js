//공지사항 글 불러오기 & 페이징
(function(){
    var boardContainer = document.querySelector('.board-list-page')
    if(!boardContainer) return // 이 요소가 없을 경우 아래 코드를 실행시키지 않음
    var bringBoard = new BringBoard(boardContainer.querySelector('table'), boardContainer.querySelector('.pageTable'))
    console.log(bringBoard)
    function BringBoard(element, pgElement){
        this.start = 1
        this.end = ''
        this.now = ''
        this.all = ''
        this.showListLength = 10
        this.interval = 10
        this.data = null
        this.element = element
        this.pgElement = pgElement
        this.superuser = ''
        this.search = {

        }
    }

    BringBoard.prototype.showListOptionChange = function(status){
        this.showListLength = status
        this.page(this.start, null, 'board_list')
    }

    BringBoard.prototype.page = function(page, search, url){
       var val;

       if(page === 'prev'){
          val = bringBoard.now - bringBoard.interval
          page = val > 0 ? val : 1
       }else if(page === 'next'){
          val = bringBoard.now + bringBoard.interval
          page = val > bringBoard.end ? bringBoard.end : val
       }

       var param = {
        start: page,
        showListLength: bringBoard.showListLength
       }

       $.ajax({
            url: url,
            type: 'post',
            data: JSON.stringify(param),
            success: function(data){
                console.log(data)
                //성공 시 상태 업데이트
                bringBoard.all = data.boardLength
                bringBoard.data = data.boardList
                bringBoard.end = Math.ceil(data.boardLength / bringBoard.showListLength)
                bringBoard.now = page
                bringBoard.superuser = data.is_superuser

                bringBoard.draw()
            },
            error: function(error){

            }
        })
    }

    bringBoard.draw = function(){ //가져온 글 그리기
       var tBody = bringBoard.element.querySelector('tbody'),
       pgElement = bringBoard.pgElement

       tBody.innerHTML = '';
       pgElement.innerHTML = '';

       for(var i = 0; i < bringBoard.data.length; i++){
            var value = bringBoard.data[i].option
            value = value === 'notice' ? 'checked' : ''
            var addHtml =
                `<td>
                    <button type='button' data-update-option=${bringBoard.data[i].content_id} class='btn btn-success' style='padding: 3px; border-radius: 2px; font-size: 12px;'>적용하기</button>
                </td>`

            tBody.innerHTML +=
            `<tr>
                <td scope=row>${bringBoard.data[i].content_id}</td>
                <td><a href=board_read?content_id=${bringBoard.data[i].content_id}>${bringBoard.data[i].title}</a></td>
                <td>${bringBoard.data[i].writer}</td>
                <td>${bringBoard.data[i].regdate}</td>
                <td><input type='checkbox' class='btn-check' ${value} ${ bringBoard.superuser? '' : 'disabled' }></td>
                ${ bringBoard.superuser? addHtml : '' }
            </tr>`
       }

       pgElement.innerHTML += `<li class=page-item><a class=page-link data-page=prev>Previous</a></li>`
       for(var i = 0; i < bringBoard.end; i++){
            if((bringBoard.now - 1) === i){
                pgElement.innerHTML += `<li class='page-item hover active'><a class=page-link data-page=${i + 1}>${i + 1}</a></li>`
            }else{
                pgElement.innerHTML += `<li class='page-item hover'><a class=page-link data-page=${i + 1}>${i + 1}</a></li>`
            }
       }
       pgElement.innerHTML += `<li class=page-item><a class=page-link data-page=next>Next</a></li>`
    }

    bringBoard.updateOption = function(e, contentId){
        console.log(contentId)
        var tr = e.target.parentNode.parentNode
        var checkbox = tr.querySelector("input[type='checkbox']")
        console.log(checkbox.checked)
        var option = checkbox.checked? 'notice' : 'normal'

        $.ajax({
            url: '/board_update_option',
            type: 'post',
            data: { 'option': option, 'content_id': contentId },
            success : function(result){
                alert(result.message)
            },
            error:function(err){
                console.log(err)
            },
        })
    }

    //이벤트
    bringBoard.pgElement.addEventListener('click', function(e){ //페이지네이션 버튼 클릭
        var pageData = e.target.dataset.page
        if(!pageData) return
        bringBoard.page(pageData, null, 'board_list')
    })

    //board_update_option?content_id=${bringBoard.data[i].content_id}
    bringBoard.element.addEventListener('click', function(e){
        var content = e.target.dataset.updateOption
        if(!content) return
        console.log(content)
        bringBoard.updateOption(e, content)
    })

    var select = document.querySelector('#showListLength')
    select.addEventListener('change', function(e){
        if(isNaN(e.currentTarget.value)) return
        bringBoard.showListOptionChange(e.currentTarget.value)
    })

    bringBoard.page(bringBoard.start, null, 'board_list')
}());