let approvalLocalData = "";
function assignApprovalData() {
    approvalLocalData = sessionStorage.getItem("workflow-data");
    approvalLocalData = $.parseJSON(approvalLocalData);
    if (approvalLocalData == null) {
        $(".loader").show();
        $(".employee_form").hide();
        setTimeout(function () {
            try {
                getEachApprovalData();
            }
            catch (err) {
                setTimeout(function () {
                    getEachApprovalData();

                }, 500)
            }
        }, 1000);

    } else {
        ApprovalData(approvalLocalData)
    }

}

function getEachApprovalData() {
    let accessDetails = "{ \"ACCESS_LEVEL\" : \"" + accese_level +
        "\", \"Access\":\"" + accessData +
        "\", \"EDIT_ACCESS\":\"" + edit_access +
        "\", \"EMAIL_ID\":\"" + sessionName +
        "\", \"GROUP_NAME\":\"" + groupName +
        "\", \"USERNAME\":\"" + empName +
        "\", \"USER_ID\":\"" + empId +
        "\"}";
    let searchPathVal = sessionStorage.getItem("currentUrlSearch")
    searchPathVal = searchPathVal.replace("?approval_req=", "");
    $.ajax({
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data:JSON.stringify({
            query_type: "approval_data_for_particular_request",
            "request_id": searchPathVal,
            "environment": apiValue.environment,
            "user_details": "[" + accessDetails + "]",
        }),
        success: function (dataJson) {
            if (dataJson[0].MESSAGE == "Success") {
                let singleAuditData = dataJson[0].DATA
                ApprovalData(singleAuditData[0])
            } else if (dataJson[0].MESSAGE == "No access") {
                bootbox.alert({
                    message: "<center><b>No Access for this request ID</b></center>",
                    callback: function () {
                        window.location.href = 'workflowDetails.html';
                    }
                })
            } else {
                bootbox.alert({
                    message: "<center><b>" + dataJson[0].MESSAGE + "</b></center>",
                    callback: function () {
                        window.location.href = 'workflowDetails.html';
                    }
                })
            }
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });

}

function ApprovalData(approvalLocalData) {
    // let accountNewData = approvalLocalData.NEW;
    // let accountOldData = approvalLocalData.OLD;
    let searchPathVal = sessionStorage.getItem("currentUrlSearch")
    searchPathVal = searchPathVal.replace("?approval_req=", "");
    let reqLen = approvalLocalData.length;
    let requestID = approvalLocalData.REQUEST_ID;
    if (reqLen != undefined) {
        requestID = approvalLocalData[0].REQUEST_ID;
    }
    if (searchPathVal != requestID) {
        bootbox.alert({
            message: "<center><b>Approval Request ID not found</b></center>",
            callback: function () {
                window.location.href = 'workflowDetails.html';
            }
        })

    } else {
        let oldSowMasterData = [], newSowMasterData = [], approvalStatus, raisedByID, raisedBy, rasiedDate
        if (reqLen != undefined) {
            requestID = approvalLocalData[0].REQUEST_ID;
            approvalStatus = approvalLocalData[0].APPROVAL_STATUS;
            raisedByID = approvalLocalData[0].RAISED_BY;
            raisedBy = approvalLocalData[0].RAISED_BY_NAME;
            rasiedDate = approvalLocalData[0].RAISED_ON;
        } else {
            if (requestID.includes("TEAM_ALLOCATION")) {
                approvalLocalData = approvalLocalData.REQUEST_DATA
                approvalStatus = approvalLocalData[0].APPROVAL_STATUS;
                raisedByID = approvalLocalData[0].RAISED_BY;
                raisedBy = approvalLocalData[0].RAISED_BY_NAME;
                rasiedDate = approvalLocalData[0].RAISED_ON;
            } else if (requestID.includes("RESOURCE_ALLOCATION")) {
                let dataTemp = approvalLocalData
                approvalLocalData = approvalLocalData.REQUEST_DATA
                if (approvalLocalData == undefined) {
                    approvalLocalData = dataTemp
                    oldSowMasterData = approvalLocalData.OLD;
                    newSowMasterData = approvalLocalData.NEW;
                    approvalStatus = approvalLocalData.APPROVAL_STATUS;
                    raisedByID = approvalLocalData.RAISED_BY;
                    raisedBy = approvalLocalData.RAISED_BY_NAME;
                    rasiedDate = approvalLocalData.RAISED_ON;
                } else {
                    oldSowMasterData = approvalLocalData[0].OLD;
                    newSowMasterData = approvalLocalData[0].NEW;
                    approvalStatus = approvalLocalData[0].APPROVAL_STATUS;
                    raisedByID = approvalLocalData[0].RAISED_BY;
                    raisedBy = approvalLocalData[0].RAISED_BY_NAME;
                    rasiedDate = approvalLocalData[0].RAISED_ON;
                }
            } else {
                approvalStatus = approvalLocalData.APPROVAL_STATUS;
                if (approvalStatus == undefined) {
                    approvalLocalData = approvalLocalData.REQUEST_DATA
                    oldSowMasterData = approvalLocalData[0].OLD;
                    newSowMasterData = approvalLocalData[0].NEW;
                    approvalStatus = approvalLocalData[0].APPROVAL_STATUS;
                    raisedByID = approvalLocalData[0].RAISED_BY;
                    raisedBy = approvalLocalData[0].RAISED_BY_NAME;
                    rasiedDate = approvalLocalData[0].RAISED_ON;
                } else {
                    approvalStatus = approvalLocalData.APPROVAL_STATUS;
                    raisedByID = approvalLocalData.RAISED_BY;
                    raisedBy = approvalLocalData.RAISED_BY_NAME;
                    rasiedDate = approvalLocalData.RAISED_ON;
                    oldSowMasterData = approvalLocalData.OLD[0];
                    newSowMasterData = approvalLocalData.NEW[0];
                }
            }

        }
        let checkSowData = requestID.includes("SOW_DATA");
        let checkResData = requestID.includes("RESOURCE_ALLOCATION");
        let checkDelData = requestID.includes("SOW_DELETE");
        let checkAccRemData = requestID.includes("ACCOUNT_REMOVED");
        let checkTeamAllocData = requestID.includes("TEAM_ALLOCATION");
        $(".team_alloc").hide()
        $(".sow_date").hide()
        if (checkSowData) {
            let AccountName = newSowMasterData.ACCOUNT_NAME;
            if (AccountName == undefined) {
                newSowMasterData = newSowMasterData[0]
                oldSowMasterData = oldSowMasterData[0]
                AccountName = newSowMasterData.ACCOUNT_NAME;
            }
            let sowName = newSowMasterData.SOW_NAME;
            let oldPersonaData = [];
            let newPersonaData = newSowMasterData.BILLING_RATE_DATA;
            let oldDataFlag = false;
            if (oldSowMasterData != undefined) {
                oldDataFlag = true
                oldPersonaData = oldSowMasterData.BILLING_RATE_DATA;

            }
            $("#accountName").html(AccountName);
            $("#temp_sow_name").html(sowName);
            $("#sowName").html(sowName + `${approvalLocalData.DESCRIPTION == "" ? "" : `<span class="desc_data">${approvalLocalData.DESCRIPTION}</span>`}`);
            $("#requestID").html(requestID);
            $("#approvalStatus").html(approvalStatus);
            $("#raisedByName").html(raisedBy);
            $("#raisedById").html(raisedByID);
            $("#raisedDate").html(rasiedDate);
            if (empId == raisedByID) {
                $(".approveButton").hide();
                $(".extra_space").hide();
            }
            if (oldDataFlag) {

                let sow_Data = `<tr class="${oldSowMasterData.SOW_STATUS == newSowMasterData.SOW_STATUS ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Funnel Stage</td>
                                    <td><div class="noChange">${oldSowMasterData.SOW_STATUS}</div></td>
                                    <td><div class="${oldSowMasterData.SOW_STATUS == newSowMasterData.SOW_STATUS ? "noChange" : "changed"}">${newSowMasterData.SOW_STATUS}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.PROBABILITY == newSowMasterData.PROBABILITY ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Probability</td>
                                    <td><div class="noChange">${oldSowMasterData.PROBABILITY}</div></td>
                                    <td><div class="${oldSowMasterData.PROBABILITY == newSowMasterData.PROBABILITY ? "noChange" : "changed"}">${newSowMasterData.PROBABILITY}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.SOW_TYPE == newSowMasterData.SOW_TYPE ? "nodataChanged" : ""}">
                                    <td class="columnTitle">SOW Type</td>
                                    <td><div class="noChange">${oldSowMasterData.SOW_TYPE}</div></td>
                                    <td><div class="${oldSowMasterData.SOW_TYPE == newSowMasterData.SOW_TYPE ? "noChange" : "changed"}">${newSowMasterData.SOW_TYPE}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.BILLING_MODEL == newSowMasterData.BILLING_MODEL ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Billing Type</td>
                                    <td><div class="noChange">${oldSowMasterData.BILLING_MODEL}</div></td>
                                    <td><div class="${oldSowMasterData.BILLING_MODEL == newSowMasterData.BILLING_MODEL ? "noChange" : "changed"}">${newSowMasterData.BILLING_MODEL}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.LEGAL_START_DATE == newSowMasterData.LEGAL_START_DATE ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Legal Start Date</td>
                                    <td><div class="noChange">${convert(oldSowMasterData.LEGAL_START_DATE)}</div></td>
                                    <td><div class="${oldSowMasterData.LEGAL_START_DATE == newSowMasterData.LEGAL_START_DATE ? "noChange" : "changed"}">${convert(newSowMasterData.LEGAL_START_DATE)}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.LEGAL_END_DATE == newSowMasterData.LEGAL_END_DATE ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Legal End Date</td>
                                    <td><div class="noChange">${convert(oldSowMasterData.LEGAL_END_DATE)}</div></td>
                                    <td><div class="${oldSowMasterData.LEGAL_END_DATE == newSowMasterData.LEGAL_END_DATE ? "noChange" : "changed"}">${convert(newSowMasterData.LEGAL_END_DATE)}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.BILLING_START_DATE == newSowMasterData.BILLING_START_DATE ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Billing Start Date</td>
                                    <td><div class="noChange">${convert(oldSowMasterData.BILLING_START_DATE)}</div></td>
                                    <td><div class="${oldSowMasterData.BILLING_START_DATE == newSowMasterData.BILLING_START_DATE ? "noChange" : "changed"}">${convert(newSowMasterData.BILLING_START_DATE)}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.BILLING_END_DATE == newSowMasterData.BILLING_END_DATE ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Billing End Date</td>
                                    <td><div class="noChange">${convert(oldSowMasterData.BILLING_END_DATE)}</div></td>
                                    <td><div class="${oldSowMasterData.BILLING_END_DATE == newSowMasterData.BILLING_END_DATE ? "noChange" : "changed"}">${convert(newSowMasterData.BILLING_END_DATE)}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.ACTUAL_START_DATE == newSowMasterData.ACTUAL_START_DATE ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Actual Start Date</td>
                                    <td><div class="noChange">${convert(oldSowMasterData.ACTUAL_START_DATE)}</div></td>
                                    <td><div class="${oldSowMasterData.ACTUAL_START_DATE == newSowMasterData.ACTUAL_START_DATE ? "noChange" : "changed"}">${convert(newSowMasterData.ACTUAL_START_DATE)}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.ACTUAL_END_DATE == newSowMasterData.ACTUAL_END_DATE ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Actual End Date</td>
                                    <td><div class="noChange">${convert(oldSowMasterData.ACTUAL_END_DATE)}</div></td>
                                    <td><div class="${oldSowMasterData.ACTUAL_END_DATE == newSowMasterData.ACTUAL_END_DATE ? "noChange" : "changed"}">${convert(newSowMasterData.ACTUAL_END_DATE)}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.SOW_AMOUNT == newSowMasterData.SOW_AMOUNT ? "nodataChanged" : ""}">
                                    <td class="columnTitle">SOW Amount</td>
                                    <td><div class="noChange">${oldSowMasterData.SOW_AMOUNT}</div></td>
                                    <td><div class="${oldSowMasterData.SOW_AMOUNT == newSowMasterData.SOW_AMOUNT ? "noChange" : "changed"}">${newSowMasterData.SOW_AMOUNT}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.NUMBER_OF_RESOURCE_US == newSowMasterData.NUMBER_OF_RESOURCE_US ? "nodataChanged" : ""}">
                                    <td class="columnTitle">US Team</td>
                                    <td><div class="noChange">${oldSowMasterData.NUMBER_OF_RESOURCE_US}</div></td>
                                    <td><div class="${oldSowMasterData.NUMBER_OF_RESOURCE_US == newSowMasterData.NUMBER_OF_RESOURCE_US ? "noChange" : "changed"}">${newSowMasterData.NUMBER_OF_RESOURCE_US}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.NUMBER_OF_RESOURCE_IND == newSowMasterData.NUMBER_OF_RESOURCE_IND ? "nodataChanged" : ""}">
                                    <td class="columnTitle">India Team</td>
                                    <td><div class="noChange">${oldSowMasterData.NUMBER_OF_RESOURCE_IND}</div></td>
                                    <td><div class="${oldSowMasterData.NUMBER_OF_RESOURCE_IND == newSowMasterData.NUMBER_OF_RESOURCE_IND ? "noChange" : "changed"}">${newSowMasterData.NUMBER_OF_RESOURCE_IND}</div></td>
                                <tr>`

                $("#sowWorkflowData").append(sow_Data);
            } else {

                let sow_Data = `<tr>
                                    <td class="columnTitle">Funnel Stage</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${newSowMasterData.SOW_STATUS}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Probability</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${newSowMasterData.PROBABILITY}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">SOW Type</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${newSowMasterData.SOW_TYPE}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Billing Type</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${newSowMasterData.BILLING_MODEL}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Legal Start Date</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${convert(newSowMasterData.LEGAL_START_DATE)}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Legal End Date</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${convert(newSowMasterData.LEGAL_END_DATE)}</div></td>
                                <tr>
                                <tr>
        
                                    <td class="columnTitle">Billing Start Date</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${convert(newSowMasterData.BILLING_START_DATE)}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Billing End Date</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${convert(newSowMasterData.BILLING_END_DATE)}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Actual Start Date</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${convert(newSowMasterData.ACTUAL_START_DATE)}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Actual End Date</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${convert(newSowMasterData.ACTUAL_END_DATE)}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">SOW Amount</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${newSowMasterData.SOW_AMOUNT}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">US Team</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${newSowMasterData.NUMBER_OF_RESOURCE_US}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">India Team</td>
                                    <td><div class="noChange">-</div></td>
                                    <td><div class="changed">${newSowMasterData.NUMBER_OF_RESOURCE_IND}</div></td>
                                <tr>`

                $("#sowWorkflowData").append(sow_Data);
            }

            $.each(oldPersonaData, function (i, oldPersona) {
                let skillData = oldPersona.SKILL_DATA;
                let skills = [];
                // if (skillData != "") {
                if (skillData > 0) {
                    skills = skillData.split(",");
                    skillData = tootTipRole_op(skills)
                }
                let oldPersonaHtml = `<tr>
                                        <td style="display:none">${oldPersona.RESOURCE_GROUP}</td>
                                        <td>
                                          <div class="persona_button">
                                            ${createDiv(oldPersona.SKILLS_PERSONA, skillData)}
                                          </div>
                                        </td>
                                        <td>
                                            ${convert(oldPersona.START_DATE)}
                                        </td>
                                        <td>
                                            ${convert(oldPersona.END_DATE)}
                                        </td>
                                        <td>
                                            ${oldPersona.LOCATION}
                                        </td>
                                        <td>
                                            ${oldPersona.BILLING_STATUS}
                                        </td>
                                        <td>
                                            ${oldPersona.BILLING_RATE}
                                        </td>
                                        <td>
                                            ${oldPersona.COUNT}
                                        </td>
                                    </tr>`
                $("#oldPerosnaDetails").append(oldPersonaHtml);
            });

            $.each(newPersonaData, function (i, newPersona) {
                let skillData = newPersona.SKILL_DATA;
                let skills = [];
                if (skillData > 0) {
                    skills = skillData.split(",");
                    skillData = tootTipRole_op(skills)
                }
                let newPersonaHtml = `<tr>
                                        <td style="display:none">${newPersona.RESOURCE_GROUP}</td>
                                        <td>
                                          <div class="persona_button">
                                            ${createDiv(newPersona.SKILLS_PERSONA, skillData)}
                                          </div>
                                        </td>
                                        <td>
                                            ${convert(newPersona.START_DATE)}
                                        </td>
                                        <td>
                                            ${convert(newPersona.END_DATE)}
                                        </td>
                                        <td>
                                            ${newPersona.LOCATION}
                                        </td>
                                        <td>
                                            ${newPersona.BILLING_STATUS}
                                        </td>
                                        <td>
                                            ${newPersona.BILLING_RATE}
                                        </td>
                                        <td>
                                            ${newPersona.COUNT}
                                        </td>
                                    </tr>`
                $("#newPerosnaDetails").append(newPersonaHtml);
            });
            if (oldSowMasterData == undefined) {
                $(".oldData").hide();
                $(".newPersonaDetails").removeClass("col-sm-6");
                $(".newPersonaDetails").addClass("col-sm-12");
            }
        }

        if (checkResData) {

            let AccountName = newSowMasterData.ACCOUNT_NAME;
            if (AccountName == undefined) {
                AccountName = newSowMasterData[0].ACCOUNT_NAME;
            }
            let sowName = newSowMasterData.SOW_NAME;
            if (sowName == undefined) {
                sowName = newSowMasterData[0].SOW_NAME;
            }
            let sowDes = approvalLocalData.DESCRIPTION
            if (sowDes == undefined) {
                sowDes = approvalLocalData[0].DESCRIPTION
            }
            let oldPersonaData = [];
            let newPersonaData = newSowMasterData.BILLING_RATE_DATA;
            
            $("#accountName").html(AccountName);
            $("#temp_sow_name").html(sowName);
            $("#sowName").html(sowName + `${sowDes == "" ? "" : `<span class="desc_data">${sowDes}</span>`}`);
            $("#requestID").html(requestID);
            $("#approvalStatus").html(approvalStatus);
            $("#raisedByName").html(raisedBy);
            $("#raisedById").html(raisedByID);
            $("#raisedDate").html(rasiedDate);
            if (empId == raisedByID) {
                $(".approveButton").hide();
                $(".extra_space").hide();
            }
            if (requestID.includes("RESOURCE_ALLOCATION_REVENUE")) {
                $("#sowWorkflowData").hide()
                $(".allColumnData").hide()
                $("#resource_all_revenue").show();
                $(".resource_existing").hide();
                $(".resource_new").hide();
                let oldResAllData = approvalLocalData.OLD;
                let newResAllData = approvalLocalData.NEW;
                if (oldResAllData == undefined) {
                    oldResAllData = approvalLocalData[0].OLD;
                }
                if (newResAllData == undefined) {
                    newResAllData = approvalLocalData[0].NEW;
                }

                if (oldResAllData.length > 0) {
                    $(".resource_existing").show();
                    let oldTabledata = "";
                    $.each(oldResAllData, function (i, resOldData) {
                        let skillHtml = "", skillPersonaHtml = "";
                        $.each(resOldData.SKILLS_LEVEL, function (j, skillData) {
                            skillHtml += `<button class="skill_data">${skillData}</button>`
                        })
                        if (skillHtml.endsWith(",")) {
                            skillHtml = skillHtml.slice(0, -1);
                        }
                        $.each(resOldData.SKILLS_PERSONA, function (k, persona) {
                            skillPersonaHtml += ` ${persona},`
                        })
                        if (skillPersonaHtml.endsWith(",")) {
                            skillPersonaHtml = skillPersonaHtml.slice(0, -1);
                        }
                        oldTabledata = `<tr>
                                            <td>${resOldData.EMPLOYEE_NAME}</td>
                                            <td>${resOldData.COUNTRY}</td>
                                            <td>${convert(resOldData.ALLOCATION_START_DATE)}</td>
                                            <td>${convert(resOldData.ALLOCATION_END_DATE)}</td>
                                            <td>${resOldData.BILLING_STATUS}</td>
                                            <td>${resOldData.IN_NOTICE_PERIOD}</td>
                                            <td>${skillPersonaHtml == "" ? "-" : skillPersonaHtml}</td>
                                            <td class="more">${skillHtml == "" ? "-" : skillHtml}</td>
                                        </tr>`
                        $("#existing_res_revenue").append(oldTabledata)
                    })
                }
                if (newResAllData.length > 0) {
                    $(".resource_new").show();
                    let newTabledata = "";
                    $.each(newResAllData, function (i, resNewData) {
                        let skillHtml = "", skillPersonaHtml = "";
                        $.each(resNewData.SKILLS_LEVEL, function (j, skillData) {
                            // skillHtml += ` ${skillData},`
                            skillHtml += `<button class="skill_data">${skillData}</button>`
                        })
                        if (skillHtml.endsWith(",")) {
                            skillHtml = skillHtml.slice(0, -1);
                        }
                        $.each(resNewData.SKILLS_PERSONA, function (k, persona) {
                            skillPersonaHtml += ` ${persona},`
                        })
                        if (skillPersonaHtml.endsWith(",")) {
                            skillPersonaHtml = skillPersonaHtml.slice(0, -1);
                        }
                        newTabledata = `<tr>
                                            <td>${resNewData.EMPLOYEE_NAME}</td>
                                            <td>${resNewData.COUNTRY}</td>
                                            <td>${convert(resNewData.ALLOCATION_START_DATE)}</td>
                                            <td>${convert(resNewData.ALLOCATION_END_DATE)}</td>
                                            <td>${resNewData.BILLING_STATUS}</td>
                                            <td>${resNewData.IN_NOTICE_PERIOD}</td>
                                            <td>${skillPersonaHtml == "" ? "-" : skillPersonaHtml}</td>
                                            <td class="more">${skillHtml == "" ? "-" : skillHtml}</td>
                                        </tr>`
                        $("#new_res_revenue").append(newTabledata)
                    })
                }

            } else {
                $("#sowWorkflowData").show()
                $(".allColumnData").show()
                let sow_Data = `<tr class="${oldSowMasterData.EMPLOYEE_NAME == newSowMasterData.EMPLOYEE_NAME ? "nodataChanged" : ""}">
                                        <td class="columnTitle">Employee Name</td>
                                        <td><div class="noChange">${oldSowMasterData.EMPLOYEE_NAME}</div></td>
                                        <td><div class="${oldSowMasterData.EMPLOYEE_NAME == newSowMasterData.EMPLOYEE_NAME ? "noChange" : "changed"}">${newSowMasterData.EMPLOYEE_NAME}</div></td>
                                    <tr>
                                    <tr class="${oldSowMasterData.ACCOUNT_NAME == newSowMasterData.ACCOUNT_NAME ? "nodataChanged" : ""}">
                                        <td class="columnTitle">Account Name</td>
                                        <td><div class="noChange">${oldSowMasterData.ACCOUNT_NAME}</div></td>
                                        <td><div class="${oldSowMasterData.ACCOUNT_NAME == newSowMasterData.ACCOUNT_NAME ? "noChange" : "changed"}">${newSowMasterData.ACCOUNT_NAME}</div></td>
                                    <tr>
                                    <tr class="${oldSowMasterData.SOW_NAME == newSowMasterData.SOW_NAME ? "nodataChanged" : ""}">
                                        <td class="columnTitle">SOW Name</td>
                                        <td><div class="noChange">${oldSowMasterData.SOW_NAME}</div></td>
                                        <td><div class="${oldSowMasterData.SOW_NAME == newSowMasterData.SOW_NAME ? "noChange" : "changed"}">${newSowMasterData.SOW_NAME}</div></td>
                                    <tr>
                                    <tr class="${oldSowMasterData.MANAGER_NAME == newSowMasterData.MANAGER_NAME ? "nodataChanged" : ""}">
                                        <td class="columnTitle">Manager Name</td>
                                        <td><div class="noChange">${oldSowMasterData.MANAGER_NAME}</div></td>
                                        <td><div class="${oldSowMasterData.MANAGER_NAME == newSowMasterData.MANAGER_NAME ? "noChange" : "changed"}">${newSowMasterData.MANAGER_NAME}</div></td>
                                    <tr>
                                    <tr class="${oldSowMasterData.ALLOCATION_START_DATE == newSowMasterData.ALLOCATION_START_DATE ? "nodataChanged" : ""}">
                                        <td class="columnTitle">Project Allocation Start Date</td>
                                        <td><div class="noChange">${convert(oldSowMasterData.ALLOCATION_START_DATE)}</div></td>
                                        <td><div class="${oldSowMasterData.ALLOCATION_START_DATE == newSowMasterData.ALLOCATION_START_DATE ? "noChange" : "changed"}">${convert(newSowMasterData.ALLOCATION_START_DATE)}</div></td>
                                    <tr>
                                    <tr class="${oldSowMasterData.ALLOCATION_END_DATE == newSowMasterData.ALLOCATION_END_DATE ? "nodataChanged" : ""}">
                                        <td class="columnTitle">Project Allocation End Date</td>
                                        <td><div class="noChange">${convert(oldSowMasterData.ALLOCATION_END_DATE)}</div></td>
                                        <td><div class="${oldSowMasterData.ALLOCATION_END_DATE == newSowMasterData.ALLOCATION_END_DATE ? "noChange" : "changed"}">${convert(newSowMasterData.ALLOCATION_END_DATE)}</div></td>
                                    <tr>`

                $("#sowWorkflowData").append(sow_Data);
                $(".allColumnData").hide();
            }

        }

        if (checkDelData) {

            let AccountName = newSowMasterData.ACCOUNT_NAME;
            if (AccountName == undefined) {
                newSowMasterData = newSowMasterData[0]
                oldSowMasterData = oldSowMasterData[0]
                AccountName = newSowMasterData.ACCOUNT_NAME;
            }
            let sowName = newSowMasterData.SOW_NAME;
            let oldPersonaData = [];
            let newPersonaData = newSowMasterData.BILLING_RATE_DATA;
            $("#header_before").hide();

            $("#accountName").html(AccountName);
            $("#temp_sow_name").html(sowName);
            let desc = approvalLocalData.DESCRIPTION
            if(desc == undefined){
                desc = approvalLocalData[0].DESCRIPTION
                if(desc == undefined){
                    desc = ""
                }
            }
            $("#sowName").html(sowName + ` ${desc == "" ? "" : `<span class="desc_data">${desc}</span>`}`);
            $("#requestID").html(requestID);
            $("#approvalStatus").html(approvalStatus);
            $("#raisedByName").html(raisedBy);
            $("#raisedById").html(raisedByID);
            $("#raisedDate").html(rasiedDate);
            if (empId == raisedByID) {
                $(".approveButton").hide();
                $(".extra_space").hide();
            }

            $("#sowWorkflowData").show()
            $(".allColumnData").show()
            let sow_Data = `<tr>
                                    <td class="columnTitle">Funnel Stage</td>
                                    <td><div class="changed">${newSowMasterData.SOW_STATUS}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Probability</td>
                                    <td><div class="changed">${newSowMasterData.PROBABILITY}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">SOW Type</td>
                                    <td><div class="changed">${newSowMasterData.SOW_TYPE}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Billing Type</td>
                                    <td><div class="changed">${newSowMasterData.PRICING_PLAN}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Legal Start Date</td>
                                    <td><div class="changed">${convert(newSowMasterData.LEGAL_START_DATE)}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Legal End Date</td>
                                    <td><div class="changed">${convert(newSowMasterData.LEGAL_END_DATE)}</div></td>
                                <tr>
                                <tr>
        
                                    <td class="columnTitle">Billing Start Date</td>
                                    <td><div class="changed">${convert(newSowMasterData.BILLING_START_DATE)}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Billing End Date</td>
                                    <td><div class="changed">${convert(newSowMasterData.BILLING_END_DATE)}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Actual Start Date</td>
                                    <td><div class="changed">${convert(newSowMasterData.ACTUAL_START_DATE)}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Actual End Date</td>
                                    <td><div class="changed">${convert(newSowMasterData.ACTUAL_END_DATE)}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">SOW Amount</td>
                                    <td><div class="changed">${newSowMasterData.SOW_AMOUNT}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">US Team</td>
                                    <td><div class="changed">${newSowMasterData.NUMBER_OF_RESOURCE_US}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">India Team</td>
                                    <td><div class="changed">${newSowMasterData.NUMBER_OF_RESOURCE_IND}</div></td>
                                <tr>`

            $("#sowWorkflowData").append(sow_Data);
            $(".allColumnData").hide();


        }
        if (checkAccRemData) {

            let AccountName = newSowMasterData.ACCOUNT_NAME;
            if(AccountName == undefined){
                newSowMasterData = newSowMasterData[0]
                AccountName = newSowMasterData.ACCOUNT_NAME;
            }
            let sowName = newSowMasterData.SOW_NAME;
            let oldPersonaData = [];
            let newPersonaData = newSowMasterData.BILLING_RATE_DATA;
            $("#header_before").hide();
            $(".sowNameCol").hide();
            $("#request_type").html("ACCOUNT_REMOVED")
            let desc = approvalLocalData.DESCRIPTION
            if(desc == undefined){
                desc = approvalLocalData[0].DESCRIPTION
                if(desc == undefined){
                    desc = ""
                }
            }
            $("#accountName").html(AccountName + `${desc == "" ? "" : `<span class="desc_data">${desc}</span>`}`);
            $("#requestID").html(requestID);
            $("#approvalStatus").html(approvalStatus);
            $("#raisedByName").html(raisedBy);
            $("#raisedById").html(raisedByID);
            $("#raisedDate").html(rasiedDate);
            if (empId == raisedByID) {
                $(".approveButton").hide();
                $(".extra_space").hide();
            }

            $("#sowWorkflowData").show()
            $(".allColumnData").show()
            let sow_Data = `<tr>
                                    <td class="columnTitle">MSA Signed</td>
                                    <td><div class="changed">${convert(newSowMasterData.MSA_SIGNED_DATE)}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Location</td>
                                    <td><div class="changed">${newSowMasterData.LOCATION}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Payment Term</td>
                                    <td><div class="changed">${newSowMasterData.PAYMENT_TERM}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Stake Holder</td>
                                    <td><div class="changed">${newSowMasterData.ACCOUNT_POINT_OF_CONTACT}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Account Head</td>
                                    <td><div class="changed">${newSowMasterData.FACTSPAN_POC_NAME}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Bussiness Head</td>
                                    <td><div class="changed">${newSowMasterData.BUSINESS_HEAD_NAME}</div></td>
                                <tr>
                                <tr>
        
                                    <td class="columnTitle">Delivery Head</td>
                                    <td><div class="changed">${newSowMasterData.DELIVERY_HEAD_NAME}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Size</td>
                                    <td><div class="changed">${newSowMasterData.ACCOUNT_SIZE}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Min Bill Rate (USCAN)</td>
                                    <td><div class="changed">${newSowMasterData.BILLING_DATA[1].BILLING_RATE}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Min Bill Rate (IND)</td>
                                    <td><div class="changed">${newSowMasterData.BILLING_DATA[1].BILLING_RATE}</div></td>
                                <tr>
                                <tr>
                                    <td class="columnTitle">Notes</td>
                                    <td><div class="changed">${newSowMasterData.NOTES == "" ? "-" : newSowMasterData.NOTES}</div></td>
                                <tr>`

            $("#sowWorkflowData").append(sow_Data);
            $(".allColumnData").hide();


        }

        if (checkTeamAllocData) {
            $(".sow_date").show();
            let count = 0
            let AddSubId = ""
            $.each(approvalLocalData, function (i, appTeamData) {
                count++
                let AccountName = appTeamData.ACCOUNT_NAME;
                let sowName = appTeamData.SOW_NAME;

                let oldPersonaData = [];
                let newPersonaData = appTeamData.BILLING_RATE_DATA;

                $("#accountName").html(AccountName);
                $("#temp_sow_name").html(sowName);
                $("#sowName").html(sowName + `${appTeamData.DESCRIPTION == "" ? "" : `<span class="desc_data">${appTeamData.DESCRIPTION}</span>`}`);
                $("#requestID").html(requestID);
                $("#approvalStatus").html(approvalStatus);
                $("#raisedByName").html(raisedBy);
                $("#raisedById").html(raisedByID);
                $("#raisedDate").html(rasiedDate);


                if (requestID.includes("TEAM_ALLOCATION")) {
                    $("#sowWorkflowData").hide()
                    $(".allColumnData").hide()
                    $("#resource_all_revenue").show();
                    $(".resource_existing").hide();
                    $(".resource_new").hide();
                    $("#request_type").html("TEAM_ALLOCATION")
                    let oldResAllData = appTeamData.OLD;
                    let newResAllData = appTeamData.NEW;

                    if (newResAllData.length > 0) {
                        $(".resource_new").show();
                        $(".res_header").hide();
                        $("#new_res_header").hide();
                        $(".extra_space").show();
                        // $(".team_alloc").show();

                        // $("#new_res_revenue").hide();
                        let newTabledata = "";
                        $.each(newResAllData, function (i, resNewData) {
                            $("#sowStartDate").html(convert(resNewData.ACTUAL_START_DATE));
                            $("#sowEndDate").html(convert(resNewData.ACTUAL_END_DATE))
                            let skillHtml = "", skillPersonaHtml = "";
                            $.each(resNewData.SKILLS_LEVEL, function (j, skillData) {
                                // skillHtml += ` ${skillData},`
                                skillHtml += `<button class="skill_data">${skillData}</button>`
                            })
                            if (skillHtml.endsWith(",")) {
                                skillHtml = skillHtml.slice(0, -1);
                            }
                            $.each(resNewData.SKILLS_PERSONA, function (k, persona) {
                                skillPersonaHtml += ` ${persona},`
                            })
                            if (skillPersonaHtml.endsWith(",")) {
                                skillPersonaHtml = skillPersonaHtml.slice(0, -1);
                            }
                            if (resNewData.OPERATION == "New Allocation") {
                                $(".new_team_alloc").show();
                                $("#new_team_alloc_table").show();
                                AddSubId += `${appTeamData.SUB_ID},`
                                newTabledata = `<tr>
                                                <td>
                                                    <input type="checkbox" class="checkBoxClass emp_id" 
                                                    id="ava_inp_emp_${count}"  
                                                    name="emp_${resNewData.EMPLOYEE_ID}" 
                                                    value="${resNewData.EMPLOYEE_ID}">
                                                </td>
                                                <td>${resNewData.EMPLOYEE_NAME}</td>
                                                <td>${resNewData.JOB_ROLE}</td>
                                                <td>${resNewData.LOCATION}</td>
                                                <td>${convert(resNewData.ALLOCATION_START_DATE)}</td>
                                                <td>${convert(resNewData.ALLOCATION_END_DATE)}</td>
                                                <td>${resNewData.BILLING_STATUS}</td>
                                                <td>${resNewData.COMMENT == "" ? "-" : resNewData.COMMENT}</td>
                                                <td style='display:none' class="subId">${appTeamData.SUB_ID}</td>
                                            </tr>`
                                $("#new_team_alloc_table").append(newTabledata)
                            }
                            if (resNewData.OPERATION == "Extension") {
                                $("#existing_team_alloc_table").show();
                                $(".existing_team_alloc").show()
                                AddSubId += `${appTeamData.SUB_ID},`
                                newTabledata = `<tr>
                                                <td>
                                                    <input type="checkbox" class="checkBoxClass emp_id" 
                                                    id="ava_inp_emp_${count}"  
                                                    name="emp_${resNewData.EMPLOYEE_ID}" 
                                                    value="${resNewData.EMPLOYEE_ID}">
                                                </td>
                                                <td>${resNewData.EMPLOYEE_NAME}</td>
                                                <td>${resNewData.JOB_ROLE}</td>
                                                <td>${resNewData.LOCATION}</td>
                                                <td>${resNewData.BILLING_STATUS}</td>
                                                <td>${convert(resNewData.PREVIOUS_START_DATE)}</td>
                                                <td>${(resNewData.PREVIOUS_END_DATE == "" ? "" : convert(resNewData.PREVIOUS_END_DATE))}</td>
                                                <td>${convert(resNewData.ALLOCATION_START_DATE)}</td>
                                                <td>${convert(resNewData.ALLOCATION_END_DATE)}</td>
                                                <td>${resNewData.COMMENT == "" ? "-" : resNewData.COMMENT}</td>
                                                <td style='display:none' class="subId">${appTeamData.SUB_ID}</td>
                                            </tr>`
                                $("#existing_team_alloc_table").append(newTabledata)
                            }
                            if (resNewData.OPERATION == "Release") {
                                $(".release_team_alloc").show();
                                $("#release_team_alloc_table").show();
                                AddSubId += `${appTeamData.SUB_ID},`
                                newTabledata = `<tr>
                                                <td>
                                                    <input type="checkbox" class="checkBoxClass emp_id" 
                                                    id="ava_inp_emp_${count}"  
                                                    name="emp_${resNewData.EMPLOYEE_ID}" 
                                                    value="${resNewData.EMPLOYEE_ID}">
                                                </td>
                                                <td>${resNewData.EMPLOYEE_NAME}</td>
                                                <td>${resNewData.JOB_ROLE}</td>
                                                <td>${resNewData.LOCATION}</td>
                                                <td>${resNewData.BILLING_STATUS}</td>
                                                <td>${convert(resNewData.PREVIOUS_START_DATE)}</td>
                                                <td>${(resNewData.PREVIOUS_END_DATE == "" ? "" : convert(resNewData.PREVIOUS_END_DATE))}</td>
                                                <td>${convert(resNewData.ALLOCATION_START_DATE)}</td>
                                                <td>${convert(resNewData.ALLOCATION_END_DATE)}</td>
                                                <td>${resNewData.COMMENT == "" ? "-" : resNewData.COMMENT}</td>
                                                <td style='display:none' class="subId">${appTeamData.SUB_ID}</td>
                                            </tr>`
                                $("#release_team_alloc_table").append(newTabledata)
                            }
                        })
                    }
                    
                }
                if (empId == raisedByID) {
                    $(".approveButton").hide();
                    $(".checkBoxClass").attr("disabled", true)
                }
            })
            if (AddSubId.endsWith(",")) {
                AddSubId = AddSubId.slice(0, -1);
            }
            $("#request_sub_id").append(AddSubId.trim())
            
        }
    }
    $(".loader").hide();
    $(".employee_form").show();
}

function convert(str) {
    if (str == null) {
        return "";
    } else if (str == "0000-00-00") {
        return "";
    }
    else {
        let tempStr = str + "T00:00:00"
        var date = new Date(tempStr),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
    }
}

function createDiv(data, value) {
    let hoverValue = ""
    if (data != "-") {
        hoverValue = `<div class="SerialNumberTooltip">${value}</div>`;
    }
    return `<div class="SerialNumberContainer">
                <div class="SerialNumber">${data}</div>
                ${hoverValue}
            </div>`
}

function tootTipRole_op(temp) {
    let emp_name = "";
    $.each(temp, function (i, name) {
        emp_name = emp_name + `<li>${name} </li>`;
    });
    return `<span class='spnTooltip'>
                    <ul>${emp_name}<ul>
              </span>`
}

function showHideData() {
    $(".PersonaData").toggle();
}

function workflowSubmit(obj) {
    let requestType = $("#request_type").html();
    let today = new Date();
    let date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);
    let time = today.getHours() + ":" + ("0" + today.getMinutes()).slice(-2) + ":" + ("0" + today.getSeconds()).slice(-2);
    let CurrentDateTime = date + ' ' + time;
    let selectedOption = obj;
    let accessDetails = "{ \"ACCESS_LEVEL\" : \"" + accese_level +
        "\", \"Access\":\"" + accessData +
        "\", \"EDIT_ACCESS\":\"" + edit_access +
        "\", \"EMAIL_ID\":\"" + sessionName +
        "\", \"GROUP_NAME\":\"" + groupName +
        "\", \"USERNAME\":\"" + empName +
        "\", \"USER_ID\":\"" + empId +
        "\"}";
    let requestID = $("#requestID").html();
    let comments = $("#commentText").val();
    let subIdRes = "0"
    let approvalData = "{ \"REQUEST_ID\" : \"" + requestID +
        "\", \"STATUS_APPROVER\":\"" + empId +
        "\", \"APPROVAL_STATUS\":\"" + obj +
        "\", \"STATUS_APPROVED_ON\":\"" + CurrentDateTime +
        "\", \"COMMENT\":\"" + comments +
        "\", \"SUB_ID\":\"" + subIdRes +
        "\"}";
    if (requestType == "TEAM_ALLOCATION") {
        approvalData = ""
        $("#new_team_alloc_table input[type=checkbox]:checked").each(function () {
            var row = $(this).closest("tr")[0];
            let teamSubId = $(this).closest('tr').find('.subId').html();
            approvalData += "{ \"REQUEST_ID\" : \"" + requestID +
                "\", \"STATUS_APPROVER\":\"" + empId +
                "\", \"APPROVAL_STATUS\":\"" + obj +
                "\", \"STATUS_APPROVED_ON\":\"" + CurrentDateTime +
                "\", \"COMMENT\":\"" + comments +
                "\", \"SUB_ID\":\"" + teamSubId +
                "\"},";
        });
        $("#release_team_alloc_table input[type=checkbox]:checked").each(function () {
            var row = $(this).closest("tr")[0];
            let teamSubId = $(this).closest('tr').find('.subId').html();
            approvalData += "{ \"REQUEST_ID\" : \"" + requestID +
                "\", \"STATUS_APPROVER\":\"" + empId +
                "\", \"APPROVAL_STATUS\":\"" + obj +
                "\", \"STATUS_APPROVED_ON\":\"" + CurrentDateTime +
                "\", \"COMMENT\":\"" + comments +
                "\", \"SUB_ID\":\"" + teamSubId +
                "\"},";
        });
        $("#existing_team_alloc_table input[type=checkbox]:checked").each(function () {
            var row = $(this).closest("tr")[0];
            let teamSubId = $(this).closest('tr').find('.subId').html();
            approvalData += "{ \"REQUEST_ID\" : \"" + requestID +
                "\", \"STATUS_APPROVER\":\"" + empId +
                "\", \"APPROVAL_STATUS\":\"" + obj +
                "\", \"STATUS_APPROVED_ON\":\"" + CurrentDateTime +
                "\", \"COMMENT\":\"" + comments +
                "\", \"SUB_ID\":\"" + teamSubId +
                "\"},";
        });

        if (approvalData.endsWith(",")) {
            approvalData = approvalData.slice(0, -1);
        }
    }
    let apprJsonData = {
        "query_type": "approval_check",
        "environment": apiValue.environment,
        "user_details": "[" + accessDetails + "]",
        "approval_data": "[" + approvalData + "]"
    }
    if (approvalData == "") {
        toastr.options.timeOut = 2000; // 2s
        toastr.error('Please select one team member');
        return false
    } else {
        $.ajax({
            url: apiValue.url,
            type: "POST",
            dataType: "json",
            crossDomain: true,
            format: "json",
            data: JSON.stringify(apprJsonData),
            success: function (json) {
                if (json.Message == "Success") {
                    if (obj == "Rejected") {
                        toastr.options.timeOut = 2000; // 2s
                        toastr.success(json.Response);
                        setTimeout(function () {
                            window.location.href = 'workflowDetails.html';
                        }, 2000)
                    } else if (obj == "Approved") {
                        toastr.options.timeOut = 2000; // 2s
                        toastr.success(json.Response);
                        setTimeout(function () {
                            window.location.href = 'workflowDetails.html';
                        }, 2000)
                    }
                } else {
                    toastr.options.timeOut = 2000; // 2s
                    toastr.error(json.message);
                }
            },
            error: function (error) {
                toastr.options.timeOut = 2000; // 2s
                toastr.error('Message error' + JSON.stringify(error));
            }
        });
    }

}
function removeDateHrs(date) {
    let dateUpdate = date;
    if (date.includes(" 00:00:00")) {
        dateUpdate = dateUpdate.replace(" 00:00:00", "");
    }
    return dateUpdate;
}
let allCommentsData = [];
function updateTeamComments() {
    let userComments = $("#commentText").val();
    let comments_sub_id = $("#request_sub_id").html()
    let accountName = $("#accountName").html()
    let sowName = $("#temp_sow_name").html()
    let raiseById = $("#raisedById").html()
    let requestId = $("#requestID").html()
    if (userComments != "") {

        let accessDetails = "{ \"ACCESS_LEVEL\" : \"" + accese_level +
            "\", \"Access\":\"" + accessData +
            "\", \"EDIT_ACCESS\":\"" + edit_access +
            "\", \"EMAIL_ID\":\"" + sessionName +
            "\", \"GROUP_NAME\":\"" + groupName +
            "\", \"USERNAME\":\"" + empName +
            "\", \"USER_ID\":\"" + empId +
            "\"}";
        let commentsData = "{ \"REQUEST_ID\" : \"" + requestId +
            "\", \"COMMENTS\":\"" + userComments +
            "\", \"ACCOUNT_NAME\":\"" + accountName +
            "\", \"SOW_NAME\":\"" + sowName +
            "\", \"RAISED_BY_ID\":\"" + raiseById +
            "\", \"APPROVER\":\"" + empId +
            "\", \"SUB_ID\":\"" + comments_sub_id +
            "\"}";
        let takeApproval = "YES", approver = "Business head"
        let approvalData =
            '{ "TAKE_APPROVAL" : "' +
            takeApproval +
            '", "APPROVER":"' +
            approver +
            '"}';
        let commentsJsonData = {
            "query_type": "capture_user_comments",
            "environment": apiValue.environment,
            "user_details": "[" + accessDetails + "]",
            "APPROVAL_DATA": "[" + approvalData + "]",
            "comment_details": "[" + commentsData + "]"
        }
        $.ajax({
            url: apiValue.url,
            type: "POST",
            dataType: "json",
            crossDomain: true,
            format: "json",
            data: JSON.stringify(commentsJsonData),
            success: function (json) {
                if(json.Message == "Success"){
                    $("#commentText").val("");
                    allCommentsData = json.CONVERSATION.CONVERSATION
                    let commentHtml = ""
                    $(".old_comments").empty();
                    $.each(allCommentsData, function (i, commentsData) {
                        commentHtml = `<div class="each_comment">
                                            <span class="reportName"><b>${commentsData.COMMENT_BY}</b></span> <div class="commented_on_date pull-right"><u>Commented On</u> : <b>${commentsData.CREATED_DATE}</b></div><br>
                                            <div class="comment_div">
                                            <span class="comment_data" style="width: 100%;" disabled>${commentsData.COMMENTS}</span>
                                            </div>
                                        </div>`
                        $(".old_comments").append(commentHtml)
                    })
                }else{
                    toastr.options.timeOut = 2000; // 2s
                    toastr.error('Message error' + JSON.stringify(error));
                }
            },
            error: function (error) {
                toastr.options.timeOut = 2000; // 2s
                toastr.error('Message error' + JSON.stringify(error));
            }
        });
    }
}

