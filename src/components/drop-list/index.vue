<template>
  <div class="selectbox"
       v-outer-click="{func: toggleHide}"
       v-if="!flat">
    <div class="selectbox__text"
         :class="{disabled: readonly}"
         @click="toggleList()"
         ref="button">
      <div v-if="c_options.show_id && value"
           class="item-id ellipsis">
        {{value[c_options.id_key]}}
      </div>
      <div class="ellipsis">
        {{ button_text }}
      </div>
    </div>
    <div class="selectbox__dropdown"
         :class="c_options.container_class_name"
         v-show="is_expanded && value"
         ref="list">
      <input placeholder="поиск"
             type="text"
             class="selectbox__search"
             v-model="search.name"
             @keyup="updateSearch()"
             v-if="show_search"
             ref="search">
      <div class="ddl__list"
           ref="overflow_container"
           @scroll.passive="handleScroll"
           @click="handleClick"
           v-if="isInited">
        <transition-group name="drop">
          <list-elem
            v-for="item in list_shown"
            :key="item.id"
            :data="item"
            :value="item_values[item.id]"
            :options="c_options"
            :visible="visibility_values ? visibility_values[item.id] : true"
            :original_item="original_items_hashed[item.id]"
            :expanded="expanded_items[item.id]">
            <template v-slot="props">
              <slot v-bind="props"></slot>
            </template>
          </list-elem>
        </transition-group>
      </div>
    </div>
  </div>
  <div v-else
       class="flat-list">
    <div class="input-container_search">
      <input :placeholder="placeholder_text"
             type="text"
             v-model="search.name"
             @keyup="updateSearch()"
             v-if="show_search">
    </div>
    <div class="ddl__list flat"
         ref="overflow_container"
         @scroll.passive="handleScroll"
         @click="handleClick"
         v-if="isInited">
      <list-elem
        v-for="item in list_shown"
        :key="item.id"
        :data="item"
        :value="item_values[item.id]"
        :options="c_options"
        :visible="visibility_values ? visibility_values[item.id] : true"
        :original_item="original_items_hashed[item.id]"
        :expanded="expanded_items[item.id]">
        <template v-slot="props">
          <slot v-bind="props"></slot>
        </template>
      </list-elem>
    </div>
  </div>
</template>

<script>
import CF from '@/common/common-functions';
import ListElem from './list-elem';
import Popper from 'popper.js';
import OuterClick from '@/directives/outer-click';

const HEIR_TYPES = [
  {
    name: 'deep',
    keys: ['deep', 'level'],
  },
  {
    name: 'parent_id',
    keys: ['pid', 'parent', 'parent_id'],
  },
];

// if there are more items than this number then we think of it as really big
const REALLY_BIG_NUMBA = 500;
const NUMBER_SHOW = 100;

