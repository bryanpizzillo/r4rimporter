const https             = require('https');
const winston           = require('winston');

const GithubResourceSource = require('./lib/acquisition/github-resource-source');


// This should be based on a config really...
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console()
    ]
})

// We will probably need to authenticate to get around the rate limits
// they are based on IP address, which for us *could* be a major limiter.


//https://octokit.github.io/rest.js/#api-Repos-getContent

// Map Content

// Store Content

async function main() {

    const agent = new https.Agent({
        keepAlive: true,
        maxSockets: 100
    })
    
    const source = await GithubResourceSource.GetInstance(logger, agent, {
        repoUrl: 'https://github.com/bryanpizzillo/r4rcontent'
    });
 
    await source.getResources();
}

main();
