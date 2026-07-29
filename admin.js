$(document).ready(function () {
    let accessStatus = checkDashboardPageAccessData()
    if (accessStatus) {
        let role = localStorage.getItem("user-role");
        let roleList = role.split(",")
        let roleCheck = false;
        $.each(roleList, function (j, roleName) {
            if (!roleCheck) {
                if (roleName == "admin") {
                    roleCheck = true
                } else {
                    $(".admin").hide();
                }
            }
        })
        if (roleCheck) {
            $(".show_page").show();
            getRoleTeamData();
        } else {
            window.location.href = "home.html"
        }
    } else {
        window.location.href = "home.html"
    }
});

let role_data = [], team_data = [], all_team_role_data = [], allTeamMembersName = [], allRoleListData = [];
let teamNameHtmlOpt = "", roleNameHtmlOpt = "", allRoleNames = []
let apiurl = apiValue.url_ip + ":5006/admin_dashboard_by_role"
function getRoleJsonData() {
    const startTime = performance.now();
    const pathname = window.location.pathname;
            // Extract the file name (last segment) from the pathname
    const parts = pathname.split('/');
    const fileName = parts.pop();
    $.ajax({
        url: apiurl,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            
        }),
        success: function (data) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"admin","Admin","admin_dashboard_by_role","success",fileName,"AdminPage","view");
            role_data = data
            getAllRoleTeamJsonData()
        },
        error: function (error) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"admin","Admin","admin_dashboard_by_role","error",fileName,"AdminPage","view");
            console.log('message Error' + JSON.stringify(error));
        }

    });
}

function getTeamData() {
    let apiurl =  apiValue.url_ip + ":5006/admin_dashboard_by_employee"
    const startTime = performance.now();
    const pathname = window.location.pathname;
            // Extract the file name (last segment) from the pathname
    const parts = pathname.split('/');
    const fileName = parts.pop();
    $.ajax({
        url: apiurl,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            "access_mode": "admin_dashboard_by_employee"
        }),
        success: function (data) {
            team_data = data
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"admin","Admin","admin_dashboard_by_employee","success",fileName,"AdminPage","view");
        },
        error: function (error) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds,"admin","Admin","admin_dashboard_by_employee","error",fileName,"AdminPage","view");
            console.log('message Error' + JSON.stringify(error));
        }

    });
}

