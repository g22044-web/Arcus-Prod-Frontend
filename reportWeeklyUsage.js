let currentFilterOpt = "";
let firstLoadStatus = 0;
let weekly_data = [];
let startDate = "";
let endDate = "";
let isFilterOpen = false;
let selectedTeams = [
  "Delivery Members",
  "Delivery Heads",
  "Growth Team",
  "Finance Team",
];
let hasAutoSelected = false; // Add this flag

// Custom sorting for DataTables to handle "X Minutes"
jQuery.extend(jQuery.fn.dataTableExt.oSort, {
  "minutes-numeric-pre": function (a) {
    // Remove " Minutes" and convert to a number for sorting
    return parseFloat(a.replace(" Minutes", "")) || 0; // Return 0 for non-numeric or empty strings
  },

  "minutes-numeric-asc": function (a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  },

  "minutes-numeric-desc": function (a, b) {
    return a < b ? 1 : a > b ? -1 : 0;
  },
});

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
          $(".input-group-addon").hide();
          setTimeout(function () {
            let currentDate = new Date();
            let endDate = convertDate(currentDate);
            let strDate = convertDate(
              new Date(currentDate.setDate(currentDate.getDate() - 7))
            );
            let today = new Date().toISOString().split("T")[0];
            $("#start_date").datepicker({
              dateFormat: "mm-dd-yyyy",
              changeMonth: true,
              changeYear: true,
              maxDate: new Date(),
            });
            $("#end_date").datepicker({
              dateFormat: "mm-dd-yyyy",
              changeMonth: true,
              changeYear: true,
              maxDate: new Date(),
            });
            $("#end_date").attr("max", today);
            console.log("Start Date: " + strDate);
            console.log("End Date: " + endDate);
            $("#start_date").val(convert(strDate));
            $("#start_date")
              .val(convert(strDate))
              .attr("data-id", convert(strDate));
            $("#end_date")
              .val(convert(endDate))
              .attr("data-id", convert(endDate));

            console.log("start date convert : " + convert(strDate));
            console.log("end date convert : " + convert(endDate));
            assignWeeklyData();
            $("#report_details").addClass("active");
            $("#sow_overall").addClass("active");
            $("#sow_main").addClass("active");
            // Removed: $(".loader").css("display", "none");
            // Removed: $(".show_page").css("display", "block");
          }, 500);
          let userRole = localStorage.getItem("user-role");
          let userEmail = localStorage.getItem("email");
          // if (userEmail != "akhilesh@factspan.com" && userRole != "admin") {
          //   window.location.href = "home.html";
          // }
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

  // Event handlers
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

function convertDateFormat(dateStr) {
  console.log("Converting date format for: " + dateStr);
  if (dateStr.includes("-")) {
    let parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1]}-${parts[2]}`;
    }
    return "Invalid Date Format";
  } else if (dateStr.includes("/")) {
    let parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1]}-${parts[2]}`;
    }
    return "Invalid Date Format";
  }
}

function getWeeklyAPIData() {
  $("#fetch_button").prop("disabled", true).text("Loading...");
  // Ensure these are visible before the AJAX call
  $(".weekly_full_div").hide();
  $(".loader").css("display", "block");

  let getStartDate = $("#start_date").val();
  let getEndDate = $("#end_date").val();
  console.log("Start Date: " + getStartDate);
  console.log("End Date: " + getEndDate);

  if (!getStartDate || !getEndDate) {
    let missingField = !getStartDate ? "Start Date" : "End Date";
    toastr.options.timeOut = 2000;
    toastr.error(`${missingField} should be selected`);
    // Re-show the div and hide loader if there's an error before the API call
    $(".weekly_full_div").show();
    $(".loader").css("display", "none");
    $("#fetch_button").prop("disabled", false).text("Fetch Data");
    return;
  }

  let selectedStartDate = convertDateFormat($("#start_date").val());
  let selectedEndDate = convertDateFormat($("#end_date").val());

  var selectedCountry = $("input[type='radio'][name='emp_radio']:checked");
  selectedCountry = selectedCountry.val();

  let form_details = {
    data: {
      date_range: {
        start_date: selectedStartDate,
        end_date: selectedEndDate,
      },
      region: selectedCountry,
    },
  };

  $.ajax({
    url: apiValue.url_ip + ":5003/fetch_usage_data",
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: true, // Changed async to true (or remove it, as true is default)
    mode: "no-cors",
    data: JSON.stringify(form_details),
    success: function (dataJson) {
      weekly_data = dataJson;
      prepareWeeklyUIData(weekly_data);
      $(".weekly_full_div").show();
      $(".loader").css("display", "none");
      $(".show_page").css("display", "block"); // Show the main page after data is ready
    },
    error: function (error) {
      console.log("message Error" + JSON.stringify(error));
      $(".weekly_full_div").show();
      $(".loader").css("display", "none");
      $(".show_page").css("display", "block"); // Show the main page even on error
    },
    complete: function () {
      $("#fetch_button").prop("disabled", false).text("Fetch Data");
      // Visibility is now handled in success/error callbacks
    },
  });
}

function assignWeeklyData() {
  if (weekly_data.length === 0) {
    getWeeklyAPIData();
  } else {
    prepareWeeklyUIData(weekly_data);
    $(".weekly_full_div").show();
    $(".loader").css("display", "none");
    $(".show_page").css("display", "block"); // Ensure show_page is visible if data is already present
  }
}

function convertDate(date) {
  var yyyy = date.getFullYear().toString(); // Corrected variable name
  var mm = (date.getMonth() + 1).toString();
  var dd = date.getDate().toString();

  var mmChars = mm.split("");
  var ddChars = dd.split("");

  return (
    yyyy + // Used 'yyyy' here
    "-" +
    (mmChars[1] ? mm : "0" + mmChars[0]) +
    "-" +
    (ddChars[1] ? dd : "0" + ddChars[0])
  );
}

