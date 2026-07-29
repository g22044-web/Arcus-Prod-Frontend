
var empAllData = [];
var empIndData = [];
var empUsData = [];
var skill_data_option = "";
var FilteredNewJson = [];
function getEmpData() {
    var empData = [];
    let status = "";
    let endDate = "";
    $.ajax({
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: {
            query_type : "all_employees_skills_new_UI",
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        },
        success: function (data) {
            empAllData = data;
            $.each(empAllData, function (i, empData) {
                if (empData.LOCATION == "India") {
                    empIndData = empData.EMPLOYEE_DATA;
                }
                if (empData.LOCATION == "US") {
                    empUsData = empData.EMPLOYEE_DATA;
                }
            });
            empAllData = [...empIndData, ...empUsData];
            getEmpDataTable(empAllData);
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

// Add remove loading class on body element depending on Ajax request status
$(document).on({
    ajaxStart: function () {
        $("body").addClass("loading");
    },
    ajaxStop: function () {
        $("body").removeClass("loading");
    }
});

let empNameOptions = "";
let empNameUsOptions = "";
let jobNameOptions = "";
let jobNameUsOptions = "";
let managerOptions = "";
let managerUsOptions = "";
let locationOptions = "";
let functionOptions = "";
let custNameOptions = "";
let billingOptions = "";
let filterJsonData = [];
let jobNameArray_IND = [], jobNameArray_US = [], managerNameArray_IND = [], managerNameArray_US = [], functionArray = [];
let empNameArray_IND = [], empNameArray_US = [], custNameArray = [], billArray = [], locationArray = [];
let checkValue = 0;
function getEmpDataTable(emp) {
    $('#emp_table tbody').empty();
    $('#emp_table').dataTable().fnClearTable();
    $('#emp_table').dataTable().fnDestroy();
    for (var i = 0;i < emp.length;i++) {
        let emp_skills = emp[i].SKILLS_LEVEL;
        let emp_skill_data = "";
        let emp_skill_hide_data = "";
        $.each(emp_skills, function (value, skills) {
            emp_skill_data += `<button class="skill_data">${skills}</button>`
            emp_skill_hide_data += `${skills}, `
        });
        let BillingHover = "";
        var row = $('<tr><td>' + emp[i].EMPLOYEE_ID + '</td><td>' +
            emp[i].EMPLOYEE_NAME + '</td><td>' +
            emp[i].JOB_ROLE + '</td><td>' +
            (emp[i].MANAGER_NAME == null ? "" : emp[i].MANAGER_NAME) + '</td><td>' +
            emp[i].COUNTRY + '</td><td>' +
            emp[i].DEPARTMENT + '</td><td>' +
            (emp[i].ACCOUNT_NAME == null ? "" : emp[i].ACCOUNT_NAME) + '</td><td data-title="' + BillingHover + '">' +
            (emp[i].BILLING_STATUS == null ? "" : emp[i].BILLING_STATUS) + '</td><td>' +
            (emp[i].IN_NOTICE_PERIOD == "YES" ? "In Notice Period" : "Active") + '</td><td style="display: none">' +
            (emp[i].PROJECT_ALLOCATION_START_DATE == null ? "" : convert(emp[i].PROJECT_ALLOCATION_START_DATE)) + '</td><td style="display: none">' +
            (emp[i].PROJECT_ALLOCATION_END_DATE == null ? "" : convert(emp[i].PROJECT_ALLOCATION_END_DATE)) + '</td><td class="more">' +
            emp_skill_data + '</td><td style="display: none">' +
            emp_skill_hide_data + '</td><td><button class="btn btn-info" id="employee_full_details" style="margin: 10px;" onclick="getEmpProfileData(this)">View All</button></td></tr>');

        $('#emp_table').append(row);
    }
    $('#emp_table').dataTable({
        "pageLength": 50,
        "columnDefs": [
            { "orderable": false, "targets": [10, 11, 12] },
            { "orderable": true, "targets": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }
        ]
    });
}

function getIndUsEmpData() {
    var selectedVal = "";
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    if (selectedVal == "IND") {
        filterJsonData = [];
        getEmpDataTable(empIndData);
        $('#nameSelect').empty();
        $("#nameSelect").append(empNameOptions);
        $('#jobSelect').empty();
        $("#jobSelect").append(jobNameOptions);
        $('#repMangSelect').empty();
        $("#repMangSelect").append(managerOptions);
        $("#locatSelect").empty();
        $("#locatSelect").append(`<option class="emp_option" value="India">India</option>`);
        $("#funSelect").empty();
        $("#funSelect").append(functionOptions);
        $("#custSelect").empty();
        $("#custSelect").append(custNameOptions);
        $("#billSelect").empty();
        $("#billSelect").append(billingOptions);
        $("#skillSelect").empty();
        $("#skillSelect").append(skill_data_option);
        $("#skillLevelSelect").empty();
        $("#skillLevelSelect").append(`<option value="R1">R1</option><option value="R2">R2</option><option value="R3">R3</option>`);
        callMultiselectOption();
    } else if (selectedVal == "US") {
        filterJsonData = [];
        getEmpDataTable(empUsData);
        $('#nameSelect').empty();
        $("#nameSelect").append(empNameUsOptions);
        $('#jobSelect').empty();
        $("#jobSelect").append(jobNameUsOptions);
        $('#repMangSelect').empty();
        $("#repMangSelect").append(managerUsOptions);
        $("#locatSelect").empty();
        $("#locatSelect").append(`<option class="emp_option" value="US">US</option><option class="emp_option" value="Canada">Canada</option>`);
        $("#funSelect").empty();
        $("#funSelect").append(functionOptions);
        $("#custSelect").empty();
        $("#custSelect").append(custNameOptions);
        $("#billSelect").empty();
        $("#billSelect").append(billingOptions);
        $("#skillSelect").empty();
        $("#skillSelect").append(skill_data_option);
        $("#skillLevelSelect").empty();
        $("#skillLevelSelect").append(`<option value="R1">R1</option><option value="R2">R2</option><option value="R3">R3</option>`);
        callMultiselectOption();
    } else if (selectedVal == "ALL") {
        filterJsonData = [];
        getEmpDataTable(empAllData);
        $('#nameSelect').empty();
        $("#nameSelect").append(empNameOptions);
        $("#nameSelect").append(empNameUsOptions);
        $('#jobSelect').empty();
        $("#jobSelect").append(jobNameOptions);
        $("#jobSelect").append(jobNameUsOptions);
        $('#repMangSelect').empty();
        $("#repMangSelect").append(managerOptions);
        $("#repMangSelect").append(managerUsOptions);
        $("#locatSelect").empty();
        $("#locatSelect").append(`<option class="emp_option" value="India">India</option><option class="emp_option" value="US">US</option><option class="emp_option" value="Canada">Canada</option>`);
        $("#funSelect").empty();
        $("#funSelect").append(functionOptions);
        $("#custSelect").empty();
        $("#custSelect").append(custNameOptions);
        $("#billSelect").empty();
        $("#billSelect").append(billingOptions);
        $("#skillSelect").empty();
        $("#skillSelect").append(skill_data_option);
        $("#skillLevelSelect").empty();
        $("#skillLevelSelect").append(`<option value="R1">R1</option><option value="R2">R2</option><option value="R3">R3</option>`);
        callMultiselectOption();
    }
}

function getEmpSkillOptions() {
    $.ajax({
        url: apiValue.url,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: {
            query_type: "all_skills",
            "db_name": apiValue.db_name,
            "environment": apiValue.environment
        },
        success: function (data) {
            $.each(data.Details, function (value, skillsData) {
                skill_data_option += '<option value="' + skillsData.SKILL_NAME + '">' + skillsData.SKILL_NAME + '</option>';
            });
            jobNameArray_IND = data.IND_ROLES.filter(function (el) { return el != null; });
            jobNameArray_US = data.US_ROLES.filter(function (el) { return el != null; });
            managerNameArray_IND = data.IND_MANG.filter(function (el) { return el != null; });
            managerNameArray_US = data.US_MANG.filter(function (el) { return el != null; });
            functionArray = data.FUNCTIONS.filter(function (el) { return el != null; });
            empNameArray_IND = data.IND_EMP_NAME.filter(function (el) { return el != null; });
            empNameArray_US = data.US_EMP_NAME.filter(function (el) { return el != null; });
            custNameArray = data.CUSTOMERS.filter(function (el) { return el != null; });
            billArray = data.BILLING_STATUS.filter(function (el) { return el != null; });
            for (let i = 0;i < empNameArray_IND.length;i++) {
                empNameOptions += `<option class="emp_option" value="${empNameArray_IND[i]}">${empNameArray_IND[i]}</option>`;
            }
            for (let i = 0;i < empNameArray_US.length;i++) {
                empNameUsOptions += `<option class="emp_option" value="${empNameArray_US[i]}">${empNameArray_US[i]}</option>`;
            }
            for (let i = 0;i < jobNameArray_IND.length;i++) {
                jobNameOptions += `<option class="emp_option" value="${jobNameArray_IND[i]}">${jobNameArray_IND[i]}</option>`;
            }
            for (let i = 0;i < jobNameArray_US.length;i++) {
                jobNameUsOptions += `<option class="emp_option" value="${jobNameArray_US[i]}">${jobNameArray_US[i]}</option>`;
            }
            for (let i = 0;i < managerNameArray_IND.length;i++) {
                managerOptions += `<option class="emp_option" value="${managerNameArray_IND[i]}">${managerNameArray_IND[i]}</option>`;
            }
            for (let i = 0;i < managerNameArray_US.length;i++) {
                managerUsOptions += `<option class="emp_option" value="${managerNameArray_US[i]}">${managerNameArray_US[i]}</option>`;
            }
            for (let i = 0;i < functionArray.length;i++) {
                functionOptions += `<option class="emp_option" value="${functionArray[i]}">${functionArray[i]}</option>`;
            }
            for (let i = 0;i < custNameArray.length;i++) {
                custNameOptions += `<option class="emp_option" value="${custNameArray[i]}">${custNameArray[i]}</option>`;
            }
            for (let i = 0;i < billArray.length;i++) {
                billingOptions += `<option class="emp_option" value="${billArray[i]}">${billArray[i]}</option>`;
            }
            $("#skillSelect").append(skill_data_option);
            $("#nameSelect").append(empNameOptions);
            $("#nameSelect").append(empNameUsOptions);
            $("#jobSelect").append(jobNameOptions);
            $("#jobSelect").append(jobNameUsOptions);
            $("#repMangSelect").append(managerOptions);
            $("#repMangSelect").append(managerUsOptions);
            $("#locatSelect").append(`<option class="emp_option" value="India">India</option><option class="emp_option" value="US">US</option><option class="emp_option" value="Canada">Canada</option>`);
            $("#funSelect").append(functionOptions);
            $("#custSelect").append(custNameOptions);
            $("#billSelect").append(billingOptions);
            callMultiselectOption();
        },
        error: function (error) {
            console.log('message Error' + JSON.stringify(error));
        }
    });
}


$(function () {
    $("#skillSelect").change(function () {
        filterData();
    });

    $("#nameSelect").change(function () {
        filterData();
    });

    $("#jobSelect").change(function () {
        filterData();
    });

    $("#repMangSelect").change(function () {
        filterData();
    });

    $("#locatSelect").change(function () {
        filterData();
    });

    $("#funSelect").change(function () {
        filterData();
    });

    $("#custSelect").change(function () {
        filterData();
    });

    $("#billSelect").change(function () {
        filterData();
    });

    $("#skillLevelSelect").change(function () {
        filterData();
    });
    $("#status").change(function () {
        filterData();
    });
});

function filterData() {
    const nameSelectArray = $("#nameSelect").val();
    const jobSelectArray = $("#jobSelect").val();
    const managerSelectArray = $("#repMangSelect").val();
    const locSelectArray = $("#locatSelect").val();
    const funSelectArray = $("#funSelect").val();
    const custSelectArray = $("#custSelect").val();
    const billSelectArray = $("#billSelect").val();
    const FilteredNewJson = $("#skillSelect").val();
    const LevelFilterData = $("#skillLevelSelect").val();
    const statusArray = $("#status").val();
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    let filterJsonData = []
    if (selectedVal == "IND") {
        filterJsonData = Object.assign([], empIndData);
    } else if (selectedVal == "US") {
        filterJsonData = Object.assign([], empUsData);
    } else if (selectedVal == "ALL") {
        filterJsonData = Object.assign([], empAllData);
    }
    let newJson = filterJsonData;
    if (FilteredNewJson.length > 0 && LevelFilterData.length > 0) {
        newJson = newJson.filter(d => {
            const obj = FilteredNewJson.find(f => d.ALL_SKILLS.indexOf(f) != -1
                && (LevelFilterData.length == 0 ? true :
                    LevelFilterData.some(ff => d.SKILL_DATA.map(dd => dd.SKILL + ' - ' + dd.LEVEL)
                        .indexOf(f + ' - ' + ff) != -1)));
            return obj ? true : false;
        })

    } else if (FilteredNewJson.length > 0) {
        newJson = newJson.filter(d => {
            const obj = FilteredNewJson.find(f => d.ALL_SKILLS.indexOf(f) != -1);
            return obj ? true : false;
        })

    } else if (LevelFilterData.length > 0) {
        newJson = newJson.filter(d => {
            const obj = LevelFilterData.find(f => d.SKILL_DATA.map(sk => sk.LEVEL).indexOf(f) != -1);
            return obj ? true : false;
        })
    }
    if (nameSelectArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = nameSelectArray.find(f => d.EMPLOYEE_NAME == f);
            return obj ? true : false;
        })
    }
    if (jobSelectArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = jobSelectArray.find(f => d.JOB_ROLE == f);
            return obj ? true : false;
        })
    }
    if (managerSelectArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = managerSelectArray.find(f => d.MANAGER_NAME == f);
            return obj ? true : false;
        })
    }
    if (locSelectArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = locSelectArray.find(f => d.COUNTRY == f);
            return obj ? true : false;
        })
    }
    if (funSelectArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = funSelectArray.find(f => d.DEPARTMENT == f);
            return obj ? true : false;
        })
    }
    if (custSelectArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = custSelectArray.find(f => d.ACCOUNT_NAME == f);
            return obj ? true : false;
        })
    }
    if (billSelectArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = billSelectArray.find(f => d.BILLING_STATUS == f);
            return obj ? true : false;
        })
    }
    if (statusArray.length > 0) {
        newJson = newJson.filter(d => {
            const obj = statusArray.find(f => d.IN_NOTICE_PERIOD == f);
            return obj ? true : false;
        })
    }
    getEmpDataTable(newJson);
}
function getArrayTrue() {
    let nameSelectArray = $("#nameSelect").val();
    let jobSelectArray = $("#jobSelect").val();
    let managerSelectArray = $("#repMangSelect").val();
    let locSelectArray = $("#locatSelect").val();
    let funSelectArray = $("#funSelect").val();
    let custSelectArray = $("#custSelect").val();
    let billSelectArray = $("#billSelect").val();
    let statusArray = $("#status").val();
    FilteredNewJson = $("#skillSelect").val();
    LevelFilterData = $("#skillLevelSelect").val();
    if (checkValue == 0) {
        if (nameSelectArray.length > 0) {
            checkValue = 1;
        } else if (jobSelectArray.length > 0) {
            checkValue = 2;
        } else if (managerSelectArray.length > 0) {
            checkValue = 3;
        } else if (locSelectArray.length > 0) {
            checkValue = 4;
        } else if (funSelectArray.length > 0) {
            checkValue = 5;
        } else if (custSelectArray.length > 0) {
            checkValue = 6;
        } else if (billSelectArray.length > 0) {
            checkValue = 7;
        } else if (statusArray.length > 0) {
            checkValue = 8;
        } else if (FilteredNewJson.length > 0) {
            checkValue = 9;
        }

    }
}

