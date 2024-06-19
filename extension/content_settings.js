"use strict";
//MAIN
var settings;
$(function() {
    chrome.storage.local.get(['settings'], function(result) {
        settings = result.settings;
        displaySettings();
        settingDisplayHandle('Inventory Pricing')
    });
});

//FUNCTIONS MAIN
//Display settings
function settingDisplayHandle(value) {
    switch (value) {
        case 'Inventory Pricing':
            displayInvPricingSettings();
            break;
        case 'Flight Info':
            displayFlightInfoSettings();
            break;
        default:
            displayInvPricingSettings();
    }
}

function displaySettings() {
    let settingChoice = ['Inventory Pricing', 'Flight Info'];
    let rows = [];
    settingChoice.forEach(function(value, index) {
        let span = $('<span></span>').text(value);
        let a = $('<a href="#"></a>').html(span);
        let span1 = $('<span></span>');
        if (!index) {
            span1.addClass("fa fa-play")
        }
        let td = $('<td></td>').append(span1, a);
        a.click(function() {
            settingDisplayHandle(value);
            $('span', $(this).closest('tbody')).removeClass("fa fa-play");
            $('span:eq(0)', $(this).closest('td')).addClass("fa fa-play");
        });
        rows.push($('<tr></tr>').append(td));
    })
    let tbody = $('<tbody></tbody>').append(rows);
    let table = $('<table class="table"></table>').append(tbody);
    let divWell = $('<div class="as-table-well"></div>').append(table);
    let divPanel = $('<div class="as-panel"></div>').append(divWell);
    let h3 = $('<h3>Settings</h3>');
    let divmd2 = $('<div class="col-md-2"></div>').append(h3, divPanel);
    let divmd10 = $('<div id="aes-div-settingArea" class="col-md-10"></div>');
    let rowDiv = $('<div class="row"></div>').append(divmd2, divmd10);
    let h = $('<h2>AirlineSim Enhancement Suite Settings</h2>');
    let mainDiv = $(".container-fluid:eq(2)");
    mainDiv.prepend(h, rowDiv);
}
//FLight Info
function displayFlightInfoSettings() {
    if (!settings.flightInfo) {
        settings.flightInfo = { autoClose: 0 };
    }
    let input = $('<input type="checkbox">');
    if (settings.flightInfo.autoClose) {
        input.prop('checked', true);
    }
    $(input).click(function() {
        if (this.checked) {
            settings.flightInfo.autoClose = 1;
        } else {
            settings.flightInfo.autoClose = 0;
        }
        chrome.storage.local.set({ settings: settings }, function() {});
    });
    let span = $('<span></span>').text('Automatically close flight information page after extracting financial information.');
    let label = $('<label></label>').append(input, span);
    let checkboxDiv = $('<div class="checkbox"></div>').append(label);
    let panelDiv = $('<div class="as-panel"></div>').append(checkboxDiv);
    let h3 = $('<h3>Flight Information</h3>');
    let mainDiv = $("#aes-div-settingArea");
    mainDiv.empty();
    mainDiv.append(h3, panelDiv);
}
//Pricing
function displayInvPricingSettings() {
    let mainDiv = $("#aes-div-settingArea");
    mainDiv.empty();
    mainDiv.append(
        `
    <h3>Inventory Pricing</h3>
    <div class="as-panel">
      <div class="checkbox">
        <label>
          <input id="aes-input-inventory-automateSnapshotSave" type="checkbox">
          Automatically save analysis data when opening inventory page.
        </label>
        <br>
        <label>
          <input id="aes-input-automateInvPricing" type="checkbox">
          Automatically update price if there is any recommendation.
        </label>
        <br>
        <label>
          <input id="aes-input-inventory-automateCloseTab" type="checkbox">
          Automatically close inventory page if price or analysis is saved today (use when mass updating pricing/saving analysis)
        </label>
      </div>
      <div class="form-group">
        <label class="control-label">
          <span for="aes-select-invPricing-cmp">Compartment Recommendation Settings</span>
        </label>
        <select class="form-control" id="aes-select-invPricing-cmp">
          <option value="Y" selected="selected">Economy</option>
          <option value="C">Business</option>
          <option value="F">First</option>
          <option value="Cargo">Freight</option>
        </select>
      </div>
    </div>
    <div id="aes-div-recSettings">
    </div>

    `
    );

    invPricingAutoPricingHandle();
    invPricingRecStepHandle();
    $("#aes-select-invPricing-cmp").change(function() {
        invPricingRecStepHandle();
    });
}
//Pricing sub functions
function invPricingAutoPricingHandle() {
    //Set autoprice toggle
    if (settings.invPricing.autoAnalysisSave) {
        $("#aes-input-inventory-automateSnapshotSave").prop("checked", true);
    }
    if (settings.invPricing.autoPriceUpdate) {
        $("#aes-input-automateInvPricing").prop("checked", true);
    }
    if (settings.invPricing.autoClose) {
        $("#aes-input-inventory-automateCloseTab").prop("checked", true);
    }
    //Add click event to auto price
    $("#aes-input-inventory-automateSnapshotSave").click(function() {
        if (this.checked) {
            settings.invPricing.autoAnalysisSave = 1;
        } else {
            settings.invPricing.autoAnalysisSave = 0;
        }
        chrome.storage.local.set({ settings: settings }, function() {});
    });
    $("#aes-input-automateInvPricing").click(function() {
        if (this.checked) {
            settings.invPricing.autoPriceUpdate = 1;
        } else {
            settings.invPricing.autoPriceUpdate = 0;
        }
        chrome.storage.local.set({ settings: settings }, function() {});
    });
    $("#aes-input-inventory-automateCloseTab").click(function() {
        if (this.checked) {
            settings.invPricing.autoClose = 1;
        } else {
            settings.invPricing.autoClose = 0;
        }
        chrome.storage.local.set({ settings: settings }, function() {});
    });


}

