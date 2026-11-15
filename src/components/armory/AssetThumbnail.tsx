import React from 'react';
import { getAssetThumbnail } from '../../services/assetCanvasCache';

interface AssetThumbnailProps {
  upgradeId?: string;
  type?: 'ball' | 'paddle' | 'power';
  level?: number;
  size?: number;
  className?: string;
  glow?: boolean;
}

export const AssetThumbnail: React.FC<AssetThumbnailProps> = ({
  upgradeId,
  type,
  level = 1,
  size = 32,
  className = '',
  glow = false,
}) => {
  const targetKey = upgradeId || type || 'ball';
  const dataUrl = getAssetThumbnail(targetKey, level);

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className={className} />;
  }

  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt={targetKey}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        filter: glow ? 'drop-shadow(0 0 6px currentColor)' : undefined,
      }}
      className={`inline-block object-contain pointer-events-none select-none ${className}`}
      loading="eager"
      decoding="async"
    />
  );
};
