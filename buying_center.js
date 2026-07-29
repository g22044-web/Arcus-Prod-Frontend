// --- STATE MANAGEMENT ---
let state = {
  view: "list", // 'list', 'create', 'edit'
  editId: null,
  items: [],
  flashId: null,
  sortConfig: { key: "bcName", direction: "asc" },
  urlParams: null, // Store parsed URL parameters
  filteredAccount: null, // Account to filter by in view-edit mode
  employeeList: [], // Combined list of all employees
  growthList: [], // Growth department employees
  deliveryList: [], // Delivery department employees
  clientList: [], // Client department employees
  techList: [], // Tech department employees
  existingBuyingCenters: [], // Store existing buying centers for duplicate validation
  initialTab: null, // Tab to open by default in form view
  isReadOnly: false, // Whether the form is in read-only mode
  isStakeholderLocked: false, // Whether the stakeholder selection in Notes is locked
};
var quill;
var nextStepsQuill;
window.deletedEntitiesMap = [];



// --- URL PARAMETER PARSING ---
function parseUrlParameters() {
  const search = window.location.search;
  if (!search || search.length <= 1) return null;

  const urlParams = new URLSearchParams(search);
  const accountName = urlParams.get('accountName');
  const accountId = urlParams.get('accountId');
  const action = urlParams.get('action');
  const buyingCenter = urlParams.get('buyingCenter');
  const npsStakeholder = urlParams.get('npsStakeholder');
  const redirect = urlParams.get('redirect');
  const from = urlParams.get('from');
  const showAudit = urlParams.get('showAudit') === 'true';
  const defaultTab = urlParams.get('defaultTab');
  const mode = urlParams.get('mode');

  const buyingCenterId = urlParams.get('buyingCenterId');

  if (!accountName) return null;
  if (!action && from !== 'engagement') return null;
  return {
    accountName: decodeURIComponent(accountName),
    accountId: accountId,
    action: action,
    buyingCenter: buyingCenter ? decodeURIComponent(buyingCenter) : null,
    buyingCenterId: buyingCenterId ? decodeURIComponent(buyingCenterId) : null,
    npsStakeholder: npsStakeholder ? decodeURIComponent(npsStakeholder) : null,
    redirect: redirect,
    from: from,
    mode: mode,
    showAudit: showAudit,
    defaultTab: defaultTab
  };
}

// --- HELPERS ---
const money = (n) => (n == null ? "—" : `$${(n / 1_000_000).toFixed(2)}M`);
function convertStringToLocalTimeAndAgo(timeString) {
  if (!timeString) return "—";
  // Replace the space between date and time with 'T' to make it ISO-compliant
  const isoString = timeString.replace(" ", "T") + "Z"; // Add 'Z' to treat it as UTC
  // Parse the UTC date string into a Date object
  const utcDate = new Date(isoString);

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
const cryptoRandomId = () => {
  try {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return Math.random().toString(36).slice(2);
  }
};

// --- PRIZE VALIDATION HELPERS ---
const PRIZE_REGEX = /^\$?(\d{1,3}(,\d{3})*|\d+)(\.\d+)?$/;

function validatePrizeInput(value) {
  if (!value || value.trim() === "") return true; // Empty is valid
  return PRIZE_REGEX.test(value.trim());
}

// --- DUPLICATE VALIDATION HELPERS ---
function checkDuplicateBuyingCenter(bcName, accountId, isEdit = false, editId = null) {
  if (!bcName || !bcName.trim()) return false;

  const trimmedBcName = bcName.trim().toLowerCase();

  // For editing, we need to get the original name of the item being edited
  let originalBcName = "";
  if (isEdit && editId) {
    const currentItem = state.items.find(item => item.id === editId);
    if (currentItem) {
      originalBcName = currentItem.bcName ? currentItem.bcName.trim().toLowerCase() : "";
    }
  }

  // Check against existing buying centers from API
  if (state.existingBuyingCenters && state.existingBuyingCenters.length > 0) {
    const duplicate = state.existingBuyingCenters.some(existingBc => {
      const trimmedExistingBc = existingBc.toLowerCase();
      // If editing and this is the original name, allow it
      if (isEdit && trimmedExistingBc === originalBcName) {
        return false;
      }
      return trimmedExistingBc === trimmedBcName;
    });

    if (duplicate) {
      return true; // Duplicate found
    }
  }

  // Also check against local items (for items not yet saved to API)
  const duplicateInLocal = state.items.some(item => {
    // Skip the current item if we're editing
    if (isEdit && item.id === editId) {
      return false;
    }

    return item.bcName && item.bcName.trim().toLowerCase() === trimmedBcName;
  });

  return duplicateInLocal;
}

function formatPrizeInput(value) {
  if (!value || value.trim() === "") return "";

  // Remove any existing formatting
  let cleanValue = value.replace(/[$,]/g, "");

  // Check if it's a valid number
  if (isNaN(cleanValue)) return value; // Return original if not a number

  // Format with commas for thousands
  const parts = cleanValue.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.length > 1 ? parts.join(".") : parts[0];
}

function parsePrizeValue(value) {
  if (!value || value.trim() === "") return undefined;

  // Remove commas and dollar signs for parsing
  const cleanValue = value.replace(/[$,]/g, "");

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? undefined : parsed;
}

// --- EMPLOYEE DROPDOWN POPULATION ---
function populateEmployeeDropdown(selectId, selectedValue) {
  const $select = $(`#${selectId}`);
  $select.empty();

  // Handle both string and object selectedValue
  let actualSelectedValue = "";
  if (typeof selectedValue === "object" && selectedValue !== null) {
    actualSelectedValue = selectedValue.name || "";
  } else {
    actualSelectedValue = selectedValue || "";
  }

  // Determine the appropriate placeholder and employee list based on selectId
  let placeholderText = "Select Employee";
  let employeeListToUse = state.employeeList; // Default fallback

  switch (selectId) {
    case "fsGrowthPartner":
      placeholderText = "Select Growth Partner";
      employeeListToUse = state.growthList.length > 0 ? state.growthList : state.employeeList;
      break;
    case "fsClientPartner":
      placeholderText = "Select Client Partner";
      employeeListToUse = state.clientList.length > 0 ? state.clientList : state.employeeList;
      break;
    case "fsDeliveryPartner":
      placeholderText = "Select Delivery Partner";
      employeeListToUse = state.deliveryList.length > 0 ? state.deliveryList : state.employeeList;
      break;
    case "smePartnerTech":
      placeholderText = "Select SME Partner - Tech";
      employeeListToUse = state.techList.length > 0 ? state.techList : state.employeeList;
      break;
  }

  // Add default option with appropriate placeholder
  $select.append(`<option value="">${placeholderText}</option>`);

  // Add employee options
  employeeListToUse.forEach(emp => {
    const option = `<option value="${emp.EMPLOYEE_NAME}" ${emp.EMPLOYEE_NAME === actualSelectedValue ? 'selected' : ''}>${emp.EMPLOYEE_NAME}</option>`;
    $select.append(option);
  });

  // If selectedValue is not empty and not in the list, add it as an option
  if (actualSelectedValue && !employeeListToUse.some(emp => emp.EMPLOYEE_NAME === actualSelectedValue)) {
    const option = `<option value="${actualSelectedValue}" selected>${actualSelectedValue}</option>`;
    $select.append(option);
  }
}

// --- STAKEHOLDERS DROPDOWN POPULATION ---
function populateStakeholdersDropdown(selectId, selectedStakeholders = [], currentStakeholders = []) {
  const $select = $(`#${selectId}`);
  $select.empty();

  // Add placeholder option
  $select.append('<option value="">Select stakeholders</option>');

  // Use provided stakeholders or get from form data
  const stakeholdersToUse = currentStakeholders.length > 0 ? currentStakeholders : getFormData().stakeholders || [];
  const activeStakeholders = stakeholdersToUse.filter(s => !s.isDeleted);

  // Add stakeholder options
  activeStakeholders.forEach(stakeholder => {
    if (stakeholder.name && stakeholder.name.trim()) {
      const isSelected = selectedStakeholders.includes(stakeholder.name);
      const option = `<option value="${stakeholder.name}" ${isSelected ? 'selected' : ''}>${stakeholder.name}</option>`;
      $select.append(option);
    }
  });

  // Initialize select2
  $select.select2({
    placeholder: "Select stakeholders",
    allowClear: true
  });
}

// --- DATA PERSISTENCE ---
function loadData() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('from') === 'engagement') {
      console.log('Waiting for data via postMessage from engagement...');
      $('.enhanced-table').hide();
      $('.loader, .loader-div').hide();
      // Parent window manages the loader overlay to prevent flickering
      return;
  }

  // Try to load from API first if we have account information
  if (state.urlParams && state.urlParams.accountId) {
    loadDataFromAPI(state.urlParams.accountId);
  } else {
    // Fallback to localStorage if no account ID
    loadDataFromLocalStorage();
  }
}


window.processApiData = function(response) {
      $(".enhanced-table").show();
      $(".loader-div").hide();
      // Clear loading indicator from table body
      $("#directory-table-body").empty();
      console.log("API response received:", response);
      // console.log("Raw response text:", jqXHR.responseText);
      console.log("Response type:", typeof response);
      console.log("Is array:", Array.isArray(response));
      console.log("Response constructor:", response ? response.constructor.name : "null");

      // Store existing buying centers for duplicate validation
      state.existingBuyingCenters = response.existing_bc || [];
      console.log("Existing buying centers loaded:", state.existingBuyingCenters);

      // Set employee lists from API response - now split into 4 separate lists
      state.growthList = response.EMPLOYEE_LIST?.GROWTH_LIST || [];
      state.deliveryList = response.EMPLOYEE_LIST?.DELIVERY_LIST || [];
      state.clientList = response.EMPLOYEE_LIST?.CLIENT_LIST || [];
      state.techList = response.EMPLOYEE_LIST?.TECH_LIST || [];
      // Combine all employee lists for general use
      state.employeeList = [].concat(
        state.growthList,
        state.deliveryList,
        state.clientList,
        state.techList
      );
      console.log("Employee lists loaded:", {
        growth: state.growthList.length + " items",
        delivery: state.deliveryList.length + " items",
        client: state.clientList.length + " items",
        tech: state.techList.length + " items"
      });

      // Handle the API response structure - it can be either:
      // 1. An object with stakeholder_details property (new format)
      // 2. A direct array of account objects (fallback)
      let responseData = [];
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        // Response is an object with stakeholder_details property
        if (response.stakeholder_details && Array.isArray(response.stakeholder_details)) {
          responseData = response.stakeholder_details;
          console.log("Response is object with stakeholder_details array:", responseData.length, "accounts");
        } else {
          console.error("Response object does not contain stakeholder_details array");
          console.log("Available keys:", response ? Object.keys(response) : "null/undefined");
          loadDataFromLocalStorage();
          return;
        }
      } else if (Array.isArray(response)) {
        // Response is a direct array of account objects (fallback)
        responseData = response;
        console.log("Response is direct array of accounts:", responseData.length, "accounts");
        $(".enhanced-table").show();
        $(".loader-div").hide();
      } else {
        console.error("Unexpected response format - expected object with stakeholder_details or array");
        console.log("Response type:", typeof response);
        console.log("Is array:", Array.isArray(response));
        console.log("Response keys:", response ? Object.keys(response) : "null/undefined");
        console.log("Full response:", response);
        $(".enhanced-table").show();
        $(".loader-div").hide();
        loadDataFromLocalStorage();
        return;
      }

        if (responseData && Array.isArray(responseData)) {
          console.log("Processing responseData:", responseData);

        // Transform API response to match our expected format
        state.items = [];

        responseData.forEach((accountData, accountIndex) => {
          console.log(`Processing account ${accountIndex + 1}:`, accountData.ACCOUNT_ID);

          if (accountData.DETAILS && Array.isArray(accountData.DETAILS)) {
            console.log(`Account ${accountData.ACCOUNT_ID} has ${accountData.DETAILS.length} buying centers`);

            accountData.DETAILS.forEach((item, itemIndex) => {
              console.log(`Processing buying center ${itemIndex + 1}: ${item.BUYING_CENTRE}`);

              // Transform stakeholders
              let transformedStakeholders = [];
              if (item.STAKEHOLDERS && Array.isArray(item.STAKEHOLDERS)) {
                console.log(`Buying center ${item.BUYING_CENTRE} has ${item.STAKEHOLDERS.length} stakeholders`);
                console.log("Raw stakeholders data:", item.STAKEHOLDERS);

                transformedStakeholders = item.STAKEHOLDERS.map((stakeholder, stakeholderIndex) => {
                  console.log(`Transforming stakeholder ${stakeholderIndex + 1}:`, stakeholder.STAKEHOLDER);
                  
                  let keyDirectsVal = "";
                  let keyDirectsListVal = [];
                  if (Array.isArray(stakeholder.KEY_DIRECTS)) {
                    keyDirectsVal = stakeholder.KEY_DIRECTS.map(kd => (kd.KEY_DIRECT_NAME || "").trim()).join(", ");
                    keyDirectsListVal = stakeholder.KEY_DIRECTS.map(kd => ({
                      id: kd.KEY_DIRECT_ID || "",
                      name: (kd.KEY_DIRECT_NAME || "").trim()
                    }));
                  } else {
                    keyDirectsVal = stakeholder.KEY_DIRECTS || "";
                    keyDirectsListVal = keyDirectsVal ? keyDirectsVal.split(",").map(d => ({ id: "", name: d.trim() })).filter(d => d.name) : [];
                  }

                  const getPartnerName = (partner) => {
                    if (partner && typeof partner === "object") {
                      return partner.EMPLOYEE_NAME || "";
                    }
                    return partner || "";
                  };

                  return {
                    name: stakeholder.STAKEHOLDER || "",
                    designation: stakeholder.STAKEHOLDER_DESIGNATION || "",
                    status: stakeholder.STAKEHOLDER_STATUS || "Net New",
                    keyDirects: keyDirectsVal,
                    keyDirectsList: keyDirectsListVal,
                    stakeholderType: (stakeholder.STAKEHOLDER_TYPE === "Decision Maker" || stakeholder.STAKEHOLDER_TYPE === "Influencer") ? stakeholder.STAKEHOLDER_TYPE : "Decision Maker",
                    keyStakeholder: stakeholder.KEY_STAKEHOLDER_NAME || "",
                    keyStakeholderId: stakeholder.KEY_STAKEHOLDER_ID || "",
                    keyStakeholderName: stakeholder.KEY_STAKEHOLDER_NAME || "",
                    keyStakeholderDesignation: stakeholder.KEY_STAKEHOLDER_DESIGNATION || "",
                    stakeholderId: stakeholder.STAKEHOLDER_ID || "",
                    factspanOwner: stakeholder.FACTSPAN_OWNER || "",
                    comments: stakeholder.COMMENTS || "",
                    level: stakeholder.LEVEL || "",
                    prize: stakeholder.PRIZE ? Number(stakeholder.PRIZE) : undefined,
                    stakeholderActiveFlag: stakeholder.STAKEHOLDER_ACTIVE_FLAG || "Y",
                    fsGrowthPartner: getPartnerName(stakeholder.GP),
                    fsDeliveryPartner: getPartnerName(stakeholder.DP),
                    fsClientPartner: getPartnerName(stakeholder.CP),
                    fsSmePartnerTech: getPartnerName(stakeholder.TECH),
                    isDeleted: false,
                    isNew: false
                  };
                });

                console.log("Transformed stakeholders:", transformedStakeholders);
              } else {
                console.log(`Buying center ${item.BUYING_CENTRE} has no stakeholders`);
              }

              // Handle KEY_STAKEHOLDER being either an array or a single object
              let keyStakeholderArray = item.KEY_STAKEHOLDER || [];
              if (!Array.isArray(keyStakeholderArray)) {
                keyStakeholderArray = [keyStakeholderArray];
              }

              let sbName = "";
              let sbDesg = "";
              let sbId = "";
              if (Array.isArray(item.SUPERBOSSES)) {
                if (item.SUPERBOSSES.length > 0) {
                  sbName = item.SUPERBOSSES[0].SUPERBOSS || "";
                  sbDesg = item.SUPERBOSSES[0].DESIGNATION || "";
                  sbId = item.SUPERBOSSES[0].SUPERBOSS_ID || "";
                }
              } else {
                sbName = item.SUPERBOSS || "";
                sbDesg = item.DESIGNATION || "";
              }

              const transformedItem = {
                id: item.BUYING_CENTRE || cryptoRandomId(), // Use BUYING_CENTRE name as stable ID for persistence
                bcId: item.BC_ID || "",
                account: item.ACCOUNT_NAME || state.urlParams?.accountName || accountId,
                bcName: item.BUYING_CENTRE || "",
                description: item.DESCRIPTION || "",
                superboss: sbName,
                superbossDesignation: sbDesg,
                superbossId: sbId,
                keyStakeholders: keyStakeholderArray.map(ks => ({
                  id: ks.KEY_STAKEHOLDER_ID || "",
                  name: ks.KEY_STAKEHOLDER_NAME || "",
                  designation: ks.KEY_STAKEHOLDER_DESIGNATION || "",
                  flag: ks.KEY_STAKEHOLDER_FLAG || "Y",
                  isNew: false
                })),
                bcType: item.BC_TYPE || "Net New",
                sop1y: item.SOP1Y ? Number(item.SOP1Y) : 0,
                bcActiveFlag: item.BC_ACTIVE_FLAG || "Y",
                stakeholders: transformedStakeholders,
                createdAt: item.CREATED_DATE || Date.now(),
                // Initialize partner objects with default values
                fsGrowthPartner: { name: "", designation: "", stakeholders: [] },
                fsClientPartner: { name: "", designation: "", stakeholders: [] },
                fsDeliveryPartner: { name: "", designation: "", stakeholders: [] },
                smePartnerTech: { name: "", designation: "", stakeholders: [] }
              };

              console.log("Key stakeholders transformation:", {
                original: keyStakeholderArray,
                transformed: transformedItem.keyStakeholders
              });

              console.log("Final transformed item:", transformedItem);
              state.items.push(transformedItem);
            });
          } else {
            console.log(`Account ${accountData.ACCOUNT_ID} has no DETAILS array`);
          }
        });

        console.log("Final transformed API data - total items:", state.items.length);
        console.log("All items:", state.items);
      } else {
        console.warn("API returned empty or invalid data format, falling back to localStorage");
        loadDataFromLocalStorage();
      }

      // If we have a specific buying center to open from URL params
      if (state.urlParams && state.urlParams.buyingCenter) {
        const targetBc = state.urlParams.buyingCenter;
        const item = state.items.find(it => it.bcName === targetBc);
        if (item) {
          state.view = 'edit';
          state.editId = item.id;

          // Handle initial tab selection
          if (state.urlParams.defaultTab) {
            state.initialTab = state.urlParams.defaultTab;
          } else if (state.urlParams.showAudit) {
            state.initialTab = 'audit-logs';
          }

          // Handle view-only mode
          if (state.urlParams.action === 'view-edit') {
            state.isReadOnly = true;
          }

          console.log(`Auto-opening buying center: ${targetBc}, tab: ${state.initialTab || 'overview'}, isReadOnly: ${state.isReadOnly}`);
        }
      }

      // Re-render after data is loaded
      render();
}
function loadDataFromAPI(accountId) {
  console.log("Loading data from API for account:", accountId);
  let apiURL = apiValue.url.replace("/app", "/get_buying_centers");
    let empId = localStorage.getItem('EmpUserID');
    let emp_dep = localStorage.getItem('Department');
    const payload = {
      account_id: accountId,
      emp_id: empId,
      department: emp_dep
    };
  $(".enhanced-table").hide();
  $(".loader-div").show();

  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    data: JSON.stringify(payload),
    success: function (response, textStatus, jqXHR) {
      window.processApiData(response);
    },
    error: function (error) {
      console.error("Failed to load data from API:", error);
      console.log("Showing error message and falling back to localStorage");

      // Show error message in table body
      $("#directory-table-body").html('<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #dc3545;"><div class="loader"><div class="loader-wheel"></div><div class="loader-text">Failed to load buying centers. Loading from cache...</div></div></td></tr>');

      // Fall back to localStorage after a short delay to show the error message
      setTimeout(() => {
        loadDataFromLocalStorage();
        // Re-render after fallback data is loaded
        render();
      }, 2000);
    }
  });
}

function loadDataFromLocalStorage() {
  // Show loading message in table while loading from cache
  $("#directory-table-body").html('<tr><td colspan="7" style="text-align: center; padding: 2rem;"><div class="loading-text">Loading from cache...</div></td></tr>');

  const stored = localStorage.getItem("buyingCenters");
  if (stored) {
    try {
      state.items = JSON.parse(stored);
      console.log("Loaded data from localStorage:", state.items);
    } catch (e) {
      console.error("Failed to parse stored data", e);
      state.items = [];
    }
  } else {
    state.items = [];
    console.log("No data found in localStorage");
  }

  // Render after loading data
  render();
}

function saveData() {
  localStorage.setItem("buyingCenters", JSON.stringify(state.items));
}

