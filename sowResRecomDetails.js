function getEmpNameOptions() {
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
        data: {
            query_type: "resource_available",
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        },
        success: function (data) {
            jsonData = data
            data = jsonData.Available_Resources;
            for (var i = 0;i < data.length;i++) {
                emp_options += '<option value="' + data[i].EMPLOYEE_NAME + '">' + data[i].EMPLOYEE_NAME + '</option>';
            }
            //  $(".emp_names").html(emp_options); 
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
}



function getEmpVal(sel) {
    var sow_id = $(sel).closest('tr').children('td:eq(0)').text();
    var sow_emp_name = sel.value;
    $.ajax({
        //   url: "https://rre-api.factspanapps.com:5000/app",
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: {
            query_type: "emp_skills",
            EMPLOYEE_NAME: sow_emp_name,
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        },
        success: function (data) {
            jsonData = data
            data = jsonData.Employee_skills;
            $(sel).closest('tr').children('td:eq(2)').html(data[0].ROLE);
            $(sel).closest('tr').children('td:eq(3)').html(data[0].LOCATION);
            $(sel).closest('tr').children('td:eq(4)').html(data[0].SKILL1);
            $(sel).closest('tr').children('td:eq(5)').html(data[0].LEVEL1);
            $(sel).closest('tr').children('td:eq(6)').html(data[0].SKILL2);
            $(sel).closest('tr').children('td:eq(7)').html(data[0].LEVEL2);
            $(sel).closest('tr').children('td:eq(8)').html(data[0].SKILL3);
            $(sel).closest('tr').children('td:eq(9)').html(data[0].LEVEL3);
            $(sel).closest('tr').children('td:eq(10)').html(data[0].SKILL4);
            $(sel).closest('tr').children('td:eq(11)').html(data[0].LEVEL4);
            $(sel).closest('tr').children('td:eq(12)').html(data[0].SKILL5);
            $(sel).closest('tr').children('td:eq(13)').html(data[0].LEVEL5);
            $(sel).closest('tr').children('td:eq(14)').html(data[0].SKILL6);
            $(sel).closest('tr').children('td:eq(15)').html(data[0].LEVEL6);
            $(sel).closest('tr').children('td:eq(16)').html(data[0].SKILL7);
            $(sel).closest('tr').children('td:eq(17)').html(data[0].LEVEL7);
            $(sel).closest('tr').children('td:eq(18)').html(data[0].SKILL8);
            $(sel).closest('tr').children('td:eq(19)').html(data[0].LEVEL8);
            $(sel).closest('tr').children('td:eq(20)').html(data[0].SKILL9);
            $(sel).closest('tr').children('td:eq(21)').html(data[0].LEVEL9);
            $(sel).closest('tr').children('td:eq(22)').html(data[0].SKILL10);
            $(sel).closest('tr').children('td:eq(23)').html(data[0].LEVEL10);
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
}


