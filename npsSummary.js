
let npsRawData = null;
let sumSortCol = "account";
let sumSortOrder = "asc";

window.toggleSowList = window.toggleSowList || function(btn, isHide) {
    if (isHide) {
        $(btn).closest('.sow-hidden-list').hide();
        $(btn).closest('.sow-hidden-list').prev('.sow-toggle-btn').show();
    } else {
        $(btn).hide();
        $(btn).next('.sow-hidden-list').show();
    }
};

function getSumSortIcon(colName) {
    if (colName !== sumSortCol) return '<i class="fa fa-sort sort-icon"></i>';
    return sumSortOrder === "asc" ? 
        '<i class="fa fa-sort-up sort-icon sort-active"></i>' : 
        '<i class="fa fa-sort-down sort-icon sort-active"></i>';
}

function isRecentNps(dateStr) {
    if (!dateStr || dateStr === '-') return false;
    try {
        const npsDate = new Date(dateStr);
        if (isNaN(npsDate.getTime())) return false;
        
        const d1 = new Date(npsDate);
        d1.setHours(0, 0, 0, 0);
        
        const d2 = new Date();
        d2.setHours(0, 0, 0, 0);
        
        const diffTime = d2 - d1;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays >= 0 && diffDays <= 7;
    } catch (e) {
        return false;
    }
}



function initNPSSummary() {
    if (!npsRawData) {
        fetchRawSummaryData();
    } else {
        refreshSummaryView();
        $("#npsSummaryView").addClass("active-view").show();
        $("#summaryFilters, #summaryLegend").show();
        $(".nps-filters, #npsSummaryTable thead").show();
    }
    setupSummaryEventListeners();
}

function fetchRawSummaryData() {
    $(".nps-filters, #npsSummaryTable thead").hide();
    $(".loader-overlay").show();
    let emp_id = localStorage.getItem("EmpUserID");
    let apiURL = apiValue.url.replace("/app", `/cnps/summary-v2?employee_id=${emp_id}`);
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
            if (data && data.stakeholders) {
                data.stakeholders.forEach(r => {
                    if (r.account) r.account = decodeHtml(r.account);
                    if (typeof r.stakeholder === 'string') {
                        r.stakeholder = decodeHtml(r.stakeholder);
                    } else if (r.stakeholder && r.stakeholder.name) {
                        r.stakeholder.name = decodeHtml(r.stakeholder.name);
                    }
                    if (r.sow) r.sow = decodeHtml(r.sow);
                    if (r.sow_details) {
                        r.sow_details.forEach(s => {
                            if (s.sow) s.sow = decodeHtml(s.sow);
                        });
                    }
                });
            }
            npsRawData = data.stakeholders;
            populateSummaryFilters(npsRawData);
            refreshSummaryView();
            $("#npsSummaryView").addClass("active-view").show();
            $("#summaryFilters, #summaryLegend").show();
            $(".nps-filters, #npsSummaryTable thead").show();
            $(".loader-overlay").hide();
        },
        error: function(error) {
            console.error("Error loading NPS raw summary data", error);
            $(".loader-overlay").hide();
            const errorMessage = `<div class="error-container">
                                    <div class="error-icon">⚠️</div>
                                    <h1 class='error-message-text'>Oops! Something went wrong.</h1>
                                    <p class='error-message-text_sub'>We're having some trouble loading this page. Please try again in a moment.</p>
                                    <button class="retry-button" onclick="location.reload()">Try Again</button>
                                  </div>`;
            $(".nps-container").html(errorMessage);
        }
    });
}

function populateSummaryFilters(data) {
    // Initial call to sync filters
    syncSummaryFilters();

    // Years are relatively static, keep them separate or sync if needed
    let years = new Set();
    (data || []).forEach(item => {
        (item.activities || []).forEach(act => {
            if (act.month) {
                const parts = act.month.split(' ');
                const y = parts.length > 1 ? parts[1] : null;
                if (y) years.add(y);
            }
        });
    });

    const yearSelect = $("#sumYear");
    yearSelect.empty().append('<option value="">Year</option>');
    Array.from(years).sort().forEach(y => {
        yearSelect.append(`<option value="${y}">${y}</option>`);
    });
    
    const currentYear = new Date().getFullYear().toString();
    if (yearSelect.find(`option[value="${currentYear}"]`).length > 0) {
        yearSelect.val(currentYear);
    } else {
        yearSelect.val(yearSelect.find('option:last').val());
    }
}

