import React from 'react';
import { Obstacle, RouteBlocker } from './types';
import { RoadmapRouteBlockers } from './RoadmapRouteBlockers';
import { RoadmapAmbientHazards } from './RoadmapAmbientHazards';

interface RoadmapObstaclesProps {
  obstacles: Obstacle[];
  routeBlockers?: RouteBlocker[];
  onBlockerClick?: (blocker: RouteBlocker) => void;
}

export const RoadmapObstacles: React.FC<RoadmapObstaclesProps> = ({
  obstacles,
  routeBlockers = [],
  onBlockerClick,
}) => {
  return (
    <>
      <RoadmapRouteBlockers routeBlockers={routeBlockers} onBlockerClick={onBlockerClick} />
      <RoadmapAmbientHazards obstacles={obstacles} />
    </>
  );
};
