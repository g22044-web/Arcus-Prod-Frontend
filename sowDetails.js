var sowFullData = [];
let futureData = [];
let oldData = [];
let signedData = [];
let funnelStageDrop = [];
let sowTypeDrop = [];
function getSowViewData() {
  $.ajax({
    // url: "https://rre-api.factspanapps.com:5000/app",
    url: apiValue.url,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: 'no-cors',
    data: {
      query_type: "sow_details_new_UI",
      "environment": apiValue.environment
    },
    success: function (data) {
      sowFullData = data.Details;
    
      futureData = sowFullData.filter(function (item) { return item.SOW_PERIOD_STATUS != "OLD"; });
      let minutesToAdd = 330;
      let currentYearStartTemp = new Date("2022-01-01");
      let currentYearEndTemp = new Date("2022-12-31");
      let currentYearStart = new Date(currentYearStartTemp.getTime() + minutesToAdd * 60000);
      let currentYearEnd = new Date(currentYearEndTemp.getTime() + minutesToAdd * 60000);

   
      $("#sign_data").prop('checked', true);
      $("#proposal_data").prop('checked', true);
      $("#qualified_data").prop('checked', true);
      $("#renewal_data").prop('checked', true);
      statusCheck();
    },
    error: function (error) {
      console.log('message Error' + JSON.stringify(error));
    }
  });
}
let currentFilterData = [];
let sortSowData = [];
function createSowTableData(sowData) {
  sortSowData = sowData;
  let factspan_total = 0, factspanUsCan_tot = 0, factspanInd_tot = 0, factspanActual_tot = 0, factspanProjected_tot = 0;
  let factNetNewUSTot = 0, factNetNewINDTot = 0, factNetNewSowTot = 0, factNetNewActualTot = 0, factNetNewProjTot = 0;
  let factCurNewUSTot = 0, factCurNewINDTot = 0, factCurNewSowTot = 0, factCurNewActualTot = 0, factCurNewProjTot = 0;
  let factCurUSTot = 0, factCurINDTot = 0, factCurSowTot = 0, factCurActualTot = 0, factCurProjTot = 0;
  $("#sow_emp_details tbody").empty();
  let us_tot = 0, ind_fin_tot =0, sow_tot = 0, actual_tot = 0, projected_tot = 0;
  $.each(sowData, function(i, sowDetails){
    let accountNameHtml = `<td class="sow_empty_data_style noExl" rowspan="4" onClick="accountCollapse(this)">${sowDetails.ACCOUNT_NAME} <i class="fa fa-chevron-circle-down" aria-hidden="true"></i></td>`;
    let rownumber = 0;
    let accountName = sowDetails.ACCOUNT_NAME;
    let sow_acc_data = sowDetails.ACCOUNT_DATA;
   
    let row;
    let netNewArr = [], currentNew = [], current = [];
    let netUsCan = 0, netInd = 0, netSow = 0, netActual = 0,  netProjected = 0;
    let curNewUsCan = 0, curNewInd = 0, curNewSow = 0, curNetActual = 0, curNetProjected = 0;
    let curUsCan = 0, curInd = 0, curSow = 0, curActual = 0, curProjected = 0;
    let usnetVal = 0, inNetVal = 0, sowNetVal = 0, actualNetVal = 0, projNetVal = 0;
    let usCurNetVal = 0, inCurNetVal = 0, sowCurNetVal = 0, actualCurNetVal = 0, projCurNetVal = 0;
    let usCurVal = 0, indCurVal = 0, sowCurVal = 0, actualCurVal = 0, projCurVal = 0;
    let filterSOWAmtStatus = false;
    $.each(sow_acc_data, function(j, accSowDetails){ 
        let uscan_tot = 0, ind_tot = 0, sow_amout_tot = 0, sow_actual_tot = 0, sow_projected_tot = 0;

        if($('#lead_data').is(':checked') == true){
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Lead_sum_US);
          ind_tot += parseInt(accSowDetails.Lead_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Lead_sum_amount); 
          sow_actual_tot += parseInt(accSowDetails.Lead_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Lead_sum_amount_PROJECTED);
        }
        if($('#qualified_data').is(':checked') == true){
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Qualified_sum_US);
          ind_tot += parseInt(accSowDetails.Qualified_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Qualified_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Qualified_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Qualified_sum_amount_PROJECTED);
         
        }
        if($('#proposal_data').is(':checked') == true){ 
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Proposal_sum_US);
          ind_tot += parseInt(accSowDetails.Proposal_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Proposal_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Proposal_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Proposal_sum_amount_PROJECTED);
          
        }
        if($('#sign_data').is(':checked') == true){ 
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Signed_sum_US);
          ind_tot += parseInt(accSowDetails.Signed_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Signed_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Signed_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Signed_sum_amount_PROJECTED);
         
        }
        if($('#pre_qualified_data').is(':checked') == true){ 
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Pre_Qualified_sum_US);
          ind_tot += parseInt(accSowDetails.Pre_Qualified_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Pre_Qualified_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Pre_Qualified_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Pre_Qualified_sum_amount_PROJECTED);
          
        }
        if($('#renewal_data').is(':checked') == true){ 
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Renewal_sum_US);
          ind_tot += parseInt(accSowDetails.Renewal_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Renewal_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Renewal_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Renewal_sum_amount_PROJECTED);
          
        }
        if($('#lost_data').is(':checked') == true){ 
          filterSOWAmtStatus = true;
          uscan_tot += parseInt(accSowDetails.Lost_sum_US);
          ind_tot += parseInt(accSowDetails.Lost_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Lost_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Lost_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Lost_sum_amount_PROJECTED);
          
        }
        if(filterSOWAmtStatus == false){
          uscan_tot += parseInt(accSowDetails.Lead_sum_US);
          ind_tot += parseInt(accSowDetails.Lead_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Lead_sum_amount); 
          sow_actual_tot += parseInt(accSowDetails.Lead_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Lead_sum_amount_PROJECTED);

          uscan_tot += parseInt(accSowDetails.Qualified_sum_US);
          ind_tot += parseInt(accSowDetails.Qualified_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Qualified_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Qualified_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Qualified_sum_amount_PROJECTED);

          uscan_tot += parseInt(accSowDetails.Proposal_sum_US);
          ind_tot += parseInt(accSowDetails.Proposal_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Proposal_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Proposal_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Proposal_sum_amount_PROJECTED);

          uscan_tot += parseInt(accSowDetails.Signed_sum_US);
          ind_tot += parseInt(accSowDetails.Signed_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Signed_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Signed_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Signed_sum_amount_PROJECTED);

          uscan_tot += parseInt(accSowDetails.Pre_Qualified_sum_US);
          ind_tot += parseInt(accSowDetails.Pre_Qualified_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Pre_Qualified_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Pre_Qualified_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Pre_Qualified_sum_amount_PROJECTED);

          uscan_tot += parseInt(accSowDetails.Renewal_sum_US);
          ind_tot += parseInt(accSowDetails.Renewal_sum_Ind);
          sow_amout_tot += parseInt(accSowDetails.Renewal_sum_amount);
          sow_actual_tot += parseInt(accSowDetails.Renewal_sum_amount_ACTUAL);
          sow_projected_tot += parseInt(accSowDetails.Renewal_sum_amount_PROJECTED);

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
        if(accSowDetails.SOW_TYPE == "Net New"){
          netNewArr = accSowDetails.SOW_TYPE_DATA;
          res_id = "net_new";
        }else if(accSowDetails.SOW_TYPE == "Current - New"){
          currentNew = accSowDetails.SOW_TYPE_DATA;
          res_id = "current_new";
        }else if(accSowDetails.SOW_TYPE == "Current"){
          current = accSowDetails.SOW_TYPE_DATA;
          res_id = "current";
        }
        let sow_type_class = accSowDetails.SOW_TYPE;
        sow_type_class = sow_type_class.toString().replace(/ /g,"_");
        sow_type_class = sow_type_class.toLowerCase();
        
        row = `<tr class="${accountName.replace(/ /g,"_")}_collapse noExl">
                      ${rownumber == 0 ? accountNameHtml : ""}
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_type_style">${accSowDetails.SOW_TYPE}</div></td>
                      <td class="hide_column"><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_empty_data_style">-</div></td>
                      <td><div class="sow_type_style uscan_amt_${sow_type_class}_${i}" id="us_res_${accountName.replace(/ /g,"_")}_${sow_type_class}_${i}">${uscan_tot}</div></td>
                      <td><div class="sow_type_style ind_amt_${sow_type_class}_${i}" id="ind_res_${accountName.replace(/ /g,"_")}_${sow_type_class}_${i}">${ind_tot}</div></td>
                      <td><div class="sow_type_style sow_amt_${sow_type_class}_${i}">$${sow_amout_tot.toLocaleString()}</div></td>
                      <td class="active_sow_amount"><div class="sow_type_style actual_amt_${sow_type_class}_${i}">$${sow_actual_tot.toLocaleString()}</div></td>
                      <td class="active_sow_amount"><div class="sow_type_style proj_amt_${sow_type_class}_${i}">$${sow_projected_tot.toLocaleString()}</div></td>
                    </tr>`
          $('#sow_emp_details').append(row);
          us_tot +=uscan_tot;
          ind_fin_tot +=ind_tot;
          sow_tot += sow_amout_tot;
          actual_tot += sow_actual_tot;
          projected_tot += sow_projected_tot;
          rownumber ++;
          //Net New calculation of Total
          usnetVal = parseInt($(".uscan_amt_net_new_"+i).html(), 10)
          inNetVal = parseInt($(".ind_amt_net_new_"+i).html(), 10)
          let sowNetTemp = $(".sow_amt_net_new_"+i).html();
          if(sowNetTemp != undefined) sowNetTemp = sowNetTemp.replace(/[\,$]/g,'');
           sowNetVal = parseInt(sowNetTemp, 10);
          let actNetTemp = $(".actual_amt_net_new_"+i).html();
          if(actNetTemp != undefined) actNetTemp = actNetTemp.replace(/[\,$]/g,'');
           actualNetVal = parseInt(actNetTemp, 10);
          let projNetTemp = $(".proj_amt_net_new_"+i).html();
          if(projNetTemp != undefined) projNetTemp = projNetTemp.replace(/[\,$]/g,'');
           projNetVal = parseInt(projNetTemp, 10);

          //Current New calculation of Total
           usCurNetVal = parseInt($(".uscan_amt_current_-_new_"+i).html(), 10)
           inCurNetVal = parseInt($(".ind_amt_current_-_new_"+i).html(), 10)
           let sowCurNetTemp = $(".sow_amt_current_-_new_"+i).html();
          if(sowCurNetTemp != undefined) sowCurNetTemp = sowCurNetTemp.replace(/[\,$]/g,'');
           sowCurNetVal = parseInt(sowCurNetTemp, 10)
           let actCurNetTemp = $(".actual_amt_current_-_new_"+i).html();
          if(actCurNetTemp != undefined) actCurNetTemp = actCurNetTemp.replace(/[\,$]/g,'');
           actualCurNetVal = parseInt(actCurNetTemp, 10)
           let prjCurNetTemp = $(".proj_amt_current_-_new_"+i).html();
          if(prjCurNetTemp != undefined) prjCurNetTemp = prjCurNetTemp.replace(/[\,$]/g,'');
            projCurNetVal = parseInt(prjCurNetTemp, 10)
          //Current calculation of Total
           usCurVal = parseInt($(".uscan_amt_current_"+i).html(), 10)
           indCurVal = parseInt($(".ind_amt_current_"+i).html(), 10)
           let sowCurTemp = $(".sow_amt_current_"+i).html();
          if(sowCurTemp != undefined) sowCurTemp = sowCurTemp.replace(/[\,$]/g,'')
           sowCurVal = parseInt(sowCurTemp, 10);
           let actualCurTemp = $(".actual_amt_current_"+i).html();
          if(actualCurTemp != undefined) actualCurTemp = actualCurTemp.replace(/[\,$]/g,'')
            actualCurVal = parseInt(actualCurTemp, 10);
           let projCurTemp = $(".proj_amt_current_"+i).html();
          if(projCurTemp != undefined) projCurTemp = projCurTemp.replace(/[\,$]/g,'')
           projCurVal = parseInt(projCurTemp, 10);
        })
      let us_tot_val = usnetVal + usCurNetVal + usCurVal;
      let in_tot_val = inNetVal + inCurNetVal + indCurVal;
      let sow_tot_val = sowNetVal+ sowCurNetVal + sowCurVal;
      let actual_tot_val = actualNetVal + actualCurNetVal + actualCurVal;
      let projected_tot_val = projNetVal + projCurNetVal + projCurVal;
      factNetNewSowTot += sowNetVal, factNetNewActualTot += actualNetVal, factNetNewProjTot += projNetVal;
      factCurNewSowTot += sowCurNetVal, factCurNewActualTot += actualCurNetVal, factCurNewProjTot += projCurNetVal;
      factCurSowTot += sowCurVal, factCurActualTot += actualCurVal, factCurProjTot += projCurVal;
      let final_html = `<tr class="${accountName.replace(/ /g,"_")}_collapse noExl">
                          <td colspan="10" class="account_total_style sow_total_data_style">${accountName} Total</td>
                          <td class="account_total_style sow_total_data_style"><div id="us_tot_${accountName.replace(/ /g,"_")}">${us_tot_val}</div></td>
                          <td class="account_total_style sow_total_data_style"><div id="ind_tot_${accountName.replace(/ /g,"_")}">${in_tot_val}</div></td>
                          <td class="account_total_style sow_total_data_style"><div>$${sow_tot_val.toLocaleString()}</div></td>
                          <td class="account_total_style sow_total_data_style active_sow_amount"><div>$${actual_tot_val.toLocaleString()}</div></td>
                          <td class="account_total_style sow_total_data_style active_sow_amount"><div>$${projected_tot_val.toLocaleString()}</div></td>
                        </tr>
                        `
      $('#sow_emp_details').append(final_html);
      let type_account_span_total = netNewArr.length + currentNew.length + current.length;
      let newRow = 0;
      let filterData = false;
      let lead = "", qualified = "", proposal = "", signed = "", preQualified = "", renewal_fil = "", lost = "" ;  
      if($('#lead_data').is(':checked') == true){ lead = "Lead"; filterData = true}
      if($('#qualified_data').is(':checked') == true){ qualified = "Qualified";filterData = true }
      if($('#proposal_data').is(':checked') == true){ proposal = "Proposal";filterData = true }
      if($('#sign_data').is(':checked') == true){ signed = "Signed";filterData = true }
      if($('#pre_qualified_data').is(':checked') == true){ preQualified = "Pre-Qualified";filterData = true }
      if($('#renewal_data').is(':checked') == true){ renewal_fil = "Renewal";filterData = true }
      if($('#lost_data').is(':checked') == true){ lost = "Lost";filterData = true }
      if(filterData == true){
        if(netNewArr.length > 0){
          netNewArr = netNewArr.filter(function (item) { return (item.SOW_STAGE == lead || item.SOW_STAGE == qualified || item.SOW_STAGE == proposal || item.SOW_STAGE == signed || item.SOW_STAGE == preQualified || item.SOW_STAGE == renewal_fil || item.SOW_STAGE == lost); })
        }
        if(currentNew.length > 0){
          currentNew = currentNew.filter(function (item) { return (item.SOW_STAGE == lead || item.SOW_STAGE == qualified || item.SOW_STAGE == proposal || item.SOW_STAGE == signed || item.SOW_STAGE == preQualified || item.SOW_STAGE == renewal_fil || item.SOW_STAGE == lost); })
        }
        if(current.length > 0){
          current = current.filter(function (item) { return (item.SOW_STAGE == lead || item.SOW_STAGE == qualified || item.SOW_STAGE == proposal || item.SOW_STAGE == signed || item.SOW_STAGE == preQualified || item.SOW_STAGE == renewal_fil || item.SOW_STAGE == lost); })
        }
      }else{
        if(netNewArr.length > 0){
          netNewArr = netNewArr.filter(function (item) { return (item.SOW_STAGE == "Lead" || item.SOW_STAGE == "Qualified" || item.SOW_STAGE == "Proposal" || item.SOW_STAGE == "Signed" || item.SOW_STAGE == "Pre-Qualified" || item.SOW_STAGE == "Renewal" || item.SOW_STAGE == "Lost"); })
        }
        if(currentNew.length > 0){
          currentNew = currentNew.filter(function (item) { return (item.SOW_STAGE == "Lead" || item.SOW_STAGE == "Qualified" || item.SOW_STAGE == "Proposal" || item.SOW_STAGE == "Signed" || item.SOW_STAGE == "Pre-Qualified" || item.SOW_STAGE == "Renewal" || item.SOW_STAGE == "Lost"); })
        }
        if(current.length > 0){
          current = current.filter(function (item) { return (item.SOW_STAGE == "Lead" || item.SOW_STAGE == "Qualified" || item.SOW_STAGE == "Proposal" || item.SOW_STAGE == "Signed" || item.SOW_STAGE == "Pre-Qualified" || item.SOW_STAGE == "Renewal" || item.SOW_STAGE == "Lost"); })
        }
      }
      
      netNewArr.sort((a,b) => a.SOW_ID <  b.SOW_ID ? -1 : 1);
      let netNewgr = groupBy(netNewArr, 'SOW_ID');
      let newNetNewArr = [];
      Object.keys(netNewgr).forEach(key => {
        netNewgr[key].sort((a,b) => new Date(a.ACTUAL_START_DATE) < new Date(b.ACTUAL_START_DATE) ? -1 : 1);
        newNetNewArr = [...newNetNewArr, ... netNewgr[key]];
      });
      netNewArr = newNetNewArr;
      let eachNetNewSowUSCAN = 0, eachCurNewSowUSCAN = 0, eachCurSowUSCAN = 0;
      let eachNetNewSowInd  = 0,eachCurNewSowInd  = 0, eachCurSowInd  = 0;
      let eachNetNewSowAmt = 0, eachCurNewSowAmt = 0, eachCurSowAmt = 0;
      let eachNetNewSowActAmt = 0, eachCurNewSowActAmt = 0, eachCurSowActAmt = 0;
      let eachNetNewSowPrjAmt = 0, eachCurNewSowPrjAmt = 0, eachCurSowPrjAmt = 0;
      $.each(netNewArr, function(i, netNewData){
        let sowAmount = netNewData.SOW_AMOUNT;
        let actualAmount = netNewData.ACTUAL_AMOUNT;
        let projAmount = netNewData.PROJECTED_AMOUNT;
        let probability = probabilityChange(netNewData.PROBABILITY);
        let probabilityData = probabilityClass(netNewData.PROBABILITY);
        let typeHtml = `<tr class="${accountName.replace(/ /g,"_")}_expand">
                            <td onClick="accountExpand(this)"><div class="sow_data_style_${probabilityData}">${netNewData.ACCOUNT_NAME}</div></td>
                            <td><div class="sow_data_name" onClick="sowAccDetails(this)" data-id='${JSON.stringify(netNewData)}'>${netNewData.SOW_NAME}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.SOW_STAGE}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${probability}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.SOW_TYPE}</div></td>
                            <td class="hide_column"><div class="sow_empty_data_style">${netNewData.PRICING_PLAN}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.LEGAL_START_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.LEGAL_END_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.BILLING_START_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.BILLING_END_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.ACTUAL_START_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.ACTUAL_END_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.NUMBER_OF_RESOURCE_US}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.NUMBER_OF_RESOURCE_IND}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">$${sowAmount.toLocaleString()}</div></td>
                            <td class="account_active"><div class="sow_data_style_${probabilityData}">$${actualAmount.toLocaleString()}</div></td>
                            <td class="account_active"><div class="sow_data_style_${probabilityData}">$${projAmount.toLocaleString()}</div></td>
                          </tr>`
        
        netSow += parseInt(netNewData.SOW_AMOUNT);
        netActual += parseInt(netNewData.ACTUAL_AMOUNT);
        netProjected += parseInt(netNewData.PROJECTED_AMOUNT);
        let resCurStatus = checkResCurDate(netNewData.ACTUAL_START_DATE, netNewData.ACTUAL_END_DATE);
        if(resCurStatus == true){
          netUsCan +=  parseInt(netNewData.NUMBER_OF_RESOURCE_US);
          netInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
          eachNetNewSowUSCAN += parseInt(netNewData.NUMBER_OF_RESOURCE_US);
          eachNetNewSowInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
        }
        eachNetNewSowAmt += parseInt(netNewData.SOW_AMOUNT);
        eachNetNewSowActAmt += parseInt(netNewData.ACTUAL_AMOUNT);
        eachNetNewSowPrjAmt += parseInt(netNewData.PROJECTED_AMOUNT);
        newRow++;
        $('#sow_emp_details').append(typeHtml);
      })
      currentNew.sort((a,b) => a.SOW_ID <  b.SOW_ID ? -1 : 1);
      let currnewgr = groupBy(currentNew, 'SOW_ID');
      var newArr = [];
      Object.keys(currnewgr).forEach(key => {
        currnewgr[key].sort((a,b) => new Date(a.ACTUAL_START_DATE) < new Date(b.ACTUAL_START_DATE) ? -1 : 1);
          newArr = [...newArr, ... currnewgr[key]];
      });
      currentNew = newArr;
      $.each(currentNew, function(i, netNewData){
        let sowAmount = netNewData.SOW_AMOUNT;
        let actualAmount = netNewData.ACTUAL_AMOUNT;
        let projAmount = netNewData.PROJECTED_AMOUNT;
        let probability = probabilityChange(netNewData.PROBABILITY);
        let probabilityData = probabilityClass(netNewData.PROBABILITY);
        let typeHtml = `<tr class="${accountName.replace(/ /g,"_")}_expand">
                            <td onClick="accountExpand(this)"><div class="sow_data_style_${probabilityData}">${netNewData.ACCOUNT_NAME}</div></td>
                            <td><div class="sow_data_name" onClick="sowAccDetails(this)" data-id='${JSON.stringify(netNewData)}'>${netNewData.SOW_NAME}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.SOW_STAGE}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${probability}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.SOW_TYPE}</div></td>
                            <td class="hide_column"><div class="sow_empty_data_style">${netNewData.PRICING_PLAN}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.LEGAL_START_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.LEGAL_END_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.BILLING_START_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.BILLING_END_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.ACTUAL_START_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.ACTUAL_END_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.NUMBER_OF_RESOURCE_US}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.NUMBER_OF_RESOURCE_IND}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">$${sowAmount.toLocaleString()}</div></td>
                            <td class="account_active"><div class="sow_data_style_${probabilityData}">$${actualAmount.toLocaleString()}</div></td>
                            <td class="account_active"><div class="sow_data_style_${probabilityData}">$${projAmount.toLocaleString()}</div></td>
                          </tr>`
        
        curNewSow += parseInt(netNewData.SOW_AMOUNT);
        curNetActual += parseInt(netNewData.ACTUAL_AMOUNT);
        curNetProjected += parseInt(netNewData.PROJECTED_AMOUNT);
        let resCurStatus = checkResCurDate(netNewData.ACTUAL_START_DATE, netNewData.ACTUAL_END_DATE);
        console.log("resCurStatus - "+resCurStatus);
        if(resCurStatus == true){
          curNewUsCan +=  parseInt(netNewData.NUMBER_OF_RESOURCE_US);
          curNewInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
          eachCurNewSowUSCAN += parseInt(netNewData.NUMBER_OF_RESOURCE_US);
          eachCurNewSowInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
        }
        eachCurNewSowAmt += parseInt(netNewData.SOW_AMOUNT);
        eachCurNewSowActAmt += parseInt(netNewData.ACTUAL_AMOUNT);
        eachCurNewSowPrjAmt += parseInt(netNewData.PROJECTED_AMOUNT);
        newRow++;
        $('#sow_emp_details').append(typeHtml);
      })
    
      current.sort((a,b) => a.SOW_ID <  b.SOW_ID ? -1 : 1);
      let currgr = groupBy(current, 'SOW_ID');
      let currNewArr = [];
      Object.keys(currgr).forEach(key => {
        currgr[key].sort((a,b) => new Date(a.ACTUAL_START_DATE) < new Date(b.ACTUAL_START_DATE) ? -1 : 1);
        currNewArr = [...currNewArr, ... currgr[key]];
      });
      current = currNewArr;
      $.each(current, function(i, netNewData){
        let sowAmount = netNewData.SOW_AMOUNT;
        let actualAmount = netNewData.ACTUAL_AMOUNT;
        let projAmount = netNewData.PROJECTED_AMOUNT;
        let probability = probabilityChange(netNewData.PROBABILITY);
        let probabilityData = probabilityClass(netNewData.PROBABILITY);
        let typeHtml = `<tr class="${accountName.replace(/ /g,"_")}_expand">
                            <td onClick="accountExpand(this)"><div class="sow_data_style_${probabilityData}">${netNewData.ACCOUNT_NAME}</div></td>
                            <td><div class="sow_data_name" onClick="sowAccDetails(this)" data-id='${JSON.stringify(netNewData)}'>${netNewData.SOW_NAME}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.SOW_STAGE}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${probability}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.SOW_TYPE}</div></td>
                            <td class="hide_column"><div class="sow_empty_data_style">${netNewData.PRICING_PLAN}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.LEGAL_START_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.LEGAL_END_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.BILLING_START_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.BILLING_END_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.ACTUAL_START_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${convert(netNewData.ACTUAL_END_DATE)}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.NUMBER_OF_RESOURCE_US}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">${netNewData.NUMBER_OF_RESOURCE_IND}</div></td>
                            <td><div class="sow_data_style_${probabilityData}">$${sowAmount.toLocaleString()}</div></td>
                            <td class="account_active"><div class="sow_data_style_${probabilityData}">$${actualAmount.toLocaleString()}</div></td>
                            <td class="account_active"><div class="sow_data_style_${probabilityData}">$${projAmount.toLocaleString()}</div></td>
                          </tr>`
        
        curSow += parseInt(netNewData.SOW_AMOUNT);
        curActual += parseInt(netNewData.ACTUAL_AMOUNT);
        curProjected += parseInt(netNewData.PROJECTED_AMOUNT);
        let resCurStatus = checkResCurDate(netNewData.ACTUAL_START_DATE, netNewData.ACTUAL_END_DATE);
        if(resCurStatus == true){
          curUsCan +=  parseInt(netNewData.NUMBER_OF_RESOURCE_US);
          curInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
          eachCurSowUSCAN += parseInt(netNewData.NUMBER_OF_RESOURCE_US);
          eachCurSowInd += parseInt(netNewData.NUMBER_OF_RESOURCE_IND);
        }
        eachCurSowAmt += parseInt(netNewData.SOW_AMOUNT);
        eachCurSowActAmt += parseInt(netNewData.ACTUAL_AMOUNT);
        eachCurSowPrjAmt += parseInt(netNewData.PROJECTED_AMOUNT);
        newRow++;
        $('#sow_emp_details').append(typeHtml);
      })
     
      let eachSowTotalUSCAN = eachNetNewSowUSCAN + eachCurNewSowUSCAN + eachCurSowUSCAN;
      let eachSowTotalInd = eachNetNewSowInd + eachCurNewSowInd + eachCurSowInd;
      let eachSowTotalAmt = eachNetNewSowAmt + eachCurNewSowAmt + eachCurSowAmt;
      let eachSowTotalActAmt = eachNetNewSowActAmt + eachCurNewSowActAmt + eachCurSowActAmt;
      let eachSowTotalPrjAmt = eachNetNewSowPrjAmt + eachCurNewSowPrjAmt + eachCurSowPrjAmt;
      let eachSowTotal = `<tr class="${accountName.replace(/ /g,"_")}_expand noExl">
                            <td rowspan="3" class="sow_empty_data_style_tot" onClick="accountExpand(this)">${accountName.replace(/ /g,"_")} Total</td>
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
                            <td class="active_sow_amount"><div class="sow_type_style actual_amt_net_new ">$${eachNetNewSowActAmt.toLocaleString()}</div></td>
                            <td class="active_sow_amount"><div class="sow_type_style proj_amt_net_new ">$${eachNetNewSowPrjAmt.toLocaleString()}</div></td>
                          </tr>
                          <tr class="${accountName.replace(/ /g,"_")}_expand noExl">
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
                            <td class="active_sow_amount"><div class="sow_type_style actual_amt_net_new ">$${eachCurNewSowActAmt.toLocaleString()}</div></td>
                            <td class="active_sow_amount"><div class="sow_type_style proj_amt_net_new ">$${eachCurNewSowPrjAmt.toLocaleString()}</div></td>
                          </tr>
                          <tr class="${accountName.replace(/ /g,"_")}_expand noExl">
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
                            <td class="active_sow_amount"><div class="sow_type_style actual_amt_net_new ">$${eachCurSowActAmt.toLocaleString()}</div></td>
                            <td class="active_sow_amount"><div class="sow_type_style proj_amt_net_new ">$${eachCurSowPrjAmt.toLocaleString()}</div></td>
                          </tr>
                          <tr class="${accountName.replace(/ /g,"_")}_expand noExl">
                            <td colspan="11" class="account_total_style factspan_final_tot_style">${accountName.replace(/ /g,"_")} Total</td>
                            <td class="account_total_style factspan_final_tot_style"><div>${eachSowTotalUSCAN}</div></td>
                            <td class="account_total_style factspan_final_tot_style"><div>${eachSowTotalInd}</div></td>
                            <td class="account_total_style factspan_final_tot_style"><div>$${eachSowTotalAmt.toLocaleString()}</div></td>
                            <td class="account_total_style factspan_final_tot_style active_sow_amount"><div>$${eachSowTotalActAmt.toLocaleString()}</div></td>
                            <td class="account_total_style factspan_final_tot_style active_sow_amount"><div>$${eachSowTotalPrjAmt.toLocaleString()}</div></td>  
                          </tr>`
      $('#sow_emp_details').append(eachSowTotal);
      $('#sow_emp_details').append(`<tr class="${accountName.replace(/ /g,"_")} noExl">
                                      <td colspan="16" class="hr_line"><hr></td>
                                    </tr>`);
      let class_hide = accountName.replace(/ /g,"_")+"_expand";
      $("."+class_hide).hide();
      let net_us = `#us_res_${accountName.replace(/ /g,"_")}_net_new_${i}`;
      let net_ind = `#ind_res_${accountName.replace(/ /g,"_")}_net_new_${i}`
      $(net_us).html(eachNetNewSowUSCAN);
      $(net_ind).html(eachNetNewSowInd);
      let cur_new_us = `#us_res_${accountName.replace(/ /g,"_")}_current_-_new_${i}`
      let cur_new_ind = `#ind_res_${accountName.replace(/ /g,"_")}_current_-_new_${i}`
      $(cur_new_us).html(eachCurNewSowUSCAN);
      $(cur_new_ind).html(eachCurNewSowInd);
      let cur_us = `#us_res_${accountName.replace(/ /g,"_")}_current_${i}`
      let cur_ind = `#ind_res_${accountName.replace(/ /g,"_")}_current_${i}`
      $(cur_us).html(eachCurSowUSCAN);
      $(cur_ind).html(eachCurSowInd);
      
      $(`#us_tot_${accountName.replace(/ /g,"_")}`).html(eachSowTotalUSCAN);
      $(`#ind_tot_${accountName.replace(/ /g,"_")}`).html(eachSowTotalInd);
      factNetNewUSTot += eachNetNewSowUSCAN;
      factNetNewINDTot += eachNetNewSowInd;
      factCurNewUSTot += eachCurNewSowUSCAN;
      factCurNewINDTot += eachCurNewSowInd;
      factCurUSTot += eachCurSowUSCAN;
      factCurINDTot += eachCurSowInd;
      factspanUsCan_tot = factNetNewUSTot+factCurNewUSTot+factCurUSTot;
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
            </tr>`
  $('#sow_emp_details').append(sowTypeTotal);
  
  let factspan_final_tot = `<tr class="factspan_total noExl">
                          <td colspan="11" class="account_total_style factspan_final_tot_style">Factspan Total</td>
                          <td class="account_total_style factspan_final_tot_style"><div>${factspanUsCan_tot}</div></td>
                          <td class="account_total_style factspan_final_tot_style"><div>${factspanInd_tot}</div></td>
                          <td class="account_total_style factspan_final_tot_style"><div>$${factspan_total.toLocaleString()}</div></td>
                          <td class="account_total_style factspan_final_tot_style active_sow_amount"><div>$${factspanActual_tot.toLocaleString()}</div></td>
                          <td class="account_total_style factspan_final_tot_style active_sow_amount"><div>$${factspanProjected_tot.toLocaleString()}</div></td>  
                        </tr>
                        `
      $('#sow_emp_details').append(factspan_final_tot);

  $(".active_sow_amount").hide();
  $(".account_active").hide();
  $(".hr_line").attr("colspan","14");
}

function commafy( num ) {
  num.toString().replace( /\B(?=(?:\d{3})+)$/g, "," );
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

function statusCheck(obj){
  let lead = "", qualified = "", proposal = "", signed = "", pre_qualified = "", renewal = "", lost = "";
  let filterStatus = false;
  if($('#lead_data').is(':checked') == true){
    lead = "Lead";
    filterStatus = true;
  }
  if($('#qualified_data').is(':checked') == true){
    qualified = "Qualified";
    filterStatus = true;
  }
  if($('#proposal_data').is(':checked') == true){
    proposal = "Proposal";
    filterStatus = true;
  }
  if($('#sign_data').is(':checked') == true){
    signed = "Signed";
    filterStatus = true;
  }
  if($('#pre_qualified_data').is(':checked') == true){
    pre_qualified = "Pre-Qualified";
    filterStatus = true;
  }
  if($('#renewal_data').is(':checked') == true){
    renewal = "Renewal";
    filterStatus = true;
  }
  if($('#lost_data').is(':checked') == true){
    lost = "Lost";
    filterStatus = true;
  }
  let status_array = [];
  if(filterStatus == true){
    status_array = sowFullData.filter(item => {
      return item.ACCOUNT_DATA.some(aItem => 
          aItem.SOW_TYPE_DATA.find(sItem => {
            return (sItem.SOW_STAGE === lead || sItem.SOW_STAGE === signed || sItem.SOW_STAGE === proposal || sItem.SOW_STAGE === qualified || sItem.SOW_STAGE === renewal || sItem.SOW_STAGE === pre_qualified || sItem.SOW_STAGE === lost)
          }
        )
      )          
    });
  }else{
    status_array = sowFullData.filter(item => {
      return item.ACCOUNT_DATA.some(aItem => 
          aItem.SOW_TYPE_DATA.find(sItem => {
            return (sItem.SOW_STAGE === "Lead" || sItem.SOW_STAGE === "Qualified" || sItem.SOW_STAGE === "Proposal" || sItem.SOW_STAGE === "Signed" || sItem.SOW_STAGE === "Pre-Qualified" || sItem.SOW_STAGE === "Renewal" || sItem.SOW_STAGE === "Lost")
          }
        )
      )          
    });
  }

  let className = $("#iconToggle").attr('class');
  if(className == 'fa fa-sort-alpha-asc'){
    let sow = sortSowDetails(status_array ,'ACCOUNT_NAME', true);
    createSowTableData(sow);
  }else if(className == 'fa fa-sort-alpha-asc fa-sort-alpha-desc'){
    let sow = sortSowDetails(status_array ,'ACCOUNT_NAME', false);
    createSowTableData(sow);
  }
  
  // createSowTableData(status_array);

}

function accountExpand(obj){
  let accountNameSelect = $(obj).closest('tr').children('td:eq(0)').text().trim();
  accountNameSelect = accountNameSelect.replace(/ /g,"_");
  let expClassName = accountNameSelect+"_expand";
  let collClassName = accountNameSelect+"_collapse";
 
  $("."+expClassName).hide();
  $("."+collClassName).show();
}

function accountCollapse(obj){
  let accountNameSelect = $(obj).closest('tr').children('td:eq(0)').text().trim();
  accountNameSelect = accountNameSelect.replace(/ /g,"_");
  let expClassName = accountNameSelect+"_expand";
  let collClassName = accountNameSelect+"_collapse";

  $("."+expClassName).show();
  $("."+collClassName).hide();
}

function sowAccDetails(obj){
  let idData = $(obj).attr("data-id");

  localStorage.setItem("sow-acc-data", idData);
  window.location.href = 'sow.html';
}

function downloadExcel(){
  let today = new Date();
  let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
  let CurrentDateTime = date+'_'+time;


  $("#sow_emp_details").remove(".noExl").table2excel({
    // exclude CSS class
    exclude:".noExl",
    name:"SOW Details",
    filename:"sow_details_"+CurrentDateTime,
    fileext:".xls" 
  });
}

function sortSowDetails(sowData ,prop, asc) {
  sowData.sort(function(a, b) {
      if (asc) {
          return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
      } else {
          return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
      }
  });
  return sowData;
}

function sowAccountSort(){
  $(".fa-sort-alpha-asc").toggleClass("fa-sort-alpha-desc");
  let className = $("#iconToggle").attr('class');
  if(className == 'fa fa-sort-alpha-asc'){
    let sow = sortSowDetails(sortSowData ,'ACCOUNT_NAME', true);
    createSowTableData(sow);
  }else if(className == 'fa fa-sort-alpha-asc fa-sort-alpha-desc'){
    let sow = sortSowDetails(sortSowData ,'ACCOUNT_NAME', false);
    createSowTableData(sow);
  }
}

function showAmountCol(){
  // if($('#sign_data').is(':checked') == true){
  //   $(".fa fa-chevron-right").toggleClass(".fa fa-chevron-left");
  //   let headerColumn = $("#headerColumn").attr('class');
  //   console.log("Show Hide");
  //   console.log("headerColumn - "+headerColumn);
  //   if(headerColumn == "fa fa-chevron-right"){
  //     $(".active_sow_amount").show();
  //     $(".account_active").show();
  //     $("#headerColumn").removeClass("fa fa-chevron-right");
  //     $("#headerColumn").addClass("fa fa-chevron-left");
  //   }else if(headerColumn == "fa fa-chevron-left"){
  //     $(".active_sow_amount").hide();
  //     $(".account_active").hide();
  //     $("#headerColumn").removeClass("fa fa-chevron-left");
  //     $("#headerColumn").addClass("fa fa-chevron-right");
  //   }
  // }
}

function checkResCurDate(start, end){
  let starDate = new Date(start);
  let endDate = new Date(end);
  let today = new Date();

  let result = false;
  if(today >= starDate && today <= endDate){
    result = true;
  }
  return result;
}

function probabilityChange(prob){
  let probabilityData = prob;
        if(probabilityData == "100"){
          probabilityData = "100%"
        }else if(probabilityData == "70"){
          probabilityData = "> 70%"
        }else if(probabilityData == "> 70%"){
          probabilityData = "> 70%"
        }else if(probabilityData == "> 70"){
          probabilityData = "> 70%"
        }else if(probabilityData == "30 to 50"){
          probabilityData = "30% to 50%"
        }else if(probabilityData == "10"){
          probabilityData = "10%"
        }
  return probabilityData;
}

function probabilityClass(prob){
  let probabilityData = prob;
        if(probabilityData == "100%"){
          probabilityData = "100"
        }else if(probabilityData == "70%"){
          probabilityData = "70"
        }else if(probabilityData == "> 70%"){
          probabilityData = "70"
        }else if(probabilityData == "> 70"){
          probabilityData = "70"
        }else if(probabilityData == "30% to 50%"){
          probabilityData = "30 to 50"
        }else if(probabilityData == "10%"){
          probabilityData = "10"
        }
  return probabilityData;
}

function sortJSON(arr, key, way) {
  return arr.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      if (way === '123') { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
      if (way === '321') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
  });
}

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};