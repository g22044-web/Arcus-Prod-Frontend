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
            let accessLevel = checkEachPageAccess("Reports")
            if (accessLevel.length > 0) {
                let environment = accessLevel[0]
                if (environment == apiValue.environment) {
                    $(".loader").css("display", "block");
                    $(".show_page").css("display", "none");
                    $('.alert_notice').hide();
                    $('.alert_not_delivery').hide();
                    jQuery('#idSelect').multiselect({
                        columns: 1,
                        placeholder: 'ID',
                        search: true
                    });
                    jQuery('#nameSelect').multiselect({
                        columns: 1,
                        placeholder: 'Name',
                        search: true
                    });
                    jQuery('#desgnSelect').multiselect({
                        columns: 1,
                        placeholder: 'Designation',
                        search: true
                    });
                    jQuery('#statusSelect').multiselect({
                        columns: 1,
                        placeholder: 'Status',
                        search: true
                    });
                    jQuery('#sowIdSelect').multiselect({
                        columns: 1,
                        placeholder: 'SOW ID',
                        search: true
                    });
                    jQuery('#sowCodeSelect').multiselect({
                        columns: 1,
                        placeholder: 'SOW Code',
                        search: true
                    });
                    jQuery('#clientSelect').multiselect({
                        columns: 1,
                        placeholder: 'Account',
                        search: true,
                        allowClear: true
                    });
                    jQuery('#sowNameSelect').multiselect({
                        columns: 1,
                        placeholder: 'SOW Name',
                        search: true
                    });
                    jQuery('#billSelect').multiselect({
                        columns: 1,
                        placeholder: 'Billing',
                        search: true
                    });
                    jQuery('#locationSelect').multiselect({
                        columns: 1,
                        placeholder: 'Location',
                        search: true
                    });
                    assignDataToAccount();
                } else {
                    window.location.href = "home.html"
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
    function employeeDetails() {
        window.location.href = 'employee_profile.html';
        return false;
    }
    $('#project_alloc_start_date').datepicker({
        format: 'mm-dd-yy',
        uiLibrary: 'bootstrap'
    });
    $('#project_alloc_end_date').datepicker({
        format: 'mm-dd-yy',
        uiLibrary: 'bootstrap'
    });
    $('#reportsBackBtn').click(function () {
    
        window.location.href = 'reportsDashboard.html';
        return false;
    });
});

var empAllData = [];
var empAlloc = [];
let empIndData = [];
var empUsData = [];
var skill_data_option = "";
var FilteredNewJson = [];
let empAllocData = [];
let current_data = [];
let filterDataJson = [];
let dateFilterDataJson = [];
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();

function normalizeResourceMappingPayload(data) {
    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch (error) {
            console.log("resource mapping payload parse error", error);
            return {};
        }
    }

    if (Array.isArray(data)) {
        return data[0] || {};
    }

    if (data && typeof data === "object") {
        return data;
    }

    return {};
}

function getEmpData() {
    var empData = [];
    let status = "";
    let endDate = "";
    const startTime = performance.now();
    $.ajax({
        url:  apiValue.url_ip + ":5003/resource_mapping",
        method: "POST",
        dataType: "json",
        headers: {
            "Content-Type": "application/json", 
        },
        data: JSON.stringify({
            query_type: "resource_mapping",
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        }),
        success: function (data) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportsResourceMapping","Reports","resource_mapping","success",fileName,"reportsResourceMapping","view");
            const resourceMappingPayload = normalizeResourceMappingPayload(data);
            empAllData = [resourceMappingPayload];
            // console.log("empAllData",empAllData);
            empAllocData = Array.isArray(resourceMappingPayload.RESOURCE_MAPPING_DATA) ? resourceMappingPayload.RESOURCE_MAPPING_DATA : [];
          
            var name = ["CURRENT"];
            current_data = empAllocData;
            filterDataJson = current_data;
            getEmpDataTable(current_data);
            appendOptionData();
            callMultiselectOption();
            $(".loader").css("display", "none");
            $(".show_page").css("display", "block");
        },
        error: function (error) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportsResourceMapping","Reports","resource_mapping","error",fileName,"reportsResourceMapping","view");
            console.log('message Error' + JSON.stringify(error));
            $(".loader").css("display", "none");
            $(".show_page").css("display", "block");
        }
    });
}


function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
}
// console.log(convert("Mon, 11 Nov 2013 00:00:00 GMT"))


function assignDataToAccount() {
    var selectedVal = "";
    var selected = $("input[type='radio'][name='res_acc']:checked");
    updateRememberedFilterSelections();
    const selectedFilters = cloneFilterSelections(rememberedFilterSelections);
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    if (current_data == 0) {
        getEmpData();
    } else {
        if (selectedVal == "IND") {
            let current_data_temp = current_data.filter((loc) => loc.COUNTRY === "India")
            filterDataJson = current_data_temp;
            getEmpDataTable(current_data_temp)
        } else if (selectedVal == "US") {
            let current_data_temp = current_data.filter((loc) => loc.COUNTRY != "India")
            filterDataJson = current_data_temp;
            getEmpDataTable(current_data_temp)
        } else if (selectedVal == "ALL") {
            filterDataJson = current_data;
            getEmpDataTable(current_data)
        }

        appendOptionData(filterDataJson);
        callMultiselectOption();
        restoreFilterSelections(selectedFilters);

        if (hasActiveFilterSelection(selectedFilters)) {
            filterData();
        }
    }
}

let empNameOptions = "";
let empIdOptions = "";
let desgnOptions = "";
let statusOptions = "";
let sowIDOptions = "";
let sowCodeOptions = "";
let clientOptions = "";
let sowNameOptions = "";
let billingOptions = "";
let filterJsonData = [];
let empNameArray = [], empIdArray = [], desgnArray = [], statusArray = [], sowIDArray = [];
let sowCodeArray = [], clientArray = [], sowNameArray = [], billingArray = [];
let checkValue = 0;
let rememberedFilterSelections = {
    idSelect: [],
    nameSelect: [],
    desgnSelect: [],
    sowIdSelect: [],
    clientSelect: [],
    sowNameSelect: [],
    billSelect: []
};

function getCurrentFilterSelections() {
    return {
        idSelect: $("#idSelect").val() || [],
        nameSelect: $("#nameSelect").val() || [],
        desgnSelect: $("#desgnSelect").val() || [],
        sowIdSelect: $("#sowIdSelect").val() || [],
        clientSelect: $("#clientSelect").val() || [],
        sowNameSelect: $("#sowNameSelect").val() || [],
        billSelect: $("#billSelect").val() || []
    };
}

function cloneFilterSelections(filterSelections) {
    return Object.fromEntries(
        Object.entries(filterSelections).map(([key, value]) => [key, [...value]])
    );
}

function updateRememberedFilterSelections(filterSelections = getCurrentFilterSelections()) {
    rememberedFilterSelections = cloneFilterSelections(filterSelections);
}

function hasActiveFilterSelection(filterSelections) {
    return Object.values(filterSelections).some((value) => value.length > 0);
}

function getAvailableSelectValues(selectId) {
    return $('#' + selectId + ' option').map(function () {
        return $(this).val();
    }).get();
}

function ensureSelectedOptionsExist(filterSelections) {
    Object.entries(filterSelections).forEach(([selectId, selectedValues]) => {
        const availableValues = getAvailableSelectValues(selectId);
        selectedValues.forEach((value) => {
            if (!availableValues.includes(value)) {
                $('#' + selectId).append(`<option class="persisted-filter-option" value="${value}">${value}</option>`);
            }
        });
    });
}

function restoreFilterSelections(filterSelections) {
    ensureSelectedOptionsExist(filterSelections);
    Object.entries(filterSelections).forEach(([selectId, selectedValues]) => {
        $('#' + selectId).val(selectedValues);
        $('#' + selectId).multiselect('reload');
    });
}

function getFilterOptionValues(sourceData) {
    if (!Array.isArray(sourceData) || sourceData.length === 0) {
        return null;
    }

    return {
        EMPLOYEE_NAME: uniqueArray(sourceData.map((data) => data.EMPLOYEE_NAME).filter(Boolean)).sort(),
        EMPLOYEE_ID: uniqueArray(sourceData.map((data) => data.EMPLOYEE_ID).filter(Boolean)),
        DESIGNATION: uniqueArray(sourceData.map((data) => data.DESIGNATION).filter(Boolean)),
        SOW_ID: uniqueArray(sourceData.map((data) => data.SOW_ID).filter(Boolean)),
        ACCOUNT_NAME: uniqueArray(sourceData.map((data) => data.ACCOUNT_NAME).filter(Boolean)),
        SOW_NAME: uniqueArray(sourceData.map((data) => data.SOW_NAME).filter(Boolean)).sort(),
        BILLING_STATUS: uniqueArray(sourceData.map((data) => data.BILLING_STATUS).filter(Boolean))
    };
}

