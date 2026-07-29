let allBusinessHead = []; // To store all business heads from the API
let selectedBusinessHead = []; // To store selected business heads
let executiveSummaryJson = []; // To store executive summary data
let buyingCenterApiData = []; // To store buying center API data
let overallSummaryFilterState = {
  activeTab: "accountLevelTab",
  selectedYear: null,
  selectedBusinessHead: "-1",
};
let infoPopupLocked = false;
let lastTriggerIcon = null;
let infoPopupEl, infoPopupTitleEl, infoPopupTableBodyEl;
let chartTooltipEl,
  chartTooltipTitleEl,
  chartTooltipTableBodyEl,
  chartTooltipSummaryEl;
let revenueChart = null;
document.addEventListener("DOMContentLoaded", function () {
  // Check the value from localStorage
  let userAccess = localStorage.getItem("Department");

  // Get the span element for the title
  var titleSpan = document.querySelector(".title-content span");

  // Modify the span text based on the stored value
  if (userAccess === "Account Growth") {
    titleSpan.textContent = "My Portfolio Overall Summary";
  } else {
    titleSpan.textContent = "Overall Revenue Summary"; // For any other case, display "Overall Summary"
  }
});

const popupData = [
  {
    account: "Anthem",
    sow: "AWS/Snowflake Data Engineering",
    funnel: "70% - Renewals",
    type: "Net New",
    date_change: "12/10/2024 (6 Days)",
    change_amount: {
      actual_amount: 0.62,
      difference_amount: 0.05,
      total_amount: 0.67,
    },
  },
  {
    account: "Baptist Health",
    sow: "OPs Team Renewal",
    funnel: "70% - Renewals",
    type: "Current New",
    date_change: "12/02/2024 (14 Days)",
    change_amount: {
      actual_amount: 0.57,
      difference_amount: 0.05,
      total_amount: 0.62,
    },
  },
  {
    account: "CVS",
    sow: "Palm Beach Conversion Re...ron/Alka",
    funnel: "70% - Proposals",
    type: "Current",
    date_change: "11/20/2024 (26 Days)",
    change_amount: {
      actual_amount: 0.52,
      difference_amount: 0.05,
      total_amount: 0.57,
    },
  },
  {
    account: "Anthem",
    sow: "BOCA EHR Conversion",
    funnel: "70% - Proposals",
    type: "Net New",
    date_change: "11/04/2024 (42 Days)",
    change_amount: {
      actual_amount: 0.57,
      difference_amount: -0.05,
      total_amount: 0.52,
    },
  },
  {
    account: "Baptist Health",
    sow: "Data Viz Engineers+ SQL",
    funnel: "70% - Qualified",
    type: "Current New",
    date_change: "10/15/2024 (62 Days)",
    change_amount: {
      actual_amount: 0.62,
      difference_amount: -0.05,
      total_amount: 0.57,
    },
  },
  {
    account: "CVS",
    sow: "Tableau Developer #2",
    funnel: "70% - Qualified",
    type: "Current",
    date_change: "10/01/2024 (76 Days)",
    change_amount: {
      actual_amount: 0.67,
      difference_amount: -0.05,
      total_amount: 0.62,
    },
  },
];
const popupDataMonth = [
  {
    account: "Anthem",
    sow: "AWS/Snowflake Data Engineering",
    funnel: "70% - Renewals",
    type: "Net New",
    Start_Date: "12/10/2024",
    actual_amount: 0.62,
  },
  {
    account: "Baptist Health",
    sow: "OPs Team Renewal",
    funnel: "70% - Renewals",
    type: "Current New",
    Start_Date: "12/02/2024",
    actual_amount: 0.57,
  },
  {
    account: "CVS",
    sow: "Palm Beach Conversion Re...ron/Alka",
    funnel: "70% - Proposals",
    type: "Current",
    Start_Date: "11/20/2024",
    actual_amount: 0.52,
  },
];
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
          // Ensure the plugin is registered with Chart.js
          Chart.register(ChartDataLabels);
          $(".amount_by_sow_tab_data").hide();
          assignOverallData();
          $(".input-group-addon").hide();
          let userRole = localStorage.getItem("user-role");
          let userEmail = localStorage.getItem("email");
          if (userEmail == "akhilesh@factspan.com" || userRole == "admin") {
            $("#bu_head_block").show();
          } else {
            $("#bu_head_block").hide();
          }
          setTimeout(function () {
            $("#report_details").addClass("active");
            $("#sow_overall").addClass("active");
            $("#sow_main").addClass("active");
          }, 300);
          $("#close-popup, #popup-overlay, #popup-overlay-month").on(
            "click",
            function () {
              $("#popup-overlay, #popup-overlay-month").fadeOut();
              $("#popup,#popup-month").fadeOut();
            },
          );
          $(".buying_center_legend").hide();
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

let overallData = [];
const pathname = window.location.pathname;
// Extract the file name (last segment) from the pathname
const parts = pathname.split("/");
const fileName = parts.pop();
// let selectedBusinessHead = [], allBusinessHead = [];

function syncOverallSummaryFilterStateFromUI() {
  const selectedYear = $("#year_select_data").val();
  const selectedLeader = $("#bu_header_select").val();

  if (selectedYear) {
    overallSummaryFilterState.selectedYear = selectedYear.toString();
  }

  if (selectedLeader !== null && selectedLeader !== undefined) {
    overallSummaryFilterState.selectedBusinessHead = selectedLeader.toString();
  } else if (selectedBusinessHead.length > 0) {
    overallSummaryFilterState.selectedBusinessHead =
      selectedBusinessHead[0].toString();
  }
}

function getActiveOverallSummaryTab() {
  return overallSummaryFilterState.activeTab || "accountLevelTab";
}

function reapplyOverallSummaryActiveTab() {
  handleTabClick(getActiveOverallSummaryTab(), { skipStateUpdate: true });
}

const getOverallSummaryJson = async () => {
  let empId = localStorage.getItem("EmpUserID");
  let emp_dep = localStorage.getItem("Department");
  selectedBusinessHead = selectedBusinessHead.filter((item) => item !== "-1");
  let form_details = {
    emp_id: empId,
    department: emp_dep,
    BUSINESS_HEAD_FILTER: selectedBusinessHead,
  };
  $(".loader").css("display", "block"); // Show loader before API call
  $(".show_page").css("display", "none"); // Hide content
  const startTime = performance.now();
  try {
    let data = await fetch(apiValue.url_ip + ":5003/overallsummary_new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form_details),
    });
    const result = await data.json();
    const endTime = performance.now();

    const loadTimeInSeconds = (endTime - startTime) / 1000;
    getApiTime(
      loadTimeInSeconds,
      "reportOverallSummary",
      "Reports",
      "overallsummary",
      "success",
      fileName,
      "reportOverallSummary",
      "view",
    );
    // console.log("Overall Summary - ",result)
    overallData = Array.isArray(result.data_dict) ? result.data_dict : [];
    executiveSummaryJson = result.EXEC_SUMM_DATA;

    allBusinessHead = Array.isArray(result.BUSINESS_HEAD_ID_LST)
      ? result.BUSINESS_HEAD_ID_LST
      : [];
    $("#bu_header_select").empty();
    $("#year_select_data").empty();
    const preferredBusinessHead =
      overallSummaryFilterState.selectedBusinessHead ||
      (selectedBusinessHead.length > 0 ? selectedBusinessHead[0] : "-1");
    const preferredYear = overallSummaryFilterState.selectedYear;
    if (allBusinessHead.length > 0) {
      $("#bu_header_select").append(
        `<option value="-1" disabled selected hidden>Select Leader</option>`,
      );
      $("#bu_header_select").append(`<option value="-1">All</option>`);
      allBusinessHead.map((item) => {
        $("#bu_header_select").append(
          `<option value="${item.BUSINESS_HEAD}">${item.BUSINESS_HEAD_NAME}</option>`,
        );
      });
    } else {
      $("#bu_header_select").hide();
    }

    if (
      preferredBusinessHead &&
      $(`#bu_header_select option[value="${preferredBusinessHead}"]`).length > 0
    ) {
      $("#bu_header_select").val(preferredBusinessHead);
    } else if (selectedBusinessHead.length > 0) {
      $("#bu_header_select").val(selectedBusinessHead[0]);
    }
    //overallData = tempOverallData;
    overallData.map((yr, index) => {
      $("#year_select_data").append(
        `<option value="${yr.YEAR}">${yr.YEAR}</option>`,
      );
    });
    const d = new Date();
    let fallbackYear = d.getFullYear().toString();
    if (
      preferredYear &&
      $(`#year_select_data option[value="${preferredYear}"]`).length > 0
    ) {
      $("#year_select_data").val(preferredYear);
    } else if (
      $(`#year_select_data option[value="${fallbackYear}"]`).length > 0
    ) {
      $("#year_select_data").val(fallbackYear);
    } else {
      $("#year_select_data").prop("selectedIndex", 0);
    }
    // $("#year_select_data").multiselect("reload");
    // $("#year_select_data").multiselect({
    //   columns: 1,
    //   placeholder: "Year",
    //   // search: true,
    // });
    let yearData = [];
    let selectedYearValue = $("#year_select_data").val();
    let selectYearData = overallData.map((ra) => {
      if (ra.YEAR.toString() === selectedYearValue) {
        yearData = ra.YEAR_DATA;
      }
      return yearData;
    });
    let shortNewYr = selectedYearValue.toString().substr(-2);
    syncOverallSummaryFilterStateFromUI();
    prepareOverallDatatoUI(yearData, shortNewYr);
    reapplyOverallSummaryActiveTab();
    $(".loader").css("display", "none");
    $(".show_page").css("display", "block");
  } catch (error) {
    const endTime = performance.now();
    const loadTimeInSeconds = (endTime - startTime) / 1000;
    getApiTime(
      loadTimeInSeconds,
      "reportOverallSummary",
      "Reports",
      "overallsummary",
      "success",
      fileName,
      "reportOverallSummary",
      "view",
    );
    console.error("Error occurred while fetching data:", error);
    $(".overall-summary-data-block").empty();
    $(".overall-summary-data-block").html(`<div class="error-container">
                                            <div class="error-icon">⚠️</div>
                                            <h1 class='error-message-text'>Oops! Something went wrong.</h1>
                                            <p class='error-message-text_sub'>We're having some trouble loading this page. Please try again in a moment.</p>
                                            <button class="retry-button" onclick="location.reload()">Try Again</button>
                                          </div>`);
    $("#report_overall_summary").empty();
    $("#report_last_diff").empty();
    $("#report_overall_summary_body").empty();
    $(".loader").css("display", "none");
    $(".show_page").css("display", "block");
    // handle error here
  }
};

function getSelectedYear() {
  let selectedYears = $("#year_select_data").val();
  overallSummaryFilterState.selectedYear = selectedYears
    ? selectedYears.toString()
    : null;
  console.log("selectedYears - ", selectedYears);
  // Filter overall data for the selected years
  let yearData = [];
  // selectedYears.forEach((selectedYear) => {
  overallData.forEach((ra) => {
    if (ra.YEAR.toString() === selectedYears) {
      yearData = yearData.concat(ra.YEAR_DATA); // Append the data for the matching year
    }
  });
  // });

  // Extract last two digits for shortNewYr
  // let shortNewYr = selectedYears.map((year) => year.substr(-2)); // Extract last two digits for all selected years
  let shortNewYr = selectedYears.substr(-2); // Extract last two digits for all selected years

  // Update the UI with the selected year data
  prepareOverallDatatoUI(yearData, shortNewYr);

  // Clear buying center cache when year changes
  buyingCenterApiData = [];

  reapplyOverallSummaryActiveTab();
}

function applyYearSelected() {
  // $("#apply-all-year").on("click", function () {
  // Retrieve all selected years
  let selectedYears = $("#year_filter input[type='checkbox']:checked")
    .map(function () {
      return $(this).val();
    })
    .get();

  // Filter overall data for the selected years
  let yearData = [];
  selectedYears.forEach((selectedYear) => {
    overallData.forEach((ra) => {
      if (ra.YEAR.toString() === selectedYear) {
        yearData = yearData.concat(ra.YEAR_DATA); // Append the data for the matching year
      }
    });
  });

  // Extract last two digits for shortNewYr
  let shortNewYr = selectedYears.map((year) => year.substr(-2)); // Extract last two digits for all selected years

  // Update the UI with the selected year data
  prepareOverallDatatoUI(yearData, shortNewYr);

  // Update the dropdown button label to reflect the selected year(s)
  $("#year_dropdown_btn").text(`${selectedYears.join(", ")}`);
  selectYear();
  // });
}
function yearCancel() {
  selectYear();
}

function selectYear(e) {
  // e.preventDefault();
  const iconElement = $(this).children("i");

  const isOpen = $(this).attr("aria-expanded") === "true";
  let icon = $(this).find("i");
  // Get the button element
  var button = document.getElementById("year_dropdown_btn");

  // Get the current value of the aria-expanded attribute
  var isExpanded = button.getAttribute("aria-expanded");

  // Log or use the current status of aria-expanded
  console.log("Button aria-expanded status:", isExpanded);

  if (isExpanded) {
    $("#year_dropdown_btn_container .dropdown-menu").slideUp();
    $(this).attr("aria-expanded", "false");
    $(this).find("i").removeClass("fa-chevron-up").addClass("fa-chevron-down");
  } else {
    $("#year_dropdown_btn_container .dropdown-menu").slideDown();
    $(this).attr("aria-expanded", "true");
    $(this).find("i").removeClass("fa-chevron-down").addClass("fa-chevron-up");
  }
}

function changeBUHead() {
  let buSelectedValue = $("#bu_header_select").val();
  overallSummaryFilterState.selectedBusinessHead = buSelectedValue
    ? buSelectedValue.toString()
    : "-1";
  // selectedBusinessHead = []
  $("#report_overall_summary").empty();
  $("#report_last_diff").empty();
  $("#report_overall_summary_body").empty();
  $("#sow_by_level_data tbody").empty();
  $("#report_sow_acc_signed").empty();
  $("#report_buying_center_body").empty(); // Clear buying center table
  sowAmtbySow = [];
  sowAmtbySowActual = [];
  let tempSelect = [];
  if (buSelectedValue !== "-1") {
    $(".loader").show();
    $(".show_page").hide();
    selectedBusinessHead = [];
    selectedBusinessHead.push(buSelectedValue);
    getOverallSummaryJson();
    buyingCenterApiData = []; // Clear buying center cache
  } else if (selectedBusinessHead.length > 0) {
    if (selectedBusinessHead[0] != "-1") {
      $(".loader").show();
      $(".show_page").hide();
      selectedBusinessHead = [];
      selectedBusinessHead.push(buSelectedValue);
      getOverallSummaryJson();
      buyingCenterApiData = [];
    }
  } else {
    getOverallSummaryJson();
    buyingCenterApiData = [];
  }
}

function assignOverallData() {
  if (overallData == 0) {
    getOverallSummaryJson();
  } else {
    const d = new Date();
    let year = d.getFullYear();
    let shortYr = year.toString().substr(-2);
    $("#previousYr").val(shortYr - 1);
    $("#previousYr_label").html(year - 1);
    $("#currentYr").val(shortYr);
    $("#currentYr_label").html(year);
    $("#futureYr").val((year + 1).toString().substr(-2));
    $("#futureYr_label").html(year + 1);
    let selectedYearval = "";
    let selectedYr = $("input[type='radio'][name='year_filter']:checked").val();
    if (selectedYr.length > 0) {
      selectedYearval = selectedYr;
    }
    let yearData = [];
    let selectYearData = overallData.map((ra) => {
      if (ra.YEAR == selectedYr) {
        yearData = ra.YEAR_DATA;
      }
      return yearData;
    });
    let shortNewYr = selectedYearval.toString().substr(-2);
    prepareOverallDatatoUI(yearData, shortNewYr);
  }
}

function toggleSignedRows(clickedElement, sectionRowsCount) {
  let row = $(clickedElement).closest("tr"); // Get the clicked row
  let nextRows = row.nextUntil(":not(.singedGroup)"); // Get the following rows with the same group class
  let overallRow = $("#factspan_overall_sum"); // Get the "Overall" row
  let icon = $(clickedElement).find("i"); // Get the icon inside the clicked row

  // Toggle the visibility of the next rows
  nextRows.toggle();

  // Check if we are expanding or collapsing
  let isExpanding = nextRows.is(":visible");

  // Get the current rowspan of the "Overall" row
  let currentRowspan = parseInt(overallRow.attr("rowspan")) || sectionRowsCount;

  // Adjust the rowspan based on expand/collapse
  if (isExpanding) {
    // Add the section's row count to the rowspan
    overallRow.attr("rowspan", currentRowspan + sectionRowsCount);
    // Change icon to compress
    icon.removeClass("fa-expand").addClass("fa-compress");
    // Remove the 'noExl' class from visible rows
    nextRows.removeClass("noExl");
  } else {
    // Subtract the section's row count from the rowspan
    overallRow.attr("rowspan", currentRowspan - sectionRowsCount);
    // Change icon to expand
    icon.removeClass("fa-compress").addClass("fa-expand");
    // Add the 'noExl' class to hidden rows
    nextRows.addClass("noExl");
  }

  // Recalculate the overall rowspan based on total visible rows
  recalculateOverallRowspan();
}

function toggleAccountSignedRows(clickedElement, sectionRowsCount) {
  let accID = $(clickedElement).attr("data-id");

  let row = $(clickedElement).closest("tr"); // Get the clicked row
  let nextRows = row.nextUntil(":not(.singedGroup)"); // Get the following rows with the same group class

  // Get the following rows with the same group class
  let overallRow = $(`.factspan_account_sum_${accID}`); // Get the "Overall" row

  let icon = $(clickedElement).find("i"); // Get the icon inside the clicked row

  // Toggle the visibility of the next rows
  nextRows.toggle();

  // Check if we are expanding or collapsing
  let isExpanding = nextRows.is(":visible");

  // Adjust the rowspan attribute based on the visibility of the next rows
  let currentRowspan = parseInt(overallRow.attr("rowspan")) || sectionRowsCount;
  let rowsVisible = nextRows.filter(":visible").length;
  let rowsHidden = nextRows.length - rowsVisible;

  if (isExpanding) {
    // Increase the rowspan count
    overallRow.attr("rowspan", currentRowspan + rowsHidden);
    // Change icon to compress
    icon.removeClass("fa-expand").addClass("fa-compress");
    // Remove 'noExl' class from visible rows
    nextRows.removeClass("noExl");
  } else {
    // Decrease the rowspan count
    overallRow.attr("rowspan", currentRowspan - rowsHidden);
    // Change icon to expand
    icon.removeClass("fa-compress").addClass("fa-expand");
    // Add 'noExl' class to hidden rows
    nextRows.addClass("noExl");
  }
}
window.toggleAccountSignedRows = function (clickedElement, sectionRowsCount) {
  let row = $(clickedElement).closest("tr"); // Get the clicked row

  // Ensure that .signedGroup rows follow directly after the clicked row
  let nextRows = row.nextUntil(":not(.signedGroup)"); // Get all signedGroup rows until the next row without the class

  if (nextRows.length === 0) {
    return; // If no rows found, exit the function
  }

  // Toggle the visibility of the next rows
  nextRows.toggle();

  let isExpanding = nextRows.is(":visible"); // Check if rows are being expanded
  let accID = $(clickedElement).data("id"); // Get the account ID
  let overallRow = $(`.factspan_account_sum_${accID}`); // Get the overall row

  // Get the current rowspan for the overall row
  let currentRowspan = parseInt(overallRow.attr("rowspan")) || sectionRowsCount;
  let rowsToToggle = nextRows.length; // Number of rows to be toggled

  if (isExpanding) {
    overallRow.attr("rowspan", currentRowspan + rowsToToggle); // Increase rowspan
    $(clickedElement)
      .find("i")
      .removeClass("fa-expand")
      .addClass("fa-compress"); // Change icon to compress
  } else {
    overallRow.attr("rowspan", currentRowspan - rowsToToggle); // Decrease rowspan
    $(clickedElement)
      .find("i")
      .removeClass("fa-compress")
      .addClass("fa-expand"); // Change icon to expand
  }
};

// Helper function to calculate the total visible rows and adjust the "Overall" row's rowspan
function recalculateOverallRowspan() {
  let overallRow = $("#factspan_overall_sum"); // Get the "Overall" row
  let overallRowArrow = $("#factspan_overall_sum_arrow");
  let visibleGroupRows = $("#report_overall_summary_body").find(
    ".singedGroup:visible",
  ).length; // Count all visible group rows

  // Base rowspan is 4 (adjust this based on your initial data), add the visible rows
  let baseRowspan = 4;
  overallRow.attr("rowspan", baseRowspan + visibleGroupRows);
  overallRowArrow.attr("rowspan", baseRowspan + visibleGroupRows);
}

// Helper function to calculate total visible rows and adjust rowspan accordingly
function adjustOverallRowspan(baseRowspan) {
  let totalVisibleRows = $("#report_overall_summary_body").find(
    ".singedGroup:visible",
  ).length; // Count all visible group rows
  let overallRow = $("#factspan_overall_sum");

  // Adjust the overall rowspan based on the total number of visible rows plus the base row count
  overallRow.attr("rowspan", baseRowspan + totalVisibleRows);
}

function toggleStatusRows() {
  // Toggle the visibility of rows with the class 'new-logo-row'
  $(".new-logo-row").toggle();

  // Update the text of the toggle button based on the visibility
  let statusBtn = $(".status_btn_show_hide");
  if ($(".new-logo-row").is(":visible")) {
    statusBtn.text("Hide - New Logo, Current, Current New, Net New");
    // Remove 'noExl' class from visible rows
    $(".new-logo-row").removeClass("noExl");
  } else {
    statusBtn.text("Show - New Logo, Current, Current New, Net New");
    // Add 'noExl' class to hidden rows
    $(".new-logo-row").addClass("noExl");
  }
}

function prepareOverallDatatoUI(overallSummData, selectedYearval) {
  console.log("prepareOverallDatatoUI overallSummData - ", overallSummData);
  console.log("prepareOverallDatatoUI selectedYearval - ", selectedYearval);
  $("#report_overall_summary").empty();
  $("#report_last_diff").empty();
  $("#report_overall_summary_body").empty();
  let selectedYearvalTypeArray = false;
  if (Array.isArray(selectedYearval)) {
    selectedYearvalTypeArray = true;
    // $.each(selectedYearval, function (key, value) {
    //   console.log("key", key);
    //   console.log("value", value);
    if (selectedYearval.length == 1) {
      console.log("selectedYearval--->", selectedYearval);

      assignDatatoTable(overallSummData, selectedYearval);
    } else {
      assignDatatoTableMultipleYear(overallSummData, selectedYearval);
    }
    // })
  } else {
    // console.log("It is a string");
    selectedYearvalTypeArray = false;

    assignDatatoTable(overallSummData, selectedYearval);
    createChartData();
    // const d = new Date();
    // let year = d.getFullYear();
    // console.log("year - "+year);
    // $("#year_select_data").val();
    // $("#year_select_data").val(year);
  }
  // } else if (typeof selectedYearval === 'string') {
  //     console.log('It is a string');
  // }
  // $.each(selectedYearval, function (key, value) {
  //   console.log("key", key);
  //   console.log("value", value);
  // })
  // Check if overallSummData is an array or an object
}

function generatePopupContent(key) {
  const data = popupData[key];

  if (!data) return `<p>No data available for this selection.</p>`;
  return `
      <h3>${data.title}</h3>
      <p>Data: ${data.data}</p>
      <p>Type: ${data.type}</p>
      <p>Details: ${data.details}</p>
  `;
}

// function showPopup(data, element, actualTempVal) {
//   if (!actualTempVal) {
//     return;
//   } else {
//     const popupContent = `Popup content for`;
//     let popupHtml = '';
//     data?.map((item) => {
//       const actualAmount = item.change_amount.actual_amount ?? 0;
//       const differenceAmount = item.change_amount.difference_amount ?? 0;
//       const totalAmount = item.change_amount.total_amount ?? 0;
//       popupHtml += `<tr>
//         <td>${item.account}</td>
//         <td><div class='table_sow_name'>${item.sow}</div></td>
//         <td>${item.funnel}</td>
//         <td>${item.type}</td>
//         <td>${item.date_change}</td>
//         <td>
//           <div class='table_data_difference'>
//             <div>${actualAmount.toFixed(2)}</div>
//             <div class='${differenceAmount > 0 ? 'positive_val' : 'negative_val'}'>
//               ${differenceAmount > 0 ? '+' : ''}${differenceAmount.toFixed(2)}
//             </div>
//             <div>= ${totalAmount.toFixed(2)}</div>
//           </div>
//         </td>
//       </tr>`;
//     });

//     $('#popupTableBody').html(popupHtml);

//     const $element = $(element);
//     $('.table-cell').removeClass('highlighted-cell');
//     $element.addClass('highlighted-cell');

//     const offset = $element.offset();
//     const popupWidth = $('#popup').outerWidth();
//     const popupHeight = $('#popup').outerHeight();
//     const windowWidth = $(window).width();
//     const windowHeight = $(window).height();
//     const scrollTop = $(window).scrollTop();

//     // Calculate position and adjust to ensure the popup stays within the viewport
//     let popupTop = offset.top + $element.outerHeight() + 5;
//     let popupLeft = offset.left - popupWidth / 2 + $element.outerWidth() / 2;

//     // If popup goes outside the right edge of the window, adjust it
//     if (popupLeft + popupWidth > windowWidth) {
//       popupLeft = windowWidth - popupWidth - 10; // Align with the right edge
//     }

