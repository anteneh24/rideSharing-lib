

var polly = require("./polly");
// import esClient from "./connection";

const ALL_USERS_INDEX="allusers";
const DRIVERS_INDEX="drivers";
const PASSENGER_INDEX="passenger"
let connection = require('./connection');
//ALLUSERS SERVICES
const listAllUsers= async function lilistAllUsersstall(from, size){
    const respData={};
    async function listall_()
    {
        const response = await connection.esClient.search({
            index: ALL_USERS_INDEX,
                body: {
                    from: from,
                    size: size,
                    query: {
                        match_all: {}
                    }
                }
        });
        console.log(response);
        return response;//.hits.hits
    }
    return listall_();
}
const createAllUsers= async function createAllUsers(req){
    async function create()
    {
        console.error(req.body)
        const response = await connection.esClient.index({
            index: 'allusers',
            body: {
                // "id": req.body.id,
                "userId": req.body.userId,
                "type": req.body.type,
                "socket": req.body.socket,
                "name": req.body.name,
                "image": req.body.image,
            }
        });
        return response;
    }
    return create();
}

const deleteByUserIdAllUsers = async function deleteByUserIdAllUsers(searchText){
    async function call()
    {
        const response = await connection. esClient.deleteByQuery({
            index: ALL_USERS_INDEX,
            body: {
                query: {
                    match: {"userId": searchText}
                }
            }
        })
        return response;
    }
    return call();
}

const updateSocketByUserIdAllUsers= async function updateSocketByUserIdAllUsers(userId,req){
    async function call(userId, req)
    {
        const response = await connection.esClient.updateByQuery({
            index: ALL_USERS_INDEX,
            body: {
                query: {
                    match: {"userId": userId}
                },
                "script": { "inline": "ctx._source.socket = '"+req.body.socket+"'"}
            }
        })
        return response;
    }
    return call(userId,req);
}
const findByIdAllUsers= async function findByIdAllUsers(searchId){
    async function call()
    {
        const response = await connection.esClient.get({
            index: ALL_USERS_INDEX,
            id: searchId.trim()
        })
        return response;
    }
    return call();
}

const searchByNameAllUsers= async function searchByNameAllUsers(searchText){
    async function call()
    {
        const response = await connection. esClient.search({
            index: ALL_USERS_INDEX,
            body: {
                query: {
                    match: {"name": searchText.trim()}
                }
            }
        })
        return response;
    }
    return call();
}
// update 1 this
const searchBySocketAllUsers = async function searchBySocketAllUsers(searchText){
    async function call()
    {
        const response = await connection. esClient.search({
            index: ALL_USERS_INDEX,
            body: {
                query: {
                    match: {"socket": searchText.trim()}
                }
            }
        })
        return response;
    }
    return call();
}

//DRIVERS SERVICES
const listDrivers =async function listDrivers(from, size){
    async function call()
    {
        const response = await connection.esClient.search({
            index: DRIVERS_INDEX,
                body: {
                    from: from,
                    size: size,
                    query: {
                        match_all: {}
                    }
                }
        });
        // console.log(response);
        return response;//.hits.hits
    }
    return call();
}
const createDrivers= async function createDrivers(req){
    async function create()
    {
            const response = await connection.esClient.index({
            index: DRIVERS_INDEX,
            body: {
                // "id": req.body.id,
                "userId": req.body.userId,
                "lat": req.body.lat,
                "lng": req.body.lng,
                "tlat": req.body.trueValue.lat,
                "tlng": req.body.trueValue.lng,
                "bearing": req.body.bearing,
                "type": req.body.type,
                "socket": req.body.socket,
                "status": req.body.status
            }
        });
        return response;
    }
    return create();
}

const updateByUserIdDrivers= async function updateByUserIdDrivers(userId,req){

    async function call(userId, req)
    {
        const response = await connection.esClient.updateByQuery({
            index: DRIVERS_INDEX,
            body: {
                query: {
                    match: {"userId": userId}
                },
                "script": { "inline": "ctx._source.lat = "+req.body.lat+"; ctx._source.lng = "+req.body.lng+"; ctx._source.tlat = "+req.body.trueValue.lat+"; ctx._source.tlng = "+req.body.trueValue.lng+"; ctx._source.bearing = "+req.body.bearing+";"}
            }
        })
        return response;
    }
    return call(userId,req);
}

