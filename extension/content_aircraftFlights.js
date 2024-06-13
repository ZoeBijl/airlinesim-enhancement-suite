"use strict"

// Global variables
let aircraftFlightData, statisticsPanel, infoPanel

window.addEventListener("load", async (event) => {
    infoPanel = new InfoPanel()
    statisticsPanel = new AircraftStatisticsPanel()
    
    /* 
    0. Build layout
    1. Get data
    2. Process data
    3. Display data
    */
    
    aircraftFlightData = getAircraftData()
    
    getStorageData()
    addButtons()
    
    updateAircraftInfoPanel()
    updateStatisticsPanel()
})

/** Class representing the Aircraft Flights tab */
class AircraftFlights {
    #infoPanel
    #statisticsPanel

    constructor() {
        
    }
}

function updateAircraftInfoPanel() {
    infoPanel.aircraftId = aircraftFlightData.aircraftId
    infoPanel.registration = aircraftFlightData.registration
}

function updateStatisticsPanel() {
    // statisticsPanel.profit = 
    statisticsPanel.finishedFlights = aircraftFlightData.finishedFlights
    statisticsPanel.totalFlights = aircraftFlightData.totalFlights
    const savedDaysAgo = AES.getDateDiff(aircraftFlightData.date)
    statisticsPanel.savedDaysAgo = savedDaysAgo
}

function createButtons() {
    const buttons = [
        new ExtractionButton("Extract finished flight profit", {extractFinished: true}),
        new ExtractionButton("Extract all flight profit", {extractAll: true})
    ]
    
    return buttons
}

function addButtons() {
    const buttons = createButtons()
    const listItem = document.createElement("li")
    listItem.className = "btn-group"
    for (const button of buttons) {
        listItem.append(button.element)
    }
    const target = document.querySelector(".as-page-aircraft .as-action-bar li:first-child")
    target.after(listItem)
}

function getAircraftData() {
    const aircraftInfo = getAircraftInfo()
    const flights = getFlights()
    const flightsStats = getFlightsStats(flights)
    const serverDate = AES.getServerDate()
    
    const aircraftData = {
        date: serverDate.date,
        time: serverDate.time,
        server: AES.getServerName(),
        aircraftId: getAircraftId(),
        registration: aircraftInfo.registration,
        equipment: aircraftInfo.equipment,
        type: 'aircraftFlights',
        flights: flights,
        finishedFlights: flightsStats.finishedFlights,
        totalFlights: flightsStats.totalFlights
    }

    return aircraftData
}

async function getStorageData() {
    const storedFlights = await chrome.storage.local.get(getKeys())
    for (const flightKey in storedFlights) {
        const storedFlight = storedFlights[flightKey]
        for (const flight of aircraftFlightData.flights) {
            if (flight.id === storedFlight.flightId.toString()) {
                flight.data = storedFlight
            }
        }
    }
    
    getTotalProfit()
    saveData()
}

function getKeys() {
    const keys = []
    for (const flight of aircraftFlightData.flights) {
        const server = aircraftFlightData.server
        const id = flight.id
        const key = `${server}flightInfo${id}`
    
        keys.push(key)
    }
    return keys
}

function getTotalProfit() {
    let profit = 0;
    let profitFlights = 0;
    aircraftFlightData.flights.forEach(function(value) {
        if (value.status == 'finished' || value.status == 'inflight') {
            if (value.data) {
                profit += value.data.money.CM5.Total;
                profitFlights++;
            }
        }
    });
    aircraftFlightData.profit = profit;
    aircraftFlightData.profitFlights = profitFlights;
    
    statisticsPanel.profit = AES.formatCurrency(profit)
    statisticsPanel.allExtracted = Boolean(aircraftFlightData.finishedFlights === aircraftFlightData.profitFlights)
}

