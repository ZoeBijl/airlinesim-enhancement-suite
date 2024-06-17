"use strict";
//MAIN
//Global vars
var settings, airline, server, todayDate;
$(function() {
    todayDate = AES.getServerDate();
    airline = AES.getAirlineCode();
    server = AES.getServerName();
    chrome.storage.local.get(['settings'], function(result) {
        settings = result.settings;

        displayDashboard();
        dashboardHandle();
        $("#aes-select-dashboard-main").change(function() {
            dashboardHandle();
        });
    });
});

function displayDashboard() {
    let mainDiv = $("#enterprise-dashboard");
    mainDiv.before(
        `
    <h3>AirlineSim Enhancement Suite Dashboard</h3>
    <div class="as-panel">
      <div class="form-group">
        <label class="control-label">
          <span for="aes-select-dashboard-main">Show Dashboard</span>
        </label>
        <select class="form-control" id="aes-select-dashboard-main">
          <option value="general" selected="selected">General</option>
          <option value="routeManagement">Route Management</option>
          <option value="competitorMonitoring">Competitor Monitoring</option>
          <option value="aircraftProfitability">Aircraft Profitability</option>
          <option value="other">None</option>
        </select>
      </div>
    </div>
    <div id="aes-div-dashboard">
    </div>
    `
    );
    $("#aes-select-dashboard-main").val(settings.general.defaultDashboard);
}

function dashboardHandle() {
    let value = $("#aes-select-dashboard-main").val();
    settings.general.defaultDashboard = value;
    chrome.storage.local.set({ settings: settings }, function() {});
    switch (value) {
        case 'general':
            displayGeneral();
            break;
        case 'routeManagement':
            displayRouteManagement();
            break;
        case 'competitorMonitoring':
            displayCompetitorMonitoring();
            break;
        case 'hr':
            displayHr();
            break;
        case 'aircraftProfitability':
            displayAircraftProfitability();
            break;
        default:
            displayDefault();
    }
}
//Route Management Dashbord
function displayRouteManagement() {
    //Check ROute Managemetn seetings
    if (!settings.routeManagement) {
        setDefaultRouteManagementSettings();
    }

    let mainDiv = $("#aes-div-dashboard");
    //Build layout
    mainDiv.empty();
    let title = $('<h3></h3>').text('Route Management');
    let div = $('<div id="aes-div-dashboard-routeManagement" class="as-panel"></div>');
    mainDiv.append(title, div);
    //Get schedule
    let scheduleKey = server + airline.code + 'schedule';
    chrome.storage.local.get([scheduleKey], function(result) {
        let scheduleData = result[scheduleKey];
        if (scheduleData) {
            // Table
            generateRouteManagementTable(scheduleData);

            // Option buttons
            let fieldsetEl = document.createElement("fieldset")
            let legendEl = document.createElement("legend")
            let buttonGroupEl = document.createElement("div")

            let buttonElements = {
                "selectFirstTen": {
                    "label": "select first 10"
                },
                "hideChecked": {
                    "label": "hide checked"
                },
                "openInventory": {
                    "label": "open inventory (max 10)"
                },
                "reloadTable": {
                    "label": "reload table"
                }
            }

            for (let key in buttonElements) {
                let buttonObj = buttonElements[key]
                let buttonEl = document.createElement("button")
                let buttonClassNames = buttonObj?.classNames
                let buttonType = buttonObj?.type
                let buttonDefaultClassNames = "btn btn-default"
                buttonEl.innerText = buttonObj.label

                if (buttonType) {
                    buttonEl.setAttribute("type", buttonType)
                } else {
                    buttonEl.setAttribute("type", "button")
                }

                if (buttonClassNames) {
                    buttonEl.className = buttonClassNames
                } else {
                    buttonEl.className = buttonDefaultClassNames
                }

                buttonObj.element = buttonEl
                buttonGroupEl.append(buttonEl)
            }

            legendEl.innerText = "Options"
            buttonGroupEl.classList.add("btn-group")

            fieldsetEl.append(legendEl, buttonGroupEl)

            let optionsDiv = $('<div class="col-md-4"></div>').append(fieldsetEl);

            // Button actions

            // Select first ten
            buttonElements["selectFirstTen"].element.addEventListener("click", function() {
                let count = 0
                $('#aes-table-routeManagement tbody tr').each(function() {
                    $(this).find("input").prop('checked', true);
                    count++;
                    if (count > 10) {
                        return false;
                    }
                })
            });

            // Remove checked
            buttonElements["hideChecked"].element.addEventListener("click", function() {
                $('#aes-table-routeManagement tbody tr').has('input:checked').remove();
            });

            // Open Inventory
            buttonElements["openInventory"].element.addEventListener("click", function() {
                //Get checked collumns
                let pages = $('#aes-table-routeManagement tbody tr').has('input:checked').map(function() {
                    let orgdest = $(this).attr('id');
                    orgdest = orgdest.split("-");
                    orgdest = orgdest[2];
                    //let orgdest = $(this).find("td:eq(1)").text() + $(this).find("td:eq(2)").text();
                    let url = 'https://' + server + '.airlinesim.aero/app/com/inventory/' + orgdest;
                    return url;
                }).toArray();

                //Open new tabs
                for (let i = 0; i < pages.length; i++) {
                    window.open(pages[i], '_blank');
                    if (i == 10) {
                        break;
                    }
                }
            });

            // Reload table reloadTable
            buttonElements["reloadTable"].element.addEventListener("click", function() {
                generateRouteManagementTable(scheduleData);
            });
            let divRow = $('<div class="row"></div>').append(optionsDiv, displayRouteManagementFilters(), displayRouteManagementCollumns())
            div.prepend(divRow);
            //Collumns selector Checkbox listener
            $('#aes-table-routeManagement-collumns input').change(function() {
                let show;
                if (this.checked) {
                    show = 1;
                } else {
                    show = 0;
                }
                let value = $(this).val();
                settings.routeManagement.tableCollumns.forEach(function(col) {
                    if (col.class == value) {
                        col.show = show;
                    }
                });
                chrome.storage.local.set({ settings: settings }, function() {});
            });

        } else {
            //no schedule
            div.append("Need schedule info to show this section. Change Dashboard to General -> Schedule -> Extract Schedule.")
        }
    });
}

function setDefaultRouteManagementSettings() {
    let collumns = [
        {
            name: 'Origin',
            class: 'aes-origin',
            number: 0,
            show: 1,
            value: 'origin'
    },
        {
            name: 'Destination',
            class: 'aes-destination',
            number: 0,
            show: 1,
            value: 'destination'
    },
        {
            name: 'Hub',
            class: 'aes-hub',
            number: 0,
            show: 1,
            value: 'hub'
    },
        {
            name: 'OD',
            class: 'aes-od',
            number: 0,
            show: 1,
            value: 'odName'
    },
        {
            name: 'Direction',
            class: 'aes-direction',
            number: 0,
            show: 1,
            value: 'direction'
    },
        {
            name: '# of flight numbers',
            class: 'aes-fltNr',
            number: 1,
            show: 1,
            value: 'fltNr'
    },
        {
            name: 'PAX frequency',
            class: 'aes-paxFreq',
            number: 1,
            show: 1,
            value: 'paxFreq'
    },
        {
            name: 'Cargo frequency',
            class: 'aes-cargoFreq',
            number: 1,
            show: 1,
            value: 'cargoFreq'
    },
        {
            name: 'Total Frequency',
            class: 'aes-totalFreq',
            number: 1,
            show: 1,
            value: 'totalFreq'
    },
        {
            name: 'Analysis date',
            class: 'aes-analysisDate',
            number: 0,
            show: 1
    },
        {
            name: 'Previous Analysis date',
            class: 'aes-analysisPreDate',
            number: 0,
            show: 1
    },
        {
            name: 'Pricing date',
            class: 'aes-pricingDate',
            number: 0,
            show: 1
    },
        {
            name: 'PAX load',
            class: 'aes-paxLoad',
            number: 1,
            show: 1
    },
        {
            name: 'PAX load &Delta;',
            class: 'aes-paxLoadDelta',
            number: 1,
            show: 1
    },
        {
            name: 'Cargo load',
            class: 'aes-cargoLoad',
            number: 1,
            show: 1
    },
        {
            name: 'Cargo load &Delta;',
            class: 'aes-cargoLoadDelta',
            number: 1,
            show: 1
    },
        {
            name: 'Total load',
            class: 'aes-load',
            number: 1,
            show: 1
    },
        {
            name: 'Total load &Delta;',
            class: 'aes-loadDelta',
            number: 1,
            show: 1
    },
        {
            name: 'PAX index',
            class: 'aes-paxIndex',
            number: 1,
            show: 1
    },
        {
            name: 'PAX index &Delta;',
            class: 'aes-paxIndexDelta',
            number: 1,
            show: 1
    },
        {
            name: 'Cargo index',
            class: 'aes-cargoIndex',
            number: 1,
            show: 1
    },
        {
            name: 'Cargo index &Delta;',
            class: 'aes-cargoIndexDelta',
            number: 1,
            show: 1
    },
        {
            name: 'Index',
            class: 'aes-index',
            number: 1,
            show: 1
    },
        {
            name: 'Index &Delta;',
            class: 'aes-indexDelta',
            number: 1,
            show: 1
    },
        {
            name: 'Route PAX index',
            class: 'aes-routeIndexPax',
            number: 1,
            show: 1
    },
        {
            name: 'Route Cargo index',
            class: 'aes-routeIndexCargo',
            number: 1,
            show: 1
    },
        {
            name: 'Route index',
            class: 'aes-routeIndex',
            number: 1,
            show: 1
    }
  ];
    settings.routeManagement = {
        tableCollumns: collumns,
        filter: []
    };
}

function routeManagementApplyFilter() {
    $('#aes-table-routeManagement tbody tr').each(function() {
        let row = this;
        settings.routeManagement.filter.forEach(function(filter) {
            let cell = $(row).find("." + filter.collumnCode).text();
            //if(cell){
            //Get collumn info if number or not
            let number;
            for (let i = 0; i < settings.routeManagement.tableCollumns.length; i++) {
                let collumn = settings.routeManagement.tableCollumns[i];
                if (filter.collumnCode == collumn.class) {
                    number = collumn.number;
                    break;
                }
            }
            let value = filter.value;
            if (number) {
                if (cell) {
                    cell = parseInt(cell, 10);
                }
                if (value) {
                    value = parseInt(value, 10);
                }
            }
            switch (filter.operation) {
                case '=':
                    if (cell != value) {
                        $(row).remove();
                    }
                    break;
                case '!=':
                    if (cell == value) {
                        $(row).remove();
                    }
                    break;
                case '>':
                    if (cell < value) {
                        $(row).remove();
                    }
                    break;
                case '<':
                    if (cell > value) {
                        $(row).remove();
                    }
            }
        });
    });
}

