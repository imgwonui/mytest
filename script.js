// User Roles
const USER_PASSWORD = "240915";
const ADMIN_PASSWORD = "941201";
let userRole = null; // 'user' or 'admin'

// Login Attempt Counter
let loginAttempts = 0;
const MAX_ATTEMPTS = 5;

// Handle Login
document.getElementById("login-button").addEventListener("click", function () {
  const input = document.getElementById("password-input").value.trim();
  if (input === USER_PASSWORD) {
    userRole = "user";
    showMainContent();
  } else if (input === ADMIN_PASSWORD) {
    userRole = "admin";
    showMainContent();
  } else {
    loginAttempts++;
    if (loginAttempts >= MAX_ATTEMPTS) {
      document.getElementById("login-button").disabled = true;
      document.getElementById("lockout-message").style.display = "block";
      document.getElementById("login-error").style.display = "none";
    } else {
      document.getElementById("login-error").style.display = "block";
      document.getElementById("lockout-message").style.display = "none";
    }
  }
  document.getElementById("password-input").value = "";
});

// Allow Enter key to submit
document
  .getElementById("password-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("login-button").click();
    }
  });

function showMainContent() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("main-content").style.display = "flex";
  // Show the welcome section by default
  showWelcome();
  // Show write post button if admin or user (for FAQ)
  if (userRole === "admin" || userRole === "user") {
    document.getElementById("write-post-button").style.display = "flex";
  }
  // Initialize Leave Applications
  initializeLeaveApplications();
}

// Navigation Handling
const navLinks = document.querySelectorAll("nav ul li a");
navLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const section = this.getAttribute("data-section");
    showSection(section);
  });
});

// Add Click Listener to Header Title
document.getElementById("header-title").addEventListener("click", function () {
  showWelcome();
});

// Posts Data Structure
const postsData = {
  notices: [],
  "tax-search": [],
  "review-tax-search": [],
  faq: [],
  "leave-applications": [], // 새로운 휴가신청 섹션 추가
};

// Pagination Data Structure
const paginationData = {
  notices: 1,
  "tax-search": 1,
  "review-tax-search": 1,
  faq: 1,
  "leave-applications": 1, // 휴가신청 섹션의 페이지 초기화
};

const POSTS_PER_PAGE = 10;

// Variable to track current edit
let currentEdit = {
  section: null,
  index: null,
};

// Variable to track current post in modal
let currentPost = null;

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

  // Calculate total pages
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const currentPage = paginationData[section];

  // Get posts for current page
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const postsToDisplay = sortedPosts.slice(startIndex, endIndex);

  // Render posts
  postsToDisplay.forEach((post, index) => {
    const actualIndex = startIndex + index;
    const postDiv = document.createElement("div");
    postDiv.className = "post";

    const postTitleDiv = document.createElement("div");
    postTitleDiv.className = "post-title";

    // 글번호
    const postNumber = document.createElement("span");
    postNumber.className = "post-number";
    postNumber.textContent = `#${postsData[section].length - actualIndex}`;
    postTitleDiv.appendChild(postNumber);

    // 제목
    const titleSpan = document.createElement("span");
    titleSpan.className = "post-title-text";
    titleSpan.textContent = post.title;
    postTitleDiv.appendChild(titleSpan);

    // 상세 정보 (날짜)
    const postDetails = document.createElement("span");
    postDetails.className = "post-details";
    postDetails.textContent = post.date;
    postTitleDiv.appendChild(postDetails);

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

  // Render Pagination if needed
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

    // Add '>' button for next page if not on last page
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
}

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

function showWelcome() {
  // 모든 섹션 숨기기
  const sections = document.querySelectorAll(".section");
  sections.forEach((sec) => {
    sec.classList.remove("active");
  });
  // 환영 섹션 표시
  const welcomeSection = document.getElementById("welcome");
  if (welcomeSection) {
    welcomeSection.classList.add("active");
  }
  // 글쓰기 버튼 숨기기
  document.getElementById("write-post-button").style.display = "none";
}

// Write Post Button Handling
const writePostButton = document.getElementById("write-post-button");
const writePostModal = document.getElementById("write-post-modal");
const closeWritePost = document.getElementById("close-write-post");
const submitPostButton = document.getElementById("submit-post");

writePostButton.addEventListener("click", function () {
  writePostModal.style.display = "flex";
  document.getElementById("modal-title").textContent =
    userRole === "admin" ? "게시글 작성" : "게시글 작성 (FAQ만 가능)";
  document.getElementById("post-section").value =
    userRole === "admin" ? "" : "faq";
  document.getElementById("post-section").disabled = userRole !== "admin";
  document.getElementById("post-title").value = "";
  document.getElementById("post-content").value = "";
  currentEdit.section = null;
  currentEdit.index = null;
});

closeWritePost.addEventListener("click", function () {
  writePostModal.style.display = "none";
  clearWritePostModal();
});

// Submit Post
submitPostButton.addEventListener("click", function () {
  const sectionSelect = document.getElementById("post-section");
  const sectionId = sectionSelect.value;
  const title = document.getElementById("post-title").value.trim();
  const content = document.getElementById("post-content").value.trim();
  if (sectionId === "") {
    alert("게시판을 선택해주세요.");
    return;
  }
  if (title === "" || content === "") {
    alert("제목과 내용을 모두 입력해주세요.");
    return;
  }
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (currentEdit.section !== null && currentEdit.index !== null) {
    // 수정 모드
    const post = postsData[currentEdit.section][currentEdit.index];
    post.title = title;
    post.content = content;
    post.date = formattedDate;
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
    };
    // 디버깅을 위해 콘솔에 추가된 게시글 확인
    console.log(`Adding post to section "${sectionId}":`, post);
    postsData[sectionId].push(post);
  }

  writePostModal.style.display = "none";
  clearWritePostModal();
  // 게시글 추가 후 해당 섹션을 보여주고 렌더링합니다.
  showSection(sectionId);
});

