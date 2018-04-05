const AbstractResourceTransformer = require('../../../lib/core/abstract-resource-transformer');

/**
 * This class implements a Test Resource transformer
 */
class TestResourceTransformer extends AbstractResourceTransformer {

    constructor(logger) {
        super(logger);
    }

    /**
     * Called before any resources are transformed -- load mappers and anything else here.
     */
    async begin() {
        this.logger.debug("TestResourceTransformer:begin");
    }

    /**
     * Transforms the resource 
     */
    async transform(data) {
        this.logger.debug("TestResourceTransformer:transform");
        return {};
    }

    /**
     * Method called after all resources have been transformed
     */
    async end() {
        this.logger.debug("TestResourceTransformer:end");
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
        return new TestResourceTransformer(logger);
    } 
}

module.exports = TestResourceTransformer;