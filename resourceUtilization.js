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
                    $('body').css('display', 'block');
                    var ajaxTime = new Date().getTime();
                    getAllCmpyUsIndSum();
                    let colorValue = $(".can-toggle__switch").css("background-color");
                    getColorValue_br();
                    toggleBlock('utiliz_toggle');
                    toggleBlock('avial_head_toggle');
                    toggleBlock('demand_head_toggle');
                    toggleBlock('sup_head_toggle');
                    toggleBlock('gap_head_toggle');
                    toggleBlock('all_head_toggle');
                    var totalTime = new Date().getTime() - ajaxTime;
                    $(".new-sub-menu").hover(function () {
                        $('.sub-menu').css('display', '')
                    });
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
    $('#dashboard').click(function () {
        window.location.href = 'home.html';
        return false;
    });
    $('#sow_rsrc_all_sum_page').click(function () {
        window.location.href = 'sowRsrceAllocSummar.html';
        return false;
    });
    $('#avail_res_proj_attr').click(function () {
        window.location.href = 'availResProjAttr.html';
        return false;
    });
    $('#res_acc_by_sow').click(function () {
        window.location.href = 'reportsResourceUtilizationAccSow.html';
        return false;
    });
});




$('#logout').click(function () {
    localStorage.clear();

    window.location.href = 'index.html';
    return false;
});
$('#reportsBackBtn').click(function () {

    window.location.href = 'reportsDashboard.html';
    return false;
});
let data_2021 = [];
let data_2022 = [];
let full_data = [];
let header = [];
let filter_header = [];
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();

var map = "";
let shortYr, year;
function getAllCmpyUsIndSum() {
    const d = new Date();
    year = d.getFullYear();
    shortYr = year.toString().substr(-2);
    $("#previousYr").val(shortYr - 1);
    $("#previousYr_label").html(year - 1);
    $("#currentYr").val(shortYr);
    $("#currentYr_label").html(year);
    $("#futureYr").val((year + 1).toString().substr(-2));
    $("#futureYr_label").html(year + 1);
    const startTime = performance.now();
    $.ajax({
        url:  apiValue.url_ip + ":5003/resource_utilization",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            query_type: "resource_utilization_df",
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        }),
        success: function (data) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportsResourceUtilization","Reports","resource_utilization","success",fileName,"reportsResourceUtilization","view");
            full_data = data[0].SHEET_DATA;
            header = data[0].HEADER_DATA;
        },
        error: function (error) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"reportsResourceUtilization","Reports","resource_utilization","error",fileName,"reportsResourceUtilization","view");
            console.log('message Error' + JSON.stringify(error));
        }
    });
}

function getYearData() {
    var selectedVal = "";
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    let filter_data = [];
    if (selectedVal == (shortYr - 1)) {
        filter_data = full_data.filter(item => {
            const splitData = item.Date.split('-');
            return splitData[splitData.length - 1] == (shortYr - 1);
        });
        filter_header = header.filter(item => {
            const splitData = item.MONTH_HEADERS.split('-');
            return splitData[splitData.length - 1] == (shortYr - 1);
        });
        allCmpyUsIndData(filter_data, filter_header);
    } else if (selectedVal == shortYr) {
        filter_data = full_data.filter(item => {
            const splitData = item.Date.split('-');
            return splitData[splitData.length - 1] == shortYr;
        });
        filter_header = header.filter(item => {
            const splitData = item.MONTH_HEADERS.split('-');
            return splitData[splitData.length - 1] == shortYr;
        });
        allCmpyUsIndData(filter_data, filter_header);
    } else if (selectedVal == (year + 1).toString().substr(-2)) {
        filter_data = full_data.filter(item => {
            const splitData = item.Date.split('-');
            return splitData[splitData.length - 1] == (year + 1).toString().substr(-2);
        });
        filter_header = header.filter(item => {
            const splitData = item.MONTH_HEADERS.split('-');
            return splitData[splitData.length - 1] == (year + 1).toString().substr(-2);
        });
        allCmpyUsIndData(filter_data, filter_header);
    }
}

function getMonth(str) {
    if (str.indexOf('-') > -1) {
        var dateStr = str.split('-'),
            dateMM = dateStr[0],
            dateDD = dateStr[1],
            dateYY = dateStr[2];
        function GetMonthName(monthNumber) {

            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months[monthNumber - 1];

        }
        if (dateStr.length > 2) {
            return GetMonthName(dateMM);
        } else {
            return dateMM;
        }
    } else {
        return str;
    }
}

function togglefun(obj) {
    $("table tr").each(function () {
        let len = $(this).find("." + obj).length;
        let className = $('#' + obj).find('i').attr('class');
        $(this).find("." + obj).each(function (index) { if (index !== len - 1) { $(this).toggle(); } });
    });
    $("#" + obj).find('i').toggleClass('fa-angle-double-right fa-angle-double-left');

    let length = $("#" + obj).closest("tr").next("tr").find("." + obj + ":visible").length;
    $('.width-modify').css('z-index', '101');
    $("#" + obj).attr("colspan", length);
    if (length == "1") {
        let val = 25;
        $('.width-modify').css('top', val + 'px');
    } else {
        let val = 25;
        $('.width-modify').css('top', val + 'px');
    }
}

