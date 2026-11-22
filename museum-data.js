import { periods } from './exhibit-data.js?v=20261122-museum-directory';

export const hallViewZ = 28;

export const rooms = periods.map((period, index) => {
  const theta = (-73.5 + index * 21) * Math.PI / 180;
  const x = Math.sin(theta) * 24, z = -Math.cos(theta) * 24;
  return {
    ...period, index, accent: '#b9d4de', theta, x, z,
    photos: period.id === 'song' ? ['songpaper', ...period.photos] : period.photos,
    // Face the entrance viewpoint so the end galleries reveal their back walls.
    angle: Math.atan2(-x, hallViewZ - z)
  };
});
