
function genCreds() {
  var spinner = document.createElement("span");
  spinner.className = "spinner-border spinner-border-sm";
  var button = document.getElementById('submitbtn');
  button.appendChild(spinner);
  button.disabled = true;
  var t0 = performance.now();
  function processForm(epassword) {
    document.getElementById('encrypted-password').value = epassword;
    var t1 = performance.now();
    console.log("All took exactly "+(t1-t0));
    document.getElementById('form').submit();
    spinner.remove();
    button.disabled=false;
  }
  function handleError(e) {
    spinner.remove();
    button.disabled=false;
    alert("Error handling the password, please try again");
  }
  var d = document.domain; //This can be expanded to add things like port and so
  var i = document.getElementById('login').value;
  var p = document.getElementById('password').value;
  clipaha_ultra_hash (d,i,p,processForm,handleError);
  return false;
}
