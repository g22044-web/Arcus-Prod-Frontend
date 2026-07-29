var getFunnelStageDrop = [],
  getsowTypeDrop = [],
  sowDropDownJson = [],
  defaultBillArr = [];
buyingCenterNps = [];
var currentBuyingCenters = [];
var personaOpt = "",
  billingOpt = "",
  bill_us_default = 0,
  bill_ind_default = 0;
var funnelOptHtml = "",
  sowTypeOptHtml = "",
  skillOptionsHtml = "",
  sow_amount_user_edit = "NO";
(billingTypeHtml = ""),
  (project_amount = ""),
  (sow_amount_temp = ""),
  (userComments = []);
var load_sow_id = "",
  load_sow_unique_id = "",
  opportunityOwnersJsonData = [];
var monthsObject = { "MONTHS": {} }; // Global variable
var probFilterOptions = `<option value="0">0%</option>
                          <option value="10">10%</option>
                          <option value="30 to 50">30% to 50%</option>
                          <option value="70">&gt; 70%</option>
                          <option value="100">100%</option>`;
var locationOpt = `<option value="-1">Select Location</option>
                    <option value="US">US</option>
                  <option value="INDIA">INDIA</option>`;
var sow_acc_data = "",
  sowSelectedSource = "";
var defaultAccName = "",
  defaultBusHead = "",
  defaultFactHead = "",
  defaultAccId = "";
var deliveryMembers = [], growthMembers = [];
var renewal_sow_name = "";
var quill;
var nextStepsQuill;
const pathname = window.location.pathname;
// Extract the file name (last segment) from the pathname
const parts = pathname.split("/");
const fileName = parts.pop();
const paramsString = window.location.search.substring(1); // removes the '?'
const paramsArray = paramsString.split('&');
console.log("paramsArray - ", paramsArray);

// Function to populate buying center dropdown - can be called to refresh
function populateBuyingCenterDropdown(accountId, newBuyingCenter, newStakeholder) {
  // Get account details based on account ID
  const accountDetails = buyingCenterNps.find(item => item.ACCOUNT_ID === accountId);

  let buyingCenters = [];
  let stakeholders = [];

  if (accountDetails) {
    // Extract BUYING_CENTRE and STAKEHOLDER
    let seenBCs = new Set();
    accountDetails.DETAILS.forEach(detail => {
      let bcId = detail.BC_ID || detail.BUYING_CENTRE;
      if (!seenBCs.has(bcId)) {
        seenBCs.add(bcId);
        buyingCenters.push({ id: bcId, name: detail.BUYING_CENTRE });
      }
      stakeholders.push({
        center: bcId,
        stakeholder: detail.STAKEHOLDER,
      });
    });
  }

  console.log("Buying Centers:", buyingCenters);

  // Populate Buying Center dropdown
  $("#buying_center").empty();
  $("#buying_center").append(
    "<option value='-1'>Select Buying Center</option>"
  );
  $("#buying_center").append(
    '<option value="add-new" class="add-new-option">+ Add New</option>'
  );
  buyingCenters.forEach(center => {
    $("#buying_center").append(`<option value="${center.id}">${center.name}</option>`);
  });

  // If we have a newBuyingCenter parameter and it's not already in the list, add it
  console.log("newBuyingCenter - ", newBuyingCenter);
  const isNewExisting = buyingCenters.some(c => c.id === newBuyingCenter || c.name === newBuyingCenter);
  if (newBuyingCenter && !isNewExisting) {
    $("#buying_center").append(`<option value="${newBuyingCenter}">${newBuyingCenter}</option>`);
    buyingCenters.push({ id: newBuyingCenter, name: newBuyingCenter }); // Add to the array for consistency
  }

  const buyingCenterValue = newBuyingCenter || (sow_acc_data && (sow_acc_data.BC_ID || sow_acc_data.BUYING_CENTRE));
  console.log("buyingCenterValue - ", buyingCenterValue);
  // If we have a newBuyingCenter parameter, select it
  if (newBuyingCenter) {
    $("#buying_center").val(newBuyingCenter);
  } else if (buyingCenters.some(c => c.id === buyingCenterValue || c.name === buyingCenterValue)) {
    // If it exists, set the selected value to the buyingCenterValue
    $("#buying_center").val(buyingCenterValue);
  } else {
    // If it doesn't exist, set the "Add New" as selected
    $("#buying_center").val("-1");
  }

  // Populate NPS Stakeholder dropdown based on initial Buying Center
  updateStakeholderDropdown(buyingCenterValue, newStakeholder);
}

// Function to update the Stakeholder dropdown
function updateStakeholderDropdown(buyingCenter, newStakeholder) {
  // Get account details based on account ID
  const accountDetails = buyingCenterNps.find(item => item.ACCOUNT_ID === sow_acc_data.ACCOUNT_ID);

  let stakeholders = [];

  if (accountDetails) {
    // Flatten the STAKEHOLDERS array from each buying center
    accountDetails.DETAILS.forEach(detail => {
      let bcId = detail.BC_ID || detail.BUYING_CENTRE;
      if (detail.STAKEHOLDERS && Array.isArray(detail.STAKEHOLDERS)) {
        detail.STAKEHOLDERS.forEach(stakeholder => {
          stakeholders.push({
            center: bcId,
            stakeholder: stakeholder.STAKEHOLDER,
            designation: stakeholder.STAKEHOLDER_DESIGNATION,
            status: stakeholder.STAKEHOLDER_STATUS,
            stakeholderID: stakeholder.STAKEHOLDER_ID
          });
        });
      }
      // Add KEY_STAKEHOLDER as an additional stakeholder with status "yes"
      if (detail.KEY_STAKEHOLDER && Array.isArray(detail.KEY_STAKEHOLDER)) {
        detail.KEY_STAKEHOLDER.forEach(ks => {
          if (ks.KEY_STAKEHOLDER_NAME && ks.KEY_STAKEHOLDER_NAME.trim() !== '') {
            stakeholders.push({
              center: bcId,
              stakeholder: ks.KEY_STAKEHOLDER_NAME,
              designation: ks.KEY_STAKEHOLDER_DESIGNATION || '',
              status: ks.KEY_STAKEHOLDER_FLAG || 'Y',
              stakeholderID: ks.KEY_STAKEHOLDER_ID
            });
          }
        });
      }
    });
  }

  console.log("All stakeholders:", stakeholders);
  console.log("Selected buying center:", buyingCenter);

  const matchedStakeholders = stakeholders.filter(
    stakeholder => stakeholder.center === buyingCenter
  );

  console.log("Matched stakeholders:", matchedStakeholders);

  $("#nps_stakeholder").empty();

  if (matchedStakeholders.length > 0) {
    // Filter out undefined or empty stakeholders
    const validStakeholders = matchedStakeholders.filter(stakeholder =>
      stakeholder.stakeholder && stakeholder.stakeholder.trim() !== '' && stakeholder.stakeholder !== 'undefined'
    );

    console.log("Valid stakeholders:", validStakeholders);

    if (validStakeholders.length > 0) {
      // Add all valid stakeholders as options
      validStakeholders.forEach(stakeholder => {
        $("#nps_stakeholder").append(
          `<option value="${stakeholder.stakeholderID}">${stakeholder.stakeholder}</option>`
        );
      });

      // Select the first option by default
      const firstStakeholder = validStakeholders[0].stakeholderID;
      $("#nps_stakeholder").val(firstStakeholder);

      // Enable the dropdown since we have stakeholders
      $("#nps_stakeholder").prop("disabled", false);
    } else {
      // No valid stakeholders found
      $("#nps_stakeholder").append('<option value="-1">No stakeholders available</option>');
      $("#nps_stakeholder").prop("disabled", true);
      $("#nps_stakeholder").val("-1");
    }
  } else {
    $("#nps_stakeholder").append('<option value="-1">Select Stakeholder</option>');
    // Disable the dropdown if no stakeholders found
    $("#nps_stakeholder").prop("disabled", true);
    $("#nps_stakeholder").val("-1");
  }

  // If newStakeholder is provided, try to select it
  if (newStakeholder) {
    $("#nps_stakeholder").val(newStakeholder);
  }

  // --- Sync NPS STAKEHOLDER display dropdown ---
  syncNpsStakeholderDisplay(buyingCenter);
}

function getSowData(sowid, unique) {
  let apiURL = apiValue.url.replace("/app", "/sow_profile_details_figma");
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({
      query_type: "sow_profile_details_figma",
      sow_id: sowid,
      unique_id: unique,
      environment: apiValue.environment,
    }),
    success: function (data) {
      sow_acc_data = data.SOW_DATA[0];
      console.log("sow_acc_data", sow_acc_data);

      // Load buying centers data first
      getBuyingCenters(function() {
        // Load existing NPS Stakeholder data for multiple select
        loadExistingNpsStakeholders(data.NPS_STAKEHOLDER_DATA || []);

        // Populate buying center dropdown after data is loaded
        let account_id = sow_acc_data.ACCOUNT_ID;
        populateBuyingCenterDropdown(account_id, (sow_acc_data.BC_ID || sow_acc_data.BUYING_CENTRE), sow_acc_data.NPS_STAKEHOLDER_ID);

        // Update stakeholder dropdown for the selected buying center
        updateStakeholderDropdown(sow_acc_data.BC_ID || sow_acc_data.BUYING_CENTRE);
      });

      // Ensure NPS stakeholder dropdowns are enabled for editing existing SOWs
      if (data.NPS_STAKEHOLDER_DATA && data.NPS_STAKEHOLDER_DATA.length > 0) {
        $("#nps_stakeholder").prop("disabled", false);
        $("#nps_stakeholder_display").prop("disabled", false);
      }

      // Merge Legacy Notes and Engagement Notes
      let legacyNotes = data.SOW_NOTES || [];
      let engagementNotes = (data.SOW_ENGAGEMENT_NOTES || []).map(note => ({
        NOTES: note.detail_text,
        COMMENTED_BY: note.created_by_name,
        COMMENTED_ON: note.created_at,
        INTERACTION_TYPE: note.interaction_type,
        MEETING_DATE: note.meeting_date,
        NEXT_STEPS: note.next_steps_text,
        NEXT_STEPS_DATE: note.next_steps_estimated_date,
        NEXT_INTERACTION_TYPE: note.next_interaction_type,
        NEXT_INTERACTION_DATE: note.next_interaction_estimated_date,
        IS_ENGAGEMENT: true
      }));

      comments_notes = [...legacyNotes, ...engagementNotes];

      // Sort by COMMENTED_ON descending
      comments_notes.sort((a, b) => new Date(b.COMMENTED_ON) - new Date(a.COMMENTED_ON));

      console.log("comments_notes", comments_notes);
      updateMonthlyBreakupTab(sow_acc_data);
      allcoationTabShowHide(sow_acc_data);
      audit_message = data.AUDIT_LOG;
      updateAuditTab(audit_message);
      initializeQuill(comments_notes);
    },
    error: function (error) {
      console.log("message Error" + JSON.stringify(error));
    },
  });
}

function allcoationTabShowHide(data) {
  console.log("data11", data);
  if (data.ALLOCATION_FLAG === 'YES') {
    activateResourceAllocationTab();
  } else {
    removeResourceAllocationTab();
  }
}

function getCommentsData(sowid, unique) {
  let apiURL = apiValue.url.replace("/app", "/view_sow_comments");
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({
      SOW_ID: sowid,
      UNIQUE_ID: unique,
    }),
    success: function (data) {
      userComments = data.Data;
      let userCommentHtml = "";
      if (userComments.length > 0) {
        $.each(userComments, function (l, comment) {
          console.log("comment - ", comment);
          userCommentHtml += `<div class="comments_data">
                    <div class="comments_name_stamp">
                      <div class="commented_user_name">${comment.COMMENTED_BY
            }</div>
                      <div class="commented_user_date">${convertStringToLocalTimeAndAgo(
              comment.COMMENTED_ON
            )}</div>
                    </div>
                    <div class="users_comments">
                      <div class="commented_user_comments">${formatCommentWithLineBreaks(
              comment.COMMENTS
            )}</div>
                    </div>
                  </div>`;
        });
      } else {
        userCommentHtml = `<div class="comments_data">
                            <div class="commented_user_comments">No Comments</div>
                          </div>`;
      }
      $("#user_comments_list").empty();
      $("#user_comments_list").html(userCommentHtml);
      console.log("data - " + JSON.stringify(data));
    },
    error: function (error) {
      console.log("message Error" + JSON.stringify(error));
    },
  });
}

function toggleComments(check) {
  if (userComments.length == 0 && check != "load") {
    getCommentsData(load_sow_id, load_sow_unique_id);
  }
  const commentsSection = document.getElementById("comments_section");
  const toggleIcon = document.getElementById("toggle_icon");

  if (commentsSection.classList.contains("hidden")) {
    commentsSection.classList.remove("hidden");
    toggleIcon.classList.replace("fa-plus", "fa-minus");
  } else {
    commentsSection.classList.add("hidden");
    toggleIcon.classList.replace("fa-minus", "fa-plus");
  }
}

function validateCommentInput() {
  const commentTextarea = document.getElementById("sow_user_comments");
  const saveButton = document.getElementById("sow_comments_button");

  if (commentTextarea.value.trim() === "") {
    saveButton.disabled = true;
  } else {
    saveButton.disabled = false;
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function sendSowComments() {
  let userEnteredComments = $("#sow_user_comments").val();
  if (userEnteredComments != "") {
    $("#sow_comments_button").html("Saving..."); // Change button text to 'Saving...'
    $("#sow_comments_button").prop("disabled", true); // Disable the button

    let apiURL = apiValue.url.replace("/app", "/capture_sow_comments");
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
    let currentDate = new Date();
    let formattedDate = formatDate(currentDate);
    console.log(formattedDate);
    let comments_data =
      '{"SOW_ID":"' +
      sow_acc_data.SOW_ID +
      '", "UNIQUE_ID":"' +
      sow_acc_data.UNIQUE_ID +
      '", "COMMENTS":"' +
      escapeHtml(userEnteredComments) +
      '", "COMMENTED_ON":"' +
      formattedDate +
      '"}';

    $.ajax({
      url: apiURL,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      async: true, // Set async to true
      data: JSON.stringify({
        user_details: "[" + accessDetails + "]",
        comments_data: "[" + comments_data + "]",
        flag: "create",
      }),
      success: function (data) {
        if (data.Message === "Comments captured Successfully") {
          toastr.options.timeOut = 2000;
          toastr.success(data.Message);

          let userComments = data.Response.Data;
          let userCommentHtml = "";

          if (userComments.length > 0) {
            $.each(userComments, function (l, comment) {
              console.log("comment - ", comment);
              userCommentHtml += `
                <div class="comments_data">
                  <div class="comments_name_stamp">
                    <div class="commented_user_name">${comment.COMMENTED_BY
                }</div>
                    <div class="commented_user_date">${convertStringToLocalTimeAndAgo(
                  comment.COMMENTED_ON
                )}</div>
                  </div>
                  <div class="users_comments">
                    <div class="commented_user_comments">${formatCommentWithLineBreaks(
                  comment.COMMENTS
                )}</div>
                  </div>
                </div>`;
            });
          } else {
            userCommentHtml = `<div class="comments_data">
                                <div class="commented_user_comments">No Comments</div>
                              </div>`;
          }

          $("#user_comments_list")
            .empty()
            .html(userCommentHtml);
          $("#sow_user_comments").val("");
        } else {
          toastr.error(data.Message);
        }

        $("#sow_comments_button").html("Save"); // Reset button text
        $("#sow_comments_button").prop("disabled", true); // Enable the button
      },
      error: function (error) {
        console.log("Error: " + JSON.stringify(error));
        toastr.error("Error submitting comments.");
        $("#sow_comments_button").html("Save"); // Reset button text
        $("#sow_comments_button").prop("disabled", false); // Enable the button
      },
    });
  }
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "{{newline}}");
}

// Helper function to format comments with line breaks
function formatCommentWithLineBreaks(comment) {
  // First, escape HTML to prevent XSS
  // let safeComment = escapeHtml(comment);
  // Then, replace the newline placeholder with actual line breaks
  return comment.replace(/{{newline}}/g, "<br>");
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
  const formattedDate = `${month}/${day}/${year} ${hours}:${minutes} ${amPm}`;

  // Return the formatted date with the "time ago" string
  return `${formattedDate} (${timeAgoString})`;
}

function assignSowData() {
  $(".loader").css("display", "block");
  $(".show_page").css("display", "none");
  $("#sow_renew").show();
  localStorage.setItem("BackSowAccName", "");
  sowSelectedSource = localStorage.getItem("sow-click-source");
  if (sowSelectedSource == null || sowSelectedSource == "null") {
    sowSelectedSource = "sow";
  }
  let stored_url_data = "",
    url_sow_id = "",
    url_sow_unique = "";
  // let pastedSOWURL = localStorage.getItem("sow-url-id");
  // if (pastedSOWURL == null || pastedSOWURL == "") {
  //   stored_url_data = localStorage.getItem("urlStoredSOWUrldata");
  //   let url_data = stored_url_data.split("&");
  //   url_sow_unique = url_data[0];
  //   url_sow_id = url_data[1];
  // } else {
  //   let url_data = pastedSOWURL.split("&");
  url_sow_unique = paramsArray[0];
  url_sow_id = paramsArray[1];
  // }
  load_sow_id = url_sow_id;
  load_sow_unique_id = url_sow_unique;
  getSowData(url_sow_id, url_sow_unique);
  getSowViewData();
  // getCommentsData(url_sow_id, url_sow_unique);
  // toggleComments('load');
  // Clear existing options and append new ones
  $("#probability_options").empty();
  $("#probability_options").append(probFilterOptions);
  assignProbOptions(sow_acc_data.SOW_STAGE);
  $("#probability_options option").each(function () {
    if ($(this).val() === sow_acc_data.PROBABILITY) {
      $(this).prop("selected", true);
    }
  });

  $("#funnel_options").empty();
  $("#funnel_options").append(funnelOptHtml);
  console.log("funnelOptHtml", funnelOptHtml);
  console.log("sow_acc_data - ", sow_acc_data)

  $("#funnel_options").val(sow_acc_data.SOW_STAGE);
  $("#sow_options").empty();
  $("#sow_options").append(sowTypeOptHtml);
  let account_id = sow_acc_data.ACCOUNT_ID;

  console.log("account_id", account_id);
  // Log Buying Center NPS data
  console.log("buyingCenterNps---", buyingCenterNps);

  // Handle Buying Center change
  $("#buying_center").on("change", function () {
    const selectedBuyingCenter = $(this).val();

    if (selectedBuyingCenter === "add-new") {
      newBuyingCenter();
    }

    // Update Stakeholder dropdown based on selected Buying Center
    updateStakeholderDropdown(selectedBuyingCenter);

    // Enable/disable NPS Stakeholder dropdown based on buying center selection
    if (selectedBuyingCenter && selectedBuyingCenter !== "-1" && selectedBuyingCenter !== "add-new") {
      $("#nps_stakeholder").prop("disabled", false);
    } else {
      $("#nps_stakeholder").prop("disabled", true);
      $("#nps_stakeholder").val("-1");
    }

    // Initialize NPS Stakeholder display
    initOrReloadNpsStakeholderDisplay();
  });

  $("#billing_options").empty();
  $("#billing_options").append(billingTypeHtml);
  $("#billing_options").val(sow_acc_data.PRICING_PLAN);

  $("#acc_growth_name").empty();
  $("#acc_growth_name").append(sow_acc_data.OPPORTUNITY_NAME);
  $("#acc_growth_name").val(sow_acc_data.OPPORTUNITY_NAME);

  $("#acc_growth_name_option").val(sow_acc_data.OPPORTUNITY_OWNER_ID);
  $("#created_by_name").empty();
  $("#created_by_name").append(
    sow_acc_data.CREATED_USER == "" ? "-" : sow_acc_data.CREATED_USER
  );
  let growthOptHtml = "";
  $.each(opportunityOwnersJsonData, function (i, oppOption) {
    if (oppOption.EMPLOYEE_ID == sow_acc_data.OPPORTUNITY_OWNER_ID) {
      $.each(oppOption.REPORTING_EMPLOYEES, function (j, growthMang) {
        growthOptHtml += `<option value=${growthMang.REPORTING_EMPLOYEE_ID}>${growthMang.REPORTING_EMPLOYEE}</option>`;
      });
    }
  });
  $("#growth_created_by_option").empty();
  $("#growth_created_by_option").append(growthOptHtml);
  $("#growth_created_by_option").val(sow_acc_data.CREATED_USER_ID);
  let team_size =
    parseInt(sow_acc_data.NUMBER_OF_RESOURCE_US) +
    parseInt(sow_acc_data.NUMBER_OF_RESOURCE_IND);
  $("#acc_name_tit").html(sow_acc_data.ACCOUNT_NAME);
  $("#sow_name_tit").html(sow_acc_data.SOW_NAME);

  $("#sow_type_name").html(sow_acc_data.SOW_TYPE);

  $("#billing_type_name").html(sow_acc_data.PRICING_PLAN == "-1" ? "-" : sow_acc_data.PRICING_PLAN);
  $("#sow_options").val(sow_acc_data.SOW_TYPE);
  $("#nps_stakeholder").val(sow_acc_data.NPS_STAKEHOLDER_ID);
  $("#billing_options").val(sow_acc_data.PRICING_PLAN);
  $("#uscan_size").val(sow_acc_data.NUMBER_OF_RESOURCE_US);
  $("#ind_size").val(sow_acc_data.NUMBER_OF_RESOURCE_IND);
  $("#team_size_val").val(team_size);
  $("#sowNameID").html(sow_acc_data.SOW_ID);
  $("#legal_start_date").val(convert(sow_acc_data.LEGAL_START_DATE));
  $("#legal_end_date").val(convert(sow_acc_data.LEGAL_END_DATE));
  $("#new_team").val(team_size);
  if (sowSelectedSource == "renew" || sowSelectedSource == "Renewal") {
    $("#sow_renew").show();
    $("#sow_update").hide();
    $("#funnel_name").html("Renewal");
    let renewal_sow_name = "";
    let baseSowName = "", currentSowName = sow_acc_data.SOW_NAME;
    let renewalCount = sow_acc_data.RENEWAL_COUNT;
    if (currentSowName.includes('_renewal')) {
      baseSowName = currentSowName.split('_renewal')[0];
      console.log("This is an existing renewal. Base name found:", baseSowName);
    } else {
      baseSowName = currentSowName;
      console.log("This is a new SOW. Using full name as base:", baseSowName);
    }
    if (renewalCount > 1) {
      renewal_sow_name = `${baseSowName}_renewal_${renewalCount - 1}`;
    } else {
      renewal_sow_name = `${baseSowName}_renewal`;
    }
    $("#sow_name_tit").html(renewal_sow_name);
    $("#funnel_options").val("Renewal");
    $("#probab_name").html("70");
    $("#probability_options").val("70");
  } else {
    $("#sow_renew").hide();
    $("#sow_update").show();
    $("#funnel_name").html(sow_acc_data.SOW_STAGE);
    $("#funnel_options").val(sow_acc_data.SOW_STAGE);
    $("#probab_name").html(sow_acc_data.PROBABILITY);
    $("#probability_options").val(sow_acc_data.PROBABILITY);
  }

  localStorage.setItem("sowAccName", sow_acc_data.ACCOUNT_NAME);
  localStorage.setItem("sowAccId", sow_acc_data.SOW_ID);
  let accessLevel = checkEachPageAccess("Revenue");
  let pageLevelAccess = accessLevel[1];
  let eachLevel = pageLevelAccess.split(",");
  console.log("eachLevel - ", eachLevel);
  if (sowSelectedSource == "sow") {
    if (sow_acc_data.SOW_STAGE == "Signed") {
      $.each(eachLevel, function (l, level) {
        switch (level) {
          case "view":
            $("#sow_renew").hide();
            break;
          case "edit":
            if (sowSelectedSource == "renew") {
              $("#sow_renew").show()
            }
            break;
        }
      });
    } else {
      $("#sow_renew").hide();
    }
  }
  // let newurl =
  //   window.location.protocol +
  //   "//" +
  //   window.location.host +
  //   window.location.pathname +
  //   "?" +
  //   sow_acc_data.UNIQUE_ID.replace(/ /g, "+") +
  //   "&" +
  //   sow_acc_data.SOW_ID;
  // window.history.pushState({ path: newurl }, "", newurl);
  // addOrReplaceOrderBy(
  //   `${sow_acc_data.UNIQUE_ID.replace(/ /g, "+")}&${sow_acc_data.SOW_ID.replace(
  //     / /g,
  //     "+"
  //   )}`
  // );
  $.each(defaultBillArr, function (i, defaultRate) {
    if (defaultRate.ACCOUNT_NAME == sow_acc_data.ACCOUNT_NAME) {
      defaultAccName = defaultRate.ACCOUNT_NAME;
      defaultBusHead = defaultRate.BUSINESS_HEAD;
      defaultFactHead = defaultRate.FACTSPAN_ACCOUNT_HEAD_ID;
      defaultAccId = defaultRate.ACCOUNT_ID;
      bill_us_default = defaultRate.US_BILLING_RATE;
      bill_ind_default = defaultRate.IND_BILLING_RATE;
    }
  });
  let billStart = convert(
    sow_acc_data.BILLING_START_DATE == "0000-00-00"
      ? sow_acc_data.LEGAL_START_DATE
      : sow_acc_data.BILLING_START_DATE
  );
  let billEnd = convert(
    sow_acc_data.BILLING_END_DATE == "0000-00-00"
      ? sow_acc_data.LEGAL_END_DATE
      : sow_acc_data.BILLING_END_DATE
  );
  let actualStart = convert(
    sow_acc_data.ACTUAL_START_DATE == "0000-00-00"
      ? billStart
      : sow_acc_data.ACTUAL_START_DATE
  );
  let actualEnd = convert(
    sow_acc_data.ACTUAL_END_DATE == "0000-00-00"
      ? billEnd
      : sow_acc_data.ACTUAL_END_DATE
  );
  $("#billing_start_date").val(billStart);
  $("#billing_end_date").val(billEnd);
  $("#actual_start_date").val(actualStart);
  $("#actual_end_date").val(actualEnd);
  let sow_amount = sow_acc_data.SOW_AMOUNT;
  let proj_amount = sow_acc_data.PROJ_AMOUNT;
  console.log("proj_amount", proj_amount);

  let sowName = sow_acc_data.SOW_NAME;
  let sowId = sow_acc_data.SOW_ID;
  let actualHtml = "";
  let actualAmtFound = false;
  let projectedAmtFound = false;
  let projectHtml = "";
  $("#sow_amount").val(Math.round(sow_amount).toLocaleString());
  let projAmount = sow_acc_data.PROJ_AMOUNT;

  // Check if the value is empty or invalid, and default to 0
  projAmount = projAmount === "" ? 0 : Math.round(Number(projAmount));

  // Set the formatted value to the input field
  $("#proj_amount").val(projAmount.toLocaleString());
  if (actualAmtFound && projectedAmtFound) {
    $(".extra_br").hide();
  }

  let billing_rate = sow_acc_data.BILLING_RATE_DATA || [];
  $("#billing_exp_div tbody").empty();
  let personaStatus = false;
  if (billing_rate.length > 0) {
    let usTeam = 0;
    let indiaTeam = 0;
    $.each(billing_rate, function (i, listOthersPersona) {
      console.log("UUUUU", i, listOthersPersona)
      var othersIndex = i
      $(`#persona_select_${othersIndex}`).on("change", function () {
        const selectedVal = $(this).val();
        if (selectedVal === "Others") {
          $(`#others_input_${othersIndex}`).slideDown();
        } else {
          $(`#others_input_${othersIndex}`).slideUp();
          $(this).removeAttr("title");
          $(`#tooltip_${othersIndex}`).removeClass("show").text("");
        }
      });

      // Handle repeated clicks when "Others" is already selected
      $(`#persona_select_${i}`).on("click", function () {
        const selectedVal = $(this).val();
        if (selectedVal === "Others") {
          $(`#others_input_${i}`).slideDown();
        }
      });

      $(`#persona_select_${othersIndex}`).on("mouseenter", function () {
        $(this).removeAttr("title"); // Remove browser tooltip
        const selectedVal = $(this).val();
        const tooltip = $(`#tooltip_${othersIndex}`);
        if (selectedVal === "Others") {
          const customVal = $(`#other_text_${othersIndex}`).val();
          console.log("customVal - ", customVal);
          if (customVal) {
            tooltip.text(customVal).addClass("show");
          } else {
            tooltip.removeClass("show").text("");
          }
        } else {
          tooltip.removeClass("show").text("");
        }
      });

      $(`#persona_select_${othersIndex}`).on("mouseleave", function () {
        $(`#tooltip_${othersIndex}`).removeClass("show");
      });

      function submitCustomPersona() {
        const customPersona = $(`#other_text_${othersIndex}`).val().trim();
        console.log("customPersona 1 - ", customPersona);

        if (customPersona) {
          const $select = $(`#persona_select_${othersIndex}`);
          const $tooltip = $(`#tooltip_${othersIndex}`);

          $tooltip.text(customPersona);
          $select.val("Others");

          let customOption = $select.find("option[value='custom']");
          if (customOption.length !== 0) {
            customOption.text(customPersona);
            customOption.prop("selected", true);
          }

          $(`#others_input_${othersIndex}`).slideUp();
          toastr.success(`Please click on update to save the persona - ${customPersona}`);
        } else {
          toastr.error("Please enter a custom persona before submitting");
        }
      }

      $(`#submit_other_${othersIndex}`).on("click", submitCustomPersona);

      $(`#other_text_${othersIndex}`).on("keypress", function (e) {
        if (e.which === 13) {
          e.preventDefault();
          submitCustomPersona();
        }
      });

    })
    $.each(billing_rate, function (i, checkPersona) {
      if (checkPersona.BILLING_RATE_USD >= 0 && team_size > 0) {
        personaStatus = true;
        return false;
      }
      // }
    });
    let usStatus = false;
    let indStatus = false;
    $.each(billing_rate, function (i, rateCard) {
      let startDate = rateCard.START_DATE;
      let endDate = rateCard.END_DATE;
      let skillData = rateCard.SKILLS_DATA;
      let otherPersona = rateCard.OTHER_PERSONA;
      console.log("otherPersona - ", otherPersona);
      let actualStartDate = $("#actual_start_date").val();
      let actualEndDate = $("#actual_end_date").val();
      let SkillDataAssign = skillData.split(",");
      SkillDataAssign = SkillDataAssign.map((el) => el.trim());
      let personaSKill = rateCard.SKILLS_PERSONA;
      let personaGrpNumber = rateCard.RESOURCE_GROUP;
      console.log("personaSKill - ", personaSKill);
      if (personaSKill == "") {
        personaSKill = "TBD";
      }
      if (startDate != "") {
        startDate = convert(startDate);
      } else {
        startDate = convert(actualStartDate);
      }
      if (endDate != "") {
        endDate = convert(endDate);
      } else {
        endDate = convert(actualEndDate);
      }
      let skills = [];
      if (skillData > 0) {
        skills = skillData.split(",");
        skillData = tootTipRole_op(skills);
      }
      let persona_class = "persona_button";
      if (personaSKill != "") {
        persona_class = "persona_button";
      }
      let locat_class = "us_bill_table";
      let locatValue = rateCard.LOCATION;
      let resCount = rateCard.COUNT;
      if (resCount == "") {
        if (locatValue == "India" || locatValue == "INDIA") {
          resCount = $("#ind_size").val();
        } else if (locatValue == "US") {
          resCount = $("#uscan_size").val();
        }
      }
      if (locatValue == "India" || locatValue == "INDIA") {
        locat_class = "ind_bill_table";
      }
      let bill_status_class = "billed_sow_table";
      let billStatusVal = rateCard.BILLING_STATUS;
      if (billStatusVal == "") {
        billStatusVal = "Billed";
      }
      switch (billStatusVal) {
        case "Investment":
          bill_status_class = "invest_sow_table";
          break;
        case "Bench":
          bill_status_class = "bench_sow_table";
          break;
        default:
          bill_status_class = "billed_sow_table";
      }
      let sowNameClass = $("#sowNameID")
        .html()
        .trim()
        .replace(/ /g, "_");
      let class_value = 0;
      let lastClass = $("#billing_exp_div tr:last").attr("class");
      let size = 0;
      if (personaStatus == true) {
        if (rateCard.BILLING_RATE_USD >= 0) {
          let lastClass = $("#billing_exp_div tr:last").attr("class");
          if (lastClass != undefined) {
            lastClass = lastClass.replace(sowNameClass, "");
            lastClass = lastClass.replace("_", "");
            size = parseInt(lastClass, 10) + 1;
          } else {
            size = 1;
          }
          let locationName = rateCard.LOCATION;
          if (locationName == "India" || locationName == "INDIA") {
            locationName = "INDIA";
          }
          let billRateUsd = rateCard.BILLING_RATE_USD;
          let countRes = rateCard.NUMBER_OF_RESOURCE;
          // let days = rateCard.WORKING_DAYS;
          // let amount_cal = rateCard.AMOUNT;
          let days = 0;
          let amount_cal = 0;

          let bill_html = createPersonaDetails(
            size,
            sowId,
            persona_class,
            personaSKill,
            skillData,
            personaOpt,
            skillOptionsHtml,
            startDate,
            endDate,
            locat_class,
            locationName,
            locationOpt,
            bill_status_class,
            billStatusVal,
            billingOpt,
            billRateUsd,
            countRes,
            days,
            amount_cal,
            otherPersona,
            personaGrpNumber
          );
          $("#billing_exp_div").append(bill_html);
          $(`#bill_select_${size}`).val(billStatusVal);
          $(`#loc_select_${size}`).val(locationName);
          $(`#persona_select_${size}`).val(personaSKill);
          // $("#s2id_persona_skill_" + size).val(skillData)
          console.log("CALL")
          initializePersonaRowEvents(size);
          $("#start_date_input_" + size).datepicker({
            format: "mm-dd-yy",
            uiLibrary: "bootstrap",
          });
          $("#end_date_input_" + size).datepicker({
            format: "mm-dd-yy",
            uiLibrary: "bootstrap",
          });
          $(".input-group-addon").hide();

          let skillOptionsHtmlnew = "";

          // Generate the options and mark the selected one
          $.each(sowDropDownJson.SKILL_LEVEL, function (i, skillOpt) {
            const isSelected = skillData.includes(skillOpt.trim())
              ? "selected"
              : ""; // Check if the option matches the skillData
            skillOptionsHtmlnew += `<option value="${skillOpt.trim()}" ${isSelected}>${skillOpt.trim()}</option>`;
          });

          // Populate the skill options in the dropdown
          const skillDropdown = $(`#persona_skill_${size}`);
          skillDropdown.html(skillOptionsHtmlnew);

          // Initialize the multiselect dropdown
          skillDropdown
            .multiselect({
              columns: 1,
              placeholder: "Select Skills",
              search: true,
              buttonText: function (options) {
                if (options.length === 0) {
                  return "Select Skills"; // Default placeholder
                } else {
                  // Display the actual selected values
                  return options.map((option) => $(option).text()).join(", ");
                }
              },
              appendTo: "body", // Render dropdown in the <body> to avoid clipping
            })
            .on("change", function () {
              console.log("Multiselect options updated!");
            });
        }
      } else {
        let us_count = parseInt(sow_acc_data.NUMBER_OF_RESOURCE_US);
        let ind_count = parseInt(sow_acc_data.NUMBER_OF_RESOURCE_IND);
        if (usStatus == false) {
          if (us_count > 0) {
            let lastClass = $("#billing_exp_div tr:last").attr("class");
            if (lastClass != undefined) {
              lastClass = lastClass.replace(sowNameClass, "");
              lastClass = lastClass.replace("_", "");
              size = parseInt(lastClass, 10) + 1;
            } else {
              size = 1;
            }
            class_value++;
            usStatus = true;
            let bill_html = createPersonaDetails(
              size,
              sowId,
              persona_class,
              "TBD",
              "",
              personaOpt,
              skillOptionsHtml,
              startDate,
              endDate,
              locat_class,
              "US",
              locationOpt,
              bill_status_class,
              billStatusVal,
              billingOpt,
              "0",
              us_count,
              0,
              0,
              personaGrpNumber
            );
            $("#billing_exp_div").append(bill_html);
            $(`#bill_select_${size}`).val("Billed");
            $(`#loc_select_${size}`).val("US");
            $(`#persona_select_${size}`).val("TBD");
            $("#s2id_persona_skill_" + size).val(skillData);

            $("#start_date_input_" + size).datepicker({
              format: "mm-dd-yy",
              uiLibrary: "bootstrap",
            });
            $("#end_date_input_" + size).datepicker({
              format: "mm-dd-yy",
              uiLibrary: "bootstrap",
            });
            $(".input-group-addon").hide();
            $(`#persona_skill_${size}`).html(skillOptionsHtml);

            // Initialize the multiselect functionality
            $(`#persona_skill_${size}`)
              .multiselect({
                columns: 1,
                placeholder: "Select Skills", // Placeholder text
                search: true, // Enables the search bar
                buttonText: function (options, select) {
                  // Customize button text
                  let selectedCount = options.length;

                  if (selectedCount === 0) {
                    return "Select Skills"; // Default placeholder
                  } else if (selectedCount <= 2) {
                    // Show selected options for up to 2 items
                    return options.map((option) => $(option).text()).join(", ");
                  } else {
                    // Show "X Selected" for more than 2 items
                    return `${selectedCount} Selected`;
                  }
                },
              })
              .on("change", function () {
                console.log("Multiselect options updated!");
              });
          }
        }
        if (indStatus == false) {
          if (ind_count > 0) {
            let lastClass = $("#billing_exp_div tr:last").attr("class");
            if (lastClass != undefined) {
              lastClass = lastClass.replace(sowNameClass, "");
              lastClass = lastClass.replace("_", "");
              size = parseInt(lastClass, 10) + 1;
            } else {
              size = 1;
            }
            class_value++;
            indStatus = true;
            let bill_html = createPersonaDetails(
              size,
              sowId,
              persona_class,
              "TBD",
              "",
              personaOpt,
              skillOptionsHtml,
              startDate,
              endDate,
              locat_class,
              "INDIA",
              locationOpt,
              bill_status_class,
              billStatusVal,
              billingOpt,
              "0",
              us_count,
              0,
              0,
              personaGrpNumber
            );
            $("#billing_exp_div").append(bill_html);
            $(`#bill_select_${size}`).val("Billed");
            $(`#loc_select_${size}`).val("INDIA");
            $(`#persona_select_${size}`).val("TBD");
            $("#s2id_persona_skill_" + size).val(skillData);

            $("#start_date_input_" + size).datepicker({
              format: "mm-dd-yy",
              uiLibrary: "bootstrap",
            });
            $("#end_date_input_" + size).datepicker({
              format: "mm-dd-yy",
              uiLibrary: "bootstrap",
            });
            $(".input-group-addon").hide();
            $(`#persona_skill_${size}`).html(skillOptionsHtml);

            // Initialize the multiselect functionality
            $(`#persona_skill_${size}`)
              .multiselect({
                columns: 1,
                placeholder: "Select Skills", // Placeholder text
                search: true, // Enables the search bar
                buttonText: function (options, select) {
                  // Customize button text
                  let selectedCount = options.length;
                  console.log("selectedCount ", selectedCount);

                  if (selectedCount === 0) {
                    return "Select Skills"; // Default placeholder
                  } else if (selectedCount <= 2) {
                    // Show selected options for up to 2 items
                    return options.map((option) => $(option).text()).join(", ");
                  } else {
                    // Show "X Selected" for more than 2 items
                    return `${selectedCount} Selected`;
                  }
                },
              })
              .on("change", function () {
                console.log("Multiselect options updated!");
              });
          }
        }
      }
    });
  } else {
    let locat_class = "us_bill_table";
    let bill_status_class = "billed_sow_table";
    let billStatusVal = "Billed";
    let persona_class = "persona_button";
    let startDate = "";
    let endDate = "";
    let skillData = "";
    let usStatus = false;
    let indStatus = false;
    let us_count = parseInt(sow_acc_data.NUMBER_OF_RESOURCE_US);
    let ind_count = parseInt(sow_acc_data.NUMBER_OF_RESOURCE_IND);
    let class_value = 0;
    if (usStatus == false) {
      if (us_count > 0) {
        let lastClass = $("#billing_exp_div tr:last").attr("class");
        if (lastClass != undefined) {
          lastClass = lastClass.replace(sowNameClass, "");
          lastClass = lastClass.replace("_", "");
          size = parseInt(lastClass, 10) + 1;
        } else {
          size = 1;
        }
        class_value++;
        usStatus = true;
        let bill_html = createPersonaDetails(
          size,
          sowId,
          persona_class,
          "TBD",
          "",
          personaOpt,
          skillOptionsHtml,
          startDate,
          endDate,
          locat_class,
          "US",
          locationOpt,
          bill_status_class,
          billStatusVal,
          billingOpt,
          "0",
          us_count,
          0,
          0,
          ""
        );
        $("#billing_exp_div").append(bill_html);
        $(`#bill_select_${size}`).val(billStatusVal);
        $(`#loc_select_${size}`).val("US");
        $(`#persona_select_${size}`).val("TBD");
        $("#s2id_persona_skill_" + size).val(skillData);
        $("#start_date_input_" + size).datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
        });
        $("#end_date_input_" + size).datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
        });
        $(".input-group-addon").hide();
        $(`#persona_skill_${size}`).html(skillOptionsHtml);

        // Initialize the multiselect functionality
        $(`#persona_skill_${size}`)
          .multiselect({
            columns: 1,
            placeholder: "Select Skills", // Placeholder text
            search: true, // Enables the search bar
            buttonText: function (options, select) {
              // Customize button text
              let selectedCount = options.length;
              console.log("selectedCount ", selectedCount);

              if (selectedCount === 0) {
                return "Select Skills"; // Default placeholder
              } else if (selectedCount <= 2) {
                // Show selected options for up to 2 items
                return options.map((option) => $(option).text()).join(", ");
              } else {
                // Show "X Selected" for more than 2 items
                return `${selectedCount} Selected`;
              }
            },
          })
          .on("change", function () {
            console.log("Multiselect options updated!");
          });
      }
    }
    if (indStatus == false) {
      if (ind_count > 0) {
        let lastClass = $("#billing_exp_div tr:last").attr("class");
        if (lastClass != undefined) {
          lastClass = lastClass.replace(sowNameClass, "");
          lastClass = lastClass.replace("_", "");
          size = parseInt(lastClass, 10) + 1;
        } else {
          size = 1;
        }
        class_value++;
        indStatus = true;
        let bill_html = createPersonaDetails(
          size,
          sowId,
          persona_class,
          "TBD",
          "",
          personaOpt,
          skillOptionsHtml,
          startDate,
          endDate,
          locat_class,
          "INDIA",
          locationOpt,
          bill_status_class,
          billStatusVal,
          billingOpt,
          "0",
          us_count,
          0,
          0,
          ""
        );
        $("#billing_exp_div").append(bill_html);
        $(`#bill_select_${size}`).val(billStatusVal);
        $(`#loc_select_${size}`).val("INDIA");
        $(`#persona_select_${size}`).val("TBD");
        $("#s2id_persona_skill_" + size).val(skillData);
        $("#start_date_input_" + size).datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
        });
        $("#end_date_input_" + size).datepicker({
          format: "mm-dd-yy",
          uiLibrary: "bootstrap",
        });
        $(".input-group-addon").hide();
        $(`#persona_skill_${size}`).html(skillOptionsHtml);

        // Initialize the multiselect functionality
        $(`#persona_skill_${size}`)
          .multiselect({
            columns: 1,
            placeholder: "Select Skills", // Placeholder text
            search: true, // Enables the search bar
            buttonText: function (options, select) {
              // Customize button text
              let selectedCount = options.length;
              console.log("selectedCount ", selectedCount);

              if (selectedCount === 0) {
                return "Select Skills"; // Default placeholder
              } else if (selectedCount <= 2) {
                // Show selected options for up to 2 items
                return options.map((option) => $(option).text()).join(", ");
              } else {
                // Show "X Selected" for more than 2 items
                return `${selectedCount} Selected`;
              }
            },
          })
          .on("change", function () {
            console.log("Multiselect options updated!");
          });
      }
    }
  }
  checkEditAccess();
  $(".resourceDate").datepicker({
    format: "mm-dd-yy",
    uiLibrary: "bootstrap",
  });
  appendSowAndProj();
  if (sowSelectedSource == "renew") {
    $("#sow_edit").click();
    $("#sow_resource_bill").click();
    $("#billing_exp_div tbody tr").each(function () {
      let dataId = this.id;
      dataId = dataId.replace("bill_persona_", "");
      $("#show_hide_bt_" + dataId).click();
    });
  }
  let tb = $("#billing_exp_div:eq(0) tbody");
  tb.find("tr").each(function (index) {
    // Assign resourceNumber based on the row index (starting from 1)
    let resourceNumber = index + 1;

    $("#persona_text_" + resourceNumber).hide();
    $("#s2id_persona_select_" + resourceNumber).show();
    $("#persona_select_" + resourceNumber).show();
    $("#persona_skill_" + resourceNumber).hide();
    $("#s2id_persona_skill_" + resourceNumber).show();
    $("#start_date_" + resourceNumber).hide();
    $("#start_date_input_" + resourceNumber).show();
    $("#end_date_" + resourceNumber).hide();
    $("#end_date_input_" + resourceNumber).show();
    $("#loc_text_" + resourceNumber).hide();
    $("#loc_select_" + resourceNumber).show();
    $("#bill_status_" + resourceNumber).hide();
    $("#bill_select_" + resourceNumber).show();
    $("#bill_us_" + resourceNumber).hide();
    $("#bill_us_rate_" + resourceNumber).show();
    $("#bill_ind_" + resourceNumber).hide();
    $("#bill_ind_input_" + resourceNumber).show();
  });

  let getUserEmail = localStorage.getItem("email");
  let getUserId = localStorage.getItem("EmpUserID");
  let getUserRole = localStorage.getItem("user-role");
  // const isUserInDelivery = deliveryMembers.some(member => member.EMPLOYEE_ID === getUserId);
  const isUserInDelivery = Array.isArray(deliveryMembers) && deliveryMembers.some(
    member => member.EMPLOYEE_ID === getUserId
  );
  const isUserInGrowth = Array.isArray(growthMembers) && growthMembers.some(
    member => member.EMPLOYEE_ID === getUserId
  );

  console.log("isUserInDelivery sow - ", isUserInDelivery);
  console.log("isUserInGrowth sow - ", isUserInGrowth);
  // if (isUserInGrowth || getUserRole == "admin" || getUserEmail == 'akhilesh@factspan.com') {
  //   $('#sow_edit').show();
  // } else {
  //   $('#sow_edit').hide();
  // }

  // Hide billing rate and amount columns after table is fully populated
  hideBillingRateAmountColumns(sow_acc_data);
  $(".loader").css("display", "none");
  $(".show_page").css("display", "block");
}

