let currentFilterOpt = ''
let firstLoadStatus = 0
let filterDebounceTimer = null; // Debounce timer for filter changes
let $auditBody = null; // Cached jQuery selector
let $loadingOverlay = null; // Cached loading overlay selector

$(document).ready(function () {
  // Cache frequently used selectors
  $auditBody = $('#audit_body');
  $loadingOverlay = $('#filterLoadingOverlay');
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
            assignHighProbData();
            $('#report_details').addClass('active');
            $("#sow_overall").addClass('active');
            $("#sow_main").addClass('active');
            $(".loader").css("display", "none");
            $(".show_page").css("display", "block");
          }, 500);
          let currentDate = new Date();
          let currentYear = currentDate.getFullYear();
          $('#current_year').html(currentYear + ' Quarterly Lead Size');
          $('#next_year').html(currentYear + 1 + ' Quarterly Lead Size');
          // Add event listeners to the filter dropdowns
          // $('#nameSelect, #ownerSelect, #funnelSelect, #ageSelect, #leaderSelect, #billingSelect, #sowTypeSelect').on('change', function () {
          //   currentFilterOpt = $(this).attr('id');  // Get the ID of the currently changed filter
          //   filterData(auditData);
          //   if(currentFilterOpt == 'ownerSelect'){
          //     sortTable('OPPORTUNITY_OWNER');
          //   }
          // });

          setDefaultFunnelStages();

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
  $('#sow_Res_page').click(function () {
    localStorage.setItem("addRequest", true);
    localStorage.setItem("editRequest", false);
    window.location.href = 'sowCreate.html';
    return false;
  });
  $('#userManual').click(function () {
  
    window.location.href = 'RRESOWUserManual.html';
    return false;
  });
  $('#reportsBackBtnCustm').click(function () {
  
    window.location.href = 'reportsDashboard.html';
    return false;
  });
  $('#logout').click(function () {
    localStorage.clear();
    window.location.href = 'index.html';
    return false;
  });
});
let auditData = [];
let filteredAuditData = [];  // Store the currently filtered data
let filterOrder = []; // Keep track of the order of filter selections
let jsonData = []; // Your JSON data array
let sortOrder = 1; // 1 for ascending, -1 for descending
let currentSortColumn = ''; // Track the current sorted column
let account_leader_list = [];
const pathname = window.location.pathname;
let headerYears = [];
// Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();

function getHighProbData() {
  const startTime = performance.now();
  let empId = localStorage.getItem('EmpUserID');
  let emp_dep = localStorage.getItem('Department');
  let form_details = {
      emp_id: empId,
      department: emp_dep
    };
  $.ajax({
    url: apiValue.url_ip + ":5003/high_probability_sow_report",
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
    },
    data: JSON.stringify(form_details),
    success: function (dataJson) {
      if (typeof dataJson === 'string') {
        dataJson = JSON.parse(dataJson);
      }
      console.log(dataJson);

      // const endTime = performance.now();
      // const loadTimeInSeconds = (endTime - startTime) / 1000;
      // getApiTime(loadTimeInSeconds, "reportAudit", "Reports", "audit_tracking_data", "success", fileName, "reportAudit", "view");
      auditData = dataJson.Data
      jsonData = auditData.Data
      account_leader_list = dataJson.ACCOUNT_LEADERS
      headerYears = dataJson.SELECTED_YEARS
      // prepareHighProbDataUI(auditData);
      // updateDropdowns(auditData);
      // filterData(auditData)
      PrepareHeaderColumn(headerYears);
      $('#hpl_last_updated').html('As On '+dataJson.LAST_UPDATED_ON)
      $("#leaderSelect").append(`<option value="-1" disabled selected hidden>Select Account Leader</option>`);
      $("#leaderSelect").append(`<option value="-1">All</option>`);
      account_leader_list.map(item => {
        $("#leaderSelect").append(`<option value="${item}">${item}</option>`);
      });
      sortTable('ACCOUNT_NAME');
      firstLoadStatus = 1;
      hideLoading(); // Hide loading after initial data load
    },
    error: function (error) {
      // const endTime = performance.now();
      // const loadTimeInSeconds = (endTime - startTime) / 1000;
      // getApiTime(loadTimeInSeconds, "reportAudit", "Reports", "audit_tracking_data", "error", fileName, "reportAudit", "view");
      console.log('message Error' + JSON.stringify(error));
    }
  });
}

function assignHighProbData() {
  if (auditData == 0) {
    showLoading('Loading data...');
    getHighProbData();
  } else {
    showLoading('Preparing data...');
    firstLoadStatus = 1
    
    // Use setTimeout to allow UI to update before heavy processing
    setTimeout(function() {
      try {
        filterData(auditData);
      } catch (error) {
        console.error('Error preparing data:', error);
      } finally {
        hideLoading();
      }
    }, 50);
  }
}

