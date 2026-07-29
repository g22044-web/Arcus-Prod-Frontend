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
              var today = new Date();
              var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
              var yyyy = today.getFullYear().toString();

              today = yyyy + "-" + mm;
              $("#team_date_filter").val(today)
              dataAssignment();
              setTimeout(function () {
                  $('#report_details').addClass('active');
                  $("#sow_amt_by_acc").addClass('active');
                  $("#sow_main").addClass('active');
                  $("#sow_amt_menu").addClass('active');
              }, 300);
              let pageLevelAccess = accessLevel[1]
              let eachLevel = pageLevelAccess.split(',')
              $.each(eachLevel, function (l, level) {
                switch (level) {
                  case "view":
                    $('#account_report_fixed tr').find('th:last, td:last').hide();
                    $('#account_report_tm tr').find('th:last').hide(); 
                    $(".updateTMDateButton").hide()                   
                    break;
                  case "edit":
                    $('#account_report_fixed tr').find('th:last, td:last').show();
                    $('#account_report_tm tr').find('th:last').show(); 
                    $(".updateTMDateButton").show()  
                    break;
                }
              })
            } else {
                window.location.href = "home.html"
            }
        } else {
            window.location.href = "home.html"
        }
    } else {
        window.location.href = "home.html"
    }

   
    $('.input-group-addon').hide();
   
    // getAccountDetailsJson();
    // getSowViewData();
    $(".loader").css("display", "none");
    $(".show_page").css("display", "block");
  }
  $(".new-sub-menu").hover(function () {
    $('.sub-menu').css('display', '')
    
  });
  $('#dashboard').click(function () {
    window.location.href = 'home.html';
    return false;
  });
  $('#reportsBackBtn').click(function () {
    window.location.href = 'reportsDashboard.html';
    return false;
  });
  $('#logout').click(function () {
    localStorage.clear();
    window.location.href = 'index.html';
    return false;
  });
});
let actualData = [];
let accountName = [];
let accountNameOption = "";
let sowNameOptions = "";
let firstSelectFilter = "";
let accessDetails;
let checkStatus = false; 
let callAPI = false;
let newAvailableResDataTM = "", comments_old = "", existingTMData = "";
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();
function dataAssignment() {
  let date = $("#team_date_filter").val();
  date = date+'-01'

  let accessDetails =
    '{ "ACCESS_LEVEL" : "' +
    accessLevelDetails +
    '", "Access":"' +
    accessData +
    '", "EDIT_ACCESS":"' +
    editAccessDetails +
    '", "EMAIL_ID":"' +
    sessionName +
    '", "GROUP_NAME":"' +
    groupNameDetails +
    '", "USERNAME":"' +
    empName +
    '", "USER_ID":"' +
    empId +
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
      query_type: "prepare_revenue_recognize_ui_page",
      environment: apiValue.environment,
      user_details: "[" + accessDetails + "]",
      MONTH: date,
    }),
    success: function (dataJson) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(loadTimeInSeconds,"reportRecognisedRevenue","Reports","prepare_revenue_recognize_ui_page","success",fileName,"reportRecognisedRevenue","view");
      actualData = dataJson;
      appendOptionData();
      assignDataToRecognized();
      let fixedPriceData = actualData.FIXED_PRICE_DATA;
      prepareDataToFixed(fixedPriceData);
      let timeMaterialData = actualData.TIME_AND_MATERIAL_DATA;
      prepareDataToTM(timeMaterialData);

      jQuery("#clientSelect").multiselect({
        columns: 1,
        placeholder: "Account",
        search: true,
      });
      jQuery("#sowNameSelect").multiselect({
        columns: 1,
        placeholder: "SOW Name",
        search: true,
      });
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(loadTimeInSeconds,"reportRecognisedRevenue","Reports","prepare_revenue_recognize_ui_page","error",fileName,"reportRecognisedRevenue","view");
      console.log("message Error" + JSON.stringify(error));
    },
  });
}
function appendOptionData() {
  let filterDataAccount = actualData.ACCOUNT_LIST;
  filterDataAccount.sort();
  for (let i = 0; i < filterDataAccount.length; i++) {
    accountNameOption += `<option class="emp_option" value="${filterDataAccount[i]}">${filterDataAccount[i]}</option>`;
  }
  let filterDataSow = actualData.SOW_LST;
  filterDataSow.sort();
  for (let i = 0; i < filterDataSow.length; i++) {
    sowNameOptions += `<option class="emp_option" value="${filterDataSow[i]}">${filterDataSow[i]}</option>`;
  }

  $("#clientSelect").empty()
  $("#clientSelect").append(accountNameOption);
  $("#sowNameSelect").append(sowNameOptions);
  assignDataToRecognized();
}
function filterData(newJSON) {
  sowNameOptions = "";
  clientOptions = "";

  const clientSelectFilter = $("#clientSelect").val();
  const sowNameSelectFilter = $("#sowNameSelect").val();
  var selected = $("input[type='radio'][name='emp_radio']:checked");
  if (selected.length > 0) {
    selectedVal = selected.val();
  }
  let newJson = newJSON;

  if (clientSelectFilter.length > 0) {
    newJson = newJson.filter((d) => {
      const obj = clientSelectFilter.find((f) => d.ACCOUNT_NAME == f);
      return obj ? true : false;
    });
  }
 
  var selectedVal = "";
  var selected = $("input[type='radio'][name='res_acc']:checked");
  if (selected.length > 0) {
    selectedVal = selected.val();
  }

  switch (selectedVal) {
    case "FIXED":
      prepareDataToFixed(newJson);
      break;
    case "TIME":
      prepareDataToTM(newJson);
      break;
    default:
      prepareDataToFixed(newJson);
  }

  if (firstSelectFilter != "") {
    let lenOfSelFilter = $("#" + firstSelectFilter).val().length;
    let checkFilterData = true;

    let clientSelectFilter = $("#clientSelect").val();
    if (clientSelectFilter.length > 0) {
      checkFilterData = false;
    }
   

    if (lenOfSelFilter == 0 && checkFilterData) {
      firstSelectFilter = "";
      $("#clientSelect").empty();
      $("#clientSelect").append(accountNameOption);

      $("#sowNameSelect").empty();
      $("#sowNameSelect").append(sowNameOptions);

      callMultiselectOption();
    } else {
      reassignFilterOption(firstSelectFilter);
    }
  }
}
function callMultiselectOption() {
  $("#clientSelect").multiselect("reload");
  $("#clientSelect").multiselect({
    columns: 1,
    placeholder: "Account",
    search: true,
  });
  $("#sowNameSelect").multiselect("reload");
  $("#sowNameSelect").multiselect({
    columns: 1,
    placeholder: "SOW Name",
    search: true,
  });
}
function reassignFilterOption(selectedFilterCol) {
  let clientSelectFilter = $("#clientSelect").val();

  let filAccName = "",
    filSowName = "";
  var selectedVal = "";
  var selected = $("input[type='radio'][name='res_acc']:checked");
  if (selected.length > 0) {
    selectedVal = selected.val();
  }
  switch (selectedVal) {
    case "FIXED":
      $("#account_report_fixed tbody tr").each(function () {
        filAccName += $(this).find("td").eq(1).html() + ",";
        filSowName += $(this).find("td").eq(5).html() + ",";
      });

      break;
    case "TIME":
      $("#account_report_tm tbody tr").each(function () {
        filAccName += $(this).find("td").eq(0).html() + ",";
        filSowName += $(this).find("td").eq(1).html() + ",";
      });

      break;
  }

  filAccName = removeDuplicates(filAccName);
  filSowName = removeDuplicates(filSowName);
  
}
function assignDataToRecognized() {
  var selectedVal = "";
  var selected = $("input[type='radio'][name='res_acc']:checked");
  if (selected.length > 0) {
    selectedVal = selected.val();
  }

  let newJSON;

  switch (selectedVal) {
    case "FIXED":
      $("#report_fixed").show();
      $("#report_tm").hide();
      let fixedPriceData = actualData.FIXED_PRICE_DATA;
      newJSON = fixedPriceData;

      $(function () {
        $("#clientSelect").change(function () {
          firstSelectFilter = "clientSelect";
          filterData(newJSON);
        });
        $("#sowNameSelect").change(function () {
          firstSelectFilter = "sowNameSelect";
          filterData(newJSON);
        });
      });
      break;
    case "TIME":
      $("#report_fixed").hide();
      $("#report_tm").show();
      let timeMaterialData = actualData.TIME_AND_MATERIAL_DATA;
      newJSON = timeMaterialData;
      $(function () {
        $("#clientSelect").change(function () {
          firstSelectFilter = "clientSelect";
          filterData(newJSON);
        });
        $("#sowNameSelect").change(function () {
          firstSelectFilter = "sowNameSelect";
          filterData(newJSON);
        });
      });
      break;
    default:
      $("#report_fixed").show();
      $("#report_tm").hide();
      let fixedPriceDatas = actualData.FIXED_PRICE_DATA;
      newJSON = fixedPriceDatas;
      $(function () {
        $("#clientSelect").change(function () {
          firstSelectFilter = "clientSelect";
          filterData(newJSON);
        });
        $("#sowNameSelect").change(function () {
          firstSelectFilter = "sowNameSelect";
          filterData(newJSON);
        });
      });
  }
}
function prepareDataToFixed(fixedPriceData) {
  $("#account_report_fixed tbody").empty();
  $("#account_report_fixed").dataTable().fnClearTable();
  $("#account_report_fixed").dataTable().fnDestroy();

  let accountBodyhtml = "";


  $.each(fixedPriceData, function (i, account) {
    let acc = account.ACCOUNT_NAME.replace(/ /g, "_") + "_" + i;
  
    let numberProjectedAmount = Math.round(account.SUPPLY_MONTH_AMOUNT);
    const formattedProjectedAmount =
      numberProjectedAmount.toLocaleString("en-US");
    let numberActualAmount = Math.round(account.ACTUAL_MONTH_AMOUNT);
    const formattedActualAmount = numberActualAmount.toLocaleString("en-US");
    let comments = account.REASON_FOR_CHANGE;
    console.log("account - ",account)
    accountBodyhtml = `<tr class="acc_name_${i + 1}">
                            <td style="display: none" class="account_id_${
                              i + 1
                            }">${account.ACCOUNT_ID}</td> 
        
                            <td class="account_name_${i + 1}">${
      account.ACCOUNT_NAME
    }</td>
                            <td style="display: none" class="sow_id_${i + 1}">${
      account.SOW_ID
    }</td> <td style="display: none" class="sow_unique_id_${i + 1}">${
      account.UNIQUE_ID
    }</td>
                            <td style="display: none" class="actual_hours_${
                              i + 1
                            }">${account.ACTUAL_MONTH_HOURS}</td> 
                            <td style="display: none" class="billing_model_${
                              i + 1
                            }">${account.BILLING_MODEL}</td> 
                            <td class="sow_name_${i + 1}">${
      account.SOW_NAME
    }</td>
                            <td style="display: none" class="legal_end_date_${
                              i + 1
                            }">${account.LEGAL_END_DATE}</td> 
                            <td style="display: none" class="legal_start_date_${
                              i + 1
                            }">${account.LEGAL_START_DATE}</td> 
                            <td style="display: none" class="month_${i + 1}">${
      account.MONTH
    }</td> 
                           
                            <td style="display: none" class="supply_month_hours_${
                              i + 1
                            }">${account.SUPPLY_MONTH_HOURS}</td>
                            <td style="display: none" class="actual_amount_${
                              i + 1
                            }">${Math.round(account.ACTUAL_MONTH_AMOUNT)}</td>  
                            <td class= "proj_month_amount_${
                              i + 1
                            }">$ ${formattedProjectedAmount}</td>
                            <td class="current_actual_amount">
                            <div class="curr_act_amt" id="current_actual_amount_${
                              i + 1
                            }">
                            <span  class="curentactualamounttext">$${formattedActualAmount}</span>
                            </div>
                          <input type="text" class="form-control placeicon dateData resourceDate curentactualamount" 
                              id="current_actual_amount_${i + 1}_input"
                              class="curr_act_amt"
                              data-id = "${i + 1}" 
                              name="resource_start_date" 
                              autocomplete="off" 
                              value= "$${formattedActualAmount}"
                             
                              style="z-index: 1;"/>
                          </td>
                         
                          <td>
                            <div class="acc_name_data_reason">
                            <textarea class="res_comments_${
                              i + 1
                            }" id="ava_emp_comment_${
      i + 1
    }" rows="2" cols="70" maxlength="250"  required>${comments}</textarea> 
                            </div>
                          </td>
                          
                          <td>
                          <button class="btn btn-info-allocation header-button show-bu-head-data" onclick="updateFPrDate(this);" id="current_actual_amount_${
                            i + 1
                          }_button" data-id="current_actual_amount_${i + 1}"><i
        class="fa fa-pencil-square-o"></i></button>
                          </td>
                          
                          </tr>`;

    $("#account_body_fixed").append(accountBodyhtml);
    $(".input-group-addon").hide();
    $(".curentactualamount").hide();
    $(".res_comments_" + (i + 1)).prop("disabled", true);
  });

  //   });
  // });
}
function prepareDataToTM(timeMaterialData) {
  $("#account_report_tm tbody").empty();
  $("#account_report_tm").dataTable().fnClearTable();
  $("#account_report_tm").dataTable().fnDestroy();
  

  let accountBodyhtmltm = "";


  $.each(timeMaterialData, function (i, account) {
    let acc = account.ACCOUNT_NAME.replace(/ /g, "_");
    let sowFixedPriceData = account.ACCOUNT_LEVEL_SOW_DATA;
    let lengthAcc = 0;
    accStatus = 0;
    $.each(sowFixedPriceData, function (j, sowData) {
      let resourceFixedData = sowData.RESOURCE_AMOUNT_DATA;
      lengthAcc += resourceFixedData.length;
    });
    let AccountNameHtml = `<td class="account_bg" style="color:#000000 !important" rowspan='${lengthAcc}'>${account.ACCOUNT_NAME}</td>`;
    $.each(sowFixedPriceData, function (j, sowData) {
      let resourceFixedData = sowData.RESOURCE_AMOUNT_DATA;
      let sowStatus = 0;
      let lengthSow = resourceFixedData.length;
      let sowName = sowData.SOW_ID
      let sowNameHtml = `<td class="account_bg_sow" style="color:#000000 !important;border-bottom:1px solid #e8e7e7" rowspan='${resourceFixedData.length}'>${sowData.SOW_NAME}</td>`;
      
      $.each(resourceFixedData, function (k, resourceData) {
        let employeeName = (resourceData.EMPLOYEE_NAME).replace(/ /g, "_");
        let empStatus = 0;
        let buttonHTML = `<td style="border-bottom:1px solid #e8e7e7" rowspan='${resourceFixedData.length}'><button class="btn btn-info-allocation header-button show-bu-head-data updateTMDateButton" onclick="updateTMDate(this);" id="current_actual_hours_button" data-id="current_actual_hours" data-id2="${sowName}" data-id3='${JSON.stringify(resourceFixedData)}' data-id4='current_actual_amount' data-id5='tm_comments' data-id6="current_leave_days_${sowName}" data-id7="supply_month_hours_${sowName}"><i class="fa fa-pencil-square-o"></i></button></td>`;
        
        let numberActualAmount = resourceData.ACTUAL_MONTH_AMOUNT;
        const formattedProjectedAmount =
        numberActualAmount.toLocaleString("en-US");
        const comments = resourceData.REASON_FOR_CHANGE;
       
        
        accountBodyhtmltm = `<tr class="account_lg ${acc}">
                          ${accStatus == 0 ? AccountNameHtml : ""}
                          ${sowStatus == 0 ? sowNameHtml : ""}
                          <td style="border-bottom:1px solid #e8e7e7">${resourceData.EMPLOYEE_NAME}</td>
                          <td style="border-bottom:1px solid #e8e7e7">${resourceData.JOB_ROLE}</td>
                          <td style="border-bottom:1px solid #e8e7e7">${resourceData.LOCATION}</td>
                          <td style="border-bottom:1px solid #e8e7e7" id="supply_month_hours_${sowName}_${k + 1}"data-id7 ="supply_month_hours_${sowName}" >${resourceData.SUPPLY_MONTH_HOURS}</td>
                          <td style="display: none" class="billing_rate">${resourceData.BILLING_RATE}</td>
                          <td class="current_actual_hours" style="border-bottom:1px solid #e8e7e7">
                          <div>
                          <span  class="curentactualhourstext ${sowName}"  id="current_actual_hours_${sowName}_${k + 1}"> ${
                            resourceData.ACTUAL_MONTH_HOURS
                          }</span>
                     </div>
                             <input type="text" class="form-control placeicon dateData resourceDate curentactualhours ${sowName}_input" 
                             id="current_actual_hours_${sowName}_${k + 1}_input"
                            data-id = "${i + 1}" 
                            name="resource_start_date" 
                            autocomplete="off" 
                            value= "${resourceData.ACTUAL_MONTH_HOURS}"
                            style="z-index: 1;"
                            onChange="calculateAmount(this);" id="current_actual_hours_button" data-id8="current_actual_hours" data-id2="${sowName}" data-id3='${JSON.stringify(resourceFixedData)}' data-id4='current_actual_amount' data-id5='tm_comments' data-id6="current_leave_days_${sowName}" data-id7="supply_month_hours_${sowName}"
                            />
                          </td>

                          <td class="current_leave_days" style="border-bottom:1px solid #e8e7e7">
                          
                          <div>
                          <span  class="curentleavedaystext ${sowName}"  id="current_leave_days_${sowName}_${k + 1}"> ${
                            resourceData.LEAVE_OR_EXTRA_DAYS}</span>
                     </div>
                             <input type="text" class="form-control placeicon dateData resourceDate curentleavedays ${sowName}_leave" 
                             id="current_leave_days_${sowName}_${k + 1}_input"
                            data-id6 = "current_leave_days_${sowName}"
                            name="resource_start_date" 
                            autocomplete="off" 
                            value= "${resourceData.LEAVE_OR_EXTRA_DAYS}"
                            style="z-index: 1;"
                            onChange="calculateAmount(this);" id="current_actual_hours_button" data-id8="current_actual_hours" data-id2="${sowName}" data-id3='${JSON.stringify(resourceFixedData)}' data-id4='current_actual_amount' data-id5='tm_comments' data-id6="current_leave_days_${sowName}" data-id7="supply_month_hours_${sowName}"
                            />
                          </td>
                        <td style="border-bottom:1px solid #e8e7e7" id="current_actual_amount_${sowName}_${k + 1}"> $${formattedProjectedAmount}</td>
                        <td style="border-bottom:1px solid #e8e7e7"><textarea class="res_comments_${sowName}" id="tm_comments_${sowName}_${k + 1}" data-id5 = "tm_comments" data-id2="${sowName}" rows="2" cols="50" maxlength="250" DISABLED>${resourceData.REASON_FOR_CHANGE}</textarea></td>
                        ${sowStatus == 0 ? buttonHTML : ""}
                    
                        </tr>`;
        accStatus++;
        empStatus++;
        sowStatus++;
        $("#account_report_tm").append(accountBodyhtmltm);
        $(".curentactualhours").hide();
        $(".curentleavedays").hide();
      });
    });
  });
  
}

