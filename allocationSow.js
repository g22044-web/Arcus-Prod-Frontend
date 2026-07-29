let currentShortageData = [];
let futureShortageHeader = [];
let greenSOWShortageData = [];
let selectedSowDetails = [];
let selectedSowIds = [];

function loadSowDatatotable(){
    var selectedVal = "";
            var selected = $("input[type='radio'][name='sow_acc']:checked");
            if (selected.length > 0) {
                selectedVal = selected.val();
            }
            if (selectedVal == "CURRENT") {
                let currentShortageData = JSON.parse(localStorage.getItem("CURRENT_SIGNED_SHORTAGE"));
                appendHeaderCurrent();
                getCurrentShortage(currentShortageData);
    
            } else if (selectedVal == "FUTURE") {
                let futureShortageHeader =JSON.parse(localStorage.getItem("FUTURE_SIGNED_SHORTAGE")); 
                appendHeaderFuture();
                getCurrentFutureShortage(futureShortageHeader);
            } else if (selectedVal == "GREEN") {
                let greenSOWShortageData = JSON.parse(localStorage.getItem("ALL_GREEN_SOW"));
                appendHeaderGreen();
                getGreenSOWShortage(greenSOWShortageData);
            }
            $(".loader").css("display", "none");
            $(".show_page").css("display", "block");     
}
function toCapitalize(str) {
    let arr = str.split(' ');
    arr.forEach(function (item, index) {
        arr[index] = item.replace(item[0], item[0].toUpperCase());
    });
    return arr.join(' ');
};
function convert(str) {
    if (str == "") {
        return " ";
    } else {
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
    }
}
function appendHeaderCurrent() {
    $('#report_overall_summary1').empty();
    $('#all_sow_allocation').empty();
    let assign_header = `<tr>
                            <td rowspan="3" class="sow_resrc_style"></td>
                            <td rowspan="3" class="sow_resrc_style">Account Name</td>
                            <td rowspan="3" class="sow_resrc_style">Sow Name</td>
                           
                            <td colspan="2" class="sow_resrc_style">Demand</td>
                            <td rowspan="3" class="sow_resrc_style">Actual Start Date</td>
                            <td rowspan="3" class="sow_resrc_style">Actual End Date</td>
                            <td colspan="2" id="supplyMain" class="sow_resrc_style">Supply</td>
                           
                        </tr>
                        <tr>
                            <td rowspan="2" class="sow_resrc_style">Ind</td>
                            <td rowspan="2" class="sow_resrc_style">US</td>
                            <td colspan="1" id="supplyInd" onclick="showSupplyInd()" class="sow_resrc_style">Ind
                            <i class='fas fa-angle-double-left' id="faleftin"></i>
                            <i class='fas fa-angle-double-right' id="farightin"></i></td></td>
                            <td colspan="1" id="supplyNA" onclick="showSupplyNA()" class="sow_resrc_style">US
                            <i class='fas fa-angle-double-left' id="faleftus"></i>
                            <i class='fas fa-angle-double-right'id="farightus"></i></td></td>
                            
                        </tr>
                        <tr class="supplyIndNA ">
                            <td class="supIndHide sow_resrc_style">Billed</td>
                            <td class="supIndHide sow_resrc_style">Investment</td>
                            <td class="supIndShow sow_resrc_style"></td>
                            <td class="supNAHide sow_resrc_style">Billed</td>
                            <td class="supNAHide sow_resrc_style">Investment</td>
                            <td class="supNAShow sow_resrc_style"></td>
                        </tr>`
    $("#all_sow_allocation").append(assign_header);
}
function appendHeaderFuture() {
    $('#report_overall_summary1').empty();
    $('#all_sow_allocation').empty();
    let assign_header = `<tr>
                            <td rowspan="3" class="sow_resrc_style"></td>
                            <td rowspan="3" class="sow_resrc_style">Account Name</td>
                            <td rowspan="3" class="sow_resrc_style">Sow Name</td>
                            <td colspan="2" class="sow_resrc_style">Demand</td>
                            <td rowspan="3" class="sow_resrc_style">Actual Start Date</td>
                            <td rowspan="3" class="sow_resrc_style">Actual End Date</td>
                            <td colspan="2" id="supplyMain" class="sow_resrc_style">Supply</td>
                           
                        </tr>
                        <tr>
                            <td rowspan="2" class="sow_resrc_style">Ind</td>
                            <td rowspan="2" class="sow_resrc_style">US</td>
                            <td colspan="1" id="supplyInd" onclick="showSupplyInd()" class="sow_resrc_style">Ind
                            <i class='fas fa-angle-double-left' id="faleftin"></i>
                            <i class='fas fa-angle-double-right' id="farightin"></i></td></td>
                            <td colspan="1" id="supplyNA" onclick="showSupplyNA()" class="sow_resrc_style">US
                            <i class='fas fa-angle-double-left' id="faleftus"></i>
                            <i class='fas fa-angle-double-right'id="farightus"></i></td></td>
                            
                        </tr>
                        <tr class="supplyIndNA ">
                            <td class="supIndHide sow_resrc_style">Billed</td>
                            <td class="supIndHide sow_resrc_style">Investment</td>
                            <td class="supIndShow sow_resrc_style"></td>
                            <td class="supNAHide sow_resrc_style">Billed</td>
                            <td class="supNAHide sow_resrc_style">Investment</td>
                            <td class="supNAShow sow_resrc_style"></td>
                        </tr>`
    $("#all_sow_allocation").append(assign_header);
}
function appendHeaderGreen() {
    $('#report_overall_summary1').empty();
    $('#all_sow_allocation').empty();
    let assign_header = `<tr>
                            <td rowspan="3" class="sow_resrc_style"></td>
                            <td rowspan="3" class="sow_resrc_style">Account Name</td>
                            <td rowspan="3" class="sow_resrc_style">Sow Name</td>
                            <td colspan="2" class="sow_resrc_style">Demand</td>
                            
                            <td rowspan="3" class="sow_resrc_style">Actual Start Date</td>
                            <td rowspan="3" class="sow_resrc_style">Actual End Date</td>
                            <td colspan="2" id="supplyMain" class="sow_resrc_style">Supply</td>
                           
                        </tr>
                        <tr>
                            <td rowspan="2" class="sow_resrc_style">Ind</td>
                            <td rowspan="2" class="sow_resrc_style">US</td>
                            <td colspan="1" id="supplyInd" onclick="showSupplyInd()" class="sow_resrc_style">Ind
                            <i class='fas fa-angle-double-left' id="faleftin"></i>
                            <i class='fas fa-angle-double-right' id="farightin"></i></td></td>
                            <td colspan="1" id="supplyNA" onclick="showSupplyNA()" class="sow_resrc_style">US
                            <i class='fas fa-angle-double-left' id="faleftus"></i>
                            <i class='fas fa-angle-double-right'id="farightus"></i></td></td>
                            
                        </tr>
                        <tr class="supplyIndNA ">
                            <td class="supIndHide sow_resrc_style">Billed</td>
                            <td class="supIndHide sow_resrc_style">Investment</td>
                            <td class="supIndShow sow_resrc_style"></td>
                            <td class="supNAHide sow_resrc_style">Billed</td>
                            <td class="supNAHide sow_resrc_style">Investment</td>
                            <td class="supNAShow sow_resrc_style"></td>
                        </tr>`
    $("#all_sow_allocation").append(assign_header);
}

