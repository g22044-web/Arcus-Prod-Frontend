var sowFullData = [];
let futureData = [];
let oldData = [];
let signedData = [];
let funnelStageDrop = [];
let sowTypeDrop = [],filterSelectedValues = [];
let expandedAccounts = new Set();

const getSowViewData = async () => {
  let funnelStages = new Set();
 

  const startTime = performance.now();
  let empId = localStorage.getItem('EmpUserID');
  let emp_email = localStorage.getItem('email');
  let emp_dep = localStorage.getItem('Department');
  let form_details = {
    query_type: "revenue_page",
    environment: apiValue.environment,
    emp_id: empId,
    mail_id: emp_email,
    department: emp_dep
  };
  let data = await fetch(apiValue.url.replace("/app", "/revenue_page"), {
    method: "POST",
    body: JSON.stringify(form_details),
  });
  const result = await data.json();
  const endTime = performance.now();
  const loadTimeInSeconds = (endTime - startTime) / 1000;
  const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
  const parts = pathname.split('/');
  const fileName = parts.pop();
  getApiTime(loadTimeInSeconds,"revenue","Revenue","revenue_page","success",fileName,"RevenuePage","view");
  // console.log("result", result.Details);
  sowFullData = result.Details;
  futureData = sowFullData.filter(function (item) {
    return item.SOW_PERIOD_STATUS != "OLD";
  });
  let minutesToAdd = 330;
  let currentYearStartTemp = new Date("2022-01-01");
  let currentYearEndTemp = new Date("2022-12-31");
  let currentYearStart = new Date(
    currentYearStartTemp.getTime() + minutesToAdd * 60000
  );
  let currentYearEnd = new Date(
    currentYearEndTemp.getTime() + minutesToAdd * 60000
  );
  sowFullData.forEach(account => {
    account.ACCOUNT_DATA.forEach(sow => {
        sow.SOW_TYPE_DATA.forEach(item => {
            if (item.SOW_STAGE) {
                funnelStages.add(item.SOW_STAGE);
            }
        });
    });
});
console.log("funnelStages",funnelStages);
const funnelStagesArray = Array.from(funnelStages);
const order = ["Lead", "Pre-Qualified", "Qualified", "Proposal", "Signed", "Renewal", "Lost", "Closed"];
const sortedFunnelStages = funnelStagesArray.sort((a, b) => {
    return order.indexOf(a) - order.indexOf(b);
});

// Preselected stages
const preselectedStages = ["Qualified", "Proposal", "Signed", "Renewal"];
const $funnelSelect = $('#funnelSelect');
$funnelSelect.empty();

// Add new options to the dropdown
sortedFunnelStages.forEach(stage => {
    const option = new Option(stage, stage);
    $funnelSelect.append(option);

    // Preselect specified stages
    if (preselectedStages.includes(stage)) {
        $(option).prop('selected', true);
    }
});

// Initialize the multiselect without onChange
$funnelSelect.multiselect({
    columns: 1,
    placeholder: 'Funnel Stage',
    search: true,
    selectAll: true,
    selectAllValue: 'Select-all',
    texts: {
        selectAll: 'Select all',
        selectedOptions: ' Selected'
    }
});

const updateFunnelSelectionCount = selectedValues => {
    $funnelSelect
        .siblings('.ms-options-wrap')
        .find('> button > span')
        .text(`${selectedValues.length} Selected`);
};

// Separate change event listener for handling selection updates
$funnelSelect.on('change', function() {
    const selectedValues = $funnelSelect.val() || [];
    console.log("selectedValues", selectedValues);
    filterSelectedValues = selectedValues;

    // Call statusCheck with selected values
    statusCheck(selectedValues);

    // Update display text for selected items
    updateFunnelSelectionCount(selectedValues);
});

// Initial setup to display preselected stages
const initialSelectedValues = $funnelSelect.val() || [];
updateFunnelSelectionCount(initialSelectedValues);

// Initial call to statusCheck with preselected values
statusCheck(preselectedStages);
$(".table-loading").hide();

};

// function getSowViewData() {
//   let apiURL = apiValue.url.replace("/app", "/revenue_page");
//   $.ajax({
//     url: apiURL,
//     type: "POST",
//     dataType: "json",
//     crossDomain: true,
//     format: "json",
//     async: false,
//     mode: 'no-cors',
//     data: JSON.stringify({
//       query_type: "revenue_page",
//       "environment": apiValue.environment
//     }),
//     success: function (data) {
//       sowFullData = data.Details;
//       futureData = sowFullData.filter(function (item) { return item.SOW_PERIOD_STATUS != "OLD"; });
//       let minutesToAdd = 330;
//       let currentYearStartTemp = new Date("2022-01-01");
//       let currentYearEndTemp = new Date("2022-12-31");
//       let currentYearStart = new Date(currentYearStartTemp.getTime() + minutesToAdd * 60000);
//       let currentYearEnd = new Date(currentYearEndTemp.getTime() + minutesToAdd * 60000);

//       $("#sign_data").prop('checked', true);
//       $("#proposal_data").prop('checked', true);
//       $("#qualified_data").prop('checked', true);
//       $("#renewal_data").prop('checked', true);
//       statusCheck();
//     },
//     error: function (error) {
//       console.log('message Error' + JSON.stringify(error));
//     }
//   });
// }
let currentFilterData = [];
let sortSowData = [];

function normalizeAccountKey(accountName) {
  return generateSafeId((accountName || "").replace(/\s+Total$/, "").trim());
}

function getAccountKeyFromRow(obj) {
  const row = $(obj).closest("tr");
  const classNames = (row.attr("class") || "").split(/\s+/);
  const matchedClass = classNames.find(
    (className) => className.endsWith("_expand") || className.endsWith("_collapse")
  );

  if (matchedClass) {
    return matchedClass.replace(/_(expand|collapse)$/, "");
  }

  return normalizeAccountKey(row.children("td:eq(0)").text());
}

function restoreExpandedAccounts() {
  expandedAccounts.forEach((accountKey) => {
    $("." + accountKey + "_expand").show();
    $("." + accountKey + "_collapse").hide();
  });
}

