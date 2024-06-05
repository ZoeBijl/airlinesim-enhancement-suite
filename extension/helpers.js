/** Shared logic */
class AES {
    server
    airline
    
    /**
     * Returns the airline name and code from the dashboard
     * @returns {object} {name: string, code: string}
     */
    static getAirlineCode() {
        const factsTable = document.querySelector(".facts table")
        const nameElement = factsTable.querySelector("tr:nth-child(1) td:last-child")
        const codeElement = factsTable.querySelector("tr:nth-child(2) td:last-child")
        
        return {
            name: nameElement.innerText,
            code: codeElement.innerText
        }
    }
    
    /**
     * Returns the server name
     * @returns {string} server name
     */
    static getServerName() {
        const hostname = window.location.hostname
        const servername = hostname.split(".")[0]
        
        return servername
    }
    
    /**
     * Formats a currency value local standards
     * @param {integer} currency value
     * @param {string} alignment: "right" | "left"
     * @returns {HTMLElement} span with formatted value
     */
    static formatCurrency(value, alignment) {
        let container = document.createElement("span")
        let formattedValue = Intl.NumberFormat().format(value)
        let indicatorEl = document.createElement("span")
        let valueEl = document.createElement("span")
        let currencyEl = document.createElement("span")
        let containerClasses = "aes-no-text-wrap"
        
        if (alignment === "right") {
            containerClasses = "aes-text-right aes-no-text-wrap"
        }
        
        if (value >= 0) {
            valueEl.classList.add("good")
            indicatorEl.classList.add("good")
            indicatorEl.innerText = "+"
        }
        
        if (value < 0) {
            valueEl.classList.add("bad")
            indicatorEl.classList.add("bad")
            indicatorEl.innerText = "-"
            formattedValue = formattedValue.replace("-", "")
        }
        
        valueEl.innerText = formattedValue
        currencyEl.innerText = " AS$"
        
        container.className = containerClasses
        container.append(indicatorEl, valueEl, currencyEl)
        
        return container
    }
    
    /**
     * Returns a formatted date string
     * @param {string} "20240524"
     * @returns {string} "2024-05-24" | "error: invalid format for AES.formatDateString"
     */
    static formatDateString(date) {
        if (!date) {
            return
        }
        
        const correctLength = date.length === 8
        const isInteger = Number.isInteger(parseInt(date))
        let result = "error: invalid format for AES.formatDateString"
        
        if (correctLength && isInteger) {
            const year = date.substring(0, 4)
            const month = date.substring(4, 6)
            const day = date.substring(6, 8)
            result = `${year}-${month}-${day}`
        }
        
        return result
    }
    
    /**
     * Returns a formatted date (week) string
     * @param {string} "212024"
     * @returns {string} "21/2014 | "error: invalid format for AES.formatDateStringWeek"
     */
    static formatDateStringWeek(date) {
        const correctLength = date.toString().length === 6
        const isInteger = Number.isInteger(parseInt(date))
        let result = "error: invalid format for AES.formatDateStringWeek"
        
        if (correctLength && isInteger) {
            const DateAsString = date.toString()
            const week = DateAsString.substring(0, 2)
            const year = DateAsString.substring(2, 6)
            
            result = `${week}/${year}`
        }
    }
    
    /**
     * Returns the difference between dates in days
     * @param {array} ["20240520", "20240524"]
     * @returns {integer} 4
     */
    static getDateDiff(dates) {
        let dateA = new Date(`${this.formatDateString(dates[0])}T12:00:00Z`)
        let dateB = new Date(`${this.formatDateString(dates[1])}T12:00:00Z`)
        let result = Math.round((dateA - dateB)/(1000 * 60 * 60 * 24))
        
        return result
    }
}
