// User Roles
const USER_PASSWORD = "240915";
const ADMIN_PASSWORD = "941201";
let userRole = null; // 'user' or 'admin'

// Login Attempt Counter
let loginAttempts = 0;
const MAX_ATTEMPTS = 5;

// Posts Data Structure
const postsData = {
  notices: [],
  "tax-search": [],
  "review-tax-search": [],
  faq: [],
  "leave-applications": [],
};

// Initialize Welcome Calendar
function initializeWelcomeCalendar() {
  const calendarEl = document.getElementById("calendar");

  const welcomeCalendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "auto",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    events: [],
  });

  welcomeCalendar.render();
}

// Pagination Data Structure
const paginationData = {
  notices: 1,
  "tax-search": 1,
  "review-tax-search": 1,
  faq: 1,
  "leave-applications": 1,
};

const POSTS_PER_PAGE = 10;

// Variable to track current edit
let currentEdit = {
  section: null,
  index: null,
};

// Variable to track current post in modal
let currentPost = null;

// Leave Approval Tracking
let currentApproval = {
  section: null,
  index: null,
};

// Attendance Data Structure
const attendanceData = {
  checkIns: {}, // { 'YYYY-MM-DD': 'HH:MM' }
  checkOuts: {}, // { 'YYYY-MM-DD': 'HH:MM' }
};

// Global variable to store FullCalendar instance
let attendanceCalendar;

// 전역 변수 추가
let selectedTaxTag = null;

// Handle Leave Applications Initialization
function initializeLeaveApplications() {
  // Initialize Flatpickr for leave date selection
  flatpickr("#leave-date", {
    enableTime: false,
    dateFormat: "Y-m-d",
    minDate: "today",
  });

  // Handle Leave Application Submission
  document
    .getElementById("submit-leave-button")
    .addEventListener("click", function () {
      document.getElementById("leave-application-modal").style.display = "flex";
      document.getElementById("leave-type").value = "";
      document.getElementById("leave-date").value = "";
      document.getElementById("leave-reason").value = "";
    });

  document
    .getElementById("close-leave-application-modal")
    .addEventListener("click", function () {
      document.getElementById("leave-application-modal").style.display = "none";
    });

  document
    .getElementById("submit-leave-application")
    .addEventListener("click", function () {
      const type = document.getElementById("leave-type").value;
      const date = document.getElementById("leave-date").value;
      const reason = document.getElementById("leave-reason").value.trim();

      if (!type) {
        alert("휴가 유형을 선택해주세요.");
        return;
      }
      if (!date) {
        alert("휴가 날짜를 선택해주세요.");
        return;
      }
      if (!reason) {
        alert("휴가 사유를 입력해주세요.");
        return;
      }

      const leaveApplication = {
        type: type, // 'full-day' or 'half-day'
        date: date,
        reason: reason,
        status: "pending", // 'pending' or 'approved'
        timestamp: Date.now(),
      };

      postsData["leave-applications"].push(leaveApplication);
      alert("휴가 신청이 완료되었습니다.");
      document.getElementById("leave-application-modal").style.display = "none";
      renderPosts("leave-applications");
      renderDashboardUpdates(); // 대시보드 업데이트 추가
    });

  // Leave Approval Modal Handling
  document
    .getElementById("close-leave-approval-modal")
    .addEventListener("click", function () {
      document.getElementById("leave-approval-modal").style.display = "none";
    });

  document
    .getElementById("approve-leave-button")
    .addEventListener("click", function () {
      if (
        currentApproval.section &&
        currentApproval.index !== null &&
        currentApproval.index !== undefined
      ) {
        postsData[currentApproval.section][currentApproval.index].status =
          "approved";
        alert("휴가 신청이 승인되었습니다.");
        document.getElementById("leave-approval-modal").style.display = "none";
        renderPosts(currentApproval.section);
        renderDashboardUpdates(); // 대시보드 업데이트 추가
        currentApproval = {
          section: null,
          index: null,
        };
      }
    });

  document
    .getElementById("reject-leave-button")
    .addEventListener("click", function () {
      if (
        currentApproval.section &&
        currentApproval.index !== null &&
        currentApproval.index !== undefined
      ) {
        postsData["leave-applications"].splice(currentApproval.index, 1);
        alert("휴가 신청이 거절되었습니다.");
        document.getElementById("leave-approval-modal").style.display = "none";
        renderPosts(currentApproval.section);
        renderDashboardUpdates(); // 대시보드 업데이트 추가
        currentApproval = {
          section: null,
          index: null,
        };
      }
    });
}

