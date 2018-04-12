const elasticsearch         = require('elasticsearch');
const moment                = require('moment');

const ElasticTools = require('../elastic-tools');

describe('ElasticTools', async() => {

    describe('createIndex', async () => {

        it('creates the index', async () => { 
            var client = new elasticsearch.Client({
                host: 'http://localhost:9200',
                apiVersion: '5.6'
            });            

            const now = moment();
            const timestamp = now.format("YYYYMMDD_HHmmss");
            const indexName = 'bryantestidx' + timestamp;

            let mapping = require('../../../es-mappings/mappings.json');
            let settings = require('../../../es-mappings/settings.json');

            const estools = new ElasticTools({}, client);

            await estools.createIndex(indexName, mapping, settings);

            //A good response looks like
        /*
            RESPONSE:
            { acknowledged: true,
            shards_acknowledged: true,
            index: 'bryantestidx20180411_213157' }
        */
        })
    })
})