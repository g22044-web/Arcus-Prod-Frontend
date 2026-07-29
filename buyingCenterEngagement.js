
let engRawData = null;
let engInteractionType = "All";
let engExpandedRows = new Set();
let engExpandedAccounts = new Set();
let engSortCol = "account";
let engSortOrder = "asc";
let sowRevenueModalState = {
    sows: [],
    selectedStatuses: [],
    availableStatuses: [],
    entityName: '',
    authoritativeTotal: undefined,
    searchTerm: '',
    searchColumn: 'all',
    sortColumn: 'revenue',
    sortDirection: 'desc'
};
let noteLogModalState = {
    rawNotes: [],
    reqDays: null,
    reqPeriod: null,
    searchTerm: '',
    sortColumn: 'date',
    sortDirection: 'desc'
};

$(function() {
    initEngagement();
    initEngYearFilter();

    // Fetch management data initially
    fetchManagementData();
    
    // Set initial activity tracking tab
    if (typeof window.switchActivityTab === "function") {
        window.switchActivityTab("Buying Center Management");
    }

    // Tabs functionality
    $(document).on("click", ".nps-tab", function() {
        $(".nps-tab").removeClass("active");
        $(this).addClass("active");
        
        const tab = $(this).data("tab");
        
        const tabName = tab === "management" ? "Buying Center Management" : "Buying Center Engagement";
        if (typeof window.switchActivityTab === "function") {
            window.switchActivityTab(tabName);
        }
        
        if (tab === "management") {
            $("#npsEngagementView").hide();
            $(".nps-filters").hide();
            $("#npsManagementView").show();
            if ($("#managementAccountList li.active").length === 0) {
                $("#managementAccountList li").first().click();
            }
        } else {
            $("#npsManagementView").hide();
            $("#npsEngagementView").show();
            if (!engRawData) {
                $(".nps-filters").hide();
                $("#npsEngagementTable thead").hide();
                fetchEngagementData();
            } else {
                $(".nps-filters").show();
                $("#npsEngagementTable thead").show();
                refreshEngagementView();
            }
        }
    });

    // Sidebar search
    $(document).on("keyup", "#accountSearchInput", function() {
        const val = $(this).val().toLowerCase();
        $("#managementAccountList li").each(function() {
            const accName = $(this).text().toLowerCase();
            if (accName.includes(val)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // Sidebar click
    $(document).on("click", ".account-item", function() {
        // Hide full page loader if it was showing from initial page load
        $(".loader-overlay").hide();
        
        $(".account-item").removeClass("active");
        $(this).addClass("active");
        const accountId = $(this).data("account-id");
        const accountName = $(this).data("account-name");
        
        // Clear buying center view state so the iframe always loads the list view for a new account
        sessionStorage.removeItem("activeBuyingCenterView");
        sessionStorage.removeItem("activeBuyingCenterId");
        sessionStorage.removeItem("activeBuyingCenterReadOnly");
        sessionStorage.removeItem("activeBuyingCenterTab");
        
        $("#bcManagementContent").html('<div class="local-loader" style="display:flex; justify-content:center; align-items:center; height:100%; min-height:300px; width:100%;"><div style="border: 4px solid rgba(0, 0, 0, 0.1); border-left-color: #f7941d; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s infinite linear;"></div></div>');
        
        const urlParams = new URLSearchParams(window.location.search);
        const paramAccountId = urlParams.get('accountId');
        let additionalParams = '';

        if (paramAccountId && paramAccountId.toString() === accountId.toString()) {
            const action = urlParams.get('action');
            const redirect = urlParams.get('redirect');
            const sowId = urlParams.get('sowId');
            const sowNumber = urlParams.get('sowNumber');
            const buyingCenter = urlParams.get('buyingCenter');
            const npsStakeholder = urlParams.get('npsStakeholder');
            const showAudit = urlParams.get('showAudit');
            const defaultTab = urlParams.get('defaultTab');

            if (action) additionalParams += `&action=${encodeURIComponent(action)}`;
            if (redirect) additionalParams += `&redirect=${encodeURIComponent(redirect)}`;
            if (sowId) additionalParams += `&sowId=${encodeURIComponent(sowId)}`;
            if (sowNumber) additionalParams += `&sowNumber=${encodeURIComponent(sowNumber)}`;
            if (buyingCenter) additionalParams += `&buyingCenter=${encodeURIComponent(buyingCenter)}`;
            if (npsStakeholder) additionalParams += `&npsStakeholder=${encodeURIComponent(npsStakeholder)}`;
            if (showAudit) additionalParams += `&showAudit=${encodeURIComponent(showAudit)}`;
            if (defaultTab) additionalParams += `&defaultTab=${encodeURIComponent(defaultTab)}`;
            
            const mode = urlParams.get('mode');
            if (mode) additionalParams += `&mode=${encodeURIComponent(mode)}`;
        }

        const iframe = document.createElement("iframe");
        const fromParam = urlParams.get('from') || 'engagement';
        iframe.src = `buying_center.html?accountName=${encodeURIComponent(accountName)}&accountId=${encodeURIComponent(accountId)}&from=${encodeURIComponent(fromParam)}${additionalParams}`;
        iframe.style.width = "100%";
        iframe.style.height = "115%";
        iframe.style.border = "none";
        iframe.style.display = "none";
        
        let isIframeLoaded = false;
        let pendingData = null;
        
        iframe.onload = function() {
            isIframeLoaded = true;
            $(".local-loader").hide();
            iframe.style.display = "block";
            if (pendingData) {
                iframe.contentWindow.postMessage({
                    type: 'SYNC_ENGAGEMENT_DATA',
                    payload: pendingData
                }, "*");
            }
        };
        
        document.getElementById("bcManagementContent").appendChild(iframe);
        
        let response = {
            EMPLOYEE_LIST: window.allManagementData ? window.allManagementData.EMPLOYEE_LIST : null,
            stakeholder_details: []
        };
        
        let bcList = Array.isArray(window.allManagementData) ? window.allManagementData : (window.allManagementData && window.allManagementData.stakeholder_details ? window.allManagementData.stakeholder_details : []);
        
        if (Array.isArray(bcList)) {
            bcList.forEach(item => {
                let accId = item.ACCOUNT_ID || item.accountId || item.AccountId;
                if (!accId && item.DETAILS && Array.isArray(item.DETAILS) && item.DETAILS.length > 0) {
                    accId = item.DETAILS[0].ACCOUNT_ID || item.DETAILS[0].accountId || item.DETAILS[0].AccountId;
                }
                if (accId && accId.toString() === accountId.toString()) {
                    response.stakeholder_details.push(item);
                }
            });
        }
        
        if (isIframeLoaded) {
            iframe.contentWindow.postMessage({
                type: 'SYNC_ENGAGEMENT_DATA',
                payload: response
            }, "*");
        } else {
            pendingData = response;
        }
    });

    // Search input listener
    $(document).off("keyup", "#npsSearch");
    $(document).on("keyup", "#npsSearch", function() {
        refreshEngagementView();
    });

    // Table sorting listener
    $(document).off("click", "#npsEngagementTable .sortable-header");
    $(document).on("click", "#npsEngagementTable .sortable-header", function() {
        const col = $(this).data("sort");
        if (!col) return;
        if (engSortCol === col) {
            engSortOrder = engSortOrder === "asc" ? "desc" : "asc";
        } else {
            engSortCol = col;
            engSortOrder = "asc";
        }
        refreshEngagementView();
    });

    // Interaction type radio change
    $('input[name="engInteractionType"]').on('change', function() {
        engInteractionType = $(this).val();
        refreshEngagementView();
    });

    // Show active only checkbox change
    $(document).on("change", "#showActiveOnly", function() {
        refreshEngagementView();
    });

// Expand/Collapse All Accounts and Buying Centers
    $(document).off("click", "#btnExpandAllEng");
    $(document).on("click", "#btnExpandAllEng", function(e) {
        e.stopPropagation();
        if (!engRawData) return;
        
        // Expand all unique accounts
        const uniqueAccounts = [...new Set(engRawData.map(d => d.account))].filter(Boolean);
        uniqueAccounts.forEach(accName => {
            const safeAccount = accName.replace(/[^a-zA-Z0-9]/g, '_');
            engExpandedAccounts.add(`eng_acc_${safeAccount}`);
        });

        // Expand all buying centers
        engRawData.forEach(bc => {
            const safeAccount = (bc.account || 'na').replace(/[^a-zA-Z0-9]/g, '_');
            const safeBC = (bc.buyingCenterName || 'na').replace(/[^a-zA-Z0-9]/g, '_');
            const bcId = `eng_bc_${safeAccount}_${safeBC}`;
            engExpandedRows.add(bcId);
        });

        refreshEngagementView();
    });

    $(document).off("click", "#btnCollapseAllEng");
    $(document).on("click", "#btnCollapseAllEng", function(e) {
        e.stopPropagation();
        engExpandedAccounts.clear();
        engExpandedRows.clear();
        refreshEngagementView();
    });

    // Modal close
    $('#closeNoteLogModal').on('click', function() {
        $('#noteLogModal').hide();
    });

    $(document).on('input', '#noteLogSearch', function() {
        noteLogModalState.searchTerm = $(this).val().trim();
        refreshNoteLogModal();
    });

    $(document).on('click', '.notelog-sort-button', function() {
        const sortColumn = $(this).data('note-sort');
        if (noteLogModalState.sortColumn === sortColumn) {
            noteLogModalState.sortDirection = noteLogModalState.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            noteLogModalState.sortColumn = sortColumn;
            noteLogModalState.sortDirection = sortColumn === 'date' ? 'desc' : 'asc';
        }
        refreshNoteLogModal();
    });
    $('#closeSowRevenueModal').on('click', function() {
        $('#sowRevenueModal').hide();
    });

    $(document).on('input', '#sowRevenueSearch', function() {
        sowRevenueModalState.searchTerm = $(this).val().trim();
        refreshSowRevenueModal();
    });

    $(document).on('click', '.sow-revenue-sort-button', function() {
        const sortColumn = $(this).data('sort-column');
        if (sowRevenueModalState.sortColumn === sortColumn) {
            sowRevenueModalState.sortDirection = sowRevenueModalState.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sowRevenueModalState.sortColumn = sortColumn;
            sowRevenueModalState.sortDirection = 'asc';
        }
        refreshSowRevenueModal();
    });
    $('#closeTimelineModal').on('click', function() {
        $('#stakeholderTimelineModal').hide();
    });
    $('#closeActivityDetailsModal').on('click', function() {
        $('#activityDetailsModal').hide();
    });
    
    $(window).on('click', function(event) {
        if ($(event.target).is('#noteLogModal')) {
            $('#noteLogModal').hide();
        }
        if ($(event.target).is('#sowRevenueModal')) {
            $('#sowRevenueModal').hide();
        }
        if ($(event.target).is('#stakeholderTimelineModal')) {
            $('#stakeholderTimelineModal').hide();
        }
        if ($(event.target).is('#activityDetailsModal')) {
            $('#activityDetailsModal').hide();
        }
    });
});

function initEngagement() {
    $('#npsSeparator, #summaryLegend, #planningLegend').hide();
}

function formatToMMDDYY(dateStr) {
    if (!dateStr || dateStr === "N/A" || dateStr === "-") return "-";
    // Handle various formats: YYYY-MM-DD or MM-DD-YY
    const dateParts = dateStr.includes(' ') ? dateStr.split(' ')[0].split('-') : dateStr.split('-');
    if (dateParts.length === 3) {
        if (dateParts[0].length === 4) { // YYYY-MM-DD
            return `${dateParts[1]}-${dateParts[2]}-${dateParts[0].substring(2)}`;
        } else if (dateParts[2].length === 4) { // DD-MM-YYYY
            return `${dateParts[1]}-${dateParts[0]}-${dateParts[2].substring(2)}`;
        }
    }
    return dateStr;
}

// Returns just the date as MM/DD/YY — no time, no "X days ago" suffix
function formatDateOnly(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    const isCustomFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(dateStr);
    const d = isCustomFormat
        ? new Date(dateStr.replace(' ', 'T') + 'Z')
        : new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
}

function convertStringToLocalTimeAndAgo(timeString) {
    if (!timeString) return "—";
    
    let utcDate;
    // Check if it's the specific format YYYY-MM-DD HH:MM:SS
    const isCustomFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(timeString);
    
    if (isCustomFormat) {
      // Replace the space between date and time with 'T' to make it ISO-compliant
      const isoString = timeString.replace(" ", "T") + "Z"; // Add 'Z' to treat it as UTC
      utcDate = new Date(isoString);
    } else {
      // Parse directly for standard formats like "Mon, 15 Dec 2025 22:21:21 GMT" or ISO strings
      utcDate = new Date(timeString);
    }
  
    if (isNaN(utcDate.getTime())) return timeString; // Fallback
  
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
    const day = String(utcDate.getDate()).padStart(2, '0');
    const month = String(utcDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = String(utcDate.getFullYear()).slice(-2); // Get last 2 digits of the year
    const hours = utcDate.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = String(utcDate.getMinutes()).padStart(2, '0');
    const amPm = utcDate.getHours() >= 12 ? 'PM' : 'AM';
    const formattedDate = `${month}/${day}/${year} ${hours}:${minutes} ${amPm}`;
  
    // Return the formatted date with the "time ago" string
    return `${formattedDate} (${timeAgoString})`;
}

let engCurrentYear = new Date().getFullYear();

function initEngYearFilter() {
    const currentYear = new Date().getFullYear();
    // const prevYear = currentYear - 1;
    const toggle = $("#engYearToggle");
    toggle.empty();

    [currentYear].forEach(yr => {
        const isActive = yr === engCurrentYear;
        const btn = $(`<button type="button" class="eng-year-pill${isActive ? ' active' : ''}" data-year="${yr}">${yr}</button>`);
        btn.on('click', function() {
            const selectedYear = parseInt($(this).data('year'));
            if (selectedYear === engCurrentYear) return; // no change
            engCurrentYear = selectedYear;
            toggle.find('.eng-year-pill').removeClass('active');
            $(this).addClass('active');
            fetchEngagementData();
        });
        toggle.append(btn);
    });
}

function normalizeEngagementData(data) {
    if (!Array.isArray(data)) return data;
    
    data.forEach(bc => {
        if (!bc.team) {
            bc.team = {
                key_stakeholders: [],
                stakeholders: [],
                key_directs: [],
                influencers: []
            };
        }
        if (!bc.team.key_stakeholders) bc.team.key_stakeholders = [];
        if (!bc.team.stakeholders) bc.team.stakeholders = [];
        if (!bc.team.influencers) bc.team.influencers = [];
        if (!bc.team.key_directs) bc.team.key_directs = [];

        // Status is part of the identity because an entity can be deleted and
        // later re-created with the same id/name. Collapsing by name alone would
        // hide one of those lifecycle records.
        const getMemberKey = member => {
            const memberId = (member?.id || member?.name || "").trim().toLowerCase();
            const memberStatus = (member?.status || "").trim().toLowerCase();
            return `${memberId}::${memberStatus}`;
        };
        const existingKS = new Set(bc.team.key_stakeholders.filter(Boolean).map(getMemberKey));
        const existingSTK = new Set(bc.team.stakeholders.filter(Boolean).map(getMemberKey));
        const existingINF = new Set(bc.team.influencers.filter(Boolean).map(getMemberKey));
        const existingKD = new Set(bc.team.key_directs.filter(Boolean).map(getMemberKey));

        if (Array.isArray(bc.stakeholders)) {
            bc.stakeholders.forEach(s => {
                if (!s || !s.name || s.name === '-') return;
                const memberKey = getMemberKey(s);
                
                // If it's already in one of the team arrays, merge properties
                if (existingKS.has(memberKey) || existingSTK.has(memberKey) || existingINF.has(memberKey) || existingKD.has(memberKey)) {
                    let target = bc.team.key_stakeholders.filter(Boolean).find(x => getMemberKey(x) === memberKey) ||
                                 bc.team.stakeholders.filter(Boolean).find(x => getMemberKey(x) === memberKey) ||
                                 bc.team.influencers.filter(Boolean).find(x => getMemberKey(x) === memberKey) ||
                                 bc.team.key_directs.filter(Boolean).find(x => getMemberKey(x) === memberKey);
                    if (target) {
                        Object.keys(s).forEach(k => {
                            if (target[k] === undefined || target[k] === null) {
                                target[k] = s[k];
                            }
                        });
                    }
                    return;
                }

                // Not in any of the team arrays, so let's add it based on s.type
                const type = (s.type || "").trim().toLowerCase();
                if (type === "key stakeholder") {
                    bc.team.key_stakeholders.push(s);
                    existingKS.add(memberKey);
                } else if (type === "stakeholder") {
                    bc.team.stakeholders.push(s);
                    existingSTK.add(memberKey);
                } else if (type === "influencer") {
                    bc.team.influencers.push(s);
                    existingINF.add(memberKey);
                } else if (type === "key direct" || type === "key directs") {
                    bc.team.key_directs.push(s);
                    existingKD.add(memberKey);
                } else {
                    // Default fallback if type is not specified
                    if (s.keyStakeholderRef && s.keyStakeholderRef !== '-') {
                        bc.team.stakeholders.push(s);
                        existingSTK.add(memberKey);
                    } else {
                        bc.team.stakeholders.push(s);
                        existingSTK.add(memberKey);
                    }
                }
            });
        }
    });
    return data;
}

function buildKeyStakeholderGroups(keyStakeholders, stakeholders) {
    const groups = keyStakeholders.map(ks => ({ ks: ks, stks: [] }));
    let unassignedGroup = null;

    stakeholders.forEach(stk => {
        const ksRef = stk.keyStakeholderRef && stk.keyStakeholderRef !== '-'
            ? stk.keyStakeholderRef.trim().toLowerCase()
            : null;
        const matchingGroups = ksRef
            ? groups.filter(group => (group.ks?.name || '').trim().toLowerCase() === ksRef)
            : [];

        // References contain only the name, not a lifecycle-specific id. When
        // active and deleted records share that name, attach stakeholders to the
        // active record while still rendering the deleted record separately.
        const targetGroup = matchingGroups.find(group => group.ks?.status === "Active") || matchingGroups[0];
        if (targetGroup) {
            targetGroup.stks.push(stk);
        } else {
            if (!unassignedGroup) {
                unassignedGroup = { ks: null, stks: [] };
                groups.push(unassignedGroup);
            }
            unassignedGroup.stks.push(stk);
        }
    });

    return groups.filter(group => group.ks || group.stks.length > 0);
}

function getEntitySows(entity, accName, bcName, showActiveOnly, fyKey) {
    if (!entity) return [];
    const sowRevKey = Object.keys(entity).find(k => k.startsWith('sowLevelRevenue_'));
    const rawSows = (sowRevKey && entity[sowRevKey] && entity[sowRevKey][fyKey]) ? entity[sowRevKey][fyKey] : [];
    
    const isKeyStakeholder = entity.type === "Key Stakeholder";
    if (isKeyStakeholder && accName && bcName && typeof engRawData !== 'undefined') {
        const bc = engRawData.find(d => d.account === accName && d.buyingCenterName === bcName);
        if (bc) {
            const groupStks = (bc.team?.stakeholders || []).filter(s => 
                s && s.name && s.name !== '-' && s.keyStakeholderRef && s.keyStakeholderRef.trim().toLowerCase() === entity.name.trim().toLowerCase()
            );
            
            let filteredKsSows = rawSows;
            if (showActiveOnly) {
                filteredKsSows = rawSows.filter(sow => {
                    const belongsToDeleted = groupStks.some(stk => {
                        if (stk && stk.status === "Deleted") {
                            const stkRevKey = Object.keys(stk).find(k => k.startsWith('sowLevelRevenue_'));
                            const stkSows = (stkRevKey && stk[stkRevKey] && stk[stkRevKey][fyKey]) ? stk[stkRevKey][fyKey] : [];
                            return stkSows.some(s => s.sowName === sow.sowName || s.sowId === sow.sowId);
                        }
                        return false;
                    });
                    return !belongsToDeleted;
                });
            }
            
            const activeStks = groupStks.filter(s => !showActiveOnly || s.status === "Active");
            const stkSows = activeStks.flatMap(stk => {
                const stkRevKey = Object.keys(stk).find(k => k.startsWith('sowLevelRevenue_'));
                return (stkRevKey && stk[stkRevKey] && stk[stkRevKey][fyKey]) ? stk[stkRevKey][fyKey] : [];
            });
            
            const combined = [...filteredKsSows, ...stkSows];
            const seen = new Set();
            return combined.filter(sow => {
                const key = sow.sowName || '';
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        }
    }
    
    return rawSows;
}

function getBcAllSows(bc, showActiveOnly, fyKey) {
    if (!bc) return [];

    // BC revenue is returned independently of stakeholder records. This is
    // especially important for the "-" buying center, whose placeholder
    // stakeholders are intentionally excluded from the table's people lists.
    // Prefer the API's BC-level SOW list whenever it is available, and retain
    // the stakeholder aggregation below for older response shapes.
    const bcRevenueKey = `sowLevelRevenue_${fyKey}`;
    const bcRevenueSows = bc.bcRevenue?.[bcRevenueKey];
    if (Array.isArray(bcRevenueSows)) {
        const seen = new Set();
        return bcRevenueSows.filter(sow => {
            if (!sow) return false;
            // Renewals/versions can legitimately reuse the same sowId. The
            // uniqueId identifies the concrete SOW record; the name is the
            // safest fallback for older payloads that do not provide one.
            const key = sow.uniqueId || sow.sowName || sow.sowId || '';
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    if (!bc.team) return [];
    
    const kStakeholders = (bc.team.key_stakeholders || []).filter(s => s && s.name && s.name !== '-' && (!showActiveOnly || s.status === "Active"));
    const stakeholders = (bc.team.stakeholders || []).filter(s => s && s.name && s.name !== '-' && (!showActiveOnly || s.status === "Active"));
    
    const validGroups = buildKeyStakeholderGroups(kStakeholders, stakeholders);
    
    let bcAllSows = [];
    const bcSeenSowsGlobal = new Set();
    
    validGroups.forEach(group => {
        let groupSows = [];
        if (group.ks) {
            groupSows = getEntitySows(group.ks, bc.account, bc.buyingCenterName, showActiveOnly, fyKey);
        } else {
            const stkSows = group.stks.flatMap(stk => {
                const stkRevKey = Object.keys(stk).find(k => k.startsWith('sowLevelRevenue_'));
                return (stkRevKey && stk[stkRevKey] && stk[stkRevKey][fyKey]) ? stk[stkRevKey][fyKey] : [];
            });
            const seen = new Set();
            groupSows = stkSows.filter(sow => {
                const key = sow.sowName || '';
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        }
        
        groupSows.forEach(sow => {
            const key = sow.sowName || '';
            if (key && !bcSeenSowsGlobal.has(key)) {
                bcSeenSowsGlobal.add(key);
                bcAllSows.push(sow);
            }
        });
    });
    
    return bcAllSows;
}

function fetchEngagementData() {
    $(".loader-overlay").show();
    const account_id = ""; // TODO: get from global state if needed
    // engCurrentYear is controlled by the year pill filter — do not override here
    const year = engCurrentYear;
    
    let empId = localStorage.getItem('EmpUserID');
    let emp_email = localStorage.getItem('email');
    let emp_dep = localStorage.getItem('Department');

    let apiURL = apiValue.url.replace("/app", "/cnps/buying-center-engagement-v2");
    $.ajax({
        url: apiURL,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ 
            account_id: account_id, 
            year: year, 
            active_accounts_only: true,
            department: emp_dep,
            user_id: empId,
            email: emp_email
        }),
        success: function(data) {
            normalizeEngagementData(data);
            engRawData = data;

            populateEngFilters();
            refreshEngagementView();
            $(".nps-actions-bar").show();
            
            // Only show Engagement view if it's the active tab
            if ($(".nps-tab[data-tab='engagement']").hasClass("active")) {
                $(".nps-filters").show();
                $("#npsEngagementTable thead").show();
                $("#npsEngagementView").show();
            }
            $(".loader-overlay").hide();
        },
        error: function(error) {
            console.error("Error loading engagement data", error);
            $(".loader-overlay").hide();
            const errorMessage = `<div class="error-container">
                                    <div class="error-icon">⚠️</div>
                                    <h1 class='error-message-text'>Oops! Something went wrong.</h1>
                                    <p class='error-message-text_sub'>We're having some trouble loading this page. Please try again in a moment.</p>
                                    <button class="retry-button" onclick="location.reload()">Try Again</button>
                                  </div>`;
            $(".nps-container").html(errorMessage);
            $("#npsEngagementView").hide();
        }
    });
}

function fetchManagementData() {
    let apiURL = apiValue.url.replace("/app", "/get_buying_centers");
    $(".loader-overlay").show();
    
    let empId = localStorage.getItem('EmpUserID');
    let emp_dep = localStorage.getItem('Department');
    
    // Store currently active account ID before fetching
    const urlParams = new URLSearchParams(window.location.search);
    let activeAccountId = urlParams.get('accountId') || $("#managementAccountList li.active").data("account-id");
    
    $.ajax({
        url: apiURL,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ 
            account_id: "",
            emp_id: empId,
            department: emp_dep
        }),
        success: function(data) {
            let parsedData;
            try {
                parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            } catch (e) {
                parsedData = data;
            }

            window.allManagementData = parsedData;

            // Engagement rows may have rendered before the management response,
            // which contains the database IDs needed by the notes endpoint.
            if (engRawData) {
                refreshEngagementView();
            }

            let bcList = Array.isArray(parsedData) ? parsedData : (parsedData.stakeholder_details || []);

            const uniqueAccountsMap = new Map();
            if (Array.isArray(bcList)) {
                bcList.forEach(item => {
                    let accName = item.account || item.ACCOUNT_NAME || item.accountName || item.AccountName;
                    let accId = item.ACCOUNT_ID || item.accountId || item.AccountId;
                    let bcCount = 0;
                    
                    // Always count unique buying centers if DETAILS exist
                    if (item.DETAILS && Array.isArray(item.DETAILS) && item.DETAILS.length > 0) {
                        if (!accName) {
                            accName = item.DETAILS[0].ACCOUNT_NAME || item.DETAILS[0].accountName || item.DETAILS[0].account;
                        }
                        
                        // Count unique buying centers
                        const bcs = new Set();
                        item.DETAILS.forEach(d => {
                            if (d.BUYING_CENTRE) bcs.add(d.BUYING_CENTRE);
                        });
                        bcCount = bcs.size > 0 ? bcs.size : item.DETAILS.length;
                    }
                    
                    if (accName && accId) {
                        uniqueAccountsMap.set(accName, { accId, bcCount });
                    }
                });
            }

            const orderMap = getAccountOrderMap();
            const sortedAccounts = Array.from(uniqueAccountsMap.entries()).sort((a, b) => {
                const aName = a[0].toLowerCase().trim();
                const bName = b[0].toLowerCase().trim();
                
                let aIndex = orderMap[aName];
                let bIndex = orderMap[bName];
                aIndex = aIndex === undefined ? 9999 : aIndex;
                bIndex = bIndex === undefined ? 9999 : bIndex;
                
                if (aIndex !== bIndex) {
                    return aIndex - bIndex;
                }
                return a[0].localeCompare(b[0]);
            });
            const accountListHtml = sortedAccounts.map(([accName, data]) => {
                const id = data.accId || data;
                const countText = data.bcCount ? `<div style="font-size: 10px; color: #888; margin-top: 4px;">${data.bcCount} Buying Center${data.bcCount > 1 ? 's' : ''}</div>` : '';
                return `<li class="account-item" data-account-id="${id}" data-account-name="${accName}" style="padding: 6px 8px; border-bottom: 1px solid #eee; cursor: pointer;">
                            <div class="account-name" style="font-weight: 500; font-size: 12px; color: #313265;">${accName}</div>
                            ${countText}
                        </li>`;
            }).join("");
            
            $("#managementAccountList").html(accountListHtml);

            let clickedFirst = false;
            if ($(".nps-tab[data-tab='management']").hasClass("active")) {
                if (activeAccountId) {
                    let $activeItem = $(`#managementAccountList li[data-account-id='${activeAccountId}']`);
                    if ($activeItem.length === 0 && activeAccountId) {
                        let activeAccountName = urlParams.get('accountName') || 'New Account';
                        const newItemHtml = `<li class="account-item" data-account-id="${activeAccountId}" data-account-name="${activeAccountName}" style="padding: 6px 8px; border-bottom: 1px solid #eee; cursor: pointer;">
                            <div class="account-name" style="font-weight: 500; font-size: 12px; color: #313265;">${activeAccountName}</div>
                            <div style="font-size: 10px; color: #888; margin-top: 4px;">0 Buying Centers</div>
                        </li>`;
                        $("#managementAccountList").prepend(newItemHtml);
                        $activeItem = $(`#managementAccountList li[data-account-id='${activeAccountId}']`);
                    }

                    if ($activeItem.length > 0) {
                        const iframe = document.querySelector("#bcManagementContent iframe");
                        if (iframe && iframe.contentWindow) {
                            $activeItem.addClass("active");
                            let response = {
                                EMPLOYEE_LIST: window.allManagementData ? window.allManagementData.EMPLOYEE_LIST : null,
                                stakeholder_details: []
                            };
                            if (Array.isArray(bcList)) {
                                bcList.forEach(item => {
                                    let accId = item.ACCOUNT_ID || item.accountId || item.AccountId;
                                    if (!accId && item.DETAILS && Array.isArray(item.DETAILS) && item.DETAILS.length > 0) {
                                        accId = item.DETAILS[0].ACCOUNT_ID || item.DETAILS[0].accountId || item.DETAILS[0].AccountId;
                                    }
                                    if (accId && accId.toString() === activeAccountId.toString()) {
                                        response.stakeholder_details.push(item);
                                    }
                                });
                            }
                            iframe.contentWindow.postMessage({
                                type: 'SYNC_ENGAGEMENT_DATA',
                                payload: response
                            }, "*");
                        } else {
                            $activeItem.click();
                            clickedFirst = true;
                        }
                    } else {
                        $("#managementAccountList li").first().click();
                        clickedFirst = true;
                    }
                } else if ($("#managementAccountList li.active").length === 0) {
                    $("#managementAccountList li").first().click();
                    clickedFirst = true;
                }
            }
            if (!clickedFirst) {
                $(".loader-overlay").hide();
            }
        },
        error: function(error) {
            console.error("Error loading management data", error);
            $(".loader-overlay").hide();
        }
    });
}

function updateRevenueHeaders() {
    $('#thRevenueActProj').html(`Actl/Proj <i class="fa fa-sort sort-icon"></i>`);
    $('#thRevenuePreQual').html(`Pre-Qualified <i class="fa fa-sort sort-icon"></i>`);
    $('#thRevenueLeadScout').html(`Lead/Scout <i class="fa fa-sort sort-icon"></i>`);
}

function refreshEngagementView(changedId = null) {
    if (!engRawData) return;
    
    syncEngagementFilters(changedId);
    updateRevenueHeaders();
    const filtered = getFilteredEngData();
    renderEngagementTable(filtered);
    updateEngSortIcons();
}

function getBcSuperbosses(bc, showActiveOnly) {
    const list = [];
    if (!bc || !bc.superboss) return list;
    
    const sb = bc.superboss;
    if (sb.name && sb.name !== '-') {
        if (!showActiveOnly || sb.status === "Active") {
            list.push(sb);
        }
    }
    
    if (!showActiveOnly && Array.isArray(sb.history)) {
        sb.history.forEach(hist => {
            if (hist && hist.name && hist.name !== '-' && hist.status === "Deleted") {
                list.push(hist);
            }
        });
    }
    return list;
}

function getFilteredEngData() {
    const search = ($("#npsSearch").val() || "").toLowerCase();
    const selAcc = $("#engAccount").val() || [];
    const selBC = $("#engBuyingCenter").val() || [];
    const selSB = $("#engSuperboss").val() || [];
    const selKS = $("#engKeyStakeholder").val() || [];
    const selSTK = $("#engStakeholder").val() || [];
    const showActiveOnly = $("#showActiveOnly").is(":checked");

    return engRawData.filter(d => {
        const sbs = getBcSuperbosses(d, showActiveOnly);
        const ksActive = (d.team?.key_stakeholders || []).filter(s => !showActiveOnly || s.status === "Active");
        const stkActive = (d.team?.stakeholders || []).filter(s => !showActiveOnly || s.status === "Active");
        const kdActive = (d.team?.key_directs || []).filter(s => !showActiveOnly || s.status === "Active");
        const infActive = (d.team?.influencers || []).filter(s => !showActiveOnly || s.status === "Active");

        const teamNames = [
            ...ksActive,
            ...stkActive,
            ...kdActive,
            ...infActive
        ].map(s => (s.name || "").toLowerCase());

        const matchesSearch = !search || 
            (d.account || "").toLowerCase().includes(search) ||
            (d.buyingCenterName || "").toLowerCase().includes(search) ||
            sbs.some(sb => (sb.name || "").toLowerCase().includes(search)) ||
            teamNames.some(tn => tn.includes(search));
            
        const matchesAcc = selAcc.length === 0 || selAcc.includes(d.account);
        const matchesBC = selBC.length === 0 || selBC.includes(d.buyingCenterName);
        const matchesSB = selSB.length === 0 || sbs.some(sb => selSB.includes(sb.name || "-"));
        const matchesKS = selKS.length === 0 || ksActive.some(s => selKS.includes(s.name));
        const matchesSTK = selSTK.length === 0 || stkActive.some(s => selSTK.includes(s.name));

        // When a specific interaction type is selected, only show rows
        // that have at least one non-zero engagement count for that type
        let matchesInteraction = true;
        if (engInteractionType && engInteractionType !== 'All') {
            const allMembers = [
                ...sbs,
                ...ksActive,
                ...stkActive
            ].filter(Boolean);
            matchesInteraction = allMembers.some(m => {
                const typeEng = m.engagement?.[engInteractionType] || {};
                return Object.values(typeEng).some(v => v > 0);
            });
        }

        return matchesSearch && matchesAcc && matchesBC && matchesSB && matchesKS && matchesSTK && matchesInteraction;
    });
}

function isActProjSow(sow) {
    if (!sow) return false;
    const status = (sow.sowStatus || '').toLowerCase();
    if (status.includes('pre-qual') || status.includes('pre qual')) return false;
    return status.includes('signed') || 
           status.includes('qualified') || 
           status.includes('quailified') || 
           status.includes('proposal') || 
           status.includes('renewal');
}

function getBcSortValue(bc, col) {
    if (!bc) return 0;
    const showActiveOnly = $("#showActiveOnly").is(":checked");
    if (col === "account") {
        return bc.account || "";
    }
    if (col === "buyingCenter") {
        return bc.buyingCenterName || "";
    }
    if (col === "superboss") {
        const sbs = getBcSuperbosses(bc, showActiveOnly);
        return sbs.map(s => s.name || "").join(', ');
    }
    if (col === "keyStakeholder") {
        const ksActive = (bc.team?.key_stakeholders || []).filter(s => !showActiveOnly || s.status === "Active");
        return ksActive.map(s => s.name).join(', ');
    }
    if (col === "stakeholder") {
        const stkActive = (bc.team?.stakeholders || []).filter(s => !showActiveOnly || s.status === "Active");
        return stkActive.map(s => s.name).join(', ');
    }
    if (col === "revenueActProj" || col === "revenuePreQual" || col === "revenueLeadScout") {
        const fyKey = 'fy' + engCurrentYear.toString().slice(-2);
        const bcAllSows = getBcAllSows(bc, showActiveOnly, fyKey);
        let sum = 0;
        bcAllSows.forEach(sow => {
            const status = (sow.sowStatus || '').toLowerCase();
            const val = parseFloat(sow.totalRevenue || sow.revenue || sow[fyKey] || 0);
            if (col === "revenuePreQual") {
                if (status.includes('pre-qual') || status.includes('pre qual')) sum += val;
            } else if (col === "revenueLeadScout") {
                if (status.includes('lead') || status.includes('scout')) sum += val;
            } else if (isActProjSow(sow)) { // actProj
                sum += val;
            }
        });
        return sum;
    }
    // Engagement count columns like 'past30', 'next30', etc.
    const bcSummary = calculateBcSummary(bc);
    const eng = bcSummary[engInteractionType] || {};
    return eng[col] || 0;
}

function getAccountSortValue(bcList, col) {
    if (!bcList || bcList.length === 0) return 0;
    const showActiveOnly = $("#showActiveOnly").is(":checked");
    if (col === "account") {
        return bcList[0].account || "";
    }
    if (col === "buyingCenter") {
        return bcList.map(bc => bc.buyingCenterName || "").sort()[0] || "";
    }
    if (col === "superboss") {
        return bcList.flatMap(bc => {
            const sbs = getBcSuperbosses(bc, showActiveOnly);
            return sbs.map(sb => sb.name || "");
        }).filter(Boolean).sort()[0] || "";
    }
    if (col === "keyStakeholder") {
        return bcList.flatMap(bc => (bc.team?.key_stakeholders || []).filter(s => !showActiveOnly || s.status === "Active").map(s => s.name)).sort()[0] || "";
    }
    if (col === "stakeholder") {
        return bcList.flatMap(bc => (bc.team?.stakeholders || []).filter(s => !showActiveOnly || s.status === "Active").map(s => s.name)).sort()[0] || "";
    }
    if (col === "revenueActProj" || col === "revenuePreQual" || col === "revenueLeadScout") {
        return bcList.reduce((sum, bc) => sum + getBcSortValue(bc, col), 0);
    }
    return bcList.reduce((sum, bc) => sum + getBcSortValue(bc, col), 0);
}

function updateEngSortIcons() {
    $(".sortable-header").each(function() {
        const col = $(this).data("sort");
        const iconContainer = $(this).find(".sort-icon");
        if (iconContainer.length > 0) {
            iconContainer.removeClass("fa-sort fa-sort-up fa-sort-down sort-active");
            if (col === engSortCol) {
                iconContainer.addClass(engSortOrder === "asc" ? "fa-sort-up sort-active" : "fa-sort-down sort-active");
            } else {
                iconContainer.addClass("fa-sort");
            }
        }
    });
}

function getEntityActProjRev(entity, accName, bcName) {
    if (!entity) return 0;
    const fyKey = 'fy' + engCurrentYear.toString().slice(-2);
    const showActiveOnly = $("#showActiveOnly").is(":checked");
    const entitySows = getEntitySows(entity, accName, bcName, showActiveOnly, fyKey);
    let sum = 0;
    entitySows.forEach(sow => {
        if (isActProjSow(sow)) {
            sum += parseFloat(sow.totalRevenue || sow.revenue || sow[fyKey] || 0);
        }
    });
    return sum;
}

function getGroupActProjRev(group, accName, bcName) {
    const groupMembers = [];
    if (group.ks) groupMembers.push(group.ks);
    groupMembers.push(...group.stks);
    
    const fyKey = 'fy' + engCurrentYear.toString().slice(-2);
    const showActiveOnly = $("#showActiveOnly").is(":checked");
    let groupAllSows = [];
    if (group.ks) {
        groupAllSows = getEntitySows(group.ks, accName, bcName, showActiveOnly, fyKey);
    } else {
        const stkSows = group.stks.flatMap(stk => {
            const stkRevKey = Object.keys(stk).find(k => k.startsWith('sowLevelRevenue_'));
            return (stkRevKey && stk[stkRevKey] && stk[stkRevKey][fyKey]) ? stk[stkRevKey][fyKey] : [];
        });
        const seen = new Set();
        groupAllSows = stkSows.filter(sow => {
            const key = sow.sowName || '';
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    
    let sum = 0;
    groupAllSows.forEach(sow => {
        if (isActProjSow(sow)) {
            sum += parseFloat(sow.totalRevenue || sow.revenue || sow[fyKey] || 0);
        }
    });
    return sum;
}

function renderEngagementTable(data) {
    const body = $("#npsEngagementBody");
    body.empty();

    if (!data || data.length === 0) {
        body.append('<tr><td colspan="14" style="text-align:center; padding:30px;">No data found.</td></tr>');
        return;
    }

    // Group data by Account Name
    const accountsMap = {};
    data.forEach(bc => {
        const accName = bc.account || '-';
        if (!accountsMap[accName]) {
            accountsMap[accName] = [];
        }
        accountsMap[accName].push(bc);
    });

    const orderMap = getAccountOrderMap();
    
    const sortedAccountNames = Object.keys(accountsMap).sort((a, b) => {
        const listA = accountsMap[a];
        const listB = accountsMap[b];
        
        let valA = getAccountSortValue(listA, engSortCol);
        let valB = getAccountSortValue(listB, engSortCol);
        
        if (engSortCol === "account") {
            const aLower = a.toLowerCase().trim();
            const bLower = b.toLowerCase().trim();
            
            let aIndex = orderMap[aLower];
            let bIndex = orderMap[bLower];
            aIndex = aIndex === undefined ? 9999 : aIndex;
            bIndex = bIndex === undefined ? 9999 : bIndex;
            
            if (aIndex !== bIndex) {
                return engSortOrder === "asc" ? aIndex - bIndex : bIndex - aIndex;
            }
            return engSortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a);
        }
        
        if (typeof valA === "string" && typeof valB === "string") {
            return engSortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return engSortOrder === "asc" ? valA - valB : valB - valA;
        }
    });
    
    // Update global expand/collapse action headers
    updateEngHeaderIcons(sortedAccountNames.length);

    sortedAccountNames.forEach(accName => {
        const bcList = accountsMap[accName];
        const showActiveOnly = $("#showActiveOnly").is(":checked");
        
        // Sort the buying centers within the account
        bcList.sort((a, b) => {
            if (engSortCol === "account") {
                const revA = getBcSortValue(a, "revenueActProj");
                const revB = getBcSortValue(b, "revenueActProj");
                if (revB !== revA) {
                    return revB - revA; // High to low
                }
                // Fallback to alphabetical order of buying center name
                return (a.buyingCenterName || "").localeCompare(b.buyingCenterName || "");
            }
            
            let valA = getBcSortValue(a, engSortCol);
            let valB = getBcSortValue(b, engSortCol);
            
            if (typeof valA === "string" && typeof valB === "string") {
                return engSortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
            } else {
                return engSortOrder === "asc" ? valA - valB : valB - valA;
            }
        });
        const safeAccount = accName.replace(/[^a-zA-Z0-9]/g, '_');
        const accId = `eng_acc_${safeAccount}`;
        const realAccountId = bcList.length > 0 ? bcList[0].accountId || '' : '';
        
        // Determine if account is expandable (has multiple BCs, or named BC, or named superboss/stakeholders)
        const hasMultipleBc = bcList.length > 1;
        const hasNamedBc = bcList.some(bc => bc.buyingCenterName && bc.buyingCenterName !== '-');
        const hasSuperboss = bcList.some(bc => {
            const sbs = getBcSuperbosses(bc, showActiveOnly);
            return sbs.some(sb => sb.name && sb.name !== '-');
        });
        const hasKeyStakeholders = bcList.some(bc => bc.team?.key_stakeholders && bc.team.key_stakeholders.some(s => s && s.name && s.name !== '-'));
        const hasStakeholders = bcList.some(bc => bc.team?.stakeholders && bc.team.stakeholders.some(s => s && s.name && s.name !== '-'));

        const canExpandAccount = hasMultipleBc || hasNamedBc || hasSuperboss || hasKeyStakeholders || hasStakeholders;
        const isAccExpanded = canExpandAccount && engExpandedAccounts.has(accId);

        // Gather all members and totals for this Account safely with optional chaining
        const sbAccMembers = bcList.flatMap(bc => getBcSuperbosses(bc, showActiveOnly));
        const ksAccMembers = bcList.flatMap(bc => bc.team?.key_stakeholders || []).filter(s => s && (!showActiveOnly || s.status === "Active"));
        const stkAccMembers = bcList.flatMap(bc => bc.team?.stakeholders || []).filter(s => s && (!showActiveOnly || s.status === "Active"));
        const allAccMembers = [].concat(sbAccMembers, ksAccMembers, stkAccMembers);

        const fyKey = 'fy' + engCurrentYear.toString().slice(-2);
        
        const sbAccSummary = calculateRoleSummary(sbAccMembers);
        const ksAccSummary = calculateRoleSummary(ksAccMembers);
        const stkAccSummary = calculateRoleSummary(stkAccMembers);
        
        const accSummary = calculateGroupSummary(allAccMembers);
        const accEng = accSummary[engInteractionType] || {};

        // Collect SOWs from all members in the account — deduplicate by sowId/sowName
        let accAllSows = [];
        const accSeenSowsGlobal = new Set();
        bcList.forEach(bc => {
            const bcSows = getBcAllSows(bc, showActiveOnly, fyKey);
            bcSows.forEach(sow => {
                const key = sow.sowName || '';
                if (key && !accSeenSowsGlobal.has(key)) {
                    accSeenSowsGlobal.add(key);
                    accAllSows.push(sow);
                }
            });
        });
        let accActProjSize = 0, accPreQualSize = 0, accLeadScoutSize = 0;
        let accSowsActProj = [], accSowsPreQual = [], accSowsLeadScout = [];
        accAllSows.forEach(sow => {
            const status = (sow.sowStatus || '').toLowerCase();
            const val = parseFloat(sow.totalRevenue || sow.revenue || sow[fyKey] || 0);
            if (status.includes('pre-qual') || status.includes('pre qual')) {
                accPreQualSize += val;
                accSowsPreQual.push(sow);
            } else if (status.includes('lead') || status.includes('scout')) {
                accLeadScoutSize += val;
                accSowsLeadScout.push(sow);
            } else if (isActProjSow(sow)) {
                accActProjSize += val;
                accSowsActProj.push(sow);
            }
        });

        // The API summary applies its revenue accounting rules across SOW
        // renewals/versions. Keep every concrete SOW in the details modal, but
        // use the authoritative summary for the displayed bucket totals.
        const accountRevenueForYear = bcList.find(bc => bc.accountRevenue?.[fyKey])?.accountRevenue?.[fyKey];
        if (accountRevenueForYear) {
            if (Number.isFinite(Number(accountRevenueForYear.actualProjected))) accActProjSize = Number(accountRevenueForYear.actualProjected);
            if (Number.isFinite(Number(accountRevenueForYear.preQualified))) accPreQualSize = Number(accountRevenueForYear.preQualified);
            if (Number.isFinite(Number(accountRevenueForYear.leadScout))) accLeadScoutSize = Number(accountRevenueForYear.leadScout);
        }
        
        const safeAccNameForClick = accName.replace(/'/g, "\\'");
        
        const accEscActProj = accSowsActProj.length > 0 ? encodeURIComponent(JSON.stringify(accSowsActProj)).replace(/'/g, "%27") : "";
        const accOnClActProj = accSowsActProj.length > 0 ? `onclick="showSowRevenueModal(event, '${safeAccNameForClick}', '${accEscActProj}', 'actProj', ${accActProjSize})"` : "";
        const accStyActProj = accSowsActProj.length > 0 ? `font-weight:600; color:#f7941d; cursor:pointer;` : `font-weight:600; color:#f7941d;`;
        
        const accEscPreQual = accSowsPreQual.length > 0 ? encodeURIComponent(JSON.stringify(accSowsPreQual)).replace(/'/g, "%27") : "";
        const accOnClPreQual = accSowsPreQual.length > 0 ? `onclick="showSowRevenueModal(event, '${safeAccNameForClick}', '${accEscPreQual}', 'preQual', ${accPreQualSize})"` : "";
        const accStyPreQual = accSowsPreQual.length > 0 ? `font-weight:600; color:#f7941d; cursor:pointer;` : `font-weight:600; color:#f7941d;`;
        
        const accEscLeadScout = accSowsLeadScout.length > 0 ? encodeURIComponent(JSON.stringify(accSowsLeadScout)).replace(/'/g, "%27") : "";
        const accOnClLeadScout = accSowsLeadScout.length > 0 ? `onclick="showSowRevenueModal(event, '${safeAccNameForClick}', '${accEscLeadScout}', 'leadScout', ${accLeadScoutSize})"` : "";
        const accStyLeadScout = accSowsLeadScout.length > 0 ? `font-weight:600; color:#f7941d; cursor:pointer;` : `font-weight:600; color:#f7941d;`;

        if (!isAccExpanded) {
            // Render a SINGLE summary row for this collapsed Account
            const iconClass = "fa-chevron-right";
            const expandBtn = canExpandAccount ? `
                <a href="javascript:void(0)" onclick="toggleAccountRow('${accId}')" class="nps-expand-icon" style="text-decoration:none; color:#333; flex-shrink:0;">
                    <i class="fas ${iconClass}"></i>
                </a>
            ` : `<span class="nps-expand-icon-placeholder" style="width: 14px; display: inline-block; flex-shrink: 0;"></span>`;
            
            let row = `<tr class="parent-row-${accId} collapsed-row" data-id="${accId}">
                <td class="sticky-col bc-sticky-col-1" style="left:0; border-bottom: 2px solid #ddd; border-top: 2px solid #ddd;">
                    <div style="display: flex; align-items: center; gap: 0px; width: 100%;">
                        ${expandBtn}
                        <span>${accName}</span>
                    </div>
                </td>
                <td class="sticky-col bc-sticky-col-2" style="left:180px; border-bottom: 2px solid #ddd; border-top: 2px solid #ddd;">-</td>
                <td class="entity-cell" style="border-top: 2px solid #ddd; border-bottom: 2px solid #ddd;">${renderGroupEntityInfo(sbAccMembers, sbAccSummary, true, accName, "-")}</td>
                <td class="entity-cell" style="border-top: 2px solid #ddd; border-bottom: 2px solid #ddd;">${renderGroupEntityInfo(ksAccMembers, ksAccSummary, true, accName, "-")}</td>
                <td class="entity-cell" style="border-top: 2px solid #ddd; border-bottom: 2px solid #ddd;">${renderGroupEntityInfo(stkAccMembers, stkAccSummary, true, accName, "-")}</td>
                <td class="col-num" style="${accStyActProj} border-top: 2px solid #ddd; border-bottom: 2px solid #ddd;" ${accOnClActProj}>${formatCurrency(accActProjSize)}</td>
                <td class="col-num" style="${accStyPreQual} border-top: 2px solid #ddd; border-bottom: 2px solid #ddd;" ${accOnClPreQual}>${formatCurrency(accPreQualSize)}</td>
                <td class="col-num" style="${accStyLeadScout} border-top: 2px solid #ddd; border-bottom: 2px solid #ddd;" ${accOnClLeadScout}>${formatCurrency(accLeadScoutSize)}</td>
                
                <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: 2px solid #ddd; font-weight:600;">${renderCount(accEng.past30, allAccMembers, 30, 'past', accName, '')}</td>
                <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: 2px solid #ddd; font-weight:600;">${renderCount(accEng.past60, allAccMembers, 60, 'past', accName, '')}</td>
                <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: 2px solid #ddd; font-weight:600;">${renderCount(accEng.past90, allAccMembers, 90, 'past', accName, '')}</td>
                <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: 2px solid #ddd; font-weight:600;">${renderCount(accEng.past180, allAccMembers, 180, 'past', accName, '')}</td>
                
                <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: 2px solid #ddd; font-weight:600;">${renderCount(accEng.next30, allAccMembers, 30, 'next', accName, '')}</td>
                <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: 2px solid #ddd; font-weight:600;">${renderCount(accEng.next60, allAccMembers, 60, 'next', accName, '')}</td>
                <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: 2px solid #ddd; font-weight:600;">${renderCount(accEng.next90, allAccMembers, 90, 'next', accName, '')}</td>
                <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: 2px solid #ddd; font-weight:600;">${renderCount(accEng.next180, allAccMembers, 180, 'next', accName, '')}</td>
            </tr>`;
            body.append(row);
        } else {
            // Expanded Account - render its Buying Centers!
            let lastAccount = null;

            bcList.forEach((bc, idx) => {
                const isSameAccount = (bc.account === lastAccount);
                lastAccount = bc.account;
                
                // Account column cell content (only rendered for the first row of the account)
                let displayAccount = '';
                if (!isSameAccount) {
                    const iconClass = "fa-chevron-down";
                    const expandBtn = canExpandAccount ? `
                        <a href="javascript:void(0)" onclick="toggleAccountRow('${accId}')" class="nps-expand-icon" style="text-decoration:none; color:#333; flex-shrink:0;">
                            <i class="fas ${iconClass}"></i>
                        </a>
                    ` : `<span class="nps-expand-icon-placeholder" style="width: 14px; display: inline-block; flex-shrink: 0;"></span>`;
                    displayAccount = `
                        <div style="display: flex; align-items: center; gap: 0px; width: 100%;">
                            ${expandBtn}
                            <span>${accName}</span>
                        </div>
                    `;
                }

                const accountTopBorder = isSameAccount ? "none" : "2px solid #ddd";

                const safeBC = (bc.buyingCenterName || 'na').replace(/[^a-zA-Z0-9]/g, '_');
                const bcId = `eng_bc_${safeAccount}_${safeBC}`;
                const isBcExpanded = engExpandedRows.has(bcId);

                // Calculate BC-level summary metrics (sum of all members)
                const bcSummary = calculateBcSummary(bc);
                const eng = bcSummary[engInteractionType] || {};

                const kStakeholders = (bc.team?.key_stakeholders || []).filter(s => s && s.name && s.name !== '-' && (!showActiveOnly || s.status === "Active"));
                const stakeholders = (bc.team?.stakeholders || []).filter(s => s && s.name && s.name !== '-' && (!showActiveOnly || s.status === "Active"));
                const sbs = getBcSuperbosses(bc, showActiveOnly);
                
                // Sort by individual Actual/Projected revenue descending
                sbs.sort((sa, sb) => getEntityActProjRev(sb, bc.account, bc.buyingCenterName) - getEntityActProjRev(sa, bc.account, bc.buyingCenterName));
                kStakeholders.sort((sa, sb) => getEntityActProjRev(sb, bc.account, bc.buyingCenterName) - getEntityActProjRev(sa, bc.account, bc.buyingCenterName));
                stakeholders.sort((sa, sb) => getEntityActProjRev(sb, bc.account, bc.buyingCenterName) - getEntityActProjRev(sa, bc.account, bc.buyingCenterName));
                
                const allBcMembers = [...sbs].concat(kStakeholders, stakeholders).filter(Boolean);
                
                // Summaries for groups
                const sbSummary = calculateRoleSummary(sbs);
                const ksSummary = calculateRoleSummary(kStakeholders);
                const stkSummary = calculateRoleSummary(stakeholders);
                
                // Size of Prize: sum of all key stakeholders + independent stakeholders (including placeholder/unnamed ones)
                const fyKey = 'fy' + engCurrentYear.toString().slice(-2);
                const bcAllSows = getBcAllSows(bc, showActiveOnly, fyKey);
                
                let bcActProjSize = 0, bcPreQualSize = 0, bcLeadScoutSize = 0;
                let bcSowsActProj = [], bcSowsPreQual = [], bcSowsLeadScout = [];
                bcAllSows.forEach(sow => {
                    const status = (sow.sowStatus || '').toLowerCase();
                    const val = parseFloat(sow.totalRevenue || sow.revenue || sow[fyKey] || 0);
                    if (status.includes('pre-qual') || status.includes('pre qual')) {
                        bcPreQualSize += val;
                        bcSowsPreQual.push(sow);
                    } else if (status.includes('lead') || status.includes('scout')) {
                        bcLeadScoutSize += val;
                        bcSowsLeadScout.push(sow);
                    } else if (isActProjSow(sow)) {
                        bcActProjSize += val;
                        bcSowsActProj.push(sow);
                    }
                });

                const bcRevenueForYear = bc.bcRevenue?.[fyKey];
                if (bcRevenueForYear) {
                    if (Number.isFinite(Number(bcRevenueForYear.actualProjected))) bcActProjSize = Number(bcRevenueForYear.actualProjected);
                    if (Number.isFinite(Number(bcRevenueForYear.preQualified))) bcPreQualSize = Number(bcRevenueForYear.preQualified);
                    if (Number.isFinite(Number(bcRevenueForYear.leadScout))) bcLeadScoutSize = Number(bcRevenueForYear.leadScout);
                }

                const safeBcNameForClick = (bc.buyingCenterName || '').replace(/'/g, "\\'");
                
                const bcEscActProj = bcSowsActProj.length > 0 ? encodeURIComponent(JSON.stringify(bcSowsActProj)).replace(/'/g, "%27") : "";
                const bcOnClActProj = bcSowsActProj.length > 0 ? `onclick="showSowRevenueModal(event, '${safeBcNameForClick}', '${bcEscActProj}', 'actProj', ${bcActProjSize})"` : "";
                const bcStyActProj = bcSowsActProj.length > 0 ? `font-weight:600; color:#f7941d; cursor:pointer;` : `font-weight:600; color:#f7941d;`;
                
                const bcEscPreQual = bcSowsPreQual.length > 0 ? encodeURIComponent(JSON.stringify(bcSowsPreQual)).replace(/'/g, "%27") : "";
                const bcOnClPreQual = bcSowsPreQual.length > 0 ? `onclick="showSowRevenueModal(event, '${safeBcNameForClick}', '${bcEscPreQual}', 'preQual', ${bcPreQualSize})"` : "";
                const bcStyPreQual = bcSowsPreQual.length > 0 ? `font-weight:600; color:#f7941d; cursor:pointer;` : `font-weight:600; color:#f7941d;`;
                
                const bcEscLeadScout = bcSowsLeadScout.length > 0 ? encodeURIComponent(JSON.stringify(bcSowsLeadScout)).replace(/'/g, "%27") : "";
                const bcOnClLeadScout = bcSowsLeadScout.length > 0 ? `onclick="showSowRevenueModal(event, '${safeBcNameForClick}', '${bcEscLeadScout}', 'leadScout', ${bcLeadScoutSize})"` : "";
                const bcStyLeadScout = bcSowsLeadScout.length > 0 ? `font-weight:600; color:#f7941d; cursor:pointer;` : `font-weight:600; color:#f7941d;`;

                // Keep active and deleted lifecycle records separate even when
                // they have the same stakeholder name.
                const validGroups = buildKeyStakeholderGroups(kStakeholders, stakeholders);
                
                // Sort sbs: active first, then by revenue descending
                sbs.sort((sa, sb) => {
                    const saAct = sa.status === 'Active';
                    const sbAct = sb.status === 'Active';
                    if (saAct && !sbAct) return -1;
                    if (!saAct && sbAct) return 1;
                    return getEntityActProjRev(sb, bc.account, bc.buyingCenterName) - getEntityActProjRev(sa, bc.account, bc.buyingCenterName);
                });

                // Sort validGroups: active records first, then by combined revenue.
                const getGroupRevenue = (group) => {
                    const ksRev = group.ks ? getEntityActProjRev(group.ks, bc.account, bc.buyingCenterName) : 0;
                    const stkRev = group.stks.reduce((sum, s) => sum + getEntityActProjRev(s, bc.account, bc.buyingCenterName), 0);
                    return ksRev + stkRev;
                };
                validGroups.sort((a, b) => {
                    const aActive = a.ks?.status === 'Active';
                    const bActive = b.ks?.status === 'Active';
                    if (aActive && !bActive) return -1;
                    if (!aActive && bActive) return 1;
                    return getGroupRevenue(b) - getGroupRevenue(a);
                });

                const canExpandBC = sbs.length > 1 || kStakeholders.length > 1 || stakeholders.length > 1;

                const bcIconClass = isBcExpanded ? "fa-chevron-down" : "fa-chevron-right";
                const rowClass = isBcExpanded ? "expanded-row" : "collapsed-row";
                const bcBottomBorder = isBcExpanded && canExpandBC ? "none" : "2px solid #ddd";

                let expandLink = '';
                if (canExpandBC) {
                    expandLink = `
                        <a href="javascript:void(0)" onclick="toggleEngRow('${bcId}')" class="nps-expand-icon" style="margin-right:8px; text-decoration:none; color:#333;">
                            <i class="fas ${bcIconClass}"></i>
                        </a>
                    `;
                }

                const showDetailsOnParent = isBcExpanded || !canExpandBC;

                let sbContent = '-';
                let ksContent = '-';
                let stkContent = '-';

                if (showDetailsOnParent) {
                    // Show the first item's detailed names and metrics
                    sbContent = sbs[0] ? renderEntityInfo(sbs[0], bc.account, bc.buyingCenterName) : '-';
                    ksContent = (validGroups[0] && validGroups[0].ks) ? renderEntityInfo(validGroups[0].ks, bc.account, bc.buyingCenterName) : '-';
                    if (validGroups[0] && validGroups[0].stks && validGroups[0].stks.length > 0) {
                        validGroups[0].stks.sort((sa, sb) => getEntityActProjRev(sb, bc.account, bc.buyingCenterName) - getEntityActProjRev(sa, bc.account, bc.buyingCenterName));
                        const stksContent = validGroups[0].stks.map(s => renderEntityInfo(s, bc.account, bc.buyingCenterName)).filter(Boolean);
                        if (stksContent.length > 0) {
                            stkContent = `
                                <div style="display:flex; flex-wrap:wrap; gap:0px;">
                                    ${stksContent.join('')}
                                </div>
                            `;
                        }
                    }
                } else {
                    // Show summary metrics (with names hidden)
                    sbContent = renderGroupEntityInfo(sbs, sbSummary, true, bc.account, bc.buyingCenterName);
                    ksContent = renderGroupEntityInfo(kStakeholders, ksSummary, true, bc.account, bc.buyingCenterName);
                    stkContent = renderGroupEntityInfo(stakeholders, stkSummary, true, bc.account, bc.buyingCenterName);
                }
                
                const sbClass = sbContent === '-' ? 'entity-cell centered-cell' : 'entity-cell';
                const ksClass = ksContent === '-' ? 'entity-cell centered-cell' : 'entity-cell';
                const stkClass = stkContent === '-' ? 'entity-cell centered-cell' : 'entity-cell';

                // Main BC Row
                const singleDetailRowClass = !canExpandBC ? "single-detail-row" : "";

                let mainRow = `<tr class="parent-row-${bcId} ${rowClass} ${singleDetailRowClass}">
                    <td class="sticky-col bc-sticky-col-1" style="left:0; border-bottom: ${bcBottomBorder}; border-top: ${accountTopBorder};">
                        ${displayAccount}
                    </td>
                    <td class="sticky-col bc-sticky-col-2" style="left:180px; border-bottom: ${bcBottomBorder}; border-top: 2px solid #ddd;">
                        <div style="display: flex; align-items: center;">
                            ${expandLink}
                            <div>${bc.buyingCenterName || '-'}</div>
                        </div>
                    </td>
                    <td class="${sbClass}" style="border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};">${sbContent}</td>
                    <td class="${ksClass}" style="border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};">${ksContent}</td>
                    <td class="${stkClass}" style="border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};">${stkContent}</td>
                    <td class="col-num" style="${bcStyActProj} border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};" ${bcOnClActProj}>${formatCurrency(bcActProjSize)}</td>
                    <td class="col-num" style="${bcStyPreQual} border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};" ${bcOnClPreQual}>${formatCurrency(bcPreQualSize)}</td>
                    <td class="col-num" style="${bcStyLeadScout} border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};" ${bcOnClLeadScout}>${formatCurrency(bcLeadScoutSize)}</td>
                    
                    <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};">${renderCount(eng.past30, allBcMembers, 30, 'past', bc.account, bc.buyingCenterName)}</td>
                    <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};">${renderCount(eng.past60, allBcMembers, 60, 'past', bc.account, bc.buyingCenterName)}</td>
                    <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};">${renderCount(eng.past90, allBcMembers, 90, 'past', bc.account, bc.buyingCenterName)}</td>
                    <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};">${renderCount(eng.past180, allBcMembers, 180, 'past', bc.account, bc.buyingCenterName)}</td>
                    
                    <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};">${renderCount(eng.next30, allBcMembers, 30, 'next', bc.account, bc.buyingCenterName)}</td>
                    <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};">${renderCount(eng.next60, allBcMembers, 60, 'next', bc.account, bc.buyingCenterName)}</td>
                    <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};">${renderCount(eng.next90, allBcMembers, 90, 'next', bc.account, bc.buyingCenterName)}</td>
                    <td class="col-num summary-totals" style="border-top: 2px solid #ddd; border-bottom: ${bcBottomBorder};">${renderCount(eng.next180, allBcMembers, 180, 'next', bc.account, bc.buyingCenterName)}</td>
                </tr>`;
                body.append(mainRow);

                // Render Sub-Rows only if canExpandBC is true
                if (canExpandBC) {
                    const maxLen = Math.max(sbs.length, validGroups.length);
                    const displayStyle = isBcExpanded ? "" : "display:none;";
                    const fyKey = 'fy' + engCurrentYear.toString().slice(-2);

                    // We start rendering sub-rows from index 1, since index 0 is shown on the parent row itself when open!
                    for (let i = 1; i < maxLen; i++) {
                        const sb = sbs[i] || null;
                        const group = validGroups[i] || null;

                        // Render Superboss cell
                        const sbContent = sb ? renderEntityInfo(sb, bc.account, bc.buyingCenterName) : '';
                        const sbClass = sbContent ? 'entity-cell' : 'entity-cell centered-cell';
                        // A single Superboss can have multiple Key Stakeholders. Keep
                        // its repeated sub-row cells blank instead of showing "-".
                        const sbDisplay = sbContent || '';

                        // Render Key Stakeholder cell
                        const subKsContent = (group && group.ks) ? renderEntityInfo(group.ks, bc.account, bc.buyingCenterName) : '';
                        const subKsClass = (subKsContent === '-' || subKsContent === '') ? 'entity-cell centered-cell' : 'entity-cell';
                        const subKsDisplay = subKsContent || '-';

                        // Render Stakeholder cell
                        let stksHtml = '';
                        let subStksClass = 'entity-cell';
                        if (group && group.stks && group.stks.length > 0) {
                            group.stks.sort((sa, sb) => getEntityActProjRev(sb, bc.account, bc.buyingCenterName) - getEntityActProjRev(sa, bc.account, bc.buyingCenterName));
                            const stksContent = group.stks.map(s => renderEntityInfo(s, bc.account, bc.buyingCenterName)).filter(Boolean);
                            if (stksContent.length === 0 || stksContent.every(c => c === '-')) {
                                stksHtml = '-';
                                subStksClass = 'entity-cell centered-cell';
                            } else {
                                stksHtml = `
                                    <div style="display:flex; flex-wrap:wrap; gap:0px;">
                                        ${stksContent.join('')}
                                    </div>
                                `;
                            }
                        } else {
                            stksHtml = '-';
                            subStksClass = 'entity-cell centered-cell';
                        }

                        // Collect SOWs for this row to display row-level revenue
                        const rowAllSows = [];
                        const seenSows = new Set();
                        const addSows = (entity) => {
                            if (!entity) return;
                            const entitySows = getEntitySows(entity, bc.account, bc.buyingCenterName, showActiveOnly, fyKey);
                            entitySows.forEach(sow => {
                                const key = sow.sowName || '';
                                if (key && !seenSows.has(key)) {
                                    seenSows.add(key);
                                    rowAllSows.push(sow);
                                }
                            });
                        };

                        if (sb) addSows(sb);
                        if (group) {
                            if (group.ks) addSows(group.ks);
                            group.stks.forEach(stk => addSows(stk));
                        }

                        let rowActProjSize = 0, rowPreQualSize = 0, rowLeadScoutSize = 0;
                        let rowSowsActProj = [], rowSowsPreQual = [], rowSowsLeadScout = [];
                        rowAllSows.forEach(sow => {
                            const status = (sow.sowStatus || '').toLowerCase();
                            const val = parseFloat(sow.totalRevenue || sow.revenue || sow[fyKey] || 0);
                            if (status.includes('pre-qual') || status.includes('pre qual')) {
                                rowPreQualSize += val;
                                rowSowsPreQual.push(sow);
                            } else if (status.includes('lead') || status.includes('scout')) {
                                rowLeadScoutSize += val;
                                rowSowsLeadScout.push(sow);
                            } else if (isActProjSow(sow)) {
                                rowActProjSize += val;
                                rowSowsActProj.push(sow);
                            }
                        });

                        let rowLabelParts = [];
                        if (sb && sb.name) rowLabelParts.push(sb.name);
                        if (group && group.ks && group.ks.name) rowLabelParts.push(group.ks.name);
                        const rowLabel = rowLabelParts.join(' & ') || 'Details';
                        const safeRowLabel = rowLabel.replace(/'/g, "\\'");

                        const rEscActProj = rowSowsActProj.length > 0 ? encodeURIComponent(JSON.stringify(rowSowsActProj)).replace(/'/g, "%27") : "";
                        const rOnClActProj = rowSowsActProj.length > 0 ? `onclick="showSowRevenueModal(event, '${safeRowLabel}', '${rEscActProj}', 'actProj')"` : "";
                        const rStyActProj = rowSowsActProj.length > 0 ? `color:#f7941d; font-weight:600; cursor:pointer;` : `color:#f7941d;`;

                        const rEscPreQual = rowSowsPreQual.length > 0 ? encodeURIComponent(JSON.stringify(rowSowsPreQual)).replace(/'/g, "%27") : "";
                        const rOnClPreQual = rowSowsPreQual.length > 0 ? `onclick="showSowRevenueModal(event, '${safeRowLabel}', '${rEscPreQual}', 'preQual')"` : "";
                        const rStyPreQual = rowSowsPreQual.length > 0 ? `color:#f7941d; font-weight:600; cursor:pointer;` : `color:#f7941d;`;

                        const rEscLeadScout = rowSowsLeadScout.length > 0 ? encodeURIComponent(JSON.stringify(rowSowsLeadScout)).replace(/'/g, "%27") : "";
                        const rOnClLeadScout = rowSowsLeadScout.length > 0 ? `onclick="showSowRevenueModal(event, '${safeRowLabel}', '${rEscLeadScout}', 'leadScout')"` : "";
                        const rStyLeadScout = rowSowsLeadScout.length > 0 ? `color:#f7941d; font-weight:600; cursor:pointer;` : `color:#f7941d;`;

                        // Calculate engagement counts for the row
                        const rowMembers = [];
                        if (sb) rowMembers.push(sb);
                        if (group) {
                            if (group.ks) rowMembers.push(group.ks);
                            rowMembers.push(...group.stks);
                        }
                        const rowSummary = calculateGroupSummary(rowMembers);
                        const rEng = rowSummary[engInteractionType] || {};

                        const subRow = `<tr class="child-of-${bcId} sub-row" style="${displayStyle}">
                            <td class="sticky-col bc-sticky-col-1" style="left:0; border-bottom: 1px solid #eee;"></td>
                            <td class="sticky-col bc-sticky-col-2" style="left:180px; border-bottom: 1px solid #eee;"></td>
                            <td class="${sbClass}" style="border-bottom: 1px solid #eee;">${sbDisplay}</td>
                            <td class="${subKsClass}" style="border-bottom: 1px solid #eee;">${subKsDisplay}</td>
                            <td class="${subStksClass}" style="border-bottom: 1px solid #eee;">${stksHtml}</td>
                            <td class="col-num" style="${rStyActProj} border-bottom: 1px solid #eee;" ${rOnClActProj}>${formatCurrency(rowActProjSize)}</td>
                            <td class="col-num" style="${rStyPreQual} border-bottom: 1px solid #eee;" ${rOnClPreQual}>${formatCurrency(rowPreQualSize)}</td>
                            <td class="col-num" style="${rStyLeadScout} border-bottom: 1px solid #eee;" ${rOnClLeadScout}>${formatCurrency(rowLeadScoutSize)}</td>
                            
                            <td class="col-num" style="border-bottom: 1px solid #eee;">${renderCount(rEng.past30, rowMembers, 30, 'past', bc.account, bc.buyingCenterName)}</td>
                            <td class="col-num" style="border-bottom: 1px solid #eee;">${renderCount(rEng.past60, rowMembers, 60, 'past', bc.account, bc.buyingCenterName)}</td>
                            <td class="col-num" style="border-bottom: 1px solid #eee;">${renderCount(rEng.past90, rowMembers, 90, 'past', bc.account, bc.buyingCenterName)}</td>
                            <td class="col-num" style="border-bottom: 1px solid #eee;">${renderCount(rEng.past180, rowMembers, 180, 'past', bc.account, bc.buyingCenterName)}</td>
                            
                            <td class="col-num" style="border-bottom: 1px solid #eee;">${renderCount(rEng.next30, rowMembers, 30, 'next', bc.account, bc.buyingCenterName)}</td>
                            <td class="col-num" style="border-bottom: 1px solid #eee;">${renderCount(rEng.next60, rowMembers, 60, 'next', bc.account, bc.buyingCenterName)}</td>
                            <td class="col-num" style="border-bottom: 1px solid #eee;">${renderCount(rEng.next90, rowMembers, 90, 'next', bc.account, bc.buyingCenterName)}</td>
                            <td class="col-num" style="border-bottom: 1px solid #eee;">${renderCount(rEng.next180, rowMembers, 180, 'next', bc.account, bc.buyingCenterName)}</td>
                        </tr>`;
                        body.append(subRow);
                    }
                }
            });
        }
    });
}

function updateEngHeaderIcons(totalAccounts) {
    if (totalAccounts === 0) return;
    
    const allExpanded = engExpandedAccounts.size === totalAccounts;
    if (allExpanded) {
        $("#btnExpandAllEng").hide();
        $("#btnCollapseAllEng").show();
    } else {
        $("#btnExpandAllEng").show();
        $("#btnCollapseAllEng").hide();
    }
}

function toggleAccountRow(accountId) {
    const isExpanding = !engExpandedAccounts.has(accountId);
    if (isExpanding) {
        engExpandedAccounts.add(accountId);
    } else {
        engExpandedAccounts.delete(accountId);
    }
    refreshEngagementView();
}

function toggleEntityNamesList(elem, expand) {
    const container = $(elem).closest('.entity-names-toggle-container');
    if (expand) {
        container.find('.entity-names-collapsed').hide();
        container.find('.entity-names-expanded').css('display', 'flex');
    } else {
        container.find('.entity-names-expanded').hide();
        container.find('.entity-names-collapsed').css('display', 'flex');
    }
}

function toggleEngRow(bcId) {
    const isExpanding = !engExpandedRows.has(bcId);
    if (isExpanding) {
        engExpandedRows.add(bcId);
    } else {
        engExpandedRows.delete(bcId);
    }
    refreshEngagementView();
}

function getUniqueMembers(members) {
    const seen = new Set();
    return (members || []).filter(m => {
        if (!m) return false;
        const key = m.id || m.name;
        if (!key || key === '-') return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function getActiveEngagementMembers(members, days, period) {
    const windowKey = period + days;
    const validMembers = (members || []).filter(member =>
        member && member.name && member.name !== '-'
    );
    const matchingMembers = validMembers.filter(member => {
        const engagement = member.engagement && member.engagement[engInteractionType];
        if (engagement && engagement[windowKey] > 0) return true;
        if (engInteractionType !== 'All' || !member.engagement) return false;

        // Role-level All counts can be derived from the interaction buckets
        // even when the API's globally deduplicated All bucket omits this role
        // occurrence. Include that member in the popup ID list as well.
        return Object.keys(member.engagement).some(itype =>
            itype !== 'All' && member.engagement[itype]?.[windowKey] > 0
        );
    });

    // Filter for the selected engagement window before deduplicating. An entity
    // can occur in several Buying Centers, and an earlier zero-count occurrence
    // must not hide the occurrence that owns the engagement being opened.
    return getUniqueMembers(matchingMembers.length > 0 ? matchingMembers : validMembers);
}

function calculateGroupSummary(members) {
    const summary = {};
    if (!members || members.length === 0) return summary;

    // A stakeholder can be returned more than once across Buying Centers,
    // lifecycle records, or roles. Do not keep only the first occurrence: that
    // occurrence may have an empty engagement object while a later occurrence
    // contains the stakeholder's counts. Merge duplicate occurrences by taking
    // the largest value for each interaction/window, then add the resulting
    // per-stakeholder summaries. Using the maximum also prevents the same note
    // from being counted twice when it is repeated for two roles.
    const engagementByMember = new Map();
    (members || []).forEach(m => {
        if (!m || !m.engagement) return;
        const memberKey = m.id || m.name;
        if (!memberKey || memberKey === '-') return;

        if (!engagementByMember.has(memberKey)) {
            engagementByMember.set(memberKey, {});
        }
        const memberSummary = engagementByMember.get(memberKey);

        Object.keys(m.engagement).forEach(itype => {
            if (!memberSummary[itype]) memberSummary[itype] = {};
            Object.keys(m.engagement[itype] || {}).forEach(wkey => {
                memberSummary[itype][wkey] = Math.max(
                    Number(memberSummary[itype][wkey]) || 0,
                    Number(m.engagement[itype][wkey]) || 0
                );
            });
        });
    });

    engagementByMember.forEach(memberSummary => {
        Object.keys(memberSummary).forEach(itype => {
            if (!summary[itype]) summary[itype] = {};
            Object.keys(memberSummary[itype]).forEach(wkey => {
                summary[itype][wkey] = (summary[itype][wkey] || 0) + memberSummary[itype][wkey];
            });
        });
    });

    return summary;
}

function calculateRoleSummary(members) {
    const summary = {};

    // Role columns count every role occurrence. The same entity can appear in
    // multiple Buying Centers or roles and must remain visible in each role's
    // badges. Overall Past/Planned totals continue to use
    // calculateGroupSummary(), which deduplicates entities.
    (members || []).forEach(member => {
        if (!member || !member.engagement) return;
        Object.keys(member.engagement).forEach(itype => {
            if (!summary[itype]) summary[itype] = {};
            Object.keys(member.engagement[itype] || {}).forEach(windowKey => {
                summary[itype][windowKey] = (summary[itype][windowKey] || 0) +
                    (Number(member.engagement[itype][windowKey]) || 0);
            });
        });
    });

    const interactionTypes = Object.keys(summary).filter(itype => itype !== 'All');
    if (interactionTypes.length === 0) return summary;

    // The API's All bucket is unique across stakeholder roles. That is correct
    // for the overall Past/Planned totals, but it can omit an engagement from a
    // role column when the same person is both a Superboss and Key Stakeholder.
    // Role columns therefore derive All from their mutually exclusive
    // interaction-type buckets. Retain a larger API value for legacy records
    // that have not been classified under a specific interaction type.
    const derivedAll = {};
    interactionTypes.forEach(itype => {
        Object.keys(summary[itype] || {}).forEach(windowKey => {
            derivedAll[windowKey] = (derivedAll[windowKey] || 0) + (Number(summary[itype][windowKey]) || 0);
        });
    });

    const apiAll = summary.All || {};
    const windowKeys = new Set([...Object.keys(apiAll), ...Object.keys(derivedAll)]);
    summary.All = {};
    windowKeys.forEach(windowKey => {
        summary.All[windowKey] = Math.max(Number(apiAll[windowKey]) || 0, derivedAll[windowKey] || 0);
    });

    return summary;
}

function calculateBcSummary(bc) {
    const showActiveOnly = $("#showActiveOnly").is(":checked");
    const sbs = getBcSuperbosses(bc, showActiveOnly);
    const ksActive = (bc.team?.key_stakeholders || []).filter(s => !showActiveOnly || s.status === "Active");
    const stkActive = (bc.team?.stakeholders || []).filter(s => !showActiveOnly || s.status === "Active");
    const allMembers = [...sbs].concat(ksActive, stkActive).filter(Boolean);
    return calculateGroupSummary(allMembers);
}

function renderGroupEntityInfo(members, groupSummary, hideNames = false, accName = '', bcName = '') {
    const filteredMembers = (members || []).filter(m => m && m.name && m.name !== '-');
    if (filteredMembers.length === 0) {
        return '-';
    }
    
    const eng = groupSummary[engInteractionType] || {};
    
    // Display 1 name, and "+X" for the rest
    let nameHtml = "";
    if (!hideNames) {
        const getFormattedSize = (m) => {
            const fyKey = 'fy' + engCurrentYear.toString().slice(-2);
            const showActiveOnly = $("#showActiveOnly").is(":checked");
            const entitySows = getEntitySows(m, accName, bcName, showActiveOnly, fyKey);
            
            let size = 0;
            entitySows.forEach(sow => {
                if (isActProjSow(sow)) {
                    size += parseFloat(sow.totalRevenue || sow.revenue || sow[fyKey] || 0);
                }
            });
            
            const filteredSows = entitySows.filter(isActProjSow);
            const escapedSows = filteredSows.length > 0 ? encodeURIComponent(JSON.stringify(filteredSows)).replace(/'/g, "%27") : "";
            const onClickHandler = filteredSows.length > 0 ? ` onclick="showSowRevenueModal(event, '${m.name.replace(/'/g, "\\'")}', '${escapedSows}', 'actProj')"` : "";
            
            return size > 0 ? `<span style="font-weight:normal; color:#1a73e8; font-size:10px; margin-left:4px; cursor:pointer;"${onClickHandler}>(${formatCurrency(size)})</span>` : '';
        };

        const safeAccName = (accName || '').replace(/'/g, "\\'");
        const safeBcName = (bcName || '').replace(/'/g, "\\'");

        const getMemberNameHtml = (m) => {
            const fyKey = 'fy' + engCurrentYear.toString().slice(-2);
            const showActiveOnly = $("#showActiveOnly").is(":checked");
            const entitySows = getEntitySows(m, accName, bcName, showActiveOnly, fyKey);
            const filteredSows = entitySows.filter(isActProjSow);
            const escapedSows = filteredSows.length > 0 ? encodeURIComponent(JSON.stringify(filteredSows)).replace(/'/g, "%27") : "";
            const onClickHandler = filteredSows.length > 0 ? ` onclick="showSowRevenueModal(event, '${m.name.replace(/'/g, "\\'")}', '${escapedSows}', 'actProj')"` : "";
            const isDeleted = m.status === "Deleted";
            const classes = isDeleted ? "entity-name deleted-member-chip" : (filteredSows.length > 0 ? "entity-name" : "entity-name-disabled");
            const cursorStyle = filteredSows.length > 0 ? 'cursor:pointer;' : '';
            return `<span class="${classes}" style="${cursorStyle}"${onClickHandler}>${m.name}${getFormattedSize(m)}</span>`;
        };

        if (filteredMembers.length <= 1) {
            nameHtml = `
                <div style="display:flex; flex-wrap:wrap; gap:8px;">
                    ${getMemberNameHtml(filteredMembers[0])}
                </div>
            `;
        } else {
            const firstMemberHtml = getMemberNameHtml(filteredMembers[0]);
            const allMembersHtml = filteredMembers.map(m => getMemberNameHtml(m)).join('');
            
            nameHtml = `
                <div class="entity-names-toggle-container">
                    <div class="entity-names-collapsed" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                        ${firstMemberHtml}
                        <a href="javascript:void(0)" class="entity-plus-link" onclick="toggleEntityNamesList(this, true)" style="color:#1155cc; font-size:8px; font-weight:600; text-decoration:none; margin-left:4px;"><i class="fa fa-user-friends" style="margin-right:3px;"></i>+${filteredMembers.length - 1}</a>
                    </div>
                    <div class="entity-names-expanded" style="display:none; flex-wrap:wrap; gap:8px; align-items:center;">
                        ${allMembersHtml}
                        <a href="javascript:void(0)" class="entity-minus-link" onclick="toggleEntityNamesList(this, false)" style="color:#666; font-size:8px; font-weight:600; text-decoration:none; margin-left:4px;">(Hide)</a>
                    </div>
                </div>
            `;
        }
    }
    
    return `
        ${nameHtml}
        <div class="entity-metrics">
            <div class="metric-row">
                <span class="metric-label">Past:</span>
                <div class="metric-badges">
                    ${renderMiniBadge(eng.past30, null, 30, 'past', members, accName, bcName)}
                    ${renderMiniBadge(eng.past60, null, 60, 'past', members, accName, bcName)}
                    ${renderMiniBadge(eng.past90, null, 90, 'past', members, accName, bcName)}
                    ${renderMiniBadge(eng.past180, null, 180, 'past', members, accName, bcName)}
                </div>
            </div>
            <div class="metric-row">
                <span class="metric-label">Planned:</span>
                <div class="metric-badges">
                    ${renderMiniBadge(eng.next30, null, 30, 'next', members, accName, bcName)}
                    ${renderMiniBadge(eng.next60, null, 60, 'next', members, accName, bcName)}
                    ${renderMiniBadge(eng.next90, null, 90, 'next', members, accName, bcName)}
                    ${renderMiniBadge(eng.next180, null, 180, 'next', members, accName, bcName)}
                </div>
            </div>
        </div>
    `;
}

function renderEntityInfo(entity, accName = '', bcName = '') {
    if (!entity || !entity.name || entity.name === '-') return '-';
    
    const eng = entity.engagement ? (entity.engagement[engInteractionType] || {}) : {};
    const fyKey = 'fy' + engCurrentYear.toString().slice(-2);
    const showActiveOnly = $("#showActiveOnly").is(":checked");
    const entitySows = getEntitySows(entity, accName, bcName, showActiveOnly, fyKey);
    
    let entitySize = 0;
    entitySows.forEach(sow => {
        if (isActProjSow(sow)) {
            entitySize += parseFloat(sow.totalRevenue || sow.revenue || sow[fyKey] || 0);
        }
    });
    
    const filteredSows = entitySows.filter(isActProjSow);
    const escapedSows = filteredSows.length > 0 ? encodeURIComponent(JSON.stringify(filteredSows)).replace(/'/g, "%27") : "";
    const onClickHandler = filteredSows.length > 0 ? ` onclick="showSowRevenueModal(event, '${entity.name.replace(/'/g, "\\'")}', '${escapedSows}', 'actProj')"` : "";
    
    const sizeDisplay = entitySize > 0 ? `<span style="font-weight:normal; color:#1a73e8; font-size:10px; margin-left:4px; cursor:pointer;"${onClickHandler}>(${formatCurrency(entitySize)})</span>` : '';
    
    const safeName = entity.name.replace(/'/g, "\\'");
    const safeAccName = (accName || '').replace(/'/g, "\\'");
    const safeBcName = (bcName || '').replace(/'/g, "\\'");
    
    const hasSows = filteredSows.length > 0;
    const isDeleted = entity.status === "Deleted";
    const classes = isDeleted ? "entity-name deleted-member-chip" : (hasSows ? "entity-name" : "entity-name-disabled");
    const cursorStyle = hasSows ? 'cursor:pointer;' : '';
    
    return `
        <div style="margin-bottom: 5px; min-width: 150px;">
            <div class="${classes}" style="margin-bottom:8px; ${cursorStyle}"${onClickHandler}>${entity.name}${sizeDisplay}</div>
            <div class="entity-metrics">
                <div class="metric-row">
                    <span class="metric-label">Past:</span>
                    <div class="metric-badges">
                        ${renderMiniBadge(eng.past30, entity, 30, 'past', null, accName, bcName)}
                        ${renderMiniBadge(eng.past60, entity, 60, 'past', null, accName, bcName)}
                        ${renderMiniBadge(eng.past90, entity, 90, 'past', null, accName, bcName)}
                        ${renderMiniBadge(eng.past180, entity, 180, 'past', null, accName, bcName)}
                    </div>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Planned:</span>
                    <div class="metric-badges">
                        ${renderMiniBadge(eng.next30, entity, 30, 'next', null, accName, bcName)}
                        ${renderMiniBadge(eng.next60, entity, 60, 'next', null, accName, bcName)}
                        ${renderMiniBadge(eng.next90, entity, 90, 'next', null, accName, bcName)}
                        ${renderMiniBadge(eng.next180, entity, 180, 'next', null, accName, bcName)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getEngagementMemberIds(member, accountName = '', bcName = '') {
    if (!member) return [];

    const memberName = (member.name || '').toString().trim();
    const normalizedName = memberName.toLowerCase();
    const ids = new Set();
    const addId = value => {
        if (value === undefined || value === null) return;
        const id = value.toString().trim();
        if (id && id !== '-' && id.toLowerCase() !== normalizedName) {
            ids.add(id);
        }
    };

    // Prefer IDs supplied directly by the engagement API. `id` is last because
    // older payloads populate it with the display name.
    const directId = [
        member.entity_id,
        member.entityId,
        member.stakeholder_id,
        member.stakeholderId,
        member.key_stakeholder_id,
        member.keyStakeholderId,
        member.superboss_id,
        member.superbossId,
        member.key_direct_id,
        member.keyDirectId,
        member.id
    ].map(value => value === undefined || value === null ? '' : value.toString().trim())
        .find(id => id && id !== '-' && id.toLowerCase() !== normalizedName);

    if (directId || !normalizedName) {
        return directId ? [directId] : [];
    }

    // The engagement response historically used names as `id`. Resolve the
    // actual database ID from the buying-center management response in that case.
    const managementData = window.allManagementData;
    const accounts = Array.isArray(managementData)
        ? managementData
        : (managementData?.stakeholder_details || []);
    const normalizeLookupScope = value => {
        const normalized = (value || '').toString().trim().toLowerCase();
        return normalized === '-' ? '' : normalized;
    };
    const normalizedAccount = normalizeLookupScope(accountName);
    const normalizedBc = normalizeLookupScope(bcName);
    const memberType = (member.type || '').toString().trim().toLowerCase();

    const matchesName = value => (value || '').toString().trim().toLowerCase() === normalizedName;
    const addMatchingEntityIds = detail => {
        const superbosses = Array.isArray(detail.SUPERBOSSES)
            ? detail.SUPERBOSSES
            : (detail.SUPERBOSS ? [{ SUPERBOSS: detail.SUPERBOSS, SUPERBOSS_ID: detail.SUPERBOSS_ID }] : []);
        const keyStakeholders = Array.isArray(detail.KEY_STAKEHOLDER)
            ? detail.KEY_STAKEHOLDER
            : (detail.KEY_STAKEHOLDER ? [detail.KEY_STAKEHOLDER] : []);
        const stakeholders = Array.isArray(detail.STAKEHOLDERS) ? detail.STAKEHOLDERS : [];

        if (!memberType || memberType === 'superboss') {
            superbosses.filter(sb => matchesName(sb.SUPERBOSS || sb.SUPERBOSS_NAME))
                .forEach(sb => addId(sb.SUPERBOSS_ID));
        }
        if (!memberType || memberType === 'key stakeholder') {
            keyStakeholders.filter(ks => matchesName(ks.KEY_STAKEHOLDER_NAME || ks.KEY_STAKEHOLDER))
                .forEach(ks => addId(ks.KEY_STAKEHOLDER_ID));
        }
        if (!memberType || memberType === 'stakeholder' || memberType === 'influencer') {
            stakeholders.filter(stk => matchesName(stk.STAKEHOLDER || stk.STAKEHOLDER_NAME))
                .forEach(stk => addId(stk.STAKEHOLDER_ID));
        }
        if (!memberType || memberType === 'key direct' || memberType === 'key directs') {
            stakeholders.forEach(stk => {
                const keyDirects = Array.isArray(stk.KEY_DIRECTS) ? stk.KEY_DIRECTS : [];
                keyDirects.filter(kd => matchesName(kd.KEY_DIRECT_NAME || kd.KEY_DIRECT))
                    .forEach(kd => addId(kd.KEY_DIRECT_ID));
            });
        }

        // Some older engagement records omit `type`; try every entity collection
        // if the type-specific lookup did not find an ID.
        if (ids.size === 0) {
            superbosses.filter(sb => matchesName(sb.SUPERBOSS || sb.SUPERBOSS_NAME))
                .forEach(sb => addId(sb.SUPERBOSS_ID));
            keyStakeholders.filter(ks => matchesName(ks.KEY_STAKEHOLDER_NAME || ks.KEY_STAKEHOLDER))
                .forEach(ks => addId(ks.KEY_STAKEHOLDER_ID));
            stakeholders.filter(stk => matchesName(stk.STAKEHOLDER || stk.STAKEHOLDER_NAME))
                .forEach(stk => addId(stk.STAKEHOLDER_ID));
        }
    };

    accounts.forEach(account => {
        const details = Array.isArray(account.DETAILS) ? account.DETAILS : [];
        details.forEach(detail => {
            const detailAccount = (detail.ACCOUNT_NAME || account.ACCOUNT_NAME || account.account || '')
                .toString().trim().toLowerCase();
            const detailBc = (detail.BUYING_CENTRE || detail.buyingCenterName || '')
                .toString().trim().toLowerCase();
            if (normalizedAccount && detailAccount && detailAccount !== normalizedAccount) return;
            if (normalizedBc && detailBc !== normalizedBc) return;
            addMatchingEntityIds(detail);
        });
    });

    // Deleted lifecycle records are intentionally absent from the current
    // management hierarchy. Their engagement history still uses the legacy
    // name-based `id`, which the notes endpoint supports for historical data.
    // Keep that fallback limited to deleted records so unresolved active
    // stakeholders are not queried with a display name by mistake.
    const isDeleted = (member.status || '').toString().trim().toLowerCase() === 'deleted';
    if (ids.size === 0 && isDeleted) {
        const legacyId = (member.id || memberName).toString().trim();
        if (legacyId && legacyId !== '-') {
            ids.add(legacyId);
        }
    }

    return Array.from(ids);
}

function getEngagementEntityIdList(members, accountName = '', bcName = '') {
    return Array.from(new Set(
        (members || []).flatMap(member => getEngagementMemberIds(member, accountName, bcName))
    )).join(',');
}

function renderMiniBadge(val, entity, days, period, membersArray = null, accName = '', bcName = '') {
    const displayVal = val || 0;
    const safeAccName = (accName || '').replace(/'/g, "\\'");
    const safeBcName = (bcName || '').replace(/'/g, "\\'");
    
    // If value is zero, render a disabled non-clickable badge
    if (!displayVal || displayVal === 0) {
        return `<span class="mini-badge mini-badge-disabled">${days}d:<span class="badge-val">0</span></span>`;
    }
    
    if (period === 'next') {
        return `<span class="mini-badge" style="cursor: default;">${days}d:<span class="badge-val">${displayVal}</span></span>`;
    }
    
    if (entity) {
        const safeName = entity.name.replace(/'/g, "\\'");
        const ids = getEngagementEntityIdList([entity], accName, bcName).replace(/'/g, "\\'");
        if (!ids) {
            return `<span class="mini-badge mini-badge-disabled">${days}d:<span class="badge-val">${displayVal}</span></span>`;
        }
        return `
            <a href="javascript:void(0)" class="mini-badge" 
               onclick="openStakeholderProfile('${ids}', '${safeName}', '${safeAccName}', '${safeBcName}', ${days}, '${period}')">
                ${days}d:<span class="badge-val">${displayVal}</span>
            </a>
        `;
    } else if (membersArray && membersArray.length > 0) {
        const activeMembers = getActiveEngagementMembers(membersArray, days, period);

        let groupName = "Multiple Stakeholders";
        if (activeMembers.length === 1) {
            groupName = activeMembers[0].name;
        } else if (activeMembers.length > 1 && activeMembers.length <= 3) {
            groupName = activeMembers.map(m => m.name).join(', ');
        } else if (activeMembers.length > 3) {
            groupName = activeMembers.slice(0, 3).map(m => m.name).join(', ') + ` + ${activeMembers.length - 3} others`;
        }
        
        const ids = getEngagementEntityIdList(activeMembers, accName, bcName).replace(/'/g, "\\'");
        const safeGroupName = groupName.replace(/'/g, "\\'");
        if (!ids) {
            return `<span class="mini-badge mini-badge-disabled">${days}d:<span class="badge-val">${displayVal}</span></span>`;
        }
        return `
            <a href="javascript:void(0)" class="mini-badge" 
               onclick="openStakeholderProfile('${ids}', '${safeGroupName}', '${safeAccName}', '${safeBcName}', ${days}, '${period}')">
                ${days}d:<span class="badge-val">${displayVal}</span>
            </a>
        `;
    }
    
    return `<span class="mini-badge">${days}d:<span class="badge-val">${displayVal}</span></span>`;
}

function renderCount(val, membersArray, days, period, accName = '', bcName = '') {
    if (!val || val === 0) return "-";
    
    if (period === 'next') {
        return `<span class="eng-count-link" style="text-decoration: none; cursor: default;">${val}</span>`;
    }

    const safeAccName = (accName || '').replace(/'/g, "\\'");
    const safeBcName = (bcName || '').replace(/'/g, "\\'");
    if (membersArray && membersArray.length > 0) {
        const activeMembers = getActiveEngagementMembers(membersArray, days, period);

        const ids = getEngagementEntityIdList(activeMembers, accName, bcName).replace(/'/g, "\\'");
        let groupName = "All Stakeholders";
        if (activeMembers.length === 1) {
            groupName = activeMembers[0].name;
        } else if (activeMembers.length > 1 && activeMembers.length <= 3) {
            groupName = activeMembers.map(m => m.name).join(', ');
        } else if (activeMembers.length > 3) {
            groupName = activeMembers.slice(0, 3).map(m => m.name).join(', ') + ` + ${activeMembers.length - 3} others`;
        }
        const safeGroupName = groupName.replace(/'/g, "\\'");

        if (!ids) {
            return `<span class="eng-count-link">${val}</span>`;
        }
        
        return `<a href="javascript:void(0)" class="eng-count-link" onclick="openStakeholderProfile('${ids}', '${safeGroupName}', '${safeAccName}', '${safeBcName}', ${days}, '${period}')">${val}</a>`;
    }
    return `<span class="eng-count-link">${val}</span>`;
}

function openStakeholderProfile(id, name, accountName, bcName, days = null, period = null) {
    if (!id || id === 'undefined') return;

    noteLogModalState = {
        rawNotes: [],
        reqDays: days,
        reqPeriod: period,
        searchTerm: '',
        sortColumn: 'date',
        sortDirection: 'desc'
    };
    $('#noteLogSearch').val('');
    updateNoteLogSortHeader();
    
    // Set title: "Engagement Activity - Name" (matching Figma design)
    let titleText = "Engagement Activity";
    if (name && !name.startsWith("Group") && name !== accountName && name !== bcName) {
        titleText += " - " + name;
    }
    $("#noteLogTitle").text(titleText);
    
    // Subtitle: "Account / Buying Center" format
    let subtitleText = "";
    if (accountName && bcName && accountName !== '-' && bcName !== '-') {
        subtitleText = `${accountName} / ${bcName}`;
    } else if (accountName && accountName !== '-') {
        subtitleText = accountName;
    } else if (bcName && bcName !== '-') {
        subtitleText = bcName;
    }
    $("#noteLogSubtitle").text(subtitleText);
    
    // Clear previous note log container and show loading
    const container = $("#noteLogContainer");
    container.html('<div style="text-align:center; padding: 20px; font-size:12px; color:#666;">Loading notes...</div>');
    $("#noteLogModal").show();
    setTimeout(() => {
        $("#noteLogModal").find(".nps-modal-body").scrollTop(0);
    }, 10);
    
    // Fetch notes dynamically
    let apiURL = apiValue.url.replace("/app", "/cnps/engagement-notes-details-v2");
    let reqData = {
        entity_id: id,
        entity_type: 'STAKEHOLDER',
        interaction_type: engInteractionType
    };
    if (bcName) {
        reqData.bc_name = bcName;
    }
    if (days && period) {
        reqData.window_days = days;
        reqData.period = period;
    }
    
    $.ajax({
        url: apiURL,
        type: "GET",
        data: reqData,
        success: function(notes) {
            renderNoteLog(notes, days, period);
        },
        error: function(err) {
            console.error("Error loading notes", err);
            container.html('<div style="text-align:center; padding: 20px; font-size:12px; color:red;">Failed to load notes.</div>');
        }
    });
}

function openActivityDetails(escapedNote) {
    try {
        const note = JSON.parse(decodeURIComponent(escapedNote));
        
        const stkName = note.entity_name || note.entity_id || '';
        if (stkName) {
            $("#activityDetailsTitle").text("Notes Details - " + stkName);
        } else {
            $("#activityDetailsTitle").text("Notes Details");
        }
        
        $("#activityTypeVal").text(note.interaction_type || '-');
        $("#activityPartnerVal").text(note.author_name || note.created_by || '-');
        
        const dateStr = note.meeting_date ? new Date(note.meeting_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : '-';
        $("#activityDateVal").text(dateStr);
        
        
        // Render detailed notes checking for HTML vs plain text
        const detailText = note.detail_text || '';
        if (detailText.trim()) {
            const hasHtml = /<\/?[a-z][\s\S]*>/i.test(detailText);
            if (hasHtml) {
                $("#activityDetailedNotes").html(detailText);
            } else {
                $("#activityDetailedNotes").html(`<div style="white-space: pre-wrap;">${detailText}</div>`);
            }
        } else {
            $("#activityDetailedNotes").html('-');
        }
        
        // Render next steps checking for HTML vs plain text
        const list = $("#activityNextStepsList");
        list.empty();
        
        const nextStepsText = note.next_steps_text || '';
        if (nextStepsText.trim()) {
            const hasHtml = /<\/?[a-z][\s\S]*>/i.test(nextStepsText);
            if (hasHtml) {
                list.html(nextStepsText);
            } else {
                list.html(`<div style="white-space: pre-wrap;">${nextStepsText}</div>`);
            }
            
            if (note.next_steps_estimated_date) {
                const nsDate = new Date(note.next_steps_estimated_date);
                if (!isNaN(nsDate.getTime())) {
                    const formattedDate = nsDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    $("#activityNextStepDateVal").text(formattedDate).show();
                } else {
                    $("#activityNextStepDateVal").hide();
                }
            } else {
                $("#activityNextStepDateVal").hide();
            }
            
            $("#activityNextStepsSection").show();
        } else {
            $("#activityNextStepsSection").hide();
        }
        
        // Handle Next Interaction
        const hasNextInteraction = note.next_interaction_type || note.next_interaction_estimated_date;
        if (hasNextInteraction) {
            $("#activityNextInteractionTypeVal").text(note.next_interaction_type || '-');
            if (note.next_interaction_estimated_date) {
                const interactionDateStr = new Date(note.next_interaction_estimated_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                $("#activityNextInteractionDateVal").text(interactionDateStr);
            } else {
                $("#activityNextInteractionDateVal").text('-');
            }
            $("#activityNextInteractionSection").show();
        } else {
            $("#activityNextInteractionSection").hide();
        }
        
        if (note.created_at || note.CREATED_DATE || note.createdAt) {
            $("#activityCreatedAt").text(convertStringToLocalTimeAndAgo(note.created_at || note.CREATED_DATE || note.createdAt));
            $("#activityCreatedAt").show();
        } else {
            $("#activityCreatedAt").hide();
        }

        $("#activityDetailsModal").show();
        setTimeout(() => {
            $("#activityDetailsModal").find(".nps-modal-body").scrollTop(0);
        }, 10);
    } catch (e) {
        console.error("Error parsing note details", e);
    }
}

function isStakeholderDeletedInRawData(name) {
    if (!engRawData || !name) return false;
    const lowerName = name.trim().toLowerCase();
    for (const d of engRawData) {
        const sbs = getBcSuperbosses(d, false);
        for (const sb of sbs) {
            if (sb.name && sb.name.trim().toLowerCase() === lowerName) {
                return sb.status === "Deleted";
            }
        }
        const ksList = d.team?.key_stakeholders || [];
        for (const ks of ksList) {
            if (ks.name && ks.name.trim().toLowerCase() === lowerName) {
                return ks.status === "Deleted";
            }
        }
        const stks = d.team?.stakeholders || [];
        for (const stk of stks) {
            if (stk.name && stk.name.trim().toLowerCase() === lowerName) {
                return stk.status === "Deleted";
            }
        }
        const kdList = d.team?.key_directs || [];
        for (const kd of kdList) {
            if (kd.name && kd.name.trim().toLowerCase() === lowerName) {
                return kd.status === "Deleted";
            }
        }
        const infList = d.team?.influencers || [];
        for (const inf of infList) {
            if (inf.name && inf.name.trim().toLowerCase() === lowerName) {
                return inf.status === "Deleted";
            }
        }
    }
    return false;
}

function openNoteLog(entityId, entityType, days, period, name) {
    openStakeholderProfile(entityId, name, '', '', days, period);
}

function getNoteLogCardDateRaw(note, reqPeriod) {
    if (reqPeriod === 'next' && note.next_interaction_estimated_date) {
        return note.next_interaction_estimated_date;
    }
    return note.meeting_date || note.created_at || note.CREATED_DATE || note.createdAt || '';
}

function getNoteLogTimestamp(note, reqPeriod) {
    const rawDate = getNoteLogCardDateRaw(note, reqPeriod);
    if (!rawDate) return 0;
    const isCustomFormat = typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(rawDate);
    const parsedDate = isCustomFormat ? new Date(rawDate.replace(' ', 'T') + 'Z') : new Date(rawDate);
    return isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}

function updateNoteLogSortHeader() {
    $('.notelog-sort-button').each(function() {
        const button = $(this);
        const isActive = button.data('note-sort') === noteLogModalState.sortColumn;
        button.toggleClass('active', isActive);
        button.attr('aria-sort', isActive ? (noteLogModalState.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none');
        button.find('i').attr('class', isActive
            ? `fa fa-arrow-${noteLogModalState.sortDirection === 'asc' ? 'up' : 'down'}`
            : 'fa fa-sort');
    });
}

function refreshNoteLogModal() {
    renderNoteLog(noteLogModalState.rawNotes, noteLogModalState.reqDays, noteLogModalState.reqPeriod);
}

function renderNoteLog(notes, reqDays = null, reqPeriod = null) {
    const container = $("#noteLogContainer");
    container.empty();

    noteLogModalState.rawNotes = Array.isArray(notes) ? notes.slice() : [];
    noteLogModalState.reqDays = reqDays;
    noteLogModalState.reqPeriod = reqPeriod;

    // Notes without account context should not appear in this popup.
    if (Array.isArray(notes)) {
        notes = notes.filter(note => {
            const accountName = (note?.account_name || '').toString().trim();
            return Boolean(accountName);
        });
    }

    // Deduplicate by note_id — same note can come back via multiple entity_id links
    if (notes && notes.length > 0) {
        const seenNoteIds = new Set();
        notes = notes.filter(n => {
            const nid = n.note_id;
            if (nid != null) {
                if (seenNoteIds.has(nid)) return false;
                seenNoteIds.add(nid);
            }
            return true;
        });
    }

    if (notes && notes.length > 0) {
        notes = notes.filter(n => {
            if (reqDays && reqPeriod) {
                if (reqPeriod === 'past') {
                    // Past: filter by meeting_date strictly before today
                    const rawDate = n.meeting_date;
                    if (!rawDate) return false;
                    const isCustomFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(rawDate);
                    const utcDate = isCustomFormat
                        ? new Date(rawDate.replace(" ", "T") + "Z")
                        : new Date(rawDate);
                    if (isNaN(utcDate.getTime())) return false;
                    const diffInDays = (new Date() - utcDate) / (1000 * 60 * 60 * 24);
                    return diffInDays > 0 && diffInDays <= reqDays;
                } else if (reqPeriod === 'next') {
                    // Planned: filter by next_interaction_estimated_date >= today
                    const rawDate = n.next_interaction_estimated_date;
                    if (!rawDate) return false;
                    const isCustomFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(rawDate);
                    const utcDate = isCustomFormat
                        ? new Date(rawDate.replace(" ", "T") + "Z")
                        : new Date(rawDate);
                    if (isNaN(utcDate.getTime())) return false;
                    const diffInDays = (utcDate - new Date()) / (1000 * 60 * 60 * 24);
                    return diffInDays >= -1 && diffInDays <= reqDays; // >= -1 to include today
                }
            }
            // No period filter: show all within 180 days using meeting_date or created_at
            const rawDate = n.meeting_date || n.created_at || n.CREATED_DATE || n.createdAt;
            if (!rawDate) return false;
            const isCustomFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(rawDate);
            const utcDate = isCustomFormat
                ? new Date(rawDate.replace(" ", "T") + "Z")
                : new Date(rawDate);
            if (isNaN(utcDate.getTime())) return false;
            return Math.abs((new Date() - utcDate) / (1000 * 60 * 60 * 24)) <= 180;
        });
    }

    const normalizedSearch = noteLogModalState.searchTerm.toLowerCase();
    if (normalizedSearch && notes && notes.length > 0) {
        notes = notes.filter(note => {
            const rawDate = getNoteLogCardDateRaw(note, reqPeriod);
            const searchableValues = [
                note.entity_name || note.entity_id || '',
                note.interaction_type || '',
                rawDate ? formatDateOnly(rawDate) : '',
                note.author_name || note.created_by || ''
            ];
            return searchableValues.some(value => String(value).toLowerCase().includes(normalizedSearch));
        });
    }

    if (notes && notes.length > 0) {
        const sortMultiplier = noteLogModalState.sortDirection === 'desc' ? -1 : 1;
        notes = notes.map((note, originalIndex) => ({ note, originalIndex })).sort((a, b) => {
            let comparison = 0;
            if (noteLogModalState.sortColumn === 'date') {
                comparison = getNoteLogTimestamp(a.note, reqPeriod) - getNoteLogTimestamp(b.note, reqPeriod);
            } else {
                const valueByColumn = {
                    stakeholder: note => note.entity_name || note.entity_id || '',
                    type: note => note.interaction_type || '',
                    author: note => note.author_name || note.created_by || ''
                };
                const getValue = valueByColumn[noteLogModalState.sortColumn] || valueByColumn.stakeholder;
                comparison = String(getValue(a.note)).localeCompare(String(getValue(b.note)), undefined, { sensitivity: 'base' });
            }
            return comparison === 0 ? a.originalIndex - b.originalIndex : comparison * sortMultiplier;
        }).map(item => item.note);
    }

    updateNoteLogSortHeader();

    if (!notes || notes.length === 0) {
        const emptyMessage = normalizedSearch ? 'No matching activity found.' : 'No notes found for this period.';
        container.html(`<div style="text-align:center; padding:20px; font-size:12px; color:#666;">${emptyMessage}</div>`);
        return;
    }

    notes.forEach(n => {
        // For planned (next) cards, show next_interaction_estimated_date as the primary date;
        // for past cards, show meeting_date
        const cardDateRaw = getNoteLogCardDateRaw(n, reqPeriod);
        const date = cardDateRaw ? formatDateOnly(cardDateRaw) : '-';
        
        let detailHtml = n.detail_text || '-';
        if (n.detail_text && n.detail_text.trim()) {
            const hasHtml = /<\/?[a-z][\s\S]*>/i.test(n.detail_text);
            if (!hasHtml) {
                detailHtml = `<div style="white-space: pre-wrap;">${n.detail_text}</div>`;
            }
        }

        let nextStepsHtml = n.next_steps_text || '';
        if (n.next_steps_text && n.next_steps_text.trim()) {
            const hasHtml = /<\/?[a-z][\s\S]*>/i.test(n.next_steps_text);
            if (!hasHtml) {
                nextStepsHtml = `<div style="white-space: pre-wrap;">${n.next_steps_text}</div>`;
            }
        }

        const displayStkName = n.entity_name || n.entity_id || '';
        const authorName = n.author_name || n.created_by || '';

        const isStkDeleted = isStakeholderDeletedInRawData(displayStkName);
        const nameClass = isStkDeleted ? "deleted-member-chip" : "";
        const nameStyle = isStkDeleted
            ? "font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
            : "font-size:12px; font-weight:600; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;";

        // Growth person name pill (grey, right side)
        const authorBadge = authorName ? `
            <span class="notelog-name-pill notelog-name-pill--grey">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                ${authorName}
            </span>
        ` : '';

        // Interaction type pill — grey as per Figma
        const itypePill = `<span class="notelog-itype-pill">${n.interaction_type || 'Interaction'}</span>`;

        // Escape note for click handler
        const escapedNote = encodeURIComponent(JSON.stringify(n)).replace(/'/g, "%27");

        container.append(`
            <div class="notelog-card" onclick="openActivityDetails('${escapedNote}')">
                <!-- Left: avatar + stakeholder name -->
                <div style="display:flex; align-items:center; gap:8px; width:35%;">
                    <div class="notelog-avatar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f7941d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    </div>
                    <span class="${nameClass}" style="${nameStyle}" title="${displayStkName}">${displayStkName}</span>
                </div>
                <!-- Content row (Right side: inperson, date, growth person) -->
                <div class="notelog-card-content" style="width:65%; display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1; display:flex; justify-content:center;">
                        ${itypePill}
                    </div>
                    <div style="flex:1; display:flex; justify-content:center;">
                        <span class="notelog-date">${date}</span>
                    </div>
                    <div style="flex:1; display:flex; justify-content:flex-end;">
                        ${authorBadge}
                    </div>
                </div>
            </div>
        `);
    });
}

function populateEngFilters() {
    syncEngagementFilters();
}

function syncEngagementFilters(changedId = null) {
    if (!engRawData) return;

    const selAcc = $("#engAccount").val() || [];
    const selBC = $("#engBuyingCenter").val() || [];
    const selSB = $("#engSuperboss").val() || [];
    const selKS = $("#engKeyStakeholder").val() || [];
    const selSTK = $("#engStakeholder").val() || [];
    const search = ($("#npsSearch").val() || "").toLowerCase();
    const showActiveOnly = $("#showActiveOnly").is(":checked");

    const getMatches = (skipField) => {
        return engRawData.filter(d => {
            const sbs = getBcSuperbosses(d, showActiveOnly);
            const ksActive = (d.team?.key_stakeholders || []).filter(s => !showActiveOnly || s.status === "Active");
            const stkActive = (d.team?.stakeholders || []).filter(s => !showActiveOnly || s.status === "Active");
            const kdActive = (d.team?.key_directs || []).filter(s => !showActiveOnly || s.status === "Active");
            const infActive = (d.team?.influencers || []).filter(s => !showActiveOnly || s.status === "Active");

            const teamNames = [
                ...ksActive,
                ...stkActive,
                ...kdActive,
                ...infActive
            ].map(s => (s.name || "").toLowerCase());

            const matchesSearch = !search || 
                (d.account || "").toLowerCase().includes(search) ||
                (d.buyingCenterName || "").toLowerCase().includes(search) ||
                sbs.some(sb => (sb.name || "").toLowerCase().includes(search)) ||
                teamNames.some(tn => tn.includes(search));
                
            const matchesAcc = skipField === 'account' || selAcc.length === 0 || selAcc.includes(d.account);
            const matchesBC = skipField === 'buyingCenter' || selBC.length === 0 || selBC.includes(d.buyingCenterName);
            const matchesSB = skipField === 'superboss' || selSB.length === 0 || sbs.some(sb => selSB.includes(sb.name || "-"));
            const matchesKS = skipField === 'keyStakeholder' || selKS.length === 0 || ksActive.some(s => selKS.includes(s.name));
            const matchesSTK = skipField === 'stakeholder' || selSTK.length === 0 || stkActive.some(s => selSTK.includes(s.name));

            let matchesInteraction = true;
            if (engInteractionType && engInteractionType !== 'All') {
                const allMembers = [
                    ...sbs,
                    ...ksActive,
                    ...stkActive
                ].filter(Boolean);
                matchesInteraction = allMembers.some(m => {
                    const typeEng = m.engagement?.[engInteractionType] || {};
                    return Object.values(typeEng).some(v => v > 0);
                });
            }

            return matchesSearch && matchesAcc && matchesBC && matchesSB && matchesKS && matchesSTK && matchesInteraction;
        });
    };

    // 1. Account Filter
    const availAccounts = new Set(getMatches('account').map(d => d.account));
    updateEngSelectSync($("#engAccount"), availAccounts, "Account", selAcc, changedId);

    // 2. Buying Center Filter
    const availBCs = new Set(getMatches('buyingCenter').map(d => d.buyingCenterName));
    updateEngSelectSync($("#engBuyingCenter"), availBCs, "Buying Center", selBC, changedId);

    // 3. Superboss Filter
    const availSBs = new Set(getMatches('superboss').flatMap(d => {
        const sbs = getBcSuperbosses(d, showActiveOnly);
        return sbs.map(sb => sb.name);
    }).filter(Boolean));
    updateEngSelectSync($("#engSuperboss"), availSBs, "Superboss", selSB, changedId);

    // 4. Key Stakeholder Filter
    const availKSs = new Set(getMatches('keyStakeholder').flatMap(d => {
        const ksActive = (d.team?.key_stakeholders || []).filter(s => !showActiveOnly || s.status === "Active");
        return ksActive.map(s => s.name);
    }).filter(Boolean));
    updateEngSelectSync($("#engKeyStakeholder"), availKSs, "Key Stakeholder", selKS, changedId);

    // 5. Stakeholder Filter
    const availSTKs = new Set(getMatches('stakeholder').flatMap(d => {
        const stkActive = (d.team?.stakeholders || []).filter(s => !showActiveOnly || s.status === "Active");
        return stkActive.map(s => s.name);
    }).filter(Boolean));
    updateEngSelectSync($("#engStakeholder"), availSTKs, "Stakeholder", selSTK, changedId);
}

function updateEngSelectSync(select, set, label, currentSelection, changedId) {
    if (changedId && select.attr('id') === changedId) return;

    const prevVal = currentSelection || [];
    select.empty();
    
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
                    refreshEngagementView(id); 
                }, 100);
            },
            onSelectAll: function() { 
                const id = select.attr('id');
                setTimeout(() => {
                    refreshEngagementView(id); 
                }, 100);
            }
        });
    }
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

function getNormalizedStatus(sowStatus) {
    if (!sowStatus) return '-';
    const status = sowStatus.toLowerCase();
    if (status.includes('pre-qual') || status.includes('pre qual')) return 'Pre-Qualified';
    if (status.includes('signed')) return 'Signed';
    if (status.includes('proposal')) return 'Proposal';
    if (status.includes('qualified') || status.includes('quailified')) return 'Qualified';
    if (status.includes('renewal')) return 'Renewal';
    if (status.includes('lead')) return 'Lead';
    if (status.includes('scout')) return 'Scout';
    return sowStatus;
}

function getSowRevenueNumber(sow) {
    const value = parseFloat(sow.totalRevenue || sow.revenue || 0);
    return Number.isFinite(value) ? value : 0;
}

function updateSowRevenueSortHeader() {
    $('.sow-revenue-sort-button').each(function() {
        const button = $(this);
        const isActive = button.data('sort-column') === sowRevenueModalState.sortColumn;
        const icon = button.find('i');
        button.toggleClass('active', isActive);
        button.attr('aria-sort', isActive ? (sowRevenueModalState.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none');
        icon.attr('class', isActive
            ? `fa fa-arrow-${sowRevenueModalState.sortDirection === 'asc' ? 'up' : 'down'}`
            : 'fa fa-sort');
    });
}

function refreshSowRevenueModal() {
    const allStatusesSelected = sowRevenueModalState.availableStatuses.length === sowRevenueModalState.selectedStatuses.length;
    const totalOverride = allStatusesSelected && !sowRevenueModalState.searchTerm
        ? sowRevenueModalState.authoritativeTotal
        : undefined;

    renderFilteredSows(
        sowRevenueModalState.sows,
        sowRevenueModalState.selectedStatuses,
        sowRevenueModalState.entityName,
        totalOverride,
        sowRevenueModalState.searchTerm,
        sowRevenueModalState.searchColumn,
        sowRevenueModalState.sortColumn,
        sowRevenueModalState.sortDirection
    );
    updateSowRevenueSortHeader();
}

function renderFilteredSows(sows, selectedStatuses, entityName, authoritativeTotal, searchTerm, searchColumn, sortColumn, sortDirection) {
    const container = $("#sowRevenueContainer");
    container.empty();
    
    let filteredSows = sows;
    if (selectedStatuses && selectedStatuses.length > 0) {
        filteredSows = sows.filter(s => selectedStatuses.includes(getNormalizedStatus(s.sowStatus)));
    } else if (selectedStatuses) {
        filteredSows = [];
    }

    const normalizedSearch = (searchTerm || '').toLowerCase();
    if (normalizedSearch) {
        filteredSows = filteredSows.filter(sow => {
            const searchableValues = {
                name: String(sow.sowName || '').toLowerCase(),
                status: String(getNormalizedStatus(sow.sowStatus)).toLowerCase(),
                revenue: `${getSowRevenueNumber(sow)} ${formatCurrency(getSowRevenueNumber(sow))}`.toLowerCase()
            };
            if (searchColumn && searchColumn !== 'all') {
                return searchableValues[searchColumn].includes(normalizedSearch);
            }
            return Object.values(searchableValues).some(value => value.includes(normalizedSearch));
        });
    }

    const activeSortColumn = sortColumn || 'name';
    const sortMultiplier = sortDirection === 'desc' ? -1 : 1;
    filteredSows = filteredSows.map((sow, originalIndex) => ({ sow, originalIndex })).sort((a, b) => {
        let comparison = 0;
        if (activeSortColumn === 'revenue') {
            comparison = getSowRevenueNumber(a.sow) - getSowRevenueNumber(b.sow);
        } else if (activeSortColumn === 'status') {
            comparison = String(getNormalizedStatus(a.sow.sowStatus)).localeCompare(String(getNormalizedStatus(b.sow.sowStatus)), undefined, { sensitivity: 'base' });
        } else {
            comparison = String(a.sow.sowName || '').localeCompare(String(b.sow.sowName || ''), undefined, { sensitivity: 'base' });
        }
        return comparison === 0 ? a.originalIndex - b.originalIndex : comparison * sortMultiplier;
    }).map(item => item.sow);
    
    let totalVal = 0;
    filteredSows.forEach(sow => {
        const name = sow.sowName || '-';
        const stage = sow.sowStatus || '-';
        const revenueVal = getSowRevenueNumber(sow);
        totalVal += revenueVal;
        
        let badgeStyle = "background-color: #6c757d; color: white;";
        const lowerStage = stage.toLowerCase();
        if (lowerStage.includes("signed") || lowerStage.includes("won") || lowerStage.includes("active")) {
            badgeStyle = "background-color: #e2f0d9; color: #385723; border: 1px solid #c5e0b4;";
        } else if (lowerStage.includes("proposal") || lowerStage.includes("pipeline") || lowerStage.includes("lead")) {
            badgeStyle = "background-color: #fff2cc; color: #7f6000; border: 1px solid #ffe599;";
        } else if (lowerStage.includes("lost") || lowerStage.includes("closed") || lowerStage.includes("inactive")) {
            badgeStyle = "background-color: #fce4d6; color: #c65911; border: 1px solid #f8cbad;";
        } else {
            badgeStyle = "background-color: #e2e3e5; color: #383d41; border: 1px solid #d6d8db;";
        }
        
        const sowId = sow.sowId || sow.SOW_ID || "";
        const uniqueId = sow.uniqueId || sow.UNIQUE_ID || "";
        
        container.append(`
            <div class="sow-revenue-card sow-revenue-card-single-row">
                <div class="sow-revenue-row">
                    <div class="sow-revenue-name" onclick="openSowPage('${sowId}', '${uniqueId}')" style="cursor: pointer; color: #1155cc; text-decoration: underline;">${name}</div>
                    <div class="sow-revenue-stage-badge" style="${badgeStyle}; flex-shrink:0;">${stage}</div>
                    <div class="sow-revenue-value" style="flex-shrink:0;">${formatCurrency(revenueVal)}</div>
                </div>
            </div>
        `);
    });
    
    if (filteredSows.length === 0) {
        container.html('<div style="text-align:center; padding:20px; font-size:12px; color:#666;">No matching SOW details found.</div>');
    }
    
    const displayedTotal = Number.isFinite(Number(authoritativeTotal)) ? Number(authoritativeTotal) : totalVal;
    const titleSpan = $("#sowRevenueModalTitle");
    titleSpan.html(`SOW Revenue Details - ${entityName} - Total revenue <span style="color: #f7941d;">${formatCurrency(displayedTotal)} </span>(${filteredSows.length} SoWs)`);
}

function showSowRevenueModal(event, entityName, escapedSows, filterType, authoritativeTotal) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    if (!escapedSows) {
        return;
    }
    
    try {
        const sows = JSON.parse(decodeURIComponent(escapedSows));
        
        sowRevenueModalState = {
            sows: sows,
            selectedStatuses: [],
            availableStatuses: [],
            entityName: entityName,
            authoritativeTotal: authoritativeTotal,
            searchTerm: '',
            searchColumn: 'all',
            sortColumn: 'revenue',
            sortDirection: 'desc'
        };
        $('#sowRevenueSearch').val('');
        updateSowRevenueSortHeader();
        
        const container = $("#sowRevenueContainer");
        container.empty();
        
        const totalBar = $("#sowRevenueTotalBar");
        totalBar.hide().empty();
        
        if (!sows || sows.length === 0) {
            container.html('<div style="text-align:center; padding:20px; font-size:12px; color:#666;">No SOW details found.</div>');
            $("#sowRevenueModalTitle").text(`SOW Revenue Details - ${entityName}`);
            $("#sowRevenueModal").show();
            setTimeout(() => {
                $("#sowRevenueModal").find(".nps-modal-body").scrollTop(0);
            }, 10);
            return;
        }
        
        // Setup SOW Status filter
        const filterContainer = $("#sowStatusFilterContainer");
        
        let dropdownOptions = [];
        if (filterType === 'actProj') {
            dropdownOptions = ['Signed', 'Proposal', 'Qualified', 'Renewal'];
        } else if (filterType === 'leadScout') {
            dropdownOptions = ['Lead', 'Scout'];
        } else if (filterType === 'preQual') {
            dropdownOptions = ['Pre-Qualified'];
        } else {
            dropdownOptions = [...new Set(sows.map(s => getNormalizedStatus(s.sowStatus)).filter(Boolean))];
        }
        
        if (dropdownOptions.length > 1 || (filterType && dropdownOptions.length > 0)) {
            filterContainer.empty().append(`
                <span class="sr-only">Filter by Status</span>
                <select id="sowStatusFilter" class="nps-select ms-select" multiple></select>
            `).css('display', 'flex');
            
            const filterSelect = $("#sowStatusFilter");
            dropdownOptions.forEach(status => {
                filterSelect.append(`<option value="${status}" selected>${status}</option>`);
            });
            
            filterSelect.multiselect({
                columns: 1,
                texts: { placeholder: 'Status' },
                search: false,
                selectAll: true,
                onOptionClick: function() {
                    sowRevenueModalState.selectedStatuses = filterSelect.val() || [];
                    refreshSowRevenueModal();
                },
                onSelectAll: function() {
                    sowRevenueModalState.selectedStatuses = filterSelect.val() || [];
                    refreshSowRevenueModal();
                }
            });
        } else {
            filterContainer.hide().empty();
        }
        
        sowRevenueModalState.availableStatuses = dropdownOptions.slice();
        sowRevenueModalState.selectedStatuses = dropdownOptions.slice();

        // Initial render with all statuses selected and highest revenue first.
        refreshSowRevenueModal();
        
        $("#sowRevenueModal").show();
        setTimeout(() => {
            $("#sowRevenueModal").find(".nps-modal-body").scrollTop(0);
        }, 10);
    } catch (e) {
        console.error("Error displaying SOW revenue modal", e);
    }
}

function viewBuyingCenterByName(accountName, accountId) {
    if (!accountId) {
        const accountIdMap = {
            "Anthem": "ANT",
            "Altair": "ATR",
            "Baptist Health": "BAH",
            "Boundless Learning": "BGN",
            "Bread Financial": "BRE",
            "Corebridge Financial": "CNC",
            "Comcast Business": "COM",
            "Centric Brands": "CRB",
            "Central Insurance": "CTS",
            "CVS": "CVS",
            "Disney": "DIS",
            "HCA Hospitals": "HSP",
            "IPG": "IPG",
            "GenDigital": "LFL",
            "Liberty Mutual Insurance": "LIN",
            "Macys": "MAC",
            "MHE": "MHE",
            "Metlife": "MIF",
            "Maersk": "MSK",
            "RxBenefits": "REB",
            "RSM": "RSM",
            "RiteAid": "RTA",
            "SimpliSafe": "SIP",
            "Shipveho": "SOE",
            "Starbucks": "SSR",
            "The Hanover Group": "THG",
            "Elevance Health": "ANT",
            "Macy's": "MAC",
            "B_Account": "BNU"
        };
        
        accountId = accountIdMap[accountName];
        if (!accountId) {
            accountId = accountName.substring(0, 3).toUpperCase();
        }
    }
    
    let url = `buying_center.html?accountName=${encodeURIComponent(accountName)}&accountId=${accountId}&action=view-edit&redirect=accountDetails`;
    window.open(url, '_blank');
}

function openSowPage(sowId, uniqueId) {
    localStorage.setItem('urlStoredSOWUrldata', '');
    localStorage.setItem("sow-acc-data", '');
    localStorage.removeItem('urlStoredSOWUrldata');
    localStorage.removeItem('sow-acc-data');
    localStorage.removeItem('sow-url-id');
    localStorage.setItem("sow-click-source", "sow");
    window.open(`sow.html?${uniqueId}&${sowId}`, '_blank');
}

window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'RELOAD_ACTIVE_ACCOUNT') {
        fetchManagementData();
        engRawData = null;
    }
});
