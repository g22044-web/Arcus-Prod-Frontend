
let bcRawData = null;
let currentStakeholderType = "Key Stakeholder";
let bcSortCol = "account";
let bcSortOrder = "asc";
let lyKey = "";
let cyKey = "";
let bcExpandedRows = new Set();

function esc(str) {
    if (!str) return "";
    return str.toString().replace(/'/g, "\\'");
}

function formatCurrency(val) {
    if (val === null || val === undefined || val === '' || val === 'null' || val === '-') return '-';
    
    let cleanVal = val.toString().toUpperCase().replace(/[MK$,]/g, '').trim();
    let num = parseFloat(cleanVal);
    if (isNaN(num) || num === 0) return '-';
    
    // If it was already in millions (e.g. "2.09M"), multiply to get full value
    if (val.toString().toUpperCase().includes('M')) {
        num = num * 1000000;
    }
    // If it was already in thousands (e.g. "250.0K"), multiply to get full value
    if (val.toString().toUpperCase().includes('K')) {
        num = num * 1000;
    }
    
    // Format with commas and dollar sign
    return '$' + Math.round(num).toLocaleString('en-US');
}

function valOrDash(val) {
    if (val === null || val === undefined || val === '' || val === '0' || val === 0 || val === '0.0' || val === '0.00' || val === 'null') return '-';
    if (typeof val === 'string' && val.toLowerCase().trim() === 'unassigned') return '-';
    return val;
}

function getFsPartner(member, role) {
    if (!member) return null;

    const memberRole = (role || member.type || "").toString().trim().toLowerCase();
    let partnerKey = null;

    if (memberRole === "superboss") partnerKey = "growthPartner";
    if (memberRole === "key stakeholder") partnerKey = "deliveryPartner";
    if (["stakeholder", "key direct", "key directs", "influencer"].includes(memberRole)) partnerKey = "clientPartner";

    if (!partnerKey) return null;

    const directValue = member[partnerKey];
    if (directValue !== null && directValue !== undefined && directValue.toString().trim() !== "") {
        return directValue;
    }

    const mappedPartners = member.fsPartnerMappings?.[partnerKey];
    if (Array.isArray(mappedPartners)) {
        const names = [...new Set(mappedPartners.map(partner => partner?.employeeName).filter(Boolean))];
        if (names.length > 0) return names.join(", ");
    }

    return null;
}

function normalizeBCMemberName(name) {
    return (name || "").toString().trim().toLowerCase();
}

function isPlaceholderBCMember(member) {
    const name = normalizeBCMemberName(member?.name);
    return !name || name === "-" || name === "unassigned";
}

function findReferencedBCMember(members, referenceName, type) {
    const normalizedReference = normalizeBCMemberName(referenceName);
    if (!normalizedReference) return null;

    return (members || []).find(member =>
        normalizeBCMemberName(member?.type) === normalizeBCMemberName(type) &&
        normalizeBCMemberName(member?.name) === normalizedReference
    ) || null;
}

function findKeyStakeholderForStakeholder(members, stakeholder) {
    return findReferencedBCMember(members, stakeholder?.keyStakeholderRef, "Key Stakeholder") ||
        (members || []).find(member => normalizeBCMemberName(member?.type) === "key stakeholder") ||
        null;
}

function findStakeholderForInfluencer(members, influencer) {
    return findReferencedBCMember(members, influencer?.stakeholderRef, "Stakeholder");
}

function isDeletedMember(member) {
    return member && member.status === "Deleted";
}

function getDeletedHistoryMembers(member) {
    if (!member || !Array.isArray(member.history)) return [];

    const currentName = (member.name || '').toString().trim().toLowerCase();
    const deletedMembers = [];
    const seen = new Set();

    member.history.forEach(hist => {
        if (!hist || hist.status !== "Deleted" || !hist.name) return;

        const histName = hist.name.toString().trim();
        const histKey = histName.toLowerCase();
        if (!histName || histKey === currentName || seen.has(histKey)) return;

        seen.add(histKey);
        deletedMembers.push(hist);
    });

    deletedMembers.sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase()));
    return deletedMembers;
}

function formatMemberName(member) {
    if (!member || !member.name) return '-';
    const safeName = valOrDash(member.name);
    if (safeName === '-') return '-';
    return isDeletedMember(member) ? `<span class="deleted-member-chip">${safeName}</span>` : safeName;
}

function formatSuperbossName(member) {
    if (!member || !member.name) return '-';
    const safeName = valOrDash(member.name);
    if (safeName === '-') return '-';

    const activeName = isDeletedMember(member)
        ? `<span class="deleted-member-chip">${safeName}</span>`
        : safeName;
    const deletedHistoryNames = getDeletedHistoryMembers(member).map(formatMemberName);

    return [activeName].concat(deletedHistoryNames).join(', ');
}

function formatSuperbossHistoryRow(member, rowClass) {
    if (!member) return '';

    const lyRevenue = formatCurrency(member[lyKey]);
    const cyRevenue = formatCurrency(member[cyKey]);

    return `
        <tr class="${rowClass}">
            <td class="sticky-col bc-sticky-col-1" style="left: 0;"></td>
            <td class="sticky-col bc-sticky-col-2" style="left: 180px;"></td>
            <td class="name-col">${formatMemberName(member)}</td>
            <td class="name-col">${valOrDash(getFsPartner(member, "Superboss"))}</td>
            <td class="name-col">-</td>
            <td class="name-col">-</td>
            <td class="col-num">-</td>
            <td>-</td>
            <td class="stk-col-cell name-col">-</td>
            <td class="stk-col-cell name-col">-</td>
            <td class="stk-col-cell col-num">-</td>
            <td class="stk-col-cell">-</td>
            <td class="inf-col-cell name-col">-</td>
            <td class="inf-col-cell name-col">-</td>
            <td class="inf-col-cell col-num">-</td>
            <td class="inf-col-cell">-</td>
            ${currentStakeholderType !== "Influencer" ? `
                <td class="col-num">${lyRevenue}</td>
                <td class="col-num">${cyRevenue}</td>
            ` : ''}
        </tr>
    `;
}

function formatMemberList(members) {
    const uniqueMembers = [];
    const seen = new Set();

    (members || []).forEach(member => {
        if (!member || !member.name) return;
        const key = `${member.name}__${member.status || ''}`;
        if (seen.has(key)) return;
        seen.add(key);
        uniqueMembers.push(member);
    });

    if (uniqueMembers.length === 0) return '-';

    uniqueMembers.sort((a, b) => {
        const aDeleted = isDeletedMember(a) ? 1 : 0;
        const bDeleted = isDeletedMember(b) ? 1 : 0;
        if (aDeleted !== bDeleted) return aDeleted - bDeleted;

        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        if (aName < bName) return -1;
        if (aName > bName) return 1;
        return 0;
    });

    return uniqueMembers.map(formatMemberName).join(', ');
}

function getUniqueMemberCount(members) {
    const seen = new Set();

    (members || []).forEach(member => {
        if (!member || !member.name) return;
        const key = `${member.name}__${member.status || ''}`;
        seen.add(key);
    });

    return seen.size;
}

function getCurrentTypeMember(item) {
    if (!item) return null;
    if (currentStakeholderType === "Stakeholder") return item.stakeholder || null;
    if (currentStakeholderType === "Influencer") return item.influencer || null;
    return item.keyStakeholder || null;
}

function compareDeletedLast(itemA, itemB) {
    const memberA = getCurrentTypeMember(itemA);
    const memberB = getCurrentTypeMember(itemB);
    const aDeleted = isDeletedMember(memberA) ? 1 : 0;
    const bDeleted = isDeletedMember(memberB) ? 1 : 0;
    return aDeleted - bDeleted;
}



