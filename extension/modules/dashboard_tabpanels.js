class DashboardTabpanels {
    #tabpanel
    #index
    
    constructor(component, index) {
        
    }
    
    getContentForPanel(index, tabpanel) {
        this.#tabpanel = tabpanel
        this.#index = index
        tabpanel.innerHTML = null
        
        switch (index) {
            case 0:
                this.#createGeneral(tabpanel)
                break
            case 1:
                this.#createRouteManagement(tabpanel)
                break
            case 2:
                this.#createCompetitorMonitor(tabpanel)
                break
            case 3:
                this.#createAircraftProfitability(tabpanel)
                break
            default:
                tabpanel.append(`No content for tab at index ${index}`)
                break
        }
    }
    
    #createGeneral(container) {
        let general = new GeneralDashboard()
        container.append(general.container)
    }
    
    async #createRouteManagement(container) {
        // TODO: Move to onload/oninstall?
        if(!settings.routeManagement){
            setDefaultRouteManagementSettings()
        }
        
        let scheduleKey = server+airline.code+'schedule'
        
        let scheduleData = await chrome.storage.local.get([scheduleKey])
            
        if (!scheduleData) {
            let p = document.createElement("p")
            p.className = "warning"
            p.innerText = "Note: schedule info is needed to show this section. Change Dashboard to “General” → “Schedule” → “Extract Schedule”."
            
            container.append(p)
        } else {
            let table = generateRouteManagementTable(scheduleData[scheduleKey])
            let row = document.createElement("div")
            row.className = "row"
            let options = this.#createRouteManagementOptions()
            // let filters = displayRouteManagementFilters()
            let filters = this.#createRouteManagementFilters()
            
            row.append(options, filters, displayRouteManagementCollumns())
            
            container.append(row, table)
        }
    }
    
    #createRouteManagementOptions() {
        let cell = document.createElement("div")
        cell.className = "col-md-4"
        let fieldsetEl = document.createElement("fieldset")
        let legendEl = document.createElement("legend")
        let buttonGroupEl = document.createElement("div")
        
        let buttonElements = {
            "selectFirstTen": {
                "label": "select first 10"
            },
            "hideChecked": {
                "label": "hide checked"
            },
            "openInventory": {
                "label": "open inventory (max 10)",
            },
            "reloadTable": {
                "label": "reload table"
            }
        }
        
        for (let key in buttonElements) {
            let buttonObj = buttonElements[key]
            let buttonEl = document.createElement("button")
            let buttonClassNames = buttonObj?.classNames
            let buttonType = buttonObj?.type
            let buttonDefaultClassNames = "btn btn-default"
            buttonEl.innerText = buttonObj.label
        
            if (buttonType) {
                buttonEl.setAttribute("type", buttonType)
            } else {
                buttonEl.setAttribute("type", "button")
            }
        
            if (buttonClassNames) {
                buttonEl.className = buttonClassNames
            } else {
                buttonEl.className = buttonDefaultClassNames
            }
        
            buttonObj.element = buttonEl
        
            buttonGroupEl.append(buttonEl)
        }
        
        legendEl.innerText = "Options"
        buttonGroupEl.classList.add("btn-group")
        
        fieldsetEl.append(legendEl, buttonGroupEl)
        
        // Select first ten
        buttonElements["selectFirstTen"].element.addEventListener("click", function() {
            let count = 0
            $('#aes-table-routeManagement tbody tr').each(function() {
                $(this).find("input").prop('checked', true)
                count++
                if (count > 10) {
                    return false
                }
            })
        })
            
        // Remove checked
        buttonElements["hideChecked"].element.addEventListener("click", function() {
            $('#aes-table-routeManagement tbody tr').has('input:checked').remove()
        })
            
        // Open Inventory
        buttonElements["openInventory"].element.addEventListener("click", function() {
            //Get checked collumns
            let pages = $('#aes-table-routeManagement tbody tr').has('input:checked').map(function() {
                let orgdest = $(this).attr('id')
                orgdest = orgdest.split("-")
                orgdest = orgdest[2]
                //let orgdest = $(this).find("td:eq(1)").text() + $(this).find("td:eq(2)").text();
                let url = 'https://' + server + '.airlinesim.aero/app/com/inventory/' + orgdest
                return url
            }).toArray()
    
            //Open new tabs
            for (let i = 0; i < pages.length; i++) {
                window.open(pages[i], '_blank')
                if (i == 10) {
                    break
                }
            }
        })
        
        // Reload table reloadTable
        buttonElements["reloadTable"].element.addEventListener("click", () => {
            this.getContentForPanel(this.#index, this.#tabpanel)
        })
        //     let container = document.querySelector("#aes-div-routeManagement")
        //     container.innerHTML = generateRouteManagementTable(scheduleData)
        // });
        // let divRow = $('<div class="row"></div>').append(optionsDiv, displayRouteManagementFilters(), displayRouteManagementCollumns())
        // div.prepend(divRow)
        // //Collumns selector Checkbox listener
        // $('#aes-table-routeManagement-collumns input').change(function() {
        //     let show;
        //     if (this.checked) {
        //         show = 1
        //     } else {
        //         show = 0
        //     }
        //     let value = $(this).val();
        //     settings.routeManagement.tableCollumns.forEach(function(col) {
        //         if (col.class == value) {
        //             col.show = show
        //         }
        //     });
        //     chrome.storage.local.set({ settings: settings }, function() {})
        // })
        
        cell.append(fieldsetEl)
        
        return cell
    }
    
    #createRouteManagementFilters() {
        let filters = settings.routeManagement.filter
        
        let container = document.createElement("div")
        container.className = "col-md-4"
        
        let fieldset = document.createElement("fieldset")
        
        let legend = document.createElement("legend")
        legend.innerText = "Filters"
        
        let tableWell = document.createElement("div")
        tableWell.id = "aes-div-routeManagement-filter"
        tableWell.className = "as-table-well"
        tableWell.style = "overflow-x: auto"
        
        let table = document.createElement("table")
        table.className = "table table-bordered table-striped table-hover"
        table.id = "aes-table-routeManagement-filter"
        
        // Create table head
        let thead = createTableHeader()
        let tbody = createTableBody(filters)
        let tfoot = createTableFooter()
        
        let saveSpan = document.createElement("span")
        saveSpan.id = "aes-filter-message"
        
        let saveButton = document.createElement("button")
        saveButton.innerHTML = "apply filter"
        saveButton.className = "btn btn-default"
        saveButton.addEventListener("click", routeManagementFilterApplyButtonClickHandler)
        
        // Put it all together
        table.append(thead, tbody, tfoot)
        tableWell.append(table)
        fieldset.append(legend, tableWell, saveButton, saveSpan)
        container.append(fieldset)
        
        return container
    }
    
    #createCompetitorMonitor(container) {
        let display = displayCompetitorMonitoring()
        container.append(display)
        
        return container
    }
    
    #createAircraftProfitability(container) {
        container.innerText = "Aircraft Profitability panel"
    }
}