function syncSummaryFilters(changedId = null) {
    if (!npsRawData) return;
    
    const selAccounts = $("#sumAccount").val() || [];
    const selSows = $("#sumSow").val() || [];
    const selStakeholders = $("#sumStakeholder").val() || [];
    const selYear = $("#sumYear").val();

    const getMatches = (skipField) => {
        return npsRawData.filter(item => {
            if (skipField !== 'account' && selAccounts.length > 0 && !selAccounts.includes(item.account)) return false;
            
            if (skipField !== 'sow' && selSows.length > 0) {
                const itemSows = (item.sow_details || []).map(s => s.sow);
                if (item.sow) itemSows.push(item.sow);
                if (!itemSows.some(s => selSows.includes(s))) return false;
            }

            if (skipField !== 'stakeholder' && selStakeholders.length > 0 && !selStakeholders.includes(item.stakeholder)) return false;
            return true;
        });
    };

    // 1. Account Filter
    const availAccounts = new Set(getMatches('account').map(i => i.account));
    updateSumSelect($("#sumAccount"), availAccounts, "Account", selAccounts, changedId);

    // 2. SoW Filter
    const availSows = new Set();
    getMatches('sow').forEach(item => {
        if (item.sow_details) item.sow_details.forEach(s => { if(s.sow) availSows.add(s.sow); });
        if (item.sow) availSows.add(item.sow);
    });
    updateSumSelect($("#sumSow"), availSows, "SoW", selSows, changedId);

    // 3. Stakeholder Filter
    const availStakeholders = new Set(getMatches('stakeholder').map(i => i.stakeholder));
    updateSumSelect($("#sumStakeholder"), availStakeholders, "NPS Stakeholder", selStakeholders, changedId);
}

function updateSumSelect(select, set, label, currentSelection, changedId) {
    if (select.attr('id') === 'sumSow') return;
    
    // If this is the dropdown being changed, don't reload it (prevents closing)
    if (changedId && select.attr('id') === changedId) return;

    const prevVal = currentSelection || [];
    select.empty();
    
    // Ensure currently selected values are always in the set of options
    if (prevVal && Array.isArray(prevVal)) {
        prevVal.forEach(v => { if(v) set.add(v); });
    }
    
    Array.from(set).sort().forEach(val => {
        const sVal = (val || "").toString();
        if (sVal && sVal !== '-' && sVal.toLowerCase() !== 'unassigned') {
            const isSelected = prevVal.includes(val) ? 'selected' : '';
            select.append(`<option value="${val}" ${isSelected}>${val}</option>`);
        }
    });
    
    if (select.next('.ms-options-wrap').length > 0) {
        select.multiselect('reload');
    } else {
        select.multiselect({
            columns: 1,
            texts: { placeholder: label },
            search: true,
            selectAll: true,
            onOptionClick: function() { 
                const id = select.attr('id');
                setTimeout(() => {
                    refreshSummaryView(id); 
                }, 100);
            },
            onSelectAll: function() { 
                const id = select.attr('id');
                setTimeout(() => {
                    refreshSummaryView(id); 
                }, 100);
            }
        });
    }
}

function refreshSummaryView(changedId = null) {
    if (!npsRawData) return;
    syncSummaryFilters(changedId);
    const selectedYear = $("#sumYear").val() || new Date().getFullYear().toString();
    const filteredData = getFilteredSummaryData();
    
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

    // Sorting logic
    const sortedData = [...filteredData].sort((a, b) => {
        let valA = (a[sumSortCol] || "").toString().toLowerCase();
        let valB = (b[sumSortCol] || "").toString().toLowerCase();
        
        if (sumSortCol === "account") {
            let pA = getAccountPriority(valA);
            let pB = getAccountPriority(valB);
            if (pA !== pB) {
                return sumSortOrder === "asc" ? pA - pB : pB - pA;
            }
        }

        if (valA < valB) return sumSortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sumSortOrder === "asc" ? 1 : -1;
        return 0;
    });

    renderSummaryHeader(selectedYear);
    renderSummaryBody(sortedData, selectedYear);
}

