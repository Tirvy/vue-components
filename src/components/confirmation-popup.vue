<template>
  <div class="confirmation-container shadowed tail"
       :class="'tail_' + pos"
       v-outer-click="{func: cancel}">
    <slot name="text"></slot>
    <div class="button button_common_open"
         @click="cancel">
      отмена
    </div>
    <div class="button button_common"
         @click="confirm">
      <slot></slot>
      <span v-show="!$slots.default || $slots.default.length === 0">ok</span>
    </div>
  </div>
</template>

<script>


export default {
  name: 'Confirmation',
  components: {},
  mixins: [],
  props: ['position'],
  data() {
    return {};
  },
  computed: {
    pos() {
      return this.position || 'top';
    },
  },
  methods: {
    confirm() {
      this.$emit('confirm');
    },
    cancel() {
      this.$emit('cancel');
    },
  },
};
</script>

<style scoped
       lang="scss">
@import '~styles/constants.scss';

.confirmation-container {
  border: 1px solid $border-color;
  background: #fff;
  min-width: 165px;
  border-radius: 5px;
  position: absolute;
  z-index: 20;
  &.tail_right {
    top: calc(50% - 20px);
    transform: translate(-100%, 0);
    display: flex;
  }
  &.tail_top {
    left: calc(50% - 83px);
    transform: translate(0, 10px);
  }
  &.tail_left {
    right: -176px;
    top: calc(50% - 20px);
    display: flex;
  }
  &.tail_bottom {
    left: calc(50% - 83px);
    top: -51px;
  }
  & > .button {
    margin: 5px;
  }
}

* + .neighbor-invisible {
  display: none;
}
</style>
