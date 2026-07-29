let recommResModelUser = [];

let pageLevelAccess = "";
let eachLevel = "",
  editAccess = true,
  deleteAccess = false,
  allocationAllowed = false;
let funnelStageAllowedList = ["Signed", "Proposal", "Renewal"];
$(document).ready(function () {
  // console.log("Sow Team Allocation Page Loaded");
  // assignMetaValue();
  // $("meta[name='google-signin-client_id']").attr("content", metaValue);

  // getLocalSessionData();
  // const queryString = window.location.search.substring(1);
  // // console.log(queryString);
  // localStorage.setItem("allocation-url", queryString);
  // if (sessionName == null) {
  //   window.location.href = "index.html";
  //   return false;
  // } else {
  //   let accessStatus = checkDashboardPageAccessData()
  //   if (accessStatus) {
  //     let accessLevel = checkEachPageAccess("Allocation")
  //     if (accessLevel.length > 0) {
  //       let environment = accessLevel[0]
  //       if (environment == apiValue.environment) {
  //         pageLevelAccess = accessLevel[1]
  //         eachLevel = pageLevelAccess.split(',')
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
  // toastr.options.timeOut = 50000; // 2s
  // editAccess = hasEditOrDelete(eachLevel)
  $.each(eachLevel, function (l, level) {
    switch (level) {
      case "delete":
        $(".allocation-resource-data").find("th:last, td:last").show();
        $(".available_resource ").show();
        $(".btn-info-allocation").show();
        break;
      case "edit":
        $(".allocation-resource-data").find("th:last, td:last").show();
        $(".available_resource ").show();
        $(".btn-info-allocation").show();
        break;
      case "view":
        $(".allocation-resource-data").find("th:last, td:last").hide();
        $(".btn-info-allocation").hide();
        $(".available_resource ").hide();
        break;
    }
  });
  console.log("execute");
  $("#update_resource_data").attr("disabled", true);

  //       } else {
  //         window.location.href = "home.html"
  //       }
  //     }
  //   } else {
  //     window.location.href = "home.html"
  //   }
  // }

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
    const startDate = startDateVal ? convert(startDateVal) : "-";
    const endDate = endDateVal ? convert(endDateVal) : "-";
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

function hasEditOrDelete(levels) {
  return levels.includes("edit") || levels.includes("delete");
}

function checkAccessAllocation() {
  $.each(eachLevel, function (l, level) {
    switch (level) {
      case "delete":
        $(".allocation-resource-data").find("th:last, td:last").show();
        $(".available_resource ").show();
        $(".btn-info-allocation").show();
        $(".resourceDate").prop("disabled", false);
        $(".billing_select").prop("disabled", false);
        break;
      case "edit":
        $(".allocation-resource-data").find("th:last, td:last").show();
        $(".available_resource ").show();
        $(".btn-info-allocation").show();
        $(".resourceDate").prop("disabled", false);
        $(".billing_select").prop("disabled", false);
        break;
      case "view":
        $(".allocation-resource-data").find("th:last, td:last").hide();
        $(".btn-info-allocation").hide();
        $(".available_resource ").hide();
        $(".resourceDate").prop("disabled", true);
        $(".billing_select").prop("disabled", true);
        break;
    }
  });
}
function resize() {
  if ($(window).width() < 514) {
    $("#resp-table").addClass("table-responsive");
  } else {
    $("#resp-table").removeClass("table-responsive");
  }
}

let findResData = [],
  findResDatas = [],
  business_rule = [],
  getSowId = "",
  uniqueid = "",
  currDate = "",
  legalsrtdate = "",
  legal_end_date = "",
  uniqueID = "",
  allocation_sel_data = [];
((resource_exist_table = []),
  (BillingData = []),
  (resource_Alloc_rule_data = []));
let all_bench_emp_list = [],
  all_bench_datas = [],
  resJsonData = [],
  getAvailableEmpData = [],
  sowStartDate,
  sowEndDate,
  indShortage,
  usShortage;
let sow_id = "";
let userJobRole = localStorage.getItem("Job_Role");
let getUserRoleGroup = localStorage.getItem("user-role");
let billingOptions = `<option value="Billed">Billed</option>`;
if (
  userJobRole == "Vice President" ||
  userJobRole == "CEO" ||
  getUserRoleGroup == "admin"
) {
  billingOptions += `<option value="Investment">Investment</option>`;
}
const getFindResourceData = async (
  deliveryMembers,
  growthMembers,
  sowActiveStatus,
) => {
  console.log("deliveryMembers alloctation - ", deliveryMembers);
  console.log("growthMembers alloctation - ", growthMembers);
  let getUserEmail = localStorage.getItem("email");
  let getUserId = localStorage.getItem("EmpUserID");
  let getUserRole = localStorage.getItem("user-role");
  // const isUserInDelivery = deliveryMembers.some(member => member.EMPLOYEE_ID === getUserId);
  const isUserInDelivery =
    Array.isArray(deliveryMembers) &&
    deliveryMembers.some((member) => member.EMPLOYEE_ID === getUserId);
  const isUserInGrowth =
    Array.isArray(growthMembers) &&
    growthMembers.some((member) => member.EMPLOYEE_ID === getUserId);
  // const isUserInGrowth = growthMembers.some(member => member.EMPLOYEE_ID === getUserId);
  console.log("User in Delivery Team:", isUserInDelivery); // true or false
  console.log("User in Growth Team:", isUserInGrowth); // true or false
  if (
    isUserInDelivery ||
    getUserRole == "admin" ||
    getUserEmail == "akhilesh@factspan.com"
  ) {
    editAccess = true;
  } else {
    editAccess = false;
  }
  if (sowActiveStatus == "NO") {
    editAccess = false;
  }
  console.log("editAccess - ", editAccess);
  $("#resource_allocation").hide();
  $("#loading_div_resource").show();
  $(".sow_date").hide();

  // Initially hide the 'Current Resources' legend
  $(".allocation-indication").hide();

  currDate = localStorage.getItem("Current_Date");
  // getSowId = localStorage.getItem("sow_id");
  legalsrtdate = localStorage.getItem("legal_start");
  legal_end_date = localStorage.getItem("legal_end");
  // uniqueID = localStorage.getItem("UNIQUE_ID");
  // allocation_sel_data = localStorage.getItem("Allocation_sel_data")
  // let allocationUrlData = localStorage.getItem("urlStoredSOWUrldata");
  // console.log("allocationUrlData - ", allocationUrlData);
  const paramsString = window.location.search.substring(1); // removes the '?'
  const paramsArray = paramsString.split("&");
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
    payload: JSON.parse("{}"),
  };
  let data = await fetch(apiURL, {
    method: "POST",
    body: JSON.stringify(form_details),
  });
  const result = await data.json();
  const endTime = performance.now();
  const loadTimeInSeconds = (endTime - startTime) / 1000;
  // getApiTime(loadTimeInSeconds, "SowTeamAllocation", "Allocation", "allocation_page", "success", fileName, "Sow_Team_Allocation", "view");
  if (!result || !Array.isArray(result) || result.length === 0) {
    console.error(
      "Invalid API response: expected array with data, got",
      result,
    );
    $("#loading_div_resource").hide();
    $(".create-btn").hide();
    $("#update_resource_data").hide();
    $("#sow_edit").show();

    return;
  }
  overallData = result[0];
  findResData = result[0];
  // overallData = defaultAllocationData[0]
  // findResData = defaultAllocationData[0]
  console.log("findResData", findResData);
  if (!findResData || typeof findResData !== "object") {
    console.error("findResData is undefined or not an object:", findResData);
    $("#loading_div_resource").hide();
    $(".create-btn").hide();
    $("#update_resource_data").hide();
    $("#sow_edit").show();
    return;
  }
  sow_id = findResData.SOW_ID;
  resource_exist_table = findResData.DEMAND_ALLOCATED_DATA;
  let benchStatusApi = false;
  let bench_data_check = findResData.BENCH_DATA;
  if (bench_data_check === undefined) {
    benchStatusApi = true;
  } else if (
    typeof bench_data_check === "object" &&
    Array.isArray(bench_data_check.CURRENT_BENCH_DATA)
  ) {
    all_bench_datas = bench_data_check;
    let allBenchEmpData = [
      ...all_bench_datas.FUTURE_BENCH_DATA,
      ...all_bench_datas.CURRENT_BENCH_DATA,
    ];
    all_bench_emp_list = allBenchEmpData;
  } else {
    benchStatusApi = true;
  }

  sowStartDate = new Date(findResData.ACTUAL_START_DATE);
  sowEndDate = new Date(findResData.ACTUAL_END_DATE);
  let legalstartdate = findResData.LEGAL_START_DATE;
  let legalenddate = findResData.LEGAL_END_DATE;
  usShortage = findResData.US_SHORTAGE;
  indShortage = findResData.INDIA_SHORTAGE;
  // let newurl =
  //   window.location.protocol +
  //   "//" +
  //   window.location.host +
  //   window.location.pathname +
  //   "?" +
  //   findResData.UNIQUE_ID +
  //   "&" +
  //   findResData.SOW_ID;

  // window.history.pushState({ path: newurl }, "", newurl);
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
  if (sowActiveStatus == "NO") {
    $('.currentNewStartDate').hide();
    $('.currentNewEndDate').hide();
    $('#update_resource_data').hide();
  }
};

function convert(str) {
  if (str == null) {
    return "";
  } else if (str == "0000-00-00") {
    return "";
  } else {
    str = str.replace(" 00:00:00", "");
    let tempStr = str + "T00:00:00";
    var date = new Date(tempStr),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
  }
}

function isEmptyAllocationDate(value) {
  return (
    value == null ||
    value === "" ||
    value === "-" ||
    value === "NaT" ||
    value === "0000-00-00" ||
    value === "0000-00-00 00:00:00"
  );
}

function parseAllocationDate(value) {
  if (value instanceof Date) {
    return isNaN(value) ? null : new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (isEmptyAllocationDate(value)) return null;

  let normalized = String(value).trim();
  if (normalized.includes("T")) normalized = normalized.split("T")[0];
  if (normalized.includes(" ")) normalized = normalized.split(" ")[0];

  let parts = normalized.split(/[-/]/);
  if (parts.length === 3) {
    let first = parseInt(parts[0], 10);
    let second = parseInt(parts[1], 10);
    let third = parseInt(parts[2], 10);
    if (parts[0].length === 4) {
      return new Date(first, second - 1, third);
    }
    if (third < 100) third += 2000;
    return new Date(third, first - 1, second);
  }

  let parsed = new Date(normalized);
  return isNaN(parsed) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getRowDemandDates($row, dataId) {
  let demandStart =
    $row.find(".current_demand_actual_start").text() ||
    $("#current_demand_start_" + dataId).text() ||
    $("#avi_res_demand_start_date_" + dataId).text();
  let demandEnd =
    $row.find(".current_demand_actual_end").text() ||
    $("#current_demand_end_" + dataId).text() ||
    $("#avi_res_demand_end_date_" + dataId).text();

  return {
    start: parseAllocationDate(demandStart),
    end: parseAllocationDate(demandEnd),
    startText: demandStart,
    endText: demandEnd,
  };
}

function isContractorOrNoticeResource(resourceData) {
  if (!resourceData) return false;
  let checkValue = [
    resourceData.EMPLOYEE_TYPE,
    resourceData.EMPLOYMENT_TYPE,
    resourceData.RESOURCE_TYPE,
    resourceData.WORKER_TYPE,
    resourceData.EMPLOYEE_STATUS,
    resourceData.EMP_STATUS,
    resourceData.NOTICE_PERIOD,
    resourceData.IS_NOTICE_PERIOD,
    resourceData.NOTICE_PERIOD_STATUS,
    resourceData.CONTRACTOR_FLAG,
    resourceData.IS_CONTRACTOR,
  ]
    .filter((value) => value != null)
    .join(" ")
    .toLowerCase();

  return checkValue.includes("contract") || checkValue.includes("notice");
}

function getResourceEndDate(resourceData) {
  if (!resourceData) return null;
  let endDates = [
    resourceData.CONTRACT_END_DATE ||
      null,
    resourceData.EMPLOYEE_END_DATE,
    resourceData.AVAILABLE_TO_ORIGINAL,
    resourceData.AVAILABLE_TO,
  ]
    .map((dateValue) => parseAllocationDate(dateValue))
    .filter((dateValue) => dateValue);

  if (endDates.length === 0) return null;
  return new Date(Math.min(...endDates));
}

function getDefaultAllocationEndDate(resourceData, demandEndDate) {
  let resourceEndDate = getResourceEndDate(resourceData);
  if (resourceEndDate && demandEndDate && resourceEndDate < demandEndDate) {
    return resourceEndDate;
  }
  if (
    isContractorOrNoticeResource(resourceData) &&
    resourceEndDate &&
    demandEndDate &&
    resourceEndDate < demandEndDate
  ) {
    return resourceEndDate;
  }
  return demandEndDate || resourceEndDate;
}

function formatAllocationDate(date) {
  if (!date) return "";
  return formatToMMDDYY(date);
}

function getInputResourceData($input) {
  let resourceData = {};
  let jsonData = $input.attr("data-id2");
  if (jsonData) {
    try {
      resourceData = JSON.parse(jsonData);
    } catch (e) {
      console.error("Error parsing allocation row data:", e);
    }
  }
  return resourceData;
}

function getSelectedResourceData(idCount, selectedEmp) {
  let rowData = getInputResourceData($("#current_start_date_" + idCount + "_input"));
  if (!selectedEmp) return rowData;

  let resourceData = { ...rowData, ...selectedEmp };
  [
    "CONTRACT_END_DATE",
    "EMPLOYEE_END_DATE",
    "AVAILABLE_TO_ORIGINAL",
    "AVAILABLE_TO",
  ].forEach((fieldName) => {
    if (!Object.prototype.hasOwnProperty.call(selectedEmp, fieldName)) {
      delete resourceData[fieldName];
    }
  });
  return resourceData;
}

function canUseAllocationShiftDays() {
  let userRole = (localStorage.getItem("user-role") || "").trim().toLowerCase();
  let jobRole = (localStorage.getItem("Job_Role") || "").trim().toLowerCase();
  let designation = (localStorage.getItem("Designation") || "").trim().toLowerCase();
  let userDesignation = (localStorage.getItem("User_Designation") || "").trim().toLowerCase();
  let vpRoles = ["vp", "vice president"];

  return (
    userRole === "admin" ||
    vpRoles.includes(jobRole) ||
    vpRoles.includes(designation) ||
    vpRoles.includes(userDesignation)
  );
}

function getShiftDaysValue() {
  let shiftDays = Number(findResData.SHIFT_BY_DAYS);
  return Number.isFinite(shiftDays) && shiftDays > 0 ? shiftDays : 0;
}

function addDaysToDate(dateValue, days) {
  if (!dateValue) return null;
  let date = new Date(dateValue.getTime());
  date.setDate(date.getDate() + days);
  return date;
}

function getTodayDateOnly() {
  let today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function getLaterDate(dateA, dateB) {
  if (!dateA) return dateB || null;
  if (!dateB) return dateA || null;
  return dateA > dateB ? dateA : dateB;
}

function isSameAllocationDate(dateA, dateB) {
  return !!(dateA && dateB && dateA.getTime() === dateB.getTime());
}

function isAllocationSameAsDemandPeriod(allocationStart, allocationEnd, demandStart, demandEnd) {
  return !!(
    isSameAllocationDate(allocationStart, demandStart) &&
    isSameAllocationDate(allocationEnd, demandEnd)
  );
}

function getAllocationStartFromRecord(allocation) {
  return (
    allocation.RES_ALLOC_START_DATE ||
    allocation.ALLOCATION_START_DATE ||
    allocation.ALLOCATION_START_DATE_NEW
  );
}

function getAllocationEndFromRecord(allocation) {
  return (
    allocation.RES_ALLOC_END_DATE ||
    allocation.ALLOCATION_END_DATE ||
    allocation.ALLOCATION_END_DATE_NEW
  );
}

function getPartialAllocationRanges(resourceData) {
  let ranges = [];
  let partialAllocations = Array.isArray(resourceData && resourceData.PARTIAL_ALLOCATIONS)
    ? resourceData.PARTIAL_ALLOCATIONS
    : [];

  partialAllocations.forEach((allocation) => {
    let start = parseAllocationDate(getAllocationStartFromRecord(allocation));
    let end = parseAllocationDate(getAllocationEndFromRecord(allocation));
    if (start && end) {
      ranges.push({ start, end });
    }
  });

  if (ranges.length === 0 && resourceData) {
    let start = parseAllocationDate(
      resourceData.ALLOCATION_START_DATE || resourceData.RES_ALLOC_START_DATE,
    );
    let end = parseAllocationDate(
      resourceData.ALLOCATION_END_DATE || resourceData.RES_ALLOC_END_DATE,
    );
    if (start && end) {
      ranges.push({ start, end });
    }
  }

  return ranges;
}

function getLivePartialAllocationRanges($row, resourceData) {
  if (!$row || $row.length === 0) {
    return getPartialAllocationRanges(resourceData);
  }

  let currentEmployeeId = ($row.find(".current_emp_id").text() || "").trim();
  let currentUniqueId = ($row.find(".current_emp_unique_id").text() || "").trim();
  let currentStart = parseAllocationDate($row.find(".currentNewStartDate").val());
  let currentEnd = parseAllocationDate($row.find(".currentNewEndDate").val());
  let partialAllocations = Array.isArray(resourceData && resourceData.PARTIAL_ALLOCATIONS)
    ? resourceData.PARTIAL_ALLOCATIONS
    : [];
  let ranges = [];
  let currentRangeApplied = false;

  partialAllocations.forEach((allocation) => {
    let allocationEmployeeId = String(allocation.EMPLOYEE_ID || "").trim();
    let allocationUniqueId = String(allocation.RES_UNIQUE_ID || "").trim();
    let isCurrentAllocation = !!(
      (currentEmployeeId && allocationEmployeeId === currentEmployeeId) ||
      (currentUniqueId && allocationUniqueId === currentUniqueId)
    );
    let start = parseAllocationDate(getAllocationStartFromRecord(allocation));
    let end = parseAllocationDate(getAllocationEndFromRecord(allocation));

    if (isCurrentAllocation && currentStart && currentEnd) {
      start = currentStart;
      end = currentEnd;
      currentRangeApplied = true;
    }

    if (start && end) {
      ranges.push({ start, end });
    }
  });

  if (!currentRangeApplied && currentStart && currentEnd) {
    ranges.push({ start: currentStart, end: currentEnd });
  }

  return ranges.length > 0 ? ranges : getPartialAllocationRanges(resourceData);
}

function doRangesCoverDemand(ranges, demandStart, demandEnd) {
  if (!demandStart || !demandEnd || !ranges || ranges.length === 0) return false;

  let sortedRanges = ranges
    .filter((range) => range.start && range.end)
    .sort((a, b) => a.start - b.start);
  if (sortedRanges.length === 0) return false;

  let coveredThrough = null;
  for (let i = 0; i < sortedRanges.length; i++) {
    let range = sortedRanges[i];
    if (range.end < demandStart || range.start > demandEnd) continue;

    let rangeStart = range.start < demandStart ? demandStart : range.start;
    let rangeEnd = range.end > demandEnd ? demandEnd : range.end;

    if (!coveredThrough) {
      if (rangeStart > demandStart) return false;
      coveredThrough = rangeEnd;
    } else {
      let nextAllowedStart = addDaysToDate(coveredThrough, 1);
      if (rangeStart > nextAllowedStart) return false;
      if (rangeEnd > coveredThrough) coveredThrough = rangeEnd;
    }

    if (coveredThrough >= demandEnd) return true;
  }

  return false;
}

function isDemandCoveredByPartialAllocations(resourceData, demandStart, demandEnd) {
  return doRangesCoverDemand(
    getPartialAllocationRanges(resourceData),
    demandStart,
    demandEnd,
  );
}

function isDemandCoveredByLiveAllocations($row, resourceData, demandStart, demandEnd) {
  return doRangesCoverDemand(
    getLivePartialAllocationRanges($row, resourceData),
    demandStart,
    demandEnd,
  );
}

function getPartialAllocationWarningFlags(ranges, demandDates, allocationStartDate, allocationEndDate) {
  let hasFullPartialCoverage = doRangesCoverDemand(
    ranges,
    demandDates.start,
    demandDates.end,
  );
  let startShortageEnd = allocationStartDate
    ? addDaysToDate(allocationStartDate, -1)
    : null;
  let endShortageStart = allocationEndDate
    ? addDaysToDate(allocationEndDate, 1)
    : null;
  let hasStartPeriodCoverage = !!(
    demandDates.start &&
    startShortageEnd &&
    doRangesCoverDemand(ranges, demandDates.start, startShortageEnd)
  );
  let hasEndPeriodCoverage = !!(
    endShortageStart &&
    demandDates.end &&
    doRangesCoverDemand(ranges, endShortageStart, demandDates.end)
  );

  return {
    start: !!(
      !hasFullPartialCoverage &&
      demandDates.start &&
      allocationStartDate &&
      allocationStartDate > demandDates.start &&
      !hasStartPeriodCoverage
    ),
    end: !!(
      !hasFullPartialCoverage &&
      demandDates.end &&
      allocationEndDate &&
      allocationEndDate < demandDates.end &&
      !hasEndPeriodCoverage
    ),
  };
}

function setAllocationEndDateWarning(idCount, hasWarning) {
  let selector =
    "#current_end_date_" +
    idCount +
    "_input, #current_end_date_" +
    idCount +
    ", #current_emp_end_date_" +
    idCount;
  let $elements = $(selector);
  $elements.toggleClass("partial_allocation_warning", hasWarning);
  if (hasWarning) {
    $elements.removeClass("text_warining");
  }
}

function setAllocationStartDateWarning(idCount, hasWarning) {
  let selector =
    "#current_start_date_" +
    idCount +
    "_input, #current_start_date_" +
    idCount +
    ", #current_emp_start_date_" +
    idCount;
  let $elements = $(selector);
  $elements.toggleClass("partial_allocation_warning", hasWarning);
  if (hasWarning) {
    $elements.removeClass("text_warining");
  }
}

function updatePartialAllocationWarning(idCount, showToast, changedField) {
  let $startInput = $("#current_start_date_" + idCount + "_input");
  let $endInput = $("#current_end_date_" + idCount + "_input");
  if ($startInput.length === 0 && $endInput.length === 0) return false;

  let $row = ($startInput.length ? $startInput : $endInput).closest("tr");
  let demandDates = getRowDemandDates($row, idCount);
  let resourceData = getInputResourceData($startInput.length ? $startInput : $endInput);
  let liveRanges = getLivePartialAllocationRanges($row, resourceData);
  let allocationStartDate = parseAllocationDate($startInput.val());
  let allocationEndDate = parseAllocationDate($endInput.val());
  let warningFlags = getPartialAllocationWarningFlags(
    liveRanges,
    demandDates,
    allocationStartDate,
    allocationEndDate,
  );
  let isPartialStart = warningFlags.start;
  let isPartialEnd = warningFlags.end;
  let isPartial = isPartialStart || isPartialEnd;

  setAllocationStartDateWarning(idCount, isPartialStart);
  setAllocationEndDateWarning(idCount, isPartialEnd);
  let shouldShowWarning =
    showToast &&
    ((changedField === "start" && isPartialStart) ||
      (changedField === "end" && isPartialEnd) ||
      (!changedField && isPartial));

  if (shouldShowWarning) {
    toastr.options.timeOut = 3000;
    toastr.warning("Allocate resource for full demand period");
  }
  return isPartial;
}

function applyDefaultAllocationDates(idCount, selectedEmp) {
  let $startInput = $("#current_start_date_" + idCount + "_input");
  let $endInput = $("#current_end_date_" + idCount + "_input");
  let demandDates = getRowDemandDates($startInput.closest("tr"), idCount);
  let resourceData = getSelectedResourceData(idCount, selectedEmp);
  let defaultEndDate = getDefaultAllocationEndDate(resourceData, demandDates.end);
  let resourceEndDate = getResourceEndDate(resourceData);

  if (defaultEndDate) {
    let formattedEndDate = formatAllocationDate(defaultEndDate);
    $endInput.val(formattedEndDate);
    $endInput.attr("data-id-2", formattedEndDate);
  }
  $endInput.attr("data-id-4", resourceEndDate ? formatAllocationDate(resourceEndDate) : "");
  updatePartialAllocationWarning(idCount, true);
}

let currentTeamDataJson;

const sortAllocationsByEndDateDesc = (allocations) => {
  // Create a shallow copy of the array using the spread operator (...)
  // This prevents the original array from being modified (a best practice).
  const dataToSort = [...allocations];

  // Use the built-in Array.sort() method with a custom comparison function.
  dataToSort.sort((a, b) => {
    // Convert the date strings to JavaScript Date objects for accurate comparison.
    const dateA = new Date(a.ALLOCATION_END_DATE);
    const dateB = new Date(b.ALLOCATION_END_DATE);

    // To sort in DESCENDING order (latest date first),
    // subtract dateA from dateB.
    // If the result is > 0, the sort algorithm will place 'b' before 'a'.
    return dateB - dateA;
  });

  return dataToSort;
};

function toggleCurrentResourcesLegend() {
  // Check if any row has the 'allocation-expired' class (indicating currently active resources)
  const hasActiveResources =
    $("#resource_exist_table tbody tr.allocation-expired").length > 0;

  // Show or hide the legend based on active resources
  if (hasActiveResources) {
    $(".allocation-indication").show();
  } else {
    $(".allocation-indication").hide();
  }
}

function assignDataToAccount(resJsonData) {
  console.log("resJsonData - ", resJsonData);
  let demand_allocated_date = sortAllocationsByEndDateDesc(
    findResData.DEMAND_ALLOCATED_DATA,
  );
  console.log("demand_allocated_date - ", demand_allocated_date);

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
        let skills = resExitTable.SKILLS_LEVEL
          ? resExitTable.SKILLS_LEVEL.split(",")
          : [];
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
        let selectedData = {
          location: resExitTable.LOCATION,
          account_id: resExitTable.ACCOUNT_ID,
          sow_id: resExitTable.SOW_ID,
          account_name: resExitTable.ACCOUNT_NAME,
          sow_name: resExitTable.SOW_NAME,
          resource_group: resExitTable.RESOURCE_GROUP,
          sub_resource_group: resExitTable.SUB_RESOURCE_GROUP,
          start_date: resExitTable.DEMAND_START_DATE,
          end_date: resExitTable.DEMAND_END_DATE,
          actual_start_date: convertDates($("#actual_start_date").text()),
          actual_end_date: convertDates($("#actual_end_date").text()),
          persona: resExitTable.SUPPLY_PERSONA,
        };
        let startDateCheck = false,
          endDateCheck = false;
        let allocationEndDate = new Date(
          resExitTable.ALLOCATION_END_DATE.replace(" ", "T"),
        ); // Convert to ISO format
        let allocationStartDate = new Date(
          resExitTable.ALLOCATION_START_DATE.replace(" ", "T"),
        );
        let demandStartDate = new Date(
          resExitTable.DEMAND_START_DATE.replace(" ", "T"),
        );
        let demandEndDate = new Date(
          resExitTable.DEMAND_END_DATE.replace(" ", "T"),
        );
        let legalStartDate = new Date(
          resExitTable.LEGAL_START_DATE.replace(" ", "T"),
        );
        let legalEndDate = new Date(
          resExitTable.LEGAL_END_DATE.replace(" ", "T"),
        );
        console.log("demandStartDate - ", demandStartDate);
        if (demandStartDate == "Invalid Date") {
          demandStartDate = legalStartDate;
        }
        if (demandEndDate == "Invalid Date") {
          demandEndDate = legalEndDate;
        }
        let hasFullPartialCoverage = isDemandCoveredByPartialAllocations(
          resExitTable,
          demandStartDate,
          demandEndDate,
        );
        let partialWarningFlags = getPartialAllocationWarningFlags(
          getPartialAllocationRanges(resExitTable),
          { start: demandStartDate, end: demandEndDate },
          allocationStartDate,
          allocationEndDate,
        );
        if (
          !partialWarningFlags.start &&
          (hasFullPartialCoverage ||
            allocationStartDate.getTime() === demandStartDate.getTime() ||
            allocationStartDate > demandStartDate)
        ) {
          startDateCheck = true;
        }
        if (
          partialWarningFlags.end ||
          (!hasFullPartialCoverage &&
          (allocationEndDate > demandEndDate || allocationEndDate < demandEndDate)
          )
        ) {
          endDateCheck = true;
        }
        let startDateWarningClass = partialWarningFlags.start
          ? "partial_allocation_warning"
          : "";
        let endDateWarningClass = partialWarningFlags.end
          ? "partial_allocation_warning"
          : "";
        let today = new Date();
        // Reset today's time to 00:00:00 for accurate date-only comparison
        today.setHours(0, 0, 0, 0);
        let isFutureOrToday = false;
        if (allocationStartDate <= today && today <= allocationEndDate) {
          isFutureOrToday = true;
        }
        console.log("SHIFT_BY_DAYS - ", findResData.SHIFT_BY_DAYS);
        console.log(isFutureOrToday); // true or false
        resourceExistHtml = `<tr class="current_team_${i + 1} allocation-resource-data ${isFutureOrToday ? "allocation-expired" : ""}">
      <td class="current_demand_loc">${resExitTable.LOCATION}</td>
      <td class="current_demand_persona">
        ${resExitTable.REQUIRED_PERSONA}
        ${(() => {
            let allocationsToShow = [];
            if (
              resExitTable.PARTIAL_ALLOCATIONS &&
              resExitTable.PARTIAL_ALLOCATIONS.length > 0
            ) {
              allocationsToShow = resExitTable.PARTIAL_ALLOCATIONS;
            } else if (
              resExitTable.EMPLOYEE_ID &&
              resExitTable.EMPLOYEE_ID != ""
            ) {
              // Take from main array if EMPLOYEE_ID is not empty
              allocationsToShow = [
                {
                  EMPLOYEE_ID: resExitTable.EMPLOYEE_ID,
                  EMPLOYEE_NAME: resExitTable.EMPLOYEE_NAME,
                  RES_ALLOC_START_DATE: resExitTable.ALLOCATION_START_DATE,
                  RES_ALLOC_END_DATE: resExitTable.ALLOCATION_END_DATE,
                  BILLING_STATUS: resExitTable.BILLING_STATUS,
                },
              ];
            }

            return allocationsToShow.length > 0
              ? `
            <span class="partial-alloc-info-icon" 
                  data-partial-allocations='${JSON.stringify(allocationsToShow)}'>
              <i class="fa fa-info-circle" aria-hidden="true"></i>
            </span>
          `
              : "";
          })()}
      </td>
      <td id="current_demand_start_${i + 1}" class="current_demand_actual_start">${convert(resExitTable.DEMAND_START_DATE) == "aN-aN-N"
            ? "-"
            : convert(resExitTable.DEMAND_START_DATE)
          }</td>
      <td id="current_demand_end_${i + 1}" class="current_demand_actual_end">${convert(resExitTable.DEMAND_END_DATE) == "aN-aN-N"
            ? "-"
            : convert(resExitTable.DEMAND_END_DATE)
          }</td>
      <td class="current_emp_account_id" style="display:none">${resExitTable.ACCOUNT_ID}</td>
      <td class="current_emp_sow_id" style="display:none">${resExitTable.SOW_ID}</td>
      <td class="current_emp_account_name"  style="display:none">${resExitTable.ACCOUNT_NAME}</td>
      <td class="current_emp_sow_name" style="display:none">${resExitTable.SOW_NAME}</td>
      <td id="current_emp_id_${i + 1}" class="current_emp_id" style="display:none">${resExitTable.EMPLOYEE_ID
          }</td>
      <td id="current_emp_resource_group_${i + 1}" class="current_emp_resource_group" style="display:none">${resExitTable.RESOURCE_GROUP
          }</td>
      <td id="current_emp_resource_sub_group_${i + 1}" class="current_emp_resource_sub_group" style="display:none">${resExitTable.SUB_RES_GROUP
          }</td>
      <td id="current_emp_unique_id_${i + 1}" class="current_emp_unique_id" style="display:none">${resExitTable.RES_UNIQUE_ID
          }</td>
      <td class="current_emp_name_new">
          <span id='res_recommend_selcted_name_${i + 1}' class="current_emp_name className_recommend">${resExitTable.EMPLOYEE_NAME}</span> 
          <button type="button" class="btn btn-info-allocation header-button show-bu-head-data" 
            id="res_recommend_data_${i + 1}" title="Recommended Resource"
            data-toggle="modal" data-target="#recommTeam" 
            data-id='${JSON.stringify(selectedData)}'
            data-id2='${JSON.stringify(resExitTable)}'
            onclick="getRecommendUserData(this, 'existing')" style='display:none'>
              <i class="fa fa-magic" aria-hidden="true"></i>
          </button>
      </td>
      <td id="current_emp_job_role_${i + 1}" class="current_emp_job_role">${resExitTable.JOB_ROLE}</td>
      <td id="current_emp_supply_persona_${i + 1}" class="current_emp_supply_persona">${resExitTable.SUPPLY_PERSONA}
        </td>
      <td id="current_emp_skills_${i + 1}" class="current_emp_skills" style="display:none">${resExitTable.SKILLS_LEVEL
          }</td>
      <td id="current_emp_skill_count_${i + 1}">${skillCount > 0 ? finalHtml : "-"}</td>
      <td id="current_emp_start_date_${i + 1}" class="current_emp_start_date ${startDateWarningClass}">
      <span id="current_start_date_${i + 1}" class="currentStartDateText">${resExitTable.ALLOCATION_START_DATE == ""
            ? "-"
            : convert(resExitTable.ALLOCATION_START_DATE)
          }</span>
        <input type="text" class="form-control placeicon dateData resourceDate currentNewStartDate ${startDateWarningClass}"
            id="current_start_date_${i + 1}_input"
            data-id = "${i + 1}" 
            data-id2='${JSON.stringify(resExitTable)}'
            data-id-3 = "${resExitTable.EMPLOYEE_END_DATE == "NaT"
            ? ""
            : convert(resExitTable.EMPLOYEE_END_DATE)
          }"
            placeholder="&#xf073; MM-DD-YY" 
            name="resource_start_date" 
            autocomplete="off" 
            value="${resExitTable.ALLOCATION_START_DATE == ""
            ? "-"
            : convert(resExitTable.ALLOCATION_START_DATE)
          }"
            onchange="checkSOWStartdate(this, 'existing')"
            style="z-index: 1;"/>
        </td>
      </td>
      <td id="current_emp_end_date_${i + 1}" class="current_emp_end_date ${endDateWarningClass}">
        <span id="current_end_date_${i + 1}" class="currentEndDateText">${resExitTable.ALLOCATION_END_DATE == "NaT" || ""
            ? "-"
            : convert(resExitTable.ALLOCATION_END_DATE)
          }</span>
        <input type="text" class="form-control placeicon dateData resourceDate currentNewEndDate ${endDateWarningClass}"
          id="current_end_date_${i + 1}_input"
          data-id = "${i + 1}" 
          data-id2='${JSON.stringify(resExitTable)}'
          data-id-3 = "${resExitTable.EMPLOYEE_END_DATE == "NaT"
            ? ""
            : convert(resExitTable.EMPLOYEE_END_DATE)
          }"
          placeholder="&#xf073; MM-DD-YY" 
          name="resource_end_date" 
          autocomplete="off" 
          value="${resExitTable.ALLOCATION_END_DATE == "NaT" || ""
            ? "-"
            : convert(resExitTable.ALLOCATION_END_DATE)
          }"
          onchange="checkSOWEnddate(this)"
          style="z-index: 1;"/>
      </td>
      <td id="current_old_emp_name_${i + 1}" class="current_old_emp_name" style="display: none">${resExitTable.EMPLOYEE_NAME}</td>
      <td id="current_old_emp_id_${i + 1}" class="current_old_emp_id" style="display: none">${resExitTable.EMPLOYEE_ID}</td>
      <td id="current_old_emp_designation_${i + 1}" class="current_old_emp_designation" style="display: none">${resExitTable.JOB_ROLE
          }</td>
      <td id="current_emp_old_start_date_${i + 1}" class="current_emp_old_start_date" style="display: none">${convert(
            resExitTable.ALLOCATION_START_DATE,
          )}</td> 
      <td id="current_emp_old_end_date_${i + 1}" class="current_emp_old_end_date" style="display: none">${convert(
            resExitTable.ALLOCATION_END_DATE,
          )}</td> 
      <td id="current_emp_old_billing_${i + 1}" class="current_emp_old_billing" style="display: none">${resExitTable.BILLING_STATUS
          }</td> 
      <td id="current_emp_billing_status_${i + 1}" class="current_emp_billing_status" >
        <span id="bill_alloc_select_${i + 1}_text">${resExitTable.BILLING_STATUS
          }</span>
        <select class="form-control billing_select" id="bill_alloc_select_${i + 1}" data-id = "${i + 1}"  onchange="checkBillingWithDates(this)">
          ${billingOptions}
        </select>
      </td>      
      <td class='create-btn'>
        <button class="btn btn-info-allocation header-button show-bu-head-data" onclick="updateTeamDate(this);" id="current_end_date_${i + 1
          }_button" data-id="current_end_date_${i + 1}"><i
        class="fa fa-pencil-square-o"></i></button>
      </td>
    </tr>`;
        $("#resource_exist_body").append(resourceExistHtml);
        $(".currentNewEndDate").hide();
        $(".currentNewStartDate").hide();
        $("#current_end_date_" + (i + 1) + "_comments").prop("disabled", true);
        const todayDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        $("#current_end_date_" + (i + 1) + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
          minDate: todayDate,
        });
        $("#current_start_date_" + (i + 1) + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
          minDate: todayDate,
        });
        $(".input-group-addon").hide();
        $("#bill_alloc_select_" + (i + 1)).val(resExitTable.BILLING_STATUS);
        $("#bill_alloc_select_" + (i + 1)).hide();
        checkAccessAllocation();
      }
    });
  } else {
    $(".no_existing_resources").show();
  }
  createShortageData();
  console.log("editAccess status ", editAccess);
  if (!editAccess) {
    $(".create-btn").hide();
    $("#update_resource_data").hide();
    $("#sow_edit").show();
  } else {
    $(".create-btn").show();
    $("#update_resource_data").show();
    $("#sow_edit").show();
  }

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
  $("#update_resource_data").empty("");
  $("#update_resource_data").append("Updating Data...");
  $("#sow_update").attr("disabled", true);
  $("#cancel_sow_btn").attr("disabled", true);
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
      $("#update_resource_data").empty("");
      $("#update_resource_data").append("Allocate");
      $("#sow_update").attr("disabled", false);
      $("#cancel_sow_btn").attr("disabled", false);
    } else {
      toastr.options.timeOut = 2000; // 2s
      toastr.error(result.Response);
      $("#update_resource_data").attr("disabled", false);
      $("#update_resource_data").empty("");
      $("#update_resource_data").append("Allocate");
      $("#sow_update").attr("disabled", false);
      $("#cancel_sow_btn").attr("disabled", false);
    }
  } catch {
    // getApiTime(loadTimeInSeconds, "createAllocation", "Allocation", "allocate_resources", "success", fileName, "Sow_Team_Allocation", "edit");
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Failed to Update, Please try again");
    $("#update_resource_data").attr("disabled", false);
    $("#update_resource_data").empty("");
    $("#update_resource_data").append("Allocate");
    $("#sow_update").attr("disabled", false);
    $("#cancel_sow_btn").attr("disabled", false);
  }
  allocateTeam();
};

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
      teamComments = "",
      oldEmpName,
      oldEmpID,
      oldDesg;
    id = $(this).find(".current_emp_id").text();
    // console.log("id", id);
    accountID = $(this).closest("tr").find(".current_emp_account_id").text();
    sowID = $(this).closest("tr").find(".current_emp_sow_id").text();
    accountNm = $(this).closest("tr").find(".current_emp_account_name").html();
    sowNm = $(this).closest("tr").find(".current_emp_sow_name").html();
    name = $(this).closest("tr").find(".current_emp_name").html();
    country = $(this).closest("tr").find(".current_demand_loc").html();
    startDate = $(this).closest("tr").find(".currentNewStartDate").val();
    endDate = $(this).closest("tr").find(".currentNewEndDate").val();
    oldStartDate = $(this)
      .closest("tr")
      .find(".current_emp_old_start_date")
      .text();
    oldEndDate = $(this).closest("tr").find(".current_emp_old_end_date").text();
    oldBilling = $(this).closest("tr").find(".current_emp_old_billing").text();
    billingStatus = $(this)
      .closest("tr")
      .find(".billing_select option:selected")
      .val();
    desg = $(this).closest("tr").find(".current_emp_job_role").html();
    resourcegroup = $(this)
      .closest("tr")
      .find(".current_emp_resource_group")
      .html();
    subresourcegrp = $(this)
      .closest("tr")
      .find(".current_emp_resource_sub_group")
      .html();
    uniqueid = $(this).closest("tr").find(".current_emp_unique_id").html();
    availablefrom = $(this)
      .closest("tr")
      .find(".current_emp_ava_from_date")
      .html();
    availableto = $(this).closest("tr").find(".current_emp_ava_to_date").html();
    oldEmpName = $(this).closest("tr").find(".current_old_emp_name").html();
    oldEmpID = $(this).closest("tr").find(".current_old_emp_id").html();
    oldDesg = $(this).closest("tr").find(".current_old_emp_designation").html();
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
    if (name != oldEmpName) {
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
        "Please select start date of the team member <b>" + name + "</b>",
      );
      checkStatus = false;
    } else if (endDate == "") {
      toastr.options.timeOut = 2000;
      toastr.error(
        "Please select end date of the team member <b>" + name + "</b>",
      );
      checkStatus = false;
    }
    if (checkStatus) {
      // New Validation: Start Date should be less than or equal to End Date
      if (startDate !== "" && endDate !== "") {
        let startD = parseAllocationDate(startDate);
        let endD = parseAllocationDate(endDate);
        let demandDates = getRowDemandDates($(this), $(this).find(".currentNewStartDate").attr("data-id"));
        let isFullDemandPeriod = isAllocationSameAsDemandPeriod(
          startD,
          endD,
          demandDates.start,
          demandDates.end,
        );
        let oldStartD = parseAllocationDate(oldStartDate);
        let startDateChanged = !!(
          oldStartD &&
          startD &&
          oldStartD.getTime() !== startD.getTime()
        );
        let canShiftAllocationDates = canUseAllocationShiftDays();
        let shiftDays = canShiftAllocationDates ? getShiftDaysValue() : 0;
        let allowedDemandStartDate = addDaysToDate(demandDates.start, -shiftDays);
        if (startDateChanged && !isFullDemandPeriod) {
          allowedDemandStartDate = getLaterDate(
            allowedDemandStartDate,
            getTodayDateOnly(),
          );
        }
        let allowedDemandEndDate = addDaysToDate(demandDates.end, shiftDays);
        if (startD > endD) {
          toastr.options.timeOut = 3000;
          toastr.error(
            "Allocation end date cannot be less than allocation start date for <b>" + name + "</b>",
          );
          checkStatus = false;
        } else if (allowedDemandStartDate && startD && startD < allowedDemandStartDate) {
          toastr.options.timeOut = 3000;
          toastr.error(
            "Allocation start date cannot be before allowed demand start date for <b>" + name + "</b>",
          );
          checkStatus = false;
        } else if (demandDates.end && startD && startD > demandDates.end) {
          toastr.options.timeOut = 3000;
          toastr.error(
            "Allocation start date cannot be after demand end date for <b>" + name + "</b>",
          );
          checkStatus = false;
        } else if (allowedDemandEndDate && endD && endD > allowedDemandEndDate) {
          toastr.options.timeOut = 3000;
          toastr.error(
            "Allocation end date cannot be after allowed demand end date for <b>" + name + "</b>",
          );
          checkStatus = false;
        } else if (demandDates.start && endD && endD < demandDates.start) {
          toastr.options.timeOut = 3000;
          toastr.error(
            "Allocation end date cannot be before demand start date for <b>" + name + "</b>",
          );
          checkStatus = false;
        }
      }
    }

    if (checkStatus) {
      // New Logic: Check if this is an existing future partial allocation
      try {
        let dataId2 = $(this)
          .closest("tr")
          .find(".currentNewStartDate")
          .attr("data-id2");
        if (dataId2) {
          let rowData = JSON.parse(dataId2);
          let partialAllocations = rowData.PARTIAL_ALLOCATIONS || [];
          const todayForCheck = new Date();
          todayForCheck.setHours(0, 0, 0, 0);

          let existingFutureAlloc = partialAllocations.find((alloc) => {
            let allocId = alloc.EMPLOYEE_ID || "";
            let allocStart =
              alloc.RES_ALLOC_START_DATE || alloc.ALLOCATION_START_DATE;
            let allocEnd =
              alloc.RES_ALLOC_END_DATE || alloc.ALLOCATION_END_DATE;

            // Normalize dates for comparison
            let fmtAllocStart = convertDates(allocStart);
            let fmtAllocEnd = convertDates(allocEnd);
            let fmtCurrentStart = convertDates(startDate);
            let fmtCurrentEnd = convertDates(endDate);

            let isFuture =
              new Date(allocStart.replace(" ", "T")) > todayForCheck ||
              new Date(allocEnd.replace(" ", "T")) > todayForCheck;

            return (
              allocId == id &&
              fmtAllocStart == fmtCurrentStart &&
              fmtAllocEnd == fmtCurrentEnd &&
              isFuture
            );
          });

          if (existingFutureAlloc) {
            console.log("Existing future allocation matched, ignoring change for Allocate button.");
            checkStatus = false;
          }
        }
      } catch (e) {
        console.error("Error checking existing future allocations:", e);
      }
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

      let partialAllocations = [];
      try {
        let dataId2 = $(this).closest("tr").find(".currentNewStartDate").attr("data-id2");
        if (dataId2) {
          let rowData = JSON.parse(dataId2);
          if (rowData.PARTIAL_ALLOCATIONS) {
            // Clone the array so we don't accidentally mutate the underlying object
            partialAllocations = JSON.parse(JSON.stringify(rowData.PARTIAL_ALLOCATIONS));
          }
        }
      } catch (e) {
        console.log("Error parsing data-id2 for partial allocations", e);
      }

      // Add the current row's allocation to the list
      partialAllocations.push({
        EMPLOYEE_ID: id,
        EMPLOYEE_NAME: name,
        RES_ALLOC_START_DATE: startDate,
        RES_ALLOC_END_DATE: endDate,
        BILLING_STATUS: billingStatus
      });

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
        sowStartDate.replace(" 00:00:00", "") +
        '", "ACTUAL_END_DATE":"' +
        sowEndDate.replace(" 00:00:00", "") +
        '", "LEGAL_START_DATE":"' +
        legalStartDate.replace(" 00:00:00", "") +
        '", "LEGAL_END_DATE":"' +
        legalEndDate.replace(" 00:00:00", "") +
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
        '", "partial_allocations":' +
        JSON.stringify(partialAllocations) +
        '},';

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
        oldEmpID +
        '", "EMPLOYEE_NAME":"' +
        oldEmpName +
        '", "JOB_ROLE":"' +
        oldDesg +
        '", "RES_UNIQUE_ID":"' +
        uniqueid +
        '", "ALLOCATION_START_DATE":"' +
        oldStartDate +
        '", "ALLOCATION_END_DATE":"' +
        oldEndDate +
        '", "ACTUAL_START_DATE":"' +
        sowStartDate.replace(" 00:00:00", "") +
        '", "ACTUAL_END_DATE":"' +
        sowEndDate.replace(" 00:00:00", "") +
        '", "LEGAL_START_DATE":"' +
        legalStartDate.replace(" 00:00:00", "") +
        '", "LEGAL_END_DATE":"' +
        legalEndDate.replace(" 00:00:00", "") +
        '", "BILLING_STATUS":"' +
        oldBilling +
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
  console.log("Count value - ", count);
  if (count > 0) {
    if (request === "Allocate") {
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
      console.log("newAvailableResData - ", newAvailableResData);
      console.log("existingResData - ", existingResData);
      let allocationAuditMessages = prepareAllocationAuditMessages(
        existingResData,
        newAvailableResData,
      );
      console.log("allocationAuditMessages - ", allocationAuditMessages);

      let resource_old_data = "";
      let allocationAuditMessagesData = "";
      if (allocationAuditMessages.length > 0) {
        allocationAuditMessagesData = {
          TYPE_OF: "RESOURCE_DEMAND_DATA",
          MESSAGE: allocationAuditMessages.join("; <br>") + ".",
          MESSAGE_FLAG: "N",
        };
      }

      let allocationData = {
        SOW_ID: sowId,
        UNIQUE_ID: uniqued_id,
        environment: apiValue.environment,
        payload: {},
        messages: JSON.stringify([allocationAuditMessagesData]),
        user_details: "[" + accessDetails + "]",
      };

      console.log("allocationData - ", allocationData);

      let prepareData = {
        query_type: "allocate_resources",
        environment: apiValue.environment,
        user_details: "[" + accessDetails + "]",
        APPROVAL_DATA: "[" + approvalData + "]",
        resource_new_data: "[" + newAvailableResData + "]",
        resource_old_data: "[" + existingResData + "]",
        payload: JSON.parse("{}"),
        allocationAuditData: allocationData,
      };
      console.log("prepareData - ", prepareData);
      saveResourceData(prepareData);
    }
  } else {
    $("#update_resource_data").attr("disabled", true);
  }
}