function isRecentNps(dateStr) {
    if (!dateStr || dateStr === '-') return false;
    try {
        const npsDate = new Date(dateStr);
        if (isNaN(npsDate.getTime())) return false;
        
        // Use date-only comparison to avoid time-of-day issues
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


function formatToMonthYear(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear().toString().slice(-2);
    return `${month}-${year}`;
}

$(function() {
    setupBCEventListeners();
});

function toggleBCRow(parentId) {
    const row = $(`#npsBuyingCenterTable tr[data-id="${parentId}"]`);
    const isExpanding = row.hasClass("collapsed-row");
    const isBcSummaryRow = row.hasClass("summary-row-bc");
    const isAccountSummaryRow = row.hasClass("summary-row-account");

    if (isExpanding) {
        row.removeClass("collapsed-row").addClass("expanded-row");
        row.find(".nps-expand-icon i").removeClass("fa-chevron-right").addClass("fa-chevron-down");
        if (isBcSummaryRow || isAccountSummaryRow) row.addClass("row-hidden");
        bcExpandedRows.add(parentId);
        $(`#npsBuyingCenterTable tr.child-of-${parentId}`).each(function() {
            $(this).removeClass("row-hidden");
        });
    } else {
        row.removeClass("expanded-row").addClass("collapsed-row");
        row.find(".nps-expand-icon i").removeClass("fa-chevron-down").addClass("fa-chevron-right");
        if (isBcSummaryRow || isAccountSummaryRow) row.removeClass("row-hidden");
        bcExpandedRows.delete(parentId);
        hideBCDescendants(parentId);
    }
    syncExpandedAccountDisplays();
    updateBCHeaderIcons();
}

function hideBCDescendants(parentId) {
    $(`#npsBuyingCenterTable tr.child-of-${parentId}`).each(function() {
        const row = $(this);
        const rowId = row.data("id");
        row.addClass("row-hidden").removeClass("expanded-row").addClass("collapsed-row");
        if (rowId) hideBCDescendants(rowId);
    });
}

function getBCDescendants(parentId) {
    let descendants = $();

    $(`#npsBuyingCenterTable tr.child-of-${parentId}`).each(function() {
        descendants = descendants.add(this);
        const rowId = $(this).data("id");
        if (rowId) {
            descendants = descendants.add(getBCDescendants(rowId));
        }
    });

    return descendants;
}

function syncExpandedAccountDisplays() {
    $("#npsBuyingCenterTable tr.summary-row-account").each(function() {
        const accountRow = $(this);
        const accountId = accountRow.data("id");
        const accountCellHtml = accountRow.find("td.bc-sticky-col-1").html() || "";
        const descendants = getBCDescendants(accountId);

        descendants.find("td.bc-sticky-col-1").html("");

        const isExpanded = accountRow.hasClass("expanded-row") || accountRow.hasClass("row-hidden");
        if (!isExpanded) return;

        const firstVisibleRow = descendants.filter(function() {
            return !$(this).hasClass("row-hidden");
        }).first();

        if (firstVisibleRow.length) {
            firstVisibleRow.find("td.bc-sticky-col-1").html(accountCellHtml);
        }
    });
}


function updateBCHeaderIcons() {
    const accounts = $("#npsBuyingCenterTable > tbody > .summary-row-account").filter(function() {
        const icon = $(this).find(".nps-expand-icon");
        return icon.length > 0 && icon.css("visibility") !== "hidden";
    });
    if (accounts.length === 0) return;
    
    const allExpanded = accounts.length === accounts.filter(".expanded-row").length;
    
    if (allExpanded) {
        $("#btnExpandAllBC").hide();
        $("#btnCollapseAllBC").show();
    } else {
        $("#btnExpandAllBC").show();
        $("#btnCollapseAllBC").hide();
    }
}

function initNPSBuyingCenter() {
    if (!bcRawData) {
        fetchBCData();
    } else {
        syncBCFilters();
        refreshBCView();
        $("#npsBuyingCenterView").addClass("active-view").show();
        $("#bcFilters, #bcStakeholderToggles").show();
        $(".nps-filters, #npsBuyingCenterTable thead").show();
    }

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    lyKey = `fy${lastYear.toString().slice(-2)}`;
    cyKey = `fy${currentYear.toString().slice(-2)}`;

    // Update header text without destroying icons
    $("#bcHeaderLy .header-text").text(`FY${lastYear.toString().slice(-2)}`);
    $("#bcHeaderCy .header-text").text(`FY${currentYear.toString().slice(-2)}`);

    // Ensure table scrolls and headers are sticky
    $("#buyingCenterDetailedCard").css({"max-height": "800px", "overflow-y": "auto"});
    
    setupBCEventListeners();
}

function fetchBCData() {
    $(".nps-filters, #npsBuyingCenterTable thead").hide();
    $(".loader-overlay").show();
    let emp_id = localStorage.getItem("EmpUserID");
    let apiURL = apiValue.url.replace("/app", `/cnps/buying-center?employee_id=${emp_id}`);
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
            
            let list = [];
            if (Array.isArray(data)) {
                list = data;
            } else if (data && data.buyingCenters) {
                list = data.buyingCenters;
            }
            
            list.forEach(r => {
                if (r.account) r.account = decodeHtml(r.account);
                if (r.buyingCenterName) r.buyingCenterName = decodeHtml(r.buyingCenterName);
                if (r.superboss && r.superboss.name) r.superboss.name = decodeHtml(r.superboss.name);
                if (r.stakeholders) {
                    r.stakeholders.forEach(s => {
                        if (s.name) s.name = decodeHtml(s.name);
                        if (s.keyStakeholderRef) s.keyStakeholderRef = decodeHtml(s.keyStakeholderRef);
                        if (s.stakeholderRef) s.stakeholderRef = decodeHtml(s.stakeholderRef);
                    });
                }
            });

            bcRawData = list;
            populateBCFilters();
            refreshBCView();
            $("#npsBuyingCenterView").addClass("active-view").show();
            $("#bcFilters, #bcStakeholderToggles").show();
            $(".nps-filters, #npsBuyingCenterTable thead").show();
            $("#npsSeparator").hide();
            $("#buyingCenterDetailedCard").css({"max-height": "800px", "overflow-y": "auto"});
            $(".loader-overlay").hide();
        },
        error: function(error) {
            console.error("Error loading NPS Buying Center data", error);
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

function populateBCFilters() {
    syncBCFilters();
}

/**
 * Checks if a Buying Center record matches the current filter state.
 * @param {Object} bc The Buying Center record.
 * @param {String} skipField Optional field to skip (for cascading filters).
 * @returns {Boolean}
 */
/**
 * Checks if a specific stakeholder matches the current KS/STK filter state.
 */
function stakeholderMatchesFilters(s, bc, skipField = "") {
    if (!s || !bc) return false;
    const stks = bc.stakeholders || [];
    const selKS = $("#bcKeyStakeholder").val() || [];
    const selSTK = $("#bcStakeholder").val() || [];
    
    const skipKS = skipField === 'ks';
    const skipSTK = skipField === 'stk';
    const type = (s.type || "").toLowerCase();

    // 1. Key Stakeholder Filter Check
    if (!skipKS && selKS.length > 0) {
        if (type === "key stakeholder") {
            if (!selKS.includes(s.name)) return false;
        } else if (type === "stakeholder") {
            const ks = stks.find(k => k.name === s.keyStakeholderRef && (k.type || "").toLowerCase() === "key stakeholder") || 
                       stks.find(k => (k.type || "").toLowerCase() === "key stakeholder");
            if (!ks || !selKS.includes(ks.name)) return false;
        } else if (type === "influencer") {
            const st = stks.find(stk => stk.name === s.stakeholderRef && (stk.type || "").toLowerCase() === "stakeholder");
            const ks = st ? stks.find(k => k.name === st.keyStakeholderRef && (k.type || "").toLowerCase() === "key stakeholder") : 
                            stks.find(k => (k.type || "").toLowerCase() === "key stakeholder");
            if (!ks || !selKS.includes(ks.name)) return false;
        }
    }

    // 2. Stakeholder Filter Check
    if (!skipSTK && selSTK.length > 0) {
        if (type === "stakeholder" || type === "influencer") {
            if (!selSTK.includes(s.name)) return false;
        } else if (type === "key stakeholder") {
            // For KS mode, show if ANY of its reporting stakeholders match
            const hasChildMatch = stks.some(child => {
                const cType = (child.type || "").toLowerCase();
                if (cType !== "stakeholder" && cType !== "influencer") return false;
                if (!selSTK.includes(child.name)) return false;
                
                // Lineage check: is 's' the parent?
                if (cType === "stakeholder") {
                    const parentKS = stks.find(k => k.name === child.keyStakeholderRef && k.type.toLowerCase() === "key stakeholder") || 
                                     stks.find(k => k.type.toLowerCase() === "key stakeholder");
                    return parentKS && parentKS.name === s.name;
                } else {
                    const st = stks.find(stk => stk.name === child.stakeholderRef);
                    const ks = st ? stks.find(k => k.name === st.keyStakeholderRef && k.type.toLowerCase() === "key stakeholder") : 
                                    stks.find(k => k.type.toLowerCase() === "key stakeholder");
                    return ks && ks.name === s.name;
                }
            });
            if (!hasChildMatch) return false;
        }
    }
    return true;
}

/**
 * Checks if a Buying Center record matches the current filter state.
 * @param {Object} bc The Buying Center record.
 * @param {String} skipField Optional field to skip (for cascading filters).
 * @returns {Boolean}
 */
function bcRecordMatches(bc, skipField = "") {
    if (!bc) return false;

    const selAccounts = $("#bcAccount").val() || [];
    const selBCs = $("#bcBuyingCenter").val() || [];
    const selSuperbosses = $("#bcSuperboss").val() || [];

    // 1. Account / BC / Superboss check
    if (skipField !== 'account' && selAccounts.length > 0 && !selAccounts.includes(bc.account)) return false;
    if (skipField !== 'bc' && selBCs.length > 0 && !selBCs.includes(bc.buyingCenterName)) return false;
    const sbName = bc.superboss ? bc.superboss.name : "";
    if (skipField !== 'superboss' && selSuperbosses.length > 0 && !selSuperbosses.includes(sbName)) return false;

    // 2. Record must have at least one matching stakeholder of the active type
    const stks = bc.stakeholders || [];
    const activeType = (currentStakeholderType || "").toLowerCase();
    
    return stks.some(s => {
        if ((s.type || "").toLowerCase() !== activeType) return false;
        return stakeholderMatchesFilters(s, bc, skipField);
    });
}

function syncBCFilters(changedId = null) {
    if (!bcRawData) return;

    const selAccounts = $("#bcAccount").val() || [];
    const selBCs = $("#bcBuyingCenter").val() || [];
    const selSuperbosses = $("#bcSuperboss").val() || [];
    const selKeyStakeholders = $("#bcKeyStakeholder").val() || [];
    const selStakeholders = $("#bcStakeholder").val() || [];

    // 1. Account Filter
    const availAccounts = new Set(bcRawData.filter(b => bcRecordMatches(b, 'account')).map(b => b.account));
    updateBCSelect($("#bcAccount"), availAccounts, "Account", selAccounts, changedId);

    // 2. Buying Center Filter
    const availBCs = new Set(bcRawData.filter(b => bcRecordMatches(b, 'bc')).map(b => b.buyingCenterName));
    updateBCSelect($("#bcBuyingCenter"), availBCs, "Buying Center", selBCs, changedId);

    // 3. Superboss Filter
    const availSB = new Set(bcRawData.filter(b => bcRecordMatches(b, 'superboss')).filter(b => b.superboss).map(b => b.superboss.name));
    updateBCSelect($("#bcSuperboss"), availSB, "Superboss", selSuperbosses, changedId);

    // 4. Key Stakeholder Filter
    const availKS = new Set();
    bcRawData.filter(b => bcRecordMatches(b, 'ks')).forEach(b => {
        const stks = b.stakeholders || [];
        const activeType = (currentStakeholderType || "").toLowerCase();
        
        stks.forEach(s => {
            const type = (s.type || "").toLowerCase();
            if (activeType === "influencer") {
                if (type === "influencer") {
                    const st = stks.find(stk => stk.name === s.stakeholderRef && (stk.type || "").toLowerCase() === "stakeholder");
                    const ks = st ? stks.find(k => k.name === st.keyStakeholderRef && (k.type || "").toLowerCase() === "key stakeholder") : 
                                    stks.find(k => (k.type || "").toLowerCase() === "key stakeholder");
                    if (ks) availKS.add(ks.name);
                }
            } else if (activeType === "stakeholder") {
                if (type === "stakeholder") {
                    const ks = stks.find(k => k.name === s.keyStakeholderRef && (k.type || "").toLowerCase() === "key stakeholder") || 
                               stks.find(k => (k.type || "").toLowerCase() === "key stakeholder");
                    if (ks) availKS.add(ks.name);
                }
            } else {
                if (type === "key stakeholder") availKS.add(s.name);
            }
        });
    });
    updateBCSelect($("#bcKeyStakeholder"), availKS, "Key Stakeholder", selKeyStakeholders, changedId);

    // 5. Stakeholder Filter
    const availSTK = new Set();
    bcRawData.filter(b => bcRecordMatches(b, 'stk')).forEach(b => {
        const stks = b.stakeholders || [];
        const activeType = (currentStakeholderType || "").toLowerCase();
        
        stks.forEach(s => {
            const type = (s.type || "").toLowerCase();
            if (activeType === "influencer") {
                if (type === "influencer") {
                    const st = stks.find(stk => stk.name === s.stakeholderRef && (stk.type || "").toLowerCase() === "stakeholder");
                    if (st) availSTK.add(st.name);
                    availSTK.add(s.name); // Include influencer names in the stakeholder filter too
                }
            } else if (activeType === "stakeholder") {
                if (type === "stakeholder") availSTK.add(s.name);
            }
        });
    });
    updateBCSelect($("#bcStakeholder"), availSTK, "Stakeholder", selStakeholders, changedId);

    syncBCFilterVisibility();
}

function syncBCFilterVisibility() {
    const type = (currentStakeholderType || "").toLowerCase();
    const isStkOrInf = type === "stakeholder" || type === "influencer";
    
    // The multiselect plugin creates a div with class .ms-options-wrap next to the select
    const $acc = $("#bcAccount").next(".ms-options-wrap");
    const $bc = $("#bcBuyingCenter").next(".ms-options-wrap");
    const $sb = $("#bcSuperboss").next(".ms-options-wrap");
    const $ks = $("#bcKeyStakeholder").next(".ms-options-wrap");
    const $stk = $("#bcStakeholder").next(".ms-options-wrap");

    if (isStkOrInf) {
        $acc.show();
        $bc.show();
        $sb.show();
        $ks.show();
        $stk.show();
    } else {
        $acc.show();
        $bc.show();
        $sb.show();
        $ks.show();
        $stk.hide();
    }
}

function updateBCSelect(select, set, label, currentSelection, changedId) {
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
    
    // Refresh multiselect if already initialized, else initialize
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
                    syncBCFilters(id);
                    refreshBCView(); 
                }, 100);
            },
            onSelectAll: function() { 
                const id = select.attr('id');
                setTimeout(() => {
                    syncBCFilters(id);
                    refreshBCView(); 
                }, 100);
            }
        });
    }
}

