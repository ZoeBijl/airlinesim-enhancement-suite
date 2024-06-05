// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
//Functions
function setDefaultSettings(){
  //Add default settings

  let aesSettings = {
    invPricing:setDefaultInvPricingSettings(),
    general:setDefaultGeneralSettings(),
    schedule:setDefaultScheduleSettings()
  };
  chrome.storage.local.get(['settings'], function(result) {
    let settings = result.settings;
    if(!settings){
      settings = aesSettings;
      chrome.storage.local.set({settings: aesSettings}, function() {
        
      });
    }
  });
  //
}

function setDefaultScheduleSettings(){
  //auto settings
  let schedule = {
    autoExtract:0
  };
  //Cmp setttings
  return schedule;
}
function setDefaultGeneralSettings(){
  //auto settings
  let general = {
    defaultDashboard:'general'
  };
  //Cmp setttings
  return general;
}
function setDefaultInvPricingSettings(){
  //auto settings
  let invPricing = {
    autoAnalysisSave:1,
    autoPriceUpdate:0,
    autoClose:0,
    recommendation:{},
    historyTable:{
      showNow:1,
      showOnlyPricing:0,
      numberOfDates:"5"
    }
  };
  //Cmp setttings
  let steps = [
    {
      min:0,
      max:40,
      name:'Drop High',
      step:-8
    },
    {
      min:40,
      max:60,
      name:'Drop Medium',
      step: -4
    },
    {
      min:60,
      max:70,
      name:'Drop Low',
      step: -2
    },
    {
      min:70,
      max:80,
      name:'Keep',
      step: 0
    },
    {
      min:80,
      max:90,
      name:'Raise Low',
      step: 1
    },
    {
      min:90,
      max:99,
      name:'Raise Medium',
      step: 2
    },
    {
      min:99,
      max:100,
      name:'Raise High',
      step: 5
    }
  ];
  let cmps = ['Y','C','F','Cargo'];
  cmps.forEach(function(cmp){
    invPricing.recommendation[cmp] = {
      maxPrice:200,
      minPrice:60,
      steps:steps
    };
  });
  return invPricing;
}


//MAIN

chrome.runtime.onInstalled.addListener(function() {
  setDefaultSettings();
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostContains: '.airlinesim.aero'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// TODO: trim the default visible columns to something more manageable; showing everything is overwhelming on first load.
// TODO: should this be in background.js? Might be better to move to its own file/create a settings file.
async function setDefaultRouteManagementColumns() {
    const data = await chrome.storage.local.get(["settings"])
    const settings = data.settings
    const currentVersion = settings.routeManagement.version
    const requiredVersion = "0.6.7"
    
    if (currentVersion === requiredVersion) {
        return
    }
    
    settings.routeManagement.version = requiredVersion
    settings.routeManagement.columns = [
        {
            "label": "Origin",
            "className": "aes-rm-origin",
            "isNumber": false,
            "isVisible": true,
            "key": "origin"
        },
        {
            "label": "Destination",
            "className": "aes-rm-destination",
            "isNumber": false,
            "isVisible": true,
            "key": "destination"
        },
        {
            "label": "Hub",
            "className": "aes-rm-hub",
            "isNumber": false,
            "isVisible": true,
            "key": "hub"
        },
        {
            "label": "OD",
            "className": "aes-rm-od",
            "isNumber": false,
            "isVisible": true,
            "key": "odName"
        },
        {
            "label": "Direction",
            "className": "aes-rm-direction",
            "isNumber": false,
            "isVisible": true,
            "key": "direction"
        },
        {
            "label": "# of flight numbers",
            "className": "aes-rm-flightnumbercount",
            "isNumber": true,
            "isVisible": true,
            "key": "flightNumberCount"
        },
        {
            "label": "PAX frequency",
            "className": "aes-rm-paxfrequency",
            "isNumber": true,
            "isVisible": true,
            "key": "paxFrequency"
        },
        {
            "label": "Cargo frequenc",
            "className": "aes-rm-cargoFreq",
            "isNumber": true,
            "isVisible": true,
            "key": "cargoFrequency"
        },
        {
            "label": "Total Frequency",
            "className": "aes-rm-totalFreq",
            "isNumber": true,
            "isVisible": true,
            "key": "totalFrequency"
        },
        {
            "label": "Analysis date",
            "className": "aes-rm-analysisDate",
            "isNumber": false,
            "isVisible": true,
            "key": "analysisDate"
        },
        {
            "label": "Previous Analysis date",
            "className": "aes-rm-analysisPreDate",
            "isNumber": false,
            "isVisible": true,
            "key": "previousAnalysisDate"
        },
        {
            "label": "Pricing date",
            "className": "aes-rm-pricingDate",
            "isNumber": false,
            "isVisible": true,
            "key": "pricingDate"
        },
        {
            "label": "PAX load",
            "className": "aes-rm-paxLoad",
            "isNumber": true,
            "isVisible": true,
            "key": "paxLoad"
        },
        {
            "label": "PAX load &Delta;",
            "className": "aes-rm-paxLoadDelta",
            "isNumber": true,
            "isVisible": true,
            "key": "paxLoadDelta"
        },
        {
            "label": "Cargo load",
            "className": "aes-rm-cargoLoad",
            "isNumber": true,
            "isVisible": true,
            "key": "cargoLoad"
        },
        {
            "label": "Cargo load &Delta;",
            "className": "aes-rm-cargoLoadDelta",
            "isNumber": true,
            "isVisible": true,
            "key": "cargoLoadDelta"
        },
        {
            "label": "Total load",
            "className": "aes-rm-load",
            "isNumber": true,
            "isVisible": true,
            "key": "totalLoad"
        },
        {
            "label": "Total load &Delta;",
            "className": "aes-rm-loadDelta",
            "isNumber": true,
            "isVisible": true,
            "key": "totalLoadDelta"
        },
        {
            "label": "PAX Index",
            "className": "aes-rm-paxIndex",
            "isNumber": true,
            "isVisible": true,
            "key": "paxIndex"
        },
        {
            "label": "PAX Index &Delta;",
            "className": "aes-rm-paxIndexDelta",
            "isNumber": true,
            "isVisible": true,
            "key": "paxIndexDelta"
        },
        {
            "label": "Cargo Index",
            "className": "aes-rm-cargoIndex",
            "isNumber": true,
            "isVisible": true,
            "key": "cargoIndex"
        },
        {
            "label": "Cargo Index &Delta;",
            "className": "aes-rm-cargoIndexDelta",
            "isNumber": true,
            "isVisible": true,
            "key": "cargoIndexDelta"
        },
        {
            "label": "Index",
            "className": "aes-rm-index",
            "isNumber": true,
            "isVisible": true,
            "key": "totalIndex"
        },
        {
            "label": "Index &Delta;",
            "className": "aes-rm-indexDelta",
            "isNumber": true,
            "isVisible": true,
            "key": "totalIndexDelta"
        },
        {
            "label": "Route PAX Index",
            "className": "aes-rm-routeIndexPax",
            "isNumber": true,
            "isVisible": true,
            "key": "routePaxIndex"
        },
        {
            "label": "Route Cargo Index",
            "className": "aes-rm-routeIndexCargo",
            "isNumber": true,
            "isVisible": true,
            "key": "routeCargoIndex"
        },
        {
            "label": "Route Index",
            "className": "aes-rm-routeIndex",
            "isNumber": true,
            "isVisible": true,
            "key": "routeTotalIndex"
        }
    ]
    
    chrome.storage.local.set({settings: settings})
}

// TODO: run on install (chrome.runtime.onInstalled.addListener)
setDefaultRouteManagementColumns()
