let apporaval_request_id = "";
function getApprovalData() {
  var ajaxTime = new Date().getTime();
  let empIDTemp = empId;
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
    empIDTemp +
    '"}';
  const startTime = performance.now();
  $.ajax({
    url: apiValue.url,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({
      query_type: "approval_data",
      environment: apiValue.environment,
      user_details: "[" + accessDetails + "]",
    }),
    success: function (data) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      const pathname = window.location.pathname;
      // Extract the file name (last segment) from the pathname
      const parts = pathname.split("/");
      const fileName = parts.pop();
      getApiTime(
        loadTimeInSeconds,
        "home",
        "Home",
        "approval_data",
        "success",
        fileName,
        "HomePage",
        "view"
      );
      let totalWorkflowCount = 0,
        sowApprovalLen = 0,
        resAllocLen = 0,
        accountAppLen = 0;
      $.each(data, function (i, workflowData) {
        if (workflowData.TYPE == "SOW_DATA") {
          let sowData = data[i].DATA;
          let sowLen = sowData.length;
          sowApprovalLen += sowLen;
          totalWorkflowCount += sowLen;
          $.each(sowData, function (i, sow) {
            let approval_Status = sow.APPROVAL_STATUS;
            let requestId = sow.REQUEST_ID;
            apporaval_request_id = sow.REQUEST_ID;
            let requestArr = requestId.split("_");
            let reqIdUpdate =
              requestArr[0] + " " + requestArr[1] + " - " + requestArr[2];
            let req_data = sow.REQUEST_DATA;
            $.each(req_data, function (j, req) {
              let accountName = req.ACCOUNT_NAME;
              let resName = req.SOW_NAME;

              let resButtonHtml = `<div class="card card-body">
                                                    <button class="btn btn-info" data-id='${JSON.stringify(
                                                      req
                                                    )}' 
                                                        onclick="selectedWorkflowDetails(this)">
                                                        ${reqIdUpdate} : ${accountName} - ${resName} 
                                                    </button>
                                                </div><br>`;
              $("#sowWorkflowData").append(resButtonHtml);
            });
          });
        }
        if (workflowData.TYPE == "RESOURCE_ALLOCATION") {
          let resData = data[i].DATA;
          let resLen = resData.length;
          resAllocLen += resLen;
          totalWorkflowCount += resLen;
          $.each(resData, function (i, res) {
            let approval_Status = res.APPROVAL_STATUS;
            let requestId = res.REQUEST_ID;
            let requestArr = requestId.split("_");
            let reqIdUpdate =
              requestArr[0] + " " + requestArr[1] + " - " + requestArr[2];
            let req_data = res.REQUEST_DATA;
            $.each(req_data, function (j, req) {
              let accountName = req.ACCOUNT_NAME;
              let resName = req.SOW_NAME;

              let resButtonHtml = `<div class="card card-body">
                                                    <button class="btn btn-info" data-id='${JSON.stringify(
                                                      req
                                                    )}' 
                                                        onclick="selectedWorkflowDetails(this)">
                                                        ${reqIdUpdate} : ${accountName} - ${resName} 
                                                    </button>
                                                </div><br>`;
              $("#resourceWorkflowData").append(resButtonHtml);
            });
          });
        }
        if (workflowData.TYPE == "RESOURCE_ALLOCATION_REVENUE") {
          let resData = data[i].DATA;
          let resLen = resData.length;
          resAllocLen += resLen;
          totalWorkflowCount += resLen;
          $.each(resData, function (i, res) {
            let approval_Status = res.APPROVAL_STATUS;
            let requestId = res.REQUEST_ID;
            let requestArr = requestId.split("_");
            let reqIdUpdate =
              requestArr[0] +
              " " +
              requestArr[1] +
              " " +
              requestArr[2] +
              " - " +
              requestArr[3];
            let req_data = res.REQUEST_DATA;
            $.each(req_data, function (j, req) {
              let accountName = req.ACCOUNT_NAME;
              let resName = req.SOW_NAME;

              let resButtonHtml = `<div class="card card-body">
                                                    <button class="btn btn-info" data-id='${JSON.stringify(
                                                      req
                                                    )}' 
                                                        onclick="selectedWorkflowDetails(this)">
                                                        ${reqIdUpdate} : ${accountName} - ${resName} 
                                                    </button>
                                                </div><br>`;
              $("#resourceWorkflowData").append(resButtonHtml);
            });
          });
        }
        if (workflowData.TYPE == "SOW_DELETE") {
          let sowData = data[i].DATA;
          let sowLen = sowData.length;
          sowApprovalLen += sowLen;
          totalWorkflowCount += sowLen;
          $.each(sowData, function (i, sow) {
            let approval_Status = sow.APPROVAL_STATUS;
            let requestId = sow.REQUEST_ID;
            apporaval_request_id = sow.REQUEST_ID;
            let requestArr = requestId.split("_");
            let reqIdUpdate =
              requestArr[0] + " " + requestArr[1] + " - " + requestArr[2];
            let req_data = sow.REQUEST_DATA;
            $.each(req_data, function (j, req) {
              let accountName = req.ACCOUNT_NAME;
              let resName = req.SOW_NAME;

              let resButtonHtml = `<div class="card card-body">
                                                    <button class="btn btn-info" data-id='${JSON.stringify(
                                                      req
                                                    )}' 
                                                        onclick="selectedWorkflowDetails(this)">
                                                        ${reqIdUpdate} : ${accountName} - ${resName} 
                                                    </button>
                                                </div><br>`;
              $("#sowWorkflowData").append(resButtonHtml);
            });
          });
        }
        if (workflowData.TYPE == "ACCOUNT_REMOVED") {
          let accData = data[i].DATA;
          let accLen = accData.length;
          accountAppLen += accLen;
          totalWorkflowCount += accLen;
          $.each(accData, function (i, sow) {
            let approval_Status = sow.APPROVAL_STATUS;
            let requestId = sow.REQUEST_ID;
            apporaval_request_id = sow.REQUEST_ID;
            let requestArr = requestId.split("_");
            let reqIdUpdate =
              requestArr[0] + " " + requestArr[1] + " - " + requestArr[2];
            let req_data = sow.REQUEST_DATA;
            $.each(req_data, function (j, req) {
              let accountName = req.ACCOUNT_NAME;
              let resName = req.SOW_NAME;

              let resButtonHtml = `<div class="card card-body">
                                                    <button class="btn btn-info" data-id='${JSON.stringify(
                                                      req
                                                    )}' 
                                                        onclick="selectedWorkflowDetails(this)">
                                                        ${reqIdUpdate} : ${accountName} 
                                                    </button>
                                                </div><br>`;
              $("#accountWorkflowData").append(resButtonHtml);
            });
          });
        }
        if (workflowData.TYPE == "TEAM_ALLOCATION") {
          let accData = data[i].DATA;
          let accLen = accData.length;
          resAllocLen += accLen;
          totalWorkflowCount += accLen;
          $.each(accData, function (i, sow) {
            let approval_Status = sow.APPROVAL_STATUS;
            let requestId = sow.REQUEST_ID;
            apporaval_request_id = sow.REQUEST_ID;
            let requestArr = requestId.split("_");
            let reqIdUpdate =
              requestArr[0] + " " + requestArr[1] + " - " + requestArr[2];
            let req_data = sow.REQUEST_DATA;
            $.each(req_data, function (j, req) {
              if (j == 0) {
                let accountName = req.ACCOUNT_NAME;
                let resName = req.SOW_NAME;

                let resButtonHtml = `<div class="card card-body">
                                                        <button class="btn btn-info" data-id='${JSON.stringify(
                                                          req_data
                                                        )}' 
                                                            onclick="selectedWorkflowDetails(this)">
                                                            ${reqIdUpdate} : ${accountName} - ${resName} 
                                                        </button>
                                                    </div><br>`;
                $("#resourceWorkflowData").append(resButtonHtml);
              }
            });
          });
        }
      });
      $("#sowCountId").html(sowApprovalLen);
      if (sowApprovalLen == 0) {
        $(".sow_approval").hide();
      }
      $("#accountCountId").html(accountAppLen);
      if (accountAppLen == 0) {
        $(".account_approval").hide();
      }
      $("#resCountId").html(resAllocLen);
      if (resAllocLen == 0) {
        $(".resource_allocation_approval").hide();
      }
      $("#workflow_count").html(totalWorkflowCount);
      $(".loader").hide();
      $(".show_page").show();
    },
    error: function (error) {
      console.log("message Error" + JSON.stringify(error));
      $(".loader").hide();
      $(".show_page").show();
    },
  });
}

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString.split(" ")[0]);
  const options = { year: "2-digit", month: "2-digit", day: "2-digit" };
  // toLocaleDateString for en-US gives mm/dd/yy. We replace slashes with dashes.
  return date.toLocaleDateString("en-US", options).replace(/\//g, "-");
};