function displayRouteManagementFilters() {
    //Table head
    let th = [];
    th.push('<th>Column</th>');
    th.push('<th>Operation</th>');
    th.push('<th>Value</th>');
    th.push('<th></th>');
    let thead = $('<thead></thead>').append($('<tr></tr>').append(th));

    //Table body
    let tbody = $('<tbody></tbody>');
    settings.routeManagement.filter.forEach(function(fil) {
        let td = [];
        td.push('<td><input type="hidden" value="' + fil.collumnCode + '">' + fil.collumn + '</td>');
        td.push('<td>' + fil.operation + '</td>');
        td.push('<td>' + fil.value + '</td>');
        td.push('<td><a class="aes-a-routeManagement-filter-delete-row" ><span class="fa fa-trash" title="Delete row"></span></a></td>');
        tbody.append($('<tr></tr>').append(td));
    });

    //Table foot
    //select collumn
    let option1 = [];
    settings.routeManagement.tableCollumns.forEach(function(col) {
        option1.push('<option value="' + col.class + '">' + col.name + '</option>');
    });
    let select1 = $('<select id="aes-select-routeManagement-filter-collumn" class="form-control"></select>').append(option1);



    //Select value
    let option = [];
    option.push('<option>=</option>');
    option.push('<option>!=</option>');
    option.push('<option>></option>');
    option.push('<option><</option>');
    let select = $('<select id="aes-select-routeManagement-filter-operation" class="form-control"></select>').append(option);
    //Add button
    let btn = $('<button class="btn btn-default"></button>').text('Add Row');
    btn.click(function() {
        let td = [];
        let collumn = $(this).closest("tr").find('#aes-select-routeManagement-filter-collumn option:selected').text();
        let collumnVal = $(this).closest("tr").find('#aes-select-routeManagement-filter-collumn').val();
        let operation = $(this).closest("tr").find('#aes-select-routeManagement-filter-operation option:selected').text();
        let value = $(this).closest("tr").find('#aes-select-routeManagement-filter-value').val()
        td.push('<td><input type="hidden" value="' + collumnVal + '">' + collumn + '</td>');
        td.push('<td>' + operation + '</td>');
        td.push('<td>' + value + '</td>');
        td.push('<td><a class="aes-a-routeManagement-filter-delete-row" ><span class="fa fa-trash" title="Delete row"></span></a></td>');

        tbody.append($('<tr></tr>').append(td));
    });

    //Footer rows
    let tf = [];
    tf.push($('<td></td>').html(select1));
    tf.push($('<td></td>').html(select));
    tf.push('<td><input id="aes-select-routeManagement-filter-value" type="text" class="form-control" style="min-width: 50px;"></td>');
    tf.push($('<td></td>').append(btn));
    let tfoot = $('<tfoot></tfoot>').append($('<tr></tr>').append(tf));
    let table = $('<table class="table table-bordered table-striped table-hover" id="aes-table-routeManagement-filter"></table>').append(thead, tbody, tfoot);
    let divTable = $('<div id="aes-div-routeManagement-filter" class="as-table-well"></div>').append(table);


    //
    let saveBtn = $('<button class="btn btn-default">apply filter</button>');
    let saveSpan = $('<span></span>');

    //Closable legend
    let link = $('<a style="cursor: pointer;"></a>').text('Filters');
    let legend = $('<legend></legend>').html(link);
    link.click(function() {
        divForAll.toggle();
    });

    let divForAll = $('<div style="display: none;"></div>').append(divTable, saveBtn, saveSpan);
    let fieldset = $('<fieldset></fieldset>').append(legend, divForAll);
    let div = $('<div class="col-md-4"></div>').append(fieldset);

    //Delete row for filter row
    table.on("click", ".aes-a-routeManagement-filter-delete-row", function() {
        $(this).closest("tr").remove();
    });

    //Save Button
    saveBtn.click(function() {
        saveSpan.removeClass().addClass('warning').text(' saving...');
        let filter = [];
        $('#aes-table-routeManagement-filter tbody tr').each(function() {
            filter.push({
                collumnCode: $(this).find('input').val(),
                collumn: $(this).find('td:eq(0)').text(),
                operation: $(this).find('td:eq(1)').text(),
                value: $(this).find('td:eq(2)').text(),
            });
        });
        settings.routeManagement.filter = filter;
        chrome.storage.local.set({ settings: settings }, function() {
            saveSpan.removeClass().addClass('warning').text(' filtering...');
            routeManagementApplyFilter()
            saveSpan.removeClass().addClass('good').text(' done!');
        });
    });

    return div;
}

function displayRouteManagementCollumns() {
    //Table Head
    let th = [];
    th.push('<th>Show</th>');
    th.push('<th>Column</th>');
    let thead = $('<thead></thead>').append($('<tr></tr>').append(th));
    //Table body
    let tbody = $('<tbody></tbody>');

    settings.routeManagement.tableCollumns.forEach(function(col) {
        let td = [];
        //Checkbox
        if (col.show) {
            td.push('<td><input value="' + col.class + '" type="checkbox" checked></td>');
        } else {
            td.push('<td><input value="' + col.class + '" type="checkbox"></td>');
        }
        //Name
        td.push('<td>' + col.name + '</td>');
        tbody.append($('<tr></tr>').append(td));
    });

    let table = $('<table class="table table-bordered table-striped table-hover" id="aes-table-routeManagement-collumns"></table>').append(thead, tbody);
    let divTable = $('<div id="aes-div-routeManagement-collumns" class="as-table-well" style="display: none;"></div>').append(table);

    //Closable legend
    let link = $('<a style="cursor: pointer;"></a>').text('Columns');
    let legend = $('<legend></legend>').html(link);
    link.click(function() {
        $('#aes-div-routeManagement-collumns').toggle();
    });

    let fieldset = $('<fieldset></fieldset>').append(legend, divTable);
    let div = $('<div class="col-md-4"></div>').append(fieldset);
    return div;
}

function generateRouteManagementTable(scheduleData) {
    //Remove table
    $('#aes-div-routeManagement').remove();
    //Dates
    let dates = [];
    for (let date in scheduleData.date) {
        if (Number.isInteger(parseInt(date))) {
            dates.push(date);
        }
    }
    dates.reverse();
    //LatestSchedule
    let schedule = scheduleData.date[dates[0]].schedule;
    //Generate top
    //Table headers
    let collumns = settings.routeManagement.tableCollumns;

    //Generate table head
    let thead = $('<thead></thead>');
    let th = [];
    //Check box
    let checkbox = $('<input type="checkbox">');
    checkbox.change(function() {
        if (this.checked) {
            $('#aes-table-routeManagement tbody tr').each(function() {
                $(this).find("input").prop('checked', true);
            });
        } else {
            $('#aes-table-routeManagement tbody tr').each(function() {
                $(this).find("input").prop('checked', false);
            });
        }
    });
    th.push($('<th></th>').html(checkbox));
    collumns.forEach(function(col) {
        if (col.show) {
            let sort = $('<a></a>').html(col.name);
            sort.click(function() {
                routeManagementSortTable(col.class, col.number);
            });
            th.push($('<th style="cursor: pointer;"></th>').html(sort));
        }
    });
    //Add open inventory column
    th.push($('<th>Action</th>'));

    thead.append($('<tr></tr>').append(th));
    //Generate table rows
    let tbody = $('<tbody></tbody>');
    let uniqueOD = [];
    schedule.forEach(function(od) {
        //ODs for analysis
        uniqueOD.push(od.od);
        //Get values flight numbers and total frequency
        let fltNr = 0;
        let paxFreq = 0;
        let cargoFreq = 0;
        for (let flight in od.flightNumber) {
            cargoFreq += od.flightNumber[flight].cargoFreq,
                paxFreq += od.flightNumber[flight].paxFreq,
                fltNr++;
        }
        let totalFreq = cargoFreq + paxFreq;
        //hub
        let hub = od.od.slice(0, 3);
        let cellValue = {
            origin: od.origin,
            destination: od.destination,
            odName: od.od,
            direction: od.direction,
            fltNr: fltNr,
            paxFreq: paxFreq,
            cargoFreq: cargoFreq,
            totalFreq: totalFreq,
            hub: hub
        }
        //Table cells
        let cell = [];
        //Checkbox
        cell.push('<td><input type="checkbox"></td>');
        //Schedule
        collumns.forEach(function(col) {
            if (col.show) {
                if (col.value) {
                    cell.push($('<td></td>').addClass(col.class).text(cellValue[col.value]));
                } else {
                    cell.push($('<td></td>').addClass(col.class));
                }
            }
        });
        let rowId = od.origin + od.destination;

        //Add inventory button
        let invBtn = '<a class="btn btn-xs btn-default" href="https://' + server + '.airlinesim.aero/app/com/inventory/' + rowId + '">Inventory</a>'
        cell.push($('<td></td>').html(invBtn));

        let row = $('<tr id="aes-row-' + rowId + '"></tr>').append(cell);
        tbody.append(row);
    });
    let table = $('<table class="table table-bordered table-striped table-hover" id="aes-table-routeManagement"></table>').append(thead, tbody);
    let divTable = $('<div id="aes-div-routeManagement" class="as-table-well"></div>').append(table);
    $('#aes-div-dashboard-routeManagement').append(divTable)
    //Analysis collumns
    //Get unique ODs
    uniqueOD = [...new Set(uniqueOD)];
    for (let i = 0; i < uniqueOD.length; i++) {
        let origin = uniqueOD[i].substring(0, 3);
        let dest = uniqueOD[i].substring(3, 6);
        let keyOutbound = server + airline.code + origin + dest + 'routeAnalysis';
        let keyInbound = server + airline.code + dest + origin + 'routeAnalysis';
        chrome.storage.local.get([keyOutbound], function(outboundData) {
            chrome.storage.local.get([keyInbound], function(inboundData) {
                let outAnalysis = outboundData[keyOutbound];
                let inAnalysis = inboundData[keyInbound];
                let outDates, inDates;
                if (outAnalysis) {
                    outDates = getRouteAnalysisImportantDates(outAnalysis.date);
                }
                if (inAnalysis) {
                    inDates = getRouteAnalysisImportantDates(inAnalysis.date);
                }
                //Route index
                let routeIndex = {};
                let routeIndexPax, routeIndexCargo;
                if (outAnalysis && inAnalysis) {
                    if (outDates.analysis && inDates.analysis) {
                        let indexType = ['all', 'pax', 'cargo'];
                        indexType.forEach(function(type) {
                            let outIndex = getRouteAnalysisIndex(outAnalysis.date[outDates.analysis].data, type);
                            let inIndex = getRouteAnalysisIndex(inAnalysis.date[inDates.analysis].data, type);
                            if (outIndex && inIndex) {
                                routeIndex[type] = Math.round((outIndex + inIndex) / 2);
                            }
                        });
                    }
                }
                //For Outbound
                updateRouteAnalysisCollumns(outAnalysis, outDates, routeIndex);
                updateRouteAnalysisCollumns(inAnalysis, inDates, routeIndex);
            });
        });
    }
}

