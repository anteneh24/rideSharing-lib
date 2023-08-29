const findPerfectRoute= ( requestRoute, test)=>{
    var distance = 0,startDistance =0;
    var match = false,matchTest = false;
    var count = 0;
    var matchStart = 0,matchStartTest =0;
    var routeDifference = [];
    requestRoute.routes[0].legs[0].steps.map((leg,index) =>{
        test.routes[0].legs[0].steps.map((testLeg,testIndex) =>{
        
            if(leg.end_location.lng === testLeg.end_location.lng && leg.start_location.lat === testLeg.start_location.lat &&
                leg.end_location.lat === testLeg.end_location.lat && leg.start_location.lng === testLeg.start_location.lng){
                    distance+=leg.distance.value;  
                    match = true; 
                    count++;    
                    matchTest = true;         
                
            }
            if(!matchTest){
                matchStartTest = testIndex;
                startDistance = test.routes[0].legs[0].steps[testIndex].distance.value;
            }
            
        })
        if(!match){
            matchStart = index;
        }
        console.log(count +" "+ matchStart)

    })
    console.log(distance)

    //var encoded = "ox_v@edvkFLfALdAJr@NhAj@`D@Df@dCRjAfAnDd@nATj@^|@r@jBFJPb@`@x@FNd@nAl@|Ar@dBp@~AJTLPl@nA~@zBBFZv@^`APf@jArCDNN`@BFJZLh@HZF`@BPBZBz@@PBnCAbA?j@Ez@Ev@G|@MtBGfAIbCCv@UxESrDEfAIjB?@Cb@Ab@CfACd@E`BAp@EhAClACp@?FAREh@En@ANGv@?DI|@SnBIdAGdACRCZ";
    //var encodedSecond = "ox_v@edvkFLfALdAJr@NhAj@`D@Df@dCRjAfAnDd@nATj@^|@r@jBFJPb@`@x@FNd@nAl@|Ar@dBp@~AJTLPl@nA~@zBBFZv@^`APf@jArCDNN`@BFJZLh@HZF`@BPBZBz@@PBnCAbA?j@Ez@Ev@G|@MtBGfAIbCCv@UxESrDEfAIjB?@Cb@Ab@CfACd@E`BAp@EhAClACp@"
    var encoded="";
    var encodedSecond ="";
    if(requestRoute.routes[0].legs[0].steps[(matchStart+count)].distance.value>test.routes[0].legs[0].steps[(matchStartTest+count)].distance.value){
        encoded = requestRoute.routes[0].legs[0].steps[(matchStart+count)].polyline.points;
        encodedSecond = test.routes[0].legs[0].steps[(matchStartTest+count)].polyline.points;
        distance += test.routes[0].legs[0].steps[(matchStartTest+count)].distance.value;
    }else{
        encoded = test.routes[0].legs[0].steps[(matchStart+count)].polyline.points;
        encodedSecond = requestRoute.routes[0].legs[0].steps[(matchStartTest+count)].polyline.points;
        console.log(test.routes[0].legs[0].steps[(matchStartTest+count)].distance.value + " "+
        requestRoute.routes[0].legs[0].steps[(matchStartTest+count)].distance.value)
        distance += requestRoute.routes[0].legs[0].steps[(matchStartTest+count)].distance.value;
    }
    console.log(distance)
    var endPointDifference = 0;
    var testDifference = 0;
    var routeDifference =0;
    test.routes[0].legs[0].steps.map((row,index)=>{
        if(index>(matchStartTest+count)){
        testDifference += test.routes[0].legs[0].steps[index].distance.value;
        console.log(index);
        }
    })
    requestRoute.routes[0].legs[0].steps.map((row,index)=>{
        if(index>(matchStart+count)){
        routeDifference += requestRoute.routes[0].legs[0].steps[index].distance.value;
        console.log(index);
        }
    })
    if(testDifference>routeDifference){
        endPointDifference = routeDifference;
    }else{
        endPointDifference = testDifference;
    }
    console.log(testDifference + " "+ routeDifference)
    var matchingFactor =  distance / requestRoute.routes[0].legs[0].distance.value;
    matchingFactor = matchingFactor.toFixed(3)*100;
    endPointDifference = (endPointDifference/1000).toFixed(2);
    startDistance = (startDistance/1000).toFixed(2);
    console.log("matching Probablity: "+matchingFactor+" \n end Point distance: "+endPointDifference+" Km\n starting distance: "+startDistance+" Km");
    var decoded = decodePoly(encoded);
    var decodedSecond = decodePoly(encodedSecond);
    var difference = decoded.filter(x => !decodedSecond.includes(x))
    console.log(decoded.at(decoded.indexOf(difference[0])-1))
    function decodePoly(encoded){
        var poly = [];
        var index = 0; 
        var len= encoded.length;
        var lat = 0,lng = 0;
        while (index < len) {
            var b=0,shift = 0,result = 0;
            do {
                b = encoded.charCodeAt(index++)-63;
                result |= (b & 0x1f) << shift;
                shift +=5;
            } while (b >= 0x20);
            var dlat = ((result & 1) != 0 ? ~(result >> 1) :(result >> 1));
            lat +=dlat;
            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++)-63;
                result |= (b & 0x1f) << shift;
                shift +=5;

            } while (b >= 0x20);
            var dlng = ((result & 1) != 0 ? ~(result >> 1) :(result >> 1));
            lng +=dlng;
            tlat = lat / 1E5;
            tlng = lng / 1E5;
            var row = "";
            row = tlat+","+tlng;
            poly.push(row); 
        }
        return poly;
    }
}

module.exports ={findPerfectRoute}