function getAllocationConflictData() {
  let apiURL = apiValue.url_ip + ":5005/resource_conflicts";
  let empIDTemp = empId;
  let accessType = localStorage.getItem("user-role");
  console.log("accessType", accessType);
  console.log("empIDTemp", empIDTemp);
  if (accessType == "admin") {
    empIDTemp = "";
  }
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({ user_id: empIDTemp }),
    success: function (data) {
      console.log(data);
      $("#resAllocCountId").html(data.count);
      if (data.count == 0) {
        $(".resource_allocation_details").hide();
      }
      $("#resAllocShortCountId").html(data.shortage_count);
      if (data.shortage_count == 0) {
        $(".resource_allocation_shortage_details").hide();
      }
      allocationHtmlData(data.data)
      allocationShortageHtmlData(data.shortage_data)
    },
    error: function (error) {
      console.log("message Error" + JSON.stringify(error));
    },
  });
}

function selectedWorkflowDetails(obj) {
  let idData = $(obj).attr("data-id");
  let req_data = $.parseJSON(idData);
  let reqLen = req_data.length;
  let req_id = req_data.REQUEST_ID;
  if (reqLen != undefined) {
    req_id = req_data[0].REQUEST_ID;
  }
  sessionStorage.setItem("workflow-data", idData);
  window.location.href = "approvalData.html?approval_req=" + req_id;
}

