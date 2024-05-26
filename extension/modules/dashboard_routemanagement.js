class RouteManagementDashboard {
    #container
    #toolbar
    #table
    #data
    
    constructor() {
        this.#setDefaultSettings()
        this.#container = this.#createContainer()
        this.#toolbar = this.#createToolbar()
        this.#container.append(this.#toolbar)
        this.#data = this.#getData()
        
        this.#table = this.#createTable()
        this.#container.append(this.#table.container)
    }
    
    #createContainer() {
        let container = document.createElement("div")
        container.className = ""
        
        return container
    }
    
    #createTable() {
        let table = new RouteManagementTable(this.#data)
        return table
    }
    
    async #getData() {
        // Compose schedule key
        let server = AES.getServerName()
        let airline = AES.getAirlineCode().code
        let scheduleKey = `${server}${airline}schedule`
        
        let data = await chrome.storage.local.get([scheduleKey])
        let scheduleData = data[scheduleKey]
    }
    
    /*async #createContent() {    
        // Compose schedule key
        let server = AES.getServerName()
        let airline = AES.getAirlineCode().code
        let scheduleKey = `${server}${airline}schedule`
        
        let data = await chrome.storage.local.get([scheduleKey])
        let scheduleData = data[scheduleKey]
        
        if (!data) {
            let message = document.createElement("p")
            message.innerText = "Note: schedule info is needed to show this section. Change Dashboard to “General” → “Schedule” → “Extract Schedule”."
            
            return message
        }
        
        // let table = generateRouteManagementTable(scheduleData[scheduleKey])
        let table = document.createElement("table")
        let row = document.createElement("div")
        row.className = "row"
        let options = this.#createRouteManagementOptions()
        // let filters = displayRouteManagementFilters()
        let filters = this.#createRouteManagementFilters()
        
        row.append(options, filters, displayRouteManagementCollumns())
        
        return table.append("hoi")
    }*/
    
    #createToolbar() {
        let toolbar = document.createElement("div")
        toolbar.className = "row"
        
        let options = this.#createOptions()
        let filters = this.#createFilters()
        let columnFilter = this.#createColumnFilter()
        
        toolbar.append(options, filters, columnFilter)
        
        return toolbar
    }
    
    #setDefaultSettings() {
        // TODO: Move to onload/oninstall?
        if(!settings.routeManagement){
            setDefaultRouteManagementSettings()
        }
    }
    
    #createOptions() {
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
        // buttonElements["reloadTable"].element.addEventListener("click", () => {
        //     this.getContentForPanel(this.#index, this.#tabpanel)
        // })
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
    
    #createFilters() {
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
    
    #createColumnFilter() {
        let headings = []
        headings[0] = document.createElement("th")
        headings[0].innerText = "Show"
        headings[1] = document.createElement("th")
        headings[1].innerText = "Column"
        
        let row = document.createElement("tr")
        for (const heading of headings) {
            row.append(heading)
        }
        
        let thead = document.createElement("thead")
        thead.append(row)
        
        let tbody = this.#createColumnFilterTbody()
        
        let table = document.createElement("table")
        table.append(thead, tbody)
        table.className = "table table-bordered table-striped table-hover"
        
        let tableWell = document.createElement("div")
        tableWell.append(table)
        tableWell.className = "as-table-well hidden"
        
        let anchor = document.createElement("a")
        anchor.innerText = "Columns"
        anchor.style = "cursor: pointer"
        anchor.addEventListener("click", (event) => {
            this.#columnToggleClickHandler(event, tableWell)
        })
        
        let legend = document.createElement("legend")
        // legend.innerText = "Columns"
        legend.append(anchor)
        
        let fieldset = document.createElement("fieldset")
        fieldset.append(legend, tableWell)
        
        let container = document.createElement("div")
        container.className = "col-md-4"
        container.append(fieldset)
        
        return container
    }
    
    #createColumnFilterTbody() {
        let tbody = document.createElement("tbody")
        
        let tableColumns = settings.routeManagement.tableCollumns
        for (const column of tableColumns) {
            let input = document.createElement("input")
            input.setAttribute("type", "checkbox")
            
            let isVisible = column.show
            if (isVisible) {
                input.setAttribute("checked", "checked")
            }
            
            let cells = [
                document.createElement("td"),
                document.createElement("td")
            ]
            
            cells[0].append(input)
            cells[1].innerText = column.name
            
            let row = document.createElement("tr")
            for (const cell of cells) {
                row.append(cell)
            }
            
            tbody.append(row)
        }
        
        return tbody
    }
    
    #columnToggleClickHandler(event, table) {
        if (!table) {
            return
        }

        let isHidden = table.classList.contains("hidden")
        if (isHidden) {
            table.classList.remove("hidden")
        } else {
            table.classList.add("hidden")
        }
    }
    
    get container() {
        return this.#container
    }
}

class RouteManagementTable {
    #container
    #data
    
    constructor(data) {
        this.#container = this.#createContainer()
        this.#data = data
    }
    
    #createContainer() {
        let container = document.createElement("div")
        container.className = "as-table-well"
        
        return container
    }
    
    get container() {
        return this.#container
    }
}

class RouteManagementColumnFilter {
    constructor() {
        
    }
}
