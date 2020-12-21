<template>
  <div class="hidden-scroll month-list">
    <div ref="calendar"
         class="scrollable">
      <div v-for="(month, index) in dataToShow"
           class="month"
           @click="scrollTo(month)"
           :key="month.key"
           :class="{'in-focus': month.focused, 'partly': month.part, 'year': month.year}">
        {{month.name}}
        <span v-if="month.year">{{month.year}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import DF from '@/common/date-functions';
import $ from 'jquery';
import SingleMonth from './single-month';
import EventBus from './dp-event-bus';

const SINGLE_MONTH_VISIBLE_HEIGHT = 30; // same as in css
const ADDITIONAL_MONTHS = 4;

// WARNING!!!
// FOR WHOEVER TRIES TO REFACTOR THIS CODE
//
// Dont even think this code is any bit same as calendar. Much differs, so another.

export default {
  components: {SingleMonth},
  name: 'MonthList',
  props: ['options', 'focus'],
  data() {
    return {
      visible_end: null,
      months_length: 0,
    };
  },
  computed: {
    dataToShow() {
      if (!this.focus) {
        return [];
      }

      let center = DF.getShiftedMonth(this.focus.first, Math.floor(this.focus.length / 2));
      if (this.c_options.max && DF.getMonthsDifference(this.c_options.max, center) < this.months_length / 2) {
        this.visible_end = this.c_options.max;
      } else if (this.c_options.min && DF.getMonthsDifference(center, this.c_options.min) < this.months_length / 2) {
        this.visible_end = DF.getShiftedMonth(this.c_options.min, this.months_length);
      } else {
        this.visible_end = DF.getShiftedMonth(center, Math.floor(this.months_length / 2));
      }

      //                if (this.months_length > DF.getMonthsDifference(this.c_options.max, center)){
      //                    this.months_length = DF.getMonthsDifference(this.c_options.max, center)
      //                }

      let ret = [];
      for (let i = -this.months_length; i <= 0; ++i) {
        let temp = {
          date: DF.getShiftedMonth(this.visible_end, i),
          key: i,
        };
        temp.name = DF.getMonthsNames()[temp.date.getMonth()];
        if (temp.date.getMonth() === 0) {
          temp.year =
            "'" +
            temp.date
              .getFullYear()
              .toString()
              .substr(2, 2);
        }
        let first_diff = DF.getMonthsDifference(temp.date, this.focus.first);
        temp.focused =
          (first_diff >= 0 && first_diff < this.focus.length) || (this.focus.length <= 0 && first_diff === 0);
        temp.part =
          (first_diff === 0 && this.focus.part < 0.5) ||
          (this.focus.length > first_diff && this.focus.length - first_diff < 0.5);

        ret.push(temp);
        //                    if ((temp.date.getMonth() === 11) && (i + 1 <= 0)) {
        //                        ++i;
        //                        ret.push({
        //                            date: temp.date,
        //                            key: i,
        //                            name: temp.date.getFullYear() + 1
        //                        });
        //                    }
      }

      this.calcScrollTop(ret);
      //                setTimeout(this.calcScrollTop, 0);

      return ret;
    },
    c_options() {
      return Object.assign(
        {},
        {
          min: null,
          max: DF.getCurrentDay(),
        },
        this.options || {}
      );
    },
  },
  methods: {
    calcScrollTop(dts) {
      if (!this.focus) {
        return;
      }

      let el = this.$refs.calendar,
        $el = $(el),
        vis_elems = $el.children(),
        heights = [];

      vis_elems.each((i, e) => {
        heights.push($(e).outerHeight());
      });

      let total = 0,
        to_first = 0;

      for (let i = 0; i < heights.length && total === 0; ++i) {
        if (DF.getMonthsDifference((dts || this.dataToShow)[i].date, this.focus.first) === 0) {
          to_first = to_first + heights[i] * (1 - this.focus.part);
          total = heights[i] * this.focus.part;
          for (let j = 1; j <= this.focus.length && i + j < heights.length; ++j) {
            total = total + heights[i + j];
          }
          total = total + (heights[i + Math.ceil(this.focus.length)] * (this.focus.length % 1) || 0);
        } else {
          to_first = to_first + heights[i];
        }
      }

      $(el).scrollTop(to_first + total / 2 - $(el).height() / 2);
    },
    monthBack() {
      if (!this.c_options.min || this.c_options.min < DF.getShiftedMonth(this.visible_end, -1 - this.months_length)) {
        this.visible_end = DF.getShiftedMonth(this.visible_end, -1);
      }
    },
    monthForward() {
      if (!this.c_options.max || this.c_options.max > DF.getShiftedMonth(this.visible_end, +1)) {
        this.visible_end = DF.getShiftedMonth(this.visible_end, +1);
      }
    },
    scroll(event) {
      event.deltaY < 0 ? this.monthBack() : this.monthForward();
    },
    scrollTo(month) {
      EventBus.$emit('scroll-to', month.date);
    },
    recalcLength() {
      let $el = $(this.$el);
      this.months_length = Math.floor($el.innerHeight() / SINGLE_MONTH_VISIBLE_HEIGHT) + ADDITIONAL_MONTHS * 2;
      if (this.c_options.max && this.c_options.min) {
        let m_diff = DF.getMonthsDifference(this.c_options.max, this.c_options.min);
        if (this.months_length > m_diff) {
          this.months_length = m_diff;
        }
      }
    },
    handleScroll(event) {
      event.emited = true;
      EventBus.$emit('scroll', event);
    },
  },
  mounted() {
    let $el = $(this.$el);
    $el.on('resize', this.recalcLength);
    this.recalcLength();

    $(this.$refs.calendar).on('wheel', event => {
      event.preventDefault();
      this.handleScroll(event);
    });

    setTimeout(this.calcScrollTop, 5);
  },
};
</script>

<style scoped
       lang="scss">
@import '~styles/constants.scss';

.month-list {
  background: #fff;
  width: 80px;
  max-height: 100%;
  overflow-y: auto;
}

.month {
  padding: 8px 2px;
  height: 30px;
  opacity: 0.6;
  cursor: pointer;
  white-space: nowrap;
  &.year {
    border-top: 1px solid $border-dropdown;
    & span {
      font-size: 12px;
    }
    &.in-focus {
      border-top: 1px solid $border-dropdown;
    }
  }
  &.in-focus {
    opacity: 1;
    font-weight: $font_bold;
  }
  &.partly {
    opacity: 1;
    font-weight: $font_regular;
  }
}
</style>