function insertClassNameOrder(data, actual_bench, fact_product, spl_leaves, training, use_bench_details, actual_bench_us, fact_product_us, spl_leaves_us, training_us, use_bench_details_us) {
    let date = getMonth(data.Date);
    $("#utilization").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.UTILIZATION + "</td>");
    $("#tot_ind_utiliz").find("." + date).last().after("<td class='" + date + " custom_bg_color1'><b>" + data.Total_IND_Utilization + "</b></td>");
    $("#ind_open_req_del").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.IND_OPEN_Reqs_Delivery + "</td>");
    $("#ind_open_req_non_del").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.IND_OPEN_Reqs_Non_Delivery + "</td>");

    $("#us_utilization").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.UTILIZATION_US + "</td>");
    $("#tot_us_utiliz").find("." + date).last().after("<td class='" + date + " custom_bg_color1'>" + data.Total_US_Utilization_US + "</td>");
    $("#us_open_req_del").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.IND_OPEN_Reqs_Delivery_US + "</td>");
    $("#us_open_req_non_del").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.IND_OPEN_Reqs_Non_Delivery_US + "</td>");

    $("#avl_tot_avail_res_count").find("." + date).last().after("<td class='" + date + " custom_bg_color2'><b>" + data.TOTAL_AVAILABLE_HEAD_COUNT_AVIALABLE + "</b></td>");
    $("#avl_training").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + createDiv(data.TRAINING_AVAILABLE, training) + "</td>");
    $("#avl_actual_bench").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + createDiv(data.BENCH_AVAILABLE, actual_bench) + "</td>");
    // $("#avl_usable_bench").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + createDiv(data.USE_BENCH_AVAILABLE, use_bench_details) + "</td>");

    $("#us_avl_tot_avail_res_count").find("." + date).last().after("<td class='" + date + " custom_bg_color2'><b>" + data.TOTAL_AVAILABLE_HEAD_COUNT_AVIALABLE_US + "</b></td>");
    $("#us_avl_training").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + createDiv(data.TRAINING_AVAILABLE_US, training_us) + "</td>");
    $("#us_avl_actual_bench").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + createDiv(data.BENCH_AVAILABLE_US, actual_bench_us) + "</td>");
    // $("#us_avl_usable_bench").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + createDiv(data.USE_BENCH_AVAILABLE_US, use_bench_details_us) + "</td>");

    $("#demand_signed_sow").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.SIGNED_SOW_demand + "</td>");
    $("#demand_70_per_probability").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.demand_70_per_probability + "</td>");
    $("#demand_50_per_probability").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.demand_50_per_probability + "</td>");

    $("#us_demand_signed_sow").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.SIGNED_SOW_demand_US + "</td>");
    $("#us_demand_70_per_probability").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.demand_70_per_probability_US + "</td>");
    $("#us_demand_50_per_probability").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.demand_50_per_probability_US + "</td>");

    $("#sup_actual_del_head_count").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.ACTUAL_DEL_HEAD_COUNT_SUPPLY + "</td>");
    $("#sup_proj_del_head_count").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.PROJECTED_DEL_HEAD_COUNT_SUPPLY + "</td>");
    $("#sup_resigned_folks").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.RESIGNED_FOLKS + "</td>");
    $("#offered_folks").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.OFFERED_FOLKS + "</td>");
    $("#sup_proj_new_joinees").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.NEW_JOINEE + "</td>");
    $("#sup_proj_attr").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.Proj_Attr + "</td>");

    $("#us_sup_actual_del_head_count").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.ACTUAL_DEL_HEAD_COUNT_SUPPLY_US + "</td>");
    $("#us_sup_proj_del_head_count").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.PROJECTED_DEL_HEAD_COUNT_SUPPLY_US + "</td>");
    $("#us_sup_resigned_folks").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.RESIGNED_FOLKS_US + "</td>");
    $("#us_offered_folks").find("." + date).last().after("<td class='" + date + " custom_us_bg'>0</td>");
    $("#us_sup_proj_new_joinees").find("." + date).last().after("<td class='" + date + " custom_us_bg'>0</td>");
    $("#us_sup_proj_attr").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.Proj_Attr_US + "</td>");

    $("#gap_proj_Head_signed_sow").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.Proj_Delivery_Head_Count_Gap + "</td>");
    $("#gap_proj_signed_sow").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.gap_proj_signed_sow + "</td>");
    $("#gap_proj_70_per_prob").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.gap_proj_70_per_prob + "</td>");
    $("#gap_proj_50_per_prob").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.gap_proj_50_per_prob + "</td>");
    $("#gap_actual_head_signed_sow").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.Actual_Delivery_Head_Count_Gap + "</td>");
    $("#gap_actual_signed_sow").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.SIGNED_SOW_gap + "</td>");
    $("#gap_actual_70_per_prob").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.gap_70_per_probability + "</td>");
    $("#gap_actual_50_per_prob").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.gap_50_per_probability + "</td>");

    $("#us_gap_proj_Head_signed_sow").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.Proj_Delivery_Head_Count_Gap_US + "</td>");
    $("#us_gap_proj_signed_sow").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.gap_proj_signed_sow_US + "</td>");
    $("#us_gap_proj_70_per_prob").find("." + date).last().after("<td class='" + date + " custom_us_bg'>0</td>");
    $("#us_gap_proj_50_per_prob").find("." + date).last().after("<td class='" + date + " custom_us_bg'>0</td>");
    $("#us_gap_actual_head_signed_sow").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.Actual_Delivery_Head_Count_Gap_US + "</td>");
    $("#us_gap_actual_signed_sow").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.SIGNED_SOW_gap_US + "</td>");
    $("#us_gap_actual_70_per_prob").find("." + date).last().after("<td class='" + date + " custom_us_bg'>0</td>");
    $("#us_gap_actual_50_per_prob").find("." + date).last().after("<td class='" + date + " custom_us_bg'>0</td>");

    $("#gap_sow_actual_billed").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.GAP_SOW_ACTUALL_BILLED + "</td>");
    $("#all_no_of_client_sow").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.No_of_Client_SOWs + "</td>");
    $("#all_no_of_inter_proj_sow").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.No_of_Internal_SOWs + "</td>");
    $("#all_sow_res_billed").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.SOW_RESOURCE_BILLED + "</td>");
    $("#all_client_res").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.Client_Resource_ALL + "</td>");
    $("#all_actual_billed").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.ACTUAL_BILLED_ALL + "</td>");
    $("#all_investment").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.INVESTMENT_ALL + "</td>");
    // $("#all_buffer").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.BUFFER_ALL + "</td>");
    // $("#all_leader_invest").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.LEADERS_INVESTMENT + "</td>");
    $("#all_tot_avial_res_count").find("." + date).last().after("<td class='" + date + " custom_bg_color3'><b>" + data.TOTAL_AVAILABLE_HEAD_COUNT_ALL + "</b></td>");
    $("#all_training").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.TRAINING_ALL + "</td>");
    $("#all_factspan_product").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.FACTSPAN_PRODUCT_ALL + "</td>");
    $("#all_actual_bench").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.BENCH_ALL + "</td>");
    // $("#all_usable_bench").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.USE_BENCH_ALL + "</td>");
    $("#all_spcl_leaves").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.SPECIAL_LEAVE_ALL + "</td>");
    $("#all_fs_investment").find("." + date).last().after("<td class='" + date + " custom_ind_bg'>" + data.FS_INVESTMENT + "</td>");

    $("#us_gap_sow_actual_billed").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.GAP_SOW_ACTUALL_BILLED_US + "</td>");
    $("#us_all_sow_res_billed").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.SOW_RESOURCE_BILLED_US + "</td>");
    $("#us_all_client_res").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.Client_Resource_ALL_US + "</td>");
    $("#us_all_actual_billed").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.ACTUAL_BILLED_ALL_US + "</td>");
    $("#us_all_investment").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.INVESTMENT_ALL_US + "</td>");
    // $("#us_all_buffer").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.BUFFER_ALL_US + "</td>");
    // $("#us_all_leader_invest").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.LEADERS_INVESTMENT_US + "</td>");
    $("#us_all_tot_avial_res_count").find("." + date).last().after("<td class='" + date + " custom_bg_color3'><b>" + data.TOTAL_AVAILABLE_HEAD_COUNT_ALL_US + "</b></td>");
    $("#us_all_training").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.TRAINING_ALL_US + "</td>");
    $("#us_all_factspan_product").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.FACTSPAN_PRODUCT_ALL_US + "</td>");
    $("#us_all_actual_bench").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.BENCH_ALL_US + "</td>");
    // $("#us_all_usable_bench").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.USE_BENCH_ALL_US + "</td>");
    $("#us_all_spcl_leaves").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.SPECIAL_LEAVE_ALL_US + "</td>");
    $("#us_all_fs_investment").find("." + date).last().after("<td class='" + date + " custom_us_bg'>" + data.FS_INVESTMENT_US + "</td>");

    $("#actual_total_delivery_headcount").find("." + date).last().after("<td class='" + date + " custom_bg_color4'><b>" + data.TOTAL_DELIVERY_HEAD_COUNT_ACTUAL + "</b></td>");
    $("#us_actual_total_delivery_headcount").find("." + date).last().after("<td class='" + date + " custom_bg_color4'><b>" + data.TOTAL_DELIVERY_HEAD_COUNT_ACTUAL_US + "</b></td>");
    $("#total_non_delivery_head_count_actual").find("." + date).last().after("<td class='" + date + " custom_bg_color4'><b>" + data.TOTAL_NON_DELIVERY_HEAD_COUNT_ACTUAL + "</b></td>");
    $("#total_non_delivery_head_count_actual_us").find("." + date).last().after("<td class='" + date + " custom_bg_color4'><b>" + data.TOTAL_NON_DELIVERY_HEAD_COUNT_ACTUAL_US + "</b></td>");
}

