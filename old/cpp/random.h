#ifndef RANDOM_NUMBER_H
#define RANDOM_NUMBER_H

#include <random>

// Function template to generate random numbers in a specified range [min, max]
template <typename T>
T rnd(T min, T max) {
   // Create a random number generator engine
   static std::random_device rd;  // Obtain a random seed from the OS entropy device
   static std::mt19937 gen(rd()); // Seed the generator

   // Define the distribution for random numbers in [min, max]
   std::uniform_real_distribution<T> dis(min, max);

   // Generate a random number in [min, max]
   return dis(gen);
}

#endif // RANDOM_NUMBER_H
