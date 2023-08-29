var constants = require('./constants/constants')
var express = require('express');
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http);
var Pool = require('mysql');
var axios = require("axios");
var es = require('./elasticservices');
var polly = require("./polly");
const dotEnv = require('dotenv')
dotEnv.config();

const mapKey = process.env.MAP_API_KEY;
var userId;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
var server = http.listen(constants.serverPort, constants.serverIp | 'localhost', function () {
    console.log("connected");
});
app.use(express.static('public'));


var db = Pool.createConnection({
  user: constants.user,
  host: constants.host,
  database: constants.database,
  password: constants.password,
  port: constants.port,
});
db.connect((err,client,done) =>{
    console.log(done+" "+client+" done status");
    
});

io.on('connection', function (socket) {
    console.log("connected user " + socket.id);
    var socketId = socket.id;
    io.to(socketId).emit("online","online");
    socket.on('id', data => {
        userId = data;
        console.log("user id" + JSON.stringify(userId));
        var body ={};
        data.socket = socket.id
        data.status = "online";
        body.body = data;
        es.createAllUsers(body).then(res =>{ 
            console.log(res);
            if (res.result === "created"){
                userOnline(socket.id,data)
                io.to(socketId).emit("canUpdate","yes");
            }else{
                io.to(socketId).emit("online","online");
            }
        })
    })

    //{"userId":"","lat":"","lng":"","bearing":"","type":""}
    socket.on("userLocation",data=>{
            //console.log(JSON.stringify(data))                    
        updateUserLocation(socket,data);
    })

    socket.on("singleOnRequest",data=>{
        requestRide(socket,data);
    })

    socket.on("sendRoute",data =>{
        console.log(JSON.stringify(data))
        es.searchByUserIdPassenger("1").then(result => {
                console.log("sendRoute "+JSON.stringify(result))
                var passanger = result.hits.hits[0]._source;
                io.to(passanger.socket).emit("tripAccept",data);
                //io.to(socket.id).emit("accepted","accepted"); 
            })
    })

    socket.on("tripAccept",data=>{
        console.log("socket "+JSON.stringify(data))
        var body ={};
        var trueValue ={};
        trueValue.lat = data.lat;
        trueValue.lng = data.lng;
        data.trueValue = trueValue;
        data.status = "onTrip"
        body.body = data; 
        es.updateDriverIdByUserIdPassenger(data.id,body);
        console.log("update passenger"); 
        es.updateStatusByUserIdDrivers(data.userId,body).then(result =>{
            
            console.log("driver updated"+JSON.stringify(result)) 
            es.searchByUserIdPassenger(data.id).then(result => {
                console.log(JSON.stringify(result))
                var passanger = result.hits.hits[0]._source;
                io.to(passanger.socket).emit("tripAccept",data);
                io.to(socket.id).emit("accepted","accepted"); 
            })
        })
    })

    socket.on("tripStarted",data=>{
        console.log("trip started "+JSON.stringify(data));
        es.searchByDriverIdPassenger(data.userId).then(result => {
            console.log("trip strated "+JSON.stringify(result))
            var passanger = result.hits.hits[0]._source;
            io.to(passanger.socket).emit("tripStarted",data);
        })
    })
    socket.on("tripPrice",async data=>{
        console.log("tripPrice"+ JSON.stringify(data));
        const tript = await db.query(`SELECT * FROM trip where id = ?`,[data.tripId]);
        console.log(tript)
        console.log(JSON.stringify(tript));
        totalPrice = data.actualDistance * 10;
        data.price = totalPrice;
        const tripUpdate = await db.query(`UPDATE trip SET actualPrice = ?,actualDistanceInKm=?,actualDestinationPoint=?,tripEndingTime=NOW() WHERE id=?`,
            [data.price,data.actualDistance,data.lat+","+data.lng,data.tripId]);
        await es.searchByUserIdPassenger(outcome.customer).then(result =>{
            var passanger = result.hits.hits[0]._source;
            io.to(passanger.socket).emit("tripFinish",data);
        })
        await es.searchByUserIdDriver(outcome.driver).then(result =>{
            var driver = result.hits.hits[0]._source;
            io.to(driver.socket).emit("tripFinish",data);
        })
    });

    socket.emit('id', socket.id);
    //{"userId":"",message:"",roomId:""}

    
    

    socket.on('disconnect',data=>{
         console.log("user id disconnected "+socketId);
         es.searchBySocketAllUsers(socketId).then(res=>{
            if (res.hits.hits.length>0){
                var userData = res.hits.hits[0]._source;
                es.deleteByUserIdAllUsers(userData.userId).then(result =>{
                    if (result) 
                        userOffline(socketId,userData);
                })
            }
         })
   })


});

