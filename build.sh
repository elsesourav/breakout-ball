# em++ -std=c++11 ./cpp/game.cc ./cpp/particle.cpp -O3 -s WASM=1 -o ./js/game.wasm -o ./js/game.js -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]'
em++ -std=c++11 ./cpp/logic.cc ./cpp/particle.cpp -O3 -s WASM=1 -o ./js/logic.wasm -o ./js/logic.js -sEXPORTED_FUNCTIONS=['_malloc']  -s EXPORTED_RUNTIME_METHODS='["cwrap","UTF8ToString","lengthBytesUTF8","stringToUTF8"]'
