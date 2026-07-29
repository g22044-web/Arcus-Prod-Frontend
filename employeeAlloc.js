// function getEmpData() {
//     var empData = [];
//     let status = "";
//     let endDate = "";
//     $.ajax({
//         // url: "http://192.168.30.155:5000/allemployees",
//         url : "https://rre-api.factspanapps.com:5000/allemployees",
//         type: "POST",
//         dataType: "json",
//         crossDomain: true,
//         format: "json",
//         async: false,
//         success:function(json){
//             jsonData = json
//             empData = jsonData.data.EMPLOYEE_DETAILS.DETAILS;
//             //console.log("jsonData  - ",empData);
//             for (var i=0; i<empData.length; i++) {
//                 if(empData[i].FLAG == 1){
//                     status = "Active";
//                 }else{
//                     status = "Inactive";
//                 }
//                 if(empData[i].END_DATE == "0000-00-00"){
//                     endDate = "";
//                 }else{
//                     endDate = convert(empData[i].END_DATE);
//                 }
//                 var row = $('<tr><td>' + empData[i].EMPLOYEE_ID+ '</td><td>' + 
//                 empData[i].EMPLOYEE_NAME + '</td><td>' + 
//                 empData[i].DESIGNATION + '</td><td>' + 
//                 convert(empData[i].JOIN_DATE) + '</td><td>' + 
//                 endDate + '</td><td>' + 
//                 empData[i].LOCATION_ + '</td><td>' + 
//                 empData[i].FUNCTION_ + '</td><td><span class="'+status.toLowerCase()+'">' + 
//                 status + '</span></td><td><button class="btn btn-info" id="employee_full_details" style="margin: 10px;" onclick="employeeDetails()">View All</button></td></tr>');
//                 $('#emp_table').append(row);
//             }
//             //console.log("EMP data - ",row);
//         },
//         error:function(error){
//             console.log('message Error' + JSON.stringify(error));
//         }  
//     });  
// }


