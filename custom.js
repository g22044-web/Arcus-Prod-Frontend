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
                    $(".show_page").css("display", "block");
                    getDateTime();
                    $(".new-sub-menu").hover(function () {
                        $('.sub-menu').css('display', '')
                    });
                    $("#show-list").click(function (e) {
                        e.preventDefault();
                
                        $("#list-html").toggle("fast", function () {
                            if ($(this).is(":visible")) {
                                $("#show-list").text("Hide underlying list.");
                                $(".topbar").fadeTo("fast", 0.9);
                            } else {
                                $("#show-list").text("Show underlying list.");
                                $(".topbar").fadeTo("fast", 1);
                            }
                        });
                    });
                
                    $("#list-html").text($("#org").html());
                
                    $("#org").bind("DOMSubtreeModified", function () {
                        $("#list-html").text("");
                
                        $("#list-html").text($("#org").html());
                
                        prettyPrint();
                    });
                
                    getData();
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
    $('#ALLBI').click(function () {
        window.location.href = 'sowOrgChart.html';
        return false;
    });
    $('#BENCH').click(function () {
        window.location.href = 'orgChart.html';
        return false;
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
});


let sowChatJson = []

// Get date and time function

function getDateTime() {
    var today = new Date();
    var day = today.getDate() + "";
    var month = (today.getMonth() + 1) + "";
    var year = today.getFullYear() + "";
    var hour = today.getHours() + "";
    var minutes = today.getMinutes() + "";
    var seconds = today.getSeconds() + "";

    day = checkZero(day);
    month = checkZero(month);
    year = checkZero(year);
    hour = checkZero(hour);
    minutes = checkZero(minutes);
    seconds = checkZero(seconds);
    let dateTime = year + "-" + month + "-" + day;
    function checkZero(data) {
        if (data.length == 1) {
            data = "0" + data;
        }
        return data;
    }
    return dateTime;
}
var jsonData = [];
var orgJsonData = [];
var importedEmpList = [];
var existingEmpList = [];
var revertChanges = [];
var empIndData = [];
var empUsData = [];

function arrUnique(arr) {
    var cleaned = [];
    arr.forEach(function (itm) {
        var unique = true;
        cleaned.forEach(function (itm2) {
            if (_.isEqual(itm, itm2)) unique = false;
        });
        if (unique) cleaned.push(itm);
    });
    return cleaned;
}