async function getScheduleData(scheduleKey) {
    let result = await chrome.storage.local.get([scheduleKey])

    return result
}

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
            cells[1].className = "bad"
            cells[1].innerText = "No Schedule data found. Extract schedule or some AES parts will not work."
            
            tbody.append(row)
            
            return
        }
        
        // TODO: pull getDate() into here/helpers.js
        let lastUpdate = getDate("schedule", scheduleData.date)
        let diff = AES.getDateDiff([todayDate.date, lastUpdate])
        
        cells[1].innerText = `Last schedule extract ${AES.formatDateString(lastUpdate)} (${diff} days ago). Extract new schedule if there are new routes.`
        
        if (diff >= 0 && diff < 7) {
            cells[1].className = "good"
        } else {
            cells[1].className = "warning"
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
            cells[1].innerText = "No personnel salary update date found."
            cells[1].className = "bad"
            
            tbody.append(row)
            
            return
        }
        
        let lastUpdate = personnelData.date
        let diff = AES.getDateDiff([todayDate.date, lastUpdate])
        cells[1].innerText = `Last personnel salary update: ${AES.formatDateString(lastUpdate)} (${diff} days ago).`
        
        if (diff >= 0 && diff < 7) {
            cells[1].className = "good"
        } else {
            cells[1].className = "warning"
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
        for (const cell of cells) {
            row.append(cell)
        }
        
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
    
    #scheduleButtonClickHandler(event) {
        settings.schedule.autoExtract = 1
        
        let link = document.querySelector(".facts tfoot a[href$=\"tab\=3\"]")
        
        chrome.storage.local.set({settings: settings}, () => {
            link.click()
        })
    }
    
    #createPersonnelButton() {
        let button = this.#createButton("open personel management")
        
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
// TODO: Split this out into a routeManagement/filters module
function createTableHeader() {
    let thead = document.createElement("thead")
    let tr = document.createElement("tr")
    
    let columns = ["Column", "Operation", "Value", ""]
    
    for (const column of columns) {
        let heading = document.createElement("th")
        
        heading.innerHTML = column
        
        tr.append(heading)
    }
    
    thead.append(tr)
    
    return thead
}