// --- RENDER FUNCTIONS ---
function render() {
  // Update page title dynamically
  if (state.view === 'edit' && state.editId) {
    const item = state.items.find(i => i.id === state.editId);
    if (item) {
      const accName = state.urlParams && state.urlParams.accountName ? state.urlParams.accountName : (item.account || "Account");
      setDetailHeader(accName, item.bcName);
    } else {
      // Fallback if item not found yet
      if (state.urlParams && state.urlParams.accountName) {
        $("#page-title").html(`<span class="account-name">${state.urlParams.accountName}</span> Buying Centers`);
      } else {
        $("#page-title").text("Buying Centers");
      }
    }
  } else if (state.urlParams && state.urlParams.accountName) {
    $("#page-title").html(`<span class="account-name">${state.urlParams.accountName}</span> Buying Centers`);
  } else {
    $("#page-title").text("Buying Centers");
  }

  // Hide all main views
  $("#directory-page, #form-page").addClass("hidden");
  // Show/hide header actions
  $("#go-create-btn").toggleClass("hidden", state.view !== "list");
  $("#form-header-actions").toggleClass("hidden", state.view === "list");

  // Show/hide back button based on current view
  if (state.view === "list") {
    $("#buyingCenterBackBtnCustm").show();
  } else {
    $("#buyingCenterBackBtnCustm").hide();
  }

  // Show the current view
  switch (state.view) {
    case "list":
      $("#directory-page").removeClass("hidden");
      renderDirectoryPage();
      break;
    case "create":
      $("#form-page").removeClass("hidden");
      renderForm("create");
      break;
    case "edit":
      $("#form-page").removeClass("hidden");
      renderForm("edit", state.editId);
      break;
  }
}