function createSowTableData(sowData,selectedValues) {
  console.log("selectedValues - " + selectedValues);
  sortSowData = sowData;
  let factspan_total = 0,
    factspanUsCan_tot = 0,
    factspanInd_tot = 0,
    factspanActual_tot = 0,
    factspanProjected_tot = 0;
  let factNetNewUSTot = 0,
    factNetNewINDTot = 0,
    factNetNewSowTot = 0,
    factNetNewActualTot = 0,
    factNetNewProjTot = 0;
  let factCurNewUSTot = 0,
    factCurNewINDTot = 0,
    factCurNewSowTot = 0,
    factCurNewActualTot = 0,
    factCurNewProjTot = 0;
  let factCurUSTot = 0,
    factCurINDTot = 0,
    factCurSowTot = 0,
    factCurActualTot = 0,
    factCurProjTot = 0;
  $("#sow_emp_details tbody").empty();
  let us_tot = 0,
    ind_fin_tot = 0,
    sow_tot = 0,
    actual_tot = 0,
    projected_tot = 0;
  $.each(sowData, function (i, sowDetails) {
    let accountNameHtml = `<td class="sow_empty_data_style noExl" rowspan="4" onClick="accountCollapse(this)">${sowDetails.ACCOUNT_NAME} <i class="fa fa-chevron-circle-down" aria-hidden="true"></i></td>`;
    let rownumber = 0;
    let accountName = sowDetails.ACCOUNT_NAME;
    let sow_acc_data = sowDetails.ACCOUNT_DATA;
    let row;
    let netNewArr = [],
      currentNew = [],
      current = [];
    let netUsCan = 0,
      netInd = 0,
      netSow = 0,
      netActual = 0,
      netProjected = 0;
    let curNewUsCan = 0,
      curNewInd = 0,
      curNewSow = 0,
      curNetActual = 0,
      curNetProjected = 0;
    let curUsCan = 0,
      curInd = 0,
      curSow = 0,
      curActual = 0,
      curProjected = 0;
    let usnetVal = 0,
      inNetVal = 0,
      sowNetVal = 0,
      actualNetVal = 0,
      projNetVal = 0;
    let usCurNetVal = 0,
      inCurNetVal = 0,
      sowCurNetVal = 0,
      actualCurNetVal = 0,
      projCurNetVal = 0;
    let usCurVal = 0,
      indCurVal = 0,
      sowCurVal = 0,
      actualCurVal = 0,
      projCurVal = 0;
    let filterSOWAmtStatus = false;
    $.each(sow_acc_data, function (j, accSowDetails) {
      let uscan_tot = 0,
        ind_tot = 0,
        sow_amout_tot = 0,
        sow_actual_tot = 0,
        sow_projected_tot = 0;

        if (selectedValues.includes("Lead")) {
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Lead_sum_US);
          ind_tot += parseInt(accSowDetails.Lead_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Lead_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Lead_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Lead_sum_amount_PROJECTED);
      }
      if (selectedValues.includes("Qualified")) {
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Qualified_sum_US);
          ind_tot += parseInt(accSowDetails.Qualified_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Qualified_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Qualified_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Qualified_sum_amount_PROJECTED);
      }
      if (selectedValues.includes("Proposal")) {
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Proposal_sum_US);
          ind_tot += parseInt(accSowDetails.Proposal_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Proposal_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Proposal_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Proposal_sum_amount_PROJECTED);
      }
      if (selectedValues.includes("Signed")) {
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Signed_sum_US);
          ind_tot += parseInt(accSowDetails.Signed_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Signed_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Signed_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Signed_sum_amount_PROJECTED);
      }
      if (selectedValues.includes("Pre-Qualified")) {
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Pre_Qualified_sum_US);
          ind_tot += parseInt(accSowDetails.Pre_Qualified_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Pre_Qualified_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Pre_Qualified_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Pre_Qualified_sum_amount_PROJECTED);
      }
      if (selectedValues.includes("Renewal")) {
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Renewal_sum_US);
          ind_tot += parseInt(accSowDetails.Renewal_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Renewal_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Renewal_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Renewal_sum_amount_PROJECTED);
      }
      if (selectedValues.includes("Lost")) {
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Lost_sum_US);
          ind_tot += parseInt(accSowDetails.Lost_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Lost_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Lost_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Lost_sum_amount_PROJECTED);
      }
      if (filterSOWAmtStatus == false) {
        uscan_tot += parseInt(accSowDetails.Lead_sum_US);
        ind_tot += parseInt(accSowDetails.Lead_sum_Ind);
        sow_amout_tot += parseInt(accSowDetails.Lead_sum_amount);
        sow_actual_tot += parseInt(accSowDetails.Lead_sum_amount_ACTUAL);
        sow_projected_tot += parseInt(accSowDetails.Lead_sum_amount_PROJECTED);

        uscan_tot += parseInt(accSowDetails.Qualified_sum_US);
        ind_tot += parseInt(accSowDetails.Qualified_sum_Ind);
        sow_amout_tot += parseInt(accSowDetails.Qualified_sum_amount);
        sow_actual_tot += parseInt(accSowDetails.Qualified_sum_amount_ACTUAL);
        sow_projected_tot += parseInt(
          accSowDetails.Qualified_sum_amount_PROJECTED
        );

        uscan_tot += parseInt(accSowDetails.Proposal_sum_US);
        ind_tot += parseInt(accSowDetails.Proposal_sum_Ind);
        sow_amout_tot += parseInt(accSowDetails.Proposal_sum_amount);
        sow_actual_tot += parseInt(accSowDetails.Proposal_sum_amount_ACTUAL);
        sow_projected_tot += parseInt(
          accSowDetails.Proposal_sum_amount_PROJECTED
        );

        uscan_tot += parseInt(accSowDetails.Signed_sum_US);
        ind_tot += parseInt(accSowDetails.Signed_sum_Ind);
        sow_amout_tot += parseInt(accSowDetails.Signed_sum_amount);
        sow_actual_tot += parseInt(accSowDetails.Signed_sum_amount_ACTUAL);
        sow_projected_tot += parseInt(
          accSowDetails.Signed_sum_amount_PROJECTED
        );

        uscan_tot += parseInt(accSowDetails.Pre_Qualified_sum_US);
        ind_tot += parseInt(accSowDetails.Pre_Qualified_sum_Ind);
        sow_amout_tot += parseInt(accSowDetails.Pre_Qualified_sum_amount);
        sow_actual_tot += parseInt(
          accSowDetails.Pre_Qualified_sum_amount_ACTUAL
        );
        sow_projected_tot += parseInt(
          accSowDetails.Pre_Qualified_sum_amount_PROJECTED
        );

        uscan_tot += parseInt(accSowDetails.Renewal_sum_US);
        ind_tot += parseInt(accSowDetails.Renewal_sum_Ind);
        sow_amout_tot += parseInt(accSowDetails.Renewal_sum_amount);
        sow_actual_tot += parseInt(accSowDetails.Renewal_sum_amount_ACTUAL);
        sow_projected_tot += parseInt(
          accSowDetails.Renewal_sum_amount_PROJECTED
        );

        uscan_tot += parseInt(accSowDetails.Lost_sum_US);
        ind_tot += parseInt(accSowDetails.Lost_sum_Ind);
        sow_amout_tot += parseInt(accSowDetails.Lost_sum_amount);
        sow_actual_tot += parseInt(accSowDetails.Lost_sum_amount_ACTUAL);
        sow_projected_tot += parseInt(accSowDetails.Lost_sum_amount_PROJECTED);
      }
      factspan_total += sow_amout_tot;
      factspanActual_tot += sow_actual_tot;
      factspanProjected_tot += sow_projected_tot;
      let res_id = "";
      let sow_name_id = "";
      if (accSowDetails.SOW_TYPE == "Net New") {
        netNewArr = accSowDetails.SOW_TYPE_DATA;
        res_id = "net_new";
      } else if (accSowDetails.SOW_TYPE == "Current - New") {
        currentNew = accSowDetails.SOW_TYPE_DATA;
        res_id = "current_new";
      } else if (accSowDetails.SOW_TYPE == "Current") {
        current = accSowDetails.SOW_TYPE_DATA;
        res_id = "current";
      }

      if (accSowDetails.SOW_TYPE == "Net New") {
        // sow_name_id = generateSafeId(accountName)/ /g, "_");
        sow_name_id = generateSafeId(accountName);
      }
      let sow_type_class = accSowDetails.SOW_TYPE;
      sow_type_class = sow_type_class.toString().replace(/ /g, "_");
      sow_type_class = sow_type_class.toLowerCase();

      row = `<tr class="${generateSafeId(accountName)}_collapse noExl" id="${sow_name_id}">
                      ${rownumber == 0 ? accountNameHtml : ""}
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_type_style">${
                        accSowDetails.SOW_TYPE
                      }</div></td>
                      <td class="hide_column"><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_type_style uscan_amt_${sow_type_class}_${i}" id="us_res_${generateSafeId(accountName)}_${sow_type_class}_${i}">${uscan_tot}</div></td>
                      <td><div class="sow_type_style ind_amt_${sow_type_class}_${i}" id="ind_res_${generateSafeId(accountName)}_${sow_type_class}_${i}">${ind_tot}</div></td>
                      <td><div class="sow_type_style sow_amt_${sow_type_class}_${i}">$${sow_amout_tot.toLocaleString()}</div></td>
                      <td class="active_sow_amount"><div class="sow_type_style actual_amt_${sow_type_class}_${i}">$${sow_actual_tot.toLocaleString()}</div></td>
                      <td class="active_sow_amount"><div class="sow_type_style proj_amt_${sow_type_class}_${i}">$${sow_projected_tot.toLocaleString()}</div></td>
                    </tr>`;
      $("#sow_emp_details").append(row);
      us_tot += uscan_tot;
      ind_fin_tot += ind_tot;
      sow_tot += sow_amout_tot;
      actual_tot += sow_actual_tot;
      projected_tot += sow_projected_tot;
      rownumber++;
      //Net New calculation of Total
      usnetVal = parseInt($(".uscan_amt_net_new_" + i).html(), 10);
      inNetVal = parseInt($(".ind_amt_net_new_" + i).html(), 10);
      let sowNetTemp = $(".sow_amt_net_new_" + i).html();
      if (sowNetTemp != undefined)
        sowNetTemp = sowNetTemp.replace(/[\,$]/g, "");
      sowNetVal = parseInt(sowNetTemp, 10);
      let actNetTemp = $(".actual_amt_net_new_" + i).html();
      if (actNetTemp != undefined)
        actNetTemp = actNetTemp.replace(/[\,$]/g, "");
      actualNetVal = parseInt(actNetTemp, 10);
      let projNetTemp = $(".proj_amt_net_new_" + i).html();
      if (projNetTemp != undefined)
        projNetTemp = projNetTemp.replace(/[\,$]/g, "");
      projNetVal = parseInt(projNetTemp, 10);

      //Current New calculation of Total
      usCurNetVal = parseInt($(".uscan_amt_current_-_new_" + i).html(), 10);
      inCurNetVal = parseInt($(".ind_amt_current_-_new_" + i).html(), 10);
      let sowCurNetTemp = $(".sow_amt_current_-_new_" + i).html();
      if (sowCurNetTemp != undefined)
        sowCurNetTemp = sowCurNetTemp.replace(/[\,$]/g, "");
      sowCurNetVal = parseInt(sowCurNetTemp, 10);
      let actCurNetTemp = $(".actual_amt_current_-_new_" + i).html();
      if (actCurNetTemp != undefined)
        actCurNetTemp = actCurNetTemp.replace(/[\,$]/g, "");
      actualCurNetVal = parseInt(actCurNetTemp, 10);
      let prjCurNetTemp = $(".proj_amt_current_-_new_" + i).html();
      if (prjCurNetTemp != undefined)
        prjCurNetTemp = prjCurNetTemp.replace(/[\,$]/g, "");
      projCurNetVal = parseInt(prjCurNetTemp, 10);
      //Current calculation of Total
      usCurVal = parseInt($(".uscan_amt_current_" + i).html(), 10);
      indCurVal = parseInt($(".ind_amt_current_" + i).html(), 10);
      let sowCurTemp = $(".sow_amt_current_" + i).html();
      if (sowCurTemp != undefined)
        sowCurTemp = sowCurTemp.replace(/[\,$]/g, "");
      sowCurVal = parseInt(sowCurTemp, 10);
      let actualCurTemp = $(".actual_amt_current_" + i).html();
      if (actualCurTemp != undefined)
        actualCurTemp = actualCurTemp.replace(/[\,$]/g, "");
      actualCurVal = parseInt(actualCurTemp, 10);
      let projCurTemp = $(".proj_amt_current_" + i).html();
      if (projCurTemp != undefined)
        projCurTemp = projCurTemp.replace(/[\,$]/g, "");
      projCurVal = parseInt(projCurTemp, 10);
    });
    let us_tot_val = usnetVal + usCurNetVal + usCurVal;
    let in_tot_val = inNetVal + inCurNetVal + indCurVal;
    let sow_tot_val = sowNetVal + sowCurNetVal + sowCurVal;
    let actual_tot_val = actualNetVal + actualCurNetVal + actualCurVal;
    let projected_tot_val = projNetVal + projCurNetVal + projCurVal;
    (factNetNewSowTot += sowNetVal),
      (factNetNewActualTot += actualNetVal),
      (factNetNewProjTot += projNetVal);
    (factCurNewSowTot += sowCurNetVal),
      (factCurNewActualTot += actualCurNetVal),
      (factCurNewProjTot += projCurNetVal);
    (factCurSowTot += sowCurVal),
      (factCurActualTot += actualCurVal),
      (factCurProjTot += projCurVal);
    let final_html = `<tr class="${generateSafeId(accountName)}_collapse noExl">
                          <td colspan="10" class="account_total_style sow_total_data_style">${accountName} Total</td>
                          <td class="account_total_style sow_total_data_style"><div id="us_tot_${generateSafeId(accountName)}">${us_tot_val}</div></td>
                          <td class="account_total_style sow_total_data_style"><div id="ind_tot_${generateSafeId(accountName)}">${in_tot_val}</div></td>
                          <td class="account_total_style sow_total_data_style"><div>$${sow_tot_val.toLocaleString()}</div></td>
                          <td class="account_total_style sow_total_data_style active_sow_amount"><div>$${actual_tot_val.toLocaleString()}</div></td>
                          <td class="account_total_style sow_total_data_style active_sow_amount"><div>$${projected_tot_val.toLocaleString()}</div></td>
                        </tr>
                        `;
    $("#sow_emp_details").append(final_html);
    let type_account_span_total =
      netNewArr.length + currentNew.length + current.length;
    let newRow = 0;
    let filterData = selectedValues.length > 0;
    const allStages = ["Lead", "Qualified", "Proposal", "Signed", "Pre-Qualified", "Renewal", "Lost"];
    
    // Filtering each array based on selected stages or default stages
    if (filterData) {
        // Filter netNewArr based on selected stages
        if (netNewArr.length > 0) {
            netNewArr = netNewArr.filter(item => selectedValues.includes(item.SOW_STAGE));
        }
        
        // Filter currentNew based on selected stages
        if (currentNew.length > 0) {
            currentNew = currentNew.filter(item => selectedValues.includes(item.SOW_STAGE));
        }
        
        // Filter current based on selected stages
        if (current.length > 0) {
            current = current.filter(item => selectedValues.includes(item.SOW_STAGE));
        }
    } else {
        // No selections, so use all default stages
        if (netNewArr.length > 0) {
            netNewArr = netNewArr.filter(item => allStages.includes(item.SOW_STAGE));
        }
        
        if (currentNew.length > 0) {
            currentNew = currentNew.filter(item => allStages.includes(item.SOW_STAGE));
        }
        
        if (current.length > 0) {
            current = current.filter(item => allStages.includes(item.SOW_STAGE));
        }
    }
    
    netNewArr.sort((a, b) => (a.SOW_ID < b.SOW_ID ? -1 : 1));
    let netNewgr = groupBy(netNewArr, "SOW_ID");
    let newNetNewArr = [];
    Object.keys(netNewgr).forEach((key) => {
      netNewgr[key].sort((a, b) =>
        new Date(a.ACTUAL_START_DATE) < new Date(b.ACTUAL_START_DATE) ? -1 : 1
      );
      newNetNewArr = [...newNetNewArr, ...netNewgr[key]];
    });
    netNewArr = newNetNewArr;
    let eachNetNewSowUSCAN = 0,
      eachCurNewSowUSCAN = 0,
      eachCurSowUSCAN = 0;
    let eachNetNewSowInd = 0,
      eachCurNewSowInd = 0,
      eachCurSowInd = 0;
    let eachNetNewSowAmt = 0,
      eachCurNewSowAmt = 0,
      eachCurSowAmt = 0;
    let eachNetNewSowActAmt = 0,
      eachCurNewSowActAmt = 0,
      eachCurSowActAmt = 0;
    let eachNetNewSowPrjAmt = 0,
      eachCurNewSowPrjAmt = 0,
      eachCurSowPrjAmt = 0;
    $.each(netNewArr, function (i, netNewData) {
      let sowAmount = netNewData.SOW_AMOUNT;
      // let actualAmount = netNewData.ACTUAL_AMOUNT;
      // let projAmount = netNewData.PROJECTED_AMOUNT;
      let probability = probabilityChange(netNewData.PROBABILITY);
      let probabilityData = probabilityClass(netNewData.PROBABILITY);
      let renewalButton = "";
      if (netNewData.RENEWAL_FLAG == "NO" && netNewData.SOW_STAGE == "Signed") {
        renewalButton = `<button class="btn btn-info renew_button_class" type="button" onClick="sowAccDetails(this)" data-id='${JSON.stringify(
          netNewData
        )}' data-id1="renew">Renew</button>`;
      }
      let typeHtml = `<tr class="${generateSafeId(accountName)}_expand">
                            <td onClick="accountExpand(this)"><div class="sow_data_style_${probabilityData}">${
        netNewData.ACCOUNT_NAME
      }</div></td>
                            <td><div class="sow_data_name" onClick="sowAccDetails(this)" data-id='${JSON.stringify(
                              netNewData
                            )}' data-id1="sow">${netNewData.SOW_NAME}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.SOW_STAGE === '-1' ? "-" : netNewData.SOW_STAGE
      }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${probability === '-1' ? "-" : probability}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.SOW_TYPE === '-1' ? "-" : netNewData.SOW_TYPE
      }</div></td>
                            <td class="hide_column"><div class="sow_empty_data_style">${
                              netNewData.PRICING_PLAN === '-1' ? "-" : netNewData.PRICING_PLAN
                            }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.LEGAL_START_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.LEGAL_END_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.BILLING_START_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.BILLING_END_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.ACTUAL_START_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.ACTUAL_END_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.NUMBER_OF_RESOURCE_US
      }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.NUMBER_OF_RESOURCE_IND
      }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">$${sowAmount.toLocaleString()}</div></td>
                            <td class="renew_class">${renewalButton}</td>
                          </tr>`;

      netSow += parseInt(netNewData.SOW_AMOUNT);
      netActual += parseInt(netNewData.ACTUAL_AMOUNT);
      netProjected += parseInt(netNewData.PROJECTED_AMOUNT);
      let resCurStatus = checkResCurDate(
        netNewData.ACTUAL_START_DATE,
        netNewData.ACTUAL_END_DATE
      );
      if (resCurStatus == true) {
        netUsCan += parseInt(netNewData.NUMBER_OF_RESOURCE_US);
        netInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
        eachNetNewSowUSCAN += parseInt(netNewData.NUMBER_OF_RESOURCE_US);
        eachNetNewSowInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
      }
      eachNetNewSowAmt += parseInt(netNewData.SOW_AMOUNT);
      eachNetNewSowActAmt += parseInt(netNewData.ACTUAL_AMOUNT);
      eachNetNewSowPrjAmt += parseInt(netNewData.PROJECTED_AMOUNT);
      newRow++;
      $("#sow_emp_details").append(typeHtml);
    });
    currentNew.sort((a, b) => (a.SOW_ID < b.SOW_ID ? -1 : 1));
    let currnewgr = groupBy(currentNew, "SOW_ID");
    var newArr = [];
    Object.keys(currnewgr).forEach((key) => {
      currnewgr[key].sort((a, b) =>
        new Date(a.ACTUAL_START_DATE) < new Date(b.ACTUAL_START_DATE) ? -1 : 1
      );
      newArr = [...newArr, ...currnewgr[key]];
    });
    currentNew = newArr;
    $.each(currentNew, function (i, netNewData) {
      let sowAmount = netNewData.SOW_AMOUNT;
      // let actualAmount = netNewData.ACTUAL_AMOUNT;
      // let projAmount = netNewData.PROJECTED_AMOUNT;
      let probability = probabilityChange(netNewData.PROBABILITY);
      let probabilityData = probabilityClass(netNewData.PROBABILITY);
      let renewalButton = "";
      if (netNewData.RENEWAL_FLAG == "NO" && netNewData.SOW_STAGE == "Signed") {
        renewalButton = `<button class="btn btn-info renew_button_class" onClick="sowAccDetails(this)" data-id='${JSON.stringify(
          netNewData
        )}' data-id1="renew">Renew</button>`;
      }
      let typeHtml = `<tr class="${generateSafeId(accountName)}_expand">
                            <td onClick="accountExpand(this)"><div class="sow_data_style_${probabilityData}">${
        netNewData.ACCOUNT_NAME
      }</div></td>
                            <td><div class="sow_data_name" onClick="sowAccDetails(this)" data-id='${JSON.stringify(
                              netNewData
                            )}' data-id1="sow">${netNewData.SOW_NAME}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.SOW_STAGE == "-1" ? "-" : netNewData.SOW_STAGE
      }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${probability == '-1' ? "-" : probability}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.SOW_TYPE == "-1" ? "-" : netNewData.SOW_TYPE
      }</div></td>
                            <td class="hide_column"><div class="sow_empty_data_style">${
                              netNewData.PRICING_PLAN == "-1" ? "-" : netNewData.PRICING_PLAN
                            }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.LEGAL_START_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.LEGAL_END_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.BILLING_START_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.BILLING_END_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.ACTUAL_START_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.ACTUAL_END_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.NUMBER_OF_RESOURCE_US
      }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.NUMBER_OF_RESOURCE_IND
      }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">$${sowAmount.toLocaleString()}</div></td>
                            <td class="renew_class">${renewalButton}</td>
                          </tr>`;

      curNewSow += parseInt(netNewData.SOW_AMOUNT);
      curNetActual += parseInt(netNewData.ACTUAL_AMOUNT);
      curNetProjected += parseInt(netNewData.PROJECTED_AMOUNT);
      let resCurStatus = checkResCurDate(
        netNewData.ACTUAL_START_DATE,
        netNewData.ACTUAL_END_DATE
      );
      if (resCurStatus == true) {
        curNewUsCan += parseInt(netNewData.NUMBER_OF_RESOURCE_US);
        curNewInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
        eachCurNewSowUSCAN += parseInt(netNewData.NUMBER_OF_RESOURCE_US);
        eachCurNewSowInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
      }
      eachCurNewSowAmt += parseInt(netNewData.SOW_AMOUNT);
      eachCurNewSowActAmt += parseInt(netNewData.ACTUAL_AMOUNT);
      eachCurNewSowPrjAmt += parseInt(netNewData.PROJECTED_AMOUNT);
      newRow++;
      $("#sow_emp_details").append(typeHtml);
    });
    current.sort((a, b) => (a.SOW_ID < b.SOW_ID ? -1 : 1));
    let currgr = groupBy(current, "SOW_ID");
    let currNewArr = [];
    Object.keys(currgr).forEach((key) => {
      currgr[key].sort((a, b) =>
        new Date(a.ACTUAL_START_DATE) < new Date(b.ACTUAL_START_DATE) ? -1 : 1
      );
      currNewArr = [...currNewArr, ...currgr[key]];
    });
    current = currNewArr;
    $.each(current, function (i, netNewData) {
      let sowAmount = netNewData.SOW_AMOUNT;
      // let actualAmount = netNewData.ACTUAL_AMOUNT;
      // let projAmount = netNewData.PROJECTED_AMOUNT;
      let probability = probabilityChange(netNewData.PROBABILITY);
      let probabilityData = probabilityClass(netNewData.PROBABILITY);
      let renewalButton = "";
      if (netNewData.RENEWAL_FLAG == "NO" && netNewData.SOW_STAGE == "Signed") {
        renewalButton = `<button class="btn btn-info renew_button_class" onClick="sowAccDetails(this)" data-id='${JSON.stringify(
          netNewData
        )}' data-id1="renew">Renew</button>`;
      }
      let typeHtml = `<tr class="${generateSafeId(accountName)}_expand">
                            <td onClick="accountExpand(this)"><div class="sow_data_style_${probabilityData}">${
        netNewData.ACCOUNT_NAME
      }</div></td>
                            <td><div class="sow_data_name" onClick="sowAccDetails(this)" data-id='${JSON.stringify(
                              netNewData
                            )}' data-id1="sow">${netNewData.SOW_NAME}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.SOW_STAGE == "-1" ? "-" : netNewData.SOW_STAGE
      }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${probability == "-1" ? "-" : probability}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.SOW_TYPE == "-1" ? "-" : netNewData.SOW_TYPE
      }</div></td>
                            <td class="hide_column"><div class="sow_empty_data_style">${
                              netNewData.PRICING_PLAN == "-1" ? "-" : netNewData.PRICING_PLAN
                            }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.LEGAL_START_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.LEGAL_END_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.BILLING_START_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.BILLING_END_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.ACTUAL_START_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convertTemp(
        netNewData.ACTUAL_END_DATE
      )}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.NUMBER_OF_RESOURCE_US
      }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${
        netNewData.NUMBER_OF_RESOURCE_IND
      }</div></td>
                            <td><div class="sow_data_style_${probabilityData}">$${sowAmount.toLocaleString()}</div></td>
                            <td class="renew_class">${renewalButton}</td>
                          </tr>`;

      curSow += parseInt(netNewData.SOW_AMOUNT);
      curActual += parseInt(netNewData.ACTUAL_AMOUNT);
      curProjected += parseInt(netNewData.PROJECTED_AMOUNT);
      let resCurStatus = checkResCurDate(
        netNewData.ACTUAL_START_DATE,
        netNewData.ACTUAL_END_DATE
      );
      if (resCurStatus == true) {
        curUsCan += parseInt(netNewData.NUMBER_OF_RESOURCE_US);
        curInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
        eachCurSowUSCAN += parseInt(netNewData.NUMBER_OF_RESOURCE_US);
        eachCurSowInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
      }
      eachCurSowAmt += parseInt(netNewData.SOW_AMOUNT);
      eachCurSowActAmt += parseInt(netNewData.ACTUAL_AMOUNT);
      eachCurSowPrjAmt += parseInt(netNewData.PROJECTED_AMOUNT);
      newRow++;
      $("#sow_emp_details").append(typeHtml);
    });
    let eachSowTotalUSCAN =
      eachNetNewSowUSCAN + eachCurNewSowUSCAN + eachCurSowUSCAN;
    let eachSowTotalInd = eachNetNewSowInd + eachCurNewSowInd + eachCurSowInd;
    let eachSowTotalAmt = eachNetNewSowAmt + eachCurNewSowAmt + eachCurSowAmt;
    let eachSowTotal = `<tr class="${generateSafeId(accountName)}_expand noExl">
                            <td rowspan="3" class="sow_empty_data_style_tot" onClick="accountExpand(this)">${accountName} Total</td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_type_style">Net New</div></td>
                            <td class="hide_column"><div class="sow_empty_data_style">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_type_style uscan_amt_net_new">${eachNetNewSowUSCAN}</div></td>
                            <td><div class="sow_type_style ind_amt_net_new">${eachNetNewSowInd}</div></td>
                            <td><div class="sow_type_style sow_amt_net_new">$${eachNetNewSowAmt.toLocaleString()}</div></td>
                          </tr>
                          <tr class="${generateSafeId(accountName)}_expand noExl">
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_type_style">Current - New</div></td>
                            <td class="hide_column"><div class="sow_empty_data_style">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_type_style uscan_amt_net_new">${eachCurNewSowUSCAN}</div></td>
                            <td><div class="sow_type_style ind_amt_net_new">${eachCurNewSowInd}</div></td>
                            <td><div class="sow_type_style sow_amt_net_new">$${eachCurNewSowAmt.toLocaleString()}</div></td>
                          </tr>
                          <tr class="${generateSafeId(accountName)}_expand noExl">
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_type_style">Current</div></td>
                            <td class="hide_column"><div class="sow_empty_data_style">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_empty_data_style_tot">-</div></td>
                            <td><div class="sow_type_style uscan_amt_net_new">${eachCurSowUSCAN}</div></td>
                            <td><div class="sow_type_style ind_amt_net_new">${eachCurSowInd}</div></td>
                            <td><div class="sow_type_style sow_amt_net_new">$${eachCurSowAmt.toLocaleString()}</div></td>
                          </tr>
                          <tr class="${generateSafeId(accountName)}_expand noExl">
                            <td colspan="11" class="account_total_style factspan_final_tot_style">${accountName} Total</td>
                            <td class="account_total_style factspan_final_tot_style"><div>${eachSowTotalUSCAN}</div></td>
                            <td class="account_total_style factspan_final_tot_style"><div>${eachSowTotalInd}</div></td>
                            <td class="account_total_style factspan_final_tot_style"><div>$${eachSowTotalAmt.toLocaleString()}</div></td>
                          </tr>`;
    $("#sow_emp_details").append(eachSowTotal);
    $(
      "#sow_emp_details"
    ).append(`<tr class="${generateSafeId(accountName)} noExl">
                                      <td colspan="16" class="hr_line"><hr></td>
                                    </tr>`);
    let class_hide = generateSafeId(accountName) + "_expand";
    $("." + class_hide).hide();
    let net_us = `#us_res_${generateSafeId(accountName)}_net_new_${i}`;
    let net_ind = `#ind_res_${generateSafeId(accountName)}_net_new_${i}`;
    $(net_us).html(eachNetNewSowUSCAN);
    $(net_ind).html(eachNetNewSowInd);
    let cur_new_us = `#us_res_${generateSafeId(accountName)}_current_-_new_${i}`;
    let cur_new_ind = `#ind_res_${generateSafeId(accountName)}_current_-_new_${i}`;
    $(cur_new_us).html(eachCurNewSowUSCAN);
    $(cur_new_ind).html(eachCurNewSowInd);
    let cur_us = `#us_res_${generateSafeId(accountName)}_current_${i}`;
    let cur_ind = `#ind_res_${generateSafeId(accountName)}_current_${i}`;
    $(cur_us).html(eachCurSowUSCAN);
    $(cur_ind).html(eachCurSowInd);

    $(`#us_tot_${generateSafeId(accountName)}`).html(eachSowTotalUSCAN);
    $(`#ind_tot_${generateSafeId(accountName)}`).html(eachSowTotalInd);
    factNetNewUSTot += eachNetNewSowUSCAN;
    factNetNewINDTot += eachNetNewSowInd;
    factCurNewUSTot += eachCurNewSowUSCAN;
    factCurNewINDTot += eachCurNewSowInd;
    factCurUSTot += eachCurSowUSCAN;
    factCurINDTot += eachCurSowInd;
    factspanUsCan_tot = factNetNewUSTot + factCurNewUSTot + factCurUSTot;
    factspanInd_tot = factNetNewINDTot + factCurNewINDTot + factCurINDTot;
  });
  $("#factspan_sow_amount").html(factspan_total);
  let sowTypeTotal = `<tr class="sow_type_total noExl">
              <td rowspan="3" class="sow_empty_data_style_tot">Total</td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_type_style">Net New</div></td>
              <td class="hide_column"><div class="sow_empty_data_style">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_type_style uscan_amt_net_new">${factNetNewUSTot}</div></td>
              <td><div class="sow_type_style ind_amt_net_new">${factNetNewINDTot}</div></td>
              <td><div class="sow_type_style sow_amt_net_new">$${factNetNewSowTot.toLocaleString()}</div></td>
              <td class="active_sow_amount"><div class="sow_type_style actual_amt_net_new ">$${factNetNewActualTot.toLocaleString()}</div></td>
              <td class="active_sow_amount"><div class="sow_type_style proj_amt_net_new ">$${factNetNewProjTot.toLocaleString()}</div></td>
            </tr>
            <tr class="sow_type_total noExl">
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_type_style">Current - New</div></td>
              <td class="hide_column"><div class="sow_empty_data_style">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_type_style uscan_amt_net_new">${factCurNewUSTot}</div></td>
              <td><div class="sow_type_style ind_amt_net_new">${factCurNewINDTot}</div></td>
              <td><div class="sow_type_style sow_amt_net_new">$${factCurNewSowTot.toLocaleString()}</div></td>
              <td class="active_sow_amount"><div class="sow_type_style actual_amt_net_new ">$${factCurNewActualTot.toLocaleString()}</div></td>
              <td class="active_sow_amount"><div class="sow_type_style proj_amt_net_new ">$${factCurNewProjTot.toLocaleString()}</div></td>
            </tr>
            <tr class="sow_type_total noExl">
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_type_style">Current</div></td>
              <td class="hide_column"><div class="sow_empty_data_style">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_empty_data_style_tot">-</div></td>
              <td><div class="sow_type_style uscan_amt_net_new">${factCurUSTot}</div></td>
              <td><div class="sow_type_style ind_amt_net_new">${factCurINDTot}</div></td>
              <td><div class="sow_type_style sow_amt_net_new">$${factCurSowTot.toLocaleString()}</div></td>
              <td class="active_sow_amount"><div class="sow_type_style actual_amt_net_new ">$${factCurActualTot.toLocaleString()}</div></td>
              <td class="active_sow_amount"><div class="sow_type_style proj_amt_net_new ">$${factCurProjTot.toLocaleString()}</div></td>
            </tr>`;
  $("#sow_emp_details").append(sowTypeTotal);
  let factspan_final_tot = `<tr class="factspan_total noExl">
                          <td colspan="11" class="account_total_style factspan_final_tot_style">Factspan Total</td>
                          <td class="account_total_style factspan_final_tot_style"><div>${factspanUsCan_tot}</div></td>
                          <td class="account_total_style factspan_final_tot_style"><div>${factspanInd_tot}</div></td>
                          <td class="account_total_style factspan_final_tot_style"><div>$${factspan_total.toLocaleString()}</div></td>
                          <td class="account_total_style factspan_final_tot_style active_sow_amount"><div>$${factspanActual_tot.toLocaleString()}</div></td>
                          <td class="account_total_style factspan_final_tot_style active_sow_amount"><div>$${factspanProjected_tot.toLocaleString()}</div></td>  
                        </tr>
                        `;
  $("#sow_emp_details").append(factspan_final_tot);
  $(".active_sow_amount").hide();
  $(".account_active").hide();
  $(".hr_line").attr("colspan", "14");
  let sowName = localStorage.getItem("sowAccName");
  $(".renew_class").hide();
  let accessLevel = checkEachPageAccess("Revenue")
  let pageLevelAccess = accessLevel[1]
  let eachLevel = pageLevelAccess.split(',')
  $.each(eachLevel, function (l, level) {
    switch (level) {
      case "view":
        $(".renew_class").hide();
        break;
      case "edit":
        $(".renew_class").hide();
        break;
    }
  })
  restoreExpandedAccounts();
}

