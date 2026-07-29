let resourceUtilizData = [],
  allResUtilizJson = [],
  indiaResUtilizJson = [],
  usResUtilizJson = [],
  accManagerData = [],
  managerData = [],
  accountData = []; // Store fetched data
let firstSelection = null; // Track if user first selects account or manager
// Store selected values before API refresh
let selectedAccount = "-1";
let selectedManager = "-1";
let selectedYears = [];

function syncLocationSelection(loc) {
  const locationToRadioId = {
    All: "#ALL",
    India: "#IND",
    US: "#US",
  };

  $("input[type='radio'][name='emp_radio']").prop("checked", false);
  $(locationToRadioId[loc]).prop("checked", true);
}

function getCurrentFilterSelections() {
  return {
    account: $("#account_data").val() || selectedAccount || "-1",
    manager: $("#manager_data").val() || selectedManager || "-1",
  };
}

$(document).ready(function () {
  assignMetaValue();
  $("meta[name='google-signin-client_id']").attr("content", metaValue);
  getLocalSessionData();
  if (sessionName == null) {
    window.location.href = "index.html";
    return false;
  } else {
    let accessStatus = checkDashboardPageAccessData();
    if (accessStatus) {
      let accessLevel = checkEachPageAccess("Reports");
      if (accessLevel.length > 0) {
        let environment = accessLevel[0];
        if (environment == apiValue.environment) {
          getResourceUtilization();
          getAccountDeliveryDataJson();
          $(".input-group-addon").hide();
        } else {
          window.location.href = "home.html";
        }
      } else {
        window.location.href = "home.html";
      }
    } else {
      window.location.href = "home.html";
    }
  }
  $(".new-sub-menu").hover(function () {
    $(".sub-menu").css("display", "");
  });
  $("#dashboard").click(function () {
    window.location.href = "home.html";
    return false;
  });
  $("#sow_Res_page").click(function () {
    localStorage.setItem("addRequest", true);
    localStorage.setItem("editRequest", false);
    window.location.href = "sowCreate.html";
    return false;
  });
  $("#userManual").click(function () {
    window.location.href = "RRESOWUserManual.html";
    return false;
  });
  $("#reportsBackBtnCustm").click(function () {
    window.location.href = "reportsDashboard.html";
    return false;
  });
  $("#logout").click(function () {
    localStorage.clear();

    window.location.href = "index.html";
    return false;
  });
});

function toggleLoacation(loc) {
  console.log("loc - ", loc);
  const currentSelections = getCurrentFilterSelections();
  selectedAccount = currentSelections.account;
  selectedManager = currentSelections.manager;
  syncLocationSelection(loc);
  if (loc == "All") {
    getOverallSummaryJson("All", selectedAccount, selectedManager);
  } else if (loc == "India") {
    getOverallSummaryJson("India", selectedAccount, selectedManager);
  } else if (loc == "US") {
    getOverallSummaryJson("US", selectedAccount, selectedManager);
  }

  $("#account_data").val(selectedAccount);
  $("#manager_data").val(selectedManager);
}

function getAccManagerData() {
  let accountSelVal = $('#account_data').val()
  let managerSelVal = $('#manager_data').val()
  console.log("accountSelVal - ", accountSelVal);
  console.log("managerSelVal - ", managerSelVal);
  let selectedVal = "";
  let selected = $("input[type='radio'][name='emp_radio']:checked");
  if (selected.length > 0) {
      selectedVal = selected.val();
  }
  console.log("selectedVal - ", selectedVal);
  getOverallSummaryJson(selectedVal,accountSelVal, managerSelVal);
}

function getResourceUtilization() {
  if (allResUtilizJson.length == 0) {
    syncLocationSelection("India");
    getOverallSummaryJson("India", '-1', '-1');
  }
}

