class Notifications {
    name = "Notifications"
    container

    constructor() {
        const target = document.querySelector("nav.as-navbar-main + .container-fluid")
        const container = document.querySelector(".feedbackPanel")
        this.container = container
        if (!container) {
            this.container = this.#createContainer()
            target.prepend(this.container)
        }
    }

    /**
     * Creates the notification container
     * @returns {HTMLElement} container
     */
    #createContainer() {
        const container = document.createElement("ul")
        container.className = "feedbackPanel"

        return container
    }

    /**
     * Creates a new notification and adds it to the page.
     * @param {string} message - the message to be displayed
     * @param {object} options
     */
    newNotification(message, options) {
        const notification = new Notification(message, options)
        this.container.append(notification.element)
    }

    /**
     * Shorthand for `newNotification`
     * @param {string} message
     * @param {object} options
     */
    add(message, options) {
        this.newNotification(message, options)
    }
}
