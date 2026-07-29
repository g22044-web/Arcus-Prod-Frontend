$(document).ready(function () {
    assignMetaValue();
    $("meta[name='google-signin-client_id']").attr("content", metaValue);

    getLocalSessionData();
    if (sessionName == null) {
        window.location.href = 'index.html';
        return false;
    } else {
        let accessStatus = checkDashboardPageAccessData()
        if (accessStatus) {
            let accessLevel = checkEachPageAccess("Team")
            if (accessLevel.length > 0) {

                let environment = accessLevel[0]
                if (environment == apiValue.environment) {
                    // getPageTime("team","teamsPage","teamsDetails","page success");
                    $(".show_page").css("display", "block");
                    let d = new Date();
                    let strDate = convertDate(d);
                    $("#team_date_filter").val(strDate)
                    document.getElementById('team_date_filter').setAttribute('min', new Date().toISOString().split('T')[0])
                    const currentYear = new Date().getFullYear();
                    const shortYear = currentYear.toString().slice(-2);
                    let utili_header = `<th rowspan="2" scope="col" class="col_width_id columntwo">ID</th>
                            <th class="columnthree">Name</th>
                            <th>Job Title</th>
                            <th>Location</th>
                            <th style="display:none">Function</th>
                            <th rowspan="2" class='noWordBreak'>Jan ${shortYear}</th>
                            <th rowspan="2" class='noWordBreak'>Feb ${shortYear}</th>
                            <th rowspan="2" class='noWordBreak'>Mar ${shortYear}</th>
                            <th rowspan="2" class='noWordBreak'>Apr ${shortYear}</th>
                            <th rowspan="2" class='noWordBreak'>May ${shortYear}</th>
                            <th rowspan="2" class='noWordBreak'>Jun ${shortYear}</th>
                            <th rowspan="2" class='noWordBreak'>Jul ${shortYear}</th>
                            <th rowspan="2" class='noWordBreak'>Aug ${shortYear}</th>
                            <th rowspan="2" class='noWordBreak'>Sep ${shortYear}</th>
                            <th rowspan="2" class='noWordBreak'>Oct ${shortYear}</th>
                            <th rowspan="2" class='noWordBreak'>Nov ${shortYear}</th>
                            <th rowspan="2" class='noWordBreak'>Dec ${shortYear}</th>
                            <th colspan="2">Billed<br><span class="utilization_span">Utilization %</span></th>`
                    $('#utilization_header').empty();
                    $('#utilization_header').append(utili_header);
                    getSowViewData(strDate)
                    // getEmpData(strDate);
                    
                    function convertDate(date) {
                        var yyyy = date.getFullYear().toString();
                        var mm = (date.getMonth() + 1).toString();
                        var dd = date.getDate().toString();

                        var mmChars = mm.split('');
                        var ddChars = dd.split('');

                        return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
                    }
                    $(".input-group-addon").hide();
                    $(".loader").css("display", "none");
                    $(".show_page").css("display", "block");
                    $("#fy_year").html('FY'+shortYear);
                    jQuery('#skillSelect').multiselect({
                        columns: 1,
                        placeholder: 'Skills',
                        search: true
                    });
                    jQuery('#startDate').multiselect({
                        columns: 1,
                        placeholder: 'Start Date',
                        search: true
                    });
                    jQuery('#endDate').multiselect({
                        columns: 1,
                        placeholder: 'End Date',
                        search: true
                    });
                    jQuery('#nameSelect').multiselect({
                        columns: 1,
                        placeholder: 'Name',
                        search: true,
                        onOptionClick: function(element, option) {
                            updatePlaceholderText('ms-list-1', 'Name', 'nameSelect');
                        },
                        onChange: function(element, checked) {
                            updatePlaceholderText('ms-list-1', 'Name', 'nameSelect');
                        }
                    });
                    jQuery('#jobSelect').multiselect({
                        columns: 1,
                        placeholder: 'Job',
                        search: true,
                        onOptionClick: function(element, option) {
                            updatePlaceholderText('ms-list-2','Job', 'jobSelect');
                        },
                        onChange: function(element, checked) {
                            updatePlaceholderText('ms-list-2','Job', 'jobSelect');
                        }
                    });
                    jQuery('#locatSelect').multiselect({
                        columns: 1,
                        placeholder: 'Location',
                        search: true,
                        onOptionClick: function(element, option) {
                            updatePlaceholderText('ms-list-3', 'Location', 'locatSelect');
                        },
                        onChange: function(element, checked) {
                            updatePlaceholderText('ms-list-3', 'Location', 'locatSelect');
                        }
                    });
                }
            } else {
                window.location.href = "home.html"
            }
        } else {
            window.location.href = "home.html"
        }
    }
    $(".new-sub-menu").hover(function () {
        $('.sub-menu').css('display', '')

    });
    $('#dashboard').click(function () {
        window.location.href = 'home.html';
        return false;
    });
    $('#logout').click(function () {
        localStorage.clear();
        console.log("sessionName - " + sessionName);
        window.location.href = 'index.html';
        return false;
    });
    $("#use_bench_data").click(function () {
        window.location.href = 'useBench.html';
        return false;
    });
    $('#create_employee').click(function () {
        window.location.href = 'employee_create.html';
        return false;
    });

    $('#training_btn').click(function () {
        window.location.href = 'training.html';
        return false;
    })
});
function employeeDetails() {
    window.location.href = 'team-profile.html';
    return false;
}

function updatePlaceholderText(selId, placValue, inputId) {
    const selectedOptions = $(`#${inputId} option:selected`);
    let placeholderText = placValue;

    if (selectedOptions.length === 1) {
        placeholderText = truncateText(selectedOptions.text(), 9);
    } else if (selectedOptions.length > 1) {
        placeholderText = `${selectedOptions.length} selected`;
    }

    $(`#${selId} > button`).html(placeholderText);
}
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

let empAllData = [],empIndData = [],empUsData = [], empAllUtilizationData = [],empMonthData = [];
var skill_data_option = "";
var FilteredNewJson = [];
let filterStatus = false;
let filterApplyJson = []
const pathname = window.location.pathname;
// Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();

