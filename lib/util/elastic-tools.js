
/**
 * This class defines a wrapper around the elasticsearch framework.
 */
class ElasticTools {

    /**
     * Creates a new instance of the ElasticTools
     * @param {Object} logger The logger to use for logging
     * @param {Object} elasticClient The elasticsearch client to use.
     */
    constructor(logger, elasticClient) {
        this.logger = logger;
        this.client = elasticClient;
    }

    /**
     * Creates a new index with the name, mapping and settings
     * @param {string} indexName the name of the index
     * @param {Object} mapping the index mapping (fields, types, etc)
     * @param {Object} settings the index settings (shards, replicas, analyzers, etc)
     */
    async createIndex(indexName, mapping, settings) {
        let createResponse;

        try {
            createResponse = await this.client.indices.create({
                index: indexName,
                body: {
                    ...settings,
                    ...mapping
                }
            });
        } catch (err) {
            this.logger.error(`Could not create index ${indexName}. ${err.message}`);
            throw err;
        }

        //NOTE: the response could indicate that the index creation did not 
        //complete before the timeout. We need to identify when that will actually happen.        
    }

    /**
     * Performs a merge operation on the index to ensure cluster maintains a consistent state
     * @param {string} indexName the name of the index to optimize
     */
    async optimizeIndex(indexName) {

    }

    /**
     * Points an alias to a new index name.  This is called swap because in one command
     * you remove it from the current index and add to the new one.
     * @param {*} aliasName 
     * @param {*} indexName 
     */
    async swapAlias(aliasName, indexName) {

    }


    

}

module.exports = ElasticTools;