function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Dynamic tabs based on API data
const tabs = [
  {
    name: "Employee's Usage",
    content: `
      <div class="employee-usage-container">
        <div class="employee-panel">
          <div class="employee_list_header">EMPLOYEES LIST</div>
          <div class="employee_search_wrapper">
            <input type="text" class="employee_search" placeholder="Search" oninput="filterEmployees()" />
            <span class="search_icon"><img src="images/Search-icon.png"></span>
          </div>
          <ul class="employee_list_ul" id="employeeListUl"></ul>
        </div>
        <div class="details-panel">
          <div class="details-header" id="detailsHeader"></div>
          <div class="usage-table-container">
            <table class="usage-table" id="usageTable"></table>
          </div>
          <div class="key-insights" id="keyInsights"></div>
        </div>
      </div>
    `,
  },
  {
    name: "Overall",
    content: `
      <div class="usage-table-container">
        <table class="usage-table" id="overallUsageTable"></table>
        <div class="key-insights" id="overallKeyInsights"></div>
      </div>
    `,
  },
  {
    name: "Delivery Heads",
    content: `
      <div class="usage-table-container">
        <table class="usage-table" id="deliveryHeadsUsageTable"></table>
        <div class="key-insights" id="deliveryHeadsKeyInsights"></div>
      </div>
    `,
  },
  {
    name: "Delivery Members",
    content: `
      <div class="usage-table-container">
        <table class="usage-table" id="deliveryMembersUsageTable"></table>
        <div class="key-insights" id="deliveryMembersKeyInsights"></div>
      </div>
    `,
  },
  {
    name: "Growth Team",
    content: `
      <div class="usage-table-container">
        <table class="usage-table" id="growthTeamUsageTable"></table>
        <div class="key-insights" id="growthTeamKeyInsights"></div>
      </div>
    `,
  },
  {
    name: "Finance Team",
    content: `
      <div class="usage-table-container">
        <table class="usage-table" id="financeTeamUsageTable"></table>
        <div class="key-insights" id="financeTeamKeyInsights"></div>
      </div>
    `,
  },
  // {
  //   name: "HR Team",
  //   content: `
  //     <div class="usage-table-container">
  //       <table class="usage-table" id="hrTeamUsageTable"></table>
  //       <div class="key-insights" id="hrTeamKeyInsights"></div>
  //     </div>
  //   `,
  // },
];

let filteredList = [];
let selectedIdx = 0;

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
    return [
      mnth,
      day,
      date.getFullYear().toString(),
      // .substr(2, 2),
    ].join("-");
  }
}

function renderEmployeeList() {
  const ul = document.getElementById("employeeListUl");
  if (!ul) return;

  ul.innerHTML = "";

  // Auto-select logged-in user only on first load
  if (!hasAutoSelected && filteredList.length > 0) {
    const userEmail = localStorage.getItem("email"); // Get logged-in user email
    const loggedInUserIndex = filteredList.findIndex(
      (emp) =>
        emp.userEmailId &&
        emp.userEmailId.toLowerCase() === userEmail.toLowerCase()
    );
    console.log("Logged-in user index:", loggedInUserIndex);

    if (loggedInUserIndex !== -1) {
      selectedIdx = loggedInUserIndex;
    }
    hasAutoSelected = true; // Mark as completed
  }

  filteredList.forEach((emp, idx) => {
    const li = document.createElement("li");
    li.textContent = emp.userName;
    if (idx === selectedIdx) li.classList.add("selected");
    li.onclick = () => {
      selectedIdx = idx;
      renderEmployeeList();
      renderEmployeeDetails();
    };
    ul.appendChild(li);
  });
}
function filterEmployees() {
  const searchValue = document
    .querySelector(".employee_search")
    .value.toLowerCase();

  filteredList = weekly_data.employee_data.filter((emp) =>
    emp.userName.toLowerCase().includes(searchValue)
  );

  // Reset selection to first item when filtering
  selectedIdx = 0;
  hasAutoSelected = true; // Prevent auto-selection after filtering

  renderEmployeeList();
  renderEmployeeDetails();
}