// 전역 변수 선언
let writePostModal;
let submitPostButton;

// Get Section Name
function getSectionName(sectionId) {
  const sectionNames = {
    notices: "공지사항",
    "tax-search": "세법",
    "review-tax-search": "검토법",
    faq: "지식 공유 FAQ",
    "leave-applications": "휴가신청",
  };
  return sectionNames[sectionId] || "";
}

// Function to Render Posts with Pagination
function renderPosts(section) {
  const postsContainer = document.getElementById(`${section}-posts`);
  const emptyMessage = document.getElementById(`${section}-empty`);
  const paginationContainer = document.getElementById(`${section}-pagination`);
  postsContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  if (postsData[section].length === 0) {
    emptyMessage.style.display = "block";
    return;
  } else {
    emptyMessage.style.display = "none";
  }
  // Sort posts by timestamp descending
  const sortedPosts = postsData[section].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const currentPage = paginationData[section];

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const postsToDisplay = sortedPosts.slice(startIndex, endIndex);

  postsToDisplay.forEach((post, index) => {
    const actualIndex = startIndex + index;
    const postDiv = document.createElement("div");
    postDiv.className = "post";

    const postTitleDiv = document.createElement("div");
    postTitleDiv.className = "post-title";

    const postNumber = document.createElement("span");
    postNumber.className = "post-number";
    postNumber.textContent = `#${postsData[section].length - actualIndex}`;
    postTitleDiv.appendChild(postNumber);

    // 세법 게시판의 경우 태그 추가
    if (section === "tax-search" && post.tag) {
      const tagSpan = document.createElement("span");
      tagSpan.className = "post-tag";
      tagSpan.textContent = post.tag;
      postTitleDiv.appendChild(tagSpan);
    }

    // 제목
    const titleSpan = document.createElement("span");
    titleSpan.className = "post-title-text";
    titleSpan.textContent = post.title;
    postTitleDiv.appendChild(titleSpan);

    // 제목 클릭 시 모달 열기
    titleSpan.addEventListener("click", function () {
      openPostModal(section, actualIndex);
    });
    titleSpan.style.cursor = "pointer"; // 커서 스타일 변경

    // 상세 정보 (날짜)
    const postDetails = document.createElement("span");
    postDetails.className = "post-details";
    postDetails.textContent = post.date;
    postTitleDiv.appendChild(postDetails);

    // 이미지 아이콘 표시 (이미지 존재 시)
    if (post.image) {
      const imageIcon = document.createElement("i");
      imageIcon.className = "fas fa-image";
      imageIcon.title = "이미지 포함 게시글";
      imageIcon.style.marginLeft = "10px";
      postTitleDiv.appendChild(imageIcon);
    }

    // 액션 버튼
    if (userRole === "admin" && section !== "leave-applications") {
      const postActionsDiv = document.createElement("div");
      postActionsDiv.className = "post-actions";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.title = "수정";
      editButton.addEventListener("click", function (e) {
        e.stopPropagation();
        openEditModal(section, actualIndex);
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.title = "삭제";
      deleteButton.addEventListener("click", function (e) {
        e.stopPropagation();
        deletePost(section, actualIndex);
      });

      postActionsDiv.appendChild(editButton);
      postActionsDiv.appendChild(deleteButton);

      postTitleDiv.appendChild(postActionsDiv);
    }

    // 휴가신청 섹션의 경우 승인 버튼 추가
    if (section === "leave-applications" && userRole === "admin") {
      const approvalButton = document.createElement("button");
      approvalButton.type = "button";
      approvalButton.innerHTML = '<i class="fas fa-check"></i>';
      approvalButton.title = "승인";
      approvalButton.addEventListener("click", function (e) {
        e.stopPropagation();
        openLeaveApprovalModal(section, actualIndex);
      });
      postTitleDiv.appendChild(approvalButton);
    }

    postDiv.appendChild(postTitleDiv);

    postDiv.addEventListener("click", function () {
      if (section !== "leave-applications") {
        openPostModal(section, actualIndex);
      }
    });

    // 휴가신청 상태 표시
    if (section === "leave-applications") {
      const statusSpan = document.createElement("span");
      statusSpan.className = "post-status";
      statusSpan.textContent =
        post.status === "approved" ? "승인 완료" : "승인 전";
      statusSpan.style.marginLeft = "10px";
      statusSpan.style.fontWeight = "bold";
      statusSpan.style.color =
        post.status === "approved" ? "#28a745" : "#ffc107";
      postTitleDiv.appendChild(statusSpan);
    }

    postsContainer.appendChild(postDiv);
  });

  // Pagination 렌더링
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      if (i === currentPage) {
        pageButton.classList.add("active");
      }
      pageButton.addEventListener("click", function () {
        paginationData[section] = i;
        renderPosts(section);
      });
      paginationContainer.appendChild(pageButton);
    }

    if (currentPage < totalPages) {
      const nextButton = document.createElement("button");
      nextButton.textContent = ">";
      nextButton.addEventListener("click", function () {
        paginationData[section]++;
        renderPosts(section);
      });
      paginationContainer.appendChild(nextButton);
    }
  }

  // 대시보드 업데이트
  if (section === "notices" || section === "faq") {
    renderDashboardUpdates();
  }
}