function prepareAllocationAuditMessages(existingResData, newAvailableResData) {
  console.log("Starting allocation audit message preparation...");
  console.log("Raw existingResData:", existingResData);
  console.log("Raw newAvailableResData:", newAvailableResData);

  const FIELD_DISPLAY_NAMES = {
    ACCOUNT_ID: "Account ID",
    SOW_ID: "SOW ID",
    SOW_NAME: "SOW Name",
    EMPLOYEE_ID: "Employee ID",
    EMPLOYEE_NAME: "Employee Name",
    JOB_ROLE: "Job Role",
    ALLOCATION_START_DATE: "Allocation Start Date",
    ALLOCATION_END_DATE: "Allocation End Date",
    ACTUAL_START_DATE: "Actual Start Date",
    ACTUAL_END_DATE: "Actual End Date",
    LEGAL_START_DATE: "Legal Start Date",
    LEGAL_END_DATE: "Legal End Date",
    BILLING_STATUS: "Billing Status",
    LOCATION: "Location",
    SOW_STATUS: "SOW Status",
    COMMENT: "Comment",
    OPERATION: "Operation",
    RESOURCE_GROUP: "Resource Group",
    SUB_RES_GROUP: "Sub Resource Group",
  };

  const messages = [];

  // Function to parse resources if they are strings or improperly formatted
  const parseResources = (resources) => {
    if (Array.isArray(resources)) {
      return resources;
    } else if (typeof resources === "string") {
      try {
        const jsonStr = resources.startsWith("[")
          ? resources
          : `[${resources}]`;
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("Error parsing resources string:", e);
        return [];
      }
    } else if (typeof resources === "object" && resources !== null) {
      return Object.values(resources);
    }
    return [];
  };

  const existingResArray = parseResources(existingResData);
  const newResArray = parseResources(newAvailableResData);

  console.log("Parsed existingResArray:", existingResArray);
  console.log("Parsed newResArray:", newResArray);

  // Create a mapping of existing resources by EMPLOYEE_ID for easier lookup
  const existingResMap = {};
  existingResArray.forEach((resource, index) => {
    if (resource && resource.EMPLOYEE_ID) {
      const key = resource.EMPLOYEE_ID;
      existingResMap[key] = resource;
      console.log(`Mapped existing resource ${index}:`, key);
    } else {
      console.log(
        `Skipping invalid existing resource at index ${index}:`,
        resource,
      );
    }
  });
  console.log("Final existingResMap:", existingResMap);

  // Process each new resource
  newResArray.forEach((newResource, index) => {
    console.log(`Processing new resource at index ${index}:`, newResource);
    if (!newResource || !newResource.EMPLOYEE_ID) {
      console.log(`Skipping invalid new resource at index ${index}`);
      return;
    }

    // Check if this is a new allocation based on OPERATION field
    if (newResource.OPERATION === "New Allocation") {
      const msg = formatNewAllocationMessage(newResource, FIELD_DISPLAY_NAMES);
      console.log(
        `New allocation detected at index ${index}, adding message:`,
        msg,
      );
      messages.push(msg);
      return;
    }

    // For any other OPERATION (like "Extension" or "Release"), compare with existing data
    const key = newResource.EMPLOYEE_ID;
    const oldResource = existingResMap[key];
    if (!oldResource) {
      console.log(
        `No existing resource found for EMPLOYEE_ID: ${key} at index ${index}`,
      );
      // Treat as new if no match found
      const msg = formatNewAllocationMessage(newResource, FIELD_DISPLAY_NAMES);
      messages.push(msg);
      return;
    }
    console.log(
      `Found matching existing resource for EMPLOYEE_ID ${key}:`,
      oldResource,
    );

    // Compare fields and track changes
    const changedFields = [];
    for (const field in newResource) {
      if (
        ["OPERATION", "UNIQUE_ID", "RES_UNIQUE_ID", "ACCOUNT_NAME"].includes(
          field,
        )
      )
        continue;

      const oldVal = oldResource[field] || "";
      const newVal = newResource[field] || "";

      if (oldVal !== newVal) {
        const label = FIELD_DISPLAY_NAMES[field] || field;
        changedFields.push(
          `'${label}' old value '${oldVal}' new value '${newVal}'`,
        );
        console.log(
          `Change detected in field ${field} for EMPLOYEE_ID ${key}: old=${oldVal}, new=${newVal}`,
        );
      }
    }

    if (changedFields.length > 0) {
      const msg = `Allocation details updated for ${newResource.EMPLOYEE_NAME} in ${changedFields.join(", ")}`;
      console.log(`Adding update message for EMPLOYEE_ID ${key}:`, msg);
      messages.push(msg);
    } else {
      console.log(`No changes detected for EMPLOYEE_ID ${key}`);
    }
  });

  console.log("Final allocation audit messages:", messages);
  return messages;
}

