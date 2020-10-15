workingmem=true;
if (typeof WebAssembly === "object" && location.hash !== "#nowa") {
  __ClipAha_{{VERSION}}_mem = new WebAssembly.Memory({initial:256, maximum:{{TOTALMEM}}*(1024/64) });
  try {
    __ClipAha_{{VERSION}}_mem.grow({{TOTALMEM}}*(1024/64)-256);
  }  catch (e) {
    if (e instanceof RangeError) {
      workingmem = false;
      console.log("Failed to allocate memory");
      __ClipAha_{{VERSION}}_mem == undefined;
    } else {
      throw e;
    }
  }
  importScripts('./awasmworker.js')
} else {
  try {
    __ClipAha_{{VERSION}}_mem = new ArrayBuffer({{TOTALMEM}}*1024*1024);
  }  catch (e) {
    if (e instanceof RangeError) {
      workingmem = false;
      console.log("Failed to allocate memory");
      __ClipAha_{{VERSION}}_mem == undefined;
    } else {
      throw e;
    }
  }
  importScripts('./aworker.js')
}

onmessage = function(e) {
  if (!workingmem) {
    postMessage({status:"except"});
  } else {
    try {
      Clipaha_{{VERSION}}().then(function(Module) {
        try {
          var epwd = Module.hash_password(e.data.domain, e.data.identifier, e.data.password);
          Module=undefined;
          postMessage({status:"ok",epasswd:epwd});
        } catch (e) {
          console.log(e);
          postMessage({status:"except"});
        }
      });
    } catch (e) {
      console.log(e);
      postMessage({status:"except"});
    }
  } 
}
onerror = function(e) {
  console.log(e);
  postMessage({status:"error"});
}
onmessageerror = function(e) {
  console.log(e);
  postMessage({status:"messageerror"});
}
