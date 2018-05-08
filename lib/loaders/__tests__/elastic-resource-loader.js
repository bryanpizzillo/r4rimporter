const elasticsearch         = require('elasticsearch');
const moment                = require('moment');
const nock                  = require('nock');
const path                  = require('path');
const winston               = require('winston');

const ElasticTools = require('../elastic-tools');
const WinstonNullTransport  = require('../../../test/winston-null-transport');

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [
        new WinstonNullTransport()
    ]
});

const VALID_CONFIG = {

};

describe('ElasticResourceLoader', async() => {
    describe('constructor', async() => {


    })

    describe('begin', async() => {


    })

    describe('abort', async() => {


    })

    describe('end', async() => {


    })

    describe('ValidateConfig', async() => {
        it('validates config', async() => {

        });


    })

    describe('GetInstance', async() => {
        it('returns instance', async() => {

        });

    })

})