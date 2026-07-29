$(document).ready(function () {
  $("#reportsBackBtnCustm").click(function () {
    window.location.href = "reportsDashboard.html";
    return false;
  });

  // Set dynamic year in YTD header
  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let fy = year % 100;
  $('#ytd_header_yr').text('YTD FY`' + fy);

  let apiurl = apiValue.url_ip + ":5003/us_bench_data";

  $.ajax({
    url: apiurl,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({}), // Modify payload if needed
    dataType: "json",
    success: function (response) {
      populateTable(response);
      $(".loader").hide();
      $(".show_page").show();
    },
    error: function (error) {
      console.error("Error fetching data:", error);
    },
  });

  function populateTable(data) {
    let formattedData = data.map((item) => ({
      employee_name: item.EMPLOYEE_NAME
        ? renderEmployeeCell(item.EMPLOYEE_NAME, item)
        : renderCell("-"),
      job_role: renderCell(item.JOB_ROLE),
      account_name: renderCell(item.ACCOUNT_NAME),
      sow_name: item.SOW_NAME
        ? renderClickableCell(item.SOW_NAME, item,'SOW')
        : renderCell("-"),
      billing_status: renderCell(item.BILLING_STATUS),
      legal_end_date: (() => {
        const rawDate = item.LEGAL_END_DATE?.split(" ")[0];
        return ((!rawDate || rawDate === "-" || rawDate === 'NaT' || rawDate === '' || rawDate.split("-").length !== 3)
          ? { display: renderCell("-", "text_align_center nowarp "), order: "0000-01-01" }
          : (() => {
            const [y, m, d] = rawDate.split("-");
            const formatted = `${m}-${d}-${y.slice(-2)}`;
            return {
              display: renderCell(formatted, "text_align_center nowarp "),
              order: rawDate
            };
          })());
      })(),
      investment_days: renderCell(item.INVESTMENT_DAYS ?? "-", "text_align_center"),
      bench_days: renderCell(item.BENCH_DAYS ?? "-", "text_align_center"),
      unbilled_days: renderCell(item.UNBILLED_DAYS ?? "-", "text_align_center"),
      manager_name: renderCell(item.MANAGER_NAME || "-"),
      delivery_head_name: renderCell(item.DELIVERY_HEAD_NAME || "-"),
      previous_account_name: renderCell(item.PREVIOUS_ACCOUNT_NAME || "-"),
      previous_sow_name: item.PREVIOUS_SOW_NAME
        ? renderClickableCell(item.PREVIOUS_SOW_NAME, item, 'PREVIOUS_SOW')
        : renderCell("-"),
      flag: item.FLAG // used for logic, not displayed
    }));

    const usBenchTable = $("#UsEmployeeTable").DataTable({
      destroy: true,
      data: formattedData,
      columns: [
        { data: "employee_name", orderable: true },
        { data: "job_role", orderable: true },
        { data: "account_name", orderable: true },
        { data: "sow_name", orderable: true },
        { data: "billing_status", orderable: true },
        {
          data: "legal_end_date",
          render: (data, type) => type === 'sort' ? data.order : data.display,
          orderable: true,
          defaultContent: "-"
        },
        { data: "investment_days", orderable: true },
        { data: "bench_days", orderable: true },
        { data: "unbilled_days", orderable: true },
        { data: "manager_name", orderable: true },
        { data: "delivery_head_name", orderable: true },
        { data: "previous_account_name", orderable: true },
        { data: "previous_sow_name", orderable: true },
        { data: "flag", visible: false }
      ],
      responsive: true,
      paging: false,
      searching: true,
      order: [[5, "asc"]], // Sorting by LEGAL_END_DATE asc
      ordering: true,
      info: false,
      autoWidth: false,
      dom: "frt",
      initComplete: function () {
        const wrapper = $("#UsEmployeeTable_wrapper");
        const toolbar = $("#usBenchToolbarControls");
        const filter = wrapper.find(".dataTables_filter");

        filter.find("label").contents().filter(function () {
          return this.nodeType === 3;
        }).remove();
        filter.find("input").attr("placeholder", "Search");
        filter.find("input").attr("aria-label", "Search");

        toolbar.empty();
        toolbar.append(filter);
      },
      createdRow: function (row, data, index) {
        const billingStatus = $(row).find('td').eq(4).text(); // BILLING_STATUS column
        const firstTd = $(row).find("td").eq(0); // EMPLOYEE_NAME
        const nameChip = firstTd.find(".table_row_bg");

        if (billingStatus.includes("Bench")) {
          nameChip.addClass("highlight-bench");
        } else if (billingStatus.includes("Investment")) {
          nameChip.addClass("highlight-investment");
        }
      },
    });
  }
});

function sowAccDetails(obj, type) {
  let idData = $(obj).attr("data-id");
  let idClickSoruce = $(obj).attr("data-id1");
  let tempArr = JSON.parse(idData);
  let uniqId_sowid = tempArr.UNIQUE_ID + "&" + tempArr.SOW_ID;
  if(type == 'PREVIOUS_SOW') uniqId_sowid = tempArr.PREVIOUS_UNIQUE_ID + "&" + tempArr.PREVIOUS_SOW_ID
  localStorage.setItem("sowBackBtnNav", "usBenchList");
  window.open('sow.html?'+uniqId_sowid, '_blank');
}

function getEmpProfileData(obj) {
  let idData = $(obj).attr("data-id");
  console.log("idData", idData);
  let idClickSoruce = "usBenchList";
  let tempArr = JSON.parse(idData);
  console.log("tempArr", tempArr);
  localStorage.setItem("employee_id_data", tempArr.EMPLOYEE_ID);
  localStorage.setItem("employee_email_data", tempArr.EMAIL_ID);
  localStorage.setItem("sow-click-source", idClickSoruce);
  window.open("employeeExperience.html", "_blank");
  // window.location.href = "team-profile.html";
}

function renderCell(content, extraClass = "", order = null) {
  return `<div class='table_row_bg ${extraClass}' ${order ? `data-order="${order}"` : ''}>${content}</div>`;
}

function renderClickableCell(content, data, type) {
  const isBench = content === "Bench";
  return `<div class='sow_data_name_all table_row_bg'
              ${!isBench ? `onclick='sowAccDetails(this, "${type}")'` : ""}
              ${!isBench ? `data-id='${JSON.stringify(data)}'` : ""}
              style="cursor: ${!isBench ? "pointer" : "default"}; ${
    !isBench ? "color: #006eff;" : ""
  }">
            ${content}
          </div>`;
}

function renderEmployeeCell(content, data) {
  return `<div class='table_row_bg' onclick='getEmpProfileData(this)' data-id='${JSON.stringify(
    data
  )}' style="cursor:pointer;color: #006eff;">
      ${content}
    </div>`;
}