function getAllRoleTeamJsonData() {
    let apiURL =  apiValue.url_ip + ":5006/all_roles_details"
    const startTime = performance.now();
    if (all_team_role_data.length == 0) {
        $.ajax({
            url: apiURL,
            type: "POST",
            dataType: "json",
            crossDomain: true,
            format: "json",
            async: false,
            mode: 'no-cors',
            data: JSON.stringify({
               
            }),
            success: function (data) {
                const endTime = performance.now();
                const loadTimeInSeconds = (endTime - startTime) / 1000;
                const pathname = window.location.pathname;
                // Extract the file name (last segment) from the pathname
                const parts = pathname.split('/');
                const fileName = parts.pop();
                getApiTime(loadTimeInSeconds,"admin","Admin","all_roles_details","success",fileName,"AdminPage","view");
                all_team_role_data = data.Data
                allTeamMembersName = all_team_role_data.ALL_USERS
                allRoleNames = all_team_role_data.ROLES_DETAILS
                allRoleListData = all_team_role_data.ROLES_DETAILS
                $.each(allTeamMembersName, function (i, teamNames) {
                    teamNameHtmlOpt += `<option value="${teamNames.EMPLOYEE_ID}">${teamNames.EMPLOYEE_NAME}</option>`
                })
                $.each(allRoleNames, function (j, roleNames) {
                    roleNameHtmlOpt += `<option value="${roleNames.ROLE_ID}">${roleNames.ACCESS_ROLE}</option>`
                })
            },
            error: function (error) {
                console.log('message Error' + JSON.stringify(error));
            }

        });
    }
}
let roleCount = 0;
let teamCount = 0;
function getRoleTeamData() {
    var selectedVal = "";
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    if (selectedVal == "Role") {
        if (role_data.length == 0) {
            getRoleJsonData()
        }
        $("#role_table").show()
        $("#role_table_wrapper").show()
        $(".team_role").show()
        $("#team_table").hide()
        $("#team_table_wrapper").hide()
        $("#team_role").attr("placeholder", "Search role");
        if (roleCount == 0) {
            let roleJson = role_data.Data;
            $.each(roleJson, function (i, roleData) {
                let accessRoleData = roleData.ACCESS_ROLE_DATA
                let teamRoleHtml = "", teamIdList = []
                $.each(accessRoleData, function (j, teamRole) {
                    if (teamRole.EMPLOYEE_NAME != "") {
                        teamRoleHtml += `<button class="skill_data">${teamRole.EMPLOYEE_NAME}</button>`
                        teamIdList.push(teamRole.EMPLOYEE_ID)
                    }
                });
                let role_data_html = `<tr class="role_data" id="role_${roleData.ROLE_ID}">
                                        <td><div class="team_data_left team_mem_name" onclick="editRoleDetails(this)" data-id='${JSON.stringify(roleData)}'">${capitalizeTxt(roleData.ACCESS_ROLE)}</div></td>
                                        <td><div class="team_data_left">${capitalizeTxt(roleData.DESCRIPTION)}</div></td>
                                        <td style="display:none">
                                            <div class="team_data_left team_access_type_text_${roleData.ROLE_ID}">${roleData.ACCESS_TYPE}</div>
                                            <div class="team_access_type_check_${roleData.ROLE_ID}" id="team_access_check_${roleData.ROLE_ID}">
                                                <form>
                                                    <label class = "checkbox-inline">
                                                    <input type="checkbox" id="role_access_check_${roleData.ROLE_ID}_view" name="role_access_check_${roleData.ROLE_ID}_view" value="view"> View
                                                    </label>
                                                    <label class = "checkbox-inline">
                                                    <input type="checkbox" id="role_access_check_${roleData.ROLE_ID}_edit" name="role_access_check_${roleData.ROLE_ID}_edit" value="edit"> Edit
                                                    </label>
                                                    <label class = "checkbox-inline">
                                                    <input type="checkbox" id="role_access_check_${roleData.ROLE_ID}_delete" name="role_access_check_${roleData.ROLE_ID}_delete" value="delete"> Delete
                                                    </label>
                                                </form>
                                            </div>
                                        </td>
                                        <td class="team_role_button">
                                            <div class="more role_div_class_${roleData.ROLE_ID}" id="${roleData.ROLE_ID}_button_data">${teamRoleHtml}</div>
                                            <select class="form-control select_persona role_select_class_${roleData.ROLE_ID} team_list_select" name="selectPersonaOption[]" multiple
                                                id="role_assign_team_${roleData.ROLE_ID}">  
                                                ${teamNameHtmlOpt}      
                                            </select>
                                        </td>
                                        <td>
                                        <button class="btn btn-info-account role_edit_btn ${roleData.ROLE_ID}_show" 
                                            data-id='${JSON.stringify(roleData)}'
                                            data-id2='${roleData.ROLE_ID}'
                                            onclick="roleEdit(this)"
                                            title= "Edit">
                                            <i class="fa fa-pencil-square-o" aria-hidden="true">
                                            </i>
                                        </button>
                                        <button class="btn btn-info-account role_edit_btn ${roleData.ROLE_ID}_edit" 
                                            data-id='${JSON.stringify(roleData)}'
                                            data-id2='${roleData.ROLE_ID}'
                                            onclick="roleUpdate(this)"
                                            title= "Update">
                                            <i class="fa fa-floppy-o" aria-hidden="true">
                                            </i>
                                        </button>
                                        </td>
                                    </tr>`
                $("#role_body_data").append(role_data_html)
                $("." + roleData.ROLE_ID + "_edit").hide()
                $("#role_assign_team_" + roleData.ROLE_ID).select2({});
                $("#role_assign_team_" + roleData.ROLE_ID).val(teamIdList).trigger('change');
                $(".role_select_class_" + roleData.ROLE_ID).hide()
                $(".team_access_type_check_" + roleData.ROLE_ID).hide();
                let access_type_data = roleData.ACCESS_TYPE.split(',')
                $.each(access_type_data, function (k, accType) {
                    switch (accType.toLowerCase()) {
                        case "view":
                            $("#role_access_check_" + roleData.ROLE_ID + "_view").prop('checked', true);
                            break;
                        case "edit":
                            $("#role_access_check_" + roleData.ROLE_ID + "_edit").prop('checked', true);
                            break;
                        case "delete":
                            $("#role_access_check_" + roleData.ROLE_ID + "_delete").prop('checked', true);
                            break
                    }
                })
            })
            $('#role_table').dataTable({
                "pageLength": 50,
                "dom": "rtip",
                "paging": false,
                "columnDefs": [
                    { "width": "10%", "targets": 1 },
                    { "width": "1%", "targets": 4 },
                    { orderable: false, targets: -1 }
                ]
            });
            roleCount++
        }
    } else if (selectedVal == "Team") {
        if (team_data.length == 0) {
            getTeamData()
        }
        $("#role_table").hide()
        $("#role_table_wrapper").hide()
        $(".team_role").show()
        $("#team_table").show()
        $("#team_table_wrapper").show()
        $("#team_role").attr("placeholder", "Search team member");
        if (teamCount == 0) {
            let teamJson = team_data.Data;
            $.each(teamJson, function (i, teamData) {
                let accessRoleData = teamData.EMPLOYEE_DATA
                let teamRoleHtml = "", teamRolesList = [], teamRoleData = ""
                $.each(accessRoleData, function (j, teamRole) {

                    teamRoleHtml += `<button class="skill_data">${teamRole.ACCESS_ROLE}</button>`
                    teamRoleData += `${teamRole.ACCESS_ROLE} `
                    teamRolesList.push(teamRole.ROLE_ID)
                });
                let team_data_html = `<tr class="team_role_data" id="team_${teamData.EMPLOYEE_ID}">
                                        <td><div class="team_data_left">${teamData.EMPLOYEE_NAME}</div></td>
                                        <td class="">
                                            <div class="more team_role_div_class_${teamData.EMPLOYEE_ID}" id="${teamData.EMPLOYEE_ID}_role_button_data">${teamRoleHtml}</div>
                                            <select class="form-control select_persona team_role_select_class_${teamData.EMPLOYEE_ID} team_list_select" name="selectPersonaOption[]" multiple
                                                id="team_role_assign_team_${teamData.EMPLOYEE_ID}">  
                                                ${roleNameHtmlOpt}      
                                            </select>
                                        </td>
                                        <td>
                                        <button class="btn btn-info-account team_edit_btn" id="team_edit_${teamData.EMPLOYEE_ID}"
                                            onclick="teamEdit(this)"
                                            data-id2='${teamData.EMPLOYEE_ID}'
                                            title= "Edit">
                                            <i class="fa fa-pencil-square-o" aria-hidden="true">
                                            </i>
                                        </button>
                                        <button class="btn btn-info-account team_save_btn" id="team_update_${teamData.EMPLOYEE_ID}"
                                            data-id='${JSON.stringify(teamData)}'
                                            data-id2='${teamData.EMPLOYEE_ID}'
                                            onclick="teamUpdate(this)"
                                            title= "Update">
                                            <i class="fa fa-floppy-o" aria-hidden="true">
                                            </i>
                                        </button>
                                        <button class="btn btn-info-account team_delete_btn" id="team_delete_${teamData.EMPLOYEE_ID}"
                                            data-id='${JSON.stringify(teamData)}'
                                            data-id2='${teamData.EMPLOYEE_ID}'
                                            onclick="teamDelete(this)"
                                            title= "Delete">
                                            <i class="fa fa-trash" aria-hidden="true">
                                            </i>
                                        </button>
                                        </td>
                                    </tr>`
                $("#team_body_data").append(team_data_html)
                $("#team_update_" + teamData.EMPLOYEE_ID).hide();
                $("#team_role_assign_team_" + teamData.EMPLOYEE_ID).select2({});
                $("#team_role_assign_team_" + teamData.EMPLOYEE_ID).val(teamRolesList).trigger('change');
                $(".team_role_select_class_" + teamData.EMPLOYEE_ID).hide();
            })
            // $('#team_table').dataTable({
            //     "pageLength": 50,
            //     "paging": false,
            //     "columnDefs": [
            //         { "width": "1%", "targets": 2 },
            //         { orderable: false, targets: -1 }
            //     ]
            // });
            teamCount++
        }
    }
}

