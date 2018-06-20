const winston               = require('winston');
const WinstonNullTransport  = require('winston-null-transport');
const path                  = require('path');

const ResourcesProcessor    = require('../resources-processor');

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [
        new WinstonNullTransport()
    ]
})

const PATH_TO_MODULE = path.join('test', 'test-steps', 'processor-error-test-step')

describe('ResourcesProcessor loadPipelineStep ', async () => {
    
    const goodStepInfo = Object.freeze({
        type: "string", 
        config: {}
    });
    
    const goodConfig = Object.freeze({
        source: goodStepInfo,
        transformers: [
            goodStepInfo
        ],
        loader: goodStepInfo
    });

    const processor = new ResourcesProcessor(logger, goodConfig);

    ////////////////////////
    /// Everything worked ok
    ////////////////////////
    it('loads the step', async() => {
        let actual = await processor.loadPipelineStep(PATH_TO_MODULE, {});
        expect(actual).toBeTruthy();
    });

    //////////////////////
    /// Error Cases
    //////////////////////
    describe('throws on', async() => {
        it('inability to load the module', async () => {

            expect.assertions(1);
            try {
                 await processor.loadPipelineStep('/path/does/not/exist', {});
            } catch (err) {
                expect(err).toMatchObject({
                    code: "MODULE_NOT_FOUND"
                });
            }

        });
    
        it('invalid step configuration by exception', async () => {
            expect.assertions(1);
            try {
                await processor.loadPipelineStep(
                    PATH_TO_MODULE, 
                    { fail: true }
                );
            } catch (err) {
                 expect(err).toMatchObject({
                     message: "Invalid Configuration"
                 });
            }
        });

        it('invalid step configuration with errors', async () => {

            // TODO: We should check the logger to see if messages are written

            expect.assertions(1);
            try {
                await processor.loadPipelineStep(
                    PATH_TO_MODULE, 
                    { 
                        fail: true,
                        errors: [ new Error("Test Error")]
                    }
                );
            } catch (err) {
                 expect(err).toMatchObject({
                     message: "Invalid Configuration"
                 });
            }
        });        
    
        it('inability to get an instance of the step', async () => {
            expect.assertions(1);
            try {
                await processor.loadPipelineStep(
                    PATH_TO_MODULE, 
                    { 
                        fail: true,
                        errors: []
                    }
                );
            } catch (err) {
                 expect(err).toMatchObject({
                     message: "Could not get instance"
                 });
            }            
        });    
    })

});