let teamRoleData = [], getRoleData = [], teamNameHtmlOpt = "", teamIdList = [], all_module_list = [], all_module_html = [], page_check_access = [];
let role_access_old_data,team_old_list,teamNamesList;
let apiurl = apiValue.url_ip + ":5006/authentication"
$(document).ready(function () {
    getRoleData = localStorage.getItem("selected-role-data")
    teamRoleData = JSON.parse(localStorage.getItem("team-role-data"))
    teamNamesList = teamRoleData.ALL_USERS
    all_module_list = teamRoleData.ALL_MODULE_LST;
    $("#update_role_data").hide()
    $("#create_role_data").hide()
    if (getRoleData != "") {
        getRoleData = JSON.parse(getRoleData)
    }
    $.each(teamNamesList, function (i, teamNames) {
        teamNameHtmlOpt += `<option value="${teamNames.EMPLOYEE_ID}">${teamNames.EMPLOYEE_NAME}</option>`
    })
    $.each(getRoleData.ACCESS_ROLE_DATA, function (j, teamRole) {
        teamIdList.push(teamRole.EMPLOYEE_ID)
    });
    $(".show_page").show();
    $("#role_name").val(getRoleData.ACCESS_ROLE)
    $("#role_desc").val(getRoleData.DESCRIPTION)
    all_module_html = teamRoleData.all_modules_html
    createAllModulesView(all_module_list)
    $("#team_names_id").append(teamNameHtmlOpt)
    $("#team_names_id").select2({});
    team_old_list = teamIdList
    $("#team_names_id").val(teamIdList).trigger('change');
    if (getRoleData != "") {
        $('#team_names_id').select2("enable",false)
        $("#role_name").prop('disabled', true);
    }

    $('#admin_role_back').click(function () {
        window.location.href = 'admin.html';
        return false;
    });

    $('.all_select_view').on('change', function(){
        if($(".all_select_view:checked").length == $(".all_select_view").length){
            $('#All_view').prop('checked',true);
        }else{
            $('#All_view').prop('checked',false);
        }
    });
    $('.all_select_edit').on('change', function(){
        if($(".all_select_edit:checked").length == $(".all_select_edit").length){
            $('#All_edit').prop('checked',true);
        }else{
            $('#All_edit').prop('checked',false);
        }
    });
    $('.all_select_delete').on('change', function(){
        if($(".all_select_delete:checked").length == $(".all_select_delete").length){
            $('#All_delete').prop('checked',true);
        }else{
            $('#All_delete').prop('checked',false);
        }
    });
});

function createAllModulesView(all_module_list) {
    let moduleHtml_1 = "",moduleHtml_2 = "",moduleHtml_3 = "";
    $.each(all_module_list, function (i, modulesList) {
        if (modulesList != "All") {
            let modulesListTemp = modulesList.toLowerCase().trim();
            let checkFilter = all_module_html.filter((check) => { 
                let checkName = (check.PAGE).toLowerCase().trim()
                return checkName == modulesListTemp
            })
            let avail_acc = checkFilter[0].AVAILABLE_ACCESS
            let module_page_name = checkFilter[0].MODULE_DATA
            let accChecBox = avail_acc.split(",")
            let accChecBoxLen = accChecBox.length
            let view = "", edit= "", deletecheck = "";
            let className = modulesList.replace(/ /g,"_")
            $.each(module_page_name, function(l, box){
                switch(box.ACCESS_TYPE){
                    case "view":
                        view = `<label class="col-sm-2 checkbox-inline">
                        <input class="all_select_view status_change ${className}" id="${className}_view" type="checkbox" data-id="${box.PAGE_END_POINT}" value="${box.ACCESS_TYPE}">View</label>`
                    break;
                    case "view,edit":
                        edit = `<label class="col-sm-2 checkbox-inline">
                        <input class="all_select_edit status_change ${className}" id="${className}_edit" type="checkbox" data-id="${box.PAGE_END_POINT}" value="${box.ACCESS_TYPE}">Edit</label>`
                    break;
                    case "view,edit,delete":
                        deletecheck = `<label class="col-sm-2 checkbox-inline">
                        <input class="all_select_delete status_change ${className}" id="${className}_delete" type="checkbox" data-id="${box.PAGE_END_POINT}" value="${box.ACCESS_TYPE}">Delete</label>`
                    break;
                }
            })
            if(accChecBoxLen == 1){
                moduleHtml_1 += `<div class="form-group col-sm-6">
                                    <div class="form-group">
                                    <label class="col-sm-4 module_name" id="${className}_main">${modulesList}</label>
                                        ${view}${edit}${deletecheck}                           
                                    </div>
                                </div>`
            }else if(accChecBoxLen == 2){
                moduleHtml_2 += `<div class="form-group col-sm-6">
                                    <div class="form-group">
                                    <label class="col-sm-4 module_name" id="${className}_main">${modulesList}</label>
                                        ${view}${edit}${deletecheck}
                                    </div>
                                </div>`
            }else if(accChecBoxLen == 3){
                moduleHtml_3 += `<div class="form-group col-sm-6">
                                    <div class="form-group">
                                    <label class="col-sm-4 module_name" id="${className}_main">${modulesList}</label>
                                        ${view}${edit}${deletecheck}
                                    </div>
                                </div>`
            }
        }
    })
    $("#all_modules_list").append(moduleHtml_3 + moduleHtml_2 + moduleHtml_1)
    assignModuleRoles(getRoleData.ACCESS_PAGE_DATA)
}

