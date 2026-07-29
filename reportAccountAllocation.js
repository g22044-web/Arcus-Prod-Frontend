let accountData = [],
  account_class_arr = [],
  acc_size_arr = [],
  acc_payment_arr = [],
  empNameOption = "";
let funnelOptHtml = "",
  sowTypeOptHtml = "",
  skillOptionsHtml = "",
  billingTypeHtml = "",
  sowAccountOptHtml = "",
  accSizeHtml = "",
  accPayHtml = "",
  personaOpt = "",
  billingOpt = "",
  accessDetailsData = '';

const pathname = window.location.pathname;
// Extract the file name (last segment) from the pathname
const parts = pathname.split("/");
const fileName = parts.pop();
let accountDataJson = '', employeeJsonData = '';

function getAccountDetailsJson(pageLevelAccess) {
  let apiURL = apiValue.url_ip + ":5003/account_allocation";
  const startTime = performance.now();
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({}),
    success: function (dataJson) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      accessDetailsData = pageLevelAccess;
      console.log("pageLevelAccess - ", pageLevelAccess)
      getApiTime(
        loadTimeInSeconds,
        "Account",
        "Revenue",
        "view_all_account",
        "success",
        fileName,
        "AccountDetailsPage",
        "view"
      );
      accountData = dataJson;
      accountDataJson = dataJson[0].ACCOUNT_DATA;
      employeeJsonData = dataJson[0].EMPLOYEE_DATA;
      prepareOverallDatatoUI(accountDataJson);
      prepareDropdown(employeeJsonData);
      appendAllOptionValues(accountDataJson);
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(
        loadTimeInSeconds,
        "Account",
        "Revenue",
        "view_all_account",
        "error",
        fileName,
        "AccountDetailsPage",
        "view"
      );
      console.log("message Error" + JSON.stringify(error));
    },
  });
}

