'use strict';

var $ = require('cheerio');
var crawler = require('./index');

describe('getCountries()', function(){
  var fetch = crawler.getCountries();

  it('should return array of country items', function(){
    fetch
      .then(function(items){
        assert(items.length);
      });
  });

  describe('each element should contain the correct attrs', function(){
    it('should have href attr', function(){
      fetch
        .then(function(items){
          var element = $(items[0]);

          assert(element.attr('href'));
        });
    });

    it('should have title attr', function(){
      fetch
        .then(function(items){
          var element = $(items[0]);

          assert(element.attr('title'));
        });
    });

    it('should have rel attr', function(){
      fetch
        .then(function(items){
          var element = $(items[0]);

          assert(element.attr('rel'));
        });
    });
  });
});