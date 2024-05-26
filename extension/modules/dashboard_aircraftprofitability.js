class AircraftProfitability {
    #container
    #columns = []
    #fleetData = []
    
    constructor(container) {
        this.#container = container
        this.columns = this.#getColumnData()
        
        this.#initialiseSettings()
        this.#filterHiddenColumns()
    }
    
    #initialiseSettings() {
        if(!settings.aircraftProfitability){
            settings.aircraftProfitability = {}
        }
        
        if(!settings.aircraftProfitability.hideColumn){
            settings.aircraftProfitability.hideColumn = []
        }
    }
    
    #filterHiddenColumns() {
        let hiddenColumnLength = settings.aircraftProfitability.hideColumn.length
        
        if (hiddenColumnLength > 0) {
            for (const column of this.#columns) {
                let hiddenColumns = settings.aircraftProfitability.hideColumn
                
                for (const columnToHide of hiddenColumns) {
                    if (column.data === columnToHide) {
                        this.#hideColumn(column)
                    }
                }
            }
        }
    }
    
    #hideColumn(column) {
        return column.visible = 0
    }
    
    #getColumnData() {
        // TODO: Get this from a JSON
        return [
            {
                category: 'Aircraft',
                title: 'Aircraft ID',
                data: 'aircraftId',
                sortable: 1,
                visible: 1,
                number: 1,
                id: 1
            },
            {
                category: 'Aircraft',
                title: 'Registration',
                data: 'registration',
                sortable: 1,
                visible: 1
            },
            {
                category: 'Aircraft',
                title: 'Equipment',
                data: 'equipment',
                sortable: 1,
                visible: 1
            },
            {
                category: 'Aircraft',
                title: 'Fleet',
                data: 'fleet',
                sortable: 1,
                visible: 1
            },
            {
                category: 'Aircraft',
                title: 'Nickname',
                data: 'nickname',
                sortable: 1,
                visible: 1
            },
            {
                category: 'Aircraft',
                title: 'Note',
                data: 'note',
                sortable: 1,
                visible: 1
            },
            {
                category: 'Aircraft',
                title: 'Age',
                data: 'age',
                sortable: 1,
                visible: 1,
                number: 1
            },
            {
                category: 'Aircraft',
                title: 'Maintenance',
                data: 'maintenance',
                sortable: 1,
                visible: 1,
                number: 1
            },
            {
                category: 'Aircraft',
                title: 'Date',
                data: 'dateAircraft',
                sortable: 1,
                visible: 1
            },
            {
                category: 'Profit',
                title: 'Total flights',
                data: 'totalFlights',
                sortable: 1,
                visible: 1,
                number: 1
            },
            {
                category: 'Profit',
                title: 'Finished flights',
                data: 'finishedFlights',
                sortable: 1,
                visible: 1,
                number: 1
            },
            {
                category: 'Profit',
                title: 'Profit/loss flights',
                data: 'profitFlights',
                sortable: 1,
                visible: 1,
                number: 1
            },
            {
                category: 'Profit',
                title: 'Profit',
                data: 'profit',
                sortable: 1,
                visible: 1,
                number: 1,
                format: 'money'
            },
            {
                category: 'Profit',
                title: 'Profit extract date',
                data: 'dateProfit',
                sortable: 1,
                visible: 1
            }
        ]
    }
}