function commafy(num) {
  num.toString().replace(/\B(?=(?:\d{3})+)$/g, ",");
}

function convert(str) {
  if (str == null) {
    return "";
  } else if (str == "0000-00-00") {
    return "";
  } else {
    let tempStr = str + "T00:00:00";
    var date = new Date(tempStr),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
  }
}
console.log(convert("Mon, 11 Nov 2013 00:00:00 GMT"));

function convertTemp(str) {
  if (str == null) {
    return "";
  } else if (str == "0000-00-00") {
    return "";
  } else {
    let tempStr = str + "T00:00:00";
    var date = new Date(tempStr),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
  }
}

// function statusCheck(obj) {
//   let lead = "",
//     qualified = "",
//     proposal = "",
//     signed = "",
//     pre_qualified = "",
//     renewal = "",
//     lost = "";
//   let filterStatus = false;
//   if ($("#lead_data").is(":checked") == true) {
//     lead = "Lead";
//     filterStatus = true;
//   }
//   if ($("#qualified_data").is(":checked") == true) {
//     qualified = "Qualified";
//     filterStatus = true;
//   }
//   if ($("#proposal_data").is(":checked") == true) {
//     proposal = "Proposal";
//     filterStatus = true;
//   }
//   if ($("#sign_data").is(":checked") == true) {
//     signed = "Signed";
//     filterStatus = true;
//   }
//   if ($("#pre_qualified_data").is(":checked") == true) {
//     pre_qualified = "Pre-Qualified";
//     filterStatus = true;
//   }
//   if ($("#renewal_data").is(":checked") == true) {
//     renewal = "Renewal";
//     filterStatus = true;
//   }
//   if ($("#lost_data").is(":checked") == true) {
//     lost = "Lost";
//     filterStatus = true;
//   }
//   let status_array = [];
//   if (filterStatus == true) {
//     status_array = sowFullData.filter((item) => {
//       return item.ACCOUNT_DATA.some((aItem) =>
//         aItem.SOW_TYPE_DATA.find((sItem) => {
//           return (
//             sItem.SOW_STAGE === lead ||
//             sItem.SOW_STAGE === signed ||
//             sItem.SOW_STAGE === proposal ||
//             sItem.SOW_STAGE === qualified ||
//             sItem.SOW_STAGE === renewal ||
//             sItem.SOW_STAGE === pre_qualified ||
//             sItem.SOW_STAGE === lost
//           );
//         })
//       );
//     });
//   } else {
//     status_array = sowFullData.filter((item) => {
//       return item.ACCOUNT_DATA.some((aItem) =>
//         aItem.SOW_TYPE_DATA.find((sItem) => {
//           return (
//             sItem.SOW_STAGE === "Lead" ||
//             sItem.SOW_STAGE === "Qualified" ||
//             sItem.SOW_STAGE === "Proposal" ||
//             sItem.SOW_STAGE === "Signed" ||
//             sItem.SOW_STAGE === "Pre-Qualified" ||
//             sItem.SOW_STAGE === "Renewal" ||
//             sItem.SOW_STAGE === "Lost"
//           );
//         })
//       );
//     });
//   }

