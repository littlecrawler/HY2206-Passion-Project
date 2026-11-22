import { periods } from './exhibit-data.js?v=20261122-gallery';

export const rooms = periods.map((period, index) => ({
  ...period, index, accent: '#b9d4de',
  theta: (-73.5 + index * 21) * Math.PI / 180,
  x: Math.sin((-73.5 + index * 21) * Math.PI / 180) * 24,
  z: -Math.cos((-73.5 + index * 21) * Math.PI / 180) * 24,
  angle: (73.5 - index * 21) * Math.PI / 180
}));
