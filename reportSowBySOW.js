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
          getSowAmtData();
          $('.input-group-addon').hide();
          $(".loader").css("display", "none");
          $(".show_page").css("display", "block");

          setTimeout(function () {
            $('#report_details').addClass('active');
            $("#sow_amt_by_sow").addClass('active');
            $("#sow_main").addClass('active');
            $("#sow_amt_menu").addClass('active');
          }, 500);
        } else {
          window.location.href = "home.html"
        }
      } else {
        window.location.href = "home.html"
      }
    } else {
      window.location.href = "home.html"
    }
  }
  $(".new-sub-menu").hover(function () {
    $('.sub-menu').css('display', '')

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
  $('#logout').click(function () {
    localStorage.clear();

    window.location.href = 'index.html';
    return false;
  });
  $('#reportsBackBtn').click(function () {

    window.location.href = 'reportsDashboard.html';
    return false;
  });
});
let sowAmtbySow = [];
let sowAmtbySowActual = [];
let accountLevelData = [];
let overallLevelData = [];
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();

function getSowAmtData() {
  const d = new Date();
  let year = d.getFullYear();
  let shortYr = year.toString().substr(-2);
  $("#previousYr").val(shortYr - 1);
  $("#previousYr_label").html(year - 1);
  $("#currentYr").val(shortYr);
  $("#currentYr_label").html(year);
  $("#futureYr").val((year + 1).toString().substr(-2));
  $("#futureYr_label").html(year + 1);
  const startTime = performance.now();
  let empId = localStorage.getItem('EmpUserID');
  let emp_dep = localStorage.getItem('Department');

  $.ajax({
    url: apiValue.url_ip + ":5003/amount_by_sow_projected",
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: 'no-cors',
    data: JSON.stringify({
      // query_type: "sow_report_by_sow_level",
      "environment": apiValue.environment,
      "emp_id": empId,
      "department": emp_dep
    }),
    success: function (dataJson) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(loadTimeInSeconds,"reportSowBySow","Reports","amount_by_sow_projected","success",fileName,"reportSowBySow","view");
      sowAmtbySow = dataJson;
      sowAmtbySow.map((yr, index) => {
        $('.year_radio_filter').append(`<input type="radio" name="year_filter" id="year_${yr.YEAR}" class="emp_select" value="${yr.YEAR}"
        onclick="sowGetByAccount()">
      <label for="year_${yr.YEAR}" id="year_${yr.YEAR}_label">${yr.YEAR}</label>`)
      })
      const d = new Date();
      let year = d.getFullYear();
      $("#year_" + year).attr("checked", true)
      let selectedYearval = "";
      let selectedYr = $("input[type='radio'][name='year_filter']:checked").val();
      if (selectedYr.length > 0) {
        selectedYearval = selectedYr;
      }
      let yearData = []
      sowAmtbySow.map(ra => {
        if (ra.YEAR == year) {
          yearData = ra.YEAR_DATA
        }
        return yearData
      })
      let shortNewYr = selectedYearval.toString().substr(-2);
      getSowAmtBySowJson(yearData, shortNewYr);
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(loadTimeInSeconds,"reportSowBySow","Reports","amount_by_sow_projected","error",fileName,"reportSowBySow","view");
      console.log('message Error' + JSON.stringify(error));
    }
  });
}

function getSowAmtActualData() {
  let empId = localStorage.getItem('EmpUserID');
  let emp_dep = localStorage.getItem('Department');
  $.ajax({
    url: apiValue.url_ip + ":5003/amount_by_sow_actual",
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: 'no-cors',
    data: JSON.stringify({
      // query_type: "sow_actual_report_by_sow_level",
      "environment": apiValue.environment,
      "emp_id": empId,
      "department": emp_dep
    }),
    success: function (dataJson) {
      sowAmtbySowActual = dataJson;
      let selectedYearval = "";
      let selectedYr = $("input[type='radio'][name='year_filter']:checked").val();
      if (selectedYr.length > 0) {
        selectedYearval = selectedYr;
      }
      let yearData = []
      sowAmtbySowActual.map(ra => {
        if (ra.YEAR == selectedYearval) {
          yearData = ra.YEAR_DATA
        }
        return yearData
      })
      let shortNewYr = selectedYearval.toString().substr(-2);
      getSowAmtBySowJson(yearData, shortNewYr);
    },
    error: function (error) {
      console.log('message Error' + JSON.stringify(error));
    }
  });
}

