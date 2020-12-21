<template>
  <div id="app">
    <Dev/>
  </div>
</template>

<script>
import Dev from './views/dev'

export default {
  name: 'App',
  components: {
    Dev
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background: #f1ede8;
}
</style>

<style lang="scss" src="./styles/dom.scss"></style>
<style lang="scss" src="./styles/common-styles.scss"></style>