const selectAllView = () => {
    if($("#All_view").is(":checked")){
        $(".all_select_view").prop('checked', true);
    }else{
        $(".all_select_view").prop('checked', false);
    }
}

const selectAllEdit = () => {
    if($("#All_edit").is(":checked")){
        $(".all_select_edit").prop('checked', true);
    }else{
        $(".all_select_edit").prop('checked', false);
    }
}

const selectAllDelete = () => {
    if($("#All_delete").is(":checked")){
        $(".all_select_delete").prop('checked', true);
    }else{
        $(".all_select_delete").prop('checked', false);
    }
}

const assignModuleRoles = (roleData) => {
    $.each(roleData, function(i, roleAccess){
        let page = roleAccess.PAGE
        let page1st = (roleAccess.PAGE_lst).replace(/ /g,"_");
        let accessType = roleAccess.ALL_ACCESS_TYPE
        access_level = roleAccess.ACCESS_LEVEL
        let moduleRoleId = (roleAccess.PAGE_lst).replace(/ /g,"_")+"_"+roleAccess.ALL_ACCESS_TYPE
        if(roleAccess.FLAG == "yes") $("#"+moduleRoleId).prop('checked',true)
    })
    if (getRoleData != "") {
        editEnable()
        updateUserData("onload")
        $("#update_role_data").show()
    }else if(getRoleData == ""){
        $('#team_names_id').select2("enable",false)
        $("#create_role_data").show()
    }

}

const role_edit_btn = (button) => {
    var x = $("#showhide");
    $(button).find("i").remove();
    if ($(button).text().trim() == "Edit") {
      $(button)
        .html($("<i/>", { class: "fa fa-pencil-square" }))
        .append(" Update");
      x.fadeIn();
    } else if($(button).text().trim() == "Update"){
      $(button)
        .html($("<i/>", { class: "fa fa-pencil-square-o" }))
        .append(" Edit");
      x.fadeOut();
      updateUserData();
    }
    editEnable();
}

const editEnable = () =>{
    let editStatus = $("#update_role_data").text().trim();
    if(editStatus == "Edit"){
        $("#role_desc").attr("disabled", true);
        $(".select2-choices").attr("disabled", true);
        $('#team_names_id').select2("enable",false);
        $(".status_change").attr("disabled", true);
    }else{
        $("#role_desc").attr("disabled", false);
        $(".select2-choices").attr("disabled", false);
        $('#team_names_id').select2("enable",true)
        $(".status_change").attr("disabled", false);
    }
}

