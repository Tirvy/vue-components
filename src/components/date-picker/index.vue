<template>
  <div class="date-picker-container"
       v-keyup="accept">
    <div class="dp-header"
         v-if="c_options.presets">
      <div v-for="preset in predefined"
           class="button button_small"
           :class="{disabled: preset.prop === 'unavailable'}"
           @click="selectPreset(preset)">
        {{preset.name}}
      </div>
    </div>
    <div class="dp-inputs flex-space border-bottom"
         v-if="c_options.presets">
      <template v-for="(date, date_index) in input_periods">
        <date-input :value="date"
                    :autofocus="date_index === 0"
                    :key="date_index"
                    @input="inputDate(date_index, $event)"></date-input>
        <span v-if="date_index < input_periods.length - 1">-</span>
      </template>
    </div>
    <div class="dp-body">
      <div class="dp-body__content">
        <calendar :period="current_period"
                  :options="calendar_options"
                  :selecting="false"
                  @focus="handleCalendarFocus"
                  @select="selectDate"
                  :style="calendar_style"></calendar>

        <div class="dp-body__periods"
             v-if="c_periods.length > 1">
          <div v-for="(period, index) in c_periods"
               class="calendar-period"
               @click.self="setBase(period)">
            <div :class="period.main ? 'icon_star_gold' : 'icon_period c_pointer'"
                 @click="setBase(period)"></div>
            <div class="calendar-period__period"
                 @click="setBase(period)">
              {{periods_formatted_strings[index]}}
            </div>
            <div class="detalization-close"
                 @click="dropPeriod(index)"></div>
          </div>
        </div>

        <month-list :focus="focus"
                    :options="calendar_options"></month-list>
      </div>
    </div>
    <div class="dp-footer"
         v-show="!c_options.instant || c_options.limit !== 0">
      <div class="button button_common"
           @click="addPeriod"
           :class="{'disabled': !can_add_period}"
           v-if="c_options.limit !== 0">
        Добавить сравнение
      </div>
      <div class="button button_apply button_common"
           @click="accept"
           v-if="!c_options.instant"
           :class="{'disabled': !periods_changed}">
        Применить
      </div>
    </div>
  </div>
</template>

<script>
import DF from '@/common/date-functions';
import Calendar from './calendar.vue';
import MonthList from './month-list.vue';
import DateInput from "@/components/date-picker/date-input";


