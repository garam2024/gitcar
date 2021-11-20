//document.body.addEventListener('load',alertalert);

var menuPath = window.location.pathname;
var menuChoice = document.querySelectorAll(".flex_col");
var workMain_2 = document.querySelector('.workMain_2')

menuPathArray = [
    ["/work_list"],
    ["/inspect_list_1st", "/inspect_list_2nd", "/inspect_list_3rd"],
    ["/interface_guide_list", '/main'],
    ["/mywork"],
    ["/mywork_record", "/myinspect-record"],
    ["/board_list", "/board_read", "/board_write", "/board_update", "/board_delete", "/board_update_option"]
]

function removeFocus(exceptionName, list, elList){
      for(let i = 0; i < list.length; i++){
          for(let j = 0; j < list[i].length; j++){
                if(list[i][j] === exceptionName){
                    elList[i].classList.add('focus')
                    return
                }
          }
      }
}

removeFocus(menuPath, menuPathArray, menuChoice)

if(workMain_2){
    workMain_2.addEventListener('click', e => {
        if(e.target.classList.contains('mytask-memo') == -1) return
        e.target.classList.toggle('active')
    })
}