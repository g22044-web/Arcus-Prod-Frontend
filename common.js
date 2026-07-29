// window.history.replaceState('','','/');

if (window.location.pathname.includes("buyingCenterEngagement.html")) {
    window.location.href = "buyingCenterDetails.html" + window.location.search;
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
let accessData = "",
  metaValue = "",
  empUserName = "",
  empUserId = "",
  accessLevelDetails = "",
  empDeprmnt = "",
  empJobRole = "",
  empLoc = "";
let editAccessDetails = "",
  groupNameDetails = "",
  statusDetails = "",
  access_page_list = [],
  user_access_details = [];

var apiValue = {
    //------------- PROD URL --------
    url: "https://arcus.factspanapps.com:5004/app", //RRE PROD API
    url_ip:"https://arcus.factspanapps.com",
    db_name: "",
    environment: "Production",
    logUrl: "https://arcus.factspanapps.com:5004/logger",
};

var loggerDetails = [];
const promises = [];
var UiPageTime = 0;
var ApiName = "";

function assignMetaValue() {
  metaValue = "651756031653-6aum78brhvghicj41t831gus94gfmqgg.apps.googleusercontent.com"; 
}

function loginAuth(email) {
  const startTime = performance.now();
  $.ajax({
    url: apiValue.url.replace("/app", "/checkaccess"),
    type: "POST",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({
      "email": email
    }),
    success: function (data) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(
        loadTimeInSeconds,
        "Home",
        "Home",
        "checkaccess",
        "success",
        "index.html",
        "homePage",
        "view",
      );
      localStorage.setItem("user-all-details", JSON.stringify(data));
      accessData = data.Access;
      empUserName = data.USER_NAME;
      empUserId = data.USER_ID;
      accessLevelDetails = data.ACCESS_LEVEL;
      editAccessDetails = data.EDIT_ACCESS;
      groupNameDetails = data.GROUP_NAME;
      statusDetails = data.STATUS;
      access_page_list = data.ALL_PAGE_LST;
      empDeprmnt = data.DEPARTMENT;
      empLoc = data.COUNTRY;
      empJobRole = data.DESIGNATION;
      user_access_details = data.Access_details;
      localStorage.setItem(
        "access-page-list",
        JSON.stringify(access_page_list),
      );
      localStorage.setItem(
        "user-access-details",
        JSON.stringify(user_access_details),
      );
      localStorage.setItem("user-role", data.ALL_ACCESS_ROLE_LST);
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(
        loadTimeInSeconds,
        "Home",
        "Home",
        "checkaccess",
        "error",
        "index.html",
        "homePage",
        "view",
      );
      console.log("message Error" + JSON.stringify(error));
    },
  });
}

$(".new-sub-menu").hover(function () {
  $(".sub-menu").css("display", "");
  // }, function () {
  //    alert("hi out");
});

function onSuccess(googleUser) {
  onSignIn(googleUser);
}
function onFailure(error) {
  console.log(error);
}

function onSignIn(googleUser) {
  const responsePayload = decodeJwtResponse(googleUser.credential);
  let google_email = responsePayload.email;
  let first_name = responsePayload.name;
  let userImage = responsePayload.picture;
  let jti = responsePayload.jti;
  // var profile = googleUser.getBasicProfile();
  // google_email = profile.getEmail();
  // first_name = profile.getName();
  // var id_token = googleUser.getAuthResponse().id_token;
  loginAuth(google_email);
  if (accessData == "Granted") {
    localStorage.setItem("jti", jti);
    localStorage.setItem("email", google_email);
    localStorage.setItem("Fname", first_name);
    localStorage.setItem("EmpUserName", empUserName);
    localStorage.setItem("EmpUserID", empUserId);
    localStorage.setItem("ACCESS_LEVEL", accessLevelDetails);
    localStorage.setItem("Access", accessData);
    localStorage.setItem("EDIT_ACCESS", editAccessDetails);
    localStorage.setItem("GROUP_NAME", groupNameDetails);
    localStorage.setItem("STATUS", statusDetails);
    localStorage.setItem("Department", empDeprmnt);
    localStorage.setItem("Location", empLoc);
    localStorage.setItem("User_Image", userImage);
    localStorage.setItem("Job_Role", empJobRole);

    // Retrieve
    sessionName = localStorage.getItem("email");
    user_name = localStorage.getItem("Fname");
    empName = localStorage.getItem("EmpUserName");
    empId = localStorage.getItem("EmpUserID");
    let departmentName = localStorage.getItem("Department");
    let userRole = localStorage.getItem("user-role");
    let email = localStorage.getItem("email");
    let jobRole = localStorage.getItem("Job_Role");

    if (sessionName != "") {
      let pathName = sessionStorage.getItem("currentUrlPathName");
      let searchPathVal = sessionStorage.getItem("currentUrlSearch");
      let urlStoredSOWUrldata = localStorage.getItem("sow-url");
      localStorage.removeItem("urlStoredSOWUrldata");
      let urlStoredAllocationData = localStorage.getItem("allocation-url");
      localStorage.setItem("urlStoredAllocationData", urlStoredAllocationData);

      if (pathName == "/reportAuditDetails.html") {
        window.location.href = "reportAuditDetails.html" + searchPathVal;
      } else if (pathName == "/buyingCenterEngagement.html" || pathName == "/buyingCenterEngagement") {
        window.location.href = "buyingCenterDetails.html" + searchPathVal;
      } else if (pathName == "/approvalData.html") {
        window.location.href = "approvalData.html" + searchPathVal;
      } else if (pathName == "/sow.html") {
        window.location.href = pathName + `?${urlStoredSOWUrldata}`;
      } else if (pathName == "/sowEdit.html") {
        window.location.href = pathName + `?${urlStoredSOWUrldata}`;
      } else if (pathName != null) {
        if (pathName == "/home.html" || pathName == "/adminDashboard.html") {
          if (
            departmentName == "Products" ||
            departmentName == "CEO" ||
            departmentName == "COE" ||
            jobRole == "Vice President" ||
            userRole == "admin" ||
            email == "nitin.pandey@factspan.com" ||
            email == "nagarajan.v@factspan.com"
          ) {
            window.location.href = "adminDashboard.html";
          } else {
            window.location.href = "home.html";
          }
        }
        // window.location.href = pathName;
      } else {
        if (
          departmentName == "Products" ||
          departmentName == "CEO" ||
          departmentName == "COE" ||
          jobRole == "Vice President" ||
          userRole == "admin" ||
          email == "nitin.pandey@factspan.com" || 
          email == "nagarajan.v@factspan.com"
        ) {
          window.location.href = "adminDashboard.html";
        } else {
          window.location.href = "home.html";
        }
      }
    } else {
      if (
        departmentName == "Products" ||
        departmentName == "CEO" ||
        departmentName == "COE" ||
        departmentName == "Vice President" ||
        userRole == "admin" ||
        email == "nitin.pandey@factspan.com" || 
        email == "nagarajan.v@factspan.com"
      ) {
        window.location.href = "adminDashboard.html";
      } else {
        window.location.href = "home.html";
      }
    }
  } else {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Access Denied - please contact the admin");
  }
}
function decodeJwtResponse(data) {
  let tokens = data.split(".");
  return JSON.parse(atob(tokens[1]));
}

function getLocalSessionData() {
  sessionName = localStorage.getItem("email");
  user_name = localStorage.getItem("Fname");
  empName = localStorage.getItem("EmpUserName");
  empId = localStorage.getItem("EmpUserID");
  let currentUrlSearch = window.location.search;
  let auditFullUrl = window.location.pathname;
  sessionStorage.setItem("currentUrlPathName", auditFullUrl);
  sessionStorage.setItem("currentUrlSearch", currentUrlSearch);

  if (sessionName == "YWRtaW4=") {
    $("#email_id").text("admin@factspan.com");
    $("#display_name").text("Admin");
    $("#user_welcome").text("Admin");
  } else {
    $("#email_id").text(sessionName);
    $("#display_name").text(user_name);
    $("#user_welcome").text(user_name);
  }
}

async function signOut() {
  // var auth2 = gapi.auth2.getAuthInstance();
  // auth2.signOut().then(function () {
  // });
  google.accounts.id.disableAutoSelect();
  google.accounts.id.prompt();
  // google.accounts.id.disablePrompt();
  finalizeActivityData();
  let apiDataStatus = await sendDataToBackend();
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "index.html";
}
function onLoad() {
  gapi.load("auth2", function () {
    gapi.auth2.init();
  });
}