function refreshBCView() {
    const filtered = getFilteredBCData();
    renderBCTable(filtered);
    syncBCFilterVisibility();
}

function getFilteredBCData() {
    const search = ($("#npsBcSearch").val() || "").toLowerCase();
    
    // Filter records using the common matching logic
    const matchingBCs = bcRawData.filter(b => {
        const sbName = b.superboss ? b.superboss.name : "";
        const sbPartner = getFsPartner(b.superboss, "Superboss") || "";
        const stks = b.stakeholders || [];
        
        // Collect all names and partners from all stakeholders in this BC
        const allPersonnel = stks.map(s => (s.name || "").toLowerCase());
        const allPartners = stks.map(s => (getFsPartner(s) || "").toLowerCase());
        const allDates = stks.map(s => (s.lastNpsDate || "").toLowerCase());
        const allRatings = stks.map(s => (s.avgNps != null ? s.avgNps.toString() : "").toLowerCase());

        const matchesSearch = !search || 
                             (b.account || "").toLowerCase().includes(search) || 
                             (b.buyingCenterName || "").toLowerCase().includes(search) || 
                             (sbName || "").toLowerCase().includes(search) ||
                             (sbPartner || "").toLowerCase().includes(search) ||
                             allPersonnel.some(p => p.includes(search)) ||
                             allPartners.some(p => p.includes(search)) ||
                             allDates.some(d => d.includes(search)) ||
                             allRatings.some(r => r.includes(search)) ||
                             (b.lyRevTotal || 0).toString().includes(search) ||
                             (b.cyRevTotal || 0).toString().includes(search);
        
        return matchesSearch && bcRecordMatches(b);
    });

    const results = [];
    matchingBCs.forEach(bc => {
        const stks = bc.stakeholders || [];
        const activeType = (currentStakeholderType || "").toLowerCase();
        const resultCountBeforeBC = results.length;

        const addResult = (ks, stk, inf) => {
            results.push({
                account: bc.account,
                buyingCenter: bc.buyingCenterName,
                accountLastNpsDate: bc.accountLastNpsDate,
                BCLastNpsDate: bc.BcLastNpsDate ?? bc.BCLastNpsDate,
                accountRevenue: bc.accountRevenue,
                bcRevenue: bc.bcRevenue,
                superboss: bc.superboss,
                keyStakeholder: ks,
                stakeholder: stk,
                influencer: inf,
                history: bc.nps_stakeholder_history || []
            });
        };

        if (activeType === "influencer") {
            const filteredInfluencers = stks.filter(member =>
                normalizeBCMemberName(member?.type) === "influencer" &&
                stakeholderMatchesFilters(member, bc)
            );
            const stakeholders = stks.filter(member =>
                normalizeBCMemberName(member?.type) === "stakeholder" &&
                stakeholderMatchesFilters(member, bc)
            );
            const representedStakeholders = new Set();

            filteredInfluencers.filter(member => !isPlaceholderBCMember(member)).forEach(inf => {
                const stk = findStakeholderForInfluencer(stks, inf);
                if (stk) representedStakeholders.add(stk);
                addResult(findKeyStakeholderForStakeholder(stks, stk), stk, inf);
            });

            // The API commonly returns a placeholder Influencer with no
            // stakeholderRef. Keep the real stakeholder rows visible in that
            // case so their names and client-partner mappings are not lost.
            stakeholders.filter(stk => !representedStakeholders.has(stk)).forEach(stk => {
                addResult(findKeyStakeholderForStakeholder(stks, stk), stk, null);
            });

            if (stakeholders.length === 0 && results.length === resultCountBeforeBC && filteredInfluencers.length > 0) {
                addResult(null, null, filteredInfluencers[0]);
            }
            return;
        }
        
        // Only include stakeholders of the active type that ALSO match the filters
        const filteredActiveStks = stks.filter(s => {
            if ((s.type || "").toLowerCase() !== activeType) return false;
            return stakeholderMatchesFilters(s, bc);
        });
        
        filteredActiveStks.forEach(s => {
            let ks = null, stk = null, inf = null;
            
            if (activeType === "key stakeholder") {
                ks = s;
            } else if (activeType === "stakeholder") {
                stk = s;
                ks = findKeyStakeholderForStakeholder(stks, stk);
            }

            addResult(ks, stk, inf);
        });
    });

    return results;
}

