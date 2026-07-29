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
              let userRole = localStorage.getItem("user-role")
              let userEmail = localStorage.getItem("email")
              // if(userRole == "admin"){
                setTimeout(function () {
                  assignOverallData();
                  $('#report_details').addClass('active');
                  $("#sow_overall").addClass('active');
                  $("#sow_main").addClass('active');
                  $(".loader").css("display", "none");
                  $(".show_page").css("display", "block");
                }, 500);
              // }else{
              //   window.location.href = "reportsDashboard.html";
              // }
            } else {
                window.location.href = "home.html"
            }
        } else {
            window.location.href = "home.html"
        }
    }else {
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
$('#userManual').click(function () {

  window.location.href = 'RRESOWUserManual.html';
  return false;
});
$(document).on('click', '#reportsBackBtnCustm', function () {
  window.location.href = 'reportsDashboard.html';
  return false;
});
$('#logout').click(function () {
  localStorage.clear();
  console.log("sessionName - " + sessionName);
  window.location.href = 'index.html';
  return false;
});
let auditData = [];
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();

function getOverallSummaryJson() {
  let accessDetails = "{ \"ACCESS_LEVEL\" : \"" + accese_level +
    "\", \"Access\":\"" + accessData +
    "\", \"EDIT_ACCESS\":\"" + edit_access +
    "\", \"EMAIL_ID\":\"" + sessionName +
    "\", \"GROUP_NAME\":\"" + groupName +
    "\", \"USERNAME\":\"" + empName +
    "\", \"USER_ID\":\"" + empId +
    "\"}";
    const startTime = performance.now();  
  $.ajax({
    url:  apiValue.url_ip + ":5004/audit_tracking_data",
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: 'no-cors',
    data: JSON.stringify({
      query_type: "audit_tracking_data",
      "environment": apiValue.environment,
      "user_details": "[" + accessDetails + "]",
    }),
    success: function (dataJson) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(loadTimeInSeconds,"reportAudit","Reports","audit_tracking_data","success",fileName,"reportAudit","view");
      auditData = dataJson
      prepareOverallDatatoUI(auditData);
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(loadTimeInSeconds,"reportAudit","Reports","audit_tracking_data","error",fileName,"reportAudit","view");
      console.log('message Error' + JSON.stringify(error));
    }
  });
}

function assignOverallData() {
  if (auditData == 0) {
    getOverallSummaryJson();
  } else {
    prepareOverallDatatoUI(auditData)
  }
}

