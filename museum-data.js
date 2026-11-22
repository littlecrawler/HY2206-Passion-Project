import { periods } from './exhibit-data.js';

export const rooms = periods.map((period, index) => ({
  ...period, index, accent: '#b9d4de',
  side: index < 4 ? -1 : 1,
  bay: index < 4 ? index : 7 - index,
  z: 14 - (index < 4 ? index : 7 - index) * 11,
  angle: index < 4 ? Math.PI / 2 : -Math.PI / 2
}));
