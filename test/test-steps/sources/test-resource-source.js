const AbstractResourceSource = require('../../../lib/core/abstract-resource-source');

/**
 * This class implements a Test resource source
 */
class TestResourceSource extends AbstractResourceSource {

    constructor(logger) {
        super(logger);
    }

    /**
     * Get a collection of resources from this source
     */
    async getResources() {
        this.logger.debug("TestResourceSource:getResources")
        return [];
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