function renderDirectoryPage() {
  const $tbody = $("#directory-table-body");
  $tbody.empty();

  // Filter by account if in view-edit mode
  let filteredItems = state.filteredAccount
    ? state.items.filter(item => item.account === state.filteredAccount)
    : [...state.items];

  // Sorting
  let sortedItems = [...filteredItems];
  if (state.sortConfig) {
    sortedItems.sort((a, b) => {
      let aValue = a[state.sortConfig.key];
      let bValue = b[state.sortConfig.key];
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();
      if (state.sortConfig.key === "sop1y") {
        aValue = a.sop1y || 0;
        bValue = b.sop1y || 0;
      }
      if (state.sortConfig.key === "keyStakeholder") {
        aValue = a.keyStakeholders && a.keyStakeholders.length > 0 ? a.keyStakeholders[0].name : "";
        bValue = b.keyStakeholders && b.keyStakeholders.length > 0 ? b.keyStakeholders[0].name : "";
      }
      if (state.sortConfig.key === "stakeholder") {
        aValue = a.stakeholders && a.stakeholders.length > 0 ? a.stakeholders[0].name : "";
        bValue = b.stakeholders && b.stakeholders.length > 0 ? b.stakeholders[0].name : "";
      }

      if (aValue < bValue) return state.sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return state.sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Render table rows
  if (sortedItems.length === 0) {
    $tbody.html(
      '<tr><td colspan="8" style="text-align: center; padding: 1rem; color: #6b7280;">No buying centers found.</td></tr>'
    );
  } else {
    sortedItems.forEach((item) => {
      const rowHtml = `
                            <tr data-id="${item.id}" style="cursor: pointer; ${item.id === state.flashId
          ? "background-color: rgba(255, 247, 237, 0.4);"
          : ""
        }">
                                
                                <td class="bc-link">${item.bcName}</td>
                                <td><span class="type-badge ${item.bcType
          .toLowerCase()
          .replace(" ", ".")}">${item.bcType
        }</span></td>
                                <td class="description-cell" title="${item.description
        }"><div class="description-text">${item.description}</div></td>
                                <td><span class="type-badge stakeholder-badge stakeholder-link" data-stakeholder="${item.superboss}" data-bc-id="${item.id}">${item.superboss}</span></td>
                                <td>${item.keyStakeholders && item.keyStakeholders.length > 0 ? item.keyStakeholders.map(ks => `<span class="type-badge stakeholder-badge stakeholder-link" data-stakeholder="${ks.name}" data-bc-id="${item.id}">${ks.name}</span>`).join(' ') : ""}</td>
                                <td>${item.stakeholders && item.stakeholders.length > 0 ? item.stakeholders.filter(s => !s.isDeleted && s.name).map(s => `<span class="type-badge stakeholder-badge stakeholder-link" data-stakeholder="${s.name}" data-bc-id="${item.id}">${s.name}</span>`).join(' ') : ""}</td>
                                
                                <td class="sop-cell">${money(item.sop1y)}</td>
                                <td class="created-cell">${convertStringToLocalTimeAndAgo(
          item.createdAt
        )}</td>
                            </tr>
                        `;
      $tbody.append(rowHtml);
    });
  }

  // Update total count
  $("#total-items").text(sortedItems.length);

  // Handle flash message
  const $flashContainer = $("#flash-message-container");
  if (state.flashId) {
    const justCreated = state.items.find((it) => it.id === state.flashId);
    if (justCreated) {
      $flashContainer
        .html(
          `
                            <span class="font-semibold">✅ Created ${justCreated.bcName}</span> for <span class="font-semibold">${justCreated.account}</span>.
                            <button id="dismiss-flash" class="dismiss-btn">dismiss</button>
                        `
        )
        .removeClass("hidden");
    }
  } else {
    $flashContainer.addClass("hidden");
  }

  // Update sort indicators
  $(".sortable-header").removeClass("active");
  $(".sort-arrow").removeClass("active");
  if (state.sortConfig) {
    const $header = $(
      `.sortable-header[data-sort-key="${state.sortConfig.key}"]`
    );
    $header.addClass("active");
    const arrowClass = state.sortConfig.direction === "asc" ? ".up" : ".down";
    $header.find(".sort-indicator").find(arrowClass).addClass("active");
  }
}


function renderForm(mode, id = null) {
  const isEdit = mode === "edit";
  $("#form-title").text(isEdit ? "Edit Buying Center" : "Create Buying Center");
  $("#buying-center-form")[0].reset();
  $("#edit-id").val(isEdit ? id : "");
  clearErrors();

  // Clear any existing key stakeholders data to prevent persistence between different buying centers
  window.originalKeyStakeholders = [];
  window.deletedEntitiesMap = []; // Reset deletions list for the current form

  let item = {
    bcType: "Net New",
    stakeholders: [],
    keyStakeholders: [], // Add key stakeholders array
    fsGrowthPartner: { name: "", designation: "", stakeholders: [] },
    fsClientPartner: { name: "", designation: "", stakeholders: [] },
    fsDeliveryPartner: { name: "", designation: "", stakeholders: [] },
    smePartnerTech: { name: "", designation: "", stakeholders: [] }
  };

  // Set default status for existing stakeholders if they don't have one
  if (item.stakeholders && item.stakeholders.length > 0) {
    item.stakeholders.forEach(s => {
      if (!s.status) s.status = "Net New";
    });
  }

  if (isEdit) {
    item = state.items.find((it) => it.id === id) || item;
    console.log("Editing item:", item);
    console.log("Key stakeholders from item:", item.keyStakeholders);
    console.log("Stakeholders data:", item.stakeholders);
    console.log("Stakeholders length:", item.stakeholders ? item.stakeholders.length : 0);
    if (item.stakeholders && item.stakeholders.length > 0) {
      console.log("First stakeholder:", item.stakeholders[0]);
    }
    // Store original key stakeholders for edit mode - ensure we get fresh data from the current item
    // Create a deep copy to prevent any reference issues
    if (item.keyStakeholders && item.keyStakeholders.length > 0) {
      window.originalKeyStakeholders = item.keyStakeholders.map(ks => ({
        id: ks.id || "",
        name: ks.name || "",
        designation: ks.designation || "",
        flag: ks.flag || "Y",
        isNew: ks.isNew || false
      }));
    } else {
      window.originalKeyStakeholders = [{ name: "", designation: "", flag: "Y", isNew: true }];
    }

    console.log("window.originalKeyStakeholders set to:", window.originalKeyStakeholders);
  } else {
    // For create mode, start with empty key stakeholders
    const npsStakeholderValue = state.urlParams && state.urlParams.npsStakeholder ? state.urlParams.npsStakeholder : "";
    window.originalKeyStakeholders = [{ name: npsStakeholderValue, designation: "", flag: "Y", isNew: true }];
  }

  // Auto-fill from URL parameters for create mode
  if (!isEdit && state.shouldPreFillFromUrl && state.urlParams) {
    if (state.urlParams.accountName) {
      item.account = state.urlParams.accountName;
    }
    if (state.urlParams.buyingCenter) {
      item.bcName = state.urlParams.buyingCenter;
    }
    // Note: Key stakeholders are intentionally not pre-filled from URL params to avoid confusion
  }

  // Auto-fill from filtered account when in view-edit mode and clicking create
  if (!isEdit && !state.shouldPreFillFromUrl && state.filteredAccount) {
    item.account = state.filteredAccount;
  }

  // Populate form fields
  $("#account").val(item.account).prop("disabled", isEdit || (!isEdit && (state.urlParams && state.urlParams.accountName) || state.filteredAccount));
  $("#bcName").val(item.bcName);
  $("#description").val(item.description);
  $("#superboss").val(item.superboss);
  $("#superbossDesignation").val(item.superbossDesignation || "");
  $("#bcType").val(item.bcType);
  $("#sop1y").val(item.sop1y ? formatPrizeInput(item.sop1y.toString()) : "");

  // Populate employee dropdowns
  populateEmployeeDropdown("fsGrowthPartner", item.fsGrowthPartner);
  populateEmployeeDropdown("fsClientPartner", item.fsClientPartner);
  populateEmployeeDropdown("fsDeliveryPartner", item.fsDeliveryPartner);
  populateEmployeeDropdown("smePartnerTech", item.smePartnerTech);

  // Populate designation and stakeholders fields
  $("#fsGrowthPartnerDesignation").val(item.fsGrowthPartner.designation || "");
  $("#fsClientPartnerDesignation").val(item.fsClientPartner.designation || "");
  $("#fsDeliveryPartnerDesignation").val(item.fsDeliveryPartner.designation || "");
  $("#smePartnerTechDesignation").val(item.smePartnerTech.designation || "");

  // Populate stakeholders dropdowns
  populateStakeholdersDropdown("fsGrowthPartnerStakeholders", item.fsGrowthPartner.stakeholders || [], item.stakeholders);
  populateStakeholdersDropdown("fsClientPartnerStakeholders", item.fsClientPartner.stakeholders || [], item.stakeholders);
  populateStakeholdersDropdown("fsDeliveryPartnerStakeholders", item.fsDeliveryPartner.stakeholders || [], item.stakeholders);
  populateStakeholdersDropdown("smePartnerTechStakeholders", item.smePartnerTech.stakeholders || [], item.stakeholders);

  // Initialize select2 for all dropdowns
  $("#bcType").select2();
  $("#fsGrowthPartner").select2();
  $("#fsClientPartner").select2();
  $("#fsDeliveryPartner").select2();
  $("#smePartnerTech").select2();

  // Initialize key stakeholders list
  renderKeyStakeholdersList(window.originalKeyStakeholders);

  console.log("About to render stakeholders table with:", item.stakeholders);
  renderStakeholdersTable(item.stakeholders, isEdit);
  console.log("About to render FS partners table with:", item.stakeholders);
  renderFSPartnersTable(item.stakeholders, isEdit);

  // Initialize real-time synchronization between tables
  addStakeholderSyncListeners();

  // Use initialTab if set, otherwise check sessionStorage, then default to overview
  const savedTab = sessionStorage.getItem("activeBuyingCenterTab");
  const initialTab = state.initialTab || savedTab || "overview";
  setActiveTab(initialTab);
  state.initialTab = null; // Reset initialTab after use

  // Initialize tooltips
  $('[data-toggle="tooltip"]').tooltip();

  // Show FS members tab only for admin role
  let userRole = localStorage.getItem("user-role");
  let userDept = localStorage.getItem("Department")
  let userJobRole = localStorage.getItem("Job_Role")
  let userEmail = localStorage.getItem("email")
  // Temporarily show for all users for testing
  $("#fs-members-tab").show();

  // Show/Hide Notes and Audit tabs based on mode (only for existing items)
  if (isEdit) {
    $("#notes-tab-btn, #audit-logs-tab-btn").show();
  } else {
    $("#notes-tab-btn, #audit-logs-tab-btn").hide();
  }

  // Clear Audit Log cache when entering form mode to ensure correct data for current BC
  window.currentAuditLogs = null;

  // Initialize auto-expand for textareas
  initializeAutoExpandTextareas();

  // Handle read-only mode
  handleReadOnlyMode(isEdit);
}

function handleReadOnlyMode(isEdit) {
  const $form = $("#form-page");
  const $submitBtn = $("#form-submit-btn");
  const $editBtn = $("#edit-mode-btn");

  if (state.isReadOnly) {
    // Disable all inputs, selects, textareas
    $form.find("input, select, textarea").prop("disabled", true);

    // Specifically handle select2 if necessary
    $form.find("select").trigger('change.select2');

    // Disable stakeholders dropdown in notes
    $("#header-notes-stakeholders").prop("disabled", true).trigger('change.select2');

    // Handle Quill editor state
    if (quill) {
      quill.enable(false);
    }

    // Hide modification buttons
    $form.find(".delete-stakeholder-btn, .restore-stakeholder-btn, .delete-key-stakeholder-btn, .restore-key-stakeholder-btn, #add-stakeholder-btn, #add-key-stakeholder-btn, #updateNoteBtn").hide();

    // Hide Save button, show Edit button (only in edit view)
    if (state.view === 'edit') {
      $submitBtn.hide();
      $editBtn.show().removeClass("hidden");
    } else {
      $submitBtn.show();
      $editBtn.hide();
    }

    // Toggle Notes Tab Content: Show timeline, hide form
    $(".notes-form-container").addClass("hidden");
    $("#notes-timeline-container").removeClass("hidden");

    // Hide stakeholder dropdown in header in Read-Only mode
    $("#header-notes-stakeholders").closest('div').parent().hide();
  } else {
    // Enable everything
    $form.find("input, select, textarea").prop("disabled", false);

    // If we are on the notes tab, ensure the header dropdown is active and visible
    const activeTab = $(".tab-btn.active").data("tab");
    if (activeTab === 'notes') {
      $("#header-notes-stakeholders").closest('div').parent().show();
    }

    // Keep Account name disabled in Edit mode
    if (isEdit) {
      $("#account").prop("disabled", true);
    }

    // Except those that should be naturally disabled
    $form.find('[name^="fs_stakeholder_"]').prop("disabled", true);
    $form.find('[name="fs_key_stakeholder"], [name="fs_stakeholder_name"], [name="fs_stakeholder_designation"]').prop("disabled", true);

    // Disable stakeholders dropdown ONLY if locked by stakeholder navigation
    if (state.isStakeholderLocked) {
      $("#header-notes-stakeholders").prop("disabled", true).trigger('change.select2');
    } else {
      $("#header-notes-stakeholders").prop("disabled", false).trigger('change.select2');
    }

    $form.find("select").trigger('change.select2');

    // Handle Quill editor state
    if (quill) {
      quill.enable(true);
    }

    // Show modification buttons
    $form.find(".delete-stakeholder-btn, .restore-stakeholder-btn, .delete-key-stakeholder-btn, .restore-key-stakeholder-btn, #add-stakeholder-btn, #add-key-stakeholder-btn, #updateNoteBtn").show();

    // Show Save button, hide Edit button
    $submitBtn.show();
    $editBtn.hide();

    // Toggle Notes Tab Content: Hide timeline, show form
    $(".notes-form-container").removeClass("hidden");
    $("#notes-timeline-container").addClass("hidden");
  }
}

function renderStakeholdersTable(stakeholders, isEdit = false) {
  const $tbody = $("#stakeholders-table-body");
  $tbody.empty();

  // Count only active (non-deleted) stakeholders for the tab label
  const activeStakeholders = stakeholders.filter(s => !s.isDeleted);
  $("#stakeholders-tab-label").text(`Stakeholders (${activeStakeholders.length})`);

  // Get key stakeholders from the overview panel for dropdown population
  const keyStakeholders = window.originalKeyStakeholders || [];

  // Stakeholders are now optional, so delete buttons are never disabled

  if (stakeholders.length === 0) {
    $tbody.html(
      '<tr><td style="padding: 0.75rem; color: #4b5563;" colspan="12">No stakeholders yet.</td></tr>'
    );
    return;
  }

  // Always show Actions column header since we now show delete buttons for all records
  const $actionsHeader = $("#stakeholders-table thead th:last-child");
  $actionsHeader.show();

  stakeholders.forEach((s, i) => {
    // Check if this is a newly added row or existing row (from API)
    const isNewRow = s.isNew || false;
    const isDeleted = s.isDeleted || false;

    // Determine field states
    // const nameDisabled = isDeleted ? 'disabled' : (isNewRow ? '' : 'disabled'); // Enable Key Stakeholder only for newly added rows
    const nameDisabled = isDeleted ? 'disabled' : ''; // Enable Key Stakeholder for all active rows
    const othersDisabled = isDeleted ? 'disabled' : ''; // Disable all fields for deleted records

    // Visual styling for deleted records
    const rowClass = isDeleted ? 'stakeholder-deleted' : '';
    const fieldClass = isDeleted ? 'stakeholder-field-deleted' : 'stakeholder-field';

    // Always show delete button, but change text/icon based on state
    const deleteButtonHtml = isDeleted
      ? `<button type="button" class="restore-stakeholder-btn" data-index="${i}" title="Restore stakeholder"><i class="fa fa-undo" aria-hidden="true"></i></button>`
      : `<button type="button" class="delete-stakeholder-btn" data-index="${i}" title="Delete stakeholder"><i class="fa fa-trash" aria-hidden="true"></i></button>`;

    // Build Key Stakeholder dropdown options
    let keyStakeholderOptions = '<option value="">Select Key Stakeholder</option>';
    keyStakeholders.forEach((ks, ksIndex) => {
      if (ks.flag !== 'N' && ks.name && ks.name.trim()) {
        const isSelected = s.keyStakeholder === ks.name;
        keyStakeholderOptions += `<option value="${ks.name}" ${isSelected ? 'selected' : ''}>${ks.name}</option>`;
      }
    });

    const row = `
                        <tr data-index="${i}" class="${rowClass}" ${isDeleted ? 'style="opacity: 0.6; text-decoration: line-through;"' : ''}>
                            <td>${i + 1}</td>
                            <td>
                                <select class="form-select ${fieldClass}" name="s_keyStakeholder" ${othersDisabled}>
                                    ${keyStakeholderOptions}
                                </select>
                            </td>
                            <td><input class="form-input ${fieldClass}" name="s_name" placeholder="Enter stakeholder name" value="${s.name || ""}" ${nameDisabled} ${othersDisabled} autocomplete="off" />
                            <input type="hidden" name="s_isNew" value="${s.isNew || ''}" /></td>
                            <td><input class="form-input ${fieldClass}" name="s_designation" placeholder="Enter designation" value="${s.designation || ""}" ${othersDisabled} autocomplete="off" /></td>
                            <td>
                                <select class="form-select ${fieldClass}" name="s_status" ${othersDisabled}>
                                    <option value="Net New" ${s.status === "Net New" ? "selected" : ""}>Net New</option>
                                    <option value="Current" ${s.status === "Current" ? "selected" : ""}>Current</option>
                                    <option value="Current - New" ${s.status === "Current - New" ? "selected" : ""}>Current - New</option>
                                </select>
                            </td>
                            <td><input class="form-input ${fieldClass}" name="s_keyDirects" placeholder="Enter key directs" value="${s.keyDirects || ""}" ${othersDisabled} autocomplete="off" /></td>
                            <td>
                                <select class="form-select ${fieldClass}" name="s_stakeholderType" ${othersDisabled}>
                                    <option value="Decision Maker" ${s.stakeholderType === "Decision Maker" ? "selected" : ""}>Decision Maker</option>
                                    <option value="Influencer" ${s.stakeholderType === "Influencer" ? "selected" : ""}>Influencer</option>
                                </select>
                            </td>
                            <td><textarea class="form-textarea auto-expand ${fieldClass}" rows="1" name="s_comments" placeholder="Enter comments" ${othersDisabled}>${s.comments || ""}</textarea></td>
                            <td>
                                <select class="form-select ${fieldClass}" name="s_level" ${othersDisabled}>
                                    <option value="" ${!s.level ? "selected" : ""}>—</option>
                                    <option value="N" ${s.level === "N" ? "selected" : ""}>N</option>
                                    <option value="N-1" ${s.level === "N-1" ? "selected" : ""}>N-1</option>
                                </select>
                            </td>
                            <td><input class="form-input ${fieldClass}" type="text" name="s_prize" placeholder="USD" value="${s.prize != null ? formatPrizeInput(s.prize.toString()) : ""}" ${othersDisabled} autocomplete="off" /></td>
                            <td>${deleteButtonHtml}</td>
                        </tr>
      `;
    $tbody.append(row);
  });

  // Initialize auto-expand for newly added textareas
  initializeAutoExpandTextareas();

  // Populate Factspan Owner dropdowns and initialize select2
  stakeholders.forEach((s, i) => {
    const $select = $(`#stakeholders-table-body tr[data-index="${i}"] select[name="s_factspanOwner"]`);
    if ($select.length > 0) {
      // Clear existing options except the default
      $select.find('option:not(:first)').remove();

      // Add employee options
      state.employeeList.forEach(emp => {
        const option = `<option value="${emp.EMPLOYEE_NAME}" ${emp.EMPLOYEE_NAME === s.factspanOwner ? 'selected' : ''}>${emp.EMPLOYEE_NAME}</option>`;
        $select.append(option);
      });

      // If selectedValue is not empty and not in the list, add it as an option
      if (s.factspanOwner && !state.employeeList.some(emp => emp.EMPLOYEE_NAME === s.factspanOwner)) {
        const option = `<option value="${s.factspanOwner}" selected>${s.factspanOwner}</option>`;
        $select.append(option);
      }

      // Initialize select2
      $select.select2();
    }

    // Initialize select2 for other stakeholder dropdowns
    const $statusSelect = $(`#stakeholders-table-body tr[data-index="${i}"] select[name="s_status"]`);
    if ($statusSelect.length > 0) {
      $statusSelect.select2();
    }

    const $stakeholderTypeSelect = $(`#stakeholders-table-body tr[data-index="${i}"] select[name="s_stakeholderType"]`);
    if ($stakeholderTypeSelect.length > 0) {
      $stakeholderTypeSelect.select2();
    }

    const $levelSelect = $(`#stakeholders-table-body tr[data-index="${i}"] select[name="s_level"]`);
    if ($levelSelect.length > 0) {
      $levelSelect.select2();
    }
  });
}

function renderFSPartnersTable(stakeholders, isEdit = false) {
  const $tbody = $("#fs-partners-table-body");
  $tbody.empty();

  if (stakeholders.length === 0) {
    $tbody.html(
      '<tr><td style="padding: 0.75rem; color: #4b5563;" colspan="10">No stakeholders available. Add stakeholders first.</td></tr>'
    );
    return;
  }

  stakeholders.forEach((s, i) => {
    // Skip deleted stakeholders
    if (s.isDeleted) return;

    const row = `
      <tr data-index="${i}">
        <td>${i + 1}</td>
        <td><input class="form-input" name="fs_key_stakeholder" placeholder="Key Stakeholder" value="${s.keyStakeholder || ""
      }" disabled style="background-color: #f3f4f6; cursor: not-allowed;" title="Pre-filled from Stakeholders data" /></td>
        <td><input class="form-input" name="fs_stakeholder_name" placeholder="Stakeholder name" value="${s.name || ""
      }" disabled style="background-color: #f3f4f6; cursor: not-allowed;" title="Pre-filled from Stakeholders data" /></td>
        <td><input class="form-input" name="fs_stakeholder_designation" placeholder="Designation" value="${s.designation || ""
      }" disabled style="background-color: #f3f4f6; cursor: not-allowed;" title="Pre-filled from Stakeholders data" /></td>
        <td>
          <select class="form-select" name="fs_stakeholder_status" disabled style="background-color: #f3f4f6; cursor: not-allowed;" title="Pre-filled from Stakeholders data">
            <option value="Net New" ${s.status === "Net New" ? "selected" : ""}>Net New</option>
            <option value="Current" ${s.status === "Current" ? "selected" : ""}>Current</option>
            <option value="Current - New" ${s.status === "Current - New" ? "selected" : ""}>Current - New</option>
          </select>
        </td>
        <td>
          <select class="form-select" name="fs_stakeholder_type" disabled style="background-color: #f3f4f6; cursor: not-allowed;" title="Pre-filled from Stakeholders data">
            <option value="Decision Maker" ${s.stakeholderType === "Decision Maker" ? "selected" : ""}>Decision Maker</option>
            <option value="Influencer" ${s.stakeholderType === "Influencer" ? "selected" : ""}>Influencer</option>
          </select>
        </td>
        <td>
          <select class="form-select" name="fs_growth_partner" style="width: 100%;">
            <option value="">Select Growth Partner</option>
            ${(state.growthList.length > 0 ? state.growthList : state.employeeList).map(emp =>
        `<option value="${emp.EMPLOYEE_NAME}" ${emp.EMPLOYEE_NAME === (s.fsGrowthPartner || s.GP || '') ? 'selected' : ''}>${emp.EMPLOYEE_NAME}</option>`
      ).join('')}
          </select>
        </td>
        <td>
          <select class="form-select" name="fs_delivery_partner" style="width: 100%;">
            <option value="">Select Delivery Partner</option>
            ${(state.deliveryList.length > 0 ? state.deliveryList : state.employeeList).map(emp =>
        `<option value="${emp.EMPLOYEE_NAME}" ${emp.EMPLOYEE_NAME === (s.fsDeliveryPartner || s.DP || '') ? 'selected' : ''}>${emp.EMPLOYEE_NAME}</option>`
      ).join('')}
          </select>
        </td>
        <td>
          <select class="form-select" name="fs_client_partner" style="width: 100%;">
            <option value="">Select Client Partner</option>
            ${(state.clientList.length > 0 ? state.clientList : state.employeeList).map(emp =>
        `<option value="${emp.EMPLOYEE_NAME}" ${emp.EMPLOYEE_NAME === (s.fsClientPartner || s.CP || '') ? 'selected' : ''}>${emp.EMPLOYEE_NAME}</option>`
      ).join('')}
          </select>
        </td>
        <td>
          <select class="form-select" name="fs_sme_partner_tech" style="width: 100%;">
            <option value="">Select SME Partner - Tech</option>
            ${(state.techList.length > 0 ? state.techList : state.employeeList).map(emp =>
        `<option value="${emp.EMPLOYEE_NAME}" ${emp.EMPLOYEE_NAME === (s.fsSmePartnerTech || s.TECH || '') ? 'selected' : ''}>${emp.EMPLOYEE_NAME}</option>`
      ).join('')}
          </select>
        </td>
      </tr>
      `;
    $tbody.append(row);
  });

  // Initialize select2 for all dropdowns in the FS Partners table
  $tbody.find('select').each(function () {
    $(this).select2();
  });
}

// --- KEY STAKEHOLDERS LIST RENDERING ---
function renderKeyStakeholdersList(keyStakeholders) {
  const $list = $("#key-stakeholders-list");
  $list.empty();

  // Filter to show only active key stakeholders for determining if deletion is allowed
  const activeKeyStakeholders = keyStakeholders.filter(ks => ks.flag !== 'N');

  // Disable delete button if there's only one active key stakeholder
  const disableDelete = activeKeyStakeholders.length <= 1;

  keyStakeholders.forEach((stakeholder, actualIndex) => {
    const isDeleted = stakeholder.flag === 'N';
    const disabledAttr = isDeleted ? 'disabled' : '';

    // Visual styling for deleted records
    const rowStyle = isDeleted ? 'style="opacity: 0.6; text-decoration: line-through;"' : '';
    const fieldClass = isDeleted ? 'stakeholder-field' : 'bg_white';

    // Always show delete/restore button, but change icon and behavior based on state
    let actionButtonHtml = '';
    if (isDeleted) {
      actionButtonHtml = `
        <button type="button" class="restore-key-stakeholder-btn" data-index="${actualIndex}" title="Restore key stakeholder">
          <i class="fa fa-undo" aria-hidden="true"></i>
        </button>
      `;
    } else {
      const deleteButtonDisabled = disableDelete ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
      const deleteButtonTitle = disableDelete ? 'Cannot delete - at least one key stakeholder required' : 'Delete key stakeholder';
      actionButtonHtml = `
        <button type="button" class="delete-key-stakeholder-btn" data-index="${actualIndex}" title="${deleteButtonTitle}" ${deleteButtonDisabled}>
          <i class="fa fa-trash" aria-hidden="true"></i>
        </button>
      `;
    }

    const rowHtml = `
      <div class="key-stakeholder-row" data-index="${actualIndex}" ${rowStyle}>
        <div class="field_style" style="flex: 1; margin-bottom: 0;">
          <label style="display: none;">Key Stakeholder ${actualIndex + 1}</label>
          <input type="text" class="form-input stakeholder-field ${fieldClass}" name="key_stakeholder_name" placeholder="Enter key stakeholder name" value="${stakeholder.name || ""}" ${disabledAttr} autocomplete="off" />
        </div>
        <div class="field_style" style="flex: 1; margin-bottom: 0;">
          <label style="display: none;">Designation ${actualIndex + 1}</label>
          <input type="text" class="form-input stakeholder-field ${fieldClass}" name="key_stakeholder_designation" placeholder="Enter designation" value="${stakeholder.designation || ""}" ${disabledAttr} autocomplete="off" />
        </div>
        ${actionButtonHtml}
      </div>
    `;
    $list.append(rowHtml);
  });
}

// --- REAL-TIME SYNCHRONIZATION BETWEEN STAKEHOLDERS AND FS PARTNERS TABLES ---
function syncStakeholderToFSPartners(stakeholderIndex, fieldName, newValue) {
  // Find the corresponding row in FS Partners table
  const $fsRow = $(`#fs-partners-table-body tr[data-index="${stakeholderIndex}"]`);
  if ($fsRow.length === 0) return;

  // Update the corresponding field in FS Partners table
  switch (fieldName) {
    case 'name':
      $fsRow.find('input[name="fs_stakeholder_name"]').val(newValue);
      break;
    case 'designation':
      $fsRow.find('input[name="fs_stakeholder_designation"]').val(newValue);
      break;
    case 'keyStakeholder':
      $fsRow.find('input[name="fs_key_stakeholder"]').val(newValue);
      break;
    case 'status':
      $fsRow.find('select[name="fs_stakeholder_status"]').val(newValue).trigger('change');
      break;
    case 'stakeholderType':
      $fsRow.find('select[name="fs_stakeholder_type"]').val(newValue).trigger('change');
      break;
  }
}

// Add event listeners for real-time synchronization
function addStakeholderSyncListeners() {
  // Listen for changes in stakeholder name and designation inputs
  $("#stakeholders-table-body").on("input", 'input[name="s_name"]', function () {
    const $row = $(this).closest('tr');
    const index = $row.data('index');
    const newValue = $(this).val();
    syncStakeholderToFSPartners(index, 'name', newValue);
  });

  $("#stakeholders-table-body").on("input", 'input[name="s_designation"]', function () {
    const $row = $(this).closest('tr');
    const index = $row.data('index');
    const newValue = $(this).val();
    syncStakeholderToFSPartners(index, 'designation', newValue);
  });

  // Listen for changes in stakeholder status dropdown
  $("#stakeholders-table-body").on("change", 'select[name="s_status"]', function () {
    const $row = $(this).closest('tr');
    const index = $row.data('index');
    const newValue = $(this).val();
    syncStakeholderToFSPartners(index, 'status', newValue);
  });

  // Listen for changes in stakeholder type dropdown
  $("#stakeholders-table-body").on("change", 'select[name="s_stakeholderType"]', function () {
    const $row = $(this).closest('tr');
    const index = $row.data('index');
    const newValue = $(this).val();
    syncStakeholderToFSPartners(index, 'stakeholderType', newValue);
  });

  // Listen for changes in key stakeholder dropdown
  $("#stakeholders-table-body").on("change", 'select[name="s_keyStakeholder"]', function () {
    const $row = $(this).closest('tr');
    const index = $row.data('index');
    const newValue = $(this).val();
    syncStakeholderToFSPartners(index, 'keyStakeholder', newValue);
  });
}

// --- UI ACTIONS & NAVIGATION ---
function goToList() {
  state.view = "list";
  state.editId = null;
  state.isStakeholderLocked = false;
  window.deletedEntitiesMap = []; // Reset deletions list when moving away from a form
  sessionStorage.removeItem("activeBuyingCenterView");
  sessionStorage.removeItem("activeBuyingCenterId");
  sessionStorage.removeItem("activeBuyingCenterTab"); // Also clear tab when going to list

  // Update URL search params - set action to view-edit
  const url = new URL(window.location.href);
  url.searchParams.set("action", "view-edit");
  url.searchParams.delete("buyingCenterId");
  history.replaceState(null, "", url.toString());

  render();
}

function goToCreate() {
  state.view = "create";
  state.isReadOnly = false;
  state.isStakeholderLocked = false;
  state.shouldPreFillFromUrl = false; // Don't pre-fill from URL when clicking create button
  window.deletedEntitiesMap = []; // Reset deletions list for the new form
  sessionStorage.setItem("activeBuyingCenterView", "create");
  sessionStorage.setItem("activeBuyingCenterReadOnly", "false");
  sessionStorage.removeItem("activeBuyingCenterId");

  // Update URL search params - set action to new and remove buyingCenterId
  const url = new URL(window.location.href);
  url.searchParams.set("action", "new");
  url.searchParams.delete("buyingCenterId");
  history.replaceState(null, "", url.toString());

  // Clear any existing key stakeholders from previous sessions
  $("#key-stakeholders-list").empty();
  window.originalKeyStakeholders = [{ name: "", designation: "", flag: "Y", isNew: true }]; // Ensure key stakeholders are empty
  render();
}

function goToEdit(id) {
  state.view = "edit";
  state.editId = id;
  state.isReadOnly = true;
  state.isStakeholderLocked = false;
  sessionStorage.setItem("activeBuyingCenterView", "edit");
  sessionStorage.setItem("activeBuyingCenterId", id);
  sessionStorage.setItem("activeBuyingCenterReadOnly", "true");

  // Update URL search params - set action to edit and add buyingCenterId
  const url = new URL(window.location.href);
  url.searchParams.set("action", "edit");
  url.searchParams.set("buyingCenterId", id);
  history.replaceState(null, "", url.toString());

  render();
}

function setDetailHeader(accountName, bcName, extraHtml = "") {
  const titleHtml = `
      <div style="display: flex; align-items: center; font-size: 1.5rem; font-weight: 700;">
            <span style="color: #313265;">${accountName} Buying Center</span>
            <span style="margin: 0 10px; color: #d1d5db;">|</span>
            <span style="color: #2985C1;">${bcName}</span>
            ${extraHtml ? `<span style="margin: 0 10px; color: #d1d5db;">|</span>${extraHtml}` : ''}
        </div>
      `;
  $("#page-title").html(titleHtml);
}

function setActiveTab(tabId) {
  // Store active tab in sessionStorage for persistence across refresh
  sessionStorage.setItem("activeBuyingCenterTab", tabId);
  
  if (typeof window.switchActivityTab === "function") {
    window.switchActivityTab(tabId);
  }

  $(".tab-panel").addClass("hidden");
  $(`#${tabId}-panel`).removeClass("hidden");

  $(".tab-btn").removeClass("active");
  $(`.tab-btn[data-tab="${tabId}"]`).addClass("active");

  // Update button text based on tab and mode
  const isEdit = $("#edit-id").val() !== "";
  $("#form-submit-btn").text(isEdit ? "Save" : (tabId === "overview" ? "Save" : "Save"));

  // Handle Note-specific visibility for global footer
  if (tabId === 'notes' || tabId === 'audit-logs') {
    $(".sticky-footer").addClass("hidden");
  } else {
    $(".sticky-footer").removeClass("hidden");
  }

  // Trigger data load for Audit Logs or Notes-history
  if (tabId === 'audit-logs' || (tabId === 'notes' && state.isReadOnly)) {
    fetchAuditLogs();
  }

  if (tabId === 'notes') {
    initializeNotesTab();
  } else {
    // Restore standard Page Title when leaving Notes tab but keep BC/Account context
    const formAccount = (state.urlParams && state.urlParams.accountName) ? state.urlParams.accountName : ($("#account").val() || "Account");
    const bcName = $("#bcName").val();

    if (state.view === 'edit' && bcName) {
      setDetailHeader(formAccount, bcName);
    } else if (state.urlParams && state.urlParams.accountName) {
      $("#page-title").html(`<span class="account-name">${state.urlParams.accountName}</span> Buying Centers`);
    } else {
      // Fallback for when urlParams might not be present (e.g. navigation from list)
      if (formAccount && formAccount !== "Account") {
        $("#page-title").html(`<span class="account-name">${formAccount}</span> Buying Centers`);
      } else {
        $("#page-title").text("Buying Centers");
      }
    }
  }
}

// --- FORM HANDLING ---
function validateForm(form) {
  clearErrors();
  const errors = {};
  const isEdit = $("#edit-id").val() !== "";
  const editId = $("#edit-id").val();

  // Overview
  if (!form.account?.trim()) errors.account = "Account is required";
  if (!form.bcName.trim()) errors.bcName = "Buying Center is required";
  if (!form.description.trim())
    errors.description = "Services/Description is required";
  if (!form.superboss.trim()) errors.superboss = "Superboss is required";
  if (!form.superbossDesignation.trim()) errors.superbossDesignation = "Super Boss Designation is required";

  // Validate key stakeholders - at least one required
  const activeKeyStakeholders = form.keyStakeholders.filter(ks => ks.flag !== 'N');
  if (!activeKeyStakeholders || activeKeyStakeholders.length === 0) {
    errors.keyStakeholders = "At least one Key Stakeholder is required";
  } else {
    form.keyStakeholders.forEach((ks, actualIdx) => {
      if (ks.flag !== 'N') {
        if (!ks.name?.trim()) {
          errors[`ks_${actualIdx} _name`] = `Key Stakeholder ${actualIdx + 1}: Name is required`;
        }
        if (!ks.designation?.trim()) {
          errors[`ks_${actualIdx} _designation`] = `Key Stakeholder ${actualIdx + 1}: Designation is required`;
        }
      }
    });
  }

  if (!form.bcType) errors.bcType = "Type is required";

  // Check for duplicate buying center name
  if (form.bcName && form.bcName.trim()) {
    const isDuplicate = checkDuplicateBuyingCenter(form.bcName, form.account, isEdit, editId);
    if (isDuplicate) {
      errors.bcName = "Buying Center name already exists. Please choose a different name.";
    }
  }

  // Validate overview prize field
  if (form.sop1y !== undefined && form.sop1y !== null && form.sop1y !== "") {
    if (!validatePrizeInput(form.sop1y.toString())) {
      errors.sop1y = "Size of Prize $ must be a valid number (e.g., 257,666,767)";
    }
  }

  // // Stakeholders - now mandatory (at least one required), and if added must be filled with mandatory fields
  const activeStakeholders = form.stakeholders.filter(s => !s.isDeleted);
  // if (activeStakeholders.length === 0) {
  //   errors.stakeholders = "At least one stakeholder is required";
  // }

  // Group stakeholders by key stakeholder name
  const stakeholdersByKey = {};
  activeStakeholders.forEach((s, idx) => {
    const keyName = s.keyStakeholder?.trim() || "";
    if (!stakeholdersByKey[keyName]) {
      stakeholdersByKey[keyName] = [];
    }
    stakeholdersByKey[keyName].push({ ...s, originalIdx: form.stakeholders.findIndex(stakeholder => stakeholder === s) });
  });

  // Validate each group
  Object.entries(stakeholdersByKey).forEach(([keyName, stakeholders]) => {
    if (!keyName) {
      // No key stakeholder selected - require key stakeholder
      stakeholders.forEach(s => {
        if (!s.keyStakeholder?.trim()) {
          errors[`s_${s.originalIdx} _keyStakeholder`] = `Row ${s.originalIdx + 1}: Key Stakeholder is required`;
        }
      });
    } else {
      // Key stakeholder selected - count empty entries
      const emptyEntries = stakeholders.filter(s => !s.name?.trim() && !s.designation?.trim());
      const excessEmptyCount = emptyEntries.length - 1; // Allow one empty entry per key stakeholder

      if (excessEmptyCount > 0) {
        // Show errors for the excess empty entries (starting from the 2nd empty entry)
        emptyEntries.slice(1).forEach(s => {
          errors[`s_${s.originalIdx} _designation`] = `Row ${s.originalIdx + 1}: Multiple empty stakeholder entries are not allowed for the same Key Stakeholder.`;
        });
      }
    }
  });

  // Validate stakeholder prize field (optional, but must be valid format if provided)
  activeStakeholders.forEach(s => {
    const originalIdx = form.stakeholders.findIndex(stakeholder => stakeholder === s);
    if (s.prize !== undefined && s.prize !== null && s.prize !== "") {
      if (!validatePrizeInput(s.prize.toString())) {
        errors[`s_${originalIdx} _prize`] = `Row ${originalIdx + 1}: Size of Prize $ must be a valid number(e.g., 257, 666, 767)`;
      }
    }
  });

  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    // Switch to tab with the first error only if not already on that tab
    const onOverview =
      errors.account ||
      errors.bcName ||
      errors.description ||
      errors.bcType ||
      errors.superboss ||
      errors.designation ||
      errors.keyStakeholders ||
      Object.keys(errors).some(k => k.startsWith('ks_')) ||
      errors.sop1y;
    setActiveTab(onOverview ? "overview" : "stakeholders");
    // const errorTab = onOverview ? "overview" : "stakeholders";
    // const currentTab = $(".tab-btn.active").data("tab");
    // if (currentTab !== errorTab) {
    //   setActiveTab(errorTab);
    // }
    return false;
  }
  return true;
}

function showErrors(errors) {
  // Clear previous field error highlighting
  $("#stakeholders-table .form-select, #stakeholders-table .form-input").removeClass('field-error');

  // Overview errors
  $("#account")
    .next(".error-message")
    .text(errors.account || "");
  $("#bcName")
    .next(".error-message")
    .text(errors.bcName || "");
  $("#description")
    .next(".error-message")
    .text(errors.description || "");
  $("#superboss")
    .next(".error-message")
    .text(errors.superboss || "");
  $("#superbossDesignation")
    .next(".error-message")
    .text(errors.superbossDesignation || "");
  $("#bcType")
    .next(".error-message")
    .text(errors.bcType || "");
  $("#sop1y")
    .next(".error-message")
    .text(errors.sop1y || "");

  // Key stakeholders error
  $("#key-stakeholders-error").text(errors.keyStakeholders || "");

  // Key stakeholder row errors
  $("#key-stakeholders-list .key-stakeholder-row").each(function () {
    const $row = $(this);
    const actualIndex = parseInt($row.data('index'));
    const nameError = errors[`ks_${actualIndex} _name`] || "";
    const designationError = errors[`ks_${actualIndex} _designation`] || "";

    // Show errors in the row
    $row.find('input[name="key_stakeholder_name"]').next('.error-message').remove();
    $row.find('input[name="key_stakeholder_designation"]').next('.error-message').remove();

    if (nameError) {
      $row.find('input[name="key_stakeholder_name"]').after(`<p class="error-message">${nameError}</p>`);
    }
    if (designationError) {
      $row.find('input[name="key_stakeholder_designation"]').after(`<p class="error-message">${designationError}</p>`);
    }
  });

  // Stakeholder container error
  $("#stakeholders-error").text(errors.stakeholders || "");
  // Stakeholder row errors
  const $rowErrors = $("#stakeholder-row-errors");
  $rowErrors.empty();
  Object.entries(errors)
    .filter(([k]) => k.startsWith("s_"))
    .forEach(([k, v]) => $rowErrors.append(`<div>${v}</div>`));

  // Highlight stakeholder fields with errors
  $("#stakeholders-table-body tr").each(function () {
    const $row = $(this);
    const rowIndex = parseInt($row.data('index'));

    if (errors[`s_${rowIndex} _stakeholder`]) {
      // Both empty, highlight designation (2nd field)
      $row.find('[name="s_designation"]').addClass('field-error');
    }
    if (errors[`s_${rowIndex} _name`]) {
      $row.find('[name="s_name"]').addClass('field-error');
    }
    if (errors[`s_${rowIndex} _designation`]) {
      $row.find('[name="s_designation"]').addClass('field-error');
    }
    if (errors[`s_${rowIndex} _keyStakeholder`]) {
      $row.find('[name="s_keyStakeholder"]').addClass('field-error');
    }
  });

  // Show toaster error message with all errors
  const errorMessages = Object.values(errors).filter(msg => msg && msg.trim());
  if (errorMessages.length > 0) {
    toastr.options.timeOut = 5000; // Show longer for detailed validation errors
    const errorText = errorMessages.join('<br>');
    toastr.error(errorText);
  }
}

function clearErrors() {
  $(".error-message, #stakeholders-error, #stakeholder-row-errors, #key-stakeholders-error").text("");
  // Remove individual field errors
  $("#key-stakeholders-list .error-message").remove();
  // Remove field error highlighting
  $("#stakeholders-table .form-select, #stakeholders-table .form-input").removeClass('field-error');
}

function getFormData() {
  // Get key stakeholders from the overview panel first
  const keyStakeholders = (window.originalKeyStakeholders || []).map(ks => ({ ...ks }));
  $("#key-stakeholders-list .key-stakeholder-row").each(function () {
    const $row = $(this);
    const index = parseInt($row.data('index'));
    const name = $row.find('input[name="key_stakeholder_name"]').val();
    const designation = $row.find('input[name="key_stakeholder_designation"]').val();
    if (keyStakeholders[index]) {
      keyStakeholders[index].name = name ? name.trim() : "";
      keyStakeholders[index].designation = designation ? designation.trim() : "";
    }
  });

  // Get existing stakeholders for edit mode to preserve stakeholderId
  const id = $("#edit-id").val();
  const existingItem = id ? state.items.find(item => item.id === id) : null;
  const existingStakeholders = existingItem ? existingItem.stakeholders : [];

  const stakeholders = [];
  $("#stakeholders-table-body tr").each(function (index) {
    const $row = $(this);
    if ($row.find("td").length > 1) {
      // ignore empty message row
      const selectedKeyStakeholderName = $row.find('[name="s_keyStakeholder"]').val();

      // Find the corresponding key stakeholder object
      const selectedKeyStakeholder = keyStakeholders.find(ks => ks.name === selectedKeyStakeholderName && ks.flag !== 'N');

      // Get existing stakeholderId if available
      const existingStakeholder = existingStakeholders[index];
      const stakeholderId = existingStakeholder ? existingStakeholder.stakeholderId || "" : "";

      const stakeholder = {
        name: $row.find('[name="s_name"]').val(),
        designation: $row.find('[name="s_designation"]').val(),
        status: $row.find('[name="s_status"]').val(),
        keyDirects: $row.find('[name="s_keyDirects"]').val(),
        stakeholderType: $row.find('[name="s_stakeholderType"]').val(),
        keyStakeholder: selectedKeyStakeholderName,
        keyStakeholderId: selectedKeyStakeholder ? selectedKeyStakeholder.id || "" : "",
        keyStakeholderName: selectedKeyStakeholder ? selectedKeyStakeholder.name || "" : "",
        keyStakeholderDesignation: selectedKeyStakeholder ? selectedKeyStakeholder.designation || "" : "",
        stakeholderId: stakeholderId,
        factspanOwner: "", // Set to empty since field is hidden
        comments: $row.find('[name="s_comments"]').val(),
        level: $row.find('[name="s_level"]').val() || undefined,
        prize: parsePrizeValue($row.find('[name="s_prize"]').val()),
        isNew: $row.find('[name="s_isNew"]').val() === 'true',
      };

      // Check if this row has the deleted class to determine if it's marked as deleted
      const isDeleted = $row.hasClass('stakeholder-deleted') || $row.css('opacity') === '0.6';
      if (isDeleted) {
        stakeholder.isDeleted = true;
      }

      stakeholders.push(stakeholder);
    }
  });

  // Get FS partner assignments for each stakeholder from the FS Partners table
  const fsPartnerAssignments = [];
  $("#fs-partners-table-body tr").each(function (index) {
    const $row = $(this);
    const stakeholderIndex = parseInt($row.attr('data-index'));
    const stakeholderName = $row.find('[name="fs_stakeholder_name"]').val();

    const assignment = {
      stakeholderIndex: stakeholderIndex,
      stakeholderName: stakeholderName,
      gp: $row.find('[name="fs_growth_partner"]').val() || "",
      dp: $row.find('[name="fs_delivery_partner"]').val() || "",
      cp: $row.find('[name="fs_client_partner"]').val() || "",
      tech: $row.find('[name="fs_sme_partner_tech"]').val() || ""
    };
    fsPartnerAssignments.push(assignment);

    // Assign to the stakeholder at the specified index
    if (stakeholders[stakeholderIndex] && !stakeholders[stakeholderIndex].isDeleted) {
      stakeholders[stakeholderIndex].fsGrowthPartner = assignment.gp;
      stakeholders[stakeholderIndex].fsDeliveryPartner = assignment.dp;
      stakeholders[stakeholderIndex].fsClientPartner = assignment.cp;
      stakeholders[stakeholderIndex].fsSmePartnerTech = assignment.tech;
    }
  });

  // Get account value - handle both dropdown and pre-selected display
  let accountValue = $("#account").val();
  if (!accountValue && state.urlParams && state.urlParams.accountName) {
    // If dropdown is hidden, get value from display element
    const $displayElement = $("#account").siblings(".form-input").first();
    if ($displayElement.length > 0) {
      accountValue = $displayElement.text();
    }
  }

  return {
    account: accountValue,
    bcName: $("#bcName").val(),
    description: $("#description").val(),
    superboss: $("#superboss").val(),
    superbossDesignation: $("#superbossDesignation").val(),
    keyStakeholders: keyStakeholders,
    bcType: $("#bcType").val(),
    sop1y: parsePrizeValue($("#sop1y").val()),
    stakeholders: stakeholders,
    fsPartnerAssignments: fsPartnerAssignments,
    fsGrowthPartner: {
      name: $("#fsGrowthPartner").val(),
      designation: $("#fsGrowthPartnerDesignation").val(),
      stakeholders: $("#fsGrowthPartnerStakeholders").val() || []
    },
    fsClientPartner: {
      name: $("#fsClientPartner").val(),
      designation: $("#fsClientPartnerDesignation").val(),
      stakeholders: $("#fsClientPartnerStakeholders").val() || []
    },
    fsDeliveryPartner: {
      name: $("#fsDeliveryPartner").val(),
      designation: $("#fsDeliveryPartnerDesignation").val(),
      stakeholders: $("#fsDeliveryPartnerStakeholders").val() || []
    },
    smePartnerTech: {
      name: $("#smePartnerTech").val(),
      designation: $("#smePartnerTechDesignation").val(),
      stakeholders: $("#smePartnerTechStakeholders").val() || []
    },
  };
}



// --- AUTO-EXPAND TEXTAREA FUNCTIONALITY ---
function initializeAutoExpandTextareas() {
  // Function to auto-expand textarea height
  function autoExpandTextarea(textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set height to scrollHeight to fit content, but ensure minimum height
    const scrollHeight = textarea.scrollHeight;
    const minHeight = 40; // Minimum height in pixels (2.5rem)
    textarea.style.height = Math.max(scrollHeight, minHeight) + 'px';
  }

  // Initialize auto-expand for all textareas with auto-expand class
  $('.auto-expand').each(function () {
    const textarea = this;

    // Set initial height
    autoExpandTextarea(textarea);

    // Add input event listener to auto-expand on typing
    $(textarea).on('input', function () {
      autoExpandTextarea(this);
    });

    // Also handle paste events
    $(textarea).on('paste', function () {
      setTimeout(() => autoExpandTextarea(this), 0);
    });

    // Handle focus event to ensure proper height
    $(textarea).on('focus', function () {
      autoExpandTextarea(this);
    });
  });
}

// --- EVENT LISTENERS ---
$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const fromParam = urlParams.get('from');
  if (fromParam === 'engagement' || fromParam === 'accountCreation') {
      $('.navbar').hide();
      $('.page-header').hide();
      $('#sidebar').hide();
      $('.content').css('margin-left', '0');
      $('.content').css('padding-top', '0');
      $('<link rel="stylesheet" type="text/css" href="css/iframe_overrides.css">').appendTo("head");
  }
  
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SYNC_ENGAGEMENT_DATA') {
      console.log('Received data from Engagement iframe', event.data.payload);
      if (window.processApiData) {
        window.processApiData(event.data.payload);
      }
    }
  });
  $("#go-create-btn").on("click", goToCreate);
  $("#go-list-btn").on("click", goToList);

  $("#edit-mode-btn").on("click", function () {
    state.isReadOnly = false;
    state.isStakeholderLocked = false;
    sessionStorage.setItem("activeBuyingCenterReadOnly", "false");
    render();
  });

  $("#directory-table-body").on("click", "tr", function () {
    const id = $(this).data("id");
    if (id) goToEdit(id);
  });

  $("#flash-message-container").on("click", "#dismiss-flash", function () {
    state.flashId = null;
    $("#flash-message-container").addClass("hidden");
  });

  $(".tab-btn").on("click", function () {
    setActiveTab($(this).data("tab"));
  });

  $("#add-stakeholder-btn").on("click", function () {
    if (state.isReadOnly) return;
    // Capture current FS partner selections before re-rendering
    const currentFSPartnerSelections = {};
    $("#fs-partners-table-body tr").each(function (index) {
      const $row = $(this);
      const stakeholderName = $row.find('[name="fs_stakeholder_name"]').val();
      if (stakeholderName && stakeholderName.trim()) {
        currentFSPartnerSelections[index] = {
          gp: $row.find('[name="fs_growth_partner"]').val() || "",
          dp: $row.find('[name="fs_delivery_partner"]').val() || "",
          cp: $row.find('[name="fs_client_partner"]').val() || "",
          tech: $row.find('[name="fs_sme_partner_tech"]').val() || ""
        };
      }
    });

    let currentStakeholders = getFormData().stakeholders;
    currentStakeholders.push({
      name: "",
      designation: "",
      status: "Net New",
      stakeholderType: "Decision Maker",
      factspanOwner: "",
      prize: undefined,
      isNew: true, // Flag to identify newly added stakeholders
    });
    const isEdit = $("#edit-id").val() !== "";
    renderStakeholdersTable(currentStakeholders, isEdit);

    // Re-render FS Partners table to include the new stakeholder
    renderFSPartnersTable(currentStakeholders, isEdit);

    // Restore the captured FS partner selections
    $("#fs-partners-table-body tr").each(function (index) {
      const $row = $(this);
      if (currentFSPartnerSelections[index]) {
        $row.find('[name="fs_growth_partner"]').val(currentFSPartnerSelections[index].gp).trigger('change');
        $row.find('[name="fs_delivery_partner"]').val(currentFSPartnerSelections[index].dp).trigger('change');
        $row.find('[name="fs_client_partner"]').val(currentFSPartnerSelections[index].cp).trigger('change');
        $row.find('[name="fs_sme_partner_tech"]').val(currentFSPartnerSelections[index].tech).trigger('change');
      }
    });

    // Refresh partner stakeholder dropdowns with updated list
    populateStakeholdersDropdown("fsGrowthPartnerStakeholders", $("#fsGrowthPartnerStakeholders").val(), currentStakeholders);
    populateStakeholdersDropdown("fsClientPartnerStakeholders", $("#fsClientPartnerStakeholders").val(), currentStakeholders);
    populateStakeholdersDropdown("fsDeliveryPartnerStakeholders", $("#fsDeliveryPartnerStakeholders").val(), currentStakeholders);
    populateStakeholdersDropdown("smePartnerTechStakeholders", $("#smePartnerTechStakeholders").val(), currentStakeholders);
  });

  function deleteStakeholderDirectly(index, currentStakeholders) {
    if (!currentStakeholders) {
      currentStakeholders = getFormData().stakeholders;
    }
    const stakeholder = currentStakeholders[index];
    const isNewRow = stakeholder.isNew || false;

    if (isNewRow) {
      // For new rows, remove completely from array
      currentStakeholders.splice(index, 1);
    } else {
      // For existing rows, mark as deleted but keep in array
      currentStakeholders[index].isDeleted = true;
    }

    const isEdit = $("#edit-id").val() !== "";
    renderStakeholdersTable(currentStakeholders, isEdit);
  }

  // Add restore functionality for deleted stakeholders
  $("#stakeholders-table-body").on("click", ".restore-stakeholder-btn", function () {
    if (state.isReadOnly) return;
    const index = $(this).data("index");
    let currentStakeholders = getFormData().stakeholders;

    // Restore the deleted stakeholder
    currentStakeholders[index].isDeleted = false;

    // Remove from deletedEntitiesMap if it was registered there
    const shId = currentStakeholders[index].stakeholderId || currentStakeholders[index].id || "";
    const shName = currentStakeholders[index].name || "";
    if (window.deletedEntitiesMap) {
      window.deletedEntitiesMap = window.deletedEntitiesMap.filter(item => {
        const isMatch = (
          item.deleted_entity_type === "STAKEHOLDER" &&
          ((shId && item.deleted_entity_id === shId) || (shName && item.deleted_entity_name === shName))
        );
        return !isMatch;
      });
    }

    const isEdit = $("#edit-id").val() !== "";
    renderStakeholdersTable(currentStakeholders, isEdit);

    // Re-render FS Partners table to reflect the restoration
    renderFSPartnersTable(currentStakeholders, isEdit);

    // Refresh partner stakeholder dropdowns with updated list
    populateStakeholdersDropdown("fsGrowthPartnerStakeholders", $("#fsGrowthPartnerStakeholders").val(), currentStakeholders);
    populateStakeholdersDropdown("fsClientPartnerStakeholders", $("#fsClientPartnerStakeholders").val(), currentStakeholders);
    populateStakeholdersDropdown("fsDeliveryPartnerStakeholders", $("#fsDeliveryPartnerStakeholders").val(), currentStakeholders);
    populateStakeholdersDropdown("smePartnerTechStakeholders", $("#smePartnerTechStakeholders").val(), currentStakeholders);
  });



  $("#buying-center-form").on("submit", function (e) {
    e.preventDefault();
    const id = $("#edit-id").val();
    const payload = getFormData();

    if (!validateForm(payload)) {
      return;
    }

    // Show loading state and disable all form fields
    const $submitBtn = $("#form-submit-btn");
    const originalText = $submitBtn.text();
    $submitBtn.text("Saving...").prop("disabled", true);
    $("#buying-center-form input, #buying-center-form textarea, #buying-center-form select, #buying-center-form button").prop("disabled", true);

    // Prepare API payload
    const apiPayload = {
      account: payload.account,
      bcName: payload.bcName,
      description: payload.description,
      superboss: payload.superboss,
      superbossDesignation: payload.superbossDesignation,
      bcType: payload.bcType,
      sop1y: payload.sop1y,
      stakeholders: payload.stakeholders.map(stakeholder => ({
        STAKEHOLDER: stakeholder.name,
        STAKEHOLDER_DESIGNATION: stakeholder.designation,
        STAKEHOLDER_STATUS: stakeholder.status,
        KEY_DIRECTS: stakeholder.keyDirects || "",
        STAKEHOLDER_TYPE: stakeholder.stakeholderType || "",
        FACTSPAN_OWNER: stakeholder.factspanOwner,
        LEVEL: stakeholder.level || "",
        COMMENTS: stakeholder.comments || "",
        PRIZE: stakeholder.prize || 0,
        STAKEHOLDER_ACTIVE_FLAG: "Y"
      }))
    };

    // Make API call to save buying center using stakeholders endpoint
    const apiURL = apiValue.url.replace("/app", "/stakeholders");
    let empId = localStorage.getItem("EmpUserID");
    let emp_email = localStorage.getItem("email");
    let empName = localStorage.getItem("EmpUserName");
    // Get account ID from URL parameters or use account name as fallback
    const accountId = (state.urlParams && state.urlParams.accountId) ? state.urlParams.accountId : payload.account;

    // Transform payload to match the new stakeholders endpoint format
    function getEmployeeIdByName(name) {
      if (!name) return "";
      const emp = (state.employeeList || []).find(e => e.EMPLOYEE_NAME && e.EMPLOYEE_NAME.trim() === name.trim());
      return emp ? emp.EMPLOYEE_ID : "";
    }

    const isEdit = id !== "";
    const oldItem = isEdit ? (state.items.find(it => it.id === id) || null) : null;

    const userDetails = {
      user_id: empId || "",
      username: empName || "",
      email_id: emp_email || sessionName || ""
    };

    const bc_master = {
      operation: isEdit ? "EDIT" : "ADD",
      bc_id: isEdit && oldItem ? (oldItem.bcId || "") : "",
      account_id: accountId,
      bc_name: payload.bcName,
      description: payload.description,
      bc_type: payload.bcType,
      size_of_prize: String(payload.sop1y || 0),
      field_changes: [],
      reason: "",
      notes: ""
    };

    if (isEdit && oldItem) {
      if ((oldItem.bcName || "").trim() !== (payload.bcName || "").trim()) {
        bc_master.field_changes.push({
          field_name: "BC_NAME",
          old_value: oldItem.bcName || "",
          new_value: payload.bcName || "",
          old_id: "",
          new_id: ""
        });
      }
      if ((oldItem.description || "").trim() !== (payload.description || "").trim()) {
        bc_master.field_changes.push({
          field_name: "DESCRIPTION",
          old_value: oldItem.description || "",
          new_value: payload.description || "",
          old_id: "",
          new_id: ""
        });
      }
      if ((oldItem.bcType || "").trim() !== (payload.bcType || "").trim()) {
        bc_master.field_changes.push({
          field_name: "BC_TYPE",
          old_value: oldItem.bcType || "",
          new_value: payload.bcType || "",
          old_id: "",
          new_id: ""
        });
      }
      if (Number(oldItem.sop1y || 0) !== Number(payload.sop1y || 0)) {
        bc_master.field_changes.push({
          field_name: "SIZE_OF_PRIZE",
          old_value: String(oldItem.sop1y || 0),
          new_value: String(payload.sop1y || 0),
          old_id: "",
          new_id: ""
        });
      }
    }

    const superbosses = [];
    const superbossName = (payload.superboss || "").trim();
    const superbossDesg = (payload.superbossDesignation || "").trim();
    const isSbAdd = !isEdit || !oldItem || !(oldItem.superboss || "").trim();

    if (isSbAdd) {
      superbosses.push({
        operation: "ADD",
        ref_id: "sb_main",
        superboss_id: "",
        superboss_name: superbossName,
        designation: superbossDesg,
        display_order: 1,
        field_changes: [],
        incoming_name: "",
        incoming_designation: "",
        reason: "",
        notes: ""
      });
    } else if ((oldItem.superboss || "").trim() !== superbossName) {
      const sbFieldChanges = [];
      sbFieldChanges.push({
        field_name: "SUPERBOSS_NAME",
        old_value: oldItem.superboss || "",
        new_value: superbossName,
        old_id: "",
        new_id: ""
      });
      if ((oldItem.superbossDesignation || "").trim() !== superbossDesg) {
        sbFieldChanges.push({
          field_name: "DESIGNATION",
          old_value: oldItem.superbossDesignation || "",
          new_value: superbossDesg,
          old_id: "",
          new_id: ""
        });
      }
      superbosses.push({
        operation: "REPLACE",
        superboss_id: oldItem.superbossId || "",
        superboss_name: oldItem.superboss || "",
        designation: oldItem.superbossDesignation || "",
        display_order: 1,
        field_changes: sbFieldChanges,
        incoming_name: superbossName,
        incoming_designation: superbossDesg,
        reason: "",
        notes: ""
      });
    } else {
      const sbFieldChanges = [];
      if ((oldItem.superbossDesignation || "").trim() !== superbossDesg) {
        sbFieldChanges.push({
          field_name: "DESIGNATION",
          old_value: oldItem.superbossDesignation || "",
          new_value: superbossDesg,
          old_id: "",
          new_id: ""
        });
      }
      superbosses.push({
        operation: "EDIT",
        superboss_id: oldItem.superbossId || "",
        superboss_name: superbossName,
        designation: superbossDesg,
        display_order: 1,
        field_changes: sbFieldChanges,
        incoming_name: "",
        incoming_designation: "",
        reason: "",
        notes: ""
      });
    }

    const key_stakeholders = [];
    payload.keyStakeholders.forEach((ks, idx) => {
      const ksName = (ks.name || "").trim();
      const ksDesg = (ks.designation || "").trim();
      
      if (!ksName && (ks.isNew || !ks.id)) return;

      if (!isEdit || !oldItem || ks.isNew || !ks.id) {
        if (ks.flag !== "N") {
          const ksRefId = "ks_" + idx;
          ks.ref_id = ksRefId; // Save ref_id for stakeholder mapping below
          key_stakeholders.push({
            operation: "ADD",
            ref_id: ksRefId,
            key_stakeholder_id: "",
            ks_name: ksName,
            ks_designation: ksDesg,
            factspan_owner: "",
            parent_superboss_id: isSbAdd ? "ref:sb_main" : (oldItem ? oldItem.superbossId || "" : ""),
            parent_superboss_name: superbossName,
            display_order: idx + 1,
            field_changes: [],
            incoming_name: "",
            incoming_designation: "",
            target_tier: "",
            new_parent_superboss_id: "",
            new_bc_id: "",
            new_parent_key_stakeholder_id: "",
            reason: "",
            notes: ""
          });
        }
      } else {
        const oldKs = (oldItem.keyStakeholders || []).find(o => o.id === ks.id);
        if (ks.flag === "N") {
          key_stakeholders.push({
            operation: "DELETE",
            key_stakeholder_id: ks.id,
            ks_name: ksName,
            ks_designation: ksDesg,
            factspan_owner: "",
            parent_superboss_id: "",
            display_order: idx + 1,
            field_changes: [],
            incoming_name: "",
            incoming_designation: "",
            target_tier: "",
            new_parent_superboss_id: "",
            new_bc_id: "",
            new_parent_key_stakeholder_id: "",
            reason: "",
            notes: ""
          });
        } else if (oldKs && (oldKs.name || "").trim() !== ksName) {
          const ksFieldChanges = [];
          ksFieldChanges.push({ field_name: "KEY_STAKEHOLDER_NAME", old_value: oldKs.name || "", new_value: ksName, old_id: "", new_id: "" });
          if ((oldKs.designation || "").trim() !== ksDesg) {
            ksFieldChanges.push({ field_name: "DESIGNATION", old_value: oldKs.designation || "", new_value: ksDesg, old_id: "", new_id: "" });
          }
          key_stakeholders.push({
            operation: "REPLACE",
            key_stakeholder_id: ks.id,
            ks_name: oldKs.name || "",
            ks_designation: oldKs.designation || "",
            factspan_owner: "",
            parent_superboss_id: "",
            display_order: idx + 1,
            field_changes: ksFieldChanges,
            incoming_name: ksName,
            incoming_designation: ksDesg,
            target_tier: "",
            new_parent_superboss_id: "",
            new_bc_id: "",
            new_parent_key_stakeholder_id: "",
            reason: "",
            notes: ""
          });
        } else {
          const ksFieldChanges = [];
          if (oldKs && (oldKs.designation || "").trim() !== ksDesg) {
            ksFieldChanges.push({
              field_name: "DESIGNATION",
              old_value: oldKs.designation || "",
              new_value: ksDesg,
              old_id: "",
              new_id: ""
            });
          }
          key_stakeholders.push({
            operation: "EDIT",
            key_stakeholder_id: ks.id,
            ks_name: ksName,
            ks_designation: ksDesg,
            factspan_owner: "",
            parent_superboss_id: "",
            display_order: idx + 1,
            field_changes: ksFieldChanges,
            incoming_name: "",
            incoming_designation: "",
            target_tier: "",
            new_parent_superboss_id: "",
            new_bc_id: "",
            new_parent_key_stakeholder_id: "",
            reason: "",
            notes: ""
          });
        }
      }
    });

    const stakeholders = [];
    payload.stakeholders.forEach((stk, idx) => {
      const stkName = (stk.name || "").trim();
      const stkDesg = (stk.designation || "").trim();
      const stkType = (stk.stakeholderType || "").trim();
      const stkStatus = (stk.status || "").trim();
      const stkLevel = (stk.level || "").trim();
      const stkPrize = String(stk.prize || 0);
      const stkComments = (stk.comments || "").trim();
      const parentKSId = (stk.keyStakeholderId || "").trim();

      const selectedKS = payload.keyStakeholders.find(k => k.name === stk.keyStakeholder && k.flag !== 'N');
      let resolvedParentKSId = parentKSId;
      if (selectedKS) {
        if (selectedKS.ref_id) {
          resolvedParentKSId = "ref:" + selectedKS.ref_id;
        } else {
          resolvedParentKSId = selectedKS.id || parentKSId;
        }
      }

      if (!isEdit || !oldItem || stk.isNew || !stk.stakeholderId) {
        if (!stk.isDeleted) {
          const stkRefId = "stk_" + idx;
          stk.ref_id = stkRefId; // Save ref_id for key directs and fs partners mapping below
          stakeholders.push({
            operation: "ADD",
            ref_id: stkRefId,
            stakeholder_id: "",
            stakeholder_name: stkName,
            stakeholder_designation: stkDesg,
            stakeholder_type: stkType,
            stakeholder_status: stkStatus,
            stk_type: stkStatus,
            level: stkLevel,
            factspan_owner: "",
            prize: stkPrize,
            comments: stkComments,
            parent_key_stakeholder_id: resolvedParentKSId,
            parent_ks_name: stk.keyStakeholder || "",
            display_order: idx + 1,
            field_changes: [],
            incoming_name: "",
            incoming_designation: "",
            target_tier: "",
            new_parent_superboss_id: "",
            new_parent_key_stakeholder_id: "",
            new_bc_id: "",
            reason: "",
            notes: ""
          });
        }
      } else {
        const oldStk = (oldItem.stakeholders || []).find(o => o.stakeholderId === stk.stakeholderId);
        if (stk.isDeleted) {
          stakeholders.push({
            operation: "DELETE",
            stakeholder_id: stk.stakeholderId,
            stakeholder_name: stkName,
            stakeholder_designation: stkDesg,
            stakeholder_type: stkType,
            stakeholder_status: stkStatus,
            stk_type: stkStatus,
            level: stkLevel,
            factspan_owner: "",
            prize: stkPrize,
            comments: stkComments,
            parent_key_stakeholder_id: resolvedParentKSId,
            parent_ks_name: stk.keyStakeholder || "",
            display_order: idx + 1,
            field_changes: [],
            incoming_name: "",
            incoming_designation: "",
            target_tier: "",
            new_parent_superboss_id: "",
            new_parent_key_stakeholder_id: "",
            new_bc_id: "",
            reason: "",
            notes: ""
          });
        } else if (oldStk && (oldStk.name || "").trim() !== stkName) {
          const stkFieldChanges = [];
          stkFieldChanges.push({ field_name: "STAKEHOLDER_NAME", old_value: oldStk.name || "", new_value: stkName, old_id: "", new_id: "" });
          if ((oldStk.designation || "").trim() !== stkDesg) {
            stkFieldChanges.push({ field_name: "DESIGNATION", old_value: oldStk.designation || "", new_value: stkDesg, old_id: "", new_id: "" });
          }
          if ((oldStk.stakeholderType || "").trim() !== stkType) {
            stkFieldChanges.push({ field_name: "STAKEHOLDER_TYPE", old_value: oldStk.stakeholderType || "", new_value: stkType, old_id: "", new_id: "" });
          }
          if ((oldStk.status || "").trim() !== stkStatus) {
            stkFieldChanges.push({ field_name: "STAKEHOLDER_STATUS", old_value: oldStk.status || "", new_value: stkStatus, old_id: "", new_id: "" });
          }
          if ((oldStk.level || "").trim() !== stkLevel) {
            stkFieldChanges.push({ field_name: "LEVEL", old_value: oldStk.level || "", new_value: stkLevel, old_id: "", new_id: "" });
          }
          const oldParentName = (oldStk.keyStakeholder || oldStk.keyStakeholderName || "").trim();
          const newParentName = (stk.keyStakeholder || stk.keyStakeholderName || "").trim();
          const oldParentId = (oldStk.keyStakeholderId || "").trim();
          const newParentId = parentKSId.trim();
          if (oldParentName !== newParentName) {
            stkFieldChanges.push({
              field_name: "PARENT_KS_NAME",
              old_value: oldParentName,
              new_value: newParentName,
              old_id: oldParentId,
              new_id: newParentId
            });
          }
          if (oldParentId !== newParentId) {
            stkFieldChanges.push({
              field_name: "PARENT_KEY_STAKEHOLDER_ID",
              old_value: oldParentName,
              new_value: newParentName,
              old_id: oldParentId,
              new_id: newParentId
            });
          }
          if ((oldStk.comments || "").trim() !== stkComments) {
            stkFieldChanges.push({ field_name: "COMMENTS", old_value: oldStk.comments || "", new_value: stkComments, old_id: "", new_id: "" });
          }
          const normalizedOldPrize = String(oldStk.prize || 0);
          const normalizedNewPrize = stkPrize === "" ? "0" : stkPrize;
          if (normalizedOldPrize !== normalizedNewPrize) {
            stkFieldChanges.push({ field_name: "PRIZE", old_value: normalizedOldPrize, new_value: normalizedNewPrize, old_id: "", new_id: "" });
          }
          const oldKeyDirects = (oldStk.keyDirects || "").trim();
          const newKeyDirects = (stk.keyDirects || "").trim();
          if (oldKeyDirects !== newKeyDirects) {
            stkFieldChanges.push({ field_name: "KEY_DIRECTS", old_value: oldKeyDirects, new_value: newKeyDirects, old_id: "", new_id: "" });
          }
          stakeholders.push({
            operation: "REPLACE",
            stakeholder_id: stk.stakeholderId,
            stakeholder_name: oldStk.name || "",
            stakeholder_designation: oldStk.designation || "",
            stakeholder_type: oldStk.stakeholderType || "",
            stakeholder_status: oldStk.status || "",
            stk_type: oldStk.status || "",
            level: oldStk.level || "",
            factspan_owner: "",
            prize: String(oldStk.prize || 0),
            comments: oldStk.comments || "",
            parent_key_stakeholder_id: resolvedParentKSId,
            parent_ks_name: stk.keyStakeholder || "",
            display_order: idx + 1,
            field_changes: stkFieldChanges,
            incoming_name: stkName,
            incoming_designation: stkDesg,
            target_tier: "",
            new_parent_superboss_id: "",
            new_parent_key_stakeholder_id: "",
            new_bc_id: "",
            reason: "",
            notes: ""
          });
        } else {
          const stkFieldChanges = [];
          if (oldStk) {
            if ((oldStk.designation || "").trim() !== stkDesg) {
              stkFieldChanges.push({ field_name: "DESIGNATION", old_value: oldStk.designation || "", new_value: stkDesg, old_id: "", new_id: "" });
            }
            if ((oldStk.stakeholderType || "").trim() !== stkType) {
              stkFieldChanges.push({ field_name: "STAKEHOLDER_TYPE", old_value: oldStk.stakeholderType || "", new_value: stkType, old_id: "", new_id: "" });
            }
            if ((oldStk.status || "").trim() !== stkStatus) {
              stkFieldChanges.push({ field_name: "STAKEHOLDER_STATUS", old_value: oldStk.status || "", new_value: stkStatus, old_id: "", new_id: "" });
            }
            if ((oldStk.level || "").trim() !== stkLevel) {
              stkFieldChanges.push({ field_name: "LEVEL", old_value: oldStk.level || "", new_value: stkLevel, old_id: "", new_id: "" });
            }
            const normalizedOldPrize = String(oldStk.prize || 0);
            const normalizedNewPrize = stkPrize === "" ? "0" : stkPrize;
            if (normalizedOldPrize !== normalizedNewPrize) {
              stkFieldChanges.push({ field_name: "PRIZE", old_value: normalizedOldPrize, new_value: normalizedNewPrize, old_id: "", new_id: "" });
            }
            if ((oldStk.comments || "").trim() !== stkComments) {
              stkFieldChanges.push({ field_name: "COMMENTS", old_value: oldStk.comments || "", new_value: stkComments, old_id: "", new_id: "" });
            }
            const oldParentName = (oldStk.keyStakeholder || oldStk.keyStakeholderName || "").trim();
            const newParentName = (stk.keyStakeholder || stk.keyStakeholderName || "").trim();
            const oldParentId = (oldStk.keyStakeholderId || "").trim();
            const newParentId = parentKSId.trim();
            if (oldParentName !== newParentName) {
              stkFieldChanges.push({
                field_name: "PARENT_KS_NAME",
                old_value: oldParentName,
                new_value: newParentName,
                old_id: oldParentId,
                new_id: newParentId
              });
            }
            if (oldParentId !== newParentId) {
              stkFieldChanges.push({
                field_name: "PARENT_KEY_STAKEHOLDER_ID",
                old_value: oldParentName,
                new_value: newParentName,
                old_id: oldParentId,
                new_id: newParentId
              });
            }
            const oldKeyDirects = (oldStk.keyDirects || "").trim();
            const newKeyDirects = (stk.keyDirects || "").trim();
            if (oldKeyDirects !== newKeyDirects) {
              stkFieldChanges.push({ field_name: "KEY_DIRECTS", old_value: oldKeyDirects, new_value: newKeyDirects, old_id: "", new_id: "" });
            }
          }
          stakeholders.push({
            operation: "EDIT",
            stakeholder_id: stk.stakeholderId,
            stakeholder_name: stkName,
            stakeholder_designation: stkDesg,
            stakeholder_type: stkType,
            stakeholder_status: stkStatus,
            stk_type: stkStatus,
            level: stkLevel,
            factspan_owner: "",
            prize: stkPrize,
            comments: stkComments,
            parent_key_stakeholder_id: resolvedParentKSId,
            parent_ks_name: stk.keyStakeholder || "",
            display_order: idx + 1,
            field_changes: stkFieldChanges,
            incoming_name: "",
            incoming_designation: "",
            target_tier: "",
            new_parent_superboss_id: "",
            new_parent_key_stakeholder_id: "",
            new_bc_id: "",
            reason: "",
            notes: ""
          });
        }
      }
    });

    const key_directs = [];
    payload.stakeholders.forEach((stk) => {
      if (stk.isDeleted) return;

      const currentDirects = (stk.keyDirects || "").split(",").map(d => d.trim()).filter(d => d !== "");
      const resolvedParentStkId = stk.ref_id ? "ref:" + stk.ref_id : (stk.stakeholderId || "");

      if (!isEdit || !oldItem || stk.isNew || !stk.stakeholderId) {
        currentDirects.forEach(name => {
          key_directs.push({
            operation: "ADD",
            key_direct_id: "",
            key_direct_name: name,
            key_direct_designation: "",
            parent_stakeholder_id: resolvedParentStkId,
            parent_stakeholder_name: stk.name || "",
            display_order: 1,
            field_changes: [],
            incoming_name: "",
            incoming_designation: "",
            reason: "",
            notes: ""
          });
        });
      } else {
        const oldStk = (oldItem.stakeholders || []).find(o => o.stakeholderId === stk.stakeholderId);
        const existingDirectsList = oldStk ? (oldStk.keyDirectsList || []) : [];

        currentDirects.forEach(name => {
          const existingDirect = existingDirectsList.find(d => d.name === name);
          if (existingDirect) {
            key_directs.push({
              operation: "EDIT",
              key_direct_id: existingDirect.id || "",
              key_direct_name: name,
              key_direct_designation: "",
              parent_stakeholder_id: stk.stakeholderId,
              display_order: 1,
              field_changes: [],
              incoming_name: "",
              incoming_designation: "",
              reason: "",
              notes: ""
            });
          } else {
            key_directs.push({
              operation: "ADD",
              key_direct_id: "",
              key_direct_name: name,
              key_direct_designation: "",
              parent_stakeholder_id: resolvedParentStkId,
              parent_stakeholder_name: stk.name || "",
              display_order: 1,
              field_changes: [],
              incoming_name: "",
              incoming_designation: "",
              reason: "",
              notes: ""
            });
          }
        });

        existingDirectsList.forEach(kd => {
          if (!currentDirects.includes(kd.name)) {
            key_directs.push({
              operation: "DELETE",
              key_direct_id: kd.id || "",
              key_direct_name: kd.name,
              key_direct_designation: "",
              parent_stakeholder_id: stk.stakeholderId,
              display_order: 1,
              field_changes: [],
              incoming_name: "",
              incoming_designation: "",
              reason: "",
              notes: ""
            });
          }
        });
      }
    });

    const fs_partners = [];
    payload.stakeholders.forEach((stk) => {
      if (stk.isDeleted) return;

      const gp_name = (stk.fsGrowthPartner || "").trim();
      const dp_name = (stk.fsDeliveryPartner || "").trim();
      const cp_name = (stk.fsClientPartner || "").trim();
      const tech_name = (stk.fsSmePartnerTech || "").trim();

      let old_gp_name = "";
      let old_dp_name = "";
      let old_cp_name = "";
      let old_tech_name = "";

      if (isEdit && oldItem && !stk.isNew && stk.stakeholderId) {
        const oldStk = (oldItem.stakeholders || []).find(o => o.stakeholderId === stk.stakeholderId);
        if (oldStk) {
          old_gp_name = (oldStk.fsGrowthPartner || oldStk.GP || "").trim();
          old_dp_name = (oldStk.fsDeliveryPartner || oldStk.DP || "").trim();
          old_cp_name = (oldStk.fsClientPartner || oldStk.CP || "").trim();
          old_tech_name = (oldStk.fsSmePartnerTech || oldStk.TECH || "").trim();
        }
      }

      const assignments = [];
      const partnerFieldChanges = [];

      const partnerTypes = [
        { type: "GP", oldVal: old_gp_name, newVal: gp_name },
        { type: "DP", oldVal: old_dp_name, newVal: dp_name },
        { type: "CP", oldVal: old_cp_name, newVal: cp_name },
        { type: "TECH", oldVal: old_tech_name, newVal: tech_name }
      ];

      partnerTypes.forEach(pt => {
        if (pt.oldVal !== pt.newVal) {
          const oldId = getEmployeeIdByName(pt.oldVal);
          const newId = getEmployeeIdByName(pt.newVal);

          let operation = "";
          let empId = "";
          let empName = "";
          let incomingId = "";
          let incomingName = "";

          if (!pt.oldVal && pt.newVal) {
            operation = "ADD";
            empId = newId;
            empName = pt.newVal;
          } else if (pt.oldVal && !pt.newVal) {
            operation = "DELETE";
            empId = oldId;
            empName = pt.oldVal;
          } else {
            operation = "REPLACE";
            empId = oldId;
            empName = pt.oldVal;
            incomingId = newId;
            incomingName = pt.newVal;
          }

          assignments.push({
            operation: operation,
            partner_type: pt.type,
            employee_id: empId,
            employee_name: empName,
            incoming_employee_id: incomingId,
            incoming_employee_name: incomingName
          });

          partnerFieldChanges.push({
            field_name: pt.type,
            old_id: oldId,
            old_name: pt.oldVal,
            new_id: newId,
            new_name: pt.newVal
          });
        }
      });

      if (assignments.length > 0) {
        fs_partners.push({
          entity_type: "BC_STAKEHOLDER",
          entity_id: stk.ref_id ? "ref:" + stk.ref_id : (stk.stakeholderId || ""),
          assignments: assignments,
          field_changes: partnerFieldChanges,
          reason: "",
          notes: ""
        });
      }
    });

    const stakeholdersPayload = {
      user_details: userDetails,
      bc_master: bc_master,
      superbosses: superbosses,
      key_stakeholders: key_stakeholders,
      stakeholders: stakeholders,
      key_directs: key_directs,
      fs_partners: fs_partners,
      deleted_entities: window.deletedEntitiesMap || []
    };
    console.log("Stakeholders payload:", stakeholdersPayload);
    $.ajax({
      url: apiURL,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      format: "json",
      data: JSON.stringify(stakeholdersPayload),
      success: function (response) {
        console.log("Buying center saved successfully:", response);

        // Reset button state and re-enable all form fields
        $submitBtn.text(originalText).prop("disabled", false);
        $("#buying-center-form input, #buying-center-form textarea, #buying-center-form select, #buying-center-form button").prop("disabled", false);

        if (response.Message === "Success" || response.message === "Success") {
          // Clear deleted entities map on success
          window.deletedEntitiesMap = [];
          
          // Show success message
          toastr.options.timeOut = 5000;
          toastr.success("Buying Center saved successfully!");

          // Save current state to sessionStorage for persistence after reload
          sessionStorage.setItem("activeBuyingCenterView", "edit");
          sessionStorage.setItem("activeBuyingCenterReadOnly", "true"); // Transition to View Mode

          // Update local state so that when processApiData renders, it stays on this item
          state.view = "edit";
          state.isReadOnly = true;

          // Use bcName as the stable ID for persistence since backend IDs are not currently provided in a way we can use reliably
          const currentId = payload.bcName;
          if (currentId) {
            sessionStorage.setItem("activeBuyingCenterId", currentId);
            state.editId = currentId;

            // Sync URL to view-edit mode with the correct ID before reloading
            const url = new URL(window.location.href);
            url.searchParams.set("action", "view-edit"); // Change to view-edit
            url.searchParams.set("buyingCenterId", currentId);
            history.replaceState(null, "", url.toString());
          }

          // Get the new buying center name and first stakeholder
          const newBuyingCenter = payload.bcName;
          const newStakeholder = payload.stakeholders.length > 0 ? payload.stakeholders[0].name : "";

          // Close the current window/tab after a short delay or refresh page based on redirect parameter
          const actualOpener = window.opener || window.parent.opener;
          if (actualOpener && actualOpener.toRefreshBuyingCenterDropdown) {
            try {
                actualOpener.toRefreshBuyingCenterDropdown(newBuyingCenter, newStakeholder);
            } catch (e) {
                console.error("Error calling toRefreshBuyingCenterDropdown:", e);
            }
          }

          console.log("state.urlParams.mode =", state.urlParams ? state.urlParams.mode : 'undefined');

          if (state.urlParams && (state.urlParams.from === 'accountCreation' || state.urlParams.redirect === 'notesLog')) {
            setTimeout(() => {
              if (state.urlParams.mode === 'SOW') {
                const currentAccountId = state.urlParams.accountId || payload.accountId;
                const currentAccountName = state.urlParams.accountName || payload.accountName;
                const targetWindow = (window.parent && window.parent !== window) ? window.parent : window;
                targetWindow.location.href = `sowCreate.html?accountName=${encodeURIComponent(currentAccountName)}&accountId=${currentAccountId}&buyingCenter=${encodeURIComponent(newBuyingCenter)}&stakeholder=${encodeURIComponent(newStakeholder)}&from=notesLog`;
              } else {
                if (window.parent && window.parent !== window) { window.parent.close(); } else { window.close(); }
              }
            }, 1000);
            return;
          }

          // If we came from accountDetails, reload. If we are on the main page, also reload to stay in edit mode
          if (state.urlParams && state.urlParams.redirect === 'accountDetails') {
            if (state.urlParams.from === 'engagement') {
              window.parent.postMessage({ type: 'RELOAD_ACTIVE_ACCOUNT' }, '*');
            } else {
              location.reload();
            }
          } else {
            // Stay on page and reload to show the updated data in edit view
            if (state.urlParams && state.urlParams.from === 'engagement') {
              window.parent.postMessage({ type: 'RELOAD_ACTIVE_ACCOUNT' }, '*');
            } else {
              location.reload();
            }
          }
        } else {
          // Handle API success but with warning
          toastr.options.timeOut = 5000;
          toastr.warning(response.Message || response.message || "Buying Center saved with warnings");

          sessionStorage.setItem("activeBuyingCenterView", "edit");
          sessionStorage.setItem("activeBuyingCenterReadOnly", "true"); // Transition to View Mode
          
          // Update local state so that when processApiData renders, it stays on this item
          state.view = "edit";
          state.isReadOnly = true;

          const currentId = payload.bcName;
          if (currentId) {
            sessionStorage.setItem("activeBuyingCenterId", currentId);
            state.editId = currentId;

            // Sync URL to view-edit mode with the correct ID before reloading
            const url = new URL(window.location.href);
            url.searchParams.set("action", "view-edit"); // Change to view-edit
            url.searchParams.set("buyingCenterId", currentId);
            history.replaceState(null, "", url.toString());
          }

          // Get the new buying center name and first stakeholder
          const newBuyingCenter = payload.bcName;
          const newStakeholder = payload.stakeholders.length > 0 ? payload.stakeholders[0].name : "";

          // Refresh buying center dropdown in parent window if available
          const actualOpener2 = window.opener || window.parent.opener;
          if (actualOpener2 && actualOpener2.refreshBuyingCenterDropdown) {
            try {
                actualOpener2.refreshBuyingCenterDropdown(newBuyingCenter, newStakeholder);
            } catch (e) {
                console.error("Error calling refreshBuyingCenterDropdown:", e);
            }
          }

          console.log("state.urlParams.mode (second block) =", state.urlParams ? state.urlParams.mode : 'undefined');

          if (state.urlParams && state.urlParams.from === 'accountCreation') {
            setTimeout(() => {
              if (state.urlParams.mode === 'SOW') {
                const currentAccountId = state.urlParams.accountId || payload.accountId;
                const currentAccountName = state.urlParams.accountName || payload.accountName;
                const targetWindow = (window.parent && window.parent !== window) ? window.parent : window;
                targetWindow.location.href = `sowCreate.html?accountName=${encodeURIComponent(currentAccountName)}&accountId=${currentAccountId}&buyingCenter=${encodeURIComponent(newBuyingCenter)}&stakeholder=${encodeURIComponent(newStakeholder)}&from=notesLog`;
              } else {
                if (window.parent && window.parent !== window) { window.parent.close(); } else { window.close(); }
              }
            }, 1000);
            return;
          }

          // Close the window or refresh page based on redirect parameter
          if (state.urlParams && state.urlParams.redirect === 'accountDetails') {
            if (state.urlParams.from === 'engagement') {
              window.parent.postMessage({ type: 'RELOAD_ACTIVE_ACCOUNT' }, '*');
            } else {
              location.reload();
            }
          } else {
            if (state.urlParams && state.urlParams.from === 'engagement') {
              window.parent.postMessage({ type: 'RELOAD_ACTIVE_ACCOUNT' }, '*');
            } else {
              location.reload();
            }
          }
        }
      },
      error: function (error) {
        console.error("Error saving buying center:", error);

        // Reset button state and re-enable all form fields
        $submitBtn.text(originalText).prop("disabled", false);
        $("#buying-center-form input, #buying-center-form textarea, #buying-center-form select, #buying-center-form button").prop("disabled", false);

        // Show error message
        toastr.options.timeOut = 5000;
        toastr.error("Failed to save Buying Center. Please try again.");

        // Fallback: save to localStorage if API fails
        console.log("Falling back to localStorage due to API error");
        if (id) {
          // Edit mode
          const index = state.items.findIndex((it) => it.id === id);
          if (index > -1) {
            const createdAt = state.items[index].createdAt;
            state.items[index] = { id, createdAt, ...payload };
          }
        } else {
          // Create mode
          const newItem = { id: cryptoRandomId(), createdAt: Date.now(), ...payload };
          state.items.unshift(newItem); // Add to beginning
        }
        saveData();
        state.flashId = id || state.items[0].id;
        goToList();
      }
    });
  });

  $(".sortable-header").on("click", function () {
    const key = $(this).data("sort-key");
    if (state.sortConfig && state.sortConfig.key === key) {
      if (state.sortConfig.direction === "asc") {
        state.sortConfig.direction = "desc";
      } else {
        state.sortConfig = null; // Clear sort
      }
    } else {
      state.sortConfig = { key, direction: "asc" };
    }
    renderDirectoryPage(); // Re-render only the directory
  });

  // --- PRIZE INPUT VALIDATION AND FORMATTING ---
  // Function to validate keypress for prize fields
  function validatePrizeKeypress(event) {
    // Allow control keys (backspace, delete, arrows, etc.)
    if (event.ctrlKey || event.altKey || event.metaKey) return true;

    // Allow navigation keys
    const navigationKeys = [8, 9, 13, 27, 35, 36, 37, 38, 39, 40, 46]; // backspace, tab, enter, escape, end, home, arrows, delete
    if (navigationKeys.includes(event.keyCode)) return true;

    // Allow numbers, comma, and period
    const char = String.fromCharCode(event.which || event.keyCode);
    const allowedChars = /^[0-9,.]$/;

    if (!allowedChars.test(char)) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  // Format overview prize field on input
  $("#sop1y").on("keypress", validatePrizeKeypress).on("input", function () {
    const value = $(this).val();
    const formatted = formatPrizeInput(value);
    if (formatted !== value) {
      $(this).val(formatted);
    }
  });

  // Format stakeholder prize fields on input
  $(document).on("keypress", 'input[name="s_prize"]', validatePrizeKeypress).on("input", 'input[name="s_prize"]', function () {
    const value = $(this).val();
    const formatted = formatPrizeInput(value);
    if (formatted !== value) {
      $(this).val(formatted);
    }
  });

  // --- REAL-TIME BUYING CENTER NAME VALIDATION ---
  $("#bcName").on("input", function () {
    const bcName = $(this).val().trim();
    const account = $("#account").val() || (state.urlParams && state.urlParams.accountName);
    const isEdit = $("#edit-id").val() !== "";
    const editId = $("#edit-id").val();
    const $errorMsg = $(this).next(".error-message");
    const $saveBtn = $("#form-submit-btn");

    // Clear previous error
    $errorMsg.text("");

    if (bcName) {
      const isDuplicate = checkDuplicateBuyingCenter(bcName, account, isEdit, editId);
      if (isDuplicate) {
        $errorMsg.text("Buying Center name already exists. Please choose a different name.");
        $saveBtn.prop("disabled", true).addClass("disabled");
      } else {
        $saveBtn.prop("disabled", false).removeClass("disabled");
      }
    } else {
      // Empty name - enable button but don't show error yet (will be caught on submit)
      $saveBtn.prop("disabled", false).removeClass("disabled");
    }
  });

  // --- KEY STAKEHOLDER EVENT LISTENERS ---
  $("#add-key-stakeholder-btn").on("click", function () {
    if (state.isReadOnly) return;
    // First update window.originalKeyStakeholders with current form values
    const currentKeyStakeholders = (window.originalKeyStakeholders || []).map(ks => ({ ...ks }));
    $("#key-stakeholders-list .key-stakeholder-row").each(function () {
      const $row = $(this);
      const index = parseInt($row.data('index'));
      const name = $row.find('input[name="key_stakeholder_name"]').val();
      const designation = $row.find('input[name="key_stakeholder_designation"]').val();
      if (currentKeyStakeholders[index]) {
        currentKeyStakeholders[index].name = name ? name.trim() : "";
        currentKeyStakeholders[index].designation = designation ? designation.trim() : "";
      }
    });
    window.originalKeyStakeholders = currentKeyStakeholders;

    // Now add the new key stakeholder
    window.originalKeyStakeholders.push({ name: "", designation: "", flag: "Y", isNew: true });
    renderKeyStakeholdersList(window.originalKeyStakeholders);
    // Re-render stakeholders table to update Key Stakeholder dropdown
    const currentStakeholders = getFormData().stakeholders;
    const isEdit = $("#edit-id").val() !== "";
    renderStakeholdersTable(currentStakeholders, isEdit);
  });

  // Helper to delete key stakeholder directly
  function deleteKeyStakeholderDirectly(index) {
    if (index >= 0 && index < window.originalKeyStakeholders.length) {
      const stakeholder = window.originalKeyStakeholders[index];
      const isNewRow = stakeholder.isNew || false;
      const deletedKsName = stakeholder.name;

      if (isNewRow) {
        // For new rows, remove completely from array
        window.originalKeyStakeholders.splice(index, 1);
      } else {
        // For existing rows, mark as deleted but keep in array
        window.originalKeyStakeholders[index].flag = 'N';
      }

      renderKeyStakeholdersList(window.originalKeyStakeholders);

      // Re-render stakeholders table to update Key Stakeholder dropdown
      const currentStakeholders = getFormData().stakeholders;
      if (deletedKsName) {
        currentStakeholders.forEach(s => {
          if (s.keyStakeholder === deletedKsName) {
            s.keyStakeholder = "";
            s.keyStakeholderId = "";
            s.keyStakeholderName = "";
            s.keyStakeholderDesignation = "";
          }
        });
      }
      const isEdit = $("#edit-id").val() !== "";
      renderStakeholdersTable(currentStakeholders, isEdit);
    }
  }

  // Populate stakeholders dropdown for selected buying center
  function populateStakeholdersForBc($selectElement, selectedBcName, currentBcName, deletedKsId) {
    $selectElement.empty();
    $selectElement.append('<option value="" data-type="">-- Select stakeholder --</option>');
    
    if (selectedBcName === currentBcName) {
      // Use window.originalKeyStakeholders for current buying center (including unsaved edits)
      (window.originalKeyStakeholders || []).forEach((ks, idx) => {
        if (ks.id === deletedKsId || (deletedKsId === "" && idx === deletedKsId)) {
          return;
        }
        if (ks.flag !== 'N' && ks.name && ks.name.trim()) {
          $selectElement.append(`<option value="${ks.id || ks.name}" data-type="KEY_STAKEHOLDER">${ks.name}</option>`);
        }
      });
      // Use current stakeholders for the current buying center
      (getFormData().stakeholders || []).forEach((s, idx) => {
        const sId = s.stakeholderId || s.id || "";
        if (sId && sId === deletedKsId) {
          return; // Skip the currently deleted stakeholder if it matches by ID
        }
        if (s.isDeleted !== true && s.name && s.name.trim()) {
          $selectElement.append(`<option value="${sId || s.name}" data-type="STAKEHOLDER">${s.name}</option>`);
        }
      });
    } else {
      // For other buying centers, load from state.items
      const bcItem = (state.items || []).find(item => item.bcName === selectedBcName);
      if (bcItem) {
        if (bcItem.keyStakeholders) {
          bcItem.keyStakeholders.forEach(ks => {
            if (ks.flag !== 'N' && ks.name && ks.name.trim()) {
              $selectElement.append(`<option value="${ks.id || ks.name}" data-type="KEY_STAKEHOLDER">${ks.name}</option>`);
            }
          });
        }
        if (bcItem.stakeholders) {
          bcItem.stakeholders.forEach(s => {
            if (s.flag !== 'N' && s.STAKEHOLDER && s.STAKEHOLDER.trim()) {
              $selectElement.append(`<option value="${s.STAKEHOLDER_ID || s.STAKEHOLDER}" data-type="STAKEHOLDER">${s.STAKEHOLDER}</option>`);
            }
          });
        }
      }
    }
  }

  // Helper to validate and enable/disable the delete confirmation button
  function checkRemapModalValidity() {
    let isValid = true;
    $("#deleteKsModalBody .sow-remap-card").each(function () {
      const selectedBc = $(this).find(".sow-remap-bc-select").val();
      const selectedSh = $(this).find(".sow-remap-sh-select").val();
      if (!selectedBc || !selectedSh) {
        isValid = false;
        return false; // Break
      }
    });

    const $btn = $("#confirmDeleteKsBtn");
    if (isValid) {
      $btn.prop("disabled", false).css({
        "opacity": "1",
        "cursor": "pointer"
      });
    } else {
      $btn.prop("disabled", true).css({
        "opacity": "0.5",
        "cursor": "not-allowed"
      });
    }
  }

  // Show stakeholder deletion SOW remapping modal
  function showStakeholderRemapModal(index, ksName, ksId, currentBcName, sows, entityType = "KEY_STAKEHOLDER") {
    $("#deleteKsModalTitle").text(`Delete ${ksName}`);
    const sowCountText = sows.length === 1 ? "1 SoW linked" : `${sows.length} SoWs linked`;
    $("#deleteKsModalSubtitle").text(`${sowCountText} — select a replacement before deleting.`);
    
    const $body = $("#deleteKsModalBody");
    $body.empty();
    
    sows.forEach((sow, idx) => {
      const cardHtml = `
        <div class="sow-remap-card ${idx === 0 ? 'first-sow-card' : ''}" data-sow-id="${sow.SOW_ID}" data-unique-id="${sow.UNIQUE_ID}" data-sow-name="${sow.SOW_NAME}" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px; margin-bottom: 10px; font-family: 'Poppins', sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
            <i class="fa fa-paperclip" style="color: #f0a370; transform: rotate(45deg); font-size: 16px;"></i>
            <span style="font-size: 14px; font-weight: 600; color: #ea580c;">${sow.SOW_NAME}</span>
          </div>
          
          <div style="display: flex; gap: 15px;">
            <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; font-weight: 600; color: #4b5563; margin-bottom: 0;">Buying Center</label>
              <select class="sow-remap-bc-select form-select" style="width: 100%; height: 25px; border-radius: 8px; border: 1px solid #d1d5db; padding: 0 30px 0 10px !important; font-size: 12px; color: #1f2937; outline: none; background-color: white; font-weight: 500;">
                <!-- Will be populated below -->
              </select>
            </div>
            
            <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 11px; font-weight: 600; color: #4b5563; margin-bottom: 0;">New Stakeholder <span style="color: #dc2626;">*</span></label>
              <select class="sow-remap-sh-select form-select" style="width: 100%; height: 25px; border-radius: 8px; border: 1px solid #d1d5db; padding: 0 30px 0 10px !important; font-size: 12px; color: #1f2937; outline: none; background-color: white; font-weight: 500;">
                <option value="">-- Select stakeholder --</option>
              </select>
            </div>
          </div>
          ${idx === 0 && sows.length > 1 ? `
          <div class="apply-all-sows-container" style="margin-top: 12px; display: none; align-items: center; gap: 8px;">
            <input type="checkbox" id="applyAllSowsCheckbox" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
            <label for="applyAllSowsCheckbox" style="font-size: 12px; font-weight: 500; color: #374151; cursor: pointer; margin-bottom: 0; user-select: none;">Apply for all SoW's</label>
          </div>
          ` : ''}
        </div>
      `;
      const $card = $(cardHtml);
      $body.append($card);
      
      const $bcSelect = $card.find(".sow-remap-bc-select");
      const $shSelect = $card.find(".sow-remap-sh-select");
      
      // Populate Buying Centers select
      $bcSelect.empty();
      (state.items || []).forEach(bc => {
        if (bc.bcActiveFlag !== 'N' && bc.bcName) {
          const displayBcName = bc.bcName === currentBcName ? `${bc.bcName} (current)` : bc.bcName;
          const isSelected = bc.bcName === currentBcName ? 'selected' : '';
          $bcSelect.append(`<option value="${bc.bcName}" ${isSelected}>${displayBcName}</option>`);
        }
      });
      
      // Populate Stakeholders select for default (current) buying center
      populateStakeholdersForBc($shSelect, currentBcName, currentBcName, ksId);
    });
    
    // Store target index and id on the confirm button
    $("#confirmDeleteKsBtn").data("index", index).data("ks-id", ksId).data("current-bc", currentBcName).data("ks-name", ksName).data("entity-type", entityType);
    
    // Check validation state initially
    checkRemapModalValidity();

    // Open modal
    $("#deleteStakeholderRemapModal").show();
  }

  // Delete key stakeholder event listener
  $("#key-stakeholders-list").on("click", ".delete-key-stakeholder-btn", function () {
    if (state.isReadOnly) return;
    const index = $(this).data("index");
    const $row = $(this).closest(".key-stakeholder-row");
    const ksName = $row.find('input[name="key_stakeholder_name"]').val().trim();
    
    // First update window.originalKeyStakeholders with current form values
    const currentKeyStakeholders = (window.originalKeyStakeholders || []).map(ks => ({ ...ks }));
    $("#key-stakeholders-list .key-stakeholder-row").each(function () {
      const $r = $(this);
      const rowIndex = parseInt($r.data('index'));
      const name = $r.find('input[name="key_stakeholder_name"]').val();
      const designation = $r.find('input[name="key_stakeholder_designation"]').val();
      if (currentKeyStakeholders[rowIndex]) {
        currentKeyStakeholders[rowIndex].name = name ? name.trim() : "";
        currentKeyStakeholders[rowIndex].designation = designation ? designation.trim() : "";
      }
    });
    window.originalKeyStakeholders = currentKeyStakeholders;
    
    const ksObj = window.originalKeyStakeholders[index];
    const ksId = ksObj ? ksObj.id : "";
    const currentBcName = $("#bcName").val() || "";
    const bcId = (state.items.find(bc => bc.bcName === currentBcName) || {}).bcId || "";
    const accountId = (state.urlParams && state.urlParams.accountId) ? state.urlParams.accountId : "";

    console.log("Delete button clicked for index:", index);
    console.log("Key Stakeholder Object:", ksObj);
    console.log("Key Stakeholder ID (ksId):", ksId);
    console.log("Current Buying Center Name:", currentBcName);
    console.log("Current Buying Center ID (bcId):", bcId);
    console.log("Account ID:", accountId);

    const payload = {
      ACCOUNT_ID: accountId,
      BC_ID: bcId,
      ENTITY_ID: ksId,
      ENTITY_ID_TYPE: "KEYSTAKEHOLDER"
    };

    // 1. Call GET /get_sow_by_entity to check for associated SOWs
    console.log("Calling /get_sow_by_entity API with payload:", JSON.stringify(payload));
    
    $(".loader-overlay").show();
    let apiURL = apiValue.url.replace("/app", "/get_sow_by_entity");
    $.ajax({
      url: apiURL,
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: function(response) {
        console.log("/get_sow_by_entity Success Response:", response);
        $(".loader-overlay").hide();
        if (response.data && response.data.length > 0) {
          // Linked SOWs exist, show the remap modal
          console.log("Stakeholder has associated SOWs, showing remap modal.");
          showStakeholderRemapModal(index, ksName, ksId, currentBcName, response.data);
        } else {
          const accountName = (state.urlParams && state.urlParams.accountName) ? state.urlParams.accountName : ($("#account").val() || "");
          window.deletedEntitiesMap = window.deletedEntitiesMap || [];
          window.deletedEntitiesMap.push({
            account_id: accountId,
            account_name: accountName,
            bc_id: bcId,
            bc_name: currentBcName,
            deleted_entity_type: "KEY_STAKEHOLDER",
            deleted_entity_id: ksId,
            deleted_entity_name: ksName,
            sow_migrations: []
          });
          deleteKeyStakeholderDirectly(index);
        }
      },
      error: function(err) {
        console.error("Error fetching SOWs:", err);
        $(".loader-overlay").hide();
        console.warn("API Error, using mock data for UI testing:", err);
        // Fallback to mock data for UI testing since backend might not be ready
        const mockData = [
            {
                "SOW_ID": "DTC_TES_001",
                "SOW_NAME": "Test SOW",
                "UNIQUE_ID": "21b26d0a",
                "ACCOUNT_ID": accountId,
                "BUYING_CENTRE": currentBcName,
                "NPS_STAKEHOLDER": ksId,
                "SOW_STATUS": "Signed"
            }
        ];
        // Show the remap modal with mock data
        console.log("Calling showStakeholderRemapModal with mock data:", mockData);
        showStakeholderRemapModal(index, ksName, ksId, currentBcName, mockData);
      }
    });
  });

  // Restore key stakeholder event listener
  $("#key-stakeholders-list").on("click", ".restore-key-stakeholder-btn", function () {
    if (state.isReadOnly) return;
    const index = $(this).data("index");

    // First update window.originalKeyStakeholders with current form values
    const currentKeyStakeholders = (window.originalKeyStakeholders || []).map(ks => ({ ...ks }));
    $("#key-stakeholders-list .key-stakeholder-row").each(function () {
      const $row = $(this);
      const rowIndex = parseInt($row.data('index'));
      const name = $row.find('input[name="key_stakeholder_name"]').val();
      const designation = $row.find('input[name="key_stakeholder_designation"]').val();
      if (currentKeyStakeholders[rowIndex]) {
        currentKeyStakeholders[rowIndex].name = name ? name.trim() : "";
        currentKeyStakeholders[rowIndex].designation = designation ? designation.trim() : "";
      }
    });
    window.originalKeyStakeholders = currentKeyStakeholders;

    // Restore the deleted key stakeholder
    window.originalKeyStakeholders[index].flag = 'Y';

    // Remove from deletedEntitiesMap if it was registered there
    const ksId = window.originalKeyStakeholders[index].id || "";
    const ksName = window.originalKeyStakeholders[index].name || "";
    if (window.deletedEntitiesMap) {
      window.deletedEntitiesMap = window.deletedEntitiesMap.filter(item => {
        const isMatch = (
          (item.deleted_entity_type === "KEYSTAKEHOLDER" || item.deleted_entity_type === "KEY_STAKEHOLDER") &&
          ((ksId && item.deleted_entity_id === ksId) || (ksName && item.deleted_entity_name === ksName))
        );
        return !isMatch;
      });
    }

    renderKeyStakeholdersList(window.originalKeyStakeholders);

    // Re-render stakeholders table to update Key Stakeholder dropdown
    const currentStakeholders = getFormData().stakeholders;
    const isEdit = $("#edit-id").val() !== "";
    renderStakeholdersTable(currentStakeholders, isEdit);
  });

  // Delete regular stakeholder event listener
  $("#stakeholders-table-body").on("click", ".delete-stakeholder-btn", function () {
    if (state.isReadOnly) return;
    const index = parseInt($(this).data("index"));
    const $row = $(this).closest("tr");
    const shName = $row.find('input[name="s_name"]').val().trim();
    
    let currentStakeholders = getFormData().stakeholders;
    window.tempCurrentStakeholders = currentStakeholders;
    
    const shObj = currentStakeholders[index];
    const shId = shObj ? (shObj.stakeholderId || shObj.id || "") : "";
    const currentBcName = $("#bcName").val() || "";
    const bcId = (state.items.find(bc => bc.bcName === currentBcName) || {}).bcId || "";
    const accountId = (state.urlParams && state.urlParams.accountId) ? state.urlParams.accountId : "";

    console.log("Delete stakeholder clicked for index:", index);
    console.log("Stakeholder ID (shId):", shId);

    // If it's a new row without an ID, delete it directly
    if ((shObj && shObj.isNew) || !shId) {
       console.log("New stakeholder without ID, deleting directly.");
       deleteStakeholderDirectly(index, currentStakeholders);
       return;
    }

    const payload = {
      ACCOUNT_ID: accountId,
      BC_ID: bcId,
      ENTITY_ID: shId,
      ENTITY_ID_TYPE: "STAKEHOLDER"
    };

    console.log("Calling /get_sow_by_entity API with payload:", JSON.stringify(payload));
    
    $(".loader-overlay").show();
    let apiURL = apiValue.url.replace("/app", "/get_sow_by_entity");
    $.ajax({
      url: apiURL,
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: function(response) {
        console.log("/get_sow_by_entity Success Response:", response);
        $(".loader-overlay").hide();
        if (response.data && response.data.length > 0) {
          // Linked SOWs exist, show the remap modal
          console.log("Stakeholder has associated SOWs, showing remap modal.");
          showStakeholderRemapModal(index, shName, shId, currentBcName, response.data, "STAKEHOLDER");
        } else {
          const accountName = (state.urlParams && state.urlParams.accountName) ? state.urlParams.accountName : ($("#account").val() || "");
          window.deletedEntitiesMap = window.deletedEntitiesMap || [];
          window.deletedEntitiesMap.push({
            account_id: accountId,
            account_name: accountName,
            bc_id: bcId,
            bc_name: currentBcName,
            deleted_entity_type: "STAKEHOLDER",
            deleted_entity_id: shId,
            deleted_entity_name: shName,
            sow_migrations: []
          });
          deleteStakeholderDirectly(index, currentStakeholders);
        }
      },
      error: function(err) {
        console.error("Error fetching SOWs:", err);
        $(".loader-overlay").hide();
        // Fallback to mock data for UI testing since backend might not be ready
        const mockData = [
            {
                "SOW_ID": "DTC_TES_001",
                "SOW_NAME": "Test SOW",
                "UNIQUE_ID": "21b26d0a",
                "ACCOUNT_ID": accountId,
                "BUYING_CENTRE": currentBcName,
                "NPS_STAKEHOLDER": shId,
                "SOW_STATUS": "Signed"
            }
        ];
        console.log("Calling showStakeholderRemapModal with mock data:", mockData);
        showStakeholderRemapModal(index, shName, shId, currentBcName, mockData, "STAKEHOLDER");
      }
    });
  });

  // Dynamic stakeholder dropdown update on Buying Center selection change
  $(document).on("change", ".sow-remap-bc-select", function() {
    const selectedBcName = $(this).val();
    const $card = $(this).closest(".sow-remap-card");
    const $shSelect = $card.find(".sow-remap-sh-select");
    const currentBcName = $("#confirmDeleteKsBtn").data("current-bc");
    const ksId = $("#confirmDeleteKsBtn").data("ks-id");
    
    populateStakeholdersForBc($shSelect, selectedBcName, currentBcName, ksId);
  });

  // Monitor select changes in the remap modal to enable/disable confirm delete button
  $(document).on("change", ".sow-remap-bc-select, .sow-remap-sh-select", function() {
    checkRemapModalValidity();
  });

  // Propagate selections from the first SoW to all other SoWs
  let isPropagatingAllSows = false;
  function propagateFirstSowSelections() {
    const $firstCard = $(".first-sow-card");
    if ($firstCard.length === 0) return;
    
    const firstBcVal = $firstCard.find(".sow-remap-bc-select").val();
    const firstShVal = $firstCard.find(".sow-remap-sh-select").val();
    
    if (!firstBcVal || !firstShVal) return;
    
    isPropagatingAllSows = true;
    $(".sow-remap-card:not(.first-sow-card)").each(function() {
      const $card = $(this);
      const $bcSelect = $card.find(".sow-remap-bc-select");
      const $shSelect = $card.find(".sow-remap-sh-select");
      
      // Update buying center
      $bcSelect.val(firstBcVal).trigger('change');
      
      // Update new stakeholder
      $shSelect.val(firstShVal).trigger('change');
    });
    isPropagatingAllSows = false;
  }

  // Monitor first card selects changes to show/hide the checkbox and propagate if checked
  $(document).on("change", ".first-sow-card .sow-remap-bc-select, .first-sow-card .sow-remap-sh-select", function() {
    const $card = $(this).closest(".first-sow-card");
    const bcVal = $card.find(".sow-remap-bc-select").val();
    const shVal = $card.find(".sow-remap-sh-select").val();
    
    const $checkboxContainer = $(".apply-all-sows-container");
    const $checkbox = $("#applyAllSowsCheckbox");
    
    if (bcVal && shVal) {
      $checkboxContainer.css("display", "flex");
    } else {
      $checkboxContainer.hide();
      $checkbox.prop("checked", false);
    }
    
    if ($checkbox.is(":checked")) {
      propagateFirstSowSelections();
    }
  });

  // Handle checking/unchecking the "Apply for all SoW's" checkbox
  $(document).on("change", "#applyAllSowsCheckbox", function() {
    if ($(this).is(":checked")) {
      propagateFirstSowSelections();
    }
  });

  // Automatically uncheck the checkbox if other SoW selections are manually modified
  $(document).on("change", ".sow-remap-card:not(.first-sow-card) .sow-remap-bc-select, .sow-remap-card:not(.first-sow-card) .sow-remap-sh-select", function() {
    if (!isPropagatingAllSows) {
      $("#applyAllSowsCheckbox").prop("checked", false);
    }
  });

  // Close delete remap modal
  $("#closeDeleteKsModal, #cancelDeleteKsBtn").on("click", function() {
    $("#deleteStakeholderRemapModal").hide();
  });

  // Confirm delete key stakeholder and remap SOWs
  $("#confirmDeleteKsBtn").on("click", function() {
    const index = $(this).data("index");
    const ksId = $(this).data("ks-id");
    const ksName = $(this).data("ks-name");
    const accountId = (state.urlParams && state.urlParams.accountId) ? state.urlParams.accountId : "";
    const currentBcName = $(this).data("current-bc");
    const bcId = (state.items.find(bc => bc.bcName === currentBcName) || {}).bcId || "";
    
    // Validate that all SOW cards have a new stakeholder selected
    let isValid = true;
    const updates = [];
    const sowMigrations = [];
    
    $(".sow-remap-card").each(function() {
      const sowId = $(this).data("sow-id");
      const uniqueId = $(this).data("unique-id");
      const sowName = $(this).data("sow-name");
      const selectedBc = $(this).find(".sow-remap-bc-select").val();
      const selectedShOption = $(this).find(".sow-remap-sh-select option:selected");
      const selectedSh = selectedShOption.val();
      const selectedShName = selectedShOption.text();
      const selectedShType = selectedShOption.data("type") || "KEY_STAKEHOLDER";
      const targetBcId = (state.items.find(bc => bc.bcName === selectedBc) || {}).bcId || "";
      
      if (!selectedSh) {
        isValid = false;
        return false; // Break
      }
      
      updates.push({
        sow_id: sowId,
        unique_id: uniqueId,
        new_buying_centre: selectedBc,
        new_nps_stakeholder: selectedSh
      });

      sowMigrations.push({
        sow_id: sowId,
        unique_id: uniqueId,
        sow_name: sowName,
        target: {
          bc_id: targetBcId,
          bc_name: selectedBc,
          entity_type: selectedShType,
          entity_id: selectedSh,
          entity_name: selectedShName
        }
      });
    });
    
    if (!isValid) {
      toastr.options.timeOut = 4000;
      toastr.warning("Please select a replacement stakeholder for all linked SOWs.");
      return;
    }
    
    const entityType = $("#confirmDeleteKsBtn").data("entity-type") || "KEY_STAKEHOLDER";
    const accountName = (state.urlParams && state.urlParams.accountName) ? state.urlParams.accountName : ($("#account").val() || "");
    
    // Save the deletion and migrations locally to be sent on main save
    window.deletedEntitiesMap = window.deletedEntitiesMap || [];
    window.deletedEntitiesMap.push({
      account_id: accountId,
      account_name: accountName,
      bc_id: bcId,
      bc_name: currentBcName,
      deleted_entity_type: entityType,
      deleted_entity_id: ksId,
      deleted_entity_name: ksName,
      sow_migrations: sowMigrations
    });

    // Proceed with deletion in frontend state
    if (entityType === "KEY_STAKEHOLDER") {
      deleteKeyStakeholderDirectly(index);
    } else {
      deleteStakeholderDirectly(index, window.tempCurrentStakeholders);
    }
    $("#deleteStakeholderRemapModal").hide();
    toastr.options.timeOut = 5000;
    toastr.warning(`<b style="font-size: 13px;">Unsaved changes.</b><br>Click Save to reflect changes.`);
  });

  // Listen for changes to key stakeholder names and designations to update dropdown dynamically
  $("#key-stakeholders-list").on("input", 'input[name="key_stakeholder_name"], input[name="key_stakeholder_designation"]', function () {
    // Debounce the re-rendering to avoid excessive calls
    clearTimeout($(this).data('timeout'));
    $(this).data('timeout', setTimeout(() => {
      // Update window.originalKeyStakeholders with current form values
      const currentKeyStakeholders = (window.originalKeyStakeholders || []).map(ks => ({ ...ks }));
      $("#key-stakeholders-list .key-stakeholder-row").each(function () {
        const $row = $(this);
        const index = parseInt($row.data('index'));
        const name = $row.find('input[name="key_stakeholder_name"]').val();
        const designation = $row.find('input[name="key_stakeholder_designation"]').val();
        if (currentKeyStakeholders[index]) {
          currentKeyStakeholders[index].name = name ? name.trim() : "";
          currentKeyStakeholders[index].designation = designation ? designation.trim() : "";
        }
      });
      window.originalKeyStakeholders = currentKeyStakeholders;

      const currentStakeholders = getFormData().stakeholders;
      const isEdit = $("#edit-id").val() !== "";
      renderStakeholdersTable(currentStakeholders, isEdit);
    }, 300));
  });



  // Parse URL parameters and set initial state
  state.urlParams = parseUrlParameters();
  state.shouldPreFillFromUrl = !!state.urlParams; // Only pre-fill if opened with URL params

  // Restore state from sessionStorage if present
  const savedView = sessionStorage.getItem("activeBuyingCenterView");
  const savedId = sessionStorage.getItem("activeBuyingCenterId");
  const savedReadOnly = sessionStorage.getItem("activeBuyingCenterReadOnly");

  if (savedView) {
    state.view = savedView;
    if (savedId) state.editId = savedId;
    if (savedReadOnly !== null) state.isReadOnly = (savedReadOnly === "true");
    console.log(`Restoring view from sessionStorage: ${savedView}, id: ${savedId}, readOnly: ${state.isReadOnly}`);
  }

  if (state.urlParams) {
    const { accountName, accountId, action, buyingCenterId } = state.urlParams;
    console.log("URL Parameters parsed:", state.urlParams);

    // Always filter by accountName if provided in URL
    if (accountName) {
      state.filteredAccount = accountName;
    }

    // URL params take precedence over sessionStorage for specific deep links
    if (action === 'view-edit' || action === 'edit' || action === 'new') {
      // Clear any stored tab to ensure we default to overview unless specifically requested
      if (!state.urlParams.defaultTab && !state.urlParams.showAudit) {
        sessionStorage.removeItem("activeBuyingCenterTab");
      }

      if (action === 'view-edit' || action === 'edit') {
        if (buyingCenterId) {
          state.view = "edit";
          state.editId = buyingCenterId;
          if (action === 'view-edit') state.isReadOnly = true;
        } else {
          // If no buyingCenterId, we should be in list view filtered by account
          state.view = "list";
        }
      } else if (action === 'new') {
        // Open directly in create mode
        state.view = "create";
      }
      console.log(`URL action '${action}' override, view: ${state.view}, id: ${state.editId}, readOnly: ${state.isReadOnly}`);
    }
  }

  loadData();
  // Note: render() is called asynchronously in loadDataFromAPI success/error handlers

  // --- NOTES & AUDIT LOGS EVENT LISTENERS ---

  // Next Steps Toggle
  $(document).on("click", ".toggle-btn", function () {
    const value = $(this).data("value");

    // Only proceed if notes panel is actively viewable or we want to allow it? 
    // Usually valid if we are on notes panel.

    $(this).siblings(".toggle-btn").removeClass("active");
    $(this).addClass("active");

    if (value === "No Next Steps") {
      $(".next-steps-content").addClass("hidden");
      $("#nextStepsEtaWrapper").hide();
      $("#nextStepsEta").prop("disabled", true).val('');
      if (nextStepsQuill) {
        nextStepsQuill.setText('');
        nextStepsQuill.enable(false);
      }
    } else {
      $(".next-steps-content").removeClass("hidden");
      $("#nextStepsEtaWrapper").show();
      $("#nextStepsEta").prop("disabled", false);
      if (nextStepsQuill && !state.isReadOnly) {
        nextStepsQuill.enable(true);
      }
    }
    // validateSaveButton();
  });

  /*
  function validateSaveButton() {
     // Removed legacy validation
  }

  // Real-time listeners
  $(document).on('change input', '#meetingDate, #detailedNotes, #header-notes-stakeholders, input[name="interactionType"], input[name="nextInteractionType"], #nextInteractionEta, #nextStepsText, #nextStepsEta', function() {
      // validateSaveButton();
  });
  */

  // Next Interaction Toggle
  // $(document).on("click", "#toggleNextInteraction", function() {
  //   $("#nextInteractionContent").toggleClass("hidden");
  //   $(this).toggleClass("active");
  // });

  // Save Note Button
  $(document).on("click", "#updateNoteBtn", function () {
    saveNote();
  });

  // Cancel Note Button
  $(document).on("click", "#cancelNoteBtn", function () {
    setActiveTab("overview");
  });

  // Audit Toggle Logic
  $(document).on("click", ".audit-header.can-toggle", function (e) {
    const $item = $(this).closest(".audit-item");
    $item.toggleClass("expanded");
    $item.find(".audit-card-peach").slideToggle();
  });

  // Audit Filters
  $(document).on("change", "input[name='auditFilter']", function () {
    if (window.currentAuditLogs) {
      renderAuditTimeline(window.currentAuditLogs);
    }
  });



  // Stakeholder Link Click Handler (Click-to-Edit)
  $(document).on("click", ".stakeholder-link", function (e) {
    e.stopPropagation(); // Prevent row click event
    const stakeholderName = $(this).data("stakeholder");
    const bcId = $(this).data("bc-id");

    if (stakeholderName && bcId) {
      // Store the stakeholder name to be selected after navigation
      sessionStorage.setItem("selectedStakeholder", stakeholderName);

      // Navigate to the buying center detail view in EDIT MODE
      state.view = "edit";
      state.editId = bcId;
      state.isReadOnly = false;
      state.isStakeholderLocked = true; // Lock the stakeholder selection
      sessionStorage.setItem("activeBuyingCenterView", "edit");
      sessionStorage.setItem("activeBuyingCenterId", bcId);
      sessionStorage.setItem("activeBuyingCenterReadOnly", "false");
      state.initialTab = "notes"; // Use state mechanism for cleaner tab switch
      render();

      // Ensure the stakeholder is selected in both dropdowns after rendering
      setTimeout(() => {
        $("#header-notes-stakeholders").val(stakeholderName).trigger('change');
        $("#notesStakeholders").val(stakeholderName).trigger('change');

        // Clear the session storage
        sessionStorage.removeItem("selectedStakeholder");
      }, 400); // Slightly longer delay to ensure full render
    }
  });
});

