class Validation {
    valid = true
    errors = []
    
    constructor() {
        this.checkAllFlightNumbersSelected()
        this.checkApplyToSettings()
        this.checkServiceClasses()
        this.checkFlightStatus()
        this.checkLoad()
        this.checkGroupByFlight()
    }
    
    /**
     * Check if “All Flight Numbers” tab is active
     */
    checkAllFlightNumbersSelected() {
        let message = "Please select \"All Flight Numbers\" under Current Inventory"
        let active = $('.col-md-10 > div > .as-panel:eq(1) > ul:eq(0) li:eq(0)').hasClass("active")
        if (!active) {
            this.valid = false
            this.errors.push(message)
        }
    }
    
    /**
     * Check “Apply settings to” are set correctly
     */
    checkApplyToSettings() {        
        let checkboxes = $('.col-md-10 > div > .as-panel:eq(1) > div > div > div:eq(0) fieldset:eq(2) > div input')
        let valid
        let messages = []
        checkboxes.each(function(index) {
            switch (index) {
                case 0:
                    if (!this.checked) {
                        let message = "Please check “Airport Pair” under “Apply settings to” in the “Settings”-panel"
                        valid = false
                        messages.push(message)
                    }
                    break
                case 1:
                    if (!this.checked) {
                        let message = "Please check “Flight Numbers” under “Apply settings to” in the “Settings”-panel"
                        valid = false
                        messages.push(message)
                    }
                    break
                case 2:
                    if (this.checked) {
                        let message = "Please uncheck “Return Airport Pair” under “Apply settings to” in the “Settings”-panel"
                        valid = false
                        messages.push(message)
                    }
                    break
                case 3:
                    if (this.checked) {
                        let message = "Please uncheck “Return Flight Numbers” under “Apply settings to” in the “Settings”-panel"
                        valid = false
                        messages.push(message)
                    }
                    break
            }
        })
        
        if (valid === false) {
            this.valid = valid
            this.errors.push(...messages)
        }
    }
    
    /**
     * Check that all “Service Classes” are selected
     */
    checkServiceClasses() {
        let valid
        let messages = []
        let container = $('.col-md-10 > div > .as-panel:eq(1) > div > div > div:eq(1) .layout-col-md-3')
        let labels = $('fieldset:eq(0) label', container)
        
        labels.each(function() {
            if (!$('input', this)[0].checked) {
                valid = false
                messages.push(`Please check “${$(this).text()}” under “Service Classes” in the “Data”-panel`)
            }
        })
        
        if (valid === false) {
            this.valid = valid
            this.errors.push(...messages)
        }
    }
    
    /**
     * Check that the correct “Flight Status” is selected
     */
    checkFlightStatus() {
        let valid
        let messages = []
        let container = $('.col-md-10 > div > .as-panel:eq(1) > div > div > div:eq(1) .layout-col-md-3')
        let labels = $('fieldset:eq(1) label', container)
        labels.each(function(index) {
            if (index === 1 || index === 2) {
                if (!$('input', this)[0].checked) {
                    let message = `Please check “${$(this).text()}” under “Flight Status” in the “Data”-panel`
                    valid = false
                    messages.push(message)
                }
            }
        })
        
        if (valid === false) {
            this.valid = valid
            this.errors.push(...messages)
        }
    }
    
    /**
     * Check “Load” settings
     */
    checkLoad() {
        let valid
        let messages = []
        let container = $('.col-md-10 > div > .as-panel:eq(1) > div > div > div:eq(1) .layout-col-md-3')
        
        $('fieldset:eq(2) div', container).each(function(index) {
            let valueAsInteger = parseInt($('select option:selected', this).text(), 10)

            // Minimum
            if (index === 0) {
                if (valueAsInteger != 0) {
                    let message = `Please select 0 for “${$('label', this).text()}” under “Load” in the “Data”-panel`
                    valid = false
                    messages.push(message)
                }
            }
            // Max
            if (index === 1) {
                if (valueAsInteger != 100) {
                    let message = `Please select 100 for “${$('label', this).text()}” under “Load” in the “Data”-panel`
                    valid = false
                    messages.push(message)
                }
            }
        });
        
        if (valid === false) {
            this.valid = valid
            this.errors.push(...messages)
        }
    }
    
    /**
     * Check “Group by flight” settings
     */
    checkGroupByFlight() {
        let valid
        let messages = []
        let container = $('.col-md-10 > div > .as-panel:eq(1) > div > div > div:eq(1) .layout-col-md-3')
        let checkboxes = $('fieldset:eq(3) input', container)
        if (checkboxes[0].checked) {
            let message = `Please uncheck “${$('fieldset:eq(3) label', container).text()}” under “Settings” in the “Data”-panel`
            valid = false
            messages.push(message)
        }
        
        if (valid === false) {
            this.valid = valid
            this.errors.push(...messages)
        }
    }
}
