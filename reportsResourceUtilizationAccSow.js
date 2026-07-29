let resUtilizAccSowData = []
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();

$(document).ready(function () {
    assignMetaValue();
    $("meta[name='google-signin-client_id']").attr("content", metaValue);
    let d = new Date();
    let strDate = convertDate(d);
    $("#team_date_filter").val(strDate)
    getLocalSessionData();
    if (sessionName == null) {
        window.location.href = 'index.html';
        return false;
    } else {
        let accessStatus = checkDashboardPageAccessData()
        if (accessStatus) {
            let accessLevel = checkEachPageAccess("Allocation")
            if (accessLevel.length > 0) {
                let environment = accessLevel[0]
                if (environment == apiValue.environment) {  
                    getReportResUiltbyAccSow()    
                                 
                    $(".loader").css("display", "none");
                    $(".show_page").css("display", "block");
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
    $('#logout').click(function () {
        localStorage.clear();
        window.location.href = 'index.html';
        return false;
    });
    $('#reportsBackBtnCustm').click(function () {
        window.location.href = 'resourceUtilization.html';
        return false;
    });
});

const getDataResUtiAccSow = () => {
    const startTime = performance.now();
    $.ajax({
        url: apiValue.url_ip + ":5003/resource_utilization_acc_sow",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
          "environment": apiValue.environment
        }),
        success: function (dataJson) {
        const endTime = performance.now();
        const loadTimeInSeconds = (endTime - startTime) / 1000;
        getApiTime(loadTimeInSeconds,"reportsResourceUtilizationAccSow","Reports","resource_utilization_acc_sow","success",fileName,"reportsResourceUtilizationAccSow","view");
          resUtilizAccSowData = dataJson;
        },
        error: function (error) {
        const endTime = performance.now();
        const loadTimeInSeconds = (endTime - startTime) / 1000;
        getApiTime(loadTimeInSeconds,"reportsResourceUtilizationAccSow","Reports","resource_utilization_acc_sow","error",fileName,"reportsResourceUtilizationAccSow","view");  
          console.log('message Error' + JSON.stringify(error));
        }
      });
}


function getReportResUiltbyAccSow(){
    if(resUtilizAccSowData.length == 0){
        getDataResUtiAccSow()
    }
    const d = new Date();
    let year = d.getFullYear();
    let shortYr = year.toString().substr(-2);
    let monthList = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    let monthHtml = "", utilizHeaderHtml = ""
    monthList.map((mnth)=>{
        monthHtml += `<td colspan="3" class="${mnth}_view month" id="${mnth}" onClick="viewBilling(this)">${mnth} - ${shortYr} <i class='fas fa-angle-double-left' id="faleftin_${mnth}"></i><i class='fas fa-angle-double-right' id="farightin_${mnth}"></i></td>`
        utilizHeaderHtml += `<td class="${mnth}_recBilled">Billed</td>
                            <td class="${mnth}_recInvest">Invest</td>
                            <td class="${mnth}_recBench">Bench</td>`
    })

    let resource_allocation_acc_sow_head = `<tr>
    <td rowspan="2">Team</td>
                        <td rowspan="2">Account</td>
                        <td rowspan="2">SOW</td>
                        ${monthHtml}
                    </tr>
                    <tr>
                        ${utilizHeaderHtml}
                    </tr>`
    $("#resource_allocation_acc_sow_head").append(resource_allocation_acc_sow_head)
    let resUtilAccSowDataHtml = ""
    resUtilizAccSowData.map((emp) => {
        let utilizationData = emp.UTILIZATION_DATA
        let utilizationHtml = ""
        let replaceStr = "_"+shortYr
        utilizationData.map((utl) => {
            let mnthClass = (utl.MONTH_NAME).replace(replaceStr,"")
            utilizationHtml += `<td class="${mnthClass}_recBilled">${Math.round(utl.Billed)}%</td>
                                <td class="${mnthClass}_recInvest">${Math.round(utl.Investment)}%</td>
                                <td class="${mnthClass}_recBench">${Math.round(utl.Bench)}%</td>`
        })
        resUtilAccSowDataHtml = `<tr>
                                    <td>${emp.EMPLOYEE_NAME}</td>
                                    <td>${emp.ACCOUNT_NAME}</td>
                                    <td>${(emp.SOW_NAME).replace(/_/g," ")}</td>
                                    ${utilizationHtml}
                                </tr>`
        $("#resource_allocation_acc_sow_body").append(resUtilAccSowDataHtml)
    })
    monthList.map((mnth)=>{
        $("#"+mnth).click();
    })
    $('#emp_table_sow').dataTable({
        "pageLength": 50,
        "paging": false,
        
    });
}

function convertDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();

    var mmChars = mm.split('');
    var ddChars = dd.split('');

    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
}

let viewBilling = (obj) => {
    let id= $(obj).attr("id")
    let colLen = $(obj).attr("colspan")
    if(colLen == 3){
        $("."+id+"_view").attr("colspan","1");
        $("."+id+"_recInvest").hide()
        $("."+id+"_recInvest").addClass("noExl")
        $("."+id+"_recBench").hide()
        $("."+id+"_recBench").addClass("noExl")
        $("#farightin_"+id).hide()
        $("#faleftin_"+id).show()
    }else if(colLen == 1){
        $("."+id+"_view").attr("colspan","3");
        $("."+id+"_recInvest").show()
        $("."+id+"_recInvest").removeClass("noExl")
        $("."+id+"_recBench").show()
        $("."+id+"_recBench").removeClass("noExl")
        $("#faleftin_"+id).hide()
        $("#farightin_"+id).show()
    }
} 

function downloadExcel() {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    let CurrentDateTime = date + '_' + time;
    $("#emp_table_sow").remove(".noExl").table2excel({
        exclude: ".noExl",
        name: "Reports Resource Utilization Account SOW",
        filename: "reports_resource_utilization_account_sow_" + CurrentDateTime,
        fileext: ".xls",
    });
}