function clearWritePostModal() {
  document.getElementById("post-section").value = "";
  document.getElementById("post-title").value = "";
  document.getElementById("post-content").value = "";
}

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

// Edit Post
function openEditModal(section, index) {
  const post = postsData[section][index];
  writePostModal.style.display = "flex";
  document.getElementById("modal-title").textContent = "게시글 수정";
  document.getElementById("post-section").value = section;
  document.getElementById("post-section").disabled = true;
  document.getElementById("post-title").value = post.title;
  document.getElementById("post-content").value = post.content;
  currentEdit.section = section;
  currentEdit.index = index;
}

// Delete Post
function deletePost(section, index) {
  if (confirm("정말 이 게시글을 삭제하시겠습니까?")) {
    postsData[section].splice(index, 1);
    renderPosts(section);
  }
}

// Search Functionality
document.getElementById("search-button").addEventListener("click", function () {
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

// Close Search Modal
document.getElementById("close-modal").addEventListener("click", function () {
  document.getElementById("search-modal").style.display = "none";
});

// Post Modal
function openPostModal(section, index) {
  const post = postsData[section][index];
  currentPost = { section: section, index: index };
  const modal = document.getElementById("post-modal");
  modal.querySelector(".post-title").textContent = post.title;
  modal.querySelector(".post-body").innerHTML = `<p>${post.content}</p>`;
  renderComments(post.comments);
  modal.style.display = "flex";
}

document
  .getElementById("close-post-modal")
  .addEventListener("click", function () {
    document.getElementById("post-modal").style.display = "none";
    currentPost = null;
  });

// Comments Functionality
function renderComments(comments) {
  const commentsList = document.getElementById("comments-list");
  commentsList.innerHTML = "";
  if (comments.length === 0) {
    commentsList.innerHTML = "<p>댓글이 없습니다.</p>";
    return;
  }
  comments.forEach((comment) => {
    const commentDiv = document.createElement("div");
    commentDiv.className = "comment";
    commentDiv.innerHTML = `
                    <div class="comment-author">${comment.author}</div>
                    <div class="comment-content">${comment.content}</div>
                `;
    commentsList.appendChild(commentDiv);
  });
}

document
  .getElementById("add-comment-button")
  .addEventListener("click", function () {
    const commentInput = document.getElementById("comment-input").value.trim();
    if (commentInput === "") {
      alert("댓글을 입력해주세요.");
      return;
    }
    if (!currentPost) {
      alert("현재 선택된 게시글이 없습니다.");
      return;
    }
    const comment = {
      author: userRole === "admin" ? "관리자" : "일반 사용자",
      content: commentInput,
    };
    postsData[currentPost.section][currentPost.index].comments.push(comment);
    document.getElementById("comment-input").value = "";
    renderComments(postsData[currentPost.section][currentPost.index].comments);
  });

// Initialize by showing the first section if already logged in
window.onload = function () {
  if (userRole) {
    // If already logged in (e.g., via back button), ensure main content is shown
    showMainContent();
  }
};

// Allow Enter key to add comment
document
  .getElementById("comment-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      document.getElementById("add-comment-button").click();
    }
  });

// Allow Enter key to submit post
document
  .getElementById("post-content")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter" && e.ctrlKey) {
      document.getElementById("submit-post").click();
    }
  });

// Board Specific Search Functionality
function openBoardSearch(sectionId) {
  const modal = document.getElementById("board-search-modal");
  const resultsContainer = document.getElementById("board-search-results");
  const backButton = document.getElementById("back-board-search-results");
  modal.setAttribute("data-section", sectionId);
  document.querySelector(".board-search-title").textContent = `${getSectionName(
    sectionId
  )} 게시판 키워드 검색`;
  resultsContainer.innerHTML = "";
  backButton.style.display = "none";
  modal.style.display = "flex";
}

document
  .getElementById("close-board-search-modal")
  .addEventListener("click", function () {
    document.getElementById("board-search-modal").style.display = "none";
  });

document
  .getElementById("board-search-button")
  .addEventListener("click", function () {
    const modal = document.getElementById("board-search-modal");
    const sectionId = modal.getAttribute("data-section");
    const query = document
      .getElementById("board-search-input")
      .value.trim()
      .toLowerCase();
    if (query === "") {
      alert("검색어를 입력해주세요.");
      return;
    }
    const results = [];
    postsData[sectionId].forEach((post, index) => {
      if (
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
      ) {
        results.push({
          title: post.title,
          content: post.content,
          index: index,
        });
      }
    });
    displayBoardSearchResults(results, sectionId);
  });

