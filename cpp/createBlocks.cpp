#include "createBlocks.h"
#include <sstream>

std::vector<Block> Blocks::convertStringToBlocks(const std::string &str, short _w, short _h) {
   std::vector<Block> blocks;
   std::stringstream ss(str);
   std::string token;
   int count = 0;
   int x, y, health;
   
   while (std::getline(ss, token, '-')) {
      if (count == 0) {
         x = std::stoi(token);
      } else if (count == 1) {
         y = std::stoi(token);
      } else if (count == 2) {
         health = std::stoi(token);
         blocks.emplace_back(x, y, _w, _h, health);
         count = -1;
      }
      count++;
   }
   return blocks;
}