function showSupplyInd() {
    let supplyIndSpanVal = $("#supplyInd").attr('colspan');
    let supplyMain = parseInt($("#supplyMain").attr('colspan'))
    if (supplyIndSpanVal == "1") {

        $(".supIndHide").show()
        $(".supIndShow").hide()
        $(".supIndShow").hide()
        $("#supplyInd").attr('colspan', "2");
        $("#supplyMain").attr('colspan', supplyMain + 1)
        $(".supplyIndNA").show();
        $("#farightin").hide();
        $("#faleftin").show();
    } else if (supplyIndSpanVal == "2") {

        $(".supplyIndNA").hide();
        $(".supIndHide").hide()
        $(".supIndShow").show()
        $("#supplyInd").attr('colspan', "1");
        $("#supplyMain").attr('colspan', supplyMain - 1)
        $("#faleftin").hide();
        $("#farightus").show();
        $("#farightin").show();
        $("#faleftus").hide();
    }
    if (supplyMain == "4") {
        $(".supplyIndNA").show();
    }
}

function showSupplyNA() {
    let supplyIndSpanVal = $("#supplyNA").attr('colspan');
    let supplyMain = parseInt($("#supplyMain").attr('colspan'))
    if (supplyIndSpanVal == "1") {
        $(".supNAHide").show()
        $(".supNAShow").hide()
        $("#supplyNA").attr('colspan', "2");
        $("#supplyMain").attr('colspan', supplyMain + 1)
        $(".supplyIndNA").show();
        $("#farightus").hide();
        $("#faleftus").show();
    } else if (supplyIndSpanVal == "2") {
        $(".supNAHide").hide()
        $(".supNAShow").show()
        $("#supplyNA").attr('colspan', "1");
        $("#supplyMain").attr('colspan', supplyMain - 1)
        $(".supplyIndNA").hide();
        $("#farightus").show();
        $("#faleftin").hide();
        $("#farightin").show();
        $("#faleftus").hide();
    }
    if (supplyMain == "4") {
        $(".supplyIndNA").show();
    }
}
function getCurrentShortage(allocationData) {
    $('#emp_table_sow tbody').empty();
    $('#emp_table_sow').dataTable().fnClearTable();
    $('#emp_table_sow').dataTable().fnDestroy();
    $.each(allocationData, function (i) {
        let currentSignedStortage = allocationData[i];
        let shortageUSVal = allocationData[i].US_SHORTAGE;
        let shortageUSValClassind = "";
        let shortageUSValClassus = "";
        let shortageValin = "";
        let shortageValus = "";
        if (shortageUSVal < 0) {
            shortageUSVal = Math.abs(shortageUSVal)
        }
        let shortageINVal = allocationData[i].INDIA_SHORTAGE;

        if (shortageINVal < 0) {
            shortageINVal = Math.abs(shortageINVal)
        }
        let indShortage = "";
        let indDemandVal = parseInt(allocationData[i].INDIA_RESOURCE_DEMAND)
        let indSupplyVal = parseInt(allocationData[i].INDIA_RESOURCE_SUPPLY)
        let usDemandVal = parseInt(allocationData[i].US_RESOURCE_DEMAND)
        let usSupplyVal = parseInt(allocationData[i].US_RESOURCE_SUPPLY)
        if (indSupplyVal > indDemandVal) {
            shortageUSValClassind = "shortageClass";
        }
        if (usSupplyVal > usDemandVal) {
            shortageUSValClassus = "shortageClass";
        }
        if (indDemandVal == indSupplyVal) {
            if (indDemandVal == 0) {
                shortageValin = "";
            } else {
                shortageValin = "equalindus"
            }
        }
        if (usDemandVal == usSupplyVal) {
            if (usDemandVal == 0) {
                shortageValus = "";
            } else {
                shortageValus = "equalindus";
            }
        }
        row = `<tr>
        <td>
        <input type="radio" class="radiobutton" name="sowid" 
            id="${allocationData[i].SOW_ID}">
     </td>
            <td class="us_shortage">${allocationData[i].ACCOUNT_NAME}
            </td><td class="us_shortage">${allocationData[i].SOW_NAME}
            </td><td class="sow_status ">${allocationData[i].INDIA_RESOURCE_DEMAND}
            </td><td class="us_resource_demand">${allocationData[i].US_RESOURCE_DEMAND}
            </td><td class="legal_start_date">${convert(allocationData[i].ACTUAL_START_DATE)}
            </td><td class="legal_end_date">${convert(allocationData[i].ACTUAL_END_DATE)}
            </td><td class="status supIndHide">${allocationData[i].INDIA_BILLED_SUPPLY}
            </td><td class="status supIndHide">${allocationData[i].INDIA_INVESTMENT_SUPPLY }
            </td><td class="total_resource_supply supIndShow">${allocationData[i].INDIA_RESOURCE_SUPPLY}
            </td><td class="status supNAHide">${allocationData[i].US_BILLED_SUPPLY}
            </td><td class="status supNAHide">${allocationData[i].US_INVESTMENT_SUPPLY }
            </td><td class="total_resource_supply supNAShow">${allocationData[i].US_RESOURCE_SUPPLY}
            
            </td></tr>`
        $('#sow_allocation_data_body').append(row);
    });
    $(".supIndHide").hide();
    $(".supNAHide").hide();
    $(".supplyIndNA").hide();
    $("#faleftin").hide();
    $("#faleftus").hide();
    $('#emp_table_sow').dataTable({
        "pageLength": 50
    });
}
function getCurrentFutureShortage(allocationData) {
    $('#emp_table_sow tbody').empty();
    $('#emp_table_sow').dataTable().fnClearTable();
    $('#emp_table_sow').dataTable().fnDestroy();
    $.each(allocationData, function (i) {
        let currentSignedStortage = allocationData[i];
        let shortageUSVal = allocationData[i].US_SHORTAGE;
        let shortageUSValClassind = "";
        let shortageUSValClassus = "";
        let shortageValin = "";
        let shortageValus = "";
        if (shortageUSVal < 0) {
            shortageUSVal = Math.abs(shortageUSVal)

        }
        let shortageINVal = allocationData[i].INDIA_SHORTAGE;

        if (shortageINVal < 0) {
            shortageINVal = Math.abs(shortageINVal)

        }
        let indShortage = "";
        let indDemandVal = parseInt(allocationData[i].INDIA_RESOURCE_DEMAND)
        let indSupplyVal = parseInt(allocationData[i].INDIA_RESOURCE_SUPPLY)
        let usDemandVal = parseInt(allocationData[i].US_RESOURCE_DEMAND)
        let usSupplyVal = parseInt(allocationData[i].US_RESOURCE_SUPPLY)
        if (indSupplyVal > indDemandVal) {
            shortageUSValClassind = "shortageClass";
        }
        if (usSupplyVal > usDemandVal) {
            shortageUSValClassus = "shortageClass";
        }
        if (indDemandVal == indSupplyVal) {
            if (indDemandVal == 0) {
                shortageValin = "";
            } else {
                shortageValin = "equalindus"
            }
        }
        if (usDemandVal == usSupplyVal) {
            if (usDemandVal == 0) {
                shortageValus = "";
            } else {
                shortageValus = "equalindus";
            }
        }
        row = `<tr>
        <td>
        <input type="radio" class="radiobutton" name="sowid" 
            id="${allocationData[i].SOW_ID}">
     </td>
            <td class="us_shortage">${allocationData[i].ACCOUNT_NAME}
            </td><td class="us_shortage">${allocationData[i].SOW_NAME}
            </td><td class="sow_status ">${allocationData[i].INDIA_RESOURCE_DEMAND}
            </td><td class="us_resource_demand">${allocationData[i].US_RESOURCE_DEMAND}
            </td><td class="legal_start_date">${convert(allocationData[i].ACTUAL_START_DATE)}
            </td><td class="legal_end_date">${convert(allocationData[i].ACTUAL_END_DATE)}
            </td><td class="status supIndHide">${allocationData[i].INDIA_BILLED_SUPPLY}
            </td><td class="status supIndHide">${allocationData[i].INDIA_INVESTMENT_SUPPLY }
            </td><td class="total_resource_supply supIndShow">${allocationData[i].INDIA_RESOURCE_SUPPLY}
            </td><td class="status supNAHide">${allocationData[i].US_BILLED_SUPPLY}
            </td><td class="status supNAHide">${allocationData[i].US_INVESTMENT_SUPPLY }
            </td><td class="total_resource_supply supNAShow">${allocationData[i].US_RESOURCE_SUPPLY}
            
            </td></tr>`
        $('#sow_allocation_data_body').append(row);

    });
    $(".supIndHide").hide();
    $(".supNAHide").hide();
    $(".supplyIndNA").hide();
    $("#faleftin").hide();
    $("#faleftus").hide();
    $('#emp_table_sow').dataTable({
        "pageLength": 50
    });
}
function getGreenSOWShortage(allocationData) {
    $('#emp_table_sow tbody').empty();
    $('#emp_table_sow').dataTable().fnClearTable();
    $('#emp_table_sow').dataTable().fnDestroy();
    
    $.each(allocationData, function (i) {
        let currentSignedStortage = allocationData[i];
        let shortageUSVal = allocationData[i].US_SHORTAGE;
        let shortageUSValClassind = "";
        let shortageUSValClassus = "";
        let shortageValin = "";
        let shortageValus = "";
        if (shortageUSVal < 0) {
           
            shortageUSVal = Math.abs(shortageUSVal)

        }
        let shortageINVal = allocationData[i].INDIA_SHORTAGE;

        if (shortageINVal < 0) {
            
            shortageINVal = Math.abs(shortageINVal)

        }
        let indShortage = "";
        let indDemandVal = parseInt(allocationData[i].INDIA_RESOURCE_DEMAND)
        let indSupplyVal = parseInt(allocationData[i].INDIA_RESOURCE_SUPPLY)
        let usDemandVal = parseInt(allocationData[i].US_RESOURCE_DEMAND)
        let usSupplyVal = parseInt(allocationData[i].US_RESOURCE_SUPPLY)
        if (indSupplyVal > indDemandVal) {
            shortageUSValClassind = "shortageClass";
        }
        if (usSupplyVal > usDemandVal) {
            shortageUSValClassus = "shortageClass";
        }
        if (indDemandVal == indSupplyVal) {
            if (indDemandVal == 0) {
                shortageValin = "";
            } else {
                shortageValin = "equalindus"
            }
        }
        if (usDemandVal == usSupplyVal) {
            if (usDemandVal == 0) {
                shortageValus = "";
            } else {
                shortageValus = "equalindus";
            }
        }
        
        row = `<tr><td>
        <input type="radio" class="radiobutton" name="sowid" 
            id="${allocationData[i].SOW_ID}">
     </td>
            <td class="us_shortage">${allocationData[i].ACCOUNT_NAME}
            </td><td class="us_shortage">${allocationData[i].SOW_NAME}
            </td><td class="sow_status ">${allocationData[i].INDIA_RESOURCE_DEMAND}
            </td><td class="us_resource_demand">${allocationData[i].US_RESOURCE_DEMAND}
            </td><td class="legal_start_date">${convert(allocationData[i].ACTUAL_START_DATE)}
            </td><td class="legal_end_date">${convert(allocationData[i].ACTUAL_END_DATE)}
            </td><td class="status supIndHide">${allocationData[i].INDIA_BILLED_SUPPLY}
            </td><td class="status supIndHide">${allocationData[i].INDIA_INVESTMENT_SUPPLY }
            </td><td class="total_resource_supply supIndShow">${allocationData[i].INDIA_RESOURCE_SUPPLY}
            </td><td class="status supNAHide">${allocationData[i].US_BILLED_SUPPLY}
            </td><td class="status supNAHide">${allocationData[i].US_INVESTMENT_SUPPLY }
            </td><td class="total_resource_supply supNAShow">${allocationData[i].US_RESOURCE_SUPPLY}
            
            </td></tr>`
        $('#sow_allocation_data_body').append(row);
        
    });
    $(".supIndHide").hide();
    $(".supNAHide").hide();
    $(".supplyIndNA").hide();
    $("#faleftin").hide();
    $("#faleftus").hide();
    $('#emp_table_sow').dataTable({
        "pageLength": 50
    });
    
}

function selectSOW(){
    let idSelector = function() { return this.id; };
    let selectedSowId = $(":radio:checked").map(idSelector).get();
    let selectedSowowDetails = [];
    let greenSOWShortageData = JSON.parse(localStorage.getItem("allStortage"));
    selectedSowowDetails = selectedSowId.map(g => (greenSOWShortageData.find(m => m.SOW_ID === g)));
    selectedSowowDetails = selectedSowowDetails.pop();
    localStorage.setItem("SOW_DETAILS",  JSON.stringify(selectedSowowDetails));
    window.location.href = "allocationSOWTeam.html"

}