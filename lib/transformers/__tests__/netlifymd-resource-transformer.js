const axios                 = require('axios');
const fs                    = require('fs');
const https                 = require('https');
const nock                  = require('nock');
const winston               = require('winston');
const path                  = require('path');
const util                  = require('util');

// Convert fs.readFile into Promise version of same    
const readFileAsync = util.promisify(fs.readFile);


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

        it('returns an instance', async () => {
            const transformer = await NetlifyMdResourceTransformer.GetInstance(logger, https.globalAgent, VALID_CONFIG)
            expect(transformer).toBeInstanceOf(NetlifyMdResourceTransformer);
            expect(transformer.axclient).not.toBeNull();
            expect(transformer.mappingUrls).toMatchObject(VALID_CONFIG.mappingUrls);
            expect(transformer.logger).toBe(logger);
        })        
    })

    describe('ValidateConfig', async() => {

        it('makes sure config is valid', () => {
            const errors = NetlifyMdResourceTransformer.ValidateConfig(VALID_CONFIG);
            expect(errors).toHaveLength(0);
        })

        it('returns an error when config null', () => {
            const expected = [new Error("Config is not object or null")]
            const errors = NetlifyMdResourceTransformer.ValidateConfig();
            expect(errors).toEqual(expect.arrayContaining(expected));          
        })

        it('returns an error when invalid', () => {
            const expected = [new Error("Config is not valid")]
            const errors = NetlifyMdResourceTransformer.ValidateConfig({});
            expect(errors).toEqual(expect.arrayContaining(expected));          
        })

        it('returns an error when config has invalid mapping urls', () => {
            const expected = [new Error("Config is not valid")]
            const errors = NetlifyMdResourceTransformer.ValidateConfig({ mappingUrls: "bad"});
            expect(errors).toEqual(expect.arrayContaining(expected));          
        })        

        it('returns an error when extra options', () => {
            const expected = [new Error("Config is not valid")]
            const errors = NetlifyMdResourceTransformer.ValidateConfig({ foo: {}, mappingUrls: {} });
            expect(errors).toEqual(expect.arrayContaining(expected));          
        })

        it('returns an error when mappingUrls bad', () => {
            const expected = [
                new Error("Mapping config for docs is invalid"),
                new Error("Mapping config for researchAreas is invalid"),
                new Error("Mapping config for researchTypes is invalid"),
                new Error("Mapping config for toolTypes is invalid")
            ]
            const errors = NetlifyMdResourceTransformer.ValidateConfig(
                { 
                    mappingUrls: {
                        docs: false,
                        researchAreas: false,
                        researchTypes: false,
                        toolTypes: false
                    }
                }
            );
            expect(errors).toEqual(expect.arrayContaining(expected));          
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
            let scope = nock('https://example.org')
            .get("/bryanpizzillo/r4rcontent/master/data/foo.json")
            .reply(404);

            const transformer = new NetlifyMdResourceTransformer(
                logger,
                axios.create({}),
                VALID_CONFIG
            );

            expect.assertions(1);

            try {
                await transformer.getMappingFile("test", "https://example.org/bryanpizzillo/r4rcontent/master/data/foo.json");
            } catch (err) {
                expect(err).toMatchObject({
                    message: "Request failed with status code 404"
                });
            }
        })

        it('throws on invalid json', async() => {
            let scope = nock('https://example.org')
            .get("/bryanpizzillo/r4rcontent/master/data/badData.json")
            .replyWithFile(200, path.join(TEST_FILE_PATH, 'badData.json'));

            const transformer = new NetlifyMdResourceTransformer(
                logger,
                axios.create({}),
                VALID_CONFIG
            );

            expect.assertions(1);

            try {
                await transformer.getMappingFile("test", "https://example.org/bryanpizzillo/r4rcontent/master/data/badData.json");
            } catch (err) {
                expect(err).toMatchObject({
                    message: "Could not load json map"
                });
            }   
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

            expect(transformer.facetMaps).toMatchObject({
                docs: [
                    { "label": "Office of Examples and Tests (OET)", "value": "oet" },
                    { "label": "Division of Samples and Examples (DSE)", "value": "dse" },
                    { "label": "Center for Exempli Gratio (CEG)", "value": "ceg" }
                ],
                researchTypes: [
                    { "label": "Basic", "value": "basic" },
                    { "label": "Translational", "value": "translational" },    
                    { "label": "Clinical Trials", "value": "clinical_trials" },
                    { "label": "Epidemiologic", "value": "epidemiologic" },
                    { "label": "Clinical", "value": "clinical" }
                ],
                researchAreas: [
                    { "label": "Cancer Treatment", "value": "cancer_treatment" },
                    { "label": "Cancer Biology", "value": "cancer_biology" },
                    { "label": "Cancer Omics", "value": "cancer_omics" },
                    { "label": "Screening & Detection", "value": "screening_detection" },
                    { "label": "Cancer Health Disparities", "value": "cancer_health_disparities" },
                    { "label": "Cancer & Public Health", "value": "cancer_public_health" },
                    { "label": "Cancer Statistics", "value": "cancer_statistics" },
                    { "label": "Cancer Diagnosis", "value": "cancer_diagnosis" },
                    { "label": "Causes of Cancer", "value": "causes_of_cancer" },
                    { "label": "Cancer Survivorship", "value": "cancer_survivorship" },
                    { "label": "Cancer Prevention", "value": "cancer_prevention" }
                ],
                toolTypes: [
                    { "label": "Lab Tools", "value": "lab_tools" },
                    { "label": "Lab Tools - Reagents", "value": "lab_tools/reagents" },
                    { "label": "Lab Tools - Biospecimen", "value": "lab_tools/biospecimen" },
                    { "label": "Lab Tools - Assays", "value": "lab_tools/assays" },
                    { "label": "Lab Tools - Cell Lines", "value": "lab_tools/cell_lines" },
                    { "label": "Lab Tools - Protocols", "value": "lab_tools/protocols" },
                    { "label": "Lab Tools - Animal Models", "value": "lab_tools/animal_models" },
                    { "label": "Lab Tools - Plant Samples", "value": "lab_tools/plant_samples" },
                    { "label": "Lab Tools - Vectors", "value": "lab_tools/vectors" },
                    { "label": "Lab Tools - Compounds", "value": "lab_tools/compounds" },
                    { "label": "Community Research Tools", "value": "community_research_tools" },
                    { "label": "Community Research Tools - Questionnaire", "value": "community_research_tools/questionnaire" },
                    { "label": "Community Research Tools - Screener", "value": "community_research_tools/screener" },
                    { "label": "Community Research Tools - Survey", "value": "community_research_tools/survey" },
                    { "label": "Clinical Research Tools", "value": "clinical_research_tools" },
                    { "label": "Clinical Research Tools - CTCAE", "value": "clinical_research_tools/ctcae" },
                    { "label": "Clinical Research Tools - Consent Forms", "value": "clinical_research_tools/consent_forms" },
                    { "label": "Clinical Research Tools - Guidelines/Protocols", "value": "clinical_research_tools/guidelines_protocols" },
                    { "label": "Clinical Research Tools - Policies", "value": "clinical_research_tools/policies" },
                    { "label": "Datasets & Databases", "value": "datasets_databases" },
                    { "label": "Datasets & Databases - Clinical Data", "value": "datasets_databases/clinical_data" },
                    { "label": "Datasets & Databases - Imaging", "value": "datasets_databases/imaging" },
                    { "label": "Datasets & Databases - Genomic Datasets", "value": "datasets_databases/genomic_datasets" },
                    { "label": "Datasets & Databases - Epidemiologic Data", "value": "datasets_databases/epidemiologic_data" },
                    { "label": "Datasets & Databases - Patient Registries", "value": "datasets_databases/patient_registries" },
                    { "label": "Datasets & Databases - Biological Networks", "value": "datasets_databases/biological_networks" },
                    { "label": "Analysis Tools", "value": "analysis_tools" },
                    { "label": "Analysis Tools - Genomic Analysis", "value": "analysis_tools/genomic_analysis" },
                    { "label": "Analysis Tools - Data Visualization", "value": "analysis_tools/data_visualization" },
                    { "label": "Analysis Tools - Imaging Analysis", "value": "analysis_tools/imaging_analysis" },
                    { "label": "Analysis Tools - R Software", "value": "analysis_tools/r_software" },
                    { "label": "Analysis Tools - Modeling", "value": "analysis_tools/modeling" },
                    { "label": "Analysis Tools - Natural Language Processing", "value": "analysis_tools/natural_language_processing" },
                    { "label": "Analysis Tools - Statistical Software", "value": "analysis_tools/statistical_software" },
                    { "label": "Networks/Consortiums", "value": "networks_consortiums" },
                    { "label": "Terminology", "value": "terminology" },
                    { "label": "Training Resources", "value": "training_resources" }
                ]
            });

        })

        it('throws an error when an error occurs while loading', async () => {
            let scope = nock('https://example.org')
            .get("/bryanpizzillo/r4rcontent/master/data/docs.json")
            .replyWithFile(200, path.join(TEST_FILE_PATH, 'docs.json'))
            .get("/bryanpizzillo/r4rcontent/master/data/researchAreas.json")
            .replyWithFile(200, path.join(TEST_FILE_PATH, 'researchAreas.json'))
            .get("/bryanpizzillo/r4rcontent/master/data/researchTypes.json")
            .reply(404)
            .get("/bryanpizzillo/r4rcontent/master/data/toolTypes.json")
            .replyWithFile(200, path.join(TEST_FILE_PATH, 'badData.json'))

            const transformer = new NetlifyMdResourceTransformer(
                logger,
                axios.create({}),
                VALID_CONFIG
            );

            expect.assertions(1);
            try {
                await transformer.begin();
            } catch(err) {
                //We don't care about the type of error as long as one was thrown
                expect(err).toBeTruthy();
            }

        })


    })

    //End does nothing now, so this is just a test to call it.
    describe('end', async() => {
        it('ends correctly', async () => {
            const transformer = new NetlifyMdResourceTransformer(
                logger,
                axios.create({}),
                VALID_CONFIG
            );
            
            expect.assertions(0);
            await transformer.end();
        })
    })

    describe('transform', async() => {

        it('transforms the resource', async () => {

            let scope = nock('https://example.org')
            .get("/bryanpizzillo/r4rcontent/master/data/docs.json")
            .replyWithFile(200, path.join(TEST_FILE_PATH, 'docs.json'))
            .get("/bryanpizzillo/r4rcontent/master/data/researchAreas.json")
            .replyWithFile(200, path.join(TEST_FILE_PATH, 'researchAreas.json'))
            .get("/bryanpizzillo/r4rcontent/master/data/researchTypes.json")
            .replyWithFile(200, path.join(TEST_FILE_PATH, 'researchTypes.json'))
            .get("/bryanpizzillo/r4rcontent/master/data/toolTypes.json")
            .replyWithFile(200, path.join(TEST_FILE_PATH, 'toolTypes.json'))

            //Load our MD file.
            const rawResource = await readFileAsync(path.join(TEST_FILE_PATH, '..', 'full_item.md'));

            //Load expected object
            const expResource = require('../../../test/data/full_item.expected.json');

            const transformer = new NetlifyMdResourceTransformer(
                logger,
                axios.create({}),
                VALID_CONFIG
            );

            await transformer.begin();

            const transformed = await transformer.transform(rawResource); 
            
            expect(transformed).toBe(expResource);
        })

    })
})