export default {
  components: {DateInput, Calendar, MonthList},
  name: 'DatePicker',
  props: ['periods', 'options'],
  data() {
    return {
      c_periods: [
        {
          date1: DF.getCurrentDay(-10),
          date2: DF.getCurrentDay(-5),
          main: true,
        },
      ],
      initial_periods: [
        {
          date1: DF.getCurrentDay(-10),
          date2: DF.getCurrentDay(-5),
          main: true,
        },
      ],
      last_was_latter: true,
      focus: null,
    };
  },
  created() {
    if (this.periods) {
      this.c_periods = this.periods.map((p, i) => {
        let temp = this.getFormattedPeriod([DF.getDateObj(p[0]), DF.getDateObj(p[1])]);
        temp.main = i === 0;
        return temp;
      });

      this.initial_periods = this.c_periods.map(e => {
        return {
          ...e,
        };
      });
    }
  },
  mounted() {
  },
  computed: {
    current_period() {
      return this.c_periods.find(period => period.main);
    },
    input_periods() {
      return [this.current_period.date1, this.current_period.date2];
    },
    c_options() {
      return Object.assign(
        {},
        {
          min: null,
          max: DF.getCurrentDay(0),
          limit: 5,
          presets: true,
          weekdays: 'common',
          single_date: false,
          instant: false,
        },
        this.options || {}
      );
    },
    periods_changed() {
      return (
        this.c_periods.length !== this.initial_periods.length ||
        !DF.equal(this.c_periods.find(p => p.main), this.initial_periods.find(p => p.main)) ||
        this.c_periods.some(c_period => {
          return this.initial_periods.every((period, index) => {
            return !DF.equal(period, c_period);
          });
        })
      );
    },
    periods_formatted_strings() {
      return this.c_periods.map(period => {
        return DF.getDateString(period).join(' - ');
      });
    },
    can_add_period() {
      return (
        (!this.limit || this.c_periods < this.limit) &&
        this.c_periods.filter(period => DF.equal(period, this.current_period)).length <= 1
      );
    },
    chosenPreset() {
      return this.predefined.findIndex(period => !DF.equal(period, this.current_period));
    },
    calendar_style() {
      return (
        (this.c_periods.length > 1 ? 'padding-bottom: ' + this.c_periods.length * 38 + 'px;' : '') + 'flex-grow: 1'
      );
    },
    calendar_options() {
      return this.c_options;
    },
    predefined() {
      let res = [],
        date,
        lastDate,
        thisdate,
        temp;

      lastDate = DF.getCurrentDay(-1);
      thisdate = DF.getCurrentDay();
      temp = {
        name: 'Вчера',
        date1: lastDate,
        date2: lastDate,
      };
      res.push(temp);

      date = DF.getMondayDay(thisdate);
      res.push({
        name: 'Эта неделя',
        date1: date,
        date2: DF.getShiftedDay(date, 6),
      });
      if (DF.getCurrentDay().getDay() === 1) {
        res[res.length - 1].prop = 'unavailable';
      }

      res.push({
        name: 'Прошлая неделя',
        date1: DF.getShiftedDay(date, -7),
        date2: DF.getShiftedDay(date, -1),
      });

      res.push({
        name: 'Этот месяц',
        date1: DF.getMonthFirstDay(thisdate),
        date2: DF.getShiftedDay(DF.getMonthFirstDay(DF.getShiftedMonth(thisdate, 1)), -1),
      });
      if (DF.getCurrentDay().getDate() === 1) {
        res[res.length - 1].prop = 'unavailable';
      }

      res.push({
        name: 'Прошлый месяц',
        date1: DF.getMonthFirstDay(thisdate, -1),
        date2: DF.getMonthLastDay(thisdate, -1),
      });

      res.push({
        name: 'Квартал',
        date1: DF.getMonthFirstDay(thisdate, Math.floor(thisdate.getMonth()/3)*3 - thisdate.getMonth()),
        date2: DF.getMonthLastDay(thisdate, 0),
      });

      let checkResInBorders = res => {
        if (this.c_options.min) {
          res.forEach(e => {
            if (e.date2 < this.c_options.min) {
              e.prop = 'unavailable';
            } else if (e.date1 < this.c_options.min) {
              e.date1 = new Date(this.c_options.min);
            }
          });
        }

        if (this.c_options.max) {
          res.forEach(e => {
            if (e.date1 > this.c_options.max) {
              e.prop = 'unavailable';
            } else if (e.date2 > this.c_options.max) {
              e.date2 = new Date(this.c_options.max);
            }
          });
        }
      };

      checkResInBorders(res);

      return res;
    },
  },
  methods: {
    getFormattedPeriod(period) {
      return {
        date1: period[0] || period.date1,
        date2: period[1] || period.date2,
        main: false,
      };
    },
    setBase(period) {
      this.c_periods.forEach(p => (p.main = false));
      period.main = true;
      if (this.c_options.instant) {
        this.accept();
      }
    },
    dropPeriod(index) {
      if (this.c_periods[index].main) {
        this.c_periods.splice(index, 1);
        this.c_periods[0].main = true;
      } else {
        this.c_periods.splice(index, 1);
      }
      if (this.c_options.instant) {
        this.accept();
      }
    },
    accept() {
      if (this.periods_changed) {
        if (this.c_periods.length > 1) {
          this.$emit('accept', this.c_periods.sort((a, b) => (a.main ? -1 : 1)));
        } else {
          this.$emit('accept', [this.current_period]);
        }
      }
    },
    selectDate(date) {
      if (this.c_options.single_date) {
        this.current_period.date1 = DF.copy(date);
        this.current_period.date2 = DF.copy(date);
      } else if (date.date1 && date.date2) {
        this.last_was_latter = true;
        this.current_period.date1 = DF.copy(date.date1);
        this.current_period.date2 = DF.copy(date.date2);
      } else {
        const set1 = date => {
          this.current_period.date1 = DF.copy(date);
          this.last_was_latter = false;
        };
        const set2 = date => {
          this.current_period.date2 = DF.copy(date);
          this.last_was_latter = true;
        };

        if (DF.equal(this.current_period.date1, this.current_period.date2)) {
          if (date < this.current_period.date1) {
            set1(date);
          } else if (date > this.current_period.date2) {
            set2(date);
          }
        } else {
          if (date >= this.current_period.date1 && date <= this.current_period.date2) {
            if (this.last_was_latter) {
              set1(date);
            } else {
              set2(date);
            }
          } else {
            this.current_period.date1 = DF.copy(date);
            this.current_period.date2 = DF.copy(date);
          }
        }
      }

      this.c_periods = this.c_periods.slice(0);
      if (this.c_options.instant) {
        this.accept();
      }
    },
    handleCalendarFocus(event) {
      this.focus = event;
    },
    inputDate(date_index, value) {
      const key = 'date' + (date_index + 1);
      const other_key = 'date' + (Math.abs(date_index - 2));

      console.log(value);
      if (value > this.c_options.max || value < this.c_options.min) {
        return false;
      }
      if (date_index === 0) {
        if (value > this.current_period[other_key]) {
          return false;
        }
      } else if (date_index === 1) {
        if (value < this.current_period[other_key]) {
          return false;
        }
      }

      this.current_period[key] = value;
      this.last_was_latter = true;

      if (this.c_options.instant) {
        this.accept();
      }
    },
    selectPreset(preset) {
      if (preset.prop !== 'unavailable') {
        this.current_period.date1 = preset.date1;
        this.current_period.date2 = preset.date2;
        this.last_was_latter = true;

        if (this.c_options.instant) {
          this.accept();
        }
      }
    },
    addPeriod() {
      if (this.can_add_period) {
        this.c_periods.push(this.getFormattedPeriod(this.current_period));
        if (this.c_options.instant) {
          this.accept();
        }
      }
    },
  },
};
</script>

