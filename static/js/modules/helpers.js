'use strict';

/* global require, module, Intl */

var _ = require('underscore');
var moment = require('moment');
var Handlebars = require('hbsfy/runtime');

var intl = require('intl');
var locale = require('intl/locale-data/json/en-US.json');
intl.__addLocaleData(locale);

function currency(value) {
  if (!isNaN(parseInt(value))) {
    return '$' + Intl.NumberFormat(undefined, {minimumFractionDigits: 2}).format(value);
  } else {
    return null;
  }
}
Handlebars.registerHelper('currency', currency);

function datetime(value) {
  var parsed = moment(value, 'YYYY-MM-DDTHH:mm:ss');
  return parsed.isValid() ? parsed.format('MM-DD-YYYY') : null;
}
Handlebars.registerHelper('datetime', datetime);

function cycleDates(year) {
  return {
    min: '01-01-' + (year - 1),
    max: '12-31-' + year
  };
}

function filterNull(params) {
  return _.chain(params)
    .pairs()
    .filter(function(pair) {
      return pair[1] !== '';
    })
    .object()
    .value();
}

module.exports = {
  currency: currency,
  datetime: datetime,
  cycleDates: cycleDates,
  filterNull: filterNull
};