function routeManagementSortTable(collumn, number) {
    let tableRows = $('#aes-table-routeManagement tbody tr');
    let tableBody = $('#aes-table-routeManagement tbody');
    tableBody.empty();
    let indexes = [];
    tableRows.each(function() {
        if (number) {
            let value = parseInt($(this).find("." + collumn).text(), 10);
            if (value) {
                indexes.push(value);
            } else {
                indexes.push(0);
            }
        } else {
            indexes.push($(this).find("." + collumn).text());
        }
    });
    indexes = [...new Set(indexes)];
    let sorted = [...indexes];
    if (number) {
        sorted.sort(function(a, b) {
            if (a > b) return -1;
            if (a < b) return 1;
            if (a = b) return 0;
        });
    } else {
        sorted.sort();
    }
    let same = 1;
    for (let i = 0; i < indexes.length; i++) {
        if (indexes[i] !== sorted[i]) {
            same = 0;
        }
    }
    if (same) {
        if (number) {
            sorted.sort(function(a, b) {
                if (a < b) return -1;
                if (a > b) return 1;
                if (a = b) return 0;
            });
        } else {
            sorted.reverse();
        }
    }
    for (let i = 0; i < sorted.length; i++) {
        for (let j = tableRows.length - 1; j >= 0; j--) {
            if (number) {
                let value = parseInt($(tableRows[j]).find("." + collumn).text(), 10);
                if (!value) {
                    value = 0;
                }
                if (value == sorted[i]) {
                    tableBody.append($(tableRows[j]));
                    tableRows.splice(j, 1);
                }
            } else {
                if ($(tableRows[j]).find("." + collumn).text() == sorted[i]) {
                    tableBody.append($(tableRows[j]));
                    tableRows.splice(j, 1);
                }
            }
        }
    }
}

function updateRouteAnalysisCollumns(data, dates, routeIndex) {

    if (data) {
        let rowId = '#aes-row-' + data.origin + data.destination;

        if (dates.analysis) {
            //Analysis date
            $(rowId + ' .aes-analysisDate').text(AES.formatDateString(dates.analysis));

            //Pricing date
            if (dates.pricing) {
                $(rowId + ' .aes-pricingDate').text(AES.formatDateString(dates.pricing));
            }

            //Pax Load
            $(rowId + ' .aes-paxLoad').html(displayLoad(getRouteAnalysisLoad(data.date[dates.analysis].data, 'pax')));

            //Cargo Load
            $(rowId + ' .aes-cargoLoad').html(displayLoad(getRouteAnalysisLoad(data.date[dates.analysis].data, 'cargo')));

            //All Load
            $(rowId + ' .aes-load').html(displayLoad(getRouteAnalysisLoad(data.date[dates.analysis].data, 'all')));

            //PAX Index
            $(rowId + ' .aes-paxIndex').html(displayIndex(getRouteAnalysisIndex(data.date[dates.analysis].data, 'pax')));

            //Cargo Index
            $(rowId + ' .aes-cargoIndex').html(displayIndex(getRouteAnalysisIndex(data.date[dates.analysis].data, 'cargo')));

            //PAX Index
            $(rowId + ' .aes-index').html(displayIndex(getRouteAnalysisIndex(data.date[dates.analysis].data, 'all')));

            if (dates.analysisOneBefore) {
                //Previous analysis date
                $(rowId + ' .aes-analysisPreDate').text(AES.formatDateString(dates.analysisOneBefore));

                //Pax Load Delta
                $(rowId + ' .aes-paxLoadDelta').html(displayRouteAnalysisLoadDelta(data.date[dates.analysis].data, data.date[dates.analysisOneBefore].data, 'pax'));
                //Cargo Load Delta
                $(rowId + ' .aes-cargoLoadDelta').html(displayRouteAnalysisLoadDelta(data.date[dates.analysis].data, data.date[dates.analysisOneBefore].data, 'cargo'));
                //All Load Delta
                $(rowId + ' .aes-loadDelta').html(displayRouteAnalysisLoadDelta(data.date[dates.analysis].data, data.date[dates.analysisOneBefore].data, 'all'));

                //PAX Index Delta
                $(rowId + ' .aes-paxIndexDelta').html(displayRouteAnalysisIndexDelta(data.date[dates.analysis].data, data.date[dates.analysisOneBefore].data, 'pax'));
                //Cargo Index Delta
                $(rowId + ' .aes-cargoIndexDelta').html(displayRouteAnalysisIndexDelta(data.date[dates.analysis].data, data.date[dates.analysisOneBefore].data, 'cargo'));
                //PAX Index Delta
                $(rowId + ' .aes-indexDelta').html(displayRouteAnalysisIndexDelta(data.date[dates.analysis].data, data.date[dates.analysisOneBefore].data, 'all'));
            }

            //Route Index
            if (routeIndex.pax) {
                $(rowId + ' .aes-routeIndexPax').html(displayIndex(routeIndex.pax));
            }
            if (routeIndex.cargo) {
                $(rowId + ' .aes-routeIndexCargo').html(displayIndex(routeIndex.cargo));
            }
            if (routeIndex.all) {
                $(rowId + ' .aes-routeIndex').html(displayIndex(routeIndex.all));
            }
        }
    }

    return;
    let analysisDate = dates.analysis;
    let pricingDate = dates.pricing;
    let paxLoad;
    let paxLoadDelta;
    let cargoLoad;
    let cargoLoadDelta;
    let totalLoad;
    let totalLoadDelta;

    outDates = getInvPricingAnalaysisPricingDate(dataOut.date);
    if (outDates.analysis) {
        $('#aes-row-invPricing-' + origin + dest + '-analysis', tbody).text(AES.formatDateString(outDates.analysis));
        outIndex = dataOut.date[outDates.analysis].routeIndex;
        let td = $('#aes-row-invPricing-' + origin + dest + '-OWindex', tbody);
        td.html(displayIndex(outIndex));
        if (outDates.analysisOneBefore) {
            outIndexChange = dataOut.date[outDates.analysis].routeIndex - dataOut.date[outDates.analysisOneBefore].routeIndex
            td.append(displayIndexChange(outIndexChange));
        }
    }
    if (outDates.pricing) {
        $('#aes-row-invPricing-' + origin + dest + '-pricing', tbody).text(AES.formatDateString(outDates.pricing));
    }
}

function displayRouteAnalysisLoadDelta(dataCurrent, dataPrevious, type) {
    let load = getRouteAnalysisLoad(dataCurrent, type);
    let preLoad = getRouteAnalysisLoad(dataPrevious, type);
    if (load && preLoad) {
        let diff = load - preLoad;
        let span = $('<span></span>');
        if (diff > 0) {
            span.addClass('good').text('+' + diff + "%");
            return span;
        }
        if (diff < 0) {
            span.addClass('bad').text(diff + "%");
            return span;
        }
        span.addClass('warning').text(diff + "%");
        return span;
    }
}

function displayRouteAnalysisIndexDelta(dataCurrent, dataPrevious, type) {
    let index = getRouteAnalysisIndex(dataCurrent, type);
    let preIndex = getRouteAnalysisIndex(dataPrevious, type);
    if (index && preIndex) {
        let diff = index - preIndex;
        let span = $('<span></span>');
        if (diff > 0) {
            span.addClass('good').text('+' + diff);
            return span;
        }
        if (diff < 0) {
            span.addClass('bad').text(diff);
            return span;
        }
        span.addClass('warning').text(diff);
        return span;
    }
}

function getRouteAnalysisLoad(data, type) {
    let cmp = [];
    switch (type) {
        case 'all':
            cmp = ['Y', 'C', 'F', 'Cargo'];
            break;
        case 'pax':
            cmp = ['Y', 'C', 'F'];
            break;
        case 'cargo':
            cmp = ['Cargo'];
            break;
        default:
            // code block
    }
    let cap, bkd;
    cap = bkd = 0;
    cmp.forEach(function(comp) {
        if (data[comp].valid) {
            cap += data[comp].totalCap;
            bkd += data[comp].totalBkd;
        }
    });
    if (cap) {
        return Math.round(bkd / cap * 100);
    } else {
        return 0;
    }
}

function displayLoad(load) {
    if (load) {
        let span = $('<span></span>');
        if (load >= 70) {
            span.addClass('good').text(load + "%");
            return span;
        }
        if (load < 40) {
            span.addClass('bad').text(load + "%");
            return span;
        }
        span.addClass('warning').text(load + "%");
        return span;
    }
}

function getRouteAnalysisIndex(data, type) {
    let cmp = [];
    let index = 0;
    switch (type) {
        case 'all':
            cmp = ['Y', 'C', 'F', 'Cargo'];
            break;
        case 'pax':
            cmp = ['Y', 'C', 'F'];
            break;
        case 'cargo':
            cmp = ['Cargo'];
            break;
        default:
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
        if (index) {
            return Math.round(index / count);
        }
    }
}

function getRouteAnalysisImportantDates(dates) {
    //Get latest analysis and pricing date
    let latest = {
        analysis: 0,
        pricing: 0,
        analysisOneBefore: 0,
        pricingOneBefore: 0
    }
    let analysisDates = [];
    let pricingDates = []
    for (let date in dates) {
        if (Number.isInteger(parseInt(date))) {
            if (dates[date].pricingUpdated) {
                pricingDates.push(date);
            }
            analysisDates.push(date);
        }
    }
    analysisDates.reverse();
    pricingDates.reverse();
    if (analysisDates.length) {
        latest.analysis = analysisDates[0];
        if (analysisDates[1]) {
            latest.analysisOneBefore = analysisDates[1];
        }
    }
    if (pricingDates.length) {
        latest.pricing = pricingDates[0];
        if (pricingDates[1]) {
            latest.pricingOneBefore = pricingDates[1];
        }
    }
    return latest;
}

function displayIndex(index) {
    let span = $('<span></span>');
    if (index >= 90) {
        return span.addClass('good').text(index);
    }
    if (index <= 50) {
        return span.addClass('bad').text(index);
    }
    return span.addClass('warning').text(index);
}

function displayIndexChange(index) {
    if (index > 0) {
        return ' (<span class="good">+' + index + '</span>)';
    }
    if (index < 0) {
        return ' (<span class="bad">' + index + '</span>)';
    }
    return ' (<span class="warning">' + index + '</span>)';
}
//Display General
function displayGeneral() {
    let mainDiv = $("#aes-div-dashboard");
    mainDiv.empty();

    //Table
    //Head cells
    let th1 = $('<th>Area</th>');
    let th2 = $('<th>Status</th>');
    let th3 = $('<th>Action</th>');
    let headRow = $('<tr></tr>').append(th1, th2, th3);
    let thead = $('<thead></thead>').append(headRow);
    //Body cells
    let tbody = $('<tbody></tbody>');
    generalAddScheduleRow(tbody);
    generalAddPersonelManagementRow(tbody);


    let table = $('<table class="table table-bordered table-striped table-hover"></table>').append(thead, tbody);
    //Build layout
    let divTable = $('<div class="as-table-well"></div>').append(table);
    let title = $('<h3></h3>').text('General');
    let div = $('<div id="aes-div-dashboard-general" class="as-panel"></div>').append(divTable);
    mainDiv.append(title, div);
}