// Function to Render Dashboard Updates
function renderDashboardUpdates() {
  const recentNoticesList = document.getElementById("recent-notices-list");
  const recentFaqList = document.getElementById("recent-faq-list");

  // Clear existing lists
  recentNoticesList.innerHTML = "";
  recentFaqList.innerHTML = "";

  // Render latest 5 notices
  const sortedNotices = [...postsData.notices].sort(
    (a, b) => b.timestamp - a.timestamp
  );
  const latestNotices = sortedNotices.slice(0, 5);
  latestNotices.forEach((post) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = post.title;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      // Find the index in postsData.notices
      const actualIndex = postsData.notices.indexOf(post);
      openPostModal("notices", actualIndex);
    });
    li.appendChild(a);
    recentNoticesList.appendChild(li);
  });

  // Render latest 5 FAQ
  const sortedFaq = [...postsData.faq].sort(
    (a, b) => b.timestamp - a.timestamp
  );
  const latestFaq = sortedFaq.slice(0, 5);
  latestFaq.forEach((post) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = post.title;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      // Find the index in postsData.faq
      const actualIndex = postsData.faq.indexOf(post);
      openPostModal("faq", actualIndex);
    });
    li.appendChild(a);
    recentFaqList.appendChild(li);
  });
}

// Edit Post
function openEditModal(section, index) {
  const post = postsData[section][index];
  writePostModal.style.display = "flex";
  // 스크롤 위치 초기화
  document.querySelector("#write-post-modal .modal-content").scrollTop = 0;
  document.getElementById("modal-title").textContent = "게시글 수정";
  document.getElementById("post-section").value = section;
  document.getElementById("post-section").disabled = true;
  document.getElementById("post-title").value = post.title;
  document.getElementById("post-content").value = post.content;
  document.getElementById("post-image").value = ""; // Clear image input
  currentEdit.section = section;
  currentEdit.index = index;
}

// Delete Post
function deletePost(section, index) {
  if (confirm("정말 이 게시글을 삭제하시겠습니까?")) {
    postsData[section].splice(index, 1);
    renderPosts(section);
    renderDashboardUpdates(); // 대시보드 업데이트 추가
  }
}

