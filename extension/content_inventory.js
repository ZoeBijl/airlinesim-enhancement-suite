"use strict";
//MAIN
//Global vars
var settings, pricingData, todayDate, analysis;
var aesmodule = { valid: 1, error: [] };

window.addEventListener("load", async (event) => {
    validateAllOptions()
    
    if (aesmodule.valid) {
        displayInventory()
    } else {
        displayValidationError()
    }
})

async function displayInventory() {
    const settingsData = await chrome.storage.local.get(['settings'])
    settings = settingsData.settings

    todayDate = parseInt(getCurrentDateTime().date, 10);
    //Get flights
    let flights = getFlights();
    let prices = getPriceDetails();
    let storageKey = getPricingInventoryKey();
    
    //Check if any snapshots saved
    let defaultPricingData = {
        server: storageKey.server,
        airline: storageKey.airline,
        type: storageKey.type,
        origin: storageKey.origin,
        destination: storageKey.destination,
        key: storageKey.key,
        date: {}
    }
    const storageData = await chrome.storage.local.get({[storageKey.key]: defaultPricingData})
    pricingData = storageData[storageKey.key]
        
    //Do Analysis
    analysis = getAnalysis(flights, prices, pricingData.date);
    //Display analysis
    displayAnalysis(analysis, prices);
    //Display history
    displayHistory(analysis);


    //Automation
    //Check if valid analysis exists
    if (analysis.hasValue('valid')) {
        //CHeck if updated todayDate
        if (pricingData.date[todayDate]) {
            //Today update exists
            //Check if pricing updated today
            if (pricingData.date[todayDate].pricingUpdated) {
                //Pricing updated today
                //Do nothing
            } else {
                //Pricing not updated today
                //Check if new price avaialble
                if (analysis.hasValue('newPrice')) {
                    //Update price
                    if (settings.invPricing.autoPriceUpdate) {
                        $('#aes-btn-invPricing-apply-new-prices').click();
                    }
                }
            }
        } else {
            //Today update does not exists
            //Check if new price avaialble
            if (analysis.hasValue('newPrice')) {
                //Update price
                if (settings.invPricing.autoPriceUpdate) {
                    $('#aes-btn-invPricing-apply-new-prices').click();
                } else if (settings.invPricing.autoAnalysisSave) {
                    $('#aes-btn-invPricing-save-snapshot').click();
                }
            } else {
                //Update data
                if (settings.invPricing.autoAnalysisSave) {
                    $('#aes-btn-invPricing-save-snapshot').click();
                }
            }
        }
    }
}

/**
 * Get Flights
 * @returns {array} flights - array of flight objects
 */
function getFlights() {
    const flights = []
    // TODO: also support grouped mode (#inventory-grouped-table)
    const flightRows = document.querySelectorAll("#inventory-table tbody tr")

    if (!flightRows) {
        throw new Error("\"Group by flight\" needs to be unchecked")
    }
    
    for (const row of flightRows) {
        const flight = getFlight(row)
        flights.push(flight)
    }

    return flights
}

/**
 * Get flight information and return as an object
 * @param {HTMLElement} row - the <tr> with flight information
 * @returns {object} flight - object with the parsed flight information
 */
function getFlight(row) {
    const cells = row.querySelectorAll("td")
    const flightNumber = cells[1].querySelector("a[href*=numbers").innerText
    const date = cells[2].innerText
    const compCode = getCompCode(cells[5].innerText)
    const capacity = cells[6].innerText
    const booked = cells[7].innerText
    const price = cells[9].innerText
    const status = cells[10].innerText.replace(/\s+/g, "")

    const flight = {
        fltNr: flightNumber,
        date: date,
        cmp: compCode,
        cap: AES.cleanInteger(capacity),
        bkd: AES.cleanInteger(booked),
        price: AES.cleanInteger(price),
        status: status
    }
    
    return flight
}

/**
 * Checks if the string is longer than one character and returns a string of "Cargo"
 * @param {string} text - localised word for "Cargo"
 * @returns {string} text - either passthrough of the input or "Cargo"
 */
function getCompCode(text) {
    if (!text) {
        throw new Error("no value provided for getCompCode")
    }
    
    if (text.length > 1) {
        return "Cargo"
    }
    
    return text
}

/**
 * Get Prices
 * @returns {object} prices
 */
function getPriceDetails() {
    const pricingRows = document.querySelectorAll(".pricing table tbody tr")
    const prices = {}
    
    for (const row of pricingRows) {
        const cells = row.querySelectorAll("td")
        const cmp = getCompCode(cells[0].innerText)
        const price = getPrice(cells)
        
        prices[cmp] = price
    }

    return prices
}

/**
 * Get price
 * @param {array} cells
 * @returns {object} price
 */
function getPrice(cells) {
    const currentPrice = AES.cleanInteger(cells[1].innerText)
    const defaultPrice = AES.cleanInteger(cells[4].innerText.replace(/\s+/g, ''))
    const currentPricePoint = getCurrentPricePoint(currentPrice, defaultPrice)
    const newPriceInput = cells[2].querySelector("input")
    
    const price = {
        currentPrice: currentPrice,
        defaultPrice: defaultPrice,
        currentPricePoint: currentPricePoint,
        newPriceInput: newPriceInput
    }
    
    return price
}

