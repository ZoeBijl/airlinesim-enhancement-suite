"use strict";
//MAIN
//Global vars
var aircraftFlightData;
$(function(){

  aircraftFlightData = getData();

  //Async start
  getStorageData();

});
function getStorageData(){
  let keys = [];
  for (let i =0;i < aircraftFlightData.flights.length;i++) {
    let key = aircraftFlightData.server+'flightInfo'+aircraftFlightData.flights[i].id;
    keys.push(key);
  }
  chrome.storage.local.get(keys, function(result) {
    for(let flightInfo in result) {
      for (let i=0; i < aircraftFlightData.flights.length; i++) {
        if(aircraftFlightData.flights[i].id == result[flightInfo].flightId){
          aircraftFlightData.flights[i].data = result[flightInfo];
        }
      }
    }

    //Async
    getTotalProfit();
  });
}
function getTotalProfit(){
  let profit = 0;
  let profitFlights = 0;
  aircraftFlightData.flights.forEach(function(value){
    if(value.status == 'finished' || value.status == 'inflight'){
      if(value.data){
        profit += value.data.money.CM5.Total;
        profitFlights++;
      }
    }
  });
  aircraftFlightData.profit = profit;
  aircraftFlightData.profitFlights = profitFlights;
  //Async
  saveData();
}
function saveData(){
  let key = aircraftFlightData.server+aircraftFlightData.type+aircraftFlightData.aircraftId;
  let saveData = {
    aircraftId:aircraftFlightData.aircraftId,
    date:aircraftFlightData.date,
    equipment:aircraftFlightData.equipment,
    finishedFlights:aircraftFlightData.finishedFlights,
    profit:aircraftFlightData.profit,
    profitFlights:aircraftFlightData.profitFlights,
    registration:aircraftFlightData.registration,
    server:aircraftFlightData.server,
    time:aircraftFlightData.time,
    totalFlights:aircraftFlightData.totalFlights,
    type:aircraftFlightData.type,
  }
  chrome.storage.local.set({[key]: saveData}, function() {
    display();
  });
}
function display(){
  displayFlightProfit();
  //Table
  let tableWell = $('<div class="as-table-well" style="max-width:950px;"></div>').append(buildTable());
  let panel = $('<div class="as-panel"></div>').append(tableWell);
  //action bar
  let btn = $('<button class="btn btn-default"></button>').text('Extract all flight profit/loss');
  let btn1 = $('<button class="btn btn-default"></button>').text('Extract finished flight profit/loss');

  let span = $('<span></span>');
  let li = $('<li></li>').append(btn1,btn,span);
  let actionBar =$('<ul class="as-panel as-action-bar"></ul>').append(li);
  //btn click
  btn.click(function(){
    btn.hide();
    btn1.hide();
    span.addClass('warning').text('Please reload page after all flight info pages open');
    extractAllFlightProfit('all');
  });
  btn1.click(function(){
    btn.hide();
    btn1.hide();
    span.addClass('warning').text('Please reload page after all flight info pages open');
    extractAllFlightProfit('finished');
  })
  //Header
  let h = $('<h3></h3>').text('AES Aircraft Flights');
  let div = $('<div></div>').append(h,actionBar,panel);
  $('.as-page-aircraft > h1:eq(0)').after(div);
}
function extractAllFlightProfit(type){
  aircraftFlightData.flights.forEach(function(value){
    if(type == 'finished'){
      if(value.status == 'finished' || value.status == 'inflight' ){

      } else {
        return
      }
    }
    let url = 'https://'+aircraftFlightData.server+'.airlinesim.aero/action/info/flight?id='+value.id;
    window.open(url, '_blank');
  });
}
function displayFlightProfit(){
  //Table
  let table =$('#aircraft-flight-instances-table');
  //Head
  let th = ['<th>Profit/Loss</th>','<th>Extract date</th>'];
  $('th:eq(9)',table).after(th);
  //body
  aircraftFlightData.flights.forEach(function(value){
    let td = [];

    if(value.data){
      td.push(formatMoney(value.data.money.CM5.Total));
      td.push($('<td></td>').text(formatDate(value.data.date)+' '+value.data.time));
    } else {
      td.push('<td></td>');
      td.push('<td></td>');
    }

    $('td:eq(11)',value.row).after(td);
  });
}
function buildTable(){
  //head
  let row = [];
  row.push($('<tr></tr>').append('<th>Total aircraft profit/loss</th>',formatMoney(aircraftFlightData.profit)));
  row.push($('<tr></tr>').append('<th>Aircraft Id</th>','<td>'+aircraftFlightData.aircraftId+'</td>'));
  row.push($('<tr></tr>').append('<th>Registration</th>','<td>'+aircraftFlightData.registration+'</td>'));
  row.push($('<tr></tr>').append('<th>Total flights</th>','<td>'+aircraftFlightData.totalFlights+'</td>'));
  row.push($('<tr></tr>').append('<th>Finished flights</th>','<td>'+aircraftFlightData.finishedFlights+'</td>'));
  row.push($('<tr></tr>').append('<th>Finished flights with profit/loss extract</th>','<td>'+aircraftFlightData.profitFlights+'</td>'));
  row.push($('<tr></tr>').append('<th>Data save time</th>','<td>'+formatDate(aircraftFlightData.date)+' '+aircraftFlightData.time+'</td>'));

  let tbody = $('<tbody></tbody>').append(row);
  return $('<table class="table table-bordered table-striped table-hover"></table>').append(tbody);
}
function getData(){
  //Aircraft ID
  let aircraftId = getAircraftId();
  let aircraftInfo = getAircraftInfo();
  let date = AES.getServerDate()
  let server = getServerName();
  let flights = getFlights();
  let flightsStats = getFlightsStats(flights);
  return {
    server:server,
    aircraftId:aircraftId,
    type:'aircraftFlights',
    date:date.date,
    time:date.time,
    registration:aircraftInfo.registration,
    equipment:aircraftInfo.equipment,
    flights:flights,
    finishedFlights:flightsStats.finishedFlights,
    totalFlights:flightsStats.totalFlights
  }
}
function getFlightsStats(flights){
  let finished, total;
  finished = total = 0;
  flights.forEach(function(value){
    if(value.status == 'finished' || value.status == 'inflight'){
      finished++;
    }
    total++;
  });
  return {
    totalFlights:total,
    finishedFlights:finished
  }
}
function getFlights(){
  let table = $('#aircraft-flight-instances-table');
  let flights = [];
  $('tbody tr',table).each(function(){
    if($('td:eq(1) span:eq(1)',this).text() !== 'XFER'){
      let status = $('.flightStatusPanel',this).text().trim();
      let url = $('.text-center a',this).attr('href');
      let a = url.split('id=');
      let id = a[1];
      flights.push(
        {
          status:status,
          id:id,
          row:$(this)
        }
      );
    }
  });
  return flights;
}
function getAircraftInfo(){
  let span = $('h1 span');
  return {
    registration:$(span[0]).text().trim(),
    equipment:$(span[1]).text().trim()
  }
}
function getAircraftId(){
  let url = window.location.pathname;
  let a = url.split('/');
  return parseInt(a[a.length-2],10);
}
function formatMoney(value){
  let container = document.createElement("td")
  let formattedValue = Intl.NumberFormat().format(value)
  let indicatorEl = document.createElement("span")
  let valueEl = document.createElement("span")
  let currencyEl = document.createElement("span")
  
  if (value >= 0) {
    valueEl.classList.add("good")
    indicatorEl.innerText = "+"
  }
  
  if (value < 0) {
    valueEl.classList.add("bad")
    indicatorEl.innerText = "-"
    formattedValue = formattedValue.replace("-", "")
  }
  
  valueEl.innerText = formattedValue
  currencyEl.innerText = " AS$"
  
  container.classList.add("aes-text-right", "aes-no-text-wrap")
  container.append(indicatorEl, valueEl, currencyEl)
  
  return container
}
function formatDate(date){
  return date.substring(0, 4)+'-'+date.substring(4, 6)+'-'+date.substring(6, 8);
}
function cleanInteger(a){
  a = a.replace(',','');
  a = a.replace('.','');
  a = a.replace(' AS$','');
  return parseInt(a, 10);
}
function getServerName(){
  let server = window.location.hostname
  server = server.split('.');
  return server[0];
}
