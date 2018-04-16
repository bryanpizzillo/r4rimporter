const AbstractResourceSource = require('../../../lib/core/abstract-resource-source');

/**
 * This class implements a Test resource source
 */
class TestResourceSource extends AbstractResourceSource {

    constructor(logger) {
        super(logger);
    }

    /**
     * Called before any resources are loaded.
     */
    async begin() {
        return;
    }    

    /**
     * Get a collection of resources from this source
     * @returns an array containing a single empty object
     */
    async getResources() {
        this.logger.debug("TestResourceSource:getResources")
        return [{}];
    }

    /**
     * Method called after all resources have been loaded
     */
    async end() {
        return;
    }
    
    /**
     * Called upon a fatal loading error. Use this to clean up any items created on startup
     */
    async abort() {
        return;
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
        
        return new TestResourceSource(logger);
    }  
}

module.exports = TestResourceSource;