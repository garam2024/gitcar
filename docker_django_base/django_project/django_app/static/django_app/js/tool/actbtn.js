let act_list = [];
let feel_list = [];
let human = []
var j =-1;
let human_variable = {
  사람: j++,
  감정: [],
  행동: [],
}

let _status = {
  사람: []
}

let count = 0

const human_feel = document.querySelectorAll(".human_feel");
const programming = document.getElementById("programming");
const design = document.getElementById("design");
const addHumanBtn = document.querySelector('.add')
const container = document.querySelector('.humaninfo')
addHumanBtn.addEventListener('click', e => {
  human_variable['사람'] = j++;
  container.innerHTML += `
  <div class="flexrow">
  <button class="human_remove">삭제</button>
  <button class="human_loading">전작업</button>
  
  <span>사람</span>
  <span>${j}</span>
  <div class="human_act ${j}">행동입니다</div>
  <div class="human_feel">감정입니다</div>
  </div>`
})
//삭제 버튼 누르면 사람 삭제  부모 노드 삭제 

//취소하면 첫번째 화면으로 
const inputName = document.getElementsByName('cansle');
const all = document.getElementById("all");
for (var i = 0; i < inputName.length; i++) {
  inputName[i].addEventListener('click', function () {
    all.checked = true;
  })
}
//행동입력버튼 
container.addEventListener('click', e => {
  console.log(e.target.classList)
  // console.log(e.target.parentNode.childNodes)
  if (e.target.classList[0] == 'human_act'){
    programming.checked = true;
    act_list = [];
    console.log(e.target.classList.item(1))
  }
  else if (e.target.classList[0] =='human_feel'){
    design.checked = true;
  }
  else if (e.target.classList[0]=="human_remove"){
    e.target.parentNode.style.display="none";
  }

  let variable = {
    id: count++,
    name: '철수'
  }

  _status.사람.push(variable)
  console.log(_status)
 
})
//행동 선택하면 배경색 바뀌는 클래스 추가
const actbtn = document.querySelectorAll(".actbtn li:not(:nth-child(1))")
for (var i = 0; i < actbtn.length; i++) {
  actbtn[i].addEventListener('click', function (event) {
    event.target.classList.toggle('checkBtn')
  })
}
//행동 선택하고 저장 누르면 리스트에 저장되고 사람 정보에 등록됨 
const inputSave = document.getElementsByName('save');
for (var i = 0; i < inputName.length; i++) {
  inputSave[i].addEventListener('click', function () {
    for (var i = 0; i < actbtn.length; i++) {
      if (actbtn[i].classList == "checkBtn") {
        act_list.push(actbtn[i].innerText);
        human_variable['행동']=act_list; 
        human.push(human_variable)
      }
    }
    all.checked = true;
    const human_act = document.querySelectorAll(".human_act");
  })
}