const updateByUserIdDriversStatus= async function updateByUserIdDriversStatus(userId,req){

    async function call(userId, req)
    {
        const response = await connection.esClient.updateByQuery({
            index: DRIVERS_INDEX,
            body: {
                query: {
                    match: {"userId": userId}
                },
                "script": { "inline": "ctx._source.lat = "+req.body.lat+"; ctx._source.lng = "+req.body.lng+"; ctx._source.tlat = "+req.body.trueValue.lat+"; ctx._source.tlng = "+req.body.trueValue.lng+"; ctx._source.bearing = "+req.body.bearing+";"}
            }
        })
        return response;
    }
    return call(userId,req);
}

const deleteByUserIdDrivers= async function deleteByUserIdDrivers(searchText){
    async function call()
    {
        const response = await connection. esClient.deleteByQuery({
            index: DRIVERS_INDEX,
            body: {
                query: {
                    match: {"userId": searchText}
                }
            }
        })
        return response;
    }
    return call();
}
const findByIdDriver= async function findByIdDriver(searchId){
    async function call()
    {
        const response = await connection.esClient.get({
            index: DRIVERS_INDEX,
            id: searchId.trim()
        })
        return response;
    }
    return call();
}

const updateStatusByUserIdDrivers= async function updateStatusByUserIdDrivers(userId,req){
    async function call(userId, req)
    {
        const response = await connection.esClient.updateByQuery({
            index: DRIVERS_INDEX,
            body: {
                query: {
                    match: {"userId": userId}
                },
                "script": { "inline": "ctx._source.status = '"+req.body.status+"'"}
            }
        })
        return response;
    }
    return call(userId,req);
}

async function searchByUserIdDriver(searchText){
    console.log("userid "+searchText);
    async function call()
    {
        const response = await connection. esClient.search({
            index: DRIVERS_INDEX,
            body: {
                query: {
                    match: {"userId": searchText}
                }
            }
        })
        return response;
    }
    return call();
}



const searchBySocketDriver= async function searchBySocketDriver(socket){
    async function call()
    {
        const response = await connection. esClient.search({
            index: DRIVERS_INDEX,
            body: {
                query: {
                    match: {"socket": socket}
                }
            }
        })
        return response;
    }
    return call();
}
function getCorrectText(text){
    if (text.length > 7) {
        text = text.substring(0,7);

    }else{
        for (var i = 0; i < 8; i++) {
            if (text.length <=i) {
                text = text+'0';
            }
        };
    }
    return text
}

const searchByLocationDriver= async function searchByLocationDriver(req){
    const lat = parseFloat(req.body.lat);
    const lng = parseFloat(req.body.lng);
    var lat1 = getCorrectText(((lat +0.01)+'').replace('.',''));
    var lng1 = getCorrectText(((lng + 0.01)+'').replace('.',''));
    var lat2 = getCorrectText(((lat - 0.01)+'').replace('.',''));
    var lng2 = getCorrectText(((lng - 0.01)+'').replace('.',''));

    async function call()
    {
        const response = await connection. esClient.search({
            index: DRIVERS_INDEX,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                range: {
                                    "lat": {
                                        gte: lat2,
                                        lte: lat1
                                    }
                                }
                            },
                            {
                                range: {
                                    "lng": {
                                        gte: lng2,
                                        lte: lng1
                                    }
                                }
                            },{
                                match: { "status": "online"}
                            }
                        ]
                    }
                }
            }
        })
        return response;
    }
    return call();
}


const updateSocketByUserIdDrivers= async function updateSocketByUserIdDrivers(userId,req){
    async function call(userId, req)
    {
        const response = await connection.esClient.updateByQuery({
            index: DRIVERS_INDEX,
            body: {
                query: {
                    match: {"userId": userId}
                },
                "script": { "inline": "ctx._source.socket = '"+req.body.socket+"'"}
            }
        })
        return response;
    }
    return call(userId,req);
}
//PASSENGER SERVICES

const createPassenger= async function createPassenger(req){
    async function create()
    {
            const response = await connection.esClient.index({
            index: 'passenger',
            body: {
                // "id": req.body.id,
                "lat": req.body.lat,
                "lng": req.body.lng,
                "tlat": req.body.trueValue.lat,
                "tlng": req.body.trueValue.lng,
                "status": req.body.status,
                "socket": req.body.socket,
                "userId": req.body.userId,
                "driverId": req.body.driverId
            }
        });
        return response;
    }
    return create();
}
async function searchByUserIdPassenger(searchText){
    async function call()
    {
        const response = await connection. esClient.search({
            index: PASSENGER_INDEX,
            body: {
                query: {
                    match: {"userId": searchText}
                }
            }
        })
        return response;
    }
    return call();
}

// Update 2
const searchByDriverIdPassenger= async function searchByDriverIdPassenger(searchText){
    console.log("driver id "+searchText);
    async function call()
    {
        const response = await connection. esClient.search({
            index: PASSENGER_INDEX,
            body: {
                query: {
                    match: {"driverId": searchText}
                }
            }
        })
        return response;
    }
    return call();
}

