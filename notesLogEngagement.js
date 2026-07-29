$(document).ready(function () {
    // State management
    let state = {
        currentTab: 'notes',
        currentAuditLogs: [],
        dropdownHierarchy: [],
        isFiltering: false,
        isLeadMode: false,
        anchorDropdown: null // Tracks which dropdown was selected first ('bc' or 'sh')
    };

    var quill;
    var nextStepsQuill;

    // Initialize Select2 matching buying_center.js style
    function initSelect2() {
        $('#searchType, #searchAccount, #searchBuyingCenter, #searchStakeholder').select2({
            placeholder: "Search...",
            allowClear: true,
            width: '100%'
        });
    }

    // Initialize date pickers (Gijgo) match buying_center.js
    $('#meetingDate, #nextStepsEta, #nextInteractionEta').each(function () {
        if (!$(this).data('datepicker')) {
            $(this).datepicker({
                format: 'mm-dd-yy',
                uiLibrary: 'bootstrap'
            });
        }
    });

    // Initialize Quill editor
    quill = new Quill("#editor", {
        modules: {
            toolbar: [
                ["bold", "italic", "underline", "link"],
                [{ list: "ordered" }, { list: "bullet" }],
            ],
        },
        placeholder: "Enter details about the meeting...",
        theme: "snow",
    });
    quill.enable(false);

    // Initialize Next Steps Quill editor
    nextStepsQuill = new Quill("#nextStepsEditor", {
        modules: {
            toolbar: [
                ["bold", "italic", "underline", "link"],
                [{ list: "ordered" }, { list: "bullet" }],
            ],
        },
        placeholder: "What are the next action items?",
        theme: "snow",
    });
    nextStepsQuill.enable(false);

    // Update minDate for Next Steps and Next Interaction datepickers when Meeting Date changes
    $('#meetingDate').on('change', function () {
        const meetingDateVal = $(this).val();
        const $nextStepsEta = $('#nextStepsEta');
        const $nextInteractionEta = $('#nextInteractionEta');

        // Store current values and classes
        const currentNextStepsEta = $nextStepsEta.val();
        const currentNextInteractionEta = $nextInteractionEta.val();
        const nextStepsClasses = $nextStepsEta.attr('class');
        const nextInteractionClasses = $nextInteractionEta.attr('class');

        if (meetingDateVal) {
            // Parse the date (format: mm-dd-yy)
            const parts = meetingDateVal.split('-');
            if (parts.length === 3) {
                const month = parseInt(parts[0], 10) - 1; // 0-based month
                const day = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10) + 2000; // Convert yy to yyyy
                const meetingDate = new Date(year, month, day);

                // Destroy and reinitialize datepickers with minDate
                if ($nextStepsEta.data('datepicker')) {
                    $nextStepsEta.datepicker('destroy');
                }
                $nextStepsEta.datepicker({
                    format: 'mm-dd-yy',
                    uiLibrary: 'bootstrap',
                    minDate: meetingDate
                });
                // Restore the value and classes
                $nextStepsEta.val(currentNextStepsEta).attr('class', nextStepsClasses);

                if ($nextInteractionEta.data('datepicker')) {
                    $nextInteractionEta.datepicker('destroy');
                }
                $nextInteractionEta.datepicker({
                    format: 'mm-dd-yy',
                    uiLibrary: 'bootstrap',
                    minDate: meetingDate
                });
                // Restore the value and classes
                $nextInteractionEta.val(currentNextInteractionEta).attr('class', nextInteractionClasses);
            }
        } else {
            // Reset to no minDate if meeting date is cleared
            if ($nextStepsEta.data('datepicker')) {
                $nextStepsEta.datepicker('destroy');
            }
            $nextStepsEta.datepicker({
                format: 'mm-dd-yy',
                uiLibrary: 'bootstrap'
            });
            // Restore the value and classes
            $nextStepsEta.val(currentNextStepsEta).attr('class', nextStepsClasses);

            if ($nextInteractionEta.data('datepicker')) {
                $nextInteractionEta.datepicker('destroy');
            }
            $nextInteractionEta.datepicker({
                format: 'mm-dd-yy',
                uiLibrary: 'bootstrap'
            });
            // Restore the value and classes
            $nextInteractionEta.val(currentNextInteractionEta).attr('class', nextInteractionClasses);
        }
    });

    initSelect2();

    // Tab switching logic
    $('.tab-btn').on('click', function () {
        const tab = $(this).data('tab');
        state.currentTab = tab;

        $('.tab-btn').removeClass('active');
        $(this).addClass('active');

        $('.tab-panel').removeClass('active');
        $(`#${tab}-panel`).addClass('active');

        if (tab === 'audit-logs') {
            fetchAuditLogs();
        }
    });

    // Next Steps toggle
    $('#nextStepsBtn, #noNextStepsBtn').on('click', function () {
        const $panel = $("#notes-panel");
        // Only allow clicking if Buying Center is selected (panel is enabled)
        if ($("#searchBuyingCenter").val() === "") return;

        $('.toggle-btn').removeClass('active');
        $(this).addClass('active');

        const isNoNextSteps = $(this).data('value') === 'No Next Steps';
        if (isNoNextSteps) {
            $('#nextStepsContent').hide();
            $('#nextStepsEtaWrapper').hide();
            nextStepsQuill.enable(false);
            nextStepsQuill.root.innerHTML = "";
            $('#nextStepsEta').prop('disabled', true).val('');
        } else {
            $('#nextStepsContent').show();
            $('#nextStepsEtaWrapper').show();
            nextStepsQuill.enable(true);
            $('#nextStepsEta').prop('disabled', false);
        }
        // validateSaveButton();
    });

    // Next Interaction is always visible now

    /*
    function validateSaveButton() {
       // ... Removed to allow on-click validation ...
       // $("#updateNoteBtn").prop("disabled", !isValid);
    }
    */

    /* 
    // Real-time validation listeners REMOVED
    $(document).on('change input', '#searchType, #searchAccount, #searchBuyingCenter, #searchStakeholder, #meetingDate, #detailedNotes, #nextInteractionEta, input[name="interactionType"], input[name="nextInteractionType"], #nextStepsText, #nextStepsEta', function() {
        validateSaveButton();
    });
    */

    // API Call to Save Note
    $('#updateNoteBtn').on('click', function () {
        saveNote();
    });

    function saveNote() {
        const searchType = $("#searchType").val();

        // 1. Validate Stakeholder / Lead
        const stakeholderName = $("#searchStakeholder").val() ? $("#searchStakeholder").val().trim() : "";
        if (!stakeholderName) {
            const label = searchType === 'lead' ? 'Lead' : 'Stakeholder';
            toastr.warning(`Please select or enter a ${label}.`);
            return;
        }

        // 2. Validate Meeting Date
        const meetingDate = $("#meetingDate").val();
        const interactionType = $("input[name='interactionType']:checked").val();

        // Meeting Date is required if:
        // - searchType is NOT 'lead'
        // - OR searchType IS 'lead' AND interactionType is NOT 'N/A'
        const isMeetingDateRequired = searchType !== 'lead' || (searchType === 'lead' && (interactionType !== 'N/A' && interactionType));

        if (isMeetingDateRequired && !meetingDate) {
            toastr.warning("Please select a Meeting Date.");
            return;
        }

        // 3. Validate Detailed Notes
        const detailText = quill.root.innerHTML.trim();
        const detailRaw = quill.getText().trim();
        if (!detailRaw || detailText === '<p><br></p>') {
            toastr.warning("Please enter Detailed Notes.");
            return;
        }

        // 4. Validate Next Steps (if active and required)
        if (isMeetingDateRequired && !$("#noNextStepsBtn").hasClass("active")) {
            const nextStepsText = nextStepsQuill.root.innerHTML.trim();
            const nextStepsRaw = nextStepsQuill.getText().trim();
            const nextStepsEta = $("#nextStepsEta").val();

            if (!nextStepsRaw || nextStepsText === '<p><br></p>') {
                toastr.warning("Please enter Next Steps.");
                return;
            }
            if (!nextStepsEta) {
                toastr.warning("Please select a Next Steps Estimated Date.");
                return;
            }
        }

        // 5. Validate Next Interaction (Required if Meeting Date is required)
        if (isMeetingDateRequired) {
            const nextInteractionType = $("input[name='nextInteractionType']:checked").val();
            const nextInteractionEta = $("#nextInteractionEta").val();

            if (!nextInteractionType) {
                toastr.warning("Please select a Next Interaction Type.");
                return;
            }
            if (!nextInteractionEta) {
                toastr.warning("Please select a Next Interaction Estimated Date.");
                return;
            }
        }

        const $btn = $("#updateNoteBtn");
        const originalText = $btn.text();
        $btn.html('<i class="fa fa-spinner fa-spin"></i> Saving...').prop("disabled", true);

        // Determine primary entity from dropdowns
        let primaryType = "";
        let primaryId = "";
        let primaryName = "";

        // searchType already retrieved above
        const accountId = $("#searchAccount").val();
        const accountName = $("#searchAccount option:selected").text();
        const bcId = $("#searchBuyingCenter").val();
        const bcName = $("#searchBuyingCenter option:selected").text();
        // stakeholderName is already defined above and validated

        // Since it's a datalist, we don't have a separate ID if it's new. 
        // We'll search the dropdown hierarchy to find the correct ID if possible.
        let stakeholderId = stakeholderName;
        const accountData = state.dropdownHierarchy.find(a => (a.account_id || a.ACCOUNT_ID) == accountId);
        if (accountData && stakeholderName) {
            const shLower = stakeholderName.toLowerCase().trim();
            let foundId = "";

            const checkItem = (item) => {
                if (!item) return false;
                if (typeof item === 'object') {
                    const name = item.name || item.STAKEHOLDER || item.stakeholder || item.id || "";
                    if (typeof name === 'string' && name.toLowerCase().trim() === shLower) {
                        if (item.id) {
                            foundId = item.id;
                            return true;
                        }
                    }
                }
                return false;
            };

            const checkList = (list) => {
                if (!Array.isArray(list)) return false;
                return list.some(checkItem);
            };

            // Search in buying centers
            const bcs = accountData.buying_centers || accountData.BUYING_CENTERS || [];
            bcs.some(bc => {
                return checkList(bc.superboss) || checkList(bc.key_stakeholders) || checkList(bc.stakeholders);
            });

            // Search in SOWs if not found yet
            if (!foundId) {
                const sows = accountData.sow_data || [];
                sows.some(sow => {
                    if (Array.isArray(sow.BUYING_CENTER_DATA)) {
                        return sow.BUYING_CENTER_DATA.some(bc => {
                            return checkList(bc.superboss) || checkList(bc.key_stakeholders) || checkList(bc.stakeholders);
                        });
                    }
                    return false;
                });
            }

            if (foundId) {
                stakeholderId = foundId;
            }
        }

        const payload = {
            org_id: "Factspan",
            created_by: localStorage.getItem("EmpUserID") || "unknown",
            actor_display_name: localStorage.getItem("EmpUserName") || "User",
            detail_text: detailText,
            meeting_date: convertToISO($("#meetingDate").val()),
            interaction_type: $("input[name='interactionType']:checked").val(),
            relevant_stakeholders: searchType === 'lead' ? `Lead: ${stakeholderName}` : stakeholderName,
            search_type: searchType,
            next_steps_mode: ($("#nextStepsBtn").hasClass("active") || $(".toggle-btn.active").data("value") === "Next Steps") ? "ACTION_ITEM" : "NONE",
            next_steps_text: nextStepsQuill.root.innerHTML,
            next_steps_estimated_date: convertToISO($("#nextStepsEta").val()),
            next_interaction_type: $("input[name='nextInteractionType']:checked").val(),
            next_interaction_estimated_date: convertToISO($("#nextInteractionEta").val()),
            account_id: accountId,
            account_name: accountName,
            bc_name: searchType === 'lead' ? "" : bcName, // bcName is the dropdown text
            bc_id: searchType === 'lead' ? "" : (bcId || bcName || ""),
            primary_entity: {
                type: searchType === 'lead' ? "SOW" : "BUYING_CENTER",
                id: bcId || bcName,
                name: bcName
            },
            standard_entities: {
                account: {
                    id: accountId, // Use accountId instead of accountName for ID
                    name: accountName
                }
            },
            related_entities: stakeholderName ? [{
                type: searchType === 'lead' ? "LEAD" : "STAKEHOLDER",
                id: stakeholderId,
                name: stakeholderName
            }] : []
        };

        // If SOW Lead, add specific SOW identifiers for Figma integration
        if (searchType === 'lead') {
            const selectedSowId = $("#searchBuyingCenter").val();
            const selectedSowData = state.dropdownHierarchy
                .find(acc => acc.account_id === $("#searchAccount").val())
                ?.sow_data?.find(sow => sow.SOW_ID === selectedSowId);

            if (selectedSowData) {
                payload.sow_id = selectedSowData.SOW_ID;
                payload.sow_name = selectedSowData.SOW_NAME;
                payload.unique_id = selectedSowData.SOW_UNIQUE_ID;
                payload.bc_name = selectedSowData.BUYING_CENTRE;
                
                // Extract bc_id from BUYING_CENTER_DATA if available
                let bcIdFromSow = "";
                const bcDataArray = selectedSowData.BUYING_CENTER_DATA || selectedSowData.BUYING_CENTRE_DATA;
                if (Array.isArray(bcDataArray) && bcDataArray.length > 0) {
                    bcIdFromSow = bcDataArray[0].bc_id || bcDataArray[0].BC_ID || bcDataArray[0].bc_name || bcDataArray[0].BUYING_CENTRE || "";
                }
                if (!bcIdFromSow) {
                    bcIdFromSow = selectedSowData.BC_ID || selectedSowData.bc_id || selectedSowData.BUYING_CENTRE || "";
                }
                payload.bc_id = bcIdFromSow;
                
                // Use unique_id as the primary entity ID for better linking in SOW view
                payload.primary_entity.id = selectedSowData.SOW_UNIQUE_ID;
            }
        }

        const baseURL = apiValue.url.replace('/app', '');
        $.ajax({
            url: `${baseURL}/create_note`,
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function (response) {
                $btn.text(originalText).prop("disabled", false);
                if (response.status === "success") {
                    toastr.success("Note saved successfully!");

                    if (searchType === 'lead') {
                        const selectedSowId = $("#searchBuyingCenter").val();
                        const selectedSowData = state.dropdownHierarchy
                            .find(acc => acc.account_id === $("#searchAccount").val())
                            ?.sow_data?.find(sow => sow.SOW_ID === selectedSowId);

                        if (selectedSowData) {
                            const uniqueId = selectedSowData.SOW_UNIQUE_ID;
                            const sowId = selectedSowData.SOW_ID;
                            // Redirect to sow.html with the correct parameters
                            setTimeout(() => {
                                window.location.href = `sow.html?${uniqueId}&${sowId}`;
                            }, 1500);
                            return;
                        }
                    } else if (searchType === 'stakeholder') {
                        // Redirect to buying_center.html with showAudit=true
                        const accountId = $("#searchAccount").val();
                        const accountName = encodeURIComponent($("#searchAccount option:selected").text());
                        const bcName = encodeURIComponent($("#searchBuyingCenter option:selected").text());

                        setTimeout(() => {
                            window.location.href = `buyingCenterDetails.html?accountName=${accountName}&accountId=${accountId}&action=view-edit&buyingCenter=${bcName}&showAudit=true&defaultTab=notes`;
                        }, 1500);
                        return;
                    }

                    resetForm();
                    // Fallback (though normally we'll redirect)
                    if (searchType === 'stakeholder' && $('.tab-btn[data-tab="audit-logs"]').length) {
                        $('.tab-btn[data-tab="audit-logs"]').trigger('click');
                    }
                } else {
                    toastr.error("Error: " + response.message);
                }
            },
            error: function (err) {
                $btn.text(originalText).prop("disabled", false);
                toastr.error("Failed to connect to API.");
                console.error(err);
            }
        });
    }
    function fetchAuditLogs() {
        const bcId = $("#searchBuyingCenter").val();
        const bcName = $("#searchBuyingCenter option:selected").text();

        if (!bcId || bcName === "Search Buying Center") {
            $("#audit-timeline").html('<div class="no-audit-data">Please select a Buying Center to view logs.</div>');
            return;
        }

        $("#audit-timeline").html('<div class="loading-audit">Loading logs...</div>');

        const searchType = $("#searchType").val();
        let entityId = searchType === 'lead' ? bcName : bcId;
        let entityType = searchType === 'lead' ? "SOW" : "BUYING_CENTER";

        if (searchType === 'lead') {
            const selectedSowData = state.dropdownHierarchy
                .find(acc => acc.account_id === $("#searchAccount").val())
                ?.sow_data?.find(sow => sow.SOW_ID === bcId);

            if (selectedSowData) {
                entityId = selectedSowData.SOW_UNIQUE_ID;
            }
        }

        const payload = {
            org_id: "Factspan",
            entity_type: entityType,
            entity_id: entityId
        };

        console.log("Fetching Audit Logs with payload:", payload);

        const baseURL = apiValue.url.replace('/app', '');
        const url = `${baseURL}/get_audit_by_entity`;

        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function (response) {
                console.log("Audit logs response:", response);
                let logs = [];
                if (Array.isArray(response)) {
                    logs = response;
                } else if (response && response.status === "success") {
                    logs = response.data || [];
                }
                state.currentAuditLogs = logs;
                renderAuditTimeline(logs);
            },
            error: function () {
                $("#audit-timeline").html('<div class="no-audit-data">Error loading logs.</div>');
            }
        });
    }

    function renderAuditTimeline(logs) {
        const $container = $("#audit-timeline");
        $container.empty();

        const filterVal = $("input[name='auditFilter']:checked").val(); // 'all' or 'notes'

        let filtered = logs.filter(l => {
            if (filterVal === 'notes') {
                return l.event_type === 'NOTE_CREATED';
            }
            return true;
        });

        if (!filtered || filtered.length === 0) {
            $container.html('<div class="no-audit-data">No matching audit logs found.</div>');
            return;
        }

        filtered.forEach(log => {
            const isNote = log.event_type === 'NOTE_CREATED';
            const isUpdate = log.event_type === 'BUYING_CENTER_UPDATED';

            // Parse Details/Metadata
            let details = log.details;
            if (!details && log.metadata) {
                try {
                    const parsedMeta = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
                    if (parsedMeta.note_details) {
                        details = parsedMeta.note_details;
                    } else if (parsedMeta.detail_text || parsedMeta.interaction_type || parsedMeta.changes) {
                        details = parsedMeta;
                    }
                } catch (e) {
                    console.warn("Failed to parse metadata", e);
                }
            }

            let detailHtml = '';
            if (isNote && details) {
                const d = details;
                // Check if 'relevant_stakeholders' string starts with "Lead: "
                let rawStakeholder = (d.relevant_stakeholders || '').toString();
                let isLead = false;
                let stakeholderVal = rawStakeholder;

                if (rawStakeholder.startsWith("Lead: ")) {
                    isLead = true;
                    stakeholderVal = rawStakeholder.substring(6); // Remove "Lead: "
                } else if (d.search_type === 'lead' || d.search_type === 'Lead') {
                    // Fallback for previous implementation attempt
                    isLead = true;
                }

                const stakeholderLabel = isLead ? 'Lead' : 'Stakeholders';

                const fMap = [
                    { k: 'interaction_type', l: 'Meeting Type' },
                    { k: 'relevant_stakeholders', l: stakeholderLabel, v: stakeholderVal },
                    { k: 'meeting_date', l: 'Meeting Date' },
                    { k: 'detail_text', l: 'Detailed Notes' },
                    { k: 'next_steps_text', l: 'Next Steps' },
                    { k: 'next_steps_estimated_date', l: 'ETA' },
                    { k: 'next_interaction_type', l: 'Next Interactions' },
                    { k: 'next_interaction_estimated_date', l: 'ETA' }
                ];

                let rows = fMap.map(f => {
                    let val = (f.v !== undefined ? f.v : (d[f.k] || '')).toString().trim();
                    if (val === '') val = '—';
                    
                    // Preserve legacy newlines if not HTML
                    if (val !== '—' && !val.includes('<')) {
                        val = val.split('\n').join('<br/>');
                    }

                    if (val === '—' && (f.k.includes('next_interaction') || f.k.includes('next_steps'))) return ''; // Hide empty optional fields
                    return `
                        <div class="audit-detail-row">
                            <span class="audit-detail-label">${f.l}:</span>
                            <span class="audit-detail-value">${val}</span>
                        </div>
                    `;
                }).join('');

                // Add CSS fix for lists in audit timeline if not present
                if (!document.getElementById('audit-list-style')) {
                    const style = document.createElement('style');
                    style.id = 'audit-list-style';
                    style.innerHTML = `
                        .audit-detail-value ul, .audit-detail-value ol {
                            margin-left: 20px !important;
                            padding-left: 5px !important;
                            margin-top: 5px !important;
                            margin-bottom: 5px !important;
                        }
                        .audit-detail-value ul {
                            list-style-type: disc !important;
                        }
                        .audit-detail-value ol {
                            list-style-type: decimal !important;
                        }
                    `;
                    document.head.appendChild(style);
                }

                detailHtml = `
                    <div class="audit-card-peach" style="display: none;">
                        ${rows}
                    </div>
                `;
            } else if (isUpdate && details && Array.isArray(details.changes)) {
                // Stop filtering out PARENT_KEY_STAKEHOLDER_ID so we capture Key Stakeholder mapping changes
                const filteredChanges = details.changes.filter(change => (change.field || change.operation || '').toString().toUpperCase().trim() !== '');
                let rows = filteredChanges.map(change => {
                    if (change.operation === 'DELETE') {
                        const deletedName = change.old || change.deleted_entity_name || 'Stakeholder';
                        return `
                            <div class="audit-detail-row">
                                <span class="audit-detail-label">Stakeholder:</span>
                                <span class="audit-detail-value" style="color: #4b5563;">
                                    <strong>${deletedName}</strong> deleted
                                </span>
                            </div>
                        `;
                    } else if (change.operation === 'SOW_REMAP') {
                        const deletedName = change.deleted_entity_name || change.old || 'Stakeholder';
                        const migrationsList = (change.sow_migrations || []).map(mig => {
                            const sowName = mig.sow_name || mig.sow_id || 'SoW';
                            const targetBc = (mig.target && mig.target.bc_name) || 'Buying Center';
                            const targetSh = (mig.target && mig.target.entity_name) || 'Stakeholder';
                            return `<li style="font-size: 11px; margin-top: 3px; list-style-type: disc; margin-left: 15px;">
                                <strong>${sowName}</strong> remapped to Buying Center: <strong>${targetBc}</strong>, Stakeholder: <strong>${targetSh}</strong>
                            </li>`;
                        }).join('');

                        return `
                            <div class="audit-detail-row" style="flex-direction: column; align-items: flex-start;">
                                <span class="audit-detail-label">SOWs remapped for deleted stakeholder <strong>${deletedName}</strong>:</span>
                                <ul style="margin: 5px 0 0 0; padding: 0; width: 100%;">
                                    ${migrationsList}
                                </ul>
                            </div>
                        `;
                    } else {
                        const oldVal = (change.old || '').toString().trim();
                        const newVal = (change.new || '').toString().trim();
                        let fieldName = change.field || 'Field';
                        
                        // Format nice field names for display
                        if (fieldName === 'PARENT_KEY_STAKEHOLDER_ID' || fieldName === 'PARENT_KS_NAME') {
                            fieldName = 'Key Stakeholder mapping';
                        } else if (fieldName === 'KEY_DIRECTS') {
                            fieldName = 'Key Directs';
                        } else if (fieldName === 'STAKEHOLDER_STATUS') {
                            fieldName = 'Stakeholder Status';
                        } else if (fieldName === 'STAKEHOLDER_TYPE') {
                            fieldName = 'Stakeholder Type';
                        } else if (fieldName === 'STAKEHOLDER_NAME') {
                            fieldName = 'Stakeholder Name';
                        }

                        const displayOldVal = oldVal || '—';
                        const displayNewVal = newVal || '—';

                        const entityName = change.entity_name || change.deleted_entity_name || '';
                        const entityInfo = entityName ? ` (for <strong>${entityName}</strong>)` : '';

                        return `
                            <div class="audit-detail-row">
                                <span class="audit-detail-label">${fieldName}${entityInfo}:</span>
                                <span class="audit-detail-value" style="color: #4b5563;">
                                    changed from | <span style="color: #2985C1; font-weight: 500;">${displayOldVal}</span> 
                                    To <span style="color: #2985C1; font-weight: 500;">${displayNewVal}</span>
                                </span>
                            </div>
                        `;
                    }
                }).join('');

                detailHtml = `
                    <div class="audit-card-peach" style="display: none;">
                        ${rows}
                    </div>
                `;
            }

            let bcName = $("#searchBuyingCenter option:selected").text() || 'Unknown';
            const summary = log.summary || log.description || (isNote ? 'New Interaction Logged' : 'Information Updated');

            const canToggle = detailHtml && detailHtml.trim() !== '';
            const itemHtml = `
                <div class="audit-item">
                    <div class="audit-header ${canToggle ? 'can-toggle' : ''}">
                        <div class="audit-bullet_div"><i class="fa-solid fa-circle-dot"></i></div>
                        <div class="audit-header-content">
                            <span class="audit-header-main">Buying Center: ${bcName} - ${summary}</span>
                            <span class="audit-header-meta"> | ${log.actor_display_name || 'User'}, ${convertStringToLocalTimeAndAgo(log.created_at)}</span>
                        </div>
                        ${canToggle ? '<i class="fas fa-chevron-down audit-chevron"></i>' : ''}
                    </div>
                    ${detailHtml}
                </div>
            `;
            $container.append(itemHtml);
        });
    }

    $(document).on("click", ".audit-header.can-toggle", function (e) {
        const $item = $(this).closest(".audit-item");
        $item.toggleClass("expanded");
        $item.find(".audit-card-peach").slideToggle();
        $(this).find(".audit-chevron").toggleClass("fa-chevron-down fa-chevron-up");
    });

    // Audit Filter Logic
    $(document).on("change", "input[name='auditFilter']", function () {
        renderAuditTimeline(state.currentAuditLogs);
    });

    function resetForm() {
        if (quill) {
            quill.root.innerHTML = "";
        }
        if (nextStepsQuill) {
            nextStepsQuill.root.innerHTML = "";
        }
        $("#meetingDate").val("");
        $("#nextStepsEta").val("");
        $("#nextInteractionEta").val("");
        $("#searchStakeholder").val(""); // Clear datalist input
        $("input[name='interactionType']").prop("checked", false);
        $("input[name='nextInteractionType']").prop("checked", false);

        // Form default state: Next Steps active
        $("#nextStepsBtn").trigger('click');

        // validateSaveButton(); 
    }

    function convertToISO(str) {
        if (!str || !str.includes('-')) return str;
        let parts = str.split('-');
        if (parts.length !== 3) return str;

        let mm = parts[0];
        let dd = parts[1];
        let yy = parts[2];

        // Assume 20xx for any yy
        let yyyy = "20" + yy;

        return `${yyyy}-${mm}-${dd}`;
    }

    function convertStringToLocalTimeAndAgo(timeString) {
        if (!timeString) return "recently";
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

    function timeSince(dateStr) {
        if (!dateStr) return "recently";
        return convertStringToLocalTimeAndAgo(dateStr);
    }

    // Dropdown Population Logic
    function initDropdowns() {
        // No longer calling fetchAccountData here to avoid race conditions with trigger('change')
    }

    function fetchAccountData() {
        const department = localStorage.getItem("Department") || "CEO";
        const searchType = $("#searchType").val();
        console.log("fetchAccountData: reading searchType from #searchType:", searchType);

        if (!searchType || searchType === "") {
            console.log("fetchAccountData: No searchType selected, skipping fetch.");
            return;
        }

        const typeLower = (searchType || "").toLowerCase();
        const typeText = ($("#searchType option:selected").text() || "").toLowerCase();
        
        // Comprehensive check for lead/sow mode
        const isLead = (typeLower === 'lead' || typeLower === 'sow' || typeText === 'sow' || typeText === 'lead');
        state.isLeadMode = isLead; // Ensure state is in sync
        
        let endpoint = isLead ? '/get_sow_leads' : '/get_accounts_and_buying_centers';
        let payload = { 
            department: department, 
            emp_id: localStorage.getItem("EmpUserID") || ""
        };

        if (isLead) {
            console.log("fetchAccountData: mode is LEAD/SOW, using /get_sow_leads");
            payload.sow_stage = ["Signed", "Scout", "Lead", "Pre-Qualified", "Qualified", "Proposal", "Renewal"];
        } else {
            console.log("fetchAccountData: mode is Stakeholder, using /get_accounts_and_buying_centers");
        }

        // Show "Loading..." in the dropdown instead of global loader
        $("#searchAccount").empty().append('<option value="">Loading...</option>').trigger('change').prop('disabled', true);

        // Robust URL construction
        let baseUrl = (apiValue && apiValue.url) ? apiValue.url : "";
        const targetUrl = baseUrl ? baseUrl.replace('/app', endpoint) : endpoint;
        
        console.log("fetchAccountData: Triggering AJAX call:", {
            endpoint: endpoint,
            isLead: isLead,
            targetUrl: targetUrl,
            payload: payload
        });

        return $.ajax({
            url: targetUrl,
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function (response) {
                console.log(`fetchAccountData SUCCESS [${searchType}] - `, response)
                let data = [];
                if (Array.isArray(response)) {
                    data = response;
                } else if (response && response.data) {
                    data = response.data;
                } else if (response && response.Table) {
                    data = response.Table;
                }

                // Store in state
                state.dropdownHierarchy = data;
                populateDropdown("#searchAccount", data, "Search Account", "account_id", "account_name");
            },
            error: function () {
                console.warn(`Failed to fetch ${searchType} hierarchy.`);
            },
            complete: function () {
                // Dropdown will be re-populated and re-enabled in populateDropdown
            }
        });
    }

    function populateDropdown(selector, data, defaultText, idKey = "id", nameKey = "name") {
        const $el = $(selector);
        console.log(`[DEBUG] populateDropdown called for ${selector} with ${Array.isArray(data) ? data.length : 0} items. Calling function: ${new Error().stack.split('\n')[2].trim()}`);

        if ($el.is('select')) {
            // 1. Destroy Select2 first to allow clean DOM manipulation
            if ($el.data('select2')) {
                $el.select2('destroy');
            }

            // Force correct placeholder if mode is SOW
            let finalPlaceholder = defaultText;
            const currentType = ($("#searchType").val() || "").trim().toLowerCase();
            const currentTypeText = ($("#searchType option:selected").text() || "").trim().toLowerCase();
            const isLead = (currentType === 'lead' || currentType === 'sow' || currentTypeText === 'sow' || state.isLeadMode);
            
            if (isLead && selector === "#searchBuyingCenter" && defaultText === "Search Buying Center") {
                finalPlaceholder = "Search SOW";
            }

            $el.empty().append(`<option value="">${finalPlaceholder}</option>`);
            
            if (Array.isArray(data)) {
                console.log(`[DEBUG] populateDropdown: looping through ${data.length} items for ${selector}`);
                data.forEach((item, index) => {
                    // Try exact key, then uppercase, then fuzzy, then HARDCODED SOW match
                    let id = item[idKey] || item[idKey.toUpperCase()] || item.id || item.SOW_ID || item.sow_id || "";
                    let name = item[nameKey] || item[nameKey.toUpperCase()] || item.name || item.SOW_NAME || item.sow_name || "";
                    
                    if (index === 0) {
                        console.log(`[DEBUG] Item 0 structure:`, item);
                        console.log(`[DEBUG] Extracted id: "${id}", name: "${name}" using idKey: "${idKey}", nameKey: "${nameKey}"`);
                    }

                    if (!id) {
                        const idMatch = Object.keys(item).find(k => k.toLowerCase().includes('id'));
                        if (idMatch) id = item[idMatch];
                    }
                    if (!name) {
                        const nameMatch = Object.keys(item).find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('stakeholder'));
                        if (nameMatch) name = item[nameMatch];
                    }

                    if (id || name) {
                        $el.append($('<option>', { value: id, text: name }));
                    }
                });
            }

            console.log(`[CRITICAL] Dropdown ${selector} now contains ${$el.find('option').length} options.`);
            if ($el.find('option').length < 5) {
                console.log(`[CRITICAL] Options HTML: ${$el.html()}`);
            }
            // Add "Create Account" option for searchAccount dropdown
            if (selector === "#searchAccount") {
                $el.append(`<option value="Create Account" class="option_create_text">Create Account</option>`);
            }
            // Special handling for Creating options for Buying Centers
            if (selector === "#searchBuyingCenter") {
                const searchTypeVal = ($("#searchType").val() || "").trim().toLowerCase();
                const searchTypeText = ($("#searchType option:selected").text() || "").trim().toLowerCase();
                const isLead = (searchTypeVal === 'lead' || searchTypeVal === 'sow' || searchTypeText === 'sow' || state.isLeadMode);
                
                if (isLead) {
                    $el.append(`<option value="Create SOW" class="option_create_text">Create SOW</option>`);
                } else {
                    $el.append(`<option value="Create Buying Center" class="option_create_text">Create Buying Center</option>`);
                }
            }
            
            // Re-read finalPlaceholder for Select2 init
            const currentTypeFinal = ($("#searchType").val() || "").trim().toLowerCase();
            const currentTypeTextFinal = ($("#searchType option:selected").text() || "").trim().toLowerCase();
            const isLeadFinal = (currentTypeFinal === 'lead' || currentTypeFinal === 'sow' || currentTypeTextFinal === 'sow' || state.isLeadMode);
            let select2Placeholder = defaultText;
            if (isLeadFinal && selector === "#searchBuyingCenter") {
                select2Placeholder = "Search SOW";
            }

            // 3. Re-initialize Select2 with the new data and placeholder
            $el.select2({
                placeholder: select2Placeholder,
                allowClear: true,
                width: '100%'
            });

            $el.prop('disabled', false);
        } else if ($el.attr('list')) {
            // It's an input with a datalist
            const listId = $el.attr('list');
            const $list = $(`#${listId}`);
            $list.empty();
            if (Array.isArray(data)) {
                data.forEach(item => {
                    const name = item[nameKey] || item[nameKey.toUpperCase()] || item.name || item.STAKEHOLDER || "";
                    if (name) {
                        $list.append(`<option value="${name}">`);
                    }
                });
            }
        }
    }

    $("#searchType").on('change', function () {
        const type = ($(this).val() || "").trim().toLowerCase();
        state.isLeadMode = (type === 'lead' || type === 'sow');
        state.anchorDropdown = null; // Reset anchor when search type changes
        searchType = type; 
        console.log("Search Type changed to:", type, "isLeadMode:", state.isLeadMode);
        let $el = $("#searchStakeholder");

        // Always reset everything below when searchType changes
        state.dropdownHierarchy = []; // Clear current data to prevent stale selection
        $("#searchAccount").empty().append('<option value="">Search Account</option>').val("").trigger('change');
        
        const bcPlaceholder = (type === 'lead') ? "Search SOW" : "Search Buying Center";
        $("#searchBuyingCenter").empty().append(`<option value="">${bcPlaceholder}</option>`).val("").trigger('change');
        
        clearStakeholderDropdown();

        // Form elements to toggle visibility
        const $naWrapper = $("#naInteractionWrapper");
        const $naNextWrapper = $("#naNextInteractionWrapper");
        const $nextStepsSection = $(".next-steps-header-row, .next-steps-content");
        const $nextInteractionSection = $(".next-interaction-section");
        const $allDateFields = $(".date-field-inline");

        // Enable/disable searchAccount based on searchType selection
        if (type) {
            $("#searchAccount").prop('disabled', false);
            fetchAccountData();

            if (type === 'lead') {
                // SOW-Lead mode UI adjustments
                $naWrapper.show();
                $naNextWrapper.show();

                // Set default to N/A for Lead mode initially
                if (!$('input[name="interactionType"]:checked').val()) {
                    $('input[name="interactionType"][value="N/A"]').prop('checked', true);
                }
                if (!$('input[name="nextInteractionType"]:checked').val()) {
                    $('input[name="nextInteractionType"][value="N/A"]').prop('checked', true);
                }

                // Initial restricted state
                updateFormState(false);

                // Enable and Clear Stakeholder dropdown
                $el.val("").trigger('change').prop('disabled', true);
            } else {
                // Stakeholder mode UI adjustments
                $naWrapper.hide();
                $naNextWrapper.hide();
                if ($('input[name="interactionType"]:checked').val() === 'N/A') {
                    $('input[name="interactionType"][value="In Person"]').prop('checked', true).trigger('change');
                }
                if ($('input[name="nextInteractionType"]:checked').val() === 'N/A') {
                    $('input[name="nextInteractionType"][value="In Person"]').prop('checked', true).trigger('change');
                }

                // Show other sections
                $allDateFields.show();
                $nextStepsSection.show();
                $nextInteractionSection.show();
                $(".interaction-header-row").show();

                // Clear and disable until account is selected
                $el.val("").trigger('change').prop('disabled', true);
            }
        } else {
            $("#searchAccount").prop('disabled', true);
        }
    });

    // Refresh form state when interaction type changes (for Lead mode dynamic unlock)
    $(document).on('change', 'input[name="interactionType"]', function () {
        const isLead = $("#searchType").val() === 'lead';
        const bcSelected = $("#searchBuyingCenter").val() !== "";
        if (isLead && bcSelected) {
            updateFormState(true);
        }
    });

    function updateFormState(isEnabled) {
        const $panel = $("#notes-panel");
        const searchType = $("#searchType").val();

        // Enable/disable all form elements within the notes panel
        $panel.find('input, select, textarea, button').not('#cancelNoteBtn').each(function () {
            const $this = $(this);
            $this.prop('disabled', !isEnabled);
        });

        if (!isEnabled) {
            $panel.find('.toggle-btn').addClass('disabled').css('pointer-events', 'none');
            $panel.find('input, select, textarea, button').not('#cancelNoteBtn').prop('disabled', true);
            if (quill) quill.enable(false);
            if (nextStepsQuill) nextStepsQuill.enable(false);
        } else {
            $panel.find('.toggle-btn').removeClass('disabled').css('pointer-events', 'auto');

            const interaction = $('input[name="interactionType"]:checked').val();

            if (searchType === 'lead' && (interaction === 'N/A' || !interaction)) {
                // Restricted Lead mode: Only Detailed Notes is enabled/visible
                // Hide Next Steps, Next Interaction, and the Meeting Date for the lead
                $('#nextStepsContent, #nextStepsEtaWrapper').hide();
                if (nextStepsQuill) nextStepsQuill.enable(false);
                $('#nextStepsEta').prop('disabled', true);
                $(".next-steps-header-row").hide();
                $(".date-field-inline").hide();
                $(".interaction-header-row:first").show();
                $(".next-interaction-section").hide();

                // Enable only relevant base fields
                if (quill) quill.enable(true);
                // Keep Interaction Type radios enabled so user can unlock
                $('input[name="interactionType"]').prop('disabled', false);
                $("#updateNoteBtn").prop('disabled', false);
            } else {
                // Normal mode OR Lead mode "unlocked"
                $(".next-interaction-section, .next-steps-header-row").show();
                $(".date-field-inline").show();
                $(".interaction-header-row:first").show();

                // Enable all standard fields
                $panel.find('input, select, textarea, button').not('#cancelNoteBtn').prop('disabled', false);
                if (quill) quill.enable(true);

                // Respect Next Steps toggle
                const isNoNextSteps = $("#noNextStepsBtn").hasClass("active");
                if (isNoNextSteps) {
                    if (nextStepsQuill) nextStepsQuill.enable(false);
                    $('#nextStepsEta').prop('disabled', true);
                    $('#nextStepsContent, #nextStepsEtaWrapper').hide();
                } else {
                    if (nextStepsQuill) nextStepsQuill.enable(true);
                    $('#nextStepsEta').prop('disabled', false);
                    $('#nextStepsContent, #nextStepsEtaWrapper').show();
                }
            }
        }
    }

    $("#searchAccount").on('change', function () {
        if (state.isFiltering) return;
        state.isFiltering = true;

        const accountId = $(this).val();
        const $bcSelect = $("#searchBuyingCenter");
        const $shSelect = $("#searchStakeholder");
        
        // Direct detection with text fallback to ensure absolute sync with the UI
        const currentType = ($("#searchType").val() || "").trim().toLowerCase();
        const currentTypeText = ($("#searchType option:selected").text() || "").trim().toLowerCase();
        const isLeadMode = (currentType === 'lead' || currentType === 'sow' || currentTypeText === 'sow' || state.isLeadMode);
        state.isLeadMode = isLeadMode; 

        console.log("Account change triggered. AccountId:", accountId, "TypeVal:", currentType, "TypeText:", currentTypeText, "isLeadMode:", isLeadMode);

        // Reset children and anchor
        state.anchorDropdown = null;
        const bcPlaceholder = isLeadMode ? "Search SOW" : "Search Buying Center";
        $bcSelect.empty().append(`<option value="">${bcPlaceholder}</option>`).prop('disabled', true).val("").trigger('change.select2');
        clearStakeholderDropdown();

        updateFormState(false);

        // Check if "Create Account" is selected
        if (accountId === "Create Account") {
            const currentMode = isLeadMode ? "SOW" : "BC";
            window.open(`accountCreation.html?from=notesLog&mode=${currentMode}`, "_blank");
            state.isFiltering = false;
            $(this).val('').trigger('change.select2');
            return;
        }

        if (accountId) {
            console.log("Looking for accountId:", accountId, "in hierarchy of size:", state.dropdownHierarchy.length);
            let accountData = state.dropdownHierarchy.find(a => (a.account_id || a.ACCOUNT_ID) == accountId);
            
            if (!accountData) {
                console.warn("Account not found by ID. Trying by name fallback...");
                accountData = state.dropdownHierarchy.find(a => (a.account_name || a.ACCOUNT_NAME) == accountId);
            }

            console.log("Final accountData:", accountData);

            if (isLeadMode) {
                // For Lead search, "Buying Center" dropdown shows SOWs
                console.log("[DEBUG] isLeadMode is TRUE. Processing SOW data...");
                const bcs = accountData ? (accountData.sow_data || accountData.SOW_DATA || accountData.sows || []) : [];
                console.log(`[DEBUG] Account ${accountId} found. sow_data count: ${bcs.length}`);
                
                if (bcs.length === 0 && accountData) {
                    console.warn("[DEBUG] sow_data is empty! Available keys:", Object.keys(accountData));
                }

                populateDropdown("#searchBuyingCenter", bcs, "Search SOW", "SOW_ID", "SOW_NAME");

                // Populate and Enable Stakeholder dropdown
                const allStakeholders = getAllStakeholdersForAccount(accountData);
                console.log(`[DEBUG] Found ${allStakeholders.length} total stakeholders for SOW mode`);
                populateDropdown("#searchStakeholder", allStakeholders, "Search Stakeholder");
                $shSelect.prop('disabled', false).val("").trigger('change');
            } else {
                const bcs = accountData ? (accountData.buying_centers || accountData.BUYING_CENTERS || []) : [];
                console.log("Stakeholder mode BCs (bcs):", bcs);
                populateDropdown("#searchBuyingCenter", bcs, "Search Buying Center", "bc_id", "bc_name");

                // Populate and enable Stakeholder dropdown with ALL stakeholders for this account
                const allStakeholders = getAllStakeholdersForAccount(accountData);
                populateDropdown("#searchStakeholder", allStakeholders, "Search Stakeholder");
                $shSelect.prop('disabled', false).val("").trigger('change');
            }
            $bcSelect.prop('disabled', false).val("").trigger('change');
        }
        state.isFiltering = false;
    });

    function extractNames(val) {
        if (!val) return [];
        if (typeof val === 'string') {
            const trimmed = val.trim();
            return trimmed ? [trimmed] : [];
        }
        if (Array.isArray(val)) {
            let names = [];
            val.forEach(item => {
                names = names.concat(extractNames(item));
            });
            return names;
        }
        if (typeof val === 'object') {
            const name = val.name || val.STAKEHOLDER || val.stakeholder || val.id || "";
            if (typeof name === 'string') {
                const trimmed = name.trim();
                return trimmed ? [trimmed] : [];
            }
        }
        return [];
    }

    function getAllStakeholdersForAccount(accountData) {
        if (!accountData) return [];
        const currentType = ($("#searchType").val() || "").trim().toLowerCase();
        const currentTypeText = ($("#searchType option:selected").text() || "").trim().toLowerCase();
        const isLeadMode = (currentType === 'lead' || currentType === 'sow' || currentTypeText === 'sow' || state.isLeadMode);

        const stakeholders = [];
        const seenNames = new Set();

        const addUnique = (name) => {
            if (name && !seenNames.has(name)) {
                seenNames.add(name);
                stakeholders.push({ id: name, name: name });
            }
        };

        if (isLeadMode) {
            // SOW Mode: Only show primary NPS stakeholders
            const sows = accountData.sow_data || [];
            sows.forEach(sow => {
                extractNames(sow.NPS_STAKEHOLDER).forEach(addUnique);
                extractNames(sow.NPS_STAKE_HOLDER).forEach(addUnique);
            });
        } else {
            // Stakeholder Mode: Show all stakeholders from Buying Centers and SOWs
            const bcs = accountData.buying_centers || accountData.BUYING_CENTERS || [];
            const sows = accountData.sow_data || [];

            bcs.forEach(bcData => {
                extractNames(bcData.superboss).forEach(addUnique);
                extractNames(bcData.key_stakeholders).forEach(addUnique);
                extractNames(bcData.stakeholders).forEach(addUnique);
            });

            sows.forEach(sow => {
                extractNames(sow.NPS_STAKEHOLDER).forEach(addUnique);
                extractNames(sow.NPS_STAKE_HOLDER).forEach(addUnique);
                extractNames(sow.STAKEHOLDER).forEach(addUnique);
                
                if (Array.isArray(sow.BUYING_CENTER_DATA)) {
                    sow.BUYING_CENTER_DATA.forEach(bc => {
                        extractNames(bc.superboss).forEach(addUnique);
                        extractNames(bc.key_stakeholders).forEach(addUnique);
                        extractNames(bc.stakeholders).forEach(addUnique);
                    });
                }
            });
        }

        return stakeholders;
    }

    /**
     * Helper to check if a stakeholder belongs to an SOW
     */
    function isStakeholderInSOW(sow, shName) {
        if (!sow || !shName) return false;
        const shNameLower = shName.toLowerCase();
        const match = (val) => (val && val.toLowerCase() === shNameLower);

        const currentType = ($("#searchType").val() || "").trim().toLowerCase();
        const currentTypeText = ($("#searchType option:selected").text() || "").trim().toLowerCase();
        const isLeadMode = (currentType === 'lead' || currentType === 'sow' || currentTypeText === 'sow' || state.isLeadMode);

        // Primary checks (always checked)
        if (extractNames(sow.NPS_STAKEHOLDER).some(match) || extractNames(sow.NPS_STAKE_HOLDER).some(match)) return true;

        if (isLeadMode) {
            // In SOW mode, we ONLY match by primary NPS stakeholder
            return false;
        }

        // Stakeholder mode: use broader matching
        if (extractNames(sow.STAKEHOLDER).some(match)) return true;

        if (Array.isArray(sow.BUYING_CENTER_DATA)) {
            return sow.BUYING_CENTER_DATA.some(bc => {
                const names = getStakeholdersForBC(bc).map(s => s.name);
                return names.some(name => match(name));
            });
        }
        return false;
    }

    // When BC selection changes
    $("#searchBuyingCenter").on('select2:select select2:unselect select2:clear change', function (e) {
        if (state.isFiltering) return;
        
        const bcName = $(this).val();
        const accountId = $("#searchAccount").val();
        const $sh = $("#searchStakeholder");
        const currentType = ($("#searchType").val() || "").trim().toLowerCase();
        const currentTypeText = ($("#searchType option:selected").text() || "").trim().toLowerCase();
        const isLeadMode = (currentType === 'lead' || currentType === 'sow' || currentTypeText === 'sow' || state.isLeadMode);
        state.isLeadMode = isLeadMode; 

        if (bcName === "Create Buying Center" || bcName === "Create SOW") {
            handleCreateOption(bcName, accountId);
            return;
        }

        if (bcName) {
            // Set anchor if not already set
            const shVal = $sh.val();
            if (!state.anchorDropdown && !shVal) {
                state.anchorDropdown = 'bc';
                console.log("Anchor set to BC:", bcName);
            }

            state.isFiltering = true;
            const accountData = state.dropdownHierarchy.find(a => (a.account_id || a.ACCOUNT_ID) == accountId);
            if (accountData) {
                if (isLeadMode) {
                    const sowData = accountData.sow_data.find(s => s.SOW_ID === bcName || s.SOW_NAME === bcName);
                    if (sowData) {
                        // Extract specific stakeholders for THIS SOW
                        let sowStakeholders = [];
                        let seen = new Set();
                        
                        const addUnique = (name) => {
                            if (name && !seen.has(name)) {
                                seen.add(name);
                                sowStakeholders.push({ id: name, name: name });
                            }
                        };

                        // Use the full account list but filter by SOW membership
                        const allAccountStakeholders = getAllStakeholdersForAccount(accountData);
                        sowStakeholders = allAccountStakeholders.filter(sh => isStakeholderInSOW(sowData, sh.name));

                        // Filter the stakeholder dropdown
                        populateDropdown("#searchStakeholder", sowStakeholders, "Search Stakeholder");
                        
                        // Auto-select primary if only one or if explicitly set
                        if (sowData.NPS_STAKEHOLDER) {
                            $sh.val(sowData.NPS_STAKEHOLDER).trigger('change');
                        } else if (sowStakeholders.length === 1) {
                            $sh.val(sowStakeholders[0].id).trigger('change');
                        }
                    } else {
                        // SOW cleared, restore all account stakeholders
                        const allStakeholders = getAllStakeholdersForAccount(accountData);
                        populateDropdown("#searchStakeholder", allStakeholders, "Search Stakeholder");
                    }
                } else if (state.anchorDropdown !== 'sh') {
                    const bcs = accountData.buying_centers || accountData.BUYING_CENTERS || [];
                    const bcData = bcs.find(d => d.bc_id === bcName || d.bc_name === bcName || d.BUYING_CENTRE === bcName);
                    if (bcData) {
                        const bcStakeholders = getStakeholdersForBC(bcData);
                        const currentSh = $sh.val();
                        populateDropdown("#searchStakeholder", bcStakeholders, "Search Stakeholder");
                        if (currentSh && !bcStakeholders.some(s => s.id === currentSh)) {
                            $sh.val("").trigger('change');
                        } else if (currentSh) {
                            $sh.val(currentSh).trigger('change');
                        } else if (bcStakeholders.length === 1) {
                            // Auto-select the only stakeholder option
                            $sh.val(bcStakeholders[0].id).trigger('change');
                        }
                    }
                }
            }
            state.isFiltering = false;
        } else {
            // BC cleared
            console.log("[DEBUG] BC Cleared. Previous anchor:", state.anchorDropdown);
            state.anchorDropdown = $sh.val() ? 'sh' : null;
            console.log("[DEBUG] New anchor:", state.anchorDropdown);

            if (accountId) {
                state.isFiltering = true;
                const accountData = state.dropdownHierarchy.find(a => (a.account_id || a.ACCOUNT_ID) == accountId);
                
                if (accountData) {
                    if (state.anchorDropdown === 'sh') {
                        // RE-FILTER BC list based on remaining Stakeholder
                        const shName = $sh.val();
                        console.log(`[DEBUG] Re-filtering BC list by Stakeholder: ${shName}`);
                        if (isLeadMode) {
                            const filteredSows = accountData.sow_data.filter(sow => isStakeholderInSOW(sow, shName));
                            populateDropdown("#searchBuyingCenter", filteredSows, "Search SOW", "SOW_ID", "SOW_NAME");
                        } else {
                            const bcs = accountData.buying_centers || accountData.BUYING_CENTERS || [];
                            const matchingBCs = bcs.filter(bc => {
                                const shs = getStakeholdersForBC(bc);
                                return shs.some(s => s.id === shName);
                            });
                            populateDropdown("#searchBuyingCenter", matchingBCs, "Search Buying Center", "bc_id", "bc_name");
                        }
                        $(this).val(""); // Keep cleared
                    } else {
                        // BOTH CLEARED - Restore everything for the account
                        console.log("[DEBUG] Both cleared. Restoring full lists.");
                        const allSh = getAllStakeholdersForAccount(accountData);
                        populateDropdown("#searchStakeholder", allSh, "Search Stakeholder");
                        
                        if (isLeadMode) {
                            const bcs = accountData.sow_data || accountData.SOW_DATA || accountData.sows || [];
                            populateDropdown("#searchBuyingCenter", bcs, "Search SOW", "SOW_ID", "SOW_NAME");
                        } else {
                            const bcs = accountData.buying_centers || accountData.BUYING_CENTERS || [];
                            populateDropdown("#searchBuyingCenter", bcs, "Search Buying Center", "bc_id", "bc_name");
                        }
                        $sh.val("").trigger('change.select2');
                        $(this).val("").trigger('change.select2');
                    }
                }
                state.isFiltering = false;
            }
        }

        checkAndActivateForm();
        fetchAuditLogs();
    });

    // When BC dropdown is opening, show ALL options for the account ONLY if no stakeholder is selected
    $("#searchBuyingCenter").on('select2:opening', function() {
        if (state.isFiltering) return;
        const accountId = $("#searchAccount").val();
        if (!accountId) return;

        // Only repopulate with full list if no stakeholder is selected
        const shSelected = $("#searchStakeholder").val();
        if (!shSelected) {
            state.isFiltering = true;
            const accountData = state.dropdownHierarchy.find(a => (a.account_id || a.ACCOUNT_ID) == accountId);
            const searchType = $("#searchType").val();
            const currentVal = $(this).val();

            if (searchType === 'lead') {
                const bcs = accountData ? (accountData.sow_data || []) : [];
                populateDropdown("#searchBuyingCenter", bcs, "Search SOW (Lead)", "SOW_ID", "SOW_NAME");
            } else {
                const bcs = accountData ? (accountData.buying_centers || accountData.BUYING_CENTERS || []) : [];
                populateDropdown("#searchBuyingCenter", bcs, "Search Buying Center", "bc_id", "bc_name");
            }
            $(this).val(currentVal); // Keep current selection
            state.isFiltering = false;
        }
    });

    function getStakeholdersForBC(bcData) {
        const stakeholders = [];
        const seenNames = new Set();
        const addUnique = (name) => {
            if (name && !seenNames.has(name)) {
                seenNames.add(name);
                stakeholders.push({ id: name, name: name });
            }
        };
        
        if (bcData) {
            extractNames(bcData.superboss).forEach(addUnique);
            extractNames(bcData.key_stakeholders).forEach(addUnique);
            extractNames(bcData.stakeholders).forEach(addUnique);
        }
        return stakeholders;
    }

    // Robust Stakeholder change handler
    function onStakeholderChange() {
        if (state.isFiltering) return;
        
        const $sh = $("#searchStakeholder");
        const shName = $sh.val();
        const accountId = $("#searchAccount").val();
        const $bc = $("#searchBuyingCenter");
        const searchType = $("#searchType").val();

        if (shName && accountId) {
            const currentType = ($("#searchType").val() || "").trim().toLowerCase();
            const currentTypeText = ($("#searchType option:selected").text() || "").trim().toLowerCase();
            const isLeadMode = (currentType === 'lead' || currentType === 'sow' || currentTypeText === 'sow' || state.isLeadMode);

            // Set anchor if not already set
            if (!state.anchorDropdown && !$bc.val()) {
                state.anchorDropdown = 'sh';
                console.log("Anchor set to Stakeholder:", shName);
            }

            if (state.anchorDropdown !== 'bc') {
                state.isFiltering = true;
                const accountData = state.dropdownHierarchy.find(a => (a.account_id || a.ACCOUNT_ID) == accountId);
                if (accountData) {
                    if (isLeadMode) {
                        // Filter SOWs for this stakeholder
                        const filteredSows = accountData.sow_data.filter(sow => isStakeholderInSOW(sow, shName));

                        const currentSOW = $bc.val();
                        populateDropdown("#searchBuyingCenter", filteredSows, "Search SOW", "SOW_ID", "SOW_NAME");
                        
                        if (currentSOW && !filteredSows.some(s => (s.SOW_ID === currentSOW || s.SOW_NAME === currentSOW))) {
                            $bc.val("").trigger('change');
                        } else if (currentSOW) {
                            $bc.val(currentSOW).trigger('change.select2');
                        } else if (filteredSows.length === 1) {
                            $bc.val(filteredSows[0].SOW_ID || filteredSows[0].SOW_NAME).trigger('change');
                        }
                    } else {
                        const bcs = accountData.buying_centers || accountData.BUYING_CENTERS || [];
                        const matchingBCs = bcs.filter(bc => {
                            const shs = getStakeholdersForBC(bc);
                            return shs.some(s => s.id === shName);
                        });

                        const currentBC = $bc.val();
                        populateDropdown("#searchBuyingCenter", matchingBCs, "Search Buying Center", "bc_id", "bc_name");
                        
                        if (currentBC && !matchingBCs.some(b => (b.bc_id || b.bc_name || b.BUYING_CENTRE) === currentBC)) {
                            $bc.val("").trigger('change');
                        } else if (currentBC) {
                            $bc.val(currentBC).trigger('change.select2');
                        } else if (matchingBCs.length === 1) {
                            // Auto-select the only BC/SOW option
                            $bc.val(matchingBCs[0].bc_id || matchingBCs[0].bc_name || matchingBCs[0].BUYING_CENTRE).trigger('change');
                        }
                    }
                }
                state.isFiltering = false;
            }
        } else {
            // Stakeholder cleared
            console.log("[DEBUG] Stakeholder Cleared. Previous anchor:", state.anchorDropdown);
            state.anchorDropdown = $bc.val() ? 'bc' : null;
            console.log("[DEBUG] New anchor:", state.anchorDropdown);

            if (accountId) {
                state.isFiltering = true;
                const accountData = state.dropdownHierarchy.find(a => (a.account_id || a.ACCOUNT_ID) == accountId);
                const currentType = ($("#searchType").val() || "").trim().toLowerCase();
                const currentTypeText = ($("#searchType option:selected").text() || "").trim().toLowerCase();
                const isLeadMode = (currentType === 'lead' || currentType === 'sow' || currentTypeText === 'sow' || state.isLeadMode === true);

                if (accountData) {
                    if (state.anchorDropdown === 'bc') {
                        // RE-FILTER Stakeholder list based on remaining SOW/BC
                        const bcName = $bc.val();
                        console.log(`[DEBUG] Re-filtering Stakeholder list by BC: ${bcName}`);
                        if (isLeadMode) {
                            const sowData = accountData.sow_data.find(s => s.SOW_ID === bcName || s.SOW_NAME === bcName);
                            if (sowData) {
                                const allAccountStakeholders = getAllStakeholdersForAccount(accountData);
                                const sowStakeholders = allAccountStakeholders.filter(sh => isStakeholderInSOW(sowData, sh.name));
                                populateDropdown("#searchStakeholder", sowStakeholders, "Search Stakeholder");
                            }
                        } else {
                            const bcs = accountData.buying_centers || accountData.BUYING_CENTERS || [];
                            const bcData = bcs.find(d => d.bc_id === bcName || d.bc_name === bcName || d.BUYING_CENTRE === bcName);
                            if (bcData) {
                                const bcStakeholders = getStakeholdersForBC(bcData);
                                populateDropdown("#searchStakeholder", bcStakeholders, "Search Stakeholder");
                            }
                        }
                        $sh.val(""); // Keep cleared
                    } else {
                        // BOTH CLEARED - Restore everything
                        console.log("[DEBUG] Both cleared. Restoring full lists.");
                        const allSh = getAllStakeholdersForAccount(accountData);
                        populateDropdown("#searchStakeholder", allSh, "Search Stakeholder");
                        if (isLeadMode) {
                            const allSows = accountData.sow_data || accountData.SOW_DATA || accountData.sows || [];
                            populateDropdown("#searchBuyingCenter", allSows, "Search SOW", "SOW_ID", "SOW_NAME");
                        } else {
                            const bcs = accountData.buying_centers || accountData.BUYING_CENTERS || [];
                            populateDropdown("#searchBuyingCenter", bcs, "Search Buying Center", "bc_id", "bc_name");
                        }
                        $bc.val("").trigger('change.select2');
                        $sh.val("").trigger('change.select2');
                    }
                }
                state.isFiltering = false;
            }
        }

        checkAndActivateForm();
        fetchAuditLogs();
    }

    $(document).on('change select2:select select2:unselect select2:clear', '#searchStakeholder', onStakeholderChange);

    // When Stakeholder dropdown is opening, show ALL options for the account ONLY if no buying center is selected
    $(document).on('select2:opening', '#searchStakeholder', function() {
        if (state.isFiltering) return;
        const accountId = $("#searchAccount").val();
        if (!accountId) return;

        // Only repopulate with full list if no buying center is selected
        const bcSelected = $("#searchBuyingCenter").val();
        if (!bcSelected) {
            state.isFiltering = true;
            const accountData = state.dropdownHierarchy.find(a => (a.account_id || a.ACCOUNT_ID) == accountId);
            const searchType = $("#searchType").val();
            const currentVal = $(this).val();

            const currentTypeText = ($("#searchType option:selected").text() || "").trim().toLowerCase();
            const isLeadMode = (searchType === 'lead' || searchType === 'sow' || currentTypeText === 'sow' || state.isLeadMode);
            
            const allSh = getAllStakeholdersForAccount(accountData);
            populateDropdown("#searchStakeholder", allSh, "Search Stakeholder");
            $(this).val(currentVal); // Keep current selection
            state.isFiltering = false;
        }
    });

    function checkAndActivateForm() {
        const bcSelected = $("#searchBuyingCenter").val() !== "";
        const shSelected = $("#searchStakeholder").val() !== "";
        const isLead = $("#searchType").val() === 'lead';

        if (bcSelected && shSelected) {
            updateFormState(true);
        } else {
            updateFormState(false);
        }
    }

    function handleCreateOption(bcName, accountId) {
        const accountData = state.dropdownHierarchy.find(a => (a.account_id || a.ACCOUNT_ID) == accountId);
        if (accountData) {
            const accountName = accountData.account_name || accountData.ACCOUNT_NAME || "";
            const accId = accountData.account_id || accountData.ACCOUNT_ID || "";
            if (bcName === "Create Buying Center") {
                window.open('buyingCenterDetails.html?accountName=' + encodeURIComponent(accountName) + '&accountId=' + accId + '&action=new&redirect=notesLog', '_blank');
            } else {
                window.open(`sowCreate.html?accountName=${encodeURIComponent(accountName)}&accountId=${accId}&from=notesLog`, '_blank');
            }
        }
        $("#searchBuyingCenter").val('').trigger('change.select2');
    }

    $("#buyingCenterBackBtnCustm").on('click', function () {
        window.history.back();
    });

    initDropdowns();
    // Always trigger change on load to ensure correct API is called based on initial/remembered selection
    const initialType = $("#searchType").val();
    if (initialType) {
        $("#searchType").trigger('change');
    } else {
        // Just reset form if no type selected
        updateFormState(false);
    }

    // Global function to be called from popup window after creating a new Buying Center/SOW
    window.toRefreshBuyingCenterDropdown = function (newBuyingCenter, newStakeholder, newAccountName) {
        console.log("Auto-selecting newly created Buying Center:", newBuyingCenter, newStakeholder, newAccountName);
        
        // Use fetchAccountData to ensure we get the latest data via the standard flow
        fetchAccountData().then(function(response) {
            let data = Array.isArray(response) ? response : (response.data || response.Table || []);
            
            if (newAccountName) {
                // The dropdown values might be actual account names, try selecting by name
                $("#searchAccount").val(newAccountName);
                
                // If it failed to select (val is null), we may need to match it by searching the options
                if (!$("#searchAccount").val()) {
                    let foundAcc = false;
                    $("#searchAccount option").each(function() {
                        if ($(this).text().toUpperCase() === newAccountName.toUpperCase() || $(this).val() === newAccountName) {
                            $("#searchAccount").val($(this).val());
                            foundAcc = true;
                        }
                    });

                    // If the account option hasn't been generated yet (because we avoid fully rebuilding the dropdown), add it manually
                    if (!foundAcc) {
                        let newAccountId = newAccountName; // Fallback
                        let matchedAcc = data.find(a => (a.account_name || a.ACCOUNT_NAME || "").toUpperCase() === newAccountName.toUpperCase());
                        if (matchedAcc) {
                            newAccountId = matchedAcc.account_id || matchedAcc.ACCOUNT_ID || newAccountName;
                        }
                        
                        // Insert it BEFORE the "Create Account" option so it doesn't appear at the very bottom
                        const createAccOpt = $("#searchAccount option").filter(function() { return $(this).text() === "Create Account"; });
                        if (createAccOpt.length > 0) {
                            $(new Option(newAccountName, newAccountId, false, false)).insertBefore(createAccOpt);
                        } else {
                            $("#searchAccount").append(new Option(newAccountName, newAccountId, false, false));
                        }
                        $("#searchAccount").val(newAccountId);
                    }
                }
                
                // Update Select2 UI so it accurately reflects the selected account
                $("#searchAccount").trigger('change.select2');
            }
            
            // Re-trigger account change to rebuild BC and Stakeholder dropdowns based on the selected account
            $("#searchAccount").trigger('change');
            
            setTimeout(() => {
                if (newBuyingCenter) {
                    // Force the dropdown to be enabled
                    $("#searchBuyingCenter").prop('disabled', false);
                    
                    // If the API hasn't returned the new Buying Center yet, manually add it
                    let foundBc = false;
                    $("#searchBuyingCenter option").each(function() {
                        if ($(this).text().toUpperCase() === newBuyingCenter.toUpperCase() || $(this).val() === newBuyingCenter) {
                            foundBc = true;
                        }
                    });
                    if (!foundBc) {
                        $("#searchBuyingCenter").append(new Option(newBuyingCenter, newBuyingCenter, false, false));
                    }

                    $("#searchBuyingCenter").val(newBuyingCenter);
                    if (!$("#searchBuyingCenter").val()) {
                        $("#searchBuyingCenter option").each(function() {
                            if ($(this).text().toUpperCase() === newBuyingCenter.toUpperCase()) {
                                $("#searchBuyingCenter").val($(this).val());
                            }
                        });
                    }
                    $("#searchBuyingCenter").trigger('change');
                }
                
                if (newStakeholder) {
                    setTimeout(() => {
                        // Force the dropdown to be enabled
                        $("#searchStakeholder").prop('disabled', false);

                        // If the API hasn't returned the new Stakeholder yet, manually add it
                        let foundSh = false;
                        $("#searchStakeholder option").each(function() {
                            if ($(this).text().toUpperCase() === newStakeholder.toUpperCase() || $(this).val() === newStakeholder) {
                                foundSh = true;
                            }
                        });
                        if (!foundSh) {
                            $("#searchStakeholder").append(new Option(newStakeholder, newStakeholder, false, false));
                        }

                        $("#searchStakeholder").val(newStakeholder);
                        if (!$("#searchStakeholder").val()) {
                            $("#searchStakeholder option").each(function() {
                                if ($(this).text().toUpperCase() === newStakeholder.toUpperCase()) {
                                    $("#searchStakeholder").val($(this).val());
                                }
                            });
                        }
                        $("#searchStakeholder").trigger('change');
                    }, 100);
                }
            }, 500);
        });
    };
});

function clearStakeholderDropdown() {
    const $sh = $("#searchStakeholder");
    const isSelect2 = $sh.data('select2');
    const searchType = $("#searchType").val();

    if (isSelect2) {
        $sh.select2("val", "");
        $sh.empty().append('<option value="">Search Stakeholder</option>');
    } else {
        $sh.val("");
        const listId = $sh.attr('list');
        if (listId) $(`#${listId}`).empty();
    }

    $sh.prop('disabled', true);
    // Explicitly trigger change after clearing
    $sh.trigger('change');
}

function goBack() {
    window.history.back();
}
