'use strict';

var $ = require('cheerio');
var assert = require('assert');
var crawler = require('./index');

describe('getCountries()', function(){
  this.timeout(0);

  var items;
  before(function(done) {
    crawler.getCountries()
      .then(function(response){
        items = response;

        done();
      });
  });

  it('should return array of country items', function(){
    assert(items.length);
  });

  describe('each element should contain the correct attrs', function(){
    it('should have href attr', function(){
      var element = $(items[0]);

      assert(element.attr('href'));
    });

    it('should have title attr', function(){
      var element = $(items[0]);

      assert(element.attr('title'));
    });

    it('should have rel attr', function(){
      var element = $(items[0]);

      assert(element.attr('rel'));
    });
  });
});