//   let className = $("#iconToggle").attr("class");
//   if (className == "fa fa-sort-alpha-asc") {
//     let sow = sortSowDetails(status_array, "ACCOUNT_NAME", true);
//     createSowTableData(sow);
//   } else if (className == "fa fa-sort-alpha-asc fa-sort-alpha-desc") {
//     let sow = sortSowDetails(status_array, "ACCOUNT_NAME", false);
//     createSowTableData(sow);
//   }
// }
function statusCheck(selectedValues) {
  let filterStatus = selectedValues.length > 0;

  // Filter `sowFullData` based on selected stages
  let status_array = filterStatus
    ? sowFullData.filter((item) =>
        item.ACCOUNT_DATA.some((aItem) =>
          aItem.SOW_TYPE_DATA.some((sItem) => selectedValues.includes(sItem.SOW_STAGE))
        )
      )
    : sowFullData.filter((item) =>
        item.ACCOUNT_DATA.some((aItem) =>
          aItem.SOW_TYPE_DATA.some((sItem) =>
            ["Lead", "Qualified", "Proposal", "Signed", "Pre-Qualified", "Renewal", "Lost"].includes(sItem.SOW_STAGE)
          )
        )
      );

  let className = $("#iconToggle").attr("class");
  if (className == "fa fa-sort-alpha-asc") {
    let sow = sortSowDetails(status_array, "ACCOUNT_NAME", true);
    createSowTableData(sow,selectedValues);
  } else if (className == "fa fa-sort-alpha-asc fa-sort-alpha-desc") {
    let sow = sortSowDetails(status_array, "ACCOUNT_NAME", false);
    createSowTableData(sow,selectedValues);
  }
}