//     // If popup goes outside the left edge of the window, adjust it
//     if (popupLeft < 0) {
//       popupLeft = 10; // Add padding from the left edge
//     }

//     // If popup goes below the window, position it above the element
//     if (popupTop + popupHeight > windowHeight + scrollTop) {
//       popupTop = offset.top - popupHeight - 5; // Position above the element
//     }

//     // If popup goes above the window, ensure it stays within bounds
//     if (popupTop < scrollTop) {
//       popupTop = scrollTop + 10; // Add padding from the top edge
//     }

//     $('#popup')
//       .css({
//         top: popupTop,
//         left: popupLeft,
//         maxHeight: '280px', // Set a maximum height (adjust as needed)
//         height: 'auto', // Let it adjust automatically based on content
//         overflowY: 'auto', // Enable vertical scrolling if content exceeds maxHeight
//       })
//       .fadeIn();

//     $('#popup-overlay').fadeIn();
//   }
// }

let popupVisible = false;

async function showPopup(
  sowStatus,
  month,
  accid,
  selectedYearval,
  element,
  dataType,
) {
  let totalActualAmount = 0;
  console.log(
    "sowStatus - ",
    sowStatus,
    "month - ",
    month,
    "accid - ",
    accid,
    "selectedYearval - ",
    selectedYearval,
  );
  $("#popupTableBody").empty();
  let APIDataForQF;
  if (dataType == "multi") {
    let selMnth = month.split("_");
    selectedYearval = selMnth[1];
  }
  try {
    APIDataForQF = await popupQFAPI(sowStatus, month, accid, selectedYearval);
    console.log("APIDataForQF - ", APIDataForQF);
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return;
  }

  let popupData = APIDataForQF.map((item) => ({
    account: item.ACCOUNT_NAME,
    sow: item.SOW_NAME,
    type: item.SOW_TYPE,
    id: item.SOW_ID,
    unique_id: item.UNIQUE_ID,
    startDate: new Date(item.LEGAL_START_DATE),
    amount: item.AMOUNT == "-" ? "-" : item.AMOUNT / 1000000,
  }));

  function renderTable(data) {
    let totalActualAmount = 0; // Initialize before accumulating values

    let popupHtml = data
      .map((item) => {
        let formattedDate = item.startDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        let projected_amt = item.amount === "-" ? "-" : item.amount.toFixed(3);

        // Debugging: Check amount value
        console.log("Amount:", item.amount);

        // Accumulate total amount (since it's already divided by 1,000,000)
        let projectedAmount =
          item.amount === "-" ? 0 : parseFloat(item.amount) || 0;
        totalActualAmount += projectedAmount;

        return `<tr>
            <td>${item.account}</td>
            <td>
                <div class='table_sow_name' 
                   onclick="handleSOWClick('${item.id}', '${item.unique_id}')"
                    role="button" 
                    tabindex="0"
                    style="cursor: pointer;"> 
                    ${item.sow}
                </div>
            </td>
            <td>${item.type}</td>
            <td>${formattedDate}</td>
            <td>${projected_amt}</td>
        </tr>`;
      })
      .join("");

    console.log("Total Actual Amount:", totalActualAmount);

    $("#popupTableBody").html(popupHtml);

    // No need to divide by 1,000,000 again
    $("#totalAmount-quarter").text(totalActualAmount.toFixed(3));
  }
  renderTable(popupData);

  // Sorting Functionality
  function sortTable(column, type) {
    let header = $(`#${column}Header`);
    let sortOrder = header.attr("data-sort") === "asc" ? 1 : -1;

    popupData.sort((a, b) => {
      if (type === "string") {
        return a[column].localeCompare(b[column]) * sortOrder;
      } else if (type === "date") {
        return (new Date(a[column]) - new Date(b[column])) * sortOrder;
      } else if (type === "number") {
        return (parseFloat(a[column]) - parseFloat(b[column])) * sortOrder;
      }
    });

    // Toggle sort order
    let newSortOrder = sortOrder === 1 ? "desc" : "asc";
    header.attr("data-sort", newSortOrder);

    // Update sorting symbols only for the clicked column
    let text = header.text().replace(" ▲", "").replace(" ▼", "");
    header.text(text + (newSortOrder === "asc" ? " ▲" : " ▼"));

    renderTable(popupData);
  }

  $("#accountHeader")
    .off("click")
    .on("click", function () {
      sortTable("account", "string");
    });

  $("#startDateHeader")
    .off("click")
    .on("click", function () {
      sortTable("startDate", "date");
    });

  $("#amountHeader")
    .off("click")
    .on("click", function () {
      sortTable("amount", "number");
    });

  // Popup positioning
  const $element = $(element);
  $(".table-cell").removeClass("highlighted-cell");
  $element.addClass("highlighted-cell");

  const setPosition = () => {
    const offset = $element.offset();
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();
    const scrollTop = $(window).scrollTop();

    $("#popup").css({
      visibility: "hidden",
      display: "block",
      top: 0,
      left: 0,
    });

    requestAnimationFrame(() => {
      const popupWidth = $("#popup").outerWidth();
      const popupHeight = $("#popup").outerHeight();

      let popupTop = offset.top + $element.outerHeight() + 5;
      let popupLeft = offset.left - popupWidth / 2 + $element.outerWidth() / 2;

      if (popupLeft + popupWidth > windowWidth) {
        popupLeft = windowWidth - popupWidth - 10;
      }
      if (popupLeft < 0) {
        popupLeft = 10;
      }
      if (popupTop + popupHeight > windowHeight + scrollTop) {
        popupTop = offset.top - popupHeight - 5;
      }
      if (popupTop < scrollTop) {
        popupTop = scrollTop + 10;
      }

      console.log("popupTop - ", popupTop, "popupLeft - ", popupLeft);

      $("#popup")
        .css({
          visibility: "visible",
          top: popupTop,
          left: popupLeft,
          maxHeight: "280px",
          height: "auto",
          overflowY: "auto",
        })
        .fadeIn();

      $("#popup").scrollTop(0);
      $("#popup-overlay").fadeIn();
    });
  };

  setPosition();

  $("#popup-overlay").on("click", () => {
    $("#popup").fadeOut();
    $("#popup-overlay").fadeOut();
    $(window).off("scroll.popup");
  });
}
// Global sorting state variables
let isAccountAscending = false;
let isAmountAscending = false;
let isStartDateAscending = false;

function showPopupMonth(originalData, element) {
  let totalActualAmount = 0;

  // **Clone Data Before Sorting**
  let data = [...originalData];

  // **Initial Sorting by Amount (Descending)**
  if (!element) {
    data.sort((a, b) => b.AMOUNT - a.AMOUNT);
  }

  let popupHtml = data
    .map((item) => {
      totalActualAmount += item.AMOUNT;
      return `<tr>
            <td>${item.ACCOUNT_NAME}</td>
            <td>
                <div class='table_sow_name' onclick="handleSOWClick('${
                  item.SOW_ID
                }', '${item.UNIQUE_ID}')"
                    role="button" tabindex="0" style="cursor: pointer;">
                    ${item.SOW_NAME}
                </div>
            </td>
            <td>${item.SOW_TYPE}</td>
            <td>${item.START_DATE}</td>
            <td>${(item.AMOUNT / 1000000).toFixed(3)}</td>
        </tr>`;
    })
    .join("");

  $("#popupTableBodyMonth").html(popupHtml);
  $("#totalAmount").text((totalActualAmount / 1000000).toFixed(3));

  // **Set Initial Arrow for Amount**

  if (originalData.length > 1) {
    $("#amountHeadermonth").html(`Amount ${isAmountAscending ? "▲" : "▼"}`);
    $("#startDateHeadermonth").html(
      `START DATE ${isStartDateAscending ? "▲" : "▼"}`,
    );
    $("#accountHeadermonth").html(`ACCOUNT ${isAccountAscending ? "▲" : "▼"}`);
  } else {
    $("#amountHeadermonth").html(`Amount`);
    $("#startDateHeadermonth").html(`START DATE`);
    $("#accountHeadermonth").html(`ACCOUNT`);
  }
  // **Sorting for Account Name**
  $("#accountHeadermonth")
    .off("click")
    .on("click", function () {
      isAccountAscending = !isAccountAscending;
      let arrow = isAccountAscending ? " ▲" : " ▼";
      $("#accountHeadermonth").html(`ACCOUNT ${arrow}`);

      let sortedData = [...data].sort((a, b) => {
        let nameA = a.ACCOUNT_NAME ? a.ACCOUNT_NAME.trim().toLowerCase() : "";
        let nameB = b.ACCOUNT_NAME ? b.ACCOUNT_NAME.trim().toLowerCase() : "";
        return isAccountAscending
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
      $("#accountHeadermonth").html(
        `Account ${isAccountAscending ? "▲" : "▼"}`,
      );

      showPopupMonth(sortedData, element);
    });

  // **Sorting for Amount**
  $("#amountHeadermonth")
    .off("click")
    .on("click", function () {
      isAmountAscending = !isAmountAscending;
      let arrow = isAmountAscending ? " ▲" : " ▼";
      $("#amountHeadermonth").html(`AMOUNT ${arrow}`);

      data.sort((a, b) =>
        isAmountAscending ? a.AMOUNT - b.AMOUNT : b.AMOUNT - a.AMOUNT,
      );
      showPopupMonth(data, element);
      // Update the arrow **AFTER** re-rendering
      arrow = isAmountAscending ? " ▲" : " ▼";
      $("#amountHeadermonth").html(`AMOUNT ${arrow}`);
    });

  // **Sorting for Start Date**
  $("#startDateHeadermonth")
    .off("click")
    .on("click", function () {
      isStartDateAscending = !isStartDateAscending;
      let arrow = isStartDateAscending ? " ▲" : " ▼";
      $("#startDateHeadermonth").html(`START DATE ${arrow}`);

      data.sort((a, b) =>
        isStartDateAscending
          ? new Date(a.START_DATE) - new Date(b.START_DATE)
          : new Date(b.START_DATE) - new Date(a.START_DATE),
      );
      $("#startDateHeadermonth").html(
        `START DATE ${isStartDateAscending ? "▲" : "▼"}`,
      );
      showPopupMonth(data, element);
    });

  // **Show Popup Without Blinking**
  if (!$("#popup-month").is(":visible")) {
    const $element = $(element);
    $(".table-cell").removeClass("highlighted-cell");
    $element.addClass("highlighted-cell");
    const offset = $element.offset();
    const viewportHeight = $(window).height();
    let topPosition = offset.top + $element.outerHeight() + 2;
    const minTopPosition = 20;
    if (
      topPosition + $("#popup-month-account").outerHeight() >
      viewportHeight
    ) {
      topPosition = offset.top - $("#popup-month-account").outerHeight() - 2;
    }
    if (topPosition < minTopPosition) {
      topPosition = minTopPosition;
    }
    $("#popup-month")
      .css({
        top: topPosition,
        left: offset.left,
        maxHeight: "300px",
        height: "auto",
        overflowY: "auto",
        display: "none",
      })
      .fadeIn();
    $("#popup-overlay-month").fadeIn();
  }
}

function showPopupMonthAcc(originalData, element) {
  let totalActualAmount = 0;
  let data = [...originalData];

  let popupHtml = data
    .map((item) => {
      totalActualAmount += item.AMOUNT;

      return `<tr>
            <td>${item.ACCOUNT_NAME}</td>
            <td>
                <div class='table_sow_name' onclick="handleSOWClick('${
                  item.SOW_ID
                }', '${item.UNIQUE_ID}')"
                    role="button" tabindex="0" style="cursor: pointer;">
                    ${item.SOW_NAME}
                </div>
            </td>
            <td>${item.FUNNEL}</td>
            <td>${item.SOW_TYPE}</td>
            <td>${item.START_DATE}</td>
            <td>${(item.AMOUNT / 1000000).toFixed(3)}</td>
        </tr>`;
    })
    .join("");

  $("#popupTableBodyMonthAccount").html(popupHtml);
  $("#totalAmount-account").text((totalActualAmount / 1000000).toFixed(3));

  // **Update header text with correct sorting arrow**
  if (originalData.length > 1) {
    $("#amountHeaderAcc").html(`Amount ${isAmountAscending ? "▲" : "▼"}`);
    $("#startDateHeaderAcc").html(
      `START DATE ${isStartDateAscending ? "▲" : "▼"}`,
    );
  } else {
    $("#amountHeaderAcc").html(`Amount`);
    $("#startDateHeaderAcc").html(`START DATE`);
  }

  // **Attach Sorting Events If Multiple Rows Exist**
  if (originalData.length > 1) {
    $("#amountHeaderAcc")
      .off("click")
      .on("click", function () {
        isAmountAscending = !isAmountAscending;

        data.sort((a, b) =>
          isAmountAscending ? a.AMOUNT - b.AMOUNT : b.AMOUNT - a.AMOUNT,
        );

        $("#amountHeaderAcc").html(`Amount ${isAmountAscending ? "▲" : "▼"}`);
        showPopupMonthAcc(data, element);
      });

    $("#startDateHeaderAcc")
      .off("click")
      .on("click", function () {
        isStartDateAscending = !isStartDateAscending;

        data.sort((a, b) =>
          isStartDateAscending
            ? new Date(a.START_DATE) - new Date(b.START_DATE)
            : new Date(b.START_DATE) - new Date(a.START_DATE),
        );

        $("#startDateHeaderAcc").html(
          `START DATE ${isStartDateAscending ? "▲" : "▼"}`,
        );
        showPopupMonthAcc(data, element);
      });
  } else {
    $("#amountHeaderAcc").off("click");
    $("#startDateHeaderAcc").off("click");
  }

  // **Show Popup Without Blinking**
  if (!$("#popup-month-account").is(":visible")) {
    const $element = $(element);
    $(".table-cell").removeClass("highlighted-cell");
    $element.addClass("highlighted-cell");
    const offset = $element.offset();
    const viewportHeight = $(window).height();
    let topPosition = offset.top + $element.outerHeight() + 2;
    const minTopPosition = 20;
    if (
      topPosition + $("#popup-month-account").outerHeight() >
      viewportHeight
    ) {
      topPosition = offset.top - $("#popup-month-account").outerHeight() - 2;
    }
    if (topPosition < minTopPosition) {
      topPosition = minTopPosition;
    }
    $("#popup-month-account")
      .css({
        top: topPosition,
        left: offset.left,
        maxHeight: "300px",
        height: "auto",
        overflowY: "auto",
        display: "none",
      })
      .fadeIn();
    $("#popup-overlay-month-account").fadeIn();
  }
}

function closePopup() {
  $("#popup").fadeOut(); // Hide the popup
  $("#popup-overlay").fadeOut(); // Hide the overlay
  // Remove the highlight class from all cells
  $(".table-cell").each(function () {
    $(this).removeClass("highlighted-cell");
  });
}
function closePopupMonth() {
  // Ensure this only targets the popup and not other elements
  $("#popup-overlay-month").fadeOut();

  $("#popup-month").fadeOut(); // Hide the popup
  $("#popup-overlay").fadeOut(); // Hide the overlay

  // Remove the highlight class from all cells
  $(".table-cell").each(function () {
    $(this).removeClass("highlighted-cell");
  });
}

function closePopupMonthAccount() {
  $("#popup-month-account").fadeOut(); // Hide the popup
  $("#popup-overlay-month-account").fadeOut(); // Hide the overlay
  // Remove the highlight class from all cells
  $(".table-cell").each(function () {
    $(this).removeClass("highlighted-cell");
  });
}
function assignDatatoTable(overallSummData, selectedYearval) {
  let accountHeaders = [];

  if (Array.isArray(overallSummData)) {
    // If it's an array, iterate through each element and gather headers
    overallSummData.forEach((item) => {
      accountHeaders.push(...item.HEADER_MONTHS); // Collect HEADER_MONTHS from each item
    });
  } else {
    // If it's a single object, access HEADER_MONTHS directly
    accountHeaders = overallSummData.HEADER_MONTHS;
  }

  let accHeaderMnthHtml = "",
    accHeaderHtml = "",
    accHeaderQtrHtml = "",
    accHeaderQtrHTML = "",
    accOtherHeaderHTML = "";

  // Separate months and quarters
  let monthsArray = accountHeaders.filter(
    (header) => !header.startsWith("Q") && !header.startsWith("os_"),
  );
  let quartersArray = accountHeaders.filter((header) => header.startsWith("Q"));

  quartersArray = quartersArray.filter(
    (header) => !/^Q[1-4]_(30|60|90|180)_days_\d{2}$/.test(header),
  );
  let fyArray = accountHeaders
    .filter((header) => header.startsWith("os_FY"))
    .map((header) => header.replace("os_", ""));

  let otherHeaders = accountHeaders
    .filter(
      (header) =>
        header.startsWith("os_") &&
        !header.startsWith("os_FY") &&
        !header.startsWith("os_gr"),
    )
    .map((header) => header.replace("os_", ""));

  let AccountHeadermonts = monthsArray.filter((head) => {
    const splitHead = head.split("_");
    // Check if the last part (year) is included in the selectedYearval array
    return selectedYearval.includes(splitHead[splitHead.length - 1]);
  });

  let AccountHeaderQtr = quartersArray.filter((head) => {
    const splitHead = head.split("_");
    return selectedYearval.includes(splitHead[splitHead.length - 1]);
  });
  let AccountHeaderFY = fyArray.filter((head) => {
    const splitHead = head.split("_");
    return selectedYearval.includes(splitHead[splitHead.length - 1]);
  });

  let AccountHeaderOther = otherHeaders.filter((head) => {
    const splitHead = head.split("_");
    return selectedYearval.includes(splitHead[splitHead.length - 1]);
  });

  $.each(AccountHeadermonts, function (i) {
    accHeaderMnthHtml += `<th style='z-index: 105;' rowspan='2'>${AccountHeadermonts[
      i
    ].replace("_", "-")}</th>`;
  });

  $.each(AccountHeaderQtr, function (i) {
    let quarterId = AccountHeaderQtr[i].replace("_", "-"); // Create a unique ID for each quarter

    // Add icon inside the first <th>
    accHeaderQtrHTML += `<th class='qtr-header' rowspan='2'>
        ${quarterId} 
        <i class="fa fa-expand icon-custom-style ${quarterId}" aria-hidden="true"  onclick="toggleQuarter('${quarterId}')"></i>
    </th>`;

    // Extract "Q1_25", "Q2_25", etc.
    let match = AccountHeaderQtr[i].match(/^(Q[1-4]_\d{2})/);
    if (match) {
      accHeaderQtrHTML += `<th id="${quarterId}" class="quarter-details" style='z-index: 105; display: none;' colspan='3'>${match[1].replace(
        "_",
        "-",
      )}</th>`;
    }
  });

  $.each(AccountHeaderFY, function (i) {
    accHeaderQtrHTML += `<th style='z-index: 105; background-color: #DFEDF6 !important';color:#818199;font-weight:600 !important' class="header-col" rowspan='2'>${AccountHeaderFY[
      i
    ].replaceAll("_", " ")}</th>`;
  });
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const excludeDays = "180"; // Days to exclude for quarters
  $.each(quarters, function (qIndex, qtr) {
    $.each(AccountHeaderOther, function (i, header) {
      // Exclude 180_days headers for the quarters
      if (!header.startsWith(`${excludeDays}_days_`)) {
        // Use the quarter as the unique identifier and append the year dynamically
        let quarterId = `${qtr}-${selectedYearval.toString().slice(-2)}`; // Example: "Q1-25"
        accOtherHeaderHTML += `<th style='z-index: 105; display:none' id='${quarterId}'>${header
          .replaceAll("_", " ")
          .replace(` ${selectedYearval}`, "")}</th>`;
      }
    });
  });

  // Add the extra set (after the last quarter) that includes all columns (30, 60, 90, 180)
  $.each(AccountHeaderOther, function (i, header) {
    accOtherHeaderHTML += `<th style='z-index: 105;' id='extra_set_${header}'>${header
      .replaceAll("_", " ")
      .replace(` ${selectedYearval}`, "")}</th>`;
  });

  accHeaderHtml = `<th class='first_column' rowspan='2' style='z-index: 106;color:#818199'>Account Name</th>
    <th style='z-index: 105;color:#818199; font-weight:600 !important'; class="header-col second_colum" rowspan='2'></th> 
    ${accHeaderMnthHtml}
    ${accHeaderQtrHTML}
    <th style='z-index: 105;' colspan='4'><b>FY ${selectedYearval} REVENUE CHANGE IN THE LAST</b></th>`;

  $("#report_overall_summary").append(accHeaderHtml);
  $("#report_last_diff").append(accOtherHeaderHTML);

  let factspanData = Array.isArray(overallSummData)
    ? overallSummData.flatMap((item) => item.FACTSPAN_DATA || []) // Use flatMap to get FACTSPAN_DATA from all items
    : overallSummData.FACTSPAN_DATA || []; // Directly access FACTSPAN_DATA if it's a single object

  let overall_fact_len = factspanData.length;

  const monthlyRegex = /^[A-Za-z]{3}_\d{2}$/; // Months (e.g., Jan_25, Feb_25)
  const quarterlyRegex = /^Q\d_\d{2}$/; // Quarterly (Q1_25, Q2_25)
  const daysBucketsRegex = /^Q(\d+)_(\d+)_days_\d{2}$/; // Q Days (Q1_30_days_25)
  const totalRegex = /^TOTAL_\d{2}$/; // Total (TOTAL_25, TOTAL_24)
  const osDaysRegex = /^os_(\d+)_days/; // OS Days (os_30_days, os_60_days)

  const orderedData = factspanData.map((item) => {
    // Separate `SOW_DATA` into categorized groups
    const months = [];
    const quarterly = {};
    const qDaysBuckets = {};
    const totals = [];
    const osDays = [];

    item.SOW_DATA.forEach((sow) => {
      if (sow.MONTH_NAMES) {
        // For monthly data
        if (monthlyRegex.test(sow.MONTH_NAMES)) {
          months.push(sow);
        }
        // For quarterly data like Q1, Q2, etc.
        else if (quarterlyRegex.test(sow.MONTH_NAMES)) {
          const match = sow.MONTH_NAMES.match(/^Q(\d+)_\d{2}$/);
          if (match) {
            const quarter = `Q${match[1]}`;
            if (!quarterly[quarter]) quarterly[quarter] = [];
            quarterly[quarter].push(sow);
          }
        }
        // For Q Days data (e.g., Q1_30_days_25)
        else if (daysBucketsRegex.test(sow.MONTH_NAMES)) {
          const match = sow.MONTH_NAMES.match(daysBucketsRegex);
          if (match) {
            const quarter = `Q${match[1]}`;
            const days = match[2];
            const yearSuffix = sow.QUARTER ? sow.QUARTER.slice(2, 4) : "00"; // Get the last two digits of the year (e.g., 2025 → 25)

            if (!qDaysBuckets[quarter]) qDaysBuckets[quarter] = {};
            if (!qDaysBuckets[quarter][days]) qDaysBuckets[quarter][days] = [];

            // Add the ID in the format "Q1-25", "Q2-25", etc.
            sow.id = `${quarter}-${yearSuffix}`; // e.g., Q1-25, Q2-25

            qDaysBuckets[quarter][days].push(sow);
          }
        }
        // Handling total and OS days
        else if (totalRegex.test(sow.MONTH_NAMES)) {
          totals.push(sow);
        } else if (osDaysRegex.test(sow.MONTH_NAMES)) {
          const match = sow.MONTH_NAMES.match(osDaysRegex);
          if (match) {
            osDays.push(sow);
          }
        }
      }
    });

    // Sorting quarterly data
    const sortedQuarterly = Object.keys(quarterly)
      .sort() // Sort by Q1, Q2, Q3, Q4
      .flatMap((qtr) => {
        const sortedQDays = Object.keys(qDaysBuckets[qtr] || {})
          .sort((a, b) => Number(a) - Number(b)) // Sort by 30, 60, 90, etc.
          .flatMap((days) => qDaysBuckets[qtr][days]);

        return [...quarterly[qtr], ...sortedQDays];
      });

    // Sorting OS Days
    const sortedOsDays = osDays.sort((a, b) => {
      const numA = parseInt(a.MONTH_NAMES.match(/\d+/)[0], 10);
      const numB = parseInt(b.MONTH_NAMES.match(/\d+/)[0], 10);
      return numA - numB;
    });

    // Combine everything in the sorted order
    const sortedSowData = [
      ...months,
      ...sortedQuarterly,
      ...totals,
      ...sortedOsDays,
    ];

    // Return updated item with sorted data
    return { ...item, SOW_DATA: sortedSowData };
  });

  // factspanData = orderedData
  $.each(orderedData, function (index) {
    let sowStatus = orderedData[index].SOW_STATUS;
    if (sowStatus == "Signed") {
      sowStatus = "100% Signed (SOW Amount)";
    } else if (sowStatus == "Bridge from OP1") {
      sowStatus = "Bridge from OP1%";
    }
    let sowMonthData = orderedData[index].SOW_DATA;
    let sowMonthHtml = "",
      sowMonthLastYrHtml = "";

    $.each(sowMonthData, function (value) {
      let dataYrFil = sowMonthData[value].MONTH_NAMES.split("_");
      // console.log("dataYrFil", dataYrFil);
      // console.log("selectedYearval", selectedYearval);
      if (
        sowMonthData[value].MONTH_NAMES.startsWith("Q") &&
        sowMonthData[value].MONTH_NAMES.includes("_180_days")
      ) {
        return; // Skip this iteration
      }

      if (dataYrFil[dataYrFil.length - 1] == selectedYearval) {
        let valueFormatted;
        let toottip = false;
        let tempval = 0;
        let actualTempVal = true;
        // Skip "greater_180_days_24"
        if (
          sowMonthData[value].MONTH_NAMES ===
          "os_greater_180_days_" + selectedYearval
        ) {
          return; // Continue to the next iteration
        }
        // Define a single class for all quarter data
        let quarterClass = "";
        if (
          /^Q[1-4]_(30|60|90|180)_days_\d{2}$/.test(
            sowMonthData[value].MONTH_NAMES,
          )
        ) {
          quarterClass = "quarter_class_ex"; // Remove class for "Q1_30_days_25", "Q2_60_days_24", etc.
        } else if (/^Q[1-4]_\d{2}$/.test(sowMonthData[value].MONTH_NAMES)) {
          quarterClass = "quarter-class"; // Keep class for "Q1_25", "Q2_24", etc.
        } else if (sowMonthData[value].MONTH_NAMES.startsWith("T")) {
          quarterClass = "total-class";
        } else if (
          /^os_(30|60|90|180)_days_\d{2}$/.test(sowMonthData[value].MONTH_NAMES)
        ) {
          quarterClass = "os-class"; // New class for "os_30_days_<year>", etc.
        }

        if (
          sowMonthData[value].VALUES !== null &&
          sowMonthData[value].VALUES !== undefined &&
          sowMonthData[value].VALUES !== ""
        ) {
          let amtVal = sowMonthData[value].VALUES;

          // Skip conversion for specific MONTH_NAMES
          // if (
          //   ![
          //     "os_30_days_"+selectedYearval,
          //     "os_60_days_"+selectedYearval,
          //     "os_90_days_"+selectedYearval,
          //     "os_180_days_"+selectedYearval,
          //   ].includes(sowMonthData[value].MONTH_NAMES)
          // ) {
          amtVal = (amtVal / 1000000).toFixed(2);
          // }
          if (sowStatus == "MOM/QOQ %" || sowStatus == "YOY %") {
            amtVal = sowMonthData[value].VALUES.toFixed(2);
            tempval =
              amtVal == 0.0
                ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                : "";
            if (tempval != "" || tempval != 0) {
              if (tempval > 0.0) toottip = true;
              actualTempVal = true;
            }
            valueFormatted = amtVal == 0.0 && !toottip ? "--" : amtVal;
          } else if (sowStatus.endsWith("%")) {
            tempval =
              amtVal == 0.0
                ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                : "";
            if (tempval != "" || tempval != 0) {
              if (tempval > 0.0) toottip = true;
            }
            valueFormatted = sowMonthData[value].VALUES.toFixed(2) + "%"; // Format as percentage
          } else if (sowStatus == "Actual/Projected") {
            tempval =
              amtVal == 0.0
                ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                : "";
            if (tempval != "" || tempval != 0) {
              if (tempval > 0.0) toottip = true;
            }
            if (
              [
                "os_30_days_" + selectedYearval,
                "os_60_days_" + selectedYearval,
                "os_90_days_" + selectedYearval,
                "os_180_days_" + selectedYearval,
              ].includes(sowMonthData[value].MONTH_NAMES)
            ) {
              valueFormatted = `<strong class="actual-projected-class">${
                amtVal == 0.0 && !toottip
                  ? "--"
                  : `<span class='${
                      amtVal >= 0.0 ? "postive_val" : "negative_val"
                    }'>${
                      amtVal >= 0.0
                        ? `+ $${amtVal}`
                        : `- $${amtVal.replace("-", "")}`
                    }</span>`
              }</strong>`;
            } else {
              valueFormatted = `<strong class="actual-projected-class">${
                amtVal == 0.0 && !toottip ? "--" : "$" + amtVal
              }</strong>`;
            }
          } else {
            tempval =
              amtVal == 0.0
                ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                : "";
            if (tempval != "" || tempval != 0) {
              if (tempval > 0.0) toottip = true;
              actualTempVal = true;
            }
            // Exclude "$" for specific entries
            if (
              [
                "os_30_days_" + selectedYearval,
                "os_60_days_" + selectedYearval,
                "os_90_days_" + selectedYearval,
                "os_180_days_" + selectedYearval,
              ].includes(sowMonthData[value].MONTH_NAMES)
            ) {
              valueFormatted =
                amtVal == 0.0 && !toottip
                  ? "--"
                  : `<span class='${
                      amtVal >= 0.0 ? "postive_val" : "negative_val"
                    }'>${
                      amtVal >= 0.0
                        ? `+ $${amtVal}`
                        : `- $${amtVal.replace("-", "")}`
                    }</span>`;
            } else {
              valueFormatted = amtVal == 0.0 && !toottip ? "--" : "$" + amtVal;
            }
          }
          if (amtVal == 0.0) {
            actualTempVal = false;
          }
        } else {
          valueFormatted = "--"; // Placeholder for empty values
        }
        selectedBusinessHead = selectedBusinessHead.filter(
          (item) => item !== "-1",
        );
        let quarterId = sowMonthData[value].id;
        let accid = "";
        sowMonthHtml += `<td id="${quarterId}" 
        class="${
          sowMonthData[value].FLAG
        } CellWithComment table-cell ${quarterClass}" 
        style="${
          quarterClass !== "quarter-class-ex" &&
          (quarterClass === "" ||
            quarterClass === "quarter-class" ||
            quarterClass === "total-class") &&
          (sowStatus === "70%-Total" ||
            sowStatus === "70%-Qualified" ||
            sowStatus === "70%-Proposal" ||
            sowStatus === "70%-Renewal" ||
            sowStatus === "100% Signed (SOW Amount)") &&
          valueFormatted !== "--" &&
          valueFormatted !== "0.00"
            ? "text-decoration: underline; cursor: pointer;"
            : ""
        }" 
        onclick="${
          quarterClass !== "quarter-class-ex" &&
          (quarterClass === "quarter-class" ||
            quarterClass === "total-class") &&
          (sowStatus === "70%-Total" ||
            sowStatus === "70%-Qualified" ||
            sowStatus === "70%-Proposal" ||
            sowStatus === "70%-Renewal" ||
            sowStatus === "100% Signed (SOW Amount)") &&
          valueFormatted !== "--" &&
          valueFormatted !== "0.00"
            ? `showPopup('${sowStatus == "100% Signed (SOW Amount)" ? "100% Signed" : sowStatus}', '${sowMonthData[value].MONTH_NAMES}','Overall','${selectedYearval}', this, 'one')`
            : quarterClass === "" &&
                (sowStatus === "70%-Total" ||
                  sowStatus === "70%-Qualified" ||
                  sowStatus === "70%-Proposal" ||
                  sowStatus === "70%-Renewal" ||
                  sowStatus === "100% Signed (SOW Amount)")
              ? `popupDataajax('${sowStatus == "100% Signed (SOW Amount)" ? "100% Signed" : sowStatus}', '${sowMonthData[value].MONTH_NAMES}', ${accid}).then(popupData => showPopupMonth(popupData, this))`
              : ""
        }"
        data-popup='${
          (quarterClass === "quarter-class" ||
            quarterClass === "total-class") &&
          (sowStatus === "70%-Total" ||
            sowStatus === "70%-Qualified" ||
            sowStatus === "70%-Proposal" ||
            sowStatus === "70%-Renewal" ||
            sowStatus === "100% Signed (SOW Amount)")
            ? JSON.stringify(popupData)
            : JSON.stringify(popupDataMonth)
        }'>
        ${valueFormatted}
        ${toottip ? `<span class="CellComment">${tempval}</span>` : ""} 
    </td>`;
      }
    });

    let classSignedGroup = "";
    if (
      sowStatus == "70%-Renewal" ||
      sowStatus == "70%-Proposal" ||
      sowStatus == "70%-Qualified"
    ) {
      classSignedGroup = "singedGroup noExl";
    }
    let iconHtml = "",
      iconHtmlActual = "";
    if (sowStatus === "70%-Total") {
      iconHtml =
        ' <i class="fa fa-expand icon-custom-style" aria-hidden="true"></i>';
    }
    if (sowStatus == "MOM/QOQ %" || sowStatus == "YOY %") {
      classSignedGroup = "singedGroup noExl";
    }
    if (sowStatus === "Actual/Projected") {
      iconHtmlActual =
        '<i class="fa fa-expand icon-custom-style" aria-hidden="true"></i>';
    }

    let factspanHtml = `<tr class='${classSignedGroup}'>
    ${
      index == 0
        ? `<td class="account_bg first_column" style="font-weight:600;color:#818199" id='factspan_overall_sum' rowspan="${
            overall_fact_len - 5
          }">Overall</td>`
        : ""
    }
    <td class='signed_data second_colum' ${
      sowStatus == "70%-Total" || sowStatus === "Actual/Projected"
        ? `onclick="toggleSignedRows(this, ${overall_fact_len})"`
        : ""
    }> 
        <span style="display: inline-flex;">
            <span class="${
              sowStatus === "Actual/Projected"
                ? "actual-projected-class-label"
                : "other-status-class"
            }">
                ${
                  sowStatus === "Actual/Projected"
                    ? `<strong>${sowStatus}</strong>`
                    : sowStatus == "70%-Total"
                      ? `${sowStatus} (SOW Amount)`
                      : sowStatus
                }
            </span>
            ${sowStatus === "Actual/Projected" ? iconHtmlActual : iconHtml}
        </span>
    </td>
    ${sowMonthHtml + sowMonthLastYrHtml}