function selectedRoleData(obj) {
    let idData = $(obj).attr("data-id");
    localStorage.setItem("selected-role-data", idData);
    window.location.href = 'adminRole.html';
}

function roleEdit(obj) {
    let className = $(obj).attr("data-id2");
    $("." + className + "_show").hide()
    $("." + className + "_edit").show()
    $(".role_select_class_" + className).show()
    $(".role_div_class_" + className).hide()
    $(".team_access_type_check_" + className).show()
    $(".team_access_type_text_" + className).hide()
}

function roleUpdate(obj) {
    let className = $(obj).attr("data-id2");
    let selectedData = JSON.parse($(obj).attr("data-id"));
    $("." + className + "_show").show()
    $("." + className + "_edit").hide()
    $(".role_select_class_" + className).hide()
    $(".role_div_class_" + className).show()
    $(".team_access_type_check_" + className).hide()
    $(".team_access_type_text_" + className).show()
    let getSelectedTeam = $("#role_assign_team_" + className).val()
    let team_old_list = []
    $.each(selectedData.ACCESS_ROLE_DATA, function (l, oldTeam) {
        if (oldTeam.EMPLOYEE_ID != "") {
            team_old_list.push(oldTeam.EMPLOYEE_ID)
        }
    })
    getSelectedTeam = removeDuplicatesfromArray(getSelectedTeam)
    let removedTeamMember = $(team_old_list).not(getSelectedTeam).get();
    let addedTeamMember = $(getSelectedTeam).not(team_old_list).get();
    let removedTeamJson = getTeamJsonData(removedTeamMember, "remove")
    let addedTeamJson = getTeamJsonData(addedTeamMember, "update")
    let oldTeamJson = getTeamJsonData(team_old_list, "")
    let isViewChecked = $('#role_access_check_' + className + '_view').prop('checked');
    let isEditChecked = $('#role_access_check_' + className + '_edit').prop('checked');
    let isDeleteChecked = $('#role_access_check_' + className + '_delete').prop('checked');
    let accessTypeArray = []
    if (isViewChecked) accessTypeArray.push("view");
    if (isEditChecked) accessTypeArray.push("edit");
    if (isDeleteChecked) accessTypeArray.push("delete");
    let accessTypeString = accessTypeArray.join(",")
    let commonTeamDataJson = ""
    if (removedTeamJson != "" && addedTeamJson != "") {
        commonTeamDataJson = removedTeamJson + "," + addedTeamJson
    } else if (removedTeamJson != "") {
        commonTeamDataJson = removedTeamJson
    } else if (addedTeamJson != "") {
        commonTeamDataJson = addedTeamJson
    }
    if (commonTeamDataJson != "") {

        let accessDetails =
            '{ "ACCESS_LEVEL" : "' +
            accese_level +
            '", "Access":"' +
            accessData +
            '", "EDIT_ACCESS":"' +
            edit_access +
            '", "EMAIL_ID":"' +
            sessionName +
            '", "GROUP_NAME":"' +
            groupName +
            '", "USERNAME":"' +
            empName +
            '", "USER_ID":"' +
            empId +
            '"}';
        let role_modified = "NO"

        let role_details =
            '{ "ROLE_ID" : "' +
            selectedData.ROLE_ID +
            '", "ACCESS_ROLE":"' +
            selectedData.ACCESS_ROLE +
            '", "DESCRIPTION":"' +
            selectedData.DESCRIPTION +
            '", "ACCESS_ON":"' +
            selectedData.ACCESS_ON +
            '", "ROLE_MODIFIED":"' +
            role_modified +
            '", "PAGE_ACCESS_DATA":[], "ACCESS_ROLE_DATA":[' +
            commonTeamDataJson +
            ']}';
        let oldDetails =
            '{ "ROLE_ID" : "' +
            selectedData.ROLE_ID +
            '", "ACCESS_ROLE":"' +
            selectedData.ACCESS_ROLE +
            '", "DESCRIPTION":"' +
            selectedData.DESCRIPTION +
            '", "ACCESS_ON":"' +
            selectedData.ACCESS_ON +
            '", "PAGE_ACCESS_DATA":[], "ACCESS_ROLE_DATA":[' +
            oldTeamJson +
            ']}';
        let updateRoleData = {
            user_details: "[" + accessDetails + "]",
            access_details: "" + role_details + "",
            old_details: "" + oldDetails + ""
        };
        let apiurl = apiValue.url_ip + ":5006/update_access_by_role_new"
        $.ajax({
            url: apiurl,
            type: "POST",
            dataType: "json",
            crossDomain: true,
            format: "json",
            data: JSON.stringify(updateRoleData),
            success: function (json) {
                if (json.Response == "Success") {
                    toastr.options.timeOut = 2000; // 2s
                    toastr.success(json.Message);
                    location.reload();
                } else {
                    toastr.options.timeOut = 2000; // 2s
                    toastr.error(json.Message);
                }
            },
            error: function (error) {
                toastr.options.timeOut = 2000; // 2s
                toastr.error("Message error" + JSON.stringify(error));
                // $("#sow_edit").show();
            },
        });
    }
}

