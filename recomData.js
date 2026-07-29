function getRecomData() {
    // var recomData = [];
    // $.ajax({
    //     // url: "http://192.168.30.155:5000/recommend",
    //     url : "https://rre-api.factspanapps.com:5000/recommend",
    //     type: "POST",
    //     dataType: "json",
    //     crossDomain: true,
    //     format: "json",
    //     async: false,
    //     success:function(json){
    //         jsonData = json
    //         recomData = jsonData.data.RECOMMENDATION.REC_STRUCTURE;
    //         console.log("jsonData  - ",jsonData.data.RECOMMENDATION.REC_STRUCTURE);
    //         for (var i=0; i<recomData.length; i++) {
    //             var row = $('<tr><td>' + recomData[i].SOW_ID+ '</td><td>' + 
    //             recomData[i].Resource_Count + '</td><td>' + 
    //             recomData[i].Associate + '</td><td>' + 
    //             recomData[i].Analyst + '</td><td>' + 
    //             recomData[i].Senior_Analyst + '</td><td>' + 
    //             recomData[i].Associate_Manager + '</td><td>' + 
    //             recomData[i].Manager_ + '</td><td>' + 
    //             recomData[i].Solution_Architect + '</td><td><button type="button" class="btn view_detail btn-default pull-right hit" onclick="sowResData(this)">View Details</button></td></tr>');
    //             $('#sow_res_recom_table_data').append(row);
    //         }

    //     },
    //     error:function(error){
    //         console.log('message Error' + JSON.stringify(error));
    //     }  
    // });  
    var recomJsonData = [];
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
        // data : {
        //     "query_type":"select",
        //     "db_name": "rre_db",
        //     "table_name":"SOW_RESOURCE_TEAM_VIEW",
        //     "columns":"",
        //     "filter":""
        // },
        data: {
            "query_type": "sow_team",
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        },
        success: function (data) {
            // jsonData = data
            recomJsonData = data.TEAM_STRUCTURE;
            console.log("jsonData  - ", recomJsonData);
            for (var i = 0;i < recomJsonData.length;i++) {
                var row = $('<tr><td>' + recomJsonData[i].SOW_ID + '</td><td>' +
                    recomJsonData[i].SOW_NAME + '</td><td>' +
                    recomJsonData[i].CUSTOMER_NAME + '</td><td>' +
                    recomJsonData[i].TOTAL_RESOURCES + '</td><td>' +
                    recomJsonData[i].Associate_ + '</td><td>' +
                    recomJsonData[i].Analyst_ + '</td><td>' +
                    recomJsonData[i].Sr_Analyst_ + '</td><td>' +
                    recomJsonData[i].AM_ + '</td><td>' +
                    recomJsonData[i].M_ + '</td><td>' +
                    recomJsonData[i].Soln_Arch + '</td><td style="display:none">final_team</td><td style="display:none">form</td><td><button type="button" class="btn view_detail btn-default pull-right hit" onclick="sowResData(this)">View Details</button></td></tr>');
                $('#sow_res_recom_table_data').append(row);
            }
            console.log("EMP data - ", row);
            $('#sow_res_recom_table_data').Tabledit({
                // url: "https://rre-api.factspanapps.com:5000/app",
                url: apiValue.url,
                type: "POST",
                dataType: "json",
                crossDomain: true,
                format: "json",
                async: false,
                mode: 'no-cors',
                // editButton: false,
                deleteButton: false,
                // hideIdentifier: true,
                columns: {
                    identifier: [0, 'SOW_ID'],
                    editable: [[2, 'Associate_'], [3, 'Analyst_'], [4, 'Sr_Analyst_'], [5, 'AM_'], [6, 'M_'], [7, 'Soln_Arch'], [8, 'query_type'], [9, 'team_recommended']],
                    // edited_sow: editable
                },
                // data: {
                //   query_type : "select",
                //   db_name: "DEVELOP_DB",
                //   edited_sow: "["+ editable +"]"
                // },
                onSuccess: function (data, textStatus, jqXHR) {
                    console.log("data.action - " + data.action);
                    console.log('onSuccess(data, textStatus, jqXHR)');
                    console.log("data edit - ", data);
                    console.log("textStatus - " + textStatus);
                    console.log("jqXHR - ", jqXHR);
                }
            });
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
}

function sowResData(obj) {
    var sow_id = $(obj).closest('tr').children('td:eq(0)').text();
    var Resource_count = $(obj).closest('tr').children('td:eq(3)').text();
    console.log("sow_id - " + sow_id);
    console.log("Resource_count - " + Resource_count);
    let associate = $(obj).closest('tr').children('td:eq(4)').text();
    let analyst = $(obj).closest('tr').children('td:eq(5)').text();
    let sranalyst = $(obj).closest('tr').children('td:eq(6)').text();
    let am = $(obj).closest('tr').children('td:eq(7)').text();
    let manager = $(obj).closest('tr').children('td:eq(8)').text();
    let soln_Arch_value = $(obj).closest('tr').children('td:eq(9)').text();
    //console.log("sow_id - "+sow_id);
    //console.log("Resource_count - "+Resource_count);
    var sow_recom_id = [];
    var local_sow_recom_data = [];
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
            //query_type:"view_all",
            query_type: "recommend",
            "environment": apiValue.environment,
            TOTAL_RESOURCES: Resource_count,
            SOW_ID: sow_id,
            Associate: associate,
            Analyst: analyst,
            Sr_Analyst: sranalyst,
            AM: am,
            Soln_Arch: soln_Arch_value,
            M: manager
        },
        success: function (data) {
            jsonData = data
            console.log("jsonData - ", jsonData);
            recomJsonData = data.Recommended_Employees;
            console.log("recomJsonData - ", recomJsonData);
            if (typeof (Storage) !== "undefined") {
                // Store
                localStorage.setItem("sow_recom_profile_id_data", JSON.stringify(recomJsonData));
                localStorage.setItem("sow_recom_id_data", sow_id);
                // Retrieve
                // local_sow_recom_profile_id_data = localStorage.getItem("sow_recom_profile_id_data");
                // local_sow_recom_id_data = localStorage.getItem("sow_recom_id_data");
            } else {
                document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
            }
            // console.log("local_sow_recom_profile_data - ",local_sow_recom_profile_id_data);
            window.location.href = 'sowResRecomDetails.html';
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
}