function sowAccDetails(sowID, SOWUniqueID) {
  let sow_id = sowID;
  let UNIQUE_ID = SOWUniqueID;
  let uniqId_sowid = UNIQUE_ID + "&" + sow_id;
  window.open("sow.html?" + uniqId_sowid, "_blank");
}


function allocationHtmlData(allocationData) {
  let html = ``;
  $.each(allocationData, function (index, account) {
    let sowData = account.SOW_DETAILS;
    console.log("sowData - ", sowData);
    let sowHtml = ``;
    if (account.SOW_DETAILS && account.SOW_DETAILS.length > 0) {
      $.each(account.SOW_DETAILS, function (sowIndex, sow) {
        let resourceHtml = ``;

        // Parse legal dates once per SOW
        const legalStartDate = sow.LEGAL_START_DATE
          ? new Date(sow.LEGAL_START_DATE.split(" ")[0])
          : null;
        const legalEndDate = sow.LEGAL_END_DATE
          ? new Date(sow.LEGAL_END_DATE.split(" ")[0])
          : null;

        if (sow.RESOURCE_DETAILS && sow.RESOURCE_DETAILS.length > 0) {
          $.each(sow.RESOURCE_DETAILS, function (resIndex, resource) {
            const allocationStartDate = resource.ALLOCATION_START_DATE
              ? new Date(resource.ALLOCATION_START_DATE.split(" ")[0])
              : null;
            const allocationEndDate = resource.ALLOCATION_END_DATE
              ? new Date(resource.ALLOCATION_END_DATE.split(" ")[0])
              : null;

            let startDateClass = "";
            let endDateClass = "";

            // Check for date conflicts
            if (
              legalStartDate &&
              allocationStartDate &&
              allocationStartDate < legalStartDate
            ) {
              startDateClass = 'class="date-conflict"';
            }
            if (
              legalEndDate &&
              allocationEndDate &&
              allocationEndDate > legalEndDate
            ) {
              endDateClass = 'class="date-conflict"';
            }

            const billingStatusClass =
              resource.BILLING_STATUS === "Billed"
                ? "billing-billed"
                : "billing-investment";
            resourceHtml += `
                                <tr>
                                    <td>${resource.EMPLOYEE_NAME}</td>
                                    <td>${resource.JOB_ROLE}</td>
                                    <td><span class="billing-status-badge ${billingStatusClass}">${
              resource.BILLING_STATUS
            }</span></td>
                                    <td ${startDateClass}>${formatDate(
              resource.ALLOCATION_START_DATE
            )}</td>
                                    <td ${endDateClass}>${formatDate(
              resource.ALLOCATION_END_DATE
            )}</td>
                                </tr>`;
          });
        } else {
          resourceHtml =
            '<tr><td colspan="5" style="text-align:center; padding: 1rem;">No resource details available.</td></tr>';
        }

        sowHtml += `
                        <div class="sow-card">
                            <div class="sow-header" onclick='sowAccDetails("${
                              sow.SOW_ID
                            }", "${sow.UNIQUE_ID}")'>
                                <h4>${sow.SOW_NAME}</h4>
                                <p style="display: none;">SOW ID: ${
                                  sow.SOW_ID
                                }</p>
                            </div>
                            <div class="sow-body">
                                <div class="sow-details-grid">
                                    <div><p>Funnel Stage</p><p><span class="status-badge status-default">${
                                      sow.SOW_STATUS
                                    }</span></p></div>
                                    <div><p>Billing Type</p><p><span class="status-badge status-default">${
                                      sow.BILLING_MODEL
                                    }</span></p></div>
                                    <div><p>Legal Start Dates</p><p><span class="status-badge status-default">${formatDate(
                                      sow.LEGAL_START_DATE
                                    )}</span></p></div>
                                    <div><p>Legal End Dates</p><p><span class="status-badge status-default">${formatDate(
                                      sow.LEGAL_END_DATE
                                    )}</span></p></div>
                                </div>
                                <div class="resource-table-container">
                                    <h5>Resource Details</h5>
                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Team Member</th>
                                                    <th>Designation</th>
                                                    <th>Billing Status</th>
                                                    <th>Allocation Start</th>
                                                    <th>Allocation End</th>
                                                </tr>
                                            </thead>
                                            <tbody>${resourceHtml}</tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>`;
      });
    }
    html += `<div class="card card-body">
                            <div class="account-data account-accordion">
                                <div class="accordion-button" type="button" data-toggle="collapse"
                                    data-target="#resAllocDataAcc_${
                                      account.ACCOUNT_ID
                                    }" aria-expanded="false" aria-controls="collapseExample">
                                    <h3>${account.ACCOUNT_NAME}</h3>
                                    <span class="sow-count-badge">${
                                      account.SOW_DETAILS.length
                                    } SOW(s)</span>
                                </div>
                                <div class="collapse workflowSubItems collapse-content" id="resAllocDataAcc_${
                                  account.ACCOUNT_ID
                                }">
                                    ${
                                      sowHtml ||
                                      '<p style="color: #6b7280;">No SOW details for this account.</p>'
                                    }
                                </div>
                            </div>
                        </div><br>`;
  });
  $("#resourceAllocationData").html(html);
}

