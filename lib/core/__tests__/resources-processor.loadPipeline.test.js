/*
 * This file contains the tests for a basic flow through the processor.
 * Source generates 1 object -> Transform Returns it -> Loader does nothing.
 */
const winston               = require('winston');
const path                  = require('path');

const ResourcesProcessor    = require('../resources-processor');
const WinstonNullTransport  = require('../../../test/winston-null-transport');

const TestResourceSource        = require('../../../test/test-steps/sources/test-resource-source');
const TestResourceTransformer   = require('../../../test/test-steps/transformers/test-resource-transformer');
const TestResourceLoader        = require('../../../test/test-steps/loaders/test-resource-loader');


const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [
        new WinstonNullTransport()
    ]
})

const goodConfig = {
    "source": {
        "type": "test/test-steps/sources/test-resource-source",
        "config": {}
    },
    "transformers": [
        {
            "type": "test/test-steps/transformers/test-resource-transformer",
            "config": {}
        }
    ],
    "loader": {
        "type": "test/test-steps/loaders/test-resource-loader",
        "config": {}
    }
};

describe('ResourcesProcessor loadPipeline', async () => {
    const processor = new ResourcesProcessor(
        logger,
        goodConfig    
    )
    
    it('loads', async () => {
        await processor.loadPipeline();

        expect(processor.sourceStep).toBeInstanceOf(TestResourceSource);
        expect(processor.transformerSteps).toHaveLength(1);
        expect(processor.transformerSteps[0]).toBeInstanceOf(TestResourceTransformer);
        expect(processor.loaderStep).toBeInstanceOf(TestResourceLoader);
    });

    it('encounters an error', async () => {
        const processor = new ResourcesProcessor(
            logger,
            { ...goodConfig, source: { type: "badpath", config: {} } }
        );
        
        expect.assertions(1);
        try {
            await processor.loadPipeline();
        } catch (err) {
            expect(err).toMatchObject({
                code: "MODULE_NOT_FOUND"
            });
        }
    });
})