function renderEmployeeDetails() {
  const header = document.getElementById("detailsHeader");
  const table = document.getElementById("usageTable");
  const insightsDiv = document.getElementById("keyInsights");

  if (!header || !table || !insightsDiv) return;

  if (filteredList.length === 0) {
    header.innerHTML = "No employee selected";
    // Destroy existing DataTable instance if it exists
    if ($.fn.DataTable.isDataTable("#usageTable")) {
      $("#usageTable").DataTable().destroy();
    }
    table.innerHTML = "";
    insightsDiv.innerHTML = "";
    return;
  }

  const emp = filteredList[selectedIdx];
  header.innerHTML = `Selected Employee: <a>${emp.userName}</a>`;

  let tableHtml = `
    <thead>
      <tr>
        <th>PAGE</th>
        <th>TOTAL VIEW COUNT</th>
        <th>TOTAL TIME SPENT</th>
        <th>AVERAGE TIME SPENT</th>
      </tr>
    </thead>
    <tbody>
  `;

  const aggregatedUsage = aggregateUsageData(emp.usage_details);

  aggregatedUsage.forEach((row) => {
    if (row.total_time_spent > 0) {
      let totalSpentTime = row.total_time_spent;
      let avgTimeSpent = row.average_time_spent;

      if (row.total_time_spent >= 1) {
        totalSpentTime = Math.round(row.total_time_spent);
      } else {
        totalSpentTime = row.total_time_spent.toFixed(1);
      }
      if (row.average_time_spent > 0) {
        if (row.average_time_spent >= 1) {
          avgTimeSpent = Math.round(row.average_time_spent);
        } else {
          avgTimeSpent = row.average_time_spent.toFixed(1);
        }
      }
      // Make "Overall Summary" (including the legacy "Overall Summary Report"
      // API value) and "CNPS" clickable.
      let pageCell = row.displayName;
      if (isOverallSummaryPage(row.originalPageModule) || isOverallSummaryPage(row.displayName)) {
        pageCell = `<span class="clickable-report" onclick="showOverallSummaryPopup()" style="cursor:pointer; color:#1768c8; text-decoration:underline;">${row.displayName}</span>`;
      } else if (row.displayName === "CNPS" || row.displayName === "NPS" || (row.originalPageModule && (row.originalPageModule.includes("CNPS") || row.originalPageModule === "NPS"))) {
        pageCell = `<span class="clickable-report" onclick="showCNPSPopup()" style="cursor:pointer; color:#1768c8; text-decoration:underline;">${row.displayName}</span>`;
      } else if (row.displayName === "QuickLink" || (row.originalPageModule && row.originalPageModule.includes("QuickLink"))) {
        pageCell = `<span class="clickable-report" onclick="showQuickLinkPopup()" style="cursor:pointer; color:#1768c8; text-decoration:underline;">${row.displayName}</span>`;
      }

      tableHtml += `
        <tr>
          <td>${pageCell}</td>
          <td>${row.total_view_count}</td>
          <td>${totalSpentTime} Minutes</td>
          <td>${avgTimeSpent} Minutes</td>
        </tr>
      `;
    }
  });

  tableHtml += `</tbody>`;
  table.innerHTML = tableHtml;

  // Initialize DataTable for usageTable with default sorting on 'TOTAL VIEW COUNT'
  // Destroy existing DataTable instance if it exists
  if ($.fn.DataTable.isDataTable("#usageTable")) {
    $("#usageTable").DataTable().destroy();
  }
  $("#usageTable").DataTable({
    paging: false,
    searching: false,
    info: false,
    order: [[2, "desc"]], // Sort by 'TOTAL VIEW COUNT' (index 1) in descending order
    columnDefs: [
      { type: "minutes-numeric", targets: [2, 3] }, // Apply custom sort to 'TOTAL TIME SPENT' (index 2) and 'AVERAGE TIME SPENT' (index 3)
    ],
  });

  insightsDiv.innerHTML = emp.Insights.map(insight => insight.replace(/\bNPS\b/g, "CNPS")).map(
    (insight, idx) =>
      `<div><span class="insight-label">Key Insights-${idx + 1
      }:</span> <span class="insight-value">${insight}</span></div>`
  ).join("");
}

// Fix 2: Update createTabs function to handle initial visibility
function createTabs() {
  const tabButtonsContainer = document.getElementById("tab-buttons");
  const tabContentContainer = document.getElementById("tab-content-container");

  if (!tabButtonsContainer || !tabContentContainer) {
    console.error("Tab containers not found!");
    return;
  }

  // Clear existing content
  tabButtonsContainer.innerHTML = "";
  tabContentContainer.innerHTML = "";

  tabs.forEach((tab, index) => {
    const tabButton = document.createElement("button");
    tabButton.className = "tab-button";
    tabButton.textContent = tab.name;
    tabButton.onclick = () => switchTab(index);

    tabButtonsContainer.appendChild(tabButton);

    const tabContent = document.createElement("div");
    tabContent.className = "tab-content";
    tabContent.style.display = "none";
    tabContent.innerHTML = tab.content;

    tabContentContainer.appendChild(tabContent);
  });

  // Apply filter visibility after creating tabs
  updateVisibleTabs();

  // Find the first visible tab and make it active
  const visibleTabs = Array.from(tabButtonsContainer.children).filter(
    (tab) => tab.style.display !== "none"
  );

  if (visibleTabs.length > 0) {
    const firstVisibleIndex = Array.from(tabButtonsContainer.children).indexOf(
      visibleTabs[0]
    );
    switchTab(firstVisibleIndex);
  }
}

// Fix 1: Update the switchTab function to properly show content
function switchTab(index) {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // First, hide all content and remove active states
  tabButtons.forEach((button, i) => {
    button.classList.toggle("active", i === index);
    if (tabContents[i]) {
      tabContents[i].style.display = i === index ? "block" : "none";
    }
  });

  const tabName = tabs[index].name;

  // Only render content for the active tab
  switch (tabName) {
    case "Employee's Usage":
      if (weekly_data.employee_data) {
        filteredList = [...weekly_data.employee_data];
        selectedIdx = 0;
        renderEmployeeList();
        renderEmployeeDetails();
      }
      break;
    case "Overall":
      renderUsageTable("overallUsageTable", weekly_data.overall_data);
      renderKeyInsights(
        "overallKeyInsights",
        weekly_data.overall_data.key_insigts
      );
      break;
    case "Delivery Heads":
      renderUsageTable("deliveryHeadsUsageTable", weekly_data.delivery_heads);
      renderKeyInsights(
        "deliveryHeadsKeyInsights",
        weekly_data.delivery_heads.key_insigts
      );
      break;
    case "Delivery Members":
      renderUsageTable(
        "deliveryMembersUsageTable",
        weekly_data.delivery_members
      );
      renderKeyInsights(
        "deliveryMembersKeyInsights",
        weekly_data.delivery_members.key_insigts
      );
      break;
    case "Growth Team":
      renderUsageTable("growthTeamUsageTable", weekly_data.growth_members);
      renderKeyInsights(
        "growthTeamKeyInsights",
        weekly_data.growth_members.key_insigts
      );
      break;
    case "Finance Team":
      renderUsageTable("financeTeamUsageTable", weekly_data.finance_members);
      renderKeyInsights(
        "financeTeamKeyInsights",
        weekly_data.finance_members.key_insigts
      );
      break;
    // case "HR Team":
    //   renderUsageTable("hrTeamUsageTable", weekly_data.hr_members);
    //   renderKeyInsights(
    //     "hrTeamKeyInsights",
    //     weekly_data.hr_members.key_insigts
    //   );
    //   break;
  }
}

