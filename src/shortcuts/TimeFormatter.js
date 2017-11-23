'use strict';

var TimeFormatter = function (timePattern) {
    var owner = this;

    owner.time = [];
    owner.blocks = [];
    owner.timePattern = timePattern;
    owner.initBlocks();
};

TimeFormatter.prototype = {
    initBlocks: function () {
        var owner = this;
        owner.timePattern.forEach(function (value) {
          owner.blocks.push(2);
        });
    },

    getISOFormatTime: function () {
        var owner = this,
            time = owner.time;

        return time[2] ? (
            time[2] + ':' + owner.addLeadingZero(time[1]) + ':' + owner.addLeadingZero(time[0])
        ) : '';
    },

    getBlocks: function () {
        return this.blocks;
    },

    getValidatedTime: function (value) {
        var owner = this, result = '';

        value = value.replace(/[^\d]/g, '');

        owner.blocks.forEach(function (length, index) {
            if (value.length > 0) {
                var sub = value.slice(0, length),
                    sub0 = sub.slice(0, 1),
                    rest = value.slice(length);

                switch (owner.timePattern[index]) {
                case 'H':
                    if (sub === '00') {
                        sub = '00';
                    } else if (parseInt(sub0, 10) > 2) {
                        sub = '0' + sub0;
                    } else if (parseInt(sub, 10) > 23) {
                        sub = '23';
                    }

                    break;
                case 'S':
                    if (sub === '00') {
                        sub = '00';
                    } else if (parseInt(sub0, 10) > 5) {
                        sub = '0' + sub0;
                    } else if (parseInt(sub, 10) > 59) {
                        sub = '59';
                    }

                    break;
                case 'M':
                    if (sub === '00') {
                        sub = '00';
                    } else if (parseInt(sub0, 10) > 5) {
                        sub = '0' + sub0;
                    } else if (parseInt(sub, 10) > 59) {
                        sub = '59';
                    }

                    break;
                }

                result += sub;

                // update remaining string
                value = rest;
            }
        });

        return this.getFixedTimeString(result);
    },

    getFixedTimeString: function (value) {
        var owner = this, timePattern = owner.timePattern, time = [],
            hourIndex = 0, minuteIndex = 0, secIndex = 0,
            hourStartIndex = 0, minuteStartIndex = 0, secStartIndex = 0,
            hour, minute, sec;

        // hh-mm
        if (value.length === 4) {
            hourStartIndex = timePattern[0] === 'H' ? 0 : 2;
            minuteStartIndex = 2 - hourStartIndex;
            hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);
            minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);

            time = this.getFixedTime(hour, minute, 0);
        }

        // yyyy-mm-dd || yyyy-dd-mm || mm-dd-yyyy || dd-mm-yyyy || dd-yyyy-mm || mm-yyyy-dd
        if (value.length === 6) {
            timePattern.forEach(function (type, index) {
                switch (type) {
                case 'H':
                    hourIndex = index;
                    break;
                case 'M':
                    minuteIndex = index;
                    break;
                default:
                    secIndex = index;
                    break;
                }
            });

            secStartIndex = secIndex * 2;
            hourStartIndex = (hourIndex <= secIndex) ? hourIndex * 2 : (hourIndex * 2 + 2);
            minuteStartIndex = (minuteIndex <= secIndex) ? minuteIndex * 2 : (minuteIndex * 2 + 2);

            hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);
            minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);
            sec = parseInt(value.slice(secStartIndex, secStartIndex + 4), 10);

            time = this.getFixedTime(hour, minute, sec);
        }

        owner.time = time;

        return time.length === 0 ? value : timePattern.reduce(function (previous, current) {
            switch (current) {
            case 'H':
                return previous + owner.addLeadingZero(time[0]);
            case 'M':
                return previous + owner.addLeadingZero(time[1]);
            default:
                return previous + '' + (time[2] || '');
            }
        }, '');
    },

    getFixedTime: function (hour, minute, sec) {
        hour = Math.min(hour, 24);
        minute = Math.min(minute, 60);
        sec = parseInt((sec || 0), 60);

        // if ((month < 7 && month % 2 === 0) || (month > 8 && month % 2 === 1)) {
//             day = Math.min(day, month === 2 ? (this.isLeapYear(year) ? 29 : 28) : 30);
//         }

        return [hour, minute, sec];
    },

    // isLeapYear: function (year) {
 //        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
 //    },

    addLeadingZero: function (number) {
        return (number < 10 ? '0' : '') + number;
    }
};

module.exports = TimeFormatter;

