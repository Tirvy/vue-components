<template>
  <div class="guideline-container">

    <guideline-item :data="items_object['drop-down']">
      <div style="padding: 10px 50px; width: 300px"
           class="flex-space">
        <drop-list v-for="(dd, index) in dropdown.variants"
                   v-model="dd.value"
                   :options="dd.options"
                   :key="index"
                   :data="dropdown.data"></drop-list>
      </div>
    </guideline-item>

    <drop-list v-for="(item, index) in dds"
               :key="index"
               :options="{show_id: true, base: 'filtered', sort: 'checked'}"
               :flat="true"
               style="margin: 40px;width:400px; max-height: 600px"
               :data="item.data"
               v-model="item.value"></drop-list>

    <guideline-item :data="items_object['toggler']">
      <div class="flex-start">
        <div>
          <div class="input-header"></div>
        </div>
        <toggler-button v-model="toggler.value"></toggler-button>
        <toggler-button v-model="toggler.value"
                        :status="'active'"></toggler-button>
        <toggler-button v-model="toggler.value"
                        :status="'processing'"></toggler-button>
        <toggler-button v-model="toggler.value"
                        :status="'warning'"></toggler-button>
        <toggler-button v-model="toggler.value"
                        :status="'error'"></toggler-button>
        <toggler-button :value="false"
                        :status="'active'"></toggler-button>
        <div style="width: 20px"></div>
        <toggler-button :value="false"
                        :status="'active'"
                        :readonly="true"></toggler-button>
        <toggler-button :value="false"
                        :readonly="true"></toggler-button>
        <toggler-button :value="true"
                        :status="'active'"
                        :readonly="true"></toggler-button>
      </div>
    </guideline-item>
  </div>
</template>

<script>
import GuidelineItem from './guideline-item';
import DropList from '@/components/drop-list';
import CheckBox from '@/components/check-box';
import TogglerButton from "@/components/slide-toggler";

import {categories, geo, randata} from './dddata';

export default {
  name: 'guideline',
  components: {
    TogglerButton,
    GuidelineItem,
    DropList,
    CheckBox,
  },
  directives: {},
  mixins: [],
  props: [''],
  data() {
    return {
      circle_value: 0.75,
      dds: [
        // {
        //   data: categories,
        //   value: [categories[0].id]
        // },
        // {
        //   data: geo,
        //   value: []
        // },
        {
          data: randata,
          value: [1024]
        },
      ],
      items: [
        {
          name: 'Дроп-Даун',
          alias: 'drop-down',
          tech: 'components/drop-list. Тот, который drop-down - уже старая версия. DropDownSlot - отдельная компонента, её здесь не рассматриваем',
          description: `Стандартный дропдаун, реализующий как набивание чекбоксов, так и выбор элемента из списка.
           Может быть с деревом или нет. Нормально обрабатывает ОГРОМНЫЕ списки (список на 10 000 элементов представлен ниже)`,
          examples: 'Выбор аккаунта/ов, категорий... да вообще всё (но пока не везде, см. ниже)',
        },
        {
          name: 'Тогглер',
          alias: 'toggler',
          tech: 'components/slide-toggler',
          description: 'Может быть как цветным, так и серым с обеих сторон. В этом случае подразумевается выбор из двух вариантов',
          examples: 'Переключение статуса или выбор из двух значений',
        },
      ],
      toggler: {
        value: true
      },
      dropdown: {
        data: [
          {
            id: 1,
            pid: 0,
            name: 'Банана',
            name_short: 'Бан'
          },
          {
            id: 2,
            pid: 0,
            name: 'Манга',
            name_short: 'Ман',
            selected: true
          },
          {
            id: 3,
            pid: 0,
            name: 'Киви',
            name_short: 'Кив'
          },
          {
            id: 12,
            name: 'Молочка'
          },
          {
            id: 6,
            pid: 12,
            name: 'Сметана'
          },
          {
            id: 13,
            pid: 12,
            name: 'Кумыс'
          },
          {
            id: 11,
            name: 'Изыски',
            name_short: 'МММ'
          },
          {
            id: 4,
            pid: 11,
            name: 'Маринад',
            name_short: 'МММ'
          },
          {
            id: 5,
            pid: 11,
            name: 'Сливы'
          },
          {
            id: 10,
            pid: 11,
            name: 'Спора'
          },
          {
            id: 9,
            pid: 11,
            name: 'Батон',
            name_short: 'Бан'
          },
          {
            id: 7,
            name: 'Борщ',
            name_short: 'Бан'
          },
          {
            id: 8,
            name: 'Картошка',
            name_short: 'Бан'
          },
        ],
        variants: [
          {
            options: {},
            value: {
              id: 1,
              name: 'Банана',
              name_short: 'Бан'
            }
          },
          {
            options: {},
            value: [1, 2, 3]
          },
          {
            options: {base: 'mimic'},
            value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          },
          {
            options: {units: 'Еда'},
            value: [1]
          },
          {
            options: {button_text_type: 'unit_number', units: 'Сколько', force_search: false},
            value: []
          },

        ]
      }
    };
  },
  computed: {
    items_object() {
      let ret = {};
      this.items.forEach(item => {
        ret[item.alias] = item;
      });
      return ret;
    },
  },
  methods: {}
};
</script>

<style scoped
       lang="scss">
@import '~styles/constants.scss';

</style>