//Display COmpetitor Monitoring
function displayCompetitorMonitoring() {
    //Div
    let div = $('<div id="aes-div-dashboard-competitorMonitoring" class="as-panel"></div>');

    //Check ROute Managemetn seetings
    //
    if (!settings.competitorMonitoring) {
        setDefaultCompetitorMonitoringSettings();
    }

    //Display airlines table
    displayCompetitorMonitoringAirlinesTable(div);

    let mainDiv = $("#aes-div-dashboard");
    //Build layout
    mainDiv.empty();
    let title = $('<h3></h3>').text('Competitor Monitoring');
    mainDiv.append(title, div);

}

function displayCompetitorMonitoringAirlinesTable(div) {

    const languageTag = AES.getASLanguageTag();
    let compAirlines = [];
    let compAirlinesSchedule = [];
    chrome.storage.local.get(null, function(items) {
        //Get data
        for (let key in items) {
            if (items[key].type) {
                if (items[key].type == 'competitorMonitoring') {
                    if (items[key].server == server) {
                        if (items[key].tracking) {
                            compAirlines.push(items[key]);
                        }
                    }
                }
                if (items[key].type == 'schedule') {
                    if (items[key].server == server) {
                        let airline = items[key].airline
                        compAirlinesSchedule[airline] = items[key];
                    }
                }
            }
        }

        //Check if any airlines exist
        let rows = [];
        let hrows = [];
        if (compAirlines.length) {
            //head
            //second head collumns
            let firstHead = {};
            let th = [];
            settings.competitorMonitoring.tableColumns.forEach(function(col) {
                if (col.visible) {
                    //Sort
                    let sort = $('<a></a>').html(col.text);
                    sort.click(function() {
                        CompetitorMonitoringSortTable(col.field, col.number);
                    });
                    th.push($('<th style="cursor: pointer;"></th>').html(sort));
                    if (firstHead[col.headGroup]) {
                        firstHead[col.headGroup]++;
                    } else {
                        firstHead[col.headGroup] = 1;
                    }
                }
            });
            //first head
            let th1 = [];
            for (let titles in firstHead) {
                th1.push($('<th colspan="' + firstHead[titles] + '"></th>').text(titles));
            }
            hrows.push($('<tr></tr>').append(th1));
            hrows.push($('<tr></tr>').append(th));

            //Data collumns

            compAirlines.forEach(function myFunction(value) {
                let data = {};
                //Airline
                data.airlineId = value.id;
                //All Tab0 Collumns
                let dates = [];
                for (let date in value.tab0) {
                    dates.push(date);
                }
                dates.sort(function(a, b) { return b - a });
                if (dates.length) {
                    data.airlineCode = value.tab0[dates[0]].code;
                    data.airlineName = value.tab0[dates[0]].displayName;
                    data.overviewDate = AES.formatDateString(dates[0]);
                    data.overviewRating = value.tab0[dates[0]].rating;
                    data.overviewTotalPax = value.tab0[dates[0]].pax;
                    data.overviewTotalCargo = value.tab0[dates[0]].cargo;
                    data.overviewStations = value.tab0[dates[0]].stations;
                    data.overviewFleet = value.tab0[dates[0]].fleet;
                    data.overviewStaff = value.tab0[dates[0]].employees;
                    //If previous date exists
                    if (dates[1]) {
                        data.overviewPreDate = AES.formatDateString(dates[1]);
                        data.overviewRatingDelta = getDelta(getRatingNr(data.overviewRating), getRatingNr(value.tab0[dates[1]].rating));
                        data.overviewTotalPaxDelta = getDelta(data.overviewTotalPax, value.tab0[dates[1]].pax);
                        data.overviewTotalCargoDelta = getDelta(data.overviewTotalCargo, value.tab0[dates[1]].cargo);
                        data.overviewStationsDelta = getDelta(data.overviewStations, value.tab0[dates[1]].stations);
                        data.overviewFleetDelta = getDelta(data.overviewFleet, value.tab0[dates[1]].fleet);
                        data.overviewStaffDelta = getDelta(data.overviewStaff, value.tab0[dates[1]].employees);
                    }
                }
                //All Tab2 Collumns
                dates = [];
                for (let date in value.tab2) {
                    dates.push(date);
                }
                dates.sort(function(a, b) { return b - a });
                if (dates.length) {
                    data.fafWeek = AES.formatDateStringWeek(value.tab2[dates[0]].week);
                    data.fafAirportsServed = value.tab2[dates[0]].airportsServed;
                    data.fafOperatedFlights = value.tab2[dates[0]].operatedFlights;
                    data.fafSeatsOffered = value.tab2[dates[0]].seatsOffered;
                    data.fafsko = value.tab2[dates[0]].sko;
                    data.fafCargoOffered = value.tab2[dates[0]].cargoOffered;
                    data.faffko = value.tab2[dates[0]].fko;
                    //If previous date exists
                    if (dates[1]) {
                        data.fafWeekPre = AES.formatDateStringWeek(value.tab2[dates[1]].week);
                        data.fafAirportsServedDelta = getDelta(data.fafAirportsServed, value.tab2[dates[1]].airportsServed);
                        data.fafOperatedFlightsDelta = getDelta(data.fafOperatedFlights, value.tab2[dates[1]].operatedFlights);
                        data.fafSeatsOfferedDelta = getDelta(data.fafSeatsOffered, value.tab2[dates[1]].seatsOffered);
                        data.fafskoDelta = getDelta(data.fafsko, value.tab2[dates[1]].sko);
                        data.fafCargoOfferedDelta = getDelta(data.fafCargoOffered, value.tab2[dates[1]].cargoOffered);
                        data.faffkoDela = getDelta(data.faffko, value.tab2[dates[1]].fko);
                    }
                }
                //Schedule Collumns
                if (compAirlinesSchedule[data.airlineCode]) {
                    dates = [];
                    for (let date in compAirlinesSchedule[data.airlineCode].date) {
                        dates.push(date);
                    }
                    dates.sort(function(a, b) { return b - a });
                    if (dates.length) {
                        let hubs = {};
                        //For display
                        data.scheduleDate = AES.formatDateString(dates[0]);
                        //For table
                        data.scheduleDateUse = dates[0];
                        data.scheduleCargoFreq = 0;
                        data.schedulePAXFreq = 0;
                        data.scheduleFltNr = 0;
                        compAirlinesSchedule[data.airlineCode].date[dates[0]].schedule.forEach(function(schedule) {
                            //Hubs
                            let hub = schedule.od.slice(0, 3);
                            if (hubs[hub]) {
                                hubs[hub]++;
                            } else {
                                hubs[hub] = 1;
                            }
                            for (let flight in schedule.flightNumber) {
                                //Cargo Freq
                                data.scheduleCargoFreq += schedule.flightNumber[flight].cargoFreq;
                                //Pax Freq
                                data.schedulePAXFreq += schedule.flightNumber[flight].paxFreq;
                                //Flight nr
                                data.scheduleFltNr++;
                            }
                        });
                        //Total Frequency
                        data.scheduleTotalFreq = data.schedulePAXFreq + data.scheduleCargoFreq;
                        //Hubs
                        let hubArray = [];
                        for (let hub in hubs) {
                            hubArray.push([hub, hubs[hub]]);
                        }
                        hubArray.sort(function(a, b) {
                            return b[1] - a[1];
                        });
                        data.scheduleHubs = '';
                        hubArray.forEach(function(hubA, index) {
                            if (index) {
                                data.scheduleHubs += ', ';
                            }
                            data.scheduleHubs += hubA[0] + ' (' + hubA[1] + ')';
                        });

                        //Previous schedule data
                        if (dates[1]) {
                            data.scheduleDatePre = AES.formatDateString(dates[1]);
                            data.scheduleCargoFreqPre = 0;
                            data.schedulePAXFreqPre = 0;
                            data.scheduleFltNrPre = 0;
                            compAirlinesSchedule[data.airlineCode].date[dates[1]].schedule.forEach(function(schedule) {
                                //Hubs
                                let hub = schedule.od.slice(0, 3);
                                if (hubs[hub]) {
                                    hubs[hub]++;
                                } else {
                                    hubs[hub] = 1;
                                }
                                for (let flight in schedule.flightNumber) {
                                    //Cargo Freq
                                    data.scheduleCargoFreqPre += schedule.flightNumber[flight].cargoFreq;
                                    //Pax Freq
                                    data.schedulePAXFreqPre += schedule.flightNumber[flight].paxFreq;
                                    //Flight nr
                                    data.scheduleFltNrPre++;
                                }
                            });
                            //Total Frequency
                            data.scheduleTotalFreqPre = data.schedulePAXFreq + data.scheduleCargoFreq;
                            //Delta Collumns
                            data.scheduleFltNrDelta = getDelta(data.scheduleFltNr, data.scheduleFltNrPre);
                            data.schedulePAXFreqDelta = getDelta(data.schedulePAXFreq, data.schedulePAXFreqPre);
                            data.scheduleCargoFreqDelta = getDelta(data.scheduleCargoFreq, data.scheduleCargoFreqPre);
                            data.scheduleTotalFreqDelta = getDelta(data.scheduleTotalFreq, data.scheduleTotalFreqPre);
                        }
                    }
                }
                //Action collumns
                //Open airline
                data.actionOpenAirline = '<a class="btn btn-xs btn-default" href="/app/info/enterprises/' + data.airlineId + '">Airline</a>';
                //Open schedule
                if (compAirlinesSchedule[data.airlineCode]) {
                    data.actionOpenSchedule = $('<button type="button" id="aes-compMon-btn-schedule-' + data.airlineCode + '" class="btn btn-xs btn-default">Schedule</button>');
                    //Create schedule table
                    $('#aes-div-dashboard').on('click', 'button#aes-compMon-btn-schedule-' + data.airlineCode, function() {
                        displayCompetitorMonitoringAirlineScheduleTable(div, compAirlinesSchedule[data.airlineCode], data);
                    });
                }
                //Remove airline '
                data.actionRemoveAirline = $('<button type="button" id="aes-compMon-btn-remove-' + data.airlineCode + '" class="btn btn-xs btn-default">Remove</button>');
                //Remove airline action
                $('#aes-div-dashboard').on('click', 'button#aes-compMon-btn-remove-' + data.airlineCode, function() {
                    let key = server + data.airlineId + 'competitorMonitoring';
                    let remove = $(this);
                    chrome.storage.local.get([key], function(compMonitoringData) {
                        let compData = compMonitoringData[key];
                        compData.tracking = 0;
                        chrome.storage.local.set({
                            [compData.key]: compData }, function() {
                            $(remove).closest("tr").remove();
                        });
                    });
                });

                //Populate collumns
                let td = [];
                const numberFormat = new Intl.NumberFormat(languageTag);

                settings.competitorMonitoring.tableColumns.forEach(function(col) {
                    if (col.visible) {
                        if ((col.field !== 'airlineId') && (isFinite(data[col.field]))) {
                            td.push($('<td class="aes-' + col.field + '"></td>').html(numberFormat.format(data[col.field])));
                        } else {
                            td.push($('<td class="aes-' + col.field + '"></td>').html(data[col.field]));
                        }
                    }
                });
                rows.push($('<tr></tr>').append(td));

            });
        } else {
            rows.push('<tr><td><span class="warning">No airlines marked for competitor monitoring. Open airline info page to mark airline for tracking.</span></td></tr>');
        }

        let thead = $('<thead></thead>').append(hrows);
        let tbody = $('<tbody></tbody>').append(rows);

        let table = $('<table id="aes-table-competitorMonitoring" class="table table-bordered table-striped table-hover"></table>').append(thead, tbody);
        let tableWell = $('<div style="overflow-x:auto;" class="as-table-well"></div>').append(table);

        //Options
        let divRow = $('<div class="row"></div>').append(displayCompetitorMonitoringAirlinesTableOptions(), displayCompetitorMonitoringAirlinesTableCollumns());
        div.append(divRow, tableWell);
    });
}

