<template>
  <div class="guideline-item-container">
    <div class="name">
      {{data.name}}
    </div>
    <div class="alias">
      {{data.alias}}
    </div>
    <slot></slot>
    <div class="text-block" v-if="data.tech">
      <div class="flex-start c_pointer"
           @click="toggle('tech')">
        <div class="expander_period"
             :class="{active: show.tech}">

        </div>
        <div class="header">
          Технические данные:
        </div>
      </div>
      <div v-if="show.tech" class="text-content">
        {{data.tech}}
      </div>
    </div>
    <div class="text-block" v-if="data.description">
      <div class="flex-start c_pointer"
           @click="toggle('description')">
        <div class="expander_period"
             :class="{active: show.description}">

        </div>
        <div class="header">
          Описание:
        </div>
      </div>
      <div v-if="show.description"  class="text-content">
        {{data.description}}
      </div>
    </div>
    <div class="text-block" v-if="data.details">
      <div class="flex-start c_pointer"
           @click="toggle('details')">
        <div class="expander_period"
             :class="{active: show.details}">

        </div>
        <div class="header">
          Описание примененного стиля:
        </div>
      </div>
      <div v-if="show.details" class="text-content">
        {{data.details}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'guideline-item',
  components: {},
  directives: {},
  mixins: [],
  props: ['data'],
  data() {
    return {
      show: {
        tech: true,
        description: true,
        details: true
      }
    };
  },
  computed: {},
  methods: {
    toggle(param) {
      this.show[param] = !this.show[param];
    }
  }
};
</script>

<style scoped
       lang="scss">
@import '~styles/constants.scss';

.name {
  font-size: 28px;
  font-weight: 500;
  text-align: center;
  width: 100%;
}

.alias {
  font-size: 14px;
  font-weight: 400;
  text-align: center;
  width: 100%;
}

.text-block {
  margin: 10px 0;
}

.header {
  font-size: 16px;
}

.text-content {
  max-width: 800px;
  padding: 0 12px;
}
</style>
