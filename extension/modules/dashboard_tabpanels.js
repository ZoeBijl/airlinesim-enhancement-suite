class DashboardTabpanels {
    constructor(component, index) {
        
    }
    
    getContentForPanel(index) {
        let html
        
        switch (index) {
            case 0:
                html = this.#createGeneral()
                break
            case 1:
                html = this.#createRouteManagement()
                break
            case 2:
                html = this.#createCompetitorMonitor()
                break
            case 3:
                html = this.#createAircraftProfitability()
                break
            default:
                html = `No content for tab at index ${index}`
                break
        }
        
        return html
    }
    
    #createContainer() {
        let container = document.createElement("div")
        container.className = "tab-pane active"

        return container
    }
    
    #createGeneral() {
        let container = this.#createContainer()
        
        let tableWell = document.createElement("div")
        tableWell.className = "as-table-well"
        
        let table = document.createElement("table")
        table.className = "table table-hover"
        
        let thead = document.createElement("thead")
        let row = document.createElement("tr")
        let th = document.createElement("th")
        let headings = []
        headings[0] = th.cloneNode()
        headings[0].innerText = "Area"
        headings[1] = th.cloneNode()
        headings[1].innerText = "Status"
        headings[2] = th.cloneNode()
        headings[2].innerText = "Action"
        row.append(headings[0], headings[1], headings[2])
        thead.append(row)
        
        let tbody = document.createElement("tbody")
        
        // TODO: Pull these into here
        generalAddScheduleRow(tbody)
        generalAddPersonelManagementRow(tbody)
        
        table.append(thead, tbody)
        tableWell.append(table)
        
        container.append(table)
        
        return container
    }
    
    #createRouteManagement() {
        let container = this.#createContainer()
        
        // TODO: Move to onload/oninstall?
        if(!settings.routeManagement){
            setDefaultRouteManagementSettings();
        }
        
        let scheduleKey = server+airline.code+'schedule'
        
        chrome.storage.local.get([scheduleKey], (result) => {
            let scheduleData = result
            
            if (!scheduleData) {
                let p = document.createElement("p")
                p.className = "warning"
                p.innerText = "Note: schedule info is needed to show this section. Change Dashboard to “General” → “Schedule” → “Extract Schedule”."
                
                container.append(p)
            } else {
                container.append(generateRouteManagementTable(scheduleData[scheduleKey]))
            }
        })
        
        // let scheduleData = await getScheduleData(scheduleKey)
        
        // if (scheduleData) {
        //     container.innerText = "Need schedule info to show this section. Change Dashboard to General -> Schedule -> Extract Schedule."
        //     return container
        // }
        
        //generateRouteManagementTable(scheduleData);
        
        /*
          chrome.storage.local.get([scheduleKey], function(result) {
            let scheduleData = scheduleData;
            if(scheduleData){
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
              buttonElements["selectFirstTen"].element.addEventListener("click", function(){
                let count = 0
                $('#aes-table-routeManagement tbody tr').each(function(){
                  $(this).find("input").prop('checked', true);
                  count++;
                  if(count > 10){
                    return false;
                  }
                })
              });
        
              // Remove checked
              buttonElements["hideChecked"].element.addEventListener("click", function(){
                $('#aes-table-routeManagement tbody tr').has('input:checked').remove();
              });
        
              // Open Inventory
              buttonElements["openInventory"].element.addEventListener("click", function(){
                //Get checked collumns
                let pages = $('#aes-table-routeManagement tbody tr').has('input:checked').map(function() {
                  let orgdest = $(this).attr('id');
                  orgdest = orgdest.split("-");
                  orgdest = orgdest[2];
                  //let orgdest = $(this).find("td:eq(1)").text() + $(this).find("td:eq(2)").text();
                  let url = 'https://'+server+'.airlinesim.aero/app/com/inventory/'+orgdest;
                  return url;
                }).toArray();
        
                //Open new tabs
                for (let i = 0; i < pages.length; i++) {
                  window.open(pages[i], '_blank');
                  if(i==10){
                    break;
                  }
                }
              });
        
              // Reload table reloadTable
              buttonElements["reloadTable"].element.addEventListener("click", function(){
                generateRouteManagementTable(scheduleData);
              });
              let divRow = $('<div class="row"></div>').append(optionsDiv,displayRouteManagementFilters(),displayRouteManagementCollumns())
              div.prepend(divRow);
              //Collumns selector Checkbox listener
              $('#aes-table-routeManagement-collumns input').change(function(){
                let show;
                if(this.checked) {
                  show = 1;
                } else {
                  show = 0;
                }
                let value = $(this).val();
                settings.routeManagement.tableCollumns.forEach(function(col){
                  if(col.class == value){
                    col.show = show;
                  }
                });
                chrome.storage.local.set({settings: settings}, function(){});
              });
        
            } else {
              //no schedule
              div.append("Need schedule info to show this section. Change Dashboard to General -> Schedule -> Extract Schedule.")
            }
          });
          */
        
        return container
    }
    
    #createCompetitorMonitor() {
        let container = document.createElement("div")
        container.innerText = "Competitor Monitor panel"
        
        return container
    }
    
    #createAircraftProfitability() {
        let container = document.createElement("div")
        container.innerText = "Aircraft Profitability panel"
        
        return container
    }
}

async function getScheduleData(scheduleKey) {
    let result = await chrome.storage.local.get([scheduleKey])

    return result
}