function displayCompetitorMonitoringAirlineScheduleTable(mainDiv, scheduleData, data) {
    mainDiv.hide();
    //Build schedule rows
    let rows = [];
    let hrow = [];
    if (data.scheduleDateUse) {
        let collumns = [
            {
                field: 'schedOrigin',
                text: 'Origin',
                headGroup: 'Schedule',
                visible: 1,
                number: 0,
      },
            {
                field: 'schedDestination',
                text: 'Destination',
                headGroup: 'Schedule',
                visible: 1,
                number: 0,
      },
            {
                field: 'schedHub',
                text: 'Hub',
                headGroup: 'Schedule',
                visible: 1,
                number: 0,
      },
            {
                field: 'schedOd',
                text: 'OD',
                headGroup: 'Schedule',
                visible: 1,
                number: 0,
      },
            {
                field: 'schedDir',
                text: 'Direction',
                headGroup: 'Schedule',
                visible: 1,
                number: 0,
      },
            {
                field: 'schedFltNr',
                text: '# of flight numbers',
                headGroup: 'Schedule',
                visible: 1,
                number: 1,
      },
            {
                field: 'schedPaxFreq',
                text: 'PAX frequency',
                headGroup: 'Schedule',
                visible: 1,
                number: 1,
      },
            {
                field: 'schedCargoFreq',
                text: 'Cargo frequency',
                headGroup: 'Schedule',
                visible: 1,
                number: 1,
      },
            {
                field: 'schedTotalFreq',
                text: 'Total Frequency',
                headGroup: 'Schedule',
                visible: 1,
                number: 1,
      }
    ];
        //Table Head
        let th = [];
        collumns.forEach(function(col) {
            if (col.visible) {
                //Sort
                let sort = $('<a></a>').html(col.text);
                sort.click(function() {
                    SortTable(col.field, col.number, 'aes-table-competitorMonitoring-airline-schedule', 'aes-comp-sched-');
                });
                th.push($('<th style="cursor: pointer;"></th>').html(sort));
            }
        });
        hrow.push($('<tr></tr>').append(th));
        //Table Body
        scheduleData.date[data.scheduleDateUse].schedule.forEach(function(od) {
            let td = [];
            let fltNr = 0;
            let paxFreq = 0;
            let cargoFreq = 0;
            for (let flight in od.flightNumber) {
                cargoFreq += od.flightNumber[flight].cargoFreq,
                    paxFreq += od.flightNumber[flight].paxFreq,
                    fltNr++;
            }
            let totalFreq = cargoFreq + paxFreq;
            //hub
            let hub = od.od.slice(0, 3);
            let cellValue = {
                schedOrigin: od.origin,
                schedDestination: od.destination,
                schedOd: od.od,
                schedDir: od.direction,
                schedFltNr: fltNr,
                schedPaxFreq: paxFreq,
                schedCargoFreq: cargoFreq,
                schedTotalFreq: totalFreq,
                schedHub: hub
            }
            collumns.forEach(function(cell) {
                if (cell.visible) {
                    td.push($('<td class="aes-comp-sched-' + cell.field + '" ></td>').html(cellValue[cell.field]));
                }
            });
            rows.push($('<tr></tr>').append(td));
        });
    } else {
        rows.push('<tr><td><span class="warning">No schedule found</span></td></tr>');
    }

    //Build layout
    let thead = $('<thead></thead>').append(hrow);
    let tbody = $('<tbody></tbody>').append(rows);
    let table = $('<table id="aes-table-competitorMonitoring-airline-schedule" class="table table-bordered table-striped table-hover"></table>').append(thead, tbody);
    let tableWell = $('<div style="overflow-x:auto;" class="as-table-well"></div>').append(table);
    let button = $('<button type="button" class="btn btn-default">Back to overview</button>');
    let panelDiv = $('<div class="as-panel"></div>').append(button, tableWell);
    let heading = $('<h4>' + data.airlineName + ' ' + data.airlineCode + ' schedule</h4>');
    let div = $('<div id="aes-compMonitor-schedule"></div>').append(heading, panelDiv);
    mainDiv.after(div);
    //Button clicks
    button.click(function() {
        div.remove();
        mainDiv.show();
    });
}

function displayCompetitorMonitoringAirlinesTableCollumns() {
    //Table Head
    let th = [];
    th.push('<th>Show</th>');
    th.push('<th>Column</th>');
    let thead = $('<thead></thead>').append($('<tr></tr>').append(th));
    //Table body
    let tbody = $('<tbody></tbody>');

    settings.competitorMonitoring.tableColumns.forEach(function(col) {
        let td = [];
        //Checkbox
        if (col.visible) {
            td.push('<td><input value="' + col.field + '" type="checkbox" checked></td>');
        } else {
            td.push('<td><input value="' + col.field + '" type="checkbox"></td>');
        }
        //Name
        td.push('<td>' + col.text + '</td>');
        tbody.append($('<tr></tr>').append(td));
    });

    let table = $('<table class="table table-bordered table-striped table-hover"></table>').append(thead, tbody);
    let divTable = $('<div id="aes-div-competitorMonitoring-collumns" class="as-table-well" style="display: none;"></div>').append(table);
    //Collumns selector Checkbox listener
    $('input', table).change(function() {
        let show;
        if (this.checked) {
            show = 1;
        } else {
            show = 0;
        }
        let value = $(this).val();
        settings.competitorMonitoring.tableColumns.forEach(function(col) {
            if (col.field == value) {
                col.visible = show;
            }
        });
        chrome.storage.local.set({ settings: settings }, function() {});
    });
    //Closable legend
    let link = $('<a style="cursor: pointer;"></a>').text('Columns');
    let legend = $('<legend></legend>').html(link);
    link.click(function() {
        $('#aes-div-competitorMonitoring-collumns').toggle();
    });
    let fieldset = $('<fieldset></fieldset>').append(legend, divTable);
    let div = $('<div class="col-md-4"></div>').append(fieldset);
    return div;
}

function displayCompetitorMonitoringAirlinesTableOptions() {
    let divFieldset = $('<fieldset></fieldset>').html('<legend>Options</legend>');
    let btn = $('<button type="button" class="btn btn-default">reload table</button>');
    divFieldset.append(btn);
    let optionsDiv = $('<div class="col-md-4"></div>').append(divFieldset);
    //Reload table
    btn.click(function() {
        displayCompetitorMonitoring();
    });

    return optionsDiv;
}

function CompetitorMonitoringSortTable(collumn, number) {
    let tableRows = $('#aes-table-competitorMonitoring tbody tr');
    let tableBody = $('#aes-table-competitorMonitoring tbody');
    tableBody.empty();
    let indexes = [];
    tableRows.each(function() {
        if (number) {
            let value = parseInt($(this).find(".aes-" + collumn).text(), 10);
            if (value) {
                indexes.push(value);
            } else {
                indexes.push(0);
            }
        } else {
            indexes.push($(this).find(".aes-" + collumn).text());
        }
    });
    indexes = [...new Set(indexes)];
    let sorted = [...indexes];
    if (number) {
        sorted.sort(function(a, b) {
            if (a > b) return -1;
            if (a < b) return 1;
            if (a = b) return 0;
        });
    } else {
        sorted.sort();
    }
    let same = 1;
    for (let i = 0; i < indexes.length; i++) {
        if (indexes[i] !== sorted[i]) {
            same = 0;
        }
    }
    if (same) {
        if (number) {
            sorted.sort(function(a, b) {
                if (a < b) return -1;
                if (a > b) return 1;
                if (a = b) return 0;
            });
        } else {
            sorted.reverse();
        }
    }
    for (let i = 0; i < sorted.length; i++) {
        for (let j = tableRows.length - 1; j >= 0; j--) {
            if (number) {
                let value = parseInt($(tableRows[j]).find(".aes-" + collumn).text(), 10);
                if (!value) {
                    value = 0;
                }
                if (value == sorted[i]) {
                    tableBody.append($(tableRows[j]));
                    tableRows.splice(j, 1);
                }
            } else {
                if ($(tableRows[j]).find(".aes-" + collumn).text() == sorted[i]) {
                    tableBody.append($(tableRows[j]));
                    tableRows.splice(j, 1);
                }
            }
        }
    }
}

