let dashboardDataStore = {};
let currentSort = { column: "RECENCY", direction: "asc" };
let currentFilter = "All";
let currentPeriod = "Daily";
let hidePopupTimer;
let filteredData = []; // Holds the currently displayed table data for popup access

// --- API CONFIG ---
const API_URLS = {
  home: apiValue.url_ip + ":5004/ceo_home_page",
  comments: apiValue.url_ip + ":5004/ceo_page_comment_details",
};

$(document).ready(function () {
  assignMetaValue();
  $("meta[name='google-signin-client_id']").attr("content", metaValue);
  getLocalSessionData();
  if (sessionName == null) {
    window.location.href = "index.html";
    return false;
  } else {
    let accessStatus = checkDashboardPageAccessData();
    if (accessStatus) {
      let accessLevel = checkEachPageAccess("Reports");
      if (accessLevel.length > 0) {
        let environment = accessLevel[0];
        if (environment == apiValue.environment) {
          let departmentName = localStorage.getItem("Department");
          let jobRole = localStorage.getItem('Job_Role');
          // Check if user is Vice President in Account Growth department
          if (departmentName === "Account Growth" && jobRole === "Vice President") {
            // Hide Daily and Monthly tabs
            $('.tabs .tab-item[data-period="Daily"]').hide();
            $('.tabs .tab-item[data-period="Monthly"]').hide();
            // Make Weekly active if not already
            $('.tabs .tab-item[data-period="Weekly"]').addClass('active');
          } else {
            $('.tabs .tab-item[data-period="Daily"]').show();
            $('.tabs .tab-item[data-period="Monthly"]').show();
          }
          // Ensure the plugin is registered with Chart.js
          initializeDashboard();
          // --- EVENT HANDLERS ---
          $(".tabs").on("click", ".tab-item", function () {
            const $this = $(this);
            if ($this.hasClass("active")) return;
            $(".tab-item").removeClass("active");
            $this.addClass("active");
            renderDashboard($this.data("period"));
          });

          $("#filter-pills-container").on("click", ".pill", function () {
            $("#filter-pills-container .pill").removeClass("active");
            $(this).addClass("active");
            currentFilter = $(this).data("filter");
            renderTable();
          });

          $("#details-table").on("click", "th", function () {
            const column = $(this).data("sort");
            if (!column) return;

            if (currentSort.column === column) {
              currentSort.direction =
                currentSort.direction === "asc" ? "desc" : "asc";
            } else {
              currentSort.column = column;
              currentSort.direction = "asc";
            }
            renderTable();
          });

          $("#quarterly-cards-container").on(
            "mouseenter",
            ".quarter-info-icon",
            (e) => {
              clearTimeout(hidePopupTimer);
              showQuarterlyPopup($(e.currentTarget).data("quarter-index"), e);
            }
          );
          $("#quarterly-cards-container").on(
            "mouseleave",
            ".quarter-info-icon",
            () => {
              hidePopupTimer = setTimeout(hideQuarterlyPopup, 300);
            }
          );
          $("#details-popup").on("mouseenter", () =>
            clearTimeout(hidePopupTimer)
          );
          $("#details-popup").on("mouseleave", hideQuarterlyPopup);
          $(".popup-close").on("click", hideQuarterlyPopup);

          $("#details-table tbody").on("click", ".comment-cell", function () {
            const rowIndex = $(this).data("row-index");
            const rowData = filteredData[rowIndex];
            showCommentPopup(rowData);
          });

          $(".comment-popup-close").on("click", hideCommentPopup);

          $(document).on("keydown", (event) => {
            if (event.key === "Escape") {
              hideCommentPopup();
              hideQuarterlyPopup();
            }
          });

          $(document).on("click", (event) => {
            const $popup = $("#comment-popup");
            if (
              $popup.hasClass("active") &&
              !$popup.is(event.target) &&
              $popup.has(event.target).length === 0 &&
              !$(event.target).closest(".comment-cell").length
            ) {
              hideCommentPopup();
            }
          });
          let userRole = localStorage.getItem("user-role");
          if (userRole == "admin") {
            $("#admin_dashboard").css("display", "flex");
          } else {
            $("#admin_dashboard").hide();
          }
        } else {
          window.location.href = "home.html";
        }
      } else {
        window.location.href = "home.html";
      }
    } else {
      window.location.href = "home.html";
    }
  }
  $(".new-sub-menu").hover(function () {
    $(".sub-menu").css("display", "");
  });
  $("#dashboard").click(function () {
    window.location.href = "home.html";
    return false;
  });
  $("#sow_Res_page").click(function () {
    localStorage.setItem("addRequest", true);
    localStorage.setItem("editRequest", false);
    window.location.href = "sowCreate.html";
    return false;
  });
  $("#userManual").click(function () {
    window.location.href = "RRESOWUserManual.html";
    return false;
  });
  $("#reportsBackBtnCustm").click(function () {
    window.location.href = "reportsDashboard.html";
    return false;
  });
  $("#logout").click(function () {
    localStorage.clear();

    window.location.href = "index.html";
    return false;
  });
  $('#admin_dashboard').click(function () {
    window.location.href = 'admin.html';
    return false;
  });
});

