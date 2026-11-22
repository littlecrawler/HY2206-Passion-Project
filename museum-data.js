import { periods } from './exhibit-data.js';

const settings = [
  ['ORIGINS', '#89d6c7', '#d9b888', 'shells'],
  ['MANY FORMS', '#9cc894', '#d3a76a', 'shapes'],
  ['ONE STANDARD', '#73cbe1', '#dca664', 'banliang'],
  ['IN CIRCULATION', '#e6b66d', '#efc997', 'tang'],
  ['A PAPER PROMISE', '#74c7d9', '#d9ba83', 'song'],
  ['STATE & PAPER', '#a3bff4', '#d4b58a', 'yuan'],
  ['SIDE BY SIDE', '#8adacb', '#e5bb7e', 'silver'],
  ['CONNECTED MONEY', '#a899ee', '#68dbea', 'phone']
];

export const rooms = periods.map((period, index) => ({
  ...period, index, wallTitle: settings[index][0], accent: settings[index][1],
  warm: settings[index][2], sculpture: settings[index][3]
}));
