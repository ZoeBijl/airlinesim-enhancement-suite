class DashboardTabpanels {
    #tabpanel
    #index
    
    // TODO: remove?
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
    
    #createRouteManagement(container) {
        let routeManagement = new RouteManagementDashboard()
        container.append(routeManagement.container)
    }
    
    #createCompetitorMonitor(container) {
        let display = displayCompetitorMonitoring()
        container.append(display)
        
        return container
    }
    
    async #createAircraftProfitability(container) {
        let display = await displayAircraftProfitability()
        container.append(display)
        
        return container
    }
}
