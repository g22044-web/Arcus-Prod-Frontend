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
                    assignDataToAccount();
                    $('.input-group-addon').hide();
                    $(".loader").css("display", "none");
                    $(".show_page").css("display", "block");
                    setTimeout(function () {
                        $('#report_details').addClass('active');
                        $("#sow_res_by_acc").addClass('active');
                        $("#sow_main").addClass('active');
                        $("#sow_res_menu").addClass('active');
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
let resByAccountData = [];
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();
function getResbyAccountJson() {
    const startTime = performance.now();
    $.ajax({
        url: apiValue.url_ip + ":5003/resource_by_account",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            // query_type: "resource_report_by_account",
            "environment": apiValue.environment
        }),
        success: function (dataJson) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportResourceByAccount","Reports","resource_by_account","success",fileName,"reportResourceByAccount","view");
            resByAccountData = dataJson
            resByAccountData.map((yr, index) => {
                $('.year_radio_filter').append(`<input type="radio" name="year_filter" id="year_${yr.YEAR}" class="emp_select" value="${yr.YEAR}"
                onclick="assignDataToAccount()">
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
            let selectYearData = resByAccountData.map(ra => {
                if (ra.YEAR == year) {
                    yearData = ra.YEAR_DATA
                }
                return yearData
            })
            let shortNewYr = selectedYearval.toString().substr(-2);
            assignResToAccountData(yearData, shortNewYr);
        },
        error: function (error) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportResourceByAccount","Reports","resource_by_account","error",fileName,"reportResourceByAccount","view");
            console.log('message Error' + JSON.stringify(error));
        }
    });
}

function assignDataToAccount() {
    const d = new Date();
    let year = d.getFullYear();
    let shortYr = year.toString().substr(-2);
    $("#previousYr").val(shortYr - 1);
    $("#previousYr_label").html(year - 1);
    $("#currentYr").val(shortYr);
    $("#currentYr_label").html(year);
    $("#futureYr").val((year + 1).toString().substr(-2));
    $("#futureYr_label").html(year + 1);
    if (resByAccountData == 0) {
        getResbyAccountJson();
    } else {
        let selectedYearval = "";
        let selectedYr = $("input[type='radio'][name='year_filter']:checked").val();
        if (selectedYr.length > 0) {
            selectedYearval = selectedYr;
        }
        let yearData = []
        let selectYearData = resByAccountData.map(ra => {
            if (ra.YEAR == selectedYr) {
                yearData = ra.YEAR_DATA
            }
            return yearData
        })
        let shortNewYr = selectedYearval.toString().substr(-2);
        assignResToAccountData(yearData, shortNewYr)
    }
}

function assignResToAccountData(resData, selectYr) {
    $("#report_sow_account").empty();
    $("#report_sow_account_body").empty();
    var selectedVal = "";
    var selected = $("input[type='radio'][name='res_acc']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    let AccountHeader = resData.HEADER_MONTHS;
    AccountHeader = AccountHeader.filter(head => {
        const splitHead = head.split('-')
        return splitHead[splitHead.length - 1] == selectYr
    })
    let accHeaderMnthHtml = "", accHeaderHtml = "";
    let sowGreenSignedTotal = [], sowGreenTotal = [], sowSignedTotal = []
    $.each(AccountHeader, function (i) {
        accHeaderMnthHtml += `<th>${AccountHeader[i]}</th>`;
    })
    accHeaderHtml = `<th>Account Name</th>
                    <th>SOW Type</th>
                    ${accHeaderMnthHtml}`
    $("#report_sow_account").append(accHeaderHtml);

    let overAllMonthltData = resData.OVERALL_MONTHLY_DATA;
    $.each(overAllMonthltData, function (i, overallData) {
        if (overallData.SOW_STATUS == "Signed + Green") {
            sowGreenSignedTotal = overallData.SOW_LEVEL_DATE;
        } else if (overallData.SOW_STATUS == "Signed") {
            sowSignedTotal = overallData.SOW_LEVEL_DATE;
        } else if (overallData.SOW_STATUS == "Green") {
            sowGreenTotal = overallData.SOW_LEVEL_DATE;
        }
    })

    let sowGreenSignMonthHtml = "";
    $.each(sowGreenSignedTotal, function (i, sowGreenSign) {
        let dataYrFil = (sowGreenSign.MONTH).split('-');
        if (dataYrFil[dataYrFil.length - 1] == selectYr) {
            if (selectedVal == "ALL") {
                sowGreenSignMonthHtml += `<td>${sowGreenSign.TOTAL_COUNT}</td>`
            } else if (selectedVal == "IND") {
                sowGreenSignMonthHtml += `<td>${sowGreenSign.IND_COUNT}</td>`
            } else if (selectedVal == "US") {
                sowGreenSignMonthHtml += `<td>${sowGreenSign.US_COUNT}</td>`
            }

        }
    })
    let sowGreenSignedTotalHtml = `<tr class="overall_total_allSow">
                                    <td>Green + Signed Total</td>
                                    <td></td>
                                    ${sowGreenSignMonthHtml}
                                    </tr>`
    $("#report_sow_account_body").append(sowGreenSignedTotalHtml);
    let accountLevelData = resData.ACCOUNT_LEVEL_DATA;
    let accGreenDataHtml = "", accSignedDataHtml = "", accSignedGreenDataHtml = "";
    let accName =
        $.each(accountLevelData, function (i, accData) {
            let accName = accData.ACCOUNT_NAME;
            let sowStatusData = accData.SOW_STATUS_DATA;
            let accGreenDataSowHtml = "", accSignedDataSowHtml = "", accSignedGreenDataSowHtml = "";
            let checkLen = 0, emptyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            $.each(sowStatusData, function (j, sowData) {
                if (sowData.SOW_STATUS == "Green") {
                    checkLen += (sowData.SOW_LEVEL_DATE).length
                    if ((sowData.SOW_LEVEL_DATE).length > 0) {
                        $.each(sowData.SOW_LEVEL_DATE, function (j, sowstatusData) {
                            let dataYrFil = (sowstatusData.MONTH).split('-');
                            if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                                if (selectedVal == "ALL") {
                                    accGreenDataSowHtml += `<td>${sowstatusData.TOTAL_COUNT}</td>`
                                } else if (selectedVal == "IND") {
                                    accGreenDataSowHtml += `<td>${sowstatusData.IND_COUNT}</td>`
                                } else if (selectedVal == "US") {
                                    accGreenDataSowHtml += `<td>${sowstatusData.US_COUNT}</td>`
                                }
                            }
                        });
                    } else {
                        emptyData.map(arr => {
                            accGreenDataSowHtml += `<td>${arr}</td>`
                        })
                    }
                } else if (sowData.SOW_STATUS == "Signed + Green") {
                    checkLen += (sowData.SOW_LEVEL_DATE).length
                    if ((sowData.SOW_LEVEL_DATE).length > 0) {
                        $.each(sowData.SOW_LEVEL_DATE, function (j, sowstatusData) {
                            let dataYrFil = (sowstatusData.MONTH).split('-');
                            if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                                if (selectedVal == "ALL") {
                                    accSignedGreenDataSowHtml += `<td>${sowstatusData.TOTAL_COUNT}</td>`
                                } else if (selectedVal == "IND") {
                                    accSignedGreenDataSowHtml += `<td>${sowstatusData.IND_COUNT}</td>`
                                } else if (selectedVal == "US") {
                                    accSignedGreenDataSowHtml += `<td>${sowstatusData.US_COUNT}</td>`
                                }

                            }
                        });
                    }else {
                        emptyData.map(arr => {
                            accSignedGreenDataSowHtml += `<td>${arr}</td>`
                        })
                    }
                } else if (sowData.SOW_STATUS == "Signed") {
                    checkLen += (sowData.SOW_LEVEL_DATE).length
                    if ((sowData.SOW_LEVEL_DATE).length > 0) {
                        $.each(sowData.SOW_LEVEL_DATE, function (j, sowstatusData) {
                            let dataYrFil = (sowstatusData.MONTH).split('-');
                            if (dataYrFil[dataYrFil.length - 1] == selectYr) {
    
                                if (selectedVal == "ALL") {
                                    accSignedDataSowHtml += `<td>${sowstatusData.TOTAL_COUNT}</td>`
                                } else if (selectedVal == "IND") {
                                    accSignedDataSowHtml += `<td>${sowstatusData.IND_COUNT}</td>`
                                } else if (selectedVal == "US") {
                                    accSignedDataSowHtml += `<td>${sowstatusData.US_COUNT}</td>`
                                }
                            }
                        });
                    }else {
                        emptyData.map(arr => {
                            accSignedDataSowHtml += `<td>${arr}</td>`
                        })
                    }
                }
            })
            if (checkLen > 12) {

                accSignedGreenDataHtml = `<tr class="account_bg">
                                        <td rowspan="3">${accName}</td>
                                        <td>&gt; 70% Green</td>
                                        ${accGreenDataSowHtml}
                                        
                                    </tr>
                                    <tr class="account_bg">
                                        <td>Signed</td>
                                        ${accSignedDataSowHtml}
                                    </tr>
                                    <tr class="account_bg">
                                        <td>Total</td>
                                        ${accSignedGreenDataSowHtml}
                                    </tr>
                                    <tr><td colspan="14"><hr></td></tr>`;
                $("#report_sow_account_body").append(accSignedGreenDataHtml);

                accGreenDataHtml += `<tr class="account_bg">
                                    <td>${accName}</td>
                                    <td>70% Green</td>
                                    ${accGreenDataSowHtml}
                                </tr>`

                accSignedDataHtml += `<tr class="account_bg">
                                    <td>${accName}</td>
                                    <td>Signed</td>
                                    ${accSignedDataSowHtml}
                                </tr>`
            }
        })

    let sowSignMonthHtml = "",sowSignMonthHtmlLen = sowSignedTotal.length;

    $.each(sowSignedTotal, function (i, sowSign) {
        let dataYrFil = (sowSign.MONTH).split('-');
        if (dataYrFil[dataYrFil.length - 1] == selectYr) {
            if (selectedVal == "ALL") {
                sowSignMonthHtml += `<td>${sowSign.TOTAL_COUNT}</td>`
            } else if (selectedVal == "IND") {
                sowSignMonthHtml += `<td>${sowSign.IND_COUNT}</td>`
            } else if (selectedVal == "US") {
                sowSignMonthHtml += `<td>${sowSign.US_COUNT}</td>`
            }

        }
    })
    let sowSignedTotalHtml = `<tr class="signed_total_sow">
                                    <td>Signed</td>
                                    <td></td>
                                    ${sowSignMonthHtml}
                                    </tr>`


    let sowGreenMonthHtml = "",sowGreenMonthHtmlLen = sowGreenTotal.length;
    $.each(sowGreenTotal, function (i, sowSign) {
        let dataYrFil = (sowSign.MONTH).split('-');
        if (dataYrFil[dataYrFil.length - 1] == selectYr) {
            if (selectedVal == "ALL") {
                sowGreenMonthHtml += `<td>${sowSign.TOTAL_COUNT}</td>`
            } else if (selectedVal == "IND") {
                sowGreenMonthHtml += `<td>${sowSign.IND_COUNT}</td>`
            } else if (selectedVal == "US") {
                sowGreenMonthHtml += `<td>${sowSign.US_COUNT}</td>`
            }

        }
    })
    let sowGreenTotalHtml = `<tr class="green_total_sow">
                                <td>70% Green</td>
                                <td></td>
                                ${sowGreenMonthHtml}
                            </tr>`
    if(sowGreenMonthHtmlLen > 0){
        $("#report_sow_account_body").append(sowGreenTotalHtml);
        $("#report_sow_account_body").append(accGreenDataHtml);
    }
    if(sowSignMonthHtmlLen > 0){
        $("#report_sow_account_body").append(`<tr style="background-color: white"><td colspan="14"><hr></td></tr>`);
        $("#report_sow_account_body").append(sowSignedTotalHtml);
        $("#report_sow_account_body").append(accSignedDataHtml);
    }

    let signedOverallTotalHtml = "", signedIndTotalHtml = "", signedUSTotalHtml = "";
    $.each(sowSignedTotal, function (i, sowSign) {
        let dataYrFil = (sowSign.MONTH).split('-');
        if (dataYrFil[dataYrFil.length - 1] == selectYr) {
            signedOverallTotalHtml += `<td>${sowSign.TOTAL_COUNT}</td>`
            signedIndTotalHtml += `<td>${sowSign.IND_COUNT}</td>`
            signedUSTotalHtml += `<td>${sowSign.US_COUNT}</td>`
        }
    })
    
    let overallSignedTotalHtml = `<tr class="signed_total_sow">
                                    <td rowspan="3">Signed Total</td>
                                    <td>Overall Total</td>
                                    ${signedOverallTotalHtml}
                                    </tr>
                                    <tr class="signed_total_sow">
                                    <td>IND</td>
                                    ${signedIndTotalHtml}
                                    </tr>
                                    <tr class="signed_total_sow">
                                    <td>USCAN</td>
                                    ${signedUSTotalHtml}
                                    </tr>`
    if(sowSignMonthHtmlLen > 0){
        $("#report_sow_account_body").append(`<tr style="background-color: white"><td colspan="14"><hr></td></tr>`);
        $("#report_sow_account_body").append(overallSignedTotalHtml);
    }

    let greenOverallTotalHtml = "", greenIndTotalHtml = "", greenUSTotalHtml = "";
    $.each(sowGreenTotal, function (i, sowSign) {
        let dataYrFil = (sowSign.MONTH).split('-');
        if (dataYrFil[dataYrFil.length - 1] == selectYr) {
            greenOverallTotalHtml += `<td>${sowSign.TOTAL_COUNT}</td>`
            greenIndTotalHtml += `<td>${sowSign.IND_COUNT}</td>`
            greenUSTotalHtml += `<td>${sowSign.US_COUNT}</td>`
        }
    })

    let overallGreenTotalHtml = `<tr class="green_total_sow">
                                    <td rowspan="3">Green Total</td>
                                    <td>Overall Total</td>
                                    ${greenOverallTotalHtml}
                                  </tr>
                                  <tr class="green_total_sow">
                                    <td>IND</td>
                                    ${greenIndTotalHtml}
                                  </tr>
                                  <tr class="green_total_sow">
                                    <td>USCAN</td>
                                    ${greenUSTotalHtml}
                                  </tr>`
    if(sowGreenMonthHtmlLen > 0){
        $("#report_sow_account_body").append(`<tr style="background-color: white"><td colspan="14"><hr></td></tr>`);
        $("#report_sow_account_body").append(overallGreenTotalHtml);
    }

    let singedGreenOverallTotalHtml = "", signedGreenIndTotalHtml = "", signedGreenUSTotalHtml = "";
    $.each(sowGreenSignedTotal, function (i, sowSign) {
        let dataYrFil = (sowSign.MONTH).split('-');
        if (dataYrFil[dataYrFil.length - 1] == selectYr) {

            singedGreenOverallTotalHtml += `<td>${sowSign.TOTAL_COUNT}</td>`
            signedGreenIndTotalHtml += `<td>${sowSign.IND_COUNT}</td>`
            signedGreenUSTotalHtml += `<td>${sowSign.US_COUNT}</td>`
        }
    })
    $("#report_sow_account_body").append(`<tr style="background-color: white"><td colspan="14"><hr></td></tr>`);

    let overallSignedGreenTotalHtml = `<tr class="overall_total_allSow">
                                    <td rowspan="3">Signed + Green Total</td>
                                    <td>Overall Total</td>
                                    ${singedGreenOverallTotalHtml}
                                  </tr>
                                  <tr class="overall_total_allSow">
                                    <td>IND</td>
                                    ${signedGreenIndTotalHtml}
                                  </tr>
                                  <tr class="overall_total_allSow">
                                    <td>USCAN</td>
                                    ${signedGreenUSTotalHtml}
                                  </tr>`
    $("#report_sow_account_body").append(overallSignedGreenTotalHtml);


}

function downloadExcel() {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    let CurrentDateTime = date + '_' + time;
    $("#res_by_account_green_signed").remove(".noExl").table2excel({
        exclude: ".noExl",
        name: "Reports Resource By Account",
        filename: "reports_Resource_By_Account_" + CurrentDateTime,
        fileext: ".xls",
    });
}