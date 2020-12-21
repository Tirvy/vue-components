import {UNITS} from '@/common/constants';

const isEqual = require('lodash.isequal');

export default {
  getUnitObject(unit_alias) {
    return Object.values(UNITS).find(unit => unit.aliases.includes(unit_alias));
  },
  isObject(obj) {
    return obj === Object(obj);
  },
  isNumber(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
  },
  round(number, precision) {
    const shift = function(number, precision, reverseShift) {
      if (reverseShift) {
        precision = -precision;
      }
      const numArray = ('' + number).split('e');
      return +(numArray[0] + 'e' + (numArray[1] ? +numArray[1] + precision : precision));
    };
    return shift(Math.round(shift(number, precision, false)), precision, true);
  },
  floor(number, precision) {
    return Math.floor(number * Math.pow(10, precision)) / Math.pow(10, precision);
  },
  /* Метод нахождения в одной строке другой строки, с trim и toLowerCase
  * Параметры where и what - очевидно.
  * Возможные опции:
  *   translitable - Если true, то пытается проверить возможность, что текст введен в другой раскладке (en/ru)
  *   functional - Использует синтаксический поиск с , + !
  * */
  checkStringInString(where, what, options) {
    const firstReplacer =
      '`qwertyuiop[]asdfghjkl;\'zxcvbnm,./~@#$^&QWERTYUIOP{}ASDFGHJKL:"|ZXCVBNM<>?ёйцукенгшщзхъфывапролджэячсмитьбю.Ё"№;:?ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭ/ЯЧСМИТЬБЮ,';
    const secondReplacer =
      'ёйцукенгшщзхъфывапролджэячсмитьбю.Ё"№;:?ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭ/ЯЧСМИТЬБЮ,`qwertyuiop[]asdfghjkl;\'zxcvbnm,./~@#$^&QWERTYUIOP{}ASDFGHJKL:"|ZXCVBNM<>?';

    if (where === '' && !what) {
      return true;
    }
    if (!where) {
      return false;
    }
    if (!what) {
      return true;
    }
    if (Array.isArray(where) && where.length) {
      where = where.join(' ');
    }
    where = where
      .toString()
      .trim()
      .toLowerCase();
    what = what.trim();

    function simpleCheck() {
      return where.indexOf(what.toLowerCase()) !== -1;
    }

    function translitCheck() {
      return options && options.translitable && !options.functional && where.indexOf(changeLanguage(what)) !== -1;
    }

    function functionalCheck() {
      return (
        options &&
        options.functional &&
        (syntaxSearch(where, what.toLowerCase()) || (options.translitable && syntaxSearch(where, changeLanguage(what))))
      );
    }

    function changeLanguage(str) {
      return str
        .split('')
        .map(symbol => {
          return firstReplacer.indexOf(symbol) !== -1 ? secondReplacer[firstReplacer.indexOf(symbol)] : symbol;
        })
        .join('')
        .toLowerCase();
    }

    function syntaxSearch(where, what) {
      let result = [];
      what.split(',').forEach(term => {
        if (term === '') {
          return;
        }
        let subterms = term.split('+');
        let termResult = true;
        subterms.forEach(subterm => {
          if (subterm[0] === '!' && where.indexOf(subterm.substring(1)) !== -1) {
            termResult = false;
          }
          if (subterm[0] !== '!' && where.indexOf(subterm) === -1) {
            termResult = false;
          }
        });
        result.push(termResult);
      });

      return result.some(res => res);
    }

    return functionalCheck() || translitCheck() || simpleCheck();
  },
  /* Позволяет из имени строки путем некоторой обработки получить сокращенное имя.
  * Примером могут служить сокращенные названия клиентов в title в автоматизации
  *  */
  getShortName(name) {
    let ret = [];

    name.split(/[-\s]/).forEach((str, i, arr) => {
      if (str.length === 1) {
        ret.push(str);
      } else if (str.match(/^\d\w/)) {
        ret.push(str.substring(0, 2));
      } else if (camelCaseCheck(str)) {
        ret = camelCaseCheck(str) === 'rus' ? ret.concat(str.match(/[А-ЯЁ]/g)) : ret.concat(str.match(/[A-Z]/g));
      } else if (arr.length > 1) {
        ret.push(str[0]);
      } else {
        ret.push(str);
      }
    });

    function camelCaseCheck(str) {
      if (str.match(/[a-z][A-Z][a-z]/)) {
        return 'eng';
      }
      if (str.match(/[а-яё][А-ЯЁ][а-яё]/)) {
        return 'rus';
      }

      return null;
    }

    return ret.join('');
  },
  // copy function from angular
  // Создает deep copy объектов, массивов и всего чего угодно
  copy(source) {
    let stackSource = [];
    let stackDest = [];

    return copyElement(source);

    function copyRecurse(source, destination) {
      let h = destination.$$hashKey;
      let key;
      if (Array.isArray(source)) {
        for (let i = 0, ii = source.length; i < ii; i++) {
          destination.push(copyElement(source[i]));
        }
      } else if (isBlankObject(source)) {
        // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
        for (key in source) {
          destination[key] = copyElement(source[key]);
        }
      } else if (source && typeof source.hasOwnProperty === 'function') {
        // Slow path, which must rely on hasOwnProperty
        for (key in source) {
          if (source.hasOwnProperty(key)) {
            destination[key] = copyElement(source[key]);
          }
        }
      } else {
        // Slowest path --- hasOwnProperty can't be called as a method
        for (key in source) {
          if (hasOwnProperty.call(source, key)) {
            destination[key] = copyElement(source[key]);
          }
        }
      }
      setHashKey(destination, h);
      return destination;
    }

    function copyElement(source) {
      // Simple values
      if (source !== Object(source)) {
        //!this.isObject(source)
        return source;
      }

      // Already copied values
      let index = stackSource.indexOf(source);
      if (index !== -1) {
        return stackDest[index];
      }

      let needsRecurse = false;
      let destination = copyType(source);

      if (destination === undefined) {
        destination = Array.isArray(source) ? [] : Object.create(Object.getPrototypeOf(source));
        needsRecurse = true;
      }

      stackSource.push(source);
      stackDest.push(destination);

      return needsRecurse ? copyRecurse(source, destination) : destination;
    }

    function copyType(source) {
      let toString = Object.prototype.toString;
      switch (toString.call(source)) {
        case '[object Int8Array]':
        case '[object Int16Array]':
        case '[object Int32Array]':
        case '[object Float32Array]':
        case '[object Float64Array]':
        case '[object Uint8Array]':
        case '[object Uint8ClampedArray]':
        case '[object Uint16Array]':
        case '[object Uint32Array]':
          return new source.constructor(copyElement(source.buffer), source.byteOffset, source.length);

        case '[object ArrayBuffer]':
          // Support: IE10
          if (!source.slice) {
            // If we're in this case we know the environment supports ArrayBuffer
            /* eslint-disable no-undef */
            let copied = new ArrayBuffer(source.byteLength);
            new Uint8Array(copied).set(new Uint8Array(source));
            /* eslint-enable */
            return copied;
          }
          return source.slice(0);

        case '[object Boolean]':
        case '[object Number]':
        case '[object String]':
        case '[object Date]':
          return new source.constructor(source.valueOf());

        case '[object RegExp]':
          let re = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
          re.lastIndex = source.lastIndex;
          return re;

        case '[object Blob]':
          return new source.constructor([source], {type: source.type});
      }

      if (typeof source.cloneNode === 'function') {
        return source.cloneNode(true);
      }
    }

    function isTypedArray(value) {
      const TYPED_ARRAY_REGEXP = /^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array\]$/;
      return value && isFinite(value.length) && TYPED_ARRAY_REGEXP.test(toString.call(value));
    }

    function isBlankObject(value) {
      return value !== null && typeof value === 'object' && !Object.getPrototypeOf(value);
    }

    function setHashKey(obj, h) {
      if (h) {
        obj.$$hashKey = h;
      } else {
        delete obj.$$hashKey;
      }
    }
  },
  getKey(item) {
    return item.key || item.k || this.getId(item);
  },
  getId(item) {
    return (
      item.id || item.key || item.k || item.i || item[Object.keys(item).find(key => key.toLowerCase().includes('id'))]
    );
  },
  getName(item) {
    return item.name || item.title || item.text || item.id || item.n || this.getId(item);
  },
  getValue(item) {
    return item.value || item.v || false;
  },
  // Ставит множественное в нужный падеж
  getNumericalName(number, variants) {
    const numerals = {
      days: ['день', 'дня', 'дней'],
      hours: ['час', 'часа', 'часов'],
      minutes: ['минута', 'минуты', 'минут'],
      seconds: ['секунда', 'секунды', 'секунд'],
      rubles: ['рубль', 'рубля', 'рублей'],
      goods: ['товар', 'товара', 'товаров'],
      bug: ['баг', 'бага', 'багов'],
    };
    if (!Array.isArray(variants)) {
      variants = numerals[variants] || numerals.bug;
    }
    let temp = number;
    while (number >= 10) {
      number = number % 10;
    }
    while (temp >= 100) {
      temp = temp % 10;
    }
    if (number > 0 && number < 5) {
      if (temp > 10 && temp < 15) {
        return variants[2];
      }
      if (number === 1) return variants[0];
      return variants[1];
    }
    return variants[2];
  },
  splitPower2(num) {
    if (typeof num === 'string') {
      return num.split('').reverse();
    } else {
      return (+num)
        .toString(2)
        .split('')
        .reverse();
    }
  },
  bitCompare(a, b, compareOperand) {
    let bita = this.splitPower2(a),
      bitb = this.splitPower2(b);
    if (bita.length > bitb.length) {
      let temp = bita;
      bita = bitb;
      bitb = temp;
    }

    return bita.every(function(digit, index) {
      if (compareOperand === 'and') {
        return +digit && +bitb[index];
      }
      return digit || bitb[index];
    });
  },
  copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
      // IE specific code path to prevent textarea being shown while dialog is visible.
      return clipboardData.setData('Text', text);
    } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
      let textarea = document.createElement('textarea');
      textarea.textContent = text;
      textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
      document.body.appendChild(textarea);
      textarea.select();
      try {
        return document.execCommand('copy'); // Security exception may be thrown by some browsers.
      } catch (ex) {
        console.warn('Copy to clipboard failed.', ex);
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  },
  // Смешивает 2 объекта, соединяя массивы и поля от обоих. Нужно только для чартов
  mixin(oval, nval) {
    if (!this.isObject(oval) || typeof oval === 'function') {
      if (this.isObject(nval)) {
        oval = {};
      } else {
        oval = nval;
        return;
      }
    }

    for (let key in nval) {
      if (oval[key] === undefined) {
        oval[key] = nval[key];
      } else if (!this.isObject(oval[key])) {
        oval[key] = nval[key];
      } else if (Array.isArray(oval[key])) {
        if (!Array.isArray(nval[key])) {
          return;
        }
        nval[key].forEach((item, index) => {
          if (index > oval[key].length) {
            oval[key].push(item);
          } else if (item !== undefined) {
            if (this.isObject(item)) {
              this.mixin(oval[key][index], item);
            } else {
              oval[key][index] = item;
            }
          }
        });
      } else if (typeof oval[key] === 'function') {
        oval[key] = nval[key];
      } else {
        this.mixin(oval[key], nval[key]);
      }
    }
  },
  // Сортирует список по полю
  getSortedData(data, key, descending) {
    if (data.length > 0 && typeof data[0][key] === 'string') {
      return data.slice(0).sort((a, b) => {
        return (a[key] + '').localeCompare(b[key]) * (descending || -1);
      });
    } else {
      return data.slice(0).sort((a, b) => {
        return ((b[key] || 0) - (a[key] || 0)) * (descending || -1);
      });
    }
  },
  isEqual,
};