</tr>`;

    $("#report_overall_summary_body").append(factspanHtml);
  });

  $("#report_overall_summary_body").append();

  // Toggle nested rows visibility for Actual/Projected and signed statuses
  let newLogoData = Array.isArray(overallSummData)
    ? overallSummData.flatMap((item) => item.NEW_LOGO_DATA || []) // Use flatMap to get FACTSPAN_DATA from all items
    : overallSummData.NEW_LOGO_DATA || []; // Directly access FACTSPAN_DATA if it's a single object

  const orderedNewLogo = newLogoData.map((item) => {
    // Separate `SOW_DATA` into categorized groups
    const months = [];
    const quarterly = {};
    const qDaysBuckets = {};
    const totals = [];
    const osDays = [];

    const monthlyRegex = /^[A-Za-z]{3}_\d{2}$/; // Months (e.g., Jan_25, Feb_25)
    const quarterlyRegex = /^Q\d_\d{2}$/; // Quarterly (Q1_25, Q2_25)
    const daysBucketsRegex = /^Q(\d+)_(\d+)_days_\d{2}$/; // Q Days (Q1_30_days_25)
    const totalRegex = /^TOTAL_\d{2}$/; // Total (TOTAL_25, TOTAL_24)
    const osDaysRegex = /^os_(\d+)_days/; // OS Days (os_30_days, os_60_days)

    item.SOW_DATA.forEach((sow) => {
      if (sow.MONTH_NAMES) {
        // For monthly data
        if (monthlyRegex.test(sow.MONTH_NAMES)) {
          months.push(sow);
        }
        // For quarterly data like Q1, Q2, etc.
        else if (quarterlyRegex.test(sow.MONTH_NAMES)) {
          const match = sow.MONTH_NAMES.match(/^Q(\d+)_\d{2}$/);
          if (match) {
            const quarter = `Q${match[1]}`;
            if (!quarterly[quarter]) quarterly[quarter] = [];
            quarterly[quarter].push(sow);
          }
        }
        // For Q Days data (e.g., Q1_30_days_25)
        else if (daysBucketsRegex.test(sow.MONTH_NAMES)) {
          const match = sow.MONTH_NAMES.match(daysBucketsRegex);
          if (match) {
            const quarter = `Q${match[1]}`;
            const days = match[2];
            const yearSuffix = sow.QUARTER ? sow.QUARTER.slice(2, 4) : "00"; // Get the last two digits of the year (e.g., 2025 → 25)

            if (!qDaysBuckets[quarter]) qDaysBuckets[quarter] = {};
            if (!qDaysBuckets[quarter][days]) qDaysBuckets[quarter][days] = [];

            // Add the ID in the format "Q1-25", "Q2-25", etc.
            sow.id = `${quarter}-${yearSuffix}`; // e.g., Q1-25, Q2-25

            qDaysBuckets[quarter][days].push(sow);
          }
        }
        // Handling total and OS days
        else if (totalRegex.test(sow.MONTH_NAMES)) {
          totals.push(sow);
        } else if (osDaysRegex.test(sow.MONTH_NAMES)) {
          osDays.push(sow);
        }
      }
    });

    // Sorting quarterly data
    const sortedQuarterly = Object.keys(quarterly)
      .sort() // Sort by Q1, Q2, Q3, Q4
      .flatMap((qtr) => {
        const sortedQDays = Object.keys(qDaysBuckets[qtr] || {})
          .sort((a, b) => Number(a) - Number(b)) // Sort by 30, 60, 90, etc.
          .flatMap((days) => qDaysBuckets[qtr][days]);

        return [...quarterly[qtr], ...sortedQDays];
      });

    // Sorting OS Days
    const sortedOsDays = osDays.sort((a, b) => {
      const numA = parseInt(a.MONTH_NAMES.match(/\d+/)[0], 10);
      const numB = parseInt(b.MONTH_NAMES.match(/\d+/)[0], 10);
      return numA - numB;
    });

    // Combine everything in the sorted order
    const sortedSowData = [
      ...months,
      ...sortedQuarterly,
      ...totals,
      ...sortedOsDays,
    ];

    // Return updated item with sorted data
    return { ...item, SOW_DATA: sortedSowData };
  });

  let new_logo_len = newLogoData.length;
  $("#report_overall_summary_body").append(
    `<tr class='noExl'><td colspan="37"><span class='status_btn_show_hide show_hide_new_logo margin-top-custom'  style='padding-top: 2px;padding-bottom:2px'  onclick='toggleStatusRows()'>Show - New Logo, Current, Current New, Net New</span></td></tr>`,
  );
  newLogoData = orderedNewLogo;
  $.each(newLogoData, function (index) {
    let sowStatus = newLogoData[index].SOW_STATUS;

    // Format SOW_STATUS
    if (sowStatus == "Signed") {
      sowStatus = "100% Signed (SOW Amount)";
    } else if (sowStatus == "Signed + Green") {
      sowStatus = "> 70%";
    } else if (sowStatus == "OP") {
      sowStatus = "OP1";
    }

    let sowMonthData = newLogoData[index].SOW_DATA;
    let sowMonthHtml = "",
      sowMonthLastYrHtml = "";

    // Iterate through sowMonthData
    $.each(sowMonthData, function (value) {
      let dataYrFil = sowMonthData[value].MONTH_NAMES.split("_");
      if (
        sowMonthData[value].MONTH_NAMES.startsWith("Q") &&
        sowMonthData[value].MONTH_NAMES.includes("_180_days")
      ) {
        return; // Skip this iteration
      }

      if (dataYrFil[dataYrFil.length - 1] == selectedYearval) {
        let valueInMillions;
        let toottip = false;
        let tempval = 0;
        // Define a single class for all quarter data
        let quarterClass = "";
        // Skip "greater_180_days_24"
        if (
          sowMonthData[value].MONTH_NAMES ===
          "os_greater_180_days_" + selectedYearval
        ) {
          return; // Continue to the next iteration
        }
        // Check if it's a quarter and assign appropriate class
        if (
          /^Q[1-4]_(30|60|90|180)_days_\d{2}$/.test(
            sowMonthData[value].MONTH_NAMES,
          )
        ) {
          quarterClass = "quarter_class_ex";
        } else if (/^Q[1-4]_\d{2}$/.test(sowMonthData[value].MONTH_NAMES)) {
          quarterClass = "quarter-class";
        } else if (sowMonthData[value].MONTH_NAMES.startsWith("T")) {
          quarterClass = "total-class";
        }
        // Check if sowMonthData[value].VALUES is valid and not null/undefined/empty
        if (
          sowMonthData[value].VALUES !== null &&
          sowMonthData[value].VALUES !== undefined &&
          sowMonthData[value].VALUES !== ""
        ) {
          let amtVal = (sowMonthData[value].VALUES / 1000000).toFixed(2);
          if (sowStatus == "Actual/Projected") {
            tempval =
              amtVal == 0.0
                ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                : "";
            if (tempval != "" || tempval != 0) {
              if (tempval > 0.0) toottip = true;
            }
            if (
              [
                "os_30_days_" + selectedYearval,
                "os_60_days_" + selectedYearval,
                "os_90_days_" + selectedYearval,
                "os_180_days_" + selectedYearval,
              ].includes(sowMonthData[value].MONTH_NAMES)
            ) {
              valueInMillions = `<strong class="actual-projected-class">${
                amtVal == 0.0 && !toottip
                  ? "--"
                  : `<span class='${
                      amtVal >= 0.0 ? "postive_val" : "negative_val"
                    }'>${
                      amtVal >= 0.0
                        ? `+ $${amtVal}`
                        : `- $${amtVal.replace("-", "")}`
                    }</span>`
              }</strong>`;
            } else {
              valueInMillions = `<strong class="actual-projected-class">${
                amtVal == 0.0 && !toottip ? "--" : "$" + amtVal
              }</strong>`;
            }
          } else {
            tempval =
              amtVal == 0.0
                ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                : "";
            if (tempval != "" || tempval != 0) {
              if (tempval > 0.0) toottip = true;
            }
            if (
              [
                "os_30_days_" + selectedYearval,
                "os_60_days_" + selectedYearval,
                "os_90_days_" + selectedYearval,
                "os_180_days_" + selectedYearval,
              ].includes(sowMonthData[value].MONTH_NAMES)
            ) {
              valueInMillions = `${
                amtVal == 0.0 && !toottip
                  ? "--"
                  : `<span class='${
                      amtVal >= 0.0 ? "postive_val" : "negative_val"
                    }'>${(amtVal = 0.0
                      ? `+ $${amtVal}`
                      : `- $${amtVal.replace("-", "")}`)}</span>`
              }`;
            } else {
              valueInMillions = `${
                amtVal == 0.0 && !toottip ? "--" : "$" + amtVal
              }`;
            }
          }
        } else {
          valueInMillions = "--"; // Placeholder for invalid values
        }

        let quarterId = sowMonthData[value].id;
        if (quarterClass === "quarter_class_ex") {
          sowMonthHtml += `<td id="${quarterId}" class="${
            sowMonthData[value].FLAG
          } ${quarterClass} CellWithComment table-cell">
                    ${valueInMillions}
                    ${
                      toottip
                        ? `<span class="CellComment">${tempval}</span>`
                        : ""
                    }
                  </td>`;
        } else {
          sowMonthHtml += `<td class="${
            sowMonthData[value].FLAG
          } ${quarterClass} CellWithComment table-cell">
                    ${valueInMillions}
                    ${
                      toottip
                        ? `<span class="CellComment">${tempval}</span>`
                        : ""
                    }
                  </td>`;
        }
      }
      // Uncomment and modify this if needed to handle last year's data
      // if (sowMonthData[value].MONTH_NAMES == "TOTAL_" + lastYear) {
      //     let valueInMillions = (sowMonthData[value].VALUES / 1000000).toFixed(2); // Convert to millions and format to 3 decimal places
      //     sowMonthLastYrHtml = `<td class="${sowMonthData[value].FLAG}">$${valueInMillions}</td>`;
      // }
    });

    let newLogoHtml = `<tr class="new-logo-row noExl">
                                ${
                                  index == 0
                                    ? `<td class="account_bg_new_logo first_column" rowspan="${new_logo_len}">New Logo</td>`
                                    : ""
                                }
                                <td class='second_colum'>${
                                  sowStatus === "Actual/Projected"
                                    ? `<span class="actual-projected-class"><strong>${sowStatus}</strong></span>`
                                    : sowStatus
                                }</td>
                                ${sowMonthHtml + sowMonthLastYrHtml}
                            </tr>`;

    $("#report_overall_summary_body").append(newLogoHtml);
  });

  $("#report_overall_summary_body").append(
    `<tr class="new-logo-row noExl" style="background-color: white"><td colspan="37"></td></tr>`,
  );
  let sowTypeData = Array.isArray(overallSummData)
    ? overallSummData.flatMap((item) => item.SOW_TYPE || []) // Use flatMap to get FACTSPAN_DATA from all items
    : overallSummData.SOW_TYPE || []; // Directly access FACTSPAN_DATA if it's a single object
  const orderedSowTypeData = sowTypeData.map((typeItem) => {
    const orderedSowTypeDataItem = typeItem.SOW_TYPE_DATA.map((item) => {
      const months = [];
      const quarterly = {};
      const qDaysBuckets = {};
      const totals = [];
      const osDays = [];

      item.SOW_DATA.forEach((sow) => {
        if (sow.MONTH_NAMES) {
          if (monthlyRegex.test(sow.MONTH_NAMES)) {
            months.push(sow);
          } else if (quarterlyRegex.test(sow.MONTH_NAMES)) {
            const match = sow.MONTH_NAMES.match(/^Q(\d+)_\d{2}$/);
            if (match) {
              const quarter = `Q${match[1]}`;
              if (!quarterly[quarter]) quarterly[quarter] = [];
              quarterly[quarter].push(sow);
            }
          } else if (daysBucketsRegex.test(sow.MONTH_NAMES)) {
            const match = sow.MONTH_NAMES.match(daysBucketsRegex);
            if (match) {
              const quarter = `Q${match[1]}`;
              const days = match[2];

              if (!qDaysBuckets[quarter]) qDaysBuckets[quarter] = {};
              if (!qDaysBuckets[quarter][days])
                qDaysBuckets[quarter][days] = [];

              // Add the ID in the format "Q1-25", "Q2-25", etc.
              const yearSuffix = sow.QUARTER ? sow.QUARTER.slice(2, 4) : "00"; // Get last two digits of the year
              sow.id = `${quarter}-${yearSuffix}`; // e.g., Q1-25, Q2-25

              qDaysBuckets[quarter][days].push(sow);
            }
          } else if (totalRegex.test(sow.MONTH_NAMES)) {
            totals.push(sow);
          } else if (osDaysRegex.test(sow.MONTH_NAMES)) {
            osDays.push(sow);
          }
        }
      });

      // Sorting Quarterly and Q-Days Buckets
      const sortedQuarterly = Object.keys(quarterly)
        .sort() // Sort by Q1, Q2, Q3, Q4
        .flatMap((qtr) => {
          const sortedQDays = Object.keys(qDaysBuckets[qtr] || {})
            .sort((a, b) => Number(a) - Number(b)) // Sort by 30, 60, 90, 180
            .flatMap((days) => qDaysBuckets[qtr][days]);

          return [...quarterly[qtr], ...sortedQDays];
        });

      // Sorting OS Days
      const sortedOsDays = osDays.sort((a, b) => {
        const numA = parseInt(a.MONTH_NAMES.match(/\d+/)[0], 10);
        const numB = parseInt(b.MONTH_NAMES.match(/\d+/)[0], 10);
        return numA - numB;
      });

      // Order as: Months → Quarterly → Q Days Buckets → Totals → OS Days
      const sortedSowData = [
        ...months,
        ...sortedQuarterly,
        ...totals,
        ...sortedOsDays,
      ];

      return { ...item, SOW_DATA: sortedSowData };
    });

    return { ...typeItem, SOW_TYPE_DATA: orderedSowTypeDataItem };
  });

  sowTypeData = orderedSowTypeData;
  $.each(sowTypeData, function (sowValue) {
    let sowTypeName = sowTypeData[sowValue].SOW_TYPE;
    let sowTypeSowData = sowTypeData[sowValue].SOW_TYPE_DATA;
    let sow_type_len = sowTypeSowData.length;
    $.each(sowTypeSowData, function (sowTypeDataval) {
      let sowTypeDataHtml = "",
        lastYrDataHtml = "";
      let sowStatusName = sowTypeSowData[sowTypeDataval].SOW_STATUS;
      let sowStatusData = sowTypeSowData[sowTypeDataval].SOW_DATA;

      // Iterate over each SOW status data
      $.each(sowStatusData, function (sowTypeEach) {
        let dataYrFil = sowStatusData[sowTypeEach].MONTH_NAMES.split("_");
        let monthName = sowStatusData[sowTypeEach].MONTH_NAMES;

        // **Skip iterations where MONTH_NAMES starts with "Q" and contains "_180_days"**
        if (monthName.startsWith("Q") && monthName.includes("_180_days")) {
          return true; // `true` in $.each is equivalent to `continue`
        }

        if (dataYrFil[dataYrFil.length - 1] == selectedYearval) {
          let valueInMillions;
          let toottip = false;
          let tempval = 0;
          // Define a single class for all quarter data
          let quarterClass = "";
          // Skip "greater_180_days_24"
          if (
            sowStatusData[sowTypeEach].MONTH_NAMES ===
            "os_greater_180_days_" + selectedYearval
          ) {
            return; // Continue to the next iteration
          }
          if (
            /^Q[1-4]_(30|60|90|180)_days_\d{2}$/.test(
              sowStatusData[sowTypeEach].MONTH_NAMES,
            )
          ) {
            quarterClass = "quarter_class_ex"; // This matches "Q1_30_days_25", "Q2_60_days_24", etc.
          } else if (
            /^Q[1-4]_\d{2}$/.test(sowStatusData[sowTypeEach].MONTH_NAMES)
          ) {
            quarterClass = "quarter-class"; // This matches "Q1_25", "Q2_24", etc.
          } else if (sowStatusData[sowTypeEach].MONTH_NAMES.startsWith("T")) {
            quarterClass = "total-class"; // For "T" based values like totals
          }

          // Check if VALUES is valid (not null, undefined, or empty)
          if (
            sowStatusData[sowTypeEach].VALUES !== null &&
            sowStatusData[sowTypeEach].VALUES !== undefined &&
            sowStatusData[sowTypeEach].VALUES !== ""
          ) {
            let amtVal = (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(
              2,
            );
            if (sowStatusName == "Actual/Projected") {
              tempval =
                amtVal == 0.0
                  ? (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(3)
                  : "";
              if (tempval != "" || tempval != 0) {
                if (tempval > 0.0) toottip = true;
              }
              if (
                [
                  "os_30_days_" + selectedYearval,
                  "os_60_days_" + selectedYearval,
                  "os_90_days_" + selectedYearval,
                  "os_180_days_" + selectedYearval,
                ].includes(sowStatusData[sowTypeEach].MONTH_NAMES)
              ) {
                valueInMillions = `<strong class="actual-projected-class">${
                  amtVal == 0.0 && !toottip
                    ? "--"
                    : `<span class='${
                        amtVal >= 0.0 ? "postive_val" : "negative_val"
                      }'>${
                        amtVal >= 0.0
                          ? `+ $${amtVal}`
                          : `- $${amtVal.replace("-", "")}`
                      }</span>`
                }</strong>`;
              } else {
                valueInMillions = `<strong class="actual-projected-class">${
                  amtVal == 0.0 && !toottip ? "--" : "$" + amtVal
                }</strong>`;
              }
            } else {
              tempval =
                amtVal == 0.0
                  ? (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(3)
                  : "";
              if (tempval != "" || tempval != 0) {
                if (tempval > 0.0) toottip = true;
              }
              if (
                [
                  "os_30_days_" + selectedYearval,
                  "os_60_days_" + selectedYearval,
                  "os_90_days_" + selectedYearval,
                  "os_180_days_" + selectedYearval,
                ].includes(sowStatusData[sowTypeEach].MONTH_NAMES)
              ) {
                valueInMillions = `${
                  amtVal == 0.0 && !toottip
                    ? "--"
                    : `<span class='${
                        amtVal >= 0.0 ? "postive_val" : "negative_val"
                      }'>${
                        amtVal >= 0.0
                          ? `+ $${amtVal}`
                          : `- $${amtVal.replace("-", "")}`
                      }</span>`
                }`;
              } else {
                valueInMillions = `${
                  amtVal == 0.0 && !toottip ? "--" : "$" + amtVal
                }`;
              }
            }
          } else {
            valueInMillions = "--"; // Placeholder for invalid values
          }
          let quarterId = sowStatusData[sowTypeEach].id;

          sowTypeDataHtml += `<td id =${quarterId} class="${
            sowStatusData[sowTypeEach].FLAG
          } ${quarterClass} CellWithComment table-cell">
            ${valueInMillions}
            ${
              toottip
                ? `<span class="CellComment">${(
                    sowStatusData[sowTypeEach].VALUES / 1000000
                  ).toFixed(3)}</span>`
                : ""
            }
        </td>`;
        }

        // Uncomment and modify this if needed to handle last year's data
        // if (sowStatusData[sowTypeEach].MONTH_NAMES == "TOTAL_" + lastYear) {
        //     lastYrDataHtml = `<td class="${sowStatusData[sowTypeEach].FLAG}">$${(Math.round(sowStatusData[sowTypeEach].VALUES)).toLocaleString()}</td>`;
        // }
      });

      // Map SOW_STATUS to its corresponding display name
      if (sowStatusName == "Signed") {
        sowStatusName = "100% Signed (SOW Amount)";
      } else if (sowStatusName == "Signed + Green") {
        sowStatusName = "> 70%";
      } else if (sowStatusName == "OP") {
        sowStatusName = "OP1";
      }
      // Generate the HTML row for the current SOW type
      let sowLevelHtml = `<tr class='new-logo-row noExl'>
                                    ${
                                      sowTypeDataval == 0
                                        ? `<td class="account_bg_new_logo first_column" rowspan="${sow_type_len}">${sowTypeName}</td>`
                                        : ""
                                    }
                                    <td class='second_colum'>${
                                      sowStatusName === "Actual/Projected"
                                        ? `<span class="actual-projected-class"><strong>${sowStatusName}</strong></span>`
                                        : sowStatusName
                                    }</td>
                                    ${sowTypeDataHtml + lastYrDataHtml}
                                </tr>`;

      $("#report_overall_summary_body").append(sowLevelHtml);
    });

    $("#report_overall_summary_body").append(
      `<tr class="new-logo-row noExl" style="background-color: white"><td colspan="37"></td></tr>`,
    );
  });
  $(".new-logo-row").hide();
  $(".status_btn_show_hide").text(
    "Show - New Logo, Current, Current New, Net New",
  );

  $("#report_overall_summary_body").append(
    `<tr class="account_level"><td colspan="37">Account Level Breakup</td></tr>`,
  );
  $("#report_overall_summary_body").append(
    `<tr style="background-color: white"><td colspan="37"></td></tr>`,
  );
  // Generate the HTML row for the current SOW type
  // let accSowSelectDataTab = `<tr class='overall_summary_tab_data'>
  //                             <td colspan="37">
  //                               <div class="acc_sow_select_data_tab">
  //                                 <div id="accountLevelTab" class="selected-tab accountLevelTab" onclick="handleTabClick('accountLevelTab')">
  //                                   Account Level Breakup
  //                                 </div>
  //                                 <div id="sowLevelTab" class="sowLevelTab" onclick="handleTabClick('sowLevelTab')">
  //                                   SOW Level Breakup
  //                                 </div>
  //                               </div>
  //                             </td>
  //                           </tr>`;
  // $("#report_overall_summary_body").append(accSowSelectDataTab);
  let accountLevelData = Array.isArray(overallSummData)
    ? overallSummData.flatMap((item) => item.ACCOUNT_LEVEL_DATA || []) // Use flatMap to get FACTSPAN_DATA from all items
    : overallSummData.ACCOUNT_LEVEL_DATA || []; // Directly access FACTSPAN_DATA if it's a single object

  const orderedDataAcc = accountLevelData.map((account) => {
    if (!account.ACCOUNT_DATA || !Array.isArray(account.ACCOUNT_DATA)) {
      return account; // Skip processing if ACCOUNT_DATA is missing or not an array
    }

    return {
      ...account,
      ACCOUNT_DATA: account.ACCOUNT_DATA.map((sowItem) => {
        if (!sowItem.SOW_DATA || !Array.isArray(sowItem.SOW_DATA)) {
          return sowItem; // Skip processing if SOW_DATA is missing or not an array
        }

        const months = [];
        const quarterly = {};
        const qDaysBuckets = {};
        const totals = [];
        const osDays = [];

        const monthlyRegex = /^[A-Za-z]{3}_\d{2}$/; // Months (e.g., Jan_25, Feb_25)
        const quarterlyRegex = /^Q\d_\d{2}$/; // Quarterly (Q1_25, Q2_25)
        const daysBucketsRegex = /^Q(\d+)_(\d+)_days_\d{2}$/; // Q Days (Q1_30_days_25)
        const totalRegex = /^TOTAL_\d{2}$/; // Total (TOTAL_25, TOTAL_24)
        const osDaysRegex = /^os_(\d+)_days/; // OS Days (os_30_days, os_60_days)

        sowItem.SOW_DATA.forEach((sow) => {
          if (sow.MONTH_NAMES) {
            if (monthlyRegex.test(sow.MONTH_NAMES)) {
              months.push(sow);
            } else if (quarterlyRegex.test(sow.MONTH_NAMES)) {
              const match = sow.MONTH_NAMES.match(/^Q(\d+)_\d{2}$/);
              if (match) {
                const quarter = `Q${match[1]}`;
                if (!quarterly[quarter]) quarterly[quarter] = [];
                quarterly[quarter].push(sow);
              }
            } else if (daysBucketsRegex.test(sow.MONTH_NAMES)) {
              const match = sow.MONTH_NAMES.match(daysBucketsRegex);
              if (match) {
                const quarter = `Q${match[1]}`;
                const days = match[2];
                const yearSuffix = sow.QUARTER ? sow.QUARTER.slice(2, 4) : "00"; // Get the last two digits of the year (e.g., 2025 → 25)

                if (!qDaysBuckets[quarter]) qDaysBuckets[quarter] = {};
                if (!qDaysBuckets[quarter][days])
                  qDaysBuckets[quarter][days] = [];

                // Add the ID in the format "Q1-25", "Q2-25", etc.
                sow.id = `${quarter}-${yearSuffix}`; // e.g., Q1-25, Q2-25

                qDaysBuckets[quarter][days].push(sow);
              }
            } else if (totalRegex.test(sow.MONTH_NAMES)) {
              totals.push(sow);
            } else if (osDaysRegex.test(sow.MONTH_NAMES)) {
              osDays.push(sow);
            }
          }
        });

        // Sorting Quarterly and Q-Days Buckets
        const sortedQuarterly = Object.keys(quarterly)
          .sort() // Sort by Q1, Q2, Q3, Q4
          .flatMap((qtr) => {
            const sortedQDays = Object.keys(qDaysBuckets[qtr] || {})
              .sort((a, b) => Number(a) - Number(b)) // Sort by 30, 60, 90, 180
              .flatMap((days) => qDaysBuckets[qtr][days]);

            return [...quarterly[qtr], ...sortedQDays];
          });

        // Sorting OS Days
        const sortedOsDays = osDays.sort((a, b) => {
          const numA = parseInt(a.MONTH_NAMES.match(/\d+/)[0], 10);
          const numB = parseInt(b.MONTH_NAMES.match(/\d+/)[0], 10);
          return numA - numB;
        });

        // Order: Months → Quarterly → Q Days Buckets → Totals → OS Days
        return {
          ...sowItem,
          SOW_DATA: [...months, ...sortedQuarterly, ...totals, ...sortedOsDays],
        };
      }),
    };
  });

  accountLevelData = orderedDataAcc;
  // Sort accountLevelData by custom account order
  sortAccountsByOrder(accountLevelData, "ACCOUNT_NAME");
  $.each(accountLevelData, function (accValue) {
    // console.log("accValue - ", accValue);
    let accName = accountLevelData[accValue].ACCOUNT_NAME;
    let accID = accountLevelData[accValue].ACCOUNT_ID;
    let accSowTypeData = accountLevelData[accValue].ACCOUNT_DATA;
    let acc_fact_len = accSowTypeData.length;

    $.each(accSowTypeData, function (accTypeData) {
      let accDataHtml = "",
        lastYrDataHtml = "";
      let sowStatusName = accSowTypeData[accTypeData].SOW_STATUS;
      let sowStatusData = accSowTypeData[accTypeData].SOW_DATA;

      // Initialize classSignedGroup and iconHtml
      let classSignedGroup = "";
      let iconHtml = "";

      // Logic for classSignedGroup and iconHtml
      if (
        sowStatusName === "70%-Renewals" ||
        sowStatusName === "70%-Proposals" ||
        sowStatusName === "70%-Qualified"
      ) {
        classSignedGroup = "signedGroup noExl";
      } else {
        classSignedGroup = "overall_summary_tab_data";
      }

      // Also add icon for 70%-Total
      if (sowStatusName === "70%-Total") {
        iconHtml =
          ' <i class="fa fa-expand icon-custom-style" aria-hidden="true"></i>'; // Add icon for these statuses
      }

      // Iterate over each SOW status data
      $.each(sowStatusData, function (sowTypeEach) {
        let monthName = sowStatusData[sowTypeEach].MONTH_NAMES;

        // **Skip iterations where MONTH_NAMES starts with "Q" and contains "_180_days"**
        if (monthName.startsWith("Q") && monthName.includes("_180_days")) {
          return true; // `true` in $.each is equivalent to `continue`
        }
        let dataYrFil = sowStatusData[sowTypeEach].MONTH_NAMES.split("_");

        if (dataYrFil[dataYrFil.length - 1] == selectedYearval) {
          let valueInMillions;
          let toottip = false;
          let tempval = 0;
          let actualTempVal = true;
          let monthData = sowStatusData[sowTypeEach];
          let quarterClass_data = "";
          // Skip "greater_180_days_24"
          if (
            sowStatusData[sowTypeEach].MONTH_NAMES ===
            "os_greater_180_days_" + selectedYearval
          ) {
            return; // Continue to the next iteration
          }
          // Check if the data represents a quarter or total year
          if (/^Q[1-4]_\d{2}$/.test(monthData.MONTH_NAMES)) {
            quarterClass_data = "quarter-class"; // Q1_25, Q2_25, Q3_24, etc.
          } else if (/^Q[1-4]_(30|60|90|180)/.test(monthData.MONTH_NAMES)) {
            quarterClass_data = "quarter_class_ex"; // Q1_30, Q2_60, etc.
          } else if (monthData.MONTH_NAMES.startsWith("T")) {
            quarterClass_data = "total-class"; // T1_30, T2_60, etc.
          } else if (
            /^os_(30|60|90|180)_days_\d{2}$/.test(monthData.MONTH_NAMES)
          ) {
            quarterClass_data = "os-class"; // os_30_days_25, os_60_days_24, etc.
          }
          // Check if VALUES is valid (not null, undefined, or empty)
          if (
            sowStatusData[sowTypeEach].VALUES !== null &&
            sowStatusData[sowTypeEach].VALUES !== undefined &&
            sowStatusData[sowTypeEach].VALUES !== ""
          ) {
            let amtVal = (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(
              2,
            );
            if (sowStatusName == "Actual/Projected") {
              tempval =
                amtVal == 0.0
                  ? (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(3)
                  : "";
              if (tempval != "" || tempval != 0) {
                if (tempval > 0.0) toottip = true;
                actualTempVal = false;
              }
              if (
                [
                  "os_30_days_" + selectedYearval,
                  "os_60_days_" + selectedYearval,
                  "os_90_days_" + selectedYearval,
                  "os_180_days_" + selectedYearval,
                ].includes(sowStatusData[sowTypeEach].MONTH_NAMES)
              ) {
                valueInMillions = `<strong class="actual-projected-class">${
                  amtVal == 0.0 && !toottip
                    ? "--"
                    : `<span class='${
                        amtVal >= 0.0 ? "postive_val" : "negative_val"
                      }'>${
                        amtVal >= 0.0
                          ? `+ $${amtVal}`
                          : `- $${amtVal.replace("-", "")}`
                      }</span>`
                }</strong>`;
              } else {
                valueInMillions = `<strong class="actual-projected-class">${
                  amtVal == 0.0 && !toottip ? "--" : "$" + amtVal
                }</strong>`;
              }
            } else {
              tempval =
                amtVal == 0.0
                  ? (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(3)
                  : "";
              if (tempval != "" || tempval != 0) {
                if (tempval > 0.0) toottip = true;
                actualTempVal = false;
              }
              if (
                [
                  "os_30_days_" + selectedYearval,
                  "os_60_days_" + selectedYearval,
                  "os_90_days_" + selectedYearval,
                  "os_180_days_" + selectedYearval,
                ].includes(sowStatusData[sowTypeEach].MONTH_NAMES)
              ) {
                valueInMillions =
                  amtVal == 0.0 && !toottip
                    ? "--"
                    : `<span class='${
                        amtVal >= 0.0 ? "postive_val" : "negative_val"
                      }'>${
                        amtVal >= 0.0
                          ? `+ $${amtVal}`
                          : `- $${amtVal.replace("-", "")}`
                      }</span>`;
              } else {
                valueInMillions =
                  amtVal == 0.0 && !toottip ? "--" : "$" + amtVal;
              }
            }
            if (amtVal == 0.0) {
              actualTempVal = false;
            }
          } else {
            valueInMillions = "--"; // Placeholder for invalid values
          }
          // if(sowStatusName === "Actual/Projected"){
          //   valueInMillions = `<strong class="actual-projected-class">$${(sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(2)}</strong>`;
          // }
          let quarterId = sowStatusData[sowTypeEach].id;
          accDataHtml += `<td id="${quarterId}" class="${
            sowStatusData[sowTypeEach]?.FLAG || ""
          } ${quarterClass_data} CellWithComment table-cell" 
          style="${
            quarterClass_data !== "quarter_class_ex" &&
            (quarterClass_data === "quarter-class" ||
              quarterClass_data === "total-class" ||
              quarterClass_data === "") &&
            (sowStatusName === "70%-Total" ||
              sowStatusName === "70%-Qualified" ||
              sowStatusName === "70%-Proposals" ||
              sowStatusName === "70%-Renewals" ||
              sowStatusName === "Signed") &&
            valueInMillions !== "--" &&
            valueInMillions !== "0.00"
              ? "text-decoration: underline; cursor: pointer;"
              : ""
          }" 
          onclick="${
            (quarterClass_data === "quarter-class" ||
              quarterClass_data === "total-class") &&
            (sowStatusName === "70%-Total" ||
              sowStatusName === "70%-Qualified" ||
              sowStatusName === "70%-Proposals" ||
              sowStatusName === "70%-Renewals" ||
              sowStatusName === "Signed") &&
            valueInMillions !== "--" &&
            valueInMillions !== "0.00"
              ? `showPopup('${sowStatusName}', '${sowStatusData[sowTypeEach].MONTH_NAMES}','${accID}', '${selectedYearval}', this, 'one')`
              : quarterClass_data === "" &&
                  (sowStatusName === "70%-Total" ||
                    sowStatusName === "70%-Qualified" ||
                    sowStatusName === "70%-Proposals" ||
                    sowStatusName === "70%-Renewals" ||
                    sowStatusName === "Signed")
                ? `popupDataajax('${sowStatusName}', '${monthData.MONTH_NAMES}','${accID}').then(popupData => showPopupMonthAcc(popupData, this))`
                : ""
          }" 
          tooltip="${
            sowStatusData[sowTypeEach]?.VALUES
              ? (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(3)
              : "N/A"
          }">
          
          ${
            sowStatusData[sowTypeEach]?.STATUS === "Actual/Projected"
              ? `<strong>$${valueInMillions}</strong>`
              : `${valueInMillions || "0.000"}`
          }
      
          ${
            toottip
              ? `<span class="CellComment">${
                  monthData?.VALUES
                    ? (monthData.VALUES / 1000000).toFixed(3)
                    : "N/A"
                }</span>`
              : ""
          }
      </td>`;
        }
        // Uncomment and modify this if needed to handle last year's data
        // if (sowStatusData[sowTypeEach].MONTH_NAMES == "TOTAL_" + lastYear) {
        //     lastYrDataHtml = `<td class="${sowStatusData[sowTypeEach].FLAG}">$${(Math.round(sowStatusData[sowTypeEach].VALUES)).toLocaleString()}</td>`;
        // }
      });

      // Map SOW_STATUS to its corresponding display name
      if (sowStatusName === "Signed") {
        sowStatusName = "100% Signed (SOW Amount)";
      } else if (sowStatusName === "OP") {
        sowStatusName = "OP1";
      }
      let sowLevelHtml = `<tr class='${classSignedGroup}'>
      ${
        accTypeData == 0
          ? `<td class="account_bg first_column factspan_account_sum_${accID}" rowspan="${
              acc_fact_len - 3
            }">${accName}</td>`
          : ""
      }
      <td class='signed_data second_colum' ${
        sowStatusName === "70%-Total"
          ? `onclick="toggleAccountSignedRows(this, ${acc_fact_len})" data-id=${accID}`
          : ""
      }>
          <span class="${
            sowStatusName === "Actual/Projected"
              ? "actual-projected-class-label"
              : "other-status-class"
          }">
              ${
                sowStatusName === "Actual/Projected"
                  ? `<strong>${sowStatusName}</strong>`
                  : sowStatusName == "70%-Total"
                    ? `${sowStatusName} (SOW Amount)`
                    : sowStatusName
              }
          </span>
          ${iconHtml}
      </td>
      ${accDataHtml + lastYrDataHtml}
  </tr>`;

      $("#report_overall_summary_body").append(sowLevelHtml);
    });

    $("#report_overall_summary_body").append(
      `<tr class="noExl overall_summary_tab_data" style="background-color: white"><td colspan="37"></td></tr>`,
    );
    // if (accountLevelData.length - 1 != accValue) {
    //   $("#report_overall_summary_body").append(accSowSelectDataTab);
    // }
  });
  $(".signedGroup").hide(); // Hide all signed group rows

  // Adjust the rowspan attribute for the overall rows
  $(".account_bg").each(function () {
    let overallRow = $(this);
    let sectionRowsCount = overallRow.attr("rowspan") || 1; // Set to 1 if undefined

    // Update the rowspan to reflect hidden rows
    let hiddenRowsCount = overallRow
      .closest("tr")
      .nextUntil(":not(.signedGroup)").length;
    overallRow.attr("rowspan", sectionRowsCount - hiddenRowsCount);
  });
}

function mergeSowStatuses(data, check) {
  const mergedData = {};

  data.forEach((item) => {
    const status = item.SOW_STATUS;

    // Ensure SOW_DATA is always treated as an array
    const sowDataArray = Array.isArray(item.SOW_DATA)
      ? item.SOW_DATA
      : [item.SOW_DATA];

    // If the status doesn't exist in mergedData, initialize it
    if (!mergedData[status]) {
      mergedData[status] = {
        SOW_STATUS: status,
        SOW_DATA: [...sowDataArray], // Spread operator to avoid reference issues
      };
    } else {
      // If status already exists, merge the SOW_DATA arrays
      mergedData[status].SOW_DATA =
        mergedData[status].SOW_DATA.concat(sowDataArray);
    }

    // Remove the last entry in the SOW_DATA for this status
    if (mergedData[status].SOW_DATA.length > 17) {
      if (check != "skip") {
        mergedData[status].SOW_DATA = mergedData[status].SOW_DATA.slice(0, -1); // Remove last element
      }
    }
  });

  // Convert the object back into an array of values
  return Object.values(mergedData);
}

function mergeAccSowStatuses(data) {
  const mergedData = {};

  data.forEach((item) => {
    const status = item.ACCOUNT_ID;
    const AccName = item.ACCOUNT_NAME;

    // Ensure SOW_DATA is always treated as an array
    const sowDataArray = Array.isArray(item.ACCOUNT_DATA)
      ? item.ACCOUNT_DATA
      : [item.ACCOUNT_DATA];

    // If the status doesn't exist in mergedData, initialize it
    if (!mergedData[status]) {
      mergedData[status] = {
        ACCOUNT_ID: status,
        ACCOUNT_NAME: AccName,
        ACCOUNT_DATA: [...sowDataArray], // Spread operator to avoid reference issues
      };
    } else {
      // If status already exists, merge the SOW_DATA arrays
      mergedData[status].ACCOUNT_DATA =
        mergedData[status].ACCOUNT_DATA.concat(sowDataArray);
    }

    // Remove the last entry in the SOW_DATA for this status
    // if (mergedData[status].ACCOUNT_DATA.length > 0) {
    //   mergedData[status].ACCOUNT_DATA = mergedData[status].ACCOUNT_DATA.slice(0, -1); // Remove last element
    // }
  });

  // Convert the object back into an array of values
  return Object.values(mergedData);
}

function mergeNewSowStatuses(data) {
  const mergedData = {};

  data.forEach((item) => {
    const status = item.SOW_TYPE;

    // Ensure SOW_DATA is always treated as an array
    const sowDataArray = Array.isArray(item.SOW_TYPE_DATA)
      ? item.SOW_TYPE_DATA
      : [item.SOW_TYPE_DATA];

    // If the status doesn't exist in mergedData, initialize it
    if (!mergedData[status]) {
      mergedData[status] = {
        SOW_TYPE: status,
        SOW_TYPE_DATA: [...sowDataArray], // Spread operator to avoid reference issues
      };
    } else {
      // If status already exists, merge the SOW_DATA arrays
      mergedData[status].SOW_TYPE_DATA =
        mergedData[status].SOW_TYPE_DATA.concat(sowDataArray);
    }

    // Remove the last entry in the SOW_DATA for this status
    // if (mergedData[status].SOW_DATA.length > 0) {
    //   mergedData[status].SOW_DATA = mergedData[status].SOW_DATA.slice(0, -1); // Remove last element
    // }
  });

  // Convert the object back into an array of values
  return Object.values(mergedData);
}

function assignDatatoTableMultipleYear(overallSummData, selectedYearval) {
  let accountHeaders = [];

  if (Array.isArray(overallSummData)) {
    // If it's an array, iterate through each element and gather headers
    overallSummData.forEach((item) => {
      accountHeaders.push(...item.HEADER_MONTHS); // Collect HEADER_MONTHS from each item
    });
  } else {
    // If it's a single object, access HEADER_MONTHS directly
    accountHeaders = overallSummData.HEADER_MONTHS;
  }

  let accHeaderHtml = "";

  // Separate months and quarters
  let monthsArray = accountHeaders.filter(
    (header) => !header.startsWith("Q") && !header.startsWith("os_"),
  );
  let quartersArray = accountHeaders.filter((header) => header.startsWith("Q"));

  quartersArray = quartersArray.filter(
    (header) => !/^Q[1-4]_(30|60|90|180)_days_\d{2}$/.test(header),
  );

  let fyArray = accountHeaders
    .filter((header) => header.startsWith("os_FY"))
    .map((header) => header.replace("os_", ""));

  let otherHeaders = accountHeaders
    .filter(
      (header) =>
        header.startsWith("os_") &&
        !header.startsWith("os_FY") &&
        !header.startsWith("os_gr"),
    )
    .map((header) => header.replace("os_", ""));

  let mnthQtrHtml = "",
    accOtherHeaderHTML = "";
  selectedYearval.map((year) => {
    let accHeaderMnthHtml = "",
      accHeaderQtrHTML = "";
    // accOtherHeaderHTML = "";
    // console.log("year", year);
    let AccountHeadermonts = monthsArray.filter((head) => {
      const splitHead = head.split("_");
      // Check if the last part (year) is included in the selectedYearval array
      return year.includes(splitHead[splitHead.length - 1]);
    });

    let AccountHeaderQtr = quartersArray.filter((head) => {
      const splitHead = head.split("_");
      return year.includes(splitHead[splitHead.length - 1]);
    });
    let AccountHeaderFY = fyArray.filter((head) => {
      const splitHead = head.split("_");
      return year.includes(splitHead[splitHead.length - 1]);
    });

    let AccountHeaderOther = otherHeaders.filter((head) => {
      const splitHead = head.split("_");
      return year.includes(splitHead[splitHead.length - 1]);
    });

    $.each(AccountHeadermonts, function (i) {
      accHeaderMnthHtml += `<th class='hideMnthReport' style='z-index: 104;' rowspan='2'>${AccountHeadermonts[
        i
      ].replace("_", "-")}</th>`;
    });

    $.each(AccountHeaderQtr, function (i) {
      accHeaderQtrHTML += `<th class='qtr-header' rowspan='2'>${AccountHeaderQtr[
        i
      ].replace("_", "-")}</th>`;
    });
    $.each(AccountHeaderFY, function (i) {
      accHeaderQtrHTML += `<th style='z-index: 104; background-color: #DFEDF6 !important';color:#818199;font-weight:600 !important'class="header-col" rowspan='2'>${AccountHeaderFY[
        i
      ].replaceAll("_", " ")}</th>`;
    });
    $.each(AccountHeaderOther, function (i) {
      accOtherHeaderHTML += `<th class='hideMnthReport' style='z-index: 104;'>${AccountHeaderOther[
        i
      ]
        .replaceAll("_", " ")
        .replace(` ${selectedYearval}`, "")}</th>`;
    });

    // $.each(AccountHeadermonts, function(i) {
    //   accHeaderMnthHtml += `<th class='hideMnthReport' style='z-index: 104;'>${AccountHeadermonts[
    //     i
    //   ].replace("_", "-")}</th>`;
    // });

    // $.each(AccountHeaderQtr, function(i) {
    //   accHeaderQtrHTML += `<th class='qtr-header'>${AccountHeaderQtr[i].replace(
    //     "_",
    //     "-"
    //   )}</th>`;
    // });
    mnthQtrHtml +=
      accHeaderMnthHtml +
      accHeaderQtrHTML +
      `<th class='hideMnthReport' style='z-index: 104;' colspan='4'><b>FY ${year} REVENUE CHANGE IN THE LAST</b></th>`;
    // `<th style='z-index: 101; background-color: #DFEDF6 !important'>FY ${year}</th>`;
  });
  //Header Assigned
  accHeaderHtml = `<th class='first_column' rowspan='2' style='z-index: 106;color:#818199'>Account Name</th>
    <th style='z-index: 106;color:#818199; font-weight:600 !important'; class="header-col second_colum" rowspan='2'></th> 
    <th class='arrow_cursor third_colum' rowspan='2' style='z-index: 106;padding: 5px !important;width: 1% !important;text-align: start' onclick="toggleAllArrowIcons()"><img class='arrow' src="images/right_arrow.png" width="8px"></th>
    ${mnthQtrHtml}
    `;

  $("#report_overall_summary").append(accHeaderHtml);
  $("#report_last_diff").append(accOtherHeaderHTML);

  let factspanData = Array.isArray(overallSummData)
    ? overallSummData.flatMap((item) => item.FACTSPAN_DATA || []) // Use flatMap to get FACTSPAN_DATA from all items
    : overallSummData.FACTSPAN_DATA || []; // Directly access FACTSPAN_DATA if it's a single object

  //console.log("Factspan Before", factspanData);
  factspanData = mergeSowStatuses(factspanData);
  //console.log("factspanData After - ", factspanData);
  let overall_fact_len = factspanData.length;
  // console.log("overall_fact_len", overall_fact_len);

  $.each(factspanData, function (index) {
    let sowStatus = factspanData[index].SOW_STATUS;
    if (sowStatus == "Signed") {
      sowStatus = "100% Signed (SOW Amount)";
    } else if (sowStatus == "Bridge from OP1") {
      sowStatus = "Bridge from OP1%";
    }
    let sowMonthData = factspanData[index].SOW_DATA;
    let sowMonthHtml = "",
      sowMonthLastYrHtml = "";
    // console.log("sowMonthData", sowMonthData);

    $.each(sowMonthData, function (value) {
      let dataYrFil = sowMonthData[value].MONTH_NAMES.split("_");
      if (
        sowMonthData[value].MONTH_NAMES.startsWith("Q") &&
        /_(30|60|90|180)_days/.test(sowMonthData[value].MONTH_NAMES)
      ) {
        return; // Skip this iteration
      }

      // console.log("dataYrFil", dataYrFil);
      // console.log("selectedYearval", selectedYearval);
      selectedYearval.map((year) => {
        if (dataYrFil[dataYrFil.length - 1] == year) {
          let valueFormatted;
          let toottip = false;
          let tempval = 0;
          let actualTempVal = true;
          // Skip "greater_180_days_24"
          if (
            sowMonthData[value].MONTH_NAMES ===
            "os_greater_180_days_" + year
          ) {
            return; // Continue to the next iteration
          }

          // Define a single class for all quarter data
          let quarterClass = "";
          if (sowMonthData[value].MONTH_NAMES.startsWith("Q")) {
            // Check if the data represents a quarter
            quarterClass = "quarter-class";
          } else if (sowMonthData[value].MONTH_NAMES.startsWith("T")) {
            quarterClass = "total-class";
            // Debug log
          } else {
            quarterClass = "hideMnthReport";
          }
          if (
            sowMonthData[value].VALUES !== null &&
            sowMonthData[value].VALUES !== undefined &&
            sowMonthData[value].VALUES !== ""
          ) {
            let amtVal = sowMonthData[value].VALUES;

            // Skip conversion for specific MONTH_NAMES
            // if (
            //   ![
            //     "os_30_days_"+selectedYearval,
            //     "os_60_days_"+selectedYearval,
            //     "os_90_days_"+selectedYearval,
            //     "os_180_days_"+selectedYearval,
            //   ].includes(sowMonthData[value].MONTH_NAMES)
            // ) {
            amtVal = (amtVal / 1000000).toFixed(2);
            // }
            // Format as dollar for MOM/QOQ % and YOY %
            if (sowStatus == "MOM/QOQ %" || sowStatus == "YOY %") {
              amtVal = sowMonthData[value].VALUES.toFixed(2);
              tempval =
                amtVal == 0.0
                  ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                  : "";
              if (tempval != "" || tempval != 0) {
                if (tempval > 0.0) toottip = true;
              }
              valueFormatted = amtVal == 0.0 && !toottip ? "--" : amtVal; // Format as dollar amount in millions
            } else if (sowStatus.endsWith("%")) {
              tempval =
                amtVal == 0.0
                  ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                  : "";
              if (tempval != "" || tempval != 0) {
                if (tempval > 0.0) toottip = true;
              }
              valueFormatted = amtVal == 0.0 && !toottip ? "--" : "$" + amtVal; // Format as dollar amount in millions
            } else if (sowStatus == "Actual/Projected") {
              tempval =
                amtVal == 0.0
                  ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                  : "";
              if (tempval != "" || tempval != 0) {
                if (tempval > 0.0) toottip = true;
              }
              if (
                [
                  "os_30_days_" + year,
                  "os_60_days_" + year,
                  "os_90_days_" + year,
                  "os_180_days_" + year,
                ].includes(sowMonthData[value].MONTH_NAMES)
              ) {
                valueFormatted = `<strong class="actual-projected-class">${
                  amtVal == 0.0 && !toottip
                    ? "--"
                    : `<span class='${
                        amtVal >= 0.0 ? "postive_val" : "negative_val"
                      }'>${
                        amtVal >= 0.0
                          ? `+ $${amtVal}`
                          : `- $${amtVal.replace("-", "")}`
                      }</span>`
                }</strong>`;
              } else {
                valueFormatted = `<strong class="actual-projected-class">${
                  amtVal == 0.0 && !toottip ? "--" : "$" + amtVal
                }</strong>`;
              }
            } else {
              tempval =
                amtVal == 0.0
                  ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                  : "";
              if (tempval != "" || tempval != 0) {
                if (tempval > 0.0) toottip = true;
              }
              if (
                [
                  "os_30_days_" + year,
                  "os_60_days_" + year,
                  "os_90_days_" + year,
                  "os_180_days_" + year,
                ].includes(sowMonthData[value].MONTH_NAMES)
              ) {
                valueFormatted =
                  amtVal == 0.0 && !toottip
                    ? "--"
                    : `<span class='${
                        amtVal >= 0.0 ? "postive_val" : "negative_val"
                      }'>${
                        amtVal >= 0.0
                          ? `+ $${amtVal}`
                          : `- $${amtVal.replace("-", "")}`
                      }</span>`;
              } else {
                valueFormatted =
                  amtVal == 0.0 && !toottip ? "--" : "$" + amtVal;
              }
            }
            if (amtVal == 0.0) {
              actualTempVal = false;
            }
          } else {
            valueFormatted = "--"; // Placeholder for empty values
          }
          let accid = "";
          sowMonthHtml += `<td class="${
            sowMonthData[value].FLAG
          } ${quarterClass} CellWithComment table-cell" 
               style="${
                 (sowStatus === "70%-Total" ||
                   sowStatus === "70%-Qualified" ||
                   sowStatus === "70%-Proposal" ||
                   sowStatus === "70%-Renewal" ||
                   sowStatus === "100% Signed") &&
                 valueFormatted !== "--" &&
                 valueFormatted !== "0.00"
                   ? "text-decoration: underline; cursor: pointer;"
                   : ""
               }"
              <td class="${
                sowMonthData[value].FLAG
              } ${quarterClass} CellWithComment table-cell"
      style="${
        (sowStatus === "70%-Total" ||
          sowStatus === "70%-Qualified" ||
          sowStatus === "70%-Proposal" ||
          sowStatus === "70%-Renewal" ||
          sowStatus === "100% Signed") &&
        valueFormatted !== "--" &&
        valueFormatted !== "0.00"
          ? "text-decoration: underline; cursor: pointer;"
          : ""
      }"
      onclick="${
        (quarterClass === "quarter-class" || quarterClass === "total-class") &&
        (sowStatus === "70%-Total" ||
          sowStatus === "70%-Qualified" ||
          sowStatus === "70%-Proposal" ||
          sowStatus === "70%-Renewal" ||
          sowStatus === "100% Signed")
          ? `showPopup('${sowStatus}', '${sowMonthData[value].MONTH_NAMES}','Overall', '${sowMonthData[value].MONTH_NAMES}', this, 'multi')`
          : sowStatus === "70%-Total" ||
              sowStatus === "70%-Qualified" ||
              sowStatus === "70%-Proposal" ||
              sowStatus === "70%-Renewal" ||
              sowStatus === "100% Signed"
            ? `popupDataajax('${sowStatus}', '${sowMonthData[value].MONTH_NAMES}',${accid}).then(popupData => showPopupMonth(popupData, this))`
            : ""
      }"
      data-popup='${
        (quarterClass === "quarter-class" || quarterClass === "total-class") &&
        (sowStatus === "70%-Total" ||
          sowStatus === "70%-Qualified" ||
          sowStatus === "70%-Proposal" ||
          sowStatus === "70%-Renewal" ||
          sowStatus === "100% Signed")
          ? JSON.stringify(popupData)
          : sowStatus === "70%-Total" ||
              sowStatus === "70%-Qualified" ||
              sowStatus === "70%-Proposal" ||
              sowStatus === "70%-Renewal" ||
              sowStatus === "100% Signed"
            ? JSON.stringify(popupDataMonth)
            : ""
      }'>
    ${valueFormatted}
    ${toottip ? `<span class="CellComment">${tempval}</span>` : ""}
  </td>
  
                  ${valueFormatted}
                  ${
                    toottip ? `<span class="CellComment">${tempval}</span>` : ""
                  }
          </td>`;
        }
        // else{
        //   sowMonthHtml += `<td class="CellWithComment" colspan='13'></td>`;
        // }
      });
    });
    // console.log('sowMonthHtml', sowMonthHtml);
    let classSignedGroup = "";
    if (
      sowStatus == "70%-Renewal" ||
      sowStatus == "70%-Proposal" ||
      sowStatus == "70%-Qualified"
    ) {
      classSignedGroup = "singedGroup noExl";
    }
    let iconHtml = "",
      iconHtmlActual = "";
    if (sowStatus === "70%-Total") {
      iconHtml =
        ' <i class="fa fa-expand icon-custom-style" aria-hidden="true"></i>';
    }
    if (sowStatus == "MOM/QOQ %" || sowStatus == "YOY %") {
      classSignedGroup = "singedGroup noExl";
    }
    if (sowStatus === "Actual/Projected") {
      iconHtmlActual =
        '<i class="fa fa-expand icon-custom-style" aria-hidden="true"></i>';
    }

    let factspanHtml = `<tr class='${classSignedGroup}' >
                          ${
                            index == 0
                              ? `<td class="account_bg first_column" style="font-weight:600;color:#818199" id='factspan_overall_sum' rowspan="${
                                  overall_fact_len - 5
                                }">Overall</td>`
                              : ""
                          }
                          <td class='signed_data second_colum' ${
                            sowStatus == "70%-Total" ||
                            sowStatus === "Actual/Projected"
                              ? `onclick="toggleSignedRows(this, ${overall_fact_len})"`
                              : ""
                          }> 
     <span style="display: inline-flex;">
            <span class="${
              sowStatus === "Actual/Projected"
                ? "actual-projected-class-label"
                : "other-status-class"
            }">
                ${
                  sowStatus === "Actual/Projected"
                    ? `<strong>${sowStatus}</strong>`
                    : sowStatus == "70%-Total"
                      ? `${sowStatus} (SOW Amount)`
                      : sowStatus
                }
            </span>
            ${sowStatus === "Actual/Projected" ? iconHtmlActual : iconHtml}
        </span>

