"use strict";
//MAIN
//Global vars
var settings,server,airline;
$(function(){
  chrome.storage.local.get(['settings'], function(result) {
    settings = result.settings;
    //Default settings
    if(!settings.personelManagement){
      settings.personelManagement = {
        value:0,
        type:'absolute',
        auto:0
      };
    }
    server = getServerName();
    airline = getAirline();

    displayPersonelManagement();
  });
});
function displayPersonelManagement(){
  //Header rows
  let th = $('<tr></tr>').append('<th>Value</th>','<th>Type</th>');
  let thead = $('<thead></thead>').append(th);
  //body rows
  let td = [];
  //Value
  let input = $('<input type="text" id="aes-input-personelManagement-value" class="form-control number" style="min-width: 50px;">').val(settings.personelManagement.value);

  //Select type
  let option = [];
  option.push('<option value="absolute">AS$</option>');
  option.push('<option value="perc">%</option>');
  let select = $('<select id="aes-select-personelManagement-type" class="form-control"></select>').append(option);
  select.val(settings.personelManagement.type);


  td.push($('<td></td>').html(input));
  td.push($('<td></td>').html(select));

  let bRow = $('<tr></tr>').append(td);
  let tbody = $('<tbody></tbody>').append(bRow);


  let table = $('<table class="table table-bordered"></table>').append(thead,tbody);
  let tableWell = $('<div class="as-table-well"></div>').append(table);
  //Text
  let p = $('<p></p>').text('Select value (either absolute AS$ value or % value) to keep your personels salary in regards to country average. You can enter negative or positive values.');

  //buttons
  let btn = $('<button type="button" class="btn btn-default">apply salary</button>');
  //Span
  let span = $('<span></span>');


  let leftDiv = $('<div class="col-md-3"></div>').append(tableWell);
  let row = $('<div class="row"></div>').append(leftDiv);

  let panel = $('<div class="as-panel"></div>').append(p,row,btn,span);

  //Final
  let mainDiv = $(".container-fluid:eq(2) h1");
  mainDiv.after('<h3>AirlineSim Enhancement Suite Personel Management</h3>',panel);

  //actions
  select.change(function(){
    settings.personelManagement.type = select.val();
    chrome.storage.local.set({settings: settings}, function(){});
  });
  input.change(function(){
    settings.personelManagement.value = AES.cleanInteger(input.val());
    chrome.storage.local.set({settings: settings}, function(){});
  });


  btn.click( function(){
    span.removeClass().addClass('warning').text(' adjusting...');
    //Set button for auto click
    settings.personelManagement.auto = 1;
    settings.personelManagement.alreadyUpdated = [];
    priceUpdate(span);
  });

  //Automation
  if(settings.personelManagement.auto){
    span.removeClass().addClass('warning').text(' adjusting...');
    priceUpdate(span);
  }

  //Previous data
  let key = server+airline+"personelManagement";
  chrome.storage.local.get([key], function(result) {
    if(result[key]){
      p.after($('<p></p>').text('Last time updated on '+formatDate(result[key].date)+' '+result[key].time));
    } else {
      p.after($('<p></p>').text('No previous personel management data found.'));
    }
  });
}
function priceUpdate(span){
  chrome.storage.local.set({settings: settings}, function(){
    let value = settings.personelManagement.value;
    let type = settings.personelManagement.type;
    let found = 0;
    $('.container-fluid:eq(2) table:eq(1) tbody tr').each(function(){
      if(!$(this).find('th').length){
        let index = $(this).parent('tbody').index()+$(this).index();
        if(settings.personelManagement.alreadyUpdated.includes(index)){
          return true;
        }

        let salaryInput = $(this).find('form input:eq(2)');
        let salary = AES.cleanInteger(salaryInput.val());
        let average = AES.cleanInteger($(this).find('td:eq(9)').text());
        let salaryBtn = $(this).find('td:eq(8) > form .input-group-btn input');
        let newSalary;
        switch(type) {
          case 'absolute':
            newSalary = average + value;
            break;
          case 'perc':
            newSalary = Math.round((average * (1+value*0.01)));
            break;
          default:
            newSalary = salary;
        }
        if(newSalary != salary){
          settings.personelManagement.alreadyUpdated.push(index);
          chrome.storage.local.set({settings: settings}, function(){});
          salaryInput.val(newSalary);
          salaryBtn.click();
          found = 1;
          return false;
        }
      }
    });
    if(!found){
      settings.personelManagement.auto = 0;
      settings.personelManagement.alreadyUpdated = [];
      chrome.storage.local.set({settings: settings}, function(){

        //Save into memory

        let today = AES.getServerDate()
        let key = server + airline + 'personelManagement';
        let personelManagementData = {
          server:server,
          airline:airline,
          type:'personelManagement',
          date: today.date,
          time: today.time
        }
        chrome.storage.local.set({[key]: personelManagementData}, function(){
          span.removeClass().addClass('good').text(' all salaries at set level!');
        });
      });
    }
  });
}
function getAirline(){
   let airline = $("#as-navbar-main-collapse ul li:eq(0) a:eq(0)").text().trim().replace(/[^A-Za-z0-9]/g, '');
   return airline;
}
function getServerName(){
  let server = window.location.hostname
  server = server.split('.');
  return server[0];
}
function formatDate(date){
  return date.substring(0, 4)+'-'+date.substring(4, 6)+'-'+date.substring(6, 8);
}