/**
 * @param {string} currentPrice
 * @param {string} defaultPrice
 * @returns {integer}
 */
function getCurrentPricePoint(currentPrice, defaultPrice) {
    return Math.round((currentPrice / defaultPrice) * 100)
}

//Get Analysis
function getAnalysis(flights, prices, storedData) {
    //Setup object

    let data = {
        Y: 0,
        C: 0,
        F: 0,
        Cargo: 0
    }
    let analysis = {
        data: data,
        getLoad: function(cmp) {
            if (this.data[cmp].valid) {
                return this.data[cmp].totalBkd / this.data[cmp].totalCap;
            } else {
                return 0;
            }
        },
        note: function(cmp) {
            if (this.data[cmp].valid) {
                if (this.data[cmp].useCurrentPrice) {
                    return "Current price analysis";
                } else {
                    return "No current price flights, using old price"
                }
            } else {
                return "No data for analysis";
            }
        },
        displayLoad: function(cmp) {
            if (this.data[cmp].valid) {
                return this.data[cmp].totalBkd + " / " + this.data[cmp].totalCap + " (" + displayPerc(Math.round(this.getLoad(cmp) * 100), 'load') + ")";
            } else {
                return '-';
            }
        },
        displayRec: function(cmp) {
            if (this.data[cmp].recommendation) {
                switch (this.data[cmp].recType) {
                    case 'good':
                        return '<span class="good">' + this.data[cmp].recommendation + '</span>';
                    case 'bad':
                        return '<span class="bad">' + this.data[cmp].recommendation + '</span>';
                    case 'neutral':
                        return '<span class="warning">' + this.data[cmp].recommendation + '</span>';
                    default:
                        return '<span class="warning">ERROR:2501 Wrong recType set:' + this.data[cmp].recType + '</span>';
                }
            } else {
                return '-'
            }
        },
        displayPrice: function(cmp, type) {
            switch (type) {
                case 'current':
                    return formatCurrency(this.data[cmp].currentPrice) + ' AS$ (' + displayPerc(this.data[cmp].currentPricePoint, 'price') + ')';
                case 'new':
                    if (this.data[cmp].newPrice) {
                        return formatCurrency(this.data[cmp].newPrice) + ' AS$ (' + displayPerc(this.data[cmp].newPricePoint, 'price') + ')';
                    } else {
                        return '-';
                    }
                case 'analysis':
                    if (this.data[cmp].valid) {
                        return formatCurrency(this.data[cmp].analysisPrice) + ' AS$ (' + displayPerc(this.data[cmp].analysisPricePoint, 'price') + ')';
                    } else {
                        return '-';
                    }
                default:
                    return '<span class="warning">ERROR:2502 Wrong type set:' + type + '</span>';
            }
        },
        displayIndex: function(cmp) {
            if (this.data[cmp].valid) {
                let span = $('<span></span>');
                if (this.data[cmp].index >= 90) {
                    return span.addClass('good').text(this.data[cmp].index);
                }
                if (this.data[cmp].index <= 50) {
                    return span.addClass('bad').text(this.data[cmp].index);
                }
                return span.addClass('warning').text(this.data[cmp].index);

            } else {
                return '-';
            }
        },
        displayTotalLoad: function(type) {
            let cmp = [];
            switch (type) {
                case 'all':
                    cmp = ['Y', 'C', 'F', 'Cargo'];
                    break;
                case 'pax':
                    cmp = ['Y', 'C', 'F'];
                    break;
                default:
                    // code block
            }
            let load, cap, bkd;
            load = cap = bkd = 0;
            for (let i = 0; i < cmp.length; i++) {
                if (this.data[cmp[i]].valid) {
                    cap += this.data[cmp[i]].totalCap;
                    bkd += this.data[cmp[i]].totalBkd;
                }
            }

            if (cap) {
                load = Math.round(bkd / cap * 100);
                return bkd + ' / ' + cap + ' (' + displayPerc(load, 'load') + ')';
            } else {
                return '-';
            }
        },
        displayTotalIndex: function(type) {
            let cmp = [];
            switch (type) {
                case 'all':
                    cmp = ['Y', 'C', 'F', 'Cargo'];
                    break;
                case 'pax':
                    cmp = ['Y', 'C', 'F'];
                    break;
                default:
                    // code block
            }
            let count, totalIndex;
            count = totalIndex = 0;
            for (let i = 0; i < cmp.length; i++) {
                if (this.data[cmp[i]].valid) {
                    count++;
                    totalIndex += this.data[cmp[i]].index;
                }
            }
            if (count) {
                totalIndex = Math.round(totalIndex / count);
                let span = $('<span></span>');
                if (totalIndex >= 90) {
                    return span.addClass('good').text(totalIndex);
                }
                if (totalIndex <= 50) {
                    return span.addClass('bad').text(totalIndex);
                }
                return span.addClass('warning').text(totalIndex);
            } else {
                return '-';
            }
        },
        hasValue: function(value) {
            for (let cmp in this.data) {
                if (this.data[cmp][value]) {
                    return 1;
                }
            }
            return 0;
        }
    };

    //Filter flights
    flights = flights.filter(function(flight) {
        return flight.status == 'finished' || flight.status == 'inflight';
    });

    //Check historical data
    if (storedData) {
        //Shouldbe function inside storage object
        var mostRecentDate;
        let dates = [];
        for (let date in storedData) {
            if (Number.isInteger(parseInt(date))) {
                dates.push(date)
            }
        }
        dates.reverse();
        var mostRecentDate = dates[0];
        var mostRecentData = storedData[mostRecentDate];
    } else {
        var mostRecentData = 0;
    }

    //extract each cmp analysis
    for (let cmp in analysis.data) {
        analysis.data[cmp] = {
            totalCap: 0,
            totalBkd: 0,
            valid: 0,
            analysisPrice: 0,
            analysisPricePoint: 0,
            useCurrentPrice: 0,
            currentPrice: prices[cmp].currentPrice,
            currentPricePoint: prices[cmp].currentPricePoint
        };
        let price = prices[cmp].currentPrice;
        //Only cmp flights
        let cmpFlights = flights.filter(function(flight) {
            return flight.cmp == cmp;
        });
        //if no cmp flights
        if (cmpFlights.length) {
            //Check if current price flights avaialble
            let flightsArray = cmpFlights.filter(function(flight) {
                return (flight.price == price);
            });
            if (flightsArray.length) {
                analysis.data[cmp].useCurrentPrice = 1;
                analysis.data[cmp].analysisPrice = price;
                analysis.data[cmp].analysisPricePoint = Math.round(price / prices[cmp].defaultPrice * 100);
                analysis.data[cmp].valid = 1;
            } else {
                //Check if historical data available


                if (mostRecentData) {
                    flightsArray = cmpFlights.filter(function(flight) {
                        return flight.price == mostRecentData.data[cmp].analysisPrice;
                    });
                    if (flightsArray.length) {
                        analysis.data[cmp].useCurrentPrice = 0;
                        analysis.data[cmp].analysisPrice = mostRecentData.data[cmp].analysisPrice;
                        analysis.data[cmp].analysisPricePoint = Math.round(mostRecentData.data[cmp].analysisPrice / prices[cmp].defaultPrice * 100);
                        analysis.data[cmp].valid = 1;
                    }
                }
            }
            if (analysis.data[cmp].valid) {
                flightsArray.forEach(function(flight) {
                    analysis.data[cmp].totalCap += flight.cap;
                    analysis.data[cmp].totalBkd += flight.bkd;
                });
            }
        }
    }

    //END extract each cmp analysis
    analysis = generateRecommendation(analysis, prices);

    //Make route index
    analysis = generateRouteIndex(analysis);
    return analysis;
}

