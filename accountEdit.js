var empNameOption = "", selectedAccData = '', stakeHolder_data = [], growthDropDownJson = [], deliveryDropDownJson = [];
var account_head_pot = "", business_head_opt = "", delivery_head_opt = "", growth_member_opt = "", delivery_member_opt = "";
var removedTeamMemberName = '', addedTeamMemberName = '', removedDeliveryTeamMemberName = '', addedDeliveryTeamMemberName = '';

// --- LOADER FUNCTIONS ---
function showBuyingCenterLoader() {
  // Create overlay if it doesn't exist
  if (!$('#buying-center-overlay').length) {
    $('body').append(`
      <div id="buying-center-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #fd7e14;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
          "></div>
          <p style="
            margin: 0;
            color: #313265;
            font-family: poppins;
            font-size: 16px;
            font-weight: 500;
          ">Creating Buying Center...</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `);
  }
  $('#buying-center-overlay').show();
}

function hideBuyingCenterLoader() {
  $('#buying-center-overlay').hide();
}

document.addEventListener("DOMContentLoaded", function () {
  createTabsAccount();
  $('.acc_view').hide();
  $('.acc_edit').show();
  // $('.gj-datepicker').hide();
});


const AccountTabs = [
  {
    name: "Notes",
    content: `
        <div class="form-group">
          <div id="editor" style="height: 50px;"></div>
          <span class="warningMessage" id="charLimitWarning" style="display: none; color: red;">
            Maximum character limit of 150 reached!
          </span>
        </div>
      <div id="notesTabDiv">
        <!-- The dynamically inserted notes will appear here -->
      </div>
      `
  },
  {
    name: "Audit Logs",
    content: `
        <div class="audit-log">
          <ul id="audit-log-list" class="audit-list">
            <!-- List items will be dynamically added here -->
          </ul>
        </div>`,
  }
];
function getSowViewData() {
  const startTime = performance.now();
  let apiURL = apiValue.url.replace("/app", "/sow_input_drop_down");
  let empId = localStorage.getItem('EmpUserID');
  let emp_email = localStorage.getItem('email');
  let emp_dep = localStorage.getItem('Department');
  $.ajax({
    // url: "https://rre-api.factspanapps.com:5000/app",
    url: apiURL,
    type: "POST",

    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({
      query_type: "sow_input_drop_down",
      environment: apiValue.environment,
      emp_id: empId,
      mail_id: emp_email,
      department: emp_dep,
      flag: 'true'
    }),
    success: function (data) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      sowDropDownJson = data[0];
      // locationOpt = "", billingOpt = "", bill_us_default = 0, bill_ind_default = 0
      console.log("sowDropDownJson - ", sowDropDownJson);
      sowAccountOpt = sowDropDownJson.ACCOUNT_SOW;
      console.log("sowAccountOpt - ", sowAccountOpt);
      let growthLedOptHtml = "";

      $("#acc_growth_name_option").html(growthLedOptHtml);
      // $("#add_contact_factspan").append("<option value='-1'>Select Account Head</option>");
      $("#add_contact_account").append(
        "<option value='-1'>Select Account Head</option>"
      );
      $("#add_business_head").append(
        "<option value='-1'>Select Busniess Head</option>"
      );
      $("#add_delivery_head").append(
        "<option value='-1'>Select Delivery Head</option>"
      );
      $.each(sowDropDownJson.EMPLOYEE_DATA, function (i, empName) {
        empNameOption += `<option value="${empName.EMPLOYEE_ID}">${empName.EMPLOYEE_NAME}</option>`;
      });
      $.each(sowDropDownJson.ACCOUNT_HEADS, function (i, empName) {
        account_head_pot += `<option value="${empName.EMPLOYEE_ID}">${empName.EMPLOYEE_NAME}</option>`;
      });
      $.each(sowDropDownJson.BUSINESS_HEADS, function (i, empName) {
        business_head_opt += `<option value="${empName.EMPLOYEE_ID}">${empName.EMPLOYEE_NAME}</option>`;
      });
      $.each(sowDropDownJson.DELIVERY_HEADS, function (i, empName) {
        delivery_head_opt += `<option value="${empName.EMPLOYEE_ID}">${empName.EMPLOYEE_NAME}</option>`;
      });
      // $("#add_contact_factspan").append(empNameOption);
      $("#add_contact_account").append(account_head_pot);
      $("#add_business_head").append(business_head_opt);
      $("#add_delivery_head").append(delivery_head_opt);
      account_class_arr = sowDropDownJson.ACCOUNT_CLASS;
      acc_size_arr = sowDropDownJson.ACCOUNT_SIZE;
      acc_payment_arr = sowDropDownJson.PAYMENT_TERM;
      let defaultBillRate = sowDropDownJson.DEFAULT_BILLRATE;
      default_min_rate_us = defaultBillRate[0].US_BILLING_RATE;
      stakeHolder_data = sowDropDownJson.STAKEHOLDER_DETAILS;
      console.log('stakeHolder_data - ', stakeHolder_data)
      $("#min_bill_rate_uscan").val(default_min_rate_us);
      default_min_rate_ind = defaultBillRate[0].IND_BILLING_RATE;
      $("#min_bill_rate_ind").val(default_min_rate_ind);
      $("#billing_exp_div").hide();
      $("#account_size").empty();
      let acc_size_html = "";
      $("#account_size").append('<option value="-1">Select Size</option>');
      $.each(acc_size_arr, function (i, acc_size) {
        acc_size_html +=
          '<option value="' + acc_size + '">' + acc_size + "</option>";
      });
      $("#account_size").append(acc_size_html);
      console.log('acc_payment_arr - ', acc_payment_arr)
      let acc_pay_html = ""
      $("#payment_term").empty();
      $("#payment_term").append('<option value="-1">Select Payment Term</option>');
      $.each(acc_payment_arr, function (i, acc_pay) {
        acc_pay_html += '<option value="' + acc_pay + '">' + acc_pay + "</option>";
      });
      $("#payment_term").append(acc_pay_html);
      growthDropDownJson = sowDropDownJson.GROWTH_MEMBERS;
      let growthOption = "";
      $.each(growthDropDownJson, function (i, growth) {
        growthOption += `<option value="${growth.EMPLOYEE_ID}">${growth.EMPLOYEE_NAME}</option>`;
      })
      $("#growth_members").empty().append(growthOption);
      $("#growth_members").select2({
        placeholder: "Growth Members",
        allowClear: true,
        // width: '100px',
      });
      deliveryDropDownJson = sowDropDownJson.DELIVERY_MEMBERS;
      let deliveryOption = "";
      $.each(deliveryDropDownJson, function (i, delivery) {
        deliveryOption += `<option value="${delivery.EMPLOYEE_ID}">${delivery.EMPLOYEE_NAME}</option>`;
      })
      $("#delivery_members").empty().append(deliveryOption);
      $("#delivery_members").select2({
        placeholder: "Delivery Members",
        allowClear: true,
        // width: '100px',
      })
    },
    error: function (error) {
      const endTime = performance.now();
      const loadTimeInSeconds = (endTime - startTime) / 1000;
      getApiTime(loadTimeInSeconds, "SowCreate", "Revenue", "sow_input_drop_down", "error", fileName, "SowCreate", "view");
      console.log("message Error" + JSON.stringify(error));
    },
  });
}







function createTabsAccount() {
  const tabButtonsContainer = document.getElementById("tab-buttons-account");
  const tabContentContainer = document.getElementById("tab-content-container-account");

  if (!tabButtonsContainer || !tabContentContainer) {
    console.error("Tab containers not found!");
    return;
  }

  AccountTabs.forEach((tab, index) => {
    // Create tab button
    // const tabButton = document.createElement("button");
    // tabButton.className = "tab-button-account";
    // tabButton.textContent = tab.name;
    // tabButton.onclick = () => switchTabAccount(index);

    // tabButtonsContainer.appendChild(tabButton);

    // // Create tab content
    // const tabContent = document.createElement("div");
    // tabContent.className = "tab-content-account";
    // tabContent.innerHTML = tab.content;
    // tabContent.style.display = index === 0 ? "block" : "none"; // Show first tab initially

    // tabContentContainer.appendChild(tabContent);

    const tabButton = document.createElement("button");
    tabButton.className = "tab-button-account";
    tabButton.textContent = tab.name;
    tabButton.onclick = () => switchTabAccount(index);

    tabButtonsContainer.appendChild(tabButton);

    const tabContent = document.createElement("div");
    tabContent.className = "tab-content-account";
    tabContent.innerHTML = tab.content;
    tabContent.style.display = index === 0 ? "block" : "none"; // Show first tab initially

    if (tab.name === "Audit") {
      // Placeholder content for Audit tab
      const auditLogList = document.createElement("ul");
      auditLogList.id = "audit-log-list";
      auditLogList.className = "audit-list";
      tabContent.appendChild(auditLogList);
    } else {
      tabContent.innerHTML = tab.content;
    }

    tabContentContainer.appendChild(tabContent);
  });
  // Make the first tab active by default
  tabButtonsContainer.children[0].classList.add("active");
  tabContentContainer.children[0].style.display = "block"; // Show the first tab content
  // initializeQuill(); // Initialize Quill editor if needed
}

