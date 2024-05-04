"use strict";
//MAIN
//Global vars
var flightInfoData,saveDataSpan;
$(function(){
  if(privateFlight()){
    if(correctTabOpen()){
      flightInfoData = getData();
      saveData();
      display();
    }
  }
});
function saveData(){
  saveDataSpan = $('<span></span>');
  let key = flightInfoData.server+flightInfoData.type+flightInfoData.flightId;
  chrome.storage.local.set({[key]: flightInfoData}, function() {
    saveDataSpan.addClass('good').text('Flight info data saved!');
    chrome.storage.local.get(['settings'], function(result) {
      let settings = result.settings;
      if(settings.flightInfo){
        if(settings.flightInfo.autoClose){
          close();
        }
      }
    });
  });
}
function privateFlight(){
  let headers = $('#privInf');
  if(headers.length){
    return true;
  } else {
    return false;
  }
}
function correctTabOpen(){
  if($('#flight-page > ul > li:eq(0)').hasClass('active')){
    return true;
  } else {
    return false;
  }
}
function getData(){
  //Flight ID
  let flightId = getFlightId();
  let date = getDate();
  let money = getFinancials();
  let server = getServerName();
  return {
    server:server,
    flightId:flightId,
    type:'flightInfo',
    money:money,
    date:date.date,
    time:date.time
  }
}
function display(){
  let tableWell = $('<div class="as-table-well"></div>').append(buildTable());
  let p = $('<p></p>').html(saveDataSpan);
  let panel = $('<div class="as-panel"></div>').append(tableWell,p);
  let h = $('<h3></h3>').text('AES Flight Information');
  let div = $('<div></div>').append(h,panel);
  $('body > .container-fluid:eq(0) > h1:eq(0)').after(div);
}
function buildTable(){
  //head
  let th = [];
  th.push('<th></th>');
  th.push('<th>Y</th>');
  th.push('<th>C</th>');
  th.push('<th>F</th>');
  th.push('<th>PAX</th>');
  th.push('<th>Cargo</th>');
  th.push('<th>Total</th>');
  let hrow = $('<tr></tr>').append(th);
  let thead = $('<thead></thead>').append(hrow);
  //body
  let row = [];
  for(let cm in flightInfoData.money) {
    let td = [];
    td.push('<th>'+cm+'</th>');
    for(let cmp in flightInfoData.money[cm]) {
      td.push($('<td></td>').html(formatMoney(flightInfoData.money[cm][cmp])));
    }
    row.push($('<tr></tr>').append(td));
  }
  let tbody = $('<tbody></tbody>').append(row);
  //foot
  let tf = [];
  tf.push('<th>Flight Id:</th>');
  tf.push('<th>'+flightInfoData.flightId+'</th>');
  tf.push('<th>Date:</th>');
  tf.push('<th>'+formatDate(flightInfoData.date)+' '+flightInfoData.time+'</th>');
  tf.push('<th></th>');
  tf.push('<th></th>');
  tf.push('<th></th>');
  let frow = $('<tr></tr>').append(tf);
  let fblankRow = $('<tr></tr>').append('<td colspan="7"></td>');
  let tfoot = $('<tfoot></tfoot>').append(fblankRow,frow);
  return $('<table class="table table-bordered table-striped table-hover"></table>').append(thead,tbody,tfoot);
}
function formatMoney(value){
  let span = $('<span></span>');
  let text = '';
  if(value > 0){
    span.addClass('good');
    text = '+'
  }
  if(value < 0){
    span.addClass('bad');
  }
  text = text + value + ' AS$';
  span.text(text);
  return span;
}
function formatDate(date){
  return date.substring(0, 4)+'-'+date.substring(4, 6)+'-'+date.substring(6, 8);
}
function getFinancials(){
  let data = {};
  let cm = $('.cm');
  cm.each(function(index){
    let contMargin = 'CM'+(index + 1);
    $('td',this).each(function(i){
      let cmp;
      switch(i) {
        case 0:
          cmp = 'Y'
          break;
        case 1:
          cmp = 'C'
          break;
        case 2:
          cmp = 'F'
          break;
        case 3:
          cmp = 'PAX'
          break;
        case 4:
          cmp = 'Cargo'
          break;
        case 5:
          cmp = 'Total'
          break;
      }
      let value = cleanInteger($(this).text());
      if(!data[contMargin]){
        data[contMargin] = {}
      }
      data[contMargin][cmp] = value;
    });
  });
  return data;
}
function getFlightId(){
  let url = window.location.href;
  let a = url.split('id=');
  let b = a[1].split('&');
  return parseInt(b[0],10);
}
function getDate(){
  let a = $(".as-footer-line-element:has('.fa-clock-o')").text().trim();
  let b = a.split(" ");
  //For date
  let dateTemp = b[0].split("-");
  let date;
  if(dateTemp.length == 1){
    //German
    dateTemp = dateTemp[0].split(".");
    date = dateTemp.map(function(value){
      return value.replace(/[^A-Za-z0-9]/g, '');
    });
    date = date[2] + date[1] + date[0];
  } else {
    //English
    date = dateTemp.map(function(value){
      return value.replace(/[^A-Za-z0-9]/g, '');
    });
    date = date[0] + date[1] + date[2];
  }
  //For time
  let time = b[b.length-2] +' '+b[b.length-1];
  return {date:date,time:time};
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