const searchBySocketPassenger= async function searchBySocketPassenger(searchText){
    async function call()
    {
        const response = await connection. esClient.search({
            index: PASSENGER_INDEX,
            body: {
                query: {
                    match: {"socket": searchText}
                }
            }
        })
        return response;
    }
    return call();
}

const searchByLocationPassenger= async function searchByLocationPassenger(req){
    const lat = parseFloat(req.body.trueValue.lat);
    const lng = parseFloat(req.body.trueValue.lng);
    var lat1 = getCorrectText(((lat +0.005)+'').replace('.',''));
    var lng1 = getCorrectText(((lng + 0.005)+'').replace('.',''));
    var lat2 = getCorrectText(((lat - 0.005)+'').replace('.',''));
    var lng2 = getCorrectText(((lng - 0.005)+'').replace('.',''));
    async function call()
    {
        const response = await connection. esClient.search({
            index: PASSENGER_INDEX,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                range: {
                                    "lat": {
                                        gte: lat2,
                                        lte: lat1
                                    }
                                }
                            },
                            {
                                range: {
                                    "lng": {
                                        gte: lng2,
                                        lte: lng1
                                    }
                                }
                            },
                            {
                                match: { "status": "online"}
                            }
                        ]
                    }
                }
            }
        })
        return response;
    }
    return call();
}


const deleteByUserIdPassenger= async function deleteByUserIdPassenger(searchText){
    async function call()
    {
        const response = await connection. esClient.deleteByQuery({
            index: PASSENGER_INDEX,
            body: {
                query: {
                    match: {"userId": searchText}
                }
            }
        })
        return response;
    }
    return call();
}

const updateByUserIdPassenger= async function updateByUserIdPassenger(userId,req){


    async function call(userId, req)
    {
        const response = await connection.esClient.updateByQuery({
            index: PASSENGER_INDEX,
            body: {
                query: {
                    match: {"userId": userId}
                },
                "script": { "inline": "ctx._source.lat = "+req.body.lat+"; ctx._source.lng = "+req.body.lng+"; ctx._source.tlat = "+req.body.trueValue.lat+"; ctx._source.tlng = "+req.body.trueValue.lng+"; ctx._source.status='"+req.body.status+"';"}
            }
        })
        return response;
    }
    return call(userId,req);
}


const updateByUserIdPassengerStatus= async function updateByUserIdPassenger(userId,req){


    async function call(userId, req)
    {
        const response = await connection.esClient.updateByQuery({
            index: PASSENGER_INDEX,
            body: {
                query: {
                    match: {"userId": userId}
                },
                "script": { "inline": "ctx._source.status='"+req.status+"'"}

            }
        })
        return response;
    }
    return call(userId,req);
}

//update 3 "script": { "inline": "ctx._source.lat = "+req.body.lat+"; ctx._source.lng = "+req.body.lng+"; ctx._source.status = "+req.body.status+";"}

const updateDriverIdByUserIdPassenger= async function updateDriverIdByUserIdPassenger(userId,req){
    console.log(userId+" this "+JSON.stringify(req))
    async function call(userId, req)
    {
        const response = await connection.esClient.updateByQuery({
            index: PASSENGER_INDEX,
            body: {
                query: {
                    match: {"userId": userId}
                },
                "script": { "inline": "ctx._source.driverId = "+req.body.userId+"; ctx._source.status='"+req.body.status+"';"}
            }
        })
        return response;
    }
    return call(userId,req);
}

const updateStatusByUserIdPassenger= async function updateStatusByUserIdPassenger(userId,req){

    async function call(userId, req)
    {
        const response = await connection.esClient.updateByQuery({
            index: PASSENGER_INDEX,
            body: {
                query: {
                    match: {"userId": userId}
                },
                "script": { "inline": "ctx._source.status = '"+req.body.status+"'"}
            }
        })
        return response;
    }
    return call(userId,req);
}

const updateTripIdByUserIdPassenger= async function updateTripIdByUserIdPassenger(userId,req){
    async function call(userId, req)
    {
        const response = await connection.esClient.updateByQuery({
            index: PASSENGER_INDEX,
            body: {
                query: {
                    match: {"userId": userId}
                },
                "script": { "inline": "ctx._source.tripId = "+req.body.tripId+""}
            }
        })
        return response;
    }
    return call(userId,req);
}