const getSowViewData = async (selDate) => {
    var empData = [];
    const startTime = performance.now();
    try {
        let status = "";
        let endDate = "";
        let form_details = {
            "db_name": apiValue.db_name,
            "STATUS_AS_OF_DATE": selDate,
            "environment": apiValue.environment
        };
        let data = await fetch(apiValue.url_ip + ":5003/utilization_percentage_monthly_chart", {
            method: "POST",
            body: JSON.stringify(form_details),
        });
        const result = await data.json();
        // console.log("result", result);
        let empAllresult = result;
        empAllUtilizationData = empAllresult.DATA;
        const endTime = performance.now();
        const loadTimeInSeconds = (endTime - startTime) / 1000;
        // getApiTime(loadTimeInSeconds, "team", "Teams", "teams", "success", fileName, "teamsPage", "view");
        $.each(empAllUtilizationData, function (i, empData) {
            if (empData.LOCATION == "India") {
                empIndData = empData.EMPLOYEE_DATA;
            }
            if (empData.LOCATION == "US") {
                empUsData = empData.EMPLOYEE_DATA;
            }
        });
        console.log('empIndData - ',empIndData)
        console.log('empUsData - ',empUsData)
        empAllData = [...empIndData, ...empUsData];
        console.log('empAllData - ',empAllData)
        getEmpDataTable(empAllData, 'API');
        getEmpSkillOptions(empAllData);
        $(".table-loading").hide();
    } catch {
        const endTime = performance.now();
        const loadTimeInSeconds = (endTime - startTime) / 1000;
        // getApiTime(loadTimeInSeconds, "team", "Teams", "teams", "error", fileName, "teamsPage", "view");
        // console.error("Error occurred while fetching data:", error);
        $(".loader").css("display", "none");
        $(".show_page").css("display", "block");
    }
};
function getEmpData(selDate) {
    var empData = [];
    let status = "";
    let endDate = "";
    $.ajax({
        url: apiValue.url_ip + ":5001/teams",
        type: "POST",

        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        beforeSend: function () {
            $("#teams_div").addClass("ajax_load_hide");
            $("#loading_div").removeClass("ajax_load_hide");
        },
        complete: function () {
            $("#teams_div").removeClass("ajax_load_hide");
            $("#loading_div").addClass("ajax_load_hide");
        },
        data: JSON.stringify({

            "STATUS_AS_OF_DATE": selDate,
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        }),
        success: function (data) {

            empAllData = data;
            $.each(empAllData, function (i, empData) {
                if (empData.LOCATION == "India") {
                    empIndData = empData.EMPLOYEE_DATA;
                }
                if (empData.LOCATION == "US") {
                    empUsData = empData.EMPLOYEE_DATA;
                }
            });
            empAllData = [...empIndData, ...empUsData];
            getEmpDataTable(empAllData);
            $(".table-loading").hide();
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
}
function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
}


// Add remove loading class on body element depending on Ajax request status
$(document).on({
    ajaxStart: function () {
        $("body").addClass("loading");
    },
    ajaxStop: function () {
        $("body").removeClass("loading");
    }
});

let empNameOptions = "", empNameUsOptions = "", jobNameOptions = "",jobNameUsOptions = "", jobNameAllOptions  = "", managerOptions = "", managerUsOptions = "";
let locationOptions = "", functionOptions = "", custNameOptions = "", billingOptions = "",managerAllOptions = "", locationindOptions = "", locationusOptions = "", locationAllOptions = "";
let filterJsonData = [], jobNameArray_IND = [], jobNameArray_US = [], managerNameArray_IND = [], managerNameArray_US = [], functionArray = [];
let empNameArray_IND = [], empNameArray_US = [], custNameArray = [], billArray = [], locationArray = [], allEmpNameArray = [];
let checkValue = 0;

function getEmpDataTable(emp, e) {
    const tableBody = $('#emp_table tbody');
    const empTable = $('#emp_table');

    // Clear the table body and DataTable instance
    tableBody.empty();
    empTable.DataTable().clear().destroy();

    let empCount = emp.length;
    var selectedVal = "";
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    const currentYear = new Date().getFullYear();
    const shortYear = currentYear.toString().slice(-2);
    const allMonths = [
        `Jan_${shortYear}`, `Feb_${shortYear}`, `Mar_${shortYear}`, `Apr_${shortYear}`, `May_${shortYear}`,
        `Jun_${shortYear}`, `Jul_${shortYear}`, `Aug_${shortYear}`, `Sep_${shortYear}`, `Oct_${shortYear}`,
        `Nov_${shortYear}`, `Dec_${shortYear}`
    ];

    emp.forEach(employee => {
        let utilizationData = employee.UTILIZATION_DATA;
        let utilizationHtml = '';
        
        // Add missing months to utilizationData with zero values
        allMonths.forEach(month => {
            if (!utilizationData.find(data => data.MONTH_YEAR === month)) {
                utilizationData.push({
                    "MONTH_YEAR": month,
                    "Bench": 0,
                    "Billed": 0,
                    "Investment": 0
                });
            }
        });

        // Sort utilizationData by MONTH_YEAR
        utilizationData.sort((a, b) => allMonths.indexOf(a.MONTH_YEAR) - allMonths.indexOf(b.MONTH_YEAR));
        utilizationData.forEach(data => {
            let toolTipData = '';
            if (data.Billed > 0) toolTipData += `Billed: ${data.Billed}%\n`;
            if (data.Investment > 0) toolTipData += `Investment: ${data.Investment}%\n`;
            if (data.Bench > 0) toolTipData += `Bench: ${data.Bench}%\n`;

            utilizationHtml += `<td
                                class="tooltip-container"
                                data-tooltip-id="rev"
                                data-toggle="tooltip"
                                title="${toolTipData}"
                                style='padding : 0px !important;'
                            >
                                <div class="bar-container">
                                    <div class="bar-green" style='width: ${data.Billed}%;'></div>
                                    <div class="bar-yellow" style='width: ${data.Investment}%;'></div>
                                    <div class="bar-red" style='width: ${data.Bench}%;'></div>
                                </div>
                            </td>`;
        });

        let row = $(`
            <tr>
                <td class="columnBody1"><div class="team_data_left">${employee.EMPLOYEE_ID}</div></td>
                <td class="columnBody2"><div class="team_data_left">${employee.EMPLOYEE_NAME}</div></td>
                <td><div class="team_data_left">${employee.JOB_ROLE}</div></td>
                <td><div class="team_data">${employee.LOCATION}</div></td>
                <td style="display: none"><div class="team_data">${employee.DEPARTMENT}</div></td>
                ${utilizationHtml}
                <td><div class="team_data">${employee.YTD_UTILIZATION}</div></td>
                <td><div class="team_data">${employee.CURRENT_YEAR_UTIIZATION}</div></td>
            </tr>
        `);

        tableBody.append(row);
    });

    // Calculate and display the utilization data for each month
    let billedDataHtml = '', benchDataHtml = '', investmentDataHtml = '';
    allMonths.forEach(month => {
        let billedTotal = 0, benchTotal = 0, investmentTotal = 0, count = 0;

        emp.forEach(employee => {
            let data = employee.UTILIZATION_DATA.find(data => data.MONTH_YEAR === month);
            if (data) {
                billedTotal += data.Billed;
                benchTotal += data.Bench;
                investmentTotal += data.Investment;
                count++;
            }
        });

        // Calculate averages
        let billedAvg = (count === 0) ? 0 : Math.round(billedTotal / count);
        let benchAvg = (count === 0) ? 0 : Math.round(benchTotal / count);
        let investmentAvg = (count === 0) ? 0 : Math.round(investmentTotal / count);

        billedDataHtml += `<td><div class="team_data total-utilization-data">${billedAvg} %</div></td>`;
        benchDataHtml += `<td><div class="team_data total-utilization-data">${benchAvg} %</div></td>`;
        investmentDataHtml += `<td><div class="team_data total-utilization-data">${investmentAvg} %</div></td>`;
    });

    // Store the summary rows HTML
    let billedUtilizationHtml = `<tr class="summary-row">
        <td colspan="4"><div class="team_data total-utilization">Total Billed Utilization</div></td>
        ${billedDataHtml}
    </tr>`;
    let investmentUtilizationHtml = `<tr class="summary-row">
        <td colspan="4"><div class="team_data total-utilization">Total Investment Utilization</div></td>
        ${investmentDataHtml}
    </tr>`;
    let benchUtilizationHtml = `<tr class="summary-row">
        <td colspan="4"><div class="team_data total-utilization">Total Bench Utilization</div></td>
        ${benchDataHtml}
    </tr>`;

    // Initialize DataTable with drawCallback
    var table = empTable.DataTable({
        "pageLength": 50,
        "paging": false,
        "orderCellsTop": true,
        "columnDefs": [
            { "orderable": false, "targets": [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] } // Columns are 0-indexed, so column 5 is index 4, and so on.
        ],
        "drawCallback": function(settings) {
            var api = this.api();
            var rows = api.rows({ page: 'current' }).nodes();

            // Remove the last three rows before adding them again
            api.rows('.summary-row').remove();

            // Add summary rows after the last employee row
            $(rows).last().after(benchUtilizationHtml);
            $(rows).last().after(investmentUtilizationHtml);
            $(rows).last().after(billedUtilizationHtml);
        },
        "footerCallback": function (row, data, start, end, display) {
            var api = this.api();
            var info = api.page.info();
            var empCount = api.rows({ page: 'current' }).data().length - 3; // Exclude summary rows from count
            $(".dataTables_info").empty();
            $(".dataTables_info").append(`Showing 1 to ${empCount} of ${empCount} entries`);
        }
    });

    // Update the DataTables info with the correct number of entries initially
    $(".dataTables_info").empty();
    $(".dataTables_info").append(`Showing 1 to ${empCount} of ${empCount} entries`);
}





// Custom sorting function
function experienceToMonths(experience) {
    let years = 0;
    let months = 0;
    experience = experience.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML tags
    if (experience.includes('Y')) {
        years = parseInt(experience.split('Y')[0]);
        experience = experience.split('Y')[1];
    }
    if (experience.includes('M')) {
        months = parseInt(experience.split('M')[0]);
    }
    return years * 12 + months;
}

const generateTooltipContent = (utiliz) => {
    const contentParts = [];
    if (utiliz.Billed > 0) contentParts.push(`Billed: ${utiliz.Billed} % `);
    if (utiliz.Investment > 0)
      contentParts.push(`Investment: ${utiliz.Investment} %`);
    if (utiliz.Bench > 0) contentParts.push(`Bench: ${utiliz.Bench} %`);
    return contentParts.join("\n");
  };

function getIndUsEmpData() {
    var selectedVal = "";
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    let level_options = `<option value="-1">All</option><option value="R1">R1</option><option value="R2">R2</option><option value="R3">R3</option>`;
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    if (selectedVal == "IND") {
        filterJsonData = [];
        getEmpDataTable(empIndData,'Location');
        $('#nameSelect').empty();
        $("#nameSelect").append(empNameOptions);
        $('#jobSelect').empty();
        $("#jobSelect").append(jobNameOptions);
        $("#locatSelect").empty();
        $("#locatSelect").append(locationindOptions);
        $("#funSelect").empty();
        $("#funSelect").append(functionOptions);
        callMultiselectOption();
    } else if (selectedVal == "US") {
        filterJsonData = [];
        getEmpDataTable(empUsData,'Location');
        $('#nameSelect').empty();
        $("#nameSelect").append(empNameUsOptions);
        $('#jobSelect').empty();
        $("#jobSelect").append(jobNameUsOptions);
        $("#locatSelect").empty();
        $("#locatSelect").append(locationusOptions);
        $("#funSelect").empty();
        $("#funSelect").append(functionOptions);
        callMultiselectOption();
    } else if (selectedVal == "ALL") {
        filterJsonData = [];
        getEmpDataTable(empAllData,'Location');
        $('#nameSelect').empty();
        $("#nameSelect").append(empNameOptions);
        $("#nameSelect").append(empNameUsOptions);
//jobNameAllOptions
        const jobOptions = parseOptions(jobNameOptions);
        const jobUsOptions = parseOptions(jobNameUsOptions);

        const allJobOptions = jobOptions.concat(jobUsOptions);
        const uniqueJobOptions = Array.from(new Set(allJobOptions.map(option => option.value)))
            .map(value => allJobOptions.find(option => option.value === value));

        $('#jobSelect').empty();
        // $('#jobSelect').append(uniqueJobOptions.map(option =>
        //     $('<option>', { value: option.value, text: option.text })
        // ));
        $('#jobSelect').append(jobNameAllOptions)
        $('#repMangSelect').empty();
        $("#locatSelect").empty();
        $("#locatSelect").append(locationAllOptions);
        console.log("locationAllOptions all - ", locationAllOptions);
        $("#funSelect").empty();
        $("#funSelect").append(functionOptions);
        $("#custSelect").empty();
        callMultiselectOption();
    }
}


// Combine and deduplicate job options
function parseOptions(optionString) {
    const div = document.createElement('div');
    div.innerHTML = optionString;
    return Array.from(div.querySelectorAll('option')).map(option => ({
        value: option.value,
        text: option.innerText,
        html: option.outerHTML
    }));
}

function getUniqueSortedArray(data, key) {
    return [...new Set(data.map(item => item[key]))].sort((a, b) => {
      if (a.toLowerCase() < b.toLowerCase()) return -1;
      if (a.toLowerCase() > b.toLowerCase()) return 1;
      return 0;
    });
  }

function getEmpSkillOptions(teamdata) {
    console.log("teamdata - ", teamdata);
    let indData = teamdata.filter(data => data.LOCATION == "INDIA" || data.LOCATION == 'India');
    let usData = teamdata.filter(data => data.LOCATION != "INDIA" && data.LOCATION != 'India');
    jobNameArray_IND = getUniqueSortedArray(indData, 'JOB_ROLE');
    jobNameArray_US = getUniqueSortedArray(usData, 'JOB_ROLE');
    functionArray = getUniqueSortedArray(teamdata, 'DEPARTMENT');
    empNameArray_IND = getUniqueSortedArray(indData, 'EMPLOYEE_NAME');
    empNameArray_US = getUniqueSortedArray(usData, 'EMPLOYEE_NAME');
    locationArray = getUniqueSortedArray(teamdata, 'LOCATION');
    let indiaLocArray = indData.map(data => data.LOCATION);
    indiaLocArray = [...new Set(indiaLocArray)];
    let usLocArray = usData.map(data => data.LOCATION);
    usLocArray = [...new Set(usLocArray)]; 
    // locationindOptions = "", locationusOptions = "", locationAllOptions = ""

    for (let i = 0; i < empNameArray_IND.length; i++) {
        empNameOptions += `<option class="emp_option" value="${empNameArray_IND[i]}">${empNameArray_IND[i]}</option>`;
    }
    for (let i = 0; i < empNameArray_US.length; i++) {
        empNameUsOptions += `<option class="emp_option" value="${empNameArray_US[i]}">${empNameArray_US[i]}</option>`;
    }
    for (let i = 0; i < jobNameArray_IND.length; i++) {
        jobNameOptions += `<option class="emp_option" value="${jobNameArray_IND[i]}">${jobNameArray_IND[i]}</option>`;
        // console.log("jobNameOptions",jobNameOptions);
    }
    for (let i = 0; i < jobNameArray_US.length; i++) {
        jobNameUsOptions += `<option class="emp_option" value="${jobNameArray_US[i]}">${jobNameArray_US[i]}</option>`;
        // console.log("jobNameUsOptions",jobNameUsOptions);
    }
    let jobArr = [...jobNameArray_IND, ...jobNameArray_US];
    let JobAll = [...new Set(jobArr)]
    for (let i = 0; i < JobAll.length; i++) {
        jobNameAllOptions += `<option class="emp_option" value="${JobAll[i]}">${JobAll[i]}</option>`;
    }
    for (let i = 0; i < functionArray.length; i++) {
        functionOptions += `<option class="emp_option" value="${functionArray[i]}">${functionArray[i]}</option>`;
    }

    for (let i = 0; i < locationArray.length; i++) {
        locationAllOptions += `<option class="emp_option" value="${locationArray[i]}">${locationArray[i]}</option>`;
    }
    console.log("indiaLocArray",indiaLocArray);
    for (let i = 0; i < indiaLocArray.length; i++) {
        locationindOptions += `<option class="emp_option" value="${indiaLocArray[i]}">${indiaLocArray[i]}</option>`;
    }

    for (let i = 0; i < usLocArray.length; i++) {
        locationusOptions += `<option class="emp_option" value="${usLocArray[i]}">${usLocArray[i]}</option>`;
    }
    $("#nameSelect").append(empNameOptions);
    $("#nameSelect").append(empNameUsOptions);
    var jobNameOptionsArray = $(jobNameOptions).toArray();
    var jobNameUsOptionsArray = $(jobNameUsOptions).toArray();
    var allJobOptions = jobNameOptionsArray.concat(jobNameUsOptionsArray);
    // console.log("allJobOptions",allJobOptions);

    var uniqueJobOptions = Array.from(new Set(allJobOptions.map(option => option.value)))
        .map(value => allJobOptions.find(option => option.value === value));
    // console.log("uniqueJobOptions",uniqueJobOptions);
    $('#jobSelect').empty();
    // $("#jobSelect").append(jobNameOptions);
    // $('#jobSelect').append(uniqueJobOptions.map(option =>
    //     $('<option>', { value: option.value, text: option.text })
    // ));
    $('#jobSelect').append(jobNameAllOptions)
    $("#repMangSelect").append(managerAllOptions);
    // $("#repMangSelect").append(managerUsOptions);
    $("#locatSelect").append(locationAllOptions);
    $("#funSelect").append(functionOptions);
    $("#custSelect").append(custNameOptions);
    $("#billSelect").append(billingOptions);
    callMultiselectOption();
}


let firstSelectFilter = "";
$(function () {
    $("#skillSelect").change(function (e) {
        filterData(e);
    });

    $("#nameSelect").change(function (e) {
        firstSelectFilter = "nameSelect"
        filterData(e);
    });

    $("#jobSelect").change(function (e) {
        firstSelectFilter = "jobSelect"
        filterData(e);
    });

    $("#repMangSelect").change(function (e) {
        firstSelectFilter = "repMangSelect"
        filterData(e);
    });

    $("#locatSelect").change(function (e) {
        firstSelectFilter = "locatSelect"
        filterData(e);
    });

    $("#funSelect").change(function (e) {
        firstSelectFilter = "funSelect"
        filterData(e);
    });

    $("#custSelect").change(function (e) {
        firstSelectFilter = "custSelect"
        filterData(e);
    });

    $("#billSelect").change(function (e) {
        firstSelectFilter = "billSelect"
        filterData(e);
    });

    $("#skillLevelSelect").change(function (e) {
        firstSelectFilter = "skillLevelSelect"
        filterData(e);
    });
    $("#status").change(function (e) {
        firstSelectFilter = "status"
        filterData(e);
    });

});

function filterData(e) {
    let filterLen = false
    const nameSelectArray = $("#nameSelect").val();
    const jobSelectArray = $("#jobSelect").val();
    const locSelectArray = $("#locatSelect").val();
    const funSelectArray = $("#funSelect").val();

    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    let filterJsonData = []
    if (selectedVal == "IND") {
        filterJsonData = Object.assign([], empIndData);
    } else if (selectedVal == "US") {
        filterJsonData = Object.assign([], empUsData);
    } else if (selectedVal == "ALL") {
        filterJsonData = Object.assign([], empAllData);
    }
    let newJson = filterJsonData;
    
    if (nameSelectArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = nameSelectArray.find(f => d.EMPLOYEE_NAME == f);
            return obj ? true : false;
        })
        filterLen = true
    }
    if (jobSelectArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = jobSelectArray.find(f => d.JOB_ROLE == f);
            return obj ? true : false;
        })
        filterLen = true
    }
    
    if (locSelectArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = locSelectArray.find(f => (d.LOCATION).toLowerCase() == f.toLowerCase());
            return obj ? true : false;
        })
        filterLen = true
    }
    if (funSelectArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = funSelectArray.find(f => d.DEPARTMENT == f);
            return obj ? true : false;
        })
        filterLen = true
    }
    filterStatus = filterLen
    getEmpDataTable(newJson, 'filter');
    filterApplyJson = newJson
    if (firstSelectFilter != "") {
        let lenOfSelFilter = $('#' + firstSelectFilter).val().length;
        let checkFilterData = true
        let nameSelectArray = $("#nameSelect").val();
        if (nameSelectArray.length > 0) {
            checkFilterData = false
        }
        let jobSelectArray = $("#jobSelect").val();
        if (jobSelectArray.length > 0) {
            checkFilterData = false
        }
        let locSelectArray = $("#locatSelect").val();
        if (locSelectArray.length > 0) {
            checkFilterData = false
        }
        let funSelectArray = $("#funSelect").val();
        if (funSelectArray.length > 0) {
            checkFilterData = false
        }
        if (lenOfSelFilter == 0 && checkFilterData) {
            firstSelectFilter = ""
            $('#nameSelect').empty();
            $('#jobSelect').empty();
            $("#locatSelect").empty();
            $("#funSelect").empty();
            $("#funSelect").append(functionOptions);
            if (selectedVal == "IND") {
                $("#nameSelect").append(empNameOptions);
                $('#locatSelect').append(locationindOptions);
                $("#jobSelect").append(jobNameOptions);
            } else if (selectedVal == "US") {
                $("#nameSelect").append(empNameUsOptions);
                $('#locatSelect').append(locationusOptions);
                $("#jobSelect").append(jobNameUsOptions);
            } else if (selectedVal == "ALL") {
                $("#nameSelect").append(empNameOptions);
                $("#nameSelect").append(empNameUsOptions);
                $('#jobSelect').append(jobNameAllOptions);
                $('#locatSelect').append(locationAllOptions);
                console.log("locationAllOptions - 1 ", locationAllOptions)
            }
            callMultiselectOption();
        } else {
            reassignFilterOption(firstSelectFilter, newJson)
        }
    }
}