const getTeamJsonData = (teamList, opr) => {
    let emplist = [], selTeamData = [], status = ""
    $.each(teamList, function (j, selEmp) {
        emplist = allTeamMembersName.filter((emp) => {
            return emp.EMPLOYEE_ID == selEmp
        })
        emplist = emplist[0]
        selTeamData.push(emplist)
    })
    let empDetails = "";
    if(opr == "remove"){
        status = "NO"
    }else{
        status = "YES"
    }
    $.each(selTeamData, function (k, emp) {
        if (emp == undefined) {
            empDetails = ""
        } else {
            empDetails +=
                '{ "EMPLOYEE_ID" : "' +
                emp.EMPLOYEE_ID +
                '", "EMPLOYEE_NAME":"' +
                emp.EMPLOYEE_NAME +
                '", "EMAIL_ID":"' +
                emp.EMAIL_ID +
                '", "JOB_ROLE":"' +
                emp.JOB_ROLE +
                '", "DEPARTMENT":"' +
                emp.DEPARTMENT +
                '", "OPERATION":"' +
                opr +
                '", "ACTIVE_FLAG":"' +
                status +
                '"},';
        }
    })
    empDetails = removeComma(empDetails)
    return empDetails;
}

const removeComma = (removeCommaText) => {
    if (removeCommaText.endsWith(",")) {
        removeCommaText = removeCommaText.slice(0, -1);
    }
    return removeCommaText;
}