// --- NOTES & AUDIT LOGS CORE LOGIC ---

function convert(str) {
  if (str == null || str == "" || str == "0000-00-00") {
    return "";
  } else {
    // Handle both YYYY-MM-DD and MM-DD-YY
    let date;
    if (str.includes('-') && str.split('-')[0].length === 4) {
      // YYYY-MM-DD
      date = new Date(str + "T00:00:00");
    } else {
      date = new Date(str);
    }

    if (isNaN(date.getTime())) return str;

    let mnth = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);
    let year = date.getFullYear().toString().substr(2, 2);
    return [mnth, day, year].join("-");
  }
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

function initializeNotesTab() {
  // Date fields start empty - users can select their own dates
  // No automatic date assignment

  // Set Account & BC Name for form fields
  const accountName = (state.urlParams && state.urlParams.accountName) ? state.urlParams.accountName : $("#account").val();
  const bcName = $("#bcName").val();

  // Populate Header Fields (if they exist in the grid)
  $("#notesAccountName").val(accountName);
  $("#notesBcName").val(bcName);

  // Set Page Title using helper with Dropdown (only if not read-only)
  let dropdownHtml = "";
  if (!state.isReadOnly) {
    dropdownHtml = `
      <div style="width: 300px; font-size: 1rem; font-weight: normal;">
        <select id="header-notes-stakeholders" class="form-control" style="width: 100%;padding: 3px;border: solid 1px #ffffff;box-shadow: none;">
          <!-- Populated via init -->
        </select>
        </div>
      `;
  }
  setDetailHeader(accountName || "Account", bcName, dropdownHtml);

  // Initialize Quill editors if not already initialized
  if (!quill) {
    quill = new Quill("#detailedNotes", {
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "link"],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
      },
      placeholder: "Enter details about the meeting...",
      theme: "snow",
    });
  }

  if (!nextStepsQuill) {
    nextStepsQuill = new Quill("#nextStepsText", {
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "link"],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
      },
      placeholder: "What are the next action items?",
      theme: "snow",
    });
  }

  // Set quill state based on read-only
  quill.enable(!state.isReadOnly);
  nextStepsQuill.enable(!state.isReadOnly);

  // Initialize Gijgo Datepickers
  $('#meetingDate, #nextStepsEta, #nextInteractionEta').each(function () {
    if (!$(this).data('datepicker')) {
      $(this).datepicker({
        format: 'mm-dd-yy',
        uiLibrary: 'bootstrap'
      });
    }
  });

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

  // Initialize Select2 for stakeholders (Form Field)
  if ($("#notesStakeholders").data('select2')) {
    $("#notesStakeholders").select2('destroy');
  }
  $("#notesStakeholders").select2({
    placeholder: "Select Stakeholder",
    allowClear: true
  });

  // Get current form data for dropdown population
  const currentFormData = getFormData();
  const currentStakeholders = currentFormData.stakeholders || [];
  const currentKeyStakeholders = currentFormData.keyStakeholders || [];

  // Populate Form Dropdown
  populateNotesStakeholdersDropdown("#notesStakeholders", currentStakeholders, currentKeyStakeholders, currentFormData.superboss);

  // Create Header Dropdown (Directly populate instead of clone)
  setTimeout(() => {
    // Initialize Select2 on the new element
    $("#header-notes-stakeholders").select2({
      placeholder: "Select Stakeholder",
      allowClear: true
    });

    // Populate it with data
    populateNotesStakeholdersDropdown("#header-notes-stakeholders", currentStakeholders, currentKeyStakeholders, currentFormData.superboss);

    // Sync changes from Header to Form
    $("#header-notes-stakeholders").on('change', function () {
      const val = $(this).val();
      if ($("#notesStakeholders").val() !== val) {
        $("#notesStakeholders").select2("val", val).trigger('change');
      }
    });

    // Sync changes from Form to Header (avoid loop)
    $("#notesStakeholders").on('change', function () {
      const val = $(this).val();
      if ($("#header-notes-stakeholders").val() !== val) {
        $("#header-notes-stakeholders").select2("val", val).trigger('change');
      }
    });

    // Re-populate dropdowns after a short delay to ensure all data is loaded
    setTimeout(() => {
      const updatedFormData = getFormData();
      const updatedStakeholders = updatedFormData.stakeholders || [];
      const updatedKeyStakeholders = updatedFormData.keyStakeholders || [];

      if (updatedStakeholders.length > 0 || updatedKeyStakeholders.length > 0 || updatedFormData.superboss) {
        populateNotesStakeholdersDropdown("#notesStakeholders", updatedStakeholders, updatedKeyStakeholders, updatedFormData.superboss);
        populateNotesStakeholdersDropdown("#header-notes-stakeholders", updatedStakeholders, updatedKeyStakeholders, updatedFormData.superboss);
      }

      // Ensure they remain disabled if in read-only mode
      if (state.isReadOnly) {
        $("#notesStakeholders, #header-notes-stakeholders").prop("disabled", true).trigger('change.select2');
      }
    }, 200);
  }, 100);
}

