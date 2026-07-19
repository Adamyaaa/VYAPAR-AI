import React from 'react';

const PALETTE = [
  'linear-gradient(155deg, var(--color-indigo), var(--color-indigo-ink))',
  'linear-gradient(155deg, var(--color-emerald), #0b7a54)',
  'linear-gradient(155deg, #9599a6, #5b5f6b)',
  'linear-gradient(155deg, var(--color-rose), #a12a4c)',
];

function hashToIndex(input: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash % mod;
}

interface AvatarProps {
  name: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 38 }) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

  return (
    <div
      className="rounded-md flex items-center justify-center font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.34),
        background: PALETTE[hashToIndex(name, PALETTE.length)],
      }}
    >
      {initials}
    </div>
  );
};