function addRole() {
    localStorage.setItem("selected-role-data", "")
    localStorage.setItem("team-role-data", JSON.stringify(all_team_role_data))
    window.location.href = "adminRole.html";
}

function removeDuplicatesfromArray(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}


function removeRole(obj) {
    $(obj).closest('tr').remove()
}

function teamEdit(obj) {
    let className = $(obj).attr("data-id2");
    $("#team_update_" + className).show();
    $("#team_edit_" + className).hide()
    $("#" + className + "_role_button_data").hide()
    $(".team_role_select_class_" + className).show()
}

function teamUpdate(obj) {
    let className = $(obj).attr("data-id2");
    let selectedTeamData = JSON.parse($(obj).attr("data-id"));
    $("#team_update_" + className).hide();
    $("#team_edit_" + className).show()
    $("#" + className + "_role_button_data").show()
    $(".team_role_select_class_" + className).hide()
    let selectedRole = $("#team_role_assign_team_" + className).val()
    let getRoleId = "", getRoleName = "", rolelist = [], RoleTeamData = [], oldRoleId = "", oldRoleName = ""
    let eachUser = '', oldRoleData = []
    $.each(selectedTeamData.EMPLOYEE_DATA, function (l, oldData) {
        oldRoleData.push(oldData.ROLE_ID)
        oldRoleId += `${oldData.ROLE_ID},`
        oldRoleName += `${oldData.ACCESS_ROLE},`
    })
    console.log('oldRoleData - ',oldRoleData)
    console.log('selectedRole - ',selectedRole)
    // Find the new items in newDataList that are not in oldDataList
    const newItems = oldRoleData.filter(item => !selectedRole.includes(item));

    console.log(newItems); // Output: ["RRE_1032"]
    console.log('allRoleNames - ',allRoleNames)
    $.each(selectedRole, function (j, teamroleName) {
        rolelist = allRoleNames.filter((emp) => {
            if (emp.ROLE_ID == teamroleName) {
                eachUser += '{ "USER_ID" : "' +
                                selectedTeamData.EMPLOYEE_ID +
                                '", "EMPLOYEE_NAME":"' +
                                selectedTeamData.EMPLOYEE_NAME +
                                '", "EMAIL_ID":"' +
                                selectedTeamData.EMAIL_ID  +
                                '", "ROLE_ID":"' +
                                emp.ROLE_ID +
                                '", "ACCESS_ON":"' +
                                emp.ACCESS_ROLE +
                                '", "ACTIVE_FLAG":"YES"},'
                getRoleId += `${emp.ROLE_ID},`
                getRoleName += `${emp.ACCESS_ROLE},`
            }
        })
    })
    $.each(newItems, function (j, teamroleName) {
        rolelist = allRoleNames.filter((emp) => {
            if (emp.ROLE_ID == teamroleName) {
                eachUser += '{ "USER_ID" : "' +
                                selectedTeamData.EMPLOYEE_ID +
                                '", "EMPLOYEE_NAME":"' +
                                selectedTeamData.EMPLOYEE_NAME +
                                '", "EMAIL_ID":"' +
                                selectedTeamData.EMAIL_ID  +
                                '", "ROLE_ID":"' +
                                emp.ROLE_ID +
                                '", "ACCESS_ON":"' +
                                emp.ACCESS_ROLE +
                                '", "ACTIVE_FLAG":"NO"},'
                getRoleId += `${emp.ROLE_ID},`
                getRoleName += `${emp.ACCESS_ROLE},`
            }
        })
    })
    getRoleName = removeComma(getRoleName);
    getRoleId = removeComma(getRoleId);
    oldRoleId = removeComma(oldRoleId);
    oldRoleName = removeComma(oldRoleName);
    eachUser = removeComma(eachUser);

    let user_details =
        '{ "ACCESS_LEVEL" : "' +
        accese_level +
        '", "Access":"' +
        accessData +
        '", "EDIT_ACCESS":"' +
        edit_access +
        '", "EMAIL_ID":"' +
        sessionName +
        '", "GROUP_NAME":"' +
        groupName +
        '", "USERNAME":"' +
        empName +
        '", "USER_ID":"' +
        empId +
        '"}';
    let accessDetails =
        '{ "USER_ID" : "' +
        selectedTeamData.EMPLOYEE_ID +
        '", "EMPLOYEE_NAME":"' +
        selectedTeamData.EMPLOYEE_NAME +
        '", "EMAIL_ID":"' +
        selectedTeamData.EMAIL_ID +
        '", "ROLE_ID":"' +
        getRoleId +
        '", "ACCESS_ON":"' +
        getRoleName +
        '"}';
    let oldDetails =
        '{ "USER_ID" : "' +
        selectedTeamData.EMPLOYEE_ID +
        '", "EMPLOYEE_NAME":"' +
        selectedTeamData.EMPLOYEE_NAME +
        '", "EMAIL_ID":"' +
        selectedTeamData.EMAIL_ID +
        '", "ROLE_ID":"' +
        oldRoleId +
        '", "ACCESS_ON":"' +
        oldRoleName +
        '"}';
    console.log('eachUser - ',eachUser)
    let updateTeamData = {
        user_details: "[" + user_details + "]",
        access_details: "[" + eachUser + "]",
        old_details: "[" + oldDetails + "]"
    };
    let apiurl =  apiValue.url_ip + ":5006/assign_new_role_new"
    const startTime = performance.now();
    const pathname = window.location.pathname;
            // Extract the file name (last segment) from the pathname
    const parts = pathname.split('/');
    const fileName = parts.pop();
    $.ajax({
        url: apiurl,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        data: JSON.stringify(updateTeamData),
        success: function (json) {
            if (json.Response == "Success") {
                const endTime = performance.now();
                const loadTimeInSeconds = (endTime - startTime) / 1000;
                getApiTime(loadTimeInSeconds,"admin","Admin","assign_new_role_new","success",fileName,"AdminPage","edit");
                toastr.options.timeOut = 2000; // 2s
                toastr.success(json.Message);
                $("#team_role_assign_team_" + className).val(selectedRole).trigger('change.select2');
                let roleNameOpt = getRoleName.split(",");
                let roleTxt = ""
                $.each(roleNameOpt, function (j, role) {
                    roleTxt += `<button class="skill_data">${role}</button>`
                });
                $("#" + className + "_role_button_data").empty()
                $("#" + className + "_role_button_data").append(roleTxt)
                // location.reload();
            } else {
                const endTime = performance.now();
                const loadTimeInSeconds = (endTime - startTime) / 1000;
                getApiTime(loadTimeInSeconds,"admin","Admin","assign_new_role_new","error",fileName,"AdminPage","edit");
                toastr.options.timeOut = 2000; // 2s
                toastr.error(json.Message);
            }
        },
        error: function (error) {
            toastr.options.timeOut = 2000; // 2s
            toastr.error("Message error" + JSON.stringify(error));
        },
    });
}