userOffline = function(socketId,data){
    data.status = "offline"
    console.log("this gh"+userId+" "+JSON.stringify(data))

    if (data.type == "driver"){
        es.searchByUserIdDriver(data.userId).then(res =>{
            console.log(JSON.stringify(res))
            var driverData = res.hits.hits[0]._source;
            if (!res.hits.hits[0]._source.status != "onTrip") {
                var body ={};
                body.body = data;
                es.updateStatusByUserIdDrivers(data.userId,body).then(result =>{
                    console.log(JSON.stringify(result))
                    if(result){
                        var body ={};
                        var trueValue ={};
                        trueValue.lat = driverData.tlat;
                        trueValue.lng = driverData.tlng;
                        driverData.trueValue = trueValue;
                        body.body = driverData;
                        es.searchByLocationPassenger(body).then(r =>{
                         console.log(r.hits.hits.length+" this is the start")

                            r.hits.hits.map(passangerResult=>{
                                var passanger = passangerResult._source;
                                io.to(passanger.socket).emit("offline",data);
                            });
                        })
                    }
                })
            }
        })
               
        
    }else{
        es.updateByUserIdPassengerStatus(data.userId,data);
        
        
    }
}

userOnline = function(socketId,data){
    console.log(data)
    var body ={};
    var trueValue ={};
    trueValue.lat = data.lat;
    trueValue.lng = data.lng;
    data.status = "online";
    data.trueValue = trueValue;
    es.deleteByUserIdAllUsers(data.userId); 
    data.lat = es.getCorrectText(data.lat.replace('.',''));
    data.lng = es.getCorrectText(data.lng.replace('.',''));
    body.body = data;
    if (data.type == "driver") {
        es.searchByUserIdDriver(data.userId).then(result =>{
            if (result.hits.hits.length>0 && !result.hits.hits[0]._source.status != "onTrip") {
               es.updateStatusByUserIdDrivers(data.userId,body);
            }else{
               es.createDrivers(body)
            }
        })
        
    }else{
        es.searchByUserIdPassenger(data.userId).then(result =>{
            if (result.hits.hits.length>0) {
                es.updateByUserIdPassengerStatus(data.userId,body);
            }else{
                es.createPassenger(body);
            }
        })
        
        
    }
}

