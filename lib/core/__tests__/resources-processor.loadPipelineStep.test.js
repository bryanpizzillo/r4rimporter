const ResourcesProcessor = require('../resources-processor');

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

    ////////////////////////
    /// Everything worked ok
    ////////////////////////
    it('loads the step', async() => {
        expect(false).toBeTruthy();
    });

    //////////////////////
    /// Error Cases
    //////////////////////
    describe('throws on', async() => {
        it('inability to load the module', async () => {
            expect(false).toBeTruthy();
        });
    
        it('invalid step configuration', async () => {
            expect(false).toBeTruthy();
        });
    
        it('inability to get an instance of the step', async () => {
            expect(false).toBeTruthy();
        });    
    })

});