// $(document).ready(function () {
// --- GLOBAL STATE ---

// --- FORMATTING FUNCTIONS ---
function formatChange(value) {
  if (value === undefined || value === null) return "";
  const isPositive = value >= 0;
  const icon = isPositive ? "fa-arrow-up" : "fa-arrow-down";
  const colorClass = isPositive ? "positive" : "negative";
  return `<span class="${colorClass} change-val"><i class="fa-solid ${icon}"></i> ${Math.abs(
    value / 1_000_000
  ).toFixed(2)}</span>`;
}

function formatRevenue(value) {
  if (value === undefined || value === null) return "";
  return (value / 1_000_000).toFixed(2);
}

function formatPopupValue(value) {
  if (value === undefined || value === null) return "";
  const sign = value > 0 ? "+" : "";
  const colorClass = value >= 0 ? "positive" : "negative";
  return `<span class="${colorClass}">${sign}${(value / 1_000_000).toFixed(
    2
  )}</span>`;
}

function formatPopupChange(value) {
  if (value === undefined || value === null) return "";
  const sign = value > 0 ? "+" : "";
  const colorClass = value >= 0 ? "positive" : "negative";
  return `<span class="${colorClass}">${sign}${formatRevenue(
    Math.abs(value)
  )} $ mn</span>`;
}

function getTruncatedComment(html, maxLength = 150) {
  if (html === null || html === undefined) return "";

  if (Array.isArray(html)) {
    if (html.length > 1) {
      return html.map(item => {
        const div = document.createElement("div");
        div.innerHTML = item;
        let text = div.textContent || div.innerText || "";
        text = text.replace(/\s+/g, " ").trim();
        if (text.length > maxLength) {
          text = text.substring(0, maxLength - 3) + "...";
        }
        return `<div style="margin-bottom: 8px; border-left: 2px solid #2985C1; padding-left: 8px; line-height: 1.4;">${text}</div>`;
      }).join("");
    } else if (html.length === 1) {
      html = html[0];
    } else {
      return "";
    }
  }

  const div = document.createElement("div");
  div.innerHTML = html;
  let text = div.textContent || div.innerText || "";
  text = text.replace(/\s+/g, " ").trim();
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + "...";
  }
  return text;
}


