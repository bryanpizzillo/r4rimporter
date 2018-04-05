
// Get Content
const octokit           = require('@octokit/rest');
const axios             = require('axios');
const matter            = require('gray-matter');

const AbstractResourceSource = require('../core/abstract-resource-source');

/**
 * This class implements a Resource Source wherin the content lives in the 
 * r4rcontent structure of Github.
 */
class GithubResourceSource extends AbstractResourceSource {

    /**
     * Creates a new instance of a GithubResourceSource
     * @param {logger} logger An instance of a logger.
     * @param {Object} client An initialized GitHub client from octokit/rest.
     * @param {Object} param2 A configuration object
     * @param {string} param2.repo The URL for the source github repo
     * @param {string} param2.resourcesPath The path within the repo to the resources. (DEFAULT: /resources)
     * @param {string} param2.dataPath The path within the repo to the data files. (DEFAULT: /data)
     */
    constructor(logger, client, agent, { repoUrl = false, resourcesPath = '/resources', dataPath = '/data' } = {}) {
        super(logger);

        if (repoUrl === false) {
            throw new Error("You must supply a repository URL");
        }

        // Set Github Client
        this.client = client;

        // Set HTTP(S) Agent
        this.agent = agent;
        
        //break up the repo url
        this.owner = 'bryanpizzillo';
        this.repo = 'r4rcontent';
        this.resourcesPath = resourcesPath;
        this.dataPath = dataPath;
    }

    /**
     * Get a collection of resources from this source
     */
    async getResources() {

        let rtnResources = [];

        this.logger.debug("GithubResourceSource:getResources - Beginning Fetch");

        let resourcesList;

        //Get list of content from github
        try {
            resourcesList = await this._getResourceList();
        } catch (err) {
            this.logger.error(`Could not fetch resources from GitHub https://github.com/${this.owner}/${this.repo}${this.resourcesPath}`);
            throw err;
        }
        
        //download the content
        const results = await Promise.all(
            resourcesList.map(async (item) => {
                rtnResources.push(await this._getResourceContent(item));
            })
        );    

        this.logger.debug("GithubResourceSource:getResources - Completed Fetch");

        return rtnResources;
    }

    /**
     * Internal function to get the list of resources in the resources folder
     * @return {array} an array of the URLs to download
     */
    async _getResourceList() {

        const result = await this.client.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            path: this.resourcesPath
        });

        const regEx = /.*\.md$/;

        const downloadList = result.data
            .filter(r => r.type == 'file' && regEx.test(r.download_url))
            .map(r => r.download_url);

        return downloadList.slice(0,1);
    }

    /**
     * 
     * @param {*} contentUrl 
     */
    async _getResourceContent(contentUrl) {

        let response;

        try {
            response = await axios.get(contentUrl, {
                httpsAgent: this.agent,
                responseType: 'text',
                transformResponse: this._transformRawResource.bind(this)
            });
        } catch (err) {
            this.logger.error(`Could not fetch ${contentUrl}`);
            throw err;
        }

        return response;
    }

    /**
     * 
     * @param {*} contentUrl 
     */
    _transformRawResource(data) {
        const document = matter(data);

        //Map to object we want to push to ES
        
        return document;
    }

    /**
     * A static helper function to get a configured source instance
     * @param {Object} logger the logger to use
     * @param {Object} config configuration parameters to use for this instance. See GithubResourceSource constructor.
     */
    static async GetInstance(logger, config) {

        // agent should be defined in the config
        const agent = new https.Agent({
            keepAlive: true,
            maxSockets: 100
        })    

        // We will probably need to authenticate to get around the rate limits
        // they are based on IP address, which for us *could* be a major limiter.

        const client = octokit({
            // Since we will be scraping the GitHub site we will be making a lot of calls
            // the following options will make sure that we do not kill the computer's 
            // sockets that it runs on.
            agent: agent
        });

        //should authenticate here?

        return new GithubResourceSource(logger, client, agent, config);
    }
}

module.exports = GithubResourceSource;