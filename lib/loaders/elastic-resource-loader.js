const moment            = require('moment');
const elasticsearch     = require('elasticsearch');

const AbstractResourceLoader = require('../core/abstract-resource-loader');
const ElasticTools = require('../util/elastic-tools');

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
        estools,
        mappings,
        settings, 
        {
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

        if (!daysToKeep && typeof daysToKeep !== 'number') {
            throw new Error("daysToKeep is required for the elastic loader");
        }
        this.daysToKeep = daysToKeep;

        if (!minIndexesToKeep && typeof minIndexesToKeep !== 'number') {
            throw new Error("minIndexesToKeep is required for the elastic loader");
        }
        this.minIndexesToKeep = minIndexesToKeep;

        this.estools = estools;

        // Batch loading is more efficient.
        this.buffer = [];

        this.indexName = false;
    }

    /**
     * Called before any resources are loaded.
     */
    async begin() {
        try {
            const now = moment();
            const timestamp = now.format("YYYYMMDD_HHmmss");
            const indexName = `${this.aliasName}_${timestamp}`;
            
            this.indexName = await this.estools.createIndex(indexName, mapping, settings);

        } catch (err) {
            this.logger.error("Begin step failes")
            throw err;
        }
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

        try {
            //optimize the index


            //swap the alias
            await this.estools.setAliasToSingleIndex(this.aliasName, this.indexName);

            //Setup time for the old date.
            const milliInDays = 24 * 60 * 60 * 1000;
            const olderThanDate = Math.floor(Date.now() / milliInDays);

            //delete any old indices
            const oldIndices = await this.estools.getIndicesOlderThan(this.aliasName, olderThanDate);

        } catch (err) {
            this.logger.error("Errors occurred during end process");
            throw err;
        }
        
    }

    /**
     * A static method to validate a configuration object against this module type's schema
     * @param {Object} config configuration parameters to use for this instance.
     * @param {string|string[]} config.eshosts An array of elasticsearch hosts
     * @param {number} config.bufferSize the number of resources to wait for until sending to ES.
     * @param {number} config.daysToKeep the number of days to keep indices for.
     * @param {number} config.minIndexesToKeep the minimum number of indices to keep.
     * @param {number} config.aliasName the name of the alias to use for this collection.
     * @param {string} config.mappingPath the path to the mappings file
     * @param {string} config.settingsPath the path to the settings file
     */
    static ValidateConfig(config) {
        let errors = [];

        if (!config["mappingPath"] || typeof config.mappingPath !== 'string') {
            push( new Error("mappingPath is required for the elastic loader") );
        }

        if (!config["settingsPath"] || typeof config.settingsPath !== 'string') {
            push( new Error("settingsPath is required for the elastic loader") );
        }

        //TODO: This should be a better check...
        if (!config.eshosts) {
            throw new Error("eshosts is required for the elastic loader");
        }        

        return errors;
    }

    /**
     * A static helper function to get a configured source instance
     * @param {Object} logger the logger to use
     * @param {Object} config configuration parameters to use for this instance.
     * @param {string|string[]} config.eshosts An array of elasticsearch hosts
     * @param {number} config.bufferSize the number of resources to wait for until sending to ES.
     * @param {number} config.daysToKeep the number of days to keep indices for.
     * @param {number} config.minIndexesToKeep the minimum number of indices to keep.
     * @param {number} config.aliasName the name of the alias to use for this collection.
     * @param {string} config.mappingPath the path to the mappings file
     * @param {string} config.settingsPath the path to the settings file
     */
    static async GetInstance(logger, config) {

        let mappings;
        if (!config["mappingPath"] || typeof config.mappingPath !== 'string') {
            throw new Error("mappingPath is required for the elastic loader");
        }
        try {
            mappings = require(mappingPath);
        } catch (err) {
            throw new Error("mappingPath cannot be loaded");
        }        

        let settings;
        if (!config["settingsPath"] || typeof config.settingsPath !== 'string') {
            throw new Error("settingsPath is required for the elastic loader");
        }
        try {
            settings = require(settingsPath);
        } catch (err) {
            throw new Error("settingsPath cannot be loaded");
        }

        //TODO: This should be a better check...
        if (!config.eshosts) {
            throw new Error("eshosts is required for the elastic loader");
        }

        const estools = new ElasticTools(logger, new elasticsearch.Client({
            hosts: config.eshosts
        }))

        return new ElasticResourceLoader(
            logger, 
            estools,
            mappings,
            settings, 
            {
                ...config,
                settingsPath:undefined,
                mappingPath:undefined,
                eshosts: undefined
            }
        );
    }       

}

module.exports = ElasticResourceLoader;