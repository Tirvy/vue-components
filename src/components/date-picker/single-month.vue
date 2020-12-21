<template>
  <div class="month-container"
       v-if="c_options.mode === 'days'">
    <div class="month-holder">
      <div class="title">
        <div class="clickable"
             @click="selectMonth()">{{title}}
        </div>
      </div>
      <div class="horizontal"
           v-if="c_options.weekdays">
        <div class="square clickable"
             v-for="day in weekdays"
             :class="{'holiday': day.holiday, 'working': !day.holiday}">{{day.name}}
        </div>
      </div>
      <div v-if="refresher"></div>
      <div class="horizontal"
           v-for="week in dates">
        <div class="square clickable"
             v-for="(day, index) in week"
             :class="{[day.prop]: true, 'holiday': holidays[index], 'c_pointer': day.selectable}"
             @click="day.selectable === true && selectDate(day.number)">
          <div>
            {{day.number}}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="c_options.mode === 'weekdays'"
       class="weekdays">
    <div>
      <div class="horizontal">
        <div class="square clickable"
             v-for="day in weekdays"
             :class="{'holiday': day.holiday, 'working': !day.holiday}">{{day.name}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DF from '@/common/date-functions';

export default {
  components: {},
  name: 'Month',
  props: ['monthDate', 'period', 'selecting', 'options'],
  data() {
    return {
      weekdays: DF.getWeekDays(),
      dates: [],
      refresher: false,
      holidays: [false, false, false, false, false, true, true],
    };
  },
  computed: {
    title() {
      if (!this.monthDate) {
        return '';
      }
      return DF.getMonthsNames()[this.monthDate.getMonth()] + ' ' + this.monthDate.getFullYear();
    },
    c_options() {
      return Object.assign(
        {},
        {
          min: null,
          max: DF.getCurrentDay(),
          weekdays: false,
          mode: 'days',
        },
        this.options || {}
      );
    },
  },
  methods: {
    selectDate(event) {
      this.$emit('select', new Date(this.monthDate.getFullYear(), this.monthDate.getMonth(), event));
    },
    selectMonth() {
      if (this.dates[0][0].prop !== 'today') {
        let date1 = DF.getMonthFirstDay(this.monthDate),
          date2;
        if (DF.getCurrentDay().getTime() > DF.getMonthLastDay(this.monthDate)) {
          date2 = DF.getMonthLastDay(this.monthDate);
        } else {
          date2 = DF.getCurrentDay(-1);
        }
        this.$emit('select', {date1, date2});
      }
    },
    setProps() {
      let dateBorders = [this.period.date1, this.period.date2],
        mdates = DF.getMonthDays(this.monthDate),
        today_date;

      if (DF.getMonthsDifference(new Date(), this.monthDate) === 0) {
        today_date = DF.getCurrentDay().getDate();
      }

      this.dates.forEach(week => {
        week.forEach((day, index) => {
          if (!day.number) return;

          day.prop = '';
          let thisDate = new Date(this.monthDate.getFullYear(), this.monthDate.getMonth(), day.number);
          if (thisDate >= dateBorders[0] && thisDate <= dateBorders[1]) {
            day.prop = 'selected';
            if (thisDate.getTime() === dateBorders[0].getTime() || index === 0 || day.number === 1) {
              day.prop = day.prop + ' start';
            }
            if (thisDate.getTime() === dateBorders[1].getTime() || index === 6 || day.number === mdates) {
              day.prop = day.prop + ' end';
            }
          } else if (
            (thisDate < dateBorders[0] && this.selecting) ||
            (this.c_options.max && thisDate > this.c_options.max) ||
            (this.c_options.min && thisDate < this.c_options.min)
          ) {
            day.prop = 'disabled';
          } else {
            day.prop = '';
          }

          day.selectable = !!(day.prop !== 'disabled' && day.number);

          if (day.number === today_date) {
            day.prop = day.prop + ' today';
          }
        });
      });
    },
  },
  watch: {
    period(n) {
      this.setProps();
      this.refresher = !this.refresher;
    },
    selecting(n) {
      this.setProps();
      this.refresher = !this.refresher;
    },
  },
  created() {
    if (!this.monthDate) {
      return;
    }
    let fdate = DF.getMonthFirstDay(this.monthDate),
      ldate = DF.getMonthLastDay(this.monthDate),
      cweek = 0,
      cday,
      mdates = ldate.getDate();

    this.dates.push([]);
    for (cday = 0; cday < (fdate.getDay() + 6) % 7; ++cday) {
      this.dates[cweek].push({});
    }
    for (let i = 0; i < mdates; ++i) {
      this.dates[cweek].push({number: i + 1});

      if (this.dates[cweek].length === 7) {
        this.dates.push([]);
        cweek++;
      }
    }
    for (cday = ldate.getDay(); (cday + 6) % 7 !== 6; ++cday) {
      this.dates[cweek].push({});
    }
    this.setProps();
  },
};
</script>

<style scoped
       lang="scss">
@import '~styles/constants.scss';

.title {
  position: absolute;
  top: -9px;
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

.month-holder {
  border-top: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 0 0 0;
  position: relative;
}

.title > div {
  background: #fff;
  padding: 0 6px;
}

.horizontal {
  display: flex;
  justify-content: space-between;
}

.square {
  height: 27px;
  text-align: center;
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 11px;
}

.square > div {
  border: 1px transparent solid;
  min-height: 22px;
  min-width: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 1px;
}

.square.today {
  border: 1px #4d4d4d solid;
}

.square.today > div {
}

.square.disabled {
  color: #969696;
}

.square.selected {
  background: $blue;
  color: #fff;
}

.square.selected > div {
}

.square.selected.start > div {
}

.square.selected > div {
}

.square.selected.end > div {
}

.square.selected.start.end > div {
}

.holiday {
  color: $red;
}

.working {
  color: #969696;
}
</style>
