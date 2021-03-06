var Transform = require('stream').Transform
  , util = require('util')
;

util.inherits(StringifyStream, Transform);
function StringifyStream(options) {
  options = options || {};
  Transform.call(this, { objectMode: true });
  this.head = options.head;
  this.tail = options.tail;
  this.sep = options.sep || ',';
  this.first = true;
}
StringifyStream.prototype._transform = function(chunk, enc, next) {
  if (!this.first) this.push(this.sep);
  else if (this.head) this.push(this.head);
  this.push(JSON.stringify(chunk));
  this.first = false;
  next();
};

StringifyStream.prototype._flush = function(done) {
  if (this.first)
    this.push(this.head);
  this.push(this.tail);
  done();
}

util.inherits(CSVStream, Transform);
var escapeCommasAndSingleQuotes = function(value) {
  if (Array.isArray(value))
    value = value[0];
  if (Object.prototype.toString.call(value) === '[object Object]')
    value = JSON.stringify(value);
  if (!/\,/.test(value))
    return value;
  return JSON.stringify(value);
};

function CSVStream(options) {
  Transform.call(this, { objectMode: true });
  this.count = 0;
}
CSVStream.prototype._transform = function(chunk, enc, next) {
  var chunks = [];
  if (++this.count < 2)
    chunks.push(Object.keys(chunk).join(',') + '\n');
  chunks.push(Object.keys(chunk).map(function(key) { return chunk[key] }).map(escapeCommasAndSingleQuotes).join(',') + '\n');
  chunks.forEach(this.push.bind(this));
  next();
}

util.inherits(ParseStream, Transform);
function ParseStream(options) {
  options = options || { objectMode: true };
  Transform.call(this, options);
  this.buffer = new Buffer('');
}
ParseStream.prototype._transform = function(chunk, enc, next) {
  this.buffer = Buffer.concat([this.buffer, chunk]);
  next();
};
ParseStream.prototype._flush = function(done) {
  try {
    var data = JSON.parse(this.buffer.toString()); 
    this.push(data);
  } catch (err) {
    this.emit('error', err);
  } finally {
    done();
  }
};

module.exports = {
  stringify: function stringify(options) {
    return new StringifyStream(options);
  },
  csv: function csv(options) {
    return new CSVStream(options);
  },
  parse: function parse(options) {
    return new ParseStream(options);
  }
}