var empAllData = [];
var empAlloc = [];
let empIndData = [];
var empUsData = [];
var skill_data_option = "";
var FilteredNewJson = [];
let empAllocData = [];
let current_data = [];
function getEmpData() {
    var empData = [];
    let status = "";
    let endDate = "";
    $.ajax({
        // url: "https://rre-api.factspanapps.com:5000/app",
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: {
            query_type: "resource_mapping",
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        },
        success: function (data) {
            empAllData = data;
            console.log("empAllData - ",empAllData);
            empAllocData = empAllData[0].RESOURCE_MAPPING_DATA;
            var name = ["CURRENT"];

            current_data = $.grep(empAllocData, function (v) {
                return name.indexOf(v.ALLOCATION_STATUS) > -1;
            });
            console.log("current_data - ", current_data);
            //  getEmpDataTable(empAllocData);
            getEmpDataTable(current_data);
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
console.log(convert("Mon, 11 Nov 2013 00:00:00 GMT"))


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
function getEmpDataTable(emp) {
    // $('#emp_table').DataTable().destroy();
    $('.width-modify-head').remove();
    $('.width-modify').remove();
    // $('.date').remove();
    // dataTable.fnDestroy();
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
    // console.log("emp - ",emp);
    // let emp = empAllocData;
    // console.log("emp - ",emp);
    for (var i = 0; i < emp.length; i++) {
        let weeklyStatus = getWeekDataOfEmp(emp[i].ALLOCATION_START_DATE, emp[i].ALLOCATION_END_DATE);
        // console.log("weeklyStatus - ",weeklyStatus);
        let weekData = "";
        let oneFlag = false;
        let prevMonth = '';
        let newSpan = '';
        $.each(weeklyStatus, function (index, value) {
            newSpan = '';
            if (!oneFlag && value.availability == true) {
                oneFlag = true;
            }
            if (prevMonth !== '' && prevMonth !== value.month) {
                // weekData += "<td class='"+(oneFlag == true ? "emp_active" : "inactive")+" "+prevMonth+" collapse_column new' style='display:none'>"+(oneFlag ? '1' : '0')+"</td>";
                newSpan = "<span class='" + (oneFlag == true ? "emp_active" : "inactive") + " " + prevMonth + " collapse_column new' style='display:none'>" + (oneFlag ? '1' : '0') + "</span>";
                oneFlag = false;
            }
            // console.log("newSpan - "+newSpan);
            prevMonth = value.month;
            weekData += "<td class='" + (value.availability == true ? "emp_active" : "inactive") + " " + value.month + "'>" + (value.availability == true ? "1" : "0") + "</td>"
            if (index === (weeklyStatus.length - 1)) {
                newSpan == "<span class='" + (oneFlag == true ? "emp_active" : "inactive") + " " + value.month + " collapse_column' style='display:none'>" + (oneFlag ? '1' : '0') + "</span>";
            }
        });

        var row = $('<tr><td class="employee_id">' +
            emp[i].EMPLOYEE_ID + '</td><td class="employee_name">' +
            emp[i].EMPLOYEE_NAME + '</td><td class="designation">' +
            emp[i].DESIGNATION + '</td><td class="in_notice_period">' +
            (emp[i].IN_NOTICE_PERIOD == "YES" ? "In Notice Period" : "Active") + '</td><td class="sow_id">' +
            emp[i].SOW_ID + '</td><td class="sow_code">' +
            // emp[i].SOW_CODE + '</td><td class="customer_name">' +
            emp[i].ACCOUNT_NAME + '</td><td class="sow_name">' +
            emp[i].SOW_NAME + '</td><td class="project_allocation_start_date">' +
            convert(emp[i].ALLOCATION_START_DATE) + '</td><td><input type="date" class="form-control proj_alloc_class" id="proj_alloc_end_date" placeholder="Enter End Date" name="proj_alloc_end_date" value="' +
            emp[i].ALLOCATION_END_DATE + '"></td><td class="billing_status ' + (emp[i].BILLING_STATUS == "Billed" ? "bill_active" : "bill_inactive") + '">' +
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
    // $('#emp_table').dataTable({
    //     "pageLength": 50,
    //     // dom: 'Bfrtip',
    //     // buttons: [{
    //     //     extend: "excel", className: "datatableExcel"
    //     //   }]

    //     // "drawCallback": function( settings ) {
    //     //     console.log( 'DataTables has redrawn the table' );           
    //     //     togglefun("Jan");
    //     //     togglefun("Feb");
    //     //     togglefun("Mar");
    //     //     togglefun("Apr");
    //     //     togglefun("May");
    //     //     togglefun("Jun");
    //     //     togglefun("Jul");
    //     //     togglefun("Aug");
    //     //     togglefun("Sep");
    //     //     togglefun("Oct");
    //     //     togglefun("Nov");
    //     //     togglefun("Dec");

    //     // }
    // }).on('page.dt', function () {
    //     console.log("Paging event fired!");
    //     // toggleHeader("Jan");
    //     // toggleHeader("Feb");
    //     // toggleHeader("Mar");
    //     // toggleHeader("Apr");
    //     // toggleHeader("May");
    //     // toggleHeader("Jun");
    //     // toggleHeader("Jul");
    //     // toggleHeader("Aug");
    //     // toggleHeader("Sep");
    //     // toggleHeader("Oct");
    //     // toggleHeader("Nov");
    //     // toggleHeader("Dec");
    //     // $("#pagingResultID").show()
    //     // .html("<b>Paging event fired!</b> ");
    // }
    // ).on('search.dt', function () {
    //     console.log("Search event fired!");
    //     // toggleHeader("Jan");
    //     // toggleHeader("Feb");
    //     // toggleHeader("Mar");
    //     // toggleHeader("Apr");
    //     // toggleHeader("May");
    //     // toggleHeader("Jun");
    //     // toggleHeader("Jul");
    //     // toggleHeader("Aug");
    //     // toggleHeader("Sep");
    //     // toggleHeader("Oct");
    //     // toggleHeader("Nov");
    //     // toggleHeader("Dec");
    //     // togglefun("Jan");
    //     // togglefun("Feb");
    //     // togglefun("Mar");
    //     // togglefun("Apr");
    //     // togglefun("May");
    //     // togglefun("Jun");
    //     // togglefun("Jul");
    //     // togglefun("Aug");
    //     // togglefun("Sep");
    //     // togglefun("Oct");
    //     // togglefun("Nov");
    //     // togglefun("Dec");
    //     // toggleHeader("Jan");
    //     // toggleHeader("Feb");
    //     // toggleHeader("Mar");
    //     // toggleHeader("Apr");
    //     // toggleHeader("May");
    //     // toggleHeader("Jun");
    //     // toggleHeader("Jul");
    //     // toggleHeader("Aug");
    //     // toggleHeader("Sep");
    //     // toggleHeader("Oct");
    //     // toggleHeader("Nov");
    //     // toggleHeader("Dec");
    //     // $("#pagingResultID").show()
    //     // .html("<b>Paging event fired!</b> ");
    // }
    // );

    // $(".proj_alloc_class").change(function(){
    //     alert("The text has been changed.");
    //   });

    // $('.proj_alloc_class').datepicker({
    //     format: 'mm-dd-yy',
    //     uiLibrary: 'bootstrap'
    //   });



    // $("#jobSelect").append(jobNameOptions);
    // $("#repMangSelect").append(managerOptions);
    // $("#locatSelect").append(`<option class="emp_option" value="INDIA">INDIA</option><option class="emp_option" value="US">US</option>`);
    // $("#funSelect").append(functionOptions);
    // $("#custSelect").append(custNameOptions);
    // $("#billSelect").append(billingOptions);
    // var table = $('#emp_table').DataTable();
    $('#emp_table tbody').on('change', '.proj_alloc_class', function () {
        // $('input[name=proj_alloc_end_date]').change(function()
        {
            // var date = $(this).val();
            // console.log("date - "+date); 
            var $tr = $(this).closest('tr');
            let employee_id = $tr.find('.employee_id').text();
            let employee_name = $tr.find('.employee_name').text();
            let designation = $tr.find('.designation').text();
            // let in_notice_period = $tr.find('.in_notice_period').text();
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
                console.log("selectedEndDate - " + selectedEndDate + " endDate - " + endDate);
                console.log("The end date is beyond project end date");
                // toastr.options.timeOut = 5000; // 2s
                // toastr.success('Resource can only be allocated till '+convert(endDate));
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
                console.log("selectStartDate - " + project_allocation_start_date + " selectedEndDate - " + selectedEndDate);
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
                console.log("selectedEndDate - " + selectedEndDate + " endDate - " + endDate);
                console.log("The end date is below project end date");
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
                    // url: "https://rre-api.factspanapps.com:5000/app",
                    url: apiValue.url,
                    type: "POST",
                    dataType: "json",
                    crossDomain: true,
                    format: "json",
                    async: false,
                    mode: 'no-cors',
                    data: employee_data,
                    success: function (data) {
                        console.log("data - ", data);
                        toastr.options.timeOut = 2000; // 2s
                        // toastr.success('Updated successfully');
                        let projectDetails = data.NEXT_PROJECT[0];
                        console.log("projectDetails - ", projectDetails);
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


            // console.log("employee_id - "+employee_id);
            // console.log("employee_name - "+employee_name);
        }
    });
}



function appendOptionData() {
    let filterData = empAllData[0];
    // console.log("filterData - ",filterData);
    empNameArray = filterData.EMPLOYEE_NAME;
    for (let i = 0; i < empNameArray.length; i++) {
        empNameOptions += `<option class="emp_option" value="${empNameArray[i]}">${empNameArray[i]}</option>`;
    }
    // console.log("empNameOptions - ",empNameOptions);
    empIdArray = filterData.EMPLOYEE_ID;
    for (let i = 0; i < empIdArray.length; i++) {
        empIdOptions += `<option class="emp_option" value="${empIdArray[i]}">${empIdArray[i]}</option>`;
    }
    desgnArray = filterData.DESIGNATION;
    for (let i = 0; i < desgnArray.length; i++) {
        desgnOptions += `<option class="emp_option" value="${desgnArray[i]}">${desgnArray[i]}</option>`;
    }
    // statusArray = filterData.US_MANG;
    sowIDArray = filterData.SOW_ID;
    for (let i = 0; i < sowIDArray.length; i++) {
        sowIDOptions += `<option class="emp_option" value="${sowIDArray[i]}">${sowIDArray[i]}</option>`;
    }
    // sowCodeArray = filterData.SOW_CODE;
    // for (let i = 0; i < sowCodeArray.length; i++) {
    //     sowCodeOptions += `<option class="emp_option" value="${sowCodeArray[i]}">${sowCodeArray[i]}</option>`;
    // }
    clientArray = filterData.ACCOUNT_NAME;
    for (let i = 0; i < clientArray.length; i++) {
        clientOptions += `<option class="emp_option" value="${clientArray[i]}">${clientArray[i]}</option>`;
    }
    sowNameArray = filterData.SOW_NAME;
    for (let i = 0; i < sowNameArray.length; i++) {
        sowNameOptions += `<option class="emp_option" value="${sowNameArray[i]}">${sowNameArray[i]}</option>`;
    }
    billingArray = filterData.BILLING_STATUS;
    for (let i = 0; i < billingArray.length; i++) {
        billingOptions += `<option class="emp_option" value="${billingArray[i]}">${billingArray[i]}</option>`;
    }
    $("#idSelect").append(empIdOptions);
    $("#nameSelect").append(empNameOptions);
    $("#desgnSelect").append(desgnOptions);
    // $("#statusSelect").append(empNameOptions);
    $("#sowIdSelect").append(sowIDOptions);
    // $("#sowCodeSelect").append(sowCodeOptions);
    $("#clientSelect").append(clientOptions);
    $("#sowNameSelect").append(sowNameOptions);
    $("#billSelect").append(billingOptions);
    // $("#locationSelect").append(empNameOptions);
    // filterWeekStatus();
}



$(function () {
    console.log("Checking..........");
    $("#idSelect").change(function () {
        console.log("sort.........");
        filterData();

    });

    $("#nameSelect").change(function () {
        console.log("sort.........");
        filterData();
    });

    $("#desgnSelect").change(function () {
        filterData();
    });

    $("#statusSelect").change(function () {
        filterData();
    });
    $("#sowIdSelect").change(function () {
        filterData();
    });
    // $("#sowCodeSelect").change(function () {
    //     filterData();
    // });
    $("#clientSelect").change(function () {
        filterData();
    });
    $("#sowNameSelect").change(function () {
        filterData();
    });
    $("#billSelect").change(function () {
        filterData();
    });
    $("#locationSelect").change(function () {
        filterData();
    });

    $('.proj_alloc_class').change(function () {
        var date = $(this).val();
        console.log(date, 'change');
    });
});

function filterData() {
    const idSelectFilter = $("#idSelect").val();
    const nameSelectFilter = $("#nameSelect").val();
    const desgnSelectFilter = $("#desgnSelect").val();
    const statusSelectFilter = $("#statusSelect").val();
    const sowIdSelectFilter = $("#sowIdSelect").val();
    // const sowCodeSelectFilter = $("#sowCodeSelect").val();
    const clientSelectFilter = $("#clientSelect").val();
    const sowNameSelectFilter = $("#sowNameSelect").val();
    const billSelectFilter = $("#billSelect").val();
    const locationSelectFilter = $("#locationSelect").val();
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    let newJson = current_data;
    if ($('#all').is(":checked") == true) {
        var ajaxTime = new Date().getTime();
        console.log("Started - " + ajaxTime);
        $('.employee_detail_inside').hide();
        $('.loading_class').show();
        console.log("That box was checked.");
        // $('#all').prop('disabled', true);
        getEmpDataTable(empAllocData);
        var totalTime = new Date().getTime() - ajaxTime;
        console.log("Ended - " + millisToMinutesAndSeconds(totalTime));
        $('.employee_detail_inside').show();
        $('.loading_class').hide();
    } else if ($('#all').is(":checked") == false) {
        var ajaxTime = new Date().getTime();
        console.log("Started - " + ajaxTime);
        $('.employee_detail_inside').hide();
        $('.loading_class').show();
        console.log("That box was unchecked.");
        getEmpDataTable(current_data);
        // $('#all').prop('disabled', false);
        var totalTime = new Date().getTime() - ajaxTime;
        console.log("Ended - " + millisToMinutesAndSeconds(totalTime));
        $('.employee_detail_inside').show();
        $('.loading_class').hide();
    }
    if (idSelectFilter.length > 0) {
        newJson = newJson.filter(d => {
            const obj = idSelectFilter.find(f => d.EMPLOYEE_ID == f);
            return obj ? true : false;
        })
    }
    if (nameSelectFilter.length > 0) {
        newJson = newJson.filter(d => {
            const obj = nameSelectFilter.find(f => d.EMPLOYEE_NAME == f);
            return obj ? true : false;
        })
    }
    if (desgnSelectFilter.length > 0) {
        newJson = newJson.filter(d => {
            const obj = desgnSelectFilter.find(f => d.DESIGNATION == f);
            return obj ? true : false;
        })
    }
    if (statusSelectFilter.length > 0) {
        newJson = newJson.filter(d => {
            const obj = statusSelectFilter.find(f => d.IN_NOTICE_PERIOD == f);
            return obj ? true : false;
        })
    }
    if (sowIdSelectFilter.length > 0) {
        newJson = newJson.filter(d => {
            const obj = sowIdSelectFilter.find(f => d.SOW_ID == f);
            return obj ? true : false;
        })
    }
    // if (sowCodeSelectFilter.length > 0) {
    //     newJson = newJson.filter(d => {
    //         const obj = sowCodeSelectFilter.find(f => d.SOW_CODE == f);
    //         return obj ? true : false;
    //     })
    // }
    if (clientSelectFilter.length > 0) {
        newJson = newJson.filter(d => {
            const obj = clientSelectFilter.find(f => d.CUSTOMER_NAME == f);
            return obj ? true : false;
        })
    }
    if (sowNameSelectFilter.length > 0) {
        newJson = newJson.filter(d => {
            const obj = sowNameSelectFilter.find(f => d.SOW_NAME == f);
            return obj ? true : false;
        })
    }
    if (billSelectFilter.length > 0) {
        newJson = newJson.filter(d => {
            const obj = billSelectFilter.find(f => d.BILLING_STATUS == f);
            return obj ? true : false;
        })
    }
    if (locationSelectFilter.length > 0) {
        newJson = newJson.filter(d => {
            const obj = locationSelectFilter.find(f => d.LOCATION == f);
            return obj ? true : false;
        })
    }
    var ajaxTime = new Date().getTime();
    console.log("Started - " + ajaxTime);
    $('.employee_detail_inside').hide();
    getEmpDataTable(newJson);
    var totalTime = new Date().getTime() - ajaxTime;
    console.log("Ended - " + millisToMinutesAndSeconds(totalTime));
    $('.employee_detail_inside').show();
    // newJson

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
            // url: "https://rre-api.factspanapps.com:5000/app",
            url: apiValue.url,
            type: "POST",
            dataType: "json",
            crossDomain: true,
            format: "json",
            async: false,
            mode: 'no-cors',
            data: {
                query_type: "all_resource_details",
                "db_name": apiValue.db_name,
                "environment": apiValue.environment
            },
            success: function (data) {
                console.log("data - ", data);
                popupEmployeeArray = data[0].EMPLOYEE_DETAILS.sort(GetSortOrder("EMPLOYEE_NAME"));;
                // popupClientNameArray = data[0].SOW_DETAILS;
                popupClientNameArray = data[0].SOW_DETAILS_NEW;
                popupCurSowEmpNameArr = data[0].CURRENT_DATA;
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
        // console.log("name - "+name.EMPLOYEE_NAME);
        popEmpNameOptions += `<option class="pop_emp_option" value="${name.EMPLOYEE_NAME}">${name.EMPLOYEE_NAME}</option>`;
    });
    $.each(popupClientNameArray, function (value, client) {
        popClientNameOption += `<option class="pop_client_option" value="${client.CUSTOMER_NAME}">${client.CUSTOMER_NAME}</option>`;
    });
    $("#alloc_employee_name").append(popEmpNameOptions);
    $("#alloc_client").append(popClientNameOption);
    $("#repl_alloc_employee_name").append(popEmpNameOptions);
    // console.log("popEmpNameOptions - "+popEmpNameOptions);
    // console.log("popClientNameOption - "+popClientNameOption);
    selectEmpName();
    // selectSowName();
    // getSowDetails();
    // $('#alloc_employee_name').selectize({
    //     sortField: 'text'
    // });

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
                console.log("sow - ", sow);
                sow_name_options += '<option value="' + sow.SOW_ID + '">' + sow.SOW_NAME + '</option>';
            })
        }
    });
    // console.log("sow_names - " + sow_names);
    $("#alloc_sow_name").html(sow_name_options);
    $('#alloc_sow_name').removeAttr("disabled");
    getSowDetails("");
    $("#alloc_sow_name").select2();
}

function getSowDetails(obj) {
    let defaultName = obj;
    console.log("defaultName - " + defaultName);
    let sow_id = $('#alloc_sow_name').val();
    if (defaultName == "999999") {
        $("#alloc_sow_id").val("");
        $("#alloc_sow_code").val("");
        $("#project_alloc_start_date").val("");
        $("#project_alloc_end_date").val("");
        $("#sow_prob_status").val("");
    } else {
        // console.log("updatedSowArray - ", updatedSowArray);
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
                // $.each(updatedSowArray.SOW_ID, function (i, sowData) {
                // console.log("sowData - ",sowData);
                $("#alloc_sow_id").val(clientName.SOW_ID);
                $("#alloc_sow_code").val(clientName.SOW_CODE);
                let sow_details = clientName.DETAILS;
                console.log("sow_details len - ", sow_details.length);
                console.log("sow_details len - ", sow_details);
                $.each(sow_details, function (i, sowStatusData) {
                    console.log("sowStatusData - ", sowStatusData.SOW_DYNAMIC_STATUS);
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
                    if(sowStatusData.SOW_DYNAMIC_STATUS == "Active"){
                        $("#project_alloc_start_date").val(convert(sowStatusData.ACTUAL_START_DATE));
                        $("#project_alloc_end_date").val(convert(sowStatusData.ACTUAL_END_DATE));
                        return false;
                    }else if (sowStatusData.SOW_DYNAMIC_STATUS == "Planned") {
                        $("#project_alloc_start_date").val(convert(sowStatusData.ACTUAL_START_DATE));
                        $("#project_alloc_end_date").val(convert(sowStatusData.ACTUAL_END_DATE));
                    }else if (sowStatusData.SOW_DYNAMIC_STATUS == "OLD") {
                        $("#project_alloc_start_date").val(convert(sowStatusData.ACTUAL_START_DATE));
                        $("#project_alloc_end_date").val(convert(sowStatusData.ACTUAL_END_DATE));
                    }
                });
                // $("#project_alloc_start_date").val(convert(clientName.LEGAL_START_DATE));
                // $("#project_alloc_end_date").val(convert(clientName.LEGAL_END_DATE));
                $("#sow_prob_status").val(clientName.PROBABILITY);
                $("#selected_sow_start_date").val(clientName.LEGAL_START_DATE);
                $("#selected_sow_end_date").val(clientName.LEGAL_END_DATE);
                $("#selected_dynamic_status").val(clientName.DYNAMIC_STATUS);
                $("#selected_probability").val(clientName.PROBABILITY);
                // })
            }
        });
        // $("#pop_billing_status").html("");
        let prob_val = $("#sow_prob_status").val();
        // if (prob_val == "100%" || prob_val == "70%") {
        //     $("#pop_billing_status").append(billingOptions);
        //     console.log("ALL");
        // } else {
        //     console.log("Only one");
        //     $("#pop_billing_status").append('<option class="emp_option" value="Investment">Investment</option>');
        // }
    }
    $("#pop_billing_status").select2();
}