</td>
                          ${
                            index == 0
                              ? `<td class='arrow_cursor third_colum' id='factspan_overall_sum_arrow' onclick="toggleAllArrowIcons()" rowspan="${
                                  overall_fact_len - 5
                                }"><img class='arrow' src="images/right_arrow.png" width="8px"></td>`
                              : ""
                          }
                          ${sowMonthHtml + sowMonthLastYrHtml}
                      </tr>`;
    $("#report_overall_summary_body").append(factspanHtml);
  });

  $("#report_overall_summary_body").append(
    `<tr style="background-color: white"><td colspan="70"></td></tr>`,
  );

  // Toggle nested rows visibility for Actual/Projected and signed statuses
  let newLogoData = Array.isArray(overallSummData)
    ? overallSummData.flatMap((item) => item.NEW_LOGO_DATA || []) // Use flatMap to get FACTSPAN_DATA from all items
    : overallSummData.NEW_LOGO_DATA || []; // Directly access FACTSPAN_DATA if it's a single object
  newLogoData = mergeSowStatuses(newLogoData);
  // console.log("newLogoData - ", newLogoData);
  let new_logo_len = newLogoData.length;
  $("#report_overall_summary_body").append(
    `<tr class='noExl'><td colspan="70"><span class='status_btn_show_hide show_hide_new_logo first_column' onclick='toggleStatusRows()'>Show - New Logo, Current, Current New, Net New</span></td></tr>`,
  );
  $.each(newLogoData, function (index) {
    let sowStatus = newLogoData[index].SOW_STATUS;

    // Format SOW_STATUS
    if (sowStatus == "Signed") {
      sowStatus = "100% Signed (SOW Amount)";
    } else if (sowStatus == "Signed + Green") {
      sowStatus = "> 70%";
    } else if (sowStatus == "OP") {
      sowStatus = "OP1";
    }

    let sowMonthData = newLogoData[index].SOW_DATA;
    let sowMonthHtml = "",
      sowMonthLastYrHtml = "";

    // Iterate through sowMonthData
    $.each(sowMonthData, function (value) {
      let dataYrFil = sowMonthData[value].MONTH_NAMES.split("_");

      if (
        sowMonthData[value].MONTH_NAMES.startsWith("Q") &&
        /_(30|60|90|180)_days/.test(sowMonthData[value].MONTH_NAMES)
      ) {
        return; // Skip this iteration
      }

      selectedYearval.map((year) => {
        if (dataYrFil[dataYrFil.length - 1] == year) {
          let valueInMillions;
          let toottip = false;
          let tempval = 0;
          // Skip "greater_180_days_24"
          if (
            sowMonthData[value].MONTH_NAMES ===
            "os_greater_180_days_" + year
          ) {
            return; // Continue to the next iteration
          }
          // Define a single class for all quarter data
          let quarterClass = "";
          if (sowMonthData[value].MONTH_NAMES.startsWith("Q")) {
            // Check if the data represents a quarter
            quarterClass = "quarter-class";
          } else if (sowMonthData[value].MONTH_NAMES.startsWith("T")) {
            quarterClass = "total-class";
            // Debug log
          } else {
            quarterClass = "hideMnthReport";
          }
          // Check if sowMonthData[value].VALUES is valid and not null/undefined/empty
          if (
            sowMonthData[value].VALUES !== null &&
            sowMonthData[value].VALUES !== undefined &&
            sowMonthData[value].VALUES !== ""
          ) {
            let amtVal = (sowMonthData[value].VALUES / 1000000).toFixed(2);
            if (sowStatus == "Actual/Projected") {
              tempval =
                amtVal == 0.0
                  ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                  : "";
              if (tempval != "" || tempval != 0) {
                if (tempval > 0.0) toottip = true;
              }
              if (
                [
                  "os_30_days_" + year,
                  "os_60_days_" + year,
                  "os_90_days_" + year,
                  "os_180_days_" + year,
                ].includes(sowMonthData[value].MONTH_NAMES)
              ) {
                valueInMillions = `<strong class="actual-projected-class">${
                  amtVal == 0.0 && !toottip
                    ? "--"
                    : `<span class='${
                        amtVal >= 0.0 ? "postive_val" : "negative_val"
                      }'>${
                        amtVal >= 0.0
                          ? `+ $${amtVal}`
                          : `- $${amtVal.replace("-", "")}`
                      }</span>`
                }</strong>`;
              } else {
                valueInMillions = `<strong class="actual-projected-class">${
                  amtVal == 0.0 && !toottip ? "--" : "$" + amtVal
                }</strong>`;
              }
            } else {
              tempval =
                amtVal == 0.0
                  ? (sowMonthData[value].VALUES / 1000000).toFixed(3)
                  : "";
              if (tempval != "" || tempval != 0) {
                if (tempval > 0.0) toottip = true;
              }
              if (
                [
                  "os_30_days_" + year,
                  "os_60_days_" + year,
                  "os_90_days_" + year,
                  "os_180_days_" + year,
                ].includes(sowMonthData[value].MONTH_NAMES)
              ) {
                valueInMillions =
                  amtVal == 0.0 && !toottip
                    ? "--"
                    : `<span class='${
                        amtVal >= 0.0 ? "postive_val" : "negative_val"
                      }'>${
                        amtVal >= 0.0
                          ? `+ $${amtVal}`
                          : `- $${amtVal.replace("-", "")}`
                      }</span>`;
              } else {
                valueInMillions =
                  amtVal == 0.0 && !toottip ? "--" : "$" + amtVal;
              }
            }
          } else {
            valueInMillions = "--"; // Placeholder for invalid values
          }

          sowMonthHtml += `<td class="${
            sowMonthData[value].FLAG
          } ${quarterClass} CellWithComment table-cell">
                              ${valueInMillions}
                              ${
                                toottip
                                  ? `<span class="CellComment">${tempval}</span>`
                                  : ""
                              }
                              </td>`;
        }
      });

      // Uncomment and modify this if needed to handle last year's data
      // if (sowMonthData[value].MONTH_NAMES == "TOTAL_" + lastYear) {
      //     let valueInMillions = (sowMonthData[value].VALUES / 1000000).toFixed(2); // Convert to millions and format to 3 decimal places
      //     sowMonthLastYrHtml = `<td class="${sowMonthData[value].FLAG}">$${valueInMillions}</td>`;
      // }
    });

    let newLogoHtml = `<tr class="new-logo-row noExl">
                                ${
                                  index == 0
                                    ? `<td class="account_bg first_column" rowspan="${new_logo_len}">New Logo</td>`
                                    : ""
                                }
                                <td class='second_colum'>
                                  <span class="${
                                    sowStatus === "Actual/Projected"
                                      ? "actual-projected-class-label"
                                      : "other-status-class"
                                  }">
                                          ${
                                            sowStatus === "Actual/Projected"
                                              ? `<strong>${sowStatus}</strong>`
                                              : sowStatus
                                          }
                                  </span>
                                </td>
                                ${
                                  index == 0
                                    ? `<td class='third_colum arrow_cursor' rowspan="${new_logo_len}" onclick="toggleAllArrowIcons()"><img class='arrow' src="images/right_arrow.png" width="8px"></td>`
                                    : ""
                                }
                                ${sowMonthHtml + sowMonthLastYrHtml}
                            </tr>`;

    $("#report_overall_summary_body").append(newLogoHtml);
  });

  $("#report_overall_summary_body").append(
    `<tr class="new-logo-row noExl" style="background-color: white"><td colspan="70"></td></tr>`,
  );
  let sowTypeData = Array.isArray(overallSummData)
    ? overallSummData.flatMap((item) => item.SOW_TYPE || []) // Use flatMap to get FACTSPAN_DATA from all items
    : overallSummData.SOW_TYPE || []; // Directly access FACTSPAN_DATA if it's a single object
  sowTypeData = mergeNewSowStatuses(sowTypeData);
  $.each(sowTypeData, function (sowValue) {
    let sowTypeName = sowTypeData[sowValue].SOW_TYPE;
    let sowTypeSowData = sowTypeData[sowValue].SOW_TYPE_DATA;
    sowTypeSowData = mergeSowStatuses(sowTypeSowData);
    let sow_type_len = sowTypeSowData.length;
    $.each(sowTypeSowData, function (sowTypeDataval) {
      let sowTypeDataHtml = "",
        lastYrDataHtml = "";
      let sowStatusName = sowTypeSowData[sowTypeDataval].SOW_STATUS;
      let sowStatusData = sowTypeSowData[sowTypeDataval].SOW_DATA;

      // Iterate over each SOW status data
      $.each(sowStatusData, function (sowTypeEach) {
        let dataYrFil = sowStatusData[sowTypeEach].MONTH_NAMES.split("_");
        let monthName = sowStatusData[sowTypeEach].MONTH_NAMES;

        // **Skip iterations where MONTH_NAMES starts with "Q" and contains "_180_days"**
        if (
          monthName.startsWith("Q") &&
          /_(30|60|90|180)_days/.test(monthName)
        ) {
          return true; // Skip these entries
        }

        selectedYearval.map((year) => {
          if (dataYrFil[dataYrFil.length - 1] == year) {
            let valueInMillions;
            let toottip = false;
            let tempval = 0;
            // Skip "greater_180_days_24"
            if (
              sowStatusData[sowTypeEach].MONTH_NAMES ===
              "os_greater_180_days_" + year
            ) {
              return; // Continue to the next iteration
            }
            // Define a single class for all quarter data
            let quarterClass = "";
            if (sowStatusData[sowTypeEach].MONTH_NAMES.startsWith("Q")) {
              // Check if the data represents a quarter
              quarterClass = "quarter-class";
            } else if (sowStatusData[sowTypeEach].MONTH_NAMES.startsWith("T")) {
              quarterClass = "total-class";
              // Debug log
            } else {
              quarterClass = "hideMnthReport";
            }
            // Check if VALUES is valid (not null, undefined, or empty)
            if (
              sowStatusData[sowTypeEach].VALUES !== null &&
              sowStatusData[sowTypeEach].VALUES !== undefined &&
              sowStatusData[sowTypeEach].VALUES !== ""
            ) {
              let amtVal = (
                sowStatusData[sowTypeEach].VALUES / 1000000
              ).toFixed(2);
              if (sowStatusName == "Actual/Projected") {
                tempval =
                  amtVal == 0.0
                    ? (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(3)
                    : "";
                if (tempval != "" || tempval != 0) {
                  if (tempval > 0.0) toottip = true;
                }
                if (
                  [
                    "os_30_days_" + year,
                    "os_60_days_" + year,
                    "os_90_days_" + year,
                    "os_180_days_" + year,
                  ].includes(sowStatusData[sowTypeEach].MONTH_NAMES)
                ) {
                  valueInMillions = `<strong class="actual-projected-class">${
                    amtVal == 0.0 && !toottip
                      ? "--"
                      : `<span class='${
                          amtVal >= 0.0 ? "postive_val" : "negative_val"
                        }'>${
                          amtVal >= 0.0
                            ? `+ $${amtVal}`
                            : `- $${amtVal.replace("-", "")}`
                        }</span>`
                  }</strong>`;
                } else {
                  valueInMillions = `<strong class="actual-projected-class">${
                    amtVal == 0.0 && !toottip ? "--" : "$" + amtVal
                  }</strong>`;
                }
              } else {
                tempval =
                  amtVal == 0.0
                    ? (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(3)
                    : "";
                if (tempval != "" || tempval != 0) {
                  if (tempval > 0.0) toottip = true;
                }
                if (
                  [
                    "os_30_days_" + year,
                    "os_60_days_" + year,
                    "os_90_days_" + year,
                    "os_180_days_" + year,
                  ].includes(sowStatusData[sowTypeEach].MONTH_NAMES)
                ) {
                  valueInMillions =
                    amtVal == 0.0 && !toottip
                      ? "--"
                      : `<span class='${
                          amtVal >= 0.0 ? "postive_val" : "negative_val"
                        }'>${
                          amtVal >= 0.0
                            ? `+ $${amtVal}`
                            : `- $${amtVal.replace("-", "")}`
                        }</span>`;
                } else {
                  valueInMillions =
                    amtVal == 0.0 && !toottip ? "--" : "$" + amtVal;
                }
              }
            } else {
              valueInMillions = "--"; // Placeholder for invalid values
            }

            sowTypeDataHtml += `<td class="${
              sowStatusData[sowTypeEach].FLAG
            } ${quarterClass} CellWithComment table-cell">
                                          ${valueInMillions}
                                          ${
                                            toottip
                                              ? `<span class="CellComment">${(
                                                  sowStatusData[sowTypeEach]
                                                    .VALUES / 1000000
                                                ).toFixed(3)}</span>`
                                              : ""
                                          }
                                          </td>`;
          }
        });

        // Uncomment and modify this if needed to handle last year's data
        // if (sowStatusData[sowTypeEach].MONTH_NAMES == "TOTAL_" + lastYear) {
        //     lastYrDataHtml = `<td class="${sowStatusData[sowTypeEach].FLAG}">$${(Math.round(sowStatusData[sowTypeEach].VALUES)).toLocaleString()}</td>`;
        // }
      });

      // Map SOW_STATUS to its corresponding display name
      if (sowStatusName == "Signed") {
        sowStatusName = "100% Signed (SOW Amount)";
      } else if (sowStatusName == "Signed + Green") {
        sowStatusName = "> 70%";
      } else if (sowStatusName == "OP") {
        sowStatusName = "OP1";
      }

      // Generate the HTML row for the current SOW type
      let sowLevelHtml = `<tr class='new-logo-row noExl'>
                                    ${
                                      sowTypeDataval == 0
                                        ? `<td class="account_bg first_column" rowspan="${sow_type_len}">${sowTypeName}</td>`
                                        : ""
                                    }
                                    <td class='second_colum'>
                                      <span class="${
                                        sowStatusName === "Actual/Projected"
                                          ? "actual-projected-class-label"
                                          : "other-status-class"
                                      }">
                                          ${
                                            sowStatusName === "Actual/Projected"
                                              ? `<strong>${sowStatusName}</strong>`
                                              : sowStatusName
                                          }
                                      </span>
                                    </td>
                                    ${
                                      sowTypeDataval == 0
                                        ? `<td class='third_colum arrow_cursor' rowspan="${sow_type_len}" onclick="toggleAllArrowIcons()"><img class='arrow' src="images/right_arrow.png" width="8px"></td>`
                                        : ""
                                    }
                                    ${sowTypeDataHtml + lastYrDataHtml}
                                </tr>`;

      $("#report_overall_summary_body").append(sowLevelHtml);
    });

    $("#report_overall_summary_body").append(
      `<tr class="new-logo-row noExl" style="background-color: white"><td colspan="70"></td></tr>`,
    );
  });
  $(".new-logo-row").hide();
  $(".status_btn_show_hide").text(
    "Show - New Logo, Current, Current New, Net New",
  );

  $("#report_overall_summary_body").append(
    `<tr class="account_level"><td colspan="70"><span class='first_column'>Account Level Breakup</span></td></tr>`,
  );
  $("#report_overall_summary_body").append(
    `<tr style="background-color: white"><td colspan="70"></td></tr>`,
  );
  let accountLevelData = Array.isArray(overallSummData)
    ? overallSummData.flatMap((item) => item.ACCOUNT_LEVEL_DATA || []) // Use flatMap to get FACTSPAN_DATA from all items
    : overallSummData.ACCOUNT_LEVEL_DATA || []; // Directly access FACTSPAN_DATA if it's a single object

  accountLevelData = mergeAccSowStatuses(accountLevelData);
  $.each(accountLevelData, function (accValue) {
    let accName = accountLevelData[accValue].ACCOUNT_NAME;
    let accID = accountLevelData[accValue].ACCOUNT_ID;
    let accSowTypeData = accountLevelData[accValue].ACCOUNT_DATA;
    accSowTypeData = mergeSowStatuses(accSowTypeData);
    if (selectedYearval.length == 2 && accSowTypeData.length == 7) {
      const updatedData = addDummyDataForMissingYears(
        accSowTypeData,
        selectedYearval,
      );
      accSowTypeData = mergeSowStatuses(updatedData, "skip");
    } else if (
      selectedYearval.length == 3 &&
      (accSowTypeData.length == 7 || accSowTypeData.length == 14)
    ) {
      const updatedData = addDummyDataForMissingYears(
        accSowTypeData,
        selectedYearval,
      );
      accSowTypeData = mergeSowStatuses(updatedData, "skip");
    }
    let acc_fact_len = accSowTypeData.length;
    $.each(accSowTypeData, function (accTypeData) {
      let accDataHtml = "",
        lastYrDataHtml = "";
      let sowStatusName = accSowTypeData[accTypeData].SOW_STATUS;
      let sowStatusData = accSowTypeData[accTypeData].SOW_DATA;

      // Initialize classSignedGroup and iconHtml
      let classSignedGroup = "";
      let iconHtml = "";

      // Logic for classSignedGroup and iconHtml
      if (
        sowStatusName === "70%-Renewals" ||
        sowStatusName === "70%-Proposals" ||
        sowStatusName === "70%-Qualified"
      ) {
        classSignedGroup = "signedGroup noExl";
      }

      // Also add icon for 70%-Total
      if (sowStatusName === "70%-Total") {
        iconHtml =
          ' <i class="fa fa-expand icon-custom-style" aria-hidden="true"></i>'; // Add icon for these statuses
      }

      // Iterate over each SOW status data
      $.each(sowStatusData, function (sowTypeEach) {
        let dataYrFil = sowStatusData[sowTypeEach].MONTH_NAMES.split("_");
        let monthName = sowStatusData[sowTypeEach].MONTH_NAMES;

        if (
          monthName.startsWith("Q") &&
          /_(30|60|90|180)_days/.test(monthName)
        ) {
          return true; // Skip this iteration (equivalent to `continue` in $.each)
        }

        selectedYearval.map((year) => {
          if (dataYrFil[dataYrFil.length - 1] == year) {
            let valueInMillions;
            let toottip = false;
            let tempval = 0;
            let actualTempVal = true;
            let monthData = sowStatusData[sowTypeEach];
            let quarterClass_data = "";
            // Skip "greater_180_days_24"
            if (
              sowStatusData[sowTypeEach].MONTH_NAMES ===
              "os_greater_180_days_" + year
            ) {
              return; // Continue to the next iteration
            }
            // Check if the data represents a quarter or total year
            if (/^Q[1-4]_\d{2}$/.test(monthData.MONTH_NAMES)) {
              quarterClass_data = "quarter-class"; // Q1_25, Q2_25, etc.
            } else if (/^Q[1-4]_(30|60|90|180)/.test(monthData.MONTH_NAMES)) {
              quarterClass_data = "quarter-class-ex"; // Q1_30, Q2_60, etc.
            } else if (monthData.MONTH_NAMES.startsWith("T")) {
              quarterClass_data = "total-class"; // T1_30, T2_60, etc.
            } else {
              quarterClass_data = "hideMnthReport"; // Any other values
            }

            // Check if VALUES is valid (not null, undefined, or empty)
            if (
              sowStatusData[sowTypeEach].VALUES !== null &&
              sowStatusData[sowTypeEach].VALUES !== undefined &&
              sowStatusData[sowTypeEach].VALUES !== "" &&
              sowStatusData[sowTypeEach].VALUES !== "-"
            ) {
              let amtVal = (
                sowStatusData[sowTypeEach].VALUES / 1000000
              ).toFixed(2);
              if (sowStatusName == "Actual/Projected") {
                tempval =
                  amtVal == 0.0
                    ? (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(3)
                    : "";
                if (tempval != "" || tempval != 0) {
                  if (tempval > 0.0) toottip = true;
                }
                if (
                  [
                    "os_30_days_" + year,
                    "os_60_days_" + year,
                    "os_90_days_" + year,
                    "os_180_days_" + year,
                  ].includes(sowStatusData[sowTypeEach].MONTH_NAMES)
                ) {
                  valueInMillions = `<strong class="actual-projected-class">${
                    amtVal == 0.0 && !toottip
                      ? "--"
                      : `<span class='${
                          amtVal >= 0.0 ? "postive_val" : "negative_val"
                        }'>${
                          amtVal >= 0.0
                            ? `+ $${amtVal}`
                            : `- $${amtVal.replace("-", "")}`
                        }</span>`
                  }</strong>`;
                } else {
                  valueInMillions = `<strong class="actual-projected-class">${
                    amtVal == 0.0 && !toottip ? "--" : "$" + amtVal
                  }</strong>`;
                }
              } else {
                tempval =
                  amtVal == 0.0
                    ? (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(3)
                    : "";
                if (tempval != "" || tempval != 0) {
                  if (tempval > 0.0) toottip = true;
                }
                if (
                  [
                    "os_30_days_" + year,
                    "os_60_days_" + year,
                    "os_90_days_" + year,
                    "os_180_days_" + year,
                  ].includes(sowStatusData[sowTypeEach].MONTH_NAMES)
                ) {
                  valueInMillions =
                    amtVal == 0.0 && !toottip
                      ? "--"
                      : `<span class='${
                          amtVal >= 0.0 ? "postive_val" : "negative_val"
                        }'>${
                          amtVal >= 0.0
                            ? `+ $${amtVal}`
                            : `- $${amtVal.replace("-", "")}`
                        }</span>`;
                } else {
                  valueInMillions =
                    amtVal == 0.0 && !toottip ? "--" : "$" + amtVal;
                }
              }
              if (amtVal == 0.0) {
                actualTempVal = false;
              }
            } else {
              valueInMillions = "--"; // Placeholder for invalid values
            }
            //     if(sowStatusName === "Actual/Projected"){
            //   valueInMillions = `<strong class="actual-projected-class">${valueInMillions == '--' ? '--' : `${valueInMillions}`}</strong>`;
            // }
            accDataHtml += `<td class="${
              sowStatusData[sowTypeEach]?.FLAG || ""
            } ${quarterClass_data} CellWithComment table-cell" 
              style="${
                (sowStatusName === "70%-Total" ||
                  sowStatusName === "70%-Qualified" ||
                  sowStatusName === "70%-Proposals" ||
                  sowStatusName === "70%-Renewals" ||
                  sowStatusName === "Signed") &&
                valueInMillions !== "--" &&
                valueInMillions !== "0.00"
                  ? "text-decoration: underline; cursor: pointer;"
                  : ""
              }"
              onclick="${
                (quarterClass_data === "quarter-class" ||
                  quarterClass_data === "total-class") &&
                (sowStatusName === "70%-Total" ||
                  sowStatusName === "70%-Qualified" ||
                  sowStatusName === "70%-Proposals" ||
                  sowStatusName === "70%-Renewals" ||
                  sowStatusName === "Signed")
                  ? `showPopup('${sowStatusName}', '${sowStatusData[sowTypeEach].MONTH_NAMES}','${accID}', '${sowStatusData[sowTypeEach].MONTH_NAMES}, this, 'multi')`
                  : sowStatusName === "70%-Total" ||
                      sowStatusName === "70%-Qualified" ||
                      sowStatusName === "70%-Proposals" ||
                      sowStatusName === "70%-Renewals" ||
                      sowStatusName === "Signed"
                    ? `popupDataajax('${sowStatusName}', '${monthData.MONTH_NAMES}','${accID}').then(popupData => showPopupMonthAcc(popupData, this))`
                    : ""
              }"
  
              tooltip="${
                sowStatusData[sowTypeEach]?.VALUES
                  ? (sowStatusData[sowTypeEach].VALUES / 1000000).toFixed(3)
                  : "N/A"
              }">
              ${
                sowStatusData[sowTypeEach]?.STATUS === "Actual/Projected"
                  ? `<strong>$${valueInMillions}</strong>`
                  : `${valueInMillions || "0.000"}`
              }
              ${
                toottip
                  ? `<span class="CellComment">${
                      monthData?.VALUES
                        ? (monthData.VALUES / 1000000).toFixed(3)
                        : "N/A"
                    }</span>`
                  : ""
              }
            </td>`;
          }
        });

        // Uncomment and modify this if needed to handle last year's data
        // if (sowStatusData[sowTypeEach].MONTH_NAMES == "TOTAL_" + lastYear) {
        //     lastYrDataHtml = `<td class="${sowStatusData[sowTypeEach].FLAG}">$${(Math.round(sowStatusData[sowTypeEach].VALUES)).toLocaleString()}</td>`;
        // }
      });

      // Map SOW_STATUS to its corresponding display name
      if (sowStatusName === "Signed") {
        sowStatusName = "100% Signed (SOW Amount)";
      } else if (sowStatusName === "OP") {
        sowStatusName = "OP1";
      }

      // Generate the HTML row for the current SOW type
      let sowLevelHtml = `<tr class='${classSignedGroup}'>
      ${
        accTypeData == 0
          ? `<td class="account_bg factspan_account_sum_${accID} first_column" rowspan="${
              acc_fact_len - 3
            }">${accName}</td>`
          : ""
      }
      <td ${
        sowStatusName === "70%-Total"
          ? `onclick="toggleAccountSignedRows(this, ${acc_fact_len})" data-id=${accID} class='signed_data second_colum'`
          : "class='second_colum'"
      }>
        <span class="${
          sowStatusName === "Actual/Projected"
            ? "actual-projected-class-label"
            : "other-status-class"
        }">
          ${
            sowStatusName === "Actual/Projected"
              ? `<strong>${sowStatusName}</strong>`
              : sowStatusName
          } ${iconHtml}
        </span>
      </td>
      ${
        accTypeData == 0
          ? `<td class="factspan_account_sum_${accID} arrow_cursor third_colum" rowspan="${
              acc_fact_len - 3
            }" onclick="toggleAllArrowIcons()">
               <img class='arrow' src="images/right_arrow.png" width="8px">
             </td>`
          : ""
      }
      ${accDataHtml + lastYrDataHtml}
    </tr>`;

      $("#report_overall_summary_body").append(sowLevelHtml);
    });

    $("#report_overall_summary_body").append(
      `<tr class="noExl" style="background-color: white"><td colspan="70"></td></tr>`,
    );
  });
  $(".signedGroup").hide(); // Hide all signed group rows

  // Adjust the rowspan attribute for the overall rows
  $(".account_bg").each(function () {
    let overallRow = $(this);
    let sectionRowsCount = overallRow.attr("rowspan") || 1; // Set to 1 if undefined

    // Update the rowspan to reflect hidden rows
    let hiddenRowsCount = overallRow
      .closest("tr")
      .nextUntil(":not(.signedGroup)").length;
    overallRow.attr("rowspan", sectionRowsCount - hiddenRowsCount);
  });
}

function addDummyDataForMissingYears(data, years) {
  // Helper function to generate dummy data for missing years
  const generateDummyData = (monthName, quarter, flag) => ({
    VALUES: "-",
    MONTH_NAMES: monthName,
    QUARTER: quarter,
    FLAG: flag,
  });

  // Iterate through each SOW status in the provided data
  data.forEach((item) => {
    // Iterate through each year in the given years list
    years.forEach((year) => {
      // Ensure the year format is consistent, e.g., '23' -> '2023'
      const fullYear = year.length === 2 ? `20${year}` : year;

      // Check if the current year data exists
      const yearExists = item.SOW_DATA.some((entry) =>
        entry.MONTH_NAMES.includes(`_${year}`),
      );
      if (!yearExists) {
        // Add dummy data for each month and quarter for the missing year
        const dummyMonths = [
          generateDummyData(`Jan_${year}`, `${fullYear}Q1`, ""),
          generateDummyData(`Feb_${year}`, `${fullYear}Q1`, ""),
          generateDummyData(`Mar_${year}`, `${fullYear}Q1`, ""),
          generateDummyData(`Apr_${year}`, `${fullYear}Q2`, ""),
          generateDummyData(`May_${year}`, `${fullYear}Q2`, ""),
          generateDummyData(`Jun_${year}`, `${fullYear}Q2`, ""),
          generateDummyData(`Jul_${year}`, `${fullYear}Q3`, ""),
          generateDummyData(`Aug_${year}`, `${fullYear}Q3`, ""),
          generateDummyData(`Sep_${year}`, `${fullYear}Q3`, ""),
          generateDummyData(`Oct_${year}`, `${fullYear}Q4`, ""),
          generateDummyData(`Nov_${year}`, `${fullYear}Q4`, ""),
          generateDummyData(`Dec_${year}`, `${fullYear}Q4`, ""),
          generateDummyData(`Q1_${year}`, `${fullYear}Q1`, ""),
          generateDummyData(`Q2_${year}`, `${fullYear}Q2`, ""),
          generateDummyData(`Q3_${year}`, `${fullYear}Q3`, ""),
          generateDummyData(`Q4_${year}`, `${fullYear}Q4`, ""),
          generateDummyData(`TOTAL_${year}`, "NaT", ""),
        ];

        // Add the dummy data to the SOW_DATA array
        item.SOW_DATA.push(...dummyMonths);
      }
    });

    // Sorting SOW_DATA by year extracted from MONTH_NAMES
    item.SOW_DATA.sort((a, b) => {
      const yearA = parseInt(a.MONTH_NAMES.match(/_(\d{2,4})$/)?.[1] || "0");
      const yearB = parseInt(b.MONTH_NAMES.match(/_(\d{2,4})$/)?.[1] || "0");
      return yearA - yearB;
    });
  });

  return data;
}

function toggleHideMnthReport() {
  $(".hideMnthReport").each(function () {
    if ($(this).css("display") === "none") {
      $(this).css("display", "table-cell");
    } else {
      $(this).css("display", "none");
    }
  });
  // toggleAllArrowIcons();
}

function downloadExcel() {
  let today = new Date();
  let date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let time =
    today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
  let CurrentDateTime = date + "_" + time;
  $("#res_by_account_green_signed")
    .remove(".noExl")
    .table2excel({
      exclude: ".noExl",
      name: "Reports Overall Summary",
      filename: "reports_overall_summary_" + CurrentDateTime,
      fileext: ".xls",
    });
}
// Function to toggle the arrow icons globally
function toggleAllArrowIcons() {
  $(".arrow").each(function () {
    var imgSrc = $(this).attr("src");
    if (imgSrc === "images/right_arrow.png") {
      $(this).attr("src", "images/left_arrow.png");
    } else {
      $(this).attr("src", "images/right_arrow.png");
    }
  });
  toggleHideMnthReport();
}
function updateButtonLabel() {
  const selectedCount = $(
    '#checkbox-container input[type="checkbox"]:checked',
  ).length;
  const buttonLabel =
    selectedCount > 0 ? `${selectedCount} selected` : "Select Account Leader";

  // Update the button text
  $("#bu_header_select").html(
    `${buttonLabel} <i class="fa fa-chevron-down" aria-hidden="true" style="margin-left: 5px;"></i>`,
  );
}
const getBuyingCenterJson = async (selectedYear) => {
  let empId = localStorage.getItem("EmpUserID");
  let emp_dep = localStorage.getItem("Department");
  selectedBusinessHead = selectedBusinessHead.filter((item) => item !== "-1");

  let form_details = {
    environment: apiValue.environment,
    emp_id: empId,
    department: emp_dep,
    BUSINESS_HEAD_FILTER: selectedBusinessHead,
  };

  // Show loader but keep background white (don't hide .show_page)
  $(".show_page").css("display", "none");
  $(".loader").css("display", "block");
  const startTime = performance.now();

  try {
    let data = await fetch(apiValue.url_ip + ":5003/buying_center_report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form_details),
    });

    const result = await data.json();
    const endTime = performance.now();
    const loadTimeInSeconds = (endTime - startTime) / 1000;

    getApiTime(
      loadTimeInSeconds,
      "reportOverallSummary",
      "Reports",
      "buying_center_report",
      "success",
      fileName,
      "reportOverallSummary",
      "view",
    );

    buyingCenterApiData = result; // Store the API data
    $(".loader").css("display", "none");
    $(".show_page").css("display", "block");

    return result;
  } catch (error) {
    const endTime = performance.now();
    const loadTimeInSeconds = (endTime - startTime) / 1000;

    getApiTime(
      loadTimeInSeconds,
      "reportOverallSummary",
      "Reports",
      "buying_center_report",
      "error",
      fileName,
      "reportOverallSummary",
      "view",
    );

    console.error("Error fetching buying center data:", error);
    $(".loader").css("display", "none");
    $(".show_page").css("display", "block");
    toastr.error("Failed to load buying center data. Please try again.");
    return null;
  }
};

const popupDataajax = async (sowStatus, months, accid) => {
  const match = sowStatus.match(/%[-\s]*(.+)/);

  let sowStatus_new = match ? match[1] : sowStatus;
  if (sowStatus_new == "Singed (SOW Amount)") {
    sowStatus_new = "Signed";
  }

  selectedBusinessHead = selectedBusinessHead.filter((item) => item !== "-1");
  let empId = localStorage.getItem("EmpUserID");
  let emp_dep = localStorage.getItem("Department");
  let form_details = {
    EMP_ID: empId,
    SOW_STATUS: sowStatus_new,
    MONTH: months,
    ACCOUNT_ID: accid,
    BUSINESS_HEAD_FILTER: selectedBusinessHead,
    DEPARTMENT: emp_dep,
  };

  let data = await fetch(apiValue.url_ip + ":5003/get_sow_amount_details", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form_details),
  });
  const result = await data.json();
  return result;
};
const popupQFAPI = async (sowStatus, month, accid, selectedYearval) => {
  let empId = localStorage.getItem("EmpUserID");
  let emp_dep = localStorage.getItem("Department");
  selectedBusinessHead = selectedBusinessHead.filter((item) => item !== "-1");
  let QFPayload = {
    emp_id: empId,
    department: emp_dep,
    BUSINESS_HEAD_FILTER: selectedBusinessHead,
    filters: {
      column: month.replace("_", "-"),
      row: sowStatus == "Signed" ? "100% Signed" : sowStatus,
      col_name: accid,
      year: "20" + selectedYearval,
    },
  };
  console.log("QFPayload - ", QFPayload);
  let data = await fetch(apiValue.url_ip + ":5003/overallsummary_history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(QFPayload),
  });
  const result = await data.json();
  console.log("result - ", result);
  return result;
};
function handleSOWClick(sowid, uniqueid) {
  let uniqId_sowid = uniqueid + "&" + sowid;
  window.open("sow.html?" + uniqId_sowid, "_blank");
}
function toggleQuarter(quarterId) {
  // Get the <th> and <td> elements based on quarterId
  let quarterTh = $(`th[id="${quarterId}"]`);
  let quarterTd = $(`td[id^="${quarterId}"]`);
  let icon = $(`.${quarterId}`);
  console.log("icon", icon); // Debugging log

  if (quarterTd.length > 0) {
    // Check if the current display style for the td is set to 'none'
    if (quarterTh.css("display") === "none") {
      // Show the <th> element and <td> elements
      quarterTh.css("display", "table-cell");
      quarterTd.removeClass("quarter_class_ex").css("display", "table-cell");
      icon.removeClass("fa-expand").addClass("fa-compress");
    } else {
      // Hide the <th> element and apply the 'quarter-class-ex' to hide the <td> elements
      quarterTh.css("display", "none");
      quarterTd.addClass("quarter_class_ex").css("display", "none");
      icon.removeClass("fa-compress").addClass("fa-expand");
    }
  } else {
    console.log("No matching td elements found");
  }
}

// Function to handle tab clicks
function handleTabClick(tabClassName, options = {}) {
  if (!options.skipStateUpdate) {
    overallSummaryFilterState.activeTab = tabClassName;
  }
  syncOverallSummaryFilterStateFromUI();
  $(".accountLevelTab").removeClass("selected-tab");
  $(".sowLevelTab").removeClass("selected-tab");
  $(".buyingCenterTab").removeClass("selected-tab");
  $("." + tabClassName).addClass("selected-tab");

  if (tabClassName === "accountLevelTab") {
    $(".buying_center_legend").hide();
    $(".amount_by_sow_tab_data").hide();
    $(".buying-center-table").hide();
    $(".singedGroup").hide();
    $(".account_bg").attr("rowspan", "4");
    $(".overall_summary_tab_data").show();
    $(".amount_by_sow_filter").hide();
    console.log("Account Level Breakup tab clicked.");
    $("#overall_summary_data").prop("checked", true);
  } else if (tabClassName === "sowLevelTab") {
    $(".buying_center_legend").hide();
    let selectedYears = $("#year_select_data").val();
    console.log("selectedYears - ", selectedYears);
    console.log("overallData - ", overallData);
    let yearData = [];
    overallData.forEach((ra) => {
      if (ra.YEAR.toString() === selectedYears) {
        yearData = yearData.concat(ra.YEAR_DATA); // Append the data for the matching year
      }
    });
    let shortNewYr = selectedYears.substr(-2); // Extract last two digits for all selected years
    sowGetByAccount(shortNewYr, selectedBusinessHead);
    $(".amount_by_sow_tab_data").show();
    $(".buying-center-table").hide();
    $(".singedGroup").hide();
    $(".overall_summary_tab_data").hide();
    $(".amount_by_sow_filter").show();
    console.log("SOW Level Breakup tab clicked.");
    $("#account_by_sow_data").prop("checked", true); // select the radio button
  } else if (tabClassName === "buyingCenterTab") {
    $(".buying_center_legend").show();
    let selectedYears = $("#year_select_data").val();
    let shortNewYr = selectedYears.substr(-2);

    // Check if we have cached data
    if (buyingCenterApiData && buyingCenterApiData.length > 0) {
      console.log("Using cached buying center data");
      // Use cached data
      let yearData = null;
      if (Array.isArray(buyingCenterApiData)) {
        const yearObj = buyingCenterApiData.find(
          (y) => y.YEAR.toString() === selectedYears,
        );
        yearData = yearObj ? yearObj.YEAR_DATA : null;
      } else if (buyingCenterApiData.YEAR_DATA) {
        yearData = buyingCenterApiData.YEAR_DATA;
      } else {
        yearData = buyingCenterApiData;
      }

      if (yearData && yearData.BUYING_CENTER_DATA) {
        renderBuyingCenterLevel(yearData, shortNewYr);
      } else {
        console.warn("No buying center data found for year:", selectedYears);
        renderBuyingCenterLevel({}, shortNewYr);
      }
    } else {
      // Fetch and render buying center data from API
      console.log("Fetching buying center data from API");
      getBuyingCenterJson(selectedYears).then((apiResponse) => {
        if (apiResponse) {
          // Extract year-specific data from API response
          let yearData = null;
          if (Array.isArray(apiResponse)) {
            // If response is an array of years, find matching year
            const yearObj = apiResponse.find(
              (y) => y.YEAR.toString() === selectedYears,
            );
            yearData = yearObj ? yearObj.YEAR_DATA : null;
          } else if (apiResponse.YEAR_DATA) {
            // If response has direct YEAR_DATA
            yearData = apiResponse.YEAR_DATA;
          } else {
            // If response is already the data object
            yearData = apiResponse;
          }

          if (yearData && yearData.BUYING_CENTER_DATA) {
            renderBuyingCenterLevel(yearData, shortNewYr);
          } else {
            console.warn(
              "No buying center data found for year:",
              selectedYears,
            );
            renderBuyingCenterLevel({}, shortNewYr);
          }
        }
      });
    }

    $(".amount_by_sow_tab_data").hide();
    $(".overall_summary_tab_data").hide();
    $(".buying-center-table").show();
    $(".amount_by_sow_filter").hide();
    console.log("Buying Center Level tab clicked.");
    $("#buying_center_data").prop("checked", true);
  }
}

// function createChartData() {
//   console.log("Creating chart data...");
//   console.log("executiveSummaryJson - ", executiveSummaryJson);
//   // let executiveSummaryData = executiveSummaryJson.executiveSummaryData;
//   let executiveSummaryData = executiveSummaryJson;
//   let revenueChartData = executiveSummaryJson.revenueChartData;
//   let summaryInfoPopupData = executiveSummaryJson.summaryInfoPopupData; // Now accessed from global executiveSummaryJson
//   console.log("executiveSummaryData - ", executiveSummaryData);
//   console.log("revenueChartData - ", revenueChartData);
//   console.log("summaryInfoPopupData - ", summaryInfoPopupData);

//   // Populate Executive Summary Table
//   const execSummaryTableBody = document.getElementById("execSummaryTableBody");
//   if (execSummaryTableBody) {
//     execSummaryTableBody.innerHTML = ""; // Clear existing content

//     // Current Year Data
//     const currentYear = executiveSummaryData.current.year;
//     const currentYearData = executiveSummaryData.current.current_year_data;

//     let rowHtml = `<tr><td class="execute_year" colspan="3">${currentYear}</td></tr>`;
//     for (const key in currentYearData) {
//       if (currentYearData.hasOwnProperty(key)) {
//         const rowData = currentYearData[key];
//         console.log("rowData - ", rowData);
//         rowHtml += `
//           <tr>
//             <td class="execute_side_header">${key.replace(/_/g, " ")}</td>
//             <td>${
//               key === "Actual_vs_Op1"
//                 ? Math.round(rowData.YRD) + " %"
//                 : (Math.abs(rowData.YRD) / 1000000).toFixed(2) + " M"
//             }</td>
//             <td>${
//               key === "Actual_vs_Op1"
//                 ? Math.round(rowData.FY_Proj) + " %"
//                 : (Math.abs(rowData.FY_Proj) / 1000000).toFixed(2) + " M"
//             }</td>
//           </tr>
//         `;
//       }
//     }
//     execSummaryTableBody.innerHTML += rowHtml;

