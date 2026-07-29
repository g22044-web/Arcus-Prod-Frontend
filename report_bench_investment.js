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
          $('.input-group-addon').hide();
          setTimeout(function () {
            assignOverallData('ALL');
            $('#report_details').addClass('active');
            $("#sow_overall").addClass('active');
            $("#sow_main").addClass('active');
            $(".loader").css("display", "none");
            $(".show_page").css("display", "block");
          }, 500);
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
});
$('#dashboard').click(function () {
  window.location.href = 'home.html';
  return false;
});
$('#sow_Res_page').click(function () {
  localStorage.setItem("addRequest", true);
  localStorage.setItem("editRequest", false);
  window.location.href = 'sowCreate.html';
  return false;
});

$('#logout').click(function () {
  localStorage.clear();
  console.log("sessionName - " + sessionName);
  window.location.href = 'index.html';
  return false;
});
let auditData = [];
let allData = [];
const pathname = window.location.pathname;
// Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();

function normalizeBenchInvestmentResponse(response) {
  var normalizedResponse = response;
  var wrapperKeys = ["Data", "data", "result", "d"];

  // The API has returned both JSON and JSON-encoded strings in different
  // environments. It may also be wrapped by a response envelope.
  for (var depth = 0; depth < 4; depth++) {
    if (typeof normalizedResponse === "string") {
      try {
        normalizedResponse = JSON.parse(normalizedResponse);
        continue;
      } catch (error) {
        return null;
      }
    }

    if (Array.isArray(normalizedResponse) && normalizedResponse.length === 1) {
      normalizedResponse = normalizedResponse[0];
      continue;
    }

    if (!normalizedResponse || typeof normalizedResponse !== "object") {
      return null;
    }

    if (normalizedResponse.USA && normalizedResponse.INDIA) {
      return normalizedResponse;
    }

    var wrappedResponse;
    for (var i = 0; i < wrapperKeys.length; i++) {
      var candidate = normalizedResponse[wrapperKeys[i]];
      if (candidate !== undefined && candidate !== null) {
        wrappedResponse = candidate;
        break;
      }
    }

    if (wrappedResponse === undefined) {
      return null;
    }
    normalizedResponse = wrappedResponse;
  }

  return normalizedResponse && normalizedResponse.USA && normalizedResponse.INDIA
    ? normalizedResponse
    : null;
}

function hasBenchInvestmentData(data) {
  function hasRegionData(region) {
    return region &&
      region.BENCH_DETAILS &&
      region.BENCH_DETAILS.MONTLY_PROJECTED &&
      Array.isArray(region.BENCH_DETAILS.DATA) &&
      Array.isArray(region.BENCH_DETAILS.JOB_ROLE_COUNT) &&
      region.INVESTMENT &&
      Array.isArray(region.INVESTMENT.ALL) &&
      Array.isArray(region.INVESTMENT.JOB_ROLE_COUNT) &&
      Array.isArray(region.INVESTMENT.ABOVE_M) &&
      Array.isArray(region.INVESTMENT.M_AND_BELOW);
  }

  return data && hasRegionData(data.USA) && hasRegionData(data.INDIA);
}

