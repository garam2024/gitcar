
window.onload = board_modal(3);

function  board_modal(length){
background();
var i;
for (i=length; i>0; i--){
modal_message(i)
}
modal_close(i,length)
}
function modal_message(i) {
document.getElementById("modal_ground").innerHTML += `
    <div class="modal" style="box-shadow: 1px 1px 7px 1px #d0cece;position:absolute; width:24vw; height:26vh; top:20vh; display:grid; justify-content: center; background-color: rgb(255,255,255,1);">
<h2 class="title">공지${i}</h2>
      <div class="modal-content">
        <p>공지내용</p>
      </div>
<button class="read${i}" onclick="modal_close(${i})">확인</button>
    </div>
    `}
function background(){document.body.innerHTML +=`
<div id="modal_ground" style="width:100%; height:100%; background-color:rgb(0,0,0,0.5); position:absolute; top:0; left:0; display:flex; justify-content:center;"></div>
`}

function modal_close(i,length){
if (i==length){
document.querySelector(`#modal_ground .read${i}`).parentNode.remove();
document.getElementById("modal_ground").remove();
}
else{document.querySelector(`#modal_ground .read${i}`).parentNode.remove();}
}