function formatNewAllocationMessage(newData, FIELD_DISPLAY_NAMES) {
  let message = `New Allocation added for ${newData.EMPLOYEE_NAME || "Unknown Employee"} with ${FIELD_DISPLAY_NAMES.JOB_ROLE} : '${newData.JOB_ROLE || ""}'`;

  message += `, ${FIELD_DISPLAY_NAMES.SOW_NAME} : '${newData.SOW_NAME || ""}', ${FIELD_DISPLAY_NAMES.ALLOCATION_START_DATE} : '${newData.ALLOCATION_START_DATE || ""}', ${FIELD_DISPLAY_NAMES.ALLOCATION_END_DATE} : '${newData.ALLOCATION_END_DATE || ""}', ${FIELD_DISPLAY_NAMES.BILLING_STATUS} : '${newData.BILLING_STATUS || ""}', ${FIELD_DISPLAY_NAMES.LOCATION} : '${newData.LOCATION || ""}'`;

  return message;
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
    $("#res_recommend_data_" + getCount).show();
  } else {
    $("#" + dataId + "_button").html(
      '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>',
    );
    $("#" + dataId + "_input").hide();
    $("#" + dataId).html($("#" + dataId + "_input").val());
    $("#" + dataId).show();
    $("#" + dataId + "_comments").prop("disabled", true);
    $("#current_start_date_" + getCount + "_input").hide();
    $("#current_start_date_" + getCount).html(
      $("#current_start_date_" + getCount + "_input").val(),
    );
    $("#current_start_date_" + getCount).show();
    $("#bill_alloc_select_" + getCount).hide();
    $("#bill_alloc_select_" + getCount + "_text").show();
    $("#bill_alloc_select_" + getCount + "_text").html(
      $("#bill_alloc_select_" + getCount + " option:selected").val(),
    );
    $("#res_recommend_data_" + getCount).hide();
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
    name = $(this).closest("tr").find(".current_emp_name").html();
    designation = $(this).closest("tr").find(".current_emp_desg").html();
    country = $(this).closest("tr").find(".current_emp_loc").html();
    startDate = $(this).closest("tr").find(".current_emp_start_date").text();
    oldEndDate = $(this).closest("tr").find(".current_emp_old_end_date").text();
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

// function checkSOWEnddateBackup(obj, selName) {
//   console.log('selName - ',selName)
//   let id = $(obj).attr("id");
//   let dataId = $(obj).attr("data-id");
//   let sowSelectStartDate = new Date(
//     $("#current_start_date_" + dataId + "_input").val()
//   );
//   let selectedBilling = $("#bill_alloc_select_" + dataId + " option:selected").val();
//   let endDateRes = new Date($("#" + id).val());
//   let dataEndDate = $(obj).attr('data-id-2');
//   let dataEndDateConvert;

//   // If data-id-2 doesn't exist, try to parse data-id2 (JSON) and extract the date
//   if (!dataEndDate) {
//     let jsonData = $(obj).attr('data-id2');
//     if (jsonData) {
//       try {
//         let parsedData = JSON.parse(jsonData);
//         // Use AVAILABLE_TO_ORIGINAL or DEMAND_END_DATE from the JSON
//         dataEndDate = parsedData.AVAILABLE_TO_ORIGINAL || parsedData.DEMAND_END_DATE;
//       } catch (e) {
//         console.error('Error parsing data-id2 JSON:', e);
//       }
//     }
//   }

//   dataEndDateConvert = new Date(dataEndDate);
//   let resourceEndDate = $(obj).attr('data-id-3');
//   let resourceEndDateConvert = new Date(resourceEndDate);
//   // console.log('resourceEndDateConvert - ',resourceEndDateConvert)
//   // let dataEndDate = new Date('2024-08-08');
//   let oldEnddate = $("#current_end_date_" + dataId).text();
//   if (oldEnddate == '' || oldEnddate == null || oldEnddate == " ") {
//     oldEnddate = dataEndDate
//   }

//   let sowEndDateTemp = new Date($("#find_end_date").html());
//   // if ((endDateRes > sowEndDateTemp) && selectedBilling == 'Billed') {
//   if (endDateRes > sowEndDateTemp) {
//     toastr.options.timeOut = 2000; // 2s
//     toastr.error("Selected end date cannot be after the SOW end date");
//     $("#" + id).val(oldEnddate)
//     $('#'+id).addClass('text_warining');
//     $('#'+id.replace('_input','')).addClass('text_warining');
//   // }else if ((dataEndDateConvert < endDateRes) && selectedBilling == 'Billed') {
//   }else if (dataEndDateConvert < endDateRes) {
//     toastr.options.timeOut = 2000; // 2s
//     toastr.error("Selected end date cannot be after the resource's availability end date");
//     $("#" + id).val(oldEnddate)
//     $('#'+id).addClass('text_warining');
//     $('#'+id.replace('_input','')).addClass('text_warining');
//   }else if (resourceEndDateConvert < endDateRes) {
//     toastr.options.timeOut = 2000; // 2s
//     toastr.error("Selected end date cannot be after the resource's availability end date");
//     $("#" + id).val(oldEnddate)
//     $('#'+id).addClass('text_warining');
//     $('#'+id.replace('_input','')).addClass('text_warining');
//   } else if (sowSelectStartDate > endDateRes) {
//     toastr.options.timeOut = 2000; // 2s
//     toastr.error("Please ensure the end date is later than the start date");
//     $("#" + id).val(oldEnddate)
//     $('#'+id).addClass('text_warining');
//     $('#'+id.replace('_input','')).addClass('text_warining');
//   } else if (sowSelectStartDate == "Invalid Date") {
//     toastr.options.timeOut = 2000; // 2s
//     toastr.error("Please select start date");
//   }else{
//     $('#'+id).removeClass('text_warining');
//     $('#'+id.replace('_input','')).removeClass('text_warining');
//   }
//   checkDuplicateNamesInResource('sow_end_date')
//   allocateTeam()
// }

// function checkSOWStartdateBackup(obj, selName) {
//   let extendDates = findResData.SHIFT_BY_DAYS
//   console.log('selName - ',selName)
//   let id = $(obj).attr("id");
//   console.log('id - ',id)
//   let dataId = $(obj).attr("data-id");
//   let sowSelectEndDate = new Date(
//     $("#current_end_date_" + dataId + "_input").val()
//   );
//   let oldDate = $("#current_start_date_" + dataId).text()
//   let dataStartDate = $(obj).attr('data-id-2')
//   let dataStartDateConvert;

//   // If data-id-2 doesn't exist, try to parse data-id2 (JSON) and extract the date
//   if (!dataStartDate) {
//     let jsonData = $(obj).attr('data-id2');
//     if (jsonData) {
//       try {
//         let parsedData = JSON.parse(jsonData);
//         // Use AVAILABLE_FROM_ORIGINAL or DEMAND_START_DATE from the JSON
//         dataStartDate = parsedData.DEMAND_START_DATE;
//       } catch (e) {
//         console.error('Error parsing data-id2 JSON:', e);
//       }
//     }
//   }

//   dataStartDateConvert = new Date(dataStartDate);
//   console.log('dataStartDateConvert - ',dataStartDateConvert)
//   let startDateRes = new Date($("#" + id).val());
//   if (oldDate == '' || oldDate == null || oldDate == " ") {
//     oldDate = dataStartDate
//   }
//   // let dataStartDate = new Date('2024-07-09');
//   let sowStartDateTemp = new Date($("#legal_start_date").val());
//   let legalStartDateFormatted = $("#legal_start_date").val();
//   let selectedBilling = $("#bill_alloc_select_" + dataId + " option:selected").val();
//   let sowEndDateTemp = new Date($("#find_end_date").html());

//   // Apply date adjustments based on extendDates
//   if (extendDates && !isNaN(extendDates) && extendDates > 0) {
//     console.log('sowStartDateTemp - ',sowStartDateTemp);
//     // Reduce sowStartDateTemp by extendDates days
//     sowStartDateTemp.setDate(sowStartDateTemp.getDate() - extendDates);
//     console.log('Adjusted sowStartDateTemp:', sowStartDateTemp);
//     dataStartDateConvert.setDate(dataStartDateConvert.getDate() - extendDates);
//     console.log('Adjusted dataStartDateConvert:', dataStartDateConvert);

//     // Increase sowSelectEndDate by extendDates days
//     if (!isNaN(sowSelectEndDate.getTime())) {
//       sowSelectEndDate.setDate(sowSelectEndDate.getDate() + extendDates);
//       console.log('Adjusted sowSelectEndDate:', sowSelectEndDate);
//     }
//   }

//   if (sowStartDateTemp > startDateRes) {
//     toastr.options.timeOut = 2000; // 2s
//     toastr.error("Please choose a start date on or after the Actual start date - " + legalStartDateFormatted + " With provison to extend " + extendDates + " days");
//     $("#" + id).val(oldDate); // Reset input value to oldDate
//     $('#'+id).addClass('text_warining');
//     $('#'+id.replace('_input','')).addClass('text_warining');
//   }else if (dataStartDateConvert > startDateRes) {
//     toastr.options.timeOut = 2000; // 2s
//     if(selName == "existing"){
//       toastr.error("Please select a start date on or after the demand's available start date");
//     }else{
//       toastr.error("Please choose a start date on or after the resource's available start date");
//     }
//     $("#" + id).val(oldDate)
//     $('#'+id).addClass('text_warining');
//     $('#'+id.replace('_input','')).addClass('text_warining');
//   } else if (sowSelectEndDate < startDateRes) {
//     toastr.options.timeOut = 2000; // 2s
//     toastr.error("Please select a start date on or before the resource's available end date");
//     $("#" + id).val(oldDate); // Reset input value to oldDate
//     $('#'+id).addClass('text_warining');
//     $('#'+id.replace('_input','')).addClass('text_warining');
//   }else{
//     $('#'+id).removeClass('text_warining');
//     $('#'+id.replace('_input','')).removeClass('text_warining');
//   }
//   checkDuplicateNamesInResource('sow_start_date')
//   allocateTeam()
// }

function checkSOWEnddate(obj, selName) {
  console.log("selName - ", selName);
  let extendDates = findResData.SHIFT_BY_DAYS;
  let id = $(obj).attr("id");
  let dataId = $(obj).attr("data-id");
  let sowSelectStartDate = new Date(
    $("#current_start_date_" + dataId + "_input").val(),
  );
  let selectedBilling = $(
    "#bill_alloc_select_" + dataId + " option:selected",
  ).val();
  let endDateRes = new Date($("#" + id).val());
  let dataEndDate, dataEndDateConvert;
  let resourceEndDate = $(obj).attr("data-id-4");
  console.log("resourceEndDate - ", resourceEndDate);

  // If data-id-2 doesn't exist, try to parse data-id2 (JSON) and extract the date
  // if (!dataEndDate) {
  let jsonData = $(obj).attr("data-id2");
  if (jsonData) {
    try {
      let parsedData = JSON.parse(jsonData);
      // Use AVAILABLE_TO_ORIGINAL or DEMAND_END_DATE from the JSON
      dataEndDate = parsedData.DEMAND_END_DATE;
      if (resourceEndDate == undefined) {
        resourceEndDate =
          parsedData.EMPLOYEE_END_DATE == "0000-00-00 00:00:00"
            ? ""
            : new Date(parsedData.EMPLOYEE_END_DATE);
      }
    } catch (e) {
      console.error("Error parsing data-id2 JSON:", e);
    }
  }
  // }
  let resourceEndDateConvert = new Date(resourceEndDate);
  console.log("resourceEndDateConvert - ", resourceEndDateConvert);
  dataEndDateConvert = new Date(dataEndDate);
  console.log("resourceEndDateConvert - ", resourceEndDateConvert);
  // let dataEndDate = new Date('2024-08-08');
  let oldEnddate = $("#current_end_date_" + dataId).text();
  console.log("oldEnddate - ", oldEnddate);
  if (oldEnddate == "" || oldEnddate == null || oldEnddate == " ") {
    let resourceEndDateAttr = $(obj).attr("data-id-4");
    if (resourceEndDateAttr && resourceEndDateAttr !== "") {
      if (resourceEndDateConvert > dataEndDateConvert) {
        oldEnddate = convert(dataEndDate);
      } else {
        oldEnddate = resourceEndDateAttr;
      }
    } else {
      oldEnddate = convert(dataEndDate);
    }
  }
  let sowExtendedEndDate = dataEndDateConvert;
  // Apply date adjustments based on extendDates
  if (extendDates && !isNaN(extendDates) && extendDates > 0) {
    // Increase sowSelectEndDate by extendDates days
    if (!isNaN(sowExtendedEndDate.getTime())) {
      sowExtendedEndDate.setDate(sowExtendedEndDate.getDate() + extendDates);
      console.log("Adjusted sowExtendedEndDate:", sowExtendedEndDate);
    }
  }

  let sowEndDateTemp = new Date($("#find_end_date").html());
  let currentDemandEndDate = $("#current_demand_end_" + dataId).text();
  let formatedDemandEndDate = new Date(currentDemandEndDate);
  // if ((endDateRes > sowEndDateTemp) && selectedBilling == 'Billed') {
  // if (endDateRes > sowEndDateTemp) {
  //   toastr.options.timeOut = 2000; // 2s
  //   toastr.error("Selected end date cannot be after the SOW end date");
  //   $("#" + id).val(oldEnddate)
  //   $('#'+id).addClass('text_warining');
  //   $('#'+id.replace('_input','')).addClass('text_warining');
  // // }else if ((dataEndDateConvert < endDateRes) && selectedBilling == 'Billed') {
  // }
  let demandDates = getRowDemandDates($("#" + id).closest("tr"), dataId);
  let canShiftAllocationDates = canUseAllocationShiftDays();
  let shiftDays = canShiftAllocationDates ? getShiftDaysValue() : 0;
  let allowedDemandEndDate = addDaysToDate(demandDates.end, shiftDays);
  let todayDate = getTodayDateOnly();
  let allocationEndDate = parseAllocationDate($("#" + id).val());
  let allocationStartDate = parseAllocationDate($("#current_start_date_" + dataId + "_input").val());
  if (allocationEndDate && allocationEndDate < todayDate) {
    toastr.options.timeOut = 2000;
    toastr.error("Please select allocation end date on or after current date");
    $("#" + id).val(oldEnddate);
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (allowedDemandEndDate && allocationEndDate && allocationEndDate > allowedDemandEndDate) {
    toastr.options.timeOut = 2000;
    toastr.error(
      canShiftAllocationDates && shiftDays > 0
        ? "Selected end date cannot be after the demand actual end date with provison to extend " +
            shiftDays +
            " days"
        : "Selected end date cannot be after the demand actual end date",
    );
    $("#" + id).val(oldEnddate);
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (demandDates.start && allocationEndDate && allocationEndDate < demandDates.start) {
    toastr.options.timeOut = 2000;
    toastr.error("Selected end date cannot be before the demand actual start date");
    $("#" + id).val(oldEnddate);
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (allocationStartDate && allocationEndDate && allocationEndDate < allocationStartDate) {
    toastr.options.timeOut = 2000;
    toastr.error("Allocation end date cannot be less than allocation start date");
    $("#" + id).val(oldEnddate);
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (!isNaN(resourceEndDateConvert) && resourceEndDateConvert < endDateRes) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error(
      "Selected end date cannot be after the resource availability end date",
    );
    $("#" + id).val(oldEnddate);
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (!canShiftAllocationDates && sowExtendedEndDate < endDateRes) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error(
      "Selected end date cannot be after the demand actual end date with provison to extend " +
      extendDates +
      " days",
    );
    $("#" + id).val(oldEnddate);
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (sowSelectStartDate > endDateRes) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error(
      "Please ensure the demand actual end date is on or after the demand actual start date",
    );
    $("#" + id).val(oldEnddate);
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (sowSelectStartDate == "Invalid Date") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select start date");
  } else {
    $("#" + id).removeClass("text_warining");
    $("#" + id.replace("_input", "")).removeClass("text_warining");
    updatePartialAllocationWarning(dataId, true, "end");
  }
  checkDuplicateNamesInResource("sow_end_date");
  allocateTeam();
}

function checkSOWStartdate(obj, selName) {
  let extendDates = findResData.SHIFT_BY_DAYS;
  console.log("selName - ", selName);
  let id = $(obj).attr("id");
  console.log("id - ", id);
  let dataId = $(obj).attr("data-id");
  let sowSelectEndDate = new Date(
    $("#current_end_date_" + dataId + "_input").val(),
  );
  let oldDate = $("#current_start_date_" + dataId).text();
  let dataStartDate = $(obj).attr("data-id-2");
  let dataStartDateConvert, resourceEndDate;
  let jsonemployeeID = "";
  // If data-id-2 doesn't exist, try to parse data-id2 (JSON) and extract the date
  let jsonData = $(obj).attr("data-id2");
  if (jsonData) {
    try {
      let parsedData = JSON.parse(jsonData);
      // Use AVAILABLE_FROM_ORIGINAL or DEMAND_START_DATE from the JSON
      if (
        dataStartDate == "" ||
        dataStartDate == null ||
        dataStartDate == undefined
      ) {
        dataStartDate = parsedData.DEMAND_START_DATE;
      }
      resourceEndDate =
        parsedData.EMPLOYEE_END_DATE == "0000-00-00 00:00:00"
          ? ""
          : new Date(parsedData.DEMAND_END_DATE);
      jsonemployeeID = parsedData.EMPLOYEE_ID;
    } catch (e) {
      console.error("Error parsing data-id2 JSON:", e);
    }
  }

  dataStartDateConvert = new Date(dataStartDate);
  console.log("dataStartDateConvert - ", dataStartDateConvert);
  console.log("resourceEndDate - ", resourceEndDate);
  console.log("sowSelectEndDate - ", sowSelectEndDate);
  let startDateRes = new Date($("#" + id).val());
  let selectedEmployeeID = $("#current_emp_id_" + dataId).text();
  if (oldDate == "" || oldDate == null || oldDate == " ") {
    oldDate = dataStartDate;
  }
  let oldStartDate = parseAllocationDate(oldDate);
  let selectedStartDate = parseAllocationDate($("#" + id).val());
  if (
    oldStartDate &&
    selectedStartDate &&
    oldStartDate.getTime() === selectedStartDate.getTime()
  ) {
    $("#" + id).removeClass("text_warining");
    $("#" + id.replace("_input", "")).removeClass("text_warining");
    updatePartialAllocationWarning(dataId, false);
    checkDuplicateNamesInResource("sow_start_date");
    allocateTeam();
    return;
  }
  // let dataStartDate = new Date('2024-07-09');
  let sowStartDateTemp = new Date($("#legal_start_date").val());
  let legalStartDateFormatted = $("#legal_start_date").val();
  let selectedBilling = $(
    "#bill_alloc_select_" + dataId + " option:selected",
  ).val();
  let sowEndDateTemp = new Date($("#find_end_date").html());

  // Apply date adjustments based on extendDates
  if (extendDates && !isNaN(extendDates) && extendDates > 0) {
    console.log("sowStartDateTemp - ", sowStartDateTemp);
    // Reduce sowStartDateTemp by extendDates days
    sowStartDateTemp.setDate(sowStartDateTemp.getDate() - extendDates);
    console.log("Adjusted sowStartDateTemp:", sowStartDateTemp);
    dataStartDateConvert.setDate(dataStartDateConvert.getDate() - extendDates);
    console.log("Adjusted dataStartDateConvert:", dataStartDateConvert);

    // Increase sowSelectEndDate by extendDates days
    if (!isNaN(sowSelectEndDate.getTime())) {
      sowSelectEndDate.setDate(sowSelectEndDate.getDate() + extendDates);
      console.log("Adjusted sowSelectEndDate:", sowSelectEndDate);
    }
  }

  let demandDates = getRowDemandDates($("#" + id).closest("tr"), dataId);
  let canShiftAllocationDates = canUseAllocationShiftDays();
  let shiftDays = canShiftAllocationDates ? getShiftDaysValue() : 0;
  let allowedDemandStartDate = addDaysToDate(demandDates.start, -shiftDays);
  let allocationStartDate = parseAllocationDate($("#" + id).val());
  let allocationEndDate = parseAllocationDate($("#current_end_date_" + dataId + "_input").val());
  let isFullDemandPeriod = isAllocationSameAsDemandPeriod(
    allocationStartDate,
    allocationEndDate,
    demandDates.start,
    demandDates.end,
  );
  if (!isFullDemandPeriod) {
    allowedDemandStartDate = getLaterDate(
      allowedDemandStartDate,
      getTodayDateOnly(),
    );
  }
  if (allowedDemandStartDate && allocationStartDate && allocationStartDate < allowedDemandStartDate) {
    toastr.options.timeOut = 2000;
    toastr.error(
      canShiftAllocationDates && shiftDays > 0
        ? "Please choose a start date on or after the demand actual start date with provison to extend " +
            shiftDays +
            " days"
        : "Please select allocation start date on or after the demand actual start date",
    );
    $("#" + id).val(oldDate);
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (demandDates.end && allocationStartDate && allocationStartDate > demandDates.end) {
    toastr.options.timeOut = 2000;
    toastr.error("Please select allocation start date on or before the demand actual end date");
    $("#" + id).val(oldDate);
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (allocationStartDate && allocationEndDate && allocationEndDate < allocationStartDate) {
    toastr.options.timeOut = 2000;
    toastr.error("Allocation end date cannot be less than allocation start date");
    $("#" + id).val(oldDate);
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (!canShiftAllocationDates && sowStartDateTemp > startDateRes) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error(
      "Please choose a start date on or after the demand actual start date - " +
      legalStartDateFormatted +
      " With provison to extend " +
      extendDates +
      " days",
    );
    $("#" + id).val(oldDate); // Reset input value to oldDate
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (resourceEndDate < startDateRes && resourceEndDate != "") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select a start date less than resource end date");
    $("#" + id).val(oldDate); // Reset input value to oldDate
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else if (sowSelectEndDate < startDateRes) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select start date less than or equal to demand actual end date");
    $("#" + id).val(oldDate); // Reset input value to oldDate
    $("#" + id).addClass("text_warining");
    $("#" + id.replace("_input", "")).addClass("text_warining");
  } else {
    $("#" + id).removeClass("text_warining");
    $("#" + id.replace("_input", "")).removeClass("text_warining");
    updatePartialAllocationWarning(dataId, true, "start");
  }
  // New validation for PARTIAL_ALLOCATIONS
  // let jsonDataStr = $(obj).attr('data-id2');
  // if (jsonDataStr) {
  //   try {
  //     let jsonData = JSON.parse(jsonDataStr);
  //     let currentEmpId = selectedEmployeeID;
  //     let partialAllocations = jsonData.PARTIAL_ALLOCATIONS || [];

  //     // Only check if PARTIAL_ALLOCATIONS has data
  //     if (partialAllocations.length > 0) {
  //       let isValidDateRange = true;
  //       let conflictingAllocation = null;

  //       for (let i = 0; i < partialAllocations.length; i++) {
  //         let allocation = partialAllocations[i];

  //         // Skip if it's the same employee
  //         if (allocation.EMPLOYEE_ID === currentEmpId) {
  //           continue;
  //         }

  //         let partialStartDate = new Date(allocation.ALLOCATION_START_DATE);
  //         let partialEndDate = new Date(allocation.ALLOCATION_END_DATE);

  //         // Check if selected start date falls within any partial allocation date range
  //         if (startDateRes >= partialStartDate && startDateRes <= partialEndDate) {
  //           isValidDateRange = false;
  //           conflictingAllocation = allocation;
  //           break;
  //         }
  //       }

  //       if (!isValidDateRange) {
  //         toastr.options.timeOut = 3000;
  //         toastr.error("Selected start date conflicts with existing partial allocation for Employee " +
  //           conflictingAllocation.EMPLOYEE_ID + " (" + convert(conflictingAllocation.ALLOCATION_START_DATE) +
  //           " to " + convert(conflictingAllocation.ALLOCATION_END_DATE) + ")");
  //         $("#" + id).val(oldDate);
  //         $('#'+id).addClass('text_warining');
  //         $('#'+id.replace('_input','')).addClass('text_warining');
  //         return;
  //       }
  //     }
  //   } catch (e) {
  //     console.error('Error parsing jsonData for PARTIAL_ALLOCATIONS validation:', e);
  //   }
  // }

  checkDuplicateNamesInResource("sow_start_date");
  allocateTeam();
}

function checkBillingWithDates(obj) {
  let id = $(obj).attr("id");
  let dataId = $(obj).attr("data-id");
  let selectedBilling = $("#" + id + " option:selected").val();
  let oldStartDate = $("#current_start_date_" + dataId).text();
  let oldDate = $("#current_start_date_" + dataId).text();

  let sowSelectStartDate = new Date(
    $("#current_start_date_" + dataId + "_input").val(),
  );

  let sowStartDateTemp = new Date($("#find_start_date").html());
  let oldEnddate = $("#current_end_date_" + dataId).text();
  let sowEndDateTemp = new Date($("#find_end_date").html());
  let sowSelectEndDate = new Date(
    $("#current_end_date_" + dataId + "_input").val(),
  );
  let canShiftAllocationDates = canUseAllocationShiftDays();
  let shiftDays = canShiftAllocationDates ? getShiftDaysValue() : 0;
  let allowedSowStartDate = addDaysToDate(sowStartDateTemp, -shiftDays);
  let allowedSowEndDate = addDaysToDate(sowEndDateTemp, shiftDays);

  if (sowSelectStartDate != "Invalid Date") {
    if (allowedSowStartDate > sowSelectStartDate && selectedBilling == "Billed") {
      toastr.options.timeOut = 2000; // 2s
      toastr.error(
        canShiftAllocationDates && shiftDays > 0
          ? "Please choose a start date on or after the SOW start date with provison to extend " +
              shiftDays +
              " days"
          : "Please choose a start date on or after the SOW start date",
      );
      $("#current_start_date_" + dataId + "_input").val(oldDate);
    }
  }
  // } else {
  //   toastr.options.timeOut = 2000; // 2s
  //   toastr.error("Please select allocation start date");
  // }
  if (sowSelectEndDate != "Invalid Date") {
    if (sowSelectEndDate > allowedSowEndDate) {
      toastr.options.timeOut = 2000; // 2s
      toastr.error(
        canShiftAllocationDates && shiftDays > 0
          ? "Selected end date cannot be after the SOW end date with provison to extend " +
              shiftDays +
              " days"
          : "Selected end date cannot be after the SOW end date",
      );
    }
    // } else {
    //   toastr.options.timeOut = 2000; // 2s
    //   toastr.error("Please select allocation end date");
    // }
  }
  checkDuplicateNamesInResource("billing_date");
  allocateTeam();
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
        let resource_end_date = resExitTable.EMPLOYEE_END_DATE;

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
          eachResCompleteData,
        );

        $("#resource_exist_body").append(shortageHtml);
        let uniqId = i + (rowCount + 1);
        const today = new Date();
        const todayDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        $("#current_start_date_" + uniqId + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
          minDate: todayDate,
        });
        $("#current_end_date_" + uniqId + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
          minDate: todayDate,
        });
        $(".input-group-addon").hide();
        $("#avaiable_res_list_" + uniqId + " option").each(function () {
          $(this)
            .siblings('[value="' + this.value + '"]')
            .remove();
        });
        $("#avaiable_res_list_" + uniqId).select2({});
        let getValue = $(`#res_recommend_selcted_name_${uniqId}`).text();
        console.log("getValue - ", getValue);
        if (getValue == "Not Allocated") {
          $(`#res_recommend_selcted_name_${uniqId}`).addClass(
            "not_allocated_res",
          );
          $(`#current_start_date_${uniqId}_input`).hide();
          $(`#current_end_date_${uniqId}_input`).hide();
          $(`#bill_alloc_select_${uniqId}`).hide();
        } else {
          $(`#res_recommend_selcted_name_${uniqId}`).removeClass(
            "not_allocated_res",
          );
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
          eachResCompleteData,
        );

        $("#resource_exist_body").append(shortageHtml);
        let uniqId = i + (rowCount + 1);
        const today = new Date();
        const todayDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        $("#current_start_date_" + uniqId + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
          minDate: todayDate,
        });
        $("#current_end_date_" + uniqId + "_input").datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
          minDate: todayDate,
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
        console.log("getValue - ", getValue);
        if (getValue == "Not Allocated") {
          $(`#res_recommend_selcted_name_${uniqId}`).addClass(
            "not_allocated_res",
          );
          $(`#current_start_date_${uniqId}_input`).hide();
          $(`#current_end_date_${uniqId}_input`).hide();
          $(`#bill_alloc_select_${uniqId}`).hide();
        } else {
          $(`#res_recommend_selcted_name_${uniqId}`).removeClass(
            "not_allocated_res",
          );
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
    });
  }

  // Toggle the 'Current Resources' legend visibility after adding shortage data
  toggleCurrentResourcesLegend();
}

