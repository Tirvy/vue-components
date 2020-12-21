<template>
  <div class="tumbler">
    <div class="button" v-for="item in data"
         :class="{active: value.id === item.id}"
         @click="select(item)">
      {{item.name}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'MultiThumbler',
  components: {},
  directives: {},
  mixins: [],
  props: ['value', 'data'],
  data() {
    return {}
  },
  computed: {},
  methods: {
    select(item) {
      this.$emit('input', item);
    }
  }
}
</script>

<style scoped>
</style>