function getSelectedYear() {
  selectedYears = $("#year_select_data").val() || [];
  console.log("selectedYears", selectedYears);

  if (selectedYears.length == 0) {
    $(".report_res_utiliz").hide();
    $(".no_data").show();
  } else {
    $(".report_res_utiliz").show();
    $(".no_data").hide();

    const yearData = resourceUtilizData[0]?.year_data;
    const headerData = resourceUtilizData[0]?.HEADER_MONTHS;
    if (yearData && headerData) {
      $("#report_resource_utiliz").empty();
      $("#report_resource_utiliz_body").empty();
      assignDatatoTable(yearData, selectedYears.join(", "), headerData);
    }
  }

  $("#selected_year").text(selectedYears.join(", "));
}

const getOverallSummaryJson = async (loc, acc, manager) => {
  console.log("loc - ", loc);
  console.log("acc - ", acc);
  console.log("manager - ", manager);
  $(".loader").css("display", "block");
  $(".show_page").css("display", "none");
  $('.report_res_utiliz').hide();
  $('#no_demand_message').hide();
  let form_details = {
    country: loc,
    account_id: acc == '-1' ? '' : acc,
    manager_id: manager == '-1' ? '' : manager
  };

  // const startTime = performance.now();
  try {
    // let response = await fetch('./js/resource_utilization_data_new.json');
    // const result = await response.json();
    let data = await fetch(
      apiValue.url_ip + ":5003/resource_utilization_data_new",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify(form_details),
      }
    );
    // Handle plain text response for "No Demand details"
    const textResult = (await data.text()).trim();
    if (textResult === "No Demand details" || textResult === '"No Demand details"') {
      $(".loader").css("display", "none");
      $(".show_page").css("display", "block");
      $('.report_res_utiliz').hide();
      $('.employee_detail_inside').css("display", "block");
      $('#no_demand_message').show();
      return;
    }
    // Parse as JSON for regular responses
    const result = JSON.parse(textResult);
    if (result.resourceUtilizData && result.resourceUtilizData === "No Demand details") {
      $(".loader").css("display", "none");
      $(".show_page").css("display", "block");
      $('.report_res_utiliz').hide();
      $('.employee_detail_inside').css("display", "block");
      $('#no_demand_message').show();
      return;
    }
    $(".loader").css("display", "none");
    $(".show_page").css("display", "block");
    $('.report_res_utiliz').show();
    $('#no_demand_message').hide();
    // resourceUtilizData = result.resourceUtilizData;
    if(loc == "All") {
      allResUtilizJson = result.resourceUtilizData;
      resourceUtilizData = allResUtilizJson;
    } else if(loc == "India") {
      indiaResUtilizJson = result.resourceUtilizData;
      resourceUtilizData = indiaResUtilizJson;
    } else if(loc == "US") {
      usResUtilizJson = result.resourceUtilizData;
      resourceUtilizData = usResUtilizJson;
    }

    prepareresourceUtilizDatatoUI(resourceUtilizData);
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
    $(".loader").css("display", "none");
    $(".show_page").css("display", "block");
    $('.report_res_utiliz').show();
    // handle error here
  }
};

const getAccountDeliveryDataJson = async () => {
  try {
    // Store current selections before API call
    let response = await fetch(apiValue.url_ip + ":5003/get_managers_account_names", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" }
    });

    let jsonResponse = await response.json();
    accManagerData = jsonResponse[0];

    accountData = accManagerData.ACCOUNT_LEVEL;
    managerData = accManagerData.MANAGER_LEVEL;

    populateDropdowns(); // Populate dropdowns after API call

  } catch (error) {
    console.error("Error fetching account data:", error);
  }
};

// Populate Account & Manager dropdowns
const populateDropdowns = () => {
  let accountDropdown = $("#account_data");
  let managerDropdown = $("#manager_data");

  accountDropdown.empty().append('<option value="-1" selected>Select Account</option>');
  managerDropdown.empty().append('<option value="-1" selected>Select Manager</option>');

  accountData.forEach(account => {
    accountDropdown.append(`<option value="${account.account_id}">${account.account_name}</option>`);
  });

  managerData.forEach(manager => {
    managerDropdown.append(`<option value="${manager.manager_id}">${manager.manager_name}</option>`);
  });

  // Reapply previously selected values
  accountDropdown.val(selectedAccount);
  managerDropdown.val(selectedManager);

  accountDropdown.off("change").on("change", handleAccountSelection);
  managerDropdown.off("change").on("change", handleManagerSelection);
};

