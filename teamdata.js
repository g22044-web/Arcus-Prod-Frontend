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
      let accessLevel = checkEachPageAccess("Team");
      if (accessLevel.length > 0) {
        let environment = accessLevel[0];
        if (environment == apiValue.environment) {
          // getPageTime("team","teamsPage","teamsDetails","page success");
          $(".show_page").css("display", "block");
          let d = new Date();
          let strDate = convertDate(d);
          $("#team_date_filter").val(strDate);
          document
            .getElementById("team_date_filter")
            .setAttribute("min", new Date().toISOString().split("T")[0]);
          const currentYear = new Date().getFullYear();
          const shortYear = currentYear.toString().slice(-2);
          // Populate teams_year select dynamically based on UTC date
          // populateTeamsYearSelect();
          const select = $("#teams_year");
          select.empty(); // Clear existing options

          // Get current UTC date
          const now = new Date();
          const utcYear = now.getUTCFullYear();
          const utcMonth = now.getUTCMonth() + 1; // getUTCMonth returns 0-11, so +1

          // Determine years based on month
          let years = [];
          if (utcMonth <= 6) {
            // June or less: include past year
            years = [utcYear - 1, utcYear];
          } else {
            // July or more: include future year
            years = [utcYear, utcYear + 1];
          }

          select.append('<option value="all">All</option>'); // Add 'All' option
          years.forEach(year => {
            select.append(`<option value="${year}">${year}</option>`);
          });
          // const shortYear = utcYear.toString().slice(-2);
          $("#teams_year").val(currentYear.toString());
          teamHeaderData();
          getSowViewData(strDate);

          // Add year filter change event
          $("#teams_year").on("change", function () {
            const selectedYear = $(this).val();
            filterTableByYear(selectedYear);
          });
          initYearDropdownUI();
          // getEmpData(strDate);
          getEmpSkillOptions();
          // hideAllWeeksOnLoad();
          setTimeout(hideAllWeeksOnLoad, 100);
          function convertDate(date) {
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth() + 1).toString();
            var dd = date.getDate().toString();

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
          $(".input-group-addon").hide();
          $(".loader").css("display", "none");
          $(".show_page").css("display", "block");
          $("#fy_year").html("FY-" + shortYear);
          jQuery("#skillSelect").multiselect({
            columns: 1,
            placeholder: "Persona",
            search: true,
            onOptionClick: function (element, option) {
              updatePlaceholderText("ms-list-1", "Persona", "skillSelect");
            },
            onChange: function (element, checked) {
              updatePlaceholderText("ms-list-1", "Persona", "skillSelect");
            },
          });
          jQuery("#skillNewSelect").multiselect({
            columns: 1,
            placeholder: "Skills",
            search: true,
            onOptionClick: function (element, option) {
              updatePlaceholderText("ms-list-2", "Skills", "skillNewSelect");
            },
            onChange: function (element, checked) {
              updatePlaceholderText("ms-list-2", "Skills", "skillNewSelect");
            },
          });
          jQuery("#startDate").multiselect({
            columns: 1,
            placeholder: "Start Date",
            search: true,
          });
          jQuery("#endDate").multiselect({
            columns: 1,
            placeholder: "End Date",
            search: true,
          });
          jQuery("#nameSelect").multiselect({
            columns: 1,
            placeholder: "Name",
            search: true,
            onOptionClick: function (element, option) {
              updatePlaceholderText("ms-list-3", "Name", "nameSelect");
            },
            onChange: function (element, checked) {
              updatePlaceholderText("ms-list-3", "Name", "nameSelect");
            },
          });
          jQuery("#jobSelect").multiselect({
            columns: 1,
            placeholder: "Job",
            search: true,
            onOptionClick: function (element, option) {
              updatePlaceholderText("ms-list-4", "Job", "jobSelect");
            },
            onChange: function (element, checked) {
              updatePlaceholderText("ms-list-4", "Job", "jobSelect");
            },
          });
          // jQuery('#repMangSelect').multiselect({
          //     columns: 1,
          //     placeholder: 'Manager',
          //     search: true
          // });
          $("#repMangSelect").multiselect({
            columns: 1,
            placeholder: "Manager",
            search: true,
            onOptionClick: function (element, option) {
              updatePlaceholderText("ms-list-5", "Manager", "repMangSelect");
            },
            onChange: function (element, checked) {
              updatePlaceholderText("ms-list-5", "Manager", "repMangSelect");
            },
          });
          jQuery("#locatSelect").multiselect({
            columns: 1,
            placeholder: "Location",
            search: true,
            onOptionClick: function (element, option) {
              updatePlaceholderText("ms-list-6", "Location", "locatSelect");
            },
            onChange: function (element, checked) {
              updatePlaceholderText("ms-list-6", "Location", "locatSelect");
            },
          });
          jQuery("#funSelect").multiselect({
            columns: 1,
            placeholder: "Function",
            search: true,
            onOptionClick: function (element, option) {
              updatePlaceholderText("ms-list-7", "Function", "funSelect");
            },
            onChange: function (element, checked) {
              updatePlaceholderText("ms-list-7", "Function", "funSelect");
            },
          });
          jQuery("#custSelect").multiselect({
            columns: 1,
            placeholder: "Customer",
            search: true,
            onOptionClick: function (element, option) {
              updatePlaceholderText("ms-list-8", "Customer", "custSelect");
            },
            onChange: function (element, checked) {
              updatePlaceholderText("ms-list-8", "Customer", "custSelect");
            },
          });
          $("#SOWSelect").multiselect("reload");
          $("#SOWSelect").multiselect({
            columns: 1,
            placeholder: "SOW",
            search: true,
            onOptionClick: function (element, option) {
              updatePlaceholderText("ms-list-9", "SOW", "SOWSelect");
            },
            onChange: function (element, checked) {
              updatePlaceholderText("ms-list-9", "SOW", "SOWSelect");
            },
          });
          jQuery("#billSelect").multiselect({
            columns: 1,
            placeholder: "Billing",
            search: true,
            onOptionClick: function (element, option) {
              updatePlaceholderText("ms-list-10", "Billing", "billSelect");
            },
            onChange: function (element, checked) {
              updatePlaceholderText("ms-list-10", "Billing", "billSelect");
            },
          });
          jQuery("#status").multiselect({
            columns: 1,
            placeholder: "Status",
            search: true,
            onOptionClick: function (element, option) {
              updatePlaceholderText("ms-list-11", "Status", "status");
            },
            onChange: function (element, checked) {
              updatePlaceholderText("ms-list-11", "Status", "status");
            },
          });
          $(document).on("click", function (e) {
            if (!$(e.target).closest(".skill-box, [data-skills]").length) {
              hideDataSkillBox();
            }
          });
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
  $("#logout").click(function () {
    localStorage.clear();
    // console.log("sessionName - " + sessionName);
    window.location.href = "index.html";
    return false;
  });
  $("#use_bench_data").click(function () {
    window.location.href = "useBench.html";
    return false;
  });
  $("#create_employee").click(function () {
    window.location.href = "employee_create.html";
    return false;
  });

  $("#training_btn").click(function () {
    window.location.href = "training.html";
    return false;
  });
});
function employeeDetails() {
  window.location.href = "team-profile.html";
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
    return text.substring(0, maxLength) + "...";
  }
  return text;
}
var empAllData = [];
var empIndData = [];
var empUsData = [];
var skill_data_option = "";
var skill_new_data_option = "";
var FilteredNewJson = [];
let filterStatus = false;
let filterApplyJson = [];
let teamHeaderdataHtml = "";
let selectedMonths = [];
let selectedBenchThreshold = 0; // Global variable to store threshold
let globalCheckedValues = []; // Declare a global variable
let tempFilterJson = [];
let customFilterJson = [];
let persistentTeamFilters = createEmptyTeamFilterState();
const pathname = window.location.pathname;
// Extract the file name (last segment) from the pathname
const parts = pathname.split("/");
const fileName = parts.pop();
// Global variables for dynamic column targets
let ytd_year = '4';
let currentSelectedYear = 'all'; // Track the selected year for dynamic targets

function createEmptyTeamFilterState() {
  return {
    name: [],
    job: [],
    manager: [],
    location: [],
    function: [],
    customer: [],
    sow: [],
    billing: [],
    skill: [],
    skillData: [],
    status: [],
    skillLevel: "-1",
    skillNewLevel: "-1",
  };
}

function getCurrentTeamFilterSelections() {
  return {
    name: $("#nameSelect").val() || [],
    job: $("#jobSelect").val() || [],
    manager: $("#repMangSelect").val() || [],
    location: $("#locatSelect").val() || [],
    function: $("#funSelect").val() || [],
    customer: $("#custSelect").val() || [],
    sow: $("#SOWSelect").val() || [],
    billing: $("#billSelect").val() || [],
    skill: $("#skillSelect").val() || [],
    skillData: $("#skillNewSelect").val() || [],
    status: $("#status").val() || [],
    skillLevel: $("#skillLevelSelect").val() || "-1",
    skillNewLevel: $("#skillNewLevelSelect").val() || "-1",
  };
}

function syncPersistentTeamFilters() {
  persistentTeamFilters = getCurrentTeamFilterSelections();
}

function setSelectValues(selector, values) {
  if (!Array.isArray(values)) {
    $(selector).val(values);
    return;
  }

  const availableValues = new Set(
    $(selector)
      .find("option")
      .map(function () {
        return this.value;
      })
      .get()
  );

  $(selector).val(values.filter((value) => availableValues.has(value)));
}

function ensureSelectHasValues(selector, values) {
  if (!Array.isArray(values) || values.length === 0) {
    return;
  }

  const $select = $(selector);
  const existingValues = new Set(
    $select
      .find("option")
      .map(function () {
        return this.value;
      })
      .get()
  );

  values.forEach((value) => {
    if (!value || existingValues.has(value)) {
      return;
    }

    $select.append(
      $("<option>", {
        value,
        text: value,
        class: "emp_option persisted-option",
      })
    );
  });
}

function applyPersistentTeamFiltersToControls() {
  ensureSelectHasValues("#nameSelect", persistentTeamFilters.name);
  ensureSelectHasValues("#jobSelect", persistentTeamFilters.job);
  ensureSelectHasValues("#repMangSelect", persistentTeamFilters.manager);
  ensureSelectHasValues("#locatSelect", persistentTeamFilters.location);
  ensureSelectHasValues("#funSelect", persistentTeamFilters.function);
  ensureSelectHasValues("#custSelect", persistentTeamFilters.customer);
  ensureSelectHasValues("#SOWSelect", persistentTeamFilters.sow);
  ensureSelectHasValues("#billSelect", persistentTeamFilters.billing);
  ensureSelectHasValues("#skillSelect", persistentTeamFilters.skill);
  ensureSelectHasValues("#skillNewSelect", persistentTeamFilters.skillData);
  ensureSelectHasValues("#status", persistentTeamFilters.status);
  setSelectValues("#nameSelect", persistentTeamFilters.name);
  setSelectValues("#jobSelect", persistentTeamFilters.job);
  setSelectValues("#repMangSelect", persistentTeamFilters.manager);
  setSelectValues("#locatSelect", persistentTeamFilters.location);
  setSelectValues("#funSelect", persistentTeamFilters.function);
  setSelectValues("#custSelect", persistentTeamFilters.customer);
  setSelectValues("#SOWSelect", persistentTeamFilters.sow);
  setSelectValues("#billSelect", persistentTeamFilters.billing);
  setSelectValues("#skillSelect", persistentTeamFilters.skill);
  setSelectValues("#skillNewSelect", persistentTeamFilters.skillData);
  setSelectValues("#status", persistentTeamFilters.status);
  setSelectValues("#skillLevelSelect", persistentTeamFilters.skillLevel);
  setSelectValues("#skillNewLevelSelect", persistentTeamFilters.skillNewLevel);
}

function refreshPersistentTeamFilterUI() {
  applyPersistentTeamFiltersToControls();
  updatePlaceholderText("ms-list-1", "Persona", "skillSelect");
  updatePlaceholderText("ms-list-2", "Skills", "skillNewSelect");
  updatePlaceholderText("ms-list-3", "Name", "nameSelect");
  updatePlaceholderText("ms-list-4", "Job", "jobSelect");
  updatePlaceholderText("ms-list-5", "Manager", "repMangSelect");
  updatePlaceholderText("ms-list-6", "Location", "locatSelect");
  updatePlaceholderText("ms-list-7", "Function", "funSelect");
  updatePlaceholderText("ms-list-8", "Customer", "custSelect");
  updatePlaceholderText("ms-list-9", "SOW Name", "SOWSelect");
  updatePlaceholderText("ms-list-10", "Billing", "billSelect");
  updatePlaceholderText("ms-list-11", "Status", "status");
}

function syncMultiselectDropdownState(selectId) {
  const $select = $("#" + selectId);
  const $dropdown = $("#ms-list-" + selectId);

  if ($select.length === 0 || $dropdown.length === 0) {
    return;
  }

  const selectedValues = new Set(($select.val() || []).map(String));
  $dropdown.find("li[data-search-term]").each(function () {
    const $item = $(this);
    const optionValue = String($item.attr("data-search-term") || "");
    const isSelected = selectedValues.has(optionValue);

    $item.toggleClass("selected", isSelected);
    $item.find('input[type="checkbox"]').prop("checked", isSelected);
  });
}

function syncAllTeamMultiselectDropdownStates() {
  [
    "skillSelect",
    "skillNewSelect",
    "nameSelect",
    "jobSelect",
    "repMangSelect",
    "locatSelect",
    "funSelect",
    "custSelect",
    "SOWSelect",
    "billSelect",
    "status",
  ].forEach(syncMultiselectDropdownState);
}

function moveSelectedOptionsToTop(selectId) {
  const $select = $("#" + selectId);
  const selectedOptions = [];
  const unselectedOptions = [];

  $select.find("option").each(function () {
    if ($(this).is(":selected")) {
      selectedOptions.push(this);
    } else {
      unselectedOptions.push(this);
    }
  });

  $select.empty().append(selectedOptions).append(unselectedOptions);
}

function getTeamFilterPresentationConfig() {
  return [
    { dropdownId: "ms-list-1", selectId: "skillSelect", placeholder: "Persona" },
    { dropdownId: "ms-list-2", selectId: "skillNewSelect", placeholder: "Skills" },
    { dropdownId: "ms-list-3", selectId: "nameSelect", placeholder: "Name" },
    { dropdownId: "ms-list-4", selectId: "jobSelect", placeholder: "Job" },
    { dropdownId: "ms-list-5", selectId: "repMangSelect", placeholder: "Manager" },
    { dropdownId: "ms-list-6", selectId: "locatSelect", placeholder: "Location" },
    { dropdownId: "ms-list-7", selectId: "funSelect", placeholder: "Function" },
    { dropdownId: "ms-list-8", selectId: "custSelect", placeholder: "Customer" },
    { dropdownId: "ms-list-9", selectId: "SOWSelect", placeholder: "SOW Name" },
    { dropdownId: "ms-list-10", selectId: "billSelect", placeholder: "Billing" },
    { dropdownId: "ms-list-11", selectId: "status", placeholder: "Status" },
  ];
}

function rebuildTeamFilterPresentation() {
  getTeamFilterPresentationConfig().forEach(({ dropdownId, selectId, placeholder }) => {
    const selectedOptions = $("#" + selectId).find("option:selected").get();
    addSelectedUserListBlock(dropdownId, selectedOptions, selectId, placeholder);
    updateSelectedCount(dropdownId, selectId, placeholder);
    syncMultiselectDropdownState(selectId);
  });
}

function applySavedMonthFiltersToUI() {
  $(".availability_checkbox").prop("checked", false);
  $('.filter-icon i').css({
    "background-color": "#fff",
    "color": "#313265"
  });

  globalCheckedValues.forEach(({ month, thresholds }) => {
    thresholds.forEach((threshold) => {
      $(`#month-filter-panel-${month} input[name='availability'][value='${threshold}']`).prop("checked", true);
    });

    $(`.week_col_main_${month} .filter-icon i`).css({
      "background-color": "#313265",
      "color": "#fff"
    });
  });
}

function reorderMultiselectListUI(selectId) {
  const $dropdown = $("#ms-list-" + selectId);
  const $list = $dropdown.find(".ms-options > ul");

  if ($list.length === 0) {
    return;
  }

  const $selectedItems = $list.children("li.selected").detach();
  const $unselectedItems = $list.children("li").detach();
  $list.append($selectedItems).append($unselectedItems);
}

