const axios                 = require('axios');
const nock                  = require('nock');
const winston               = require('winston');
const path                  = require('path');

const NetlifyMdResourceTransformer    = require('../netlifymd-resource-transformer');
const WinstonNullTransport  = require('../../../test/winston-null-transport');

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [
        new WinstonNullTransport()
    ]
});


const VALID_CONFIG = {
    mappingUrls: {
        docs: "https://example.org/bryanpizzillo/r4rcontent/master/data/docs.json",
        researchAreas: "https://example.org/bryanpizzillo/r4rcontent/master/data/researchAreas.json",
        researchTypes: "https://example.org/bryanpizzillo/r4rcontent/master/data/researchTypes.json",
        toolTypes: "https://example.org/bryanpizzillo/r4rcontent/master/data/toolTypes.json"
    }
};

const TEST_FILE_PATH = path.join(__dirname, '..', '..', '..', 'test', 'data', 'facets');


const httpAdapterPath = path.join(
    path.dirname(require.resolve('axios')),
    'lib/adapters/http'
);
const httpAdapter = require(httpAdapterPath);
axios.defaults.adapter = httpAdapter;

describe('NetlifyMdResourceTransformer', async() => {

    describe('Constructor', () => {

        it('throws errors on no mappings', () => {
            const axclient = axios.create({});

            expect(() => {
                new NetlifyMdResourceTransformer(
                    logger,
                    axclient,
                    {...VALID_CONFIG, mappingUrls: null }
                )
            }).toThrow("Mapping URLs are not valid");            
        })

        it('throws errors on invalid mappings', () => {
            const axclient = axios.create({});

            expect(() => {
                new NetlifyMdResourceTransformer(
                    logger,
                    axclient,
                    {...VALID_CONFIG, mappingUrls: { docs: "string", researchAreas: {}} }
                )
            }).toThrow("Mapping URLs are not valid");
        })

        it('creates as expected', () => {

            const axclient = axios.create({});
            const xformer = new NetlifyMdResourceTransformer(
                logger,
                axclient,
                VALID_CONFIG
            )

            expect(xformer).not.toBeNull();
            expect(xformer.logger).toBe(logger);
            expect(xformer.axclient).toBe(axclient);
            expect(xformer.mappingUrls).toBe(VALID_CONFIG.mappingUrls);
        })
        
    })


    describe('GetInstance', async() => {

        it('returns an instance', () => {
            expect(false).toBeTruthy();
        })        
    })

    describe('ValidateConfig', async() => {
        it('makes sure config is valid', () => {
            expect(false).toBeTruthy();
        })

        it('throws an error when invalid', () => {
            expect(false).toBeTruthy();
        })
    })

    describe('getMappingFile', async() => {

        it('fetches a single file', async() => {
            let scope = nock('https://example.org')
                .get("/bryanpizzillo/r4rcontent/master/data/docs.json")
                .replyWithFile(200, path.join(TEST_FILE_PATH, 'docs.json'))

            const transformer = new NetlifyMdResourceTransformer(
                logger,
                axios.create({}),
                VALID_CONFIG
            );

            await transformer.getMappingFile("test", "https://example.org/bryanpizzillo/r4rcontent/master/data/docs.json");

            expect(transformer.facetMaps).toMatchObject({test: [
                { "label": "Office of Examples and Tests (OET)", "value": "oet" },
                { "label": "Division of Samples and Examples (DSE)", "value": "dse" },
                { "label": "Center for Exempli Gratio (CEG)", "value": "ceg" }
            ]});
        })

        it('throws on 404', async() => {
            
        })

        it('throws on invalid json', async() => {
            
        })

    })

    describe('begin', async() => {

        it('loads the mapping files from web', async () => {

            let scope = nock('https://example.org')
                .get("/bryanpizzillo/r4rcontent/master/data/docs.json")
                .replyWithFile(200, path.join(TEST_FILE_PATH, 'docs.json'))
                .get("/bryanpizzillo/r4rcontent/master/data/researchAreas.json")
                .replyWithFile(200, path.join(TEST_FILE_PATH, 'researchAreas.json'))
                .get("/bryanpizzillo/r4rcontent/master/data/researchTypes.json")
                .replyWithFile(200, path.join(TEST_FILE_PATH, 'researchTypes.json'))
                .get("/bryanpizzillo/r4rcontent/master/data/toolTypes.json")
                .replyWithFile(200, path.join(TEST_FILE_PATH, 'toolTypes.json'))

            const transformer = new NetlifyMdResourceTransformer(
                logger,
                axios.create({}),
                VALID_CONFIG
            );

            await transformer.begin();

            //Check each of the maps.
            expect(false).toBeTruthy();
        })

        it('throws an error when mapping is 404', async () => {
            expect(false).toBeTruthy();
        })

        it('throws an error when mapping is not JSON', async () => {
            expect(false).toBeTruthy();
        })

    })

    describe('end', async() => {
        it('ends correctly', () => {
            expect(false).toBeTruthy();
        })
    })

    describe('transform', async() => {

        it('transforms the resource', () => {
            expect(false).toBeTruthy();
        })

    })
})

