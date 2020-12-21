<template>
  <div>
    <div @click="showConfirm"
         style="display: flex"
         ref="toggler">
      <slot name="button">
        <div class="button button_common button_icon icon_trash"
             :class="{disabled}">
        </div>
      </slot>
    </div>

    <div class="modal-popup tail"
         style="padding: 5px; position: fixed"
         v-if="show.confirm"
         v-once
         ref="confirmation"
         :class="'tail_' + tail_position"
         v-outer-click="{func: cancel}">
      <div class="button button_common_open"
           @click="cancel">
        Отмена
      </div>
      <div class="button button_common"
           @click="confirm">
        <slot name="confirm">
          Удалить
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
/*
*
* Компонента для иконки удаления, которая должна удалять что-то запросом.
* Принимает проп position, вроде top, bottom, left, right
* При клике на "УДОЛИ ПЛЖ" всплывает событие @confirm
*
* UPD 05.19: Теперь есть слот button! Почему его раньше не было - без понятия. И переименовывать лень пока что
*
* */

import ConfirmationPopup from './confirmation-popup';

import Popper from 'popper.js';

const positions = ['top', 'right', 'bottom', 'left'];

export default {
  name: 'DeleteConfirm',
  components: {ConfirmationPopup},
  mixins: [],
  props: ['position', 'disabled'],
  data() {
    return {
      show: {
        confirm: false,
      },
      popper: null,
    };
  },
  computed: {
    pos() {
      return this.position || 'bottom';
    },
    tail_position() {
      const position_index = positions.indexOf(this.pos);
      return positions[(position_index + 2) % 4];
    },
  },
  methods: {
    confirm() {
      this.cancel();
      this.$emit('confirm');
    },
    showConfirm() {
      if (this.disabled) {
        return
      }
      this.show.confirm = true;
      this.$nextTick(() => {
        this.popper = new Popper(this.$refs.toggler, this.$refs.confirmation, {
          placement: this.pos,
          positionFixed: true,
          modifiers: {
            preventOverflow: {
              enabled: true,
              // Этот элемент бы задать как-то иначе... но пока сойдет
              boundariesElement: document.getElementById('auto-instrument'),
            },
            offset: {
              offset: '0, 6px',
            },
          },
        });
        this.$nextTick(() => {
          this.popper.update();
        })
      });
    },
    cancel() {
      this.show.confirm = false;
      if (this.popper) {
        this.popper.destroy();
        this.popper = null;
      }
    },
  },
};
</script>

<style scoped>
</style>