function getFilteredSummaryData() {
    const searchValue = ($("#npsSummarySearch").val() || "").toLowerCase();
    const accountFilters = $("#sumAccount").val() || [];
    const sowFilters = $("#sumSow").val() || [];
    const stakeholderFilters = $("#sumStakeholder").val() || [];

    const selectedYear = $("#sumYear").val();

    return npsRawData.filter(item => {
        const matchesAccount = accountFilters.length === 0 || accountFilters.includes(item.account);
        
        // Check if any SOW in sow_details matches or if the fallback sow property matches
        const itemSows = (item.sow_details || []).map(s => s.sow);
        if (item.sow) itemSows.push(item.sow);
        const matchesSow = sowFilters.length === 0 || itemSows.some(s => sowFilters.includes(s));

        const itemStkName = (typeof item.stakeholder === 'object' ? item.stakeholder.name : (item.stakeholder || ""));
        const matchesStakeholder = stakeholderFilters.length === 0 || stakeholderFilters.includes(itemStkName);
        
        const matchesSearch = !searchValue || 
            item.account.toLowerCase().includes(searchValue) || 
            itemSows.some(s => s && s.toLowerCase().includes(searchValue)) ||
            itemStkName.toLowerCase().includes(searchValue) ||
            (item.avgNps != null ? item.avgNps.toString() : "").includes(searchValue);

        return matchesAccount && matchesSow && matchesStakeholder && matchesSearch;
    });
}

function renderSummaryHeader(year) {
    const headerRow = $("#npsSummaryHeader");
    const fixedCols = `
        <th class="sticky-col sortable-header" style="left: 0; min-width: 150px;" data-sort="account">
            <div style="display: flex; align-items: center; justify-content: flex-start; gap: 8px; width: 100%;">
                <div style="display: flex; gap: 6px; align-items: center;">
                    <i id="btnExpandAllSum" class="fa fa-plus-square sum-header-action" title="Expand All" style="cursor: pointer; font-size: 14px; color: #666;"></i>
                    <i id="btnCollapseAllSum" class="fa fa-minus-square sum-header-action" title="Collapse All" style="cursor: pointer; font-size: 14px; color: #666; display: none;"></i>
                </div>
                <span>Account</span>
                ${getSumSortIcon("account")}
            </div>
        </th>
        <th class="sticky-col sortable-header" style="left: 150px; min-width: 180px;" data-sort="stakeholder">NPS Stakeholder ${getSumSortIcon("stakeholder")}</th>
        <th class="sticky-col sortable-header" style="left: 330px; min-width: 180px;" data-sort="sow">Active SoWs ${getSumSortIcon("sow")}</th>
        <th class="col-num" style="min-width: 80px; display: none;">No. of Planned</th>
        <th class="col-num" style="min-width: 80px;">No. of Received</th>
        <th class="col-num" style="min-width: 80px; display: none;">% Received</th>
        <th class="col-num" style="min-width: 90px;">Avg. NPS Rating</th>
    `;
    headerRow.html(fixedCols);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Monthly headers for the selected year
    months.forEach(m => {
        headerRow.append(`<th>${m} ${year.slice(-2)}</th>`);
    });
    
    // Add Jan of next year if possible, but user asked for "header are same" so I will keep Jan 2026 if selected year is 2025?
    // Actually, let's keep it simple: 12 months of the selected year.
}