function teamDelete(obj) {
    let dataId = $(obj).attr("data-id2");
    let selectedTeamData = JSON.parse($(obj).attr("data-id"));
    let oldRoleId = "", oldRoleName = "",eachUser = "";
    $.each(selectedTeamData.EMPLOYEE_DATA, function (l, oldData) {
        eachUser += '{ "USER_ID" : "' +
                        selectedTeamData.EMPLOYEE_ID +
                        '", "EMPLOYEE_NAME":"' +
                        selectedTeamData.EMPLOYEE_NAME +
                        '", "EMAIL_ID":"' +
                        selectedTeamData.EMAIL_ID +
                        '", "ROLE_ID":"' +
                        oldData.ROLE_ID +
                        '", "ACCESS_ON":"' +
                        oldData.ACCESS_ROLE +
                        '", "ACTIVE_FLAG":"NO"},'
        oldRoleId += `${oldData.ROLE_ID},`
        oldRoleName += `${oldData.ACCESS_ROLE},`
    })
    oldRoleId = removeComma(oldRoleId);
    oldRoleName = removeComma(oldRoleName);
    eachUser = removeComma(eachUser);
    let user_details =
        '{ "ACCESS_LEVEL" : "' +
        accese_level +
        '", "Access":"' +
        accessData +
        '", "EDIT_ACCESS":"' +
        edit_access +
        '", "EMAIL_ID":"' +
        sessionName +
        '", "GROUP_NAME":"' +
        groupName +
        '", "USERNAME":"' +
        empName +
        '", "USER_ID":"' +
        empId +
        '"}';
    let accessDetails =
        '{ "USER_ID" : "' +
        selectedTeamData.EMPLOYEE_ID +
        '", "EMPLOYEE_NAME":"' +
        selectedTeamData.EMPLOYEE_NAME +
        '", "EMAIL_ID":"' +
        selectedTeamData.EMAIL_ID +
        '", "ROLE_ID":"", "ACCESS_ON":""}';
    let oldDetails =
        '{ "USER_ID" : "' +
        selectedTeamData.EMPLOYEE_ID +
        '", "EMPLOYEE_NAME":"' +
        selectedTeamData.EMPLOYEE_NAME +
        '", "EMAIL_ID":"' +
        selectedTeamData.EMAIL_ID +
        '", "ROLE_ID":"' +
        oldRoleId +
        '", "ACCESS_ON":"' +
        oldRoleName +
        '"}';
    let updateTeamData = {
        user_details: "[" + user_details + "]",
        access_details: "[" + eachUser + "]",
        old_details: "[" + oldDetails + "]"
    };
    let apiurl =  apiValue.url_ip + ":5006/assign_new_role_new"
    const startTime = performance.now();
    const pathname = window.location.pathname;
            // Extract the file name (last segment) from the pathname
    const parts = pathname.split('/');
    const fileName = parts.pop();
    $.ajax({
        url: apiurl,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        data: JSON.stringify(updateTeamData),
        success: function (json) {
            if (json.Response == "Success") {
                const endTime = performance.now();
                const loadTimeInSeconds = (endTime - startTime) / 1000;
                getApiTime(loadTimeInSeconds,"admin","Admin","assign_new_role_new","success",fileName,"AdminPage","delete");
                toastr.options.timeOut = 2000; // 2s
                toastr.success(json.Message);
                $("#team_new_" + dataId).remove()
                $("#team_" + dataId).remove()
            } else {
                const endTime = performance.now();
                const loadTimeInSeconds = (endTime - startTime) / 1000;
                getApiTime(loadTimeInSeconds,"admin","Admin","assign_new_role_new","error",fileName,"AdminPage","delete");
                toastr.options.timeOut = 2000; // 2s
                toastr.error(json.Message);
            }
        },
        error: function (error) {
            toastr.options.timeOut = 2000; // 2s
            toastr.error("Message error" + JSON.stringify(error));
        },
    });
}

