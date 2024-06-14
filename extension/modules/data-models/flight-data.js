/** Class representing data for a single flight */
class FlightData {
    name = "FlightData"
    id
    flightNumber
    status
    row
    financials
    isCancellable
    data

    /**
     * Creates a FlightData object
     * @param {integer} id - 5322 | 912
     * @param {string} flightNumber - "MOI 1000" | "OZ 22"
     * @param {string} status - "booked" | "inflight" | "finished" | "cancelled"
     * @param {object} financials - object containing financial data
     * @param {boolean} isCancellable - indicates the presence of a checkbox / if the flight is either finished or inflight
     * @param {HTMLObject} row - element the data is extracted from
     */
    constructor(id, flightNumber, status, financials, isCancellable, row) {
        this.id = id
        this.flightNumber = flightNumber
        this.status = status
        this.financials = financials
        this.isCancellable = isCancellable
        this.row = row
    }
}