let rowCount = $("#resource_exist_table tbody tr").length;
function createNewTeam() {
  toastr.options.timeOut = 5000;
  toastr.warning("Any addition through '+' sign will result in investment resource.");
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
  let eachResCompleteData = resExitTable;
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
    eachResCompleteData,
  );

  $("#resource_exist_body").append(shortageHtml);
  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  $("#current_start_date_" + (rowCount + 1) + "_input").datepicker({
    format: "mm-dd-yy",
    uiLibrary: "bootstrap",
    minDate: todayDate,
  });
  $("#current_end_date_" + (rowCount + 1) + "_input").datepicker({
    format: "mm-dd-yy",
    uiLibrary: "bootstrap",
    minDate: todayDate,
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
  $(`#bill_alloc_select_${rowCount + 1}`).val("Investment");
  $(`#bill_alloc_select_${rowCount + 1}`).css("visibility", "hidden");
  checkAccessAllocation();
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
  eachResCompleteData,
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
  let funnelStageName = $("#funnel_name").text();
  console.log("funnelStageName", funnelStageName);
  console.log("allocationAllowed", allocationAllowed);
  allocationAllowed = funnelStageAllowedList.includes(funnelStageName);
  let userrole = localStorage.getItem("user-role");
  let userEmailId = localStorage.getItem("email").trim();
  let userDesignation = localStorage.getItem("Job_Role").trim();
  console.log("userEmailId - ",userEmailId)
  console.log("userDesignation - ",userDesignation)
  if (
    userrole == "admin" ||
    userEmailId == "akhilesh@factspan.com" ||
    userEmailId == "nitin.pandey@factspan.com" ||
    userEmailId == "sravankumar.raju@factspan.com" ||
    userDesignation == "Vice President"
  ) {
    allocationAllowed = true;
  }
  console.log("eachResCompleteData - ", eachResCompleteData);
  console.log("allocationAllowed after -", allocationAllowed);
  console.log("recommResModelUser - ", recommResModelUser);
  if (
    typeof recommResModelUser !== "undefined" &&
    recommResModelUser.length > 0
  ) {
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
    console.log("recommResModelUser is undefined or empty.");
  }

  selectedteam = `<select class="emp_name_option_selected" id="avaiable_res_list_${increment + (row + 1)
    }" onchange="getEmpId(this, 'new')">
              ${avaiable_res_name_list}
            </select>`;
  if (loc == "") {
    deleteButton = `<button class="btn btn-info-allocation header-button show-bu-head-data" onclick="deleteTeamDate(this);" 
                      id="current_delete_${increment + (row + 1)
      }_button" data-id = "${increment + (row + 1)}">
                      <i class="fa fa-trash" aria-hidden="true"></i>
                    </button>`;
  } else {
    selectedteam = `<span id='res_recommend_selcted_name_${increment + (row + 1)
      }' class="current_emp_name className_recommend">Not Allocated</span> 
                      <button type="button" class="btn btn-info-allocation header-button show-bu-head-data" 
                        id="res_recommend_data_${increment + (row + 1)
      }" title="Recommended Resource"
                        data-toggle="modal" data-target="#recommTeam" 
                        data-id='${JSON.stringify(selectedData)}' 
                        data-id2='${JSON.stringify(eachResCompleteData)}'
                        onclick="getRecommendUserData(this, 'new')" data-id1='${JSON.stringify(
        recommResModelUser,
      )}'>
                          <i class="fa fa-magic" aria-hidden="true"></i>
                      </button>
                      <br>
                      <select class="emp_name_option_selected" id="avaiable_res_list_${increment + (row + 1)
      }" onchange="getEmpId(this, 'new')" style='display: none'>
                                ${resRecomListUser}
                              </select>`;
  }
  let view = `<tr class="current_team_${increment + (row + 1)}">
                  <td class="current_demand_loc" id="avi_emp_loc_${increment + (row + 1)
    }">${loc}</td>
                  <td class="current_demand_persona">${persona}</td>
                  <td class="current_demand_actual_start" id="avi_res_demand_start_date_${increment + (row + 1)
    }">${demand_start_date == "NaT" || ""
      ? "-"
      : convert(demand_start_date)
    }</td>
                  <td class="current_demand_actual_end" id="avi_res_demand_end_date_${increment + (row + 1)
    }">${demand_end_date == "NaT" || ""
      ? "-"
      : convert(demand_end_date)
    }</td>
                  
                  <td class="current_emp_account_id" id="avi_account_id_${increment + (row + 1)
    }" style="display:none">${accountid}</td>
                  <td class="current_emp_sow_id" id="avi_emp_sow_id_${increment + (row + 1)
    }" style="display:none">${sowid}</td>
                  <td class="current_emp_account_name" id="avi_account_name_${increment + (row + 1)
    }" style="display:none">${accountname}</td>
                  <td class="current_emp_sow_name" id="avi_sow_name_${increment + (row + 1)
    }" style="display:none">${sowname}</td>
                  <td class="current_emp_id" id="avi_emp_id_${increment + (row + 1)
    }" style="display:none"></td>
                  <td class="current_emp_resource_group" id="avi_emp_resource_group_${increment + (row + 1)
    }" style="display:none">${resourcegroup}</td>
                  <td class="current_emp_resource_sub_group" id="avi_emp_resource_sub_group_${increment + (row + 1)
    }" style="display:none">${subresourcegrp}</td>
                  <td class="current_emp_unique_id" id="avi_emp_unique_id_${increment + (row + 1)
    }" style="display:none">${uniqueid}</td>
                  <td class="current_emp_name_new view_msg" colspan="8">
                    <span class="resource-allocate-msg">${!allocationAllowed && editAccess ? "Resource allocation not allowed for funnel stage - <b>" + funnelStageName + "</b> ( Please contact Delivery Head )" : "Resource yet to be allocated"}</span>
                  </td>
                </tr>`;

  let edit_delete = `<tr class="current_team_${increment + (row + 1)}">
                        <td class="current_demand_loc" id="avi_emp_loc_${increment + (row + 1)
    }">${loc}</td>
                        <td class="current_demand_persona">${persona}</td>
                        <td class="current_demand_actual_start" id="avi_res_demand_start_date_${increment + (row + 1)
    }">${demand_start_date == "NaT" || ""
      ? "-"
      : convert(demand_start_date)
    }</td>
                        <td class="current_demand_actual_end" id="avi_res_demand_end_date_${increment + (row + 1)
    }">${demand_end_date == "NaT" || ""
      ? "-"
      : convert(demand_end_date)
    }</td>
                        
                        <td class="current_emp_account_id" id="avi_account_id_${increment + (row + 1)
    }" style="display:none">${accountid}</td>
                        <td class="current_emp_sow_id" id="avi_emp_sow_id_${increment + (row + 1)
    }" style="display:none">${sowid}</td>
                        <td class="current_emp_account_name" id="avi_account_name_${increment + (row + 1)
    }" style="display:none">${accountname}</td>
                        <td class="current_emp_sow_name" id="avi_sow_name_${increment + (row + 1)
    }" style="display:none">${sowname}</td>
                        <td class="current_emp_id" id="avi_emp_id_${increment + (row + 1)
    }" style="display:none"></td>
                        <td class="current_emp_resource_group" id="avi_emp_resource_group_${increment + (row + 1)
    }" style="display:none">${resourcegroup}</td>
                        <td class="current_emp_resource_sub_group" id="avi_emp_resource_sub_group_${increment + (row + 1)
    }" style="display:none">${subresourcegrp}</td>
                        <td class="current_emp_unique_id" id="avi_emp_unique_id_${increment + (row + 1)
    }" style="display:none">${uniqueid}</td>
                        <td class="current_emp_name_new name_display" id="avi_emp_name_${increment + (row + 1)
    }">
                          ${selectedteam}
                        </td>
                        
                        <td class="current_emp_job_role" id="avi_emp_desc_${increment + (row + 1)
    }"></td>
                        <td class="current_emp_supply_persona" id="avi_emp_persona_${increment + (row + 1)
    }"></td>
                        <td class="current_emp_skills" style="display:none" id="avi_emp_skill_data_${increment + (row + 1)
    }"></td>
                        <td id="avi_emp_skill_${increment + (row + 1)}"></td>
                        <td class="current_emp_start_date">
                          <input type="text" class="form-control placeicon dateData resourceDate currentNewStartDate" 
                            id="current_start_date_${increment + (row + 1)}_input"
                            data-id = "${increment + (row + 1)}" 
                            data-id2='${JSON.stringify(eachResCompleteData)}'
                            placeholder="&#xf073; MM-DD-YY" 
                            name="resource_start_date" 
                            autocomplete="off" 
                            onchange = "checkSOWStartdate(this, 'new')"
                            style="z-index: 1;"/>
                        </td>
                        <td class="current_emp_end_date">
                          <input type="text" class="form-control placeicon dateData resourceDate currentNewEndDate" 
                            id="current_end_date_${increment + (row + 1)}_input"
                            data-id = "${increment + (row + 1)}" 
                            data-id2='${JSON.stringify(eachResCompleteData)}'
                            data-id-3 = ''
                            placeholder="&#xf073; MM-DD-YY" 
                            name="resource_end_date" 
                            autocomplete="off" 
                            onchange = checkSOWEnddate(this)
                            style="z-index: 1;"/>
                        </td>
                        <td class="current_emp_old_start_date" style="display: none"></td> 
                        <td class="current_emp_old_end_date" style="display: none"></td> 
                        <td class="current_emp_ava_from_date" id="avi_available_from_${increment + (row + 1)
    }" style="display: none"></td> 
                        <td class="current_emp_ava_to_date" id="avi_available_to_${increment + (row + 1)
    }" style="display: none"></td> 
                        <td class="current_emp_old_billing" style="display: none"></td> 
                        <td class="current_emp_billing_status">
                          <select class="form-control billing_select" id="bill_alloc_select_${increment + (row + 1)
    }" data-id = "${increment + (row + 1)}"  onchange="checkBillingWithDates(this)">
                            ${billingOptions}
                          </select>
                        </td>                
                        <td class='create-btn'>
                          ${deleteButton}
                        </td>
                      </tr>`;
  if (!allocationAllowed) {
    $("#create_allocate_team").hide();
  }
  return !allocationAllowed ? view : editAccess === true ? edit_delete : view;
}

function getRecomSelTeamId() {
  var selectedVal = "";
  var selected = $(
    "input[type='radio'][name='recommend_team_selected']:checked",
  );

  if (selected.length > 0) {
    selectedVal = selected.val();
  }
  let tempList = selectedVal.split(",");
  $("#recommend_btn").attr("data-id1", tempList[0]);
  $("#recommend_btn").attr("data-start", tempList[1]);
  $("#recommend_btn").attr("data-end", tempList[2]);
}

function formatToMMDDYY(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);

  return `${mm}-${dd}-${yy}`;
}