function renderBCTable(data) {
    const body = $("#npsBuyingCenterBody");
    body.empty();

    // Toggle stakeholder and influencer column group visibility
    const type = (currentStakeholderType || "").toLowerCase();
    if (type === "key stakeholder") {
        $("#stkGroupHeader, .stk-header-cell, .stk-col-cell").hide();
        $("#infGroupHeader, .inf-header-cell, .inf-col-cell").hide();
    } else if (type === "stakeholder") {
        $("#stkGroupHeader, .stk-header-cell, .stk-col-cell").show();
        $("#infGroupHeader, .inf-header-cell, .inf-col-cell").hide();
    } else if (type === "influencer") {
        $("#stkGroupHeader, .stk-header-cell, .stk-col-cell").show();
        $("#infGroupHeader, .inf-header-cell, .inf-col-cell").show();
    }

    if (data.length === 0) {
        let colspan = 18;
        if (currentStakeholderType === "Influencer") colspan = 16;
        body.append(`<tr><td colspan="${colspan}" style="text-align:center; padding:30px;">No data found for the selected criteria.</td></tr>`);
        return;
    }
    if (!lyKey || !cyKey) {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;
        lyKey = `fy${lastYear.toString().slice(-2)}`;
        cyKey = `fy${currentYear.toString().slice(-2)}`;
    }

    const getItemCyRev = (item) => {
        if (currentStakeholderType === "Stakeholder") {
            return parseFloat(item.stakeholder ? item.stakeholder[cyKey] : 0) || 0;
        } else if (currentStakeholderType === "Influencer") {
            return parseFloat(item.influencer ? item.influencer[cyKey] : 0) || 0;
        } else {
            return parseFloat(item.keyStakeholder ? item.keyStakeholder[cyKey] : 0) || 0;
        }
    };

    // Account and buying-center summaries are authoritative totals supplied by
    // the API. Stakeholder revenue is only the portion assigned to that person,
    // so summing it can understate the Signed SoWs total on summary rows.
    const getSummaryRevenue = (revenue, fyKey) => {
        const value = revenue?.[fyKey]?.actualProjected;
        if (value === null || value === undefined || value === "") return null;
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : null;
    };

    // 1. Group data by account and calculate aggregates
    const groups = {};
    data.forEach(item => {
        if (!groups[item.account]) {
            const accountLyRevenue = getSummaryRevenue(item.accountRevenue, lyKey);
            const accountCyRevenue = getSummaryRevenue(item.accountRevenue, cyKey);
            groups[item.account] = {
                name: item.account,
                bcs: {},
                ksSum: 0, ksCount: 0,
                sSum: 0, sCount: 0,
                iSum: 0, iCount: 0,
                lyRevTotal: accountLyRevenue ?? 0,
                cyRevTotal: accountCyRevenue ?? 0,
                hasLyRevenueSummary: accountLyRevenue !== null,
                hasCyRevenueSummary: accountCyRevenue !== null,
                accountLastNpsDate: item.accountLastNpsDate,
                hasRecentKs: false, hasRecentS: false, hasRecentI: false
            };
        }
        const g = groups[item.account];
        if (!g.accountLastNpsDate && item.accountLastNpsDate) {
            g.accountLastNpsDate = item.accountLastNpsDate;
        }
        
        if (!g.bcs[item.buyingCenter]) {
            const bcLyRevenue = getSummaryRevenue(item.bcRevenue, lyKey);
            const bcCyRevenue = getSummaryRevenue(item.bcRevenue, cyKey);
            g.bcs[item.buyingCenter] = {
                name: item.buyingCenter,
                account: item.account,
                items: [],
                superboss: item.superboss,
                ksSum: 0, ksCount: 0,
                sSum: 0, sCount: 0,
                iSum: 0, iCount: 0,
                lyRevTotal: bcLyRevenue ?? 0,
                cyRevTotal: bcCyRevenue ?? 0,
                hasLyRevenueSummary: bcLyRevenue !== null,
                hasCyRevenueSummary: bcCyRevenue !== null,
                BCLastNpsDate: item.BCLastNpsDate,
                hasRecentKs: false, hasRecentS: false, hasRecentI: false
            };
        }
        const bc = g.bcs[item.buyingCenter];
        if (!bc.BCLastNpsDate && item.BCLastNpsDate) {
            bc.BCLastNpsDate = item.BCLastNpsDate;
        }
        bc.items.push(item);


        
        // Aggregates for both levels
        if (item.keyStakeholder && item.keyStakeholder.avgNps !== null) {
            const val = parseFloat(item.keyStakeholder.avgNps);
            g.ksSum += val; g.ksCount++;
            bc.ksSum += val; bc.ksCount++;
            const receivedDays = item.keyStakeholder.last_nps_received_days;
            if ((receivedDays !== undefined && receivedDays !== null && receivedDays !== '' && parseFloat(receivedDays) <= 7) || isRecentNps(item.keyStakeholder.lastNpsDate)) {
                g.hasRecentKs = true;
                bc.hasRecentKs = true;
                item.hasRecentKs = true;
            }
        }
        if (item.stakeholder && item.stakeholder.avgNps !== null) {
            const val = parseFloat(item.stakeholder.avgNps);
            g.sSum += val; g.sCount++;
            bc.sSum += val; bc.sCount++;
            const receivedDays = item.stakeholder.last_nps_received_days;
            if ((receivedDays !== undefined && receivedDays !== null && receivedDays !== '' && parseFloat(receivedDays) <= 7) || isRecentNps(item.stakeholder.lastNpsDate)) {
                g.hasRecentS = true;
                bc.hasRecentS = true;
                item.hasRecentS = true;
            }
        }
        if (item.influencer && item.influencer.avgNps !== null) {
            const val = parseFloat(item.influencer.avgNps);
            g.iSum += val; g.iCount++;
            bc.iSum += val; bc.iCount++;
            const receivedDays = item.influencer.last_nps_received_days;
            if ((receivedDays !== undefined && receivedDays !== null && receivedDays !== '' && parseFloat(receivedDays) <= 7) || isRecentNps(item.influencer.lastNpsDate)) {
                g.hasRecentI = true;
                bc.hasRecentI = true;
                item.hasRecentI = true;
            }
        }


        let ly = 0, cy = 0;
        if (currentStakeholderType === "Stakeholder") {
            ly = parseFloat(item.stakeholder ? item.stakeholder[lyKey] : 0) || 0;
            cy = parseFloat(item.stakeholder ? item.stakeholder[cyKey] : 0) || 0;
        } else if (currentStakeholderType === "Influencer") {
            ly = parseFloat(item.influencer ? item.influencer[lyKey] : 0) || 0;
            cy = parseFloat(item.influencer ? item.influencer[cyKey] : 0) || 0;
        } else {
            ly = parseFloat(item.keyStakeholder ? item.keyStakeholder[lyKey] : 0) || 0;
            cy = parseFloat(item.keyStakeholder ? item.keyStakeholder[cyKey] : 0) || 0;
        }
        if (!g.hasLyRevenueSummary) g.lyRevTotal += ly;
        if (!g.hasCyRevenueSummary) g.cyRevTotal += cy;
        if (!bc.hasLyRevenueSummary) bc.lyRevTotal += ly;
        if (!bc.hasCyRevenueSummary) bc.cyRevTotal += cy;
    });

    const accountList = Object.values(groups).map(g => {
        return {
            ...g,
            ksAvg: g.ksCount > 0 ? (g.ksSum / g.ksCount) : 0,
            sAvg: g.sCount > 0 ? (g.sSum / g.sCount) : 0,
            iAvg: g.iCount > 0 ? (g.iSum / g.iCount) : 0
        };
    });

    // Helper for sorting
    const getSortValue = (item, col) => {
        switch(col) {
            case "account": return item.account || item.name || "";
            case "buyingCenter": return item.buyingCenter || item.name || "";
            case "sbName": return item.superboss ? item.superboss.name : (item.sbName || "");
            case "sbPartner": return item.superboss ? getFsPartner(item.superboss, "Superboss") : (item.sbPartner || "");
            case "ksName": return item.keyStakeholder ? item.keyStakeholder.name : (item.ksName || "");
            case "ksPartner": return item.keyStakeholder ? getFsPartner(item.keyStakeholder, "Key Stakeholder") : (item.ksPartner || "");
            case "ksAvgNps": return item.keyStakeholder ? (parseFloat(item.keyStakeholder.avgNps) || 0) : (item.ksAvg || 0);
            case "ksLastDate": return item.keyStakeholder ? item.keyStakeholder.lastNpsDate : (item.ksLastDate || "");
            case "sName": return item.stakeholder ? item.stakeholder.name : (item.sName || "");
            case "sPartner": return item.stakeholder ? getFsPartner(item.stakeholder, "Stakeholder") : (item.sPartner || "");
            case "sAvgNps": return item.stakeholder ? (parseFloat(item.stakeholder.avgNps) || 0) : (item.sAvg || 0);
            case "sLastDate": return item.stakeholder ? item.stakeholder.lastNpsDate : (item.sLastDate || "");
            case "iName": return item.influencer ? item.influencer.name : (item.iName || "");
            case "iPartner": return item.influencer ? getFsPartner(item.influencer, "Key Directs") : (item.iPartner || "");
            case "iAvgNps": return item.influencer ? (parseFloat(item.influencer.avgNps) || 0) : (item.iAvg || 0);
            case "iLastDate": return item.influencer ? item.influencer.lastNpsDate : (item.iLastDate || "");
            case "lyRev": 
                if (item.bcs) return item.lyRevTotal;
                if (item.items) return item.lyRevTotal;
                if (currentStakeholderType === "Influencer") return item.influencer ? item.influencer[lyKey] : 0;
                if (currentStakeholderType === "Stakeholder") return item.stakeholder ? item.stakeholder[lyKey] : 0;
                return item.keyStakeholder ? item.keyStakeholder[lyKey] : 0;
            case "cyRev":
                if (item.bcs) return item.cyRevTotal;
                if (item.items) return item.cyRevTotal;
                if (currentStakeholderType === "Influencer") return item.influencer ? item.influencer[cyKey] : 0;
                if (currentStakeholderType === "Stakeholder") return item.stakeholder ? item.stakeholder[cyKey] : 0;
                return item.keyStakeholder ? item.keyStakeholder[cyKey] : 0;
            default: return item.account || item.name || "";
        }
    };

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

    const sortFn = (a, b) => {
        let valA = getSortValue(a, bcSortCol);
        let valB = getSortValue(b, bcSortCol);
        
        if (bcSortCol === "account") {
            let pA = getAccountPriority(valA);
            let pB = getAccountPriority(valB);
            if (pA !== pB) {
                return bcSortOrder === "asc" ? pA - pB : pB - pA;
            }
        }

        const numericCols = ["ksAvgNps", "sAvgNps", "iAvgNps", "lyRev", "cyRev"];
        if (numericCols.includes(bcSortCol)) {
            valA = parseFloat((valA || 0).toString().replace(/[M$]/g, '')) || 0;
            valB = parseFloat((valB || 0).toString().replace(/[M$]/g, '')) || 0;
        } else {
            valA = (valA || "").toString().toLowerCase();
            valB = (valB || "").toString().toLowerCase();
        }

        if (valA < valB) return bcSortOrder === "asc" ? -1 : 1;
        if (valA > valB) return bcSortOrder === "asc" ? 1 : -1;
        return 0;
    };

    // Sort accounts
    accountList.sort(sortFn);

    // Render
    accountList.forEach((acc, accIdx) => {
        const accId = `bc-acc-${acc.name.replace(/[^a-z0-9]/gi, '_')}`;
        
        // Sort BCs within account
        const bcList = Object.values(acc.bcs).map(bc => ({
            ...bc,
            ksAvg: bc.ksCount > 0 ? (bc.ksSum / bc.ksCount) : 0,
            sAvg: bc.sCount > 0 ? (bc.sSum / bc.sCount) : 0,
            iAvg: bc.iCount > 0 ? (bc.iSum / bc.iCount) : 0
        })).sort((a, b) => {
            if (bcSortCol === "account") {
                let revA = a.cyRevTotal || 0;
                let revB = b.cyRevTotal || 0;
                if (revB !== revA) {
                    return revB - revA; // Descending (high to low)
                }
                // Fallback to alphabetical sorting of buying center name
                let nameA = (a.buyingCenter || a.name || "").toString().toLowerCase();
                let nameB = (b.buyingCenter || b.name || "").toString().toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            } else {
                return sortFn(a, b);
            }
        });

        const hasNoBc = bcList.length === 0;

        if (hasNoBc) {
            // Render Account with no Buying Centers (single row, no chevron, other columns as '-')
            let directRow = `
                <tr class="summary-row-account" data-id="${accId}">
                    <td class="sticky-col bc-sticky-col-1" style="left: 0;">
                        <span class="nps-expand-icon" style="visibility: hidden;"><i class="fa fa-chevron-right"></i></span>
                        ${valOrDash(acc.name)}
                    </td>
                    <td class="sticky-col bc-sticky-col-2" style="left: 180px;">-</td>
                    <td class="name-col">-</td>
                    <td class="name-col">-</td>
                    <td class="name-col">-</td>
                    <td class="name-col">-</td>
                    <td class="col-num">-</td>
                    <td>-</td>
                    <td class="stk-col-cell name-col">-</td>
                    <td class="stk-col-cell name-col">-</td>
                    <td class="stk-col-cell col-num">-</td>
                    <td class="stk-col-cell">-</td>
                    <td class="inf-col-cell name-col">-</td>
                    <td class="inf-col-cell name-col">-</td>
                    <td class="inf-col-cell col-num">-</td>
                    <td class="inf-col-cell">-</td>
                    ${currentStakeholderType !== "Influencer" ? `
                        <td class="col-num">${formatCurrency(acc.lyRevTotal)}</td>
                        <td class="col-num">${formatCurrency(acc.cyRevTotal)}</td>
                    ` : ''}
                </tr>
            `;
            body.append(directRow);
        } else {
            // Render multiple Buying Centers under this Account
            const isAccExpanded = bcExpandedRows.has(accId);
            const accRowClass = isAccExpanded ? "summary-row-account expanded-row row-hidden" : "summary-row-account collapsed-row";
            const accIconClass = isAccExpanded ? "fa-chevron-down" : "fa-chevron-right";
            const childRowHidden = isAccExpanded ? "" : "row-hidden";
            
            const ksAccAvgStr = acc.ksCount > 0 ? acc.ksAvg.toFixed(2) : '-';
            const sAccAvgStr = acc.sCount > 0 ? acc.sAvg.toFixed(2) : '-';
            const iAccAvgStr = acc.iCount > 0 ? acc.iAvg.toFixed(2) : '-';

            // Account summary row (Parent Level 1)
            let accRow = `
                <tr class="${accRowClass}" data-id="${accId}">
                    <td class="sticky-col bc-sticky-col-1" style="left: 0;">
                        <span class="nps-expand-icon" onclick="toggleBCRow('${accId}')"><i class="fa ${accIconClass}"></i></span>
                        ${valOrDash(acc.name)}
                    </td>
                    <td class="sticky-col bc-sticky-col-2" style="left: 180px;">Overall</td>
                    <td class="name-col">-</td><td class="name-col">-</td>
                    <td class="name-col">-</td><td class="name-col">-</td>
                    <td class="col-num">
                        ${ksAccAvgStr !== '-' ? `<a href="javascript:void(0)" onclick="openNpsHistoryByAccount('${esc(acc.name)}', 'Key Stakeholder')"><span class="nps-rating-pill ${acc.hasRecentKs ? 'nps-rating-high' : ''}">${ksAccAvgStr}</span></a>` : '-'}
                    </td>
                    <td>${valOrDash(formatCurrentYearDateUI(acc.accountLastNpsDate))}</td>
                    <td class="stk-col-cell name-col">-</td><td class="stk-col-cell name-col">-</td>
                    <td class="stk-col-cell col-num">
                        ${sAccAvgStr !== '-' ? `<a href="javascript:void(0)" onclick="openNpsHistoryByAccount('${esc(acc.name)}', 'Stakeholder')"><span class="nps-rating-pill ${acc.hasRecentS ? 'nps-rating-high' : ''}">${sAccAvgStr}</span></a>` : '-'}
                    </td>
                    <td class="stk-col-cell">${valOrDash(formatCurrentYearDateUI(acc.accountLastNpsDate))}</td>
                    <td class="inf-col-cell name-col">-</td><td class="inf-col-cell name-col">-</td>
                    <td class="inf-col-cell col-num">
                        ${iAccAvgStr !== '-' ? `<a href="javascript:void(0)" onclick="openNpsHistoryByAccount('${esc(acc.name)}', 'Influencer')"><span class="nps-rating-pill ${acc.hasRecentI ? 'nps-rating-high' : ''}">${iAccAvgStr}</span></a>` : '-'}
                    </td>
                    <td class="inf-col-cell">${valOrDash(formatCurrentYearDateUI(acc.accountLastNpsDate))}</td>
                    ${currentStakeholderType !== "Influencer" ? `
                        <td class="col-num">${formatCurrency(acc.lyRevTotal)}</td>
                        <td class="col-num">${formatCurrency(acc.cyRevTotal)}</td>
                    ` : ''}
                </tr>
            `;
            body.append(accRow);

            bcList.forEach((bc, bcIdx) => {
                const bcId = `${accId}-bc-${bc.name.replace(/[^a-z0-9]/gi, '_')}`;
                const isBcExpanded = bcExpandedRows.has(bcId);
                const showAccountOnBcRow = isAccExpanded && bcIdx === 0;
                const accountCellContent = showAccountOnBcRow
                    ? `<span class="nps-expand-icon" onclick="toggleBCRow('${accId}')"><i class="fa fa-chevron-down"></i></span>${valOrDash(acc.name)}`
                    : '';

                const superbossMembers = [];
                if (bc.superboss) superbossMembers.push(bc.superboss);
                superbossMembers.push(...getDeletedHistoryMembers(bc.superboss));
                const keyStakeholderMembers = bc.items.map(i => i.keyStakeholder).filter(Boolean);
                const stakeholderMembers = bc.items.map(i => i.stakeholder).filter(Boolean);
                const influencerMembers = bc.items.map(i => i.influencer).filter(Boolean);

                const superbossCount = getUniqueMemberCount(superbossMembers);
                const keyStakeholderCount = getUniqueMemberCount(keyStakeholderMembers);
                const stakeholderCount = getUniqueMemberCount(stakeholderMembers);
                const influencerCount = getUniqueMemberCount(influencerMembers);

                const canExpandBC = currentStakeholderType === "Influencer"
                    ? superbossCount > 1 || keyStakeholderCount > 1 || stakeholderCount > 1 || influencerCount > 1
                    : superbossCount > 1 || keyStakeholderCount > 1 || stakeholderCount > 1;

                const bcRowClass = isBcExpanded && canExpandBC ? "summary-row-bc expanded-row row-hidden" : "summary-row-bc collapsed-row";
                const bcIconClass = isBcExpanded && canExpandBC ? "fa-chevron-down" : "fa-chevron-right";
                const grandChildRowHidden = isBcExpanded && canExpandBC ? "" : "row-hidden";
                const singleDetailRowClass = !canExpandBC ? "single-detail-row" : "";
                
                const ksBcAvgStr = bc.ksCount > 0 ? bc.ksAvg.toFixed(2) : '-';
                const sBcAvgStr = bc.sCount > 0 ? bc.sAvg.toFixed(2) : '-';
                const iBcAvgStr = bc.iCount > 0 ? bc.iAvg.toFixed(2) : '-';
                
                const showExpandedSummaryValues = !isBcExpanded || !canExpandBC;
                const bcToggleIcon = canExpandBC
                    ? `<span class="nps-expand-icon" onclick="toggleBCRow('${bcId}')"><i class="fa ${bcIconClass}"></i></span>`
                    : '';

                let bcRow = `
                    <tr class="${bcRowClass} ${singleDetailRowClass} ${childRowHidden} child-of-${accId}" data-id="${bcId}">
                        <td class="sticky-col bc-sticky-col-1" style="left: 0;">${accountCellContent}</td>
                        <td class="sticky-col bc-sticky-col-2" style="left: 180px; padding-left: 20px;">
                            ${bcToggleIcon}
                            ${valOrDash(bc.name)}
                        </td>
                        <td class="name-col">${showExpandedSummaryValues ? (canExpandBC ? '-' : formatSuperbossName(bc.superboss)) : ''}</td>
                        <td class="name-col">${showExpandedSummaryValues ? (canExpandBC ? '-' : valOrDash(getFsPartner(bc.superboss, "Superboss"))) : ''}</td>
                        <td class="name-col">
                            ${showExpandedSummaryValues ? (canExpandBC ? '-' : formatMemberList(bc.items.map(i => i.keyStakeholder).filter(Boolean))) : ''}
                        </td>
                        <td class="name-col">
                            ${showExpandedSummaryValues ? (canExpandBC ? '-' : ([...new Set(bc.items.map(i => getFsPartner(i.keyStakeholder, "Key Stakeholder")).filter(n => n))].join(", ") || '-')) : ''}
                        </td>
                        <td class="col-num">
                            ${showExpandedSummaryValues ? (ksBcAvgStr !== '-' ? `<a href="javascript:void(0)" onclick="openNpsHistoryByBC('${esc(bc.account)}', '${esc(bc.name)}', 'Key Stakeholder')"><span class="nps-rating-pill ${bc.hasRecentKs ? 'nps-rating-high' : ''}">${ksBcAvgStr}</span></a>` : '-') : ''}
                        </td>
                        <td>${showExpandedSummaryValues ? valOrDash(formatCurrentYearDateUI(bc.BCLastNpsDate)) : ''}</td>
                        <td class="stk-col-cell name-col">
                            ${showExpandedSummaryValues ? (canExpandBC ? '-' : formatMemberList(bc.items.map(i => i.stakeholder).filter(Boolean))) : ''}
                        </td>
                        <td class="stk-col-cell name-col">
                            ${showExpandedSummaryValues ? (canExpandBC ? '-' : ([...new Set(bc.items.map(i => getFsPartner(i.stakeholder, "Stakeholder")).filter(n => n))].join(", ") || '-')) : ''}
                        </td>
                        <td class="stk-col-cell col-num">
                            ${showExpandedSummaryValues ? (sBcAvgStr !== '-' ? `<a href="javascript:void(0)" onclick="openNpsHistoryByBC('${esc(bc.account)}', '${esc(bc.name)}', 'Stakeholder')"><span class="nps-rating-pill ${bc.hasRecentS ? 'nps-rating-high' : ''}">${sBcAvgStr}</span></a>` : '-') : ''}
                        </td>
                        <td class="stk-col-cell">${showExpandedSummaryValues ? valOrDash(formatCurrentYearDateUI(bc.BCLastNpsDate)) : ''}</td>
                        <td class="inf-col-cell name-col">
                            ${showExpandedSummaryValues ? (canExpandBC ? '-' : formatMemberList(bc.items.map(i => i.influencer).filter(Boolean))) : ''}
                        </td>
                        <td class="inf-col-cell name-col">
                            ${showExpandedSummaryValues ? (canExpandBC ? '-' : ([...new Set(bc.items.map(i => getFsPartner(i.influencer, "Key Directs")).filter(n => n))].join(", ") || '-')) : ''}
                        </td>
                        <td class="inf-col-cell col-num">
                            ${showExpandedSummaryValues ? (iBcAvgStr !== '-' ? `<a href="javascript:void(0)" onclick="openNpsHistoryByBC('${esc(bc.account)}', '${esc(bc.name)}', 'Influencer')"><span class="nps-rating-pill ${bc.hasRecentI ? 'nps-rating-high' : ''}">${iBcAvgStr}</span></a>` : '-') : ''}
                        </td>
                        <td class="inf-col-cell">${showExpandedSummaryValues ? valOrDash(formatCurrentYearDateUI(bc.BCLastNpsDate)) : ''}</td>
                        ${currentStakeholderType !== "Influencer" ? `
                            <td class="col-num">${showExpandedSummaryValues ? formatCurrency(bc.lyRevTotal) : ''}</td>
                            <td class="col-num">${showExpandedSummaryValues ? formatCurrency(bc.cyRevTotal) : ''}</td>
                        ` : ''}
                    </tr>
                `;
                body.append(bcRow);

                // Sort items within BC
                bc.items.sort((a, b) => {
                    const deletedCompare = compareDeletedLast(a, b);
                    if (deletedCompare !== 0) return deletedCompare;

                    if (bcSortCol === "account") {
                        let revA = getItemCyRev(a);
                        let revB = getItemCyRev(b);
                        if (revB !== revA) {
                            return revB - revA; // Descending (high to low)
                        }
                        // Fallback to name alphabetical sorting
                        let nameA = "";
                        let nameB = "";
                        if (currentStakeholderType === "Stakeholder" && a.stakeholder && b.stakeholder) {
                            nameA = (a.stakeholder.name || "").toString().toLowerCase();
                            nameB = (b.stakeholder.name || "").toString().toLowerCase();
                        } else if (currentStakeholderType === "Influencer" && a.influencer && b.influencer) {
                            nameA = (a.influencer.name || "").toString().toLowerCase();
                            nameB = (b.influencer.name || "").toString().toLowerCase();
                        } else if (a.keyStakeholder && b.keyStakeholder) {
                            nameA = (a.keyStakeholder.name || "").toString().toLowerCase();
                            nameB = (b.keyStakeholder.name || "").toString().toLowerCase();
                        }
                        if (nameA < nameB) return -1;
                        if (nameA > nameB) return 1;
                        return 0;
                    } else {
                        return sortFn(a, b);
                    }
                });

                if (canExpandBC) {
                    bc.items.forEach((item, index) => {
                        const ks = item.keyStakeholder;
                        const s = item.stakeholder;
                        const inf = item.influencer;
                        const showSuperbossOnRow = index === 0;
                        const showBcOnRow = index === 0;
                        const showAccountOnItemRow = showAccountOnBcRow && isBcExpanded && index === 0;
                        
                        let row = `
                            <tr class="${grandChildRowHidden} child-of-${bcId}">
                                <td class="sticky-col bc-sticky-col-1" style="left: 0;">${showAccountOnItemRow ? `<span class="nps-expand-icon" onclick="toggleBCRow('${accId}')"><i class="fa fa-chevron-down"></i></span>${valOrDash(acc.name)}` : ''}</td>
                                <td class="sticky-col bc-sticky-col-2" style="left: 180px; ${showBcOnRow ? 'padding-left: 20px;' : ''}">
                                    ${showBcOnRow ? `<span class="nps-expand-icon" onclick="toggleBCRow('${bcId}')"><i class="fa fa-chevron-down"></i></span>${valOrDash(bc.name)}` : ''}
                                </td>
                                <td class="name-col">${showSuperbossOnRow ? formatMemberName(bc.superboss) : ''}</td>
                                <td class="name-col">${showSuperbossOnRow ? valOrDash(getFsPartner(bc.superboss, "Superboss")) : ''}</td>
                                <td class="name-col">${formatMemberName(ks)}</td>
                                <td class="name-col">${ks ? valOrDash(getFsPartner(ks, "Key Stakeholder")) : '-'}</td>
                                <td class="col-num">
                                    ${ks && ks.avgNps !== null ? `<a href="javascript:void(0)" onclick='openNpsHistoryByBC("${item.account}", "${item.buyingCenter}", "Key Stakeholder", "${ks.name}")'><span class="nps-rating-pill ${item.hasRecentKs ? 'nps-rating-high' : ''}">${parseFloat(ks.avgNps).toFixed(2)}</span></a>` : '-'}
                                </td>
                                <td>${ks ? valOrDash(formatDateUI(ks.lastNpsDate)) : '-'}</td>
                                <td class="stk-col-cell name-col">${formatMemberName(s)}</td>
                                <td class="stk-col-cell name-col">${s ? valOrDash(getFsPartner(s, "Stakeholder")) : '-'}</td>
                                <td class="stk-col-cell col-num">
                                    ${s && s.avgNps !== null ? `<a href="javascript:void(0)" onclick='openNpsHistoryByBC("${item.account}", "${item.buyingCenter}", "Stakeholder", "${s.name}")'><span class="nps-rating-pill ${item.hasRecentS ? 'nps-rating-high' : ''}">${parseFloat(s.avgNps).toFixed(2)}</span></a>` : '-'}
                                </td>
                                <td class="stk-col-cell">${s ? valOrDash(formatDateUI(s.lastNpsDate)) : '-'}</td>
                                <td class="inf-col-cell name-col">${formatMemberName(inf)}</td>
                                <td class="inf-col-cell name-col">${inf ? valOrDash(getFsPartner(inf, "Key Directs")) : '-'}</td>
                                <td class="inf-col-cell col-num">
                                    ${inf && inf.avgNps !== null ? `<a href="javascript:void(0)" onclick='openNpsHistoryByBC("${item.account}", "${item.buyingCenter}", "Influencer", "${inf.name}")'><span class="nps-rating-pill ${item.hasRecentI ? 'nps-rating-high' : ''}">${parseFloat(inf.avgNps).toFixed(2)}</span></a>` : '-'}
                                </td>
                                <td class="inf-col-cell">${inf ? valOrDash(formatDateUI(inf.lastNpsDate)) : '-'}</td>
                                ${currentStakeholderType !== "Influencer" ? `
                                    <td class="col-num">${formatCurrency(currentStakeholderType === "Stakeholder" ? (s && s[lyKey]) : (ks && ks[lyKey]))}</td>
                                    <td class="col-num">${formatCurrency(currentStakeholderType === "Stakeholder" ? (s && s[cyKey]) : (ks && ks[cyKey]))}</td>
                                ` : ''}
                            </tr>
                        `;
                        body.append(row);
                    });

                    const deletedSuperbossHistory = getDeletedHistoryMembers(bc.superboss);
                    deletedSuperbossHistory.forEach(histMember => {
                        body.append(formatSuperbossHistoryRow(histMember, `${grandChildRowHidden} child-of-${bcId}`));
                    });
                }
            });
        }
    });

    // Final visibility sync
    if (currentStakeholderType === "Key Stakeholder") {
        $(".stk-header-cell, .stk-col-cell, .inf-header-cell, .inf-col-cell").hide();
    } else if (currentStakeholderType === "Stakeholder") {
        $(".inf-header-cell, .inf-col-cell").hide();
    }

    // Ensure thead is sticky to fix headers
    $("#npsBuyingCenterTable thead").css({
        "position": "sticky",
        "top": "0",
        "z-index": "100",
        "background": "white"
    });

    // Hide FY25/FY26 headers for Influencer
    if (currentStakeholderType === "Influencer") {
        $("#bcHeaderLy, #bcHeaderCy, #bcRevenueGroupHeader").hide();
    } else {
        $("#bcHeaderLy, #bcHeaderCy, #bcRevenueGroupHeader").show();
    }
    syncExpandedAccountDisplays();
    updateBCHeaderIcons();
}


