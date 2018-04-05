const AbstractPipelineStep      = require('./abstract-pipeline-step');

/**
 * Class representing a source of resources
 */
class AbstractResourceSource extends AbstractPipelineStep{

    /**
     * Creates a new instance of 
     * @param {logger} logger An instance of a logger.
     */
    constructor(logger) {
        super(logger);

        if (this.constructor === AbstractResourceSource) {
            throw new TypeError("Cannot construct AbstractResourceSource");
        }

        if (this.getResources === AbstractResourceSource.prototype.getResources) {
            throw new TypeError("Must implement abstract method getResources");
        }
    }

    /**
     * Get a collection of resources from this source
     */
    async getResources() {
        throw new Error("Cannot call abstract method.  Implement getResources in derrived class.");
    }
}

module.exports = AbstractResourceSource;