function getEmpDataTable(emp) {
    $('.width-modify-head').remove();
    $('.width-modify').remove();
    filterWeekStatus();
    if ($.fn.dataTable.isDataTable('#emp_table')) {
        $('#emp_table').dataTable().fnClearTable();
        $('#emp_table').dataTable().fnDestroy();
        togglefun("Jan");
        togglefun("Feb");
        togglefun("Mar");
        togglefun("Apr");
        togglefun("May");
        togglefun("Jun");
        togglefun("Jul");
        togglefun("Aug");
        togglefun("Sep");
        togglefun("Oct");
        togglefun("Nov");
        togglefun("Dec");
    }
    $('#emp_table tbody').empty();
    for (var i = 0; i < emp.length; i++) {
        let endDtae = emp[i].ALLOCATION_END_DATE;
        
        if (endDtae == ""){
            var currentYear = moment().year();
             endDtae = new Date(currentYear, 12, 0);
             
        }
        let weeklyStatus = getWeekDataOfEmp(emp[i].ALLOCATION_START_DATE,endDtae);
       
        let weekData = "";
        let oneFlag = false;
        let prevMonth = '';
        let newSpan = '';
        let billClass = "emp_active"
        if (emp[i].BILLING_STATUS == "Investment") {
            billClass = "emp_bill_invest"
        } else if (emp[i].BILLING_STATUS == "Bench") {
            billClass = "emp_bill_bench"
        }
        $.each(weeklyStatus, function (index, value) {
            newSpan = '';
            if (!oneFlag && value.availability == true) {
                oneFlag = true;
            }
            if (prevMonth !== '' && prevMonth !== value.month) {
                newSpan = "<span class='" + (oneFlag == true ? billClass : "inactive") + " " + prevMonth + " collapse_column new' style='display:none'>" + (oneFlag ? '1' : '0') + "</span>";
                oneFlag = false;
            }
            prevMonth = value.month;
            weekData += "<td class='" + (value.availability == true ? billClass : "inactive") + " " + value.month + "'>" + (value.availability == true ? "1" : "0") + "</td>"
            if (index === (weeklyStatus.length - 1)) {
                newSpan == "<span class='" + (oneFlag == true ? billClass : "inactive") + " " + value.month + " collapse_column' style='display:none'>" + (oneFlag ? '1' : '0') + "</span>";
            }
        });
       
        var row = $('<tr><td class="employee_id">' +
            emp[i].EMPLOYEE_ID + '</td><td class="employee_name">' +
            emp[i].EMPLOYEE_NAME + '</td><td class="designation">' +
            emp[i].DESIGNATION + '</td><td class="in_notice_period">' +
            emp[i].SOW_ID + '</td><td class="sow_code">' +
            emp[i].ACCOUNT_NAME + '</td><td class="sow_name">' +
            emp[i].SOW_NAME + '</td><td class="project_allocation_start_date">' +
            convertToDateString(emp[i].ALLOCATION_START_DATE) +
            '</td><td class="project_allocation_end_date">' +
            emp[i].ALLOCATION_END_DATE +
            '</td><td class="billing_status">' +
            emp[i].BILLING_STATUS + '</td><td class="location">' +
            emp[i].COUNTRY + '</td><td style="display:none" class="current_date">' +
            emp[i].CURRENT_DATE + '</td><td style="display:none" class="customer_id">' +
            emp[i].CUSTOMER_ID + '</td><td style="display:none" class="day_difference">' +
            emp[i].DAY_DIFFERENCE + '</td><td style="display:none" class="employee_status">' +
            emp[i].EMPLOYEE_STATUS + '</td><td style="display:none" class="function">' +
            emp[i].FUNCTION + '</td><td style="display:none" class="new_in_notice_period">' +
            emp[i].IN_NOTICE_PERIOD + '</td><td style="display:none" class="old_project_allocation_end_date">' +
            emp[i].ALLOCATION_END_DATE + '</td><td style="display:none" class="old_project_allocation_start_date">' +
            emp[i].ALLOCATION_START_DATE + '</td><td style="display:none" class="end_date">' +
            emp[i].END_DATE + '</td><td style="display:none" class="const_end_date">' +
            emp[i].ALLOCATION_END_DATE + '</td><td style="display:none" class="actual_end_date">' +
            emp[i].ACTUAL_END_DATE + '</td>' + weekData + '</tr>');

        $('#emp_table tbody').append(row);
        
    }
    togglefun("Jan");
    togglefun("Feb");
    togglefun("Mar");
    togglefun("Apr");
    togglefun("May");
    togglefun("Jun");
    togglefun("Jul");
    togglefun("Aug");
    togglefun("Sep");
    togglefun("Oct");
    togglefun("Nov");
    togglefun("Dec");
    var resourceMappingSearch = $('#resourceMappingSearch').val() || '';
    var resourceMappingTable = $('#emp_table').DataTable({
        "pageLength": 50,
        "dom": "rtip"
    });
    resourceMappingTable.search(resourceMappingSearch).draw();
    $('#resourceMappingSearch').off('input.resourceMapping').on('input.resourceMapping', function () {
        if ($.fn.dataTable.isDataTable('#emp_table')) {
            $('#emp_table').DataTable().search(this.value).draw();
        }
    });
    $('#emp_table tbody').on('change', '.proj_alloc_class', function () {
        {
            var $tr = $(this).closest('tr');
            let employee_id = $tr.find('.employee_id').text();
            let employee_name = $tr.find('.employee_name').text();
            let designation = $tr.find('.designation').text();
            let sow_id = $tr.find('.sow_id').text();
            let sow_code = $tr.find('.sow_code').text();
            let customer_name = $tr.find('.customer_name').text();
            let sow_name = $tr.find('.sow_name').text();
            let project_allocation_start_date = $tr.find('.project_allocation_start_date').text();
            let project_allocation_end_date = $(this).val();
            let billing_status = $tr.find('.billing_status').text();
            let location = $tr.find('.location').text();
            let current_date = $tr.find('.current_date').text();
            let customer_id = $tr.find('.customer_id').text();
            let day_difference = $tr.find('.day_difference').text();
            let employee_status = $tr.find('.employee_status').text();
            let empfunction = $tr.find('.function').text();
            let in_notice_period = $tr.find('.new_in_notice_period').text();
            let old_project_allocation_end_date = $tr.find('.old_project_allocation_end_date').text();
            let old_project_allocation_start_date = $tr.find('.old_project_allocation_start_date').text();
            let resource_end_date = $tr.find('.end_date').text();
            let const_end_date = $tr.find('.const_end_date').text();
            let project_end_date = $tr.find('.actual_end_date').text();
            $tr.find('.old_project_allocation_end_date').text(project_allocation_end_date);

            var selectedEndDate = new Date($(this).val());
            var endDate = new Date(project_end_date);
            let selectStartDate = new Date(project_allocation_start_date);
            let selected_res_end_date = new Date(resource_end_date);
            let sowProjActualEndDate = false, selSowStartDate = false, resourceNotice = false;

            //Checking selected end date is more than sow actual end date
            if (selectedEndDate < endDate) {
                sowProjActualEndDate = true;
            } else {
                bootbox.alert("<div style='font-size:12px;text-align: initial;'><b>Note</b> : Resource Allocation Extension should/can only be done after the project end date is updated (in Salseforce)</div><br>Client - <b>" +
                    customer_name + "</b>, SOW Name - <b>" +
                    sow_name + "</b>, project end is <b><i>'" +
                    convert(endDate) + "'</i></b>. <br>Selected date (<b><i>" +
                    convert($(this).val()) +
                    "</b></i>) is beyond project end date.<br>Please get the approval from delivery head and update project end date first before extending the end date for the resource.");
                $(this).val(const_end_date);
                return false;
            }

            //Checking project allocation start date is less than project allocation end date
            if (selectStartDate < selectedEndDate) {
                selSowStartDate = true;
            } else {
                bootbox.alert("Project allocation end date <b>(" + convert(selectedEndDate) + ")</b> should be more than allocation start date <b>(" + project_allocation_start_date + ")</b><br> Please select valid date");
                return false;
            }

            //Checking if the user is in notice period then need to validate the resource end date and sow actual end date
            if (in_notice_period == "YES") {
                if (selectedEndDate <= selected_res_end_date) {
                    resourceNotice = true;
                } else {
                    bootbox.alert(`<b>${employee_name}</b> is serving <i>"Notice Period"</i> and end date is <b>${convert(resource_end_date)}</b>, so connot be extended.`);
                    $(this).val(resource_end_date);
                    return false;
                }
            } else {
                resourceNotice = true;
            }

            //All the above conditions are true then allowing data to back end
            if (sowProjActualEndDate && selSowStartDate && resourceNotice) {
                let modified_record = "{ \"EMPLOYEE_ID\" : \"" + employee_id +
                    "\", \"EMPLOYEE_NAME\":\"" + employee_name +
                    "\", \"DESIGNATION\":\"" + designation +
                    "\", \"END_DATE\":\"" + resource_end_date +
                    "\", \"FUNCTION\":\"" + empfunction +
                    "\", \"EMPLOYEE_STATUS\":\"" + employee_status +
                    "\", \"LOCATION\":\"" + location +
                    "\", \"SOW_ID\":\"" + sow_id +
                    "\", \"SOW_CODE\":\"" + sow_code +
                    "\", \"CUSTOMER_ID\":\"" + customer_id +
                    "\", \"BILLING_STATUS\":\"" + billing_status +
                    "\", \"PROJECT_ALLOCATION_START_DATE\":\"" + old_project_allocation_start_date +
                    "\", \"PROJECT_ALLOCATION_END_DATE\":\"" + project_allocation_end_date +
                    "\", \"SOW_NAME\":\"" + sow_name +
                    "\", \"CUSTOMER_NAME\":\"" + customer_name +
                    "\", \"CURRENT_DATE\":\"" + current_date +
                    "\", \"DAY_DIFFERENCE\":\"" + day_difference +
                    "\", \"IN_NOTICE_PERIOD\":\"" + in_notice_period +
                    "\"}"

                let old_record = "{ \"EMPLOYEE_ID\" : \"" + employee_id +
                    "\", \"EMPLOYEE_NAME\":\"" + employee_name +
                    "\", \"DESIGNATION\":\"" + designation +
                    "\", \"END_DATE\":\"" + resource_end_date +
                    "\", \"FUNCTION\":\"" + empfunction +
                    "\", \"EMPLOYEE_STATUS\":\"" + employee_status +
                    "\", \"LOCATION\":\"" + location +
                    "\", \"SOW_ID\":\"" + sow_id +
                    "\", \"SOW_CODE\":\"" + sow_code +
                    "\", \"CUSTOMER_ID\":\"" + customer_id +
                    "\", \"BILLING_STATUS\":\"" + billing_status +
                    "\", \"PROJECT_ALLOCATION_START_DATE\":\"" + old_project_allocation_start_date +
                    "\", \"PROJECT_ALLOCATION_END_DATE\":\"" + old_project_allocation_end_date +
                    "\", \"SOW_NAME\":\"" + sow_name +
                    "\", \"CUSTOMER_NAME\":\"" + customer_name +
                    "\", \"CURRENT_DATE\":\"" + current_date +
                    "\", \"DAY_DIFFERENCE\":\"" + day_difference +
                    "\", \"IN_NOTICE_PERIOD\":\"" + in_notice_period +
                    "\"}"

                let employee_data = {
                    "query_type": "edit_resource_mapping",
                    "environment": apiValue.environment,
                    "modified_record": "[" + modified_record + "]",
                    "old_record": "[" + old_record + "]"
                }

                $.ajax({
                    url: apiValue.url,
                    type: "POST",
                    dataType: "json",
                    crossDomain: true,
                    format: "json",
                    async: false,
                    mode: 'no-cors',
                    data: JSON.stringify(employee_data),
                    success: function (data) {
                        toastr.options.timeOut = 2000; // 2s
                        let projectDetails = data.NEXT_PROJECT[0];
                        if (projectDetails == undefined) {
                            bootbox.alert(`<div class='response_status'><div class='res_update_response'>${data.STATUS}</div>${data.Message} <br>`);
                        } else {
                            bootbox.alert(`<div class='response_status'><div class='res_update_response'>${data.STATUS}</div>${data.Message} <br>
                            Future Project Details : 
                            <br> 
                            Account - <b>${projectDetails.CUSTOMER_NAME}</b>,  
                            Sow Name - <b>${projectDetails.SOW_NAME}</b> <br>
                            Project Allocation Start Date - <b>${convert(projectDetails.PROJECT_ALLOCATION_START_DATE)}</b>, 
                            Project Allocation End Date - <b>${convert(projectDetails.PROJECT_ALLOCATION_END_DATE)}</b> and
                            Billing Status - <b>${projectDetails.BILLING_STATUS}</b>
                            </div>`);
                        }

                        if (data.STATUS == "Failed") {
                            $(".response_status").addClass("error_response");
                        } else {
                            $(".response_status").addClass("success_response");
                        }
                    },
                    error: function (error) {
                        console.log('message Error' + JSON.stringify(error));
                    }
                });
            }
           
        }
       
    });
}