function calculateAggregates(items, year) {
    let planned = 0;
    let received = 0;
    let totalRating = 0;
    let ratingCount = 0;
    let monthly = {};
    let hasRecent = false;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach(m => monthly[`${m} ${year}`] = { sum: 0, count: 0, recent: false, strength: "", improvement: "", hasRecent: false });

    (items || []).forEach(item => {
        (item.activities || []).forEach(act => {
            if (act.month) {
                const parts = act.month.split(' ');
                const actYear = parts.length > 1 ? parts[1] : null;
                if (actYear === year) {
                    if (act.status !== 'placeholder') planned++;
                    if (act.status === 'received') {
                        received++;
                        if (act.rating !== null && act.rating !== undefined) {
                            totalRating += parseFloat(act.rating);
                            ratingCount++;
                            // Check for recent NPS
                            if (act.last_nps_received_days !== null && act.last_nps_received_days !== undefined && act.last_nps_received_days <= 7) {
                                hasRecent = true;
                            }
                            // Monthly agg
                            if (monthly[act.month]) {
                                monthly[act.month].sum += parseFloat(act.rating);
                                monthly[act.month].count++;
                                if (act.recent) monthly[act.month].recent = true;
                                if (act.last_nps_received_days !== null && act.last_nps_received_days !== undefined && act.last_nps_received_days <= 7) {
                                    monthly[act.month].hasRecent = true;
                                }

                                // Collect strength/improvement if present (take first non-empty)
                                if (!monthly[act.month].strength && act.strength) monthly[act.month].strength = act.strength;
                                if (!monthly[act.month].improvement && act.improvement) monthly[act.month].improvement = act.improvement;
                            }
                        }
                    }
                }
            }
        });
    });

    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : "-";
    const percent = planned > 0 ? Math.round((received / planned) * 100) + "%" : "-";

    // Finalize monthly averages
    let finalizedMonthly = {};
    Object.keys(monthly).forEach(m => {
        if (monthly[m].count > 0) {
            finalizedMonthly[m] = {
                val: (monthly[m].sum / monthly[m].count).toFixed(2),
                recent: monthly[m].recent,
                strength: monthly[m].strength,
                improvement: monthly[m].improvement,
                hasRecent: monthly[m].hasRecent
            };
        } else {
            finalizedMonthly[m] = null;
        }
    });

    const is_approved = (items || []).some(i => i.is_approved === true || i.is_approved === "true");

    return { planned, received, percent, avgRating, monthly: finalizedMonthly, hasRecent, is_approved };
}