function appendSowAndProj() {
  calculateSowAmount("getProjected");
}

function getCreatedByname() {
  let selectedOppOwnername = $("#acc_growth_name_option").val();
  console.log("selectedOppOwnername - ", selectedOppOwnername);
  console.log("opportunityOwnersJsonData - ", opportunityOwnersJsonData);
  $("#growth_created_by_option").empty();
  let reportingbyHtml = "";
  $.each(opportunityOwnersJsonData, function (i, oppOwn) {
    if (oppOwn.EMPLOYEE_ID == selectedOppOwnername) {
      $.each(oppOwn.REPORTING_EMPLOYEES, function (j, reportEmp) {
        reportingbyHtml += `<option value=${reportEmp.REPORTING_EMPLOYEE_ID}>${reportEmp.REPORTING_EMPLOYEE}</option>`;
      });
    }
  });
  $("#growth_created_by_option").append(reportingbyHtml);
  $("#created_by_name").empty();
  $("#created_by_name").append($("#growth_created_by_option").val());
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
console.log(convert("Mon, 11 Nov 2013 00:00:00 GMT"));

function createDiv(data, value) {
  let hoverValue = "";
  if (data != "-") {
    hoverValue = `<div class="SerialNumberTooltip">${value}</div>`;
  }
  return `<div class="SerialNumberContainer">
              <div class="SerialNumber">${data}</div>
              ${hoverValue}
          </div>`;
}

function tootTipRole_op(temp) {
  let emp_name = "";
  $.each(temp, function (i, name) {
    emp_name = emp_name + `<li>${name} </li>`;
  });
  return `<span class='spnTooltip'>
                  <ul>${emp_name}<ul>
            </span>`;
}

function bill_edit_save(button) {
  var x = $("#showhide");
  $(button)
    .find("i")
    .remove();
  let resourceNumber = $(button)
    .closest("tr")
    .children("td:eq(0)")
    .text()
    .trim();
  resourceNumber = resourceNumber.replace("Resource ", "");
  if (
    $(button)
      .text()
      .trim() == "Edit"
  ) {
    $(button)
      .html($("<i/>", { class: "fa fa-floppy-o" }))
      .append(" Save");
    x.fadeIn();
    if (sowDropDownJson.length == 0) {
      getSowViewData();
    }
    $("#persona_text_" + resourceNumber).hide();
    $("#s2id_persona_select_" + resourceNumber).show();
    $("#persona_select_" + resourceNumber).show();
    $("#persona_skill_" + resourceNumber).hide();
    $("#s2id_persona_skill_" + resourceNumber).show();
    $("#start_date_" + resourceNumber).hide();
    $("#start_date_input_" + resourceNumber).show();
    $("#end_date_" + resourceNumber).hide();
    $("#end_date_input_" + resourceNumber).show();
    $("#loc_text_" + resourceNumber).hide();
    $("#loc_select_" + resourceNumber).show();
    $("#bill_status_" + resourceNumber).hide();
    $("#bill_select_" + resourceNumber).show();
    $("#bill_us_" + resourceNumber).hide();
    $("#bill_us_rate_" + resourceNumber).show();
    $("#bill_ind_" + resourceNumber).hide();
    $("#bill_ind_input_" + resourceNumber).show();
  } else {
    $(button)
      .html($("<i/>", { class: "fa fa-pencil-square-o" }))
      .append(" Edit");
    x.fadeOut();
    $("#persona_text_" + resourceNumber).show();
    $("#s2id_persona_select_" + resourceNumber).hide();
    $("#persona_select_" + resourceNumber).hide();
    $("#persona_skill_" + resourceNumber).hide();
    let skillData = $("#persona_skill_" + resourceNumber).val();
    const unique = (arr) => [...new Set(arr)];
    let skill_uniq = unique(skillData);
    let skillHtml = "";
    if (skill_uniq.length > 0) {
      skillHtml = tootTipRole_op(skill_uniq);
    }
    $("#s2id_persona_skill_" + resourceNumber).hide();
    let per_class = "#persona_text_" + resourceNumber;
    let skillDivHtml = createDiv(
      $("#persona_select_" + resourceNumber + " option:selected").val(),
      skillHtml
    );
    $(per_class).html(skillDivHtml);
    $("#start_date_" + resourceNumber).show();
    $("#start_date_input_" + resourceNumber).hide();
    $("#start_date_" + resourceNumber).html(
      $("#start_date_input_" + resourceNumber).val()
    );
    $("#end_date_" + resourceNumber).show();
    $("#end_date_input_" + resourceNumber).hide();
    $("#end_date_" + resourceNumber).html(
      $("#end_date_input_" + resourceNumber).val()
    );
    $("#loc_text_" + resourceNumber).show();
    $("#loc_select_" + resourceNumber).hide();
    $("#loc_text_" + resourceNumber).html(
      $("#loc_select_" + resourceNumber + " option:selected").val()
    );
    $("#bill_status_" + resourceNumber).show();
    $("#bill_select_" + resourceNumber).hide();
    $("#bill_status_" + resourceNumber).html(
      $("#bill_select_" + resourceNumber + " option:selected").val()
    );
    $("#bill_us_" + resourceNumber).show();
    $("#bill_us_rate_" + resourceNumber).hide();
    $("#bill_us_" + resourceNumber).html(
      $("#bill_us_rate_" + resourceNumber).val()
    );
    $("#bill_ind_" + resourceNumber).show();
    $("#bill_ind_input_" + resourceNumber).hide();
    $("#bill_ind_" + resourceNumber).html(
      $("#bill_ind_input_" + resourceNumber).val()
    );
  }
}

function sow_edit_save(button) {
  $("#fullScreenLoader").show();
  const inputField = document.getElementById("sow_amount");

  inputField.addEventListener("change", function () {
    console.log("Input field value changed:", inputField.value);
    sow_amount_user_edit = "YES";
  });
  console.log("sow_amount_user_edit", sow_amount_user_edit);
  sowUpdateData();
  // checkEditAccess();
}
let clickRenewButton = "";
function renew_button(obj) {
  clickRenewButton = obj;
  $("#sow_edit").click();
  $("#funnel_name").html("Renewal");
  $("#funnel_options").val("Renewal");
  $("#probab_name").html("70");
  $("#probability_options").val("70");
  $("#sow_resource_bill").click();
  $("#billing_exp_div tbody tr").each(function () {
    let dataId = this.id;
    dataId = dataId.replace("bill_persona_", "");
    $("#show_hide_bt_" + dataId).click();
  });
}

function sow_delete() {
  let sowName = sow_acc_data.SOW_NAME;
  bootbox.confirm({
    message: "Are sure you want delete the SOW name - <b>" + sowName + "</b>?",
    buttons: {
      confirm: {
        label: "Yes",
        className: "btn-success",
      },
      cancel: {
        label: "No",
        className: "btn-danger",
      },
    },
    callback: function (result) {
      let takeApprovalResponse = "Yes";
      approverName = "";
      if (result) {
        let today = new Date();
        let date =
          today.getFullYear() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getDate();
        let time =
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds();
        let CurrentDateTime = date + " " + time;
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
        let sow_delete_data =
          '{ "ACCOUNT_NAME" : "' +
          sow_acc_data.ACCOUNT_NAME +
          '", "SOW_NAME":"' +
          sow_acc_data.SOW_NAME +
          '", "SOW_ID":"' +
          sow_acc_data.SOW_ID +
          '", "LEGAL_START_DATE":"' +
          sow_acc_data.LEGAL_START_DATE +
          '", "LEGAL_END_DATE":"' +
          sow_acc_data.LEGAL_END_DATE +
          '", "BILLING_START_DATE":"' +
          sow_acc_data.BILLING_START_DATE +
          '", "BILLING_END_DATE":"' +
          sow_acc_data.BILLING_END_DATE +
          '", "ACTUAL_START_DATE":"' +
          sow_acc_data.ACTUAL_START_DATE +
          '", "ACTUAL_END_DATE":"' +
          sow_acc_data.ACTUAL_END_DATE +
          '", "PROBABILITY":"' +
          sow_acc_data.PROBABILITY +
          '", "TOTAL_NUMBER_OF_RESOURCE":"' +
          sow_acc_data.TOTAL_NUMBER_OF_RESOURCE +
          '", "NUMBER_OF_RESOURCE_US":"' +
          sow_acc_data.NUMBER_OF_RESOURCE_US +
          '", "NUMBER_OF_RESOURCE_IND":"' +
          sow_acc_data.NUMBER_OF_RESOURCE_IND +
          '", "PRICING_PLAN":"' +
          sow_acc_data.PRICING_PLAN +
          '", "SOW_AMOUNT":"' +
          parseInt(sow_acc_data.SOW_AMOUNT, 10) +
          '", "CREATED_BY":"' +
          sow_acc_data.CREATED_BY +
          '", "CREATED_DATE":"' +
          sow_acc_data.CREATED_DATE +
          '", "SOW_STATUS":"' +
          sow_acc_data.SOW_STAGE +
          '", "SOW_TYPE":"' +
          sow_acc_data.SOW_TYPE +
          '", "UPDATED_BY":"' +
          empId +
          '", "UPDATED_DATE":"' +
          CurrentDateTime +
          '"}';
        approverName = "Business head";
        let approvalData =
          '{ "TAKE_APPROVAL" : "' +
          takeApprovalResponse +
          '", "APPROVER":"' +
          approverName +
          '"}';

        let deleteSowData = {
          query_type: "update_sow_active_status",
          environment: apiValue.environment,
          user_details: "[" + accessDetails + "]",
          APPROVAL_DATA: "[" + approvalData + "]",
          sow_data: "[" + sow_delete_data + "]",
        };

        $.ajax({
          url: apiValue.url,
          type: "POST",
          dataType: "json",
          crossDomain: true,
          format: "json",
          data: JSON.stringify(deleteSowData),
          success: function (json) {
            if (json.Message == "Success") {
              toastr.options.timeOut = 2000; // 2s
              toastr.success(json.Response);
            } else {
              toastr.options.timeOut = 2000; // 2s
              toastr.error(json.Response);
            }
          },
          error: function (error) {
            console.log("message Error" + JSON.stringify(error));
            toastr.options.timeOut = 2000; // 2s
            toastr.error("Message error" + JSON.stringify(error));
            // $("#sow_edit").show();
          },
        });
      } else {
        console.log("user cancelled to delete this SOW");
      }
    },
  });
}

function addSkill() {
  if (sowDropDownJson.length == 0) {
    getSowViewData();
  }
  console.log('sow_acc_data  - ', sow_acc_data)
  let persona_class = "persona_button";
  let locat_class = "us_bill_table";
  let bill_status_class = "billed_sow_table";
  let tb = $("#billing_exp_div:eq(0) tbody");
  let sowNameClass = $("#sowNameID")
    .html()
    .trim()
    .replace(/ /g, "_");
  let lastClass = $("#billing_exp_div tr:last").attr("class");
  let size = 0;
  let resourceGSize = 0, getResourceLastGsize = "";
  // If there are existing rows in DOM, use them to get the next number
  if (lastClass != undefined) {
    lastClass = lastClass.replace(sowNameClass, "");
    lastClass = lastClass.replace("_", "");
    size = parseInt(lastClass, 10) + 1;
    getResourceLastGsize = $("#res_grp_number_"+(size-1)).text(); 
    resourceGSize = getResourceLastGsize.replace("Resource ", "");
    resourceGSize = parseInt(resourceGSize, 10) + 1;
    console.log('getResourceLastGsize - ', getResourceLastGsize)
    console.log('resourceGSize - ', resourceGSize)
  } else {
    // No existing rows - get next resource number from BILLING_RATE_DATA API data
    let billingRateData = sow_acc_data.BILLING_RATE_DATA || [];
    if (billingRateData.length > 0) {
      // Get the last RESOURCE_GROUP and extract the number
      let lastResourceGroup = billingRateData[billingRateData.length - 1].RESOURCE_GROUP;
      // Extract number from "Resource X" format
      let match = lastResourceGroup.match(/Resource\s+(\d+)/i);
      if (match && match[1]) {
        size = parseInt(match[1], 10) + 1;
        getResourceLastGsize = $("#res_grp_number_"+(size-1)).text(); 
        resourceGSize = getResourceLastGsize.replace("Resource ", "");
        resourceGSize = parseInt(resourceGSize, 10) + 1;
        console.log('getResourceLastGsize - ', getResourceLastGsize)
        console.log('resourceGSize - ', resourceGSize)
      } else {
        size = 1;
        resourceGSize = 1;
      }
    } else {
      size = 1;
      resourceGSize = 1;
    }
  }
  let currentTeamSizeValue = parseInt($("#new_team").val(), 10);
  if (isNaN(currentTeamSizeValue)) {
    currentTeamSizeValue = 0;
  }

  // Increment the value by 1
  let updatedNewTeamSizeValue = currentTeamSizeValue + 1;

  // Assign the updated value back to #new_team
  $("#new_team").val(updatedNewTeamSizeValue);
  let actualStartDate = $("#actual_start_date").val();
  let actualEndDate = $("#actual_end_date").val();
  let addSkillHtml = `<tr class="${sowNameClass}_${size} persona_table_details" id="bill_persona_${size}">
                        <td style="display:none" id="res_number_${size}">Resource ${size}</td>
                        <td class="persona_skills_td" id="persona_details_${size}">
    <div class="${persona_class}" id="persona_text_${size}" style="display:none">
        ${createDiv("-", "")}
    </div>
    <div class="custom-tooltip-wrapper">
  <select id="persona_select_${size}" class="form-control select_persona">
    ${personaOpt}
  </select>
  <div id="tooltip_${size}" class="custom-tooltip" style="display:none; position:absolute;"></div>
</div>
    <div id="others_input_${size}" style="display: none; margin-top: 10px; width: 100%; position: relative;">
  <input
    type="text"
    class="form-control"
    id="other_text_${size}"
    placeholder="Specify here"
    style="width: 100%; padding-right: 30px; height: 30px; font-size: 12px;border: 1px solid #D9D9D9;"
  >
  <button
    type="button"
    id="submit_other_${size}"
    class="btn"
    style="
      position: absolute;
      top: 50%;
      right: 5px;
      transform: translateY(-50%);
      padding: 0 6px;
      height: 22px;
      font-size: 12px;
      line-height: 1;
      background: none;
      border: none;
      color: #007bff;
    "
  >➤</button>
</div>

</td>

<td style="display:none" class="skills_td" id="skills_details_${size}">
      <!-- This is where the persona skills multi-select dropdown will go -->
      <select name="personaSkills[]" id="persona_skill_${size}" class="skillDataOpt" multiple="multiple"></select>
    </td>
                          
                        <td>
                          <span id="start_date_${size}" style="display:none">

                          </span>
                          <input type="text" class="form-control placeicon dateData resourceDate autoStartUpdateDate" 
                            id="start_date_input_${size}"
                            placeholder="&#xf073; MM-DD-YY" 
                            name="resource_start_date" 
                            autocomplete="off" 
                            style="z-index: 1;"
                             onchange="checkEndDate('start_date_input_${size}', 'end_date_input_${size}', 'Resource End Date should be greater than Resource Start Date'),calculateSowAmount(this)"
                             value="${actualStartDate}"/>

                        </td>
                        <td>
                          <span id="end_date_${size}" style="display:none">
                           
                          </span>
                          <input type="text" class="form-control placeicon dateData resourceDate autoEndUpdateDate" 
                            id="end_date_input_${size}"
                            placeholder="&#xf073; MM-DD-YY" 
                            name="resource_end_date" 
                            autocomplete="off" 
                            style="z-index: 1;"  
                            onchange="checkEndDate('start_date_input_${size}', 'end_date_input_${size}', 'Resource End Date should be greater than Resource Start Date'),calculateSowAmount(this)"
                            value="${actualEndDate}"/>
                        </td>
                        <td>
                          <span id="bill_days_${size}" class="days_amount">0</span>
                        </td>
                        <td>
                          <span class="${locat_class}" id="loc_text_${size}" style="display:none">
                            
                          </span>
                          <select class="form-control text_center" id="loc_select_${size}" onchange="locSowAmount(this)">
                            ${locationOpt}
                          </select>
                        </td>
                        <td>
                          <span class="${bill_status_class}" id="bill_status_${size}" style="display:none">
                           
                          </span>
                          <select class="form-control text_center" id="bill_select_${size}"  onchange="calculateSowAmount(this)">
                            ${billingOpt}   
                          </select>
                        </td>
                        <td>
                          <span id="bill_us_${size}" style="display:none">
                            
                          </span>
                          <input type="number" step="any" class="form-control text_center" id="bill_us_rate_${size}" placeholder="Bill US"   oninput="handleIntegerOnly(this)" min=0 value=0 />
                        </td>
                        <td>
                          <span id="bill_ind_${size}"  style="display:none">
                            
                          </span>
                          <input type="number" class="form-control text_center" id="bill_ind_input_${size}" placeholder="Bill Ind" oninput="handleIntegerValuesOnly(this)" min=1 value=1 step="1" />
                        </td>
                        
                        <td class="cal_amt_val">
                          <span id="bill_amount_${size}" class="days_amount">$0</span>
                        </td>
                        <td>
                            
                            <button class="btn btn-info delete_button" onclick="deleteSkill(this)"><i class="fa fa-trash"
                            aria-hidden="true"></i>
                          </button>
                        </td>
                        <td style="display: none" id="res_grp_number_${size}">Resource ${resourceGSize}</td>
                      </tr>`;
  $("#billing_exp_div").append(addSkillHtml);
  var billingDropdown = document.getElementById("billing_options");
  var billingType = billingDropdown.value.trim(); // Get and trim the value
  console.log(billingType); // Log the value to check
  // If the billing option is "Fixed Price", hide the Billing Rate and Amount columns
  if (billingType === "Fixed Price") {
    hideBillingRateAmountColumns(sow_acc_data); // This will hide the columns in header and body
  }

  let loc_status = "#loc_select_" + size;
  loc_status = $(loc_status).val();
  if (loc_status == "US") {
    $("#bill_us_rate_" + size).val(bill_us_default);
  } else if (loc_status == "India" || loc_status == "INDIA") {
    $("#bill_us_rate_" + size).val(bill_ind_default);
  }
  $("#start_date_input_" + size).datepicker({
    format: "mm-dd-yy",
    uiLibrary: "bootstrap",
  });
  $("#end_date_input_" + size).datepicker({
    format: "mm-dd-yy",
    uiLibrary: "bootstrap",
  });
  $(".input-group-addon").hide();
  let skillOptionsHtml = "";
  $.each(sowDropDownJson.SKILL_LEVEL, function (i, skillOpt) {
    skillOptionsHtml += `<option value="${skillOpt.trim()}">${skillOpt.trim()}</option>`;
  });
  // console.log("skillOptionsHtml------", skillOptionsHtml); // Verify the generated options
  $(`#persona_select_${size}`).on("change", function () {
    const selectedVal = $(this).val();
    if (selectedVal === "Others") {
      $(`#others_input_${size}`).slideDown();
    } else {
      $(`#others_input_${size}`).slideUp();
      $(this).removeAttr("title");
      $(`#tooltip_${size}`).removeClass("show").text("");
    }
  });

  // Handle repeated clicks when "Others" is already selected
  $(`#persona_select_${size}`).on("click", function () {
    const selectedVal = $(this).val();
    if (selectedVal === "Others") {
      $(`#others_input_${size}`).slideDown();
    }
  });

  $(`#persona_select_${size}`).on("mouseenter", function () {
    $(this).removeAttr("title"); // Remove browser tooltip
    const selectedVal = $(this).val();
    const tooltip = $(`#tooltip_${size}`);
    if (selectedVal === "Others") {
      const customVal = $(`#other_text_${size}`).val();
      console.log("customVal - ", customVal);
      if (customVal) {
        tooltip.text(customVal).addClass("show");
      } else {
        tooltip.removeClass("show").text("");
      }
    } else {
      tooltip.removeClass("show").text("");
    }
  });

  $(`#persona_select_${size}`).on("mouseleave", function () {
    $(`#tooltip_${size}`).removeClass("show");
  });

  function submitCustomPersona() {
    const customPersona = $(`#other_text_${size}`).val().trim();

    if (customPersona) {
      const $select = $(`#persona_select_${size}`);
      const $tooltip = $(`#tooltip_${size}`);

      $tooltip.text(customPersona);
      $select.val("Others");

      let customOption = $select.find("option[value='custom']");
      if (customOption.length !== 0) {
        customOption.text(customPersona);
        customOption.prop("selected", true);
      }

      $(`#others_input_${size}`).slideUp();
      toastr.success(`Please click on update to save the persona - ${customPersona}`);
    } else {
      toastr.error("Please enter a custom persona before submitting");
    }
  }


  $(`#submit_other_${size}`).on("click", submitCustomPersona);

  $(`#other_text_${size}`).on("keypress", function (e) {
    if (e.which === 13) {
      e.preventDefault();
      submitCustomPersona();
    }
  });
  // Populate the skill options in the dropdown
  $(`#persona_skill_${size}`).html(skillOptionsHtml);

  // Initialize the multiselect dropdown
  $(`#persona_skill_${size}`)
    .multiselect({
      columns: 1,
      placeholder: "Select Skills",
      search: true,
      buttonText: function (options) {
        let selectedCount = options.length;
        if (selectedCount === 0) {
          return "Select Skills"; // Default placeholder
        } else if (selectedCount <= 3) {
          // Show selected options for up to 3 items
          return options.map((option) => $(option).text()).join(", ");
        } else {
          // Show "X Selected" for more than 3 items
          return `${selectedCount} Selected`;
        }
      },
      appendTo: "body", // Render dropdown in the <body> to avoid clipping
    })
    .on("change", function () {
      console.log("Multiselect options updated!");
    });
  calculateSowAmount();

}

function locSowAmount(button) {
  let resourceNumber = $(button)
    .closest("tr")
    .children("td:eq(0)")
    .text()
    .trim();
  resourceNumber = resourceNumber.replace("Resource ", "");
  console.log(resourceNumber, resourceNumber);

  // let loc_status = "#loc_select_" + resourceNumber;
  // loc_status = $(loc_status).val();
  // if (loc_status == "US") {
  //   $("#bill_us_rate_" + resourceNumber).val(bill_us_default);
  // } else if (loc_status == "India" || loc_status == "INDIA") {
  //   $("#bill_us_rate_" + resourceNumber).val(bill_ind_default);
  // }
  calculateSowAmount();
}

function checkEditAccess() {
  let editStatus = "Update";
  if (editStatus == "Edit") {
    $(".edit_disable").attr("disabled", true);
    $("#funnel_options").hide();
    $("#sow_options").hide();
    $("#billing_options").hide();
    $("#probability_options").hide();
    $("#acc_growth_name").show();
    $("#acc_growth_name_option").hide();
    $("#growth_created_by_option").hide();
    $("#created_by_name").show();
    let funnelOpt = $("#funnel_options option:selected").val();
    $("#funnel_name").html($("#funnel_options option:selected").val());
    $("#funnel_name").show();
    $("#probab_name").html($("#probability_options option:selected").val());
    $("#probab_name").show();
    $("#sow_type_name").html($("#sow_options").val());
    $("#sow_type_name").show();
    let billingTypeOpt = $("#billing_options option:selected").val();
    if (
      billingTypeOpt == "Time And Material" ||
      billingTypeOpt == "Time and Material" ||
      billingTypeOpt == "Time & Material"
    ) {
      billingTypeOpt = "Time and Material";
    }
    $("#billing_type_name").html(billingTypeOpt);
    $("#billing_type_name").show();
    console.log("billingTypeOpt -", billingTypeOpt);
    if (billingTypeOpt == '-1' || billingTypeOpt == '-' || billingTypeOpt == undefined || billingTypeOpt == null) {
      $("#billing_options").show();
      $("#billing_type_name").hide();
    }
    if (funnelOpt === "Scout" || funnelOpt === "Lead") {
      $("#billing_options").show();
      $("#billing_type_name").hide();
    }
    // Engagement notes fields: enabled as requested
    $('input[name="interactionType"], #meetingDate, .toggle-btn, #nextStepsText, #nextStepsEta, input[name="nextInteractionType"], #nextInteractionEta').prop('disabled', false);

    // Engagement notes visibility logic
    const isNA_edit = $('input[name="interactionType"]:checked').val() === 'N/A';
    if (isNA_edit || $('input[name="interactionType"]:checked').length === 0) {
      $('#meetingDate').closest('.date-field-inline').hide();
      $('.next-steps-header-row, .next-steps-content, .next-interaction-section, #nextInteractionContent').hide();
    } else {
      $('#meetingDate').closest('.date-field-inline').show();
      $('.next-steps-header-row, .next-steps-content, .next-interaction-section, #nextInteractionContent').show();
    }

  } else if (editStatus == "Update") {
    $(".edit_disable").attr("disabled", false);
    $("#funnel_options").show();
    $("#sow_options").show();
    $("#probability_options").show();
    $("#acc_growth_name").hide();
    $("#acc_growth_name_option").show();
    $("#growth_created_by_option").show();
    $("#created_by_name").hide();

    // Engagement notes fields: enabled in Update mode
    // interactionType is always enabled in Update mode
    $('input[name="interactionType"]').prop('disabled', false);

    const isNA_update = $('input[name="interactionType"]:checked').val() === 'N/A';
    if (isNA_update || $('input[name="interactionType"]:checked').length === 0) {
      $('#meetingDate, #nextStepsBtn, #noNextStepsBtn').prop('disabled', true);
      $('#meetingDate').closest('.date-field-inline').hide();
      $('.next-steps-header-row, .next-steps-content, .next-interaction-section, #nextInteractionContent').hide();
    } else {
      // Enable all fields when not N/A
      $('#meetingDate, #nextStepsBtn, #noNextStepsBtn, #nextStepsText, #nextStepsEta, #nextInteractionEta, input[name="nextInteractionType"]').prop('disabled', false);

      $('#meetingDate').closest('.date-field-inline').show();
      $('.next-steps-header-row, .next-steps-content, .next-interaction-section, #nextInteractionContent').show();

      if ($('#noNextStepsBtn').hasClass('active')) {
        $('#nextStepsContent, #nextStepsEtaWrapper').hide();
      } else {
        $('#nextStepsContent, #nextStepsEtaWrapper').show();
      }
    }




    let billingTypeOpt = $("#billing_options option:selected").val();

    $("#billing_type_name").html(billingTypeOpt);
    // $("#billing_type_name").show();
    // $("#billing_options").hide();
    let funnelOpt = $("#funnel_options option:selected").val();
    if (sow_acc_data.SOW_STAGE == "Signed") {
      $("#funnel_name").html($("#funnel_options option:selected").val());
      $("#funnel_name").show();
      $("#funnel_options").hide();
      $("#probab_name").html($("#probability_options option:selected").val());
      $("#probab_name").show();
      $("#probability_options").hide();
    } else {
      $("#funnel_name").hide();
      $("#funnel_options").show();
      $("#probab_name").hide();
      $("#probability_options").show();
    }
    // $("#sow_type_name").hide();
    // $("#billing_type_name").hide();
    console.log("billingTypeOpt 1 -", billingTypeOpt);
    if (billingTypeOpt == '-1' || billingTypeOpt == '-' || billingTypeOpt == undefined || billingTypeOpt == null) {
      $("#billing_options").show();
      $("#billing_type_name").hide();
    }
    if (funnelOpt === "Scout" || funnelOpt === "Lead") {
      $("#billing_options").show();
      $("#billing_type_name").hide();
    }
  }
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}


function getBuyingCenters(callback) {
  let apiURL = apiValue.url.replace("/app", "/get_buying_centers");
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({}),
    success: function (data) {
      console.log("Buying Centers API Response:", data);
      buyingCenterNps = data.stakeholder_details || [];
      if (callback && typeof callback === 'function') {
        callback();
      }
    },
    error: function (error) {
      console.log("Error fetching buying centers:", JSON.stringify(error));
      // keep old buyingCenterNps
      if (callback && typeof callback === 'function') {
        callback();
      }
    },
  });
}