function appendOptionData(sourceData = filterDataJson) {
    let filterData = getFilterOptionValues(sourceData) || empAllData[0];
    if (!filterData) {
        return;
    }

    empNameOptions = "";
    empIdOptions = "";
    desgnOptions = "";
    statusOptions = "";
    sowIDOptions = "";
    sowCodeOptions = "";
    clientOptions = "";
    sowNameOptions = "";
    billingOptions = "";

    empNameArray = Array.isArray(filterData.EMPLOYEE_NAME) ? filterData.EMPLOYEE_NAME : [];
    empNameArray.sort();
    for (let i = 0; i < empNameArray.length; i++) {
        empNameOptions += `<option class="emp_option" value="${empNameArray[i]}">${empNameArray[i]}</option>`;
    }
    empIdArray = Array.isArray(filterData.EMPLOYEE_ID) ? filterData.EMPLOYEE_ID : [];
    for (let i = 0; i < empIdArray.length; i++) {
        empIdOptions += `<option class="emp_option" value="${empIdArray[i]}">${empIdArray[i]}</option>`;
    }
    desgnArray = Array.isArray(filterData.DESIGNATION) ? filterData.DESIGNATION : [];
    for (let i = 0; i < desgnArray.length; i++) {
        desgnOptions += `<option class="emp_option" value="${desgnArray[i]}">${desgnArray[i]}</option>`;
    }
    sowIDArray = Array.isArray(filterData.SOW_ID) ? filterData.SOW_ID : [];
    for (let i = 0; i < sowIDArray.length; i++) {
        sowIDOptions += `<option class="emp_option" value="${sowIDArray[i]}">${sowIDArray[i]}</option>`;
    }
    clientArray = Array.isArray(filterData.ACCOUNT_NAME) ? filterData.ACCOUNT_NAME : [];
    for (let i = 0; i < clientArray.length; i++) {
        clientOptions += `<option class="emp_option" value="${clientArray[i]}">${clientArray[i]}</option>`;
    }
    sowNameArray = Array.isArray(filterData.SOW_NAME) ? filterData.SOW_NAME : [];
    sowNameArray.sort();
    for (let i = 0; i < sowNameArray.length; i++) {
        sowNameOptions += `<option class="emp_option" value="${sowNameArray[i]}">${sowNameArray[i]}</option>`;
    }
    billingArray = Array.isArray(filterData.BILLING_STATUS) ? filterData.BILLING_STATUS : [];
    for (let i = 0; i < billingArray.length; i++) {
        billingOptions += `<option class="emp_option" value="${billingArray[i]}">${billingArray[i]}</option>`;
    }

    $("#idSelect").empty();
    $("#nameSelect").empty();
    $("#desgnSelect").empty();
    $("#sowIdSelect").empty();
    $("#clientSelect").empty();
    $("#sowNameSelect").empty();
    $("#billSelect").empty();
    $("#idSelect").append(empIdOptions);
    $("#nameSelect").append(empNameOptions);
    $("#desgnSelect").append(desgnOptions);
    $("#sowIdSelect").append(sowIDOptions);
    $("#clientSelect").append(clientOptions);
    $("#sowNameSelect").append(sowNameOptions);
    $("#billSelect").append(billingOptions);
}


let firstSelectFilter = "";
$(function () {
    $("#nameSelect").change(function () {
        firstSelectFilter = "nameSelect"
        updateRememberedFilterSelections();
        filterData();
    });
    $("#clientSelect").change(function () {
        firstSelectFilter = "clientSelect"
        updateRememberedFilterSelections();
        filterData();
    });
    $("#sowNameSelect").change(function () {
        firstSelectFilter = "sowNameSelect"
        updateRememberedFilterSelections();
        filterData();
    });
    $("#billSelect").change(function () {
        firstSelectFilter = "billSelect"
        updateRememberedFilterSelections();
        filterData();
    });
   
});

function filterData() {
    const clientSelectFilter = $("#clientSelect").val();
    const sowNameSelectFilter = $("#sowNameSelect").val();
    const billSelectFilter = $("#billSelect").val();
    const nameSelectFilter = $("#nameSelect").val();
    empNameOptions = "";
    sowNameOptions = "";
    clientOptions = "";
    billingOptions = "";
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    let newJson = filterDataJson;
    if ($('#all').is(":checked") == true) {
        var ajaxTime = new Date().getTime();
        $('.employee_detail_inside').hide();
        $('.loading_class').show();
        getEmpDataTable(empAllocData);
        var totalTime = new Date().getTime() - ajaxTime;
        $('.employee_detail_inside').show();
        $('.loading_class').hide();
    } else if ($('#all').is(":checked") == false) {
        var ajaxTime = new Date().getTime();
        $('.employee_detail_inside').hide();
        $('.loading_class').show();
        getEmpDataTable(current_data);
        var totalTime = new Date().getTime() - ajaxTime;
        $('.employee_detail_inside').show();
        $('.loading_class').hide();
    }
    if (clientSelectFilter.length > 0) {
            newJson = newJson.filter(d => {
                const obj = clientSelectFilter.find(f => d.ACCOUNT_NAME == f);
                return obj ? true : false;
            })
        }
    if (sowNameSelectFilter.length > 0) {
        newJson = newJson.filter(d => {
            const obj = sowNameSelectFilter.find(f => d.SOW_NAME == f);
            return obj ? true : false;
    })
}
    if (nameSelectFilter.length > 0) {
            newJson = newJson.filter(d => {
                const obj = nameSelectFilter.find(f => d.EMPLOYEE_NAME == f);
                return obj ? true : false;
    })
}
    if (billSelectFilter.length > 0) {
            newJson = newJson.filter(d => {
                const obj = billSelectFilter.find(f => d.BILLING_STATUS == f);
                return obj ? true : false;
    })
}
getEmpDataTable(newJson);
if (firstSelectFilter != "") {
    let lenOfSelFilter = $('#' + firstSelectFilter).val().length;
    let checkFilterData = true
    let nameSelectFilter = $("#nameSelect").val();
    if(nameSelectFilter.length > 0){
        checkFilterData = false
    }
    let clientSelectFilter = $("#clientSelect").val();
    if(clientSelectFilter.length > 0){
        checkFilterData = false
    }
    let sowNameSelectFilter = $("#sowNameSelect").val();
    if(sowNameSelectFilter.length > 0){
        checkFilterData = false
    }
    let billSelectFilter = $("#billSelect").val();
    if(billSelectFilter.length > 0){
        checkFilterData = false
    }
   
    if (lenOfSelFilter == 0 && checkFilterData) {
        firstSelectFilter = "";
        appendOptionData();
        // $('#nameSelect').empty();
        // $("#nameSelect").append(empNameOptions);
        // // $("#nameSelect").append(empNameUsOptions);
        // $('#clientSelect').empty();
        // $("#clientSelect").append(clientOptions);
        // $("#clientSelect").append(clientOptions);
        // $('#sowNameSelect').empty();
        // $("#sowNameSelect").append(sowNameOptions);
        // $("#sowNameSelect").append(sowNameOptions);
        // $('#billSelect').empty();
        // $("#billSelect").append(billingOptions);
        // $("#billSelect").append(billingOptions);
        callMultiselectOption();
    } else {
        reassignFilterOption(firstSelectFilter)
    }
}
   
   
    var ajaxTime = new Date().getTime();
    $('.employee_detail_inside').hide();
    getEmpDataTable(newJson);
    var totalTime = new Date().getTime() - ajaxTime;
    $('.employee_detail_inside').show();
}

