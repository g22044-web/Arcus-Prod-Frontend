
var getFunnelStageDrop = [],
  getsowTypeDrop = [],
  sowDropDownJson = [],
  defaultBillArr = [];
var personaOpt = "",
  billingOpt = "",
  bill_us_default = 0,
  bill_ind_default = 0;
var funnelOptHtml = "",
  sowTypeOptHtml = "",
  skillOptionsHtml = "",
  sow_amount_user_edit = "NO",
  billingTypeHtml = "", project_amount = "", sow_amount_temp = "", userComments = [];
var load_sow_id = '', load_sow_unique_id = '', opportunityOwnersJsonData = [];
var deliveryMembers = [], growthMembers = [], sowActiveStatus = '';
var probFilterOptions = `<option value="10">10%</option>
                          <option value="30 to 50">30% to 50%</option>
                          <option value="70">&gt; 70%</option>
                          <option value="100">100%</option>`;
var locationOpt = `<option value="-1">Select Location</option>
                    <option value="US">US</option>
                    <option value="INDIA">INDIA</option>`;
var sow_acc_data = "", sowSelectedSource = "", comments_notes = "", audit_message = [], npsStakeholderDataGlobal = null;
var defaultAccName = "",
  defaultBusHead = "",
  defaultFactHead = "",
  defaultAccId = "";

const pathname = window.location.pathname;
console.log("sow pathname - ", pathname);
// Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();
const paramsString = window.location.search.substring(1); // removes the '?'
const paramsArray = paramsString.split('&');
console.log("paramsArray - ", paramsArray);
localStorage.removeItem("sow-url");

function getSowData(sowid, unique) {
  let apiURL = apiValue.url.replace("/app", "/sow_profile_details_figma");
  console.log('paramsArray API - ', paramsArray);
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: 'no-cors',
    data: JSON.stringify({
      "query_type": "sow_profile_details",
      "sow_id": sowid,
      "unique_id": unique,
      "environment": apiValue.environment
    }),
    success: function (data) {
      sow_acc_data = data.SOW_DATA[0];
      npsStakeholderDataGlobal = data.NPS_STAKEHOLDER_DATA;

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

      audit_message = data.AUDIT_LOG;
      console.log("audit_message", audit_message);
      sowActiveStatus = sow_acc_data.SOW_ACTIVE_FLAG;
      updateMonthlyBreakupTab(sow_acc_data);
      // allcoationTabShowHide(sow_acc_data);
      updateAuditTab(audit_message);
      initializeQuill(comments_notes);
      console.log("comments_notes", comments_notes);
      console.log("audit_message", audit_message);
    },
    error: function (error) {
      console.log('message Error' + JSON.stringify(error));
      hasErrorSow = true;
      toastr.error("Error loading SOW data");
      $(".loader").css("display", "none");
    }
  });
}

