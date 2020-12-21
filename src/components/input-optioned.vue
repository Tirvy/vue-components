<template>
  <div class="input-optioned pos-rel"
       v-outer-click="{func: toggleHide, param: 'options'}">
    <input v-bind="$attrs"
           :value="value"
           @input="emitValue($event.target.value)"
           ref="input"
           @focus="toggleShow('options')">
    <div class="modal-popup"
         ref="list"
         v-show="show.options">
      <drop-list :flat="true"
                 style="max-height: 300px;"
                 :data="data"
                 :value="options_value"
                 @pick="addOption"></drop-list>
    </div>
  </div>
</template>

<script>
import ShowMethods from '../mixins/show-methods';
import Popper from 'popper.js';
import DropList from "@/components/drop-list/index";

export default {
  name: 'InputOptioned',
  components: {DropList},
  mixins: [ShowMethods],
  props: ['value', 'data'],
  data() {
    return {
      show: {
        options: false,
      },
      popper: null,
    };
  },
  mounted() {
    this.popper = new Popper(this.$refs.input, this.$refs.list, {
      placement: 'bottom-start',
      modifiers: {
        preventOverflow: {
          boundariesElement: 'viewport',
        },
        flip: {
          enabled: false,
        },
      },
    });
  },
  computed: {
    values_list() {
      return this.value.split(',');
    },
    data_items_selected() {
      let ret = [];
      this.values_list.forEach(value => {
        let item = this.data.find(item => {
          return item.name === value || String(item.id) === value;
        });
        if (item) {
          ret.push(item);
        }
      });
      return ret;
    },
    options_value() {
      return this.data_items_selected.map(item => item.id);
    },
  },
  methods: {
    addOption(option_id) {
      let option = this.data.find(item => item.id === option_id);
      if (!this.data_items_selected.includes(option)) {
        if (this.value) {
          if (this.value[this.value.length - 1] === ',') {
            this.$emit('input', this.value + option.name);
          } else {
            this.$emit('input', this.value + ',' + option.name);
          }
        } else {
          this.$emit('input', option.name);
        }
      } else {
        this.$emit(
          'input',
          this.values_list
            .filter(value => {
              return value !== option.id && value !== option.name;
            })
            .join(',')
        );
      }
    },
    emitValue(value) {
      this.$emit('input', value);
    },
  },
};
</script>

<style scoped>
</style>
