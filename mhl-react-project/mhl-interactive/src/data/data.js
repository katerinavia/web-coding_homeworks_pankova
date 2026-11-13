// Данные приложения хранятся в JavaScript-модулях, а не размечены вручную в каждом HTML.
export const teams = [
  { id: 'dynamo-m', name: 'МХК Динамо М', city: 'Москва', image: 'dynamo-m.png' },
  { id: 'krylya-sovetov', name: 'Крылья Советов', city: 'Москва', image: 'krylya-sovetov.png' },
  { id: 'spartak', name: 'МХК Спартак', city: 'Москва', image: 'spartak.png' },
  { id: 'spartak-max', name: 'МХК Спартак МАХ', city: 'Москва', image: 'spartak-max.png' },
  { id: 'krasnaya-armiya', name: 'Красная Армия', city: 'Москва', image: 'krasnaya-armiya.png' },
  { id: 'krasnaya-mashina', name: 'Красная Машина Юниор', city: 'Москва', image: 'krasnaya-mashina.png' },
  { id: 'dynamo-spb', name: 'МХК Динамо СПб', city: 'Санкт-Петербург', image: 'dynamo-spb.png' },
  { id: 'ska-1946', name: 'СКА-1946', city: 'Санкт-Петербург', image: 'ska-1946.png' },
  { id: 'omskie-yastreby', name: 'Омские Ястребы', city: 'Омск', image: 'omskie-yastreby.png' },
  { id: 'kuznetskie-medvedi', name: 'Кузнецкие Медведи', city: 'Новокузнецк', image: 'kuznetskie-medvedi.png' },
  { id: 'loko', name: 'Локо', city: 'Ярославль', image: 'loko.png' },
  { id: 'stalnye-lisy', name: 'Стальные Лисы', city: 'Магнитогорск', image: 'stalnye-lisy.png' }
];

export const matches = [
  { id: 'm1', homeId: 'dynamo-m', awayId: 'omskie-yastreby', home: 'МХК Динамо М', away: 'Омские Ястребы', time: '13:00', date: 'ВС, 22.03.2026', city: 'Москва', venue: 'Москва', status: 'купить билет', purchasable: true },
  { id: 'm2', homeId: 'dynamo-spb', awayId: 'kuznetskie-medvedi', home: 'МХК Динамо СПб', away: 'Кузнецкие Медведи', time: '13:00', date: 'ВС, 22.03.2026', city: 'Санкт-Петербург', venue: 'Санкт-Петербург', status: 'вход свободный', purchasable: false },
  { id: 'm3', homeId: 'ska-1946', awayId: 'loko', home: 'СКА-1946', away: 'Локо', time: '19:00', date: 'ВС, 23.03.2026', city: 'Санкт-Петербург', venue: 'Санкт-Петербург', status: 'продано', purchasable: false },
  { id: 'm4', homeId: 'krylya-sovetov', awayId: 'stalnye-lisy', home: 'Крылья Советов', away: 'Стальные Лисы', time: '19:30', date: 'ВС, 23.03.2026', city: 'Москва', venue: 'Москва', status: 'скоро в продаже', purchasable: false }
];

export const getTeam = (id) => teams.find((team) => team.id === id);
export const getMatch = (id) => matches.find((match) => match.id === id) || matches[0];