function prepareOverallDatatoUI(auditDatJson, selectedYearval) {
  let auditBodyhtml = "";
  $.each(auditDatJson, function (i, audit) {
    let audit_data = audit.DATA
    $.each(audit_data, function (j, eachAudit) {
      let aduit_request_data = eachAudit.REQUEST_DATA[0]
      let approvalNames = aduit_request_data.APPROVERS_DATA
      let approvalNamesText = ""
      $.each(approvalNames, function (l, eachApproval) {
        approvalNamesText += ` ${eachApproval.APPROVER_NAME} ${(eachApproval.APPROVER_STATUS == 'Approved' || eachApproval.APPROVER_STATUS == 'Rejected') ? ' (' + eachApproval.APPROVER_STATUS + ')<br>' : `${eachApproval.APPROVER_NAME != '' ? ' (Pending)' : ''}`},`
      })
      if (approvalNamesText.endsWith(",")) {
        approvalNamesText = approvalNamesText.slice(0, -1);
        approvalNamesText = approvalNamesText.trim()
      }
      let changesData = aduit_request_data.CHANGED_DATA;
      let changeDataHtml = ""
      let accName = "", sowName = ""
      $.each(changesData, function (y, changesValue) {
        if (changesValue.Old_Value == undefined) {
          let newVal = changesValue.New_Value
          if (typeof newVal == 'number') {
            newVal = (Math.round(newVal)).toLocaleString()
          }
          changeDataHtml += `<button class="skill_data">
                                  ${changesValue.Parameter} -
                                  <span>
                                  New : ${newVal} 
                                  </span>
                              </button>`
        } 
        // else if (changesValue.Old_Value == "") {
        //   console.log("time stand - ",convertStringToLocalTimeAndAgo(aduit_request_data.RAISED_ON) )
        //   console.log('Name - ',aduit_request_data.RAISED_BY_NAME )
        //   console.log("empty old  - ",changesValue )
        //   console.log("empty old value - ",changesValue.Old_Value )
        // } 
        else {
          let newVal = changesValue.New_Value, oldVal = changesValue.Old_Value
          if (typeof newVal == 'number') {
            newVal = (Math.round(newVal)).toLocaleString()
          }
          if (typeof oldVal == 'number') {
            oldVal = (Math.round(oldVal)).toLocaleString()
          }
          if (changesValue.ACCOUNT_NAME != "") {
            accName = `Account : <b>${aduit_request_data.ACCOUNT_NAME}</b><br>`
          }
          if (changesValue.SOW_NAME != "") {
            sowName = `SOW : <b>${aduit_request_data.SOW_NAME}</b><br>`
          }
          changeDataHtml += `<button class="skill_data">
                                <div class="row col-sm-12 remove_padding skill_data">
                                  <div class="col-sm-6 remove_padding">
                                  Column : <b>${changesValue.Parameter}</b>
                                  </div>
                                  <div class="col-sm-6 remove_padding">
                                  New : ${newVal} 
                                  <br>
                                  Old : ${oldVal}
                                  </div>
                                </div>
                              </button>`
        }
      })
      let audit_html = `<tr>
                            <td>${aduit_request_data.RAISED_BY_NAME}</td>
                            <td>${titleCase((audit.TYPE).replace(/_/g, ' '))}</td>
                            <td>${aduit_request_data.OPERATION == "" ? "-" : titleCase(aduit_request_data.OPERATION)}</td>
                            <td>${convertStringToLocalTimeAndAgo(aduit_request_data.RAISED_ON)}</td>
                            <td><div class="des_main_div more"> ${accName}${sowName}${changeDataHtml}</div></td>
                            <td>${aduit_request_data.APPROVAL_REQUIRED}</td>
                            <td>${approvalNamesText == "" ? "-" : approvalNamesText}</td>
                            <td>${aduit_request_data.APPROVAL_STATUS == "Not Required" ? "-" : aduit_request_data.APPROVAL_STATUS}</td>
                            <td>${aduit_request_data.APPROVED_ON == "" ? "-" : convert(aduit_request_data.APPROVED_ON)}</td>
                          </tr>`
      $("#audit_body").append(audit_html)
    })
  })
  const auditTable = $('#audit_report').DataTable({
    pageLength: 50,
    order: [[3, 'desc']],
    dom: "lfrtip",
    initComplete: function () {
      const wrapper = $('#audit_report_wrapper');
      const toolbar = $('#auditToolbarControls');
      const length = wrapper.find('.dataTables_length');
      const filter = wrapper.find('.dataTables_filter');

      formatAuditToolbarControls(length, filter);

      toolbar.empty();
      toolbar.append(length);
      toolbar.append(filter);
    }
  });

}

function formatAuditToolbarControls(length, filter) {
  const lengthLabel = length.find('label');
  const filterLabel = filter.find('label');
  const lengthSelect = length.find('select');
  const filterInput = filter.find('input');

  length.find('.audit-control-label').remove();
  filter.find('.audit-control-label').remove();

  lengthSelect.find('option').each(function () {
    const value = $(this).val();
    $(this).text(`${value} Entries`);
  });

  lengthLabel.contents().filter(function () {
    return this.nodeType === 3;
  }).remove();
  lengthLabel.prepend('<span class="audit-control-label">Show</span>');

  filterLabel.contents().filter(function () {
    return this.nodeType === 3;
  }).remove();
  filterInput.attr('placeholder', 'Search');
  filterInput.attr('aria-label', 'Search');
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

function downloadExcel() {
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
  let CurrentDateTime = date + '_' + time;
  $("#audit_report").remove(".noExl").table2excel({
    exclude: ".noExl",
    name: "Audit Report",
    filename: "audit_report_" + CurrentDateTime,
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
  }else{
    return "";
  }
}