function populateNotesStakeholdersDropdown(selector = "#notesStakeholders", stakeholders = null, keyStakeholders = null, superboss = null) {
  const $select = $(selector);
  const currentVal = $select.val() || "";
  $select.empty();

  const names = new Set();

  // Add empty option for placeholder
  $select.append('<option></option>');

  // Use provided data or get from form data
  const stakeholdersToUse = stakeholders || getFormData().stakeholders || [];
  const keyStakeholdersToUse = keyStakeholders || getFormData().keyStakeholders || [];
  const superbossToUse = superboss || getFormData().superboss || "";

  // Add Super Boss
  if (superbossToUse && superbossToUse.trim()) {
    names.add(superbossToUse.trim());
  }

  // Add Key Stakeholders
  if (keyStakeholdersToUse) {
    keyStakeholdersToUse.forEach(ks => {
      if (ks.name && ks.name.trim() && ks.flag !== 'N') {
        names.add(ks.name.trim());
      }
    });
  }

  // Add Stakeholders
  if (stakeholdersToUse) {
    stakeholdersToUse.forEach(s => {
      if (s.name && s.name.trim() && !s.isDeleted) {
        names.add(s.name.trim());
      }
    });
  }

  // Add options to select (single select only)
  Array.from(names).sort().forEach(name => {
    const isSelected = currentVal === name;
    $select.append(`<option value="${name}" ${isSelected ? 'selected' : ''}>${name}</option>`);
  });

  // Refresh select2 if initialized
  if ($select.data('select2')) {
    $select.trigger('change.select2');
  }
}

