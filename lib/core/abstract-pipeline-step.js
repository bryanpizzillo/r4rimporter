
/**
 * Represents a step in our ETL pipeline
 */
class AbstractPipelineStep {

    /**
     * Creates a new instance of the AbstractPipelineStep
     * @param {object} logger 
     */
    constructor(logger) {

        if (this.constructor === AbstractPipelineStep) {
            throw new TypeError("Cannot construct AbstractPipelineStep");
        }

        this.logger = logger;
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
     * @param {Object} config configuration parameters to use for this instance.
     */
    static async GetInstance(logger, config) {
        throw new TypeError("Cannot call abstract static method GetInstance from derrived class");
    }    
}

module.exports = AbstractPipelineStep;