function accountExpand(obj) {
  let accountNameSelect = getAccountKeyFromRow(obj);
  let expClassName = accountNameSelect + "_expand";
  let collClassName = accountNameSelect + "_collapse";
  expandedAccounts.delete(accountNameSelect);
  $("." + expClassName).hide();
  $("." + collClassName).show();
}

function accountCollapse(obj) {
  $(".renew_class").show();
  let accessLevel = checkEachPageAccess("Revenue")
  let pageLevelAccess = accessLevel[1]
  let eachLevel = pageLevelAccess.split(',')
  $.each(eachLevel, function (l, level) {
    switch (level) {
      case "view":
        $(".renew_class").hide();
        break;
      case "edit":
        $(".renew_class").show();
        break;
    }
  })
  let accountNameSelect = getAccountKeyFromRow(obj);
  if (accountNameSelect == "") {
    accountNameSelect = obj;
  }
  let expClassName = accountNameSelect + "_expand";
  let collClassName = accountNameSelect + "_collapse";
  expandedAccounts.add(accountNameSelect);
  $("." + expClassName).show();
  $("." + collClassName).hide();
}

function sowAccDetails(obj) {
  let idData = $(obj).attr("data-id");
  let idClickSoruce = $(obj).attr("data-id1");
  let tempArr = JSON.parse(idData)
  let uniqId_sowid = tempArr.UNIQUE_ID+'&'+tempArr.SOW_ID
  localStorage.setItem('urlStoredSOWUrldata','')
  localStorage.setItem("sow-acc-data", '');
  localStorage.removeItem('urlStoredSOWUrldata');
  localStorage.removeItem('sow-acc-data');
  localStorage.removeItem('sow-url-id');
  localStorage.setItem("sow-click-source", idClickSoruce);
  window.open(`sow.html?${uniqId_sowid}`, '_blank');
}

