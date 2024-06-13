class AircraftStatisticsPanel {
    #container
    #table
    #profitRow
    #finishedFlightsRow
    #totalFlightsRow
    #allExtractedRow
    #rows

    constructor() {
        this.#rows = this.#createRows()
        this.#table = this.#createTable()
        this.#container = this.#createContainer()
        this.#container.append(
            this.#createHeading(),
            this.#createPanel()
        )
        this.update()
    }
    
    update() {
        // Remove old data
        this.#emptyTbody()

        // Create new data
        const tbody = this.#createTbody()
        
        // Add data to table
        this.#addTbody(tbody)
    }
    
    #createContainer() {
        const container = document.createElement("div")
        return container
    }
    
    #createHeading() {
        const heading = document.createElement("h3")
        heading.innerText = "Statistics"
        
        return heading
    }
    
    #createPanel() {
        const tableWell = document.createElement("div")
        tableWell.className = "as-table-well"
        tableWell.append(this.#table)
        
        const panel = document.createElement("div")
        panel.className = "as-panel"
        panel.append(tableWell)
        
        return panel
    }
    
    #createTable() {
        const table = document.createElement("table")
        table.className = "table table-hover"
        
        return table
    }
    
    #emptyTbody() {
        const tbody = this.#table.querySelector("tbody")
        
        if (tbody) {
            tbody.remove()
        }
    }
    
    #createTbody() {
        const tbody = document.createElement("tbody")
        for (const row in this.#rows) {
            tbody.append(this.#rows[row].element)
        }

        return tbody
    }
    
    #addTbody(tbody) {
        this.#table.append(tbody)
    }
    
    #createRows() {
        const rows = {
            profit: new AircraftStatisticsRow("Profit/loss"),
            finishedFlights: new AircraftStatisticsRow("Finished flights"),
            totalFlights: new AircraftStatisticsRow("Total flights"),
            allExtracted: new AircraftStatisticsRow("Flights extracted")
        }
        
        return rows
    }
    
    get container() {
        return this.#container
    }
    
    set profit(value) {
        this.#rows.profit.value = value
    }
    
    set finishedFlights(value) {
        this.#rows.finishedFlights.value = value
    }
    
    set totalFlights(value) {
        this.#rows.totalFlights.value = value
    }
    
    set allExtracted(value) {
        this.#rows.allExtracted.value = value
    }
}

class AircraftStatisticsRow {
    #element
    #header
    #cell
    
    constructor(label, value, configuration) {
        this.#header = this.#createHeader(label)
        this.#cell = this.#createCell(value)
        this.#element = this.#createRow()
        this.#element.append(this.#header, this.#cell)
    }
    
    #createRow() {
        const row = document.createElement("tr")
        return row
    }
    
    #createHeader(label) {
        const header = document.createElement("th")
        header.innerText = label
        
        return header
    }
    
    #createCell(value) {
        const content = this.#getCellContent(value)
        const cell = document.createElement("td")
        cell.append(content)
        cell.className = "text-right"
        
        return cell
    }
    
    #getCellContent(value) {
        let content = value
        if (typeof value === "boolean") {
            const icon = document.createElement("span")
            icon.className = "fa"
            
            if (value === true) {
                icon.classList.add("fa-check")
                icon.classList.add("good")
            } else {
                icon.classList.add("fa-times")
                icon.classList.add("bad")
            }
            content = icon
        } else if (!value) {
            content = "--"
        }
        
        return content
    }
    
    get element() {
        return this.#element
    }
    
    set value(value) {
        const content = this.#getCellContent(value)
        this.#cell.innerHTML = null
        this.#cell.append(content)
    }
}