function getOverallSummaryJson() {

  const startTime = performance.now();
  $.ajax({
    url: apiValue.url_ip + ":5003/bench_investment_report",
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
    },
    data: JSON.stringify({}),
    dataType: "json",
    success: function (dataJson) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      // getApiTime(loadTimeInSeconds,"TAReport","Reports","TA_Report","success",fileName,"TAReport","view");
      var normalizedData = normalizeBenchInvestmentResponse(dataJson);
      if (!hasBenchInvestmentData(normalizedData)) {
        auditData = [];
        allData = [];
        console.error("Unexpected bench investment report response", dataJson);
        if (typeof toastr !== "undefined") {
          toastr.error("The bench investment report returned an unexpected response.");
        }
        return;
      }

      auditData = normalizedData
      console.log("auditData", auditData);
      var resultObject = {};
      var object1 = auditData.USA.BENCH_DETAILS.MONTLY_PROJECTED;
      var object2 = auditData.INDIA.BENCH_DETAILS.MONTLY_PROJECTED;
      var lastUpdated = auditData.LAST_UPDATED_ON
      $("#last_updated").empty();
      $("#last_updated").append(lastUpdated)
      for (var key in object1) {
        if (object1.hasOwnProperty(key) && object2.hasOwnProperty(key)) {
          resultObject[key] = object1[key] + object2[key];
        }
      }
      allData = {
        "BENCH_DETAILS": { "DATA": auditData.INDIA.BENCH_DETAILS.DATA.concat(auditData.USA.BENCH_DETAILS.DATA), "MONTLY_PROJECTED": resultObject, "JOB_ROLE_COUNT": auditData.INDIA.BENCH_DETAILS.JOB_ROLE_COUNT.concat(auditData.USA.BENCH_DETAILS.JOB_ROLE_COUNT) },
        "INVESTMENT": { "ALL": auditData.INDIA.INVESTMENT.ALL.concat(auditData.USA.INVESTMENT.ALL), "MONTLY_PROJECTED": resultObject, "JOB_ROLE_COUNT": auditData.INDIA.INVESTMENT.JOB_ROLE_COUNT.concat(auditData.USA.INVESTMENT.JOB_ROLE_COUNT), "ABOVE_M": auditData.INDIA.INVESTMENT.ABOVE_M.concat(auditData.USA.INVESTMENT.ABOVE_M), 'M_AND_BELOW': auditData.INDIA.INVESTMENT.M_AND_BELOW.concat(auditData.USA.INVESTMENT.M_AND_BELOW) },
        // "OVERALL_BENCH_COUNT": resultObject,
        // "OVERALL_BENCH_JOB_COUNT": auditData.INDIA.BENCH_DETAILS.JOB_ROLE_COUNT.concat(auditData.USA.BENCH_DETAILS.JOB_ROLE_COUNT),
        // "OVERALL_INVESTMENT_JOB_COUNT": auditData.INDIA.INVESTMENT.JOB_ROLE_COUNT.concat(auditData.USA.INVESTMENT.JOB_ROLE_COUNT)
      }
      console.log("allData - ", allData)
      prepareOverallDatatoUI(allData);
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      // getApiTime(loadTimeInSeconds,"reportAudit","Reports","audit_tracking_data","error",fileName,"reportAudit","view");
      console.log('message Error' + JSON.stringify(error));
      if (typeof toastr !== "undefined") {
        toastr.error("Unable to load the bench investment report.");
      }
    }
  });
}

function assignOverallData(value) {
  if (value == 'ALL') {
    if (auditData.length == 0) {
      getOverallSummaryJson()
    } else {
      prepareOverallDatatoUI(allData)
    }
  } else if (value == 'IND') {
    prepareOverallDatatoUI(auditData.INDIA)
  }
  else {
    prepareOverallDatatoUI(auditData.USA)
  }
}

