class GeneralDashboard {
    #container
    #table
    
    constructor() {
        this.#container = this.#createContainer()
        this.#table = this.#createTable()        

        this.#container.append(this.#table)
    }
    
    #createContainer() {
        let container = document.createElement("div")
        container.className = "as-table-well"
        
        return container
    }
    
    #createTable() {
        let table = document.createElement("table")
        table.className = "table table-hover"
        
        let thead = document.createElement("thead")
        let cells = this.#createCells("th")
        let row = this.#createRow(cells)
        
        cells[0].innerText = "Area"
        cells[1].innerText = "Status"
        cells[2].innerText = "Action"

        thead.append(row)
        let tbody = this.#createTableBody()

        table.append(thead, tbody)
        
        return table
    }
    
    #createTableBody() {
        let tbody = document.createElement("tbody")
        
        this.#addScheduleRow(tbody)
        this.#addPersonnelManagementRow(tbody)
        
        return tbody
    }
    
    /**
     * Adds a row for the schedule data status to the provided element
     * @param {HTMLElement} tbody
     */
    async #addScheduleRow(tbody) {
        let cells = this.#createCells("td")
        let row = this.#createRow(cells)
        
        cells[0].innerText = "Schedule"
        
        let statusMessage = document.createElement("span")
        cells[1].append(statusMessage)
        
        // Create schedule button
        let button = this.#createScheduleButton()
        cells[2].append(button)
        
        // Compose schedule key
        let server = AES.getServerName()
        let airline = AES.getAirlineCode().code
        let scheduleKey = `${server}${airline}schedule`
        
        // Get schedule data
        let data = await chrome.storage.local.get([scheduleKey])
        let scheduleData = data[scheduleKey]
        
        // Return instructions when no scheduleData is found
        if (!scheduleData) {
            statusMessage.className = "bad"
            statusMessage.innerText = "No Schedule data found. Extract schedule or some AES parts will not work."
            
            tbody.append(row)
            
            return
        }
        
        // TODO: pull getDate() into here/helpers.js
        let lastUpdate = getDate("schedule", scheduleData.date)
        let diff = AES.getDateDiff([todayDate.date, lastUpdate])
        
        statusMessage.innerText = `Last schedule extract ${AES.formatDateString(lastUpdate)} (${diff} days ago). Extract new schedule if there are new routes.`
        
        if (diff >= 0 && diff < 7) {
            statusMessage.className = "good"
        } else {
            statusMessage.className = "warning"
        }
        
        tbody.append(row)
    }
    
    /**
     * Adds a row for the personnel update status to the provided element
     * @param {HTMLElement} tbody
     */
    async #addPersonnelManagementRow(tbody) {
        let cells = this.#createCells("td")
        let row = this.#createRow(cells)
        
        cells[0].innerText = "Personnel Management"
        
        let statusMessage = document.createElement("span")
        cells[1].append(statusMessage)
        
        // Create schedule button
        let button = this.#createPersonnelButton()
        cells[2].append(button)
        
        // Compose schedule key
        let server = AES.getServerName()
        let airline = AES.getAirlineCode().name
        let personnelKey = `${server}${airline}personelManagement`
        
        // Get personnel data
        let data = await chrome.storage.local.get([personnelKey])
        let personnelData = data[personnelKey]
        
        if (!personnelData) {
            statusMessage.innerText = "No personnel salary update date found."
            statusMessage.className = "bad"
            
            tbody.append(row)
            
            return
        }
        
        let lastUpdate = personnelData.date
        let diff = AES.getDateDiff([todayDate.date, lastUpdate])
        statusMessage.innerText = `Last personnel salary update: ${AES.formatDateString(lastUpdate)} (${diff} days ago).`
        
        if (diff >= 0 && diff < 7) {
            statusMessage.className = "good"
        } else {
            statusMessage.className = "warning"
        }
        
        tbody.append(row)
    }
    
    /**
     * Create a row with cells
     * @param {array} of HTMLElements <th> | <td>
     * @returns {HTMLElement} <tr> with nested cells
     */
    #createRow(cells) {
        let row = document.createElement("tr")
        
        // Append all cells
        row.append(...cells)
        
        return row
    }
    
    /**
     * Returns an array with three cells
     * @param {string} type: "th" | "td"
     * @returns {array} with three cells
     */
    #createCells(type) {
        let cell = document.createElement(type)
        let cells = [
            cell.cloneNode(),
            cell.cloneNode(),
            cell.cloneNode()
        ]
        
        return cells
    }
    
    /**
     * Create a <button> element
     * @param {string} label
     * @param {string} type
     * @param {string} className
     * @returns {HTMLElement} <button>
     */
    #createButton(label, type = "button", className = "btn btn-default") {
        let button = document.createElement("button")
        button.innerText = label
        button.setAttribute("type", type)
        button.className = className
        
        return button
    }
    
    // Buttons
    #createScheduleButton() {
        let button = this.#createButton("extract schedule data")
        
        button.addEventListener("click", this.#scheduleButtonClickHandler)
        
        return button
    }
    
    async #scheduleButtonClickHandler(event) {
        settings.schedule.autoExtract = 1
        
        let link = document.querySelector(".facts tfoot a[href$=\"tab\=3\"]")
        
        await chrome.storage.local.set({settings: settings})
        link.click()
    }
    
    #createPersonnelButton() {
        let button = this.#createButton("open personnel management")
        
        button.addEventListener("click", this.#personnelButtonClickHandler)
        
        return button
    }
    
    #personnelButtonClickHandler(event) {
        let link = document.querySelector("a[href$=\"action/enterprise/staffOverview\"]")
        
        link.click()
    }
    
    get container() {
        return this.#container
    }
}