function switchTabAccount(index) {
  const tabButtons = document.querySelectorAll(".tab-button-account");
  const tabContents = document.querySelectorAll(".tab-content-account");
  const tabContentContainer = tabContents[index]; // Current tab content container

  // Activate the clicked tab and deactivate others
  tabButtons.forEach((button, i) => {
    button.classList.toggle("active", i === index); // Highlight the active tab
    tabContents[i].style.display = i === index ? "block" : "none"; // Show corresponding content

    // Add or remove custom class for the "Resource Details" tab
    // if (tabs[i].name === "Resource Details") {
    //   tabContents[i].classList.toggle("resource-active", i === index); // Apply class if active
    // }
  });


  tabContentContainer.style.height = "calc(100vh - 380px);"; // Default height for other tabs
  tabContentContainer.style.overflowY = "auto"; // Default overflow for other tabs
}

function initializeQuill(comments_notes) {
  console.log("comments_notes - ", comments_notes);
  $("#notesTabDiv").empty(); // Clear existing notes

  // Initialize Quill editor
  quill = new Quill("#editor", {
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
    },
    placeholder: "Add Note Here...",
    theme: "snow",
  });

  // Handle empty or undefined comments_notes
  if (!comments_notes || comments_notes.length === 0) {
    $("#text-div").text("Add your first comment");
    return; // Exit function
  }

  // Check for single comment with empty NOTES
  if (
    comments_notes.length === 1 &&
    (!comments_notes[0].NOTES || !comments_notes[0].NOTES.trim())
  ) {
    $("#text-div").text("Add your first comment");
    return; // Exit function as there's nothing to render
  }

  // Initialize HTML for comments
  let comments_data_html = "";

  // Loop through each comment
  comments_notes.forEach((note) => {
    // Skip empty NOTES for multiple comments
    if ((!note.NOTES || !note.NOTES.trim()) && comments_notes.length > 1) {
      return;
    }

    // Extract the first character of USER_NAME
    const nameParts = note.USER_NAME.split(" ");
    const notes_icon_text = nameParts
      .slice(0, 3) // Limit to the first three words
      .map(word => word.substring(0, 1)) // Extract the first character of each word
      .join(""); // Combine the characters

    // Format USER_NAME to show full first name and up to three characters of the last name
    const notes_name =
      nameParts[0] +
      " " +
      (nameParts[1] ? nameParts[1].substring(0, 3) + "..." : "");

    // Format CREATED_DATE to a human-readable format (assume convertStringToLocalTimeAndAgo exists)
    const commentedOn = convertStringToLocalTimeAndAgo(note.CREATED_DATE);

    // Use NOTES if available, otherwise a placeholder
    const notes_content = note.NOTES && note.NOTES.trim() ? note.NOTES : "No notes available";

    console.log("notes_content - ", notes_content);
    const maxChars = 2000;
    const charLimitWarning = document.getElementById("charLimitWarning");

    quill.on("text-change", function () {
      const text = quill.getText().trim();
      if (text.length > maxChars) {
        charLimitWarning.style.display = "inline";
        quill.deleteText(maxChars, text.length);
        // Toastify({
        //   text: "Character limit exceeded! Max 250 characters allowed.",
        //   duration: 3000, // Show for 3 seconds
        //   gravity: "top", // Position on top
        //   position: "center", // Centered horizontally
        //   backgroundColor: "red",
        //   stopOnFocus: true
        // }).showToast();
        toastr.options.timeOut = 2000; // 2s
        toastr.error("Character limit exceeded! Max 2000 characters allowed.");
      } else {
        charLimitWarning.style.display = "none";
      }
    });

    // Generate the dynamic HTML for each comment
    comments_data_html += `
      <div class='notes_div'>
        <div class='notes_icon_div'>
          <div class='notes_icon_text' data-fullname='${note.USER_NAME}'>${notes_icon_text}</div>
        </div>
        <div class='notes_body_div'>
          <div class='notes_content_div'>${notes_content}</div>
          <div class='notes_comments_div'>${commentedOn}</div>
        </div>
      </div>`;
  });

  // Append the generated HTML to the #notesTabDiv element
  $("#notesTabDiv").append(comments_data_html);
}



function updateAuditTab(auditMessages) {
  console.log('auditMessages - ', auditMessages);

  // Get the target element where the messages will be displayed
  const auditLogList = $('#audit-log-list');

  // Clear any existing content
  auditLogList.empty();

  // Check if auditMessages is empty
  if (!auditMessages || auditMessages.length === 0) {
    // Display a message saying "No audit messages found"
    auditLogList.html('<p style="text-align: center; font-weight: 500;color:#313265">No Audit Messages</p>');
    return; // Exit the function as there are no messages to process
  }

  // If there are messages, process and append them
  let listItem = '';

  auditMessages.forEach((message) => {
    // Extract only the first sentence of the message
    const onlyMessage = message.MESSAGE.split(".")[0] + ".";

    // Build the list item
    listItem += `<div class='audit-item-div'>
                    <i class="fa-solid fa-circle-dot"></i>
                    <span class="audit-item">
                        <strong>${onlyMessage}</strong>
                        <span class="audit-details">${message.EMPLOYEE_NAME}, ${convertStringToLocalTimeAndAgo(message.CREATED_DATE)}</span>
                    </span>
                </div>`;
  });

  // Append the messages to the target element
  auditLogList.append(listItem);
}


function cancelAccount() {
  setTimeout(function () {
    window.location.href = "accountDetails.html";
  }, 1000);
}