function prepareOverallDatatoUI(auditDatJson, selectedYearval) {
  console.log("auditDatJson", auditDatJson);
  let benchDetails = auditDatJson.BENCH_DETAILS.DATA
  let investmentDetails = auditDatJson.INVESTMENT.ALL
  let overallBenchCount = auditDatJson.BENCH_DETAILS.MONTLY_PROJECTED
  let overallBenchJobCount = auditDatJson.BENCH_DETAILS.JOB_ROLE_COUNT
  let overallInvestmentJobCount = auditDatJson.INVESTMENT.JOB_ROLE_COUNT
  let SMAndAboveDetails = auditDatJson.INVESTMENT.ABOVE_M
  let MAndBelow = auditDatJson.INVESTMENT.M_AND_BELOW
  let benchBodyhtml = "";
  let investmentbodyhtml = "";
  let investmentMandBelowBodyHtml = "";
  var headerRow = $("#overallBench");
  var body = $("#overallBench_body");
  var newRow = $("<tr>");
  let count_overallBenchCount = 0
  if (overallBenchCount != null) {
    count_overallBenchCount = Object.keys(overallBenchCount).length;
  }
  if(count_overallBenchCount > 0 ){
    $('.overall_bench_count').show()
  }else{
    $('.overall_bench_count').hide()
  }
  if(overallBenchJobCount.length > 0){
    $(".overallBenchJobCount").show()
  }else{
    $(".overallBenchJobCount").hide()
  }
  if(benchDetails.length > 0){
    $(".bench_list_table").show();
  }else{
    $(".bench_list_table").hide();
  }
  if(overallInvestmentJobCount.length > 0){
    $(".overall_invest_job_count").show();
  }else{
    $(".overall_invest_job_count").hide();
  }
  if(SMAndAboveDetails.length > 0){
    $('.invest_sm_above').show();
  }else {
    $('.invest_sm_above').hide();
  }
  if(MAndBelow.length > 0){
    $(".invest_m_below").show()
  }else{
    $(".invest_m_below").hide()
  }
  $.each(benchDetails, function (i, audit) {
    let employeeName = audit.EMPLOYEE_NAME;
    let jobRole = audit.JOB_ROLE
    let currentPersona = audit.SKILLS_PERSONA
    let BenchStartDate = audit.BENCH_START_DATE
    let noticePeriod = audit.IN_NOTICE_PERIOD;
    let previousAccountName = audit.PREVIOUS_ACCOUNT_NAME
    let skills = audit.SKILLS_LEVEL.split(',')
    let emp_skill_data = "";
    $.each(skills, function (value, skill) {
      emp_skill_data += `<button class="skill_data">${skill}</button>`
    });
    let rowData = `<tr>
        <td>${employeeName}</td>
        <td>${jobRole}</td>
        <td>${currentPersona}</td>
        <td>${previousAccountName}</td>
        <td>${BenchStartDate}</td>
        <td>${noticePeriod}</td>
        <td><div class="more">${emp_skill_data}</div></td>
   </tr>`;
    benchBodyhtml += rowData;
  });
  $.each(SMAndAboveDetails, function (i, audit) {
    let employeeName = audit.EMPLOYEE_NAME;
    let jobRole = audit.JOB_ROLE
    let currentPersona = audit.SKILLS_PERSONA
    let investmentStartDate = audit.INVESTMENT_START_DATE
    let previousAccountName = audit.CURRENT_ACCOUNT_NAME
    let skills = audit.SKILLS_LEVEL.split(',')
    let emp_skill_data = "";
    $.each(skills, function (value, skill) {
      emp_skill_data += `<button class="skill_data">${skill}</button>`
    });
    let rowData = `<tr>
        <td>${employeeName}</td>
        <td>${jobRole}</td>
        <td>${currentPersona}</td>
        <td>${previousAccountName}</td>
        <td>${investmentStartDate}</td>
        <td><div class="more">${emp_skill_data}</div></td>
  </tr>`;
    investmentbodyhtml += rowData;
  });

  $.each(MAndBelow, function (i, audit) {
    let employeeName = audit.EMPLOYEE_NAME;
    let jobRole = audit.JOB_ROLE
    let currentPersona = audit.SKILLS_PERSONA
    let investmentStartDate = audit.INVESTMENT_START_DATE
    let previousAccountName = audit.CURRENT_ACCOUNT_NAME
    let skills = audit.SKILLS_LEVEL.split(',')
    let emp_skill_data = "";
    $.each(skills, function (value, skill) {
      emp_skill_data += `<button class="skill_data">${skill}</button>`
    });
    let rowData = `<tr>
        <td>${employeeName}</td>
        <td>${jobRole}</td>
        <td>${currentPersona}</td>
        <td>${previousAccountName}</td>
        <td>${investmentStartDate}</td>
        <td><div class="more">${emp_skill_data}</div></td>
  </tr>`;
    investmentMandBelowBodyHtml += rowData;
  });
  // Assume headerRow and body are already defined
  var existingRow = body.find('tr#overallBench_row');

  // If the row already exists, update the values
  if (existingRow.length > 0) {
    $.each(overallBenchCount, function (key, value) {
      existingRow.find('td[data-key="' + key + '"]').text(value);
    });
  } else {
    // If the row does not exist, create a new row
    var newRow = $('<tr id="overallBench_row"></tr>');

    $.each(overallBenchCount, function (key, value) {
      headerRow.append("<th>" + key + "</th>");
      newRow.append('<td data-key="' + key + '">' + value + '</td>');
    });

    // Append the new row to the body
    body.append(newRow);
  }

  //th and tr for bench list
  var headersRow = document.getElementById('jobRoleCount');

  // Check if th elements already exist, if not, create them
  if (!headersRow.querySelector('th[data-type="jobRole"]')) {
    var jobRoleTh = document.createElement('th');
    jobRoleTh.textContent = 'JOB_ROLE';
    jobRoleTh.setAttribute('data-type', 'jobRole'); // Adding a data attribute for identification
    headersRow.appendChild(jobRoleTh);
  }

  if (!headersRow.querySelector('th[data-type="count"]')) {
    var countTh = document.createElement('th');
    countTh.textContent = 'COUNT';
    countTh.setAttribute('data-type', 'count'); // Adding a data attribute for identification
    headersRow.appendChild(countTh);
  }

  var tbody = document.getElementById('jobRoleCount_body');
  $("#jobRoleCount_body").empty()

  for (var i = 0; i < overallBenchJobCount.length; i++) {
    var rowData = overallBenchJobCount[i];

    // Check if the row already exists, if not, create a new one
    var row = tbody.querySelector('tr[data-job-role="' + rowData.JOB_ROLE + '"]');
    if (!row) {
      row = document.createElement('tr');
      row.setAttribute('data-job-role', rowData.JOB_ROLE); // Adding a data attribute for identification
    }

    // Check if td elements already exist for the row, if not, create them
    var jobRoleTd = row.querySelector('td[data-type="jobRole"]');
    if (!jobRoleTd) {
      jobRoleTd = document.createElement('td');
      jobRoleTd.setAttribute('data-type', 'jobRole'); // Adding a data attribute for identification
      row.appendChild(jobRoleTd);
    }
    jobRoleTd.textContent = rowData.JOB_ROLE;

    var countTd = row.querySelector('td[data-type="count"]');
    if (!countTd) {
      countTd = document.createElement('td');
      countTd.setAttribute('data-type', 'count'); // Adding a data attribute for identification
      row.appendChild(countTd);
    }
    countTd.textContent = rowData.COUNT;

    if (!row.parentNode) {
      tbody.appendChild(row);
    }
  }

  var investmentHeadersRow = document.getElementById('investmentJobRoleCount');

  // Check if th elements already exist, if not, create them
  if (!investmentHeadersRow.querySelector('th[data-type="jobRole"]')) {
    var investmentJobRoleTh = document.createElement('th');
    investmentJobRoleTh.textContent = 'JOB_ROLE';
    investmentJobRoleTh.setAttribute('data-type', 'jobRole'); // Adding a data attribute for identification
    investmentHeadersRow.appendChild(investmentJobRoleTh);
  }

  if (!investmentHeadersRow.querySelector('th[data-type="count"]')) {
    var investmentCountTh = document.createElement('th');
    investmentCountTh.textContent = 'COUNT';
    investmentCountTh.setAttribute('data-type', 'count'); // Adding a data attribute for identification
    investmentHeadersRow.appendChild(investmentCountTh);
  }

  var investmentTbody = document.getElementById('investmentJobRoleCount_body');
  $("#investmentJobRoleCount_body").empty();

  for (var i = 0; i < overallInvestmentJobCount.length; i++) {
    var investmentRowData = overallInvestmentJobCount[i];

    // Check if the row already exists, if not, create a new one
    var investmentRow = investmentTbody.querySelector('tr[data-job-role="' + investmentRowData.JOB_ROLE + '"]');
    if (!investmentRow) {
      investmentRow = document.createElement('tr');
      investmentRow.setAttribute('data-job-role', investmentRowData.JOB_ROLE); // Adding a data attribute for identification
    }

    // Check if td elements already exist for the row, if not, create them
    var investmentJobRoleTd = investmentRow.querySelector('td[data-type="jobRole"]');
    if (!investmentJobRoleTd) {
      investmentJobRoleTd = document.createElement('td');
      investmentJobRoleTd.setAttribute('data-type', 'jobRole'); // Adding a data attribute for identification
      investmentRow.appendChild(investmentJobRoleTd);
    }
    investmentJobRoleTd.textContent = investmentRowData.JOB_ROLE;

    var investmentCountTd = investmentRow.querySelector('td[data-type="count"]');
    if (!investmentCountTd) {
      investmentCountTd = document.createElement('td');
      investmentCountTd.setAttribute('data-type', 'count'); // Adding a data attribute for identification
      investmentRow.appendChild(investmentCountTd);
    }
    investmentCountTd.textContent = investmentRowData.COUNT;

    if (!investmentRow.parentNode) {
      investmentTbody.appendChild(investmentRow);
    }
  }
  $("#bench_body").html(benchBodyhtml);
  $("#investment_body").html(investmentbodyhtml);
  $("#investment_body_m_below").html(investmentMandBelowBodyHtml);
  $('#emp_table').DataTable({
    "pageLength": 50,
    order: [[3, 'desc']],
  });
}