function getStakeholderIdByName(name, currentItem) {
  if (!name) return "";
  const nameLower = name.trim().toLowerCase();

  // 1. Check currentItem.superboss
  if (currentItem && currentItem.superboss && currentItem.superboss.trim().toLowerCase() === nameLower) {
    if (currentItem.superbossId) return currentItem.superbossId;
  }

  // 2. Check window.originalKeyStakeholders (loaded in edit mode and updated dynamically)
  if (Array.isArray(window.originalKeyStakeholders)) {
    const ks = window.originalKeyStakeholders.find(k => k.name && k.name.trim().toLowerCase() === nameLower);
    if (ks && ks.id) return ks.id;
  }

  // 3. Check currentItem.keyStakeholders (loaded from API)
  if (currentItem && Array.isArray(currentItem.keyStakeholders)) {
    const ks = currentItem.keyStakeholders.find(k => k.name && k.name.trim().toLowerCase() === nameLower);
    if (ks && ks.id) return ks.id;
  }

  // 4. Check currentItem.stakeholders (loaded from API)
  if (currentItem && Array.isArray(currentItem.stakeholders)) {
    const s = currentItem.stakeholders.find(st => st.name && st.name.trim().toLowerCase() === nameLower);
    if (s && (s.stakeholderId || s.id)) return s.stakeholderId || s.id;
  }

  // 5. Fallback: Search all state.items for a matching stakeholder in any buying center
  if (Array.isArray(state.items)) {
    for (const item of state.items) {
      if (item.superboss && item.superboss.trim().toLowerCase() === nameLower && item.superbossId) {
        return item.superbossId;
      }
      if (Array.isArray(item.keyStakeholders)) {
        const ks = item.keyStakeholders.find(k => k.name && k.name.trim().toLowerCase() === nameLower);
        if (ks && ks.id) return ks.id;
      }
      if (Array.isArray(item.stakeholders)) {
        const s = item.stakeholders.find(st => st.name && st.name.trim().toLowerCase() === nameLower);
        if (s && (s.stakeholderId || s.id)) return s.stakeholderId || s.id;
      }
    }
  }

  return name; // Fallback to name if ID not found
}