function updateAccountDataTemp() {
  console.log('Account Update')
  let d = new Date();
  let datestring =
    d.getFullYear() +
    "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + d.getDate()).slice(-2);
  let aad_account_name = $("#account_name_view").val();
  let add_location = $("#add_location option:selected").val();
  let add_contact_account = $("#add_contact_account option:selected").val();
  let add_contact_account_name = $("#add_contact_account option:selected").text();
  let add_business_head = $("#add_business_head option:selected").val();
  let add_business_head_name = $("#add_business_head option:selected").text();
  let add_delivery_head = $("#add_delivery_head option:selected").val();
  let add_delivery_head_name = $("#add_delivery_head option:selected").text();
  let stakeHolder = $("#add_nps_holder option:selected").val();
  let buyingCenter = $('#add_buying_center option:selected').val();
  let account_class = ""
  let account_size = $("#account_size option:selected").val();
  let ms_signed_date = $("#ms_signed_date").val();
  let payment_term = $("#payment_term option:selected").val();
  let min_bill_rate_uscan = $("#min_bill_rate_uscan").val();
  let min_bill_rate_ind = $("#min_bill_rate_ind").val();
  const notesText = quill.getText().trim(); // Get plain text
  const notesHTML = quill.root.innerHTML; // Get formatted content

  console.log("Notes text:", notesText);
  console.log("Notes HTML:", notesHTML);

  let enteredNotes = notesHTML.trim(); // Trim whitespace

  // Check for non-empty meaningful content (excluding empty HTML like <p><br></p>)
  if (enteredNotes.length === 0 || /^<p><br><\/p>$/.test(enteredNotes)) {
    enteredNotes = ""; // Set to empty string if content is meaningless
  }

  console.log("Entered Notes:", enteredNotes);

  console.log("Entered Notes:", enteredNotes);
  let notesObject = {
    NOTES: enteredNotes
  };
  console.log("notesObject", notesObject);

  // const quillText = quill.getText().trim();
  //   if (quillText.length > 0) {
  //     messages.push(`New Note has been added.`);

  //   }
  // console.log('quillText - ',quillText)

  if (aad_account_name == "") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Account Name should not be empty");
    return false;
  } else if (add_location == "-1") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Location should be selected");
    return false;
  } else if (add_contact_account == "-1") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Account head should be selected");
    return false;
  } else if (add_business_head == "-1") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Business head should be selected");
    return false;
  } else if (add_delivery_head == "-1") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Delivery head should be selected");
    return false;
  } else if (account_size == "-1") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Size should be selected");
    return false;
  } else if (buyingCenter == "") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Buying center should not be empty");
    return false;
  } else if (stakeHolder == "") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Stake holder should not be empty");
    return false;
  } else if (min_bill_rate_uscan == "") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Min Bill Rate - USCAN should not be empty");
    return false;
  } else if (min_bill_rate_ind == "") {
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Min Bill Rate - IND should not be empty");
    return false;
  }
  // else if (ms_signed_date == "") {
  //   toastr.options.timeOut = 3000; // 2s
  //   toastr.error("MSA Signed date should be selected");
  //   return false;
  // } else if (payment_term == "-1") {
  //   toastr.options.timeOut = 3000; // 2s
  //   toastr.error("Payment term should be selected");
  //   return false;
  // } 
  else {
    ms_signed_date = convertDate(ms_signed_date);
    let takeApprovalResponse = "No", approverName = ""
    let special_instr = $("#special_instr").val();


    // let auditMessages = '';

    let messages = [];

    // Check if we are in Edit mode (selectedAccData exists) or Create mode
    if (selectedAccData && selectedAccData.ACCOUNT_ID) {
      // --- UPDATE MODE: Log only changes ---

      if (aad_account_name !== selectedAccData.ACCOUNT_NAME) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'ACCOUNT_NAME',
          "MESSAGE": `Account name updated from ${selectedAccData.ACCOUNT_NAME} to ${aad_account_name}`
        });
      }

      if (add_location !== selectedAccData.LOCATION) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'LOCATION',
          "MESSAGE": `Location updated from ${selectedAccData.LOCATION} to ${add_location}`
        });
      }

      if (buyingCenter !== selectedAccData.BUYING_CENTRE) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'BUYING_CENTER',
          "MESSAGE": `Buying center updated from ${selectedAccData.BUYING_CENTRE} to ${buyingCenter}`
        });
      }

      if (stakeHolder !== selectedAccData.ACCOUNT_POINT_OF_CONTACT) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'ACCOUNT_POINT_OF_CONTACT',
          "MESSAGE": `Stakeholder updated from ${selectedAccData.ACCOUNT_POINT_OF_CONTACT} to ${stakeHolder}`
        });
      }

      if (add_business_head !== selectedAccData.BUSINESS_HEAD) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'BUSINESS_HEAD',
          "MESSAGE": `Business head updated from ${selectedAccData.BUSINESS_HEAD_NAME} to ${add_business_head_name}`
        });
      }

      if (add_delivery_head !== selectedAccData.DELIVERY_HEAD) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'DELIVERY_HEAD',
          "MESSAGE": `Delivery head updated from ${selectedAccData.DELIVERY_HEAD_NAME} to ${add_delivery_head_name}`
        });
      }

      if (add_contact_account !== selectedAccData.FACTSPAN_ACCOUNT_HEAD_ID) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'FACTSPAN_ACCOUNT_HEAD_ID',
          "MESSAGE": `Account head updated from ${selectedAccData.FACTSPAN_POC_NAME} to ${add_contact_account_name}`
        });
      }

      if (account_size !== selectedAccData.ACCOUNT_SIZE) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'ACCOUNT_SIZE',
          "MESSAGE": `Account Size updated from ${selectedAccData.ACCOUNT_SIZE} to ${account_size}`
        });
      }

      if (min_bill_rate_ind !== selectedAccData.BILLING_RATE_IND) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'BILLING_RATE',
          "MESSAGE": `India minimum billing rate updated from ${selectedAccData.BILLING_RATE_IND} to ${min_bill_rate_ind}`
        });
      }

      if (min_bill_rate_uscan !== selectedAccData.BILLING_RATE_US) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'BILLING_RATE',
          "MESSAGE": `US minimum billing rate updated from ${selectedAccData.BILLING_RATE_US} to ${min_bill_rate_uscan}`
        });
      }

      let oldMSADate = selectedAccData.MSA_SIGNED_DATE; // Assuming format matches or needs conversion depending on API
      // Note: ms_signed_date is coming from input, check format if needed. 
      // Assuming simple string comparison is enough or user will refine date logic if strictly needed.
      if (ms_signed_date !== "" && ms_signed_date !== "0000-00-00" && ms_signed_date !== oldMSADate) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'MSA_SIGNED_DATE',
          "MESSAGE": `MSA signed date updated from ${oldMSADate} to ${ms_signed_date}`
        });
      }

      if (payment_term != "-1" && payment_term !== selectedAccData.PAYMENT_TERM) {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'PAYMENT_TERM',
          "MESSAGE": `Payment term updated from ${selectedAccData.PAYMENT_TERM} to ${payment_term}`
        });
      }

    } else {
      // --- CREATE MODE: Log set values ---

      if (aad_account_name !== "") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'ACCOUNT_NAME',
          "MESSAGE": `Account name created as ${aad_account_name}`
        });
      }

      if (add_location !== "-1" && add_location !== "") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'LOCATION',
          "MESSAGE": `Location selected as ${add_location}`
        });
      }

      if (buyingCenter !== "") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'BUYING_CENTER',
          "MESSAGE": `Buying center selected as ${buyingCenter}`
        });
      }

      if (stakeHolder !== "") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'ACCOUNT_POINT_OF_CONTACT',
          "MESSAGE": `Stack holder selected as ${stakeHolder}`
        });
      }

      if (add_business_head !== "-1") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'BUSINESS_HEAD',
          "MESSAGE": `Business head assigned to ${add_business_head_name}`
        });
      }

      if (add_delivery_head !== "-1") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'DELIVERY_HEAD',
          "MESSAGE": `Delivery head assigned to ${add_delivery_head_name}`
        });
      }

      if (add_contact_account !== "-1") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'FACTSPAN_ACCOUNT_HEAD_ID',
          "MESSAGE": `Account head assigned to ${add_contact_account_name}`
        });
      }

      if (account_size !== "-1" && account_size !== "") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'ACCOUNT_SIZE',
          "MESSAGE": `Account Size selected as ${account_size}`
        });
      }

      if (min_bill_rate_ind !== "") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'BILLING_RATE',
          "MESSAGE": `India minimum billing rate set as ${min_bill_rate_ind}`
        });
      }

      if (min_bill_rate_uscan !== "") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'BILLING_RATE',
          "MESSAGE": `US minimum billing rate set as ${min_bill_rate_uscan}`
        });
      }

      if (ms_signed_date !== "" && ms_signed_date !== "0000-00-00") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'MSA_SIGNED_DATE',
          "MESSAGE": `MSA signed date selected as ${ms_signed_date}`
        });
      }

      if (payment_term != "-1") {
        messages.push({
          "ACTIVE_FLAG": "Y",
          "TYPE_OF": 'PAYMENT_TERM',
          "MESSAGE": `Payment term selected as ${payment_term}`
        });
      }
    }

    if (enteredNotes != '') {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'NOTES',
        "MESSAGE": `New Note has been added.`
      });
    }

    let approvalData =
      '{ "TAKE_APPROVAL" : "' +
      takeApprovalResponse +
      '", "APPROVER":"' +
      approverName +
      '"}';

    let billing_data =
      '[{"BILLING_RATE":"' +
      min_bill_rate_ind +
      '","LOCATION":"INDIA"},{"BILLING_RATE":"' +
      min_bill_rate_uscan +
      '","LOCATION":"US"}]';

    let accountData =
      '[{"ACCOUNT_NAME":"' +
      selectedAccData.ACCOUNT_NAME +
      '","LOCATION":"' +
      add_location +
      '","BUYING_CENTRE": "' +
      buyingCenter +
      '","ACCOUNT_POINT_OF_CONTACT": "' +
      stakeHolder +
      '","BUSINESS_HEAD": "' +
      add_business_head +
      '","ACCOUNT_CLASS": "' +
      account_class +
      '","ACCOUNT_SIZE": "' +
      account_size +
      '","BILLING_DATA":' +
      billing_data +
      ',"FACTSPAN_ACCOUNT_HEAD_ID": "' +
      add_contact_account +
      '","PAYMENT_TERM": "' +
      payment_term +
      '","DELIVERY_HEAD": "' +
      add_delivery_head +
      '","MSA_SIGNED_DATE": "' +
      ms_signed_date +
      '"}]';

    let accessDetails =
      '{ "ACCESS_LEVEL" : "' +
      accese_level +
      '", "Access":"' +
      accessData +
      '", "EDIT_ACCESS":"' +
      edit_access +
      '", "EMAIL_ID":"' +
      sessionName +
      '", "GROUP_NAME":"' +
      groupName +
      '", "USERNAME":"' +
      empName +
      '", "USER_ID":"' +
      empId +
      '"}';

    let senddata = JSON.stringify({
      query_type: "append_account_new_UI",
      environment: apiValue.environment,
      user_details: "[" + accessDetails + "]",
      approver_data: "[" + approvalData + "]",
      account_data: accountData,
      notes: "[" + JSON.stringify(notesObject) + "]",
      audit_data: JSON.stringify(messages),
    })

    console.log('senddata - ', senddata)
    let apiURL = apiValue.url.replace("/app", "/append_account");
    // $.ajax({
    //   url: apiURL,
    //   type: "POST",
    //   dataType: "json",
    //   crossDomain: true,
    //   format: "json",
    //   async: false,
    //   mode: "no-cors",
    //   data: senddata,
    //   success: function (data) {
    //     if (data.Message == "Success") {
    //       $("#addCreate").modal("hide");
    //       toastr.options.timeOut = 3000; // 2s
    //       toastr.success("Account Created Successfully");
    //       localStorage.setItem("account-back", "true");
    //       localStorage.setItem("created-account", aad_account_name);
    //       window.location.href = "sowCreate.html";
    //     } else {
    //       toastr.options.timeOut = 3000; // 2s
    //       toastr.success(data.Message);
    //     }
    //   },
    //   error: function (error) {
    //     console.log("message Error" + JSON.stringify(error));
    //   },
    // });
  }
}