// Helper function to collapse all expanded months
function collapseAllExpandedMonths() {
  const currentYear = new Date().getFullYear();
  const nextYear = getNextYears();
  const shortYear = currentYear.toString().slice(-2);
  const nextShortYear = nextYear.toString().slice(-2);
  const allMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Collapse all months for both years
  allMonths.forEach((month) => {
    // Current year
    let monthKeyCurrent = `${month}_${shortYear}`;
    $(`.week_col_${monthKeyCurrent}`).hide();
    $(`.week_col_main_${monthKeyCurrent}`).show();
    $(`#month_head_${monthKeyCurrent}`).attr("colspan", 1);
    $(`#month_head_${monthKeyCurrent}`).css("width", "50px");
    $(`#month_head_${monthKeyCurrent}`).addClass("all_month");
    $(`#month_head_${monthKeyCurrent} i`).removeClass("fa-compress").addClass("fa-expand");

    // Next year
    let monthKeyNext = `${month}_${nextShortYear}`;
    $(`.week_col_${monthKeyNext}`).hide();
    $(`.week_col_main_${monthKeyNext}`).show();
    $(`#month_head_${monthKeyNext}`).attr("colspan", 1);
    $(`#month_head_${monthKeyNext}`).css("width", "50px");
    $(`#month_head_${monthKeyNext}`).addClass("all_month");
    $(`#month_head_${monthKeyNext} i`).removeClass("fa-compress").addClass("fa-expand");
  });
}

// Function to filter table columns by year
function filterTableByYear(selectedYear) {
  // First, collapse all expanded months to ensure even columns
  collapseAllExpandedMonths();

  currentSelectedYear = selectedYear; // Update the global variable for dynamic targets
  const currentYear = new Date().getFullYear();
  const nextYear = getNextYears();
  const shortYear = currentYear.toString().slice(-2);
  const nextShortYear = nextYear.toString().slice(-2);

  if (selectedYear === 'all') {
    // Show all year columns
    $(`[class*='week_col_main_'][class*='_${shortYear}']`).show();
    $(`[class*='week_col_main_'][class*='_${nextShortYear}']`).show();
    $(`[id*='month_head_'][id*='_${shortYear}']`).show();
    $(`[id*='month_head_'][id*='_${nextShortYear}']`).show();
    $('.teams_ytd_current').show();
    $('.teams_ytd_future').show();
    ytd_year = '4';
    $('#ytd_header').attr('colspan', ytd_year);
  } else if (selectedYear === currentYear.toString()) {
    // Show only current year columns
    $(`[class*='week_col_main_'][class*='_${shortYear}']`).show();
    $(`[class*='week_col_main_'][class*='_${nextShortYear}']`).hide();
    $(`[id*='month_head_'][id*='_${shortYear}']`).show();
    $(`[id*='month_head_'][id*='_${nextShortYear}']`).hide();
    // Hide weekly columns for next year
    $(`[class*='week_col_'][class*='_${nextShortYear}']:not([class*='week_col_main_'])`).hide();
    $('.teams_ytd_current').show();
    $('.teams_ytd_future').hide();
    ytd_year = '2';
    $('#ytd_header').attr('colspan', ytd_year);
  } else if (selectedYear === nextYear.toString()) {
    // Show only next year columns
    $(`[class*='week_col_main_'][class*='_${shortYear}']`).hide();
    $(`[class*='week_col_main_'][class*='_${nextShortYear}']`).show();
    $(`[id*='month_head_'][id*='_${shortYear}']`).hide();
    $(`[id*='month_head_'][id*='_${nextShortYear}']`).show();
    // Hide weekly columns for current year
    $(`[class*='week_col_'][class*='_${shortYear}']:not([class*='week_col_main_'])`).hide();
    $('.teams_ytd_current').hide();
    $('.teams_ytd_future').show();
    ytd_year = '2';
    $('#ytd_header').attr('colspan', ytd_year);
  }

  // Ensure summary rows are visible
  setTimeout(function () {
    $(".summary-row td[class*='week_col_main_']").each(function () {
      const $td = $(this);
      const classes = $td.attr('class');
      if (selectedYear === 'all') {
        $td.show();
        $('.teams_ytd_current').show();
        $('.teams_ytd_future').show();
        ytd_year = '4';
        $('#ytd_header').attr('colspan', ytd_year);
      } else if (selectedYear === currentYear.toString() && classes.includes('_' + shortYear)) {
        $td.show();
        $('.teams_ytd_current').show();
        $('.teams_ytd_future').hide();
        ytd_year = '2';
        $('#ytd_header').attr('colspan', ytd_year);
      } else if (selectedYear === nextYear.toString() && classes.includes('_' + nextShortYear)) {
        $td.show();
        $('.teams_ytd_current').hide();
        $('.teams_ytd_future').show();
        ytd_year = '2';
        $('#ytd_header').attr('colspan', ytd_year);
      } else if (selectedYear !== 'all') {
        $td.hide();
      }
    });
  }, 100);
}

function getWeeksInMonth(year, month) {
  // Get the first and last date of the month
  const firstDay = new Date(year, month, 1).getDay(); // Day of the week (0=Sunday, 6=Saturday)
  const totalDays = new Date(year, month + 1, 0).getDate(); // Total days in the month

  // Calculate the offset to adjust for the first valid week
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Adjust for weeks that start before Monday

  // Calculate weeks based on total days and offset, considering valid weeks only
  const weeks = Math.ceil((totalDays + offset) / 7); // Divide by 7 for full weeks and round up

  return weeks;
}

// Global click event listener to hide filter panels when clicking outside
$(document).on("click", function (event) {
  // Check if the clicked element is not inside any filter panel or filter icon
  if (
    !$(event.target).closest(".month-filter-panel").length &&
    !$(event.target).closest(".filter-icon").length
  ) {
    // Hide all filter panels
    $(".month-filter-panel").hide();
  }
});

function teamHeaderData(selectedYear = 'all') {
  $("#teamHeaderData").empty();
  // console.log("Data");
  const currentYear = new Date().getFullYear();
  const nextYear = getNextYears();
  const shortYear = currentYear.toString().slice(-2);
  const nextShortYear = nextYear.toString().slice(-2);
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

  let yearHeaderMonth = "";
  let weekHeaderRow = "";

  // Determine which years to show based on filter
  const showCurrentYear = selectedYear === 'all' || selectedYear === currentYear.toString();
  const showNextYear = selectedYear === 'all' || selectedYear === nextYear.toString();

  // First, add all months for current year
  if (showCurrentYear) {
    months.forEach((month, index) => {
      const weeks = getWeeksInMonth(currentYear, index);
      yearHeaderMonth += `
        <th colspan="1" class='noWordBreak utilization_span all_month' id='month_head_${month}_${shortYear}' data-id='${weeks}' data-id2='${month}_${shortYear}' onclick='toggleAllWeeks(this,${weeks})'>
            ${month} ${shortYear} <i class="fa fa-expand icon-custom-style" aria-hidden="true"></i>
        </th>`;

      weekHeaderRow += `
          <th class='noWordBreak week_col_main_${month}_${shortYear} weekly-utliz-data'>
            <!-- Filter Icon -->
            <div class="filter-icon"
                  onclick="event.stopPropagation(); showMonthFilter('${month}_${shortYear}')">
              <i class="fa fa-filter" aria-hidden="true"></i>
            </div>

            <!-- Filter Popup for this Month (initially hidden) -->
            <div class="month-filter-panel" id="month-filter-panel-${month}_${shortYear}" onchange="applyMonthFilter('${month}_${shortYear}')" style="display: none;">
              <div class="filter-title">AVAILABILITY</div>
              <label><input type="checkbox" class='availability_checkbox' name="availability" value="50" /> > 50 %</label>
              <label><input type="checkbox" class='availability_checkbox' name="availability" value="60" /> > 60 %</label>
              <label><input type="checkbox" class='availability_checkbox' name="availability" value="70" /> > 70 %</label>
              <label><input type="checkbox" class='availability_checkbox' name="availability" value="80" /> > 80 %</label>
              <label><input type="checkbox" class='availability_checkbox' name="availability" value="90" /> > 90 %</label>
            </div>
          </th>
        `;

      for (let w = 1; w <= weeks; w++) {
        weekHeaderRow += `<th class='noWordBreak week_col_${month}_${shortYear}' style="display: none;">W${w}</th>`;
      }
    });
  }

  // Then, add all months for next year
  if (showNextYear) {
    months.forEach((month, index) => {
      const weeksNext = getWeeksInMonth(nextYear, index);
      yearHeaderMonth += `
        <th colspan="1" class='noWordBreak utilization_span all_month' id='month_head_${month}_${nextShortYear}' data-id='${weeksNext}' data-id2='${month}_${nextShortYear}' onclick='toggleAllWeeks(this,${weeksNext})'>
            ${month} ${nextShortYear} <i class="fa fa-expand icon-custom-style" aria-hidden="true"></i>
        </th>`;

      weekHeaderRow += `
          <th class='noWordBreak week_col_main_${month}_${nextShortYear} weekly-utliz-data'>
            <!-- Filter Icon -->
            <div class="filter-icon"
                  onclick="event.stopPropagation(); showMonthFilter('${month}_${nextShortYear}')">
              <i class="fa fa-filter" aria-hidden="true"></i>
            </div>

            <!-- Filter Popup for this Month (initially hidden) -->
            <div class="month-filter-panel" id="month-filter-panel-${month}_${nextShortYear}" onchange="applyMonthFilter('${month}_${nextShortYear}')" style="display: none;">
              <div class="filter-title">AVAILABILITY</div>
              <label><input type="checkbox" class='availability_checkbox' name="availability" value="50" /> > 50 %</label>
              <label><input type="checkbox" class='availability_checkbox' name="availability" value="60" /> > 60 %</label>
              <label><input type="checkbox" class='availability_checkbox' name="availability" value="70" /> > 70 %</label>
              <label><input type="checkbox" class='availability_checkbox' name="availability" value="80" /> > 80 %</label>
              <label><input type="checkbox" class='availability_checkbox' name="availability" value="90" /> > 90 %</label>
            </div>
          </th>
        `;

      for (let w = 1; w <= weeksNext; w++) {
        weekHeaderRow += `<th class='noWordBreak week_col_${month}_${nextShortYear}' style="display: none;">W${w}</th>`;
      }
    });
  }

  teamHeaderdataHtml = `<tr>
                    <th rowspan="2" scope="col" class="col_width_id columntwo sticky-col sticky-col-1" style='width: 50px'>ID</th>
                    <th class="columnthree col_name sticky-col sticky-col-2">Name</th>
                    <th class='col_job'>Job Title</th>
                    <th class='col_manager'>Manager</th>
                    <th style="padding-right: 15px !important;display: none;">Location</th>
                    <th class='col_funnel' style="padding-right: 15px !important;">Function</th>
                    <th class='col_account' style="padding-right: 15px !important;">Account</th>
                    <th class="col_sow_name" style="padding-right: 15px !important;">SOW Name</th>
                    <th class='col_billing'>Billing</th>
                    <th rowspan="2" class="col_width columnthree col_fac_exp" style="padding-right: 15px !important;">Factspan Exp</th>
                    <th rowspan="2" class="col_width columnthree col_total_exp" style="padding-right: 15px !important;">Total Exp</th>
                    <th class="col_status">Status</th>
                    ${yearHeaderMonth}
                    <th class='col_width_skills'>Persona</th>
                    <th class='col_skill_data_width'>Skills</th>
                    <th colspan="${ytd_year}" id="ytd_header" class="col_utiliz_billing_width">Billed<br><span class="utilization_span">Utilization %</span></th>
                    <th rowspan="2" scope="col"  style="display: none;">Skill</th>
                    <th rowspan="2" scope="col" style="display: none;">Email ID</th>
                  </tr>
                  <tr>
                    <th scope="col" class="col_width columnthree sticky-col sticky-col-2-filter">
                      <div style="color: black">
                        <select class="form-control" name="nameSelect[]" multiple id="nameSelect">
                        </select>
                      </div>
                    </th>
                    <th scope="col" class="col_width sticky-col-3-filter">
                      <div style="color: black">
                        <select name="jobSelect[]" multiple id="jobSelect">
                        </select>
                      </div>
                      <div id="selectedJobFilters" class="selected-filters"></div>
                    </th>
                    <th scope="col" class="col_width sticky-col-4-filter">
                      <div style="color: black">
                        <select name="repMangSelect[]" multiple id="repMangSelect">
                        </select>
                      </div>

                    </th>
                    <th scope="col" class="col_width_loc" style="display: none;">
                      <div style="color: black">
                        <select name="locatSelect[]" multiple id="locatSelect">
                      </div>
                      </select>
                    </th>
                    <th scope="col" class="col_width_func_bill sticky-col-5-filter">
                      <div style="color: black">
                        <select name="funSelect[]" multiple id="funSelect">
                        </select>
                      </div>

                    </th>
                    <th scope="col" class="col_width_other sticky-col-6-filter">
                      <div style="color: black">
                        <select name="custSelect[]" multiple id="custSelect">
                        </select>
                      </div>

                    </th>
                    <th scope="col" class="col_skill_width sticky-col-7-filter">
                      <div style="color: black; display: flex;justify-content: center;">
                        <select name="SOWSelect[]" multiple id="SOWSelect">
                        </select>
                      </div>

                    </th>
                    <th scope="col" class="col_width_func_bill sticky-col-8-filter">
                      <div style="color: black">
                        <select name="billSelect[]" multiple id="billSelect">
                        </select>
                      </div>

                    </th>

                    <th scope="col" class="col_width_other sticky-col-8-filter">
                      <div style="color: black">
                        <select name="status[]" multiple id="status">
                          <option value="NO">Active</option>
                          <option value="YES">In Notice Period</option>
                        </select>
                      </div>

                    </th>
                    ${weekHeaderRow}
                    <th scope="col" class="col_skill_width weekly-utliz-data">
                      <div class="skill_header_filter" style="margin-left: auto;">
                        <div class="col-sm-6 skill_fil">

                          <select name="skillSelect[]" multiple id="skillSelect">
                          </select>
                        </div>
                        <div class="col-sm-6 skill_level_fil" style='display: none;'>
                          <select id="skillLevelSelect">
                            <option value="-1">All</option>
                            <option value="L1">L1</option>
                            <option value="L2">L2</option>
                            <option value="L3">L3</option>
                          </select>
                        </div>
                      </div>
                    </th>
                    <th scope="col" class="col_skill_data_width weekly-utliz-data">
                      <div class="skill_header_filter skill_data_header" style="margin-left: auto;">
                        <div class="skill_fil">

                          <select name="skillNewSelect[]" multiple id="skillNewSelect">
                          </select>
                        </div>
                        <div class="skill_level_fil">
                          <select id="skillNewLevelSelect">
                            <option value="-1">All</option>
                            <option value="L1">L1</option>
                            <option value="L2">L2</option>
                            <option value="L3">L3</option>
                          </select>
                        </div>
                      </div>
                    </th>
                    <th class='weekly-utliz-data teams_ytd_current' >YTD-${shortYear}</th>
                    <th class='weekly-utliz-data teams_ytd_current' id="fy_year" >FY-${shortYear}</th>
                    <th class='weekly-utliz-data teams_ytd_future' >YTD-${nextShortYear}</th>
                    <th class='weekly-utliz-data teams_ytd_future' id="fy_year" >FY-${nextShortYear}</th>
                  </tr>`;
  $("#teamHeaderData").append(teamHeaderdataHtml);
}

function showMonthFilter(month) {
  var panel = $("#month-filter-panel-" + month);

  // Hide all other panels except the one being toggled
  $(".month-filter-panel").not(panel).hide();

  // Toggle the selected panel
  panel.toggle();
}

function applyMonthFilter() {
  selectedMonths = [];
  let checkedValues = [];
  let maxThreshold = 0; // Track the highest threshold selected

  $(".month-filter-panel").each(function () {
    let month = $(this).attr("id").replace("month-filter-panel-", "");
    let checkedThresholds = [];

    $(this)
      .find("input[name='availability']:checked")
      .each(function () {
        let value = parseInt($(this).val());
        checkedThresholds.push(value);
        if (value > maxThreshold) {
          maxThreshold = value; // Update max threshold
        }
      });

    // if (checkedThresholds.length > 0) {
    //   selectedMonths.push(month);
    //   checkedValues.push({ month, thresholds: checkedThresholds });
    // }
    if (checkedThresholds.length > 0) {
      selectedMonths.push(month);
      checkedValues.push({ month, thresholds: checkedThresholds });

      // Change filter icon background to blue when filters are applied
      $(`.week_col_main_${month} .filter-icon i`).css(
        "background-color",
        "#313265"
      );
      $(`.week_col_main_${month} .filter-icon i`).css("color", "#fff");
    } else {
      // Reset to transparent if no filter is selected
      $(`.week_col_main_${month} .filter-icon i`).css(
        "background-color",
        "#fff"
      );
      $(`.week_col_main_${month} .filter-icon i`).css("color", "#313265");
    }
  });

  // Update global variables
  selectedBenchThreshold = maxThreshold;
  globalCheckedValues = checkedValues; // Store in global variable

  // If no filters are selected, reset everything
  if (globalCheckedValues.length === 0) {
    selectedBenchThreshold = 0;
    console.log("No filters selected. Resetting to show all data.");
  }

  applySavedMonthFiltersToUI();

  // Call filterData to apply filtering with the updated threshold
  filterData();
}

