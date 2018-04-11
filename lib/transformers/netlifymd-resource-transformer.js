const axios             = require('axios');
const matter            = require('gray-matter');

const AbstractResourceTransformer = require('../core/abstract-resource-transformer');

/**
 * This class implements a Resource transformer that transforms a Netlify yaml-frontmatter
 * document into a resource for indexing
 */
class NetlifyMdResourceTransformer extends AbstractResourceTransformer {

    /**
     * 
     * @param {Object} logger Logger to use for logging
     * @param {Object} axclient Axios client for making HTTP requests
     * @param {Object} param2 configuration
     * @param {Object} param2.mappingUrls an object representing the location of that facet mapping files
     * @param {string} param2.mappingUrls.docs the location of the Divisions, offices and centers map
     * @param {string} param2.mappingUrls.researchAreas the location of the research areas map
     * @param {string} param2.mappingUrls.researchTypes the location of the researchTypes map
     * @param {string} param2.mappingUrls.toolTypes the location of the tool types map 
     */
    constructor(
        logger, 
        axclient,
        {
            mappingUrls = {
                docs: false,
                researchAreas: false,
                researchTypes: false,
                toolTypes: false
            }
        } = {}
    ) {
        super(logger);

        //Check and see if the mapping URLs are a valid structure.
        //NOTE: this is not checking for 404s        
        if (!( mappingUrls &&
            ['docs', 'researchAreas', 'researchTypes', 'toolTypes']
            .reduce(
                (ac, cv) => ac = ac && (mappingUrls[cv] && typeof mappingUrls[cv] === 'string'), 
                true
            )
        )) {
            throw new Error("Mapping URLs are not valid");
        }

        this.mappingUrls = mappingUrls;
        this.axclient = axclient;

        this.facetMaps = {}
    }

    /**
     * Gets a single mapping file
     * @param {*} key The key to store in the facetMaps
     * @param {*} url The url of the mapping file
     */
    async getMappingFile(key, url) {
        let mapData;

        try {
            mapData = await this.axclient.get(url, {
                responseType: 'json'
            })

            // Axios swallows parse errors so the best way we can detect invalid JSON
            // is to make sure it is an object. If it did not parse it will be just a
            // string.
            if (!mapData.data || typeof mapData.data !== 'object') {
                this.logger.error(`Returned JSON from ${url} is not valid `);
                throw new Error("Could not load json map");
            }

            // TODO: We should probably validate the map against a schema

            this.facetMaps[key] = mapData.data;

        } catch (err) {
            this.logger.error(`Cannot fetch mapping ${key} located at ${url}.`)
            throw err;
        }
        
    }

    /**
     * Called before any resources are transformed -- load mappers and anything else here.
     */
    async begin() {
        
        const jsonFetchers = Object.keys(this.mappingUrls).map(async key => {
            await this.getMappingFile(key, this.mappingUrls[key]);
        })

        await Promise.all(jsonFetchers);
    }

    /**
     * Transforms the resource 
     * @param {Object} data the object to be transformed
     * @returns the transformed object
     */
    async transform(data) {
        const document = matter(data);

        //Map to object we want to push to ES
        
        return document;
    }

    /**
     * Method called after all resources have been transformed
     */
    async end() {
        return; //I have nothing to do here...
    }

    /**
     * A static method to validate a configuration object against this module type's schema
     * @param {Object} config configuration parameters to use for this instance.
     */
    static ValidateConfig(config) {

        let errors = [];

        if (!config || typeof config !== 'object') {
            errors.push(new Error("Config is not object or null"));
        } else if (
            Object.keys(config).length !== 1 || 
            !config["mappingUrls"] || 
            typeof config.mappingUrls !== "object"
        ) {
            errors.push(new Error("Config is not valid"));
        } else {
            for(let key of ['docs', 'researchAreas', 'researchTypes', 'toolTypes']) {
                if (!config.mappingUrls[key] || typeof config.mappingUrls[key] !== 'string') {
                    errors.push(new Error(`Mapping config for ${key} is invalid`));
                }
            }
        }

        return errors;
    }

    /**
     * A static helper function to get a configured source instance
     * @param {Object} logger the logger to use
     * @param {Object} agent the http agent to use for connections
     * @param {Object} config configuration parameters to use for this instance. See GithubResourceSource constructor.
     */
    static async GetInstance(logger, agent, config) {

        //Get instance of axios with our custom https agent
        const axiosInstance = axios.create({
            httpsAgent: agent
        })

        return new NetlifyMdResourceTransformer(logger, axiosInstance, config);
    }      
}

module.exports = NetlifyMdResourceTransformer;