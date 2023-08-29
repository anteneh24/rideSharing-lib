
const elasticsearch = require("elasticsearch")


const esClient = elasticsearch.Client({
    host: "http://172.16.0.56:9200",
})

module.exports={esClient};