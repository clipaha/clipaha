mergeInto(LibraryManager.library, {
  prepareString: function (s) {
    var blength = lengthBytesUTF8(s)+1;
    var rs = stackAlloc(blength);
    stringToUTF8(s, rs, blength);
    return [rs, blength-1];
  },
  prepareString__deps: ['stackAlloc'],
  getBuffer: function(p,l) {
    var rv = new Uint8Array(l);
    var i;
    for (i = 0; i < l; i++)
      rv[i] = HEAPU8[p+i];
    return rv;
  },
  getBuffer__deps: [],
  arrayToHex: function(a) {
    var rv = [];
    var hx = '0123456789abcdef';
    var i;
    for (i = 0; i < a.length; i++) {
      rv.push(hx[(a[i] >> 4) & 0xf]);
      rv.push(hx[a[i] & 0xf]);
    }
    return rv.join('');
  },
  arrayToHex__deps: [],
  $hash_password: function (domain, identifier, password) {
    var sp = stackSave();
    var d = _prepareString(domain);
    var i = _prepareString(identifier);
    var p = _prepareString(password);
    //32 is HASHLEN
    var k = stackAlloc(32);
    var rv1 = _hash_password(d[1], d[0], i[1], i[0], p[1], p[0], k);
    var rv2 = _arrayToHex(_getBuffer(k,32));
    stackRestore(sp);
    if (!rv1)
      return null;
    else
      return rv2;
  },
  $hash_password__deps: ['prepareString', 'stackSave', 'stackAlloc', 'stackRestore', 'getBuffer', 'arrayToHex'],
});
