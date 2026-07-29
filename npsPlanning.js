console.error("DEBUG: npsPlanning.js v1.3.0 LOADED at " + new Date().toLocaleTimeString());
try {
    var valOrDash = (val) => (val === null || val === undefined || val === '' || val === '0.0' || val === 'null') ? '-' : val;

    window.toggleSowList = function(btn, isHide) {
        if (isHide) {
            $(btn).closest('.sow-hidden-list').hide();
            $(btn).closest('.sow-hidden-list').prev('.sow-toggle-btn').show();
        } else {
            $(btn).hide();
            $(btn).next('.sow-hidden-list').show();
        }
    };

    $(document).ready(function () {
        console.error("DEBUG: npsPlanning.js: Document READY");

        // ── State variables declared FIRST to avoid TDZ errors ──────────────────
        let npsData = null;
        let planSortCol = "account";
        let planSortOrder = "asc";
        let fullNpsData = null;
        let originalDataState = {};
        let stateReady = false; 
        let masterPickerInput = null;
        let masterActiveCell = null;
        let masterActiveOriginalStatus = null;
        let masterActiveOriginalDisplay = null;

        try {
            assignMetaValue();
            getLocalSessionData();
            console.error("DEBUG: Session loaded for: " + sessionName);
        } catch (e) {
            console.error("DEBUG: Session check failed", e);
        }

        if (sessionName == null) {
            window.location.href = "index.html";
            return false;
        } else {
            let accessStatus = checkDashboardPageAccessData();
            if (accessStatus) {
                let accessLevel = checkEachPageAccess("Reports");
                if (accessLevel.length > 0) {
                    initNPSPlanning();
                } else {
                    window.location.href = "home.html";
                }
            } else {
                window.location.href = "home.html";
            }
        }

        // ── Init ─────────────────────────────────────────────────────────────────

        function initNPSPlanning() {
            setupEventListeners();
            fetchData();
        }

        function handleFilterChange(changedId = null) {
            updateCascadingFilters(changedId);
            applyFilters();
        }

        // ── Date Format Helpers ──────────────────────────────────────────────────

        // "2026-03-31" or "2026-03-31 00:00:00" → "03-31-26"  (for display in span)
        function isoToDisplay(dateStr) {
            if (!dateStr || dateStr.trim() === "" || dateStr === "null") return "mm/dd/yy";
            let d = dateStr.split(' ')[0]; // strip time
            let p = d.split('-');
            if (p.length !== 3 || p[0].length !== 4) return "mm/dd/yy";
            return `${p[1]}-${p[2]}-${p[0].slice(-2)}`; // mm-dd-yy
        }

        // "03-31-26" or "03/31/26" or "03.31.26" → "2026-03-31"  (for API payload)
        // Handles multiple separators and both 2-digit and 4-digit years
        function displayToISO(dateStr) {
            if (!dateStr) return null;
            let normalized = dateStr.trim().replace(/[\/\.]/g, '-'); // normalize slashes or dots to dashes
            if (normalized === 'mm-dd-yy' || normalized === '') return null;
            let p = normalized.split('-');
            if (p.length !== 3) return null;
            let m = p[0].padStart(2, '0');
            let d = p[1].padStart(2, '0');
            let year = p[2].length === 4 ? p[2] : ('20' + p[2]);
            return `${year}-${m}-${d}`;
        }

        /**
         * UPDATES local npsData object so sorting/filtering doesn't reset the UI.
         */
        function syncNPSDataChange(sowId, dateKey, isoValue) {
            if (!npsData || !npsData.detailedData) return;
            let rowIdx = npsData.detailedData.findIndex(r => (r.sowId || r.sowName) === sowId);
            if (rowIdx === -1) return;

            let row = npsData.detailedData[rowIdx];
            if (!row.planning) row.planning = [];

            // Find which month index this dateKey ("2026-04") refers to
            let p = dateKey.split('-');
            let monthIdx = parseInt(p[1]) - 1;

            if (!row.planning[monthIdx]) {
                row.planning[monthIdx] = { type: 'placeholder', date: '' };
            }

            if (isoValue === null) {
                row.planning[monthIdx] = { type: 'placeholder', date: '' };
            } else {
                row.planning[monthIdx] = { type: 'planned', date: isoValue };
            }
        }

        function canEditDates() {
            let dept = localStorage.getItem("Department");
            let role = localStorage.getItem("user-role");
            return dept === "VP" || role === "admin" || localStorage.getItem("Job_Role") === "Vice President" || localStorage.getItem("Job_Role") === "Associate Vice President";
        }

        // ── Data Fetch ───────────────────────────────────────────────────────────

        function fetchData() {
            stateReady = false;
            $(".nps-filters").hide();
            $("#summaryTable thead, #detailedTable thead").hide();
            $(".loader-overlay").show();
            let currentYear = new Date().getFullYear().toString();
            let selectedYear = $("#planYear").val() || currentYear;
            if (!$("#planYear").val()) $("#planYear").val(selectedYear);
            let emp_id = localStorage.getItem("EmpUserID");
            let apiURL = apiValue.url.replace("/app", `/cnps/planning?year=${selectedYear}&employee_id=${emp_id}`);
            $.ajax({
                url: apiURL,
                type: "GET",
                dataType: "json",
                success: function(data) {
                    let decodeHtml = function(html) {
                        if (!html) return html;
                        let txt = document.createElement("textarea");
                        txt.innerHTML = html;
                        return txt.value;
                    };
                    let parsedData = Array.isArray(data) ? { detailedData: data } : data;
                    if (parsedData && parsedData.detailedData) {
                        parsedData.detailedData.forEach(r => {
                            if (r.account) r.account = decodeHtml(r.account);
                            if (r.stakeholdername) r.stakeholdername = decodeHtml(r.stakeholdername);
                            if (r.sowdetails) {
                                r.sowdetails.forEach(s => {
                                    if (s.sowName) s.sowName = decodeHtml(s.sowName);
                                    if (s.sowType) s.sowType = decodeHtml(s.sowType);
                                });
                            }
                        });
                    }
                    npsData = parsedData;
                    populateFilterDropdowns(npsData);

                    let currentYear = new Date().getFullYear().toString();
                    let selectedYear = $("#planYear").val() || currentYear;
                    if (!$("#planYear").val()) $("#planYear").val(selectedYear);

                    renderSummaryTable(npsData, selectedYear);
                    renderDetailedTable(npsData, selectedYear);

                    // Capture state FROM the DOM (what is actually rendered) — no format conversion needed
                    captureStateFromDOM();
                    stateReady = true;
                    checkForChanges(); // Must be zero changes right after capture

                    $("#npsPlanningView").addClass("active-view").show();
                    $("#planningFilters, #planningLegend").show();
                    $("#summaryTable thead, #detailedTable thead").show();
                    if ($(".nps-tab[data-tab='planning']").hasClass("active")) {
                        $(".nps-filters").show();
                    }

                    if (!canEditDates()) $("#btnUpdateNps").hide();

                    $(".loader-overlay").hide();
                },
                error: function(error) {
                    console.error("Error loading NPS data", error);
                    $(".loader-overlay").hide();
                    $(".nps-container").html(`<div class="error-container">
                        <div class="error-icon">⚠️</div>
                        <h1 class='error-message-text'>Oops! Something went wrong.</h1>
                        <p class='error-message-text_sub'>We're having trouble loading this page. Please try again.</p>
                        <button class="retry-button" onclick="location.reload()">Try Again</button>
                    </div>`);
                }
            });
        }

        // ── State Capture (DOM-Based) ────────────────────────────────────────────

        /**
         * Read what is ACTUALLY shown in each cell's span after rendering.
         * This is the ground truth — no API format conversion needed.
         * originalDataState[sowId][dateKey] = "mm-dd-yy" | "mm/dd/yy"
         */
        function captureStateFromDOM() {
            originalDataState = {};
            $("#detailedBody tr").each(function() {
                let sowId = $(this).attr('data-sow-id');
                if (!sowId) return;
                originalDataState[sowId] = {};
                $(this).find('.date-indicator').each(function() {
                    let dateKey = $(this).attr('data-date-key');
                    let spanText = $(this).find('span').text().trim();
                    originalDataState[sowId][dateKey] = spanText; // e.g. "03-31-26" or "mm/dd/yy"
                });
            });
            console.log("npsPlanning: DOM state captured for " + Object.keys(originalDataState).length + " rows");
        }

        // ── Change Detection ─────────────────────────────────────────────────────

        /**
         * Compare current DOM span text to captured original.
         * Apply .modified-date CSS and toggle Update button.
         */
        function checkForChanges() {
            if (!stateReady) return;
            try {
                let hasChanges = false;

                $("#detailedBody tr").each(function() {
                    let row = $(this);
                    let sowId = row.attr('data-sow-id');
                    let origRow = originalDataState[sowId] || {};

                    row.find('.date-indicator').each(function() {
                        let cell = $(this);
                        let dateKey = cell.attr('data-date-key');
                        let currentText = cell.find('span').text().trim().replace(/\//g, '-');
                        let originalText = (origRow[dateKey] || "mm/dd/yy").replace(/\//g, '-');

                        if (currentText !== originalText) {
                            cell.addClass('modified-date');
                            hasChanges = true;
                        } else {
                            cell.removeClass('modified-date');
                        }
                    });
                });

                $("#btnUpdateNps").prop("disabled", !hasChanges);
            } catch (err) {
                console.error("ERROR in checkForChanges:", err);
            }
        }

        /**
         * Collect modified cells and return them in API payload format.
         * Only here do we convert display format → ISO for the API.
         */
        function getModifiedDates() {
            let modifications = {};
            try {
                $("#detailedBody tr").each(function() {
                    let sowKey = $(this).attr('data-sow-id');
                    let stakeholderId = $(this).attr('data-stakeholder-id');
                    let sowIdsStr = $(this).attr('data-sow-ids');
                    let sowIds = sowIdsStr ? JSON.parse(sowIdsStr) : [];
                    let origRow = originalDataState[sowKey] || {};

                    $(this).find('.date-indicator').each(function() {
                        let cell = $(this);
                        let dateKey = cell.attr('data-date-key');
                        let currentText = cell.find('span').text().trim().replace(/\//g, '-');
                        let originalText = (origRow[dateKey] || "mm/dd/yy").replace(/\//g, '-');

                        if (currentText !== originalText) {
                            let iso = displayToISO(currentText);
                            if (!modifications[sowKey]) {
                                modifications[sowKey] = {
                                    stakeholder_id: stakeholderId,
                                    sow_ids: sowIds,
                                    dates: {}
                                };
                            }
                            modifications[sowKey].dates[dateKey] = iso; // null if cleared
                        }
                    });
                });
            } catch (err) {
                console.error("ERROR in getModifiedDates:", err);
            }
            return modifications;
        }

        // ── Rendering ────────────────────────────────────────────────────────────

        function renderSummaryTable(data, year) {
            const headerRow = $("#summaryHeader");
            const body = $("#summaryBody");
            const months = ["Jan","Feb","Mar","Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec"];
            headerRow.html('<th>Metric</th>');
            body.empty();
            months.forEach(m => headerRow.append(`<th>${m} ${year.slice(-2)}</th>`));
            ["Total No. of NPS Planned","No. of NPS Pending","No. of NPS Received"].forEach(m => {
                let tr = $('<tr></tr>').append(`<td>${m}</td>`);
                for (let i = 0; i < 12; i++) tr.append(`<td class="summary-val" data-month="${i}">0</td>`);
                body.append(tr);
            });
        }

        function renderDetailedTable(data, year) {
            const headerRow = $("#detailedHeader");
            const body = $("#detailedBody");
            const months = ["Jan","Feb","Mar","Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec"];

            headerRow.html(`
                <th class="sticky-col col-1 sortable-header" data-sort="account">Account ${getSortIcon("account")}</th>
                <th class="sticky-col col-2 sortable-header" data-sort="stakeholdername">NPS Stakeholder ${getSortIcon("stakeholdername")}</th>
                <th class="sticky-col col-3 sortable-header" data-sort="sowName">Active SoWs ${getSortIcon("sowName")}</th>
                <th class="sticky-col col-4" style="display:none;">SOW Type</th>
                <th class="sticky-col col-5" style="display:none;">SOW Start</th>
                <th class="sticky-col col-6" style="display:none;">SOW End</th>
            `);
            body.empty();
            months.forEach(m => headerRow.append(`<th>${m} ${year.slice(-2)}</th>`));

            function getAccountPriority(accountName) {
                if (!accountName) return 9999;
                const orderMap = getAccountOrderMap();
                const normalizedName = accountName.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
                let order = orderMap[accountName.toString().toLowerCase().trim()];
                if (order === undefined) {
                    for (let k in orderMap) {
                        if (k.replace(/[^a-z0-9]/g, '') === normalizedName) {
                            order = orderMap[k];
                            break;
                        }
                    }
                }
                return order === undefined ? 9999 : order;
            }

            const sorted = [...data.detailedData].sort((a, b) => {
                let va, vb;
                if (planSortCol === "sowName") {
                    va = (a.sowdetails || []).map(s => s.sowName).join(",").toLowerCase();
                    vb = (b.sowdetails || []).map(s => s.sowName).join(",").toLowerCase();
                } else {
                    va = (a[planSortCol] || "").toString().toLowerCase();
                    vb = (b[planSortCol] || "").toString().toLowerCase();
                }

                if (planSortCol === "account") {
                    let pA = getAccountPriority(va);
                    let pB = getAccountPriority(vb);
                    if (pA !== pB) {
                        return planSortOrder === "asc" ? pA - pB : pB - pA;
                    }
                }

                return va < vb ? (planSortOrder === "asc" ? -1 : 1) : va > vb ? (planSortOrder === "asc" ? 1 : -1) : 0;
            });

            const isAuth = canEditDates();

            // Determine current month/year for disabling past months
            const now = new Date();
            const currentMonth = now.getMonth(); // 0-indexed (0 = Jan, 5 = Jun)
            const currentYear = now.getFullYear();
            const selectedYearNum = parseInt(year, 10);

            sorted.forEach((row, rowIndex) => {
                let sowKey = row.accountId + '_' + row.stakeholdername;
                let sows = row.sowdetails || [];
                let stakeStr = row.stakeholdername || '';
                let approvedClass = (row.is_approved === true || row.is_approved === "true") ? ' nps-row-approved' : '';
                let tr = $('<tr></tr>')
                    .addClass(approvedClass)
                    .attr('data-sow-id', sowKey)
                    .attr('data-account', row.account || '')
                    .attr('data-sow', sows.map(s => s.sowName).join('|'))
                    .attr('data-sow-ids', JSON.stringify(sows.map(s => s.sowId)))
                    .attr('data-stakeholder-id', row.stakeholder_id || row.stakeholderId || row.stakeholdername)
                    .attr('data-stakeholders', stakeStr)
                    .attr('data-start', sows.map(s => s.sowStart).join('|'))
                    .attr('data-end', sows.map(s => s.sowEnd).join('|'))
                    .attr('data-type', sows.map(s => s.sowType).join('|'))
                    .attr('data-max-sow-end-date', row.maxSowEndDate || '');

                let sowNamesHtml = "-";
                if (sows.length > 0) {
                    let s0 = sows[0];
                    sowNamesHtml = `<span class="stakeholder-tag"><a href="javascript:void(0)" class="sow_data_name_all" onclick="sowNpsResData(this)" data-id='${JSON.stringify(s0).replace(/'/g, "&#39;")}' style="text-decoration:none;">${valOrDash(s0.sowName)}</a></span>`;
                    if (sows.length > 1) {
                        let remainingHtml = sows.slice(1).map(s => `<span class="stakeholder-tag"><a href="javascript:void(0)" class="sow_data_name_all" onclick="sowNpsResData(this)" data-id='${JSON.stringify(s).replace(/'/g, "&#39;")}' style="text-decoration:none;">${valOrDash(s.sowName)}</a></span>`).join('<br/>');
                        sowNamesHtml += `
                            <span class="sow-toggle-btn" style="cursor: pointer; display: inline-flex; align-items: center; background: #eef2fa; color: #1a569d; padding: 2px 8px; border-radius: 12px; font-size: 8px; margin-left: 5px; border: 1px solid #d4e0f0; transition: all 0.2s ease;" onclick="toggleSowList(this, false)">
                                +${sows.length - 1}
                            </span>
                            <div class="sow-hidden-list" style="display: none; margin-top: 4px;">
                                ${remainingHtml}
                                <div style="margin-top: 4px;">
                                    <span class="sow-toggle-btn hide-btn" style="cursor: pointer; display: inline-flex; align-items: center; background: #eef2fa; color: #1a569d; padding: 2px 8px; border-radius: 12px; font-size: 8px; border: 1px solid #d4e0f0; transition: all 0.2s ease;" onclick="toggleSowList(this, true)">
                                        (Hide)
                                    </span>
                                </div>
                            </div>
                        `;
                    }
                }
                let sowTypesHtml = sows.length > 0 ? sows.map(s => valOrDash(s.sowType)).join('<br/>') : "-";
                let sowStartsHtml = sows.length > 0 ? sows.map(s => valOrDash(isoToDisplay(s.sowStart))).join('<br/>') : "-";
                let sowEndsHtml = sows.length > 0 ? sows.map(s => valOrDash(isoToDisplay(s.sowEnd))).join('<br/>') : "-";

                let approvedTagClass = (row.is_approved === true || row.is_approved === "true") ? ' approved-stakeholder' : '';

                tr.append(`<td class="sticky-col col-1">${valOrDash(row.account)}</td>`);
                tr.append(`<td class="sticky-col col-2"><span class="stakeholder-tag${approvedTagClass}">${valOrDash(row.stakeholdername)}</span></td>`);
                tr.append(`<td class="sticky-col col-3">${sowNamesHtml}</td>`);
                tr.append(`<td class="sticky-col col-4" style="display:none;">${sowTypesHtml}</td>`);
                tr.append(`<td class="sticky-col col-5" style="display:none;">${sowStartsHtml}</td>`);
                tr.append(`<td class="sticky-col col-6" style="display:none;">${sowEndsHtml}</td>`);

                months.forEach((month, idx) => {
                    let dateKey = `${year}-${String(idx + 1).padStart(2, '0')}`;
                    let planRaw = (row.planning || [])[idx];
                    let plan;
                    if (planRaw) {
                        plan = typeof planRaw === 'string' ? { type: 'planned', date: planRaw } : planRaw;
                    } else {
                        plan = { type: 'placeholder', date: '' };
                    }
                    let planDate = (plan.date || '').split(' ')[0]; // strip time if present

                    let statusClass = plan.type !== 'placeholder'
                        ? `status-${plan.type.toLowerCase()}`
                        : 'status-placeholder';
                    let displayDate = isoToDisplay(planDate);
                    let icon = statusClass === 'status-placeholder' ? 'fa-calendar' : 'fa-calendar-check';

                    // Disable previous months: past year = all disabled, current year = months before current month
                    let isPastMonth = (selectedYearNum < currentYear) ||
                                      (selectedYearNum === currentYear && idx < currentMonth);

                    // Disable months after maxSowEndDate
                    let isAfterMaxSow = false;
                    if (row.maxSowEndDate) {
                        let sowParts = row.maxSowEndDate.split('-');
                        let sowYear = parseInt(sowParts[0], 10);
                        let sowMonth = parseInt(sowParts[1], 10);
                        if (selectedYearNum > sowYear || (selectedYearNum === sowYear && (idx + 1) > sowMonth)) {
                            isAfterMaxSow = true;
                        }
                    }

                    let isEditable = isAuth && !isPastMonth && !isAfterMaxSow;
                    let disabledClass = (!isEditable) ? ' disabled-month' : '';

                    let unselectBtn = (isEditable && statusClass !== 'status-placeholder')
                        ? '<i class="fa fa-times unselect-date" title="Unselect"></i>' : '';
                    let editAttr = isEditable ? 'data-editable="true"' : 'data-editable="false"';

                    tr.append(`<td>
                        <div class="date-indicator ${statusClass}${disabledClass}" ${editAttr} data-date-key="${dateKey}">
                            <i class="fa ${icon}"></i>
                            <span>${displayDate}</span>
                            ${unselectBtn}
                        </div>
                    </td>`);
                });

                body.append(tr);
            });

            applyFilters();
            // NOTE: Do NOT call checkForChanges here — called explicitly after captureStateFromDOM
        }

        function getSortIcon(col) {
            if (col !== planSortCol) return '<i class="fa fa-sort sort-icon"></i>';
            return planSortOrder === "asc"
                ? '<i class="fa fa-sort-up sort-icon sort-active"></i>'
                : '<i class="fa fa-sort-down sort-icon sort-active"></i>';
        }

        // ── Date Picker ──────────────────────────────────────────────────────────

        /**
         * INITIALIZES the single master picker shared by all cells.
         */
        function initMasterPicker() {
            // No-op here, we'll create it on demand in initNPSPicker to ensure fresh state
        }

        function positionOpenPicker() {
            if (!masterPickerInput || !masterActiveCell) return;

            let picker = $('body').find('[role="calendar"][guid="' + masterPickerInput.attr('data-guid') + '"]');
            if (!picker.length) return;

            let cellRect = masterActiveCell[0].getBoundingClientRect();
            let scrollTop = $(window).scrollTop();
            let scrollLeft = $(window).scrollLeft();
            let viewportWidth = $(window).width();
            let viewportHeight = $(window).height();
            let pickerWidth = picker.outerWidth();
            let pickerHeight = picker.outerHeight();
            let gap = 8;

            let top = scrollTop + cellRect.bottom + gap;
            let left = scrollLeft + cellRect.left;

            if (left + pickerWidth > scrollLeft + viewportWidth - gap) {
                left = scrollLeft + viewportWidth - pickerWidth - gap;
            }
            if (left < scrollLeft + gap) {
                left = scrollLeft + gap;
            }

            if (top + pickerHeight > scrollTop + viewportHeight - gap) {
                top = scrollTop + cellRect.top - pickerHeight - gap;
            }
            if (top < scrollTop + gap) {
                top = scrollTop + gap;
            }

            picker.css({
                position: 'absolute',
                top: top,
                left: left,
                zIndex: 13050
            });
        }

        function syncPickerMonthView(dateKey) {
            if (!masterPickerInput || !dateKey) return;

            let picker = $('body').find('[role="calendar"][guid="' + masterPickerInput.attr('data-guid') + '"]');
            if (!picker.length) return;

            let pickerConfig = masterPickerInput.data();
            let parts = dateKey.split('-');
            if (parts.length !== 2) return;

            let year = parseInt(parts[0], 10);
            let month = parseInt(parts[1], 10) - 1;
            if (isNaN(year) || isNaN(month)) return;

            picker.attr('year', year);
            picker.attr('month', month);
            picker.removeAttr('selectedDay');
            gj.datepicker.methods.renderMonth(masterPickerInput, picker, pickerConfig);
        }

        function initNPSPicker() {
            if (!canEditDates()) return;

            $(document).off('click', '.date-indicator[data-editable="true"]');
            $(document).on('click', '.date-indicator[data-editable="true"]', function(e) {
                // stopImmediatePropagation prevents Gijgo from seeing this click
                e.stopImmediatePropagation();

                let cell = $(this);

                // Handle unselect (X)
                if ($(e.target).hasClass('unselect-date')) {
                    e.stopPropagation();
                    cell.find('span').text('mm/dd/yy');
                    cell.removeClass('status-received status-planned status-notreceived').addClass('status-placeholder');
                    cell.find('i.fa').removeClass('fa-calendar-check').addClass('fa-calendar');
                    cell.find('.unselect-date').remove();
                    
                    let sId = cell.closest('tr').attr('data-sow-id');
                    let dKey = cell.attr('data-date-key');
                    syncNPSDataChange(sId, dKey, null);
                    checkForChanges();
                    return;
                }

                // Position and Open Master Picker
                masterActiveCell = cell;
                masterActiveOriginalDisplay = cell.find('span').text().trim();
                masterActiveOriginalStatus = cell.hasClass('status-received')
                    ? 'status-received'
                    : cell.hasClass('status-notreceived')
                        ? 'status-notreceived'
                        : cell.hasClass('status-planned')
                            ? 'status-planned'
                            : 'status-placeholder';

                // Completely remove the old input and its wrapper to avoid any state pollution
                if ($("#npsMasterPickerInput").length > 0) {
                    let oldInput = $("#npsMasterPickerInput");
                    if (oldInput.data('gj.datepicker')) {
                        oldInput.datepicker('destroy');
                    }
                    oldInput.remove();
                }

                // Re-create the master input
                masterPickerInput = $('<input type="text" id="npsMasterPickerInput">')
                    .css({
                        opacity: 0,
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        border: 0,
                        padding: 0,
                        zIndex: -1,
                        pointerEvents: 'none',
                        left: 0,
                        top: 0
                    })
                    .appendTo('body');

                // Set min/max date based on column month
                // The attributes are on the parent <td> element
                let dateKey = cell.attr('data-date-key') || cell.closest('td').attr('data-date-key'); 
                
                let minDateStr = null;
                let maxDateStr = null;
                let defaultDateStr = null;
                if (dateKey) {
                    let parts = dateKey.split('-');
                    let year = parseInt(parts[0]);
                    let month = parseInt(parts[1]);
                    let lastDay = new Date(year, month, 0).getDate();
                    
                    let mm = String(month).padStart(2, '0');
                    let yy = String(year).slice(-2);
                    
                    minDateStr = `${mm}-01-${yy}`;
                    maxDateStr = `${mm}-${String(lastDay).padStart(2, '0')}-${yy}`;
                    defaultDateStr = `${mm}-01-${yy}`;

                    // Cap maxDateStr with maxSowEndDate if available and in the same month
                    let maxSowStr = cell.closest('tr').attr('data-max-sow-end-date');
                    if (maxSowStr) {
                        let sowParts = maxSowStr.split('-');
                        let sowYear = parseInt(sowParts[0], 10);
                        let sowMonth = parseInt(sowParts[1], 10);
                        let sowDay = parseInt(sowParts[2], 10);
                        if (sowYear === year && sowMonth === month) {
                            maxDateStr = `${mm}-${String(sowDay).padStart(2, '0')}-${yy}`;
                        }
                    }
                }

                let currentDisplay = cell.find('span').text().trim();
                let preVal = (currentDisplay === 'mm/dd/yy' || currentDisplay === 'mm-dd-yy') ? '' : currentDisplay;
                let pickerSeedValue = preVal || '';

                // Existing dates keep their selected day; empty cells should open on the month only.
                masterPickerInput.val(pickerSeedValue);

                // Initialize datepicker with min/max
                masterPickerInput.datepicker({
                    uiLibrary: 'bootstrap4',
                    format: 'mm-dd-yy',
                    iconsLibrary: 'fontawesome',
                    value: pickerSeedValue,
                    minDate: minDateStr,
                    maxDate: maxDateStr,
                    change: function() {
                        if (!masterActiveCell) return;
                        let picked = masterPickerInput.val();
                        if (!picked) return;

                        let normalized = picked.trim().replace(/[\/\.]/g, '-');
                        if (!normalized || normalized === 'mm-dd-yy') return;

                        masterActiveCell.find('span').text(normalized);
                        masterActiveCell.removeClass('status-placeholder status-notreceived status-received status-planned');
                        if (masterActiveOriginalStatus && masterActiveOriginalStatus !== 'status-placeholder') {
                            masterActiveCell.addClass(masterActiveOriginalStatus);
                        } else {
                            masterActiveCell.addClass('status-planned');
                        }
                        masterActiveCell.find('i.fa').removeClass('fa-calendar').addClass('fa-calendar-check');
                        if (masterActiveCell.find('.unselect-date').length === 0) {
                            masterActiveCell.append('<i class="fa fa-times unselect-date" title="Unselect"></i>');
                        }

                        // SYNC to memory
                        let sId = masterActiveCell.attr('data-sow-id') || masterActiveCell.closest('td').attr('data-sow-id') || masterActiveCell.closest('tr').attr('data-sow-id');
                        let dKey = masterActiveCell.attr('data-date-key') || masterActiveCell.closest('td').attr('data-date-key');
                        let iso = displayToISO(normalized);
                        syncNPSDataChange(sId, dKey, iso);

                        checkForChanges();
                    },
                    open: function() {
                        if (!preVal) {
                            syncPickerMonthView(dateKey);
                        }
                        positionOpenPicker();
                    }
                });

                let offset = cell.offset();
                let wrapper = masterPickerInput.closest('.gj-datepicker');
                if (wrapper.length) {
                    wrapper.css({
                        position: 'absolute',
                        top: offset.top + (cell.height() / 2),
                        left: offset.left + (cell.width() / 2),
                        zIndex: -1
                    });
                }

                // Open it!
                masterPickerInput.datepicker('open');
                if (!preVal) {
                    syncPickerMonthView(dateKey);
                }
                positionOpenPicker();
            });

            $(window).off('resize.npsPicker scroll.npsPicker');
            $(window).on('resize.npsPicker scroll.npsPicker', function() {
                positionOpenPicker();
            });

        }

        // ── Event Listeners ──────────────────────────────────────────────────────

        function setupEventListeners() {
            initMasterPicker();
            initNPSPicker();

            // Column sort
            $(document).off("click", "#detailedHeader .sortable-header");
            $(document).on("click", "#detailedHeader .sortable-header", function() {
                let col = $(this).data("sort");
                planSortOrder = (planSortCol === col && planSortOrder === "asc") ? "desc" : "asc";
                planSortCol = col;
                let yr = $("#planYear").val() || new Date().getFullYear().toString();
                renderDetailedTable(npsData, yr);
                checkForChanges();
            });

            // Tab switching
            $(".nps-tab").click(function () {
                let tab = $(this).data("tab");
                $(".nps-tab").removeClass("active");
                $(this).addClass("active");
                $(".nps-view, .nps-filter-group").hide();
                $("#npsSeparator").show();
                $("#planningLegend, #summaryLegend, #bcStakeholderToggles, #bcActionButtons").hide();
                $("#npsSearch").val(""); // Reset search input on tab switch
                $("#npsSummarySearch").val("");
                $("#npsBcSearch").val("");

                // Hide date picker when not in planning
                if (masterPickerInput && typeof masterPickerInput.datepicker === "function" && tab !== "planning") {
                    masterPickerInput.datepicker('close');
                }

                if (tab === "summary") {
                    if (typeof initNPSSummary === "function") initNPSSummary();
                } else if (tab === "planning") {
                    fetchData();
                } else if (tab === "buying-center") {
                    $("#npsSeparator").hide();
                    if (typeof initNPSBuyingCenter === "function") initNPSBuyingCenter();
                }
            });

            // Search
            $("#npsSearch").off("keyup.planning").on("keyup.planning", function() {
                if ($("#npsPlanningView").is(":visible")) applyFilters();
            });

            // Year / filter change
            $(document).on("change", "#planAccount, #planSow, #planStakeholder, #planYear", function() {
                let id = $(this).attr('id');
                if (id === 'planYear') {
                    fetchData();
                } else {
                    // Use a small delay to ensure the event bubble completes before re-rendering other dropdowns
                    setTimeout(() => {
                        handleFilterChange(id);
                    }, 100);
                }
            });
        }

        // ── Filters ──────────────────────────────────────────────────────────────

        function applyFilters() {
            let search = ($("#npsSearch").val() || "").toLowerCase();
            let accounts = $("#planAccount").val() || [];
            let sows = $("#planSow").val() || [];
            let stakes = $("#planStakeholder").val() || [];
            let yr = ($("#planYear").val() || "");

            $("#detailedBody tr").each(function() {
                let r = $(this);
                let acc = r.attr("data-account") || "";
                let sow = r.attr("data-sow") || "";
                let stk = (r.attr("data-stakeholders") || "").split('|');
                let start = r.attr("data-start") || "";
                let end = r.attr("data-end") || "";

                let sowArray = sow.split('|');
                let ok = (accounts.length === 0 || accounts.includes(acc))
                    && (sows.length === 0 || sowArray.some(s => sows.includes(s)))
                    && (stakes.length === 0 || stk.some(s => stakes.includes(s)));

                // Year Filter: Show SOW if it overlaps with selected year
                if (ok && yr) {
                    let yearStart = yr + "-01-01";
                    let yearEnd = yr + "-12-31";
                    let sowStartVal = start || "0000-00-00";
                    let sowEndVal = (end && end !== "null" && end !== "undefined") ? end : "9999-99-99";
                    
                    if (!(sowStartVal <= yearEnd && sowEndVal >= yearStart)) {
                        ok = false;
                    }
                }

                // Search Filter
                if (ok && search) {
                    ok = acc.toLowerCase().includes(search) || 
                         sow.toLowerCase().includes(search) || 
                         stk.some(s => s.toLowerCase().includes(search)) ||
                         (r.attr("data-type") || "").toLowerCase().includes(search) ||
                         (r.attr("data-start") || "").toLowerCase().includes(search) ||
                         (r.attr("data-end") || "").toLowerCase().includes(search);
                }

                r.toggle(ok);
            });
            updateDynamicSummary();
        }

        function updateDynamicSummary() {
            let total = new Array(12).fill(0);
            let pending = new Array(12).fill(0);
            let received = new Array(12).fill(0);

            $("#detailedBody tr").each(function() {
                if ($(this).css('display') === 'none') return;
                $(this).find(".date-indicator").each(function(i) {
                    let c = $(this);
                    let isPlanned = c.hasClass("status-planned");
                    let isNotRec = c.hasClass("status-notreceived");
                    let isRec = c.hasClass("status-received");
                    if (isPlanned || isNotRec || isRec) total[i]++;
                    if (isPlanned || isNotRec) pending[i]++;
                    if (isRec) received[i]++;
                });
            });

            let rows = $("#summaryBody tr");
            if (rows.length >= 3) {
                rows.eq(0).find(".summary-val").each(function(i) { $(this).text(total[i]); });
                rows.eq(1).find(".summary-val").each(function(i) { $(this).text(pending[i]); });
                rows.eq(2).find(".summary-val").each(function(i) { $(this).text(received[i]); });
            }
        }

        // ── Dropdowns ────────────────────────────────────────────────────────────

        function populateFilterDropdowns(data) {
            fullNpsData = data.detailedData;
            updateCascadingFilters();

            let minYear = Infinity;
            let maxYear = -Infinity;
            fullNpsData.forEach(r => {
                (r.sowdetails || []).forEach(s => {
                    if (s.sowStart) {
                        let y = parseInt(s.sowStart.split('-')[0]);
                        if (y < minYear) minYear = y;
                        if (y > maxYear) maxYear = y;
                    }
                    if (s.sowEnd && s.sowEnd !== 'null' && s.sowEnd !== 'undefined') {
                        let y = parseInt(s.sowEnd.split('-')[0]);
                        if (y < minYear) minYear = y;
                        if (y > maxYear) maxYear = y;
                    }
                });
            });

            let years = new Set();
            if (minYear !== Infinity && maxYear !== -Infinity) {
                for (let y = minYear; y <= maxYear; y++) {
                    years.add(y.toString());
                }
            } else {
                years.add(new Date().getFullYear().toString());
            }

            let yearSelect = $("#planYear");
            let cur = yearSelect.val();
            yearSelect.empty().append('<option value="">Year</option>');
            Array.from(years).sort().forEach(y => { if (y) yearSelect.append(`<option value="${y}">${y}</option>`); });
            if (cur) yearSelect.val(cur);

            let currentYear = new Date().getFullYear().toString();
            if (!yearSelect.val()) {
                if (years.has(currentYear)) yearSelect.val(currentYear);
                else if (years.size > 0) yearSelect.val(Array.from(years).sort().pop());
            }
        }

        function updateCascadingFilters(changedId = null) {
            if (!fullNpsData) return;
            let selAcc = $("#planAccount").val() || [];
            let selSow = $("#planSow").val() || [];
            let selStk = $("#planStakeholder").val() || [];
            let yr = $("#planYear").val() || "";

            const isSowInYear = (r, yr) => {
                if (!yr) return true;
                let yearStart = yr + "-01-01";
                let yearEnd = yr + "-12-31";
                if (!r.sowdetails || r.sowdetails.length === 0) return true;
                return r.sowdetails.some(s => {
                    let sowStartVal = s.sowStart || "0000-00-00";
                    let sowEndVal = (s.sowEnd && s.sowEnd !== "null" && s.sowEnd !== "undefined") ? s.sowEnd : "9999-99-99";
                    return (sowStartVal <= yearEnd && sowEndVal >= yearStart);
                });
            };

            if (changedId !== "planAccount") {
                let f = fullNpsData.filter(r => 
                    isSowInYear(r, yr) &&
                    (selSow.length === 0 || (r.sowdetails||[]).some(s => selSow.includes(s.sowName))) && 
                    (selStk.length === 0 || selStk.includes(r.stakeholdername))
                );
                refreshDropdown("#planAccount", f, "account", "Account", selAcc, changedId);
            }
            if (changedId !== "planSow") {
                let f = fullNpsData.filter(r => 
                    isSowInYear(r, yr) &&
                    (selAcc.length === 0 || selAcc.includes(r.account)) && 
                    (selStk.length === 0 || selStk.includes(r.stakeholdername))
                );
                refreshDropdown("#planSow", f, "sowName", "SoW", selSow, changedId);
            }
            if (changedId !== "planStakeholder") {
                let f = fullNpsData.filter(r => 
                    isSowInYear(r, yr) &&
                    (selAcc.length === 0 || selAcc.includes(r.account)) && 
                    (selSow.length === 0 || (r.sowdetails||[]).some(s => selSow.includes(s.sowName)))
                );
                refreshDropdown("#planStakeholder", f, "stakeholdername", "Stakeholder", selStk, changedId);
            }
        }

        function refreshDropdown(id, data, field, label, currentValues, changedId = null) {
            let select = $(id);
            
            // If this is the dropdown being changed, don't reload it (prevents closing)
            if (changedId && id.replace('#','') === changedId) return;

            let opts = new Set();
            data.forEach(r => {
                if (field === "sowName") {
                    (r.sowdetails || []).forEach(s => opts.add(s.sowName));
                } else if (r[field]) {
                    opts.add(r[field]);
                }
            });
            // Ensure currently selected values are always available in the dropdown
            if (currentValues && Array.isArray(currentValues)) {
                currentValues.forEach(v => { if(v) opts.add(v); });
            }
            select.empty();
            Array.from(opts).sort().forEach(val => {
                const sVal = (val || "").toString();
                if (sVal && sVal !== '-' && sVal.toLowerCase() !== 'unassigned') {
                    const isSelected = currentValues.includes(val) ? 'selected' : '';
                    select.append(`<option value="${val}" ${isSelected}>${val}</option>`);
                }
            });
            select.val(currentValues.filter(v => opts.has(v)));

            let msOpts = {
                columns: 1, placeholder: label, search: true, selectAll: true,
                onOptionClick: () => handleFilterChange(id.replace('#','')),
                onSelectAll: () => handleFilterChange(id.replace('#',''))
            };
            select.hasClass('jqmsLoaded') ? select.multiselect('settings', msOpts) : select.multiselect(msOpts);
        }

        function handleFilterChange(changedId) {
            // Use setTimeout to allow the multiselect plugin to finish its internal state update
            // before we start manipulating the DOM and potentially causing focus loss or detached elements.
            setTimeout(() => {
                updateCascadingFilters(changedId);
                applyFilters();
                if (typeof applySummaryFilters === "function" && $("#npsSummaryView").is(":visible")) {
                    applySummaryFilters();
                }
            }, 0);
        }

        // ── Logout ───────────────────────────────────────────────────────────────

        $("#logout").click(function () {
            localStorage.clear();
            window.location.href = "index.html";
            return false;
        });

        // ── Bulk Save ────────────────────────────────────────────────────────────

        $("#btnUpdateNps").click(function() { bulkSaveNPSDates(); });

        function bulkSaveNPSDates() {
            let mods = getModifiedDates();
            if (Object.keys(mods).length === 0) return;

            let stakeholdersPayload = Object.values(mods).map(mod => ({
                stakeholder_id: isNaN(mod.stakeholder_id) ? mod.stakeholder_id : parseInt(mod.stakeholder_id),
                sow_ids: mod.sow_ids,
                dates: mod.dates
            }));

            let payload = {
                updated_by: localStorage.getItem("EmpUserName") || "Unknown",
                updated_by_id: localStorage.getItem("EmpUserID") || "Unknown",
                stakeholders: stakeholdersPayload
            };

            $(".loader-overlay").show();
            $.ajax({
                url: apiValue.url_ip + ":5004/cnps/planning/dates/bulk-save",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function() {
                    $(".loader-overlay").hide();
                    typeof toastr !== "undefined" ? toastr.success("Planning dates updated successfully") : alert("Planning dates updated successfully");
                    fetchData();
                },
                error: function(err) {
                    $(".loader-overlay").hide();
                    console.error("Error saving planning dates:", err);
                    typeof toastr !== "undefined" ? toastr.error("Failed to update planning dates") : alert("Failed to update planning dates");
                }
            });
        }

    }); // end document.ready
} catch (globalErr) {
    console.error("DEBUG: CRITICAL GLOBAL ERROR in npsPlanning.js", globalErr);
}

// Function to handle SoW name click and redirect to sow.html
function sowNpsResData(obj) {
    let sowAllRes = $(obj).attr("data-id");
    let sow_details = JSON.parse(sowAllRes);
    let unique_id = sow_details.uniqueId || sow_details.sowId; // Use uniqueId if available, else sowId
    let sow_id = sow_details.sowId;
    let uniqId_sowid = unique_id + '&' + sow_id; // Format: UNIQUE_ID&SOW_ID
    window.open('sow.html?' + uniqId_sowid, '_blank');
}
