'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var $ = require('jquery');
var URI = require('urijs');
var _ = require('underscore');

require('../setup')();

var helpers = require('../../../static/js/modules/helpers');
var tables = require('../../../static/js/modules/tables');
var DataTable = tables.DataTable;

describe('data table', function() {
  before(function() {
    this.$fixture = $('<div id="fixtures"></div>');
    $('body').append(this.$fixture);
  });

  beforeEach(function() {
    this.$fixture.empty().append(
      '<table id="table">' +
        '<thead>' +
          '<tr>' +
            '<th>Name</th>' +
            '<th>Office</th>' +
            '<th>Party</th>' +
          '</tr>' +
        '</thead>' +
      '</table>'
    );
    this.deferred = $.Deferred();
    sinon.stub($, 'ajax').returns(this.deferred);
    this.table = new DataTable('table', {
      columns: [
        {data: 'name'},
        {data: 'office'},
        {data: 'party'},
      ]
    });
  });

  afterEach(function() {
    $.ajax.restore();
    this.table.destroy();
  });

  describe('constructor()', function() {
    it('locates dom elements', function() {
      expect(this.table.$body.is('#table')).to.be.true;
    });

    it('adds self to registry', function() {
      expect(DataTable.registry.table).to.equal(this.table);
    });

    it('adds hidden loading widget', function() {
      this.table.ensureWidgets();
      this.deferred.reject();
      var prev = this.table.$body.prev('.is-loading');
      expect(prev.length).to.equal(1);
      expect(prev.is(':visible')).to.be.false;
    });

    it('only adds widgets once', function() {
      this.table.ensureWidgets();
      this.table.ensureWidgets();
      var prev = this.table.$body.prev('.is-loading');
      expect(prev.length).to.equal(1);
    });
  });

  describe('fetches data', function() {
    it('builds URLs', function() {
      _.extend(this.table.opts, {
        path: ['path', 'to', 'endpoint'],
        query: {extra: 'true'}
      });
      this.table.filters = {party: 'DFL'};
      var data = {
        start: 60,
        length: 30,
        order: [{column: 1, dir: 'desc'}]
      };
      var url = this.table.buildUrl(data);
      var expected = helpers.buildUrl(
        ['path', 'to', 'endpoint'],
        {party: 'DFL', sort: '-office', sort_hide_null: 'true', per_page: 30, page: 3, extra: 'true'}
      );
      expect(URI(url).equals(expected)).to.be.true;
    });

    it('renders data', function() {
      this.table.xhr = null;
      var callback = sinon.stub();
      var resp = {
        results: [
          {name: 'Jed Bartlet', office: 'President', party: 'DEM'},
        ],
        pagination: {count: 42}
      };
      this.table.fetch({}, callback);
      this.deferred.resolve(resp);
      expect(callback).to.have.been.calledWith(tables.mapResponse(resp));
    });

    it('hides table on empty results', function() {
      this.table.xhr = null;
      this.table.opts.hideEmpty = true;
      var callback = sinon.stub();
      var resp = {
        results: [],
        pagination: {count: 0}
      };
      this.table.fetch({}, callback);
      this.deferred.resolve(resp);
      expect(
        $.fn.DataTable.isDataTable(this.table.api.table().node())
      ).to.be.false;
    });
  });
});