function getEmpId(obj, value) {
  let id = "",
    id_count = "",
    className_recommend = "recommended_no";
  ((selected_team_id = ""),
    (selectedStatus = true),
    (all_start_date = ""),
    (all_end_date = ""),
    (selected_recom = []));
  let allocation_type = $(obj).attr("data-id3");
  console.log("allocation_type - ", allocation_type);
  if (value == "new") {
    id = $(obj).attr("id");
    id_count = id.replace("avaiable_res_list_", "");
    selected_team_id = $("#" + id + " option:selected").val();
    console.log("selected_team_id - ", selected_team_id);
    $("#current_start_date_" + id_count + "_input").prop("disabled", false);
    $("#current_end_date_" + id_count + "_input").prop("disabled", false);
  } else {
    getRecomSelTeamId();
    id_count = $(obj).attr("data-id");
    selected_team_id = $(obj).attr("data-id1");
    all_start_date = $(obj).attr("data-start");
    selected_recom = JSON.parse($(obj).attr("data-id2"));
    all_end_date = $(obj).attr("data-end");
    console.log("all_end_date - ", all_end_date);

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
      (emp_data) => emp_data.EMPLOYEE_ID == selected_team_id,
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
        (emp) => emp.EMPLOYEE_ID == selected_team_id,
      );
    }
    let oldEmpEndDate = $("#current_emp_old_end_date_" + id_count).text();
    let oldEmpEndDateAdded = new Date(oldEmpEndDate);
    oldEmpEndDateAdded.setDate(oldEmpEndDateAdded.getDate() + 1);
    console.log("oldEmpEndDateAdded - ", oldEmpEndDateAdded);
    oldEmpEndDateAdded = new Date(
      oldEmpEndDateAdded.getFullYear(),
      oldEmpEndDateAdded.getMonth(),
      oldEmpEndDateAdded.getDate(),
    );
    console.log("oldEmpEndDateAdded new - ", oldEmpEndDateAdded);
    $.each(recomndation_status, function (i, sel_emp) {
      let all_start_date = sel_emp.AVAILABLE_FROM;
      let all_end_date = sel_emp.AVAILABLE_TO;

      // Validation for PARTIAL_ALLOCATIONS
      let futureAllocFound = false;
      let rowDataStr = $(obj).attr("data-row-data");
      if (rowDataStr) {
        try {
          let rowData = JSON.parse(rowDataStr);
          let partialAllocations = rowData.PARTIAL_ALLOCATIONS || [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let futureAllocation = partialAllocations.find((alloc) => {
            let allocId = alloc.EMPLOYEE_ID || "";
            let allocStart = new Date(
              (
                alloc.RES_ALLOC_START_DATE ||
                alloc.ALLOCATION_START_DATE ||
                ""
              ).replace(" ", "T"),
            );
            let allocEnd = new Date(
              (
                alloc.RES_ALLOC_END_DATE ||
                alloc.ALLOCATION_END_DATE ||
                ""
              ).replace(" ", "T"),
            );
            return (
              allocId == selected_team_id &&
              (allocStart > today || allocEnd > today)
            );
          });

          if (futureAllocation) {
            all_start_date =
              futureAllocation.RES_ALLOC_START_DATE ||
              futureAllocation.ALLOCATION_START_DATE;
            all_end_date =
              futureAllocation.RES_ALLOC_END_DATE ||
              futureAllocation.ALLOCATION_END_DATE;
            futureAllocFound = true;
          }
        } catch (e) {
          console.error(
            "Error parsing row data for partial allocation check:",
            e,
          );
        }
      }

      if (futureAllocFound) {
        $("#current_start_date_" + id_count + "_input").prop("disabled", true);
        $("#current_end_date_" + id_count + "_input").prop("disabled", true);
      } else {
        $("#current_start_date_" + id_count + "_input").prop("disabled", false);
        $("#current_end_date_" + id_count + "_input").prop("disabled", false);
      }

      $("#res_recommend_selcted_name_" + id_count).empty();
      if (allocation_type == "existing") {
        $("#current_emp_job_role_" + id_count).empty();
        $("#current_emp_persona_" + id_count).empty();
        const today = new Date();
        const todayDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        let demand_start_date = $("#current_demand_start_" + id_count).text();
        let demand_end_date = $("#current_demand_end_" + id_count).text();
        $("#current_start_date_" + id_count + "_input").val(
          convert(all_start_date),
        );
        $("#current_start_date_" + id_count + "_input").attr(
          "data-id-2",
          convert(all_start_date),
        );
        $("#current_end_date_" + id_count + "_input").val(
          convert(all_end_date),
        );
        $("#current_end_date_" + id_count + "_input").attr(
          "data-id-2",
          convert(all_end_date),
        );
        $("#current_end_date_" + id_count + "_input").attr(
          "data-id-4",
          convert(all_end_date),
        );
        $("#current_emp_id_" + id_count).empty();
        $("#current_emp_job_role_" + id_count).empty();
        $("#current_emp_skills_" + id_count).empty();
        $("#current_emp_skill_count_" + id_count).empty();
        // Check PARTIAL_ALLOCATIONS in data-id2 to find the last allocated end date
        // This supports 3rd and subsequent partial allocations correctly
        let partialAllocEndDateExisting = null;
        try {
          let existingDataId2 = $("#current_start_date_" + id_count + "_input").attr("data-id2");
          if (existingDataId2) {
            let existingRowData = JSON.parse(existingDataId2);
            if (existingRowData.PARTIAL_ALLOCATIONS && existingRowData.PARTIAL_ALLOCATIONS.length > 0) {
              // Sort by FULFILLMENT_ORDER to get the last allocated entry
              let sortedPA = [...existingRowData.PARTIAL_ALLOCATIONS].sort((a, b) =>
                (a.FULFILLMENT_ORDER || 0) - (b.FULFILLMENT_ORDER || 0)
              );
              let lastPA = sortedPA[sortedPA.length - 1];
              let paEndDate = lastPA.RES_ALLOC_END_DATE || lastPA.ALLOCATION_END_DATE;
              if (paEndDate && paEndDate !== "NaT" && paEndDate !== "") {
                let d = new Date(paEndDate.replace(" ", "T") + (paEndDate.includes("T") ? "" : "T00:00:00"));
                if (!isNaN(d)) {
                  partialAllocEndDateExisting = d;
                }
              }
            }
          }
        } catch (e) {
          console.log("Could not parse partial allocation data for existing row:", e);
        }

        if (futureAllocFound) {
          $("#current_start_date_" + id_count + "_input").val(
            convert(all_start_date),
          );
          $("#current_start_date_" + id_count + "_input").attr(
            "data-id-2",
            convert(all_start_date),
          );
          $("#current_end_date_" + id_count + "_input").val(
            convert(all_end_date),
          );
          $("#current_end_date_" + id_count + "_input").attr(
            "data-id-2",
            convert(all_end_date),
          );
          $("#current_end_date_" + id_count + "_input").attr(
            "data-id-4",
            convert(all_end_date),
          );
        } else {
          if (partialAllocEndDateExisting !== null) {
            // Use last partial allocation end date + 1 day as start date (for 3rd+ allocations)
            let nextStartDate = new Date(partialAllocEndDateExisting);
            let demandEndDateText = $("#current_demand_end_" + id_count).text();
            let demandEndDate = null;
            if (demandEndDateText && demandEndDateText !== "-") {
              // Handle MM-DD-YY format from UI
              if (demandEndDateText.includes("-") && demandEndDateText.split("-")[0].length === 2) {
                let parts = demandEndDateText.split("-");
                demandEndDate = new Date(`20${parts[2]}-${parts[0]}-${parts[1]}T00:00:00`);
              } else {
                demandEndDate = new Date(demandEndDateText.replace(" ", "T") + (demandEndDateText.includes("T") ? "" : "T00:00:00"));
              }
            }

            if (demandEndDate && !isNaN(demandEndDate)) {
              if (nextStartDate < demandEndDate) {
                nextStartDate.setDate(nextStartDate.getDate() + 1);
              } else {
                nextStartDate = demandEndDate;
              }
            } else {
              nextStartDate.setDate(nextStartDate.getDate() + 1);
            }

            all_start_date = convertDates(nextStartDate);

            let formattedNextStartDate = formatToMMDDYY(nextStartDate);
            $("#current_start_date_" + id_count + "_input").val(
              formattedNextStartDate,
            );
            $("#current_start_date_" + id_count + "_input").attr(
              "data-id-2",
              formattedNextStartDate,
            );
          }
          else if (demand_start_date != "-") {
            if (new Date(all_start_date) >= new Date(demand_start_date)) {
              $("#current_start_date_" + id_count + "_input").val(
                convert(all_start_date),
              );
              $("#current_start_date_" + id_count + "_input").attr(
                "data-id-2",
                convert(all_start_date),
              );
            } else {
              // Use the previous (first) allocation's end date + 1 day as the start date
              $("#current_start_date_" + id_count + "_input").val(
                formatToMMDDYY(oldEmpEndDateAdded),
              );
              $("#current_start_date_" + id_count + "_input").attr(
                "data-id-2",
                demand_start_date,
              );
            }
          } else {
            $("#current_start_date_" + id_count + "_input").val(
              convert(all_start_date),
            );
            $("#current_start_date_" + id_count + "_input").attr(
              "data-id-2",
              convert(all_start_date),
            );
          }

          if (demand_end_date != "-") {
            // if (new Date(all_end_date) >= new Date(demand_end_date)) {
            if (new Date(all_end_date) <= new Date(demand_end_date)) {
              $("#current_end_date_" + id_count + "_input").val(
                convert(all_end_date),
              );
              $("#current_end_date_" + id_count + "_input").attr(
                "data-id-2",
                convert(all_end_date),
              );
            } else {
              $("#current_end_date_" + id_count + "_input").val(demand_end_date);
              $("#current_end_date_" + id_count + "_input").attr(
                "data-id-2",
                demand_end_date,
              );
            }
          } else {
            $("#current_end_date_" + id_count + "_input").val(
              convert(all_end_date),
            );
            $("#current_end_date_" + id_count + "_input").attr(
              "data-id-2",
              convert(all_end_date),
            );
          }
        }
        applyDefaultAllocationDates(id_count, sel_emp);
        // $("#current_emp_old_billing_" + id_count).empty();
        // $("#current_emp_billing_status_" + id_count).empty();
      } else {
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
          "#avi_res_demand_start_date_" + id_count,
        ).text();
        let demand_end_date = $("#avi_res_demand_end_date_" + id_count).text();

        // --- Partial allocation: determine start date as prev allocation end date + 1 ---
        let partialAllocEndDate = null;
        let locText = $("#avi_emp_loc_" + id_count).text().trim();
        // Also capture the unique string ID for this demand so we can check added rows in the DOM
        let currentUniqueId = $("#avi_emp_unique_id_" + id_count).text().trim();

        if (locText !== "") {
          try {
            let startInputDataId2 = $(
              "#current_start_date_" + id_count + "_input",
            ).attr("data-id2");
            if (startInputDataId2) {
              let rowData = JSON.parse(startInputDataId2);
              // Find the maximum end date among all partial allocations for this demand row
              if (
                rowData.PARTIAL_ALLOCATIONS &&
                rowData.PARTIAL_ALLOCATIONS.length > 0
              ) {
                // Determine start date as prev allocation end date + 1
                // Sort by FULFILLMENT_ORDER to correctly find the last allocated entry
                let sortedPA = [...rowData.PARTIAL_ALLOCATIONS].sort((a, b) =>
                  (a.FULFILLMENT_ORDER || 0) - (b.FULFILLMENT_ORDER || 0)
                );
                let lastPa = sortedPA[sortedPA.length - 1];
                let paEndDate = lastPa.RES_ALLOC_END_DATE || lastPa.ALLOCATION_END_DATE;
                if (paEndDate && paEndDate !== "NaT" && paEndDate !== "") {
                  let d = new Date(paEndDate.replace(" ", "T") + (paEndDate.includes("T") ? "" : "T00:00:00"));
                  if (!isNaN(d)) {
                    partialAllocEndDate = d;
                  }
                }
              } else if (
                rowData.ALLOCATION_END_DATE &&
                rowData.ALLOCATION_END_DATE !== "NaT" &&
                rowData.ALLOCATION_END_DATE !== ""
              ) {
                let d = new Date(rowData.ALLOCATION_END_DATE.replace(" ", "T"));
                if (!isNaN(d)) {
                  partialAllocEndDate = d;
                }
              }
            }
          } catch (e) {
            console.log("Could not parse partial allocation data:", e);
          }
        }

        if (futureAllocFound) {
          $("#current_start_date_" + id_count + "_input").val(
            convert(all_start_date),
          );
          $("#current_start_date_" + id_count + "_input").attr(
            "data-id-2",
            convert(all_start_date),
          );
          $("#current_end_date_" + id_count + "_input").val(
            convert(all_end_date),
          );
          $("#current_end_date_" + id_count + "_input").attr(
            "data-id-2",
            convert(all_end_date),
          );
          $("#current_end_date_" + id_count + "_input").attr(
            "data-id-4",
            convert(all_end_date),
          );
        } else {
          if (partialAllocEndDate !== null) {
            // Use previous partial allocation end date + 1 day as allocation start date
            let nextStartDate = new Date(partialAllocEndDate);
            let demandEndDate = null;
            if (demand_end_date && demand_end_date !== "-") {
              // Handle MM-DD-YY format from UI
              if (demand_end_date.includes("-") && demand_end_date.split("-")[0].length === 2) {
                let parts = demand_end_date.split("-");
                demandEndDate = new Date(`20${parts[2]}-${parts[0]}-${parts[1]}T00:00:00`);
              } else {
                demandEndDate = new Date(demand_end_date.replace(" ", "T") + (demand_end_date.includes("T") ? "" : "T00:00:00"));
              }
            }

            if (demandEndDate && !isNaN(demandEndDate)) {
              if (nextStartDate < demandEndDate) {
                nextStartDate.setDate(nextStartDate.getDate() + 1);
              } else {
                nextStartDate = demandEndDate;
              }
            } else {
              nextStartDate.setDate(nextStartDate.getDate() + 1);
            }
            all_start_date = convertDates(nextStartDate);

            let formattedNextStartDate = formatToMMDDYY(nextStartDate);
            $("#current_start_date_" + id_count + "_input").val(
              formattedNextStartDate,
            );
            $("#current_start_date_" + id_count + "_input").attr(
              "data-id-2",
              formattedNextStartDate,
            );
          }
          else if (demand_start_date != "-") {
            if (new Date(all_start_date) >= new Date(demand_start_date)) {
              $("#current_start_date_" + id_count + "_input").val(
                convert(all_start_date),
              );
              $("#current_start_date_" + id_count + "_input").attr(
                "data-id-2",
                convert(all_start_date),
              );
            } else {
              $("#current_start_date_" + id_count + "_input").val(
                demand_start_date,
              );
              $("#current_start_date_" + id_count + "_input").attr(
                "data-id-2",
                demand_start_date,
              );
            }
          } else {
            $("#current_start_date_" + id_count + "_input").val(
              convert(all_start_date),
            );
            $("#current_start_date_" + id_count + "_input").attr(
              "data-id-2",
              convert(all_start_date),
            );
          }

          if (demand_end_date != "-") {
            // if (new Date(all_end_date) >= new Date(demand_end_date)) {
            if (new Date(all_end_date) <= new Date(demand_end_date)) {
              console.log('all_end_date - ',all_end_date)
              console.log('demand_end_date - ',demand_end_date)
              if(all_end_date == null){
                $("#current_end_date_" + id_count + "_input").val(
                  demand_end_date,
                );
                // $("#current_end_date_" + id_count + "_input").attr(
                //   "data-id-2",
                //   demand_end_date,
                // );
                // $("#current_end_date_" + id_count + "_input").attr(
                //   "data-id-4",
                //   demand_end_date,
                // );
                console.log('convert(demand_end_date) - ',convert(demand_end_date))
              }else{
                $("#current_end_date_" + id_count + "_input").val(
                  convert(all_end_date),
                );
                $("#current_end_date_" + id_count + "_input").attr(
                  "data-id-2",
                  convert(all_end_date),
                );
                $("#current_end_date_" + id_count + "_input").attr(
                  "data-id-4",
                  convert(all_end_date),
                );
                console.log('convert(all_end_date) - ',convert(all_end_date))
              }
            } else {
              $("#current_end_date_" + id_count + "_input").val(demand_end_date);
              $("#current_end_date_" + id_count + "_input").attr(
                "data-id-2",
                demand_end_date,
              );
              $("#current_end_date_" + id_count + "_input").attr(
                "data-id-4",
                convert(all_end_date),
              );
            }
          } else {
            $("#current_end_date_" + id_count + "_input").val(
              convert(all_end_date),
            );
            $("#current_end_date_" + id_count + "_input").attr(
              "data-id-2",
              convert(all_end_date),
            );
            $("#current_end_date_" + id_count + "_input").attr(
              "data-id-4",
              convert(all_end_date),
            );
          }
        }
      }
      if (!futureAllocFound) {
        applyDefaultAllocationDates(id_count, sel_emp);
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

      // let skills = sel_emp.SKILLS_LEVEL; // Assuming this is a string like "AWS-R1,Azure-R1,Excel-R1,Python-R1,Snowflake-R1,SQL-R1"
      // let skillHtml = "", skillsBackendData = "", skillCount = 0;

      // if (skills === undefined) {
      //   skills = sel_emp.SKILL_DATE;
      //   if (skills !== null) {
      //     if (typeof skills === 'string') {
      //       const skillArray = skills.split(',');
      //       skillArray.forEach(function (skill) {
      //         if (skill !== "NO_SKILL") {
      //           skillHtml += `<button class="skill_data">${skill}</button>`;
      //           skillsBackendData += `${skill},`;
      //           skillCount++;
      //         }
      //       });
      //     } else if (Array.isArray(skills)) {
      //       skills.forEach(function (skillData) {
      //         if (skillData.SKILL !== "NO_SKILL") {
      //           skillHtml += `<button class="skill_data">${skillData.SKILL}</button>`;
      //           skillsBackendData += `${skillData.SKILL},`;
      //           skillCount++;
      //         }
      //       });
      //     }
      //   }
      // } else if (typeof skills === 'string') {
      //   const skillsArray = skills.split(","); // Convert the string into an array

      //   skillsArray.forEach(function (skillData) {
      //     if (skillData !== "NO_SKILL") {
      //       skillHtml += `<button class="skill_data">${skillData}</button>`;
      //       skillsBackendData += `${skillData},`;
      //       skillCount++;
      //     }
      //   });
      // }
      let loc = sel_emp.COUNTRY;

      // if (skillHtml.endsWith(",")) {
      //   skillHtml = skillHtml.slice(0, -1);
      // }
      // if (skillsBackendData.endsWith(",")) {
      //   skillsBackendData = skillsBackendData.slice(0, -1);
      // }
      // // Create a hoverable button with skill count and tooltip
      // let skillsTooltip = skillsBackendData;
      // let finalHtml = `
      //   <button class="skill_count" title="${skillsTooltip}">
      //     ${skillCount}
      //   </button>
      //   <div class="skills_container">${skillHtml}</div>
      // `;
      let skills = sel_emp.SKILLS_LEVEL || sel_emp.SKILL_DATE;
      let skillHtml = "";
      let skillsBackendData = "";
      let skillCount = 0;

      // Process skills whether they come as string or array
      if (skills) {
        let skillArray = [];

        // Normalize to array format
        if (typeof skills === "string") {
          skillArray = skills.split(",");
        } else if (Array.isArray(skills)) {
          skillArray = skills.map((skill) =>
            typeof skill === "object" ? skill.SKILL : skill,
          );
        }

        // Process each skill
        skillArray.forEach(function (skill) {
          skill = (skill || "").trim();
          if (skill && skill !== "NO_SKILL") {
            skillHtml += `<div class="skill_block">${skill}</div>`;
            skillsBackendData += `${skill},`;
            skillCount++;
          }
        });
      }

      // Clean up trailing commas
      skillsBackendData = skillsBackendData.replace(/,$/, "");
      let skillsTooltip = skillsBackendData || "No skills";

      // Create the final HTML with hoverable skill count and tooltip
      let finalHtml = `
      <div class="skill_container">
          <button class="skill_count" data-tooltip="${skillsTooltip}">
              ${skillCount}
          </button>
          <div class="skills_tooltip">
              <div class="skills_wrapper">
                  ${skillCount > 0 ? skillHtml : '<div class="skill_block">-</div>'}
              </div>
          </div>
      </div>
      `;
      if (sel_emp.EMPLOYEE_NAME == "NONE" && sel_emp.RECOMMENDED === "Z") {
        $("#res_recommend_selcted_name_" + id_count).append("Not Allocated");
      } else if (
        sel_emp.EMPLOYEE_NAME == "NONE" &&
        sel_emp.RECOMMENDED === "YES"
      ) {
        $("#res_recommend_selcted_name_" + id_count).append(
          sel_emp.EMPLOYEE_NAME,
        );
      } else {
        $("#res_recommend_selcted_name_" + id_count).append(
          sel_emp.EMPLOYEE_NAME,
        );
      }

      if (allocation_type == "existing") {
        $("#current_emp_persona_" + id_count).append(
          sel_emp.SUPPLY_PERSONA === undefined
            ? sel_emp.SKILLS_PERSONA
            : sel_emp.SUPPLY_PERSONA,
        );
        $("#current_emp_id_" + id_count).append(sel_emp.EMPLOYEE_ID);
        $("#current_emp_job_role_" + id_count).append(sel_emp.JOB_ROLE);
        $("#current_emp_skills_" + id_count).append(skillsBackendData);
        $("#current_emp_skill_count_" + id_count).append(
          skillCount > 0 ? finalHtml : "-",
        );
        // $("#current_emp_billing_status_" + id_count).append(sel_emp.BILLING_STATUS);
      } else {
        $("#avi_emp_desc_" + id_count).append(sel_emp.JOB_ROLE);
        $("#avi_emp_persona_" + id_count).append(
          sel_emp.SUPPLY_PERSONA === undefined
            ? sel_emp.SKILLS_PERSONA
            : sel_emp.SUPPLY_PERSONA,
        );
        $("#avi_emp_loc_" + id_count).append(loc);
        $("#avi_emp_skill_" + id_count).append(
          skillCount > 0 ? finalHtml : "-",
        );
        $("#avi_emp_skill_data_" + id_count).append(skillsBackendData);
        $("#avi_emp_id_" + id_count).append(selected_team_id);
        $("#avi_account_id_" + id_count).append(sel_emp.ACCOUNT_ID);
        $("#avi_emp_sow_id_" + id_count).append(sel_emp.SOW_ID);
        $("#avi_account_name_" + id_count).append(sel_emp.ACCOUNT_NAME);
        $("#avi_sow_name_" + id_count).append(sel_emp.SOW_NAME);
        $("#avi_available_from_" + id_count).append(sel_emp.AVAILABLE_FROM);
        $("#avi_available_to_" + id_count).append(sel_emp.AVAILABLE_TO);
      }
      let value = $("#" + elementId).text();
      console.log("selected value - ", value);
      console.log("selected id 2 - ", selected_team_id);
      if (value == "Not Allocated") {
        $(`#res_recommend_selcted_name_${id_count}`).addClass(
          "not_allocated_res",
        );
        $(`#current_start_date_${id_count}_input`).hide();
        $(`#current_end_date_${id_count}_input`).hide();
        $(`#bill_alloc_select_${id_count}`).hide();
        $(`#avi_emp_skill_${id_count}`).hide();
      } else {
        $(`#res_recommend_selcted_name_${id_count}`).removeClass(
          "not_allocated_res",
        );
        $(`#current_start_date_${id_count}_input`).show();
        $(`#current_end_date_${id_count}_input`).show();
        $(`#bill_alloc_select_${id_count}`).show();
        $(`#avi_emp_skill_${id_count}`).show();
      }
    });
  }
  if (selected_team_id == "-1") {
    console.log("Inside");
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
  allocateTeam();
}