function saveData() {
    let key = aircraftFlightData.server + aircraftFlightData.type + aircraftFlightData.aircraftId;
    let saveData = {
        aircraftId: aircraftFlightData.aircraftId,
        date: aircraftFlightData.date,
        equipment: aircraftFlightData.equipment,
        finishedFlights: aircraftFlightData.finishedFlights,
        profit: aircraftFlightData.profit,
        profitFlights: aircraftFlightData.profitFlights,
        registration: aircraftFlightData.registration,
        server: aircraftFlightData.server,
        time: aircraftFlightData.time,
        totalFlights: aircraftFlightData.totalFlights,
        type: aircraftFlightData.type,
    }
    
    chrome.storage.local.set({
        [key]: saveData }, function() {
        display();
    });
}

function display() {
    displayFlightProfit();
    //action bar
    let btn = $('<button class="btn btn-default"></button>').text('Extract all flight profit/loss');
    let btn1 = $('<button class="btn btn-default"></button>').text('Extract finished flight profit/loss');

    let span = $('<span></span>');
    let li = $('<li></li>').append(btn1, btn, span);
    let actionBar = $('<ul class="as-panel as-action-bar"></ul>').append(li);
    //btn click
    btn.click(function() {
        btn.hide();
        btn1.hide();
        span.addClass('warning').text('Please reload page after all flight info pages open');
        extractAllFlightProfit('all');
    });
    btn1.click(function() {
        btn.hide();
        btn1.hide();
        span.addClass('warning').text('Please reload page after all flight info pages open');
        extractAllFlightProfit('finished');
    })
    //Header
    let div = $('<div></div>').append(actionBar);
    $('.as-page-aircraft > h1:eq(0)').after(div);
}

function extractAllFlightProfit(type) {
    aircraftFlightData.flights.forEach(function(value) {
        if (type == 'finished') {
            if (value.status == 'finished' || value.status == 'inflight') {

            } else {
                return
            }
        }
        let url = 'https://' + aircraftFlightData.server + '.airlinesim.aero/action/info/flight?id=' + value.id;
        window.open(url, '_blank');
    });
}

function displayFlightProfit() {
    //Table
    let table = $('#aircraft-flight-instances-table');
    //Head
    let th = ['<th>Profit/Loss</th>', '<th>Extracted</th>'];
    $('th:eq(9)', table).after(th);
    //body
    aircraftFlightData.flights.forEach(function(value) {
        let td = [];

        if (value.data) {
            const daysAgo = AES.getDateDiff(value.data.date)
            td.push($('<td class="text-right"></td>').html(AES.formatCurrency(value.data.money.CM5.Total)));
            td.push($('<td class="text-nowrap"></td>').text(AES.formatDaysAgo(daysAgo)));
        } else {
            td.push('<td class="text-center">--</td>');
            td.push('<td class="text-center">--</td>');
        }

        $('td:eq(11)', value.row).after(td);
    });
    $("tfoot td", table).attr("colspan", "15")
}

function getFlightsStats(flights) {
    let finished, total;
    finished = total = 0;
    flights.forEach(function(value) {
        if (value.status == 'finished' || value.status == 'inflight') {
            finished++;
        }
        total++;
    });
    return {
        totalFlights: total,
        finishedFlights: finished
    }
}

/**
 * Get the data from “flights” table
 * @returns {array} flights
 */
function getFlights() {
    const table = document.querySelector("#aircraft-flight-instances-table")
    const rows = table.querySelectorAll("tbody tr")
    const flights = []
    
    for (const row of rows) {
        const flight = new FlightData()
        const flightNumber = row.querySelector("td:nth-child(2)")?.innerText.trim()
        if (flightNumber === "XFER" || flightNumber === undefined) {
            continue
        }
        const url = row.querySelector(`[href*="action/info/flight"]`)?.href
        if (!url) {
            throw new Error("getFlights(): no valid value for `url`")
            continue
        }
        
        flight.id = url.match(/\d+/)[0]
        flight.flightNumber = flightNumber
        flight.status = row.querySelector(".flightStatusPanel")?.innerText.trim()
        flight.row = $(row)
        flights.push(flight)
    }
    
    return flights
}

function getAircraftInfo() {
    let span = $('h1 span');
    return {
        registration: $(span[0]).text().trim(),
        equipment: $(span[1]).text().trim()
    }
}

function getAircraftId() {
    let url = window.location.pathname;
    let a = url.split('/');
    return parseInt(a[a.length - 2], 10);
}