function PrepareHeaderColumn(yearsData){
  let mainHeader = ` <th class="hpl_header acc_header_col no-break" onclick="sortTable('ACCOUNT_NAME')"><div class="header_text_align">Account Name <span class="custom_sort_span"><img id="account_name_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header acc_header_col no-break" onclick="sortTable('BUYING_CENTER')"><div class="header_text_align">Buying Center Name <span class="custom_sort_span"><img id="buying_center_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header acc_header_col no-break" onclick="sortTable('SUPERBOSS')"><div class="header_text_align">Superboss <span style='visibility: hidden;'>test data new</span><span class="custom_sort_span"><img id="superboss_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header acc_header_col no-break" onclick="sortTable('KEY_STAKEHOLDER_NAME')"><div class="header_text_align">Key Stakeholders <span style='visibility: hidden;'>test </span><span class="custom_sort_span"><img id="key_stakeholder_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header acc_header_col no-break" onclick="sortTable('STAKEHOLDER')"><div class="header_text_align">Stakeholder <span style='visibility: hidden;'>test data</span><span class="custom_sort_span"><img id="stakeholder_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header header_col_15 no-break" onclick="sortTable('OPPORTUNITY_NAME')"><div class="header_text_align">Opportunity Name <span class="custom_sort_span"><img id="opp_name_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header acc_header_col no-break" onclick="sortTable('OPPORTUNITY_OWNER')"><div class="header_text_align">Opportunity Owner <span class="custom_sort_span"><img id="opp_owner_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header header_col_15 no-break" onclick="sortTable('SOW_START_DATE')"><div class="header_text_align">SOW Start Date <span class="custom_sort_span"><img id="sow_start_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header header_col_15 no-break" onclick="sortTable('LEGAL_END_DATE')"><div class="header_text_align">SOW End Date <span class="custom_sort_span"><img id="lead_start_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header header_col_15 no-break" onclick="sortTable('OPPORTUNITY_AGE')"><div class="header_text_align">Opportunity Age <span class="custom_sort_span"><img id="opp_age_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header header_col_15 no-break" onclick="sortTable('FUNNEL_STAGE')"><div class="header_text_align">Funnel Stage <span class="custom_sort_span"><img id="funnel_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header header_col_15 no-break" onclick="sortTable('COMMENTED_ON')"><div class="header_text_align">Recency <span class="custom_sort_span"><img id="commented_on_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>
                      <th class="hpl_header header_col_15 no-break" onclick="sortTable('POTENTIAL_LEAD_SIZE')"><div class="header_text_align">Potential Lead Size <span class="custom_sort_span"><img id="lead_size_sort" class="sort_img" src="images/sort_both.png" alt="default sort"/></span></div></th>`
  yearsData?.map((year)=> {
    mainHeader += `<th class="hpl_header header_col_15 no-break action_year_${year}" colspan="4"><div class="header_text_align" id="current_year">${year} Quarterly Lead Size</div></th>`
  })
  $('#audit_head').append(mainHeader)
  let subHeader = `<th class="report_high_prob_filter col_width_loc table_second_th">
                        <div style="color: black">
                          <select class="form-control" name="nameSelect[]" multiple id="nameSelect" onchange="handleDropdownChange(this)">
                          </select>
                        </div>
                      </th>
                      <th class="report_high_prob_filter col_width_loc table_second_th">
                        <div style="color: black">
                          <select class="form-control" name="buyingCenterSelect[]" multiple id="buyingCenterSelect" onchange="handleDropdownChange(this)">
                          </select>
                        </div>
                      </th>
                      <th class="report_high_prob_filter col_width_loc table_second_th">
                        <div style="color: black">
                          <select class="form-control" name="superbossSelect[]" multiple id="superbossSelect" onchange="handleDropdownChange(this)">
                          </select>
                        </div>
                      </th>
                      <th class="report_high_prob_filter col_width_loc table_second_th">
                        <div style="color: black">
                          <select class="form-control" name="keyStakeholderSelect[]" multiple id="keyStakeholderSelect" onchange="handleDropdownChange(this)">
                          </select>
                        </div>
                      </th>
                      <th class="report_high_prob_filter col_width_loc table_second_th">
                        <div style="color: black">
                          <select class="form-control" name="stakeholderSelect[]" multiple id="stakeholderSelect" onchange="handleDropdownChange(this)">
                          </select>
                        </div>
                      </th>
                      <th class="report_high_prob_filter table_second_th"></th>
                      <th class="report_high_prob_filter col_width_loc_2 table_second_th">
                        <div style="color: black">
                          <select class="form-control" name="ownerSelect[]" multiple id="ownerSelect" onchange="handleDropdownChange(this)">
                          </select>
                        </div>
                      </th>
                      <th class="report_high_prob_filter table_second_th col_width_loc"></th>
                      <th class="report_high_prob_filter table_second_th col_width_loc">
                        <div style="color: black">
                          <select class="form-control" name="legalEndSelect" id="legalEndSelect" onchange="handleDropdownChange(this)">
                            <option value="">All</option>
                            <option value="30">Within 30 days</option>
                            <option value="60">Within 60 days</option>
                            <option value="90">Within 90 days</option>
                            <option value="expired">Expired</option>
                          </select>
                        </div>
                      </th>
                      <th class="report_high_prob_filter table_second_th col_width_loc">
                        <div style="color: black">
                          <select class="form-control age_select" name="ageSelect[]" multiple id="ageSelect" onchange="handleDropdownChange(this)">
                            <option value="0-30">0-30 days</option>
                            <option value="31-59">31-59 days</option>
                            <option value="60-89">60-89 days</option>
                            <option value="90-120">90-120 days</option>
                            <option value="120+">120+ days</option>
                          </select>
                        </div>
                      </th>
                      <th class="report_high_prob_filter col_width_loc_4 table_second_th">
                        <div style="color: black">
                          <select class="form-control" name="funnelSelect[]" multiple id="funnelSelect" onchange="handleDropdownChange(this)" >
                          </select>
                        </div>
                      </th>
                      <th class="report_high_prob_filter table_second_th"></th>
                      <th class="report_high_prob_filter table_second_th"></th>`;
  yearsData?.map((year)=>{
    subHeader += `<th class="report_high_prob_filter table_second_th quater_header action_year_${year}" style="font-weight: 900 !important;">Q1</th>
                      <th class="report_high_prob_filter table_second_th quater_header action_year_${year}" style="font-weight: 900 !important;">Q2</th>
                      <th class="report_high_prob_filter table_second_th quater_header action_year_${year}" style="font-weight: 900 !important;">Q3</th>
                      <th class="report_high_prob_filter table_second_th quater_header action_year_${year}" style="font-weight: 900 !important;">Q4</th>`
  })
  $('#audit_sub_header').append(subHeader)
}