function prepareWeeklyUIData(data) {
  // Update top level metrics
  $("#employee_count").text(data.employee_count);
  $("#employee_visited").text(data.most_visted_page === "NPS" ? "CNPS" : data.most_visted_page);
  $("#employee_avg_time").text(data.avg_time_spent + " Minutes");
  $("#employee_total_time").text(data.total_time_spent + " Minutes");

  // Create tabs with dynamic data
  createTabs();
}

function normalizeDateFormat(dateStr) {
  if (!dateStr) return "";
  // Replace all separators with consistent format and trim
  return dateStr.replace(/[-\/]/g, "/").trim();
}

function fetchData(selectedInput) {
  let getStartDate = $("#start_date").val();
  let getEndDate = $("#end_date").val();
  let getOldStartDate = $("#start_date").attr("data-id");
  let getOldEndDate = $("#end_date").attr("data-id");
  console.log("Start Date 1: " + getStartDate);
  console.log("End Date 1: " + getEndDate);

  if (!getStartDate || !getEndDate) {
    toastr.options.timeOut = 2000;
    toastr.warning("Please select both Start Date and End Date");
    return;
  }

  if (new Date(getEndDate) < new Date(getStartDate)) {
    toastr.options.timeOut = 2000;
    toastr.error("End Date should be greater than or equal to Start Date");
    $("#end_date").val("");
    return;
  }
  // Normalize both current and old dates before comparison
  let normalizedStartDate = normalizeDateFormat(getStartDate);
  let normalizedEndDate = normalizeDateFormat(getEndDate);
  let normalizedOldStartDate = normalizeDateFormat(getOldStartDate);
  let normalizedOldEndDate = normalizeDateFormat(getOldEndDate);

  console.log("Normalized Start: " + normalizedStartDate);
  console.log("Normalized Old Start: " + normalizedOldStartDate);

  if (
    normalizedStartDate != normalizedOldStartDate ||
    normalizedEndDate != normalizedOldEndDate
  ) {
    console.log("Dates changed, fetching new data");
    $("#start_date").attr("data-id", normalizedStartDate.replaceAll("/", "-"));
    $("#end_date").attr("data-id", normalizedEndDate.replaceAll("/", "-"));
    getWeeklyAPIData(); // This function now handles the show/hide of loader and div
  } else {
    console.log("Dates are the same, no need to fetch");
  }
  console.log("getStartDate final : " + getStartDate);
  console.log("getEndDate final: " + getEndDate);
  if (selectedInput == "start_date") {
    $("#start_date").val(getStartDate.replaceAll("/", "-"));
  }
  if (selectedInput == "end_date") {
    $("#end_date").val(getEndDate.replaceAll("/", "-"));
  }
}

function renderUsageTable(targetId, dataSource) {
  const table = document.getElementById(targetId);
  if (!table || !dataSource || !dataSource.data) {
    console.error(`Table with ID ${targetId} not found or no data available.`);
    return;
  }

  // Destroy existing DataTable instance if it exists
  if ($.fn.DataTable.isDataTable(`#${targetId}`)) {
    $(`#${targetId}`).DataTable().destroy();
  }

  let html = `
    <thead>
      <tr>
        <th>PAGE</th>
        <th>UNIQUE USERS</th>
        <th>TOTAL VIEW COUNT</th>
        <th>AVERAGE TIME SPENT</th>
        <th>TOTAL TIME SPENT</th>
      </tr>
    </thead>
    <tbody>
  `;

  const aggregatedData = aggregateUsageData(dataSource.data);

  aggregatedData.forEach((row) => {
    if (row.total_time_spent > 0) {
      let totalSpentTime = row.total_time_spent;
      let avgTimeSpent = row.average_time_spent;

      if (row.total_time_spent >= 1) {
        totalSpentTime = Math.round(row.total_time_spent);
      } else {
        totalSpentTime = row.total_time_spent.toFixed(1);
      }
      if (row.average_time_spent > 0) {
        if (row.average_time_spent >= 1) {
          avgTimeSpent = Math.round(row.average_time_spent);
        } else {
          avgTimeSpent = row.average_time_spent.toFixed(1);
        }
      }
      // Make "Overall Summary" (including the legacy "Overall Summary Report"
      // API value) and "CNPS" clickable.
      let pageCell = row.displayName;
      if (isOverallSummaryPage(row.originalPageModule) || isOverallSummaryPage(row.displayName)) {
        pageCell = `<span class="clickable-report" onclick="showOverallSummaryPopup()" style="cursor:pointer; color:#1768c8; text-decoration:underline;">${row.displayName}</span>`;
      } else if (row.displayName === "CNPS" || row.displayName === "NPS" || (row.originalPageModule && (row.originalPageModule.includes("CNPS") || row.originalPageModule === "NPS"))) {
        pageCell = `<span class="clickable-report" onclick="showCNPSPopup()" style="cursor:pointer; color:#1768c8; text-decoration:underline;">${row.displayName}</span>`;
      } else if (row.displayName === "QuickLink" || (row.originalPageModule && row.originalPageModule.includes("QuickLink"))) {
        pageCell = `<span class="clickable-report" onclick="showQuickLinkPopup()" style="cursor:pointer; color:#1768c8; text-decoration:underline;">${row.displayName}</span>`;
      }

      html += `
        <tr>
          <td>${pageCell}</td>
          <td>${row.unique_users}</td>
          <td>${row.total_view_count}</td>
          <td>${avgTimeSpent} Minutes</td>
          <td>${totalSpentTime} Minutes</td>
        </tr>
      `;
    }
  });

  html += `</tbody>`;
  table.innerHTML = html;

  // Initialize DataTable for the current table with default sorting on 'TOTAL VIEW COUNT'
  $(`#${targetId}`).DataTable({
    paging: false,
    searching: false,
    info: false,
    order: [[4, "desc"]], // Sort by 'TOTAL VIEW COUNT' (index 2) in descending order
    columnDefs: [
      { type: "minutes-numeric", targets: [3, 4] }, // Apply custom sort to 'AVERAGE TIME SPENT' (index 3) and 'TOTAL TIME SPENT' (index 4)
    ],
  });
}