function renderSummaryBody(filteredData, year) {
    const body = $("#npsSummaryBody");
    body.empty();

    if (!filteredData || filteredData.length === 0) {
        body.append('<tr><td colspan="20" style="text-align:center; padding: 20px;">No data found matching selections.</td></tr>');
        return;
    }

    // 1. Overall Score Row (Dynamic based on ALL filtered data)
    const overall = calculateAggregates(filteredData, year);
    body.append(`
        <tr class="summary-row-overall">
            <td class="sticky-col" style="left: 0;" colspan="3">Overall Score [Average]</td>
            <td class="col-num" style="display: none;">${valOrDash(overall.planned)}</td>
            <td class="col-num col-received">${valOrDash(overall.received)}</td>
            <td class="col-num col-pct" style="display: none;">${valOrDash(overall.percent)}</td>
            <td class="col-num col-avg-rating"><span class="nps-rating-pill">${valOrDash(overall.avgRating)}</span></td>
            ${renderMonthlyCells(overall.monthly, year, 'overall', filteredData)}
        </tr>
    `);

    // Grouping by Account
    const grouped = {};
    filteredData.forEach(item => {
        if (!grouped[item.account]) grouped[item.account] = { name: item.account, items: [], stakeholders: {} };
        grouped[item.account].items.push(item);
        
        const itemStkName = (typeof item.stakeholder === 'object' ? item.stakeholder.name : (item.stakeholder || ""));
        const stkKey = itemStkName || "Unknown";

        if (!grouped[item.account].stakeholders[stkKey]) {
            grouped[item.account].stakeholders[stkKey] = { 
                name: stkKey, 
                items: [] 
            };
        }
        grouped[item.account].stakeholders[stkKey].items.push(item);
    });

    Object.values(grouped).forEach((acc, accIdx) => {
        const accId = `sum-acc-${accIdx}`;
        const visibleStakeholders = Object.values(acc.stakeholders).filter(stk => {
            const stkAgg = calculateAggregates(stk.items, year);
            return Object.values(stkAgg.monthly).some(mVal => mVal !== null && mVal.val !== '-');
        });
        const hasNoStakeholders = visibleStakeholders.length === 0;

        if (hasNoStakeholders) {
            body.append(`
                <tr class="summary-row-account" data-id="${accId}">
                    <td class="sticky-col" style="left: 0;">
                        <span class="nps-expand-icon" style="visibility: hidden;"><i class="fa fa-chevron-right"></i></span>
                        ${valOrDash(acc.name)}
                    </td>
                    <td class="sticky-col" style="left: 150px;">-</td>
                    <td class="sticky-col" style="left: 330px;">-</td>
                    <td class="col-num" style="display: none;">-</td>
                    <td class="col-num col-received">-</td>
                    <td class="col-num col-pct" style="display: none;">-</td>
                    <td class="col-num col-avg-rating"><span class="nps-rating-pill">-</span></td>
                    ${renderMonthlyCells({}, year, 'sow', [])}
                </tr>
            `);
        } else {
            const accAgg = calculateAggregates(acc.items, year);
            body.append(`
                <tr class="summary-row-account collapsed-row" data-id="${accId}">
                    <td class="sticky-col" style="left: 0;">
                        <span class="nps-expand-icon" onclick="toggleNpsRow('${accId}')"><i class="fa fa-chevron-right"></i></span>
                        ${valOrDash(acc.name)}
                    </td>
                    <td class="sticky-col" style="left: 150px;">Overall</td>
                    <td class="sticky-col" style="left: 330px;"></td>
                    <td class="col-num" style="display: none;">${valOrDash(accAgg.planned)}</td>
                    <td class="col-num col-received">${valOrDash(accAgg.received)}</td>
                    <td class="col-num col-pct" style="display: none;">${valOrDash(accAgg.percent)}</td>
                    <td class="col-num col-avg-rating"><span class="nps-rating-pill ${accAgg.hasRecent ? 'nps-rating-high' : ''}">${valOrDash(accAgg.avgRating)}</span></td>
                    ${renderMonthlyCells(accAgg.monthly, year, 'account', acc.items)}
                </tr>
            `);

            visibleStakeholders.forEach((stk, stkIdx) => {
                const stkId = `${accId}-stk-${stkIdx}`;
                const stkAgg = calculateAggregates(stk.items, year);
                
                // Collect all sow_details
                let allSowDetails = [];
                stk.items.forEach(item => {
                    if (item.sow_details && Array.isArray(item.sow_details)) {
                        allSowDetails.push(...item.sow_details);
                    } else if (item.sow && item.sow !== 'null') {
                        allSowDetails.push({ sow: item.sow, sowId: item.sow, uniqueId: item.accountId + '_' + item.sow });
                    }
                });
                const uniqueSowNames = Array.from(new Set(allSowDetails.map(d => d.sow)));
                let sowColText = '-';
                if (uniqueSowNames.length > 0) {
                    const getSowHtml = (sowName) => {
                        let detail = allSowDetails.find(d => d.sow === sowName);
                        if (detail && detail.uniqueId && detail.sowId) {
                            return `<span class="stakeholder-tag"><a href="javascript:void(0)" class="sow_data_name_all" onclick="sowSummaryResData('${detail.uniqueId}', '${detail.sowId}')" style="text-decoration:none;">${sowName}</a></span>`;
                        } else {
                            return `<span class="stakeholder-tag">${sowName}</span>`;
                        }
                    };

                    sowColText = getSowHtml(uniqueSowNames[0]);
                    if (uniqueSowNames.length > 1) {
                        let remainingHtml = uniqueSowNames.slice(1).map(s => getSowHtml(s)).join('<br/>');
                        sowColText += `
                            <span class="sow-toggle-btn" style="cursor: pointer; display: inline-flex; align-items: center; background: #eef2fa; color: #1a569d; padding: 2px 8px; border-radius: 12px; font-size: 8px; margin-left: 5px; border: 1px solid #d4e0f0; transition: all 0.2s ease;" onclick="toggleSowList(this, false)">
                                +${uniqueSowNames.length - 1}
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

                let stkNameDisplay = valOrDash(stk.name);
                const approvedTagClass = stkAgg.is_approved ? ' approved-stakeholder' : '';
                stkNameDisplay = `<span class="stakeholder-tag${approvedTagClass}">${stkNameDisplay}</span>`;

                body.append(`
                    <tr class="summary-row-sow row-hidden collapsed-row child-of-${accId} ${(stkAgg.is_approved) ? 'nps-row-approved' : ''}" data-id="${stkId}">
                        <td class="sticky-col" style="left: 0;"></td>
                        <td class="sticky-col indent-1" style="left: 150px;">
                            ${stk.items.length > 1 ? `<span class="nps-expand-icon" onclick="toggleNpsRow('${stkId}')"><i class="fa fa-chevron-right"></i></span>` : ''}
                            ${stkNameDisplay}
                        </td>
                        <td class="sticky-col" style="left: 330px;">${sowColText}</td>
                        <td class="col-num" style="display: none;">${valOrDash(stkAgg.planned)}</td>
                        <td class="col-num col-received">${valOrDash(stkAgg.received)}</td>
                        <td class="col-num col-pct" style="display: none;">${valOrDash(stkAgg.percent)}</td>
                        <td class="col-num col-avg-rating"><span class="nps-rating-pill ${stkAgg.hasRecent ? 'nps-rating-high' : ''}">${valOrDash(stkAgg.avgRating)}</span></td>
                        ${renderMonthlyCells(stkAgg.monthly, year, 'sow', stk.items)}
                    </tr>
                `);

                if (stk.items.length > 1) {
                    stk.items.forEach(item => {
                        const itemAgg = calculateAggregates([item], year);
                        let itemSowDisplay = item.sow || '-';
                        if (item.sow_details && item.sow_details.length > 0) {
                            const getDetailHtml = (detail) => {
                                if (detail.uniqueId && detail.sowId) {
                                    return `<span class="stakeholder-tag"><a href="javascript:void(0)" class="sow_data_name_all" onclick="sowSummaryResData('${detail.uniqueId}', '${detail.sowId}')" style="text-decoration:none;">${detail.sow}</a></span>`;
                                } else {
                                    return `<span class="stakeholder-tag">${detail.sow}</span>`;
                                }
                            };
                            itemSowDisplay = getDetailHtml(item.sow_details[0]);
                            if (item.sow_details.length > 1) {
                                let remainingHtml = item.sow_details.slice(1).map(d => getDetailHtml(d)).join('<br/>');
                                itemSowDisplay += `
                                    <span class="sow-toggle-btn" style="cursor: pointer; display: inline-flex; align-items: center; background: #eef2fa; color: #1a569d; padding: 2px 8px; border-radius: 12px; font-size: 8px; margin-left: 5px; border: 1px solid #d4e0f0; transition: all 0.2s ease;" onclick="toggleSowList(this, false)">
                                        +${item.sow_details.length - 1}
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

                        body.append(`
                            <tr class="summary-row-stakeholder row-hidden child-of-${stkId} ${(item.is_approved === true || item.is_approved === "true") ? 'nps-row-approved' : ''}">
                                <td class="sticky-col" style="left: 0;"></td>
                                <td class="sticky-col" style="left: 150px;"></td>
                                <td class="sticky-col indent-2" style="left: 330px;">${valOrDash(itemSowDisplay)}</td>
                                <td class="col-num" style="display: none;">${valOrDash(itemAgg.planned)}</td>
                                <td class="col-num col-received">${valOrDash(itemAgg.received)}</td>
                                <td class="col-num col-pct" style="display: none;">${valOrDash(itemAgg.percent)}</td>
                                <td class="col-num col-avg-rating">${valOrDash(itemAgg.avgRating) !== '-' ? `<span class="nps-rating-pill ${itemAgg.hasRecent ? 'nps-rating-high' : ''}">${itemAgg.avgRating}</span>` : '-'}</td>
                                ${renderMonthlyCells(itemAgg.monthly, year, 'stakeholder')}
                            </tr>
                        `);
                    });
                }
            });
        }
    });
    updateSumHeaderIcons();
}

