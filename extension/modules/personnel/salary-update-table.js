class SalaryUpdateTable {
    #container
    #table
    #columns = ["Value", "Type"]

    constructor() {
        this.#table = this.#createTable()
        this.#container = this.#createContainer()
        this.#container.append(this.#table)
    }
    
    /**
     * Create container
     * @returns {HTMLElement} container
     */
    #createContainer() {
        const container = document.createElement("div")
        container.className = "as-table-well form-group"
        
        return container
    }
    
    /**
     * Create table
     * @returns {HTMLElement} table
     */
    #createTable() {
        const table = document.createElement("table")
        table.className = "table table-bordered"
        
        const thead = this.#createThead()
        const tbody = this.#createTbody()
        table.append(thead, tbody)
        
        return table
    }
    
    /**
     * Create thead
     * @returns {HTMLElement} thead
     */
    #createThead() {
        const thead = document.createElement("thead")
        const tr = document.createElement("tr")
        for (const column of this.#columns) {
            const th = document.createElement("th")
            th.innerText = column
            tr.append(th)
        }
        thead.append(tr)
        
        return thead
    }
    
    /**
     * Create tbody
     * @returns {HTMLElement} tbody
     */
    #createTbody() {
        const tbody = document.createElement("tbody")
        const tr = document.createElement("tr")
        tbody.append(tr)
        const cells = [
            this.#createInputCell(),
            this.#createSelectCell()
        ]
        for (const cell of cells) {
            tr.append(cell)
        }

        return tbody
    }
    
    /**
     * Create cell with input
     * @returns {HTMLElement} cell
     */
    #createInputCell() {
        const input = document.createElement("input")
        input.setAttribute("type", "text")
        input.id = "aes-input-personelManagement-value"
        input.className = "form-control number"
        input.style = "min-width: 50px"
        input.value = settings.personelManagement.value

        const cell = document.createElement("td")
        cell.append(input)

        return cell
    }
    
    /**
     * Create cell with select
     * @returns {HTMLElement} cell
     */
    #createSelectCell() {
        const options = []
        const values = [
            {label: "AS$", value: "absolute"},
            {label: "%", value: "perc"}
        ]
        for (const entry of values) {
            const option = document.createElement("option")
            option.value = entry.value
            option.innerText = entry.label
            options.push(option)
        }
        const select = document.createElement("select")
        select.id = "aes-select-personelManagement-type"
        select.className = "form-control"
        for (const option of options) {
            select.append(option)
        }
        select.value = settings.personelManagement.type
        const cell = document.createElement("td")
        cell.append(select)

        return cell
    }
    
    /**
     * Return SalaryUpdateTable container
     * @returns {HTMLElement} this.#container
     */
    get container() {
        return this.#container
    }
}
