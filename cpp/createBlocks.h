#ifndef CREATE_BLOCKS_H
#define CREATE_BLOCKS_H

#include "block.h"
#include <string>
#include <vector>

class Blocks {
public:
   std::vector<Block> convertStringToBlocks(const std::string &str, short width, short height);
};

#endif // CREATE_BLOCKS_H