// Search Functionality
function setupSearchFunctionality() {
  document
    .getElementById("search-button")
    .addEventListener("click", function () {
      const query = document
        .getElementById("search-input")
        .value.trim()
        .toLowerCase();
      if (query === "") {
        alert("검색어를 입력해주세요.");
        return;
      }
      const results = [];
      for (const section in postsData) {
        postsData[section].forEach((post, index) => {
          if (
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query)
          ) {
            results.push({
              section: section,
              title: post.title,
              content: post.content,
              index: index,
            });
          }
        });
      }
      displaySearchResults(results);
    });

  document
    .getElementById("search-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        document.getElementById("search-button").click();
      }
    });

  document.getElementById("close-modal").addEventListener("click", function () {
    document.getElementById("search-modal").style.display = "none";
  });
}

function displaySearchResults(results) {
  const modal = document.getElementById("search-modal");
  const resultsContainer = document.getElementById("search-results");
  const backButton = document.getElementById("back-search-results");
  resultsContainer.innerHTML = "";
  backButton.style.display = "none";

  if (results.length === 0) {
    resultsContainer.innerHTML = "<p>검색 결과가 없습니다.</p>";
  } else {
    results.forEach((result) => {
      const resultDiv = document.createElement("div");
      resultDiv.className = "result";
      const titleButton = document.createElement("button");
      titleButton.style.background = "none";
      titleButton.style.border = "none";
      titleButton.style.color = "#0071e3";
      titleButton.style.cursor = "pointer";
      titleButton.style.fontSize = "18px";
      titleButton.style.textAlign = "left";
      titleButton.style.padding = "5px 0";
      titleButton.innerHTML = `<strong>${
        result.title
      }</strong> <span style="font-size: 14px; color: #555;">(${getSectionName(
        result.section
      )})</span>`;
      titleButton.addEventListener("click", function () {
        showSearchResultContent(result);
      });
      resultDiv.appendChild(titleButton);
      resultsContainer.appendChild(resultDiv);
    });
  }

  modal.style.display = "flex";
}

function showSearchResultContent(result) {
  const resultsContainer = document.getElementById("search-results");
  const backButton = document.getElementById("back-search-results");
  resultsContainer.innerHTML = `
                  <h3>${result.title}</h3>
                  <p>${result.content}</p>
              `;
  backButton.style.display = "block";

  backButton.onclick = function () {
    // Re-display the list of results
    const currentQuery = document
      .getElementById("search-input")
      .value.trim()
      .toLowerCase();
    const filteredResults = [];
    for (const section in postsData) {
      postsData[section].forEach((post, index) => {
        if (
          post.title.toLowerCase().includes(currentQuery) ||
          post.content.toLowerCase().includes(currentQuery)
        ) {
          filteredResults.push({
            section: section,
            title: post.title,
            content: post.content,
            index: index,
          });
        }
      });
    }
    displaySearchResults(filteredResults);
  };
}

function setupBoardSearchFunctionality() {
  const boardSearchButton = document.getElementById("board-search-button");
  const closeBoardSearchModalButton = document.getElementById(
    "close-board-search-modal"
  );

  // 검색 버튼 클릭 이벤트
  boardSearchButton.addEventListener("click", function () {
    const sectionId =
      document.getElementById("board-search-modal").dataset.sectionId;
    const query = document
      .getElementById("board-search-input")
      .value.trim()
      .toLowerCase();

    if (query === "") {
      alert("검색어를 입력해주세요.");
      return;
    }

    const results = postsData[sectionId].filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
    );

    displayBoardSearchResults(sectionId, results);
  });

  // 모달 닫기 버튼 클릭 이벤트
  closeBoardSearchModalButton.addEventListener("click", function () {
    document.getElementById("board-search-modal").style.display = "none";
  });
}