function uniqueArray(arrayData) {
    let uniqueListArray = arrayData.filter((c, index) => {
        return arrayData.indexOf(c) === index;
    });
    return uniqueListArray;
}

let popupEmployeeArray = [];
let popupClientNameArray = [];
let popupCurSowEmpNameArr = [];
function getEmplyAccount() {
    if (popupEmployeeArray.length == 0) {

        $.ajax({
            url: apiValue.url,
            type: "POST",
            dataType: "json",
            crossDomain: true,
            format: "json",
            async: false,
            mode: 'no-cors',
            data: JSON.stringify({
                query_type: "all_resource_details",
                "db_name": apiValue.db_name,
                "environment": apiValue.environment
            }),
            success: function (data) {
                const popupPayload = normalizeResourceMappingPayload(data);
                popupEmployeeArray = Array.isArray(popupPayload.EMPLOYEE_DETAILS) ? popupPayload.EMPLOYEE_DETAILS.sort(GetSortOrder("EMPLOYEE_NAME")) : [];
                popupClientNameArray = Array.isArray(popupPayload.SOW_DETAILS_NEW) ? popupPayload.SOW_DETAILS_NEW : [];
                popupCurSowEmpNameArr = Array.isArray(popupPayload.CURRENT_DATA) ? popupPayload.CURRENT_DATA : [];
            },
            error: function (error) {
                console.log('message Error' + JSON.stringify(error));
            }
        });
    }
}

function CreateEmpRecord() {
    $("#replace_employee_div").hide();
    getEmplyAccount();
    let popEmpNameOptions = "<option class='pop_emp_option' val=''>Select Employee</option>", popClientNameOption = "";

    $.each(popupEmployeeArray, function (value, name) {
        popEmpNameOptions += `<option class="pop_emp_option" value="${name.EMPLOYEE_NAME}">${name.EMPLOYEE_NAME}</option>`;
    });
    $.each(popupClientNameArray, function (value, client) {
        popClientNameOption += `<option class="pop_client_option" value="${client.CUSTOMER_NAME}">${client.CUSTOMER_NAME}</option>`;
    });
    $("#alloc_employee_name").append(popEmpNameOptions);
    $("#alloc_client").append(popClientNameOption);
    $("#repl_alloc_employee_name").append(popEmpNameOptions);
    selectEmpName();
    $("#alloc_employee_name").select2();
    $("#alloc_client").select2();
    $("#alloc_sow_name").select2();

}
let updatedSowArray = [];
function selectSowName() {
    let account_selected = $('#alloc_client').val();
    let sow_name_options = "";
    $.each(popupClientNameArray, function (i, clientName) {
        if (clientName.CUSTOMER_NAME == account_selected) {
            $('#cus_id').val(clientName.CUSTOMER_ID);
            $.each(clientName.SOW_DATA, function (i, sow) {
                updatedSowArray = clientName.SOW_DATA;
                sow_name_options += '<option value="' + sow.SOW_ID + '">' + sow.SOW_NAME + '</option>';
            })
        }
    });
    $("#alloc_sow_name").html(sow_name_options);
    $('#alloc_sow_name').removeAttr("disabled");
    getSowDetails("");
    $("#alloc_sow_name").select2();
}

function getSowDetails(obj) {
    let defaultName = obj;
    let sow_id = $('#alloc_sow_name').val();
    if (defaultName == "999999") {
        $("#alloc_sow_id").val("");
        $("#alloc_sow_code").val("");
        $("#project_alloc_start_date").val("");
        $("#project_alloc_end_date").val("");
        $("#sow_prob_status").val("");
    } else {
        $.each(updatedSowArray, function (i, clientName) {
            if (clientName.SOW_ID == sow_id) {
                $("#old_actual_start_date").val("");
                $("#old_actual_end_date").val("");
                $("#old_sow_dynamic_status").val("");
                $("#old_total_resources").val("");
                $("#old_onsite_resources").val("");
                $("#old_offshore_resources").val("");
                $("#old_probability").val("");
                $("#planned_actual_start_date").val("");
                $("#planned_actual_end_date").val("");
                $("#planned_sow_dynamic_status").val("");
                $("#planned_total_resources").val("");
                $("#planned_onsite_resources").val("");
                $("#planned_offshore_resources").val("");
                $("#planned_probability").val("");
                $("#active_actual_start_date").val("");
                $("#active_actual_end_date").val("");
                $("#active_sow_dynamic_status").val("");
                $("#active_total_resources").val("");
                $("#active_onsite_resources").val("");
                $("#active_offshore_resources").val("");
                $("#active_probability").val("");
                $("#alloc_sow_id").val(clientName.SOW_ID);
                $("#alloc_sow_code").val(clientName.SOW_CODE);
                let sow_details = clientName.DETAILS;
                $.each(sow_details, function (i, sowStatusData) {
                    if (sowStatusData.SOW_DYNAMIC_STATUS == "OLD") {
                        $("#old_actual_start_date").val(sowStatusData.ACTUAL_START_DATE);
                        $("#old_actual_end_date").val(sowStatusData.ACTUAL_END_DATE);
                        $("#old_sow_dynamic_status").val(sowStatusData.SOW_DYNAMIC_STATUS);
                        $("#old_total_resources").val(sowStatusData.TOTAL_RESOURCES);
                        $("#old_onsite_resources").val(sowStatusData.ONSITE_RESOURCES);
                        $("#old_offshore_resources").val(sowStatusData.OFFSHORE_RESOURCES);
                        $("#old_probability").val(sowStatusData.PROBABILITY);
                    }
                    if (sowStatusData.SOW_DYNAMIC_STATUS == "Planned") {
                        $("#planned_actual_start_date").val(sowStatusData.ACTUAL_START_DATE);
                        $("#planned_actual_end_date").val(sowStatusData.ACTUAL_END_DATE);
                        $("#planned_sow_dynamic_status").val(sowStatusData.SOW_DYNAMIC_STATUS);
                        $("#planned_total_resources").val(sowStatusData.TOTAL_RESOURCES);
                        $("#planned_onsite_resources").val(sowStatusData.ONSITE_RESOURCES);
                        $("#planned_offshore_resources").val(sowStatusData.OFFSHORE_RESOURCES);
                        $("#planned_probability").val(sowStatusData.PROBABILITY);
                    }
                    if (sowStatusData.SOW_DYNAMIC_STATUS == "Active") {
                        $("#active_actual_start_date").val(sowStatusData.ACTUAL_START_DATE);
                        $("#active_actual_end_date").val(sowStatusData.ACTUAL_END_DATE);
                        $("#active_sow_dynamic_status").val(sowStatusData.SOW_DYNAMIC_STATUS);
                        $("#active_total_resources").val(sowStatusData.TOTAL_RESOURCES);
                        $("#active_onsite_resources").val(sowStatusData.ONSITE_RESOURCES);
                        $("#active_offshore_resources").val(sowStatusData.OFFSHORE_RESOURCES);
                        $("#active_probability").val(sowStatusData.PROBABILITY);
                    }

                });
                $.each(sow_details, function (i, sowStatusData) {
                    if (sowStatusData.SOW_DYNAMIC_STATUS == "Active") {
                        $("#project_alloc_start_date").val(convert(sowStatusData.ACTUAL_START_DATE));
                        $("#project_alloc_end_date").val(convert(sowStatusData.ACTUAL_END_DATE));
                        return false;
                    } else if (sowStatusData.SOW_DYNAMIC_STATUS == "Planned") {
                        $("#project_alloc_start_date").val(convert(sowStatusData.ACTUAL_START_DATE));
                        $("#project_alloc_end_date").val(convert(sowStatusData.ACTUAL_END_DATE));
                    } else if (sowStatusData.SOW_DYNAMIC_STATUS == "OLD") {
                        $("#project_alloc_start_date").val(convert(sowStatusData.ACTUAL_START_DATE));
                        $("#project_alloc_end_date").val(convert(sowStatusData.ACTUAL_END_DATE));
                    }
                });
                $("#sow_prob_status").val(clientName.PROBABILITY);
                $("#selected_sow_start_date").val(clientName.LEGAL_START_DATE);
                $("#selected_sow_end_date").val(clientName.LEGAL_END_DATE);
                $("#selected_dynamic_status").val(clientName.DYNAMIC_STATUS);
                $("#selected_probability").val(clientName.PROBABILITY);
            }
        });
        let prob_val = $("#sow_prob_status").val();
    }
    $("#pop_billing_status").select2();
}

