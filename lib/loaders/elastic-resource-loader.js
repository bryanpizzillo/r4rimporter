const moment            = require('moment');

const AbstractResourceLoader = require('../core/abstract-resource-loader');

/**
 * This class implements an Elasticsearch Resource loader
 */
class ElasticResourceLoader extends AbstractResourceLoader {

    /**
     * Creates a new instance of an AbstractResourceLoader
     * @param {logger} logger An instance of a logger.
     */
    constructor(
        logger, 
        {
            elasticsearch = {
                //hosts should have protocol://servernameorip:port
                hosts: []
            },
            bufferSize = 0,
            daysToKeep = 10,
            minIndexesToKeep = 2,
            aliasName = false,
            mappingPath = false,
            settingsPath = false
        } = {}
    ) {
        super(logger);

        if (!aliasName && typeof aliasName !== 'string') {
            throw new Error("aliasName is required for the elastic loader");
        }
        this.aliasName = aliasName;

        if (!mappingPath && typeof mappingPath !== 'string') {
            throw new Error("mappingPath is required for the elastic loader");
        }
        this.mappingPath = mappingPath;

        if (!settingsPath && typeof settingsPath !== 'string') {
            throw new Error("settingsPath is required for the elastic loader");
        }
        this.settingsPath = settingsPath;

        if (!daysToKeep && typeof daysToKeep !== 'number') {
            throw new Error("daysToKeep is required for the elastic loader");
        }
        this.daysToKeep = daysToKeep;

        if (!minIndexesToKeep && typeof minIndexesToKeep !== 'number') {
            throw new Error("minIndexesToKeep is required for the elastic loader");
        }
        this.minIndexesToKeep = minIndexesToKeep;

        //Check the search config

        // Batch loading is more efficient.
        this.buffer = [];
    }

    /**
     * Called before any resources are loaded.
     */
    async begin() {

        //Create the index
        //Get timestamp to append to alias name
        const now = moment();
        const timestamp = now.format("YYYYMMDD_HHmmss");
        const indexName = this.aliasName + timestamp;


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
        //remove the current index if we are aborting

        throw new Error("Not Implemented");
    }

    /**
     * Method called after all resources have been loaded
     */
    async end() {

        //optimize the index
        //swap the alias
        //delete any old indices

        throw new Error("Cannot call abstract method.  Implement end in derrived class.");
    }

}

module.exports = ElasticResourceLoader;