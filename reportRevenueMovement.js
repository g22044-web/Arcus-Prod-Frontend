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
                    assignRevenueMoveData();
                    $('.input-group-addon').hide();
                    $(".loader").css("display", "none");
                    $(".show_page").css("display", "block");

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
let revenueMovementData = [];

var monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();

function getRevenueMovementJson() {
    const startTime = performance.now();
    $.ajax({
        url: apiValue.url_ip + ":5003/sow_amount_movement",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            query_type: "weekly_revenue_movement",
            "environment": apiValue.environment
        }),
        success: function (dataJson) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportRevenueMovement","Reports","planned_vs_actual","success",fileName,"reportRevenueMovement","view");
            revenueMovementData = dataJson
            preparePlannedActual(revenueMovementData);
        },
        error: function (error) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportRevenueMovement","Reports","planned_vs_actual","error",fileName,"reportRevenueMovement","view");
            console.log('message Error' + JSON.stringify(error));
        }
    });
}

function assignRevenueMoveData() {
    if (revenueMovementData == 0) {
        getRevenueMovementJson();
    } else {
        preparePlannedActual(revenueMovementData)
    }
}

function preparePlannedActual(revenueMovementAllData) {
    $("#report_revenue_move_head").empty();
    $("#report_revenue_move_body").empty();
    let AccountHeader = revenueMovementAllData.HEADER_DATA;
    let accHeaderMnthHtml = "", accHeaderHtml = "";
    $.each(AccountHeader, function (i) {
        accHeaderMnthHtml += `<th>${AccountHeader[i] == 'DELTA' ? 'DELTA' : dateFormat(AccountHeader[i])}</th>`;
    })
    $("#report_revenue_move_head").append(`
                                        <th>Account</th>
                                        <th>Status</th>
                                        ${accHeaderMnthHtml}
                                    `)
    let revenueDataBodyData = revenueMovementAllData.ALL_ACCOUNT_DATA
    $.each(revenueDataBodyData, function (i, revenueMovement) {
        let revenueSignedHtml = "", revenueGreenHtml = "", revenueSignedGreenHtml = "";
        let columnLen = 0
        $.each(revenueMovement.ACCOUNT_DATA, function (i, revenueData) {
            if (revenueData.STATUS == "Signed") {
                columnLen = (revenueData.STATUS_DATA).length
                $.each(revenueData.STATUS_DATA, function (j, statusData) {
                    if (statusData.TOTAL_AMOUNT >= 0) {
                        revenueSignedHtml += `<td>$${(Math.round(statusData.TOTAL_AMOUNT)).toLocaleString()}</td>`
                    } else {
                        revenueSignedHtml += `<td>-$${(-(Math.round(statusData.TOTAL_AMOUNT))).toLocaleString()}</td>`
                    }
                })
            }
            if (revenueData.STATUS == "Green") {
                $.each(revenueData.STATUS_DATA, function (j, statusData) {
                    if (statusData.TOTAL_AMOUNT >= 0) {
                        revenueGreenHtml += `<td>$${(Math.round(statusData.TOTAL_AMOUNT)).toLocaleString()}</td>`
                    } else {
                        revenueGreenHtml += `<td>-$${(-(Math.round(statusData.TOTAL_AMOUNT))).toLocaleString()}</td>`
                    }
                })
            }
            if (revenueData.STATUS == "Signed_Green") {
                $.each(revenueData.STATUS_DATA, function (j, statusData) {
                    if (statusData.TOTAL_AMOUNT >= 0) {
                        revenueSignedGreenHtml += `<td>$${(Math.round(statusData.TOTAL_AMOUNT)).toLocaleString()}</td>`
                    } else {
                        revenueSignedGreenHtml += `<td>-$${(-(Math.round(statusData.TOTAL_AMOUNT))).toLocaleString()}</td>`
                    }
                })
            }
        })

        let revenueBodyData = `<tr>
                                <td rowspan="3" class="reportAccBG">${revenueMovement.ACCOUNT_NAME}</td>
                                <td>70% Signed+Renewal+70%</td>
                                ${revenueSignedGreenHtml}
                              </tr>
                              <tr>
                                <td>>70%</td>
                                ${revenueGreenHtml}
                              </tr>
                              <tr>
                                <td>Actual</td>
                                ${revenueSignedHtml}                               
                              </tr>
                              <tr class="noExl">
                              <td colspan="${columnLen + 2}"><hr></td>
                              </tr>`
        $("#report_revenue_move_body").append(revenueBodyData);
    })
}

function downloadExcel() {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    let CurrentDateTime = date + '_' + time;
    $("#res_by_revenue_movement").remove(".noExl").table2excel({
        exclude: ".noExl",
        name: "Reports Revenue Movement",
        filename: "reports_revenue_movement_" + CurrentDateTime,
        fileext: ".xls",
    });
}

function dateFormat(d) {
    var t = new Date(d + "T00:00:00");
    return t.getDate() + '-' + monthShortNames[t.getMonth()] + '-' + t.getFullYear();
}