function selectEmpName() {
    let empName_selected = $('#alloc_employee_name').val();
    let empStatus = false;
    $.each(popupEmployeeArray, function (i, empdata) {

        if (empdata.EMPLOYEE_NAME == empName_selected) {
            $(".alert_not_delivery").hide();
            $("#curr_start_date").val("");
            $("#curr_end_date").val("");
            $("#fur_start_date").val("");
            $("#fur_end_date").val("");
            $("#selected_sow_start_date").val("");
            $("#selected_sow_end_date").val("");
            $("#selected_dynamic_status").val("");
            $("#selected_probability").val("");
            $("#alloc_employee_id").val(empdata.EMPLOYEE_ID);
            $("#alloc_designation").val(empdata.JOB_ROLE_ID);
            $("#pop_location").val(empdata.LOCATION);
            $("#resource_function").val(empdata.FUNCTION);
            $("#last_billing_status").val(empdata.LAST_BILLING_STATUS);
            $("#last_customer_name").val(empdata.LAST_CUSTOMER_NAME);
            $("#last_sow_id").val(empdata.LAST_SOW_ID);
            $("#last_sow_name").val(empdata.LAST_SOW_NAME);
            $("#last_start_date").val(empdata.LAST_PROJECT_ALLOCATION_START_DATE);
            $("#last_end_date").val(empdata.LAST_PROJECT_ALLOCATION_END_DATE);
            $("#pop_billing_status").append(billingOptions);
            let sow_name_options = "";
            let sow_filter_data = [];

            let current_proj_data = empdata.CURRENT_PROJECT;
            let future_proj_data = empdata.FUTURE_PROJECT;
            let clientNameSel = "";
            let sowName = "";
            if (current_proj_data.length > 0) {
                clientNameSel = current_proj_data[0].CUSTOMER_NAME;
                sowName = current_proj_data[0].SOW_ID;
                $("#curr_billing_status").val(current_proj_data[0].BILLING_STATUS);
                $("#curr_customer_name").val(current_proj_data[0].CUSTOMER_NAME);
                $("#alloc_client").val(current_proj_data[0].CUSTOMER_NAME);
                $("#curr_probability").val(current_proj_data[0].PROBABILITY);
                $("#curr_sow_id").val(current_proj_data[0].SOW_ID);
                $("#curr_sow_name").val(current_proj_data[0].SOW_NAME);
                $("#curr_start_date").val(current_proj_data[0].PROJECT_ALLOCATION_START_DATE);
                $("#curr_end_date").val(current_proj_data[0].PROJECT_ALLOCATION_END_DATE);
                $("#project_alloc_start_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_START_DATE));
                $("#project_alloc_end_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_END_DATE));
                $("#actual_date").val(current_proj_data[0].PROJECT_ALLOCATION_END_DATE);
                $("#sow_prob_status").val(current_proj_data[0].PROBABILITY);
                $("#pop_billing_status").val(current_proj_data[0].BILLING_STATUS);

                $("#cus_id").val(current_proj_data[0].CUSTOMER_ID);
                $("#alloc_sow_id").val(current_proj_data[0].SOW_ID);
                $("#alloc_sow_code").val(current_proj_data[0].SOW_CODE);
            }
            if (current_proj_data.length == 0) {
                clientNameSel = "Factspan";
                $("#alloc_client").val(clientNameSel);
                selectSowName();
                getSowDetails("999999");
                $(".alert_not_delivery").show();
            }
            if (future_proj_data.length > 0) {
                $("#fur_billing_status").val(future_proj_data[0].BILLING_STATUS);
                $("#fur_customer_name").val(future_proj_data[0].CUSTOMER_NAME);
                $("#fur_probability").val(future_proj_data[0].PROBABILITY);
                $("#fur_sow_id").val(future_proj_data[0].SOW_ID);
                $("#fur_sow_name").val(future_proj_data[0].SOW_NAME);
                $("#fur_start_date").val(future_proj_data[0].PROJECT_ALLOCATION_START_DATE);
                $("#fur_end_date").val(future_proj_data[0].PROJECT_ALLOCATION_END_DATE);
            }

            $.each(popupClientNameArray, function (i, clientName) {
                if (clientName.CUSTOMER_NAME == clientNameSel) {
                    $('#cus_id').val(clientName.CUSTOMER_ID);
                    sow_filter_data = clientName.SOW_DATA;
                    $.each(clientName.SOW_DATA, function (i, sow) {
                        updatedSowArray = clientName.SOW_DATA;
                        sow_name_options += '<option value="' + sow.SOW_ID + '">' + sow.SOW_NAME + '</option>';
                    })
                }
            });
            $.each(updatedSowArray, function (i, clientName) {
                if (clientName.SOW_ID == sowName) {
                    $("#old_actual_start_date").val("");
                    $("#old_actual_end_date").val("");
                    $("#old_sow_dynamic_status").val("");
                    $("#old_total_resources").val("");
                    $("#old_onsite_resources").val("");
                    $("#old_offshore_resources").val("");
                    $("#old_probability").val("");
                    $("#planned_actual_start_date").val("");
                    $("#planned_actual_end_date").val("");
                    $("#planned_sow_dynamic_status").val("");
                    $("#planned_total_resources").val("");
                    $("#planned_onsite_resources").val("");
                    $("#planned_offshore_resources").val("");
                    $("#planned_probability").val("");
                    $("#active_actual_start_date").val("");
                    $("#active_actual_end_date").val("");
                    $("#active_sow_dynamic_status").val("");
                    $("#active_total_resources").val("");
                    $("#active_onsite_resources").val("");
                    $("#active_offshore_resources").val("");
                    $("#active_probability").val("");
                    $("#alloc_sow_id").val(clientName.SOW_ID);
                    $("#alloc_sow_code").val(clientName.SOW_CODE);
                    let sow_details = clientName.DETAILS;
                    $.each(sow_details, function (i, sowStatusData) {
                        if (sowStatusData.SOW_DYNAMIC_STATUS == "OLD") {
                            $("#old_actual_start_date").val(sowStatusData.ACTUAL_START_DATE);
                            $("#old_actual_end_date").val(sowStatusData.ACTUAL_END_DATE);
                            $("#old_sow_dynamic_status").val(sowStatusData.SOW_DYNAMIC_STATUS);
                            $("#old_total_resources").val(sowStatusData.TOTAL_RESOURCES);
                            $("#old_onsite_resources").val(sowStatusData.ONSITE_RESOURCES);
                            $("#old_offshore_resources").val(sowStatusData.OFFSHORE_RESOURCES);
                            $("#old_probability").val(sowStatusData.PROBABILITY);
                        }
                        if (sowStatusData.SOW_DYNAMIC_STATUS == "Planned") {
                            $("#planned_actual_start_date").val(sowStatusData.ACTUAL_START_DATE);
                            $("#planned_actual_end_date").val(sowStatusData.ACTUAL_END_DATE);
                            $("#planned_sow_dynamic_status").val(sowStatusData.SOW_DYNAMIC_STATUS);
                            $("#planned_total_resources").val(sowStatusData.TOTAL_RESOURCES);
                            $("#planned_onsite_resources").val(sowStatusData.ONSITE_RESOURCES);
                            $("#planned_offshore_resources").val(sowStatusData.OFFSHORE_RESOURCES);
                            $("#planned_probability").val(sowStatusData.PROBABILITY);
                        }
                        if (sowStatusData.SOW_DYNAMIC_STATUS == "Active") {
                            $("#active_actual_start_date").val(sowStatusData.ACTUAL_START_DATE);
                            $("#active_actual_end_date").val(sowStatusData.ACTUAL_END_DATE);
                            $("#active_sow_dynamic_status").val(sowStatusData.SOW_DYNAMIC_STATUS);
                            $("#active_total_resources").val(sowStatusData.TOTAL_RESOURCES);
                            $("#active_onsite_resources").val(sowStatusData.ONSITE_RESOURCES);
                            $("#active_offshore_resources").val(sowStatusData.OFFSHORE_RESOURCES);
                            $("#active_probability").val(sowStatusData.PROBABILITY);
                        }

                    });
                    $("#sow_prob_status").val(clientName.PROBABILITY);
                    $("#selected_sow_start_date").val(clientName.LEGAL_START_DATE);
                    $("#selected_sow_end_date").val(clientName.LEGAL_END_DATE);
                    $("#selected_dynamic_status").val(clientName.DYNAMIC_STATUS);
                    $("#selected_probability").val(clientName.PROBABILITY);
                    // })
                }
            });
            $("#alloc_sow_name").html(sow_name_options);
            $('#alloc_sow_name').removeAttr("disabled");
            if (sowName == "") {
                sowName = "999999";
            }
            $("#alloc_sow_name").val(sowName);
            $("#end_date").val(empdata.END_DATE);
            $("#alloc_client").select2();
            $("#alloc_sow_name").select2();

            if (empdata.IN_NOTICE_PERIOD == "YES") {
                $(".alert_notice").show();
            } else {
                $(".alert_notice").hide();
            }
            let emp_skills = empdata.SKILL_DATA;
            let emp_skill_data = "";

            $.each(emp_skills, function (value, skills) {
                if (skills.SKILL_NAME == "" && skills.LEVEL == "") {
                    emp_skill_data = `<button class="skill_data" disabled>No skills available to show</button><br><br>`
                } else {
                    emp_skill_data += `<button class="skill_data" disabled>${skills.SKILL_NAME} - ${skills.LEVEL}</button>`
                }
            });
            $("#key_skill").html(emp_skill_data);
        }
    });
    let prob_val = $("#sow_prob_status").val();
    $("#pop_billing_status").select2();
    $("#alloc_employee_name").select2();
}

function selectReplEmpName() {
    $("#replace_employee_div").show();
}


function createEmpDetails(obj) {
    function pad2(n) {
        return (n < 10 ? '0' : '') + n;
    }

    var date = new Date();
    var month = pad2(date.getMonth() + 1);//months (0-11)
    var day = pad2(date.getDate());//day (1-31)
    var year = date.getFullYear();

    var formattedDate = year + "-" + month + "-" + day;
    let get_name = $('#alloc_employee_name').val();
    let get_id = $('#alloc_employee_id').val();
    let get_des = $('#alloc_designation').val();
    let get_client = $('#alloc_client').val();
    let get_sow_name = $('#alloc_sow_name option:selected').text();
    let get_sow_id = $('#alloc_sow_id').val();
    let get_sow_code = $('#alloc_sow_code').val();
    let get_prj_all_start = $('#project_alloc_start_date').val();
    let get_prj_all_end = $('#project_alloc_end_date').val();
    let get_in_notice = $('#alloc_sow_name').val();
    let get_bill = $('#pop_billing_status').val();
    let get_loc = $('#pop_location').val();
    let get_end_date = "0000-00-00";
    let get_cus_id = $('#cus_id').val();
    let today_date = new Date(formattedDate);
    let get_emp_status = "Active";
    let day_difference = "";
    let get_emp_fun = "Delivery";
    let actual_date = $('#actual_date').val();
    let emp_end_date = $('#end_date').val();
    let curr_billing_status = $('#curr_billing_status').val();
    let curr_customer_name = $('#curr_customer_name').val();
    let curr_probability = $('#curr_probability').val();
    let curr_sow_id = $('#curr_sow_id').val();
    let curr_sow_name = $('#curr_sow_name').val();
    let curr_start_date = $('#curr_start_date').val();
    let curr_end_date = $('#curr_end_date').val();
    let fur_billing_status = $('#fur_billing_status').val();
    let fur_customer_name = $('#fur_customer_name').val();
    let fur_probability = $('#fur_probability').val();
    let fur_sow_id = $('#fur_sow_id').val();
    let fur_sow_name = $('#fur_sow_name').val();
    let fur_start_date = $('#fur_start_date').val();
    let fur_end_date = convert($('#fur_end_date').val());
    let sow_prob_status = $('#sow_prob_status').val();
    let last_billing_status = $("#last_billing_status").val();
    let last_customer_name = $("#last_customer_name").val();
    let last_probability = $("#last_probability").val();
    let last_sow_id = $("#last_sow_id").val();
    let last_sow_name = $("#last_sow_name").val();
    let last_start_date = $("#last_start_date").val();
    let last_end_date = $("#last_end_date").val();
    let billing_flag = false, furture_date_flag = false, sow_status_flag = false, sow_date_flag = false;
    let res_fur_end_date = new Date(fur_end_date);
    let res_selected_start_date = new Date(get_prj_all_start);
    let res_selected_end_date = new Date(get_prj_all_end);
    let res_last_sow_end_date = new Date(last_end_date);
    let res_cur_start_date = new Date(curr_start_date);
    let res_cur_end_date = new Date(curr_end_date);
    let department = $("#resource_function").val();

    if (department == "Delivery") {
        if (obj == "New Addition") {
            // if()
            let current_status = $('#active_probability').val();
            if (current_status == '') {
                current_status = $('#planned_sow_dynamic_status').val();
            }
            if (current_status != '') {

            } else {
                bootbox.alert("Cannot assign resources to <b>Old Projects</b>, Please select 'Active' projects");
            }

        } else {

            //Verifying future start date and future end date 
            if (fur_start_date != "" && fur_end_date != "") {
                if (res_fur_end_date > res_selected_start_date) {
                    bootbox.alert("<b>" + get_name + "</b> is already allocated to Account - <b></i>" + get_client + "</i></b> and Sow Name - <b></i>" + get_sow_name + "</i></b><br> From - <b></i>" + convert(fur_start_date) + "</i></b> To - <b></i>" + convert(fur_end_date) + "</i></b>");
                    return false;
                } else {
                    //Verifing future billing status is not "Use Bench" then allow users to create
                    if (fur_billing_status == "Use Bench" || fur_billing_status == "Bench") {
                        furture_date_flag = true;
                    } else {
                        bootbox.alert("<b>" + get_name + "</b> is already allocated to Account - <b></i>" + fur_customer_name + "</i></b>, Sow Name - <b></i>" + fur_sow_name + "</i></b> and future billing status is <b>'" + fur_billing_status + "'</b> cannot be resigned");
                        return false;
                    }
                    billing_flag = true;
                }
            } else {
                furture_date_flag = true;
                billing_flag = true;
            }
            //Verify selected date and end date is valid or not - end date should be more than start date
            if (res_selected_start_date < res_selected_end_date) {
                sow_date_flag = true;
            } else {
                bootbox.alert("Selected allocation start date <b>(" + get_prj_all_start + ")</b> should be less than allocation end date <b>(" + get_prj_all_end + ")</b>");
                return false;
            }

            //Verifying project probability 
            if ((sow_prob_status == "70%") && get_bill == "Investment") {
                sow_status_flag = true;
            }
            else if ((sow_prob_status == "30%" || sow_prob_status == "50%")) {
                bootbox.alert("Selected Account - <b></i>" + get_client + "</i></b> and Sow Name - <b></i>" + get_sow_name + "</i></b> probability is still - <b><i>" + sow_prob_status + "</b></i> cannot assign to this project");
                return false;
            }
            else if (sow_prob_status == "100%") {
                sow_status_flag = true;
            } else {
                bootbox.alert("Selected Account - <b></i>" + get_client + "</i></b> and Sow Name - <b></i>" + get_sow_name + "</i></b> probability is still - <b><i>" + sow_prob_status + "</b></i>, To assign any resource billing status should be <b>'Investment'</b>");
                return false;
            }


            let start_date = new Date(get_prj_all_start).toLocaleDateString('fr-CA');
            let end_date = new Date(get_prj_all_end).toLocaleDateString('fr-CA');
        }

        if (billing_flag && furture_date_flag && sow_date_flag && sow_status_flag) {
            let new_record = "{ \"EMPLOYEE_ID\" : \"" + get_id +
                "\", \"EMPLOYEE_NAME\":\"" + get_name +
                "\", \"DESIGNATION\":\"" + get_des +
                "\", \"LOCATION\":\"" + get_loc +
                "\", \"SOW_ID\":\"" + get_sow_id +
                "\", \"SOW_CODE\":\"" + get_sow_code +
                "\", \"CUSTOMER_ID\":\"" + get_cus_id +
                "\", \"BILLING_STATUS\":\"" + get_bill +
                "\", \"PROJECT_ALLOCATION_START_DATE\":\"" + start_date +
                "\", \"PROJECT_ALLOCATION_END_DATE\":\"" + end_date +
                "\", \"SOW_NAME\":\"" + get_sow_name +
                "\", \"CUSTOMER_NAME\":\"" + get_client +
                "\"}"
            let create_emp_data = {
                "query_type": "create_resource_mapping",
                "environment": apiValue.environment,
                "confirm": "no",
                "edited_record": "[" + new_record + "]"
            }
            $.ajax({
                url: apiValue.url,
                type: "POST",
                dataType: "json",
                crossDomain: true,
                format: "json",
                async: false,
                mode: 'no-cors',
                data: JSON.stringify(create_emp_data),
                success: function (data) {
                    toastr.options.timeOut = 2000; // 2s
                    toastr.success(data);
                    let message = data.Message;
                    if (message == "New record added successfully") {
                        window.location.href = 'employeeProject.html';
                    }
                },
                error: function (error) {
                    console.log('message Error' + JSON.stringify(error));
                }
            });
        }
    } else {
        bootbox.alert("<b>" + get_name + "</b> is from <b>" + department + "</b> department, Only <b><i>Delivery</i></b> resources will be assigned.<br> Please change the department of the resource to <b><i>Delivery</i></b> then assign resource to a project.");
    }



}

function getremainingDays(currentDay) {
    let returnDays = 0;
    switch (currentDay) {
        case 5: returnDays = 0; break;
        case 4: returnDays = 1; break;
        case 3: returnDays = 2; break;
        case 2: returnDays = 3; break;
        case 1: returnDays = 4; break;
        case 0: returnDays = 5; break;
        case 6: returnDays = 6; break;
    }
    return returnDays;
}

let headerDate = [];
function filterWeekStatus() {
    var fromDate, toDate;
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);
    
    var currentYear = moment().year();
    // console.log("currentYear",currentYear);
    var startDate = moment().month(0).date(1).hour(0).minute(0).second(0);
    startDate.add(getremainingDays(startDate.day()), 'day');
    var dates = [];
    while (startDate.year() === currentYear) {
        dates.push({ dateStr: startDate.format('DD-MM-YYYY'), availability: fromDate < startDate.toDate() && toDate > startDate.toDate(), month: startDate.format('MMM') });
        headerDate.push(startDate.format('DD-MM-YYYY'));
        startDate.add(1, 'weeks');
    }

    let monthList = [];
    for (var j = 0; j < dates.length; j++) {
        let date = getMonth(dates[j].dateStr);
        monthList.push(date);
    }
    monthList = $.grep(monthList, function (n) { return n == 0 || n });

    map = monthList.reduce(function (prev, cur) {
        prev[cur] = (prev[cur] || 0) + 1;
        return prev;
    }, {});
    const d = new Date();
    let currYear = d.getFullYear().toString().slice(-2);
    let monthHeader = ['Jan-' + currYear, 'Feb-' + currYear, 'Mar-' + currYear, 'Apr-' + currYear, 'May-' + currYear, 'Jun-' + currYear, 'Jul-' + currYear, 'Aug-' + currYear, 'Sep-' + currYear, 'Oct-' + currYear, 'Nov-' + currYear, 'Dec-' + currYear];
    let month = "";
    let date = "";
    let headValue = 0;
    for (var key in map) {
        $.each(monthHeader, function (i, monthvalue) {
            if (key == monthvalue.slice(0, 3)) {
                $(".month").append("<th class='width-modify-head' colspan=" + map[key] + " id=" + key + " onClick='togglefun(\"" + key + "\")'>" + monthvalue.replace("-", " ") + "<i class='fas fa-angle-double-left' style='color: #8b8988;'></i></th>");
            }
        });

        for (let k = 1; k <= map[key]; k++) {
            headValue = headValue + 1;
            if (k == map[key]) {
                $(".date").append("<th class='" + key + " width-modify " + key + "_head'><span class='" + key + "_last_hide' style='display:none'></span><span id='week_header_" + headValue + "' class='" + key + "_last_show'>Week " + k + "</span></th>");
            } else {
                $(".date").append("<th id='week_header_" + headValue + "' class='" + key + " width-modify " + key + "_head'>Week " + k + "</th>");
            }
        }
    }
    for (let j = 0; j < headerDate.length; j++) {
        $('#week_header_' + (j + 1)).prop('title', headerDate[j]);
    }

}

function getMonth(str) {
    if (str.indexOf('-') > -1) {
        var dateStr = str.split('-'),
            dateMM = dateStr[1],
            dateDD = dateStr[0],
            dateYY = dateStr[2];
        function GetMonthName(monthNumber) {

            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months[monthNumber - 1];

        }
        if (dateStr.length > 2) {
            return GetMonthName(dateMM);
        } else {
            return dateMM;
        }
    } else {
        return str;
    }
}

function getWeekDataOfEmp(fromDate, toDate) {
    // console.log("fromDate",fromDate);
    
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);
   
    var currentYear = moment().year();
    var startDate = moment().month(0).date(1).hour(0).minute(0).second(0);
    // console.log("startDate",startDate.toDate());
    startDate.add(getremainingDays(startDate.day()), 'day');
    var dates = [];
    while (startDate.year() === currentYear) {
        dates.push({ dateStr: startDate.format('DD-MM-YYYY'), availability: fromDate < startDate.toDate() && toDate > startDate.toDate(), month: startDate.format('MMM') });
        startDate.add(1, 'weeks');
    }
    return dates;
}