function removeDuplicatesfromArray(arr) {
  return arr.filter((item,
    index) => arr.indexOf(item) === index);
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

const getTeamJsonData = (teamList, opr) => {
  let emplist = [], selTeamData = [], status = ""
  $.each(teamList, function (j, selEmp) {
    emplist = growthDropDownJson.filter((emp) => {
      return emp.EMPLOYEE_ID == selEmp
    })
    emplist = emplist[0]
    selTeamData.push(emplist)
  })
  let empDetails = "";
  if (opr == "remove") {
    status = "N"
  } else {
    status = "Y"
  }
  $.each(selTeamData, function (k, emp) {
    if (emp == undefined) {
      empDetails = ""
    } else {
      if (opr == "remove") {
        removedTeamMemberName += emp.EMPLOYEE_NAME + ", "
      } else {
        addedTeamMemberName += emp.EMPLOYEE_NAME + ", "
      }
      empDetails +=
        '{ "GROWTH_EMP_ID" : "' +
        emp.EMPLOYEE_ID +
        '", "GROWTH_EMP_NAME":"' +
        emp.EMPLOYEE_NAME +
        '", "ACTIVE_FLAG":"' +
        status +
        '"},';
    }
  })
  empDetails = removeComma(empDetails)
  return empDetails;
}

const getDeliveryTeamJsonData = (teamList, opr) => {
  let emplist = [], selTeamData = [], status = ""
  $.each(teamList, function (j, selEmp) {
    emplist = deliveryDropDownJson.filter((emp) => {
      return emp.EMPLOYEE_ID == selEmp
    })
    emplist = emplist[0]
    selTeamData.push(emplist)
  })
  let empDetails = "";
  if (opr == "remove") {
    status = "N"
  } else {
    status = "Y"
  }
  $.each(selTeamData, function (k, emp) {
    if (emp == undefined) {
      empDetails = ""
    } else {
      if (opr == "remove") {
        removedDeliveryTeamMemberName += emp.EMPLOYEE_NAME + ", "
      } else {
        addedDeliveryTeamMemberName += emp.EMPLOYEE_NAME + ", "
      }
      empDetails +=
        '{ "DELIVERY_EMP_ID" : "' +
        emp.EMPLOYEE_ID +
        '", "DELIVERY_EMP_NAME":"' +
        emp.EMPLOYEE_NAME +
        '", "ACTIVE_FLAG":"' +
        status +
        '"},';
    }
  })
  empDetails = removeComma(empDetails)
  return empDetails;
}

function convertDate(date) {
  let finalDate = "";
  if (date != undefined) {
    let newDate = date.split("-");
    let mm = newDate[0];
    let dd = newDate[1];
    let yy = newDate[2];
    yy = "20" + yy;
    finalDate = yy + "-" + mm + "-" + dd;
  }

  return finalDate;
}

function removeDuplicates(names) {
  // Split the names into an array, filter out empty spaces, and then remove duplicates
  return [...new Set(names.split(',').map(name => name.trim()).filter(name => name))].join(', ');
}
function updateAccountData() {
  let accountAllData = selectedAccData;
  console.log("accountAllData", accountAllData);
  let account_id = selectedAccData.ACCOUNT_ID;
  let accName = escapeHtml(selectedAccData.ACCOUNT_NAME);
  // let className = $(obj).attr("data-id2");

  let takeApprovalResponse = "No";
  let updated_msa = $("#ms_signed_date").val();
  let updated_loc = $("#add_location option:selected").val();
  let updated_payment = $("#payment_term option:selected").val();
  let updated_stake = $("#add_nps_holder option:selected").val();
  let buying_center = $('#add_buying_center option:selected').val();
  let updated_account_head = $("#add_contact_account option:selected").val();
  let updated_account_head_text = $("#add_contact_account option:selected").text();
  let updated_business_head = $("#add_business_head option:selected").val();
  let updated_business_head_text = $("#add_business_head option:selected").text();
  let updated_delivery_head = $("#add_delivery_head option:selected").val();
  let updated_delivery_head_text = $("#add_delivery_head option:selected").text();
  let updated_growth_head = $("#growth_members").val();
  let updated_growth_head_data = $("#growth_members").select2('data')
  let updated_growth_head_text = ''
  let updated_delivery_member = $("#delivery_members").val();
  let updated_delivery_member_data = $("#delivery_members").select2('data')
  let updated_delivery_member_text = ''
  let team_old_list = [], delivery_team_old_list = [];
  $.each(accountAllData.EMPLOYEE_DATA, function (l, oldTeam) {
    if (oldTeam.GROWTH_EMP_ID != "") {
      team_old_list.push(oldTeam.GROWTH_EMP_ID)
    }
  })
  $.each(updated_growth_head_data, function (l, newTeam) {
    updated_growth_head_text += newTeam.text + ","
  })
  updated_growth_head_text = removeComma(updated_growth_head_text)
  updated_growth_head = removeDuplicatesfromArray(updated_growth_head)
  let removedTeamMember = $(team_old_list).not(updated_growth_head).get();
  let addedTeamMember = $(updated_growth_head).not(team_old_list).get();
  let removedTeamJson = getTeamJsonData(removedTeamMember, "remove")
  let addedTeamJson = getTeamJsonData(addedTeamMember, "update")
  $.each(accountAllData.DELIVERY_EMPLOYEE_DATA, function (l, oldTeam) {
    if (oldTeam.DELIVERY_EMP_ID != "") {
      delivery_team_old_list.push(oldTeam.DELIVERY_EMP_ID)
    }
  })
  $.each(updated_delivery_member_data, function (l, newTeam) {
    updated_delivery_member_text += newTeam.text + ","
  })
  updated_delivery_member_text = removeComma(updated_delivery_member_text)
  updated_delivery_member = removeDuplicatesfromArray(updated_delivery_member)
  let removedDeliveryMember = $(delivery_team_old_list).not(updated_delivery_member).get();
  let addedDeliveryMember = $(updated_delivery_member).not(delivery_team_old_list).get();
  let removedDeliveryJson = getDeliveryTeamJsonData(removedDeliveryMember, "remove")
  let addedDeliveryJson = getDeliveryTeamJsonData(addedDeliveryMember, "update")
  const notesText = quill.getText().trim(); // Get plain text
  const notesHTML = quill.root.innerHTML; // Get formatted content
  // console.log("removedDeliveryMemberName - ",removedDeliveryMemberName)
  // console.log("addedDeliveryMemberName - ",addedDeliveryMemberName)

  console.log("Notes text:", notesText);
  console.log("Notes HTML:", notesHTML);

  let enteredNotes = notesHTML.trim(); // Trim whitespace

  // Check for non-empty meaningful content (excluding empty HTML like <p><br></p>)
  if (enteredNotes.length === 0 || /^<p><br><\/p>$/.test(enteredNotes)) {
    enteredNotes = ""; // Set to empty string if content is meaningless
  }

  console.log("Entered Notes:", enteredNotes);

  console.log("Entered Notes:", enteredNotes);
  let notesObject = {
    NOTES: enteredNotes
  };
  console.log("notesObject", notesObject);
  let growthTeamDataJson = ""
  if (removedTeamJson != "" && addedTeamJson != "") {
    growthTeamDataJson = removedTeamJson + "," + addedTeamJson
  } else if (removedTeamJson != "") {
    growthTeamDataJson = removedTeamJson
  } else if (addedTeamJson != "") {
    growthTeamDataJson = addedTeamJson
  }
  let growthDeliveryDataJson = ""
  if (removedDeliveryJson != "" && addedDeliveryJson != "") {
    growthDeliveryDataJson = removedDeliveryJson + "," + addedDeliveryJson
  } else if (removedDeliveryJson != "") {
    growthDeliveryDataJson = removedDeliveryJson
  } else if (addedDeliveryJson != "") {
    growthDeliveryDataJson = addedDeliveryJson
  }
  let only_growth_status = 'No'
  let messages = []
  let updated_size = $("#account_size option:selected").val();
  let updated_min_us = $("#min_bill_rate_uscan").val();
  let updated_min_ind = $("#min_bill_rate_ind").val();
  if (updated_loc == "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select Location");
    return false;
  } else if (buying_center == "-1" || buying_center == "" || buying_center == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select buying center");
    return false;
  } else if (updated_stake == "-1" || updated_stake == "" || updated_stake == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please Select NPS stake holder");
    return false;
  } else if (updated_account_head == "-1" || updated_account_head == "" || updated_account_head == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select account head");
    return false;
  } else if (updated_business_head == "-1" || updated_business_head == "" || updated_business_head == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select business head");
    return false;
  } else if (updated_delivery_head == "-1" || updated_delivery_head == "" || updated_delivery_head == undefined) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select delivery head");
    return false;
  } else if (updated_size == "-1") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please select account size");
    return false;
  } else if (enteredNotes == "") {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please add a note for the account");
    return false;
  } else {
    let checkChanges = false;
    if (updated_min_ind != accountAllData.BILLING_RATE_IND) {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'BILLING_RATE',
        "MESSAGE": `India minimum billing rate updated from ${accountAllData.BILLING_RATE_IND} to ${updated_min_ind}`
      });
      checkChanges = true;
    }

    if (updated_min_us != accountAllData.BILLING_RATE_US) {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'BILLING_RATE',
        "MESSAGE": `US minimum billing rate updated from ${accountAllData.BILLING_RATE_US} to ${updated_min_us}`
      });
      checkChanges = true;
    }

    if (updated_loc != accountAllData.LOCATION) {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'LOCATION',
        "MESSAGE": `Location updated from ${accountAllData.LOCATION} to ${updated_loc}`
      });
      checkChanges = true;
    }

    if (updated_stake != accountAllData.ACCOUNT_POINT_OF_CONTACT) {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'ACCOUNT_POINT_OF_CONTACT',
        "MESSAGE": `Stakeholder updated from ${accountAllData.ACCOUNT_POINT_OF_CONTACT} to ${updated_stake}`
      });
      checkChanges = true;
    }

    if (buying_center != accountAllData.BUYING_CENTRE) {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'BUYING_CENTRE',
        "MESSAGE": `${accountAllData.BUYING_CENTRE == '' ? `Buying center set as ${buying_center}` : `Buying center updated from ${accountAllData.BUYING_CENTRE} to ${buying_center}`}`
      });
      checkChanges = true;
    }

    if (updated_business_head != accountAllData.BUSINESS_HEAD) {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'BUSINESS_HEAD',
        "MESSAGE": `Business head updated from ${accountAllData.BUSINESS_HEAD_NAME} to ${updated_business_head_text}`
      });
      checkChanges = true;
    }

    if (updated_size != accountAllData.ACCOUNT_SIZE) {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'ACCOUNT_SIZE',
        "MESSAGE": `Account size updated from ${accountAllData.ACCOUNT_SIZE} to ${updated_size}`
      });
      checkChanges = true;
    }

    if (updated_account_head != accountAllData.FACTSPAN_ACCOUNT_HEAD_ID) {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'FACTSPAN_ACCOUNT_HEAD_ID',
        "MESSAGE": `Account head updated from ${accountAllData.FACTSPAN_POC_NAME} to ${updated_account_head_text}`
      });
      checkChanges = true;
    }

    if (updated_payment != accountAllData.PAYMENT_TERM) {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'PAYMENT_TERM',
        "MESSAGE": `Payment term updated from ${accountAllData.PAYMENT_TERM == '-1' ? '-' : accountAllData.PAYMENT_TERM} to ${updated_payment}`
      });
      checkChanges = true;
    }
    console.log('updated_msa - ', updated_msa)
    let ms_signed_date = updated_msa == '' ? '' : convertDate(updated_msa)
    console.log('ms_signed_date - ', ms_signed_date)
    let oldMSADate = accountAllData.MSA_SIGNED_DATE;
    console.log('oldMSADate - ', oldMSADate)
    if (ms_signed_date !== "" && ms_signed_date !== "0000-00-00" && ms_signed_date !== oldMSADate) {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'MSA_SIGNED_DATE',
        "MESSAGE": `MSA signed date updated from ${accountAllData.MSA_SIGNED_DATE == '' ? '-' : accountAllData.MSA_SIGNED_DATE} to ${convertDate(updated_msa)}`
      });
      checkChanges = true;
    }

    if (updated_delivery_head != accountAllData.DELIVERY_HEAD) {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'DELIVERY_HEAD',
        "MESSAGE": `Delivery head updated from ${accountAllData.DELIVERY_HEAD_NAME} to ${updated_delivery_head_text}`
      });
      checkChanges = true;
    }

    if (enteredNotes != '') {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'NOTES',
        "MESSAGE": `New Note has been added.`
      });
      checkChanges = true;
    }
    let growthTeamMessage = '';
    console.log("removedTeamMemberName - ", removedTeamMemberName);
    console.log("addedTeamMemberName - ", addedTeamMemberName);
    removedTeamMemberName = removeDuplicates(removedTeamMemberName);
    addedTeamMemberName = removeDuplicates(addedTeamMemberName);

    if (removedTeamMemberName !== '') {
      growthTeamMessage += `Growth team members removed: ${removedTeamMemberName}; `;
    }

    if (addedTeamMemberName !== '') {
      growthTeamMessage += `Growth team members added: ${addedTeamMemberName}`;
    }

    if (growthTeamMessage !== '') {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'GROWTH_TEAM',
        "MESSAGE": growthTeamMessage.trim()
      });
    }
    let growthDeliveryMessage = '';
    console.log("removedTeamMemberName - ", removedDeliveryTeamMemberName);
    console.log("addedTeamMemberName - ", addedDeliveryTeamMemberName);
    removedDeliveryTeamMemberName = removeDuplicates(removedDeliveryTeamMemberName);
    addedDeliveryTeamMemberName = removeDuplicates(addedDeliveryTeamMemberName);

    if (removedDeliveryTeamMemberName !== '') {
      growthDeliveryMessage += `Delivery members removed: ${removedDeliveryTeamMemberName}; `;
    }

    if (addedDeliveryTeamMemberName !== '') {
      growthDeliveryMessage += `Delivery members added: ${addedDeliveryTeamMemberName}`;
    }

    if (growthDeliveryMessage !== '') {
      messages.push({
        "ACTIVE_FLAG": "Y",
        "TYPE_OF": 'DELIVERY_MEMBERS',
        "MESSAGE": growthDeliveryMessage.trim()
      });
    }

    if (growthTeamDataJson != "") {
      console.log('growthTeamDataJson - ', growthTeamDataJson)
      if (checkChanges) {
        only_growth_status = 'No';
      } else {
        only_growth_status = 'Yes';
      }
      checkChanges = true;
    }
    if (removedDeliveryJson != "") {
      checkChanges = true;
    }

    if (checkChanges) {
      let accessDetails =
        '{ "ACCESS_LEVEL" : "' +
        accese_level +
        '", "Access":"' +
        accessData +
        '", "EDIT_ACCESS":"' +
        edit_access +
        '", "EMAIL_ID":"' +
        sessionName +
        '", "GROUP_NAME":"' +
        groupName +
        '", "USERNAME":"' +
        empName +
        '", "USER_ID":"' +
        empId +
        '"}';
      let billing_updated_array =
        '{ "BILLING_RATE" : "' +
        updated_min_ind +
        '", "LOCATION":"India"},{ "BILLING_RATE" : "' +
        updated_min_us +
        '", "LOCATION":"US"}';
      let acc_update_data =
        '{ "ACCOUNT_NAME" : "' +
        selectedAccData.ACCOUNT_NAME +
        '", "ACCOUNT_ID":"' +
        account_id +
        '", "LOCATION":"' +
        updated_loc +
        '", "ACCOUNT_POINT_OF_CONTACT":"' +
        updated_stake +
        '","BUYING_CENTRE": "' +
        buying_center +
        '", "BUSINESS_HEAD":"' +
        updated_business_head +
        '", "ACCOUNT_SIZE":"' +
        updated_size +
        '", "BILLING_DATA":[' +
        billing_updated_array +
        '], "FACTSPAN_ACCOUNT_HEAD_ID":"' +
        updated_account_head +
        '", "PAYMENT_TERM":"' +
        updated_payment +
        '", "MSA_SIGNED_DATE":"' +
        convertDate(updated_msa) +
        '", "DELIVERY_HEAD":"' +
        updated_delivery_head +
        '", "FACTSPAN_POC_NAME":"' +
        updated_account_head_text +
        '", "BUSINESS_HEAD_NAME":"' +
        updated_business_head_text +
        '", "DELIVERY_HEAD_NAME":"' +
        updated_delivery_head_text +
        '"}';
      let billing_old_array =
        '{ "BILLING_RATE" : "' +
        accountAllData.BILLING_RATE_IND +
        '", "LOCATION":"India"},{ "BILLING_RATE" : "' +
        accountAllData.BILLING_RATE_US +
        '", "LOCATION":"US"}';
      let acc_old_data =
        '{ "ACCOUNT_NAME" : "' +
        accountAllData.ACCOUNT_NAME +
        '", "ACCOUNT_ID":"' +
        accountAllData.ACCOUNT_ID +
        '", "LOCATION":"' +
        accountAllData.LOCATION +
        '", "ACCOUNT_POINT_OF_CONTACT":"' +
        accountAllData.ACCOUNT_POINT_OF_CONTACT +
        '","BUYING_CENTRE": "' +
        accountAllData.BUYING_CENTRE +
        '", "BUSINESS_HEAD":"' +
        accountAllData.BUSINESS_HEAD +
        '", "ACCOUNT_SIZE":"' +
        accountAllData.ACCOUNT_SIZE +
        '", "BILLING_DATA":[' +
        billing_old_array +
        '], "FACTSPAN_ACCOUNT_HEAD_ID":"' +
        accountAllData.FACTSPAN_ACCOUNT_HEAD_ID +
        '", "PAYMENT_TERM":"' +
        accountAllData.PAYMENT_TERM +
        '", "MSA_SIGNED_DATE":"' +
        accountAllData.MSA_SIGNED_DATE +
        '", "DELIVERY_HEAD":"' +
        accountAllData.DELIVERY_HEAD +
        '", "FACTSPAN_POC_NAME":"' +
        accountAllData.FACTSPAN_POC_NAME +
        '", "BUSINESS_HEAD_NAME":"' +
        accountAllData.BUSINESS_HEAD_NAME +
        '", "DELIVERY_HEAD_NAME":"' +
        accountAllData.DELIVERY_HEAD_NAME +
        '"}';
      approverName = "Business head";
      let approvalData =
        '{ "TAKE_APPROVAL" : "' +
        takeApprovalResponse +
        '", "APPROVER":"' +
        approverName +
        '"}';

      let accUpdatedJsonData = {
        query_type: "edit_account",
        environment: apiValue.environment,
        user_details: "[" + accessDetails + "]",
        approver_data: "[" + approvalData + "]",
        access_data: "[" + growthTeamDataJson + "]",
        account_data: "[" + acc_update_data + "]",
        account_data_old: "[" + acc_old_data + "]",
        only_growth: only_growth_status,
        delivery_access_data: "[" + growthDeliveryDataJson + "]",
        notes: "[" + JSON.stringify(notesObject) + "]",
        audit_data: JSON.stringify(messages),
      };
      console.log("accUpdatedJsonData - ", accUpdatedJsonData);
      let apiURL = apiValue.url.replace("/app", "/edit_account");
      const startTime = performance.now();
      $("#updateAccountData").prop("disabled", true);
      $("#cancelAccount").prop("disabled", true);
      $.ajax({
        url: apiURL,
        type: "POST",

        dataType: "json",
        crossDomain: true,
        format: "json",
        data: JSON.stringify(accUpdatedJsonData),
        success: function (json) {
          if (json.Message == "Success") {
            toastr.options.timeOut = 2000; // 2s
            toastr.success(json.Response);
            setTimeout(function () {
              window.location.reload();
              // window.location.href = "accountDetails.html";
            }, 2000);

          } else {
            toastr.options.timeOut = 2000; // 2s
            toastr.error(json.Response);
            $("#updateAccountData").prop("disabled", false);
            $("#cancelAccount").prop("disabled", false);
          }
        },
        error: function (error) {
          $("#" + className).prop("disabled", false);
          const endTime = performance.now();
          const loadTimeInSeconds = (endTime - startTime) / 1000;
          getApiTime(
            loadTimeInSeconds,
            "account",
            "Revenue",
            "edit_account",
            "error",
            fileName,
            "RevenuePage",
            "edit"
          );
          console.log("message Error" + JSON.stringify(error));
          toastr.options.timeOut = 2000; // 2s
          toastr.error("Message error" + JSON.stringify(error));
          $("#updateAccountData").prop("disabled", false);
          $("#cancelAccount").prop("disabled", false);
          // $("#sow_edit").show();
        },
      });
    }
    // $("." + className + "_show").show();
    // $("." + className + "_edit").hide();
  }
}

