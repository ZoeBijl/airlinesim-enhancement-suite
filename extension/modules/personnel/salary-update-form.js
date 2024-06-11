class SalaryUpdateForm {
    #container
    #heading
    #panel
    #table
    #button
    #status
    
    constructor() {
        this.#heading = this.#createHeading()
        this.#table = new SalaryUpdateTable()
        this.#button = this.#createButton()
        this.#panel = this.#createPanel(this.#table.container)
        this.#container = this.#createContainer()
        this.#container.append(
            this.#heading,
            this.#panel
        )
    }
    
    /**
     * Create container
     * @returns {HTMLElement} container
     */
    #createContainer() {
        const container = document.createElement("div")
        
        return container
    }
    
    /**
     * Create the heading
     * @returns {HTMLElement} heading
     */
    #createHeading() {
        const heading = document.createElement("h2")
        heading.className = "h3"
        heading.innerText = "Update Salaries"
        
        return heading
    }
    
    /**
     * Create the description
     * @returns {HTMLElement} description
     */
    #createDescription() {
        const description = document.createElement("p")
        description.innerText = "Select value (either absolute AS$ value or % value) to keep your personnel’s salary in regards to country average. You can enter negative or positive values."
        
        return description
    }
    
    /**
     * Create the button
     * @returns {HTMLElement} button
     */
    #createButton() {
        const button = document.createElement("button")
        button.setAttribute("type", "button")
        button.className = "btn btn-default"
        button.innerText = "adjust salaries"
        
        return button
    }
    
    #createButtonContainer() {
        const container = document.createElement("div")
        container.className = "form-group submit"
        container.append(this.#button)
        
        return container
    }
    
    /**
     * Create the panel
     * @param {HTMLElement} table - element containing the update table with form elements.
     * @returns {HTMLElement} panel
     */
    #createPanel(table) {
        const description = this.#createDescription()
        const button = this.#createButtonContainer()
        
        const panel = document.createElement("div")
        panel.className = "as-panel"
        panel.append(
            description,
            table,
            button
        )
        
        return panel
    }
    
    /**
     * Return SalaryUpdateForm container
     * @returns {HTMLElement} this.#container
     */
    get container() {
        return this.#container
    }
}
