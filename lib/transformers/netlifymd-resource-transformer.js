const AbstractResourceTransformer = require('../core/abstract-resource-transformer');

/**
 * This class implements a Resource transformer that transforms a Netlify yaml-frontmatter
 * document into a resource for indexing
 */
class NetlifyMdResourceTransformer extends AbstractResourceTransformer {

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