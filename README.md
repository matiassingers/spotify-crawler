# spotify-crawler
> Returns pricing data for all available Spotify countries

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
- `originalPrice` - the whole text from the HTML element
- `price` - strip all text from `originalPrice`
- `convertedPrice` - local price converted into USD with rate from [Open Exchange Rates](https://openexchangerates.org/)

#### Output data example for a single country:
```json
{
    "link": "/uk/",
    "title": "United Kingdom",
    "originalRel": "uk",
    "rel": "gb",
    "currency": "GBP",
    "originalPrice": "£9.99 per month",
    "price": "9.99",
    "convertedPrice": 16.784894602959113
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