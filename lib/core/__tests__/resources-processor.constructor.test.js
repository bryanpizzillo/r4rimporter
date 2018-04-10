const ResourcesProcessor = require('../resources-processor');

describe('ResourcesProcessor Constructor Error Handling', async () => {

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

    const badStepInfo = Object.freeze({
        type: {}, 
        config: "string" 
    });

    ////////////
    /// SOURCE
    ///////////
    it('throws on source is null', () => {
        expect(() => {
            new ResourcesProcessor(null, {...goodConfig, source: null });
        }).toThrow("The source configuration is not valid");
    });

    it('throws on source is junk', () => {
        expect(() => {
            new ResourcesProcessor(null, {...goodConfig, source: badStepInfo });
        }).toThrow("The source configuration is not valid");
    });

    ////////////
    // Loader
    ////////////
    it('throws on loader is null', () => {
        expect(() => {
            new ResourcesProcessor(null, {...goodConfig, loader: null});
        }).toThrow("The loader configuration is not valid");
    });

    it('throws on source is junk', () => {
        expect(() => {
            new ResourcesProcessor(null, {...goodConfig, loader: badStepInfo});
        }).toThrow("The loader configuration is not valid");
    });

    ///////////////
    // Transformers
    ///////////////
    it('throws on transformer is null', () => {
        expect(() => {
            new ResourcesProcessor(null, {...goodConfig, transformers: null});
        }).toThrow("The transformers configuration is not valid");
    });

    it('throws on transformer is not array', () => {
        expect(() => {
            new ResourcesProcessor(null, {...goodConfig, transformers: "chicken"});
        }).toThrow("The transformers configuration is not valid");
    });

    it('throws on a single transformer is junk', () => {
        expect(() => {
            new ResourcesProcessor(null, {...goodConfig, transformers: [ badStepInfo ]});
        }).toThrow("The transformers configuration is not valid");
    });

    it('throws on a transformer is junk with good ones', () => {
        expect(() => {
            new ResourcesProcessor(null, {...goodConfig, transformers: [ goodStepInfo, badStepInfo ]});
        }).toThrow("The transformers configuration is not valid");
    });    
})