// Handle Account Selection
const handleAccountSelection = () => {
  selectedAccount = $("#account_data").val(); // Store selected value
  console.log("firstSelection Acc  1st - ", firstSelection);
  if (!firstSelection) firstSelection = "account";

  if (selectedAccount === "-1" && selectedManager === "-1") {
    firstSelection = null; // Reset tracking
    getAccountDeliveryDataJson(); // Refresh API
  } else {
    if (firstSelection === "account") {
      let selectedManagers = accountData.find(acc => acc.account_id === selectedAccount)?.manager_details || [];
      updateManagerDropdown(selectedManagers);
    }
    console.log('Manager sel - ', $("#manager_data").val())
    if ($("#manager_data").val() === "-1") {
      selectedManager = "-1"; // Reset selected manager if account changes
    }
  }
  console.log("firstSelection Acc last - ", firstSelection);
};

// Handle Manager Selection
const handleManagerSelection = () => {
  selectedManager = $("#manager_data").val(); // Store selected value
  if (!firstSelection) firstSelection = "manager";

  if (selectedManager === "-1" && selectedAccount === "-1") {
    firstSelection = null; // Reset tracking
    getAccountDeliveryDataJson(); // Refresh API
  } else {
    if (firstSelection === "manager") {
      let selectedAccounts = managerData.find(mgr => mgr.manager_id === selectedManager)?.account_details || [];
      updateAccountDropdown(selectedAccounts);
    }
    if ($("#account_data").val() === "-1") {
      selectedAccount = "-1"; // Reset selected account if manager changes
    }
  }
};

// Update Account Dropdown
const updateAccountDropdown = (filteredAccounts) => {
  let accountDropdown = $("#account_data");
  accountDropdown.empty().append('<option value="-1">Select Account</option>');

  filteredAccounts.forEach(account => {
    accountDropdown.append(`<option value="${account.account_id}">${account.account_name}</option>`);
  });

  accountDropdown.val(selectedAccount); // Retain selected value
};

// Update Manager Dropdown
const updateManagerDropdown = (filteredManagers) => {
  let managerDropdown = $("#manager_data");
  managerDropdown.empty().append('<option value="-1">Select Manager</option>');

  filteredManagers.forEach(manager => {
    managerDropdown.append(`<option value="${manager.manager_id}">${manager.manager_name}</option>`);
  });

  managerDropdown.val(selectedManager); // Retain selected value
};

function prepareresourceUtilizDatatoUI(resourceUtilizData) {
  $("#report_resource_utiliz").empty();
  $("#report_last_diff").empty();
  $("#report_resource_utiliz_body").empty();
  
  $("#year_select_data").empty();
  let yearArr = resourceUtilizData[0]?.year;
  if (!yearArr || !Array.isArray(yearArr)) {
    console.error("Invalid year data structure");
    return;
  }
  
  yearArr.map((yr, index) => {
    $("#year_select_data").append(`<option value="${yr}">${yr}</option>`);
  });
  const d = new Date();
  let year = d.getFullYear();
  const availableYears = yearArr.map(String);
  const defaultSelectedYears = selectedYears.length > 0
    ? selectedYears.map(String).filter((selectedYear) => availableYears.includes(selectedYear))
    : availableYears.includes(String(year))
      ? [String(year)]
      : availableYears.length > 0
        ? [availableYears[0]]
        : [];

  selectedYears = defaultSelectedYears;
  $("#year_select_data").val(defaultSelectedYears);
  $("#year_select_data").multiselect({
    columns: 1,
    placeholder: "Year",
    // search: true,
  });
  $("#year_select_data").multiselect("reload");
  let yearData = [],
    headerData = [],
    yearText = "";
  headerData = resourceUtilizData[0]?.HEADER_MONTHS;
  yearData = resourceUtilizData[0]?.year_data;
  yearText = defaultSelectedYears.join(", ");
  $("#selected_year").text(yearText);

  assignDatatoTable(yearData, yearText, headerData);
  getSelectedYear();
  
}

