

function duplicte_submit2() {
  var nid = $("#nid").val();

  


  if (nid == '') {

    alert("아이디를 입력해주세요");
    $("#nid").focus();
    // var idcheck = document.createTextNode('안녕');
    // var idcheckPop = document.createElement('div');
    // idcheckPop.appendChild(idcheck);
    // idcheckPop.classList.add('popUp');
    // var sub_wrap = document.querySelector(".sub_wrap");
    // document.sub_wrap.appendChild(idcheckPop);  
  } else {
    $.ajax({
      type: "POST",
      url: "duplicate_check/",
      data: { 'nid': nid },
      dataType: "json",
      success: function (response) {
        if (response.message == 1) {
          
          $("#npw").focus();
          $("#id_chk + input").val("OK");
          alert("사용 가능한 아이디 입니다");
        } else if (response.message == 0) {
          alert("존재하는 아이디 입니다");
          $("#nid").val('');
        }
      },
    })
  }
}

var regist_btn = document.getElementById("register_do")

function register_submit() {
  // var form_ID= "#register_doForm";
  // var post_type= $('<input/>', {name:'post_type', type:'hidden', charset:'utf-8',value: "register"});
  // $(form_ID).append(post_type);


  if (validate()) {
    // $(form_ID).submit();
    var method = method || "post";
    post_to_url('/register_form', method)
  }
}

function post_to_url(path, method) {

  var form = document.createElement("form");

  var nname = document.getElementById("nname").value
  var nid = document.getElementById("nid").value
  var npw = document.getElementById("npw").value
  var nphone = document.getElementById("nphone").value
  var ngroup= document.getElementById("ngroup").value
  var nemail = document.getElementById("nemail").value

  form.setAttribute("method", method);
  form.setAttribute("action", path);

  // id
  var hiddenField = document.createElement("input");
  hiddenField.setAttribute("type", "hidden");
  hiddenField.setAttribute("name", "nid");
  hiddenField.setAttribute("value", nid);
  form.appendChild(hiddenField);

  // pw
  var hiddenField2 = document.createElement("input");
  hiddenField2.setAttribute("type", "hidden");
  hiddenField2.setAttribute("name", "npw");
  hiddenField2.setAttribute("value", npw);

  form.appendChild(hiddenField2);

  var hiddenField3 = document.createElement("input");
  hiddenField3.setAttribute("type", "hidden");
  hiddenField3.setAttribute("name", "nphone");
  hiddenField3.setAttribute("value", nphone);

  form.appendChild(hiddenField3);

  var hiddenField4 = document.createElement("input");
  hiddenField4.setAttribute("type", "hidden");
  hiddenField4.setAttribute("name", "nemail");
  hiddenField4.setAttribute("value", nemail);

  form.appendChild(hiddenField4);

  var hiddenField5 = document.createElement("input");
  hiddenField5.setAttribute("type", "hidden");
  hiddenField5.setAttribute("name", "nname");
  hiddenField5.setAttribute("value", nname);

  form.appendChild(hiddenField5);

  var hiddenField6 = document.createElement("input");
  hiddenField6.setAttribute("type", "hidden");
  hiddenField6.setAttribute("name", "ngroup");
  hiddenField6.setAttribute("value", ngroup);

  form.appendChild(hiddenField6);

  document.body.appendChild(form);
  form.submit();
}

function validate() {
  var re = /^[a-zA-Z0-9]{4,12}$/;							// 아이디 정규식
  var re2 = /(?=.*\d{1,50})(?=.*[~`!@#$%\^&*()-+=]{1,50})(?=.*[a-zA-Z]{2,50}).{8,50}$/;	//패스워드 정규식
  var re3 = /^[0-9]+$/;									//전화번호 정규식
  var re4 = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;	//이메일 정규식


  var id = document.getElementById("nid");
  var npw = document.getElementById("npw");
  var npwchk = document.getElementById("npwchk");
  var nphone = document.getElementById("nphone");
  var nemail = document.getElementById("nemail");
  var ngroup = document.getElementById("ngroup");

  if (!check(re, id, "아이디는 4~12자의 영문 대소문자와 숫자가 아닙니다.")) {
    return false;
  }
  if ($("#id_chk + input").val() == '') {
    alert('아이디 중복 확인을 해주세요.');
    return false;
  }

  if (!check(re2, npw, "숫자, 특문 각 1회 이상, 영문은 2개 이상 사용하여 8자리 이상이 아닙니다.")) {
    return false;
  }

  if (npw.value != npwchk.value) {
    alert("비밀번호가 다릅니다.");
    npwchk.value = "";
    npwchk.focus();
    return false;
  }

  if(ngroup.value === '선택 없음'){
    alert('소속을 선택하세요.')
    return false;
  }

  if (!check(re3, nphone, "올바른 전화번호 형식이 아닙니다.")) {
    return false;
  }

  if (!check(re4, nemail, "올바른 이메일 형식이 아닙니다.")) {
    return false;
  }


  // $("#nname, #nbirth, #nphone").removeAttr("disabled");

  return true
}

function check(re, what, message) {
  if (re.test(what.value)) {
    return true;
  }

  alert(message);
  what.value = "";
  what.focus();
}