function editRoleDetails(obj) {
    let selectedRoleData = $(obj).attr("data-id");
    localStorage.setItem("selected-role-data", selectedRoleData)
    localStorage.setItem("team-role-data", JSON.stringify(all_team_role_data))
    window.location.href = "adminRole.html"

}

function addteam() {
    let teamTableLen = $("#team_table tbody tr").length;
    let newTeamMember = `<tr class="team_role_data" id="team_new_${teamTableLen + 1}">
                            <td>
                                <div class="team_data_left" id="team_member_name_${teamTableLen + 1}"></div>
                                <select class="form-control select_persona team_role_select_class_${teamTableLen + 1} team_list_select" name="selectPersonaOption[]"
                                    id="team_name_assign_team_${teamTableLen + 1}">  
                                    ${teamNameHtmlOpt}      
                                </select>
                            </td>
                            <td class="">
                                <div class="more team_role_div_class_${teamTableLen + 1}" id="${teamTableLen + 1}_role_button_data"></div>
                                <select class="form-control select_persona team_role_select_class_${teamTableLen + 1} team_list_select" name="selectPersonaOption[]" multiple
                                    id="team_role_assign_team_${teamTableLen + 1}">  
                                    ${roleNameHtmlOpt}      
                                </select>
                            </td>
                            <td>
                            <button class="btn btn-info-account team_save_btn" id="team_update_${teamTableLen + 1}"
                                data-id2='${teamTableLen + 1}'
                                onclick="teamSave(this)"
                                title= "save">
                                <i class="fa fa-floppy-o" aria-hidden="true">
                                </i>
                            </button>
                            <button class="btn btn-info-account team_delete_btn" id="team_delete_${teamTableLen + 1}"
                                data-id2='${teamTableLen + 1}'
                                onclick="teamDelete(this)"
                                title= "Delete">
                                <i class="fa fa-trash" aria-hidden="true">
                                </i>
                            </button>
                            </td>
                        </tr>`
    $("#team_table tbody").append(newTeamMember);
    $("#team_member_name_" + (teamTableLen + 1)).hide();
    $("#" + (teamTableLen + 1) + "_role_button_data").hide()
    $("#team_name_assign_team_" + (teamTableLen + 1)).select2({});
    $("#team_role_assign_team_" + (teamTableLen + 1)).select2({});
}