function toggleAllWeeks(clickedElement, sectionRowsCount) {
  let month = $(clickedElement).attr("data-id2");
  let weekCols = $(".week_col_" + month);
  let weekMainCol = $(".week_col_main_" + month);
  let monthHeader = $("#month_head_" + month);
  let icon = $(clickedElement).find("i");

  if (weekCols.is(":visible")) {
    weekCols.hide();
    weekMainCol.show();
    monthHeader.attr("colspan", 1);
    monthHeader.css("width", "50px");
    monthHeader.removeClass("all_month");
    icon.removeClass("fa-compress").addClass("fa-expand");
  } else {
    weekCols.show();
    weekMainCol.hide();
    monthHeader.attr("colspan", sectionRowsCount);
    monthHeader.css("width", "150px");
    monthHeader.removeClass("all_month");
    icon.removeClass("fa-expand").addClass("fa-compress");
  }
}

function hideAllWeeksOnLoad() {
  $("[class^='week_col_']").hide(); // Hide all week columns
  $("th[id^='month_head_']").each(function () {
    $(this).attr("colspan", 1); // Set initial colspan to 1 for each month
    $(this).find("i").removeClass("fa-compress").addClass("fa-expand"); // Set expand icon
  });
}

function getDynamicYears() {
  // Get current UTC date
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth() + 1; // getUTCMonth returns 0-11, so +1

  // Determine years based on month
  if (utcMonth <= 6) {
    // June or less: include past year
    return [utcYear - 1, utcYear];
  } else {
    // July or more: include future year
    return [utcYear, utcYear + 1];
  }
}
function getNextYears() {
  // Get current UTC date
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth() + 1; // getUTCMonth returns 0-11, so +1

  // Determine years based on month
  if (utcMonth <= 6) {
    // June or less: include past year
    return utcYear - 1;
  } else {
    // July or more: include future year
    return utcYear + 1;
  }
}

// Custom-styled dropdown for #teams_year: the real <select> stays in the DOM
// (hidden) as the single source of truth so every existing $("#teams_year").val()/
// change-handler keeps working; this just renders a themed panel on top of it,
// avoiding the browser's native OS-styled option list.
function initYearDropdownUI() {
  const $select = $("#teams_year");
  const $wrap = $("#yearDropdownWrap");
  const $btn = $("#yearDropdownBtn");
  const $label = $("#yearDropdownLabel");
  const $list = $("#yearDropdownList");

  if (!$wrap.length) return;

  function renderOptions() {
    $list.empty();
    $select.find("option").each(function () {
      const $opt = $(this);
      const $li = $("<li></li>")
        .attr("role", "option")
        .attr("data-value", $opt.val())
        .text($opt.text());
      if ($opt.is(":selected")) {
        $li.addClass("selected");
        $label.text($opt.text());
      }
      $list.append($li);
    });
  }

  function closeDropdown() {
    $wrap.removeClass("open");
    $btn.attr("aria-expanded", "false");
  }

  // Anchor via JS (not CSS position:relative) so the panel lines up with the
  // toggle box regardless of any ancestor's own positioning, and matches its width.
  function positionList() {
    const wrapRect = $wrap[0].getBoundingClientRect();
    $list.css({
      top: wrapRect.bottom + 6 + "px",
      left: wrapRect.left + "px",
      width: wrapRect.width + "px",
    });
  }

  renderOptions();

  $btn.off("click.yearDropdown").on("click.yearDropdown", function (e) {
    e.stopPropagation();
    const isOpen = $wrap.hasClass("open");
    if (isOpen) {
      closeDropdown();
    } else {
      renderOptions();
      $wrap.addClass("open");
      $btn.attr("aria-expanded", "true");
      positionList();
    }
  });

  $(".employee_form")
    .off("scroll.yearDropdown")
    .on("scroll.yearDropdown", closeDropdown);
  $(window)
    .off("scroll.yearDropdown resize.yearDropdown")
    .on("scroll.yearDropdown resize.yearDropdown", closeDropdown);

  $list.off("click.yearDropdown", "li").on("click.yearDropdown", "li", function () {
    const value = $(this).attr("data-value");
    $label.text($(this).text());
    $list.find("li").removeClass("selected");
    $(this).addClass("selected");
    $select.val(value).trigger("change");
    closeDropdown();
  });

  $(document)
    .off("click.yearDropdownOutside")
    .on("click.yearDropdownOutside", function (e) {
      if (!$(e.target).closest("#yearDropdownWrap").length) {
        closeDropdown();
      }
    });

  $(document)
    .off("keydown.yearDropdown")
    .on("keydown.yearDropdown", function (e) {
      if (e.key === "Escape") closeDropdown();
    });
}

function populateTeamsYearSelect() {
  const select = $("#teams_year");
  select.empty(); // Clear existing options

  const years = getDynamicYears();

  select.append('<option value="all">All</option>'); // Add 'All' option
  years.forEach(year => {
    select.append(`<option value="${year}">${year}</option>`);
  });

  // // Set default to current year
  // select.val(new Date().getUTCFullYear().toString());
}

const getSowViewData = async (selDate) => {
  var empData = [];
  const startTime = performance.now();
  try {
    let status = "";
    let endDate = "";
    let form_details = {
      db_name: apiValue.db_name,
      STATUS_AS_OF_DATE: selDate,
      environment: apiValue.environment,
    };
    let data = await fetch(apiValue.url_ip + ":5001/teams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form_details),
    });
    // let data = await fetch("js/teams_data.json", {
    //   // method: "POST",
    //   // headers: {
    //   //   "Content-Type": "application/json",
    //   // },
    //   // body: JSON.stringify(form_details),
    // });
    const result = await data.json();
    // console.log("result", result);
    empAllData = result;
    // empAllData = TempEmpData
    const endTime = performance.now();
    const loadTimeInSeconds = (endTime - startTime) / 1000;
    // getApiTime(
    //   loadTimeInSeconds,
    //   "team",
    //   "Teams",
    //   "teams",
    //   "success",
    //   fileName,
    //   "teamsPage",
    //   "view"
    // );


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
    $(".emp_new_data").show();
    $(".table-loading").hide();
  } catch {
    const endTime = performance.now();
    const loadTimeInSeconds = (endTime - startTime) / 1000;
    // getApiTime(
    //   loadTimeInSeconds,
    //   "team",
    //   "Teams",
    //   "teams",
    //   "error",
    //   fileName,
    //   "teamsPage",
    //   "view"
    // );
    // console.error("Error occurred while fetching data:", error);
    $(".loader").css("display", "none");
    $(".show_page").css("display", "block");
  }
};

function filterEmpData(accountFilter, sowFilter, billingStatusFilter) {
  return TempEmpData.filter(emp => {
    const accountMatch = !accountFilter || emp.Account === accountFilter;
    const sowMatch = !sowFilter || emp.SOW === sowFilter;
    const billingStatusMatch = !billingStatusFilter || emp.BillingStatus === billingStatusFilter;
    return accountMatch && sowMatch && billingStatusMatch;
  });
}

