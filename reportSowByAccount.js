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
                    assignSOWbyAccountPlannedData();
                    $('.input-group-addon').hide();
                    $(".loader").css("display", "none");
                    $(".show_page").css("display", "block");
                    setTimeout(function () {
                        $('#report_details').addClass('active');
                        $("#sow_amt_by_acc").addClass('active');
                        $("#sow_main").addClass('active');
                        $("#sow_amt_menu").addClass('active');
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

let SOWAccPlannedJsonData = [];
let SOWAccActualJsonData = [];
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();
const api = async ()=>{
    try{
        const d = new Date();
        let year = d.getFullYear();
        let shortYr = year.toString().substr(-2);
        $("#previousYr").val(shortYr - 1);
        $("#previousYr_label").html(year - 1);
        $("#currentYr").val(shortYr);
        $("#currentYr_label").html(year);
        $("#futureYr").val((year + 1).toString().substr(-2));
        $("#futureYr_label").html(year + 1);
        let form_details = {
            "environment": apiValue.environment
        };
        let data = await fetch (apiValue.url_ip + ":5003/amount_by_account_projected", {
            method : "POST",
            body: {form_details}
        })
        const result = await data.json()
    }catch{
        console.log("Error : "+error)
    }
}

function assignSOWbyAccountPlannedData() {
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
    $.ajax({
        url: apiValue.url_ip + ":5003/amount_by_account_projected",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: ({
            // query_type: "sow_report_by_account",
            "environment": apiValue.environment
        }),
        success: function (dataJson) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportSowByAccount","Reports","amount_by_account_projected","success",fileName,"reportSowByAccount","view");
            SOWAccPlannedJsonData = dataJson
            SOWAccPlannedJsonData.map((yr, index) => {
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
            SOWAccPlannedJsonData.map(ra => {
                if (ra.YEAR == year) {
                    yearData = ra.YEAR_DATA
                }
                return yearData
            })
            let shortNewYr = selectedYearval.toString().substr(-2);
            assignSowAmtbyAcc(yearData, shortNewYr);
        },
        error: function (error) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportSowByAccount","Reports","amount_by_account_projected","error",fileName,"reportSowByAccount","view");
            console.log('message Error' + JSON.stringify(error));
        }
    });
}

function assignSOWbyAccountActualData() {
    const startTime = performance.now();
    $.ajax({
        url: apiValue.url_ip + ":5003/amount_by_account_actual",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            // query_type: "sow_actual_amount_by_account",
            "environment": apiValue.environment
        }),
        success: function (dataJson) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportSowByAccount","Reports","amount_by_account_actual","success",fileName,"reportSowByAccount","view");
            SOWAccActualJsonData = dataJson;
        
            let selectedYearval = "";
            let selectedYr = $("input[type='radio'][name='year_filter']:checked").val();
            if (selectedYr.length > 0) {
                selectedYearval = selectedYr;
            }
            let yearData = []
            SOWAccActualJsonData.map(ra => {
                if (ra.YEAR == selectedYr) {
                    yearData = ra.YEAR_DATA
                }
                return yearData
            })
            let shortNewYr = selectedYearval.toString().substr(-2);
            assignSowAmtbyAcc(yearData, shortNewYr);
        },
        error: function (error) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportSowByAccount","Reports","amount_by_account_actual","error",fileName,"reportSowByAccount","view");
            console.log('message Error' + JSON.stringify(error));
        }
    });
}