const removeComma = (removeCommaText) => {
  if (removeCommaText.endsWith(",")) {
    removeCommaText = removeCommaText.slice(0, -1);
  }
  return removeCommaText;
}
let BuyingCenter = '', NPSName = '';

function AccountDataView() {
  let selectedAccID = localStorage.getItem('selectAccData')
  console.log('selectedAccData - ', selectedAccID)
  let empId = localStorage.getItem('EmpUserID');
  let emp_email = localStorage.getItem('email');
  let emp_dep = localStorage.getItem('Department');
  let apiURL = apiValue.url.replace("/app", "/view_all_account");
  $.ajax({
    // url: "https://rre-api.factspanapps.com:5000/app",
    url: apiURL,
    type: "POST",

    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({
      query_type: "view_all_account",
      environment: apiValue.environment,
      emp_id: empId,
      mail_id: emp_email,
      department: emp_dep,
      account_id: selectedAccID
    }),
    success: function (data) {
      console.log('data - ', data)
      selectedAccData = data[0]
      console.log('selectedAccData - ', selectedAccData)
      $("#account_name_view").empty();
      $("#account_name_view").append(selectedAccData.ACCOUNT_NAME)
      $('#add_location').val(selectedAccData.LOCATION)
      $('#add_contact_account').val(selectedAccData.FACTSPAN_ACCOUNT_HEAD_ID)
      console.log('selectedAccData.FACTSPAN_ACCOUNT_HEAD_ID - ', selectedAccData.FACTSPAN_ACCOUNT_HEAD_ID)
      $('#add_business_head').val(selectedAccData.BUSINESS_HEAD)
      $('#add_delivery_head').val(selectedAccData.DELIVERY_HEAD)
      $('#account_size').val(selectedAccData.ACCOUNT_SIZE)
      $('#min_bill_rate_uscan').val(selectedAccData.BILLING_RATE_US)
      $('#min_bill_rate_ind').val(selectedAccData.BILLING_RATE_IND)
      $('#ms_signed_date').val(selectedAccData.MSA_SIGNED_DATE === "" ? "" : convert(selectedAccData.MSA_SIGNED_DATE))
      $('#payment_term').val(selectedAccData.PAYMENT_TERM)
      let teamIdList = [], deliveryIdList = [];
      let accessRoleData = selectedAccData.EMPLOYEE_DATA
      $.each(accessRoleData, function (j, teamRole) {
        if (teamRole.GROWTH_EMP_NAME != "") {
          teamIdList.push(teamRole.GROWTH_EMP_ID)
        }
      });
      // console.log('teamIdList - ',teamIdList)
      if (teamIdList && teamIdList.length > 0) {
        $("#growth_members").val(teamIdList).trigger('change'); // Apply the value if available
      } else {
        $("#growth_members").val(null).trigger('change'); // Ensure placeholder displays if no value is set
      }
      BuyingCenter = selectedAccData.BUYING_CENTRE
      NPSName = selectedAccData.ACCOUNT_POINT_OF_CONTACT

      // Call API to get buying centers
      let apiURL = apiValue.url.replace("/app", "/get_buying_centers");
      $.ajax({
        url: apiURL,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        format: "json",
        async: false,
        mode: "no-cors",
        data: JSON.stringify({
          account_id: selectedAccData.ACCOUNT_ID
        }),
        success: function (data) {
          let response = data.stakeholder_details || [];
          console.log('Buying centers API response - ', response);
          populateBuyingCenters(response, selectedAccData.ACCOUNT_ID, BuyingCenter, NPSName);
        },
        error: function (error) {
          console.log("Error fetching buying centers: " + JSON.stringify(error));
          // Fallback to empty data if API fails
          populateBuyingCenters([], selectedAccData.ACCOUNT_ID, BuyingCenter, NPSName);
        },
      });
      let deliveryEmployeeDataList = selectedAccData.DELIVERY_EMPLOYEE_DATA
      $.each(deliveryEmployeeDataList, function (j, deliveryEmp) {
        if (deliveryEmp.DELIVERY_EMP_NAME != "") {
          deliveryIdList.push(deliveryEmp.DELIVERY_EMP_ID)
        }
      });
      // console.log('deliveryIdList - ',deliveryIdList)
      if (deliveryIdList && deliveryIdList.length > 0) {
        $("#delivery_members").val(deliveryIdList).trigger('change'); // Apply the value if available
      } else {
        $("#delivery_members").val(null).trigger('change'); // Ensure placeholder displays if no value is set
      }
      // /delivery_members
      updateAuditTab(selectedAccData.AUDIT_DATA)
      initializeQuill(selectedAccData.NOTES_DATA)
    },
    error: function (error) {
      console.log("message Error" + JSON.stringify(error));
    },
  });

}