function getUniqueOptions(field) {
  return [...new Set(TempEmpData.map(emp => emp[field]).filter(Boolean))];
}
function getEmpData(selDate) {
  var empData = [];
  let status = "";
  let endDate = "";
  $.ajax({
    url: apiValue.url_ip + ":5001/teams",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    beforeSend: function () {
      $("#teams_div").addClass("ajax_load_hide");
      $("#loading_div").removeClass("ajax_load_hide");
    },
    complete: function () {
      $("#teams_div").removeClass("ajax_load_hide");
      $("#loading_div").addClass("ajax_load_hide");
    },
    data: JSON.stringify({
      STATUS_AS_OF_DATE: selDate,
      db_name: apiValue.db_name,
      environment: apiValue.environment,
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
      $(".emp_new_data").show();
      $(".table-loading").hide();
    },
    error: function (error) {
      console.log("message Error" + JSON.stringify(error));
    },
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
  },
});

let empNameOptions = "",
  empNameUsOptions = "",
  jobNameOptions = "",
  jobNameUsOptions = "",
  jobNameAllOptions = "",
  managerOptions = "",
  sowNameOptions = "",
  managerUsOptions = "";
let locationOptions = "",
  functionOptions = "",
  custNameOptions = "",
  billingOptions = "",
  managerAllOptions = "",
  locationIndOptions = "",
  locationUsOptions = "";
let filterJsonData = [],
  jobNameArray_IND = [],
  jobNameArray_US = [],
  managerNameArray_IND = [],
  managerNameArray_US = [],
  functionArray = [],
  sowNameArray = [],
  locationArray_IND = [],
  locationArray_US = [];
let empNameArray_IND = [],
  empNameArray_US = [],
  custNameArray = [],
  billArray = [],
  locationArray = [];
let checkValue = 0;
// function getEmpDataTable(emp, e) {
//     $('#emp_table tbody').empty();
//     $('#emp_table').dataTable().fnClearTable();
//     $('#emp_table').dataTable().fnDestroy();

//     console.log('emp - ', emp);

//     emp.forEach(employee => {
//         let emp_skills = employee.SKILLS_LEVEL;
//         let emp_skill_data = emp_skills.map(skill => `<button class="skill_data">${skill}</button>`).join('');
//         let emp_skill_hide_data = emp_skills.join(', ');

//         let BillingHover = "";
//         if (employee.ALLOCATION_START_DATE !== "0000-00-00") {
//             BillingHover = (employee.ALLOCATION_START_DATE ? convert(employee.ALLOCATION_START_DATE) : "") +
//                            ' to ' + (employee.ALLOCATION_END_DATE ? convert(employee.ALLOCATION_END_DATE) : "");
//         }

//         let noticeDate = employee.IN_NOTICE_PERIOD === "YES" ? convert(employee.END_DATE) : "";

//         let row = $(`
//             <tr>
//                 <td class="columnBody1"><div class="team_data_left">${employee.EMPLOYEE_ID}</div></td>
//                 <td class="columnBody2"><div class="team_data_left team_mem_name" onclick="getEmpProfileData(this)">${employee.EMPLOYEE_NAME}</div></td>
//                 <td><div class="team_data_left">${employee.JOB_ROLE}</div></td>
//                 <td><div class="team_data_left">${employee.MANAGER_NAME || "-"}</div></td>
//                 <td><div class="team_data">${employee.COUNTRY}</div></td>
//                 <td><div class="team_data">${employee.DEPARTMENT}</div></td>
//                 <td><div class="team_data">${employee.ACCOUNT_NAME || "-"}</div></td>
//                 <td><div title="${BillingHover}" class="team_data">${employee.BILLING_STATUS || "-"}</div></td>
//                 <td><div title="${noticeDate}" class="team_data">${employee.IN_NOTICE_PERIOD === "YES" ? "In Notice Period" : "Active"}</div></td>
//                 <td><div class="team_data">${employee.YTD_UTILIZATION}</div></td>
//                 <td><div class="team_data">${employee.CURRENT_YEAR_UTIIZATION}</div></td>
//                 <td class="more">${emp_skill_data}</td>
//                 <td><div class="team_data">${employee.FACT_EXPERIENCE}</div></td>
//                 <td><div class="team_data">${employee.TOTAL_EXPERIENCE}</div></td>
//                 <td style="display: none"><div class="team_data">${emp_skill_hide_data}</div></td>
//                 <td style="display: none">${employee.EMAIL_ID}</td>
//             </tr>
//         `);

//         $('#emp_table').append(row);
//     });

//     // Initialize DataTable
//     var table = $('#emp_table').DataTable({
//         "pageLength": 50,
//         "paging": false,
//         "orderCellsTop": true
//     });

//     $(".dataTables_info").empty();
//     $(".dataTables_info").append(`Showing 1 to ${emp.length} of ${emp.length} entries`);
// }

// Function to determine background color based on highest value
function getBackgroundColor(billed, bench, investment, invSigned = 0, invQP = 0) {
  // 1. If Billed > 100 (Absolute Priority)
  if (billed > 100) {
    return {
      bgColor: "background-color: #1db81d;",
      textColor: "color: white;",
      warningText: '<i class="fas fa-exclamation-triangle" style="color:#FFC107;font-weight:bold;margin-right:4px;" aria-label="Warning"></i>'
    };
  }

  // 2. If Billed > 0 and it's the maximum (up to 100%)
  if (billed > 0 && billed >= bench && billed >= investment) {
    return {
      bgColor: "background-color: #A7DAB6;",
      textColor: "color: black;",
      warningText: ""
    };
  }

  // 3. If Investment > 0 and it's the maximum
  if (investment > 0 && investment > billed && investment >= bench) {
    // Priority: Signed >= QP
    let color = invSigned >= invQP ? "#ffff7f" : "#c7eaf5";
    return {
      bgColor: `background-color: ${color};`,
      textColor: "color: black;",
      warningText: investment > 100 ? '<i class="fas fa-exclamation-triangle" style="color:#FFC107;font-weight:bold;margin-right:4px;" aria-label="Warning"></i>' : ''
    };
  }

  // 4. If Bench > 0 and it's the maximum
  if (bench > 0 && bench > billed && bench > investment) {
    return {
      bgColor: "background-color: #EA979B;",
      textColor: "color: black;",
      warningText: ""
    };
  }

  // 5. All 0 or default
  return {
    bgColor: "background-color: #f4f5f7;",
    textColor: "color: black;",
    warningText: ""
  };
}

function calculateAndBuildSummaryHtml(empList, shortYear, nextShortYear, allMonths) {
  let totalBilled = {};
  let totalInvestment = {};
  let totalBench = {};
  let totalSum = {};

  empList.forEach((employee) => {
    let utilizationData = employee.UTILIZATION_DATA || [];
    utilizationData.forEach((data) => {
      let monthName = data.MONTH_YEAR;
      totalBilled[monthName] = (totalBilled[monthName] || 0) + parseFloat(data.Billed || 0);
      totalInvestment[monthName] = (totalInvestment[monthName] || 0) + parseFloat(data.Investment || 0);
      totalBench[monthName] = (totalBench[monthName] || 0) + parseFloat(data.Bench || 0);
      totalSum[monthName] = (totalSum[monthName] || 0) + parseFloat(data.Billed || 0) + parseFloat(data.Investment || 0) + parseFloat(data.Bench || 0);

      if (data.Weekly) {
        data.Weekly.forEach((week) => {
          let weekNumber = week.Week || 1;
          let weekKey = `${monthName}_W${weekNumber}`;
          totalBilled[weekKey] = (totalBilled[weekKey] || 0) + parseFloat(week.Billed || 0);
          totalInvestment[weekKey] = (totalInvestment[weekKey] || 0) + parseFloat(week.Investment || 0);
          totalBench[weekKey] = (totalBench[weekKey] || 0) + parseFloat(week.Bench || 0);
          totalSum[weekKey] = (totalSum[weekKey] || 0) + (parseFloat(week.Billed || 0) + parseFloat(week.Investment || 0) + parseFloat(week.Bench || 0));
        });
      }
    });
  });

  const buildRow = (label, totalsObj, rowClass) => {
    let html = `<tr class='summary-row ${rowClass}'><td colspan="11" class='total_data_utilz' style="text-align: right; font-weight: bold;">${label}:</td>`;

    // Current Year
    allMonths.forEach((month) => {
      let monthKey = `${month}_${shortYear}`;
      let valMonth = ((totalsObj[monthKey] || 0) / (totalSum[monthKey] || 1)) * 100;
      html += `<td class='week_col_main_${monthKey}' style="font-weight: bold;">${Math.round(valMonth)}%</td>`;

      let uniqueWeeks = new Set();
      empList.forEach(emp => {
        let mData = (emp.UTILIZATION_DATA || []).find(d => d.MONTH_YEAR === monthKey);
        if (mData && mData.Weekly) mData.Weekly.forEach(w => uniqueWeeks.add(w.Week));
      });

      Array.from(uniqueWeeks).sort().forEach(week => {
        let weekKey = `${monthKey}_W${week}`;
        let valWeek = ((totalsObj[weekKey] || 0) / (totalSum[weekKey] || 1)) * 100;
        html += `<td class="week_col_${monthKey}" style="font-weight: bold; display: none;">${Math.round(valWeek)}%</td>`;
      });
    });

    // Next Year
    allMonths.forEach((month) => {
      let monthKey = `${month}_${nextShortYear}`;
      let valMonth = ((totalsObj[monthKey] || 0) / (totalSum[monthKey] || 1)) * 100;
      html += `<td class='week_col_main_${monthKey}' style="font-weight: bold;">${Math.round(valMonth)}%</td>`;

      let uniqueWeeks = new Set();
      empList.forEach(emp => {
        let mData = (emp.UTILIZATION_DATA || []).find(d => d.MONTH_YEAR === monthKey);
        if (mData && mData.Weekly) mData.Weekly.forEach(w => uniqueWeeks.add(w.Week));
      });

      Array.from(uniqueWeeks).sort().forEach(week => {
        let weekKey = `${monthKey}_W${week}`;
        let valWeek = ((totalsObj[weekKey] || 0) / (totalSum[weekKey] || 1)) * 100;
        html += `<td class="week_col_${monthKey}" style="font-weight: bold; display: none;">${Math.round(valWeek)}%</td>`;
      });
    });

    html += `<td colspan='6'></td></tr>`;
    return html;
  };

  return {
    billed: buildRow("Total Billed Utilization", totalBilled, "total-utilization"),
    investment: buildRow("Total Investment Utilization", totalInvestment, "total-investment"),
    bench: buildRow("Total Bench Utilization", totalBench, "total-bench")
  };
}


function showSkillBox(element) {
  let skills = decodeURIComponent($(element).data("Persona")); // Get the skills from the data attribute
  let skillArray = skills.split(", "); // Split the skills into an array

  // Create a container for the skills
  let skillBox = $("<div>").addClass("skill-box");

  // Loop through each skill and create a styled span for it
  skillArray.forEach((skill) => {
    let skillSpan = $("<span>")
      .addClass("skill-item") // Add a class for styling
      .text(skill.trim()) // Trim any extra whitespace
      .css({
        backgroundColor: "#c9e0ef", // Light blue background color
        padding: "2px 2px",
        margin: "2px",
        borderRadius: "4px",
        // color: "#000", // Black text for contrast
        display: "inline-block",
        fontSize: "10px",
      });

    // Append each skill span to the skill box
    skillBox.append(skillSpan);
  });

  // Append the skill box to the body and position it near the hovered element
  $("body").append(skillBox);
  let offset = $(element).offset();
  skillBox
    .css({
      top: offset.top + $(element).outerHeight() + 5, // Position below the hovered element
      left: offset.left,
    })
    .fadeIn(200); // Fade in the box
}

let hideTimeout = null;
function showSkillDataBox(element) {
  let skills = decodeURIComponent($(element).data("skills"));
  let skillArray = skills.split(", ");

  let skillBox = $("<div>")
    .addClass("skill-box")
    .css({
      position: "absolute",
      background: "#fff",
      border: "1px solid #ccc",
      padding: "5px",
      borderRadius: "5px",
      boxShadow: "0px 0px 8px rgba(0,0,0,0.1)",
      zIndex: 20,
      display: "none",
      // maxHeight: "200px",
      // overflowY: "auto",
      // overflowX: "hidden",
      // width: "250px"
    });

  skillArray.forEach(skill => {
    let skillSpan = $("<span>")
      .addClass("skill-item")
      .text(skill.trim())
      .css({
        backgroundColor: "#c9e0ef",
        padding: "2px 5px",
        margin: "2px",
        borderRadius: "4px",
        display: "inline-block",
        fontSize: "10px",
        whiteSpace: "nowrap"
      });

    skillBox.append(skillSpan);
  });

  $("body").append(skillBox);

  // Position to the left of the element
  const offset = $(element).offset();
  const skillBoxWidth = 260; // Same or slightly more than .skill-box width
  const skillBoxTop = offset.top;
  const skillBoxLeft = offset.left - skillBoxWidth - 10; // 10px padding space

  skillBox
    .css({
      top: skillBoxTop,
      left: skillBoxLeft
    })
    .fadeIn(200)
    .attr("id", "active-skill-box");
}

function hideDataSkillBox() {
  $("#active-skill-box").fadeOut(100, function () {
    $(this).remove();
  });
}


// Helper function to generate random colors for skills
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Function to hide the skill box
function hideSkillBox() {
  $(".skill-box").remove(); // Remove the skill box when the mouse leaves
}

function sowAccDetails(uniqueId, sowid) {
  console.log("uniqueId", uniqueId);
  console.log("sowid", sowid);
  let uniqId_sowid = uniqueId + "&" + sowid;
  window.open("sow.html?" + uniqId_sowid, "_blank");
}

function getEmpDataTable(emp, e) {
  console.log("emp data - ", emp);
  console.log("emp - ", emp);
  const currentYear = new Date().getFullYear();
  const nextYear = getNextYears()
  const shortYear = currentYear.toString().slice(-2);
  const nextShortYear = nextYear.toString().slice(-2);
  $("#emp_table tbody").empty();
  $("#emp_table").dataTable().fnClearTable();
  $("#emp_table").dataTable().fnDestroy();

  // Initialize totals for Billed, Investment, and Bench
  let totalBilled = {};
  let totalInvestment = {};
  let totalBench = {};
  let totalSum = {}; // To store the total sum for each month and week

  // Define allMonths globally
  const allMonths = [
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

  emp.forEach((employee) => {
    // Employee Persona (unchanged)
    let emp_skills = employee.SKILLS_PERSONA || [];
    let skillCount = emp_skills.length;
    let emp_skill_data = "";
    if (skillCount > 1) {
      emp_skill_data = `
      <div class="skill-count" 
          onmouseenter="showSkillBox(this)" 
          onmouseleave="hideSkillBox()" 
          data-skills="${encodeURIComponent(emp_skills.join(", "))}">
        ${skillCount} Persona(s)
      </div>
    `;
    } else if (skillCount == 1) {
      emp_skill_data = `${emp_skills}`;
    } else {
      emp_skill_data = `-`;
    }
    let emp_skill_hide_data = emp_skills.join(", ");

    // Employee Skills (unchanged)
    let emp_skills_new = employee.SKILLS_LEVEL || [];
    let skillCount_new = emp_skills_new.length;
    let emp_skill_data_new = "";
    if (skillCount_new > 1) {
      emp_skill_data_new = `
      <div class="skill-count" 
          onmouseenter="showSkillDataBox(this)" 
          onmouseleave="hideDataSkillBox()" 
          data-skills="${encodeURIComponent(emp_skills_new.join(", "))}">
        ${skillCount_new} Skill(s)
      </div>
    `;
    } else if (skillCount_new === 1) {
      emp_skill_data_new = `${emp_skills_new[0]}`;
    } else {
      emp_skill_data_new = `-`;
    }
    let emp_skill_hide_data_new = emp_skills_new.join(", ");

    // --- Deduplicate and Prepare SOW/Account Fields ---
    const sowDetails = Array.isArray(employee.SOW_DETAILS) ? employee.SOW_DETAILS : [];
    // Helper: Deduplicate and join
    const joinUnique = (field) => [
      ...new Set(
        sowDetails
          .map(sow => (sow[field] !== undefined && sow[field] !== null) ? sow[field] : '')
          .filter(val => val !== '')
      )
    ].join(', ') || "-";

    let accountNames = joinUnique('ACCOUNT_NAME');
    let accountIds = joinUnique('ACCOUNT_ID');
    let sowIds = joinUnique('SOW_ID');
    let billingStatuses = joinUnique('BILLING_STATUS');
    // let allocationStartDates = joinUnique('ALLOCATION_START_DATE');
    // let allocationEndDates = joinUnique('ALLOCATION_END_DATE');
    let uniqueIds = joinUnique('UNIQUE_ID');

    // --- Render SOW Names as Clickable Elements ---
    let sowNamesHtml = "-";
    if (sowDetails.length > 0) {

      // Deduplicate by SOW_NAME and filter out empty names
      const seenSowNames = new Set();
      const sowDivs = sowDetails
        .filter(sow => sow.SOW_NAME && !seenSowNames.has(sow.SOW_NAME))
        .map(sow => {
          seenSowNames.add(sow.SOW_NAME);
          // Billing period tooltip (all unique periods)
          let BillingHover = "-";
          if (sow.ALLOCATION_START_DATE !== "-" && sow.ALLOCATION_END_DATE !== "-") {
            BillingHover = convert(sow.ALLOCATION_START_DATE) + " to " + (sow.ALLOCATION_END_DATE === "0000-00-00" ? "NA" : convert(sow.ALLOCATION_END_DATE));
          }
          // Clickable only if not Bench/Special Leave and has IDs
          const isClickable = sow.SOW_NAME !== "Bench" && sow.SOW_NAME !== "Special Leave" && sow.SOW_ID && sow.UNIQUE_ID;
          const divClass = isClickable ? "sow-link team_data_left" : "sow-static team_data_left";
          const clickAttr = isClickable ? `onclick='sowAccDetails("${sow.UNIQUE_ID}", "${sow.SOW_ID}")'` : "";
          
          // Background color based on status
          let bgColorStyle = "";
          if (['Proposal', 'Qualified', 'Pre-Qualified'].includes(sow.SOW_STATUS)) {
            bgColorStyle = "background-color: #c7eaf5;"; // Light Blue
          }
          const divStyle = `${isClickable ? "cursor:pointer;" : ""} ${bgColorStyle}`;
          return `<div title="${BillingHover}" class="${divClass}" ${clickAttr} style="${divStyle}">${sow.SOW_NAME}</div>`;
        });
      if (sowDivs.length > 0) {
        sowNamesHtml = sowDivs.join("");
      }
    }



    let noticeDate = employee.IN_NOTICE_PERIOD === "YES" ? convert(employee.END_DATE) : "";

    // UTILIZATION_DATA (unchanged)
    let utilizationData = employee.UTILIZATION_DATA || [];
    allMonths.forEach((month) => {
      let monthYear = `${month}_${shortYear}`;
      if (!utilizationData.find((data) => data.MONTH_YEAR === monthYear)) {
        utilizationData.push({
          MONTH_YEAR: monthYear,
          Bench: 0,
          Billed: 0,
          Investment: 0,
          Weekly: [],
        });
      }
    });

    // Duplicate data for next year
    allMonths.forEach((month) => {
      let monthYear = `${month}_${nextShortYear}`;
      if (!utilizationData.find((data) => data.MONTH_YEAR === monthYear)) {
        let originalMonthYear = `${month}_${shortYear}`;
        let originalData = utilizationData.find((data) => data.MONTH_YEAR === originalMonthYear);
        if (originalData) {
          utilizationData.push({
            MONTH_YEAR: monthYear,
            Bench: originalData.Bench,
            Billed: originalData.Billed,
            Investment: originalData.Investment,
            Weekly: originalData.Weekly.map(w => ({ ...w }))
          });
        } else {
          utilizationData.push({
            MONTH_YEAR: monthYear,
            Bench: 0,
            Billed: 0,
            Investment: 0,
            Weekly: [],
          });
        }
      }
    });

    utilizationData.sort((a, b) => {
      const [monthA, yearA] = a.MONTH_YEAR.split("_");
      const [monthB, yearB] = b.MONTH_YEAR.split("_");
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      return allMonths.indexOf(monthA) - allMonths.indexOf(monthB);
    });

    let utilizationHtml = "";
    utilizationData.forEach((data) => {
      let highestPercentage = data.Billed > 100 || (data.Billed > 0 && data.Billed >= data.Investment && data.Billed >= data.Bench)
        ? data.Billed
        : Math.max(data.Investment, data.Bench);
      let weeklyTds = "";
      let monthName = data.MONTH_YEAR;

      totalBilled[monthName] = (totalBilled[monthName] || 0) + data.Billed;
      totalInvestment[monthName] = (totalInvestment[monthName] || 0) + data.Investment;
      totalBench[monthName] = (totalBench[monthName] || 0) + data.Bench;
      totalSum[monthName] = (totalSum[monthName] || 0) + data.Billed + data.Investment + data.Bench;

      data.Weekly = data.Weekly || [];
      data.Weekly.forEach((week) => {
        let highestWeeklyPercentage = (week.Billed || 0) > 100 || ((week.Billed || 0) > 0 && (week.Billed || 0) >= (week.Investment || 0) && (week.Billed || 0) >= (week.Bench || 0))
          ? (week.Billed || 0)
          : Math.max(week.Investment || 0, week.Bench || 0);
        let { bgColor: weekBgColor, textColor: weekTextColor, warningText: weekWarningText } =
          getBackgroundColor(week.Billed || 0, week.Bench || 0, week.Investment || 0, week.Investment_Signed_Renewal || 0, week.Investment_Q_P_PreQ || 0);
        let weekNumber = week.Week || 1;
        let weekKey = `${monthName}_W${weekNumber}`;
        totalBilled[weekKey] = (totalBilled[weekKey] || 0) + (week.Billed || 0);
        totalInvestment[weekKey] = (totalInvestment[weekKey] || 0) + (week.Investment || 0);
        totalBench[weekKey] = (totalBench[weekKey] || 0) + (week.Bench || 0);
        totalSum[weekKey] = (totalSum[weekKey] || 0) + ((week.Billed || 0) + (week.Investment || 0) + (week.Bench || 0));

        let tooltipParts = [];
        if (week.Billed > 0) tooltipParts.push(`Billed: ${Math.round(week.Billed)}%`);
        if (week.Bench > 0) tooltipParts.push(`Bench: ${Math.round(week.Bench)}%`);
        if ((week.Investment_Signed_Renewal || 0) > 0) tooltipParts.push(`Inv (Signed/Renewal): ${Math.round(week.Investment_Signed_Renewal)}%`);
        if ((week.Investment_Q_P_PreQ || 0) > 0) tooltipParts.push(`Inv (Q/P/PreQ): ${Math.round(week.Investment_Q_P_PreQ)}%`);
        let tooltipText = tooltipParts.length > 0 ? tooltipParts.join(", ") : "";
        weeklyTds += `<td
        class="tooltip-container week_col_${monthName}"
        data-tooltip-id="rev"
        data-toggle="tooltip"
        title="${tooltipText}"
        style="padding: 0px !important; display: none; ${weekBgColor} ${weekTextColor} text-align: center; vertical-align: middle;"
      >
        ${highestWeeklyPercentage == 0
            ? 0
            : weekWarningText + Math.round(highestWeeklyPercentage) + "%"
          }
      </td>`;
      });

      let { bgColor, textColor, warningText } = getBackgroundColor(
        data.Billed, data.Bench, data.Investment, data.Investment_Signed_Renewal || 0, data.Investment_Q_P_PreQ || 0
      );
      let tooltipParts = [];
      if (data.Billed > 0) tooltipParts.push(`Billed: ${Math.round(data.Billed)}%`);
      if (data.Bench > 0) tooltipParts.push(`Bench: ${Math.round(data.Bench)}%`);
      if ((data.Investment_Signed_Renewal || 0) > 0) tooltipParts.push(`Inv (Signed/Renewal): ${Math.round(data.Investment_Signed_Renewal)}%`);
      if ((data.Investment_Q_P_PreQ || 0) > 0) tooltipParts.push(`Inv (Q/P/PreQ): ${Math.round(data.Investment_Q_P_PreQ)}%`);
      let tooltipText = tooltipParts.length > 0 ? tooltipParts.join(", ") : "";
      utilizationHtml +=
        `<td
                    class="tooltip-container week_col_main_${monthName}"
                    data-tooltip-id="rev"
                    data-toggle="tooltip"
                    title="${tooltipText}"
                    style="padding: 0px !important; ${bgColor} ${textColor} text-align: center; vertical-align: middle;" 
                >
                    ${highestPercentage == 0
          ? 0
          : warningText + Math.round(highestPercentage) + "%"
        }
                </td>` + weeklyTds;
    });

    // --- Render row with deduped, clickable SOW/account fields ---
    let row = $(`
        <tr data-email="${employee.EMAIL_ID}">
            <td class="columnBody1 sticky-col sticky-col-1"><div class="team_data_left">${employee.EMPLOYEE_ID}</div></td>
            <td class="columnBody2 sticky-col sticky-col-2"><div class="team_data_left team_mem_name" onclick="getEmpProfileData(this,'${employee.EMAIL_ID}' )">${employee.EMPLOYEE_NAME}</div></td>
            <td><div class="team_data_left">${employee.JOB_ROLE}</div></td>
            <td><div class="${employee.MANAGER_NAME == "" ? "team_data" : "team_data_left"}">${employee.MANAGER_NAME || "-"}</div></td>
            <td style='display: none'><div class="team_data_left">${employee.COUNTRY}</div></td>
            <td><div class="${employee.DEPARTMENT == "" ? "team_data" : "team_data_left"}">${employee.DEPARTMENT}</div></td>
            <td><div class="${accountNames === "-" ? "team_data" : "team_data_left"}">${accountNames}</div></td>
            <td class="col_sow_name">
              <div class="${sowNamesHtml === '-' ? 'team_data' : ''}">${sowNamesHtml}</div>
            </td>
            <td><div class="${billingStatuses === "-" ? "team_data" : "team_data_left"}">${billingStatuses}</div></td>
            <td><div class="team_data utilization_span">${employee.FACT_EXPERIENCE}</div></td>
            <td><div class="team_data utilization_span">${employee.TOTAL_EXPERIENCE}</div></td>
            <td><div title="${noticeDate}" class="team_data">${employee.IN_NOTICE_PERIOD === "YES" ? "In Notice Period" : "Active"}</div></td>
            ${utilizationHtml}
            <td><div class="team_data skills-data">${emp_skill_data}</div></td>
            <td class='col_skill_data_width'><div class="team_data skills-data">${emp_skill_data_new}</div></td>
            <td style="display: none"><div class="team_data">${emp_skill_hide_data}</div></td>
            <td style="display: none">${employee.EMAIL_ID}</td>
            <td class='teams_ytd_current' data-sort="${employee.YTD_UTILIZATION == '-' ? '0' : employee.YTD_UTILIZATION}'}}"><div class="team_data">${employee.YTD_UTILIZATION == '-' ? '0' : employee.YTD_UTILIZATION}</div></td>
            <td class='teams_ytd_current' data-sort="${employee.CURRENT_YEAR_UTILIZATION == '-' ? '0' : employee.CURRENT_YEAR_UTILIZATION}'}"><div class="team_data">${employee.CURRENT_YEAR_UTILIZATION == '-' ? '0' : employee.CURRENT_YEAR_UTILIZATION}</div></td>
            <td class='teams_ytd_future' data-sort="${employee.FUTURE_YEAR_YTD_UTILIZATION == '-' ? '0' : employee.FUTURE_YEAR_YTD_UTILIZATION}'}"><div class="team_data">${employee.FUTURE_YEAR_YTD_UTILIZATION == '-' ? '0' : employee.FUTURE_YEAR_YTD_UTILIZATION}</div></td>
            <td class='teams_ytd_future' data-sort="${employee.FUTURE_YEAR_UTILIZATION == '-' ? '0' : employee.FUTURE_YEAR_UTILIZATION}'}}"><div class="team_data">${employee.FUTURE_YEAR_UTILIZATION == '-' ? '0' : employee.FUTURE_YEAR_UTILIZATION}</div></td>
          </tr>
      `);
    $("#emp_table").append(row);
  });

  const summaries = calculateAndBuildSummaryHtml(emp, shortYear, nextShortYear, allMonths);
  let billedUtilizationHtml = summaries.billed;
  let investmentUtilizationHtml = summaries.investment;
  let benchUtilizationHtml = summaries.bench;

  // Append the footer rows to the table
  // $("#emp_table tbody").append(footerRows);

  // Initialize DataTable
  let rowCount = $("#emp_table tbody tr").length;

  $.fn.dataTable.ext.type.order["experience-pre"] = function (d) {
    // console.log("experience - ", d);
    return experienceToMonths(d);
  };
  // 1) Ordering plug‑in – define BEFORE DataTable init
  // Reads numeric text from a .team_data div (fallback to td text)
  // Returns -Infinity for summary rows so they stay at the end
  $.fn.dataTable.ext.order['dom-div-numeric'] = function (settings, col) {
    var api = new $.fn.dataTable.Api(settings);

    // Grab the TD nodes in the column in display order
    var nodes = api.column(col, { order: 'index' }).nodes();

    // Build the numeric array used for ordering
    var vals = $.map(nodes, function (td, i) {
      var $td = $(td);
      // keep summaries at the end
      if ($td.closest('tr').hasClass('summary-row')) return -Infinity;

      // try .team_data; fallback to full cell text
      var txt = $td.find('.team_data').first().text();
      if (!txt) txt = $td.text();

      // normalize and parse
      var n = parseFloat(String(txt).replace(/[^0-9.\-]/g, '').trim());
      return isNaN(n) ? -Infinity : n;
    });

    // Debug (optional): uncomment to inspect the numbers DataTables will sort by
    // console.log('order col', col, vals);

    return vals;
  };

  // ✅ Custom ID sorting type - Define this BEFORE DataTable initialization
  // $.fn.dataTable.ext.order["id-order"] = function (settings, col) {
  //   return this.api()
  //     .column(col, { order: "index" })
  //     .data()
  //     .map(function (data) {
  //       if (!data) return "";
  //       const match = String(data).match(/^([A-Za-z]*)(\d*)$/);
  //       const alpha = match && match[1] ? match[1] : "";
  //       const num = match && match[2] ? parseInt(match[2], 10) : 0;
  //       return alpha + num.toString().padStart(10, "0"); // Ensures correct numeric ordering
  //     });
  // };


  let disableIndexes = [];
  $("#emp_table thead th").each(function (index) {
    let headerText = $(this).text().trim();
    if (
      headerText.match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i) ||
      headerText.match(/W \d+/i) ||
      $(this).hasClass("week-header")
    ) {
      disableIndexes.push(index);
    }
  });
  $(".weekly-utliz-data").show();
  // Determine number of YTD columns based on selected year
  currentSelectedYear = $("#teams_year").val() || currentSelectedYear; // Use current if not set
  let numYtd = currentSelectedYear === 'all' ? 4 : 2;
  let ytdTargets = Array.from({ length: numYtd }, (_, i) => -(numYtd - i));

  try {
    var table = $("#emp_table").DataTable({
      pageLength: 50,
      paging: false,
      orderCellsTop: true,
      columnDefs: [
        // { orderDataType: "id", targets: 0 }, // Apply custom 'id' sorting to ID column
        { type: "experience", targets: 9 },
        { type: "experience", targets: 10 },
        { orderDataType: 'dom-div-numeric', type: 'num', targets: ytdTargets },
        { orderable: true, targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...ytdTargets] },
        { orderable: false, targets: "_all" },
      ],
      drawCallback: function (settings) {
        var api = this.api();
        var rows = api.rows({ page: "current" }).nodes();

        // Correctly identify filtered data objects from the original 'emp' array
        var filteredEmails = api.rows({ filter: 'applied' }).nodes().toArray().map(tr => $(tr).data('email'));
        var filteredEmpData = emp.filter(e => filteredEmails.indexOf(e.EMAIL_ID) !== -1);

        // Recalculate summary rows based on filtered data
        const currentYearValue = new Date().getFullYear();
        const nextYearValue = getNextYears();
        const sYear = currentYearValue.toString().slice(-2);
        const nsYear = nextYearValue.toString().slice(-2);

        const summaries = calculateAndBuildSummaryHtml(filteredEmpData, sYear, nsYear, allMonths);

        // Remove the last three rows before adding them again
        $(".summary-row").remove();

        // Add summary rows after the last employee row
        $(rows).last().after(summaries.bench);
        $(rows).last().after(summaries.investment);
        $(rows).last().after(summaries.billed);

        // Apply year filter to the newly added summary rows
        const selectedYear = $("#teams_year").val();
        if (selectedYear && selectedYear !== 'all') {
          setTimeout(function () {
            filterTableByYear(selectedYear);
          }, 50);
        } else {
          $(".summary-row td[class*='week_col_main_']").show();
        }
      },
      footerCallback: function (row, data, start, end, display) {
        var api = this.api();
        var info = api.page.info();
        var empCount = api.rows({ page: "current" }).data().length - 3; // Exclude summary rows from count
        $(".dataTables_info").empty();
        $(".dataTables_info").append(
          `Showing 1 to ${empCount} of ${empCount} entries`
        );
      },
    });
  } catch (error) {
    console.error("Error initializing DataTable:", error);
  }

  // Move the DataTables search box into the toolbar search slot to match the Figma layout.
  // The table is rebuilt on every filter change, so re-home the regenerated input each time.
  if ($("#team_toolbar_search").length) {
    const $searchInput = $("#emp_table_filter input")
      .attr("placeholder", "Search")
      .attr("aria-label", "Search");

    // The previous input was moved outside the DataTables wrapper, so destroying
    // the table does not remove it. Replace it when the table is rebuilt instead
    // of appending another search input on every All / IND / USCA toggle.
    $("#team_toolbar_search").empty().append($searchInput);
  }

  $(".dataTables_info").empty();
  $(".dataTables_info").append(
    `Showing 1 to ${emp.length} of ${emp.length} entries`
  );

  // Show/Hide Weekly Columns
  let currYear = new Date().getFullYear();
  let nxtYear = currYear + 1;
  let sYear = currYear.toString().slice(-2);
  let nxtSYear = nxtYear.toString().slice(-2);

  allMonths.forEach((month) => {
    $(`.week_col_${month}_${sYear}`).hide(); // Initially hide weekly columns for current year
    $(`.week_col_${month}_${nxtSYear}`).hide(); // Initially hide weekly columns for next year
  });
  $(".utilization_span i").removeClass("fa-compress").addClass("fa-expand");

  // Ensure summary row month columns are visible after table initialization
  setTimeout(function () {
    $(".summary-row td[class*='week_col_main_']").show();
  }, 100);

  // Toggle weekly columns on click
  // $('.week_col_main_Jan, .week_col_main_Feb, .week_col_main_Mar, .week_col_main_Apr, .week_col_main_May, .week_col_main_Jun, .week_col_main_Jul, .week_col_main_Aug, .week_col_main_Sep, .week_col_main_Oct, .week_col_main_Nov, .week_col_main_Dec').on('click', function () {
  //   let monthName = $(this).attr('class').split(' ')[1].split('_')[3];
  //   $(`.week_col_${monthName}`).toggle();
  // });

  // Handle Errors When Columns Are Missing
  try {
    if ($("#emp_table thead th").length < 12) {
      console.warn(
        "The table has fewer columns than expected. Adjusting layout..."
      );
      // Adjust colspan in the footer rows dynamically
      let footerColspan = $("#emp_table thead th").length - 1; // Exclude the last column
      $("#emp_table tfoot tr td:first-child").attr("colspan", footerColspan);
    }
  } catch (error) {
    console.error("Error handling missing columns:", error);
  }

  // Reapply year filter after table is built
  const selectedYear = $("#teams_year").val();
  if (selectedYear && selectedYear !== 'all') {
    setTimeout(function () {
      filterTableByYear(selectedYear);
    }, 150);
  }
}

