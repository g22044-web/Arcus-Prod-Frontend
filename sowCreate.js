var getFunnelStageDrop = [],
  getsowTypeDrop = [],
  sowDropDownJson = [],
  sowAccountOpt = [],
  defaultBillArr = [];
var monthsObject = { MONTHS: {} }; // Global variable
sow_amount_user_edit = "NO";
var personaOpt = "",
  billingOpt = "",
  bill_us_default = 0,
  bill_ind_default = 0;
enteredValue = 0;

var defaultAccName = "",
  defaultBusHead = "",
  defaultFactHead = "",
  defaultAccId = "";
project_amount = "";
var funnelOptHtml = "",
  sowTypeOptHtml = "",
  skillOptionsHtml = "",
  billingTypeHtml = "",
  sowAccountOptHtml = "",
  sowBuyingCenter = "";
var account_class_arr = [],
  acc_size_arr = [],
  acc_payment_arr = [],
  empNameOption = "";
var account_head_pot = "", business_head_opt = "", delivery_head_opt = "", growth_member_opt = "", delivery_member_opt = "";
var default_min_rate_us = 0,
  default_min_rate_ind = 0;
var currentDate = new Date();
opportunityOwnersJsonData = [];
var createSowData = {};
var buyingCenterNps = []; // Initialize as empty array
var buyingCenterNpsapi = {};
var quill;
var nextStepsQuill;
// let probFilterOptions = `<option value="-1">Select Probability</option>
//                         <option value="10">10</option>
//                         <option value="20">20</option>
//                         <option value="30">30</option>
//                         <option value="40">40</option>
//                         <option value="50">50</option>
//                         <option value="60">60</option>
//                         <option value="70">70</option>
//                         <option value="80">80</option>
//                         <option value="90">90</option>
//                         <option value="100">100</option>`;
var probFilterOptions = `<option value="-1">Select Probability</option>
                        <option value="10">10%</option>
                        <option value="30 to 50">30% to 50%</option>
                        <option value="70">&gt; 70%</option>
                        <option value="100">100%</option>`;
var locationOpt = `<option value="">Select</option>
                  <option value="US">US</option>
                  <option value="INDIA">INDIA</option>`;
var sow_acc_data = "";

const pathname = window.location.pathname;
// Extract the file name (last segment) from the pathname
const parts = pathname.split("/");
const fileName = parts.pop();
function assignSowData(obj) {
  console.log("data obj - " + obj);
  // Clear existing local storage data for created-buying-center and created-nps
  localStorage.removeItem("created-buying-center");
  localStorage.removeItem("created-nps");
  getSowViewData();
  $.each(defaultBillArr, function (i, defaultRate) {
    if (defaultRate.ACCOUNT_NAME == sow_acc_data.ACCOUNT_NAME) {
      defaultAccName = defaultRate.ACCOUNT_NAME;
      defaultBusHead = defaultRate.BUSINESS_HEAD;
      defaultFactHead = defaultRate.FACTSPAN_ACCOUNT_HEAD_ID;
      defaultAccId = defaultRate.ACCOUNT_ID;
      bill_us_default = defaultRate.US_BILLING_RATE;
      bill_ind_default = defaultRate.IND_BILLING_RATE;
      console.log(
        "defaultAccName - " +
        defaultAccName +
        " , defaultBusHead - " +
        defaultBusHead +
        " , defaultFactHead - " +
        defaultFactHead
      );
      console.log(
        "bill_us_default - " +
        bill_us_default +
        " , bill_ind_default - " +
        bill_ind_default
      );
    } else {
      console.log("Account Details Not Found");
    }
  });
  console.log("funnelOptHtml - ", funnelOptHtml);
  $("#probability_options").append(probFilterOptions);
  let accountBack = localStorage.getItem("account-back");
  let createdAccountName = localStorage.getItem("created-account");
  let createdBuyingCenter = localStorage.getItem("created-buying-center");
  let createdNPS = localStorage.getItem("created-nps");
  console.log("accountBack - " + accountBack);
  console.log("createdAccountName - " + createdAccountName);
  console.log("createdBuyingCenter - " + createdBuyingCenter);
  console.log("createdNPS - " + createdNPS);
  if (createdAccountName == null) {
    $("#account_options").val("-1");
  } else if (createdAccountName == "-1") {
    $("#account_options").val("-1");
  } else {
    $("#account_options").val(createdAccountName);
    // Trigger the account change event to populate buying center and NPS dropdowns
    getAccName();
  }
  function handleUrlParams() {
    // Handle redirection from notesLogEngagement.html
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'notesLog') {
      const accName = urlParams.get('accountName');
      const funnel = urlParams.get('funnelStage');

      if (accName) {
        $("#account_options").val(accName).trigger('change');
        // Trigger getAccName if not already triggered by change event
        if (typeof getAccName === 'function') getAccName();
        $("#account_options").prop("disabled", true);
        // For Select2 3.5.1, we might need to trigger a refresh or use select2("enable", false)
        if ($("#account_options").data('select2')) {
          $("#account_options").select2("enable", false);
        }
      }

      if (funnel) {
        $("#funnel_options").val(funnel).trigger('change');
      }

      // Default select 'In Person' for notes if coming from quick link
      $('input[name="interactionType"][value="In Person"]').prop('checked', true).trigger('change');
    }
  }
  // Make it globally available so we can call it after AJAX
  window.handleUrlParams = handleUrlParams;
  //   $("#acc_name_tit").html(sow_acc_data.ACCOUNT_NAME);
  //   $("#sow_name_tit").html(sow_acc_data.SOW_NAME);
  $(".resourceDate").datepicker({
    format: "mm-dd-yy",
    uiLibrary: "bootstrap",
  });
  localStorage.setItem("created-account", "-1");
  // console.log("account - "+account);
}