function invPricingRecStepHandle() {
    let cmp = $("#aes-select-invPricing-cmp").val();
    $('#aes-div-recSettings').empty().append('<h3>' + cmp + ' Compartment Pricing Settings</h3>');
    let divRow = $('<div class="row as-panel"></div>')
    let divLeft = $('<div class="col-md-8"></div>')
    let divRight = $('<div class="col-md-4"></div>')
    let tableDiv = $('<div class="as-table-well"></div>')
    let table = $('<table id="aes-table-invPricing" class="table table-bordered table-striped table-hover"></table>');
    //Table head
    let thead = $('<thead></thead>');
    let headRow = $('<tr></tr>');
    headRow.append('<th>Name</th><th>From (Load %)</th><th>To (Load %)</th><th>Price Change %</th><th></th>');
    thead.append(headRow);
    //table body
    let tbody = $('<tbody></tbody>');
    settings.invPricing.recommendation[cmp].steps.forEach(function(value) {
        let row = $('<tr></tr>');
        row.append('<td><input type="text" class="form-control" value="' + value.name + '"></td>');
        row.append('<td><div class="input-group"><input type="text" class="form-control number" value="' + value.min + '" style="min-width: 50px;"><span class="input-group-addon">%</span></div></td>');
        row.append('<td><div class="input-group"><input type="text" class="form-control number" value="' + value.max + '" style="min-width: 50px;"><span class="input-group-addon">%</span></div></td>');
        row.append('<td><div class="input-group"><input type="text" class="form-control number" value="' + value.step + '" style="min-width: 50px;"><span class="input-group-addon">%</span></div></td>');
        row.append('<td><a class="aes-a-invPricing-delete-row" ><span class="fa fa-trash" title="Delete row"></span></a></td>');
        tbody.append(row);
    });
    //Table foot
    let tfoot = $('<tfoot></tfoot>');
    let footRow = $('<tr></tr>');
    footRow.append('<td colspan="8"><span>  </span><button id="aes-button-invPricing-add-row" class="btn btn-default">Add Row</button></td>');
    tfoot.append(footRow);

    table.append(thead, tbody, tfoot);
    tableDiv.append(table);
    divLeft.append(tableDiv);
    divRow.append(divLeft, divRight);

    $('#aes-div-recSettings').append(divRow);

    $("#aes-table-invPricing").on("click", ".aes-a-invPricing-delete-row", function() {
        $(this).closest("tr").remove();
    });

    $("#aes-button-invPricing-add-row").click(function() {
        let row = $('<tr></tr>');
        row.append('<td><input type="text" class="form-control"></td>');
        row.append('<td><div class="input-group"><input type="text" class="form-control number" style="min-width: 50px;"><span class="input-group-addon">%</span></div></td>');
        row.append('<td><div class="input-group"><input type="text" class="form-control number" style="min-width: 50px;"><span class="input-group-addon">%</span></div></td>');
        row.append('<td><div class="input-group"><input type="text" class="form-control number" style="min-width: 50px;"><span class="input-group-addon">%</span></div></td>');
        row.append('<td><a class="aes-a-invPricing-delete-row" ><span class="fa fa-trash" title="Delete row"></span></a></td>');
        $('#aes-table-invPricing tbody').append(row);
    });

    //Rights side
    divRight.append(`
    <fieldset id="aes-fieldset-invPricing">
      <legend>Min Max Price</legend>
      <div class="form-group">
        <label class="control-label">
            <span for="aes-input-invPricing-max-price">Maximum Price (% compared to default price)</span>
        </label>
        <div class="input-group">
        <input type="text" class="form-control number" id="aes-input-invPricing-max-price" value=` + settings.invPricing.recommendation[cmp].maxPrice + `>
        <span class="input-group-addon">%</span>
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">
            <span for="aes-input-invPricing-min-price">Minimum Price (% compared to default price)</span>
        </label>
        <div class="input-group">
        <input type="text" class="form-control number" id="aes-input-invPricing-min-price" value=` + settings.invPricing.recommendation[cmp].minPrice + `>
        <span class="input-group-addon">%</span>
        </div>
      </div>
      <div class="form-group">
        <button id="aes-btn-invPricing-save" class="btn btn-default">Save</button>
      </div>
    </fieldset>

  `);
    //Click save button
    $("#aes-btn-invPricing-save").click(function() {
        //Feedback
        $("#aes-span-invPricing").remove();
        let span = $('<span id="aes-span-invPricing" class="warning">Updating...</span>');
        $("#aes-fieldset-invPricing").append(span);

        let newSteps = [];
        let newCmpSettings = {
            maxPrice: parseInt($("#aes-input-invPricing-max-price").val(), 10),
            minPrice: parseInt($("#aes-input-invPricing-min-price").val(), 10),
            steps: newSteps
        }
        $("#aes-table-invPricing tbody tr").each(function() {
            newSteps.push({
                max: parseInt($(this).find("input:eq(2)").val(), 10),
                min: parseInt($(this).find("input:eq(1)").val(), 10),
                name: $(this).find("input:eq(0)").val(),
                step: parseInt($(this).find("input:eq(3)").val(), 10),
            });
        });

        //Sort Steps:
        newSteps.sort(function(a, b) {
            return a.min - b.min;
        });

        //Validate Steps
        if (validInvPriSteps(newCmpSettings)) {
            settings.invPricing.recommendation[cmp] = newCmpSettings;
            chrome.storage.local.set({ settings: settings }, function() {
                $("#aes-span-invPricing").removeClass().addClass("good").text('Inventory pricing settings for ' + cmp + ' saved!')
            });
        }
    });
}