function openNpsHistoryByBC(account, bcName, filterType, specificName) {
    const bc = bcRawData.find(b => b.account === account && b.buyingCenterName === bcName);
    if (bc && bc.nps_stakeholder_history) {
        let history = bc.nps_stakeholder_history;
        
        if (specificName) {
            history = history.filter(h => h.name === specificName);
        } else if (filterType) {
            const allowedNames = (bc.stakeholders || [])
                .filter(s => (s.type || "").toLowerCase() === filterType.toLowerCase())
                .map(s => s.name);
            history = history.filter(h => allowedNames.includes(h.name));
        }
        
        if (history.length > 0) {
            openNpsDetails(history);
        }
    }
}

function openNpsHistoryByAccount(account, filterType) {
    // Collect all unique stakeholder histories for the account
    const bcs = bcRawData.filter(b => b.account === account);
    const combinedHistory = [];
    const seenNames = new Set();

    bcs.forEach(bc => {
        if (bc.nps_stakeholder_history) {
            let history = bc.nps_stakeholder_history;
            
            // Filter by type if provided
            if (filterType) {
                const allowedNames = (bc.stakeholders || [])
                    .filter(s => (s.type || "").toLowerCase() === filterType.toLowerCase())
                    .map(s => s.name);
                history = history.filter(h => allowedNames.includes(h.name));
            }
            
            // Filter for "has value" (only show if they have at least one valid score)
            history = history.filter(h => {
                const monthly = h.npsMonthlyHistoric || [];
                return monthly.some(m => {
                    const score = (m && typeof m === 'object') ? m.score : m;
                    return score !== null && score !== undefined && score !== '' && score !== '-';
                });
            });

            history.forEach(h => {
                if (!seenNames.has(h.name)) {
                    combinedHistory.push(h);
                    seenNames.add(h.name);
                }
            });
        }
    });

    if (combinedHistory.length > 0) {
        openNpsDetails(combinedHistory);
    }
}

