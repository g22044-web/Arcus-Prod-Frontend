let all_skills_data = []
const pathname = window.location.pathname;
  // Extract the file name (last segment) from the pathname
const parts = pathname.split('/');
const fileName = parts.pop();
let certificate_data_json = [
    {
        certificate_name : "AWS Certified Solutions Architect - Associate",
        level : 'R2',
        completed_on : 'May-2024'
    },
    {
        certificate_name : "AWS Certified Developer - Associate",
        level : 'R2',
        completed_on : 'May-2024'
    },
    {
        certificate_name : "AWS Certified SysOps Administrator - Associate",
        level : 'R2',
        completed_on : 'May-2024'
    },
    {
        certificate_name : "AWS Certified Cloud Practitioner",
        level : 'R2',
        completed_on : 'May-2024'
    },
    {
        certificate_name : "AWS Certified Solutions Architect - Professional",
        level : 'R2',
        completed_on : 'May-2024'
    },
    {
        certificate_name : "AWS Certified Developer - Professional",
        level : 'R2',
        completed_on : 'May-2024'
    }
]
$(document).ready(function () {
    console.log("Emp Profile")
    assignMetaValue();
    $("meta[name='google-signin-client_id']").attr("content", metaValue);
    // $("#emp_certification").hover(function(){
    //     $('#hoverTable').css({'display':'block'});
    //   },function(){
    //    $('#hoverTable').css({'display':'none'});
    // });
    getLocalSessionData();
    if (sessionName == null) {
        window.location.href = 'index.html';
        return false;
    } else {
        let accessStatus = checkDashboardPageAccessData()
        if (accessStatus) {
            let accessLevel = checkEachPageAccess("Team")
            if (accessLevel.length > 0) {
                let environment = accessLevel[0]
                if (environment == apiValue.environment) {
                    // $("#emp_name").html(empName);
                    // $("#emp_mail").html(sessionName);
                    assignEmpData();
                    
                    $(".loader").css("display", "none");
                    $(".show_page").css("display", "block");
                    let pageLevelAccess = accessLevel[1]
                    console.log("pageLevelAccess - ", pageLevelAccess)
                    let eachLevel = pageLevelAccess.split(',')
                    console.log("eachLevel - ", eachLevel)
                    $.each(eachLevel, function (l, level) {
                        switch (level) {
                            case "view":
                                $(".skill_edit").hide()
                                $(".training_edit").hide()
                                break;
                            case "edit":
                                $(".skill_edit").show()
                                $(".training_edit").show()
                                break;
                        }
                    })
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
    $('#logout').click(function () {
        localStorage.clear();

        window.location.href = 'index.html';
        return false;
    });
    $('#employee_back').click(function () {
        window.location.href = 'team.html';
        return false;
    });
    $('#training-aspiration').click(function () {
        window.location.href = 'team-aspirations.html';
        return false;
    });
    $('#training-completed').click(function () {
        window.location.href = 'team-training.html'
    });
    $("#training-certificate").click(function () {
        window.location.href = 'team-certification.html'
    })
});


function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
}

function getEmpProfileData(obj) {

    var employee_id = $(obj).closest('tr').children('td:eq(0)').text();
    localStorage.setItem("employee_id_data", employee_id);
    window.location.href = 'team-profile.html';
}
let resumeURL = "";
let sowYTDData = [];
let skillData = [];
let personaData = [], team_member_data = [];
function assignEmpData() {
    let empData = [];
    var emp_id = localStorage.getItem("employee_id_data");
    let emp_email_id = localStorage.getItem("employee_email_data");
    all_skills_data = JSON.parse(localStorage.getItem("all-skills-data"))
    const startTime = performance.now();
    $.ajax({
        url: apiValue.url_ip + ":5001/employeeprofile",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            "employee_id": emp_id,
            "email_id":emp_email_id
        }),
        success: function (data) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"TeamProfile","Team","employeeprofile","success",fileName,"TeamProfile","view");
            empData = data[0];
        },
        error: function (error) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"TeamProfile","Team","employeeprofile","error",fileName,"TeamProfile","view");
            console.log('message Error' + JSON.stringify(error));
        }
    });
    console.log("empJsonData", empData);
    localStorage.setItem("selected-team-data", JSON.stringify(empData))
    team_member_data = empData;
    let empName = empData.EMPLOYEE_NAME;
    $("#emp_name").html(empData.EMPLOYEE_NAME);
    $("#emp_mail").html(empData.EMAIL_ID);
    $('#emp_desg').html(empData.JOB_ROLE);
    $('#emp_active').html(empData.EMP_STATUS);
    $('#emp_loc').html(empData.COUNTRY);
    $('#emp_dept').html(empData.DEPARTMENT);
    $('#emp_potential_score').val(empData.POTENTIAL_SCORE);
    $('#emp_reporting_manager').val(empData.MANAGER_NAME);
    $('#emp_next_avail_date').val(empData.NEXT_AVAILABLE_DATE == '0000-00-00' ? '' : convert(empData.NEXT_AVAILABLE_DATE));
    $('#emp_attrition_score').val(empData.ATTRITION_RISK);
    $('#emp_total_exp').html(empData.TOTAL_EXPERIENCE);
    $('#emp_factspan_exp').html(empData.FACT_EXPERIENCE);
    $('#emp_outside_exp').html(empData.OUTSIDE_EXPERIENCE);
    let shortageUSValClassind = "";
    if (empData.IN_NOTICE_PERIOD == "YES") {
        $('#emp_active').html("In Notice Period")
        $("#emp_active").addClass("innotice");

    }
    else {
        $('#emp_active').html("Active");
        $("#emp_active").addClass("activeclass");
    }
    sowYTDData = empData.SOW_DATA;
    localStorage.setItem("emp-data", JSON.stringify(empData));
    // Separate skill names and levels
    let skill_list = empData.SKILLS_LEVEL;
    let skill_names = [];
    let skill_levels = [];
    skill_list.forEach(skill => {
        let [skillName, skillLevel] = skill.split('-');
        skill_levels.push(skillLevel);
        skill_names.push(skillName);
    });
    // Join skill names based on their corresponding levels
    let combined_skills = {};
    for (let i = 0; i < skill_levels.length; i++) {
        let level = skill_levels[i];
        if (!(level in combined_skills)) {
            combined_skills[level] = [];
        }
        combined_skills[level].push(skill_names[i]);
    }
    
    // Combine skills for each level
    for (let level in combined_skills) {
        combined_skills[level] = combined_skills[level].join(', ');
    }
    
    // Format the combined skills for each level
    let formatted_skills = [];
    for (let level in combined_skills) {
        formatted_skills.push(`${combined_skills[level]}:${level}`);
    }
    formatted_skills.sort((a, b) => {
        const rankOrder = { "R1": 1, "R2": 2, "R3": 3 };
        const rankA = a.split(":")[1].trim(); // Extract the rank part
        const rankB = b.split(":")[1].trim(); // Extract the rank part
        
        // Compare the ranks using the rankOrder object
        return rankOrder[rankA] - rankOrder[rankB];
    });
    // let skill_list = empData.SKILLS_LEVEL;
    let skill_table = ``;
    
    formatted_skills.forEach(skill => {
        let [skillName, skillLevel] = skill.split(':');
        let skillNameArray = skillName.split(', ');
       
        console.log(skillLevel,"skillName")


        let skillHtml=""
        for (let i=0 ;i<skillNameArray.length ;i++){
            skillHtml += `<button class="skill_data">${skillNameArray[i]}</button>`
        }
       
        
        skill_table += `<tr class="">
        <td class="td-table-content more-team-profile">${skillHtml}</td>
       
        <td class="td-table-content-r">${skillLevel}</td>
        </tr>`;
    });
    $("#skill_table_body").html(skill_table);
    personaData = empData.SKILLS_PERSONA;
    let persona_names = [];
    let persona_levels = [];
    
    personaData.forEach(persona => {
        let [persona_name, persona_level] = persona.split('-');
        persona_names.push(persona_name);
        persona_levels.push(persona_level);
    });
    
    let combined_persona = {};
    for (let i = 0; i < persona_levels.length; i++) {
        let level = persona_levels[i];
        if (!(level in combined_persona)) {
            combined_persona[level] = [];
        }
        combined_persona[level].push(persona_names[i]);
    }
    
    // Combine skills for each level
    for (let level in combined_persona) {
        combined_persona[level] = combined_persona[level].join(', ');
    }
    
    // Format the combined skills for each level
    let formatted_persona = [];
    for (let level in combined_persona) {
        formatted_persona.push(`${combined_persona[level]}:${level}`);
    }
    
    console.log(formatted_persona,"formatted_persona");

    let persona_table = ``;
    
    formatted_persona.forEach(skill => {
        let [skillName, skillLevel] = skill.split(':');
        let PersonaName = skillName.split(', ');
       
        console.log(PersonaName,skillLevel,"PersonaName")
        console.log(skillLevel,"skillLevel")

        let personaHtml=""
        for (let i=0 ;i<PersonaName.length ;i++){
            personaHtml += `<button class="skill_data">${PersonaName[i]}</button>`
        }
       
        
        persona_table += `<tr class="">
                                <td class="td-table-content more-team-profile">${personaHtml}</td>
                                
                                <td class="td-table-content-r">${skillLevel==="undefined" ?  "-" :skillLevel}</td>
                          </tr>`;
    });
    $("#persona_table_body").html(persona_table); // Set the inner HTML of the table body with the generated table rows
    let ytdData = empData.YTD_DATA;
    let ytdMonthlyData = ytdData.DATA;
    let ytdAvgData = ytdData.AVERAGE;
    $('#ytd_mnth_data').html(ytdAvgData);
    let ytdHeaderHtml = "";
    let ytdBodyHtml = "";
    $.each(ytdMonthlyData, function (i, ytdMonth) {
        ytdHeaderHtml += `<div class="each_month_block">
                              <div class="sub_block">${(ytdMonth.HEADER).replace("-22", "")}</div>
                              <div class="sub_block">${ytdMonth.RESULT}</div>
                          </div>`;
        
        // Add the side bar except for the last item
        if (i < ytdMonthlyData.length - 1) {
            ytdHeaderHtml += `<div class="side_bar"></div>`;
        }
    });    
    $('.ytd_month_data').append(ytdHeaderHtml);
    $('.ytd_month_body').append(ytdBodyHtml);
    resumeURL = empData.RESUME_LINK;
    let trainingAspirationData = empData.TRAINING_DATA;
    let aspirationData = trainingAspirationData.ASPIRATIONS;
    let certification = trainingAspirationData.CERTIFICATION_DATA;
    let completeTraining = trainingAspirationData.COMPLETED_TRAINING;
    let skillsToTeach = trainingAspirationData.SKILLS_THEY_CAN_TEACH;
    let skillstoLearn = trainingAspirationData.NEXT_SKILLS_TO_LEARN;
    let aspirationHtml = "", certificationHtml = "", completeTrainingHtml = "", skillsToTeachHtml = "", skillstoLearnHtml = "";
    $.each(aspirationData, function (i, aspiration) {
        aspirationHtml += ` ${aspiration},`
    });
    if (aspirationHtml.endsWith(",")) aspirationHtml = aspirationHtml.slice(0, -1);
    assignCertificateData(certification)
    assignCompletedTrainingData(completeTraining)
    $('#emp_aspiration').val(aspirationHtml);
    if(certification.length > 0){
       
       
        $("#emp_certification").hover(function(){
            $('#hoverTable').css({'display':'block'});
          },function(){
           $('#hoverTable').css({'display':'none'});
        });
        var sortedArray = certification.sort((a,b) => new moment(b.COMPLETED_ON) - new moment(a.COMPLETED_ON));

        $.each(sortedArray, function (i, certificate) {
            let date_completion = convert(certificate.COMPLETED_ON);
           
            let hoverData;
            if(i < 3){
                certificationHtml += ` ${certificate.CERTIFICATION_NAME},`
            }
            hoverData += '<tr>' +
                            '<td>'   + certificate.CERTIFICATION_NAME + '</td>' +
                            '<td>'   + date_completion + '</td>'
                            '</tr>';
            $("#hoverData").append(hoverData);             
        });
    }
    else{
        certificationHtml = ''
        $('#emp_certification').unbind('hover');
    }
    if (certificationHtml.endsWith(",")) certificationHtml = certificationHtml.slice(0, -1);
    $('#emp_certification').val(certificationHtml);
    $.each(completeTraining, function (i, training) {
        completeTrainingHtml += ` ${training},`
    });
    if (completeTrainingHtml.endsWith(",")) completeTrainingHtml = completeTrainingHtml.slice(0, -1);
    $('#emp_comp_training').val(completeTrainingHtml);
    $.each(skillsToTeach, function (i, skillTeach) {
        skillsToTeachHtml += ` ${skillTeach},`
    });
    if (skillsToTeachHtml.endsWith(",")) skillsToTeachHtml = skillsToTeachHtml.slice(0, -1);
    $('#emp_skill_to_teach').val(skillsToTeachHtml);
    $.each(skillstoLearn, function (i, skillLearn) {
        skillstoLearnHtml += ` ${skillLearn},`
    });
    if (skillstoLearnHtml.endsWith(",")) skillstoLearnHtml = skillstoLearnHtml.slice(0, -1);
    $('#emp_next_skill_learn').val(skillstoLearnHtml);
}