// function downloadExcel() {
//   let today = new Date();
//   let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
//   let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
//   let CurrentDateTime = date + '_' + time;
//   $("#ta_report").remove(".noExl").table2excel({
//     exclude: ".noExl",
//     name: "TA Report",
//     filename: "TA_Report_" + CurrentDateTime,
//     fileext: ".xls",
//   });
// }

// function downloadExcel() {
//   let today = new Date();
//   let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
//   let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
//   let CurrentDateTime = date + '_' + time;

//   // Create a new combined table
//   let combinedTable = $("<table>");

//   // Clone and append Table 1 headers and rows
//   let table1HeaderClone = $("#bench_report thead").clone().addClass('bold-headers');
//   table1HeaderClone.find("th").css("font-weight", "bold");
//   combinedTable.append(table1HeaderClone);
//   combinedTable.append($("#bench_report tbody").clone());

//   // Clone and append Table 2 headers and rows
//   let table2HeaderClone = $("#investment_report thead").clone().addClass('bold-headers');
//   table2HeaderClone.find("th").css("font-weight", "bold");
//   combinedTable.append(table2HeaderClone);
//   combinedTable.append($("#investment_report tbody").clone());

//   // Remove any existing Excel export buttons
//   combinedTable.find(".noExl").remove();

//   // Convert the combined table to Excel
//   combinedTable.table2excel({
//     exclude: ".noExl",
//     name: "TA Report",
//     filename: "Bench_And_Investment_Report_" + CurrentDateTime,
//     fileext: ".xls",
//   });
// }