function getSowViewData() {
  let apiURL = apiValue.url.replace("/app", "/sow_input_drop_down");
  let empId = localStorage.getItem("EmpUserID");
  let emp_email = localStorage.getItem("email");
  let emp_dep = localStorage.getItem("Department");
  const startTime = performance.now();
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({
      query_type: "sow_input_drop_down",
      environment: apiValue.environment,
      emp_id: empId,
      mail_id: emp_email,
      department: emp_dep,
      flag: "true",
    }),
    success: function (data) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(
        loadTimeInSeconds,
        "SowCreate",
        "Revenue",
        "sow_input_drop_down",
        "success",
        fileName,
        "SowCreate",
        "view"
      );
      $("#funnel_options").empty();
      $("#sow_options").empty();
      $("#billing_options").empty();
      funnelOptHtml = "";
      billingTypeHtml = "";
      sowTypeOptHtml = "";

      sowDropDownJson = data[0];
      console.log("sowDropDownJson", sowDropDownJson);
      // Removed: buyingCenterNps = sowDropDownJson.STAKEHOLDER_DETAILS;
      // Instead, call the API to get buying centers
      getBuyingCenters();
      console.log("buyingCenterNps", buyingCenterNps);

      let bu_head_name_html = "";
      defaultBillArr = sowDropDownJson.DEFAULT_BILLRATE;
      bill_us_default = sowDropDownJson.DEFAULT_BILLRATE_US;
      bill_ind_default = sowDropDownJson.DEFAULT_BILLRATE_IND;
      let growthLedOptHtml = "",
        growthReportMangHtml = "";
      opportunityOwnersJsonData = sowDropDownJson.OPPORTUNITY_OWNERS;
      deliveryMembers = sowDropDownJson.DELIVERY_MEMBERS;
      growthMembers = sowDropDownJson.OPPORTUNITY_OWNERS;
      $.each(sowDropDownJson.OPPORTUNITY_OWNERS, function (i, growth) {
        let reporting_emp = growth.REPORTING_EMPLOYEES;
        growthLedOptHtml += `<option value='${growth.EMPLOYEE_ID}'>${growth.EMPLOYEE_NAME}</option>`;
        // $.each(reporting_emp, function (i, reportMang) {
        //   growthReportMangHtml += `<option value='${reportMang.EMPLOYEE_ID}'>${reportMang.EMPLOYEE_NAME}</option>`;
        // });
      });
      $("#acc_growth_name_option").html(growthLedOptHtml);
      personaOpt += `<option value='TBD'>Select Persona</option>`;
      $.each(sowDropDownJson.DESIGNATION, function (i, persona) {
        personaOpt += `<option value='${persona}'>${persona}</option>`;
      });
      $.each(sowDropDownJson.BILLING_STATUS, function (i, billStat) {
        billingOpt += `<option value='${billStat}'>${billStat}</option>`;
      });
      $.each(sowDropDownJson.FUNNEL_STAGE, function (i, funnelOpt) {
        funnelOptHtml += `<option value="${funnelOpt}">${funnelOpt}</option>`;
      });
      sowTypeOptHtml += "<option value='-1'>Select SOW Type</option>";
      $.each(sowDropDownJson.PROJECT_TYPE, function (i, sowTypeOpt) {
        sowTypeOptHtml += `<option value="${sowTypeOpt}">${sowTypeOpt}</option>`;
      });
      $("#sow_options").append(sowTypeOptHtml);
      $.each(sowDropDownJson.SKILL_LEVEL, function (i, skillOpt) {
        skillOptionsHtml += `<option value="${skillOpt}">${skillOpt}</option>`;
      });
      billingTypeHtml += "<option value='-1'>Select Billing Type</option>";
      $.each(sowDropDownJson.BILLING_MODE_NAME, function (i, billingOpt) {
        billingTypeHtml += `<option value="${billingOpt}">${billingOpt}</option>`;
      });
      $("#billing_options").append(billingTypeHtml);
      $.each(sowDropDownJson.EMPLOYEE_DATA, function (i, empData) {
        bu_head_name_html += `<option value='${empData.EMPLOYEE_ID}'>${empData.EMPLOYEE_NAME}</option>`;
      });
      $("#sow_del_head").append(
        `<option value='-1'>Select </option>` + bu_head_name_html
      );
      let deliveryHeadName = sow_acc_data.DELIVERY_HEAD_NAME;
      if (deliveryHeadName == "Select " || deliveryHeadName == "") {
        deliveryHeadName = "";
      }
      $("#delivery_head_name").empty();
      $("#delivery_head_name").append(
        deliveryHeadName == "" ? "N/A" : deliveryHeadName
      );
      let sowDel =
        sow_acc_data.DELIVERY_HEAD == "" ? "-1" : sow_acc_data.DELIVERY_HEAD;
      $("#sow_del_head").val(sowDel);
      $("#sow_del_head").select2({});
      $("#sow_program_head").append(
        `<option value='-1'>Select </option>` + bu_head_name_html
      );
      let programLeadName = sow_acc_data.PROGRAM_LEAD_NAME;
      if (programLeadName == "Select " || programLeadName == "Select") {
        programLeadName = "";
      }
      $("#program_head_name").empty();
      $("#program_head_name").append(
        programLeadName == "" ? "N/A" : programLeadName
      );
      let sowProg =
        sow_acc_data.PROGRAM_LEAD == "" ? "-1" : sow_acc_data.PROGRAM_LEAD;
      $("#sow_program_head").val(sowProg);
      $("#sow_program_head").select2({});
      $("#sow_project_head").append(
        `<option value='-1'>Select </option>` + bu_head_name_html
      );
      let prjctLeadName = sow_acc_data.PROJECT_LEAD_NAME;
      if (prjctLeadName == "Select " || prjctLeadName == "Select") {
        prjctLeadName = "";
      }
      $("#project_head_name").empty();
      $("#project_head_name").append(
        prjctLeadName == "" ? "N/A" : prjctLeadName
      );
      let sowProj =
        sow_acc_data.PROJECT_LEAD == "" ? "-1" : sow_acc_data.PROJECT_LEAD;
      $("#sow_project_head").val(sowProj);
      $("#sow_project_head").select2({});
      $(".edit_head_data").hide();

      let headButtonAcc = false;
      let getUserRole = localStorage.getItem("user-role");
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(
        loadTimeInSeconds,
        "SowCreate",
        "Revenue",
        "sow_input_drop_down",
        "error",
        fileName,
        "SowCreate",
        "view"
      );
      console.log("message Error" + JSON.stringify(error));
    },
  });
}


async function sowUpdateData() {
  let resUpdateData = "",
    resShowData = "";
  let updateAcc = escapeHtml($("#acc_name_tit").html());
  let updateSow = escapeHtml($("#sow_name_tit").html());
  updateSow = updateSow.replace("&amp;", "&");
  let updateFunnel = $("#funnel_options option:selected").val();
  let updateProb = $("#probability_options option:selected").val();
  let updateSowType = $("#sow_options option:selected").val();
  let updateBillingType = $("#billing_options option:selected").val();
  let updateTeamSize = $("#new_team").val();
  // let buyingCenter = $("#buying_center").val();
  // let npsStakeHolder = $("#nps_stakeholder").val();
  let buyingCenter = $("#buying_center").val();
  let buyingCenterName = $("#buying_center option:selected").text();
  let npsStakeHolderID = $("#nps_stakeholder").val();
  let npsStakeHolder = $("#nps_stakeholder option:selected").text();

  // Prepare NPS Stakeholder data from multiple select
  let npsStakeholderData = selectedNpsStakeholders.map(s => ({
    stakeholder_id: s.keyDirects ? "" : s.id,
    stakeholder_name: s.name
  }));
  let updateUsCount = $("#uscan_size").val();
  let updateIndCount = $("#ind_size").val();
  let updateLegStart = convertDate($("#legal_start_date").val());
  let updateLegEnd = convertDate($("#legal_end_date").val());
  let updateBillStart = convertDate($("#billing_start_date").val());
  let updateBillEnd = convertDate($("#billing_end_date").val());
  let updateActStart = convertDate($("#actual_start_date").val());
  let updateActEnd = convertDate($("#actual_end_date").val());
  let updateSowAmount = $("#sow_amount")
    .val()
    .replace(/,/g, "");
  let updateProjAmount = $("#proj_amount")
    .val()
    .replace(/,/g, "");
  updateSowAmount = parseInt(updateSowAmount, 10) || 0; // Default to 0 if the value is empty or invalid
  updateProjAmount = updateProjAmount || 0;
  let updateGrowthLeaderId = $("#acc_growth_name_option option:selected").val();
  let updateGrowthLeaderName = $(
    "#acc_growth_name_option option:selected"
  ).text();
  let createdByOwnerId = "";
  let createdByOwnerName = "";
  let takeApprovalResponse = "No";
  let approverName = [];
  let UserIDheadFlag = false;
  let sowStageFlag = false;
  let sowAmtFlag = false;
  let billRateFlag = false;
  let sowEditBusRule = [];
  var tableArr = [];
  let totalCount = 0; // Variable to store the total count
  let totalCountIndia = 0; // Variable to store total count for India
  let totalCountUS = 0; // Variable to store total count for US
  const quillText = quill.getText().trim();
  if (updateFunnel == "Lead" || updateFunnel == "Scout") {
    if (updateSowType == "-1") {
      updateSowType = 'Net New'
    }
    if (updateBillingType == "-1") {
      updateBillingType = 'Time and Material'
    }
  }
  console.log("quillText----", quillText);
  $.each(businessRuleData, function (i, busRule) {
    if (busRule.RULE_IDENTIFIER == "SOW_EDIT") {
      sowEditBusRule = busRule.RULE_DATA;
      $.each(sowEditBusRule, function (i, ruleData) {
        if (ruleData.WORKFLOW_ATTRIBUTE == "USER_ID") {
          let userAttrValue = ruleData.ATTRIBUTE_VALUE;
          let userAppr = ruleData.APPROVER;
          let userOpr = ruleData.OPERATION;
          if (defaultBusHead == empId) {
            UserIDheadFlag = true;
          }
          // if (defaultFactHead == empId) {
          //   UserIDheadFlag = true;
          // }
        }
        if (ruleData.WORKFLOW_ATTRIBUTE == "SOW_STAGE") {
          let sowAttrValue = ruleData.ATTRIBUTE_VALUE;
          let sowAppr = ruleData.APPROVER;
          let sowOpr = ruleData.OPERATION;
          $.each(sowAttrValue, function (i, sowAttr) {
            if (sowAttr == updateFunnel) {
              sowStageFlag = true;
            } else {
              console.log("SOW Else");
            }
          });
        }
        if (ruleData.WORKFLOW_ATTRIBUTE == "SOW_AMOUNT") {
          let sowAmtAttrValue = ruleData.ATTRIBUTE_VALUE;
          let sowAmtAppr = ruleData.APPROVER;
          let sowAmtOpr = ruleData.OPERATION;
          let complimentaryAtt = ruleData.COMPLIMENTARY_ATTRIBUTE;
          let complimentaryVal = ruleData.COMPLIMENTARY_VALUE;
          $.each(sowAmtAttrValue, function (i, sowAmt) {
            if (sowAmt == "Old Amount") {
              if (complimentaryAtt == "SOW_STAGE") {
                $.each(complimentaryVal, function (i, cmpVal) {
                  if (cmpVal == updateFunnel) {
                    if (updateSowAmount < sow_acc_data.SOW_AMOUNT) {
                      sowAmtFlag = true;
                    }
                  }
                });
              }
            } else {
              console.log("SOW Else");
            }
          });
        }
      });
    }
  });

  $("#funnel_name").html(updateFunnel);
  $("#probab_name").html(updateProb);
  $("#sow_type_name").html(updateSowType);
  $("#billing_type_name").html(updateBillingType);
  monthsInputData = {};
  let monthsObject = { "MONTHS": {} }; // Global variable

  document.querySelectorAll("#monthlyTableContainer input").forEach(input => {
    let monthKey = input.id.replace("monthly_breakup_amt_", ""); // Extract month key
    let sanitizedValue = input.value.replace(/,/g, '');
    let numericValue = parseFloat(sanitizedValue);
    if (isNaN(numericValue)) numericValue = 0;
    monthsObject["MONTHS"][monthKey] = numericValue;
  });


  console.log("monthsObject", monthsObject);
  let monthsObject_month = monthsObject.MONTHS;
  console.log("monthsObject_month", monthsObject_month);
  let monthly_breakupSum = 0

  Object.keys(monthsObject_month).forEach(month => {
    let value = monthsObject_month[month];

    // Ensure value is a string before replacing commas
    if (typeof value === "string") {
      value = value.replace(/,/g, ""); // Remove commas
    }

    monthsObject_month[month] = parseInt(value, 10); // Convert to number
  });

  console.log("monthsObject_month-----", monthsObject_month);
  let billing_model_data = {}; // Declare it outside
  if (updateBillingType === "Fixed Price") {
    let exitFunction = false; // Flag to exit the function if conditions are met

    // Check for empty month values
    for (let month in monthsObject.MONTHS) {
      const monthValue = monthsObject.MONTHS[month];

      if (monthValue === '' || isNaN(monthValue)) {
        const monthName = month.split('_')[0]; // Extracting the month part from the key (e.g., "Feb")

        $("#fullScreenLoader").hide();
        toastr.error(`Monthly breakup for ${monthName} month should have value`);
        exitFunction = true; // Set the flag to exit
        return false; // Exit the loop
      }
    }

    // Calculate the sum of all months
    if (monthsObject && monthsObject.MONTHS) { // Ensure MONTHS exists
      monthly_breakupSum = Object.values(monthsObject.MONTHS)
        .map(value => {
          if (typeof value === "string") {
            return parseInt(value.replace(/,/g, ""), 10); // Remove commas and convert to number
          }
          return Number(value) || 0; // Convert if already a number, default to 0
        })
        .reduce((sum, currentValue) => sum + currentValue, 0); // Sum values

      console.log("monthly_breakupSum", monthly_breakupSum);
    } else {
      console.log("Error: monthsObject.MONTHS is undefined or empty");
    }


    // Check if the sum exceeds the SOW amount
    if (monthly_breakupSum != updateSowAmount) {
      $("#fullScreenLoader").hide();
      toastr.options.timeOut = 2000; // 2s
      toastr.error(`The sum of monthly breakups (${monthly_breakupSum}) should be equal to the SOW amount (${updateSowAmount})`);
      exitFunction = true; // Set the flag to exit
      return false; // Exit the function
    }

    // If everything is fine, prepare the billing model data
    billing_model_data = {
      "BILLING_MODEL": updateBillingType,
      "MONTHS": monthsObject_month
    };
    console.log("billing_model_data", billing_model_data);

    // Continue with further processing if needed
  } else {
    // If not "Fixed price", set "MONTHS" as an empty object
    billing_model_data = {
      "BILLING_MODEL": updateBillingType,
      "MONTHS": {}
    };
    console.log("billing_model_data", billing_model_data);

    // Continue with further processing if needed
  }
  var table = $("#billing_exp_div tbody");
  let resCountUs = 0;
  let resCountInd = 0;
  let locationValFlag = false;
  let resDetailsNewArray = [];
  let resDetailsOldArray = [];
  let change = true;
  let blockAjax = false;

  table.find("tr").each(function (i) {
    var $tds = $(this).find("td");
    let actualStartDate = convertDate($('#actual_start_date').val());
    let actualEndDate = convertDate($('#actual_end_date').val());
    let custom_others_text = $tds.eq(1).find("input").val();
    var rResource = $tds.eq(0).text(),
      selectPerosna = $tds.eq(1).find(":selected").val(),
      selectSkill = $tds.eq(2).find(":selected").val(),
      rLocation = $tds
        .eq(6)
        .find(":selected")
        .val(),
      rStartDate = $tds
        .eq(3)
        .find("input")
        .val(),
      rEndDate = $tds
        .eq(4)
        .find("input")
        .val(),
      rBillStatus = $tds
        .eq(7)
        .find(":selected")
        .val(),
      rBillRate = $tds
        .eq(8)
        .find("input")
        .val(),
      rCount = $tds
        .eq(9)
        .find("input")
        .val(),
      rResourceGrpNo = $tds.eq(-1).text();
    let getResVal = rResource.replace("Resource ", "");
    let startDateNotEmpty = false,
      endDateNotEmpty = false;
    if (rStartDate == "") {
      startDateNotEmpty = true;
    } else {
      rStartDate = convertDate(rStartDate);
      startDateNotEmpty = false;
    }
    if (rEndDate == "") {
      endDateNotEmpty = true;
    } else {
      rEndDate = convertDate(rEndDate);
      endDateNotEmpty = false;
    }
    let allocationStatus = $('#update_resource_data').prop('disabled');
    console.log("allocationStatus - ", allocationStatus);

    console.log("startDateNotEmpty", startDateNotEmpty);

    console.log("endDateNotEmpty", endDateNotEmpty);
    if (allocationStatus == false) {
      $("#fullScreenLoader").hide();
      toastr.error(
        "Please allocate the resource before updating the SOW"
      )
      blockAjax = true;

      change = true;
      return false;
    } else if (selectPerosna == "TBD" || selectPerosna == undefined || selectPerosna == null || selectPerosna == "") {
      $("#fullScreenLoader").hide();
      toastr.error(
        "One of the Resource Expertise Persona is not selected, Please select Expertise Persona"
      )
      blockAjax = true;

      change = true;
      return false;
    } else if (selectPerosna === "Others" && (!custom_others_text || custom_others_text.trim() === "")) {
      $("#fullScreenLoader").hide();
      toastr.error("Please specify the expertise persona when 'Others' is selected");
      blockAjax = true;
      change = true;
      return false;
    } else if (rCount <= 0) {
      $("#fullScreenLoader").hide();
      toastr.error("Resource count should be greater than 0");
      blockAjax = true;
      change = true;
      return false;
    }
    // else if(selectSkill == undefined || selectSkill == null || selectSkill == ""){
    //   toastr.error(
    //     "One of the Resource Skill is not selected, Please select Skill"
    //   )
    //   blockAjax = true;

    //   change = true;
    //   return false;
    // }
    else if (rLocation == "-1") {
      $("#fullScreenLoader").hide();
      toastr.options.timeOut = 2000; // 2s
      toastr.error(
        "One of the Resource location is not selected, Please select location"
      );

      blockAjax = true;

      return false;

    } else if (rBillRate == "") {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Billing is empty, Please enter a value");
      $("#fullScreenLoader").hide();
      blockAjax = true;
      return false;
    } else if (startDateNotEmpty) {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Start date is missing for one of the resources. Please select it.");
      $("#fullScreenLoader").hide();
      blockAjax = true;
      return false;
    } else if (endDateNotEmpty) {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("End date is missing for one of the resources. Please select it.");
      $("#fullScreenLoader").hide();
      blockAjax = true;
      return false;
    } else if (new Date(rStartDate) < new Date(actualStartDate)) {
      toastr.options.timeOut = 2000;
      toastr.error("Resource start date cannot be earlier than the actual start date");
      $("#fullScreenLoader").hide();
      blockAjax = true;
      return false;
    } else if (new Date(rEndDate) > new Date(actualEndDate)) {
      toastr.options.timeOut = 2000;
      toastr.error("Resource end date cannot be later than the actual end date.");
      $("#fullScreenLoader").hide();
      blockAjax = true;
      return false;
    } else {
      let rSkillsLevel = [];
      let billCompAtt = "";
      let billCompVal = [];

      $.each(sowEditBusRule, function (i, ruleData) {
        if (ruleData.WORKFLOW_ATTRIBUTE == "BILLING_RATE") {
          let sowAttrValue = ruleData.ATTRIBUTE_VALUE;
          let sowAppr = ruleData.APPROVER;
          let sowOpr = ruleData.OPERATION;
          billCompAtt = ruleData.COMPLIMENTARY_ATTRIBUTE;
          billCompVal = ruleData.COMPLIMENTARY_VALUE;
        }
      });
      if (rLocation != "-1") {
        if (rLocation == "US") {
          resCountUs += parseInt(rCount, 10);
          let usRate = parseInt(rBillRate, 10);
          if (billCompAtt == "SOW_STAGE") {
            $.each(billCompVal, function (i, cmpVal) {
              if (cmpVal == updateFunnel) {
                if (bill_us_default > usRate) {
                  billRateFlag = true;
                }
              }
            });
          }
        }
        if (rLocation == "India" || rLocation == "INDIA") {
          resCountInd += parseInt(rCount, 10);
          let indRate = parseInt(rBillRate, 10);
          if (billCompAtt == "SOW_STAGE") {
            $.each(billCompVal, function (i, cmpVal) {
              if (cmpVal == updateFunnel) {
                if (bill_ind_default > indRate) {
                  billRateFlag = true;
                }
              }
            });
          }
        }
      } else {
        locationValFlag = true;
      }
      rSkillsLevel = $("#persona_skill_" + getResVal).val();
      rPerosna = $("#persona_select_" + getResVal).val();
      if (rPerosna == null) {
        rPerosna = "TBD";
      }
      const unique = (arr) => [...new Set(arr)];
      let skill_uniq = unique(rSkillsLevel);
      let skillUpdatedData = "";
      $.each(skill_uniq, function (i, skillOpt) {
        skillUpdatedData += `"${skillOpt}",`;
      });
      if (skillUpdatedData.endsWith(",")) {
        skillUpdatedData = skillUpdatedData.slice(0, -1);
      }
      let updateTeamSize = $("#new_team").val();
      console.log("updatedTeamSize", updateTeamSize);
      console.log('rPerosna - ', rPerosna);
      resUpdateData =
        resUpdateData +
        '{ "RESOURCE_GROUP" : "' +
        rResourceGrpNo +
        '", "SKILLS_PERSONA":"' +
        rPerosna +
        '","OTHER_PERSONA":"' +
        (rPerosna == "Others" ? custom_others_text : "") +
        '", "LOCATION":"' +
        rLocation +
        '", "START_DATE":"' +
        rStartDate +
        '", "END_DATE":"' +
        rEndDate +
        '", "COUNT":"' +
        rCount +
        '", "BILLING_STATUS":"' +
        rBillStatus +
        '", "BILLING_RATE":"' +
        rBillRate +
        '", "RESOURCE_GROUP_NO":"' +
        rResourceGrpNo +
        '", "SKILL_DATA": [' +
        skillUpdatedData +
        "]},";

      tableArr.push({
        RESOURCE_GROUP: rResource,
        SKILLS_PERSONA: rPerosna,
        OTHER_PERSONA: (rPerosna == "Others" ? custom_others_text : ""),
        LOCATION: rLocation,
        START_DATE: rStartDate,
        END_DATE: rEndDate,
        COUNT: rCount,
        BILLING_STATUS: rBillStatus,
        BILLING_RATE: rBillRate,
        SKILL_DATA: [skillUpdatedData],
        RESOURCE_GROUP_NO: rResourceGrpNo,
      });
    }

    if (rCount) {
      rCount = parseInt(rCount, 10) || 0; // Convert rCount to integer
      if (rLocation == "India" || rLocation == "INDIA") {
        totalCountIndia += rCount; // Add to India total
      } else if (rLocation === "US") {
        totalCountUS += rCount; // Add to US total
      }
    }
    totalCount = totalCountIndia + totalCountUS;
    if (blockAjax == false) {
      $("#new_team").val(totalCount);
    }
  });
  if (updateAcc == "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select an account name");
    $("#fullScreenLoader").hide();
    blockAjax = true;
    return false;
  } else if (updateSow == "") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please enter the SOW name");
    $("#fullScreenLoader").hide();
    blockAjax = true;
    return false;
  } else if (updateFunnel == "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select the funnel stage");
    $("#fullScreenLoader").hide();
    blockAjax = true;
    return false;
  } else if (updateGrowthLeaderId == "-1" || updateGrowthLeaderId == "" || updateGrowthLeaderId == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select the opportunity owner");
    $("#fullScreenLoader").hide();
    blockAjax = true;
    return false;
  }
  else if (updateTeamSize < 0) {
    if (updateBillingType != 'Fixed Price') {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Team size should be 0 or more");
      $("#fullScreenLoader").hide();
      blockAjax = true;
      return false;
    }
  } else if (buyingCenter == "-1" || buyingCenter == "" || buyingCenter == undefined || buyingCenter == null || buyingCenter == 'add-new') {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select the buying center");
    $("#fullScreenLoader").hide();
    blockAjax = true;
    return false;
  } else if (npsStakeHolderID == "-1" || npsStakeHolderID == "" || npsStakeHolderID == null || npsStakeHolderID == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select the stakeholder");
    $("#fullScreenLoader").hide();
    blockAjax = true;
    return false;
  } 
  // else if (updateFunnel === "Signed" && ($("#nps_stakeholder_display").val() == null || $("#nps_stakeholder_display").val().length === 0)) {
  //   toastr.options.timeOut = 2000; // 2s
  //   toastr.error("Please select atleast one NPS stakeholder");
  //   $("#fullScreenLoader").hide();
  //   blockAjax = true;
  //   return false;
  // } 
  else if (updateFunnel !== "Lead" && updateFunnel !== "Scout") {
    if (updateProb == "-1" || updateProb == "" || updateProb == undefined) {
      if (sowSelectedSource == "renew") {
        updateProb = 70;
      } else {
        toastr.options.timeOut = 2000; // 2s
        toastr.error("Please select the probability");
        $("#fullScreenLoader").hide();
        blockAjax = true;
        return false;
      }
    } else if (updateSowType == "-1") {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Please select the SOW type");
      $("#fullScreenLoader").hide();
      blockAjax = true;
      return false;
    } else if (updateBillingType == "-1") {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Please select the billing type");
      $("#fullScreenLoader").hide();
      blockAjax = true;
      return false;
    } else if (updateTeamSize < 0) {
      console.log("updateTeamSize", updateTeamSize);
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Team size should be 0 or more");
      $("#fullScreenLoader").hide();
      blockAjax = true;
      return false;
    }
  }
  if (resUpdateData.endsWith(",")) {
    resUpdateData = resUpdateData.slice(0, -1);
  }
  console.log("New Resource - ", resUpdateData);
  let billing_rate = sow_acc_data.BILLING_RATE_DATA;
  let old_billing_rate = "";
  if (UserIDheadFlag == false) {
    if (sowStageFlag == true) {
      takeApprovalResponse = "Yes";
      approverName.push("Business head");
    }
    if (sowAmtFlag == true) {
      takeApprovalResponse = "Yes";
      approverName.push("Finance head");
    }
    if (billRateFlag == true) {
      takeApprovalResponse = "Yes";
      approverName.push("Finance head");
    }
  }
  $.each(billing_rate, function (i, billData) {
    console.log("billData", billData);
    let oldSkillAssign = "";
    if (billData.SKILLS_DATA == "") {
      oldSkillAssign = "";
    } else {
      let old_skill_data = billData.SKILLS_DATA.split(",");

      $.each(old_skill_data, function (k, skill) {
        oldSkillAssign += `"${skill}",`;
      });
      if (oldSkillAssign.endsWith(",")) {
        oldSkillAssign = oldSkillAssign.slice(0, -1);
      }
    }
    old_billing_rate =
      old_billing_rate +
      '{ "RESOURCE_GROUP" : "' +
      billData.RESOURCE_GROUP +
      '", "SKILLS_PERSONA":"' +
      billData.SKILLS_PERSONA +
      '","OTHER_PERSONA":"' +
      billData.OTHER_PERSONA +
      '", "LOCATION":"' +
      billData.LOCATION +
      '", "START_DATE":"' +
      removeDateHrs(billData.START_DATE) +
      '", "END_DATE":"' +
      removeDateHrs(billData.END_DATE) +
      '", "COUNT":"' +
      billData.NUMBER_OF_RESOURCE +
      '", "BILLING_STATUS":"' +
      billData.BILLING_STATUS +
      '", "BILLING_RATE":"' +
      billData.BILLING_RATE_USD +
      '", "SKILL_DATA": [' +
      oldSkillAssign +
      "]},";
  });

  if (old_billing_rate.endsWith(",")) {
    old_billing_rate = old_billing_rate.slice(0, -1);
  }
  console.log("Old Rescource - ", old_billing_rate);
  let resUpdateDataTemp = JSON.parse(`[${resUpdateData}]`);
  let old_billing_rateTemp = JSON.parse(`[${old_billing_rate}]`);

  const oldObj = arrayToObj(old_billing_rateTemp);
  const newObj = arrayToObj(resUpdateDataTemp);

  const existing_changed = {};
  const newly_added = {};

  // Find changed assignments
  for (let key in oldObj) {
    if (newObj[key] && !isEqual(oldObj[key], newObj[key])) {
      existing_changed[key] = { old: oldObj[key], new: newObj[key] };
    }
  }

  // Find newly added assignments
  for (let key in newObj) {
    if (!oldObj[key]) {
      newly_added[key] = newObj[key];
    }
  }

  // Final result
  const result = {
    existing_changed,
    newly_added
  };

  console.log("Changes result - ", result);
  // Example usage:
  let ResourceAuditMessages = prepareAuditMessages(old_billing_rate, resUpdateData);
  console.log("ResourceAuditMessages - ", ResourceAuditMessages);
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
  totalCount = totalCountIndia + totalCountUS;
  updateTeamSize = totalCount
  if (blockAjax == false) {
    $("#new_team").val(totalCount);
  }
  console.log("totalCount - ", totalCount);
  console.log("billing_model_data", billing_model_data);

  let sow_new_data =
    '{ "ACCOUNT_NAME" : "' +
    updateAcc +
    '", "ACCOUNT_ID":"' +
    sow_acc_data.ACCOUNT_ID +
    '", "SOW_NAME":"' +
    updateSow +
    '", "BUYING_CENTRE":"' +
    buyingCenter +
    '", "NPS_STAKEHOLDER":"' +
    npsStakeHolder +
    '", "NPS_STAKEHOLDER_ID":"' +
    npsStakeHolderID +
    '", "SOW_ID":"' +
    sow_acc_data.SOW_ID +
    '", "UNIQUE_ID":"' +
    sow_acc_data.UNIQUE_ID +
    '", "SOW_STATUS":"' +
    updateFunnel +
    '", "LEGAL_START_DATE":"' +
    updateLegStart +
    '", "LEGAL_END_DATE":"' +
    updateLegEnd +
    '", "BILLING_START_DATE":"' +
    updateBillStart +
    '", "BILLING_END_DATE":"' +
    updateBillEnd +
    '", "ACTUAL_START_DATE":"' +
    updateActStart +
    '", "ACTUAL_END_DATE":"' +
    updateActEnd +
    '", "OPPORTUNITY_OWNER_ID":"' +
    updateGrowthLeaderId +
    '", "OPPORTUNITY_NAME":"' +
    updateGrowthLeaderName +
    '", "PROBABILITY":"' +
    updateProb +
    '", "TOTAL_NUMBER_OF_RESOURCE":"' +
    updateTeamSize +
    '", "NUMBER_OF_RESOURCE_US":"' +
    totalCountUS +
    '", "NUMBER_OF_RESOURCE_IND":"' +
    totalCountIndia +
    '", "BILLING_MODEL_DATA":' +  // ✅ No extra quotes
    JSON.stringify(billing_model_data) +
    ', "SOW_AMOUNT":' +
    parseInt(updateSowAmount, 10) +
    ', "PROJ_AMOUNT":' +
    updateProjAmount +
    ', "SOW_TYPE":"' +
    updateSowType +
    '", "CREATED_USER":"' +
    createdByOwnerName +
    '", "CREATED_USER_ID":"' +
    createdByOwnerId +
    '", "SOW_AMOUNT_USER_EDIT":"' +
    sow_amount_user_edit +
    '"}';

  console.log("sow_new_data", sow_new_data);
  let sowId = $("#sowNameID").html();
  let show_updated_data =
    '{ ACCOUNT_NAME : "' +
    updateAcc +
    '", SOW_ID:"' +
    sowId +
    '", SOW_NAME:"' +
    updateSow +
    '", "BUYING_CENTRE":"' +
    buyingCenter +
    '", "NPS_STAKEHOLDER":"' +
    npsStakeHolder +
    '", "NPS_STAKEHOLDER_ID":"' +
    npsStakeHolderID +
    '", SOW_STAGE:"' +
    updateFunnel +
    '", LEGAL_START_DATE:"' +
    updateLegStart +
    '", LEGAL_END_DATE:"' +
    updateLegEnd +
    '", BILLING_START_DATE:"' +
    updateBillStart +
    '", BILLING_END_DATE:"' +
    updateBillEnd +
    '", ACTUAL_START_DATE:"' +
    updateActStart +
    '", ACTUAL_END_DATE:"' +
    updateActEnd +
    '", PROBABILITY:"' +
    updateProb +
    '", "OPPORTUNITY_OWNER_ID":"' +
    updateGrowthLeaderId +
    '", "OPPORTUNITY_NAME":"' +
    updateGrowthLeaderName +
    '", TOTAL_NUMBER_OF_RESOURCE:"' +
    updateTeamSize +
    '", NUMBER_OF_RESOURCE_US:"' +
    updateUsCount +
    '", NUMBER_OF_RESOURCE_IND:"' +
    updateIndCount +
    '", PRICING_PLAN:"' +
    updateBillingType +
    '", "CREATED_USER":"' +
    createdByOwnerName +
    '", "CREATED_USER_ID":"' +
    createdByOwnerId +
    '", "SOW_AMOUNT":' +
    parseInt(updateSowAmount, 10) +
    ', "PROJ_AMOUNT":' +
    updateProjAmount +
    ', SOW_TYPE:"' +
    updateSowType +
    '", BILLING_RATE_DATA:[' +
    resShowData +
    "]}";
  const myJSON = JSON.stringify(show_updated_data);
  localStorage.setItem("updatedJSON", myJSON);

  // --- Start Engagement Notes Data Collection ---
  const interactionType = $('input[name="interactionType"]:checked').val();
  const meetingDate = $('#meetingDate').val();
  const nextStepsType = $('.toggle-btn.active').attr('data-value');
  const nextStepsText = nextStepsQuill ? nextStepsQuill.getText().trim() : "";
  const nextStepsHTML = nextStepsQuill ? nextStepsQuill.root.innerHTML : "";
  const nextStepsEta = $('#nextStepsEta').val();
  const nextInteractionType = $('input[name="nextInteractionType"]:checked').val();
  const nextInteractionEta = $('#nextInteractionEta').val();
  const notesHTML = quill.root.innerHTML;
  const notesText = quill.getText().trim();

  // Mandatory Field Validations for Engagement Notes
  if (interactionType === 'N/A') {
    if (!notesText) {
      $("#fullScreenLoader").hide();
      toastr.error("Please add notes under Interaction Type 'N/A'");
      return;
    }
  } else {
    // Validation for Meeting Date and Detailed Notes
    if (!meetingDate) {
      $("#fullScreenLoader").hide();
      toastr.error("Meeting Date is mandatory.");
      return;
    }
    if (!notesText) {
      $("#fullScreenLoader").hide();
      toastr.error("Detailed Notes are mandatory.");
      return;
    }

    // Validation for Next Steps if enabled
    if (nextStepsType === 'Next Steps') {
      if (!nextStepsText || nextStepsHTML === '<p><br></p>') {
        $("#fullScreenLoader").hide();
        toastr.error("Next Steps Text is mandatory.");
        return;
      }
      if (!nextStepsEta) {
        $("#fullScreenLoader").hide();
        toastr.error("Next Steps Estimated Date is mandatory.");
        return;
      }
    }

    // Validation for Next Interaction (Radio and Date)
    if (!nextInteractionType) {
      $("#fullScreenLoader").hide();
      toastr.error("Please select a Next Interaction Type.");
      return;
    }
    if (!nextInteractionEta) {
      $("#fullScreenLoader").hide();
      toastr.error("Next Interaction Estimated Date is mandatory.");
      return;
    }
  }

  // Helper to construct engagement note payload for consolidated update
  function getEngagementNotePayload() {
    if (!notesText && (!nextStepsText || nextStepsHTML === '<p><br></p>' || nextStepsType === 'No Next Steps')) return null;

    // Helper to format dates to YYYY-MM-DD
    const toISO = (dateStr) => {
      if (!dateStr || !dateStr.includes('-')) return dateStr;
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      return `20${parts[2]}-${parts[0]}-${parts[1]}`;
    };

    return {
      org_id: "Factspan",
      created_by: empId || "unknown",
      actor_display_name: empName || "User",
      detail_text: notesHTML,
      meeting_date: toISO(meetingDate),
      interaction_type: interactionType || "In Person",
      search_type: "SOW PAGE",
      next_steps_mode: (nextStepsType === 'Next Steps') ? "HAS_NEXT_STEPS" : "NO_NEXT_STEPS",
      next_steps_text: nextStepsHTML || "",
      next_steps_estimated_date: toISO(nextStepsEta),
      next_interaction_type: nextInteractionType || "In Person",
      next_interaction_estimated_date: toISO(nextInteractionEta),
      account_id: sow_acc_data.ACCOUNT_ID,
      account_name: sow_acc_data.ACCOUNT_NAME,
      sow_id: sow_acc_data.SOW_ID,
      sow_name: updateSow,
      unique_id: sow_acc_data.UNIQUE_ID,
      bc_name: buyingCenter,
      primary_entity: {
        type: "SOW",
        id: sow_acc_data.UNIQUE_ID,
        name: updateSow
      },
      standard_entities: {
        account: {
          id: sow_acc_data.ACCOUNT_ID,
          name: sow_acc_data.ACCOUNT_NAME
        },
        sow: {
          id: sow_acc_data.UNIQUE_ID,
          name: updateSow
        }
      },
      related_entities: [
        {
          type: "LEAD",
          id: npsStakeHolderID,
          name: npsStakeHolder
        }
      ]
    };
  }
  const engagementNoteData = getEngagementNotePayload();
  // --- End Engagement Notes Data Collection ---

  const notesText_old = quill.getText().trim(); // Get plain text
  const notesHTML_old = quill.root.innerHTML; // Get formatted content

  console.log("Notes text:", notesText_old);
  console.log("Notes HTML:", notesHTML_old);

  // Assign to a variable

  let now = new Date();

  let formattedDateTime = now.toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Adjust format to dd/mm/yy if needed
  formattedDateTime = formattedDateTime.replace(
    /(\d{2})\/(\d{2})\/(\d{2})/,
    "$2/$1/$3"
  );

  let enteredNotes = notesHTML_old.trim(); // Trim whitespace

  // Check for non-empty meaningful content (excluding empty HTML like <p><br></p>)
  if (enteredNotes.length === 0 || /^<p><br><\/p>$/.test(enteredNotes)) {
    enteredNotes = ""; // Set to empty string if content is meaningless
  }

  console.log("Entered Notes:", enteredNotes);

  console.log("Entered Notes:", enteredNotes);
  let notesObject = {
    NOTES: enteredNotes,
  };

  console.log("notesObject", notesObject);
  console.log("sow_acc_data -------", sow_acc_data);


  let billingModelData = sow_acc_data.BILLING_MODEL_DATA
    ? JSON.stringify(sow_acc_data.BILLING_MODEL_DATA)
    : '{}';  // Ensure it's valid JSON

  let sow_old_data =
    '{ "ACCOUNT_NAME" : "' +
    sow_acc_data.ACCOUNT_NAME +
    '", "ACCOUNT_ID":"' +
    sow_acc_data.ACCOUNT_ID +
    '", "SOW_NAME":"' +
    updateSow +
    '", "NPS_STAKEHOLDER":"' +
    sow_acc_data.NPS_STAKEHOLDER +
    '", "NPS_STAKEHOLDER_ID":"' +
    sow_acc_data.NPS_STAKEHOLDER_ID +
    '", "BUYING_CENTRE":"' +
    sow_acc_data.BUYING_CENTRE +
    '", "SOW_ID":"' +
    sow_acc_data.SOW_ID +
    '", "UNIQUE_ID":"' +
    sow_acc_data.UNIQUE_ID +
    '", "SOW_STATUS":"' +
    sow_acc_data.SOW_STAGE +
    '", "LEGAL_START_DATE":"' +
    sow_acc_data.LEGAL_START_DATE +
    '", "LEGAL_END_DATE":"' +
    sow_acc_data.LEGAL_END_DATE +
    '", "BILLING_START_DATE":"' +
    sow_acc_data.BILLING_START_DATE +
    '", "BILLING_END_DATE":"' +
    sow_acc_data.BILLING_END_DATE +
    '", "ACTUAL_START_DATE":"' +
    sow_acc_data.ACTUAL_START_DATE +
    '", "ACTUAL_END_DATE":"' +
    sow_acc_data.ACTUAL_END_DATE +
    '", "PROBABILITY":"' +
    sow_acc_data.PROBABILITY +
    '", "OPPORTUNITY_OWNER_ID":"' +
    sow_acc_data.OPPORTUNITY_OWNER_ID +
    '", "OPPORTUNITY_NAME":"' +
    sow_acc_data.OPPORTUNITY_NAME +
    '", "TOTAL_NUMBER_OF_RESOURCE":"' +
    sow_acc_data.TOTAL_NUMBER_OF_RESOURCE +
    '", "NUMBER_OF_RESOURCE_US":"' +
    sow_acc_data.NUMBER_OF_RESOURCE_US +
    '", "NUMBER_OF_RESOURCE_IND":"' +
    sow_acc_data.NUMBER_OF_RESOURCE_IND +
    '", "BILLING_MODEL_DATA":' +  // ✅ No extra quote here
    billingModelData +
    ', "SOW_AMOUNT_USER_EDIT":"' +
    sow_amount_user_edit +
    '", "SOW_AMOUNT":' +
    parseInt(sow_acc_data.SOW_AMOUNT, 10) +
    ', "PROJ_AMOUNT":' +
    (sow_acc_data.PROJ_AMOUNT === '' ? 0 : parseInt(sow_acc_data.PROJ_AMOUNT, 10)) +
    ', "CREATED_USER":"' +
    sow_acc_data.CREATED_USER +
    '", "CREATED_USER_ID":"' +
    sow_acc_data.CREATED_USER_ID +
    '", "SOW_TYPE":"' +
    sow_acc_data.SOW_TYPE +
    '", "BILLING_RATE_DATA":[' +
    old_billing_rate +
    "]}";

  console.log("sow_old_data", sow_old_data);
  let approvalData =
    '{ "TAKE_APPROVAL" : "' +
    takeApprovalResponse +
    '", "APPROVER":"' +
    approverName +
    '"}';

  updateTeamSize = parseInt(updateTeamSize, 10);
  updateUsCount = parseInt(updateUsCount, 10);
  updateIndCount = parseInt(updateIndCount, 10);
  let totalResCount = resCountUs + resCountInd;
  if (locationValFlag) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please choose a location under Persona details.");
    return false;
  }
  if (sowSelectedSource === "renew") {
    let billing_start_date_renew = new Date(updateLegStart); // Convert to Date object
    console.log("billing_start_date_renew", billing_start_date_renew);

    let old_sow_billing_end_date = new Date(sow_acc_data.BILLING_END_DATE);
    console.log("old_sow_billing_end_date", old_sow_billing_end_date);

    let formattedEndDate = old_sow_billing_end_date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit"
    }).replace(/\//g, "-");

    if (billing_start_date_renew <= old_sow_billing_end_date) {
      toastr.options.timeOut = 2000; // 2s
      toastr.error(`Legal start date must be after ${formattedEndDate}. Please change the SOW start date ${formattedEndDate}. Change the SOW start Date`);
      blockAjax = true;
      return false;
    }
  }


  console.log("updateProjAmount", updateProjAmount);
  console.log("sow_acc_data.PROJ_AMOUNT", sow_acc_data.PROJ_AMOUNT);

  let messages = [];

  // Define messages directly in typeOfData, including TYPE_OF
  const typeOfData = {
    SOW_STATUS: {
      TYPE_OF: 'SOW_STATUS',
      MESSAGE: `Funnel Stage changed from ${sow_acc_data.SOW_STAGE} to ${updateFunnel}`,
      MESSAGE_FLAG: 'Y'
    },
    SOW_TYPE: {
      TYPE_OF: 'SOW_TYPE',
      MESSAGE: `SOW Type updated from ${sow_acc_data.SOW_TYPE} to ${updateSowType}.`,
      MESSAGE_FLAG: 'N'
    },
    PROBABILITY: {
      TYPE_OF: 'PROBABILITY',
      MESSAGE: `Probability updated from ${sow_acc_data.PROBABILITY == '-1' ? 'N/A' : sow_acc_data.PROBABILITY} to ${updateProb == '-1' ? 'N/A' : updateProb}.`,
      MESSAGE_FLAG: 'Y'
    },
    BILLING_START_DATE: {
      TYPE_OF: 'BILLING_START_DATE',
      MESSAGE: `Billing Start Date changed from ${sow_acc_data.BILLING_START_DATE} to ${updateBillStart}.`,
      MESSAGE_FLAG: 'Y'
    },
    BILLING_END_DATE: {
      TYPE_OF: 'BILLING_END_DATE',
      MESSAGE: `Billing End Date changed from ${sow_acc_data.BILLING_END_DATE} to ${updateBillEnd}.`,
      MESSAGE_FLAG: 'Y'
    },
    PRICING_PLAN: {
      TYPE_OF: 'PRICING_PLAN',
      MESSAGE: `Billing Type updated from ${sow_acc_data.PRICING_PLAN} to ${updateBillingType}.`,
      MESSAGE_FLAG: 'N'
    },
    SOW_AMOUNT: {
      TYPE_OF: 'SOW_AMOUNT',
      MESSAGE: `SOW Amount updated from $${Math.round(sow_acc_data.SOW_AMOUNT).toLocaleString()} to $${parseInt(updateSowAmount, 10).toLocaleString()}.`,
      MESSAGE_FLAG: 'Y'
    },
    LEGAL_START_DATE: {
      TYPE_OF: 'LEGAL_START_DATE',
      MESSAGE: `Legal Start Date changed from ${sow_acc_data.LEGAL_START_DATE} to ${updateLegStart}.`,
      MESSAGE_FLAG: 'N'
    },
    LEGAL_END_DATE: {
      TYPE_OF: 'LEGAL_END_DATE',
      MESSAGE: `Legal End Date changed from ${sow_acc_data.LEGAL_END_DATE} to ${updateLegEnd}.`,
      MESSAGE_FLAG: 'N'
    },
    ACTUAL_START_DATE: {
      TYPE_OF: 'ACTUAL_START_DATE',
      MESSAGE: `Actual Start Date changed from ${sow_acc_data.ACTUAL_START_DATE} to ${updateActStart}.`,
      MESSAGE_FLAG: 'N'
    },
    ACTUAL_END_DATE: {
      TYPE_OF: 'ACTUAL_END_DATE',
      MESSAGE: `Actual End Date changed from ${sow_acc_data.ACTUAL_END_DATE} to ${updateActEnd}.`,
      MESSAGE_FLAG: 'N'
    },
    TOTAL_NUMBER_OF_RESOURCE: {
      TYPE_OF: 'TOTAL_NUMBER_OF_RESOURCE',
      MESSAGE: `Team Size updated from ${sow_acc_data.TOTAL_NUMBER_OF_RESOURCE} to ${updateTeamSize}.`,
      MESSAGE_FLAG: 'N'
    },
    PROJ_AMOUNT: {
      TYPE_OF: 'PROJ_AMOUNT',
      MESSAGE: `Projected Amount updated from $${parseInt(sow_acc_data.PROJ_AMOUNT, 10).toLocaleString()} to $${updateProjAmount.toLocaleString()}.`,
      MESSAGE_FLAG: 'Y'
    },
    OPPORTUNITY_OWNER_ID: {
      TYPE_OF: 'OPPORTUNITY_OWNER',
      MESSAGE: `Opportunity Owner updated from ${sow_acc_data.OPPORTUNITY_NAME} to ${updateGrowthLeaderName}.`,
      MESSAGE_FLAG: 'N'
    },
    BUYING_CENTRE: {
      TYPE_OF: 'BUYING_CENTRE',
      MESSAGE: `Buying Centre selected as ${buyingCenterName}.`,
      MESSAGE_FLAG: 'N'
    },
    NPS_STAKEHOLDER: {
      TYPE_OF: 'NPS_STAKEHOLDER',
      MESSAGE: `Stakeholder selected as ${npsStakeHolder}.`,
      MESSAGE_FLAG: 'N'
    },
    NPS_STAKEHOLDER_DISPLAY: {
      TYPE_OF: 'NPS_STAKEHOLDER_DISPLAY',
      MESSAGE: `NPS Stakeholder updated from ${initialNpsStakeholderNames || '-'} to ${npsStakeholderData.length > 0 ? npsStakeholderData.map(s => s.stakeholder_name).sort().join(', ') : '-'}`,
      MESSAGE_FLAG: 'N'
    },
    NOTES: {
      TYPE_OF: 'NOTES',
      MESSAGE: "New Note has been added.",
      MESSAGE_FLAG: 'N'
    },
    RESOURCE_DEMAND_DATA: {
      TYPE_OF: 'RESOURCE_DEMAND_DATA',
      MESSAGE: ResourceAuditMessages.join('; <br>') + ".",
      MESSAGE_FLAG: 'N'
    }
  };

  // Keys that should have MESSAGE_FLAG set to "N"
  // const messageFlagN = [
  //   "SOW_TYPE", "LEGAL_START_DATE", "LEGAL_END_DATE",
  //   "ACTUAL_START_DATE", "ACTUAL_END_DATE", "PRICING_PLAN",
  //   "OPPORTUNITY_OWNER_ID", "BUYING_CENTRE", "NPS_STAKEHOLDER",
  //   "TOTAL_NUMBER_OF_RESOURCE", "NOTES"
  // ];

  // Check each condition and generate the messages
  Object.keys(typeOfData).forEach((key) => {
    // let changeFlag = false;

    switch (key) {
      case 'SOW_STATUS':
        if (updateFunnel != sow_acc_data.SOW_STAGE) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'SOW_TYPE':
        if (updateSowType != sow_acc_data.SOW_TYPE) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'PROBABILITY':
        if (updateProb != sow_acc_data.PROBABILITY) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'BILLING_START_DATE':
        if (updateBillStart != sow_acc_data.BILLING_START_DATE) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'BILLING_END_DATE':
        if (updateBillEnd != sow_acc_data.BILLING_END_DATE) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'PRICING_PLAN':
        if (updateBillingType != sow_acc_data.PRICING_PLAN) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'SOW_AMOUNT':
        if (parseInt(updateSowAmount, 10) != parseInt(sow_acc_data.SOW_AMOUNT, 10)) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'LEGAL_START_DATE':
        if (updateLegStart != sow_acc_data.LEGAL_START_DATE) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'LEGAL_END_DATE':
        if (updateLegEnd != sow_acc_data.LEGAL_END_DATE) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'ACTUAL_START_DATE':
        if (updateActStart != sow_acc_data.ACTUAL_START_DATE) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'ACTUAL_END_DATE':
        if (updateActEnd != sow_acc_data.ACTUAL_END_DATE) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'TOTAL_NUMBER_OF_RESOURCE':
        if (updateTeamSize != sow_acc_data.TOTAL_NUMBER_OF_RESOURCE) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'PROJ_AMOUNT':
        if (updateProjAmount != parseInt(sow_acc_data.PROJ_AMOUNT, 10)) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'OPPORTUNITY_OWNER_ID':
        if (updateGrowthLeaderId != sow_acc_data.OPPORTUNITY_OWNER_ID) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'BUYING_CENTRE':
        if (buyingCenter != (sow_acc_data.BC_ID || sow_acc_data.BUYING_CENTRE)) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'NPS_STAKEHOLDER':
        if (npsStakeHolder != sow_acc_data.NPS_STAKEHOLDER) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'NPS_STAKEHOLDER_DISPLAY':
        {
          let currentDisplayNames = npsStakeholderData.map(s => s.stakeholder_name).sort().join(', ');
          if (currentDisplayNames !== initialNpsStakeholderNames) {
            messages.push(typeOfData[key]);
            change = false;
          }
        }
        break;
      case 'NOTES':
        if (quillText.length > 0) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      case 'RESOURCE_DEMAND_DATA':
        if (ResourceAuditMessages.length > 0) {
          messages.push(typeOfData[key]);
          change = false;
        }
        break;
      default:
        break;
    }

    // If any change is detected, set the MESSAGE_FLAG to "Y" or "N"
    // if (!change) {
    //   let messageFlag = messageFlagN.includes(key) ? "N" : "Y";
    //   let message = {
    //     TYPE_OF: typeOfData[key].TYPE_OF,
    //     MESSAGE_FLAG: messageFlag,
    //     MESSAGE: typeOfData[key].MESSAGE
    //   };
    //   messages.push(message);
    // }
  });

  // Final messages_audit
  let messages_audit = messages.map((msg) => ({
    TYPE_OF: msg.TYPE_OF || "UNKNOWN", // Default to "UNKNOWN" if not set
    MESSAGE_FLAG: msg.MESSAGE_FLAG || "Y", // Default to "Y" if not set
    MESSAGE: msg.MESSAGE || "No message", // Default to "No message" if not set
  }));

  console.log("Messages:", messages_audit);


  console.log(JSON.stringify(messages_audit, null, 4));
  let resUpdateDataTem = JSON.parse(`[${resUpdateData}]`);
  resUpdateDataTem.forEach(item => {
    delete item.RESOURCE_GROUP_NO;
  });
  resUpdateDataTem = JSON.stringify(resUpdateDataTem);

  let updateSowData = {
    query_type: "edit_sow_new_UI",
    environment: apiValue.environment,
    user_details: "[" + accessDetails + "]",
    APPROVAL_DATA: "[" + approvalData + "]",
    sow_skills_bill_data: resUpdateDataTem,
    sow_data: "[" + sow_new_data + "]",
    old_sow_data: "[" + sow_old_data + "]",
    comments: engagementNoteData ? "[]" : "[" + JSON.stringify(notesObject) + "]", // Bypass legacy if engagement note exists
    engagement_note: engagementNoteData,
    messages: JSON.stringify(messages_audit),
    nps_stakeholder_data: JSON.stringify(npsStakeholderData),
  };
  console.log("updateSowData", updateSowData);
  // if (updateSowAmount && updateProjAmount === 0) {
  //   toastr.options.timeOut = 2000; // 2s timeout
  //   toastr.error("Actual/Projected amount cannot be '0'");
  //   blockAjax = true;
  // }
  if (!blockAjax) {
    if (quillText.length == 0 && nextStepsType === 'No Next Steps') {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Please add a note or next steps for the SOW");
      change = true;
      return false;
    }

    // Note creation is now handled internally by the backend update call
    // await createEngagementNote();
  }
  if (blockAjax) {

    // If blockAjax is true, stop further processing
    return;
  }
  // const canProceed = await checkAllocationResourceDates();
  // console.log("canProceed - ", canProceed);
  // if (canProceed) {
  if (change == false) {
    $("#sow_head_button").prop("disabled", true);
    $("#sow_renew").prop("disabled", true);
    $("#sow_update").prop("disabled", true);
    $("#sow_edit")
      .prop("disabled", true)
      .html("Processing...");
    let apiURL = apiValue.url.replace("/app", "/edit_sow_figma_UI");
    // ajax call to update the sow details -----------------------------------
    $.ajax({
      url: apiURL,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      format: "json",
      data: JSON.stringify(updateSowData),
      success: function (json) {
        $("#fullScreenLoader").hide();
        if (json.Message == "Success") {
          toastr.options.timeOut = 2000; // 2s
          toastr.success(json.Response);
          if (
            json.Response ==
            "Updated successfully, Sent for approval & Approver notified" ||
            json.Response ==
            "Updated successfully, Sent for approval & Approver notification failed"
          ) {
            window.location.href = "workflowDetails.html";
          } else if (sowSelectedSource === 'renew') {
            setTimeout(function () {
              window.location.href = "revenueDetails.html";
            }, 2000);
          } else {
            setTimeout(function () {
              window.location.href = `sow.html?${paramsArray[0]}&${paramsArray[1]}`;
            }, 2000);
          }
        } else if (json.Message == "Sow edited successfully") {
          toastr.options.timeOut = 2000; // 2s
          toastr.success(json.Message);
          // setTimeout(() => {
          //   location.reload();
          // }, 4000); // Delay matches the toast timeout
        } else {
          toastr.options.timeOut = 2000; // 2s
          toastr.error(json.Message);
        }
        $("#sow_edit")
          .prop("disabled", false)
          .html(" Edit");
        // $("#sow_update").prop("disabled", false);
        $("#sow_renew").prop("disabled", false);
        $("#sow_head_button").prop("disabled", false);
      },
      error: function (error) {
        $("#fullScreenLoader").hide();
        toastr.options.timeOut = 2000; // 2s
        toastr.error("Message error" + JSON.stringify(error));
        $("#sow_edit")
          .prop("disabled", false)
          .html(" Edit");
        $("#sow_update").prop("disabled", false);
        $("#sow_renew").prop("disabled", false);
        $("#sow_head_button").prop("disabled", false);
      },
    });
    // Ajax ended here -------------------------------------------------------
  } else {
    $("#fullScreenLoader").hide();
    toastr.options.timeOut = 2000; // 2s
    toastr.info("No details to update.");
    $("#sow_edit")
      .prop("disabled", false)
      .html("Edit");
    $("#sow_renew").prop("disabled", false);
    $("#sow_update").prop("disabled", false);
    $("#sow_head_button").prop("disabled", false);
  }
  // } else {
  //     console.log("User cancelled the operation.");
  //     // The process stops here. You can optionally show a message.
  // }
  // checkAllocationResourceDates('SOWEdit')
}