function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
}
console.log(convert("Mon, 11 Nov 2013 00:00:00 GMT"));

function showAllExp() {
    $('.exp_div_submenu').slideToggle("slow");
    $('.emp_total').find('i').toggleClass('fa-chevron-down fa-chevron-up');
}

function showYTDData() {
    $('.ytd_month_data').slideToggle("slow");
    $('.ytd_per_div').find('i').toggleClass('fa-chevron-down fa-chevron-up');
}

function getResume() {
    window.location.href = 'employeeResume.html';
}

function editYtdBilling() {
    window.location.href = 'employeeExperience.html';
}
function convertExperienceToMonths(experience) {
    // Match years (Y) and months (M) from the string
    const experienceRegex = /(\d+\.?\d*)Y\s+(\d+\.?\d*)M/;
    const match = experience.match(experienceRegex);

    if (match) {
        const years = parseFloat(match[1]) || 0; // Extract and convert years
        const months = parseFloat(match[2]) || 0; // Extract and convert months
        const totalMonths = Math.round(years * 12 + months); // Total months
        return `${totalMonths}M`; // Append "M" to the total
    }

    // If format is invalid, return "0M"
    return `0M`;
}

function assignSowYTDData() {
    let empJsonData = localStorage.getItem("emp-data");
    empJsonData = $.parseJSON(empJsonData);

    $("#emp_name").html(empJsonData.EMPLOYEE_NAME);
    $("#emp_mail").html(empJsonData.EMAIL_ID);
    $('#emp_desg').html(empJsonData.JOB_ROLE);
    $('#emp_active').html(empJsonData.EMP_STATUS);
    $('#emp_loc').html(empJsonData.COUNTRY);
    let sowYTDDataGet = empJsonData.SOW_DATA;
    let sowYTDHtml = "";
    $.each(sowYTDDataGet, function (i, ytdSow) {
        const totalMonths = convertExperienceToMonths(ytdSow.PROJECT_TOTAL_EXPERIENCE);
        console.log("ytdSow.ALLOCATION_END_DATE - ", ytdSow.ALLOCATION_END_DATE);
        let allocationstartDate = new Date((ytdSow.ALLOCATION_START_DATE).replace(" ", "T")); // Convert to ISO format
        let allocationEndDate = new Date((ytdSow.ALLOCATION_END_DATE).replace(" ", "T")); // Convert to ISO format
        if(ytdSow.ALLOCATION_END_DATE == "0000-00-00" || ytdSow.ALLOCATION_END_DATE == "0000-00-00 00:00:00"){
            allocationEndDate = new Date(); // Set to current date if end date is invalid
        }
        let today = new Date();
        // Reset today's time to 00:00:00 for accurate date-only comparison
        today.setHours(0, 0, 0, 0);
        let isTodayBetween = today >= allocationstartDate && today <= allocationEndDate;
        console.log(isTodayBetween); // true or false
        sowYTDHtml += `<tr class="${isTodayBetween ? 'allocation-indication' : ''}">
                        <td>${ytdSow.ACCOUNT_NAME}</td>
                        <td>${ytdSow.SOW_NAME}</td>
                        <td>${ytdSow.BILLING_STATUS}</td>
                        <td>${convert(ytdSow.ALLOCATION_START_DATE)}</td>
                        <td>${convert(ytdSow.ALLOCATION_END_DATE)}</td>
                        <td>${totalMonths}</td>        
                        </tr>`;
    })
    $('#emp_factspan_prjt_details').append(sowYTDHtml)
    getExpYtdData();
}