function updateSumHeaderIcons() {
    const accounts = $(".summary-row-account").filter(function() {
        const icon = $(this).find(".nps-expand-icon");
        return icon.length > 0 && icon.css("visibility") !== "hidden";
    });
    if (accounts.length === 0) return;
    
    const allExpanded = accounts.length === accounts.filter(".expanded-row").length;
    
    if (allExpanded) {
        $("#btnExpandAllSum").hide();
        $("#btnCollapseAllSum").show();
    } else {
        $("#btnExpandAllSum").show();
        $("#btnCollapseAllSum").hide();
    }
}

function renderMonthlyCells(monthlyObj, year, level, items) {
    let html = '';
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach(m => {
        const key = `${m} ${year}`;
        html += renderCell(monthlyObj[key], level, items);
    });
    return html;
}

function renderCell(data, level, items) {
    if (!data || valOrDash(data.val) === '-') return '<td>-</td>';

    const colorClass = (data.hasRecent && level !== 'overall') ? 'nps-rating-high' : '';

    // Feedback indicators only for SOW level
    const hasFeedback = (level === 'sow' && (data.strength || data.improvement));

    // Show dot if (recent OR feedback exists) AND it's not the top Overall row
    const showDot = (data.recent || hasFeedback) && level !== 'overall' && level !== 'account';
    const dotHtml = showDot ? '<span class="nps-recent-dot"></span>' : '';

    const tooltipClass = hasFeedback ? 'nps-tooltip-trigger' : '';
    const strengthAttr = (level === 'sow') ? (data.strength || '') : '';
    const improvementAttr = (level === 'sow') ? (data.improvement || '') : '';

    return `<td><span class="nps-rating-pill ${colorClass} ${tooltipClass}"
                      data-strength="${strengthAttr}"
                      data-improvement="${improvementAttr}">${data.val} ${dotHtml}</span></td>`;
}

