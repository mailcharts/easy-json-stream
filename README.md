# easy-json-stream

Stream objects to JSON and JSON into objects.

`npm i easy-json-stream [--save]`

## Motivation

JSON and object streams arrive to applications in a variety of ways, for example:

* line-separated JSON objects from a database
* a stream of JSON data POST'ed to update a record

To keep the "pipes clean" this module allows for a simple way to process these JSON and/or object streams.

Primarily, this module aims to reduce surface area when writing proper JSON from a number of objects, i.e. separating with commas and wrapping in `[]` as arrays, etc.

### Caveat emptor

There are likely modules that do this exact thing, or probably even better.

For instance, `EasyJSONStream#parse` buffers the **entire** stream prior to pushing the parsed JavaScript object. With big JSON payloads this most certainly is not desirable.

## Usage

### EasyJSONStream#stringify

Concat objects together into valid JSON. This method expects real JavaScript objects and does not do any parsing of the input.

Options:

* `head`: determines the "start" of the response
* `tail`: determines the "end" of the response
* `sep` [default: `','`]: determines the separator for each chunk

Notice that multiple chunks are automatically separated by commas. The `head` and `tail` are determnined by passing options; there are no defaults for these options.

```js
var easyJSONStream = require('easy-json-stream');

STREAM_OF_DATABASE_ROWS // { one: 1 }{ two: 2 }{ three: 3 }
  .pipe(easyJSONStream.stringify({ head: '[', tail: ']' }))
  .pipe(process.stdout) // => [{ "one": 1 }, { "two": 2 }, { "three": 3 }]
;
```
### EasyJSONStream#parse

Parse a stream of JSON into usable JavaScript objects. If the string is not parseable, an `error` event is emitted.

Only one `data` event will be emitted once all JSON is buffered and parsed.

```js
var easyJSONStream = require('easy-json-stream');

STREAM_OF_TEXT // "[{ \"one\": 1 }, {\"two\": 2 }]"
  .pipe(easyJSONStream.parse())
  .on('data', console.log) // [{ one: 1 }, { two: 2 }]
```