let tempFilterJson = [];
let customFilterJson = [];

function skillFilter(FilteredNewJson, LevelFilterData) {
    var selectedVal = "";
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    if (FilteredNewJson.length > 0) {
        if (filterJsonData.length == 0) {
            if (selectedVal == "IND") {
                filterJsonData = empIndData;
            } else if (selectedVal == "US") {
                filterJsonData = empUsData;
            } else if (selectedVal == "ALL") {
                filterJsonData = empAllData;
            }
        }

        if (selectedVal == "IND") {
            let newFilJson = [];
            if (LevelFilterData.length > 0) {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1
                            && (LevelFilterData.length == 0 ? true : LevelFilterData.some(ff => d.SKILL_DATA.map(dd => dd.SKILL + ' - ' + dd.LEVEL).indexOf(f + ' - ' + ff) != -1));
                        return innerFlag;
                    });
                    return flag;
                })
            } else {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1;
                        return innerFlag;
                    });
                    return flag;
                })
            }
            getEmpDataTable(newFilJson);
        } else if (selectedVal == "US") {
            let newFilJson = [];
            if (LevelFilterData.length > 0) {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1
                            && (LevelFilterData.length == 0 ? true : LevelFilterData.some(ff => d.SKILL_DATA.map(dd => dd.SKILL + ' - ' + dd.LEVEL).indexOf(f + ' - ' + ff) != -1));
                        return innerFlag;
                    });
                    return flag;
                })
            } else {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1;
                        return innerFlag;
                    });
                    return flag;
                })
            }
            getEmpDataTable(newFilJson);
        } else if (selectedVal == "ALL") {
            let newFilJson = [];
            if (LevelFilterData.length > 0) {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1
                            && (LevelFilterData.length == 0 ? true : LevelFilterData.some(ff => d.SKILL_DATA.map(dd => dd.SKILL + ' - ' + dd.LEVEL).indexOf(f + ' - ' + ff) != -1));
                        return innerFlag;
                    });
                    return flag;
                })
            } else {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1;
                        return innerFlag;
                    });
                    return flag;
                })
            }
            getEmpDataTable(newFilJson);
        }
    } else {

        if (selectedVal == "IND") {
            getEmpDataTable(empIndData)
        } else if (selectedVal == "US") {
            getEmpDataTable(empUsData)
        } else if (selectedVal == "ALL") {
            getEmpDataTable(empAllData)
        }
    }
}