function displayBoardSearchResults(sectionId, results) {
  const resultsContainer = document.getElementById("board-search-results");
  resultsContainer.innerHTML = "";

  if (results.length === 0) {
    resultsContainer.innerHTML = "<p>검색 결과가 없습니다.</p>";
    return;
  }

  results.forEach((result, index) => {
    const resultDiv = document.createElement("div");
    resultDiv.className = "result";
    const titleButton = document.createElement("button");
    titleButton.style.background = "none";
    titleButton.style.border = "none";
    titleButton.style.color = "#0071e3";
    titleButton.style.cursor = "pointer";
    titleButton.style.fontSize = "18px";
    titleButton.style.textAlign = "left";
    titleButton.style.padding = "5px 0";
    titleButton.innerHTML = `<strong>${result.title}</strong>`;
    titleButton.addEventListener("click", function () {
      openPostModal(sectionId, postsData[sectionId].indexOf(result));
    });
    resultDiv.appendChild(titleButton);
    resultsContainer.appendChild(resultDiv);
  });
}

// Write Post Functionality
function setupWritePostFunctionality() {
  const writePostButton = document.getElementById("write-post-button");
  writePostModal = document.getElementById("write-post-modal");
  const closeModalButton = document.getElementById("close-modal");
  submitPostButton = document.getElementById("submit-post");

  writePostButton.addEventListener("click", function () {
    writePostModal.style.display = "flex";
    document.getElementById("modal-title").textContent = "새 게시글 작성";
    document.getElementById("post-section").disabled = false;
    clearWritePostModal();
  });

  closeModalButton.addEventListener("click", function () {
    writePostModal.style.display = "none";
    clearWritePostModal();
  });

  const sectionSelect = document.getElementById("post-section");
  const taxTagsSection = document.getElementById("tax-tags-section");

  sectionSelect.addEventListener("change", function () {
    if (this.value === "tax-search") {
      taxTagsSection.style.display = "block";
    } else {
      taxTagsSection.style.display = "none";
    }
  });

  const taxTags = document.querySelectorAll(".tax-tag");
  taxTags.forEach((tag) => {
    tag.addEventListener("click", function () {
      taxTags.forEach((t) => t.classList.remove("selected"));
      this.classList.add("selected");
      selectedTaxTag = this.dataset.tag;
    });
  });

  submitPostButton.addEventListener("click", function () {
    const sectionId = document.getElementById("post-section").value;
    const title = document.getElementById("post-title").value.trim();
    const content = document.getElementById("post-content").value.trim();
    const imageInput = document.getElementById("post-image");
    let imageData = null;

    if (sectionId === "") {
      alert("게시판을 선택해주세요.");
      return;
    }
    if (title === "") {
      alert("제목을 입력해주세요.");
      return;
    }
    if (content === "") {
      alert("내용을 입력해주세요.");
      return;
    }

    if (sectionId === "tax-search" && !selectedTaxTag) {
      alert("세법 게시글의 경우 태그를 선택해주세요.");
      return;
    }

    if (imageInput.files.length > 0) {
      const file = imageInput.files[0];
      const reader = new FileReader();
      reader.onloadend = function () {
        imageData = reader.result;
        savePost(sectionId, title, content, imageData);
      };
      reader.readAsDataURL(file);
    } else {
      savePost(sectionId, title, content, imageData);
    }
  });

  function savePost(sectionId, title, content, imageData) {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

    if (currentEdit.section && currentEdit.index !== null) {
      // 수정 모드
      const post = postsData[currentEdit.section][currentEdit.index];
      post.title = title;
      post.content = content;
      if (imageData) {
        post.image = imageData;
      }
      alert("게시글이 수정되었습니다.");
      currentEdit.section = null;
      currentEdit.index = null;
    } else {
      // 작성 모드
      const post = {
        title: title,
        content: content,
        timestamp: Date.now(),
        date: formattedDate,
        comments: [],
        image: imageData,
        tag: sectionId === "tax-search" ? selectedTaxTag : null,
      };
      postsData[sectionId].push(post);
    }

    writePostModal.style.display = "none";
    clearWritePostModal();
    showSection(sectionId);

    // 게시 후 선택된 태그 초기화
    selectedTaxTag = null;
    taxTags.forEach((t) => t.classList.remove("selected"));
  }
}

function clearWritePostModal() {
  document.getElementById("post-section").value = "";
  document.getElementById("post-title").value = "";
  document.getElementById("post-content").value = "";
  document.getElementById("post-image").value = ""; // Clear image input
  document.getElementById("post-section").disabled = false; // 추가
  document.getElementById("tax-tags-section").style.display = "none"; // 추가
}

