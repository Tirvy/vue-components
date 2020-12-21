import {categories, geo, randata} from './data';

export const DATA_VARIANTS = [
  {
    id: 1,
    name: 'Плоский',
    data: randata,
  },
  {
    id: 2,
    name: 'Дерево',
    data: categories,
  },
  {
    id: 3,
    name: 'Дерево с корнем',
    data: geo,
  },
];

export const VALUE_VARIANTS = [{id: 'select', name: 'Одиночный'}, {id: 'checkbox', name: 'Множественный'}];

export const BUTTON_TEXT_TYPES = [
  {id: undefined, name: 'Стандартный'},
  {id: 'list', name: 'Список'},
  {id: 'unit_number', name: 'Количество'},
];

export const BASE_VARIANTS = [
  {id: false, name: 'Нет базового'},
  {id: true, name: 'Первый считается базовым и не выносится на отдельный уровень'},
  {id: 'mimic', name: 'Создается мнимый "все"'},
  {id: 'filtered', name: 'Создается мнимый "все", выделающий только отфильтрованные'},
];

export const CLASS_VARIANTS = [
  {id: 'none', name: 'none'},
  {id: 'w260px', name: 'w260px'},
  {id: 'w600px', name: 'w600px'},
  {id: 'w100', name: 'w100'},
];

export const STYLING_VARIANTS = [{id: 'none', name: 'Обычный'}, {id: 'account-selector', name: 'Выбор аккаунта'}];