function handleDropdownChange(element) {
  // Clear any existing debounce timer
  if (filterDebounceTimer) {
    clearTimeout(filterDebounceTimer);
  }

  const currentFilterOpt = $(element).attr('id');  // Get the ID of the changed element
  
  // Show loading overlay with appropriate message
  showLoading('Filtering data...');
  
  // Debounce the filter operation
  filterDebounceTimer = setTimeout(function() {
    try {
      // Call the filter function
      filterData(auditData);
      
      // Sort if 'ownerSelect' is changed
      if (currentFilterOpt === 'ownerSelect') {
        sortTable('OPPORTUNITY_OWNER');
      }
    } catch (error) {
      console.error('Error during filtering:', error);
    } finally {
      // Hide loading overlay
      hideLoading();
    }
  }, 300); // 300ms debounce delay
}

function prepareHighProbDataUI(highProbDataJson) {
  firstLoadStatus += 1;
  
  // Use cached selector and empty the table body
  if (!$auditBody) {
    $auditBody = $('#audit_body');
  }
  $auditBody.empty();
  let totalOverallLeadSize = 0;
  let accountTotalLeadSize = 0;
  let ownerTotalLeadSize = 0;
  let currentAccount = "";
  let currentOwner = "";

  // Dynamically create quarterly totals using headerYears
  let overallQuarterlyTotals = resetQuarterlyTotals(headerYears);
  let accountQuarterlyTotals = null; // Temporary storage for account quarterly totals
  let isOwnerFilterApplied = $('#ownerSelect').val() && $('#ownerSelect').val().length > 0;

  // Sets to collect unique filter values
  let accountNames = new Set();
  let opportunityOwners = new Set();
  let funnelStages = new Set();
  let opportunityAges = new Set();
  let buyingCenters = new Set();
  let superbosses = new Set();
  let keyStakeholders = new Set();
  let stakeholders = new Set();

  highProbDataJson.forEach((piplinedata, index) => {
    totalOverallLeadSize += piplinedata.POTENTIAL_LEAD_SIZE;

    // Update overall quarterly totals
    Object.keys(overallQuarterlyTotals).forEach(key => {
      overallQuarterlyTotals[key] += piplinedata[key] || 0;
    });

    // Collect unique filter values
    accountNames.add(piplinedata.ACCOUNT_NAME);
    opportunityOwners.add(piplinedata.OPPORTUNITY_OWNER);
    funnelStages.add(piplinedata.FUNNEL_STAGE);
    opportunityAges.add(piplinedata.OPPORTUNITY_AGE);
    buyingCenters.add(piplinedata.BUYING_CENTER);
    if (piplinedata.SUPERBOSS && piplinedata.SUPERBOSS !== '-1') superbosses.add(piplinedata.SUPERBOSS);
    if (piplinedata.KEY_STAKEHOLDER_NAME && piplinedata.KEY_STAKEHOLDER_NAME !== '-1') keyStakeholders.add(piplinedata.KEY_STAKEHOLDER_NAME);
    if (piplinedata.STAKEHOLDER && piplinedata.STAKEHOLDER !== '-1') stakeholders.add(piplinedata.STAKEHOLDER);

    if (isOwnerFilterApplied) {
      if (currentOwner !== piplinedata.OPPORTUNITY_OWNER) {
        if (currentOwner !== "") {
          appendOwnerTotalRow(currentOwner, ownerTotalLeadSize, accountQuarterlyTotals);
        }
        currentOwner = piplinedata.OPPORTUNITY_OWNER;
        ownerTotalLeadSize = 0;
        accountQuarterlyTotals = resetQuarterlyTotals(headerYears); // Reset for the new owner
      }
      ownerTotalLeadSize += piplinedata.POTENTIAL_LEAD_SIZE;
    } else {
      if (currentAccount !== piplinedata.ACCOUNT_NAME) {
        if (currentAccount !== "") {
          appendAccountTotalRow(currentAccount, accountTotalLeadSize, accountQuarterlyTotals);
        }
        currentAccount = piplinedata.ACCOUNT_NAME;
        accountTotalLeadSize = 0;
        accountQuarterlyTotals = resetQuarterlyTotals(headerYears); // Reset for the new account
      }
      accountTotalLeadSize += piplinedata.POTENTIAL_LEAD_SIZE;
    }

    // Update account-specific quarterly totals
    Object.keys(accountQuarterlyTotals).forEach(key => {
      accountQuarterlyTotals[key] += piplinedata[key] || 0;
    });

    // Render pipeline data row
    appendPipelineRow(piplinedata, headerYears);

    // Add final total for the last item
    if (index === highProbDataJson.length - 1) {
      if (isOwnerFilterApplied) {
        appendOwnerTotalRow(currentOwner, ownerTotalLeadSize, accountQuarterlyTotals);
      } else {
        appendAccountTotalRow(currentAccount, accountTotalLeadSize, accountQuarterlyTotals);
      }
    }
  });

  // Add overall total
  appendOverallTotalRow(totalOverallLeadSize, overallQuarterlyTotals);

  // Initialize dropdown filters
  initializeDropdowns(
    Array.from(accountNames),
    Array.from(opportunityOwners),
    Array.from(funnelStages),
    Array.from(opportunityAges),
    Array.from(buyingCenters),
    Array.from(superbosses),
    Array.from(keyStakeholders),
    Array.from(stakeholders)
  );
}

function resetQuarterlyTotals(headerYears) {
  let quarterlyTotals = {};
  headerYears.forEach(year => {
    for (let quarter = 1; quarter <= 4; quarter++) {
      quarterlyTotals[`q${quarter}_${year}`] = 0;
    }
  });
  return quarterlyTotals;
}

