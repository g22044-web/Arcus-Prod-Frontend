
let data_2021 = [];
let data_2022 = [];
let definition_data = [];

function getAvailResProjAttr() {
    var ajaxTime = new Date().getTime();
    $.ajax({
        // url: "https://rre-api.factspanapps.com:5000/app",
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: {
            query_type: "read_sheet_three",
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        },
        success: function (data) {
          
         
            data_2022 = data[0].SHEET_DATA;
            header = data[0].HEADER_DATE;
            definition_data = data[0].DEFINITION_DATA;
            

        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
    var totalTime = new Date().getTime() - ajaxTime;
}



function getMonth(str) {
    if (str.indexOf('-') > -1) {
        // return true;
        var dateStr = str.split('-'),
            dateMM = dateStr[0],
            dateDD = dateStr[1],
            dateYY = dateStr[2];
        function GetMonthName(monthNumber) {

            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months[monthNumber - 1];

        }
        return GetMonthName(dateMM);
    } else {
        // return false;
        return str;
    }

}

function togglefun(obj) {
   
    $("table tr").each(function () {
        var len = $(this).find("." + obj).length;
        $(this).find("." + obj).each(function (index) { if (index !== len - 1) { $(this).toggle(); } });
    });
    $("#" + obj).find('i').toggleClass('fa-angle-double-left fa-angle-double-right');
    

    
    let length = $("#" + obj).closest("tr").next("tr").find("." + obj + ":visible").length;
    $("#" + obj).attr("colspan", length);
    $('.width-modify').css('z-index', '100');
    if (length == "1") {
        let val = 45;
        $('.width-modify').css('top', val + 'px');
        
    } else {
        let val = 60;
        $('.width-modify').css('top', val + 'px');
    }

   
}

function tootTip(temp) {
    let emp_name = "";
    $.each(temp, function () {
        $.each(this, function (name, value) {
            if (name == "EMPLOYEE_NAME") {
                emp_name = emp_name + `<li>${value}</li>`;
            }
        });
    });
    return `<span class='spnTooltip'>
                  <ul>${emp_name}<ul>
            </span>`
}
function tootTipRole(temp) {
    let emp_name = "";
    $.each(temp, function (i, name) {
        emp_name = emp_name + `<li>${name.ROLE} - ( ${name.TOTAL} )</li>`;
    });
    return `<span class='spnTooltip'>
                    <ul>${emp_name}<ul>
              </span>`
}



function insertClassNameOrder(data, training, am, am_resg, actual, analyst, analyst_resg, associate, associate_resg, contractor, contractor_resg, factspan_prod, manager, manager_resg, spl_leave, sr_analyst, sr_analyst_resg, sr_manager, sr_manager_resg, use_bench, sme_principal, sme_principal_resg, training_us, factspan_prod_us, actual_us, use_bench_us, spl_leave_us, ass_man_ana_us, consultant_us, contractor_us, data_sci_us, eng_man_ala_us, princ_cons_us, sr_ass_anal_us, sr_bus_anal_us, sr_cons_us, sr_data_sci_us, tech_del_man_us, ass_man_ana_us_res, consultant_us_res, contractor_us_res, data_sci_us_res, eng_man_ala_us_res, princ_cons_us_res, sr_ass_anal_us_res, sr_bus_anal_us_res, sr_cons_us_res, sr_data_sci_us_res, tech_del_man_us_res) {
    let date = getMonth(data.Date);
    $("#total_available").find("." + date).last().after("<td class='" + date + " custom_bg_color2'><b>" + data.Total_Available_Resource_Count + "</b></td>");
    $("#training").find("." + date).last().after("<td class='" + date + "' placeholder='training'>" + createDiv(data.TRAINING, training) + " </td>");
    $("#actual_bench").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Actual_Bench, actual) + "</td>");
    $("#usable_bench").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Usable_Bench, use_bench) + "</td>");

    $("#us_total_available").find("." + date).last().after("<td class='" + date + " custom_bg_color2'><b>" + data.Total_Available_Resource_Count_US + "</b></td>");
    $("#us_training").find("." + date).last().after("<td class='" + date + "' placeholder='training'>" + createDiv(data.TRAINING_US, training_us) + " </td>");
    $("#us_actual_bench").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Actual_Bench_US, actual_us) + "</td>");
    $("#us_usable_bench").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Usable_Bench_US, use_bench_us) + "</td>");

    $("#empty_1").find("." + date).last().after("<td class='" + date + " empty-broder-color'></td>");

    $("#empty_associate").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Associate, associate) + "</td>");
    $("#empty_analyst").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Analyst, analyst) + "</td>");
    $("#empty_sr_analyst").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Sr_Analyst, sr_analyst) + "</td>");
    $("#empty_am").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.AM, am) + "</td>");
    $("#empty_manager").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Manager, manager) + "</td>");
    $("#empty_sr_manager").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Sr_Manager, sr_manager) + "</td>");
    $("#empty_sme").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.SME_Principal_Consultant_Architect, sme_principal) + "</td>");
    $("#empty_contractor").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Contractor, contractor) + "</td>");
    $("#empty_total_ava_res").find("." + date).last().after("<td class='" + date + " custom_bg_color5'><b>" + data.Total_Available_Resources + "</b></td>");

    $("#us_empty_total_ava_res").find("." + date).last().after("<td class='" + date + " custom_bg_color5'><b>" + data.Total_Available_Resources_US + "</b></td>");
    $("#us_empty_associate_manag_anal").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Associate_Manager_Analytics_US, ass_man_ana_us) + "</td>");
    $("#us_empty_consultant").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Consultant_US, consultant_us) + "</td>");
    $("#us_empty_contractor").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Contractor_US, contractor_us) + "</td>");
    $("#us_empty_data_scientist").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Data_Scientist_US, data_sci_us) + "</td>");
    $("#us_empty_eng_m_anal").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Engagement_Manager_Analytics_US, eng_man_ala_us) + "</td>");
    $("#us_empty_prin_c").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Principal_Consultant_US, princ_cons_us) + "</td>");
    $("#us_empty_sr_ass_anal").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Senior_Associate_Analytics_US, sr_ass_anal_us) + "</td>");
    $("#us_empty_sr_bus_anal").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Senior_Business_Analyst_US, sr_bus_anal_us) + "</td>");
    $("#us_empty_sr_con").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Senior_Consultant_US, sr_cons_us) + "</td>");
    $("#us_empty_sr_data_sci").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Senior_Data_Scientist_US, sr_data_sci_us) + "</td>");
    $("#us_empty_tech_del_man").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Technical_Delivery_Manager_US, tech_del_man_us) + "</td>");

    $("#empty_2").find("." + date).last().after("<td class='" + date + " empty-broder-color'></td>");

    $("#resigned_del_ass").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Associate_resigned, associate_resg) + "</td>");
    $("#resigned_del_analyst").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Analyst_resigned, analyst_resg) + "</td>");
    $("#resigned_del_sr_analyst").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Sr_Analyst_resigned, sr_analyst_resg) + "</td>");
    $("#resigned_del_am").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.AM_resigned, am_resg) + "</td>");
    $("#resigned_del_manager").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Manager_resigned, manager_resg) + "</td>");
    $("#resigned_del_sr_manager").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Sr_Manager_resigned, sr_manager_resg) + "</td>");
    $("#resigned_del_sme").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.SME_Principal_Consultant_Architect_resigned, sme_principal_resg) + "</td>");
    $("#resigned_del_contractor").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Contractor_resgined, contractor_resg) + "</td>");
    $("#resigned_del_total_ava_res").find("." + date).last().after("<td class='" + date + " custom_bg_color3'><b>" + data.Total_Resigned_Resources + "</b></td>");

    $("#us_resigned_total_ava_res").find("." + date).last().after("<td class='" + date + " custom_bg_color3'>" + data.Total_Resigned_Resources_US + "</td>");
    $("#us_resigned_associate_manag_anal").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Associate_Manager_Analytics_US_resigned, ass_man_ana_us_res) + "</td>");
    $("#us_resigned_consultant").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Consultant_US_resigned, consultant_us_res) + "</td>");
    $("#us_resigned_contractor").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Contractor_US_resigned, contractor_us_res) + "</td>");
    $("#us_resigned_data_scientist").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Data_Scientist_US_resigned, data_sci_us_res) + "</td>");
    $("#us_resigned_eng_m_anal").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Engagement_Manager_Analytics_US_resigned, eng_man_ala_us_res) + "</td>");
    $("#us_resigned_prin_c").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Principal_Consultant_US_resigned, princ_cons_us_res) + "</td>");
    $("#us_resigned_sr_ass_anal").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Senior_Associate_Analytics_US_resigned, sr_ass_anal_us_res) + "</td>");
    $("#us_resigned_sr_bus_anal").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Senior_Business_Analyst_US_resigned, sr_bus_anal_us_res) + "</td>");
    $("#us_resigned_sr_con").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Senior_Consultant_US_resigned, sr_cons_us_res) + "</td>");
    $("#us_resigned_sr_data_sci").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Senior_Data_Scientist_US_resigned, sr_data_sci_us_res) + "</td>");
    $("#us_resigned_tech_del_man").find("." + date).last().after("<td class=" + date + ">" + createDiv(data.Technical_Delivery_Manager_US_resigned, tech_del_man_us_res) + "</td>");
}