let tempFilterJson = [];
let customFilterJson = [];
function allFilterJsonData(selectedArray, type) {
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    if (filterJsonData.length == 0) {
        if (selectedVal == "IND") {
            filterJsonData = empIndData;
        } else if (selectedVal == "US") {
            filterJsonData = empUsData;
        } else if (selectedVal == "ALL") {
            filterJsonData = empAllData;
        }
    }
    if (type == "name") {
        if (checkValue == 1) {
            tempFilterJson = filterJsonData.filter(d => {
                const flag = selectedArray.some(f => d.EMPLOYEE_NAME.indexOf(f) != -1);
                return flag;
            })
            getEmpDataTable(tempFilterJson);
        } else {
            customFilterJson = tempFilterJson.filter(d => {
                const flag = selectedArray.some(f => d.EMPLOYEE_NAME.indexOf(f) != -1);
                return flag;
            })
            getEmpDataTable(customFilterJson);
        }
    }
    if (type == "job") {
        if (checkValue == 2) {
            tempFilterJson = filterJsonData.filter(d => {
                const flag = selectedArray.some(f => d.JOB_ROLE_ID.indexOf(f) != -1);
                return flag;
            })
            getEmpDataTable(tempFilterJson);
        } else {
            customFilterJson = tempFilterJson.filter(d => {
                const flag = selectedArray.some(f => d.JOB_ROLE_ID.indexOf(f) != -1);
                return flag;
            })
            if (selectedArray == 0) {
                getEmpDataTable(tempFilterJson);
            } else {
                getEmpDataTable(customFilterJson);
            }
        }
    }
    if (type == "manager") {
        if (checkValue == 3) {
            tempFilterJson = filterJsonData.filter(d => {
                const flag = selectedArray.some(f => d.REPORTING_MANAGER.indexOf(f) != -1);
                return flag;
            })
            getEmpDataTable(tempFilterJson);
        } else {
            customFilterJson = tempFilterJson.filter(d => {
                const flag = selectedArray.some(f => d.REPORTING_MANAGER.indexOf(f) != -1);
                return flag;
            })
            if (selectedArray == 0) {
                getEmpDataTable(tempFilterJson);
            } else {
                getEmpDataTable(customFilterJson);
            }
        }
    }
    if (type == "location") {
        if (checkValue == 4) {
            tempFilterJson = filterJsonData.filter(d => {
                const flag = selectedArray.some(f => d.LOCATION.indexOf(f) != -1);
                return flag;
            })
            getEmpDataTable(tempFilterJson);
        } else {
            customFilterJson = tempFilterJson.filter(d => {
                const flag = selectedArray.some(f => d.LOCATION.indexOf(f) != -1);
                return flag;
            })
            if (selectedArray == 0) {
                getEmpDataTable(tempFilterJson);
            } else {
                getEmpDataTable(customFilterJson);
            }
        }
    }
    if (type == "function") {
        if (checkValue == 5) {
            tempFilterJson = filterJsonData.filter(d => {
                const flag = selectedArray.some(f => d.FUNCTION.indexOf(f) != -1);
                return flag;
            })
            getEmpDataTable(tempFilterJson);
        } else {
            customFilterJson = tempFilterJson.filter(d => {
                const flag = selectedArray.some(f => d.FUNCTION.indexOf(f) != -1);
                return flag;
            })
            if (selectedArray == 0) {
                getEmpDataTable(tempFilterJson);
            } else {
                getEmpDataTable(customFilterJson);
            }
        }
    }
    if (type == "customer") {
        if (checkValue == 6) {
            tempFilterJson = filterJsonData.filter(d => {
                const flag = selectedArray.some(f => d.CUSTOMER_NAME.indexOf(f) != -1);
                return flag;
            })
            getEmpDataTable(tempFilterJson);
        } else {
            customFilterJson = tempFilterJson.filter(d => {
                const flag = selectedArray.some(f => d.CUSTOMER_NAME.indexOf(f) != -1);
                return flag;
            })
            if (selectedArray == 0) {
                getEmpDataTable(tempFilterJson);
            } else {
                getEmpDataTable(customFilterJson);
            }
        }
    }
    
    if (type == "billstatus") {
        if (checkValue == 7) {
            tempFilterJson = filterJsonData.filter(d => {
                const flag = selectedArray.some(f => d.BILLING_STATUS.indexOf(f) != -1);
                return flag;
            })
            getEmpDataTable(tempFilterJson);
        } else {
            customFilterJson = tempFilterJson.filter(d => {
                const flag = selectedArray.some(f => d.BILLING_STATUS.indexOf(f) != -1);
                return flag;
            })
            if (selectedArray == 0) {
                getEmpDataTable(tempFilterJson);
            } else {
                getEmpDataTable(customFilterJson);
            }
        }
    }
    if (type == "billstatus") {
        if (checkValue == 7) {
            tempFilterJson = filterJsonData.filter(d => {
                const flag = selectedArray.some(f => d.BILLING_STATUS.indexOf(f) != -1);
                return flag;
            })
            getEmpDataTable(tempFilterJson);
        } else {
            customFilterJson = tempFilterJson.filter(d => {
                const flag = selectedArray.some(f => d.BILLING_STATUS.indexOf(f) != -1);
                return flag;
            })
            if (selectedArray == 0) {
                getEmpDataTable(tempFilterJson);
            } else {
                getEmpDataTable(customFilterJson);
            }
        }
    }

    if (type == "status") {
        if (checkValue == 8) {
            tempFilterJson = filterJsonData.filter(d => {
                const flag = selectedArray.some(f => d.IN_NOTICE_PERIOD.indexOf(f) != -1);
                return flag;
            })
            getEmpDataTable(tempFilterJson);
        } else {
            customFilterJson = tempFilterJson.filter(d => {
                const flag = selectedArray.some(f => d.IN_NOTICE_PERIOD.indexOf(f) != -1);
                return flag;
            })
            if (selectedArray == 0) {
                getEmpDataTable(tempFilterJson);
            } else {
                getEmpDataTable(customFilterJson);
            }
        }
    }


    if (tempFilterJson.length == 0) {
        if (selectedVal == "IND") {
            filterJsonData = empIndData;
        } else if (selectedVal == "US") {
            filterJsonData = empUsData;
        } else if (selectedVal == "ALL") {
            filterJsonData = empAllData;
        }
    }
}

