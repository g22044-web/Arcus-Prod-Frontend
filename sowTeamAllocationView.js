let recommResModelUser = [];
// const pathname = window.location.pathname;
// // Extract the file name (last segment) from the pathname
// const parts = pathname.split('/');
// const fileName = parts.pop();
let pageLevelAccess = ''
let eachLevel = '', editAccess = false, deleteAccess = false;
$(document).ready(function () {
  // console.log("Sow Team Allocation Page Loaded");
  // assignMetaValue();
  // $("meta[name='google-signin-client_id']").attr("content", metaValue);

  getLocalSessionData();
  const queryString = window.location.search.substring(1);
  // console.log(queryString);
  localStorage.setItem("allocation-url", queryString);
  if (sessionName == null) {
    window.location.href = "index.html";
    return false;
  } else {
    let accessStatus = checkDashboardPageAccessData()
    if (accessStatus) {
      let accessLevel = checkEachPageAccess("Allocation")
      if (accessLevel.length > 0) {
        let environment = accessLevel[0]
        if (environment == apiValue.environment) {
          pageLevelAccess = accessLevel[1]
          eachLevel = pageLevelAccess.split(',')
          $(".resource_div").hide();
          $(".existing_resource").hide();
          $(".no_existing_resources").hide();
          $(".no_ava_resources").hide();
          // getFindResourceData();
          // getBusinessRuleData();
          $(".extra_br").show();
          $(".loader").css("display", "none");
          $(".resource_div").show();
          $(".show_page").css("display", "block");
          $(".invoiceClass").hide();
          $(".input-group-addon").hide();
          // editAccess = hasEditOrDelete(eachLevel)
          $.each(eachLevel, function (l, level) {
            switch (level) {
              case "delete":
                $('.allocation-resource-data').find('th:last, td:last').show();
                $(".available_resource ").show();
                $('.btn-info-allocation').show();
                break;
              case "edit":
                $('.allocation-resource-data').find('th:last, td:last').show();
                $(".available_resource ").show();
                $('.btn-info-allocation').show();
                break;
              case "view":
                $('.allocation-resource-data').find('th:last, td:last').hide();
                $('.btn-info-allocation').hide();
                $(".available_resource ").hide();
                break;
            }
          })
          console.log("execute")
          $("#update_resource_data").attr("disabled", true);
        }
        // else {
        //   window.location.href = "home.html"
        // }
      }
    }
    // else {
    //   window.location.href = "home.html"
    // }
  }

  $(window).resize(resize);
  resize();
  $(".new-sub-menu").hover(function () {
    $(".sub-menu").css("display", "");
  });
  $("#find_resource_back").click(function () {
    window.location.href = "allocationDashboard.html";
    return false;
  });
  $("#dashboard").click(function () {
    window.location.href = "home.html";
    return false;
  });

  $("#logout").click(function () {
    localStorage.clear();

    window.location.href = "index.html";
    return false;
  });
});

function hasEditOrDelete(levels) {
  return levels.includes("edit") || levels.includes("delete");
}

function checkAccessAllocation() {
  $.each(eachLevel, function (l, level) {
    switch (level) {
      case "delete":
        $('.allocation-resource-data').find('th:last, td:last').hide();
        $(".available_resource ").show();
        $('.btn-info-allocation').show();
        $('.resourceDate').prop('disabled', false);
        $('.billing_select').prop('disabled', false);
        break;
      case "edit":
        $('.allocation-resource-data').find('th:last, td:last').hide();
        $(".available_resource ").show();
        $('.btn-info-allocation').show();
        $('.resourceDate').prop('disabled', false);
        $('.billing_select').prop('disabled', false);
        break;
      case "view":
        $('.allocation-resource-data').find('th:last, td:last').hide();
        $('.btn-info-allocation').hide();
        $(".available_resource ").hide();
        $('.resourceDate').prop('disabled', true);
        $('.billing_select').prop('disabled', true);
        break;
    }
  })
}
function resize() {
  if ($(window).width() < 514) {
    $("#resp-table").addClass("table-responsive");
  } else {
    $("#resp-table").removeClass("table-responsive");
  }
}
// let skillOptions = "";

// const getBusinessRuleData = async () => {
//   try {
//     let form_details = {
//       "query_type": "approval_rules"
//     };
//     let data = await fetch(apiValue.url_ip + ":5004/approval_rules", {
//       method: "POST",
//       body: JSON.stringify(form_details),
//     });
//     const result = await data.json();
//     resource_Alloc_rule_data = result
//   } catch {
//     console.error("Error occurred while fetching data:", error);
//   }
// }

let findResData = [],
  findResDatas = [],
  business_rule = [],
  getSowId = "",
  uniqueid = "",
  currDate = "",
  legalsrtdate = "",
  legal_end_date = "",
  uniqueID = "",
  allocation_sel_data = []
resource_exist_table = [],
  BillingData = [],
  resource_Alloc_rule_data = [];
let all_bench_emp_list = [],
  all_bench_datas = [],
  resJsonData = [],
  getAvailableEmpData = [],
  sowStartDate,
  sowEndDate,
  indShortage,
  usShortage;
let sow_id = '';
let billingOptions = `<option value="Billed">Billed</option><option value="Investment">Investment</option>`;
function toggleCurrentResourcesLegend() {
  // Check if any row has the 'allocation-expired' class (indicating currently active resources)
  const hasActiveResources = $('#resource_exist_table tbody tr.allocation-expired').length > 0;

  // Show or hide the legend based on active resources
  if (hasActiveResources) {
    $('.allocation-indication').show();
  } else {
    $('.allocation-indication').hide();
  }
}

const getFindResourceData = async () => {
  $("#resource_allocation").hide();
  $("#loading_div_resource").show();
  $(".sow_date").hide();

  // Initially hide the 'Current Resources' legend
  $('.allocation-indication').hide();

  currDate = localStorage.getItem("Current_Date");
  // getSowId = localStorage.getItem("sow_id");
  legalsrtdate = localStorage.getItem("legal_start");
  legal_end_date = localStorage.getItem("legal_end");
  const paramsString = window.location.search.substring(1);
  const paramsArray = paramsString.split('&');
  console.log("alloc paramsArray - ", paramsArray);
  // if (getSowId == null) {
  getSowId = paramsArray[1];
  uniqueID = paramsArray[0];
  // }
  let apiURL = apiValue.url_ip + ":5005/allocation_page";
  const startTime = performance.now();
  let form_details = {
    SOW_ID: [getSowId],
    // "SHORTAGE_AS_OF_DATE": currDate,
    UNIQUE_ID: uniqueID,
    // "LEGAL_START_DATE": convertDates(legalsrtdate),
    // "LEGAL_END_DATE": convertDates(legal_end_date),
    environment: apiValue.environment,
    payload: JSON.parse("{}")
  };
  let data = await fetch(apiURL, {
    method: "POST",
    body: JSON.stringify(form_details),
  });
  const result = await data.json();
  const endTime = performance.now();
  const loadTimeInSeconds = (endTime - startTime) / 1000;
  // getApiTime(loadTimeInSeconds, "SowTeamAllocation", "Allocation", "allocation_page", "success", fileName, "Sow_Team_Allocation", "view");
  overallData = result[0];
  findResData = result[0];
  console.log("findResData", findResData);
  // $("#find_account_name").html(findResData.ACCOUNT_NAME);
  // $("#find_sow_name").html(`
  //   ${findResData.SOW_NAME}
  //   <span class="sowTooltiptext" id="sowID">${findResData.SOW_ID}</span>
  // `);
  // $('#sowName').html(findResData.SOW_NAME)
  // $("#sowNameID").html(findResData.SOW_ID);
  // $("#sow_unique_id").html(findResData.UNIQUE_ID);
  // $("#find_sow_status").html(findResData.SOW_STATUS);
  // $("#billing_text").html(findResData.BILLING_MODEL);
  // $("#find_account_id").html(findResData.ACCOUNT_ID);
  // $("#find_start_date").html(convert(findResData.ACTUAL_START_DATE));
  // $("#find_start_date_legal").html(convert(findResData.LEGAL_START_DATE));
  // $("#find_end_date").html(convert(findResData.ACTUAL_END_DATE));
  // $("#find_end_date_legal").html(convert(findResData.LEGAL_END_DATE));
  // $("#uscan_size").val(findResData.US_RESOURCE_DEMAND);
  // $("#ind_size").val(findResData.INDIA_RESOURCE_DEMAND);
  // $("#team_size_val").val(findResData.TOTAL_DEMAND);
  sow_id = findResData.SOW_ID
  resource_exist_table = findResData.DEMAND_ALLOCATED_DATA;
  let benchStatusApi = false
  let bench_data_check = findResData.BENCH_DATA
  if (bench_data_check === undefined) {
    benchStatusApi = true
  } else if (typeof bench_data_check === 'object' && Array.isArray(bench_data_check.CURRENT_BENCH_DATA)) {
    all_bench_datas = bench_data_check;
    let allBenchEmpData = [
      ...all_bench_datas.FUTURE_BENCH_DATA,
      ...all_bench_datas.CURRENT_BENCH_DATA,
    ];
    all_bench_emp_list = allBenchEmpData;
  } else {
    benchStatusApi = true
  }

  sowStartDate = new Date(findResData.ACTUAL_START_DATE);
  sowEndDate = new Date(findResData.ACTUAL_END_DATE);
  let legalstartdate = findResData.LEGAL_START_DATE;
  let legalenddate = findResData.LEGAL_END_DATE;
  usShortage = findResData.US_SHORTAGE;
  indShortage = findResData.INDIA_SHORTAGE;
  let newurl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    "?" +
    findResData.UNIQUE_ID +
    "&" +
    findResData.SOW_ID;

  window.history.pushState({ path: newurl }, "", newurl);
  $(".no_existing_resources").hide();
  $(".existing_resource").show();
  // all_bench_emp_list = localStorage.getItem("Bench_employee");
  // all_bench_emp_list = JSON.parse(all_bench_emp_list);
  if (benchStatusApi) {
    apiURL = apiValue.url_ip + ":5008/bench_data";
    $.ajax({
      url: apiURL,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      format: "json",
      async: false,
      mode: "no-cors",
      data: JSON.stringify({
        environment: "Development",
      }),
      success: function (dataJson) {
        all_bench_datas = dataJson;

        let allBenchEmpData = [
          ...all_bench_datas.FUTURE_BENCH_DATA,
          ...all_bench_datas.CURRENT_BENCH_DATA,
        ];
        all_bench_emp_list = allBenchEmpData;
      },
      error: function (error) {
        console.log("message Error" + JSON.stringify(error));
      },
    });
  }
  getAvailableEmpData = all_bench_emp_list.filter((emp) => {
    let JsonStartdate = new Date(emp.AVAILABLE_FROM);
    let JsonEnddate;
    if (emp.AVAILABLE_TO == "") {
      JsonEnddate = "";
    } else {
      JsonEnddate = new Date(emp.AVAILABLE_TO);
    }
    if (JsonEnddate == "") {
      return JsonStartdate <= sowEndDate;
    } else {
      return (
        (JsonStartdate <= sowStartDate && JsonEnddate >= sowEndDate) ||
        (sowStartDate <= JsonStartdate && JsonStartdate <= sowEndDate) ||
        (sowStartDate <= JsonEnddate && JsonEnddate <= sowEndDate) ||
        (JsonStartdate >= sowStartDate && JsonEnddate <= sowEndDate)
      );
    }
  });
  assignDataToAccount(resource_exist_table);

  $("#request").hide();
  $("#request_resource").hide();
  $("#resource_allocation").show();
  $("#loading_div_resource").hide();
};

function convert(str) {
  if (str == null) {
    return "";
  } else if (str == "0000-00-00") {
    return "";
  } else {
    // Remove time portion if present
    str = str.replace(/\s+00:00:00$/, "");

    // Parse the date parts directly (YYYY-MM-DD format)
    const parts = str.split(/[-/]/);
    if (parts.length >= 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];

      // Return in MM-DD-YY format
      return `${month}-${day}-${year.substr(2, 2)}`;
    }

    // Fallback: try standard date parsing
    let tempStr = str + "T00:00:00";
    var date = new Date(tempStr);
    if (isNaN(date.getTime())) {
      return str; // Return original if parsing fails
    }
    var mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [
      mnth,
      day,
      date
        .getFullYear()
        .toString()
        .substr(2, 2),
    ].join("-");
  }
}