function renderKeyInsights(targetId, insights) {
  const div = document.getElementById(targetId);
  if (!div || !insights) {
    console.error(
      `Insights div with ID ${targetId} not found or no insights available.`
    );
    return;
  }

  let html = "";
  insights.forEach((rawInsight, idx) => { let insight = rawInsight.replace(/\bNPS\b/g, "CNPS");
    html += `<div><span class="insight-label">Key Insights -${idx + 1
      }:</span> <span class="insight-value">${insight}</span></div>`;
  });

  div.innerHTML = html;
}

function toggleFilter(element) {
  console.log("Filter clicked");

  const dropdown = document.getElementById("filterDropdown");
  if (!dropdown) {
    console.error("filterDropdown element not found");
    return;
  }

  if (isFilterOpen) {
    dropdown.style.display = "none";
    isFilterOpen = false;
  } else {
    dropdown.style.display = "block";
    isFilterOpen = true;
    updateCheckboxes();
  }
}

function updateCheckboxes() {
  const checkboxes = document.querySelectorAll(
    '.filter-option input[type="checkbox"]',
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectedTeams.includes(checkbox.value);
  });
}

function cancelFilter() {
  updateCheckboxes();
  closeFilter();
}

function applyFilter() {
  const checkedBoxes = document.querySelectorAll(
    '.filter-option input[type="checkbox"]:checked',
  );
  selectedTeams = Array.from(checkedBoxes).map((cb) => cb.value);
  updateVisibleTabs();

  const activeTab = document.querySelector(".tab-button.active");
  if (activeTab && activeTab.style.display === "none") {
    const visibleTabs = Array.from(
      document.querySelectorAll(".tab-button"),
    ).filter((tab) => tab.style.display !== "none");
    if (visibleTabs.length > 0) {
      const firstVisibleIndex = Array.from(
        document.querySelectorAll(".tab-button"),
      ).indexOf(visibleTabs[0]);
      switchTab(firstVisibleIndex);
    }
  }

  closeFilter();
}

function closeFilter() {
  const dropdown = document.getElementById("filterDropdown");
  if (dropdown) {
    dropdown.style.display = "none";
  }
  isFilterOpen = false;
}

function updateVisibleTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");

  tabButtons.forEach((tab) => {
    const buttonText = tab.textContent.trim();

    if (buttonText === "Employee's Usage" || buttonText === "Overall") {
      tab.style.display = "inline-block";
      return;
    }

    let shouldShow = false;
    if (
      buttonText === "Delivery Heads" &&
      selectedTeams.includes("Delivery Heads")
    ) {
      shouldShow = true;
    } else if (
      buttonText === "Delivery Members" &&
      selectedTeams.includes("Delivery Members")
    ) {
      shouldShow = true;
    } else if (
      buttonText === "Growth Team" &&
      selectedTeams.includes("Growth Team")
    ) {
      shouldShow = true;
    } else if (
      buttonText === "Finance Team" &&
      selectedTeams.includes("Finance Team")
    ) {
      shouldShow = true;
    }

    tab.style.display = shouldShow ? "inline-block" : "none";
  });
}

function updateTabContent() {
  const contentSections = document.querySelectorAll(
    '[id*="tab-content"], .tab-content',
  );
  contentSections.forEach((content) => {
    const contentId = content.id || content.className;
    let shouldShow = false;
    selectedTeams.forEach((team) => {
      if (
        contentId.toLowerCase().includes(team.toLowerCase().replace(" ", ""))
      ) {
        shouldShow = true;
      }
    });
    content.style.display = shouldShow ? "block" : "none";
  });
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const filterContainer = document.querySelector(".filter-container");
  if (
    filterContainer &&
    !filterContainer.contains(event.target) &&
    isFilterOpen
  ) {
    closeFilter();
  }
});

function isOverallSummaryPage(name) {
  if (typeof name !== "string") return false;

  const normalizedName = name.trim().toLowerCase();
  return normalizedName === "overall summary" ||
    normalizedName === "overall summary report";
}

