"use strict";
//MAIN
//Global vars
var server,airlineId,activeTab,compData;
$(function(){
    server = AES.getServerName();
    airlineId = AES.getAirlineId();
    activeTab = $(".nav-tabs .active").attr('class').split(" ");
    activeTab = activeTab[0];
    let key = server+airlineId+'competitorMonitoring';
    chrome.storage.local.get([key], function(compMonitoringData) {
      compData = compMonitoringData[key];
      if(!compData){
        compData = {
          key:key,
          server:server,
          id:airlineId,
          type:"competitorMonitoring",
          tab0:{},
          tab2:{},
          tracking:0,
          autoExtract:0
        }
      }
      displayMain();



    });
});
function displayMain(){
  //Clean
  $('#aes-panel-airline-competitive-monitoring').remove();
  //panel
  let panel = $('<div class="as-panel"></div>');

  //Checkbox
  let checkbox = $('<input type="checkbox">');
  let label = $('<label></label>').append(checkbox,' follow this airline in Competitor Monitoring');
  let divCheckbox = $('<div class="checkbox"></div>').append(label);

  //Competitive display comp monitoring
  let divComp = $('<div></div>');
  $(checkbox).change(function() {
    if(this.checked) {
      //Update tracker
      compData.tracking =1;
      chrome.storage.local.set({[compData.key]: compData}, function() {});

      //Action bar
      let actionBar = $('<ul class="as-panel as-action-bar"></ul>');
      divComp.append(actionBar);
      //Display
      displayCompetitorMonitoring(divComp);


      switch(activeTab) {
        case 'tab0':

          displayTab0(actionBar);
          break;
        case 'tab1':
          // Nothing
          break;
        case 'tab2':
          displayTab2(actionBar)
          break;
        case 'tab3':
          // Nothing Controled via schedule content script
          break;
        default:
          console.error('Error 0925: Enterprice Overview Active Tab not found '+activeTab)
          die();
      }
      displayAutomation(actionBar);
    } else {
      //Update tracker
      compData.tracking =0;
      chrome.storage.local.set({[compData.key]: compData}, function() {});
      //Display
      divComp.empty();
    }
  });
  //Checkbox default
  if(compData.tracking){
    checkbox.prop('checked', true);
    checkbox.trigger("change");
  }
  //panel
  panel.append(divCheckbox);


  //Add display
  let mainDiv = $('<div id="aes-panel-airline-competitive-monitoring"></div>').append('<h3>AirlineSim Enhancement Suite Airline</h3>',panel,divComp);
  $(".container-fluid:eq(2) h2").after(mainDiv);
}
function displayAutomation(actionBar){
  if(!compData.autoExtract){ //
    let span = $('<span></span>');
    let btn = $('<button type="button" class="btn btn-default">save all tab data</button>');
    btn.click(function(){
      btn.remove();
      span.removeClass().addClass('warning').text('extracting...');
      compData.autoExtract = 1;
      if(activeTab == 'tab0'){
        $('#aes-btn-save-tab0-data').click();
      } else {
        window.open('./'+airlineId+'?tab=0','_self');
      }
    });
    let li = $('<li></li>').append(btn,span);
    actionBar.append(li);
  } else {
    let span = $('<span></span>').addClass('warning').text('Please wait... extracting all tab info...');
    let li = $('<li></li>').append(span);
    actionBar.append(li);
  }
}
function displayCompetitorMonitoring(div){
  let th = [];
  th.push('<th>Overview</th>');
  th.push('<th>Facts and Figures</th>');
  th.push('<th>Schedule</th>');
  let headRow = $('<tr></tr>').append(th);
  let thead = $('<thead></thead>').append(headRow);
  //body
  let td = [];
  td.push($('<td></td>').html(displayOverviewRow()));
  td.push($('<td></td>').html(displayFactsAndFiguresRow()));
  td.push($('<td></td>').html(displayScheduleRow()));
  let row = $('<tr></tr>').append(td);
  let tbody = $('<tbody></tbody>').append(row);
  let table = $('<table class="table table-bordered table-striped table-hover"></table>').append(thead,tbody);
  let divTable = $('<div class="as-table-well"></div>').append(table);
  let divPanel = $('<div class="as-panel"></div>').append(divTable);

  div.append(divPanel);

}
function displayTab0(actionBar){
  //Get data
  let data = getTab0Data();
  //Save Data
  let span = $('<span></span>');
  let btnSave = $('<button id="aes-btn-save-tab0-data" type="button" class="btn btn-default">save competitor overview data</button>');

  btnSave.click(function(){
    btnSave.remove();
    span.removeClass().addClass('warning').text('saving data...');
    let time = AES.getServerDate()

    compData.tab0[time.date] = data;
    compData.tab0[time.date].updateTime = time.time;
    compData.tab0[time.date].date = time.date;
    chrome.storage.local.set({[compData.key]: compData}, function() {
      span.removeClass().addClass("good").text("Overview Tab data Saved!");
      if(compData.autoExtract){
        window.open('./'+airlineId+'?tab=2','_self');
      }

    });
  });
  let li = $('<li></li>').append(span,btnSave);
  actionBar.append(li);

  //Automation
  if(compData.autoExtract){
    btnSave.click();
  }
}
function displayTab2(actionBar){
  let data = getTab2Data();
  //Save Data
  let span = $('<span></span>');
  let btnSave = $('<button type="button" class="btn btn-default">save fact and figures data</button>');

  //Check if this week already saved
  let update =1;
  let dates = [];
  for(let date in compData.tab2) {
    dates.push(date);
  }
  dates.sort(function(a, b){return b-a});
  if(dates.length){
    if(compData.tab2[dates[0]].week == data.week){
      update=0;
    }
  }


  let li;
  if(update){
    btnSave.click(function(){
      btnSave.remove();
      span.removeClass().addClass('warning').text('saving data...');
      let time = AES.getServerDate()

      compData.tab2[time.date] = data;
      compData.tab2[time.date].updateTime = time.time;
      compData.tab2[time.date].date = time.date;
      chrome.storage.local.set({[compData.key]: compData}, function() {
        span.removeClass().addClass("good").text("Fact and figures Tab data Saved!");
        if(compData.autoExtract){
          window.open('./'+airlineId+'?tab=3','_self');
        }
      });
    });
    li = $('<li></li>').append(span,btnSave);
  } else {
    span.addClass('good').text('The current week facts and figures data is already saved');
    li = $('<li></li>').append(span);
  }




  actionBar.append(li);

  //Automation
  if(compData.autoExtract){
    if(update){
      btnSave.click();
    } else {
      window.open('./'+airlineId+'?tab=3','_self');
    }
  }
}
function displayOverviewRow(){
  let span = $('<span></span>');
  let dates = [];
  for(let propertyName in compData.tab0) {
    dates.push(propertyName);
  }
  dates.sort(function(a, b){return b-a});
  if(dates.length){
    let diff = AES.getDateDiff([AES.getServerDate().date, dates[0]]);
    span.text('Last overview extract '+AES.formatDateString(dates[0])+' ('+diff+' days ago)');
    if(diff >= 0 && diff < 7){
      span.addClass('good');
    } else {
      span.addClass('warning');
    }
  } else {
    span.addClass('bad').text('No Overview data')
  }
  return span;
}
function displayFactsAndFiguresRow(){
  let span = $('<span></span>');
  let dates = [];
  for(let propertyName in compData.tab2) {
    dates.push(propertyName);
  }
  dates.sort(function(a, b){return b-a});
  if(dates.length){
    let diff = AES.getDateDiff([AES.getServerDate().date, dates[0]]);
    span.text('Last facts and figures extract for week '+formatWeekDate(compData.tab2[dates[0]].week)+' done on '+AES.formatDateString(dates[0])+' ('+diff+' days ago)');
    if(diff >= 0 && diff < 7){
      span.addClass('good');
    } else {
      span.addClass('warning');
    }
  } else {
    span.addClass('bad').text('No facts and figures data');
  }
  return span;
}
function displayScheduleRow(){
  let span = $('<span></span>');
  let dates = [];
  for(let propertyName in compData.tab0) {
    dates.push(propertyName);
  }
  dates.sort(function(a, b){return b-a});
  if(dates.length){
    let code = compData.tab0[dates[0]].code;
    let scheduleKey = server+code+'schedule';
    chrome.storage.local.get([scheduleKey], function(result) {
      let scheduleData = result[scheduleKey];
      if(scheduleData){
        let scheduleDates = [];
        for(let date in scheduleData.date){
          if (Number.isInteger(parseInt(date))) {
            scheduleDates.push(date);
          }
        }
        scheduleDates.reverse();
        let diff = AES.getDateDiff([AES.getServerDate().date, scheduleDates[0]]);
        span.text('Last schedule extract '+AES.formatDateString(dates[0])+' ('+diff+' days ago)');
        if(diff >= 0 && diff < 7){
          span.addClass('good');
        } else {
          span.addClass('warning');
        }
      } else {
        //no schedule
        span.addClass('bad').text('No Schedule data found.');
      }
    });
  } else {
    span.addClass('bad').text('Extract overview to see schedule data');
  }
  return span;

}
function getTab0Data(){
  let data = {};
  //airline generic ;
  let airline = getAirline();
  data.code = airline.code;
  data.name = airline.name;
  data.displayName = airline.displayName;
  //First table
  let table = $(".layout-col-md-4 > .as-fieldset:eq(0) table tbody");
  data.rating = $('td:eq(1)',$('tr',table).last()).text().trim().replace(/[^A-Za-z0-9]/g, '');
  //console.log(table.find('tr:eq(9) td:eq(1)').text().trim().replace(/[^A-Za-z0-9]/g, ''));
  //console.log($('tr td:eq(1)',table).last().text().trim().replace(/[^A-Za-z0-9]/g, ''));
  //console.log($('td:eq(1)',$('tr',table).last()).text().trim().replace(/[^A-Za-z0-9]/g, ''));
  //Second Table
  table = $(".layout-col-md-4 > .as-fieldset:eq(1) table tbody");
  data.pax = parseInt(table.find('tr:eq(0) td:eq(1)').text().trim().replace(/\D/g, ''),10);
  data.cargo = parseInt(table.find('tr:eq(1) td:eq(1)').text().trim().replace(/\D/g, ''),10);
  data.stations = parseInt(table.find('tr:eq(2) td:eq(1)').text().trim().replace(/\D/g, ''),10);
  data.fleet = parseInt(table.find('tr:eq(3) td:eq(1)').text().trim().replace(/\D/g, ''),10);
  data.employees = parseInt(table.find('tr:eq(4) td:eq(1)').text().trim().replace(/\D/g, ''),10);
  data.tab0data=1;
  return data;
}
function getTab2Data(){
  //First table
  let data = {};
  let table = $(".tab-content table");
  data.week = parseInt(table.find('tr:eq(0) th:eq(2)').text().trim().replace(/\D/g, ''),10);
  data.airportsServed = parseInt(table.find('tbody:eq(0) tr:eq(0) td:eq(1)').text().trim().split('(')[0].replace(/\D/g, ''),10);
  data.operatedFlights = parseInt(table.find('tbody:eq(0) tr:eq(1) td:eq(1)').text().trim().split('(')[0].replace(/\D/g, ''),10);
  data.seatsOffered = parseInt(table.find('tbody:eq(1) tr:eq(2) td:eq(1)').text().trim().split('(')[0].replace(/\D/g, ''),10);
  data.sko = parseInt(table.find('tbody:eq(1) tr:eq(5) td:eq(1)').text().trim().split('(')[0].replace(/\D/g, ''),10);
  data.cargoOffered = parseInt(table.find('tbody:eq(2) tr:eq(2) td:eq(1)').text().split('(')[0].trim().replace(/\D/g, ''),10);
  data.fko = parseInt(table.find('tbody:eq(2) tr:eq(5) td:eq(1)').text().trim().split('(')[0].replace(/\D/g, ''),10);
  data.tab2data=2;
  return data;
}
/**
 * Retrieves the airline's code, name, and display name from the enterprises page.
 *
 * @returns {Object} An object containing the airline's code, name, and display name.
 */
function getAirline(){
  let table = $(".container-fluid:eq(2) .layout-row:eq(0) > .layout-col-md-4 > .as-fieldset:eq(0) table tbody");
  let code = table.find('tr:eq(1) td:eq(1)').text().trim().replace(/[^A-Za-z0-9]/g, '');
  let displayName = table.find('tr:eq(0) td:eq(1)').text().trim();
  let name = displayName.replace(/[^A-Za-z0-9]/g, '');

  return {code:code,name:name,displayName:displayName};
}
function formatWeekDate(date){
  let a = date.toString();
  return a.substring(0, 2)+'/'+a.substring(2, 6);
}