function togglefun(obj) {
    $("table tr").each(function () {
        let value = 0;
        let len = $(this).find("." + obj).length;
        let className = $('#' + obj).find('i').attr('class');
        $(this).find("." + obj).each(
            function (index) {
                value = value + parseInt($(this).html());
                if (index !== len - 1) {
                    $(this).toggle();
                }
            }
        );
    });
    $("#" + obj).find('i').toggleClass('fa-angle-double-right fa-angle-double-left');

    let length = $("#" + obj).closest("tr").next("tr").find("." + obj + ":visible").length;
    $('.width-modify').css('z-index', '1');
    $("#" + obj).attr("colspan", length);
    if (length == "1") {
        let val = 53;
        $("." + obj + "_last_show").hide();
        $("." + obj + "_last_hide").show();
        $('.width-modify').css('top', val + 'px');
    } else if (length == "0") {
        let val = 50;
        $("." + obj + "_last_show").hide();
        $("." + obj + "_last_hide").show();
        $('.width-modify').css('top', val + 'px');
    } else {
        let val = 53;
        $("." + obj + "_last_show").show();
        $("." + obj + "_last_hide").hide();
        $('.width-modify').css('top', val + 'px');
    }
    let headerLen = $(".date").closest("tr").find("." + obj + ":visible").length;
    let bodyLen = $(".odd").closest("tr").find("." + obj + ":visible").length;
}