function prepareOverallDatatoUI(accountDatJson, selectedYearval) {
  console.log('accountDatJson - ', accountDatJson)
  $("#account_report tbody").empty();
  $("#account_report").dataTable().fnClearTable();
  $("#account_report").dataTable().fnDestroy();

  let accountBodyhtml = "";
  $.each(accountDatJson, function (i, account) {
    let acc = account.ACCOUNT_NAME.replace(/ /g, "_") + "_" + i;
    let delete_class = ""; //show_delete_app
    if (account.DELETE_UNDER_APPROVAL == "YES") {
      delete_class = "show_delete_app";
    }
    let active_state = "acc_name_data"
    // if(account.ACTIVE_FLAG !="Active"){
    //   active_state = "inactive-account"
    // }
    accountBodyhtml = `<tr>
                          <td>
                            <div class="${active_state}">
                                ${account.ACCOUNT_NAME}
                            </div>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="account_growth_${acc}_text">
                                ${account.GROWTH_AVP_VP == null || account.GROWTH_AVP_VP == "" ? "-" : account.GROWTH_AVP_VP}
                            </div>
                            <select class="${acc}_edit account_edit_field account_growth" id="account_growth_${acc}"></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="account_growth_dr_sdr_${acc}_text">
                                ${account.GROWTH_DR_SDR == null || account.GROWTH_DR_SDR == "" ? "-" : account.GROWTH_DR_SDR}
                            </div>
                            <select class="${acc}_edit account_edit_field account_growth_dr_sdr" id="account_growth_dr_sdr_${acc}"></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit"id="account_eng_manger_${acc}_text">
                                ${account.GROWHT_ENG_ACC_MGR == null || account.GROWHT_ENG_ACC_MGR == "" ? "-" : account.GROWHT_ENG_ACC_MGR}
                            </div>
                            <select class="${acc}_edit account_edit_field account_eng_manger" id="account_eng_manger_${acc}"></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="account_delivery_vp_${acc}_text">
                                ${account.DELIVERY_AVP_VP == null || account.DELIVERY_AVP_VP == "" ? "-" : account.DELIVERY_AVP_VP}
                            </div>
                            <select class="${acc}_edit account_edit_field account_delivery_vp" id="account_delivery_vp_${acc}"></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="account_delivery_sdr_${acc}_text">
                                ${account.DELIVERY_DR_SDR == null || account.DELIVERY_DR_SDR == "" ? "-" : account.DELIVERY_DR_SDR}
                            </div>
                            <select class="${acc}_edit account_edit_field account_delivery_sdr" id="account_delivery_sdr_${acc}"></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="account_delivery_sm_${acc}_text">
                                ${account.DELIVERY_SM == null || account.DELIVERY_SM == "" ? "-" : account.DELIVERY_SM}
                            </div>
                            <select class="${acc}_edit account_edit_field account_delivery_sm" id="account_delivery_sm_${acc}"></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="account_delivery_manager_${acc}_text">
                                ${account.DELIVERY_MANAGER == null || account.DELIVERY_MANAGER == "" ? "-" : account.DELIVERY_MANAGER}
                            </div>
                            <select class="${acc}_edit account_edit_field account_delivery_manager" id="account_delivery_manager_${acc}"></select>
                          </td>
                          <td>
                              <button class="btn btn-info-account edit_button ${acc}_show account_not_edit" 
                                data-account-id='${account.ACCOUNT_ID}' 
                                id='${acc}'
                                data-id2='${acc}'
                                data-delcheck = '${account.DELETE_UNDER_APPROVAL
                                  }'
                                data-editcheck = '${account.EDIT_UNDER_APPROVAL
                                }'
                                onclick="accountEdit(this)"
                                title= "Edit">
                                <i class="fa fa-pencil-square-o" aria-hidden="true">
                                </i>
                              </button>
                              <button class="btn btn-info-account edit_button ${acc}_edit account_edit_field" 
                                data-id='${JSON.stringify(account)}' 
                                data-account-id='${account.ACCOUNT_ID}' 
                                data-account-name='${account.ACCOUNT_NAME}' 
                                data-id2='${acc}'
                                onclick="accountUpdate(this)"
                                title= "Update">
                                <i class="fa fa-floppy-o" aria-hidden="true">
                                </i>
                              </button>
                              <button class="btn btn-info-account cancel_button ${acc}_edit account_edit_field" 
                                data-account-id='${account.ACCOUNT_ID}' 
                                data-id2='${acc}'
                                onclick="accountCancel(this)"
                                title= "Cancel">
                                <i class="fa fa-window-close-o" aria-hidden="true">
                                </i>
                              </button>
                          </td>
                        </tr>`;

    $("#account_body").append(accountBodyhtml);
    $(".input-group-addon").hide();
    $(".account_edit_field").hide();

    let eachLevel = accessDetailsData.split(',')
    $.each(eachLevel, function (l, level) {
      switch (level) {
        case "delete":
          $(".delete_button").show()
          break;
        case "edit":
          $(".delete_button").hide()
          $('#account_report tr').find('th:last, td:last').show();
          break;
        case "view":
          $('#account_report tr').find('th:last, td:last').hide();
          break;
      }
    })
  });
  $("#account_report").dataTable({
    pageLength: 50,
    columnDefs: [{ orderable: false, targets: -1 }],
    "order": []
  });
}

