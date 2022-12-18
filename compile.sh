#!/bin/bash

EMSDK_PATH=${EMSDK_PATH:-../../../emscripten/emsdk/}

rm -rf bin native src/prejs
mkdir src/prejs &&
mkdir bin &&
mkdir native &&
$EMSDK_PATH/emsdk activate 2.0.6 && \
source $EMSDK_PATH/emsdk_env.sh && \
for i in low high med ultra; do
    echo "Starting $i";
    TOTALMEM=$(grep CLIPAHA_MAX_MEMORY "src/params/$i.h" | cut -d' ' -f 3);
    MODNAME="EXPORT_NAME=\"Clipaha_$i\"";
    mkdir "bin/$i" &&
    sed -e "s/{{VERSION}}/$i/g" -e "s/{{TOTALMEM}}/$TOTALMEM/g" < src/prejs.js > "src/prejs/${i}_prejs.js" &&
    sed -e "s/{{VERSION}}/$i/g" -e "s/{{TOTALMEM}}/$TOTALMEM/g" < src/prewasm.js > "src/prejs/${i}_prewasm.js" &&
#    emsdk activate latest-fastcomp && \
    emcc -include "src/params/$i.h" -DCLIENT -DJS_CODE -DARGON2_NO_THREADS src/login.c phc-winner-argon2/src/argon2.c phc-winner-argon2/src/core.c phc-winner-argon2/src/blake2/blake2b.c phc-winner-argon2/src/encoding.c phc-winner-argon2/src/ref.c -O3 -Iphc-winner-argon2/include -o "bin/$i/aworker.js" --js-library src/post.js -s 'DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=["$hash_password"]' -s 'EXPORTED_FUNCTIONS=["hash_password"]' -s NO_FILESYSTEM=1 -s NO_EXIT_RUNTIME=1 -s INITIAL_MEMORY=${TOTALMEM}MB -s MAXIMUM_MEMORY=${TOTALMEM}MB -s ENVIRONMENT='worker' -s INVOKE_RUN=0 -s 'MALLOC="emmalloc"' -s WASM=0 -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s MODULARIZE=1 -s "$MODNAME" --memory-init-file 1 -s DYNAMIC_EXECUTION=0 -s ELIMINATE_DUPLICATE_FUNCTIONS=1 -s ALLOW_MEMORY_GROWTH=0 --pre-js "src/prejs/${i}_prejs.js" -s 'INCOMING_MODULE_JS_API=["buffer"]' -s LEGACY_VM_SUPPORT=1 && \
    emcc -include "src/params/$i.h" -DCLIENT -DJS_CODE -DARGON2_NO_THREADS src/login.c phc-winner-argon2/src/argon2.c phc-winner-argon2/src/core.c phc-winner-argon2/src/blake2/blake2b.c phc-winner-argon2/src/encoding.c phc-winner-argon2/src/ref.c -O3 -Iphc-winner-argon2/include -o "bin/$i/a.js" --js-library src/post.js -s 'DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=["$hash_password"]' -s 'EXPORTED_FUNCTIONS=["hash_password"]' -s NO_FILESYSTEM=1 -s NO_EXIT_RUNTIME=1 -s INITIAL_MEMORY=${TOTALMEM}MB -s MAXIMUM_MEMORY=${TOTALMEM}MB -s ENVIRONMENT='web' -s INVOKE_RUN=0 -s 'MALLOC="emmalloc"' -s WASM=0 -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s MODULARIZE=1 -s "$MODNAME" --memory-init-file 1 -s DYNAMIC_EXECUTION=0 -s ELIMINATE_DUPLICATE_FUNCTIONS=1 -s ALLOW_MEMORY_GROWTH=0 --pre-js "src/prejs/${i}_prejs.js" -s 'INCOMING_MODULE_JS_API=["buffer"]' -s LEGACY_VM_SUPPORT=1 && \
#    emsdk activate latest-fastcomp && \
    emcc -include "src/params/$i.h" -DCLIENT -DJS_CODE -DARGON2_NO_THREADS src/login.c phc-winner-argon2/src/argon2.c phc-winner-argon2/src/core.c phc-winner-argon2/src/blake2/blake2b.c phc-winner-argon2/src/encoding.c phc-winner-argon2/src/ref.c -O3 -Iphc-winner-argon2/include -o "bin/$i/awasmworker.js" --js-library src/post.js -s 'DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=["$hash_password"]' -s 'EXPORTED_FUNCTIONS=["hash_password"]' -s NO_FILESYSTEM=1 -s NO_EXIT_RUNTIME=1 -s INITIAL_MEMORY=16MB -s MAXIMUM_MEMORY=${TOTALMEM}MB -s ENVIRONMENT='worker' -s INVOKE_RUN=0 -s 'MALLOC="emmalloc"' -s WASM=1 -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s MODULARIZE=1 -s "$MODNAME" --memory-init-file 1 -s DYNAMIC_EXECUTION=0 -s ALLOW_MEMORY_GROWTH=1 --pre-js "src/prejs/${i}_prewasm.js" -s 'INCOMING_MODULE_JS_API=["wasmMemory"]' && \
    emcc -include "src/params/$i.h" -DCLIENT -DJS_CODE -DARGON2_NO_THREADS src/login.c phc-winner-argon2/src/argon2.c phc-winner-argon2/src/core.c phc-winner-argon2/src/blake2/blake2b.c phc-winner-argon2/src/encoding.c phc-winner-argon2/src/ref.c -O3 -Iphc-winner-argon2/include -o "bin/$i/awasm.js" --js-library src/post.js -s 'DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=["$hash_password"]' -s 'EXPORTED_FUNCTIONS=["hash_password"]' -s NO_FILESYSTEM=1 -s NO_EXIT_RUNTIME=1 -s INITIAL_MEMORY=16MB -s MAXIMUM_MEMORY=${TOTALMEM}MB -s ENVIRONMENT='web' -s INVOKE_RUN=0 -s 'MALLOC="emmalloc"' -s WASM=1 -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s MODULARIZE=1 -s "$MODNAME" --memory-init-file 1 -s DYNAMIC_EXECUTION=0 -s ALLOW_MEMORY_GROWTH=1 --pre-js "src/prejs/${i}_prewasm.js" -s 'INCOMING_MODULE_JS_API=["wasmMemory"]' && \
    sed -e "s/{{VERSION}}/$i/g" -e "s/{{TOTALMEM}}/$TOTALMEM/g" < src/worker.js > "bin/$i/worker.js" &&
    sed -e "s/{{VERSION}}/$i/g" -e "s/{{TOTALMEM}}/$TOTALMEM/g" < src/clipaha.js > "bin/$i/clipaha.js" &&
    gcc -include "src/params/$i.h" -DARGON2_NO_THREADS src/main.c src/login.c phc-winner-argon2/src/argon2.c phc-winner-argon2/src/core.c phc-winner-argon2/src/blake2/blake2b.c phc-winner-argon2/src/encoding.c phc-winner-argon2/src/opt.c -O3 -o "native/$i-opt"  -march=native && 
    gcc -include "src/params/$i.h" -DARGON2_NO_THREADS src/main.c src/login.c phc-winner-argon2/src/argon2.c phc-winner-argon2/src/core.c phc-winner-argon2/src/blake2/blake2b.c phc-winner-argon2/src/encoding.c phc-winner-argon2/src/ref.c -O3 -o "native/$i-ref" && 
    echo "done $i" ||  exit 1;
done &&
rm -rf benchmark/bin example/bin &&
cp -R bin libsodium.js/dist/browsers/sodium.js benchmark/ &&
cp -R bin example/ ||
exit 1;
