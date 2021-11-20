$(function() {
    $("#login_id, #login_pw").on("keypress", function(e){
        if(e.keyCode == "13"){
            $("#login_submit").click();
        }
    });

    $("#login_submit").on("click", function() {
        if($("#login_id").val() == "") {
            $("#login_id").focus();
            return false;
        } 
        if($("#login_pw").val() == "") {
            $("#login_pw").focus();
            return false;
        }
        
        console.log("Login Check 1")
        var method = method || "post";
		post_to_url('/login_module', method) 
        
    });
});

function post_to_url(path, method) {

    console.log("Login Check 2")
    
	var form = document.createElement("form");

	var login_id = document.getElementById("login_id").value
    var login_pw = document.getElementById("login_pw").value

    form.setAttribute("method", method);
    form.setAttribute("action", path);
 
    // id
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "login_id");
    hiddenField.setAttribute("value", login_id);
    form.appendChild(hiddenField);

    // pw
    var hiddenField2 = document.createElement("input");
    hiddenField2.setAttribute("type", "hidden");
    hiddenField2.setAttribute("name", "login_pw");
    hiddenField2.setAttribute("value", login_pw);
    form.appendChild(hiddenField2);
    
    document.body.appendChild(form);
    form.submit();
}