function sowAccDetails(uniqueId, sowid) {
  console.log("uniqueId", uniqueId);
  console.log("sowid", sowid);
  let uniqId_sowid = uniqueId + "&" + sowid;
  window.open("sow.html?" + uniqId_sowid, "_blank");
}

const editSkillPersona = async () => {
    // window.location.href = 'employeePersonaSkills.html';
    let perosna_val = $("#persona_name").val()
    let perosna_list = perosna_val.join(",")
    let skill_val = $("#skill_name").val()
    let user_data = {
        "ACCESS_LEVEL": accese_level,
        "Access": accessData,
        "EDIT_ACCESS": edit_access,
        "EMAIL_ID": sessionName,
        "GROUP_NAME": groupName,
        "USERNAME": empName,
        "USER_ID": empId
    }
    let skill_persona_form_data = {
        "data": 
            {
                "EMPLOYEE_ID": team_member_data.EMPLOYEE_ID,
                "EMPLOYEE_NAME":team_member_data.EMPLOYEE_NAME,
                "EMPLOYEE_PROFILE":team_member_data.JOB_ROLE,
                "SKILL_DATA":[
                                {
                                    "SKILLS":skill_val,
                                    "SKILLS_PERSONA":perosna_list
                                }
                            ]
            }
        ,
        "user_details": [user_data]
    }
    console.log("aspiration_form_data - ", skill_persona_form_data)
    let updatePersonaSkill = await fetch("https://rre.dev.factspanapps.com:5001/update_skills_persona", {
        method: "POST",
        body: JSON.stringify(skill_persona_form_data)
    })
        .then(response => response.json())
        .then(result => {
            console.log("result - ", result)
            if (result.Message == "Success") {
                console.log(result.Response)
                toastr.options.timeOut = 2000; // 2s
                toastr.success(result.Response);
            } else {
                toastr.options.timeOut = 2000; // 2s
                toastr.error(result.Response);
                console.log(result.Response)
            }
        })
        .catch(error => {
            // Handle errors
            console.error("error - ", error);
            toastr.options.timeOut = 2000; // 2s
            toastr.error(error);
        });
}