function avialResData(data, training, am, am_resg, actual, analyst, analyst_resg, associate, associate_resg, contractor, contractor_resg, factspan_prod, manager, manager_resg, spl_leave, sr_analyst, sr_analyst_resg, sr_manager, sr_manager_resg, use_bench, sme_principal, sme_principal_resg, training_us, factspan_prod_us, actual_us, use_bench_us, spl_leave_us, ass_man_ana_us, consultant_us, contractor_us, data_sci_us, eng_man_ala_us, princ_cons_us, sr_ass_anal_us, sr_bus_anal_us, sr_cons_us, sr_data_sci_us, tech_del_man_us, ass_man_ana_us_res, consultant_us_res, contractor_us_res, data_sci_us_res, eng_man_ala_us_res, princ_cons_us_res, sr_ass_anal_us_res, sr_bus_anal_us_res, sr_cons_us_res, sr_data_sci_us_res, tech_del_man_us_res) {
    let date = getMonth(data.Date);
    $("#total_available").append("<td class='" + date + " custom_bg_color2'><b>" + data.Total_Available_Resource_Count + "</b></td>");
    $("#training").append("<td class='" + date + "' placeholder='training'>" + createDiv(data.TRAINING, training) + " </td>");
    $("#actual_bench").append("<td class=" + date + ">" + createDiv(data.Actual_Bench, actual) + "</td>");
    $("#usable_bench").append("<td class=" + date + ">" + createDiv(data.Usable_Bench, use_bench) + "</td>");

    $("#us_total_available").append("<td class='" + date + " custom_bg_color2'><b>" + data.Total_Available_Resource_Count_US + "</b></td>");
    $("#us_training").append("<td class='" + date + "' placeholder='training'>" + createDiv(data.TRAINING_US, training_us) + " </td>");
    $("#us_actual_bench").append("<td class=" + date + ">" + createDiv(data.Actual_Bench_US, actual_us) + "</td>");
    $("#us_usable_bench").append("<td class=" + date + ">" + createDiv(data.Usable_Bench_US, use_bench_us) + "</td>");

    $("#empty_1").append("<td class='" + date + " empty-broder-color'></td>");

    $("#empty_associate").append("<td class=" + date + ">" + createDiv(data.Associate, associate) + "</td>");
    $("#empty_analyst").append("<td class=" + date + ">" + createDiv(data.Analyst, analyst) + "</td>");
    $("#empty_sr_analyst").append("<td class=" + date + ">" + createDiv(data.Sr_Analyst, sr_analyst) + "</td>");
    $("#empty_am").append("<td class=" + date + ">" + createDiv(data.AM, am) + "</td>");
    $("#empty_manager").append("<td class=" + date + ">" + createDiv(data.Manager, manager) + "</td>");
    $("#empty_sr_manager").append("<td class=" + date + ">" + createDiv(data.Sr_Manager, sr_manager) + "</td>");
    $("#empty_sme").append("<td class=" + date + ">" + createDiv(data.SME_Principal_Consultant_Architect, sme_principal) + "</td>");
    $("#empty_contractor").append("<td class=" + date + ">" + createDiv(data.Contractor, contractor) + "</td>");
    $("#empty_total_ava_res").append("<td class='" + date + " custom_bg_color5'><b>" + data.Total_Available_Resources + "</b></td>");

    $("#us_empty_total_ava_res").append("<td class='" + date + " custom_bg_color5'>" + data.Total_Available_Resources_US + "</td>");
    $("#us_empty_associate_manag_anal").append("<td class=" + date + ">" + createDiv(data.Associate_Manager_Analytics_US, ass_man_ana_us) + "</td>");
    $("#us_empty_consultant").append("<td class=" + date + ">" + createDiv(data.Consultant_US, consultant_us) + "</td>");
    $("#us_empty_contractor").append("<td class=" + date + ">" + createDiv(data.Contractor_US, contractor_us) + "</td>");
    $("#us_empty_data_scientist").append("<td class=" + date + ">" + createDiv(data.Data_Scientist_US, data_sci_us) + "</td>");
    $("#us_empty_eng_m_anal").append("<td class=" + date + ">" + createDiv(data.Engagement_Manager_Analytics_US, eng_man_ala_us) + "</td>");
    $("#us_empty_prin_c").append("<td class=" + date + ">" + createDiv(data.Principal_Consultant_US, princ_cons_us) + "</td>");
    $("#us_empty_sr_ass_anal").append("<td class=" + date + ">" + createDiv(data.Senior_Associate_Analytics_US, sr_ass_anal_us) + "</td>");
    $("#us_empty_sr_bus_anal").append("<td class=" + date + ">" + createDiv(data.Senior_Business_Analyst_US, sr_bus_anal_us) + "</td>");
    $("#us_empty_sr_con").append("<td class=" + date + ">" + createDiv(data.Senior_Consultant_US, sr_cons_us) + "</td>");
    $("#us_empty_sr_data_sci").append("<td class=" + date + ">" + createDiv(data.Senior_Data_Scientist_US, sr_data_sci_us) + "</td>");
    $("#us_empty_tech_del_man").append("<td class=" + date + ">" + createDiv(data.Technical_Delivery_Manager_US, tech_del_man_us) + "</td>");


    $("#empty_2").append("<td class='" + date + " empty-broder-color'></td>");
    $("#resigned_del_ass").append("<td class=" + date + ">" + createDiv(data.Associate_resigned, associate_resg) + "</td>");
    $("#resigned_del_analyst").append("<td class=" + date + ">" + createDiv(data.Analyst_resigned, analyst_resg) + "</td>");
    $("#resigned_del_sr_analyst").append("<td class=" + date + ">" + createDiv(data.Sr_Analyst_resigned, sr_analyst_resg) + "</td>");
    $("#resigned_del_am").append("<td class=" + date + ">" + createDiv(data.AM_resigned, am_resg) + "</td>");
    $("#resigned_del_manager").append("<td class=" + date + ">" + createDiv(data.Manager_resigned, manager_resg) + "</td>");
    $("#resigned_del_sr_manager").append("<td class=" + date + ">" + createDiv(data.Sr_Manager_resigned, sr_manager_resg) + "</td>");
    $("#resigned_del_sme").append("<td class=" + date + ">" + createDiv(data.SME_Principal_Consultant_Architect_resigned, sme_principal_resg) + "</td>");
    $("#resigned_del_contractor").append("<td class=" + date + ">" + createDiv(data.Contractor_resgined, contractor_resg) + "</td>");
    $("#resigned_del_total_ava_res").append("<td class='" + date + " custom_bg_color3'><b>" + data.Total_Resigned_Resources + "</b></td>");

    $("#us_resigned_total_ava_res").append("<td class='" + date + " custom_bg_color3'>" + data.Total_Resigned_Resources_US + "</td>");
    $("#us_resigned_associate_manag_anal").append("<td class=" + date + ">" + createDiv(data.Associate_Manager_Analytics_US_resigned, ass_man_ana_us_res) + "</td>");
    $("#us_resigned_consultant").append("<td class=" + date + ">" + createDiv(data.Consultant_US_resigned, consultant_us_res) + "</td>");
    $("#us_resigned_contractor").append("<td class=" + date + ">" + createDiv(data.Contractor_US_resigned, contractor_us_res) + "</td>");
    $("#us_resigned_data_scientist").append("<td class=" + date + ">" + createDiv(data.Data_Scientist_US_resigned, data_sci_us_res) + "</td>");
    $("#us_resigned_eng_m_anal").append("<td class=" + date + ">" + createDiv(data.Engagement_Manager_Analytics_US_resigned, eng_man_ala_us_res) + "</td>");
    $("#us_resigned_prin_c").append("<td class=" + date + ">" + createDiv(data.Principal_Consultant_US_resigned, princ_cons_us_res) + "</td>");
    $("#us_resigned_sr_ass_anal").append("<td class=" + date + ">" + createDiv(data.Senior_Associate_Analytics_US_resigned, sr_ass_anal_us_res) + "</td>");
    $("#us_resigned_sr_bus_anal").append("<td class=" + date + ">" + createDiv(data.Senior_Business_Analyst_US_resigned, sr_bus_anal_us_res) + "</td>");
    $("#us_resigned_sr_con").append("<td class=" + date + ">" + createDiv(data.Senior_Consultant_US_resigned, sr_cons_us_res) + "</td>");
    $("#us_resigned_sr_data_sci").append("<td class=" + date + ">" + createDiv(data.Senior_Data_Scientist_US_resigned, sr_data_sci_us_res) + "</td>");
    $("#us_resigned_tech_del_man").append("<td class=" + date + ">" + createDiv(data.Technical_Delivery_Manager_US_resigned, tech_del_man_us_res) + "</td>");
}

