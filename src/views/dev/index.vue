<template>
  <div class="dev-container">
    <guideline></guideline>
  </div>
</template>

<script>
import Guideline from './guideline';

export default {
  components: {
    Guideline,
  },
  directives: {},
  mixins: [],
  props: [''],
  data() {
    return {};
  },
  computed: {},
  methods: {},
};
</script>

<style scoped>
.dev-container {
  overflow: auto;
  max-height: 100%;
}
</style>