function allcoationTabShowHide(data) {
  console.log("data", data);
  if (data.ALLOCATION_FLAG === 'YES') {
    activateResourceAllocationTab();
  } else {
    removeResourceAllocationTab();
  }
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
    let getnavFromAllocation = localStorage.getItem("navFromAllocation")
    if (getnavFromAllocation == "sowAllocation") {
      // Activate the tab
      switchTab(tabIndex);
      localStorage.setItem("navFromAllocation", "")
    }

    // Re-add the Monthly Breakup content with table container to the tab content
    const monthlyBreakupTabContent = tabContents[tabIndex];
    let userrole = localStorage.getItem("user-role");
    let userEmailId = localStorage.getItem("email");
    let showCreateButton = (
      userrole == "admin" ||
      userEmailId == "akhilesh@factspan.com" ||
      userEmailId == "nitin.pandey@factspan.com"
    );

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
                  <th style='display:none'>Billing Status</th>
                  ${showCreateButton ? `<th style="width: 1%" class='create-btn'><button class="btn btn-info-allocation header-button show-bu-head-data" id='create_allocate_team'
                      title="Add Team Supply" onclick="createNewTeam()"><i class="fa fa-plus-square"
                        aria-hidden="true"></i></button></th>` : `<th style="width: 1%" class='create-btn'></th>`}
                </tr>
              </div>
            </thead>
            
            <tbody id="resource_exist_body">

            </tbody>

          </table>
        </div>
        <button class="btn btn-secondary save-btn available_resource pull-right" id="update_resource_data" onclick="allocateTeam('Allocate')">Allocate</i>
        </button>
      </div>
    `;
    console.log("Resource Allocation tab activated and content added.");
    // populateMonthlyTable(sow_acc_data);
    console.log("deliveryMembers sow - ", deliveryMembers);
    console.log("growthMembers sow - ", growthMembers);
    getFindResourceData(deliveryMembers, growthMembers, sowActiveStatus);
  }
  $("#update_resource_data").prop('disabled', true);
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
    mode: 'no-cors',
    data: JSON.stringify({
      "SOW_ID": sowid,
      "UNIQUE_ID": unique,
    }),
    success: function (data) {
      userComments = data.Data
      let userCommentHtml = '';
      if (userComments.length > 0) {
        $.each(userComments, function (l, comment) {
          console.log('comment - ', comment)
          userCommentHtml += `<div class="comments_data">
                    <div class="comments_name_stamp">
                      <div class="commented_user_name">${comment.COMMENTED_BY}</div>
                      <div class="commented_user_date">${convertStringToLocalTimeAndAgo(comment.COMMENTED_ON)}</div>
                    </div>
                    <div class="users_comments">
                      <div class="commented_user_comments">${formatCommentWithLineBreaks(comment.COMMENTS)}</div>
                    </div>
                  </div>`
        })
      } else {
        userCommentHtml = `<div class="comments_data">
                            <div class="commented_user_comments">No Comments</div>
                          </div>`
      }
      $("#user_comments_list").empty();
      $("#user_comments_list").html(userCommentHtml)
      console.log("data - " + JSON.stringify(data));
    },
    error: function (error) {
      console.log('message Error' + JSON.stringify(error));
    }
  });
}

function toggleComments(check) {
  if (userComments.length == 0 && check != 'load') {
    getCommentsData(load_sow_id, load_sow_unique_id);
  }
  const commentsSection = document.getElementById('comments_section');
  const toggleIcon = document.getElementById('toggle_icon');

  if (commentsSection.classList.contains('hidden')) {
    commentsSection.classList.remove('hidden');
    toggleIcon.classList.replace('fa-plus', 'fa-minus');
  } else {
    commentsSection.classList.add('hidden');
    toggleIcon.classList.replace('fa-minus', 'fa-plus');
  }
}

function validateCommentInput() {
  const commentTextarea = document.getElementById('sow_user_comments');
  const saveButton = document.getElementById('sow_comments_button');

  if (commentTextarea.value.trim() === '') {
    saveButton.disabled = true;
  } else {
    saveButton.disabled = false;
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function sendSowComments() {
  let userEnteredComments = $('#sow_user_comments').val();
  if (userEnteredComments != '') {
    $('#sow_comments_button').html('Saving...');  // Change button text to 'Saving...'
    $('#sow_comments_button').prop('disabled', true);  // Disable the button

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
    let comments_data = '{"SOW_ID":"' +
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
        "user_details": "[" + accessDetails + "]",
        "comments_data": "[" + comments_data + "]",
        "flag": "create"
      }),
      success: function (data) {
        if (data.Message === "Comments captured Successfully") {
          toastr.options.timeOut = 2000;
          toastr.success(data.Message);

          let userComments = data.Response.Data;
          let userCommentHtml = '';

          if (userComments.length > 0) {
            $.each(userComments, function (l, comment) {
              console.log('comment - ', comment);
              userCommentHtml += `
                <div class="comments_data">
                  <div class="comments_name_stamp">
                    <div class="commented_user_name">${comment.COMMENTED_BY}</div>
                    <div class="commented_user_date">${convertStringToLocalTimeAndAgo(comment.COMMENTED_ON)}</div>
                  </div>
                  <div class="users_comments">
                    <div class="commented_user_comments">${formatCommentWithLineBreaks(comment.COMMENTS)}</div>
                  </div>
                </div>`;
            });
          } else {
            userCommentHtml = `<div class="comments_data">
                                <div class="commented_user_comments">No Comments</div>
                              </div>`;
          }

          $("#user_comments_list").empty().html(userCommentHtml);
          $("#sow_user_comments").val('');
        } else {
          toastr.error(data.Message);
        }

        $('#sow_comments_button').html('Save');  // Reset button text
        $('#sow_comments_button').prop('disabled', true);  // Enable the button
      },
      error: function (error) {
        console.log('Error: ' + JSON.stringify(error));
        toastr.error('Error submitting comments.');
        $('#sow_comments_button').html('Save');  // Reset button text
        $('#sow_comments_button').prop('disabled', false);  // Enable the button
      }
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

function renew_button(obj) {
  clickRenewButton = obj
  $("#sow_edit").click()
  $("#funnel_name").html("Renewal");
  $("#funnel_options").val("Renewal");
  $("#probab_name").html("70");
  $("#probability_options").val("70");
  $("#sow_resource_bill").click()
  $('#billing_exp_div tbody tr').each(function () {
    let dataId = this.id
    dataId = dataId.replace("bill_persona_", "")
    $("#show_hide_bt_" + dataId).click();
  })
}
function assignSowData() {
  let hasErrorSow = false;
  $(".loader").css("display", "block");
  $(".show_page").css("display", "none");
  // $("#sow_renew").show()
  // $("#sow_edit").hide();
  localStorage.setItem("BackSowAccName", "");
  sowSelectedSource = localStorage.getItem("sow-click-source");
  if (sowSelectedSource == null || sowSelectedSource == "null") {
    sowSelectedSource = 'sow'
  }
  console.log('paramsArray assignSowData - ', paramsArray);
  let stored_url_data = "", url_sow_id = "", url_sow_unique = ""
  url_sow_unique = paramsArray[0]
  url_sow_id = paramsArray[1]
  load_sow_id = url_sow_id;
  load_sow_unique_id = url_sow_unique;
  getSowData(url_sow_id, url_sow_unique);
  getSowViewData();
  allcoationTabShowHide(sow_acc_data);
  console.log("comments_notes>>>>>", comments_notes);

  // getCommentsData(url_sow_id, url_sow_unique);
  // toggleComments('load');
  $("#probability_options").empty();
  $("#probability_options").append(probFilterOptions);
  $("#funnel_options").empty();
  $("#funnel_options").append(funnelOptHtml);
  $("#sow_options").empty();
  $("#sow_options").append(sowTypeOptHtml);
  $("#billing_options").empty();
  console.log("billingTypeHtml", billingTypeHtml);

  $("#billing_options").append(billingTypeHtml);
  $('#acc_growth_name').empty();
  $('#acc_growth_name').append(sow_acc_data.OPPORTUNITY_NAME);
  $('#acc_growth_name_option').val(sow_acc_data.OPPORTUNITY_OWNER_ID);
  $('#created_by_name').empty();
  $('#created_by_name').append(sow_acc_data.CREATED_USER == '' ? '-' : sow_acc_data.CREATED_USER);
  let growthOptHtml = ''
  $.each(opportunityOwnersJsonData, function (i, oppOption) {
    if (oppOption.EMPLOYEE_ID == sow_acc_data.OPPORTUNITY_OWNER_ID) {
      console.log('oppOption.EMPLOYEE_ID - ', oppOption.EMPLOYEE_ID, "and sow_acc_data.OPPORTUNITY_OWNER_ID - ", sow_acc_data.OPPORTUNITY_OWNER_ID)
      $.each(oppOption.REPORTING_EMPLOYEES, function (j, growthMang) {
        console.log('growthMang - ', growthMang)
        growthOptHtml += `<option value=${growthMang.REPORTING_EMPLOYEE_ID}>${growthMang.REPORTING_EMPLOYEE}</option>`
      })
    }
  })
  $('#growth_created_by_option').empty()
  $('#growth_created_by_option').append(growthOptHtml)
  $('#growth_created_by_option').val(sow_acc_data.CREATED_USER_ID);
  let team_size =
    parseInt(sow_acc_data.TOTAL_NUMBER_OF_RESOURCE)
  $("#acc_name_tit").html(sow_acc_data.ACCOUNT_NAME);
  $("#sow_name_tit").html(sow_acc_data.SOW_NAME);
  if (sowSelectedSource == "renew") {
    $("#sow_renew").show()
    $("#sow_edit").hide();
    $("#funnel_name").html("Renewal");
    $("#funnel_options").val("Renewal");
    $("#probab_name").html("70");
    $("#probability_options").val("70");
  } else {
    $("#sow_renew").hide()
    $("#sow_edit").show();
    $("#funnel_name").html(sow_acc_data.SOW_STAGE);
    $("#funnel_options").val(sow_acc_data.SOW_STAGE);
    $("#probab_name").html(sow_acc_data.PROBABILITY == '-1' ? '-  ' : sow_acc_data.PROBABILITY);
    $("#probability_options").val(sow_acc_data.PROBABILITY);
  }
  if (sow_acc_data.SOW_STAGE == "Lead" || sow_acc_data.SOW_STAGE == "Scout") {
    $('.prob_imp').hide();
    $('.sow_type_imp').hide();
    $('.billing_imp').hide();
    // $('.opp_name_imp').hide();
  } else {
    $('.prob_imp').show();
    $('.sow_type_imp').show();
    $('.billing_imp').show();
    // $('.opp_name_imp').show();
  }
  console.log("sow_acc_data", sow_acc_data);
  $("#sow_type_name").html(sow_acc_data.SOW_TYPE == '-1' ? '-  ' : sow_acc_data.SOW_TYPE);
  $("#billing_type_name").html(sow_acc_data.PRICING_PLAN == '-1' ? '-  ' : sow_acc_data.PRICING_PLAN);
  $("#sow_options").val(sow_acc_data.SOW_TYPE);
  $("#billing_options").val(sow_acc_data.PRICING_PLAN);
  $("#uscan_size").val(sow_acc_data.NUMBER_OF_RESOURCE_US);
  $("#ind_size").val(sow_acc_data.NUMBER_OF_RESOURCE_IND);
  $("#buying_center").html((sow_acc_data.BUYING_CENTRE == '-1' || sow_acc_data.BUYING_CENTRE == 'undefined') ? '' : sow_acc_data.BUYING_CENTRE);
  $("#nps_stakholder").html((sow_acc_data.NPS_STAKEHOLDER == '-1' || sow_acc_data.NPS_STAKEHOLDER == 'undefined') ? '' : sow_acc_data.NPS_STAKEHOLDER);
   // Populate NPS Stakeholder details
   var $container = $("#nps_stakeholder_details_container");
   $container.empty();
   var stakeholderData = npsStakeholderDataGlobal;
   console.log("stakeholderData", stakeholderData);
   if (stakeholderData && Array.isArray(stakeholderData) && stakeholderData.length > 0) {
     stakeholderData.forEach(function (s) {
       var itemHtml = '<div class="nps-stakeholder-detail-item">' +
         '<div class="stakeholder-info">' +
           '<div class="stakeholder-name">' + (s.name || s.stakeholder_name || '') + '</div>' +
         '</div>' +
       '</div>';
       $container.append(itemHtml);
     });
     $container.show();
   }else {
     $container.html('<span class="span_font_weight_new">N/A</span>').show();
   }
  let projAmount = sow_acc_data.PROJ_AMOUNT;

  // Check if the value is empty or invalid, and default to 0
  projAmount = projAmount === "" ? 0 : Math.round(Number(projAmount));

  // Set the formatted value to the input field
  $("#proj_amount").val(projAmount.toLocaleString());


  console.log("team_size", team_size);

  $("#new_team").val(team_size);
  $("#sowNameID").html(sow_acc_data.SOW_ID);
  $("#legal_start_date").val(convert(sow_acc_data.LEGAL_START_DATE));
  $("#legal_end_date").val(convert(sow_acc_data.LEGAL_END_DATE));
  localStorage.setItem("sowAccName", sow_acc_data.ACCOUNT_NAME);
  localStorage.setItem("sowAccId", sow_acc_data.SOW_ID);

  let accessLevel = checkEachPageAccess("Revenue")
  let pageLevelAccess = accessLevel[1]
  let eachLevel = pageLevelAccess.split(',')
  console.log("eachLevel - ", eachLevel)
  if (sowSelectedSource == "sow") {
    if (sow_acc_data.SOW_STAGE == "Signed") {
      $.each(eachLevel, function (l, level) {
        switch (level) {
          case "view":

            $("#sow_renew").hide()
            break;
          case "edit":
            if (sowSelectedSource == "renew") {
              $("#sow_renew").show()
            }
            break;
        }
      })
    } else {
      $("#sow_renew").hide()
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
  //   `${sow_acc_data.UNIQUE_ID.replace(
  //     / /g,
  //     "+"
  //   )}&${sow_acc_data.SOW_ID.replace(/ /g, "+")}`
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
  let sowName = sow_acc_data.SOW_NAME;
  let sowId = sow_acc_data.SOW_ID
  let actualHtml = "";
  let actualAmtFound = false;
  let projectedAmtFound = false;
  let projectHtml = "";
  sow_amount_temp = Math.round(sow_amount).toLocaleString()
  $("#sow_amount").val(Math.round(sow_amount).toLocaleString());
  if (actualAmtFound && projectedAmtFound) {
    $(".extra_br").hide();
  }

  let billing_rate = sow_acc_data.BILLING_RATE_DATA || [];
  $("#billing_exp_div tbody").empty();
  let personaStatus = false;
  if (billing_rate.length > 0) {
    let usTeam = 0;
    let indiaTeam = 0;
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
      let actualStartDate = $("#actual_start_date").val();
      let actualEndDate = $("#actual_end_date").val();
      let SkillDataAssign = skillData.split(",");
      SkillDataAssign = SkillDataAssign.map((el) => el.trim());
      console.log("SkillDataAssign", SkillDataAssign);

      let personaSKill = rateCard.SKILLS_PERSONA;
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
      console.log("skillData", skillData);

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

      let sowNameClass = $("#sowNameID").html().trim().replace(/ /g, "_");
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
            otherPersona
          );
          $("#billing_exp_div").append(bill_html);
          $(`#bill_select_${size}`).val(billStatusVal);
          $(`#loc_select_${size}`).val(locationName);
          $(`#persona_select_${size}`).val(personaSKill);
          $("#s2id_persona_skill_" + size).val(skillData)


          $("#start_date_input_" + size).datepicker({
            format: "mm-dd-yy",
            uiLibrary: "bootstrap",
          });
          $("#end_date_input_" + size).datepicker({
            format: "mm-dd-yy",
            uiLibrary: "bootstrap",
          });
          $(".input-group-addon").hide();

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
              0
            );
            $("#billing_exp_div").append(bill_html);
            $(`#bill_select_${size}`).val("Billed");
            $(`#loc_select_${size}`).val("US");
            $(`#persona_select_${size}`).val("TBD");
            $("#s2id_persona_skill_" + size).val(skillData);

            $(`#persona_select_${size}`).select2({
            })
            $("#start_date_input_" + size).datepicker({
              format: "mm-dd-yy",
              uiLibrary: "bootstrap",
            });
            $("#end_date_input_" + size).datepicker({
              format: "mm-dd-yy",
              uiLibrary: "bootstrap",
            });
            $(".input-group-addon").hide();
            $("#persona_skill_" + size).select2({
              placeholder: "Select Skills",
            });
            $("#persona_skill_" + size)
              .val(SkillDataAssign)
              .trigger("change");
            // $("#s2id_persona_skill_" + size).hide();
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
              0
            );
            $("#billing_exp_div").append(bill_html);
            $(`#bill_select_${size}`).val("Billed");
            $(`#loc_select_${size}`).val("INDIA");
            $(`#persona_select_${size}`).val("TBD");
            $("#s2id_persona_skill_" + size).val(skillData);

            $(`#persona_select_${size}`).select2({
            })
            $("#start_date_input_" + size).datepicker({
              format: "mm-dd-yy",
              uiLibrary: "bootstrap",
            });
            $("#end_date_input_" + size).datepicker({
              format: "mm-dd-yy",
              uiLibrary: "bootstrap",
            });
            $(".input-group-addon").hide();
            $("#persona_skill_" + size).select2({
              placeholder: "Select Skills",
            });
            $("#persona_skill_" + size)
              .val(SkillDataAssign)
              .trigger("change");
            // $("#s2id_persona_skill_" + size).hide();
          }
        }
      }
    });
  } else {
    let locat_class = "us_bill_table";
    let bill_status_class = "billed_sow_table";
    let billStatusVal = "Billed";
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
          0
        );
        $("#billing_exp_div").append(bill_html);
        $(`#bill_select_${size}`).val(billStatusVal);
        $(`#loc_select_${size}`).val("US");
        $(`#persona_select_${size}`).val("TBD");
        $(`#persona_select_${size}`).select2({})
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
        $("#persona_skill_" + size).select2({
          placeholder: "Select Skills",
        });
        // $("#s2id_persona_skill_" + size).hide();
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
          0
        );
        $("#billing_exp_div").append(bill_html);
        $(`#bill_select_${size}`).val(billStatusVal);
        $(`#loc_select_${size}`).val("INDIA");
        $(`#persona_select_${size}`).val("TBD");
        $(`#persona_select_${size}`).select2({})
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
        $("#persona_skill_" + size).select2({
          placeholder: "Select Skills",
        });
        // $("#s2id_persona_skill_" + size).hide();
      }
    }
  }
  checkEditAccess();
  $(".resourceDate").datepicker({
    format: "mm-dd-yy",
    uiLibrary: "bootstrap",
  });
  appendSowAndProj()
  localStorage.setItem("sowSelectedSource", sowSelectedSource)
  if (sowSelectedSource == "renew") {
    $("#sow_renew").show()
    $("#sow_edit").hide();
    $("#sow_resource_bill").click()
    $('#billing_exp_div tbody tr').each(function () {
      let dataId = this.id
      dataId = dataId.replace("bill_persona_", "")
      $("#show_hide_bt_" + dataId).click();
    })
  }
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

  if (!hasErrorSow) {
    $(".loader").css("display", "none");
    $(".show_page").css("display", "block");
  }
}

