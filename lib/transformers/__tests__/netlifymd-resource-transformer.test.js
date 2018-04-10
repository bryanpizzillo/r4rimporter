const winston               = require('winston');
const path                  = require('path');

const NetlifyMdResourceTransformer    = require('../netlifymd-resource-transformer');
const WinstonNullTransport  = require('../../../test/winston-null-transport');

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [
        new WinstonNullTransport()
    ]
})

describe('NetlifyMdResourceTransformer', async() => {
    describe('GetInstance', async() => {

    })

    describe('ValidateConfig', async() => {

    })

    describe('begin', async() => {

    })

    describe('end', async() => {

    })

    describe('transform', async() => {

    })
})