// Function to show popup when clicking on "Overall Summary" in the table
function showOverallSummaryPopup() {
  // Find which tab is currently active to get the correct data source
  const activeTab = document.querySelector(".tab-button.active");
  if (!activeTab) {
    toastr.options.timeOut = 2000;
    toastr.warning("No active tab found");
    return;
  }

  const tabName = activeTab.textContent.trim();
  let dataSource = null;
  let displayTitle = "";

  // Get the appropriate data source based on active tab
  switch (tabName) {
    case "Employee's Usage":
      // For Employee's Usage tab, get data from currently selected employee
      if (filteredList.length > 0 && selectedIdx < filteredList.length) {
        const emp = filteredList[selectedIdx];
        const emp_granular = emp.overall_granular.data;

        if (emp_granular && emp_granular.length > 0) {
          const aggregatedGranular = aggregateUsageData(emp_granular, false);

          let rows = "";
          aggregatedGranular.forEach((row) => {
            rows += `
              <tr>
                <td>${row.displayName}</td>
                <td style="text-align:center;">${row.total_view_count}</td>
                <td style="text-align:center;">${row.average_time_spent >= 1 ? Math.round(row.average_time_spent) : row.average_time_spent.toFixed(1)} Minutes</td>
                <td style="text-align:center;">${row.total_time_spent >= 1 ? Math.round(row.total_time_spent) : (row.total_time_spent > 0 ? row.total_time_spent.toFixed(1) : 0)} Minutes</td>
              </tr>`;
          });

          let tableHtml = `
            <table class="table table-bordered table-striped" id="popupReportTable" style="width:100%; font-size:12px;">
              <thead>
                <tr style="background-color: #f6f7f9;">
                  <th style="text-align:center;">PAGE</th>
                  <th style="text-align:center;">TOTAL VIEW COUNT</th>
                  <th style="text-align:center;">AVERAGE TIME SPENT</th>
                  <th style="text-align:center;">TOTAL TIME SPENT</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          `;

          bootbox.dialog({
            title: "Employee Usage - Overall Summary Report",
            message: tableHtml,
            size: "large",
            buttons: {
              close: {
                label: "Close",
                className: "btn-default",
              },
            },
          });
          return;
        } else {
          toastr.options.timeOut = 2000;
          toastr.warning("Overall Summary Report data not found for this employee");
          return;
        }
      } else {
        toastr.options.timeOut = 2000;
        toastr.warning("No employee data available");
        return;
      }
    case "Overall":
      dataSource = weekly_data.overall_data.overall_granular;
      displayTitle = "Overall Summary Report - Detailed View";
      break;
    case "Delivery Heads":
      dataSource = weekly_data.delivery_heads.overall_granular;
      displayTitle = "Delivery Heads - Overall Summary Report";
      break;
    case "Delivery Members":
      dataSource = weekly_data.delivery_members.overall_granular;
      displayTitle = "Delivery Members - Overall Summary Report";
      break;
    case "Growth Team":
      dataSource = weekly_data.growth_members.overall_granular;
      displayTitle = "Growth Team - Overall Summary Report";
      break;
    case "Finance Team":
      dataSource = weekly_data.finance_members.overall_granular;
      displayTitle = "Finance Team - Overall Summary Report";
      break;
    default:
      toastr.options.timeOut = 2000;
      toastr.warning("No data available for this tab");
      return;
  }

  if (!dataSource || !dataSource.data) {
    toastr.options.timeOut = 2000;
    toastr.warning("No data available to display");
    return;
  }

  // Build rows for all entries in overall_granular.data
  let rows = "";
  const aggregatedOverall = aggregateUsageData(dataSource.data);
  aggregatedOverall.forEach((row) => {
    rows += `
      <tr>
        <td>${row.displayName}</td>
        <td style="text-align:center;">${row.unique_users}</td>
        <td style="text-align:center;">${row.total_view_count}</td>
        <td style="text-align:center;">${row.average_time_spent >= 1 ? Math.round(row.average_time_spent) : row.average_time_spent.toFixed(1)} Minutes</td>
        <td style="text-align:center;">${row.total_time_spent >= 1 ? Math.round(row.total_time_spent) : (row.total_time_spent > 0 ? row.total_time_spent.toFixed(1) : 0)} Minutes</td>
      </tr>`;
  });

  // Build the detailed popup table HTML
  let tableHtml = `
    <table class="table table-bordered table-striped" id="popupReportTable" style="width:100%; font-size:12px;">
      <thead>
        <tr style="background-color: #f6f7f9;">
          <th style="text-align:center;">PAGE</th>
          <th style="text-align:center;">UNIQUE USERS</th>
          <th style="text-align:center;">TOTAL VIEW COUNT</th>
          <th style="text-align:center;">AVERAGE TIME SPENT</th>
          <th style="text-align:center;">TOTAL TIME SPENT</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  // Show popup using bootbox
  bootbox.dialog({
    title: displayTitle,
    message: tableHtml,
    size: "large",
    buttons: {
      close: {
        label: "Close",
        className: "btn-default",
      },
    },
  });
}

// Helper function to format technical page module mapping to user-friendly names
function formatPageModuleName(name, groupCNPS = true) {
  if (!name) return "Overall Summary Report";

  // Clean the name from technical suffixes if any (legacy or accidental)
  let cleanName = name.replace(" (popup-opened)", "").trim();

  // Handle improperly appended tab names from past tracking bug
  if (cleanName === "Buying Center - Buying Center Management") {
    cleanName = "Buying Center Management";
  } else if (cleanName === "Buying Center - Buying Center Engagement") {
    cleanName = "Buying Center Engagement";
  } else {
    cleanName = cleanName.replace(" - Buying Center Engagement", "").replace(" - Buying Center Management", "").trim();
  }

  // If it's the main report name, keep it
  if (cleanName === "Overall Summary Report") return cleanName;

  // Group CNPS modules into "CNPS" for main table display
  if (groupCNPS && (cleanName === "NPS" || cleanName === "CNPS Planning" || cleanName === "CNPS Summary" || cleanName === "CNPS Buying Center" || cleanName === "CNPS Buying Centers")) {
    return "CNPS";
  }

  // Handle QuickLink/Notes transformations
  if (cleanName.toLowerCase().includes("notes - search lead") || cleanName.toLowerCase().includes("notes - search sow")) {
    return "SOW";
  }
  if (cleanName.toLowerCase().includes("notes - search stakeholder")) {
    return "Stakeholder";
  }

  // Handle Account Level string: showNewLogoStatus-hidden selectedAccount-NAME
  if (cleanName.includes("showNewLogoStatus")) {
    const parts = cleanName.split("selectedAccount-");
    const prefix = parts[0];
    const account = (parts[1] || "").replace(/[-\s]+$/, '').trim();
    const isNewLogoShown = prefix.includes("shown");

    const newLogoText = isNewLogoShown ? "New Logo Shown" : "New Logo Hidden";

    if (account) {
      const cleanAccountName = account.replace(" (SOW Amount)", "").trim();
      return `Account: ${cleanAccountName}`;
    } else {
      return `Account Level (${newLogoText})`;
    }
  }

  // Handle SOW Level: sowLevel-actualProjected
  if (cleanName.includes("sowLevel-")) {
    const type = cleanName.split("sowLevel-")[1];
    if (type === "actualProjected") return "SOW Level: Actual/Projected";
    if (type === "sowAmount") return "SOW Level: SOW Amount";
    return `SOW Level: ${type}`;
  }

  // Handle Buying Center: selectedBuyingCenter-NAME and Buying Center Level
  if (cleanName.includes("selectedBuyingCenter-")) {
    return "Buying Center";
  }

  return cleanName;
}


// Function to show popup when clicking on "CNPS" in the table
function showCNPSPopup() {
  // Find which tab is currently active to get the correct data source
  const activeTab = document.querySelector(".tab-button.active");
  if (!activeTab) {
    toastr.options.timeOut = 2000;
    toastr.warning("No active tab found");
    return;
  }

  const tabName = activeTab.textContent.trim();
  let dataSource = null;
  let displayTitle = "";

  // Get the appropriate data source based on active tab
  switch (tabName) {
    case "Employee's Usage":
      // For Employee's Usage tab, get data from currently selected employee
      if (filteredList.length > 0 && selectedIdx < filteredList.length) {
        const emp = filteredList[selectedIdx];
        const emp_granular = emp.cnps_granular ? emp.cnps_granular.data : null;

        if (emp_granular && emp_granular.length > 0) {
          const aggregatedGranular = aggregateUsageData(emp_granular, false);

          let rows = "";
          aggregatedGranular.forEach((row) => {
            rows += `
              <tr>
                <td>${row.displayName}</td>
                <td style="text-align:center;">${row.total_view_count}</td>
                <td style="text-align:center;">${row.average_time_spent >= 1 ? Math.round(row.average_time_spent) : row.average_time_spent.toFixed(1)} Minutes</td>
                <td style="text-align:center;">${row.total_time_spent >= 1 ? Math.round(row.total_time_spent) : (row.total_time_spent > 0 ? row.total_time_spent.toFixed(1) : 0)} Minutes</td>
              </tr>`;
          });

          let tableHtml = `
            <table class="table table-bordered table-striped" id="popupReportTable" style="width:100%; font-size:12px;">
              <thead>
                <tr style="background-color: #f6f7f9;">
                  <th style="text-align:center;">PAGE</th>
                  <th style="text-align:center;">TOTAL VIEW COUNT</th>
                  <th style="text-align:center;">AVERAGE TIME SPENT</th>
                  <th style="text-align:center;">TOTAL TIME SPENT</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          `;

          bootbox.dialog({
            title: "Employee usage - CNPS Report",
            message: tableHtml,
            size: "large",
            buttons: {
              close: {
                label: "Close",
                className: "btn-default",
              },
            },
          });
          return;
        } else {
          toastr.options.timeOut = 2000;
          toastr.warning("CNPS Report data not found for this employee");
          return;
        }
      } else {
        toastr.options.timeOut = 2000;
        toastr.warning("No employee data available");
        return;
      }
    case "Overall":
      dataSource = weekly_data.overall_data.cnps_granular;
      displayTitle = "CNPS Report - Detailed View";
      break;
    case "Delivery Heads":
      dataSource = weekly_data.delivery_heads.cnps_granular;
      displayTitle = "Delivery Heads - CNPS Report";
      break;
    case "Delivery Members":
      dataSource = weekly_data.delivery_members.cnps_granular;
      displayTitle = "Delivery Members - CNPS Report";
      break;
    case "Growth Team":
      dataSource = weekly_data.growth_members.cnps_granular;
      displayTitle = "Growth Team - CNPS Report";
      break;
    case "Finance Team":
      dataSource = weekly_data.finance_members.cnps_granular;
      displayTitle = "Finance Team - CNPS Report";
      break;
    default:
      toastr.options.timeOut = 2000;
      toastr.warning("No data available for this tab");
      return;
  }

  if (!dataSource || !dataSource.data) {
    toastr.options.timeOut = 2000;
    toastr.warning("No data available to display");
    return;
  }

  // Build rows for all entries in cnps_granular.data
  let rows = "";
  const aggregatedCNPS = aggregateUsageData(dataSource.data, false);
  aggregatedCNPS.forEach((row) => {
    rows += `
      <tr>
        <td>${row.displayName}</td>
        <td style="text-align:center;">${row.unique_users}</td>
        <td style="text-align:center;">${row.total_view_count}</td>
        <td style="text-align:center;">${row.average_time_spent >= 1 ? Math.round(row.average_time_spent) : row.average_time_spent.toFixed(1)} Minutes</td>
        <td style="text-align:center;">${row.total_time_spent >= 1 ? Math.round(row.total_time_spent) : (row.total_time_spent > 0 ? row.total_time_spent.toFixed(1) : 0)} Minutes</td>
      </tr>`;
  });

  // Build the detailed popup table HTML
  let tableHtml = `
    <table class="table table-bordered table-striped" id="popupReportTable" style="width:100%; font-size:12px;">
      <thead>
        <tr style="background-color: #f6f7f9;">
          <th style="text-align:center;">PAGE</th>
          <th style="text-align:center;">UNIQUE USERS</th>
          <th style="text-align:center;">TOTAL VIEW COUNT</th>
          <th style="text-align:center;">AVERAGE TIME SPENT</th>
          <th style="text-align:center;">TOTAL TIME SPENT</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  // Show popup using bootbox
  bootbox.dialog({
    title: displayTitle,
    message: tableHtml,
    size: "large",
    buttons: {
      close: {
        label: "Close",
        className: "btn-default",
      },
    },
  });
}

