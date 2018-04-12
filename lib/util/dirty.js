const elasticsearch         = require('elasticsearch');
const moment                = require('moment');
const winston               = require('winston');

const ElasticTools = require('./elastic-tools');


    // This should be based on a config really...
  const logger = winston.createLogger({
      level: 'debug',
      format: winston.format.simple(),
      transports: [
          new winston.transports.Console()
      ]
  })

var client = new elasticsearch.Client({
  host: 'http://localhost:9200',
  apiVersion: '5.6'
});            


async function testCreate() {
  const now = moment();
  const timestamp = now.format("YYYYMMDD_HHmmss");
  const indexName = 'bryantestidx' + timestamp;

  let mapping = require('../../es-mappings/mappings.json');
  let settings = require('../../es-mappings/settings.json');

  const estools = new ElasticTools(logger, client);

  try {
    await estools.createIndex(indexName, mapping, settings);
  } catch (err) {
    console.log();
  }
}

async function main() {
  await testCreate();
}

main();