function uniqueArray(arrayData) {
    let uniqueListArray = arrayData.filter((c, index) => {
        return arrayData.indexOf(c) === index;
    });
    return uniqueListArray;
}

function callMultiselectOption() {
    $('#nameSelect').multiselect('reload');
    $('#nameSelect').multiselect({
        columns: 1,
        placeholder: 'Name',
        search: true,
        onOptionClick: function(element, option) {
            updatePlaceholderText('ms-list-1', 'Name', 'nameSelect');
        },
        onChange: function(element, checked) {
            updatePlaceholderText('ms-list-1', 'Name', 'nameSelect');
        }
    });
    $('#jobSelect').multiselect('reload');
    $('#jobSelect').multiselect({
        columns: 1,
        placeholder: 'Job',
        search: true,
        onOptionClick: function(element, option) {
            updatePlaceholderText('ms-list-2','Job', 'jobSelect');
        },
        onChange: function(element, checked) {
            updatePlaceholderText('ms-list-2','Job', 'jobSelect');
        }
    });
    $('#locatSelect').multiselect('reload');
    $('#locatSelect').multiselect({
        columns: 1,
        placeholder: 'Loction',
        search: true,
        onOptionClick: function(element, option) {
            updatePlaceholderText('ms-list-3', 'Location', 'locatSelect');
        },
        onChange: function(element, checked) {
            updatePlaceholderText('ms-list-3', 'Location', 'locatSelect');
        }
    });
    $('#funSelect').multiselect('reload');
    $('#funSelect').multiselect({
        columns: 1,
        placeholder: 'Function',
        search: true,
        onOptionClick: function(element, option) {
            updatePlaceholderText('ms-list-4', 'Function', 'funSelect');
        },
        onChange: function(element, checked) {
            updatePlaceholderText('ms-list-4', 'Function', 'funSelect');
        }
    });
}


