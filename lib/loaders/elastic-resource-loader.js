const AbstractResourceLoader = require('../core/abstract-resource-loader');

/**
 * This class implements an Elasticsearch Resource loader
 */
class ElasticResourceLoader extends AbstractResourceLoader {

    constructor(logger) {}

    /**
     * A static helper function to get a configured source instance
     * @param {Object} logger the logger to use
     * @param {Object} config configuration parameters to use for this instance. See GithubResourceSource constructor.
     */
    static async GetInstance(logger, config) {
        throw new Error("Not Implemented");
    }        
}