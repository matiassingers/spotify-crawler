var request = require('promise-request');
var cheerio = require('cheerio');
var money = require('money');
var _ = require('lodash');
var when = require('when');
var async = require('async');
var format = require('string-format');

function fetchEverything(){
  getLatestCurrencyRates();

  return getCountries()
    .then(handleCountries);
}

function getCountries(){
  var countryList = "https://www.spotify.com/select-your-country/";
  return request(countryList)
    .then(function(body){
      $ = cheerio.load(body);

      var items = $('li.country-item a').toArray();
      console.log('{0} country-items'.format(items.length));

      return items;
    });
}

function handleCountries(items){
  return when.promise(function(resolve, reject){
    async.map(items, handleSingleCountry, function(err, results){
      if(err)
        reject(err);

      resolve(results);
    });
  });
}

function handleSingleCountry(elem, callback){
  var country = {
    link: $(elem).attr('href'),
    title: $(elem).attr('title'),
    originalRel: $(elem).attr('rel')
  };

  country.rel = country.originalRel.split('-')[0];

  // Handle UK edge-case for http://restcountries.eu
  if(country.rel === 'uk')
    country.rel = 'gb';

  var catalogSize = getCatalogSize(country.rel);
  var extraCountryData = getCountryData(country.rel);
  var spotifyPrice = getSpotifyPrice(country.link).then(formatSpotifyPrice);

  when.all([extraCountryData, spotifyPrice, catalogSize])
    .then(function(data){
      country = _.extend(country, data[0]);

      var spotify = data[1];
      country.originalPrice = spotify.original;
      country.price = spotify.formatted;

      country.catalogSize = data[2];

      return when.resolve(country);
    })
    .then(convertPriceToUSD)
    .then(function(data){
      callback(null, data);
    })
    .catch(function(error){
      callback(error);
    });
}


function getCountryData(code){
  var url = "http://restcountries.eu/rest/v1/alpha/" + code;

  return request(url, true)
    .then(getCountryCurrencyCode)
    .then(function(data){
      return {
        currency: data.currency,
        originalCurrency: data.originalCurrency,
        countryCode: data.alpha3Code,
        internationalName: data.name,
        region: data.region,
        subRegion: data.subregion,
        demonym: data.demonym
      };
    });
}

function getCountryCurrencyCode(data){
  if(!data.currencies){
    var error = new Error('{0} is missing currency data'.format(code));
    error.res = data;
    throw error;
  }

  var code = data.alpha2Code.toLowerCase();
  var currency;
  // Handle Switzerland
  if(code === "ch")
    currency = "CHF";

  // Handle Chile
  if(code === "cl")
    currency = "CLP";

  // Handle all countries using EUR
  var countriesUsingEUR = ["hu", "is", "cz", "lt", "bg"];
  if(_.contains(countriesUsingEUR, code))
    currency = "EUR";


  // Handle all countries displaying price in USD
  var countriesUsingUSD = ["uy", "py", "cr", "do", "ni", "hn", "sv", "gt", "bo"];
  if(_.contains(countriesUsingUSD, code))
    currency = "USD";

  data.currency = currency || data.currencies[0];
  data.originalCurrency = data.currencies[0];

  return data;
}

function getSpotifyPrice(link){
  var url = "https://www.spotify.com" + link;

  return request(url)
    .then(function(body){
      $ = cheerio.load(body);
      var price = $('#premium-tier .premium-price').text();

      return price;
    });
}

function formatSpotifyPrice(price){
  var formattedPrice = price.match(/([1-9](?:\d*)(?:,\d{2})*(?:\.\d*[1-9])?)/g)[0];
  formattedPrice = formattedPrice.replace(',', '.');

  return {
    original: price,
    formatted: formattedPrice
  };
}

function convertPriceToUSD(country){
  return when.promise(function(resolve, reject){
    if(!country.currency){
      console.log(country);
      reject('Missing currency');
    }
    var converted = money.convert(country.price, {from: country.currency, to: 'USD'});

    if(converted === 'fx error'){
      console.log(country.currency);
      reject('Couldn\'t convert the price for: {0}({1})'.format(country.title, country.currency));
    }

    country.convertedPrice = converted;
    resolve(country);
  });
}

// Get latest currency rates from Open Exchange Rates
function getLatestCurrencyRates(){
  var currencyApi = "http://openexchangerates.org/api/latest.json?app_id=0239e164a3cb415f8fcf72d9a9cc2f2d";
  request(currencyApi, true)
    .then(function(data){

      money.base = data.rates;
      money.rates = data.rates;
    })
    .catch(function(error){
      console.log(error);
    });
}

function getCatalogSize(countryCode){
  if(countryCode.length !== 2)
    throw new Error('countryCode has to be in the two-letter(ISO 3166-1 alpha-2) format');

  countryCode = countryCode.toUpperCase();
  var url = "http://ws.spotify.com/search/1/track.json?q=year:0-3000&country=" + countryCode;

  return request(url, true)
    .then(function(data){
      return data.info.num_results;
    })
    .catch(function(error){
      console.log(error);
    });
}

module.exports = {
  fetch: fetchEverything,
  getCountries: getCountries,
  getCatalogSize: getCatalogSize
};