<template>
  <div class="weekdays-selector-container">
    <div v-for="day in weekdays"
         class="day-item"
         @click="select(day)"
         :class="{active: value.includes(day.alias)}">
      {{day.name}}
    </div>
  </div>
</template>

<script>
import {WEEKDAYS} from '../common/constants.js';

export default {
  name: 'WeekdaysSelector',
  components: {},
  directives: {},
  mixins: [],
  props: ['value', 'options'],
  data() {
    return {
      weekdays: WEEKDAYS,
    };
  },
  computed: {},
  methods: {
    select(day) {
      let new_val;
      if (this.value.includes(day.alias)) {
        new_val = this.value.filter(item => item !== day.alias);
      } else {
        new_val = this.value.concat(day.alias);
      }
      this.$emit('change', new_val);
      this.$emit('input', new_val);
    },
  },
};
</script>

<style scoped
       lang="scss">
@import '~styles/constants.scss';

$single_day_height: 21px;
$single_day_width: 21px;
$single_space_width: 8px;

.weekdays-selector-container {
  display: flex;
  justify-content: space-between;
  width: #{$single_day_width * 7 + $single_space_width * 6};
}

.day-item {
  width: $single_day_width;
  border: 1px solid $border-color;
  padding: 4px;
}
</style>