function setDefaultCompetitorMonitoringSettings() {
    let columns = [
        {
            field: 'airlineId',
            text: 'ID',
            headGroup: 'Airline',
            visible: 1,
            number: 1
    },
        {
            field: 'airlineCode',
            text: 'Code',
            headGroup: 'Airline',
            visible: 1,
            number: 0
    },
        {
            field: 'airlineName',
            text: 'Name',
            headGroup: 'Airline',
            visible: 1,
            number: 0
    },
        {
            field: 'overviewDate',
            text: 'Overview date',
            headGroup: 'Overview',
            visible: 0,
            number: 0
    },
        {
            field: 'overviewPreDate',
            text: 'Overview previous date',
            headGroup: 'Overview',
            visible: 0,
            number: 0
    },
        {
            field: 'overviewRating',
            text: 'Rating',
            headGroup: 'Overview',
            visible: 1,
            number: 0
    },
        {
            field: 'overviewRatingDelta',
            text: 'Rating &Delta;',
            headGroup: 'Overview',
            visible: 0,
            number: 0
    },
        {
            field: 'overviewTotalPax',
            text: 'Total pax',
            headGroup: 'Overview',
            visible: 1,
            number: 1
    },
        {
            field: 'overviewTotalPaxDelta',
            text: 'Total pax &Delta;',
            headGroup: 'Overview',
            visible: 1,
            number: 1
    },
        {
            field: 'overviewTotalCargo',
            text: 'Total cargo',
            headGroup: 'Overview',
            visible: 1,
            number: 1
    },
        {
            field: 'overviewTotalCargoDelta',
            text: 'Total cargo &Delta;',
            headGroup: 'Overview',
            visible: 1,
            number: 1
    },
        {
            field: 'overviewStations',
            text: 'Stations',
            headGroup: 'Overview',
            visible: 1,
            number: 1
    },
        {
            field: 'overviewStationsDelta',
            text: 'Stations &Delta;',
            headGroup: 'Overview',
            visible: 1,
            number: 1
    },
        {
            field: 'overviewFleet',
            text: 'Fleet',
            headGroup: 'Overview',
            visible: 1,
            number: 1
    },
        {
            field: 'overviewFleetDelta',
            text: 'Fleet &Delta;',
            headGroup: 'Overview',
            visible: 1,
            number: 1
    },
        {
            field: 'overviewStaff',
            text: 'Staff',
            headGroup: 'Overview',
            visible: 0,
            number: 1
    },
        {
            field: 'overviewStaffDelta',
            text: 'Staff &Delta;',
            headGroup: 'Overview',
            visible: 0,
            number: 1
    },
        {
            field: 'fafWeek',
            text: 'Week',
            headGroup: 'Figures',
            visible: 0,
            number: 0
    },
        {
            field: 'fafWeekPre',
            text: 'Previous week',
            headGroup: 'Figures',
            visible: 0,
            number: 0
    },
        {
            field: 'fafAirportsServed',
            text: 'Airports served',
            headGroup: 'Figures',
            visible: 1,
            number: 1
    },
        {
            field: 'fafAirportsServedDelta',
            text: 'Airports served &Delta;',
            headGroup: 'Figures',
            visible: 0,
            number: 1
    },
        {
            field: 'fafOperatedFlights',
            text: 'Operated flights',
            headGroup: 'Figures',
            visible: 1,
            number: 1
    },
        {
            field: 'fafOperatedFlightsDelta',
            text: 'Operated flights &Delta;',
            headGroup: 'Figures',
            visible: 1,
            number: 1
    },
        {
            field: 'fafSeatsOffered',
            text: 'Seats offered',
            headGroup: 'Figures',
            visible: 1,
            number: 1
    },
        {
            field: 'fafSeatsOfferedDelta',
            text: 'Seats offered &Delta;',
            headGroup: 'Figures',
            visible: 1,
            number: 1
    },
        {
            field: 'fafsko',
            text: 'SKO',
            headGroup: 'Figures',
            visible: 0,
            number: 1
    },
        {
            field: 'fafskoDelta',
            text: 'SKO &Delta;',
            headGroup: 'Figures',
            visible: 0,
            number: 1
    },
        {
            field: 'fafCargoOffered',
            text: 'Cargo offered',
            headGroup: 'Figures',
            visible: 1,
            number: 1
    },
        {
            field: 'fafCargoOfferedDelta',
            text: 'Cargo offered &Delta;',
            headGroup: 'Figures',
            visible: 1,
            number: 1
    },
        {
            field: 'faffko',
            text: 'FKO',
            headGroup: 'Figures',
            visible: 0,
            number: 1
    },
        {
            field: 'faffkoDela',
            text: 'FKO &Delta;',
            headGroup: 'Figures',
            visible: 0,
            number: 1
    },
        {
            field: 'scheduleDate',
            text: 'Schedule Date',
            headGroup: 'Schedule',
            visible: 0,
            number: 0
    },
        {
            field: 'scheduleDatePre',
            text: 'Previous Schedule Date',
            headGroup: 'Schedule',
            visible: 0,
            number: 0
    },
        {
            field: 'scheduleHubs',
            text: 'Hubs (routes)',
            headGroup: 'Schedule',
            visible: 1,
            number: 0
    },
        {
            field: 'scheduleFltNr',
            text: '# of flight numbers',
            headGroup: 'Schedule',
            visible: 0,
            number: 1
    },
        {
            field: 'scheduleFltNrDelta',
            text: '# of flight numbers &Delta;',
            headGroup: 'Schedule',
            visible: 0,
            number: 1
    },
        {
            field: 'schedulePAXFreq',
            text: 'PAX frequency',
            headGroup: 'Schedule',
            visible: 0,
            number: 1
    },
        {
            field: 'schedulePAXFreqDelta',
            text: 'PAX frequency &Delta;',
            headGroup: 'Schedule',
            visible: 0,
            number: 1
    },
        {
            field: 'scheduleCargoFreq',
            text: 'Cargo frequency',
            headGroup: 'Schedule',
            visible: 0,
            number: 1
    },
        {
            field: 'scheduleCargoFreqDelta',
            text: 'Cargo frequency &Delta;',
            headGroup: 'Schedule',
            visible: 0,
            number: 1
    },
        {
            field: 'scheduleTotalFreq',
            text: 'Total frequency',
            headGroup: 'Schedule',
            visible: 1,
            number: 1
    },
        {
            field: 'scheduleTotalFreqDelta',
            text: 'Total frequency &Delta;',
            headGroup: 'Schedule',
            visible: 1,
            number: 1
    },
        {
            field: 'actionOpenAirline',
            text: 'Open airline page',
            headGroup: 'Actions',
            visible: 1,
            number: 0
    },
        {
            field: 'actionOpenSchedule',
            text: 'Show airline schedule',
            headGroup: 'Actions',
            visible: 1,
            number: 0
    },
        {
            field: 'actionRemoveAirline',
            text: 'Remove airline',
            headGroup: 'Actions',
            visible: 0,
            number: 0
    }
  ];
    settings.competitorMonitoring = {
        tableColumns: columns
    };
}

function getRatingNr(rating) {
    switch (rating) {
        case 'AAA':
            return 10;
            break;
        case 'AA':
            return 9;
            break;
        case 'A':
            return 8;
            break;
        case 'BBB':
            return 7;
            break;
        case 'BB':
            return 6;
            break;
        case 'B':
            return 5;
            break;
        case 'CCC':
            return 4;
            break;
        case 'CC':
            return 3;
            break;
        case 'C':
            return 2;
            break;
        case 'D':
            return 1;
            break;
        default:
            return 0;
    }
}

function getDelta(newNr, oldNr) {
    return newNr - oldNr;
};
//Display Aircraft aircraftProfitability
function displayAircraftProfitability() {
    if (!settings.aircraftProfitability) {
        settings.aircraftProfitability = {};
    }
    if (!settings.aircraftProfitability.hideColumn) {
        settings.aircraftProfitability.hideColumn = [];
    }
    //columns
    let columns = [
        {
            category: 'Aircraft',
            title: 'Aircraft ID',
            data: 'aircraftId',
            sortable: 1,
            visible: 1,
            number: 1,
            id: 1
    },
        {
            category: 'Aircraft',
            title: 'Registration',
            data: 'registration',
            sortable: 1,
            visible: 1
    },
        {
            category: 'Aircraft',
            title: 'Equipment',
            data: 'equipment',
            sortable: 1,
            visible: 1
    },
        {
            category: 'Aircraft',
            title: 'Fleet',
            data: 'fleet',
            sortable: 1,
            visible: 1
    },
        {
            category: 'Aircraft',
            title: 'Nickname',
            data: 'nickname',
            sortable: 1,
            visible: 1
    },
        {
            category: 'Aircraft',
            title: 'Note',
            data: 'note',
            sortable: 1,
            visible: 1
    },
        {
            category: 'Aircraft',
            title: 'Age',
            data: 'age',
            sortable: 1,
            visible: 1,
            number: 1
    },
        {
            category: 'Aircraft',
            title: 'Maintenance',
            data: 'maintenance',
            sortable: 1,
            visible: 1,
            number: 1
    },
        {
            category: 'Aircraft',
            title: 'Date',
            data: 'dateAircraft',
            sortable: 1,
            visible: 1
    },
        {
            category: 'Profit',
            title: 'Total flights',
            data: 'totalFlights',
            sortable: 1,
            visible: 1,
            number: 1
    },
        {
            category: 'Profit',
            title: 'Finished flights',
            data: 'finishedFlights',
            sortable: 1,
            visible: 1,
            number: 1
    },
        {
            category: 'Profit',
            title: 'Profit/loss flights',
            data: 'profitFlights',
            sortable: 1,
            visible: 1,
            number: 1
    },
        {
            category: 'Profit',
            title: 'Profit',
            data: 'profit',
            sortable: 1,
            visible: 1,
            number: 1,
            format: 'money'
    },
        {
            category: 'Profit',
            title: 'Profit extract date',
            data: 'dateProfit',
            sortable: 1,
            visible: 1
    }
  ];
    if (settings.aircraftProfitability.hideColumn.length) {
        columns.forEach(function(column) {
            settings.aircraftProfitability.hideColumn.forEach(function(hideColumn) {
                if (column.data == hideColumn) {
                    column.visible = 0;
                }
            });
        });
    }

    let key = server + airline.name.trim().replace(/[^A-Za-z0-9]/g, '') + 'aircraftFleet';
    //Get storage fleet data
    chrome.storage.local.get(key, function(result) {
        //get aircraft flight data
        let aircraftFleetData = result[key];
        if (aircraftFleetData) {
            let keys = [];
            aircraftFleetData.fleet.forEach(function(value) {
                keys.push(server + 'aircraftFlights' + value.aircraftId);
            });
            chrome.storage.local.get(keys, function(result) {
                for (let aircraftFlightData in result) {
                    for (let i = 0; i < aircraftFleetData.fleet.length; i++) {
                        if (aircraftFleetData.fleet[i].aircraftId == result[aircraftFlightData].aircraftId) {
                            aircraftFleetData.fleet[i].profit = {
                                date: result[aircraftFlightData].date,
                                finishedFlights: result[aircraftFlightData].finishedFlights,
                                profit: result[aircraftFlightData].profit,
                                profitFlights: result[aircraftFlightData].profitFlights,
                                time: result[aircraftFlightData].time,
                                totalFlights: result[aircraftFlightData].totalFlights,
                            };
                        }
                    }
                }
                let data = prepareAircraftProfitabilityData(aircraftFleetData);
                let tableDiv;
                if (data.length) {
                    tableDiv = generateTable({
                        column: columns,
                        data: data,
                        columnPrefix: 'aes-aircraftProfit-',
                        tableSettings: 1,
                        options: ['openAircraft', 'removeAircraft', 'reloadTableAircraftProfit', 'applyFilter', 'removeSelected'],
                        filter: settings.aircraftProfitability.filter,
                        hideColumn: settings.aircraftProfitability.hideColumn,
                        tableSettingStorage: 'aircraftProfitability'
                    });
                } else {
                    //Never happens or only when fleet = 0 because of updated script this output is copied bellow
                    tableDiv = $('<p class="warning"></p>').text('No aircraft data in memory. Open fleet management to extract aircraft data.')
                }
                //Div
                let div = $('<div class="as-panel"></div>').append(tableDiv);
                let mainDiv = $("#aes-div-dashboard");
                //Build layout
                mainDiv.empty();
                let title = $('<h3></h3>').text('Aircraft Profitability');
                mainDiv.append(title, div);

            });
        } else {
            //No data
            //Div
            let tableDiv = $('<p class="warning"></p>').text('No aircraft data in memory. Open fleet management to extract aircraft data.')
            let div = $('<div class="as-panel"></div>').append(tableDiv);
            let mainDiv = $("#aes-div-dashboard");
            //Build layout
            mainDiv.empty();
            let title = $('<h3></h3>').text('Aircraft Profitability');
            mainDiv.append(title, div);
        }
    });

    function prepareAircraftProfitabilityData(storage) {
        let data = [];
        storage.fleet.forEach(function(value) {
            let profit = {};
            if (value.profit) {
                profit.totalFlights = value.profit.totalFlights;
                profit.finishedFlights = value.profit.finishedFlights;
                profit.profitFlights = value.profit.profitFlights;
                profit.profit = value.profit.profit;
                profit.dateProfit = AES.formatDateString(value.profit.date) + ' ' + value.profit.time;
            }
            data.push({
                aircraftId: value.aircraftId,
                registration: value.registration,
                equipment: value.equipment,
                fleet: value.fleet,
                nickname: value.nickname,
                note: value.note,
                age: value.age,
                maintenance: value.maintanance,
                dateAircraft: AES.formatDateString(value.date) + ' ' + value.time,
                totalFlights: profit.totalFlights,
                finishedFlights: profit.finishedFlights,
                profitFlights: profit.profitFlights,
                profit: profit.profit,
                dateProfit: profit.dateProfit
            });
        });
        return data;
    }
}

