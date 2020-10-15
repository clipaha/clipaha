ampy -p /dev/ttyUSB0 rmdir www
ampy -p /dev/ttyUSB0 mkdir users
ampy -p /dev/ttyUSB0 mkdir www
ampy -p /dev/ttyUSB0 put ./login.html www/login.html
ampy -p /dev/ttyUSB0 put ./register.html www/register.html
ampy -p /dev/ttyUSB0 put ./gencreds.js www/gencreds.js
ampy -p /dev/ttyUSB0 put ./worker.js www/worker.js
ampy -p /dev/ttyUSB0 put ./bin/ultra/a.js www/a.js
ampy -p /dev/ttyUSB0 put ./bin/ultra/a.js.mem www/a.js.mem
ampy -p /dev/ttyUSB0 put ./bin/ultra/awasm.js www/awasm.js
ampy -p /dev/ttyUSB0 put ./bin/ultra/awasm.wasm www/awasm.wasm
ampy -p /dev/ttyUSB0 put ./bin/ultra/aworker.js www/aworker.js
ampy -p /dev/ttyUSB0 put ./bin/ultra/aworker.js.mem www/aworker.js.mem
ampy -p /dev/ttyUSB0 put ./bin/ultra/awasmworker.js www/awasmworker.js
ampy -p /dev/ttyUSB0 put ./bin/ultra/awasmworker.wasm www/awasmworker.wasm
ampy -p /dev/ttyUSB0 put ./bin/ultra/server.py main.py
ampy -p /dev/ttyUSB0 reset --hard

ampy -p /dev/ttyUSB0 rmdir users
ampy -p /dev/ttyUSB0 mkdir users
ampy -p /dev/ttyUSB0 reset --hard