function generateRecommendation(analysis, prices) {
    for (let cmp in analysis.data) {
        analysis.data[cmp].recommendation = 0;
        if (analysis.data[cmp].valid) {
            if (analysis.data[cmp].useCurrentPrice) {
                //Find recommendation
                let load = Math.round(analysis.getLoad(cmp) * 100);
                //Find step
                let step;
                for (let i in settings.invPricing.recommendation[cmp].steps) {
                    step = settings.invPricing.recommendation[cmp].steps[i];
                    if (load >= step.min && load <= step.max) {
                        break;
                    }
                }
                //Find new price point
                let newPricePoint = prices[cmp].currentPricePoint + step.step;
                //See if new price in bounds for Drop
                if (step.step < 0) {
                    analysis.data[cmp].recType = 'bad';
                    if (newPricePoint < settings.invPricing.recommendation[cmp].minPrice) {
                        newPricePoint = settings.invPricing.recommendation[cmp].minPrice;
                    }
                }
                //See if new price in bounds for Raise
                if (step.step > 0) {
                    analysis.data[cmp].recType = 'good';
                    if (newPricePoint > settings.invPricing.recommendation[cmp].maxPrice) {
                        newPricePoint = settings.invPricing.recommendation[cmp].maxPrice;
                    }
                }
                //see if already at highest/lowest price point
                if (step.step != 0) {
                    if (newPricePoint == prices[cmp].currentPricePoint) {
                        if (newPricePoint == settings.invPricing.recommendation[cmp].minPrice) {
                            //Already at lowest point
                            analysis.data[cmp].recommendation = 'Already at lowest price!';
                        }
                        if (newPricePoint == settings.invPricing.recommendation[cmp].maxPrice) {
                            //Already at highest point
                            analysis.data[cmp].recommendation = 'Already at highest price!';
                        }
                    }
                } else {
                    analysis.data[cmp].recType = 'neutral';
                }
                //check if not set by exceptions
                if (!analysis.data[cmp].recommendation) {
                    analysis.data[cmp].recommendation = step.name;
                    analysis.data[cmp].newPriceChange = step.step;
                    if (step.step) {
                        analysis.data[cmp].newPricePoint = newPricePoint;
                        analysis.data[cmp].newPrice = Math.round(newPricePoint / 100 * prices[cmp].defaultPrice);
                    }
                }
            }
        }
    }
    return analysis;
}