<style scoped
       lang="scss">
@import '~styles/constants.scss';

.date-picker-container {
  display: flex;
  flex-direction: column;
  width: 300px;
}

.dp-header {
  display: flex;
  flex-wrap: wrap;
  padding: 3px 10px 3px 5px;
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;
}

.dp-header > div {
  flex-grow: 1;
}

.dp-body {
  position: relative;
  overflow: hidden;
  height: 100%;
}

.dp-body__content {
  display: flex;
  max-height: 100%;
}

.dp-body__content_left {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.dp-footer {
  padding: 5px 0;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid $border-color;
  flex-shrink: 0;
}

.dp-body__periods {
  display: flex;
  position: absolute;
  bottom: 0;
  flex-direction: column;
}

.calendar-period {
  border: solid $border-color;
  border-width: 1px 1px 0 0;
  padding: 0 11px 0 22px;
  display: flex;
  align-items: center;
  height: 38px;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  width: 219px;
  background: #fff;
}

.calendar-period:last-child {
  border-bottom: none;
}

.calendar-period > div {
  flex-shrink: 0;
}

.calendar-period > .detalization-close {
  right: 0;
  top: 0;
  height: 37px;
  width: 30px;
  background-size: 8px;
}

.calendar-period > .detalization-close:hover {
  filter: brightness(50%);
}

.calendar-period__period {
  flex-grow: 1;
  width: 100%;
  margin: 8px;
  font-size: 12px;
}

.dp-inputs {
  display: flex;
  justify-content: space-around;
  padding: 5px;
  & > input {
    width: 100px;
  }
}
</style>