function displayBoardSearchResults(results, sectionId) {
  const resultsContainer = document.getElementById("board-search-results");
  const backButton = document.getElementById("back-board-search-results");
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
      titleButton.innerHTML = `<strong>${result.title}</strong>`;
      titleButton.addEventListener("click", function () {
        showBoardSearchResultContent(result, sectionId);
      });
      resultDiv.appendChild(titleButton);
      resultsContainer.appendChild(resultDiv);
    });
  }
}

function showBoardSearchResultContent(result, sectionId) {
  const resultsContainer = document.getElementById("board-search-results");
  const backButton = document.getElementById("back-board-search-results");
  resultsContainer.innerHTML = `
                <h3>${result.title}</h3>
                <p>${result.content}</p>
            `;
  backButton.style.display = "block";

  backButton.onclick = function () {
    // Re-display the list of results
    const currentQuery = document
      .getElementById("board-search-input")
      .value.trim()
      .toLowerCase();
    const filteredResults = [];
    postsData[sectionId].forEach((post, index) => {
      if (
        post.title.toLowerCase().includes(currentQuery) ||
        post.content.toLowerCase().includes(currentQuery)
      ) {
        filteredResults.push({
          title: post.title,
          content: post.content,
          index: index,
        });
      }
    });
    displayBoardSearchResults(filteredResults, sectionId);
  };
}

// Close Board Search Modal
// Ensure there's a close functionality if needed
// Allow Enter key to submit board search
document
  .getElementById("board-search-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("board-search-button").click();
    }
  });

// Initialize Leave Applications
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
        currentApproval = {
          section: null,
          index: null,
        };
      }
    });
}

// Handle Leave Approval
let currentApproval = {
  section: null,
  index: null,
};

function openLeaveApprovalModal(section, index) {
  currentApproval.section = section;
  currentApproval.index = index;
  const application = postsData[section][index];
  const approvalDetails = document.getElementById("approval-details");
  approvalDetails.innerHTML = `
    <p><strong>유형:</strong> ${
      application.type === "full-day" ? "연차" : "반차"
    }</p>
    <p><strong>날짜:</strong> ${application.date}</p>
    <p><strong>사유:</strong> ${application.reason}</p>
    <p><strong>상태:</strong> ${
      application.status === "approved" ? "승인 완료" : "승인 전"
    }</p>
  `;
  document.getElementById("leave-approval-modal").style.display = "flex";
}

// Leave Search Functionality (Optional)
document
  .getElementById("leave-search-button")
  .addEventListener("click", function () {
    const query = document
      .getElementById("leave-search-input")
      .value.trim()
      .toLowerCase();
    if (query === "") {
      alert("검색어를 입력해주세요.");
      return;
    }
    const results = postsData["leave-applications"].filter((app) => {
      return (
        app.type.toLowerCase().includes(query) ||
        app.date.toLowerCase().includes(query) ||
        app.reason.toLowerCase().includes(query) ||
        (app.status && app.status.toLowerCase().includes(query))
      );
    });
    displayLeaveSearchResults(results);
  });

document
  .getElementById("leave-search-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("leave-search-button").click();
    }
  });

function displayLeaveSearchResults(results) {
  const modal = document.getElementById("leave-search-modal");
  const resultsContainer = document.getElementById("leave-search-results");
  const backButton = document.getElementById("back-leave-search-results");
  resultsContainer.innerHTML = "";
  backButton.style.display = "none";

  if (results.length === 0) {
    resultsContainer.innerHTML = "<p>검색 결과가 없습니다.</p>";
  } else {
    results.forEach((result) => {
      const resultDiv = document.createElement("div");
      resultDiv.className = "result";
      const detailsButton = document.createElement("button");
      detailsButton.style.background = "none";
      detailsButton.style.border = "none";
      detailsButton.style.color = "#0071e3";
      detailsButton.style.cursor = "pointer";
      detailsButton.style.fontSize = "18px";
      detailsButton.style.textAlign = "left";
      detailsButton.style.padding = "5px 0";
      detailsButton.innerHTML = `
        <strong>${result.type === "full-day" ? "연차" : "반차"}</strong> - 
        <span>${result.date}</span> - 
        <span>${result.reason}</span> -
        <span>${result.status === "approved" ? "승인 완료" : "승인 전"}</span>
      `;
      detailsButton.addEventListener("click", function () {
        alert(`
          유형: ${result.type === "full-day" ? "연차" : "반차"}
          날짜: ${result.date}
          사유: ${result.reason}
          상태: ${result.status === "approved" ? "승인 완료" : "승인 전"}
        `);
      });
      resultDiv.appendChild(detailsButton);
      resultsContainer.appendChild(resultDiv);
    });
  }

  modal.style.display = "flex";
}

document
  .getElementById("close-leave-search-modal")
  .addEventListener("click", function () {
    document.getElementById("leave-search-modal").style.display = "none";
  });