function capitalizeTxt(txt) {
  return txt.charAt(0).toUpperCase() + txt.slice(1); //or if you want lowercase the rest txt.slice(1).toLowerCase();
}

function checkDashboardPageAccessData() {
  let access_page_list = $.parseJSON(localStorage.getItem("access-page-list"));
  let urlPath = window.location.pathname;
  urlPath = urlPath.replace("/", "");
  let checkUrlAccess = false;
  $.each(access_page_list, function (i, pageName) {
    switch (pageName) {
      case "All":
        $(".menu_div").show();
        $(".header_menu_modules").show();
        checkUrlAccess = true;
        break;
      default:
        $("." + pageName.replace(".html", "")).show();
        $("." + pageName.replace(".html", "") + "_page").show();
        if (urlPath == pageName) {
          checkUrlAccess = true;
        }
        break;
    }
  });
  return checkUrlAccess;
}

function checkEachPageAccess(pageDetails) {
  let user_each_page_access = $.parseJSON(
    localStorage.getItem("user-access-details"),
  );
  let permission = [];
  $.each(user_each_page_access, function (i, userAccess) {
    let access = userAccess.ACCESS_DETAILS;
    $.each(access, function (j, accessEachData) {
      let pageNameDetails = accessEachData.PAGE;

      if (pageDetails == pageNameDetails) {
        let environmentAccess = accessEachData.ENVIRONMENT_ACCESS;
        let accessType = accessEachData.ACCESS_TYPE;
        permission.push(environmentAccess);
        permission.push(accessType);
      } else if (pageNameDetails == "All") {
        let environmentAccess = apiValue.environment;
        let accessType = accessEachData.ACCESS_TYPE;
        permission.push(environmentAccess);
        permission.push(accessType);
      } else if (pageDetails == "Reports") {
        let environmentAccess = apiValue.environment;
        let accessType = accessEachData.ACCESS_TYPE;
        permission.push(environmentAccess);
        permission.push(accessType);
      }
    });
    let pageName = userAccess.PAGE;
  });
  return permission;
}

function getPageTime(Module, feature, log, level, page, Modulename, type) {
  // Record the start time when the page starts loading
  const pageLoadStartTime = performance.now();
  // console.log("pageLoadStartTime", pageLoadStartTime);
  var allPageLoadTime;
  // Add an event listener to measure when the page finishes loading
  window.addEventListener("load", function () {
    const pageLoadEndTime = performance.now();
    // console.log("pageLoadEndTime", pageLoadEndTime);
    const pageLoadTime = (pageLoadEndTime - pageLoadStartTime) / 1000;
    allPageLoadTime = pageLoadTime;
    // console.log("pageLoadTime", pageLoadTime);
    // console.log(`Page load time: ${pageLoadTime} s`);
  });
  let createdDate = formatDateToCustomFormat(new Date());
  var pageLoad = {
    MODULE: page + "_" + type,
    FEATURE: feature,
    LATENCY: UiPageTime,
    LOG: removeTrailingCommaSpace(log),
    LOG_LEVEL: level,
    CREATED_BY:
      localStorage.getItem("EmpUserID") + "__" + localStorage.getItem("Fname"),
    CREATED_ON: createdDate,
    LOG_FROM: "UI",
    MODULE_NAME: Modulename,
  };
  loggerDetails.push(pageLoad);
  logDetails(Modulename);
}

function getApiTime(time, Module, feature, log, level, page, Modulename, type) {
  // console.log("time", time, Module, feature, log, level, page,Modulename,type);
  UiPageTime += time;
  ApiName += log + ", ";
  console.log("UiPageTime - ", UiPageTime);
  let createdDate = formatDateToCustomFormat(new Date());
  var pageLoad = {
    MODULE: page + "_" + type,
    FEATURE: feature,
    LATENCY: time,
    LOG: log,
    LOG_LEVEL: level,
    CREATED_BY:
      localStorage.getItem("EmpUserID") + "__" + localStorage.getItem("Fname"),
    CREATED_ON: createdDate,
    LOG_FROM: "API",
  };
  loggerDetails.push(pageLoad);
  getPageTime(Module, feature, ApiName, level, page, Modulename, type);
}

function logDetails(moduleName) {
  return new Promise((resolve, reject) => {
    let filteredWithModuleArray = loggerDetails.filter(
      (item) => item.MODULE_NAME === moduleName,
    );
    let filteredWithOutModuleArray = loggerDetails.filter(
      (item) => item.MODULE_NAME != moduleName,
    );
    let lastfilteredWithModuleArray =
      filteredWithModuleArray[filteredWithModuleArray.length - 1];

    const modifiedData = removeKeyFromObjects(
      [lastfilteredWithModuleArray],
      "MODULE_NAME",
    );
    let finalArray = filteredWithOutModuleArray.concat(modifiedData);
    var finalOutput = {
      logger_details: finalArray,
    };

    $.ajax({
      url: apiValue.logUrl,
      type: "POST",
      dataType: "json",
      crossDomain: true,
      format: "json",
      async: true, // Set this to true to make the request asynchronous
      mode: "no-cors",
      data: JSON.stringify(finalOutput),
      success: function (data) {
        resolve(data); // Resolve the Promise when the AJAX request is successful
      },
      error: function (error) {
        reject(error); // Reject the Promise when there's an error
      },
    });
  });
}