function convert(str) {
  if (str == null) {
    return "";
  } else if (str == "0000-00-00") {
    return "";
  } else {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear().toString().substr(2, 2)].join("-");
  }
}


function saveBuyingCenter() {
  const userDetails = {
    EMAIL_ID: sessionName,
    USERNAME: empName,
    USER_ID: empId,
  };

  const buyingCenterName = $("#new_buying_center_name").val().trim();
  const npsName = $("#new_nps_name").val().trim();

  if (!buyingCenterName) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please enter Buying Center");
    return;
  } else if (!npsName) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please enter NPS Stakeholder");
    return;
  }

  const stakeholderDetails = [
    {
      ACCOUNT_ID: selectedAccData.ACCOUNT_ID,
      BUYING_CENTRE: buyingCenterName,
      STAKEHOLDER: npsName,
    },
  ];

  const payload = {
    user_details: JSON.stringify([userDetails]),
    stakeholder_details: stakeholderDetails,
  };

  const apiURL = apiValue.url.replace("/app", "/stakeholders");

  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(payload),
    success: function (data) {
      console.log("Buying Center Saved Successfully: ", data);
      toastr.options.timeOut = 2000; // 2s
      toastr.success("Buying Center and Stakeholder saved successfully!");

      // Update global variables
      stakeHolder_data = data.Data;
      BuyingCenter = buyingCenterName;
      NPSName = npsName;

      // Refresh data from new API and auto-select newly created items
      refreshBuyingCenterDropdownInternal(buyingCenterName, npsName);

      // Close the popup
      $("#popup").fadeOut(200);
      $("#popup_nps").fadeOut(200);
      $("#overlay").removeClass("overlay");
    },
    error: function (error) {
      console.log("Error Saving Buying Center: ", error);
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Failed to save Buying Center and Stakeholder.");
    },
  });
}

