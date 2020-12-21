<template>
  <div class="hidden-scroll calendar-container">
    <single-month :options="{mode:'weekdays'}"></single-month>
    <div ref="calendar"
         class="months-container scrollable">
      <single-month v-for="(month, index) in month_to_show"
                    :month-date="month"
                    :key="month.getMonth() + month.getFullYear() * 12"
                    :options="single_month_options"
                    :period="c_period"
                    @select="selectDate($event)"
                    :selecting="selecting"></single-month>
    </div>
  </div>
</template>

<script>
import DF from '@/common/date-functions';
import $ from 'jquery';
import SingleMonth from './single-month';
import EventBus from './dp-event-bus';

const MONTH_LIMIT = 12;
const SCROLL_MIN_DIST = 22;
const SCROLL_MAX_DIST = 80;
const SCROLL_FREQ = 55;
const SCROLL_ITERATIONS_PER_SHIFT_CHECK = 2;
const SCROLL_PER_EVENT = 50;
const EXTERNAL_SCROLL_KOEFICIENT = 3.5;

// Maximum number of month we can just scroll when scrolling to specific month
// If we need to scroll MORE months than this number, we first jump to this difference and then scroll
// ... just cuz i thought name wasn't saying enough
const JUMP_SCROLL_MAX_MONTH_DIST = 5;
const JUMP_SCROLL_MONTH_DIST_DELTA = 3;