function createDiv(data, value) {
    let hoverValue = ""
    if (data > 0) {
        hoverValue = `<div class="SerialNumberTooltip">${value}</div>`;
    }
    return `<div class="SerialNumberContainer">
              <div class="SerialNumber">${data}</div>
              ${hoverValue}
          </div>`
}

function getColorValue() {
    let checkedValue = $('#d').is(":checked");
    if (checkedValue == true) {
        availResData(data_2022, "2022");
    } else {
        availResData(data_2021, "2021");
    }
    getDefData();
    
}
function getColorValue_br() {
    let checkedValue = $('#d').is(":checked");
    if (checkedValue == false) {
        availResData(data_2022, "2022");
    } else {
        availResData(data_2021, "2021");
    }
    getDefData();
}

function getDefData(){
    $.each(definition_data, function(i, definition){
      
        $('#ind_training').prop('title', definition.TRAINING);
        $('#ind_actual_bench_tit').prop('title', definition.Actual_Bench);
        $('#ind_usable_bench_tit').prop('title', definition.TRAINING);
        $('#us_training').prop('title', definition.TRAINING);
        $('#us_actual_bench_tit').prop('title', definition.TRAINING);
        $('#us_usable_bench_tit').prop('title', definition.TRAINING);
        $('#total_avial_res_ind').prop('title', definition.Total_Available_Resource_Count);
        $('#total_avai_resou_us').prop('title', definition.Total_Available_Resource_Count_US);

    });
}