function experienceToMonths(experience) {
  // console.log("experience - ", experience);
  let years = 0;
  let months = 0;
  experience = experience.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML tags
  if (experience.includes("Y")) {
    years = parseInt(experience.split("Y")[0]);
    experience = experience.split("Y")[1];
  }
  if (experience.includes("M")) {
    months = parseInt(experience.split("M")[0]);
  }
  return years * 12 + months;
}

function getIndUsEmpData() {
  var selectedVal = "";
  var selected = $("input[type='radio'][name='emp_radio']:checked");
  let level_options = `<option value="-1">All</option><option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option>`;
  syncPersistentTeamFilters();
  if (selected.length > 0) {
    selectedVal = selected.val();
  }
  if (selectedVal == "IND") {
    filterJsonData = [];
    getEmpDataTable(empIndData);
    $("#nameSelect").empty();
    $("#nameSelect").append(empNameOptions);
    $("#jobSelect").empty();
    $("#jobSelect").append(jobNameOptions);
    $("#repMangSelect").empty();
    $("#repMangSelect").append(managerOptions);
    $("#locatSelect").empty();
    $("#locatSelect").append(locationIndOptions);
    $("#funSelect").empty();
    $("#funSelect").append(functionOptions);
    $("#custSelect").empty();
    $("#custSelect").append(custNameOptions);
    $("#SOWSelect").empty();
    $("#SOWSelect").append(sowNameOptions);
    $("#billSelect").empty();
    $("#billSelect").append(billingOptions);
    $("#status").empty();
    $("#status").append(
      `<option value="NO">Active</option><option value="YES">In Notice Period</option>`
    );
    $("#skillSelect").empty();
    $("#skillSelect").append(skill_data_option);
    $("#skillLevelSelect").empty();
    $("#skillLevelSelect").append(level_options);
    $("#skillNewSelect").empty();
    $("#skillNewSelect").append(skill_new_data_option);
    $("#skillNewLevelSelect").empty();
    $("#skillNewLevelSelect").append(level_options);
    callMultiselectOption();
  } else if (selectedVal == "US") {
    filterJsonData = [];
    getEmpDataTable(empUsData);
    $("#nameSelect").empty();
    $("#nameSelect").append(empNameUsOptions);
    $("#jobSelect").empty();
    $("#jobSelect").append(jobNameUsOptions);
    $("#repMangSelect").empty();
    $("#repMangSelect").append(managerUsOptions);
    $("#locatSelect").empty();
    $("#locatSelect").append(locationUsOptions);
    $("#funSelect").empty();
    $("#funSelect").append(functionOptions);
    $("#custSelect").empty();
    $("#custSelect").append(custNameOptions);
    $("#SOWSelect").empty();
    $("#SOWSelect").append(sowNameOptions);
    $("#billSelect").empty();
    $("#billSelect").append(billingOptions);
    $("#status").empty();
    $("#status").append(
      `<option value="NO">Active</option><option value="YES">In Notice Period</option>`
    );
    $("#skillSelect").empty();
    $("#skillSelect").append(skill_data_option);
    $("#skillLevelSelect").empty();
    $("#skillLevelSelect").append(level_options);
    $("#skillNewSelect").empty();
    $("#skillNewSelect").append(skill_new_data_option);
    $("#skillNewLevelSelect").empty();
    $("#skillNewLevelSelect").append(level_options);
    callMultiselectOption();
  } else if (selectedVal == "ALL") {
    filterJsonData = [];
    getEmpDataTable(empAllData);
    $("#nameSelect").empty();
    $("#nameSelect").append(empNameOptions);
    $("#nameSelect").append(empNameUsOptions);
    //jobNameAllOptions
    const jobOptions = parseOptions(jobNameOptions);
    const jobUsOptions = parseOptions(jobNameUsOptions);

    const allJobOptions = jobOptions.concat(jobUsOptions);
    const uniqueJobOptions = Array.from(
      new Set(allJobOptions.map((option) => option.value))
    ).map((value) => allJobOptions.find((option) => option.value === value));

    $("#jobSelect").empty();
    // $('#jobSelect').append(uniqueJobOptions.map(option =>
    //     $('<option>', { value: option.value, text: option.text })
    // ));
    $("#jobSelect").append(jobNameAllOptions);
    $("#repMangSelect").empty();
    $("#repMangSelect").append(managerAllOptions);
    $("#locatSelect").empty();
    $("#locatSelect").append(
      `<option class="emp_option" value="India">India</option><option class="emp_option" value="US">US</option><option class="emp_option" value="Canada">Canada</option>`
    );
    $("#funSelect").empty();
    $("#funSelect").append(functionOptions);
    $("#custSelect").empty();
    $("#custSelect").append(custNameOptions);
    $("#SOWSelect").empty();
    $("#SOWSelect").append(sowNameOptions);
    $("#billSelect").empty();
    $("#billSelect").append(billingOptions);
    $("#status").empty();
    $("#status").append(
      `<option value="NO">Active</option><option value="YES">In Notice Period</option>`
    );
    $("#skillSelect").empty();
    $("#skillSelect").append(skill_data_option);
    $("#skillLevelSelect").empty();
    $("#skillLevelSelect").append(level_options);
    $("#skillNewSelect").empty();
    $("#skillNewSelect").append(skill_new_data_option);
    $("#skillNewLevelSelect").empty();
    $("#skillNewLevelSelect").append(level_options);
    callMultiselectOption();
  }
  applySavedMonthFiltersToUI();

  // Reapply year filter after changing location filter
  const selectedYear = $("#teams_year").val();
  if (selectedYear && selectedYear !== 'all') {
    setTimeout(function () {
      filterTableByYear(selectedYear);
    }, 100);
  }

  filterData(null, { preservePersistentState: true });
}

// Combine and deduplicate job options
function parseOptions(optionString) {
  const div = document.createElement("div");
  div.innerHTML = optionString;
  return Array.from(div.querySelectorAll("option")).map((option) => ({
    value: option.value,
    text: option.innerText,
    html: option.outerHTML,
  }));
}