let perosnaOptionHtml = "";
let skillOptionsHtml = "";
function getSowViewData() {
    let apiURL =apiValue.url.replace("/app", "/sow_input_drop_down");
    let empId = localStorage.getItem('EmpUserID');
    let emp_email = localStorage.getItem('email');
    let emp_dep = localStorage.getItem('Department');
    $.ajax({
        url: apiURL,
        type: "POST",
        
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            query_type: "sow_input_drop_down",
            "environment": apiValue.environment,
            emp_id: empId,
            mail_id: emp_email,
            department: emp_dep,
            flag: 'false'
        }),
        success: function (data) {
            sowDropDownJson = data[0];
            $.each(sowDropDownJson.SKILL_LEVEL, function (i, skillOpt) {
                skillOptionsHtml += `<option value="${skillOpt}">${skillOpt}</option>`
            })
            $("#selectSkillOption").append(skillOptionsHtml)
            $.each(sowDropDownJson.DESIGNATION, function (i, perosna) {
                perosnaOptionHtml += `<option value="${perosna}">${perosna}</option>`
            })
            $("#selectPersonaOption").append(perosnaOptionHtml);
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
}

function assignPersonSkillData() {
    let empJsonData = localStorage.getItem("emp-data");
    empJsonData = $.parseJSON(empJsonData);
    $("#emp_name").html(empJsonData.EMPLOYEE_NAME);
    $("#emp_mail").html(empJsonData.EMAIL_ID);
    $('#emp_desg').html(empJsonData.JOB_ROLE);
    $('#emp_active').html(empJsonData.EMP_STATUS);
    $('#emp_loc').html(empJsonData.COUNTRY);
    let skillData = empJsonData.SKILLS_LEVEL;
    let personaData = empJsonData.SKILLS_PERSONA;
    $("#selectSkillOption").select2({});
    $("#selectSkillOption").val(skillData).trigger('change');
    $("#selectPersonaOption").select2({});
    $("#selectPersonaOption").val(personaData).trigger('change');
}

function getSelectedPersona() {
    let selectedPerosna = $('#selectPersonaOption').val();
    $('.persona_div').empty();
    $.each(selectedPerosna, function (i, personaSpan) {
        let persona = `<span class="emp_skil_per">${personaSpan}</span>`
        $('.persona_div').append(persona);
    })
}

function getSelectedSkills() {
    let selectedPerosna = $('#selectSkillOption').val();
    $('.emp_skill_div').empty();
    $.each(selectedPerosna, function (i, personaSpan) {
        let persona = `<span class="emp_skil_per">${personaSpan}</span>`
        $('.emp_skill_div').append(persona);
    })
}

function saveSkillPersona() {
    let empJsonData = localStorage.getItem("emp-data");
    empJsonData = $.parseJSON(empJsonData);
    let selectedEmpID = empJsonData.EMPLOYEE_ID;
    let empDesg = $('#emp_desg').html();
    let skillData = $('#selectSkillOption').val();
    const unique = arr => [...new Set(arr)];
    let skill_uniq = unique(skillData);
    let skillUpdatedData = ""
    $.each(skill_uniq, function (i, skillOpt) {
        skillUpdatedData += `"${skillOpt}",`
    })
    if (skillUpdatedData.endsWith(",")) {
        skillUpdatedData = skillUpdatedData.slice(0, -1);
    }
    let perosnaData = $('#selectPersonaOption').val();
    let perosna_uniq = unique(perosnaData);
    let perosnaUpdatedData = ""
    $.each(perosna_uniq, function (i, personaOpt) {
        perosnaUpdatedData += `"${personaOpt}",`
    })
    if (perosnaUpdatedData.endsWith(",")) {
        perosnaUpdatedData = perosnaUpdatedData.slice(0, -1);
    }
    let empSkillPersData = "{ \"EMPLOYEE_ID\" : \"" + selectedEmpID +
        "\", \"EMPLOYEE_PROFILE\":\"" + empDesg +
        "\", \"SKILLS_PERSONA\": [" + perosnaUpdatedData +
        "], \"SKILLS_DATA\": [" + skillUpdatedData + "]},"

    if (empSkillPersData.endsWith(",")) {
        empSkillPersData = empSkillPersData.slice(0, -1);
    }

    let accessDetails = "{ \"ACCESS_LEVEL\" : \"" + accese_level +
        "\", \"Access\":\"" + accessData +
        "\", \"EDIT_ACCESS\":\"" + edit_access +
        "\", \"EMAIL_ID\":\"" + sessionName +
        "\", \"GROUP_NAME\":\"" + groupName +
        "\", \"USERNAME\":\"" + empName +
        "\", \"USER_ID\":\"" + empId +
        "\"}";
    let takeApprovalResponse = "NO";
    let approverName = [];
    let approvalData = "{ \"TAKE_APPROVAL\" : \"" + takeApprovalResponse +
        "\", \"APPROVER\":\"" + approverName +
        "\"}";

    let updatePerSkillData = {
        "query_type": "employee_details_edit",
        "environment": apiValue.environment,
        "user_details": "[" + accessDetails + "]",
        "APPROVAL_DATA": "[" + approvalData + "]",
        "data": "[" + empSkillPersData + "]",
        "MODE": "EDIT"
    }
    $.ajax({
        url: apiValue.url,
        // url: "https://rre-api.factspanapps.com:5000/app",
        type: "POST",
        
        dataType: "json",
        crossDomain: true,
        format: "json",
        data: JSON.stringify(updatePerSkillData),
        success: function (json) {
            if (json.Message == "Success") {
                toastr.options.timeOut = 2000; // 2s
                toastr.success("Persona and Skills Updated Successfully");
            } else {
                toastr.options.timeOut = 2000; // 2s
                toastr.error(json.Response);
            }
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
            toastr.options.timeOut = 2000; // 2s
            toastr.error('Message error' + JSON.stringify(error));
        }
    });

}

function editTrainingCertification() {
    let empJsonData = localStorage.getItem("emp-data");
    empJsonData = $.parseJSON(empJsonData);
    $("#emp_name").html(empJsonData.EMPLOYEE_NAME);
    $("#emp_mail").html(empJsonData.EMAIL_ID);
    $('#emp_desg').html(empJsonData.JOB_ROLE);
    $('#emp_active').html(empJsonData.EMP_STATUS);
    $('#emp_loc').html(empJsonData.COUNTRY);
}


function getExpYtdData() {
    var selectedVal = "";
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    console.log("selectedVal - " + selectedVal);
    if(selectedVal == "YTD"){
        $(".allocation_bill_div").hide();
        $("#ytd_billing_data").show();
    }else {
        $(".allocation_bill_div").show();
        $("#ytd_billing_data").hide()
    }
}

function assignCertificateData (certificateData){
    let certificate_html = "";
    $.each(certificateData, function (i, certificate) {
        certificate_html += `<tr>
                          <td><span class="cer_training_data">${certificate.CERTIFICATION_NAME}</span></td>
                          <td>${certificate.CERTIFICATE_LEVEL}</td>
                          <td>${certificate.COMPLETED_ON}</td>
                        </tr>`
    }); 
    if(certificateData.length == 0){
        $('#cert_table_body').append(`<tr><td colspan="3" style="text-align: center;">No Certificate Data Available</td></tr>`)
    }else{
        $('#cert_table_body').append(certificate_html)
    }

}

function assignCompletedTrainingData (trainingData){
    let training_html = "";
    $.each(trainingData, function (i, training) {
        training_html += `<tr>
                          <td><span class="cer_training_data">${training.TRAINING_NAME}</span></td>
                          <td>${training.TRAINING_LEVEL}</td>
                          <td>${training.COMPLETED_ON}</td>
                        </tr>`
    }); 
    if(trainingData.length == 0){
        $('#training_table_body').append(`<tr><td colspan="3" style="text-align: center;">No Training Data Available</td></tr>`)
    }else{
        $('#training_table_body').append(training_html)
    }

}