export default {
  name: 'DropList',
  components: {
    ListElem,
  },
  directives: {OuterClick},
  mixins: [],
  props: {
    value: {
      required: true,
      validator(value) {
        return typeof value === 'object'; // typeof [] === 'object' too, btw
      },
    },
    data: {
      type: Array,
      required: true,
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    readonly: Boolean,
    flat: Boolean,
  },
  data() {
    /*
    * list_type is counted here because it will cause significant performance problems if set in computed
    * */
    const list_type = Array.isArray(this.value) ? 'checkbox' : 'select';
    return {
      is_expanded: false,
      expanded_items: {},
      search: {
        name: '',
      },
      scroll_data: {
        cur_limit: NUMBER_SHOW,
        to_add: NUMBER_SHOW,
        pixels_when_to_add: 500,
      },
      found_with_search: null,
      popper: null,
      was_scrolled: false,
      // c_options are here! Not in computed. Cuz in computed it will recalc every time 'value' changes
      c_options: {
        container_class_name: 'w100',
        button_text_type: 'default',
        base: false,
        force_search: undefined,
        units: list_type === 'checkbox' ? 'Выбрано' : undefined,
        id_key: 'id',
        dock: 'right',
        show_id: false,
        list_type: list_type,
        translitable: this.data.length < REALLY_BIG_NUMBA,

        // sort - позволяет пересортировывать список
        // * 'checked' - сначала выделенные
        sort: false,
        ...this.options,
      },
    };
  },
  created() {
    if (this.c_options.list_type === 'select' && this.value && this.list_hashed[this.value[this.c_options.id_key]]) {
      this.list_hashed[this.value[this.c_options.id_key]].ascendants.forEach(parent_id => {
        this.$set(this.expanded_items, parent_id, true);
      });
    }
  },
  mounted() {
    if (!this.flat) {
      let placement;
      switch (this.c_options.dock) {
        case 'right':
          placement = 'bottom-end';
          break;
        case 'left':
          placement = 'bottom-start';
          break;
        default:
          placement = 'bottom';
      }
      this.popper = new Popper(this.$refs.button, this.$refs.list, {
        placement: placement,
        modifiers: {
          preventOverflow: {
            boundariesElement: 'viewport',
          },
          flip: {
            enabled: false,
          },
        },
      });
    }
  },
  computed: {
    value_imitator() {
      return this.value.slice(0);
    },
    show_search() {
      return this.c_options.force_search ||
        (this.c_options.force_search === undefined && this.data && this.data.length > 7);
    },
    placeholder_text() {
      if (this.c_options.list_type === 'select') {
        return this.c_options.units || '';
      }
      return this.value && 'Выбрано: ' + this.value.length;
    },
    button_prefix() {
      return (this.c_options.units || 'Выбрано') + ': ';
    },
    isInited() {
      return !!this.value && this.data && this.data.length;
    },
    its_so_big() {
      // thats what she said

      return this.data && this.data.length > REALLY_BIG_NUMBA;
    },
    id_is_number() {
      return this.data.length && typeof this.data[0][this.c_options.id_key] === 'number';
    },
    button_text() {
      if (this.c_options.list_type === 'select' && this.value) {
        if (this.value) {
          this.is_expanded = false;
          const item_name = this.value.name_short || this.value.name || this.value.alias || this.value.text;
          if (this.c_options.units) {
            return this.c_options.units + ': ' + item_name;
          }
          return item_name;
        } else {
          return this.c_options.units;
        }
      } else if (this.c_options.list_type === 'checkbox') {
        if (this.c_options.button_text_type === 'list') {
          if (this.value.length === 0) {
            return this.button_prefix + 'не выбраны';
          } else if (this.value.length === this.data.length) {
            return this.button_prefix + 'Все';
          } else {
            let ret = [];
            this.data.forEach(item => {
              if (this.value.includes(item[this.c_options.id_key])) {
                ret.push(item.name_short || item.name);
              }
            });
            return this.button_prefix + ret.join(', ');
          }
        } else if (this.c_options.button_text_type === 'unit_number') {
          return this.button_prefix + this.value.length;
        } else {
          if (this.value.length === 1) {
            const id_key = this.c_options.id_key;
            const chosen_item = this.data.find(item => {
              return item[id_key] == this.value[0];
            });
            if (chosen_item) {
              return this.button_prefix + chosen_item.name;
            } else {
              console.log(this.data.slice(0), this.data[0][id_key],  this.value[0], id_key);
              console.warn('Chosen item not found', this.value[0]);
            }
          } else if (this.value.length === this.data.length) {
            return this.button_prefix + 'Все';
          } else {
            return this.button_prefix + this.value.length;
          }
        }
      }
    },
    heir_key() {
      let ret_key = undefined;
      if (this.data && this.data.length) {
        let experimented_item = this.data[0];

        HEIR_TYPES.some(type => {
          return type.keys.some(key => {
            if (experimented_item.hasOwnProperty(key)) {
              ret_key = key;
              return true;
            }
          });
        });
      }
      return ret_key;
    },
    heir_type() {
      return HEIR_TYPES.find(type => {
        return type.keys.includes(this.heir_key);
      });
    },
    original_items_hashed() {
      const source = this.data;
      const total = this.data.reduce((total, item) => {
        total[item.id] = item;
        return total;
      }, {});
      return Object.freeze(total);
    },
    list_hashed() {
      let ret = {};
      let parents = [];
      const heir_type = this.heir_type;
      const heir_key = this.heir_key;
      const id_key = this.c_options.id_key;
      const data_source = this.data;
      const heir_is_deep = heir_type && heir_type.name === 'deep';

      data_source.forEach(item => {
        let item_id = item[id_key];
        let item_parents;
        if (heir_type) {
          if (heir_is_deep) {
            const item_deepness = item[heir_key];

            parents = parents.slice(0, item_deepness);
            if (item_deepness > 0) {
              item_parents = parents.slice(-1);
            } else {
              item_parents = [];
            }
            parents.push(item_id);
          } else {
            //heir_type === parent_id
            const parent_id = item[heir_key];
            if (parent_id && parent_id !== '0') {
              item_parents = [parent_id];
            } else {
              item_parents = [];
            }
          }
        } else {
          item_parents = [];
        }

        ret[item[id_key]] = {
          id: item_id,
          name: item.name,
          ascendants: item_parents,
          children: [],
          descendants: {}, // maps to array later
        };
      });

      // adding parents, children and descendants
      Object.values(ret).forEach(item => {
        // for each item their .ascendants.length might be either:
        // 0: just skip
        // > 1: already finished doing parents, skip
        // === 1: time to do some work

        if (!item.hasOwnProperty('ascended') && item.ascendants.length > 0) {
          let cur_parent_id = item.ascendants[0];
          let list_to_add_parent = [item];

          while (cur_parent_id !== undefined && cur_parent_id !== '0' && cur_parent_id !== 0) {
            const parent_item = ret[cur_parent_id];
            if (!parent_item) {
              cur_parent_id = undefined;
              continue;
            }
            parent_item.children.push(list_to_add_parent[list_to_add_parent.length - 1].id);

            if (parent_item.ascendants.length > 1 || parent_item.hasOwnProperty('ascended')) {
              // length > 1 means it was already done doing parents as stated above

              const list_length = list_to_add_parent.length;
              list_to_add_parent.forEach((add_item, i) => {
                parent_item.descendants[add_item.id] = true;
                if (add_item.ascendants.length < list_length - i) {
                  add_item.ascendants.push(cur_parent_id);
                }
                add_item.ascendants = add_item.ascendants.concat(parent_item.ascendants);
                parent_item.ascendants.forEach(ascendant_id => {
                  ret[ascendant_id].descendants[add_item.id] = true;
                });
              });
              cur_parent_id = undefined;
            } else if (parent_item.ascendants.length === 1) {
              // should add this id to all items and go another step

              const list_length = list_to_add_parent.length;
              for (let i = 0; i < list_length; ++i) {
                const add_item = list_to_add_parent[i];
                parent_item.descendants[add_item.id] = true;
                if (add_item.ascendants.length < list_length - i) {
                  add_item.ascendants.push(cur_parent_id);
                }
              }

              parent_item.descendants[list_to_add_parent[list_to_add_parent.length - 1].id] = true;

              cur_parent_id = parent_item.ascendants[0];
              list_to_add_parent.push(parent_item);
            } else if (parent_item.ascendants.length === 0) {
              // got to the top

              const list_length = list_to_add_parent.length;
              for (let i = 0; i < list_length; ++i) {
                const add_item = list_to_add_parent[i];
                parent_item.descendants[add_item.id] = true;
                if (add_item.ascendants.length < list_length - i) {
                  add_item.ascendants.push(cur_parent_id);
                }
              }
              parent_item.descendants[list_to_add_parent[list_to_add_parent.length - 1].id] = true;

              cur_parent_id = undefined;
            }
          }

          list_to_add_parent.forEach(item => (item.ascended = undefined));
        }
      });

      if (this.c_options.base) {
        // base === true means first item is the base
        if (this.c_options.base === true) {
          const base_id = this.data[0][id_key];
          ret[base_id].base = true;
          Object.values(ret).forEach(item => {
            if (!item.base) {
              if (item.ascendants.length === 0) {
                ret[base_id].children.push(item.id);
              }
              item.ascendants.push(base_id);
              ret[base_id].descendants[item.id] = true;
            }
          });
          ret[base_id].ascendants = [];
        } else {
          let base_obj = {
            name: 'Все',
            base: true,
            id: 'null',
            children: [],
            ascendants: [],
            descendants: {},
          };
          Object.values(ret).forEach(item => {
            item.ascendants.push('null');
            base_obj.descendants[item.id] = true;
            if (item.ascendants.length === 1) {
              base_obj.children.push(item.id);
            }
          });
          ret['null'] = base_obj;
        }
      }

      Object.values(ret).forEach(item => (item.descendants = Object.keys(item.descendants)));

      return Object.freeze(ret);
    },
    base_item() {
      if (!this.c_options.base) {
        return null;
      }

      let base_item = {...this.list_hashed.null};
      if (this.c_options.base === 'filtered' && this.found_with_search) {
        base_item.name = 'Все найденные';
        if (this.found_with_search) {
          base_item.descendants = this.found_with_search.map(item => item.id);

          let top_children = {};
          this.found_with_search.forEach(item => {
            const ascendants_length = item.ascendants.length;
            if (ascendants_length > 1) {
              const top_id = item.ascendants[item.ascendants.length - 2];
              top_children[top_id] = true;
            } else {
              top_children[item.id] = true;
            }
          });
          base_item.children = Object.keys(top_children);
        }
      }
      return base_item;
    },
    list_sorted() {
      let ret = [];
      const source = this.list_hashed;
      const id_key = this.c_options.id_key;
      let base_id;

      if (this.c_options.base) {
        if (source.null) {
          ret.push(this.base_item);
        } else {
          base_id = this.data[0][this.c_options.id_key];
          ret.push(source[base_id]);
        }
      }

      if (!this.heir_type && this.c_options.sort === 'checked' && this.c_options.list_type === 'checkbox') {
        const value_source = this.item_values;
        let order = this.value.concat(this.data.map(item => item[id_key]).filter(id => !value_source[id]));
        if (base_id) {
          order = order.filter(id => id !== base_id);
        }
        ret = ret.concat(order.map(id => source[id]).filter(item => item));

        return ret;
      } else if (!this.heir_type || this.heir_type.name === 'deep') {
        let order = this.data.map(item => item[id_key]);
        if (base_id) {
          order = order.filter(id => id !== base_id);
        }
        ret = ret.concat(order.map(id => source[id]));

        return ret;
      } else if (this.heir_type.name === 'parent_id') {
        const top_parents_length = this.c_options.base ? 1 : 0;
        const top_list = Object.values(source).filter(item => {
          return item.ascendants.length === top_parents_length && item.id !== base_id;
        });

        function fillRet(ids_list) {
          ids_list.forEach(id => {
            const item = source[id];
            ret.push(item);
            fillRet(item.children);
          });
        }

        fillRet(top_list.map(item => item.id));
        return ret;
      }
      return [];
    },
    list_expanded() {
      const top_parents_length = this.c_options.base ? 1 : 0;
      return this.list_sorted.filter(item => {
        return item.ascendants.length <= top_parents_length || this.expanded_items[item.ascendants[0]];
      });
    },
    list_shown_source() {
      let ret;
      if (!this.visibility_values) {
        ret = this.list_expanded;
      } else {
        const values = this.visibility_values;
        ret = this.list_sorted.filter(item => !!values[item.id]);
      }
      return ret;
    },
    list_shown() {
      return this.list_shown_source.slice(0, this.scroll_data.cur_limit);
    },
    visibility_values() {
      if (!this.found_with_search) {
        return null;
      }
      let ret = {};
      this.found_with_search.forEach(item => {
        ret[item.id] = 'full';
        item.ascendants.forEach(parent_id => {
          ret[parent_id] = ret[parent_id] || 'part';
        });
      });
      return ret;
    },
    item_values() {
      if (this.c_options.list_type === 'select') {
        const id_key = this.c_options.id_key;
        const chosen_one_id = this.value[id_key];
        let ret = {
          [chosen_one_id]: true,
        };
        if (this.list_hashed[chosen_one_id]) {
          this.list_hashed[chosen_one_id].ascendants.forEach(id => {
            ret[id] = 'part';
          });
        }
        return ret;
      } else {
        let ret = {};
        const source = this.list_hashed;

        this.value.forEach(id => {
          ret[id] = 'checked';
          const checked_item = source[id];
          if (!checked_item) {
            console.warn('Item missing in drop-list', {value: this.value, id: id});
          } else {
            checked_item.ascendants.forEach(parent_id => {
              ret[parent_id] = ret[parent_id] || 'indeterminate';
            });
            checked_item.descendants.forEach(descendant_id => {
              ret[descendant_id] = 'checked';
            });
          }
        });

        Object.keys(ret).forEach(id => {
          if (ret[id] === 'indeterminate') {
            const item = source[id];
            if (item.descendants.every(id => ret[id])) {
              ret[id] = 'checked';
              item.descendants.forEach(id => (ret[id] = 'checked'));
            }
          }
        });

        if (this.c_options.base === 'filtered' && this.found_with_search) {
          let some = false;
          let all = true;

          for (let i = 0; i < this.found_with_search.length && (all || !some); ++i) {
            const item = this.found_with_search[i];
            const good = item.id === 'null' || ret[item.id] === 'checked';
            if (good) {
              some = true;
            } else {
              all = false;
            }
          }

          if (all) {
            ret.null = 'checked';
          } else if (some) {
            ret.null = 'indeterminate';
          } else {
            ret.null = undefined;
          }
        }

        return Object.freeze(ret);
      }
    },
  },
  methods: {
    toggleList() {
      if (!this.readonly) {
        this.scroll_data.cur_limit = this.scroll_data.to_add;
        setTimeout(() => {
          this.handleScroll();
        }, 200);
        this.is_expanded = !this.is_expanded;
        this.search.name = '';
        this.found_with_search = null;
        if (this.is_expanded) {
          this.$nextTick(() => {
            if (this.popper.update) {
              this.popper.update();
            }
            if (!this.was_scrolled) {
              if (this.c_options.list_type === 'select' && this.$el.querySelector('.active')) {
                setTimeout(() => {
                  let myElement = this.$el.querySelector('.active');
                  if (myElement) {
                    this.$refs.overflow_container.scrollTop = myElement.offsetTop - 40;
                  }
                }, 100);
              }
              this.was_scrolled = true;
            }
          });
        } else {
          this.$emit('hidden');
        }
        if (this.is_expanded && this.show_search) {
          this.$nextTick(() => {
            this.$refs.search.focus();
          });
        }
      }
    },
    toggleHide() {
      if (this.is_expanded) {
        this.is_expanded = false;
        this.search.name = '';
        this.found_with_search = null;
        this.$emit('hidden');
      }
    },
    handleScroll(event) {
      const scroll_top = this.$refs.overflow_container.scrollTop;
      const visible_height = this.$refs.overflow_container.clientHeight;
      const scroll_height = this.$refs.overflow_container.scrollHeight;
      if (
        scroll_top + visible_height > scroll_height - this.scroll_data.pixels_when_to_add &&
        this.list_shown_source.length > this.scroll_data.cur_limit
      ) {
        this.scroll_data.cur_limit += this.scroll_data.to_add;
      }
    },
    updateSearch() {
      if (this.search_timeout) {
        clearTimeout(this.search_timeout);
      }
      this.search_timeout = setTimeout(this.setFilter, this.its_so_big ? this.data.length / 10 : 0);
    },
    setFilter() {
      if (this.search.name.length) {
        const search_options = {
          translitable: this.its_so_big ? false : this.c_options.translitable,
        };
        this.found_with_search = this.list_sorted.filter(item => {
          return CF.checkStringInString([item.name, item.id], this.search.name, search_options);
        });
      } else {
        this.found_with_search = null;
      }
    },
    handleExpand(item) {
      this.$set(this.expanded_items, item.id, !this.expanded_items[item.id]);
      item.children.forEach(child_id => {
        if (this.expanded_items[child_id]) {
          this.handleExpand(this.list_hashed[child_id]);
        }
      });
    },
    checkBasicItem(item, hashed_value) {
      // check item
      hashed_value[item.id] = true;

      // make its descendants unchecked. Cuz logic
      item.descendants.forEach(descendant_id => (hashed_value[descendant_id] = false));

      // In case it was the last child of a parent (and so forth) - check the parent instead
      item.ascendants.forEach(parent_id => {
        if (parent_id !== 'null') {
          const parent_item = this.list_hashed[parent_id];
          if (parent_item.children.every(parent_child_id => hashed_value[parent_child_id])) {
            hashed_value[parent_id] = true;
            parent_item.children.forEach(parent_child_id => {
              hashed_value[parent_child_id] = false;
            });
          }
        }
      });
    },
    uncheckBasicItem(item, hashed_value) {
      // uncheck item
      hashed_value[item.id] = false;

      // make sure its descendants are unchecked
      item.descendants.forEach(descendant_id => (hashed_value[descendant_id] = false));

      // make sure its parents become unchecked
      item.ascendants.forEach(parent_id => {
        if (this.item_values[parent_id] === 'checked' && parent_id !== 'null') {
          hashed_value[parent_id] = false;

          // BUT! In case parent was checked - we should check all its neighbours
          const parent_item = this.list_hashed[parent_id];
          parent_item.children.forEach(parent_child_id => {
            if (!hashed_value.hasOwnProperty(parent_child_id)) {
              hashed_value[parent_child_id] = item.id !== parent_child_id && !item.ascendants.includes(parent_child_id);
            }
          });
        }
      });
    },
    handleClick(event) {
      const id_attred_elem = event.target.closest('[data-drop-id]');
      if (id_attred_elem) {
        const item_id = id_attred_elem.dataset['dropId'];
        let item = this.list_hashed[item_id];
        if (event.target.closest('[data-drop-toggler]')) {
          this.handleExpand(item);
        } else {
          if (this.c_options.list_type === 'select') {
            this.$emit('input', this.data.find(init_item => init_item[this.c_options.id_key] === item.id));
          } else {
            let cur_value_hashed = this.value.reduce((total, id) => {
              total[id] = true;
              return total;
            }, {});

            if (this.item_values[item.id] === 'checked') {
              // if an item was checked then we:

              if (item.id === null || item.id === 'null') {
                if (
                  (this.c_options.base === 'filtered' && !this.found_with_search) ||
                  this.c_options.base === 'mimic'
                ) {
                  cur_value_hashed = {};
                } else if (this.c_options.base === 'filtered') {
                  this.found_with_search.forEach(item => {
                    if (item.id !== null && item.id !== 'null') {
                      this.uncheckBasicItem(item, cur_value_hashed);
                    }
                  });
                }
              } else {
                this.uncheckBasicItem(item, cur_value_hashed);
              }
            } else {
              // In case it wasnt checked

              if (item.id === null || item.id === 'null') {
                if (
                  (this.c_options.base === 'filtered' && !this.found_with_search) ||
                  this.c_options.base === 'mimic'
                ) {
                  cur_value_hashed = item.children.reduce((total, id) => {
                    total[id] = true;
                    return total;
                  }, {});
                } else if (this.c_options.base === 'filtered') {
                  this.found_with_search.forEach(item => {
                    if (item.id !== null && item.id !== 'null') {
                      this.checkBasicItem(item, cur_value_hashed);
                    }
                  });
                }
              } else {
                this.checkBasicItem(item, cur_value_hashed);
              }
            }

            let ret = Object.keys(cur_value_hashed).filter(id => cur_value_hashed[id]);
            if (this.id_is_number) {
              ret = ret.map(id => +id);
            }
            this.$emit('input', ret);
          }
          if (item) {
            this.$emit('pick', item.id);
          }
        }
      }
    },
  },
};
</script>

<style scoped
       lang="scss">
@import '~styles/constants.scss';

$height_interactive: 48px !default;
$indent: 8px !default;
$border-radius: 5px !default;
$border-color: #ebebeb !default;

.selectbox {
  position: relative;
  width: 100%;
  flex-shrink: 0;
}

.selectbox__text {
  position: relative;
  width: 100%;
  height: $height_interactive;
  outline: none;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  background: #fff;
  border: 1px solid $border-color;
  padding: 0 26px 0 $indent;
  cursor: pointer;
  border-radius: $border-radius;

  user-select: none;

  display: flex;
  flex-direction: column;
  justify-content: center;

  &.disabled {
    color: $grey_inactive_text;
    cursor: default;
  }
}

.selectbox__text.-blocked {
  padding: 0;
  text-align: center;
  border: 0;
  box-shadow: none;
  background: transparent;
  cursor: default !important;
}

.selectbox__text:not(.-blocked)::after {
  content: '';
  position: absolute;
  display: inline-block;
  height: 18px;
  right: 0;
  top: 5px;
  margin-left: -24px;
  width: 24px;
  background: url('./images/dropdown_icon.svg') no-repeat center;
}

.selectbox__dropdown {
  display: flex;
  flex-direction: column;
  z-index: 100;
  max-height: 400px;
  padding: 0;
  margin: 0;
  background-color: #fff;
  border: 1px solid $border-dropdown;
  border-radius: $border-radius;
  box-shadow: 0 3px 12px rgba(150, 150, 150, 0.2);
}

.selectbox__dropdown[right] {
  right: 0;
  left: auto;
}

input[type='text'].selectbox__search {
  border: 0;
  border-bottom: 1px solid $border-color;
  background-color: $grey_background;
}

.drop-down-list {
  padding: 0;
  margin: 0;
  position: relative;
}

.drop-down-list::after {
  content: '';
  position: absolute;
  right: 7px;
  top: 11px;
  display: inline-block;
  height: 8px;
  width: 8px;
  vertical-align: middle;
  background-image: url('./images/chevron.png');
}

.ddl__container {
  position: absolute;
  top: 29px;
  z-index: 100;
  padding: 0;
  margin: 0;
  background-color: #fff;
  border: 1px solid $border-dropdown;
  border-radius: $border-radius;
  box-shadow: 0 3px 12px rgba(150, 150, 150, 0.7);
}

.ddl__container > input {
  border: none;
}

.drop-down_right {
  right: 0;
  left: unset;
}

.ddl__list {
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  border: 0;
  border-radius: 0;
  padding: 0;
  margin: 0;

  &.flat {
    /*  was commented to solve firefox overflow bug*/
    max-height: 250px;
    max-height: 100%;
    height: 100%;
  }
}

.ddl-text {
  max-width: 100%;
  min-width: 100%;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding: 0 18px 0 9px;
}

.flat-list {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.item-id {
  color: $grey_text;
  font-size: 10px;
  margin-bottom: -3px;
  margin-top: -1px;
}
</style>