//     // Last Year Data
//     const lastYear = executiveSummaryData.last.year;
//     const lastYearData = executiveSummaryData.last.current_year_data;

//     rowHtml = `<tr><td class="execute_year" colspan="3">${lastYear}</td></tr>`;
//     for (const key in lastYearData) {
//       if (lastYearData.hasOwnProperty(key)) {
//         const rowData = lastYearData[key];
//         rowHtml += `
//           <tr>
//             <td class="execute_side_header">${key.replace(/_/g, " ")}</td>
//             <td>${
//               key === "Actual_vs_Op1"
//                 ? Math.round(rowData.YRD) + " %"
//                 : (Math.abs(rowData.YRD) / 1000000).toFixed(2) + " M"
//             }</td>
//             <td>${
//               key === "Actual_vs_Op1"
//                 ? Math.round(rowData.FY_Proj) + " %"
//                 : (Math.abs(rowData.FY_Proj) / 1000000).toFixed(2) + " M"
//             }</td>
//           </tr>
//         `;
//       }
//     }
//     execSummaryTableBody.innerHTML += rowHtml;
//   }

//   // The configuration for your chart
//   const config = {
//     type: "line",
//     data: revenueChartData,
//     options: {
//       // ADD THIS PLUGINS SECTION
//       plugins: {
//         datalabels: {
//           align: "end",
//           anchor: "end",
//           display: 'auto', // Automatically hides overlapping labels
//           backgroundColor: "rgba(255, 255, 255, 0.7)", // Optional: for better readability
//           borderRadius: 4,
//           color: "#444",
//           font: {
//             size: 10,
//             weight: "bold",
//           },
//           padding: {
//               top: 4,
//               bottom: 4
//           },
//           // This formatter function will display the values in millions
//           formatter: function(value, context) {
//               // Converts to millions, e.g., $1.39M [6]
//               console.log('value - ', value);
//               console.log('$' + (value / 1000000).toFixed(2) + 'M')
//               return '$' + (value / 1000000).toFixed(2) + 'M';
//           }
//         },
//       },
//       // Your existing options go here
//       scales: {
//         y: {
//           beginAtZero: true,
//           title: {
//             display: true,
//             text: "Revenue in Millions ($)",
//           },
//           // Your existing y-axis configuration
//         },
//       },
//     },
//   };