function convertNew(str) {
  if (str == null) {
    return "";
  } else if (str == "0000-00-00") {
    return "";
  } else {
    // Remove time portion if present
    str = str.replace(/\s+00:00:00$/, "");

    // Parse the date parts directly (YYYY-MM-DD format)
    const parts = str.split(/[-/]/);
    if (parts.length >= 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];

      // Return in MM-DD-YY format
      return `${month}-${day}-${year.substr(2, 2)}`;
    }

    // Fallback: try standard date parsing
    let tempStr = str + "T00:00:00";
    var date = new Date(tempStr);
    if (isNaN(date.getTime())) {
      return str; // Return original if parsing fails
    }
    var mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [
      mnth,
      day,
      date
        .getFullYear()
        .toString()
        .substr(2, 2),
    ].join("-");
  }
}

let currentTeamDataJson;

function assignDataToAccount(resJsonData) {
  let demand_allocated_date = findResData.DEMAND_ALLOCATED_DATA;

  currentTeamDataJson = resJsonData;
  console.log("currentTeamDataJson - ", currentTeamDataJson);
  $("#resource_exist_table tbody").empty();
  // $("#resource_exist_table")
  //   .dataTable()
  //   .fnClearTable();
  // $("#resource_exist_table")
  //   .dataTable()
  //   .fnDestroy();
  let billingStatusOptions = `<option value="Billed">Billed</option>
  <option value="Investment">Investment</option>
  </select>`;

  $("#resource_exist_body").empty();
  if (demand_allocated_date.length > 0) {
    $.each(demand_allocated_date, function (i, resExitTable) {
      if (resExitTable.EMPLOYEE_NAME != "") {
        let start_date = resExitTable.DEMAND_START_DATE;
        let skills = resExitTable.SKILLS_LEVEL ? resExitTable.SKILLS_LEVEL.split(",") : [];
        let skillCount = skills.length;
        let skillListHtml = "";
        let skillTooltip = skills.join(", ");

        if (skillCount > 0) {
          $.each(skills, function (j, skillData) {
            skillData = skillData.trim();
            if (skillData !== "") {
              skillListHtml += `
        <div class="skill_block" data-skill="${skillData}">
          ${skillData}
        </div>`;
            }
          });
        } else {
          skillListHtml = `<div class="skill_block">-</div>`;
          skillTooltip = "";
        }

        let finalHtml = `
  <div class="skill_container">
    <button class="skill_count">
      ${skillCount}
    </button>
    <div class="skills_tooltip">
      <div class="skills_wrapper">${skillListHtml}</div>
    </div>
  </div>
`;
        console.log("resExitTable - ", resExitTable);
        let startDateCheck = false, endDateCheck = false
        let allocationEndDate = new Date((resExitTable.ALLOCATION_END_DATE).replace(" ", "T")); // Convert to ISO format
        let allocationStartDate = new Date((resExitTable.ALLOCATION_START_DATE).replace(" ", "T"));
        let demandStartDate = new Date((resExitTable.DEMAND_START_DATE).replace(" ", "T"));
        let demandEndDate = new Date((resExitTable.DEMAND_END_DATE).replace(" ", "T"));
        let legalStartDate = new Date((resExitTable.LEGAL_START_DATE).replace(" ", "T"));
        let legalEndDate = new Date((resExitTable.LEGAL_END_DATE).replace(" ", "T"));
        console.log('demandStartDate - ', demandStartDate)
        if (demandStartDate == 'Invalid Date') {
          demandStartDate = legalStartDate;
        }
        if (demandEndDate == 'Invalid Date') {
          demandEndDate = legalEndDate;
        }
        if (allocationStartDate >= demandStartDate) {
          startDateCheck = true;
        }
        if (allocationEndDate > demandEndDate) {
          endDateCheck = true;
        }
        let today = new Date();
        // Reset today's time to 00:00:00 for accurate date-only comparison
        today.setHours(0, 0, 0, 0);
        let isFutureOrToday = false;
        if (allocationStartDate <= today && today <= allocationEndDate) {
          isFutureOrToday = true;
        }
        let demandStartDateTemp = convertNew(resExitTable.DEMAND_START_DATE) == "aN-aN-N"
          ? "-"
          : convertNew(resExitTable.DEMAND_START_DATE)
        console.log('demandStartDateTemp - ', demandStartDateTemp)
        console.log(isFutureOrToday); // true or false
        resourceExistHtml = `<tr class="current_team_${i + 1} allocation-resource-data ${isFutureOrToday ? 'allocation-expired' : ''}"">
      <td class="current_demand_loc">${resExitTable.LOCATION}</td>
      <td class="current_demand_persona">
        ${resExitTable.REQUIRED_PERSONA}
        ${(() => {
            let allocationsToShow = [];
            if (resExitTable.PARTIAL_ALLOCATIONS && resExitTable.PARTIAL_ALLOCATIONS.length > 0) {
              allocationsToShow = resExitTable.PARTIAL_ALLOCATIONS;
            } else if (resExitTable.EMPLOYEE_ID && resExitTable.EMPLOYEE_ID != '') {
              // Take from main array if EMPLOYEE_ID is not empty
              allocationsToShow = [{
                EMPLOYEE_ID: resExitTable.EMPLOYEE_ID,
                EMPLOYEE_NAME: resExitTable.EMPLOYEE_NAME,
                RES_ALLOC_START_DATE: resExitTable.ALLOCATION_START_DATE,
                RES_ALLOC_END_DATE: resExitTable.ALLOCATION_END_DATE,
                BILLING_STATUS: resExitTable.BILLING_STATUS
              }];
            }

            return allocationsToShow.length > 0 ? `
            <span class="partial-alloc-info-icon" 
                  data-partial-allocations='${JSON.stringify(allocationsToShow)}'>
              <i class="fa fa-info-circle" aria-hidden="true"></i>
            </span>
          ` : '';
          })()}
      </td>
      <td class="current_demand_actual_start">${convertNew(resExitTable.DEMAND_START_DATE) == "aN-aN-N"
            ? "-"
            : convertNew(resExitTable.DEMAND_START_DATE)
          }</td>
      <td class="current_demand_actual_end">${convertNew(resExitTable.DEMAND_END_DATE) == "aN-aN-N"
            ? "-"
            : convertNew(resExitTable.DEMAND_END_DATE)
          }</td>
      <td class="current_emp_account_id" style="display:none">${resExitTable.ACCOUNT_ID}</td>
      <td class="current_emp_sow_id" style="display:none">${resExitTable.SOW_ID}</td>
      <td class="current_emp_account_name"  style="display:none">${resExitTable.ACCOUNT_NAME}</td>
      <td class="current_emp_sow_name" style="display:none">${resExitTable.SOW_NAME}</td>
      <td class="current_emp_id" style="display:none">${resExitTable.EMPLOYEE_ID
          }</td>
      <td class="current_emp_resource_group" style="display:none">${resExitTable.RESOURCE_GROUP
          }</td>
      <td class="current_emp_resource_sub_group" style="display:none">${resExitTable.SUB_RES_GROUP
          }</td>
      <td class="current_emp_unique_id" style="display:none">${resExitTable.RES_UNIQUE_ID
          }</td>
      <td class="current_emp_name_new"><span class="current_emp_name className_recommend">${resExitTable.EMPLOYEE_NAME
          }</span></td>
      <td class="current_emp_job_role">${resExitTable.JOB_ROLE}</td>
      <td class="current_emp_supply_persona">${resExitTable.SUPPLY_PERSONA}
        </td>
      <td class="current_emp_skills" style="display:none">${resExitTable.SKILLS_LEVEL
          }</td>
      <td class="more">${skillCount > 0 ? finalHtml : "-"}</td>
      <td class="current_emp_start_date  ${startDateCheck ? '' : 'text_warining'}">
      <span id="current_start_date_${i + 1}" class="currentStartDateText">${resExitTable.ALLOCATION_START_DATE == ""
            ? "-"
            : convertNew(resExitTable.ALLOCATION_START_DATE)
          }</span>
        <input type="text" class="form-control placeicon dateData resourceDate currentNewStartDate ${startDateCheck ? '' : 'text_warining'}" 
            id="current_start_date_${i + 1}_input"
            data-id = "${i + 1}" 
            placeholder="&#xf073; MM-DD-YY" 
            name="resource_start_date" 
            autocomplete="off" 
            value="${resExitTable.ALLOCATION_START_DATE == ""
            ? "-"
            : convertNew(resExitTable.ALLOCATION_START_DATE)
          }"
            onchange="checkSOWStartdate(this)"
            style="z-index: 1;"/>
        </td>
      </td>
      <td class="current_emp_end_date ${endDateCheck ? 'text_warining' : ''}">
        <span id="current_end_date_${i + 1}" class="currentEndDateText">${resExitTable.ALLOCATION_END_DATE == "NaT" || ""
            ? "-"
            : convertNew(resExitTable.ALLOCATION_END_DATE)
          }</span>
        <input type="text" class="form-control placeicon dateData resourceDate currentNewEndDate ${endDateCheck ? 'text_warining' : ''}" 
          id="current_end_date_${i + 1}_input"
          data-id = "${i + 1}" 
          data-id-2 = "${resExitTable.AVAILABLE_TO_ORIGINAL == "NaT" || ""
            ? "-"
            : convertNew(resExitTable.AVAILABLE_TO_ORIGINAL)
          }"
          placeholder="&#xf073; MM-DD-YY" 
          name="resource_end_date" 
          autocomplete="off" 
          value="${resExitTable.ALLOCATION_END_DATE == "NaT" || ""
            ? "-"
            : convertNew(resExitTable.ALLOCATION_END_DATE)
          }"
          onchange="checkSOWEnddate(this)"
          style="z-index: 1;"/>
      </td>
      <td class="current_emp_old_start_date" style="display: none">${convertNew(
            resExitTable.ALLOCATION_START_DATE
          )}</td> 
      <td class="current_emp_old_end_date" style="display: none">${convertNew(
            resExitTable.ALLOCATION_END_DATE
          )}</td> 
      <td class="current_emp_old_billing" style="display: none">${resExitTable.BILLING_STATUS
          }</td> 
      <td class="current_emp_billing_status" style="display: none" >
        <span id="bill_alloc_select_${i + 1}_text">${resExitTable.BILLING_STATUS
          }</span>
        <select class="form-control billing_select" id="bill_alloc_select_${i + 1}" data-id = "${i + 1}"  onchange="checkBillingWithDates(this)">
          ${billingOptions}
        </select>
      </td>      
    </tr>`;
        $("#resource_exist_body").append(resourceExistHtml);
        $(".currentNewEndDate").hide();
        $(".currentNewStartDate").hide();
        $("#current_end_date_" + (i + 1) + "_comments").prop("disabled", true);
        $("#current_end_date_" + (i + 1) + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
        });
        $("#current_start_date_" + (i + 1) + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
        });
        $(".input-group-addon").hide();
        $("#bill_alloc_select_" + (i + 1)).val(resExitTable.BILLING_STATUS);
        $("#bill_alloc_select_" + (i + 1)).hide();
        $(".current_emp_billing_status").hide();
        checkAccessAllocation()
      }
    });
  } else {
    $(".no_existing_resources").show();
  }
  createShortageData();

  // Toggle the 'Current Resources' legend visibility based on active resources
  toggleCurrentResourcesLegend();
  // $("#available_res_table").dataTable({
  //   pageLength: 25,
  //   columnDefs: [
  //     {
  //       targets: 0,
  //       orderable: false,
  //     },
  //   ],
  //   order: [[1, "asc"]],
  // });
}