function getSowAmtBySowJson(sowAccBySowData, selectedYearval) {
  $("#sow_by_level_data tbody").empty();
  $("#report_sow_acc_signed").empty()
  console.log("sowAccBySowData - ",sowAccBySowData)
  let header = `<th class='noWrap'>Account</th>
                <th class='noWrap'>SOW Name</th>
                <th class='noWrap'>SOW Type</th>
                <th class='noWrap'>Billing Type</th>
                <th class='noWrap'>Probability</th>
                <th class='noWrap'>Jan-${selectedYearval}</th>
                <th class='noWrap'>Feb-${selectedYearval}</th>
                <th class='noWrap'>Mar-${selectedYearval}</th>
                <th class='noWrap'>Apr-${selectedYearval}</th>
                <th class='noWrap'>May-${selectedYearval}</th>
                <th class='noWrap'>Jun-${selectedYearval}</th>
                <th class='noWrap'>Jul-${selectedYearval}</th>
                <th class='noWrap'>Aug-${selectedYearval}</th>
                <th class='noWrap'>Sep-${selectedYearval}</th>
                <th class='noWrap'>Oct-${selectedYearval}</th>
                <th class='noWrap'>Nov-${selectedYearval}</th>
                <th class='noWrap'>Dec-${selectedYearval}</th>
                <th><b>Total</b></th>
                <th><b>Status</b></th>`
  $("#report_sow_acc_signed").html(header)
  accountLevelData = sowAccBySowData.ACCOUNT_LEVEL_DATA;
  console.log("accountLevelData - ",accountLevelData);
  overallLevelData = sowAccBySowData.OVERALL_LEVEL_DATA;
  $.each(accountLevelData, function (accVal, accLevData) {
    let sowAccBySowHtml = '';
    let sowLevelData = accLevData.SOW_LEVEL_DATA;
    let sowLevelLen = sowLevelData.length;
    let sowAccTotalData = accLevData.ACCOUNT_TOTAL_DATA;
    let accSigTotal = sowAccTotalData.Signed_Total;
    let accSigLen = accSigTotal.length;
    let overallSigned = sowAccTotalData.SIGNED_OVERALL_TOTAL;
    let overallSignedLen = overallSigned.length
    if(overallSignedLen > 0){
      overallSignedLen = 1
    }else{
      overallSignedLen = 0
    }
    let renewalTotal = sowAccTotalData.Renewal_Total;
    let renewalTotalLen = 0;
    if (renewalTotal != undefined) {
      renewalTotalLen = renewalTotal.length;
    }
    let proposalTotal = sowAccTotalData.Proposal_Total;
    let proposalTotalLen = 0;
    if (proposalTotal != undefined) {
      proposalTotalLen = proposalTotal.length;
    }
    let qualifiedTotal = sowAccTotalData.Qualified_Total;
    let qualifiedTotalLen = 0;
    if (qualifiedTotal != undefined) {
      qualifiedTotalLen = qualifiedTotal.length;
    }
    let prequalifiedTotal = sowAccTotalData.Pre_Qualified_Total;
    let prequalifiedTotalLen = 0;
    if (prequalifiedTotal != undefined) {
      prequalifiedTotalLen = prequalifiedTotal.length;
    }
    let allGreenTotal = sowAccTotalData.ALL_GREEN_TOTAL;
    let finalRowLenAcc = sowLevelLen + accSigLen + overallSignedLen + renewalTotalLen + proposalTotalLen + qualifiedTotalLen + 1 + prequalifiedTotalLen;
    let AccountNameHtml = `<td class="account_bg" style="color:#000000 !important" rowspan='${finalRowLenAcc}'>${accLevData.ACCOUNT_NAME}</td>`
    $.each(sowLevelData, function (sowVal, sowEachData) {
      let sowMonthData = sowEachData.SOW_DATA;
      let sowMonthHtml = "";
      $.each(sowMonthData, function (i, sowMonth) {
        let sowMnt = (sowMonth.MONTH).split('_');
        if (sowMnt[sowMnt.length - 1] == selectedYearval) {
          sowMonthHtml += `<td>$${(Math.round(sowMonth.VALUE)).toLocaleString()}</td>`
        }
      });
      let statusValue = sowEachData.SOW_STATUS;
      if (statusValue.toLowerCase() == "signed") {
        sowAccBySowHtml += `<tr class="top_broder_bg">
                                        ${sowVal == 0 ? AccountNameHtml : ""}
                                        <td onclick='sowAccDetails(this)' data-id='${JSON.stringify(
                                          sowEachData
                                        )}' class="wordBreak"><div class='sow_data_name_all'>${
          sowEachData.SOW_NAME
        }</div></td>
                                        <td>${sowEachData.SOW_TYPE}</td>
                                        <td>${sowEachData.BILLING_MODEL}</td>
                                        <td>${sowEachData.PROBABILITY}</td>
                                        ${sowMonthHtml}
                                        <td>${statusValue}</td>`
      } else if (statusValue.toLowerCase() == "renewal") {
        sowAccBySowHtml += `<tr class="renewal_bg top_broder_bg">
                                        ${sowVal == 0 ? AccountNameHtml : ""}
                                        <td onclick='sowAccDetails(this)' data-id='${JSON.stringify(
                                          sowEachData
                                        )}' class="wordBreak"><div class='sow_data_name_all'>${
          sowEachData.SOW_NAME
        }</div></td>
                                        <td>${sowEachData.SOW_TYPE}</td>
                                        <td>${sowEachData.BILLING_MODEL}</td>
                                        <td>${sowEachData.PROBABILITY}</td>
                                        ${sowMonthHtml}
                                        <td>${statusValue}</td>`
      } else if (statusValue.toLowerCase() == "proposal") {
        sowAccBySowHtml += `<tr class="proposal_bg top_broder_bg">
                                        ${sowVal == 0 ? AccountNameHtml : ""}
                                        <td onclick='sowAccDetails(this)' data-id='${JSON.stringify(
                                          sowEachData
                                        )}' class="wordBreak"><div class='sow_data_name_all'>${
          sowEachData.SOW_NAME
        }</div></td>
                                        <td>${sowEachData.SOW_TYPE}</td>
                                        <td>${sowEachData.BILLING_MODEL}</td>
                                        <td>${sowEachData.PROBABILITY}</td>
                                        ${sowMonthHtml}
                                        <td>${statusValue}</td>`
      } else if (statusValue.toLowerCase() == "qualified") {
        sowAccBySowHtml += `<tr class="proposal_bg top_broder_bg">
                                        ${sowVal == 0 ? AccountNameHtml : ""}
                                        <td onclick='sowAccDetails(this)' data-id='${JSON.stringify(
                                          sowEachData
                                        )}' class="wordBreak"><div class='sow_data_name_all'>${
          sowEachData.SOW_NAME
        }</div></td>
                                        <td>${sowEachData.SOW_TYPE}</td>
                                        <td>${sowEachData.BILLING_MODEL}</td>
                                        <td>${sowEachData.PROBABILITY}</td>
                                        ${sowMonthHtml}
                                        <td>${statusValue}</td>`
      }  else if (statusValue.toLowerCase() == "pre_qualified") {
        sowAccBySowHtml += `<tr class="proposal_bg top_broder_bg">
                                        ${sowVal == 0 ? AccountNameHtml : ""}
                                        <td onclick='sowAccDetails(this)' data-id='${JSON.stringify(
                                          sowEachData
                                        )}' class="wordBreak"><div class='sow_data_name_all'>${
          sowEachData.SOW_NAME
        }</div></td>
                                        <td>${sowEachData.SOW_TYPE}</td>
                                        <td>${sowEachData.BILLING_MODEL}</td>
                                        <td>${sowEachData.PROBABILITY}</td>
                                        ${sowMonthHtml}
                                        <td>${statusValue}</td>`
      } else {
        sowAccBySowHtml += `<tr class="proposal_bg top_broder_bg">
                                        ${sowVal == 0 ? AccountNameHtml : ""}
                                        <td onclick='sowAccDetails(this)' data-id='${JSON.stringify(
                                          sowEachData
                                        )}' class="wordBreak"><div class='sow_data_name_all'>${
          sowEachData.SOW_NAME
        }</div></td>
                                        <td>${sowEachData.SOW_TYPE}</td>
                                        <td>${sowEachData.BILLING_MODEL}</td>
                                        <td>${sowEachData.PROBABILITY}</td>
                                        ${sowMonthHtml}
                                        <td>${statusValue}</td>`
      }
    });
    $('#sow_by_level_data').append(sowAccBySowHtml);

    let accSignValHtml = "";
    $.each(accSigTotal, function (accSignindex, accSignVal) {
      let accSignValSow = accSignVal.SOW_DATA;
      let accSowHtml = "";
      $.each(accSignValSow, function (j, accSow) {
        let sowMnt = (accSow.MONTH).split('_');
        if (sowMnt[sowMnt.length - 1] == selectedYearval) {
          accSowHtml += `<td>$${(Math.round(accSow.VALUE)).toLocaleString()}</td>`
        }
      })
      accSignValHtml = `<tr class="top_broder_bg">
                                    ${accSignindex == 0 ? `<td rowspan="${accSigLen}">Total</td>` : ""}
                                    <td>${accSignVal.SOW_TYPE}</td>
                                    <td>-</td>
                                    <td>-</td>
                                    ${accSowHtml}
                                    ${accSignindex == 0 ? `<td rowspan="${accSigLen}">${accSignVal.SOW_STATUS}</td>` : ""}
                                </tr>`
      $('#sow_by_level_data').append(accSignValHtml);
    });

    let overallSignedHtml = "";
    console.log("overallSigned - ",overallSigned)
    if(overallSigned.length > 0){
      let overSigned = overallSigned[0].SOW_DATA;
      let overallSowHtml = "";
      $.each(overSigned, function (j, overSow) {
        let sowMnt = (overSow.MONTH).split('_');
        if (sowMnt[sowMnt.length - 1] == selectedYearval) {
          overallSowHtml += `<td>$${(Math.round(overSow.VALUE)).toLocaleString()}</td>`
        }
      })
      overallSignedHtml += `<tr class="overall_total_bg top_broder_bg">
                                      <td>Overall Total</td>
                                      <td></td>
                                      <td></td>
                                      <td></td>
                                      ${overallSowHtml}
                                      <td>${overallSigned[0].SOW_STATUS}</td>
                                  </tr>`
      $('#sow_by_level_data').append(overallSignedHtml);
    }

    if (renewalTotalLen > 0) {
      let renewalValHtml = "";
      $.each(renewalTotal, function (accIndexValue, renewalVal) {
        let renewalValSow = renewalVal.SOW_DATA;
        let accSowHtml = "";
        $.each(renewalValSow, function (j, accSow) {
          let sowMnt = (accSow.MONTH).split('_');
          if (sowMnt[sowMnt.length - 1] == selectedYearval) {
            accSowHtml += `<td>$${(Math.round(accSow.VALUE)).toLocaleString()}</td>`
          }
        })
        renewalValHtml = `<tr class="renewal_bg top_broder_bg">
                                        ${accIndexValue == 0 ? `<td rowspan="${renewalTotalLen}">Total</td>` : ""}
                                        <td>${renewalVal.SOW_TYPE}</td>
                                        <td>-</td>
                                        <td>-</td>
                                        ${accSowHtml}
                                        <td>${renewalVal.SOW_STATUS}</td>
                                    </tr>`
        $('#sow_by_level_data').append(renewalValHtml);
      });
    }

    if (proposalTotalLen > 0) {
      let proposalValHtml = "";
      $.each(proposalTotal, function (proIndexValue, proposalVal) {
        let proposalValSow = proposalVal.SOW_DATA;
        let accSowHtml = "";
        $.each(proposalValSow, function (j, proposalSow) {
          let sowMnt = (proposalSow.MONTH).split('_');
          if (sowMnt[sowMnt.length - 1] == selectedYearval) {
            accSowHtml += `<td>$${(Math.round(proposalSow.VALUE)).toLocaleString()}</td>`
          }
        })
        proposalValHtml = `<tr class="proposal_bg top_broder_bg">
                                        ${proIndexValue == 0 ? `<td rowspan="${proposalTotalLen}">Total</td>` : ""}
                                        <td>${proposalVal.SOW_TYPE}</td>
                                        <td>-</td>
                                        <td>-</td>
                                        ${accSowHtml}
                                        <td>${proposalVal.SOW_STATUS}</td>
                                    </tr>`
        $('#sow_by_level_data').append(proposalValHtml);
      });
    }

    if (qualifiedTotalLen > 0) {
      let qualifiedValHtml = "";
      $.each(qualifiedTotal, function (quaIndexValue, qualifiedVal) {
        let qualifiedValSow = qualifiedVal.SOW_DATA;
        let accSowHtml = "";
        $.each(qualifiedValSow, function (j, qualiSow) {
          let sowMnt = (qualiSow.MONTH).split('_');
          if (sowMnt[sowMnt.length - 1] == selectedYearval) {
            accSowHtml += `<td>$${(Math.round(qualiSow.VALUE)).toLocaleString()}</td>`
          }
        })
        qualifiedValHtml = `<tr class="proposal_bg top_broder_bg">
                                        ${quaIndexValue == 0 ? `<td rowspan="${qualifiedTotalLen}">Total</td>` : ""}
                                        <td>${qualifiedVal.SOW_TYPE}</td>
                                        <td>-</td>
                                        <td>-</td>
                                        ${accSowHtml}
                                        <td>${qualifiedVal.SOW_STATUS}</td>
                                    </tr>`
        $('#sow_by_level_data').append(qualifiedValHtml);
      });
    }
    if (prequalifiedTotalLen > 0) {
      let prequalifiedTotalHtml = "";
      $.each(prequalifiedTotal, function (prequaIndexValue, prequalifiedVal) {
        let prequalifiedValSow = prequalifiedVal.SOW_DATA;
        let accSowHtml = "";
        $.each(prequalifiedValSow, function (j, prequaliSow) {
          let sowMnt = (prequaliSow.MONTH).split('_');
          if (sowMnt[sowMnt.length - 1] == selectedYearval) {
            accSowHtml += `<td>$${(Math.round(prequaliSow.VALUE)).toLocaleString()}</td>`
          }
        })
        prequalifiedTotalHtml = `<tr class="proposal_bg top_broder_bg">
                                        ${prequaIndexValue == 0 ? `<td rowspan="${prequalifiedTotalLen}">Total</td>` : ""}
                                        <td>${prequalifiedVal.SOW_TYPE}</td>
                                        <td>-</td>
                                        <td>-</td>
                                        ${accSowHtml}
                                        <td>${prequalifiedVal.SOW_STATUS}</td>
                                    </tr>`
        $('#sow_by_level_data').append(prequalifiedTotalHtml);
      });
    }

    let allGreenTotalHtml = "";
    console.log("allGreenTotal - ",allGreenTotal)
    if(allGreenTotal.length > 0){
      let allGreenSow = allGreenTotal[0].SOW_DATA;
      let allGreenHtml = "";
      $.each(allGreenSow, function (j, allGreenSowData) {
        let sowMnt = (allGreenSowData.MONTH).split('_');
        if (sowMnt[sowMnt.length - 1] == selectedYearval) {
          allGreenHtml += `<td>$${(Math.round(allGreenSowData.VALUE)).toLocaleString()}</td>`
        }
      })
      allGreenTotalHtml += `<tr class="overall_total top_broder_bg">
                                  <td>All Green + Signed</td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  ${allGreenHtml}
                                  <td></td>
                              </tr>`
      $('#sow_by_level_data').append(allGreenTotalHtml);
    }
    $('#sow_by_level_data').append(`<tr class="noExl"><td colspan="17"><hr></td></tr>`);
  })
  console.log("overallLevelData - ",overallLevelData)
  let signedTotalData = overallLevelData.SIGNED_TOTAL_TYPE_LEVEL;
  let signedTotalDataLen = signedTotalData.length;
  let signMonthlyOverallTotal = overallLevelData.SIGNED_MONTHLY_TOTAL;
  let signQuarOverallTotal = overallLevelData.SIGNED_QUAR_TOTAL;
  let overallMonthlyGreenTot = overallLevelData.ALL_GREEN_MONTHLY;
  let overallQuarGreenTot = overallLevelData.ALL_GREEN_QUAR;
  let overallTotalTypeLevel = overallLevelData.OVERALL_TOTAL_TYPE_LEVEL;
  let overallTotalTypeLen = overallTotalTypeLevel.length;
  let renewalProposalTypeLevel = overallLevelData.RENEWAL_PROPOSAL_TYPE_LEVEL;
  let renewakPropoaslTypeLen = renewalProposalTypeLevel.length;
  let overallTotalLen = signedTotalDataLen + 4 + renewakPropoaslTypeLen;

  let overallStatusSigned = false;
  if(signedTotalDataLen == 0) overallStatusSigned = true;
  if(signedTotalDataLen > 0){
    $.each(signedTotalData, function (signedValIndex, signedOverData) {
      let signedOverHtml = "";
      let signedOverallSowData = signedOverData.SOW_DATA;
      let signOverallSowHtml = "";
      $.each(signedOverallSowData, function (j, sigOverSow) {
        let sowMnt = (sigOverSow.MONTH).split('_');
        if (sowMnt[sowMnt.length - 1] == selectedYearval) {
          signOverallSowHtml += `<td>$${(Math.round(sigOverSow.VALUE)).toLocaleString()}</td>`
        }
      })
      signedOverHtml = `<tr class="top_broder_bg">
                            ${signedValIndex == 0 ? `<td rowspan="${overallTotalLen}">Overall</td>` : ""}
                            ${signedValIndex == 0 ? `<td rowspan="${signedTotalDataLen}">Total</td>` : ""}
                            <td>${signedOverData.SOW_TYPE}</td>
                            <td>-</td>
                            <td>-</td>
                            ${signOverallSowHtml}
                            <td>${signedOverData.SOW_STATUS}</td>
                          </tr>`
      $('#sow_by_level_data').append(signedOverHtml);
    })

    let signMonthlyOverallTotalHtml = "";
    let signMonthlySOW = signMonthlyOverallTotal.SOW_DATA;
    let signMonthlySOWHtml = "";
    let signMonthStatus = signMonthlyOverallTotal.SOW_STATUS;
    $.each(signMonthlySOW, function (j, overSow) {
      let sowMnt = (overSow.MONTH).split('_');
      if (sowMnt[sowMnt.length - 1] == selectedYearval) {
        signMonthlySOWHtml += `<td>$${(Math.round(overSow.VALUE)).toLocaleString()}</td>`
      }
    })
    signMonthlyOverallTotalHtml += `<tr class="overall_total_bg top_broder_bg">
                                      <td>Monthly Overall Total</td>
                                      <td></td>
                                      <td></td>
                                      <td></td>
                                      ${signMonthlySOWHtml}
                                      <td>${signMonthStatus}</td>
                                  </tr>`
    $('#sow_by_level_data').append(signMonthlyOverallTotalHtml);
  
    let signQuarOverallTotalHtml = "";
    let signQuarSOW = signQuarOverallTotal.SOW_DATA;
    let signQuarSOWHtml = "";
    let signQuarStatus = signQuarOverallTotal.SOW_STATUS;
    $.each(signQuarSOW, function (j, overQuarSow) {
      let sowMnt = (overQuarSow.MONTH).split('_');
      if (sowMnt[sowMnt.length - 1] == selectedYearval) {
        signQuarSOWHtml += `${overQuarSow.VALUE == "" ? `<td></td>` : `<td>$${(overQuarSow.VALUE).toLocaleString()}</td>`}`;
      }
    })
    signQuarOverallTotalHtml = `<tr class="overall_total_bg top_broder_bg">
                                      <td>Quarterly Overall Total</td>
                                      <td></td>
                                      <td></td>
                                      <td></td>
                                      ${signQuarSOWHtml}
                                      <td>${signQuarStatus}</td>
                                  </tr>`
    $('#sow_by_level_data').append(signQuarOverallTotalHtml);
  }


  let overallMonthlyGreenTotalHtml = "";
  let overallMonthlySOW = overallMonthlyGreenTot.SOW_DATA;
  let overallMonthlySOWHtml = "";
  $.each(overallMonthlySOW, function (j, greenMonthSow) {
    let sowMnt = (greenMonthSow.MONTH).split('_');
    if (sowMnt[sowMnt.length - 1] == selectedYearval) {
      overallMonthlySOWHtml += `<td>$${(Math.round(greenMonthSow.VALUE)).toLocaleString()}</td>`
    }
  })
  overallMonthlyGreenTotalHtml = `<tr class="renewal_bg top_broder_bg">
                                    ${overallStatusSigned && `<td rowspan="${renewakPropoaslTypeLen*2+renewalProposalTypeLevel.length}" style="background-color: white;
                                    color: black !important;">Overall</td>`}
                                    <td>Monthly All Green + Signed</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    ${overallMonthlySOWHtml}
                                    <td></td>
                                </tr>`
  $('#sow_by_level_data').append(overallMonthlyGreenTotalHtml);

  let overallQuarGreenTotalHtml = "";
  let overallQuarSOW = overallQuarGreenTot.SOW_DATA;
  let overallQuarSOWHtml = "";
  $.each(overallQuarSOW, function (j, greenQuarSow) {
    let sowMnt = (greenQuarSow.MONTH).split('_');
    if (sowMnt[sowMnt.length - 1] == selectedYearval) {
      overallQuarSOWHtml += `${greenQuarSow.VALUE == "" ? `<td></td>` : `<td>$${(Math.round(greenQuarSow.VALUE)).toLocaleString()}</td>`}`;
    }
  })
  overallQuarGreenTotalHtml = `<tr class="renewal_bg top_broder_bg">
                                    <td>Quarterly All Green + Singed</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    ${overallQuarSOWHtml}
                                    <td></td>
                                </tr>`
  $('#sow_by_level_data').append(overallQuarGreenTotalHtml);
  $.each(renewalProposalTypeLevel, function (renwalallValIndex, RenewalTotalData) {
    let RenewalallTotalHtml = "";
    let RenewalallTotalSowData = RenewalTotalData.SOW_DATA;
    let RenewalallTotalSowHtml = "";
    $.each(RenewalallTotalSowData, function (j, OverSow) {
      let sowMnt = (OverSow.MONTH).split('_');
      if (sowMnt[sowMnt.length - 1] == selectedYearval) {
        RenewalallTotalSowHtml += `<td>$${(Math.round(OverSow.VALUE)).toLocaleString()}</td>`
      }
    })
    RenewalallTotalHtml = `<tr class="proposal_bg top_broder_bg">
                          ${renwalallValIndex == 0 ? `<td rowspan="${renewakPropoaslTypeLen}">Total Green</td>` : ""}
                          <td>${RenewalTotalData.SOW_TYPE}</td>
                          <td>-</td>
                          <td>-</td>
                          ${RenewalallTotalSowHtml}
                          <td></td>
                        </tr>`
    $('#sow_by_level_data').append(RenewalallTotalHtml);
  })
}

function sowGetByAccount() {
  var selectedVal = "";
  var selected = $("input[type='radio'][name='sow_amount_by_acc']:checked").val();
  if (selected.length > 0) {
    selectedVal = selected;
  }
  if (selectedVal == "Planned") {
    if (sowAmtbySow.length == 0) {
      getSowAmtData();
    } else {
      let selectedYearval = "";
      let selectedYr = $("input[type='radio'][name='year_filter']:checked").val();
      if (selectedYr.length > 0) {
        selectedYearval = selectedYr;
      }
      let yearData = []
      let selectYearData = sowAmtbySow.map(ra => {
        if (ra.YEAR == selectedYr) {
          yearData = ra.YEAR_DATA
        }
        return yearData
      })
      let shortNewYr = selectedYearval.toString().substr(-2);
      getSowAmtBySowJson(yearData, shortNewYr);
    }

  } else if (selectedVal == "Actual") {
    if (sowAmtbySowActual.length == 0) {
      getSowAmtActualData()
    } else {
      let selectedYearval = "";
      let selectedYr = $("input[type='radio'][name='year_filter']:checked").val();
      if (selectedYr.length > 0) {
        selectedYearval = selectedYr;
      }
      let yearData = []
      let selectYearData = sowAmtbySowActual.map(ra => {
        if (ra.YEAR == selectedYr) {
          yearData = ra.YEAR_DATA
        }
        return yearData
      })
      let shortNewYr = selectedYearval.toString().substr(-2);
      getSowAmtBySowJson(yearData, shortNewYr);
    }
  }

}

function downloadExcel() {
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
  let CurrentDateTime = date + '_' + time;
  $("#sow_by_level_data").remove(".noExl").table2excel({
    exclude: ".noExl",
    name: "Reports SOW By SOW",
    filename: "reports_Sow_By_SOW_" + CurrentDateTime,
    fileext: ".xls",
  });
}

function sowAccDetails(obj) {
  let idData = $(obj).attr("data-id");
  let idClickSoruce = $(obj).attr("data-id1");
  console.log("idData - ", idData);
  console.log("idClickSoruce - ", idClickSoruce);
  let tempArr = JSON.parse(idData);
  console.log("tempArr - ", tempArr);
  let uniqId_sowid = tempArr.UNIQUE_ID + "&" + tempArr.SOW_ID;
  // localStorage.setItem("urlStoredSOWUrldata", uniqId_sowid);
  // localStorage.setItem("sow-acc-data", idData);
  // localStorage.setItem("sow-click-source", idClickSoruce);
  localStorage.setItem("sowBackBtnNav", "hplReport");
  window.open('sow.html?'+uniqId_sowid, '_blank');
}