// Helper function to aggregate duplicate rows by their formatted page module name
function aggregateUsageData(dataArray, groupCNPS = true) {
  if (!dataArray || !Array.isArray(dataArray)) return [];

  const aggregated = {};

  dataArray.forEach((row) => {
    const displayName = formatPageModuleName(row.pageModule, groupCNPS);
    if (!aggregated[displayName]) {
      aggregated[displayName] = {
        displayName: displayName,
        originalPageModule: row.pageModule, // Keep for clickable check
        unique_users: row.unique_users || 0,
        total_view_count: parseInt(row.total_view_count) || 0,
        total_time_spent: parseFloat(row.total_time_spent) || 0
      };
    } else {
      aggregated[displayName].total_view_count += (parseInt(row.total_view_count) || 0);
      aggregated[displayName].total_time_spent += (parseFloat(row.total_time_spent) || 0);
      // Use max for unique users as a safe approximation for pre-aggregated data
      if (row.unique_users && row.unique_users > aggregated[displayName].unique_users) {
        aggregated[displayName].unique_users = row.unique_users;
      }
    }
  });

  // Calculate averages and return as array
  return Object.values(aggregated).map(item => {
    item.average_time_spent = item.total_view_count > 0 ? (item.total_time_spent / item.total_view_count) : 0;
    return item;
  });
}