function selectEmpName() {
    let empName_selected = $('#alloc_employee_name').val();
    // console.log("current_data_Array - ",current_data);
    // $.each(popupEmployeeArray, function (i, clientName) {
    //     if (clientName.EMPLOYEE_NAME == empName_selected) {
    //         $("#alloc_employee_id").val(clientName.EMPLOYEE_ID);
    //         $("#alloc_designation").val(clientName.JOB_ROLE_ID);
    //         $("#pop_location").val(clientName.LOCATION)
    //         // $.each(clientName.SOW_DATA, function (i, sow) {
    //         //     console.log("sow - ",sow);
    //         //     sow_name_options += '<option value="' + sow.SOW_NAME + '">' + sow.SOW_NAME + '</option>';
    //         // })
    //     }
    // });
    let empStatus = false;
    // $.each(current_data, function (i, allData) {
    //     if (allData.EMPLOYEE_NAME == empName_selected) {
    //         empStatus = true;
    //         $("#curr_start_date").val("");
    //         $("#curr_end_date").val("");
    //         $("#fur_start_date").val("");
    //         $("#fur_end_date").val("");
    //         $("#alloc_employee_id").val(allData.EMPLOYEE_ID);
    //         $("#alloc_designation").val(allData.DESIGNATION);
    //         $("#pop_location").val(allData.LOCATION);
    //         $("#alloc_client").val(allData.CUSTOMER_NAME);
    //         $("#end_date").val(allData.END_DATE);
    //         $("#alloc_client").select2();
    //         let sow_name_options = "";
    //         let sow_filter_data = [];
    //         $.each(popupClientNameArray, function (i, clientName) {
    //             if (clientName.CUSTOMER_NAME == allData.CUSTOMER_NAME) {
    //                 $('#cus_id').val(clientName.CUSTOMER_ID);
    //                 sow_filter_data = clientName.SOW_DATA;
    //                 $.each(clientName.SOW_DATA, function (i, sow) {
    //                     updatedSowArray = clientName.SOW_DATA;
    //                     console.log("sow data- ",sow);
    //                     sow_name_options += '<option value="' + sow.SOW_ID + '">' + sow.SOW_NAME + '</option>';
    //                 })
    //             }
    //         });
    //         console.log("sow_filter_data - ",sow_filter_data);
    //         // console.log("sow_names - " + sow_names);
    //         $("#alloc_sow_name").html(sow_name_options);
    //         $('#alloc_sow_name').removeAttr("disabled");
    //         $("#alloc_sow_name").val(allData.SOW_ID);
    //         $("#alloc_sow_name").select2();
    //         $("#cus_id").val(allData.CUSTOMER_ID);
    //         $("#alloc_sow_id").val(allData.SOW_ID);
    //         $("#alloc_sow_code").val(allData.SOW_CODE);

    //         // $.each(sow_filter_data, function(i, sowdetails){
    //         //     if(sowdetails.SOW_ID == allData.SOW_ID){
    //         //         $("#sel_prob_status").val(sowdetails.PROBABILITY);
    //         //     }
    //         // })
    //         $("#project_alloc_start_date").val(convert(allData.PROJECT_ALLOCATION_START_DATE));
    //         $("#project_alloc_end_date").val(convert(allData.PROJECT_ALLOCATION_END_DATE));
    //         console.log("allData.PROJECT_ALLOCATION_END_DATE - ",allData.PROJECT_ALLOCATION_END_DATE);
    //         $("#actual_date").val(allData.ACTUAL_END_DATE);

    //         $.each(clientName.SOW_DATA, function (i, sow) {
    //             console.log("sow - ",sow);
    //             sow_name_options += '<option value="' + sow.SOW_NAME + '">' + sow.SOW_NAME + '</option>';
    //         })            
    //     }

    //     // selectSowName();
    //     $("#alloc_employee_name").select2();

    //     // $("#alloc_sow_name").select2();
    //     $("#pop_billing_status").select2();
    // });
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
            // $("#last_probability").val(empdata.);
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
                // $("#actual_date").val(allData.ACTUAL_END_DATE);
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
                // sowName = current_proj_data[0].SOW_ID;
                // $("#curr_billing_status").val(current_proj_data[0].BILLING_STATUS);
                // $("#curr_customer_name").val(current_proj_data[0].CUSTOMER_NAME);
                // $("#curr_probability").val(current_proj_data[0].PROBABILITY);
                // $("#curr_sow_id").val(current_proj_data[0].SOW_ID);
                // $("#curr_sow_name").val(current_proj_data[0].SOW_NAME);
                // $("#curr_start_date").val(current_proj_data[0].PROJECT_ALLOCATION_START_DATE);
                // $("#curr_end_date").val(current_proj_data[0].PROJECT_ALLOCATION_END_DATE);
                // $("#project_alloc_start_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_START_DATE));
                // $("#project_alloc_end_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_END_DATE));
                // // $("#actual_date").val(allData.ACTUAL_END_DATE);
                // $("#actual_date").val(current_proj_data[0].PROJECT_ALLOCATION_END_DATE);
                // $("#sow_prob_status").val(current_proj_data[0].PROBABILITY);
                // $("#pop_billing_status").val(current_proj_data[0].BILLING_STATUS);

                // $("#cus_id").val(current_proj_data[0].CUSTOMER_ID);
                // $("#alloc_sow_id").val(current_proj_data[0].SOW_ID);
                // $("#alloc_sow_code").val(current_proj_data[0].SOW_CODE);
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
                        console.log("sow data- ", sow);
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
                    // $.each(updatedSowArray.SOW_ID, function (i, sowData) {
                    // console.log("sowData - ",sowData);
                    $("#alloc_sow_id").val(clientName.SOW_ID);
                    $("#alloc_sow_code").val(clientName.SOW_CODE);
                    let sow_details = clientName.DETAILS;
                    console.log("sow_details len - ", sow_details.length);
                    console.log("sow_details len - ", sow_details);
                    $.each(sow_details, function (i, sowStatusData) {
                        console.log("sowStatusData - ", sowStatusData.SOW_DYNAMIC_STATUS);
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
                    // $.each(sow_details, function (i, sowStatusData) {
                    //     if(sowStatusData.SOW_DYNAMIC_STATUS == "Active"){
                    //         $("#project_alloc_start_date").val(convert(sowStatusData.ACTUAL_START_DATE));
                    //         $("#project_alloc_end_date").val(convert(sowStatusData.ACTUAL_END_DATE));
                    //         return false;
                    //     }else if (sowStatusData.SOW_DYNAMIC_STATUS == "Planned") {
                    //         $("#project_alloc_start_date").val(convert(sowStatusData.ACTUAL_START_DATE));
                    //         $("#project_alloc_end_date").val(convert(sowStatusData.ACTUAL_END_DATE));
                    //     }else if (sowStatusData.SOW_DYNAMIC_STATUS == "OLD") {
                    //         $("#project_alloc_start_date").val(convert(sowStatusData.ACTUAL_START_DATE));
                    //         $("#project_alloc_end_date").val(convert(sowStatusData.ACTUAL_END_DATE));
                    //     }
                    // });
                    // $("#project_alloc_start_date").val(convert(clientName.LEGAL_START_DATE));
                    // $("#project_alloc_end_date").val(convert(clientName.LEGAL_END_DATE));
                    $("#sow_prob_status").val(clientName.PROBABILITY);
                    $("#selected_sow_start_date").val(clientName.LEGAL_START_DATE);
                    $("#selected_sow_end_date").val(clientName.LEGAL_END_DATE);
                    $("#selected_dynamic_status").val(clientName.DYNAMIC_STATUS);
                    $("#selected_probability").val(clientName.PROBABILITY);
                    // })
                }
            });
            console.log("sow_filter_data - ", sow_filter_data);
            // console.log("sow_names - " + sow_names);
            $("#alloc_sow_name").html(sow_name_options);
            $('#alloc_sow_name').removeAttr("disabled");
            if (sowName == "") {
                sowName = "999999";
            }
            $("#alloc_sow_name").val(sowName);
            $("#end_date").val(empdata.END_DATE);
            $("#alloc_client").select2();
            $("#alloc_sow_name").select2();


            // $.each(sow_filter_data, function(i, sowdetails){
            //     if(sowdetails.SOW_ID == allData.SOW_ID){
            //         $("#sel_prob_status").val(sowdetails.PROBABILITY);
            //     }
            // })
            // console.log("allData.PROJECT_ALLOCATION_END_DATE - ", allData.PROJECT_ALLOCATION_END_DATE);


            //alert_notice
            if (empdata.IN_NOTICE_PERIOD == "YES") {
                $(".alert_notice").show();
            } else {
                $(".alert_notice").hide();
            }
            console.log("empdata - ", empdata);
            let emp_skills = empdata.SKILL_DATA;
            console.log("emp_skills - ", emp_skills);
            let emp_skill_data = "";

            $.each(emp_skills, function (value, skills) {
                // mang_name_options_sow += '<option value="' + mangName.REPORTING_MANAGER_ID + '">' + mangName.REPORTING_MANAGER_NAME + '</option>';
                if (skills.SKILL_NAME == "" && skills.LEVEL == "") {
                    emp_skill_data = `<button class="skill_data" disabled>No skills available to show</button><br><br>`
                } else {
                    emp_skill_data += `<button class="skill_data" disabled>${skills.SKILL_NAME} - ${skills.LEVEL}</button>`
                }
                // emp_skill_hide_data += `${skills.SKILL} ${skills.LEVEL}, `
            });
            // console.log("emp_skill_data - ",emp_skill_data);
            $("#key_skill").html(emp_skill_data);
            // console.log("curr_start_date - ",$("#curr_start_date").val());
        }
    });
    let prob_val = $("#sow_prob_status").val();
    // if (prob_val == "100%" || prob_val == "70%") {
    //     $("#pop_billing_status").append(billingOptions);
    //     console.log("ALL");
    // } else {
    //     console.log("Only one");
    //     $("#pop_billing_status").append('<option class="emp_option" value="Investment">Investment</option>');
    // }

    $("#pop_billing_status").select2();
    $("#alloc_employee_name").select2();

    // $("#alloc_sow_name").select2();
    // $("#pop_billing_status").select2();
    // console.log("sow_names - " + sow_names);
    // $("#alloc_sow_name").html(sow_name_options);
    // $('#alloc_sow_name').removeAttr("disabled")
}