function deleteTeamDate(obj) {
  let deleteId = $(obj).attr("data-id");
  $(".current_team_" + deleteId).remove();
  allocateTeam();
}

function parseRecommendedModalDateStr(str) {
  if (!str || str === "-" || str === "" || str === "null" || str === "undefined") return null;
  if (str instanceof Date) return isNaN(str) ? null : new Date(str.getTime());

  let normalized = String(str).trim();
  if (!normalized || normalized === "null" || normalized === "undefined" || normalized === "[object Object]") {
    return null;
  }

  if (normalized.includes(" ")) normalized = normalized.split(" ")[0];
  if (normalized.includes("T")) normalized = normalized.split("T")[0];
  let parts = normalized.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      let y = parseInt(parts[2]);
      if (y < 100) y += 2000;
      return new Date(y, parts[0] - 1, parts[1]);
    }
  }
  let parsedDate = new Date(normalized);
  return isNaN(parsedDate) ? null : parsedDate;
}

function getRecommendedModalWeekdayCount(startDate, endDate) {
  if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
    return 0;
  }

  let count = 0;
  let current = new Date(startDate);
  while (current <= endDate) {
    let day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function resetRecommendedTeamModalTitle() {
  $("#recommendedTeamModalTitle").text("Recommended Team Members");
}

function hideRecommendedModalError() {
  $("#recommend_error_message").hide().text("");
}

function showRecommendedModalError(message) {
  let fallbackMessage = "Unable to load recommended team members right now.";
  $("#recommend_error_message").text(message || fallbackMessage).show();
}

function finalizeRecommendedModalLoading() {
  $("#loading_div").hide();
  $("#recommend_btn").attr("disabled", false);
}

function formatRecommendedModalDateLabel(dateValue) {
  let parsedDate = parseRecommendedModalDateStr(dateValue);
  if (!parsedDate) return "";

  let month = (`0${parsedDate.getMonth() + 1}`).slice(-2);
  let day = (`0${parsedDate.getDate()}`).slice(-2);
  let year = parsedDate.getFullYear().toString().slice(-2);
  return `${month}-${day}-${year}`;
}

function setRecommendedTeamModalTitle(startValue, endValue) {
  try {
    let startDate = parseRecommendedModalDateStr(startValue);
    let endDate = parseRecommendedModalDateStr(endValue);

    if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
      resetRecommendedTeamModalTitle();
      return;
    }

    let weekdayCount = getRecommendedModalWeekdayCount(startDate, endDate);
    let formattedStart = formatRecommendedModalDateLabel(startDate);
    let formattedEnd = formatRecommendedModalDateLabel(endDate);

    if (!formattedStart || !formattedEnd) {
      resetRecommendedTeamModalTitle();
      return;
    }

    $("#recommendedTeamModalTitle").text(
      `Recommended Team Members for Demand Start ${formattedStart} End ${formattedEnd} (${weekdayCount} Days)`
    );
  } catch (error) {
    console.error("Failed to set Recommended Team Members title:", error);
    resetRecommendedTeamModalTitle();
  }
}

function setRecommendedTeamModalLoadingTitle(startValue, endValue) {
  setRecommendedTeamModalTitle(startValue, endValue);
}

$(document).on("hidden.bs.modal", "#recommTeam", function() {
  resetRecommendedTeamModalTitle();
  hideRecommendedModalError();
});

function normalizeRecommendationValue(value) {
  return String(value || "").trim().toLowerCase();
}

function buildPersonaPriorityLookup(personaData, demandPersona) {
  let mapping = personaData && demandPersona ? personaData[demandPersona] : null;
  let lookup = {};

  if (!mapping) return lookup;

  const addPersonaGroup = (personas, priority) => {
    (personas || []).forEach(function(persona) {
      let key = normalizeRecommendationValue(persona);
      if (key && lookup[key] === undefined) lookup[key] = priority;
    });
  };

  addPersonaGroup(mapping["Exact Match"], 0);
  if ((mapping["Exact Match"] || []).indexOf("All Others") !== -1) {
    lookup.__othersDemand = true;
  }
  Object.keys(mapping).forEach(function(groupName) {
    let adjacentMatch = groupName.match(/^Adjacent Persona\s*(\d+)/i);
    if (adjacentMatch) {
      addPersonaGroup(mapping[groupName], parseInt(adjacentMatch[1], 10));
    }
  });

  return lookup;
}