function downloadExcel() {
  let today = new Date();
  let date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let time =
    today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
  let CurrentDateTime = date + "_" + time;
  $("#sow_emp_details")
    .remove(".noExl")
    .table2excel({
      exclude: ".noExl",
      name: "SOW Details",
      filename: "sow_details_" + CurrentDateTime,
      fileext: ".xls",
    });
}

function sortSowDetails(sowData, prop, asc) {
  if (prop === "ACCOUNT_NAME") {
    return sortAccountsByOrder(sowData, prop, asc);
  }
  sowData.sort(function (a, b) {
    if (asc) {
      return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0;
    } else {
      return b[prop] > a[prop] ? 1 : b[prop] < a[prop] ? -1 : 0;
    }
  });
  return sowData;
}

function sowAccountSort() {
  $(".fa-sort-alpha-asc").toggleClass("fa-sort-alpha-desc");
  // let className = $("#iconToggle").attr("class");
  // if (className == "fa fa-sort-alpha-asc") {
  //   let sow = sortSowDetails(sortSowData, "ACCOUNT_NAME", true);
  //   createSowTableData(sow);
  // } else if (className == "fa fa-sort-alpha-asc fa-sort-alpha-desc") {
  //   let sow = sortSowDetails(sortSowData, "ACCOUNT_NAME", false);
  //   createSowTableData(sow);
  // }
  let filterStatus = filterSelectedValues.length > 0;

  // Filter `sowFullData` based on selected stages
  let status_array = filterStatus
    ? sowFullData.filter((item) =>
        item.ACCOUNT_DATA.some((aItem) =>
          aItem.SOW_TYPE_DATA.some((sItem) => filterSelectedValues.includes(sItem.SOW_STAGE))
        )
      )
    : sowFullData.filter((item) =>
        item.ACCOUNT_DATA.some((aItem) =>
          aItem.SOW_TYPE_DATA.some((sItem) =>
            ["Lead", "Qualified", "Proposal", "Signed", "Pre-Qualified", "Renewal", "Lost"].includes(sItem.SOW_STAGE)
          )
        )
      );

  let className = $("#iconToggle").attr("class");
  if (className == "fa fa-sort-alpha-asc") {
    let sow = sortSowDetails(status_array, "ACCOUNT_NAME", true);
    createSowTableData(sow,filterSelectedValues);
  } else if (className == "fa fa-sort-alpha-asc fa-sort-alpha-desc") {
    let sow = sortSowDetails(status_array, "ACCOUNT_NAME", false);
    createSowTableData(sow,filterSelectedValues);
  }
}