function assignSowAmtbyAcc(dataJson, selectYear) {
    $(".employee_sow_details").hide();
    $("#report_sow_acc_signed").empty();
    $("#signed_sow_table tbody").empty();
    $("#report_sow_acc_green").empty();
    $("#proposal_sow_table tbody").empty();
    $("#report_sow_acc_all").empty();
    $("#downloadSowByAcc").empty();
    let headerData = dataJson.header_Data;
    let sowByAccHeaderSignHtml = "", sowByAccHeaderGreenHtml = "";
    sowByAccHeaderSignHtml = `<th class="signed_header_bg">Signed Total By Account</th>
            <th class="signed_header_bg">Total</th>`;
    sowByAccHeaderGreenHtml = `<th class="proposal_header_bg">Green Total By Account</th>
            <th class="proposal_header_bg">Total</th>`
    headerData = headerData.filter(head => {
        const splitHead = head.split('_')
        return splitHead[splitHead.length - 1] == selectYear
    })
    $.each(headerData, function (i, header) {
        sowByAccHeaderSignHtml += `<th class="signed_header_bg">${header.replace("_", "-")}</th>`
        sowByAccHeaderGreenHtml += `<th class="proposal_header_bg">${header.replace("_", "-")}</th>`
    })
    $("#report_sow_acc_signed").append(sowByAccHeaderSignHtml);
    $("#report_sow_acc_green").append(sowByAccHeaderGreenHtml);
    $("#downloadSowByAcc").append('<tr>' + sowByAccHeaderSignHtml + '</tr>');
    let signedData = dataJson.signed_data;
    let signedDataTotal = dataJson.signed_total_data;
    let signedTotalHtml = "",signedEachTotalHtml = "";
    let signedDataHtml = "", greenDataHtml = "", overAllDataHtml = "";
    if(signedDataTotal.length > 0){
        signedDataTotal.map((sign)=> {
            signedEachTotalHtml += `<td class="signed_bg acc_total_bold">$${(Math.round(sign.VALUE)).toLocaleString()}</td>`
        })
        signedTotalHtml = `<tr class="acc_style_class">
                            <td class="signed_bg acc_total_bold">Total</td>
                            ${signedEachTotalHtml}
                        </tr>` 
        $("#signed_sow_table").append(signedTotalHtml)
        $("#downloadSowByAcc").append(signedTotalHtml)
    }else{
        signedTotalHtml = `<tr class="acc_style_class">
                            <td colspan="14" class="signed_bg acc_total_bold text-center">No Records Found</td>
                        </tr>` 
        $("#signed_sow_table").append(signedTotalHtml)
        $("#downloadSowByAcc").append(signedTotalHtml)
    }
    signedData.map((sign, index) => {
        let signedEachDataHtml = "";
        if((sign.ACCOUNT_DATA).length >0){
            (sign.ACCOUNT_DATA).map(signAcc => {
                signedEachDataHtml += `<td class="signed_bg">$${(Math.round(signAcc.VALUE)).toLocaleString()}</td>`
            })
            signedDataHtml +=`<tr class="acc_style_class">
                                    <td class="signed_bg">${sign.ACCOUNT_NAME}</td>
                                    ${signedEachDataHtml}
                                </tr>`
        }
    })
    $("#signed_sow_table").append(signedDataHtml);
    $("#downloadSowByAcc").append(signedDataHtml)
    let greenDataTotal = dataJson.green_total_data;
    let greenTotalHtml = "", greenEachTotalHtml;
    if(greenDataTotal.length > 0){
        greenDataTotal.map((green)=> {
            greenEachTotalHtml += `<td class="signed_bg acc_total_bold">$${(Math.round(green.VALUE)).toLocaleString()}</td>`
        })
        greenTotalHtml = `<tr class="acc_style_class">
                            <td class="signed_bg acc_total_bold">Total</td>
                            ${greenEachTotalHtml}
                        </tr>` 
        $("#proposal_sow_table").append(greenTotalHtml)
        $("#downloadSowByAcc").append(greenTotalHtml)
    }else{
        greenTotalHtml = `<tr class="acc_style_class">
                            <td colspan="14" class="signed_bg acc_total_bold text-center">No Records Found</td>
                        </tr>` 
        $("#proposal_sow_table").append(greenTotalHtml)
        $("#downloadSowByAcc").append(greenTotalHtml)
    }
    let greenData = dataJson.green_data;
    greenData.map((green, index) => {
        let greenEachDataHtml = "";
        if((green.ACCOUNT_DATA).length >0){
            (green.ACCOUNT_DATA).map(greenAcc => {
                greenEachDataHtml += `<td class="signed_bg">$${(Math.round(greenAcc.VALUE)).toLocaleString()}</td>`
            })
            greenDataHtml +=`<tr class="acc_style_class">
                                    <td class="signed_bg">${green.ACCOUNT_NAME}</td>
                                    ${greenEachDataHtml}
                                </tr>`
        }
    })
    $("#downloadSowByAcc").append('<tr><td colspan="14"></td></tr>');
    $("#downloadSowByAcc").append('<tr>' + sowByAccHeaderGreenHtml + '</tr>')
    $("#downloadSowByAcc").append(greenTotalHtml)
    $("#proposal_sow_table").append(greenDataHtml)
    $("#downloadSowByAcc").append(greenDataHtml)

    let totalSignedGreenData = dataJson.total_signed_green;
    if(totalSignedGreenData.length>0){
        let overallEachDataHtml = "";
        totalSignedGreenData.map(tot => {
            if(tot.MONTH == "TOTAL_"+selectYear){
                overallEachDataHtml += `<th class="all_month_bg acc_total_bold" style="font-size: 11px"><b>$${(Math.round(tot.VALUE)).toLocaleString()}</b></th>`
            }else{
                overallEachDataHtml += `<th class="all_month_bg">$${(Math.round(tot.VALUE)).toLocaleString()}</th>`
            }
        })
        overAllDataHtml = `<th class="all_month_bg acc_total_bold" style="font-size: 11px"><b>Monthly all green + Signed</b></th>
                            ${overallEachDataHtml}`
    }
    $('#report_sow_acc_all').append(overAllDataHtml);
    $("#downloadSowByAcc").append('<tr><td colspan="14"></td></tr>');
    $("#downloadSowByAcc").append('<tr>' + overAllDataHtml + '</tr>');

    $(".acc_style_class td:first-child").addClass("acc_total_bold");
    $(".acc_style_class td:nth-child(2)").addClass("acc_total_bold");
    $(".employee_sow_details").show();
}