function getRecommendationPersonaPriority(supplyPersona, personaPriorityLookup) {
  let normalizedPersona = normalizeRecommendationValue(supplyPersona);
  if (!normalizedPersona) return 100;
  if (personaPriorityLookup.__othersDemand && normalizedPersona.indexOf("other") === 0) return 0;
  return personaPriorityLookup[normalizedPersona] !== undefined ? personaPriorityLookup[normalizedPersona] : 99;
}

function getRecommendationPersonaLevel(supplyPersona) {
  let levelMatch = String(supplyPersona || "").match(/-(\d+)\s*$/);
  if (!levelMatch) return -1;
  return parseInt(levelMatch[1], 10);
}

function getRecommendationPersonaSortName(supplyPersona) {
  return String(supplyPersona || "").replace(/-\d+\s*$/, "").trim();
}

function getRecommendationDemandPersona(demandInfo) {
  let demandData = Array.isArray(demandInfo) && demandInfo.length > 0 ? demandInfo[0] : demandInfo;
  if (!demandData) return "";

  return demandData.REQUIRED_PERSONA ||
    demandData.SKILLS_PERSONA ||
    demandData.SUPPLY_PERSONA ||
    "";
}

function buildPersonaFilterGroups(personaData) {
  let groups = {};
  let configuredExactPersonas = {};

  Object.keys(personaData || {}).forEach(function(groupName) {
    let exactPersonas = ((personaData[groupName] || {})["Exact Match"] || [])
      .filter(function(persona) {
        return persona && persona !== "All Others";
      });

    groups[groupName] = {};
    exactPersonas.forEach(function(persona) {
      let normalizedPersona = normalizeRecommendationValue(persona);
      groups[groupName][normalizedPersona] = true;
      if (groupName !== "Others") configuredExactPersonas[normalizedPersona] = true;
    });
  });

  return {
    groups: groups,
    configuredExactPersonas: configuredExactPersonas
  };
}

const getResModalData = (resData, selectedusrId, demandStart, demandEnd, personaData, demandPersona) => {
  let skill_count = true;
  $("#loading_div").show();
  $("#recommend_btn").attr("disabled", true);
  hideRecommendedModalError();
  let billing_date = $("#billing_start_date").val();
  let billing_end_date = $("#billing_end_date").val();
  let personaPriorityLookup = buildPersonaPriorityLookup(personaData, demandPersona);
  let personaFilterData = buildPersonaFilterGroups(personaData);

  setRecommendedTeamModalTitle(demandStart, demandEnd);

  console.log("billing_date - ", billing_date);
  console.log("billing_end_date - ",billing_end_date)

  // Populate Department dropdown
  let departments = [...new Set(resData.map(obj => obj.DEPARTMENT || obj.BUSINESS_UNIT).filter(Boolean))].sort();
  let deptOptions = '';
  departments.forEach(dept => {
    deptOptions += `<option value="${dept}">${dept}</option>`;
  });
  $("#filter_department").html(deptOptions);
  
  // Initialize multiselect for Department
  if ($.fn.multiselect) {
      $('#filter_department').val(['Delivery', 'COE']); // Force default values every time
      $('#filter_department').multiselect({
          columns: 1,
          placeholder: 'Department',
          search: true,
          selectAll: true,
          onControlClose: function() {
              if ($.fn.DataTable.isDataTable("#recommended_table")) {
                let table = $("#recommended_table").DataTable();
                syncRecommendedTableRows(table.rows().nodes());
                applyRecommendationDefaultOrder(table);
              }
          }
      });
      $('#filter_department').multiselect('reload');
  }

  // Populate Persona dropdown from configured persona groups.
  let personas = Object.keys(personaData || {}).sort();
  let personaOptions = "";
  personas.forEach(function(persona) {
    personaOptions += `<option value="${persona}">${persona}</option>`;
  });
  $("#filter_persona").html(personaOptions);

  if ($.fn.multiselect) {
      $('#filter_persona').val([]);
      $('#filter_persona').multiselect({
          columns: 1,
          placeholder: 'Persona',
          search: true,
          selectAll: true,
          onControlClose: function() {
              if ($.fn.DataTable.isDataTable("#recommended_table")) {
                let table = $("#recommended_table").DataTable();
                syncRecommendedTableRows(table.rows().nodes());
                applyRecommendationDefaultOrder(table);
              }
          }
      });
      $('#filter_persona').multiselect('reload');
  }

  // Preserving filter state if already set, otherwise set defaults on first load
  // Force default checkbox states every time the popup opens
  $("#filter_bench").prop("checked", true);
  $("#filter_investment").prop("checked", false);

  // Destroy the existing DataTable instance if it exists
  if ($.fn.DataTable.isDataTable("#recommended_table")) {
    $("#recommended_table").DataTable().destroy();
  }
  $("#recommend_team_data").empty();
  $("#recom_length_placeholder").empty();

  let recom_res_data = "";
  resData.map((obj) => {
    let intervalsAll = [];
    let intervalsBench = [];
    let intervalsInvest = [];

    const getIntersectionDays = (intervals) => {
        if (intervals.length === 0) return 0;
        intervals.sort((a, b) => a.start - b.start);
        let merged = [];
        let currentMerged = { start: new Date(intervals[0].start), end: new Date(intervals[0].end) };
        for (let i = 1; i < intervals.length; i++) {
            let next = intervals[i];
            let gapCheck = new Date(currentMerged.end);
            gapCheck.setDate(gapCheck.getDate() + 1);
            if (next.start <= gapCheck) {
                currentMerged.end = new Date(Math.max(currentMerged.end, next.end));
            } else {
                merged.push(currentMerged);
                currentMerged = { start: new Date(next.start), end: new Date(next.end) };
            }
        }
        merged.push(currentMerged);
        
        let count = 0;
        merged.forEach(m => {
            let cur = new Date(m.start);
            while (cur <= m.end) {
                let day = cur.getDay();
                if (day !== 0 && day !== 6) count++;
                cur.setDate(cur.getDate() + 1);
            }
        });
        return count;
    };

    // Current Status, Available From, and Available To Logic (Multiple Support)
    let statusHtml = "";
    let availFromHtml = "";
    let availToHtml = "";
    let primaryStatus = "Bench"; // For filtering
    let firstAvailFrom = "";
    let firstAvailTo = "";
    let displayedStatuses = [];
    
    // Group dates by status to prioritize Bench > Investment > Billed for sorting
    let benchFrom = [];
    let investFrom = [];
    let billedFrom = [];
    let benchTo = [];
    let investTo = [];
    let billedTo = [];

    let dStart = demandStart ? parseRecommendedModalDateStr(demandStart) : null;
    let dEnd = demandEnd ? parseRecommendedModalDateStr(demandEnd) : null;

    if (obj.CURRENT_STATUS_RECOMMENDED && obj.CURRENT_STATUS_RECOMMENDED.length > 0) {
        $.each(obj.CURRENT_STATUS_RECOMMENDED, function(idx, statusData) {
            let status = statusData.BILLING_STATUS || "Bench";
            let sowStatus = (statusData.SOW_STATUS || "").toLowerCase();
            let sColor = "#e9ecef"; // Default grey
            let sStart = parseRecommendedModalDateStr(statusData.AVAILABLE_FROM);
            let sEnd = (statusData.AVAILABLE_TO && statusData.AVAILABLE_TO !== "-") ? parseRecommendedModalDateStr(statusData.AVAILABLE_TO) : dEnd;
            
            let hasValidIntersection = !(dStart && dEnd);
            if (dStart && dEnd && sStart && sEnd) {
                let start = new Date(Math.max(sStart, dStart));
                let end = new Date(Math.min(sEnd, dEnd));
                if (start <= end) {
                    hasValidIntersection = true;
                    if (status === "Bench" || status === "Investment") {
                        intervalsAll.push({start, end});
                        if (status === "Bench") intervalsBench.push({start, end});
                        if (status === "Investment") intervalsInvest.push({start, end});
                    }
                }
            }

            if (!hasValidIntersection) {
                return true;
            }

            if (displayedStatuses.length === 0) primaryStatus = status;
            displayedStatuses.push(status);
            
            // Only add to filterable arrays if intersection is valid (User Request)
            if (status === "Bench") {
                if (statusData.AVAILABLE_FROM) {
                    benchFrom.push(statusData.AVAILABLE_FROM);
                    benchTo.push(statusData.AVAILABLE_TO || "-");
                }
            } else if (status === "Investment") {
                if (statusData.AVAILABLE_FROM) {
                    investFrom.push(statusData.AVAILABLE_FROM);
                    investTo.push(statusData.AVAILABLE_TO || "-");
                }
            } else {
                if (statusData.AVAILABLE_FROM) billedFrom.push(statusData.AVAILABLE_FROM);
                if (statusData.AVAILABLE_TO) billedTo.push(statusData.AVAILABLE_TO);
            }

            // Mapping based on User request
            if (status === "Billed") {
                sColor = "#a7dab6"; // Billed is Green
            } else if (status === "Investment") {
                if (sowStatus.includes("signed") || sowStatus.includes("renewal")) {
                    sColor = "#ffff7f"; // Yellow for Signed/Renewal Investment
                } else {
                    sColor = "#93C6E7"; // Blue for other Investment
                }
            } else if (status === "Bench") {
                sColor = "#e9ecef"; // Bench is Grey
            } else {
                sColor = "#e9ecef"; // Default Grey
            }

            statusHtml += `<div class="status-pill status-pill-${status.toLowerCase().replace(/[^a-z0-9]/g, '-')}" data-date="${statusData.AVAILABLE_FROM || ''}" style="background: ${sColor}; color: #333; padding: 3px 5px; border-radius: 4px; font-size: 10px; font-weight: 500; margin: 2px 0; display: block; width: 100%; text-align: center; box-sizing: border-box;">${status}</div>`;
            availFromHtml += `<div class="date-block status-pill-${status.toLowerCase().replace(/[^a-z0-9]/g, '-')}" data-date="${statusData.AVAILABLE_FROM || ''}" style="padding: 2px 0; margin: 2px 0; display: block;">${convert(statusData.AVAILABLE_FROM) || "-"}</div>`;
            availToHtml += `<div class="date-block status-pill-${status.toLowerCase().replace(/[^a-z0-9]/g, '-')}" data-date="${statusData.AVAILABLE_FROM || ''}" style="padding: 2px 0; margin: 2px 0; display: block;">${convert(statusData.AVAILABLE_TO) || "-"}</div>`;
        });
    } else {
        statusHtml = `<div class="status-pill status-pill-bench" data-date="${obj.AVAILABLE_FROM || ''}" style="background: #e9ecef; color: #333; padding: 3px 5px; border-radius: 4px; font-size: 10px; font-weight: 500; margin: 2px 0; display: block; width: 100%; text-align: center; box-sizing: border-box;">Bench</div>`;
        availFromHtml = `<div class="date-block status-pill-bench" data-date="${obj.AVAILABLE_FROM || ''}" style="padding: 2px 0; margin: 2px 0; display: block;">${convert(obj.AVAILABLE_FROM) || "-"}</div>`;
        availToHtml = `<div class="date-block status-pill-bench" data-date="${obj.AVAILABLE_FROM || ''}" style="padding: 2px 0; margin: 2px 0; display: block;">${convert(obj.AVAILABLE_TO) || "-"}</div>`;
        
        let sStart = parseRecommendedModalDateStr(obj.AVAILABLE_FROM);
        let sEnd = (obj.AVAILABLE_TO && obj.AVAILABLE_TO !== "-") ? parseRecommendedModalDateStr(obj.AVAILABLE_TO) : null;
        let hasValidIntersection = !(dStart && dEnd);
        
        if (dStart && dEnd && sStart) {
            let endLimit = sEnd ? Math.min(sEnd, dEnd) : dEnd;
            let start = new Date(Math.max(sStart, dStart));
            let end = new Date(endLimit);
            if (start <= end) {
                hasValidIntersection = true;
                intervalsAll.push({start, end});
                intervalsBench.push({start, end});
                if (obj.AVAILABLE_FROM) benchFrom.push(obj.AVAILABLE_FROM);
            }
        }
        if (!hasValidIntersection) {
            return;
        }
        displayedStatuses.push("Bench");
        if (obj.AVAILABLE_TO) benchTo.push(obj.AVAILABLE_TO);
    }

    if (displayedStatuses.length === 0) {
      return;
    }
    
    let daysBench = getIntersectionDays(intervalsBench);
    let daysInvest = getIntersectionDays(intervalsInvest);
    let daysAll = Math.max(daysBench, daysInvest);
    let personaPriority = getRecommendationPersonaPriority(obj.SUPPLY_PERSONA, personaPriorityLookup);
    let personaLevel = getRecommendationPersonaLevel(obj.SUPPLY_PERSONA);
    let personaSortName = getRecommendationPersonaSortName(obj.SUPPLY_PERSONA);
    
    benchFrom.sort(); investFrom.sort(); billedFrom.sort();
    benchTo.sort(); investTo.sort(); billedTo.sort();

    firstAvailFrom = benchFrom[0] || investFrom[0] || billedFrom[0] || "9999-99-99";
    firstAvailTo = benchTo[0] || investTo[0] || billedTo[0] || "9999-99-99";

    availFromHtml = `<span style="display:none">${firstAvailFrom}</span>` + availFromHtml;
    availToHtml = `<span style="display:none">${firstAvailTo}</span>` + availToHtml;

    let skills = (obj.SKILLS_LEVEL || "").split(",");
    let skillHtml = "";
    let skillCount = 0;
    $.each(skills, function (j, skillData) {
      skillData = skillData.trim();
      if (skillData != "" && skillData != "-") {
        skillHtml += `<div class="skill_block">${skillData}</div>`;
        skillCount++;
      }
    });
    
    let finalSkillHtml = "-";
    if (skillCount > 0) {
        finalSkillHtml = `
          <div class="skill_container">
            <button class="skill_count">${skillCount}</button>
            <div class="skills_tooltip">
              <div class="skills_wrapper">${skillHtml}</div>
            </div>
          </div>
        `;
    }

    let prevSOW = obj.PREVIOUS_SOW_NAME && obj.PREVIOUS_SOW_NAME !== "-" ? obj.PREVIOUS_SOW_NAME.split(",") : [];
    let prevSowCount = prevSOW.length;
    let prevSowHtml = "";
    if (prevSowCount > 0) {
      $.each(prevSOW, function (j, prevSowData) {
        prevSowData = prevSowData.trim();
        if (prevSowData !== "") {
          prevSowHtml += `<div class="skill_block">${prevSowData}</div>`;
        }
      });
    } else {
      prevSowHtml = `<div class="skill_block">-</div>`;
    }
    let finalPrevSowHtml = `
      <div class="skill_container">
        <button class="skill_count">${prevSowCount}</button>
        <div class="skills_tooltip">
          <div class="skills_wrapper">${prevSowHtml}</div>
        </div>
      </div>
    `;

    let currentSOW = obj.CURRENT_SOW_NAME || [];
    let currentSoweachHtml = "";
    if (currentSOW.length > 0) {
      $.each(currentSOW, function (j, curSowData) {
        let sowStatus = (curSowData.SOW_STATUS || "").toLowerCase();
        let billingStatus = curSowData.BILLING_STATUS || "";
        let bgColor = "#e9ecef";
        if (billingStatus === "Billed") {
            bgColor = "#a7dab6";
        } else if (billingStatus === "Investment") {
            bgColor = (sowStatus.includes("signed") || sowStatus.includes("renewal")) ? "#ffff7f" : "#93C6E7";
        }
        currentSoweachHtml += `
          <div class="skill_block sow_link tooltip-container" style="background: ${bgColor};" onclick='sowAccDetails("${curSowData.UNIQUE_ID}", "${curSowData.SOW_ID}")'>
            ${curSowData.SOW_NAME}
            <div class="custom-tooltip-alloc">End Date: ${convert(curSowData.ALLOCATION_END_DATE) || "Not Available"}</div>
          </div>`;
      });
    } else {
      currentSoweachHtml = `<div class="no_sow">-</div>`;
    }

    let overlapSOW = obj.OVERLAP_SOW_NAME || [];
    let overlapSOWeachHtml = "";
    if (overlapSOW.length > 0) {
      $.each(overlapSOW, function (j, overlapSOWData) {
        let sowStatus = (overlapSOWData.SOW_STATUS || "").toLowerCase();
        let billingStatus = overlapSOWData.BILLING_STATUS || "";
        let bgColor = "#e9ecef";
        if (billingStatus === "Billed") {
            bgColor = "#a7dab6";
        } else if (billingStatus === "Investment") {
            bgColor = (sowStatus.includes("signed") || sowStatus.includes("renewal")) ? "#ffff7f" : "#93C6E7";
        }
        overlapSOWeachHtml += `
          <div class="skill_block sow_link tooltip-container" style="background: ${bgColor};" onclick='sowAccDetails("${overlapSOWData.UNIQUE_ID}", "${overlapSOWData.SOW_ID}")'>
            ${overlapSOWData.SOW_NAME}
            <div class="custom-tooltip-alloc">End Date: ${convert(overlapSOWData.ALLOCATION_END_DATE) || "Not Available"}</div>
          </div>`;
      });
    } else {
      overlapSOWeachHtml = `<div class="no_sow">-</div>`;
    }

    let allStatuses = displayedStatuses;

    recom_res_data += `<tr id="${id}_${obj.EMPLOYEE_ID}" data-department="${obj.DEPARTMENT || obj.BUSINESS_UNIT || ''}" data-persona="${obj.SUPPLY_PERSONA || ''}" data-status="${allStatuses.join(' ')}" data-bench-dates="${benchFrom.join(' ')}" data-invest-dates="${investFrom.join(' ')}" data-days-all="${daysAll}" data-days-bench="${daysBench}" data-days-invest="${daysInvest}" data-persona-priority="${personaPriority}">
                        <td><input type='radio' id='team_${obj.EMPLOYEE_ID}' value='${obj.EMPLOYEE_ID},${obj.AVAILABLE_FROM || ''},${obj.AVAILABLE_TO || ''}' onclick='getRecomSelTeamId()' name='recommend_team_selected'></td>
                        <td>${obj.EMPLOYEE_ID}</td>
                        <td class='${obj.FINAL_SCORE < 0 ? "recommended_no" : obj.FINAL_SCORE > 0 ? "recommended_yes" : ""}'>${obj.EMPLOYEE_NAME}</td>
                        <td>${obj.JOB_ROLE}</td>
                        <td style="text-align: center;">${statusHtml}</td>
                        <td style="text-align: center;" data-order="${firstAvailFrom || ''}">${availFromHtml}</td>
                        <td style="text-align: center;" data-order="${firstAvailTo || ''}">${availToHtml}</td>
                        <td class="days-cell" style="text-align: center;" data-order="${daysAll}">${daysAll}</td>
                        <td>${obj.SUPPLY_PERSONA}</td>
                        <td>${finalSkillHtml}</td>
                        <td>${prevSowCount > 0 ? finalPrevSowHtml : "-"}</td>
                        <td>${currentSoweachHtml}</td>
                        <td>${overlapSOWeachHtml}</td>
                        <td class="recommendation-persona-priority" style="display:none">${personaPriority}</td>
                        <td class="recommendation-days-sort" style="display:none" data-order="${daysAll}">${daysAll}</td>
                        <td class="recommendation-persona-level" style="display:none">${personaLevel}</td>
                        <td class="recommendation-persona-sort-name" style="display:none">${personaSortName}</td>
                      </tr>`;
  });


  $("#recommend_team_data").append(recom_res_data);

  if (!$.fn.dataTable.ext.order["recom-dom-text"]) {
    $.fn.dataTable.ext.order["recom-dom-text"] = function(settings, col) {
      return this.api().column(col, { order: "index" }).nodes().map(function(td) {
        let $td = $(td);
        let dataOrder = $td.attr("data-order");
        if (typeof dataOrder !== "undefined") {
          return String(dataOrder).trim().toLowerCase();
        }

        let $visibleStatus = $td.find(".status-pill:visible, .date-block:visible, .skill_count:visible, .skill_block.sow_link:visible");
        if ($visibleStatus.length) {
          return $visibleStatus
            .map(function() {
              return $(this).clone().children().remove().end().text().trim().toLowerCase();
            })
            .get()
            .join(" ");
        }

        return $td.clone().children().remove().end().text().trim().toLowerCase();
      });
    };
  }

  if (!$.fn.dataTable.ext.order["recom-dom-num"]) {
    $.fn.dataTable.ext.order["recom-dom-num"] = function(settings, col) {
      return this.api().column(col, { order: "index" }).nodes().map(function(td) {
        let $td = $(td);
        let dataOrder = $td.attr("data-order");
        let rawValue = typeof dataOrder !== "undefined" ? dataOrder : $td.text();
        let cleanedValue = String(rawValue).replace(/[^0-9.-]/g, "");
        let parsedValue = parseFloat(cleanedValue);
        return Number.isNaN(parsedValue) ? -Infinity : parsedValue;
      });
    };
  }

  function getRecommendedSowEndDateISO() {
    let billing_end_date = $("#billing_end_date").val();
    let sowEndDateISO = "";

    if (billing_end_date) {
      let parts = billing_end_date.split("-");
      if (parts.length === 3) {
        let year = parts[2].length === 2 ? "20" + parts[2] : parts[2];
        sowEndDateISO = `${year}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
      }
    }

    return sowEndDateISO;
  }

  function syncRecommendedTableRows(rows) {
    let isBenchChecked = $("#filter_bench").is(":checked");
    let isInvestmentChecked = $("#filter_investment").is(":checked");
    let sowEndDateISO = getRecommendedSowEndDateISO();

    $(rows).each(function() {
      let row = $(this);
      row.find(".status-pill, .date-block").hide();

      let displayedDays = parseInt(row.attr("data-days-all") || 0, 10);
      if (isBenchChecked && isInvestmentChecked) displayedDays = parseInt(row.attr("data-days-all") || 0, 10);
      else if (isBenchChecked) displayedDays = parseInt(row.attr("data-days-bench") || 0, 10);
      else if (isInvestmentChecked) displayedDays = parseInt(row.attr("data-days-invest") || 0, 10);

      row.find(".days-cell").attr("data-order", displayedDays).text(displayedDays);
      row.find(".recommendation-days-sort").attr("data-order", displayedDays).text(displayedDays);

      if (isBenchChecked) {
        row.find(".status-pill-bench, .date-block.status-pill-bench").each(function() {
          let d = $(this).attr("data-date");
          if (!sowEndDateISO || !d || d <= sowEndDateISO) $(this).show();
        });
      }
      if (isInvestmentChecked) {
        row.find(".status-pill-investment, .date-block.status-pill-investment").each(function() {
          let d = $(this).attr("data-date");
          if (!sowEndDateISO || !d || d <= sowEndDateISO) $(this).show();
        });
      }
      if (!isBenchChecked && !isInvestmentChecked) {
        row.find(".status-pill, .date-block").show();
      }
    });
  }

  function setRecommendationFixedOrder(tableInstance, enabled) {
    if (tableInstance.order && tableInstance.order.fixed) {
      tableInstance.order.fixed(enabled ? { pre: [[13, "asc"], [7, "desc"], [16, "asc"], [15, "desc"], [8, "asc"]] } : { pre: [] });
    }
  }

  function applyRecommendationDefaultOrder(tableInstance) {
    syncRecommendedTableRows(tableInstance.rows().nodes());
    tableInstance.rows().invalidate("dom");
    setRecommendationFixedOrder(tableInstance, true);
    tableInstance.order([[2, "asc"]]).draw();
  }

  function resetRecommendedModalScroll() {
    let modalBody = $("#recommTeam .recommend_data");
    modalBody.scrollTop(0);

    if (modalBody.length && modalBody[0]) {
      modalBody[0].scrollTop = 0;
    }
  }

  syncRecommendedTableRows($("#recommend_team_data tr"));
  $("#recom_search").val("");

  let table = $("#recommended_table").DataTable({
    pageLength: 25,
    orderFixed: { pre: [[13, "asc"], [7, "desc"], [16, "asc"], [15, "desc"], [8, "asc"]] },
    order: [[2, "asc"]],
    dom: 'lrtip', 
    preDrawCallback: function() {
        syncRecommendedTableRows(this.api().rows().nodes());
    },
    initComplete: function() {
        let lengthMenu = $("#recommended_table_length").detach().appendTo("#recom_length_placeholder");
        lengthMenu.find("label").css({
            "display": "flex",
            "align-items": "center",
            "gap": "5px",
            "margin-bottom": "0",
            "font-weight": "500",
            "font-size": "12px",
            "color": "#333"
        });

        lengthMenu.find("select").addClass("form-control").css({
            "width": "65px",
            "height": "32px",
            "padding": "0 5px",
            "font-size": "12px",
            "border-radius": "8px",
            "display": "inline-block",
            "margin": "0 2px"
        });

        resetRecommendedModalScroll();
    },
    drawCallback: function() {
        syncRecommendedTableRows(this.api().rows({ page: "current" }).nodes());
        resetRecommendedModalScroll();
    },
    columnDefs: [
      {
        targets: 0,
        orderable: false,
      },
      {
        targets: [2, 3, 4, 11, 12],
        orderDataType: "recom-dom-text",
        type: "string"
      },
      {
        targets: [8],
        orderDataType: "recom-dom-text",
        type: "string",
        className: "persona_width"
      },
      {
        targets: [1, 7, 9, 10],
        orderDataType: "recom-dom-num",
        type: "num"
      },
      {
        targets: [5, 6],
        orderDataType: "recom-dom-text",
        type: "string"
      },
      {
        targets: [13],
        visible: false,
        searchable: false,
        type: "num"
      },
      {
        targets: [14],
        visible: false,
        searchable: false,
        orderDataType: "recom-dom-num",
        type: "num"
      },
      {
        targets: [15],
        visible: false,
        searchable: false,
        type: "num"
      },
      {
        targets: [16],
        visible: false,
        searchable: false,
        type: "string"
      }
    ],
  });

  $("#recommended_table thead th").css({
      "background-color": "#e5e5e5",
      "color": "#333",
      "font-weight": "600",
      "font-size": "12px",
      "border": "1px solid #ddd",
      "padding": "10px",
      "text-align": "center"
  });

  $("#recommended_table thead")
    .off("mousedown.recommendationSort")
    .on("mousedown.recommendationSort", "th", function() {
      setRecommendationFixedOrder(table, false);
    });

  $("#recom_search").off("keyup.recommendation").on("keyup.recommendation", function() {
    table.search(this.value);
    syncRecommendedTableRows(table.rows().nodes());
    applyRecommendationDefaultOrder(table);
  });

  $.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter(fn => fn.name !== "recomTableFilter");

  const recomTableFilter = function(settings, data, dataIndex) {
    if (settings.nTable.id !== "recommended_table") return true;

    let isBenchChecked = $("#filter_bench").is(":checked");
    let isInvestmentChecked = $("#filter_investment").is(":checked");
    let selectedDepts = $("#filter_department").val() || [];
    let selectedPersonas = $("#filter_persona").val() || [];
    let billing_end_date = $("#billing_end_date").val();
    let sowEndDateISO = "";

    if (billing_end_date) {
        let parts = billing_end_date.split('-');
        if (parts.length === 3) {
            let year = parts[2].length === 2 ? "20" + parts[2] : parts[2];
            sowEndDateISO = `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
    }
    
    let row = $(table.row(dataIndex).node());
    let dept = row.attr("data-department");
    let persona = row.attr("data-persona");
    let normalizedPersona = normalizeRecommendationValue(persona);
    
    let benchDates = (row.attr("data-bench-dates") || "").split(" ").filter(Boolean);
    let investDates = (row.attr("data-invest-dates") || "").split(" ").filter(Boolean);
    
    let hasValidBench = benchDates.some(d => !sowEndDateISO || d <= sowEndDateISO);
    let hasValidInvest = investDates.some(d => !sowEndDateISO || d <= sowEndDateISO);

    let statusMatch = true;
    if (isBenchChecked || isInvestmentChecked) {
        statusMatch = false;
        if (isBenchChecked && hasValidBench) statusMatch = true;
        if (isInvestmentChecked && hasValidInvest) statusMatch = true;
    }

    let deptMatch = true;
    if (selectedDepts.length > 0 && !selectedDepts.includes(dept)) deptMatch = false;

    let personaMatch = true;
    if (selectedPersonas.length > 0) {
        personaMatch = selectedPersonas.some(function(selectedPersonaGroup) {
            if (selectedPersonaGroup === "Others") {
                return normalizedPersona && !personaFilterData.configuredExactPersonas[normalizedPersona];
            }

            return !!(personaFilterData.groups[selectedPersonaGroup] &&
                personaFilterData.groups[selectedPersonaGroup][normalizedPersona]);
        });
    }

    return statusMatch && deptMatch && personaMatch;
  };

  $.fn.dataTable.ext.search.push(recomTableFilter);
  table.draw();

  $(".recom-filter-checkbox, #filter_department, #filter_persona").off("change.recommendation").on("change.recommendation", function() {
    applyRecommendationDefaultOrder(table);
  });

  $("#team_" + selectedusrId).prop("checked", true);
  finalizeRecommendedModalLoading();
  $(".recom-filter-container").removeClass("hidden");
  $("#recommended_table_wrapper, #recommended_table").show();
};

/**
 * recommend table data display
 * @param {*} data
 */
function sowAccDetails(uniqueId, sowid) {
  console.log("uniqueId", uniqueId);
  console.log("sowid", sowid);
  let uniqId_sowid = uniqueId + "&" + sowid;
  window.open("sow.html?" + uniqId_sowid, "_blank");
}
async function getRecommendationData(rec) {
  let apiURL = apiValue.url_ip + ":5005/recommendations";

  // Parse the incoming `rec` to extract the relevant fields
  let parsedRec = JSON.parse(rec);
  if (Array.isArray(parsedRec)) parsedRec = parsedRec[0]; // Ensure we have the object if it's wrapped in an array
  // Construct the `DEMAND_DATA` array
  let demandData = [
    {
      SOW_ID: parsedRec.SOW_ID,
      UNIQUE_ID: parsedRec.UNIQUE_ID,
      SOW_NAME: parsedRec.SOW_NAME,
      ACCOUNT_ID: parsedRec.ACCOUNT_ID,
      ACCOUNT_NAME: parsedRec.ACCOUNT_NAME,
      SOW_TYPE: parsedRec.SOW_TYPE,
      SOW_STATUS: parsedRec.SOW_STATUS,
      PROBABILITY: parsedRec.PROBABILITY,
      LEGAL_START_DATE: parsedRec.LEGAL_START_DATE,
      LEGAL_END_DATE: parsedRec.LEGAL_END_DATE,
      ACTUAL_START_DATE: parsedRec.ACTUAL_START_DATE,
      ACTUAL_END_DATE: parsedRec.ACTUAL_END_DATE,
      DEMAND_START_DATE: parsedRec.DEMAND_START_DATE || parsedRec.LEGAL_START_DATE || parsedRec.ACTUAL_START_DATE,
      DEMAND_END_DATE: parsedRec.DEMAND_END_DATE || parsedRec.LEGAL_END_DATE || parsedRec.ACTUAL_END_DATE,
      RESOURCE_GROUP: parsedRec.RESOURCE_GROUP,
      LOCATION: parsedRec.LOCATION,
      SKILLS_PERSONA: parsedRec.REQUIRED_PERSONA || parsedRec.SKILLS_PERSONA,
      SKILLS_DATA: parsedRec.REQUIRED_SKILLS || parsedRec.SKILLS_DATA,
      SUB_RES_GROUP: parsedRec.SUB_RES_GROUP,
      BILLING_MODE: parsedRec.BILLING_MODE,
    },
  ];

  // Construct the final form_details object
  let form_details = {
    environment: apiValue.environment,
    DEMAND_DATA: demandData,
    RECOMMENDATIONS_ONLY: "YES",
  };

  let response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form_details),
  });

  const result = await response.json();
  return result;
}