function tootTipRole(temp) {
    let emp_name = "";
    $.each(temp, function () {
        let role = "";
        let total = "";
        $.each(this, function (name, value) {

            if (name == "ROLE") {
                role = value;
                role = role.replace(/[_\s]/g, ' ');
            }
            if (name = "TOTAL") {
                total = value;
            }
        });
        if (total > 0) {
            emp_name = emp_name + `<li>${role} - ( ${total} )</li>`;
        }
    });
    return `<span class='spnTooltip'>
                    <ul>${emp_name}<ul>
              </span>`
}

function getEmpProfileData(obj) {
    var employee_id = $(obj).closest('tr').children('td:eq(0)').text();
    localStorage.setItem("employee_id_data", employee_id);
    let employee_email = $(obj).closest('tr').children('td:eq(15)').text();
    localStorage.setItem("employee_email_data", employee_email);
    window.location.href = 'team-profile.html';
}

function removeDuplicates(namesUnique) {
    if (namesUnique.endsWith(",")) {
        namesUnique = namesUnique.slice(0, -1);
    }
    let uniueList = namesUnique.split(",")
    uniueList = [...new Set(uniueList)]
    removeItemAll(uniueList, "-")
    let opt = ""
    $.each(uniueList, function (i, list) {
        if (list == "Active") {
            opt += `<option value="NO">${list}</option>`
        } else if (list == "In Notice Period") {
            opt += `<option value="YES">${list}</option>`
        } else {
            opt += `<option value="${list}">${list}</option>`
        }
    })
    return opt;
}
function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}