function allocationShortageHtmlData(allocationShortageData) {
  let html = ``;
  $.each(allocationShortageData, function (index, account) {
    let sowData = account.SHORTAGE_DETAILS;
    console.log("sowData - ", sowData);
    let sowHtml = ``;
    if (account.SHORTAGE_DETAILS && account.SHORTAGE_DETAILS.length > 0) {
      $.each(account.SHORTAGE_DETAILS, function (sowIndex, sow) {
        let resourceHtml = ``;

        // Parse legal dates once per SOW
        const actualStartDate = sow.ACTUAL_START_DATE
          ? new Date(sow.ACTUAL_START_DATE.split(" ")[0])
          : null;
        const actualEndDate = sow.ACTUAL_END_DATE
          ? new Date(sow.ACTUAL_END_DATE.split(" ")[0])
          : null;

        sowHtml += `
                        <div class="sow-card">
                            <div class="sow-header" onclick='sowAccDetails("${
                              sow.SOW_ID
                            }", "${sow.UNIQUE_ID}")'>
                                <h4>${sow.SOW_NAME}</h4>
                                <p style="display: none;">SOW ID: ${
                                  sow.SOW_ID
                                }</p>
                            </div>
                            <div class="sow-body">
                              <div class="sow-details-grid">
                                  <div><p>Funnel Stage</p><p><span class="status-badge status-default">${
                                    sow.SOW_STATUS
                                  }</span></p></div>
                                  <div><p>IND</p><p><div class="status-badge ${sow.INDIA_SHORTAGE > 0 
                                          ? 'status-positive' 
                                          : sow.INDIA_SHORTAGE < 0 
                                            ? 'status-negative' 
                                            : 'status-default'
                                      }">${
                                    sow.INDIA_SHORTAGE
                                  }</div></p></div>
                                  <div><p>USCAN</p><p><div class="status-badge ${sow.US_SHORTAGE > 0 
                                          ? 'status-positive' 
                                          : sow.US_SHORTAGE < 0 
                                            ? 'status-negative' 
                                            : 'status-default'
                                      }">${
                                    sow.US_SHORTAGE
                                  }</div></p></div>
                                  <div><p>Actual Start Dates</p><p><span class="status-badge status-default">${formatDate(
                                    sow.ACTUAL_START_DATE
                                  )}</span></p></div>
                                  <div><p>Actual End Dates</p><p><span class="status-badge status-default">${formatDate(
                                    sow.ACTUAL_END_DATE
                                  )}</span></p></div>
                              </div>
                            </div>
                        </div>`;
      });
    }
    html += `<div class="card card-body">
                            <div class="account-data account-accordion">
                                <div class="accordion-button" type="button" data-toggle="collapse"
                                    data-target="#resAllocShortDataAcc_${
                                      account.ACCOUNT_ID
                                    }" aria-expanded="false" aria-controls="collapseExample">
                                    <h3>${account.ACCOUNT_NAME}</h3>
                                    <span class="sow-count-badge">${
                                      account.SHORTAGE_DETAILS.length
                                    } SOW(s)</span>
                                </div>
                                <div class="collapse workflowSubItems collapse-content" id="resAllocShortDataAcc_${
                                  account.ACCOUNT_ID
                                }">
                                    ${
                                      sowHtml ||
                                      '<p style="color: #6b7280;">No SOW details for this account.</p>'
                                    }
                                </div>
                            </div>
                        </div><br>`;
  });
  $("#resourceAllocationShortageData").html(html);
}