// Navigation Handling
function setupNavigationHandling() {
  const navLinks = document.querySelectorAll("nav ul li a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const section = this.getAttribute("data-section");
      showSection(section);
    });
  });

  // Add Click Listener to Header Title
  document
    .getElementById("header-title")
    .addEventListener("click", function () {
      showWelcome();
    });
}

// Show Section
function showSection(sectionId) {
  // 모든 섹션 숨기기
  const sections = document.querySelectorAll(".section");
  sections.forEach((sec) => {
    sec.classList.remove("active");
  });

  // 선택된 섹션 표시
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add("active");
    // 환영 섹션이 아직 숨겨지지 않았다면 숨기기
    document.getElementById("welcome").classList.remove("active");
    if (postsData.hasOwnProperty(sectionId)) {
      renderPosts(sectionId);
    }
    // 출근도장 섹션인 경우
    if (sectionId === "attendance") {
      initializeAttendanceCalendar();
      if (attendanceCalendar) {
        attendanceCalendar.updateSize(); // 달력의 크기를 업데이트
      }
    }
  }

  // 글쓰기 버튼 표시 여부 업데이트
  updateWritePostButtonVisibility(sectionId);
}

function updateWritePostButtonVisibility(sectionId) {
  const writePostButton = document.getElementById("write-post-button");
  if (userRole === "admin") {
    if (
      sectionId !== "welcome" &&
      sectionId !== "seat-map" &&
      sectionId !== "links" &&
      sectionId !== "leave-applications"
    ) {
      writePostButton.style.display = "flex";
    } else {
      writePostButton.style.display = "none";
    }
  } else if (userRole === "user") {
    if (sectionId === "faq" || sectionId === "leave-applications") {
      writePostButton.style.display = "flex";
    } else {
      writePostButton.style.display = "none";
    }
  }
}

// Logout Handling
function setupLogoutHandling() {
  document
    .getElementById("logout-button")
    .addEventListener("click", function () {
      sessionStorage.removeItem("login");
      sessionStorage.removeItem("role");
      userRole = null;
      loginAttempts = 0;
      document.getElementById("logout-button").style.display = "none";
      document.getElementById("write-post-button").style.display = "none";
      document.getElementById("main-content").style.display = "none";
      document.getElementById("login-screen").style.display = "flex";
    });
}

// Allow Enter key to submit
function setupEnterKeyListeners() {
  document
    .getElementById("password-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        document.getElementById("login-button").click();
      }
    });
}

// Initialize Attendance Calendar
function initializeAttendanceCalendar() {
  const calendarEl = document.getElementById("attendance-calendar");

  // FullCalendar instance already exists, return
  if (attendanceCalendar) {
    return;
  }

  attendanceCalendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "auto",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    events: [],
  });

  attendanceCalendar.render();
}

// Function to fetch user's IP address
async function getUserIP() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("IP 주소를 가져오는 중 오류 발생:", error);
    return "알 수 없음";
  }
}

// 출근/퇴근 버튼 핸들링
function setupAttendanceFunctionality() {
  const checkInButton = document.getElementById("check-in-button");
  const checkOutButton = document.getElementById("check-out-button");

  checkInButton.addEventListener("click", async function () {
    if (!confirm("출근을 기록하시겠습니까?")) {
      return;
    }

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const timeStr = today.toTimeString().split(" ")[0].slice(0, 5); // "HH:MM"

    if (attendanceData.checkIns[dateStr]) {
      alert("이미 출근 기록이 있습니다.");
      return;
    }

    const userIP = await getUserIP();
    attendanceData.checkIns[dateStr] = timeStr;
    alert(`출근 기록이 추가되었습니다: ${timeStr} (IP : ${userIP})`);

    // Add check-in event to calendar
    attendanceCalendar.addEvent({
      title: `출근: ${timeStr}`,
      start: dateStr,
      classNames: ["fc-event-check-in"],
    });
  });

  checkOutButton.addEventListener("click", async function () {
    if (!confirm("퇴근을 기록하시겠습니까?")) {
      return;
    }

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const timeStr = today.toTimeString().split(" ")[0].slice(0, 5); // "HH:MM"

    if (!attendanceData.checkIns[dateStr]) {
      alert("출근 기록이 없습니다. 먼저 출근해주세요.");
      return;
    }

    if (attendanceData.checkOuts[dateStr]) {
      alert("이미 퇴근 기록이 있습니다.");
      return;
    }

    const userIP = await getUserIP();
    attendanceData.checkOuts[dateStr] = timeStr;
    alert(`퇴근 기록이 추가되었습니다: ${timeStr} (IP : ${userIP})`);

    // Add check-out event to calendar
    attendanceCalendar.addEvent({
      title: `퇴근: ${timeStr}`,
      start: dateStr,
      classNames: ["fc-event-check-out"],
    });
  });
}