function getEmpSkillOptions() {
  const startTime = performance.now();
  $.ajax({
    url: apiValue.url_ip + ":5001/all_skills",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      db_name: apiValue.db_name,
      environment: apiValue.environment,
    }),
    success: function (data) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      // getApiTime(
      //   loadTimeInSeconds,
      //   "team",
      //   "Teams",
      //   "all_skills",
      //   "success",
      //   fileName,
      //   "teamsPage",
      //   "view"
      // );
      localStorage.setItem("all-skills-data", JSON.stringify(data));
      $.each(data.Details, function (value, skillsData) {
        skill_new_data_option +=
          '<option value="' +
          skillsData.SKILL_NAME +
          '">' +
          skillsData.SKILL_NAME +
          "</option>";
      });
      $.each(data.SKILLS_PERSONA, function (value, skillsData) {
        skill_data_option +=
          '<option value="' + skillsData + '">' + skillsData + "</option>";
      });
      jobNameArray_IND = data.IND_ROLES.filter(function (el) {
        return el != null;
      });
      jobNameArray_US = data.US_ROLES.filter(function (el) {
        return el != null;
      });
      managerNameArray_IND = data.IND_MANG.filter(function (el) {
        return el != null;
      });
      managerNameArray_US = data.US_MANG.filter(function (el) {
        return el != null;
      });
      functionArray = data.FUNCTIONS.filter(function (el) {
        return el != null;
      });
      empNameArray_IND = data.IND_EMP_NAME.filter(function (el) {
        return el != null;
      });
      empNameArray_US = data.US_EMP_NAME.filter(function (el) {
        return el != null;
      });
      custNameArray = data.CUSTOMERS.filter(function (el) {
        return el != null;
      });
      billArray = data.BILLING_STATUS.filter(function (el) {
        return el != null;
      });
      locationArray = data.LOCATIONS.filter(function (el) {
        return el != null;
      });
      sowNameArray = data.ACTIVE_SOWS.filter(function (el) {
        return el != null;
      });
      // console.log("locationArray - ", locationArray);
      locationArray_IND = locationArray.filter(
        (location) => location === "India" || location === "INDIA"
      );
      locationArray_US = locationArray.filter(
        (location) => location !== "India" && location !== "INDIA"
      );
      for (let i = 0; i < locationArray.length; i++) {
        locationOptions += `<option class="emp_option" value="${locationArray[i]}">${locationArray[i]}</option>`;
      }
      for (let i = 0; i < locationArray_IND.length; i++) {
        locationIndOptions += `<option class="emp_option" value="${locationArray_IND[i]}">${locationArray_IND[i]}</option>`;
      }
      for (let i = 0; i < locationArray_US.length; i++) {
        locationUsOptions += `<option class="emp_option" value="${locationArray_US[i]}">${locationArray_US[i]}</option>`;
      }

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
      let JobAll = [...new Set(jobArr)];
      managerNameArray_IND = managerNameArray_IND.filter(
        (name) => name.trim() !== ""
      );
      managerNameArray_US = managerNameArray_US.filter(
        (name) => name.trim() !== ""
      );
      for (let i = 0; i < managerNameArray_IND.length; i++) {
        managerOptions += `<option class="emp_option" value="${managerNameArray_IND[i]}">${managerNameArray_IND[i]}</option>`;
      }
      for (let i = 0; i < managerNameArray_US.length; i++) {
        managerUsOptions += `<option class="emp_option" value="${managerNameArray_US[i]}">${managerNameArray_US[i]}</option>`;
      }
      for (let i = 0; i < JobAll.length; i++) {
        jobNameAllOptions += `<option class="emp_option" value="${JobAll[i]}">${JobAll[i]}</option>`;
      }
      let arr = [...managerNameArray_IND, ...managerNameArray_US];
      let managerAll = [...new Set(arr)];
      for (let i = 0; i < managerAll.length; i++) {
        managerAllOptions += `<option class="emp_option" value="${managerAll[i]}">${managerAll[i]}</option>`;
      }
      for (let i = 0; i < functionArray.length; i++) {
        functionOptions += `<option class="emp_option" value="${functionArray[i]}">${functionArray[i]}</option>`;
      }
      for (let i = 0; i < custNameArray.length; i++) {
        custNameOptions += `<option class="emp_option" value="${custNameArray[i]}">${custNameArray[i]}</option>`;
      }
      for (let i = 0; i < sowNameArray.length; i++) {
        sowNameOptions += `<option class="emp_option" value="${sowNameArray[i]}">${sowNameArray[i]}</option>`;
        // console.log("jobNameOptions",jobNameOptions);
      }
      for (let i = 0; i < billArray.length; i++) {
        billingOptions += `<option class="emp_option" value="${billArray[i]}">${billArray[i]}</option>`;
      }
      $("#SOWSelect").append(sowNameOptions);
      $("#skillSelect").append(skill_data_option);
      $("#skillNewSelect").append(skill_new_data_option);
      $("#nameSelect").append(empNameOptions);
      $("#nameSelect").append(empNameUsOptions);
      var jobNameOptionsArray = $(jobNameOptions).toArray();
      var jobNameUsOptionsArray = $(jobNameUsOptions).toArray();
      var allJobOptions = jobNameOptionsArray.concat(jobNameUsOptionsArray);
      // console.log("allJobOptions",allJobOptions);

      var uniqueJobOptions = Array.from(
        new Set(allJobOptions.map((option) => option.value))
      ).map((value) => allJobOptions.find((option) => option.value === value));
      // console.log("uniqueJobOptions",uniqueJobOptions);
      $("#jobSelect").empty();
      // $("#jobSelect").append(jobNameOptions);
      // $('#jobSelect').append(uniqueJobOptions.map(option =>
      //     $('<option>', { value: option.value, text: option.text })
      // ));
      $("#jobSelect").append(jobNameAllOptions);
      $("#repMangSelect").empty();
      $("#repMangSelect").append(managerAllOptions);
      // $("#repMangSelect").append(managerUsOptions);
      $("#locatSelect").empty();
      $("#funSelect").empty();
      $("#custSelect").empty();
      $("#SOWSelect").empty();
      $("#billSelect").empty();
      $("#locatSelect").append(locationOptions);
      $("#funSelect").append(functionOptions);
      $("#custSelect").append(custNameOptions);
      $("#SOWSelect").append(sowNameOptions);
      $("#billSelect").append(billingOptions);
      callMultiselectOption();
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      // getApiTime(
      //   loadTimeInSeconds,
      //   "team",
      //   "Teams",
      //   "all_skills",
      //   "error",
      //   fileName,
      //   "teamsPage",
      //   "view"
      // );
      console.log("message Error" + JSON.stringify(error));
    },
  });
}

let firstSelectFilter = "";
$(function () {
  $("#skillSelect").change(function (e) {
    filterData(e);
    sortSelectedOptions('ms-list-1', "skillSelect", 'Persona');
  });
  $("#skillNewSelect").change(function (e) {
    filterData(e);
    sortSelectedOptions('ms-list-2', "skillNewSelect", 'Skills');
  });

  $("#nameSelect").change(function (e) {
    firstSelectFilter = "nameSelect";
    filterData(e);
    sortSelectedOptions('ms-list-3', "nameSelect", "Name");
  });

  $("#jobSelect").change(function (e) {
    firstSelectFilter = "jobSelect";
    filterData(e);
    sortSelectedOptions('ms-list-4', "jobSelect", "Job");
  });

  $("#repMangSelect").change(function (e) {
    firstSelectFilter = "repMangSelect";
    filterData(e);
    sortSelectedOptions('ms-list-5', "repMangSelect", "Manager");
  });

  $("#locatSelect").change(function (e) {
    firstSelectFilter = "locatSelect";
    filterData(e);
    sortSelectedOptions('ms-list-6', "locatSelect", "Location");
  });

  $("#funSelect").change(function (e) {
    firstSelectFilter = "funSelect";
    filterData(e);
    sortSelectedOptions('ms-list-7', "funSelect", "Function");
  });

  $("#custSelect").change(function (e) {
    firstSelectFilter = "custSelect";
    filterData(e);
    sortSelectedOptions('ms-list-8', "custSelect", "Customer");
  });

  $("#SOWSelect").change(function (e) {
    firstSelectFilter = "SOWSelect";
    filterData(e);
    sortSelectedOptions('ms-list-9', "SOWSelect", "SOW Name");
  });

  $("#billSelect").change(function (e) {
    firstSelectFilter = "billSelect";
    filterData(e);
    sortSelectedOptions('ms-list-10', "billSelect", "Billing");
  });

  $("#skillLevelSelect").change(function (e) {
    firstSelectFilter = "skillLevelSelect";
    filterData(e);
  });
  $("#skillNewLevelSelect").change(function (e) {
    firstSelectFilter = "skillNewLevelSelect";
    filterData(e);
  });
  $("#status").change(function (e) {
    firstSelectFilter = "status";
    filterData(e);
    sortSelectedOptions('ms-list-11', "status", "Status");
  });
});

function filterData(e, options = {}) {
  if (!options.preservePersistentState) {
    syncPersistentTeamFilters();
  }
  // Cache jQuery selectors to avoid repeated DOM queries
  const $selects = {
    name: $("#nameSelect"),
    job: $("#jobSelect"),
    manager: $("#repMangSelect"),
    location: $("#locatSelect"),
    function: $("#funSelect"),
    customer: $("#custSelect"),
    sow: $("#SOWSelect"),
    billing: $("#billSelect"),
    skill: $("#skillSelect"),
    skillData: $("#skillNewSelect"),
    status: $("#status")
  };

  // Get all filter values at once
  const filters = {
    name: $selects.name.val() || [],
    job: $selects.job.val() || [],
    manager: $selects.manager.val() || [],
    location: $selects.location.val() || [],
    function: $selects.function.val() || [],
    customer: $selects.customer.val() || [],
    sow: $selects.sow.val() || [],
    billing: $selects.billing.val() || [],
    skill: $selects.skill.val() || [],
    skillData: $selects.skillData.val() || [],
    status: $selects.status.val() || []
  };

  // Parse skill level once
  const levelData = $("#skillLevelSelect").val();
  const LevelFilterData = levelData === "-1" ? [] : levelData.split(" ");
  // Parse skill level once
  const levelNewData = $("#skillNewLevelSelect").val();
  console.log("levelNewData - ", levelNewData);
  const LevelNewFilterData = levelNewData === "-1" ? [] : levelNewData.split(" ");

  // Get selected radio value once
  const selectedVal = $("input[type='radio'][name='emp_radio']:checked").val() || "ALL";

  // Select the appropriate data source once
  let filterJsonData;
  if (selectedVal === "IND") {
    filterJsonData = [...empIndData];
  } else if (selectedVal === "US") {
    filterJsonData = [...empUsData];
  } else {
    filterJsonData = [...empAllData];
  }

  // Apply filters efficiently
  let filterLen = false;
  let newJson = filterJsonData;

  // Apply manager filter (special case)
  if (filters.manager.length > 0) {
    const managerIds = filterJsonData
      .filter(emp => filters.manager.includes(emp.MANAGER_NAME))
      .map(emp => emp.MANAGER_ID);

    const reporteeIds = filterJsonData
      .filter(emp => managerIds.includes(emp.EMPLOYEE_ID))
      .flatMap(emp => emp.REPORTEES);

    if (reporteeIds.length > 0) {
      newJson = filterJsonData.filter(emp => reporteeIds.includes(emp.EMPLOYEE_ID));
    } else {
      const directManagers = newJson.filter(d =>
        filters.manager.some(f => d.MANAGER_NAME.trim() === f.trim())
      );

      const allIds = new Set([
        ...directManagers.map(emp => emp.EMPLOYEE_ID),
        ...directManagers.flatMap(emp => emp.REPORTEES)
      ]);

      newJson = filterJsonData.filter(emp => allIds.has(emp.EMPLOYEE_ID));
    }
    filterLen = true;
  }

  // Helper function for common filtering logic
  const applyFilter = (data, field, property, exactMatch = true) => {
    if (filters[field].length === 0) return data;

    filterLen = true;
    return data.filter(d => {
      if (exactMatch) {
        return filters[field].some(f => d[property] === f);
      } else {
        return filters[field].some(f =>
          d[property].toLowerCase().includes(f.toLowerCase())
        );
      }
    });
  };

  // Apply skill persona filter
  if (filters.skill.length > 0) {
    newJson = newJson.filter(d =>
      filters.skill.some(f => d.SKILLS_PERSONA && d.SKILLS_PERSONA.includes(f))
    );
    filterLen = true;
  }

  //Apply skill Data filter
  // skillData
  // if (filters.skillData.length > 0) {
  //   newJson = newJson.filter(d =>
  //     filters.skillData.some(skill =>
  //       d.SKILLS_LEVEL.some(empSkill => {
  //         if (LevelNewFilterData.length === 0 || LevelNewFilterData.includes("-1")) {
  //           // No level filter selected (or "All" selected), match just by skill name
  //           return empSkill.toLowerCase().includes(skill.toLowerCase());
  //         } else {
  //           // Level filter selected, match both skill and level
  //           return LevelNewFilterData.some(level =>
  //             empSkill.toLowerCase() === `${skill.toLowerCase()}-${level.toLowerCase()}`
  //           );
  //         }
  //       })
  //     )
  //   );
  //   filterLen = true;
  // }
  if (filters.skillData.length > 0) {
    newJson = newJson.filter(d => {
      const employeeSkills = d.SKILLS_LEVEL && d.SKILLS_LEVEL.map(skill => skill.toLowerCase()) || [];

      return filters.skillData.every(skill => {
        const skillLower = skill.toLowerCase();

        if (LevelNewFilterData.length === 0 || LevelNewFilterData.includes("-1")) {
          // No level selected: Check if any empSkill starts with the skill name
          return employeeSkills.some(empSkill => empSkill.startsWith(skillLower));
        } else {
          // Level selected: require exact skill-level match (e.g., "sql server-r1")
          return LevelNewFilterData.some(level =>
            employeeSkills.includes(`${skillLower}-${level.toLowerCase()}`)
          );
        }
      });
    });

    filterLen = true;
  }

  // ----- SOW/Account/Billing Multi-select Filter -----
  // This block REPLACES any logic you had for filtering on account/SOW/billing fields!
  if (filters.sow.length > 0 || filters.billing.length > 0 || filters.customer.length > 0) {
    newJson = newJson.filter(emp => {
      const sows = emp.SOW_DETAILS || [];
      // Always .trim() before compare
      const sowMatch =
        filters.sow.length === 0 ||
        sows.some(sow =>
          filters.sow.includes((sow.SOW_NAME || "").trim())
        );
      const billingMatch =
        filters.billing.length === 0 ||
        sows.some(sow =>
          filters.billing.includes((sow.BILLING_STATUS || "").trim())
        );
      const accountMatch =
        filters.customer.length === 0 ||
        sows.some(sow =>
          filters.customer.includes((sow.ACCOUNT_NAME || "").trim())
        );
      return sowMatch && billingMatch && accountMatch;
    });
    filterLen = true;
  }


  console.log("multi-select filter", newJson);


  // Apply remaining filters
  newJson = applyFilter(newJson, 'name', 'EMPLOYEE_NAME');
  newJson = applyFilter(newJson, 'job', 'JOB_ROLE');
  newJson = applyFilter(newJson, 'location', 'COUNTRY', false);
  newJson = applyFilter(newJson, 'function', 'DEPARTMENT');
  // newJson = applyFilter(newJson, 'customer', 'ACCOUNT_NAME');
  // newJson = applyFilter(newJson, 'sow', 'SOW_NAME');
  // newJson = applyFilter(newJson, 'billing', 'BILLING_STATUS');
  newJson = applyFilter(newJson, 'status', 'IN_NOTICE_PERIOD');
  // newJson = applyFilter(newJson, 'skill', 'SKILLS_PERSONA');

  // Apply bench threshold filters
  if (globalCheckedValues.length > 0) {
    newJson = newJson.filter(employee =>
      globalCheckedValues.every(({ month, thresholds }) => {
        const matchingEntry = employee.UTILIZATION_DATA.find(entry =>
          entry.MONTH_YEAR === month
        );

        if (!matchingEntry) return false; // Skip if no matching entry
        return thresholds.some(threshold =>
          matchingEntry.Investment >= threshold
          || matchingEntry.Bench >= threshold
        );
      })
    );
    filterLen = true;
  }

  // Update table and store filtered data
  getEmpDataTable(newJson, e);
  filterApplyJson = newJson;
  // --- Update available filter options for dropdowns ---
  // updateTeamFilterOptions(newJson);

  // Handle filter reset logic
  if (firstSelectFilter !== "") {
    const lenOfSelFilter = $("#" + firstSelectFilter).val().length;
    let checkFilterData = true;

    // Check if any filter is active
    Object.values(filters).forEach(filterArray => {
      if (filterArray.length > 0) {
        checkFilterData = false;
      }
    });

    if (lenOfSelFilter === 0 && checkFilterData) {
      firstSelectFilter = "";
      $("#nameSelect").empty();
      $("#nameSelect").append(empNameOptions);
      $("#nameSelect").append(empNameUsOptions);
      $("#jobSelect").empty();
      $("#jobSelect").append(jobNameAllOptions);
      $("#repMangSelect").empty();
      $("#repMangSelect").append(managerAllOptions);
      $("#locatSelect").empty();
      $("#locatSelect").append(locationOptions);
      $("#funSelect").empty();
      $("#funSelect").append(functionOptions);
      $("#custSelect").empty();
      $("#custSelect").append(custNameOptions);
      $("#SOWSelect").empty();
      $("#SOWSelect").append(sowNameOptions);
      $("#billSelect").empty();
      $("#billSelect").append(billingOptions);
      $("#skillSelect").empty();
      $("#skillSelect").append(skill_data_option);
      $("#skillLevelSelect").empty();
      $("#skillLevelSelect").append(
        `<option value="-1">All</option><option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option>`
      );
      $("#skillNewSelect").empty();
      $("#skillNewSelect").append(skill_data_option);
      $("#skillNewLevelSelect").empty();
      $("#skillNewLevelSelect").append(
        `<option value="-1">All</option><option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option>`
      );
      $("#status").empty();
      $("#status").append(
        `<option value="NO">Active</option><option value="YES">In Notice Period</option>`
      );
      callMultiselectOption();
    } else {
      // This is the critical line that calls reassignFilterOption
      reassignFilterOption(firstSelectFilter);
    }
  }
}

