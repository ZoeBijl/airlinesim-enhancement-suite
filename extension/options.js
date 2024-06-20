"use strict";
//Main
var dataPoints = {};
var servers = [];
var airlines = [];
var types = [];
var data;
$(function() {
    //Get saved data
    chrome.storage.local.get(null, function(items) {
        data = items;
        for (let key in items) {
            //Get all servers,airlines,types
            if (items[key].server) {
                let server = items[key].server;
                let airline = items[key].airline;
                let type = items[key].type;

                if (!servers.includes(server)) {
                    servers.push(server);
                }
                if (!airlines.includes(airline)) {
                    airlines.push(airline);
                }
                if (!types.includes(type)) {
                    types.push(type);
                }

                //get server
                if (!dataPoints[server]) {
                    dataPoints[server] = {};
                }
                //Get airline
                if (!dataPoints[server][airline]) {
                    dataPoints[server][airline] = {};
                }
                //Get type
                if (!dataPoints[server][airline][type]) {
                    //Depending on type if drill deeper
                    //Pricing
                    if (items[key].type == 'pricing') {
                        dataPoints[server][airline][type] = {};
                    }
                    //schedule
                    if (items[key].type == 'schedule') {
                        dataPoints[server][airline][type] = [];
                    }
                }
                //get pricing
                if (items[key].type == 'pricing') {
                    let od = items[key].origin + items[key].destination;
                    //check if exists
                    if (!dataPoints[server][airline][type][od]) {
                        dataPoints[server][airline][type][od] = [];
                    }
                    for (let date in items[key].date) {
                        dataPoints[server][airline][type][od].push(date);
                    }
                }
                //get schedule
                if (items[key].type == 'schedule') {
                    for (let date in items[key].data) {
                        dataPoints[server][airline][type].push(date);
                    }
                }
            }
        }
        //Check if any data
        if (Object.keys(dataPoints).length) {
            //Object not empty

            displayTopSelector();
        } else {
            //Object empty
            $('#display').append('There is no data')
        }
    });
});
//Functions
function displayTopSelector() {
    $('#aes-div-topSelect').append(createTopSelect(servers, 'server'));
    $('#aes-div-topSelect').append(createTopSelect(airlines, 'airline'));
    $('#aes-div-topSelect').append(createTopSelect(types, 'type'));
    topSelectHandle();
    $('#aes-select-top-server').change(function() {
        topSelectHandle();
    });
    $('#aes-select-top-airline').change(function() {
        topSelectHandle();
    });
    $('#aes-select-top-type').change(function() {
        topSelectHandle();
    });
}

function createTopSelect(array, name) {
    let label = $('<label for="aes-select-top-' + name + '" class="mr-sm-2"></label>').text(name + ":");
    let select = $('<select id="aes-select-top-' + name + '" class="form-control mb-2 mr-sm-2"></select>');
    for (let i in array) {
        select.append($('<option></option>').attr("value", array[i]).text(array[i]));
    }
    $('#aes-div-topSelect').append(label, select)
}

function topSelectHandle() {
    let server = $('#aes-select-top-server').val();
    let airline = $('#aes-select-top-airline').val();
    let type = $('#aes-select-top-type').val();
    let div = $('#aes-div-dataDisplay');
    div.empty();
    switch (type) {
        case 'pricing':
            displayPricingData(server, airline, type, div)
            break;
        case 'schedule':
            displayScheduleData(server, airline, type, div)
            break;
        default:
            // code block
    }
}

function displayPricingData(server, airline, type, div) {
    //Table body
    let tbody = $('<tbody></tbody>');
    for (let od in dataPoints[server][airline][type]) {
        let td1 = $('<td></td>').text(od);
        let td2 = $('<td></td>').text(dataPoints[server][airline][type][od].length);
        let row = $('<tr></tr>').append(td1, td2);
        tbody.append(row);
    }
    //Table head
    let th1 = $('<th></th>').text('OD');
    let th2 = $('<th></th>').text('# of Data Points');
    let headRow = $('<tr></tr>').append(th1, th2);
    let thead = $('<thead></thead>').append(headRow);
    //Table
    let table = $('<table class="table table-hover"></table>').append(thead, tbody);
    div.append(table);
}

function displayScheduleData(server, airline, type, div) {
    //Table body
    let tbody = $('<tbody></tbody>');
    dataPoints[server][airline][type].forEach(function(date) {
        let td1 = $('<td></td>').text(date);
        let td2 = $('<td></td>').text(data[type + server + airline].data[date].schedule.length);
        let row = $('<tr></tr>').append(td1, td2);
        tbody.append(row);
    });

    //Table head
    let th1 = $('<th></th>').text('Date');
    let th2 = $('<th></th>').text('# of Routes');
    let headRow = $('<tr></tr>').append(th1, th2);
    let thead = $('<thead></thead>').append(headRow);
    //Table
    let table = $('<table class="table table-hover"></table>').append(thead, tbody);
    div.append(table);
}
