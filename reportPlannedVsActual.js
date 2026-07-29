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
                    assignPlannedActualData();
                    $('.input-group-addon').hide();
                    setTimeout(function () {
                        $('#report_details').addClass('active');
                        $("#sow_overall").addClass('active');
                        $("#sow_main").addClass('active');
                    }, 300);
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
    $('#reportsBackBtnCustm').click(function () {

        window.location.href = 'reportsDashboard.html';
        return false;
    });
    $('#logout').click(function () {
        localStorage.clear();

        window.location.href = 'index.html';
        return false;
    });
});
let plannedActualData = [];
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();

const getOverallSummaryJson = async () => {
    // let form_details = {
    //   "query_type": "revenue_page",
    //   "environment": apiValue.environment
    // };
    const startTime = performance.now();
    try {
        let data = await fetch(apiValue.url_ip + ":5003/planned_vs_actual", {
            method: "POST",
        });
        const result = await data.json();
        const endTime = performance.now();
        const loadTimeInSeconds = (endTime - startTime) / 1000;
        getApiTime(loadTimeInSeconds,"reportPlannedVsActual","Reports","planned_vs_actual","success",fileName,"reportPlannedVsActual","view");
        $(".loader").css("display", "none");
        $(".show_page").css("display", "block");
        plannedActualData = result;
        plannedActualData.map((yr, index) => {
            $('.year_radio_filter').append(`<input type="radio" name="year_filter" id="year_${yr.YEAR}" class="emp_select" value="${yr.YEAR}"
            onclick="assignPlannedActualData()">
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
        let selectYearData = plannedActualData.map(ra => {
            if (ra.YEAR == year) {
                yearData = ra.YEAR_DATA
            }
            return yearData
        })
        let shortNewYr = selectedYearval.toString().substr(-2);
        preparePlannedActual(yearData, shortNewYr);
        // handle result here
    } catch (error) {
        const endTime = performance.now();
        const loadTimeInSeconds = (endTime - startTime) / 1000;
        getApiTime(loadTimeInSeconds,"reportPlannedVsActual","Reports","planned_vs_actual","error",fileName,"reportPlannedVsActual","view");
        console.error("Error occurred while fetching data:", error);
        $(".loader").css("display", "none");
        $(".show_page").css("display", "block");
        // handle error here
    }

};


function assignPlannedActualData() {
    if (plannedActualData == 0) {
        getOverallSummaryJson();
    } else {
        const d = new Date();
        let year = d.getFullYear();
        let shortYr = year.toString().substr(-2);
        $("#previousYr").val(shortYr - 1);
        $("#previousYr_label").html(year - 1);
        $("#currentYr").val(shortYr);
        $("#currentYr_label").html(year);
        $("#futureYr").val((year + 1).toString().substr(-2));
        $("#futureYr_label").html(year + 1);
        let selectedYearval = "";
        let selectedYr = $("input[type='radio'][name='year_filter']:checked").val();
        if (selectedYr.length > 0) {
            selectedYearval = selectedYr;
        }
        let yearData = []
        let selectYearData = plannedActualData.map(ra => {
            if (ra.YEAR == selectedYr) {
                yearData = ra.YEAR_DATA
            }
            return yearData
        })
        let shortNewYr = selectedYearval.toString().substr(-2);
        preparePlannedActual(yearData, shortNewYr)
    }
}

function preparePlannedActual(plannedActualAllData, selectYr) {
    $("#report_overall_summary").empty();
    $("#report_overall_summary_body").empty();
    let AccountHeader = plannedActualAllData.HEADER_DATA;
    let accHeaderMnthHtml = "", accHeaderHtml = "";
    AccountHeader = AccountHeader.filter(head => {
        const splitHead = head.split('_')
        return splitHead[splitHead.length - 1] == selectYr
    })
    $.each(AccountHeader, function (i) {
        accHeaderMnthHtml += `<th>${AccountHeader[i].replace("_", "-")}</th>`;
    })
    $("#report_overall_summary").append(`
                                        <th>Account</th>
                                        <th></th>
                                        <th></th>
                                        ${accHeaderMnthHtml}
                                        <th>Total</th>
                                    `)
    let planDataBodyData = plannedActualAllData.ALL_ACCOUNT_DATA
    $.each(planDataBodyData, function (i, planActual) {
        let projectedData = planActual.PROEJECTED_DATA;
        let projCurrent = projectedData.PROJECTED_CURRENT;
        let projCurrentNew = projectedData.PROJECTED_CURRENT_NEW;
        let projNetNew = projectedData.PROJECTED_NET_NEW;
        let projNewLogo = projectedData.PROJECTED_NEW_LOGO;
        let projTotal = projectedData.PROJECTED_TOTAL;
        let projCurrHtml = "", projCurrNewHtml = "", projNetNewHtml = "", projNewLogoHtml = "", projTotalHtml = "", plannedLen = 0
        if (projCurrent != undefined) {
            $.each(projCurrent, function (l, ProCurr) {
                let dataYrFil = (ProCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (ProCurr.VALUE >= 0) {
                        projCurrHtml += `<td>$${(ProCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        projCurrHtml += `<td>-$${(-(ProCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            plannedLen++;
        }
        if (projCurrentNew != undefined) {
            $.each(projCurrentNew, function (l, ProCurr) {
                let dataYrFil = (ProCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (ProCurr.VALUE >= 0) {
                        projCurrNewHtml += `<td>$${(ProCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        projCurrNewHtml += `<td>-$${(-(ProCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            plannedLen++;
        }
        if (projNetNew != undefined) {
            $.each(projNetNew, function (l, ProCurr) {
                let dataYrFil = (ProCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (ProCurr.VALUE >= 0) {
                        projNetNewHtml += `<td>$${(ProCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        projNetNewHtml += `<td>-$${(-(ProCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            plannedLen++;
        }
        if (projNewLogo != undefined) {
            $.each(projNewLogo, function (l, ProCurr) {
                let dataYrFil = (ProCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (ProCurr.VALUE >= 0) {
                        projNewLogoHtml += `<td>$${(ProCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        projNewLogoHtml += `<td>-$${(-(ProCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            plannedLen++;
        }
        if (projTotal != undefined) {
            $.each(projTotal, function (l, ProCurr) {
                let dataYrFil = (ProCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (ProCurr.VALUE >= 0) {
                        projTotalHtml += `<td>$${(ProCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        projTotalHtml += `<td>-$${(-(ProCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            plannedLen++;
        }

        let actualData = planActual.ACTUAL_DATA;
        let actualCurrent = actualData.ACTUAL_CURRENT;
        let actualCurrentNew = actualData.ACTUAL_CURRENT_NEW;
        let actualNetNew = actualData.ACTUAL_NET_NEW;
        let actualNewLogo = actualData.ACTUAL_NEW_LOGO;
        let actualTotal = actualData.ACTUAL_TOTAL;
        let actualCurrHtml = "", actualCurrNewHtml = "", actualNetNewHtml = "", actualNewLogoHtml = "", actualTotalHtml = "", actualLen = 0;
        if (actualCurrent != undefined) {
            $.each(actualCurrent, function (l, actCurr) {
                let dataYrFil = (actCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (actCurr.VALUE >= 0) {
                        actualCurrHtml += `<td>$${(actCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        actualCurrHtml += `<td>-$${(-(actCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            actualLen++
        }
        if (actualCurrentNew != undefined) {
            $.each(actualCurrentNew, function (l, actCurr) {
                let dataYrFil = (actCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (actCurr.VALUE >= 0) {
                        actualCurrNewHtml += `<td>$${(actCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        actualCurrNewHtml += `<td>-$${(-(actCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            actualLen++
        }
        if (actualNetNew != undefined) {
            $.each(actualNetNew, function (l, actCurr) {
                let dataYrFil = (actCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (actCurr.VALUE >= 0) {
                        actualNetNewHtml += `<td>$${(actCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        actualNetNewHtml += `<td>-$${(-(actCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            actualLen++
        }
        if (actualNewLogo != undefined) {
            $.each(actualNewLogo, function (l, actCurr) {
                let dataYrFil = (actCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (actCurr.VALUE >= 0) {
                        actualNewLogoHtml += `<td>$${(actCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        actualNewLogoHtml += `<td>-$${(-(actCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            actualLen++
        }
        if (actualTotal != undefined) {
            $.each(actualTotal, function (l, actCurr) {
                let dataYrFil = (actCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (actCurr.VALUE >= 0) {
                        actualTotalHtml += `<td>$${(actCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        actualTotalHtml += `<td>-$${(-(actCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            actualLen++
        }
        let deltaData = planActual.DELTA_DATA;
        let deltaCurrent = deltaData.DELTA_CURRENT;
        let deltaCurrentNew = deltaData.DELTA_CURRENT_NEW;
        let deltaNetNew = deltaData.DELTA_NET_NEW;
        let deltaNewLogo = deltaData.DELTA_NEW_LOGO;
        let deltaTotal = deltaData.DELTA_TOTAL;
        let deltaCurrHtml = "", deltaCurrNewHtml = "", deltaNetNewHtml = "", deltaNewLogoHtml = "", deltaTotalHtml = "", deltaLen = 0;
        if (deltaCurrent != undefined) {
            $.each(deltaCurrent, function (l, delCurr) {
                let dataYrFil = (delCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (delCurr.VALUE >= 0) {
                        deltaCurrHtml += `<td>$${(delCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        deltaCurrHtml += `<td>-$${(-(delCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            }); 
            deltaLen++
        }
        if (deltaCurrentNew != undefined) {
            $.each(deltaCurrentNew, function (l, delCurr) {
                let dataYrFil = (delCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (delCurr.VALUE >= 0) {
                        deltaCurrNewHtml += `<td>$${(delCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        deltaCurrNewHtml += `<td>-$${(-(delCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            deltaLen++
        }
        if (deltaNetNew != undefined) {
            $.each(deltaNetNew, function (l, delCurr) {
                let dataYrFil = (delCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (delCurr.VALUE >= 0) {
                        deltaNetNewHtml += `<td>$${(delCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        deltaNetNewHtml += `<td>-$${(-(delCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            deltaLen++
        }
        if (deltaNewLogo != undefined) {
            $.each(deltaNewLogo, function (l, delCurr) {
                let dataYrFil = (delCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (delCurr.VALUE >= 0) {
                        deltaNewLogoHtml += `<td>$${(delCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        deltaNewLogoHtml += `<td>-$${(-(delCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            deltaLen++
        }
        if (deltaTotal != undefined) {
            $.each(deltaTotal, function (l, delCurr) {
                let dataYrFil = (delCurr.MONTH).split('_');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    if (delCurr.VALUE >= 0) {
                        deltaTotalHtml += `<td>$${(delCurr.VALUE).toLocaleString()}</td>`
                    } else {
                        deltaTotalHtml += `<td>-$${(-(delCurr.VALUE)).toLocaleString()}</td>`
                    }
                }
            });
            deltaLen++
        }
        let rowSpan = actualData.length + projectedData.length + deltaData.length + 2;
        let planHeadingrow = "", planHeadFlag = true;
        if (projCurrHtml != "") {
            planHeadingrow = `<td>Current</td>${projCurrHtml}`
            projCurrHtml = ""
            planHeadFlag = false;
        } else if (projCurrNewHtml != "" && planHeadFlag) {
            planHeadingrow = `<td>Current New</td>${projCurrNewHtml}`
            projCurrNewHtml = ""
            planHeadFlag = false;
        } else if (projNetNewHtml != "" && planHeadFlag) {
            planHeadingrow = `<td>Net New</td>${projNetNewHtml}`
            projNetNewHtml = ""
            planHeadFlag = false;
        } else if (projNewLogoHtml != "" && planHeadFlag) {
            planHeadingrow = `<td>New Logo</td>${projNewLogoHtml}`
            projNewLogoHtml = ""
            planHeadFlag = false;
        } else if (projTotalHtml != "" && planHeadFlag) {
            planHeadingrow = `<td>Total</td>${projTotalHtml}`
            projTotalHtml = ""
            planHeadFlag = false;
        }
        let currentHeadingrow = "", currentHeadFlag = true;
        if (actualCurrHtml != "") {
            currentHeadingrow = `<td>Current</td>${actualCurrHtml}`
            actualCurrHtml = ""
            currentHeadFlag = false;
        }else if(actualCurrNewHtml != "" && currentHeadFlag){
            currentHeadingrow = ` <td>Current New</td>${actualCurrNewHtml}`
            actualCurrNewHtml = ""
            currentHeadFlag = false;
        }else if(actualNetNewHtml != "" && currentHeadFlag){
            currentHeadingrow = ` <td>Net New</td>${actualNetNewHtml}`
            actualNetNewHtml = ""
            currentHeadFlag = false;
        }else if(actualNewLogoHtml != "" && currentHeadFlag){
            currentHeadingrow = ` <td>New Logo</td>${actualNewLogoHtml}`
            actualNewLogoHtml = ""
            currentHeadFlag = false;
        }else if(actualTotalHtml != "" && currentHeadFlag){
            currentHeadingrow = ` <td>Total</td>${actualTotalHtml}`
            actualTotalHtml = ""
            currentHeadFlag = false;
        }
        let deltaHeadingrow = "", deltaHeadFlag = true;
        if (deltaCurrHtml != "") {
            deltaHeadingrow = `<td>Current</td>${deltaCurrHtml}`
            deltaCurrHtml = ""
            deltaHeadFlag = false;
        }else if (deltaCurrNewHtml != "") {
            deltaHeadingrow = `<td>Current New</td>${deltaCurrNewHtml}`
            deltaCurrNewHtml = ""
            deltaHeadFlag = false;
        }else if (deltaNetNewHtml != "") {
            deltaHeadingrow = `<td>Net New</td>${deltaNetNewHtml}`
            deltaNetNewHtml = ""
            deltaHeadFlag = false;
        }else if (deltaNewLogoHtml != "") {
            deltaHeadingrow = `<td>New Logo</td>${deltaNewLogoHtml}`
            deltaNewLogoHtml = ""
            deltaHeadFlag = false;
        }else if (deltaTotalHtml != "") {
            deltaHeadingrow = `<td>Total</td>${deltaTotalHtml}`
            deltaTotalHtml = ""
            deltaHeadFlag = false;
        }

        let finalLen = plannedLen + actualLen + deltaLen + parseInt(`${plannedLen >= 1 ? 1 : 0}`) + parseInt(`${actualLen >=1 ? 1:0}`)
        let planActualHtml = `<tr>
                    <td rowspan="${finalLen}" class="reportAccBG">${planActual.ACCOUNT_NAME}</td>
                    <td rowspan="${plannedLen}">20${selectYr} Proposed Run Rate</td>
                   ${planHeadingrow}
                </tr>
                ${projCurrNewHtml == "" ? "" : `<tr><td>Current New</td>${projCurrNewHtml}</tr>`}
                ${projNetNewHtml == "" ? "" : ` <tr><td>Net New</td>${projNetNewHtml}</tr>`}
                ${projNewLogoHtml == "" ? "" : `<tr><td>New Logo</td>${projNewLogoHtml}</tr>`}
                ${projTotalHtml == "" ? "" : `<tr class="plan_Act_Total_BG"><td>Total</td>${projTotalHtml}</tr>`}
                ${!planHeadFlag && `<tr><td colspan="15"><hr></td></tr>`}
                <tr>
                    <td rowspan="${actualLen}">20${selectYr}Actual Run Rate</td>
                    ${currentHeadingrow}
                </tr>
                ${actualCurrNewHtml == ""? "" : `<tr><td>Current New</td>${actualCurrNewHtml}</tr>` }
                ${actualNetNewHtml == "" ? "" : `<tr><td>Net New</td>${actualNetNewHtml}</tr>`}
                ${actualNewLogoHtml == "" ? "" : `<tr><td>New Logo</td>${actualNewLogoHtml}</tr>`}
                ${actualTotalHtml == "" ? "" : `<tr class="plan_Act_Total_BG"><td>Total</td>${actualTotalHtml}</tr>`}
                ${!currentHeadFlag && `<tr><td colspan="15"><hr></td></tr>`}
                
                
                <tr>
                    <td rowspan="${deltaLen}">Delta</td>
                    ${deltaHeadingrow}
                </tr>
                ${deltaCurrNewHtml == "" ? "" : `<tr><td>Current New</td>${deltaCurrNewHtml}</tr>`}
                ${deltaNetNewHtml == "" ? "" : `<tr><td>Net New</td>${deltaNetNewHtml}</tr>`}
                ${deltaNewLogoHtml == "" ? "" : `<tr><td>New Logo</td>${deltaNewLogoHtml}</tr>`}
                ${deltaTotalHtml == ""? "": `<tr class="plan_Act_Delta_Total_BG"><td>Total</td>${deltaTotalHtml}</tr>`}
                
                
                <tr>
                      <td colspan="${finalLen}">
                        <hr>
                      </td>
                    </tr>
                `
        $("#report_overall_summary_body").append(planActualHtml)
    })
}

function downloadExcel() {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    let CurrentDateTime = date + '_' + time;
    $("#res_by_account_green_signed").remove(".noExl").table2excel({
        exclude: ".noExl",
        name: "Reports Overall Summary",
        filename: "reports_planned_vs_actual" + CurrentDateTime,
        fileext: ".xls",
    });
}