function convert(str) {
  if (str == null) {
    return "";
  } else if (str == "0000-00-00") {
    return "";
  } else {
    let tempStr = str + "T00:00:00";
    console.log("tempStr - ", tempStr);
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

function addSkill() {
  if (sowDropDownJson.length == 0) {
    getSowViewData();
  }
  let persona_class = "persona_button";
  let locat_class = "us_bill_table";
  let bill_status_class = "billed_sow_table";
  let tb = $("#billing_exp_div:eq(0) tbody");
  let size = tb.find("tr").length;
  console.log("Number of rows : " + size);
  let sowNameClass = "newSow";
  console.log("sowAccountOptHtml - " + sowNameClass);
  let lastRow = $("#billing_exp_div tr:last");
  let lastClass = lastRow.attr("class");

  if (lastClass) {
    if (lastClass.indexOf("usClass") !== -1) {
      lastClass = lastClass.replace("us_res_", "").replace("usClass", "");
    } else if (lastClass.indexOf("indClass") !== -1) {
      lastClass = lastClass.replace("ind_res_", "").replace("indClass", "");
    } else if (lastClass.indexOf("newSow") !== -1) {
      lastClass = lastClass.replace("newSow_", "");
    }

    console.log("lastClass - " + lastClass);

    // Extract the number at the end and increment it
    size = parseInt(lastClass.match(/\d+$/)?.[0], 10) + 1 || 1; // Default to 1 if no number is found
  } else {
    console.log("No last row found or last row has no class.");
    size = 1; // Set size to 1 if no valid lastClass is found
  }

  console.log("Update size - " + size);

  let currentTeamSizeValue = parseInt($("#new_team").val(), 10);
  if (isNaN(currentTeamSizeValue)) {
    currentTeamSizeValue = 0;
  }

  // Increment the value by 1
  let updatedNewTeamSizeValue = currentTeamSizeValue + 1;

  // Assign the updated value back to #new_team
  $("#new_team").val(updatedNewTeamSizeValue);
  // console.log("lastClass - " + lastClass);
  // size = parseInt(lastClass.match(/\d+$/)[0], 10) + 1; // Extract number at the end and increment it
  // console.log("Update size - " + size); // Should log: Update size - 2

  let actualStartDate = $("#actual_start_date").val();
  let actualEndDate = $("#actual_end_date").val();
  let addSkillHtml = `<tr class="${sowNameClass}_${size}">
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

                        <td style="display:none" class="persona_skills_td" id="skills_details_${size}" style="position: relative;">
                            <select name="personaSkills[]" id="persona_skill_${size}" class="skillDataOpt" multiple="multiple"></select>
                        </td>


                        <td>
                          <span id="start_date_${size}" style="display:none">

                          </span>
                          <input type="text" class="form-control placeicon dateData resourceDate autoStartUpdateDate datepicker-fields fa-placeholder" 
                            id="start_date_input_${size}"
                            placeholder="&#xf073; mm-dd-yy" 
                            name="resource_start_date" 
                            autocomplete="off" 
                            style="z-index: 1;"     onchange="checkEndDate('start_date_input_${size}', 'end_date_input_${size}', 'Resource End Date should be greater than Resource Start Date'),calculateSowAmount()" 
 value="${actualStartDate}"/>

                        </td>
                        <td>
                          <span id="end_date_${size}" style="display:none">
                           
                          </span>
                          <input type="text" class="form-control placeicon dateData resourceDate autoEndUpdateDate datepicker-fields fa-placeholder" 
                            id="end_date_input_${size}"
                            placeholder="&#xf073; mm-dd-yy" 
                            name="resource_end_date" 
                            autocomplete="off" 
                            style="z-index: 1;"      onchange="checkEndDate('start_date_input_${size}', 'end_date_input_${size}', 'Resource End Date should be greater than Resource Start Date'),calculateSowAmount()" 
 value="${actualEndDate}"/>
                        </td>
                        <td>
                          <span id="ind_us_res_days_ind_${size}"  class="days_amount"></span>
                        </td>
                        <td>
                          <span class="${locat_class}" id="loc_text_${size}" style="display:none">
                            
                          </span>
                          <select class="form-control" id="loc_select_${size}" onchange="locSowAmount(this)">
                            ${locationOpt}
                          </select>
                        </td>
                        <td>
                          <span class="${bill_status_class}" id="bill_status_${size}" style="display:none">
                           
                          </span>
                          <select class="form-control" id="bill_select_${size}"  onchange="calculateSowAmount()">
                            ${billingOpt}   
                          </select>
                        </td>
                        <td>
                          <span id="bill_us_${size}" style="display:none">
                            
                          </span>
                          <input type="number" class="form-control" id="bill_us_input_${size}" placeholder="Bill US"   onchange="calculateSowAmount()" value=0 />
                        </td>
                        <td>
                          <span id="bill_ind_${size}"  style="display:none">
                            
                          </span>
                          <input type="number" class="form-control" id="bill_ind_input_${size}" placeholder="Bill Ind"  oninput="handleIntegerValuesOnly(this)" min=1 step="1" value=1 /></td>
                        </td>
                        
                        <td>
                          <span id="ind_us_res_amount_ind_${size}" class="days_amount"></span>
                        </td>
                        
                        <td>
                          <button class="btn btn-info delete_button" onclick="deleteSkill(this)"><i class="fa fa-trash"
                              aria-hidden="true"></i>
                          </button>
                        </td>
                      </tr>`;
  $("#billing_exp_div").append(addSkillHtml);
  var billingDropdown = document.getElementById("billing_options");
  var billingType = billingDropdown.value.trim(); // Get and trim the value
  console.log(billingType); // Log the value to check
  // If the billing option is "Fixed Price", hide the Billing Rate and Amount columns
  if (billingType === "Fixed Price") {
    hideBillingRateAmountColumns(); // This will hide the columns in header and body
  }
  let loc_status = "#loc_select_" + size;
  console.log("loc_status - " + loc_status);
  loc_status = $(loc_status).val();
  console.log("loc_status - " + loc_status);
  if (loc_status == "US") {
    $("#bill_us_input_" + size).val(bill_us_default);
  } else if (loc_status == "India" || loc_status == "INDIA") {
    $("#bill_us_input_" + size).val(bill_ind_default);
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




  $.each(sowDropDownJson.SKILL_LEVEL, function (i, skillOpt) {
    skillOptionsHtml += `<option value="${skillOpt.trim()}">${skillOpt.trim()}</option>`;
  });
  // console.log("skillOptionsHtml------", skillOptionsHtml); // Verify the generated options

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

  $("#persona_skill_" + size).on("focus click", function () {
    const dropdown = $(this);
    const offset = dropdown.offset();
    dropdown.css({
      position: "absolute",
      top: offset.top + dropdown.outerHeight(),
      left: offset.left,
      zIndex: 1050,
    });
  });

  $(`#persona_select_${size}`).val("TBD");
  // $(`#persona_select_${size}`).select2({});
  calculateSowAmount();
}

function locSowAmount(button) {
  let resourceNumber = $(button)
    .closest("tr")
    .children("td:eq(0)")
    .text()
    .trim();
  resourceNumber = resourceNumber.replace("Resource ", "");
  console.log("resourceNumber - " + resourceNumber);
  let loc_status = "#loc_select_" + resourceNumber;
  console.log("loc_status - " + loc_status);
  loc_status = $(loc_status).val();
  console.log("loc_status - " + loc_status);
  if (loc_status == undefined) {
    loc_status = "#us_res_loc_select_" + resourceNumber;
    loc_status = $(loc_status).val();
    console.log("loc_status - " + loc_status);
    if (loc_status == "US") {
      $("#us_res_bill_us_input_" + resourceNumber).val(bill_us_default);
    } else if (loc_status == "India" || loc_status == "INDIA") {
      $("#us_res_bill_us_input_" + resourceNumber).val(bill_ind_default);
    }
  }
  if (loc_status == undefined) {
    loc_status = "#ind_res_loc_select_" + resourceNumber;
    loc_status = $(loc_status).val();
    console.log("loc_status - " + loc_status);
    if (loc_status == "US") {
      $("#ind_res_bill_us_input_" + resourceNumber).val(bill_us_default);
    } else if (loc_status == "India" || loc_status == "INDIA") {
      $("#ind_res_bill_us_input_" + resourceNumber).val(bill_ind_default);
    }
  }
  if (loc_status == "US") {
    $("#bill_us_input_" + resourceNumber).val(bill_us_default);
  } else if (loc_status == "India" || loc_status == "INDIA") {
    $("#bill_us_input_" + resourceNumber).val(bill_ind_default);
  }
  calculateSowAmount();
}

function checkEditAccess() {
  let editStatus = $("#sow_edit")
    .text()
    .trim();
  console.log("editStatus - " + editStatus);
  if (editStatus == "Edit") {
    $(".edit_disable").attr("disabled", true);
    $("#funnel_options").hide();
    $("#sow_options").hide();
    $("#billing_options").hide();
    $("#probability_options").hide();
    $("#funnel_name").html($("#funnel_options option:selected").val());
    $("#funnel_name").show();
    $("#probab_name").html($("#probability_options option:selected").val());
    $("#probab_name").show();
    $("#sow_type_name").html($("#sow_options").val());
    $("#sow_type_name").show();
    $("#billing_type_name").html($("#billing_options option:selected").html());
    $("#billing_type_name").show();
  } else if (editStatus == "Update") {
    $(".edit_disable").attr("disabled", false);
    $("#funnel_options").show();
    $("#sow_options").show();
    $("#probability_options").show();
    $("#billing_options").show();
    $("#funnel_name").hide();
    $("#probab_name").hide();
    $("#sow_type_name").hide();
    $("#billing_type_name").hide();
  }
}

function getBuyingCenters(accountId = null, callback = null) {
  let apiURL = apiValue.url.replace("/app", "/get_buying_centers");
  let payload = {};

  // If accountId is provided, include it in the payload
  if (accountId) {
    payload.account_id = accountId;
  }

  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify(payload),
    success: function (data) {
      console.log("Buying Centers API Response:", data);
      buyingCenterNps = data.stakeholder_details || []; // Assuming the response is an array of buying center objects
      if (callback && typeof callback === 'function') {
        callback();
      }
    },
    error: function (error) {
      console.log("Error fetching buying centers:", JSON.stringify(error));
      buyingCenterNps = []; // Fallback to empty array on error
      if (callback && typeof callback === 'function') {
        callback();
      }
    },
  });
}

function getSowViewData() {
  const startTime = performance.now();
  let apiURL = apiValue.url.replace("/app", "/sow_input_drop_down");
  let empId = localStorage.getItem("EmpUserID");
  let emp_email = localStorage.getItem("email");
  let emp_dep = localStorage.getItem("Department");
  $.ajax({
    // url: "https://rre-api.factspanapps.com:5000/app",
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
      sowDropDownJson = data[0];
      // locationOpt = "", billingOpt = "", bill_us_default = 0, bill_ind_default = 0
      defaultBillArr = sowDropDownJson.DEFAULT_BILLRATE;
      bill_us_default = sowDropDownJson.DEFAULT_BILLRATE_US;
      bill_ind_default = sowDropDownJson.DEFAULT_BILLRATE_IND;
      console.log("sowDropDownJson - ", sowDropDownJson);
      // Removed: buyingCenterNps = sowDropDownJson.STAKEHOLDER_DETAILS;
      // Note: buyingCenterNps will be populated when account is selected in getAccName()
      console.log("buyingCenterNps will be populated when account is selected");
      sowAccountOpt = sowDropDownJson.ACCOUNT_SOW;
      console.log("sowAccountOpt - ", sowAccountOpt);
      let growthLedOptHtml = "",
        growthReportMangHtml = "";
      growthLedOptHtml += `<option value='-1'>Select Opportunity Owner</option>`;
      opportunityOwnersJsonData = sowDropDownJson.OPPORTUNITY_OWNERS;
      $.each(sowDropDownJson.OPPORTUNITY_OWNERS, function (i, growth) {
        let reporting_emp = growth.REPORTING_EMPLOYEES;
        growthLedOptHtml += `<option value='${growth.EMPLOYEE_ID}'>${growth.EMPLOYEE_NAME}</option>`;
        // $.each(reporting_emp, function (i, reportMang) {
        //   growthReportMangHtml += `<option value='${reportMang.EMPLOYEE_ID}'>${reportMang.EMPLOYEE_NAME}</option>`;
        // });
      });
      $("#acc_growth_name_option").html(growthLedOptHtml);
      sowAccountOptHtml += '<option value="-1">Select Account</option>';
      $.each(sowAccountOpt, function (i, account) {
        sowAccountOptHtml += `<option value='${account.ACCOUNT_NAME}'>${account.ACCOUNT_NAME}</option>`;
      });
      sowAccountOptHtml +=
        '<option value="Create Account" class="option_create_text">Create Account</option>';
      $("#account_options").append(sowAccountOptHtml);
      personaOpt += "<option value='TBD'>Select Persona</option>";
      $.each(sowDropDownJson.DESIGNATION, function (i, persona) {
        personaOpt += `<option value='${persona}'>${persona}</option>`;
      });
      $.each(sowDropDownJson.BILLING_STATUS, function (i, billStat) {
        billingOpt += `<option value='${billStat}'>${billStat}</option>`;
      });
      $("#funnel_options").append("<option value='-1'>Select Funnel</option>");
      $.each(sowDropDownJson.FUNNEL_STAGE, function (i, funnelOpt) {
        if (funnelOpt !== "Renewal" && funnelOpt !== "Lost") {
          // Exclude "Renewal" and "Lost"
          funnelOptHtml += `<option value="${funnelOpt}">${funnelOpt}</option>`;
        }
      });

      $("#funnel_options").append(funnelOptHtml);
      $("#sow_options").append("<option value='-1'>Select SOW Type</option>");
      $.each(sowDropDownJson.PROJECT_TYPE, function (i, sowTypeOpt) {
        sowTypeOptHtml += `<option value="${sowTypeOpt}">${sowTypeOpt}</option>`;
      });
      $("#sow_options").append(sowTypeOptHtml);

      // Generate skill options dynamically
      // Verify and Populate Skill Options
      let skillOptionsHtml = "";
      $.each(sowDropDownJson.SKILL_LEVEL, function (i, skillOpt) {
        skillOptionsHtml += `<option value="${skillOpt.trim()}">${skillOpt.trim()}</option>`;
      });
      // console.log("skillOptionsHtml", skillOptionsHtml);

      // Add options to the dropdown

      $("#billing_options").append(
        "<option value='-1'>Select Billing Type</option>"
      );
      $.each(sowDropDownJson.BILLING_MODE_NAME, function (i, billingOpt) {
        billingTypeHtml += `<option value="${billingOpt}">${billingOpt}</option>`;
      });
      $("#billing_options").append(billingTypeHtml);
      // $("#add_contact_factspan").append("<option value='-1'>Select Account Head</option>");
      $("#add_contact_account").append(
        "<option value='-1'>Select Account Head</option>"
      );
      $("#add_business_head").append(
        "<option value='-1'>Select Busniess Head</option>"
      );
      $("#add_delivery_head").append(
        "<option value='-1'>Select Delivery Head</option>"
      );
      $.each(sowDropDownJson.EMPLOYEE_DATA, function (i, empName) {
        empNameOption += `<option value="${empName.EMPLOYEE_ID}">${empName.EMPLOYEE_NAME}</option>`;
      });
      $.each(sowDropDownJson.ACCOUNT_HEADS, function (i, empName) {
        account_head_pot += `<option value="${empName.EMPLOYEE_ID}">${empName.EMPLOYEE_NAME}</option>`;
      });
      $.each(sowDropDownJson.BUSINESS_HEADS, function (i, empName) {
        business_head_opt += `<option value="${empName.EMPLOYEE_ID}">${empName.EMPLOYEE_NAME}</option>`;
      });
      $.each(sowDropDownJson.DELIVERY_HEADS, function (i, empName) {
        delivery_head_opt += `<option value="${empName.EMPLOYEE_ID}">${empName.EMPLOYEE_NAME}</option>`;
      });
      // $("#add_contact_factspan").append(empNameOption);
      $("#add_contact_account").append(account_head_pot);
      $("#add_business_head").append(business_head_opt);
      $("#add_delivery_head").append(delivery_head_opt);
      account_class_arr = sowDropDownJson.ACCOUNT_CLASS;
      acc_size_arr = sowDropDownJson.ACCOUNT_SIZE;
      acc_payment_arr = sowDropDownJson.PAYMENT_TERM;
      let defaultBillRate = sowDropDownJson.DEFAULT_BILLRATE;
      default_min_rate_us = defaultBillRate[0].US_BILLING_RATE;
      $("#min_bill_rate_uscan").val(default_min_rate_us);
      default_min_rate_ind = defaultBillRate[0].IND_BILLING_RATE;
      $("#min_bill_rate_ind").val(default_min_rate_ind);
      $("#billing_exp_div").hide();

      // Ensure URL params are handled now that dropdowns are populated
      if (typeof window.handleUrlParams === 'function') {
        window.handleUrlParams();
      }
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

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "{{newline}}");
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
  if (selectedOppOwnername == "-1") {
    $("#growth_opt_block").hide();
  } else {
    $("#growth_opt_block").show();
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

function calculateSowAmount() {
  const existingSowAmount = $("#sow_amount").val();
  const existingProjAmount = $("#proj_amount").val();
  let sowAmount = 0;
  let proAmount = 0;
  const billingType = $("#billing_options option:selected").val();

  var table = $("#billing_exp_div tbody");
  table.find("tr").each(function (i) {
    var $tds = $(this).find("td"),
      rResource = $tds.eq(0).text(),
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
        .val();

    let getResVal = rResource.replace("Resource ", "");
    let fixedDate = dateDiff(rStartDate, rEndDate);
    console.log("fixedDate - ", fixedDate);

    // Initialize the amount to $0
    $("#ind_us_res_days_ind_" + getResVal)
      .empty()
      .append("0");
    $("#ind_us_res_amount_ind_" + getResVal)
      .empty()
      .append("$0");

    if (rLocation === "US") {
      rPerosna = $("#us_res_persona_select_" + getResVal).val();
    }
    if (rLocation === "India" || rLocation === "INDIA") {
      rPerosna = $("#ind_res_persona_select_" + getResVal).val();
    }
    if (rBillStatus === "Billed" && rBillRate !== "") {
      let workingDays = getBusinessDatesCount(rStartDate, rEndDate);
      console.log("workingDays - " + workingDays);
      let workingDay = parseInt(workingDays, 10);
      let billRate = parseFloat(rBillRate);
      let count = parseFloat(rCount);
      let workingDayAmount = workingDay * 8;

      if (
        isNaN(rStartDate) &&
        isNaN(rEndDate) &&
        isNaN(workingDays) &&
        isNaN(billRate) &&
        isNaN(count)
      ) {
        toastr.options.timeOut = 2000; // 2s
        toastr.error("Sow Amount not updated..");
      } else {
        let tempSowAmt = 0;
        if (
          $("#billing_options option:selected").val() == "Performance Based"
        ) {
          let newTempValue = fixedRateCal(
            rStartDate,
            rEndDate,
            billRate,
            rLocation
          );
          newTempValue = newTempValue.split(",");
          console.log("newTempValue - ", newTempValue);

          tempSowAmt = newTempValue[0] * count;
          $("#ind_us_res_days_ind_" + getResVal)
            .empty()
            .append(newTempValue[1] || "0");
          $("#ind_us_res_amount_ind_" + getResVal)
            .empty()
            .append("$" + (newTempValue[2] * count || 0).toLocaleString());
          console.log("tempSowAmt - " + tempSowAmt);
          sowAmount += tempSowAmt;
          console.log("sowAmount new - " + sowAmount);
          $("#sow_amount").val(
            sowAmount.toLocaleString() === "NaN"
              ? 0
              : sowAmount.toLocaleString()
          );
          $("#proj_amount").val(
            sowAmount.toLocaleString() === "NaN"
              ? 0
              : sowAmount.toLocaleString()
          );
        } else if (
          $("#billing_options option:selected").val() == "Time and Material"
        ) {
          let accountName = $("#account_options option:selected").val();
          if (accountName === "-1") {
            toastr.options.timeOut = 2000; // 2s
            toastr.error("Please select account name");
            return false;
          } else if (accountName === "Macys") {
            let newTempValue = removeHolidaysMacys(
              rStartDate,
              rEndDate,
              billRate,
              rLocation
            );
            newTempValue = newTempValue.split(",");
            console.log("newTempValue - ", newTempValue);

            tempSowAmt = newTempValue[0] * count;
            $("#ind_us_res_days_ind_" + getResVal)
              .empty()
              .append(newTempValue[1] || "0");
            let eachDemand = newTempValue[2] * count || 0
            $("#ind_us_res_amount_ind_" + getResVal)
              .empty()
              .append("$" + (Math.round(eachDemand)).toLocaleString());
            tempProjAmt = newTempValue[3] * count;
            console.log("tempSowAmt - " + tempSowAmt);
            console.log("tempProjAmt - " + tempProjAmt);
            sowAmount += Math.round(tempSowAmt);
            proAmount += Math.round(tempProjAmt);
            $("#sow_amount").val(
              sowAmount.toLocaleString() === "NaN"
                ? 0
                : sowAmount.toLocaleString()
            );
            $("#proj_amount").val(
              proAmount.toLocaleString() === "NaN"
                ? 0
                : proAmount.toLocaleString()
            );
          } else {
            let newTempValue = removeHolidays(
              rStartDate,
              rEndDate,
              billRate,
              rLocation
            );
            newTempValue = newTempValue.split(",");
            console.log("newTempValue - ", newTempValue);

            tempSowAmt = newTempValue[0] * count;
            $("#ind_us_res_days_ind_" + getResVal)
              .empty()
              .append(newTempValue[1] || "0");
            let eachDemand = newTempValue[2] * count || 0
            $("#ind_us_res_amount_ind_" + getResVal)
              .empty()
              .append("$" + (Math.round(eachDemand)).toLocaleString());
            tempProjAmt = newTempValue[3] * count;
            console.log("tempSowAmt - " + tempSowAmt);
            console.log("tempProjAmt - " + tempProjAmt);
            sowAmount += Math.round(tempSowAmt);
            proAmount += Math.round(tempProjAmt);
            $("#sow_amount").val(
              sowAmount.toLocaleString() === "NaN"
                ? 0
                : sowAmount.toLocaleString()
            );
            $("#proj_amount").val(
              proAmount.toLocaleString() === "NaN"
                ? 0
                : proAmount.toLocaleString()
            );
          }
        } else {
          let newTempValue = removeHolidays(
            rStartDate,
            rEndDate,
            billRate,
            rLocation
          );
          newTempValue = newTempValue.split(",");
          console.log("newTempValue - ", newTempValue);
          $("#ind_us_res_days_ind_" + getResVal)
            .empty()
            .append(newTempValue[1] || "0");
          console.log("existingSowAmount", existingSowAmount);

          // Ensure the existing values are retained without modification
          $("#sow_amount").val(
            existingSowAmount.toLocaleString() === "NaN"
              ? 0
              : existingSowAmount.toLocaleString()
          );
          $("#proj_amount").val(
            existingProjAmount.toLocaleString() === "NaN"
              ? 0
              : existingProjAmount.toLocaleString()
          );

          console.log(
            "SOW amount and Projected amount retained as they are for Fixed Price."
          );

          return;
        }
      }
    }
    console.log("sowAmount - " + sowAmount);
  });
}

function getBusinessDatesCount(start, end) {
  let tempStart = start + "T00:00:00";
  let tempEnd = end + "T00:00:00";
  let startDate = new Date(tempStart);
  let endDate = new Date(tempEnd);
  let count = 0;
  console.log("startDate - " + startDate + " , endDate - " + endDate);
  console.log("startDate.getTime() - ", startDate.getTime());
  const curDate = new Date(startDate.getTime());
  console.log("curDate - ", curDate);
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  console.log("Working Days - " + count);
  return count;
}

function getTotalCalDatesCount(start, end) {
  console.log("Start - " + start + " End - " + end);
  let startDate = new Date(start);
  let endDate = new Date(end);
  let count = 0;
  const curDate = new Date(startDate.getTime());
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    // if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  console.log("Working Days - " + count);
  return count;
}

function convertDate(date) {
  console.log("date - " + date);
  let finalDate = "";
  if (date == "") {
    finalDate = "0000-00-00";
  } else {
    let newDate = date.split("-");
    let mm = newDate[0];
    let dd = newDate[1];
    let yy = newDate[2];
    yy = "20" + yy;
    finalDate = yy + "-" + mm + "-" + dd;
  }

  return finalDate;
}
function deleteSkill() {
  let tb = $("#billing_exp_div:eq(0) tbody");
  let size = tb.find("tr").length;
  console.log("size - " + size);

  let sowTitleName = $("#sow_name_tit")
    .html()
    .trim()
    .replace(/ /g, "_");
  sowTitleName = sowTitleName + "_" + size;
  console.log("sowTitleName - " + sowTitleName);
  $("." + sowTitleName).remove();

  // Decrease the value of #new_team by 1 and assign it back
  let newTeamField = $("#new_team");
  let currentValue = parseInt(newTeamField.val(), 10) || 0; // Default to 0 if empty or invalid
  if (currentValue > 0) {
    newTeamField.val(currentValue - 1); // Assign the decremented value back
  }
  console.log("newTeamField", newTeamField);

  $("#new_team").val(currentValue);

  calculateSowAmount();
}

function titleCase(str) {
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(" ");
}

function handleIntegerOnly(input) {
  // Remove non-digit characters
  input.value = input.value.replace(/\D/g, '');

  // Optionally ensure leading 0s are stripped
  if (input.value !== '') {
    input.value = String(parseInt(input.value, 10));
  }

  // Call your other functions
  calculateSowAmount();
  updateTeamSize();
}

function handleIntegerValuesOnly(input) {
  // Keep only digits (0–9)
  input.value = input.value.replace(/[^0-9]/g, '');
  calculateSowAmount();
  updateTeamSize();
}

function updateResourceTotal(loc) {
  console.log("Selected loc - " + loc);
  if (loc == "US") {
    $(".usClass").remove();
  } else if (loc == "IND") {
    $(".indClass").remove();
  }
  let usRes = parseInt($("#uscan_size").val(), 10);
  let IndRes = parseInt($("#ind_size").val(), 10);
  let total_team_size = usRes + IndRes;
  if (total_team_size == 0) {
    $("#billing_exp_div tbody").empty();
  }
  $("#team_size_val").val(total_team_size);
  if (total_team_size > 0) {
    $("#billing_exp_div").show();
  } else {
    $("#billing_exp_div").hide();
  }
  let persona_class = "persona_button";
  let locat_class = "us_bill_table";
  let bill_status_class = "billed_sow_table";
  if (loc == "US") {
    for (i = 0; i < usRes; i++) {
      console.log("Us - " + (i + 1));
      let tb = $("#billing_exp_div:eq(0) tbody");
      let size = tb.find("tr").length;
      console.log("Number of rows : " + size);
      size = size + 1;
      let usClassSize = i + 1;
      console.log("Update size - " + size);
      let us_res = "us_res";
      console.log("sowAccountOptHtml - " + us_res);
      let actualStartDate = $("#actual_start_date").val();
      let actualEndDate = $("#actual_end_date").val();
      let addSkillHtml = `<tr class="${us_res}_${usClassSize}">
                        <td style="display:none" id="${us_res}_res_number_${usClassSize}">Resource ${usClassSize}</td>
                        <td class="persona_skills_td" id="${us_res}_persona_details_${usClassSize}">
                          <div class="${persona_class}" id="${us_res}_persona_text_${usClassSize}" style="display:none">
                          ${createDiv("-", "")}
                          </div>
                          <select id="${us_res}_persona_select_${usClassSize}" >
                            ${personaOpt}
                          </select>
                          <select class="skillDataOpt" id="${us_res}_persona_skill_${usClassSize}" multiple>
                                  ${skillOptionsHtml}
                                </select>
                          <div id="tooltip_${us_res}" class="custom-tooltip" style="display:none; position:absolute;"></div>
                        </td>
                        <td>
                          <span id="${us_res}_start_date_${usClassSize}" style="display:none">

                          </span>
                          <input type="text" class="form-control placeicon dateData resourceDate autoStartUpdateDate fa-placeholder" 
                            id="${us_res}_start_date_input_${usClassSize}"
                            placeholder="&#xf073; mm/dd/yy" 
                            name="resource_start_date" 
                            autocomplete="off" 
                            style="z-index: 1;" onchange="calculateSowAmount()" value="${actualStartDate}"/>

                        </td>
                        <td>
                          <span id="${us_res}_end_date_${usClassSize}" style="display:none">
                           
                          </span>
                          <input type="text" class="form-control placeicon dateData resourceDate autoEndUpdateDate fa-placeholder" 
                            id="${us_res}_end_date_input_${usClassSize}"
                            placeholder="&#xf073; mm/dd/yy" 
                            name="resource_end_date" 
                            autocomplete="off" 
                            style="z-index: 1;"  onchange="calculateSowAmount()" value="${actualEndDate}"/>
                        </td>
                        <td>
                          <span class="${locat_class}" id="${us_res}_loc_text_${usClassSize}" style="display:none">
                            
                          </span>
                          <select class="form-control" id="${us_res}_loc_select_${usClassSize}" onchange="locSowAmount(this)">
                            ${locationOpt}
                          </select>
                        </td>
                        <td>
                          <span class="${bill_status_class}" id="${us_res}_bill_status_${usClassSize}" style="display:none">
                           
                          </span>
                          <select class="form-control" id="${us_res}_bill_select_${usClassSize}"  onchange="calculateSowAmount()">
                            ${billingOpt}   
                          </select>
                        </td>
                        <td>
                          <span id="${us_res}_bill_us_${usClassSize}" style="display:none">
                            
                          </span>
                          <input type="number" class="form-control" id="${us_res}_bill_us_input_${usClassSize}" placeholder="Bill US"   onchange="calculateSowAmount()" value='0'/>
                        </td>
                        <td>
                          <span id="${us_res}_bill_ind_${usClassSize}"  style="display:none">
                            
                          </span>
                          <input type="number" class="form-control" id="${us_res}_bill_ind_input_${usClassSize}" placeholder="Bill Ind"  oninput="handleIntegerValuesOnly(this)" min=1 step="1" value=1 /></td>
                        </td>
                        
                      </tr>`;
      $("#billing_exp_div").append(addSkillHtml);

      // let loc_status = "#loc_select_" + size;
      // console.log("loc_status - " + loc_status);
      // loc_status = $(loc_status).val();
      // console.log("loc_status - " + loc_status);

      $("#" + us_res + "_loc_select_" + usClassSize).val("US");
      $("#" + us_res + "_bill_us_input_" + usClassSize).val(bill_us_default);
      $(`.${us_res}_${usClassSize}`).addClass("usClass");
      $("#" + us_res + "_start_date_input_" + usClassSize).datepicker({
        format: "mm-dd-yy",
        uiLibrary: "bootstrap",
      });
      $("#" + us_res + "_end_date_input_" + usClassSize).datepicker({
        format: "mm-dd-yy",
        uiLibrary: "bootstrap",
      });
      $(".input-group-addon").hide();
      $("#" + us_res + "_persona_skill_" + usClassSize)
        .select2({
          placeholder: "Select Skills",
          dropdownCssClass: "custom-select-style", // Custom class for styling
        })
        .on("select2:open", function () {
          // Add custom class dynamically
          $(".select2-container").addClass("custom-select-style");
        });
      $("#" + us_res + "_persona_select_" + usClassSize).val("TBD");
      $("#" + us_res + "_persona_select_" + usClassSize).select2({});
    }
  } else if (loc == "IND") {
    for (i = 0; i < IndRes; i++) {
      console.log("Ind - " + (i + 1));
      let tb = $("#billing_exp_div:eq(0) tbody");
      let size = tb.find("tr").length;
      console.log("Number of rows : " + size);
      size = size + 1;
      let indClassSize = i + 1;
      console.log("Update size - " + size);
      let ind_res = "ind_res";
      console.log("sowAccountOptHtml - " + ind_res);
      let actualStartDate = $("#actual_start_date").val();
      let actualEndDate = $("#actual_end_date").val();
      let addSkillHtml = `<tr class="${ind_res}_${indClassSize} addSkill">
                        <td style="display:none" id="${ind_res}_res_number_${indClassSize}">Resource ${indClassSize}</td>
                        <td class="persona_skills_td" id="${ind_res}_persona_details_${indClassSize}">
                          <div class="${persona_class}" id="${ind_res}_persona_text_${indClassSize}" style="display:none">
                          ${createDiv("-", "")}
                          </div>
                          <select id="${ind_res}_persona_select_${indClassSize}" >
                            ${personaOpt}
                          </select>
                          <select class="skillDataOpt" id="${ind_res}_persona_skill_${indClassSize}" multiple>
                                  ${skillOptionsHtml}
                                </select>
                          <div id="tooltip_${ind_res}" class="custom-tooltip" style="display:none; position:absolute;"></div>
                        </td>
                        <td>
                          <span id="${ind_res}_start_date_${indClassSize}" style="display:none">

                          </span>
                          <input type="text" class="form-control placeicon dateData resourceDate autoStartUpdateDate fa-placeholder" 
                            id="${ind_res}_start_date_input_${indClassSize}"
                            placeholder="&#xf073; mm/dd/yy" 
                            name="resource_start_date" 
                            autocomplete="off" 
                            style="z-index: 1;" onchange="calculateSowAmount()" value="${actualStartDate}"/>

                        </td>
                        <td>
                          <span id="${ind_res}_end_date_${indClassSize}" style="display:none">
                           
                          </span>
                          <input type="text" class="form-control placeicon dateData resourceDate autoEndUpdateDate fa-placeholder" 
                            id="${ind_res}_end_date_input_${indClassSize}"
                            placeholder="&#xf073; mm/dd/yy" 
                            name="resource_end_date" 
                            autocomplete="off" 
                            style="z-index: 1;"  onchange="calculateSowAmount()" value="${actualEndDate}"/>
                        </td>
                        <td>
                          <span class="${locat_class}" id="${ind_res}_loc_text_${indClassSize}" style="display:none">
                            
                          </span>
                          <select class="form-control" id="${ind_res}_loc_select_${indClassSize}" onchange="locSowAmount(this)">
                            ${locationOpt}
                          </select>
                        </td>
                        <td>
                          <span class="${bill_status_class}" id="${ind_res}_bill_status_${indClassSize}" style="display:none">
                           
                          </span>
                          <select class="form-control" id="${ind_res}_bill_select_${indClassSize}"  onchange="calculateSowAmount()">
                            ${billingOpt}   
                          </select>
                        </td>
                        <td>
                          <span id="${ind_res}_bill_us_${indClassSize}" style="display:none">
                            
                          </span>
                          <input type="number" class="form-control" id="${ind_res}_bill_us_input_${indClassSize}" placeholder="Bill US"   onchange="calculateSowAmount()"/>
                        </td>
                        <td>
                          <span id="${ind_res}_bill_ind_${indClassSize}"  style="display:none">
                            
                          </span>
                          <input type="number" class="form-control" id="${ind_res}_bill_ind_input_${indClassSize}" placeholder="Bill Ind"  oninput="handleIntegerValuesOnly(this)" min=1 step="1" value=1 /></td>
                        </td>
                        
                      </tr>`;
      $("#billing_exp_div").append(addSkillHtml);

      // let loc_status = "#loc_select_" + size;
      // console.log("loc_status - " + loc_status);
      // loc_status = $(loc_status).val();
      // console.log("loc_status - " + loc_status);
      $("#" + ind_res + "_loc_select_" + indClassSize).val("INDIA");
      $("#" + ind_res + "_bill_us_input_" + indClassSize).val(bill_ind_default);
      $(`.${ind_res}_${indClassSize}`).addClass("indClass");
      $("#" + ind_res + "_start_date_input_" + indClassSize).datepicker({
        format: "mm-dd-yy",
        uiLibrary: "bootstrap",
      });
      $("#" + ind_res + "_end_date_input_" + indClassSize).datepicker({
        format: "mm-dd-yy",
        uiLibrary: "bootstrap",
      });
      $(".input-group-addon").hide();
      $("#" + ind_res + "_persona_skill_" + indClassSize)
        .select2({
          placeholder: "Select Skills",
          dropdownCssClass: "custom-select-style", // Custom class for styling
        })
        .on("select2:open", function () {
          // Add custom class dynamically
          $(".select2-container").addClass("custom-select-style");
        });
      $("#" + ind_res + "_persona_select_" + indClassSize).val("TBD");
      $("#" + ind_res + "_persona_select_" + indClassSize).select2({});
    }
  }
}

function createAccount() {
  console.log("create Add");
  // $("#addCreate").modal("show");
  let acc_class_html = "",
    acc_size_html = "",
    acc_pay_html = "";
  $.each(account_class_arr, function (i, acc_class) {
    acc_class_html +=
      '<option value="' + acc_class + '">' + acc_class + "</option>";
  });
  $("#account_class").empty();
  $("#account_class").append(acc_class_html);
  $("#account_class").val("External");
  $("#account_size").empty();
  $("#account_size").append('<option value="-1">Select Size</option>');
  $.each(acc_size_arr, function (i, acc_size) {
    acc_size_html +=
      '<option value="' + acc_size + '">' + acc_size + "</option>";
  });
  $("#account_size").append(acc_size_html);
  $("#payment_term").empty();
  $("#payment_term").append('<option value="-1">Select Payment Term</option>');
  $.each(acc_payment_arr, function (i, acc_pay) {
    acc_pay_html += '<option value="' + acc_pay + '">' + acc_pay + "</option>";
  });
  $("#payment_term").append(acc_pay_html);
}

function getAccName() {
  let account = $("#account_options option:selected").val();
  console.log(account);

  if (account == "Create Account") {
    window.location.href = "accountCreation.html";
    return; // Exit the function early
  }
  console.log("defaultBillArr", defaultBillArr);
  console.log("account", account);

  if (account == undefined) {
    return; // Skip the $.each loop if account is undefined
  }

  $.each(defaultBillArr, function (i, defaultRate) {
    if (defaultRate.ACCOUNT_NAME == escapeHtml(account)) {
      defaultAccName = defaultRate.ACCOUNT_NAME;
      defaultBusHead = defaultRate.BUSINESS_HEAD;
      defaultFactHead = defaultRate.FACTSPAN_ACCOUNT_HEAD_ID;
      defaultAccId = defaultRate.ACCOUNT_ID;
      bill_us_default = defaultRate.US_BILLING_RATE;
      bill_ind_default = defaultRate.IND_BILLING_RATE;

      console.log(
        "defaultAccName - " +
        defaultAccName +
        " , defaultBusHead - " +
        defaultBusHead +
        " , defaultFactHead - " +
        defaultFactHead
      );
      console.log(
        "bill_us_default - " +
        bill_us_default +
        " , bill_ind_default - " +
        bill_ind_default
      );

      console.log("buyingCenterNps", buyingCenterNps);

      // Fetch buying centers for the selected account with callback
      getBuyingCenters(defaultAccId, function () {
        // Populate buying center dropdown after data is loaded
        populateBuyingCenterDropdown(defaultAccId);

        resetNpsStakeholderSelections({ disableMain: true });

        const urlParams = new URLSearchParams(window.location.search);
        const urlBc = urlParams.get('buyingCenter');
        const urlStk = urlParams.get('stakeholder');

        if (urlBc) {
            $("#buying_center").val(urlBc);
            $("#buying_center").trigger("change");
            if (urlStk) {
                setTimeout(() => {
                    $("#nps_stakeholder").val(urlStk);
                }, 200);
            }
            // Clear from URL so subsequent manual account changes don't re-apply it
            window.history.replaceState({}, document.title, window.location.pathname + "?from=notesLog");
        } else {
            // Set buying center to default and trigger change to reset NPS
            $("#buying_center").val("-1");
            $("#buying_center").trigger("change");
        }

        // populateBuyingCenterDropdown owns the buying center change handler.
      });
    }
  });
}

// Function to populate buying center dropdown - can be called to refresh
function populateBuyingCenterDropdown(accountId) {
  console.log("populateBuyingCenterDropdown called with accountId:", accountId);
  console.log("buyingCenterNps data:", buyingCenterNps);

  const accountData = buyingCenterNps.find(
    (account) => account.ACCOUNT_ID === accountId
  );

  console.log("Found accountData:", accountData);

  // Clear the dropdown
  $("#buying_center").empty();

  // Always add "Select Buying Center" and "+ Add New"
  $("#buying_center").append(
    "<option value='-1'>Select Buying Center</option>"
  );

  $("#buying_center").append(
    '<option value="add-new" class="add-new-option">+ Add New</option>'
  );

  if (accountData && accountData.DETAILS && accountData.DETAILS.length > 0) {
    // Extract all Buying Centers
    let buyingCenters = [];
    let seenBCs = new Set();
    accountData.DETAILS.forEach((detail) => {
      let id = detail.BC_ID || detail.BUYING_CENTRE;
      if (!seenBCs.has(id)) {
        seenBCs.add(id);
        buyingCenters.push({ id: id, name: detail.BUYING_CENTRE });
      }
    });

    console.log("Buying centers found:", buyingCenters);

    // Populate buying center options
    let sowBuyingCenter = "";
    $.each(buyingCenters, function (i, sowBuying) {
      sowBuyingCenter += `<option value="${sowBuying.id}">${sowBuying.name}</option>`;
    });
    $("#buying_center").append(sowBuyingCenter);
  }

  console.log("=== ATTACHING BUYING CENTER CHANGE EVENT HANDLER ===");
  console.log("Buying center element exists at attachment time:", $("#buying_center").length);
  console.log("Buying center HTML:", $("#buying_center").prop("outerHTML"));

  // Additional debugging for element state
  if ($("#buying_center").length > 0) {
    console.log("Buying center is visible:", $("#buying_center").is(":visible"));
    console.log("Buying center is enabled:", $("#buying_center").prop("disabled") === false);
    console.log("Buying center current value:", $("#buying_center").val());
    console.log("Buying center has options:", $("#buying_center option").length);
  }

  // Set up event listener for buying center selection - remove existing handlers first to prevent duplicates
  $("#buying_center").off("change").on("change", function () {
    const selectedBuyingCenter = $(this).val();
    console.log("=== BUYING CENTER CHANGE EVENT FIRED ===");
    console.log("Buying center changed to:", selectedBuyingCenter);
    console.log("Buying center element exists:", $("#buying_center").length);
    console.log("NPS stakeholder element exists:", $("#nps_stakeholder").length);
    console.log("Current buyingCenterNps data:", buyingCenterNps);
    console.log("Current defaultAccId:", defaultAccId);

    if (selectedBuyingCenter === "add-new") {
      console.log("Opening new buying center popup");
      newBuyingCenter();
    } else {
      // Update NPS Stakeholder dropdown based on selected Buying Center
      console.log("About to call updateStakeholderDropdown with:", selectedBuyingCenter);
      updateStakeholderDropdown(selectedBuyingCenter);

      // Enable/disable NPS Stakeholder dropdown based on buying center selection
      if (selectedBuyingCenter && selectedBuyingCenter !== "-1" && selectedBuyingCenter !== "add-new") {
        if (!$("#nps_stakeholder").prop("disabled")) {
          $("#nps_stakeholder").css("background-color", ""); // Remove disabled background color
          console.log("NPS Stakeholder dropdown enabled for buying center:", selectedBuyingCenter);
        }

        // Additional debugging for NPS options
        setTimeout(function () {
          console.log("=== NPS DROPDOWN STATUS AFTER UPDATE ===");
          console.log("NPS stakeholder value:", $("#nps_stakeholder").val());
          console.log("NPS stakeholder options count:", $("#nps_stakeholder option").length);
          console.log("NPS stakeholder options:", $("#nps_stakeholder option").map(function () { return $(this).val() + " - " + $(this).text(); }).get());
          console.log("NPS stakeholder disabled:", $("#nps_stakeholder").prop("disabled"));
        }, 100);
      } else {
        resetNpsStakeholderSelections({ disableMain: true });
        console.log("NPS Stakeholder dropdown disabled");
      }
    }
    console.log("=== END BUYING CENTER CHANGE EVENT ===");
  });

  // Set default selection to '-1'
  $("#buying_center").val("-1");

  // Test if the event handler was attached successfully
  console.log("Event handler attached. Testing if it works...");
  setTimeout(function () {
    console.log("=== TESTING EVENT HANDLER ATTACHMENT ===");
    console.log("Buying center element still exists:", $("#buying_center").length);
    console.log("Buying center current value:", $("#buying_center").val());
    console.log("Buying center options count:", $("#buying_center option").length);

    // Pre-select values from localStorage if available
    let createdBuyingCenter = localStorage.getItem("created-buying-center");
    let createdNPS = localStorage.getItem("created-nps");

    if (createdBuyingCenter && createdBuyingCenter !== "-1") {
      console.log("Pre-selecting buying center:", createdBuyingCenter);
      $("#buying_center").val(createdBuyingCenter);
      // Trigger change event to populate NPS stakeholder dropdown
      $("#buying_center").trigger("change");

      // Pre-select NPS stakeholder after a short delay
      if (createdNPS && createdNPS !== "-1") {
        setTimeout(function () {
          console.log("Pre-selecting NPS stakeholder:", createdNPS);
          $("#nps_stakeholder").val(createdNPS);
        }, 200);
      }
    }

    // Try to manually trigger the event to test
    if ($("#buying_center").length > 0) {
      console.log("Manually triggering change event for testing...");
      $("#buying_center").trigger("change");
    }
  }, 500);

  if (!(accountData && accountData.DETAILS && accountData.DETAILS.length > 0)) {
    console.log("Account data not found or empty. Only default options added.");
  }
}

// Function to update the Stakeholder dropdown
function updateStakeholderDropdown(buyingCenter) {
  console.log("=== UPDATE STAKEHOLDER DROPDOWN START ===");
  console.log("updateStakeholderDropdown called with buyingCenter:", buyingCenter);
  console.log("buyingCenterNps data:", buyingCenterNps);
  console.log("buyingCenterNps type:", typeof buyingCenterNps);
  console.log("buyingCenterNps length:", Array.isArray(buyingCenterNps) ? buyingCenterNps.length : 'Not an array');
  console.log("defaultAccId:", defaultAccId);
  console.log("defaultAccId type:", typeof defaultAccId);

  resetNpsStakeholderSelections({ disableMain: true });

  if (!buyingCenter || buyingCenter === "-1" || buyingCenter === "add-new") {
    console.log("Invalid buying center selected. NPS stakeholder selections reset.");
    return;
  }

  // Check if buyingCenterNps is properly loaded
  if (!buyingCenterNps || !Array.isArray(buyingCenterNps) || buyingCenterNps.length === 0) {
    console.error("buyingCenterNps is not properly loaded or is empty");
    $("#nps_stakeholder").empty();
    $("#nps_stakeholder").append('<option value="-1">No data available</option>');
    $("#nps_stakeholder").val("-1");
    return;
  }

  // Get account details based on account ID
  const accountDetails = buyingCenterNps.find(item => {
    console.log("Checking account:", item.ACCOUNT_ID, "against defaultAccId:", defaultAccId);
    return item.ACCOUNT_ID === defaultAccId;
  });

  console.log("Found accountDetails:", accountDetails);

  let stakeholders = [];

  if (accountDetails && accountDetails.DETAILS) {
    console.log("Account details found, checking DETAILS array:", accountDetails.DETAILS);

    // Find the specific buying center detail
    const buyingCenterDetail = accountDetails.DETAILS.find(detail => {
      console.log("Checking buying center:", detail.BUYING_CENTRE, "against selected:", buyingCenter);
      return (detail.BC_ID || detail.BUYING_CENTRE) === buyingCenter;
    });

    console.log("Found buyingCenterDetail:", buyingCenterDetail);

    if (buyingCenterDetail) {
      // Add stakeholders from the STAKEHOLDERS array
      if (buyingCenterDetail.STAKEHOLDERS && Array.isArray(buyingCenterDetail.STAKEHOLDERS)) {
        console.log("Found stakeholders array:", buyingCenterDetail.STAKEHOLDERS);

        // Add stakeholders from the specific buying center
        buyingCenterDetail.STAKEHOLDERS.forEach((stakeholder, index) => {
          console.log(`Processing stakeholder ${index}:`, stakeholder);
          stakeholders.push({
            center: buyingCenterDetail.BUYING_CENTRE,
            stakeholder: stakeholder.STAKEHOLDER,
            designation: stakeholder.STAKEHOLDER_DESIGNATION,
            status: stakeholder.STAKEHOLDER_STATUS,
            stakeholderID: stakeholder.STAKEHOLDER_ID
          });
        });
      } else {
        console.log("No STAKEHOLDERS array found in buyingCenterDetail");
      }

      // Add KEY_STAKEHOLDER as an additional stakeholder with status "yes"
      if (buyingCenterDetail.KEY_STAKEHOLDER && Array.isArray(buyingCenterDetail.KEY_STAKEHOLDER)) {
        buyingCenterDetail.KEY_STAKEHOLDER.forEach(keyStakeholder => {
          if (keyStakeholder.KEY_STAKEHOLDER_NAME && keyStakeholder.KEY_STAKEHOLDER_NAME.trim() !== '') {
            stakeholders.push({
              center: buyingCenterDetail.BUYING_CENTRE,
              stakeholder: keyStakeholder.KEY_STAKEHOLDER_NAME,
              designation: keyStakeholder.KEY_STAKEHOLDER_DESIGNATION || '',
              status: 'Y', // Always set status to "Y" for KEY_STAKEHOLDER
              stakeholderID: keyStakeholder.KEY_STAKEHOLDER_ID
            });
          }
        });
      }
    } else {
      console.log("No buyingCenterDetail found");
    }
  } else {
    console.log("No account details or DETAILS array found");
  }

  console.log("Final stakeholders array:", stakeholders);
  console.log("Number of stakeholders found:", stakeholders.length);

  // Clear and repopulate the NPS stakeholder dropdown
  $("#nps_stakeholder").empty();
  $("#nps_stakeholder").append('<option value="-1">Select Stakeholder</option>');

  if (stakeholders.length > 0) {
    // Filter out undefined or empty stakeholders
    const validStakeholders = stakeholders.filter(stakeholder => {
      const isValid = stakeholder.stakeholder && stakeholder.stakeholder.trim() !== '' && stakeholder.stakeholder !== 'undefined';
      console.log("Stakeholder validation:", stakeholder.stakeholder, "->", isValid);
      return isValid;
    });

    console.log("Valid stakeholders after filtering:", validStakeholders);
    console.log("Number of valid stakeholders:", validStakeholders.length);

    if (validStakeholders.length > 0) {
      // Add "Select Stakeholder" as the first option
      console.log("Added default option to NPS dropdown");

      // Add all valid stakeholders as options
      validStakeholders.forEach((stakeholder, index) => {
        console.log(`Adding stakeholder option ${index}:`, stakeholder.stakeholder);
        $("#nps_stakeholder").append(
          `<option value="${stakeholder.stakeholderID}">${stakeholder.stakeholder}</option>`
        );
      });

      // Do not pre-select any option, let user select
      $("#nps_stakeholder").val("-1");
      $("#nps_stakeholder").css("background-color", "#fff !important"); // Remove disabled background color
      // Enable the dropdown since we have stakeholders
      $("#nps_stakeholder").prop("disabled", false);
      console.log("NPS Stakeholder dropdown populated and enabled with", validStakeholders.length, "options");
    } else {
      // No valid stakeholders found
      $("#nps_stakeholder").empty();
      $("#nps_stakeholder").css("background-color", "#eee !important");
      $("#nps_stakeholder").append('<option value="-1">No stakeholders available</option>');
      $("#nps_stakeholder").val("-1");
      $("#nps_stakeholder").prop("disabled", true);
      console.log("No valid stakeholders found after filtering");
    }
  } else {
    $("#nps_stakeholder").empty();
    $("#nps_stakeholder").append('<option value="-1">No stakeholders available</option>');
    $("#nps_stakeholder").val("-1");
    // Disable the dropdown if no stakeholders found
    $("#nps_stakeholder").prop("disabled", true);
    console.log("No stakeholders found for selected buying center");
  }

  // Final verification
  console.log("Final NPS dropdown state:");
  console.log("- Element exists:", $("#nps_stakeholder").length);
  console.log("- Is disabled:", $("#nps_stakeholder").prop("disabled"));
  console.log("- Current value:", $("#nps_stakeholder").val());
  console.log("- Number of options:", $("#nps_stakeholder option").length);
  console.log("- Options:", $("#nps_stakeholder option").map(function () { return $(this).val() + " - " + $(this).text(); }).get());

  console.log("=== UPDATE STAKEHOLDER DROPDOWN END ===");

  // --- Sync NPS STAKEHOLDER display dropdown ---
  syncNpsStakeholderDisplay(buyingCenter);
}

// Store selected NPS stakeholders for display
var selectedNpsStakeholders = [];

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

  // Clear the display dropdown
  $npsDisplay.val([]);
  $npsDisplay.empty();

  // Clear the details container and selected list
  selectedNpsStakeholders = [];
  $("#nps_stakeholder_details_container").empty().hide();

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
    return item.ACCOUNT_ID === defaultAccId;
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
      if (s.KEY_DIRECTS && typeof s.KEY_DIRECTS === 'string' && s.KEY_DIRECTS.trim() !== "") {
        keyDirectsSet.add(s.KEY_DIRECTS.trim());
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

// Function to refresh buying center dropdown - called from popup window
function refreshBuyingCenterDropdown() {
  // Re-fetch buying centers data
  getBuyingCenters(defaultAccId, function () {
    // Re-populate the dropdown with current account
    if (defaultAccId) {
      populateBuyingCenterDropdown(defaultAccId);
    }
  });
}

// Make refreshBuyingCenterDropdown globally available
window.refreshBuyingCenterDropdown = refreshBuyingCenterDropdown;

// Function to handle refresh from popup window (called by buying_center.js)
window.toRefreshBuyingCenterDropdown = function (newBuyingCenter, newStakeholder) {
  console.log('newBuyingCenter - ', newBuyingCenter);
  console.log("Refreshing Buying Center Dropdown...");

  // Re-fetch buying centers data to get the latest data including the new one
  getBuyingCenters(defaultAccId, function () {
    // Re-populate the dropdown with current account
    if (defaultAccId) {
      populateBuyingCenterDropdown(defaultAccId);

      // Set the newly created buying center as selected
      setTimeout(function () {
        $("#buying_center").val(newBuyingCenter);
        // Trigger change event to update NPS stakeholder dropdown
        $("#buying_center").trigger('change');

        // If stakeholder name is provided, set it after a short delay
        if (newStakeholder) {
          setTimeout(function () {
            $("#nps_stakeholder").val(newStakeholder);
          }, 100);
        }
      }, 100);
    }
  });
};

// Function to refresh buying center dropdown after creating new buying center
function refreshBuyingCenterAfterCreation(newBuyingCenterName, newStakeholderName) {
  // Re-fetch buying centers data to get the latest data including the new one
  getBuyingCenters(defaultAccId, function () {
    // Re-populate the dropdown with current account
    if (defaultAccId) {
      populateBuyingCenterDropdown(defaultAccId);

      // Set the newly created buying center as selected
      setTimeout(function () {
        $("#buying_center").val(newBuyingCenterName);
        // Trigger change event to update NPS stakeholder dropdown
        $("#buying_center").trigger('change');

        // If stakeholder name is provided, set it after a short delay
        if (newStakeholderName) {
          setTimeout(function () {
            $("#nps_stakeholder").val(newStakeholderName);
          }, 100);
        }
      }, 100);
    }
  });
}

function saveAccountData() {
  let d = new Date();
  let datestring =
    d.getFullYear() +
    "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + d.getDate()).slice(-2);
  let aad_account_name = $("#aad_account_name").val();
  let add_location = $("#add_location option:selected").val();
  let add_contact_account = $("#add_contact_account option:selected").val();
  let add_contact_account_name = $(
    "#add_contact_account option:selected"
  ).text();
  let add_business_head = $("#add_business_head option:selected").val();
  let add_business_head_name = $("#add_business_head option:selected").text();
  let add_delivery_head = $("#add_delivery_head option:selected").val();
  let add_delivery_head_name = $("#add_delivery_head option:selected").text();
  let stakeHolder = $("#stakeHolder").val();
  let buyingCenter = $("#buyingCenter").val();
  let account_class = "";
  let account_size = $("#account_size option:selected").val();
  let ms_signed_date = $("#ms_signed_date").val();
  let payment_term = $("#payment_term option:selected").val();

  const notesText = quill.getText().trim(); // Get plain text
  const notesHTML = quill.root.innerHTML; // Get formatted content

  console.log("Notes text:", notesText);
  console.log("Notes HTML:", notesHTML);

  let enteredNotes = notesHTML.trim(); // Trim whitespace

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

  // const quillText = quill.getText().trim();
  //   if (quillText.length > 0) {
  //     messages.push(`New Note has been added.`);

  //   }
  // console.log('quillText - ',quillText)

  if (aad_account_name == "") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Account Name should not be empty");
    return false;
  } else if (add_location == "-1") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Location should be selected");
    return false;
  } else if (add_contact_account == "-1") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Account head should be selected");
    return false;
  } else if (add_business_head == "-1") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Business head should be selected");
    return false;
  } else if (add_delivery_head == "-1") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Delivery head should be selected");
    return false;
  } else if (account_size == "-1") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Size should be selected");
    return false;
  } else if (buyingCenter == "") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Buying center should not be empty");
    return false;
  } else if (stakeHolder == "") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Stake holder should not be empty");
    return false;
  } else if (min_bill_rate_uscan == "") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Min Bill Rate - USCAN should not be empty");
    return false;
  } else if (min_bill_rate_ind == "") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Min Bill Rate - IND should not be empty");
    return false;
  } else if (min_bill_rate_ind == "") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Min Bill Rate - IND should not be empty");
    return false;
  }
  // else if (ms_signed_date == "") {
  //   toastr.options.timeOut = 3000; // 2s
  //   toastr.error("MSA Signed date should be selected");
  //   return false;
  // } else if (payment_term == "-1") {
  //   toastr.options.timeOut = 3000; // 2s
  //   toastr.error("Payment term should be selected");
  //   return false;
  // } 
  else if (enteredNotes == "") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please add a note for the account");
    return false;
  } else {
    ms_signed_date = convertDate(ms_signed_date);
    let takeApprovalResponse = "No",
      approverName = "";
    let special_instr = $("#special_instr").val();
    let min_bill_rate_uscan = $("#min_bill_rate_uscan").val();
    let min_bill_rate_ind = $("#min_bill_rate_ind").val();

    let auditMessages = "";

    let messages = [
      {
        ACTIVE_FLAG: "Y",
        TYPE_OF: "ACCOUNT_NAME",
        MESSAGE: `Account name created as ${aad_account_name}`,
      },
      {
        ACTIVE_FLAG: "Y",
        TYPE_OF: "LOCATION",
        MESSAGE: `Location selected as ${add_location}`,
      },
      {
        ACTIVE_FLAG: "Y",
        TYPE_OF: "BUYING_CENTER",
        MESSAGE: `Buying center selected as ${buyingCenter}`,
      },
      {
        ACTIVE_FLAG: "Y",
        TYPE_OF: "ACCOUNT_POINT_OF_CONTACT",
        MESSAGE: `Stack holder selected as ${stakeHolder}`,
      },
      {
        ACTIVE_FLAG: "Y",
        TYPE_OF: "BUSINESS_HEAD",
        MESSAGE: `Business head assigned to ${add_business_head_name}`,
      },
      {
        ACTIVE_FLAG: "Y",
        TYPE_OF: "DELIVERY_HEAD",
        MESSAGE: `Delivery head assigned to ${add_delivery_head_name}`,
      },
      {
        ACTIVE_FLAG: "Y",
        TYPE_OF: "FACTSPAN_ACCOUNT_HEAD_ID",
        MESSAGE: `Account head assigned to ${add_contact_account_name}`,
      },
      {
        ACTIVE_FLAG: "Y",
        TYPE_OF: "ACCOUNT_SIZE",
        MESSAGE: `Account Size selected as ${account_size}`,
      },
      {
        ACTIVE_FLAG: "Y",
        TYPE_OF: "BILLING_RATE",
        MESSAGE: `India minimum billing rate set as ${min_bill_rate_ind}`,
      },
      {
        ACTIVE_FLAG: "Y",
        TYPE_OF: "BILLING_RATE",
        MESSAGE: `US minimum billing rate set as ${min_bill_rate_uscan}`,
      },
      {
        ACTIVE_FLAG: "Y",
        TYPE_OF: "NOTES",
        MESSAGE: `New Note has been added.`,
      },
    ];

    console.log('messages - ', messages)

    if (ms_signed_date !== "" && ms_signed_date !== "0000-00-00") {
      messages.push({
        ACTIVE_FLAG: "Y",
        TYPE_OF: "MSA_SIGNED_DATE",
        MESSAGE: `MSA signed date selected as ${ms_signed_date}`,
      });
    }
    if (payment_term != "-1") {
      messages.push({
        ACTIVE_FLAG: "Y",
        TYPE_OF: "PAYMENT_TERM",
        MESSAGE: `Payment term selected as ${payment_term}`,
      });
    }
    console.log('messages - ', messages)

    let approvalData =
      '{ "TAKE_APPROVAL" : "' +
      takeApprovalResponse +
      '", "APPROVER":"' +
      approverName +
      '"}';

    let billing_data =
      '[{"BILLING_RATE":"' +
      min_bill_rate_ind +
      '","LOCATION":"INDIA"},{"BILLING_RATE":"' +
      min_bill_rate_uscan +
      '","LOCATION":"US"}]';

    let accountData =
      '[{"ACCOUNT_NAME":"' +
      escapeHtmlAcc(aad_account_name) +
      '","LOCATION":"' +
      add_location +
      '","BUYING_CENTRE": "' +
      buyingCenter +
      '","ACCOUNT_POINT_OF_CONTACT": "' +
      stakeHolder +
      '","BUSINESS_HEAD": "' +
      add_business_head +
      '","ACCOUNT_CLASS": "' +
      account_class +
      '","ACCOUNT_SIZE": "' +
      account_size +
      '","BILLING_DATA":' +
      billing_data +
      ',"FACTSPAN_ACCOUNT_HEAD_ID": "' +
      add_contact_account +
      '","PAYMENT_TERM": "' +
      payment_term +
      '","DELIVERY_HEAD": "' +
      add_delivery_head +
      '","MSA_SIGNED_DATE": "' +
      ms_signed_date +
      '"}]';

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

    let senddata = JSON.stringify({
      query_type: "append_account_new_UI",
      environment: apiValue.environment,
      user_details: "[" + accessDetails + "]",
      approver_data: "[" + approvalData + "]",
      account_data: accountData,
      notes: "[" + JSON.stringify(notesObject) + "]",
      audit_data: JSON.stringify(messages),
    });

    console.log("senddata - ", senddata);
    let apiURL = apiValue.url.replace("/app", "/append_account");
    $.ajax({
      url: apiURL,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      format: "json",
      async: false,
      mode: "no-cors",
      data: senddata,
      success: function (data) {
        if (data.Message == "Success") {
          console.log("message Success" + JSON.stringify(data));
          $("#addCreate").modal("hide");
          toastr.options.timeOut = 3000; // 2s
          toastr.success("Account Created Successfully");
          localStorage.setItem("account-back", "true");
          localStorage.setItem("created-account", aad_account_name);
          localStorage.setItem("created-buying-center", buyingCenter);
          localStorage.setItem("created-nps", stakeHolder);
          const searchParams = new URLSearchParams(window.location.search);
          const mode = searchParams.get('mode');
          let popupWindow;

          popupWindow = accountNewBuyingCenter(data.ACCOUNT_NAME, data.ACCOUNT_ID, buyingCenter, stakeHolder, mode);

          if (popupWindow) {
            let checkClosed = setInterval(() => {
              if (popupWindow.closed) {
                clearInterval(checkClosed);
                if (searchParams.get('from') === 'notesLog') {
                    // For BC mode, we refresh with the BC/Stakeholder they entered.
                    // For SOW mode, SOW creation happens inside the popup, and the popup itself will call toRefreshBuyingCenterDropdown on ITS opener's opener.
                    if (mode !== 'SOW') {
                        if (window.opener && typeof window.opener.toRefreshBuyingCenterDropdown === 'function') {
                            window.opener.toRefreshBuyingCenterDropdown(buyingCenter, stakeHolder, data.ACCOUNT_NAME);
                        }
                    }
                    window.close();
                } else {
                    window.location.href = "sowCreate.html";
                }
              }
            }, 1000);
          }
        } else {
          toastr.options.timeOut = 3000; // 2s
          toastr.success(data.Message);
        }
      },
      error: function (error) {
        console.log("message Error" + JSON.stringify(error));
      },
    });
  }
}

