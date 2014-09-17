# easy-json-stream

Stream objects to JSON and JSON into objects.

`npm i easy-json-stream [--save]`

## Motivation

JSON and object stream may arrive to our application in a variety of ways, for example:

* line-separated JSON objects from a database
* a stream of JSON data POST'ed to update a record

To keep the "pipes clean" this module allows for a simple way to process these JSON and/or object streams.

### Caveat emptor

There are likely modules that do this exact thing, or probably even better.

For instance, `EasyJSONStream#parse` buffers the **entire** stream prior to push the parsed data. With big JSON payloads this most certainly is not desirable.

## Usage

_EasyJSONStream#stringify_ concats objects together into valid JSON. This method expects real JavaScript objects and does not do any parsing of the input.

Options:

* `head`: determines the "start" of the response
* `tail`: determines the "end" of the response
* `sep` [default: `','`]: determines the separator for each chunk

Notice that multiple chunks are automatically separated by commas `,` -- and that you are free to determine the `head` and `tail` options. This may be useful if you're concat'ing many JSON strings in a response.

```js
var easyJSONStream = require('easy-json-stream');

STREAM_OF_DATABASE_ROWS // { one: 1 }{ two: 2 }{ three: 3 }
  .pipe(easyJSONStream.stringify({ head: '[', tail: ']' }))
  .pipe(process.stdout) // => [{ "one": 1 }, { "two": 2 }, { "three": 3 }]
;
```
_EasyJSONStream#parse_ parses JSON strings into usable JavaScript objects. If the string is not parseable and `error` event is emitted.

Only one `data` event will be emitted once all JSON is buffered and parse.

```js
var easyJSONStream = require('easy-json-stream');

STREAM_OF_TEXT // "[{ \"one\": 1 }, {\"two\": 2 }]"
  .pipe(easyJSONStream.parse())
  .on('data', console.log) // [{ one: 1 }, { two: 2 }]
```