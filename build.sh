# em++ -std=c++11 ./cpp/logic.cc ./cpp/particle.cpp ./cpp/ball.cpp ./cpp/paddle.cpp ./cpp/block.cpp  ./cpp/star.cpp ./cpp/glow.cpp ./cpp/lava.cpp ./cpp/levelMaker.cpp ./cpp/game.cpp -O3 -s WASM=1 -o ./js/logic.wasm -o ./js/logic.js -sEXPORTED_FUNCTIONS=['_malloc']  -s EXPORTED_RUNTIME_METHODS='["cwrap","UTF8ToString","lengthBytesUTF8","stringToUTF8"]'
# -s DISABLE_EXCEPTION_CATCHING=1 \
em++ -std=c++11 ./cpp/logic.cc ./cpp/particle.cpp ./cpp/ball.cpp ./cpp/paddle.cpp ./cpp/block.cpp ./cpp/star.cpp ./cpp/glow.cpp ./cpp/lava.cpp ./cpp/levelMaker.cpp ./cpp/game.cpp \
-Oz \
-s WASM=1 \
-o ./js/logic.wasm \
-o ./js/logic.js \
-s EXPORTED_FUNCTIONS=['_malloc'] \
-s EXPORTED_RUNTIME_METHODS='["cwrap"]'