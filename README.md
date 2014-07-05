# spotify-crawler [![Build Status](https://api.shippable.com/projects/53b799ea071bb004014fb533/badge/master)](https://www.shippable.com/projects/53b799ea071bb004014fb533)
> Returns pricing data for all available Spotify countries

[![NPM version](https://badge.fury.io/js/spotify-crawler.svg)](https://www.npmjs.org/package/spotify-crawler)

Crawls the [list](https://www.spotify.com/select-your-country/) of countries where Spotify is available. 
Fetches the listed premium price for each country and finally converts the price into USD.

Thanks to [restcoutries.eu](http://restcountries.eu/) and [Open Exchange Rates](https://openexchangerates.org/).

## Installation

```shell
$ npm install spotify-crawler
```

## Usage

**Methods:**
- `fetch` - returns `array` with all the countries.
- `getCatalogSize` - takes the two-letter country code, returns `number` of total tracks.

##### Example:
```js
var spotify = require('spotify-crawler');

spotify.fetch()
  .then(saveCountries)
  .catch(console.log);

function saveCountries(countries){
  console.log('Inserting {0} countries in DB'.format(countries.length));

  var save = Country.create(countries);
}
```


##### Output
The `country` object consists of:
- `link` - Spotify href
- `title` - the country title, localized version(*Österreich*)
- `originalRel` - the rel directly from Spotify
- `rel` - stripped the `originalRel` of the language(*be-fr*)
- `currency` - the currency code from [restcoutries.eu](http://restcountries.eu/), but corrected for the countries that doesn't display price in their own currency on the website.
- `originalCurrency` - the raw currency code from [restcoutries.eu](http://restcountries.eu/).
- `countryCode` - the [`alpha3Code`](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) from [restcoutries.eu](http://restcountries.eu/).
- `internationalName` - the international name from  [restcoutries.eu](http://restcountries.eu/).
- `region` - the region from [restcoutries.eu](http://restcountries.eu/).
- `subRegion` - the subregion from [restcoutries.eu](http://restcountries.eu/).
- `demonym` - the demonym from [restcoutries.eu](http://restcountries.eu/).
- `originalPrice` - the whole text from the HTML element
- `price` - strip all text from `originalPrice`
- `convertedPrice` - local price converted into USD with rate from [Open Exchange Rates](https://openexchangerates.org/)
- `catalogSize` - amount of tracks available in the country

#### Output data example for a single country:
```json
{
    "link": "/au/",
    "title": "Australia",
    "originalRel": "au",
    "rel": "au",
    "currency": "AUD",
    "originalCurrency": "AUD",
    "countryCode": "AUS",
    "internationalName": "Australia",
    "region": "Oceania",
    "subRegion": "Australia and New Zealand",
    "demonym": "Australian",
    "originalPrice": "$11.99 per month",
    "price": "11.99",
    "convertedPrice": 11.25280616267109,
    "catalogSize": 30695608
}
```

## todo
- Multiple methods
    - *getCountries*
    - *getRawPrices*
    - *etc.*
- Split up index.js into modules
- Tests
- CLI support
- Supply own `app_id` for [Open Exchange Rates](https://openexchangerates.org/)