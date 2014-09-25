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
  this.push(this.tail);
  done();
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
  parse: function parse(options) {
    return new ParseStream(options);
  }
}