function toggleHeader(month) {
    $("#" + month).attr('colspan', 1);
    $("table tr").each(function () {
        let value = 0;
        let len = $(this).find("." + month + "_head").length;
        let className = $('#' + month).find('i').attr('class');
        $(this).find("." + month + "_head").each(
            function (index) {
                value = value + parseInt($(this).html());
                if (index !== len - 1) {
                    $(this).toggle();
                }
            }
        );
    });
    let length = $("#" + month).closest("tr").next("tr").find("." + month + ":visible").length;
    $('.width-modify').css('z-index', '1');
    $("#" + month).attr("colspan", length);
    if (length == "1") {
        let val = 45;
        $("." + month + "_last_show").hide();
        $("." + month + "_last_hide").show();
        $('.width-modify').css('top', val + 'px');
    } else {
        let val = 60;
        $("." + month + "_last_show").show();
        $("." + month + "_last_hide").hide();
        $('.width-modify').css('top', val + 'px');
    }
}

function cbChanged(checkboxElem) {
    if ($('#all').is(":checked") == true) {
        var ajaxTime = new Date().getTime();
        $('.employee_detail_inside').hide();
        $('.loading_class').show();
        getEmpDataTable(empAllocData);
        var totalTime = new Date().getTime() - ajaxTime;
        $('.employee_detail_inside').show();
        $('.loading_class').hide();
    } else if ($('#all').is(":checked") == false) {
        var ajaxTime = new Date().getTime();
        $('.employee_detail_inside').hide();
        $('.loading_class').show();
        getEmpDataTable(current_data);
        var totalTime = new Date().getTime() - ajaxTime;
        $('.employee_detail_inside').show();
        $('.loading_class').hide();
    }
}


function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

function newReplaceResource() {
    function pad2(n) {
        return (n < 10 ? '0' : '') + n;
    }
    let date = new Date();
    let month = pad2(date.getMonth() + 1);//months (0-11)
    let day = pad2(date.getDate());//day (1-31)
    let year = date.getFullYear();

    let formattedDate = year + "-" + month + "-" + day;
    let today_date = new Date(formattedDate);
    let get_prj_all_start = $('#project_alloc_start_date').val();
    let res_selected_start_date = new Date(get_prj_all_start);

    if (res_selected_start_date <= today_date) {
        bootbox.prompt({
            title: "Please select one option 'New Addition' or 'Replacement Resource' ",
            size: 'small',
            inputType: 'radio',
            inputOptions: [
                {
                    text: 'New Addition',
                    value: 'new',
                },
                {
                    text: 'Replacement',
                    value: 'replace',
                }
            ],
            callback: function (result) {
                if (result == "new") {
                    bootbox.prompt({
                        title: "Delivery manager approved for 'New Addition'?",
                        size: 'small',
                        inputType: 'radio',
                        inputOptions: [
                            {
                                text: 'Not Approved',
                                value: 'notapproved',
                            },
                            {
                                text: 'Approved',
                                value: 'approved',
                            }
                        ],
                        callback: function (result) {
                            if (result == "approved") {
                                createEmpDetails("New Addition");
                            } else if (result == "notapproved") {
                                bootbox.alert("Please get approval from delivery manager for <b>'New Addition'</b>");
                            }
                        }
                    });
                } else if (result == "replace") {
                    bootbox.prompt({
                        title: "Delivery manager approved for 'Replacement'?",
                        size: 'small',
                        inputType: 'radio',
                        inputOptions: [
                            {
                                text: 'Not Approved',
                                value: 'notapproved',
                            },
                            {
                                text: 'Approved',
                                value: 'approved',
                            }
                        ],
                        callback: function (result) {
                            if (result == "approved") {
                                selectReplEmpName();

                            } else if (result == "notapproved") {
                                bootbox.alert("Please get approval from delivery manager for <b>'Replacement'</b>");
                            }
                        }
                    });
                }
            }
        });
    } else {
        createEmpDetails("New Creation");
    }

}

function replacementData() {
    let popEmpNameOptions = "<option class='pop_emp_option' val=''>Select Employee</option>", popClientNameOption = "";
    getEmplyAccount();

    $.each(popupEmployeeArray, function (value, name) {
        popEmpNameOptions += `<option class="pop_emp_option" value="${name.EMPLOYEE_NAME}">${name.EMPLOYEE_NAME}</option>`;
    });
    $.each(popupClientNameArray, function (value, client) {
        popClientNameOption += `<option class="pop_client_option" value="${client.CUSTOMER_NAME}">${client.CUSTOMER_NAME}</option>`;
    });
    $("#repl_new_alloc_employee_name").append(popEmpNameOptions);
    $("#repl_alloc_client").append(popClientNameOption);
    $("#repl_exist_pop_billing_status").append(billingOptions);
    $("#repl_new_pop_billing_status").append(billingOptions);
    $("#repl_new_alloc_employee_name").select2;
    $("#repl_alloc_client").select2;
    $("#repl_exist_pop_billing_status").select2;
    $("#repl_new_pop_billing_status").select2;
    selectReplaceSowName();
}

function selectReplaceSowName() {
    let account_selected = $('#repl_alloc_client').val();
    let sow_name_options = "";
    $.each(popupClientNameArray, function (i, clientName) {
        if (clientName.CUSTOMER_NAME == account_selected) {
            $('#repl_cus_id').val(clientName.CUSTOMER_ID);
            $.each(clientName.SOW_DATA, function (i, sow) {
                updatedSowArray = clientName.SOW_DATA;
                sow_name_options += '<option value="' + sow.SOW_ID + '">' + sow.SOW_NAME + '</option>';
            })
        }
    });
    $("#repl_alloc_sow_name").html(sow_name_options);
    $('#repl_alloc_sow_name').removeAttr("disabled");
    $("#repl_alloc_sow_name").select2();
    getReplSowDetails();
    selectReplNewEmpName();
}

function getReplSowDetails() {
    let sow_id = $('#repl_alloc_sow_name').val();

    $.each(updatedSowArray, function (i, clientName) {
        if (clientName.SOW_ID == sow_id) {
            $("#repl_alloc_sow_id").val(clientName.SOW_ID);
            $("#repl_bill_status").val(clientName.SOW_CODE);
            $("#repl_sow_actual_start_date").val(convert(clientName.LEGAL_START_DATE));
            $("#repl_sow_actual_end_date").val(convert(clientName.LEGAL_END_DATE));
            $("#repl_sow_prob_status").val(clientName.PROBABILITY);
            $("#repl_sow_dynamic_status").val(clientName.DYNAMIC_STATUS);
        }
    });
    let empNewOptions = "";
    $.each(popupCurSowEmpNameArr, function (i, existEmpData) {
        if (existEmpData.SOW_ID == sow_id) {
            $.each(existEmpData.EMP_DATA, function (i, empName) {
                empNewOptions += '<option value="' + empName.EMPLOYEE_NAME + '">' + empName.EMPLOYEE_NAME + '</option>';
            })
            $("#repl_existing_employee_name").append(empNewOptions)
        }
    });

}