function escapeHtmlAcc(unsafe) {
  // Ensure the input is a valid string
  if (typeof unsafe !== "string") {
    console.error("Invalid input to escapeHtml:", unsafe); // Log invalid input for debugging
    return unsafe; // Return as is if it's not a string
  }

  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "{{newline}}");
}

function cancelAccount() {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('from') === 'notesLog') {
    window.close();
  } else {
    window.location.href = "sowCreate.html";
  }
}

function checkSowName() {
  let accName = $("#account_options").val();
  $.each(sowAccountOpt, function (i, acc) {
    if (acc.ACCOUNT_NAME == accName) {
      let sowName = $("#sow_new_name").val();
      let sowList = acc.SOW_NAMES;
      $.each(sowList, function (i, sow) {
        if (sow.toUpperCase() == sowName.toUpperCase()) {
          $("#sowWarningMsg").show();
          $("#update_sow").attr("disabled", "disabled");
          $("#update_sow").css("cursor", "no-drop");
          return false;
        } else {
          $("#sowWarningMsg").hide();
          $("#update_sow").removeAttr("disabled");
          $("#update_sow").css("cursor", "pointer");
        }
      });
    }
  });
  restrictSpecialCharactersById("sow_new_name");
}

function checkAccountName() {
  let accName = $("#aad_account_name").val().trim().toUpperCase();
  let isExist = false;

  if (accName !== "") {
    $.each(sowAccountOpt, function (i, acc) {
      let checkacc = acc.ACCOUNT_NAME;
      if (checkacc.toUpperCase() == accName) {
        isExist = true;
        return false;
      }
    });
  }

  if (isExist) {
    $("#accWarningMsg").show();
    $("#accDataSave").attr("disabled", "disabled");
    $("#accDataSave").css("cursor", "no-drop");
  } else {
    $("#accWarningMsg").hide();
    $("#accDataSave").removeAttr("disabled");
    $("#accDataSave").css("cursor", "pointer");
  }
  restrictSpecialCharactersById("aad_account_name");
}
function addSkillsData() {
  let accountName = $("#account_options option:selected").val();
  let totalTeamSize = parseInt($("#new_team").val(), 10) || 0;
  let actualStartDate = $("#actual_start_date").val();
  let actualEndDate = $("#actual_end_date").val();

  if (accountName === "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select account name");
    $("#billing_exp_div tbody").empty();
    return false;
  }

  console.log("totalTeamSize", totalTeamSize);

  // Clear the table if no team size is defined
  if (totalTeamSize === 0) {
    $("#billing_exp_div tbody").empty();
    $("#billing_exp_div").hide();
    $("#sow_amount").val("0");
    $("#proj_amount").val("0");
    return;
  }

  let totalBillInd = 0;
  let zeroBillIndRow = null;

  // Calculate the total team size and check for a row where bill_ind is 0
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

  calculateSowAmount(); // Recalculate after updating rows
}