//Auto table generator
function generateTable(tableOptionsRule) {
    let tableHtml = $('<table class="table table-bordered table-striped table-hover"></table>');
    let table = { cell: {}, row: {}, tableHtml: tableHtml };
    //Table Categories
    let tableCategory = {};
    tableOptionsRule.column.forEach(function(value) {
        if (value.visible) {
            if (!tableCategory[value.category]) {
                tableCategory[value.category] = 1;
            } else {
                tableCategory[value.category]++;
            }
        }
    });
    table.cell.category = [];
    //Add checkbox
    if (tableOptionsRule.tableSettings) {
        table.cell.category.push('<th rowspan="2"></th>')
    }
    for (let category in tableCategory) {
        table.cell.category.push('<th colspan="' + tableCategory[category] + '">' + category + '</th>');
    }

    //Table Headers
    table.cell.header = [];
    tableOptionsRule.column.forEach(function(value) {
        if (value.visible) {
            if (value.sortable) {
                //Sort
                let sort = $('<a></a>').text(value.title);
                sort.click(function() {
                    masterSortTable(value.data, value.number, table.tableHtml, tableOptionsRule.columnPrefix);
                });
                table.cell.header.push($('<th style="cursor: pointer;"></th>').html(sort));
            } else {
                table.cell.header.push('<th>' + value.title + '</th>');
            }
        }
    });
    //Head
    table.row.head = [];
    table.row.head.push($('<tr></tr>').append(table.cell.category));
    table.row.head.push($('<tr></tr>').append(table.cell.header));
    //Table Body
    table.row.body = [];
    tableOptionsRule.data.forEach(function(dataValue) {
        let cell = [];
        //Add checkbox
        if (tableOptionsRule.tableSettings) {
            cell.push('<td><input type="checkbox"></td>');
        }
        let id;
        tableOptionsRule.column.forEach(function(colValue) {
            if (colValue.id) {
                id = dataValue[colValue.data]
            }
            if (colValue.visible) {
                let td = $('<td></td>').addClass(tableOptionsRule.columnPrefix + colValue.data);
                if (colValue.format) {
                    td.html(masterCellFormat(colValue.format, dataValue[colValue.data]))
                } else {
                    td.html(dataValue[colValue.data])
                }
                cell.push(td);
            }
        });
        table.row.body.push($('<tr></tr>').attr('id', id).append(cell));
    });
    let thead = $('<thead></thead>').append(table.row.head);
    let tbody = $('<tbody></tbody>').append(table.row.body);
    table.tableHtml.append(thead, tbody);
    let tableWell = $('<div style="overflow-x:auto;" class="as-table-well"></div>').append(table.tableHtml);

    //Table Settings
    let settingsDiv = '';
    if (tableOptionsRule.tableSettings) {
        let divCol = [];
        //Options
        divCol.push($('<div class="col-md-4"></div>').html(masterTableOptions(table.tableHtml, tableOptionsRule.options)));
        divCol.push($('<div class="col-md-4"></div>').html(masterTableFilter(tableOptionsRule.filter, tableOptionsRule.column)));
        divCol.push($('<div class="col-md-4"></div>').html(masterTableColumns()));
        settingsDiv = $('<div class="row"></div>').append(divCol)
    }

    let div = $('<div></div>').append(settingsDiv, tableWell);
    return div;
    //Table functions
    function masterSortTable(collumn, number, table, collumnPrefix) {
        let tableRows = $('tbody tr', table);
        let tableBody = $('tbody', table);
        tableBody.empty();
        let indexes = [];
        tableRows.each(function() {
            if (number) {
                let value = parseInt($(this).find("." + collumnPrefix + collumn).text(), 10);
                if (value) {
                    indexes.push(value);
                } else {
                    indexes.push(0);
                }
            } else {
                indexes.push($(this).find("." + collumnPrefix + collumn).text());
            }
        });
        indexes = [...new Set(indexes)];
        let sorted = [...indexes];
        if (number) {
            sorted.sort(function(a, b) {
                if (a > b) return -1;
                if (a < b) return 1;
                if (a = b) return 0;
            });
        } else {
            sorted.sort();
        }
        let same = 1;
        for (let i = 0; i < indexes.length; i++) {
            if (indexes[i] !== sorted[i]) {
                same = 0;
            }
        }
        if (same) {
            if (number) {
                sorted.sort(function(a, b) {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    if (a = b) return 0;
                });
            } else {
                sorted.reverse();
            }
        }
        for (let i = 0; i < sorted.length; i++) {
            for (let j = tableRows.length - 1; j >= 0; j--) {
                if (number) {
                    let value = parseInt($(tableRows[j]).find("." + collumnPrefix + collumn).text(), 10);
                    if (!value) {
                        value = 0;
                    }
                    if (value == sorted[i]) {
                        tableBody.append($(tableRows[j]));
                        tableRows.splice(j, 1);
                    }
                } else {
                    if ($(tableRows[j]).find("." + collumnPrefix + collumn).text() == sorted[i]) {
                        tableBody.append($(tableRows[j]));
                        tableRows.splice(j, 1);
                    }
                }
            }
        }
    }

    function masterCellFormat(type, value) {
        if (!value) {
            return '';
        }
        switch (type) {
            case 'money':
                let span = $('<span></span>');
                let text = '';
                if (value > 0) {
                    span.addClass('good');
                    text = '+'
                }
                if (value < 0) {
                    span.addClass('bad');
                }
                text = text + new Intl.NumberFormat().format(value) + ' AS$';
                span.text(text);
                return span;
                break;
            default:
                return value;
        }
    }

    function masterTableOptions(table, options) {
        let div = $('<div></div>');
        options.forEach(function(value, index) {
            if (index) {
                let span = $('<span> </span>');
                div.append(span);
            }
            div.append(masterTableOptionsHandle(value));
        });
        //Closable legend
        let link = $('<a style="cursor: pointer;"></a>').text('Options');
        let legend = $('<legend></legend>').html(link);
        link.click(function() {
            div.toggle();
        });
        let fieldset = $('<fieldset></fieldset>').append(legend, div);
        return fieldset;

        //Functions
        function masterTableOptionsHandle(value) {
            switch (value) {
                case 'openAircraft':
                    return masterTableOptionsOpenAircraft();
                    break;
                case 'reloadTableAircraftProfit':
                    return masterTableOptionsReloadTableAP();
                    break;
                case 'removeAircraft':
                    return masterTableOptionsRemoveAircraft();
                    break;
                case 'applyFilter':
                    return masterTableOptionsApplyFilter();
                    break;
                case 'removeSelected':
                    return masterTableOptionsRemoveSelected();
                    break;
                default:
                    // code block
            }
            //Option Functions
            function masterTableOptionsOpenAircraft() {
                let btn = $('<button type="button" class="btn btn-default">open aircraft (max 10)</button>');
                btn.click(function() {
                    let urls = $('tbody tr', table).has('input:checked').map(function() {
                        let id = $(this).attr('id');
                        let url = 'https://' + server + '.airlinesim.aero/app/fleets/aircraft/' + id + '/1';
                        return url;
                    }).toArray();
                    //Open new tabs
                    for (let i = 0; i < urls.length; i++) {
                        window.open(urls[i], '_blank');
                        if (i == 10) {
                            break;
                        }
                    }
                });
                return btn;
            }

            function masterTableOptionsReloadTableAP() {
                let btn = $('<button type="button" class="btn btn-default">reload table</button>');
                btn.click(function() {
                    displayAircraftProfitability();
                });
                return btn;
            }

            function masterTableOptionsRemoveAircraft() {
                let btn = $('<button type="button" class="btn btn-default">remove aircraft (permanent)</button>');
                btn.click(function() {
                    let id = [];
                    let aircraftKey = [];
                    $('tbody tr', table).has('input:checked').each(function() {
                        let localId = $(this).attr('id');
                        id.push(localId);
                        aircraftKey.push(server + 'aircraftFlights' + localId);
                        $(this).remove();
                    });
                    if (id.length) {
                        let fleetKey = server + airline.name + 'aircraftFleet';
                        chrome.storage.local.get(fleetKey, function(result) {
                            let storedFleetData = result[fleetKey];
                            let newFleet = storedFleetData.fleet.filter(function(value) {
                                let keep = 1;
                                id.forEach(function(idVal) {
                                    if (idVal == value.aircraftId) {
                                        keep = 0;
                                    }
                                });
                                return keep;
                            });
                            storedFleetData.fleet = newFleet;
                            chrome.storage.local.set({
                                [fleetKey]: storedFleetData }, function() {
                                chrome.storage.local.remove(aircraftKey, function() {});
                            });
                        });
                    }
                });
                return btn;
            }

            function masterTableOptionsApplyFilter() {
                let btn = $('<button type="button" class="btn btn-default">apply filter</button>');
                btn.click(function() {
                    let filter = [];
                    table.closest(".as-panel").find('fieldset:eq(1) table tbody tr').each(function() {
                        filter.push({
                            titlecode: $(this).find('input').val(),
                            title: $(this).find('td:eq(0)').text(),
                            operation: $(this).find('td:eq(1)').text(),
                            value: $(this).find('td:eq(2)').text()
                        })
                    });
                    settings[tableOptionsRule.tableSettingStorage].filter = filter;
                    chrome.storage.local.set({ settings: settings }, function() {
                        $('tbody tr', table).each(function() {
                            let row = this;
                            filter.forEach(function(filter) {
                                let cell = $(row).find("." + tableOptionsRule.columnPrefix + filter.titlecode).text();
                                //if(cell){
                                //Get collumn info if number or not
                                let number;
                                for (let i = 0; i < tableOptionsRule.column.length; i++) {
                                    let column = tableOptionsRule.column[i];
                                    if (filter.titlecode == column.data) {
                                        number = column.number;
                                        break;
                                    }
                                }
                                let value = filter.value;
                                if (number) {
                                    if (cell) {
                                        cell = parseInt(cell, 10);
                                    }
                                    if (value) {
                                        value = parseInt(value, 10);
                                    }
                                }
                                switch (filter.operation) {
                                    case '=':
                                        if (cell != value) {
                                            $(row).remove();
                                        }
                                        break;
                                    case '!=':
                                        if (cell == value) {
                                            $(row).remove();
                                        }
                                        break;
                                    case '>':
                                        if (cell < value) {
                                            $(row).remove();
                                        }
                                        break;
                                    case '<':
                                        if (cell > value) {
                                            $(row).remove();
                                        }
                                }
                            });
                        });
                    });
                });
                return btn;
            }

            function masterTableOptionsRemoveSelected() {
                let btn = $('<button type="button" class="btn btn-default">hide selected</button>');
                btn.click(function() {
                    $('tbody tr', table).has('input:checked').remove();
                });
                return btn;
            }
        }
    }

    function masterTableFilter(filter, column) {
        //Table head
        let th = [];
        th.push('<th>Column</th>');
        th.push('<th>Operation</th>');
        th.push('<th>Value</th>');
        th.push('<th></th>');
        let thead = $('<thead></thead>').append($('<tr></tr>').append(th));
        //Table body
        let row = [];
        if (filter) {
            filter.forEach(function(fil) {
                row.push($('<tr></tr>').append(masterTableFilterAddBodyRow(fil.titlecode, fil.title, fil.operation, fil.value)));
            });
        }

        let tbody = $('<tbody></tbody>').append(row);
        //Table foot
        //select collumn
        let option1 = [];
        column.forEach(function(col) {
            option1.push('<option value="' + col.data + '">' + col.title + '</option>');
        });
        let select1 = $('<select class="form-control"></select>').append(option1);
        //Select value
        let option = [];
        option.push('<option>=</option>');
        option.push('<option>!=</option>');
        option.push('<option>></option>');
        option.push('<option><</option>');
        let select = $('<select class="form-control"></select>').append(option);
        //Value
        let input = $('<input type="text" class="form-control" style="min-width: 50px;">');
        //Add button
        let btn = $('<button class="btn btn-default"></button>').text('Add Row');
        btn.click(function() {
            let column = $('option:selected', select1).text();
            let columnVal = $('option:selected', select1).val();
            let operation = $('option:selected', select).text();
            let value = input.val();
            tbody.append($('<tr></tr>').append(masterTableFilterAddBodyRow(columnVal, column, operation, value)));
        });
        //Footer rows
        let tf = [];
        tf.push($('<td></td>').html(select1));
        tf.push($('<td></td>').html(select));
        tf.push($('<td></td>').html(input));
        tf.push($('<td></td>').append(btn));
        let tfoot = $('<tfoot></tfoot>').append($('<tr></tr>').append(tf));
        let tableFilter = $('<table class="table table-bordered table-striped table-hover"></table>').append(thead, tbody, tfoot);
        let divTable = $('<div class="as-table-well"></div>').append(tableFilter);
        //Closable legend
        let link = $('<a style="cursor: pointer;"></a>').text('Filter');
        let legend = $('<legend></legend>').html(link);
        link.click(function() {
            divTable.toggle();
        });
        let fieldset = $('<fieldset></fieldset>').append(legend, divTable);
        return fieldset;
        //Functions
        function masterTableFilterAddBodyRow(titleCode, title, operation, value) {
            let td = [];
            td.push('<td><input type="hidden" value="' + titleCode + '">' + title + '</td>');
            td.push('<td>' + operation + '</td>');
            td.push('<td>' + value + '</td>');
            let deleteBtn = $('<a></a>').html('<span class="fa fa-trash" title="Delete row"></span>');
            deleteBtn.click(function() {
                $(this).closest("tr").remove();
            });
            td.push($('<td></td>').append(deleteBtn));
            return td;
        }
    }

    function masterTableColumns() {
        //Table head
        let th = [];
        th.push('<th>Show</th>');
        th.push('<th>Column</th>');
        let thead = $('<thead></thead>').append($('<tr></tr>').append(th));
        //Table body
        let row = [];
        tableOptionsRule.column.forEach(function(col) {
            let td = []
            let input = $('<input value="' + col.data + '" type="checkbox">');
            input.change(function() {
                if (!tableOptionsRule.hideColumn) {
                    tableOptionsRule.hideColumn = [];
                }
                let newHideColumns = [];
                let currentColumn = $(this).val();
                newHideColumns = tableOptionsRule.hideColumn.filter(function(value) {
                    return value != currentColumn;
                });
                if (!this.checked) {
                    newHideColumns.push(currentColumn);
                }

                tableOptionsRule.hideColumn = newHideColumns;
                settings[tableOptionsRule.tableSettingStorage].hideColumn = tableOptionsRule.hideColumn;
                chrome.storage.local.set({ settings: settings }, function() {});
            })
            if (col.visible) {
                input.prop('checked', true);
            }
            td.push($('<td></td>').append(input));
            td.push($('<td></td>').text(col.title));
            row.push($('<tr></tr>').append(td));
        });
        let tbody = $('<tbody></tbody>').append(row);
        let tableColumns = $('<table class="table table-bordered table-striped table-hover"></table>').append(thead, tbody);
        let divTable = $('<div class="as-table-well"></div>').append(tableColumns).hide();
        //Closable legend
        let link = $('<a style="cursor: pointer;"></a>').text('Columns');
        let legend = $('<legend></legend>').html(link);
        link.click(function() {
            divTable.toggle();
        });
        let fieldset = $('<fieldset></fieldset>').append(legend, divTable);
        return fieldset;
    }
}
//Display general helper functions
function generalAddScheduleRow(tbody) {
    let td1 = $('<td></td>').text("Schedule");
    let td2 = $('<td></td>');
    let td3 = $('<td></td>');
    let row = $('<tr></tr>').append(td1, td2, td3);
    tbody.append(row);
    //Get schedule
    let scheduleKey = server + airline.code + 'schedule';
    chrome.storage.local.get([scheduleKey], function(result) {
        let scheduleData = result[scheduleKey];
        if (scheduleData) {
            let lastUpdate = getDate('schedule', scheduleData.date);
            let diff = AES.getDateDiff([todayDate.date, lastUpdate]);
            let span = $('<span></span>').text('Last schedule extract ' + AES.formatDateString(lastUpdate) + ' (' + diff + ' days ago). Extract new schedule if there are new routes.');
            if (diff >= 0 && diff < 7) {
                span.addClass('good');
            } else {
                span.addClass('warning');
            }
            td2.append(span);
            generalUpdateScheduleAction(td3);



        } else {
            //no schedule
            td2.html('<span class="bad">No Schedule data found. Extract schedule or some AES parts will not work</span>');
            generalUpdateScheduleAction(td3);
        }
    });
}

