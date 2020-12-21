<template>
  <input :readonly="readonly" class="datetime-picker" :value="value" @input="$emit('input', $event.target.value)" placeholder="дд.мм.гг чч:мм">
</template>

<script>
import rome from 'rome';

let moment = rome.moment;
moment.locale('ru');
rome.use(moment);

export default {
  name: 'DatetimePicker',
  components: {},
  directives: {},
  mixins: [],
  props: ['value', 'readonly'],
  data() {
    return {
      rome: undefined,
    }
  },
  watch: {
    value(new_val) {
      if (this.rome) {
        this.rome.setValue(this.value)
      }
    }
  },
  mounted(){
    this.rome = rome(this.$el, {
      inputFormat: 'DD.MM.YYYY HH:mm'
    });
    this.rome.setValue(this.value);
    this.rome.on('data', (value) => {
      this.$emit('input', value);
    })
  },
  computed: {},
  methods: {}
}
</script>

<style lang="scss">
@import '~styles/constants.scss';
@import '~rome/dist/rome.css';

.rd-day-body {
  padding: 2px;
}

.rd-time-list {
  border: 1px solid $border-color
}
</style>