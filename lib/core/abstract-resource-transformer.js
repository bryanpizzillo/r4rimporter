const AbstractPipelineStep      = require('./abstract-pipeline-step');

/**
 * Class representing a transformer that converts a raw resource from the source to one for loading
 */
class AbstractResourceTransformer extends AbstractPipelineStep {

    /**
     * Creates a new instance of an AbstractResourceTransformer
     * @param {logger} logger An instance of a logger.
     */
    constructor(logger) {

        super(logger);

        if (this.constructor === AbstractResourceTransformer) {
            throw new TypeError("Cannot construct AbstractResourceTransformer");
        }

        if (this.transform === AbstractResourceTransformer.prototype.transform) {
            throw new TypeError("Must implement abstract method transform");
        }

        if (this.begin === AbstractResourceTransformer.prototype.begin) {
            throw new TypeError("Must implement abstract method begin");
        }

        if (this.end === AbstractResourceTransformer.prototype.end) {
            throw new TypeError("Must implement abstract method end");
        }
    }

    /**
     * Transforms the resource 
     * @param {Object} data the object to be transformed
     * @returns the transformed object
     */
    async transform(data) {
        throw new Error("Cannot call abstract method.  Implement loadResources in derrived class.");
    }

}

module.exports = AbstractResourceTransformer;