let saveResourceData = async (formData) => {
  $("#update_resource_data").empty("")
  $("#update_resource_data").append("Updating Data...")
  try {
    apiURL = apiValue.url_ip + ":5005/allocate_resources";
    const startTime = performance.now();
    let data = await fetch(apiURL, {
      method: "POST",
      body: JSON.stringify(formData),
    });
    const result = await data.json();
    const endTime = performance.now();
    const loadTimeInSeconds = (endTime - startTime) / 1000;
    // getApiTime(loadTimeInSeconds, "createAllocation", "Allocation", "allocate_resources", "success", fileName, "Sow_Team_Allocation", "edit");
    if (result.Message == "Success") {
      toastr.options.timeOut = 2000; // 2s
      toastr.success(result.Response);
      getFindResourceData();
      $("#update_resource_data").attr("disabled", true);
      $("#update_resource_data").empty("")
      $("#update_resource_data").append("Allocate")
    } else {
      toastr.options.timeOut = 2000; // 2s
      toastr.error(result.Response);
      $("#update_resource_data").attr("disabled", false);
      $("#update_resource_data").empty("")
      $("#update_resource_data").append("Allocate")
    }
  } catch {
    // getApiTime(loadTimeInSeconds, "createAllocation", "Allocation", "allocate_resources", "success", fileName, "Sow_Team_Allocation", "edit");
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Failed to Update, Please try again");
    $("#update_resource_data").attr("disabled", false);
    $("#update_resource_data").empty("")
    $("#update_resource_data").append("Allocate")
  }
  allocateTeam();
}

function allocateTeam(request) {
  let newAvailableResData = "",
    count = 0,
    existingResData = "";
  let sowId = findResData.SOW_ID;
  let sowName = findResData.SOW_NAME;
  let accountName = findResData.ACCOUNT_NAME;
  let accountId = findResData.ACCOUNT_ID;
  let sowStatus = findResData.SOW_STATUS;
  let sowStartDate = findResData.ACTUAL_START_DATE;
  let sowEndDate = findResData.ACTUAL_END_DATE;
  let legalStartDate = findResData.LEGAL_START_DATE;
  let legalEndDate = findResData.LEGAL_END_DATE;
  let uniqued_id = findResData.UNIQUE_ID;
  let takeApprovalResponse = "NO";
  $("#resource_exist_table tbody tr").each(function () {
    let id,
      name,
      country,
      uniqueid,
      accountID,
      sowID,
      accountNm,
      sowNm,
      availablefrom,
      availableto,
      startDate,
      endDate,
      subresourcegrp,
      billingStatus,
      desg,
      oldEndDate,
      oldStartDate,
      resourcegroup,
      oldBilling,
      teamComments = "";
    id = $(this)
      .find(".current_emp_id")
      .text();
    // console.log("id", id);
    accountID = $(this)
      .closest("tr")
      .find(".current_emp_account_id")
      .text();
    sowID = $(this)
      .closest("tr")
      .find(".current_emp_sow_id")
      .text();
    accountNm = $(this)
      .closest("tr")
      .find(".current_emp_account_name")
      .html();
    sowNm = $(this)
      .closest("tr")
      .find(".current_emp_sow_name")
      .html();
    name = $(this)
      .closest("tr")
      .find(".current_emp_name")
      .html();
    country = $(this)
      .closest("tr")
      .find(".current_demand_loc")
      .html();
    startDate = $(this)
      .closest("tr")
      .find(".currentNewStartDate")
      .val();
    endDate = $(this)
      .closest("tr")
      .find(".currentNewEndDate")
      .val();
    oldStartDate = $(this)
      .closest("tr")
      .find(".current_emp_old_start_date")
      .text();
    oldEndDate = $(this)
      .closest("tr")
      .find(".current_emp_old_end_date")
      .text();
    oldBilling = $(this)
      .closest("tr")
      .find(".current_emp_old_billing")
      .text();
    billingStatus = $(this)
      .closest("tr")
      .find(".billing_select option:selected")
      .val();
    desg = $(this)
      .closest("tr")
      .find(".current_emp_job_role")
      .html();
    resourcegroup = $(this)
      .closest("tr")
      .find(".current_emp_resource_group")
      .html();
    subresourcegrp = $(this)
      .closest("tr")
      .find(".current_emp_resource_sub_group")
      .html();
    uniqueid = $(this)
      .closest("tr")
      .find(".current_emp_unique_id")
      .html();
    availablefrom = $(this)
      .closest("tr")
      .find(".current_emp_ava_from_date")
      .html();
    availableto = $(this)
      .closest("tr")
      .find(".current_emp_ava_to_date")
      .html();
    if (oldEndDate == "") {
      oldEndDate = endDate;
    }
    if (oldStartDate == "") {
      if (name == undefined) {
        name = $(this)
          .closest("tr")
          .find(".emp_name_option_selected option:selected")
          .text();
      }
    }

    let CheckOldDate = new Date(oldEndDate);
    let UpdatedDate = new Date(endDate);
    let checkStatus = false;
    if (oldEndDate != endDate) {
      checkStatus = true;
    }
    if (oldStartDate != startDate) {
      checkStatus = true;
    }
    if (oldBilling != billingStatus) {
      if (billingStatus == "Investment") {
        takeApprovalResponse = "YES";
      }
      checkStatus = true;
    }
    if (name == "Select team member") {
      checkStatus = false;
    } else if (name == "Not Allocated") {
      checkStatus = false;
    } else if (name == "") {
      checkStatus = false;
    } else if (startDate == "") {
      toastr.options.timeOut = 2000;
      toastr.error(
        "Please select start date of the team member <b>" + name + "</b>"
      );
      checkStatus = false;
    } else if (endDate == "") {
      toastr.options.timeOut = 2000;
      toastr.error(
        "Please select end date of the team member <b>" + name + "</b>"
      );
      checkStatus = false;
    }
    if (checkStatus) {
      count++;
      let teamOper = "Extension";
      if (CheckOldDate > UpdatedDate) {
        teamOper = "Release";
      }
      if (oldStartDate == "") {
        teamOper = "New Allocation";
        oldStartDate = availablefrom == "" ? "" : convertDates(availablefrom);
        oldEndDate = availableto == "" ? "" : convertDates(availableto);
      } else {
        oldStartDate = oldStartDate == "" ? "" : convertDates(oldStartDate);
        oldEndDate = oldEndDate == "" ? "" : convertDates(oldEndDate);
      }
      let checkSowEndDate = new Date($("#find_end_date").html());
      if (endDate != "") {
        let checkAvailabletoDate = new Date(endDate);
        if (checkAvailabletoDate > checkSowEndDate) {
          takeApprovalResponse = "YES";
        }
      }

      newAvailableResData +=
        '{ "ACCOUNT_ID" : "' +
        accountId +
        '", "SOW_ID":"' +
        sowId +
        '", "ACCOUNT_NAME":"' +
        accountName +
        '", "SOW_NAME":"' +
        sowName +
        '", "EMPLOYEE_ID":"' +
        id +
        '", "EMPLOYEE_NAME":"' +
        name +
        '", "JOB_ROLE":"' +
        desg +
        '", "RES_UNIQUE_ID":"' +
        uniqueid +
        '", "UNIQUE_ID":"' +
        uniqued_id +
        '", "ALLOCATION_START_DATE":"' +
        convertDates(startDate) +
        '", "ALLOCATION_END_DATE":"' +
        convertDates(endDate) +
        '", "ACTUAL_START_DATE":"' +
        sowStartDate.replace(' 00:00:00', '') +
        '", "ACTUAL_END_DATE":"' +
        sowEndDate.replace(' 00:00:00', '') +
        '", "LEGAL_START_DATE":"' +
        legalStartDate.replace(' 00:00:00', '') +
        '", "LEGAL_END_DATE":"' +
        legalEndDate.replace(' 00:00:00', '') +
        '", "BILLING_STATUS":"' +
        billingStatus +
        '", "LOCATION":"' +
        country +
        '", "SOW_STATUS":"' +
        sowStatus +
        '", "COMMENT":"' +
        teamComments +
        '", "OPERATION":"' +
        teamOper +
        '", "RESOURCE_GROUP":"' +
        resourcegroup +
        '", "SUB_RES_GROUP":"' +
        subresourcegrp +
        '"},';

      existingResData +=
        '{ "ACCOUNT_ID" : "' +
        accountId +
        '", "SOW_ID":"' +
        sowId +
        '", "ACCOUNT_NAME":"' +
        accountName +
        '", "SOW_NAME":"' +
        sowName +
        '", "EMPLOYEE_ID":"' +
        id +
        '", "EMPLOYEE_NAME":"' +
        name +
        '", "JOB_ROLE":"' +
        desg +
        '", "RES_UNIQUE_ID":"' +
        uniqueid +
        '", "ALLOCATION_START_DATE":"' +
        oldStartDate +
        '", "ALLOCATION_END_DATE":"' +
        oldEndDate +
        '", "ACTUAL_START_DATE":"' +
        sowStartDate.replace(' 00:00:00', '') +
        '", "ACTUAL_END_DATE":"' +
        sowEndDate.replace(' 00:00:00', '') +
        '", "LEGAL_START_DATE":"' +
        legalStartDate.replace(' 00:00:00', '') +
        '", "LEGAL_END_DATE":"' +
        legalEndDate.replace(' 00:00:00', '') +
        '", "BILLING_STATUS":"' +
        billingStatus +
        '", "LOCATION":"' +
        country +
        '", "SOW_STATUS":"' +
        sowStatus +
        '", "COMMENT":"' +
        teamComments +
        '", "RESOURCE_GROUP":"' +
        resourcegroup +
        '", "SUB_RES_GROUP":"' +
        subresourcegrp +
        '"},';
    }
  });
  // console.log("newAvailableResData", newAvailableResData);

  if (newAvailableResData.endsWith(",")) {
    newAvailableResData = newAvailableResData.slice(0, -1);
  }

  if (existingResData.endsWith(",")) {
    existingResData = existingResData.slice(0, -1);
  }
  let data1 = JSON.stringify(newAvailableResData);

  let approverName = [];
  console.log('Count value - ', count);
  if (count > 0) {
    if (request === 'Allocate') {
      $("#update_resource_data").attr("disabled", true);
      let checkSOWRenewalStatus = false;
      let approvalDataStatus = "Business head";
      let accessDetails =
        '{ "ACCESS_LEVEL" : "' +
        accese_level +
        '", "Access":"' +
        accessData +
        '", "EDIT_ACCESS":"' +
        edit_access +
        '", "EMAIL_ID":"' +
        sessionName +
        '", "GROUP_NAME":"' +
        groupName +
        '", "USERNAME":"' +
        empName +
        '", "USER_ID":"' +
        empId +
        '"}';
      let approvalData =
        '{ "TAKE_APPROVAL" : "' +
        takeApprovalResponse +
        '", "APPROVER":"' +
        approvalDataStatus +
        '"}';
      // console.log("approvalData", approvalData);

      let resource_old_data = "";
      let prepareData = {
        query_type: "allocate_resources",
        environment: apiValue.environment,
        user_details: "[" + accessDetails + "]",
        APPROVAL_DATA: "[" + approvalData + "]",
        resource_new_data: "[" + newAvailableResData + "]",
        resource_old_data: "[" + existingResData + "]",
        payload: JSON.parse(allocation_sel_data)
      };

      saveResourceData(prepareData);
    }
  } else {
    $("#update_resource_data").attr("disabled", true);
  }
}

function convertDate(date) {
  let finalDate = "";
  if (date != undefined) {
    let newDate = date.split("-");

    let mm = newDate[1];
    let dd = newDate[0];
    let yy = newDate[2];
    yy = "20" + yy;
    finalDate = yy + "-" + mm + "-" + dd;
  }
  return finalDate;
}

function convertDates(date) {
  let dates = new Date(date);
  var yyyy = dates.getFullYear().toString();
  var mm = (dates.getMonth() + 1).toString();
  var dd = dates.getDate().toString();

  var mmChars = mm.split("");
  var ddChars = dd.split("");

  return (
    yyyy +
    "-" +
    (mmChars[1] ? mm : "0" + mmChars[0]) +
    "-" +
    (ddChars[1] ? dd : "0" + ddChars[0])
  );
}
function formatDate(date) {
  var year = date.getFullYear().toString();
  var month = (date.getMonth() + 101).toString().substring(1);
  var day = (date.getDate() + 100).toString().substring(1);
  return year + "-" + month + "-" + day;
}

