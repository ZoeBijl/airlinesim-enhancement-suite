/** Shared logic */
class AES {
    /**
     * Formats a currency value local standards
     * @param {integer} currency value
     * @param {string} alignment: "right" | "left"
     * @returns {HTMLElement} span with formatted value
     */
    static formatCurrency = (value, alignment) => {
        let container = document.createElement("span")
        let formattedValue = Intl.NumberFormat().format(value)
        let indicatorEl = document.createElement("span")
        let valueEl = document.createElement("span")
        let currencyEl = document.createElement("span")
        let containerClasses = "aes-no-text-wrap"
        
        if (alignment === "right") {
            containerClasses = "aes-text-right aes-no-text-wrap"
        }
        
        if (value >= 0) {
            valueEl.classList.add("good")
            indicatorEl.classList.add("good")
            indicatorEl.innerText = "+"
        }
        
        if (value < 0) {
            valueEl.classList.add("bad")
            indicatorEl.classList.add("bad")
            indicatorEl.innerText = "-"
            formattedValue = formattedValue.replace("-", "")
        }
        
        valueEl.innerText = formattedValue
        currencyEl.innerText = " AS$"
        
        container.className = containerClasses
        container.append(indicatorEl, valueEl, currencyEl)
        
        return container
    }
}
