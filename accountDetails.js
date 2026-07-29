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
  accessDetailsData = '',
  growthDropDownJson = [],
  sowDropDownJson = [],
  accountOrder = [],
  accountTableSearchTerm = "",
  accountTablePageLength = 50;

const pathname = window.location.pathname;
// Extract the file name (last segment) from the pathname
const parts = pathname.split("/");
const fileName = parts.pop();
const accountFilterStorageKey = "accountDetailsSelectedFilter";
const accountFilterRestoreKey = "accountDetailsRestoreFilter";

function getSelectedAccountFilter() {
  var selected = $("input[type='radio'][name='res_acc']:checked");
  if (selected.length > 0) {
    return selected.val();
  }
  return "";
}

function saveSelectedAccountFilter(filterValue) {
  if (filterValue) {
    sessionStorage.setItem(accountFilterStorageKey, filterValue);
  }
}

function applySavedAccountFilter() {
  var shouldRestoreFilter = sessionStorage.getItem(accountFilterRestoreKey) === "true";
  var savedFilter = shouldRestoreFilter
    ? (sessionStorage.getItem(accountFilterStorageKey) || "ACTIVE")
    : "ACTIVE";
  var filterInput = $("input[type='radio'][name='res_acc'][value='" + savedFilter + "']");

  if (filterInput.length > 0) {
    filterInput.prop("checked", true);
  } else {
    $("#ACTIVE").prop("checked", true);
  }

  sessionStorage.removeItem(accountFilterRestoreKey);
  if (!shouldRestoreFilter) {
    sessionStorage.removeItem(accountFilterStorageKey);
  }
}

function markAccountFilterForRestore() {
  saveSelectedAccountFilter(getSelectedAccountFilter());
  sessionStorage.setItem(accountFilterRestoreKey, "true");
}

function bindAccountTableToolbar() {
  $("#accountEntriesSelect")
    .off("change.accountToolbar")
    .on("change.accountToolbar", function () {
      accountTablePageLength = parseInt($(this).val(), 10) || 50;
      if ($.fn.DataTable.isDataTable("#account_report")) {
        $("#account_report").DataTable().page.len(accountTablePageLength).draw();
      }
    });

  $("#accountTableSearch")
    .off("input.accountToolbar")
    .on("input.accountToolbar", function () {
      accountTableSearchTerm = $(this).val();
      if ($.fn.DataTable.isDataTable("#account_report")) {
        $("#account_report").DataTable().search(accountTableSearchTerm).draw();
      }
    });
}

function syncAccountTableToolbar() {
  var searchValue = accountTableSearchTerm || "";
  var pageLengthValue = accountTablePageLength || 50;

  if ($.fn.DataTable.isDataTable("#account_report")) {
    var accountTable = $("#account_report").DataTable();
    searchValue = accountTable.search();
    pageLengthValue = accountTable.page.len();
    accountTableSearchTerm = searchValue;
    accountTablePageLength = pageLengthValue;
  }

  $("#accountEntriesSelect").val(String(pageLengthValue));
  if (document.activeElement !== $("#accountTableSearch")[0]) {
    $("#accountTableSearch").val(searchValue);
  }
}

function getAccountDetailsJson(pageLevelAccess) {
  let apiURL = apiValue.url.replace("/app", "/view_all_account");
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
      query_type: "view_all_account",
      environment: apiValue.environment,
      emp_id: empId,
      mail_id: emp_email,
      department: emp_dep
    }),
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
      $.ajax({
        url: apiValue.url.replace("/app", "/get_account_order"),
        type: "POST",
        dataType: "json",
        async: false,
        data: JSON.stringify({}),
        success: function(orderRes) {
          if (Array.isArray(orderRes)) {
            accountOrder = orderRes;
          } else {
            accountOrder = [];
          }
        },
        error: function() {
          accountOrder = [];
        }
      });

      let orderMap = {};
      $.each(accountOrder, function (i, item) {
          let id = typeof item === 'object' && item !== null ? item.id : item;
          orderMap[id] = i + 1;
      });

      let orderedActive = [];
      let unorderedActive = [];
      let inactiveList = [];

      $.each(dataJson, function (i, acc) {
          if (acc.ACCOUNT_ACTIVE_FLAG === "Y") {
              if (orderMap[acc.ACCOUNT_ID]) {
                  orderedActive.push(acc);
              } else {
                  unorderedActive.push(acc);
              }
          } else {
              inactiveList.push(acc);
          }
      });

      orderedActive.sort(function (a, b) { return (orderMap[a.ACCOUNT_ID] || 0) - (orderMap[b.ACCOUNT_ID] || 0); });
      unorderedActive.sort(function (a, b) { return (a.ACCOUNT_NAME || '').localeCompare(b.ACCOUNT_NAME || ''); });
      inactiveList.sort(function (a, b) { return (a.ACCOUNT_NAME || '').localeCompare(b.ACCOUNT_NAME || ''); });

      accountData = orderedActive.concat(unorderedActive).concat(inactiveList);
      
      getSowViewData();
      assignDataToAccount();
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