const updateSocketByUserIdPassenger= async function updateSocketByUserIdPassenger(userId,req){
    async function call(userId, req)
    {
        const response = await connection.esClient.updateByQuery({
            index: PASSENGER_INDEX,
            body: {
                query: {
                    match: {"userId": userId}
                },
                "script": { "inline": "ctx._source.socket = '"+req.body.socket+"'"}
            }
        })
        return response;
    }
    return call(userId,req);
}

const findByIdPassenger= async function findByIdPassenger(searchId){
    async function call()
    {
        const response = await connection.esClient.get({
            index: PASSENGER_INDEX,
            id: searchId.trim()
        })
        return response;
    }
    return call();
}

const listPassenger =async function listPassenger(from, size){
    async function call()
    {
        const response = await connection.esClient.search({
            index: PASSENGER_INDEX,
                body: {
                    from: from,
                    size: size,
                    query: {
                        match_all: {}
                    }
                }
        });
        // console.log(response);
        return response;//.hits.hits
    }
    return call();
}

//create a function to get yeasterday date
const getYesterdayDate = function getYesterdayDate() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
}

//ELASTICSEARCH DATABASE SCHEMA AND INDEX SETUP
const createAllIndex = async function createAllIndex(){
    await connection.esClient.indices.exists({index: 'allusers'}, (err, res, status) => {
        if (res) {
            console.log('allusers index already exists');
        } else {
            createAlluserIndex();
        } 
    });

    await connection.esClient.indices.exists({index: DRIVERS_INDEX}, (err, res, status) => {
        if (res) {
            console.log('drivers index already exists');
        } else {
            createDriversIndex();
        } 
    });

    await connection.esClient.indices.exists({index: 'passenger'}, (err, res, status) => {
        if (res) {
            console.log('passenger index already exists');
        } else {
            createPassengerIndex();
        } 
    });
}

const createAlluserIndex=async function putMappingAllusers() {
    console.log("Creating Mapping index");
    connection.esClient.indices.putMapping({
        index: 'allusers',
        include_type_name:true,
        type: 'staff',
        body: {
        properties: { 
             id: { type: 'text' },
            userId: { type: 'integer' },
            type: { type: 'text' },
            socket: { type: 'text' },
            name: { type: 'text' },
            image: { type: 'text' } }
        }
    }, (err,resp, status) => {
        if (err) {
          console.error(err, status);
        }
        else {
            console.log('Successfully Created allusers Index', status, resp);
        }
    });
}

const createDriversIndex=async function putMappingDrivers() {
    console.log("Creating Mapping index");
    connection.esClient.indices.putMapping({
        index: DRIVERS_INDEX,
        include_type_name:true,
        type: 'staff',
        body: {
        properties: { 
             id: { type: 'text' },
            userId: { type: 'integer' },
            lat: { type: 'long' },
            lng: { type: 'long' },
            bearing: { type: 'text' },
            status: { type: 'keyword' },
            type: { type: 'text' } ,
            socket: { type: 'text' } 
        }
        }
    }, (err,resp, status) => {
        if (err) {
          console.error(err, status);
        }
        else {
            console.log('Successfully Created drivers Index', status, resp);
        }
    });
}

const createPassengerIndex=async function putMappingPassenger() {
    console.log("Creating Mapping index");
    connection.esClient.indices.putMapping({
        index: 'passenger',
        include_type_name:true,
        type: 'staff',
        body: {
        properties: { 
             id: { type: 'text' },
            lat: { type: 'long' },
            lng: { type: 'long' },
            status: { type: 'keyword' },
            socket: { type: 'text' },
            userId: { type: 'integer' },
            driverId: { type: 'integer' } }
        }
    }, (err,resp, status) => {
        if (err) {
          console.error(err, status);
        }
        else {
            console.log('Successfully Created passenger Index', status, resp);
        }
    });
}


module.exports={
    updateSocketByUserIdPassenger,updateTripIdByUserIdPassenger,updateStatusByUserIdPassenger,updateByUserIdPassenger,createPassenger, updateByUserIdPassenger,deleteByUserIdPassenger,findByIdPassenger, listPassenger,searchByUserIdPassenger, 
    searchBySocketDriver,searchByLocationDriver,updateSocketByUserIdDrivers,updateStatusByUserIdDrivers,updateByUserIdDrivers,deleteByUserIdDrivers,createDrivers,findByIdDriver,listDrivers, searchByUserIdDriver, 
    searchBySocketPassenger,searchByLocationPassenger,updateSocketByUserIdAllUsers,listAllUsers,createAllUsers,findByIdAllUsers,deleteByUserIdAllUsers ,searchByNameAllUsers,
    //updates
    searchBySocketAllUsers,searchByDriverIdPassenger,updateDriverIdByUserIdPassenger,getCorrectText,updateByUserIdPassengerStatus,

     createAllIndex};
