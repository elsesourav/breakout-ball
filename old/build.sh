em++ -std=c++11 ./cpp/logic.cc ./cpp/particle.cpp ./cpp/ball.cpp ./cpp/paddle.cpp ./cpp/block.cpp ./cpp/star.cpp ./cpp/glow.cpp ./cpp/lava.cpp ./cpp/levelMaker.cpp ./cpp/game.cpp \
-Os \
-s WASM=1 \
-s EXPORTED_FUNCTIONS=['_malloc'] \
-s DISABLE_EXCEPTION_CATCHING=2 \
-s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
-o ./js/logic.wasm \
-o ./js/logic.js