function createTableBody(filters) {
    let tbody = document.createElement("tbody")
    
    for (const [index, filter] of filters.entries()) {
        let tr = document.createElement("tr")
        tr.id = `rmf-row-${index}`
        
        let cell = document.createElement("td")
        let cells = [
            cell.cloneNode(),
            cell.cloneNode(),
            cell.cloneNode(),
            cell.cloneNode()
        ]
        
        let input = document.createElement("input")
        input.setAttribute("type", "hidden")
        input.setAttribute("value", filter.collumCode)
        
        let button = document.createElement("button")
        button.setAttribute("type", "button")
        button.setAttribute("aria-label", "delete row")
        button.className = "btn btn-xs btn-link"
        button.dataset.tr = tr.id
        button.addEventListener("click", rmfDeleteButtonClickHandler)
        
        let icon = document.createElement("span")
        icon.className = "fa fa-trash"
        
        button.append(icon)
        
        cells[0].append(input, filter.collumn)
        cells[1].append(filter.operation)
        cells[2].append(filter.value)
        cells[3].append(button)
        
        for (const cell of cells) {
            tr.append(cell)
        }
        
        tbody.append(tr)
    }
    
    return tbody
}

function createTableFooter() {
    // TODO: Correct spelling of tableCollumns
    let tableColumns = settings.routeManagement.tableCollumns
    
    let columnSelect = document.createElement("select")
    columnSelect.className = "form-control"
    columnSelect.id = "aes-select-routeManagement-filter-collumn"
    
    for (const column of tableColumns) {
        let option = document.createElement("option")
        option.setAttribute("value", column.class)
        option.innerText = column.name
        
        columnSelect.append(option)
    }
    
    let operatorSelect = document.createElement("select")
    operatorSelect.className = "form-control"
    operatorSelect.id = "aes-select-routeManagement-filter-operation"
    
    let operators = ["=", "!", ">", "<"]
    
    for (const operator of operators) {
        let option = document.createElement("option")
        option.innerText = operator
        
        operatorSelect.append(option)
    }
    
    let input = document.createElement("input")
    input.setAttribute("type", "text")
    input.className = "form-control"
    input.id = "aes-select-routeManagement-filter-value"
    
    let button = document.createElement("button")
    button.setAttribute("type", "button")
    button.innerText = "add rule"
    button.className = "btn btn-default"
    
    button.addEventListener("click", routeManagementFilterButtonClickHandler)
    
    let tfoot = document.createElement("tfoot")
    tr = document.createElement("tr")
    
    let cell = document.createElement("td")
    let cells = [
        cell.cloneNode(),
        cell.cloneNode(),
        cell.cloneNode(),
        cell.cloneNode()
    ]
    
    cells[0].append(columnSelect)
    cells[1].append(operatorSelect)
    cells[2].append(input)
    cells[3].append(button)
    
    for (const cell of cells) {
        tr.append(cell)
    }
    
    tfoot.append(tr)
    
    return tfoot
}

function routeManagementFilterButtonClickHandler(event) {
    let tbody = document.querySelector("#aes-table-routeManagement-filter tbody")
    let tr = document.createElement("tr")
    let cell = document.createElement("td")
    let cells = [
        cell.cloneNode(),
        cell.cloneNode(),
        cell.cloneNode(),
        cell.cloneNode()
    ]
    let column = document.querySelector("#aes-select-routeManagement-filter-collumn")
    let columnText = column.selectedOptions[0].innerText
    let columnValue = column.value
    let operator = document.querySelector("#aes-select-routeManagement-filter-operation").value
    let value = document.querySelector("#aes-select-routeManagement-filter-value").value
    
    let input = document.createElement("input")
    input.setAttribute("type", "hidden")
    input.setAttribute("value", columnValue)
    
    let anchor = document.createElement("a")
    anchor.className = "aes-a-routeManagement-filter-delete-row"
    anchor.setAttribute("aria-label", "delete row")
    
    let icon = document.createElement("span")
    icon.className = "fa fa-trash"
    
    anchor.append(icon)
    
    cells[0].append(input, columnText)
    cells[1].append(operator)
    cells[2].append(value)
    cells[3].append(anchor)
    
    for (const cell of cells) {
        tr.append(cell)
    }
    
    tbody.append(tr)
}

function routeManagementFilterApplyButtonClickHandler(event) {
    let span = document.querySelector("#aes-filter-message")
    span.className = "warning"
    span.innerText = "saving.."
    
    let filter = []
    let rows = document.querySelectorAll("#aes-table-routeManagement-filter tbody tr")
    
    for (const row of rows) {
        let columnCode = row.querySelector("input").value
        let column = row.querySelector("td:first-child").innerText
        let operator = row.querySelector("td:nth-child(2)").innerText
        let value = row.querySelector("td:nth-child(3)").innerText
        
        filter.push({
            collumnCode: columnCode,
            collumn: column,
            operation: operator,
            value: value
        })
    }
    
    settings.routeManagement.filter = filter
    
    chrome.storage.local.set({settings: settings}, () => {
        span.className = "warning"
        span.innerText = "filtering..."

        routeManagementApplyFilter()

        span.className = "good"
        span.innerText = "done!"
    })
}

function rmfDeleteButtonClickHandler(event) {
    let target = event.currentTarget
    let tr = target.closest("tr")
    
    deleteRow(tr)
}

function deleteRow(row) {
    row.remove()
}
