

clipaha_{{VERSION}}_hash=(function () {
//HACK: this is needed to avoid the gc from reaping the worker
var hworker=undefined;
var queue=[];
var scrs=document.getElementsByTagName( "script" );
var myurl=scrs[scrs.length - 1].src.split("?")[0].split("/").slice(0,-1).concat(['']).join("/");
var workingmem = true;
scrs=null;
var createWorker = function(d,i,p,processForm, errorhandler) {
  if (typeof ClipAha_avoidwasm === 'undefined' || !ClipAha_avoidwasm)
    hworker = new Worker(myurl+"worker.js");
  else
    hworker = new Worker(myurl+"worker.js#nowa");
  function hwcleanup() {
    if (typeof hworker !== 'undefined') {
      if (hworker.terminate)
        hworker.terminate();
      hworker = undefined;
    }
    if (queue.length > 0) {
      setTimeout(0,queue.shift());
    }
  }
  hworker.onmessage = function(e) {
    hwcleanup();
    if (e.data.status=="ok") {
      if (e.data.epasswd !== null)
        processForm(e.data.epasswd);
      else
        errorhandler(e.data.epasswd);
    } else {
      console.log(e.data.status);
      errorhandler(e.data.status);
    }
  }
  hworker.onerror = function(e) {
    console.log(e);
    hwcleanup();
    errorhandler(e);
  }
  hworker.onmessageerror = function(e) {
    console.log(e);
    hwcleanup();
    errorhandler(e);
  }
  hworker.postMessage({'domain': d, 'identifier': i, 'password': p});
}
return (function (d,i,p,processForm, errorhandler) {
  try {
    if ((typeof ClipAha_avoidworker === 'undefined' || !ClipAha_avoidworker) && window.Worker) {
      if (typeof hworker !== 'undefined') {
        queue.push(function() { createWorker(d,i,p,processForm,errorhandler); });
      } else {
        createWorker(d,i,p,processForm,errorhandler);
      }
    } else if (!workingmem) {
      errorhandler(null);
    } else {
      function myprocess (Module) {
        var ep = Module.hash_password(d, i, p);
        if (ep !== null)
          processForm(ep);
        else
          errorhandler(ep);
      };
      if (window.Clipaha_{{VERSION}}) {
          Clipaha_{{VERSION}}().then(myprocess);
      } else {
        if ((typeof ClipAha_avoidwasm === 'undefined' || !ClipAha_avoidwasm) && typeof WebAssembly === "object") {
          __ClipAha_{{VERSION}}_mem = new WebAssembly.Memory({initial:256, maximum:{{TOTALMEM}}*(1024/64) });
          try {
            __ClipAha_{{VERSION}}_mem.grow({{TOTALMEM}}*(1024/64)-256);
          }  catch (e) {
            if (e instanceof RangeError) {
              workingmem = false;
              console.log("Failed to allocate memory");
              __ClipAha_{{VERSION}}_mem == undefined;
              errorhandler(null);
            } else {
              throw e;
            }
          }
        } else {
          try {
            __ClipAha_{{VERSION}}_mem = new ArrayBuffer({{TOTALMEM}}*1024*1024);
          }  catch (e) {
            if (e instanceof RangeError) {
              workingmem = false;
              console.log("Failed to allocate memory");
              __ClipAha_{{VERSION}}_mem == undefined;
              errorhandler(null);
            } else {
              throw e;
            }
          }
        }
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = function() {
          Clipaha_{{VERSION}}().then(myprocess);
        }
        if ((typeof ClipAha_avoidwasm === 'undefined' || !ClipAha_avoidwasm) && typeof WebAssembly === "object")
          script.src=myurl+'awasm.js';
        else
          script.src=myurl+'a.js';
        document.head.appendChild(script);
      }
    }
  } catch (e) {
    console.log(e);
    errorhandler(e);
  }
  return false;
}); })();
