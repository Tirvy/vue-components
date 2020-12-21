<template>
  <div class="list-elem-container">
    <div class="item-container"
         :data-drop-id="item_id"
         :style="{'padding-left': deepness_style + 'px'}"
         :class="item_class">
      <div class="item c_pointer flash-on-active selectable-item"
           v-if="options.list_type === 'checkbox'">
        <check-box :value="self_value === 'checked'"
                   :indeterminate="self_value === 'indeterminate'">
          <slot :entry="data" :item="original_item">
            <div>
              <div v-if="show_id"
                   class="item-id item-id_checkbox ellipsis">
                {{item_id}}
              </div>
              <div class="item-name">
                {{item_name}}
              </div>
            </div>
          </slot>
        </check-box>
      </div>
      <div class="item item_select"
           v-else>
        <slot :entry="data" :item="original_item">
          <div>
            <div v-if="show_id"
                 class="item-id ellipsis">
              {{item_id}}
            </div>
            <div class="item-name">
              {{item_name}}
            </div>
          </div>
        </slot>
      </div>
      <div class="expander_tree inner"
           data-drop-toggler
           :class="{'active': expanded, 'vis-none': !has_expander}">
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
import CheckBox from '@/components/check-box';

export default {
  name: 'ListElem',
  components: {
    CheckBox,
  },
  directives: {},
  mixins: [],
  props: ['data', 'original_item', 'value', 'options', 'visible', 'expanded'],
  data() {
    return {};
  },
  computed: {
    item_id() {
      return this.data.id;
    },
    show_id() {
      return this.options.show_id && this.item_id && this.item_id !== 'null';
    },
    item_name() {
      if (this.options.base === 'filtered' && this.is_all && this.visible) {
        return 'Все найденные';
      }
      return this.data.name;
    },
    has_expander() {
      return this.data.children.length && !this.data.base;
    },
    deepness_style() {
      let deepness = this.data.ascendants.length;
      if (this.options.base && deepness > 0) {
        deepness = deepness - 1;
      }
      return deepness * 12;
    },
    item_class() {
      let ret = [];
      if (this.visible === 'part') {
        ret.push('list-elem__container_part-visible');
      }
      if (this.list_type_is_select) {
        ret.push('selectable-item');
        if (this.self_value === true) {
          ret.push('active');
        } else if (this.self_value === 'part') {
          ret.push('list-elem__container_active-father');
        }
      }
      return ret;
    },
    list_type_is_select() {
      return this.options.list_type === 'select';
    },
    list_type_is_checkbox() {
      return this.options.list_type === 'checkbox';
    },
    self_value() {
      return this.value;
    },
    is_all() {
      return this.data.id === null;
    },
  },
  methods: {},
};
</script>

<style scoped
       lang="scss">
@import '~styles/constants.scss';

.item-container {
  display: flex;
  justify-content: space-between;
}

.item {
  flex-grow: 1;
  display: flex;
  word-break: break-word;

  &_select {
    min-height: 25px;
    line-height: 17px;
    padding: 4px 0 4px $indent;
  }
}

.list-elem__checking {
  cursor: pointer;
}

.list-elem__container_part-visible {
  color: $grey_text;
}

.list-elem__container_active-father .expander_tree{
  background: $grey_background;
}

.expander_tree:hover {
  background: $selectable-item_hover;
}

.item-id {
  color: $grey_text;
  font-size: 10px;
  margin-bottom: -5px;

  &_checkbox {
    margin-bottom: -4px;
  }
}

.item-name {
  line-height: 1em;
}

.flash-on-active:active {
  color: $blue;
}
</style>
