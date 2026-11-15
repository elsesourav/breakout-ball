import React, { useState, useMemo } from 'react';

const getLowQualityAvatarUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    return `${url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}?width=64&height=64&quality=40&resize=cover`;
  }
  if (url.includes('unsplash.com')) return `${url.split('?')[0]}?w=64&q=40&auto=format&fit=crop`;
  if (url.includes('gravatar.com/avatar')) return `${url.split('?')[0]}?s=48&d=identicon`;
  if (url.includes('googleusercontent.com')) return url.replace(/=s\d+(-c)?$/, '=s48-c');
  if (url.includes('githubusercontent.com')) return `${url.split('?')[0]}?size=48`;
  return url;
};

export interface PilotAvatarProps {
  username: string;
  avatarUrl?: string;
  isUser?: boolean;
  isRank1?: boolean;
  isRank2?: boolean;
  isRank3?: boolean;
}

export const PilotAvatar: React.FC<PilotAvatarProps> = ({
  username,
  avatarUrl,
  isUser,
  isRank1,
  isRank2,
  isRank3,
}) => {
  const [imgError, setImgError] = useState(false);
  const lowQualitySrc = useMemo(() => getLowQualityAvatarUrl(avatarUrl), [avatarUrl]);
  const initials = isUser ? 'Y' : username.slice(0, 2).toUpperCase();

  let borderStyle: React.CSSProperties = {
    background: '#0a0f29',
    border: '1.5px solid rgba(100, 116, 139, 0.45)',
    color: '#cbd5e1',
  };

  if (isUser) {
    borderStyle = {
      background: 'linear-gradient(135deg, #00f7ff 0%, #3b82f6 100%)',
      border: '1.5px solid #00f7ff',
      boxShadow: '0 0 10px rgba(0, 247, 255, 0.5)',
      color: '#000000',
    };
  } else if (isRank1) {
    borderStyle = {
      background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)',
      border: '1.5px solid #ffd700',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
      color: '#ffd700',
    };
  } else if (isRank2) {
    borderStyle = {
      background: 'radial-gradient(circle, rgba(203, 213, 225, 0.25) 0%, rgba(148, 163, 184, 0.1) 100%)',
      border: '1.5px solid #cbd5e1',
      boxShadow: '0 0 8px rgba(203, 213, 225, 0.4)',
      color: '#e2e8f0',
    };
  } else if (isRank3) {
    borderStyle = {
      background: 'radial-gradient(circle, rgba(217, 119, 6, 0.25) 0%, rgba(180, 83, 9, 0.1) 100%)',
      border: '1.5px solid #f59e0b',
      boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)',
      color: '#fcd34d',
    };
  }

  return (
    <div
      style={{
        width: '20px',
        height: '20px',
        minWidth: '20px',
        minHeight: '20px',
        maxWidth: '20px',
        maxHeight: '20px',
        ...borderStyle,
      }}
      className="w-5 h-5 rounded-full flex items-center justify-center text-[8.5px] font-tech font-bold flex-shrink-0 overflow-hidden relative select-none"
    >
      {lowQualitySrc && !imgError ? (
        <img
          src={lowQualitySrc}
          alt={username}
          loading="lazy"
          decoding="async"
          width={20}
          height={20}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className={isUser ? 'font-black' : 'font-bold'}>{initials}</span>
      )}
    </div>
  );
};