function appendSowAndProj() {
  calculateSowAmount("getProjected")
}

function getCreatedByname() {
  let selectedOppOwnername = $('#acc_growth_name_option').val();
  console.log('selectedOppOwnername - ', selectedOppOwnername);
  console.log('opportunityOwnersJsonData - ', opportunityOwnersJsonData)
  $('#growth_created_by_option').empty()
  let reportingbyHtml = "";
  $.each(opportunityOwnersJsonData, function (i, oppOwn) {
    if (oppOwn.EMPLOYEE_ID == selectedOppOwnername) {
      $.each(oppOwn.REPORTING_EMPLOYEES, function (j, reportEmp) {
        reportingbyHtml += `<option value=${reportEmp.REPORTING_EMPLOYEE_ID}>${reportEmp.REPORTING_EMPLOYEE}</option>`
      })
    }
  })
  $('#growth_created_by_option').append(reportingbyHtml);
  $('#created_by_name').empty()
  $('#created_by_name').append($('#growth_created_by_option').val())
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
console.log(convert("Mon, 11 Nov 2013 00:00:00 GMT"));

function createDiv(data, value) {
  let hoverValue = "";
  if (data != "-") {
    hoverValue = `<div class="SerialNumberTooltip">${value}</div>`;
  }
  return `<div class="SerialNumberContainer">
              <div class="SerialNumber">${data}</div>
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
  $(button).find("i").remove();
  let resourceNumber = $(button)
    .closest("tr")
    .children("td:eq(0)")
    .text()
    .trim();
  resourceNumber = resourceNumber.replace("Resource ", "");
  if ($(button).text().trim() == "Edit") {
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
    $("#persona_skill_" + resourceNumber).show();
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
  // Redirect to sowEditbckv1.html
  window.location.href = 'sowEdit.html?' + paramsArray[0] + '&' + paramsArray[1];
  checkEditAccess();
}

let clickRenewButton = ""
function renew_button(obj) {
  clickRenewButton = obj
  $("#sow_edit").click()

  // $("#sow_edit").click()
  $("#funnel_name").html("Renewal");
  $("#funnel_options").val("Renewal");
  $("#probab_name").html("70");
  $("#probability_options").val("70");
  $("#sow_resource_bill").click()
  $('#billing_exp_div tbody tr').each(function () {
    let dataId = this.id
    dataId = dataId.replace("bill_persona_", "")
    $("#show_hide_bt_" + dataId).click();
  })
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
      let takeApprovalResponse = "Yes"; approverName = ""
      if (result) {

        let today = new Date();
        let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let CurrentDateTime = date + ' ' + time;
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
  let persona_class = "persona_button";
  let locat_class = "us_bill_table";
  let bill_status_class = "billed_sow_table";
  let tb = $("#billing_exp_div:eq(0) tbody");
  let sowNameClass = $("#sowNameID").html().trim().replace(/ /g, "_");
  let lastClass = $("#billing_exp_div tr:last").attr("class");
  let size = 0;
  if (lastClass != undefined) {
    lastClass = lastClass.replace(sowNameClass, "");
    lastClass = lastClass.replace("_", "");
    size = parseInt(lastClass, 10) + 1;
  } else {
    size = 1;
  }
  let actualStartDate = $("#actual_start_date").val();
  let actualEndDate = $("#actual_end_date").val();
  let addSkillHtml = `<tr class="${sowNameClass}_${size} persona_table_details" id="bill_persona_${size}">
                        <td style="display:none" id="res_number_${size}">Resource ${size}</td>
                        <td  class="persona_skills_td" id="persona_details_${size}">
                          <div class="${persona_class}" id="persona_text_${size}" style="display:none">
                              ${createDiv("-", "")}
                          </div>
                          <select  id="persona_select_${size}" onchange="calculateSowAmount(this)">
                            ${personaOpt}
                          </select>
                          <div id="tooltip_${size}" class="custom-tooltip"></div>
                        </td>
                        <td  class="persona_skills_td" id="skills_details_${size}">
                            <select class="skillDataOpt" id="persona_skill_${size}" multiple>
                                ${skillOptionsHtml}
                              </select>
                        </td>                        
                        <td>
                          <span id="start_date_${size}" style="display:none">

                          </span>
                          <input type="text" class="form-control placeicon dateData resourceDate" 
                            id="start_date_input_${size}"
                            placeholder="&#xf073; MM-DD-YY" 
                            name="resource_start_date" 
                            autocomplete="off" 
                            style="z-index: 1;" onchange="calculateSowAmount(this)" value="${actualStartDate}"/>

                        </td>
                        <td>
                          <span id="end_date_${size}" style="display:none">
                           
                          </span>
                          <input type="text" class="form-control placeicon dateData resourceDate" 
                            id="end_date_input_${size}"
                            placeholder="&#xf073; MM-DD-YY" 
                            name="resource_end_date" 
                            autocomplete="off" 
                            style="z-index: 1;"  onchange="calculateSowAmount(this)" value="${actualEndDate}"/>
                        </td>
                        <td>
                          <span id="bill_days_${size}">0</span>
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
                          <input type="number" class="form-control text_center" id="bill_us_rate_${size}" placeholder="Bill US"   onchange="calculateSowAmount(this)" min=0 value=0 />
                        </td>
                        <td>
                          <span id="bill_ind_${size}"  style="display:none">
                            
                          </span>
                          <input type="number" class="form-control text_center" id="bill_ind_input_${size}" placeholder="Bill Ind"  onchange="calculateSowAmount(this)" min=0 value=0 /></td>
                        </td>
                        <td>
                          <span id="bill_days_${size}">0</span>
                        </td>
                        <td>
                          <span id="bill_amount_${size}">$0</span>
                        </td>
                        
                      </tr>`;
  $("#billing_exp_div").append(addSkillHtml);
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
  $("#persona_select_" + size).select2({
  })
  $("#persona_skill_" + size).select2({
    placeholder: "Select Skills",
  });
}

function locSowAmount(button) {
  let resourceNumber = $(button)
    .closest("tr")
    .children("td:eq(0)")
    .text()
    .trim();
  resourceNumber = resourceNumber.replace("Resource ", "");
  let loc_status = "#loc_select_" + resourceNumber;
  loc_status = $(loc_status).val();
  if (loc_status == "US") {
    $("#bill_us_rate_" + resourceNumber).val(bill_us_default);
  } else if (loc_status == "India" || loc_status == "INDIA") {
    $("#bill_us_rate_" + resourceNumber).val(bill_ind_default);
  }
}

function checkEditAccess() {
  let editStatus = $("#sow_edit").text().trim();
  console.log("editStatus", editStatus);

  if (editStatus == "Edit") {
    $(".edit_disable").attr("disabled", true);
    $("#funnel_options").hide();
    $("#sow_options").hide();
    $("#billing_options").hide();
    $("#probability_options").hide();
    $('#acc_growth_name').show();
    $('#acc_growth_name_option').hide();
    $('#growth_created_by_option').hide();
    $('#created_by_name').show();
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
  } else if (editStatus == "Update") {
    $(".edit_disable").attr("disabled", false);
    $("#funnel_options").show();
    $("#sow_options").show();
    $("#buying_center").show();
    $("#nps_stakholder").show();
    $("#probability_options").show();
    $("#billing_options").show();
    $('#acc_growth_name').hide();
    $('#acc_growth_name_option').show();
    $('#growth_created_by_option').show();
    $('#created_by_name').hide();
    if (sow_acc_data.SOW_STAGE == "Signed") {
      $("#funnel_name").show();
      $("#funnel_options").hide();
      $("#probab_name").show();
      $("#probability_options").hide();
    } else {
      $("#funnel_name").hide();
      $("#funnel_options").show();
      $("#probab_name").hide();
      $("#probability_options").show();
    }
    $("#sow_type_name").hide();
    $("#billing_type_name").hide();
  }
}

function getSowViewData() {
  let apiURL = apiValue.url.replace("/app", "/sow_input_drop_down");
  let empId = localStorage.getItem('EmpUserID');
  let emp_email = localStorage.getItem('email');
  let emp_dep = localStorage.getItem('Department');
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
      flag: 'true'
    }),
    success: function (data) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(loadTimeInSeconds, "SowCreate", "Revenue", "sow_input_drop_down", "success", fileName, "SowCreate", "view");
      $("#funnel_options").empty();
      $("#sow_options").empty();
      $("#billing_options").empty();
      funnelOptHtml = "";
      billingTypeHtml = "";
      sowTypeOptHtml = "";
      sowDropDownJson = data[0];
      console.log('sowDropDownJson - ',sowDropDownJson)
      let bu_head_name_html = "";
      defaultBillArr = sowDropDownJson.DEFAULT_BILLRATE;
      bill_us_default = sowDropDownJson.DEFAULT_BILLRATE_US;
      bill_ind_default = sowDropDownJson.DEFAULT_BILLRATE_IND;
      let growthLedOptHtml = "", growthReportMangHtml = "";
      deliveryMembers = sowDropDownJson.DELIVERY_MEMBERS;
      growthMembers = sowDropDownJson.OPPORTUNITY_OWNERS;
      opportunityOwnersJsonData = sowDropDownJson.GROWTH_EMPLOYEE_DATA_NEW;
      $.each(sowDropDownJson.GROWTH_EMPLOYEE_DATA_NEW, function (i, growth) {
        let reporting_emp = growth.REPORTING_EMPLOYEES
        growthLedOptHtml += `<option value='${growth.EMPLOYEE_ID}'>${growth.EMPLOYEE_NAME}</option>`;
        // $.each(reporting_emp, function (i, reportMang) {
        //   growthReportMangHtml += `<option value='${reportMang.EMPLOYEE_ID}'>${reportMang.EMPLOYEE_NAME}</option>`;
        // });
      })
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

      $.each(sowDropDownJson.PROJECT_TYPE, function (i, sowTypeOpt) {
        sowTypeOptHtml += `<option value="${sowTypeOpt}">${sowTypeOpt}</option>`;
      });
      $("#sow_options").append(sowTypeOptHtml);
      $.each(sowDropDownJson.SKILL_LEVEL, function (i, skillOpt) {
        skillOptionsHtml += `<option value="${skillOpt}">${skillOpt}</option>`;
      });
      $.each(sowDropDownJson.BILLING_MODE_NAME, function (i, billingOpt) {
        billingTypeHtml += `<option value="${billingOpt}">${billingOpt}</option>`;
      });
      $("#billing_options").append(billingTypeHtml);
      $.each(sowDropDownJson.EMPLOYEE_DATA, function (i, empData) {
        bu_head_name_html += `<option value='${empData.EMPLOYEE_ID}'>${empData.EMPLOYEE_NAME}</option>`;
      });
      $("#sow_del_head").append(`<option value='-1'>Select </option>` + bu_head_name_html);
      let deliveryHeadName = sow_acc_data.DELIVERY_HEAD_NAME
      if (deliveryHeadName == 'Select ' || deliveryHeadName == '') {
        deliveryHeadName = ""
      }
      $("#delivery_head_name").empty()
      $("#delivery_head_name").append(deliveryHeadName == "" ? "N/A" : deliveryHeadName)
      let sowDel = (sow_acc_data.DELIVERY_HEAD == "" ? "-1" : sow_acc_data.DELIVERY_HEAD)
      $("#sow_del_head").val(sowDel);
      $("#sow_del_head").select2({});
      $("#sow_program_head").append(`<option value='-1'>Select </option>` + bu_head_name_html);
      let programLeadName = sow_acc_data.PROGRAM_LEAD_NAME;
      if (programLeadName == 'Select ' || programLeadName == 'Select') {
        programLeadName = ""
      }
      $("#program_head_name").empty()
      $("#program_head_name").append(programLeadName == "" ? "N/A" : programLeadName)
      let sowProg = (sow_acc_data.PROGRAM_LEAD == "" ? "-1" : sow_acc_data.PROGRAM_LEAD)
      $("#sow_program_head").val(sowProg);
      $("#sow_program_head").select2({});
      $("#sow_project_head").append(`<option value='-1'>Select </option>` + bu_head_name_html);
      let prjctLeadName = sow_acc_data.PROJECT_LEAD_NAME
      if (prjctLeadName == 'Select ' || prjctLeadName == 'Select') {
        prjctLeadName = ""
      }
      $("#project_head_name").empty()
      $("#project_head_name").append(prjctLeadName == "" ? "N/A" : prjctLeadName)
      let sowProj = (sow_acc_data.PROJECT_LEAD == "" ? "-1" : sow_acc_data.PROJECT_LEAD)
      $("#sow_project_head").val(sowProj);
      $("#sow_project_head").select2({});
      $(".edit_head_data").hide();

      let headButtonAcc = false;
      let getUserRole = localStorage.getItem('user-role')

    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(loadTimeInSeconds, "SowCreate", "Revenue", "sow_input_drop_down", "error", fileName, "SowCreate", "view");
      console.log("message Error" + JSON.stringify(error));
      hasErrorSow = true;
      toastr.error("Error loading dropdown data");
      $(".loader").css("display", "none");
    },
  });
}

function sowUpdateData(updateData) {

  let resUpdateData = "",
    resShowData = "";
  let updateAcc = $("#acc_name_tit").html();
  let updateSow = $("#sow_name_tit").html();
  updateSow = updateSow.replace("&amp;", "&");
  let updateFunnel = $("#funnel_options option:selected").val();
  let updateProb = $("#probability_options option:selected").val();
  let updateSowType = $("#sow_options option:selected").val();
  let updateBillingType = $("#billing_options option:selected").val();
  let updateTeamSize = $("#team_size_val").val();
  let updateUsCount = $("#uscan_size").val();
  let updateIndCount = $("#ind_size").val();
  let updateLegStart = convertDate($("#legal_start_date").val());
  let updateLegEnd = convertDate($("#legal_end_date").val());
  let updateBillStart = convertDate($("#billing_start_date").val());
  let updateBillEnd = convertDate($("#billing_end_date").val());
  let updateActStart = convertDate($("#actual_start_date").val());
  let updateActEnd = convertDate($("#actual_end_date").val());
  let updateSowAmount = $("#sow_amount").val().replace(/,/g, "");
  updateSowAmount = parseInt(updateSowAmount, 10);
  let updateGrowthLeaderId = $("#acc_growth_name_option option:selected").val();
  let updateGrowthLeaderName = $("#acc_growth_name_option option:selected").text();
  let createdByOwnerId = $("#growth_created_by_option option:selected").val();
  let createdByOwnerName = $("#growth_created_by_option option:selected").text();
  let takeApprovalResponse = "No";
  let approverName = [];
  let UserIDheadFlag = false;
  let sowStageFlag = false;
  let sowAmtFlag = false;
  let billRateFlag = false;
  let sowEditBusRule = [];
  var tableArr = [];
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

  var table = $("#billing_exp_div tbody");
  let resCountUs = 0;
  let resCountInd = 0;
  let locationValFlag = false;
  let resDetailsNewArray = [];
  let resDetailsOldArray = [];
  table.find("tr").each(function (i) {
    var $tds = $(this).find("td"),
      rResource = $tds.eq(0).text(),
      rLocation = $tds.eq(4).find(":selected").val(),
      rStartDate = $tds.eq(2).find("input").val(),
      rEndDate = $tds.eq(3).find("input").val(),
      rBillStatus = $tds.eq(5).find(":selected").val(),
      rBillRate = $tds.eq(6).find("input").val(),
      rCount = $tds.eq(7).find("input").val();
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
    if (rLocation == "-1") {
      toastr.options.timeOut = 2000; // 2s
      toastr.error(
        "One of the location is not selected, Please select location"
      );
      return false;
    } else if (rBillRate == "") {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Billing is empty, Please enter a value");
      return false;
    } else if (startDateNotEmpty) {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Please select resource start date");
      return false;
    } else if (endDateNotEmpty) {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Please select resource end date");
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
      resUpdateData =
        resUpdateData +
        '{ "RESOURCE_GROUP" : "' +
        rResource +
        '", "SKILLS_PERSONA":"' +
        rPerosna +
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
        '", "SKILL_DATA": [' +
        skillUpdatedData +
        "]},";

      tableArr.push({
        RESOURCE_GROUP: rResource,
        SKILLS_PERSONA: rPerosna,
        LOCATION: rLocation,
        START_DATE: rStartDate,
        END_DATE: rEndDate,
        COUNT: rCount,
        BILLING_STATUS: rBillStatus,
        BILLING_RATE: rBillRate,
        SKILL_DATA: [skillUpdatedData],
      });
    }
  });
  if (resUpdateData.endsWith(",")) {
    resUpdateData = resUpdateData.slice(0, -1);
  }
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
      '", "LOCATION":"' +
      billData.LOCATION +
      '", "START_DATE":"' +
      removeDateHrs(billData.START_DATE) +
      '", "END_DATE":"' +
      removeDateHrs(billData.END_DATE) +
      '", "COUNT":"' +
      billData.COUNT +
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
  let sow_new_data =
    '{ "ACCOUNT_NAME" : "' +
    updateAcc +
    '", "ACCOUNT_ID":"' +
    sow_acc_data.ACCOUNT_ID +
    '", "SOW_NAME":"' +
    updateSow +
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
    updateUsCount +
    '", "NUMBER_OF_RESOURCE_IND":"' +
    updateIndCount +
    '", "BILLING_MODEL":"' +
    updateBillingType +
    '", "SOW_AMOUNT":' +
    parseInt(updateSowAmount, 10) +
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
    '", SOW_AMOUNT:' +
    parseInt(updateSowAmount, 10) +
    ', SOW_TYPE:"' +
    updateSowType +
    '", BILLING_RATE_DATA:[' +
    resShowData +
    "]}";
  const myJSON = JSON.stringify(show_updated_data);
  localStorage.setItem("updatedJSON", myJSON);
  let sow_old_data =
    '{ "ACCOUNT_NAME" : "' +
    sow_acc_data.ACCOUNT_NAME +
    '", "ACCOUNT_ID":"' +
    sow_acc_data.ACCOUNT_ID +
    '", "SOW_NAME":"' +
    updateSow +
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
    '", "BILLING_MODEL":"' +
    sow_acc_data.PRICING_PLAN +
    '", "SOW_AMOUNT_USER_EDIT":"' +
    sow_amount_user_edit +
    '", "SOW_AMOUNT":' +
    parseInt(sow_acc_data.SOW_AMOUNT, 10) +
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

  let updateSowData = {
    query_type: "edit_sow_new_UI",
    environment: apiValue.environment,
    user_details: "[" + accessDetails + "]",
    APPROVAL_DATA: "[" + approvalData + "]",
    sow_skills_bill_data: "[" + resUpdateData + "]",
    sow_data: "[" + sow_new_data + "]",
    old_sow_data: "[" + sow_old_data + "]",
  };
  updateTeamSize = parseInt(updateTeamSize, 10);
  updateUsCount = parseInt(updateUsCount, 10);
  updateIndCount = parseInt(updateIndCount, 10);
  let totalResCount = resCountUs + resCountInd;
  if (locationValFlag) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please choose a location under Persona details.");
    return false;
  }
  let change = true;
  if (updateFunnel != sow_acc_data.SOW_STAGE) {
    change = false;
  } else if (updateLegStart != sow_acc_data.LEGAL_START_DATE) {
    change = false;
  } else if (updateLegEnd != sow_acc_data.LEGAL_END_DATE) {
    change = false;
  } else if (updateBillStart != sow_acc_data.BILLING_START_DATE) {
    change = false;
  } else if (updateBillEnd != sow_acc_data.BILLING_END_DATE) {
    change = false;
  } else if (updateActStart != sow_acc_data.ACTUAL_START_DATE) {
    change = false;
  } else if (updateActEnd != sow_acc_data.ACTUAL_END_DATE) {
    change = false;
  } else if (updateProb != sow_acc_data.PROBABILITY) {
    change = false;
  } else if (updateTeamSize != sow_acc_data.TOTAL_NUMBER_OF_RESOURCE) {
    change = false;
  } else if (updateUsCount != sow_acc_data.NUMBER_OF_RESOURCE_US) {
    change = false;
  } else if (updateIndCount != sow_acc_data.NUMBER_OF_RESOURCE_IND) {
    change = false;
  } else if (updateBillingType != sow_acc_data.PRICING_PLAN) {
    change = false;
  } else if (
    parseInt(updateSowAmount, 10) != parseInt(sow_acc_data.SOW_AMOUNT, 10)
  ) {
    change = false;
  } else if (updateSowType != sow_acc_data.SOW_TYPE) {
    change = false;
  } else if (old_billing_rate != resUpdateData) {
    change = false;
  }

  if (old_billing_rate != resUpdateData) {
    console.log("resource data changed");
  } else {
    console.log("resource data no changes");
  }

  if (change == false) {
    $('#sow_head_button').prop("disabled", true);
    $("#sow_renew").prop('disabled', true);
    $("#sow_edit").prop("disabled", true).html("Processing...");
    let apiURL = apiValue.url.replace("/app", "/edit_sow_new_UI");
    // ajax call to update the sow details -----------------------------------
    $.ajax({
      url: apiURL,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      format: "json",
      data: JSON.stringify(updateSowData),
      success: function (json) {
        if (json.Message == "Success") {
          toastr.options.timeOut = 2000; // 2s
          toastr.success(json.Response);
          if (json.Response == "Updated successfully, Sent for approval & Approver notified" || json.Response == "Updated successfully, Sent for approval & Approver notification failed") {
            window.location.href = "workflowDetails.html";
          } else {
            let updateSowData = json.Data;
            $("#sow_edit").html(" Edit");
            assignSowData();
          }
        } else {
          toastr.options.timeOut = 2000; // 2s
          toastr.error(json.Message);
        }
        $("#sow_edit").prop("disabled", false).html(" Edit");
        $("#sow_renew").prop('disabled', false);
        $('#sow_head_button').prop("disabled", false);
      },
      error: function (error) {
        toastr.options.timeOut = 2000; // 2s
        toastr.success("Message error" + JSON.stringify(error));
        $("#sow_edit").prop("disabled", false).html(" Edit");
        $("#sow_renew").prop('disabled', false);
        $('#sow_head_button').prop("disabled", false);
      },
    });
    //Ajax ended here -------------------------------------------------------
  } else {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("No changes found in SOW");
    $("#sow_edit").click();
    $("#sow_edit").prop("disabled", false).html("Edit");
    $("#sow_renew").prop('disabled', false);
    $('#sow_head_button').prop("disabled", false);
  }
}
function calculateSowAmount123(obj) {
  let resourceNumber = $(obj).closest("tr").children("td:eq(0)").text().trim();
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
      $("#sow_amount").val(sowAmount.toLocaleString());
    });
  }
}

function calculateSowAmount(obj) {
  const existingSowAmount = $("#sow_amount").val();
  const existingProjAmount = $("#proj_amount").val();
  let tb = $("#billing_exp_div:eq(0) tbody");
  let size = tb.find("tr").length;
  let sowAmount = 0;
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
            $("#billing_type_name").text() == "Performance Based"
          ) {
            let newTempValue = fixedRateCal(startDate, endDate, billRate, location_class);
            newTempValue = newTempValue.split(",")
            console.log("newTempValue - ", newTempValue)
            tempSowAmt = newTempValue[0] * count;
            $("#bill_days_" + resourceNumber).empty()
            $("#bill_amount_" + resourceNumber).empty()
            $("#bill_days_" + resourceNumber).append(newTempValue[1])
            $("#bill_amount_" + resourceNumber).append("$" + (newTempValue[2] * count).toLocaleString())
          } else if ($("#billing_type_name").text() == "Time and Material") {
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
            }
          } else {
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

            console.log("SOW amount and Projected amount retained as they are for Fixed Price.");

            return;
          }
          sowAmount += tempSowAmt;
        }
      }
      if (obj != "getProjected") {
        $("#sow_amount").val(Math.round(sowAmount).toLocaleString());
      }
      project_amount = Math.round(sowAmount).toLocaleString()
      projectHtml =
        ", Projected Amount - <b>$ " + project_amount.toLocaleString() + "</b>";
      projectedAmtFound = true;
      $("#sowAmountTitle").html(
        "SOW Amount - <b>$ " +
        sow_amount_temp +
        "</b>" +
        projectHtml
      );

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
  let size = tb.find("tr").length;
  let resourceNumber = $(obj).closest("tr").children("td:eq(0)").text().trim();
  resourceNumber = resourceNumber.replace("Resource ", "");
  let sowTitleName = $("#sowNameID").html().trim().replace(/ /g, "_");
  sowTitleName = sowTitleName + "_" + resourceNumber;
  $("." + sowTitleName).remove();
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
  let accountName = $("#acc_name_tit").html();
  let sowName = $("#sow_name_tit").html();
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
    ', "ACCOUNT_NAME":\"' +
    accountName +
    '\", "SOW_NAME":\"' +
    sowName +
    '\", "INVOICE_YEAR":"' +
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

function showTooltip(id) {
  const tooltip = document.getElementById(`tooltip_${id}`);
  if (tooltip) {
    tooltip.style.display = 'block';
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
) {
  return `<tr class="${sowId.replace(/ /g, "_")}_${i} persona_table_details" id="bill_persona_${i}">
                                  <td style="display:none" id="res_number_${i}">Resource ${i}</td>
                                  <td class="persona_skills_td" id="persona_details_${i}" 
                                      onmouseover="showTooltip('${i}')" 
                                      onmouseout="hideTooltip('${i}')">
                                    <div class="${persona_class}" id="persona_text_${i}">
                                      ${createDiv(personaSKill, skillData)}
                                    </div>
                                    <select id="persona_select_${i}" style="display:none" onchange="calculateSowAmount(this)">
                                      ${personaOpt}
                                    </select>
                                    ${otherPersonaData ? `<div id="tooltip_${i}" class="custom-tooltip" style="display:none; position:absolute;">
                                      ${otherPersonaData}
                                    </div>` : ''}
                                  </td>
                                  <td style="display:none">
                                    <span 
                                      id="persona_skill_${i}" 
                                      class="form-control skillDataOpt" 
                                      style="white-space: normal; word-wrap: break-word !important; overflow-wrap: break-word !important; display: inline;">
                                      ${skillData || "No Skills Assigned"}
                                    </span>
                                  </td>
                                  <td>
                                    <span id="start_date_${i}" class="select_persona">
                                      ${startDate == "" ? "-" : startDate}
                                    </span>
                                    <input type="text" class="form-control placeicon dateData resourceDate" 
                                      id="start_date_input_${i}"
                                      placeholder="&#xf073; MM-DD-YY" 
                                      name="resource_start_date" 
                                      autocomplete="off" 
                                      style="z-index: 1;display:none" value="${startDate}" onchange="calculateSowAmount(this)"/>
                                  </td>
                                  <td>
                                    <span id="end_date_${i}" class="select_persona">
                                      ${endDate == "" ? "-" : endDate}
                                    </span>
                                    <input type="text" class="form-control placeicon dateData resourceDate" 
                                      id="end_date_input_${i}"
                                      placeholder="&#xf073; MM-DD-YY" 
                                      name="resource_end_date" 
                                      autocomplete="off" 
                                      style="z-index: 1;display:none" value="${endDate}" onchange="calculateSowAmount(this)"/>
                                  </td>
                                   <td>
                                    <span id="bill_days_${i}" class="select_persona">${days}</span>
                                  </td>
                                  <td>
                                    <span class="${locat_class} select_persona" id="loc_text_${i}">
                                      ${locationName == "" ? "-" : locationName}
                                    </span>
                                    <select class="form-control text_center select_persona" id="loc_select_${i}" style="display:none" onchange="locSowAmount(this)">
                                      ${locationOpt}
                                    </select>
                                  </td>
                                  <td>
                                    <span class="${bill_status_class} select_persona" id="bill_status_${i}">
                                      ${billStatusVal == ""
      ? "Billed"
      : billStatusVal
    }
                                    </span>
                                    <select class="form-control text_center select_persona" id="bill_select_${i}" style="display:none" onchange="calculateSowAmount(this)">
                                      ${billingOpt}   
                                    </select>
                                  </td>
                                  <td>
                                    <span class="select_persona" id="bill_us_${i}">${billRateUsd == "" ? "-" : billRateUsd
    }</span>
                                    <input type="number" class="form-control text_center" id="bill_us_rate_${i}" placeholder="Bill US" value="${billRateUsd}" style="display:none" onchange="calculateSowAmount(this)"/>
                                  </td>
                                  <td>
                                    <span id="bill_ind_${i}" class="select_persona">${resCount}</span>
                                    <input type="number" class="form-control text_center" id="bill_ind_input_${i}" placeholder="Bill Ind" value="${resCount}" style="display:none" onchange="calculateSowAmount(this)"/></td>
                                  </td>
                                 
                                  <td>
                                    <span class="select_persona" id="bill_amount_${i}">$${amount}</span>
                                  </td>
                                 
                              </tr>`;
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
  var yy = today.getFullYear().toString().substr(-2);

  today = mm + "-" + dd + "-" + yy;
  $("#invoice_raise_date").val(today);
}

function assignProbOptions() {
  let probLeadPreQua = `<option value="-1">Select Probability</option>
                      <option value="10">10%</option>
                      <option value="30 to 50">30% to 50%</option>
                      <option value="70">&gt; 70%</option>`;
  let probSigned = `<option value="100">100%</option>`;
  let probOther = `<option value="-1">Select Probability</option>
                <option value="30 to 50">30% to 50%</option>
                <option value="70">&gt; 70%</option>`;
  let probProposal = `<option value="70">&gt; 70%</option>`;
  let pronLost = `<option value="0">0%</option>`;
  let funnelVal = $("#funnel_options option:selected").val();
  let scoutOpt = `<option value="10">10%</option>`;
  $("#probability_options").empty();
  if (funnelVal == "Lead") {
    $("#probability_options").append(probLeadPreQua);
  } else if (funnelVal == "Signed") {
    $("#probability_options").append(probSigned);
  } else if (funnelVal == "Qualified" || funnelVal == "Pre-Qualified" || funnelVal == "Renewal") {
    $("#probability_options").append(probOther);
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
    // $('.opp_name_imp').hide();
  } else {
    $('.prob_imp').show();
    $('.sow_type_imp').show();
    $('.billing_imp').show();
    // $('.opp_name_imp').show();
  }
}

function updateAllDates() {
  let AllStartDate = $("#legal_start_date").val();
  $(".updateStartDate").val(AllStartDate);
  let AllEndDate = $("#legal_end_date").val();
  $(".updateEndDate").val(AllEndDate);
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
      if (dateLen == 0) {
        resBusDays = getBusinessDatesCount(newStart, newEnd);
      } else {
        resBusDays = getBusinessDatesCount(newStart, lastDates[0]);
      }
      businessDays = getBusinessDatesCount(dates[i], lastDates[i]);
      tempCal = (21 / businessDays) * resBusDays;
      tempCal = Math.round(tempCal * 100) / 100;
      totalValue += Math.round(tempCal * billrate * 8 * 100) / 100;
      let splitMonth = newStart.split("-");
      let getYear = splitMonth[0];
      let getMnth = splitMonth[1];
      let holiday = holidaysCount(holidayList, getYear, getMnth, location, newStart, lastDates[0])
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
      let holiday = holidaysCount(holidayList, getYear, getMnth, location, dates[dateLen], newEnd)
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
      let holiday = holidaysCount(holidayList, getYear, getMnth, location, dates[i], lastDates[i])
      todayDays += resBusDays - holiday;
    }
  });
  todayAmount = Math.round(totalValue)
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
      if ($("#billing_type_name").text() == "Time and Material") {
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
      if ($("#billing_type_name").text() == "Time and Material") {
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
      if ($("#billing_type_name").text() == "Time and Material") {
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

    if ($("#billing_type_name").text() == "Time and Material") {
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



const holidaysCount = (holidayList, getYear, getMnth, location, start, end) => {
  let holidayCount = 0
  $.each(holidayList, function (l, hldyData) {
    if (hldyData.YEAR == getYear) {
      let updatedHolidayYearData = removeWeekendsAndUpdateCounts(hldyData);
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
}


const tabs = [
  {
    name: "Notes",
    content: `
      <div id="notesTabDiv">
        <!-- The dynamically inserted notes will appear here -->
      </div>
      <div id="text-div"></div>
    `
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
              <th class='no-warp' style="width:455px">Expertise Persona <span class="warningMessage">*</span></th>
              <th style="display:none"  style="width:901px">Skill</th>
              <th class='no-warp' style="width:337px">Start Date <span class="warningMessage">*</span></th>
              <th class='no-warp' style="width:337px">End Date <span class="warningMessage">*</span></th>
              <th class='no-warp' style="width:90px">Days</th>  
              <th class='no-warp' style="width:180px">Location <span class="warningMessage">*</span></th>
              <th class='no-warp' style="width:250px">Billing Status <span class="warningMessage">*</span></th>
              <th class='no-warp' style="width:250px">Billing Rate($)</th>
              <th class='no-warp' style="width:90px">Count</th>
              <th class='no-warp' style="width:160px">Amount</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `
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
//   auditLogList.append(`<div class="showAllLogs"><div><input type="checkbox" id="showAllLogs"></div><div class="showAllLogsText"> Show Logs Of All The Events</div>`)

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

  // Activate the clicked tab and deactivate others
  tabButtons.forEach((button, i) => {
    button.classList.toggle("active", i === index); // Highlight the active tab
    tabContents[i].style.display = i === index ? "block" : "none"; // Show corresponding content
  });

  // Adjust height based on the active tab
  tabContents[index].style.overflowY = "auto"; // Ensure scroll for overflowing content
}

// function initializeQuill(comments_notes) {
//   console.log("Inside initializeQuill, comments_notes:", comments_notes);

//   const notesDiv = document.querySelector("#notesTabDiv"); // Target the div inside the Notes tab
//   if (notesDiv) {
//     // Clear existing content
//     notesDiv.innerHTML = "";

//     // Helper function to check if a note has meaningful content
//     function isNoteValid(note) {
//       if (!note || note.trim() === "") return false; // Skip empty or whitespace-only notes

//       // Remove HTML tags to check for meaningful text
//       const textOnly = note.replace(/<\/?[^>]+(>|$)/g, "").trim();
//       if (textOnly === "") return false;

//       // Regex to match a date-time pattern like "16/12/24, 04:55 PM"
//       const dateTimeRegex = /\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} (AM|PM)/;
//       return dateTimeRegex.test(note); // Return true if date-time is present
//   }

//   // Check for valid notes in the array
//   let isValid = comments_notes.some(noteObj => {
//       const isValidNote = isNoteValid(noteObj.NOTES);
//       console.log("Checking note:", noteObj.NOTES, "-> Valid:", isValidNote); // Debug log
//       return isValidNote;
//   });

//   // Toggle visibility of div elements
//   if (isValid) {
//       console.log("Valid notes found, showing 'notesTabDiv'.");
//       document.getElementById("notesTabDiv").style.display = "block"; // Show notesDiv
//       document.getElementById("text-div").style.display = "none";    // Hide textDiv
//   } else {
//       console.log("No valid notes found, showing 'text-div'.");
//       document.getElementById("notesTabDiv").style.display = "none"; // Hide notesDiv
//       document.getElementById("text-div").style.display = "block";   // Show textDiv
//   }


//     // If comments_notes is an array, iterate over each note
//     if (Array.isArray(comments_notes)) {
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

//           // Create wrapper for the note
//           noteWrapper.style.marginBottom = "16px"; // Add spacing between notes
//   console.log("NOTES---->",NOTES);

//           // Construct the note content with lists rendered as HTML
//           noteWrapper.innerHTML = `
//           <div style="display: flex; align-items: flex-start;">
//               <i class="fa-solid fa-circle-dot" style="margin-right: 8px; margin-top:30px;"></i>
//               <div class="new_note">
//                   ${NOTES}
//                   <span style="font-size: 11px; color: #818188; margin-left: 0px;">(${monthsAgo})</span>
//               </div>
//           </div>`;

//           // Process lists inside NOTES
//           const noteContent = noteWrapper.querySelector(".new_note");

//           if (noteContent) {
//             // Style ordered and unordered lists (only adjust margin and padding if needed)
//             noteContent.querySelectorAll("ol").forEach(ol => {
//                 ol.style.marginLeft = "-26px";  // Adjust as needed for spacing
//                 ol.style.marginTop="33px";
//             });
//             noteContent.querySelectorAll("ul").forEach(ul => {
//                 ul.style.marginLeft = "-26px";  // Adjust as needed for spacing
//                 ul.style.marginTop="33px";

//             });

//             // Style list items
//             noteContent.querySelectorAll("li").forEach(li => {
//                 li.style.marginBottom = "4px";  // Optional for spacing between list items
//             });
//         }


//           // Append the processed note to notesDiv
//           notesDiv.style.display = "block"; // Ensure visibility
//           notesDiv.appendChild(noteWrapper);
//       }
//   }

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
//       console.log("dateStr",dateStr);

//       const noteDate = new Date(dateStr);
//       const monthsAgo = getMonthsAgo(noteDate, new Date());

//       // Construct the note's HTML with the icon, note content, and months ago text
//       noteWrapper.innerHTML = `
//         <div style="display: flex; align-items: flex-start;">
//           <i class="fa-solid fa-circle-dot" style="margin-right: 8px; margin-top:30px;"></i>
//           <div>
//             ${NOTES}
//             <span style="font-size: 11px; color: #8181881; margin-left: 0px;">(${monthsAgo})</span>
//           </div>
//         </div>
//       `;

//       // Append the note to the #notesTabDiv
//       notesDiv.appendChild(noteWrapper);
//     }
//   }

// }
function initializeQuill(comments_notes) {
  console.log("comments_notes - ", comments_notes);
  $("#notesTabDiv").empty(); // Clear existing notes

  // Add CSS fix for lists in notes
  if (!document.getElementById('notes-list-style')) {
    const style = document.createElement('style');
    style.id = 'notes-list-style';
    style.innerHTML = `
      #notesTabDiv ul, #notesTabDiv ol {
        margin-left: 25px !important;
        padding-left: 0 !important;
        margin-top: 10px !important;
        margin-bottom: 10px !important;
      }
      #notesTabDiv ul {
        list-style-type: disc !important;
      }
      #notesTabDiv ol {
        list-style-type: decimal !important;
      }
      #notesTabDiv li {
        margin-bottom: 5px !important;
      }
      .engagement-detailed-note ul, .engagement-detailed-note ol {
          margin-left: 25px !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize Quill editor
  let quill = new Quill("#editor", {
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
    },
    placeholder: "Add Note Here...",
    theme: "snow",
  });

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
    //  const notes_icon_text = note.COMMENTED_BY.charAt(0);

    // Extract the first two characters of each word in COMMENTED_BY (up to a max of 3 words) with spaces
    const words = note.COMMENTED_BY.split(" ");
    const notes_icon_text = words
      .slice(0, 3) // Limit to the first three words
      .map(word => word.substring(0, 1)) // Extract the first two characters of each word
      .join(""); // Combine the characters with spaces

    // Format COMMENTED_BY to show the full first name and three characters of the last name
    const nameParts = note.COMMENTED_BY.split(" ");
    const notes_name =
      (nameParts[0] ? nameParts[0].substring(0, 1) : "") +
      " " +
      (nameParts[1] ? nameParts[1].substring(0, 1) : "");

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
      const nextStepsText = note.NEXT_STEPS || "N/A";
      let nextSteps = nextStepsText;
      if (nextStepsText !== "N/A" && !nextStepsText.includes("<")) {
        nextSteps = nextStepsText.split('\n').map(step => `${step}`).join('<br/>');
      }
      const nextStepsDate = formatToMMDDYY(note.NEXT_STEPS_DATE);
      const nextInteractionType = note.NEXT_INTERACTION_TYPE || "N/A";
      const nextInteractionDate = formatToMMDDYY(note.NEXT_INTERACTION_DATE);

      note_body_html = `
            <div class="engagement-detailed-note">
                <div style="margin-bottom: 8px;">
                    <strong>Detailed Notes:</strong>
                    <div style="gap: 5px;">${notes_content} | <strong>Meeting Type:</strong> ${note.INTERACTION_TYPE} | <strong>Meeting Date:</strong> ${meetingDate}</div>
                </div>
                ${nextStepsText !== "N/A" ? `
                <div style="margin-bottom: 8px;">
                    <strong>Next Step:</strong><br/>
                    ${nextSteps} | <strong>Next Step Estimated Date:</strong> ${nextStepsDate}
                </div>` : ''}
                <div style="margin-bottom: 8px;">
                    <strong>Next Interaction:</strong><br/>
                    <strong>Meeting Type:</strong> ${nextInteractionType} | <strong>Next Interaction Estimated Date:</strong> ${nextInteractionDate}
                </div>
                <div class='notes_comments_div'>
                    ${commentedOn}
                </div>
            </div>`;
    } else {
      // Simple rendering for N/A or legacy notes
      note_body_html = `
            <div>${notes_content}</div>
            <div class='notes_comments_div'>${commentedOn}</div>`;
    }

    // Generate the dynamic HTML for each comment
    comments_data_html += `
        <div class='notes_div' style="padding: 5px; border-bottom: 1px solid #eee; display: flex; gap: 15px;">
          <div class='notes_icon_div' style="flex-shrink: 0;">
            <div class='notes_icon_text' data-fullname='${note.COMMENTED_BY}'>${notes_icon_text}</div>
          </div>
          <div class='notes_body_div' style="flex-grow: 1;">
            ${note_body_html}
          </div>
        </div>`;
  });

  // Append the generated HTML to the #notesTabDiv element
  $("#notesTabDiv").append(comments_data_html);
  console.log('comments_data_html - ', comments_data_html)
  if (comments_data_html.trim() == '') {
    $("#text-div").text("Add your first note");
  }
}



function getMonthsAgo(noteDate, currentDate) {
  // Calculate the difference in months
  let monthsAgo = currentDate.getMonth() - noteDate.getMonth() +
    (12 * (currentDate.getFullYear() - noteDate.getFullYear()));

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
        return diffMinutes < 1 ? 'Just Now' : `${diffMinutes} minute(s) ago`;
      }
      return `${diffHours} hour(s) ago`;
    }

    // Return the difference in days if it's less than a month
    return `${diffDays} day(s) ago`;
  }

  // Only return the difference in months if it's 1 month or more
  if (monthsAgo === 1) {
    return '1 month ago';
  }
  return `${monthsAgo} months ago`;
}


document.addEventListener("DOMContentLoaded", function () {
  createTabs(); // Initialize tabs
  const stored_url_data = localStorage.getItem('urlStoredSOWUrldata');


});
function sow_view_cancel() {
  if (localStorage.getItem('sowBackBtnNav') === 'teamsPage') {
    localStorage.setItem('sowBackBtnNav', "");
    window.location.href = "team.html"
  }
  else {
    setTimeout(function () {
      window.location.href = "revenueDetails.html";
    }, 1000);
  }
}
function convertDateFormat(dateStr) {
  // Split the input date string (DD/MM/YY)
  const dateParts = dateStr.split('/');

  // Convert the year to four digits (assuming 2000s for 2-digit years)
  let year = dateParts[2];
  if (year.length === 2) {
    year = '20' + year;  // Convert 2-digit year to 4-digit (e.g., 24 -> 2024)
  }

  // Create a new Date object using the parts (note: month is 0-based in JavaScript)
  const formattedDate = new Date(`${year}-${dateParts[1]}-${dateParts[0]}`);

  // Format the date as YYYY-MM-DD
  const fullYear = formattedDate.getFullYear();
  const month = String(formattedDate.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
  const day = String(formattedDate.getDate()).padStart(2, '0'); // Add leading zero if needed

  return `${fullYear}-${month}-${day}`;
}
function updateMonthlyBreakupTab(data) {
  if (data.BILLING_MODEL_DATA && data.BILLING_MODEL_DATA.BILLING_MODEL === "Fixed Price") {
    activateMonthlyBreakupTab();
  } else {
    removeMonthlyBreakupTab();
  }
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
function populateMonthlyTable(sow_acc_data) {
  if (!sow_acc_data || !sow_acc_data["BILLING_MODEL_DATA"] || !sow_acc_data["BILLING_MODEL_DATA"]["MONTHS"]) {
    console.error("No months data found in sow_acc_data.");
    return;
  }

  const monthsData = sow_acc_data["BILLING_MODEL_DATA"]["MONTHS"];
  console.log("monthsData", monthsData);

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
    inputField.id = `monthly_breakup_amt_${month}`; // Unique ID per month
    inputField.value = (value !== undefined && value !== null) ? value : "";
    setInitialCommaFormatting(inputField);
    inputField.readOnly = true; // Make input non-editable

    inputField.addEventListener("input", function () {
      formatNumberInput(this);

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

  // Append the last row if it has any remaining cells
  if (monthRowWrapper.children.length > 0) {
    table.appendChild(monthRowWrapper);
  }

  monthlyTableContainer.appendChild(table);
}
function hideBillingRateAmountColumns(data) {
  console.log("data", data);

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
    if (text === "billing rate($)" || text === "amount") {
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
// Remove the window load event listener as it's now called after data is loaded


function formatNumberInput(input) {
  let rawValue = input.value.replace(/,/g, "");

  if (rawValue === "" || isNaN(rawValue)) return;

  let formattedValue = new Intl.NumberFormat("en-IN").format(Number(rawValue));

  input.value = formattedValue;
}
function setInitialCommaFormatting(input) {
  let rawValue = input.value.replace(/,/g, ""); // Remove commas
  if (rawValue === "" || isNaN(rawValue)) return;
  let formattedValue = new Intl.NumberFormat("en-IN").format(Number(rawValue));
  input.value = formattedValue; // Set formatted value with commas
}