function saveNpsStakeholder() {
  const userDetails = {
    EMAIL_ID: sessionName,
    USERNAME: empName,
    USER_ID: empId,
  };
  let selcenterName = $('#add_buying_center option:selected').val()
  console.log('selcenterName - ', selcenterName)
  $('#already_buying_center').empty().append(selcenterName)
  const npsName = $("#only_new_nps_name").val().trim();

  if (!npsName) {
    toastr.options.timeOut = 2000; // 2s
    toastr.error("Please enter NPS Stakeholder");
    return;
  }

  const stakeholderDetails = [
    {
      ACCOUNT_ID: selectedAccData.ACCOUNT_ID,
      BUYING_CENTRE: selcenterName,
      STAKEHOLDER: npsName,
    },
  ];

  const payload = {
    user_details: JSON.stringify([userDetails]),
    stakeholder_details: stakeholderDetails,
  };

  const API_URL = apiValue.url.replace("/app", "/stakeholders");

  $.ajax({
    url: API_URL,
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(payload),
    success: function (data) {
      console.log("NPS Stakeholder Saved Successfully: ", data);
      toastr.options.timeOut = 2000; // 2s
      toastr.success("NPS Stakeholder saved successfully!");

      // Update global variables
      stakeHolder_data = data.Data;
      NPSName = npsName;
      BuyingCenter = selcenterName;

      // Refresh data from new API and auto-select newly created items
      refreshBuyingCenterDropdownInternal(selcenterName, npsName);

      // Close the popup
      $("#popup_nps").fadeOut(200);
      $("#overlay").removeClass("overlay");
    },
    error: function (error) {
      console.log("Error Saving NPS Stakeholder: ", error);
      toastr.options.timeOut = 2000; // 2s
      toastr.error("Failed to save NPS Stakeholder.");
    },
  });
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

function createBuyingNpsData() {
  let accessDetails =
    '{ "ACCESS_LEVEL" : "' +
    accese_level +
    '", "Access":"' +
    accessData +
    '", "EDIT_ACCESS":"' +
    edit_access +
    '", "EMAIL_ID":"' +
    sessionName +
    '", "GROUP_NAME":"' +
    groupName +
    '", "USERNAME":"' +
    empName +
    '", "USER_ID":"' +
    empId +
    '"}';

  let senddata = JSON.stringify({
    user_details: "[" + accessDetails + "]",
    stakeholder_details: "[" + + "]",
  })
  let apiURL = apiValue.url.replace("/app", "/stakeholders");
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: senddata,
    success: function (data) {
      console.log('buying center - ', data)
    },
    error: function (error) {
      console.log("message Error" + JSON.stringify(error));
    },
  });
}

function showPopup() {
  $('#new_buying_center_name').val('');
  $('#new_nps_name').val('');
  $('#only_new_nps_name').val('');
  $("#popup").fadeIn(200);
  $("#overlay").addClass("overlay");
}

