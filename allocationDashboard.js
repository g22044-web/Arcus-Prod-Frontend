const pathname = window.location.pathname;
const parts = pathname.split('/');
const fileName = parts.pop();

$(document).ready(function () {
    assignMetaValue();
    $("meta[name='google-signin-client_id']").attr("content", metaValue);
    getLocalSessionData();
    if (sessionName == null) {
        window.location.href = 'index.html';
        return false;
    } else {
        let accessStatus = checkDashboardPageAccessData()
        if (accessStatus) {
            let accessLevel = checkEachPageAccess("Allocation")
            if (accessLevel.length > 0) {
                let environment = accessLevel[0]
                if (environment == apiValue.environment) {
                    getOverallSummaryJson();
                } else {
                    window.location.href = "home.html"
                }
            } else {
                window.location.href = "home.html"
            }
        } else {
            window.location.href = "home.html"
        }
    }
});

$('#logout').click(function () {
    localStorage.clear();
    window.location.href = 'index.html';
    return false;
});

let overallData = [], allocationData = [], noShortageData = [], onlyShortageData = [], allShortage = [];
let selectedAllocationData = [], currentFilterMode = 'onlyShortage';
let supplyColumnState = {
    "today": { "indExpanded": false, "usExpanded": false },
    "30": { "indExpanded": false, "usExpanded": false },
    "60": { "indExpanded": false, "usExpanded": false },
    "90": { "indExpanded": false, "usExpanded": false }
};

// Date calculation functions
function calculateSectionDates() {
    const today = new Date();
    const dates = {
        today: formatDateHeader(today),
        day30: formatDateHeader(addDays(today, 30)),
        day60: formatDateHeader(addDays(today, 60)),
        day90: formatDateHeader(addDays(today, 90))
    };
    return dates;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDateHeader(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function convert(str) {
    if (str == "" || !str) {
        return "-";
    }
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
}

function getOverallSummaryJson() {
    const startTime = performance.now();
    let empId = localStorage.getItem('EmpUserID');
    let emp_email = localStorage.getItem('email');
    let emp_dep = localStorage.getItem('Department');
    let today = new Date();
    let Currdate1 = convertDate(today);

    $.ajax({
        url: apiValue.url_ip + ":5005/shortage_page",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: 'no-cors',
        data: JSON.stringify({
            "SHORTAGE_AS_OF_DATE": Currdate1,
            "environment": apiValue.environment,
            emp_id: empId,
            mail_id: emp_email,
            department: emp_dep,
        }),
        success: function (dataJson) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds, "AllocationDashboard", "Allocation", "shortage_page", "success", fileName, "Allocation_dashboard", "view");

            overallData = dataJson;
            allocationData = dataJson[0].SHORTAGE_DATA || [];
            noShortageData = dataJson[0].NO_SHORTAGE_DATA || [];
            onlyShortageData = dataJson[0].ONLY_SHORTAGE || [];
            console.log('onlyShortageData - ', onlyShortageData)
            allShortage = dataJson[0].ALL_DATA || [];

            // Update section headers with calculated dates
            updateSectionHeaders();

            // Initialize the view
            initializeFilters();

            // Apply initial filters (this will set selectedAllocationData and render)
            applyFilters();

            // Hide loader and show page
            $(".loader").css("display", "none");
            $(".show_page").css("display", "block");
        },
        error: function (error) {
            const endTime = performance.now();
            const loadTimeInSeconds = (endTime - startTime) / 1000;
            getApiTime(loadTimeInSeconds, "AllocationDashboard", "Allocation", "shortage_page", "error", fileName, "Allocation_dashboard", "view");
            console.log('Error: ' + JSON.stringify(error));
            $(".loader").css("display", "none");
        }
    });
}

function convertDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();
    var mmChars = mm.split('');
    var ddChars = dd.split('');
    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
}

function updateSectionHeaders() {
    const dates = calculateSectionDates();
    $('#header-today').text(`Today (As of ${dates.today})`);
    $('#header-30').text(`After 30 Days (As of ${dates.day30})`);
    $('#header-60').text(`After 60 Days (As of ${dates.day60})`);
    $('#header-90').text(`After 90 Days (As of ${dates.day90})`);
    updateTableHeaders();
}

function updateTableHeaders() {
    let headerText = 'Shortage/Excess';
    if (currentFilterMode === 'onlyShortage') {
        headerText = 'Shortage';
    } else if (currentFilterMode === 'shortAgeData') {
        headerText = 'Excess';
    }
    $('.mode-header').text(headerText);
}