function reassignFilterOption(selectedFilterCol, filterJson) {
    console.log('filterJson - ',filterJson)
    let nameSelectArray = $("#nameSelect").val();
    let jobSelectArray = $("#jobSelect").val();
    let managerSelectArray = $("#repMangSelect").val();
    let locSelectArray = $("#locatSelect").val();
    let funSelectArray = $("#funSelect").val();
    let custSelectArray = $("#custSelect").val();
    let billSelectArray = $("#billSelect").val();
    let statusArray = $("#status").val();
    let filTeamName = "", filJobTitle = "", filManagerName = "", filLocName = "", filFunName = "", filAccName = "";
    let filBillStatus = "", filTeamStatus = "";
    filTeamName = filterJson.map(m => m.EMPLOYEE_NAME);
    filTeamName = [...new Set(filTeamName)];
    filTeamName = filTeamName.map(m => `<option value="${m}">${m}</option>`)
    filJobTitle = filterJson.map(m => m.JOB_ROLE);
    filJobTitle = [...new Set(filJobTitle)];
    filJobTitle = filJobTitle.map(m => `<option value="${m}">${m}</option>`)
    filLocName = filterJson.map(m => m.LOCATION);
    filLocName = [...new Set(filLocName)];
    filLocName = filLocName.map(m => `<option value="${m}">${m}</option>`)
    filFunName = filterJson.map(m => m.DEPARTMENT);
    filFunName = [...new Set(filFunName)];
    filFunName = filFunName.map(m => `<option value="${m}">${m}</option>`)
    let filTeamOpt = "nameSelect", filJobOpt = "jobSelect", filManagerOpt = "repMangSelect", filLocOpt = "locatSelect";
    let filFunOpt = "funSelect", filAccOpt = "custSelect", filBillOpt = "billSelect", filTeamStatusOpt = "status";

    switch (firstSelectFilter) {
        case "nameSelect":
            if (jobSelectArray == 0) {
                $('#jobSelect').empty();
                $("#jobSelect").append(filJobTitle);
                $('#jobSelect').multiselect('reload');
            }
            if (managerSelectArray == 0) {
                $('#repMangSelect').empty();
                $("#repMangSelect").append(filManagerName);
                $('#repMangSelect').multiselect('reload');
            }
            if (locSelectArray == 0) {
                $("#locatSelect").empty();
                $("#locatSelect").append(filLocName);
                $('#locatSelect').multiselect('reload');

            }
            if (funSelectArray == 0) {
                $("#funSelect").empty();
                $("#funSelect").append(filFunName);
                $('#funSelect').multiselect('reload');
            }
            if (custSelectArray == 0) {
                $("#custSelect").empty();
                $("#custSelect").append(filAccName);
                $('#custSelect').multiselect('reload');
            }
            if (billSelectArray == 0) {
                $("#billSelect").empty();
                $("#billSelect").append(filBillStatus);
                $('#billSelect').multiselect('reload');
            }
            if (statusArray == 0) {
                $("#status").empty();
                $("#status").append(filTeamStatus);
                $('#status').multiselect('reload');
            }
            break;
        case "jobSelect":
            if (nameSelectArray == 0) {
                $('#nameSelect').empty();
                $("#nameSelect").append(filTeamName);
                $('#nameSelect').multiselect('reload');
            }
            if (managerSelectArray == 0) {
                $('#repMangSelect').empty();
                $("#repMangSelect").append(filManagerName);
                $('#repMangSelect').multiselect('reload');
            }
            if (locSelectArray == 0) {
                $("#locatSelect").empty();
                $("#locatSelect").append(filLocName);
                $('#locatSelect').multiselect('reload');

            }
            if (funSelectArray == 0) {
                $("#funSelect").empty();
                $("#funSelect").append(filFunName);
                $('#funSelect').multiselect('reload');
            }
            if (custSelectArray == 0) {
                $("#custSelect").empty();
                $("#custSelect").append(filAccName);
                $('#custSelect').multiselect('reload');
            }
            if (billSelectArray == 0) {
                $("#billSelect").empty();
                $("#billSelect").append(filBillStatus);
                $('#billSelect').multiselect('reload');
            }
            if (statusArray == 0) {
                $("#status").empty();
                $("#status").append(filTeamStatus);
                $('#status').multiselect('reload');
            }
            break;
        case "repMangSelect":
            if (nameSelectArray == 0) {
                $('#nameSelect').empty();
                $("#nameSelect").append(filTeamName);
                $('#nameSelect').multiselect('reload');
            }
            if (jobSelectArray == 0) {
                $('#jobSelect').empty();
                $("#jobSelect").append(filJobTitle);
                $('#jobSelect').multiselect('reload');
            }
            if (locSelectArray == 0) {
                $("#locatSelect").empty();
                $("#locatSelect").append(filLocName);
                $('#locatSelect').multiselect('reload');

            }
            if (funSelectArray == 0) {
                $("#funSelect").empty();
                $("#funSelect").append(filFunName);
                $('#funSelect').multiselect('reload');
            }
            if (custSelectArray == 0) {
                $("#custSelect").empty();
                $("#custSelect").append(filAccName);
                $('#custSelect').multiselect('reload');
            }
            if (billSelectArray == 0) {
                $("#billSelect").empty();
                $("#billSelect").append(filBillStatus);
                $('#billSelect').multiselect('reload');
            }
            if (statusArray == 0) {
                $("#status").empty();
                $("#status").append(filTeamStatus);
                $('#status').multiselect('reload');
            }
            break;
        case "locatSelect":
            if (nameSelectArray == 0) {
                $('#nameSelect').empty();
                $("#nameSelect").append(filTeamName);
                $('#nameSelect').multiselect('reload');
            }
            if (jobSelectArray == 0) {
                $('#jobSelect').empty();
                $("#jobSelect").append(filJobTitle);
                $('#jobSelect').multiselect('reload');
            }
            if (managerSelectArray == 0) {
                $('#repMangSelect').empty();
                $("#repMangSelect").append(filManagerName);
                $('#repMangSelect').multiselect('reload');
            }
            if (funSelectArray == 0) {
                $("#funSelect").empty();
                $("#funSelect").append(filFunName);
                $('#funSelect').multiselect('reload');
            }
            if (custSelectArray == 0) {
                $("#custSelect").empty();
                $("#custSelect").append(filAccName);
                $('#custSelect').multiselect('reload');
            }
            if (billSelectArray == 0) {
                $("#billSelect").empty();
                $("#billSelect").append(filBillStatus);
                $('#billSelect').multiselect('reload');
            }
            if (statusArray == 0) {
                $("#status").empty();
                $("#status").append(filTeamStatus);
                $('#status').multiselect('reload');
            }
            break;
        case "funSelect":
            if (nameSelectArray == 0) {
                $('#nameSelect').empty();
                $("#nameSelect").append(filTeamName);
                $('#nameSelect').multiselect('reload');
            }
            if (jobSelectArray == 0) {
                $('#jobSelect').empty();
                $("#jobSelect").append(filJobTitle);
                $('#jobSelect').multiselect('reload');
            }
            if (managerSelectArray == 0) {
                $('#repMangSelect').empty();
                $("#repMangSelect").append(filManagerName);
                $('#repMangSelect').multiselect('reload');
            }
            if (locSelectArray == 0) {
                $("#locatSelect").empty();
                $("#locatSelect").append(filLocName);
                $('#locatSelect').multiselect('reload');

            }
            if (custSelectArray == 0) {
                $("#custSelect").empty();
                $("#custSelect").append(filAccName);
                $('#custSelect').multiselect('reload');
            }
            if (billSelectArray == 0) {
                $("#billSelect").empty();
                $("#billSelect").append(filBillStatus);
                $('#billSelect').multiselect('reload');
            }
            if (statusArray == 0) {
                $("#status").empty();
                $("#status").append(filTeamStatus);
                $('#status').multiselect('reload');
            }
            break;
        case "custSelect":
            if (nameSelectArray == 0) {
                $('#nameSelect').empty();
                $("#nameSelect").append(filTeamName);
                $('#nameSelect').multiselect('reload');
            }
            if (jobSelectArray == 0) {
                $('#jobSelect').empty();
                $("#jobSelect").append(filJobTitle);
                $('#jobSelect').multiselect('reload');
            }
            if (managerSelectArray == 0) {
                $('#repMangSelect').empty();
                $("#repMangSelect").append(filManagerName);
                $('#repMangSelect').multiselect('reload');
            }
            if (locSelectArray == 0) {
                $("#locatSelect").empty();
                $("#locatSelect").append(filLocName);
                $('#locatSelect').multiselect('reload');

            }
            if (funSelectArray == 0) {
                $("#funSelect").empty();
                $("#funSelect").append(filFunName);
                $('#funSelect').multiselect('reload');
            }
            if (billSelectArray == 0) {
                $("#billSelect").empty();
                $("#billSelect").append(filBillStatus);
                $('#billSelect').multiselect('reload');
            }
            if (statusArray == 0) {
                $("#status").empty();
                $("#status").append(filTeamStatus);
                $('#status').multiselect('reload');
            }
            break;
        case "billSelect":
            if (nameSelectArray == 0) {
                $('#nameSelect').empty();
                $("#nameSelect").append(filTeamName);
                $('#nameSelect').multiselect('reload');
            }
            if (jobSelectArray == 0) {
                $('#jobSelect').empty();
                $("#jobSelect").append(filJobTitle);
                $('#jobSelect').multiselect('reload');
            }
            if (managerSelectArray == 0) {
                $('#repMangSelect').empty();
                $("#repMangSelect").append(filManagerName);
                $('#repMangSelect').multiselect('reload');
            }
            if (locSelectArray == 0) {
                $("#locatSelect").empty();
                $("#locatSelect").append(filLocName);
                $('#locatSelect').multiselect('reload');

            }
            if (funSelectArray == 0) {
                $("#funSelect").empty();
                $("#funSelect").append(filFunName);
                $('#funSelect').multiselect('reload');
            }
            if (custSelectArray == 0) {
                $("#custSelect").empty();
                $("#custSelect").append(filAccName);
                $('#custSelect').multiselect('reload');
            }
            if (statusArray == 0) {
                $("#status").empty();
                $("#status").append(filTeamStatus);
                $('#status').multiselect('reload');
            }
            break;
        case "status":
            if (nameSelectArray == 0) {
                $('#nameSelect').empty();
                $("#nameSelect").append(filTeamName);
                $('#nameSelect').multiselect('reload');
            }
            if (jobSelectArray == 0) {
                $('#jobSelect').empty();
                $("#jobSelect").append(filJobTitle);
                $('#jobSelect').multiselect('reload');
            }
            if (managerSelectArray == 0) {
                $('#repMangSelect').empty();
                $("#repMangSelect").append(filManagerName);
                $('#repMangSelect').multiselect('reload');
            }
            if (locSelectArray == 0) {
                $("#locatSelect").empty();
                $("#locatSelect").append(filLocName);
                $('#locatSelect').multiselect('reload');

            }
            if (funSelectArray == 0) {
                $("#funSelect").empty();
                $("#funSelect").append(filFunName);
                $('#funSelect').multiselect('reload');
            }
            if (custSelectArray == 0) {
                $("#custSelect").empty();
                $("#custSelect").append(filAccName);
                $('#custSelect').multiselect('reload');
            }
            if (billSelectArray == 0) {
                $("#billSelect").empty();
                $("#billSelect").append(filBillStatus);
                $('#billSelect').multiselect('reload');
            }
            break;
        default:
            if (nameSelectArray == 0) {
                $('#nameSelect').empty();
                $("#nameSelect").append(filTeamName);
                $('#nameSelect').multiselect('reload');
            }
            if (jobSelectArray == 0) {
                $('#jobSelect').empty();
                $("#jobSelect").append(filJobTitle);
                $('#jobSelect').multiselect('reload');
            }
            if (managerSelectArray == 0) {
                $('#repMangSelect').empty();
                $("#repMangSelect").append(filManagerName);
                $('#repMangSelect').multiselect('reload');
            }
            if (locSelectArray == 0) {
                $("#locatSelect").empty();
                $("#locatSelect").append(filLocName);
                $('#locatSelect').multiselect('reload');

            }
            if (funSelectArray == 0) {
                $("#funSelect").empty();
                $("#funSelect").append(filFunName);
                $('#funSelect').multiselect('reload');
            }
            if (custSelectArray == 0) {
                $("#custSelect").empty();
                $("#custSelect").append(filAccName);
                $('#custSelect').multiselect('reload');
            }
            if (billSelectArray == 0) {
                $("#billSelect").empty();
                $("#billSelect").append(filBillStatus);
                $('#billSelect').multiselect('reload');
            }
            if (statusArray == 0) {
                $("#status").empty();
                $("#status").append(filTeamStatus);
                $('#status').multiselect('reload');
            }
            break;
    }
}