function availResData(data, obj) {
    $(".width-modify-head").remove();
    $(".width-modify").remove();
    $(".Jan").remove();
    $(".Feb").remove();
    $(".Mar").remove();
    $(".Apr").remove();
    $(".May").remove();
    $(".Jun").remove();
    $(".Jul").remove();
    $(".Aug").remove();
    $(".Sep").remove();
    $(".Oct").remove();
    $(".Nov").remove();
    $(".Dec").remove();
    let monthList = [];
    let monthHeader = []
    $.each(header, function (i, headMonth) {
        monthHeader.push(headMonth.MONTH_HEADER);
    });
    
    for (var j = 0;j < data.length;j++) {
        let date = getMonth(data[j].Date);
        monthList.push(date);
    }
    var map = monthList.reduce(function (prev, cur) {
        prev[cur] = (prev[cur] || 0) + 1;
        return prev;
    }, {});
    for (var key in map) {
       
        $.each(monthHeader, function (i, monthvalue) {
            if (key == monthvalue.slice(0, 3)) {
                $("#month").append("<th class='width-modify-head' colspan=" + map[key] + " id=" + key + " onClick='togglefun(\"" + key + "\")'>" + monthvalue.replace("-", " ") + "<i class='fas fa-angle-double-left' style='color: #e96e31;'></i></th>");
            }
        });

        for (let k = 1;k <= map[key];k++) {
            if (k == map[key]) {
                $("#date").append("<th class='" + key + " width-modify'>Total</th>");
            } else {
                $("#date").append("<th class='" + key + " width-modify'>Week " + k + "</th>");
            }
        }
    }
    for (var i = 0;i < data.length;i++) {
        let date = getMonth(data[i].Date);
        let all_data = data[i];
      
        let training = "", am = "", am_resg = "", actual = "", analyst = "", analyst_resg = "", associate = "", associate_resg = "", contractor = "", contractor_resg = "", factspan_prod = "";
        let manager = "", manager_resg = "", spl_leave = "", sme_principal = "", sme_principal_resg = "", sr_analyst = "", sr_analyst_resg = "", sr_manager = "", sr_manager_resg = "", use_bench = "";
        let training_us = "", factspan_prod_us = "", actual_us = "", use_bench_us = "", spl_leave_us = "";
        let ass_man_ana_us = "", consultant_us = "", contractor_us = "", data_sci_us = "", eng_man_ala_us = "", princ_cons_us = "";
        let sr_ass_anal_us = "", sr_bus_anal_us = "", sr_cons_us = "", sr_data_sci_us = "", tech_del_man_us = "";
        let ass_man_ana_us_res = "", consultant_us_res = "", contractor_us_res = "", data_sci_us_res = "", eng_man_ala_us_res = "";
        let princ_cons_us_res = "", sr_ass_anal_us_res = "", sr_bus_anal_us_res = "", sr_cons_us_res = "", sr_data_sci_us_res = "", tech_del_man_us_res = "";
        if (data[i].TRAINING_details.length > 0) {
            let temp = data[i].TRAINING_details
            training = tootTipRole(temp);
        }
        if (data[i].TRAINING_US_details.length > 0) {
            let temp = data[i].TRAINING_US_details
            training_us = tootTipRole(temp);
        }
        if (data[i].Actual_Bench_details.length > 0) {
            let temp = data[i].Actual_Bench_details
            actual = tootTipRole(temp);
        }
        if (data[i].Actual_Bench_US_details.length > 0) {
            let temp = data[i].Actual_Bench_US_details
            actual_us = tootTipRole(temp);
        }
        if (data[i].FACT_PRODUCT_details.length > 0) {
            let temp = data[i].FACT_PRODUCT_details
            factspan_prod = tootTipRole(temp);
        }
        if (data[i].FACT_PRODUCT_US_details.length > 0) {
            let temp = data[i].FACT_PRODUCT_US_details
            factspan_prod_us = tootTipRole(temp);
        }
        if (data[i].SPL_LEAVE_details.length > 0) {
            let temp = data[i].SPL_LEAVE_details
            spl_leave = tootTipRole(temp);
        }
        if (data[i].SPL_LEAVE_US_details.length > 0) {
            let temp = data[i].SPL_LEAVE_US_details
            spl_leave_us = tootTipRole(temp);
        }
        if (data[i].USE_BENCH_details.length > 0) {
            let temp = data[i].USE_BENCH_details
            use_bench = tootTipRole(temp);
        }
        if (data[i].USE_BENCH_US_details.length > 0) {
            let temp = data[i].USE_BENCH_US_details
            use_bench_us = tootTipRole(temp);
        }
        if (data[i].AM_details.length > 0) {
            let temp = data[i].AM_details
            am = tootTip(temp);
        }
        if (data[i].AM_resigned_details.length > 0) {
            let temp = data[i].AM_resigned_details
            am_resg = tootTip(temp);
        }

        if (data[i].Analyst_details.length > 0) {
            let temp = data[i].Analyst_details
            analyst = tootTip(temp);
        }
        if (data[i].Analyst_resigned_details.length > 0) {
            let temp = data[i].Analyst_resigned_details
            analyst_resg = tootTip(temp);
        }
        if (data[i].Associate_details.length > 0) {
            let temp = data[i].Associate_details
            associate = tootTip(temp);
        }
        if (data[i].Associate_resigned_details.length > 0) {
            let temp = data[i].Associate_resigned_details
            associate_resg = tootTip(temp);
        }
        if (data[i].Contractor_details.length > 0) {
            let temp = data[i].Contractor_details
            contractor = tootTip(temp);
        }
        if (data[i].Contractor_resigned_details.length > 0) {
            let temp = data[i].Contractor_resigned_details
            contractor_resg = tootTip(temp);
        }
        if (data[i].Manager_details.length > 0) {
            let temp = data[i].Manager_details
            manager = tootTip(temp);
        }
        if (data[i].Manager_resigned_details.length > 0) {
            let temp = data[i].Manager_resigned_details
            manager_resg = tootTip(temp);
        }
        if (data[i].SME_Principal_Consultant_Architect_details.length > 0) {
            let temp = data[i].SME_Principal_Consultant_Architect_details
            sme_principal = tootTip(temp);
        }
        if (data[i].SME_Principal_Consultant_Architect_resigned_details.length > 0) {
            let temp = data[i].SME_Principal_Consultant_Architect_resigned_details
            sme_principal_resg = tootTip(temp);
        }
        if (data[i].Sr_Analyst_details.length > 0) {
            let temp = data[i].Sr_Analyst_details
            sr_analyst = tootTip(temp);
        }
        if (data[i].Sr_Analyst_resigned_details.length > 0) {
            let temp = data[i].Sr_Analyst_resigned_details
            sr_analyst_resg = tootTip(temp);
        }
        if (data[i].Sr_manager_details.length > 0) {
            let temp = data[i].Sr_manager_details
            sr_manager = tootTip(temp);
        }
        if (data[i].Sr_manager_resigned_details.length > 0) {
            let temp = data[i].Sr_manager_resigned_details
            sr_manager_resg = tootTip(temp);
        }
        if (data[i].Associate_Manager_Analytics_US_details.length > 0) {
            let temp = data[i].Associate_Manager_Analytics_US_details
            ass_man_ana_us = tootTip(temp);
        }
        if (data[i].Consultant_US_details.length > 0) {
            let temp = data[i].Consultant_US_details
            consultant_us = tootTip(temp);
        }

        if (data[i].Contractor_US_details.length > 0) {
            let temp = data[i].Contractor_US_details
            contractor_us = tootTip(temp);
        }

        if (data[i].Data_Scientist_US_details.length > 0) {
            let temp = data[i].Data_Scientist_US_details
            data_sci_us = tootTip(temp);
        }

        if (data[i].Engagement_Manager_Analytics_US_details.length > 0) {
            let temp = data[i].Engagement_Manager_Analytics_US_details
            eng_man_ala_us = tootTip(temp);
        }

        if (data[i].Principal_Consultant_US_details.length > 0) {
            let temp = data[i].Principal_Consultant_US_details
            princ_cons_us = tootTip(temp);
        }

        if (data[i].Senior_Associate_Analytics_US_details.length > 0) {
            let temp = data[i].Senior_Associate_Analytics_US_details
            sr_ass_anal_us = tootTip(temp);
        }

        if (data[i].Senior_Business_Analyst_US_details.length > 0) {
            let temp = data[i].Senior_Business_Analyst_US_details
            sr_bus_anal_us = tootTip(temp);
        }

        if (data[i].Senior_Consultant_US_details.length > 0) {
            let temp = data[i].Senior_Consultant_US_details
            sr_cons_us = tootTip(temp);
        }

        if (data[i].Senior_Data_Scientist_US_details.length > 0) {
            let temp = data[i].Senior_Data_Scientist_US_details
            sr_data_sci_us = tootTip(temp);
        }

        if (data[i].Technical_Delivery_Manager_US_details.length > 0) {
            let temp = data[i].Technical_Delivery_Manager_US_details
            tech_del_man_us = tootTip(temp);
        }

        //-----------------------
        if (data[i].Associate_Manager_Analytics_resigned_US_details.length > 0) {
            let temp = data[i].Associate_Manager_Analytics_resigned_US_details
            ass_man_ana_us_res = tootTip(temp);
        }
        if (data[i].Consultant_resigned_US_details.length > 0) {
            let temp = data[i].Consultant_resigned_US_details
            consultant_us_res = tootTip(temp);
        }

        if (data[i].Contractor_resigned_US_details.length > 0) {
            let temp = data[i].Contractor_resigned_US_details
            contractor_us_res = tootTip(temp);
        }

        if (data[i].Data_Scientist_resigned_US_details.length > 0) {
            let temp = data[i].Data_Scientist_resigned_US_details
            data_sci_us_res = tootTip(temp);
        }

        if (data[i].Engagement_Manager_Analytics_resigned_US_details.length > 0) {
            let temp = data[i].Engagement_Manager_Analytics_resigned_US_details
            eng_man_ala_us_res = tootTip(temp);
        }

        if (data[i].Principal_Consultant_resigned_US_details.length > 0) {
            let temp = data[i].Principal_Consultant_resigned_US_details
            princ_cons_us_res = tootTip(temp);
        }

        if (data[i].Senior_Associate_Analytics_resigned_US_details.length > 0) {
            let temp = data[i].Senior_Associate_Analytics_resigned_US_details
            sr_ass_anal_us_res = tootTip(temp);
        }

        if (data[i].Senior_Business_Analyst_resigned_US_details.length > 0) {
            let temp = data[i].Senior_Business_Analyst_resigned_US_details
            sr_bus_anal_us_res = tootTip(temp);
        }

        if (data[i].Senior_Consultant_resigned_US_details.length > 0) {
            let temp = data[i].Senior_Consultant_resigned_US_details
            sr_cons_us_res = tootTip(temp);
        }

        if (data[i].Senior_Data_Scientist_resigned_US_details.length > 0) {
            let temp = data[i].Senior_Data_Scientist_resigned_US_details
            sr_data_sci_us_res = tootTip(temp);
        }

        if (data[i].Technical_Delivery_Manager_resigned_US_details.length > 0) {
            let temp = data[i].Technical_Delivery_Manager_resigned_US_details
            tech_del_man_us_res = tootTip(temp);
        }


        if ($("#total_available").find("." + date).last().length > 0) {
            insertClassNameOrder(all_data, training, am, am_resg, actual, analyst, analyst_resg, associate, associate_resg, contractor, contractor_resg, factspan_prod, manager, manager_resg, spl_leave, sr_analyst, sr_analyst_resg, sr_manager, sr_manager_resg, use_bench, sme_principal, sme_principal_resg, training_us, factspan_prod_us, actual_us, use_bench_us, spl_leave_us, ass_man_ana_us, consultant_us, contractor_us, data_sci_us, eng_man_ala_us, princ_cons_us, sr_ass_anal_us, sr_bus_anal_us, sr_cons_us, sr_data_sci_us, tech_del_man_us, ass_man_ana_us_res, consultant_us_res, contractor_us_res, data_sci_us_res, eng_man_ala_us_res, princ_cons_us_res, sr_ass_anal_us_res, sr_bus_anal_us_res, sr_cons_us_res, sr_data_sci_us_res, tech_del_man_us_res);
        } else {
            avialResData(all_data, training, am, am_resg, actual, analyst, analyst_resg, associate, associate_resg, contractor, contractor_resg, factspan_prod, manager, manager_resg, spl_leave, sr_analyst, sr_analyst_resg, sr_manager, sr_manager_resg, use_bench, sme_principal, sme_principal_resg, training_us, factspan_prod_us, actual_us, use_bench_us, spl_leave_us, ass_man_ana_us, consultant_us, contractor_us, data_sci_us, eng_man_ala_us, princ_cons_us, sr_ass_anal_us, sr_bus_anal_us, sr_cons_us, sr_data_sci_us, tech_del_man_us, ass_man_ana_us_res, consultant_us_res, contractor_us_res, data_sci_us_res, eng_man_ala_us_res, princ_cons_us_res, sr_ass_anal_us_res, sr_bus_anal_us_res, sr_cons_us_res, sr_data_sci_us_res, tech_del_man_us_res);
        }
    }
    togglefun("Jan");
    togglefun("Feb");
    togglefun("Mar");
    togglefun("Apr");
    togglefun("May");
    togglefun("Jun");
    togglefun("Jul");
    togglefun("Aug");
    togglefun("Sep");
    togglefun("Oct");
    togglefun("Nov");
    togglefun("Dec");
}