function formatDateToCustomFormat(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function removeTrailingCommaSpace(inputString) {
  if (inputString.endsWith(", ")) {
    return inputString.slice(0, -2); // Remove the last two characters
  }
  return inputString; // If no trailing ", ", return the original string
}

function removeKeyFromObjects(arr, keyToRemove) {
  return arr.map((obj) => {
    // Create a copy of the object with the specified key removed
    const { [keyToRemove]: removedKey, ...newObj } = obj;
    return newObj;
  });
}

let userStatusData = "";
// Function to safely parse JSON from localStorage
function getActivityData() {
  try {
    const data = localStorage.getItem("activityData");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error parsing activity data from localStorage:", e);
    return [];
  }
}

// Function to format date and time in 'YYYY-MM-DD HH:mm' format using user's local time
function formatDateTime(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// Function to categorize URLs into modules
function getModuleFromURL(url) {
  if (
    /\/revenueDetails\.html/i.test(url) ||
    /\/sow\.html/i.test(url) ||
    /\/sowCreate\.html/i.test(url) ||
    /\/sowEdit\.html/i.test(url)
  ) {
    return "revenue";
  } else if (
    /\/reportsDashboard\.html/i.test(url) ||
    /\/reportSowByAccount\.html/i.test(url) ||
    /\/reportResourceByAccount\.html/i.test(url) ||
    /\/reportSowBySOW\.html/i.test(url) ||
    /\/reportResourceBySOW\.html/i.test(url) ||
    /\/reportRevenueMovement\.html/i.test(url) ||
    /\/report_bench_investment\.html/i.test(url) ||
    /\/reportOverallSummary\.html/i.test(url) ||
    /\/reportPlannedVsActual\.html/i.test(url) ||
    /\/sowRsrceAllocSummar\.html/i.test(url) ||
    /\/resourceMapping\.html/i.test(url) ||
    /\/resourceUtilization\.html/i.test(url) ||
    /\/recognisedRevenueReport\.html/i.test(url) ||
    /\/reportAudit\.html/i.test(url) ||
    /\/exitPocPov\.html/i.test(url) ||
    /\/sowUpdates\.html/i.test(url) ||
    /\/reporting-framework\.html/i.test(url) ||
    /\/reportAccountAllocation\.html/i.test(url) ||
    /\/reportHighProbabilityPipeline\.html/i.test(url) ||
    /\/reportWeeklyUsage\.html/i.test(url) ||
    /\/reportsUSBenchList\.html/i.test(url)
  ) {
    return "reports";
  } else if (
    /\/accountDetails\.html/i.test(url) ||
    /\/accountCreation\.html/i.test(url) ||
    /\/accountEdit\.html/i.test(url)
  ) {
    return "accounts";
  } else if (/\/home\.html/i.test(url) || /\/adminDashboard\.html/i.test(url)) {
    return "dashboard";
  } else if (
    /\/index\.html/i.test(url) ||
    url === "" ||
    url == "http://localhost:5555/" ||
    url == "https://arcus.dev.factspanapps.com/" ||
    url == "http://localhost:5555" ||
    url == "https://arcus.dev.factspanapps.com"
  ) {
    return "login";
  } else if (
    /\/team\.html/i.test(url) ||
    /\/team-profile\.html/i.test(url) ||
    /\/employeeExperience\.html/i.test(url)
  ) {
    return "teams";
  } else if (
    /\/allocationDashboard\.html/i.test(url) ||
    /\/sowTeamAllocation\.html/i.test(url)
  ) {
    return "allocation";
  } else if (/\/orgChart\.html/i.test(url)) {
    return "orgChart";
  } else if (/\/admin\.html/i.test(url) || /\/adminRole\.html/i.test(url)) {
    return "admin";
  } else if (/\/nps\.html/i.test(url)) {
    return "nps";
  } else if (/\/notesLogEngagement\.html/i.test(url)) {
    return "quicklink";
  } else if (/\/buyingCenterDetails\.html/i.test(url) || /\/buying_center\.html/i.test(url) || /\/buyingCenterEngagement\.html/i.test(url)) {
    return "Buying Center";
  } else if (
    /\/poc_pov_dashboard\.html/i.test(url) ||
    /\/view_poc_pov\.html/i.test(url) ||
    /\/exitPocPov\.html/i.test(url) ||
    /\/newPocPov\.html/i.test(url)
  ) {
    return "poc_pov";
  } else {
    return "";
  }
}

// Function to process URLs and add environment
function processURL(url) {
  const simplifiedURL = url.split("?")[0].split("/").pop(); // Simplify URL
  const environment = apiValue.environment;
  return { simplifiedURL, environment };
}

// Function to format date and time in system's local time
// Function to format date and time in system's local time with consistent format
function formatDateTimeToLocal(date) {
  const d = new Date(date);

  // Check if date is valid
  if (isNaN(d.getTime())) {
    console.error("Invalid date provided to formatDateTimeToLocal:", date);
    return new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  }

  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
}

// Function to read CSV and create a URL to pageModule mapping
function getURLMappings(csvFile) {
  return fetch(csvFile)
    .then((response) => response.text())
    .then((text) => {
      const lines = text.trim().split("\n");
      const result = {};
      for (let i = 1; i < lines.length; i++) {
        // Skip header line
        const [url, module] = lines[i].split(",");
        result[url.trim()] = module.trim();
      }
      return result;
    });
}

// Function to handle tab switching for activity tracking
window.switchActivityTab = function(tabName) {
  const { simplifiedURL } = processURL(window.location.href);
  if (simplifiedURL !== "buyingCenterDetails.html") return;
  
  const currentTab = sessionStorage.getItem("currentActivityTab");
  if (currentTab === tabName) return;

  // Finalize the current tab's activity
  finalizeActivityData();
  
  if (tabName) {
    sessionStorage.setItem("currentActivityTab", tabName);
  } else {
    sessionStorage.removeItem("currentActivityTab");
  }
  
  // Start tracking the new tab if active
  if (isActive) {
    initializeActivityData();
    
    // Ensure startTime is refreshed if the entry already existed
    const activityData = getActivityData();
    const currentURL = window.location.href;
    const { simplifiedURL } = processURL(currentURL);
    const module = getModuleFromURL(currentURL);
    
    const existingEntry = activityData.find(
      (entry) => entry.url === simplifiedURL && entry.module === module && (entry.tabName || "") === tabName
    );
    if (existingEntry) {
      existingEntry.startTime = formatDateTimeToLocal(new Date());
      localStorage.setItem("activityData", JSON.stringify(activityData));
    }
  }
};

// Function to initialize or retrieve activity data with pageModule
async function initializeActivityData() {
  const activityData = getActivityData();
  const currentURL = window.location.href;
  const module = getModuleFromURL(currentURL);
  const userEmailId = localStorage.getItem("email") || "";
  const userName = localStorage.getItem("EmpUserName") || "";
  const userEmpId = localStorage.getItem("EmpUserID") || "";
  const userDep = localStorage.getItem("Department") || "";
  const userJob = localStorage.getItem("Job_Role") || "";
  const sessionId = localStorage.getItem("jti") || "";
  const userLoc = localStorage.getItem("Location") || "";

  const { simplifiedURL, environment } = processURL(currentURL);

  // Load URL mappings from CSV file
  const urlMappings = await getURLMappings("../URLMapping.csv");
  let pageModule = urlMappings[simplifiedURL] || "Unknown"; // Default to 'Unknown' if not found

  const currentTab = simplifiedURL === "buyingCenterDetails.html" ? (sessionStorage.getItem("currentActivityTab") || "") : "";
  if (currentTab) {
    pageModule = `${pageModule} - ${currentTab}`;
  }

  const existingEntry = activityData.find(
    (entry) => entry.url === simplifiedURL && entry.module === module && (entry.tabName || "") === currentTab,
  );

  if (!existingEntry) {
    const currentTime = new Date();
    activityData.push({
      url: simplifiedURL,
      startTime: formatDateTimeToLocal(currentTime),
      totalTimeSpent: 0,
      module,
      userEmailId,
      userName,
      userEmpId,
      userDep,
      userJob,
      sessionId,
      environment,
      userLoc,
      pageModule, // Add pageModule to the entry
      tabName: currentTab,
    });
  }
  localStorage.setItem("activityData", JSON.stringify(activityData));
}

let isActive = true;
let inactiveTimeout;
let tabClosed = false;
let pageNavigation = false;

// Function to format time spent in "min:sec"
function formatTimeSpent(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Function to send data using navigator.sendBeacon
function sendBeaconData(activityData) {
  const jsonData = JSON.stringify(activityData);
  const backendURL = `${apiValue.url_ip}:5002/get_session_data`;
  console.log("Sending data to backend:", jsonData);
  navigator.sendBeacon(backendURL, jsonData);
}

function sendDataToBackend() {
  const activityData = getActivityData();

  if (activityData && activityData.length > 0) {
    const currentURL = window.location.href;
    const { simplifiedURL } = processURL(currentURL);

    // Filter and validate data
    const filteredData = activityData.filter((entry) => {
      // Ensure entry has endTime and valid totalTimeSpent
      const hasEndTime = entry.endTime;
      const hasValidTimeSpent =
        entry.totalTimeSpent !== null &&
        entry.totalTimeSpent !== undefined &&
        entry.totalTimeSpent > 0 &&
        entry.totalTimeSpent <= 500;

      return hasEndTime && hasValidTimeSpent;
    });

    filteredData.forEach((entry) => {
      // Ensure totalTimeSpent is a number
      if (typeof entry.totalTimeSpent !== "number") {
        entry.totalTimeSpent = parseInt(entry.totalTimeSpent) || 0;
      }

      entry.timeSpentFormatted = formatTimeSpent(entry.totalTimeSpent);

      // Add exit count logic if needed
      if (tabClosed || !isActive || simplifiedURL === entry.url) {
        entry.exitCount = "yes";
      } else {
        entry.exitCount = "no";
      }
    });

    if (filteredData.length > 0) {
      // Check if the department is "Products" and environment is "Production" or "UAT"
      const isProductsDepInProdOrUAT = filteredData.some(
        (entry) =>
          entry.userDep === "Products" &&
          (entry.environment === "Production"),
      );

      if (!isProductsDepInProdOrUAT) {
        sendBeaconData(filteredData);
      }

      // Always remove old data and restart tracking
      localStorage.removeItem("activityData");
      if (isActive) {
        initializeActivityData();
      }
    }
  }
}

// Function to finalize activity data
function finalizeActivityData() {
  const activityData = getActivityData();
  const currentURL = window.location.href;
  const module = getModuleFromURL(currentURL);
  const { simplifiedURL } = processURL(currentURL);
  const currentTab = simplifiedURL === "buyingCenterDetails.html" ? (sessionStorage.getItem("currentActivityTab") || "") : "";

  const existingEntry = activityData.find(
    (entry) => entry.url === simplifiedURL && entry.module === module && (entry.tabName || "") === currentTab,
  );

  if (existingEntry) {
    const now = new Date();
    let startVisited;

    // Try to parse the existing startTime
    if (typeof existingEntry.startTime === "string") {
      startVisited = new Date(existingEntry.startTime);
    } else {
      startVisited = new Date(existingEntry.startTime);
    }

    // Validate the parsed date
    if (isNaN(startVisited.getTime())) {
      console.error(
        "Invalid startTime in existing entry:",
        existingEntry.startTime,
      );
      startVisited = new Date(); // Use current time as fallback
    }

    const timeSpent = Math.floor((now - startVisited) / 1000);

    // Ensure timeSpent is valid and positive
    const validTimeSpent = timeSpent > 0 && timeSpent < 86400 ? timeSpent : 0; // Max 24 hours

    existingEntry.totalTimeSpent =
      (existingEntry.totalTimeSpent || 0) + validTimeSpent;
    existingEntry.endTime = formatDateTimeToLocal(new Date());

    // Add formatted time
    existingEntry.timeSpentFormatted = formatTimeSpent(
      existingEntry.totalTimeSpent,
    );

    localStorage.setItem("activityData", JSON.stringify(activityData));
  }

  if (existingEntry === undefined) {
    if (isActive) {
      initializeActivityData();
    }
  }
}

// Event listener to track tab close
window.addEventListener("beforeunload", function () {
  if (!pageNavigation) {
    tabClosed = true;
  }
  finalizeActivityData();
  sendDataToBackend();
  clearInterval(sessionStorage.getItem("sendIntervalID"));
  sessionStorage.removeItem("sendIntervalID");
});

// Event listener to track page navigation
window.addEventListener("pagehide", function () {
  pageNavigation = true;
  finalizeActivityData();
  sendDataToBackend();
  clearInterval(sessionStorage.getItem("sendIntervalID"));
  sessionStorage.removeItem("sendIntervalID");
});

// Event listener to reset inactivity timeout and reinitialize activity data if user becomes active
function resetInactivityTimeout() {
  clearTimeout(inactiveTimeout);
  // console.log('isActive reset start - ', isActive);
  if (!isActive) {
    userStatusData = "User is active again";
    var currentURL = window.location.href;
    var module = getModuleFromURL(currentURL);
    const { simplifiedURL, environment } = processURL(currentURL);

    var activityData = getActivityData();
    const currentTab = simplifiedURL === "buyingCenterDetails.html" ? (sessionStorage.getItem("currentActivityTab") || "") : "";
    var existingEntry = activityData.find(
      (entry) => entry.url === simplifiedURL && entry.module === module && (entry.tabName || "") === currentTab,
    );

    if (existingEntry) {
      existingEntry.startTime = formatDateTimeToLocal(new Date());
      // existingEntry.exitCount = '-';
      // existingEntry.userStatusData = userStatusData;
      localStorage.setItem("activityData", JSON.stringify(activityData));
    }
  }

  isActive = true;
  tabClosed = false;
  inactiveTimeout = setTimeout(function () {
    userStatusData = "User is inactive";
    finalizeActivityData();
    sendDataToBackend();
    isActive = false;
  }, 180000);
  // console.log('isActive reset end - ', isActive);
}

// Track mouse and keyboard activity to reset inactivity timeout
document.addEventListener("mousemove", resetInactivityTimeout);
document.addEventListener("keydown", resetInactivityTimeout);

// Page visibility API to handle visibility change
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    userStatusData = "Page is hidden";
    finalizeActivityData();
    sendDataToBackend();
    isActive = false;
  } else {
    userStatusData = "Page is visible";
    resetInactivityTimeout();
  }
});