function selectReplNewEmpName() {
    let empName_selected = $('#repl_new_alloc_employee_name').val();

    $.each(popupEmployeeArray, function (i, empdata) {

        if (empdata.EMPLOYEE_NAME == empName_selected) {
            $(".alert_not_delivery").hide();
            $("#curr_start_date").val("");
            $("#curr_end_date").val("");
            $("#fur_start_date").val("");
            $("#fur_end_date").val("");
            $("#repl_new_emp_id").val(empdata.EMPLOYEE_ID);
            $("#repl_new_emp_job_role").val(empdata.JOB_ROLE_ID);
            $("#repl_new_end_date").val(empdata.END_DATE);
            $("#repl_new_resource_function").val(empdata.FUNCTION);
            $("#repl_new_notice_period_status").val(empdata.IN_NOTICE_PERIOD);
            $("#repl_new_location").val(empdata.LOCATION);
            let sow_name_options = "";
            let sow_filter_data = [];

            let current_proj_data = empdata.CURRENT_PROJECT;
            let future_proj_data = empdata.FUTURE_PROJECT;
            let clientNameSel = "";
            let sowName = "";
            if (current_proj_data.length > 0) {
                clientNameSel = current_proj_data[0].CUSTOMER_NAME;
                sowName = current_proj_data[0].SOW_ID;
                $("#repl_new_curr_billing_status").val(current_proj_data[0].BILLING_STATUS);
                $("#repl_new_curr_customer_name").val(current_proj_data[0].CUSTOMER_NAME);
                $("#repl_new_curr_probability").val(current_proj_data[0].PROBABILITY);
                $("#repl_new_curr_sow_id").val(current_proj_data[0].SOW_ID);
                $("#repl_new_curr_sow_name").val(current_proj_data[0].SOW_NAME);
                $("#repl_new_curr_start_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_START_DATE));
                $("#repl_new_curr_end_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_END_DATE));
                $("#repl_new_project_alloc_start_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_START_DATE));
                $("#repl_new_project_alloc_end_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_END_DATE));
                $("#sow_prob_status").val(current_proj_data[0].PROBABILITY);
                $("#repl_new_pop_billing_status").val(current_proj_data[0].BILLING_STATUS);
            }
            if (future_proj_data.length > 0) {
                $("#repl_new_fur_billing_status").val(future_proj_data[0].BILLING_STATUS);
                $("#repl_new_fur_customer_name").val(future_proj_data[0].CUSTOMER_NAME);
                $("#repl_new_fur_probability").val(future_proj_data[0].PROBABILITY);
                $("#repl_new_fur_sow_id").val(future_proj_data[0].SOW_ID);
                $("#repl_new_fur_sow_name").val(future_proj_data[0].SOW_NAME);
                $("#repl_new_fur_start_date").val(future_proj_data[0].PROJECT_ALLOCATION_START_DATE);
                $("#repl_new_fur_end_date").val(future_proj_data[0].PROJECT_ALLOCATION_END_DATE);
            }

            $.each(popupClientNameArray, function (i, clientName) {
                if (clientName.CUSTOMER_NAME == clientNameSel) {
                    $('#cus_id').val(clientName.CUSTOMER_ID);
                    sow_filter_data = clientName.SOW_DATA;
                    $.each(clientName.SOW_DATA, function (i, sow) {
                        updatedSowArray = clientName.SOW_DATA;
                        sow_name_options += '<option value="' + sow.SOW_ID + '">' + sow.SOW_NAME + '</option>';
                    })
                }
            });
            if (empdata.IN_NOTICE_PERIOD == "YES") {
                $(".alert_notice").show();
            } else {
                $(".alert_notice").hide();
            }
            let emp_skills = empdata.SKILL_DATA;
            let emp_skill_data = "";

            $.each(emp_skills, function (value, skills) {
                if (skills.SKILL_NAME == "" && skills.LEVEL == "") {
                    emp_skill_data = `<button class="skill_data" disabled>No skills available to show</button><br><br>`
                } else {
                    emp_skill_data += `<button class="skill_data" disabled>${skills.SKILL_NAME} - ${skills.LEVEL}</button>`
                }
            });
            $("#repl_new_key_skill").html(emp_skill_data);
        }
    });
}

function dateFilter() {
    let startDate = new Date($("#startDate").val());
    let endDate = new Date($("#endDate").val());
    let DateFilterData = filterDataJson.filter(a => {
        var JsonStartdate = new Date(a.ALLOCATION_START_DATE);
        var JsonEnddate = new Date(a.ALLOCATION_END_DATE);
        return (JsonStartdate >= startDate && JsonEnddate <= endDate);
    });
    dateFilterDataJson = DateFilterData;
    getEmpDataTable(DateFilterData)
}

function clearDateFilter() {
    $("#startDate").val("");
    $("#endDate").val("");
}
function callMultiselectOption() {
    $('#idSelect').multiselect('reload');
    $('#idSelect').multiselect({
        columns: 1,
        placeholder: 'ID',
        search: true
      });
    $('#nameSelect').multiselect('reload');
    $('#nameSelect').multiselect({
        columns: 1,
        placeholder: 'Name',
        search: true
      });
    $('#desgnSelect').multiselect('reload');
    $('#desgnSelect').multiselect({
        columns: 1,
        placeholder: 'Designation',
        search: true
      });
    $('#sowIdSelect').multiselect('reload');
    $('#sowIdSelect').multiselect({
        columns: 1,
        placeholder: 'SOW ID',
        search: true
      });
    
    $('#clientSelect').multiselect('reload');
    $('#clientSelect').multiselect({
        columns: 1,
        placeholder: 'Account',
        search: true,
        allowClear:true
      });
      
    $('#sowNameSelect').multiselect('reload');
    $('#sowNameSelect').multiselect({
        columns: 1,
        placeholder: 'SOW Name',
        search: true
      });
    $('#billSelect').multiselect('reload');
    $('#billSelect').multiselect({
        columns: 1,
        placeholder: 'Billing',
        search: true
      });
    
}
function reassignFilterOption(selectedFilterCol) {
    let nameSelectFilter = $("#nameSelect").val();
    let clientSelectFilter = $("#clientSelect").val();
    let sowNameSelectFilter = $("#sowNameSelect").val();
    let billSelectFilter = $("#billSelect").val();
    
    let filEmpName = "", filAccName = "", filSowName = "", filBilstatus = "";
    $('#emp_table tbody tr').each(function () {
        filEmpName += $(this).find("td").eq(1).html() + ",";
        filAccName += $(this).find("td").eq(4).html() + ",";
        filSowName += $(this).find("td").eq(5).html() + ",";
        filBilstatus += $(this).find("td").eq(8).html() + ",";
        
    })
    filEmpName = removeDuplicates(filEmpName);
    filAccName = removeDuplicates(filAccName);
    filSowName = removeDuplicates(filSowName);
    filBilstatus = removeDuplicates(filBilstatus);
    
    
    switch (firstSelectFilter) {
        case "nameSelect":
            if(clientSelectFilter == 0){
                $('#clientSelect').empty();
                $("#clientSelect").append(filAccName);
                $('#clientSelect').multiselect('reload');
            }
            if(sowNameSelectFilter == 0){
                $('#sowNameSelect').empty();
                $("#sowNameSelect").append(filSowName);
                $('#sowNameSelect').multiselect('reload');
            }
            if(billSelectFilter == 0){
                $("#billSelect").empty();
                $("#billSelect").append(filBilstatus);
                $('#billSelect').multiselect('reload');
            }
            
            break;
        case "clientSelect":
            if(nameSelectFilter == 0){
                $('#nameSelect').empty();
                $("#nameSelect").append(filEmpName);
                $('#nameSelect').multiselect('reload');
            }
            if(sowNameSelectFilter == 0){
                $('#sowNameSelect').empty();
                $("#sowNameSelect").append(filSowName);
                $('#sowNameSelect').multiselect('reload');
            }
            if(billSelectFilter == 0){
                $("#billSelect").empty();
                $("#billSelect").append(filBilstatus);
                $('#billSelect').multiselect('reload');
            }
            
            break;
        case "sowNameSelect":
            if(nameSelectFilter == 0){
                $('#nameSelect').empty();
                $("#nameSelect").append(filEmpName);
                $('#nameSelect').multiselect('reload');
            }
            if(clientSelectFilter == 0){
                $('#clientSelect').empty();
                $("#clientSelect").append(filAccName);
                $('#clientSelect').multiselect('reload');
            }
            if(billSelectFilter == 0){
                $("#billSelect").empty();
                $("#billSelect").append(filBilstatus);
                $('#billSelect').multiselect('reload');
            }
            
            break;
        case "billSelect":
            if(nameSelectFilter == 0){
                $('#nameSelect').empty();
                $("#nameSelect").append(filEmpName);
                $('#nameSelect').multiselect('reload');
            }
            if(clientSelectFilter == 0){
                $('#clientSelect').empty();
                $("#clientSelect").append(filAccName);
                $('#clientSelect').multiselect('reload');
            }
            if(sowNameSelectFilter == 0){
                $('#sowNameSelect').empty();
                $("#sowNameSelect").append(filSowName);
                $('#sowNameSelect').multiselect('reload');
            }
            
            break;
        
    }
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
        opt += `<option value="${list}">${list}</option>`
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
  function convertToDateString(dateTimeString) {
    // Split the date-time string into date and time parts
    const [datePart] = dateTimeString.split(' ');
  
    return datePart;
  }