// Helper to convert array to object keyed by RESOURCE_GROUP
function arrayToObj(arr) {
  if (!Array.isArray(arr)) {
    console.error('Input is not an array:', arr);
    return {};
  }
  return arr.reduce((acc, item) => {
    acc[item.RESOURCE_GROUP] = item;
    return acc;
  }, {});
}


// Helper to compare two objects (shallow comparison)
function isEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
function prepareAuditMessages(oldResources, newResources) {
  console.log("Starting audit message preparation...");
  console.log("Raw oldResources:", oldResources);
  console.log("Raw newResources:", newResources);

  const FIELD_DISPLAY_NAMES = {
    SKILLS_PERSONA: "Expertise Persona",
    OTHER_PERSONA: "Other Persona",
    LOCATION: "Location",
    START_DATE: "Start Date",
    END_DATE: "End Date",
    COUNT: "Count",
    BILLING_STATUS: "Billing Status",
    BILLING_RATE: "Billing Rate",
    BILLING_RATE_USD: "Billing Rate"
  };

  const messages = [];

  // Fetch billing type once from DOM (assuming it's global for all resources)
  let billingType = $("#billing_type_name").text().trim();
  console.log("billingType from DOM - ", billingType);

  // Function to parse resources if they are strings or improperly formatted
  const parseResources = (resources) => {
    if (Array.isArray(resources)) {
      return resources;
    } else if (typeof resources === 'string') {
      try {
        const jsonStr = resources.startsWith('[') ? resources : `[${resources}]`;
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("Error parsing resources string:", e);
        return [];
      }
    } else if (typeof resources === 'object' && resources !== null) {
      return Object.values(resources);
    }
    return [];
  };

  const oldResourcesArray = parseResources(oldResources);
  const newResourcesArray = parseResources(newResources);

  console.log("Parsed oldResourcesArray:", oldResourcesArray);
  console.log("Parsed newResourcesArray:", newResourcesArray);

  const oldResourceMap = {};
  oldResourcesArray.forEach((resource, index) => {
    if (resource && resource.RESOURCE_GROUP) {
      oldResourceMap[resource.RESOURCE_GROUP] = resource;
      console.log(`Mapped old resource ${index}:`, resource.RESOURCE_GROUP);
    } else {
      console.log(`Skipping invalid old resource at index ${index}:`, resource);
    }
  });
  console.log("Final oldResourceMap:", oldResourceMap);

  newResourcesArray.forEach((newResource, index) => {
    console.log(`Processing new resource at index ${index}:`, newResource);
    if (!newResource || !newResource.RESOURCE_GROUP) {
      console.log(`Skipping invalid new resource at index ${index}`);
      return;
    }

    if (!newResource.RESOURCE_GROUP_NO || newResource.RESOURCE_GROUP_NO.trim() === "") {
      const msg = formatNewResourceMessage(newResource, FIELD_DISPLAY_NAMES, billingType);
      console.log(`New resource detected at index ${index}, adding message:`, msg);
      messages.push(msg);
      return;
    }

    const oldResource = oldResourceMap[newResource.RESOURCE_GROUP_NO];
    if (!oldResource) {
      console.log(`No old resource found for RESOURCE_GROUP_NO: ${newResource.RESOURCE_GROUP_NO} at index ${index}`);
      return;
    }
    console.log(`Found matching old resource for ${newResource.RESOURCE_GROUP_NO}:`, oldResource);

    const changedFields = [];
    for (const field in newResource) {
      if (['RESOURCE_GROUP', 'RESOURCE_GROUP_NO', 'SKILL_DATA'].includes(field)) continue;
      // Skip BILLING_RATE if billingType is "Fixed Price"
      if (field === 'BILLING_RATE' && billingType === "Fixed Price") continue;

      const oldVal = oldResource[field] || '';
      const newVal = newResource[field] || '';

      if (oldVal !== newVal) {
        const label = FIELD_DISPLAY_NAMES[field] || field;
        changedFields.push(`'${label}' old value '${oldVal}' new value '${newVal}'`);
        console.log(`Change detected in field ${field} for resource ${newResource.RESOURCE_GROUP}`);
      }
    }

    if (changedFields.length > 0) {
      const msg = `Resource details changes in ${changedFields.join(", ")}`;
      console.log(`Adding change message for resource ${newResource.RESOURCE_GROUP}:`, msg);
      messages.push(msg);
    } else {
      console.log(`No changes detected for resource ${newResource.RESOURCE_GROUP}`);
    }
  });

  console.log("Final audit messages:", messages);
  return messages;
}

function formatNewResourceMessage(newData, FIELD_DISPLAY_NAMES, billingType) {
  let message = `New Resource added with ${FIELD_DISPLAY_NAMES.SKILLS_PERSONA} : '${newData.SKILLS_PERSONA || ''}'`;

  if (newData.OTHER_PERSONA && newData.OTHER_PERSONA.trim() !== '') {
    message += `, ${FIELD_DISPLAY_NAMES.OTHER_PERSONA} : '${newData.OTHER_PERSONA}'`;
  }

  message += `, ${FIELD_DISPLAY_NAMES.LOCATION} : '${newData.LOCATION || ''}', ${FIELD_DISPLAY_NAMES.START_DATE} : '${newData.START_DATE || ''}', ${FIELD_DISPLAY_NAMES.END_DATE} : '${newData.END_DATE || ''}', ${FIELD_DISPLAY_NAMES.COUNT} : '${newData.COUNT || ''}', ${FIELD_DISPLAY_NAMES.BILLING_STATUS} : '${newData.BILLING_STATUS || ''}'`;

  // Only include BILLING_RATE if billingType is not "Fixed Price"
  if (billingType !== "Fixed Price") {
    message += `, ${FIELD_DISPLAY_NAMES.BILLING_RATE} : '${newData.BILLING_RATE || ''}'`;
  }

  return message;
}


function calculateSowAmount123(obj) {
  let resourceNumber = $(obj)
    .closest("tr")
    .children("td:eq(0)")
    .text()
    .trim();
  resourceNumber = resourceNumber.replace("Resource ", "");
  let perosnaSelectedValue = "#persona_select_" + resourceNumber;
  perosnaSelectedValue = $(perosnaSelectedValue + " option:selected").val();
  let sowAmount = 0;
  let tb = $("#billing_exp_div:eq(0) tbody");
  let size = tb.find("tr").length;
  if (perosnaSelectedValue != "TBD" && perosnaSelectedValue != undefined) {
    tb.find("tr").each(function (index, element) {
      var colSize = $(element).find("td").length;
      let num = index + 1;
      let billStatus = "#bill_select_" + num;
      billStatus = $(billStatus + " option:selected").val();

      if (billStatus == "Billed") {
        let startDate = "#start_date_input_" + num;
        startDate = $(startDate).val();
        let endDate = "#end_date_input_" + num;
        endDate = $(endDate).val();
        let workingDays = getBusinessDatesCount(startDate, endDate);
        let workingDay = parseInt(workingDays, 10);
        let bill_rate_class = "#bill_us_rate_" + num;
        bill_rate_class = $(bill_rate_class).val();
        let billRate = parseInt(bill_rate_class, 10);
        let count_class = "#bill_ind_input_" + num;
        count_class = $(count_class).val();
        let count = parseInt(count_class, 10);
        if (
          isNaN(startDate) &&
          isNaN(endDate) &&
          isNaN(workingDays) &&
          isNaN(billRate) &&
          isNaN(count_class)
        ) {
          toastr.options.timeOut = 2000; // 2s
          toastr.error("Sow Amount not updated..");
        } else {
          let tempSowAmt = workingDay * 8 * billRate * count;
          sowAmount += tempSowAmt;
        }
      }
      $("#sow_amount").val(Math.round(sowAmount).toLocaleString());
    });
  }
}

// function calculateSowAmount(obj) {
//   let tb = $("#billing_exp_div:eq(0) tbody");
//   let sowAmount = 0;
//   let totalCount = 0; // To accumulate count values

//   tb.find("tr").each(function(index, element) {
//     let resourceNumber = $(element)
//       .find("td:eq(0)")
//       .text()
//       .trim();
//     resourceNumber = resourceNumber.replace("Resource ", "");
//     let personaSelect = "#persona_select_" + resourceNumber;
//     personaSelect = $(personaSelect + " option:selected").val();

//     if (personaSelect !== undefined) {
//       let billStatus = "#bill_select_" + resourceNumber;
//       billStatus = $(billStatus + " option:selected").val();

//       if (billStatus === "Billed") {
//         let startDate = $("#start_date_input_" + resourceNumber).val();
//         let endDate = $("#end_date_input_" + resourceNumber).val();
//         let workingDays = getBusinessDatesCount(startDate, endDate);
//         let billRate = parseFloat($("#bill_us_rate_" + resourceNumber).val());
//         let countValue = parseFloat(
//           $("#bill_ind_input_" + resourceNumber).val()
//         );
//         let location = $("#loc_select_" + resourceNumber).val();

//         // Validate inputs
//         if (
//           !startDate || // Check if startDate is empty
//           !endDate || // Check if endDate is empty
//           isNaN(workingDays) || // Ensure workingDays is valid
//           isNaN(billRate) || // Ensure billRate is valid
//           isNaN(countValue) // Ensure countValue is valid
//         ) {
//           // Set bill_amount to $0 for invalid rows
//           $("#bill_days_" + resourceNumber).text("0");
//           $("#bill_amount_" + resourceNumber).text("$0");
//           return; // Skip further processing for this row
//         }

//         let tempSowAmt = 0;

//         if (
//           $("#billing_options option:selected").val() !== "Time and Material"
//         ) {
//           let newTempValue = fixedRateCal(
//             startDate,
//             endDate,
//             billRate,
//             location
//           );
//           newTempValue = newTempValue.split(",");

//           tempSowAmt = (parseFloat(newTempValue[0]) || 0) * countValue;

//           // Update bill_days and bill_amount
//           $("#bill_days_" + resourceNumber).text(newTempValue[1]);
//           $("#bill_amount_" + resourceNumber).text(
//             `$${(parseFloat(newTempValue[2]) * countValue).toLocaleString()}`
//           );
//         } else {
//           let newTempValue = removeHolidays(
//             startDate,
//             endDate,
//             billRate,
//             location
//           );
//           newTempValue = newTempValue.split(",");

//           tempSowAmt = (parseFloat(newTempValue[0]) || 0) * countValue;

//           // Update bill_days and bill_amount
//           $("#bill_days_" + resourceNumber).text(newTempValue[1]);
//           $("#bill_amount_" + resourceNumber).text(
//             `$${(parseFloat(newTempValue[2]) * countValue).toLocaleString()}`
//           );
//         }

//         sowAmount += tempSowAmt;
//         totalCount += countValue || 0;
//       } else {
//         // Set bill_amount to $0 for non-Billed rows
//         $("#bill_days_" + resourceNumber).text("0");
//         $("#bill_amount_" + resourceNumber).text("$0");
//       }
//     } else {
//       // Set bill_amount to $0 for rows without personaSelect
//       $("#bill_days_" + resourceNumber).text("0");
//       $("#bill_amount_" + resourceNumber).text("$0");
//     }
//   });