function saveNote() {
  const $btn = $("#updateNoteBtn");
  const originalText = $btn.text();
  let selectedStakeholderName = $("#header-notes-stakeholders").val() || "";
  // Validation
  // 1. Validate Stakeholder
  if (!selectedStakeholderName) {
    toastr.warning("Please select a Stakeholder.");
    return;
  }

  // 2. Validate Meeting Date
  const meetingDate = $("#meetingDate").val();
  if (!meetingDate) {
    toastr.warning("Please select a Meeting Date.");
    return;
  }

  // 3. Validate Detailed Notes
  const detailText = quill ? quill.root.innerHTML.trim() : $("#detailedNotes").val().trim();
  if (!detailText || detailText === "<p><br></p>") {
    toastr.warning("Please enter Detailed Notes.");
    return;
  }

  // 4. Validate Next Steps (if active)
  if (!$("#noNextStepsBtn").hasClass("active")) {
    const nextStepsText = nextStepsQuill ? nextStepsQuill.root.innerHTML.trim() : "";
    const nextStepsEta = $("#nextStepsEta").val();

    if (!nextStepsText || nextStepsText === "<p><br></p>") {
      toastr.warning("Please enter Next Steps.");
      return;
    }
    if (!nextStepsEta) {
      toastr.warning("Please select a Next Steps Estimated Date.");
      return;
    }
  }

  // 5. Validate Next Interaction (Always mandatory as per logic)
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

  // Disable all form fields during save
  $btn.html('<i class="fa fa-circle-o-notch fa-spin"></i> Saving...').prop("disabled", true);
  $("#notes-panel input, #notes-panel textarea, #notes-panel select, #notes-panel button").prop("disabled", true);
  if (quill) {
    quill.enable(false);
  }
  if (nextStepsQuill) {
    nextStepsQuill.enable(false);
  }

  const accountName = (state.urlParams && state.urlParams.accountName) ? state.urlParams.accountName : $("#account").val();
  const accountId = (state.urlParams && state.urlParams.accountId) ? state.urlParams.accountId : accountName;
  const bcName = $("#bcName").val();

  const currentItem = state.items.find(it => it.bcName === bcName || it.id === $("#edit-id").val());
  const resolvedBcId = (currentItem && currentItem.bcId) ? currentItem.bcId : bcName;
  const resolvedStakeholderId = getStakeholderIdByName(selectedStakeholderName, currentItem);

  const payload = {
    org_id: "Factspan",
    created_by: localStorage.getItem("EmpUserID") || "unknown",
    actor_display_name: localStorage.getItem("EmpUserName") || "User",
    detail_text: detailText,
    meeting_date: convertToISO($("#meetingDate").val()),
    interaction_type: $("input[name='interactionType']:checked").val(),
    relevant_stakeholders: selectedStakeholderName,
    search_type: "stakeholder",
    account_id: accountId,
    account_name: accountName,
    bc_name: bcName,
    bc_id: resolvedBcId,
    next_steps_mode: $(".toggle-btn.active").data("value") === "Next Steps" ? "ACTION_ITEM" : "NONE",
    next_steps_text: nextStepsQuill ? nextStepsQuill.root.innerHTML : "",
    next_steps_estimated_date: convertToISO($("#nextStepsEta").val()),
    next_interaction_type: $("input[name='nextInteractionType']:checked").val(),
    next_interaction_estimated_date: convertToISO($("#nextInteractionEta").val()),
    primary_entity: {
      type: "BUYING_CENTER",
      id: resolvedBcId,
      name: bcName
    },
    standard_entities: {
      account: {
        id: accountId,
        name: accountName
      }
    },
    related_entities: selectedStakeholderName ? [{
      type: "STAKEHOLDER",
      id: resolvedStakeholderId,
      name: selectedStakeholderName
    }] : []
  };

  console.log("Saving Note Payload:", payload);

  $.ajax({
    url: apiValue.url.replace("/app", "/create_note"),
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(payload),
    success: function (response) {
      // Re-enable all form fields
      $btn.text(originalText).prop("disabled", false);
      $("#notes-panel input, #notes-panel textarea, #notes-panel select, #notes-panel button").prop("disabled", false);
      if (quill && !state.isReadOnly) {
        quill.enable(true);
      }
      if (nextStepsQuill && !state.isReadOnly) {
        nextStepsQuill.enable(true);
      }
      if (response.status === "success") {
        toastr.success("Note saved successfully");
        // Reset form
        if (quill) {
          quill.root.innerHTML = "";
        }
        if (nextStepsQuill) {
          nextStepsQuill.root.innerHTML = "";
        }
        $("#detailedNotes").val("");
        $("#notesStakeholders").val(null).trigger('change');

        // Reset Next Steps default
        $(".toggle-btn[data-value='Next Steps']").trigger('click');

        // Re-trigger validation to disable button
        // validateSaveButton(); 
        $("#header-notes-stakeholders").val(null).trigger('change');

        // Clear date fields
        $("#meetingDate").val("").trigger('change');
        $("#nextStepsEta").val("").trigger('change');
        $("#nextInteractionEta").val("").trigger('change');

        // Reset Toggles/Radios to defaults
        $("input[name='interactionType'][value='In Person']").prop("checked", true);
        $("input[name='nextInteractionType'][value='Phone Call']").prop("checked", true);

        // Transition to View Mode
        state.isReadOnly = true;
        sessionStorage.setItem("activeBuyingCenterReadOnly", "true");
        handleReadOnlyMode(true); // Passing true as we are in edit mode

        // Refresh audit logs to show the new note
        window.currentAuditLogs = null; // Clear cache to force refresh
        fetchAuditLogs(true);
        
        // No need to switch tabs, handleReadOnlyMode already switches Notes tab to timeline view
        // setActiveTab("audit-logs"); 
      } else {
        toastr.error("Failed to save note: " + (response.message || "Unknown error"));
      }
    },
    error: function (err) {
      // Re-enable all form fields
      $btn.text(originalText).prop("disabled", false);
      $("#notes-panel input, #notes-panel textarea, #notes-panel select, #notes-panel button").prop("disabled", false);
      if (quill && !state.isReadOnly) {
        quill.enable(true);
      }
      if (nextStepsQuill && !state.isReadOnly) {
        nextStepsQuill.enable(true);
      }
      toastr.error("Error connecting to Notes API");
      console.error(err);
    }
  });
}

