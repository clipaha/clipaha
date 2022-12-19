#!/bin/bash

bash ./compile.sh &&
rm -f clipaha.tar.xz &&
tar --exclude example/server.py --exclude benchmark/download.php --exclude benchmark/save.php --exclude benchmark/db.sql --numeric-owner --owner clipaha:0 --group clipaha:0 --mtime=now  -cvJf clipaha.tar.xz benchmark bin cleanup.sh compile.sh release.sh native/*-ref example/ libsodium.js/dist/browsers/sodium.js LICENSE phc-winner-argon2/include/ phc-winner-argon2/src/ src/ ||
exit 1
