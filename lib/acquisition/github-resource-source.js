
// Get Content
const octokit           = require('@octokit/rest');
const axios             = require('axios');
const https             = require('https');
const matter            = require('gray-matter');

const AbstractResourceSource = require('./abstract-resource-source');

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
    constructor(logger, client, { repo = false, resourcesPath = '/resources', dataPath = '/data' } = {}) {
        super(logger);

        if (repo === false) {
            throw new Error("You must supply a repository URL");
        }

        this.client = client;
        
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
        

        console.log(resourcesList);

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

    async _getResourceContent(contentUrl) {

    }


    /**
     * A static helper function to get a configured source instance
     * @param {Object} logger the logger to use
     * @param {Object} config configuration parameters to use for this instance. See GithubResourceSource constructor.
     */
    static async GetInstance(logger, config) {

        const client = octokit({
            // Since we will be scraping the GitHub site we will be making a lot of calls
            // the following options will make sure that we do not kill the computer's 
            // sockets that it runs on.
            agent: new https.Agent({
                keepAlive: true,
                maxSockets: 100
            })
        });

        //should authenticate here?

        return new GithubResourceSource(logger, client, config);
    }
}

module.exports = GithubResourceSource;