function updateTeamFilterOptions(filteredData) {
  // Compose Sets for unique options in filtered dataset
  const allSows = new Set();
  const allBillings = new Set();
  const allAccounts = new Set();

  filteredData.forEach(emp => {
    (emp.SOW_DETAILS || []).forEach(sow => {
      if (sow.SOW_ID) allSows.add(sow.SOW_NAME);
      if (sow.BILLING_STATUS) allBillings.add(sow.BILLING_STATUS);
      if (sow.ACCOUNT_ID) allAccounts.add(sow.ACCOUNT_NAME);
    });
  });

  // Regenerate dropdowns (sort for usability)
  $("#SOWSelect")
    .html(Array.from(allSows).sort().map(val => `<option value="${val}">${val}</option>`).join(''))
    .multiselect('reload');
  $("#billSelect")
    .html(Array.from(allBillings).sort().map(val => `<option value="${val}">${val}</option>`).join(''))
    .multiselect('reload');
  $("#custSelect")
    .html(Array.from(allAccounts).sort().map(val => `<option value="${val}">${val}</option>`).join(''))
    .multiselect('reload');
}



// Helper function to reset all filters
function resetAllFilters() {
  $("#nameSelect").empty().append(empNameOptions).append(empNameUsOptions);
  $("#jobSelect").empty().append(jobNameAllOptions);
  $("#repMangSelect").empty().append(managerAllOptions);
  $("#locatSelect").empty().append(locationOptions);
  $("#funSelect").empty().append(functionOptions);
  $("#custSelect").empty().append(custNameOptions);
  $("#SOWSelect").empty().append(sowNameOptions);
  $("#billSelect").empty().append(billingOptions);
  $("#skillSelect").empty().append(skill_data_option);
  $("#skillLevelSelect").empty().append(
    `<option value="-1">All</option><option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option>`
  );
  $("#skillNewSelect").empty().append(skill_new_data_option);
  $("#skillNewLevelSelect").empty().append(
    `<option value="-1">All</option><option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option>`
  );
  $("#status").empty().append(
    `<option value="NO">Active</option><option value="YES">In Notice Period</option>`
  );
}




function extractUniqueSowField(filteredData, field) {
  const set = new Set();
  filteredData.forEach(emp => {
    (emp.SOW_DETAILS || []).forEach(sow => {
      if (sow[field] && sow[field].trim() !== '') {
        set.add(sow[field]);
      }
    });
  });
  // Return as sorted array
  return Array.from(set).sort();
}


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
        newFilJson = filterJsonData.filter((d) => {
          const flag = FilteredNewJson.some((f) => {
            const innerFlag =
              d.ALL_SKILLS.indexOf(f) != -1 &&
              (LevelFilterData.length == 0
                ? true
                : LevelFilterData.some(
                  (ff) =>
                    d.SKILL_DATA.map(
                      (dd) => dd.SKILL + " - " + dd.LEVEL
                    ).indexOf(f + " - " + ff) != -1
                ));
            return innerFlag;
          });
          return flag;
        });
      } else {
        newFilJson = filterJsonData.filter((d) => {
          const flag = FilteredNewJson.some((f) => {
            const innerFlag = d.ALL_SKILLS.indexOf(f) != -1;
            return innerFlag;
          });
          return flag;
        });
      }
      getEmpDataTable(newFilJson);
    } else if (selectedVal == "US") {
      let newFilJson = [];
      if (LevelFilterData.length > 0) {
        newFilJson = filterJsonData.filter((d) => {
          const flag = FilteredNewJson.some((f) => {
            const innerFlag =
              d.ALL_SKILLS.indexOf(f) != -1 &&
              (LevelFilterData.length == 0
                ? true
                : LevelFilterData.some(
                  (ff) =>
                    d.SKILL_DATA.map(
                      (dd) => dd.SKILL + " - " + dd.LEVEL
                    ).indexOf(f + " - " + ff) != -1
                ));
            return innerFlag;
          });
          return flag;
        });
      } else {
        newFilJson = filterJsonData.filter((d) => {
          const flag = FilteredNewJson.some((f) => {
            const innerFlag = d.ALL_SKILLS.indexOf(f) != -1;
            return innerFlag;
          });
          return flag;
        });
      }
      getEmpDataTable(newFilJson);
    } else if (selectedVal == "ALL") {
      let newFilJson = [];
      if (LevelFilterData.length > 0) {
        newFilJson = filterJsonData.filter((d) => {
          const flag = FilteredNewJson.some((f) => {
            const innerFlag =
              d.ALL_SKILLS.indexOf(f) != -1 &&
              (LevelFilterData.length == 0
                ? true
                : LevelFilterData.some(
                  (ff) =>
                    d.SKILL_DATA.map(
                      (dd) => dd.SKILL + " - " + dd.LEVEL
                    ).indexOf(f + " - " + ff) != -1
                ));
            return innerFlag;
          });
          return flag;
        });
      } else {
        newFilJson = filterJsonData.filter((d) => {
          const flag = FilteredNewJson.some((f) => {
            const innerFlag = d.ALL_SKILLS.indexOf(f) != -1;
            return innerFlag;
          });
          return flag;
        });
      }
      getEmpDataTable(newFilJson);
    }
  } else {
    if (selectedVal == "IND") {
      getEmpDataTable(empIndData);
    } else if (selectedVal == "US") {
      getEmpDataTable(empUsData);
    } else if (selectedVal == "ALL") {
      getEmpDataTable(empAllData);
    }
  }
}

function uniqueArray(arrayData) {
  let uniqueListArray = arrayData.filter((c, index) => {
    return arrayData.indexOf(c) === index;
  });
  return uniqueListArray;
}

function sortSelectedOptions(optId, selectedOpt, selectPlaceholder) {
  moveSelectedOptionsToTop(selectedOpt);
  const $select = $("#" + selectedOpt);
  const selectedOptions = $select.find("option:selected").get();
  addSelectedUserListBlock(optId, selectedOptions, selectedOpt, selectPlaceholder);
  updateSelectedCount(optId, selectedOpt, selectPlaceholder);
  syncMultiselectDropdownState(selectedOpt);
  reorderMultiselectListUI(selectedOpt);
}

function addSelectedUserListBlock(dropdownId, selectedOptData, selectedOpt, selectPlaceholder) {
  let selectedOptionVal = selectedOptData.map(opt => opt.value);

  // Find the dropdown container using the given ID
  let $dropdown = $("#" + dropdownId);

  // Locate the 'ms-search' div within the dropdown container
  let $searchDiv = $dropdown.find(".ms-search");

  // Check if the search div exists
  if ($searchDiv.length === 0) {
    console.error("Search div not found for dropdown ID:", dropdownId);
    return;
  }

  // Check if selected tags container already exists
  let $existingTags = $dropdown.find("#selected-tags-container-" + selectedOpt);
  if ($existingTags.length > 0) {
    $existingTags.remove();
  }

  // Check if there are any selected options
  if (!selectedOptData || selectedOptData.length === 0) {
    return; // Exit the function early if no options selected
  }

  // Create container for selected tags
  let $tagsContainer = $("<div>")
    .attr("id", "selected-tags-container-" + selectedOpt)
    .css({
      "display": "flex",
      "flex-wrap": "wrap",
      "gap": "5px",
      "margin-bottom": "0px",
      "margin-top": "0px",
      "max-height": "80px",
      "overflow": "auto",
      "position": "sticky",
      "top": "25px",
      "background-color": "white",
      "z-index": "9",
      "padding": "8px 3px",
      "border-bottom": "1px solid #f2f2f2"
    });

  // Remove duplicates from selectedOptionVal
  let uniqueSelectedOptions = [...new Set(selectedOptionVal)];

  // Create tags for each unique selected option
  uniqueSelectedOptions.forEach((opt) => {
    if (opt == "NO") {
      opt = "Active";
    }
    if (opt == "YES") {
      opt = "In Notice Period";
    }
    let $tag = $("<div>")
      .text(opt)
      .css({
        "background-color": "#313265",
        "color": "white",
        "border-radius": "20px",
        "padding": "0px 5px",
        "display": "flex",
        "align-items": "center",
        "font-size": "9px"
      });

    // Add close button
    let $closeBtn = $("<span>")
      .html(" ×")
      .css({
        "margin-left": "5px",
        "cursor": "pointer",
        "font-weight": "bold",
        "font-size": "16px"
      })
      .on("click", function (event) {
        event.preventDefault(); // Prevent default action that might close the dropdown
        event.stopPropagation(); // Stop event propagation that might trigger close behavior
        if (opt == "Active") {
          opt = "NO";
        }
        if (opt == "In Notice Period") {
          opt = "YES";
        }

        // Remove this option from selection in the dropdown
        let $select = $("#" + dropdownId.replace("ms-list-", ""));

        // Find the option element and deselect it
        let $optionToDeselect = $select.find(`option[value="${opt}"]`);
        $optionToDeselect.prop("selected", false);

        // Find and update the corresponding list item in the dropdown
        let $listItem = $dropdown.find(`li[data-search-term="${opt.toLowerCase()}"]`);
        $listItem.removeClass("selected");

        // Find and uncheck the checkbox
        let $checkbox = $listItem.find('input[type="checkbox"]');
        $checkbox.prop("checked", false);

        // Update the selectedOpt input field if provided
        if (selectedOpt) {
          let $selectedInput = $("#" + selectedOpt);
          let currentValues = $selectedInput.val() || [];

          // If currentValues is not an array, convert it to one
          if (!Array.isArray(currentValues)) {
            currentValues = [currentValues];
          }

          // Remove the deselected value
          let updatedValues = currentValues.filter(value => value !== opt);

          // Update the input
          $selectedInput.val(updatedValues);
        }

        // Remove the tag from UI
        $(this).parent().remove();

        // If no tags left, remove the container
        if ($tagsContainer.children().length === 0) {
          $tagsContainer.remove();
        }

        // Trigger change events AFTER all updates
        $select.trigger("change");
        if (selectedOpt) {
          $("#" + selectedOpt).trigger("change");
        }

        // Force refresh the multiselect UI
        setTimeout(function () {
          $dropdown.find(`li[data-search-term="${opt.toLowerCase()}"] input[type='checkbox']`).prop("checked", false);
          $dropdown.find(`li[data-search-term="${opt.toLowerCase()}"]`).removeClass("selected");
          if (opt == "NO") {
            opt = "Active";
            $dropdown.find(`li[data-search-term="${opt.toLowerCase()}"] input[type='checkbox']`).prop("checked", false);
            $dropdown.find(`li[data-search-term="${opt.toLowerCase()}"]`).removeClass("selected");
          }
          if (opt == "YES") {
            opt = "In Notice Period";
            $dropdown.find(`li[data-search-term="${opt.toLowerCase()}"] input[type='checkbox']`).prop("checked", false);
            $dropdown.find(`li[data-search-term="${opt.toLowerCase()}"]`).removeClass("selected");
          }
          // Update the count of selected items
          updateSelectedCount(dropdownId, selectedOpt, selectPlaceholder);
        }, 50);
      });

    $tag.append($closeBtn);
    $tagsContainer.append($tag);
  });

  // Insert the tags container after the search div
  $searchDiv.after($tagsContainer);

  // Set up change event handler for the select element
  let $select = $("#" + dropdownId.replace("ms-list-", ""));
  $select.off("change.selectedTags").on("change.selectedTags", function () {
    let updatedSelectedOptions = $(this).find("option:selected").map(function () {
      return { value: $(this).val(), text: $(this).text() };
    }).get();

    addSelectedUserListBlock(dropdownId, updatedSelectedOptions, selectedOpt, selectPlaceholder);
  });

  // Handle Cancel button click
  let $cancelButton = $dropdown.find("button:contains('Cancel')");

  $cancelButton.off("click").on("click", function (event) {
    event.preventDefault(); // Prevent default action that might close the dropdown
    event.stopPropagation(); // Stop event propagation that might trigger close behavior

    // Clear all selections in the dropdown
    let $select = $("#" + dropdownId.replace("ms-list-", ""));
    // Deselect all options in the <select> element
    $select.find("option").prop("selected", false);

    // Update the selectedOpt input field if provided
    if (selectedOpt) {
      $("#" + selectedOpt).val([]); // Clear the hidden input field
    }

    // Remove all tags from the UI
    if ($tagsContainer) {
      $tagsContainer.empty().remove();
    }

    // Trigger change event on the <select> element
    $select.trigger("change");

    // Force update the multiselect plugin's UI
    setTimeout(function () {
      // Uncheck all checkboxes and remove 'selected' class from list items
      $dropdown.find("li").removeClass("selected");
      $dropdown.find("li input[type='checkbox']").prop("checked", false);

      // Reinitialize or refresh the multiselect plugin if it has such a method
      if ($.fn.multiselect && $select.data('multiselect')) {
        $select.multiselect('refresh'); // Refresh the plugin's state
      }

      // Close the dropdown if needed
      $dropdown.removeClass("ms-has-selections");

      // Update the count of selected items
      updateSelectedCount(dropdownId, selectedOpt, selectPlaceholder);
    }, 50);
  });

  // Initial call to set the selected count
  updateSelectedCount(dropdownId, selectedOpt, selectPlaceholder);
}

// Function to update the count of selected items in the dropdown header
function updateSelectedCount(dropdownId, selectedOpt, selectPlaceholder) {
  let selectedCount = $('#' + selectedOpt).find("option:selected").length;
  // Find the count display button and update its text
  if (selectedCount > 0) {
    $('#' + dropdownId + ' button').text(`${selectedCount} selected`);
  } else {
    $('#' + dropdownId + ' button').text(`${selectPlaceholder}`);
  }
}


function callMultiselectOption() {
  applyPersistentTeamFiltersToControls();
  getTeamFilterPresentationConfig().forEach(({ selectId }) => {
    moveSelectedOptionsToTop(selectId);
  });

  $("#skillSelect").multiselect("reload");
  $("#skillSelect").multiselect({
    columns: 1,
    placeholder: "Persona",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-1", "Persona", "skillSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-1", "Persona", "skillSelect");
    },
  });
  $("#skillNewSelect").multiselect("reload");
  $("#skillNewSelect").multiselect({
    columns: 1,
    placeholder: "Skills",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-2", "Skills", "skillNewSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-2", "Skills", "skillNewSelect");
    },
  });
  $("#startDate").multiselect({
    columns: 1,
    placeholder: "Start Date",
    search: true,
  });
  $("#endDate").multiselect({
    columns: 1,
    placeholder: "End Date",
    search: true,
  });
  $("#nameSelect").multiselect("reload");
  $("#nameSelect").multiselect({
    columns: 1,
    placeholder: "Name",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-3", "Name", "nameSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-3", "Name", "nameSelect");
    },
  });
  $("#jobSelect").multiselect("reload");
  $("#jobSelect").multiselect({
    columns: 1,
    placeholder: "Job",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-4", "Job", "jobSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-4", "Job", "jobSelect");
    },
  });
  $("#repMangSelect").multiselect("reload");
  // $('#repMangSelect').multiselect({
  //     columns: 1,
  //     placeholder: 'Manager',
  //     search: true
  // });
  $("#repMangSelect").multiselect({
    columns: 1,
    placeholder: "Manager",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-5", "Manager", "repMangSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-5", "Manager", "repMangSelect");
    },
  });
  $("#locatSelect").multiselect("reload");
  $("#locatSelect").multiselect({
    columns: 1,
    placeholder: "Location",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-6", "Location", "locatSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-6", "Location", "locatSelect");
    },
  });
  $("#funSelect").multiselect("reload");
  $("#funSelect").multiselect({
    columns: 1,
    placeholder: "Function",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-7", "Function", "funSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-7", "Function", "funSelect");
    },
  });
  $("#custSelect").multiselect("reload");
  $("#custSelect").multiselect({
    columns: 1,
    placeholder: "Customer",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-8", "Customer", "custSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-8", "Customer", "custSelect");
    },
  });
  $("#SOWSelect").multiselect("reload");
  $("#SOWSelect").multiselect({
    columns: 1,
    placeholder: "SOW Name",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-9", "SOW Name", "SOWSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-9", "SOW Name", "SOWSelect");
    },
  });
  $("#billSelect").multiselect("reload");
  $("#billSelect").multiselect({
    columns: 1,
    placeholder: "Billing",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-10", "Billing", "billSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-10", "Billing", "billSelect");
    },
  });
  $("#status").multiselect("reload");
  $("#status").multiselect({
    columns: 1,
    placeholder: "Status",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-11", "Status", "status");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-11", "Status", "status");
    },
  });

  refreshPersistentTeamFilterUI();
  rebuildTeamFilterPresentation();
  syncAllTeamMultiselectDropdownStates();
}