function checkResCurDate(start, end) {
  let starDate = new Date(start);
  let endDate = new Date(end);
  let today = new Date();
  let result = false;
  if (today >= starDate && today <= endDate) {
    result = true;
  }
  return result;
}

function probabilityChange(prob) {
  let probabilityData = prob;
  if (probabilityData == "100") {
    probabilityData = "100%";
  } else if (probabilityData == "70") {
    probabilityData = "> 70%";
  } else if (probabilityData == "> 70%") {
    probabilityData = "> 70%";
  } else if (probabilityData == "> 70") {
    probabilityData = "> 70%";
  } else if (probabilityData == "30 to 50") {
    probabilityData = "30% to 50%";
  } else if (probabilityData == "10") {
    probabilityData = "10%";
  }
  return probabilityData;
}

function probabilityClass(prob) {
  let probabilityData = prob;
  if (probabilityData == "100%") {
    probabilityData = "100";
  } else if (probabilityData == "70%") {
    probabilityData = "70";
  } else if (probabilityData == "> 70%") {
    probabilityData = "70";
  } else if (probabilityData == "> 70") {
    probabilityData = "70";
  } else if (probabilityData == "30% to 50%") {
    probabilityData = "30 to 50";
  } else if (probabilityData == "10%") {
    probabilityData = "10";
  }
  return probabilityData;
}

