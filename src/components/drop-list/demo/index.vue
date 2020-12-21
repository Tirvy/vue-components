<template>
  <div class="flex-fill"
       style="max-height: 100vh;">
    <div class="w600px modal-window-block_leftmost modal-window-block">
      <div class="vertical-indent">
        <div class="button button_common"
             @click="component_key++">Перезагрузить компоненту
        </div>
      </div>
      <div class="vertical-indent">
        <div class="input-header">Стилизация</div>
        <multi-thumbler :data="data.stylings"
                        v-model="current.styling"></multi-thumbler>
      </div>
      <div class="vertical-indent">
        <div class="input-header">Входные данные</div>
        <multi-thumbler :data="data.data"
                        v-model="setting_data"></multi-thumbler>
      </div>
      <div class="vertical-indent">
        <div class="input-header">Исходное значение</div>
        <multi-thumbler :data="data.value"
                        v-model="setting_value"></multi-thumbler>
      </div>
      <div class="vertical-indent">
        <check-box v-model="current.flat"
                   @input="component_key++">Плоский список (flat)
        </check-box>
      </div>
      <div class="modal-window-block__header vertical-indent border-top">
        Опции<br> Скорее всего после смены опций надо будет перезагружать компоненту
      </div>
      <div class="vertical-indent border-bottom">
        <div class="input-header">Тип обозначения выбранных элементов (button_text_type)</div>
        <drop-list :flat="true"
                   :data="data.button_text_types"
                   v-model="current.options.button_text_type"
                   :options="{show_id: true}"></drop-list>
      </div>
      <div class="vertical-indent border-bottom">
        <div class="input-header">Как отображать базовый элемент (base)</div>
        <drop-list :flat="true"
                   :data="data.base"
                   v-model="settings_base"
                   :options="{show_id: true}"></drop-list>
      </div>
      <div class="vertical-indent border-bottom">
        <div class="input-header">Подпись в дроп-дауне (units)</div>
        <input v-model="current.options.units">
      </div>
      <div class="vertical-indent border-bottom">
        <div class="input-header">
          Класс/стили выпадающего меню. Можно настраивать, ниже лишь пара
          примеров (container_class_name)
        </div>
        <drop-list :flat="true"
                   :data="data.classes"
                   v-model="settings_class"
                   :options="{show_id: true}"></drop-list>
      </div>
      <div class="vertical-indent">
        <check-box v-model="current.options.show_id">Показывать ли id? (show_id)</check-box>
      </div>
    </div>
    <div class="w600px modal-window-block_rightmost modal-window-block border-left">
      <drop-list :key="component_key"
                 :class="current.styling.id"
                 :data="current.data"
                 :value="current.value"
                 @input="current.value = $event"
                 :flat="current.flat"
                 :options="current.options"></drop-list>
    </div>
  </div>
</template>

<script>
import DropList from '../index';
import MultiThumbler from '@/components/multi-thumbler';

import {
  BASE_VARIANTS,
  BUTTON_TEXT_TYPES,
  DATA_VARIANTS,
  VALUE_VARIANTS,
  CLASS_VARIANTS,
  STYLING_VARIANTS,
} from './constants';
import CheckBox from '@/components/check-box/index';

export default {
  name: 'DropListDemo',
  components: {CheckBox, DropList, MultiThumbler},
  directives: {},
  mixins: [],
  props: [''],
  data() {
    return {
      component_key: 1,
      data: {
        data: DATA_VARIANTS,
        value: VALUE_VARIANTS,
        button_text_types: BUTTON_TEXT_TYPES,
        base: BASE_VARIANTS,
        classes: CLASS_VARIANTS,
        stylings: STYLING_VARIANTS,
      },
      current: {
        styling: STYLING_VARIANTS[0],
        data: DATA_VARIANTS[0].data,
        value: DATA_VARIANTS[0].data[0],
        flat: false,
        options: {
          container_class_name: CLASS_VARIANTS[0].id,
          button_text_type: BUTTON_TEXT_TYPES[0],
          base: false,
          force_search: false,
          units: '',
          show_id: false,
        },
      },
    };
  },
  computed: {
    setting_data: {
      get() {
        return this.data.data.find(item => item.data === this.current.data);
      },
      set(value) {
        this.current.data = value.data;
        this.setting_value = this.setting_value;
      },
    },
    setting_value: {
      get() {
        if (Array.isArray(this.current.value)) {
          return VALUE_VARIANTS[1];
        }
        return VALUE_VARIANTS[0];
      },
      set(value) {
        if (value.id === 'select') {
          this.current.value = this.current.data[0];
        } else {
          this.current.value = [this.current.data[1].id];
        }
        console.log('now', this.current.value);
      },
    },
    settings_base: {
      get() {
        return this.data.base.find(item => item.id === this.current.options.base);
      },
      set(value) {
        this.current.options.base = value.id;
      },
    },
    settings_class: {
      get() {
        return this.data.classes.find(item => item.id === this.current.options.container_class_name);
      },
      set(value) {
        this.current.options.container_class_name = value.id;
      },
    },
  },
  methods: {},
};
</script>

<style scoped>
</style>
