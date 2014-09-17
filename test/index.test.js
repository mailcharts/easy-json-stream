var path = require('path')
  , fs = require('fs')
  , stream = require('stream')
  , test = require('tap').test
  , json = require(path.join(process.cwd(), 'index'))
  , DATA_FILE_PATH = path.join(process.cwd(), 'test', 'files', 'data.json')
  , MALFORMED_FILE_PATH = path.join(process.cwd(), 'test', 'files', 'malformed.json')
;

test('fn', function(t) {
  t.ok(json.stringify, 'stringify is a thing');
  t.ok(json.parse, 'parse is a thing');
  t.end();
});

test('parse [success]', function(t) {
  fs.createReadStream(DATA_FILE_PATH)
    .pipe(json.parse())
    .on('data', function(data) {
      t.equals(data.name, 'Tom Buchok', 'properly finds name');
      t.equals(data.birthdayBuddies.length, 2, 'properly finds buddies');
      t.end();
    });
  ;
});

test('parse [error]', function(t) {
  fs.createReadStream(MALFORMED_FILE_PATH)
    .pipe(json.parse())
    .on('error', function(err) {
      t.ok(err, 'it emits error events if json does not parse');
      t.end();
    });
  ;
});

test('stringify [one chunk]', function(t) {
  var data = fs.readFileSync(DATA_FILE_PATH).toString()
    , readable = new stream.Readable({ objectMode: true })
    , buffer = []
  ;
  readable._read = function(){};
  readable.push(JSON.parse(data));
  readable.push(null);
  readable
    .pipe(json.stringify())
    .on('data', buffer.push.bind(buffer))
    .on('end', function() {
      var result = [].concat(buffer).join('');
      t.equals(result, data, 'it properly stringifies object');
      t.end();
    })
  ;
});

test('stringify [seperated chunks]', function(t) {
  var data = [{ one: 1 }, { two: 2 }]
    , readable = new stream.Readable({ objectMode: true })
    , buffer = []
    , SEP = ','
  ;
  readable._read = function(){};
  data.forEach(readable.push.bind(readable));
  readable.push(null);
  readable
    .pipe(json.stringify())
    .on('data', buffer.push.bind(buffer))
    .on('end', function() {
      var result = [].concat(buffer).join('');
      t.equals(result, data.map(JSON.stringify).join(SEP), 'it properly stringifies object');
      t.end();
    })
  ;
});

test('stringify [head, tail]', function(t) {
  var data = [{ one: 1 }, { two: 2 }]
    , readable = new stream.Readable({ objectMode: true })
    , buffer = []
  ;
  readable._read = function(){};
  data.forEach(readable.push.bind(readable));
  readable.push(null);
  readable
    .pipe(json.stringify({ head: '[', tail: ']' }))
    .on('data', buffer.push.bind(buffer))
    .on('end', function() {
      var result = [].concat(buffer).join('');
      t.equals(result, JSON.stringify(data), 'it properly stringifies object');
      t.end();
    })
  ;
});