<template>
  <label class="checkbox-container"
         :class="[readonly && 'color_grey_text readonly']"
         :title="shift ? 'Используйте сочетание Shift + ЛКМ для выбора нескольких пунктов' : ''"
         @click.shift="handleSelfShift">
    <input type="checkbox"
           style="display: none"
           :value="is_true"
           :indeterminate="indeterminate"
           @change="handleChange"
           @click.shift.prevent
           @click.self.stop>
    <span class="checkbox-itself"
          data-test="indicator"
          :class="{'checked': is_true, 'checkbox-itself_with-slot': has_slot, readonly: readonly, indeterminate: indeterminate}"></span>
    <slot></slot>
  </label>
</template>

<script>
/**
 * Ок, что это? Обычный чекбокс, но застилизованный под нас и с вкусностями!
 * Если пихнуть внутрь слот, то он тоже будет кликабельным!
 *
 * А еще можно давать на вход не просто boolean, а массив. И приделать еще :id где-то рядом, чтобы
 * проверять true как :value includes :id и соответственно этому менять v-model
 * (до vuejs 2.6 вместо id бралось value, но потом это посчитали багом и фичу порезали)
 *
 * А еще можно дать на вход объект shift с полями key и index.
 * Тогда при шифт-клике по чекбоксу с key будет шифт-выделение всех между этим и последним кликнутым (по индексу)!
 * То есть нужен список чекбоксов с одинаковым shift.key, с правильно указанным у каждого shift.index
 *
 * Внимание! Помни, что для нормального шифт-клика могло потребоваться что-то сделать весьма странно
 *
 */

import Vue from 'vue';

const EventBus = new Vue();
let last_shifts = [];

export default {
  components: {},
  name: 'CheckBox',
  props: ['value', 'id', 'shift', 'indeterminate', 'readonly'],
  data() {
    return {};
  },
  computed: {
    array_id() {
      return this.$attrs.value || this.id;
    },
    is_true() {
      if (!Array.isArray(this.value)) {
        return this.value;
      }
      return this.value.includes(this.array_id);
    },
    has_slot() {
      return [this.$slots, this.$scopedSlots].some(item => {
        return item.default && (!Array.isArray(item.default) || item.default.length !== 0);
      });
    },
    value_is_array() {
      return Array.isArray(this.value);
    },
  },
  mounted() {
    EventBus.$on('shift', this.handleOtherShift);
  },
  beforeDestroy() {
    EventBus.$off('shift', this.handleOtherShift);
  },
  watch: {
    'shift.index'(new_val, old_val) {
      if (new_val !== old_val) {
        let last_click_index = last_shifts.findIndex(item => item.key === this.shift.key);
        if (last_click_index >= 0) {
          last_shifts.splice(last_click_index, 1);
        }
      }
    },
  },
  methods: {
    handleOtherShift(payload) {
      if (!this.readonly && this.shift && payload.key === this.shift.key) {
        if (payload.start < this.shift.index && payload.end > this.shift.index) {
          if (!this.value_is_array) {
            this.change(true);
          } else if (!this.is_true) {
            payload.touched.push(this.array_id);
            this.$emit('input', this.value.slice(0).concat(payload.touched));
          }
        }
      }
    },
    handleSelfShift() {
      if (this.shift) {
        let last_click_index = last_shifts.findIndex(item => item.key === this.shift.key);
        if (last_click_index >= 0) {
          let borders = [last_shifts[last_click_index].index, this.shift.index];
          if (borders[1] < borders[0]) {
            borders.reverse();
          }
          this.change(true);
          EventBus.$emit('shift', {
            key: this.shift.key,
            start: borders[0],
            end: borders[1],
            touched: [this.id],
          });
        }
      }
    },
    handleChange(ev) {
      this.change();

      if (this.shift) {
        let last_click_index = last_shifts.findIndex(item => item.key === this.shift.key);
        if (last_click_index >= 0) {
          last_shifts.splice(last_click_index, 1, {...this.shift});
        } else {
          last_shifts.push(last_click_index, 1, {...this.shift});
        }
      }
    },

    change(new_val) {
      if (!this.readonly) {
        if (new_val === undefined) {
          new_val = !this.value;
        } else {
          if (new_val === this.is_true) {
            return;
          }
        }
        if (!Array.isArray(this.value)) {
          this.$emit('input', new_val);
        } else {
          let index = this.value.indexOf(this.array_id);
          if (index >= 0) {
            this.$emit('input', this.value.filter(item => item !== this.array_id));
          } else {
            let ret = this.value.slice(0);
            ret.push(this.array_id);
            this.$emit('input', ret);
          }
        }
      }
    },
  },
};
</script>

<style scoped
       lang="scss">
.checkbox-container {
  padding: 5px;
  display: flex;
  align-items: center;
  user-select: none;

  &:not(.readonly) {
    cursor: pointer;
  }
}

.checkbox-itself {
  width: 16px;
  height: 16px;
  display: block;
  float: left;
  flex-shrink: 0;

  &.checked {
    background: url(./images/checked.svg) no-repeat center;
  }

  &:not(.checked) {
    background: url(./images/unchecked.svg) no-repeat center;
  }

  &.indeterminate {
    background: url(./images/part.svg) no-repeat center;
  }

  &_with-slot {
    margin-right: 10px;
  }

  &.readonly {
    filter: brightness(90%);
  }
}
</style>
