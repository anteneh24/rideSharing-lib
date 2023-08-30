# rideSharing-lib

## Driver
Here's a breakdown of the events and their corresponding actions:

#### Event: online
Action: Connect the driver to the backend server.

#### Event: offline
Action: Disconnect the driver from the backend server.

#### Event: userLocation
Action: Update the driver's current location by sending the location data to the server.

#### Event: accept
Action: Accept a trip request by sending the necessary information to the server.

#### Event: tripStarted
Action: Notify the passenger that the trip has started by sending the relevant information to the server.

#### Event: sendRoute
Action: Send the route to the passenger's phone by sending the route details and other information to the server.

#### Event: decline
Action: Decline a trip request by sending the cancellation details to the server.

#### Event: routeToRider
Action: Update the driver's current position while on the way to the passenger by sending the updated location to the server.

#### Event: routeToDestination
Action: Update the driver's current position while on the way to the destination by sending the updated location to the server.

#### Event: finish
Action: Update the server that the trip has finished by sending the trip price information.

#### Event: goOffline
Action: Update the driver's status to not working by notifying the server.

#### Event: alert
Action: Send an alert message to the server.
