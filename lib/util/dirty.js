const elasticsearch         = require('elasticsearch');
const moment                = require('moment');
const winston               = require('winston');
//Nock is for testing
const nock                  = require('nock');
const path                  = require('path');

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

const ALIAS_NAME = 'bryantestidx'

let totalIndices = 0;
const now = moment();
const timestamp = now.format("YYYYMMDD_HHmmss");

async function testCreate() {
  const indexName = `${ALIAS_NAME}_${timestamp}_${totalIndices}`;
  totalIndices += 1;

  let mapping = require('../../es-mappings/mappings.json');
  let settings = require('../../es-mappings/settings.json');

  const estools = new ElasticTools(logger, client);

  try {
    await estools.createIndex(indexName, mapping, settings);
  } catch (err) {
    console.log(err);
  }
  return indexName;
}

async function testGetAlias() {
  const estools = new ElasticTools(logger, client);

  try {
    return await estools.getIndicesForAlias(ALIAS_NAME);
  } catch (err) {
    console.log(err);
  }

}

async function testOlderThan(dateTime) {
  const estools = new ElasticTools(logger, client);
  
  try {
    return await estools.getIndicesOlderThan(ALIAS_NAME, dateTime);
  } catch (err) {
    console.log(err);
  }
}

async function testOptimize(indexName) {
  const estools = new ElasticTools(logger, client);
  
  try {
    return await estools.optimizeIndex(indexName);
  } catch (err) {
    console.log(err);
  }
}


//async function 
async function addIndicesToAlias(conf) {
  const estools = new ElasticTools(logger, client);

  try {
    await estools.updateAlias(ALIAS_NAME, conf);
  } catch (err) {
    console.log(err);
  }
}

async function setIdxToAlias(indexName) {
  const estools = new ElasticTools(logger, client);

  try {
    await estools.setAliasToSingleIndex(ALIAS_NAME, indexName);
  } catch (err) {
    console.log(err);
  }

}


async function testDelete(indexName) {

  const estools = new ElasticTools(logger, client);

  try {
    await estools.deleteIndex(indexName);
  } catch (err) {
    console.log(err);
  }
}

/*
async function main() {
  logger.debug("Testing get Alias with empty indices")
  const indices = await testGetAlias();
  console.log(indices);

  //Create Indices
  logger.debug("Creating test index")
  const indexName = await testCreate();

  logger.debug("Creating test index 2")
  const index2Name = await testCreate();

  logger.debug("Creating test index 3")
  const index3Name = await testCreate();
  
  //Add 2 indexes to the alias.
  await addIndicesToAlias({
    add: [indexName, index2Name]
  });

  logger.debug("Testing get Alias with multiple indices")
  const newindices = await testGetAlias();
  console.log(newindices);

  logger.debug("Testing optimize")
  await testOptimize(index3Name);

  //Add another indexes to the alias.
  await setIdxToAlias(index3Name);


  logger.debug("Testing get Alias after set")
  const setindices = await testGetAlias();
  console.log(setindices);


  //remove 2 indexes to the alias.
  //await addIndicesToAlias({
  //  remove: [indexName, index2Name]
  //});

  //logger.debug("Testing get Alias after remove multiple indices")
  //const removedindices = await testGetAlias();
  //console.log(removedindices);

  logger.debug("Testing older than now + 1")
  const oldIndices = await testOlderThan(now + 300);
  console.log(oldIndices);

  logger.debug("Testing older than now - 1")
  const oldIndices2 = await testOlderThan(now - 300);
  console.log(oldIndices2);
  */

/*
  logger.debug("Deleting indices")
  await Promise.all(
    [indexName, index2Name, index3Name].map(
      async (name) => {
        await testDelete(name);
      })
  )
*/

//}

async function main() {

}

main();
