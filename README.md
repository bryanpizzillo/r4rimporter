# r4rimporter
Resources for Researchers Prototype Importer

Prerequisites: node 8

# Setup for Development
1. Install Jest globally
`npm install -g jest`
2. Setup local
`npm install`
3. For VSCode development
   1. Install Coverage Gutters extension
   2. Install Jest extension
4. Setup a local configuration
   1. create a local.json file in the <importer_root>/config directory
   2. This file is used to override the default.json options and should look something like:
```
{
    "logging": {
        "level": "debug"
    },
    "pipeline": {
        "source": {
            "type": "lib/sources/github-resource-source",
            "config": {
                "repoUrl": "https://github.com/nciocpl/r4rcontent",
                "resourcesPath": "/resources",
                "authentication": {
                    "type": "token",
                    "token": "<YOUR_AUTH_TOKEN>"
                }
            }
        },
        "loader": {
            "type": "lib/loaders/elastic-resource-loader",
            "config": {
               "eshosts": [ "<THE REAL DEV SERVER>" ],
               //"eshosts": [ "http://localhost:9200" ],
               "daysToKeep": 10,
               "aliasName": "r4r_v1",
               "mappingPath": "es-mappings/mappings.json",
               "settingsPath": "es-mappings/settings.json"
            }
        }
    }
}
```

# To run tests
`npm test`

# To see code coverage
1. Run tests (this generates the code coverage file used by Coverage Gutters)
`npm test`
2. Select a JS file under lib and click the add watch in the bottom bar
3. When asked for the coverage info:
3. Select <projroot>/coverage/lcov.info
See https://marketplace.visualstudio.com/items?itemName=ryanluker.vscode-coverage-gutters for more information.