function inputCheckfilter(obj) {
    let status = $('#' + obj).is(":checked");
    let avail_main = $('#avail_main').is(":checked");
    let avail_res = $('#avail_res').is(":checked");
    let resigned_proj = $('#resigned_proj').is(":checked");
 
    if (status == true) {
        let iconClss = "";
        $('.' + obj).show();
        if (obj == "avail_main") {
            toggleBlock('ind_avail_main_togg');
            iconClss = "ind_avail_main_togg";
        }
        if (obj == "avail_res") {
            toggleBlock('ind_avail_res_togg');
            iconClss = "ind_avail_res_togg";
        }
        if (obj == "resigned_proj") {
            toggleBlock('ind_resigned_proj_togg');
            iconClss = "ind_resigned_proj_togg";
        }
        $("#" + iconClss).find('i').removeClass('fa-angle-up');
        $("#" + iconClss).find('i').addClass('fa-angle-down');
        if (avail_main == true) {
            $(".empty_1").show();
        }
        if (resigned_proj == true) {
            $(".empty_2").show();
        }
        if (avail_res == true) {
            $(".empty_2").show();
        }
        if (avail_main == true && avail_res == true) {
            $(".empty_1").show();
            $(".empty_2").show();
        }
        if (resigned_proj == true && avail_res == true) {
            $(".empty_1").show();
            $(".empty_2").show();
        }
    }
    else {
        $('.' + obj).hide();

        if (avail_main == false) {
            $(".empty_1").hide();
        }
        if (resigned_proj == false) {
            $(".empty_2").hide();
        }
        if (avail_res == false) {
            $(".empty_2").hide();
        }
        if (avail_main == false && avail_res == false) {
            $(".empty_1").hide();
            $(".empty_2").hide();
        }
        if (resigned_proj == false && avail_res == false) {
            $(".empty_1").hide();
            $(".empty_2").hide();
        }
    }
}

