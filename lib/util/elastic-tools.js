
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
     * Deletes an index
     * @param {*} indexName the name of the index to delete
     */
    async deleteIndex(indexName) {        

        try {
            await this.client.indices.delete({
                index: indexName
            })
        } catch(err) {
            this.logger.error(`Could not delete index ${indexName}`);
            throw err;
        }        
        
    }

    /**
     * Deletes an index making sure that there are no aliases
     * using the index.
     * @param {*} indexName the name of the index to delete
     */
    async deleteFreeIndex(indexName) {        

        try {
            await this.getIndicesForAlias()
        } catch(err) {
            this.logger.error(`Could not delete index ${indexName}`);
            throw err;            
        }

        try {
            await this.client.indices.delete({
                index: indexName
            })
        } catch(err) {
            this.logger.error(`Could not delete index ${indexName}`);
            throw err;
        }        
        
    }

    /**
     * Points an alias to a new index name.  This is called swap because in one command
     * you remove it from the current index and add to the new one.
     * @param {*} aliasName 
     * @param {*} indexName 
     */
    async setAliasToSingleIndex(aliasName, indexName) {

    }

    /**
     * Updates an alias by adding and removing indices
     * @param {*} aliasName The alias name to update
     * @param {*} param1 
     * @param {*} param1.add A single index name or an array of indices to add to the alias
     * @param {*} param1.remove A single index name or an array of indices to remove from the alias 
     */
    async updateAlias(aliasName, { add = [] , remove = [] } = {}) {

        let addArr = [];
        if (add && (typeof add === 'string' || Array.isArray(add))) {
            addArr = add === 'string' ? [add] : add;
        } else if (add) {            
            throw new Error("Indices to add must either be a string or an array of items")
        } //Else it is empty and that is ok.

        let removeArr = []
        if (remove && (typeof remove === 'string' || Array.isArray(remove)) ) {
            removeArr = remove === 'string' ? [remove] : remove;
        } else if (remove) {            
            throw new Error("Indices to remove must either be a string or an array of items")
        }
        
        if (!addArr.length && !removeArr.length) {
            throw new Error("You must add or remove at least one index");
        }

        let actions = [];
        if (addArr.length) {
            actions.push({
                "add": { "indices": addArr, "alias": aliasName }
            })
        }
        
        if (removeArr.length) {
            actions.push({
                "remove": { "indices": removeArr, "alias": aliasName }
            })
        }

        // Just gets back { acknowledged: true }
        try {
            await this.client.indices.updateAliases({
                body : {
                    actions
                }
            })
        } catch (err) {
            this.logger.error(`Could not update alias: ${aliasName}`)
            throw err;
        }
    }


    /**
     * Gets the indices associated with the alias.
     * @param {*} aliasName the name of the alias
     */
    async getIndicesForAlias(aliasName) {

        let res;

        try {
            res = await this.client.indices.getAlias({
                name: aliasName
            })
        } catch(err) {

            // There are no indices. so just return
            if (err.status == 404) {
                return [];
            }

            this.logger.error(`Could not get aliases for ${aliasName}`);
            throw(err);
        }

        return Object.keys(res);
    }
    
    /**
     * Gets the aliases associated with an index.
     * @param {*} indexName the name of the index
     */
    async getAliasesForIndex(indexName) {

        let res;

        try {
            res = await this.client.indices.getIndex({
                name: indexName
            })
        } catch(err) {

            // There are no indices. so just return
            if (err.status == 404) {
                return [];
            }

            this.logger.error(`Could not get index for ${indexName}`);
            throw(err);
        }



        console.log(res);



    }

}

module.exports = ElasticTools;