function generateRouteIndex(analysis) {
    //Each CMP index
    for (let cmp in analysis.data) {
        if (analysis.data[cmp].valid) {
            let index = (analysis.data[cmp].analysisPricePoint + (analysis.getLoad(cmp) * 100 * 3)) / 4;
            analysis.data[cmp].index = Math.round(index);
        }
    }
    return analysis;
}

//Display analysis
function displayAnalysis(analysis, prices) {

    //Build table
    let mainDiv = $(".container-fluid .row .col-md-10 div .as-panel:eq(0)");
    mainDiv.after(
        `
    <h3>Analysis (today's snapshot)</h3>
    <div id="aes-div-analysis" >
      <div class="as-panel">
        <div class="as-table-well">
          <table id="aes-table-analysis" class="table table-bordered table-striped table-hover">
          </table>
        </div>
      </div>
    </div>
    `
    );

    //Table head
    let th = [];
    th.push('<th>SC</th>');
    th.push('<th>Note</th>');
    th.push('<th class="aes-text-right">Analysis Price</th>');
    th.push('<th>Load</th>');
    th.push('<th class="aes-text-right">Index</th>');
    th.push('<th class="aes-text-right">Current Price</th>');
    th.push('<th>Recommendation</th>');
    th.push('<th class="aes-text-right">New Price</th>');
    let headRow = $('<tr></tr>').append(th);
    let thead = $('<thead></thead>').append(headRow);

    //Table body
    let tbody = $('<tbody></tbody>');
    for (let cmp in analysis.data) {
        let td = [];
        td.push('<td>' + cmp + '</td>');
        td.push('<td>' + analysis.note(cmp) + '</td>');
        td.push('<td class="aes-text-right">' + analysis.displayPrice(cmp, 'analysis') + '</td>');
        td.push('<td>' + analysis.displayLoad(cmp) + '</td>');
        td.push($('<td class="aes-text-right"></td>').html(analysis.displayIndex(cmp)));
        td.push('<td class="aes-text-right">' + analysis.displayPrice(cmp, 'current') + '</td>');
        td.push('<td>' + analysis.displayRec(cmp) + '</td>');
        td.push('<td class="aes-text-right">' + analysis.displayPrice(cmp, 'new') + '</td>');
        let row = $('<tr></tr>').append(td);
        tbody.append(row);
    }

    //Table footer
    let footRow = []
    footRow.push('<tr><td colspan="9"></td></tr>');
    //Total PAX
    let tf = [];
    tf.push('<th>Total PAX</th>');
    tf.push('<td colspan="2"></td>');
    tf.push($('<td></td>').html(analysis.displayTotalLoad('pax')));
    tf.push($('<td class="aes-text-right"></td>').html(analysis.displayTotalIndex('pax')));
    tf.push('<td colspan="3"></td>');
    footRow.push($('<tr></tr>').append(tf));
    //Total
    tf = [];
    tf.push('<th>Total PAX+Cargo</th>');
    tf.push('<td colspan="2"></td>');
    tf.push($('<td></td>').html(analysis.displayTotalLoad('all')));
    tf.push($('<td class="aes-text-right"></td>').html(analysis.displayTotalIndex('all')));
    tf.push('<td colspan="3"></td>');
    footRow.push($('<tr></tr>').append(tf));
    let tfoot = $('<tfoot></tfoot>').append(footRow);

    $("#aes-table-analysis").append(thead, tbody, tfoot);

    //Display pricing and data save buttons
    if (analysis.hasValue('valid')) {
        let invPricingAnalysisBar = $('<ul class="as-action-bar as-panel"></ul>');
        let invPricingAnalysisBarSpan = $('<span class="warning"></span>');
        invPricingAnalysisBar.append($('<li></li>').html(invPricingAnalysisBarSpan));
        $("#aes-div-analysis").prepend(invPricingAnalysisBar);
        //create buttons
        //Save Data
        let saveInvPricingBtn = $('<button class="btn btn-default" id="aes-btn-invPricing-save-snapshot"></button>');
        $(saveInvPricingBtn).click(function() {
            $(this).closest("li").remove();
            invPricingAnalysisBarSpan.text('Saving analysis data...');
            //Get updated time
            let updateTime = getCurrentDateTime().time;
            pricingData.date[todayDate] = analysis;
            pricingData.date[todayDate].updateTime = updateTime;
            pricingData.date[todayDate].date = todayDate;
            pricingData.date[todayDate].pricingUpdated = 0;
            chrome.storage.local.set({
                [pricingData.key]: pricingData }, function() {
                invPricingAnalysisBarSpan.removeClass().addClass("good").text("Data Saved!");
                //Automation
                if (settings.invPricing.autoClose) {
                    close();
                }
            });
        });

        //Update prices
        let applyNewPriceInvPricingBtn = $('<button class="btn btn-default" id="aes-btn-invPricing-apply-new-prices">apply new prices (and save data)</button>');
        $(applyNewPriceInvPricingBtn).click(function() {
            $(this).closest("ul").find("li button").closest("li").remove();
            invPricingAnalysisBarSpan.text('Updating prices...');
            //Get updated time
            let updateTime = getCurrentDateTime().time;
            pricingData.date[todayDate] = analysis;
            pricingData.date[todayDate].updateTime = updateTime;
            pricingData.date[todayDate].date = todayDate;
            pricingData.date[todayDate].pricingUpdated = 1;
            chrome.storage.local.set({
                [pricingData.key]: pricingData }, function() {
                $('[name="submit-prices"]').click();
            });
        });
        //Update new pricing input
        if (analysis.hasValue('newPrice')) {
            //Modify new price input
            for (let cmp in analysis.data) {
                if (analysis.data[cmp].newPrice) {
                    prices[cmp].newPriceInput.value = analysis.data[cmp].newPrice;
                }
            }
        }
        //For snapshot button
        if (pricingData.date[todayDate]) {
            //Today data does exist
            if (pricingData.date[todayDate].pricingUpdated) {
                //Today pricing updated
                invPricingAnalysisBarSpan.text("Today prices have been updated at: " + pricingData.date[todayDate].updateTime);

                //Automation
                if (settings.invPricing.autoClose) {
                    close();
                }
            } else {
                //Today pricing not updated
                invPricingAnalysisBarSpan.text("Today's snapshot data saved at: " + pricingData.date[todayDate].updateTime);
                $(invPricingAnalysisBar).append($('<li></li>').html(saveInvPricingBtn.text("save snapshot data again")));
                if (analysis.hasValue('newPrice')) {
                    $(invPricingAnalysisBar).append($('<li></li>').html(applyNewPriceInvPricingBtn));
                }
            }
        } else {
            //Today data does not exist
            $(invPricingAnalysisBar).append($('<li></li>').html(saveInvPricingBtn.text("save snapshot data")));
            if (analysis.hasValue('newPrice')) {
                $(invPricingAnalysisBar).append($('<li></li>').html(applyNewPriceInvPricingBtn));
            }
        }
    }
}