function generalUpdateScheduleAction(td3) {
    let btn = $('<button type="button" class="btn btn-xs btn-default">extract schedule data</button>');
    btn.click(function() {
        settings.schedule.autoExtract = 1;
        //get schedule link
        let link = $('#enterprise-dashboard table:eq(0) tfoot td a:eq(2)');
        chrome.storage.local.set({ settings: settings }, function() {
            link[0].click();
        });
    });
    td3.append(btn);
}

function generalAddPersonelManagementRow(tbody) {
    let td = [];
    td.push($('<td></td>').text("Personnel Management"));
    td.push($('<td></td>'));
    td.push($('<td></td>'));
    let row = $('<tr></tr>').append(td);
    tbody.append(row);
    //Get Status
    let key = server + airline.name + 'personelManagement';
    chrome.storage.local.get([key], function(result) {
        let personelManagementData = result[key];
        if (personelManagementData) {
            let lastUpdate = personelManagementData.date;
            let diff = AES.getDateDiff([todayDate.date, lastUpdate]);
            let span = $('<span></span>').text('Last personnel salary update: ' + AES.formatDateString(lastUpdate) + ' (' + diff + ' days ago).');
            if (diff >= 0 && diff < 7) {
                span.addClass('good');
            } else {
                span.addClass('warning');
            }
            td[1].append(span);
        } else {
            //no schedule
            td[1].html('<span class="bad">No personnel salary update date found.</span>');
        }
    });

    //Action
    let btn = $('<button type="button" class="btn btn-xs btn-default">open personel management</button>');
    btn.click(function() {
        //get schedule link
        let link = $('#as-navbar-main-collapse > ul > li:eq(4) > ul > li:eq(5) > a');
        link[0].click();
    });
    td[2].append(btn);
}
//Display  default
function displayDefault() {
    let mainDiv = $("#aes-div-dashboard");
    mainDiv.empty();
}

//Table sort and other functions
function SortTable(collumn, number, tableId, collumnPrefix) {
    let tableRows = $('#' + tableId + ' tbody tr');
    let tableBody = $('#' + tableId + ' tbody');
    tableBody.empty();
    let indexes = [];
    tableRows.each(function() {
        if (number) {
            let value = parseInt($(this).find("." + collumnPrefix + collumn).text(), 10);
            if (value) {
                indexes.push(value);
            } else {
                indexes.push(0);
            }
        } else {
            indexes.push($(this).find("." + collumnPrefix + collumn).text());
        }
    });
    indexes = [...new Set(indexes)];
    let sorted = [...indexes];
    if (number) {
        sorted.sort(function(a, b) {
            if (a > b) return -1;
            if (a < b) return 1;
            if (a = b) return 0;
        });
    } else {
        sorted.sort();
    }
    let same = 1;
    for (let i = 0; i < indexes.length; i++) {
        if (indexes[i] !== sorted[i]) {
            same = 0;
        }
    }
    if (same) {
        if (number) {
            sorted.sort(function(a, b) {
                if (a < b) return -1;
                if (a > b) return 1;
                if (a = b) return 0;
            });
        } else {
            sorted.reverse();
        }
    }
    for (let i = 0; i < sorted.length; i++) {
        for (let j = tableRows.length - 1; j >= 0; j--) {
            if (number) {
                let value = parseInt($(tableRows[j]).find("." + collumnPrefix + collumn).text(), 10);
                if (!value) {
                    value = 0;
                }
                if (value == sorted[i]) {
                    tableBody.append($(tableRows[j]));
                    tableRows.splice(j, 1);
                }
            } else {
                if ($(tableRows[j]).find("." + collumnPrefix + collumn).text() == sorted[i]) {
                    tableBody.append($(tableRows[j]));
                    tableRows.splice(j, 1);
                }
            }
        }
    }
}

//Helper
function getDate(type, scheduleData) {
    switch (type) {
        case 'schedule':
            //scheduleData must be schedule object with dates as properties
            let dates = [];
            for (let date in scheduleData) {
                if (Number.isInteger(parseInt(date))) {
                    dates.push(date);
                }
            }
            dates.reverse();
            return dates[0];
        default:
            return 0;
    }
}