function updateTotalsVisibility() {
    $('.allocation-table tfoot').toggle(currentFilterMode !== 'noShortAgeData');
}

function initializeFilters() {
    // Create static status checkboxes in fixed order
    const statusOrder = ['Signed', 'Renewal', 'Proposal', 'Qualified', 'Pre-Qualified'];
    let statusHtml = '';

    statusOrder.forEach(status => {
        let isChecked = (status === 'Signed' || status === 'Renewal') ? 'checked' : '';
        statusHtml += `<label><input type="checkbox" value="${status}" ${isChecked}><span>${status}</span></label>`;
    });
    $('#statusCheckboxes').html(statusHtml);

    // Attach event handlers
    $('#statusCheckboxes input[type="checkbox"]').change(function () {
        applyFilters();
    });

    $('input[name="sow_all_data"]').change(function () {
        currentFilterMode = $(this).val();
        updateTableHeaders();
        // Keep user selections when mode changes - don't reset
        populateDropdowns();
        applyFilters();
    });

    $('#globalSearch').on('keyup', function () {
        applyFilters();
    });

    // Initialize multiselect dropdowns
    populateDropdowns();

    $('#accountSelect').multiselect({
        columns: 1,
        placeholder: 'Account',
        search: true,
        selectAll: true,
        onChange: function (option, checked, select) {
            // Update SOW dropdown based on selected accounts
            updateSowDropdown();
            applyFilters();
        }
    });

    $('#sowSelect').multiselect({
        columns: 1,
        placeholder: 'SOW',
        search: true,
        selectAll: true,
        onChange: function (option, checked, select) {
            applyFilters();
        }
    });
}

function initializeSupplyColumns() {
    const periods = ['today', '30', '60', '90'];
    periods.forEach(period => {
        const state = supplyColumnState[period];

        if (state.indExpanded) {
            // IND is expanded
            $(`.supIndHide-${period}`).show();
            $(`.supIndShow-${period}`).hide();
            $(`#supplyInd-${period}`).attr('colspan', '2');
            $(`#farightin-${period}`).hide();
            $(`#faleftin-${period}`).show();
        } else {
            // IND is collapsed
            $(`.supIndHide-${period}`).hide();
            $(`.supIndShow-${period}`).show();
            $(`#supplyInd-${period}`).attr('colspan', '1');
            $(`#farightin-${period}`).show();
            $(`#faleftin-${period}`).hide();
        }

        if (state.usExpanded) {
            // US is expanded
            $(`.supNAHide-${period}`).show();
            $(`.supNAShow-${period}`).hide();
            $(`#supplyNA-${period}`).attr('colspan', '2');
            $(`#farightus-${period}`).hide();
            $(`#faleftus-${period}`).show();
        } else {
            // US is collapsed
            $(`.supNAHide-${period}`).hide();
            $(`.supNAShow-${period}`).show();
            $(`#supplyNA-${period}`).attr('colspan', '1');
            $(`#farightus-${period}`).show();
            $(`#faleftus-${period}`).hide();
        }

        // Show/hide the third row based on expansion state
        if (state.indExpanded || state.usExpanded) {
            $(`.supplyIndNA-${period}`).show();
        } else {
            $(`.supplyIndNA-${period}`).hide();
        }

        // Calculate and set the main supply colspan
        let mainColspan = 2;
        if (state.indExpanded) mainColspan += 1;
        if (state.usExpanded) mainColspan += 1;
        $(`#supplyMain-${period}`).attr('colspan', mainColspan.toString());
    });
}

function populateDropdowns(preserveSelections = true) {
    // Always use ALL data (combined) for dropdown options, regardless of filter mode
    // This ensures users can select filters even if current mode has no matching data
    let accounts = [...new Set(allShortage.map(item => item.ACCOUNT_NAME))].sort();

    // Store current selections before updating
    let currentAccountSelection = preserveSelections ? ($('#accountSelect').val() || []) : [];

    // Check if options have actually changed
    let currentOptions = [];
    $('#accountSelect option').each(function () {
        currentOptions.push($(this).val());
    });

    let optionsChanged = JSON.stringify(currentOptions.sort()) !== JSON.stringify(accounts.sort());

    if (optionsChanged || !preserveSelections) {
        $('#accountSelect').empty();
        accounts.forEach(account => {
            $('#accountSelect').append(`<option value="${account}">${account}</option>`);
        });

        // Restore account selections
        if (currentAccountSelection.length > 0) {
            $('#accountSelect').val(currentAccountSelection);
        }

        // Reload account multiselect
        $('#accountSelect').multiselect('reload');

        // Re-bind events after reload
        bindMultiselectEvents();
    }

    // Update SOW dropdown based on selected accounts
    updateSowDropdown(preserveSelections);
}

