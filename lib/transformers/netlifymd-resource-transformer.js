const matter            = require('gray-matter');

const AbstractResourceTransformer = require('../core/abstract-resource-transformer');

/**
 * This class implements a Resource transformer that transforms a Netlify yaml-frontmatter
 * document into a resource for indexing
 */
class NetlifyMdResourceTransformer extends AbstractResourceTransformer {

    constructor(logger, config) {
        super(logger);
    }

    /**
     * Called before any resources are transformed -- load mappers and anything else here.
     */
    async begin() {
        throw new Error("Cannot call abstract method.  Implement begin in derrived class.");
    }

    /**
     * Transforms the resource 
     * @param {Object} data the object to be transformed
     * @returns the transformed object
     */
    async transform(data) {
        const document = matter(data);

        //Map to object we want to push to ES
        
        return document;
    }

    /**
     * Method called after all resources have been transformed
     */
    async end() {
        throw new Error("Cannot call abstract method.  Implement end in derrived class.");
    }

    /**
     * A static method to validate a configuration object against this module type's schema
     * @param {Object} config configuration parameters to use for this instance.
     */
    static ValidateConfig(config) {
        throw new TypeError("Cannot call abstract static method ValidateConfig from derrived class");
    }    

    /**
     * A static helper function to get a configured source instance
     * @param {Object} logger the logger to use
     * @param {Object} config configuration parameters to use for this instance. See GithubResourceSource constructor.
     */
    static async GetInstance(logger, config) {
        throw new Error("Not Implemented");
    }      
}