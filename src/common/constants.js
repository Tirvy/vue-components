export const UNITS = {
  amount: {
    id: 1,
    name: 'кол-во',
    name_postfix: '',
    value_postfix: '',
    postfix: '',
    alias: 'amount',
    aliases: ['amount', 'number', 'count', ''],
  },
  percent: {
    id: 2,
    name: '%',
    name_postfix: '',
    value_postfix: '%',
    postfix: '%',
    alias: 'percent',
    aliases: ['percent', '%'],
  },
  ruble: {
    id: 3,
    name: 'рубли',
    name_postfix: '₽',
    postfix: '₽',
    value_postfix: '',
    alias: 'ruble',
    aliases: ['ruble', 'rur'],
  },
  ue: {
    id: 4,
    name: 'у.е.',
    name_postfix: 'у.е.',
    postfix: 'у.е.', 
    value_postfix: '',
    alias: 'ue',
    aliases: ['ue'],
  },
  duration: {
    id: 5,
    name: 'время',
    name_postfix: '',
    postfix: 'с',
    value_postfix: '',
    alias: 'duration',
    aliases: ['dur', 'duration', 'time'],
  },
};
Object.values(UNITS).forEach(unit => {
  unit.postfix = unit.name_postfix || unit.value_postfix;
});

const WEEKDAYS = [
  {
    name: 'ПН',
    shortname: 'Пн',
    fullname: 'понедельник',
    holiday: false,
    alias: 0,
  },
  {
    name: 'ВТ',
    shortname: 'Вт',
    fullname: 'вторник',
    holiday: false,
    alias: 1,
  },
  {
    name: 'СР',
    shortname: 'Ср',
    fullname: 'среда',
    holiday: false,
    alias: 2,
  },
  {
    name: 'ЧТ',
    shortname: 'Чт',
    fullname: 'четверг',
    holiday: false,
    alias: 3,
  },
  {
    name: 'ПТ',
    shortname: 'Пт',
    fullname: 'пятница',
    holiday: false,
    alias: 4,
  },
  {
    name: 'СБ',
    shortname: 'Сб',
    fullname: 'суббота',
    holiday: true,
    alias: 5,
  },
  {
    name: 'ВС',
    shortname: 'Вс',
    fullname: 'воскресенье',
    holiday: true,
    alias: 6,
  },
];