function assignDatatoTable(resUtilizData, selectedYearval, headerData) {
  console.log("resUtilizData:", resUtilizData);
  console.log("selectedYearval:", selectedYearval);
  console.log("headerData:", headerData);
  
  // Check if resUtilizData exists
  if (!resUtilizData || typeof resUtilizData !== 'object') {
    console.error("Invalid or missing data in resUtilizData");
    console.log("resUtilizData structure:", Object.keys(resUtilizData || {}));
    return; // Exit the function if data is invalid
  }

  let resHeaderdata = [],
    headerMnthHtml = "",
    HeaderHtml = "",
    resBodyHtml = "";

  if (Array.isArray(headerData)) {
    resHeaderdata = headerData;
  } else {
    console.error("HEADER_MONTHS is not an array");
    return; // Exit the function if HEADER_MONTHS is invalid
  }

  let AccountHeadermonts = resHeaderdata.filter((head) => {
    const splitHead = head.split("_");
    return selectedYearval.includes(splitHead[splitHead.length - 1]);
  });
  const selectedMonthSet = new Set(AccountHeadermonts);
  let headerLen = AccountHeadermonts.length;
  $.each(AccountHeadermonts, function (i) {
    headerMnthHtml += `<th class='nowarp_header mnth_col year_${
      AccountHeadermonts[i].split("_")[1]
    }'>${AccountHeadermonts[i].replace("_", " ")}</th>`;
  });

  HeaderHtml = `<th class='nowarp_header main_name' colspan='2'>SCENARIO & JOB LEVEL</th>${headerMnthHtml}`;

  $("#report_resource_utiliz").append(HeaderHtml);

  // *******************  TABLE BODY CREATION - ALL SECTIONS *********************
  
  // Process all sections in year_data
  const sections = ['demand_details', 'actual_details', 'demand_profiles', 'scenario_data', 'fulfillment_strategy'];
  
  sections.forEach((sectionKey, sectionIndex) => {
    const section = resUtilizData[sectionKey];
    
    if (!section || typeof section !== 'object') {
      console.warn(`Section "${sectionKey}" is missing or invalid`);
      return;
    }
    
    // Add section header
    const sectionHeaderName = section.header_name || sectionKey.replace('_', ' ').toUpperCase();
    const isDemandSection = sectionIndex === 0;
    resBodyHtml += `<tr class='section-header-row ${isDemandSection ? 'frozen-section-header' : ''}'>
        <td class='section-header' colspan='${headerLen + 2}'>
            <div class='section-header-div'>
                <h4 class='section-title'>${sectionHeaderName}</h4>
            </div>
        </td>
    </tr>`;
    
    // Process subsections within each section
    let subsectionIndex = 0;
    Object.keys(section).forEach((subsectionKey) => {
      if (subsectionKey === 'header_name') return; // Skip header_name as it's already processed
      subsectionIndex++;

      const subsection = section[subsectionKey];
      
      if (!subsection || typeof subsection !== 'object') {
        console.warn(`Invalid subsection "${subsectionKey}" in section "${sectionKey}"`);
        return;
      }
      
      // Check if subsection has required properties
      if (!subsection.header_data) {
        console.warn(`Subsection "${subsectionKey}" missing header_data`);
        return;
      }
      
      if (!subsection.job_level || !Array.isArray(subsection.job_level)) {
        console.warn(`Subsection "${subsectionKey}" missing or invalid job_level array`);
        return;
      }
      
      if (!subsection.month_data || !Array.isArray(subsection.month_data)) {
        console.warn(`Subsection "${subsectionKey}" missing or invalid month_data array`);
        return;
      }
      
      // Create unique identifier for the subsection
      const subsectionIdentifier = `${sectionKey}_${subsectionKey}`;
      const numJobLevels = subsection.job_level.length;
      
      // Generate month data HTML for the subsection header
      let subsectionHeaderHtml = "";
      const filteredSubsectionMonthData = subsection.month_data.filter(
        (monthItem) => monthItem && selectedMonthSet.has(monthItem.month)
      );
      $.each(filteredSubsectionMonthData, function (i) {
        const monthVal = filteredSubsectionMonthData[i].month ? filteredSubsectionMonthData[i].month.split("_")[1] : "";
        subsectionHeaderHtml += `<td class='month-value header_text_color year_${monthVal}'>${filteredSubsectionMonthData[i].value == 0 ? 0 : filteredSubsectionMonthData[i].value}</td>`;
      });
      
      // Subsection Header Row with Expand/Collapse Icon (only if job_level is not empty)
      let expandCollapseHtml = '';
      if (numJobLevels > 0) {
        expandCollapseHtml = ` onclick="toggleScenario('${subsectionIdentifier}', this)"`;
      }
      const isFrozenSubsection = sectionIndex === 0 && subsectionIndex === 1;
      resBodyHtml += `<tr class='collapsed_row_border ${isFrozenSubsection ? 'frozen-demand-subsection' : ''}'>
                <td class='scenario-header' colspan='2'${expandCollapseHtml}>
                    <div class='header_text_div'>
                        <span class='header_text_color'>${subsection.header_data}</span>
                        ${numJobLevels > 0 ? `<i class="fa fa-expand expand-collapse-icon icon_col" data-scenario="${subsectionIdentifier}"></i>` : ''}
                    </div>
                </td>
                ${subsectionHeaderHtml}
            </tr>`;

      // Job Level Rows and Month Data for this subsection
      subsection.job_level.forEach((jobLevel, index) => {
        // Validate jobLevel structure
        if (!jobLevel || typeof jobLevel !== 'object') {
          console.warn(`Invalid jobLevel data at index ${index} in subsection "${subsectionKey}"`);
          return;
        }
        
        if (!jobLevel.job_role) {
          console.warn(`Missing job_role in jobLevel at index ${index} in subsection "${subsectionKey}"`);
          return;
        }
        
        if (!jobLevel.month_data || !Array.isArray(jobLevel.month_data)) {
          console.warn(`Missing or invalid month_data in jobLevel at index ${index} in subsection "${subsectionKey}"`);
          return;
        }
        
        const isFrozenSubsectionLevel = sectionIndex === 0 && subsectionIndex === 1;
        resBodyHtml += `<tr class="job-level-row ${isFrozenSubsectionLevel ? 'frozen-job-level' : ''}" data-scenario="${subsectionIdentifier}">`;

        if (index === 0) {
          resBodyHtml += `<td class='job-level-header' rowspan="${numJobLevels}">${subsection.header_data.includes('TOTAL DEMAND') || subsection.header_data.includes('Forward Demand') || subsection.header_data.includes('Dynamic Base') || subsection.header_data.includes('Demand Spike') ? 'Funnel Stage' : 'Job Level'}</td>`;
        }

        resBodyHtml += `<td class='job-role'>${jobLevel.job_role}</td>`;

        AccountHeadermonts.forEach((monthHeader) => {
          const monthData = jobLevel.month_data.find(
            (md) => md.month === monthHeader
          );
          const value = monthData ? monthData.value : "";
          const monthVal = monthData && monthData.month ? monthData.month.split("_")[1] : "";
          resBodyHtml += `<td class='month-value year_${monthVal}'>${value == 0 ? 0 : value}</td>`;
        });

        resBodyHtml += `</tr>`;
      });
    });
  });

  // ******************* ACCOUNT WISE BREAKUP *********************
  // let accountLevelHeader = `<tr class='collapsed_row_border'><th class="nowarp_header" colspan="${
  //   headerLen + 2
  // }">ACCOUNT WISE BREAKUP</th></tr>`;
  // resBodyHtml += accountLevelHeader;

  if (
    resUtilizData.account_level_data &&
    Array.isArray(resUtilizData.account_level_data)
  ) {
    resUtilizData.account_level_data.forEach(
      (account, accountIndex, accountArray) => {
        // const accountName = account.account_name; // No longer used

        account.account_data.forEach(
          (accountData, accountDataIndex, accountDataArray) => {
            const accountType = accountData.account_type;
            const numJobLevels = accountData.job_level.length;
            let accHeaderHtml = "",
              accHeaderMnth = accountData.month_data.filter(
                (monthItem) => monthItem && selectedMonthSet.has(monthItem.month)
              );
            $.each(accHeaderMnth, function (i) {
              const monthVal = accHeaderMnth[i].month ? accHeaderMnth[i].month.split("_")[1] : "";
              accHeaderHtml += `<td class='month-value header_text_color year_${monthVal}'>${accHeaderMnth[i].value == 0 ? 0 : accHeaderMnth[i].value}</td>`;
            });

            // Create a unique identifier for the account type
            const accountIdentifier = accountType.replace(/[^a-zA-Z0-9]/g, ""); // Remove special characters for safety

            // Apply 'collapsed_row_border' class to the last 'accountData'
            const isLastAccountData =
              accountDataIndex === accountDataArray.length - 1;
            const accountTypeRowClass = isLastAccountData
              ? "account-type collapsed_row_border"
              : "account-type";

            // Account Type Header Row with Expand/Collapse Icon (only if job_level is not empty)
            let expandCollapseHtmlAcc = '';
            if (numJobLevels > 0) {
              expandCollapseHtmlAcc = ` onclick="toggleAccount('${accountIdentifier}', this)"`;
            }
            resBodyHtml += `<tr class='${accountTypeRowClass}'>
                    <td class='account-type account-cursor-pointer' colspan='2'${expandCollapseHtmlAcc}>
                        <div class='header_text_div'>
                                <span class='header_text_color'>${accountType}</span>
                                ${numJobLevels > 0 ? `<i class="fa fa-expand expand-collapse-icon icon_col" data-account="${accountIdentifier}"></i>` : ''}
                        </div>
                    </td>
                    ${accHeaderHtml}
                </tr>`;

            accountData.job_level.forEach((jobLevel, index) => {
              resBodyHtml += `<tr class="account-job-level-row" data-account="${accountIdentifier}">`;

              if (index === 0) {
                resBodyHtml += `<td class='job-level-header' rowspan="${numJobLevels}">Job Level</td>`;
              }

              resBodyHtml += `<td class='job-role'>${jobLevel.job_role}</td>`;

              AccountHeadermonts.forEach((monthHeader) => {
                const monthData = jobLevel.month_data.find(
                  (md) => md.month === monthHeader
                );
                const value = monthData ? monthData.value : "";
                const monthVal = monthData && monthData.month ? monthData.month.split("_")[1] : "";
                resBodyHtml += `<td class='month-value year_${monthVal}'>${value == 0 ? 0 : value}</td>`;
              });

              resBodyHtml += `</tr>`;
            });
          }
        );
      }
    );
  }

  $("#report_resource_utiliz_body").append(resBodyHtml);

  // Initially hide job level rows and account job level rows
  $(".job-level-row").hide();
  $(".account-job-level-row").hide();
  const d = new Date();
  let year = d.getFullYear();
  let shortYr = year.toString().substr(-2);

  // Convert shortYr to a number before adding
  let pastShortYr = Number(shortYr) - 1;
  // $(`.year_${shortYr}`).hide();
  $(`.year_${pastShortYr}`).hide();
}

// Separate function for expand/collapse functionality
function toggleScenario(scenario, headerCell) {
  const icon = $(headerCell).find(".expand-collapse-icon");
  $(`.job-level-row[data-scenario="${scenario}"]`).toggle();

  if (icon.hasClass("fa-expand")) {
    icon.removeClass("fa-expand").addClass("fa-compress");
  } else {
    icon.removeClass("fa-compress").addClass("fa-expand");
  }
}

function toggleAccount(account, headerCell) {
  const icon = $(headerCell).find(".expand-collapse-icon");
  $(`.account-job-level-row[data-account="${account}"]`).toggle();

  if (icon.hasClass("fa-expand")) {
    icon.removeClass("fa-expand").addClass("fa-compress");
  } else {
    icon.removeClass("fa-compress").addClass("fa-expand");
  }
}