function validInvPriSteps(newCmpSettings) {
    let steps = newCmpSettings.steps;
    //Check min max price
    if (!Number.isInteger(newCmpSettings.minPrice)) {
        $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! Min Price is not an integer!');
        return 0;
    } else {
        if (!(newCmpSettings.minPrice >= 0 && newCmpSettings.minPrice <= 200)) {
            $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! Min Price must be between 0% and 200%!');
            return 0;
        }
    }
    if (!Number.isInteger(newCmpSettings.maxPrice)) {
        $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! Max Price is not an integer!');
        return 0;
    } else {
        if (!(newCmpSettings.maxPrice >= 0 && newCmpSettings.maxPrice <= 200)) {
            $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! Max Price must be between 0% and 200%!');
            return 0;
        }
    }
    if (newCmpSettings.minPrice >= newCmpSettings.maxPrice) {
        $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! Min Price must be lower than Max Price!');
        return 0;
    }

    //Check steps
    for (let i = 0; i < steps.length; i++) {
        //Check if integer
        if (!Number.isInteger(steps[i].min)) {
            $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! For row with name "' + steps[i].name + '" From value is not an integer!');
            return 0;
        }
        if (!Number.isInteger(steps[i].max)) {
            $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! For row with name "' + steps[i].name + '" To value is not an integer!');
            return 0;
        }
        if (!Number.isInteger(steps[i].step)) {
            $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! For row with name "' + steps[i].name + '" Price Change value is not an integer!');
            return 0;
        }
        //Check if min and max correct
        if (steps[i].min >= steps[i].max) {
            $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! For row with name "' + steps[i].name + '" From value can not be equal or larger than To!');
            return 0;
        }

        //Check if min same as previous max
        if (i) {
            //not first rows
            if (steps[i].min != steps[i - 1].max) {
                $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! For row with name "' + steps[i].name + '" From value must be equal to To value of row with name "' + steps[i - 1].name + '" !');
                return 0;
            }
        } else {
            if (steps[i].min != 0) {
                $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! For row with name "' + steps[i].name + '" From value must start at 0%"' + steps[i - 1].name + '" !');
                return 0;
            }
        }
        if (i == (steps.length - 1)) {
            //Last row
            if (steps[i].max != 100) {
                $("#aes-span-invPricing").removeClass().addClass("bad").text('Save Failed! For row with name "' + steps[i].name + '" To value must end at 100%"' + steps[i - 1].name + '" !');
                return 0;
            }
        }
    }
    return 1;
}
