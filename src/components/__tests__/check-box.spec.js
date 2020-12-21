import {mount} from '@vue/test-utils';
import expect from 'expect';
import localVue from '@/_tests/local-vue-instance';

import TestingComponent from '../check-box';

describe('Checkbox', () => {
  describe('boolean variant', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(TestingComponent, {
        localVue,
        propsData: {
          value: true,
        },
      });
    });

    test('initial true', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.find('input[type="checkbox"]').element.value).toBe('true');
      expect(wrapper.find('[data-test="indicator"]').element.classList).toContain('checked');
    });

    //после обновления vue-test-utils setProps сломался
    test.skip('reacts to value-props change', () => {
      wrapper.setProps({value: false});
      expect(wrapper.find('input[type="checkbox"]').element.value).toBe('false');
      expect(wrapper.find('[data-test="indicator"]').element.classList.contains('checked')).toBeFalsy();
    });

    test('emits', () => {
      wrapper.trigger('click');
      expect(wrapper.emitted('input').length).toBe(1);
      expect(wrapper.emitted('input')[0][0]).toEqual(false);
    });
  });

  describe('array variant', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(TestingComponent, {
        propsData: {
          value: [1, 2, 3],
          id: 2,
        },
      });
    });

    test('initial true', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.find('input[type="checkbox"]').element.value).toBe('true');
      expect(wrapper.find('[data-test="indicator"]').element.classList).toContain('checked');
    });

    //после обновления vue-test-utils setProps сломался
    test.skip('reacts to value-props change', () => {
      wrapper.setProps({value: [1, 3]});
      expect(wrapper.find('input[type="checkbox"]').element.value).toBe('false');
      expect(wrapper.find('[data-test="indicator"]').element.classList.contains('checked')).toBeFalsy();
    });

    test('emits', () => {
      wrapper.trigger('click');
      expect(wrapper.emitted('input').length).toBe(1);
      expect(wrapper.emitted('input')[0][0]).toEqual([1, 3]);
    });
  });

  describe('shift-click', () => {
    let wrappers;

    beforeEach(() => {
      wrappers = [];
      for (let i = 0; i < 20; ++i) {
        wrappers.push(
          mount(TestingComponent, {
            propsData: {
              value: false,
              shift: {
                key: 'test-shift',
                index: i,
              },
            },
          })
        );
      }
    });

    test('initialy false', () => {
      wrappers.forEach(wrapper => {
        expect(wrapper.isVueInstance()).toBeTruthy();
        expect(wrapper.find('input[type="checkbox"]').element.value).toBe('false');
        expect(wrapper.find('[data-test="indicator"]').element.classList.contains('checked')).toBeFalsy();
      });
    });

    test('emits shifts', (done) => {
      wrappers[1].trigger('click');
      wrappers[10].trigger('click.shift', {
        shiftKey: true
      });
      setTimeout(() => {
        let ids_of_truth = wrappers.reduce((total, wrapper, index) => {
          if (wrapper.emitted('input')) {
            total.push(wrapper.emitted('input'));
          }
          return total;
        }, []);
        expect(ids_of_truth.length).toBe(10);

        done();
      })
    });
  });
});