// --- RENDER FUNCTIONS ---
function renderTable() {
  if (!dashboardDataStore[currentPeriod]) return;

  const tableData = dashboardDataStore[currentPeriod].tableData;
  const $tbody = $("#details-table tbody").empty();

  filteredData =
    currentFilter === "All"
      ? [...tableData]
      : tableData.filter((item) => item.ACCOUNT_NAME === currentFilter);

  if (filteredData.length === 0) {
    const noDataRow = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; font-size: 1rem; color: #888;">
                    <i class="fa-solid fa-circle-info" style="margin-right: 8px;"></i>
                    No changes found for ${dashboardDataStore[currentPeriod].detailsTitle}
                </td>
            </tr>`;
    $tbody.append(noDataRow);
    $("#total-revenue-change").hide();
    return;
  }

  $("#total-revenue-change").show();

  // Sorting logic
  filteredData.sort((a, b) => {
    let valA = a[currentSort.column];
    let valB = b[currentSort.column];

    if (currentSort.column === "RECENCY") {
      const extractDays = (val) => {
        const match = (val || "").match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 9999;
      };
      valA = extractDays(valA);
      valB = extractDays(valB);
    } else if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    let comparison = 0;
    if (valA > valB) comparison = 1;
    else if (valA < valB) comparison = -1;

    return currentSort.direction === "desc" ? comparison * -1 : comparison;
  });

  let totalChange = 0;
  filteredData.forEach((item, index) => {
    const changeClass = item.REVENUE_CHANGE >= 0 ? "positive" : "negative";
    const changeSign = item.REVENUE_CHANGE > 0 ? "+" : "";
    const row = `
        <tr data-sow-id="${item.SOW_ID}" data-unique-id="${item.UNIQUE_ID}">
            <td>${item.RECENCY ?? ""}</td>
            <td>${item.ACCOUNT_NAME ?? ""}</td>
            <td class="sow_name" onclick='sowAccDetails("${item.SOW_ID}", "${item.UNIQUE_ID}")' >${item.SOW_NAME ?? ""}</td>
            <td>${item.STATUS ?? ""}</td>
            <td>${item.FUNNEL ?? ""}</td>
            <td class="comment-cell" data-row-index="${index}">
                ${getTruncatedComment(item.COMMENT)}
            </td>
            <td class="${changeClass}">${changeSign}${formatRevenue(
      item.REVENUE_CHANGE
    )}</td>
        </tr>`;
    $tbody.append(row);
    totalChange += item.REVENUE_CHANGE ?? 0;
  });

  const totalChangeClass = totalChange >= 0 ? "positive" : "negative";
  const totalChangeSign = totalChange > 0 ? "+" : "";
  $("#total-revenue-change")
    .text(`TOTAL = ${totalChangeSign}${formatRevenue(totalChange)} $ mn`)
    .removeClass("positive negative")
    .addClass(totalChangeClass);

  updateSortIcons();
}

function renderDashboard(period) {
  // Check if user is Vice President in Account Growth department and period is not Weekly, prevent rendering
  let departmentName = localStorage.getItem("Department");
  let jobRole = localStorage.getItem('Job_Role');
  if (departmentName === "Account Growth" && jobRole === "Vice President" && period !== "Weekly") {
    // Force to Weekly if trying to render Daily or Monthly
    currentPeriod = "Weekly";
    renderDashboard("Weekly");
    return;
  }

  currentPeriod = period;
  currentFilter = "All";

  const data = dashboardDataStore[period];
  if (!data) {
    console.error(`No data available for period: ${period}`);
    return;
  }

  const recencyUnit = "RECENCY";
  $('#details-table th[data-sort="RECENCY"]').html(
    `${recencyUnit} <i class="fa-solid fa-sort"></i>`
  );

  const comparisonClass =
    data.projectedRevenue.comparison >= 0 ? "positive" : "negative";
  const comparisonIcon =
    data.projectedRevenue.comparison >= 0 ? "fa-arrow-up" : "fa-arrow-down";

  $("#overall-revenue-card").html(`
        <div class="title">OVERALL PROJECTED REVENUE</div>
        <div class="amount">$${formatRevenue(
    data.projectedRevenue.amount
  )} mn</div>
        <div class="comparison ${comparisonClass}">
            <i class="fa-solid ${comparisonIcon} icon"></i>
            $${Math.abs(data.projectedRevenue.comparison / 1_000_000).toFixed(
    2
  )} mn ${data.periodText}
        </div>
    `);

  const $qContainer = $("#quarterly-cards-container").empty();
  (data.quarterlyNotes || []).forEach((q, index) => {
    $qContainer.append(`
        <div class="card quarterly-card ${q.is_quarter_active == "NO" ? "quarterly-card-disabled" : ""
      }">
          <div class="q-header">
            <span>${q.title
      } - ${period.toUpperCase()} REVENUE NOTES ($ MN)</span>
            ${q.is_quarter_active == "NO" ? '' : `<i class="fa-solid fa-circle-info quarter-info-icon" data-quarter-index="${index}"></i>`}
          </div>
          <div class="q-body">
            <div class="q-row">
              <div class="q-col">
                <div class="q-label">Act/Proj:</div>
                <div class="q-value">${q.actlsProj.val < 0 ? "-" : ""
      }${formatRevenue(q.actlsProj.val)}  ${q.is_quarter_active == "NO" ? '' : formatChange(
        q.actlsProj.change
      )}</div>
              </div>
              <div class="q-col">
                <div class="q-label">Signed:</div>
                <div class="q-value">${q.signed.val < 0 ? "-" : ""
      }${formatRevenue(q.signed.val)} ${q.is_quarter_active == "NO" ? '' : formatChange(
        q.signed.change
      )}</div>
              </div>
            </div>
            <div class="q-row">
              <div class="q-col">
                <div class="q-label">70% Total:</div>
                <div class="q-value">${q.total70.val < 0 ? "-" : ""
      }${formatRevenue(q.total70.val)} ${q.is_quarter_active == "NO" ? '' : formatChange(
        q.total70.change
      )}</div>
              </div>
              <div class="q-col">
                <div class="q-label">vs OPI:</div>
                <div class="q-value">${q.vsOPI.val < 0 ? "-" : ""
      }${formatRevenue(q.vsOPI.val)} ${q.is_quarter_active == "NO" ? '' : formatChange(
        q.vsOPI.change
      )}</div>
              </div>
            </div>
          </div>
        </div>`);
  });

  $("#details-header").html(
    `<h2>${period} Revenue Details - <span>${data.detailsTitle}</span></h2>`
  );

  const $pillsContainer = $("#filter-pills-container").empty();
  const accountChanges = data.tableData.reduce((acc, item) => {
    if (
      !item.ACCOUNT_NAME ||
      item.REVENUE_CHANGE === null ||
      item.REVENUE_CHANGE === undefined
    )
      return acc;
    acc[item.ACCOUNT_NAME] =
      (acc[item.ACCOUNT_NAME] || 0) + item.REVENUE_CHANGE;
    return acc;
  }, {});

  const totalChange = Object.values(accountChanges).reduce(
    (sum, val) => sum + val,
    0
  );

  $pillsContainer.append(
    `<div class="pill all-accounts-pill active" data-filter="All">All Accounts = ${totalChange > 0 ? "+" : ""
    }${formatRevenue(totalChange)} $ mn</div>`
  );

  const orderMap = getAccountOrderMap();
  const $scrollWrap = $('<div class="account-pills-scroll"></div>');
  Object.entries(accountChanges)
    .sort((a, b) => {
      let nameA = a[0].toLowerCase().trim();
      let nameB = b[0].toLowerCase().trim();
      let orderA = orderMap[nameA];
      let orderB = orderMap[nameB];
      if (orderA !== undefined && orderB !== undefined) {
          return orderA - orderB;
      } else if (orderA !== undefined) {
          return -1;
      } else if (orderB !== undefined) {
          return 1;
      } else {
          return nameA.localeCompare(nameB);
      }
    })
    .forEach(([ACCOUNT_NAME, REVENUE_CHANGE]) => {
      if (!ACCOUNT_NAME) return;
      $scrollWrap.append(
        `<div class="pill" data-filter="${ACCOUNT_NAME}">${ACCOUNT_NAME} = ${REVENUE_CHANGE > 0 ? "+" : ""
        }${formatRevenue(REVENUE_CHANGE)} $ mn</div>`
      );
    });

  $pillsContainer.append($scrollWrap);
  // Conditionally apply margin if overflow-x is true
  updateAccountPillsScrollOverflowStyle();
  renderTable();
}

function updateSortIcons() {
  $("#details-table th").each(function () {
    const column = $(this).data("sort");
    const $icon = $(this).find(".fa-solid");
    if (column === currentSort.column) {
      $icon
        .removeClass("fa-sort fa-sort-up fa-sort-down")
        .addClass(
          currentSort.direction === "asc" ? "fa-sort-up" : "fa-sort-down"
        );
    } else {
      $icon.removeClass("fa-sort-up fa-sort-down").addClass("fa-sort");
    }
  });
}

// --- POPUP HANDLERS ---
function showQuarterlyPopup(quarterIndex, event) {
  const periodData = dashboardDataStore[currentPeriod];
  const qData = periodData.quarterlyNotes[quarterIndex];
  if (!qData || !qData.popupDetails) return;

  // Always set the popup title
  $("#popup-title").text(
    `${qData.title} - ${currentPeriod} Revenue Notes ($ mn)`
  );

  const $popupBody = $("#popup-body-content").empty();

  if (qData.popupDetails.length === 0) {
    // Show message when popupDetails is empty
    $popupBody.text("No updates");
  } else {
    const headers = [
      { key: "actlsProj", title: "Act/Proj" },
      { key: "signed", title: "Signed" },
      { key: "total70", title: "70% Total" },
      { key: "apBridge", title: "Act. Vs Proj." },
    ];

    headers.forEach((header) => {
      const $column = $(
        `<div class="popup-column"><div class="popup-col-header no-wrap">${header.title}</div></div>`
      );
      const $list = $('<div class="popup-col-list"></div>');
      qData.popupDetails.forEach((row) => {
        if (
          row[header.key] &&
          row[header.key].a !== null &&
          row[header.key].a !== undefined &&
          row[header.key].a !== ""
        ) {
          $list.append(
            `<div class="popup-col-list-item"><span>${row[header.key].a
            }</span>${formatPopupValue(row[header.key].v)}</div>`
          );
        }
      });
      $column.append($list);
      $popupBody.append($column);
    });
  }

  const popup = $("#details-popup");
  popup.css("display", "block");
  const { pageX, pageY } = event;
  const { innerWidth, innerHeight } = window;
  const { offsetWidth, offsetHeight } = popup[0];

  let top = pageY + 15;
  let left = pageX + 15;

  if (left + offsetWidth > innerWidth) left = pageX - offsetWidth - 15;
  if (top + offsetHeight > innerHeight) top = pageY - offsetHeight - 15;

  popup.css({ top, left });
}



function hideQuarterlyPopup() {
  clearTimeout(hidePopupTimer);
  $("#details-popup").hide();
}

function showCommentPopup(rowData) {
  if (!rowData) return;

  // Populate header immediately
  $("#comment-popup-account").text(rowData.ACCOUNT_NAME ?? "");
  $("#comment-popup-comment").html(getTruncatedComment(rowData.COMMENT));
  $("#comment-popup-change").html(formatPopupChange(rowData.REVENUE_CHANGE));

  // Show popup with loader and loading text
  const $body = $("#comment-popup-body-content").html(
    `<div class="table-loading" id="loading_div">
                <div class="loader-div">
                  <div class="loader-wheel-div"></div>
                  <div class="loader-text-div"></div>
                </div>
              </div>`
  );
  $("#comment-popup").addClass("active");

  // Fetch comment history
  fetch(API_URLS.comments, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sow_id: rowData.SOW_ID,
      unique_id: rowData.UNIQUE_ID,
    }),
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((apiResponse) => {
      $body.empty(); // Clear loader
      const commentHistory = apiResponse.SOW_NOTES;
      if (commentHistory && commentHistory.length > 0) {
        commentHistory.forEach((note) => {
          // Extract the first character of each word in COMMENTED_BY (up to 3 words)
          const words = note.COMMENTED_BY.split(" ");
          const notes_icon_text = words
            .slice(0, 3)
            .map((word) => word.substring(0, 1))
            .join("");
          if (!note || note.NOTES === null || note.NOTES === undefined) return;
          const noteHtml = `
                <div class="comment-note-entry">
                  <div class='notes_icon_div'>
                    <div class='notes_icon_text' data-fullname='${note.COMMENTED_BY
            }'>${notes_icon_text}</div>
                  </div>
                  <div class="comment-note-details">
                    <div class="comment-note-text">${formatCommentWithLineBreaks(
              note.NOTES
            )}</div>
                    <div class="comment-note-timestamp">${convertStringToLocalTimeAndAgo(note.COMMENTED_ON) ?? ""
            }</div>
                  </div>
                </div>`;
          $body.append(noteHtml);
        });
      } else {
        $body.html(
          '<div class="comment-note-entry"><div class="comment-note-details">No comment history available.</div></div>'
        );
      }
    })
    .catch((error) => {
      console.error("Error fetching comment details:", error);
      $body.html(
        '<div class="comment-note-entry"><div class="comment-note-details">Failed to load comments. Please try again.</div></div>'
      );
    });
}

function hideCommentPopup() {
  $("#comment-popup").removeClass("active");
}

function convertStringToLocalTimeAndAgo(timeString) {
  // Replace the space between date and time with 'T' to make it ISO-compliant
  const isoString = timeString.replace(" ", "T") + "Z"; // Add 'Z' to treat it as UTC

  // Parse the UTC date string into a Date object
  const utcDate = new Date(isoString);

  // Get the current date and time in the user's local time zone
  const currentDate = new Date();

  // Calculate the difference in milliseconds between the current date and the provided UTC date
  const diffInMs = currentDate - utcDate;

  // Convert the difference to seconds, minutes, hours, and days
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Determine the "time ago" part
  let timeAgoString;
  if (diffInSeconds >= 0 && diffInSeconds < 60) {
    timeAgoString = `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 0) {
    timeAgoString = `0 seconds ago`;
  } else if (diffInMinutes < 60) {
    timeAgoString = `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    timeAgoString = `${diffInHours} hours ago`;
  } else {
    timeAgoString = `${diffInDays} days ago`;
  }

  // Format the UTC date into the user's local time zone in the desired format
  const day = String(utcDate.getDate()).padStart(2, "0");
  const month = String(utcDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = String(utcDate.getFullYear()).slice(-2); // Get last 2 digits of the year
  const hours = utcDate.getHours() % 12 || 12; // Convert to 12-hour format
  const minutes = String(utcDate.getMinutes()).padStart(2, "0");
  const amPm = utcDate.getHours() >= 12 ? "PM" : "AM";
  const formattedDate = `${month}/${day}/${year} ${hours}:${minutes} ${amPm}`;

  // Return the formatted date with the "time ago" string
  return `${formattedDate} (${timeAgoString})`;
}

function formatCommentWithLineBreaks(comment) {
  // First, escape HTML to prevent XSS
  // let safeComment = escapeHtml(comment);
  // Then, replace the newline placeholder with actual line breaks
  return comment.replace(/{{newline}}/g, "<br>");
}

// --- INITIALIZATION ---
function initializeDashboard() {
  $(".loader").show();
  $(".admin-dashboard").hide();
  const $loadingOverlay = $("#loading-overlay");
  $loadingOverlay.show();
  let departmentName = localStorage.getItem("Department");
  const date = new Date();
  let userDesignation = localStorage.getItem("Job_Role");
  let userid = localStorage.getItem("EmpUserID");
  let filterUserID = "";
  if (departmentName == "Account Growth" && userDesignation == "Vice President") {
    filterUserID = userid
  }

  // Local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDateNew = `${year}-${month}-${day}`;
  console.log("User local time - ", formattedDateNew);

  // UTC time using toISOString()
  const formattedDateUTC = date.toISOString();
  console.log("UTC time - ", formattedDateUTC);

  // Get timezone difference
  const timezoneOffset = date.getTimezoneOffset(); // in minutes
  const timezoneOffsetHours = Math.abs(timezoneOffset) / 60;
  const timezoneOffsetMinutes = Math.abs(timezoneOffset) % 60;

  // Determine if ahead or behind UTC
  const isAhead = timezoneOffset < 0;
  const sign = isAhead ? '+' : '-';

  // Format timezone difference
  const formattedTimezone = `${sign}${String(Math.floor(timezoneOffsetHours)).padStart(2, '0')}:${String(timezoneOffsetMinutes).padStart(2, '0')}`;

  console.log("Timezone difference from UTC: ", formattedTimezone);
  const fetchTimeout = (url, options, timeout = 20000) => {
    // Increased timeout to 20s
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      ),
    ]);
  };

  fetchTimeout(API_URLS.home, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ department: departmentName, user_date_str: formattedDateNew, user_date_utc: formattedDateUTC, user_timezone: formattedTimezone, filter_user_id: filterUserID }),
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (
        typeof data !== "object" ||
        data === null ||
        !data.Daily ||
        !data.Weekly ||
        !data.Monthly
      ) {
        throw new Error(
          "Invalid or incomplete data format received from server."
        );
      }
      dashboardDataStore = data;
      // Check if user is Vice President in Account Growth, start with Weekly
      let departmentName = localStorage.getItem("Department");
      let jobRole = localStorage.getItem('Job_Role');
      if (departmentName === "Account Growth" && jobRole === "Vice President") {
        currentPeriod = "Weekly";
      }
      renderDashboard(currentPeriod); // Initial render with currentPeriod (Daily or Weekly based on role)
      $(".loader").hide();
      $(".admin-dashboard").show();
    })
    .catch((error) => {
      console.error("Failed to fetch initial dashboard data:", error);
      $(".tabs").hide();
      const mainContent = $("main.main-content");
      const errorMessage = `<div class="error-container">
                                            <div class="error-icon">⚠️</div>
                                            <h1 class='error-message-text'>Oops! Something went wrong.</h1>
                                            <p class='error-message-text_sub'>We're having some trouble loading this page. Please try again in a moment.</p>
                                            <button class="retry-button" onclick="location.reload()">Try Again</button>
                                          </div>`;
      if (mainContent.length) {
        mainContent.html(errorMessage);
      } else {
        $("body").html(errorMessage);
      }
      $(".loader").hide();
      $(".admin-dashboard").show();
    })
    .finally(() => {
      $loadingOverlay.fadeOut(300);
      $(".loader").hide();
      $(".admin-dashboard").show();
    });
}

function sowAccDetails(sowID, SOWUniqueID) {
  console.log("obje", sowID, SOWUniqueID)
  let uniqId_sowid = SOWUniqueID + '&' + sowID
  // localStorage.setItem('urlStoredSOWUrldata',uniqId_sowid)
  localStorage.setItem('sowBackBtnNav', 'adminDashboard')
  window.open('sow.html?' + uniqId_sowid, '_blank');
}

function updateAccountPillsScrollOverflowStyle() {
  // Select the scroll container
  const $scroll = $('.account-pills-scroll');
  if (!$scroll.length) return;
  // Check for horizontal overflow
  if ($scroll[0].scrollWidth > $scroll[0].clientWidth) {
    $scroll.css('margin-bottom', '-10px');
  } else {
    $scroll.css('margin-bottom', '');
  }
}

function openFile(file) {
  window.open(file, '_blank')
}

// initializeDashboard();
// });