//Display History
function displayHistory(analysis) {
    //Prepare data
    let dates = [];
    //Get valid dates can add function here
    for (let date in pricingData.date) {
        if (Number.isInteger(parseInt(date))) {
            dates.push(date)
        }
    }
    dates.sort();
    //If historical data exist then build
    if (dates.length) {
        //Build Div
        let mainDiv = $("#aes-div-analysis");
        mainDiv.after('<h3>Historical Data</h3><div id="aes-div-invPricing-historicalData" class="as-panel"></div>');

        //History Options
        let fieldset = $('<fieldset></fieldset>').html('<legend>History Options</legend>');
        //Hide Now
        let option1 = $('<div class="checkbox"></div>').html('<label><input id="aes-check-inventory-history-showNow" type="checkbox"> Show "Now" collumn</label>');
        //Show only Priced
        let option2 = $('<div class="checkbox"></div>').html('<label><input id="aes-check-inventory-history-showOnlyPricing" type="checkbox"> Show only dates when pricing changed</label>');

        //Number of records
        let option3 = $('<select id="aes-select-inventory-history-numberPastDates" class="form-control input-sm"></select>').html('<option value="5">5 past dates</option><option value="10">10 past dates</option><option value="all">All past dates</option>')
        let wrapper = $('<div class="form-group"></div>').append('<label class="control-label"><span>Number of past dates</span></label>', option3);

        fieldset.append(option1, option2, wrapper);
        $("#aes-div-invPricing-historicalData").append(fieldset);
        //Default values
        if (settings.invPricing.historyTable.showNow) {
            $("#aes-check-inventory-history-showNow").prop("checked", true);
        }
        if (settings.invPricing.historyTable.showOnlyPricing) {
            $("#aes-check-inventory-history-showOnlyPricing").prop("checked", true);
        }
        $("#aes-select-inventory-history-numberPastDates").val(settings.invPricing.historyTable.numberOfDates);

        //Change events
        $("#aes-check-inventory-history-showNow").change(function() {
            if (this.checked) {
                settings.invPricing.historyTable.showNow = 1;
            } else {
                settings.invPricing.historyTable.showNow = 0;
            }
            chrome.storage.local.set({ settings: settings }, function() {});
            buildHistoryTable();
        });
        $("#aes-check-inventory-history-showOnlyPricing").change(function() {
            buildHistoryTable();
            if (this.checked) {
                settings.invPricing.historyTable.showOnlyPricing = 1;
            } else {
                settings.invPricing.historyTable.showOnlyPricing = 0;
            }
            chrome.storage.local.set({ settings: settings }, function() {});
        });
        $("#aes-select-inventory-history-numberPastDates").change(function() {
            settings.invPricing.historyTable.numberOfDates = $('#aes-select-inventory-history-numberPastDates').val();
            chrome.storage.local.set({ settings: settings }, function() {});
            buildHistoryTable();
        });

        buildHistoryTable();
    }
}

