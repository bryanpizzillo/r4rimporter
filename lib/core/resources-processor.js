
const path              = require('path');

/**
 * Represents the main resources ETL processor.
 */
class ResourcesProcessor {
    
    /**
     * Creates a new instance of the ResourcesProcessor
     * @param {logger} logger An instance of a logger.
     * @param {*} param1 The configuration for this resources processor
     */
    constructor(logger, { source = false, transformers = [], loader = false } = {}) {
        
        if (!this._isBasicConfigStructValid(source)) {
            throw new Error("The source configuration is not valid");
        }

        //Test all the transformer configs
        if (!transformers.map(this._isBasicConfigStructValid.bind(this)).reduce((a,c) => a && c, true)) {
            throw new Error("A transformer configuration is not valid");
        }

        if (!this._isBasicConfigStructValid(loader)) {
            throw new Error("The loader configuration is not valid");
        }
        
        this.logger = logger;
        this.config = {
            source: source,
            transformers: transformers,
            loader: loader
        };

        this.sourceStep = false;
        this.transformerSteps = [];
        this.loaderStep = false;
    }

    /**
     * Validate the basic configuration structure
     * @param {*} config The configuration to test
     */
    _isBasicConfigStructValid(config) {
        if (!config || typeof config !== 'object') {
            return false;
        }

        if (!config['type'] || typeof config['type'] !== 'string'){
            return false;
        }

        if (!config['config'] || typeof config['config'] !== 'object'){
            return false;
        }

        return true;
    }

    /**
     * Loads a pipeline step and gets an instance of the module, configured by the config.
     * @param {*} type The step type/path 
     * @param {*} stepConfig The configuration for this step
     */
    async _loadPipelineStep(type, stepConfig) {
        //TODO: Better handling of search paths...
        const appRoot = path.join(__dirname, '..', '..');
        const modulePath = path.join(appRoot, type);

        let loadedModule;

        // Load the module
        try {
            loadedModule = require(modulePath);
        } catch(err) {
            this.logger.error(`Could not load step, ${type}.`);
            this.logger.error(err);
            throw err;
        }

        let configErrors;

        // Test the config
        try {
            configErrors = loadedModule.ValidateConfig(stepConfig);
        } catch(err) {
            this.logger.error(`Module ${type} Configuration Errors Detected`);
            this.logger.error(err);
            throw new Error("Invalid Configuration")
        }

        if (configErrors.length > 0) {
            this.logger.error(`Module ${type} Configuration Errors Detected`);
            configErrors.forEach(err => {
              this.logger.error(err);
            });  
            throw new Error("Invalid Configuration")
        }         

        // Get an instance of the module
        let moduleInstance;

        try {
            moduleInstance = await loadedModule.GetInstance(this.logger, stepConfig);
        } catch (err) {
            this.logger.error(`Could not create instance of step, ${type}.`);
            this.logger.error(err);
            throw err;
        }

        return moduleInstance;
    }

    /**
     * Setup the steps in the pipeline
     */
    async _loadPipeline() {
        //Load the source
        this.sourceStep = await this._loadPipelineStep(this.config.source.type, this.config.source.config);

        //Load the transformers
        Promise.all(
            this.config.transformers.map(async tc => {
                this.transformerSteps.push(await this._loadPipeline(tc.type, tc.config));
            })
        );

        //Load the loader
        this.loaderStep = await this._loadPipelineStep(this.config.loader.type, this.config.loader.config);
    }

    /**
     * Runs the loading process.
     */
    async run() {
        await this._loadPipeline();

    }
}

module.exports = ResourcesProcessor;