function teamSave(obj) {
    let teamNewId = $(obj).attr("data-id2")
    let getSelectedTeamName = $("#team_name_assign_team_" + teamNewId).val()
    let getSelectedRoleName = $("#team_role_assign_team_" + teamNewId).val()
    let getRoleId = "", getRoleName = "", rolelist = [], RoleTeamData = [], eachUser = ""
    let selectTeamEmail = "", selectTeamName = ""
    let getTeamEmail = allTeamMembersName.filter((emp) => {
        if (emp.EMPLOYEE_ID == getSelectedTeamName) {
            selectTeamEmail = emp.EMAIL_ID
            selectTeamName = emp.EMPLOYEE_NAME
        }
    })
    $.each(getSelectedRoleName, function (j, teamroleName) {
        rolelist = allRoleNames.filter((emp) => {
            if (emp.ROLE_ID == teamroleName) {
                eachUser += '{ "USER_ID" : "' +
                    getSelectedTeamName +
                    '", "EMPLOYEE_NAME":"' +
                    selectTeamName +
                    '", "EMAIL_ID":"' +
                    selectTeamEmail +
                    '", "ROLE_ID":"' +
                    emp.ROLE_ID +
                    '", "ACCESS_ON":"' +
                    emp.ACCESS_ROLE +
                    '", "ACTIVE_FLAG":"YES"},'
                getRoleId += `${emp.ROLE_ID},`
                getRoleName += `${emp.ACCESS_ROLE},`
            }
        })
    })
    if (getRoleName.endsWith(",")) {
        getRoleName = getRoleName.slice(0, -1);
    }
    if (getRoleId.endsWith(",")) {
        getRoleId = getRoleId.slice(0, -1);
    }
    if(eachUser.endsWith(",")){
        eachUser = eachUser.slice(0, -1);
    }
    let emailId = ""
    let teamMemName = $("#team_name_assign_team_" + teamNewId + " option:selected").text()
    
    console.log('eachUser save - ',eachUser)
    let user_details =
        '{ "ACCESS_LEVEL" : "' +
        accese_level +
        '", "Access":"' +
        accessData +
        '", "EDIT_ACCESS":"' +
        edit_access +
        '", "EMAIL_ID":"' +
        sessionName +
        '", "GROUP_NAME":"' +
        groupName +
        '", "USERNAME":"' +
        empName +
        '", "USER_ID":"' +
        empId +
        '"}';
    let accessDetails =
        '{ "USER_ID" : "' +
        getSelectedTeamName +
        '", "EMPLOYEE_NAME":"' +
        selectTeamName +
        '", "EMAIL_ID":"' +
        selectTeamEmail +
        '", "ROLE_ID":"' +
        getRoleId +
        '", "ACCESS_ON":"' +
        getRoleName +
        '"}';
    let updateTeamData = {
        user_details: "[" + user_details + "]",
        access_details: "[" + eachUser + "]",
        old_details: "[]"
    };
    let apiurl =  apiValue.url_ip + ":5006/assign_new_role_new"
    $.ajax({
        url: apiurl,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        data: JSON.stringify(updateTeamData),
        success: function (json) {
            console.log("adminRole3")
            if (json.Response == "Success") {
                toastr.options.timeOut = 2000; // 2s
                toastr.success(json.Message);
                $("#team_member_name_" + teamNewId).append($("#team_name_assign_team_" + teamNewId + " option:selected").text())
                $("#team_member_name_" + teamNewId).show()
                $("#team_role_assign_team_" + teamNewId).val(getSelectedRoleName).trigger('change.select2');
                $("#s2id_team_role_assign_team_" + teamNewId).hide()
                $("#s2id_team_name_assign_team_" + teamNewId).hide()
                $("#" + teamNewId + "_role_button_data").show()
                let roleNameOpt = getRoleName.split(",");
                let roleTxt = ""
                $.each(roleNameOpt, function (j, role) {
                    roleTxt += `<button class="skill_data">${role}</button>`
                });
                $("#" + teamNewId + "_role_button_data").empty()
                $("#" + teamNewId + "_role_button_data").append(roleTxt)
                // location.reload();
            } else {
                toastr.options.timeOut = 2000; // 2s
                toastr.error(json.Message);
            }
        },
        error: function (error) {
            toastr.options.timeOut = 2000; // 2s
            toastr.error("Message error" + JSON.stringify(error));
            // $("#sow_edit").show();
        }
    });
}

// Write on keyup event of keyword input element
function searchTeamData(){
    var searchText = $("#team_role").val().toLowerCase();
    let selectedVal = $("input[type='radio'][name='emp_radio']:checked").val();
    if (selectedVal == "Role") {
        if ($.fn.DataTable.isDataTable("#role_table")) {
            $("#role_table").DataTable().search(searchText).draw();
        }
        return;
    }
    $.each($("#team_table tbody tr"), function () {
        if ($(this).text().toLowerCase().indexOf(searchText) === -1)
            $(this).hide();
        else
            $(this).show();
    });
}