// Function to show popup when clicking on "QuickLink" in the table
function showQuickLinkPopup() {
  // Find which tab is currently active to get the correct data source
  const activeTab = document.querySelector(".tab-button.active");
  if (!activeTab) {
    toastr.options.timeOut = 2000;
    toastr.warning("No active tab found");
    return;
  }

  const tabName = activeTab.textContent.trim();
  let dataSource = null;
  let displayTitle = "";

  // Get the appropriate data source based on active tab
  switch (tabName) {
    case "Employee's Usage":
      // For Employee's Usage tab, get data from currently selected employee
      if (filteredList.length > 0 && selectedIdx < filteredList.length) {
        const emp = filteredList[selectedIdx];
        const emp_granular = emp.notes_granular ? emp.notes_granular.data : null;

        if (emp_granular && emp_granular.length > 0) {
          const aggregatedGranular = aggregateUsageData(emp_granular, false);

          let rows = "";
          aggregatedGranular.forEach((row) => {
            rows += `
              <tr>
                <td>${row.displayName}</td>
                <td style="text-align:center;">${row.total_view_count}</td>
                <td style="text-align:center;">${row.average_time_spent >= 1 ? Math.round(row.average_time_spent) : row.average_time_spent.toFixed(1)} Minutes</td>
                <td style="text-align:center;">${row.total_time_spent >= 1 ? Math.round(row.total_time_spent) : (row.total_time_spent > 0 ? row.total_time_spent.toFixed(1) : 0)} Minutes</td>
              </tr>`;
          });

          let tableHtml = `
            <table class="table table-bordered table-striped" id="popupReportTable" style="width:100%; font-size:12px;">
              <thead>
                <tr style="background-color: #f6f7f9;">
                  <th style="text-align:center;">PAGE</th>
                  <th style="text-align:center;">TOTAL VIEW COUNT</th>
                  <th style="text-align:center;">AVERAGE TIME SPENT</th>
                  <th style="text-align:center;">TOTAL TIME SPENT</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          `;

          bootbox.dialog({
            title: "Employee usage - QuickLink Report",
            message: tableHtml,
            size: "large",
            buttons: {
              close: {
                label: "Close",
                className: "btn-default",
              },
            },
          });
          return;
        } else {
          toastr.options.timeOut = 2000;
          toastr.warning("QuickLink Report data not found for this employee");
          return;
        }
      } else {
        toastr.options.timeOut = 2000;
        toastr.warning("No employee data available");
        return;
      }
    case "Overall":
      dataSource = weekly_data.overall_data.notes_granular;
      displayTitle = "QuickLink Report - Detailed View";
      break;
    case "Delivery Heads":
      dataSource = weekly_data.delivery_heads.notes_granular;
      displayTitle = "Delivery Heads - QuickLink Report";
      break;
    case "Delivery Members":
      dataSource = weekly_data.delivery_members.notes_granular;
      displayTitle = "Delivery Members - QuickLink Report";
      break;
    case "Growth Team":
      dataSource = weekly_data.growth_members.notes_granular;
      displayTitle = "Growth Team - QuickLink Report";
      break;
    case "Finance Team":
      dataSource = weekly_data.finance_members.notes_granular;
      displayTitle = "Finance Team - QuickLink Report";
      break;
    default:
      toastr.options.timeOut = 2000;
      toastr.warning("No data available for this tab");
      return;
  }

  if (!dataSource || !dataSource.data) {
    toastr.options.timeOut = 2000;
    toastr.warning("No data available to display");
    return;
  }

  // Build rows for all entries in notes_granular.data
  let rows = "";
  const aggregatedQuickLink = aggregateUsageData(dataSource.data, false);
  aggregatedQuickLink.forEach((row) => {
    rows += `
      <tr>
        <td>${row.displayName}</td>
        <td style="text-align:center;">${row.unique_users}</td>
        <td style="text-align:center;">${row.total_view_count}</td>
        <td style="text-align:center;">${row.average_time_spent >= 1 ? Math.round(row.average_time_spent) : row.average_time_spent.toFixed(1)} Minutes</td>
        <td style="text-align:center;">${row.total_time_spent >= 1 ? Math.round(row.total_time_spent) : (row.total_time_spent > 0 ? row.total_time_spent.toFixed(1) : 0)} Minutes</td>
      </tr>`;
  });

  // Build the detailed popup table HTML
  let tableHtml = `
    <table class="table table-bordered table-striped" id="popupReportTable" style="width:100%; font-size:12px;">
      <thead>
        <tr style="background-color: #f6f7f9;">
          <th style="text-align:center;">PAGE</th>
          <th style="text-align:center;">UNIQUE USERS</th>
          <th style="text-align:center;">TOTAL VIEW COUNT</th>
          <th style="text-align:center;">AVERAGE TIME SPENT</th>
          <th style="text-align:center;">TOTAL TIME SPENT</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  // Show popup using bootbox
  bootbox.dialog({
    title: displayTitle,
    message: tableHtml,
    size: "large",
    buttons: {
      close: {
        label: "Close",
        className: "btn-default",
      },
    },
  });
}