// Initialize all functionalities after DOM is loaded
window.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.getElementById("login-button");
  const passwordInput = document.getElementById("password-input");
  const writePostButtonElement = document.getElementById("write-post-button");
  const logoutButton = document.getElementById("logout-button");

  // Handle Login
  loginButton.addEventListener("click", function () {
    const input = passwordInput.value.trim();
    if (input === USER_PASSWORD) {
      userRole = "user";
      sessionStorage.setItem("login", "true");
      sessionStorage.setItem("role", userRole);
      showMainContent();
    } else if (input === ADMIN_PASSWORD) {
      userRole = "admin";
      sessionStorage.setItem("login", "true");
      sessionStorage.setItem("role", userRole);
      showMainContent();
    } else {
      loginAttempts++;
      if (loginAttempts >= MAX_ATTEMPTS) {
        loginButton.disabled = true;
        document.getElementById("lockout-message").style.display = "block";
        document.getElementById("login-error").style.display = "none";
      } else {
        document.getElementById("login-error").style.display = "block";
        document.getElementById("lockout-message").style.display = "none";
      }
    }
    passwordInput.value = "";
  });

  setupEnterKeyListeners();
  setupNavigationHandling();
  setupSearchFunctionality();
  setupBoardSearchFunctionality();
  setupWritePostFunctionality();
  setupLogoutHandling();
});

// Show Main Content after login
function showMainContent() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("main-content").style.display = "flex";
  // Show the welcome section by default
  showWelcome();
  // Show write post button if admin or user (for FAQ)
  if (userRole === "admin" || userRole === "user") {
    document.getElementById("write-post-button").style.display = "flex";
  }
  // 로그아웃 버튼 표시
  document.getElementById("logout-button").style.display = "block";
  // Initialize Leave Applications
  initializeLeaveApplications();
  // 초기 출근도장 기능 설정
  initializeAttendanceCalendar();
  setupAttendanceFunctionality();
}

// Check Login Status on Page Load
window.addEventListener("load", function () {
  const isLoggedIn = sessionStorage.getItem("login");
  const role = sessionStorage.getItem("role");
  console.log("로그인 상태:", isLoggedIn);
  console.log("사용자 역할:", role);

  if (isLoggedIn === "true" && (role === "admin" || role === "user")) {
    userRole = role;
    console.log("사용자 역할 설정:", userRole);
    showMainContent();
  } else {
    console.log("로그인 화면 표시");
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("main-content").style.display = "none";
  }

  console.log("DOM 요소 상태:");
  console.log(
    "login-screen:",
    document.getElementById("login-screen").style.display
  );
  console.log(
    "main-content:",
    document.getElementById("main-content").style.display
  );
});

function openBoardSearch(sectionId) {
  // Display the board search modal
  const boardSearchModal = document.getElementById("board-search-modal");
  boardSearchModal.style.display = "flex";

  // Set the section ID to the modal
  boardSearchModal.dataset.sectionId = sectionId;

  // Update the modal title
  const modalTitle = boardSearchModal.querySelector(".board-search-title");
  modalTitle.textContent = getSectionName(sectionId) + " 키워드 검색";

  // Clear previous input and results
  document.getElementById("board-search-input").value = "";
  document.getElementById("board-search-results").innerHTML = "";
}