function buildHistoryTable() {
    //Clean previous table
    $('#aes-table-inventory-history').remove();

    let showNow = 0;
    let showOnlyPricing = 0;
    if ($('#aes-check-inventory-history-showNow:checked').length > 0) {
        showNow = 1;
    }
    if ($('#aes-check-inventory-history-showOnlyPricing:checked').length > 0) {
        showOnlyPricing = 1;
    }

    let numberOfDates = $('#aes-select-inventory-history-numberPastDates').val();
    switch (numberOfDates) {
        case '5':
            numberOfDates = 5;
            break;
        case '10':
            numberOfDates = 10;
            break;
        case 'all':
            numberOfDates = 0;
            break;
        default:
            numberOfDates = 10;
    }

    let dates = [];
    //Get valid dates can add function here
    for (let date in pricingData.date) {
        if (showOnlyPricing) {
            if (pricingData.date[date].pricingUpdated) {
                if (Number.isInteger(parseInt(date))) {
                    dates.push(date)
                }
            }
        } else {
            if (Number.isInteger(parseInt(date))) {
                dates.push(date)
            }
        }
    }
    dates.reverse();
    if (numberOfDates) {
        dates = dates.slice(0, numberOfDates);
    }
    dates.sort();
    if (dates.length) {

        //Headrows
        let th = ['<th></th>'];
        let th1 = ['<th>SC</th>'];
        for (let i = 0; i < dates.length; i++) {
            let date = dates[i];
            if (i) {
                th.push($('<th colspan="5"></th>').text(formatDate(date)));
                th1.push('<th class="aes-text-right">Price</th>');
                th1.push('<th>&Delta; %</th>');
                th1.push('<th>Load</th>');
                th1.push('<th>&Delta; %</th>');
                //Index
                th1.push('<th class="aes-text-right">Index</th>');
            } else {
                th.push($('<th colspan="3"></th>').text(formatDate(date)));
                th1.push('<th class="aes-text-right">Price</th>');
                th1.push('<th>Load</th>');
                //Index
                th1.push('<th class="aes-text-right">Index</th>');
            }
        }
        if (showNow) {
            //Now
            th.push($('<th colspan="4"></th>').text('Now'));
            th1.push('<th class="aes-text-right">Price</th>');
            th1.push('<th>&Delta; %</th>');
            th1.push('<th>Load</th>');
            th1.push('<th>&Delta; %</th>');
            //index
            th1.push('<th class="aes-text-right">Index</th>');
        }

        let headRow = $('<tr></tr>').append(th);
        let headRow2 = $('<tr></tr>').append(th1);
        let thead = $('<thead></thead>').append(headRow, headRow2);

        //Build table
        let compartments = ['Y', 'C', 'F', 'Cargo'];

        //Tbody rows
        let tbody = $('<tbody></tbody>');
        compartments.forEach(function(cmp) {
            let td = [];
            td.push($('<td></td>').text(cmp));
            //Historical tds
            for (let i = 0; i < dates.length; i++) {
                let date = dates[i];
                let data = pricingData.date[date].data[cmp];
                if (i) {
                    let prevData = pricingData.date[dates[i - 1]].data[cmp];
                    //Not first data point
                    td.push($('<td></td>').html(displayHistoryPrice(data)));
                    td.push($('<td class="aes-text-right"></td>').html(displayDifference(data, prevData).price));
                    td.push($('<td></td>').html(displayHistoryLoad(data)));
                    td.push($('<td></td>').html(displayDifference(data, prevData).load));
                    //index
                    td.push($('<td class="aes-text-right"></td>').html(historyDisplayIndex(data, 0)));
                } else {
                    //First data point
                    td.push($('<td class="aes-text-right"></td>').html(displayHistoryPrice(data)));
                    td.push($('<td></td>').html(displayHistoryLoad(data)));
                    //index
                    td.push($('<td class="aes-text-right"></td>').html(historyDisplayIndex(data, 0)));
                }
            }
            if (showNow) {
                //Now TDs
                let data = analysis.data[cmp];
                let prevData = pricingData.date[dates[dates.length - 1]].data[cmp];
                td.push($('<td class="aes-text-right"></td>').html(displayHistoryPrice(data)));
                td.push($('<td></td>').html(displayDifference(data, prevData).price));
                td.push($('<td></td>').html(displayHistoryLoad(data)));
                td.push($('<td></td>').html(displayDifference(data, prevData).load));
                //Index
                td.push($('<td class="aes-text-right"></td>').html(historyDisplayIndex(data, 0)));
            }

            //Finish row
            let row = $('<tr></tr>').append(td);
            tbody.append(row);
        });

        //Table footer Total Rows
        let totalCollumns = th1.length;
        let footRow = [];
        let footerRows = ['pax', 'all']
        footRow.push('<tr><td colspan="' + totalCollumns + '"></td></tr>');
        //Total PAX
        footerRows.forEach(function(type) {
            let tf = [];
            tf.push($('<th></th>').text(historyDisplayTotalText(type)));
            for (let i = 0; i < dates.length; i++) {
                let date = dates[i];
                let data = pricingData.date[date].data;
                if (i) {
                    tf.push('<td colspan="2"></td>');
                    tf.push($('<td></td>').html(historyDisplayTotal(data, type)));
                    tf.push('<td></td>');
                    //index
                    tf.push($('<td class="aes-text-right"></td>').html(historyDisplayIndex(data, type)));
                } else {
                    tf.push('<td></td>');
                    tf.push($('<td></td>').html(historyDisplayTotal(data, type)));
                    //index
                    tf.push($('<td class="aes-text-right"></td>').html(historyDisplayIndex(data, type)));
                }
            }
            if (showNow) {
                //Now
                let data = analysis.data;
                tf.push('<td colspan="2"></td>');
                tf.push($('<td></td>').html(historyDisplayTotal(data, type)));
                tf.push('<td></td>');
                //index
                tf.push($('<td class="aes-text-right"></td>').html(historyDisplayIndex(data, type)));
            }

            footRow.push($('<tr></tr>').append(tf));
        });

        let tfoot = $('<tfoot></tfoot>').append(footRow);
        let table = $('<table class="table table-bordered table-striped table-hover"></table>').append(thead, tbody, tfoot);
        let tableDiv = $('<div style="overflow-x:auto;" id="aes-table-inventory-history" class="as-table-well"></div>').append(table);

        $("#aes-div-invPricing-historicalData").append(tableDiv);
    }
}

