class ExtractionButton {
    element
    label
    callback
    className
    type

    constructor(label, callback = null, className = "btn btn-default", type = "button") {
        this.label = label
        this.callback = callback
        this.className = className
        this.type = type

        this.element = this.#createElement()
    }

    #createElement() {
        const button = document.createElement("button")
        button.type = this.type
        button.innerText = this.label
        button.className = this.className

        return button
    }
}