//   // Define an array of custom colors for the first, second, and third datasets
//   const customColors = [
//     "#2985C1", // Color for the 1st dataset (e.g., Projected Revenue 2025) - Light Blue
//     "#F46F22", // Color for the 2nd dataset (e.g., Actual Revenue 2025) - Pink
//     "#818199", // Color for the 3rd dataset (e.g., Actual Revenue 2024) - Orange
//     // Add more colors here if you expect more datasets in the future
//   ];

//   // Chart.js Elements
//   const ctx = document.getElementById("revenueChart")?.getContext("2d"); // Added optional chaining for safety
//   chartTooltipEl = document.getElementById("chartTooltip");
//   chartTooltipTitleEl = document.getElementById("chartTooltipTitle");
//   chartTooltipTableBodyEl = document.getElementById("chartTooltipTableBody");
//   chartTooltipSummaryEl = document.getElementById("chartTooltipSummary");

//   // Info Popup Elements (assign globally here)
//   infoPopupEl = document.getElementById("infoPopup");
//   infoPopupTitleEl = document.getElementById("infoPopupTitle");
//   infoPopupTableBodyEl = document.getElementById("infoPopupTableBody");

//   // Modify datasets to apply custom colors based on index
//   const datasetsWithColors = revenueChartData.datasets.map((dataset, index) => {
//     const color = customColors[index]; // Get color based on index
//     return {
//       ...dataset,
//       borderColor: color || dataset.borderColor, // Use custom color if defined, otherwise keep existing
//       pointBackgroundColor: color || dataset.pointBackgroundColor,
//       pointBorderColor: color || dataset.pointBorderColor,
//     };
//   });

