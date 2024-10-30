// 어플리케이션 초기화 및 메인 기능

// 대시보드 업데이트 렌더링
function renderDashboardUpdates() {
  const recentNoticesList = document.getElementById("recent-notices-list");
  const recentFaqList = document.getElementById("recent-faq-list");

  // 기존 리스트 초기화
  recentNoticesList.innerHTML = "";
  recentFaqList.innerHTML = "";

  // 최신 5개 공지사항 렌더링
  const latestNotices = [...postsData.notices]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);
  latestNotices.forEach((post, index) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `view-post.html?section=notices&index=${index}`;
    a.textContent = post.title;
    li.appendChild(a);
    recentNoticesList.appendChild(li);
  });

  // 최신 5개 지식 공유 게시글 렌더링
  const latestKnowledge = [...postsData["knowledge-sharing"]]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);
  latestKnowledge.forEach((post, index) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `view-post.html?section=knowledge-sharing&index=${index}`;
    a.textContent = post.title;
    li.appendChild(a);
    recentFaqList.appendChild(li);
  });
}

// 게시글 저장 후 섹션 표시
function showSectionAfterPost(sectionId) {
  window.location.href = "index.html#" + sectionId;
}

// 로그인된 후 페이지 표시
function showWelcomeSection() {
  showWelcome();
}

// 게시글 작성 버튼 클릭 시 write-post 섹션으로 이동
function setupWritePostButton() {
  const writePostButton = document.getElementById("write-post-button");
  if (writePostButton) {
    // null 체크 추가
    writePostButton.addEventListener("click", () => {
      // 모든 섹션 숨기기
      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
      });

      // 게시글 작성 섹션 표시
      const writePostSection = document.getElementById("write-post-section");
      if (writePostSection) {
        writePostSection.style.display = "block";
      }
    });
  }
}

// 어플리케이션 초기화
function initializeApp() {
  setupNavigationHandling();
  setupSearchFunctionality();
  setupBoardSearchFunctionality();
  setupInlineSearch();
  setupWritePostButton();
  setupTaxCategoryButtons();
  initializeLeaveApplications();
}

// 현재 날짜와 시간을 업데이트하는 함수
function updateDateTime() {
  const now = new Date();
  const dateElement = document.getElementById("current-date");
  const timeElement = document.getElementById("current-time");

  const options = { month: "long", day: "numeric", weekday: "short" };
  dateElement.textContent = now.toLocaleDateString("ko-KR", options);

  timeElement.textContent = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// 1초마다 날짜와 시간 업데이트
setInterval(updateDateTime, 1000);

// 페이지 로드 시 초기 업데이트
document.addEventListener("DOMContentLoaded", updateDateTime);

// 출근/퇴근 버튼 이벤트 리스너
document.addEventListener("DOMContentLoaded", function () {
  const checkInBtn = document.getElementById("check-in-btn");
  const checkOutBtn = document.getElementById("check-out-btn");

  if (checkInBtn) {
    checkInBtn.addEventListener("click", function () {
      // 출근 로직
    });
  }

  if (checkOutBtn) {
    checkOutBtn.addEventListener("click", function () {
      // 퇴근 로직
    });
  }
});

// 통합검색 창 토글 스크립트
document.addEventListener("DOMContentLoaded", function () {
  const searchIcon = document.querySelector(".search-icon");
  const integratedSearch = document.querySelector(".integrated-search"); // ID 대신 클래스로 변경

  if (searchIcon && integratedSearch) {
    // null 체크 추가
    searchIcon.addEventListener("click", function (event) {
      event.preventDefault();
      if (integratedSearch.style.opacity === "1") {
        integratedSearch.style.opacity = "0";
        integratedSearch.style.pointerEvents = "none";
      } else {
        integratedSearch.style.opacity = "1";
        integratedSearch.style.pointerEvents = "auto";
      }
    });

    // 외부 클릭 시 통합검색 창 닫기
    window.addEventListener("click", function (event) {
      if (
        !integratedSearch.contains(event.target) &&
        event.target !== searchIcon
      ) {
        integratedSearch.style.opacity = "0";
        integratedSearch.style.pointerEvents = "none";
      }
    });
  }
});

// 초기화 호출
window.addEventListener("DOMContentLoaded", initializeApp);

// 통합검색 창 열기/닫기 기능 (중복 코드 제거)
document.addEventListener("DOMContentLoaded", () => {
  const searchIcon = document.querySelector(".search-icon");
  const integratedSearch = document.querySelector(".integrated-search");

  if (searchIcon && integratedSearch) {
    // null 체크 추가
    searchIcon.addEventListener("click", () => {
      integratedSearch.classList.toggle("active");
    });

    // 통합검색 창 외부 클릭 시 닫기
    window.addEventListener("click", (event) => {
      if (
        !integratedSearch.contains(event.target) &&
        !searchIcon.contains(event.target)
      ) {
        integratedSearch.classList.remove("active");
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const checkInButton = document.getElementById("check-in-btn");
  if (checkInButton) {
    // null 체크 추가
    checkInButton.addEventListener("click", function () {
      // 출근 로직
    });
  }
});

function initializeLeaveApplications() {
  const leaveDate = document.getElementById("leave-date");
  if (leaveDate) {
    flatpickr(leaveDate, {
      enableTime: false,
      dateFormat: "Y-m-d",
      minDate: "today",
      locale: "ko",
    });
  }
}