export default {
  components: {SingleMonth},
  name: 'Calendar',
  props: ['period', 'selecting', 'options'],
  data() {
    return {
      month_limit: MONTH_LIMIT,
      month_to_show: [],
      scroll_timeout: null,
      scroll_distance: 0,
    };
  },
  watch: {
    c_period() {
      if (this.selecting === null) {
        this.scrollToMonth(this.c_period.date2);
      }
    },
  },
  computed: {
    weekdays() {
      return DF.getWeekDays();
    },
    c_period() {
      let ret;
      if (this.period) {
        ret = {
          date1: this.period.date1,
          date2: this.period.date2,
        };
      } else {
        ret = {
          date1: DF.getCurrentDay(-1),
          date2: DF.getCurrentDay(-1),
        };
      }
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
    single_month_options() {
      return Object.assign({}, this.c_options, {
        weekdays: this.c_options.weekdays !== 'common',
      });
    },
  },
  created() {
    if (this.period && this.period.date2.getTime() < DF.getCurrentDay().getTime()) {
      this.monthToDate(this.period.date2);
    } else if (this.c_options.min) {
      this.monthToDate(this.c_options.min);
    } else {
      this.monthToDate(DF.getCurrentDay());
    }
  },
  methods: {
    getVisualInfo() {
      let el = this.$refs.calendar,
        $el = $(el),
        vis_elems = $el.children(':visible'),
        heights = [];

      vis_elems.each((i, e) => {
        heights.push($(e).outerHeight());
      });

      return {
        el,
        $el,
        vis_elems,
        heights,
      };
    },
    monthBack() {
      if (!this.c_options.min || DF.getMonthsDifference(this.c_options.min, this.month_to_show[0]) < 0) {
        this.month_to_show = this.month_to_show.map(elem => {
          return DF.getShiftedMonth(elem, -1);
        });
        return true;
      }
      return false;
    },
    monthForward() {
      if (
        !this.c_options.max ||
        DF.getMonthsDifference(this.c_options.max, this.month_to_show[this.month_to_show.length - 1]) > 0
      ) {
        this.month_to_show = this.month_to_show.map(elem => {
          return DF.getShiftedMonth(elem, 1);
        });
        return true;
      }
    },
    selectDate(date) {
      this.$emit('select', date);
    },
    monthToDate(date) {
      if (
        this.c_options.max &&
        this.c_options.min &&
        DF.getMonthsDifference(this.c_options.max, this.c_options.min) < this.month_limit
      ) {
        this.month_limit = DF.getMonthsDifference(this.c_options.max, this.c_options.min) || 1;
      } else {
        this.month_limit = MONTH_LIMIT;
      }

      if (this.c_options.min && DF.getShiftedMonth(date, Math.ceil(-this.month_limit / 2)) < this.c_options.min) {
        this.monthToEndDate(DF.getShiftedMonth(this.c_options.min, this.month_limit));
      } else if (
        this.c_options.max &&
        DF.getShiftedMonth(date, Math.floor(this.month_limit / 2)) > this.c_options.max
      ) {
        this.monthToEndDate(this.c_options.max);
      } else {
        this.monthToEndDate(date);
      }

      setTimeout(this.scrollTo, 0, date);
    },
    monthToEndDate(date) {
      this.month_to_show = [];

      if (this.c_options.max && DF.getMonthsDifference(date, this.c_options.max) > 0) {
        this.monthToEndDate(this.c_options.max);
      } else if (this.c_options.min && DF.getMonthsDifference(date, this.c_options.min) < 0) {
        this.monthToEndDate(DF.getShiftedMonth(this.c_options.min, this.month_limit));
      } else {
        for (let i = -this.month_limit + 1; i <= 0; ++i) {
          this.month_to_show.push(DF.getShiftedMonth(date, i));
        }
      }
    },
    scrollTo(date) {
      let index = this.month_to_show.findIndex(m => {
        return DF.getMonthsDifference(m, date) === 0;
      });

      let {el, $el, vis_elems, heights} = this.getVisualInfo();

      let total = 0;
      for (let i = 0; i < index; ++i) {
        total = total + heights[i];
      }
      if (process.env.NODE_ENV === 'development') {
        // console.log('c debug: total, heights', total, heights);
      }
      $el.scrollTop(total);

      this.setFocus();
    },
    // method to scroll calendar a bit up/down, while setting focus each iteration
    // and checking for "do we need to show one more month" inbetween a couple
    // of iterations.
    // Has MAXIMUM and MINIMUM values for a single scroll. Or a part of total scroll,
    // if somewhere in between.
    scrollIteration(iterations_before_check) {
      this.setFocus();

      if (!iterations_before_check) {
        this.checkShiftMonth();
        iterations_before_check = SCROLL_ITERATIONS_PER_SHIFT_CHECK;
      }

      if (this.$refs.calendar.scrollTop === 0 && this.scroll_distance < 0) {
        this.scroll_distance = 0;
        this.scroll_timeout = null;
      } else if (Math.abs(this.scroll_distance) <= SCROLL_MIN_DIST) {
        let sign = this.scroll_distance > 0 ? 1 : -1;
        this.$refs.calendar.scrollTop = this.$refs.calendar.scrollTop + SCROLL_MIN_DIST * sign;
        this.scroll_distance = 0;
        this.scroll_timeout = null;
      } else if (Math.abs(this.scroll_distance / 5) <= SCROLL_MIN_DIST) {
        let sign = this.scroll_distance > 0 ? 1 : -1;
        this.$refs.calendar.scrollTop = this.$refs.calendar.scrollTop + SCROLL_MIN_DIST * sign;
        this.scroll_distance = this.scroll_distance - SCROLL_MIN_DIST * sign;
        this.scroll_timeout = setTimeout(this.scrollIteration, 1000 / SCROLL_FREQ, iterations_before_check - 1);
      } else if (Math.abs(this.scroll_distance / 5) > SCROLL_MAX_DIST) {
        let sign = this.scroll_distance > 0 ? 1 : -1;
        let prev_scroll = this.$refs.calendar.scrollTop;
        this.$refs.calendar.scrollTop = this.$refs.calendar.scrollTop + SCROLL_MAX_DIST * sign;
        if (this.$refs.calendar.scrollTop === prev_scroll) {
          this.scroll_distance = 0;
          this.scroll_timeout = null;
        } else {
          this.scroll_distance = this.scroll_distance - SCROLL_MAX_DIST * sign;
          this.scroll_timeout = setTimeout(this.scrollIteration, 1000 / SCROLL_FREQ, iterations_before_check - 1);
        }
      } else {
        this.$refs.calendar.scrollTop = this.$refs.calendar.scrollTop + this.scroll_distance / 5;
        this.scroll_distance = this.scroll_distance - this.scroll_distance / 5;
        this.scroll_timeout = setTimeout(this.scrollIteration, 1000 / SCROLL_FREQ, iterations_before_check - 1);
      }
    },
    setFocus() {
      if (process.env.NODE_ENV === 'test') {
        this.$emit('focus', {
          first: this.month_to_show[0],
          part: 0.01,
          length: 2,
        });
        return;
      }
      let {el, $el, vis_elems, heights} = this.getVisualInfo();

      let total = 0,
        first_index,
        first,
        part,
        length;

      for (let i = 0; i < heights.length; ++i) {
        total = total + heights[i];
        if (!first && total > el.scrollTop) {
          first = this.month_to_show[i];
          first_index = i;
          part = (total - el.scrollTop) / heights[i];
        } else if (first && total > el.scrollTop + $el.height()) {
          length = i - first_index + (-total + el.scrollTop + $el.height()) / heights[i];
          break;
        }
      }
      if (!length) {
        length = heights.length - first_index;
      }

      let focus = {
        first,
        part,
        length,
      };

      if (process.env.NODE_ENV === 'development') {
        // console.log('c debug: focus', focus);
      }
      this.$emit('focus', focus);
    },
    handleScroll(event) {
      let event_delta = event.originalEvent.deltaY;
      if (Math.abs(event_delta) < SCROLL_PER_EVENT) {
        event_delta = event_delta >= 0 ? SCROLL_PER_EVENT : -SCROLL_PER_EVENT;
      }
      let deltaY = event_delta * ((event.emited && EXTERNAL_SCROLL_KOEFICIENT) || 1);

      //                let deltaY = (event.originalEvent.deltaY > 0 ? 1 : -1) * SCROLL_PER_EVENT *
      //                    (event.emited && EXTERNAL_SCROLL_KOEFICIENT || 1);

      this.scroll_distance = this.scroll_distance + deltaY;
      if (this.scroll_distance > 1000) {
        this.scroll_distance = 1000;
      } else if (this.scroll_distance < -1000) {
        this.scroll_distance = -1000;
      }

      if (!this.scroll_timeout) {
        this.scroll_timeout = setTimeout(this.scrollIteration, 0);
      }
    },
    checkShiftMonth() {
      let {el, $el, vis_elems, heights} = this.getVisualInfo();

      if ($el.scrollTop() + this.scroll_distance < heights[0]) {
        // if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        //   $el.scrollTop($el.scrollTop() + heights[0]);
        // }
        return this.monthBack();
      } else if (
        $el.scrollTop() + $el.height() + heights[heights.length - 1] + this.scroll_distance >
        el.scrollHeight
      ) {
        if (this.monthForward()) {
          el.scrollTop = el.scrollTop - heights[0];
          return true;
        }
        return false;
      }
    },
    scrollToMonthStepTwo(month, incoming_sign) {
      let {el, $el, vis_elems, heights} = this.getVisualInfo();

      let destination_index = DF.getMonthsDifference(month, this.month_to_show[0]),
        destination_element = $(vis_elems[destination_index]);

      if (!incoming_sign) {
        let delta = destination_element.position().top + (destination_element.outerHeight() - $el.height()) * 0.5;
        this.handleScroll({originalEvent: {deltaY: delta}});
      } else {
        let jumpstart_index = destination_index + incoming_sign * JUMP_SCROLL_MAX_MONTH_DIST,
          jumpstart_element = $(vis_elems[jumpstart_index]);

        if (!destination_element.position() || !jumpstart_element.position()) {
          console.log(destination_element, jumpstart_element); //debug!
          console.log(destination_index, jumpstart_index); //debug!
        }
        let delta =
          destination_element.position().top -
          jumpstart_element.position().top -
          ($el.height() - destination_element.outerHeight()) * 0.5;
        $el.scrollTop($el.scrollTop() + jumpstart_element.position().top);

        //                    delta = delta + jumpstart_element.position().top;
        this.handleScroll({originalEvent: {deltaY: delta}});
      }
    },
    scrollToMonth(month) {
      let sign = 0;
      if (DF.getMonthsDifference(this.month_to_show[0], month) > 0) {
        sign = 1;
      }

      if (DF.getMonthsDifference(this.month_to_show[this.month_to_show.length - 1], month) < 0) {
        sign = -1;
      }

      if (sign != 0) {
        if (sign > 0) {
          this.monthToEndDate(
            DF.getShiftedMonth(month, sign * (JUMP_SCROLL_MAX_MONTH_DIST + JUMP_SCROLL_MONTH_DIST_DELTA))
          );
        } else {
          this.monthToEndDate(DF.getShiftedMonth(month, JUMP_SCROLL_MONTH_DIST_DELTA));
        }
        setTimeout(this.scrollToMonthStepTwo, 0, month, sign);
      } else {
        this.scrollToMonthStepTwo(month);
      }
    },
  },
  mounted() {
    $(this.$refs.calendar).on('wheel', event => {
      event.preventDefault();
      this.handleScroll(event);
    });
    $(this.$refs.calendar).scrollTop(this.$refs.calendar.scrollHeight); //just to get to bottom
    EventBus.$on('scroll', this.handleScroll);
    EventBus.$on('scroll-to', this.scrollToMonth);
  },
};
</script>

<style scoped>
.calendar-container {
  position: relative;
  width: 219px;
  background: #fff;
}

.months-container {
  padding-top: 30px;
}

.weekdays {
  position: absolute;
  top: 0;
  background: linear-gradient(to bottom, #fff 0%, #fff 60%, #fff 60%, rgba(255, 255, 255, 0.5) 100%);
  z-index: 30;
  padding: 0 8px 0 8px;
  width: 100%;
}

.month-container {
  padding: 8px;
  width: 220px;
}
</style>
