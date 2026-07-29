let findResData = [], business_rule = [], getSowId = "", resource_exist_table = [];
function getFindResourceData() {
  findResData = sessionStorage.getItem("sow-all-res-data");
  findResData = $.parseJSON(findResData);
  getSowId = findResData.SOW_ID;
  
  $("#find_account_name").html(findResData.ACCOUNT_NAME);
  $("#find_sow_name").html(findResData.SOW_NAME);
  $("#sowNameID").html(findResData.SOW_ID);
  $("#find_start_date").html(convert(findResData.ACTUAL_START_DATE));
  $("#find_end_date").html(convert(findResData.ACTUAL_END_DATE));
  let totalTeamSize = findResData.US_RESOURCE_DEMAND + findResData.INDIA_RESOURCE_DEMAND
  $("#uscan_size").val(findResData.US_RESOURCE_DEMAND);
  $("#ind_size").val(findResData.INDIA_RESOURCE_DEMAND);
  $("#team_size_val").val(totalTeamSize);
  resource_exist_table = findResData.RESOURCE_DATA;
  if (resource_exist_table.length > 0) {
    $(".no_existing_resources").hide();
    $(".existing_resource").show();
    $.each(resource_exist_table, function (i, resExitTable) {
      let skills = resExitTable.SKILLS_LEVEL.split(',');
      let skillHtml = "", skillPersonaHtml = "";
      $.each(skills, function (j, skillData) {
        skillHtml += `<button class="skill_data">${skillData}</button>`
      })
      if (skillHtml.endsWith(",")) {
        skillHtml = skillHtml.slice(0, -1);
      }
      
      resourceExistHtml = `<tr>
                            <td>${resExitTable.EMPLOYEE_NAME}</td>
                            <td>${resExitTable.JOB_ROLE}</td>
                            <td>${resExitTable.COUNTRY}</td>
                            <td>${convert(resExitTable.ALLOCATION_START_DATE)}</td>
                            <td>${convert(resExitTable.ALLOCATION_END_DATE)}</td>
                            <td>${resExitTable.BILLING_STATUS}</td>
                            <td class="more">${skillHtml == "" ? "-" : skillHtml}</td>
                          </tr>`
      $("#resoure_exist_table").append(resourceExistHtml)
    })
  } else {
    $(".no_existing_resources").show();
  }

let teamDetails = [];
teamDetails = JSON.parse(sessionStorage.getItem("CURRENT_FUTURE_BENCH"));
findResData = JSON.parse(sessionStorage.getItem("sow-all-res-data"));
let actualStartSow = convert(findResData.ACTUAL_START_DATE);
let actualEndSow = convert(findResData.ACTUAL_END_DATE);
let selectedSowTeamDetails = [];



  var selectedValLoc = "";
  var selected = $("input[type='radio'][name='res_acc']:checked");
  if (selected.length > 0) {
      selectedValLoc = selected.val();
  }
       if (selectedValLoc == "IND") {
          let indiaDataBench = teamDetails.filter((loc) => loc.LOCATION == "India");
          selectedSowTeamDetails = indiaDataBench;
      }
      else if (selectedValLoc == "USCAN") {
          let usCanDataBench = teamDetails.filter((loc) => (loc.LOCATION == "US" || loc.LOCATION == "Canada"));
          selectedSowTeamDetails = usCanDataBench;
      }
      else {
          selectedSowTeamDetails = teamDetails;
      }

  $("#all_sow_allocation").empty();

    let assign_header = `<tr class="all_sow_allocation">
                            <td class="sow_resrc_style"></td>
                            <td class="sow_resrc_style">Employee Name</td>
                            <td class="sow_resrc_style">Designation</td>
                            <td class="sow_resrc_style">Location</td>
                            <td class="sow_resrc_style">Skills</td>
                            <td class="sow_resrc_style">Available From</td>
                            <td class="sow_resrc_style">Available To</td>
                            <td class="sow_resrc_style">Allocation Start Date</td>
                            <td class="sow_resrc_style">Allocation End Date</td>
                            <td class="sow_resrc_style">Billing Type</td>
                            <td class="sow_resrc_style">Comments</td>
                        </tr>`
                       
    $("#all_sow_allocation").append(assign_header);
   $('#emp_table_sow tbody').empty();
    $('#emp_table_sow').dataTable().fnClearTable();
    $('#emp_table_sow').dataTable().fnDestroy();
   $.each(selectedSowTeamDetails, function (i) {
        let emp_skills = selectedSowTeamDetails[i].SKILL_DATE;
        let emp_skill_data = "";
        $.each(emp_skills, function (value, skills) {
            if (skills.SKILL == "NO_SKILL") {
                emp_skill_data += "-";
            } else {
                emp_skill_data += `<button class="skill_data">${skills.SKILL}</button>`
            }
        });
        row = $(`<tr style="font-size: 11px;">
             <td><input type="checkbox" class="checkBoxClass" id="${selectedSowTeamDetails[i].EMPLOYEE_ID}"></td> 
             <td class="us_shortage">${selectedSowTeamDetails[i].EMPLOYEE_NAME} </td>
             <td class="total_shortage"> ${selectedSowTeamDetails[i].JOB_ROLE}</td>
             <td class="sow_id">${selectedSowTeamDetails[i].LOCATION}</td>
             <td class="more">${emp_skill_data} </td>
             <td class="legal_start_date">${(selectedSowTeamDetails[i].CURRENT_START_DATE == "" ? "-" : convert(selectedSowTeamDetails[i].CURRENT_START_DATE)) }</td>
             <td class="legal_start_date">${(selectedSowTeamDetails[i].CURRENT_END_DATE == "" ? "-" : convert(selectedSowTeamDetails[i].CURRENT_END_DATE))} </td>
             <td class="legal_start_date"> <input type="date" id="startDate" class="form-control proj_alloc_class custom_padding startDate" placeholder="Start Date"/></td>
             <td class="legal_start_date"><input type="date" id="endDate" class="form-control proj_alloc_class custom_padding endDate" placeholder="End Date" /> </td>
             <td class="legal_start_date"> <select class="form-control account_name col-sm-6" id="billing_status_option" style="width:142%">
             <option value="volvo">Billed</option>
             <option value="volvo">Investment</option></select>
             </td>
             <td> <textarea cols="25" rows="2" maxlength="50"  id="message" style="margin-left:10px"></textarea>
             </td>
             </tr>`);
             
             
        $('#sow_allocation_data_body').append(row);
        $('#emp_table_sow').dataTable({
            "pageLength": 50,
            "retrieve": true,
            "columnDefs": [ {
                "targets": 0,
                "orderable": false
                } ]
        }); 
    });
}

function convert(str) {
  if (str == null) {
    return "";
  } else if (str == "0000-00-00") {
    return "";
  }
  else {
    str= str.replace(" 00:00:00","")
    let tempStr = str + "T00:00:00"
    var date = new Date(tempStr),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
  }
}