function addRow(index, actualStartDate, actualEndDate) {
  let persona_class = "persona_button";
  let locat_class = "loc_bill_table";
  let bill_status_class = "billed_sow_table";

  let addSkillHtml = `<tr class="resource_row_${index}">
                        <td style="display:none" id="res_number_${index}">Resource ${index}</td>
                        <!-- Persona Column -->
                        <! -- <td class="persona_skills_td" id="persona_details_${index}">
                          <div class="${persona_class}" id="persona_text_${index}" style="display:none">
                            ${createDiv("-", "")}
                          </div>
                          <select id="persona_select_${index}" class="form-control select_persona"> 
                            ${personaOpt}
                          </select>
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
                        </td> -->
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
                            class="form-control placeicon dateData resourceDate autoStartUpdateDate datepicker-fields fa-placeholder" 
                            id="start_date_input_${index}" 
                            placeholder="&#xf073; mm-dd-yy" 
                            name="resource_start_date" 
                            autocomplete="off" 
                            style="z-index: 1;" 
                            onchange="checkEndDate('start_date_input_${index}', 'end_date_input_${index}', 'Resource End Date should be greater than Resource Start Date'),calculateSowAmount()"
                            value="${actualStartDate}" />
                        </td>
                        <td>
                          <span id="end_date_${index}" style="display:none"></span>
                          <input type="text" 
                            class="form-control placeicon dateData resourceDate autoEndUpdateDate datepicker-fields fa-placeholder" 
                            id="end_date_input_${index}" 
                            placeholder="&#xf073; mm-dd-yy" 
                            name="resource_end_date" 
                            autocomplete="off" 
                            style="z-index: 1;" 
                            onchange="checkEndDate('start_date_input_${index}', 'end_date_input_${index}', 'Resource End Date should be greater than Resource Start Date'),calculateSowAmount()"
                            value="${actualEndDate}" />
                        </td>
                        <td>
                          <span id="ind_us_res_days_ind_${index}"  class="days_amount"></span>
                        </td>
                        <td>
                          <span class="${locat_class}" id="loc_text_${index}" style="display:none"></span>
                          <select class="form-control" id="loc_select_${index}" onchange="locSowAmount(this)">
                            ${locationOpt}
                          </select>
                        </td>
                        <td>
                          <span class="${bill_status_class}" id="bill_status_${index}" style="display:none"></span>
                          <select class="form-control" id="bill_select_${index}" onchange="calculateSowAmount()">
                            ${billingOpt}   
                          </select>
                        </td>
                        <td>
                          <input type="number" 
                            class="form-control" 
                            id="bill_us_rate_${index}" 
                            placeholder="Bill" 
                            onchange="calculateSowAmount()"
                            min="0" 
                            step="1" 
                            value="0"/>
                        </td>
                        <td>
                          <span id="bill_ind_${index}" style="display:none"></span>
                          <input type="number" 
                            class="form-control" 
                            id="bill_ind_input_${index}" 
                            placeholder="Bill" 
                            oninput="handleIntegerValuesOnly(this)"
                            min="0" 
                            step="1" 
                            value="1" />
                        </td>
                        <td>
                          <span id="ind_us_res_amount_ind_${index}" class="days_amount">$0</span>
                        </td>
                        <td>
                          <button class="btn btn-info delete_button" onclick="deleteSkill(this)">
                            <i class="fa fa-trash" aria-hidden="true"></i>
                          </button>
                        </td>
                      </tr>`;

  $("#billing_exp_div tbody").append(addSkillHtml);

  // Get the billing option for this row
  let billingOption = $(`#bill_select_${index}`).val(); // Assuming the select for billing options is where you select the billing option
  console.log("Billing Option: " + billingOption);
  var billingDropdown = document.getElementById("billing_options");
  var billingType = billingDropdown.value.trim(); // Get and trim the value
  console.log(billingType); // Log the value to check
  // If the billing option is "Fixed Price", hide the Billing Rate and Amount columns
  if (billingType === "Fixed Price") {
    hideBillingRateAmountColumns(); // This will hide the columns in header and body
  }

  let loc_status = "#loc_select_" + index;
  console.log("loc_status - " + loc_status);
  loc_status = $(loc_status).val();
  console.log("loc_status - " + loc_status);
  if (loc_status == "US") {
    $("#bill_us_input_" + index).val(bill_us_default);
  } else if (loc_status == "India" || loc_status == "INDIA") {
    $("#bill_us_input_" + index).val(bill_ind_default);
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

  // function submitCustomPersona() {
  //   const customPersona = $(`#other_text_${index}`).val();
  //   if (customPersona) {
  //     const $select = $(`#persona_select_${index}`);
  //     const $tooltip = $(`#tooltip_${index}`);

  //     $tooltip.text(customPersona);
  //     $select.val("Others");

  //     let customOption = $select.find("option[value='custom']");
  //     if (customOption.length !== 0) {
  //       customOption.text(customPersona);
  //       customOption.prop("selected", true);
  //     }

  //     $(`#others_input_${index}`).slideUp();
  //     toastr.success(`Others Persona - ${customPersona} has been added`);
  //   }
  // }
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

  $("#persona_skill_" + index).on("focus click", function () {
    const dropdown = $(this);
    const offset = dropdown.offset();
    dropdown.css({
      position: "absolute",
      top: offset.top + dropdown.outerHeight(),
      left: offset.left,
      zIndex: 1050,
    });
  });


}

// Function to hide Billing Rate and Amount columns dynamically
function hideBillingRateAmountColumns() {
  let table = document.getElementById("billing_exp_div");
  if (!table) return;

  // Identify the columns by index
  let headers = table.querySelectorAll("thead th");
  let columnIndexes = [];

  headers.forEach((th, index) => {
    let text = th.textContent.trim().toLowerCase();
    if (text === "billing rate($)" || text === "amount") {
      columnIndexes.push(index);
      th.style.display = "none"; // Hide the header
    }
  });

  // Hide the corresponding <td> elements in each row of <tbody> & set them to 0
  table.querySelectorAll("tbody tr").forEach((row) => {
    let cells = row.children;
    columnIndexes.forEach((colIndex) => {
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

function deleteSkill(obj) {
  let tb = $("#billing_exp_div:eq(0) tbody");
  let size = tb.find("tr").length;

  // Target the closest row and get the 9th column's input value
  let $row = $(obj).closest("tr");
  let rCount = $row
    .find("td:eq(9)")
    .find("input")
    .val();

  // Remove the row
  $row.remove();

  // Calculate the new value for #new_team
  let newTeamField = parseInt($("#new_team").val()) || 0; // Default to 0 if empty or invalid
  rCount = parseInt(rCount) || 0; // Default to 0 if empty or invalid

  let currentValue = newTeamField - rCount;

  console.log("currentValue", currentValue);

  $("#new_team").val(currentValue);
  if (currentValue === 0) {
    $("#billing_exp_div tbody").empty();

    // Set sow_amount and proj_amount to zero
    $("#sow_amount").val("0");
    $("#proj_amount").val("0");
  }
  calculateSowAmount();
}

let businessRuleData = "";
let sowEditBusRule = "";
function getBusinessRule() {
  let apiURL = apiValue.url.replace("/app", "/approval_rules");
  const startTime = performance.now();
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
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(
        loadTimeInSeconds,
        "SowCreate",
        "Revenue",
        "approval_rules",
        "success",
        fileName,
        "SowCreate",
        "view"
      );
      businessRuleData = json;
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(
        loadTimeInSeconds,
        "SowCreate",
        "Revenue",
        "approval_rules",
        "error",
        fileName,
        "SowCreate",
        "view"
      );
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Message error" + JSON.stringify(error));
    },
  });
}

function updatePersonaDate() {
  let StartDate = $("#actual_start_date").val();
  $(".autoStartUpdateDate").val(StartDate);
  let EndDate = $("#actual_end_date").val();
  let enddateCheck = checkEndDate(
    "actual_start_date",
    "actual_end_date",
    "Actual End date should be after Actual Start date"
  );
  if (enddateCheck) {
    $(".autoEndUpdateDate").val(EndDate);
    calculateSowAmount();
  } else {
    $(".autoEndUpdateDate").val("");
  }
}
function checkEndDate(startdateid, enddateid, message) {
  console.log("checkEndDate function invoked");
  let StartDateCon = new Date($("#" + startdateid).val());
  let EndDateCon = new Date($("#" + enddateid).val());

  let status = true;

  // Check if the start date is selected
  if (StartDateCon == undefined || StartDateCon == null || StartDateCon == "") {
    toastr.error("Please select start date");
    status = false;
  }

  // If start date is greater than end date, show error and clear end date
  if (StartDateCon > EndDateCon) {
    toastr.error(message);
    $("#" + enddateid).val(""); // Clear the invalid End Date
    status = false;
  } else {
    // Calculate months difference if valid
    if (status) {
      console.log("Hi welcome");

      calculateMonthsDifference(StartDateCon, EndDateCon);
    }
  }

  return status;
}
function updateAllDates() {
  console.log("!!!!!!!!!!!!!!!!!", $("#billing_start_date").val())
  let AllStartDate = $("#legal_start_date").val();
  $(".updateStartDate").val(AllStartDate);
  let AllEndDate = $("#legal_end_date").val();
  let enddateCheck = checkEndDate(
    "legal_start_date",
    "legal_end_date",
    "Legal End Date should be after Legal Start Date"
  );
  console.log("enddateCheck - ", enddateCheck);
  if (enddateCheck) {
    $(".updateEndDate").val(AllEndDate);
    updatePersonaDate();
    calculateMonthsDifference();
    // calculateSowAmount();
  } else {
    $(".updateEndDate").val("");
    $(".autoEndUpdateDate").val("");
  }
}

// Get Number of years, months, days using this function
function dateAgo(start, end) {
  let startDate = new Date(start);
  let endDate = new Date(end);
  var diffDate = new Date(startDate - endDate);
  return (
    diffDate.toISOString().slice(0, 4) -
    1970 +
    "Y " +
    diffDate.getMonth() +
    "M " +
    (diffDate.getDate() - 1) +
    "D"
  );
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
  let funnelOpt = `<option value="-1">Select Probability</option>
                    <option value="10">10%</option>
                    <option value="30 to 50">30% to 50%</option>
                    <option value="70">&gt; 70%</option>
                    <option value="100">100%</option>`;
  $("#probability_options").empty();
  if (funnelVal == "Lead") {
    $("#probability_options").append(probLeadPreQua);
  } else if (funnelVal == "Signed") {
    $("#probability_options").append(probSigned);
  } else if (
    funnelVal == "Qualified" ||
    funnelVal == "Pre-Qualified" ||
    funnelVal == "Renewal"
  ) {
    $("#probability_options").append(probOther);
  } else if (funnelVal == "Proposal") {
    $("#probability_options").append(probProposal);
  } else if (funnelVal == "Lost") {
    $("#probability_options").append(pronLost);
  } else if (funnelVal == "Closed") {
    $("#probability_options").append(pronLost);
  } else if (funnelVal == "Scout") {
    $("#probability_options").append(scoutOpt);
  } else {
    $("#probability_options").append(funnelOpt);
  }

  if (funnelVal == "Lead" || funnelVal == "Scout") {
    $('.prob_imp').hide();
    $('.sow_type_imp').hide();
    $('.billing_imp').hide();
    $('#sow_options').val('Net New');
    $('#billing_options').val('Time and Material');
    // $('.opp_name_imp').hide();
  } else {
    $('.prob_imp').show();
    $('.sow_type_imp').show();
    $('.billing_imp').show();
    $('#sow_options').val('-1');
    $('#billing_options').val('-1');
    // $('.opp_name_imp').show();
  }

  // if (funnelVal === "Signed") {
  //   $('.nps_imp').show();
  // } else {
  //   $('.nps_imp').hide();
  // }
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

// function fixedRateCal(startDate, endDate, billrate) {
//   let newStart = convertDate(startDate);
//   let newEnd = convertDate(endDate);
//   dateRange(newStart, newEnd);
//   let dateLen = dates.length - 1;
//   let totalValue = 0;
//   $.each(dates, function (i, firstdate) {
//     let businessDays = 0;
//     let resBusDays = 0;
//     let tempCal = 0;
//     if (i == 0) {
//       resBusDays = getBusinessDatesCount(newStart, lastDates[0]);
//       businessDays = getBusinessDatesCount(dates[i], lastDates[i]);
//       tempCal = (21 / businessDays) * resBusDays;
//       tempCal = Math.round(tempCal * 100) / 100;
//       totalValue += Math.round(tempCal * billrate * 8 * 100) / 100;
//     } else if (dateLen == i) {
//       resBusDays = getBusinessDatesCount(dates[dateLen], newEnd);
//       businessDays = getBusinessDatesCount(dates[i], lastDates[i]);
//       tempCal = (21 / businessDays) * resBusDays;
//       tempCal = Math.round(tempCal * 100) / 100;
//       totalValue += Math.round(tempCal * billrate * 8 * 100) / 100;
//     } else {
//       resBusDays = getBusinessDatesCount(dates[i], lastDates[i]);
//       businessDays = getBusinessDatesCount(dates[i], lastDates[i]);
//       tempCal = (21 / businessDays) * resBusDays;
//       tempCal = Math.round(tempCal * 100) / 100;
//       totalValue += Math.round(tempCal * billrate * 8 * 100) / 100;
//     }
//   });
//   return Math.round(totalValue);
// }

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

// function removeHolidays(startDate, endDate, billrate, location) {
//   let holidayList = sowDropDownJson.HOLIDAY_DATA;
//   let currentYear = new Date().getFullYear();
//   let newStart = convertDate(startDate);
//   let newEnd = convertDate(endDate);
//   dateRange(newStart, newEnd);
//   let dateLen = dates.length - 1;
//   let totalValue = 0;
//   $.each(dates, function (i, firstdate) {
//     let businessDays = 0;
//     let resBusDays = 0;
//     if (i == 0) {
//       let holidayCount = 0;
//       resBusDays = getBusinessDatesCount(newStart, lastDates[0]);
//       let splitMonth = newStart.split("-");
//       let getYear = splitMonth[0];
//       let getMnth = splitMonth[1];
//       $.each(holidayList, function (l, hldyData) {
//         if (hldyData.YEAR == getYear) {
//           $.each(hldyData.YEAR_DATA, function (j, mnthData) {
//             if (mnthData.MONTH == getMnth) {
//               if (location == "INDIA" || location == "india") {
//                 $.each(mnthData.IND_HOLIDAY, function (k, eachDay) {
//                   let tempStartDate = new Date(newStart),
//                     tempEndDate = new Date(lastDates[0]);
//                   let tempCompDate = new Date(eachDay);
//                   if (
//                     tempCompDate >= tempStartDate &&
//                     tempCompDate <= tempEndDate
//                   ) {
//                     holidayCount++;
//                   }
//                 });
//               } else if (location == "US") {
//                 $.each(mnthData.US_HOLIDAY, function (k, eachDay) {
//                   let tempStartDate = new Date(newStart),
//                     tempEndDate = new Date(lastDates[0]);
//                   let tempCompDate = new Date(eachDay);
//                   if (
//                     tempCompDate >= tempStartDate &&
//                     tempCompDate <= tempEndDate
//                   ) {
//                     holidayCount++;
//                   }
//                 });
//               }
//             }
//           });
//         }
//       });
//       resBusDays = resBusDays - holidayCount;
//       totalValue += resBusDays * billrate * 8;
//     } else if (dateLen == i) {
//       let holidayCount = 0;
//       resBusDays = getBusinessDatesCount(dates[dateLen], newEnd);
//       let splitMonth = newEnd.split("-");
//       let getYear = splitMonth[0];
//       let getMnth = splitMonth[1];
//       $.each(holidayList, function (l, hldyData) {
//         if (hldyData.YEAR == getYear) {
//           $.each(hldyData.YEAR_DATA, function (j, mnthData) {
//             if (mnthData.MONTH == getMnth) {
//               if (location == "INDIA" || location == "india") {
//                 $.each(mnthData.IND_HOLIDAY, function (k, eachDay) {
//                   let tempStartDate = new Date(dates[dateLen]),
//                     tempEndDate = new Date(newEnd);
//                   let tempCompDate = new Date(eachDay);
//                   if (
//                     tempCompDate >= tempStartDate &&
//                     tempCompDate <= tempEndDate
//                   ) {
//                     holidayCount++;
//                   }
//                 });
//               } else if (location == "US") {
//                 $.each(mnthData.US_HOLIDAY, function (k, eachDay) {
//                   let tempStartDate = new Date(dates[dateLen]),
//                     tempEndDate = new Date(newEnd);
//                   let tempCompDate = new Date(eachDay);
//                   if (
//                     tempCompDate >= tempStartDate &&
//                     tempCompDate <= tempEndDate
//                   ) {
//                     holidayCount++;
//                   }
//                 });
//               }
//             }
//           });
//         }
//       });
//       resBusDays = resBusDays - holidayCount;
//       totalValue += resBusDays * billrate * 8;
//     } else {
//       let holidayCount = 0;
//       resBusDays = getBusinessDatesCount(dates[i], lastDates[i]);
//       let splitMonth = dates[i].split("-");
//       let getYear = splitMonth[0];
//       let getMnth = splitMonth[1];
//       $.each(holidayList, function (l, hldyData) {
//         if (hldyData.YEAR == getYear) {
//           $.each(hldyData.YEAR_DATA, function (j, mnthData) {
//             if (mnthData.MONTH == getMnth) {
//               if (location == "INDIA" || location == "india") {
//                 $.each(mnthData.IND_HOLIDAY, function (k, eachDay) {
//                   let tempStartDate = new Date(dates[i]),
//                     tempEndDate = new Date(lastDates[i]);
//                   let tempCompDate = new Date(eachDay);
//                   if (
//                     tempCompDate >= tempStartDate &&
//                     tempCompDate <= tempEndDate
//                   ) {
//                     holidayCount++;
//                   }
//                 });
//               } else if (location == "US") {
//                 $.each(mnthData.US_HOLIDAY, function (k, eachDay) {
//                   let tempStartDate = new Date(dates[i]),
//                     tempEndDate = new Date(lastDates[i]);
//                   let tempCompDate = new Date(eachDay);
//                   if (
//                     tempCompDate >= tempStartDate &&
//                     tempCompDate <= tempEndDate
//                   ) {
//                     holidayCount++;
//                   }
//                 });
//               }
//             }
//           });
//         }
//       });
//       resBusDays = resBusDays - holidayCount;
//       totalValue += resBusDays * billrate * 8;
//     }
//   });
//   return totalValue;
// }

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
const holidaysCount = (holidayList, getYear, getMnth, location, start, end) => {
  let holidayCount = 0;
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
                <input type="radio" name="interactionType" value="N/A" checked>
                <span class="radio-content"><i class="fas fa-ban"></i> N/A</span>
              </label>
              <label class="custom-radio">
                <input type="radio" name="interactionType" value="In Person">
                <span class="radio-content"><i class="fas fa-users"></i> In Person</span>
              </label>
              <label class="custom-radio">
                <input type="radio" name="interactionType" value="Phone Call">
                <span class="radio-content"><i class="fas fa-phone-alt"></i> Phone Call</span>
              </label>
              <label class="custom-radio">
                <input type="radio" name="interactionType" value="Video Call">
                <span class="radio-content"><i class="fas fa-video"></i> Video Call</span>
              </label>
              <label class="custom-radio">
                <input type="radio" name="interactionType" value="Slack/Teams">
                <span class="radio-content"><i class="fas fa-comment-dots"></i> Slack/Teams</span>
              </label>
              <label class="custom-radio">
                <input type="radio" name="interactionType" value="Phone Text">
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
    `,
  },
  {
    name: "Audit Logs",
    content: `
            <div class="audit-log">
  <ul id="audit-log-list" class="audit-list-create">
    No Audit log available.
  </ul>
</div>

          `,
  },
  {
    name: "Resource Details",
    content: `
      <div class='resource_group_tab'>
      <table class="table table-bordered border-primary" id="billing_exp_div">
        <thead>
          <tr id="resource-th">
            <th class='no-warp' style="width:10%">Expertise Persona <span class="warningMessage">*</span></th>
            <th style="display:none">Skill</th>
            <th class='no-warp' style="width:8%">Start Date <span class="warningMessage">*</span></th>
            <th class='no-warp' style="width:8%">End Date <span class="warningMessage">*</span></th>
            <th style="width:4%">Days</th>
            <th class='no-warp' style="width:8%">Location <span class="warningMessage">*</span></th>
            <th class='no-warp' style="width:8%">Billing Status <span class="warningMessage">*</span></th>
            <th class='no-warp' style="width:8%">Billing Rate($)</th>
            <th class='no-warp' style="width:5%">Count <span class="warningMessage">*</span></th>
            
            <th style="width:10%">Amount</th>
            <th style="width: 1%">
              <button class="btn btn-info-add" id="addSkill" onclick="addSkill()">
                <i class="fa fa-plus" aria-hidden="true"></i>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
      </div>
    `,
  },
  {
    name: "Monthly Breakup",
    content: `
      <div class="monthly-breakup-content">
        <div id="monthlyTableContainer"></div> <!-- Table container -->
      </div>`,
  },
];
const AccountTabs = [
  {
    name: "Notes",
    content: `
        <div class="notes-form-container">
          <!-- Detailed Notes -->
          <div class="detailed-notes" style="margin-top: 0px;">
            <label class="section-label">Notes <span class="warningMessage">*</span></label>
            <div id="editor"></div>
            <span class="warningMessage" id="charLimitWarning" style="display: none; color: red;">
              Maximum character limit of 2000 reached!
            </span>
          </div>
        </div>
    `,
  },
  {
    name: "Audit Logs",
    content: `
            <div class="audit-log">
  <ul id="audit-log-list" class="audit-list-create">
    No Audit log available.
  </ul>
</div>

          `,
  },
];

function createTabs() {
  const tabButtonsContainer = document.getElementById("tab-buttons");
  const tabContentContainer = document.getElementById("tab-content-container");

  if (!tabButtonsContainer || !tabContentContainer) {
    console.error("Tab containers not found!");
    return;
  }

  tabs.forEach((tab, index) => {
    // Create tab button
    const tabButton = document.createElement("button");
    tabButton.className = "tab-button";
    tabButton.textContent = tab.name;
    tabButton.onclick = () => switchTab(index);

    // Append the tab button
    tabButtonsContainer.appendChild(tabButton);

    // Create tab content
    const tabContent = document.createElement("div");
    tabContent.className = "tab-content";
    tabContent.innerHTML = tab.content;
    tabContent.style.display = index === 0 ? "block" : "none"; // Show first tab initially

    // Hide "Monthly Breakup" tab on initial load
    if (tab.name === "Monthly Breakup") {
      tabButton.style.display = "none"; // Hide the tab button
      tabContent.style.display = "none"; // Hide the tab content
    }

    // Append the tab content
    tabContentContainer.appendChild(tabContent);
  });

  // Make the first tab active by default
  tabButtonsContainer.children[0].classList.add("active");

  initializeQuill(); // Initialize Quill editor if needed
}

function createTabsAccount() {
  const tabButtonsContainer = document.getElementById("tab-buttons-account");
  const tabContentContainer = document.getElementById(
    "tab-content-container-account"
  );

  if (!tabButtonsContainer || !tabContentContainer) {
    console.error("Tab containers not found!");
    return;
  }

  AccountTabs.forEach((tab, index) => {
    // Create tab button
    const tabButton = document.createElement("button");
    tabButton.className = "tab-button-account";
    tabButton.textContent = tab.name;
    tabButton.onclick = () => switchTabAccount(index);

    tabButtonsContainer.appendChild(tabButton);

    // Create tab content
    const tabContent = document.createElement("div");
    tabContent.className = "tab-content-account";
    tabContent.innerHTML = tab.content;
    tabContent.style.display = index === 0 ? "block" : "none"; // Show first tab initially

    tabContentContainer.appendChild(tabContent);
  });

  if (tabButtonsContainer.children.length > 0) {
    tabButtonsContainer.children[0].classList.add("active");
  }

  initializeQuill(); // Initialize Quill editor if needed
}

function switchTabAccount(index) {
  const tabButtons = document.querySelectorAll(".tab-button-account");
  const tabContents = document.querySelectorAll(".tab-content-account");
  const tabContentContainer = tabContents[index]; // Current tab content container

  // Activate the clicked tab and deactivate others
  tabButtons.forEach((button, i) => {
    button.classList.toggle("active", i === index); // Highlight the active tab
    tabContents[i].style.display = i === index ? "block" : "none"; // Show corresponding content

    // Add or remove custom class for the "Resource Details" tab
    // if (tabs[i].name === "Resource Details") {
    //   tabContents[i].classList.toggle("resource-active", i === index); // Apply class if active
    // }
  });

  tabContentContainer.style.height = "calc(100vh - 380px);"; // Default height for other tabs
  tabContentContainer.style.overflowY = "auto"; // Default overflow for other tabs
}

function switchTab(index) {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  const tabContentContainer = tabContents[index]; // Current tab content container

  // Activate the clicked tab and deactivate others
  tabButtons.forEach((button, i) => {
    button.classList.toggle("active", i === index); // Highlight the active tab
    tabContents[i].style.display = i === index ? "block" : "none"; // Show corresponding content

    // Add or remove custom class for the "Resource Details" tab
    if (tabs[i].name === "Resource Details") {
      tabContents[i].classList.toggle("resource-active", i === index); // Apply class if active
    }
  });

  // Force re-render for "Resource Details" tab (if necessary)
  if (tabs[index].name === "Resource Details") {
    const table = document.querySelector("#billing_exp_div");
    if (table) {
      table.style.display = "none";
      setTimeout(() => {
        table.style.display = "table"; // Restore table display
      }, 0);
      addSkillsData(); // Call any required function
    }

    // Ensure scrolling if content exceeds height
    tabContentContainer.style.height = "calc(100vh - 380px);"; // Set fixed height
    tabContentContainer.style.overflowY = "auto"; // Enable scrolling
    tabContentContainer.classList.add("resource-scroll"); // Add custom class for styling if needed
  } else {
    tabContentContainer.style.height = "calc(100vh - 380px);"; // Default height for other tabs
    tabContentContainer.style.overflowY = "auto"; // Default overflow for other tabs
  }
}

let previousTeamSize = 0; // Store the previous valid team size

function validateNumber(event) {
  const input = event.target;
  const enteredValue = parseInt(input.value, 10) || 0; // Ensure value is an integer
  const warningMessage = input.parentElement.querySelector("span");
  const tabButtons = document.querySelectorAll(".tab-button");

  // Get the selected account name
  const accountName = $("#account_options option:selected").val();

  // Check if account name is invalid and entered value is greater than 0
  if (accountName === "-1" && enteredValue > previousTeamSize) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select an account name before updating team size.");
    input.value = previousTeamSize; // Reset to the previous valid value
    warningMessage.style.display = "none";
    return;
  }
  const billingType = $('#billing_options option:selected').val();

  // Check if billing type is "Fixed Price" and entered value is greater than 0
  if (billingType === "-1" && enteredValue > previousTeamSize) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select a billing type before updating team size.");
    input.value = previousTeamSize; // Reset to the previous valid value
    warningMessage.style.display = "none";
    return;
  }

  // Check if enteredValue is 0
  if (enteredValue === 0) {
    // Set sow_amount and proj_amount to zero
    $("#sow_amount").val("0");
    $("#proj_amount").val("0");
  }

  // Validate the number input
  if (isNaN(enteredValue) || enteredValue <= 0) {
    warningMessage.style.display = "inline";
    switchTab(0); // Switch to the first tab
  } else {
    warningMessage.style.display = "none";
    tabButtons[1].style.display = "inline-block";
    switchTab(2); // Switch to the appropriate tab
    previousTeamSize = enteredValue; // Update the previous valid team size
  }
}

// Initialize Quill only when the Notes tab is active
// Initialize Quill when the Monthly Breakup tab is active
function initializeQuill() {
  const Size = Quill.import("attributors/style/size");
  // Register the 'size' format
  Quill.register(Size, true);

  // Initialize Quill
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

  // Set default font size for all entered text
  quill.clipboard.dangerouslyPasteHTML(0, '<p style="font-size: 15px;"></p>');
  const charLimitWarning = document.getElementById("charLimitWarning");

  quill.on("text-change", function () {
    const text = quill.getText().trim();
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
}

document.addEventListener("DOMContentLoaded", function () {
  createTabs();
  createTabsAccount();
});

function showCustomAlert() {
  document.querySelector(".custom-overlay").style.display = "block";
  document.querySelector(".custom-alert").style.display = "block";
}

function closeCustomAlert() {
  document.querySelector(".custom-overlay").style.display = "none";
  document.querySelector(".custom-alert").style.display = "none";
}
function saveNewSow(updateData) {
  let totalCount = 0; // Variable to store the total count
  let totalCountIndia = 0; // Variable to store total count for India
  let totalCountUS = 0; // Variable to store total count for US
  const inputField = document.getElementById("sow_amount");

  let exitFunction = false;
  inputField.addEventListener("change", function () {
    console.log("Input field value changed:", inputField.value);
    sow_amount_user_edit = "YES";
  });
  console.log("sow_amount_user_edit", sow_amount_user_edit);
  let resUpdateData = "";
  console.log("updateData - ", updateData);
  let updateTeamSize = $("#new_team").val();
  const notesText = quill.getText().trim(); // Get plain text
  const notesHTML = quill.root.innerHTML; // Get formatted content

  console.log("Notes text:", notesText);
  console.log("Notes HTML:", notesHTML);

  // --- Start Engagement Notes Data Collection ---
  const interactionType = $('input[name="interactionType"]:checked').val();
  const meetingDate = $('#meetingDate').val();
  const nextStepsType = $('.toggle-btn.active').attr('data-value');
  const nextStepsText = nextStepsQuill ? nextStepsQuill.getText().trim() : "";
  const nextStepsHTML = nextStepsQuill ? nextStepsQuill.root.innerHTML : "";
  const nextStepsEta = $('#nextStepsEta').val();
  const nextInteractionType = $('input[name="nextInteractionType"]:checked').val();
  const nextInteractionEta = $('#nextInteractionEta').val();

  // Mandatory Field Validations for Engagement Notes
  if (interactionType === 'N/A') {
    if (!notesText) {
      toastr.error("Please add notes under Interaction Type 'N/A'");
      return;
    }
  } else {
    // Validation for Meeting Date and Detailed Notes
    if (!meetingDate) {
      toastr.error("Meeting Date is mandatory.");
      return;
    }
    if (!notesText) {
      toastr.error("Detailed Notes are mandatory.");
      return;
    }

    // Validation for Next Steps if enabled
    if (nextStepsType === 'Next Steps') {
      if (!nextStepsText || nextStepsHTML === '<p><br></p>') {
        toastr.error("Next Steps Text is mandatory.");
        return;
      }
      if (!nextStepsEta) {
        toastr.error("Next Steps Estimated Date is mandatory.");
        return;
      }
    }

    // Validation for Next Interaction (Radio and Date)
    if (!nextInteractionType) {
      toastr.error("Please select a Next Interaction Type.");
      return;
    }
    if (!nextInteractionEta) {
      toastr.error("Next Interaction Estimated Date is mandatory.");
      return;
    }
  }

  let updateAcc = $("#account_options option:selected").val();
  let updateSow = $("#sow_new_name").val();
  let updatebuyingCenter = $("#buying_center option:selected").val();
  let updatebuyingCenterName = $("#buying_center option:selected").text();
  let updatenpsStakeHolderID = $("#nps_stakeholder option:selected").val();
  let updatenpsStakeHolder = $("#nps_stakeholder option:selected").text();

  // Helper to construct engagement note payload for consolidated update
  function getEngagementNotePayload() {
    if (!notesText && (!nextStepsText || nextStepsHTML === '<p><br></p>' || nextStepsType === 'No Next Steps')) return null;

    const empId = localStorage.getItem("EmpUserID");
    const empName = localStorage.getItem("EmpUserName");

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
      account_id: defaultAccId || "",
      account_name: escapeHtml(updateAcc),
      sow_id: "",
      sow_name: escapeHtml(updateSow),
      unique_id: "",
      bc_name: updatebuyingCenterName,
      bc_id: updatebuyingCenter,
      primary_entity: {
        type: "SOW",
        id: "",
        name: escapeHtml(updateSow)
      },
      standard_entities: {
        account: {
          id: defaultAccId || "",
          name: escapeHtml(updateAcc)
        },
        sow: {
          id: "",
          name: escapeHtml(updateSow)
        }
      },
      related_entities: [
        {
          type: "LEAD",
          id: updatenpsStakeHolderID,
          name: updatenpsStakeHolder
        }
      ]
    };
  }
  const engagementNoteData = getEngagementNotePayload();
  // --- End Engagement Notes Data Collection ---

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

  let enteredNotes = notesHTML.trim(); // Trim whitespace

  // Check for non-empty meaningful content (excluding empty HTML like <p><br></p>)
  if (enteredNotes.length === 0 || /^<p><br><\/p>$/.test(enteredNotes)) {
    enteredNotes = ""; // Set to empty string if content is meaningless
  }

  let notesObject = {
    NOTES: enteredNotes,
  };

  let updateFunnel = $("#funnel_options option:selected").val();
  let updateProb = $("#probability_options option:selected").val();
  let updateSowType = $("#sow_options option:selected").val();
  let updateBillingType = $("#billing_options option:selected").val();
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
    .replace(/,/g, "")
    .trim();
  updateSowAmount = parseInt(updateSowAmount, 10) || 0; // Default to 0 if the value is empty or invalid
  updateProjAmount = updateProjAmount || 0;

  let updateGrowthLeaderId = $("#acc_growth_name_option option:selected").val();
  let updateGrowthLeaderName = $(
    "#acc_growth_name_option option:selected"
  ).text();

  // Prepare NPS Stakeholder data
  let npsStakeholderData = selectedNpsStakeholders.map(s => ({
    stakeholder_id: s.keyDirects ? "" : s.id,
    stakeholder_name: s.name
  }));

  let takeApprovalResponse = "No";
  let createdByOwnerId = "";
  let createdByOwnerName = "";
  let approverName = [];
  let UserIDheadFlag = false;
  let sowStageFlag = false;
  let sowAmtFlag = false;
  let billRateFlag = false;
  // let updatebuyingCenter = $("#buying_center option:selected").val();
  // let updatenpsStakeHolderID = $("#nps_stakeholder option:selected").val();
  // let updatenpsStakeHolder = $("#nps_stakeholder option:selected").text();
  // console.log("updatebuyingCenter---",updatebuyingCenter);
  // console.log("updatenpsStakeHolder---",updatenpsStakeHolder);

  $("#funnel_name").html(updateFunnel);
  $("#probab_name").html(updateProb);
  $("#sow_type_name").html(updateSowType);
  $("#billing_type_name").html(updateBillingType);
  if (updateFunnel == "Lead" || updateFunnel == "Scout") {
    if (updateSowType == "-1") {
      updateSowType = 'Net New'
    }
    if (updateBillingType == "-1") {
      updateBillingType = 'Time and Material'
    }
  }
  console.log("monthsObject", monthsObject);
  let monthsObject_month = monthsObject.MONTHS;
  console.log("monthsObject_month", monthsObject_month);
  let monthly_breakupSum = 0;

  Object.keys(monthsObject_month).forEach((month) => {
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
      console.log("monthValue", monthValue);

      if (monthValue === "" || isNaN(monthValue)) {
        const monthName = month.split("_")[0]; // Extracting the month part from the key (e.g., "Feb")

        // Display the toaster message
        toastr.error(
          `Monthly breakup for ${monthName} month should have value`
        );
        exitFunction = true; // Set the flag to exit
        return false; // Exit the loop
      }
    }

    // Calculate the sum of all months
    if (monthsObject && monthsObject.MONTHS) {
      // Ensure MONTHS exists
      monthly_breakupSum = Object.values(monthsObject.MONTHS)
        .map((value) => {
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
      toastr.options.timeOut = 2000; // 2s
      toastr.error(
        `The sum of monthly breakups (${monthly_breakupSum}) should be equal to the SOW amount (${updateSowAmount})`
      );
      exitFunction = true; // Set the flag to exit
      return false; // Exit the function
    }

    // If everything is fine, prepare the billing model data
    billing_model_data = {
      BILLING_MODEL: updateBillingType,
      MONTHS: monthsObject_month,
    };
    console.log("billing_model_data", billing_model_data);

    // Continue with further processing if needed
  } else {
    // If not "Fixed price", set "MONTHS" as an empty object
    billing_model_data = {
      BILLING_MODEL: updateBillingType,
      MONTHS: {},
    };
    console.log("billing_model_data", billing_model_data);

    // Continue with further processing if needed
  }

  if (updateSowAmount == "") {
    updateSowAmount = 0;
  }
  $.each(businessRuleData, function (i, busRule) {
    console.log("Bus - ", busRule.RULE_IDENTIFIER);
    if (busRule.RULE_IDENTIFIER == "SOW_NEW") {
      sowEditBusRule = busRule.RULE_DATA;
      console.log("sowEditBusRule - ", sowEditBusRule);
      $.each(sowEditBusRule, function (i, ruleData) {
        if (ruleData.WORKFLOW_ATTRIBUTE == "USER_ID") {
          let userAttrValue = ruleData.ATTRIBUTE_VALUE;
          let userAppr = ruleData.APPROVER;
          let userOpr = ruleData.OPERATION;
          console.log(
            "defaultBusHead - " + defaultBusHead + " empId - " + empId
          );
          console.log(
            "defaultFactHead - " + defaultFactHead + " empId - " + empId
          );
          if (defaultBusHead == empId) {
            // takeApprovalResponse = "Yes";
            // approverName.push("BU");
            UserIDheadFlag = true;
          }
          if (defaultFactHead == empId) {
            // takeApprovalResponse = "Yes";
            // approverName.push("BU");
            UserIDheadFlag = true;
          }
        }
        if (ruleData.WORKFLOW_ATTRIBUTE == "SOW_STAGE") {
          let sowAttrValue = ruleData.ATTRIBUTE_VALUE;
          let sowAppr = ruleData.APPROVER;
          let sowOpr = ruleData.OPERATION;
          console.log("sowAttrValue - ", sowAttrValue);
          $.each(sowAttrValue, function (i, sowAttr) {
            if (sowAttr == updateFunnel) {
              console.log("SOW Stage - " + updateFunnel);
              sowStageFlag = true;
            } else {
              console.log("SOW Else");
            }
          });
        }
      });
    }
  });
  // updateSowAmount = updateSowAmount.replace(/,/g, '');
  let tb = $("#billing_exp_div:eq(0) tbody");
  let size = tb.find("tr").length;
  console.log("Number of rows : " + size);
  let resCountUs = 0;
  let resCountInd = 0;
  let legStart = new Date(updateLegStart);
  let legEnd = new Date(updateLegEnd);
  let billStart = new Date(updateBillStart);
  let billEnd = new Date(updateBillEnd);
  let actualStart = new Date(updateActStart);
  let actualEnd = new Date(updateActEnd);
  console.log("updateProjAmount", updateProjAmount);
  const quillText = quill.getText().trim();
  let validation = true;

  // Check if proj amount is 0
  // if (updateSowAmount && updateProjAmount === 0) {
  //   // If updateSowAmount has a value and updateProjAmount is 0, show the toaster
  //   toastr.options.timeOut = 2000; // 2s timeout for the toaster
  //   toastr.error("Actual/Projected amount cannot be '0'");
  //   return false; // Optionally return false to prevent further actions
  // }
  if (updateAcc == "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select an account name");
    validation = false;
    return false;
  } else if (updateSow == "") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please enter the SOW name");
    validation = false;
    return false;
  } else if (updateFunnel == "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select the funnel stage");
    validation = false;
    return false;
  } else if (updateGrowthLeaderId == "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select the opportunity owner");
    validation = false;
    return false;
  } else if (updateLegStart == "0000-00-00") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Legal Start Date should not be empty");
    validation = false;
    return false;
  } else if (updateLegEnd == "0000-00-00") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Legal End Date should not be empty");
    validation = false;
    return false;
  } else if (updateBillStart == "0000-00-00") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Billing Start Date should not be empty");
    validation = false;
    return false;
  } else if (updateBillEnd == "0000-00-00") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Billing End Date should not be empty");
    validation = false;
    return false;
  } else if (updateActStart == "0000-00-00") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Actual Start Date should not be empty");
    validation = false;
    return false;
  } else if (updateActEnd == "0000-00-00") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Actual End Date should not be empty");
    validation = false;
    return false;
  } else if (legStart > legEnd) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Legal End Date should be after Legal Start Date");
    validation = false;
    return false;
  } else if (billStart > billEnd) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Billing End date should be after Billing Start date");
    validation = false;
    return false;
  } else if (actualStart > actualEnd) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Actual End date should be after Actual Start date");
    validation = false;
    return false;
  } else if (legStart < billStart) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error(
      "Billing Start date should be greater or equal to Legal Start date"
    );
    validation = false;
    return false;
  } else if (billStart < actualStart) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error(
      "Actual Start date should be greater or equal to Billing Start date"
    );
    validation = false;
    return false;
  } else if (legEnd < billEnd) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error(
      "Billing End date should be greater or equal to Legal End date"
    );
    validation = false;
    return false;
  } else if (billEnd < actualEnd) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error(
      "Actual End date should be greater or equal to Billing End date"
    );
    validation = false;
    return false;
  } else if (quillText.length == 0) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please add a note for the SOW");
    validation = false;
    return false;
  } else if (updateFunnel !== "Lead" && updateFunnel !== "Scout") {
    if (updateProb == "-1") {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Please select the probability");
      validation = false;
      return false;
    } else if (updateSowType == "-1") {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Please select the SOW type");
      validation = false;
      return false;
    } else if (updateBillingType == "-1") {
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Please select the billing type");
      validation = false;
      return false;
    }
  }

  // Validate NPS Stakeholder only if Buying Center is selected
  // if (updatebuyingCenter && updatebuyingCenter !== "-1" && updatebuyingCenter !== "add-new") {
  //   if (updatenpsStakeHolderID == "-1") {
  //     toastr.options.timeOut = 2000; // 2s
  //     toastr.error("Please select the Stakeholder");
  //     validation = false;
  //     return false;
  //   }
  // } 
  if (updatebuyingCenter == "-1" || updatebuyingCenter == "add-new" || updatebuyingCenter == "" || updatebuyingCenter == null || updatebuyingCenter == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select the Buying center");
    validation = false;
    return false;
  } else if (updatenpsStakeHolderID == "-1" || updatenpsStakeHolderID == "" || updatenpsStakeHolderID == null || updatenpsStakeHolderID == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select the Stakeholder");
    validation = false;
    return false;
  } 
  // else if (updateFunnel === "Signed" && ($("#nps_stakeholder_display").val() == null || $("#nps_stakeholder_display").val().length === 0)) {
  //   toastr.options.timeOut = 2000; // 2s
  //   toastr.error("Please select atleast one NPS stakeholder");
  //   validation = false;
  //   return false;
  // }
  else if (updateTeamSize < 0) {
    console.log("updateTeamSize", updateTeamSize);
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Team size should be 0 or more");
    validation = false;
    return false;
  }

  if (validation) {
    var table = $("#billing_exp_div tbody");

    if (updateBillStart == "0000-00-00") {
      updateBillStart = updateLegStart;
    }
    if (updateBillEnd == "0000-00-00") {
      updateBillEnd = updateLegEnd;
    }
    if (updateActStart == "0000-00-00") {
      updateActStart = updateBillStart;
    }
    if (updateActEnd == "0000-00-00") {
      updateActEnd = updateBillEnd;
    }

    table.find("tr").each(function (i) {
      let actualStartDate = convertDate($("#actual_start_date").val());
      let actualEndDate = convertDate($("#actual_end_date").val());
      let custom_others_text = $(`#other_text_${i + 1}`).val();
      // var $tds = $(this).find('td'),
      var $tds = $(this).find("td"),
        rResource = $tds.eq(0).text(),
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
          .val();
      if (rStartDate == "") {
        rStartDate = updateActStart;
      } else {
        rStartDate = convertDate(rStartDate);
      }
      if (rEndDate == "") {
        rEndDate = updateActEnd;
      } else {
        rEndDate = convertDate(rEndDate);
      }
      console.log('selectPerosna - ', selectPerosna);
      console.log('selectSkill - ', selectSkill);
      if (selectPerosna == "TBD" || selectPerosna == undefined || selectPerosna == null || selectPerosna == "") {
        toastr.error(
          "One of the Resource Expertise Persona is not selected, Please select Expertise Persona"
        )
        exitFunction = true; // Set the flag to exit
        return false; // Exit the loop
      }
      else if (selectPerosna === "Others" && (!custom_others_text || custom_others_text.trim() === "")) {
        toastr.error("Please specify the expertise persona when 'Others' is selected");
        exitFunction = true; // Set the flag to exit
        return false; // Exit the loop
      }
      else if (rCount <= 0) {
        toastr.error("Resource count should be greater than 0");
        exitFunction = true;
        return false;
      }
      // else if(selectSkill == undefined || selectSkill == null || selectSkill == ""){
      //   toastr.error(
      //     "One of the Resource Skill is not selected, Please select Skill"
      //   )
      //   exitFunction = true; // Set the flag to exit
      //   return false; // Exit the loop
      // }
      else if (!rLocation) {
        toastr.error(
          "One of the Resource location is not selected, Please select location"
        );
        exitFunction = true; // Set the flag to exit
        return false; // Exit the loop
      } else if (rStartDate == "") {
        toastr.error(
          "Start date is missing for one of the resources. Please select it."
        ); // Show the toaster error message
        exitFunction = true; // Set the flag to exit
        return false; // Exit the loop
      } else if (rEndDate == "") {
        toastr.error(
          "End date is missing for one of the resources. Please select it."
        );
        exitFunction = true; // Set the flag to exit
        return false; // Exit the loop
      } else if (new Date(rStartDate) < new Date(actualStartDate)) {
        toastr.options.timeOut = 2000;
        toastr.error(
          "Resource start date cannot be earlier than the actual start date"
        );
        exitFunction = true;
        return false;
      } else if (new Date(rEndDate) > new Date(actualEndDate)) {
        toastr.options.timeOut = 2000;
        toastr.error(
          "Resource end date cannot be later than the actual end date."
        );
        exitFunction = true;
        return false;
      }
      console.log("rStartDate", rStartDate);
      console.log("rEndDate", rEndDate);

      if (rCount) {
        rCount = parseInt(rCount, 10) || 0; // Convert rCount to integer
        if (rLocation == "India" || rLocation == "INDIA") {
          totalCountIndia += rCount; // Add to India total
        } else if (rLocation === "US") {
          totalCountUS += rCount; // Add to US total
        }
      }
      totalCount = totalCountIndia + totalCountUS;

      $("#new_team").val(totalCount);
      let getResVal = rResource.replace("Resource ", "");

      let rSkillsLevel = [];
      let usClassExist = $(".usClass").length;
      let indClassExist = $(".indClass").length;
      if (rLocation == "US") {
        rSkillsLevel = $("#us_res_persona_skill_" + getResVal).val();
        rPerosna = $("#us_res_persona_select_" + getResVal).val();
        resCountUs += parseInt(rCount, 10);
        let usRate = parseInt(rBillRate, 10);
        if (bill_us_default > usRate) {
          billRateFlag = true;
        }
      }
      if (rLocation == "India" || rLocation == "INDIA") {
        rSkillsLevel = $("#ind_res_persona_skill_" + getResVal).val();
        rPerosna = $("#ind_res_persona_select_" + getResVal).val();
        resCountInd += parseInt(rCount, 10);
        let indRate = parseInt(rBillRate, 10);
        if (bill_ind_default > indRate) {
          billRateFlag = true;
        }
      }

      if (rPerosna == undefined) {
        rSkillsLevel = $("#persona_skill_" + getResVal).val();
        rPerosna = $("#persona_select_" + getResVal).val();
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
      if (updateBillingType === "Fixed Price") {
        rBillRate = 0;
      }
      if (rCount != "0") {
        resUpdateData =
          resUpdateData +
          '{ "RESOURCE_GROUP" : "' +
          rResource +
          '", "SKILLS_PERSONA":"' +
          rPerosna +
          '","OTHER_PERSONA":"' +
          (rPerosna == 'Others' ? custom_others_text : '') +
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
      }
    });

    if (resUpdateData.endsWith(",")) {
      resUpdateData = resUpdateData.slice(0, -1);
    }
    console.log("resUpdateData", resUpdateData);

    updateTeamSize = $("#new_team").val();

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
    console.log("billing_model_data", billing_model_data);

    let sow_new_data =
      '{ "ACCOUNT_NAME" : "' +
      escapeHtml(updateAcc) +
      '", "SOW_NAME":"' +
      escapeHtml(updateSow) +
      '", "BUYING_CENTRE":"' +
      updatebuyingCenter +
      '", "SOW_STATUS":"' +
      updateFunnel +
      '", "NPS_STAKEHOLDER_ID":"' +
      updatenpsStakeHolderID +
      '", "NPS_STAKEHOLDER":"' +
      updatenpsStakeHolder +
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
      '", "PROBABILITY":"' +
      updateProb +
      '", "OPPORTUNITY_OWNER_ID":"' +
      updateGrowthLeaderId +
      '", "OPPORTUNITY_NAME":"' +
      updateGrowthLeaderName +
      '", "TOTAL_NUMBER_OF_RESOURCE":"' +
      updateTeamSize +
      '", "NUMBER_OF_RESOURCE_US":"' +
      totalCountUS +
      '", "NUMBER_OF_RESOURCE_IND":"' +
      totalCountIndia +
      '", "BILLING_MODEL_DATA":' + // Fix here (removed extra quotes)
      JSON.stringify(billing_model_data) +
      "," +
      '"SOW_AMOUNT_USER_EDIT":"' +
      sow_amount_user_edit +
      '", "CREATED_USER":"' +
      createdByOwnerName +
      '", "CREATED_USER_ID":"' +
      createdByOwnerId +
      '", "SOW_AMOUNT":' +
      parseInt(updateSowAmount, 10) +
      ', "PROJ_AMOUNT":' +
      updateProjAmount +
      ', "SOW_TYPE":"' +
      updateSowType +
      '"}';

    console.log(sow_new_data);

    let commentsEntered = $("#sow_user_comments").val();
    let formattedDate = formatDate(currentDate);

    let commentData = "";
    // if(commentsEntered == ''){
    //   commentData = ''
    // }else{
    //   commentData = '{ "COMMENTS" : "' +
    //     escapeHtml(commentsEntered) +
    //     '", "COMMENTED_BY":"' +
    //     empName +
    //     '", "COMMENTED_BY_ID":"' +
    //     empId +
    //     '", "COMMENTED_ON":"' +
    //     formattedDate +
    //     '"}';
    // }
    if (UserIDheadFlag == false) {
      if (sowStageFlag == true) {
        // takeApprovalResponse = "Yes";
        // approverName.push("BU");
        takeApprovalResponse = "Yes";
        approverName.push("Business head");
        if (billRateFlag == true) {
          takeApprovalResponse = "Yes";
          approverName.push("Finance head");
        }
      }
      // if(sowAmtFlag == true){
      //   takeApprovalResponse = "Yes";
      //   approverName.push("FH");
      // }
    }
    console.log("approverName - ", approverName);
    // let approvalResp = "Yes";
    // let approvalHead = "BU"
    let approvalData =
      '{ "TAKE_APPROVAL" : "' +
      takeApprovalResponse +
      '", "APPROVER": "' +
      approverName +
      '"}';
    console.log("sow_new_data - ", sow_new_data);
    let messages = [];

    // Define messages directly in typeOfData
    const typeOfData = {
      ACCOUNT_NAME: `SOW created under ${updateAcc} account`,
      SOW_NAME: `SOW Name created as ${updateSow}`,
      SOW_STATUS: `Funnel Stage selected as ${updateFunnel}`,
      SOW_TYPE: `SOW Type selected as ${updateSowType == '-1' ? '-' : updateSowType}`,
      PROBABILITY: `Probability set as ${updateProb == '-1' ? 'N/A' : updateProb}`,
      BILLING_START_DATE: `Billing Start Date selected as ${updateBillStart}`,
      BILLING_END_DATE: `Billing End Date selected as ${updateBillEnd}`,
      BILLING_MODEL: `Billing Type selected as ${updateBillingType == '-1' ? '-' : updateBillingType}`,
      SOW_AMOUNT: `SOW Amount set as $${Math.round(updateSowAmount).toLocaleString()}`,
      OPPORTUNITY_OWNER: `Opportunity Owner selected as ${updateGrowthLeaderName}`,
      LEGAL_START_DATE: `Legal Start Date selected as ${updateLegStart}`,
      LEGAL_END_DATE: `Legal End Date selected as ${updateLegEnd}`,
      ACTUAL_START_DATE: `Actual Start Date selected as ${updateActStart}`,
      ACTUAL_END_DATE: `Actual End Date selected as ${updateActEnd}`,
      BUYING_CENTRE: `Buying Centre selected as ${updatebuyingCenter === '' || updatebuyingCenter === '-1' || updatebuyingCenter === undefined
          ? '-'
          : updatebuyingCenterName
        }`,
      NPS_STAKEHOLDER: `Stakeholder selected as ${updatenpsStakeHolderID === '' || updatenpsStakeHolderID === '-1' || updatenpsStakeHolderID === undefined
          ? '-'
          : updatenpsStakeHolder
        }`,
      NPS_STAKEHOLDER_DISPLAY: `NPS Stakeholder selected as ${npsStakeholderData.length > 0
          ? npsStakeholderData.map(s => s.stakeholder_name).join(', ')
          : '-'
        }`,
      TOTAL_NUMBER_OF_RESOURCE: `Team Size set as ${updateTeamSize}`,
      // PERSONA_SELECTED : `Persona Selected as `,
      // OTHER_PERSONA_SELECTED : `Persona Selected as others`
    };

    // Keys that should have MESSAGE_FLAG set to "N"
    const messageFlagN = [
      "ACCOUNT_NAME",
      "SOW_NAME",
      "SOW_TYPE",
      "LEGAL_START_DATE",
      "LEGAL_END_DATE",
      "ACTUAL_START_DATE",
      "ACTUAL_END_DATE",
      "BILLING_MODEL",
      "OPPORTUNITY_OWNER",
      "BUYING_CENTRE",
      "NPS_STAKEHOLDER",
      "NPS_STAKEHOLDER_DISPLAY",
      "TOTAL_NUMBER_OF_RESOURCE",
      "NOTES",
      "PERSONA_SELECTED",
      "OTHER_PERSONA_SELECTED"
    ];

    $("[id^='persona_select_']").each(function (index) {
      const selectId = $(this).attr("id"); // e.g., persona_select_1
      const size = selectId.split("_").pop(); // Extract 1 from persona_select_1
      const selectedVal = $(this).val();
      const otherVal = $(`#other_text_${index + 1}`).val();

      if (selectedVal === "Others" && otherVal) {
        typeOfData['OTHER_PERSONA_SELECTED'] = `Persona selected as others - ${otherVal}`;
      } else if (selectedVal && selectedVal !== "TBD") {
        typeOfData['PERSONA_SELECTED'] = `Persona selected as ${selectedVal}`;
      }
    });

    // Loop through the keys in typeOfData to generate the messages
    Object.keys(typeOfData).forEach((key) => {
      messages.push({
        MESSAGE_FLAG: messageFlagN.includes(key) ? "N" : "Y",
        MESSAGE: typeOfData[key], // Directly use the message from typeOfData
        TYPE_OF: key,
      });
    });

    console.log("Messages:", messages);
    // const quillText = quill.getText().trim();
    // if (quillText.length > 0) {
    //   messages.push(`New Note has been added.`);

    // }
    // Handle NOTES

    if (updateSowAmount != updateProjAmount) {
      messages.push({
        MESSAGE_FLAG: "N",
        MESSAGE: `Projected Amount set as $${(updateProjAmount || 0).toLocaleString()}.`,
        TYPE_OF: "PROJ_AMOUNT",
      });
    }

    if (quillText.length > 0) {
      messages.push({
        MESSAGE_FLAG: "N",
        MESSAGE: `New Note has been added.`,
        TYPE_OF: "NOTES",
      });
    }

    let ResourceAuditMessages = prepareAuditMessagesForCreate(resUpdateData);
    console.log("ResourceAuditMessages - ", ResourceAuditMessages);
    if (ResourceAuditMessages.length > 0) {
      messages.push({
        MESSAGE_FLAG: "N",
        MESSAGE: ResourceAuditMessages.join('; <br>') + ".",
        TYPE_OF: "RESOURCE_DEMAND_DATA",
      });
    }
    // let messages_audit = messages.map((msg) => ({
    //   MESSAGE_FLAG: "Y",
    //   MESSAGE: msg,
    // }));

    console.log(JSON.stringify(messages, null, 4));

    createSowData = {
      query_type: "append_sow_new_UI",
      environment: apiValue.environment,
      user_details: "[" + accessDetails + "]",
      APPROVAL_DATA: "[" + approvalData + "]",
      sow_skills_bill_data: "[" + resUpdateData + "]",
      sow_data: "[" + sow_new_data + "]",
      comments: engagementNoteData ? "[]" : "[" + JSON.stringify(notesObject) + "]",
      engagement_note: engagementNoteData,
      messages: JSON.stringify(messages),
      nps_stakeholder_data : JSON.stringify(npsStakeholderData),
    };
    console.log("createSowData - ", createSowData);
    if (exitFunction) {
      return;
    }

    // showCustomAlert();
    onYesClick();
    let apiURL = apiValue.url.replace("/app", "/append_sow_new_UI");
    const startTime = performance.now();
  }
}

function prepareAuditMessagesForCreate(newResources) {
  console.log("Starting audit message preparation for create...");
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
  let billingType = $("#billing_options option:selected").val();
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

  const newResourcesArray = parseResources(newResources);
  console.log("Parsed newResourcesArray:", newResourcesArray);

  // Process each new resource
  newResourcesArray.forEach((newResource, index) => {
    console.log(`Processing new resource at index ${index}:`, newResource);
    if (!newResource || !newResource.RESOURCE_GROUP) {
      console.log(`Skipping invalid new resource at index ${index}`);
      return;
    }

    // Generate message for each new resource
    const msg = formatNewResourceMessage(newResource, FIELD_DISPLAY_NAMES, billingType);
    console.log(`New resource detected at index ${index}, adding message:`, msg);
    messages.push(msg);
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

function onYesClick() {
  console.log("Creating SOW Data...");
  // closeCustomAlert();
  let apiURL = apiValue.url.replace("/app", "/append_sow_figma_UI");
  const startTime = performance.now();
  $.ajax({
    url: apiURL,
    // url: "https://rre-api.factspanapps.com:5000/app",
    type: "POST",

    dataType: "json",
    crossDomain: true,
    format: "json",
    data: JSON.stringify(createSowData),
    success: function (json) {
      console.log("json - ", json);
      closeCustomAlert();
      if (json.Message == undefined) {
        toastr.options.timeOut = 2000; // 2s
        toastr.error(json);
      } else {
        if (json.Message == "SOW name already in use. Please enter a unique name") {
          toastr.options.timeOut = 2000; // 2s
          toastr.error("SOW name already in use. Please enter a unique name");
        } else if (json.Message == "Success") {
          const endTime = performance.now();
          const loadTimeInSeconds = (endTime - startTime) / 1000;
          getApiTime(
            loadTimeInSeconds,
            "SowCreate",
            "Revenue",
            "append_sow_new_UI",
            "success",
            fileName,
            "SowCreate",
            "edit"
          );
          toastr.options.timeOut = 2000; // 2s
          toastr.success("SOW Created successfully");

          // Check specific responses for redirect logic
          if (
            json.Response ===
            "Updated successfully, Sent for approval & Approver notified" ||
            json.Response ===
            "Updated successfully, Sent for approval & Approver notification failed"
          ) {
            setTimeout(function () {
              window.location.href = "workflowDetails.html";
            }, 2000);
          } else {
            // Check if `json.Data` exists before redirection
            if (json.Data && json.Data.length > 0) {
              const tempArr = json.Data[0]; // Get the first object in the Data array
              const uniqId_sowid = tempArr.UNIQUE_ID + "&" + tempArr.SOW_ID; // Concatenate UNIQUE_ID and SOW_ID
              const searchParams = new URLSearchParams(window.location.search);
              if (searchParams.get('from') === 'notesLog') {
                  let targetOpener = window.opener;
                  // If we came from accountCreation.html, its opener is notesLogEngagement.html
                  if (targetOpener && targetOpener.opener && targetOpener.location.href.includes("accountCreation")) {
                      targetOpener = targetOpener.opener;
                  }
                  
                  if (targetOpener && typeof targetOpener.toRefreshBuyingCenterDropdown === 'function') {
                      // For SOW, the new option is SOW_NAME, we pass it as the first arg.
                      targetOpener.toRefreshBuyingCenterDropdown(tempArr.SOW_NAME, '', tempArr.ACCOUNT_NAME);
                  }
                  window.close();
              } else {
                  // localStorage.setItem("urlStoredSOWUrldata", uniqId_sowid); // Store in localStorage
                  // localStorage.setItem("sow-click-source", null);

                  let createdSowData = json.Data;
                  console.log("createdSowData ------- ", createdSowData);

                  // localStorage.setItem(
                  //   "sow-acc-data",
                  //   JSON.stringify(createdSowData)
                  // );
                  setTimeout(function () {
                    window.location.href = `sow.html?${uniqId_sowid}`;
                  }, 2000);
              }
            }
          }

          // window.location.href = 'revenueDetails.html';
        } else {
          const endTime = performance.now();
          const loadTimeInSeconds = (endTime - startTime) / 1000;
          getApiTime(
            loadTimeInSeconds,
            "SowCreate",
            "Revenue",
            "append_sow_new_UI",
            "error",
            fileName,
            "SowCreate",
            "edit"
          );
          toastr.options.timeOut = 2000; // 2s
          toastr.error(json.Message);
        }
      }
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(
        loadTimeInSeconds,
        "SowCreate",
        "Revenue",
        "append_sow_new_UI",
        "error",
        fileName,
        "SowCreate",
        "edit"
      );
      console.log("message Error" + error);
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Message error" + JSON.stringify(error));
      closeCustomAlert();
    },
  });

  // Define the "Audit Log" tab content
  //   const auditTab = {
  //     name: "Audit Log",
  //     content: `
  //       <div class="audit-log">
  //         <ul id="audit-log-list" class="audit-list">
  //           <li>
  //             <i class="fa-solid fa-circle-dot"></i>
  //             <span class="audit-item">
  //               <strong>Legal Start Date selected as 10/15/24. Legal End Date selected as 10/15/24.</strong>
  //               <span class="audit-details">Vinod Kumar, 01/06/24 11:40 AM (3 months ago)</span>
  //             </span>
  //           </li>
  //           <li>
  //             <i class="fa-solid fa-circle-dot"></i>
  //             <span class="audit-item">
  //               <strong>SOW created under Amazon account.</strong>
  //               <span class="audit-details">Vinod Kumar, 01/06/24 11:40 AM (3 months ago)</span>
  //             </span>
  //           </li>
  //           <li>
  //             <i class="fa-solid fa-circle-dot"></i>
  //             <span class="audit-item">
  //               <strong>New Note has been added.</strong>
  //               <span class="audit-details">Vinod Kumar, 01/06/24 11:40 AM (3 months ago)</span>
  //             </span>
  //           </li>
  //           <li>
  //             <i class="fa-solid fa-circle-dot"></i>
  //             <span class="audit-item">
  //               <strong>Funnel Stage selected as Lead.</strong>
  //               <span class="audit-details">Vinod Kumar, 01/06/24 11:40 AM (3 months ago)</span>
  //             </span>
  //           </li>
  //           <li>
  //             <i class="fa-solid fa-circle-dot"></i>
  //             <span class="audit-item">
  //               <strong>Opportunity Owner selected as Shashank Kagwad.</strong>
  //               <span class="audit-details">Vinod Kumar, 01/06/24 11:40 AM (3 months ago)</span>
  //             </span>
  //           </li>
  //         </ul>
  //       </div>
  //     `,
  //   };

  //   // Check if "Audit Log" tab already exists
  //   const auditTabExists = tabs.some((tab) => tab.name === "Audit Log");
  //   if (!auditTabExists) {
  //     tabs.push(auditTab);
  //     console.log("Audit Log tab added");
  //   }

  //   // Save the current Quill content back into the "Notes" tab
  //   const notesTabIndex = tabs.findIndex((tab) => tab.name === "Notes");
  //   if (notesTabIndex !== -1) {
  //     const quillContent = quill.root.innerHTML; // Get Quill's HTML content
  //     tabs[notesTabIndex].content = `
  //       <div id="editor-container">
  //         <div id="editor">${quillContent}</div>
  //         <span id="charLimitWarning" style="color: red; display: none;">Character limit reached!</span>
  //       </div>
  //     `;
  //   }

  //   // Recreate all tabs with updated content
  //   recreateTabs();

  //   // Set the "Audit Log" tab as active
  //   setActiveTab("Audit Log");
  //   const inputs = document.querySelectorAll("input, select, textarea");
  //   inputs.forEach((input) => {
  //     input.disabled = true; // Disable the field
  //   });

  //   console.log("All input fields are now disabled.");
  // }

  // // Function to set the active tab
  // function setActiveTab(tabName) {
  //   const tabButtonsContainer = document.getElementById("tab-buttons");
  //   const tabContentContainer = document.getElementById("tab-content-container");

  //   // Find the index of the tab by name
  //   const tabIndex = tabs.findIndex((tab) => tab.name === tabName);
  //   if (tabIndex !== -1) {
  //     // Activate the corresponding tab button
  //     const tabButtons = tabButtonsContainer.querySelectorAll(".tab-button");
  //     tabButtons.forEach((button, index) => {
  //       button.classList.toggle("active", index === tabIndex);
  //     });

  //     // Display the corresponding tab content
  //     const tabContents = tabContentContainer.querySelectorAll(".tab-content");
  //     tabContents.forEach((content, index) => {
  //       content.style.display = index === tabIndex ? "block" : "none";
  //     });
  //   }
  // }

  // // Function to recreate tabs
  // function recreateTabs() {
  //   const tabButtonsContainer = document.getElementById("tab-buttons");
  //   const tabContentContainer = document.getElementById("tab-content-container");

  //   // Clear existing tabs
  //   tabButtonsContainer.innerHTML = "";
  //   tabContentContainer.innerHTML = "";

  //   // Recreate each tab
  //   tabs.forEach((tab, index) => {
  //     // Create tab button
  //     const tabButton = document.createElement("button");
  //     tabButton.className = "tab-button";
  //     tabButton.textContent = tab.name;
  //     tabButton.onclick = () => switchTab(index);

  //     // Append tab button
  //     tabButtonsContainer.appendChild(tabButton);

  //     // Create tab content
  //     const tabContent = document.createElement("div");
  //     tabContent.className = "tab-content";
  //     tabContent.innerHTML = tab.content;
  //     tabContent.style.display = index === 0 ? "block" : "none";

  //     // Append tab content
  //     tabContentContainer.appendChild(tabContent);
  //   });

  //   // Reinitialize Quill for the Notes tab
  //   const notesTabIndex = tabs.findIndex((tab) => tab.name === "Notes");
  //   if (notesTabIndex !== -1) {
  //     initializeQuill(tabs[notesTabIndex].content);
  //   }
}
function cancelNewSow() {
  console.log("cancel has been clicked");

  setTimeout(function () {
    window.location.href = "revenueDetails.html";
  }, 2000);
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
function NPSChange(event) {
  const buyingCenter = $("#buying_center option:selected").val();

  if (!buyingCenter || buyingCenter.trim() === "" || buyingCenter === "-1") {
    toastr.error("Please select Buying Center First.");
  }
}

// Debug function to test NPS dropdown population
function debugNPSDropdown() {
  console.log("=== DEBUG NPS DROPDOWN ===");
  console.log("Buying center element exists:", $("#buying_center").length);
  console.log("NPS stakeholder element exists:", $("#nps_stakeholder").length);
  console.log("Buying center value:", $("#buying_center").val());
  console.log("Buying center options:", $("#buying_center option").length);
  console.log("NPS stakeholder options:", $("#nps_stakeholder option").length);
  console.log("buyingCenterNps data:", buyingCenterNps);
  console.log("defaultAccId:", defaultAccId);

  // Test the updateStakeholderDropdown function directly
  const testBuyingCenter = $("#buying_center").val();
  if (testBuyingCenter && testBuyingCenter !== "-1") {
    console.log("Testing updateStakeholderDropdown with:", testBuyingCenter);
    updateStakeholderDropdown(testBuyingCenter);
  } else {
    console.log("No valid buying center selected for testing");
  }
  console.log("=== END DEBUG ===");
}
function BuyingCenterChange(event) {
  console.log("=== BUYING CENTER CHANGE FUNCTION CALLED ===");
  console.log("Event:", event);
  console.log("Event type:", event ? event.type : "No event");

  // Get the selected account name
  const accountName = $("#account_options option:selected").val();
  console.log("Selected account name:", accountName);

  if (!accountName || accountName.trim() === "" || accountName === "-1") {
    toastr.error("Please select an account name first.");
    return false;
  }

  // Get the selected buying center
  const selectedBuyingCenter = $("#buying_center option:selected").val();
  console.log("Selected buying center:", selectedBuyingCenter);

  // If a valid buying center is selected, update the NPS stakeholder dropdown
  if (selectedBuyingCenter && selectedBuyingCenter !== "-1" && selectedBuyingCenter !== "add-new") {
    console.log("Valid buying center selected, updating NPS stakeholder dropdown...");
    updateStakeholderDropdown(selectedBuyingCenter);
  } else {
    console.log("No valid buying center selected or 'add-new' selected");
  }

  console.log("=== END BUYING CENTER CHANGE FUNCTION ===");
  return true;
}
function saveBuyingNPS(buyingCenterNPS, newNPSStakeholder, buyingNPSList) {
  console.log("buyingNPSList", buyingNPSList);
  let empId = localStorage.getItem("EmpUserID");
  let empName = localStorage.getItem("EmpUserName");
  let emp_email = localStorage.getItem("email");

  let accessDetails =
    '{ "EMAIL_ID":"' +
    emp_email +
    '", "USERNAME":"' +
    empName +
    '", "USER_ID":"' +
    empId +
    '"}';

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
      closeCustomAlert();

      // Check if the response contains "Message" and it is "Success"
      if (json.Message === "Success") {
        // If the message is Success, perform the actions
        let message = json.Response; // Optionally store the response message

        // Show a success toastr message
        toastr.options.timeOut = 2000; // 2s
        toastr.success("Buying Center and Stakeholder added successfully!");

        // Log the new values for debugging
        console.log("New Buying Center:", buyingCenterNPS);
        console.log("New NPS StakeHolder:", newNPSStakeholder);

        // Close the popup
        $("#add-new-popup").remove();
        $(".main-content").removeClass("blurred-background");

        // Refresh the buying center dropdown with the new data and select the newly created option
        refreshBuyingCenterAfterCreation(buyingCenterNPS, newNPSStakeholder);
      } else {
        // If the message is not "Success", show an error message
        toastr.options.timeOut = 2000; // 2s
        toastr.error(json.Message || "Error occurred while saving.");
      }
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(
        loadTimeInSeconds,
        "SowCreate",
        "Revenue",
        "append_sow_new_UI",
        "error",
        fileName,
        "SowCreate",
        "edit"
      );

      console.log("message Error" + error);
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Message error" + JSON.stringify(error));
      closeCustomAlert();
    },
  });
}
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
        activateMonthlyBreakupTab();
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
    activateMonthlyBreakupTab();

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
      if (text === "billing rate($)" || text === "amount") {
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

// Function to format input value with commas
function formatNumberInput(input) {
  let rawValue = input.value.replace(/,/g, "");

  if (rawValue === "" || isNaN(rawValue)) return;

  let formattedValue = new Intl.NumberFormat("en-US").format(Number(rawValue));

  input.value = formattedValue;
}

// Function to format input value with commas
function formatNumberInput(input) {
  let rawValue = input.value.replace(/,/g, "");

  if (rawValue === "" || isNaN(rawValue)) return;

  let formattedValue = new Intl.NumberFormat("en-US").format(Number(rawValue));

  input.value = formattedValue;
}

function removeMonthlyBreakupTab() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // Check if tab content and tab button exist
  const tabIndex = Array.from(tabButtons).findIndex(
    (tab) => tab.textContent === "Monthly Breakup"
  );

  if (tabIndex !== -1) {
    // Hide the "Monthly Breakup" tab button
    tabButtons[tabIndex].style.display = "none";

    // Clear the content of the "Monthly Breakup" tab content
    tabContents[tabIndex].innerHTML = ""; // Clear the content
    switchTab(0);
    console.log("Monthly Breakup tab button and content removed.");
  }
}

function activateMonthlyBreakupTab() {
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

// function calculateMonthsDifference() {
//   const startDateStr = document.getElementById("billing_start_date").value;
//   const endDateStr = document.getElementById("billing_end_date").value;

//   if (!startDateStr || !endDateStr) {
//     return; // Do nothing if either date is empty
//   }

//   const startDate = new Date(startDateStr);
//   const endDate = new Date(endDateStr);

//   if (isNaN(startDate) || isNaN(endDate)) {
//     console.error("Invalid date format.");
//     return;
//   }

//   let monthsArray = [];

//   // Loop through each month between startDate and endDate
//   let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
//   let lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

//   while (current <= lastMonth) {
//     let formattedMonth = current.toLocaleString('en-US', { month: 'short', year: '2-digit' }).replace(" ", "-");
//     monthsArray.push(formattedMonth);

//     // Move to the next month
//     current.setMonth(current.getMonth() + 1);
//   }

//   console.log("Months List:", monthsArray.join(", "));

//   // Store in a variable if needed
//   let monthsString = monthsArray.join(", ");

//   // Update the "Monthly Breakup" tab if it exists
//   const monthlyBreakupTab = document.getElementById("monthlyBreakupDetails");
//   if (monthlyBreakupTab) {
//     monthlyBreakupTab.innerText = `Monthly Breakdown: ${monthsString}`;
//   }

//   return monthsString;
// }
function hideBillingRateAmountColumns() {
  let table = document.getElementById("billing_exp_div");
  if (!table) return;

  let headers = table.querySelectorAll("thead th");
  let columnIndexes = [];

  // Find the indices of "Billing Rate($)" and "Amount"
  headers.forEach((th, index) => {
    let text = th.textContent.trim().toLowerCase();
    if (text === "billing rate($)" || text === "amount") {
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
}

// Function to show the Billing Rate and Amount columns again
function showBillingRateAmountColumns() {
  let table = document.getElementById("billing_exp_div");
  if (!table) return;

  let headers = table.querySelectorAll("thead th");
  let columnIndexes = [];

  // Find the indices of "Billing Rate($)" and "Amount"
  headers.forEach((th, index) => {
    let text = th.textContent.trim().toLowerCase();
    if (text === "billing rate($)" || text === "amount") {
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
}

function viewEditBuyingCenter() {

  let accName = $("#account_options option:selected").val();
  if (!accName || accName.trim() === "" || accName === "-1") {
    toastr.error("Please select an account name first.");
  } else {
    window.open('buyingCenterDetails.html?accountName=' + encodeURIComponent(accName) + '&accountId=' + defaultAccId + '&action=view-edit', '_blank');
  }
}

function newBuyingCenter() {
  let accName = $("#account_options option:selected").val();
  if (!accName || accName.trim() === "" || accName === "-1") {
    toastr.error("Please select an account name first.");
  } else {
    window.open('buyingCenterDetails.html?accountName=' + encodeURIComponent(accName) + '&accountId=' + defaultAccId + '&action=new', '_blank');
  }
}

function accountNewBuyingCenter(accountName, accountId, buyingCenter, npsStakeholder, mode) {
  if (!accountName || accountName.trim() === "" || accountName === "-1") {
    toastr.error("Please select an account name first.");
    return null;
  } else {
    let url = 'buyingCenterDetails.html?accountName=' + encodeURIComponent(accountName) + '&accountId=' + accountId + '&action=new&buyingCenter=' + encodeURIComponent(buyingCenter) + '&npsStakeholder=' + encodeURIComponent(npsStakeholder) + '&from=accountCreation';
    if (mode === 'SOW') {
        url += '&mode=SOW';
    }
    return window.open(url, '_blank');
  }
}