// Window focus and blur events
window.addEventListener("focus", resetInactivityTimeout);
window.addEventListener("blur", function () {
  userStatusData = "Window is blurred";
  finalizeActivityData();
  sendDataToBackend();
  isActive = false;
});

// Initialize inactivity timeout on page load
resetInactivityTimeout();

// Interval to send data every 2 minutes (for testing)
var sendInterval = setInterval(function () {
  if (isActive) {
    finalizeActivityData();
    sendDataToBackend();
  }
}, 120000);

// Save the interval ID in sessionStorage so it can be cleared if needed
sessionStorage.setItem("sendIntervalID", sendInterval);

// Initialize activity data for the current page
initializeActivityData();

function generateSafeId(unsafe) {
  return unsafe
    .replace(/ /g, "_") // Replace spaces with _
    .replace(/&#039;/g, "_") // Replace HTML code for single quote with _
    .replace(/&amp;/g, "_") // Replace HTML code for & with _
    .replace(/&lt;/g, "_") // Replace HTML code for < with _
    .replace(/&gt;/g, "_") // Replace HTML code for > with _
    .replace(/&quot;/g, "_") // Replace HTML code for double quote with _
    .replace(/\s+/g, "_") // Replace spaces with _
    .replace(/[^a-zA-Z0-9_-]/g, "_"); // Replace other invalid characters with _
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "{{newline}}");
}

function restrictSpecialCharactersById(inputId, spcl) {
  console.log("spcl - " + spcl);
  let disallowedChars;
  let errorMessage;

  if (spcl !== undefined) {
    // If spcl is defined, allow only numbers
    disallowedChars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+`-=[]{}|;:".<>?/\\'; // All non-numeric characters
    errorMessage = "Only numeric values are allowed."; // Tooltip message
  } else {
    // Default disallowed characters
    disallowedChars = "`~$%^<>{}[]";
    errorMessage = "Special characters are not allowed."; // Tooltip message
  }

  // Create a Set of disallowed characters for quick lookup
  const disallowedSet = new Set(disallowedChars.split(""));

  // Select the input element by ID
  const inputElement = document.getElementById(inputId);
  if (!inputElement) {
    console.error(`No element found with ID: ${inputId}`);
    return;
  }

  // Attach the keydown event listener to prevent disallowed characters
  inputElement.addEventListener("keydown", (event) => {
    const key = event.key;

    if (disallowedSet.has(key)) {
      event.preventDefault(); // Prevent the disallowed character from being entered
      showTooltip(inputElement, errorMessage); // Show tooltip
    }
  });

  // Attach the input event listener to validate the input value
  inputElement.addEventListener("input", () => {
    const currentValue = inputElement.value;

    // Remove any disallowed characters from the value
    const filteredValue = Array.from(currentValue)
      .filter((char) => !disallowedSet.has(char))
      .join("");

    // If the value was changed, update the input and show tooltip
    if (currentValue !== filteredValue) {
      inputElement.value = filteredValue;
      showTooltip(inputElement, errorMessage);
    }
  });

  // Function to display the tooltip-like message
  function showTooltip(inputElement, message) {
    // Check if a tooltip already exists
    let tooltip = inputElement.parentNode.querySelector(".tooltip-message");

    if (!tooltip) {
      // Create a tooltip element if it doesn't exist
      tooltip = document.createElement("div");
      tooltip.className = "tooltip-message";
      tooltip.style.position = "absolute";
      tooltip.style.backgroundColor = "#f8d7da"; // Light red background
      tooltip.style.color = "#721c24"; // Dark red text
      tooltip.style.padding = "5px 10px";
      tooltip.style.border = "1px solid #f5c6cb"; // Light red border
      tooltip.style.borderRadius = "4px";
      tooltip.style.boxShadow = "0 1px 1px rgba(0, 0, 0, 0.2)";
      tooltip.style.fontSize = "0.9rem";
      tooltip.style.whiteSpace = "nowrap";
      tooltip.style.zIndex = "1000";

      // Position the tooltip below the input field
      const rect = inputElement.getBoundingClientRect();
      tooltip.style.left = `${rect.left + window.scrollX}px`;
      tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;

      // Append the tooltip to the body or parent container
      document.body.appendChild(tooltip);
    }

    // Set the tooltip message
    tooltip.textContent = message;

    // Automatically remove the tooltip after 2 seconds
    setTimeout(() => {
      if (tooltip) {
        tooltip.remove();
      }
    }, 2000);
  }
}

