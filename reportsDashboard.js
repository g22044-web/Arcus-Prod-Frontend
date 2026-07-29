const framework_report_list = async () => {
    let form_details = JSON.stringify({
        "environment": apiValue.environment
    });
    let data = await fetch(apiValue.url_ip + ":5007/get_report_list", {
        method: "POST",
        body: form_details
    })
    const framework_report_data = await data.json()
    let framework_report_list = framework_report_data.reports
    let report_div = ""
    framework_report_list.map(list => {
        $(".reporting_main_div").show()
        report_div += `<div class="sowAmtbyAccount reports_menu_style submenu_style col-sm-2" onclick='getFramework("${list}")'>
                            <div class="sowAccountBtn" >
                            ${list}
                            </div>
                        </div>`
    })
    $('.reporting_framework_div').append(report_div)
}