updateUserLocation = function(socket,data){
    var body ={};
    var lat = data.lat;
    var lng = data.lng;
    data.lat = es.getCorrectText(data.lat.replace('.',''));
    data.lng = es.getCorrectText(data.lng.replace('.',''));
    data.status = "online";
    var trueValue ={};
    trueValue.lat = lat;
    trueValue.lng = lng;
    data.trueValue = trueValue;
    body.body = data;
    if(data.type == "driver"){
        es.searchByUserIdDriver(data.userId).then(res =>{          

            if(res.hits.hits.length>0){
                var driver = res.hits.hits[0]._source;
                if (driver.status == "online" || driver.status == "onRequest") {
                    polly()
                    .retry(2)
                    .executeForPromise(function () {
                        return es.updateByUserIdDrivers(data.userId,body);
                    })
                    .then(result =>{
                        console.log("start"+ result)
                        if (result) {
                            es.searchByLocationPassenger(body).then(r =>{
                                console.log(r.hits.hits.length+" this is the start")
                                r.hits.hits.map(passangerResult=>{
                                    var passanger = passangerResult._source;
                                     data.lat = lat;
                                     data.lng = lng; 
                                    io.to(passanger.socket).emit("driverLocation",data);
                                });
                            })
                        }
                    }, function(err) {
                        console.error('Failed trying three times', err)
                        io.to(socket.id).emit("restart","yes");
                    });
                    
                }else{
                    console.log("entered3")
                    data.lat = data.trueValue.lat;
                    data.lng = data.trueValue.lng;
                    es.searchByDriverIdPassenger(data.userId).then(result => {
                        console.log("driver on trip "+JSON.stringify(data)+" "+JSON.stringify(result))
                        if(result.hits.hits.length>0){
                            var passanger = result.hits.hits[0]._source;
                            io.to(passanger.socket).emit("driverLocation",data);
                        }
                    })
                }
            }
        })
        
    }else{

        polly()
        .retry(2)
        .executeForPromise(function () {
            return es.updateByUserIdPassenger(data.userId,body);
        })
        .then(result =>{            
        }, function(err) {
            console.error('Failed trying three times', err)
            io.to(socket.id).emit("restart","yes");
        });
      
    }
 
}

