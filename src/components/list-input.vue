<template>
  <div class="list-input">
    <div class="button button_common button_solo"
         style="display: block"
         :class="{disabled: readonly}"
         @click="showInput">
      Строк: {{rows}}
    </div>
    <textarea class="expanding-textarea"
              :value="value"
              @input="update"
              v-if="show.textarea"
              v-outer-click="{func: hideInput}">
    </textarea>
  </div>
</template>

<script>
/*
* Комонента, выглядящаяя в обычном состоянии как просто кнопка, но при нажатии раскрывающая textarea для построчного ввода
*
* Стоит прикрутить popper как-нибудь, но не сегодня
* */

export default {
  name: 'ListInput',
  components: {},
  mixins: [],
  props: ['value', 'readonly'],
  data() {
    return {
      show: {
        textarea: false,
      },
    };
  },
  computed: {
    rows() {
      return (this.value && this.value.split('\n').length) || 0;
    },
  },
  methods: {
    update(event) {
      this.$emit('input', event.target.value);
    },
    hideInput() {
      this.show.textarea = false;
    },
    showInput() {
      if (!this.readonly) {
        this.show.textarea = true;
      }
    },
  },
};
</script>

<style scoped>
.list-input {
  position: relative;
}

.expanding-textarea {
  position: absolute;
  width: 190px;
  resize: vertical;
  min-height: 100px;
  z-index: 1;
}
</style>
