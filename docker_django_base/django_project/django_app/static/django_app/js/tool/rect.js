const gridArea = document.querySelector(".grid_area");
let gridArea_rect = gridArea.getBoundingClientRect();

const labelBtn = document.getElementById("label_btn");
let labelBtn_rect = labelBtn.getBoundingClientRect();

const labelling = document.querySelector(".labelling");
let labelling_rect = labelling.getBoundingClientRect();





console.log(window.innerWidth);
console.log((window.innerWidth-gridArea_rect.width)/2);

if (window.innerWidth>1920) {
  labelBtn.style.right = ((window.innerWidth-gridArea_rect.width)/2)+"px";
}

// const angle = document.querySelector(".fa-angle-double-right");
// angle.addEventListener('click',function(){
//   console.log("hello");
// })

const angle = document.getElementById("icon");
angle.addEventListener('click',function(){
  labelBtn.classList.toggle('hidden')
})


function act(){
     labelBtn.classList.toggle('hidden')
}