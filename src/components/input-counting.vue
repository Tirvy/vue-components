<template>
  <div class="input-counting pos-rel">
    <input v-bind="$attrs"
           class="padded-for-counting"
           :value="value"
           @input="emitValue">
    <div class="counter"
         :class="{warning: limit_reached}"
         v-show="show_counter">
      {{count}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputCounting',
  components: {},
  directives: {},
  mixins: [],
  props: ['value', 'limit'],
  data() {
    return {};
  },
  computed: {
    limit_reached() {
      if (this.limit) {
        return this.count > this.limit;
      }
    },
    show_counter() {
      return this.count > 0;
    },
    count() {
      return this.value && this.value.length;
    },
  },
  methods: {
    emitValue(event) {
      this.$emit('input', event.target.value);
    },
  },
};
</script>

<style lang="scss"
       scoped>
@import '~styles/constants.scss';
.padded-for-counting {
  padding-right: 30px;
}
.counter {
  color: $grey_inactive_text;
  position: absolute;
  right: 4px;
  top: calc(50% - 0.6em);

  &.warning {
    color: $red;
  }
}
</style>
