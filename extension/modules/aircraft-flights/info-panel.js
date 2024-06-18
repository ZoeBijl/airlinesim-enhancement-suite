/** Class representing an info panel */
class InfoPanel {
    #panel
    #tbody
    #rows

    constructor() {
        this.#rows = this.#createRows()
        
        this.#panel = document.querySelector(".as-page-aircraft .col-md-2 h3:first-child + .as-panel")
        this.#tbody = this.#panel.querySelector("tbody")
        this.#addRows()
    }
    
    #createRows() {
        const rows = {
            id: new InfoPanelRow("ID"),
            registration: new InfoPanelRow("Registration")
        }
        
        return rows
    }
    
    #addRows() {
        for (const row in this.#rows) {
            this.#tbody.append(this.#rows[row].element)
        }
    }
    
    set aircraftId(value) {
        this.#rows.id.value = value
    }
    
    set registration(value) {
        this.#rows.registration.value = value
    }
}

class InfoPanelRow {
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
        if (!value) {
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