function updateTeamDate(obj) {
  let dataId = $(obj).attr("data-id");
  let getCount = dataId.replace("current_end_date_", "");
  let getHtml = $("#" + dataId + "_button").html();
  if (getHtml == '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>') {
    $("#" + dataId + "_button").html("<i class='fa fa-pencil-square'></i>");
    $("#" + dataId + "_input").show();
    $("#" + dataId).hide();
    $("#" + dataId + "_comments").prop("disabled", false);
    $("#current_start_date_" + getCount + "_input").show();
    $("#current_start_date_" + getCount).hide();
    $("#bill_alloc_select_" + getCount).show();
    $("#bill_alloc_select_" + getCount + "_text").hide();
  } else {
    $("#" + dataId + "_button").html(
      '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>'
    );
    $("#" + dataId + "_input").hide();
    $("#" + dataId).html($("#" + dataId + "_input").val());
    $("#" + dataId).show();
    $("#" + dataId + "_comments").prop("disabled", true);
    $("#current_start_date_" + getCount + "_input").hide();
    $("#current_start_date_" + getCount).html(
      $("#current_start_date_" + getCount + "_input").val()
    );
    $("#current_start_date_" + getCount).show();
    $("#bill_alloc_select_" + getCount).hide();
    $("#bill_alloc_select_" + getCount + "_text").show();
    $("#bill_alloc_select_" + getCount + "_text").html(
      $("#bill_alloc_select_" + getCount + " option:selected").val()
    );
  }
}

function requestData() {
  let current_team_details = "";

  accountId = findResData.ACCOUNT_ID;
  let sowId = $("#sowNameID").html();
  let actualStartDate = findResData.ACTUAL_START_DATE;
  let accountName = $("#find_account_name").html();
  let sowName = $("#sowName").html();
  let actualEndDate = findResData.ACTUAL_END_DATE;
  let indDemand = findResData.INDIA_RESOURCE_DEMAND;
  let usDemand = findResData.US_RESOURCE_DEMAND;
  let comment = $("#request_resource").val();
  $("#resoure_exist_table tbody tr").each(function () {
    let id,
      name,
      country,
      startDate,
      endDate,
      billingStatus,
      skills,
      designation,
      teamNewEnd;
    name = $(this)
      .closest("tr")
      .find(".current_emp_name")
      .html();
    designation = $(this)
      .closest("tr")
      .find(".current_emp_desg")
      .html();
    country = $(this)
      .closest("tr")
      .find(".current_emp_loc")
      .html();
    startDate = $(this)
      .closest("tr")
      .find(".current_emp_start_date")
      .text();
    oldEndDate = $(this)
      .closest("tr")
      .find(".current_emp_old_end_date")
      .text();
    billingStatus = $(this)
      .closest("tr")
      .find(".current_emp_billing_status")
      .html();
    current_team_details +=
      '{ "TEAM_MEMBER" : "' +
      name +
      '", "DESIGNATION":"' +
      designation +
      '", "LOCATION":"' +
      country +
      '", "ALLOCATION_START_DATE":"' +
      convertDate(startDate) +
      '", "ALLOCATION_END_DATE":"' +
      convertDate(oldEndDate) +
      '", "BILLING_STATUS":"' +
      billingStatus +
      '"},';
  });
  demand_details +=
    '{ "ACCOUNT_ID" : "' +
    accountId +
    '", "SOW_ID":"' +
    sowId +
    '", "ACTUAL_START_DATE":"' +
    actualStartDate +
    '", "ACCOUNT_NAME":"' +
    accountName +
    '", "SOW_NAME":"' +
    sowName +
    '", "ACTUAL_END_DATE":"' +
    actualEndDate +
    '", "IND_DEMAND":"' +
    indDemand +
    '", "USCA_DEMAND":"' +
    usDemand +
    '", "COMMENT":"' +
    comment +
    '"},';
  let accessDetails =
    '{ "ACCESS_LEVEL" : "' +
    accese_level +
    '", "Access":"' +
    accessData +
    '", "EDIT_ACCESS":"' +
    edit_access +
    '", "EMAIL_ID":"' +
    sessionName +
    '", "GROUP_NAME":"' +
    groupName +
    '", "USERNAME":"' +
    empName +
    '", "USER_ID":"' +
    empId +
    '"}';
  $(".request_resources").attr("disabled", false);
  $.ajax({
    url: apiValue.url,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({
      query_type: "request_team",
      environment: apiValue.environment,
      user_details: "[" + accessDetails + "]",
      current_team_details: "[" + current_team_details + "]",
      demand_details: "[" + demand_details + "]",
    }),
    success: function (json) {
      $(".request_resources").attr("disabled", false);
      if (json.Message == "Success") {
        toastr.options.timeOut = 2000; // 2s
        toastr.success(json.Response);
        getDataResource();
        window.location.href = "allocationDashboard.html";
      } else {
        toastr.options.timeOut = 2000; // 2s
        toastr.error(json.Response);
      }
    },
    error: function (error) {
      $(".request_resources").attr("disabled", false);
      toastr.options.timeOut = 2000; // 2s
      toastr.error(JSON.stringify(error));
    },
  });
}

function checkSOWEnddate(obj) {
  let id = $(obj).attr("id");
  let dataId = $(obj).attr("data-id");
  let sowSelectStartDate = new Date(
    $("#current_start_date_" + dataId + "_input").val()
  );
  let selectedBilling = $("#bill_alloc_select_" + dataId + " option:selected").val();
  let endDateRes = new Date($("#" + id).val());
  let dataEndDate = $(obj).attr('data-id-2');
  let dataEndDateConvert = new Date(dataEndDate);
  // let dataEndDate = new Date('2024-08-08');
  let oldEnddate = $("#current_end_date_" + dataId).text();
  if (oldEnddate == '' || oldEnddate == null || oldEnddate == " ") {
    oldEnddate = dataEndDate
  }

  let sowEndDateTemp = new Date($("#find_end_date").html());
  if ((endDateRes > sowEndDateTemp) && selectedBilling == 'Billed') {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Selected end date cannot be after the SOW end date");
    $("#" + id).val(oldEnddate)
  } else if ((dataEndDateConvert < endDateRes) && selectedBilling == 'Billed') {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Selected end date cannot be after the resource's availability end date");
    $("#" + id).val(oldEnddate)
  } else if (sowSelectStartDate > endDateRes) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please ensure the end date is later than the start date");
    $("#" + id).val(oldEnddate)
  } else if (sowSelectStartDate == "Invalid Date") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select start date");
  }
  checkDuplicateNamesInResource('sow_end_date')
  allocateTeam()
}

function checkSOWStartdate(obj) {
  let id = $(obj).attr("id");
  let dataId = $(obj).attr("data-id");
  let sowSelectEndDate = new Date(
    $("#current_end_date_" + dataId + "_input").val()
  );
  let oldDate = $("#current_start_date_" + dataId).text()
  let dataStartDate = $(obj).attr('data-id-2')
  let dataStartDateConvert = new Date(dataStartDate);
  let startDateRes = new Date($("#" + id).val());
  if (oldDate == '' || oldDate == null || oldDate == " ") {
    oldDate = dataStartDate
  }
  // let dataStartDate = new Date('2024-07-09');
  let sowStartDateTemp = new Date($("#find_start_date").html());
  let selectedBilling = $("#bill_alloc_select_" + dataId + " option:selected").val();
  let sowEndDateTemp = new Date($("#find_end_date").html());
  if ((sowStartDateTemp > startDateRes) && selectedBilling == 'Billed') {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please choose a start date on or after the SOW start date");
    $("#" + id).val(oldDate); // Reset input value to oldDate
  } else if (dataStartDateConvert > startDateRes) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please choose a start date on or after the resource's available start date");
    $("#" + id).val(oldDate)
  } else if (sowSelectEndDate < startDateRes) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select a start date on or before the resource's available end date");
    $("#" + id).val(oldDate); // Reset input value to oldDate
  }
  checkDuplicateNamesInResource('sow_start_date')
  allocateTeam()
}

function checkBillingWithDates(obj) {
  let id = $(obj).attr("id");
  let dataId = $(obj).attr("data-id");
  let selectedBilling = $("#" + id + " option:selected").val();
  let oldStartDate = $("#current_start_date_" + dataId).text()
  let oldDate = $("#current_start_date_" + dataId).text()

  let sowSelectStartDate = new Date(
    $("#current_start_date_" + dataId + "_input").val()
  );

  let sowStartDateTemp = new Date($("#find_start_date").html());
  let oldEnddate = $("#current_end_date_" + dataId).text();
  let sowEndDateTemp = new Date($("#find_end_date").html());
  let sowSelectEndDate = new Date(
    $("#current_end_date_" + dataId + "_input").val()

  )

  if (sowSelectStartDate != 'Invalid Date') {
    if ((sowStartDateTemp > sowSelectStartDate) && selectedBilling == 'Billed') {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Please choose a start date on or after the SOW start date");
      $("#current_start_date_" + dataId + "_input").val(oldDate)
    }
  }
  // } else {
  //   toastr.options.timeOut = 2000; // 2s
  //   toastr.error("Please select allocation start date");
  // }
  if (sowSelectEndDate != 'Invalid Date') {
    if ((sowSelectEndDate > sowEndDateTemp)) {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Selected end date cannot be after the SOW end date");
    }
    // } else {
    //   toastr.options.timeOut = 2000; // 2s
    //   toastr.error("Please select allocation end date");
    // }
  }
  checkDuplicateNamesInResource('billing_date')
  allocateTeam()
}
function createShortageData() {
  let avaiable_res_name_list = "",
    avaiable_res_name_list_ind = "",
    avaiable_res_name_list_us = "";
  if (getAvailableEmpData.length > 0) {
    avaiable_res_name_list = "<option value='-1'>Select team member</option>";

    $.each(getAvailableEmpData, function (n, name) {
      if (name.LOCATION == "India") {
        avaiable_res_name_list_ind += `<option value="${name.EMPLOYEE_ID}">${name.EMPLOYEE_NAME}</option>`;
      } else {
        avaiable_res_name_list_us += `<option value="${name.EMPLOYEE_ID}">${name.EMPLOYEE_NAME}</option>`;
      }
    });
  } else {
    avaiable_res_name_list =
      "<option value='-1' disabled>Team members not available</option>";
  }

  let rowCount = $("#resource_exist_table tbody tr").length;
  let demand_allocated_date = findResData.DEMAND_ALLOCATED_DATA;
  if (demand_allocated_date.length > 0) {
    $.each(demand_allocated_date, function (i, resExitTable) {
      if (resExitTable.EMPLOYEE_NAME == "" && resExitTable.LOCATION == "US") {
        let demand_start_date = resExitTable.DEMAND_START_DATE;
        let demand_end_date = resExitTable.DEMAND_END_DATE;
        let resourcegroup = resExitTable.RESOURCE_GROUP;
        let subresourcegrp = resExitTable.SUB_RES_GROUP;
        let accountid = resExitTable.ACCOUNT_ID;
        let sowid = resExitTable.SOW_ID;
        let accountname = resExitTable.ACCOUNT_NAME;
        let sowname = resExitTable.SOW_NAME;
        let uniqueid = resExitTable.RES_UNIQUE_ID;
        recommResModelUser = resExitTable.RECOMMENDATIONS;
        // recommResModelUser = [];
        let eachResCompleteData = resExitTable;
        delete eachResCompleteData.RECOMMENDATIONS;
        avaiable_res_name_list += avaiable_res_name_list_us;
        let persona = resExitTable.REQUIRED_PERSONA;

        let shortageHtml = createShortageHtmlData(
          "US",
          i,
          accountid,
          sowid,
          accountname,
          sowname,
          resourcegroup,
          subresourcegrp,
          uniqueid,
          rowCount,
          demand_start_date,
          demand_end_date,
          avaiable_res_name_list,
          recommResModelUser,
          persona,
          eachResCompleteData
        );

        $("#resource_exist_body").append(shortageHtml);
        let uniqId = i + (rowCount + 1);
        $("#current_start_date_" + uniqId + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
        });
        $("#current_end_date_" + uniqId + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
        });
        $(".input-group-addon").hide();
        $("#avaiable_res_list_" + uniqId + " option").each(function () {
          $(this)
            .siblings('[value="' + this.value + '"]')
            .remove();
        });
        $("#avaiable_res_list_" + uniqId).select2({});
        let getValue = $(`#res_recommend_selcted_name_${uniqId}`).text();
        console.log('getValue - ', getValue);
        if (getValue == 'Not Allocated') {
          $(`#res_recommend_selcted_name_${uniqId}`).addClass('not_allocated_res')
          $(`#current_start_date_${uniqId}_input`).hide();
          $(`#current_end_date_${uniqId}_input`).hide();
          $(`#bill_alloc_select_${uniqId}`).hide();
        } else {
          $(`#res_recommend_selcted_name_${uniqId}`).removeClass('not_allocated_res')
          $(`#current_start_date_${uniqId}_input`).show();
          $(`#current_end_date_${uniqId}_input`).show();
          $(`#bill_alloc_select_${uniqId}`).show();
        }
        // autoSelectRecomUser(
        //   $("#avaiable_res_list_" + uniqId + " option:selected").val(),
        //   uniqId
        // );
        checkAccessAllocation();
      }
      if (
        resExitTable.EMPLOYEE_NAME == "" &&
        resExitTable.LOCATION == "INDIA"
      ) {
        let demand_start_date = resExitTable.DEMAND_START_DATE;
        let demand_end_date = resExitTable.DEMAND_END_DATE;
        let resourcegroup = resExitTable.RESOURCE_GROUP;
        let subresourcegrp = resExitTable.SUB_RES_GROUP;
        let accountid = resExitTable.ACCOUNT_ID;
        let sowid = resExitTable.SOW_ID;
        let accountname = resExitTable.ACCOUNT_NAME;
        let sowname = resExitTable.SOW_NAME;
        let persona = resExitTable.REQUIRED_PERSONA;
        let uniqueid = resExitTable.RES_UNIQUE_ID;
        recommResModelUser = resExitTable.RECOMMENDATIONS;
        // recommResModelUser = [];
        let eachResCompleteData = resExitTable;
        delete eachResCompleteData.RECOMMENDATIONS;
        avaiable_res_name_list =
          "<option value='-1'>Select team member</option>";
        avaiable_res_name_list += avaiable_res_name_list_ind;

        let shortageHtml = createShortageHtmlData(
          "India",
          i,
          accountid,
          sowid,
          accountname,
          sowname,
          resourcegroup,
          subresourcegrp,
          uniqueid,
          rowCount,
          demand_start_date,
          demand_end_date,
          avaiable_res_name_list,
          recommResModelUser,
          persona,
          eachResCompleteData
        );

        $("#resource_exist_body").append(shortageHtml);
        let uniqId = i + (rowCount + 1);
        $("#current_start_date_" + uniqId + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
        });
        $("#current_end_date_" + uniqId + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
        });
        $(".input-group-addon").hide();
        $("#avaiable_res_list_" + uniqId + " option").each(function () {
          $(this)
            .siblings('[value="' + this.value + '"]')
            .remove();
        });
        $("#avaiable_res_list_" + uniqId).select2({});
        let selectId = $("#avaiable_res_list_" + uniqId + " option:selected");
        let getValue = $(`#res_recommend_selcted_name_${uniqId}`).text();
        console.log('getValue - ', getValue);
        if (getValue == 'Not Allocated') {
          $(`#res_recommend_selcted_name_${uniqId}`).addClass('not_allocated_res')
          $(`#current_start_date_${uniqId}_input`).hide();
          $(`#current_end_date_${uniqId}_input`).hide();
          $(`#bill_alloc_select_${uniqId}`).hide();
        } else {
          $(`#res_recommend_selcted_name_${uniqId}`).removeClass('not_allocated_res')
          $(`#current_start_date_${uniqId}_input`).show();
          $(`#current_end_date_${uniqId}_input`).show();
          $(`#bill_alloc_select_${uniqId}`).show();
        }
        // autoSelectRecomUser(
        //   $("#avaiable_res_list_" + uniqId + " option:selected").val(),
        //   uniqId
        // );
        checkAccessAllocation()
      }
    });
  }

  // Toggle the 'Current Resources' legend visibility after adding shortage data
  toggleCurrentResourcesLegend();
}