// function getStatusAfOf(){

//     let checkDate = $("#team_date_filter_old").val()
//     let selDate = $("#team_date_filter").val()
//     checkDate = convert(checkDate)
//     if(checkDate != selDate){
//         getEmpData(selDate)
//         $("#team_date_filter_old").val(selDate)
//     }
// }
function getStatusAfOf() {
    let selDate = $('#team_date_filter').val()
    console.log("selDate - ", selDate)
    if (selDate == '') {
        let dateInput = document.getElementById('team_date_filter');
        selDate = dateInput.min;
    }
    date = new Date(selDate);
    Currdate1 = convertDate(date)
    $("#team_date_filter").val(Currdate1)
    getEmpData(Currdate1)
    filterData()
}
function clearDateFilter() {
    date = new Date();
    Currdate1 = convertDate(date);
    $("#team_date_filter").val(Currdate1)
    getEmpData(Currdate1)
}
function convertDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();

    var mmChars = mm.split('');
    var ddChars = dd.split('');

    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
}
function convert(str) {
    if (str == null) {
        return "";
    } else if (str == "0000-00-00") {
        return "";
    }
    else {
        str = str.replace(" 00:00:00", "")
        let tempStr = str + "T00:00:00"
        var date = new Date(tempStr),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
    }
}