function populateBuyingCenters(buyingCenterData, accountId, selectedBuyingCenter, npsSelected) {
  console.log('buyingCenterData - ', buyingCenterData, 'Account ID - ', accountId, 'selectedBuyingCenter - ', selectedBuyingCenter);

  // Reference to the select elements
  const $buyingCenterDropdown = $("#add_buying_center");
  const $npsDropdown = $("#add_nps_holder");

  // Clear existing options and reset the select dropdown
  $buyingCenterDropdown.empty();

  // Filter Buying Centers for the selected account
  const filteredCenters = buyingCenterData.filter(center => center.ACCOUNT_ID === accountId);

  let buyingCenterOptions = ``;

  if (filteredCenters.length === 0) {
    // If no buying centers are found, add the create option and disable NPS
    buyingCenterOptions += `<option value="-1">Select Buying Center</option>
    <option value="new_buying_create" class="option_create_text">+ Add Buying Center</option>`;
    $buyingCenterDropdown.append(buyingCenterOptions).trigger('change'); // Ensure Select2 updates
    $npsDropdown.attr("disabled", true);
    return; // Exit the function early
  }

  // Populate the Buying Center dropdown
  const buyingArr = filteredCenters[0].DETAILS;
  buyingArr.forEach((center) => {
    buyingCenterOptions += `<option value="${center.BC_ID || center.BUYING_CENTRE}">${center.BUYING_CENTRE}</option>`;
  });

  buyingCenterOptions += `<option value="new_buying_create" class="option_create_text">+ Add Buying Center</option>`;
  $buyingCenterDropdown.append(buyingCenterOptions);

  // Set the selected Buying Center or default to "-1"
  $buyingCenterDropdown.val(selectedBuyingCenter || "-1").trigger('change');

  // Enable NPS dropdown and populate options
  $npsDropdown.attr("disabled", false);
  populateNpsDropdown(buyingArr, selectedBuyingCenter, npsSelected);

  // Add event listener to update NPS dropdown when the Buying Center changes
  $buyingCenterDropdown.off("change").on("change", function () {
    const newSelectedBuyingCenter = $(this).val();
    populateNpsDropdown(buyingArr, newSelectedBuyingCenter, null); // Clear NPS selection on Buying Center change
  });
}


function populateNpsDropdown(npsData, selBuyCenter, npsSelected) {
  console.log("selBuyCenter - ", selBuyCenter);
  console.log("npsData - ", npsData);
  console.log("npsSelected - ", npsSelected);

  // Reference the NPS dropdown
  const $npsDropdown = $("#add_nps_holder");

  // Clear existing options
  $npsDropdown.empty();

  let npsOptions = ``;
  let isOptionFound = false;

  // Populate the NPS dropdown based on the selected Buying Center
  if (selBuyCenter && selBuyCenter !== "-1") {
    const npsFilterArr = npsData.filter(nps => (nps.BC_ID || nps.BUYING_CENTRE) === selBuyCenter);

    if (npsFilterArr.length > 0) {
      // Add stakeholders from STAKEHOLDERS array
      if (npsFilterArr[0].STAKEHOLDERS) {
        npsFilterArr[0].STAKEHOLDERS.forEach(nps => {
          const optionValue = nps.STAKEHOLDER;
          npsOptions += `<option value="${optionValue}">${optionValue}</option>`;
          if (npsSelected === optionValue) {
            isOptionFound = true; // Mark as found if npsSelected matches
          }
        });
      }
      // Add KEY_STAKEHOLDER as an additional stakeholder with status "yes"
      if (npsFilterArr[0].KEY_STAKEHOLDER && Array.isArray(npsFilterArr[0].KEY_STAKEHOLDER)) {
        npsFilterArr[0].KEY_STAKEHOLDER.forEach(keyStakeholder => {
          if (keyStakeholder.KEY_STAKEHOLDER_NAME && keyStakeholder.KEY_STAKEHOLDER_NAME.trim() !== '') {
            const stakeholderName = keyStakeholder.KEY_STAKEHOLDER_NAME;
            npsOptions += `<option value="${stakeholderName}">${stakeholderName}</option>`;
            if (npsSelected === stakeholderName) {
              isOptionFound = true;
            }
          }
        });
      }
    }
  }

  // Add the "Add NPS Stakeholder" option
  // npsOptions += `<option value="new_nps_create" class="option_create_text">+ Add NPS Stake Holder</option>`;

  // Append options to dropdown
  $npsDropdown.append(npsOptions);

  console.log("npsOptions - ", npsOptions);

  // Set the selected value, default to "-1" if not found
  $npsDropdown.val(isOptionFound && npsSelected !== "-1" ? npsSelected : "-1").trigger('change');
}

function ShowNpsPopup() {
  let selcenterName = $('#add_buying_center option:selected').val()
  console.log('selcenterName - ', selcenterName)
  $('#only_new_nps_name').val('');
  $('#already_buying_center').empty().append(selcenterName)
  $("#popup_nps").fadeIn(200);
  $("#overlay").addClass("overlay");
}

// function changeBuyingCenter(obj) {
//   console.log('buying - ', obj); // Logs the DOM element passed as 'this'
//   const selectedOption = $(obj).val(); // Use 'obj' instead of 'this'
//   console.log("selectedOption - ", selectedOption);
//   if (selectedOption === 'new_buying_create') {
//     showPopup(); // Call your popup function
//   } else {
//     $("#add_nps_holder").attr("disabled", false);
//   }
// }

function newBuyingCenter() {
  // Show loader in parent window
  showBuyingCenterLoader();
  window.open('buyingCenterDetails.html?accountName=' + encodeURIComponent(selectedAccData.ACCOUNT_NAME) + '&accountId=' + selectedAccData.ACCOUNT_ID + '&action=new&redirect=accountDetails', '_blank');
}

function viewEditBuyingCenter() {
  let accName = selectedAccData.ACCOUNT_NAME;
  window.open('buyingCenterDetails.html?accountName=' + encodeURIComponent(accName) + '&accountId=' + selectedAccData.ACCOUNT_ID + '&action=view-edit', '_blank');
}

// Internal function to refresh buying center dropdown
function refreshBuyingCenterDropdownInternal(newBuyingCenter, newStakeholder) {
  console.log('newBuyingCenter - ', newBuyingCenter);
  console.log('newStakeholder - ', newStakeholder);
  console.log("Refreshing Buying Center Dropdown...");

  // Call API to get updated buying centers
  let apiURL = apiValue.url.replace("/app", "/get_buying_centers");
  $.ajax({
    url: apiURL,
    type: "POST",
    dataType: "json",
    crossDomain: true,
    format: "json",
    async: false,
    mode: "no-cors",
    data: JSON.stringify({
      account_id: selectedAccData.ACCOUNT_ID
    }),
    success: function (data) {
      console.log('Refreshed buying centers data - ', data);
      let response = data.stakeholder_details || [];
      populateBuyingCenters(response, selectedAccData.ACCOUNT_ID, newBuyingCenter, newStakeholder);
    },
    error: function (error) {
      console.log("Error refreshing buying centers: " + JSON.stringify(error));
      // Fallback to empty data if API fails
      populateBuyingCenters([], selectedAccData.ACCOUNT_ID, newBuyingCenter, newStakeholder);
    },
  });
}

// Global function to be called from popup window
window.toRefreshBuyingCenterDropdown = function (newBuyingCenter, newStakeholder) {
  console.log('newBuyingCenter - ', newBuyingCenter);
  console.log('newStakeholder - ', newStakeholder);
  console.log("Refreshing Buying Center Dropdown from popup window...");
  // Hide loader when buying center creation is complete
  hideBuyingCenterLoader();
  // Call the internal function to avoid recursion
  refreshBuyingCenterDropdownInternal(newBuyingCenter, newStakeholder);
};
function changeBuyingCenter(obj) {
  console.log('Buying Center changed - ', obj);
  const selectedOption = $(obj).val();
  console.log("Selected Option - ", selectedOption);

  if (selectedOption === 'new_buying_create') {
    newBuyingCenter();
    // $("#add_nps_holder").prop("disabled", true).trigger("change"); // Disable and update Select2
  } else {
    const firstDropdown = $("#add_nps_holder"); // Get Select2 dropdown
    const firstOption = firstDropdown.find("option:first").val(); // Get first option value

    if (firstOption) {
      firstDropdown.val(firstOption).trigger("change"); // Select first option and refresh Select2
      firstDropdown.prop("disabled", false); // Enable it
    }
    // else {
    //   firstDropdown.prop("disabled", true).trigger("change"); // Disable if empty
    // }
  }
}

function changeNPSStakeHolder(obj) {
  console.log('NPS - ', obj)
  let selBuyingCenter = $('#add_buying_center option:selected').val()
  if (selBuyingCenter == '-1' || selBuyingCenter == "" || selBuyingCenter == undefined) {
    $("#add_nps_holder").val('-1')
    toastr.options.timeOut = 3000; // 2s
    toastr.error("Please Select buying center");
  } else {
    const selectedOption = $("#add_nps_holder").val();
    console.log("selectedOption - ", selectedOption);
    if (selectedOption == 'new_nps_create') {
      ShowNpsPopup();
    }
  }
}
