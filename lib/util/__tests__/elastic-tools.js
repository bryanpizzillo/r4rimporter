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

beforeAll(() => {
    nock.disableNetConnect();
})

//After each test, cleanup any remaining mocks
afterEach(() => {
    nock.cleanAll();
});

afterAll(() => {
    nock.enableNetConnect();
})

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

            expect(scope.isDone()).toBeTruthy();
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
            
            expect(scope.isDone()).toBeTruthy();
        })
    })

    describe('optimizeIndex', async () => {
        it("optimizes the index", async() => {
            const indexName = 'bryantestidx';
          
            const scope = nock('http://example.org:9200')
                .post(`/${indexName}/_forcemerge?max_num_segments=1`, body => true)
                .reply(200, {"_shards":{"total":2,"successful":1,"failed":0}});
          
            const client = new elasticsearch.Client({
                host: 'http://example.org:9200',
                apiVersion: '5.6'
            });            
          
            const estools = new ElasticTools(logger, client);
          
            await estools.optimizeIndex(indexName);
            
            expect(scope.isDone()).toBeTruthy();
        })

        it("handles a 504 response", async () => {

        });

        it("logs an error on server error", async () => {

        });

        /*
        it("optimizes the index with delay", async() => {
            const indexName = 'bryantestidx';
          
            const scope = nock('http://example.org:9200')
                .post(`/${indexName}/_forcemerge?max_num_segments=1`, body => true)
                .delay({
                    head: 89000
                })
                .reply(200, {"_shards":{"total":2,"successful":1,"failed":0}});
                
          
            const client = new elasticsearch.Client({
                host: 'http://example.org:9200',
                apiVersion: '5.6'
            });            
          
            const estools = new ElasticTools(logger, client);
          
            await estools.optimizeIndex(indexName);
            
            expect(scope.isDone()).toBeTruthy();
        }, 100000)

        it("optimizes the index with delay", async() => {
            const indexName = 'bryantestidx';
          
            const scope = nock('http://example.org:9200')
                .post(`/${indexName}/_forcemerge?max_num_segments=1`, body => true)
                .delay({
                    head: 95000
                })
                .reply(200, {"_shards":{"total":2,"successful":1,"failed":0}});
                
          
            const client = new elasticsearch.Client({
                host: 'http://example.org:9200',
                apiVersion: '5.6'
            });            
          
            const estools = new ElasticTools(logger, client);
          
            try {
                await estools.optimizeIndex(indexName);
            } catch (err) {
                expect(err).not.toBeNull();
            }
            
            expect(scope.isDone()).toBeTruthy();
        }, 110000)
        */
    })

    describe('setAliasToSingleIndex', async () => {

    });

    describe('getIndicesOlderThan', async () => {
        it('returns 1 when 1 is old', async() => {
            const indexName = 'bryantestidx';
            
            const scope = nock('http://example.org:9200')
                .get(`/${indexName}*/_settings/index.creation_date`)
                .reply(200, {
                    "bryantestidx_1":{ "settings": {"index": {"creation_date":"1523901276157"}}}
                });
            
            const client = new elasticsearch.Client({
                host: 'http://example.org:9200',
                apiVersion: '5.6'
            });            
            
            const estools = new ElasticTools(logger, client);
            
            const expected = ["bryantestidx_1"];
            const indices = await estools.getIndicesOlderThan(indexName, 1525225677000);
            
            expect(indices).toEqual(expected);
        });

        it('returns 0 when 1 not old', async() => {
            const indexName = 'bryantestidx';
            
            const scope = nock('http://example.org:9200')
                .get(`/${indexName}*/_settings/index.creation_date`)
                .reply(200, {
                    "bryantestidx_1":{ "settings": {"index": {"creation_date":"1525225677001"}}}
                });
            
            const client = new elasticsearch.Client({
                host: 'http://example.org:9200',
                apiVersion: '5.6'
            });            
            
            const estools = new ElasticTools(logger, client);
            
            const expected = [];
            const indices = await estools.getIndicesOlderThan(indexName, 1525225677000);
            
            expect(indices).toEqual(expected);
        });

        it('returns 2 in order when 2 of 3 are old', async() => {
            const indexName = 'bryantestidx';
            
            const scope = nock('http://example.org:9200')
                .get(`/${indexName}*/_settings/index.creation_date`)
                .reply(200, {
                    "bryantestidx_1":{ "settings": {"index": {"creation_date":"1525225677001"}}},
                    "bryantestidx_2":{ "settings": {"index": {"creation_date":"1525225676001"}}},
                    "bryantestidx_3":{ "settings": {"index": {"creation_date":"1525225676002"}}}
                });
            
            const client = new elasticsearch.Client({
                host: 'http://example.org:9200',
                apiVersion: '5.6'
            });            
            
            const estools = new ElasticTools(logger, client);
            
            const expected = ['bryantestidx_3','bryantestidx_2'];
            const indices = await estools.getIndicesOlderThan(indexName, 1525225677000);
            
            expect(indices).toEqual(expected);
        });        

        it('handles server error', async () => {

        });

        it('checks alias name', async () => {

        });
        
    })

    describe('updateAlias', async () => {
        //Gonna use this a lot here, so set it once
        const aliasName = 'bryantestidx';

        it('checks for at least one add or remove', async ()=> {
            
            const client = new elasticsearch.Client({
                host: 'http://example.org:9200',
                apiVersion: '5.6'
            });            
            
            const estools = new ElasticTools(logger, client);
            
            //No params
            try {
                await estools.updateAlias(aliasName);
            } catch(err) {
                expect(err).toMatchObject({
                    message: "You must add or remove at least one index"
                });
            }
            
            //One is not a string or array
            try {
                await estools.updateAlias(aliasName, 1);
            } catch(err) {
                expect(err).toMatchObject({
                    message: "Indices to add must either be a string or an array of items"
                });
            }

            //One is not a string or array
            try {
                await estools.updateAlias(aliasName, [], 1);
            } catch(err) {
                expect(err).toMatchObject({
                    message: "Indices to remove must either be a string or an array of items"
                });
            }

        })

    })

    describe('getIndicesForAlias', async () => {
        
    })

    describe('indexDocument', async () => {

    });

    describe('deleteIndex', async () => {

    });

})