//   // Update SOW amount and team count
//   $("#sow_amount").val(
//     sowAmount.toLocaleString() == "NaN" ? 0 : sowAmount.toLocaleString()
//   );
//   if (obj != "getProjected") {
//     $("#proj_amount").val(sowAmount.toLocaleString());
//   }
// }
function calculateSowAmount(obj) {
  console.log('obj - ', obj)
  const existingSowAmount = $("#sow_amount").val();
  const existingProjAmount = $("#proj_amount").val();
  let tb = $("#billing_exp_div:eq(0) tbody");
  let size = tb.find("tr").length;
  let sowAmount = 0;
  let proAmount = 0;
  let india = 0,
    us = 0;

  tb.find("tr").each(function (index, element) {
    let count = 0;
    var colSize = $(element).find("td").length;
    let num = index + 1;
    let resourceNumber = $(element).find("td:eq(0)").text().trim();
    resourceNumber = resourceNumber.replace("Resource ", "");
    let personaSelect = "#persona_select_" + resourceNumber;
    personaSelect = $(personaSelect + " option:selected").val() || "";
    if (personaSelect != undefined) {
      let billStatus = "#bill_select_" + resourceNumber;
      billStatus = $(billStatus + " option:selected").val();

      if (billStatus == "Billed") {
        let startDate = "#start_date_input_" + resourceNumber;
        startDate = $(startDate).val();
        let endDate = "#end_date_input_" + resourceNumber;
        endDate = $(endDate).val();
        if (startDate == "") {
          toastr.options.timeOut = 2000; // 2s
          toastr.error("Resource Start date should not be empty");
          return false
        }
        else if ($("legal_end_date").val() != undefined) {
          if (endDate == '') {
            toastr.options.timeOut = 2000; // 2s
            toastr.error("Resource End Date should not be empty");
            return false;
          }
        }
        else {
          let sDate = new Date(startDate)
          let eDate = new Date(endDate)
          console.log('sDate - ', sDate, 'eDate - ', eDate)

          let workingDays = getBusinessDatesCount(startDate, endDate);
          let fixedDate = dateDiff(startDate, endDate);
          let workingDay = parseInt(workingDays, 10);
          let bill_rate_class = "#bill_us_rate_" + resourceNumber;
          bill_rate_class = $(bill_rate_class).val();
          let billRate = parseFloat(bill_rate_class);
          let count_class = "#bill_ind_input_" + resourceNumber;
          count_class = $(count_class).val();
          let location_class = "#loc_select_" + resourceNumber;
          location_class = $(location_class).val();
          count = parseFloat(count_class);
          let workingDayAmount = workingDay * 8;
          if (
            isNaN(startDate) &&
            isNaN(endDate) &&
            isNaN(workingDays) &&
            isNaN(billRate) &&
            isNaN(count_class)
          ) {
            toastr.options.timeOut = 2000; // 2s
            toastr.error("Sow Amount not updated..");
          } else {
            let tempSowAmt = 0;
            if (
              $("#billing_options option:selected").val() == "Performance Based"
            ) {
              let newTempValue = fixedRateCal(startDate, endDate, billRate, location_class);
              newTempValue = newTempValue.split(",")
              console.log("newTempValue - ", newTempValue)
              tempSowAmt = newTempValue[0] * count;
              $("#bill_days_" + resourceNumber).empty()
              $("#bill_amount_" + resourceNumber).empty()
              $("#bill_days_" + resourceNumber).append(newTempValue[1])
              $("#bill_amount_" + resourceNumber).append("$" + (newTempValue[2] * count).toLocaleString())
              sowAmount += Math.round(tempSowAmt);
              if (obj != "getProjected") {
                $("#sow_amount").val(sowAmount.toLocaleString());

                $("#proj_amount").val(sowAmount.toLocaleString());
              }
              return;

            } else if ($("#billing_options option:selected").val() == "Time and Material") {
              let accountName = $("#acc_name_tit").text();;
              if (accountName === "-1") {
                toastr.options.timeOut = 2000; // 2s
                toastr.error("Please select account name");
                return false;

              } else if (accountName === "Macys") {
                let newTempValue = removeHolidaysMacys(
                  startDate,
                  endDate,
                  billRate,
                  location_class
                );
                newTempValue = newTempValue.split(",")
                console.log("newTempValue - ", newTempValue)
                tempSowAmt = newTempValue[0] * count;
                $("#bill_days_" + resourceNumber).empty()
                $("#bill_amount_" + resourceNumber).empty()
                $("#bill_days_" + resourceNumber).append(newTempValue[1])
                let eachDemand = newTempValue[2] * count
                $("#bill_amount_" + resourceNumber).append("$" + (Math.round(eachDemand)).toLocaleString())
                tempProjAmt = newTempValue[3] * count;
                console.log("tempSowAmt - " + tempSowAmt);
                console.log("tempProjAmt - " + tempProjAmt);
                sowAmount += Math.round(tempSowAmt);
                proAmount += Math.round(tempProjAmt);
                if (obj != "getProjected") {
                  $("#sow_amount").val(sowAmount.toLocaleString());

                  $("#proj_amount").val(proAmount.toLocaleString());
                }


              } else {
                let newTempValue = removeHolidays(
                  startDate,
                  endDate,
                  billRate,
                  location_class
                );
                newTempValue = newTempValue.split(",")
                console.log("newTempValue - ", newTempValue)
                tempSowAmt = newTempValue[0] * count;
                $("#bill_days_" + resourceNumber).empty()
                $("#bill_amount_" + resourceNumber).empty()
                $("#bill_days_" + resourceNumber).append(newTempValue[1])
                let eachDemand = newTempValue[2] * count
                $("#bill_amount_" + resourceNumber).append("$" + (Math.round(eachDemand)).toLocaleString())
                tempProjAmt = newTempValue[3] * count;
                console.log("tempSowAmt - " + tempSowAmt);
                console.log("tempProjAmt - " + tempProjAmt);
                sowAmount += Math.round(tempSowAmt);
                proAmount += Math.round(tempProjAmt);
                if (obj != "getProjected") {
                  $("#sow_amount").val(sowAmount.toLocaleString());

                  $("#proj_amount").val(proAmount.toLocaleString());
                }

              }

            }
            else {
              let newTempValue = removeHolidays(
                startDate,
                endDate,
                billRate,
                location_class
              );
              newTempValue = newTempValue.split(",")
              $("#bill_days_" + resourceNumber).empty()
              $("#bill_days_" + resourceNumber).append(newTempValue[1])
              console.log("newTempValue - ", newTempValue)
              console.log("existingSowAmount", existingSowAmount);

              // Ensure the existing values are retained without modification
              $("#sow_amount").val(existingSowAmount.toLocaleString() === "NaN"
                ? 0
                : existingSowAmount.toLocaleString());
              $("#proj_amount").val(existingProjAmount.toLocaleString() === "NaN"
                ? 0
                : existingProjAmount.toLocaleString());
              // $("#sow_amount").val(Math.round(existingSowAmount));
              // $("#proj_amount").val(Math.round(existingProjAmount));

              console.log("SOW amount and Projected amount retained as they are for Fixed Price.");

              return;
            }
          }

        }

      }



    }

  });
}
function dateDiff(start, end) {
  let startDate = new Date(start);
  start = start.split("-");
  end = new Date(end);
  var year = end.getFullYear();
  var month = end.getMonth() + 1;
  var day = end.getDate();
  var yy = startDate.getFullYear();
  var mm = startDate.getMonth();
  var dd = startDate.getDate();
  var years, months, days;
  months = month - mm;
  if (day < dd) {
    months = months - 1;
  }
  years = year - yy;
  if (month * 100 + day < mm * 100 + dd) {
    years = years - 1;
    months = months + 12;
  }
  days = Math.floor(
    (end.getTime() - new Date(yy + years, mm + months - 1, dd).getTime()) /
    (24 * 60 * 60 * 1000)
  );
  return { years: years, months: months, days: days };
}

function getBusinessDatesCount(start, end) {
  let tempStart = start + "T00:00:00";
  let tempEnd = end + "T00:00:00";
  let startDate = new Date(tempStart);
  let endDate = new Date(tempEnd);
  let count = 0;
  const curDate = new Date(startDate.getTime());
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
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

function deleteSkill(obj) {
  let tb = $("#billing_exp_div:eq(0) tbody");
  let $row = $(obj).closest("tr");

  // Get the resource number from the row being deleted
  let resourceNumber = $row.find("td:eq(0)").text().trim().replace("Resource ", "");

  // Get the count value from the row being deleted
  let countToSubtract = parseInt($row.find("#bill_ind_input_" + resourceNumber).val(), 10) || 0;

  // Remove the row
  $row.remove();

  // Update team size by subtracting the actual count
  let newTeamField = parseInt($("#new_team").val(), 10) || 0;
  let currentValue = newTeamField - countToSubtract;
  $("#new_team").val(currentValue);

  // Only clear everything if there are no more rows left
  let remainingRows = $("#billing_exp_div tbody tr").length;
  if (remainingRows === 0) {
    $("#billing_exp_div tbody").empty();
    $("#sow_amount").val("0");
    $("#proj_amount").val("0");
  }

  calculateSowAmount();
}

function titleCase(str) {
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(" ");
}

function updateResourceTotal() {
  let usRes = parseInt($("#uscan_size").val(), 10);
  let IndRes = parseInt($("#ind_size").val(), 10);
  $("#team_size_val").val(usRes + IndRes);
}

function showResourceTable() {
  let totalResSize = parseInt($("#team_size_val").val());
  if (totalResSize > 0) {
    $("#billing_exp_div").show();
  } else {
    $("#billing_exp_div").hide();
  }
}

function addInvoice() {
  $(".invoiceClass").show();
  $(".invoiceButton").hide();
  getCurrentDate();
}

function invoiceSubmit() {
  $(".invoiceClass").hide();
  $(".invoiceButton").show();
  let sowID = $("#sowNameID").html();
  let accountName = escapeHtml($("#acc_name_tit").html());
  let sowName = escapeHtml($("#sow_name_tit").html());
  let invoiceRaiseDate = $("#invoice_raise_date").val();
  let invoiceMonth = $("#invoice_month option:selected").val();
  let invoiceAmount = $("#invoiceAmount").val();
  let invoiceYear = $("#invoiceYear").val();
  let invoiceDetails =
    '{ "SOW_ID" : "' +
    sowID +
    '", "INVOICE_RAISED_DATE":"' +
    convertDate(invoiceRaiseDate) +
    '", "INVOICE_MONTH":"' +
    invoiceMonth +
    '", "INVOICE_AMOUNT":' +
    invoiceAmount +
    ', "ACCOUNT_NAME":"' +
    accountName +
    '", "SOW_NAME":"' +
    sowName +
    '", "INVOICE_YEAR":"' +
    invoiceYear +
    '"}';
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

  let invoiceData = {
    query_type: "sow_invoice_addition",
    environment: apiValue.environment,
    user_details: "[" + accessDetails + "]",
    invoice_details: "[" + invoiceDetails + "]",
  };

  let apiURL = apiValue.url.replace("/app", "/add_sow_invoice");
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    data: JSON.stringify(invoiceData),
    success: function (json) {
      if (json.response == "Success") {
        toastr.options.timeOut = 2000; // 2s
        toastr.success(json.message);
      } else {
        toastr.options.timeOut = 2000; // 2s
        toastr.error(json.message);
      }
    },
    error: function (error) {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Message error" + JSON.stringify(error));
    },
  });
}

function handlePersonaChange(id) {
  const select = document.getElementById(`persona_select_${id}`);
  const tooltip = document.getElementById(`tooltip_${id}`);

  if (select && tooltip) {
    if (select.value === "Others") {
      tooltip.style.display = "block"; // keep tooltip available
    } else {
      tooltip.style.display = "none"; // hide tooltip
    }
  }
}

function showTooltip(id) {
  const select = document.getElementById(`persona_select_${id}`);
  const tooltip = document.getElementById(`tooltip_${id}`);
  const otherInputEl = document.getElementById(`other_text_${id}`);

  if (!select || !tooltip || !otherInputEl) {
    console.warn(`Missing DOM elements for ID: ${id}`);
    return;
  }

  const otherInput = otherInputEl.value ? otherInputEl.value.trim() : "";

  if (select.value === "Others" && otherInput !== "") {
    tooltip.textContent = otherInput;
    tooltip.style.display = "block";
  } else {
    tooltip.style.display = "none";
  }
}


function hideTooltip(id) {
  const tooltip = document.getElementById(`tooltip_${id}`);
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

function createPersonaDetails(
  i,
  sowId,
  persona_class,
  personaSKill,
  skillData,
  personaOpt,
  skillOptionsHtml,
  startDate,
  endDate,
  locat_class,
  locationName,
  locationOpt,
  bill_status_class,
  billStatusVal,
  billingOpt,
  billRateUsd,
  resCount,
  days,
  amount,
  otherPersonaData,
  personaGrpNumber
) {
  console.log("2222")
  console.log("otherPersonaData 2 - ", otherPersonaData)
  console.log('personaSKill - ', personaSKill)
  console.log('persona_class - ', persona_class)
  console.log('personaGrpNumber - ', personaGrpNumber)
  return `<tr class="${sowId.replace(
    / /g,
    "_"
  )}_${i} persona_table_details" id="bill_persona_${i}">
                                  <td style="display:none" id="res_number_${i}">Resource ${i}</td>
                                  <td class="persona_td" id="persona_details_${i}" 
                                      onmouseover="showTooltip('${i}')" 
                                      onmouseout="hideTooltip('${i}')">
                                      <div class="${persona_class}" id="persona_text_${i}">
                                          ${createDiv(personaSKill, skillData)}
                                      </div>
                                      <!-- Normal persona dropdown (persona_select) -->
                                      <!--  <div class="custom-tooltip-wrapper"> -->
                                        <select id="persona_select_${i}" class="form-control select_persona" 
                                          onchange="handlePersonaChange('${i}')">
                                          ${personaOpt}
                                        </select>
                                        <div id="tooltip_${i}" class="custom-tooltip" style="display:none; position:absolute;"></div>
                                      <!-- </div> -->
                                      <div id="others_input_${i}" style="display: none; margin-top: 10px; width: 100%; position: relative;">
                                      <input
                                        type="text"
                                        class="form-control"
                                        id="other_text_${i}"
                                        value="${otherPersonaData}"
                                        placeholder="Specify here"
                                        style="width: 100%; padding-right: 30px; height: 30px; font-size: 12px;border: 1px solid #D9D9D9;"
                                      >
                                      <button
                                        type="button"
                                        id="submit_other_${i}"
                                        class="btn"
                                        style="
                                          position: absolute;
                                          top: 50%;
                                          right: 5px;
                                          transform: translateY(-50%);
                                          padding: 0 6px;
                                          height: 22px;
                                          font-size: 12px;
                                          line-height: 1;
                                          background: none;
                                          border: none;
                                          color: #007bff;
                                        "
                                      >➤</button>
                                    </div>
                                  </td>
                                  <td style="display:none" class="persona_skills_td" id="skills_details_${i}" style="position: relative;">
                                      <select name="personaSkills[]" id="persona_skill_${i}" class="skillDataOpt" multiple></select>
                                  </td>
                                  <td>
                                    <span id="start_date_${i}">
                                      ${startDate == "" ? "-" : startDate}
                                    </span>
                                    <input type="text" class="form-control placeicon dateData resourceDate autoStartUpdateDate" 
                                      id="start_date_input_${i}"
                                      placeholder="&#xf073; MM-DD-YY" 
                                      name="resource_start_date" 
                                      autocomplete="off" 
                                      style="z-index: 1;display:none" value="${startDate}"
                               onchange="checkEndDate('start_date_input_${i}', 'end_date_input_${i}', 'Resource End Date should be greater than Resource Start Date'),calculateSowAmount(this)"
                                  </td>
                                  <td>
                                    <span id="end_date_${i}">
                                      ${endDate == "" ? "-" : endDate}
                                    </span>
                                    <input type="text" class="form-control placeicon dateData resourceDate autoEndUpdateDate" 
                                      id="end_date_input_${i}"
                                      placeholder="&#xf073; MM-DD-YY" 
                                      name="resource_end_date" 
                                      autocomplete="off" 
                                      style="z-index: 1;display:none" value="${endDate}" 
                               onchange="checkEndDate('start_date_input_${i}', 'end_date_input_${i}', 'Resource End Date should be greater than Resource Start Date'),calculateSowAmount(this)"
                                  </td>
                                  <td>
                                    <span id="bill_days_${i}" class="days_amount">${days}</span>
                                  </td>
                                  <td>
                                    <span class="${locat_class}" id="loc_text_${i}">
                                      ${locationName == "" ? "-" : locationName}
                                    </span>
                                    <select class="form-control text_center" id="loc_select_${i}" style="display:none" onchange="locSowAmount(this)">
                                      ${locationOpt}
                                    </select>
                                  </td>
                                  <td>
                                    <span class="${bill_status_class}" id="bill_status_${i}">
                                      ${billStatusVal == ""
      ? "Billed"
      : billStatusVal
    }
                                    </span>
                                    <select class="form-control text_center" id="bill_select_${i}" style="display:none" onchange="calculateSowAmount(this)">
                                      ${billingOpt}   
                                    </select>
                                  </td>
                                  <td>
                                    <span id="bill_us_${i}">${billRateUsd == "" ? "-" : billRateUsd
    }</span>
                                    <input type="number" step="any" class="form-control text_center" id="bill_us_rate_${i}" placeholder="Bill US" value="${billRateUsd}" style="display:none" oninput="handleIntegerOnly(this)"/>
                                  </td>
                                  <td>
                                    <span id="bill_ind_${i}">${resCount}</span>
                                    <input type="number" class="form-control text_center" id="bill_ind_input_${i}" placeholder="Bill Ind" value="${resCount}" style="display:none" oninput="handleIntegerValuesOnly(this)" min=1 value=1 step=1/></td>
                                  </td>
                                  
                                  <td class="cal_amt_val">
                                    <span id="bill_amount_${i}" class="days_amount">$${amount}</span>
                                  </td>
                                  <td>
                                       <button class="btn btn-info delete_button" onclick="deleteSkill(this)"><i class="fa fa-trash"
                                        aria-hidden="true"></i>
                                      </button>
                                  </td>
                                  <td style="display: none" id="res_grp_number_${i}">${personaGrpNumber}</td>
                              </tr>`;

}

function initializePersonaRowEvents(i) {
  console.log("3333", i)
  $(`#persona_select_${i}`).on("change", function () {
    const selectedVal = $(this).val();
    if (selectedVal === "Others") {
      $(`#others_input_${i}`).slideDown();
    } else {
      $(`#others_input_${i}`).slideUp();
      $(this).removeAttr("title");
      $(`#tooltip_${i}`).removeClass("show").text("");
    }
  });

  // Handle repeated clicks when "Others" is already selected
  $(`#persona_select_${i}`).on("click", function () {
    const selectedVal = $(this).val();
    if (selectedVal === "Others") {
      $(`#others_input_${i}`).slideDown();
    }
  });

  $(`#persona_select_${i}`).on("mouseenter", function () {
    $(this).removeAttr("title");
    const selectedVal = $(this).val();
    const tooltip = $(`#tooltip_${i}`);
    if (selectedVal === "Others") {
      const customVal = $(`#other_text_${i}`).val();
      if (customVal) {
        tooltip.text(customVal).addClass("show");
      } else {
        tooltip.removeClass("show").text("");
      }
    } else {
      tooltip.removeClass("show").text("");
    }
  });

  $(`#persona_select_${i}`).on("mouseleave", function () {
    $(`#tooltip_${i}`).removeClass("show");
  });

  function submitCustomPersona() {
    const customPersona = $(`#other_text_${i}`).val().trim();

    if (customPersona) {
      const $select = $(`#persona_select_${i}`);
      const $tooltip = $(`#tooltip_${i}`);

      $tooltip.text(customPersona);
      $select.val("Others");

      let customOption = $select.find("option[value='custom']");
      if (customOption.length !== 0) {
        customOption.text(customPersona);
        customOption.prop("selected", true);
      }

      $(`#others_input_${i}`).slideUp();
      toastr.success(`Please click on update to save the persona - ${customPersona}`);
    } else {
      toastr.error("Please enter a custom persona before submitting");
    }
  }

  $(`#submit_other_${i}`).on("click", submitCustomPersona);

  $(`#other_text_${i}`).on("keypress", function (e) {
    if (e.which === 13) {
      e.preventDefault();
      submitCustomPersona();
    }
  });
}




function removeDateHrs(date) {
  let dateUpdate = date;
  if (date.includes(" 00:00:00")) {
    dateUpdate = dateUpdate.replace(" 00:00:00", "");
  }
  return dateUpdate;
}
let businessRuleData = "";
let sowEditBusRule = "";
function getBusinessRule() {
  let apiURL = apiValue.url.replace("/app", "/approval_rules");
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    data: JSON.stringify({
      query_type: "approval_rules",
      environment: apiValue.environment,
    }),
    success: function (json) {
      businessRuleData = json;
      sessionStorage.setItem("business-rule", JSON.stringify(businessRuleData));
    },
    error: function (error) {
      toastr.options.timeOut = 2000; // 2s
      toastr.success("Message error" + JSON.stringify(error));
    },
  });
}

function onlyNumberKey(evt) {
  // Only ASCII character in that range allowed
  var ASCIICode = evt.which ? evt.which : evt.keyCode;
  if (ASCIICode > 31 && (ASCIICode < 46 || ASCIICode > 57)) {
    return false;
  }
  return true;
}

function getCurrentDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yy = today
    .getFullYear()
    .toString()
    .substr(-2);

  today = mm + "-" + dd + "-" + yy;
  $("#invoice_raise_date").val(today);
}

function assignProbOptions(funnelVal) {
  let probLeadPreQua = `<option value="-1">Select Probability</option>
                      <option value="10">10%</option>
                      <option value="30 to 50">30% to 50%</option>
                      <option value="70">&gt; 70%</option>`;
  let probSigned = `<option value="100">100%</option>`;
  let probOther = `<option value="-1">Select Probability</option>
                <option value="30 to 50">30% to 50%</option>
                <option value="70">&gt; 70%</option>`;
  let RenewalOpt = `<option value="-1">Select Probability</option>
                <option value="30 to 50">30% to 50%</option>
                <option value="70">&gt; 70%</option>
                <option value="100">100%</option>`;
  let probProposal = `<option value="70">&gt; 70%</option>`;
  let pronLost = `<option value="0">0%</option>`;
  if (funnelVal == undefined || funnelVal == "" || funnelVal == null) {
    funnelVal = $("#funnel_options option:selected").val();
  }
  // let funnelVal = $("#funnel_options option:selected").val();
  let scoutOpt = `<option value="10">10%</option>`;
  console.log("funnelVal", funnelVal);

  $("#probability_options").empty();
  if (funnelVal == "Lead") {
    $("#probability_options").append(probLeadPreQua);
  } else if (funnelVal == "Signed") {
    $("#probability_options").append(probSigned);
  } else if (
    funnelVal == "Qualified" ||
    funnelVal == "Pre-Qualified"
  ) {
    $("#probability_options").append(probOther);
  } else if (funnelVal == "Renewal") {
    $("#probability_options").append(RenewalOpt);
  } else if (funnelVal == "Proposal") {
    $("#probability_options").append(probProposal);
  } else if (funnelVal == "Lost") {
    $("#probability_options").append(pronLost);
  } else if (funnelVal == "Closed") {
    $("#probability_options").append(pronLost);
  } else if (funnelVal == "Scout") {
    $("#probability_options").append(scoutOpt);
  }
  if (funnelVal == "Lead" || funnelVal == "Scout") {
    $('.prob_imp').hide();
    $('.sow_type_imp').hide();
    $('.billing_imp').hide();
    $("#billing_options").show();
    $('#billing_type_name').hide();
    $('#billing_options').prop('disabled', false);
    // $('.opp_name_imp').hide();
  } else {
    $('.prob_imp').show();
    $('.sow_type_imp').show();
    $('.billing_imp').show();
    // $('.opp_name_imp').show();
    $("#billing_options").hide();
    $('#billing_type_name').show();
    $('#billing_options').prop('disabled', true);
  }

  // if (funnelVal === "Signed") {
  //   $('.nps_imp').show();
  // } else {
  //   $('.nps_imp').hide();
  // }
}

function updateAllDates() {
  let AllStartDate = $("#legal_start_date").val();
  $(".updateStartDate").val(AllStartDate);
  let AllEndDate = $("#legal_end_date").val();
  $(".updateEndDate").val(AllEndDate);
  updatePersonaDate();
  updateMonthlyTable();
  calculateSowAmount()
}

let dates = [];
let lastDates = [];
function dateRange(startDate, endDate) {
  var start = startDate.split("-");
  var end = endDate.split("-");
  var startYear = parseInt(start[0]);
  var endYear = parseInt(end[0]);
  dates = [];
  lastDates = [];

  for (var i = startYear; i <= endYear; i++) {
    var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
    var startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
    for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
      var month = j + 1;
      var displayMonth = month < 10 ? "0" + month : month;

      dates.push([i, displayMonth, "01"].join("-"));
      lastDates.push(LastDayOfMonth(i, displayMonth));
    }
  }
  return dates;
}

function LastDayOfMonth(Year, Month) {
  var date = new Date(new Date(Year, Month, 1) - 1),
    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
    day = ("0" + date.getDate()).slice(-2);
  return [date.getFullYear(), mnth, day].join("-");
}

function fixedRateCal(startDate, endDate, billrate, location) {
  let holidayList = sowDropDownJson.HOLIDAY_DATA;
  let newStart = convertDate(startDate);
  let newEnd = convertDate(endDate);
  dateRange(newStart, newEnd);
  let dateLen = dates.length - 1;
  let totalValue = 0;
  let todayDays = 0;
  let todayAmount = 0;
  $.each(dates, function (i, firstdate) {
    let businessDays = 0;
    let resBusDays = 0;
    let tempCal = 0;
    if (i == 0) {
      resBusDays = getBusinessDatesCount(newStart, lastDates[0]);
      businessDays = getBusinessDatesCount(dates[i], lastDates[i]);
      tempCal = (21 / businessDays) * resBusDays;
      tempCal = Math.round(tempCal * 100) / 100;
      totalValue += Math.round(tempCal * billrate * 8 * 100) / 100;
      let splitMonth = newStart.split("-");
      let getYear = splitMonth[0];
      let getMnth = splitMonth[1];
      let holiday = holidaysCount(
        holidayList,
        getYear,
        getMnth,
        location,
        newStart,
        lastDates[0]
      );
      todayDays += resBusDays - holiday;
    } else if (dateLen == i) {
      resBusDays = getBusinessDatesCount(dates[dateLen], newEnd);
      businessDays = getBusinessDatesCount(dates[i], lastDates[i]);
      tempCal = (21 / businessDays) * resBusDays;
      tempCal = Math.round(tempCal * 100) / 100;
      totalValue += Math.round(tempCal * billrate * 8 * 100) / 100;
      let splitMonth = newEnd.split("-");
      let getYear = splitMonth[0];
      let getMnth = splitMonth[1];
      let holiday = holidaysCount(
        holidayList,
        getYear,
        getMnth,
        location,
        dates[dateLen],
        newEnd
      );
      todayDays += resBusDays - holiday;
    } else {
      resBusDays = getBusinessDatesCount(dates[i], lastDates[i]);
      businessDays = getBusinessDatesCount(dates[i], lastDates[i]);
      tempCal = (21 / businessDays) * resBusDays;
      tempCal = Math.round(tempCal * 100) / 100;
      totalValue += Math.round(tempCal * billrate * 8 * 100) / 100;
      let splitMonth = dates[i].split("-");
      let getYear = splitMonth[0];
      let getMnth = splitMonth[1];
      let holiday = holidaysCount(
        holidayList,
        getYear,
        getMnth,
        location,
        dates[i],
        lastDates[i]
      );
      todayDays += resBusDays - holiday;
    }
  });
  todayAmount = Math.round(totalValue);
  return Math.round(totalValue) + "," + todayDays + "," + todayAmount;
}

function addOrReplaceOrderBy(newData) {
  var stringToAdd = "?sow=" + newData;

  if (window.location.search == "") return window.location.href + stringToAdd;

  if (window.location.search.indexOf("sow=") == -1)
    return window.location.href + stringToAdd;

  var newSearchString = "";
  var searchParams = window.location.search.substring(1).split("&");
  for (var i = 0; i < searchParams.length; i++) {
    if (searchParams[i].indexOf("sow=") > -1) {
      searchParams[i] = "sow=" + newData;
      break;
    }
  }

  return window.location.href.split("?")[0] + "?" + searchParams.join("&");
}

function removeHolidays(startDate, endDate, billrate, location) {
  let holidayList = sowDropDownJson.HOLIDAY_DATA;
  let currentYear = new Date().getFullYear();
  let newStart = convertDate(startDate);
  let newEnd = convertDate(endDate);
  let standardLeaveInd = 1.83;
  let standardLeaveUs = 1.67;
  dateRange(newStart, newEnd);
  let dateLen = dates.length - 1;
  let totalValue = 0;
  let todayDays = 0;
  let todayAmount = 0;
  let totalAmountTM = 0;
  $.each(dates, function (i, firstdate) {
    console.log("firstdate---", firstdate);
    console.log("lastDates[0]---", lastDates);

    let getFullMntDays = getBusinessDatesCount(firstdate, lastDates[i]);
    console.log("getFullMntDays--", getFullMntDays);
    let businessDays = 0;
    let resBusDays = 0;
    let resBusDaysTM = 0;
    if (i == 0) {
      let holidayCount = 0;
      if (dateLen == 0) {
        resBusDays = getBusinessDatesCount(newStart, newEnd);
      } else {
        resBusDays = getBusinessDatesCount(newStart, lastDates[0]);
      }

      let splitMonth = newStart.split("-");
      let getYear = splitMonth[0];
      let getMnth = splitMonth[1];
      $.each(holidayList, function (l, hldyData) {
        if (hldyData.YEAR == getYear) {
          // let updatedHolidayYearData = removeWeekendsAndUpdateCounts(hldyData);
          let updatedHolidayYearData = removeWeekendsAndUpdateCounts(hldyData);
          $.each(updatedHolidayYearData.YEAR_DATA, function (j, mnthData) {
            if (mnthData.MONTH == getMnth) {
              if (location == "INDIA" || location == "india") {
                $.each(mnthData.IND_HOLIDAY, function (k, eachDay) {
                  let tempStartDate = new Date(newStart);
                  if (dateLen == 0) {
                    tempEndDate = new Date(newEnd);
                  } else {
                    tempEndDate = new Date(lastDates[0]);
                  }
                  let tempCompDate = new Date(eachDay);
                  if (
                    tempCompDate >= tempStartDate &&
                    tempCompDate <= tempEndDate
                  ) {
                    holidayCount++;
                  }
                });
              } else if (location == "US") {
                $.each(mnthData.US_HOLIDAY, function (k, eachDay) {
                  let tempStartDate = new Date(newStart);
                  if (dateLen == 0) {
                    tempEndDate = new Date(newEnd);
                  } else {
                    tempEndDate = new Date(lastDates[0]);
                  }
                  let tempCompDate = new Date(eachDay);
                  if (
                    tempCompDate >= tempStartDate &&
                    tempCompDate <= tempEndDate
                  ) {
                    holidayCount++;
                  }
                });
              }
            }
          });
        }
      });
      if ($("#billing_options option:selected").val() == "Time and Material") {
        console.log("resBusDays", resBusDays);
        console.log("holidayCount", holidayCount);
        resBusDaysTM = resBusDays;
        // Always subtract holidayCount from resBusDays and resBusDaysTM
        if(resBusDays >= 20){
          resBusDays = resBusDays - holidayCount;
          if (resBusDaysTM >= 20) {
            resBusDaysTM = resBusDaysTM-holidayCount; // Start with resBusDays after holiday subtraction
            if (location == "INDIA" || location == "india") {
              resBusDaysTM -= standardLeaveInd; // Subtract standard leave only for resBusDaysTM
            } else {
              resBusDaysTM -= standardLeaveUs; // Subtract standard leave only for resBusDaysTM
            }
          }
        }
      }
      console.log("resBusDaysTM - ", resBusDaysTM);
      totalAmountTM += resBusDaysTM * billrate * 8;
      totalValue += resBusDays * billrate * 8;
      todayDays += resBusDays;
    } else if (dateLen == i) {
      let holidayCount = 0;
      resBusDays = getBusinessDatesCount(dates[dateLen], newEnd);
      console.log("resBusDays", resBusDays);

      let splitMonth = newEnd.split("-");
      let getYear = splitMonth[0];
      let getMnth = splitMonth[1];
      $.each(holidayList, function (l, hldyData) {
        if (hldyData.YEAR == getYear) {
          // let updatedHolidayYearData = removeWeekendsAndUpdateCounts(hldyData);
          let updatedHolidayYearData = removeWeekendsAndUpdateCounts(hldyData);
          $.each(updatedHolidayYearData.YEAR_DATA, function (j, mnthData) {
            if (mnthData.MONTH == getMnth) {
              if (location == "INDIA" || location == "india") {
                $.each(mnthData.IND_HOLIDAY, function (k, eachDay) {
                  let tempStartDate = new Date(dates[dateLen]),
                    tempEndDate = new Date(newEnd);
                  let tempCompDate = new Date(eachDay);
                  if (
                    tempCompDate >= tempStartDate &&
                    tempCompDate <= tempEndDate
                  ) {
                    holidayCount++;
                  }
                });
              } else if (location == "US") {
                $.each(mnthData.US_HOLIDAY, function (k, eachDay) {
                  let tempStartDate = new Date(dates[dateLen]),
                    tempEndDate = new Date(newEnd);
                  let tempCompDate = new Date(eachDay);
                  if (
                    tempCompDate >= tempStartDate &&
                    tempCompDate <= tempEndDate
                  ) {
                    holidayCount++;
                  }
                });
              }
            }
          });
        }
      });
      if ($("#billing_options option:selected").val() == "Time and Material") {
        console.log("resBusDays", resBusDays);
        console.log("holidayCount", holidayCount);
        resBusDaysTM = resBusDays;
        // Always subtract holidayCount from resBusDays and resBusDaysTM
        if(resBusDays >= 20){
          resBusDays = resBusDays - holidayCount;
          if (resBusDaysTM >= 20) {
            resBusDaysTM = resBusDaysTM-holidayCount; // Start with resBusDays after holiday subtraction
            if (location == "INDIA" || location == "india") {
              resBusDaysTM -= standardLeaveInd; // Subtract standard leave only for resBusDaysTM
            } else {
              resBusDaysTM -= standardLeaveUs; // Subtract standard leave only for resBusDaysTM
            }
          }
        }
      }
      console.log("resBusDaysTM - ", resBusDaysTM);
      totalAmountTM += resBusDaysTM * billrate * 8;
      totalValue += resBusDays * billrate * 8;
      todayDays += resBusDays;
    } else {
      let holidayCount = 0;
      resBusDays = getBusinessDatesCount(dates[i], lastDates[i]);
      console.log("resBusDays", resBusDays);
      let splitMonth = dates[i].split("-");
      let getYear = splitMonth[0];
      let getMnth = splitMonth[1];
      $.each(holidayList, function (l, hldyData) {
        if (hldyData.YEAR == getYear) {
          // let updatedHolidayYearData = removeWeekendsAndUpdateCounts(hldyData);
          let updatedHolidayYearData = removeWeekendsAndUpdateCounts(hldyData);
          $.each(updatedHolidayYearData.YEAR_DATA, function (j, mnthData) {
            if (mnthData.MONTH == getMnth) {
              if (location == "INDIA" || location == "india") {
                $.each(mnthData.IND_HOLIDAY, function (k, eachDay) {
                  let tempStartDate = new Date(dates[i]),
                    tempEndDate = new Date(lastDates[i]);
                  let tempCompDate = new Date(eachDay);
                  if (
                    tempCompDate >= tempStartDate &&
                    tempCompDate <= tempEndDate
                  ) {
                    holidayCount++;
                  }
                });
              } else if (location == "US") {
                $.each(mnthData.US_HOLIDAY, function (k, eachDay) {
                  let tempStartDate = new Date(dates[i]),
                    tempEndDate = new Date(lastDates[i]);
                  let tempCompDate = new Date(eachDay);
                  if (
                    tempCompDate >= tempStartDate &&
                    tempCompDate <= tempEndDate
                  ) {
                    holidayCount++;
                  }
                });
              }
            }
          });
        }
      });
      if ($("#billing_options option:selected").val() == "Time and Material") {
        console.log("resBusDays", resBusDays);
        console.log("holidayCount", holidayCount);
        resBusDaysTM = resBusDays;
        // Always subtract holidayCount from resBusDays and resBusDaysTM
        if(resBusDays >= 20){
          resBusDays = resBusDays - holidayCount;
          if (resBusDaysTM >= 20) {
            resBusDaysTM = resBusDaysTM-holidayCount; // Start with resBusDays after holiday subtraction
            if (location == "INDIA" || location == "india") {
              resBusDaysTM -= standardLeaveInd; // Subtract standard leave only for resBusDaysTM
            } else {
              resBusDaysTM -= standardLeaveUs; // Subtract standard leave only for resBusDaysTM
            }
          }
        }
      }
      console.log("resBusDaysTM - ", resBusDaysTM);
      totalAmountTM += resBusDaysTM * billrate * 8;
      totalValue += resBusDays * billrate * 8;
      todayDays += resBusDays;
    }
  });
  todayAmount = totalValue;
  console.log("todayAmount", todayAmount);
  console.log("totalAmountTM", totalAmountTM);

  return totalValue + "," + todayDays + "," + todayAmount + "," + totalAmountTM;
}
function removeHolidaysMacys(startDate, endDate, billrate, location) {
  let holidayList = sowDropDownJson.MACYS_HOLIDAY_CALENDAR;
  console.log("holidayList", holidayList);

  let currentYear = new Date().getFullYear();
  let newStart = convertDate(startDate);
  let newEnd = convertDate(endDate);
  let standardLeaveInd = 1.83;
  let standardLeaveUs = 1.67;
  let totalValue = 0;
  let todayDays = 0;
  let todayAmount = 0;
  let totalAmountTM = 0;

  // Collect all Macys fiscal month periods that overlap with the resource date range
  let macysMonthPeriods = getMacysMonthPeriods(holidayList, newStart, newEnd);
  console.log("macysMonthPeriods", macysMonthPeriods);

  $.each(macysMonthPeriods, function (i, period) {
    console.log("Macys period---", period);

    let resBusDays = 0;
    let resBusDaysTM = 0;
    let holidayCount = 0;

    // Calculate holidayCount dynamically from HOLIDAY_DATES specifically for the effective range
    if (period.holidayDates && period.holidayDates.length > 0) {
      period.holidayDates.forEach(function (hDateStr) {
        let hDate = new Date(hDateStr + "T00:00:00");
        let eStart = new Date(period.effectiveStart + "T00:00:00");
        let eEnd = new Date(period.effectiveEnd + "T00:00:00");
        if (hDate >= eStart && hDate <= eEnd) {
          let dayOfWeek = hDate.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            holidayCount++;
          }
        }
      });
    }

    let macysNoDays = period.workingDays;

    // Calculate business days for the effective range within this Macys month
    resBusDays = getBusinessDatesCount(period.effectiveStart, period.effectiveEnd);
    console.log("resBusDays for period", period.monthName, resBusDays);

    // If the resource does not span the full Macys month, pro-rate the working days
    let fullMonthBusDays = 0;
    if (period.monthStart && period.monthEnd) {
      fullMonthBusDays = getBusinessDatesCount(period.monthStart, period.monthEnd);
    }

    if ($("#billing_options option:selected").val() == "Time and Material") {
      console.log("resBusDays", resBusDays);
      console.log("holidayCount", holidayCount);
      console.log("macysNoDays", macysNoDays);
      resBusDaysTM = resBusDays;

      let preHolidayDays = 0; // Days before holiday subtraction

      if (macysNoDays > 0 && fullMonthBusDays > 0 && resBusDays >= fullMonthBusDays) {
        // Full Macys month is covered - use Macys working days directly
        preHolidayDays = macysNoDays;
        resBusDays = macysNoDays - holidayCount;
      } else if (macysNoDays > 0 && fullMonthBusDays > 0 && resBusDays < fullMonthBusDays) {
        // Partial Macys month - pro-rate based on proportion of the Macys month covered
        let scaledBaseDays = Math.round((resBusDays / fullMonthBusDays) * macysNoDays);
        preHolidayDays = scaledBaseDays;
        resBusDays = scaledBaseDays - holidayCount;
      } else {
        preHolidayDays = resBusDays;
        resBusDays = resBusDays - holidayCount;
      }
      console.log("resBusDays after adjustment", resBusDays);
      resBusDaysTM = resBusDays;

      if (preHolidayDays >= 20) { // If preHolidayDays is greater than 20, then subtract standard leave
        if (location == "INDIA" || location == "india") {
          resBusDaysTM -= standardLeaveInd;
        } else {
          resBusDaysTM -= standardLeaveUs;
        }
      }
    }

    console.log("resBusDaysTM", resBusDaysTM);
    totalAmountTM += resBusDaysTM * billrate * 8;
    totalValue += resBusDays * billrate * 8;
    todayDays += resBusDays;
  });

  todayAmount = totalValue;
  console.log("todayAmount", todayAmount);
  console.log("totalAmountTM", totalAmountTM);

  return totalValue + "," + todayDays + "," + todayAmount + "," + totalAmountTM;
}