let rowCount = $("#resource_exist_table tbody tr").length;
function createNewTeam() {
  let demand_allocated_date = findResData.DEMAND_ALLOCATED_DATA;
  let avaiable_res_name_list = "";
  if (getAvailableEmpData.length > 0) {
    avaiable_res_name_list = "<option value='-1'>Select team member</option>";
    $.each(getAvailableEmpData, function (n, name) {
      avaiable_res_name_list += `<option value="${name.EMPLOYEE_ID}">${name.EMPLOYEE_NAME}</option>`;
    });
  } else {
    avaiable_res_name_list =
      "<option value='-1' disabled>No available team member</option>";
  }
  // console.log("resExitTable",resExitTable);
  let resExitTable = demand_allocated_date[0];
  let lastClass = $("#resource_exist_table tbody tr:last").attr("class");
  let rowCount = parseInt(lastClass.replace("current_team_", ""));
  let sowStartDate = resExitTable.ACTUAL_START_DATE;
  let sowEndDate = resExitTable.ACTUAL_END_DATE;
  let uniqueid = resExitTable.RES_UNIQUE_ID;
  let resourcegroup = "";
  let subresourcegrp = "";
  let demand_start_date = sowStartDate;
  let demand_end_date = sowEndDate;
  let accountid = resExitTable.ACCOUNT_ID;
  let sowid = resExitTable.SOW_ID;
  let accountname = resExitTable.ACCOUNT_NAME;
  let sowname = resExitTable.SOW_NAME;
  // recommResModelUser = resExitTable.RECOMMENDATIONS;
  recommResModelUser = [];
  let eachResCompleteData = resExitTable
  delete eachResCompleteData.RECOMMENDATIONS;
  // let persona = resExitTable.REQUIRED_PERSONA;
  let persona = "";
  let shortageHtml = createShortageHtmlData(
    "",
    0,
    accountid,
    sowid,
    accountname,
    sowname,
    resourcegroup,
    subresourcegrp,
    uniqueid,
    rowCount,
    demand_start_date,
    demand_end_date,
    avaiable_res_name_list,
    recommResModelUser,
    persona,
    eachResCompleteData
  );

  $("#resource_exist_body").append(shortageHtml);
  $("#current_start_date_" + (rowCount + 1) + "_input").datepicker({
    format: "mm-dd-yy",
    uiLibrary: "bootstrap",
  });
  $("#current_end_date_" + (rowCount + 1) + "_input").datepicker({
    format: "mm-dd-yy",
    uiLibrary: "bootstrap",
  });
  $(".input-group-addon").hide();
  $("#avaiable_res_list_" + (rowCount + 1) + " option").each(function () {
    $(this)
      .siblings('[value="' + this.value + '"]')
      .remove();
  });
  $("#avaiable_res_list_" + (rowCount + 1)).select2({});
  $(`#current_start_date_${rowCount + 1}_input`).css("visibility", "hidden");
  $(`#current_end_date_${rowCount + 1}_input`).css("visibility", "hidden");
  $(`#bill_alloc_select_${rowCount + 1}`).css("visibility", "hidden");
  checkAccessAllocation()
}

function createShortageHtmlData(
  loc,
  increment,
  accountid,
  sowid,
  accountname,
  sowname,
  resourcegroup,
  subresourcegrp,
  uniqueid,
  row,
  demand_start_date,
  demand_end_date,
  avaiable_res_name_list,
  recommResModelUser,
  persona,
  eachResCompleteData
) {
  let deleteButton = "",
    selectedteam = "",
    resRecomListUser = "",
    resListStatus = false;
  let selectedData = {
    location: loc,
    account_id: accountid,
    sow_id: sowid,
    account_name: accountname,
    sow_name: sowname,
    resource_group: resourcegroup,
    sub_resource_group: subresourcegrp,
    start_date: demand_start_date,
    end_date: demand_end_date,
    actual_start_date: convertDates($("#actual_start_date").text()),
    actual_end_date: convertDates($("#actual_end_date").text()),
    persona: persona,
  };

  if (typeof recommResModelUser !== 'undefined' && recommResModelUser.length > 0) {
    resListStatus = true;
    $.each(recommResModelUser, function (n, name) {
      if (name.COUNTRY == "India") {
        resRecomListUser += `<option value="${name.EMPLOYEE_ID}">${name.EMPLOYEE_NAME}</option>`;
      } else {
        resRecomListUser += `<option value="${name.EMPLOYEE_ID}">${name.EMPLOYEE_NAME}</option>`;
      }
    });
  } else {
    // Handle the case when recommResModelUser is undefined or empty
    resListStatus = false;
    console.error("recommResModelUser is undefined or empty.");
  }

  selectedteam = `<select class="emp_name_option_selected" id="avaiable_res_list_${increment +
    (row + 1)}" onchange="getEmpId(this, 'new')">
              ${avaiable_res_name_list}
            </select>`;
  if (loc == "") {
    deleteButton = `<button class="btn btn-info-allocation header-button show-bu-head-data" onclick="deleteTeamDate(this);" 
                      id="current_delete_${increment +
      (row + 1)}_button" data-id = "${increment + (row + 1)}">
                      <i class="fa fa-trash" aria-hidden="true"></i>
                    </button>`;
  } else {
    selectedteam = `<span id='res_recommend_selcted_name_${increment +
      (row + 1)}' class="current_emp_name className_recommend">Not Allocated</span> 
                      <button type="button" class="btn btn-info-allocation header-button show-bu-head-data" 
                        id="res_recommend_data_${increment +
      (row + 1)}" title="Recommended Resource"
                        data-toggle="modal" data-target="#recommTeam" 
                        data-id='${JSON.stringify(selectedData)}' 
                        data-id2='${JSON.stringify(eachResCompleteData)}'
                        onclick="getRecommendUserData(this)" data-id1='${JSON.stringify(
        recommResModelUser
      )}'>
                          <i class="fa fa-magic" aria-hidden="true"></i>
                      </button>
                      <br>
                      <select class="emp_name_option_selected" id="avaiable_res_list_${increment +
      (row +
        1)}" onchange="getEmpId(this, 'new')" style='display: none'>
                                ${resRecomListUser}
                              </select>`;
  }
  let view = `<tr class="current_team_${increment + (row + 1)}">
                  <td class="current_demand_loc" id="avi_emp_loc_${increment +
    (row + 1)}">${loc}</td>
                  <td class="current_demand_persona">${persona}</td>
                  <td class="current_demand_actual_start" id="avi_res_demand_start_date_${increment +
    (row + 1)}">${demand_start_date == "NaT" || "" ? "-" : convertNew(demand_start_date)
    }</td>
                  <td class="current_demand_actual_end" id="avi_res_demand_end_date_${increment +
    (row + 1)}">${demand_end_date == "NaT" || "" ? "-" : convertNew(demand_end_date)
    }</td>
                  
                  <td class="current_emp_account_id" id="avi_account_id_${increment +
    (row + 1)}" style="display:none">${accountid}</td>
                  <td class="current_emp_sow_id" id="avi_emp_sow_id_${increment +
    (row + 1)}" style="display:none">${sowid}</td>
                  <td class="current_emp_account_name" id="avi_account_name_${increment +
    (row + 1)}" style="display:none">${accountname}</td>
                  <td class="current_emp_sow_name" id="avi_sow_name_${increment +
    (row + 1)}" style="display:none">${sowname}</td>
                  <td class="current_emp_id" id="avi_emp_id_${increment +
    (row + 1)}" style="display:none"></td>
                  <td class="current_emp_resource_group" id="avi_emp_resource_group_${increment +
    (row + 1)}" style="display:none">${resourcegroup}</td>
                  <td class="current_emp_resource_sub_group" id="avi_emp_resource_sub_group_${increment +
    (row + 1)}" style="display:none">${subresourcegrp}</td>
                  <td class="current_emp_unique_id" id="avi_emp_resource_sub_group_${increment +
    (row + 1)}" style="display:none">${uniqueid}</td>
                  <td class="current_emp_name_new view_msg" colspan="8">
                    <span class="resource-allocate-msg">Resource yet to be allocated</span>
                  </td>
                </tr>`;

  let edit_delete = `<tr class="current_team_${increment + (row + 1)}">
                        <td class="current_demand_loc" id="avi_emp_loc_${increment +
    (row + 1)}">${loc}</td>
                        <td class="current_demand_persona">${persona}</td>
                        <td class="current_demand_actual_start" id="avi_res_demand_start_date_${increment +
    (row + 1)}">${demand_start_date == "NaT" || "" ? "-" : convertNew(demand_start_date)
    }</td>
                        <td class="current_demand_actual_end" id="avi_res_demand_end_date_${increment +
    (row + 1)}">${demand_end_date == "NaT" || "" ? "-" : convertNew(demand_end_date)
    }</td>
                        
                        <td class="current_emp_account_id" id="avi_account_id_${increment +
    (row + 1)}" style="display:none">${accountid}</td>
                        <td class="current_emp_sow_id" id="avi_emp_sow_id_${increment +
    (row + 1)}" style="display:none">${sowid}</td>
                        <td class="current_emp_account_name" id="avi_account_name_${increment +
    (row + 1)}" style="display:none">${accountname}</td>
                        <td class="current_emp_sow_name" id="avi_sow_name_${increment +
    (row + 1)}" style="display:none">${sowname}</td>
                        <td class="current_emp_id" id="avi_emp_id_${increment +
    (row + 1)}" style="display:none"></td>
                        <td class="current_emp_resource_group" id="avi_emp_resource_group_${increment +
    (row + 1)}" style="display:none">${resourcegroup}</td>
                        <td class="current_emp_resource_sub_group" id="avi_emp_resource_sub_group_${increment +
    (row + 1)}" style="display:none">${subresourcegrp}</td>
                        <td class="current_emp_unique_id" id="avi_emp_resource_sub_group_${increment +
    (row + 1)}" style="display:none">${uniqueid}</td>
                        <td class="current_emp_name_new name_display" id="avi_emp_name_${increment +
    (row + 1)}">
                          ${selectedteam}
                        </td>
                        
                        <td class="current_emp_job_role" id="avi_emp_desc_${increment +
    (row + 1)}"></td>
                        <td class="current_emp_supply_persona" id="avi_emp_persona_${increment +
    (row + 1)}"></td>
                        <td class="current_emp_skills" style="display:none" id="avi_emp_skill_data_${increment +
    (row + 1)}"></td>
                        <td class="more" id="avi_emp_skill_${increment + (row + 1)}"></td>
                        <td class="current_emp_start_date">
                          <input type="text" class="form-control placeicon dateData resourceDate currentNewStartDate" 
                            id="current_start_date_${increment + (row + 1)}_input"
                            data-id = "${increment + (row + 1)}" 
                            data-id-2 = ''
                            placeholder="&#xf073; MM-DD-YY" 
                            name="resource_start_date" 
                            autocomplete="off" 
                            onchange = checkSOWStartdate(this)
                            style="z-index: 1;"/>
                        </td>
                        <td class="current_emp_end_date">
                          <input type="text" class="form-control placeicon dateData resourceDate currentNewEndDate" 
                            id="current_end_date_${increment + (row + 1)}_input"
                            data-id = "${increment + (row + 1)}" 
                            data-id-2 = ''
                            placeholder="&#xf073; MM-DD-YY" 
                            name="resource_end_date" 
                            autocomplete="off" 
                            onchange = checkSOWEnddate(this)
                            style="z-index: 1;"/>
                        </td>
                        <td class="current_emp_old_start_date" style="display: none"></td> 
                        <td class="current_emp_old_end_date" style="display: none"></td> 
                        <td class="current_emp_ava_from_date" id="avi_available_from_${increment +
    (row + 1)}" style="display: none"></td> 
                        <td class="current_emp_ava_to_date" id="avi_available_to_${increment +
    (row + 1)}" style="display: none"></td> 
                        <td class="current_emp_old_billing" style="display: none"></td> 
                        <td class="current_emp_billing_status" style="display: none">
                          <select class="form-control billing_select" id="bill_alloc_select_${increment +
    (row + 1)}" data-id = "${increment + (row + 1)}"  onchange="checkBillingWithDates(this)">
                            ${billingOptions}
                          </select>
                        </td>                
                        <td>
                          ${deleteButton}
                        </td>
                      </tr>`;

  return editAccess === true ? edit_delete : view;
}

