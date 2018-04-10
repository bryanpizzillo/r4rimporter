const Transport = require('winston-transport');
const util = require('util');

module.exports = class WinstonNullTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    //NOOP
    //setImmediate(function () {
    //  this.emit('logged', info);
    //});

    // Perform the writing to the remote service
    callback();
  }
}