requestRide = function(socket,data){
    data = JSON.parse(data);
    var body ={};
    var trueValue ={};
    trueValue.lat = data.origin.lat;
    trueValue.lng = data.origin.lng;
    data.trueValue = trueValue;
    data.lat = data.origin.lat;
    data.lng = data.origin.lng;
    data.status = "onRequest";
    data.socket = socket.id;

    body.body = data;
    axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${data.origin.lat},${data.origin.lng}&destination=${data.destination.lat},${data.destination.lng}&mode=driving&key=${mapKey}`).
        then( resp => {
            data.routeRecived = resp.data;
            data.placeName = resp.data.routes[0].legs[0].end_address;

            io.to(socket.id).emit("clearVisibility","yes");
            db.query(`INSERT INTO trip (customer,estimatedStartingPoint,estimatedDestinationPoint,estimatedDistanceInKm,tripRequestingTime,startingLocationName,endingLocationName,route,actualStartingPoint,actualDestinationPoint) VALUES (?,?,?,?,NOW(),?,?,?,?,?)`,
            [data.userId,data.origin.lat+","+data.origin.lng,data.destination.lat+","+data.destination.lng,resp.data.routes[0].legs[0].distance.value,resp.data.routes[0].legs[0].start_address,resp.data.routes[0].legs[0].end_address,JSON.stringify(resp.data),data.userId,data.origin.lat+","+data.origin.lng,data.destination.lat+","+data.destination.lng
            ],(fallacy,outcome)=>{
                console.log(JSON.stringify(outcome)) 
                if (outcome) {

                    data.tripId = outcome.insertId;

                     es.searchByLocationDriver(body).then(async result =>{
                        console.log("this "+JSON.stringify(result))
                        if (result.hits.hits.length>0) {
                            console.log("enter1")
                            var driversList = []
                            result.hits.hits.map(driverResult=>{
                                var driver = driverResult._source;
                                driversList.push(driver);
                            });
                    
                            await es.updateByUserIdPassenger(data.userId,body).then(async res =>{
                                var passangerLoction={};
                                console.log("enter2 "+JSON.stringify(res));
                                passangerLoction.lat = data.origin.lat;
                                passangerLoction.lng = data.origin.lng;
                                await getDriverListBasedOnDistanceProxmity(socket,data,passangerLoction,driversList);
                                console.log("console end")
                            })
                        
                        }else{
                            console.log("enter2")
                            // let the compony now the user doesn't have any driver's near by
                            es.updateByUserIdPassenger(data.userId,body).then(res =>{
                                
                            })
                        }
                    })
                }
            })
            
        });
       
    
}

async function getDriverListBasedOnDistanceProxmity(socket,data,passangerLoction,driversList){

    // await get drivers with in a given distance from elasticSearch 
    //await get drivers distance from passanger location
    console.log(driversList.length)
    for(let index=0;index<driversList.length;index++){
        const driver = driversList[index];
        console.log(driver.tlat);
        console.log(JSON.stringify(driver));
        //driver = JSON.parse(driver);
        await getDistance(driver.tlat,driver.tlng,passangerLoction.lat,passangerLoction.lng,driver)

    }
    console.log(driversList)
    //sort them based on distance

    driversList.sort((a,b)=>{
        if(a.distance<b.distance) return -1;
        if (a.distance>b.distance) return 1;
        return 0;
    })
    console.log(driversList);
    let currentDispatch = 0;
    var abort = false;
    for(let index = 0 ; index<driversList.length && !abort ; index++){
        console.log("search passanger"+data.userId);
        await es.searchByUserIdPassenger(data.userId).then( async result =>{
            console.log(JSON.stringify(result))
            //update onRequest
            if (result.hits.hits[0]._source.status == "onRequest") {
                console.log("driver inter id "+driversList[index].userId)
              await  es.searchByUserIdDriver(driversList[index].userId).then(async res =>{
                    
                    var driver = res.hits.hits[0]._source;
                    console.log(JSON.stringify(driver))
                    if (driver.status == "onRequest") {
                        console.log("this is index 1-"+index)

                        if (index < (driversList.length-1)) {
                            moveArrayItemToNewIndex(driversList,index,(index+1))
                        }else{
                            awaitAndSendRequestToDriver(driver,data) 
                        }
                    }else if(driver.status == "onTrip"){
                        //remove from list
                        console.log("this is index 2-"+index)

                    }else{
                        console.log("this is index 3-"+index)
            
                            console.log(JSON.stringify(driver))
                            io.to(driver.socket).emit("tripRequest",data);
                            driver.status = "onRequest";
                            var body ={};
                            body.body = driver;
                           await es.updateStatusByUserIdDrivers(body.body.userId,body);
                            console.log("console "+body.body.userId)
                           await delaySendRequest(driver,data);
                           
                    }
                })
            }else if (result.hits.hits[0]._source.status == "onTrip") {
                abort = true;
            }else{
                abort = true;
            }
        })
        
    }
    console.log("end")
    //
}



async function awaitAndSendRequestToDriver(driver,data){
   await es.searchByUserIdPassenger(data.userId).then(async result =>{
        if (result.hits.hits[0]._source.status == "onRequest") {
          await  es.searchByUserIdDriver(driver.userId).then(result =>{
                if (driver.status == "onRequest") {
                    delayawaitAndSendRequestToDriver(driver,data)
                }else if(driver.status == "onTrip"){
                    //remove from list
                }else{
                    delaySendRequest(driver,data);
                }
            })
        }
    })
    
}


async function delaySendRequest(driver,data){
    await delay(5000)
    .then(()=>{
        io.to(driver.socket).emit("tripRequest",data);
        console.log(driver.userId + " "+driver.socket)
    }).catch(err => console.log(err));
}

async function delayawaitAndSendRequestToDriver(driver,data){
   
    await delay(5000)
    .then(()=>{
        awaitAndSendRequestToDriver(driver,data)
    }).catch(err => console.log(err));
    
}

function delay(timeOut){
    return new Promise((resolve,reject)=>{
        if(isNaN(timeOut))
            reject(new Error("delay requires a valid number"));
        else
            setTimeout(resolve,timeOut);
    })
}

async function getDistance(startLat,startLng,destLat,destLng,driver){
    console.log(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${destLat},${destLng}&mode=driving&key=${mapKey}`)
    await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${destLat},${destLng}&mode=driving&key=${mapKey}`).
    then(resp => {
        driver.distance = resp.data.routes[0].legs[0].distance.value;
        console.log(driver.distance);
    });
}


function moveArrayItemToNewIndex(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; 
};

