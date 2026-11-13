#ifndef CONTOUR_HPP
#define CONTOUR_HPP

#include "particle.hpp"
#include <cmath>

struct ContourPoint {
    float x, y;
};

// Generates equidistant grid / mesh anchors across width and height
inline int generate_grid_anchors(ContourPoint* points, int maxPoints, float width, float height, float spacing) {
    int count = 0;
    for (float y = spacing; y < height - spacing; y += spacing) {
        for (float x = spacing; x < width - spacing; x += spacing) {
            if (count >= maxPoints) return count;
            points[count].x = x;
            points[count].y = y;
            count++;
        }
    }
    return count;
}

#endif // CONTOUR_HPP