function updateSowDropdown(preserveSelections = true) {
    // Always use ALL data (combined) for SOW options
    let selectedAccounts = $('#accountSelect').val() || [];
    let currentSowSelection = preserveSelections ? ($('#sowSelect').val() || []) : [];

    // Filter SOWs based on selected accounts from ALL data
    let filteredData = allShortage;
    if (selectedAccounts.length > 0) {
        filteredData = allShortage.filter(item => selectedAccounts.includes(item.ACCOUNT_NAME));
    }

    let sows = [...new Set(filteredData.map(item => item.SOW_NAME))].sort();

    // Check if options have actually changed
    let currentOptions = [];
    $('#sowSelect option').each(function () {
        currentOptions.push($(this).val());
    });

    let optionsChanged = JSON.stringify(currentOptions.sort()) !== JSON.stringify(sows.sort());

    if (optionsChanged || !preserveSelections) {
        $('#sowSelect').empty();
        sows.forEach(sow => {
            $('#sowSelect').append(`<option value="${sow}">${sow}</option>`);
        });

        // Restore SOW selections
        if (currentSowSelection.length > 0) {
            $('#sowSelect').val(currentSowSelection);
        }

        // Reload SOW multiselect
        $('#sowSelect').multiselect('reload');
    }
}

function applyFilters() {
    // Get filter values
    let selectedStatuses = [];
    $('#statusCheckboxes input[type="checkbox"]:checked').each(function () {
        selectedStatuses.push($(this).val());
    });

    let selectedAccounts = $('#accountSelect').val() || [];
    let selectedSows = $('#sowSelect').val() || [];
    let searchTerm = $('#globalSearch').val().toLowerCase();

    // Determine data source based on filter mode
    let sourceData = [];
    if (currentFilterMode === 'onlyShortage') {
        sourceData = onlyShortageData;
    } else if (currentFilterMode === 'shortAgeData') {
        sourceData = allocationData;
    } else {
        sourceData = allShortage;
    }

    // Apply filters
    let filteredData = sourceData.filter(item => {
        // Status filter
        if (selectedStatuses.length > 0 && !selectedStatuses.includes(item.SOW_STATUS)) {
            return false;
        }

        // Account filter
        if (selectedAccounts.length > 0 && !selectedAccounts.includes(item.ACCOUNT_NAME)) {
            return false;
        }

        // SOW filter
        if (selectedSows.length > 0 && !selectedSows.includes(item.SOW_NAME)) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            let searchableText = `${item.ACCOUNT_NAME} ${item.SOW_NAME} ${item.SOW_STATUS} ${item.BILLING_MODEL}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }

        return true;
    });

    selectedAllocationData = filteredData;
    renderAllSections();
}

function renderAllSections() {
    // Destroy existing DataTables before re-rendering
    const tableIds = ['#table-today', '#table-30', '#table-60', '#table-90'];
    tableIds.forEach(tableId => {
        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().clear().destroy();
        }
    });

    // Group data by time periods
    const groupedData = groupDataByTimePeriod(selectedAllocationData);

    // Render each section
    renderSection('today', groupedData.today);
    renderSection('30', groupedData.day30);
    renderSection('60', groupedData.day60);
    renderSection('90', groupedData.day90);

    // Totals are not shown in All mode for any of the four time buckets.
    updateTotalsVisibility();

    // Initialize supply columns after rendering to ensure proper alignment
    initializeSupplyColumns();

    // Initialize DataTables only for tables that have data rows (not empty or "no data" tables)
    tableIds.forEach(tableId => {
        const tbody = $(tableId).find('tbody');
        const rowCount = tbody.find('tr').length;
        const hasDataRow = tbody.find('tr').not(':has(td[colspan="15"])').length > 0;

        if (rowCount > 0 && hasDataRow) {
            $(tableId).DataTable({
                "paging": false,
                "searching": false,
                "info": false,
                "ordering": true,
                "order": [[6, "asc"]],
                "columnDefs": [
                    { "orderable": true, "targets": "_all" }
                ]
            });
        }
    });

    // Show/hide excess legend based on mode
    // if (currentFilterMode === 'onlyShortage') {
    //     $('.us_color_div').hide();
    // } else {
    //     $('.us_color_div').show();
    // }
}

function groupDataByTimePeriod(data) {
    const grouped = {
        today: [],
        day30: [],
        day60: [],
        day90: []
    };

    // Track the last displayed state for each SOW to avoid duplicates
    const lastState = {};

    function passesPeriodFilter(periodData) {
        if (!periodData || (!periodData.INDIA && !periodData.US)) return false;

        const ind = periodData.INDIA || {};
        const us = periodData.US || {};

        const indShortage = parseInt(ind.INDIA_SHORTAGE) || 0;
        const usShortage = parseInt(us.US_SHORTAGE) || 0;

        if (currentFilterMode === 'onlyShortage') {
            return indShortage < 0 || usShortage < 0;
        } else if (currentFilterMode === 'shortAgeData') {
            return indShortage > 0 || usShortage > 0;
        } else {
            // All Mode: Check if any metric is non-zero
            const metrics = [
                ind.INDIA_RESOURCE_DEMAND, ind.INDIA_RESOURCE_SUPPLY, ind.INDIA_SHORTAGE,
                us.US_RESOURCE_DEMAND, us.US_RESOURCE_SUPPLY, us.US_SHORTAGE
            ];
            return metrics.some(m => (parseInt(m) || 0) !== 0);
        }
    }

    function isDataDifferent(sowId, newData) {
        if (!newData) return false;
        const oldData = lastState[sowId];
        if (!oldData) return true; // First time seeing this SOW

        // Compare Demand, Supply (Total), and Shortage for both IND and US
        const fields = [
            'INDIA_RESOURCE_DEMAND', 'US_RESOURCE_DEMAND',
            'INDIA_RESOURCE_SUPPLY', 'US_RESOURCE_SUPPLY',
            'INDIA_SHORTAGE', 'US_SHORTAGE'
        ];

        for (const field of fields) {
            const oldRegion = field.startsWith('INDIA') ? oldData.INDIA : oldData.US;
            const newRegion = field.startsWith('INDIA') ? newData.INDIA : newData.US;
            const oldVal = (oldRegion ? oldRegion[field] : 0) || 0;
            const newVal = (newRegion ? newRegion[field] : 0) || 0;
            if (oldVal !== newVal) return true;
        }

        return false;
    }

    function updateState(sowId, indiaData, usData) {
        lastState[sowId] = {
            INDIA: { ...indiaData },
            US: { ...usData }
        };
    }

    const periods = [
        { key: 'today', ind: 'INDIA_TODAY', us: 'US_TODAY', period: 'TODAY' },
        { key: 'day30', ind: 'INDIA_30', us: 'US_30', period: '30' },
        { key: 'day60', ind: 'INDIA_60', us: 'US_60', period: '60' },
        { key: 'day90', ind: 'INDIA_90', us: 'US_90', period: '90' }
    ];

    data.forEach(item => {
        const sowKey = item.UNIQUE_ID || item.SOW_ID;

        periods.forEach(p => {
            const periodData = { INDIA: item[p.ind], US: item[p.us] };

            if (passesPeriodFilter(periodData)) {
                if (isDataDifferent(sowKey, periodData)) {
                    grouped[p.key].push({
                        ...item,
                        period: p.period,
                        INDIA_DATA: item[p.ind],
                        US_DATA: item[p.us]
                    });
                    updateState(sowKey, item[p.ind], item[p.us]);
                }
            }
        });
    });

    return grouped;
}

function renderSection(period, data) {
    const tbody = $(`#tbody-${period}`);
    const table = tbody.closest('table');
    tbody.empty();

    if (!data || data.length === 0) {
        table.addClass('table-empty-header');
        tbody.append(`<tr><td colspan="15" class="text-center" style="padding: 20px; color: #999;">No data available for this period</td></tr>`);
        updateTotals(period, {});
        return;
    }
    table.removeClass('table-empty-header');

    let totals = {
        indDemand: 0,
        usDemand: 0,
        indBilled: 0,
        indInvestment: 0,
        indSupply: 0,
        usBilled: 0,
        usInvestment: 0,
        usSupply: 0,
        indShortage: 0,
        usShortage: 0
    };

    data.forEach(item => {
        const indData = item.INDIA_DATA || {};
        const usData = item.US_DATA || {};

        const indDemand = parseInt(indData.INDIA_RESOURCE_DEMAND) || 0;
        const usDemand = parseInt(usData.US_RESOURCE_DEMAND) || 0;
        const indBilled = parseInt(indData.INDIA_BILLED_SUPPLY) || 0;
        const indInvestment = parseInt(indData.INDIA_INVESTMENT_SUPPLY) || 0;
        const indSupply = parseInt(indData.INDIA_RESOURCE_SUPPLY) || 0;
        const usBilled = parseInt(usData.US_BILLED_SUPPLY) || 0;
        const usInvestment = parseInt(usData.US_INVESTMENT_SUPPLY) || 0;
        const usSupply = parseInt(usData.US_RESOURCE_SUPPLY) || 0;
        const indShortage = parseInt(indData.INDIA_SHORTAGE) || 0;
        const usShortage = parseInt(usData.US_SHORTAGE) || 0;

        // Calculate totals
        totals.indDemand += indDemand;
        totals.usDemand += usDemand;
        totals.indBilled += indBilled;
        totals.indInvestment += indInvestment;
        totals.indSupply += indSupply;
        totals.usBilled += usBilled;
        totals.usInvestment += usInvestment;
        totals.usSupply += usSupply;

        // Calculate shortage totals based on mode
        if (currentFilterMode === 'onlyShortage') {
            if (indShortage < 0) totals.indShortage += indShortage;
            if (usShortage < 0) totals.usShortage += usShortage;
        } else if (currentFilterMode === 'shortAgeData') {
            if (indShortage > 0) totals.indShortage += indShortage;
            if (usShortage > 0) totals.usShortage += usShortage;
        } else {
            totals.indShortage += indShortage;
            totals.usShortage += usShortage;
        }

        // Determine cell classes
        let indShortageClass = '';
        let usShortageClass = '';

        // if (currentFilterMode === 'onlyShortage') {
        //     indShortageClass = indShortage < 0 ? 'shortageClass' : '';
        //     usShortageClass = usShortage < 0 ? 'shortageClass' : '';
        // } else {
        indShortageClass = indShortage < 0 ? 'shortageClass' : (indShortage > 0 ? 'equalindus' : '');
        usShortageClass = usShortage < 0 ? 'shortageClass' : (usShortage > 0 ? 'equalindus' : '');
        // }

        const shortageDate = item.SHORTAGE_AS_OF_DATE === "NaT" || !item.SHORTAGE_AS_OF_DATE ? "-" : convert(item.SHORTAGE_AS_OF_DATE);

        const row = `
            <tr>
                <td class='account_width'>${item.ACCOUNT_NAME}</td>
                <td class='sow_name_col'><a href="javascript:void(0)" class="sow_data_name_all" onclick="sowAllocationResData(this)" data-id='${JSON.stringify(item)}'>${item.SOW_NAME}</a></td>
                <td class='others_width'><div class="${item.SOW_STATUS === 'Signed' ? 'signed_funnel' : 'others_funnel'} signed_funnel">${item.SOW_STATUS}</div></td>
                <td class='billing_width'>${item.BILLING_MODEL || 'T&M'}</td>
                <td class="text-center others_width">${convert(item.ACTUAL_START_DATE)}</td>
                <td class="text-center others_width">${convert(item.ACTUAL_END_DATE)}</td>
                <td class="text-center others_width">${shortageDate}</td>
                <td class="text-center">${indDemand}</td>
                <td class="text-center">${usDemand}</td>
                <td class="text-center supIndHide-${period}">${indBilled}</td>
                <td class="text-center supIndHide-${period}">${indInvestment}</td>
                <td class="text-center supIndShow-${period}">${indSupply}</td>
                <td class="text-center supNAHide-${period}">${usBilled}</td>
                <td class="text-center supNAHide-${period}">${usInvestment}</td>
                <td class="text-center supNAShow-${period}">${usSupply}</td>
                <td class="text-center ${indShortageClass}">${indShortage}</td>
                <td class="text-center ${usShortageClass}">${usShortage}</td>
            </tr>
        `;

        tbody.append(row);
    });

    updateTotals(period, totals);
}

function updateTotals(period, totals) {
    $(`#total-${period}-ind-demand`).text(totals.indDemand || 0);
    $(`#total-${period}-us-demand`).text(totals.usDemand || 0);
    $(`#total-${period}-ind-billed`).text(totals.indBilled || 0);
    $(`#total-${period}-ind-investment`).text(totals.indInvestment || 0);
    $(`#total-${period}-ind-supply`).text(totals.indSupply || 0);
    $(`#total-${period}-us-billed`).text(totals.usBilled || 0);
    $(`#total-${period}-us-investment`).text(totals.usInvestment || 0);
    $(`#total-${period}-us-supply`).text(totals.usSupply || 0);
    $(`#total-${period}-ind-shortage`).text(totals.indShortage || 0);
    $(`#total-${period}-us-shortage`).text(totals.usShortage || 0);
}

function sowAllocationResData(obj) {
    let sowAllRes = $(obj).attr("data-id");
    let sow_details = JSON.parse(sowAllRes);
    let sow_id = sow_details.SOW_ID;
    let UNIQUE_ID = sow_details.UNIQUE_ID;
    let uniqId_sowid = UNIQUE_ID + '&' + sow_id;
    window.open('sow.html?' + uniqId_sowid, '_blank');
}

// Expandable Supply Column Functions
function showSupplyInd(period) {
    let supplyIndSpanVal = $(`#supplyInd-${period}`).attr('colspan');
    let supplyMain = parseInt($(`#supplyMain-${period}`).attr('colspan'));

    if (supplyIndSpanVal == "2") {
        // Collapse IND supply columns
        $(`.supIndHide-${period}`).hide();
        $(`.supIndShow-${period}`).show();
        $(`#supplyInd-${period}`).attr('colspan', "1");
        $(`#supplyMain-${period}`).attr('colspan', supplyMain - 1);
        $(`#faleftin-${period}`).hide();
        $(`#farightin-${period}`).show();

        // Update state
        supplyColumnState[period].indExpanded = false;

        // Hide the third row if both IND and US are collapsed
        let supplyNASpanVal = $(`#supplyNA-${period}`).attr('colspan');
        if (supplyNASpanVal == "1") {
            $(`.supplyIndNA-${period}`).hide();
        }
    } else {
        // Expand IND supply columns
        $(`.supIndHide-${period}`).show();
        $(`.supIndShow-${period}`).hide();
        $(`#supplyInd-${period}`).attr('colspan', "2");
        $(`#supplyMain-${period}`).attr('colspan', supplyMain + 1);
        $(`#farightin-${period}`).hide();
        $(`#faleftin-${period}`).show();
        $(`.supplyIndNA-${period}`).show();

        // Update state
        supplyColumnState[period].indExpanded = true;
    }
}

function showSupplyNA(period) {
    let supplyNASpanVal = $(`#supplyNA-${period}`).attr('colspan');
    let supplyMain = parseInt($(`#supplyMain-${period}`).attr('colspan'));

    if (supplyNASpanVal == "2") {
        // Collapse US supply columns
        $(`.supNAHide-${period}`).hide();
        $(`.supNAShow-${period}`).show();
        $(`#supplyNA-${period}`).attr('colspan', "1");
        $(`#supplyMain-${period}`).attr('colspan', supplyMain - 1);
        $(`#faleftus-${period}`).hide();
        $(`#farightus-${period}`).show();

        // Update state
        supplyColumnState[period].usExpanded = false;

        // Hide the third row if both IND and US are collapsed
        let supplyIndSpanVal = $(`#supplyInd-${period}`).attr('colspan');
        if (supplyIndSpanVal == "1") {
            $(`.supplyIndNA-${period}`).hide();
        }
    } else {
        // Expand US supply columns
        $(`.supNAHide-${period}`).show();
        $(`.supNAShow-${period}`).hide();
        $(`#supplyNA-${period}`).attr('colspan', "2");
        $(`#supplyMain-${period}`).attr('colspan', supplyMain + 1);
        $(`#farightus-${period}`).hide();
        $(`#faleftus-${period}`).show();
        $(`.supplyIndNA-${period}`).show();

        // Update state
        supplyColumnState[period].usExpanded = true;
    }
}

// Keep these functions for compatibility
function getShortageGreen() {
    applyFilters();
}

function bindMultiselectEvents() {
    // Attach change event handlers after multiselect initialization
    $(document).on('change', '#accountSelect', function () {
        // Update SOW dropdown based on selected accounts
        updateSowDropdown();
        applyFilters();
    });

    $(document).on('change', '#sowSelect', function () {
        applyFilters();
    });
}

function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '<',
        '>': '>',
        '"': '"',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}