function toggleBlock(obj) {
    let length = $("." + obj + ":hidden").length;
    let objName = obj;
    let ind_data = $('#ind_data').is(":checked");
    let us_data = $('#us_data').is(":checked");
    let ind_avail_main_togg = $('#ind_avail_main_togg').attr("rowspan");
    let ind_avail_main_togg_us = $('#ind_avail_main_togg_us').attr("rowspan");
    let ind_avail_res_togg = $('#ind_avail_res_togg').attr("rowspan");
    let ind_avail_res_togg_us = $('#ind_avail_res_togg_us').attr("rowspan");
    let ind_resigned_proj_togg = $('#ind_resigned_proj_togg').attr("rowspan");
    let ind_resigned_proj_togg_us = $('#ind_resigned_proj_togg_us').attr("rowspan");
   
    if (ind_data == true && us_data == true) {
        if (obj == "ind_avail_main_togg") {
            if (ind_avail_main_togg_us == 4 && ind_avail_main_togg == 1) {
                $('#ind_avail_main_togg').attr("rowspan", 8);
                $('#ind_avail_main_togg_1').attr("rowspan", 8);
                $('#ind_avail_main_togg_us').attr("rowspan", 1);
                $('#ind_avail_main_togg_1_us').attr("rowspan", 1);
                $('.ind_data_option').show();
                $('.us_data_option').show();
                $('.ind_data_main').show();
                $('.us_data_main').show();
            } if (ind_avail_main_togg_us == 1 && ind_avail_main_togg == 4) {
                $('#ind_avail_main_togg').attr("rowspan", 2);
                $('#ind_avail_main_togg_1').attr("rowspan", 2);
                $('#ind_avail_main_togg_us').attr("rowspan", 1);
                $('#ind_avail_main_togg_1_us').attr("rowspan", 1);
                $('.ind_data_option').hide();
                $('.us_data_option').hide();
                $('.ind_data_main').show();
                $('.us_data_main').show();
            } else {
                $("." + obj).toggle();
                // if(obj == "ind_avail_main_togg"){
                //     $("#"+obj).attr("rowspan", length+2); 
                //     $("#"+obj+"_1").attr("rowspan", length+2); 
                // }else{
                //     $("#"+obj).attr("rowspan", length+1); 
                //     $("#"+obj+"_1").attr("rowspan", length+1); 
                // }
                $("#" + obj).attr("rowspan", length + 2);
                $("#" + obj + "_1").attr("rowspan", length + 2);
                $("#" + obj).find('i').toggleClass('fa-angle-up fa-angle-down');
            }
        } else if (obj == "ind_avail_res_togg") {
            if (ind_avail_res_togg == 1) {
                $('#ind_avail_res_togg').attr("rowspan", 21);
                $('#ind_avail_res_togg_1').attr("rowspan", 21);
                $('#ind_avail_res_togg_us').attr("rowspan", 1);
                $('#ind_avail_res_togg_1_us').attr("rowspan", 1);
                $('.ind_data_option_1').show();
                $('.us_data_option_1').show();
                $('.ind_data_main_1').show();
                $('.us_data_main_1').show();
            } else {
                $("." + obj).toggle();
                // if(obj == "ind_avail_main_togg"){
                //     $("#"+obj).attr("rowspan", length+2); 
                //     $("#"+obj+"_1").attr("rowspan", length+2); 
                // }else{
                //     $("#"+obj).attr("rowspan", length+1); 
                //     $("#"+obj+"_1").attr("rowspan", length+1); 
                // }
                $("#" + obj).attr("rowspan", length + 2);
                $("#" + obj + "_1").attr("rowspan", length + 2);
                $("#" + obj).find('i').toggleClass('fa-angle-up fa-angle-down');
            }

        } else if (obj == "ind_resigned_proj_togg") {
            if (ind_resigned_proj_togg == 1) {
                $('#ind_resigned_proj_togg').attr("rowspan", 21);
                $('#ind_resigned_proj_togg_1').attr("rowspan", 21);
                $('#ind_resigned_proj_togg_us').attr("rowspan", 1);
                $('#ind_resigned_proj_togg_1_us').attr("rowspan", 1);
                $('.ind_data_option_2').show();
                $('.us_data_option_2').show();
                $('.ind_data_main_2').show();
                $('.us_data_main_2').show();
            } else {
                $("." + obj).toggle();
                // if(obj == "ind_avail_main_togg"){
                //     $("#"+obj).attr("rowspan", length+2); 
                //     $("#"+obj+"_1").attr("rowspan", length+2); 
                // }else{
                //     $("#"+obj).attr("rowspan", length+1); 
                //     $("#"+obj+"_1").attr("rowspan", length+1); 
                // }
                $("#" + obj).attr("rowspan", length + 2);
                $("#" + obj + "_1").attr("rowspan", length + 2);
                $("#" + obj).find('i').toggleClass('fa-angle-up fa-angle-down');
            }

        }
        // else {
        //     $("." + obj).toggle();
        //     // if(obj == "ind_avail_main_togg"){
        //     //     $("#"+obj).attr("rowspan", length+2); 
        //     //     $("#"+obj+"_1").attr("rowspan", length+2); 
        //     // }else{
        //     //     $("#"+obj).attr("rowspan", length+1); 
        //     //     $("#"+obj+"_1").attr("rowspan", length+1); 
        //     // }
        //     $("#" + obj).attr("rowspan", length + 2);
        //     $("#" + obj + "_1").attr("rowspan", length + 2);
        //     $("#" + obj).find('i').toggleClass('fa-angle-up fa-angle-down');
        // }

    }
    if (ind_data == true && us_data == false) {
        if (obj == "ind_avail_main_togg") {
            if (ind_avail_main_togg == "4") {
                $('#ind_avail_main_togg').attr("rowspan", 1);
                $('#ind_avail_main_togg_1').attr("rowspan", 1);
                // $('#training').hide();
                // $('#actual_bench').hide();
                // $('#usable_bench').hide();
                $('.ind_data_option').hide();
                $('.us_data_option').hide();
                $('.ind_data_main').show();
                $('.us_data_main').hide();
            } else if (ind_avail_main_togg == "1") {
                $('#ind_avail_main_togg').attr("rowspan", 4);
                $('#ind_avail_main_togg_1').attr("rowspan", 4);
                $('.ind_data_option').show();
                $('.ind_data_main').show();
                $('.us_data_option').hide();
                $('.us_data_main').hide();
            } else if (ind_avail_main_togg == "2") {
                $('#ind_avail_main_togg').attr("rowspan", 1);
                $('#ind_avail_main_togg_1').attr("rowspan", 1);
                $('.ind_data_option').hide();
                $('.ind_data_main').show();
                $('.us_data_option').hide();
                $('.us_data_main').hide();
            }
        } else if (obj == "ind_avail_res_togg") {
            if (ind_avail_res_togg == "1") {
                $('#ind_avail_res_togg').attr("rowspan", 9);
                $('#ind_avail_res_togg_1').attr("rowspan", 9);
                $('.ind_data_option_1').show();
                $('.ind_data_main_1').show();
                $('.us_data_option_1').hide();
                $('.us_data_main_1').hide();
            } else if (ind_avail_res_togg == "9" || ind_avail_res_togg == "2") {
                $('#ind_avail_res_togg').attr("rowspan", 1);
                $('#ind_avail_res_togg_1').attr("rowspan", 1);
                // $('#training').hide();
                // $('#actual_bench').hide();
                // $('#usable_bench').hide();
                $('.ind_data_option_1').hide();
                $('.us_data_option_1').hide();
                $('.ind_data_main_1').show();
                $('.us_data_main_1').hide();
            }
        }
        else if (obj == "ind_resigned_proj_togg") {
            if (ind_resigned_proj_togg == "1") {
                $('#ind_resigned_proj_togg').attr("rowspan", 9);
                $('#ind_resigned_proj_togg_1').attr("rowspan", 9);
                $('.ind_data_option_2').show();
                $('.ind_data_main_2').show();
                $('.us_data_option_2').hide();
                $('.us_data_main_2').hide();
            } else if (ind_resigned_proj_togg == "9" || ind_resigned_proj_togg == "2") {
                $('#ind_resigned_proj_togg').attr("rowspan", 1);
                $('#ind_resigned_proj_togg_1').attr("rowspan", 1);
                // $('#training').hide();
                // $('#actual_bench').hide();
                // $('#usable_bench').hide();
                $('.ind_data_option_2').hide();
                $('.us_data_option_2').hide();
                $('.ind_data_main_2').show();
                $('.us_data_main_2').hide();
            }
        }

    }
    if (ind_data == false && us_data == true) {
        if (obj == "ind_avail_main_togg") {
            if (ind_avail_main_togg_us == "4" || ind_avail_main_togg_us == "2") {
                $('#ind_avail_main_togg_us').attr("rowspan", 1);
                $('#ind_avail_main_togg_1_us').attr("rowspan", 1);
                $('#ind_avail_main_togg').attr("rowspan", 1);
                $('#ind_avail_main_togg_1').attr("rowspan", 1);
                // $('#training').hide();
                // $('#actual_bench').hide();
                // $('#usable_bench').hide();
                $('.us_data_option').hide();
                $('.ind_data_option').hide();
                $('.ind_data_main').hide();
                $('.us_data_main').show();
            } else if (ind_avail_main_togg_us == "1") {
                $('#ind_avail_main_togg_us').attr("rowspan", 4);
                $('#ind_avail_main_togg_1_us').attr("rowspan", 4);
                $('.us_data_main').show();
                $('.us_data_option').show();
                $('.ind_data_option').hide();
                $('.ind_data_main').hide();
            }
        } else if (obj == "ind_avail_res_togg") {
            if (ind_avail_res_togg_us == "12" || ind_avail_res_togg_us == "9") {
                $('#ind_avail_res_togg_us').attr("rowspan", 1);
                $('#ind_avail_res_togg_1_us').attr("rowspan", 1);
                $('.ind_data_option_1').hide();
                $('.ind_data_main_1').hide();
                $('.us_data_option_1').hide();
                $('.us_data_main_1').show();
            } else if (ind_avail_res_togg_us == "1") {
                $('#ind_avail_res_togg_us').attr("rowspan", 12);
                $('#ind_avail_res_togg_1_us').attr("rowspan", 12);
                // $('#training').hide();
                // $('#actual_bench').hide();
                // $('#usable_bench').hide();
                $('.ind_data_option_1').hide();
                $('.us_data_option_1').show();
                $('.ind_data_main_1').hide();
                $('.us_data_main_1').show();
            }
        }
        else if (obj == "ind_resigned_proj_togg") {
            if (ind_resigned_proj_togg_us == "12" || ind_resigned_proj_togg_us == "2") {
                $('#ind_resigned_proj_togg_us').attr("rowspan", 1);
                $('#ind_resigned_proj_togg_1_us').attr("rowspan", 1);
                $('.ind_data_option_2').hide();
                $('.ind_data_main_2').hide();
                $('.us_data_option_2').hide();
                $('.us_data_main_2').show();
            } else if (ind_resigned_proj_togg_us == "1") {
                $('#ind_resigned_proj_togg_us').attr("rowspan", 12);
                $('#ind_resigned_proj_togg_1_us').attr("rowspan", 12);
                // $('#training').hide();
                // $('#actual_bench').hide();
                // $('#usable_bench').hide();
                $('.ind_data_option_2').hide();
                $('.us_data_option_2').show();
                $('.ind_data_main_2').hide();
                $('.us_data_main_2').show();
            }
        }
    }
}

