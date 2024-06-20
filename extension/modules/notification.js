class Notification {
    name = "Notification"
    element

    constructor(content, {type} = {type: "success"}) {
        const className = this.#getClassName(type)
        this.element = this.#createElement(className)
        if (content) {
            this.#setContent(content)
        }
    }

    /**
     * Gets the class name based on the provided type.
     * @param {string} type
     * @returns {string} className
     */
    #getClassName(type) {
        let className
        switch (type) {
            case "warning":
                className = "feedbackPanelWARNING"
                break
            case "error":
                className = "feedbackPanelERROR"
                break
            default:
                className = "feedbackPanelSUCCESS"
        }

        return className
    }

    /**
     * Creates the notification element
     * @param {string} className - "feedbackPanelINFO" | "feedbackPanelWARNING" | "feedbackPanelERROR"
     * @returns {HTMLElement} element
     */
    #createElement(className) {
        const element = document.createElement("li")
        element.className = className

        return element
    }

    /**
     * Creates the content element
     * @param {string} text
     * @returns {HTMLElement} content
     */
    #createContent(text) {
        const content = document.createElement("span")
        content.innerText = ` ${text}`

        return content
    }

    /**
     * Sets the notification content
     * @param {string} text
     */
    #setContent(text) {
        const content = this.#createContent(text)
        this.element.append(content)
    }

    /**
     * Public message setter
     * @param {string} text
     */
    set message(text) {
        this.#setContent(text)
    }
}
