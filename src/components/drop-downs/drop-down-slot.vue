<template>
  <div class="drop-down"
       v-outer-click="{func: hideList}"
       @click="switchList">
    <slot name="header"></slot>
    <div class="drop-down__container"
         v-show="expanded"
         :class="c_options.dropdown_css">
      <slot name="element"></slot>
    </div>
  </div>
</template>

<script>


export default {
  components: {},
  name: 'DropDownSlot',
  props: ['items', 'selected', 'options', 'readonly'],
  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    c_options() {
      return Object.assign(
        {},
        {
          dropdown_css: '',
        },
        this.options
      );
    },
  },
  methods: {
    switchList() {
      if (!this.readonly) {
        this.expanded = !this.expanded;
      }
    },
    hideList() {
      this.expanded = false;
    },
  },
};
</script>

<style scoped>
.drop-down {
  position: relative;
  display: flex;
}

.drop-down__container {
  position: absolute;
  top: 100%;
  width: 100%;
  z-index: 1;
}
</style>