function downloadExcel() {
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
  let CurrentDateTime = date + '_' + time;
  var selectedValue = $('input[name="res_acc"]:checked').val();

  // Create a new workbook
  let workbook = new ExcelJS.Workbook();

  // Add a worksheet for Table 1
  let table1Worksheet = workbook.addWorksheet(selectedValue + '_Bench_Report');

  // Get HTML content of the bench_report table
  let table1Content = $("#bench_report").clone();

  // Add classes to <th> and <td> in Table 1
  table1Content.find('thead tr th').addClass('bold-header');
  table1Content.find('tbody tr td').addClass('normal-cell');

  // Convert modified HTML content of Table 1 to worksheet
  table1Worksheet.addRow(table1Content.find('thead tr th').map((index, th) => $(th).text()).get());

  table1Content.find('tbody tr').each((index, row) => {
    table1Worksheet.addRow($(row).find('td').map((index, td) => $(td).text()).get());
  });

  // Make the header cells bold in Table 1
  table1Worksheet.getRow(1).font = { bold: true };

  // Add a worksheet for combined Table 2 and new table
  let combinedWorksheet = workbook.addWorksheet(selectedValue + '_Investment_Report');

  // Get HTML content of the investment_report and investment_report_1 tables
  let table2Content = $("#investment_report").clone();
  let newTableContent = $("#investment_report_1").clone();

  // Add classes to <th> and <td> in Table 2
  table2Content.find('thead tr th').addClass('bold-header');
  table2Content.find('tbody tr td').addClass('normal-cell');

  // Add classes to <th> and <td> in the new table
  newTableContent.find('thead tr th').addClass('bold-header');
  newTableContent.find('tbody tr td').addClass('normal-cell');

  // Combine content of Table 2 with the new table
  table2Content.find('tbody').append(newTableContent.find('tbody').html());

  // Convert modified HTML content of combined Table 2 and new table to worksheet
  let headers = table2Content.find('thead tr th').map((index, th) => $(th).text()).get();
  combinedWorksheet.addRow(headers);

  table2Content.find('tbody tr').each((index, row) => {
    combinedWorksheet.addRow($(row).find('td').map((index, td) => $(td).text()).get());
  });

  // Make the header cells bold in combined worksheet
  combinedWorksheet.getRow(1).font = { bold: true };

  // Save the workbook to a file
  workbook.xlsx.writeBuffer()
    .then((buffer) => {
      saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Bench_And_Investment_Report_" + CurrentDateTime + ".xlsx");
    });
}















