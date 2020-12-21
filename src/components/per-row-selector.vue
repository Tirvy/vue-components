<template>
  <div class="flex-center h100">
    <div v-for="n in c_options.max"
         :class="{['per-' + n]: true, 'selected': (value === n)}"
         class="per-row"
         @click="select(n)">

    </div>
  </div>
</template>

<script>
export default {
  components: {},
  name: 'sParRowSelector',
  props: ['value', 'options'],
  data() {
    return {};
  },
  computed: {
    c_options() {
      return Object.assign(
        {},
        {
          max: 4,
        },
        this.options || {}
      );
    },
  },
  methods: {
    select(n) {
      this.$emit('input', n);
    },
  },
};
</script>

<style scoped
       lang="scss">
.per-row {
  height: 20px;
  width: 20px;
  margin: 0 10px;
  opacity: 0.5;
  cursor: pointer;
}

.per-row.selected {
  opacity: 1;
}

@for $n from 1 through 4 {
  .per-#{$n} {
    background: url('../images/rows-by/rows-by-#{$n}.svg') no-repeat center;
  }
}
</style>