function skillFilter(FilteredNewJson, LevelFilterData) {
    var selectedVal = "";
    var selected = $("input[type='radio'][name='emp_radio']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    if (FilteredNewJson.length > 0) {
        if (filterJsonData.length == 0) {
            if (selectedVal == "IND") {
                filterJsonData = empIndData;
            } else if (selectedVal == "US") {
                filterJsonData = empUsData;
            } else if (selectedVal == "ALL") {
                filterJsonData = empAllData;
            }
        }

        if (selectedVal == "IND") {
            let newFilJson = [];
            if (LevelFilterData.length > 0) {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1
                            && (LevelFilterData.length == 0 ? true : LevelFilterData.some(ff => d.SKILL_DATA.map(dd => dd.SKILL + ' - ' + dd.LEVEL).indexOf(f + ' - ' + ff) != -1));
                        return innerFlag;
                    });
                    return flag;
                })
            } else {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1;
                        return innerFlag;
                    });
                    return flag;
                })
            }
            getEmpDataTable(newFilJson);
        } else if (selectedVal == "US") {
            let newFilJson = [];
            if (LevelFilterData.length > 0) {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1
                            && (LevelFilterData.length == 0 ? true : LevelFilterData.some(ff => d.SKILL_DATA.map(dd => dd.SKILL + ' - ' + dd.LEVEL).indexOf(f + ' - ' + ff) != -1));
                        return innerFlag;
                    });
                    return flag;
                })
            } else {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1;
                        return innerFlag;
                    });
                    return flag;
                })
            }
            getEmpDataTable(newFilJson);
        } else if (selectedVal == "ALL") {
            let newFilJson = [];
            if (LevelFilterData.length > 0) {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1
                            && (LevelFilterData.length == 0 ? true : LevelFilterData.some(ff => d.SKILL_DATA.map(dd => dd.SKILL + ' - ' + dd.LEVEL).indexOf(f + ' - ' + ff) != -1));
                        return innerFlag;
                    });
                    return flag;
                })
            } else {
                newFilJson = filterJsonData.filter(d => {
                    const flag = FilteredNewJson.some(f => {
                        const innerFlag = d.ALL_SKILLS.indexOf(f) != -1;
                        return innerFlag;
                    });
                    return flag;
                })
            }
            getEmpDataTable(newFilJson);
        }
    } else {

        if (selectedVal == "IND") {
            getEmpDataTable(empIndData)
        } else if (selectedVal == "US") {
            getEmpDataTable(empUsData)
        } else if (selectedVal == "ALL") {
            getEmpDataTable(empAllData)
        }
    }
}

