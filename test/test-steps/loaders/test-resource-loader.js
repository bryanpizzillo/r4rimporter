const AbstractResourceLoader = require('../../../lib/core/abstract-resource-loader');

/**
 * This class implements a test Resource loader
 */
class TestResourceLoader extends AbstractResourceLoader {

    constructor(logger) {
        super(logger);
    }

    /**
     * Called before any resources are loaded.
     */
    async begin() {
        this.logger.debug("TestResourceLoader:begin")
    }

    /**
     * Loads a resource into the data store
     */
    async loadResource(resource) {
        this.logger.debug("TestResourceLoader:loadResource")
        console.log(resource)
    }

    /**
     * Called upon a fatal loading error. Use this to clean up any items created on startup
     */
    async abort() {
        this.logger("TestResourceLoader:abort")
    }

    /**
     * Method called after all resources have been loaded
     */
    async end() {
        throw new Error("Cannot call abstract method.  Implement end in derrived class.");
    }    

    /**
     * A static method to validate a configuration object against this module type's schema
     * @param {Object} config configuration parameters to use for this instance.
     */
    static ValidateConfig(config) {
        return [];
    }    

    /**
     * A static helper function to get a configured source instance
     * @param {Object} logger the logger to use
     * @param {Object} config configuration parameters to use for this instance.
     */
    static async GetInstance(logger, config) {
        return new TestResourceLoader(logger);
    }  
}

module.exports = TestResourceLoader;