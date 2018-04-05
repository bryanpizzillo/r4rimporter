const AbstractPipelineStep      = require('./abstract-pipeline-step');

/**
 * Class representing a loader that stores resources
 */
class AbstractResourceLoader extends AbstractPipelineStep {

    /**
     * Creates a new instance of an AbstractResourceLoader
     * @param {logger} logger An instance of a logger.
     */
    constructor(logger) {

        super(logger);

        if (this.constructor === AbstractResourceLoader) {
            throw new TypeError("Cannot construct AbstractResourceSource");
        }

        if (this.loadResource === AbstractResourceLoader.prototype.loadResource) {
            throw new TypeError("Must implement abstract method loadResource");
        }

        if (this.begin === AbstractResourceLoader.prototype.begin) {
            throw new TypeError("Must implement abstract method begin");
        }

        if (this.abort === AbstractResourceLoader.prototype.abort) {
            throw new TypeError("Must implement abstract method abort");
        }        
        
        if (this.end === AbstractResourceLoader.prototype.end) {
            throw new TypeError("Must implement abstract method end");
        }

    }

    /**
     * Called before any resources are loaded.
     */
    async begin() {
        throw new Error("Cannot call abstract method.  Implement begin in derrived class.");
    }

    /**
     * Loads a resource into the data store
     */
    async loadResource(resource) {
        throw new Error("Cannot call abstract method.  Implement loadResources in derrived class.");
    }

    /**
     * Called upon a fatal loading error. Use this to clean up any items created on startup
     */
    async abort() {
        throw new Error("Cannot call abstract method.  Implement abort in derrived class.");
    }

    /**
     * Method called after all resources have been loaded
     */
    async end() {
        throw new Error("Cannot call abstract method.  Implement end in derrived class.");
    }

}

module.exports = AbstractResourceLoader;