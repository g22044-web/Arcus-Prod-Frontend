let approvalLocalData = "";
function assignApprovalData() {
    approvalLocalData = sessionStorage.getItem("audit-details-data");
    approvalLocalData = $.parseJSON(approvalLocalData);
    if (approvalLocalData == null) {
        setTimeout(function () {
            try {
                getEachAuditData();
            }
            catch(err) {
              getEachAuditData();
            }
            $(".loader").css("display", "none");
            $(".show_page").css("display", "block");
          }, 500);

    } else {
        assignAuditData(approvalLocalData)
    }  

}

function getEachAuditData(){
    let accessDetails = "{ \"ACCESS_LEVEL\" : \"" + accese_level +
            "\", \"Access\":\"" + accessData +
            "\", \"EDIT_ACCESS\":\"" + edit_access +
            "\", \"EMAIL_ID\":\"" + sessionName +
            "\", \"GROUP_NAME\":\"" + groupName +
            "\", \"USERNAME\":\"" + empName +
            "\", \"USER_ID\":\"" + empId +
            "\"}";
        let searchPathVal = sessionStorage.getItem("currentUrlSearch")
        searchPathVal = searchPathVal.replace("?audit_id=","");
        $.ajax({
            url: apiValue.url,
            type: "POST",
            dataType: "json",
            crossDomain: true,
            format: "json",
            async: false,
            mode: 'no-cors',
            data:JSON.stringify({
                query_type: "audit_tracking_data_for_particular_request",
                "request_id":searchPathVal,
                "environment": apiValue.environment,
                "user_details": "[" + accessDetails + "]",
            }),
            success: function (dataJson) {
                let singleAuditData = dataJson[0].DATA
                if(singleAuditData.length > 0){
                    assignAuditData(singleAuditData[0])
                }else{
                    toastr.options.timeOut = 2000; // 2s
                    toastr.error('Requested Audit ID not found, Page will redirect to Home Page');
                    setTimeout(function () { window.location.href = 'home.html'; }, 2000);
                }
            },
            error: function (error) {
                console.log('message Error' + JSON.stringify(error));
            }
        });
    
}

