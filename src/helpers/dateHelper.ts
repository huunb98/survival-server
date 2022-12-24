import moment = require('moment-timezone');

class DateHelper {
  NextMonday() {
    let m = moment().tz('UTC');
    m.subtract(1, 'day');
    m.set('weekday', 0);
    m.set('hour', 0);
    m.set('minute', 0);
    m.set('second', 0);
    m.set('millisecond', 0);
    m.add(1, 'week');
    m.add(1, 'day');
    return m.toDate();
  }
}

export const dateHelper = new DateHelper();
