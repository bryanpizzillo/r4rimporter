const moment            = require('moment');
const elasticsearch     = require('elasticsearch');
const path              = require('path');
const ElasticTools      = require('elastic-tools');

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
        estools,
        mappings,
        settings, 
        {
            bufferSize = 0,
            daysToKeep = 10,
            minIndexesToKeep = 2,
            aliasName = false
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

        this.mappings = mappings;
        this.settings = settings;
    }

    /**
     * Called before any resources are loaded.
     */
    async begin() {
        this.logger.debug("ElasticResourceLoader:begin - Begin Begin");
                
        try {            
            this.indexName = await this.estools.createTimestampedIndex(this.aliasName, this.mappings, this.settings);
        } catch (err) {
            this.logger.error(`Failed to create index ${this.indexName}`)
            throw err;
        }
        this.logger.debug("ElasticResourceLoader:begin - End Begin");
    }

    /**
     * Loads a resource into the data store
     */
    async loadResource(resource) {
        try {
            //TODO: Fix this, resource should not be hardcoded.  ID field should not either...
            await this.estools.indexDocument(this.indexName, "resource", resource.id, resource);
        } catch(err) {
            this.logger.error(`Could not save resource with id: ${resource.id}`);
            throw err;
        }
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
            await this.estools.optimizeIndex(this.indexName);

            //swap the alias
            await this.estools.setAliasToSingleIndex(this.aliasName, this.indexName);

            //Clean up old indices
            try {
                await this.estools.cleanupOldIndices(this.aliasName, this.daysToKeep, this.minIndexesToKeep);
            } catch (err) {
                this.logger.error("Could not cleanup old indices");
                throw err;
            }
    
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

        const appRoot = path.join(__dirname, '..', '..');

        let mappings;
        if (!config["mappingPath"] || typeof config.mappingPath !== 'string') {
            throw new Error("mappingPath is required for the elastic loader");
        }
        const mapFullPath = path.join(appRoot, config["mappingPath"]);
        try {             
            mappings = require(mapFullPath);
        } catch (err) {            
            throw new Error(`mappingPath cannot be loaded: ${mapFullPath}`);
        }        

        let settings;
        if (!config["settingsPath"] || typeof config.settingsPath !== 'string') {
            throw new Error("settingsPath is required for the elastic loader");
        }
        const settingsFullPath = path.join(appRoot, config["settingsPath"]);
        try {
            settings = require(settingsFullPath);
        } catch (err) {
            throw new Error(`settingsPath cannot be loaded: ${settingsFullPath}`);
        }

        //TODO: This should be a better check...
        if (!config.eshosts) {
            throw new Error("eshosts is required for the elastic loader");
        }

        const estools = new ElasticTools(logger, new elasticsearch.Client({
            hosts: config.eshosts,
            maxSockets: 100,
            keepAlive: true
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