// Show Welcome Section
function showWelcome() {
  const sections = document.querySelectorAll(".section");
  sections.forEach((sec) => {
    sec.classList.remove("active");
  });
  document.getElementById("welcome").classList.add("active");
  document.getElementById("write-post-button").style.display = "none";

  // Initialize the welcome calendar
  initializeWelcomeCalendar();

  // Render Dashboard Updates
  renderDashboardUpdates();
}

// Open Post Modal
function openPostModal(section, index) {
  const post = postsData[section][index];
  currentPost = { section, index };
  const modal = document.getElementById("post-modal");
  const modalTitle = document.getElementById("post-modal-title");
  const modalContent = document.getElementById("post-modal-content");
  const modalImage = document.getElementById("post-modal-image");
  const modalDate = document.getElementById("post-modal-date");
  const commentSection = document.getElementById("comments-list");

  modalTitle.textContent = post.title;
  modalContent.innerHTML = post.content.replace(/\n/g, "<br>");
  modalDate.textContent = post.date;

  if (post.image) {
    modalImage.src = post.image;
    modalImage.style.display = "block";
  } else {
    modalImage.style.display = "none";
  }

  // Clear existing comments
  commentSection.innerHTML = "";

  // Add comments
  post.comments.forEach((comment, commentIndex) => {
    const commentElement = document.createElement("div");
    commentElement.className = "comment";
    commentElement.innerHTML = `
        <p>${comment.content}</p>
        <small>${comment.date}</small>
      `;

    // Add delete button for admin
    if (userRole === "admin") {
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "삭제";
      deleteButton.addEventListener("click", function () {
        deleteComment(section, index, commentIndex);
      });
      commentElement.appendChild(deleteButton);
    }

    commentSection.appendChild(commentElement);
  });

  modal.style.display = "flex";
}

// Delete Comment
function deleteComment(section, postIndex, commentIndex) {
  if (confirm("이 댓글을 삭제하시겠습니까?")) {
    postsData[section][postIndex].comments.splice(commentIndex, 1);
    openPostModal(section, postIndex); // Refresh the modal
  }
}

// Close Post Modal
document
  .getElementById("close-post-modal")
  .addEventListener("click", function () {
    document.getElementById("post-modal").style.display = "none";
    currentPost = null;
  });

// 게시글 작성 모달 닫기
document
  .getElementById("close-write-post")
  .addEventListener("click", function () {
    document.getElementById("write-post-modal").style.display = "none";
  });

// Add Comment
document
  .getElementById("add-comment-button")
  .addEventListener("click", function () {
    if (!currentPost) return;

    const commentContent = document
      .getElementById("comment-input")
      .value.trim();
    if (commentContent === "") {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

    const newComment = {
      content: commentContent,
      date: formattedDate,
    };

    postsData[currentPost.section][currentPost.index].comments.push(newComment);
    document.getElementById("comment-input").value = "";
    openPostModal(currentPost.section, currentPost.index); // Refresh the modal
  });

// Open Leave Approval Modal
function openLeaveApprovalModal(section, index) {
  const leaveApplication = postsData[section][index];
  const modal = document.getElementById("leave-approval-modal");
  const modalContent = document.getElementById("approval-details");

  modalContent.innerHTML = `
      <h2>휴가 신청 상세 정보</h2>
      <p><strong>신청 날짜:</strong> ${leaveApplication.date}</p>
      <p><strong>휴가 유형:</strong> ${
        leaveApplication.type === "full-day" ? "종일" : "반차"
      }</p>
      <p><strong>사유:</strong> ${leaveApplication.reason}</p>
    `;

  currentApproval.section = section;
  currentApproval.index = index;

  modal.style.display = "flex";
}

// Initialize the application
window.addEventListener("load", function () {
  // setupNavigationHandling();
  // setupSearchFunctionality();
  // setupBoardSearchFunctionality();
  // setupWritePostFunctionality();
  // setupLogoutHandling();
  // setupEnterKeyListeners();
});