function prepareDropdown(empData) {
  console.log('empData - ', empData)
  let empNameOption = "";
  $(".account_growth").append(
    "<option value='-1'>Select Growth AVP/VP</option>"
  );
  $(".account_growth_dr_sdr").append(
    "<option value='-1'>Select Growth Dir/Sr Dir</option>"
  );

  $(".account_eng_manger").append(
    "<option value='-1'>Select Eng/Manger</option>"
  );

  $(".account_delivery_vp").append(
    "<option value='-1'>Select Delivery AVP/P</option>"
  );

  $(".account_delivery_sdr").append(
    "<option value='-1'>Select Delivery Dir/Sr Dir</option>"
  );

  $(".account_delivery_sm").append(
    "<option value='-1'>Select Delivery SM</option>"
  );

  $(".account_delivery_manager").append(
    "<option value='-1'>Select Delivery Manager</option>"
  );
  $.each(empData, function (i, empName) {
    empNameOption += `<option value="${empName.EMPLOYEE_ID}">${empName.EMPLOYEE_NAME}</option>`;
  });
  $(".account_growth").append(empNameOption);
  $(".account_growth_dr_sdr").append(empNameOption);
  $(".account_eng_manger").append(empNameOption);
  $(".account_delivery_vp").append(empNameOption);
  $(".account_delivery_sdr").append(empNameOption);
  $(".account_delivery_sm").append(empNameOption);
  $(".account_delivery_manager").append(empNameOption);
}
function appendAllOptionValues(accountDatJson) {
  $.each(accountDatJson, function (i, account) {
    let acc = account.ACCOUNT_NAME.replace(/ /g, "_") + "_" + i;
    let paymentTermData = `${account.PAYMENT_TERM == "" ? "-1" : account.PAYMENT_TERM
      }`;
    $("#account_growth_" + acc).val(
      account.GROWTH_AVP_VP_ID == "" || account.GROWTH_AVP_VP_ID == null ? "-1" : account.GROWTH_AVP_VP_ID
    );
    $("#account_growth_" + acc).select2({});
    $("#account_growth_dr_sdr_" + acc).val(
      account.GROWTH_DR_SDR_ID == "" || account.GROWTH_DR_SDR_ID == null ? "-1" : account.GROWTH_DR_SDR_ID
    );
    $("#account_growth_dr_sdr_" + acc).select2({});
    
    $("#account_eng_manger_" + acc).val(
      account.GROWHT_ENG_ACC_MGR_ID == "" || account.GROWHT_ENG_ACC_MGR_ID == null ? "-1" : account.GROWHT_ENG_ACC_MGR_ID
    );
    $("#account_eng_manger_" + acc).select2({});
    $("#account_delivery_vp_" + acc).val(
      account.DELIVERY_AVP_VP_ID == "" || account.DELIVERY_AVP_VP_ID == null ? "-1" : account.DELIVERY_AVP_VP_ID
    );
    $("#account_delivery_vp_" + acc).select2({});
    $("#account_delivery_sdr_" + acc).val(
      account.DELIVERY_DR_SDR_ID == "" || account.DELIVERY_DR_SDR_ID == null ? "-1" : account.DELIVERY_DR_SDR_ID
    );
    $("#account_delivery_sdr_" + acc).select2({});
    $("#account_delivery_sm_" + acc).val(
      account.DELIVERY_SM_ID == "" || account.DELIVERY_SM_ID == null ? "-1" : account.DELIVERY_SM_ID
    );
    $("#account_delivery_sm_" + acc).select2({});
    $("#account_delivery_manager_" + acc).val(
      account.DELIVERY_MANAGER_ID == "" || account.DELIVERY_MANAGER_ID == null ? "-1" : account.DELIVERY_MANAGER_ID
    );
    $("#account_delivery_manager_" + acc).select2({});
  });
}

function downloadExcel() {
  let today = new Date();
  let date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let time =
    today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
  let CurrentDateTime = date + "_" + time;
  $("#account_report")
    .remove(".noExl")
    .table2excel({
      exclude: ".noExl",
      name: "Audit Report",
      filename: "account_details_" + CurrentDateTime,
      fileext: ".xls",
    });
}

function convert(str) {
  if (str == null) {
    return "";
  } else if (str == "0000-00-00") {
    return "";
  } else {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
  }
}
console.log(convert("Mon, 11 Nov 2013 00:00:00 GMT"));

function selectedaccountDetails(obj) {
  let auditDataDetails = $(obj).attr("data-id");
  let audit_id = $(obj).attr("data-id1");
  sessionStorage.setItem("audit-details-data", auditDataDetails);
}

function accountEdit(obj) {
  let deleteStatus = $(obj).attr("data-delcheck");
  let editStatus = $(obj).attr("data-editcheck");
  let account_id = $(obj).attr("data-account-id");
  let className = "." + $(obj).attr("data-id2");
  let idName = "#" + $(obj).attr("data-id2");
  // let idName = "."+$(obj).attr("data-id2");
  if (deleteStatus == "YES") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Account Inactivated and waiting for approval");
    return false;
  } else if (deleteStatus == "YES") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Account changes under approval");
    return false;
  } else {
    $(className + "_show").hide();
    $(className + "_edit").show();
  }
}

