let listening = false,
  objList = [];

/*
*  Directive listens to clicks outside of bind elements and calls function when requirements are met.
*
* input object keys:
*
*   func: required. Calls this function.
*   param: optional. Passes this param as func argument.
*   friend: optional. If clicked element has a parent with this selector, then func is not called.
*   escape: optional. If true - also calls func on esc keypress anywhere. default: true
*
*
*   as an alternative you can just specify a function
* */

export default {
  inserted(el, binding) {

    if (!listening) {
      const LISTENER_ELEM = document.documentElement;
      LISTENER_ELEM.addEventListener('mousedown', clickStart);
      LISTENER_ELEM.addEventListener('mouseup', cycle);
      LISTENER_ELEM.addEventListener('keyup', function(event) {
        if (event.which === 27) {
          cycleEscape();
        }
      });
      listening = true;
    }

    setTimeout(() => {
      if (typeof binding.value === 'function') {
        objList.push({
          elem: el,
          func: binding.value,
          param: undefined,
          friends: undefined,
          escape: true,
          started_outside: false
        });
      } else {
        objList.push({
          elem: el,
          func: binding.value.func,
          param: binding.value.param,
          friends: binding.value.friends || binding.value.friend || binding.value.friendly,
          escape: binding.value.escape === undefined ? true : binding.value.escape,
          started_outside: false
        });
      }
    });

    function cycle(event) {
      objList.forEach(function(item) {
        if (isOutside(event.target, item) && item.started_outside) {
          item.func(item.param);
        }
        item.started_outside = false;
      });
    }

    function clickStart(event) {
      objList.forEach(function(item) {
        if (isOutside(event.target, item)) {
          item.started_outside = true;
        }
      });
    }
isVisible
    function isOutside(targetElem, item) {
      return isVisible(targetElem) &&
        !item.elem.contains(targetElem) &&
        (!item.friends || !targetElem.closest(item.friends).length)
    }

    function cycleEscape() {
      for (let i = objList.length - 1; i >= 0; --i) {
        let item = objList[i];
        if (item.escape) {
          const callback_result = item.func(item.param);
          if (!callback_result) {
            break;
          }
        }
      }
    }

    function isVisible(elem) {
      return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
    }
  },
  unbind(el, binding) {
    let l = objList.findIndex(item => {
      return item.elem === el;
    });
    objList.splice(l, 1);
  },
};