function getRecomSelTeamId() {
  var selectedVal = "";
  var selected = $(
    "input[type='radio'][name='recommend_team_selected']:checked"
  );

  if (selected.length > 0) {
    selectedVal = selected.val();
  }
  let tempList = selectedVal.split(",");
  $("#recommend_btn").attr("data-id1", tempList[0]);
  $("#recommend_btn").attr("data-start", tempList[1]);
  $("#recommend_btn").attr("data-end", tempList[2]);
}

function getEmpId(obj, value) {

  let id = "",
    id_count = "",
    className_recommend = "recommended_no";
  (selected_team_id = ""),
    (selectedStatus = true),
    (all_start_date = ""),
    (all_end_date = ""),
    (selected_recom = []);
  if (value == "new") {
    id = $(obj).attr("id");
    id_count = id.replace("avaiable_res_list_", "");
    selected_team_id = $("#" + id + " option:selected").val();
    console.log('selected_team_id - ', selected_team_id)
  } else {
    getRecomSelTeamId();
    id_count = $(obj).attr("data-id");
    selected_team_id = $(obj).attr("data-id1");
    all_start_date = $(obj).attr("data-start");
    selected_recom = JSON.parse($(obj).attr("data-id2"));
    all_end_date = $(obj).attr("data-end");

    if (selected_team_id == "") {
      toastr.options.timeOut = 2000;
      toastr.error("Please Select Resource");
      selectedStatus = false;
    } else {
      $("#recommTeam").modal("hide");
    }
  }
  if (selectedStatus) {
    let recomndation_status = selected_recom.filter(
      (emp_data) => emp_data.EMPLOYEE_ID == selected_team_id
    );

    let elementId = "res_recommend_selcted_name_" + id_count;
    let element = document.getElementById(elementId);

    if (element != null) {
      if (recomndation_status[0].FINAL_SCORE > 0) {
        element.classList.remove("recommended_no");
        element.classList.add("recommended_yes");
      } else if (recomndation_status[0].FINAL_SCORE < 0) {
        element.classList.remove("recommended_yes");
        element.classList.add("recommended_no");
      } else {
        element.classList.remove("recommended_yes");
        element.classList.remove("recommended_no");
      }
    }
    if (recomndation_status.length == 0) {
      recomndation_status = getAvailableEmpData.filter(
        (emp) => emp.EMPLOYEE_ID == selected_team_id
      );
    }
    $.each(recomndation_status, function (i, sel_emp) {
      let all_start_date = sel_emp.AVAILABLE_FROM;
      let all_end_date = sel_emp.AVAILABLE_TO;
      $("#res_recommend_selcted_name_" + id_count).empty();
      $("#avi_emp_desc_" + id_count).empty();
      $("#avi_emp_person_" + id_count).empty();
      $("#avi_emp_persona_" + id_count).empty();
      $("#avi_emp_skill_" + id_count).empty();
      $("#avi_emp_skill_data_" + id_count).empty();
      $("#avi_emp_loc_" + id_count).empty();
      $("#avi_emp_id_" + id_count).empty();
      $("#avi_account_id_" + id_count).empty();
      $("#avi_emp_sow_id_" + id_count).empty();
      $("#avi_account_name_" + id_count).empty();
      $("#avi_sow_name_" + id_count).empty();
      $("#avi_available_from_" + id_count).empty();
      $("#avi_available_to_" + id_count).empty();
      let demand_start_date = $(
        "#avi_res_demand_start_date_" + id_count
      ).text();
      let demand_end_date = $("#avi_res_demand_end_date_" + id_count).text();
      if (demand_start_date != "-") {
        if (new Date(all_start_date) >= new Date(demand_start_date)) {
          $("#current_start_date_" + id_count + "_input").val(
            convertNew(all_start_date)
          );
          $("#current_start_date_" + id_count + "_input").attr("data-id-2", convertNew(all_start_date));
        } else {
          $("#current_start_date_" + id_count + "_input").val(
            demand_start_date
          );
          $("#current_start_date_" + id_count + "_input").attr("data-id-2", demand_start_date);

        }
      } else {
        $("#current_start_date_" + id_count + "_input").val(
          convertNew(all_start_date)
        );
        $("#current_start_date_" + id_count + "_input").attr("data-id-2", convertNew(all_start_date));
      }

      if (demand_end_date != "-") {
        // if (new Date(all_end_date) >= new Date(demand_end_date)) {
        if (new Date(all_end_date) <= new Date(demand_end_date)) {
          $("#current_end_date_" + id_count + "_input").val(
            convertNew(all_end_date)
          );
          $("#current_end_date_" + id_count + "_input").attr("data-id-2", convertNew(all_end_date));

        } else {
          $("#current_end_date_" + id_count + "_input").val(demand_end_date);
          $("#current_end_date_" + id_count + "_input").attr("data-id-2", demand_end_date);

        }
      } else {
        $("#current_end_date_" + id_count + "_input").val(
          convertNew(all_end_date)
        );
        $("#current_end_date_" + id_count + "_input").attr("data-id-2", convertNew(all_end_date));

      }
      // let skills = sel_emp.SKILL_DATE;
      // console.log("sel_emp",sel_emp);
      // let skillHtml = "",
      //   skillPersonaHtml = "",
      //   skillsBackendData = "";
      // $.each(skills, function (j, skillData) {
      //   if (skillData.SKILL != "NO_SKILL") {
      //     skillHtml += `<button class="skill_data">${skillData.SKILL}</button>`;
      //     skillsBackendData += `${skillData.SKILL},`;
      //   }
      // });

      let skills = sel_emp.SKILLS_LEVEL; // Assuming this is a string like "AWS-R1,Azure-R1,Excel-R1,Python-R1,Snowflake-R1,SQL-R1"
      let skillHtml = "", skillsBackendData = "", skillCount = 0;

      if (skills === undefined) {
        skills = sel_emp.SKILL_DATE;
        if (skills !== null) {
          if (typeof skills === 'string') {
            const skillArray = skills.split(',');
            skillArray.forEach(function (skill) {
              if (skill !== "NO_SKILL") {
                skillHtml += `<button class="skill_data">${skill}</button>`;
                skillsBackendData += `${skill},`;
                skillCount++;
              }
            });
          } else if (Array.isArray(skills)) {
            skills.forEach(function (skillData) {
              if (skillData.SKILL !== "NO_SKILL") {
                skillHtml += `<button class="skill_data">${skillData.SKILL}</button>`;
                skillsBackendData += `${skillData.SKILL},`;
                skillCount++;
              }
            });
          }
        }
      } else if (typeof skills === 'string') {
        const skillsArray = skills.split(","); // Convert the string into an array

        skillsArray.forEach(function (skillData) {
          if (skillData !== "NO_SKILL") {
            skillHtml += `<button class="skill_data">${skillData}</button>`;
            skillsBackendData += `${skillData},`;
            skillCount++;
          }
        });
      }
      let loc = sel_emp.COUNTRY;

      if (skillHtml.endsWith(",")) {
        skillHtml = skillHtml.slice(0, -1);
      }
      if (skillsBackendData.endsWith(",")) {
        skillsBackendData = skillsBackendData.slice(0, -1);
      }
      // Create a hoverable button with skill count and tooltip
      let skillsTooltip = skillsBackendData;
      let finalHtml = `
        <button class="skill_count" title="${skillsTooltip}">
          ${skillCount}
        </button>
        <div class="skills_container">${skillHtml}</div>
      `;
      if (sel_emp.EMPLOYEE_NAME == "NONE" && sel_emp.RECOMMENDED === "Z") {
        $("#res_recommend_selcted_name_" + id_count).append('Not Allocated');
      } else if (
        sel_emp.EMPLOYEE_NAME == "NONE" &&
        sel_emp.RECOMMENDED === "YES"
      ) {
        $("#res_recommend_selcted_name_" + id_count).append(
          sel_emp.EMPLOYEE_NAME
        );
      } else {
        $("#res_recommend_selcted_name_" + id_count).append(
          sel_emp.EMPLOYEE_NAME
        );
      }
      $("#avi_emp_desc_" + id_count).append(sel_emp.JOB_ROLE);
      $("#avi_emp_persona_" + id_count).append(sel_emp.SUPPLY_PERSONA === undefined ? sel_emp.SKILLS_PERSONA : sel_emp.SUPPLY_PERSONA);
      $("#avi_emp_loc_" + id_count).append(loc);
      $("#avi_emp_skill_" + id_count).append(skillCount > 0 ? finalHtml : "-");
      $("#avi_emp_skill_data_" + id_count).append(skillsBackendData);
      $("#avi_emp_id_" + id_count).append(selected_team_id);
      $("#avi_account_id_" + id_count).append(sel_emp.ACCOUNT_ID);
      $("#avi_emp_sow_id_" + id_count).append(sel_emp.SOW_ID);
      $("#avi_account_name_" + id_count).append(sel_emp.ACCOUNT_NAME);
      $("#avi_sow_name_" + id_count).append(sel_emp.SOW_NAME);
      $("#avi_available_from_" + id_count).append(sel_emp.AVAILABLE_FROM);
      $("#avi_available_to_" + id_count).append(sel_emp.AVAILABLE_TO);
      let value = $('#' + elementId).text()
      console.log('selected value - ', value)
      console.log('selected id 2 - ', selected_team_id)
      if (value == 'Not Allocated') {
        $(`#res_recommend_selcted_name_${id_count}`).addClass('not_allocated_res')
        $(`#current_start_date_${id_count}_input`).hide();
        $(`#current_end_date_${id_count}_input`).hide();
        $(`#bill_alloc_select_${id_count}`).hide();
        $(`#avi_emp_skill_${id_count}`).hide();
      } else {
        $(`#res_recommend_selcted_name_${id_count}`).removeClass('not_allocated_res')
        $(`#current_start_date_${id_count}_input`).show();
        $(`#current_end_date_${id_count}_input`).show();
        $(`#bill_alloc_select_${id_count}`).show();
        $(`#avi_emp_skill_${id_count}`).show();
      }

    });
  }
  if (selected_team_id == '-1') {
    console.log('Inside')
    $(`#current_start_date_${id_count}_input`).css("visibility", "hidden");
    $(`#current_end_date_${id_count}_input`).css("visibility", "hidden");
    $(`#bill_alloc_select_${id_count}`).css("visibility", "hidden");
    $(`#avi_emp_desc_${id_count}`).css("visibility", "hidden");
    $(`#avi_emp_persona_${id_count}`).css("visibility", "hidden");
    $(`#avi_emp_skill_${id_count}`).css("visibility", "hidden");
  } else {
    $(`#current_start_date_${id_count}_input`).css("visibility", "visible");
    $(`#current_end_date_${id_count}_input`).css("visibility", "visible");
    $(`#bill_alloc_select_${id_count}`).css("visibility", "visible");
    $(`#avi_emp_desc_${id_count}`).css("visibility", "visible");
    $(`#avi_emp_persona_${id_count}`).css("visibility", "visible");
    $(`#avi_emp_skill_${id_count}`).css("visibility", "visible");
  }
  let checkDuplicateNames = checkDuplicateNamesInResource();
  allocateTeam()
}

