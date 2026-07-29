var sow_id = "";
var options = "";
var options_level = `<option value="">Select Any Level</option>
                    <option value="R1">R1</option>
                    <option value="R2">R2</option>
                    <option value="R3">R3</option>`;
let location_name = `<select>
            <option value="India">India</option>
            <option value="US">US</option>
            <option value="Canada">Canada</option>
          </select>`;
function getSowTableDetails() {
  local_sow_data = localStorage.getItem("sow_profile_id_data");
  sow_id = localStorage.getItem("sow_id_data");
  var sow_id_data = [];
  getSkillOptions();
  var options = skillOptions;
  sow_id_data = $.parseJSON('[' + local_sow_data + ']');
  sow_id_data = sow_id_data[0];
  let max_skill_len = sow_id_data.MAX_SKILL_COUNT;
  let skill_header_col = "";
  for (i = 0; i < max_skill_len; i++) {
    skill_header_col += `<th scope="col" class="col-sm-1">Skill ${i + 1}</th><th scope="col" class="col-sm-1">Level</th>`;
  }
  $('#sow_profile_header').append(skill_header_col);
  let skill_data_details = sow_id_data.SKILL_DATA;

  

  $.each(skill_data_details, function (i, skill_data) {
    let skill_level_html = "";
    for (j = 0; j < max_skill_len; j++) {
      skill_level_html += `<td>
                          <select class="form-control custom_width" id="skill_${i+1}_${j+1}">
                            ${options}
                          </select> 
                        </td>
                        <td>
                          <select class="form-control custom_width" id="level_${i+1}_${j+1}">
                            ${options_level}
                          </select> 
                        </td>`
      
    }
    let row = $(`<tr id="resource_${i + 1}">
                        <td>${skill_data.SOW_ID}</td>
                        <td><input type="text" id="resource_num_${i + 1}" name="lname" value="${skill_data.NO_OF_RESOURCE}"></td>
                        <td><select id="loc_${i + 1}">
                              <option value="India">India</option>
                              <option value="US">US</option>
                              <option value="Canada">Canada</option>
                            </select>
                        </td>
                        ${skill_level_html}
                      </tr>`);
  
    $('#sow_emp_details').append(row);

    
  });
  $.each(skill_data_details, function (i, skill_data) {
    $("#loc_"+(i+1)).val(skill_data.LOCATION);
    $.each(skill_data.SKILL_DATA, function (j, skill_option) {
     
      $("#skill_" + (i + 1) + "_" + (j+1)).val(skill_option.SKILL.toUpperCase());
      $("#level_" + (i + 1) + "_" + (j+1)).val(skill_option.LEVEL);
    });
  });
  
  $('#sow_emp_details').dataTable();
}

function getSkillOptions() {

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
      query_type: "select",
      "db_name": apiValue.db_name,
      "environment": apiValue.environment,
      "table_name": "SKILL_CONFIG",
      "columns": "",
      "filter": ""
    },
    success: function (data) {
      skillOptions = '<option value="-1">Select Skill</option>'
      $.each(data.Details, function (value, option) {
        skillOptions += '<option value="' + option.SKILL_NAME.toUpperCase() + '">' + option.SKILL_NAME + '</option>';
      });
    },
    error: function (error) {
      console.log('message Error' + JSON.stringify(error));
    }

  });

}

function addColumn() {
  let column_len = $("table > tbody > tr:first > td").length;
  let columnLen = column_len - 3
  let colSkillNum = columnLen / 2 + 1;
  getSkillOptions();
  var options = skillOptions;
  var options_level = `<option value="">Select Level</option>
                    <option value="R1">R1</option>
                    <option value="R2">R2</option>
                    <option value="R3">R3</option>`;
  $("tr:first").append("<th scope='col' class='col-sm-1'>Skill " + colSkillNum + "</th><th scope='col' class='col-sm-1'>Level</th>");
  $("tr:not(:first)").append(`<td>
    <select class="form-control custom_width" id="skill">
      ${options}
    </select> 
  </td>
  <td>
    <select class="form-control custom_width id="level">
      ${options_level}
    </select> 
  </td>`);
}

function addResource(){
  let columnLen = $("table > tbody > tr:first > td").length
  
  if(columnLen == 1){
    $(".odd").remove();
    getSkillOptions();
    options = skillOptions;
    $("tr:first").append("<th scope='col' class='col-sm-1'>Skill 1</th><th scope='col' class='col-sm-1'>Level</th>");
    let row = `<tr id="resource">
    <td>${sow_id}</td>
    <td><input type="text" id="resource_num" name="lname" value="1"></td>
    <td>${location_name}</td>
    <td>
    <select class="form-control custom_width" id="skill">
      ${options}
    </select> 
  </td>
  <td>
    <select class="form-control custom_width id="level">
      ${options_level}
    </select> 
  </td>
  </tr>`

  $('#sow_emp_details').append(row);
  }else{
    var table = $('#sow_emp_details'),
          lastRow = table.find('tbody tr:last'),
          rowClone = lastRow.clone();
  
      table.find('tbody').append(rowClone);
  }
}