function checkEndDate(startdateid, enddateid, message) {
  let StartDateCon = new Date($("#" + startdateid).val());
  let EndDateCon = new Date($("#" + enddateid).val());
  console.log("startdateid - ", startdateid, "startdateid - ", startdateid);
  console.log("StartDateCon - ", StartDateCon, "EndDateCon - ", EndDateCon);
  let status = true;
  if (StartDateCon > EndDateCon) {
    toastr.error(message);
    $("#" + enddateid).val(""); // Clear the invalid End Date
    status = false;
  } else if (
    StartDateCon == undefined ||
    StartDateCon == null ||
    StartDateCon == ""
  ) {
    toastr.error("Please select start date");
    status = false;
  }

  return status;
}

if (typeof toastr !== "undefined") {
  // --- 1. Define SVG Icons for all toast types ---
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg>`,
    close: `<svg width="12" height="12" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>`,
  };

  /**
   * A factory function that creates an override for a specific toastr method.
   * @param {function} originalToastFunction - The original toastr function (e.g., toastr.success).
   * @param {string} iconSvg - The SVG string for the toast's main icon.
   * @param {string} toastType - The type of the toast (e.g., 'success', 'warning').
   * @returns {function} A new function to replace the original toastr method.
   */
  const createToastrOverride = function (
    originalToastFunction,
    iconSvg,
    toastType,
  ) {
    // Return the new function that will become `toastr.success`, `toastr.error`, etc.
    return function (message, title, optionsOverride) {
      let finalMessage;
      let finalOptions;

      // Build the cancel button HTML only if requested
      const cancelButtonHtml =
        optionsOverride && optionsOverride.showCancelButton
          ? `<span class='cancel-tos-icon'>${icons.close}</span>`
          : "";

      // Construct the final message body with the appropriate icon
      finalMessage = `
                <div class="custom-toast-message">
                    <span class='check-icon-tos'>${iconSvg}</span>
                    <span>${message}</span>
                    <span class='cancel-tos-icon'>${icons.close}</span>
                </div>`;

      // Special case: track successful note saves for Notes Log Engagement
      if (toastType === 'success' && message && message.includes('Note saved successfully')) {
        if (typeof updateNotesLogActivityData === 'function') {
          updateNotesLogActivityData(true);
        }
      }

      // Check if a persistent toast with a cancel button is requested
      if (optionsOverride && optionsOverride.showCancelButton) {
        // --- CASE 1: Toast WITH a cancel button (persistent) ---
        finalOptions = {
          ...optionsOverride,
          allowHtml: true,
          timeOut: 0,
          extendedTimeOut: 0,
          tapToDismiss: false,
          closeButton: false, // Hide the default 'x' close button
          onShown: function (toastElement) {
            // Attach a click event to our custom cancel icon
            const cancelIcon = toastElement.find(".cancel-tos-icon");
            if (cancelIcon.length) {
              cancelIcon.on("click", function (e) {
                e.stopPropagation(); // Prevent other click events
                toastr.clear(toastElement); // Close this specific toast
              });
            }
          },
        };
      } else {
        // --- CASE 2: Standard, auto-hiding toast (original behavior) ---
        finalOptions = {
          ...optionsOverride,
          allowHtml: true,
        };
      }

      // Set the custom CSS class for this toast type
      if (!toastr.options.iconClasses) toastr.options.iconClasses = {};
      toastr.options.iconClasses[toastType] = `toast-${toastType}`;

      // Finally, call the original toastr function with our modified content and options
      return originalToastFunction(finalMessage, title, finalOptions);
    };
  };

  // --- 2. Apply the override to each toast type ---
  const typesToOverride = {
    success: { original: toastr.success, icon: icons.success },
    warning: { original: toastr.warning, icon: icons.warning },
    error: { original: toastr.error, icon: icons.error },
  };

  for (const type in typesToOverride) {
    if (Object.hasOwnProperty.call(typesToOverride, type)) {
      const config = typesToOverride[type];
      // Replace the original toastr method with our new, enhanced version
      toastr[type] = createToastrOverride(config.original, config.icon, type);
    }
  }
}

// ============================================
// ENHANCED TRACKING FOR OVERALL SUMMARY REPORT
// This adds granular tracking for tab clicks, filters, and interactions
// ============================================

// Function to get current view details for Overall Summary Report
function getOverallSummaryViewDetails() {
  const viewDetails = {
    mainTab: "", // accountLevel, sowLevel, buyingCenter
    subTab: "", // for SOW Level: actualProjected, sowAmount
    showNewLogoStatus: "", // shown, hidden
    selectedAccount: "", // account name if clicked
    selectedBuyingCenter: "", // buying center name if clicked
  };

  try {
    // Get main tab selection
    if (
      $("#overall_summary_data").length &&
      $("#overall_summary_data").is(":checked")
    ) {
      viewDetails.mainTab = "accountLevel";

      // Check if new logo rows are visible
      // Default to "hidden" if no new-logo-row elements exist or if they're hidden
      viewDetails.showNewLogoStatus = "hidden";
      if ($(".new-logo-row").length) {
        const newLogoVisible = $(".new-logo-row").first().is(":visible");
        viewDetails.showNewLogoStatus = newLogoVisible ? "shown" : "hidden";
      }

      // Only get from localStorage (set by popup or click handler)
      // Do NOT automatically pick from table - only use explicitly selected accounts
      let storedAccount = localStorage.getItem("selectedAccountForTracking");

      if (storedAccount && storedAccount !== "") {
        viewDetails.selectedAccount = storedAccount;
      }
    } else if (
      $("#account_by_sow_data").length &&
      $("#account_by_sow_data").is(":checked")
    ) {
      viewDetails.mainTab = "sowLevel";

      // Get SOW Level sub-tab
      if ($("#planned").length && $("#planned").is(":checked")) {
        viewDetails.subTab = "actualProjected";
      } else if ($("#actual").length && $("#actual").is(":checked")) {
        viewDetails.subTab = "sowAmount";
      }
    } else if (
      $("#buying_center_data").length &&
      $("#buying_center_data").is(":checked")
    ) {
      viewDetails.mainTab = "buyingCenter";

      // First try localStorage
      let storedBC = localStorage.getItem("selectedBuyingCenterForTracking");

      // If not in localStorage, try to get from currently visible table
      if (storedBC && storedBC !== "") {
        viewDetails.selectedBuyingCenter = storedBC;
      } else {
        $(".buying-center-row").each(function () {
          const text = $(this).text().trim();
          if (text && text.length < 100) {
            // Get just the first line (name)
            storedBC = text.split("$")[0].trim();
            return false;
          }
        });
      }

      if (storedBC) {
        viewDetails.selectedBuyingCenter = storedBC;
      }
    }
  } catch (e) {
    console.log("Error getting view details:", e);
  }

  return viewDetails;
}

// Function to update activity data with view details for Overall Summary Report
// Creates separate entries for each level: Account, SOW, Buying Center
function updateActivityDataWithViewDetails() {
  try {
    console.log("Updating Activity Data with View Details...");
    // Only process if we're on the Overall Summary page
    if (!window.location.pathname.includes("reportOverallSummary")) {
      return;
    }

    const activityData = getActivityData();
    const currentURL = window.location.href;
    const { simplifiedURL } = processURL(currentURL);

    // Find the existing entry for this page
    let existingEntry = activityData.find(
      (entry) => entry.url === simplifiedURL,
    );

    // Get current view details
    const viewDetails = getOverallSummaryViewDetails();

    // Create separate view details for each level based on mainTab
    let accountLevelDetails = null;
    let sowLevelDetails = null;
    let buyingCenterDetails = null;

    if (viewDetails.mainTab === "accountLevel") {
      // Account Level: mainTab, showNewLogoStatus, selectedAccount
      accountLevelDetails = {
        mainTab: viewDetails.mainTab,
        showNewLogoStatus: viewDetails.showNewLogoStatus,
        selectedAccount: viewDetails.selectedAccount || "",
      };
    } else if (viewDetails.mainTab === "sowLevel") {
      // SOW Level: mainTab, subTab
      sowLevelDetails = {
        mainTab: viewDetails.mainTab,
        subTab: viewDetails.subTab || "",
      };
    } else if (viewDetails.mainTab === "buyingCenter") {
      // Buying Center Level: mainTab, selectedBuyingCenter
      buyingCenterDetails = {
        mainTab: viewDetails.mainTab,
        selectedBuyingCenter: viewDetails.selectedBuyingCenter || "",
      };
    }

    if (existingEntry) {
      // Add all three level details to the entry
      existingEntry.accountLevelDetails = accountLevelDetails;
      existingEntry.sowLevelDetails = sowLevelDetails;
      existingEntry.buyingCenterDetails = buyingCenterDetails;

      // Store updated data back to localStorage
      localStorage.setItem("activityData", JSON.stringify(activityData));
    }
  } catch (e) {
    console.log("Error updating activity data with view details:", e);
  }
}

// Function to track account click in Overall Summary Report
function trackAccountClickInOverallSummary(accountName) {
  try {
    console.log("Tracking Activity: Account Click ->", accountName);
    localStorage.setItem("selectedAccountForTracking", accountName);
    // Trigger update of activity data
    updateActivityDataWithViewDetails();
  } catch (e) {
    console.log("Error tracking account click:", e);
  }
}

// Function to track buying center click in Overall Summary Report
function trackBuyingCenterClickInOverallSummary(bcName) {
  try {
    console.log("Tracking Activity: Buying Center Click ->", bcName);
    localStorage.setItem("selectedBuyingCenterForTracking", bcName);
    // Trigger update of activity data
    updateActivityDataWithViewDetails();
  } catch (e) {
    console.log("Error tracking buying center click:", e);
  }
}

// Function to get current view details for NPS module
function getNpsViewDetails() {
  const viewDetails = {
    mainTab: "", // planning, summary, buying-center
    selectedAccount: "",
    selectedSow: "",
    selectedStakeholder: "",
    selectedYear: "",
    selectedBuyingCenter: "",
    selectedSuperboss: "",
    selectedKeyStakeholder: ""
  };

  try {
    if (window.location.pathname.includes("nps.html")) {
      const activeTab = $(".nps-tab.active").data("tab");
      viewDetails.mainTab = activeTab;

      if (activeTab === "planning") {
        viewDetails.selectedAccount = ($("#planAccount").val() || []).join(", ");
        viewDetails.selectedSow = ($("#planSow").val() || []).join(", ");
        viewDetails.selectedStakeholder = ($("#planStakeholder").val() || []).join(", ");
        viewDetails.selectedYear = $("#planYear").val() || "";
      } else if (activeTab === "summary") {
        viewDetails.selectedAccount = ($("#sumAccount").val() || []).join(", ");
        viewDetails.selectedSow = ($("#sumSow").val() || []).join(", ");
        viewDetails.selectedStakeholder = ($("#sumStakeholder").val() || []).join(", ");
        viewDetails.selectedYear = $("#sumYear").val() || "";
      } else if (activeTab === "buying-center") {
        viewDetails.selectedAccount = ($("#bcAccount").val() || []).join(", ");
        viewDetails.selectedBuyingCenter = ($("#bcBuyingCenter").val() || []).join(", ");
        viewDetails.selectedSuperboss = ($("#bcSuperboss").val() || []).join(", ");
        viewDetails.selectedKeyStakeholder = ($("#bcKeyStakeholder").val() || []).join(", ");
        viewDetails.selectedStakeholder = ($("#bcStakeholder").val() || []).join(", ");
      }
    }
  } catch (e) {
    console.log("Error getting NPS view details:", e);
  }

  return viewDetails;
}

// Function to update activity data with view details for NPS module
function updateNpsActivityData() {
  try {
    if (!window.location.pathname.includes("nps.html")) {
      return;
    }

    const activityData = getActivityData();
    const currentURL = window.location.href;
    const { simplifiedURL } = processURL(currentURL);

    let existingEntry = activityData.find(
      (entry) => entry.url === simplifiedURL,
    );

    const viewDetails = getNpsViewDetails();
    
    let npsPlanningDetails = null;
    let npsSummaryDetails = null;
    let npsBuyingCenterDetails = null;

    if (viewDetails.mainTab === "planning") {
      npsPlanningDetails = {
        mainTab: "CNPS Planning",
        selectedAccount: viewDetails.selectedAccount,
        selectedSow: viewDetails.selectedSow,
        selectedStakeholder: viewDetails.selectedStakeholder,
        selectedYear: viewDetails.selectedYear
      };
    } else if (viewDetails.mainTab === "summary") {
      npsSummaryDetails = {
        mainTab: "CNPS Summary",
        selectedAccount: viewDetails.selectedAccount,
        selectedSow: viewDetails.selectedSow,
        selectedStakeholder: viewDetails.selectedStakeholder,
        selectedYear: viewDetails.selectedYear
      };
    } else if (viewDetails.mainTab === "buying-center") {
      npsBuyingCenterDetails = {
        mainTab: "CNPS Buying Center",
        selectedAccount: viewDetails.selectedAccount,
        selectedBuyingCenter: viewDetails.selectedBuyingCenter,
        selectedSuperboss: viewDetails.selectedSuperboss,
        selectedKeyStakeholder: viewDetails.selectedKeyStakeholder,
        selectedStakeholder: viewDetails.selectedStakeholder
      };
    }

    if (existingEntry) {
      existingEntry.npsPlanningDetails = npsPlanningDetails;
      existingEntry.npsSummaryDetails = npsSummaryDetails;
      existingEntry.npsBuyingCenterDetails = npsBuyingCenterDetails;

      localStorage.setItem("activityData", JSON.stringify(activityData));
    }
  } catch (e) {
    console.log("Error updating NPS activity data:", e);
  }
}

// Function to get current view details for Notes Log Engagement
function getNotesLogViewDetails() {
  const viewDetails = {
    searchType: "", // stakeholder, lead
    selectedAccount: "",
    selectedSow: "",
    selectedBuyingCenter: "",
    selectedStakeholder: "",
    isNoteSaved: false
  };

  try {
    if (window.location.pathname.includes("notesLogEngagement.html")) {
      const rawSearchType = $("#searchType").val() || "";
      viewDetails.searchType = rawSearchType === "lead" ? "SOW" : (rawSearchType === "stakeholder" ? "Stakeholder" : rawSearchType);
      viewDetails.selectedAccount = $("#searchAccount option:selected").text() || "";
      viewDetails.selectedSow = $("#searchSow option:selected").text() || "";
      viewDetails.selectedBuyingCenter = $("#searchBuyingCenter option:selected").text() || "";
      viewDetails.selectedStakeholder = $("#searchStakeholder").val() || "";

      // Clean up "Search ..." defaults
      if (viewDetails.selectedAccount === "Search Account" || viewDetails.selectedAccount === "Loading...") viewDetails.selectedAccount = "";
      if (viewDetails.selectedSow === "Search SOW") viewDetails.selectedSow = "";
      if (viewDetails.selectedBuyingCenter === "Search Buying Center") viewDetails.selectedBuyingCenter = "";

      // Preserve isNoteSaved if already true in current session
      const activityData = getActivityData();
      const currentURL = window.location.href;
      const { simplifiedURL } = processURL(currentURL);
      const existingEntry = activityData.find(entry => entry.url === simplifiedURL);
      if (existingEntry && existingEntry.notesLogDetails && existingEntry.notesLogDetails.isNoteSaved) {
        viewDetails.isNoteSaved = true;
      }
    }
  } catch (e) {
    console.log("Error getting Notes Log view details:", e);
  }

  return viewDetails;
}

// Function to update activity data with view details for Notes Log Engagement
function updateNotesLogActivityData(isSaved = false) {
  try {
    if (!window.location.pathname.includes("notesLogEngagement.html")) {
      return;
    }

    const activityData = getActivityData();
    const currentURL = window.location.href;
    const { simplifiedURL } = processURL(currentURL);

    let existingEntry = activityData.find(
      (entry) => entry.url === simplifiedURL,
    );

    const viewDetails = getNotesLogViewDetails();
    if (isSaved) {
      viewDetails.isNoteSaved = true;
    }

    if (existingEntry) {
      existingEntry.notesLogDetails = {
        searchType: viewDetails.searchType,
        selectedAccount: viewDetails.selectedAccount,
        selectedSow: viewDetails.selectedSow,
        selectedBuyingCenter: viewDetails.selectedBuyingCenter,
        selectedStakeholder: viewDetails.selectedStakeholder,
        isNoteSaved: viewDetails.isNoteSaved
      };

      localStorage.setItem("activityData", JSON.stringify(activityData));
    }
  } catch (e) {
    console.log("Error updating Notes Log activity data:", e);
  }
}

// Override finalizeActivityData to include enhanced view details tracking
// This wraps the original function without modifying it
const originalFinalizeActivityData = finalizeActivityData;
finalizeActivityData = function () {
  // Call original function first
  if (typeof originalFinalizeActivityData === "function") {
    originalFinalizeActivityData();
  }

  // Add enhanced tracking for Overall Summary Report
  updateActivityDataWithViewDetails();
  
  // Add enhanced tracking for NPS
  updateNpsActivityData();

  // Add enhanced tracking for Notes Log Engagement
  updateNotesLogActivityData();
};

// Set up event listeners for Overall Summary Report interactions when DOM is ready
$(document).ready(function () {
  // On page load, clear any stale tracking data for Overall Summary page
  if (window.location.pathname.includes("reportOverallSummary")) {
    // Clear stale tracking values on page load
    localStorage.setItem("selectedAccountForTracking", "");
    localStorage.setItem("lastClickedAccount", "");
  }

  // Delay to ensure other scripts have loaded
  setTimeout(function () {
    // Track tab clicks (main level tabs)
    $('input[name="data_tab_switch"]').on("change", function () {
      updateActivityDataWithViewDetails();
    });

    // Track NPS tab clicks
    $(document).on("click", ".nps-tab", function () {
      // Small delay to allow the active class to be updated by the page's own script
      setTimeout(function () {
        updateNpsActivityData();
      }, 100);
    });

    // Track NPS filter changes
    $(document).on("change", ".nps-select, .ms-select, #planYear, #sumYear, #npsSearch, #npsSummarySearch, #npsBcSearch", function () {
      updateNpsActivityData();
    });

    // Track Notes Log Engagement filter changes
    $(document).on("change", "#searchType, #searchAccount, #searchSow, #searchBuyingCenter", function () {
      updateNotesLogActivityData();
    });

    // Track Notes Log Engagement stakeholder input
    $(document).on("keyup change", "#searchStakeholder", function () {
      // Use a timer to avoid excessive updates while typing
      clearTimeout(this.notesStakeholderTimer);
      this.notesStakeholderTimer = setTimeout(function () {
        updateNotesLogActivityData();
      }, 500);
    });

    // Also track search input with a debounce or on keyup
    $(document).on("keyup", "#npsSearch, #npsSummarySearch, #npsBcSearch", function () {
      // Use a timer to avoid excessive updates while typing
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(function () {
        updateNpsActivityData();
      }, 500);
    });

    // Track NPS toggle button clicks in Buying Center
    $(document).on("click", ".nps-toggle-btn", function () {
      setTimeout(function () {
        updateNpsActivityData();
      }, 100);
    });

    // Track SOW Level sub-tab clicks
    $('input[name="sow_amount_by_acc"]').on("change", function () {
      updateActivityDataWithViewDetails();
    });

    // Track Show/Hide New Logo button click
    $(document).on("click", ".show_hide_new_logo", function () {
      // Delay to allow the toggle to complete
      setTimeout(function () {
        updateActivityDataWithViewDetails();
      }, 100);
    });

    // Track account name clicks (links to account details)
    $(document).on(
      "click",
      ".account_bg a, .sow_data_name_all, a.sow_data_name_all",
      function () {
        let accountName = "";
        const element = $(this);
        accountName = element.text().trim();
        // Fallback: if empty, try getting from parent
        if (!accountName) {
          accountName = element
            .closest("tr")
            .text()
            .trim()
            .split("$")[0]
            .trim();
        }
        if (
          accountName &&
          accountName !== "Overall" &&
          accountName !== "New Logo"
        ) {
          trackAccountClickInOverallSummary(accountName);
        }
      },
    );


    // Track popup table rows - using centralized listeners below


    // ============================================
    // TRACK WHEN POPUP IS OPENED - Capture account from source element
    // ============================================

    // Function to track popup opening and closing
    function trackPopupOpening(popupId) {
      const popup = document.getElementById(popupId);
      if (popup) {
        // Track the previous visibility state to avoid redundant calls
        let wasVisible = $(popup).is(":visible");

        // Use MutationObserver to detect when popup becomes visible
        const observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            if (mutation.type === "attributes" && mutation.attributeName === "style") {
              const isCurrentlyVisible = $(popup).is(":visible");

              // Only trigger when state changes from HIDDEN to VISIBLE
              if (isCurrentlyVisible && !wasVisible) {
                wasVisible = true; // Update state

                // Popup just became visible - track the account
                setTimeout(function () {
                  let accountName = localStorage.getItem("lastClickedAccount");
                  if (!accountName) {
                    accountName = localStorage.getItem("selectedAccountForTracking");
                  }
                  if (accountName && accountName !== "Overall" && accountName !== "New Logo") {
                    trackAccountClickInOverallSummary(accountName);
                  }
                }, 100);
              } else if (!isCurrentlyVisible) {
                wasVisible = false; // Update state
                // Note: We no longer clear the selectedAccount on hide
                // so the data persists for the final report upload
              }
            }
          });
        });

        // Start observing the popup element
        observer.observe(popup, {
          attributes: true,
          attributeFilter: ['style']
        });
      }
    }

    // Initialize observers for both popup types
    trackPopupOpening("popup-month-account");
    trackPopupOpening("popup-month");

    // Also track popup close events - no longer clearing account for persistence
    $(document).on("click", "#popup-overlay-month-account", function () {
      setTimeout(function () {
        if (!$("#popup-month-account").is(":visible")) {
          updateActivityDataWithViewDetails();
        }
      }, 200);
    });

    $(document).on("click", "#popup-overlay-month", function () {
      setTimeout(function () {
        if (!$("#popup-month").is(":visible")) {
          updateActivityDataWithViewDetails();
        }
      }, 200);
    });

    $(document).on("click", ".close-popup, .popup-close, [class*='close']", function () {
      setTimeout(function () {
        if (!$("#popup-month-account").is(":visible") && !$("#popup-month").is(":visible")) {
          updateActivityDataWithViewDetails();
        }
      }, 200);
    });

    // Track when #popup-month-account is clicked (fallback tracking)
    $(document).on("click", "#popup-month-account", function () {
      // Try to get the most recently clicked account name first
      let accountName = localStorage.getItem("lastClickedAccount");

      // If not available, try to get from the highlighted cell
      if (!accountName) {
        const highlightedCell = $(".highlighted-cell");
        if (highlightedCell.length) {
          const parentRow = highlightedCell.closest("tr");
          if (parentRow.length) {
            // For account-level rows, check for factspan_account_sum class pattern
            const factspanRow = parentRow.find("[class*='factspan_account_sum_']");
            if (factspanRow.length) {
              // Get the account name and clean it up (remove newlines and extra spaces)
              accountName = parentRow.find("td:first-child").text().trim().replace(/\s\s+/g, ' ').replace(/[-\s]+$/, '').trim();
            }
            // Fallback to account_bg class
            if (!accountName || accountName === "Overall") {
              const accountCell = parentRow.find("td.account_bg");
              if (accountCell.length) {
                accountName = accountCell.text().trim().replace(/\s\s+/g, ' ').replace(/[-\s]+$/, '').trim();
              }
            }
          }
        }
      }

      if (accountName && accountName !== "Overall" && accountName !== "New Logo") {
        trackAccountClickInOverallSummary(accountName);
      }
    });

    // Track when #popup-month is opened (overall monthly popup)
    $(document).on("click", "#popup-month", function () {
      let accountName = localStorage.getItem("lastClickedAccount");

      if (!accountName) {
        const highlightedCell = $(".highlighted-cell");
        if (highlightedCell.length) {
          const parentRow = highlightedCell.closest("tr");
          if (parentRow.length) {
            const accountCell = parentRow.find("td.account_bg");
            if (accountCell.length) {
              accountName = accountCell.text().trim().replace(/\s\s+/g, ' ').replace(/[-\s]+$/, '').trim();
            }
            if (!accountName || accountName === "Overall") {
              accountName = parentRow.find("td:first-child").text().trim();
            }
          }
        }
      }

      if (accountName && accountName !== "Overall" && accountName !== "New Logo") {
        trackAccountClickInOverallSummary(accountName);
      }
    });

    // Track clicks on table cells that can open popups - store account for popup tracking
    // This captures the account when clicking on cells that will open a popup
    $(document).on("click", "#report_overall_summary_body td.table-cell, #report_buying_center_body td.table-cell", function (e) {
      // Stop propagation to prevent any other handlers from interfering
      e.stopPropagation();

      const row = $(this).closest("tr");
      if (row.length) {
        let accountName = "";

        // Method 1: Check for factspan_account_sum class pattern in row classes
        const rowClasses = row.attr("class") || "";
        if (rowClasses.includes("factspan_account_sum_")) {
          accountName = row.find("td:first-child").text().trim();
        }

        // Method 2: Try account_bg cell
        if (!accountName || accountName === "Overall" || accountName === "") {
          const accountCell = row.find("td.account_bg");
          if (accountCell.length) {
            accountName = accountCell.text().trim().replace(/\s\s+/g, ' ').replace(/[-\s]+$/, '').trim();
          }
        }

        // Method 3: Try first cell
        if (!accountName || accountName === "Overall" || accountName === "") {
          accountName = row.find("td:first-child").text().trim().replace(/\s\s+/g, ' ').replace(/[-\s]+$/, '').trim();
        }

        // Method 4: Check if there's a rowspan - look for previous rows with account_bg
        if (!accountName || accountName === "Overall" || accountName === "") {
          const prevRow = row.prev("tr");
          if (prevRow.length) {
            const prevAccountCell = prevRow.find("td.account_bg");
            if (prevAccountCell.length) {
              accountName = prevAccountCell.text().trim();
            }
          }
        }

        // Relaxed filter to allow all tracked rows including 70%, 100% Signed, etc.
        if (accountName && accountName.length > 0 && accountName !== "Overall" && accountName !== "New Logo") {
          localStorage.setItem("lastClickedAccount", accountName);
          trackAccountClickInOverallSummary(accountName);
        }
      }
    });

    // Also track when popup table rows are clicked - use actual table IDs
    // Track clicks on #popupTableBodyMonthAccount (account-level popup table)
    $(document).on("click", "#popupTableBodyMonthAccount tr", function () {
      const row = $(this);
      let accountName = "";
      const accountCell = row.find("td:first-child");
      if (accountCell.length) {
        accountName = accountCell.text().trim().replace(/\s\s+/g, ' ').replace(/[-\s]+$/, '').trim();
      }
      // Fallback
      if (!accountName) {
        accountName = row.text().trim().split("$")[0].trim(); // Get the first part (name) before the value
      }
      if (accountName) {
        trackAccountClickInOverallSummary(accountName + " (popup-account)");
      }
    });

    // Track clicks on #popupTableBodyMonth (monthly popup table)
    $(document).on("click", "#popupTableBodyMonth tr", function () {
      const row = $(this);
      let accountName = "";
      const accountCell = row.find("td:first-child");
      if (accountCell.length) {
        accountName = accountCell.text().trim().replace(/\s\s+/g, ' ').replace(/[-\s]+$/, '').trim();
      }
      // Fallback
      if (!accountName) {
        accountName = row.text().trim().split("$")[0].trim();
      }
      if (accountName) {
        trackAccountClickInOverallSummary(accountName + " (popup-month)");
      }
    });

    // Track clicks on #popupTableBody (general popup table)
    $(document).on("click", "#popupTableBody tr", function () {
      const row = $(this);
      let accountName = "";
      const accountCell = row.find("td:first-child");
      if (accountCell.length) {
        accountName = accountCell.text().trim().replace(/\s\s+/g, ' ').replace(/[-\s]+$/, '').trim();
      }
      // Fallback
      if (!accountName) {
        accountName = row.text().trim().split("$")[0].trim();
      }
      if (accountName) {
        trackAccountClickInOverallSummary(accountName + " (popup-data)");
      }
    });


    // Track buying center row clicks
    $(document).on("click", ".buying-center-row", function () {
      const row = $(this);
      // Get only the first cell (name) and exclude values from other cells
      let bcName = "";
      const nameCell = row.find("td:first-child");
      if (nameCell.length) {
        bcName = nameCell.text().trim().replace(/\s\s+/g, ' ').replace(/[-\s]+$/, '').trim();
      }
      // Fallback: if first cell is empty, try getting from the row directly
      if (!bcName) {
        bcName = row.text().trim().split("$")[0].trim().replace(/\s\s+/g, ' ').replace(/[-\s]+$/, '').trim();
      }
      if (bcName) {
        trackBuyingCenterClickInOverallSummary(bcName);
      }
    });

    // Also track any click on table cells that might represent accounts
    $(document).on("click", "td.account_bg", function () {
      const accountName = $(this).text().trim().replace(/\s\s+/g, ' ').replace(/[-\s]+$/, '').trim();
      if (
        accountName &&
        accountName !== "Overall" &&
        accountName !== "New Logo"
      ) {
        trackAccountClickInOverallSummary(accountName);
      }
    });
  }, 500); // Wait 500ms after DOM ready
});

// Export functions for use in other scripts if needed
if (typeof window !== "undefined") {
  window.getOverallSummaryViewDetails = getOverallSummaryViewDetails;
  window.updateActivityDataWithViewDetails = updateActivityDataWithViewDetails;
  window.trackAccountClickInOverallSummary = trackAccountClickInOverallSummary;
  window.trackBuyingCenterClickInOverallSummary =
    trackBuyingCenterClickInOverallSummary;
  window.getNotesLogViewDetails = getNotesLogViewDetails;
  window.updateNotesLogActivityData = updateNotesLogActivityData;
  window.getAccountOrderMap = getAccountOrderMap;
  window.sortAccountsByOrder = sortAccountsByOrder;
  window.clearAccountOrderCache = clearAccountOrderCache;
}

let _globalAccountOrderMap = null;

function clearAccountOrderCache() {
    _globalAccountOrderMap = null;
}

function getAccountOrderMap() {
    if (_globalAccountOrderMap !== null) {
        return _globalAccountOrderMap;
    }
    let orderMap = {};
    $.ajax({
        url: apiValue.url.replace("/app", "/get_account_order"),
        type: "POST",
        dataType: "json",
        async: false,
        data: JSON.stringify({}),
        success: function(orderRes) {
            if (Array.isArray(orderRes)) {
                $.each(orderRes, function (i, item) {
                    if (item && typeof item === 'object') {
                        orderMap[item.id] = i + 1;
                        if (item.name) {
                            orderMap[item.name.toLowerCase().trim()] = i + 1;
                        }
                    } else {
                        orderMap[item] = i + 1;
                    }
                });
            }
        },
        error: function() {
            console.error("Failed to load account order mapping");
        }
    });
    _globalAccountOrderMap = orderMap;
    return _globalAccountOrderMap;
}

function sortAccountsByOrder(accounts, key = "ACCOUNT_NAME", asc = true) {
    let orderMap = getAccountOrderMap();
    accounts.sort(function (a, b) {
        let valA = (typeof a === 'object' && a !== null) ? (a[key] !== undefined ? a[key] : (Array.isArray(a) ? a[0] : a)) : a;
        let valB = (typeof b === 'object' && b !== null) ? (b[key] !== undefined ? b[key] : (Array.isArray(b) ? b[0] : b)) : b;
        
        let orderA = undefined;
        let orderB = undefined;
        
        if (valA !== undefined && valA !== null) {
            let strA = valA.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            orderA = orderMap[valA.toString().toLowerCase().trim()];
            if (orderA === undefined) {
                for (let k in orderMap) {
                    if (k.replace(/[^a-z0-9]/g, '') === strA) {
                        orderA = orderMap[k];
                        break;
                    }
                }
            }
        }
        if (valB !== undefined && valB !== null) {
            let strB = valB.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            orderB = orderMap[valB.toString().toLowerCase().trim()];
            if (orderB === undefined) {
                for (let k in orderMap) {
                    if (k.replace(/[^a-z0-9]/g, '') === strB) {
                        orderB = orderMap[k];
                        break;
                    }
                }
            }
        }
        
        let cmp = 0;
        if (orderA !== undefined && orderB !== undefined) {
            cmp = orderA - orderB;
        } else if (orderA !== undefined) {
            cmp = -1;
        } else if (orderB !== undefined) {
            cmp = 1;
        } else {
            let strA = (valA || '').toString();
            let strB = (valB || '').toString();
            cmp = strA.localeCompare(strB);
        }
        return asc ? cmp : -cmp;
    });
    return accounts;
}
