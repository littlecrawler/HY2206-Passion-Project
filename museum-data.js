import { periods } from './exhibit-data.js?v=20261122-smooth-entry';

export const hallViewZ = 18;

export const rooms = periods.map((period, index) => {
  const theta = (-72 + index * (144 / 7)) * Math.PI / 180;
  // Leave space between complete room shells, including their front corners.
  const x = Math.sin(theta) * 31.5, z = -Math.cos(theta) * 31.5;
  return {
    ...period, index, accent: '#b9d4de', theta, x, z,
    photos: period.id === 'song' ? ['songpaper', ...period.photos] : period.photos,
    // Face the entrance viewpoint so the end galleries reveal their back walls.
    angle: Math.atan2(-x, hallViewZ - z)
  };
});