function employee_chart_data() {
    let query_type = "";
    let user_type = "";
    $.ajax({
        url: apiValue.url_ip+ ":5001/teams_chart",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({})
        ,
        success: function (json) {
            $('#org_chart_select').empty();
            orgJsonData = json;
            $.each(orgJsonData, function (i, orgdata) {
                if (orgdata.LOCATION == "India") {
                    empIndData = orgdata.EMP_CHART_DATA;
                }
                if (orgdata.LOCATION == "US") {
                    empUsData = orgdata.EMP_CHART_DATA;
                }
                getColorValue_br();
            });
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
}

function sow_root_data() {
    json = sowChatJson;
    jsonData = json
    var id = json.DEFAULT.SCENARIO_NAME.replace(" ", "_");
    $("#mySidenav").append("<a id=" + id + " onClick='loadChart(\"" + json.DEFAULT.SCENARIO_NAME.trim() + "\")'><img id='" + id + "_img' src='images\\organization-chart_icon.png' alt='Org Chart Icon' width='20' height='25' ><img id='" + id + "_img' src='images\\organization-chart_hover.png' alt='Org Chart Icon' width='20' height='25' > " + json.DEFAULT.SCENARIO_NAME + "</a>");
    $('#org_chart_select').append("<option id=" + id + " onchange='loadChart(\"" + json.DEFAULT.SCENARIO_NAME.trim() + "\")' value=" + json.DEFAULT.SCENARIO_NAME + " >" + json.DEFAULT.SCENARIO_NAME + "</option>");
    if (Object.keys(json).length > 1) {
        scenario_list = json.SAVED;
        scenario_list.forEach(scr => {
            var id = scr.SCENARIO_NAME.replace(" ", "_");
            $("#mySidenav").append("<a id=" + id + " onClick='loadChart(\"" + scr.SCENARIO_NAME.trim() + "\")'><img id='" + id + "_img' src='images\\scenario_icon.png' alt='Org Chart Icon' width='20' height='25'><img id='" + id + "_img' src='images\\scenario_icon_hover.png' alt='Org Chart Icon' width='20' height='25'> " + scr.SCENARIO_NAME + "</a>");
            $('#org_chart_select').append("<option id=" + id + " onchange='loadChart(\"" + scr.SCENARIO_NAME.trim() + "\")' value=" + scr.SCENARIO_NAME.trim() + ">" + scr.SCENARIO_NAME.trim() + "</option>");
        });

    }
    loadSOWChart("SOW Chart");
    $("#SOW_Chart").addClass("active");
    $('#SOW_Chart_img').attr('src', 'images\\organization-chart_hover.png');
    var org = [];
    org = jsonData.data;
}
var scenario_list = [];
var selected_org_chart = "";
function getData() {
    let serialNum = 1;
    $("#mySidenav").html('');
    var val = $("#org_chart_type").val();
    let colorValue = $(".can-toggle__switch").css("background-color");
    employee_chart_data("IND");
    $("#org_chart_type").change(function () {
        val = $(this).val();
        selected_org_chart = val;
        if (val == "Employee Chart") {
            employee_chart_data("IND");

            $("#toogle_button").css("display", "block");
            $("#ind_legends").toggleClass("is-active", !$('#d').is(":checked"));
            $("#us_legends").toggleClass("is-active", $('#d').is(":checked"));
            $("#emp_button").css("display", "block");
            $("#sow_button").css("display", "none");
        } else if (val == "SOW Chart") {
            sow_root_data();
            $("#toogle_button").css("display", "none");
            $("#ind_legends, #us_legends").removeClass("is-active");
            $("#emp_button").css("display", "none");
            $("#sow_button").css("display", "block");
        }
    });
}

function getSowData() {
    let serialNum = 1;
    $("#mySidenav").html('');
    sow_root_data();
}

$(function () {
    $("#org_chart_select").change(function () {
        var selectedText = $(this).find("option:selected").text();
        var selectedValue = $(this).val();
        if (selected_org_chart == "Employee Chart") {
            loadChart(selectedText);
        } else if (selected_org_chart == "SOW Chart") {
            loadSOWChart(selectedText);
        } else if (selected_org_chart == "") {
            loadChart(selectedText);
        }
    });
});

/* Assigning JSON data into a list and append to ID */

function loadChart(scenario) {
    revertChanges = [];
    if (revertChanges.length == 0) {
        $('#save').prop('disabled', true);
    }
    $(".jOrgChart").remove();
    $('body').find('.active').removeClass();
    $('#Org_Chart_img').attr('src', 'images\\organization-chart_icon.png');
    var id = scenario.replace(" ", "_");
    var id_img = id + "_img";
    importedEmpList = [];
    existingEmpList = [];
    var id_count = $('#mySidenav a').length;
    for (let i = 1; i < id_count; i++) {
        $("#Scenario_" + i + "_img").attr('src', 'images\\scenario_icon.png');
    }
    if (scenario == 'Org Chart') {

        let empListUnq = jsonData.DEFAULT.ORG_STRUCTURE;
        let empList = empListUnq.filter((empListUnq, index, self) =>
            index === self.findIndex((t) => (t.EMPLOYEE_ID === empListUnq.EMPLOYEE_ID && t.EMPLOYEE_NAME === empListUnq.EMPLOYEE_NAME)))
        $('#save').hide();
        $('#orgChart_final').hide();
        $('#Org_Chart_img').attr('src', 'images\\organization-chart_hover.png');
        if (empList) {
            /* Reading API json data with single scenarios */
            for (var i in empList) {
                importedEmpList.push({
                    empName: empList[i].EMPLOYEE_NAME,
                    empId: Number(empList[i].EMPLOYEE_ID),
                    empDesg: empList[i].DESIGNATION,
                    repMangId: Number(empList[i].REPORTING_MANAGER_ID),
                    repMangName: empList[i].REPORTING_MANAGER,
                    dept: empList[i].DEPARTMENT,
                    locat: empList[i].LOCATION,
                    bill: empList[i].BILLING_STATUS,
                    sow_id: empList[i].SOW_ID,
                    sow_name: empList[i].SOW_NAME,
                    cus_name: empList[i].CUSTOMER_NAME,
                    start_date: empList[i].START_DATE,
                    end_date: empList[i].END_DATE,
                });
                existingEmpList.push({
                    empName: empList[i].EMPLOYEE_NAME,
                    empId: Number(empList[i].EMPLOYEE_ID),
                    empDesg: empList[i].DESIGNATION,
                    repMangId: Number(empList[i].REPORTING_MANAGER_ID),
                    repMangName: empList[i].REPORTING_MANAGER,
                    dept: empList[i].DEPARTMENT,
                    locat: empList[i].LOCATION,
                    bill: empList[i].BILLING_STATUS,
                    sow_id: empList[i].SOW_ID,
                    sow_name: empList[i].SOW_NAME,
                    cus_name: empList[i].CUSTOMER_NAME,
                    start_date: empList[i].START_DATE,
                    end_date: empList[i].END_DATE,
                });
            }

            $("#orgData").html(getReportingEmpData(0, true));
            $("#org").jOrgChart({
                chartElement: "#chart",
                dragAndDrop: true,
            });

        }
    } else {
        $('#save').show();
        $('#orgChart_final').show();
        $('#' + id_img).attr('src', 'images\\scenario_icon_hover.png');
        $('select[name="org_chart_select"]').find('option[value="' + scenario + '"]').attr("selected", true);
        let scenarioData = jsonData.SAVED.find(scr => scr.SCENARIO_NAME === scenario);
        /* Displaying scenario data */
        if (scenarioData) {
            let scrUnq = scenarioData.ORG_STRUCTURE;
            let scenario = scrUnq.filter((scrUnq, index, self) =>
                index === self.findIndex((t) => (t.EMPLOYEE_ID === scrUnq.EMPLOYEE_ID && t.EMPLOYEE_NAME === scrUnq.EMPLOYEE_NAME)))
            /* Reading API json data with single scenarios */

            for (var i in scenario) {
                importedEmpList.push({
                    empName: scenario[i].EMPLOYEE_NAME,
                    empId: Number(scenario[i].EMPLOYEE_ID),
                    empDesg: scenario[i].DESIGNATION,
                    repMangId: Number(scenario[i].REPORTING_MANAGER_ID),
                    repMangName: scenario[i].REPORTING_MANAGER,
                    dept: scenario[i].DEPARTMENT,
                    locat: scenario[i].LOCATION,
                    bill: scenario[i].BILLING_STATUS,
                    sow_id: scenario[i].SOW_ID,
                    sow_name: scenario[i].SOW_NAME,
                    cus_name: scenario[i].CUSTOMER_NAME,
                    start_date: scenario[i].START_DATE,
                    end_date: scenario[i].END_DATE,
                });
                existingEmpList.push({
                    empName: scenario[i].EMPLOYEE_NAME,
                    empId: Number(scenario[i].EMPLOYEE_ID),
                    empDesg: scenario[i].DESIGNATION,
                    repMangId: Number(scenario[i].REPORTING_MANAGER_ID),
                    repMangName: scenario[i].REPORTING_MANAGER,
                    dept: scenario[i].DEPARTMENT,
                    locat: scenario[i].LOCATION,
                    bill: scenario[i].BILLING_STATUS,
                    sow_id: scenario[i].SOW_ID,
                    sow_name: scenario[i].SOW_NAME,
                    cus_name: scenario[i].CUSTOMER_NAME,
                    start_date: scenario[i].START_DATE,
                    end_date: scenario[i].END_DATE,
                });
            }

            $("#orgData").html(getReportingEmpData(0, true));
            $("#org").jOrgChart({
                chartElement: "#chart",
                dragAndDrop: true,
            });
        }
    }

    $("#" + id).addClass("active");
    $(".jOrgChart").css("width", "100%");
}


function loadSOWChart(scenario) {
    revertChanges = [];
    if (revertChanges.length == 0) {
        $('#save').prop('disabled', true);
    }
    $(".jOrgChart").remove();
    $('body').find('.active').removeClass();
    $('#SOW_Chart_img').attr('src', 'images\\organization-chart_icon.png');
    var id = scenario.replace(" ", "_");
    var id_img = id + "_img";
    importedEmpList = [];
    existingEmpList = [];
    var id_count = $('#mySidenav a').length;
    for (let i = 1; i < id_count; i++) {
        $("#Scenario_" + i + "_img").attr('src', 'images\\scenario_icon.png');
    }
    if (scenario == 'SOW Chart') {

        const empList = jsonData.DEFAULT.SOW_STRUCTURE;
        $('#sow_save').hide();
        $('#sow_orgChart_final').hide();
        $('#Org_Chart_img').attr('src', 'images\\organization-chart_hover.png');
        if (empList) {
            /* Reading API json data with single scenarios */
            for (var i in empList) {
                importedEmpList.push({
                    empName: empList[i].EMPLOYEE_NAME,
                    empId: empList[i].EMPLOYEE_ID,
                    empDesg: empList[i].DESIGNATION,
                    repMangId: empList[i].REPORTING_MANAGER_ID,
                    repMangName: empList[i].REPORTING_MANAGER,
                    dept: empList[i].DEPARTMENT,
                    Organization: empList[i].Organization,
                    CUSTOMER_NAME: empList[i].CUSTOMER_NAME,
                    locat: empList[i].LOCATION,
                    bill: empList[i].BILLING_STATUS,
                    sow_id: empList[i].SOW_ID,
                    sow_name: empList[i].SOW_NAME,
                    cus_name: empList[i].CUSTOMER_NAME,
                    project_start_date: empList[i].PROJECT_ALLOCATION_START_DATE,
                    project_end_date: empList[i].PROJECT_ALLOCATION_END_DATE,
                    sow_code: empList[i].SOW_CODE,
                    cus_id: empList[i].CUSTOMER_ID,
                    status: empList[i].STATUS,
                    start_date: empList[i].START_DATE,
                    end_date: empList[i].END_DATE,
                    hierarchy_id: empList[i].HIERARCHY_ID,
                    account_head_id: empList[i].FACTSPAN_ACCOUNT_HEAD_ID,
                    account_head_name: empList[i].ACCOUNT_HEAD_NAME,
                });
                existingEmpList.push({
                    empName: empList[i].EMPLOYEE_NAME,
                    empId: empList[i].EMPLOYEE_ID,
                    empDesg: empList[i].DESIGNATION,
                    repMangId: empList[i].REPORTING_MANAGER_ID,
                    repMangName: empList[i].REPORTING_MANAGER,
                    dept: empList[i].DEPARTMENT,
                    Organization: empList[i].Organization,
                    SOW_NAME: empList[i].SOW_NAME,
                    locat: empList[i].LOCATION,
                    bill: empList[i].BILLING_STATUS,
                    sow_id: empList[i].SOW_ID,
                    sow_name: empList[i].SOW_NAME,
                    cus_name: empList[i].CUSTOMER_NAME,
                    project_start_date: empList[i].PROJECT_ALLOCATION_START_DATE,
                    project_end_date: empList[i].PROJECT_ALLOCATION_END_DATE,
                    sow_code: empList[i].SOW_CODE,
                    cus_id: empList[i].CUSTOMER_ID,
                    status: empList[i].STATUS,
                    start_date: empList[i].START_DATE,
                    end_date: empList[i].END_DATE,
                    hierarchy_id: empList[i].HIERARCHY_ID,
                    account_head_id: empList[i].FACTSPAN_ACCOUNT_HEAD_ID,
                    account_head_name: empList[i].ACCOUNT_HEAD_NAME,
                });
            }

            let chartData = `<ul id='org'><li class="class-factspan "> <span class="emp-name class-factspan-name">Factspan</span><span
            class="emp-desg class-factspan-desg"></span><input
            type="hidden" class="emp-id" value="1"><input type="hidden" class="emp-repMangId" value="0"><input type="hidden"
            class="emp-repMangName" value="">` + getCompanyData('Factspan') + `</li></ul>`;
            $("#orgData").html(chartData);
            $("#org").jOrgChart({
                chartElement: "#chart",
                dragAndDrop: true,
            });

        }
    } else {
        $('#sow_save').show();
        $('#sow_orgChart_final').show();
        $('#' + id_img).attr('src', 'images\\scenario_icon_hover.png');
        $('select[name="org_chart_select"]').find('option[value="' + scenario + '"]').attr("selected", true);
        let scenarioData = jsonData.SAVED.find(scr => scr.SCENARIO_NAME === scenario);
        /* Displaying scenario data */
        if (scenarioData) {
            let scenario = scenarioData.SOW_STRUCTURE
            /* Reading API json data with single scenarios */

            for (var i in scenario) {
                importedEmpList.push({
                    empName: scenario[i].EMPLOYEE_NAME,
                    empId: Number(scenario[i].EMPLOYEE_ID),
                    empDesg: scenario[i].DESIGNATION,
                    repMangId: Number(scenario[i].REPORTING_MANAGER_ID),
                    repMangName: scenario[i].REPORTING_MANAGER,
                    dept: scenario[i].DEPARTMENT,
                    Organization: scenario[i].Organization,
                    CUSTOMER_NAME: scenario[i].CUSTOMER_NAME,
                    SOW_NAME: scenario[i].SOW_NAME,
                    locat: scenario[i].LOCATION,
                    bill: scenario[i].BILLING_STATUS,
                    sow_id: scenario[i].SOW_ID,
                    sow_name: scenario[i].SOW_NAME,
                    cus_name: scenario[i].CUSTOMER_NAME,
                    project_start_date: scenario[i].PROJECT_ALLOCATION_START_DATE,
                    project_end_date: scenario[i].PROJECT_ALLOCATION_END_DATE,
                    sow_code: scenario[i].SOW_CODE,
                    cus_id: scenario[i].CUSTOMER_ID,
                    status: scenario[i].STATUS,
                    start_date: scenario[i].START_DATE,
                    end_date: scenario[i].END_DATE,
                    hierarchy_id: empList[i].HIERARCHY_ID,
                    account_head_id: empList[i].FACTSPAN_ACCOUNT_HEAD_ID,
                    account_head_name: empList[i].ACCOUNT_HEAD_NAME,
                });
                existingEmpList.push({
                    empName: scenario[i].EMPLOYEE_NAME,
                    empId: Number(scenario[i].EMPLOYEE_ID),
                    empDesg: scenario[i].DESIGNATION,
                    repMangId: Number(scenario[i].REPORTING_MANAGER_ID),
                    repMangName: scenario[i].REPORTING_MANAGER,
                    dept: scenario[i].DEPARTMENT,
                    Organization: scenario[i].Organization,
                    SOW_NAME: scenario[i].SOW_NAME,
                    locat: scenario[i].LOCATION,
                    bill: scenario[i].BILLING_STATUS,
                    sow_id: scenario[i].SOW_ID,
                    sow_name: scenario[i].SOW_NAME,
                    cus_name: scenario[i].CUSTOMER_NAME,
                    project_start_date: scenario[i].PROJECT_ALLOCATION_START_DATE,
                    project_end_date: scenario[i].PROJECT_ALLOCATION_END_DATE,
                    sow_code: scenario[i].SOW_CODE,
                    cus_id: scenario[i].CUSTOMER_ID,
                    status: scenario[i].STATUS,
                    start_date: scenario[i].START_DATE,
                    end_date: scenario[i].END_DATE,
                    hierarchy_id: empList[i].HIERARCHY_ID,
                    account_head_id: empList[i].FACTSPAN_ACCOUNT_HEAD_ID,
                    account_head_name: empList[i].ACCOUNT_HEAD_NAME,
                });
            }

            let chartData = `<ul id='org'><li class="class-factspan "> <span class="emp-name class-factspan-name">Factspan</span><span
            class="emp-desg class-factspan-desg"></span><input
            type="hidden" class="emp-id" value="1"><input type="hidden" class="emp-repMangId" value="0"><input type="hidden"
            class="emp-repMangName" value="">` + getCompanyData('Factspan') + `</li></ul>`;
            $("#orgData").html(chartData);
            $("#org").jOrgChart({
                chartElement: "#chart",
                dragAndDrop: true,
            });
        }
    }

    $("#" + id).addClass("active");
    $(".jOrgChart").css("width", "100%");
}

let revertCount = 0;

function revertCountFun() {
    if (revertChanges.length > 0 && revertCount > 0) {
        revertCount = revertCount - 1;
    }
    return revertCount;
}
var billed_tot = 0, invest_tot = 0, use_bench_tot = 0, spl_leave_tot = 0, intrl_tot = 0, buffer_tot = 0;
function getReportingEmpData(repMangId, isFirstRecord) {
    const mainParentEmpId = importedEmpList.find(emp => emp.repMangId == 0);
    const reportes = importedEmpList.filter(
        (emp) => emp.repMangId == repMangId
    );

    let reportesData = "<ul " + (isFirstRecord ? "id='org'" : "") + ">";

    let rEmpData = "";
    reportes.forEach((emp) => {
        let empCardClassName = '';
        if (emp.empDesg === 'CEO' || emp.empName === 'CEO') {
            empCardClassName = 'class-ceo';
        } else if (emp.empDesg === 'Vice President' || emp.empName === 'Vice President' || emp.empDesg === 'Associate Vice President' || emp.empName === 'Associate Vice President') {
            empCardClassName = 'class-vp';
        } else if (emp.empDesg === 'Associate Director' || emp.empName === 'Associate Director' || emp.empDesg === 'Director' || emp.empName === 'Director' || emp.empDesg === 'Senior Director - Analytics' || emp.empName === 'Senior Director - Analytics' || emp.empDesg === 'Senior Director' || emp.empName === 'Senior Director') {
            empCardClassName = 'class-ad';
        } else if (emp.empDesg === 'Associate Manager' || emp.empName === 'Associate Manager' || emp.empDesg === 'Associate Manager - Analytics' || emp.empName === 'Associate Manager - Analytics') {
            empCardClassName = 'class-am';
        } else if (emp.empDesg === 'Senior Manager' || emp.empName === 'Senior Manager') {
            empCardClassName = 'class-sm';
        } else if (emp.empDesg === 'Senior Analyst' || emp.empName === 'Senior Analyst' || emp.empDesg === 'Senior Consultant' || emp.empName === 'Senior Consultant' || emp.empDesg === 'Senior Associate - Analytics' || emp.empName === 'Senior Associate - Analytics' || emp.empDesg === 'Senior Business Analyst' || emp.empName === 'Senior Business Analyst') {
            empCardClassName = 'class-srana';
        } else if (emp.empDesg === 'Solution Architect' || emp.empName === 'Solution Architect' || emp.empDesg === 'Senior Principal Consultant' || emp.empName === 'Senior Principal Consultant' || emp.empDesg === 'Senior Data Scientist' || emp.empName === 'Senior Data Scientist') {
            empCardClassName = 'class-solar';
        } else if (emp.empDesg === 'Scrum Master' || emp.empName === 'Scrum Master' || emp.empDesg === 'Data Governance Manager' || emp.empName === 'Data Governance Manager') {
            empCardClassName = 'class-scrum';
        } else if (emp.empDesg === 'Manager' || emp.empName === 'Manager' || emp.empDesg === 'Engagement Manager - Analytics' || emp.empName === 'Engagement Manager - Analytics' || emp.empDesg === 'Account Manager' || emp.empName === 'Account Manager') {
            empCardClassName = 'class-m';
        } else if (emp.empDesg === 'Analyst' || emp.empName === 'Analyst' || emp.empDesg === 'Data Scientist' || emp.empName === 'Data Scientist') {
            empCardClassName = 'class-a';
        } else if (emp.empDesg === 'BENCH' || emp.empName === 'BENCH') {
            empCardClassName = 'class-ben';
        } else {
            empCardClassName = 'class-default';
        }

        let drCount = importedEmpList.filter((iemp) => iemp.repMangId == emp.empId).length;
        let trCount = getChildListLength(emp.empId);
        let billCount = getChildBillingStatus(emp.empId);
        billed_tot = 0, invest_tot = 0, use_bench_tot = 0, spl_leave_tot = 0, intrl_tot = 0, buffer_tot = 0;
        let bill_cou = "", invest_cou = "", useben_cou = "", spl_cou = "", intrl_cou = "", buffer_cou = "";
        let count = "", countBill = "";
        if (trCount > 0 && drCount > 0) {
            count = `<li>TR: ${trCount}, DR: ${drCount}</li>`;
        } else if (trCount > 0) {
            count = `<li>TR: ${trCount}</li>`;
        } else if (drCount > 0) {
            count = `<li>DR: ${drCount}</li>`;
        }
        let strs;
        if (billCount.indexOf(',') != -1) {
            strs = billCount.split(',');
            if (strs[0] != '0') {
                bill_cou = " B - " + strs[0];
            }
            if (strs[1] != '0') {
                invest_cou = " I - " + strs[1];
            }
            if (strs[2] != '0') {
                useben_cou = " UB - " + strs[2];
            }
            if (strs[3] != '0') {
                spl_cou = " SP - " + strs[3];
            }
            if (strs[4] != '0') {
                intrl_cou = " IP - " + strs[4];
            }
            if (strs[5] != '0') {
                buffer_cou = " BU - " + strs[5];
            }
        }
        let tooltipData = `<ul>
                                <li>${emp.empName} - ${getIntials(emp.empDesg)}</li>
                                ${count}
                                <li>${invest_cou}${bill_cou}${useben_cou}${spl_cou}${intrl_cou}${buffer_cou}</li>
                            </ul>`

        rEmpData =
            rEmpData +
            "<li class= '" + empCardClassName + " " + ((emp.collapsed !== undefined) ? (emp.collapsed ? 'collapsed' : '') : (!(repMangId == 0 || repMangId == 3) ? 'collapsed' : '')) +
            "'> <span class='emp-name-short " + empCardClassName + "-name'> <div class='SerialNumberContainer'><div class='SerialNumber'>" + getIntials(emp.empName) + "</div><div class='SerialNumberTooltip'>" + tooltipData + "</div></div>" +
            "</span><span class='emp-name' style='display:none'>" + emp.empName + "</span><span class='emp-desg " + empCardClassName + "-desg' style='display:none'>" +
            emp.empDesg +
            "</span>" +
            "<input type='hidden' class='emp-id' value='" +
            emp.empId +
            "'><input type='hidden' class='emp-repMangId' value='" +
            emp.repMangId +
            "'><input type='hidden' class='emp-repMangName' value='" +
            emp.repMangName +
            "'><input type='hidden' class='emp-locat' value='" +
            emp.locat +
            "'><input type='hidden' class='emp-bill' value='" +
            emp.bill +
            "'><input type='hidden' class='emp-dept' value='" +
            emp.dept +
            "'><input type='hidden' class='emp-sow-id' value='" +
            emp.sow_id +
            "'><input type='hidden' class='emp-sow-name' value='" +
            emp.sow_name +
            "'><input type='hidden' class='emp-cus-name' value='" +
            emp.cus_name +
            "'><input type='hidden' class='emp-start-date' value='" +
            emp.start_date +
            "'><input type='hidden' class='emp-end-date' value='" +
            emp.end_date +
            "'> <input type='hidden' class='emp-dr' value='" + drCount
            + "'> <input type='hidden' class='emp-tr' value='" + trCount
            + "'>";
        rEmpData = rEmpData + getReportingEmpData(emp.empId, false);

        rEmpData = rEmpData + "</li>";
    });
    if (rEmpData != "") {
        reportesData = reportesData + rEmpData;
    }

    reportesData = reportesData + "</ul>";


    return reportesData;
}

function getReportingSOWData(isFirstRecord, orgName, cusName, sowName, hierarchy, hierarchy_id, account_head) {
    const mainParentEmpId = importedEmpList.find(emp => emp.repMangId == 0);
    let reportes = [];
    if (orgName && cusName && sowName && hierarchy == "") {
        reportes = importedEmpList.filter(
            (emp) => emp.Organization === orgName &&
                emp.CUSTOMER_NAME === cusName && emp.sow_name === sowName && emp.sow_id == emp.hierarchy_id
        );
    }
    if (orgName && cusName && sowName && hierarchy != "" && hierarchy_id != "") {
        if (hierarchy != "" && hierarchy_id != "") {
            reportes = importedEmpList.filter(
                (emp) => emp.Organization === orgName &&
                    emp.CUSTOMER_NAME === cusName && emp.sow_name === sowName && ((emp.sow_id + emp.repMangId) === hierarchy_id)
            );
        }
    }

    let reportesData = "<ul " + (isFirstRecord ? "id='org'" : "") + ">";

    let rEmpData = "";
    reportes.forEach((emp) => {
        let empCardClassName = '';
        if (emp.empDesg === 'VP') {
            empCardClassName = 'class-vp';
        } else if (emp.empDesg === 'AD') {
            empCardClassName = 'class-ad';
        } else if (emp.empDesg === 'SM') {
            empCardClassName = 'class-sm';
        } else if (emp.empDesg === 'M') {
            empCardClassName = 'class-m';
        } else if (emp.empName === 'Factspan') {
            empCardClassName = 'class-factspan';
        } else if (emp.empName === 'ACI') {
            empCardClassName = 'class-aci';
        } else if (emp.empName === 'Albertsons') {
            empCardClassName = 'class-albertsons';
        } else if (emp.empName === 'Anthem') {
            empCardClassName = 'class-anthem';
        } else if (emp.empName === 'Disney') {
            empCardClassName = 'class-disney';
        } else if (emp.empName === 'HCA') {
            empCardClassName = 'class-hca';
        } else if (emp.empName === 'LeadVenture') {
            empCardClassName = 'class-leadventure';
        } else if (emp.empName === 'LifeLock') {
            empCardClassName = 'class-lifelock';
        } else if (emp.empName === 'Macys') {
            empCardClassName = 'class-macys';
        } else {
            empCardClassName = 'class-default';
        }
        let drLength = 0;
        if (orgName && cusName && sowName) {
            drLength = importedEmpList.filter(
                (iemp) => iemp.Organization === orgName &&
                    iemp.CUSTOMER_NAME === cusName && iemp.sow_name === sowName
            ).length;
        } else {
            drLength = importedEmpList.filter(
                (iemp) => iemp.repMangId == emp.empId
            ).length;
        }
        rEmpData =
            rEmpData +
            "<li class= '" + empCardClassName + " collapsed' > <span class='emp-name " + empCardClassName + "-name' data-title='" + emp.empName + "'>" +
            getIntials(emp.empName) +
            " ( " + getIntials(emp.empDesg) + " )</span><span class='emp-desg " + empCardClassName + "-desg' style='display:none'>" +
            emp.empDesg +
            "</span>" +
            "<input type='hidden' class='emp-id' value='" +
            emp.empId +
            "'><input type='hidden' class='emp-fullname' value='" +
            emp.empName +
            "'><input type='hidden' class='emp-sow-id' value='" +
            emp.sow_id +
            "'><input type='hidden' class='emp-repMangId' value='" +
            emp.repMangId +
            "'><input type='hidden' class='emp-locat' value='" +
            emp.locat +
            "'><input type='hidden' class='emp-repMangName' value='" +
            emp.repMangName +
            "'><input type='hidden' class='emp-sow-code' value='" +
            emp.sow_code +
            "'><input type='hidden' class='emp-cus-id' value='" +
            emp.cus_id +
            "'><input type='hidden' class='emp-bill' value='" +
            emp.bill +
            "'><input type='hidden' class='emp-status' value='" +
            emp.status +
            "'><input type='hidden' class='emp-start-date' value='" +
            emp.start_date +
            "'><input type='hidden' class='emp-rep-mang-id' value='" +
            emp.repMangId +
            "'><input type='hidden' class='emp-end-date' value='" +
            emp.end_date +
            "'> <input type='hidden' class='emp-dept' value='" + emp.dept + "'> ";
        if (orgName && cusName && sowName) {
            rEmpData = rEmpData
                + "<input type='hidden' class='emp-orgName' value='" + orgName + "'>"
                + "<input type='hidden' class='emp-cusName' value='" + cusName + "'>"
                + "<input type='hidden' class='emp-sowName' value='" + sowName + "'>";
        }
        rEmpData = rEmpData + getReportingSOWData(false, orgName, cusName, sowName, (emp.sow_id + emp.empId), (emp.sow_id + emp.empId));

        rEmpData = rEmpData + "</li>";
    });
    if (rEmpData != "") {
        reportesData = reportesData + rEmpData;
    }

    reportesData = reportesData + "</ul>";


    return reportesData;
}

function getCompanyData(orgName) {
    const reportes = importedEmpList.filter((emp) => emp.Organization == orgName);
    const cusList = [];
    let custCode = "";
    reportes.forEach(emp => {
        custCode = emp.CUSTOMER_ID;
        if (cusList.indexOf(emp.CUSTOMER_NAME) === -1) {
            cusList.push(emp.CUSTOMER_NAME);
        }
    });
    let reportesData = "<ul " + (false ? "id='org'" : "") + ">";
    let rEmpData = "";
    cusList.forEach((emp) => {
        const custName = importedEmpList.filter((sowLen) => sowLen.CUSTOMER_NAME == emp);

        const sowList = [];
        custName.forEach(sowLen => {
            if (sowList.indexOf(sowLen.sow_name) === -1) {
                sowList.push(sowLen.sow_name);
            }
        });
        let empCardClassName = '';
        if (emp === 'Factspan') {
            empCardClassName = 'class-factspan';
        } else if (emp === 'ACI') {
            empCardClassName = 'class-aci';
        } else if (emp === 'Albertsons') {
            empCardClassName = 'class-albertsons';
        } else if (emp === 'Anthem') {
            empCardClassName = 'class-anthem';
        } else if (emp === 'Disney') {
            empCardClassName = 'class-disney';
        } else if (emp === 'HCA') {
            empCardClassName = 'class-hca';
        } else if (emp === 'LeadVenture') {
            empCardClassName = 'class-leadventure';
        } else if (emp === 'LifeLock') {
            empCardClassName = 'class-lifelock';
        } else if (emp === 'Macys') {
            empCardClassName = 'class-macys';
        } else if (emp === 'Shipt') {
            empCardClassName = 'class-shipt';
        } else if (emp === 'RiteAid') {
            empCardClassName = 'class-rireaid';
        } else if (emp === 'RSM') {
            empCardClassName = 'class-rsm';
        } else if (emp === 'MHE') {
            empCardClassName = 'class-mhe';
        } else if (emp === 'SAP Concur') {
            empCardClassName = 'class-sapconcur';
        } else {
            empCardClassName = 'class-default';
        }
        rEmpData =
            rEmpData + "<li class='" + empCardClassName
            + " collapsed'><span class='cust-name'>" + emp
            + "</span><input type='hidden' class='emp-orgName' value='" + orgName
            + "'>" + getAccountHeadData(emp, orgName) + "</li>";
    });
    if (rEmpData != "") {
        reportesData = reportesData + rEmpData;
    }

    reportesData = reportesData + "</ul>";


    return reportesData;
}

function getAccountHeadData(customerName, organization) {
    const reportes = importedEmpList.filter((emp) => emp.CUSTOMER_NAME == customerName);
    const accountHeadList = [];
    reportes.forEach(emp => {
        if (accountHeadList.indexOf(emp.account_head_name) === -1) {
            accountHeadList.push(emp.account_head_name);
        }
    });
    let reportesData = "<ul " + (false ? "id='org'" : "") + ">";
    let rEmpData = "";
    accountHeadList.forEach((accHead) => {
        drLength = 0;
        if (organization && customerName && accHead) {
            drLength = importedEmpList.filter(
                (iemp) => iemp.Organization === organization &&
                    iemp.CUSTOMER_NAME === customerName && iemp.account_head_name === accHead
            ).length;
        }
        let empCardClassName = '';
        rEmpData =
            /*To display employee details and pass the organization name and customername and sow */

            rEmpData + "<li class='collapsed'><span class='emp-name class-factspan-name'>" +
            accHead +
            "</span><input type='hidden' class='emp-orgName' value='" + organization + "'><input type='hidden' class='emp-cusName' value='" + customerName + "'>" + getSOWData(customerName, organization, accHead) + "</li>";
    });
    if (rEmpData != "") {
        reportesData = reportesData + rEmpData;
    }
    reportesData = reportesData + "</ul>";
    return reportesData;
}

function getSOWData(customerName, organization, account_head) {
    const reportes = importedEmpList.filter((emp) => emp.account_head_name == account_head);
    const sowList = [];
    reportes.forEach(emp => {
        if (sowList.indexOf(emp.sow_name) === -1) {
            sowList.push(emp.sow_name);
        }
    });
    let reportesData = "<ul " + (false ? "id='org'" : "") + ">";
    let rEmpData = "";
    sowList.forEach((sow) => {
        drLength = 0;
        if (organization && customerName && sow && account_head) {
            drLength = importedEmpList.filter(
                (iemp) => iemp.Organization === organization &&
                    iemp.CUSTOMER_NAME === customerName &&
                    iemp.ACCOUNT_HEAD_NAME === account_head && iemp.sow_name === sow
            ).length;
        }
        let empCardClassName = '';
        rEmpData =
            /*To display employee details and pass the organization name and customername and sow */

            rEmpData + "<li class='collapsed'><span class='emp-name class-factspan-name'>" +
            sow +
            "</span><input type='hidden' class='emp-orgName' value='" + organization
            + "'><input type='hidden' class='emp-cusName' value='" + customerName
            + "'>" +
            getReportingSOWData(false, organization, customerName, sow, "", "", account_head) + "</li>";
    });
    if (rEmpData != "") {
        reportesData = reportesData + rEmpData;
    }
    reportesData = reportesData + "</ul>";
    return reportesData;
}

function getChildBillingStatus(repMangId) {
    const reportes = importedEmpList.filter(
        (emp) => emp.repMangId == repMangId
    );
    let len = reportes.length;
    reportes.forEach((emp) => {
        if (emp.bill == "Billed") {
            billed_tot++;
        }
        if (emp.bill == "Investment") {
            invest_tot++;
        }
        if (emp.bill == "Spl. Leave") {
            spl_leave_tot++;
        }
        if (emp.bill == "Use Bench") {
            use_bench_tot++;
        }
        if (emp.bill == "Internal Projects") {
            intrl_tot++;
        }
        if (emp.bill == "Buffer") {
            buffer_tot++;
        }
        len = len + getChildBillingStatus(emp.empId);
    });
    return billed_tot + "," + invest_tot + "," + use_bench_tot + "," + spl_leave_tot + "," + intrl_tot + "," + buffer_tot;
}
function getChildListLength(repMangId) {
    const reportes = importedEmpList.filter(
        (emp) => emp.repMangId == repMangId
    );
    let len = reportes.length;
    reportes.forEach((emp) => {
        len = len + getChildListLength(emp.empId);
    });
    return len;
}

function FetchChild() {
    var data = [];
    $("#org > li").each(function () {
        data.push(buildJSON($(this)));
    });

    return data;
}

let serialNumber = 1;


function buildJSON($li) {
    var subObj = {
        name: $li.contents().eq(0).text().trim() ||
            $li.find('[class="emp-name"]').text().trim(),
    };
    importedEmpList.push({
        empName: $li.find(">.emp-name").text(),
        empId: Number($li.find(".emp-id").val()),
        empDesg: $li.find(">.emp-desg").text(),
        repMangId: Number($li.find(".emp-repMangId").val()),
        repMangName: $li.find(".emp-repMangName").val(),
        locat: $li.find(".emp-locat").val(),
        dept: $li.find(".emp-dept").val(),
        bill: $li.find(".emp-bill").val(),
        sow_id: $li.find(".emp-sow-id").val(),
        sow_name: $li.find(".emp-sow-name").val(),
        cus_name: $li.find(".emp-cus-name").val(),
        start_date: $li.find(".emp-start-date").val(),
        end_date: $li.find(".emp-end-date").val(),
        collapsed: $li.hasClass('collapsed'),

    });
    serialNumber = serialNumber + 1;
    $li
        .children("ul")
        .children()
        .each(function () {
            if (!subObj.children) {
                subObj.children = [];
            }
            subObj.children.push(buildJSON($(this)));
        });
    return subObj;
}

function resetAndUpdate() {
    importedEmpList = [];
    var obj = FetchChild();
    revertChanges.push(importedEmpList);
    $("#orgData").html(getReportingEmpData(0, true));
    $("#org").jOrgChart({
        chartElement: "#chart",
        dragAndDrop: true,
    });
    if (revertChanges.length > 0) {
        $('#save').prop('disabled', false);
    }
}

function SOWFetchChild() {
    var data = [];
    $("#org > li").each(function () {
        data.push(buildSOWJSON($(this)));
    });

    return data;
}

function SOWresetAndUpdate() {
    importedEmpList = [];
    var obj = SOWFetchChild();
    revertChanges.push(importedEmpList);
    $("#orgData").html(getReportingEmpData(0, true));
    $("#org").jOrgChart({
        chartElement: "#chart",
        dragAndDrop: true,
    });
    if (revertChanges.length > 0) {
        $('#save').prop('disabled', false);
    }
}

function buildSOWJSON($li) {
    var subObj = {
        name: $li.contents().eq(0).text().trim() ||
            $li.find('[class="emp-name"]').text().trim(),
    };
    importedEmpList.push({
        empName: $li.find(">.emp-name").text(),
        empId: Number($li.find(".emp-id").val()),
        empDesg: $li.find(">.emp-desg").text(),
        repMangId: Number($li.find(".emp-repMangId").val()),
        repMangName: $li.find(".emp-repMangName").val(),
        locat: $li.find(".emp-locat").val(),
        dept: $li.find(".emp-dept").val(),
        bill: $li.find(".emp-bill").val(),
        sow_id: $li.find(".emp-sow-id").val(),
        sow_name: $li.find(".emp-sow-name").val(),
        cus_name: $li.find(".emp-cus-name").val(),
        start_date: $li.find(".emp-start-date").val(),
        end_date: $li.find(".emp-end-date").val(),
        collapsed: $li.hasClass('collapsed'),

    });
    serialNumber = serialNumber + 1;
    $li
        .children("ul")
        .children()
        .each(function () {
            if (!subObj.children) {
                subObj.children = [];
            }
            subObj.children.push(buildJSON($(this)));
        });
    return subObj;
}

//Converting Json to CSV file

function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
    });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function download() {
    var headers = {
        sNo: 'S No',
        empName: 'Name of the Employee'.replace(/,/g, ''), // remove commas to avoid errors
        empId: "Emp ID",
        empDesg: "Designation".replace(/,/g, ''),
        repMangId: "Project Manager ID".replace(/,/g, ''),
        repMangName: "Reporting Manager".replace(/,/g, ''),
    };

    itemsNotFormatted = importedEmpList;

    var itemsFormatted = [];
    itemsNotFormatted.forEach((item) => {
        itemsFormatted.push({
            sNo: item.sNo,
            empName: item.empName.replace(/,/g, ''), // remove commas to avoid errors,
            empId: item.empId,
            empDesg: item.empDesg.replace(/,/g, ''),
            repMangId: item.repMangId,
            repMangName: item.repMangName,
        });
    });
    var fileTitle = 'Org_Structure_gen'; // or 'my-unique-title'

    exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}

function revertChangesFun() {
    revertChanges.length = revertChanges.length - 1;
    importedEmpList = revertChanges[revertChanges.length - 1];
    if (revertChanges.length <= 1) {
        $('#revert').prop('disabled', true);
    } else {
        $('#revert').prop('disabled', false);
    }
    $('#chart').children().remove();
    $('#orgData').html(getReportingEmpData(0, true));
    $('#org').jOrgChart({
        chartElement: "#chart",
        dragAndDrop: true,
    });
}

function createScenario() {
    //download();
    var id_count = $('#mySidenav a').length;
    let country = "";
    var createData = "";
    let jsonCreation = "";
    let new_date = getDateTime();
    let scn_name_filter = scenario_list.filter(s => s.SCENARIO_NAME.includes(new_date));
    let dateFilterList = scenario_list.filter(s => s.SCENARIO_NAME.includes(new_date));
    let newScenarioName = dateFilterList.length > 0 ? "SCN_" + new_date + "_" + (dateFilterList.length + 1) : "SCN_" + new_date + "_1";
    importedEmpList.forEach((emp) => {
        country = emp.locat;
        let empIdApp = emp.empId.toString();
        let repMangIdApp = emp.repMangId.toString();
        if (empIdApp.length == 1) {
            empIdApp = "000" + empIdApp
        } else if (empIdApp.length == 2) {
            empIdApp = "00" + empIdApp
        } else if (empIdApp.length == 3) {
            empIdApp = "0" + empIdApp
        }
        if (repMangIdApp.length == 1) {
            repMangIdApp = "000" + repMangIdApp
        } else if (repMangIdApp.length == 2) {
            repMangIdApp = "00" + repMangIdApp
        } else if (repMangIdApp.length == 3) {
            repMangIdApp = "0" + repMangIdApp
        }
        let user = "0206"
        jsonCreation = jsonCreation + "{ \"EMPLOYEE_ID\" : \"" + empIdApp +
            "\", \"EMPLOYEE_NAME\":\"" + emp.empName +
            "\", \"DESIGNATION\":\"" + emp.empDesg +
            "\", \"DEPARTMENT\":\"" + emp.dept +
            "\", \"REPORTING_MANAGER_ID\":\"" + repMangIdApp +
            "\", \"REPORTING_MANAGER\":\"" + emp.repMangName +
            "\", \"LOCATION\":\"" + emp.locat +
            "\", \"BILLING_STATUS\":\"" + emp.bill +
            "\", \"SCENARIO_NAME\":\"" + newScenarioName +
            "\", \"CREATED_BY\":\"" + user +
            "\", \"SOW_ID\":\"" + emp.sow_id +
            "\", \"SOW_NAME\":\"" + emp.sow_name +
            "\", \"CUSTOMER_NAME\":\"" + emp.cus_name +
            "\", \"START_DATE\":\"" + emp.start_date +
            "\", \"END_DATE\":\"" + emp.end_date +
            "\"},"

    });
    if (jsonCreation.endsWith(",")) {
        jsonCreation = jsonCreation.slice(0, -1);
    }
    createData = {
        "SCENARIO_NAME": newScenarioName,
        "query_type": "insert_scenario",
        "CREATED_BY": "0206",
        "LOCATION": country,
        "db_name": apiValue.db_name,
        "environment": apiValue.environment,
        "scenario": "[" + jsonCreation + "]"
    }
    $.ajax({
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        data: JSON.stringify(createData),
        success: function (json) {
            if (json == "Insert successful!") {
                getData();
                loadChart(newScenarioName);
                toastr.options.timeOut = 2000; // 2s
                toastr.success('Scenario created successfully');
            } else {
                toastr.options.timeOut = 2000; // 2s
                toastr.error('Scenario not created, Please try again');
            }
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
            toastr.options.timeOut = 2000; // 2s
            toastr.error('Message error' + JSON.stringify(error));
        }
    });
}

function saveScenario() {
    let selectedValue = $(".active").text().trim();
    let updateData = "";
    let jsonCreation = "";
    let updatedList = [];
    let changeVal = revertChanges.length - 1;
    let country = "";
    updatedList = importedEmpList;
    updatedList.forEach((emp) => {
        country = emp.locat;
        let empIdApp = emp.empId.toString();
        let repMangIdApp = emp.repMangId.toString();
        if (empIdApp.length == 1) {
            empIdApp = "000" + empIdApp
        } else if (empIdApp.length == 2) {
            empIdApp = "00" + empIdApp
        } else if (empIdApp.length == 3) {
            empIdApp = "0" + empIdApp
        }
        if (repMangIdApp.length == 1) {
            repMangIdApp = "000" + repMangIdApp
        } else if (repMangIdApp.length == 2) {
            repMangIdApp = "00" + repMangIdApp
        } else if (repMangIdApp.length == 3) {
            repMangIdApp = "0" + repMangIdApp
        }
        let user = "0206"
        jsonCreation = jsonCreation + "{ \"EMPLOYEE_ID\" : \"" + empIdApp +
            "\", \"EMPLOYEE_NAME\":\"" + emp.empName +
            "\", \"DESIGNATION\":\"" + emp.empDesg +
            "\", \"DEPARTMENT\":\"" + emp.dept +
            "\", \"REPORTING_MANAGER_ID\": \"" + repMangIdApp +
            "\", \"REPORTING_MANAGER\":\"" + emp.repMangName +
            "\", \"LOCATION\":\"" + emp.locat +
            "\", \"BILLING_STATUS\":\"" + emp.bill +
            "\", \"SCENARIO_NAME\":\"" + selectedValue +
            "\", \"CREATED_BY\":\"" + user +
            "\", \"SOW_ID\":\"" + emp.sow_id +
            "\", \"SOW_NAME\":\"" + emp.sow_name +
            "\", \"CUSTOMER_NAME\":\"" + emp.cus_name +
            "\", \"START_DATE\":\"" + emp.start_date +
            "\", \"END_DATE\":\"" + emp.end_date +
            "\"},"

    });
    if (jsonCreation.endsWith(",")) {
        jsonCreation = jsonCreation.slice(0, -1);
    }
    updateData = {
        //"SCENARIO_NAME":"Scenario "+id_count,
        "SCENARIO_NAME": selectedValue,
        //"CREATED_BY": 206,
        "LOCATION": country,
        "query_type": "update_scenario",
        "CREATED_BY": "0206",
        "db_name": apiValue.db_name,
        "environment": apiValue.environment,
        "scenario": "[" + jsonCreation + "]"
    }
    $.ajax({
        url: apiValue.url,
        // url: "https://rre-api.factspanapps.com:5000/app",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        data: JSON.stringify(updateData),
        success: function (json) {
            let id = selectedValue.replaceAll(" ", "_");
            getData();
            $('select[name="org_chart_select"]').find('option[value="' + selectedValue + '"]').attr("selected", true);
            loadChart(selectedValue);
            toastr.options.timeOut = 2000; // 2s
            toastr.success('Scenario updated successfully');
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
            toastr.options.timeOut = 2000; // 2s
            toastr.success('Message error' + JSON.stringify(error));
        }
    });

}

function saveOrgChart() {
    let selectedValue = $(".active").html();
    let updateData = "";
    let jsonCreation = "";
    let updatedList = [];
    let country = "";
    if (revertChanges.length != 0) {
        let changeVal = revertChanges.length - 1;
        updatedList = revertChanges[changeVal];
    } else {
        updatedList = importedEmpList;
    }
    updatedList.forEach((emp) => {
        country = emp.locat;
        let empIdApp = emp.empId.toString();
        let repMangIdApp = emp.repMangId.toString();
        if (country == "US") {
            if (empIdApp.length == 1) {
                empIdApp = "00" + empIdApp
            } else if (empIdApp.length == 2) {
                empIdApp = "0" + empIdApp
            }
            if (repMangIdApp.length == 1) {
                repMangIdApp = "00" + repMangIdApp
            } else if (repMangIdApp.length == 2) {
                repMangIdApp = "0" + repMangIdApp
            }
        } else {
            if (empIdApp.length == 1) {
                empIdApp = "000" + empIdApp
            } else if (empIdApp.length == 2) {
                empIdApp = "00" + empIdApp
            } else if (empIdApp.length == 3) {
                empIdApp = "0" + empIdApp
            }
            if (repMangIdApp.length == 1) {
                repMangIdApp = "000" + repMangIdApp
            } else if (repMangIdApp.length == 2) {
                repMangIdApp = "00" + repMangIdApp
            } else if (repMangIdApp.length == 3) {
                repMangIdApp = "0" + repMangIdApp
            }
        }
        let user = "0206"
        jsonCreation = jsonCreation + "{ \"EMPLOYEE_ID\" : \"" + empIdApp +
            "\", \"EMPLOYEE_NAME\":\"" + emp.empName +
            "\", \"DESIGNATION\":\"" + emp.empDesg +
            "\", \"DEPARTMENT\":\"" + emp.dept +
            "\", \"REPORTING_MANAGER_ID\": \"" + repMangIdApp +
            "\", \"REPORTING_MANAGER\":\"" + emp.repMangName +
            "\", \"LOCATION\":\"" + emp.locat +
            "\", \"BILLING_STATUS\":\"" + emp.bill +
            "\", \"SCENARIO_NAME\":\"" + selectedValue +
            "\", \"CREATED_BY\":\"" + user +
            "\", \"SOW_ID\":\"" + emp.sow_id +
            "\", \"SOW_NAME\":\"" + emp.sow_name +
            "\", \"CUSTOMER_NAME\":\"" + emp.cus_name +
            "\", \"START_DATE\":\"" + emp.start_date +
            "\", \"END_DATE\":\"" + emp.end_date +
            "\"},"

    });
    if (jsonCreation.endsWith(",")) {
        jsonCreation = jsonCreation.slice(0, -1);
    }
    updateData = {
        "query_type": "final_scenario",
        "location_data": country,
        "db_name": apiValue.db_name,
        "environment": apiValue.environment,
        "scenario": "[" + jsonCreation + "]"
    }
    $.ajax({
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        data: JSON.stringify(updateData),
        success: function (json) {
            let id = selectedValue.replaceAll(" ", "_");
            getData();
            $('select[name="org_chart_select"]').find('option[value="Org"]').attr("selected", true);
            toastr.options.timeOut = 2000; // 2s
            toastr.success('Org chart saved successfully');
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
            toastr.options.timeOut = 2000; // 2s
            toastr.success('Message error' + JSON.stringify(error));
        }
    });

}

function getIntials(name) {
    if (name == 'CEO') {
        return name;
    } else if (name == 'Scrum Master') {
        return "Sc. M";
    } else if (name == 'BENCH') {
        return "BE";
    } else if (name == "") {
        return "";
    }
    else {
        var acronym = name.match(/\b(\w)/g).join('');
        return acronym;
    }
}

function getColorValue(obj) {
    let checkedValue = $('#d').is(":checked");
    if (checkedValue == true) {
        orgchartIndUsData(empUsData);
        $("#ind_legends").removeClass("is-active");
        $("#us_legends").addClass("is-active");
        $("#emp_button").css("display", "none");
        $("#sow_button").css("display", "block");
    } else {
        orgchartIndUsData(empIndData);
        $("#ind_legends").addClass("is-active");
        $("#us_legends").removeClass("is-active");
        $("#emp_button").css("display", "block");
        $("#sow_button").css("display", "none");
    }
}

function getColorValue_br() {
    let checkedValue = $('#d').is(":checked");
    if (checkedValue == false) {
        orgchartIndUsData(empIndData);
        $("#ind_legends").addClass("is-active");
        $("#us_legends").removeClass("is-active");
        $("#emp_button").css("display", "block");
        $("#sow_button").css("display", "none");
    } else {
        orgchartIndUsData(empUsData);
        $("#ind_legends").removeClass("is-active");
        $("#us_legends").addClass("is-active");
        $("#emp_button").css("display", "none");
        $("#sow_button").css("display", "block");
    }
}

function orgchartIndUsData(orgData) {
    var id = orgData.DEFAULT.SCENARIO_NAME.replace(" ", "_");
    $("#org_chart_select").empty();
    $("#mySidenav").append("<a id=" + id + " onClick='loadChart(\"" + orgData.DEFAULT.SCENARIO_NAME + "\")'><img id='" + id + "_img' src='images\\organization-chart_icon.png' alt='Org Chart Icon' width='20' height='25' ><img id='" + id + "_img' src='images\\organization-chart_hover.png' alt='Org Chart Icon' width='20' height='25' > " + orgData.DEFAULT.SCENARIO_NAME + "</a>");
    $('#org_chart_select').append("<option id=" + id + " onchange='loadChart(\"" + orgData.DEFAULT.SCENARIO_NAME + "\")' value=" + orgData.DEFAULT.SCENARIO_NAME + " >" + orgData.DEFAULT.SCENARIO_NAME + "</option>");
    if (Object.keys(orgData).length > 1) {
        scenario_list = orgData.SAVED;
        scenario_list.forEach(scr => {
            var id = scr.SCENARIO_NAME.replace(" ", "_");
            $("#mySidenav").append("<a id=" + id + " onClick='loadChart(\"" + scr.SCENARIO_NAME + "\")'><img id='" + id + "_img' src='images\\scenario_icon.png' alt='Org Chart Icon' width='20' height='25'><img id='" + id + "_img' src='images\\scenario_icon_hover.png' alt='Org Chart Icon' width='20' height='25'> " + scr.SCENARIO_NAME + "</a>");
            $('#org_chart_select').append("<option id=" + id + " onchange='loadChart(\"" + scr.SCENARIO_NAME + "\")' value=" + scr.SCENARIO_NAME.trim() + ">" + scr.SCENARIO_NAME.trim() + "</option>");
        });

    }
    jsonData = orgData;
    loadChart("Org Chart");
    $("#Org_Chart").addClass("active");
    $('#Org_Chart_img').attr('src', 'images\\organization-chart_hover.png');
    var org = [];
    org = jsonData.data;
}

function getSelectedTeam() {
    let selectedTeam = $('input[name="teamMoveName"]:checked').val();
    if (selectedTeam == "No") {
        $("#assign_team").show();
    } else {
        $("#assign_team").hide();
    }

}
let sow_names_options = "";
let mang_name_options = "";
let emp_name_options = "";
let mang_name_options_us = "";
let emp_name_options_us = "";
let bill_status_options = "";
let SOW_mapped_rep_man_Json = [];
function appendOrgChartData(sour_emp_id, sour_emp_repMagId, perv_emp_repMangId, sour_emp_name, prev_repMangName, target_rep_emp_name, emp_cus_name, emp_sow_id, emp_sow_name, emp_bill_name) {
    $("#employee_button").click();
    let selectedCountry = $('#d').is(":checked");
    if (sow_names_options == "") {
        getAccountNameOptions();
    }
    if (selectedCountry == "US" || selectedCountry == true) {
        assignUSEmpManOptions();
        if (sour_emp_id.length == 1) {
            sour_emp_id = "00" + sour_emp_id;
        } else if (sour_emp_id.length == 2) {
            sour_emp_id = "0" + sour_emp_id;
        }

        if (sour_emp_repMagId.length == 1) {
            sour_emp_repMagId = "00" + sour_emp_repMagId;
        } else if (sour_emp_repMagId.length == 2) {
            sour_emp_repMagId = "0" + sour_emp_repMagId;
        }
    } else {
        assignIndEmpManOptions();
        if (sour_emp_id.length == 1) {
            sour_emp_id = "000" + sour_emp_id;
        } else if (sour_emp_id.length == 2) {
            sour_emp_id = "00" + sour_emp_id;
        } else if (sour_emp_id.length == 3) {
            sour_emp_id = "0" + sour_emp_id;
        }

        if (sour_emp_repMagId.length == 1) {
            sour_emp_repMagId = "000" + sour_emp_repMagId;
        } else if (sour_emp_repMagId.length == 2) {
            sour_emp_repMagId = "00" + sour_emp_repMagId;
        } else if (sour_emp_repMagId.length == 3) {
            sour_emp_repMagId = "0" + sour_emp_repMagId;
        }
    }

    $("#assign_project").html(sow_names_options);
    $("#billing_status_option").html(bill_status_options);
    $("#billing_status_option").val(emp_bill_name);


    $("#report_name").val(sour_emp_id);
    $("#report_manager").val(sour_emp_repMagId);
    $("#previous_manager").val(prev_repMangName);
    $("#sour_emp_id").val(sour_emp_id);
    $("#perv_emp_repMangId").val(perv_emp_repMangId);
    $("#sour_emp_repMagId").val(sour_emp_repMagId);
    $("#emp_sow_id").val(emp_sow_id);
    $("#emp_sow_name").val(emp_sow_name);
    $("input:radio[value='Yes']").prop('checked', true);
    $("#assign_team").hide();
    let new_option = "";
    var sow_filter = jQuery.grep(SOW_mapped_rep_man_Json, function (sowID, i) {
        return sowID.REPORTING_MANAGER_ID == sour_emp_repMagId;
    });
    $.each(sow_filter, function (value, sowIdSelect) {
        new_option = sowIdSelect.SOW_ID;
    });
    $("#assign_project").val(new_option);
    let repMangChange = importedEmpList.filter(({ repMangId }) => repMangId == sour_emp_id);
    let time = getDateTime();
    $("#select_date").val(time);
}

function GetTodayDate() {
    var tdate = new Date();
    var dd = tdate.getDate(); //yields day
    var MM = tdate.getMonth(); //yields month
    var yyyy = tdate.getFullYear(); //yields year
    dd = checkZero(dd);
    MM = checkZero(MM);
    yyyy = checkZero(yyyy);
    var currentDate = yyyy + "-" + (MM + 1) + "-" + dd;
    function checkZero(data) {
        if (data.length == 1) {
            data = "0" + data;
        }
        return data;
    }
    return currentDate;
}

function savePopupOrgChartEmp() {
    let sour_emp_name = $("#report_name option:selected").text();
    let target_rep_emp_name = $("#report_manager option:selected").text();
    let emp_cus_name_text = $("#assign_project option:selected").text();
    let emp_cus_name_val = $("#assign_project option:selected").val();
    let prev_repMangName = $("#previous_manager").val();
    let sour_emp_id = $("#report_name option:selected").val();
    let perv_emp_repMangId = $("#perv_emp_repMangId").val();
    let sour_emp_repMagId = $("#report_manager option:selected").val();
    let emp_sow_id = $("#emp_sow_id").val();
    let emp_sow_name = $("#emp_sow_name").val();
    let start_date = $("#select_date").val();
    let bill_status_data = $("#billing_status_option option:selected").val();
    let modifiedEmpList = [];
    if (revertChanges.length > 1) {
        revertChanges.length = revertChanges.length - 1;
        // importedEmpList = revertChanges[revertChanges.length - 1];
        modifiedEmpList = revertChanges[revertChanges.length - 1];
    } else {
        modifiedEmpList = existingEmpList;
    }
    var array = emp_cus_name_text.split(" _ ");
    let cus_name = array[0];
    let sow_name = array[1];
    importedEmpList = modifiedEmpList;
    let empid = importedEmpList.findIndex(f => f.empId == sour_emp_id)
    importedEmpList[empid]["start_date"] = start_date;
    importedEmpList[empid]["repMangId"] = sour_emp_repMagId;
    importedEmpList[empid]["sow_id"] = emp_cus_name_val;
    importedEmpList[empid]["repMangName"] = target_rep_emp_name;
    importedEmpList[empid]["cus_name"] = cus_name;
    importedEmpList[empid]["sow_name"] = sow_name;
    importedEmpList[empid]["empName"] = sour_emp_name;
    importedEmpList[empid]["bill"] = bill_status_data;
    let repMangChange = importedEmpList.filter(({ repMangId }) => repMangId == sour_emp_id);
    let selectedTeam = $('input[name="teamMoveName"]:checked').val();
    let assign_entr_team_id = $("#assign_entr_team option:selected").val();
    let assign_entr_team_name = $("#assign_entr_team option:selected").text();
    if (selectedTeam == 'No') {
        if (repMangChange.length > 0) {
            importedEmpList.forEach(emp => {
                if (emp.repMangId == sour_emp_id) {
                    emp.repMangId = assign_entr_team_id;
                    emp.repMangName = assign_entr_team_name;
                }
            });
        }
    }
    $('#chart').children().remove();
    $('#orgData').html(getReportingEmpData(0, true));
    $('#org').jOrgChart({
        chartElement: "#chart",
        dragAndDrop: true,
    });
    if (revertChanges.length > 0) {
        $('#save').prop('disabled', false);
    }
}

// To get Account names API 

function getAccountNameOptions() {
    var empData = [];
    let status = "";
    $.ajax({
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            query_type: "Mang_emp_details",
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        }),
        success: function (data) {
            let SOW_Details_Json = data[0].SOW_Details.sort(GetSortOrder("Acc_Name"));
            let Manager_Details_Json = data[0].Manager_Details_IND.sort(GetSortOrder("MANGER_NAME"));
            let Employee_Details_Json = data[0].Employee_Details_IND.sort(GetSortOrder("EMPLOYEE_NAME"));
            let Manager_Details_Json_US = data[0].Manager_Details_US.sort(GetSortOrder("MANGER_NAME"));
            let Employee_Details_Json_US = data[0].Employee_Details_US.sort(GetSortOrder("EMPLOYEE_NAME"));
            let Billing_status_Json = data[0].BILLING_STATUS.sort(GetSortOrder("BILLING_STATUS"));
            SOW_mapped_rep_man_Json = data[0].SOW_MANAGER_MAP.sort(GetSortOrder("REPORTING_MANAGER_NAME"));
            $.each(SOW_Details_Json, function (value, sow_names) {
                sow_names_options += '<option value="' + sow_names.SOW_ID + '">' + sow_names.Acc_Name + " _ " + sow_names.SOW_NAME + '</option>';
            });
            $.each(Manager_Details_Json, function (value, mangNameInd) {
                mang_name_options += '<option value="' + mangNameInd.MANGER_ID + '">' + mangNameInd.MANGER_NAME + '</option>';
            });
            $.each(Employee_Details_Json, function (value, empNamesInd) {
                emp_name_options += '<option value="' + empNamesInd.EMPLOYEE_ID + '">' + empNamesInd.EMPLOYEE_NAME + '</option>';
            });
            $.each(Manager_Details_Json_US, function (value, mangNamesUS) {
                mang_name_options_us += '<option value="' + mangNamesUS.MANGER_ID + '">' + mangNamesUS.MANGER_NAME + '</option>';
            });
            $.each(Employee_Details_Json_US, function (value, empNamesUS) {
                emp_name_options_us += '<option value="' + empNamesUS.EMPLOYEE_ID + '">' + empNamesUS.EMPLOYEE_NAME + '</option>';
            });
            $.each(Billing_status_Json, function (value, bill_names) {
                bill_status_options += '<option value="' + bill_names.BILLING_STATUS + '">' + bill_names.BILLING_STATUS + '</option>';
            });

        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
}
let emp_name_options_sow = "";
let sow_names_options_sow = "";
let mang_name_options_sow = "";
let bill_status_options_sow = "";
let Manager_Details_Json_sow = [];
function getSOWPopupNameOptions() {
    var empData = [];
    let status = "";
    $.ajax({
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            query_type: "all_details",
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        }),
        success: function (data) {
            let SOW_Details_Json_sow = data[2].SOW_DETAILS;
            Manager_Details_Json_sow = data[0].MANAGER_DETAILS.sort(GetSortOrder("REPORTING_MANAGER_NAME"));
            let Employee_Details_Json_sow = data[1].EMPLOYEE_DETAILS.sort(GetSortOrder("EMPLOYEE_NAME"));
            let Billing_status_sow = data[3].BILLING_STATUS.sort(GetSortOrder("BILLING_STATUS"));
            SOW_Details_Json_sow = SOW_Details_Json_sow.sort(GetSortOrder("CUSTOMER_NAME"));
            $.each(SOW_Details_Json_sow, function (value, sow_names) {
                sow_names_options_sow += '<option value="' + sow_names.SOW_ID + '">' + sow_names.CUSTOMER_NAME + " _ " + sow_names.SOW_NAME + '</option>';
            });
            $.each(Manager_Details_Json_sow, function (value, mangName) {
                mang_name_options_sow += '<option value="' + mangName.REPORTING_MANAGER_ID + '">' + mangName.REPORTING_MANAGER_NAME + '</option>';
            });
            $.each(Employee_Details_Json_sow, function (value, empNames) {
                emp_name_options_sow += '<option value="' + empNames.EMPLOYEE_ID + '">' + empNames.EMPLOYEE_NAME + '</option>';
            });
            $.each(Billing_status_sow, function (value, billStatus) {
                bill_status_options_sow += '<option value="' + billStatus.BILLING_STATUS + '">' + billStatus.BILLING_STATUS + '</option>';
            });


        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
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

function popupCloseChanges() {
    let modifiedEmpList = [];
    if (revertChanges.length > 1) {
        revertChanges.length = revertChanges.length - 1;
        modifiedEmpList = revertChanges[revertChanges.length - 1];
    } else {
        modifiedEmpList = existingEmpList;
    }
    importedEmpList = modifiedEmpList;
    $('#chart').children().remove();
    $("#orgData").html(getReportingEmpData(0, true));
    $("#org").jOrgChart({
        chartElement: "#chart",
        dragAndDrop: true,
    });
    if (revertChanges.length > 0) {
        $('#save').prop('disabled', false);
    }
}

function assignIndEmpManOptions() {
    $("#assign_entr_team").html(mang_name_options);
    $("#report_manager").html(mang_name_options);
    $("#report_name").html(emp_name_options);
}

function assignUSEmpManOptions() {
    $("#assign_entr_team").html(mang_name_options_us);
    $("#report_manager").html(mang_name_options_us);
    $("#report_name").html(emp_name_options_us);
}

function appendSowChartData(emp_id, sour_emp_fullname, emp_cus_name, emp_sow_name, emp_sow_id, target_name, target_cus_name, target_org_name, emp_bill, emp_cus_status) {
    $("#sowchart_button").click();
    if (sow_names_options_sow == "") {
        getSOWPopupNameOptions();
    }

    $("#sow_assign_project").html(sow_names_options_sow);
    $("#sow_report_name").val(sour_emp_fullname);
    $("#sow_sour_emp_id").val(emp_id);
    $("#sow_prev_project").val(emp_cus_name + " _ " + emp_sow_name);
    $("#target_org_name").val(target_org_name);
    $("#target_cus_name").val(target_cus_name);
    $("#target_name").val(target_name);

    let assign_prjct = "", prjct_start_date = "", prjct_end_date = "", billing = "", sow_cus_id = "";
    let tar_sow_code = "", tar_sow_id = "", tar_status = "";

    importedEmpList.forEach(emp => {
        if (emp.cus_name == target_cus_name && emp.sow_name == target_name) {
            prjct_end_date = emp.project_end_date;
            billing = emp.bill;
            sow_cus_id = emp.cus_id;
            tar_sow_code = emp.sow_code;
            tar_sow_id = emp.sow_id;
            tar_status = emp.status;
            sow_emp_cus_id = emp.cus_id;
            sow_emp_sow_code = emp.sow_code;
            sow_emp_sow_id = emp.sow_id;
            sow_emp_cus_status = emp.status;
            target_cus_name = emp.CUSTOMER_NAME;
            sow_billing_status = emp.bill;
            sow_prjct_end_date = emp.project_end_date;
            target_name = emp.sow_name;
        }
    });
    //filter based on  selected year.
    var manager_filter = jQuery.grep(Manager_Details_Json_sow, function (manaName, i) {
        return manaName.SOW_ID == tar_sow_id;
    });
    mang_name_options_sow = "";
    let new_option = "0206";
    $.each(manager_filter, function (value, mangName) {
        new_option = mangName.REPORTING_MANAGER_ID;
    });
    $.each(Manager_Details_Json_sow, function (value, mangName) {
        mang_name_options_sow += '<option value="' + mangName.REPORTING_MANAGER_ID + '">' + mangName.REPORTING_MANAGER_NAME + '</option>';
    });
    let time = getDateTime();
    $("#report_manager_sow").html(mang_name_options_sow);
    $("#sow_assign_project").val(tar_sow_id);
    $("#sow_billing_status").html(bill_status_options_sow);
    $("#sow_billing_status").val(billing);
    $("#sow_prjct_start_date").val(time);
    $("#sow_prjct_end_date").val(prjct_end_date);
    $("#sow_emp_cus_name").val(emp_cus_name);
    $("#sow_emp_sow_name").val(emp_sow_name);
    $("#sow_emp_sow_id").val(tar_sow_id);
    $("#sow_emp_sow_code").val(tar_sow_code);
    $("#sow_emp_cus_id").val(sow_cus_id);
    $("#sow_emp_cus_status").val(tar_status);
    if (tar_sow_id == "99994") {
        $("#report_manager_sow").val("0206");
    } else if (tar_sow_id == "99999") {
        $("#report_manager_sow").val("0206");
    } else {
        $("#report_manager_sow").val(new_option);
    }

    $("#assign_team").hide();
    let repMangChange = importedEmpList.filter(({ repMangId }) => repMangId == sour_emp_id);

};

function savePopupSowChartEmp() {
    let sow_assign_project = $("#sow_assign_project option:selected").text();
    var array = sow_assign_project.split(" _ ");
    let cus_name = array[0];
    let sow_name = array[1];
    if (cus_name != "") {
        sow_billing_status = $("#sow_billing_status option:selected").val();
        sow_prjct_start_date = $("#sow_prjct_start_date").val();
        sow_prjct_end_date = $("#sow_prjct_end_date").val();
        sow_emp_sow_id = $("#sow_emp_sow_id").val();
        sow_emp_sow_code = $("#sow_emp_sow_code").val();
        sow_emp_cus_id = $("#sow_emp_cus_id").val();
        sow_emp_cus_status = $("#sow_emp_cus_status").val();
        target_cus_name = $("#target_cus_name").val();
        target_name = $("#target_name").val();
        sow_sour_emp_id = $("#sow_sour_emp_id").val();
        report_manager_sow_val = $("#report_manager_sow option:selected").val();
        report_manager_sow_text = $("#report_manager_sow option:selected").text();
        let empid = importedEmpList.findIndex(f => f.empId == sow_sour_emp_id)
        importedEmpList[empid]["CUSTOMER_NAME"] = target_cus_name;
        importedEmpList[empid]["bill"] = sow_billing_status;
        importedEmpList[empid]["cus_id"] = sow_emp_cus_id;
        importedEmpList[empid]["cus_name"] = target_cus_name;
        importedEmpList[empid]["project_end_date"] = sow_prjct_end_date;
        importedEmpList[empid]["project_start_date"] = sow_prjct_start_date;
        importedEmpList[empid]["sow_code"] = sow_emp_sow_code;
        importedEmpList[empid]["sow_id"] = sow_emp_sow_id;
        importedEmpList[empid]["sow_name"] = target_name;
        importedEmpList[empid]["SOW_NAME"] = target_name;
        importedEmpList[empid]["status"] = sow_emp_cus_status;
        importedEmpList[empid]["repMangId"] = Number(report_manager_sow_val);
        importedEmpList[empid]["repMangName"] = report_manager_sow_text;
    }


    $('#chart').children().remove();
    let chartData = `<ul id='org'><li class="class-factspan "> <span class="emp-name class-factspan-name">Factspan</span><span
    class="emp-desg class-factspan-desg"></span><input
    type="hidden" class="emp-id" value="1"><input type="hidden" class="emp-repMangId" value="0"><input type="hidden"
    class="emp-repMangName" value="">` + getCompanyData('Factspan') + `</li></ul>`;
    $("#orgData").html(chartData);
    $("#org").jOrgChart({
        chartElement: "#chart",
        dragAndDrop: true,
    });
    if (revertChanges.length > 0) {
        $('#save').prop('disabled', false);
    }
}


function createSOWScenario() {
    //download();
    var id_count = $('#mySidenav a').length;
    let country = "";
    var createData = "";
    let jsonCreation = "";
    let new_date = getDateTime();
    let scn_name_filter = scenario_list.filter(s => s.SCENARIO_NAME.includes(new_date));
    let dateFilterList = scenario_list.filter(s => s.SCENARIO_NAME.includes(new_date));
    let newScenarioName = dateFilterList.length > 0 ? "SCN_" + new_date + "_" + (dateFilterList.length + 1) : "SCN_" + new_date + "_1";
    importedEmpList.forEach((emp) => {
        country = emp.locat;
        let empIdApp = emp.empId.toString();
        let repMangIdApp = emp.repMangId.toString();
        if (empIdApp.length == 1) {
            empIdApp = "000" + empIdApp
        } else if (empIdApp.length == 2) {
            empIdApp = "00" + empIdApp
        } else if (empIdApp.length == 3) {
            empIdApp = "0" + empIdApp
        }
        if (repMangIdApp.length == 1) {
            repMangIdApp = "000" + repMangIdApp
        } else if (repMangIdApp.length == 2) {
            repMangIdApp = "00" + repMangIdApp
        } else if (repMangIdApp.length == 3) {
            repMangIdApp = "0" + repMangIdApp
        }
        if (repMangIdApp == "0000") {
            repMangIdApp = "-9999";
        }
        let user = "0206"
        jsonCreation = jsonCreation + "{ \"EMPLOYEE_ID\" : \"" + empIdApp +
            "\", \"EMPLOYEE_NAME\":\"" + emp.empName +
            "\", \"DESIGNATION\":\"" + emp.empDesg +
            "\", \"DEPARTMENT\":\"" + emp.dept +
            "\", \"REPORTING_MANAGER_ID\":\"" + repMangIdApp +
            "\", \"REPORTING_MANAGER\":\"" + emp.repMangName +
            "\", \"LOCATION\":\"" + emp.locat +
            "\", \"BILLING_STATUS\":\"" + emp.bill +
            "\", \"Organization\":\"" + emp.Organization +
            "\", \"SCENARIO_NAME\":\"" + newScenarioName +
            "\", \"CREATED_BY\":\"" + user +
            "\", \"SOW_ID\":\"" + emp.sow_id +
            "\", \"SOW_CODE\":\"" + emp.sow_code +
            "\", \"SOW_NAME\":\"" + emp.sow_name +
            "\", \"CUSTOMER_ID\":\"" + emp.cus_id +
            "\", \"CUSTOMER_NAME\":\"" + emp.cus_name +
            "\", \"STATUS\":\"" + emp.status +
            "\", \"PROJECT_ALLOCATION_START_DATE\":\"" + emp.project_start_date +
            "\", \"PROJECT_ALLOCATION_END_DATE\":\"" + emp.project_end_date +
            "\", \"START_DATE\":\"" + emp.start_date +
            "\", \"END_DATE\":\"" + emp.end_date +
            "\"},"

    });
    if (jsonCreation.endsWith(",")) {
        jsonCreation = jsonCreation.slice(0, -1);
    }
    createData = {
        "SCENARIO_NAME": newScenarioName,
        "query_type": "insert_sow_scenario",
        "CREATED_BY": "0206",
        "db_name": apiValue.db_name,
        "environment": apiValue.environment,
        "scenario": "[" + jsonCreation + "]"
    }
    $.ajax({
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        data: JSON.stringify(createData),
        success: function (json) {
            if (json == "Insert successful!") {
                sow_root_data()
                loadSOWChart(newScenarioName)
                toastr.options.timeOut = 2000; // 2s
                toastr.success('Scenario created successfully');
            } else {
                toastr.options.timeOut = 2000; // 2s
                toastr.success('Scenario not created, Please try again');
            }
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
            toastr.options.timeOut = 2000; // 2s
            toastr.success('Message error' + JSON.stringify(error));
        }
    });
}
function saveSOWScenario() {
    let sowSelectedValue = $(".active").text().trim();
    var updateData = "";
    let jsonSOWCreation = "";
    importedEmpList.forEach((emp) => {
        country = emp.locat;
        let empIdApp = emp.empId.toString();
        let repMangIdApp = emp.repMangId.toString();
        if (country == "US") {
            if (empIdApp.length == 1) {
                empIdApp = "00" + empIdApp
            } else if (empIdApp.length == 2) {
                empIdApp = "0" + empIdApp
            }
            if (repMangIdApp.length == 1) {
                repMangIdApp = "00" + repMangIdApp
            } else if (repMangIdApp.length == 2) {
                repMangIdApp = "0" + repMangIdApp
            }
        } else {
            if (empIdApp.length == 1) {
                empIdApp = "000" + empIdApp
            } else if (empIdApp.length == 2) {
                empIdApp = "00" + empIdApp
            } else if (empIdApp.length == 3) {
                empIdApp = "0" + empIdApp
            }
            if (repMangIdApp.length == 1) {
                repMangIdApp = "000" + repMangIdApp
            } else if (repMangIdApp.length == 2) {
                repMangIdApp = "00" + repMangIdApp
            } else if (repMangIdApp.length == 3) {
                repMangIdApp = "0" + repMangIdApp
            }
        }
        if (repMangIdApp == "0000") {
            repMangIdApp = "-9999";
        }
        let user = "0206"
        jsonSOWCreation = jsonSOWCreation + "{ \"EMPLOYEE_ID\" : \"" + empIdApp +
            "\", \"EMPLOYEE_NAME\":\"" + emp.empName +
            "\", \"DESIGNATION\":\"" + emp.empDesg +
            "\", \"DEPARTMENT\":\"" + emp.dept +
            "\", \"REPORTING_MANAGER_ID\":\"" + repMangIdApp +
            "\", \"REPORTING_MANAGER\":\"" + emp.repMangName +
            "\", \"LOCATION\":\"" + emp.locat +
            "\", \"BILLING_STATUS\":\"" + emp.bill +
            "\", \"Organization\":\"" + emp.Organization +
            "\", \"SCENARIO_NAME\":\"" + sowSelectedValue +
            "\", \"CREATED_BY\":\"" + user +
            "\", \"SOW_ID\":\"" + emp.sow_id +
            "\", \"SOW_CODE\":\"" + emp.sow_code +
            "\", \"SOW_NAME\":\"" + emp.sow_name +
            "\", \"CUSTOMER_ID\":\"" + emp.cus_id +
            "\", \"CUSTOMER_NAME\":\"" + emp.cus_name +
            "\", \"STATUS\":\"" + emp.status +
            "\", \"PROJECT_ALLOCATION_START_DATE\":\"" + emp.project_start_date +
            "\", \"PROJECT_ALLOCATION_END_DATE\":\"" + emp.project_end_date +
            "\", \"START_DATE\":\"" + emp.start_date +
            "\", \"END_DATE\":\"" + emp.end_date +
            "\", \"UPDATED_BY\":\"" + user +
            "\"},"

    });
    if (jsonSOWCreation.endsWith(",")) {
        jsonSOWCreation = jsonSOWCreation.slice(0, -1);
    }
    let JsonData = {
        "SCENARIO_NAME": sowSelectedValue,
        "query_type": "update_sow_scenario",
        "CREATED_BY": "0206",
        "db_name": apiValue.db_name,
        "environment": apiValue.environment,
        "scenario": "[" + jsonSOWCreation + "]"
    }

    $.ajax({
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        data: JSON.stringify(JsonData),
        success: function (json) {
            sow_root_data()
            loadSOWChart(sowSelectedValue)
            toastr.options.timeOut = 2000; // 2s
            toastr.success('Scenario Updated successfully');
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
            toastr.options.timeOut = 2000; // 2s
            toastr.success('Message error' + JSON.stringify(error));
        }
    });

}

function saveFinalSOWChart() {
    let sowSelectedValue = $(".active").text().trim();
    var updateData = "";
    let jsonSOWCreation = "";
    importedEmpList.forEach((emp) => {
        country = emp.locat;
        let empIdApp = emp.empId.toString();
        let repMangIdApp = emp.repMangId.toString();
        if (country == "US") {
            if (empIdApp.length == 1) {
                empIdApp = "00" + empIdApp
            } else if (empIdApp.length == 2) {
                empIdApp = "0" + empIdApp
            }
            if (repMangIdApp.length == 1) {
                repMangIdApp = "00" + repMangIdApp
            } else if (repMangIdApp.length == 2) {
                repMangIdApp = "0" + repMangIdApp
            }
        } else {
            if (empIdApp.length == 1) {
                empIdApp = "000" + empIdApp
            } else if (empIdApp.length == 2) {
                empIdApp = "00" + empIdApp
            } else if (empIdApp.length == 3) {
                empIdApp = "0" + empIdApp
            }
            if (repMangIdApp.length == 1) {
                repMangIdApp = "000" + repMangIdApp
            } else if (repMangIdApp.length == 2) {
                repMangIdApp = "00" + repMangIdApp
            } else if (repMangIdApp.length == 3) {
                repMangIdApp = "0" + repMangIdApp
            }
        }
        if (repMangIdApp == "0000") {
            repMangIdApp = "-9999";
        }
        let user = "0206"
        jsonSOWCreation = jsonSOWCreation + "{ \"EMPLOYEE_ID\" : \"" + empIdApp +
            "\", \"EMPLOYEE_NAME\":\"" + emp.empName +
            "\", \"DESIGNATION\":\"" + emp.empDesg +
            "\", \"DEPARTMENT\":\"" + emp.dept +
            "\", \"REPORTING_MANAGER_ID\":\"" + repMangIdApp +
            "\", \"REPORTING_MANAGER\":\"" + emp.repMangName +
            "\", \"LOCATION\":\"" + emp.locat +
            "\", \"BILLING_STATUS\":\"" + emp.bill +
            "\", \"Organization\":\"" + emp.Organization +
            "\", \"SOW_ID\":\"" + emp.sow_id +
            "\", \"SOW_CODE\":\"" + emp.sow_code +
            "\", \"SOW_NAME\":\"" + emp.sow_name +
            "\", \"CUSTOMER_ID\":\"" + emp.cus_id +
            "\", \"CUSTOMER_NAME\":\"" + emp.cus_name +
            "\", \"STATUS\":\"" + emp.status +
            "\", \"PROJECT_ALLOCATION_START_DATE\":\"" + emp.project_start_date +
            "\", \"PROJECT_ALLOCATION_END_DATE\":\"" + emp.project_end_date +
            "\", \"START_DATE\":\"" + emp.start_date +
            "\", \"END_DATE\":\"" + emp.end_date +
            "\"},"

    });
    if (jsonSOWCreation.endsWith(",")) {
        jsonSOWCreation = jsonSOWCreation.slice(0, -1);
    }
    let JsonData = {
        "query_type": "final_sow_scenario",
        "environment": apiValue.environment,
        "scenario": "[" + jsonSOWCreation + "]"
    }

    $.ajax({
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        data: JSON.stringify(JsonData),
        success: function (json) {
            sow_root_data()
            loadSOWChart("SOW Chart")
            toastr.options.timeOut = 2000; // 2s
            toastr.success('Final Scenario Updated successfully');
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
            toastr.options.timeOut = 2000; // 2s
            toastr.success('Message error' + JSON.stringify(error));
        }
    });
}

$(function () {
    $('#sow_assign_project').on('change', function () {
        let selectedText = $("#sow_assign_project option:selected").text();
        let selectedValue = this.value;
        var array = selectedText.split(" _ ");
        let cus_name = array[0];
        let sow_name = array[1];
        importedEmpList.forEach(emp => {
            if (emp.cus_name == cus_name && emp.sow_name == sow_name) {
                sow_emp_cus_id = emp.cus_id;
                sow_emp_sow_code = emp.sow_code;
                sow_emp_sow_id = emp.sow_id;
                sow_emp_cus_status = emp.status;
                target_cus_name = emp.CUSTOMER_NAME;
                sow_billing_status = emp.bill;
                sow_prjct_end_date = emp.project_end_date;
                target_name = emp.sow_name;
            }
        });
        $("#sow_prjct_end_date").val(sow_prjct_end_date);
        $("#sow_emp_sow_id").val(sow_emp_sow_id);
        $("#sow_emp_sow_code").val(sow_emp_sow_code);
        $("#sow_emp_cus_id").val(sow_emp_cus_id);
        $("#sow_emp_cus_status").val(sow_emp_cus_status);
        $("#target_cus_name").val(target_cus_name);
        $("#target_name").val(target_name);
        $("#sow_sour_emp_id").val(sow_sour_emp_id);
        var manager_filter = jQuery.grep(Manager_Details_Json_sow, function (manaName, i) {
            return manaName.SOW_ID == selectedValue;
        });
        mang_name_options_sow = "";
        let new_option = "0206";
        $.each(manager_filter, function (value, mangName) {
            new_option = mangName.REPORTING_MANAGER_ID;
        });
        $.each(Manager_Details_Json_sow, function (value, mangName) {
            mang_name_options_sow += '<option value="' + mangName.REPORTING_MANAGER_ID + '">' + mangName.REPORTING_MANAGER_NAME + '</option>';
        });
        $("#report_manager_sow").html(mang_name_options_sow);
        if (selectedValue == "99994") {
            $("#report_manager_sow").val("0206");
        } else if (selectedValue == "99999") {
            $("#report_manager_sow").val("0206");
        }
        else {
            $("#report_manager_sow").val(new_option);
        }
    });
});

$(function () {
    $('#report_manager').on('change', function () {
        let selectedText = $("#report_manager option:selected").text();
        let selectedValue = this.value;
        let new_option = "";
        var sow_filter = jQuery.grep(SOW_mapped_rep_man_Json, function (sowID, i) {
            return sowID.REPORTING_MANAGER_ID == selectedValue;
        });
        $.each(sow_filter, function (value, sowIdSelect) {
            new_option = sowIdSelect.SOW_ID;
        });
        $("#assign_project").val(new_option);
    });
});