function callReloadFilterOption() {
    $('#nameSelect').multiselect('reload');
    $('#nameSelect').multiselect({
        columns: 1,
        placeholder: 'Name',
        search: true,
        onOptionClick: function(element, option) {
            updatePlaceholderText('ms-list-1', 'Name', 'nameSelect');
        },
        onChange: function(element, checked) {
            updatePlaceholderText('ms-list-1', 'Name', 'nameSelect');
        }
    });
    $('#jobSelect').multiselect('reload');
    $('#jobSelect').multiselect({
        columns: 1,
        placeholder: 'Job',
        search: true,
        onOptionClick: function(element, option) {
            updatePlaceholderText('ms-list-2','Job', 'jobSelect');
        },
        onChange: function(element, checked) {
            updatePlaceholderText('ms-list-2','Job', 'jobSelect');
        }
    });
    $('#locatSelect').multiselect('reload');
    $('#locatSelect').multiselect({
        columns: 1,
        placeholder: 'Location',
        search: true,
        onOptionClick: function(element, option) {
            updatePlaceholderText('ms-list-3', 'Location', 'locatSelect');
        },
        onChange: function(element, checked) {
            updatePlaceholderText('ms-list-3', 'Location', 'locatSelect');
        }
    });
    $('#funSelect').multiselect('reload');
    $('#funSelect').multiselect({
        columns: 1,
        placeholder: 'Function',
        search: true,
        onOptionClick: function(element, option) {
            updatePlaceholderText('ms-list-4', 'Function', 'funSelect');
        },
        onChange: function(element, checked) {
            updatePlaceholderText('ms-list-4', 'Function', 'funSelect');
        }
    });
    $('#custSelect').multiselect('reload');
    $('#custSelect').multiselect({
        columns: 1,
        placeholder: 'Customer',
        search: true
    });
    $('#billSelect').multiselect('reload');
    $('#billSelect').multiselect({
        columns: 1,
        placeholder: 'Billing',
        search: true
    });
    $('#billSelect').multiselect('reload');
    $('#billSelect').multiselect({
        columns: 1,
        placeholder: 'Date',
        search: true
    });
    $('#status').multiselect('reload');
    $('#status').multiselect({
        columns: 1,
        placeholder: 'Status',
        search: true
    });
}

function OpenTeams() {
    window.location.href = 'team.html';
}