//Validate
function validateAllOptions() {
    //Get all options
    //Check if all flight numbers selected
    let valid = $('.col-md-10 > div > .as-panel:eq(1) > ul:eq(0) li:eq(0)').hasClass("active");
    if (!valid) {
        aesmodule.valid = 0;
        aesmodule.error.push('Please select All Flight Numbers under Current Inventory');
        return;
    }
    //Check if Apply settings to correctly set
    $('.col-md-10 > div > .as-panel:eq(1) > div > div > div:eq(0) fieldset:eq(2) > div input').each(function(index) {
        switch (index) {
            case 0:
                if (!this.checked) {
                    aesmodule.valid = 0;
                    aesmodule.error.push('Please check Airport Pair under Apply settings to in Settings panel');
                }
                break;
            case 1:
                if (!this.checked) {
                    aesmodule.valid = 0;
                    aesmodule.error.push('Please check Flight Numbers under Apply settings to in Settings panel');
                }
                break;
            case 2:
                if (this.checked) {
                    aesmodule.valid = 0;
                    aesmodule.error.push('Please uncheck Return Airport Pair under Apply settings to in Settings panel');
                }
                break;
            case 3:
                if (this.checked) {
                    aesmodule.valid = 0;
                    aesmodule.error.push('Please uncheck Return Flight Numbers under Apply settings to in Settings panel');
                }
                break;
        }
    });
    //Check if Data settings correctly set
    let dataDiv = $('.col-md-10 > div > .as-panel:eq(1) > div > div > div:eq(1) .layout-col-md-3');
    //Service classes
    $('fieldset:eq(0) label', dataDiv).each(function() {
        if (!$('input', this)[0].checked) {
            aesmodule.valid = 0;
            aesmodule.error.push('Please check ' + $(this).text() + ' under Service Classes in Data panel');
        }
    });
    //Flight Status
    $('fieldset:eq(1) label', dataDiv).each(function(index) {
        if (index == 1 || index == 2) {
            if (!$('input', this)[0].checked) {
                aesmodule.valid = 0;
                aesmodule.error.push('Please check ' + $(this).text() + ' under Flight Status in Data panel');
            }
        }
    });
    //Load
    $('fieldset:eq(2) div', dataDiv).each(function(index) {
        if (!index) {
            //Minimum
            if (parseInt($('select option:selected', this).text(), 10) != 0) {
                aesmodule.valid = 0;
                aesmodule.error.push('Please select 0 for ' + $('label', this).text() + ' under Load in Data panel');
            }
        } else {
            //Max
            if (parseInt($('select option:selected', this).text(), 10) != 100) {
                aesmodule.valid = 0;
                aesmodule.error.push('Please select 100 for ' + $('label', this).text() + ' under Load in Data panel');
            }
        }
    });
    //Settings Group by flight
    if ($('fieldset:eq(3) input', dataDiv)[0].checked) {
        aesmodule.valid = 0;
        aesmodule.error.push('Please uncheck ' + $('fieldset:eq(3) label', dataDiv).text() + ' under Settings in Data panel');
    }
}

function displayValidationError() {
    let p = [];
    p.push($('<p></p>').text('AES Inventory Pricing Module could not be loaded because of errors:'));
    aesmodule.error.forEach(function(error) {
        p.push($('<p class="bad"></p>').html('<b>' + error + '</b>'));
    });
    p.push($('<p class="warning"></p>').html('Refresh the page after making adjustments.'));
    let panel = $('<div class="as-panel"></div>').append(p);
    let h2 = $('<h3></h3>').text('AES Inventory Pricing Module');
    let div = $('<div></div>').append(h2, panel);
    $('h1:eq(0)').after(h2, panel)
}

