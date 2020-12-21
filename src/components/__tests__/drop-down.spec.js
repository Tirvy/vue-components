import {mount} from '@vue/test-utils';
import expect from 'expect';
import Vue from 'vue';
import DropDown from '../drop-list';
import localVue from '@/_tests/local-vue-instance';


const data_source = {
  fruits: {
    banana: 0,
    mango: 0,
    apple: 0,
    pineapple: 0,
    orange: {
      mandarine: 0,
      abricose: 0,
      persic: 0,
    },
  },
  vegatables: {
    onion: 0,
  },
  cereal: {
    rice: 0,
    corn: 0,
  },
};

function getDeepArray() {
  let deep_array = [];
  let id = 1;
  const createDeepArray = (obj, deep) => {
    for (let key in obj) {
      deep_array.push({
        name: key,
        id,
        deep,
      });
      ++id;
      if (obj[key]) {
        createDeepArray(obj[key], deep + 1);
      }
    }
  };
  createDeepArray(data_source, 0);
  return deep_array;
}
let deep_array = getDeepArray();

function getShallowArray() {
  let shallow_array = [];
  let id = 1;
  const createShallowArray = (obj, deep) => {
    for (let key in obj) {
      shallow_array.push({
        name: key,
        id,
      });
      ++id;
      if (obj[key]) {
        createShallowArray(obj[key], deep + 1);
      }
    }
  };
  createShallowArray(data_source, 0);
  return shallow_array;
}
let shallow_array = getShallowArray();

describe('DropDown', () => {
  const chosen_elem = 3;
  const target_array = deep_array;
  const wrapper = mount(DropDown, {
    localVue,
    propsData: {
      value: target_array[chosen_elem],
      data: target_array,
    },
  });

  it('has button', () => {
    expect(wrapper.contains('.selectbox__text')).toBe(true);
  });

  it('has drop-down', () => {
    expect(wrapper.contains('.selectbox__dropdown')).toBe(true);
  });

  it('is Init`ed', () => {
    expect(wrapper.contains('.ddl__list')).toBe(true);
  });

  it('is initially hidden', () => {
    expect(wrapper.find('.ddl__list').isVisible()).toBe(false);
  });

  let list = wrapper.findAll('.item_select');

  it('is shown on expand', async () => {
    const button = wrapper.find('.selectbox__text');
    button.trigger('click');
    await Vue.nextTick();
    expect(wrapper.find('.selectbox__dropdown').isVisible()).toBe(true);
  });

  it('expands on button click', () => {
    expect(!!list.length).toBe(true);
  });

  it('shows selected value on expand', () => {
    expect(list.at(chosen_elem).isVisible());
  });

  it('shows value name', () => {
    expect(list.at(chosen_elem).text()).toBe(target_array[chosen_elem].name);
  });
});
