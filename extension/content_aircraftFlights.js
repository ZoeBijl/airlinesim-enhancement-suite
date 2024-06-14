"use strict"

// Global variables
let aircraftFlightData,
    aircraftFlightInfoData,
    aircraftFlightsTab,
    statisticsPanel,
    infoPanel

window.addEventListener("load", async (event) => {
    aircraftFlightsTab = new AircraftFlightsTab()
    buildUI()
    getData()
    processData()
    displayData()
})

function buildUI() {
    infoPanel = new InfoPanel()
    statisticsPanel = new AircraftStatisticsPanel()
    // addButtons()
}

function getData() {
    aircraftFlightData = getAircraftData()
}

function processData() {
    getStorageData()
}

function displayData() {
    updateAircraftInfoPanel()
    updateStatisticsPanel()
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
    const aircraftInfo = aircraftFlightsTab.getAircraftInfo()
    const flights = aircraftFlightsTab.getFlights()
    const flightsStats = aircraftFlightsTab.data.currentSchedule
    const serverDate = AES.getServerDate()

    const aircraftData = {
        date: serverDate.date,
        time: serverDate.time,
        server: AES.getServerName(),
        aircraftId: aircraftInfo.id,
        registration: aircraftInfo.registration,
        equipment: aircraftInfo.equipment,
        type: 'aircraftFlights',
        flights: flights,
        finishedFlights: flightsStats.finishedFlights,
        totalFlights: flightsStats.totalFlights
    }
    console.log(aircraftData)

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
    let profit = 0
    let profitFlights = 0

//     let profit2 = 0
//     let profitFlights2 = 0
//
//     for (const flight of aircraftFlightsTab.data.flights) {
//         if (!flight.isCancellable && flight.data) {
//             profit2 += flight.data.money.CM5.Total
//             profitFlights2++
//         }
//     }

    // console.log({profit2, profitFlights2})

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
    let li = $('<li class="btn-group"></li>').append(btn1, btn, span)
    $('.as-page-aircraft .as-panel.as-action-bar li:first-child').after(li)
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
    // Table
    const table = $('#aircraft-flight-instances-table');
    // Head
    const th = ['<th>Profit/Loss</th>', '<th>Extracted</th>'];
    $('th:eq(9)', table).after(th);
    // Body
    aircraftFlightData.flights.forEach(function(value) {
        const td = [];

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

/** Class representing the Aircraft Flights tab */
class AircraftFlightsTab {
    #data
    #info
    #infoPanel
    #statisticsPanel
    #currentFlights

    constructor() {
        this.#info = this.getAircraftInfo()
        this.#data = new Aircraft()
        this.#setAircraftData()
        console.log(this.#data)
    }

    /**
     * Sets all the aircraft data
     */
    #setAircraftData() {
        this.#data.server = AES.getServerName()
        this.#data.equipment = this.#info.equipment
        this.#data.registration = this.#info.registration
        this.#data.nickname = this.#info.nickname
        this.#data.id = this.getAircraftId()
        this.#data.flights = this.getFlights()
        this.#data.currentSchedule.finishedFlights = this.#data.flights.filter((flight) => !flight.isCancellable).length
        this.#data.currentSchedule.totalFlights = this.#data.flights.length
    }

    /**
     * Get aircraft information from the heading
     */
    getAircraftInfo() {
        const spans = document.querySelectorAll(".as-page-aircraft h1 span")
        const info = {
            id: this.getAircraftId(),
            registration: spans[0]?.innerText,
            equipment: spans[1]?.innerText,
            nickname: spans[2]?.innerText
        }

        return info
    }

    /**
     * Get aircraft ID from the window location
     */
    getAircraftId() {
        const pathname = window.location.pathname
        const id = pathname.match(/(?<=\/)(?:\d+)/)[0]

        return id
    }

    /**
     * Get the data from “flights” table
     * @returns {array} flights
     */
    getFlights() {
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

            flight.id = parseInt(url.match(/\d+/)[0])
            flight.flightNumber = flightNumber
            flight.status = row.querySelector(".flightStatusPanel")?.innerText.trim()
            flight.isCancellable = Boolean(row.querySelector("td:first-child input"))
            flight.row = row

            flights.push(flight)
        }

        return flights
    }

    get data() {
        return this.#data
    }
}