//History Table functions
function historyDisplayIndex(data, type) {
    let cmp = [];
    let index = 0;
    switch (type) {
        case 'all':
            cmp = ['Y', 'C', 'F', 'Cargo'];
            break;
        case 'pax':
            cmp = ['Y', 'C', 'F'];
            break;
        case 0:
            cmp = 0;
            break;
    }
    if (cmp) {
        //Multi index
        let count = 0;
        cmp.forEach(function(comp) {
            if (data[comp].valid) {
                index += data[comp].index;
                count++;
            }
        });
        index = Math.round(index / count);
    } else {
        //one cmp index
        if (data.valid) {
            index = data.index;
        }
    }
    if (index) {
        let span = $('<span></span>');
        if (index >= 90) {
            return span.addClass('good').text(index);
        }
        if (index <= 50) {
            return span.addClass('bad').text(index);
        }
        return span.addClass('warning').text(index);
    } else {
        return '-';
    }
}

function historyDisplayTotalText(type) {
    switch (type) {
        case 'all':
            return "Total PAX+Cargo";
        case 'pax':
            return "Total PAX";
    }
}

function historyDisplayTotal(data, type) {
    let cmp = [];
    switch (type) {
        case 'all':
            cmp = ['Y', 'C', 'F', 'Cargo'];
            break;
        case 'pax':
            cmp = ['Y', 'C', 'F'];
            break;
        default:
            // code block
    }
    let load, cap, bkd;
    load = cap = bkd = 0;
    cmp.forEach(function(comp) {
        if (data[comp].valid) {
            cap += data[comp].totalCap;
            bkd += data[comp].totalBkd;
        }
    });
    if (cap) {
        load = Math.round(bkd / cap * 100);
        return bkd + ' / ' + cap + ' (' + displayPerc(load, 'load') + ')';
    } else {
        return '-';
    }
}

function displayHistoryLoad(data) {
    if (data.valid) {
        let booked = data.totalBkd;
        let capacity = data.totalCap;
        let load = Math.round(booked / capacity * 100);
        return booked + ' / ' + capacity + ' (' + displayPerc(load, 'load') + ')';
    } else {
        return '-';
    }
}

function displayHistoryPrice(data) {
    if (data.valid) {
        let price = data.analysisPrice;
        let pricePoint = data.analysisPricePoint;
        return formatCurrency(price) + ' AS$ (' + displayPerc(pricePoint, 'price') + ')';
    } else {
        return '-';
    }
}

function displayDifference(current, old) {
    if (current.valid && old.valid) {
        let currentLoad = Math.round(current.totalBkd / current.totalCap * 100);
        let oldLoad = Math.round(old.totalBkd / old.totalCap * 100);
        let load = currentLoad - oldLoad;
        let price = current.analysisPricePoint - old.analysisPricePoint;
        return { load: load, price: price };
    } else {
        return { load: '-', price: '-' };
    }
}

function displayPerc(perc, type) {
    let span = $('<span></span>');
    switch (type) {
        case 'price':
            if (perc >= 100) {
                span.addClass('good').text(perc + "%");
                return span.prop('outerHTML');
            }
            if (perc < 75) {
                span.addClass('bad').text(perc + "%");
                return span.prop('outerHTML');
            }
            span.addClass('warning').text(perc + "%");
            return span.prop('outerHTML');
        case 'load':
            if (perc >= 70) {
                span.addClass('good').text(perc + "%");
                return span.prop('outerHTML');
            }
            if (perc < 40) {
                span.addClass('bad').text(perc + "%");
                return span.prop('outerHTML');
            }
            span.addClass('warning').text(perc + "%");
            return span.prop('outerHTML');
        default:
            return '<span class="warning">ERROR:2502 Wrong type set:' + type + '</span>';
    }
}
//Helper functions
function formatDate(date) {
    return date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6, 8);
}

function formatCurrency(value) {
    return Intl.NumberFormat().format(value)
}

function getPricingInventoryKey() {
    //Get Origin and Destination
    let x = $("h2:first a");
    let org = $(x[0]).text();
    let dest = $(x[1]).text();
    //get server
    let server = getServerName();
    //get airline code
    let airline = getAirlineCode();
    //create key
    let key = server + airline + org + dest + 'routeAnalysis';
    return { key: key, server: server, airline: airline, type: "routeAnalysis", origin: org, destination: dest }
}

function getServerName() {
    let server = window.location.hostname
    server = server.split('.');
    return server[0];
}

function getAirlineCode() {
    let airline = $("#inventory-grouped-table tbody a:first").text().split(" ");
    if (!airline[0]) {
        airline = $("#inventory-table tbody a:first").text().split(" ");
    }
    return airline[0];
}

function getCurrentDateTime() {
    let a = $(".as-footer-line-element:has('.fa-clock-o')").text().trim();
    let b = a.split(" ");
    //For date
    let dateTemp = b[0].split("-");
    let date;
    if (dateTemp.length == 1) {
        //German
        dateTemp = dateTemp[0].split(".");
        date = dateTemp.map(function(value) {
            return value.replace(/[^A-Za-z0-9]/g, '');
        });
        date = date[2] + date[1] + date[0];
    } else {
        //English
        date = dateTemp.map(function(value) {
            return value.replace(/[^A-Za-z0-9]/g, '');
        });
        date = date[0] + date[1] + date[2];
    }
    //For time
    let time = b[b.length - 2] + ' ' + b[b.length - 1];
    return { date: date, time: time };
}
