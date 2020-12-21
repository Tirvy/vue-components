<template>
  <div class="toggler-button"
       :class="{disabled: readonly}"
       @click="switchStatus">
    <div class="toggler-back"
         :class="[{disabled: readonly, inactive: is_not_active}]"></div>
    <div class="toggler-front"
         :class="[status_class, {on: is_on, disabled: readonly}]"></div>
  </div>
</template>

<script>
/*
* Тогглер, слайдер... в общем штука, которая может либо отображать "вкл/выкл", либо выбирать один из двух пунктов
*
* Для вкл/выкл надо добавлять status, который будет, если "вкл"
* */

export default {
  name: 'TogglerButton',
  components: {},
  directives: {},
  mixins: [],
  props: ['value', 'status', 'readonly'],
  data() {
    return {};
  },
  computed: {
    is_on() {
      return this.value;
    },
    is_not_active() {
      return !this.value && this.status;
    },
    on_status() {
      return this.status || 'default';
    },
    off_status() {
      return this.status ? 'inactive' : 'default';
    },
    status_class() {
      return this.is_on ? this.on_status : this.off_status;
    },
  },
  methods: {
    switchStatus() {
      if (!this.readonly) {
        this.$emit('input', !this.value);
        this.$emit('change', !this.value);
      }
    },
  },
};
</script>

<style scoped
       lang="scss">
@import '~styles/constants.scss';

$width_back: 36px;
$width_front: 20px;
$width_diff: 2px;

.toggler-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: #{2 * $width_diff + $width_back};
  height: $height_interactive;
  position: relative;
  cursor: pointer;
  &.disabled {
    cursor: default;
  }
}

.toggler-back {
  width: $width_back;
  height: #{$width_front - 2 * $width_diff};
  border: 1px solid $border-color;
  border-radius: #{$width_front/2 - $width_diff};
  box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.3);
  &.inactive {
    background: $grey_dark;
  }
  &.disabled {
    background: $grey_dark;
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
  }
}

.toggler-front {
  height: $width_front;
  width: $width_front;
  border-radius: 50%;
  border: 2px solid $border-color;
  box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.3);
  position: absolute;
  transition: right 300ms;
  &.disabled {
    border: 2px solid $grey_dark;
  }
  &.on {
    right: 0;
  }
  &:not(.on) {
    right: #{2 * $width_diff + $width_back - $width_front};
  }
  &.default {
    background: $status_default;
  }
  &.active {
    background: $status_active;
  }
  &.processing {
    background: #fff;
    box-shadow: inset 0 0 2px 1px $status_active;
  }
  &.warning {
    background: $status_warning;
  }
  &.error {
    background: $status_error;
  }
  &.inactive {
    background: $status_inactive;
  }
}
</style>
