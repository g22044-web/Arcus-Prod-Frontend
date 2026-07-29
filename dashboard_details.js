function getEmpData() {
    var empData = [];
    let status = "";
    let endDate = "";
    $.ajax({
        // url: "https://rre-api.factspanapps.com:5000/app",
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: ({
            query_type: "all_employees_skills",
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        }),
        success: function (data) {
            // jsonData = data
            empData = data;
            console.log("jsonData  - ", empData);
            for (var i = 0;i < empData.length;i++) {
                // if (empData[i].END_DATE == "0000-00-00") {
                //     endDate = "";
                // } else {
                //     endDate = convert(empData[i].END_DATE);
                // }
                let emp_skills = empData[i].SKILL_DATA;
                let emp_skill_data = "";
                let emp_skill_hide_data = "";
                $.each(emp_skills, function (value, skills) {
                    // mang_name_options_sow += '<option value="' + mangName.REPORTING_MANAGER_ID + '">' + mangName.REPORTING_MANAGER_NAME + '</option>';
                    emp_skill_data += `<button class="skill_data">${skills.SKILL} - ${skills.LEVEL}</button>`
                    emp_skill_hide_data += `${skills.SKILL} ${skills.LEVEL}, `
                });
                var row = $('<tr><td>' + empData[i].EMPLOYEE_ID + '</td><td>' +
                    empData[i].EMPLOYEE_NAME + '</td><td>' +
                    empData[i].DESIGNATION + '</td><td>' +
                    empData[i].LOCATION + '</td><td>' +
                    empData[i].REPORTING_MANAGER + '</td><td>' +
                    empData[i].CUSTOMER_NAME + '</td><td>' +
                    empData[i].SOW_NAME + '</td><td>' +
                    emp_skill_data + '</td><td style="display: none">' +
                    emp_skill_hide_data + '</td></tr>');
                $('#emp_table').append(row);
            }
            console.log("EMP data - ", row);
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
}

function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
}
console.log(convert("Mon, 11 Nov 2013 00:00:00 GMT"))
