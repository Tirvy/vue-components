<template>
  <div class="pos-rel">
    <input
      ref="input"
      :class="class_names"
      :style="styles"
      :readonly="readonly"
      :placeholder="placeholder"
      v-on="$options.$listeners"
      v-bind="$attrs"
      v-on:autoNumeric:rawValueModified="emitValue"
    >
    <div v-if="canEmpty !== null"
         class="input-emptier"
         @click="emptyMe">&#10005;
    </div>
    <div v-if="units !== null"
         class="input-units">{{units}}
    </div>
  </div>
</template>

<script>
import AutoNumeric from 'autonumeric';

const CONFIG = {
  separator: ' ',
  part: ',',
};
export default {
  name: 'FormattedInput',
  components: {},
  props: {
    value: {
      default: '',
    },
    dot: {
      default: 2,
    },
    readonly: {
      default: false,
    },
    placeholder: {
      default: '',
    },
    canEmpty: {
      default: null,
    },
    units: {
      default: null,
    },
    returnZero: {
      default: true,
    },
    class_names: {
      default: '',
    },
    styles: {
      default: '',
    },
  },
  data() {
    return {
      auto_numeric: null,
    };
  },
  created() {
    this.$options.$listeners = Object.assign({}, this.$listeners, {input: () => {}});
  },
  mounted() {
    // https://github.com/autoNumeric/autoNumeric
    // При вводе НАДО обращать внимание на раскладку, что иногда мешает
    this.auto_numeric = new AutoNumeric(this.$refs.input, this.value || (this.returnZero ? 0 : ''), {
      allowDecimalPadding: 'floats',
      digitGroupSeparator: ' ',
      decimalCharacter: ',',
      decimalCharacterAlternative: '.',
      currencySymbol: '',
      decimalPlaces: this.dot,
      selectOnFocus: false,
      eventBubbles: false,
      isCancellable: false,
      modifyValueOnWheel: false,
    });

    if (this.$listeners.paste) {
      this.$refs.input.removeEventListener('paste', this.auto_numeric._onPasteFunc);
      this.$refs.input.addEventListener('paste', event => {
        if (!event.clipboardData.getData('text').includes('\t')) {
          this.auto_numeric._onPasteFunc(event);
        } else {
          event.preventDefault();
        }
      });
    }
  },
  watch: {
    value(new_val, old_val) {
      if (new_val !== old_val) {
        let inputed_float = parseFloat(
          String(this.$refs.input.value)
            .replace(',', '.')
            .replace(/ +/g, '')
        );
        if (inputed_float !== new_val) {
          this.auto_numeric.set(this.value || (this.returnZero ? 0 : ''));
        }
      }
    },
  },
  methods: {
    emptyMe() {
      this.$emit('input', 0);
    },
    emitValue(value) {
      if (this.auto_numeric && this.auto_numeric.getNumber() !== this.value) {
        let ret_value = this.auto_numeric.rawValue.length ? +this.auto_numeric.rawValue : this.auto_numeric.rawValue;
        this.$emit('input', this.returnZero ? this.auto_numeric.getNumber() : ret_value);
      }
    },
  },
  beforeDestroy() {
    this.auto_numeric &&
    this.auto_numeric.global &&
    this.auto_numeric.global.remove &&
    this.auto_numeric.global.remove();
    this.auto_numeric = null;
  },
};
</script>

<style scoped
       lang="scss">
@import '~styles/constants.scss';

div.input-emptier {
  bottom: calc(50% - 12px);
  right: 2px;
  font-size: 10px;
  position: absolute;
  cursor: pointer;
  text-align: center;
  padding: 5px;
}

div.input-units {
  bottom: calc(50% - 12px);
  right: 1px;
  font-size: 10px;
  position: absolute;
  text-align: center;
  padding: 5px;
  color: $grey_text;
}
</style>
