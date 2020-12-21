import {mount} from '@vue/test-utils';
import expect from 'expect';

import TestingComponent from '../multi-thumbler.vue';

const items = [{id:1, name: 'first'}, {id:2, name: 'chosen'}, {id:3, name: 'last one'}];

describe('DropDown', () => {
  const wrapper = mount(TestingComponent, {
    propsData: {
      data: items,
      value: items[1],
    },
  });

  test('is a Vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  });

  test('has childs as items.length', () => {
    expect(wrapper.findAll('.button').length).toBe(items.length)
  });

  test('has one chosen', () => {
    expect(wrapper.find('.color_blue')).toBeTruthy();
  });
});