function showHideConv(obj) {
    let btnName = $(obj).text()
    if (btnName == "Show") {
        if (allCommentsData.length == 0) {
            getCommentsData();
        }
        $(obj).text("Hide")
    } else {
        $(obj).text("Show")
    }
    $(".user_conversation").toggle()
}

function getCommentsData(){
    let accessDetails = "{ \"ACCESS_LEVEL\" : \"" + accese_level +
                "\", \"Access\":\"" + accessData +
                "\", \"EDIT_ACCESS\":\"" + edit_access +
                "\", \"EMAIL_ID\":\"" + sessionName +
                "\", \"GROUP_NAME\":\"" + groupName +
                "\", \"USERNAME\":\"" + empName +
                "\", \"USER_ID\":\"" + empId +
                "\"}";
            let requestId = $("#requestID").html();
            let raisedbyIdData = $("#raisedById").html();
            let apprJsonData = {
                "query_type": "audit_conversation",
                "environment": apiValue.environment,
                "user_details": "[" + accessDetails + "]",
                "request_id": requestId,
                "raised_by": raisedbyIdData
            }
            $.ajax({
                url: apiValue.url,
                type: "POST",
                dataType: "json",
                crossDomain: true,
                format: "json",
                data: JSON.stringify(apprJsonData),
                success: function (json) {
                    allCommentsData = json.CONVERSATION
                    let commentHtml = ""
                    $(".old_comments").empty();
                    $.each(allCommentsData, function (i, commentsData) {
                        commentHtml = `<div class="each_comment">
                                            <span class="reportName"><b>${commentsData.COMMENT_BY}</b></span> <div class="commented_on_date pull-right"><u>Commented On</u> : <b>${commentsData.CREATED_DATE}</b></div><br>
                                            <div class="comment_div">
                                            <span class="comment_data" style="width: 100%;" disabled>${commentsData.COMMENTS}</span>
                                            </div>
                                        </div>`
                        $(".old_comments").append(commentHtml)
                    })
                },
                error: function (error) {
                    toastr.options.timeOut = 2000; // 2s
                    toastr.error('Message error' + JSON.stringify(error));
                }
            });
}