const updateUserData = (obj) => {
    
    let roleAccessNewJson = "", accessModuleData = ""
    $.each(all_module_list, function(i, modulesList){
        let className = modulesList.replace(/ /g,"_");
        let classDataHtml = [], selectedVal = []
        $("."+className+":checkbox:checked").each(function() {
            classDataHtml.push($(this).attr("data-id"))
            selectedVal.push($(this).val())
       });
       let accessLevel = getRoleData.ACCESS_LEVEL
       
       if(obj == "create") accessLevel = ""
       if(classDataHtml.length >0){
           accessModuleData += modulesList+ ","
           roleAccessNewJson +=
                '{ "PAGE" : "' +
                modulesList +
                '", "ACCESS_LEVEL":"' +
                accessLevel +
                '", "ACCESS_TYPE":"' +
                selectedVal[(selectedVal.length)-1] +
                '", "ACCESS_PAGE":"' +
                classDataHtml[(classDataHtml.length)-1] +
                '", "ENVIRONMENT_ACCESS":"' +
                apiValue.environment +
                '", "ACTIVE_FLAG":"YES"},';
        }
    })
    roleAccessNewJson = removeComma(roleAccessNewJson)
    
    let newDataPageList = JSON.parse('[' + roleAccessNewJson + ']')
    accessModuleData = removeComma(accessModuleData)
    let getTeamList = removeDuplicatesfromArray($("#team_names_id").val())
    if(obj == "onload"){
        role_access_old_data = roleAccessNewJson     
    }else{
        console.log('role_access_old_data - ',role_access_old_data)
        let roleChangeStatus = "NO"    
        if(roleAccessNewJson != role_access_old_data){
            roleChangeStatus = "YES"
        }else if($("#role_desc").val() != getRoleData.DESCRIPTION ){
            roleChangeStatus = "YES"
        }
        if(role_access_old_data != undefined){
            let roleOldDataList = JSON.parse('[' + role_access_old_data + ']')
            // Filter `newDataPageList` to find items that are not in `roleOldDataList`
            let nonExistentInOld = roleOldDataList.filter(oldItem => {
                let matchingNewItem =!newDataPageList.some(newItem => newItem.PAGE === oldItem.PAGE)
                if (matchingNewItem) {
                    // Update ACTIVE_FLAG to "NO" if it exists in newDataPageList
                    oldItem.ACTIVE_FLAG = "NO";
                } else {
                    // Add to newDataPageList if PAGE does not exist in newDataPageList
                    newDataPageList.push({ ...oldItem, ACTIVE_FLAG: "NO" });
                }
                return matchingNewItem;
            });
    
            nonExistentInOld = JSON.stringify(nonExistentInOld)
            nonExistentInOld = nonExistentInOld.replace(/^\[|\]$/g, "");
            roleAccessNewJson += ',' + nonExistentInOld
        }
        let removedTeamMember = $(team_old_list).not(getTeamList).get();
        let addedTeamMember = $(getTeamList).not(team_old_list).get();
        let removedTeamJson = getTeamJsonData(removedTeamMember,"remove")
        let addedTeamJson = getTeamJsonData(addedTeamMember,"update")
        let oldTeamJson = getTeamJsonData(team_old_list,"")
        let commonTeamDataJson = ""
        if(removedTeamJson != "" && addedTeamJson != ""){
            commonTeamDataJson = removedTeamJson + "," + addedTeamJson
        }else if(removedTeamJson != ""){
            commonTeamDataJson = removedTeamJson
        }else if(addedTeamJson != ""){
            commonTeamDataJson = addedTeamJson
        }
        let roleDescpNew = "NO"
        
        if(commonTeamDataJson != "" || roleChangeStatus != "NO"){

            let userDetails =
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
            let oldDetails =
                '{ "ROLE_ID" : "' +
                getRoleData.ROLE_ID +
                '", "ACCESS_ROLE":"' +
                getRoleData.ACCESS_ROLE +
                '", "DESCRIPTION":"' +
                getRoleData.DESCRIPTION +
                '", "ACCESS_ON":"' +
                getRoleData.ACCESS_ON +
                '", "PAGE_ACCESS_DATA":[' +
                role_access_old_data +
                '], "ACCESS_ROLE_DATA":[' +
                oldTeamJson +        
                ']}';
            let role_id= getRoleData.ROLE_ID;
            let role_name = $("#role_name").val()
            if(obj == "create"){
                oldDetails = '{}'
                role_id = ""
            }

            let accessDetails =
                '{ "ROLE_ID" : "' +
                role_id +
                '", "ACCESS_ROLE":"' +
                role_name +
                '", "DESCRIPTION":"' +
                $("#role_desc").val() +
                '", "ACCESS_ON":"' +
                accessModuleData +
                '", "ROLE_MODIFIED":"' +
                roleChangeStatus +
                '", "PAGE_ACCESS_DATA":[' +
                roleAccessNewJson +
                '], "ACCESS_ROLE_DATA":[' +
                commonTeamDataJson +        
                ']}';
            
            let updateRoleData = {
                user_details: "[" + userDetails + "]",
                access_details: "" + accessDetails + "",
                old_details: "" + oldDetails + ""
            };
            let apiurl = apiValue.url_ip + ":5006/update_access_by_role_new"
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
                data: JSON.stringify(updateRoleData),
                success: function (json) {
                    if (json.Response == "Success") {
                    const endTime = performance.now();
                    const loadTimeInSeconds = (endTime - startTime) / 1000;
                    getApiTime(loadTimeInSeconds,"admin","Admin","update_access_by_role_new","success",fileName,"AdminPage","edit");    
                    toastr.options.timeOut = 2000; // 2s
                    toastr.success("Role Created Successfully");
                    window.location.href = 'admin.html';
                    } else {
                    toastr.options.timeOut = 2000; // 2s
                    toastr.error(json.Message);
                    }
                },
                error: function (error) {
                    const endTime = performance.now();
                    const loadTimeInSeconds = (endTime - startTime) / 1000;
                    getApiTime(loadTimeInSeconds,"admin","Admin","update_access_by_role_new","error",fileName,"AdminPage","edit");
                    toastr.options.timeOut = 2000; // 2s
                    toastr.error("Message error" + JSON.stringify(error));
                    // $("#sow_edit").show();
                },
            });
        }
    }
}

function removeDuplicatesfromArray(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}

getTeamJsonData = (teamList, opr) => {
    let emplist = [], selTeamData= [], status = ""
    $.each(teamList, function(j, selEmp){
        emplist = teamNamesList.filter((emp) => {
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
    $.each(selTeamData, function(k, emp){
        if(emp == undefined){
            empDetails = ""
        }else{
            empDetails += '{ "EMPLOYEE_ID" : "' +
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

const createUserData = () => {
    
}