//   // Destroy existing chart if it exists
//   if (revenueChart) {
//     revenueChart.destroy();
//   }

//   // Register the custom crosshair plugin

//   Chart.register({
//     id: "customCrosshair",

//     afterDraw: (chart, args, options) => {
//       if (chart.tooltip._active && chart.tooltip._active.length > 0) {
//         const ctx = chart.ctx;
//         const activePoint = chart.tooltip._active[0];
//         const x = activePoint.element.x;
//         const topY = chart.chartArea.top;
//         const bottomY = chart.chartArea.bottom;
//         // Draw the vertical line
//         ctx.save();
//         ctx.beginPath();
//         ctx.moveTo(x, topY);
//         ctx.lineTo(x, bottomY);
//         ctx.lineWidth = options.lineWidth || 1;
//         ctx.strokeStyle = options.lineColor || "#000";
//         ctx.stroke();
//         ctx.restore();
//       }
//     },
//   });

//   // Revenue Chart Instance
//   // Check if ctx exists before creating the chart
//   if (
//     ctx &&
//     chartTooltipEl &&
//     chartTooltipTitleEl &&
//     chartTooltipTableBodyEl &&
//     chartTooltipSummaryEl
//   ) {
//     revenueChart = new Chart(ctx, {
//       type: "line",
//       data: {
//         labels: revenueChartData.labels,
//         datasets: datasetsWithColors, // Use the modified datasets here
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//           y: {
//             beginAtZero: true,
//             title: { display: true, text: "Revenue in Millions ($)" },
//             ticks: {
//               callback: (value) => (value / 1000000).toFixed(2),
//             },
//             stepSize: 0.2, // Changed stepSize to 0.2 as per your chart's Y-axis
//             grid: {
//               display: true,
//               drawBorder: true,
//             },
//           },
//           x: {
//             title: { display: true, text: "Months" },
//             grid: {
//               display: true,
//               drawBorder: false,
//             },
//           },
//         },
//         plugins: {
//           events: ["mousemove"],
//           // Enable the custom crosshair plugin
//           customCrosshair: {
//             lineColor: "#a1a1aa", // Subtle gray crosshair
//             lineWidth: 1,
//           },
//           // *** THIS IS THE CORRECTLY PLACED DATALABELS CONFIGURATION ***
//           datalabels: {
//               display: 'auto', // Automatically hides overlapping labels
//               align: 'end',
//               anchor: 'end',
//               backgroundColor: 'rgba(255, 255, 255, 0.8)',
//               borderRadius: 4,
//               color: '#333',
//               font: {
//                   weight: 'bold',
//                   size: 10,
//               },
//               formatter: function(value) {
//                   // Formats numbers to millions (e.g., $1.39M)
//                   return '$' + (value / 1000000).toFixed(2);
//               }
//           },
//           legend: {
//             position: "top",
//             labels: {
//               padding: 20,
//               usePointStyle: true,
//               pointStyle: "rectRounded",
//             },
//           },
//           tooltip: {
//             enabled: false,
//             external: function (context) {
//               const { chart, tooltip } = context;
//               // if (tooltip.opacity === 0) {
//               //   return;
//               // }
//               // const activePoint = tooltip.getActiveElements()[0];
//               // if (!activePoint) {
//               //   return;
//               // }
//               // Hide tooltip if no active points or opacity is zero
//               if (
//                 tooltip.opacity === 0 ||
//                 !tooltip.getActiveElements().length
//               ) {
//                 chartTooltipEl.classList.remove("show");
//                 return;
//               }

//               const activePoint = tooltip.getActiveElements()[0];
//               if (!activePoint) {
//                 chartTooltipEl.classList.remove("show");
//                 return;
//               }
//               const monthLabel = chart.data.labels[activePoint.index];
//               const monthDetailData =
//                 revenueChartData.detailedData[formatMonthLabel(monthLabel)];

//               if (monthDetailData) {
//                 let formattedTitle = monthDetailData.title;
//                 const titleMatch = formattedTitle.match(/= (-?\d+\.?\d*)\s*$/);
//                 if (titleMatch && titleMatch[1]) {
//                   const rawValue = parseFloat(titleMatch[1]);
//                   const valueInMillions = (rawValue / 1000000).toFixed(3);
//                   console.log("valueInMillions - ", valueInMillions);
//                   formattedTitle = `${formattedTitle.split("=")[0]}= ${
//                     rawValue < 0 ? "-" : ""
//                   }$${Math.abs(valueInMillions)}M`;
//                 }
//                 chartTooltipTitleEl.textContent = formattedTitle;
//                 chartTooltipTitleEl.className = "popup-title";
//                 if (monthDetailData.title.includes("-"))
//                   chartTooltipTitleEl.classList.add("negative-value");

//                 chartTooltipTableBodyEl.innerHTML = "";
//                 monthDetailData.accounts.forEach((acc) => {
//                   const row = chartTooltipTableBodyEl.insertRow();
//                   row.insertCell().textContent = acc.account;
//                   // const sowCell = row.insertCell();
//                   // sowCell.textContent = acc.sow;
//                   // sowCell.classList.add("wordBreak");
//                   const amountCell = row.insertCell();
//                   amountCell.textContent = `${acc.amount < 0 ? "-" : ""}${(
//                     Math.abs(acc.amount) / 1000000
//                   ).toFixed(3)} M`;
//                   amountCell.className = "popup-table-amount-cell";
//                   if (acc.amount < 0)
//                     amountCell.classList.add("negative-value");
//                 });

//                 chartTooltipSummaryEl.textContent = monthDetailData.summary;
//                 chartTooltipSummaryEl.className = "popup-summary";
//                 const summaryMatch =
//                   monthDetailData.summary.match(/= (-?\d+\.?\d*)\s*$/);
//                 if (summaryMatch && summaryMatch[1]) {
//                   const rawSummaryValue = parseFloat(summaryMatch[1]);
//                   const summaryValueInMillions = (
//                     rawSummaryValue / 1000000
//                   ).toFixed(3);
//                   chartTooltipSummaryEl.textContent = `${
//                     monthDetailData.summary.split("=")[0]
//                   }= ${rawSummaryValue < 0 ? "-" : ""}${Math.abs(
//                     summaryValueInMillions
//                   )}M`;
//                 }

//                 if (monthDetailData.summary.includes("-"))
//                   chartTooltipSummaryEl.classList.add("negative-value");

//                 const chartRect = chart.canvas.getBoundingClientRect();
//                 const tooltipRect = chartTooltipEl.getBoundingClientRect();
//                 let left =
//                   chartRect.left +
//                   window.pageXOffset +
//                   activePoint.element.x -
//                   tooltipRect.width / 2;
//                 let top =
//                   chartRect.top +
//                   window.pageYOffset +
//                   activePoint.element.y -
//                   tooltipRect.height -
//                   15;
//                 if (left < 0) left = 10;
//                 if (left + tooltipRect.width > window.innerWidth)
//                   left = window.innerWidth - tooltipRect.width - 10;
//                 if (top < 0)
//                   top =
//                     chartRect.top +
//                     window.pageYOffset +
//                     activePoint.element.y +
//                     15;
//                 chartTooltipEl.style.left = `${left}px`;
//                 chartTooltipEl.style.top = `${top}px`;
//                 chartTooltipEl.classList.add("show");
//               }
//             },
//           },
//         },
//         interaction: { mode: "index", intersect: false },
//       },
//     });

//     ctx.canvas.addEventListener("mouseleave", (event) => {
//       // Your mouseleave logic (as is)
//     });
//   }

//   // Hide popup on outside click
//   document.addEventListener("mousedown", (event) => {
//     if (
//       infoPopupEl.classList.contains("show") &&
//       !infoPopupEl.contains(event.target) &&
//       (!lastTriggerIcon || !lastTriggerIcon.contains(event.target))
//     ) {
//       infoPopupEl.classList.remove("show");
//       infoPopupLocked = false;
//       lastTriggerIcon = null;
//     }
//   });

//   // Moved info icon event listeners inside createChartData
//   const infoIcons = [
//     { id: "infoIconOPI", dataKey: "infoIconOPI" },
//     {
//       id: "infoIconActualProjected",
//       dataKey: "infoIconActualProjected",
//     },
//   ];
//   infoIcons.forEach((item) => {
//     const element = document.getElementById(item.id);
//     if (element) {
//       element.addEventListener("mouseenter", (e) =>
//         showInfoPopup(e, item.dataKey)
//       );
//       element.addEventListener("mouseleave", hideInfoPopup);
//     }
//   });

//   // Ensure infoPopupEl is assigned before trying to add a listener to it
//   if (infoPopupEl) {
//     infoPopupEl.addEventListener("mouseleave", hideInfoPopup);
//   }
// }

// --- Executive Summary Info Popup Logic ---
function formatCurrency(num) {
  // Guard Clause: If the input is not a valid number or is '-', return '-'
  if (num === "-" || typeof num !== "number" || !isFinite(num)) {
    return "-";
  }

  const value = Math.abs(num) / 1000000;
  const formattedValue = `$${value.toFixed(2)} M`;
  return num < 0 ? `(${formattedValue})` : formattedValue;
}

function formatPercentage(num) {
  if (num === "-" || typeof num !== "number" || !isFinite(num)) {
    return "-";
  }
  const value = Math.round(Math.abs(num));
  const formattedValue = `${value} %`;
  return num < 0 ? `(${formattedValue})` : formattedValue;
}

function formatNpsValue(num) {
  if (num === "-" || typeof num !== "number" || !isFinite(num)) {
    return "-";
  }
  const value = Math.abs(num).toFixed(2);
  return num < 0 ? `(${value})` : value;
}

function formatNpsPercentage(num) {
  if (num === "-" || typeof num !== "number" || !isFinite(num)) {
    return "-";
  }
  const value = Math.round(Math.abs(num));
  const formattedValue = `${value} %`;
  return num < 0 ? `(${formattedValue})` : formattedValue;
}

function createChartData() {
  console.log("Creating chart data...");
  console.log("executiveSummaryJson - ", executiveSummaryJson);
  // let executiveSummaryData = executiveSummaryJson.executiveSummaryData;
  let executiveSummaryData = executiveSummaryJson;
  if (executiveSummaryData.length == 0) {
    $(".executive-summary-container").hide();
    return;
  }
  let revenueChartData = executiveSummaryJson.revenueChartData;
  let summaryInfoPopupData = executiveSummaryJson.summaryInfoPopupData; // Now accessed from global executiveSummaryJson
  console.log("executiveSummaryData - ", executiveSummaryData);
  console.log("revenueChartData - ", revenueChartData);
  console.log("summaryInfoPopupData - ", summaryInfoPopupData);

  // Populate Executive Summary Table
  const execSummaryTableBody = document.getElementById("execSummaryTableBody");
  if (execSummaryTableBody) {
    execSummaryTableBody.innerHTML = ""; // Clear existing content

    let selectedYears = $("#year_select_data").val();
    console.log("selectedYears - ", selectedYears);
    // Extract last two digits for shortNewYr
    // let shortNewYr = selectedYears.map((year) => year.substr(-2)); // Extract last two digits for all selected years
    let shortNewYr = selectedYears.substr(-2);
    console.log("shortNewYr - ", shortNewYr);
    $("#ytd_header").text(`YTD - ${shortNewYr}`);
    $("#fy_header").text(`FY - PROJECTION - ${shortNewYr}`);

    // Current Year Data
    const currentYear = executiveSummaryData.current.year;
    const currentYearData = executiveSummaryData.current.current_year_data;
    const npsCurrentYear = executiveSummaryData.current_nps.year;
    const npsCurrentYearData =
      executiveSummaryData.current_nps.current_year_data;
    console.log("npsCurrentYearData - ", npsCurrentYearData);

    let rowHtml = ``;
    if (currentYear == selectedYears) {
      for (const key in currentYearData) {
        if (currentYearData.hasOwnProperty(key)) {
          const rowData = currentYearData[key];
          const keyText = key.replace(/_/g, " ");

          // Determine the correct formatting based on the key
          const isPercentage = key === "Actual_vs_OP1";
          const yrdValue = isPercentage
            ? formatPercentage(rowData.YRD)
            : formatCurrency(rowData.YRD);
          const fyProjValue = isPercentage
            ? formatPercentage(rowData.FY_Proj)
            : formatCurrency(rowData.FY_Proj);
          let classnameop1 = "actual_op1";
          rowHtml += `
              <tr>
                <td class="execute_side_header"><div class='${keyText == "Actual vs OP1" ? "actual_op1" : ""}'>${keyText}</div></td>
                <td class='exceute_sum_body'><div >${yrdValue} ${key == "REVENUE" ? `<i class="fa fa-info-circle" style='float: right;' title="YTD updates after month-end"></i>` : ``}</div></td>
                <td class='exceute_sum_body'><div>${fyProjValue}</div></td>
              </tr>
            `;
        }
      }

      // --- Add NPS Header ---
      // rowHtml += `<tr><td class="execute_year" colspan="3">NPS</td></tr>`;

      // --- Process NPS Data ---
      for (const key in npsCurrentYearData) {
        if (npsCurrentYearData.hasOwnProperty(key)) {
          const rowData = npsCurrentYearData[key];
          const keyText = key.replace(/_/g, " ");

          // Determine the correct formatting based on the key
          const isPercentage = key === "Nps_vs_Op1";
          const yrdValue = isPercentage
            ? formatNpsPercentage(rowData.YRD)
            : formatNpsValue(rowData.YRD);
          const fyProjValue = isPercentage
            ? formatNpsPercentage(rowData.FY_Proj)
            : formatNpsValue(rowData.FY_Proj);

          rowHtml += `
              <tr>
                <td class="execute_side_header"><div class='${keyText == "Actual vs OP1" ? "actual_op1" : ""}'>${keyText}</td>
                <td class='exceute_sum_body'><div>${yrdValue}</div></td>
                <td class='exceute_sum_body'><div>${fyProjValue}</div></td>
              </tr>
            `;
        }
      }
      execSummaryTableBody.innerHTML += rowHtml;
    }

    // Last Year Data
    const lastYear = executiveSummaryData.last.year;
    const lastYearData = executiveSummaryData.last.current_year_data;
    const npslastYearData = executiveSummaryData.last_nps.current_year_data;

    if (lastYear == selectedYears) {
      for (const key in lastYearData) {
        if (lastYearData.hasOwnProperty(key)) {
          const rowData = lastYearData[key];
          const keyText = key.replace(/_/g, " ");

          // Determine the correct formatting based on the key
          const isPercentage = key === "Actual_vs_OP1";
          const yrdValue = isPercentage
            ? formatPercentage(rowData.YRD)
            : formatCurrency(rowData.YRD);
          const fyProjValue = isPercentage
            ? formatPercentage(rowData.FY_Proj)
            : formatCurrency(rowData.FY_Proj);

          rowHtml += `
            <tr>
              <td class="execute_side_header"><div class='${keyText == "Actual vs OP1" ? "actual_op1" : ""}'>${keyText}</td>
              <td class='exceute_sum_body'><div>${yrdValue}</div></td>
              <td class='exceute_sum_body'><div>${fyProjValue}<div></td>
            </tr>
          `;
        }
      }
      // execSummaryTableBody.innerHTML += rowHtml;
      // rowHtml += `<tr><td class="execute_year" colspan="3">NPS</td></tr>`;
      for (const key in npslastYearData) {
        if (npslastYearData.hasOwnProperty(key)) {
          const rowData = npslastYearData[key];
          const keyText = key.replace(/_/g, " ");

          // Determine the correct formatting based on the key
          const isPercentage = key === "Nps_vs_Op1";
          const yrdValue = isPercentage
            ? formatNpsPercentage(rowData.YRD)
            : formatNpsValue(rowData.YRD);
          const fyProjValue = isPercentage
            ? formatNpsPercentage(rowData.FY_Proj)
            : formatNpsValue(rowData.FY_Proj);

          rowHtml += `
            <tr>
              <td class="execute_side_header"><div class='${keyText == "Actual vs OP1" ? "actual_op1" : ""}'>${keyText}</div></td>
              <td class='exceute_sum_body'><div>${yrdValue}</div></td>
              <td class='exceute_sum_body'><div>${fyProjValue}</div></td>
            </tr>
          `;
        }
      }
      execSummaryTableBody.innerHTML += rowHtml;
    }

    // Last Year Data
    const futureYear = executiveSummaryData.future.year;
    const futureYearData = executiveSummaryData.future.current_year_data;
    const npsfutureYearData = executiveSummaryData.future_nps.current_year_data;

    if (futureYear == selectedYears) {
      for (const key in futureYearData) {
        if (futureYearData.hasOwnProperty(key)) {
          const rowData = futureYearData[key];
          const keyText = key.replace(/_/g, " ");

          // Determine the correct formatting based on the key
          const isPercentage = key === "Actual_vs_OP1";
          const yrdValue = isPercentage
            ? formatPercentage(rowData.YRD)
            : formatCurrency(rowData.YRD);
          const fyProjValue = isPercentage
            ? formatPercentage(rowData.FY_Proj)
            : formatCurrency(rowData.FY_Proj);

          rowHtml += `
              <tr>
                <td class="execute_side_header"><div class='${keyText == "Actual vs OP1" ? "actual_op1" : ""}'>${keyText}</div></td>
                <td class='exceute_sum_body'><div>${yrdValue}</div></td>
                <td class='exceute_sum_body'><div>${fyProjValue}</div></td>
              </tr>
            `;
        }
      }

      // --- Add NPS Header ---
      // rowHtml += `<tr><td class="execute_year" colspan="3">NPS</td></tr>`;

      // --- Process NPS Data ---
      for (const key in npsfutureYearData) {
        if (npsfutureYearData.hasOwnProperty(key)) {
          const rowData = npsfutureYearData[key];
          const keyText = key.replace(/_/g, " ");

          // Determine the correct formatting based on the key
          const isPercentage = key === "Nps_vs_Op1";
          const yrdValue = isPercentage
            ? formatNpsPercentage(rowData.YRD)
            : formatNpsValue(rowData.YRD);
          const fyProjValue = isPercentage
            ? formatNpsPercentage(rowData.FY_Proj)
            : formatNpsValue(rowData.FY_Proj);

          rowHtml += `
              <tr>
                <td class="execute_side_header"><div class='${keyText == "Actual vs OP1" ? "actual_op1" : ""}'>${keyText}</div></td>
                <td class='exceute_sum_body'><div>${yrdValue}</div></td>
                <td class='exceute_sum_body'><div>${fyProjValue}</div></td>
              </tr>
            `;
        }
      }
      execSummaryTableBody.innerHTML += rowHtml;
    }
  }

  // Define an array of custom colors for the first, second, and third datasets
  const customColors = [
    "#2985C1", // Color for the 1st dataset (e.g., Projected Revenue 2025) - Light Blue
    "#F46F22", // Color for the 2nd dataset (e.g., Actual Revenue 2025) - Pink
    "#007A45FF", // Color for the 3rd dataset (e.g., Actual Revenue 2024) - Orange
    // Add more colors here if you expect more datasets in the future
  ];

  // Chart.js Elements
  const ctx = document.getElementById("revenueChart")?.getContext("2d"); // Added optional chaining for safety
  chartTooltipEl = document.getElementById("chartTooltip");
  chartTooltipTitleEl = document.getElementById("chartTooltipTitle");
  chartTooltipTableBodyEl = document.getElementById("chartTooltipTableBody");
  chartTooltipSummaryEl = document.getElementById("chartTooltipSummary");

  // Info Popup Elements (assign globally here)
  infoPopupEl = document.getElementById("infoPopup");
  infoPopupTitleEl = document.getElementById("infoPopupTitle");
  infoPopupTableBodyEl = document.getElementById("infoPopupTableBody");

  // Modify datasets to apply custom colors based on index
  const datasetsWithColors = revenueChartData.datasets.map((dataset, index) => {
    const color = customColors[index]; // Get color based on index
    return {
      ...dataset,
      borderColor: color || dataset.borderColor, // Use custom color if defined, otherwise keep existing
      pointBackgroundColor: color || dataset.pointBackgroundColor,
      pointBorderColor: color || dataset.pointBorderColor,
    };
  });

  Chart.register({
    id: "customCrosshair",

    afterDraw: (chart, args, options) => {
      if (
        chart.tooltip &&
        chart.tooltip._active &&
        chart.tooltip._active.length > 0
      ) {
        const ctx = chart.ctx;
        const activePoint = chart.tooltip._active[0];
        const x = activePoint.element.x;
        const topY = chart.chartArea.top;
        const bottomY = chart.chartArea.bottom;
        // Draw the vertical line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = options.lineWidth || 1;
        ctx.strokeStyle = options.lineColor || "#000";
        ctx.stroke();
        ctx.restore();
      }
    },
  });

  // Destroy existing chart if it exists
  if (revenueChart) {
    revenueChart.destroy();
  }

  // Revenue Chart Instance
  // Check if ctx exists before creating the chart
  if (
    ctx &&
    chartTooltipEl &&
    chartTooltipTitleEl &&
    chartTooltipTableBodyEl &&
    chartTooltipSummaryEl
  ) {
    console.log("revenueChartData.labels - ", revenueChartData.datasets);
    let datasetLabels = revenueChartData.datasets.map(
      (dataset) => dataset.label,
    );
    console.log("datasetLabels - ", datasetLabels);
    $("#chartLegend0").html(datasetLabels[0]);
    $("#chartLegend1").html(datasetLabels[1]);
    $("#chartLegend2").html(datasetLabels[2]);
    revenueChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: revenueChartData.labels,
        datasets: datasetsWithColors, // Use the modified datasets here
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: "Revenue in Millions ($)" },
            ticks: {
              callback: (value) => (value / 1000000).toFixed(2),
              font: {
                weight: "bold",
              },
            },
            stepSize: 10,
            grid: {
              display: true,
              drawBorder: true,
            },
            grace: "10%",
          },
          x: {
            title: { display: true, text: "" },
            // font: {
            //   // size: 14, // Adjust the title font size here
            //   weight: 'bold' // You can also adjust weight, family, etc.
            // },
            grid: {
              display: true,
              drawBorder: false,
            },
            ticks: {
              font: {
                size: 10, // Adjust the label font size here
                weight: "bold",
              },
            },
          },
        },
        plugins: {
          events: ["mousemove"],
          // Enable the custom crosshair plugin
          customCrosshair: {
            lineColor: "#a1a1aa", // Subtle gray crosshair
            lineWidth: 1,
          },
          // *** THIS IS THE CORRECTLY PLACED DATALABELS CONFIGURATION ***
          datalabels: {
            display: "auto", // Automatically hides overlapping labels
            align: "end",
            anchor: "end",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 4,
            color: "#333",
            font: {
              weight: "bold",
              size: 10,
            },
            formatter: function (value) {
              // Formats numbers to millions (e.g., $1.39M)
              return "$" + (value / 1000000).toFixed(2);
            },
          },
          legend: {
            display: false, // This line hides the legend
            position: "top",
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: "rectRounded",
            },
          },
          tooltip: {
            enabled: false,
            external: function (context) {},
          },
        },
        interaction: { mode: "index", intersect: false },
      },
    });

    ctx.canvas.addEventListener("mouseleave", (event) => {
      // Your mouseleave logic (as is)
    });
  }

  // Hide popup on outside click
  document.addEventListener("mousedown", (event) => {
    if (
      infoPopupEl.classList.contains("show") &&
      !infoPopupEl.contains(event.target) &&
      (!lastTriggerIcon || !lastTriggerIcon.contains(event.target))
    ) {
      infoPopupEl.classList.remove("show");
      infoPopupLocked = false;
      lastTriggerIcon = null;
    }
  });

  // Moved info icon event listeners inside createChartData
  const infoIcons = [
    { id: "infoIconOPI", dataKey: "infoIconOPI" },
    {
      id: "infoIconActualProjected",
      dataKey: "infoIconActualProjected",
    },
  ];
  infoIcons.forEach((item) => {
    const element = document.getElementById(item.id);
    if (element) {
      element.addEventListener("mouseenter", (e) =>
        showInfoPopup(e, item.dataKey),
      );
      element.addEventListener("mouseleave", hideInfoPopup);
    }
  });

  // Ensure infoPopupEl is assigned before trying to add a listener to it
  if (infoPopupEl) {
    infoPopupEl.addEventListener("mouseleave", hideInfoPopup);
  }
  $(".executive-summary-container").show();
}

