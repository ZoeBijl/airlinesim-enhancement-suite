"use strict"

let settings, server, airline

window.addEventListener("load", async (event) => {
    settings = await AES.getSettings()

    if (!settings.personelManagement) {
        settings.personelManagement = {
            value: 0,
            type: 'absolute',
            auto: 0
        }
        chrome.storage.local.set({ settings: settings })
    }
    server = AES.getServerName()
    airline = getAirline()
    
    const updateForm = createUpdateForm()
    rebuildLayout(updateForm)
    
    // displayPersonelManagement()
})

function rebuildLayout(updateForm) {
    const container = document.querySelector(".as-navbar-main + .container-fluid")
    const table = container.querySelector(".as-panel")
    const heading = container.querySelector("h1")
    const sidebar = document.createElement("div")
    sidebar.className = "col-sm-6 col-md-3"
    sidebar.append(updateForm)
    const main = document.createElement("div")
    main.className = "col-sm-12 col-md-9"
    main.append(table)
    const row = document.createElement("div")
    row.className = "row"
    row.append(sidebar, main)
    container.append(row)
}

function createUpdateForm() {
    const container = document.createElement("div")
    const heading = document.createElement("h2")
    heading.className = "h3"
    heading.innerText = "Update Salaries"
    const panel = document.createElement("div")
    panel.className = "as-panel"
    const description = document.createElement("p")
    description.innerText = "Select value (either absolute AS$ value or % value) to keep your personels salary in regards to country average. You can enter negative or positive values"
    const table = new SalaryUpdateTable()
    panel.append(description, table.container)
    container.append(heading, panel)

    return container
}

function displayPersonelManagement() {
    
    //Select type
    let option = [];
    option.push('<option value="absolute">AS$</option>');
    option.push('<option value="perc">%</option>');
    let select = $('<select id="aes-select-personelManagement-type" class="form-control"></select>').append(option);
    select.val(settings.personelManagement.type);


    //buttons
    let btn = $('<button type="button" class="btn btn-default">apply salary</button>');
    //Span
    let span = $('<span></span>');


    let leftDiv = $('<div class="col-md-3"></div>').append(tableWell);
    let row = $('<div class="row"></div>').append(leftDiv);

    let panel = $('<div class="as-panel"></div>').append(p, row, btn, span);

    //Final

    //actions
    select.change(function() {
        settings.personelManagement.type = select.val();
        chrome.storage.local.set({ settings: settings }, function() {});
    });
    input.change(function() {
        settings.personelManagement.value = AES.cleanInteger(input.val());
        chrome.storage.local.set({ settings: settings }, function() {});
    });


    btn.click(function() {
        span.removeClass().addClass('warning').text(' adjusting...');
        //Set button for auto click
        settings.personelManagement.auto = 1;
        settings.personelManagement.alreadyUpdated = [];
        priceUpdate(span);
    });

    //Automation
    if (settings.personelManagement.auto) {
        span.removeClass().addClass('warning').text(' adjusting...');
        priceUpdate(span);
    }

    //Previous data
    let key = server + airline + "personelManagement";
    chrome.storage.local.get([key], function(result) {
        if (result[key]) {
            p.after($('<p></p>').text('Last time updated on ' + AES.formatDateString(result[key].date) + ' ' + result[key].time));
        } else {
            p.after($('<p></p>').text('No previous personel management data found.'));
        }
    });
}

function priceUpdate(span) {
    chrome.storage.local.set({ settings: settings }, function() {
        let value = settings.personelManagement.value;
        let type = settings.personelManagement.type;
        let found = 0;
        $('.container-fluid:eq(2) table:eq(1) tbody tr').each(function() {
            if (!$(this).find('th').length) {
                let index = $(this).parent('tbody').index() + $(this).index();
                if (settings.personelManagement.alreadyUpdated.includes(index)) {
                    return true;
                }

                let salaryInput = $(this).find('form input:eq(2)');
                let salary = AES.cleanInteger(salaryInput.val());
                let average = AES.cleanInteger($(this).find('td:eq(9)').text());
                let salaryBtn = $(this).find('td:eq(8) > form .input-group-btn input');
                let newSalary;
                switch (type) {
                    case 'absolute':
                        newSalary = average + value;
                        break;
                    case 'perc':
                        newSalary = Math.round((average * (1 + value * 0.01)));
                        break;
                    default:
                        newSalary = salary;
                }
                if (newSalary != salary) {
                    settings.personelManagement.alreadyUpdated.push(index);
                    chrome.storage.local.set({ settings: settings }, function() {});
                    salaryInput.val(newSalary);
                    salaryBtn.click();
                    found = 1;
                    return false;
                }
            }
        });
        if (!found) {
            settings.personelManagement.auto = 0;
            settings.personelManagement.alreadyUpdated = [];
            chrome.storage.local.set({ settings: settings }, function() {

                //Save into memory

                let today = AES.getServerDate()
                let key = server + airline + 'personelManagement';
                let personelManagementData = {
                    server: server,
                    airline: airline,
                    type: 'personelManagement',
                    date: today.date,
                    time: today.time
                }
                chrome.storage.local.set({
                    [key]: personelManagementData }, function() {
                    span.removeClass().addClass('good').text(' all salaries at set level!');
                });
            });
        }
    });
}

function getAirline() {
    let airline = $("#as-navbar-main-collapse ul li:eq(0) a:eq(0)").text().trim().replace(/[^A-Za-z0-9]/g, '');
    return airline;
}