function toggleNpsRow(parentId) {
    const row = $(`#npsSummaryTable tr[data-id="${parentId}"]`);
    const isExpanding = row.hasClass("collapsed-row");

    if (isExpanding) {
        row.removeClass("collapsed-row").addClass("expanded-row");
        row.find(".nps-expand-icon i").removeClass("fa-chevron-right").addClass("fa-chevron-down");
        $(`#npsSummaryTable tr.child-of-${parentId}`).removeClass("row-hidden");
    } else {
        row.removeClass("expanded-row").addClass("collapsed-row");
        row.find(".nps-expand-icon i").removeClass("fa-chevron-down").addClass("fa-chevron-right");
        hideDescendants(parentId);
    }
    updateSumHeaderIcons();
}

function hideDescendants(parentId) {
    $(`#npsSummaryTable tr.child-of-${parentId}`).each(function() {
        const row = $(this);
        const rowId = row.data("id");
        row.addClass("row-hidden").removeClass("expanded-row").addClass("collapsed-row");
        if (rowId) hideDescendants(rowId);
    });
}

function updateSumHeaderIcons() {
    const accounts = $("#npsSummaryTable > tbody > .summary-row-account").filter(function() {
        const icon = $(this).find(".nps-expand-icon");
        return icon.length > 0 && icon.css("visibility") !== "hidden";
    });
    if (accounts.length === 0) return;
    
    const allExpanded = accounts.length === accounts.filter(".expanded-row").length;
    
    if (allExpanded) {
        $("#btnExpandAllSum").hide();
        $("#btnCollapseAllSum").show();
    } else {
        $("#btnExpandAllSum").show();
        $("#btnCollapseAllSum").hide();
    }
}