function assignDataToAccount() {
  let accountDatas = [];
  var selectedVal = getSelectedAccountFilter();
  saveSelectedAccountFilter(selectedVal);

  switch (selectedVal) {
    case "ACTIVE":
      let active_account = accountData.filter(
        (actflag) => actflag.ACCOUNT_ACTIVE_FLAG === "Y"
      );
      prepareOverallDatatoUI(active_account);
      prepareDropdown();
      accountDatas = active_account;
      break;
    case "INACTIVE":
      let In_active_account = accountData.filter(
        (actflag) => actflag.ACCOUNT_ACTIVE_FLAG === "N"
      );
      prepareOverallDatatoUI(In_active_account);
      prepareDropdown();
      accountDatas = In_active_account;

      break;
    case "ALL":
      let account_data = accountData;
      prepareOverallDatatoUI(account_data);
      prepareDropdown();
      accountDatas = account_data;

      break;
    default:
      prepareDropdown();
      prepareOverallDatatoUI(accountData);
      accountDatas = accountData;
  }
  // if(sowDropDownJson != null){
  //  getSowViewData();
  // }

  appendAllOptionValues(accountDatas);
}
function prepareOverallDatatoUI(accountDatJson, selectedYearval) {
  if ($.fn.DataTable.isDataTable("#account_report")) {
    accountTableSearchTerm = $("#account_report").DataTable().search();
    accountTablePageLength = $("#account_report").DataTable().page.len();
  }

  // Sort by global account order if available
  if (accountOrder && accountOrder.length > 0) {
    var orderedAccounts = [], unorderedAccounts = [];
    var orderMap = {};
    $.each(accountOrder, function (i, item) { 
        let id = typeof item === 'object' && item !== null ? item.id : item;
        orderMap[id] = i + 1; 
    });
    $.each(accountDatJson, function (i, acc) {
      if (orderMap[acc.ACCOUNT_ID]) {
        orderedAccounts.push(acc);
      } else {
        unorderedAccounts.push(acc);
      }
    });
    orderedAccounts.sort(function (a, b) { return (orderMap[a.ACCOUNT_ID] || 99999) - (orderMap[b.ACCOUNT_ID] || 99999); });
    unorderedAccounts.sort(function (a, b) { return (a.ACCOUNT_NAME || '').localeCompare(b.ACCOUNT_NAME || ''); });
    accountDatJson = orderedAccounts.concat(unorderedAccounts);
  }

  $("#account_report tbody").empty();
  $("#account_report").dataTable().fnClearTable();
  $("#account_report").dataTable().fnDestroy();

  let accountBodyhtml = "";
  $.each(accountDatJson, function (i, account) {
    let acc = generateSafeId(account.ACCOUNT_NAME) + "_" + i;
    let delete_class = ""; //show_delete_app
    if (account.DELETE_UNDER_APPROVAL == "YES") {
      delete_class = "show_delete_app";
    }
    let active_state = "acc_name_data"
    // if(account.ACTIVE_FLAG !="Active"){
    //   active_state = "inactive-account"
    // }
    let accessRoleData = account.EMPLOYEE_DATA
    // let teamIdList = []
    // $.each(accessRoleData, function (j, teamRole) {
    //   if (teamRole.GROWTH_EMP_NAME != "") {
    //       teamIdList.push(teamRole.GROWTH_EMP_ID)
    //   }
    // });
    // console.log('teamIdList - ',teamIdList)
    let growthMemberData = account.EMPLOYEE_DATA
    let growthMemberHtml = "";
    let deliveryMemberData = account.DELIVERY_EMPLOYEE_DATA
    let deliveryMemberHtml = "";
    growthMemberData.map((emp, index) => {
      growthMemberHtml += `${emp.GROWTH_EMP_NAME}`;
      if (index !== growthMemberData.length - 1) {
        growthMemberHtml += ', ';
      }
    });
    deliveryMemberData.map((emp, index) => {
      deliveryMemberHtml += `${emp.DELIVERY_EMP_NAME}`;
      if (index !== deliveryMemberData.length - 1) {
        deliveryMemberHtml += ', ';
      }
    });
    accountBodyhtml = `<tr class="${acc} ${delete_class}">
                          <td>
                            <div class="${active_state} acc_name_buying_data">
                                <div data-account-name='${account.ACCOUNT_NAME}'
                                data-account-id='${account.ACCOUNT_ID}'
                                >${account.ACCOUNT_NAME}</div>
                            </div>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="ms_signed_date_${acc}_text">
                              ${account.MSA_SIGNED_DATE == "" ? "-" : convert(account.MSA_SIGNED_DATE)}
                            </div>
                            <input
                              type="text"
                              class="form-control placeicon dateData ${acc}_edit account_edit_field" id="ms_signed_date_${acc}"
                              placeholder="&#xf073; MM-DD-YY"
                              name="ms_signed_date"
                              autocomplete="off"
                              style="z-index: 1"
                            />
                          </td>
                          <td>\
                            <div class="${active_state} ${acc}_show account_not_edit"id="add_location_${acc}_text">
                              ${account.LOCATION == "" ? "-" : account.LOCATION}
                            </div>
                            <select class="${acc}_edit account_edit_field" id="add_location_${acc}">
                              <option value="-1">Location</option>
                              <option value="India">India</option>
                              <option value="US">US</option>
                            </select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="payment_term_${acc}_text">
                              ${(account.PAYMENT_TERM == "" || account.PAYMENT_TERM == "-1")
        ? "-"
        : account.PAYMENT_TERM
      }
                            </div>
                            <select class="${acc}_edit account_edit_field payment_term" id="payment_term_${acc}"></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="stakeHolder_${acc}_text">
                              ${account.ACCOUNT_POINT_OF_CONTACT == ""
        ? "-"
        : account.ACCOUNT_POINT_OF_CONTACT
      }
                            </div>
                            <input
                              type="text"
                              class="form-control ${acc}_edit account_edit_field"
                              id="stakeHolder_${acc}"
                              placeholder="Stake Holder"
                              name="stakeHolder"
                              autocomplete="off"
                              onkeydown="restrictSpecialCharactersById('stakeHolder_${acc}')"
                            />
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="add_contact_account_${acc}_text">
                              ${account.FACTSPAN_POC_NAME == ""
        ? "-"
        : account.FACTSPAN_POC_NAME
      }
                            </div>
                            <select class="${acc}_edit account_edit_field add_contact_account" id="add_contact_account_${acc}"></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="add_business_head_${acc}_text">
                              ${account.BUSINESS_HEAD_NAME == ""
        ? "-"
        : account.BUSINESS_HEAD_NAME
      }
                            </div>
                            <select class="${acc}_edit account_edit_field add_business_head" id="add_business_head_${acc}"></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="add_delivery_head_${acc}_text">
                              ${account.DELIVERY_HEAD_NAME == ""
        ? "-"
        : account.DELIVERY_HEAD_NAME
      }
                            </div>
                            <select class="${acc}_edit account_edit_field add_delivery_head" id="add_delivery_head_${acc}"></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="add_growth_head_${acc}_text">
                              ${growthMemberHtml == ""
        ? "-"
        : growthMemberHtml
      }
                            </div>
                            <select class="${acc}_edit account_edit_field add_growth_head" id="add_growth_head_${acc}" data-placeholder="Growth Members" name="add_growth_head[]" multiple></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="add_growth_head_${acc}_text">
                              ${deliveryMemberHtml == ""
        ? "-"
        : deliveryMemberHtml
      }
                            </div>
                            <select class="${acc}_edit account_edit_field add_growth_head" id="add_growth_head_${acc}" data-placeholder="Growth Members" name="add_growth_head[]" multiple></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="account_size_${acc}_text">
                              ${account.ACCOUNT_SIZE == ""
        ? "-"
        : account.ACCOUNT_SIZE
      }
                            </div>
                            <select class="${acc}_edit account_edit_field account_size" id="account_size_${acc}"></select>
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="min_bill_rate_uscan_${acc}_text">
                              ${account.BILLING_RATE_US == ""
        ? "-"
        : account.BILLING_RATE_US
      }
                            </div>
                            <input
                              type="text"
                              class="form-control ${acc}_edit account_edit_field"
                              id="min_bill_rate_uscan_${acc}"
                              placeholder="Min Bill Rate - USCAN "
                              name="min_bill_rate_uscan"
                              autocomplete="off"
                              min="0"
                              onkeypress="return validateNumber(event)"
                            />
                          </td>
                          <td>
                            <div class="${active_state} ${acc}_show account_not_edit" id="min_bill_rate_ind_${acc}_text">
                              ${account.BILLING_RATE_IND == ""
        ? "-"
        : account.BILLING_RATE_IND
      }
                            </div>
                            <input
                              type="text"
                              class="form-control ${acc}_edit account_edit_field"
                              id="min_bill_rate_ind_${acc}"
                              placeholder="Min Bill Rate - IND"
                              name="min_bill_rate_ind"
                              autocomplete="off"
                              min="0"
                              onkeypress="return validateNumber(event)"
                            />
                          </td>
                          <td class='action_data' style="white-space: nowrap;">
                              <button class="btn btn-info-account edit_button ${acc}_show account_not_edit ${account.ACCOUNT_ACTIVE_FLAG == "Y" ? "" : ""}"
                                data-account-id='${account.ACCOUNT_ID}'
                                id='${acc}'
                                data-id2='${acc}'
                                data-id='${JSON.stringify(account)}'
                                data-delcheck = '${account.DELETE_UNDER_APPROVAL
      }'
                                data-editcheck = '${account.EDIT_UNDER_APPROVAL
      }'
                                onclick="accountEdit(this)"
                                title= "Edit">
                                <i class="${account.ACCOUNT_ACTIVE_FLAG == "Y" ? "fa fa-pencil-square-o" : "fa fa-pencil-square-o"}" aria-hidden="true">
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
                              <button class="btn btn-info-account delete_button ${account.ACCOUNT_ACTIVE_FLAG == "Y" ? "" : ""}"
                                data-id='${JSON.stringify(account)}'
                                data-account-id='${account.ACCOUNT_ID}'
                                data-delcheck = '${account.DELETE_UNDER_APPROVAL
      }'
                                data-editcheck = '${account.EDIT_UNDER_APPROVAL
      }'
                                data-id2='${acc}'
                                onclick="accountDelete(this)"
                                title= "${account.ACCOUNT_ACTIVE_FLAG == "Y" ? "Active" : "In Active"}" >

                                <i class="${account.ACCOUNT_ACTIVE_FLAG == "Y" ? "fa fa-toggle-on fa-lg" : "fa fa-toggle-off fa-lg"}" aria-hidden="true">
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
                              <button class="btn btn-info-account view_button ${acc}_show account_not_edit"
                                data-account-name='${account.ACCOUNT_NAME}'
                                data-account-id='${account.ACCOUNT_ID}'
                                onclick="viewBuyingCenter(this)"
                                title="View Buying Center"
                                style="display: none;">
                                <i class="fa fa-users" aria-hidden="true"></i>
                              </button>
                          </td>
                        </tr>`;

    $("#account_body").append(accountBodyhtml);
    $("#ms_signed_date_" + generateSafeId(acc)).datepicker({
      format: "mm-dd-yy",
      uiLibrary: "bootstrap",
    });
    $("#ms_signed_date_" + generateSafeId(acc)).val(convert(account.MSA_SIGNED_DATE));
    $("#add_location_" + generateSafeId(acc)).val(
      `${account.LOCATION == "" ? "-1" : account.LOCATION}`
    );

    // $("#add_growth_head_" + acc).select2({});
    // $("#add_growth_head_" + acc).val(teamIdList).trigger('change');
    $("#stakeHolder_" + generateSafeId(acc)).val(
      `${account.ACCOUNT_POINT_OF_CONTACT == ""
        ? ""
        : account.ACCOUNT_POINT_OF_CONTACT
      }`
    );
    $("#add_contact_account_" + generateSafeId(acc)).val(
      `${account.FACTSPAN_ACCOUNT_HEAD_ID == ""
        ? "-1"
        : account.FACTSPAN_ACCOUNT_HEAD_ID
      }`
    );
    $("#add_location_" + generateSafeId(acc)).val(
      `${account.LOCATION == "" ? "-1" : account.LOCATION}`
    );
    $(".input-group-addon").hide();
    $(".account_edit_field").hide();
    $("#add_location_" + generateSafeId(acc)).select2({});
    let userRole = localStorage.getItem("user-role");
    // if (userRole == "admin") {
    //   $(".delete_button").show()
    //   $('#account_report tr').find('th:last, td:last').show();
    // } else {
    //   $('#account_report tr').find('th:last, td:last').hide();
    // }
    // let eachLevel = accessDetailsData.split(',')
    // $.each(eachLevel, function (l, level) {
    //   switch (level) {
    //     case "delete":
    //       $(".delete_button").show()
    //       break;
    //     case "edit":
    //       $(".delete_button").hide()
    //       $('#account_report tr').find('th:last, td:last').show();
    //       break;
    //     case "view":
    //       $('#account_report tr').find('th:last, td:last').hide();
    //       break;
    //   }
    // })
  });
  $("#account_report").dataTable({
    dom: "rtip",
    pageLength: accountTablePageLength,
    order: [],
    columnDefs: [{ orderable: false, targets: -1 }],
  });

  bindAccountTableToolbar();
  $("#account_report").DataTable().search(accountTableSearchTerm || "").draw();
  syncAccountTableToolbar();
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
      getApiTime(
        loadTimeInSeconds,
        "Account",
        "Revenue",
        "sow_input_drop_down",
        "success",
        fileName,
        "AccountDetailsPage",
        "view"
      );
      sowDropDownJson = data[0];
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(
        loadTimeInSeconds,
        "Account",
        "Revenue",
        "sow_input_drop_down",
        "error",
        fileName,
        "AccountDetailsPage",
        "view"
      );
      console.log("message Error" + JSON.stringify(error));
    },
  });
}
function prepareDropdown() {
  defaultBillArr = sowDropDownJson.DEFAULT_BILLRATE;
  bill_us_default = sowDropDownJson.DEFAULT_BILLRATE_US;
  bill_ind_default = sowDropDownJson.DEFAULT_BILLRATE_IND;
  sowAccountOpt = sowDropDownJson.ACCOUNT_SOW;
  growthDropDownJson = sowDropDownJson.GROWTH_EMPLOYEE_DATA_NEW;
  let empNameOption = "";
  sowAccountOptHtml += '<option value="-1">Select Account</option>';
  $.each(sowAccountOpt, function (i, account) {
    sowAccountOptHtml += `<option value='${account.ACCOUNT_NAME}'>${account.ACCOUNT_NAME}</option>`;
  });
  $(".add_contact_account").append(
    "<option value='-1'>Select Account Head</option>"
  );

  $(".add_business_head").append(
    "<option value='-1'>Select Busniess Head</option>"
  );

  $(".add_delivery_head").append(
    "<option value='-1'>Select Delivery Head</option>"
  );
  $.each(sowDropDownJson.EMPLOYEE_DATA, function (i, empName) {
    empNameOption += `<option value="${empName.EMPLOYEE_ID}">${empName.EMPLOYEE_NAME}</option>`;
  });
  $(".add_contact_account").append(empNameOption);
  $(".add_business_head").append(empNameOption);
  $(".add_delivery_head").append(empNameOption);
  let growthOption = "";
  // $(".add_growth_head").append(
  //   "<option value='-1' disabled selected>Select Growth Head</option>"
  // );
  $.each(growthDropDownJson, function (i, growth) {
    growthOption += `<option value="${growth.EMPLOYEE_ID}">${growth.EMPLOYEE_NAME}</option>`;
  })
  $(".add_growth_head").append(growthOption);
  account_class_arr = sowDropDownJson.ACCOUNT_CLASS;
  acc_size_arr = sowDropDownJson.ACCOUNT_SIZE;
  acc_payment_arr = sowDropDownJson.PAYMENT_TERM;
  let defaultBillRate = sowDropDownJson.DEFAULT_BILLRATE;
  default_min_rate_us = defaultBillRate[0].US_BILLING_RATE;
  default_min_rate_ind = defaultBillRate[0].IND_BILLING_RATE;
  $(".account_size").append('<option value="-1">Select Size</option>');
  $.each(acc_size_arr, function (i, acc_size) {
    accSizeHtml += '<option value="' + acc_size + '">' + acc_size + "</option>";
  });
  $(".account_size").append(accSizeHtml);
  $(".payment_term").append('<option value="-1">Select Payment Term</option>');
  $.each(acc_payment_arr, function (i, acc_pay) {
    accPayHtml += '<option value="' + acc_pay + '">' + acc_pay + "</option>";
  });
  $(".payment_term").append(accPayHtml);
  // appendAllOptionValues(accountData);
}
function appendAllOptionValues(accountDatJson) {
  $.each(accountDatJson, function (i, account) {
    let acc = generateSafeId(account.ACCOUNT_NAME) + "_" + i;
    let paymentTermData = `${account.PAYMENT_TERM == "" ? "-1" : account.PAYMENT_TERM
      }`;
    $("#payment_term_" + acc).val(paymentTermData);
    $("#add_contact_account_" + acc).val(
      `${account.FACTSPAN_ACCOUNT_HEAD_ID == ""
        ? "-1"
        : account.FACTSPAN_ACCOUNT_HEAD_ID
      }`
    );
    $("#add_business_head_" + acc).val(
      `${account.BUSINESS_HEAD == "" ? "-1" : account.BUSINESS_HEAD}`
    );
    $("#add_delivery_head_" + acc).val(
      `${account.DELIVERY_HEAD == "" ? "-1" : account.DELIVERY_HEAD}`
    );
    // $("#add_growth_head_" + acc).val(
    //   `${account.DELIVERY_HEAD == "" ? "-1" : account.DELIVERY_HEAD}`
    // );
    $("#account_size_" + acc).val(
      `${account.ACCOUNT_SIZE == "" ? "-1" : account.ACCOUNT_SIZE}`
    );
    $("#min_bill_rate_uscan_" + acc).val(
      `${account.BILLING_RATE_US == "" ? "0" : account.BILLING_RATE_US}`
    );
    $("#min_bill_rate_ind_" + acc).val(
      `${account.BILLING_RATE_IND == "" ? "0" : account.BILLING_RATE_IND}`
    );
    let teamIdList = []
    let accessRoleData = account.EMPLOYEE_DATA
    $.each(accessRoleData, function (j, teamRole) {
      if (teamRole.GROWTH_EMP_NAME != "") {
        teamIdList.push(teamRole.GROWTH_EMP_ID)
      }
    });
    // console.log('teamIdList - ',teamIdList)
    $("#add_growth_head_" + acc).select2({
      placeholder: "Growth Members",
      allowClear: true,
      // width: '100px',
    });
    if (teamIdList && teamIdList.length > 0) {
      $("#add_growth_head_" + acc).val(teamIdList).trigger('change'); // Apply the value if available
    } else {
      $("#add_growth_head_" + acc).val(null).trigger('change'); // Ensure placeholder displays if no value is set
    }

    $("#payment_term_" + acc).select2({});
    $("#add_contact_account_" + acc).select2({});
    $("#add_business_head_" + acc).select2({});
    $("#add_delivery_head_" + acc).select2({});
    $("#account_size_" + acc).select2({});
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
  // console.log("obj - ", obj);
  let deleteStatus = $(obj).attr("data-delcheck");
  let editStatus = $(obj).attr("data-editcheck");
  let account_id = $(obj).attr("data-account-id");
  let className = "." + $(obj).attr("data-id2");
  let idName = "#" + $(obj).attr("data-id2");
  let selectedAccount = $(obj).attr('data-id');
  console.log('selectedAccount - ', selectedAccount)
  localStorage.setItem('selectAccData', account_id);
  console.log('convert selected - ', account_id)
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
    // $(className + "_show").hide();
    // $(className + "_edit").show();
    window.open('accountEdit.html', '_blank');
    // window.location.href = "accountEdit.html";
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
  console.log("accountAllData", accountAllData);
  let account_id = $(obj).attr("data-account-id");
  let accName = escapeHtml($(obj).attr("data-account-name"));
  let className = $(obj).attr("data-id2");

  let takeApprovalResponse = "No";
  let updated_msa = $("#ms_signed_date_" + className).val();
  let updated_loc = $("#add_location_" + className + " option:selected").val();
  let updated_payment = $(
    "#payment_term_" + className + " option:selected"
  ).val();
  let updated_stake = $("#stakeHolder_" + className).val();
  let updated_account_head = $(
    "#add_contact_account_" + className + " option:selected"
  ).val();
  let updated_account_head_text = $(
    "#add_contact_account_" + className + " option:selected"
  ).text();
  let updated_business_head = $(
    "#add_business_head_" + className + " option:selected"
  ).val();
  let updated_business_head_text = $(
    "#add_business_head_" + className + " option:selected"
  ).text();
  let updated_delivery_head = $(
    "#add_delivery_head_" + className + " option:selected"
  ).val();
  let updated_delivery_head_text = $(
    "#add_delivery_head_" + className + " option:selected"
  ).text();
  let updated_growth_head = $(
    "#add_growth_head_" + className).val();
  let updated_growth_head_data = $("#add_growth_head_" + className).select2('data')
  let updated_growth_head_text = ''
  let team_old_list = [];
  $.each(accountAllData.EMPLOYEE_DATA, function (l, oldTeam) {
    if (oldTeam.GROWTH_EMP_ID != "") {
      team_old_list.push(oldTeam.GROWTH_EMP_ID)
    }
  })
  $.each(updated_growth_head_data, function (l, newTeam) {
    updated_growth_head_text += newTeam.text + ","
  })
  updated_growth_head_text = removeComma(updated_growth_head_text)
  updated_growth_head = removeDuplicatesfromArray(updated_growth_head)
  let removedTeamMember = $(team_old_list).not(updated_growth_head).get();
  let addedTeamMember = $(updated_growth_head).not(team_old_list).get();
  let removedTeamJson = getTeamJsonData(removedTeamMember, "remove")
  let addedTeamJson = getTeamJsonData(addedTeamMember, "update")
  let growthTeamDataJson = ""
  if (removedTeamJson != "" && addedTeamJson != "") {
    growthTeamDataJson = removedTeamJson + "," + addedTeamJson
  } else if (removedTeamJson != "") {
    growthTeamDataJson = removedTeamJson
  } else if (addedTeamJson != "") {
    growthTeamDataJson = addedTeamJson
  }
  let only_growth_status = 'No'
  let updated_size = $("#account_size_" + className + " option:selected").val();
  let updated_min_us = $("#min_bill_rate_uscan_" + className).val();
  let updated_min_ind = $("#min_bill_rate_ind_" + className).val();
  if (updated_msa == "") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select MSA date");
    return false;
  } else if (updated_loc == "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select Location");
    return false;
  } else if (updated_payment == "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select Payment Term");
    return false;
  } else if (updated_stake == "") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please enter stake holder");
    return false;
  } else if (updated_account_head == "-1" || updated_account_head == "" || updated_account_head == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select account head");
    return false;
  } else if (updated_business_head == "-1" || updated_business_head == "" || updated_business_head == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select business head");
    return false;
  } else if (updated_delivery_head == "-1" || updated_delivery_head == "" || updated_delivery_head == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select delivery head");
    return false;
  } else if (updated_size == "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select account size");
    return false;
  } else if (updated_size == "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select account size");
    return false;
  } else {
    let checkChanges = false;
    if (updated_min_ind != accountAllData.BILLING_RATE_IND) {
      checkChanges = true;
    } else if (updated_min_us != accountAllData.BILLING_RATE_US) {
      checkChanges = true;
    } else if (updated_loc != accountAllData.LOCATION) {
      checkChanges = true;
    } else if (updated_stake != accountAllData.ACCOUNT_POINT_OF_CONTACT) {
      checkChanges = true;
    } else if (updated_business_head != accountAllData.BUSINESS_HEAD) {
      checkChanges = true;
    } else if (updated_size != accountAllData.ACCOUNT_SIZE) {
      checkChanges = true;
    } else if (
      updated_account_head != accountAllData.FACTSPAN_ACCOUNT_HEAD_ID
    ) {
      checkChanges = true;
    } else if (updated_payment != accountAllData.PAYMENT_TERM) {
      checkChanges = true;
    } else if (convertDate(updated_msa) != accountAllData.MSA_SIGNED_DATE) {
      checkChanges = true;
    } else if (updated_delivery_head != accountAllData.DELIVERY_HEAD) {
      checkChanges = true;
    } else if (growthTeamDataJson != "") {
      checkChanges = true;
      only_growth_status = 'Yes'
    }
    if (checkChanges) {
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
      let billing_updated_array =
        '{ "BILLING_RATE" : "' +
        updated_min_ind +
        '", "LOCATION":"India"},{ "BILLING_RATE" : "' +
        updated_min_us +
        '", "LOCATION":"US"}';
      let acc_update_data =
        '{ "ACCOUNT_NAME" : "' +
        accName +
        '", "ACCOUNT_ID":"' +
        account_id +
        '", "LOCATION":"' +
        updated_loc +
        '", "ACCOUNT_POINT_OF_CONTACT":"' +
        updated_stake +
        '", "BUSINESS_HEAD":"' +
        updated_business_head +
        '", "ACCOUNT_SIZE":"' +
        updated_size +
        '", "BILLING_DATA":[' +
        billing_updated_array +
        '], "FACTSPAN_ACCOUNT_HEAD_ID":"' +
        updated_account_head +
        '", "PAYMENT_TERM":"' +
        updated_payment +
        '", "MSA_SIGNED_DATE":"' +
        convertDate(updated_msa) +
        '", "NOTES":"' +
        accountAllData.NOTES +
        '", "DELIVERY_HEAD":"' +
        updated_delivery_head +
        '", "FACTSPAN_POC_NAME":"' +
        updated_account_head_text +
        '", "BUSINESS_HEAD_NAME":"' +
        updated_business_head_text +
        '", "DELIVERY_HEAD_NAME":"' +
        updated_delivery_head_text +
        '"}';
      let billing_old_array =
        '{ "BILLING_RATE" : "' +
        accountAllData.BILLING_RATE_IND +
        '", "LOCATION":"India"},{ "BILLING_RATE" : "' +
        accountAllData.BILLING_RATE_US +
        '", "LOCATION":"US"}';
      let acc_old_data =
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
        billing_old_array +
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
        '"}';
      approverName = "Business head";
      let approvalData =
        '{ "TAKE_APPROVAL" : "' +
        takeApprovalResponse +
        '", "APPROVER":"' +
        approverName +
        '"}';

      let accUpdatedJsonData = {
        query_type: "edit_account",
        environment: apiValue.environment,
        user_details: "[" + accessDetails + "]",
        approver_data: "[" + approvalData + "]",
        access_data: "[" + growthTeamDataJson + "]",
        account_data: "[" + acc_update_data + "]",
        account_data_old: "[" + acc_old_data + "]",
        only_growth: only_growth_status
      };
      console.log("accUpdatedJsonData - ", accUpdatedJsonData);
      let apiURL = apiValue.url.replace("/app", "/edit_account");
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
            if (typeof clearAccountOrderCache === 'function') {
                clearAccountOrderCache();
            }
            toastr.options.timeOut = 2000; // 2s
            toastr.success(json.Response);
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            $("#" + className).prop("disabled", false);
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
            $("#ms_signed_date_" + className + "_text").html(updated_msa);
            $("#add_location_" + className + "_text").html(updated_loc);
            $("#payment_term_" + className + "_text").html(updated_payment);
            $("#stakeHolder_" + className + "_text").html(updated_stake);
            $("#add_contact_account_" + className + "_text").html(
              updated_account_head_text
            );
            $("#add_business_head_" + className + "_text").html(
              updated_business_head_text
            );
            $("#add_delivery_head_" + className + "_text").html(
              updated_delivery_head_text
            );
            $("#add_growth_head_" + className + "_text").html(
              updated_growth_head_text == '' ? '-' : updated_growth_head_text
            );
            $("#account_size_" + className + "_text").html(updated_size);
            $("#min_bill_rate_uscan_" + className + "_text").html(
              updated_min_us
            );
            $("#min_bill_rate_ind_" + className + "_text").html(
              updated_min_ind
            );
          } else {
            toastr.options.timeOut = 2000; // 2s
            toastr.error(json.Response);
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
}

function removeDuplicatesfromArray(arr) {
  return arr.filter((item,
    index) => arr.indexOf(item) === index);
}

const getTeamJsonData = (teamList, opr) => {
  let emplist = [], selTeamData = [], status = ""
  $.each(teamList, function (j, selEmp) {
    emplist = growthDropDownJson.filter((emp) => {
      return emp.EMPLOYEE_ID == selEmp
    })
    emplist = emplist[0]
    selTeamData.push(emplist)
  })
  let empDetails = "";
  if (opr == "remove") {
    status = "N"
  } else {
    status = "Y"
  }
  $.each(selTeamData, function (k, emp) {
    if (emp == undefined) {
      empDetails = ""
    } else {
      empDetails +=
        '{ "GROWTH_EMP_ID" : "' +
        emp.EMPLOYEE_ID +
        '", "GROWTH_EMP_NAME":"' +
        emp.EMPLOYEE_NAME +
        '", "ACTIVE_FLAG":"' +
        status +
        '"},';
    }
  })
  empDetails = removeComma(empDetails)
  return empDetails;
}

const removeComma = (removeCommaText) => {
  if (removeCommaText.endsWith(",")) {
    removeCommaText = removeCommaText.slice(0, -1);
  }
  return removeCommaText;
}

function accountDelete(obj) {
  console.log("HHHHHHH", obj)
  let accountAllData = $(obj).attr("data-id");
  accountAllData = $.parseJSON(accountAllData);
  let account_id = $(obj).attr("data-account-id");
  let className = $(obj).attr("data-id2");
  let deleteStatus = $(obj).attr("data-delcheck");
  let editStatus = $(obj).attr("data-editcheck");
  let queryTypeToApi = accountAllData.ACCOUNT_ACTIVE_FLAG === "N" ? "activate_account" : 'deactivate_account';
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
      message: accountAllData.ACCOUNT_ACTIVE_FLAG === "N"
        ? "Are you sure to Activate the account name - <b>" + accountAllData.ACCOUNT_NAME + "</b>?"
        : "Are you sure to In-Activate the account name - <b>" + accountAllData.ACCOUNT_NAME + "</b>?",
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
          markAccountFilterForRestore();
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
          let flag_data_var = accountAllData.ACCOUNT_ACTIVE_FLAG === "N" ? "activate" : "deactivate"
          console.log("flag_data_var", flag_data_var)
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
            flag_data_var +
            '"}';

          let approvalData =
            '{ "TAKE_APPROVAL" : "' +
            takeApprovalResponse +
            '", "APPROVER":"' +
            approverName +
            '"}';

          let accDeleteJsonData = {
            query_type: queryTypeToApi,
            environment: apiValue.environment,
            user_details: "[" + accessDetails + "]",
            // approver_data: "[" + approvalData + "]",
            account_data: "[" + account_delete_data + "]",
          };
          let apiURL = apiValue.url_ip + ":5004/add_remove_account";
          // let apiURL = apiValue.url.replace("/app", `/${queryTypeToApi}`);
          // let apiURL = apiValue.url_ip +"5003/" + `${queryTypeToApi}`
          const startTime = performance.now();
          $.ajax({
            url: apiURL,
            type: "POST",

            dataType: "json",
            crossDomain: true,
            format: "json",
            data: JSON.stringify(accDeleteJsonData),
            success: function (json) {
              console.log("JSON",json)
              if (json.Message == "Success") {
                const endTime = performance.now();
                const loadTimeInSeconds = (endTime - startTime) / 1000;
                getApiTime(loadTimeInSeconds, "Account", "Revenue", "remove_account", "success", fileName, "AccountDetailsPage", "delete");
                toastr.options.timeOut = 2000; // 2s
                toastr.success(json.Response);
                setTimeout(() => {
                  document.location.reload();
                }, 4000);
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

function viewBuyingCenter(obj) {
  let accountName = $(obj).attr("data-account-name");
  let accountId = $(obj).attr("data-account-id");
  let url = `buyingCenterDetails.html?accountName=${encodeURIComponent(accountName)}&accountId=${accountId}&action=view-edit&redirect=accountDetails`;
  window.open(url, '_blank');
}

/* ===== Account Reordering Functions ===== */

function openReorderPopup() {
  $("#reorderList").html('<div style="position:relative; height:150px;"><div class="loader"><div class="loader-wheel"></div><div class="loader-text"></div></div></div>');
  $("#reorderOverlay").addClass("show");
  
  let p1 = $.ajax({
    url: apiValue.url.replace("/app", "/get_account_order"),
    type: "POST",
    dataType: "json",
    crossDomain: true,
    data: JSON.stringify({})
  });
  
  let p2 = $.ajax({
    url: apiValue.url.replace("/app", "/get_active_accounts_list"),
    type: "POST",
    dataType: "json",
    crossDomain: true,
    data: JSON.stringify({})
  });

  $.when(p1, p2).done(function(orderRes, accountsRes) {
    let orderData = orderRes[0];
    let accountsData = accountsRes[0];

    if (Array.isArray(orderData)) {
      accountOrder = orderData;
    } else {
      accountOrder = [];
    }

    if (accountsData && accountsData.Message === "Failed") {
      toastr.error(accountsData.Response);
      closeReorderPopup();
      return;
    }
    
    renderReorderList(Array.isArray(accountsData) ? accountsData : []);
  }).fail(function() {
    toastr.error("Failed to load accounts for reordering");
    closeReorderPopup();
  });
}

let reorderAccountsList = [], prevReorderState = null, draggedReorderIndex = null;

function renderReorderListUI(q = "", focusId = null) {
  const wrap = document.getElementById('reorderList');
  wrap.innerHTML = '';
  reorderAccountsList.forEach((a, i) => {
    if (q && !a.ACCOUNT_NAME.toLowerCase().includes(q.toLowerCase())) return;
    const r = document.createElement('div');
    r.className = 'row';
    r.draggable = true;
    r.tabIndex = 0;
    r.dataset.accountId = a.ACCOUNT_ID;
    r.innerHTML = `<div class="grip" style="display:inline-flex; gap:3px;"><i class="fa fa-ellipsis-v"></i><i class="fa fa-ellipsis-v"></i></div><span class="num">${i+1}</span><span class="name">${escapeHtml(a.ACCOUNT_NAME)}</span><span class="badge">Active</span>`;
    r.ondragstart = e => { draggedReorderIndex = i; r.classList.add('dragging') };
    r.ondragend = () => { draggedReorderIndex = null; r.classList.remove('dragging') };
    r.ondragover = e => { e.preventDefault(); r.classList.add('drag-over') };
    r.ondragleave = () => { r.classList.remove('drag-over') };
    r.ondrop = e => {
      e.preventDefault();
      r.classList.remove('drag-over');
      if (draggedReorderIndex === i || draggedReorderIndex === null) return;
      prevReorderState = [...reorderAccountsList];
      const b = document.getElementById('undoBtn');
      if (b) { b.style.opacity = '1'; b.style.pointerEvents = 'auto'; }
      const item = reorderAccountsList.splice(draggedReorderIndex, 1)[0];
      reorderAccountsList.splice(i, 0, item);
      renderReorderListUI(document.getElementById('reorderSearch').value);
    };
    r.onkeydown = e => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const b = document.getElementById('undoBtn');
        if (b) { b.style.opacity = '1'; b.style.pointerEvents = 'auto'; }
        prevReorderState = [...reorderAccountsList];
        
        let newIdx = e.key === 'ArrowUp' ? i - 1 : i + 1;
        if (newIdx >= 0 && newIdx < reorderAccountsList.length) {
          const item = reorderAccountsList.splice(i, 1)[0];
          reorderAccountsList.splice(newIdx, 0, item);
          renderReorderListUI(document.getElementById('reorderSearch').value, item.ACCOUNT_ID);
        }
      }
    };
    if (focusId === a.ACCOUNT_ID) {
        setTimeout(() => r.focus(), 0);
    }
    wrap.appendChild(r);
  });
}

function renderReorderList(accounts) {
  var orderMap = {};
  $.each(accountOrder, function (i, item) { 
    let id = typeof item === 'object' && item !== null ? item.id : item;
    orderMap[id] = i + 1; 
  });

  var orderedList = [], unorderedList = [];
  $.each(accounts, function (i, acc) {
    if (orderMap[acc.ACCOUNT_ID]) {
      orderedList.push(acc);
    } else {
      unorderedList.push(acc);
    }
  });
  orderedList.sort(function (a, b) { return (orderMap[a.ACCOUNT_ID] || 0) - (orderMap[b.ACCOUNT_ID] || 0); });
  unorderedList.sort(function (a, b) { return (a.ACCOUNT_NAME || '').localeCompare(b.ACCOUNT_NAME || ''); });
  reorderAccountsList = orderedList.concat(unorderedList);

  prevReorderState = null;
  const b = document.getElementById('undoBtn');
  if (b) {
    b.style.opacity = '0.4';
    b.style.pointerEvents = 'none';
  }

  renderReorderListUI();
  $("#reorderOverlay").addClass("show");
}

function undoReorder() {
  if (!prevReorderState) return;
  reorderAccountsList = [...prevReorderState];
  prevReorderState = null;
  const b = document.getElementById('undoBtn');
  if (b) { b.style.opacity = '0.4'; b.style.pointerEvents = 'none'; }
  renderReorderListUI(document.getElementById('reorderSearch').value);
}

function closeReorderPopup() {
  $("#reorderOverlay").removeClass("show");
  $("#reorderList").empty();
  $("#reorderSearch").val("");
  reorderAccountsList = [];
  prevReorderState = null;
}

function filterReorderList() {
  renderReorderListUI(document.getElementById('reorderSearch').value);
}

function saveAccountOrder() {
  var newOrder = reorderAccountsList.map(a => a.ACCOUNT_ID);

  if (newOrder.length === 0) {
    toastr.error("No accounts to save");
    return;
  }

  $("#saveOrderBtn").prop("disabled", true).text("Saving...");

  let apiURL = apiValue.url.replace("/app", "/save_account_order");
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    data: JSON.stringify({ account_order: newOrder }),
    success: function (data) {
      $("#saveOrderBtn").prop("disabled", false).text("Apply order");
      if (data.Message === "Success") {
        accountOrder = newOrder;
        if (typeof clearAccountOrderCache === 'function') {
            clearAccountOrderCache();
        }
        
        const s = document.getElementById('savedIndicator');
        if (s) {
          s.classList.add('show');
          setTimeout(() => s.classList.remove('show'), 2500);
        }

        setTimeout(() => closeReorderPopup(), 1000);
        toastr.success("Account order saved");
        if (accountData.length > 0) {
          assignDataToAccount();
        }
      } else {
        toastr.error(data.Response || "Failed to save order");
      }
    },
    error: function () {
      $("#saveOrderBtn").prop("disabled", false).text("Apply order");
      toastr.error("Failed to save account order");
    }
  });
}

