
const elasticsearch = require("elasticsearch")
const constants = require('../constants/constants')


const esClient = elasticsearch.Client({
    host: constants.elasticIp,
})

module.exports={esClient};