function uniqueArray(arrayData) {
    let uniqueListArray = arrayData.filter((c, index) => {
        return arrayData.indexOf(c) === index;
    });
    return uniqueListArray;
}

function callMultiselectOption() {
    $('#skillSelect').multiselect({
        columns: 1,
        placeholder: 'Skills',
        search: true
    });
    $('#skillLevelSelect').multiselect({
        columns: 1,
        placeholder: 'Level',
        search: true
    });
    $('#startDate').multiselect({
        columns: 1,
        placeholder: 'Start Date',
        search: true
    });
    $('#endDate').multiselect({
        columns: 1,
        placeholder: 'End Date',
        search: true
    });
    $('#nameSelect').multiselect('reload');
    $('#nameSelect').multiselect({
        columns: 1,
        placeholder: 'Name',
        search: true
    });
    $('#jobSelect').multiselect('reload');
    $('#jobSelect').multiselect({
        columns: 1,
        placeholder: 'Job',
        search: true
    });
    $('#repMangSelect').multiselect('reload');
    $('#repMangSelect').multiselect({
        columns: 1,
        placeholder: 'Manager',
        search: true
    });
    $('#locatSelect').multiselect('reload');
    $('#locatSelect').multiselect({
        columns: 1,
        placeholder: 'Location',
        search: true
    });
    $('#funSelect').multiselect('reload');
    $('#funSelect').multiselect({
        columns: 1,
        placeholder: 'Function',
        search: true
    });
    $('#custSelect').multiselect('reload');
    $('#custSelect').multiselect({
        columns: 1,
        placeholder: 'Customer',
        search: true
    });
    $('#billSelect').multiselect('reload');
    $('#billSelect').multiselect({
        columns: 1,
        placeholder: 'Billing',
        search: true
    });
    $('#billSelect').multiselect('reload');
    $('#billSelect').multiselect({
        columns: 1,
        placeholder: 'Date',
        search: true
    });
    $('#status').multiselect('reload');
    $('#status').multiselect({
        columns: 1,
        placeholder: 'Status',
        search: true
    });
}


function tootTipRole(temp) {
    let emp_name = "";
    $.each(temp, function () {
        let role = "";
        let total = "";
        $.each(this, function (name, value) {

            if (name == "ROLE") {
                role = value;
                role = role.replace(/[_\s]/g, ' ');
            }
            if (name = "TOTAL") {
                total = value;
            }
        });
        if (total > 0) {
            emp_name = emp_name + `<li>${role} - ( ${total} )</li>`;
        }
    });
    return `<span class='spnTooltip'>
                    <ul>${emp_name}<ul>
              </span>`
}

function getEmpProfileData(obj) {
    var employee_id = $(obj).closest('tr').children('td:eq(0)').text();
    window.location.href = 'employee_profile.html';
}