function selectReplEmpName() {
    console.log("Selected Replacement Employee");
    $("#replace_employee_div").show();
}


function createEmpDetails(obj) {
    console.log("obj - " + obj);
    function pad2(n) {
        return (n < 10 ? '0' : '') + n;
    }

    var date = new Date();
    var month = pad2(date.getMonth() + 1);//months (0-11)
    var day = pad2(date.getDate());//day (1-31)
    var year = date.getFullYear();

    var formattedDate = year + "-" + month + "-" + day;
    console.log(formattedDate); //2021-02-28

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
            console.log("current_status - "+current_status);
            if(current_status == ''){
                current_status = $('#planned_sow_dynamic_status').val();
            }
            if(current_status != ''){
                
            }else{
                bootbox.alert("Cannot assign resources to <b>Old Projects</b>, Please select 'Active' projects");
            }

        } else {

            //Verifying future start date and future end date 
            if (fur_start_date != "" && fur_end_date != "") {
                // if(fur_billing_status == "Use Bench" || fur_billing_status == "Bench"){
                //future end date is less than new project start date
                if (res_fur_end_date > res_selected_start_date) {
                    console.log("fur_end_date - " + fur_end_date + " get_prj_all_start - " + get_prj_all_start);
                    console.log("not allowed");
                    bootbox.alert("<b>" + get_name + "</b> is already allocated to Account - <b></i>" + get_client + "</i></b> and Sow Name - <b></i>" + get_sow_name + "</i></b><br> From - <b></i>" + convert(fur_start_date) + "</i></b> To - <b></i>" + convert(fur_end_date) + "</i></b>");
                    return false;
                } else {
                    console.log("fur_end_date - " + fur_end_date + " get_prj_all_start - " + get_prj_all_start);
                    console.log("allowed");
                    //Verifing future billing status is not "Use Bench" then allow users to create
                    if (fur_billing_status == "Use Bench" || fur_billing_status == "Bench") {
                        furture_date_flag = true;
                    } else {
                        console.log("Billing status is not 'Use Bench' or 'Bench'");
                        bootbox.alert("<b>" + get_name + "</b> is already allocated to Account - <b></i>" + fur_customer_name + "</i></b>, Sow Name - <b></i>" + fur_sow_name + "</i></b> and future billing status is <b>'" + fur_billing_status + "'</b> cannot be resigned");
                        return false;
                    }
                    billing_flag = true;
                }
                // }else{
                //     console.log("Future billing is not use bench or bench");
                //     // furture_date_flag = true;
                //     // billing_flag = true;
                // }
            } else {
                console.log("no future value");
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
            console.log("start_date - " + start_date);
            let end_date = new Date(get_prj_all_end).toLocaleDateString('fr-CA');
            console.log("end_date - " + end_date);
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
                // "query_type": "add_resource_mapping",
                "query_type": "create_resource_mapping",
                "environment": apiValue.environment,
                "confirm": "no",
                // "new_record": "[" + new_record + "]"
                "edited_record": "[" + new_record + "]"
            }
            console.log("create_emp_data - ", create_emp_data);

            $.ajax({
                // url: "https://rre-api.factspanapps.com:5000/app",
                url: apiValue.url,
                type: "POST",
                dataType: "json",
                crossDomain: true,
                format: "json",
                async: false,
                mode: 'no-cors',
                data: create_emp_data,
                success: function (data) {
                    console.log("data - ", data);
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
    var fromDate = '01-10-2022', toDate = '07-10-2022';
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);
    var currentYear = moment().year();
    var startDate = moment().month(0).date(1).hour(0).minute(0).second(0);
    startDate.add(getremainingDays(startDate.day()), 'day');
    var dates = [];
    while (startDate.year() === currentYear) {
        dates.push({ dateStr: startDate.format('DD-MM-YYYY'), availability: fromDate < startDate.toDate() && toDate > startDate.toDate(), month: startDate.format('MMM') });
        headerDate.push(startDate.format('DD-MM-YYYY'));
        startDate.add(1, 'weeks');
    }
    console.log(dates);
    console.log(headerDate);

    let monthList = [];
    // console.log("All Cmpy Us Ind - ",data);
    for (var j = 0; j < dates.length; j++) {
        let date = getMonth(dates[j].dateStr);
        monthList.push(date);
    }
    monthList = $.grep(monthList, function (n) { return n == 0 || n });
    console.log("monthList - " + monthList.length);

    map = monthList.reduce(function (prev, cur) {
        prev[cur] = (prev[cur] || 0) + 1;
        return prev;
    }, {});
    console.log("map - ", JSON.stringify(map));
    let monthHeader = ['Jan-22', 'Feb-22', 'Mar-22', 'Apr-22', 'May-22', 'Jun-22', 'Jul-22', 'Aug-22', 'Sep-22', 'Oct-22', 'Nov-22', 'Dec-22'];
    let month = "";
    let date = "";
    let headValue = 0;
    for (var key in map) {
        // console.log("Key - " + key);
        // console.log("map[key] - " + map[key]);
        $.each(monthHeader, function (i, monthvalue) {
            if (key == monthvalue.slice(0, 3)) {
                // $(".month").append("<th class='width-modify-head' colspan=" + map[key] + " id=" + key + ">" + monthvalue.replace("-", " ") + "<i class='fas fa-angle-double-left' style='color: #e96e31;'></i></th>");
                $(".month").append("<th class='width-modify-head' colspan=" + map[key] + " id=" + key + " onClick='togglefun(\"" + key + "\")'>" + monthvalue.replace("-", " ") + "<i class='fas fa-angle-double-left' style='color: #e96e31;'></i></th>");
                // month = month + "<th class='width-modify-head' colspan=" + map[key] + " id=" + key + " onClick='togglefun(\"" + key + "\")'>" + monthvalue.replace("-", " ") + "<i class='fas fa-angle-double-left' style='color: #e96e31;'></i></th>";
            }

        });

        // if (obj == "2021") {
        //     $("#month").append("<th class='width-modify-head' colspan=" + map[key] + " id=" + key + " onClick='togglefun(\"" + key + "\")'>" + key + " 21 <i class='fas fa-angle-double-left' style='color: #e96e31;'></i></th>");
        // } else if (obj == "2022") {
        //     $("#month").append("<th class='width-modify-head' colspan=" + map[key] + " id=" + key + " onClick='togglefun(\"" + key + "\")'>" + key + " 22 <i class='fas fa-angle-double-left' style='color: #e96e31;'></i></th>");
        // }

        for (let k = 1; k <= map[key]; k++) {
            headValue = headValue + 1;
            // console.log("headValue - "+headValue);
            // $("#date").append("<th class='" + key + " width-modify'>Total</th>");
            if (k == map[key]) {
                $(".date").append("<th class='" + key + " width-modify " + key + "_head'><span class='" + key + "_last_hide' style='display:none'></span><span id='week_header_" + headValue + "' class='" + key + "_last_show'>Week " + k + "</span></th>");
            } else {
                $(".date").append("<th id='week_header_" + headValue + "' class='" + key + " width-modify " + key + "_head'>Week " + k + "</th>");
                // date = date + "<th class='" + key + " width-modify'>Week " + k + "</th>";
            }
        }
    }
    for (let j = 0; j < headerDate.length; j++) {
        $('#week_header_' + (j + 1)).prop('title', headerDate[j]);
        // console.log("monthList[j] - "+headerDate[j]);
    }
    // console.log("month - "+month);
    // console.log("date - "+date);

}

function getMonth(str) {
    if (str.indexOf('-') > -1) {
        // return true;
        var dateStr = str.split('-'),
            dateMM = dateStr[1],
            dateDD = dateStr[0],
            dateYY = dateStr[2];
        // if(dateMM == "2022"){
        //     dateMM = dateStr[1];
        // }
        // console.log("dateMM - "+dateMM);
        function GetMonthName(monthNumber) {

            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months[monthNumber - 1];

        }
        if (dateStr.length > 2) {
            return GetMonthName(dateMM);
        } else {
            // return false;
            return dateMM;
        }
        // console.log("Get Month - "+GetMonthName(dateMM));
    } else {
        // return false;
        return str;
    }
}

function getWeekDataOfEmp(fromDate, toDate) {
    // var fromDate = '01-10-2022', toDate = '07-10-2022';
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);
    var currentYear = moment().year();
    var startDate = moment().month(0).date(1).hour(0).minute(0).second(0);
    startDate.add(getremainingDays(startDate.day()), 'day');
    var dates = [];
    while (startDate.year() === currentYear) {
        dates.push({ dateStr: startDate.format('DD-MM-YYYY'), availability: fromDate < startDate.toDate() && toDate > startDate.toDate(), month: startDate.format('MMM') });
        startDate.add(1, 'weeks');
    }
    //console.log(dates);
    return dates;
}

function togglefun(obj) {
    console.log("Toggle function");
    $("table tr").each(function () {
        let value = 0;
        let len = $(this).find("." + obj).length;
        let className = $('#' + obj).find('i').attr('class');
        // console.log("className - "+className);
        $(this).find("." + obj).each(
            function (index) {
                value = value + parseInt($(this).html());
                // console.log("value - "+value);
                if (index !== len - 1) {
                    $(this).toggle();
                }
            }
        );
    });
    $("#" + obj).find('i').toggleClass('fa-angle-double-right fa-angle-double-left');

    let length = $("#" + obj).closest("tr").next("tr").find("." + obj + ":visible").length;
    // console.log("len - ",length);
    $('.width-modify').css('z-index', '1000');
    $("#" + obj).attr("colspan", length);
    if (length == "1") {
        let val = 45;
        $("." + obj + "_last_show").hide();
        $("." + obj + "_last_hide").show();
        $('.width-modify').css('top', val + 'px');
        // $(".width-modify").css("top",'45px !important');
    } else if (length == "0") {
        let val = 45;
        $("." + obj + "_last_show").hide();
        $("." + obj + "_last_hide").show();
        $('.width-modify').css('top', val + 'px');
        // $(".width-modify").css("top",'45px !important');
    } else {
        let val = 60;
        $("." + obj + "_last_show").show();
        $("." + obj + "_last_hide").hide();
        $('.width-modify').css('top', val + 'px');
    }
    let headerLen = $(".date").closest("tr").find("." + obj + ":visible").length;
    let bodyLen = $(".odd").closest("tr").find("." + obj + ":visible").length;
    // if(headerLen == 1 && bodyLen == 100){
    //  console.log("head 1 and body 100")   
    //  $("table tr").each(function () {
    //     let value = 0;
    //     // let len = 4;
    //     let className = $('#' + obj).find('i').attr('class');
    //     // console.log("className - "+className);
    //     console.log("obj - "+obj);
    //     $(this).find("." + obj).each(
    //         function (index) { 
    //             console.log("obj - "+obj);
    //             // value = value + parseInt($(this).html());
    //             // console.log("value - "+value);
    //             // if (index !== len -1) 
    //             //     { 
    //                     $(this).show(); 
    //             //     }
    //             }
    //         );
    // });
    // }else if(headerLen == 4 && bodyLen == 25){
    //     console.log("head 4 and body 25");
    //     $("table tr").each(function () {
    //         let value = 0;
    //         let className = $('#' + obj).find('i').attr('class');
    //         console.log("obj - "+obj);
    //         $(this).find("." + obj).each(
    //             function (index) { 
    //                 console.log("obj - "+obj);
    //                     $(this).show(); 
    //             }
    //         );
    //     }); 

    // }
}

function toggleHeader(month) {
    $("#" + month).attr('colspan', 1);
    $("table tr").each(function () {
        let value = 0;
        let len = $(this).find("." + month + "_head").length;
        let className = $('#' + month).find('i').attr('class');
        // console.log("className - "+className);
        $(this).find("." + month + "_head").each(
            function (index) {
                value = value + parseInt($(this).html());
                // console.log("value - "+value);
                if (index !== len - 1) {
                    $(this).toggle();
                }
            }
        );
    });
    let length = $("#" + month).closest("tr").next("tr").find("." + month + ":visible").length;
    // console.log("len - ",length);
    $('.width-modify').css('z-index', '1000');
    $("#" + month).attr("colspan", length);
    if (length == "1") {
        let val = 45;
        $("." + month + "_last_show").hide();
        $("." + month + "_last_hide").show();
        $('.width-modify').css('top', val + 'px');
        // $(".width-modify").css("top",'45px !important');
    } else {
        let val = 60;
        $("." + month + "_last_show").show();
        $("." + month + "_last_hide").hide();
        $('.width-modify').css('top', val + 'px');
    }
}

function cbChanged(checkboxElem) {
    // $(checkboxElem).prop('disabled', true);
    if ($('#all').is(":checked") == true) {
        var ajaxTime = new Date().getTime();
        console.log("Started - " + ajaxTime);
        $('.employee_detail_inside').hide();
        $('.loading_class').show();
        console.log("That box was checked.");
        // $('#all').prop('disabled', true);
        getEmpDataTable(empAllocData);
        var totalTime = new Date().getTime() - ajaxTime;
        console.log("Ended - " + millisToMinutesAndSeconds(totalTime));
        $('.employee_detail_inside').show();
        $('.loading_class').hide();
    } else if ($('#all').is(":checked") == false) {
        var ajaxTime = new Date().getTime();
        console.log("Started - " + ajaxTime);
        $('.employee_detail_inside').hide();
        $('.loading_class').show();
        console.log("That box was unchecked.");
        getEmpDataTable(current_data);
        // $('#all').prop('disabled', false);
        var totalTime = new Date().getTime() - ajaxTime;
        console.log("Ended - " + millisToMinutesAndSeconds(totalTime));
        $('.employee_detail_inside').show();
        $('.loading_class').hide();
    }
    // if (checkboxElem.checked) {
    // } else {
    // }
    // $(checkboxElem).prop('disabled', false);
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
    console.log(formattedDate); //Today Date
    let today_date = new Date(formattedDate);
    let get_prj_all_start = $('#project_alloc_start_date').val();
    let res_selected_start_date = new Date(get_prj_all_start);

    if (res_selected_start_date <= today_date) {
        console.log("res_selected_start_date - " + res_selected_start_date + ">= " + today_date);
        bootbox.prompt({
            title: "Please select one option 'New Addition' or 'Replacement Resource' ",
            size: 'small',
            // message: '<b>Please select one option "New Resource" or "Replacement Resource"</b>',
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
                console.log("Selected user options - " + result);
                if (result == "new") {
                    //$("#newRecord").modal('show');
                    bootbox.prompt({
                        title: "Delivery manager approved for 'New Addition'?",
                        size: 'small',
                        // message: '<b>Please select one option "New Resource" or "Replacement Resource"</b>',
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
                            console.log("Selected user options - " + result);
                            if (result == "approved") {
                                //$("#newRecord").modal('show');
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
                        // message: '<b>Please select one option "New Resource" or "Replacement Resource"</b>',
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
                            console.log("Selected user options - " + result);
                            if (result == "approved") {
                                selectReplEmpName();

                            } else if (result == "notapproved") {
                                bootbox.alert("Please get approval from delivery manager for <b>'Replacement'</b>");
                            }
                        }
                    });
                    // console.log("Replace")
                    // $("#replaceAllocation").modal('show');
                    // replacementData();
                }
            }
        });
    } else {
        console.log("res_selected_start_date - " + res_selected_start_date + " < " + today_date)
        createEmpDetails("New Creation");
    }

}

