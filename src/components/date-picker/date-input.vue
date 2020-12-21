<template>
  <input v-model="current_value"
         v-bind="$attrs"
         @blur="updateValue"
         @input="checkValue()">
</template>

<script>
import moment from 'moment';
import Inputmask from 'inputmask';

const im = new Inputmask('[9]9.[9]9.99[99]');

export default {
  name: 'DateInput',
  components: {},
  directives: {},
  mixins: [],
  props: ['value'],
  data() {
    return {
      current_value: '',
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        if (document.activeElement !== this.$el) {
          this.updateValue();
        }
      },
    },
  },
  mounted() {
    im.mask(this.$el);
  },
  computed: {},
  methods: {
    updateValue() {
      this.current_value = moment(this.value).format('DD.MM.YY');
    },
    checkValue() {
      let m_date = new moment(this.current_value, ['DD.MM-YYYY', 'DD.MM-YY']);
      if (m_date.isValid()) {
        this.$emit('input', m_date.toDate());
      }
    },
  },
};
</script>

<style scoped>
</style>