function convertStringToLocalTimeAndAgo(timeString) {
  // Replace the space between date and time with 'T' to make it ISO-compliant
  const isoString = timeString.replace(" ", "T") + "Z"; // Add 'Z' to treat it as UTC

  // Parse the UTC date string into a Date object
  const utcDate = new Date(isoString);

  // Get the current date and time in the user's local time zone
  const currentDate = new Date();

  // Calculate the difference in milliseconds between the current date and the provided UTC date
  const diffInMs = currentDate - utcDate;

  // Convert the difference to seconds, minutes, hours, and days
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Determine the "time ago" part
  let timeAgoString;
  if (diffInSeconds >= 0 && diffInSeconds < 60) {
    timeAgoString = `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 0) {
    timeAgoString = `0 seconds ago`;
  } else if (diffInMinutes < 60) {
    timeAgoString = `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    timeAgoString = `${diffInHours} hours ago`;
  } else {
    timeAgoString = `${diffInDays} days ago`;
  }

  // Format the UTC date into the user's local time zone in the desired format
  const day = String(utcDate.getDate()).padStart(2, '0');
  const month = String(utcDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = String(utcDate.getFullYear()).slice(-2); // Get last 2 digits of the year
  const hours = utcDate.getHours() % 12 || 12; // Convert to 12-hour format
  const minutes = String(utcDate.getMinutes()).padStart(2, '0');
  const amPm = utcDate.getHours() >= 12 ? 'PM' : 'AM';
  // const formattedDate = `${month}/${day}/${year} ${hours}:${minutes} ${amPm}`;
  const formattedDate = `${month}/${day}/${year}`;

  // Return the formatted date with the "time ago" string
  return `${timeAgoString}`;
}

function appendPipelineRow(piplinedata, headerYears) {
  let opp_age_html = piplinedata.OPPORTUNITY_AGE;
  if (piplinedata.FUNNEL_STAGE === "Signed") {
      opp_age_html = `<span>-</span>`;
  } else {
      if (piplinedata.OPPORTUNITY_AGE > 30 && piplinedata.OPPORTUNITY_AGE < 60) {
          opp_age_html = `<span class='age_over_30'><img src="images/info-alert.png" style='width: 14px; margin-top: -4px' /> ${piplinedata.OPPORTUNITY_AGE} days</span>`;
      } else if (piplinedata.OPPORTUNITY_AGE > 61) {
          opp_age_html = `<span class='age_over_60'><img src="images/alert.png" style='width: 13px; margin-top: -4px' /> ${piplinedata.OPPORTUNITY_AGE} days</span>`;
      } else {
          opp_age_html = `<span>${piplinedata.OPPORTUNITY_AGE} days</span>`;
      }
  }

  // Base row HTML
  let html = `
  <tr>
      <td><div class='table_row_bg'>${piplinedata.ACCOUNT_NAME}</div></td>
      <td><div class='table_row_bg'>${piplinedata.BUYING_CENTER == '-1' || piplinedata.BUYING_CENTER == null ? '-' : piplinedata.BUYING_CENTER}</div></td>
      <td><div class='table_row_bg'>${piplinedata.SUPERBOSS == '-1' || piplinedata.SUPERBOSS == null ? '-' : piplinedata.SUPERBOSS}</div></td>
      <td><div class='table_row_bg'>${piplinedata.KEY_STAKEHOLDER_NAME == '-1' || piplinedata.KEY_STAKEHOLDER_NAME == null ? '-' : piplinedata.KEY_STAKEHOLDER_NAME}</div></td>
      <td><div class='table_row_bg'>${piplinedata.STAKEHOLDER == '-1' || piplinedata.STAKEHOLDER == null ? '-' : piplinedata.STAKEHOLDER}</div></td>
      <td onclick='sowAccDetails(this)' data-id='${JSON.stringify(piplinedata)}'><div class='sow_data_name_all table_row_bg'>${piplinedata.OPPORTUNITY_NAME}</div></td>
      <td><div class='table_row_bg'>${piplinedata.OPPORTUNITY_OWNER === '' ? '-' : piplinedata.OPPORTUNITY_OWNER}</div></td>
      <td><div class='table_row_bg text_align_center'>${piplinedata.SOW_START_DATE}</div></td>
      <td><div class='table_row_bg text_align_center'>${piplinedata.LEGAL_END_DATE}</div></td>
      <td><div class='table_row_bg text_align_center'>${opp_age_html}</div></td>
      <td><div class='table_row_bg text_align_center'>${piplinedata.FUNNEL_STAGE == '-1' ? '-' : piplinedata.FUNNEL_STAGE}</div></td>
      <td><div class='table_row_bg text_align_center no-wrap'>${piplinedata.COMMENTED_ON == '-' ? '-' : convertStringToLocalTimeAndAgo(piplinedata.COMMENTED_ON)}</div></td>
      <td><div class='table_row_bg quater_div'>${piplinedata.POTENTIAL_LEAD_SIZE == '0' ? '-' : `$ ${(Math.round(piplinedata.POTENTIAL_LEAD_SIZE)).toLocaleString()}`}</div></td>`;
  // Dynamically generate quarterly columns
  headerYears.forEach(year => {
      for (let quarter = 1; quarter <= 4; quarter++) {
          let quarterKey = `q${quarter}_${year}`;
          html += `
              <td class='action_year_${year}'><div class='table_row_bg no-break quater_div'>${piplinedata[quarterKey] == '0' ? '-' : `$ ${(Math.round(piplinedata[quarterKey] || 0)).toLocaleString()}`}</div></td>`;
      }
  });

  html += `</tr>`;
  
  // Use cached selector for better performance
  if (!$auditBody) {
    $auditBody = $('#audit_body');
  }
  $auditBody.append(html);
}


function appendAccountTotalRow(accountName, accountTotal, quarterlyTotals) {
  // Append account total row with quarterly sums
  let html = `
    <tr class="accountTotalRow">
      <td colspan="12"><div class="table_row_bg each_acc_total_bg"><strong>${accountName} Total</strong></div></td>
      <td><div class="table_row_bg each_acc_total_bg quater_div"><strong>${accountTotal == '0' ? '-' : `$ ${(Math.round(accountTotal)).toLocaleString()}`}</strong></div></td>
      ${renderQuarterlyColumns(quarterlyTotals, 'each_acc_total_bg')}
    </tr>`;
  
  // Use cached selector
  if (!$auditBody) {
    $auditBody = $('#audit_body');
  }
  $auditBody.append(html);
}

function appendOwnerTotalRow(ownerName, ownerTotal, quarterlyTotals) {
  // Append owner total row with quarterly sums
  let html = `
    <tr class="ownerTotalRow">
      <td colspan="12"><div class="table_row_bg owner_total_bg"><strong>${ownerName} Total</strong></div></td>
      <td><div class="table_row_bg owner_total_bg quater_div"><strong>${ownerTotal == '0' ? '-' : `$ ${ownerTotal.toLocaleString()}`}</strong></div></td>
      ${renderQuarterlyColumns(quarterlyTotals, 'owner_total_bg')}
    </tr>`;
  
  // Use cached selector
  if (!$auditBody) {
    $auditBody = $('#audit_body');
  }
  $auditBody.append(html);
}

function appendOverallTotalRow(overallTotal, quarterlyTotals) {
  console.log('overallTotal - ',overallTotal, 'quarterlyTotals - ',quarterlyTotals)
  let yearlyTotals = {};
  Object.keys(quarterlyTotals).forEach(key => {
    const year = key.split('_')[1];
    yearlyTotals[year] = (yearlyTotals[year] || 0) + quarterlyTotals[key];
  });
  console.log("yearlyTotals - ",yearlyTotals)
  
  // Check if all quarterly totals are 0
  const hasNonZeroData = Object.values(quarterlyTotals).some(value => value > 0);
  console.log('hasNonZeroData - ',hasNonZeroData)
  if (!hasNonZeroData && overallTotal === 0) {
      // If all totals are 0, do not render the row
      console.log("Skipping Overall Total Row as all quarterly totals are 0");
      return;
  }

  // Append overall total row with quarterly sums
  let html = `
      <tr class="totalRow">
          <td colspan="12"><div class="table_row_bg total_bg"><strong>Overall Total</strong></div></td>
          <td><div class="table_row_bg total_bg quater_div"><strong>${overallTotal == '0' ? '-' : `$ ${overallTotal.toLocaleString()}`}</strong></div></td>
          ${renderQuarterlyColumns(quarterlyTotals, 'total_bg')}
      </tr>`;
  
  // Use cached selector
  if (!$auditBody) {
    $auditBody = $('#audit_body');
  }
  $auditBody.append(html);
  Object.entries(yearlyTotals).forEach(([year, total]) => {
    if (total == 0) {
      console.log(`Year: ${year}, Total: ${total}`);
      $('.action_year_'+year).hide();
    }else{
      $('.action_year_'+year).show();
    }
  });
  
}


function renderQuarterlyColumns(quarterlyTotals, bgclass) {
  return Object.keys(quarterlyTotals)
    .map(key => {
      // Extract year from the key (e.g., 'q1_2024' -> '2024')
      const year = key.split('_')[1];
      const uniqueClass = `action_year_${year}`;
      const value = Math.floor(quarterlyTotals[key]); // Remove decimals by flooring the value
      return `
          <td class='${uniqueClass}'>
              <div class="table_row_bg ${bgclass} no-break quater_div">
                  ${quarterlyTotals[key] == '0' ? '-' : `$ ${value.toLocaleString()}`}
              </div>
          </td>`;
    })
    .join("");
}



function initializeDropdowns(accountNames, opportunityOwners, funnelStages, opportunityAges, buyingCenters, superbosses, keyStakeholders, stakeholders) {
    $('#nameSelect').multiselect({
    columns: 1,
    placeholder: 'Account Name',
    search: true,
    selectAll: true,
    selectAllValue: 'Select-all',
    texts: {
      selectAll: 'Select all'
    }
  }).multiselect('select', Array.from(accountNames));

  $('#ageSelect').multiselect({
    columns: 1,
    placeholder: 'Age',
    search: true,
    selectAll: true,
    selectAllValue: 'Select-all',
    texts: {
      selectAll: 'Select all'
    }
  });

  $('#ownerSelect').multiselect({
    columns: 1,
    placeholder: 'Opportunity Owner',
    search: true,
    selectAll: true,
    selectAllValue: 'Select-all',
    texts: {
      selectAll: 'Select all'
    }
  }).multiselect('select', Array.from(opportunityOwners));

  $('#funnelSelect').multiselect({
    columns: 1,
    placeholder: 'Funnel Stage',
    search: true,
    selectAll: true,
    selectAllValue: 'Select-all',
    texts: {
      selectAll: 'Select all'
    }
  }).multiselect('select', Array.from(funnelStages));

  $('#buyingCenterSelect').multiselect({
    columns: 1,
    placeholder: 'Buying Center Name',
    search: true,
    selectAll: true,
    selectAllValue: 'Select-all',
    texts: {
      selectAll: 'Select all'
    }
  }).multiselect('select', Array.from(buyingCenters));

  $('#superbossSelect').multiselect({
    columns: 1,
    placeholder: 'Superboss',
    search: true,
    selectAll: true,
    selectAllValue: 'Select-all',
    texts: {
      selectAll: 'Select all'
    }
  }).multiselect('select', Array.from(superbosses));

  $('#keyStakeholderSelect').multiselect({
    columns: 1,
    placeholder: 'Key Stakeholders',
    search: true,
    selectAll: true,
    selectAllValue: 'Select-all',
    texts: {
      selectAll: 'Select all'
    }
  }).multiselect('select', Array.from(keyStakeholders));

  $('#stakeholderSelect').multiselect({
    columns: 1,
    placeholder: 'Stakeholder',
    search: true,
    selectAll: true,
    selectAllValue: 'Select-all',
    texts: {
      selectAll: 'Select all'
    }
  }).multiselect('select', Array.from(stakeholders));


}



function sortTable(column) {
  // Toggle the sorting order
  sortOrder = currentSortColumn === column && sortOrder === 1 ? -1 : 1;
  currentSortColumn = column;
  let sortData = filteredAuditData.length ? filteredAuditData : auditData;

  // Perform the sorting
  sortData.sort(function (a, b) {
    let valueA = a[column];
    let valueB = b[column];

    if (column === 'ACCOUNT_NAME') {
      const orderMap = getAccountOrderMap();
      const aLower = (valueA || '').toString().toLowerCase().trim();
      const bLower = (valueB || '').toString().toLowerCase().trim();
      
      let aIndex = orderMap[aLower];
      let bIndex = orderMap[bLower];
      aIndex = aIndex === undefined ? 9999 : aIndex;
      bIndex = bIndex === undefined ? 9999 : bIndex;
      
      if (aIndex !== bIndex) {
        return (aIndex - bIndex) * sortOrder;
      }
      return aLower.localeCompare(bLower) * sortOrder;
    } else if (column === 'SOW_START_DATE' || column === 'LEGAL_END_DATE') {
      // Parse date strings to Date objects
      let dateA = parseDate(valueA);
      let dateB = parseDate(valueB);

      // Handle invalid dates
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return (dateA.getTime() - dateB.getTime()) * sortOrder;
    } else if (!isNaN(valueA) && !isNaN(valueB)) {
      // Numeric sorting
      return (Number(valueA) - Number(valueB)) * sortOrder;
    } else if (typeof valueA === 'string' && typeof valueB === 'string') {
      // String sorting
      return valueA.localeCompare(valueB) * sortOrder;
    }

    return 0;
  });

  // Update the icons based on the sort order
  // Re-render the table with sorted data
  filterData(sortData);
  updateSortIcons(column);

}

function parseDate(dateString) {
  // Handle the "MMM DD, YYYY" format
  const parts = dateString.split(' ');
  if (parts.length === 3) {
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(parts[0]);
    const day = parseInt(parts[1].replace(',', ''), 10);
    const year = parseInt(parts[2], 10);
    if (month !== -1 && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  
  // Fallback to built-in date parsing
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}


function updateSortIcons(column) {
  // Reset all sort icons to default
  document.querySelectorAll('.custom_sort_span img').forEach(function (img) {
    img.src = 'images/sort_both.png';
  });

  // Determine the appropriate icon based on the sort order
  let sortIcon = sortOrder === 1 ? 'images/sort_asc.png' : 'images/sort_desc.png';

  // Update the icon for the current sorted column
  switch (column) {
    case 'ACCOUNT_NAME':
      document.getElementById('account_name_sort').src = sortIcon;
      break;
    case 'OPPORTUNITY_NAME':
      document.getElementById('opp_name_sort').src = sortIcon;
      break;
    case 'OPPORTUNITY_OWNER':
      document.getElementById('opp_owner_sort').src = sortIcon;
      break;
    case 'SOW_START_DATE':
      document.getElementById('sow_start_sort').src = sortIcon;
      break;
    case 'OPPORTUNITY_AGE':
      document.getElementById('opp_age_sort').src = sortIcon;
      break;
    case 'FUNNEL_STAGE':
      document.getElementById('funnel_sort').src = sortIcon;
      break;
    case 'POTENTIAL_LEAD_SIZE':
      document.getElementById('lead_size_sort').src = sortIcon;
      break;
    case 'LEGAL_END_DATE':
      document.getElementById('lead_start_sort').src = sortIcon;
      break;
    case 'BUYING_CENTER':
      document.getElementById('buying_center_sort').src = sortIcon;
      break;
    case 'SUPERBOSS':
      document.getElementById('superboss_sort').src = sortIcon;
      break;
    case 'KEY_STAKEHOLDER_NAME':
      document.getElementById('key_stakeholder_sort').src = sortIcon;
      break;
    case 'STAKEHOLDER':
      document.getElementById('stakeholder_sort').src = sortIcon;
      break;
    default:
      break;
  }
}

// Helper functions for loading overlay
function showLoading(message) {
  // Direct DOM manipulation for better reliability
  const overlay = document.getElementById('filterLoadingOverlay');
  if (overlay) {
    overlay.style.display = 'block';
    console.log('Loading overlay shown - display:', overlay.style.display);
  } else {
    console.error('filterLoadingOverlay element not found!');
  }
}

function hideLoading() {
  // Direct DOM manipulation for better reliability
  const overlay = document.getElementById('filterLoadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    console.log('Loading overlay hidden - display:', overlay.style.display);
  } else {
    console.error('filterLoadingOverlay element not found!');
  }
}

// Cache for filter values to avoid repeated DOM queries
let cachedFilterValues = {
  accounts: null,
  owners: null,
  stages: null,
  ageRanges: null,
  legalEndDays: null,
  leadSize: null,
  buyingCenters: null,
  superbosses: null,
  keyStakeholders: null,
  stakeholders: null
};

// Function to get and cache filter values
function getCachedFilterValues() {
  return {
    accounts: $('#nameSelect').val() || [],
    owners: $('#ownerSelect').val() || [],
    stages: $('#funnelSelect').val() || [],
    ageRanges: $('#ageSelect').val() || [],
    legalEndDays: $('#legalEndSelect').val() || '',
    leadSize: $('#leaderSelect').val() || '-1',
    buyingCenters: $('#buyingCenterSelect').val() || [],
    superbosses: $('#superbossSelect').val() || [],
    keyStakeholders: $('#keyStakeholderSelect').val() || [],
    stakeholders: $('#stakeholderSelect').val() || []
  };
}

// Optimized age matching using Map for faster lookups
const ageRangeMap = new Map([
  ['0-30 days', (age) => age >= 0 && age <= 30],
  ['31-59 days', (age) => age >= 31 && age <= 59],
  ['60-89 days', (age) => age >= 60 && age <= 89],
  ['90-120 days', (age) => age >= 90 && age <= 120],
  ['120+ days', (age) => age > 120]
]);

// Function to filter data based on selected criteria
function filterData(hplJsonData) {
  // Get and cache filter values
  const filters = getCachedFilterValues();
  
  // Update filter order
  updateFilterOrder();
  
  // Convert accounts to Set for O(1) lookup
  const accountSet = new Set(filters.accounts.map(account => escapeHtml(account)));
  const ownerSet = new Set(filters.owners);
  const stageSet = new Set(filters.stages);
  const buyingCenterSet = new Set(filters.buyingCenters);
  const superbossSet = new Set(filters.superbosses);
  const keyStakeholderSet = new Set(filters.keyStakeholders);
  const stakeholderSet = new Set(filters.stakeholders);
  
  // Optimized filter function with early returns
  filteredAuditData = hplJsonData.filter(function (item) {
    // Early return for account match
    if (accountSet.size > 0 && !accountSet.has(item.ACCOUNT_NAME)) return false;
    
    // Early return for owner match
    if (ownerSet.size > 0 && !ownerSet.has(item.OPPORTUNITY_OWNER)) return false;
    
    // Early return for stage match
    if (stageSet.size > 0 && !stageSet.has(item.FUNNEL_STAGE)) return false;

    // Early return for buying center match
    if (buyingCenterSet.size > 0 && !buyingCenterSet.has(item.BUYING_CENTER)) return false;

    // Early return for superboss match
    if (superbossSet.size > 0 && !superbossSet.has(item.SUPERBOSS)) return false;

    // Early return for key stakeholder match
    if (keyStakeholderSet.size > 0 && !keyStakeholderSet.has(item.KEY_STAKEHOLDER_NAME)) return false;

    // Early return for stakeholder match
    if (stakeholderSet.size > 0 && !stakeholderSet.has(item.STAKEHOLDER)) return false;
    
    // Age range matching with optimized logic
    if (filters.ageRanges.length > 0) {
      const age = parseInt(item.OPPORTUNITY_AGE);
      const ageMatch = filters.ageRanges.some(range => {
        const checkFn = ageRangeMap.get(range);
        return checkFn ? checkFn(age) : false;
      });
      if (!ageMatch) return false;
    }
    
    // Legal end date matching
    if (filters.legalEndDays !== '') {
      const daysToEnd = parseInt(item.DAYS_TO_END);
      if (filters.legalEndDays === 'expired') {
        if (daysToEnd >= 0) return false;
      } else {
        const threshold = parseInt(filters.legalEndDays);
        if (daysToEnd <= 0 || daysToEnd > threshold) return false;
      }
    }
    
    // Leader match
    if (filters.leadSize !== '-1' && filters.leadSize !== item.ACCOUNT_LEADER) {
      return false;
    }
    
    return true;
  });

  // Prepare UI for filtered data
  prepareHighProbDataUI(filteredAuditData);

  // Update dropdowns based on the filtered data
  updateDropdowns(filteredAuditData);
}


function updateFilterOrder() {
  let currentOrder = ['nameSelect', 'buyingCenterSelect', 'superbossSelect', 'keyStakeholderSelect', 'stakeholderSelect', 'ownerSelect', 'funnelSelect', 'ageSelect', 'legalEndSelect'];
  filterOrder = currentOrder.filter(id => $(`#${id}`).val() && $(`#${id}`).val().length > 0);
}

function updateDropdowns(filteredData) {
  // Get currently selected values once
  const selectedValues = {
    accounts: $('#nameSelect').val() || [],
    owners: $('#ownerSelect').val() || [],
    stages: $('#funnelSelect').val() || [],
    ageRanges: $('#ageSelect').val() || [],
    buyingCenters: $('#buyingCenterSelect').val() || [],
    superbosses: $('#superbossSelect').val() || [],
    keyStakeholders: $('#keyStakeholderSelect').val() || [],
    stakeholders: $('#stakeholderSelect').val() || []
  };

  // Collect all unique values in a single pass
  const uniqueValues = {
    accountNames: new Set(),
    opportunityOwners: new Set(),
    funnelStages: new Set(),
    ageRanges: new Set(),
    buyingCenters: new Set(),
    superbosses: new Set(),
    keyStakeholders: new Set(),
    stakeholders: new Set()
  };

  // Single iteration through filtered data
  filteredData.forEach(function (item) {
    if (selectedValues.accounts.length === 0) uniqueValues.accountNames.add(item.ACCOUNT_NAME);
    if (selectedValues.owners.length === 0) uniqueValues.opportunityOwners.add(item.OPPORTUNITY_OWNER);
    if (selectedValues.stages.length === 0) uniqueValues.funnelStages.add(item.FUNNEL_STAGE);
    if (selectedValues.ageRanges.length === 0) uniqueValues.ageRanges.add(item.OPPORTUNITY_AGE);
    if (selectedValues.buyingCenters.length === 0) uniqueValues.buyingCenters.add(item.BUYING_CENTER);
    if (selectedValues.superbosses.length === 0 && item.SUPERBOSS && item.SUPERBOSS !== '-1') uniqueValues.superbosses.add(item.SUPERBOSS);
    if (selectedValues.keyStakeholders.length === 0 && item.KEY_STAKEHOLDER_NAME && item.KEY_STAKEHOLDER_NAME !== '-1') uniqueValues.keyStakeholders.add(item.KEY_STAKEHOLDER_NAME);
    if (selectedValues.stakeholders.length === 0 && item.STAKEHOLDER && item.STAKEHOLDER !== '-1') uniqueValues.stakeholders.add(item.STAKEHOLDER);
  });

  // Batch dropdown updates using requestAnimationFrame for smooth UI
  requestAnimationFrame(function() {
    const dropdownUpdates = [];
    
    if (selectedValues.accounts.length === 0) {
      populateFilterDropdown("#nameSelect", uniqueValues.accountNames, selectedValues.accounts);
      dropdownUpdates.push('#nameSelect');
    }
    if (selectedValues.owners.length === 0) {
      populateFilterDropdown("#ownerSelect", uniqueValues.opportunityOwners, selectedValues.owners);
      dropdownUpdates.push('#ownerSelect');
    }
    if (selectedValues.stages.length === 0) {
      populateFilterDropdown("#funnelSelect", uniqueValues.funnelStages, selectedValues.stages);
      dropdownUpdates.push('#funnelSelect');
    }
    if (selectedValues.ageRanges.length === 0) {
      populateFilterDropdown("#ageSelect", uniqueValues.ageRanges, selectedValues.ageRanges);
      dropdownUpdates.push('#ageSelect');
    }
    if (selectedValues.buyingCenters.length === 0) {
      populateFilterDropdown("#buyingCenterSelect", uniqueValues.buyingCenters, selectedValues.buyingCenters);
      dropdownUpdates.push('#buyingCenterSelect');
    }
    if (selectedValues.superbosses.length === 0) {
      populateFilterDropdown("#superbossSelect", uniqueValues.superbosses, selectedValues.superbosses);
      dropdownUpdates.push('#superbossSelect');
    }
    if (selectedValues.keyStakeholders.length === 0) {
      populateFilterDropdown("#keyStakeholderSelect", uniqueValues.keyStakeholders, selectedValues.keyStakeholders);
      dropdownUpdates.push('#keyStakeholderSelect');
    }
    if (selectedValues.stakeholders.length === 0) {
      populateFilterDropdown("#stakeholderSelect", uniqueValues.stakeholders, selectedValues.stakeholders);
      dropdownUpdates.push('#stakeholderSelect');
    }
    
    // Batch reload all multiselects at once
    dropdownUpdates.forEach(selector => {
      $(selector).multiselect('reload');
    });
  });
}

function populateFilterDropdown(selector, dataSet, selectedValues) {
  $(selector).empty();  // Clear previous options

  // Predefined order for funnel stages
  const orderedStages = ['Scout', 'Lead', 'Pre-Qualified', 'Qualified', 'Proposal', 'Lost', 'Closed', 'Signed', 'Renewal'];

  if (selector == '#ageSelect') {
    let uniqueValues = Array.from(new Set(dataSet));
    uniqueValues.sort((a, b) => a - b);  // Sort numerically
    let addedRanges = new Set();  // To track added ranges

    uniqueValues.forEach(function (value) {
      let range;

      // Assign the value to a specific range
      if (value >= 0 && value <= 30) {
        range = '0-30 days';
      } else if (value >= 31 && value <= 59) {
        range = '31-59 days';
      } else if (value >= 60 && value <= 89) {
        range = '60-89 days';
      } else if (value >= 90 && value <= 120) {
        range = '90-120 days';
      } else if (value > 120) {
        range = '120+ days';
      } else {
        return;
      }

      // Check if the range has already been added
      if (!addedRanges.has(range)) {
        addedRanges.add(range);  // Mark the range as added
        
        let isSelected = selectedValues.includes(range) ? 'selected' : '';
        $(selector).append(`<option value="${range}" ${isSelected}>${range}</option>`);
      }
    });
  } else if (selector == '#funnelSelect') {
    // Convert dataSet to an array if it's not already an array
    let dataArray = Array.isArray(dataSet) ? dataSet : Array.from(dataSet);

    // Filter the dataset based on the predefined order
    let sortedDataSet = orderedStages.filter(stage => dataArray.includes(stage));

    sortedDataSet.forEach(function (value) {
      let isSelected = selectedValues.includes(value) ? 'selected' : '';
      $(selector).append(`<option value="${value}" ${isSelected}>${value}</option>`);
    });
  } else {
    // Convert dataSet to array if it's not already an array
    let dataArray = Array.isArray(dataSet) ? dataSet : Array.from(dataSet);

    dataArray.forEach(function (value) {
      let isSelected = selectedValues.includes(value) ? 'selected' : '';
      $(selector).append(`<option value="${value}" ${isSelected}>${value == '-1' ? '-' : value}</option>`);
    });
  }
}


function downloadExcel() {
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
  let CurrentDateTime = date + '_' + time;
  $("#audit_report").remove(".noExl").table2excel({
    exclude: ".noExl",
    name: "Audit Report",
    filename: "high_probability_report_" + CurrentDateTime,
    fileext: ".xls",
  });
}

function convert(str) {
  if (str == null) {
    return "";
  } else if (str == "0000-00-00") {
    return "";
  }
  else {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
  }
}
console.log(convert("Mon, 11 Nov 2013 00:00:00 GMT"));

function selectedAuditDetails(obj) {
  let auditDataDetails = $(obj).attr("data-id");
  let audit_id = $(obj).attr("data-id1");
  sessionStorage.setItem("audit-details-data", auditDataDetails);
  window.location.href = 'reportAuditDetails.html?audit_id=' + audit_id;
}

function convertDate(date) {
  let finalDate = "";
  if (date != undefined) {
    let newDate = date.split("-");
    let mm = newDate[0];
    let dd = newDate[1];
    let yy = newDate[2];
    yy = "20" + yy;
    finalDate = yy + "-" + mm + "-" + dd;
  }

  return finalDate;
}

function titleCase(string) {
  if (string != undefined) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
  } else {
    return "";
  }
}

function setDefaultFunnelStages() {
  const defaultStages = ['Proposal', 'Qualified'];
  
  // Wait for the funnelSelect dropdown to be populated
  const checkFunnelSelect = setInterval(() => {
    if ($('#funnelSelect option').length > 0) {
      clearInterval(checkFunnelSelect);
      
      // Select the default stages
      $('#funnelSelect').val(defaultStages);
      
      // Update the multiselect widget
      $('#funnelSelect').multiselect('reload');
      
      // Trigger the change event to apply the filter
      $('#funnelSelect').trigger('change');
    }
  }, 100);
}

function sowAccDetails(obj) {
  let idData = $(obj).attr("data-id");
  let idClickSoruce = $(obj).attr("data-id1");
  console.log('idData - ',idData)
  console.log('idClickSoruce - ',idClickSoruce)
  let tempArr = JSON.parse(idData)
  console.log('tempArr - ',tempArr)
  let uniqId_sowid = tempArr.UNIQUE_ID+'&'+tempArr.SOW_ID
  // localStorage.setItem('urlStoredSOWUrldata',uniqId_sowid)
  // localStorage.setItem("sow-acc-data", idData);
  // localStorage.setItem("sow-click-source", idClickSoruce);
  localStorage.setItem('sowBackBtnNav', 'hplReport')
  window.open('sow.html?'+uniqId_sowid, '_blank');
}
