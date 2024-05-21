class Tabs {
    settings
    #data
    #elements = {}
    
    constructor(tabsData = [{name: "no data"}]) {
        this.settings = {
            defaultTabIndex: 0, // DefaultSelectedTab Number?
            currentTabIndex: 0
        }
        
        this.#data = {
            tabs: tabsData
        }
        
        this.#elements.tabs = []
        this.#elements.tablist = this.#createTabList(this.#data.tabs)
        this.#elements.tabcontent = null
        this.#elements.tabpanel = this.#createTabPanel()
        this.#elements.dashboardTabPanels = new DashboardTabpanels(this, this.settings.defaultTabIndex)
        this.#elements.container = this.#createContainer()
        
        this.#setCurrentTab()
    }
    
    #createContainer() {
        let container = document.createElement("div")
        container.append(this.#elements.tablist, this.#elements.tabpanel)
        
        return container
    }
    
    #createTabList(tabs) {
        let tablist = document.createElement("ul")
        tablist.setAttribute("role", "tablist")
        tablist.className = "nav nav-tabs"

        for (const tab of tabs) {
            let listItem = document.createElement("li")
            let anchor = document.createElement("a")
            anchor.setAttribute("role", "tab")
            anchor.setAttribute("aria-selected", "false")
            anchor.innerText = tab.name
            anchor.index = tabs.indexOf(tab)
            
            anchor.addEventListener("click", this.clickHandler.bind(this))
            anchor.addEventListener("keydown", this.keyDownHandler.bind(this))
            anchor.addEventListener("keyup", this.keyUpHandler.bind(this))
            
            listItem.append(anchor)
            tablist.append(listItem)
            this.#elements.tabs.push(listItem)
        }
        
        return tablist
    }
    
    #createTabPanel() {
        let tabpanel = document.createElement("div")
        tabpanel.setAttribute("role", "tabpanel")
        tabpanel.classList.add("tab-content")
        
        let tabpane = document.createElement("div")
        tabpane.className = "tab-pane active"
        this.#elements.tabcontent = tabpane
        tabpanel.append(tabpane)
        
        return tabpanel
    }
    
    // Event handlers
    clickHandler(event) {
        let index = event.target.index
        
        this.#setCurrentTab(index)
    }
    
    keyDownHandler(event) {
        let key = event.key
        
        if (key === "Enter" || key === " " || key === "ArrowRight" || key === "ArrowLeft") {
            event.preventDefault()
        }
    }
    
    keyUpHandler(event) {
        let key = event.key
        let index = this.#calculateTabIndex(key, event.target.index)
        
        if (key === "ArrowRight" || key === "ArrowLeft") {
            this.#setCurrentTab(index, true)
        }
        
        if (key === "Enter" || key === " ") {
            this.#setCurrentTab(index)
        }
    }
    
    // Setting tab states
    #setCurrentTab(index = this.settings.defaultTabIndex, focusCurrent) {
        this.settings.currentTabIndex = index
        
        this.#setTabStates(index, focusCurrent)
        this.#setTabPanelContent(index)
    }
    
    #setTabStates(index, focusCurrent = false) {
        for (const listitem of this.#elements.tabs) {
            let listitemIndex = this.#elements.tabs.indexOf(listitem)
            listitem.classList.remove("active")
            
            let anchor = listitem.querySelector("a")
            anchor.setAttribute("aria-selected", "false")
            anchor.setAttribute("tabindex", "-1")
            
            if (listitemIndex === this.settings.currentTabIndex) {
                listitem.classList.add("active")
                anchor.setAttribute("aria-selected", "true")
                anchor.setAttribute("tabindex", "0")
                
                if (focusCurrent ===  true) {
                    anchor.focus()
                }
            }
        }
    }
    
    #setTabPanelContent(index) {
        let tab = this.#data.tabs[index]
        
        this.#elements.tabpanel.setAttribute("aria-label", tab.name)
        this.#elements.dashboardTabPanels.getContentForPanel(index, this.#elements.tabcontent)
    }
    
    #calculateTabIndex(key, index) {
        let newIndex = index
        
        if (key === "ArrowLeft") {
            let length = this.#elements.tabs.length
            newIndex = index - 1
            
            if (newIndex < 0) {
                newIndex = length - 1
            }
        }
        
        if (key === "ArrowRight") {
            let length = this.#elements.tabs.length
            // Try to 
            newIndex = index + 1
            
            if (length === newIndex) {
                newIndex = 0
            }
        }
        
        return newIndex
    }
    
    // Getters
    get index() {
        return this.settings.currentTabIndex
        //return this.#message
    }
    
    get container() {
        return this.#elements.container
    }
    
    set index(index) {
        this.#setCurrentTab(index)
    }
    
    set panelContent(value) {
        this.#elements.tabpanel.innerHTML = null
        this.#elements.tabpanel.append(value)
    }
}
