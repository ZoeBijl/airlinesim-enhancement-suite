class Tabs {
    constructor(tabsData = [{name: "no data"}]) {
        this.settings = {
            defaultTabIndex: 0,
            currentTabIndex: 0
        }
        
        this.data = {
            tabs: tabsData
        }
        
        this.elements = {
            container: null,
            tablist: null,
            tabs: [],
            tabpanel: null
        }
        
        this.createTabList(this.data.tabs)
        this.createTabPanel()
        this.createContainer()
        
        this.setCurrentTab()
        
        return this.elements.container
    }
    
    createContainer = () => {
        let container = document.createElement("div")
        container.append(this.elements.tablist, this.elements.tabpanel)
        
        this.elements.container = container
    }
    
    createTabList = (tabs) => {
        let tablist = document.createElement("ul")
        tablist.setAttribute("role", "tablist")
        tablist.className = "nav nav-tabs"
        this.elements.tablist = tablist
        // let index

        for (const tab of tabs) {
            // index = index++
            let listItem = document.createElement("li")
            let anchor = document.createElement("a")
            anchor.setAttribute("role", "tab")
            anchor.setAttribute("aria-selected", "false")
            anchor.innerText = tab.name
            anchor.index = tabs.indexOf(tab)
            
            anchor.addEventListener("click", this.clickHandler)
            anchor.addEventListener("keydown", this.keyDownHandler)
            anchor.addEventListener("keyup", this.keyUpHandler)
            
            listItem.append(anchor)
            this.elements.tabs.push(listItem)
            this.elements.tablist.append(listItem)
        }
    }
    
    createTabPanel = () => {
        let tabpanel = document.createElement("div")
        tabpanel.setAttribute("role", "tabpanel")
        tabpanel.classList.add("tab-content")
        tabpanel.innerText = "Hello"
        
        this.elements.tabpanel = tabpanel
    }
    
    // Event handlers
    clickHandler = (event) => {
        let index = event.target.index
        
        this.setCurrentTab(index)
    }
    
    keyDownHandler = (event) => {
        let key = event.key
        
        if (key === "Enter" || key === " " || key === "ArrowRight" || key === "ArrowLeft") {
            event.preventDefault()
        }
    }
    
    keyUpHandler = (event) => {
        let key = event.key
        let index = this.#calculateTabIndex(key, event.target.index)
        
        if (key === "ArrowRight" || key === "ArrowLeft") {
            this.setCurrentTab(index, true)
        }
        
        if (key === "Enter" || key === " ") {
            this.setCurrentTab(index)
        }
    }
    
    // Setting tab states
    setCurrentTab = (index = this.settings.defaultTabIndex, focusCurrent) => {
        this.settings.currentTabIndex = index
        
        this.#setTabStates(index, focusCurrent)
    }
    
    #setTabStates = (index, focusCurrent = false) => {
        for (const listitem of this.elements.tabs) {
            let listitemIndex = this.elements.tabs.indexOf(listitem)
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
    
    #calculateTabIndex = (key, index) => {
        let newIndex = index
        
        if (key === "ArrowLeft") {
            let length = this.elements.tabs.length
            newIndex = index - 1
            
            if (newIndex < 0) {
                newIndex = length - 1
            }
        }
        
        if (key === "ArrowRight") {
            let length = this.elements.tabs.length
            // Try to 
            newIndex = index + 1
            
            if (length === newIndex) {
                newIndex = 0
            }
        }
        
        return newIndex
    }
}