function deleteTeamDate(obj) {
  let deleteId = $(obj).attr("data-id");
  $(".current_team_" + deleteId).remove();
  allocateTeam()
}

const getResModalData = (resData, selectedusrId) => {
  let skill_count = true;
  $("#loading_div").show();
  $("#recommend_btn").attr("disabled", true);

  // Destroy the existing DataTable instance if it exists
  if ($.fn.DataTable.isDataTable("#recommended_table")) {
    $("#recommended_table").DataTable().destroy();
  }
  $("#recommend_team_data").empty();

  let recom_res_data = "";
  resData.map((obj) => {
    let skills = obj.SKILLS_LEVEL.split(",");
    let skillHtml = "";
    $.each(skills, function (j, skillData) {
      if (skillData != "") {
        skillHtml += `<button class="skill_data">${skillData}</button>`;
        skill_count = skillData === "-" ? true : false;
      }
    });

    let prevSOW = obj.PREVIOUS_SOW_NAME.split(",");
    let prevSowHtml = "";
    $.each(prevSOW, function (j, prevSowData) {
      if (prevSowData != "") {
        prevSowHtml += `<button class="skill_data">${prevSowData}</button>`;
      }
    });

    recom_res_data += `<tr>
                       <td><input type='radio' id='team_${obj.EMPLOYEE_ID
      }' value='${obj.EMPLOYEE_ID},${obj.AVAILABLE_FROM},${obj.AVAILABLE_TO
      }' onclick='getRecomSelTeamId()' name='recommend_team_selected'></td>
                       <td>${obj.EMPLOYEE_ID}</td>
                       <td class='${obj.FINAL_SCORE < 0
        ? "recommended_no"
        : obj.FINAL_SCORE > 0
          ? "recommended_yes"
          : ""
      }'>${obj.EMPLOYEE_NAME}</td>
                       <td>${obj.JOB_ROLE}</td>
                       <td class="${skill_count ? 'more_skill' : 'more'}">${skillHtml}</td>
                       <td>${obj.SUPPLY_PERSONA}</td>
                       <td class="more">
                       <div class="expandable-content">${prevSowHtml}</div></td>
                       <td>${obj.TOTAL_DEMAND}</td>
                       <td>${obj.FIT}</td>
                       <td>${obj.overlap}</td>
                       <td>${obj.SKILLS_LEVEL_SCORE}</td>
                       <td>${obj.PERSONA_SCORE}</td>
                       <td>${obj.FINAL_SCORE}</td>
                     </tr>`;
  });

  $("#recommend_team_data").append(recom_res_data);

  // Initialize the DataTable
  $("#recommended_table").DataTable({
    pageLength: 25,
    columnDefs: [
      {
        targets: 0,
        orderable: false,
      },
    ],
    // order: [[12, "desc"]],
  });

  $("#team_" + selectedusrId).prop("checked", true);
  $("#loading_div").hide();
  $("#recommend_btn").attr("disabled", false);
};


async function getRecommendationData(rec) {
  let apiURL = apiValue.url_ip + ":5005/recommendations";

  // Parse the incoming `rec` to extract the relevant fields
  let parsedRec = JSON.parse(rec);
  // Construct the `DEMAND_DATA` array
  let demandData = [{
    SOW_ID: parsedRec.SOW_ID,
    UNIQUE_ID: parsedRec.UNIQUE_ID,
    SOW_NAME: parsedRec.SOW_NAME,
    ACCOUNT_ID: parsedRec.ACCOUNT_ID,
    ACCOUNT_NAME: parsedRec.ACCOUNT_NAME,
    SOW_TYPE: parsedRec.SOW_TYPE,  // Add this field to your original data if necessary
    SOW_STATUS: parsedRec.SOW_STATUS,
    PROBABILITY: parsedRec.PROBABILITY,
    LEGAL_START_DATE: parsedRec.LEGAL_START_DATE,
    LEGAL_END_DATE: parsedRec.LEGAL_END_DATE,
    ACTUAL_START_DATE: parsedRec.ACTUAL_START_DATE,
    ACTUAL_END_DATE: parsedRec.ACTUAL_END_DATE,
    DEMAND_START_DATE: parsedRec.DEMAND_START_DATE,  // Add this field to your original data if necessary
    DEMAND_END_DATE: parsedRec.DEMAND_END_DATE,  // Add this field to your original data if necessary
    RESOURCE_GROUP: parsedRec.RESOURCE_GROUP,
    LOCATION: parsedRec.LOCATION,
    SKILLS_PERSONA: parsedRec.REQUIRED_PERSONA,  // Add this field to your original data if necessary
    SKILLS_DATA: parsedRec.REQUIRED_SKILLS,  // Add this field to your original data if necessary
    SUB_RES_GROUP: parsedRec.SUB_RES_GROUP,
    BILLING_MODE: parsedRec.BILLING_MODE
  }];

  // Construct the final form_details object
  let form_details = {
    environment: apiValue.environment,
    DEMAND_DATA: demandData,
    RECOMMENDATIONS_ONLY: "YES"
  };

  let response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(form_details)
  });

  const result = await response.json();
  return result;
}


async function getRecommendUserData(obj) {

  let data_id = $(obj).attr("data-id");
  let getJsonData = $(obj).attr("data-id1");
  let getAllResData = $(obj).attr("data-id2");
  $("#recommend_team_data").empty();
  $("#loading_div").show();
  $("#recommend_btn").attr("disabled", true);
  let recomData = [];
  let recomApiData = [];
  id = $(obj).attr("id");
  id_count = id.replace("res_recommend_data_", "");
  if (getJsonData == "[]" || getJsonData == "undefined" || getJsonData == null) {
    recomApiData = await getRecommendationData(getAllResData);
    if (recomApiData.length > 0) {
      recomApiData = recomApiData[0].RECOMMENDATIONS;
      recomData = recomApiData;
    }
    $("#" + id).attr("data-id1", JSON.stringify(recomApiData));
    getJsonData = $(obj).attr("data-id1");
  } else {
    recomData = JSON.parse(getJsonData);
  }


  let selectedusrId = $('#avi_emp_id_' + (id_count)).html()
  let radio_button = false;
  console.log('selectedusrId', selectedusrId)
  // let selectedusrId = "";
  for (let i = 0; i < recomData.length; i++) {
    if (recomData[i].RECOMMENDED === "YES") {
      selectedusrId = recomData[i].EMPLOYEE_ID;
      break; // Exit the loop once a matching object is found
    } else {
      if (selectedusrId != '-' || selectedusrId != "" || selectedusrId != ' ') {
        selectedusrId = selectedusrId;
      } else {
        selectedusrId = "-";
      }
    }
  }
  data_id = JSON.parse(data_id);
  getResModalData(recomData, selectedusrId);
  $("#loading_div").hide();
  $("#recommend_btn").attr("disabled", false);
  $("#recommend_btn").attr("data-id2", JSON.stringify(recomData));
  $("#recommend_btn").attr("data-id", id_count);
  $("recommend_btn").attr("data-id", data_id);
  let checkDuplicateNames = checkDuplicateNamesInResource();
  allocateTeam()
}

