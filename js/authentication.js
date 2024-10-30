// 상수 및 초기 데이터 설정

// 사용자 역할을 전역 변수로 선언
window.USER_PASSWORD = "240915";
window.ADMIN_PASSWORD = "941201";
let userRole = null; // 'user' 또는 'admin'

// 로그인 시도 카운터
let loginAttempts = 0;
const MAX_ATTEMPTS = 5;

// 게시물 데이터 구조
const defaultPostsData = {
  notices: [],
  "tax-question-search": [],
  "system-question-search": [],
  "review-method-search": [],
  "knowledge-sharing": [],
  "data-room": [],
  "leave-applications": [],
  "meeting-room-applications": [],
  suggestions: [],
};

// 페이징 데이터 구조
const defaultPaginationData = {
  notices: 1,
  "tax-question-search": 1,
  "system-question-search": 1,
  "review-method-search": 1,
  "knowledge-sharing": 1,
  "data-room": 1,
  "leave-applications": 1,
  "meeting-room-applications": 1,
  suggestions: 1,
};

const POSTS_PER_PAGE = 10;

// 현재 수정 중인 게시물 추적
let currentEdit = {
  section: null,
  index: null,
};

// 현재 모달에 있는 게시물 추적
let currentPost = null;

// 현재 승인 중인 휴가 신청 추적
let currentApproval = {
  section: null,
  index: null,
};

// 전역 FullCalendar 인스턴스
let attendanceCalendar;

// 선택된 세법 태그
// let selectedTaxTag = null;

// 최대 파일 크기 설정 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 게시물 데이터 불러오기
function loadPostsData() {
  const data = localStorage.getItem("postsData");
  if (data) {
    return JSON.parse(data);
  }
  return defaultPostsData;
}

function savePostsData(data) {
  localStorage.setItem("postsData", JSON.stringify(data));
}

// 페이징 데이터 불러오기
function loadPaginationData() {
  const data = localStorage.getItem("paginationData");
  if (data) {
    return JSON.parse(data);
  }
  return defaultPaginationData;
}

function savePaginationData(data) {
  localStorage.setItem("paginationData", JSON.stringify(data));
}

// postsData와 paginationData를 전역 변수로 선언하지 않고,
// 필요한 곳에서 loadPostsData()와 loadPaginationData()를 호출하여 사용

// 게시물 저장 시 localStorage에 반영
function addPost(sectionId, post) {
  const currentPostsData = loadPostsData();
  currentPostsData[sectionId].push(post);
  savePostsData(currentPostsData);
}

function editPost(sectionId, index, updatedPost) {
  const currentPostsData = loadPostsData();
  currentPostsData[sectionId][index] = updatedPost;
  savePostsData(currentPostsData);
}

function deletePost(sectionId, index) {
  const currentPostsData = loadPostsData();
  currentPostsData[sectionId].splice(index, 1);
  savePostsData(currentPostsData);
}

// 페이징 변경 시 localStorage에 반영
function setPage(sectionId, page) {
  const currentPaginationData = loadPaginationData();
  currentPaginationData[sectionId] = page;
  savePaginationData(currentPaginationData);
}

// 로그인 화면에서 메인 콘텐츠로 전환
function showMainContent() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("main-content").style.display = "flex";
  document.querySelector("header").style.display = "flex"; // header 표시

  // 모든 섹션 숨기기
  document.querySelectorAll(".section").forEach((section) => {
    section.style.display = "none";
    section.classList.remove("active");
  });

  // welcome 섹션 표시
  const welcomeSection = document.getElementById("welcome");
  if (welcomeSection) {
    welcomeSection.style.display = "block";
    welcomeSection.classList.add("active");
  }

  // URL 해시 초기화 (pushState 대신 replaceState 사용)
  history.replaceState(null, "", "#welcome");
}

// 로그아웃 기능
function setupLogoutHandling() {
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Swal.fire({
        title: "로그아웃 하시겠습니까?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#007AFF",
        cancelButtonColor: "#DC3545",
        confirmButtonText: "로그아웃",
        cancelButtonText: "취소",
      }).then((result) => {
        if (result.isConfirmed) {
          // 세션스토리지 초기화
          sessionStorage.removeItem("login");
          sessionStorage.removeItem("role");
          userRole = null;

          // UI 상태 초기화
          document.getElementById("main-content").style.display = "none";
          document.getElementById("login-screen").style.display = "flex";
          document.getElementById("write-post-button").style.display = "none";
          document.querySelector("header").style.display = "none";

          // 로그인 입력 필드 초기화
          document.getElementById("password-input").value = "";

          Swal.fire({
            title: "로그아웃 되었습니다",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      });
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setupLogoutHandling();
  // 다른 초기화 코드...
});

// 엔터 키로 제출 허용
function setupEnterKeyListeners() {
  document
    .getElementById("password-input")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        document.getElementById("login-button").click();
      }
    });
}

// 로그인 상태 확인 및 초기화
window.addEventListener("load", () => {
  const isLoggedIn = sessionStorage.getItem("login");
  const role = sessionStorage.getItem("role");

  if (isLoggedIn === "true" && (role === "admin" || role === "user")) {
    userRole = role;
    showMainContent();
  } else {
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("main-content").style.display = "none";
    document.querySelector("header").style.display = "none";
  }
});

// 로그인이 완료된 후 초기화
window.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login-button");
  const passwordInput = document.getElementById("password-input");

  loginButton.addEventListener("click", () => {
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
  setupLogoutHandling();
  setupTaxCategoryButtons();
  setupInlineSearch();
});

function setupWritePostFunctionality() {
  const writePostButtons = document.querySelectorAll(".tax-write-post-btn");
  writePostButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currentSection = button.closest(".section");
      if (currentSection) {
        const sectionId = currentSection.id;
        if (sectionId === "leave-applications") {
          openLeaveModal();
        }
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("password-input");
  const loginButton = document.getElementById("login-button");

  passwordInput.addEventListener("input", function () {
    if (this.value.length > 0) {
      loginButton.classList.add("has-input");
    } else {
      loginButton.classList.remove("has-input");
    }
  });
});