function replacementData() {
    let popEmpNameOptions = "<option class='pop_emp_option' val=''>Select Employee</option>", popClientNameOption = "";
    getEmplyAccount();

    $.each(popupEmployeeArray, function (value, name) {
        // console.log("name - "+name.EMPLOYEE_NAME);
        popEmpNameOptions += `<option class="pop_emp_option" value="${name.EMPLOYEE_NAME}">${name.EMPLOYEE_NAME}</option>`;
    });
    $.each(popupClientNameArray, function (value, client) {
        popClientNameOption += `<option class="pop_client_option" value="${client.CUSTOMER_NAME}">${client.CUSTOMER_NAME}</option>`;
    });
    // console.log("popEmpNameOptions - " + popEmpNameOptions);
    // console.log("popClientNameOption - " + popClientNameOption);
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
    console.log("popupClientNameArray - ", popupClientNameArray);
    $.each(popupClientNameArray, function (i, clientName) {
        if (clientName.CUSTOMER_NAME == account_selected) {
            $('#repl_cus_id').val(clientName.CUSTOMER_ID);
            $.each(clientName.SOW_DATA, function (i, sow) {
                updatedSowArray = clientName.SOW_DATA;
                console.log("sow - ", sow);
                sow_name_options += '<option value="' + sow.SOW_ID + '">' + sow.SOW_NAME + '</option>';
            })
        }
    });
    // console.log("sow_names - " + sow_names);
    $("#repl_alloc_sow_name").html(sow_name_options);
    $('#repl_alloc_sow_name').removeAttr("disabled");
    $("#repl_alloc_sow_name").select2();
    getReplSowDetails();
    selectReplNewEmpName();
}

