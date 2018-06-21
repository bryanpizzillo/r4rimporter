const https             = require('https');
const winston           = require('winston');
const config            = require('config');

const PipelineProcessor = require('./lib/core/pipeline-processor');

async function main() {

    // This should be based on a config really...
    const logger = winston.createLogger({
        level: config.has("logging.level") ? config.get("logging.level") : 'info',
        format: winston.format.simple(),
        transports: [
            new winston.transports.Console()
        ]
    })

    let processor;

    try {
        processor = new PipelineProcessor(logger, config.get("pipeline"));
    } catch(err) {        
        logger.error("Terminal Errors occurred.")
        console.error(err);
        logger.error("Exiting...")
        process.exit(1);
    }
    
    try {    
        await processor.run();
        logger.info("Successfully completed processing.")
        process.exit(0);
    } catch(err) {
        logger.error("Terminal Errors occurred.")
        console.error(err);
        logger.error("Exiting...")
        process.exit(2);        
    }
}

main();