function autoSelectRecomUser(selected_team_id, id_count) {
  if (selected_team_id != undefined) {
    let emp_data = getAvailableEmpData.filter(
      (emp) => emp.EMPLOYEE_ID == selected_team_id
    );
    let recomndation_status = recommResModelUser.filter(
      (emp_data) => emp_data.EMPLOYEE_ID == selected_team_id
    );
    if (selected_team_id == "-") {
      let temp_recomndation_status = recommResModelUser.filter(
        (emp_data) => emp_data.RECOMMENDED == "YES"
      );
      if (temp_recomndation_status.length > 0) {
        emp_data = temp_recomndation_status;
        recomndation_status = temp_recomndation_status;
      }
    }
    let elementId = "res_recommend_selcted_name_" + id_count;
    let element = document.getElementById(elementId);

    if (recomndation_status[0].FINAL_SCORE > 0) {
      element.classList.add("recommended_yes");
    } else if (recomndation_status[0].FINAL_SCORE < 0) {
      element.classList.add("recommended_no");
    } else {
      element.classList.remove("recommended_no");
      element.classList.remove("recommended_yes");
    }
    $.each(emp_data, function (i, sel_emp) {
      let all_start_date = sel_emp.AVAILABLE_FROM;
      let all_end_date = sel_emp.AVAILABLE_TO;
      $("#res_recommend_selcted_name_" + id_count).empty();
      $("#avi_emp_desc_" + id_count).empty();
      $("#avi_emp_persona_" + id_count).empty();
      $("#avi_emp_skill_" + id_count).empty();
      $("#avi_emp_skill_data_" + id_count).empty();
      $("#avi_emp_loc_" + id_count).empty();
      $("#avi_emp_id_" + id_count).empty();
      $("#avi_account_id_" + id_count).empty();
      $("#avi_emp_sow_id_" + id_count).empty();
      $("#avi_account_name_" + id_count).empty();
      $("#avi_sow_name_" + id_count).empty();
      $("#avi_available_from_" + id_count).empty();
      $("#avi_available_to_" + id_count).empty();
      let demand_start_date = $(
        "#avi_res_demand_start_date_" + id_count
      ).text();
      let demand_end_date = $("#avi_res_demand_end_date_" + id_count).text();
      if (demand_start_date != "-") {
        if (new Date(all_start_date) >= new Date(demand_start_date)) {
          $("#current_start_date_" + id_count + "_input").val(
            convertNew(all_start_date)
          );
        } else {
          $("#current_start_date_" + id_count + "_input").val(
            demand_start_date
          );
        }
      } else {
        $("#current_start_date_" + id_count + "_input").val(
          convertNew(all_start_date)
        );
      }

      if (demand_end_date != "-") {
        if (new Date(all_end_date) >= new Date(demand_end_date)) {
          $("#current_end_date_" + id_count + "_input").val(
            convertNew(all_end_date)
          );
          $("#current_end_date_" + id_count + "_input").attr("data-id-2", convertNew(all_end_date));
        } else {
          $("#current_end_date_" + id_count + "_input").val(demand_end_date);
          $("#current_end_date_" + id_count + "_input").attr("data-id-2", convertNew(demand_end_date));
        }
      } else {
        $("#current_end_date_" + id_count + "_input").val(
          convertNew(all_end_date)
        );
        $("#current_end_date_" + id_count + "_input").attr("data-id-2", convertNew(all_end_date));
      }
      // let skills = sel_emp.SKILLS_LEVEL;
      // console.log("sel_emp",sel_emp);
      // let skillHtml = "",
      //   skillPersonaHtml = "",
      //   skillsBackendData = "";
      // $.each(skills, function (j, skillData) {
      //   if (skillData.SKILL != "NO_SKILL") {
      //     skillHtml += `<button class="skill_data">${skillData.SKILL}</button>`;
      //     skillsBackendData += `${skillData.SKILL},`;
      //   }
      // });
      let skills = sel_emp.SKILLS_LEVEL; // Assuming this is a string like "AWS-R1,Azure-R1,Excel-R1,Python-R1,Snowflake-R1,SQL-R1"
      let skillHtml = "",
        skillsBackendData = "";
      const skillsArray = skills.split(","); // Convert the string into an array

      $.each(skillsArray, function (j, skillData) {
        if (skillData !== "NO_SKILL") {
          skillHtml += `<button class="skill_data">${skillData}</button>`;
          skillsBackendData += `${skillData},`;
        }
      });
      // let loc = sel_emp.LOCATION;
      let loc = sel_emp.LOCATION;
      if (loc == undefined) {
        loc = sel_emp.COUNTRY;
      }
      if (skillHtml.endsWith(",")) {
        skillHtml = skillHtml.slice(0, -1);
      }
      if (skillsBackendData.endsWith(",")) {
        skillsBackendData = skillsBackendData.slice(0, -1);
      }
      $("#res_recommend_selcted_name_" + id_count).append(
        sel_emp.EMPLOYEE_NAME
      );
      $("#avi_emp_desc_" + id_count).append(sel_emp.JOB_ROLE);
      $("#avi_emp_persona_" + id_count).append(sel_emp.SUPPLY_PERSONA);
      $("#avi_emp_loc_" + id_count).append(loc);
      $("#avi_emp_skill_" + id_count).append(skillHtml == "" ? "-" : skillHtml);
      $("#avi_emp_skill_data_" + id_count).append(skillsBackendData);
      $("#avi_emp_id_" + id_count).append(sel_emp.EMPLOYEE_ID);
      $("#avi_account_id_" + id_count).append(sel_emp.ACCOUNT_ID);
      $("#avi_emp_sow_id_" + id_count).append(sel_emp.SOW_ID);
      $("#avi_account_name_" + id_count).append(sel_emp.ACCOUNT_NAME);
      $("#avi_sow_name_" + id_count).append(sel_emp.SOW_NAME);
      $("#avi_available_from_" + id_count).append(sel_emp.AVAILABLE_FROM);
      $("#avi_available_to_" + id_count).append(sel_emp.AVAILABLE_TO);
    });
  }
}

function checkDuplicateNamesInResource(moduleCheck) {
  let newAvailableResData = [];
  let sowId = $("#sowNameID").html();
  let sowName = $("#sowName").html();
  let accountName = $("#find_account_name").html();
  let accountId = $("#find_account_id").html();
  let sowStatus = $("#find_sow_status").html();
  let sowStartDate = $("#find_start_date").html();
  let sowEndDate = $("#find_end_date").html();
  let legalStartDate = $("#find_start_date_legal").html();
  let legalEndDate = $("#find_end_date_legal").html();
  let uniqued_id = $("#sow_unique_id").html();
  let duplicateWarnings = [];

  $("#resource_exist_table tbody tr").each(function () {
    let id = $(this).find(".current_emp_id").text();
    if (id === '-') {
      return; // Skip the row if EMPLOYEE_ID is '-'
    }

    let name = $(this).find(".current_emp_name").html() || $(this).find(".emp_name_option_selected option:selected").text();
    let startDate = $(this).find(".currentNewStartDate").val();
    let endDate = $(this).find(".currentNewEndDate").val();
    let oldStartDate = $(this).find(".current_emp_old_start_date").text() || convertDates($(this).find(".current_emp_ava_from_date").html());
    let oldEndDate = $(this).find(".current_emp_old_end_date").text() || convertDates($(this).find(".current_emp_ava_to_date").html());
    let desg = $(this).find(".current_emp_job_role").html();
    let resourcegroup = $(this).find(".current_emp_resource_group").html();
    let subresourcegrp = $(this).find(".current_emp_resource_sub_group").html();
    let uniqueid = $(this).find(".current_emp_unique_id").html();
    let billingStatus = $(this).find(".billing_select option:selected").val();
    let country = $(this).find(".current_demand_loc").html();

    let newStartDate = new Date(startDate);
    let newEndDate = new Date(endDate);

    for (let res of newAvailableResData) {
      if (res.EMPLOYEE_ID === id) {
        let existingStartDate = new Date(res.ALLOCATION_START_DATE);
        let existingEndDate = new Date(res.ALLOCATION_END_DATE);

        if (
          (newStartDate >= existingStartDate && newStartDate <= existingEndDate) ||
          (newEndDate >= existingStartDate && newEndDate <= existingEndDate) ||
          (newStartDate <= existingStartDate && newEndDate >= existingEndDate)
        ) {
          duplicateWarnings.push({
            name: name,
            designation: desg,
            overlapDates: `From ${convertNewDates(existingStartDate)} to ${convertNewDates(existingEndDate)}`
          });
          break;
        }
      }
    }

    newAvailableResData.push({
      ACCOUNT_ID: accountId,
      SOW_ID: sowId,
      ACCOUNT_NAME: accountName,
      SOW_NAME: sowName,
      EMPLOYEE_ID: id,
      EMPLOYEE_NAME: name,
      JOB_ROLE: desg,
      RES_UNIQUE_ID: uniqueid,
      UNIQUE_ID: uniqued_id,
      ALLOCATION_START_DATE: convertDates(startDate),
      ALLOCATION_END_DATE: convertDates(endDate),
      ACTUAL_START_DATE: convertDates(sowStartDate),
      ACTUAL_END_DATE: convertDates(sowEndDate),
      LEGAL_START_DATE: convertDates(legalStartDate),
      LEGAL_END_DATE: convertDates(legalEndDate),
      BILLING_STATUS: billingStatus,
      LOCATION: country,
      SOW_STATUS: sowStatus,
      COMMENT: "",
      OPERATION: determineOperation(new Date(oldEndDate), newEndDate, oldStartDate),
      RESOURCE_GROUP: resourcegroup,
      SUB_RES_GROUP: subresourcegrp,
    });
  });

  let data1 = JSON.stringify(newAvailableResData);

  if (duplicateWarnings.length > 0) {
    displayWarnings(duplicateWarnings, moduleCheck);
    $("#update_resource_data").prop('disabled', true);
    return false;
  }

  $("#update_resource_data").prop('disabled', false);
  return true;
}

function convertNewDates(dateStr) {
  if (!dateStr) return "";
  let date = new Date(dateStr);
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let day = ("0" + date.getDate()).slice(-2);
  let year = date.getFullYear().toString().slice(-2);
  return `${month}-${day}-${year}`;
}

function convertDates(dateStr) {
  if (!dateStr) return "";
  let date = new Date(dateStr);
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let day = ("0" + date.getDate()).slice(-2);
  let year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function determineOperation(oldEndDate, newEndDate, oldStartDate) {
  if (!oldStartDate) {
    return "New Allocation";
  }
  return oldEndDate > newEndDate ? "Release" : "Extension";
}

function displayWarnings(warnings, moduleCheck) {
  let warningHtml = warnings.map(warning => `
    <p><strong>Name:</strong> ${warning.name}</p>
    <p><strong>Designation:</strong> ${warning.designation}</p>
    <p><strong>Overlapping Dates:</strong> ${warning.overlapDates}</p>
    <hr>
  `).join("");

  $("#duplicateWarningModalBody").html(warningHtml);
  if (moduleCheck === "sow_end_date" || moduleCheck === "sow_start_date" || moduleCheck === 'billing_date') {
    $("#duplicateWarningModal").modal('hide');
  } else {
    $("#duplicateWarningModal").modal('show');
  }
}

// Partial Allocations Tooltip Functionality
let tooltipTimeout;
$(document).on("mouseenter", ".partial-alloc-info-icon", function (e) {
  e.stopPropagation();

  // Cancel any pending removal of the tooltip
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout);
  }

  // Remove any existing tooltips before creating a new one
  $(".partial-alloc-tooltip").remove();

  const $icon = $(this);
  const partialAllocations = JSON.parse($icon.attr("data-partial-allocations"));

  if (!partialAllocations || partialAllocations.length === 0) {
    return;
  }

  // Sort by FULFILLMENT_ORDER
  const sortedAllocations = [...partialAllocations].sort((a, b) => {
    return (a.FULFILLMENT_ORDER || 0) - (b.FULFILLMENT_ORDER || 0);
  });

  // Build tooltip HTML
  let tableRows = "";
  sortedAllocations.forEach((alloc, index) => {
    // Handle both field naming conventions (PARTIAL_ALLOCATIONS vs main array)
    const startDateVal =
      alloc.RES_ALLOC_START_DATE || alloc.ALLOCATION_START_DATE;
    const endDateVal = alloc.RES_ALLOC_END_DATE || alloc.ALLOCATION_END_DATE;
    const startDate = startDateVal ? convertNew(startDateVal) : "-";
    const endDate = endDateVal ? convertNew(endDateVal) : "-";
    const billingStatus = alloc.BILLING_STATUS || "-";
    const billingClass =
      billingStatus.toLowerCase() === "billed"
        ? "billed"
        : billingStatus.toLowerCase() === "investment"
          ? "investment"
          : "empty";

    tableRows += `
      <tr>
        <td class="fulfillment-order">${alloc.EMPLOYEE_ID || "-"}</td>
        <td class="employee-id">${alloc.EMPLOYEE_NAME || "-"}</td>
        <td class="date-cell">${startDate}</td>
        <td class="date-cell">${endDate}</td>
        <td class="billing-status ${billingClass}">${billingStatus}</td>
      </tr>
    `;
  });

  const tooltipHtml = `
    <div class="partial-alloc-tooltip">
      <div class="partial-alloc-tooltip-header">Allocations</div>
      <table class="partial-alloc-tooltip-table">
        <thead>
          <tr>
            <th class=''>ID</th>
            <th>Team Member</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Billing Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;

  $("body").append(tooltipHtml);
  $(".partial-alloc-tooltip").addClass("show");
});

$(document).on("mouseleave", ".partial-alloc-info-icon", function () {
  $(".partial-alloc-tooltip").removeClass("show");
  tooltipTimeout = setTimeout(() => {
    $(".partial-alloc-tooltip").remove();
  }, 200);
});

// Close tooltip when clicking outside
$(document).on("click", function (e) {
  if (
    !$(e.target).closest(".partial-alloc-info-icon").length &&
    !$(e.target).closest(".partial-alloc-tooltip").length
  ) {
    $(".partial-alloc-tooltip").remove();
  }
});