function getReplSowDetails() {
    let sow_id = $('#repl_alloc_sow_name').val();

    console.log("updatedSowArray - ", updatedSowArray);
    $.each(updatedSowArray, function (i, clientName) {
        if (clientName.SOW_ID == sow_id) {
            // $.each(updatedSowArray.SOW_ID, function (i, sowData) {
            // console.log("sowData - ",sowData);

            $("#repl_alloc_sow_id").val(clientName.SOW_ID);
            $("#repl_bill_status").val(clientName.SOW_CODE);
            $("#repl_sow_actual_start_date").val(convert(clientName.LEGAL_START_DATE));
            $("#repl_sow_actual_end_date").val(convert(clientName.LEGAL_END_DATE));
            $("#repl_sow_prob_status").val(clientName.PROBABILITY);
            $("#repl_sow_dynamic_status").val(clientName.DYNAMIC_STATUS);

            // })
        }
    });
    let empNewOptions = "";
    // console.log("popupCurSowEmpNameArr - ",popupCurSowEmpNameArr);
    $.each(popupCurSowEmpNameArr, function (i, existEmpData) {
        console.log("existEmpData - ", existEmpData);
        if (existEmpData.SOW_ID == sow_id) {
            $.each(existEmpData.EMP_DATA, function (i, empName) {
                console.log("empName details - ", empName);
                empNewOptions += '<option value="' + empName.EMPLOYEE_NAME + '">' + empName.EMPLOYEE_NAME + '</option>';
            })
            // $.each(updatedSowArray.SOW_ID, function (i, sowData) {
            // console.log("sowData - ",sowData);
            $("#repl_existing_employee_name").append(empNewOptions)
            // $("#repl_sow_actual_start_date").val(convert(empName.PROJECT_ALLOCATION_END_DATE));
            // $("#repl_sow_actual_end_date").val(convert(empName.PROJECT_ALLOCATION_START_DATE));
            // $("#repl_exist_pop_billing_status").val(empName.BILLING_STATUS);
            // $("#repl_sow_dynamic_status").val(empName.DYNAMIC_STATUS);

            // })
        }
    });

}

