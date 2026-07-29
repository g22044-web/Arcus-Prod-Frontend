
let overallData = [];
let currentdata = [];
let futuredata = [];


function getOverallSummaryJson() {
    $.ajax({

        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: ({
            query_type: "current_future_bench_dashboard",
            "environment": apiValue.environment
        }),
        success: function (dataJson) {

            
            overallData = dataJson;
            futuredata = overallData.FUTURE_BENCH_DATA;
            appendHeaderFut();
            getFutureBench(futuredata);
            currentdata = overallData.CURRENT_BENCH_DATA;
            appendHeaderCur();
            getCurrentBench(currentdata);
            var selectedVal = "";
        var selected = $("input[type='radio'][name='res_acc']:checked");
        if (selected.length > 0) {
            selectedVal = selected.val();
        }

        if (selectedVal == "Current") {
            $('#emp_table_wrapper').show();
            $("#emp_table_future_wrapper").hide();
        } else if (selectedVal == "Future") {
            $("#emp_table_future_wrapper").show();
            $('#emp_table_wrapper').hide()
        }

            
            // }
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
}
function getBenCurrFut() {


    if (overallData != 0) {
        var selectedVal = "";
        var selected = $("input[type='radio'][name='res_acc']:checked");
        if (selected.length > 0) {
            selectedVal = selected.val();
        }

        if (selectedVal == "Current") {
            $('#emp_table_wrapper').show();
            $("#emp_table_future_wrapper").hide();
        } else if (selectedVal == "Future") {
            $("#emp_table_future_wrapper").show();
            $('#emp_table_wrapper').hide()
        }
    } else {
        getOverallSummaryJson();
    }



}
function appendHeaderCur() {
    // $('#report_overall_summary1').empty();
    // $('#assign_header').empty();
    // $('#assign_header2').empty();
    // $("#allocation_sow").empty();

    let assign_header = `<tr>
                            <td rowspan="2" class="sow_resrc_style">Employee Name</td>
                            <td rowspan="2" class="sow_resrc_style">Designation</td>
                            <td rowspan="2" class="sow_resrc_style">Location</td>
                            <td rowspan="2" class="sow_resrc_style">Skills</td>
                            <td colspan="4" class="sow_resrc_style">Previous SOW</td>
                            <td colspan="2" class="sow_resrc_style">Bench Detail</td>
                            <td colspan="4" class="sow_resrc_style">Future Proposed SOW</td>
                        </tr>
                        <tr>
                            <td class="sow_resrc_style">Account Name</td>
                            <td class="sow_resrc_style">SOW Name</td>
                            <td class="sow_resrc_style">Previous Start Date</td>
                            <td class="sow_resrc_style">Previous End Name</td>
                            <td class="sow_resrc_style">Available From</td>
                            <td class="sow_resrc_style">Available To</td>
                            <td class="sow_resrc_style">Accont Name</td>
                            <td class="sow_resrc_style">SOW Name</td>
                            <td class="sow_resrc_style">Start Date</td>
                            <td class="sow_resrc_style">End Date</td>
                        </tr>`
    $("#allocation_sow").append(assign_header);
   
}
function appendHeaderFut() {
    

    let assign_header = `<tr>
                            <td rowspan="2" class="sow_resrc_style">Employee Name</td>
                            <td rowspan="2" class="sow_resrc_style">Designation</td>
                            <td rowspan="2" class="sow_resrc_style">Location</td>
                            <td rowspan="2" class="sow_resrc_style">Skills</td>
                            <td colspan="4" class="sow_resrc_style">Current SOW</td>
                            <td colspan="2" class="sow_resrc_style">Bench Detail</td>
                        </tr>
                        <tr>
                            <td class="sow_resrc_style">Account Name</td>
                            <td class="sow_resrc_style">SOW Name</td>
                            <td class="sow_resrc_style">Start Date</td>
                            <td class="sow_resrc_style">End Date</td>
                            <td class="sow_resrc_style">Available From</td>
                            <td class="sow_resrc_style">Available To</td>
                        </tr>`
    $("#allocation_sow_future").append(assign_header);

}
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
function getFutureBench(benchData) {
   

    $.each(benchData, function (i) {

        let emp_skills = benchData[i].SKILL_DATE;
        let emp_skill_data = "";

        $.each(emp_skills, function (value, skills) {
            if (skills.SKILL == "NO_SKILL") {

                emp_skill_data += "";
            } else {
                emp_skill_data += `<button class="skill_data">${skills.SKILL}</button>`
            }

        });
        row = $('<tr><td class="us_shortage">' + benchData[i].EMPLOYEE_NAME +
            '</td><td class="total_shortage">' + benchData[i].JOB_ROLE +
            '</td><td class="sow_id">' + benchData[i].LOCATION +
            '</td><td class="more">' + emp_skill_data +
            '</td><td class="sow_status">' + benchData[i].CURRENT_CUSTOMER_NAME +
            '</td><td class="us_resource_demand">' + benchData[i].CURRENT_SOW_NAME +
            '</td><td class="legal_start_date">' + (benchData[i].CURRENT_START_DATE == "" ? "-" : convert(benchData[i].CURRENT_START_DATE)) +
            '</td><td class="legal_start_date">' + (benchData[i].CURRENT_END_DATE == "" ? "-" : convert(benchData[i].CURRENT_END_DATE)) +
            '</td><td class="legal_end_date">' + (benchData[i].NEXT_START_DATE == "" ? "-" : convert(benchData[i].NEXT_START_DATE)) +
            '</td><td class="legal_start_date">' + (benchData[i].NEXT_END_DATE == "" ? "-" : convert(benchData[i].NEXT_END_DATE)) +

            '</td></tr>');
        $('#report_overall_summary_body1_future').append(row);
    });
    $('#emp_table_future').dataTable({
        "pageLength": 50
    });
}
function getCurrentBench(benchData) {
  

    $.each(benchData, function (i) {
        let emp_skills = benchData[i].SKILL_DATE;
        let emp_skill_data = "";

        $.each(emp_skills, function (value, skills) {
            if (skills.SKILL == "NO_SKILL") {

                emp_skill_data += "";
            } else {
                emp_skill_data += `<button class="skill_data">${skills.SKILL}</button>`
            }

        });
        row = $('<tr><td class="us_shortage">' + benchData[i].EMPLOYEE_NAME +
            '</td><td class="total_shortage">' + benchData[i].JOB_ROLE +
            '</td><td class="sow_id">' + benchData[i].LOCATION +
            '</td><td class="more">' + emp_skill_data +
            '</td><td class="sow_id">' + benchData[i].PREV_CUSTOMER_NAME +
            '</td><td class="sow_id">' + benchData[i].PREV_SOW_NAME +
            '</td><td class="legal_start_date">' + convert(benchData[i].PREV_START_DATE) +
            '</td><td class="legal_start_date">' + convert(benchData[i].PREV_END_DATE) +
            '</td><td class="sow_status">' + convert(benchData[i].CURRENT_START_DATE) +
            '</td><td class="us_resource_demand">' + convert(benchData[i].CURRENT_END_DATE) +
            '</td><td class="us_resource_demand">' + benchData[i].NEXT_CUSTOMER_NAME +
            '</td><td class="us_resource_demand">' + benchData[i].NEXT_SOW_NAME +
            '</td><td class="legal_end_date">' + convert(benchData[i].NEXT_START_DATE) +
            '</td><td class="legal_start_date">' + convert(benchData[i].NEXT_END_DATE) +

            '</td></tr>');
        $('#report_overall_summary_body1').append(row);
    });
    $('#emp_table').dataTable({
        "pageLength": 50
    });
}