/**
 * Build an array of Macys fiscal month periods that overlap with the resource start/end range.
 * Each entry contains effective start/end (clamped to resource range), plus the Macys calendar data.
 * Falls back to standard calendar months when MONTH_START_DATE/MONTH_END_DATE are null.
 */
function getMacysMonthPeriods(holidayList, resourceStart, resourceEnd) {
  let periods = [];
  let resStartDate = new Date(resourceStart + "T00:00:00");
  let resEndDate = new Date(resourceEnd + "T00:00:00");

  $.each(holidayList, function (l, yearData) {
    $.each(yearData.YEAR_DATA, function (j, mnthData) {
      let monthStart, monthEnd;

      if (mnthData.MONTH_START_DATE && mnthData.MONTH_END_DATE) {
        // Use Macys custom fiscal month boundaries
        monthStart = mnthData.MONTH_START_DATE;
        monthEnd = mnthData.MONTH_END_DATE;
      } else {
        // Fallback to standard calendar month boundaries
        let yr = yearData.YEAR;
        let mn = mnthData.MONTH_NUMBER.toString().padStart(2, '0');
        monthStart = yr + "-" + mn + "-01";
        monthEnd = LastDayOfMonth(yr, mn);
      }

      let mStart = new Date(monthStart + "T00:00:00");
      let mEnd = new Date(monthEnd + "T00:00:00");

      // Check if this Macys month overlaps with the resource date range
      if (mStart <= resEndDate && mEnd >= resStartDate) {
        // Clamp to the resource date range
        let effectiveStart = mStart < resStartDate ? resourceStart : monthStart;
        let effectiveEnd = mEnd > resEndDate ? resourceEnd : monthEnd;

        periods.push({
          year: yearData.YEAR,
          monthNumber: mnthData.MONTH_NUMBER,
          monthName: mnthData.MONTH_NAME,
          workingDays: parseInt(mnthData.NUMBER_OF_WORKING_DAYS) || 0,
          holiday: parseInt(mnthData.HOLIDAY) || 0,
          holidayDates: mnthData.HOLIDAY_DATES || [],
          monthStart: monthStart,
          monthEnd: monthEnd,
          effectiveStart: effectiveStart,
          effectiveEnd: effectiveEnd
        });
      }
    });
  });

  // Sort by effective start date
  periods.sort(function (a, b) {
    return new Date(a.effectiveStart) - new Date(b.effectiveStart);
  });

  return periods;
}
function sowFindResource() {
  let busRuleData = [],
    currFunnelStageVal = $("#funnel_name").html();
  $.each(businessRuleData, function (i, busRule) {
    if (busRule.RULE_IDENTIFIER == "RESOURCE ALLOCATION_NEW") {
      busRuleData = busRule.RULE_DATA;
      $.each(busRuleData, function (j, ruleData) {
        let attributeValue = [];
        if (ruleData.WORKFLOW_ATTRIBUTE == "SOW_STAGE") {
          if (ruleData.OPERATION == "in") {
            attributeValue = ruleData.ATTRIBUTE_VALUE;
            let sowStage = false;
            $.each(attributeValue, function (k, attVal) {
              if (attVal == currFunnelStageVal) {
                sessionStorage.setItem(
                  "find-resource-data",
                  JSON.stringify(sow_acc_data)
                );
                let findData = sessionStorage.getItem("find-resource-data");
                window.location.href = "resourceAllocation.html";
                sowStage = true;
              }
            });
            if (sowStage == false) {
              toastr.options.timeOut = 2000; // 2s
              toastr.error(
                "Resource allocation is not applicable, Funnel stage is in <b>" +
                currFunnelStageVal +
                "</b>"
              );
              return false;
            }
          }
        }
      });
    }
  });
}

function removeWeekendsAndUpdateCounts(data) {
  const isWeekend = (dateStr) => {
    const [year, month, dayOfMonth] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, dayOfMonth);
    const day = date.getDay(); // Sunday = 0, Saturday = 6
    return day === 0 || day === 6;
  };

  return {
    ...data,
    YEAR_DATA: data.YEAR_DATA.map(monthData => {
      const filteredIndHolidays = monthData.IND_HOLIDAY.filter(date => !isWeekend(date));
      const filteredUSHolidays = monthData.US_HOLIDAY.filter(date => !isWeekend(date));

      return {
        ...monthData,
        IND_HOLIDAY: filteredIndHolidays,
        IND_COUNT: filteredIndHolidays.length,
        US_HOLIDAY: filteredUSHolidays,
        US_COUNT: filteredUSHolidays.length
      };
    })
  };
}

// function updatePocData() {
//   let getHtml = $("#sow_head_button").html()
//   if (getHtml == '<i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit Leads') {
//     $("#sow_head_button").html("<i class='fa fa-pencil-square'></i> Update Leads");
//     $(".span_font_weight").hide();
//     $(".edit_head_data").show();
//   } else {
//     let deliveryHeadID = $("#sow_del_head option:selected").val();
//     deliveryHeadID = (deliveryHeadID == "-1" ? "" : deliveryHeadID)
//     let deliveryHeadName = $("#sow_del_head option:selected").text();
//     deliveryHeadName = (deliveryHeadName == "Select " ? "" : deliveryHeadName)
//     let projectHeadID = $("#sow_project_head option:selected").val();
//     projectHeadID = (projectHeadID == "-1" ? "" : projectHeadID)
//     let projectHeadName = $("#sow_project_head option:selected").text();
//     projectHeadName = (projectHeadName == "Select " ? "" : projectHeadName)
//     let programHeadID = $("#sow_program_head option:selected").val();
//     programHeadID = (programHeadID == "-1" ? "" : programHeadID)
//     let programHeadName = $("#sow_program_head option:selected").text();
//     programHeadName = (programHeadName == "Select " ? "" : programHeadName)

//     let checkAnyChange = false
//     if (deliveryHeadID != sow_acc_data.DELIVERY_HEAD) {
//       checkAnyChange = true;
//       // return false
//     } else if (projectHeadID != sow_acc_data.PROJECT_LEAD) {
//       checkAnyChange = true;
//       // return false
//     } else if (programHeadID != sow_acc_data.PROGRAM_LEAD) {
//       checkAnyChange = true;
//       // return false
//     } else {
//       // toastr.options.timeOut = 2000; // 2s
//       // toastr.error("No Lead changes found");
//       $("#sow_head_button").html('<i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit Leads');
//       $(".span_font_weight").show();
//       $(".edit_head_data").hide();
//       return false
//     }

//     if (checkAnyChange == true) {
//       let accessDetails =
//         '{ "ACCESS_LEVEL" : "' +
//         accese_level +
//         '", "Access":"' +
//         accessData +
//         '", "EDIT_ACCESS":"' +
//         edit_access +
//         '", "EMAIL_ID":"' +
//         sessionName +
//         '", "GROUP_NAME":"' +
//         groupName +
//         '", "USERNAME":"' +
//         empName +
//         '", "USER_ID":"' +
//         empId +
//         '"}';
//       let takeApprovalResponse = "No", approverName = ""
//       let approvalData =
//         '{ "TAKE_APPROVAL" : "' +
//         takeApprovalResponse +
//         '", "APPROVER":"' +
//         approverName +
//         '"}';

//       let newPocData =
//         '{ "ACCOUNT_ID" : "' +
//         sow_acc_data.ACCOUNT_ID +
//         '", "ACCOUNT_NAME" : "' +
//         sow_acc_data.ACCOUNT_NAME +
//         '", "SOW_ID":"' +
//         sow_acc_data.SOW_ID +
//         '", "SOW_NAME":"' +
//         sow_acc_data.SOW_NAME +
//         '", "SOW_STATUS":"' +
//         sow_acc_data.SOW_STAGE +
//         '", "DELIVERY_HEAD":"' +
//         deliveryHeadID +
//         '", "PROJECT_LEAD":"' +
//         projectHeadID +
//         '", "PROGRAM_LEAD":"' +
//         programHeadID +
//         '", "DELIVERY_HEAD_NAME":"' +
//         deliveryHeadName +
//         '", "PROJECT_LEAD_NAME":"' +
//         projectHeadName +
//         '", "PROGRAM_LEAD_NAME":"' +
//         programHeadName +
//         '"}';

//       let oldPocData =
//         '{ "ACCOUNT_ID" : "' +
//         sow_acc_data.ACCOUNT_ID +
//         '", "ACCOUNT_NAME" : "' +
//         sow_acc_data.ACCOUNT_NAME +
//         '", "SOW_ID":"' +
//         sow_acc_data.SOW_ID +
//         '", "SOW_NAME":"' +
//         sow_acc_data.SOW_NAME +
//         '", "SOW_STATUS":"' +
//         sow_acc_data.SOW_STAGE +
//         '", "DELIVERY_HEAD":"' +
//         sow_acc_data.DELIVERY_HEAD +
//         '", "PROJECT_LEAD":"' +
//         sow_acc_data.PROJECT_LEAD +
//         '", "PROGRAM_LEAD":"' +
//         sow_acc_data.PROGRAM_LEAD +
//         '", "DELIVERY_HEAD_NAME":"' +
//         sow_acc_data.DELIVERY_HEAD_NAME +
//         '", "PROJECT_LEAD_NAME":"' +
//         sow_acc_data.PROJECT_LEAD_NAME +
//         '", "PROGRAM_LEAD_NAME":"' +
//         sow_acc_data.PROGRAM_LEAD_NAME +
//         '"}';

//       let updatePocJsonData = {
//         query_type: "sow_poc_add_edit",
//         environment: apiValue.environment,
//         user_details: "[" + accessDetails + "]",
//         APPROVAL_DATA: "[" + approvalData + "]",
//         new_poc: "[" + newPocData + "]",
//         old_poc: "[" + oldPocData + "]",
//         sow_id : sow_acc_data.SOW_ID,
//         unique_id : sow_acc_data.UNIQUE_ID
//       };
//       let apiURL =apiValue.url.replace("/app", "/sow_poc_add_edit");
//       $('#sow_head_button').prop("disabled", true);
//       $.ajax({
//         url: apiURL,
//         // url: "https://rre-api.factspanapps.com:5000/app",
//         type: "POST",
//         dataType: "json",
//         crossDomain: true,
//         format: "json",
//         data:JSON.stringify(updatePocJsonData),
//         success: function (json) {
//           $("#sow_head_button").html('<i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit Leads');
//           $(".span_font_weight").show();
//           $(".edit_head_data").hide();
//           if (json.Message == "Success") {
//             toastr.options.timeOut = 2000; // 2s
//             toastr.success(json.Response);
//             let updatePoc = json.DATA;
//             let deliveryH = (updatePoc[0].DELIVERY_HEAD == "" ? "-1" : updatePoc[0].DELIVERY_HEAD)
//             $("#sow_del_head").val(deliveryH);
//             $("#delivery_head_name").empty("");
//             let deliveryHeadName = updatePoc[0].DELIVERY_HEAD_NAME
//             if (deliveryHeadName == 'Select ' || deliveryHeadName == 'Select') deliveryHeadName == "";
//             $("#delivery_head_name").append(deliveryHeadName == "" ? "N/A" : deliveryHeadName)
//             sow_acc_data["DELIVERY_HEAD"] = updatePoc[0].DELIVERY_HEAD;
//             sow_acc_data["DELIVERY_HEAD_NAME"] = deliveryHeadName;
//             let projectH = (updatePoc[0].PROJECT_LEAD == "" ? "-1" : updatePoc[0].PROJECT_LEAD)
//             $("#sow_project_head").val(projectH);
//             $("#program_head_name").empty("")
//             let programLeadName = updatePoc[0].PROGRAM_LEAD_NAME
//             if (programLeadName == 'Select ' || programLeadName == 'Select') programLeadName == "";
//             $("#program_head_name").append(programLeadName == "" ? "N/A" : programLeadName)
//             sow_acc_data["PROGRAM_LEAD"] = updatePoc[0].PROGRAM_LEAD;
//             sow_acc_data["PROGRAM_LEAD_NAME"] = programLeadName;
//             let programH = (updatePoc[0].PROGRAM_LEAD == "" ? "-1" : updatePoc[0].PROGRAM_LEAD)
//             $("#sow_program_head").val(programH);
//             $("#project_head_name").empty("")
//             let projectLeadName = updatePoc[0].PROJECT_LEAD_NAME
//             if (projectLeadName == "Select " || projectLeadName == 'Select') projectLeadName == "";
//             $("#project_head_name").append(projectLeadName == "" ? "N/A" : projectLeadName)
//             sow_acc_data["PROJECT_LEAD"] = updatePoc[0].PROJECT_LEAD;
//             sow_acc_data["PROJECT_LEAD_NAME"] = projectLeadName;
//             assignSowData();
//           } else {
//             toastr.options.timeOut = 2000; // 2s
//             toastr.error(json.Response);
//           }
//           $('#sow_head_button').prop("disabled", false);
//         },
//         error: function (error) {
//           $("#sow_head_button").html('<i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit Leads')
//           $(".span_font_weight").show();
//           $(".edit_head_data").hide();
//           toastr.options.timeOut = 2000; // 2s
//           toastr.error("Message error" + JSON.stringify(error));
//           $('#sow_head_button').prop("disabled", false);
//         },
//       });
//     }
//   }

// }

const holidaysCount = (holidayList, getYear, getMnth, location, start, end) => {
  let holidayCount = 0;
  $.each(holidayList, function (l, hldyData) {
    if (hldyData.YEAR == getYear) {
      let updatedHolidayYearData = removeWeekendsAndUpdateCounts(hldyData);
      console.log("updatedHolidayYearData - ", updatedHolidayYearData);
      $.each(updatedHolidayYearData.YEAR_DATA, function (j, mnthData) {
        if (mnthData.MONTH == getMnth) {
          if (location == "INDIA" || location == "india") {
            $.each(mnthData.IND_HOLIDAY, function (k, eachDay) {
              let tempStartDate = new Date(start),
                tempEndDate = new Date(end);
              let tempCompDate = new Date(eachDay);
              if (
                tempCompDate >= tempStartDate &&
                tempCompDate <= tempEndDate
              ) {
                holidayCount++;
              }
            });
          } else if (location == "US") {
            $.each(mnthData.US_HOLIDAY, function (k, eachDay) {
              let tempStartDate = new Date(start),
                tempEndDate = new Date(end);
              let tempCompDate = new Date(eachDay);
              if (
                tempCompDate >= tempStartDate &&
                tempCompDate <= tempEndDate
              ) {
                holidayCount++;
              }
            });
          }
        }
      });
    }
  });
  return holidayCount;
};

const tabs = [
  {
    name: "Notes",
    content: `
        <div class="notes-form-container">
          <!-- Interaction Type Selection -->
          <div class="interaction-header-row">
            <div class="interaction-type-options">
              <label class="custom-radio">
                <input type="radio" name="interactionType" value="N/A" checked disabled>
                <span class="radio-content"><i class="fas fa-ban"></i> N/A</span>
              </label>
              <label class="custom-radio">
                <input type="radio" name="interactionType" value="In Person" disabled>
                <span class="radio-content"><i class="fas fa-users"></i> In Person</span>
              </label>
              <label class="custom-radio">
                <input type="radio" name="interactionType" value="Phone Call" disabled>
                <span class="radio-content"><i class="fas fa-phone-alt"></i> Phone Call</span>
              </label>
              <label class="custom-radio">
                <input type="radio" name="interactionType" value="Video Call" disabled>
                <span class="radio-content"><i class="fas fa-video"></i> Video Call</span>
              </label>
              <label class="custom-radio">
                <input type="radio" name="interactionType" value="Slack/Teams" disabled>
                <span class="radio-content"><i class="fas fa-comment-dots"></i> Slack/Teams</span>
              </label>
              <label class="custom-radio">
                <input type="radio" name="interactionType" value="Phone Text" disabled>
                <span class="radio-content"><i class="fas fa-mobile-alt"></i> Phone Text</span>
              </label>
            </div>
            <div class="date-field-inline">
              <label>Meeting Date</label>
              <div class="date-picker-wrapper">
                <input type="text" id="meetingDate" class="form-input-inline placeicon" placeholder="&#xf073; MM-DD-YY"
                  autocomplete="off" disabled>
              </div>
            </div>
          </div>

          <!-- Detailed Notes -->
          <div class="detailed-notes" style="margin-top: 15px;">
            <label class="section-label">Detailed Notes</label>
            <div id="editor"></div>
            <span class="warningMessage" id="charLimitWarning" style="display: none; color: red;">
              Maximum character limit of 2000 reached!
            </span>
          </div>

          <!-- Next Steps Section -->
          <div class="next-steps-header-row">
            <div class="toggle-group">
              <button type="button" class="toggle-btn active" id="nextStepsBtn" data-value="Next Steps" disabled>
                Next Steps
              </button>
              <button type="button" class="toggle-btn" id="noNextStepsBtn" data-value="No Next Steps" disabled>
                No Next Steps
              </button>
            </div>
            <div class="date-field-inline" id="nextStepsEtaWrapper">
              <label>Next Steps Estimated Date</label>
              <div class="date-picker-wrapper">
                <input type="text" id="nextStepsEta" class="form-input-inline placeicon" placeholder="&#xf073; MM-DD-YY"
                  autocomplete="off" disabled>
              </div>
            </div>
          </div>
          <div class="next-steps-content" id="nextStepsContent">
            <div id="nextStepsText" class="bg_white"></div>
          </div>

          <!-- Next Interaction Section -->
          <div class="next-interaction-section">
            <div class="section-label" style="margin-bottom: 10px;"><button class="toggle-btn active"> <i class="fas fa-paper-plane"
                aria-hidden="true"></i> Next Interaction</button></div>
            <div class="next-interaction-content" id="nextInteractionContent">
              <div class="interaction-header-row">
                <div class="interaction-type-options">
                  <label class="custom-radio">
                    <input type="radio" name="nextInteractionType" value="In Person" checked disabled>
                    <span class="radio-content"><i class="fas fa-users"></i> In Person</span>
                  </label>
                  <label class="custom-radio">
                    <input type="radio" name="nextInteractionType" value="Phone Call" disabled>
                    <span class="radio-content"><i class="fas fa-phone-alt"></i> Phone Call</span>
                  </label>
                  <label class="custom-radio">
                    <input type="radio" name="nextInteractionType" value="Video Call" disabled>
                    <span class="radio-content"><i class="fas fa-video"></i> Video Call</span>
                  </label>
                  <label class="custom-radio">
                    <input type="radio" name="nextInteractionType" value="Slack/Teams" disabled>
                    <span class="radio-content"><i class="fas fa-comment-dots"></i> Slack/Teams</span>
                  </label>
                  <label class="custom-radio">
                    <input type="radio" name="nextInteractionType" value="Phone Text" disabled>
                    <span class="radio-content"><i class="fas fa-mobile-alt"></i> Phone Text</span>
                  </label>
                </div>
                <div class="date-field-inline">
                  <label>Next Interaction Estimated Date</label>
                  <div class="date-picker-wrapper">
                    <input type="text" id="nextInteractionEta" class="form-input-inline placeicon" placeholder="&#xf073; MM-DD-YY"
                      autocomplete="off" disabled>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      <div id="notesTabDiv">
        <!-- The dynamically inserted notes will appear here -->
      </div>
      `,
  },

  {
    name: "Audit Log",
    content: `
            <div class="audit-log">
  <ul id="audit-log-list" class="audit-list">
    <!-- List items will be dynamically added here -->
  </ul>
</div>

          `,
  },
  {
    name: "Resource Details",
    content: `
        <table class="table table-bordered border-primary" id="billing_exp_div">
          <thead>
            <tr id="resource-th">
              <th class='no-warp' style="width:10%">Expertise Persona <span class="warningMessage">*</span></th>
              <th style="display:none" style="width:30%">Skill</th>
              <th class='no-warp' style="width:8%">Start Date <span class="warningMessage">*</span></th>
              <th class='no-warp' style="width:8%">End Date <span class="warningMessage">*</span></th>
              <th style="width:4%">Days</th>
              <th class='no-warp' style="width:8%">Location <span class="warningMessage">*</span></th>
              <th class='no-warp' style="width:8%">Billing Status <span class="warningMessage">*</span></th>
              <th class='no-warp' style="width:8%">Billing Rate($)</th>
              <th class='no-warp' style="width:5%">Count <span class="warningMessage">*</span></th>
              
              <th class="cal_amt_val" style="width:10%">Amount</th>
              <th style="width: 1%">
                <button class="btn btn-info-add" id="addSkill" onclick="addSkill()">
                  <i class="fa fa-plus" aria-hidden="true"></i>
                </button>
              </th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `,
  },
  {
    name: "Monthly Breakup",
    content: `
      <div class="monthly-breakup-content">
        <div id="monthlyTableContainer"></div> <!-- Table container -->
      </div>`
  },
  {
    name: "Resource Allocation",
    content: `
      <div class="monthly-breakup-content">
        <div id="monthlyTableContainer"></div> <!-- Table container -->
      </div>`
  }
];

function createTabs() {
  const tabButtonsContainer = document.getElementById("tab-buttons");
  const tabContentContainer = document.getElementById("tab-content-container");

  if (!tabButtonsContainer || !tabContentContainer) {
    console.error("Tab containers not found!");
    return;
  }

  tabs.forEach((tab, index) => {
    const tabButton = document.createElement("button");
    tabButton.className = "tab-button";
    tabButton.textContent = tab.name;
    tabButton.onclick = () => switchTab(index);

    tabButtonsContainer.appendChild(tabButton);

    const tabContent = document.createElement("div");
    tabContent.className = "tab-content";
    tabContent.style.display = "none"; // Hide all content initially

    if (tab.name === "Audit") {
      // Placeholder content for Audit tab
      const auditLogList = document.createElement("ul");
      auditLogList.id = "audit-log-list";
      auditLogList.className = "audit-list";
      tabContent.appendChild(auditLogList);
    } else {
      tabContent.innerHTML = tab.content;
    }

    tabContentContainer.appendChild(tabContent);
  });

  // Make the first tab active by default
  tabButtonsContainer.children[0].classList.add("active");
  tabContentContainer.children[0].style.display = "block"; // Show the first tab content
}
// function updateAuditTab(auditMessages) {
//   // Get the target element where the messages will be displayed
//   const auditLogList = $('#audit-log-list');

//   // Clear any existing content
//   auditLogList.empty();

//   // Check if auditMessages is empty
//   if (!auditMessages || auditMessages.length === 0) {
//     // Display a message saying "No audit messages found"
//     auditLogList.html('<p style="text-align: center; font-weight: 500;color:#313265">No Audit Messages</p>');
//     return; // Exit the function as there are no messages to process
//   }

//   // List of message types to display
//   const messageFlagTypes = ['SOW_STATUS', 'PROBABILITY', 'BILLING_START_DATE', 'BILLING_END_DATE', 'SOW_AMOUNT'];

//   // If there are messages, process and append them
//   let listItem = '';

//   auditMessages.forEach((message) => {
//     // Only process messages with the specified TYPE_OF
//     if (messageFlagTypes.includes(message.TYPE_OF)) {
//       // Extract only the first sentence of the message
//       const onlyMessage = message.MESSAGE.split(".")[0] + ".";

//       // Build the list item
//       listItem += `
//         <i class="fa-solid fa-circle-dot"></i>
//         <span class="audit-item">
//           <strong>${onlyMessage}</strong>
//           <span class="audit-details">${message.EMPLOYEE_NAME}, ${convertStringToLocalTimeAndAgo(message.CREATED_DATE)}</span>
//         </span>
//         <br/>
//       `;
//     }
//   });
//   // Append the messages to the target element
//   auditLogList.append(listItem);
// }
function updateAuditTab(auditMessages) {
  const auditLogList = $('#audit-log-list');
  auditLogList.empty();

  if (!auditMessages || auditMessages.length === 0) {
    auditLogList.html('<p style="text-align: center; font-weight: 500;color:#313265">No Audit Messages</p>');
    return;
  }

  const messageFlagTypes = ['SOW_STATUS', 'PROBABILITY', 'BILLING_START_DATE', 'BILLING_END_DATE', 'SOW_AMOUNT'];

  // Append the checkbox control
  auditLogList.append(`
      <div class="showAllLogs">
          <div>
              <input type="checkbox" id="showAllLogs">
          </div>
          <div class="showAllLogsText"> Show Logs Of All The Events</div>
      </div>
  `);

  function renderLogs(showAll) {
    let listItem = '';

    auditMessages.forEach((message) => {
      // Show all messages if the checkbox is checked, otherwise filter by `messageFlagTypes`
      if (showAll || messageFlagTypes.includes(message.TYPE_OF)) {
        const onlyMessage = message.MESSAGE.split(".")[0] + ".";
        listItem += `<div class='audit-item-div'>
                    <i class="fa-solid fa-circle-dot"></i>
                    <span class="audit-item">
                        <strong>${onlyMessage}</strong>
                        <span class="audit-details">${message.EMPLOYEE_NAME}, ${convertStringToLocalTimeAndAgo(message.CREATED_DATE)}</span>
                    </span>
                </div>`;
      }
    });

    // Append messages to the list
    $('#audit-log-list').append(listItem);
  }

  // Initial render with filtered messages
  renderLogs(false);

  // Event listener for checkbox
  $('#showAllLogs').on('change', function () {
    auditLogList.find('.audit-item-div, i, .audit-item').remove(); // Clear existing logs
    renderLogs(this.checked); // Render logs based on checkbox state
  });
}

function switchTab(index) {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  const tabContentContainer = tabContents[index]; // Current tab content container


  // Activate the clicked tab and deactivate others
  // Activate the clicked tab and deactivate others
  tabButtons.forEach((button, i) => {
    button.classList.toggle("active", i === index); // Highlight the active tab
    tabContents[i].style.display = i === index ? "block" : "none"; // Show corresponding content

    // Add or remove custom class for the "Resource Details" tab
    if (tabs[i].name === "Resource Details") {
      tabContents[i].classList.toggle("resource-active", i === index); // Apply class if active
    }
  });

  if (tabs[index].name === "Resource Details") {
    // Ensure scrolling if content exceeds height
    // tabContentContainer.style.height = "35vh"; // Set fixed height
    tabContentContainer.style.overflowY = "auto"; // Enable scrolling
    // tabContentContainer.classList.add("resource-scroll"); // Add custom class for styling if needed
  } else {
    // tabContentContainer.style.height = "35vh"; // Default height for other tabs
    tabContentContainer.style.overflowY = "auto"; // Default overflow for other tabs
  }
  // Ensure scroll for overflowing content in the active tab
  tabContents[index].style.overflowY = "auto";
}



// function initializeQuill(comments_notes) {
//   // Initialize Quill editor
//   quill = new Quill("#editor", {
//     modules: {
//       toolbar: [
//         ["bold", "italic", "underline"],
//         [{ list: "ordered" }, { list: "bullet" }],
//       ],
//     },
//     placeholder: "Add Note Here...",
//     theme: "snow",
//   });

//   console.log("Inside initializeQuill, comments_notes:", comments_notes);

//   const notesDiv = document.querySelector("#notesTabDiv"); // Target the div inside the Notes tab
//   if (notesDiv) {
//     // Clear existing content
//     notesDiv.innerHTML = "";

//     function isNoteValid(note) {
//       if (!note || note.trim() === "") return false; // Skip empty or whitespace-only notes

//       // Remove HTML tags to check for meaningful text
//       const textOnly = note.replace(/<\/?[^>]+(>|$)/g, "").trim();
//       if (textOnly === "") return false;

//       // Regex to match a date-time pattern like "16/12/24, 04:55 PM"
//       const dateTimeRegex = /\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} (AM|PM)/;
//       return dateTimeRegex.test(note); // Return true if date-time is present
//   }

//   let isValid = comments_notes.some(noteObj => {
//     const isValidNote = isNoteValid(noteObj.NOTES);
//     console.log("Checking note:", noteObj.NOTES, "-> Valid:", isValidNote); // Debug log
//     return isValidNote;
//   });

//   // Determine the placeholder text based on validity
//   const placeholderText = isValid
//     ? "Add Note Here..."
//     : "Add your first Note...";

//   // Dynamically update the Quill editor placeholder
//   quill.root.dataset.placeholder = placeholderText;
//   quill.root.setAttribute("data-placeholder", placeholderText); // Ensure attribute is updated for Quill

//     // If comments_notes is an array, iterate over each note
//     if (Array.isArray(comments_notes)) {
//       // Loop through the array in reverse order
//       for (let i = comments_notes.length - 1; i >= 0; i--) {
//         const noteObj = comments_notes[i];
//         const { NOTES, COMMENTED_BY, COMMENTED_ON } = noteObj;

//         // Skip notes with empty or meaningless content
//         if (!isNoteValid(NOTES)) continue;

//         // Create a wrapper for each note
//         const noteWrapper = document.createElement("div");
//         noteWrapper.style.marginBottom = "16px"; // Add spacing between notes

//         const dateTimeRegex = /(\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} (AM|PM))/;

//         // Extract the date and time
//         const match = NOTES.match(dateTimeRegex);
//         let notesDate = "";
//         if (match) {
//           const extractedDateTime = match[1]; // Get the matched part
//           console.log("Extracted Date and Time:", extractedDateTime);

//           // Parse and convert to desired Date format
//           const [datePart, timePart] = extractedDateTime.split(", ");
//           const [day, month, year] = datePart.split("/");
//           notesDate = new Date(`${20 + year}-${month}-${day} ${timePart}`);
//           console.log("Formatted Date:", notesDate);
//         } else {
//           console.log("No date and time found in the Notes variable.");
//         }

//         const monthsAgo = getMonthsAgo(notesDate, new Date());

//         // Construct the note's HTML with the icon, note content, and months ago text
//               // Construct the note content with lists rendered as HTML
//               noteWrapper.innerHTML = `
//               <div style="display: flex; align-items: flex-start;margin-top:40px">
//                   <i class="fa-solid fa-circle-dot" style="margin-right: 8px; margin-top:30px;"></i>
//                   <div class="new_note">
//                       ${NOTES}
//                       <span style="font-size: 11px; color: #818188; margin-left: 0px;">(${monthsAgo})</span>
//                   </div>
//               </div>`;

//               // Process lists inside NOTES
//               const noteContent = noteWrapper.querySelector(".new_note");

//               if (noteContent) {
//                 // Style ordered and unordered lists (only adjust margin and padding if needed)
//                 noteContent.querySelectorAll("ol").forEach(ol => {
//                     ol.style.marginLeft = "-26px";  // Adjust as needed for spacing
//                     ol.style.marginTop="30px";

//                 });
//                 noteContent.querySelectorAll("ul").forEach(ul => {
//                     ul.style.marginLeft = "-26px";  // Adjust as needed for spacing
//                     ul.style.marginTop="30px";

//                 });

//                 // Style list items
//                 noteContent.querySelectorAll("li").forEach(li => {
//                     li.style.marginBottom = "4px";  // Optional for spacing between list items
//                 });
//             }


//               // Append the processed note to notesDiv
//               notesDiv.style.display = "block"; // Ensure visibility
//               notesDiv.appendChild(noteWrapper);
//       }
//     }

//     // If comments_notes is a single object, treat it as one note
//     else if (comments_notes.NOTES) {
//       const { NOTES, COMMENTED_BY, COMMENTED_ON } = comments_notes;

//       // Skip notes with empty or meaningless content
//       if (!isNoteValid(NOTES)) return;

//       // Create a wrapper for the single note
//       const noteWrapper = document.createElement("div");
//       noteWrapper.style.marginBottom = "16px"; // Add spacing between notes

//       // Extract date from NOTES (assuming COMMENTED_ON is the date you want)
//       const dateStr = COMMENTED_ON; // Using COMMENTED_ON as the date string
//       const noteDate = new Date(dateStr);
//       const monthsAgo = getMonthsAgo(noteDate, new Date());

//       // Construct the note's HTML with the icon, note content, and months ago text
//       noteWrapper.innerHTML = `
//           <div style="display: flex; align-items: flex-start;">
//             <i class="fa-solid fa-circle-dot"></i>
//             <div>
//               ${NOTES}
//               <span style="font-size: 11px; color: #8181881; margin-left: 0px;">(${monthsAgo})</span>
//             </div>
//           </div>
//         `;

//       // Append the note to the #notesTabDiv
//       notesDiv.appendChild(noteWrapper);
//     }
//   }

//   // Character limit warning functionality for Quill editor
//   const maxChars = 150;
//   const charLimitWarning = document.getElementById("charLimitWarning");

//   quill.on("text-change", function() {
//     const text = quill.getText().trim();
//     if (text.length > maxChars) {
//       quill.deleteText(maxChars, text.length);
//       charLimitWarning.style.display = "inline";
//     } else {
//       charLimitWarning.style.display = "none";
//     }
//   });
// }

// // Call initializeQuill with `comments_notes` data
// document.addEventListener('DOMContentLoaded', function() {

//   initializeQuill(comments_notes); // Initialize with the available comments_notes data
// });

// function initializeQuill(comments_notes){
//   console.log('comments_notes - ',comments_notes)
//     // Initialize Quill editor
//   quill = new Quill("#editor", {
//     modules: {
//       toolbar: [
//         ["bold", "italic", "underline"],
//         [{ list: "ordered" }, { list: "bullet" }],
//       ],
//     },
//     placeholder: "Add Note Here...",
//     theme: "snow",
//   });
//   // id : notesTabDiv
//   let comments_data_html  = '';
//   comments_data_html = `<div class='notes_div'>
//     <div>
//       <div class='notes_icon_text'>S</div>
//     </div>
//     <div>
//       <div class='notes_name_div'>
//         <div class='notes_name'>Sravan Kum...</div>
//         <div>30/12/24, 05:19 PM (7 day(s) ago)</div>
//       </div>
//       <div>Test Notes added</div>
//     </div>
//   </div>`

