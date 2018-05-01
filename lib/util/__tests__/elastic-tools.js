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

describe('ElasticTools', async() => {

    describe('createIndex', async () => {

        it('creates the index', async () => { 

            const now = moment();
            const timestamp = now.format("YYYYMMDD_HHmmss");
            const indexName = 'bryantestidx' + timestamp;
          
            const mappings = require(path.join(__dirname, '../../../es-mappings/mappings.json'));
            const settings = require(path.join(__dirname, '../../../es-mappings/settings.json'));

            const scope = nock('http://example.org:9200')
                .put(`/${indexName}`, {
                    settings: settings.settings,
                    mappings: mappings.mappings
                })
                .reply(200, {"acknowledged":true,"shards_acknowledged":true,"index":indexName} );
          
            const client = new elasticsearch.Client({
                host: 'http://example.org:9200',
                apiVersion: '5.6'
            });            
          
            const estools = new ElasticTools(logger, client);
          
            await estools.createIndex(indexName, mappings, settings);
        })

        it('handles index already exists', async() => {
            const now = moment();
            const timestamp = now.format("YYYYMMDD_HHmmss");
            const indexName = 'bryantestidx' + timestamp;
          
            const mappings = require(path.join(__dirname, '../../../es-mappings/mappings.json'));
            const settings = require(path.join(__dirname, '../../../es-mappings/settings.json'));

            const scope = nock('http://example.org:9200')
                .put(`/${indexName}`, {
                    settings: settings.settings,
                    mappings: mappings.mappings
                })
                .reply(400, 
                    {
                        "error": {
                        "root_cause": [
                        {
                        "type": "index_already_exists_exception",
                        "reason": `index [${indexName}/EE0VmcmPT-q9MatbvD6vAw] already exists`,
                        "index_uuid": "EE0VmcmPT-q9MatbvD6vAw",
                        "index": indexName
                        }
                        ],
                        "type": "index_already_exists_exception",
                        "reason": `index [${indexName}/EE0VmcmPT-q9MatbvD6vAw] already exists`,
                        "index_uuid": "EE0VmcmPT-q9MatbvD6vAw",
                        "index": indexName
                        },
                        "status": 400
                    }
                );
          
            const client = new elasticsearch.Client({
                host: 'http://example.org:9200',
                apiVersion: '5.6'
            });            
                      
            const estools = new ElasticTools(logger, client);
          
            //TODO: Actually check and see if we get an logged error when the
            //exception occurs.
            try {
                await estools.createIndex(indexName, mappings, settings);
            } catch (err) {
                expect(err).not.toBeNull();
            }            
        })
    })
})