function fetchAuditLogs(force = false) {
  const bcName = $("#bcName").val();
  if (!bcName) return $.Deferred().reject().promise();

  // Skip API call if logs are already cached and we're not forcing a refresh
  if (!force && window.currentAuditLogs && window.currentAuditLogs.length > 0) {
    console.log("Using cached audit logs");
    renderAuditTimeline(window.currentAuditLogs, "#notes-timeline", "notes");
    renderAuditTimeline(window.currentAuditLogs, "#audit-timeline", "audit");
    return $.Deferred().resolve(window.currentAuditLogs).promise();
  }

  $("#audit-timeline").html('<div class="loading-audit">Loading logs...</div>');

  const currentItem = state.items.find(it => it.bcName === bcName || it.id === $("#edit-id").val());
  const bcId = currentItem ? (currentItem.bcId || bcName) : bcName;

  const payload = {
    org_id: "Factspan",
    entity_type: "BUYING_CENTER",
    entity_id: bcId
  };

  console.log("Fetching Audit Logs for:", bcName, "Payload:", payload);

  return $.ajax({
    url: apiValue.url.replace("/app", "/get_audit_by_entity"),
    type: "POST",
    dataType: "json",
    data: JSON.stringify(payload),
    success: function (response) {
      console.log("Audit logs response:", response);
      // Handle both array response and object wrapper response
      let logs = [];
      if (Array.isArray(response)) {
        logs = response;
      } else if (response && response.status === "success") {
        logs = response.data || [];
      }

      // Only update if we have logs or specifically if it's an empty array
      if (logs) {
        window.currentAuditLogs = logs;
        // Render for both containers with their respective filters
        renderAuditTimeline(window.currentAuditLogs, "#notes-timeline", "notes");
        renderAuditTimeline(window.currentAuditLogs, "#audit-timeline", "audit");
      } else {
        $("#audit-log-list, #notesTabDiv").html('<p style="text-align: center; color: #dc2626;">Failed to load logs</p>');
      }
    },
    error: function () {
      $("#audit-log-list, #notesTabDiv").html('<p style="text-align: center; color: #dc2626;">Error loading logs</p>');
    }
  });
}

// Helper to format dates to MM-DD-YY
function formatToMMDDYY(dateStr) {
  if (!dateStr || dateStr === "N/A" || dateStr === "—") return "—";
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

function renderAuditTimeline(logs, containerId = "#audit-timeline", filterType = "all") {
  const $newList = filterType === 'notes' ? $("#notesTabDiv") : $("#audit-log-list");

  // Add CSS fix for lists in notes if not present
  if (!document.getElementById('bc-notes-list-style')) {
    const style = document.createElement('style');
    style.id = 'bc-notes-list-style';
    style.innerHTML = `
      #notesTabDiv ul, #notesTabDiv ol, #audit-log-list ul, #audit-log-list ol {
        margin-left: 10px !important;
        padding-left: 0 !important;
        margin-top: 2px !important;
        margin-bottom: 2px !important;
        font-size: 10px !important;
      }
      #notesTabDiv ul, #audit-log-list ul {
        list-style-type: disc !important;
      }
      #notesTabDiv ol, #audit-log-list ol {
        list-style-type: decimal !important;
      }
      #notesTabDiv li, #audit-log-list li {
        margin-bottom: 5px !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Show/Hide appropriate containers
  if (filterType === 'notes') {
    $("#notes-timeline").addClass('hidden');
    $("#notesTabDiv").removeClass('hidden').empty();
  } else if (filterType === 'audit') {
    $("#audit-timeline").addClass('hidden');
    $("#audit-log-list").removeClass('hidden').empty();
  }

  function renderLogEntry(log) {
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

    if (isNote) {
      const d = details || {};
      const actorName = log.actor_display_name || 'User';
      const initials = actorName.split(/\s+/).filter(n => n.length > 0).map(n => n[0]).join("").toUpperCase().slice(0, 3);

      const meetingDate = formatToMMDDYY(d.meeting_date);
      const nextStepsDate = formatToMMDDYY(d.next_steps_estimated_date);
      const nextInteractionDate = formatToMMDDYY(d.next_interaction_estimated_date);
      // Check if nextStepsText is rich text (HTML) or plain text
      let nextStepsText = d.next_steps_text || "N/A";

      // Check if it's effectively empty (e.g. from Quill editor) or explicitly "NONE" mode
      const isNextStepsEmpty = !nextStepsText ||
        nextStepsText === "N/A" ||
        nextStepsText.replace(/<[^>]*>/g, '').trim() === "" ||
        d.next_steps_mode === "NONE";

      if (!isNextStepsEmpty && nextStepsText !== "N/A" && !nextStepsText.includes("<")) {
        nextStepsText = nextStepsText.split('\n').map(step => `${step}`).join('<br/>');
      }

      // In the new design, the meeting type and date are on the same line as the detail text.
      // Since detail_text is often HTML (from Quill), we append the meeting info inside the last <p> tag if it exists.
      let detailTextWithMeetingInfo = d.detail_text || '—';
      const meetingInfo = ` <span style="color: #818199;">|</span> <strong style="color: #313265; font-weight: 600; font-size: 12px;">Meeting Type:</strong> ${d.interaction_type || 'N/A'} <span style="color: #818199;">|</span> <strong style="color: #313265; font-weight: 600; font-size: 12px;">Meeting Date:</strong> ${meetingDate}`;

      if (detailTextWithMeetingInfo.endsWith('</p>')) {
        detailTextWithMeetingInfo = detailTextWithMeetingInfo.slice(0, -4) + meetingInfo + '</p>';
      } else if (detailTextWithMeetingInfo.endsWith('</li>')) {
        // If it ends with a list item, we can't easily put it "on the same line" outside the list without it looking weird.
        // So we just append it as a new paragraph.
        detailTextWithMeetingInfo += `<p style="margin-top: 5px; font-size: 12px;">${meetingInfo}</p>`;
      } else {
        detailTextWithMeetingInfo += meetingInfo;
      }

      const noteBodyHtml = `
      <div style="margin-bottom: 8px; color: #313265; font-size: 12px; font-weight: 400;">
        <strong style="color: #313265; font-weight: 600; font-size: 12px;">Stakeholder:</strong> ${d.relevant_stakeholders || '—'}
      </div>
      <div style="margin-bottom: 8px;">
        <div style="color: #313265; font-size: 14px; font-weight: 400;">
          <strong style="font-weight: 600;font-size:12px; display: block; margin-bottom: 4px;">Detailed Notes:</strong>
          ${detailTextWithMeetingInfo}
        </div>
      </div>
      ${!isNextStepsEmpty ? `
      <div style="margin-bottom: 8px; color: #313265; font-size: 12px; font-weight: 400;">
        <strong style="color: #313265; font-weight: 600; font-size: 12px;">Next Step:</strong><br/>
        ${nextStepsText} <span style="color: #818199;">|</span> <strong style="color: #313265; font-weight: 600; font-size: 12px;">Next Step Estimated Date:</strong> ${nextStepsDate}
      </div>` : ''}
      <div style="margin-bottom: 8px; color: #313265; font-size: 12px; font-weight: 400;">
        <strong style="color: #313265; font-weight: 600; font-size: 12px;">Next Interaction:</strong><br/>
        <strong style="color: #313265; font-weight: 600; font-size: 12px;">Meeting Type: </strong> ${d.next_interaction_type || 'N/A'} <span style="color: #818199;">|</span> <strong style="color: #313265; font-weight: 600; font-size: 12px;">Next Interaction Estimated Date:</strong> ${nextInteractionDate}
      </div>
      <div style="font-size: 12px; color: #818199; font-weight: 400; margin-top: 4px;">
        ${convertStringToLocalTimeAndAgo(log.created_at)}
      </div>
    `;

      return `
      <div class="notes_div" style="padding: 15px 5px; border-bottom: 1px solid #eee; display: flex; gap: 15px;">
          <div class="notes_icon_div" style="flex-shrink: 0;">
            <div class="notes_icon_text" data-fullname="${actorName}">${initials}</div>
          </div>
          <div class="notes_body_div" style="flex-grow: 1;">
            ${noteBodyHtml}
          </div>
        </div>
      `;
    } else {
      // Audit Log Rendering
      const actorName = log.actor_display_name || 'User';
      const actorInfo = `${actorName}, ${convertStringToLocalTimeAndAgo(log.created_at)} `;

      if (isUpdate && details && Array.isArray(details.changes) && details.changes.length > 0) {
        // Stop filtering out PARENT_KEY_STAKEHOLDER_ID so we capture Key Stakeholder mapping changes
        const filteredChanges = details.changes.filter(change => (change.field || change.operation || '').toString().toUpperCase().trim() !== '');
        return filteredChanges.map(change => {
          let msgHeader = "";
          let extraHtml = "";
          
          if (change.operation === 'DELETE') {
            const deletedName = change.old || change.deleted_entity_name || 'Stakeholder';
            msgHeader = `Stakeholder <strong>${deletedName}</strong> deleted.`;
          } else if (change.operation === 'SOW_REMAP') {
            const deletedName = change.deleted_entity_name || change.old || 'Stakeholder';
            msgHeader = `SOWs remapped for deleted stakeholder <strong>${deletedName}</strong>:`;
            
            const migrationsList = (change.sow_migrations || []).map(mig => {
              const sowName = mig.sow_name || mig.sow_id || 'SoW';
              const targetBc = (mig.target && mig.target.bc_name) || 'Buying Center';
              const targetSh = (mig.target && mig.target.entity_name) || 'Stakeholder';
              return `<li style="font-size: 11px; margin-top: 3px;">
                <strong>${sowName}</strong> remapped to Buying Center: <strong>${targetBc}</strong>, Stakeholder: <strong>${targetSh}</strong>
              </li>`;
            }).join('');

            extraHtml = `
              <ul style="margin: 5px 0 0 15px; padding: 0; list-style-type: disc; font-size: 11px; color: #4b5563; width: 100%;">
                ${migrationsList}
              </ul>`;
          } else {
            let oldVal = (change.old || '').toString().trim();
            let newVal = (change.new || '').toString().trim();

            // Format SOP1Y values with commas
            if (change.field === 'SOP1Y' || change.field === 'SOP 1Y') {
              oldVal = formatPrizeInput(oldVal);
              newVal = formatPrizeInput(newVal);
            }

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

            msgHeader = `${fieldName}${entityInfo} changed from <strong>${displayOldVal}</strong> to <strong>${displayNewVal}</strong>.`;
          }

          return `
      <div class="audit-row">
              <i class="fa-solid fa-circle-dot"></i>
              <div class="audit-content">
                <span class="audit-msg">${msgHeader}</span>
                <span class="audit-meta">${actorInfo}</span>
                ${extraHtml}
              </div>
            </div>
      `;
        }).join('');
      }

      const summary = log.summary || log.description || 'Information Updated';
      return `
      <div class="audit-row">
          <i class="fa-solid fa-circle-dot"></i>
          <div class="audit-content">
            <span class="audit-msg"><strong>${summary}</strong></span>
            <span class="audit-meta">${actorInfo}</span>
          </div>
        </div>
      `;
    }
  }

  function renderAllLogs() {
    let html = '';
    const filtered = logs.filter(l => {
      if (filterType === 'notes') return l.event_type === 'NOTE_CREATED';
      if (filterType === 'audit') {
        // Exclude notes from Audit Log tab as requested
        return l.event_type !== 'NOTE_CREATED';
      }
      return true;
    });

    if (filtered.length === 0) {
      const emptyMsg = filterType === 'notes' ? "No notes found." : "No audit logs found.";
      $newList.html(`<p style="text-align: center; font-weight: 500; color: #313265; padding: 20px;">${emptyMsg}</p>`);
      return;
    }

    filtered.forEach(log => {
      html += renderLogEntry(log);
    });

    if (filterType === 'audit') {
      // Hide the checkbox container for now
      $newList.html(`
      <div class="showAllLogs" style="display: none;">
          <div><input type="checkbox" id="showAllLogs"></div>
          <div class="showAllLogsText"> Show Logs Of All The Events</div>
        </div>
      `);
      $newList.append(html);
    } else {
      $newList.html(html);
    }
  }

  renderAllLogs();
}