function allCmpyData(data, actual_bench, fact_product, spl_leaves, training, use_bench_details, actual_bench_us, fact_product_us, spl_leaves_us, training_us, use_bench_details_us) {
    let date = getMonth(data.Date);
    $("#utilization").append("<td class='" + date + " custom_ind_bg'>" + data.UTILIZATION + "</td>");
    $("#tot_ind_utiliz").append("<td class='" + date + " custom_bg_color1'><b>" + data.Total_IND_Utilization + "</b></td>");
    $("#ind_open_req_del").append("<td class='" + date + " custom_ind_bg'>" + data.IND_OPEN_Reqs_Delivery + "</td>");
    $("#ind_open_req_non_del").append("<td class='" + date + " custom_ind_bg'>" + data.IND_OPEN_Reqs_Non_Delivery + "</td>");

    $("#us_utilization").append("<td class='" + date + " custom_us_bg'>" + data.UTILIZATION_US + "</td>");
    $("#tot_us_utiliz").append("<td class='" + date + " custom_bg_color1'>" + data.Total_US_Utilization_US + "</td>");
    $("#us_open_req_del").append("<td class='" + date + " custom_us_bg'>" + data.IND_OPEN_Reqs_Delivery_US + "</td>");
    $("#us_open_req_non_del").append("<td class='" + date + " custom_us_bg'>" + data.IND_OPEN_Reqs_Non_Delivery_US + "</td>");

    $("#avl_tot_avail_res_count").append("<td class='" + date + " custom_bg_color2'><b>" + data.TOTAL_AVAILABLE_HEAD_COUNT_AVIALABLE + "</b></td>");
    $("#avl_training").append("<td class='" + date + " custom_ind_bg'>" + createDiv(data.TRAINING_AVAILABLE, training) + "</td>");
    $("#avl_actual_bench").append("<td class='" + date + " custom_ind_bg'>" + createDiv(data.BENCH_AVAILABLE, actual_bench) + "</td>");
    // $("#avl_usable_bench").append("<td class='" + date + " custom_ind_bg'>" + createDiv(data.USE_BENCH_AVAILABLE, use_bench_details) + "</td>");

    $("#us_avl_tot_avail_res_count").append("<td class='" + date + " custom_bg_color2'><b>" + data.TOTAL_AVAILABLE_HEAD_COUNT_AVIALABLE_US + "</b></td>");
    $("#us_avl_training").append("<td class='" + date + " custom_us_bg'>" + createDiv(data.TRAINING_AVAILABLE_US, training_us) + "</td>");
    $("#us_avl_actual_bench").append("<td class='" + date + " custom_us_bg'>" + createDiv(data.BENCH_AVAILABLE_US, actual_bench_us) + "</td>");
    // $("#us_avl_usable_bench").append("<td class='" + date + " custom_us_bg'>" + createDiv(data.USE_BENCH_AVAILABLE_US, use_bench_details_us) + "</td>");

    $("#demand_signed_sow").append("<td class='" + date + " custom_ind_bg'>" + data.SIGNED_SOW_demand + "</td>");
    $("#demand_70_per_probability").append("<td class='" + date + " custom_ind_bg'>" + data.demand_70_per_probability + "</td>");
    $("#demand_50_per_probability").append("<td class='" + date + " custom_ind_bg'>" + data.demand_50_per_probability + "</td>");

    $("#us_demand_signed_sow").append("<td class='" + date + " custom_us_bg'>" + data.SIGNED_SOW_demand_US + "</td>");
    $("#us_demand_70_per_probability").append("<td class='" + date + " custom_us_bg'>" + data.demand_70_per_probability_US + "</td>");
    $("#us_demand_50_per_probability").append("<td class='" + date + " custom_us_bg'>" + data.demand_50_per_probability_US + "</td>");

    $("#sup_actual_del_head_count").append("<td class='" + date + " custom_ind_bg'>" + data.ACTUAL_DEL_HEAD_COUNT_SUPPLY + "</td>");
    $("#sup_proj_del_head_count").append("<td class='" + date + " custom_ind_bg'>" + data.PROJECTED_DEL_HEAD_COUNT_SUPPLY + "</td>");
    $("#sup_resigned_folks").append("<td class='" + date + " custom_ind_bg'>" + data.RESIGNED_FOLKS + "</td>");
    $("#offered_folks").append("<td class='" + date + " custom_ind_bg'>" + data.OFFERED_FOLKS + "</td>");
    $("#sup_proj_new_joinees").append("<td class='" + date + " custom_ind_bg'>" + data.NEW_JOINEE + "</td>");
    $("#sup_proj_attr").append("<td class='" + date + " custom_ind_bg'>" + data.Proj_Attr + "</td>");

    $("#us_sup_actual_del_head_count").append("<td class='" + date + " custom_us_bg'>" + data.ACTUAL_DEL_HEAD_COUNT_SUPPLY_US + "</td>");
    $("#us_sup_proj_del_head_count").append("<td class='" + date + " custom_us_bg'>" + data.PROJECTED_DEL_HEAD_COUNT_SUPPLY_US + "</td>");
    $("#us_sup_resigned_folks").append("<td class='" + date + " custom_us_bg'>" + data.RESIGNED_FOLKS_US + "</td>");
    $("#us_offered_folks").append("<td class='" + date + " custom_us_bg'>0</td>");
    $("#us_sup_proj_new_joinees").append("<td class='" + date + " custom_us_bg'>0</td>");
    $("#us_sup_proj_attr").append("<td class='" + date + " custom_us_bg'>" + data.Proj_Attr_US + "</td>");

    $("#gap_proj_Head_signed_sow").append("<td class='" + date + " custom_ind_bg'>" + data.Proj_Delivery_Head_Count_Gap + "</td>");
    $("#gap_proj_signed_sow").append("<td class='" + date + " custom_ind_bg'>" + data.gap_proj_signed_sow + "</td>");
    $("#gap_proj_70_per_prob").append("<td class='" + date + " custom_ind_bg'>" + data.gap_proj_70_per_prob + "</td>");
    $("#gap_proj_50_per_prob").append("<td class='" + date + " custom_ind_bg'>" + data.gap_proj_50_per_prob + " </td>");
    $("#gap_actual_head_signed_sow").append("<td class='" + date + " custom_ind_bg'>" + data.Actual_Delivery_Head_Count_Gap + "</td>");
    $("#gap_actual_signed_sow").append("<td class='" + date + " custom_ind_bg'>" + data.SIGNED_SOW_gap + "</td>");
    $("#gap_actual_70_per_prob").append("<td class='" + date + " custom_ind_bg'>" + data.gap_70_per_probability + "</td>");
    $("#gap_actual_50_per_prob").append("<td class='" + date + " custom_ind_bg'>" + data.gap_50_per_probability + "</td>");

    $("#us_gap_proj_Head_signed_sow").append("<td class='" + date + " custom_us_bg'>" + data.Proj_Delivery_Head_Count_Gap_US + "</td>");
    $("#us_gap_proj_signed_sow").append("<td class='" + date + " custom_us_bg'>" + data.gap_proj_signed_sow_US + "</td>");
    $("#us_gap_proj_70_per_prob").append("<td class='" + date + " custom_us_bg'>" + data.gap_proj_70_per_prob_US + "</td>");
    $("#us_gap_proj_50_per_prob").append("<td class='" + date + " custom_us_bg'>" + data.gap_proj_50_per_prob_US + "</td>");
    $("#us_gap_actual_head_signed_sow").append("<td class='" + date + " custom_us_bg'>" + data.Actual_Delivery_Head_Count_Gap_US + "</td>");
    $("#us_gap_actual_signed_sow").append("<td class='" + date + " custom_us_bg'>" + data.SIGNED_SOW_gap_US + "</td>");
    $("#us_gap_actual_70_per_prob").append("<td class='" + date + " custom_us_bg'>" + data.gap_70_per_probability_US + "</td>");
    $("#us_gap_actual_50_per_prob").append("<td class='" + date + " custom_us_bg'>" + data.gap_50_per_probability_US + "</td>");

    $("#gap_sow_actual_billed").append("<td class='" + date + " custom_ind_bg'>" + data.GAP_SOW_ACTUALL_BILLED + "</td>");
    $("#all_no_of_client_sow").append("<td class='" + date + " custom_ind_bg'>" + data.No_of_Client_SOWs + "</td>");
    $("#all_no_of_inter_proj_sow").append("<td class='" + date + " custom_ind_bg'>" + data.No_of_Internal_SOWs + "</td>");
    $("#all_sow_res_billed").append("<td class='" + date + " custom_ind_bg'>" + data.SOW_RESOURCE_BILLED + "</td>");
    $("#all_client_res").append("<td class='" + date + " custom_ind_bg'>" + data.Client_Resource_ALL + "</td>");
    $("#all_actual_billed").append("<td class='" + date + " custom_ind_bg'>" + data.ACTUAL_BILLED_ALL + "</td>");
    $("#all_investment").append("<td class='" + date + " custom_ind_bg'>" + data.INVESTMENT_ALL + "</td>");
    // $("#all_buffer").append("<td class='" + date + " custom_ind_bg'>" + data.BUFFER_ALL + "</td>");
    // $("#all_leader_invest").append("<td class='" + date + " custom_ind_bg'>" + data.LEADERS_INVESTMENT + "</td>");
    $("#all_tot_avial_res_count").append("<td class='" + date + " custom_bg_color3'><b>" + data.TOTAL_AVAILABLE_HEAD_COUNT_ALL + "</b></td>");
    $("#all_training").append("<td class='" + date + " custom_ind_bg'>" + data.TRAINING_ALL + "</td>");
    $("#all_factspan_product").append("<td class='" + date + " custom_ind_bg'>" + data.FACTSPAN_PRODUCT_ALL + "</td>");
    $("#all_actual_bench").append("<td class='" + date + " custom_ind_bg'>" + data.BENCH_ALL + "</td>");
    // $("#all_usable_bench").append("<td class='" + date + " custom_ind_bg'>" + data.USE_BENCH_ALL + "</td>");
    $("#all_spcl_leaves").append("<td class='" + date + " custom_ind_bg'>" + data.SPECIAL_LEAVE_ALL + "</td>");
    $("#all_fs_investment").append("<td class='" + date + " custom_ind_bg'>" + data.FS_INVESTMENT + "</td>");

    $("#us_gap_sow_actual_billed").append("<td class='" + date + " custom_us_bg'>" + data.GAP_SOW_ACTUALL_BILLED_US + "</td>");
    $("#us_all_sow_res_billed").append("<td class='" + date + " custom_us_bg'>" + data.SOW_RESOURCE_BILLED_US + "</td>");
    $("#us_all_client_res").append("<td class='" + date + " custom_us_bg'>" + data.Client_Resource_ALL_US + "</td>");
    $("#us_all_actual_billed").append("<td class='" + date + " custom_us_bg'>" + data.ACTUAL_BILLED_ALL_US + "</td>");
    $("#us_all_investment").append("<td class='" + date + " custom_us_bg'>" + data.INVESTMENT_ALL_US + "</td>");
    // $("#us_all_buffer").append("<td class='" + date + " custom_us_bg'>" + data.BUFFER_ALL_US + "</td>");
    // $("#us_all_leader_invest").append("<td class='" + date + " custom_us_bg'>" + data.LEADERS_INVESTMENT_US + "</td>");
    $("#us_all_tot_avial_res_count").append("<td class='" + date + " custom_bg_color3'><b>" + data.TOTAL_AVAILABLE_HEAD_COUNT_ALL_US + "</b></td>");
    $("#us_all_training").append("<td class='" + date + " custom_us_bg'>" + data.TRAINING_ALL_US + "</td>");
    $("#us_all_factspan_product").append("<td class='" + date + " custom_us_bg'>" + data.FACTSPAN_PRODUCT_ALL_US + "</td>");
    $("#us_all_actual_bench").append("<td class='" + date + " custom_us_bg'>" + data.BENCH_ALL_US + "</td>");
    // $("#us_all_usable_bench").append("<td class='" + date + " custom_us_bg'>" + data.USE_BENCH_ALL_US + "</td>");
    $("#us_all_spcl_leaves").append("<td class='" + date + " custom_us_bg'>" + data.SPECIAL_LEAVE_ALL_US + "</td>");
    $("#us_all_fs_investment").append("<td class='" + date + " custom_us_bg'>" + data.FS_INVESTMENT_US + "</td>");

    $("#actual_total_delivery_headcount").append("<td class='" + date + " custom_bg_color4'><b>" + data.TOTAL_DELIVERY_HEAD_COUNT_ACTUAL + "</b></td>");
    $("#us_actual_total_delivery_headcount").append("<td class='" + date + " custom_bg_color4'><b>" + data.TOTAL_DELIVERY_HEAD_COUNT_ACTUAL_US + "</b></td>");
    $("#total_non_delivery_head_count_actual").append("<td class='" + date + " custom_bg_color4'><b>" + data.TOTAL_NON_DELIVERY_HEAD_COUNT_ACTUAL + "</b></td>");
    $("#total_non_delivery_head_count_actual_us").append("<td class='" + date + " custom_bg_color4'><b>" + data.TOTAL_NON_DELIVERY_HEAD_COUNT_ACTUAL_US + "</b></td>");

}

