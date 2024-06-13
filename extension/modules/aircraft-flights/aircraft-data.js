/** Class representing data for a single aircraft */
class Aircraft {
    id
    type
    registration
    flights
    datetime
    server
    currentFlights = {
        finished: null,
        total: null
    }

    constructor() {
        this.datetime = AES.getServerDate()
    }
}

let aircraftExample = {
    aircraftId: 27623,
    date: "20240612",
    equipment: "Embraer 190 E2",
    finishedFlights: 0,
    flights: [],
    registration: "VH-ADS",
    server: "tristar",
    time: "21:48 UTC",
    totalFlights: 9,
    type: "aircraftFlights"
}