function sowUpdateData(){
  var tb = $('#sow_emp_details:eq(0) tbody');
  var size = tb.find("tr").length;
  let sow_update_data = "";
  tb.find("tr").each(function(index, element) {
    let skill_array = "";
    let location = "", sow_id = 0, no_of_res = 0, record = 0, skill = [], level = [];
    var colSize = $(element).find('td').length;
    record = index +1;
    $(element).find('td').each(function(index, element) {
      let colVal = "";
      if(index == 0){
        sow_id = $(element).text();
      }else if(index == 1){
        no_of_res = $(element).find(":input").val();
      }else if(index == 2){
        location = $(element).find(":selected").text();
      }else if(index > 2){
        if (index%2 == 0){
          colVal = $(element).find(":selected").text();
          if(colVal != "Select Level"){
            level.push(colVal);
          }
        }else{
          colVal = $(element).find(":selected").text();
          if(colVal != "Select Skill"){
            skill.push(colVal);
          }
        }
      }
    });
    for(i=0;i<skill.length;i++){
      if(skill[i] != undefined & level[i] != undefined){
        skill_array = skill_array + "{ \"SKILL\" : \"" + skill[i] +
              "\", \"LEVEL\":\"" + level[i] +
              "\"},"
      }
    }
    if (skill_array.endsWith(",")) {
      skill_array = skill_array.slice(0, -1);
    }
    sow_update_data += "{ \"LOCATION\" : \"" + location +
    "\", \"SOW_ID\":\"" + sow_id +
    "\", \"NO_OF_RESOURCE\":\"" + no_of_res +
    "\", \"RECORD\":\"" + record +
    "\", \"SKILL_DATA\":[" + skill_array +
    "]},"
  });
  if (sow_update_data.endsWith(",")) {
    sow_update_data = sow_update_data.slice(0, -1);
  }
  let sowJsonData = {
    "query_type": "edited_skills",
    "db_name": apiValue.db_name,
    "environment": apiValue.environment,
    "mode": "edit",
    "edited_skills": "[" + sow_update_data + "]"
  }
  $.ajax({
    url: apiValue.url,
    // url: "https://rre-api.factspanapps.com:5000/app",
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    data: sowJsonData,
    success: function (json) {
        toastr.options.timeOut = 2000; // 2s
        toastr.success('Updated Successfully');
    },
    error: function (error) {
        console.log('message Error' + JSON.stringify(error));
        toastr.options.timeOut = 2000; // 2s
        toastr.success('Message error' + JSON.stringify(error));
    }
});
}

function removeResource(){
  let columnLen = $("table > tbody > tr:first > td").length
  var tb = $('#sow_emp_details:eq(0) tbody');
  var size = tb.find("tr").length;

  if(size > 1){
    $('#sow_prof_data tr:last-child').remove();
  }else{
    $('#sow_prof_data tr:last-child').remove();
    $('#sow_profile_header').remove();
    toastr.options.timeOut = 2000; // 2s
    toastr.success('Atleast one skill should be there');
    getSkillOptions();
    options = skillOptions;
    $('#sow_head').append(`<tr id="sow_profile_header">
    <th scope="col" class="col-sm-2">SOW ID</th>
    <th scope="col" class="col-sm-2">No. Of Resource</th>
    <th scope="col" class="col-sm-2">Location</th>
    <th scope='col' class='col-sm-1'>Skill 1</th>
    <th scope='col' class='col-sm-1'>Level</th>`);
    let row = `<tr id="resource">
    <td>${sow_id}</td>
    <td><input type="text" id="resource_num" name="lname" value="1"></td>
    <td>${location_name}</td>
    <td>
    <select class="form-control custom_width" id="skill">
      ${options}
    </select> 
  </td>
  <td>
    <select class="form-control custom_width id="level">
      ${options_level}
    </select> 
  </td>
  </tr>`
  $('#sow_emp_details').append(row);
  }
}

function removeColumn(){
  let columnLen = $("table > tbody > tr:first > td").length
  if(columnLen > 6){
    $("#sow_emp_details th:last-child, #sow_emp_details td:last-child").remove();
    $("#sow_emp_details th:last-child, #sow_emp_details td:last-child").remove();
  }else{
    toastr.options.timeOut = 2000; // 2s
    toastr.success('Atleast one skill should be there');
  }
}