function openNpsDetails(history) {
    const headerRow = $("#heatmapHeader");
    const body = $("#heatmapBody");
    
    // Clear dynamic headers
    headerRow.find('th:not(:first-child)').remove();
    body.empty();

    // Find months that actually have data

    const monthsWithData = new Set();
    if (history) {
        history.forEach(stk => {
            (stk.npsMonthlyHistoric || []).forEach(m => {
                const score = (m && typeof m === 'object') ? m.score : m;
                if (score !== null && score !== undefined && score !== '' && score !== '-') {
                    monthsWithData.add(m.month);
                }
            });
        });
    }

    const months = Array.from(monthsWithData).sort((a, b) => {
        const monthOrder = { "Jan":0, "Feb":1, "Mar":2, "Apr":3, "May":4, "Jun":5, "Jul":6, "July":6, "Aug":7, "Sep":8, "Oct":9, "Nov":10, "Dec":11 };
        const pA = a.split('-'), pB = b.split('-');
        if (pA.length < 2 || pB.length < 2) return 0;
        const yA = parseInt(pA[1]), yB = parseInt(pB[1]);
        if (yA !== yB) return yA - yB;
        return (monthOrder[pA[0]] || 0) - (monthOrder[pB[0]] || 0);
    });

    months.forEach(m => {
        headerRow.append(`<th>${m}</th>`);
    });

    if (!history || history.length === 0 || months.length === 0) {
        body.append(`<tr><td colspan="${months.length + 1}" style="text-align:center; padding:20px;">No historical data recorded.</td></tr>`);
    } else {

        const activeHistory = history.filter(stk => {
            return (stk.npsMonthlyHistoric || []).some(m => {
                const score = (m && typeof m === 'object') ? m.score : m;
                return score !== null && score !== undefined && score !== '' && score !== '-';
            });
        });

        if (activeHistory.length === 0) {
            body.append(`<tr><td colspan="${months.length + 1}" style="text-align:center; padding:20px;">No historical data recorded.</td></tr>`);
        } else {

            activeHistory.forEach(stk => {
                const monthlyData = stk.npsMonthlyHistoric || [];
                const stkReceivedDays = stk.last_nps_received_days;
                const isRecent = (stkReceivedDays !== undefined && stkReceivedDays !== null && stkReceivedDays !== '' && parseFloat(stkReceivedDays) <= 7) || isRecentNps(stk.lastNpsDate);
                const lastNpsMonth = formatToMonthYear(stk.lastNpsDate);

                let rowHtml = `<tr><td class="sow-name-col">${stk.name}</td>`;
                
                // Map monthly data for lookup

                const monthMap = {};
                monthlyData.forEach(m => { monthMap[m.month] = m; });

                months.forEach(mName => {
                    const val = monthMap[mName];
                    const score = (val && typeof val === 'object') ? val.score : val;
                    const strength = (val && typeof val === 'object' && val.strength) ? val.strength : "N/A";
                    const improvement = (val && typeof val === 'object' && val.improvement) ? val.improvement : "N/A";
                    
                    const scoreNum = parseFloat(score);
                    let colorClass = '';
                    if (!isNaN(scoreNum)) {
                        // Check if the cell itself has recency info (improvement)
                        let isCellRecent = false;
                        if (val && typeof val === 'object') {
                            const receivedDays = val.last_nps_received_days;
                            if (receivedDays !== undefined && receivedDays !== null && receivedDays !== '') {
                                // Explicitly consider 'last_nps_received_days' for the light green color identification
                                isCellRecent = (parseFloat(receivedDays) <= 7);
                            } else if (val.date) {
                                isCellRecent = isRecentNps(val.date);
                            } else if (val.improvement && !isNaN(Date.parse(val.improvement))) {
                                // Some records use the improvement field to store the NPS received date
                                isCellRecent = isRecentNps(val.improvement);
                            } else {
                                // Fallback to stakeholder's last NPS date if it matches this month
                                isCellRecent = (isRecent && mName === lastNpsMonth);
                            }
                        } else {
                            // Fallback for simple score values
                            isCellRecent = (isRecent && mName === lastNpsMonth);
                        }

                        if (isCellRecent) {
                            colorClass = 'nps-rating-high';
                        } else if (scoreNum <= 2) {
                            colorClass = 'nps-rating-low';
                        } else {
                            colorClass = 'nps-rating-mid';
                        }
                    }

                    rowHtml += `<td>${valOrDash(score) !== '-' ? `<span class="nps-rating-pill-sm nps-tooltip-trigger ${colorClass}" 
                                        data-strength="${esc(strength)}" 
                                        data-improvement="${esc(improvement)}"
                                        title="Strength: ${strength}&#10;Improvement: ${improvement}">${scoreNum.toFixed(2)}</span>` : '-'}</td>`;
                });

                rowHtml += `</tr>`;
                body.append(rowHtml);
            });
        }
    }


    $("#npsDetailsModal").fadeIn(300);
}