function tootTipRole(temp) {
    let emp_name = "";
    $.each(temp, function (i, name) {
        emp_name = emp_name + `<li>${name.ROLE} - (${name.TOTAL}) </li>`;
    });
    return `<span class='spnTooltip'>
                    <ul>${emp_name}<ul>
              </span>`
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
        allCmpyUsIndData(data_2022, "2022");
    } else {
        allCmpyUsIndData(data_2021, "2021");
    }
}

function getColorValue_br() {
    getYearData(getYearData);
}

function allCmpyUsIndData(data, head) {
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
    let monthHeader = []
    $.each(head, function (i, headMonth) {
        monthHeader.push(headMonth.MONTH_HEADERS);
    });
    let monthList = [];
    for (var j = 0; j < data.length; j++) {
        let date = getMonth(data[j].Date);
        monthList.push(date);
    }
    monthList = $.grep(monthList, function (n) { return n == 0 || n });

    map = monthList.reduce(function (prev, cur) {
        prev[cur] = (prev[cur] || 0) + 1;
        return prev;
    }, {});

    for (var key in map) {
        $.each(monthHeader, function (i, monthvalue) {
            if (key == monthvalue.slice(0, 3)) {
                $("#month").append("<th class='width-modify-head resUtilHeaderbg' colspan=" + map[key] + " id=" + key + " onClick='togglefun(\"" + key + "\")'>" + monthvalue.replace("-", " ") + "<i class='fas fa-angle-double-left' style='color: #e96e31;'></i></th>");
            }
        });

        for (let k = 1; k <= map[key]; k++) {
            if (k == map[key]) {
                $("#date").append("<th class='" + key + " width-modify resUtilHeaderbg'>Total</th>");
            } else {
                $("#date").append("<th class='" + key + " width-modify resUtilHeaderbg'>Week " + k + "</th>");
            }
        }
    }
    for (var i = 0; i < data.length; i++) {
        let date = getMonth(data[i].Date);
        monthList.push(date);
        let all_data = data[i];
        let actual_bench = "", fact_product = "", spl_leaves = "", training = "", use_bench_details = "";
        let actual_bench_us = "", fact_product_us = "", spl_leaves_us = "", training_us = "", use_bench_details_us = "";
        if (data[i].Actual_Bench_details.length > 0) {
            let temp = data[i].Actual_Bench_details
            actual_bench = tootTipRole(temp);
        }
        if (data[i].Actual_Bench_details_us.length > 0) {
            let temp = data[i].Actual_Bench_details_us
            actual_bench_us = tootTipRole(temp);
        }
        if (data[i].FACT_PRODUCT_details.length > 0) {
            let temp = data[i].FACT_PRODUCT_details
            fact_product = tootTipRole(temp);
        }
        if (data[i].FACT_PRODUCT_details_us.length > 0) {
            let temp = data[i].FACT_PRODUCT_details_us
            fact_product_us = tootTipRole(temp);
        }
        if (data[i].SPL_LEAVE_details.length > 0) {
            let temp = data[i].SPL_LEAVE_details
            spl_leaves = tootTipRole(temp);
        }
        if (data[i].SPL_LEAVE_details_us.length > 0) {
            let temp = data[i].SPL_LEAVE_details_us
            spl_leaves_us = tootTipRole(temp);
        }
        if (data[i].TRAINING_details.length > 0) {
            let temp = data[i].TRAINING_details
            training = tootTipRole(temp);
        }
        if (data[i].TRAINING_details_us.length > 0) {
            let temp = data[i].TRAINING_details_us
            training_us = tootTipRole(temp);
        }
        if (data[i].USE_BENCH_details.length > 0) {
            let temp = data[i].USE_BENCH_details
            use_bench_details = tootTipRole(temp);
        }
        if (data[i].USE_BENCH_details_us.length > 0) {
            let temp = data[i].USE_BENCH_details_us
            use_bench_details_us = tootTipRole(temp);
        }
        if ($("#utilization").find("." + date).last().length > 0) {
            insertClassNameOrder(all_data, actual_bench, fact_product, spl_leaves, training, use_bench_details, actual_bench_us, fact_product_us, spl_leaves_us, training_us, use_bench_details_us);
        } else {
            allCmpyData(all_data, actual_bench, fact_product, spl_leaves, training, use_bench_details, actual_bench_us, fact_product_us, spl_leaves_us, training_us, use_bench_details_us);
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
    let utiliz_header = $('#utiliz_header').is(":checked");
    let avial_header = $('#avial_header').is(':checked');
    let demand_header = $('#demand_header').is(':checked');
    let supply_header = $('#supply_header').is(':checked');
    let gap_header = $('#gap_header').is(':checked');
    let all_header = $('#all_header').is(':checked');
    if (utiliz_header == false) {
        $('#empty_1').hide();
    }
    if (avial_header == false) {
        $('#empty_2').hide();
    }
    if (demand_header == false) {
        $('#empty_3').hide();
    }
    if (supply_header == false) {
        $('#empty_4').hide();
    }
    if (gap_header == false) {
        $('#empty_5').hide();
    }
    if (all_header == false) {
        $('#empty_6').hide();
    }

    if (status == true) {
        let iconClss = "";
        $('.' + obj).show();
        if (obj == "utiliz_header") {
            toggleBlock('utiliz_toggle');
            iconClss = "utiliz_toggle";
            $('#empty_1').show();
        }
        if (obj == "avial_header") {
            toggleBlock('avial_head_toggle');
            iconClss = "avial_head_toggle";
            $('#empty_2').show();
        }
        if (obj == "demand_header") {
            toggleBlock('demand_head_toggle');
            iconClss = "demand_head_toggle";
            $('#empty_3').show();
        }
        if (obj == "supply_header") {
            toggleBlock('sup_head_toggle');
            iconClss = "sup_head_toggle";
            $('#empty_4').show();
        }
        if (obj == "gap_header") {
            toggleBlock('gap_head_toggle');
            iconClss = "gap_head_toggle";
            $('#empty_5').show();
        }
        if (obj == "all_header") {
            toggleBlock('all_head_toggle');
            iconClss = "all_head_toggle";
            $('#empty_6').show();
        }
        $("#" + iconClss).find('i').removeClass('fa-angle-up');
        $("#" + iconClss).find('i').addClass('fa-angle-down');
    }
    else {
        $('.' + obj).hide();
    }
}

function toggleBlock(obj) {
    let length = $("." + obj + ":hidden").length;
    let ind_data = $('#ind_data').is(":checked");
    let us_data = $('#us_data').is(":checked");

    let utiliz_toggle = $('#utiliz_toggle').attr("rowspan");
    let utiliz_toggle_us = $('#utiliz_toggle_us').attr("rowspan");
    let avial_head_toggle = $('#avial_head_toggle').attr("rowspan");
    let avial_head_toggle_us = $('#avial_head_toggle_us').attr("rowspan");
    let demand_head_toggle = $('#demand_head_toggle').attr("rowspan");
    let demand_head_toggle_us = $('#demand_head_toggle_us').attr("rowspan");
    let sup_head_toggle = $('#sup_head_toggle').attr("rowspan");
    let sup_head_toggle_us = $('#sup_head_toggle_us').attr("rowspan");
    let gap_head_toggle = $('#gap_head_toggle').attr("rowspan");
    let gap_head_toggle_us = $('#gap_head_toggle_us').attr("rowspan");
    let all_head_toggle = $('#all_head_toggle').attr("rowspan");
    let all_head_toggle_us = $('#all_head_toggle_us').attr("rowspan");
    let all_actual_total = $('#all_actual_total').attr("rowspan");
    let all_actual_total_us = $('#all_actual_total_us').attr("rowspan");
    $("." + obj).toggle();
    if (obj == "utiliz_toggle") {
        if (ind_data == true && us_data == true) {
            if (utiliz_toggle == "4") {
                $("#utiliz_toggle").attr("rowspan", 8);
                $("#utiliz_toggle_us").attr("rowspan", 8);
                $("#utiliz_toggle").show();
                $("#utiliz_toggle_us").hide();
                $(".ind_main_data").show();
                $(".ind_main_option").show();
                $(".us_main_data").show();
                $(".us_main_option").show();
            } else {
                $("#" + obj).attr("rowspan", length + 4);
            }

        } else if (ind_data == true && us_data == false) {
            if (utiliz_toggle == "2") {
                $("#utiliz_toggle").attr("rowspan", 4);
                $("#utiliz_toggle_us").attr("rowspan", 4);
                $("#utiliz_toggle").show();
                $("#utiliz_toggle_us").hide();
                $(".ind_main_data").show();
                $(".ind_main_option").show();
                $(".us_main_data").hide();
                $(".us_main_option").hide();
            } else if (utiliz_toggle == "4") {
                $("#utiliz_toggle").attr("rowspan", 2);
                $("#utiliz_toggle_us").attr("rowspan", 2);
                $("#utiliz_toggle").show();
                $("#utiliz_toggle_us").hide();
                $(".ind_main_data").show();
                $(".ind_main_option").hide();
                $(".us_main_data").hide();
                $(".us_main_option").hide();
            }
        } else if (ind_data == false && us_data == true) {
            if (utiliz_toggle_us == "2") {
                $("#utiliz_toggle").attr("rowspan", 4);
                $("#utiliz_toggle_us").attr("rowspan", 4);
                $("#utiliz_toggle_us").show();
                $("#utiliz_toggle").hide();
                $(".ind_main_data").hide();
                $(".ind_main_option").hide();
                $(".us_main_data").show();
                $(".us_main_option").show();
            } else if (utiliz_toggle_us == "4") {
                $("#utiliz_toggle").attr("rowspan", 2);
                $("#utiliz_toggle_us").attr("rowspan", 2);
                $("#utiliz_toggle_us").show();
                $("#utiliz_toggle").hide();
                $(".ind_main_data").hide();
                $(".ind_main_option").hide();
                $(".us_main_data").show();
                $(".us_main_option").hide();
            }
        }
    }
    if (obj == "avial_head_toggle") {
        if (ind_data == true && us_data == true) {
            if (avial_head_toggle == "1") {
                $("#avial_head_toggle").attr("rowspan", 2);
                $("#avial_head_toggle_us").attr("rowspan", 2);
                $("#avial_head_toggle").show();
                $("#avial_head_toggle_us").hide();
                $(".ind_main_data_1").show();
                $(".ind_main_option_1").hide();
                $(".us_main_data_1").show();
                $(".us_main_option_1").hide();
            } else {
                $("#" + obj).attr("rowspan", parseInt(length) + 2);
            }

        } else if (ind_data == true && us_data == false) {
            if (avial_head_toggle == "1") {
                $("#avial_head_toggle").attr("rowspan", 4);
                $("#avial_head_toggle_us").attr("rowspan", 4);
                $("#avial_head_toggle").show();
                $("#avial_head_toggle_us").hide();
                $(".ind_main_data_1").show();
                $(".ind_main_option_1").show();
                $(".us_main_data_1").hide();
                $(".us_main_option_1").hide();
            }
            else if (avial_head_toggle == "4" || avial_head_toggle == "2" || avial_head_toggle == "8") {
                $("#avial_head_toggle").attr("rowspan", 1);
                $("#avial_head_toggle_us").attr("rowspan", 1);
                $("#avial_head_toggle").show();
                $("#avial_head_toggle_us").hide();
                $(".ind_main_data_1").show();
                $(".ind_main_option_1").hide();
                $(".us_main_data_1").hide();
                $(".us_main_option_1").hide();
            }
        } else if (ind_data == false && us_data == true) {
            if (avial_head_toggle_us == "1" || avial_head_toggle_us == "8") {
                $("#avial_head_toggle").attr("rowspan", 4);
                $("#avial_head_toggle_us").attr("rowspan", 4);
                $("#avial_head_toggle").hide();
                $("#avial_head_toggle_us").show();
                $(".ind_main_data_1").hide();
                $(".ind_main_option_1").hide();
                $(".us_main_data_1").show();
                $(".us_main_option_1").show();
            } else if (avial_head_toggle_us == "4" || avial_head_toggle_us == "2") {
                $("#avial_head_toggle").attr("rowspan", 1);
                $("#avial_head_toggle_us").attr("rowspan", 1);
                $("#avial_head_toggle").hide();
                $("#avial_head_toggle_us").show();
                $(".ind_main_data_1").hide();
                $(".ind_main_option_1").hide();
                $(".us_main_data_1").show();
                $(".us_main_option_1").hide();
            }
        }

    }
    if (obj == "demand_head_toggle") {
        if (ind_data == true && us_data == true) {
            if (demand_head_toggle == "1") {
                $("#demand_head_toggle").attr("rowspan", 2);
                $("#demand_head_toggle_us").attr("rowspan", 2);
                $("#demand_head_toggle").show();
                $("#demand_head_toggle_us").hide();
                $(".ind_main_data_2").show();
                $(".ind_main_option_2").hide();
                $(".us_main_data_2").show();
                $(".us_main_option_2").hide();
            } else {
                $("#" + obj).attr("rowspan", length + 2);
            }

        } else if (ind_data == true && us_data == false) {
            if (demand_head_toggle == "1") {
                $("#demand_head_toggle").attr("rowspan", 3);
                $("#demand_head_toggle_us").attr("rowspan", 3);
                $("#demand_head_toggle").show();
                $("#demand_head_toggle_us").hide();
                $(".ind_main_data_2").show();
                $(".ind_main_option_2").show();
                $(".us_main_data_2").hide();
                $(".us_main_option_2").hide();
            }
            else if (demand_head_toggle == "3" || demand_head_toggle == "2") {
                $("#demand_head_toggle").attr("rowspan", 1);
                $("#demand_head_toggle_us").attr("rowspan", 1);
                $("#demand_head_toggle").show();
                $("#demand_head_toggle_us").hide();
                $(".ind_main_data_2").show();
                $(".ind_main_option_2").hide();
                $(".us_main_data_2").hide();
                $(".us_main_option_2").hide();
            }
        } else if (ind_data == false && us_data == true) {
            if (demand_head_toggle_us == "1") {
                $("#demand_head_toggle").attr("rowspan", 3);
                $("#demand_head_toggle_us").attr("rowspan", 3);
                $("#demand_head_toggle").hide();
                $("#demand_head_toggle_us").show();
                $(".ind_main_data_2").hide();
                $(".ind_main_option_2").hide();
                $(".us_main_data_2").show();
                $(".us_main_option_2").show();
            } else if (demand_head_toggle_us == "3" || demand_head_toggle_us == "2") {
                $("#demand_head_toggle").attr("rowspan", 1);
                $("#demand_head_toggle_us").attr("rowspan", 1);
                $("#demand_head_toggle").hide();
                $("#demand_head_toggle_us").show();
                $(".ind_main_data_2").hide();
                $(".ind_main_option_2").hide();
                $(".us_main_data_2").show();
                $(".us_main_option_2").hide();
            }
        }

    }
    if (obj == "sup_head_toggle") {
        if (ind_data == true && us_data == true) {
            if (sup_head_toggle_us == "6") {
                $("#sup_head_toggle").attr("rowspan", 2);
                $("#sup_head_toggle_us").attr("rowspan", 2);
                $("#sup_head_toggle").show();
                $("#sup_head_toggle_us").hide();
                $(".ind_main_data_3").show();
                $(".ind_main_option_3").hide();
                $(".us_main_data_3").show();
                $(".us_main_option_3").hide();
            } else {
                $("#" + obj).attr("rowspan", length + 2);
            }

        } else if (ind_data == true && us_data == false) {
            if (sup_head_toggle == "1") {
                $("#sup_head_toggle").attr("rowspan", 6);
                $("#sup_head_toggle_us").attr("rowspan", 6);
                $("#sup_head_toggle").show();
                $("#sup_head_toggle_us").hide();
                $(".ind_main_data_3").show();
                $(".ind_main_option_3").show();
                $(".us_main_data_3").hide();
                $(".us_main_option_3").hide();
            }
            else if (sup_head_toggle == "6" || sup_head_toggle == "2") {
                $("#sup_head_toggle").attr("rowspan", 1);
                $("#sup_head_toggle_us").attr("rowspan", 1);
                $("#sup_head_toggle").show();
                $("#sup_head_toggle_us").hide();
                $(".ind_main_data_3").show();
                $(".ind_main_option_3").hide();
                $(".us_main_data_3").hide();
                $(".us_main_option_3").hide();
            }
        } else if (ind_data == false && us_data == true) {
            if (sup_head_toggle_us == "1") {
                $("#sup_head_toggle").attr("rowspan", 6);
                $("#sup_head_toggle_us").attr("rowspan", 6);
                $("#sup_head_toggle").hide();
                $("#sup_head_toggle_us").show();
                $(".ind_main_data_3").hide();
                $(".ind_main_option_3").hide();
                $(".us_main_data_3").show();
                $(".us_main_option_3").show();
            }
            else if (sup_head_toggle_us == "6" || sup_head_toggle_us == "2") {
                $("#sup_head_toggle").attr("rowspan", 1);
                $("#sup_head_toggle_us").attr("rowspan", 1);
                $("#sup_head_toggle").hide();
                $("#sup_head_toggle_us").show();
                $(".ind_main_data_3").hide();
                $(".ind_main_option_3").hide();
                $(".us_main_data_3").show();
                $(".us_main_option_3").hide();
            }
        }

    }
    if (obj == "gap_head_toggle") {
        if (ind_data == true && us_data == true) {
            if (gap_head_toggle == "8") {
                $("#gap_head_toggle").attr("rowspan", 2);
                $("#gap_head_toggle_us").attr("rowspan", 2);
                $("#gap_head_toggle").show();
                $("#gap_head_toggle_us").hide();
                $(".ind_main_data_4").show();
                $(".ind_main_option_4").hide();
                $(".us_main_data_4").show();
                $(".us_main_option_4").hide();
            } else {
                $("#" + obj).attr("rowspan", length + 2);
            }

        } else if (ind_data == true && us_data == false) {
            if (gap_head_toggle == "1") {
                $("#gap_head_toggle").attr("rowspan", 8);
                $("#gap_head_toggle_us").attr("rowspan", 8);
                $("#gap_head_toggle").show();
                $("#gap_head_toggle_us").hide();
                $(".ind_main_data_4").show();
                $(".ind_main_option_4").show();
                $(".us_main_data_4").hide();
                $(".us_main_option_4").hide();
            }
            else if (gap_head_toggle == "8" || gap_head_toggle == "2") {
                $("#gap_head_toggle").attr("rowspan", 1);
                $("#gap_head_toggle_us").attr("rowspan", 1);
                $("#gap_head_toggle").show();
                $("#gap_head_toggle_us").hide();
                $(".ind_main_data_4").show();
                $(".ind_main_option_4").hide();
                $(".us_main_data_4").hide();
                $(".us_main_option_4").hide();
            }
        } else if (ind_data == false && us_data == true) {
            if (gap_head_toggle_us == "1") {
                $("#gap_head_toggle").attr("rowspan", 8);
                $("#gap_head_toggle_us").attr("rowspan", 8);
                $("#gap_head_toggle").hide();
                $("#gap_head_toggle_us").show();
                $(".ind_main_data_4").hide();
                $(".ind_main_option_4").hide();
                $(".us_main_data_4").show();
                $(".us_main_option_4").show();
            } else if (gap_head_toggle_us == "8" || gap_head_toggle_us == "2") {
                $("#gap_head_toggle").attr("rowspan", 1);
                $("#gap_head_toggle_us").attr("rowspan", 1);
                $("#gap_head_toggle").hide();
                $("#gap_head_toggle_us").show();
                $(".ind_main_data_4").hide();
                $(".ind_main_option_4").hide();
                $(".us_main_data_4").show();
                $(".us_main_option_4").hide();
            }
        }

    }
    if (obj == "all_head_toggle") {
        if (ind_data == true && us_data == true) {
            if (all_head_toggle == "15") {
                $("#all_head_toggle").attr("rowspan", 12);
                $("#all_head_toggle_us").attr("rowspan", 12);
                $("#all_head_toggle").show();
                $("#all_head_toggle_us").hide();
                $(".ind_main_data_5").show();
                $(".ind_main_option_5").hide();
                $(".us_main_data_5").show();
                $(".us_main_option_5").hide();
            } else if (all_head_toggle == "6") {
                $("#all_head_toggle").attr("rowspan", 10);
                $("#all_head_toggle_us").attr("rowspan", 10);
                $("#all_head_toggle").show();
                $("#all_head_toggle_us").hide();
                $(".ind_main_data_5").show();
                $(".ind_main_option_5").hide();
                $(".us_main_data_5").show();
                $(".us_main_option_5").hide();
            } else {
                $("#" + obj).attr("rowspan", length + 10);
            }

        } else if (ind_data == true && us_data == false) {
            if (all_head_toggle == "6") {
                $("#all_head_toggle").attr("rowspan", 16);
                $("#all_head_toggle_us").attr("rowspan", 15);
                $("#all_head_toggle").show();
                $("#all_head_toggle_us").hide();
                $(".ind_main_data_5").show();
                $(".ind_main_option_5").show();
                $(".us_main_data_5").hide();
                $(".us_main_option_5").hide();
            }
            else if (all_head_toggle == "16" || all_head_toggle == "30") {
                $("#all_head_toggle").attr("rowspan", 6);
                $("#all_head_toggle_us").attr("rowspan", 4);
                $("#all_head_toggle").show();
                $("#all_head_toggle_us").hide();
                $(".ind_main_data_5").show();
                $(".ind_main_option_5").hide();
                $(".us_main_data_5").hide();
                $(".us_main_option_5").hide();
            }
        } else if (ind_data == false && us_data == true) {
            if (all_head_toggle_us == "4") {
                $("#all_head_toggle").attr("rowspan", 16);
                $("#all_head_toggle_us").attr("rowspan", 14);
                $("#all_head_toggle").hide();
                $("#all_head_toggle_us").show();
                $(".ind_main_data_5").hide();
                $(".ind_main_option_5").hide();
                $(".us_main_data_5").show();
                $(".us_main_option_5").show();
            } else if (all_head_toggle_us == "14" || all_head_toggle_us == "30") {
                $("#all_head_toggle").attr("rowspan", 6);
                $("#all_head_toggle_us").attr("rowspan", 4);
                $("#all_head_toggle").hide();
                $("#all_head_toggle_us").show();
                $(".ind_main_data_5").hide();
                $(".ind_main_option_5").hide();
                $(".us_main_data_5").show();
                $(".us_main_option_5").hide();
            } else if (all_head_toggle_us == "10" || all_head_toggle_us == "15") {
                $("#all_head_toggle").attr("rowspan", 6);
                $("#all_head_toggle_us").attr("rowspan", 4);
                $("#all_head_toggle").hide();
                $("#all_head_toggle_us").show();
                $(".ind_main_data_5").hide();
                $(".ind_main_option_5").hide();
                $(".us_main_data_5").show();
                $(".us_main_option_5").hide();
            }
        }

    }

    $("#" + obj).find('i').toggleClass('fa-angle-up fa-angle-down');
}

function checkIndUs(obj) {
    let ind_data = $('#ind_data').is(":checked");
    let us_data = $('#us_data').is(":checked");
    let utiliz_header = $('#utiliz_header').is(":checked");
    let avial_header = $('#avial_header').is(':checked');
    let demand_header = $('#demand_header').is(':checked');
    let supply_header = $('#supply_header').is(':checked');
    let gap_header = $('#gap_header').is(':checked');
    let all_header = $('#all_header').is(':checked');

    let utiliz_toggle = $('#utiliz_toggle').attr("rowspan");
    let utiliz_toggle_us = $('#utiliz_toggle_us').attr("rowspan");
    let avial_head_toggle = $('#avial_head_toggle').attr("rowspan");
    let avial_head_toggle_us = $('#avial_head_toggle_us').attr("rowspan");
    let demand_head_toggle = $('#demand_head_toggle').attr("rowspan");
    let demand_head_toggle_us = $('#demand_head_toggle_us').attr("rowspan");
    let sup_head_toggle = $('#sup_head_toggle').attr("rowspan");
    let sup_head_toggle_us = $('#sup_head_toggle_us').attr("rowspan");
    let gap_head_toggle = $('#gap_head_toggle').attr("rowspan");
    let gap_head_toggle_us = $('#gap_head_toggle_us').attr("rowspan");
    let all_head_toggle = $('#all_head_toggle').attr("rowspan");
    let all_head_toggle_us = $('#all_head_toggle_us').attr("rowspan");
    let all_actual_total = $('#all_actual_total').attr("rowspan");
    let all_actual_total_us = $('#all_actual_total_us').attr("rowspan");
    if (ind_data == true && us_data == true) {
        //Utilization module
        $('#ind_data').attr("disabled", false);
        $('#ind_data').css('cursor', 'pointer');
        $('#us_data').attr("disabled", false);
        $('#us_data').css('cursor', 'pointer');
        if (utiliz_toggle == "2" && utiliz_header == true) {
            $("#utiliz_toggle").attr("rowspan", 4);
            $("#utiliz_toggle_us").attr("rowspan", 4);
            $("#utiliz_toggle").show();
            $("#utiliz_toggle_us").hide();
            $(".ind_main_data").show();
            $(".ind_main_option").hide();
            $(".us_main_data").show();
            $(".us_main_option").hide();
        } else if (utiliz_toggle == "4" && utiliz_header == true) {
            $("#utiliz_toggle").attr("rowspan", 8);
            $("#utiliz_toggle_us").attr("rowspan", 8);
            $("#utiliz_toggle").show();
            $("#utiliz_toggle_us").hide();
            $(".ind_main_data").show();
            $(".ind_main_option").show();
            $(".us_main_data").show();
            $(".us_main_option").show();
        } else if (utiliz_toggle == "8" && utiliz_header == true) {
            $("#utiliz_toggle").attr("rowspan", 8);
            $("#utiliz_toggle_us").attr("rowspan", 8);
            $("#utiliz_toggle").show();
            $("#utiliz_toggle_us").hide();
            $(".ind_main_data").show();
            $(".ind_main_option").show();
            $(".us_main_data").show();
            $(".us_main_option").show();
        }

        //Available  module
        if (avial_head_toggle == "1" && avial_header == true) {
            $("#avial_head_toggle").attr("rowspan", 2);
            $("#avial_head_toggle_us").attr("rowspan", 2);
            $("#avial_head_toggle").show();
            $("#avial_head_toggle_us").hide();
            $(".ind_main_data_1").show();
            $(".ind_main_option_1").hide();
            $(".us_main_data_1").show();
            $(".us_main_option_1").hide();
        } else if (avial_head_toggle == "4" && avial_header == true) {
            $("#avial_head_toggle").attr("rowspan", 8);
            $("#avial_head_toggle_us").attr("rowspan", 8);
            $("#avial_head_toggle").show();
            $("#avial_head_toggle_us").hide();
            $(".ind_main_data_1").show();
            $(".ind_main_option_1").show();
            $(".us_main_data_1").show();
            $(".us_main_option_1").show();
        }

        //Demand module
        if (demand_head_toggle == "1" && demand_header == true) {
            $("#demand_head_toggle").attr("rowspan", 2);
            $("#demand_head_toggle_us").attr("rowspan", 2);
            $("#demand_head_toggle").show();
            $("#demand_head_toggle_us").hide();
            $(".ind_main_data_2").show();
            $(".ind_main_option_2").hide();
            $(".us_main_data_2").show();
            $(".us_main_option_2").hide();
        } else if (demand_head_toggle == "3" && demand_header == true) {
            $("#demand_head_toggle").attr("rowspan", 6);
            $("#demand_head_toggle_us").attr("rowspan", 6);
            $("#demand_head_toggle").show();
            $("#demand_head_toggle_us").hide();
            $(".ind_main_data_2").show();
            $(".ind_main_option_2").show();
            $(".us_main_data_2").show();
            $(".us_main_option_2").show();
        }

        //supply module
        if (sup_head_toggle == "1" && supply_header == true) {
            $("#sup_head_toggle").attr("rowspan", 2);
            $("#sup_head_toggle_us").attr("rowspan", 2);
            $("#sup_head_toggle").show();
            $("#sup_head_toggle_us").hide();
            $(".ind_main_data_3").show();
            $(".ind_main_option_3").hide();
            $(".us_main_data_3").show();
            $(".us_main_option_3").hide();
        } else if (sup_head_toggle == "6" && supply_header == true) {
            $("#sup_head_toggle").attr("rowspan", 12);
            $("#sup_head_toggle_us").attr("rowspan", 12);
            $("#sup_head_toggle").show();
            $("#sup_head_toggle_us").hide();
            $(".ind_main_data_3").show();
            $(".ind_main_option_3").show();
            $(".us_main_data_3").show();
            $(".us_main_option_3").show();
        }

        //gap module
        if (gap_head_toggle == "1" && gap_header == true) {
            $("#gap_head_toggle").attr("rowspan", 2);
            $("#gap_head_toggle_us").attr("rowspan", 2);
            $("#gap_head_toggle").show();
            $("#gap_head_toggle_us").hide();
            $(".ind_main_data_4").show();
            $(".ind_main_option_4").hide();
            $(".us_main_data_4").show();
            $(".us_main_option_4").hide();
        } else if (gap_head_toggle == "8" && gap_header == true) {
            $("#gap_head_toggle").attr("rowspan", 16);
            $("#gap_head_toggle_us").attr("rowspan", 16);
            $("#gap_head_toggle").show();
            $("#gap_head_toggle_us").hide();
            $(".ind_main_data_4").show();
            $(".ind_main_option_4").show();
            $(".us_main_data_4").show();
            $(".us_main_option_4").show();
        }

        //all head module
        if (all_head_toggle == "6" && all_header == true) {
            $("#all_head_toggle").attr("rowspan", 10);
            $("#all_head_toggle_us").attr("rowspan", 10);
            $("#all_head_toggle").show();
            $("#all_head_toggle_us").hide();
            $(".ind_main_data_5").show();
            $(".ind_main_option_5").hide();
            $(".us_main_data_5").show();
            $(".us_main_option_5").hide();
        } else if (all_head_toggle == "16" && all_header == true) {
            $("#all_head_toggle").attr("rowspan", 30);
            $("#all_head_toggle_us").attr("rowspan", 30);
            $("#all_head_toggle").show();
            $("#all_head_toggle_us").hide();
            $(".ind_main_data_5").show();
            $(".ind_main_option_5").show();
            $(".us_main_data_5").show();
            $(".us_main_option_5").show();
        }

        //actual module
        if (all_actual_total == "1") {
            $("#all_actual_total").attr("rowspan", 2);
            $("#all_actual_total_us").attr("rowspan", 2);
            $("#all_actual_total").show();
            $("#all_actual_total_us").hide();
            $(".ind_main_data_6").show();
            $(".us_main_data_6").show();
        }
    }
    else if (ind_data == true && us_data == false) {
        $('#ind_data').attr("disabled", true);
        $('#ind_data').css('cursor', 'no-drop');
        //Utilization module
        if (utiliz_toggle == "4" && utiliz_header == true) {
            $("#utiliz_toggle").attr("rowspan", 2);
            $("#utiliz_toggle_us").attr("rowspan", 2);
            $("#utiliz_toggle").show();
            $("#utiliz_toggle_us").hide();
            $(".ind_main_data").show();
            $(".ind_main_option").hide();
            $(".us_main_data").hide();
            $(".us_main_option").hide();
        } else if (utiliz_toggle == "8" && utiliz_header == true) {
            $("#utiliz_toggle").attr("rowspan", 4);
            $("#utiliz_toggle_us").attr("rowspan", 4);
            $("#utiliz_toggle").show();
            $("#utiliz_toggle_us").hide();
            $(".ind_main_data").show();
            $(".ind_main_option").show();
            $(".us_main_data").hide();
            $(".us_main_option").hide();
        }

        //Available  module
        if (avial_head_toggle == "2" && avial_header == true) {
            $("#avial_head_toggle").attr("rowspan", 1);
            $("#avial_head_toggle_us").attr("rowspan", 1);
            $("#avial_head_toggle").show();
            $("#avial_head_toggle_us").hide();
            $(".ind_main_data_1").show();
            $(".ind_main_option_1").hide();
            $(".us_main_data_1").hide();
            $(".us_main_option_1").hide();
        } else if (avial_head_toggle == "8" && avial_header == true) {
            $("#avial_head_toggle").attr("rowspan", 4);
            $("#avial_head_toggle_us").attr("rowspan", 4);
            $("#avial_head_toggle").show();
            $("#avial_head_toggle_us").hide();
            $(".ind_main_data_1").show();
            $(".ind_main_option_1").show();
            $(".us_main_data_1").hide();
            $(".us_main_option_1").hide();
        }

        //Demand module
        if (demand_head_toggle == "2" && demand_header == true) {
            $("#demand_head_toggle").attr("rowspan", 1);
            $("#demand_head_toggle_us").attr("rowspan", 1);
            $("#demand_head_toggle_us").hide();
            $(".ind_main_data_2").show();
            $(".ind_main_option_2").hide();
            $(".us_main_data_2").hide();
            $(".us_main_option_2").hide();
        } else if (demand_head_toggle == "6" && demand_header == true) {
            $("#demand_head_toggle").attr("rowspan", 3);
            $("#demand_head_toggle_us").attr("rowspan", 3);
            $("#demand_head_toggle_us").hide();
            $(".ind_main_data_2").show();
            $(".ind_main_option_2").show();
            $(".us_main_data_2").hide();
            $(".us_main_option_2").hide();
        }

        //supply module
        if (sup_head_toggle == "2" && supply_header == true) {
            $("#sup_head_toggle").attr("rowspan", 1);
            $("#sup_head_toggle_us").attr("rowspan", 1);
            $("#sup_head_toggle_us").hide();
            $(".ind_main_data_3").show();
            $(".ind_main_option_3").hide();
            $(".us_main_data_3").hide();
            $(".us_main_option_3").hide();
        } else if (sup_head_toggle == "12" && supply_header == true) {
            $("#sup_head_toggle").attr("rowspan", 6);
            $("#sup_head_toggle_us").attr("rowspan", 6);
            $("#sup_head_toggle_us").hide();
            $(".ind_main_data_3").show();
            $(".ind_main_option_3").show();
            $(".us_main_data_3").hide();
            $(".us_main_option_3").hide();
        }

        //gap module
        if (gap_head_toggle == "2" && gap_header == true) {
            $("#gap_head_toggle").attr("rowspan", 1);
            $("#gap_head_toggle_us").attr("rowspan", 1);
            $("#gap_head_toggle_us").hide();
            $(".ind_main_data_4").show();
            $(".ind_main_option_4").hide();
            $(".us_main_data_4").hide();
            $(".us_main_option_4").hide();
        } else if (gap_head_toggle == "16" && gap_header == true) {
            $("#gap_head_toggle").attr("rowspan", 8);
            $("#gap_head_toggle_us").attr("rowspan", 8);
            $("#gap_head_toggle_us").hide();
            $(".ind_main_data_4").show();
            $(".ind_main_option_4").show();
            $(".us_main_data_4").hide();
            $(".us_main_option_4").hide();
        }

        //all head module
        if (all_head_toggle == "10" && all_header == true) {
            $("#all_head_toggle").attr("rowspan", 6);
            $("#all_head_toggle_us").attr("rowspan", 4);
            $("#all_head_toggle_us").hide();
            $(".ind_main_data_5").show();
            $(".ind_main_option_5").hide();
            $(".us_main_data_5").hide();
            $(".us_main_option_5").hide();
        } else if (all_head_toggle == "30" && all_header == true) {
            $("#all_head_toggle").attr("rowspan", 15);
            $("#all_head_toggle_us").attr("rowspan", 15);
            $("#all_head_toggle_us").hide();
            $(".ind_main_data_5").show();
            $(".ind_main_option_5").show();
            $(".us_main_data_5").hide();
            $(".us_main_option_5").hide();
        }

        //actual module
        if (all_actual_total == "2") {
            $("#all_actual_total").attr("rowspan", 1);
            $("#all_actual_total_us").attr("rowspan", 1);
            $("#all_actual_total_us").hide();
            $(".ind_main_data_6").show();
            $(".us_main_data_6").hide();
        }

    } else if (ind_data == false && us_data == true) {
        $('#us_data').attr("disabled", true);
        $('#us_data').css('cursor', 'no-drop');
        //Utilization module
        if (utiliz_toggle_us == "4" && utiliz_header == true) {
            $("#utiliz_toggle_us").attr("rowspan", 2);
            $("#utiliz_toggle").attr("rowspan", 2);
            $("#utiliz_toggle").hide();
            $("#utiliz_toggle_us").show();
            $(".ind_main_data").hide();
            $(".ind_main_option").hide();
            $(".us_main_data").show();
            $(".us_main_option").hide();
        } else if ((utiliz_toggle_us == "2") && utiliz_header == true) {
            $("#utiliz_toggle_us").attr("rowspan", 2);
            $("#utiliz_toggle").attr("rowspan", 2);
            $("#utiliz_toggle").hide();
            $("#utiliz_toggle_us").show();
            $(".ind_main_data").hide();
            $(".ind_main_option").hide();
            $(".us_main_data").show();
            $(".us_main_option").hide();
        } else if ((utiliz_toggle_us == "8") && utiliz_header == true) {
            $("#utiliz_toggle_us").attr("rowspan", 4);
            $("#utiliz_toggle").attr("rowspan", 4);
            $("#utiliz_toggle").hide();
            $("#utiliz_toggle_us").show();
            $(".ind_main_data").hide();
            $(".ind_main_option").hide();
            $(".us_main_data").show();
            $(".us_main_option").show();
        }

        //Available  module
        if (avial_head_toggle_us == "2" && avial_header == true) {
            $("#avial_head_toggle").attr("rowspan", 1);
            $("#avial_head_toggle_us").attr("rowspan", 1);
            $("#avial_head_toggle").hide();
            $("#avial_head_toggle_us").show();
            $(".ind_main_data_1").hide();
            $(".ind_main_option_1").hide();
            $(".us_main_data_1").show();
            $(".us_main_option_1").hide();
        } else if (avial_head_toggle_us == "8" && avial_header == true) {
            $("#avial_head_toggle").attr("rowspan", 4);
            $("#avial_head_toggle_us").attr("rowspan", 4);
            $("#avial_head_toggle").hide();
            $("#avial_head_toggle_us").show();
            $(".ind_main_data_1").hide();
            $(".ind_main_option_1").hide();
            $(".us_main_data_1").show();
            $(".us_main_option_1").show();
        }

        //Demand module
        if (demand_head_toggle_us == "2" && demand_header == true) {
            $("#demand_head_toggle").attr("rowspan", 1);
            $("#demand_head_toggle_us").attr("rowspan", 1);
            $("#demand_head_toggle").hide();
            $("#demand_head_toggle_us").show();
            $(".ind_main_data_2").hide();
            $(".ind_main_option_2").hide();
            $(".us_main_data_2").show();
            $(".us_main_option_2").hide();
        } else if (demand_head_toggle_us == "6" && demand_header == true) {
            $("#demand_head_toggle").attr("rowspan", 3);
            $("#demand_head_toggle_us").attr("rowspan", 3);
            $("#demand_head_toggle").hide();
            $("#demand_head_toggle_us").show();
            $(".ind_main_data_2").hide();
            $(".ind_main_option_2").hide();
            $(".us_main_data_2").show();
            $(".us_main_option_2").show();
        }

        //supply module
        if (sup_head_toggle_us == "2" && supply_header == true) {
            $("#sup_head_toggle").attr("rowspan", 1);
            $("#sup_head_toggle_us").attr("rowspan", 1);
            $("#sup_head_toggle").hide();
            $("#sup_head_toggle_us").show();
            $(".ind_main_data_3").hide();
            $(".ind_main_option_3").hide();
            $(".us_main_data_3").show();
            $(".us_main_option_3").hide();
        } else if (sup_head_toggle_us == "12" && supply_header == true) {
            $("#sup_head_toggle").attr("rowspan", 6);
            $("#sup_head_toggle_us").attr("rowspan", 6);
            $("#sup_head_toggle").hide();
            $("#sup_head_toggle_us").show();
            $(".ind_main_data_3").hide();
            $(".ind_main_option_3").hide();
            $(".us_main_data_3").show();
            $(".us_main_option_3").show();
        }

        //gap module
        if (gap_head_toggle_us == "2" && gap_header == true) {
            $("#gap_head_toggle").attr("rowspan", 1);
            $("#gap_head_toggle_us").attr("rowspan", 1);
            $("#gap_head_toggle").hide();
            $("#gap_head_toggle_us").show();
            $(".ind_main_data_4").hide();
            $(".ind_main_option_4").hide();
            $(".us_main_data_4").show();
            $(".us_main_option_4").hide();
        } else if (gap_head_toggle_us == "16" && gap_header == true) {
            $("#gap_head_toggle").attr("rowspan", 8);
            $("#gap_head_toggle_us").attr("rowspan", 8);
            $("#gap_head_toggle").hide();
            $("#gap_head_toggle_us").show();
            $(".ind_main_data_4").hide();
            $(".ind_main_option_4").hide();
            $(".us_main_data_4").show();
            $(".us_main_option_4").show();
        }

        //all head module
        if (all_head_toggle_us == "11" && all_header == true) {
            $("#all_head_toggle").attr("rowspan", 6);
            $("#all_head_toggle_us").attr("rowspan", 4);
            $("#all_head_toggle").hide();
            $("#all_head_toggle_us").show();
            $(".ind_main_data_5").hide();
            $(".ind_main_option_5").hide();
            $(".us_main_data_5").show();
            $(".us_main_option_5").hide();
        } else if (all_head_toggle_us == "30" && all_header == true) {
            $("#all_head_toggle").attr("rowspan", 15);
            $("#all_head_toggle_us").attr("rowspan", 15);
            $("#all_head_toggle").hide();
            $("#all_head_toggle_us").show();
            $(".ind_main_data_5").hide();
            $(".ind_main_option_5").hide();
            $(".us_main_data_5").show();
            $(".us_main_option_5").show();
        }

        //actual module
        if (all_actual_total == "2") {
            $("#all_actual_total").attr("rowspan", 1);
            $("#all_actual_total_us").attr("rowspan", 1);
            $("#all_actual_total").hide();
            $("#all_actual_total_us").show();
            $(".ind_main_data_6").hide();
            $(".us_main_data_6").show();
        }
    }


}

function getFilterMonth() {
    var theMonths = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    var now = new Date();

    for (var i = 0; i < 12; i++) {
        var future = new Date(now.getFullYear(), now.getMonth() + i, 0);
        var month = theMonths[future.getMonth()];
        var YY = future.getFullYear().toString().substr(-2);
    }
}