//   $('#notesTabDiv').append(comments_data_html);
// }
function initializeQuill(comments_notes) {
  console.log("comments_notes - ", comments_notes);
  $("#notesTabDiv").empty(); // Clear existing notes

  // Initialize Quill editor
  quill = new Quill("#editor", {
    modules: {
      toolbar: [
        ["bold", "italic", "underline", "link"],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
    },
    placeholder: "Add Note Here...",
    theme: "snow",
  });

  nextStepsQuill = new Quill("#nextStepsText", {
    modules: {
      toolbar: [
        ["bold", "italic", "underline", "link"],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
    },
    placeholder: "What are the next action items?",
    theme: "snow",
  });

  // --- Start Engagement Notes Initialization ---
  // Initialize date pickers (Gijgo)
  $('#meetingDate, #nextStepsEta, #nextInteractionEta').each(function () {
    if (!$(this).data('datepicker')) {
      $(this).datepicker({
        format: 'mm-dd-yy',
        uiLibrary: 'bootstrap'
      });
    }
  });

  // Handle Meeting Date changes to update minDate of ETAs
  $('#meetingDate').on('change', function () {
    const meetingDateVal = $(this).val();
    const $nextStepsEta = $('#nextStepsEta');
    const $nextInteractionEta = $('#nextInteractionEta');

    if (meetingDateVal) {
      const parts = meetingDateVal.split('-');
      if (parts.length === 3) {
        const month = parseInt(parts[0], 10) - 1;
        const day = parseInt(parts[1], 10);
        const year = 2000 + parseInt(parts[2], 10);
        const meetingDate = new Date(year, month, day);

        if ($nextStepsEta.data('datepicker')) {
          $nextStepsEta.datepicker('destroy');
        }
        $nextStepsEta.datepicker({
          format: 'mm-dd-yy',
          uiLibrary: 'bootstrap',
          minDate: meetingDate
        }).addClass("form-input-inline placeicon");

        if ($nextInteractionEta.data('datepicker')) {
          $nextInteractionEta.datepicker('destroy');
        }
        $nextInteractionEta.datepicker({
          format: 'mm-dd-yy',
          uiLibrary: 'bootstrap',
          minDate: meetingDate
        }).addClass("form-input-inline placeicon");
      }
    }
  });

  // Next Steps Toggles
  $('#nextStepsBtn, #noNextStepsBtn').on('click', function () {
    const isNextSteps = $(this).attr('id') === 'nextStepsBtn';
    $('#nextStepsBtn, #noNextStepsBtn').removeClass('active');
    $(this).addClass('active');

    if (isNextSteps) {
      $('#nextStepsContent').show();
      $('#nextStepsEtaWrapper').show();
      $('#nextStepsEta').prop('disabled', false);
      if (nextStepsQuill) nextStepsQuill.enable(true);
    } else {
      // Keep it visible but disabled as per "show by default"
      $('#nextStepsEta').prop('disabled', true);
      if (nextStepsQuill) {
        nextStepsQuill.setText('');
        nextStepsQuill.enable(false);
      }
    }
  });

  // Interaction Type Toggle Logic
  $('input[name="interactionType"]').on('change', function () {
    const isNA = $(this).val() === 'N/A';
    if (isNA) {
      $('#meetingDate, #nextStepsBtn, #noNextStepsBtn, #nextStepsEta, #nextInteractionEta, input[name="nextInteractionType"]').prop('disabled', true);
      if (nextStepsQuill) {
        nextStepsQuill.setText('');
        nextStepsQuill.enable(false);
      }
      $('#meetingDate').closest('.date-field-inline').hide();
      $('.next-steps-header-row, .next-steps-content, .next-interaction-section, #nextInteractionContent').hide();
    } else {
      $('#meetingDate, #nextStepsBtn, #noNextStepsBtn, #nextStepsEta, #nextInteractionEta, input[name="nextInteractionType"]').prop('disabled', false);
      $('#meetingDate').closest('.date-field-inline').show();
      $('.next-steps-header-row, .next-steps-content, .next-interaction-section, #nextInteractionContent').show();
      // Ensure Next Steps internal visibility follows the active button
      if ($('#noNextStepsBtn').hasClass('active')) {
        $('#nextStepsContent, #nextStepsEtaWrapper').hide();
        $('#nextStepsEta').prop('disabled', true);
        if (nextStepsQuill) nextStepsQuill.enable(false);
      } else {
        $('#nextStepsContent, #nextStepsEtaWrapper').show();
        $('#nextStepsEta').prop('disabled', false);
        if (nextStepsQuill) nextStepsQuill.enable(true);
      }
    }
  });

  // Initial Visibility & Enablement: Ensure everything matches the default state
  const initialType = $('input[name="interactionType"]:checked').val();
  if (initialType === 'N/A' || !initialType) {
    $('#meetingDate, #nextStepsBtn, #noNextStepsBtn, #nextStepsEta, #nextInteractionEta, input[name="nextInteractionType"]').prop('disabled', true);
    if (nextStepsQuill) nextStepsQuill.enable(false);
    $('#meetingDate').closest('.date-field-inline').hide();
    $('.next-steps-header-row, .next-steps-content, .next-interaction-section, #nextInteractionContent').hide();
  } else {
    $('#meetingDate, #nextStepsBtn, #noNextStepsBtn, #nextStepsEta, #nextInteractionEta, input[name="nextInteractionType"]').prop('disabled', false);
    $('#meetingDate').closest('.date-field-inline').show();
    $('.next-steps-header-row, .next-steps-content, .next-interaction-section, #nextInteractionContent').show();

    if ($('#noNextStepsBtn').hasClass('active')) {
      $('#nextStepsContent, #nextStepsEtaWrapper').hide();
      $('#nextStepsEta').prop('disabled', true);
      if (nextStepsQuill) nextStepsQuill.enable(false);
    } else {
      if (nextStepsQuill) nextStepsQuill.enable(true);
    }
  }
  // --- End Engagement Notes Initialization ---




  // Handle empty or undefined comments_notes
  if (!comments_notes || comments_notes.length === 0) {
    $("#text-div").text("Add your first note");
    return; // Exit function
  }

  // Check for single comment with empty NOTES
  if (
    comments_notes.length === 1 &&
    (!comments_notes[0].NOTES || !comments_notes[0].NOTES.trim())
  ) {
    $("#text-div").text("Add your first note");
    return; // Exit function as there's nothing to render
  }

  // Initialize HTML for comments
  let comments_data_html = "";

  // Loop through each comment
  comments_notes.forEach((note) => {
    // Skip empty NOTES for multiple comments
    if ((!note.NOTES || !note.NOTES.trim()) && comments_notes.length > 1) {
      return;
    }

    // Extract the first character of COMMENTED_BY
    // const notes_icon_text = note.COMMENTED_BY.charAt(0);
    const words = note.COMMENTED_BY.split(" ");
    const notes_icon_text = words
      .slice(0, 3) // Limit to the first three words
      .map(word => word.substring(0, 1)) // Extract the first two characters of each word
      .join(""); // Combine the characters with spaces


    // Format COMMENTED_BY to show the full first name and three characters of the last name
    const nameParts = note.COMMENTED_BY.split(" ");
    const notes_name =
      nameParts[0] +
      " " +
      (nameParts[1] ? nameParts[1].substring(0, 3) + "..." : "");

    // Format the COMMENTED_ON field
    const commentedOn = convertStringToLocalTimeAndAgo(note.COMMENTED_ON);

    // Use NOTES if available, otherwise a placeholder
    const notes_content = note.NOTES && note.NOTES.trim() ? note.NOTES : "No notes available";

    let note_body_html = "";
    if (note.IS_ENGAGEMENT && note.INTERACTION_TYPE && note.INTERACTION_TYPE !== 'N/A') {
      // Helper to format dates to MM-DD-YY
      const formatToMMDDYY = (dateStr) => {
        if (!dateStr || dateStr === "N/A") return "N/A";
        // Convert YYYY-MM-DD to MM-DD-YY
        const dateParts = dateStr.includes(' ') ? dateStr.split(' ')[0].split('-') : dateStr.split('-');
        if (dateParts.length === 3) {
          if (dateParts[0].length === 4) { // YYYY-MM-DD
            return `${dateParts[1]}-${dateParts[2]}-${dateParts[0].substring(2)}`;
          } else if (dateParts[2].length === 4) { // DD-MM-YYYY
            return `${dateParts[1]}-${dateParts[0]}-${dateParts[2].substring(2)}`;
          }
        }
        return dateStr;
      };

      const meetingDate = formatToMMDDYY(note.MEETING_DATE);
      const nextSteps = note.NEXT_STEPS ? note.NEXT_STEPS.split('\n').map(step => `&bull; ${step}`).join('<br/>') : "&bull; N/A";
      const nextStepsDate = formatToMMDDYY(note.NEXT_STEPS_DATE);
      const nextInteractionType = note.NEXT_INTERACTION_TYPE || "N/A";
      const nextInteractionDate = formatToMMDDYY(note.NEXT_INTERACTION_DATE);

      note_body_html = `
            <div class="engagement-detailed-note">
                <div style="margin-bottom: 8px;">
                    <strong>Detailed Notes:</strong><br/>
                    ${notes_content}
                </div>
                <div style="margin-bottom: 8px;">
                    | <strong>Meeting Type:</strong> ${note.INTERACTION_TYPE} | <strong>Meeting Date:</strong> ${meetingDate}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Next Step:</strong><br/>
                    ${nextSteps} | <strong>Next Step Estimated Date:</strong> ${nextStepsDate}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Next Interaction: Meeting Type:</strong> ${nextInteractionType} | <strong>Next Interaction Estimated Date:</strong> ${nextInteractionDate}
                </div>
                <div class='notes_comments_div'>
                    ${commentedOn}
                </div>
            </div>`;
    } else {
      // Simple rendering for legacy notes or N/A engagement
      note_body_html = `
            <div>${notes_content}</div>
            <div class='notes_comments_div'>${commentedOn}</div>`;
    }

    comments_data_html += `
        <div class='notes_div' style="padding: 15px; border-bottom: 1px solid #eee; display: flex; gap: 15px;">
          <div class='notes_icon_div' style="flex-shrink: 0;">
            <div class='notes_icon_text' data-fullname='${note.COMMENTED_BY}'>${notes_icon_text}</div>
          </div>
          <div class='notes_body_div' style="flex-grow: 1;">
            ${note_body_html}
          </div>
        </div>`;
  });

  // Append the generated HTML to the #notesTabDiv element
  console.log('comments_data_html - ', comments_data_html)
  $("#notesTabDiv").append(comments_data_html);
  if (comments_data_html.trim() == '') {
    $("#text-div").text("Add your first note");
  }
}


document.addEventListener("DOMContentLoaded", function () {
  // checkEditAccess(); // Call the function on initial load

  createTabs(); // Initialize tabs
  const stored_url_data = localStorage.getItem("urlStoredSOWUrldata");
});

function addSkillsData() {
  switchTab(2);
  let accountName = $("#account_options option:selected").val();
  let totalTeamSize = parseInt($("#new_team").val(), 10) || 0;
  let actualStartDate = $("#actual_start_date").val();
  let actualEndDate = $("#actual_end_date").val();

  if (accountName === "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select Account name");
    $("#billing_exp_div tbody").empty();
    return false;
  }

  console.log("totalTeamSize", totalTeamSize);

  $(document).ready(function () {
    if (totalTeamSize === 0) {
      $("#billing_exp_div tbody").empty();
      $("#sow_amount").val("0");
      $("#proj_amount").val("0");
    }
  });

  let totalBillInd = 0;
  let zeroBillIndRow = null;

  // Calculate total team size and find a row where bill_ind is 0
  $("#billing_exp_div tbody tr").each(function () {
    let billIndValue = parseInt($(this).find("input[id^='bill_ind_input_']").val(), 10) || 0;
    totalBillInd += billIndValue;

    if (billIndValue === 0 && !zeroBillIndRow) {
      zeroBillIndRow = $(this); // Store the first row with bill_ind 0
    }
  });

  console.log("totalBillInd", totalBillInd);

  if (totalBillInd < totalTeamSize) {
    if (zeroBillIndRow) {
      // If a row with bill_ind = 0 exists, increase its count instead of adding a new row
      let currentValue = parseInt(zeroBillIndRow.find("input[id^='bill_ind_input_']").val(), 10) || 0;
      zeroBillIndRow.find("input[id^='bill_ind_input_']").val(currentValue + 1);
    } else {
      // No row with bill_ind = 0, so add a new row
      addRow(totalBillInd + 1, actualStartDate, actualEndDate);
    }
  } else if (totalBillInd > totalTeamSize) {
    let lastRow = $("#billing_exp_div tbody tr:last");
    let lastRowBillIndValue = parseInt(lastRow.find("input[id^='bill_ind_input_']").val(), 10) || 0;

    if (lastRowBillIndValue > 1) {
      lastRow.find("input[id^='bill_ind_input_']").val(lastRowBillIndValue - 1);
    } else {
      lastRow.remove();
    }
  }

  calculateSowAmount(); // Recalculate the amount after updating rows
}


function addRow(index, actualStartDate, actualEndDate) {
  let persona_class = "persona_button";
  let locat_class = "loc_bill_table";
  let bill_status_class = "billed_sow_table";

  let addSkillHtml = `<tr class="resource_row_${index}">
                            <td style="display:none" id="res_number_${index}">Resource ${index}</td>
                            <!-- Persona Column -->
                            <td class="persona_skills_td" id="persona_details_${index}">
                              <div class="${persona_class}" id="persona_text_${index}" style="display:none">
                                ${createDiv("-", "")}
                              </div>
                              <div class="custom-tooltip-wrapper">
                                <select id="persona_select_${index}" class="form-control select_persona">
                                  ${personaOpt}
                                </select>
                                <div id="tooltip_${index}" class="custom-tooltip" style="display:none; position:absolute;"></div>
                              </div>
                                  <div id="others_input_${index}" style="display: none; margin-top: 10px; width: 100%; position: relative;">
                                <input
                                  type="text"
                                  class="form-control"
                                  id="other_text_${index}"
                                  placeholder="Specify here"
                                  style="width: 100%; padding-right: 30px; height: 30px; font-size: 12px;border: 1px solid #D9D9D9;"
                                >
                                <button
                                  type="button"
                                  id="submit_other_${index}"
                                  class="btn"
                                  style="
                                    position: absolute;
                                    top: 50%;
                                    right: 5px;
                                    transform: translateY(-50%);
                                    padding: 0 6px;
                                    height: 22px;
                                    font-size: 12px;
                                    line-height: 1;
                                    background: none;
                                    border: none;
                                    color: #007bff;
                                  "
                                >➤</button>
                              </div>
                            </td>
                            <!-- Skills Column -->
                            <td style="display:none" class="skills_td_new" id="skills_details_${index}">
                              <select name="personaSkills[]" id="persona_skill_${index}" class="skillDataOpt" multiple="multiple"></select>
                            </td>
                            
                            <td>
                              <span id="start_date_${index}" style="display:none"></span>
                              <input type="text" 
                                class="form-control placeicon dateData resourceDate autoStartUpdateDate datepicker-fields" 
                                id="start_date_input_${index}" 
                                placeholder="&#xf073; mm-dd-yy" 
                                name="resource_start_date" 
                                autocomplete="off" 
                                style="z-index: 1;" 
                               onchange="checkEndDate('start_date_input_${index}', 'end_date_input_${index}', 'Resource End Date should be greater than Resource Start Date'),calculateSowAmount(this)"
                                value="${actualStartDate}" />
                            </td>
                            <td>
                              <span id="end_date_${index}" style="display:none"></span>
                              <input type="text" 
                                class="form-control placeicon dateData resourceDate autoEndUpdateDate datepicker-fields" 
                                id="end_date_input_${index}" 
                                placeholder="&#xf073; mm-dd-yy" 
                                name="resource_end_date" 
                                autocomplete="off" 
                                style="z-index: 1;" 
                               onchange="checkEndDate('start_date_input_${index}', 'end_date_input_${index}', 'Resource End Date should be greater than Resource Start Date'),calculateSowAmount(this)"
                                value="${actualEndDate}" />
                            </td>
                            <td>
                              <span id="bill_days_${index}" class="days_amount"></span>
                            </td>
                            <td>
                              <span class="${locat_class}" id="loc_text_${index}" style="display:none"></span>
                              <select class="form-control" id="loc_select_${index}" onchange="locSowAmount(this)">
                                ${locationOpt}
                              </select>
                            </td>
                            <td>
                              <span class="${bill_status_class}" id="bill_status_${index}" style="display:none"></span>
                              <select class="form-control" id="bill_select_${index}" onchange="calculateSowAmount(this)">
                                ${billingOpt}   
                              </select>
                            </td>
                            <td>
                              <input type="number" 
                                class="form-control" 
                                id="bill_us_rate_${index}" 
                                placeholder="Bill" 
                                oninput="handleIntegerOnly(this)"
                                min="0" 
                                value="0"/>
                            </td>
                            <td>
                              <span id="bill_ind_${index}" style="display:none"></span>
                              <input type="number" 
                                class="form-control" 
                                id="bill_ind_input_${index}" 
                                placeholder="Bill" 
                                oninput="handleIntegerValuesOnly(this)"
                                min="1" 
                                value="1"
                                step="1" />
                            </td>
                            <td class="cal_amt_val">
                              <span id="bill_amount_${index}" class="days_amount">$0</span>
                            </td>
                            <td>
                              <button class="btn btn-info delete_button" onclick="deleteSkill(this)">
                                <i class="fa fa-trash" aria-hidden="true"></i>
                              </button>
                            </td>
                            <td style="display: none" id="res_grp_number_${index}"></td>
                          </tr>`;

  $("#billing_exp_div tbody").append(addSkillHtml);
  var billingDropdown = document.getElementById("billing_options");
  var billingType = billingDropdown.value.trim(); // Get and trim the value
  console.log(billingType); // Log the value to check
  // If the billing option is "Fixed Price", hide the Billing Rate and Amount columns
  if (billingType === "Fixed Price") {
    hideBillingRateAmountColumns(sow_acc_data); // This will hide the columns in header and body
  }

  // Initialize date pickers
  $(`#start_date_input_${index}`).datepicker({
    format: "mm-dd-yy",
    uiLibrary: "bootstrap",
  });
  $(`#end_date_input_${index}`).datepicker({
    format: "mm-dd-yy",
    uiLibrary: "bootstrap",
  });
  $(".input-group-addon").hide();

  // Populate and initialize multiselect
  let skillOptionsHtml = "";
  $.each(sowDropDownJson.SKILL_LEVEL, function (i, skillOpt) {
    skillOptionsHtml += `<option value="${skillOpt.trim()}">${skillOpt.trim()}</option>`;
  });
  $(`#persona_skill_${index}`).html(skillOptionsHtml);
  $(`#persona_skill_${index}`).multiselect({
    columns: 1,
    placeholder: "Select Skills",
    search: true,
    buttonText: function (options, select) {
      let selectedCount = options.length;
      if (selectedCount === 0) {
        return "Select Skills";
      } else if (selectedCount <= 2) {
        return options.map((option) => $(option).text()).join(", ");
      } else {
        return `${selectedCount} Selected`;
      }
    },
  });

  // Adjust dropdown position dynamically
  $(`#persona_skill_${index}`).on('click', function () {
    const dropdown = $(this).siblings('.ms-options');
    const offset = $(this).offset();
    const dropdownHeight = dropdown.outerHeight();
    const viewportHeight = $(window).height();

    // Calculate available space below the select element
    const spaceBelow = viewportHeight - offset.top - $(this).outerHeight();

    if (spaceBelow < dropdownHeight) {
      // Not enough space below, place above
      dropdown.css({
        top: offset.top - dropdownHeight + 'px',
        left: offset.left + 'px',
      });
    } else {
      // Place below
      dropdown.css({
        top: offset.top + $(this).outerHeight() + 'px',
        left: offset.left + 'px',
      });
    }

    dropdown.css('visibility', 'visible'); // Ensure visibility
  });

  $(`#persona_select_${index}`).on("change", function () {
    const selectedVal = $(this).val();
    if (selectedVal === "Others") {
      $(`#others_input_${index}`).slideDown();
    } else {
      $(`#others_input_${index}`).slideUp();
      $(this).removeAttr("title");
      $(`#tooltip_${index}`).removeClass("show").text("");
    }
  });

  // Handle repeated clicks when "Others" is already selected
  $(`#persona_select_${index}`).on("click", function () {
    const selectedVal = $(this).val();
    if (selectedVal === "Others") {
      $(`#others_input_${index}`).slideDown();
    }
  });

  $(`#persona_select_${index}`).on("mouseenter", function () {
    $(this).removeAttr("title"); // Remove browser tooltip
    const selectedVal = $(this).val();
    const tooltip = $(`#tooltip_${index}`);
    if (selectedVal === "Others") {
      const customVal = $(`#other_text_${index}`).val();
      if (customVal) {
        tooltip.text(customVal).addClass("show");
      } else {
        tooltip.removeClass("show").text("");
      }
    } else {
      tooltip.removeClass("show").text("");
    }
  });

  $(`#persona_select_${index}`).on("mouseleave", function () {
    $(`#tooltip_${index}`).removeClass("show");
  });

  function submitCustomPersona() {
    const customPersona = $(`#other_text_${index}`).val().trim();

    if (customPersona) {
      const $select = $(`#persona_select_${index}`);
      const $tooltip = $(`#tooltip_${index}`);

      $tooltip.text(customPersona);
      $select.val("Others");

      let customOption = $select.find("option[value='custom']");
      if (customOption.length !== 0) {
        customOption.text(customPersona);
        customOption.prop("selected", true);
      }

      $(`#others_input_${index}`).slideUp();
      toastr.success(`Please click on update to save the persona - ${customPersona}`);
    } else {
      toastr.error("Please enter a custom persona before submitting");
    }
  }

  $(`#submit_other_${index}`).on("click", submitCustomPersona);

  $(`#other_text_${index}`).on("keypress", function (e) {
    if (e.which === 13) {
      e.preventDefault();
      submitCustomPersona();
    }
  });
}

function handleIntegerOnly(input) {
  const value = input.value;

  // Allow empty input, a single digit, or numbers with one dot
  if (/^\d*\.?\d*$/.test(value)) {
    // valid number-in-progress like "", "9", "9.", "9.8", "0.5"
    // call your dependent functions
    calculateSowAmount();
    updateTeamSize();
  } else {
    // remove invalid characters (e.g. letters, multiple dots)
    input.value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  }
}

function handleIntegerValuesOnly(input) {
  // Keep only digits (0–9)
  input.value = input.value.replace(/[^0-9]/g, '');
  calculateSowAmount();
  updateTeamSize();
}

function sow_edit_cancel() {
  setTimeout(function () {
    window.location.href = `sow.html?${paramsArray[0]}&${paramsArray[1]}`;
  }, 1000);
}
function updateTeamSize() {
  let total = 0;

  // Loop through each row in the table
  $("table")
    .find("tr")
    .each(function (i) {
      // Find the 9th column (index 9)
      let $tds = $(this).find("td");
      let value = parseFloat(
        $tds
          .eq(9)
          .find("input")
          .val()
      );

      // Add to the total if it's a valid number
      if (!isNaN(value)) {
        total += value;
      }
    });

  // Use the total as needed
  console.log("Total:", total);
  // Example: Update a span or div with the total value
  $("#new_team").val(total);
}
function restrictSpecialCharactersByIdQuill(inputId, spcl) {
  console.log("spcl - " + spcl);
  let disallowedChars;
  let errorMessage;

  if (spcl !== undefined) {
    // If spcl is defined, allow only numbers
    disallowedChars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+`-=[]{}|;:".<>?/\\'; // All non-numeric characters
    errorMessage = "Only numeric values are allowed."; // Tooltip message
  } else {
    // Default disallowed characters
    disallowedChars = "~@#$%^<>|{}[]";
    errorMessage = "Special characters are not allowed."; // Tooltip message
  }

  // Determine if the target is a Quill editor or a standard input field
  const inputElement = document.getElementById(inputId);

  if (!inputElement) {
    console.error(`No element found with ID: ${inputId}`);
    return;
  }

  // Check if it's Quill or standard input
  if (inputElement.classList.contains("ql-editor")) {
    const quillInstance = Quill.find(inputElement); // Find the associated Quill instance
    if (!quillInstance) {
      console.error("No Quill instance found for the provided ID");
      return;
    }

    quillInstance.on("text-change", function () {
      const currentText = quillInstance.getText().trim();

      // Remove disallowed characters
      const filteredText = Array.from(currentText)
        .filter((char) => !disallowedChars.includes(char))
        .join("");

      if (currentText !== filteredText) {
        // Update Quill editor content
        const range = quillInstance.getSelection();
        quillInstance.deleteText(0, currentText.length);
        quillInstance.clipboard.dangerouslyPasteHTML(0, filteredText);

        // Restore cursor position
        if (range) {
          quillInstance.setSelection(range.index, range.length);
        }

        // Show tooltip
        showTooltip(inputElement, errorMessage);
      }
    });
  } else {
    // Standard input handling as before
    inputElement.addEventListener("keydown", (event) => {
      const key = event.key;

      if (disallowedChars.includes(key)) {
        event.preventDefault(); // Prevent the disallowed character from being entered
        showTooltip(inputElement, errorMessage); // Show tooltip
      }
    });

    inputElement.addEventListener("input", () => {
      const currentValue = inputElement.value;

      const filteredValue = Array.from(currentValue)
        .filter((char) => !disallowedChars.includes(char))
        .join("");

      if (currentValue !== filteredValue) {
        inputElement.value = filteredValue;
        showTooltip(inputElement, errorMessage);
      }
    });
  }

  function showTooltip(inputElement, message) {
    let tooltip = inputElement.parentNode.querySelector(".tooltip-message");
    console.log("tooltip - ", tooltip);

    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "tooltip-message";
      tooltip.style.position = "absolute";
      tooltip.style.backgroundColor = "#f8d7da";
      tooltip.style.color = "#721c24";
      tooltip.style.padding = "5px 10px";
      tooltip.style.border = "1px solid #f5c6cb";
      tooltip.style.borderRadius = "4px";
      tooltip.style.boxShadow = "0 1px 1px rgba(0, 0, 0, 0.2)";
      tooltip.style.fontSize = "0.9rem";
      tooltip.style.whiteSpace = "nowrap";
      tooltip.style.zIndex = "1000";

      const rect = inputElement.getBoundingClientRect();
      tooltip.style.left = `${rect.left + window.scrollX}px`;
      tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;

      document.body.appendChild(tooltip);
    }

    tooltip.textContent = message;

    setTimeout(() => {
      if (tooltip) {
        tooltip.remove();
      }
    }, 2000);
  }
}
function getMonthsAgo(noteDate, currentDate) {
  // Calculate the difference in months
  let monthsAgo =
    currentDate.getMonth() -
    noteDate.getMonth() +
    12 * (currentDate.getFullYear() - noteDate.getFullYear());

  // Handle the case when the current date's day is before the note date's day in the current month
  if (currentDate.getDate() < noteDate.getDate()) {
    monthsAgo--;
  }

  // If the difference is less than a month, calculate the difference in days or hours
  if (monthsAgo === 0) {
    const diffTime = currentDate - noteDate; // Difference in milliseconds
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Difference in days

    // If it's less than a day, calculate the difference in hours
    if (diffDays < 1) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60)); // Difference in hours
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60)); // Difference in minutes
        return diffMinutes < 1 ? "Just Now" : `${diffMinutes} minute(s) ago`;
      }
      return `${diffHours} hour(s) ago`;
    }

    // Return the difference in days if it's less than a month
    return `${diffDays} day(s) ago`;
  }

  // Only return the difference in months if it's 1 month or more
  if (monthsAgo === 1) {
    return "1 month ago";
  }
  return `${monthsAgo} months ago`;
}
function convertDateFormat(dateStr) {
  // Split the input date string (DD/MM/YY)
  const dateParts = dateStr.split("/");

  // Convert the year to four digits (assuming 2000s for 2-digit years)
  let year = dateParts[2];
  if (year.length === 2) {
    year = "20" + year; // Convert 2-digit year to 4-digit (e.g., 24 -> 2024)
  }

  // Create a new Date object using the parts (note: month is 0-based in JavaScript)
  const formattedDate = new Date(`${year}-${dateParts[1]}-${dateParts[0]}`);

  // Format the date as YYYY-MM-DD
  const fullYear = formattedDate.getFullYear();
  const month = String(formattedDate.getMonth() + 1).padStart(2, "0"); // Add leading zero if needed
  const day = String(formattedDate.getDate()).padStart(2, "0"); // Add leading zero if needed

  return `${fullYear}-${month}-${day}`;
}
function saveBuyingNPS(buyingCenterNPS, newNPSStakeholder, buyingNPSList) {
  console.log("buyingNPSList", buyingNPSList);
  let empId = localStorage.getItem('EmpUserID');
  let empName = localStorage.getItem('EmpUserName');
  let emp_email = localStorage.getItem('email');

  let accessDetails =
    '{ "EMAIL_ID":"' +
    emp_email +
    '", "USERNAME":"' +
    empName +
    '", "USER_ID":"' +
    empId +
    '}';

  console.log("accessDetails", accessDetails);

  // Transform the buying center data to include comprehensive fields
  let transformedStakeholderDetails = buyingNPSList.map(function (item) {
    // Find the corresponding buying center data from buyingCenterNps
    let accountData = buyingCenterNps.find(account => account.ACCOUNT_ID === item.ACCOUNT_ID);
    let buyingCenterDetails = null;

    if (accountData && accountData.DETAILS) {
      buyingCenterDetails = accountData.DETAILS.find(detail => detail.BUYING_CENTRE === item.BUYING_CENTRE);
    }

    let sbName = "";
    let sbDesg = "";
    if (buyingCenterDetails) {
      if (Array.isArray(buyingCenterDetails.SUPERBOSSES) && buyingCenterDetails.SUPERBOSSES.length > 0) {
        sbName = buyingCenterDetails.SUPERBOSSES[0].SUPERBOSS || "";
        sbDesg = buyingCenterDetails.SUPERBOSSES[0].DESIGNATION || "";
      } else {
        sbName = buyingCenterDetails.SUPERBOSS || "";
        sbDesg = buyingCenterDetails.DESIGNATION || "";
      }
    }

    // Create comprehensive stakeholder details structure
    let comprehensiveStakeholderDetails = {
      ACCOUNT_ID: item.ACCOUNT_ID,
      BUYING_CENTRE: item.BUYING_CENTRE,
      DESCRIPTION: buyingCenterDetails ? buyingCenterDetails.DESCRIPTION || "" : "",
      SUPERBOSS: sbName,
      DESIGNATION: sbDesg,
      SOP1Y: buyingCenterDetails ? buyingCenterDetails.SOP1Y || 0 : 0,
      BC_TYPE: buyingCenterDetails ? buyingCenterDetails.BC_TYPE || "New" : "New",
      BC_ACTIVE_FLAG: buyingCenterDetails ? buyingCenterDetails.BC_ACTIVE_FLAG || "Y" : "Y",
      STAKEHOLDER: item.STAKEHOLDER,
      STAKEHOLDERS: buyingCenterDetails && buyingCenterDetails.STAKEHOLDERS ? buyingCenterDetails.STAKEHOLDERS.map(stakeholder => ({
        STAKEHOLDER_NAME: stakeholder.STAKEHOLDER_NAME || stakeholder.STAKEHOLDER || "",
        STAKEHOLDER_DESIGNATION: stakeholder.STAKEHOLDER_DESIGNATION || "",
        STAKEHOLDER_STATUS: stakeholder.STAKEHOLDER_STATUS || "Active",
        STAKEHOLDER_EMAIL: stakeholder.STAKEHOLDER_EMAIL || "",
        STAKEHOLDER_PHONE: stakeholder.STAKEHOLDER_PHONE || "",
        STAKEHOLDER_ROLE: stakeholder.STAKEHOLDER_ROLE || "",
        STAKEHOLDER_INFLUENCE: stakeholder.STAKEHOLDER_INFLUENCE || "",
        STAKEHOLDER_ENGAGEMENT: stakeholder.STAKEHOLDER_ENGAGEMENT || "",
        STAKEHOLDER_PRIORITY: stakeholder.STAKEHOLDER_PRIORITY || "",
        STAKEHOLDER_COMMENTS: stakeholder.STAKEHOLDER_COMMENTS || ""
      })) : []
    };

    return comprehensiveStakeholderDetails;
  });

  buyingCenterNpsapi = {
    user_details: "[" + accessDetails + "]",
    stakeholder_details: transformedStakeholderDetails,
  };

  console.log("Transformed stakeholder_details:", transformedStakeholderDetails);

  let apiURL = apiValue.url.replace("/app", "/stakeholders");

  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    data: JSON.stringify(buyingCenterNpsapi),
    success: function (json) {
      console.log("json - ", json);

      // Check if the response contains "Message" and it is "Success"
      if (json.Message === "Success") {
        // If the message is Success, perform the actions
        let message = json.Response; // Optionally store the response message

        // Show a success toastr message
        toastr.options.timeOut = 2000; // 2s
        toastr.success("Buying Center and NPS Stakeholder added successfully!");

        // Close the popup
        $("#add-new-popup").remove();
        $(".main-content").removeClass("blurred-background");

        // Refresh the buying center dropdown in the parent window and set the selected values
        if (window.opener && window.opener.refreshBuyingCenterDropdown) {
          window.opener.refreshBuyingCenterDropdown(buyingCenterNPS, newNPSStakeholder);
        }

        // Close the current window after successful save
        setTimeout(function () {
          window.close();
        }, 2000);
      } else {
        // If the message is not "Success", show an error message
        toastr.options.timeOut = 2000; // 2s
        toastr.error(json.Message || "Error occurred while saving.");
      }
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(loadTimeInSeconds, "SowCreate", "Revenue", "append_sow_new_UI", "error", fileName, "SowCreate", "edit");

      console.log("message Error" + error);
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Message error" + JSON.stringify(error));
    },
  });

}
function updatePersonaDate() {
  console.log("log-------");

  let StartDate = $("#actual_start_date").val();
  $(".autoStartUpdateDate").val(StartDate);
  let EndDate = $("#actual_end_date").val();
  let enddateCheck = checkEndDate('actual_start_date', 'actual_end_date', "Actual End date should be after Actual Start date");
  if (enddateCheck) {
    $(".autoEndUpdateDate").val(EndDate);
    calculateSowAmount();
  } else {
    $(".autoEndUpdateDate").val("");
  }
}
function checkEndDate(startdateid, enddateid, message) {
  console.log('checkEndDate function invoked');
  let StartDateCon = new Date($("#" + startdateid).val())
  let EndDateCon = new Date($("#" + enddateid).val())
  console.log("StartDateCon", StartDateCon);

  console.log("EndDateCon", EndDateCon);

  let status = true
  if (StartDateCon > EndDateCon) {
    toastr.error(message);
    $("#" + enddateid).val(""); // Clear the invalid End Date
    status = false
  } else if (StartDateCon == undefined || StartDateCon == null || StartDateCon == "") {
    toastr.error("Please select start date");
    status = false
  }

  return status
}
function updateMonthlyBreakupTab(data) {
  var sowAmountInput = document.getElementById("sow_amount");
  var projAmountInput = document.getElementById("proj_amount");
  if (data.BILLING_MODEL_DATA && data.BILLING_MODEL_DATA.BILLING_MODEL === "Fixed Price") {
    sowAmountInput.removeAttribute("readonly");
    sowAmountInput.value = ""; // Clear the input field
    projAmountInput.value = "";
    sowAmountInput.style.setProperty("background-color", "white", "important");
    sowAmountInput.style.setProperty("color", "black", "important");
    sowAmountInput.style.cursor = "pointer";
    sowAmountInput.style.border = "1px solid #ccc";
    projAmountInput.setAttribute("readonly", "readonly");
    projAmountInput.style.setProperty("background-color", "transparent", "important");
    projAmountInput.style.setProperty("color", "#ed7d2d", "important");

    activateMonthlyBreakupTab();
  } else {
    sowAmountInput.setAttribute("readonly", "readonly");
    sowAmountInput.value = "";
    sowAmountInput.placeholder = "0";
    sowAmountInput.style.setProperty("background-color", "transparent", "important");
    sowAmountInput.style.setProperty("color", "#ed7d2d", "important");
    sowAmountInput.style.cursor = "default";
    sowAmountInput.style.border = "none";
    removeMonthlyBreakupTab();
  }
}
document.addEventListener("DOMContentLoaded", function () {
  var sowAmountInput = document.getElementById("sow_amount");
  var projAmountInput = document.getElementById("proj_amount");

  if (sowAmountInput && projAmountInput) {
    sowAmountInput.addEventListener("input", function () {
      const amountValue = sowAmountInput.value.trim();

      // Mirror the sowAmount input value to projAmount input
      projAmountInput.value = amountValue;

      // Activate the Monthly Breakup tab
      switchTab(3)
    });
  } else {
    console.error("One or both input fields (sow_amount, proj_amount) not found.");
  }
});
//This to create new Fixed price or T&M 
document.addEventListener("DOMContentLoaded", function () {
  var billingDropdown = document.getElementById("billing_options");
  var sowAmountInput = document.getElementById("sow_amount");
  var projAmountInput = document.getElementById("proj_amount");

  monthsObject = { MONTHS: {} }; // Reset global object

  if (billingDropdown) {
    billingDropdown.addEventListener("change", function () {
      var billingType = this.value.trim().toLowerCase();
      console.log("Billing Type Changed:", billingType);

      if (billingType === "fixed price") {
        // Enable sow_amount editing
        sowAmountInput.removeAttribute("readonly");
        sowAmountInput.value = ""; // Clear the input field
        projAmountInput.value = "";
        sowAmountInput.style.setProperty(
          "background-color",
          "white",
          "important"
        );
        sowAmountInput.style.setProperty("color", "black", "important");
        sowAmountInput.style.cursor = "pointer";
        sowAmountInput.style.border = "1px solid #ccc";
        projAmountInput.setAttribute("readonly", "readonly");
        projAmountInput.style.setProperty(
          "background-color",
          "transparent",
          "important"
        );
        projAmountInput.style.setProperty("color", "#ed7d2d", "important");

        // Ensure "Monthly Breakup" tab exists & activate it

        // Hide Billing Rate and Amount columns
        hideBillingRateAmountColumns();
        activateMonthlyBreakupTabNew();
      } else {
        // Disable sow_amount and remove Monthly Breakup tab
        sowAmountInput.setAttribute("readonly", "readonly");
        projAmountInput.setAttribute("readonly", "readonly");
        sowAmountInput.value = "";
        sowAmountInput.placeholder = "0";
        sowAmountInput.style.setProperty(
          "background-color",
          "transparent",
          "important"
        );
        sowAmountInput.style.setProperty("color", "#ed7d2d", "important");
        sowAmountInput.style.cursor = "default";
        sowAmountInput.style.border = "none";
        // Remove the "Monthly Breakup" tab if it exists
        removeMonthlyBreakupTab();

        // Show Billing Rate and Amount columns
        showBillingRateAmountColumns();
        addSkillsData();
      }
    });
  } else {
    console.error("Element with ID 'billing_options' not found.");
  }

  // Listen for input changes in sow_amount to activate the "Monthly Breakup" tab
  sowAmountInput.addEventListener("input", function () {
    const amountValue = sowAmountInput.value.trim();

    // Mirror the sowAmount input value to projAmount input
    projAmountInput.value = amountValue;
    activateMonthlyBreakupTabNew();

    // Optionally call the function to activate Monthly Breakup tab if needed
  });

  // Function to toggle visibility of the Billing Rate and Amount columns
  function toggleColumnVisibility(show) {
    let table = document.getElementById("billing_exp_div");
    if (!table) return;

    let headers = table.querySelectorAll("thead th");
    let columnIndexes = [];

    // Find the indices of "Billing Rate($)" and "Amount"
    headers.forEach((th, index) => {
      let text = th.textContent.trim().toLowerCase();
      if (text === "billing rate($)") {
        columnIndexes.push(index);
        th.style.display = show ? "" : "none"; // Hide or show header
      }
    });

    if (columnIndexes.length === 0) return; // Exit if no columns found

    // Hide or show all matching <td> elements in each row of <tbody>
    table.querySelectorAll("tbody tr").forEach((row) => {
      let cells = row.children; // Get all td elements in this row
      columnIndexes.forEach((colIndex) => {
        if (cells[colIndex]) {
          cells[colIndex].style.display = show ? "" : "none";
        }
      });
    });
  }
});

function calculateMonthsDifference() {
  const startDateStr = document.getElementById("billing_start_date").value;
  const endDateStr = document.getElementById("billing_end_date").value;
  let StartDate = $("#billing_start_date").val();
  $(".autoStartUpdateDate").val(StartDate);
  let EndDate = $("#billing_end_date").val();
  $(".autoEndUpdateDate").val(EndDate);

  if (!startDateStr || !endDateStr) {
    return; // Do nothing if either date is empty
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate) || isNaN(endDate)) {
    console.error("Invalid date format.");
    return;
  }

  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  let lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  let newMonthsObject = {}; // Temporary object to store new months

  while (current <= lastMonth) {
    let formattedMonth =
      current.toLocaleString("en-US", { month: "short" }) +
      "_" +
      current
        .getFullYear()
        .toString()
        .slice(-2);

    // Preserve existing value if available, otherwise set empty
    newMonthsObject[formattedMonth] =
      monthsObject["MONTHS"]?.[formattedMonth] || 0;

    current.setMonth(current.getMonth() + 1);
  }

  // Replace old months with the new ones (this ensures removed months are gone)
  monthsObject["MONTHS"] = newMonthsObject;

  console.log("Updated Months Object:", monthsObject); // Debugging

  const monthlyTableContainer = document.getElementById(
    "monthlyTableContainer"
  );
  if (!monthlyTableContainer) {
    console.error("Container with id 'monthlyTableContainer' not found.");
    return;
  }

  monthlyTableContainer.innerHTML = ""; // Clear previous content

  const table = document.createElement("table");
  table.className = "monthly-breakup-table";

  let monthRowWrapper = document.createElement("tr");
  monthRowWrapper.className = "month-row-wrapper";

  Object.keys(monthsObject["MONTHS"]).forEach((month, index) => {
    const monthCellWrapper = document.createElement("td");
    monthCellWrapper.className = "month-cell-wrapper";

    const monthCell = document.createElement("div");
    monthCell.className = "month-column";
    monthCell.textContent = month;
    monthCellWrapper.appendChild(monthCell);

    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.placeholder = "Enter Here";
    inputField.classList.add("formatted-number");
    inputField.id = `monthly_breakup_amt_${month}`; // Unique ID
    inputField.value = monthsObject["MONTHS"][month] || 0; // Retain previous value

    inputField.addEventListener("keydown", function (event) {
      restrictSpecialCharactersById(this.id, "number");
    });

    // Store value in monthsObject["MONTHS"] when input changes
    inputField.addEventListener("input", function () {
      formatNumberInput(this);
      monthsObject["MONTHS"][month] = this.value; // Store raw number
    });

    monthCellWrapper.appendChild(inputField);
    monthRowWrapper.appendChild(monthCellWrapper);

    if (
      (index + 1) % 10 === 0 ||
      index === Object.keys(monthsObject["MONTHS"]).length - 1
    ) {
      table.appendChild(monthRowWrapper);
      monthRowWrapper = document.createElement("tr");
      monthRowWrapper.className = "month-row-wrapper";
    }
  });

  monthlyTableContainer.appendChild(table);
}

function activateMonthlyBreakupTabNew() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // Check if tab content and tab button exist
  const tabIndex = Array.from(tabButtons).findIndex(
    (tab) => tab.textContent === "Monthly Breakup"
  );

  if (tabIndex !== -1) {
    // Show the "Monthly Breakup" tab button
    tabButtons[tabIndex].style.display = "block"; // Show the tab button

    // Re-add the Monthly Breakup content with table container to the tab content
    const monthlyBreakupTabContent = tabContents[tabIndex];
    monthlyBreakupTabContent.innerHTML = `
      <div class="monthly-breakup-content">
        <div id="monthlyTableContainer"></div> <!-- Table container -->
      </div>
    `;
    calculateMonthsDifference();
    switchTab(3);
    console.log("Monthly Breakup tab activated and content added.");
  }
}

function showBillingRateAmountColumns() {
  let table = document.getElementById("billing_exp_div");
  if (!table) return;

  let headers = table.querySelectorAll("thead th");
  let columnIndexes = [];

  // Find the indices of "Billing Rate($)" and "Amount"
  headers.forEach((th, index) => {
    let text = th.textContent.trim().toLowerCase();
    if (text === "billing rate($)") {
      columnIndexes.push(index + 1);
      th.style.display = ""; // Show the header again
    }
  });

  // Show the corresponding <td> elements in each row of <tbody>
  table.querySelectorAll("tbody tr").forEach((row) => {
    columnIndexes.forEach((colIndex) => {
      let cell = row.children[colIndex];
      if (cell) {
        let span = cell.querySelector("span.days_amount");

        // Restore original content only inside the span
        if (span) {
          span.textContent = ""; // Clear text inside span
        }

        cell.style.display = ""; // Show the column again
      }
    });
  });
  $('.cal_amt_val').show();
}

function removeResourceAllocationTab() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // Check if tab content and tab button exist
  const tabIndex = Array.from(tabButtons).findIndex(tab => tab.textContent === "Resource Allocation");

  if (tabIndex !== -1) {
    // Hide the "Monthly Breakup" tab button
    tabButtons[tabIndex].style.display = "none";

    // Clear the content of the "Monthly Breakup" tab content
    tabContents[tabIndex].innerHTML = '';  // Clear the content
    console.log("Resource Allocation tab button and content removed.");
  }
}

function activateResourceAllocationTab() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // Check if tab content and tab button exist
  const tabIndex = Array.from(tabButtons).findIndex(tab => tab.textContent === "Resource Allocation");

  if (tabIndex !== -1) {
    // Show the "Monthly Breakup" tab button
    tabButtons[tabIndex].style.display = "block";  // Show the tab button

    // Re-add the Monthly Breakup content with table container to the tab content
    const monthlyBreakupTabContent = tabContents[tabIndex];
    monthlyBreakupTabContent.innerHTML = `
      <div class="resource_div">
        <div class="employee_detail_inside employee_sow_details table-responsive fixTableHead current_team_all">
          <table class="table table-bordered border-primary existing_resource" id="resource_exist_table">
            <thead>
              <div class="resource_div">
                <tr>
                  <th colspan="4" class="border-color-thead">Demand</th>
                  <th colspan="8" class="border-color-thead">Supply <div class='allocation-indication'> <div class="allocation-legend-color"></div> <div>Current Resources</div></div></th>
                </tr>
                <tr class="allocation-resource-data" id="allocation-res-header">
                  <th>Location</th>
                  <th>Persona</th>
                  <th>Actual Start Date</th>
                  <th>Actual End Date</th>
                  <th>Team Member</th>
                  <th>Designation</th>
                  <th>Persona</th>
                  <th>Skills</th>
                  <th>Allocation Start Date</th>
                  <th>Allocation End Date</th>
                  <th style='display: none;'>Billing Status</th>
                </tr>
              </div>
            </thead>
            
            <tbody id="resource_exist_body">

            </tbody>

          </table>
        </div>
      </div>
    `;
    console.log("Resource Allocation tab activated and content added.");
    // populateMonthlyTable(sow_acc_data);
    getFindResourceData();
  }
  $("#update_resource_data").prop('disabled', true);
}

function removeMonthlyBreakupTab() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // Check if tab content and tab button exist
  const tabIndex = Array.from(tabButtons).findIndex(tab => tab.textContent === "Monthly Breakup");

  if (tabIndex !== -1) {
    // Hide the "Monthly Breakup" tab button
    tabButtons[tabIndex].style.display = "none";

    // Clear the content of the "Monthly Breakup" tab content
    tabContents[tabIndex].innerHTML = '';  // Clear the content
    console.log("Monthly Breakup tab button and content removed.");
  }
}

function activateMonthlyBreakupTab() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // Check if tab content and tab button exist
  const tabIndex = Array.from(tabButtons).findIndex(tab => tab.textContent === "Monthly Breakup");

  if (tabIndex !== -1) {
    // Show the "Monthly Breakup" tab button
    tabButtons[tabIndex].style.display = "block";  // Show the tab button

    // Re-add the Monthly Breakup content with table container to the tab content
    const monthlyBreakupTabContent = tabContents[tabIndex];
    monthlyBreakupTabContent.innerHTML = `
      <div class="monthly-breakup-content">
        <div id="monthlyTableContainer"></div> <!-- Table container -->
      </div>
    `;
    console.log("Monthly Breakup tab activated and content added.");
    populateMonthlyTable(sow_acc_data);
  }
}
function populateMonthlyTable(data_sow) {
  console.log("data_sow----->", data_sow);

  if (!data_sow || !data_sow["BILLING_MODEL_DATA"] || !data_sow["BILLING_MODEL_DATA"]["MONTHS"]) {
    console.error("No months data found in sow_acc_data.");
    return;
  }

  const monthsData = data_sow["BILLING_MODEL_DATA"]["MONTHS"];

  const monthlyTableContainer = document.getElementById("monthlyTableContainer");
  if (!monthlyTableContainer) {
    console.error("Container with id 'monthlyTableContainer' not found.");
    return;
  }

  monthlyTableContainer.innerHTML = ''; // Clear previous content

  const table = document.createElement('table');
  table.className = 'monthly-breakup-table';

  let monthRowWrapper = document.createElement('tr');
  monthRowWrapper.className = 'month-row-wrapper';

  let counter = 0;
  let monthsInputData = {};  // Object to store the MONTHS data

  Object.entries(monthsData).forEach(([month, value]) => {
    const monthCellWrapper = document.createElement('td');
    monthCellWrapper.className = 'month-cell-wrapper';

    const monthCell = document.createElement('div');
    monthCell.className = 'month-column';
    monthCell.textContent = month;
    monthCellWrapper.appendChild(monthCell);

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.classList.add("formatted-number");
    inputField.id = `monthly_breakup_amt_${month}`;
    inputField.value = (value !== undefined && value !== null) ? value : "";
    inputField.placeholder = "Enter here";
    formatNumberInput(inputField);

    inputField.readOnly = false;
    inputField.addEventListener('keydown', function (event) {
      restrictSpecialCharactersById(`monthly_breakup_amt_${month}`, 'number');
    });

    // Capture input changes
    inputField.addEventListener("input", function () {
      formatNumberInput(this);
      let sanitizedValue = this.value.replace(/,/g, '');
      let numericValue = parseFloat(sanitizedValue);
      if (isNaN(numericValue)) numericValue = 0;
      monthsInputData[month] = numericValue; // Update latest input
    });

    monthCellWrapper.appendChild(inputField);
    monthRowWrapper.appendChild(monthCellWrapper);
    counter++;

    if (counter % 10 === 0) {
      table.appendChild(monthRowWrapper);
      monthRowWrapper = document.createElement('tr');
      monthRowWrapper.className = 'month-row-wrapper';
    }
  });

  if (monthRowWrapper.children.length > 0) {
    table.appendChild(monthRowWrapper);
  }

  monthlyTableContainer.appendChild(table);

  // 🔹 Recalculate `monthsInputData` after rendering

}



function hideBillingRateAmountColumns(data) {
  console.log("data", data);
  if (data == undefined) {
    let table = document.getElementById("billing_exp_div");
    if (!table) return;

    let headers = table.querySelectorAll("thead th");
    let columnIndexes = [];

    // Find the indices of "Billing Rate($)" and "Amount"
    headers.forEach((th, index) => {
      let text = th.textContent.trim().toLowerCase();
      if (text === "billing rate($)") {
        columnIndexes.push(index + 1);
        th.style.display = "none"; // Hide the header
      }
    });

    // Hide the corresponding <td> elements in each row of <tbody>
    table.querySelectorAll("tbody tr").forEach((row) => {
      columnIndexes.forEach((colIndex) => {
        let cell = row.children[colIndex];
        if (cell) {
          let span = cell.querySelector("span.days_amount");

          // Update only the span text, do not modify <td>
          if (span) {
            span.textContent = "0"; // Set only the span text
          }

          cell.style.display = "none"; // Hide the column
        }
      });
    });
    $('.cal_amt_val').hide();
  } else {

    let billingType = data.BILLING_MODEL_DATA.BILLING_MODEL;

    // Only proceed if the billing type is "Fixed Price"
    if (billingType !== "Fixed Price") return;

    let table = document.getElementById("billing_exp_div");
    if (!table) return;

    // Identify the header columns that need to be hidden
    let headers = table.querySelectorAll("thead th");
    let columnIndexes = [];

    headers.forEach((th, index) => {
      let text = th.textContent.trim().toLowerCase();
      if (text === "billing rate($)") {
        columnIndexes.push(index + 1);
        th.style.display = "none"; // Hide the header
      }
    });
    let tbody = table.querySelector("tbody");
    console.log("tbody",);

    if (!tbody) {
      console.log("No tbody found!");
      return;
    }
    let rows = table.querySelectorAll("tbody tr");
    console.log("Number of rows found:", rows.length);

    // Hide the corresponding <td> elements in each row of <tbody> & set them to 0
    table.querySelectorAll("tbody tr").forEach(row => {
      let cells = row.children;
      columnIndexes.forEach(colIndex => {
        if (cells[colIndex]) {
          let cell = cells[colIndex];

          // Check if there's an input inside the <td>
          let input = cell.querySelector("input");
          if (input) {
            input.value = "0"; // Set input value to 0
          } else {
            cell.innerText = "0"; // Set text to 0
          }

          cell.style.display = "none"; // Hide the column
        }
      });

    });
  }
  $('.cal_amt_val').hide();
}
// Remove the window load event listener as it's now called after data is loaded
function formatNumberInput(input) {
  let rawValue = input.value.replace(/,/g, "");

  if (rawValue === "" || isNaN(rawValue)) return;

  let formattedValue = new Intl.NumberFormat("en-US").format(Number(rawValue));

  input.value = formattedValue;
}
function handleBillingDateChange() {
  console.log("!!!!!!!!!!!!!!!!!")
  checkEndDate('billing_start_date', 'billing_end_date', 'Billing End date should be after Billing Start date');
  updateMonthlyTable();
  let StartDate = $("#billing_start_date").val();
  $(".autoStartUpdateDate").val(StartDate);
  $("#actual_start_date").val(StartDate);
  let EndDate = $("#billing_end_date").val();
  $(".autoEndUpdateDate").val(EndDate);
  $("#actual_end_date").val(EndDate);
  calculateSowAmount()
}
function updateMonthlyTable() {
  console.log("Hello");

  let startDateInput = document.getElementById("billing_start_date").value;
  let endDateInput = document.getElementById("billing_end_date").value;

  if (!startDateInput || !endDateInput) {
    console.warn("Start date or end date is missing.");
    return;
  }

  let startDate = parseDate(startDateInput);
  let endDate = parseDate(endDateInput);

  if (!startDate || !endDate || startDate > endDate) {
    console.error("Invalid date range.");
    return;
  }

  let monthsList = getMonthsBetween(startDate, endDate);

  // 🔹 Convert 'Feb 2025' → 'Feb_25'
  monthsList = monthsList.map(month => {
    let [monthName, year] = month.split(" ");  // Extract "Feb" and "2025"
    return `${monthName}_${year.slice(-2)}`;   // Convert to "Feb_25"
  });

  console.log("Formatted monthsList:", monthsList);

  // Get existing data (if any)
  let rawExistingData = sow_acc_data?.["BILLING_MODEL_DATA"]?.["MONTHS"] || {};
  console.log("Raw existingData:", rawExistingData);

  // Merge existing months with new ones (retain values if they exist)
  let updatedMonthsData = {};
  monthsList.forEach(month => {
    updatedMonthsData[month] = rawExistingData[month] || ""; // Keep existing values, set new months to blank
  });

  console.log("updatedMonthsData", updatedMonthsData);

  // Create a new variable (deep copy of sow_acc_data) and update it
  let updatedSowAccData = JSON.parse(JSON.stringify(sow_acc_data)); // Deep copy

  // Update the months data in the copied object
  updatedSowAccData["BILLING_MODEL_DATA"]["MONTHS"] = updatedMonthsData;

  // Log the updated data (for verification)
  console.log("Updated sow_acc_data:", updatedSowAccData);

  // Repopulate the table with the new data
  populateMonthlyTable(updatedSowAccData);
}


function parseDate(dateStr) {
  let parts = dateStr.split("-");
  if (parts.length === 3) {
    return new Date(`20${parts[2]}`, parts[0] - 1, 1); // Convert mm-dd-yy to Date
  }
  return null;
}

function getMonthsBetween(startDate, endDate) {
  let months = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    let month = current.toLocaleString("en-US", { month: "short", year: "numeric" });
    months.push(month);
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

/**
 * This is the function you provided, which finds date conflicts.
 */
function checkAllocationResourceDates(moduleCheck) {
  let legalStartDate = $("#legal_start_date").val();
  let legalEndDate = $("#legal_end_date").val();
  let duplicateWarnings = [];

  $("#resource_exist_table tbody tr").each(function () {
    let id = $(this).find(".current_emp_id").text();
    if (id === '-') {
      return; // Skip header or empty rows
    }

    let name = $(this).find(".current_emp_name").html() || $(this).find(".emp_name_option_selected option:selected").text();
    let startDate = $(this).find(".currentNewStartDate").val();
    let endDate = $(this).find(".currentNewEndDate").val();
    let demandStartDate = $(this).find(".current_demand_actual_start").html();
    let demandEndDate = $(this).find(".current_demand_actual_end").html();
    let desg = $(this).find(".current_emp_job_role").html();

    // Use legal project dates as a fallback if demand dates are not set
    if (demandStartDate == '-') {
      demandStartDate = legalStartDate;
    }
    if (demandEndDate == '-') {
      demandEndDate = legalEndDate;
    }
    // Initialize an array to hold reasons
    let reasons = [];

    // Check if startDate is before demandStartDate
    if (startDate < demandStartDate) {
      reasons.push('Start date is before demand start date');
    }

    // Check if endDate is after demandEndDate
    if (endDate > demandEndDate) {
      reasons.push('End date is after demand end date');
    }
    // Check if the resource's dates are OUTSIDE the valid demand date range.
    if (startDate < demandStartDate || endDate > demandEndDate) {
      // **BUG FIX:** Corrected the legalDates property to use demandEndDate
      duplicateWarnings.push({
        name: name,
        designation: desg,
        resourceDates: `From ${startDate} to ${endDate}`,
        legalDates: `From ${demandStartDate} to ${demandEndDate}`, // Corrected this line
        reason: reasons.join(' and ') // Join reasons with 'and'
      });
    }
  });
  console.log("duplicateWarnings", duplicateWarnings);
  if (duplicateWarnings.length > 0) {
    return displayAllocationWarnings(duplicateWarnings);
  } else {
    return Promise.resolve(true);
  }
}

/**
 * NEW FUNCTION: This function populates and displays the warning modal.
 * @param {Array} warnings - The array of warning objects.
 */
function displayAllocationWarnings(warnings) {
  return new Promise(resolve => {
    const modal = $('#allocationWarningModal');
    const tableBody = $('#warning-details-body');
    const proceedBtn = $('#proceed-anyway-btn');
    const cancelBtn = $('#cancel-allocation-btn');
    const closeBtn = modal.find('.close');
    tableBody.empty();
    proceedBtn.off('click');
    cancelBtn.off('click');
    closeBtn.off('click');
    warnings.forEach(warning => {
      const row = `
              <tr>
                  <td>${warning.name}</td>
                  <td>${warning.designation}</td>
                  <td>${warning.resourceDates}</td>
                  <td>${warning.legalDates}</td>
                  <td>${warning.reason}</td>
              </tr>`;
      tableBody.append(row);
    });
    proceedBtn.one('click', function () {
      modal.modal('hide');
      resolve(true); // Resolve the promise with `true`
    });
    function cancelAction() {
      modal.modal('hide');
      resolve(false); // Resolve the promise with `false`
    }
    cancelBtn.one('click', cancelAction);
    closeBtn.one('click', cancelAction);
    modal.modal('show');
  });
}

// View/Edit Buying Center button functionality
function viewEditBuyingCenter() {
  let accName = sow_acc_data.ACCOUNT_NAME;
  window.open('buyingCenterDetails.html?accountName=' + encodeURIComponent(accName) + '&accountId=' + sow_acc_data.ACCOUNT_ID + '&action=view-edit&redirect=sowEdit&sowId=' + encodeURIComponent(sow_acc_data.SOW_ID) + '&sowNumber=' + encodeURIComponent(sow_acc_data.UNIQUE_ID), '_blank');
}

function newBuyingCenter() {
  let accName = sow_acc_data.ACCOUNT_NAME;
  window.open('buyingCenterDetails.html?accountName=' + encodeURIComponent(accName) + '&accountId=' + sow_acc_data.ACCOUNT_ID + '&action=new&redirect=sowEdit&sowId=' + encodeURIComponent(sow_acc_data.SOW_ID) + '&sowNumber=' + encodeURIComponent(sow_acc_data.UNIQUE_ID), '_blank');
}


// Store selected NPS stakeholders for display
var selectedNpsStakeholders = [];
var initialNpsStakeholderNames = ""; // Track initial NPS display names for audit comparison

function loadExistingNpsStakeholders(npsStakeholderData) {
  console.log("Loading existing NPS stakeholders:", npsStakeholderData);

  // Clear existing selections
  selectedNpsStakeholders = [];

  if (!npsStakeholderData || !Array.isArray(npsStakeholderData) || npsStakeholderData.length === 0) {
    console.log("No existing NPS stakeholder data to load");
    renderNpsStakeholderDetails();
    return;
  }

  // Populate selectedNpsStakeholders with existing data
  selectedNpsStakeholders = npsStakeholderData.map(item => ({
    id: item.stakeholder_id || "",
    name: item.name || "",
    designation: item.designation || "",
    status: "Y", // Assume active
    keyDirects: "",
    type: "Stakeholder",
    keyStakeholderName: item.name || "",
    source: "EXISTING"
  }));

  console.log("Loaded selectedNpsStakeholders:", selectedNpsStakeholders);

  // Store initial NPS display names for audit comparison
  initialNpsStakeholderNames = selectedNpsStakeholders.map(s => s.name).sort().join(', ');
  console.log("Initial NPS Stakeholder Display names:", initialNpsStakeholderNames);

  // The multiple select will be populated after buying center selection
  // For now, just render the details
  renderNpsStakeholderDetails();
}

function NPSChange(event) {
  const buyingCenter = $("#buying_center option:selected").val();

  if (!buyingCenter || buyingCenter.trim() === "" || buyingCenter === "-1") {
    toastr.error("Please select Buying Center First.");
  }
}

function initOrReloadNpsStakeholderDisplay() {
  var $npsDisplay = $("#nps_stakeholder_display");

  if (!$npsDisplay.length || !$.fn.multiselect) {
    return;
  }

  if ($npsDisplay.data("plugin_multiselect")) {
    $npsDisplay.multiselect("reload");
  } else {
    $npsDisplay.multiselect({
      columns: 1,
      placeholder: 'Select Stakeholder',
      search: true,
      selectAll: true,
      onControlClose: function() {
        onNpsStakeholderDisplayChange();
      }
    });
  }

  $npsDisplay.off("change.npsStakeholderDisplay").on("change.npsStakeholderDisplay", function() {
    onNpsStakeholderDisplayChange();
  });
}

function resetNpsStakeholderSelections(options) {
  var settings = options || {};
  var disableMain = settings.disableMain !== false;
  var $mainStakeholder = $("#nps_stakeholder");
  var $npsDisplay = $("#nps_stakeholder_display");

  $mainStakeholder.empty();
  $mainStakeholder.append('<option value="-1">Select Stakeholder</option>');
  $mainStakeholder.val("-1");
  $mainStakeholder.prop("disabled", disableMain);

  $npsDisplay.val([]);
  $npsDisplay.empty();
  $npsDisplay.prop("disabled", true);
  initOrReloadNpsStakeholderDisplay();

  selectedNpsStakeholders = [];
  $("#nps_stakeholder_details_container").empty().hide();
}

/**
 * Sync the NPS STAKEHOLDER display dropdown with the same data as the main STAKEHOLDER dropdown.
 * This includes all STAKEHOLDERS and KEY_STAKEHOLDER entries from the selected buying center.
 * The dropdown is only enabled when the main STAKEHOLDER dropdown is enabled.
 */
function syncNpsStakeholderDisplay(buyingCenter) {
  console.log("=== SYNC NPS STAKEHOLDER DISPLAY START ===");

  var $npsDisplay = $("#nps_stakeholder_display");
  var $mainStakeholder = $("#nps_stakeholder");
  var isMainEnabled = !$mainStakeholder.prop("disabled");

  // Store existing selections before clearing
  var existingSelections = selectedNpsStakeholders.slice();

  // Clear the display dropdown
  $npsDisplay.val([]);
  $npsDisplay.empty();

  // Enable/disable based on main stakeholder dropdown state
  $npsDisplay.prop("disabled", !isMainEnabled);

  if (!isMainEnabled || !buyingCenter || buyingCenter === "-1") {
    console.log("NPS display dropdown disabled - main stakeholder not enabled or no buying center");
    return;
  }

  // Get account details
  if (!buyingCenterNps || !Array.isArray(buyingCenterNps) || buyingCenterNps.length === 0) {
    console.log("No buyingCenterNps data available for NPS display");
    return;
  }

  var accountDetails = buyingCenterNps.find(function (item) {
    return item.ACCOUNT_ID === sow_acc_data.ACCOUNT_ID;
  });

  if (!accountDetails || !accountDetails.DETAILS) {
    console.log("No account details found for NPS display");
    return;
  }

  var buyingCenterDetail = accountDetails.DETAILS.find(function (detail) {
    return (detail.BC_ID || detail.BUYING_CENTRE) === buyingCenter;
  });

  if (!buyingCenterDetail) {
    console.log("No buying center detail found for NPS display");
    return;
  }

  var allEntries = [];
  var keyDirectsSet = new Set();

  // Add STAKEHOLDERS entries
  if (buyingCenterDetail.STAKEHOLDERS && Array.isArray(buyingCenterDetail.STAKEHOLDERS)) {
    buyingCenterDetail.STAKEHOLDERS.forEach(function (s) {
      allEntries.push({
        id: s.STAKEHOLDER_ID || "",
        name: s.STAKEHOLDER || "",
        designation: s.STAKEHOLDER_DESIGNATION || "",
        status: s.STAKEHOLDER_STATUS || "",
        keyDirects: s.KEY_DIRECTS || "",
        type: s.STAKEHOLDER_TYPE || "",
        keyStakeholderName: s.KEY_STAKEHOLDER_NAME || "",
        source: "STAKEHOLDER"
      });
      // Collect unique KEY_DIRECTS
      if (typeof s.KEY_DIRECTS === 'string' && s.KEY_DIRECTS.trim() !== "") {
        keyDirectsSet.add(s.KEY_DIRECTS.trim());
      } else if (Array.isArray(s.KEY_DIRECTS)) {
        s.KEY_DIRECTS.forEach(kd => {
          if (typeof kd === 'string' && kd.trim() !== "") {
            keyDirectsSet.add(kd.trim());
          }
        });
      }
    });
  }

  // Add separate entries for unique KEY_DIRECTS
  keyDirectsSet.forEach(function (keyDirect) {
    allEntries.push({
      id: "",  // no id as per user
      name: keyDirect,
      designation: "",
      status: "",
      keyDirects: "",
      type: "Key Direct",
      keyStakeholderName: "",
      source: "KEY_DIRECT"
    });
  });

  // Add KEY_STAKEHOLDER entries
  if (buyingCenterDetail.KEY_STAKEHOLDER && Array.isArray(buyingCenterDetail.KEY_STAKEHOLDER)) {
    buyingCenterDetail.KEY_STAKEHOLDER.forEach(function (k) {
      // Avoid duplicates - check if already added from STAKEHOLDERS
      var isDuplicate = allEntries.some(function (entry) {
        return entry.name === k.KEY_STAKEHOLDER_NAME;
      });
      if (!isDuplicate && k.KEY_STAKEHOLDER_NAME && k.KEY_STAKEHOLDER_NAME.trim() !== "") {
        allEntries.push({
          id: k.KEY_STAKEHOLDER_ID || "",
          name: k.KEY_STAKEHOLDER_NAME || "",
          designation: k.KEY_STAKEHOLDER_DESIGNATION || "",
          status: "Y",
          keyDirects: "",
          type: "Key Stakeholder",
          keyStakeholderName: k.KEY_STAKEHOLDER_NAME || "",
          source: "KEY_STAKEHOLDER"
        });
      }
    });
  }

  // Populate dropdown
  var validEntries = allEntries.filter(function (entry) {
    return entry.name && entry.name.trim() !== "" && entry.name !== "undefined";
  });

  if (validEntries.length > 0) {
    validEntries.forEach(function (entry, index) {
      $npsDisplay.append(
        '<option value="' + entry.name + '" ' +
        'data-id="' + entry.id + '" ' +
        'data-name="' + entry.name + '" ' +
        'data-designation="' + entry.designation + '" ' +
        'data-status="' + entry.status + '" ' +
        'data-keydirects="' + entry.keyDirects + '" ' +
        'data-type="' + entry.type + '" ' +
        'data-keystakeholder="' + entry.keyStakeholderName + '" ' +
        'data-source="' + entry.source + '">' +
        entry.name + '</option>'
      );
    });
    $npsDisplay.prop("disabled", false);
    console.log("NPS display populated with", validEntries.length, "entries");
  } else {
    $npsDisplay.prop("disabled", true);
    console.log("No valid entries for NPS display");
  }

  initOrReloadNpsStakeholderDisplay();

  // Store reference to allEntries for later use
  $npsDisplay.data("allEntries", allEntries);

  // Select existing stakeholders in the dropdown
  selectExistingNpsStakeholders();

  console.log("=== SYNC NPS STAKEHOLDER DISPLAY END ===");
}

/**
 * Handle selection from the NPS STAKEHOLDER display dropdown.
 * When a stakeholder is selected, show their details  below the dropdown as a tag/card
 * including KEY_DIRECTS info.
 */
function onNpsStakeholderDisplayChange() {
  var $npsDisplay = $("#nps_stakeholder_display");
  var selectedValues = $npsDisplay.val() || [];

  // Clear currently selected list
  selectedNpsStakeholders = [];

  if (selectedValues.length === 0) {
    renderNpsStakeholderDetails();
    return;
  }

  selectedValues.forEach(function(val) {
    var $option = $npsDisplay.find('option[value="' + val + '"]');
    selectedNpsStakeholders.push({
      id: $option.data("id") || "",
      name: $option.data("name") || val,
      designation: $option.data("designation") || "",
      status: $option.data("status") || "",
      keyDirects: $option.data("keydirects") || "",
      type: $option.data("type") || "",
      keyStakeholderName: $option.data("keystakeholder") || "",
      source: $option.data("source") || ""
    });
  });

  // Render the selected stakeholder details
  renderNpsStakeholderDetails();
}

/**
 * Render selected NPS stakeholder details as tag/card items below the dropdown.
 * Each item shows: Stakeholder Name, Designation, Status, KEY_DIRECTS, and a remove button.
 */
function renderNpsStakeholderDetails() {
  var $container = $("#nps_stakeholder_details_container");
  $container.empty();

  if (selectedNpsStakeholders.length === 0) {
    $container.hide();
    return;
  }

  $container.show();

  selectedNpsStakeholders.forEach(function (s, index) {
    var itemHtml =
      '<div class="nps-stakeholder-detail-item" data-index="' + index + '">' +
        '<div class="stakeholder-info">' +
          '<div class="stakeholder-name">' + s.name + '</div>' +
        '</div>' +
        '<button class="remove-stakeholder-btn" onclick="removeNpsStakeholderDetail(' + index + ')" title="Remove">' +
          '<i class="fa fa-times" aria-hidden="true"></i>' +
        '</button>' +
      '</div>';

    $container.append(itemHtml);
  });
}

/**
 * Remove a selected NPS stakeholder from the display list.
 */
function removeNpsStakeholderDetail(index) {
  var removedItem = selectedNpsStakeholders[index];
  selectedNpsStakeholders.splice(index, 1);

  // Update multiselect state
  var $npsDisplay = $("#nps_stakeholder_display");
  var currentVals = $npsDisplay.val() || [];
  var newVals = currentVals.filter(function(v) { return v !== removedItem.name; });
  $npsDisplay.val(newVals);
  initOrReloadNpsStakeholderDisplay();

  renderNpsStakeholderDetails();
}

function selectExistingNpsStakeholders() {
  var $npsDisplay = $("#nps_stakeholder_display");

  if (selectedNpsStakeholders.length === 0) {
    console.log("No existing stakeholders to select");
    return;
  }

  // Get all available options
  var allOptions = $npsDisplay.find('option').map(function() { return $(this).val(); }).get();

  // Filter existing selections to only include those still available
  var validSelections = selectedNpsStakeholders.filter(s =>
    allOptions.includes(s.name)
  );

  // Update selectedNpsStakeholders to only include valid ones
  selectedNpsStakeholders = validSelections;

  // Get the names of valid stakeholders to select
  var stakeholdersToSelect = validSelections.map(s => s.name);

  console.log("Selecting valid existing stakeholders:", stakeholdersToSelect);

  // Set the selected values in the multiselect
  $npsDisplay.val(stakeholdersToSelect);

  // Reload the multiselect to reflect the selections
  initOrReloadNpsStakeholderDisplay();

  // Re-render the details
  renderNpsStakeholderDetails();

  console.log("Existing stakeholders selected in dropdown");
}

// Function to refresh buying center dropdown - called from popup window
function refreshBuyingCenterDropdown(newBuyingCenter, newStakeholder) {
  getBuyingCenters(function () {
    // Re-populate the dropdown with current account
    if (sow_acc_data && sow_acc_data.ACCOUNT_ID) {
      populateBuyingCenterDropdown(sow_acc_data.ACCOUNT_ID, newBuyingCenter, newStakeholder);
    }
  });
}
window.toRefreshBuyingCenterDropdown = function (newBuyingCenter, newStakeholder) {
  console.log('newBuyingCenter - ', newBuyingCenter);
  console.log('newStakeholder - ', newStakeholder);
  console.log("Refreshing Buying Center Dropdown...");
  refreshBuyingCenterDropdown(newBuyingCenter, newStakeholder);
};