function removeDuplicates(namesUnique) {
  if (namesUnique.endsWith(",")) {
    namesUnique = namesUnique.slice(0, -1);
  }
  let uniueList = namesUnique.split(",");
  uniueList = [...new Set(uniueList)];
  removeItemAll(uniueList, "-");
  let opt = "";
  $.each(uniueList, function (i, list) {
    opt += `<option value="${list}">${list}</option>`;
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
function updateFPrDate(obj) {
  let dataId = $(obj).attr("data-id");
  let getCount = dataId.replace("current_actual_amount_", "");
  let getHtml = $("#" + dataId + "_button").html();
  if (getHtml == '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>') {
    $("#" + dataId + "_button").html("<i class='fa fa-pencil-square'></i>");
    $("#" + dataId + "_input").show();
    $("#" + dataId).hide();
    $(".res_comments_" + getCount).prop("disabled", false);
    $(".current_actual_amount_" + getCount + "_input").show();
    $(".current_actual_amount_" + getCount).hide();
  } else {
    let amount = $("#" + dataId).html();
    let account_id,
      account_name,
      actual_month_amount,
      actual_month_hours,
      billing_model,
      month,
      old_actual_amount,
      unique_id;
    let legal_start_date,
      legal_end_date,
      sow_id,
      sow_name,
      supply_month_amount,
      supply_month_hours,
      comments;
    account_id = $(".account_id_" + getCount).html();
    unique_id = $(".sow_unique_id_" + getCount).html();
    account_name = $(".account_name_" + getCount).html();
    actual_month_amount = $("#"+dataId+"_input").val();
    actual_month_amount = actual_month_amount.replace(/[^0-9.]/g, "")
    actual_month_hours = $(".actual_hours_" + getCount).html();
    billing_model = $(".billing_model_" + getCount).html();
    month = $(".month_" + getCount).html();
    legal_start_date = $(".legal_start_date_" + getCount).html();
    legal_end_date = $(".legal_end_date_" + getCount).html();
    sow_id = $(".sow_id_" + getCount).html();
    sow_name = $(".sow_name_" + getCount).html();
    supply_month_amount = $(".proj_month_amount_" + getCount).html();
    supply_month_hours = $(".supply_month_hours_" + getCount).html();
    comments = $(".res_comments_" + getCount).val();
    
    old_actual_amount = $(".actual_amount_" + getCount).html();
    if(actual_month_amount != old_actual_amount){
      if(comments != ""){
        let old_comments = "";
        let newAvailableResData = "";
        newAvailableResData +=
          '{ "SOW_ID" : "' +
          sow_id +
          '", "UNIQUE_ID":"' +
          unique_id +
          '", "LEGAL_START_DATE":"' +
          legal_start_date +
          '", "LEGAL_END_DATE":"' +
          legal_end_date +
          '", "BILLING_MODEL":"' +
          billing_model +
          '", "MONTH":"' +
          month +
          '", "SUPPLY_MONTH_HOURS":"' +
          supply_month_hours +
          '", "SUPPLY_MONTH_AMOUNT":"' +
          supply_month_amount +
          '", "ACTUAL_MONTH_HOURS":"' +
          actual_month_hours +
          '", "ACTUAL_MONTH_AMOUNT":"' +
          actual_month_amount +
          '", "SOW_NAME":"' +
          sow_name +
          '", "ACCOUNT_NAME":"' +
          account_name +
          '", "ACCOUNT_ID":"' +
          account_id +
          '", "REASON_FOR_CHANGE":"' +
          comments +
          '"},';
        let accessDetails =
          '{ "ACCESS_LEVEL" : "' +
          accessLevelDetails +
          '", "Access":"' +
          accessData +
          '", "EDIT_ACCESS":"' +
          editAccessDetails +
          '", "EMAIL_ID":"' +
          sessionName +
          '", "GROUP_NAME":"' +
          groupNameDetails +
          '", "USERNAME":"' +
          empName +
          '", "USER_ID":"' +
          empId +
          '"}';
        let recognisedRevenueOldData = "";
        recognisedRevenueOldData +=
          '{ "SOW_ID" : "' +
          sow_id +
          '", "UNIQUE_ID":"' +
          unique_id +
          '", "LEGAL_START_DATE":"' +
          legal_start_date +
          '", "LEGAL_END_DATE":"' +
          legal_end_date +
          '", "BILLING_MODEL":"' +
          billing_model +
          '", "MONTH":"' +
          month +
          '", "SUPPLY_MONTH_HOURS":"' +
          supply_month_hours +
          '", "SUPPLY_MONTH_AMOUNT":"' +
          supply_month_amount +
          '", "ACTUAL_MONTH_HOURS":"' +
          actual_month_hours +
          '", "ACTUAL_MONTH_AMOUNT":"' +
          old_actual_amount +
          '", "SOW_NAME":"' +
          sow_name +
          '", "ACCOUNT_NAME":"' +
          account_name +
          '", "ACCOUNT_ID":"' +
          account_id +
          '", "REASON_FOR_CHANGE":"' +
          old_comments +
          '"},';
       
        $.ajax({
          url: apiValue.url,
          type: "POST",
          dataType: "json",
          crossDomain: true,
          format: "json",
          async: false,
          mode: "no-cors",
          data: JSON.stringify({
            query_type: "recognized_revenue_data_insert",
            environment: apiValue.environment,
            user_details: "[" + accessDetails + "]",
            RECOGNIZED_REVENUE_DATA: "[" + newAvailableResData + "]",
            RECOGNIZED_REVENUE_OLD_DATA: "[" + recognisedRevenueOldData + "]",
          }),
          success: function (dataJson) {
            let response = dataJson;
            $("#" + dataId + "_button").html(
              '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>'
            );
            $("#" + dataId + "_input").hide();
            $("#" + dataId).html($("#" + dataId + "_input").val());
            $("#" + dataId).show();
            $(".res_comments_" + getCount).val("");
            $(".res_comments_" + getCount).prop("disabled", true);
            $(".current_actual_amount_" + getCount + "_input").hide();
            $(".current_actual_amount_" + getCount).show();
            $(".actual_amount_"+getCount).html(actual_month_amount)
          },
          error: function (error) {
            console.log("message Error" + JSON.stringify(error));
          },
        });
      }else{
        toastr.error("Please add the comments");
        return false;
      }   
    }else{
      $("#" + dataId + "_button").html(
        '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>'
      );
      $("#" + dataId + "_input").hide();
      $("#" + dataId).html($("#" + dataId + "_input").val());
      $("#" + dataId).show();
      $(".res_comments_" + getCount).val("");
      $(".res_comments_" + getCount).prop("disabled", true);
      $(".current_actual_amount_" + getCount + "_input").hide();
      $(".current_actual_amount_" + getCount).show();
    }
    
  }
  // }
}
function updateTMDate(obj) {
  let comments_new = "", comments_required = true
  let dataId = $(obj).attr("data-id");
  let dataId1 = $(obj).attr("data-id4");
  let dataComment = $(obj).attr("data-id5");
 
  let sowNameData = $(obj).attr("data-id2");
  let leavedays = $(obj).attr("data-id6");
  let supplyhours = $(obj).attr("data-id7");
  
  let allSowData = JSON.parse($(obj).attr("data-id3"));

  
  let getHtml = $("#" + dataId + "_button").html();
  if (getHtml == '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>') {
    $("#" + dataId + "_button").html("<i class='fa fa-pencil-square'></i>");
    $("." + sowNameData +'_input').show();
    $("." + sowNameData).hide();
    $("." + sowNameData +'_leave').show();

    $(".res_comments_"+ sowNameData).prop("disabled", false);
    
  } else {
    $("#" + dataId + "_button").html(
      '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>'
    );
    $("." + sowNameData + "_input").hide();
    $("." + sowNameData +"_leave").hide();
    let val = $("." + sowNameData + "_input").val();
    
    
    $.each(allSowData, function(l, sow){
      if(comments_required){
      let count = l+1;
      let leave_days_count = $("#"+leavedays+"_"+count+"_input").val();
      let old_leave_days = $("#"+leavedays+"_"+count).html();
      old_leave_days = old_leave_days.trim();
    if(leave_days_count !== old_leave_days) {
      let total_leave_days = leave_days_count - old_leave_days;
      let previousValuess =$("#"+supplyhours+"_"+count).html();
      let actual_hours_day = $("#"+dataId+"_"+sowNameData+"_"+count+"_input").val();
      let actual_leave_hours = actual_hours_day-(total_leave_days * 8);
      let billingRate = sow.BILLING_RATE;
      
      
      $("#"+dataId+"_"+sowNameData+"_"+count+"_input").empty();
     
      $("#"+dataId+"_"+sowNameData+"_"+count+"_input").val(actual_leave_hours);
      
    } 
     
      let actual_hours = $("#"+dataId+"_"+sowNameData+"_"+count+"_input").val();
      let previousValue = $("#"+dataId+"_"+sowNameData+"_"+count).html();
      
      let previousValues = sow.ACTUAL_MONTH_HOURS;
    
      let billingRate = sow.BILLING_RATE;
   
      let total_amount = billingRate * actual_hours;
    
     
      let actual_amount_olds = sow.ACTUAL_MONTH_AMOUNT
      let ammont_total = total_amount;
      total_amount = total_amount.toLocaleString("en-US");
      if(actual_hours != previousValues){
        checkStatus = true;
        $("#"+dataComment+"_"+sowNameData+"_"+count).empty();
        let comments_new = $("#"+dataComment+"_"+sowNameData+"_"+count).val();
        let comment_required = $("#"+dataComment+"_"+sowNameData+"_"+count).val();
        if(comment_required == ""){
         toastr.error("Please add the comments");
         comments_required = false
        checkStatus = false;
         $("." + sowNameData +'_leave').show();
         $("." + sowNameData +'_input').show();
         $("." + sowNameData).hide();
        
        
        //updateTMDate();
         let total_amount = billingRate * actual_hours;
         $("#"+dataId+"_"+sowNameData+"_"+count).empty();
     

         $("." + sowNameData +'_input').show();
       
        $(".res_comments_"+ sowNameData).prop("disabled", false);
      
        
         
        }else{
          $("#"+leavedays+"_"+count).html($("#"+leavedays+"_"+count+ "_input").val());
          $("#"+dataId+"_"+sowNameData+"_"+count).html($("#" + dataId +"_"+sowNameData+"_"+count+ "_input").val());
          $("#"+dataId1+"_"+sowNameData+"_"+count).empty();
          $("#"+dataId1+"_"+sowNameData+"_"+count).append(total_amount);
          $("."+sowNameData).show();
          $(".res_comments_"+ sowNameData).prop("disabled",true);
          checkStatus = true;
          comments_new =  $("#"+dataComment+"_"+sowNameData+"_"+count).val();
          $("#"+dataComment+"_"+sowNameData+"_"+count).empty();
          $("#"+dataComment+"_"+sowNameData+"_"+count).append(comments_new)
           
        } 
      
      }
      else 
      {
        $("#"+dataId+"_"+sowNameData+"_"+count).html($("#" + dataId +"_"+sowNameData+"_"+count+ "_input").val());
        $("#"+leavedays+"_"+count).html($("#"+leavedays+"_"+count+ "_input").val());
        total_amount = $("#"+dataId1+"_"+sowNameData+"_"+count).html();
        
        $("#"+dataId1+"_"+sowNameData+"_"+count).empty();
        // total_amount = Math.round(total_amount);
        $("#"+dataId1+"_"+sowNameData+"_"+count).append(total_amount);
        if(checkStatus){
    
        $("."+sowNameData).show();
          $(".res_comments_"+ sowNameData).prop("disabled",true);
        }
        $("."+sowNameData).show();
        checkStatus = true;
       
        let comments_new =  $("#"+dataComment+"_"+sowNameData+"_"+count).val();
        $("#"+dataComment+"_"+sowNameData+"_"+count).empty();
        $("#"+dataComment+"_"+sowNameData+"_"+count).append(comments_new)
        
      }
       if(checkStatus){
      let accountid, accountname, actual_amount_old, actual_hours_old, allocation_start_date,allocation_end_date, billingmodel;
      let billingrate,billingstatus,demandbillingstatus,demand_end_date,demand_start_date,employeeid;
      let employeename,jobrole,legal_start_date,legal_end_date,location,month,resourcegroup,sowid,sowname;
      let subresgrp,supply_month_hours,supply_amount,leave_extra_days,unique_id;
      accountid = sow.ACCOUNT_ID;
      accountname =  sow.ACCOUNT_NAME;
      unique_id = sow.UNIQUE_ID
      actual_hours_old = sow.ACTUAL_MONTH_HOURS
      actual_amount_old = sow.ACTUAL_MONTH_AMOUNT
      allocation_start_date = sow.ALLOCATION_START_DATE
      allocation_end_date = sow.ALLOCATION_END_DATE
      billingmodel = sow.BILLING_MODEL
      billingrate = sow.BILLING_RATE
      billingstatus = sow.BILLING_STATUS
      demandbillingstatus = sow.DEMAND_BILLING_STATUS
      demand_end_date = sow.DEMAND_END_DATE
      demand_start_date = sow.DEMAND_START_DATE
      employeeid = sow.EMPLOYEE_ID
      employeename = sow.EMPLOYEE_NAME
      jobrole = sow.JOB_ROLE
      legal_start_date = sow.LEGAL_START_DATE
      legal_end_date = sow.LEGAL_END_DATE
      location = sow.LOCATION
      month = sow.MONTH
      resourcegroup = sow.RESOURCE_GROUP
      sowid = sow.SOW_ID
      sowname = sow.SOW_NAME
      subresgrp = sow.SUB_RES_GROUP
      supply_month_hours = sow.SUPPLY_MONTH_AMOUNT
      supply_amount = sow.SUPPLY_MONTH_HOURS;
      comments_old = sow.REASON_FOR_CHANGE;
      let comments_new = $("#"+dataComment+"_"+sowNameData+"_"+count).val();
      leave_extra_days = $("#"+leavedays+"_"+count).html();
      
   
      
      total_amount = total_amount.replace('$',"");
      total_amount = total_amount.trim();
     
      const number = total_amount.replace(',', '');
      
      newAvailableResDataTM += "{ \"ACCOUNT_ID\" : \"" + accountid +
        "\", \"ACCOUNT_NAME\":\"" + accountname +
        "\", \"UNIQUE_ID\":\"" + unique_id +
        "\", \"ACTUAL_MONTH_AMOUNT\":\"" + number +
        "\", \"ACTUAL_MONTH_HOURS\":\"" + actual_hours +
        "\", \"ALLOCATION_END_DATE\":\"" + allocation_end_date +
        "\", \"ALLOCATION_START_DATE\":\"" + allocation_start_date +
        "\", \"BILLING_MODEL\":\"" + billingmodel +
        "\", \"BILLING_RATE\":\"" + billingrate +
        "\", \"BILLING_STATUS\":\"" + billingstatus +
        "\", \"DEMAND_BILLING_STATUS\":\"" + demandbillingstatus +
        "\", \"DEMAND_END_DATE\":\"" + demand_end_date +
        "\", \"DEMAND_START_DATE\":\"" + demand_start_date +
        "\", \"EMPLOYEE_ID\":\"" + employeeid +
        "\", \"EMPLOYEE_NAME\":\"" + employeename +
        "\", \"JOB_ROLE\":\"" + jobrole +
        "\", \"LEGAL_END_DATE\":\"" + legal_end_date +
        "\", \"LEGAL_START_DATE\":\"" + legal_start_date +
        "\", \"LOCATION\":\"" + location +
        "\", \"MONTH\":\""+ month +
        "\", \"RESOURCE_GROUP\":\""+ resourcegroup +
        "\", \"SOW_ID\":\""+sowid +
        "\", \"SOW_NAME\":\""+ sowname +
        "\", \"SUB_RES_GROUP\":\""+ subresgrp +
        "\", \"SUPPLY_MONTH_AMOUNT\":\""+ supply_month_hours +
        "\", \"SUPPLY_MONTH_HOURS\":\""+ supply_amount +
        "\", \"REASON_FOR_CHANGE\":\""+ comments_new +
        "\", \"LEAVE_OR_EXTRA_DAYS\":\""+ leave_extra_days +
        
        "\"},";
        existingTMData += "{ \"ACCOUNT_ID\" : \"" + accountid +
        "\", \"ACCOUNT_NAME\":\"" + accountname +
        "\", \"UNIQUE_ID\":\"" + unique_id +
        "\", \"ACTUAL_MONTH_AMOUNT\":\"" + actual_amount_old +
        "\", \"ACTUAL_MONTH_HOURS\":\"" + actual_hours_old +
        "\", \"ALLOCATION_END_DATE\":\"" + allocation_end_date +
        "\", \"ALLOCATION_START_DATE\":\"" + allocation_start_date +
        "\", \"BILLING_MODEL\":\"" + billingmodel +
        "\", \"BILLING_RATE\":\"" + billingrate +
        "\", \"BILLING_STATUS\":\"" + billingstatus +
        "\", \"DEMAND_BILLING_STATUS\":\"" + demandbillingstatus +
        "\", \"DEMAND_END_DATE\":\"" + demand_end_date +
        "\", \"DEMAND_START_DATE\":\"" + demand_start_date +
        "\", \"EMPLOYEE_ID\":\"" + employeeid +
        "\", \"EMPLOYEE_NAME\":\"" + employeename +
        "\", \"JOB_ROLE\":\"" + jobrole +
        "\", \"LEGAL_END_DATE\":\"" + legal_end_date +
        "\", \"LEGAL_START_DATE\":\"" + legal_start_date +
        "\", \"LOCATION\":\"" + location +
        "\", \"MONTH\":\""+ month +
        "\", \"RESOURCE_GROUP\":\""+ resourcegroup +
        "\", \"SOW_ID\":\""+sowid +
        "\", \"SOW_NAME\":\""+ sowname +
        "\", \"SUB_RES_GROUP\":\""+ subresgrp +
        "\", \"SUPPLY_MONTH_AMOUNT\":\""+ supply_month_hours +
        "\", \"SUPPLY_MONTH_HOURS\":\""+ supply_amount +
        "\", \"REASON_FOR_CHANGE\":\""+ comments_old +
        "\", \"LEAVE_OR_EXTRA_DAYS\":\""+ leave_extra_days +
        "\"},";
        accessDetails =
        '{ "ACCESS_LEVEL" : "' +
        accessLevelDetails +
        '", "Access":"' +
        accessData +
        '", "EDIT_ACCESS":"' +
        editAccessDetails +
        '", "EMAIL_ID":"' +
        sessionName +
        '", "GROUP_NAME":"' +
        groupNameDetails +
        '", "USERNAME":"' +
        empName +
        '", "USER_ID":"' +
        empId +
        '"}';
       
       
       
       }  
      }
    })
    
  } 
  
  let isEqual = _.isEqual(existingTMData, newAvailableResDataTM);
  if(!isEqual){
  calltoAjax();
  existingTMData = [];
    newAvailableResDataTM=[];  
  }else{
    existingTMData = [];
    newAvailableResDataTM=[];   
  }
  
}
function calltoAjax(){
  
   
    $.ajax({
          url: apiValue.url,
          type: "POST",
          dataType: "json",
          crossDomain: true,
          format: "json",
          async: false,
          mode: "no-cors",
          data: JSON.stringify({
            query_type: "recognized_revenue_data_insert",
            environment: apiValue.environment,
            user_details: "[" + accessDetails + "]",
            RECOGNIZED_REVENUE_DATA: "[" + newAvailableResDataTM + "]",
            RECOGNIZED_REVENUE_OLD_DATA: "[" + existingTMData + "]",
          }),
          success: function (dataJson) {
            let response = dataJson;
            toastr.success("Updated Successfully");
          },
          error: function (error) {
            console.log("message Error" + JSON.stringify(error));
          },
        });
        
}
function calculateAmount(obj){
  let dataId = $(obj).attr("data-id8");
  let dataId1 = $(obj).attr("data-id4");
  let dataComment = $(obj).attr("data-id5");
 
  let sowNameData = $(obj).attr("data-id2");
  let leavedays = $(obj).attr("data-id6");
  let supplyhours = $(obj).attr("data-id7");
  
  let allSowData = JSON.parse($(obj).attr("data-id3"));
  $.each(allSowData, function(l, sow){
    let count = l+1;
  let actual_hours_input = $("#" + dataId +"_"+sowNameData+"_"+count+ "_input").val();
  let leave_days_input = $("#"+leavedays+"_"+count+"_input").val();
  let leave_days_count =  $("#"+leavedays+"_"+count).html();
  let billingRate = sow.BILLING_RATE;
  leave_days_count = leave_days_count.trim();
  if(leave_days_input != leave_days_count){
    let leave_days_inputs = leave_days_input; 
    leave_days_input = leave_days_input -  leave_days_count;
  actual_hours_input =  actual_hours_input - (leave_days_input * 8);
  $("#" + dataId +"_"+sowNameData+"_"+count+ "_input").val(actual_hours_input);
  $("#"+leavedays+"_"+count).empty();

  $("#"+leavedays+"_"+count).append(leave_days_inputs);
  leave_days_count =  $("#"+leavedays+"_"+count).html();
  // let total_amount = billingRate * actual_hours;
  let amount_calc = actual_hours_input * billingRate;
  amount_calc = Math.round(amount_calc);
  amount_calc = amount_calc.toLocaleString("en-US");
  amount_calc = '$'+amount_calc;
  $("#"+dataId1+"_"+sowNameData+"_"+count).empty();
  $("#"+dataId1+"_"+sowNameData+"_"+count).append(amount_calc);

  }
  else{
    let amount  =  actual_hours_input * billingRate;
    amount =  Math.round(amount);
    amount = amount.toLocaleString("en-US");
    amount = '$'+amount;
    $("#"+dataId1+"_"+sowNameData+"_"+count).empty();
  $("#"+dataId1+"_"+sowNameData+"_"+count).append(amount);
  }
  })

}
function calculateAmounts(obj){
  let dataId = $(obj).attr("data-id8");
  let dataId1 = $(obj).attr("data-id4");
  let dataComment = $(obj).attr("data-id5");
 
  let sowNameData = $(obj).attr("data-id2");
  let leavedays = $(obj).attr("data-id6");
  let supplyhours = $(obj).attr("data-id7");
  
  let allSowData = JSON.parse($(obj).attr("data-id3"));
  $.each(allSowData, function(l, sow){
    let count = l+1;
  let actual_hours_input = $("#" + dataId +"_"+sowNameData+"_"+count+ "_input").val();
 
  let leave_days_input = $("#"+leavedays+"_"+count+"_input").val();
  let leave_days_count =  $("#"+leavedays+"_"+count).html();
  
  let billingRate = sow.BILLING_RATE;
  leave_days_count = leave_days_count.trim();
  if(leave_days_input != leave_days_count){
    leave_days_input = leave_days_input -  leave_days_count 
  actual_hours_input =  actual_hours_input - (leave_days_input * 8);
  $("#" + dataId +"_"+sowNameData+"_"+count+ "_input").val(actual_hours_input);
 
  // let total_amount = billingRate * actual_hours;
  let amount_calc = actual_hours_input * billingRate;
  amount_calc = Math.round(amount_calc);
  amount_calc = amount_calc.toLocaleString("en-US");
  amount_calc = '$'+amount_calc;
  $("#"+dataId1+"_"+sowNameData+"_"+count).empty();
  $("#"+dataId1+"_"+sowNameData+"_"+count).append(amount_calc);

  }
  else{
    let amount  =  actual_hours_input * billingRate;
    amount =  Math.round(amount);
    amount = amount.toLocaleString("en-US");
    amount = '$'+amount;
    $("#"+dataId1+"_"+sowNameData+"_"+count).empty();
  $("#"+dataId1+"_"+sowNameData+"_"+count).append(amount);
  }
  })

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
function convertDates(date) {
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
