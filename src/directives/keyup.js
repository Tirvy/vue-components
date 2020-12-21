import $ from 'jquery';

let listening = false,
  objList = [];

/*
*  Directive listens to keyup's and calls function when requirements are met.
*
* input object keys:
*
*   func: required. Calls this function. If function doesent return truthful value, it will stop event propagation.
*   param: optional. Passes this param as func argument.
*   keycode: optional. Function called only on this keycode. Default: 27 (escape)
*
*   as an alternative you can just specify a function
*
*   IMPORTANT: use v-if with this directive instead of v-show
* */

export default {
  bind(el, binding) {
    let elem = $(el);

    if (!listening) {
      $('html').on('keyup', cycle);
      listening = true;
    }
    if (typeof binding.value === 'function') {
      objList.push({
        elem: elem,
        func: binding.value,
        param: undefined,
        keycode: binding.value.keycode || 'Enter',
      });
    } else {
      objList.push({
        elem: elem,
        func: binding.value.func,
        param: binding.value.param,
        keycode: binding.value.keycode || 'Enter',
      });
    }

    function cycle(event) {
      for (let i = objList.length - 1; i >= 0; --i) {
        let item = objList[i];
        if (item.elem.is(':visible')) {
          if (
            (isFinite(+item.keycode) && item.keycode === event.code) ||
            (!isFinite(+item.keycode) && item.keycode === event.key)
          ) {
            let $target = $(event.target);
            if (event.target.tagName === 'BODY' || $target.closest(item.elem).length) {
              const callback_result = item.func(item.param);
              if (!callback_result) {
                break;
              }
            }
          }
        }
      }
    }
  },
  unbind(el, binding) {
    let elem = $(el);
    let l = objList.findIndex(item => {
      return item.elem.is(elem);
    });
    objList.splice(l, 1);
  },
};
