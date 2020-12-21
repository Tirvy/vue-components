<template>
  <div class="double-list__container">
    <div :class="key + '-list'"
         :key="key"
         class="list"
         v-for="key in lists_keys">
      <div class="list__title input-header">
        {{data[key].title || ''}}
      </div>
      <div class="input-container_search"
           v-if="typeof data[key].search !== 'undefined'">
        <input :value="data[key].search"
               @input="applySearch">
      </div>
      <template v-if="data[key].value && data[key].value.length">
          <draggable :value="data[key].value"
                     @input="sortDraggable"
                     :disabled="!data[key].draggable">
            <transition-group name="list-transition"
                              class="list__items"
                              tag="div">
              <div class="list__elem"
                   :class="{draggable: data[key].draggable}"
                   :key="item.id + key"
                   v-for="(item, idx) in data[key].value">
                <div class="list__elem-name">
                  {{data[key].numbering ? (idx + 1) : '' }} {{item.name}}
                </div>
                <div class="list__elem-arrow button button_common button_icon button_solo"
                     :class="'icon_arrow-curved_' + key"
                     @click="moveItem(item, key)"></div>
              </div>
            </transition-group>
          </draggable>
      </template>
      <div class="list__placeholder"
           v-else>
        {{data[key].placeholder || ''}}
      </div>
    </div>
  </div>
</template>

<script>
import Draggable from 'vuedraggable';

/**
 * data:
 *    left / right: {
 *      numbering (true/false),
 *      draggable (true/false),
 *      title,
 *      placeholder,
 *      search (should be at least '', if want to enable),
 *      value: array
 *    }
 */
export default {
  name: "DoubleList",
  components: {Draggable},
  props: ['data'],
  computed: {
    lists_keys() {
      if (!this.data || !this.data.right || !this.data.left) {
        return [];
      }

      return ['left', 'right'];
    }
  },
  methods: {
    applySearch(el) {
      this.$emit('applySearch', el.target.value);
    },
    moveItem(item, from) {
      this.$emit('moveItem', {item, from});
    },
    sortDraggable(value) {
      this.$emit('sortDraggable', value);
    }
  }
}
</script>

<style lang="scss"
       scoped>
@import '~styles/constants.scss';
$_ARROW_TRANSITIONS: all .05s ease-in;

.double-list__container {
  width: 100%;
  display: flex;
}

.list {
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-left: 2px solid $border-color;
  width: 50%;

  &.left-list {
    .list__elem {
      .list__elem-arrow {
        right: -28px;
        transform: translate3d(0, -50%, 0) scale(-1, 1);
      }

      &:hover {
        .list__elem-arrow {
          right: 4px;
        }
      }
    }
  }

  &.right-list {
    .list__elem {
      .list__elem-arrow {
        left: -28px;
        transform: translate3d(0, -50%, 0);
      }

      &:hover {
        padding-left: 48px;

        .list__elem-arrow {
          left: 4px;
        }
      }
    }
  }
}

.list__items {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
  height: 410px;
  margin-top: 10px;
  padding: 0 5px;
}

.list__placeholder {
  height: 100%;
  max-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  text-transform: uppercase;
}

.list__elem {
  position: relative;
  padding: 10px 0 10px 20px;
  border: 1px solid $border-color;
  border-radius: 4px;
  margin-top: 10px;
  flex-shrink: 0;
  overflow-x: hidden;
  transition: $_ARROW_TRANSITIONS;

  &:first-child {
    margin-top: 0px;
  }
}

.list__elem-arrow {
  position: absolute;
  top: 50%;
  transition: $_ARROW_TRANSITIONS;
}

.draggable {
  cursor: -webkit-grab;
  cursor: grab;

  &:active {
    cursor: -webkit-grabbing;
    cursor: grabbing;
  }
}

.list-transition-enter-active, .list-transition-leave-active {
  transition: all .1s;
}

.list-transition-enter, .list-transition-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