function sortJSON(arr, key, way) {
  return arr.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    if (way === "123") {
      return x < y ? -1 : x > y ? 1 : 0;
    }
    if (way === "321") {
      return x > y ? -1 : x < y ? 1 : 0;
    }
  });
}

var groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

function gotoSOWName(accName) {
  console.log("Received accName:", accName);

  if (!accName || !accName.trim()) {
    console.error("Invalid accName provided.");
    return;
  }

  accName = accName.replace(/ /g, "_");
  console.log("Processed accName for id:", accName);

  const targetElement = $("#" + accName);
  if (targetElement.length === 0) {
    console.error(`Element with id '${accName}' not found in the DOM.`);
    return;
  }

  if (!targetElement.is(":visible")) {
    console.warn(`Element with id '${accName}' exists but is not visible.`);
  }

  const targetOffset = targetElement.offset();
  if (!targetOffset) {
    console.error("Failed to calculate offset. Check if the element is in the DOM.");
    return;
  }

  console.log("Target Offset:", targetOffset);

  $(".employee_detail_inside").animate(
    {
      scrollTop: targetOffset.top,
    },
    "slow"
  );

  accountCollapse(accName);
}



function pocPovHandler() {
  let user_details = localStorage.getItem("user-all-details");
  user_details = JSON.parse(user_details);
  let email_id = user_details.EMAIL_ID;
  let department_name = user_details.DEPARTMENT;
 
    window.location.href = "poc_pov_dashboard.html";
    return true;
  
}
function account(event) {
  if (event) event.preventDefault(); // Prevent default form behavior
  window.open('accountDetails.html', '_blank');
}



function createSow() {
  localStorage.setItem("addRequest", true);
  localStorage.setItem("editRequest", false);
  window.open('sowCreate.html', '_blank');
  return false;
}

function buyingCenter(event) {
  if (event) event.preventDefault(); // Prevent default form behavior
  window.open('buying_center.html', '_blank');
}