function selectReplNewEmpName() {
    let empName_selected = $('#repl_new_alloc_employee_name').val();

    $.each(popupEmployeeArray, function (i, empdata) {

        if (empdata.EMPLOYEE_NAME == empName_selected) {
            console.log("empdata - ", empdata);
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
                // $("#alloc_client").val(current_proj_data[0].CUSTOMER_NAME);
                $("#repl_new_curr_probability").val(current_proj_data[0].PROBABILITY);
                $("#repl_new_curr_sow_id").val(current_proj_data[0].SOW_ID);
                $("#repl_new_curr_sow_name").val(current_proj_data[0].SOW_NAME);
                $("#repl_new_curr_start_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_START_DATE));
                $("#repl_new_curr_end_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_END_DATE));
                $("#repl_new_project_alloc_start_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_START_DATE));
                $("#repl_new_project_alloc_end_date").val(convert(current_proj_data[0].PROJECT_ALLOCATION_END_DATE));
                $("#sow_prob_status").val(current_proj_data[0].PROBABILITY);
                $("#repl_new_pop_billing_status").val(current_proj_data[0].BILLING_STATUS);

                // $("#cus_id").val(current_proj_data[0].CUSTOMER_ID);
                // $("#alloc_sow_id").val(current_proj_data[0].SOW_ID);
                // $("#alloc_sow_code").val(current_proj_data[0].SOW_CODE);
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
                        console.log("sow data- ", sow);
                        sow_name_options += '<option value="' + sow.SOW_ID + '">' + sow.SOW_NAME + '</option>';
                    })
                }
            });
            console.log("sow_filter_data - ", sow_filter_data);
            // console.log("sow_names - " + sow_names);



            // $.each(sow_filter_data, function(i, sowdetails){
            //     if(sowdetails.SOW_ID == allData.SOW_ID){
            //         $("#sel_prob_status").val(sowdetails.PROBABILITY);
            //     }
            // })
            // console.log("allData.PROJECT_ALLOCATION_END_DATE - ", allData.PROJECT_ALLOCATION_END_DATE);


            //alert_notice
            if (empdata.IN_NOTICE_PERIOD == "YES") {
                $(".alert_notice").show();
            } else {
                $(".alert_notice").hide();
            }
            console.log("empdata - ", empdata);
            let emp_skills = empdata.SKILL_DATA;
            console.log("emp_skills - ", emp_skills);
            let emp_skill_data = "";

            $.each(emp_skills, function (value, skills) {
                // mang_name_options_sow += '<option value="' + mangName.REPORTING_MANAGER_ID + '">' + mangName.REPORTING_MANAGER_NAME + '</option>';
                if (skills.SKILL_NAME == "" && skills.LEVEL == "") {
                    emp_skill_data = `<button class="skill_data" disabled>No skills available to show</button><br><br>`
                } else {
                    emp_skill_data += `<button class="skill_data" disabled>${skills.SKILL_NAME} - ${skills.LEVEL}</button>`
                }
                // emp_skill_hide_data += `${skills.SKILL} ${skills.LEVEL}, `
            });
            // console.log("emp_skill_data - ",emp_skill_data);
            $("#repl_new_key_skill").html(emp_skill_data);
            // console.log("curr_start_date - ",$("#curr_start_date").val());
        }
    });
}