async function getRecommendUserData(obj, type) {
  try {
    console.log("type - ", type);
    let data_id = $(obj).attr("data-id");
    let getJsonData = $(obj).attr("data-id1");
    let getAllResData = $(obj).attr("data-id2");
    let getPersonaData = $(obj).attr("data-persona-data");
    $("#recommend_team_data").empty();
    $("#loading_div").show();
    hideRecommendedModalError();
    $(".recom-filter-container").addClass("hidden");
    $("#recommended_table_wrapper, #recommended_table").hide();
    $("#recommend_btn").attr("disabled", true);
    let recomData = [];
    let recomApiData = [];
    let personaData = {};
    id = $(obj).attr("id");
    id_count = id.replace("res_recommend_data_", "");
    if (
      getJsonData == "[]" ||
      getJsonData == "undefined" ||
      getJsonData == null
    ) {
      recomApiData = await getRecommendationData(getAllResData);
      if (recomApiData.length > 0) {
        personaData = recomApiData[0].PERSONA_DATA || {};
        recomData = recomApiData[0].RECOMMENDATIONS || [];
      }
      $("#" + id).attr("data-id1", JSON.stringify(recomData));
      $("#" + id).attr("data-persona-data", JSON.stringify(personaData));
      getJsonData = $(obj).attr("data-id1");
    } else {
      recomData = JSON.parse(getJsonData);
      if (getPersonaData && getPersonaData !== "undefined") {
        personaData = JSON.parse(getPersonaData);
      }
    }

    let selectedusrId = $("#avi_emp_id_" + id_count).html();

    if (type == "existing") {
      selectedusrId = $("#current_emp_id_" + id_count).html();
    }
    console.log("selectedusrId", selectedusrId);
    for (let i = 0; i < recomData.length; i++) {
      if (recomData[i].RECOMMENDED === "YES") {
        selectedusrId = recomData[i].EMPLOYEE_ID;
        break;
      } else {
        if (selectedusrId != "-" || selectedusrId != "" || selectedusrId != " ") {
          selectedusrId = selectedusrId;
        } else {
          selectedusrId = "-";
        }
      }
    }
    data_id = JSON.parse(data_id);
    let demandInfo = JSON.parse(getAllResData);
    let demandPersona = getRecommendationDemandPersona(demandInfo);
    console.log("[Debug] Raw Demand Info:", demandInfo);
    
    let dStart = demandInfo.DEMAND_START_DATE || demandInfo.LEGAL_START_DATE || demandInfo.ACTUAL_START_DATE;
    let dEnd = demandInfo.DEMAND_END_DATE || demandInfo.LEGAL_END_DATE || demandInfo.ACTUAL_END_DATE;
    
    if (!dStart && Array.isArray(demandInfo) && demandInfo.length > 0) {
        dStart = demandInfo[0].DEMAND_START_DATE || demandInfo[0].LEGAL_START_DATE || demandInfo[0].ACTUAL_START_DATE;
        dEnd = demandInfo[0].DEMAND_END_DATE || demandInfo[0].LEGAL_END_DATE || demandInfo[0].ACTUAL_END_DATE;
    }

    setRecommendedTeamModalLoadingTitle(dStart, dEnd);
    getResModalData(recomData, selectedusrId, dStart, dEnd, personaData, demandPersona);
    $("#recommend_btn").attr("data-id2", JSON.stringify(recomData));
    $("#recommend_btn").attr("data-id", id_count);
    $("#recommend_btn").attr("data-row-data", getAllResData);
    $("#recommend_btn").attr("data-id3", type);
  } catch (error) {
    console.error("Failed to load recommended team members:", error);
    finalizeRecommendedModalLoading();
    $(".recom-filter-container").addClass("hidden");
    $("#recommended_table_wrapper, #recommended_table").hide();
    showRecommendedModalError(
      `Unable to load recommended team members. ${error && error.message ? error.message : "Check console for the exact error."}`
    );
    return;
  }

  try {
    let checkDuplicateNames = checkDuplicateNamesInResource();
    allocateTeam();
  } catch (error) {
    console.error("Recommended popup follow-up refresh failed:", error);
  }
}

function autoSelectRecomUser(selected_team_id, id_count) {
  if (selected_team_id != undefined) {
    let emp_data = getAvailableEmpData.filter(
      (emp) => emp.EMPLOYEE_ID == selected_team_id,
    );
    let recomndation_status = recommResModelUser.filter(
      (emp_data) => emp_data.EMPLOYEE_ID == selected_team_id,
    );
    if (selected_team_id == "-") {
      let temp_recomndation_status = recommResModelUser.filter(
        (emp_data) => emp_data.RECOMMENDED == "YES",
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
        "#avi_res_demand_start_date_" + id_count,
      ).text();
      let demand_end_date = $("#avi_res_demand_end_date_" + id_count).text();
      if (demand_start_date != "-") {
        if (new Date(all_start_date) >= new Date(demand_start_date)) {
          $("#current_start_date_" + id_count + "_input").val(
            convert(all_start_date),
          );
        } else {
          $("#current_start_date_" + id_count + "_input").val(
            demand_start_date,
          );
        }
      } else {
        $("#current_start_date_" + id_count + "_input").val(
          convert(all_start_date),
        );
      }

      if (demand_end_date != "-") {
        if (new Date(all_end_date) >= new Date(demand_end_date)) {
          $("#current_end_date_" + id_count + "_input").val(
            convert(all_end_date),
          );
          $("#current_end_date_" + id_count + "_input").attr(
            "data-id-2",
            convert(all_end_date),
          );
        } else {
          $("#current_end_date_" + id_count + "_input").val(demand_end_date);
          $("#current_end_date_" + id_count + "_input").attr(
            "data-id-2",
            convert(demand_end_date),
          );
        }
      } else {
        $("#current_end_date_" + id_count + "_input").val(
          convert(all_end_date),
        );
        $("#current_end_date_" + id_count + "_input").attr(
          "data-id-2",
          convert(all_end_date),
        );
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
        sel_emp.EMPLOYEE_NAME,
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
      applyDefaultAllocationDates(id_count, sel_emp);
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
    if (id === "-") {
      return; // Skip the row if EMPLOYEE_ID is '-'
    }

    let name =
      $(this).find(".current_emp_name").html() ||
      $(this).find(".emp_name_option_selected option:selected").text();
    let startDate = $(this).find(".currentNewStartDate").val();
    let endDate = $(this).find(".currentNewEndDate").val();
    let oldStartDate =
      $(this).find(".current_emp_old_start_date").text() ||
      convertDates($(this).find(".current_emp_ava_from_date").html());
    let oldEndDate =
      $(this).find(".current_emp_old_end_date").text() ||
      convertDates($(this).find(".current_emp_ava_to_date").html());
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
          (newStartDate >= existingStartDate &&
            newStartDate <= existingEndDate) ||
          (newEndDate >= existingStartDate && newEndDate <= existingEndDate) ||
          (newStartDate <= existingStartDate && newEndDate >= existingEndDate)
        ) {
          duplicateWarnings.push({
            name: name,
            designation: desg,
            overlapDates: `From ${convertNewDates(existingStartDate)} to ${convertNewDates(existingEndDate)}`,
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
      OPERATION: determineOperation(
        new Date(oldEndDate),
        newEndDate,
        oldStartDate,
      ),
      RESOURCE_GROUP: resourcegroup,
      SUB_RES_GROUP: subresourcegrp,
    });
  });

  let data1 = JSON.stringify(newAvailableResData);

  if (duplicateWarnings.length > 0) {
    displayWarnings(duplicateWarnings, moduleCheck);
    $("#update_resource_data").prop("disabled", true);
    return false;
  }

  $("#update_resource_data").prop("disabled", false);
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
  let warningHtml = warnings
    .map(
      (warning) => `
    <p><strong>Name:</strong> ${warning.name}</p>
    <p><strong>Designation:</strong> ${warning.designation}</p>
    <p><strong>Overlapping Dates:</strong> ${warning.overlapDates}</p>
    <hr>
  `,
    )
    .join("");

  $("#duplicateWarningModalBody").html(warningHtml);
  if (
    moduleCheck === "sow_end_date" ||
    moduleCheck === "sow_start_date" ||
    moduleCheck === "billing_date"
  ) {
    $("#duplicateWarningModal").modal("hide");
  } else {
    $("#duplicateWarningModal").modal("show");
  }
}