function setupSummaryEventListeners() {
    // Table sorting
    $(document).off("click", "#npsSummaryHeader .sortable-header");
    $(document).on("click", "#npsSummaryHeader .sortable-header", function() {
        const col = $(this).data("sort");
        if (sumSortCol === col) {
            sumSortOrder = sumSortOrder === "asc" ? "desc" : "asc";
        } else {
            sumSortCol = col;
            sumSortOrder = "asc";
        }
        refreshSummaryView();
    });

    // Search is handled globally in npsPlanning.js for this view too, but keeping dedicated if needed
    $("#npsSummarySearch").off("keyup.summary").on("keyup.summary", function() {
        if ($("#npsSummaryView").is(":visible")) {
            refreshSummaryView();
        }
    });

    // Independent summary filters
    $("#sumYear").off("change").on("change", function () {
        refreshSummaryView();
    });

    // Tooltip Logic for Strength/Improvement (matches Buying Center style)
    let tooltipTimeout;

    $(document).off("mouseenter mouseleave", ".nps-tooltip-trigger");
    $(document).off("mouseenter mouseleave", "#npsTooltip");

    $(document).on("mouseenter", ".nps-tooltip-trigger", function(e) {
        clearTimeout(tooltipTimeout);
        const strength = $(this).attr("data-strength");
        const improvement = $(this).attr("data-improvement");
        
        if (!strength && !improvement) return;

        let tooltipHtml = `
            <div class="nps-popover-content">
                ${strength ? `
                <div class="nps-popover-item">
                    <span class="nps-popover-label strength">Strength</span>
                    <span class="nps-popover-text">${strength}</span>
                </div>` : ''}
                ${improvement ? `
                <div class="nps-popover-item">
                    <span class="nps-popover-label improvement">Improvement</span>
                    <span class="nps-popover-text">${improvement}</span>
                </div>` : ''}
            </div>
        `;

        const tooltip = $("#npsTooltip");
        tooltip.html(tooltipHtml).show();

        const rect = e.currentTarget.getBoundingClientRect();
        const tooltipWidth = tooltip.outerWidth();
        const tooltipHeight = tooltip.outerHeight();
        const winWidth = $(window).width();
        const winHeight = $(window).height();

        // Preferred position: Above
        let top = rect.top - tooltipHeight - 12;
        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

        // Vertical boundary check
        if (top < 10) {
            // Not enough space above, try below
            top = rect.bottom + 12;
            
            // If it also goes off the bottom, cap it and align to window edges
            if (top + tooltipHeight > winHeight - 10) {
                // If it's too tall for the viewport, stick it to top/bottom and it will be scrollable
                if (tooltipHeight > winHeight - 40) {
                    top = 10;
                    tooltip.css("max-height", (winHeight - 40) + "px");
                } else {
                    top = winHeight - tooltipHeight - 10;
                }
            }
        }

        // Horizontal boundary check
        if (left < 10) left = 10;
        if (left + tooltipWidth > winWidth - 10) {
            left = winWidth - tooltipWidth - 10;
        }

        tooltip.css({
            top: top + 'px',
            left: left + 'px',
            display: 'block'
        });
    });

    $(document).on("mouseleave", ".nps-tooltip-trigger", function() {
        tooltipTimeout = setTimeout(() => {
            if (!$("#npsTooltip:hover").length) {
                $("#npsTooltip").hide();
            }
        }, 100);
    });

    $(document).on("mouseleave", "#npsTooltip", function() {
        $("#npsTooltip").hide();
    });

    $(document).on("mouseenter", "#npsTooltip", function() {
        clearTimeout(tooltipTimeout);
    });

    // Expand/Collapse All
    $(document).off("click", "#btnExpandAllSum");
    $(document).on("click", "#btnExpandAllSum", function(e) {
        e.stopPropagation();
        $("#npsSummaryTable .summary-row-account.collapsed-row").each(function() {
            const icon = $(this).find(".nps-expand-icon");
            if (icon.length > 0 && icon.css("visibility") !== "hidden") {
                const accId = $(this).attr("data-id");
                toggleNpsRow(accId);
            }
        });
    });

    $(document).off("click", "#btnCollapseAllSum");
    $(document).on("click", "#btnCollapseAllSum", function(e) {
        e.stopPropagation();
        $("#npsSummaryTable .summary-row-account.expanded-row").each(function() {
            const icon = $(this).find(".nps-expand-icon");
            if (icon.length > 0 && icon.css("visibility") !== "hidden") {
                const accId = $(this).attr("data-id");
                toggleNpsRow(accId);
            }
        });
    });

    // Hover effect for header buttons
    $(document).on("mouseenter", ".sum-header-action", function() {
        $(this).css("color", "#ff6b00");
    }).on("mouseleave", ".sum-header-action", function() {
        $(this).css("color", "#666");
    });
}

function applySummaryFilters() {
    refreshSummaryView();
}

// Function to handle SoW name click and redirect to sow.html
function sowSummaryResData(uniqueId, sowId) {
    let uniqId_sowid = uniqueId + '&' + sowId;
    window.open('sow.html?' + uniqId_sowid, '_blank');
}