function checkIndUs(obj) {
    let ind_data = $('#ind_data').is(":checked");
    let us_data = $('#us_data').is(":checked");
    let avail_main = $('#avail_main').is(":checked");
    let avail_res = $('#avail_res').is(":checked");
    let resigned_proj = $('#resigned_proj').is(":checked");
   
    let ind_avail_main_togg = $('#ind_avail_main_togg').attr("rowspan");
    let ind_avail_res_togg = $('#ind_avail_res_togg').attr("rowspan");
    let ind_resigned_proj_togg = $('#ind_resigned_proj_togg').attr("rowspan");
    let ind_avail_main_togg_us = $('#ind_avail_main_togg_us').attr("rowspan");
    let ind_avail_res_togg_us = $('#ind_avail_res_togg_us').attr("rowspan");
    let ind_resigned_proj_togg_us = $('#ind_resigned_proj_togg_us').attr("rowspan");
    
    if (ind_data == true && us_data == false) {
        //Available - show / hide 
        if (ind_avail_main_togg == "2" && avail_main == true) {
            $(".ind_data_main").show();
            $(".us_data_main").hide();
            $(".us_data_option").hide();
            $('.ind_data_option').hide();
            $("#ind_avail_main_togg_us").hide();
            $("#ind_avail_main_togg_1_us").hide();
            $('#ind_avail_main_togg').attr("rowspan", 1);
            $('#ind_avail_main_togg_1').attr("rowspan", 1);
            $('#ind_data').attr("disabled", true);
            $('#ind_data').css('cursor', 'no-drop');
        } else if (ind_avail_main_togg == "8" && avail_main == true) {
            $(".ind_data_main").show();
            $('.ind_data_option').show();
            $(".us_data_main").hide();
            $(".us_data_option").hide();
            $("#ind_avail_main_togg_us").hide();
            $("#ind_avail_main_togg_1_us").hide();
            $('#ind_avail_main_togg').attr("rowspan", 4);
            $('#ind_avail_main_togg_1').attr("rowspan", 4);
            $('#ind_data').attr("disabled", true);
            $('#ind_data').css('cursor', 'no-drop');
        } else if (ind_avail_main_togg == "4" && avail_main == true) {
            $(".ind_data_main").show();
            $('.ind_data_option').show();
            $(".us_data_main").show();
            $(".us_data_option").show();
            $("#ind_avail_main_togg_us").hide();
            $("#ind_avail_main_togg_1_us").hide();
            $('#ind_avail_main_togg').attr("rowspan", 8);
            $('#ind_avail_main_togg_1').attr("rowspan", 8);
            $('#ind_data').attr("disabled", false);
            $('#ind_data').css('cursor', 'ponter');
        }

        //Available Resource show/hide 
        if (ind_avail_res_togg == "2" && avail_res == true) {
            $(".ind_data_main_1").show();
            $(".us_data_main_1").hide();
            $(".us_data_option_1").hide();
            $('.ind_data_option_1').hide();
            $("#ind_avail_res_togg_us").hide();
            $("#ind_avail_res_togg_1_us").hide();
            $('#ind_avail_res_togg').attr("rowspan", 1);
            $('#ind_avail_res_togg_1').attr("rowspan", 1);
            $('#ind_data').attr("disabled", true);
            $('#ind_data').css('cursor', 'no-drop');
        } else if (ind_avail_res_togg == "21" && avail_res == true) {
            $(".ind_data_main_1").show();
            $('.ind_data_option_1').show();
            $(".us_data_main_1").hide();
            $(".us_data_option_1").hide();
            $("#ind_avail_res_togg_us").hide();
            $("#ind_avail_res_togg_1_us").hide();
            $('#ind_avail_res_togg').attr("rowspan", 9);
            $('#ind_avail_res_togg_1').attr("rowspan", 9);
            $('#ind_data').attr("disabled", true);
            $('#ind_data').css('cursor', 'no-drop');
        } else if (ind_avail_res_togg == "1" && avail_res == true) {
            $(".ind_data_main_1").show();
            $('.ind_data_option_1').show();
            $(".us_data_main_1").hide();
            $(".us_data_option_1").hide();
            $("#ind_avail_res_togg_us").hide();
            $("#ind_avail_res_togg_1_us").hide();
            $('#ind_avail_res_togg').attr("rowspan", 9);
            $('#ind_avail_res_togg_1').attr("rowspan", 9);
            $('#ind_data').attr("disabled", true);
            $('#ind_data').css('cursor', 'no-drop');
        }

        //Resigned/ Proj Attrition show/hide 
        if (ind_resigned_proj_togg == "2" && resigned_proj == true) {
            $(".ind_data_main_2").show();
            $(".us_data_main_2").hide();
            $(".us_data_option_2").hide();
            $('.ind_data_option_2').hide();
            $("#ind_resigned_proj_togg_us").hide();
            $("#ind_resigned_proj_togg_1_us").hide();
            $('#ind_resigned_proj_togg').attr("rowspan", 1);
            $('#ind_resigned_proj_togg_1').attr("rowspan", 1);
            $('#ind_data').attr("disabled", true);
            $('#ind_data').css('cursor', 'no-drop');
        } else if (ind_resigned_proj_togg == "21" && resigned_proj == true) {
            $(".ind_data_main_2").show();
            $('.ind_data_option_2').show();
            $(".us_data_main_2").hide();
            $(".us_data_option_2").hide();
            $("#ind_resigned_proj_togg_us").hide();
            $("#ind_resigned_proj_togg_1_us").hide();
            $('#ind_resigned_proj_togg').attr("rowspan", 9);
            $('#ind_resigned_proj_togg_1').attr("rowspan", 9);
            $('#ind_data').attr("disabled", true);
            $('#ind_data').css('cursor', 'no-drop');
        } else if (ind_resigned_proj_togg == "1" && resigned_proj == true) {
            $(".ind_data_main_2").show();
            $('.ind_data_option_2').show();
            $(".us_data_main_2").hide();
            $(".us_data_option_2").hide();
            $("#ind_resigned_proj_togg_us").hide();
            $("#ind_resigned_proj_togg_1_us").hide();
            $('#ind_resigned_proj_togg').attr("rowspan", 9);
            $('#ind_resigned_proj_togg_1').attr("rowspan", 9);
            $('#ind_data').attr("disabled", true);
            $('#ind_data').css('cursor', 'no-drop');
        }

    }
    else if (ind_data == false && us_data == true) {
        //Available - show / hide 
        if (ind_avail_main_togg == "2" && avail_main == true) {
            $(".ind_data_main").hide();
            $('.ind_data_option').hide();
            $(".us_data_main").show();
            $('#ind_avail_main_togg').hide();
            $('#ind_avail_main_togg_1').hide();
            $("#ind_avail_main_togg_us").show();
            $("#ind_avail_main_togg_1_us").show();
            $('#ind_avail_main_togg_us').attr("rowspan", 1);
            $('#ind_avail_main_togg_1_us').attr("rowspan", 1);
            $('#us_data').attr("disabled", true);
            $('#us_data').css('cursor', 'no-drop');
        } else if (ind_avail_main_togg == "8" && avail_main == true) {
            $("#total_available").hide();
            $("#training").hide();
            $("#actual_bench").hide();
            $("#usable_bench").hide();
            $('#ind_avail_main_togg').hide();
            $('#ind_avail_main_togg_1').hide();
            $("#ind_avail_main_togg_us").show();
            $("#ind_avail_main_togg_1_us").show();
            $('#ind_avail_main_togg').attr("rowspan", 4);
            $('#ind_avail_main_togg_1').attr("rowspan", 4);
            $('#ind_avail_main_togg_us').attr("rowspan", 4);
            $('#ind_avail_main_togg_1_us').attr("rowspan", 4);
            $('#us_data').attr("disabled", true);
            $('#us_data').css('cursor', 'no-drop');
        }

        //Available Resource show/hide 
        if (ind_avail_res_togg == "2" && avail_res == true) {
            $(".ind_data_main_1").hide();
            $('.ind_data_option_1').hide();
            $(".us_data_main_1").show();
            $('#ind_avail_res_togg').hide();
            $('#ind_avail_res_togg_1').hide();
            $("#ind_avail_res_togg_us").show();
            $("#ind_avail_res_togg_1_us").show();
            $('#ind_avail_res_togg_us').attr("rowspan", 1);
            $('#ind_avail_res_togg_1_us').attr("rowspan", 1);
            $('#us_data').attr("disabled", true);
            $('#us_data').css('cursor', 'no-drop');
        } else if (ind_avail_res_togg == "21" && avail_res == true) {
            $(".ind_data_option_1").hide();
            $(".ind_data_main_1").hide();
            $(".us_data_main_1").show();
            $(".us_data_option_1").show();
            $('#ind_avail_res_togg').hide();
            $('#ind_avail_res_togg_1').hide();
            $("#ind_avail_res_togg_us").show();
            $("#ind_avail_res_togg_1_us").show();
            $('#ind_avail_res_togg').attr("rowspan", 9);
            $('#ind_avail_res_togg_1').attr("rowspan", 9);
            $('#ind_avail_res_togg_us').attr("rowspan", 12);
            $('#ind_avail_res_togg_1_us').attr("rowspan", 12);
            $('#us_data').attr("disabled", true);
            $('#us_data').css('cursor', 'no-drop');
        }

        //Resigned/ Proj Attrition show/hide 
        if (ind_resigned_proj_togg == "2" && resigned_proj == true) {
            $(".ind_data_main_2").hide();
            $('.ind_data_option_2').hide();
            $(".us_data_main_2").show();
            $('#ind_resigned_proj_togg').hide();
            $('#ind_resigned_proj_togg_1').hide();
            $("#ind_resigned_proj_togg_us").show();
            $("#ind_resigned_proj_togg_1_us").show();
            $('#ind_resigned_proj_togg_us').attr("rowspan", 1);
            $('#ind_resigned_proj_togg_1_us').attr("rowspan", 1);
            $('#us_data').attr("disabled", true);
            $('#us_data').css('cursor', 'no-drop');
        } else if (ind_resigned_proj_togg == "21" && resigned_proj == true) {
            $(".ind_data_option_2").hide();
            $(".ind_data_main_2").hide();
            $(".us_data_main_2").show();
            $(".us_data_option_2").show();
            $('#ind_resigned_proj_togg').hide();
            $('#ind_resigned_proj_togg_1').hide();
            $("#ind_resigned_proj_togg_us").show();
            $("#ind_resigned_proj_togg_1_us").show();
            $('#ind_resigned_proj_togg').attr("rowspan", 9);
            $('#ind_resigned_proj_togg_1').attr("rowspan", 9);
            $('#ind_resigned_proj_togg_us').attr("rowspan", 12);
            $('#ind_resigned_proj_togg_1_us').attr("rowspan", 12);
            $('#us_data').attr("disabled", true);
            $('#us_data').css('cursor', 'no-drop');
        }
    }
    else if (ind_data == true && us_data == true) {
        //Available - show / hide 
        if (ind_avail_main_togg == "1" && avail_main == true) {
            $(".ind_data_main").show();
            $(".us_data_main").show();
            $('#ind_avail_main_togg').show();
            $('#ind_avail_main_togg_1').show();
            $("#ind_avail_main_togg_us").hide();
            $("#ind_avail_main_togg_1_us").hide();
            $('#ind_avail_main_togg').attr("rowspan", 2);
            $('#ind_avail_main_togg_1').attr("rowspan", 2);
            $('#us_data').attr("disabled", false);
            $('#us_data').css('cursor', 'pointer');
            $('#ind_data').attr("disabled", false);
            $('#ind_data').css('cursor', 'pointer');
            $('.us_data_option').hide();
            $('.ind_data_option').hide();
        } else if (ind_avail_main_togg == "2" && avail_main == true) {
            $(".ind_data_main").show();
            $(".us_data_main").show();
            $('#ind_avail_main_togg').show();
            $('#ind_avail_main_togg_1').show();
            $("#ind_avail_main_togg_us").hide();
            $("#ind_avail_main_togg_1_us").hide();
            $('#ind_avail_main_togg').attr("rowspan", 2);
            $('#ind_avail_main_togg_1').attr("rowspan", 2);
            $('#us_data').attr("disabled", false);
            $('#us_data').css('cursor', 'pointer');
            $('#ind_data').attr("disabled", false);
            $('#ind_data').css('cursor', 'pointer');
            $('.us_data_option').hide();
            $('.ind_data_option').hide();
        } else if (avail_main == true) {
            $(".ind_data_main").show();
            $(".us_data_main").show();
            $('#ind_avail_main_togg').show();
            $('#ind_avail_main_togg_1').show();
            $("#ind_avail_main_togg_us").hide();
            $("#ind_avail_main_togg_1_us").hide();
            $('#ind_avail_main_togg').attr("rowspan", 8);
            $('#ind_avail_main_togg_1').attr("rowspan", 8);
            $('#us_data').attr("disabled", false);
            $('#us_data').css('cursor', 'pointer');
            $('#ind_data').attr("disabled", false);
            $('#ind_data').css('cursor', 'pointer');
            $('.us_data_option').show();
            $('.ind_data_option').show();
        }

        //Available Resource show/hide 
        if (ind_avail_res_togg == "1" && avail_res == true) {
            $(".ind_data_main_1").show();
            $(".us_data_main_1").show();
            $('#ind_avail_res_togg').show();
            $('#ind_avail_res_togg_1').show();
            $("#ind_avail_res_togg_us").hide();
            $("#ind_avail_res_togg_1_us").hide();
            $('#ind_avail_res_togg').attr("rowspan", 2);
            $('#ind_avail_res_togg_1').attr("rowspan", 2);
            $('#us_data').attr("disabled", false);
            $('#us_data').css('cursor', 'pointer');
            $('#ind_data').attr("disabled", false);
            $('#ind_data').css('cursor', 'pointer');
            $('.us_data_option_1').hide();
            $('.ind_data_option_1').hide();
        } else if (ind_avail_res_togg == "2" && avail_res == true) {
            $(".ind_data_main_1").show();
            $(".us_data_main_1").show();
            $('#ind_avail_res_togg').show();
            $('#ind_avail_res_togg_1').show();
            $("#ind_avail_res_togg_us").hide();
            $("#ind_avail_res_togg_1_us").hide();
            $('#ind_avail_res_togg').attr("rowspan", 2);
            $('#ind_avail_res_togg_1').attr("rowspan", 2);
            $('#us_data').attr("disabled", false);
            $('#us_data').css('cursor', 'pointer');
            $('#ind_data').attr("disabled", false);
            $('#ind_data').css('cursor', 'pointer');
            $('.us_data_option_1').hide();
            $('.ind_data_option_1').hide();
        } else if ((ind_avail_res_togg == "9" || ind_avail_res_togg == "12") && avail_res == true) {
            $(".ind_data_main_1").show();
            $(".us_data_main_1").show();
            $('#ind_avail_res_togg').show();
            $('#ind_avail_res_togg_1').show();
            $("#ind_avail_res_togg_us").hide();
            $("#ind_avail_res_togg_1_us").hide();
            $('#ind_avail_res_togg').attr("rowspan", 21);
            $('#ind_avail_res_togg_1').attr("rowspan", 21);
            $('#us_data').attr("disabled", false);
            $('#us_data').css('cursor', 'pointer');
            $('#ind_data').attr("disabled", false);
            $('#ind_data').css('cursor', 'pointer');
            $('.us_data_option_1').show();
            $('.ind_data_option_1').show();
        }

        //Resigned/ Proj Attrition show/hide 
        if (ind_resigned_proj_togg == "1" && resigned_proj == true) {
            $(".ind_data_main_2").show();
            $(".us_data_main_2").show();
            $('#ind_resigned_proj_togg').show();
            $('#ind_resigned_proj_togg_1').show();
            $("#ind_resigned_proj_togg_us").hide();
            $("#ind_resigned_proj_togg_1_us").hide();
            $('#ind_resigned_proj_togg').attr("rowspan", 2);
            $('#ind_resigned_proj_togg_1').attr("rowspan", 2);
            $('#us_data').attr("disabled", false);
            $('#us_data').css('cursor', 'pointer');
            $('#ind_data').attr("disabled", false);
            $('#ind_data').css('cursor', 'pointer');
            $('.us_data_option_2').hide();
            $('.ind_data_option_2').hide();
        } else if (ind_resigned_proj_togg == "2" && resigned_proj == true) {
            $(".ind_data_main_2").show();
            $(".us_data_main_2").show();
            $('#ind_resigned_proj_togg').show();
            $('#ind_resigned_proj_togg_1').show();
            $("#ind_resigned_proj_togg_us").hide();
            $("#ind_resigned_proj_togg_1_us").hide();
            $('#ind_resigned_proj_togg').attr("rowspan", 2);
            $('#ind_resigned_proj_togg_1').attr("rowspan", 2);
            $('#us_data').attr("disabled", false);
            $('#us_data').css('cursor', 'pointer');
            $('#ind_data').attr("disabled", false);
            $('#ind_data').css('cursor', 'pointer');
            $('.us_data_option_2').hide();
            $('.ind_data_option_2').hide();
        } else if ((ind_resigned_proj_togg == "9" || ind_resigned_proj_togg == "12") && resigned_proj == true) {
            $(".ind_data_main_2").show();
            $(".us_data_main_2").show();
            $('#ind_resigned_proj_togg').show();
            $('#ind_resigned_proj_togg_1').show();
            $("#ind_resigned_proj_togg_us").hide();
            $("#ind_resigned_proj_togg_1_us").hide();
            $('#ind_resigned_proj_togg').attr("rowspan", 21);
            $('#ind_resigned_proj_togg_1').attr("rowspan", 21);
            $('#us_data').attr("disabled", false);
            $('#us_data').css('cursor', 'pointer');
            $('#ind_data').attr("disabled", false);
            $('#ind_data').css('cursor', 'pointer');
            $('.us_data_option_2').show();
            $('.ind_data_option_2').show();
        }

    } else {
        $(".ind_data_main").hide();
        $(".us_data_main").hide();
        $('.us_data_option').hide();
        $('.ind_data_option').hide();
    }
}