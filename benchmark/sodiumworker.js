sodium = {onload: function() {
  postMessage({status:"ready"});
} };

/*HACK: for Edge/IE*/
if (typeof crypto === "undefined")
  crypto = {getRandomValues: function (a) { return a }}

importScripts('./sodium.js')

onmessage = function(e) {
  try {
    function str2array (s) {
      var ast = sodium.from_string(s)
      var arr = [];
      for (var i = 0 ; i < 32; i+=4) {
          arr.push((ast.length>>i) & 0xff);
      }
      return arr.concat(Array.from(ast));
    }
    var seclevels={
      low:{its:6,mem:(192<<10)*1024},
      med:{its:5,mem:(384<<10)*1024},
      high:{its:3,mem:(1<<20)*1024},
      ultra:{its:3,mem:((2<<20)-(32<<10))*1024}
    };
    var security = e.data.security;
    var d = e.data.bdata.domain; //This can be expanded to add things like port and so
    var i = e.data.bdata.uname;
    var p = e.data.bdata.passwd;
    var sp = sodium.from_string(p);
    var s = sodium.crypto_generichash(16,new Uint8Array([].concat(str2array(d),str2array(i))));
    var its = seclevels[security].its;
    var mem = seclevels[security].mem;
    var r = sodium.crypto_pwhash (32, sp, s, its, mem, sodium.crypto_pwhash_ALG_ARGON2ID13);
    postMessage({status:"ok",epasswd:sodium.to_hex(r)});
  } catch (e) {
    postMessage({status:"except"});
  }
}
onerror = function(e) {
  postMessage({status:"error"});
}
onmessageerror = function(e) {
  postMessage({status:"messageerror"});
}
