class AboutDialog {
    #target
    #container
    #modalDialog
    #modalContent
    #closeButton
    #body

    constructor() {
        this.#closeButton = this.#createCloseButton()
        this.#body = this.#createBody()
        this.#body.prepend(this.#closeButton)
        this.#modalContent = this.#createModalContent()
        this.#modalContent.append(this.#body)
        this.#modalDialog = this.#createModalDialog()
        this.#modalDialog.append(this.#modalContent)
        this.#container = this.#createContainer()
        this.#container.append(this.#modalDialog)
        this.#target = this.#setTarget()
        this.#target.append(this.#container)

        const observer = this.#mutationObserver()
        observer.observe(this.#container, {attributes: true})
    }

    #createContainer() {
        const container = document.createElement("div")
        container.class = "modal"
        container.id = "aes-about-dialog"
        container.setAttribute("role", "dialog")
        container.setAttribute("aria-modal", "true")
        container.setAttribute("aria-hidden", "true")
        container.style = "display: none"

        return container
    }

    #createModalDialog() {
        const modalDialog = document.createElement("div")
        modalDialog.className = "modal-dialog modal-md"

        return modalDialog
    }

    #createModalContent() {
        const modalContent = document.createElement("div")
        modalContent.className = "modal-content"

        return modalContent
    }

    #createCloseButton() {
        const icon = document.createElement("span")
        icon.setAttribute("aria-hidden", "true")
        icon.innerText = "×"
        const label = document.createElement("span")
        label.innerText = "Close"
        label.className = "sr-only"
        const button = document.createElement("button")
        button.setAttribute("type", "button")
        button.dataset.dismiss = "modal"
        button.className = "btn btn-default"
        button.append(icon, label)

        return button
    }

    #createBody() {
        const body = document.createElement("div")
        body.className = "modal-body"
        const manifest = chrome.runtime.getManifest()
        const description = manifest.description
        const version = manifest.version
        
        body.innerHTML = `
            <img src="${chrome.runtime.getURL('images/AES-logo-128.png')}">
            <h2>AirlineSim Enhancement Suite</h2>
            <p>Version ${version}</p>
            <p>Copyright &copy; 2020-2024 AES Authors. MIT License.</p>
        `

        return body
    }

    #setTarget() {
        const target = document.querySelector("body")
        return target
    }

    #mutationObserver() {
        const observer = new MutationObserver(this.#correctBootstrapBehaviour.bind(this))
        return observer
    }

    #correctBootstrapBehaviour() {
        if (this.#container.classList.contains("in") && !this.#container.classList.contains("modal")) {
            this.#container.classList.add("modal")
            this.#container.style = "display: block"
        }
    }
}

new AboutDialog()