function assignAuditData(approvalLocalData){
        let oldSowMasterData = approvalLocalData.OLD[0];
        let newSowMasterData = approvalLocalData.NEW[0];
        let requestID = approvalLocalData.REQUEST_ID;
        let approvalStatus = approvalLocalData.APPROVAL_STATUS;
        let raisedByID = approvalLocalData.RAISED_BY;
        let raisedBy = approvalLocalData.RAISED_BY_NAME;
        let actionTaken = approvalLocalData.DESCRIPTION;
        let rasiedDate = approvalLocalData.RAISED_ON;
        let checkSowData = requestID.includes("SOW_DATA");
        let checkResData = requestID.includes("RESOURCE_ALLOCATION");
        let checkDelData = requestID.includes("SOW_DELETE");
        let checkAccRemData = requestID.includes("ACCOUNT_REMOVED");
        let checkAccLeadData = requestID.includes("LEAD_ALLOCATION_DATA");
        if (checkSowData) {
            let AccountName = newSowMasterData.ACCOUNT_NAME;
            let sowName = newSowMasterData.SOW_NAME;
            let oldPersonaData = [];
            let newPersonaData = newSowMasterData.BILLING_RATE_DATA;
            let approvalList = approvalLocalData.APPROVERS_DATA;
            let approvalName = "", approvalStatus = "";
            $.each(approvalList, function (value, appravalNameList) {
                let approvalHtml = `<div class="approval_each_div">
                                        <div class="appraval_name_div">
                                            <label class="approval_label_name">Approver Name</label>
                                            <div class="approver_details_name">
                                            <div><i class="fa fa-user" aria-hidden="true"></i> <span id="approver_name">${appravalNameList.APPROVER_NAME == '' ? 'N/A' : appravalNameList.APPROVER_NAME}</span></div>
                                            </div>
                                        </div>
                                        <div class="appraval_name_div">
                                            <label class="approval_label_name">Approval Status</label>
                                            <div class="approver_details_name">
                                            <div><i class="fa fa-at" aria-hidden="true"></i> <span id="approval_status">${appravalNameList.APPROVER_STATUS == '' ? 'N/A' : appravalNameList.APPROVER_STATUS}</span></div>
                                            </div>
                                        </div>
                                    </div><br>`
                $(".approval_div").append(approvalHtml)
            })
            let oldDataFlag = false;
            if (oldSowMasterData != undefined) {
                oldDataFlag = true
                oldPersonaData = oldSowMasterData.BILLING_RATE_DATA;

            }
            $("#accountName").html(AccountName);
            $("#sowName").html(sowName);
            $("#requestID").html(requestID);
            $("#approvalStatus").html(approvalStatus);
            $("#actionTaken").html(`<b>${actionTaken == ""? "N/A" : actionTaken}</b>`);
            $("#raisedByName").html(raisedBy);
            $("#raisedDate").html(rasiedDate);
            if (empId == raisedByID) {
                $(".approveButton").hide();
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
            addOrReplaceOrderBy(`${requestID}`)
        }

        if (checkResData) {
            let AccountName = newSowMasterData.ACCOUNT_NAME;
            let sowName = newSowMasterData.SOW_NAME;
            let oldPersonaData = [];
            let newPersonaData = newSowMasterData.BILLING_RATE_DATA;
            $("#accountName").html(AccountName);
            $("#sowName").html(sowName);
            $("#requestID").html(requestID);
            $("#approvalStatus").html(approvalStatus);
            $("#raisedByName").html(raisedBy);
            $("#raisedDate").html(rasiedDate);
            if (empId == raisedByID) {
                $(".approveButton").hide();
            }
    
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
        if(checkDelData){

            let AccountName = newSowMasterData.ACCOUNT_NAME;
            let sowName = newSowMasterData.SOW_NAME;
            let oldPersonaData = [];
            let newPersonaData = newSowMasterData.BILLING_RATE_DATA;
            $("#header_before").hide();
            $("#actionTaken").html(`<b>${actionTaken == ""? "N/A" : actionTaken}</b>`);
    
            let approvalList = approvalLocalData.APPROVERS_DATA;
            let approvalName = "", approvalStatus = "";
            $.each(approvalList, function (value, appravalNameList) {
                let approvalHtml = `<div class="approval_each_div">
                                        <div class="appraval_name_div">
                                            <label class="approval_label_name">Approver Name</label>
                                            <div class="approver_details_name">
                                            <div><i class="fa fa-user" aria-hidden="true"></i> <span id="approver_name">${appravalNameList.APPROVER_NAME == '' ? 'N/A' : appravalNameList.APPROVER_NAME}</span></div>
                                            </div>
                                        </div>
                                        <div class="appraval_name_div">
                                            <label class="approval_label_name">Approval Status</label>
                                            <div class="approver_details_name">
                                            <div><i class="fa fa-at" aria-hidden="true"></i> <span id="approval_status">${appravalNameList.APPROVER_STATUS == '' ? 'N/A' : appravalNameList.APPROVER_STATUS}</span></div>
                                            </div>
                                        </div>
                                    </div><br>`
                $(".approval_div").append(approvalHtml)
            })
    
            $("#accountName").html(AccountName);
            $("#sowName").html(sowName + ` ${approvalLocalData.DESCRIPTION == ""? "" : `<span class="desc_data">${approvalLocalData.DESCRIPTION}</span>`}`);
            $("#requestID").html(requestID);
            $("#approvalStatus").html(approvalStatus);
            $("#raisedByName").html(raisedBy);
            $("#raisedDate").html(rasiedDate);
            if (empId == raisedByID) {
                $(".approveButton").hide();
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
        if(checkAccRemData){

            let AccountName = newSowMasterData.ACCOUNT_NAME;
            let sowName = newSowMasterData.SOW_NAME;
            let oldPersonaData = [];
            let newPersonaData = newSowMasterData.BILLING_RATE_DATA;
            $("#actionTaken").html(`<b>${actionTaken == ""? "N/A" : actionTaken}</b>`);
            $("#header_before").hide();
            $(".sowNameCol").hide();
            let approvalList = approvalLocalData.APPROVERS_DATA;
            let approvalName = "", approvalStatus = "";
            $.each(approvalList, function (value, appravalNameList) {
                let approvalHtml = `<div class="approval_each_div">
                                        <div class="appraval_name_div">
                                            <label class="approval_label_name">Approver Name</label>
                                            <div class="approver_details_name">
                                            <div><i class="fa fa-user" aria-hidden="true"></i> <span id="approver_name">${appravalNameList.APPROVER_NAME == '' ? 'N/A' : appravalNameList.APPROVER_NAME}</span></div>
                                            </div>
                                        </div>
                                        <div class="appraval_name_div">
                                            <label class="approval_label_name">Approval Status</label>
                                            <div class="approver_details_name">
                                            <div><i class="fa fa-at" aria-hidden="true"></i> <span id="approval_status">${appravalNameList.APPROVER_STATUS == '' ? 'N/A' : appravalNameList.APPROVER_STATUS}</span></div>
                                            </div>
                                        </div>
                                    </div><br>`
                $(".approval_div").append(approvalHtml)
            })
    
            $("#accountName").html(AccountName);
            $("#requestID").html(requestID);
            $("#approvalStatus").html(approvalStatus);
            $("#raisedByName").html(raisedBy);
            $("#raisedDate").html(rasiedDate);
            if (empId == raisedByID) {
                $(".approveButton").hide();
            }
                $("#sowWorkflowData").show()
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
                                    <td><div class="changed">${newSowMasterData.NOTES == "" ? "-": newSowMasterData.NOTES }</div></td>
                                <tr>`    
                $("#sowWorkflowData").append(sow_Data);
                $(".allColumnData").hide();
            

        }
        if(checkAccLeadData){

            let AccountName = newSowMasterData.ACCOUNT_NAME;
            let sowName = newSowMasterData.SOW_NAME;
            $("#actionTaken").html(`<b>${actionTaken == ""? "N/A" : actionTaken}</b>`);
            let approvalList = approvalLocalData.APPROVERS_DATA;
            let approvalName = "", approvalStatus = "";
            $.each(approvalList, function (value, appravalNameList) {
                let approvalHtml = `<div class="approval_each_div">
                                        <div class="appraval_name_div">
                                            <label class="approval_label_name">Approver Name</label>
                                            <div class="approver_details_name">
                                            <div><i class="fa fa-user" aria-hidden="true"></i> <span id="approver_name">${appravalNameList.APPROVER_NAME == '' ? 'N/A' : appravalNameList.APPROVER_NAME}</span></div>
                                            </div>
                                        </div>
                                        <div class="appraval_name_div">
                                            <label class="approval_label_name">Approval Status</label>
                                            <div class="approver_details_name">
                                            <div><i class="fa fa-at" aria-hidden="true"></i> <span id="approval_status">${appravalNameList.APPROVER_STATUS == '' ? 'N/A' : appravalNameList.APPROVER_STATUS}</span></div>
                                            </div>
                                        </div>
                                    </div><br>`
                $(".approval_div").append(approvalHtml)
                $(".allColumnData").hide();
            })
    
            $("#accountName").html(AccountName );
            $("#sowName").html(sowName);
            $("#requestID").html(requestID);
            $("#approvalStatus").html(approvalStatus);
            $("#raisedByName").html(raisedBy);
            $("#raisedDate").html(rasiedDate);
            if (empId == raisedByID) {
                $(".approveButton").hide();
            }
            
                $("#sowWorkflowData").show()
                let sow_Data = `<tr class="${oldSowMasterData.DELIVERY_HEAD  == newSowMasterData.DELIVERY_HEAD ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Delivery Head</td>
                                    <td><div class="noChange">${(oldSowMasterData.DELIVERY_HEAD == "" ? "-": oldSowMasterData.DELIVERY_HEAD)}</div></td>
                                    <td><div class="${oldSowMasterData.DELIVERY_HEAD == newSowMasterData.DELIVERY_HEAD ? "noChange" : "changed"}">${newSowMasterData.DELIVERY_HEAD}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.PROGRAM_LEAD == newSowMasterData.PROGRAM_LEAD ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Program Lead</td>
                                    <td><div class="noChange">${(oldSowMasterData.PROGRAM_LEAD == "" ? "-": oldSowMasterData.PROGRAM_LEAD)}</div></td>
                                    <td><div class="${oldSowMasterData.PROGRAM_LEAD == newSowMasterData.PROGRAM_LEAD ? "noChange" : "changed"}">${newSowMasterData.PROGRAM_LEAD}</div></td>
                                <tr>
                                <tr class="${oldSowMasterData.PROJECT_LEAD == newSowMasterData.PROJECT_LEAD ? "nodataChanged" : ""}">
                                    <td class="columnTitle">Project Lead</td>
                                    <td><div class="noChange">${(oldSowMasterData.PROJECT_LEAD == "" ? "-": oldSowMasterData.PROJECT_LEAD)}</div></td>
                                    <td><div class="${oldSowMasterData.PROJECT_LEAD == newSowMasterData.PROJECT_LEAD ? "noChange" : "changed"}">${newSowMasterData.PROJECT_LEAD}</div></td>
                                <tr>`
    
                $("#sowWorkflowData").append(sow_Data);
                $(".allColumnData").hide();
            

        }
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
console.log(convert("Mon, 11 Nov 2013 00:00:00 GMT"));

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
    let approvalData = "{ \"REQUEST_ID\" : \"" + requestID +
        "\", \"STATUS_APPROVER\":\"" + empId +
        "\", \"APPROVAL_STATUS\":\"" + obj +
        "\", \"STATUS_APPROVED_ON\":\"" + CurrentDateTime +
        "\", \"COMMENT\":\"" + comments +
        "\"}";
    let apprJsonData = {
        "query_type": "approval_check",
        "environment": apiValue.environment,
        "user_details": "[" + accessDetails + "]",
        "approval_data": "[" + approvalData + "]"
    }
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
function removeDateHrs(date) {
    let dateUpdate = date;
    if (date.includes(" 00:00:00")) {
        dateUpdate = dateUpdate.replace(" 00:00:00", "");
    }
    return dateUpdate;
}

function addOrReplaceOrderBy(newData) {
    var stringToAdd = "?audit_id=" + newData;

    if (window.location.search == "")
        return window.location.href + stringToAdd;

    if (window.location.search.indexOf('audit_id=') == -1)
        return window.location.href + stringToAdd;

    var newSearchString = "";
    var searchParams = window.location.search.substring(1).split("&");
    for (var i = 0; i < searchParams.length; i++) {
        if (searchParams[i].indexOf('audit_id=') > -1) {
            searchParams[i] = "audit_id=" + newData;
            break;
        }
    }
    return window.location.href.split("?")[0] + "?" + searchParams.join("&");
}