function sowGetByAccount() {
    let selectedVal = "";
    let selected = $("input[type='radio'][name='sow_amount_by_acc']:checked").val();
    if (selected.length > 0) {
        selectedVal = selected;
    }

    if (selectedVal == "Planned") {
        if (SOWAccPlannedJsonData.length == 0) {
            assignSOWbyAccountPlannedData();
        } else {
            let selectedYearval = "";
            let selectedYr = $("input[type='radio'][name='year_filter']:checked").val();
            if (selectedYr.length > 0) {
                selectedYearval = selectedYr;
            }
            let yearData = []
            let selectYearData = SOWAccPlannedJsonData.map(ra => {
                if (ra.YEAR == selectedYr) {
                    yearData = ra.YEAR_DATA
                }
                return yearData
            })
            let shortNewYr = selectedYearval.toString().substr(-2);
            assignSowAmtbyAcc(yearData, shortNewYr);
        }

    } else if (selectedVal == "Actual") {
        if (SOWAccActualJsonData.length == 0) {
            assignSOWbyAccountActualData()
        } else {
            let selectedYearval = "";
            let selectedYr = $("input[type='radio'][name='year_filter']:checked").val();
            if (selectedYr.length > 0) {
                selectedYearval = selectedYr;
            }
            let yearData = []
            let selectYearData = SOWAccActualJsonData.map(ra => {
                if (ra.YEAR == selectedYr) {
                    yearData = ra.YEAR_DATA
                }
                return yearData
            })
            let shortNewYr = selectedYearval.toString().substr(-2);
            assignSowAmtbyAcc(yearData, shortNewYr);
        }
    }

}

function yearFilter() {
    let selectedYearval = "";
    let selectedYr = $("input[type='radio'][name='year_filter']:checked");
    if (selectedYr.length > 0) {
        selectedYearval = selectedYr.val();
    }
}

function downloadExcel() {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    let CurrentDateTime = date + '_' + time;
    $("#downloadSowByAcc").table2excel({
        // exclude CSS class
        //   exclude:".noExl",
        name: "Reports SOW By Account",
        filename: "reports_Sow_By_Account_" + CurrentDateTime,
        fileext: ".xls",
        //   preserveColors:true
    });
}