function formatDateUI(dateStr) {
    if (!dateStr || dateStr === 'N/A') return '';
    try {
        // Handle YYYY-MM-DD
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const year = parts[0].slice(-2);
            const month = parts[1];
            const day = parts[2];
            return `${month}-${day}-${year}`;
        }
        return dateStr;
    } catch (e) {
        return dateStr;
    }
}

function formatCurrentYearDateUI(dateStr) {
    if (!dateStr || dateStr === 'N/A') return '';

    const value = String(dateStr).trim();
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|$)/);
    const currentYear = new Date().getFullYear();

    if (isoDate) {
        if (Number(isoDate[1]) !== currentYear) return '';
        return `${isoDate[2]}-${isoDate[3]}-${isoDate[1].slice(-2)}`;
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.getFullYear() !== currentYear) return '';

    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${month}-${day}-${String(currentYear).slice(-2)}`;
}

function setupBCEventListeners() {
    $(document).off("click", "#npsBuyingCenterTable .sortable-header");
    $(document).on("click", "#npsBuyingCenterTable .sortable-header", function() {
        const col = $(this).data("sort");
        if (bcSortCol === col) {
            bcSortOrder = bcSortOrder === "asc" ? "desc" : "asc";
        } else {
            bcSortCol = col;
            bcSortOrder = "asc";
        }
        
        // Update Icons
        $("#npsBuyingCenterTable .sortable-header i.sort-icon").removeClass("fa-sort-up fa-sort-down sort-active").addClass("fa-sort");
        const currentIcon = $(this).find("i.sort-icon");
        currentIcon.removeClass("fa-sort").addClass(bcSortOrder === "asc" ? "fa-sort-up" : "fa-sort-down").addClass("sort-active");

        refreshBCView();
    });

    // Tab switching is now handled centrally in npsPlanning.js

    // Stakeholder Toggle Buttons
    $("#bcStakeholderToggles .nps-toggle-btn").off("click").on("click", function() {
        $("#bcStakeholderToggles .nps-toggle-btn").removeClass("active");
        $(this).addClass("active");
        currentStakeholderType = $(this).data("type");
        
        syncBCFilters();
        refreshBCView();
    });

    // Expand/Collapse All Accounts
    $(document).off("click", "#btnExpandAllBC");
    $(document).on("click", "#btnExpandAllBC", function(e) {
        e.stopPropagation(); // Prevent sorting trigger
        $("#npsBuyingCenterTable .summary-row-account.collapsed-row").each(function() {
            const icon = $(this).find(".nps-expand-icon");
            if (icon.length > 0 && icon.css("visibility") !== "hidden") {
                const accId = $(this).attr("data-id");
                toggleBCRow(accId);
            }
        });
        // Toggling visibility is now handled inside toggleBCRow -> updateBCHeaderIcons
    });

    $(document).off("click", "#btnCollapseAllBC");
    $(document).on("click", "#btnCollapseAllBC", function(e) {
        e.stopPropagation(); // Prevent sorting trigger
        $("#npsBuyingCenterTable .summary-row-account.expanded-row").each(function() {
            const icon = $(this).find(".nps-expand-icon");
            if (icon.length > 0 && icon.css("visibility") !== "hidden") {
                const accId = $(this).attr("data-id");
                toggleBCRow(accId);
            }
        });
        // Toggling visibility is now handled inside toggleBCRow -> updateBCHeaderIcons
    });

    // Hover effect for header buttons
    $(document).on("mouseenter", ".bc-header-action", function() {
        $(this).css("color", "#ff6b00");
    }).on("mouseleave", ".bc-header-action", function() {
        $(this).css("color", "#666");
    });

    // Modal Close
    $("#closeNpsModal").on("click", function() {
        $("#npsDetailsModal").fadeOut(200);
        $("#npsTooltip").hide();
    });

    $(window).on("click", function(event) {
        if ($(event.target).is("#npsDetailsModal")) {
            $("#npsDetailsModal").fadeOut(200);
            $("#npsTooltip").hide();
        }
    });

    // Heatmap Tooltip Logic
    let tooltipTimeout;
    $(document).off("mouseenter mouseleave", ".nps-tooltip-trigger");
    $(document).off("mouseenter mouseleave", "#npsTooltip");

    $(document).on("mouseenter", ".nps-tooltip-trigger", function(e) {
        clearTimeout(tooltipTimeout);
        const str = $(this).data("strength");
        const imp = $(this).data("improvement");
        
        if (!str && !imp) return;

        const tooltip = $("#npsTooltip");

        tooltip.html(`
            <div class="nps-popover-content">
                ${str ? `
                <div class="nps-popover-item">
                    <span class="nps-popover-label strength">Strength</span>
                    <span class="nps-popover-text">${str}</span>
                </div>` : ''}
                ${imp ? `
                <div class="nps-popover-item">
                    <span class="nps-popover-label improvement">Improvement</span>
                    <span class="nps-popover-text">${imp}</span>
                </div>` : ''}
            </div>
        `).show();

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
            top = rect.bottom + 12;
            if (top + tooltipHeight > winHeight - 10) {
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

    // Global Search sync
    $("#npsBcSearch").off("keyup.bc").on("keyup.bc", function() {
        if ($("#npsBuyingCenterView").is(":visible")) {
            refreshBCView();
        }
    });

    // BC specific dropdown changes handled via multiselect callbacks
}
