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
                    assignDataToSow();
                    $('.input-group-addon').hide();
                    $(".loader").css("display", "none");
                    $(".show_page").css("display", "block");
                    setTimeout(function () {
                        $('#report_details').addClass('active');
                        $("#sow_res_by_sow").addClass('active');
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

let resBySOWData = [];
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();

function getResbySOWJson() {
    const startTime = performance.now();
    $.ajax({
        url: apiValue.url_ip + ":5003/resource_by_sow",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            // query_type: "resource_report_by_sow",
            "environment": apiValue.environment
        }),
        success: function (dataJson) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportResourceBySow","Reports","resource_by_sow","success",fileName,"reportResourceBySow","view");
            resBySOWData = dataJson
            resBySOWData.map((yr, index) => {
                $('.year_radio_filter').append(`<input type="radio" name="year_filter" id="year_${yr.YEAR}" class="emp_select" value="${yr.YEAR}"
                onclick="assignDataToSow()">
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
            let selectYearData = resBySOWData.map(ra => {
                if (ra.YEAR == year) {
                    yearData = ra.YEAR_DATA
                }
                return yearData
            })
            let shortNewYr = selectedYearval.toString().substr(-2);
            assignResToSOWData(yearData, shortNewYr);
        },
        error: function (error) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportResourceBySow","Reports","resource_by_sow","error",fileName,"reportResourceBySow","view");
            console.log('message Error' + JSON.stringify(error));
        }
    });
}

function assignDataToSow() {
    const d = new Date();
    let year = d.getFullYear();
    let shortYr = year.toString().substr(-2);
    $("#previousYr").val(shortYr - 1);
    $("#previousYr_label").html(year - 1);
    $("#currentYr").val(shortYr);
    $("#currentYr_label").html(year);
    $("#futureYr").val((year + 1).toString().substr(-2));
    $("#futureYr_label").html(year + 1);
    if (resBySOWData == 0) {
        getResbySOWJson();
    } else {
        let selectedYearval = "";
        let selectedYr = $("input[type='radio'][name='year_filter']:checked").val();
        if (selectedYr.length > 0) {
            selectedYearval = selectedYr;
        }
        let yearData = []
        resBySOWData.map(ra => {
            if (ra.YEAR == selectedYr) {
                yearData = ra.YEAR_DATA
            }
            return yearData
        })
        let shortNewYr = selectedYearval.toString().substr(-2);
        assignResToSOWData(yearData, shortNewYr)
    }
}

function assignResToSOWData(resData, selectYr) {
    $("#report_sow_account").empty();
    $("#report_sow_account_body").empty()
    let AccountHeader = resData.HEADER_MONTHS;
    let accHeaderMnthHtml = "", accHeaderHtml = "";
    let sowGreenSignedTotal = [], sowGreenTotal = [], sowSignedTotal = []
    AccountHeader = resData.HEADER_MONTHS.filter(head => {
        const splitHead = head.split('-')
        return splitHead[splitHead.length - 1] == selectYr
    })
    $.each(AccountHeader, function (i) {
        accHeaderMnthHtml += `<th>${AccountHeader[i].replace("_", "-")}</th>`;
    })
    accHeaderHtml = `<th>Account Name</th>
                    <th>SOW Name</th>
                    <th>SOW Type</th>
                    <th>Location</td>
                    ${accHeaderMnthHtml}
                    <th>Status</th>`
    $("#report_sow_account").append(accHeaderHtml);
    let allSOWLevelData = resData.SOW_LEVEL_DATA;
    $.each(allSOWLevelData, function (accLevel, sowData) {
        let accName = sowData.ACCOUNT_NAME;
        let accId = accName.replace(/ /g, '_');
        let AccSowAllData = sowData.ACCOUNT_DATA;
        let lenOfAcc = 0;

        let signedHtml = "", proposalHtml = "", renewalHtml = "", qualifiedHtml = "";
        $.each(AccSowAllData, function (sowLevel, eachSow) {
            let sowTypeData = eachSow.SOW_DATA;
            let sowLen = sowTypeData.length * 2;
            let sowName = (eachSow.SOW_NAME).replace(/_/g, " ");
            let sowStatus = eachSow.SOW_STATUS;
            lenOfAcc += sowLen;
            $.each(sowTypeData, function (typeLevel, typeData) {
                let sowTypeName = typeData.SOW_TYPE;
                let sowEachTypeData = typeData.SOW_TYPE_DATA;
                let indHtml = "", usHtml = "";
                $.each(sowEachTypeData, function (l, country) {
                    let dataYrFil = (country.MONTH).split('-');
                    if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                        indHtml += `<td>${country.IND_COUNT}</td>`
                        usHtml += `<td>${country.US_COUNT}</td>`
                    }
                });
                if (sowStatus == "Proposal") {
                    proposalHtml += `<tr class="proposal_bg top_broder_bg">
                                        ${(typeLevel == 0 && sowLevel == 0) ? `<td class="account_bg" style="color: black !important;" rowspan="${lenOfAcc}" id="${accId}">${accName}</td>` : ""}
                                        ${typeLevel == 0 ? `<td rowspan="${sowLen}">${sowName}</td>` : ""}
                                        <td rowspan="2">${sowTypeName}</td>
                                        <td>IND</td>
                                        ${indHtml}
                                        ${typeLevel == 0 ? `<td rowspan="${sowLen}">${sowStatus}</td>` : ""}
                                    </tr>
                                    <tr class="proposal_bg">
                                        <td>USCAN</td>
                                        ${usHtml}
                                    </tr>`

                } else if (sowStatus == "Qualified") {
                    qualifiedHtml += `<tr class="proposal_bg top_broder_bg">
                                        ${(typeLevel == 0 && sowLevel == 0) ? `<td class="account_bg" style="color: black !important;" rowspan="${lenOfAcc}" id="${accId}">${accName}</td>` : ""}
                                        ${typeLevel == 0 ? `<td rowspan="${sowLen}">${sowName}</td>` : ""}
                                        <td rowspan="2">${sowTypeName}</td>
                                        <td>IND</td>
                                        ${indHtml}
                                        ${typeLevel == 0 ? `<td rowspan="${sowLen}">${sowStatus}</td>` : ""}
                                    </tr>
                                    <tr class="proposal_bg">
                                        <td>USCAN</td>
                                        ${usHtml}
                                    </tr>`

                } else if (sowStatus == "Renewal") {
                    renewalHtml += `<tr class="renewal_bg top_broder_bg">
                                        ${(typeLevel == 0 && sowLevel == 0) ? `<td class="account_bg" style="color: black !important;" rowspan="${lenOfAcc}" id="${accId}">${accName}</td>` : ""}
                                        ${typeLevel == 0 ? `<td rowspan="${sowLen}">${sowName}</td>` : ""}
                                        <td rowspan="2">${sowTypeName}</td>
                                        <td>IND</td>
                                        ${indHtml}
                                        ${typeLevel == 0 ? `<td rowspan="${sowLen}">${sowStatus}</td>` : ""}
                                    </tr>
                                    <tr class="renewal_bg">
                                        <td>USCAN</td>
                                        ${usHtml}
                                    </tr>`

                } else {
                    signedHtml += `<tr class="top_broder_bg">
                                        ${(typeLevel == 0 && sowLevel == 0) ? `<td class="account_bg" style="color: black !important;" rowspan="${lenOfAcc}" id="${accId}">${accName}</td>` : ""}
                                        ${typeLevel == 0 ? `<td rowspan="${sowLen}">${sowName}</td>` : ""}
                                        <td rowspan="2">${sowTypeName}</td>
                                        <td>IND</td>
                                        ${indHtml}
                                        ${typeLevel == 0 ? `<td rowspan="${sowLen}">${sowStatus}</td>` : ""}
                                    </tr>
                                    <tr>
                                        <td>USCAN</td>
                                        ${usHtml}
                                    </tr>`
                }


            })

        });
        $("#report_sow_account_body").append(signedHtml);
        $("#report_sow_account_body").append(renewalHtml);
        $("#report_sow_account_body").append(proposalHtml);
        $("#report_sow_account_body").append(qualifiedHtml);


        let sowTypeOverallData = sowData.SOW_TYPE_DATA;
        let sowTypeOverallDataLen = sowTypeOverallData.length * 2
        let addSowToAccRow = lenOfAcc + sowTypeOverallDataLen;
        $.each(sowTypeOverallData, function (i, sowTdata) {
            let sowTypeName = sowTdata.SOW_TYPE;
            let sowTypeData = sowTdata.SOW_DATA;
            let indHtml = "", usHtml = "";
            $.each(sowTypeData, function (j, sowType) {
                let dataYrFil = (sowType.MONTH).split('-');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    indHtml += `<td>${sowType.IND_COUNT}</td>`
                    usHtml += `<td>${sowType.US_COUNT}</td>`
                }
            });
            let sowHtmlData = `<tr class="top_broder_bg">
                                    ${i == 0 ? `<td rowspan=${sowTypeOverallDataLen}>Total</td>` : ""}
                                    <td rowspan="2">${sowTypeName}</td>
                                    <td>IND</td>
                                    ${indHtml}
                                    ${i == 0 ? `<td rowspan=${sowTypeOverallDataLen}>Signed</td>` : ""}
                                </tr>
                                <tr>
                                    <td>USCAN</td>
                                    ${usHtml}
                                </tr>`
            $("#report_sow_account_body").append(sowHtmlData);
        })

        let accOverallStatusData = sowData.ACCOUNT_OVERALL;
        let prosposalData = accOverallStatusData.PROPOSAL_OVERALL;
        let renewalData = accOverallStatusData.RENEWAL_OVERALL;
        let signedData = accOverallStatusData.SIGNED_OVERALL;
        let qualifiedData = accOverallStatusData.QUALIFIED_OVERALL;
        let prosposalDataLen = parseInt(accOverallStatusData.PROPOSAL_OVERALL_COUNT);
        let signedIndHtml = "", signedUSHtml = ""
        if (signedData.length > 0) {
            $.each(signedData, function (i, signed) {
                let dataYrFil = (signed.MONTH).split('-');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    signedIndHtml += `<td>${signed.IND_COUNT}</td>`
                    signedUSHtml += `<td>${signed.US_COUNT}</td>`
                }
            })
            let signedAllDataHtml = `<tr class="overall_total_bg top_broder_bg">
                                        <td rowspan="2">Overall Total</td>
                                        <td rowspan="2"></td>
                                        <td>IND</td>
                                        ${signedIndHtml}
                                        <td rowspan="2">Signed</td>
                                    </tr>
                                    <tr class="overall_total_bg">
                                        <td>USCAN</td>
                                        ${signedUSHtml}
                                    </tr>`
            $("#report_sow_account_body").append(signedAllDataHtml);
        }
        let renewalIndHtml = "", renewalUSHtml = ""
        if (renewalData.length > 0) {
            $.each(renewalData, function (i, renewal) {
                let dataYrFil = (renewal.MONTH).split('-');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    renewalIndHtml += `<td>${renewal.IND_COUNT}</td>`
                    renewalUSHtml += `<td>${renewal.US_COUNT}</td>`
                }
            })
            let renewalAllDataHtml = `<tr class="renewal_bg top_broder_bg">
                                        <td rowspan="2">Total</td>
                                        <td rowspan="2"></td>
                                        <td>IND</td>
                                        ${renewalIndHtml}
                                        <td rowspan="2">Renewal</td>
                                    </tr>
                                    <tr class="renewal_bg">
                                        <td>USCAN</td>
                                        ${renewalUSHtml}
                                    </tr>`
            $("#report_sow_account_body").append(renewalAllDataHtml);
        }
        let propHtmlData = "";
        if (prosposalDataLen > 0) {
            $.each(prosposalData, function (i, prosposal) {
                let prospTypeName = prosposal.SOW_TYPE;
                let prospTypeData = prosposal.PROPOSAL_OVERALL;
                let indHtml = "", usHtml = "";
                if (prospTypeData.length > 0) {
                    $.each(prospTypeData, function (j, propType) {
                        let dataYrFil = (propType.MONTH).split('-');
                        if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                            indHtml += `<td>${propType.IND_COUNT}</td>`
                            usHtml += `<td>${propType.US_COUNT}</td>`
                        }
                    });
                    if (prosposalDataLen == 1) {
                        propHtmlData += `<tr class="proposal_bg top_broder_bg">
                                                <td rowspan="2">Total</td>
                                                <td rowspan="2">${prospTypeName}</td>
                                                <td>IND</td>
                                                ${indHtml}
                                                <td rowspan="2">Proposal</td>
                                            </tr>
                                            <tr class="proposal_bg">
                                                <td>USCAN</td>
                                                ${usHtml}
                                                
                                            </tr>`
                    } else if (prosposalDataLen == 2) {
                        propHtmlData += `<tr class="proposal_bg top_broder_bg">
                                                ${i == 0 ? `<td rowspan="4">Total</td>` : ""}
                                                <td rowspan="2">${prospTypeName}</td>
                                                <td>IND</td>
                                                ${indHtml}
                                                ${i == 0 ? `<td rowspan="4">Proposal</td>` : ""}
                                            </tr>
                                            <tr class="proposal_bg">
                                                <td>USCAN</td>
                                                ${usHtml}
                                                
                                            </tr>`
                    }
                }
            })
            $("#report_sow_account_body").append(propHtmlData);
        }
        let qualifiedIndHtml = "", qualifiedUSHtml = ""; qualifiedAllDataHtml = ""
        if (qualifiedData.length > 0) {
            $.each(qualifiedData, function (i, renewal) {
                let dataYrFil = (renewal.MONTH).split('-');
                if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                    qualifiedIndHtml += `<td>${renewal.IND_COUNT}</td>`
                    qualifiedUSHtml += `<td>${renewal.US_COUNT}</td>`
                }
            })
            qualifiedAllDataHtml = `<tr class="proposal_bg top_broder_bg">
                                        <td rowspan="2">Total</td>
                                        <td rowspan="2"></td>
                                        <td>IND</td>
                                        ${qualifiedIndHtml}
                                        <td rowspan="2">Qualified</td>
                                    </tr>
                                    <tr class="proposal_bg">
                                        <td>USCAN</td>
                                        ${qualifiedUSHtml}
                                    </tr>`
        }
        if (qualifiedData == undefined) {
            let len = 8
            if (prosposalDataLen == 0) {
                len = len - 4
            } else if (prosposalDataLen == 1) {
                len = len - 2
            }
            if (renewalData.length == 0) {
                len = len - 2
            }
            if (signedData.length == 0) {
                len = len - 2
            }
            $("#" + accId).attr("rowspan", addSowToAccRow + len);
        } else {
            let len = 10
            if (prosposalDataLen == 0) {
                len = len - 4
            } else if (prosposalDataLen == 1) {
                len = len - 2
            }
            if (qualifiedData.length == 0) {
                len = len - 2
            }
            if (renewalData.length == 0) {
                len = len - 2
            }
            if (signedData.length == 0) {
                len = len - 2
            }
            $("#" + accId).attr("rowspan", addSowToAccRow + len);
            $("#report_sow_account_body").append(qualifiedAllDataHtml);
        }


        $("#report_sow_account_body").append(`<tr style="background-color: white"><td colspan="17"><hr></td></tr>`);

    });

    let finalOverallData = resData.OVERALL_DATA;
    let signedOverllTotalData = finalOverallData.SIGNED_OVERALL;
    let greenOverallTotalData = finalOverallData.GREEN_OVERALL;
    let signedGreenOverallTotalData = finalOverallData.SIGNED_GREEN_OVERALL;

    let totalSignHtml = "", totalGreenHtml = "", totalSignGreenHtml = "";
    let signTotal = "", signInd = "", signUS = "", greenTotal = "", greenInd = "", greenUS = "";
    let signGreenTotal = "", signGreenInd = "", signGreenUS = "";
    if (signedOverllTotalData.length > 0) {
        $.each(signedOverllTotalData, function (i) {
            let dataYrFil = (signedOverllTotalData[i].MONTH).split('-');
            if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                signTotal += `<td>${signedOverllTotalData[i].TOTAL_COUNT}</td>`
                signInd += `<td>${signedOverllTotalData[i].IND_COUNT}</td>`
                signUS += `<td>${signedOverllTotalData[i].US_COUNT}</td>`
            }
        })
        totalSignHtml = `<tr class="overall_total_bg top_space">
                            <td rowspan="3">Signed Total</td>
                            <td></td>
                            <td></td>
                            <td>Overall Total</td>
                            ${signTotal}
                            <td rowspan="3"></td>
                        </tr>
                        <tr class="overall_total_bg">
                            <td></td>
                            <td></td>
                            <td>IND</td>
                            ${signInd}
                        </tr>
                        <tr class="overall_total_bg">
                            <td></td>
                            <td></td>
                            <td>USCAN</td>
                            ${signUS}
                        </tr>`
        $("#report_sow_account_body").append(totalSignHtml);
    }
    if (greenOverallTotalData.length > 0) {
        $.each(greenOverallTotalData, function (i) {
            let dataYrFil = (greenOverallTotalData[i].MONTH).split('-');
            if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                greenTotal += `<td>${greenOverallTotalData[i].TOTAL_COUNT}</td>`
                greenInd += `<td>${greenOverallTotalData[i].IND_COUNT}</td>`
                greenUS += `<td>${greenOverallTotalData[i].US_COUNT}</td>`
            }
        })
        totalGreenHtml = `<tr class="proposal_bg top_space">
                            <td rowspan="3">Green Total</td>
                            <td></td>
                            <td></td>
                            <td>Overall Total</td>
                            ${greenTotal}
                            <td rowspan="3"></td>
                        </tr>
                        <tr class="proposal_bg">
                            <td></td>
                            <td></td>
                            <td>IND</td>
                            ${greenInd}
                        </tr>
                        <tr class="proposal_bg">
                            <td></td>
                            <td></td>
                            <td>USCAN</td>
                            ${greenUS}
                        </tr>`
        $("#report_sow_account_body").append(totalGreenHtml);
    }

    if (signedGreenOverallTotalData.length > 0) {
        $.each(signedGreenOverallTotalData, function (i) {
            let dataYrFil = (signedGreenOverallTotalData[i].MONTH).split('-');
            if (dataYrFil[dataYrFil.length - 1] == selectYr) {
                signGreenTotal += `<td>${signedGreenOverallTotalData[i].TOTAL_COUNT}</td>`
                signGreenInd += `<td>${signedGreenOverallTotalData[i].IND_COUNT}</td>`
                signGreenUS += `<td>${signedGreenOverallTotalData[i].US_COUNT}</td>`
            }
        })
        totalGreenHtml = `<tr class="overall_total top_space">
                        <td rowspan="3">Signed + Green Total</td>
                        <td></td>
                        <td></td>
                        <td>Overall Total</td>
                        ${signGreenTotal}
                        <td rowspan="3"></td>
                    </tr>
                    <tr class="overall_total">
                        <td></td>
                        <td></td>
                        <td>IND</td>
                        ${signGreenInd}
                    </tr>
                    <tr class="overall_total">
                        <td></td>
                        <td></td>
                        <td>USCAN</td>
                        ${signGreenUS}
                    </tr>`
        $("#report_sow_account_body").append(totalGreenHtml);
    }
}

function downloadExcel() {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    let CurrentDateTime = date + '_' + time;
    $("#res_by_account_green_signed").remove(".noExl").table2excel({
        exclude: ".noExl",
        name: "Reports Resource By SOW",
        filename: "reports_Resource_By_SOW_" + CurrentDateTime,
        fileext: ".xls",
    });
}

