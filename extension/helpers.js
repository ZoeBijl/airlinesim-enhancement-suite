/** Shared logic */
class AES {
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
     * Formats a date string to human readable format
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
        
        return result
    }
    
    /**
     * Gets the server’s current date and time
     * @returns {object} datetime - { date: "20240607", time: "16:24 UTC" }
     */
    static getServerDate() {
        const source = document.querySelector(".as-navbar-bottom span:has(.fa-clock-o) span[title]")
        const titleAttribute = source.title
        
        // The title-attribute is always formatted like so:
        // "2024-06-07 16:23 UTC / 2024-06-08 02:23 HT"
        // Which is 42 characters long
        const expectedLength = 42
        if (titleAttribute.length != expectedLength) {
            throw new Error("Unexpected length for source. There might’ve been a UI update. Check AES.getServerDate()")
        }
        
        const data = titleAttribute.split("/")[0].trim()
        // Splits the date component from the data,
        // then splits that into an array for the year, month, and day
        let dateArray = data.split(" ")[0].split(/\D+/)
        if (dateArray[0].length === 2) {
            dateArray.reverse()
        }
        let date = dateArray[0]+dateArray[1]+dateArray[2]
        
        // Strip the date component from the data
        // leaving only the time in UTC
        let time = data.replace(/.{10}\s/, "")
        
        const datetime = {
            date: date,
            time: time
        }
        
        return datetime
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
    
    /**
     * Cleans a string of punctuation to returns an integer
     * @param {string} "2,000 AS$" | "2.000 AS$"
     * @returns {integer} 2000
     */
    static cleanInteger(value) {
        // \D matches any character that's not a digit
        value.replace(/\D+/g)
        return parseInt(value, 10)
    }
}