function tootTipRole(temp) {
  let emp_name = "";
  $.each(temp, function () {
    let role = "";
    let total = "";
    $.each(this, function (name, value) {
      if (name == "ROLE") {
        role = value;
        role = role.replace(/[_\s]/g, " ");
      }
      if ((name = "TOTAL")) {
        total = value;
      }
    });
    if (total > 0) {
      emp_name = emp_name + `<li>${role} - ( ${total} )</li>`;
    }
  });
  return `<span class='spnTooltip'>
                    <ul>${emp_name}<ul>
              </span>`;
}

function getEmpProfileData(obj, email) {
  // console.log("email - ", email);
  var employee_id = $(obj).closest("tr").children("td:eq(0)").text();
  localStorage.setItem("employee_id_data", employee_id);
  localStorage.setItem("employee_email_data", email);
  window.open("team-profile.html", "_blank");
  // window.location.href = "team-profile.html";
}

function removeDuplicates(namesUnique) {
  if (namesUnique.endsWith(",")) {
    namesUnique = namesUnique.slice(0, -1);
  }
  let uniueList = namesUnique.split(",");
  uniueList = [...new Set(uniueList)];
  removeItemAll(uniueList, "-");
  removeItemAll(uniueList, "undefined");
  removeItemAll(uniueList, "");
  let opt = "";
  $.each(uniueList, function (i, list) {
    if (list == "Active") {
      opt += `<option value="NO">${list}</option>`;
    } else if (list == "In Notice Period") {
      opt += `<option value="YES">${list}</option>`;
    } else {
      opt += `<option value="${list}">${list}</option>`;
    }
  });
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


function reassignFilterOption(selectedFilterCol) {
  // Cache jQuery selectors
  const $selects = {
    name: $("#nameSelect"),
    job: $("#jobSelect"),
    manager: $("#repMangSelect"),
    location: $("#locatSelect"),
    function: $("#funSelect"),
    customer: $("#custSelect"),
    sow: $("#SOWSelect"),
    billing: $("#billSelect"),
    status: $("#status"),
    skill: $("#skillSelect"),
    // skillData: $("#skillNewSelect")
  };

  // Get current filter values
  const filterValues = {
    name: $selects.name.val() || [],
    job: $selects.job.val() || [],
    manager: $selects.manager.val() || [],
    location: $selects.location.val() || [],
    function: $selects.function.val() || [],
    customer: $selects.customer.val() || [],
    sow: $selects.sow.val() || [],
    billing: $selects.billing.val() || [],
    status: $selects.status.val() || [],
    skill: $selects.skill.val() || [],
    // skillData: $selects.skillData.val() || []
  };

  // Use Sets for efficient unique value collection
  const tableData = {
    name: new Set(),
    job: new Set(),
    manager: new Set(),
    location: new Set(),
    function: new Set(),
    customer: new Set(),
    sow: new Set(),
    billing: new Set(),
    status: new Set(),
    skill: new Set(),
    // skillData: new Set()
  };

  // Helper function to extract comma-separated values from text
  function extractCommaValues(text) {
    if (!text || text === "-") return [];
    return text.split(",").map(item => item.trim()).filter(item => item);
  }

  // Helper function to extract SOW values from multiple divs
  function extractSowValues(sowCell) {
    const sowValues = [];
    const sowLinks = sowCell.find(".sow-link");

    if (sowLinks.length > 0) {
      sowLinks.each(function () {
        const text = $(this).text().trim();
        if (text) {
          sowValues.push(text);
        }
      });
    } else {
      // Handle case where there's no sow-link class (like the "-" case)
      const text = sowCell.text().trim();
      if (text && text !== "-") {
        sowValues.push(text);
      }
    }

    return sowValues;
  }

  // Single pass through table rows to collect all values
  $("#emp_table tbody tr").each(function () {
    const cells = $(this).find("td>div");
    if (cells.length > 0) {
      tableData.name.add(cells.eq(1).html() === "-" ? "" : cells.eq(1).html());
      tableData.job.add(cells.eq(2).html() === "-" ? "" : cells.eq(2).html());
      tableData.manager.add(cells.eq(3).html() === "-" ? "" : cells.eq(3).html());
      tableData.location.add(cells.eq(4).html() === "-" ? "" : cells.eq(4).html());
      tableData.function.add(cells.eq(5).html() === "-" ? "" : cells.eq(5).html());

      // Customer (Account) - extract comma-separated values
      const customerText = cells.eq(6).text().trim();
      const customerValues = extractCommaValues(customerText);
      if (customerValues.length > 0) {
        customerValues.forEach(value => tableData.customer.add(value));
      } else if (customerText && customerText !== "-") {
        tableData.customer.add(customerText);
      }

      // SOW - extract from multiple divs
      const sowCell = $(this).find("td.col_sow_name");
      if (sowCell.length > 0) {
        const sowValues = extractSowValues(sowCell);
        sowValues.forEach(value => tableData.sow.add(value));
      } else {
        // Fallback to original logic if col_sow_name class not found
        const sowText = cells.eq(7).text().trim();
        if (sowText && sowText !== "-") {
          tableData.sow.add(sowText);
        }
      }

      // Billing - extract comma-separated values
      const billingText = cells.eq(8).text().trim();
      const billingValues = extractCommaValues(billingText);
      if (billingValues.length > 0) {
        billingValues.forEach(value => tableData.billing.add(value));
      } else if (billingText && billingText !== "-") {
        tableData.billing.add(billingText);
      }

      tableData.status.add(cells.eq(11).html() === "-" ? "" : cells.eq(11).html());
      tableData.skill.add(cells.eq(-5).html() === "-" ? "" : cells.eq(-5).html());
      // tableData.skillData.add(cells.eq(-4).html() === "-" ? "" : cells.eq(-4).html());
    }
  });

  // Convert Sets to option HTML strings
  const optionStrings = {};
  for (const key in tableData) {
    if (key === 'status') {
      // Special handling for status dropdown
      const statusOptions = [];
      if (tableData.status.has("YES") || tableData.status.has("In Notice Period")) {
        statusOptions.push(`<option class="emp_option" value="YES">In Notice Period</option>`);
      }
      if (tableData.status.has("NO") || tableData.status.has("Active")) {
        statusOptions.push(`<option class="emp_option" value="NO">Active</option>`);
      }
      optionStrings[key] = statusOptions.join('');
    } else {
      optionStrings[key] = Array.from(tableData[key])
        .filter(Boolean)
        .map(value => `<option class="emp_option" value="${value}">${value}</option>`)
        .join('');
    }
  }

  // Map of select IDs to their corresponding keys
  const selectIdToKey = {
    nameSelect: 'name',
    jobSelect: 'job',
    repMangSelect: 'manager',
    locatSelect: 'location',
    funSelect: 'function',
    custSelect: 'customer',
    SOWSelect: 'sow',
    billSelect: 'billing',
    status: 'status',
    skillSelect: 'skill',
    // skillNewSelect: 'skillData'
  };

  // Update all dropdowns except the one that triggered the filter
  for (const [selectId, key] of Object.entries(selectIdToKey)) {
    if (filterValues[key].length === 0 && selectId !== selectedFilterCol) {
      $(`#${selectId}`).empty().append(optionStrings[key]).multiselect("reload");
    }
  }
}


function getStatusAfOf() {
  let checkDate = $("#team_date_filter_old").val();
  let selDate = $("#team_date_filter").val();
  checkDate = convert(checkDate);
  if (checkDate != selDate) {
    getEmpData(selDate);
    $("#team_date_filter_old").val(selDate);
  }
}
function getStatusAfOf() {
  let selDate = $("#team_date_filter").val();
  // console.log("selDate - ", selDate);
  if (selDate == "") {
    let dateInput = document.getElementById("team_date_filter");
    selDate = dateInput.min;
  }
  date = new Date(selDate);
  Currdate1 = convertDate(date);
  $("#team_date_filter").val(Currdate1);
  getEmpData(Currdate1);
  filterData();
}
function clearDateFilter() {
  date = new Date();
  Currdate1 = convertDate(date);
  $("#team_date_filter").val(Currdate1);
  getEmpData(Currdate1);
}
function convertDate(date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth() + 1).toString();
  var dd = date.getDate().toString();

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

function callReloadFilterOption() {
  $("#nameSelect").multiselect("reload");
  $("#nameSelect").multiselect({
    columns: 1,
    placeholder: "Name",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-3", "Name", "nameSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-3", "Name", "nameSelect");
    },
  });
  $("#jobSelect").multiselect("reload");
  $("#jobSelect").multiselect({
    columns: 1,
    placeholder: "Job",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-4", "Job", "jobSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-4", "Job", "jobSelect");
    },
  });
  $("#repMangSelect").multiselect("reload");
  // $('#repMangSelect').multiselect({
  //     columns: 1,
  //     placeholder: 'Manager',
  //     search: true
  // });
  $("#repMangSelect").multiselect({
    columns: 1,
    placeholder: "Manager",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-5", "Manager", "repMangSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-5", "Manager", "repMangSelect");
    },
  });
  $("#locatSelect").multiselect("reload");
  $("#locatSelect").multiselect({
    columns: 1,
    placeholder: "Location",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-6", "Location", "locatSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-6", "Location", "locatSelect");
    },
  });
  $("#funSelect").multiselect("reload");
  $("#funSelect").multiselect({
    columns: 1,
    placeholder: "Function",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-7", "Function", "funSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-7", "Function", "funSelect");
    },
  });
  $("#custSelect").multiselect("reload");
  $("#custSelect").multiselect({
    columns: 1,
    placeholder: "Customer",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-8", "Customer", "custSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-8", "Customer", "custSelect");
    },
  });
  $("#SOWSelect").multiselect("reload");
  $("#SOWSelect").multiselect({
    columns: 1,
    placeholder: "SOW",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-9", "SOW", "SOWSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-9", "SOW", "SOWSelect");
    },
  });
  $("#billSelect").multiselect("reload");
  $("#billSelect").multiselect({
    columns: 1,
    placeholder: "Billing",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-10", "Billing", "billSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-10", "Billing", "billSelect");
    },
  });
  $("#status").multiselect("reload");
  $("#status").multiselect({
    columns: 1,
    placeholder: "Status",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-11", "Status", "status");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-11", "Status", "status");
    },
  });
  $("#skillSelect").multiselect("reload");
  $("#skillSelect").multiselect({
    columns: 1,
    placeholder: "Persona",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-1", "Persona", "skillSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-1", "Persona", "skillSelect");
    },
  });
  $("#skillNewSelect").multiselect("reload");
  $("#skillNewSelect").multiselect({
    columns: 1,
    placeholder: "Skills",
    search: true,
    onOptionClick: function (element, option) {
      updatePlaceholderText("ms-list-2", "Skills", "skillNewSelect");
    },
    onChange: function (element, checked) {
      updatePlaceholderText("ms-list-2", "Skills", "skillNewSelect");
    },
  });
}

function OpenUtilization() {
  window.location.href = "UtilizationChart.html";
}
function appendOptions(selectId, selectedArray, allOptions) {
  // Get the existing select dropdown
  let $select = $(selectId);

  // Empty the current options in the select
  $select.empty();

  // Convert allOptions (HTML string) into jQuery object
  let $allOptions = $(allOptions);

  // Append selected options first
  selectedArray.forEach(function (selectedValue) {
    // Find the matching option from all options
    let $option = $allOptions.filter(`option[value="${selectedValue}"]`);

    // If option is found, set it as selected and append it
    if ($option.length) {
      $option.prop("selected", true); // Mark as selected
      $select.append($option); // Append to select
    }


    // Function to filter table columns by year
    function filterTableByYear(selectedYear) {
      const currentYear = new Date().getFullYear();
      const nextYear = getNextYears()
      const shortYear = currentYear.toString().slice(-2);
      const nextShortYear = nextYear.toString().slice(-2);

      if (selectedYear === 'all') {
        // Show all year columns
        $(`[class*='week_col_main_'][class*='_${shortYear}']`).show();
        $(`[class*='week_col_main_'][class*='_${nextShortYear}']`).show();
        $(`[id*='month_head_'][id*='_${shortYear}']`).show();
        $(`[id*='month_head_'][id*='_${nextShortYear}']`).show();
        $('.teams_ytd_current').show();
        $('.teams_ytd_future').show();
        ytd_year = '4';
        $('#ytd_header').attr('colspan', ytd_year);
      } else if (selectedYear === currentYear.toString()) {
        // Show only current year columns
        $(`[class*='week_col_main_'][class*='_${shortYear}']`).show();
        $(`[class*='week_col_main_'][class*='_${nextShortYear}']`).hide();
        $(`[id*='month_head_'][id*='_${shortYear}']`).show();
        $(`[id*='month_head_'][id*='_${nextShortYear}']`).hide();
        // Hide weekly columns for next year
        $(`[class*='week_col_'][class*='_${nextShortYear}']:not([class*='week_col_main_'])`).hide();
        $('.teams_ytd_current').show();
        $('.teams_ytd_future').hide();
        ytd_year = '2';
        $('#ytd_header').attr('colspan', ytd_year);
      } else if (selectedYear === nextYear.toString()) {
        // Show only next year columns
        $(`[class*='week_col_main_'][class*='_${shortYear}']`).hide();
        $(`[class*='week_col_main_'][class*='_${nextShortYear}']`).show();
        $(`[id*='month_head_'][id*='_${shortYear}']`).hide();
        $(`[id*='month_head_'][id*='_${nextShortYear}']`).show();
        // Hide weekly columns for current year
        $(`[class*='week_col_'][class*='_${shortYear}']:not([class*='week_col_main_'])`).hide();
        $('.teams_ytd_current').hide();
        $('.teams_ytd_future').show();
        ytd_year = '2';
        $('#ytd_header').attr('colspan', ytd_year);
      }

      // Ensure summary rows are visible
      setTimeout(function () {
        $(".summary-row td[class*='week_col_main_']").each(function () {
          const $td = $(this);
          const classes = $td.attr('class');
          if (selectedYear === 'all') {
            $td.show();
            $('.teams_ytd_current').show();
            $('.teams_ytd_future').show();
            ytd_year = '4';
            $('#ytd_header').attr('colspan', ytd_year);
          } else if (selectedYear === currentYear.toString() && classes.includes('_' + shortYear)) {
            $td.show();
            $('.teams_ytd_current').show();
            $('.teams_ytd_future').hide();
            ytd_year = '2';
            $('#ytd_header').attr('colspan', ytd_year);
          } else if (selectedYear === nextYear.toString() && classes.includes('_' + nextShortYear)) {
            $td.show();
            $('.teams_ytd_current').hide();
            $('.teams_ytd_future').show();
            ytd_year = '2';
            $('#ytd_header').attr('colspan', ytd_year);
          } else if (selectedYear !== 'all') {
            $td.hide();
          }
        });
      }, 100);
    }

  });

  // Append the rest of the options, excluding already selected ones
  $allOptions.not($select.children()).each(function () {
    $(this).prop("selected", false); // Deselect remaining options
    $select.append($(this)); // Append to select
  });

  // Trigger multiselect reload or refresh
  $select.multiselect("reload");
}
// function appendOptions(selectElement, selectedArray, oldOptions) {
//   // Clear the current options
//   $(selectElement).empty();

//   // Create a set of selected values for faster lookup
//   let selectedSet = new Set(selectedArray);

//   // Append selected options first
//   selectedArray.forEach(function(option) {
//     // Ensure the option exists before adding it (optional check if needed)
//     $(selectElement).append(`<option value="${option}" selected>${option}</option>`);
//   });

//   // Append the rest of the options (unselected), ensuring no duplicates
//   $(oldOptions).each(function() {
//     let optionValue = $(this).val();
//     if (!selectedSet.has(optionValue)) {
//       $(selectElement).append(`<option value="${optionValue}">${$(this).text()}</option>`);
//     }
//   });

//   // Reload the multiselect (if applicable)
//   $(selectElement).multiselect("reload");
// }
