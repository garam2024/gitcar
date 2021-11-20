// window.setTimeout(function() {
//   $(".alert-auto-dismissible").fadeTo(500, 0).slideUp(500, function(){
//       $(this).remove();
//   });
// }, 800);

let logoutAlert = document.getElementById("logoutAlert");
var logoutMessage = logoutAlert? logoutAlert.innerHTML : '';

let indexAlert = document.getElementById("indexAlert");
var indexAlertmsg = indexAlert? indexAlert.innerHTML : '';






$().ready(function () {
  if(indexAlertmsg=="success"){
    Swal.fire({
      icon: 'success', // Alert 타입 
      title: logoutMessage, // Alert 제목 
   
     })
  }
  else if(indexAlertmsg=="error"){
    Swal.fire({
      icon: 'error', // Alert 타입 
      title: logoutMessage, // Alert 제목 
   
     })
  }
});



 

