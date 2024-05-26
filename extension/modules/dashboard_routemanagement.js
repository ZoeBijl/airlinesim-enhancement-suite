class RouteManagementDashboard {
    #container
    #table
    
    constructor() {
        this.#container = this.#createContainer()
    }
    
    #createContainer() {
        let container = document.createElement("div")
        container.className = "as-table-well"
        
        return container
    }
}