function accountCancel(obj) {
  let className = "." + $(obj).attr("data-id2");
  $(className + "_show").show();
  $(className + "_edit").hide();
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

function accountUpdate(obj) {
  let accountAllData = $(obj).attr("data-id");
  accountAllData = $.parseJSON(accountAllData);
  console.log('accountAllData - ', accountAllData);

  let account_id = $(obj).attr("data-account-id");
  let accName = $(obj).attr("data-account-name");
  let className = $(obj).attr("data-id2");

  let checkChanges = false;

  let account_growth_id = $('#account_growth_' + className).val();
  let account_growth_name = $('#account_growth_' + className + ' option:selected').text();
  let account_growth_dr_sdr_id = $('#account_growth_dr_sdr_' + className).val();
  let account_growth_dr_sdr_name = $('#account_growth_dr_sdr_' + className + ' option:selected').text();
  let account_delivery_sdr_id = $('#account_delivery_sdr_' + className).val();
  let account_delivery_sdr_name = $('#account_delivery_sdr_' + className + ' option:selected').text();
  let account_eng_manger_id = $('#account_eng_manger_' + className).val();
  let account_eng_manger_name = $('#account_eng_manger_' + className + ' option:selected').text();
  let account_delivery_vp_id = $('#account_delivery_vp_' + className).val();
  let account_delivery_vp_name = $('#account_delivery_vp_' + className + ' option:selected').text();
  let account_delivery_sm_id = $('#account_delivery_sm_' + className).val();
  let account_delivery_sm_name = $('#account_delivery_sm_' + className + ' option:selected').text();
  let account_delivery_manager_id = $('#account_delivery_manager_' + className).val();
  let account_delivery_manager_name = $('#account_delivery_manager_' + className + ' option:selected').text();

  if (accountAllData.GROWTH_AVP_VP_ID != account_growth_id) {
    if(account_growth_id != '-1'){
      checkChanges = true;
    }
  }
  if (accountAllData.GROWTH_DR_SDR_ID != account_growth_dr_sdr_id) {
    if(account_growth_dr_sdr_id != '-1'){
      checkChanges = true;
    }
  }
  if (accountAllData.GROWHT_ENG_ACC_MGR_ID != account_eng_manger_id) {
    if(account_eng_manger_id != '-1'){
      checkChanges = true;
    }
  }
  if (accountAllData.DELIVERY_AVP_VP_ID != account_delivery_vp_id) {
    if(account_delivery_vp_id != '-1'){
      checkChanges = true;
    }
  }
  if (accountAllData.DELIVERY_DR_SDR_ID != account_delivery_sdr_id) {
    if(account_delivery_sdr_id != '-1'){
      checkChanges = true;
    }
  }
  if (accountAllData.DELIVERY_SM_ID != account_delivery_sm_id) {
    if(account_delivery_sm_id != '-1'){
      checkChanges = true;
    }
  }
  if (accountAllData.DELIVERY_MANAGER_ID != account_delivery_manager_id) {
    if(account_delivery_manager_id != '-1'){
      checkChanges = true;
    }
  }

  if (checkChanges) {
    if (account_growth_id == '-1') {
      account_growth_id = '';
      account_growth_name = '';
    }
    if (account_growth_dr_sdr_id == '-1') {
      account_growth_dr_sdr_id = '';
      account_growth_dr_sdr_name = '';
    }
    if (account_eng_manger_id == '-1') {
      account_eng_manger_id = '';
      account_eng_manger_name = '';
    }
    if (account_delivery_vp_id == '-1') {
      account_delivery_vp_id = '';
      account_delivery_vp_name = '';
    }
    if (account_delivery_sdr_id == '-1') {
      account_delivery_sdr_id = '';
      account_delivery_sdr_name = '';
    }
    if (account_delivery_sm_id == '-1') {
      account_delivery_sm_id = '';
      account_delivery_sm_name = '';
    }
    if (account_delivery_manager_id == '-1') {
      account_delivery_manager_id = '';
      account_delivery_manager_name = '';
    }

    let accessDetails = {
      USERNAME: empName,
      USER_ID: empId
    };

    let account_allocation_update_data = {
      UNIQUE_ID : accountAllData.UNIQUE_ID,
      ACCOUNT_ID: account_id,
      ACCOUNT_NAME: accName,
      GROWTH_AVP_VP_ID: account_growth_id,
      GROWTH_AVP_VP: account_growth_name,
      GROWTH_DR_SDR_ID:account_growth_dr_sdr_id,
      GROWTH_DR_SDR:account_growth_dr_sdr_name,
      GROWHT_ENG_ACC_MGR_ID: account_eng_manger_id,
      GROWHT_ENG_ACC_MGR: account_eng_manger_name,
      DELIVERY_AVP_VP_ID: account_delivery_vp_id,
      DELIVERY_AVP_VP: account_delivery_vp_name,
      DELIVERY_DR_SDR_ID: account_delivery_sdr_id,
      DELIVERY_DR_SDR: account_delivery_sdr_name,
      DELIVERY_SM_ID: account_delivery_sm_id,
      DELIVERY_SM: account_delivery_sm_name,
      DELIVERY_MANAGER_ID: account_delivery_manager_id,
      DELIVERY_MANAGER: account_delivery_manager_name
    };

    let accUpdatedJsonData = {
      user_details: [accessDetails],
      data: [account_allocation_update_data]
    };

    console.log('accUpdatedJsonData - ', JSON.stringify(accUpdatedJsonData));

    let apiURL = apiValue.url_ip + ":5003/account_allocation_edit";
    const startTime = performance.now();
    $("#" + className).prop("disabled", true);
    $.ajax({
      url: apiURL,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      format: "json",
      data: JSON.stringify(accUpdatedJsonData),
      success: function (json) {
        if (json.Message == "Success") {
          toastr.options.timeOut = 2000; // 2s
          toastr.success(json.Response);
    
          // Update the UI with new values or select '-1' if the ID is empty/null
          $('#account_growth_' + className).val(account_growth_id || '-1');
          // $('#account_growth_' + className + ' option:selected').text(account_growth_name || '-1');
          $('#account_growth_' + className+ '_text').html(account_growth_name || '-');

          $('#account_growth_dr_sdr_' + className).val(account_growth_dr_sdr_id || '-1');
          // $('#account_growth_' + className + ' option:selected').text(account_growth_name || '-1');
          $('#account_growth_dr_sdr_' + className+ '_text').html(account_growth_dr_sdr_name || '-');
          
          $('#account_delivery_sdr_' + className).val(account_delivery_sdr_id || '-1');
          // $('#account_delivery_sdr_' + className + ' option:selected').text(account_delivery_sdr_name || '-1');
          $('#account_delivery_sdr_' + className + '_text').html(account_delivery_sdr_name || '-');

          $('#account_eng_manger_' + className).val(account_eng_manger_id || '-1');
          // $('#account_eng_manger_' + className + ' option:selected').text(account_eng_manger_name || '-1');
          $('#account_eng_manger_' + className + '_text').html(account_eng_manger_name || '-');

          $('#account_delivery_vp_' + className).val(account_delivery_vp_id || '-1');
          // $('#account_delivery_vp_' + className + ' option:selected').text(account_delivery_vp_name || '-1');
          $('#account_delivery_vp_' + className + '_text').html(account_delivery_vp_name || '-');
          
          $('#account_delivery_sm_' + className).val(account_delivery_sm_id || '-1');
          // $('#account_delivery_sm_' + className + ' option:selected').text(account_delivery_sm_name || '-1');
          $('#account_delivery_sm_' + className + '_text').html(account_delivery_sm_name || '-');

          $('#account_delivery_manager_' + className).val(account_delivery_manager_id || '-1');
          // $('#account_delivery_manager_' + className + ' option:selected').text(account_delivery_manager_name || '-1');
          $('#account_delivery_manager_' + className + '_text').html(account_delivery_manager_name || '-');

          // Optionally, refresh or update other parts of the UI, like hiding/showing elements
          $("." + className + "_show").show();
          $("." + className + "_edit").hide();
    
          const endTime = performance.now();
          const loadTimeInSeconds = (endTime - startTime) / 1000;
          getApiTime(
            loadTimeInSeconds,
            "account",
            "Revenue",
            "edit_account",
            "success",
            fileName,
            "RevenuePage",
            "edit"
          );
          $("#" + className).prop("disabled", false);
        } else {
          toastr.options.timeOut = 2000; // 2s
          toastr.error(json.Response);
          $("#" + className).prop("disabled", false);
        }
      },
      error: function (error) {
        $("#" + className).prop("disabled", false);
        const endTime = performance.now();
        const loadTimeInSeconds = (endTime - startTime) / 1000;
        getApiTime(
          loadTimeInSeconds,
          "account",
          "Revenue",
          "edit_account",
          "error",
          fileName,
          "RevenuePage",
          "edit"
        );
        console.log("message Error" + JSON.stringify(error));
        toastr.options.timeOut = 2000; // 2s
        toastr.error("Message error" + JSON.stringify(error));
        // $("#sow_edit").show();
      },
    });    
  }
  $("." + className + "_show").show();
  $("." + className + "_edit").hide();
}

function accountDelete(obj) {
  let accountAllData = $(obj).attr("data-id");
  accountAllData = $.parseJSON(accountAllData);
  let account_id = $(obj).attr("data-account-id");
  let className = $(obj).attr("data-id2");
  let deleteStatus = $(obj).attr("data-delcheck");
  let editStatus = $(obj).attr("data-editcheck");
  if (deleteStatus == "YES") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Account Inactivated and waiting for approval");
    return false;
  } else if (deleteStatus == "YES") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Account changes under approval");
    return false;
  } else {
    bootbox.confirm({
      message:
        "Are you sure to In-Activate the account name - <b>" +
        accountAllData.ACCOUNT_NAME +
        "</b>?",
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
        if (result) {
          let buListArray = sowDropDownJson.DEFAULT_BILLRATE;
          let buHeadId = "";
          $.each(buListArray, function (i, accId) {
            if (accId.ACCOUNT_ID == accountAllData.ACCOUNT_ID) {
              buHeadId = accId.BUSINESS_HEAD;
              return false;
            }
          });
          let takeApprovalResponse = "Yes";
          let approverName = "Business head";
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

          if (buHeadId == empId) {
            takeApprovalResponse = "No";
            approverName = "";
          }
          let billing_array =
            '{ "BILLING_RATE" : "' +
            accountAllData.BILLING_RATE_IND +
            '", "LOCATION":"India"},{ "BILLING_RATE" : "' +
            accountAllData.BILLING_RATE_US +
            '", "LOCATION":"US"}';
          let account_delete_data =
            '{ "ACCOUNT_NAME" : "' +
            accountAllData.ACCOUNT_NAME +
            '", "ACCOUNT_ID":"' +
            accountAllData.ACCOUNT_ID +
            '", "LOCATION":"' +
            accountAllData.LOCATION +
            '", "ACCOUNT_POINT_OF_CONTACT":"' +
            accountAllData.ACCOUNT_POINT_OF_CONTACT +
            '", "BUSINESS_HEAD":"' +
            accountAllData.BUSINESS_HEAD +
            '", "ACCOUNT_SIZE":"' +
            accountAllData.ACCOUNT_SIZE +
            '", "BILLING_DATA":[' +
            billing_array +
            '], "FACTSPAN_ACCOUNT_HEAD_ID":"' +
            accountAllData.FACTSPAN_ACCOUNT_HEAD_ID +
            '", "PAYMENT_TERM":"' +
            accountAllData.PAYMENT_TERM +
            '", "MSA_SIGNED_DATE":"' +
            accountAllData.MSA_SIGNED_DATE +
            '", "NOTES":"' +
            accountAllData.NOTES +
            '", "DELIVERY_HEAD":"' +
            accountAllData.DELIVERY_HEAD +
            '", "FACTSPAN_POC_NAME":"' +
            accountAllData.FACTSPAN_POC_NAME +
            '", "BUSINESS_HEAD_NAME":"' +
            accountAllData.BUSINESS_HEAD_NAME +
            '", "DELIVERY_HEAD_NAME":"' +
            accountAllData.DELIVERY_HEAD_NAME +
            '", "ACTIVE_FLAG":"' +
            accountAllData.ACTIVE_FLAG +
            '"}';

          let approvalData =
            '{ "TAKE_APPROVAL" : "' +
            takeApprovalResponse +
            '", "APPROVER":"' +
            approverName +
            '"}';

          let accDeleteJsonData = {
            query_type: "remove_account",
            environment: apiValue.environment,
            user_details: "[" + accessDetails + "]",
            approver_data: "[" + approvalData + "]",
            account_data: "[" + account_delete_data + "]",
          };
          let apiURL = apiValue.url.replace("/app", "/remove_account");
          const startTime = performance.now();
          $.ajax({
            url: apiURL,
            type: "POST",

            dataType: "json",
            crossDomain: true,
            format: "json",
            data: JSON.stringify(accDeleteJsonData),
            success: function (json) {
              if (json.Message == "Success") {
                const endTime = performance.now();
                const loadTimeInSeconds = (endTime - startTime) / 1000;
                getApiTime(loadTimeInSeconds, "Account", "Revenue", "remove_account", "success", fileName, "AccountDetailsPage", "delete");
                toastr.options.timeOut = 2000; // 2s
                toastr.success(json.Response);
                if (takeApprovalResponse == 'No') {
                  setTimeout(() => {
                    document.location.reload();
                  }, 2000);
                }
              } else {
                toastr.options.timeOut = 2000; // 2s
                toastr.error(json.Response);
              }
            },
            error: function (error) {
              const endTime = performance.now();
              const loadTimeInSeconds = (endTime - startTime) / 1000;
              getApiTime(loadTimeInSeconds, "Account", "Revenue", "remove_account", "error", fileName, "AccountDetailsPage", "delete");
              toastr.options.timeOut = 2000; // 2s
              toastr.error("Message error" + JSON.stringify(error));
            },
          });

          $("." + className + "_show").show();
          $("." + className + "_edit").hide();
        } else {
          console.log("user cancelled to delete this SOW");
        }
      },
    });
  }
}

function validateNumber(e) {
  const pattern = /^[0-9\.]$/;

  return pattern.test(e.key);
}
