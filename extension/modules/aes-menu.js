class AESMenu {
    #target
    #container
    #button
    #menu

    constructor() {
        this.#target = document.querySelector("#as-navbar-main-collapse .navbar-nav > li:nth-child(5)")
        this.#container = this.#createContainer()
        this.#button = this.#createButton()
        this.#menu = this.#createMenu()
        
        this.#container.append(this.#button, this.#menu)
        this.#target.after(this.#container)
    }
    
    /**
     * Creates the menu container
     * @returns {HTMLElement} container
     */
    #createContainer() {
        const container = document.createElement("li")
        container.className = "dropdown"
        return container
    }
    
    /**
     * Creates the menu toggle button
     * @returns {HTMLElement} button
     */
    #createButton() {
        const caret = document.createElement("span")
        caret.className = "caret"
        const button = document.createElement("a")
        button.setAttribute("role", "button")
        button.setAttribute("tabindex", "0")
        button.dataset.toggle = "dropdown"
        button.className = "dropdown-toggle"
        button.innerText = "AES"
        button.style = "cursor: pointer"
        button.append(caret)

        return button
    }
    
    /**
     * Creates the menu
     * @returns {HTMLElement} menu
     */
    #createMenu() {
        const menu = document.createElement("ul")
        menu.className = "dropdown-menu"
        const menuItems = []
        const content = [{
            label: "Community",
            isHeader: true
        },{
            label: "Forum Topic",
            href: "https://forums.airlinesim.aero/t/introducing-airlinesim-enhancement-suite-beta/",
            newWindow: true
        },{
            isDivider: true
        },{
            label: "Support",
            isHeader: true
        },{
            label: "Report a Bug",
            href: `https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/new?body=AES:%20v${chrome.runtime.getManifest().version}%0AChrome:%20v${window.navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9]+)/)[1]}%0A%0A`,
            newWindow: true,
            icon: { className: "fa-bug" }
        },{
            label: "Handbook",
            href: "https://docs.google.com/document/d/1hzMHb3hTBXSZNtuDKoBuvx1HP9CgB7wVYR59yDYympg/",
            newWindow: true,
            icon: { className: "fa-book" }
        },{
            label: "GitHub",
            href: "https://github.com/ZoeBijl/airlinesim-enhancement-suite",
            newWindow: true,
            icon: { className: "fa-github" }
        }]
        for (const item of content) {
            let menuItem = this.#createMenuItem(item)
            menuItems.push(menuItem)
        }
        for (const item of menuItems) {
            menu.append(item)
        }
        
        return menu
    }
    
    /**
     * Creates a menu item
     * @param {object} content - object containing information required to build the item
     * @returns {HTMLElement} menuItem
     */
    #createMenuItem(content) {
        const menuItem = document.createElement("li")
        let menuItemContent, icon
        if (content.isDivider) {
            menuItem.className = "divider"
            return menuItem
        }
        if (content.isHeader) {
            menuItem.className = "dropdown-header"
            menuItemContent = content.label
        }
        if (content.icon || content.newWindow) {
            icon = document.createElement("span")
            icon.setAttribute("aria-hidden", "true")
        }
        if (content.icon) {
            icon.className = `fa ${content.icon.className}`
        }
        if (content.href) {
            const link = document.createElement("a")
            link.setAttribute("href", content.href)
            if (content.newWindow && !content.icon) {
                icon.className = "fa fa-external-link"
            }
            if (content.newWindon) {
                link.setAttribute("target", "_blank")
                link.setAttribute("rel", "noreferrer noopener")
            }
            if (icon) {
                link.append(icon)
                link.append(" ")
            }
            link.append(content.label)
            menuItemContent = link
        }
        menuItem.append(menuItemContent)
        return menuItem
    }
}

new AESMenu()