// function showInfoPopup(event, iconId) {
//   console.log("showInfoPopup called with iconId:", iconId);
//   infoPopupLocked = false;
//   lastTriggerIcon = event.currentTarget;
//   const iconElement = event.currentTarget;
//   // Ensure summaryInfoPopupData is accessed from executiveSummaryJson
//   const data = executiveSummaryJson.summaryInfoPopupData[iconId];
//   console.log("Data for popup:", data); // Debugging log
//   if (!data || !infoPopupEl || !infoPopupTitleEl || !infoPopupTableBodyEl)
//     return; // Added checks for popup elements

//   // Format the title to show millions
//   let formattedTitle = data.title;

//   const titleMatch = formattedTitle.match(/= (-?\d+\.?\d*)\s*\$/);
//   if (titleMatch && titleMatch[1]) {
//     const rawValue = parseFloat(titleMatch[1]);
//     const valueInMillions = (rawValue / 1000000).toFixed(2);
//     console.log(
//       "valueInMillions :",
//       valueInMillions // Debugging log
//     );
//     formattedTitle = `${formattedTitle.split("=")[0]}= ${
//       rawValue < 0 ? "-" : ""
//     }$${Math.abs(valueInMillions)}M`;
//   }
//   infoPopupTitleEl.textContent = formattedTitle;
//   infoPopupTitleEl.className = "popup-title"; // Base class
//   if (data.title.includes("-"))
//     infoPopupTitleEl.classList.add("negative-value");

//   infoPopupTableBodyEl.innerHTML = "";
//   // Ensure accounts array is correctly accessed (it's a nested array based on provided JSON)
//   const accountsToDisplay = Array.isArray(data.accounts[0])
//     ? data.accounts[0]
//     : data.accounts;

//   accountsToDisplay.forEach((acc) => {
//     const row = infoPopupTableBodyEl.insertRow();
//     row.insertCell().textContent = acc.account;
//     // Create SOW cell and add wordBreak class
//     const sowCell = row.insertCell();
//     sowCell.textContent = acc.sow;
//     sowCell.classList.add("wordBreak");
//     const amountCell = row.insertCell();
//     // Convert amount to millions for display
//     amountCell.textContent = `${acc.amount < 0 ? "-" : ""}${(
//       Math.abs(acc.amount) / 1000000
//     ).toFixed(2)} M`;
//     amountCell.className = "popup-table-amount-cell"; // Base class for right alignment
//     if (acc.amount < 0) amountCell.classList.add("negative-value");
//   });

//   const iconRect = iconElement.getBoundingClientRect();
//   const popupRect = infoPopupEl.getBoundingClientRect();
//   let popupX = iconRect.left - popupRect.width - 10;
//   let popupY = iconRect.top + iconRect.height / 2 - popupRect.height / 2;
//   if (popupX < 0) popupX = iconRect.right + 10;
//   if (popupX + popupRect.width > window.innerWidth)
//     popupX = window.innerWidth - popupRect.width - 10;
//   if (popupY < 0) popupY = 10;
//   if (popupY + popupRect.height > window.innerHeight)
//     popupY = window.innerHeight - popupRect.height - 10;
//   infoPopupEl.style.left = `${popupX + window.pageXOffset}px`;
//   infoPopupEl.style.top = `${popupY + window.pageYOffset}px`;
//   infoPopupEl.classList.add("show");
// }

function hideInfoPopup(event) {
  console.log("hideInfoPopup called");
  // Ensure infoPopupEl is defined before proceeding
  if (!infoPopupEl) {
    // Attempt to re-fetch if it's not defined (e.g., if this runs before initial setup)
    infoPopupEl = document.getElementById("infoPopup");
    if (!infoPopupEl) return; // If still not found, exit
  }

  setTimeout(() => {
    const popupRect = infoPopupEl.getBoundingClientRect();
    const isHoveringPopup =
      event.clientX >= popupRect.left &&
      event.clientX <= popupRect.right &&
      event.clientY >= popupRect.top &&
      event.clientY <= popupRect.bottom;
    // if (!isHoveringPopup) {
    //   infoPopupEl.classList.remove("show");
    // }
  }, 200);
}

// Lock popup open on click
function lockInfoPopup(event, iconId) {
  infoPopupLocked = true;
  lastTriggerIcon = event.currentTarget;
  showInfoPopup(event, iconId);
}

function formatMonthLabel(label) {
  if (!label || typeof label !== "string") return "";

  // Convert the first part (month) to Capitalized, second part (number) remains same
  const [month, year] = label.trim().split(" ");

  if (!month || !year) return "";

  const formattedMonth =
    month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

  return `${formattedMonth}_${year}`;
}

// Hide popup on outside click
// document.addEventListener("mousedown", (event) => {
//   if (
//     infoPopupEl.classList.contains("show") &&
//     !infoPopupEl.contains(event.target) &&
//     (!lastTriggerIcon || !lastTriggerIcon.contains(event.target))
//   ) {
//     infoPopupEl.classList.remove("show");
//     infoPopupLocked = false;
//     lastTriggerIcon = null;
//   }
// });

// --- Hide Popups/Tooltips on Outside Click ---
document.addEventListener("mousedown", function (event) {
  // Hide info popup if click is outside both infoPopup and any info icon
  const infoIconOPI = document.getElementById("infoIconOPI");
  const infoIconActualProjected = document.getElementById(
    "infoIconActualProjected",
  );
  if (
    infoPopupEl &&
    infoPopupEl.classList.contains("show") &&
    !infoPopupEl.contains(event.target) &&
    (!infoIconOPI || !infoIconOPI.contains(event.target)) &&
    (!infoIconActualProjected ||
      !infoIconActualProjected.contains(event.target))
  ) {
    infoPopupEl.classList.remove("show");
  }

  // Hide chart tooltip if click is outside both chartTooltip and chart canvas
  const chartCanvas = document.getElementById("revenueChart");
  if (
    chartTooltipEl &&
    chartTooltipEl.classList.contains("show") &&
    !chartTooltipEl.contains(event.target) &&
    (!chartCanvas || !chartCanvas.contains(event.target))
  ) {
    chartTooltipEl.classList.remove("show");
    if (revenueChart) {
      revenueChart.setActiveElements([]);
      revenueChart.tooltip.setActiveElements([], { x: 0, y: 0 });
      revenueChart.update();
    }
  }
});

// ============================================
// BUYING CENTER LEVEL FUNCTIONS
// ============================================

/**
 * Render Buying Center Level hierarchical table
 * @param {Object} data - Buying center data from buying_center_data.js
 * @param {String} selectedYear - Selected year (e.g., "25" for 2025)
 */
function renderBuyingCenterLevel(data, selectedYear) {
  console.log("Rendering Buying Center Level for year:", selectedYear);
  console.log("Buying Center Data:", data);

  // Clear existing content
  $("#report_buying_center_header").empty();
  $("#report_buying_center_body").empty();

  // Build header - initially show only Account column and month columns
  let headerHtml = `
    <th class='first_column' style='z-index: 106; color:#818199;'>Account</th>
  `;

  // Add month headers
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  months.forEach((month) => {
    headerHtml += `<th style='z-index: 105; text-align: center;'>${month}-${selectedYear}</th>`;
  });

  // Add quarter headers
  for (let q = 1; q <= 4; q++) {
    headerHtml += `<th style='z-index: 105; background-color: #FFF2CC !important; text-align: center;'>Q${q}-${selectedYear}</th>`;
  }

  $("#report_buying_center_header").append(headerHtml);

  // Render data rows
  const buyingCenterData = data.BUYING_CENTER_DATA || [];

  buyingCenterData.forEach((account, accIndex) => {
    renderAccountRow(account, selectedYear, accIndex);
  });
}

/**
 * Calculate account totals from all nested data
 */
function calculateAccountTotals(account, selectedYear) {
  const totals = {};
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Initialize totals
  months.forEach((month) => {
    totals[`${month}_${selectedYear}`] = 0;
  });
  for (let q = 1; q <= 4; q++) {
    totals[`Q${q}_${selectedYear}`] = 0;
  }

  // Sum up all SOW data
  account.BUYING_CENTERS.forEach((bc) => {
    bc.KEY_STAKEHOLDERS.forEach((ks) => {
      ks.STAKEHOLDERS.forEach((sh) => {
        sh.SOWS.forEach((sow) => {
          sow.SOW_DATA.forEach((data) => {
            if (totals[data.MONTH_NAMES] !== undefined) {
              totals[data.MONTH_NAMES] += data.VALUES;
            }
          });
        });
      });
    });
  });

  return totals;
}

/**
 * Render account row with totals
 */
function renderAccountRow(account, selectedYear, accIndex) {
  const buyingCenters = account.BUYING_CENTERS || [];
  const accountId = `acc_${account.ACCOUNT_ID}_${accIndex}`;

  // Calculate account totals
  const accountTotals = calculateAccountTotals(account, selectedYear);

  // Build account row with totals
  let accountRowHtml = `
    <tr class="account-row" id="row_${accountId}">
      <td class="first_column" style="cursor: pointer;">
        <i class="fa fa-chevron-right buying-center-toggle-icon" 
           onclick="toggleBuyingCenterHierarchy('${accountId}', 'account')" 
           id="icon_${accountId}"></i>
        ${account.ACCOUNT_NAME}
      </td>
  `;

  // Add monthly totals
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  months.forEach((month) => {
    const monthKey = `${month}_${selectedYear}`;
    const value = accountTotals[monthKey]
      ? (accountTotals[monthKey] / 1000).toFixed(0)
      : "--";
    accountRowHtml += `<td class="table-cell" style="text-align: center;">$${value}</td>`;
  });

  // Add quarterly totals
  for (let q = 1; q <= 4; q++) {
    const qKey = `Q${q}_${selectedYear}`;
    const value = accountTotals[qKey]
      ? (accountTotals[qKey] / 1000).toFixed(0)
      : "--";
    accountRowHtml += `<td class="table-cell" style="text-align: center; background-color: #FFF2CC;">$${value}</td>`;
  }

  accountRowHtml += `</tr>`;
  $("#report_buying_center_body").append(accountRowHtml);

  // Render buying centers (initially hidden)
  buyingCenters.forEach((bc, bcIndex) => {
    renderBuyingCenterRow(bc, accountId, selectedYear, bcIndex);
  });
}

/**
 * Render buying center row with totals
 */
function renderBuyingCenterRow(buyingCenter, accountId, selectedYear, bcIndex) {
  const keyStakeholders = buyingCenter.KEY_STAKEHOLDERS || [];
  const bcId = `bc_${accountId}_${bcIndex}`;

  // Calculate buying center totals
  const bcTotals = {};
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  months.forEach((month) => {
    bcTotals[`${month}_${selectedYear}`] = 0;
  });
  for (let q = 1; q <= 4; q++) {
    bcTotals[`Q${q}_${selectedYear}`] = 0;
  }

  keyStakeholders.forEach((ks) => {
    ks.STAKEHOLDERS.forEach((sh) => {
      sh.SOWS.forEach((sow) => {
        sow.SOW_DATA.forEach((data) => {
          if (bcTotals[data.MONTH_NAMES] !== undefined) {
            bcTotals[data.MONTH_NAMES] += data.VALUES;
          }
        });
      });
    });
  });

  // Build buying center row
  let bcRowHtml = `
    <tr class="buying-center-row buying-center-hidden" data-parent="${accountId}" id="row_${bcId}">
      <td class="first_column" style="cursor: pointer;">
        <i class="fa fa-chevron-right buying-center-toggle-icon" 
           onclick="toggleBuyingCenterHierarchy('${bcId}', 'buyingCenter')" 
           id="icon_${bcId}"></i>
        <span class="hierarchy-level-1">${buyingCenter.BUYING_CENTER_NAME}</span>
      </td>
  `;

  // Add monthly totals
  months.forEach((month) => {
    const monthKey = `${month}_${selectedYear}`;
    const value = bcTotals[monthKey]
      ? (bcTotals[monthKey] / 1000).toFixed(0)
      : "--";
    bcRowHtml += `<td class="table-cell" style="text-align: center;">$${value}</td>`;
  });

  // Add quarterly totals
  for (let q = 1; q <= 4; q++) {
    const qKey = `Q${q}_${selectedYear}`;
    const value = bcTotals[qKey] ? (bcTotals[qKey] / 1000).toFixed(0) : "--";
    bcRowHtml += `<td class="table-cell" style="text-align: center; background-color: #FFF2CC;">$${value}</td>`;
  }

  bcRowHtml += `</tr>`;
  $("#report_buying_center_body").append(bcRowHtml);

  // Render key stakeholders (initially hidden)
  keyStakeholders.forEach((ks, ksIndex) => {
    renderKeyStakeholderRow(ks, bcId, selectedYear, ksIndex);
  });
}

/**
 * Render key stakeholder row with totals
 */
function renderKeyStakeholderRow(keyStakeholder, bcId, selectedYear, ksIndex) {
  const stakeholders = keyStakeholder.STAKEHOLDERS || [];
  const ksId = `ks_${bcId}_${ksIndex}`;

  // Calculate key stakeholder totals
  const ksTotals = {};
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  months.forEach((month) => {
    ksTotals[`${month}_${selectedYear}`] = 0;
  });
  for (let q = 1; q <= 4; q++) {
    ksTotals[`Q${q}_${selectedYear}`] = 0;
  }

  stakeholders.forEach((sh) => {
    sh.SOWS.forEach((sow) => {
      sow.SOW_DATA.forEach((data) => {
        if (ksTotals[data.MONTH_NAMES] !== undefined) {
          ksTotals[data.MONTH_NAMES] += data.VALUES;
        }
      });
    });
  });

  // Build key stakeholder row
  let ksRowHtml = `
    <tr class="key-stakeholder-row buying-center-hidden" data-parent="${bcId}" id="row_${ksId}">
      <td class="first_column" style="cursor: pointer;">
        <i class="fa fa-chevron-right buying-center-toggle-icon" 
           onclick="toggleBuyingCenterHierarchy('${ksId}', 'keyStakeholder')" 
           id="icon_${ksId}"></i>
        <span class="hierarchy-level-2">${keyStakeholder.KEY_STAKEHOLDER_NAME}</span>
      </td>
  `;

  // Add monthly totals
  months.forEach((month) => {
    const monthKey = `${month}_${selectedYear}`;
    const value = ksTotals[monthKey]
      ? (ksTotals[monthKey] / 1000).toFixed(0)
      : "--";
    ksRowHtml += `<td class="table-cell" style="text-align: center;">$${value}</td>`;
  });

  // Add quarterly totals
  for (let q = 1; q <= 4; q++) {
    const qKey = `Q${q}_${selectedYear}`;
    const value = ksTotals[qKey] ? (ksTotals[qKey] / 1000).toFixed(0) : "--";
    ksRowHtml += `<td class="table-cell" style="text-align: center; background-color: #FFF2CC;">$${value}</td>`;
  }

  ksRowHtml += `</tr>`;
  $("#report_buying_center_body").append(ksRowHtml);

  // Render stakeholders (initially hidden)
  stakeholders.forEach((sh, shIndex) => {
    renderStakeholderRow(sh, ksId, selectedYear, shIndex);
  });
}

/**
 * Render stakeholder row with totals
 */
function renderStakeholderRow(stakeholder, ksId, selectedYear, shIndex) {
  const sows = stakeholder.SOWS || [];
  const shId = `sh_${ksId}_${shIndex}`;

  // Calculate stakeholder totals
  const shTotals = {};
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  months.forEach((month) => {
    shTotals[`${month}_${selectedYear}`] = 0;
  });
  for (let q = 1; q <= 4; q++) {
    shTotals[`Q${q}_${selectedYear}`] = 0;
  }

  sows.forEach((sow) => {
    sow.SOW_DATA.forEach((data) => {
      if (shTotals[data.MONTH_NAMES] !== undefined) {
        shTotals[data.MONTH_NAMES] += data.VALUES;
      }
    });
  });

  // Build stakeholder row
  let shRowHtml = `
    <tr class="stakeholder-row buying-center-hidden" data-parent="${ksId}" id="row_${shId}">
      <td class="first_column" style="cursor: pointer;">
        <i class="fa fa-chevron-right buying-center-toggle-icon" 
           onclick="toggleBuyingCenterHierarchy('${shId}', 'stakeholder')" 
           id="icon_${shId}"></i>
        <span class="hierarchy-level-3">${stakeholder.STAKEHOLDER_NAME}</span>
      </td>
  `;

  // Add monthly totals
  months.forEach((month) => {
    const monthKey = `${month}_${selectedYear}`;
    const value = shTotals[monthKey]
      ? (shTotals[monthKey] / 1000).toFixed(0)
      : "--";
    shRowHtml += `<td class="table-cell" style="text-align: center;">$${value}</td>`;
  });

  // Add quarterly totals
  for (let q = 1; q <= 4; q++) {
    const qKey = `Q${q}_${selectedYear}`;
    const value = shTotals[qKey] ? (shTotals[qKey] / 1000).toFixed(0) : "--";
    shRowHtml += `<td class="table-cell" style="text-align: center; background-color: #FFF2CC;">$${value}</td>`;
  }

  shRowHtml += `</tr>`;
  $("#report_buying_center_body").append(shRowHtml);

  // Render SOWs (initially hidden)
  sows.forEach((sow, sowIndex) => {
    renderSOWRow(sow, shId, selectedYear, sowIndex);
  });
}

/**
 * Render SOW row with monthly data
 */
function renderSOWRow(sow, shId, selectedYear, sowIndex) {
  const sowData = sow.SOW_DATA || [];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let sowHtml = `
    <tr class="sow-detail-row buying-center-hidden" data-parent="${shId}">
      <td class="first_column">
        <span class="hierarchy-level-4">${sow.SOW_NAME}</span>
      </td>
  `;

  // Add monthly data
  months.forEach((month) => {
    const monthKey = `${month}_${selectedYear}`;
    const monthData = sowData.find((d) => d.MONTH_NAMES === monthKey);
    const value = monthData ? (monthData.VALUES / 1000).toFixed(0) : "--";
    sowHtml += `<td class="table-cell" style="text-align: center;">$${value}</td>`;
  });

  // Add quarterly data
  for (let q = 1; q <= 4; q++) {
    const qKey = `Q${q}_${selectedYear}`;
    const qData = sowData.find((d) => d.MONTH_NAMES === qKey);
    const value = qData ? (qData.VALUES / 1000).toFixed(0) : "--";
    sowHtml += `<td class="table-cell" style="text-align: center; background-color: #FFF2CC;">$${value}</td>`;
  }

  sowHtml += `</tr>`;
  $("#report_buying_center_body").append(sowHtml);
}

/**
 * Toggle expand/collapse for buying center hierarchy
 * @param {String} elementId - ID of the element to toggle
 */
