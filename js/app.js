// 어플리케이션 초기화 및 메인 기능

// 대시보드 업데이트 렌더링
function renderDashboardUpdates() {
  const recentNoticesList = document.getElementById("home-knowledge-list");
  const recentFaqList = document.getElementById("home-data-list");

  // null 체크 추가
  if (!recentNoticesList || !recentFaqList) return;

  // 기존 리스트 초기화
  recentNoticesList.innerHTML = "";
  recentFaqList.innerHTML = "";

  // 최신 5개 지식공유 게시글 렌더링
  const latestKnowledge = [...postsData["knowledge-sharing"]]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4);
  latestKnowledge.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "home-post-item";
    postElement.innerHTML = `
      <span class="post-title">${post.title}</span>
      <span class="post-date">${new Date(
        post.timestamp
      ).toLocaleDateString()}</span>
    `;
    recentNoticesList.appendChild(postElement);
  });

  // 최신 5개 자료실 게시글 렌더링
  const latestData = [...postsData["data-room"]]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4);
  latestData.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "home-post-item";
    postElement.innerHTML = `
      <span class="post-title">${post.title}</span>
      <div class="post-file-info">
        <span class="post-filename">${post.fileName || "파일없음"}</span>
        <img src="downloadicon.png" alt="다운로드" 
             style="width: 13.5px; height: 13.5px; margin-left: 5px; opacity: 1;">
      </div>
    `;
    recentFaqList.appendChild(postElement);
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
  renderKnowledgePosts();
  setupKnowledgeSearchFunctionality();
  renderNoticesPosts();
  renderDataRoomPosts();
  setupNoticesSearchFunctionality();
  setupDataRoomSearchFunctionality();
  renderSuggestionsPosts();
  setupSuggestionsSearchFunctionality();
  setupSuggestionsSearchFunctionality(); // 추가된 부분
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
  const integratedSearch = document.querySelector(".integrated-search");

  if (searchIcon && integratedSearch) {
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

window.addEventListener("hashchange", () => {
  const hash = window.location.hash.slice(1);
  handleSectionChange(hash);
});

// 건의사항 게시글 렌더링 함수
function renderSuggestionsPosts() {
  const postsContainer = document.querySelector(".suggestions-posts");
  const postsData = loadPostsData();
  const suggestionsPosts = postsData.suggestions || [];

  if (postsContainer) {
    postsContainer.innerHTML = "";

    suggestionsPosts.forEach((post, index) => {
      const postWrapper = document.createElement("div");
      postWrapper.className = "suggestions-post-wrapper";

      const postElement = document.createElement("div");
      postElement.className = "suggestions-post";

      postElement.innerHTML = `
        <span class="suggestions-post-q">Q</span>
        <div class="suggestions-post-content">
          <div class="suggestions-post-title">${post.title}</div>
          <div class="suggestions-post-date">${post.date}</div>
          <div class="suggestions-post-body">${post.content}</div>
        </div>
        <img src="하단바.png" alt="더보기" class="suggestions-post-icon">
      `;

      const replySection = document.createElement("div");
      replySection.className = "suggestions-reply-section";
      replySection.innerHTML = `
        <input type="text" class="suggestions-reply-input" placeholder="답변을 입력해주세요.">
        <button class="suggestions-reply-button">등록</button>
      `;

      const replyButton = replySection.querySelector(
        ".suggestions-reply-button"
      );
      replyButton.addEventListener("click", (e) => {
        e.stopPropagation();
        const replyInput = replySection.querySelector(
          ".suggestions-reply-input"
        );
        const replyText = replyInput.value.trim();

        if (replyText) {
          // 답변이 있는 경우 replied 섹션으로 변경
          const repliedSection = document.createElement("div");
          repliedSection.className = "suggestions-replied-section";
          repliedSection.innerHTML = `
            <span class="suggestions-replied-a">A</span>
            <div class="suggestions-replied-content">
              <div class="suggestions-replied-text">${replyText}</div>
              <div class="suggestions-replied-buttons">
                <button class="suggestions-replied-edit">수정</button>
                <button class="suggestions-replied-delete">삭제</button>
              </div>
            </div>
          `;

          // 수정 버튼 이벤트
          const editButton = repliedSection.querySelector(
            ".suggestions-replied-edit"
          );
          editButton.addEventListener("click", (e) => {
            e.stopPropagation();
            const textDiv = repliedSection.querySelector(
              ".suggestions-replied-text"
            );
            const currentText = textDiv.textContent;

            // 텍스트를 입력 필드로 변경
            repliedSection.querySelector(
              ".suggestions-replied-content"
            ).innerHTML = `
            <input type="text" class="suggestions-reply-input" value="${currentText}">
            <button class="suggestions-reply-edit-button">수정</button>
          `;

            const updateButton = repliedSection.querySelector(
              ".suggestions-reply-edit-button"
            );
            updateButton.addEventListener("click", (e) => {
              e.stopPropagation();
              const newText = repliedSection
                .querySelector(".suggestions-reply-input")
                .value.trim();
              if (newText) {
                repliedSection.innerHTML = `
                  <span class="suggestions-replied-a">A</span>
                  <div class="suggestions-replied-content">
                    <div class="suggestions-replied-text">${newText}</div>
                    <div class="suggestions-replied-buttons">
                      <button class="suggestions-replied-edit">수정</button>
                      <button class="suggestions-replied-delete">삭제</button>
                    </div>
                  </div>
                `;
              }
            });
          });

          // 삭제 버튼 이벤트
          const deleteButton = repliedSection.querySelector(
            ".suggestions-replied-delete"
          );
          deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm("답변을 삭제하시겠습니까?")) {
              // 답변 섹션을 제거하고
              repliedSection.remove();

              // 원래의 답변 입력 섹션을 다시 추가
              postWrapper.appendChild(replySection);

              // 입력 필드 초기화
              const replyInput = replySection.querySelector(
                ".suggestions-reply-input"
              );
              if (replyInput) {
                replyInput.value = "";
              }

              // 답변 입력 섹션 표시
              replySection.style.display = "flex";
            }
          });

          // 기존 reply 섹션을 replied 섹션으로 교체
          replySection.replaceWith(repliedSection);
        }
      });

      postElement.addEventListener("click", (e) => {
        if (e.target.closest(".suggestions-reply-section")) {
          e.stopPropagation();
          return;
        }

        const isExpanded = postElement.classList.contains("expanded");

        document.querySelectorAll(".suggestions-post").forEach((post) => {
          if (post !== postElement) {
            post.classList.remove("expanded");
          }
        });

        postElement.classList.toggle("expanded");
        replySection.style.display = postElement.classList.contains("expanded")
          ? "flex"
          : "none";
      });

      postWrapper.appendChild(postElement);
      postWrapper.appendChild(replySection);
      postsContainer.appendChild(postWrapper);
    });

    const countElement = document.getElementById("suggestions-count");
    if (countElement) {
      countElement.textContent = suggestionsPosts.length;
    }
  }
}

// 건의사항 검색 기능 설정
function setupSuggestionsSearchFunctionality() {
  const searchInput = document.querySelector(".suggestions-search-input");
  const searchButton = document.querySelector(".suggestions-search-button");

  if (searchInput && searchButton) {
    const handleSearch = () => {
      const query = searchInput.value.toLowerCase();
      const postsData = loadPostsData();
      const suggestionsPosts = postsData.suggestions || [];

      const filteredPosts = suggestionsPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      );

      renderSuggestionsPosts(filteredPosts);
    };

    searchButton.addEventListener("click", handleSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    });
  }
}

function setupNavigationHandling() {
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = item.getAttribute("data-section");

      // 모든 섹션을 먼저 숨김
      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
      });

      // 선택된 섹션만 표시
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.style.display = "block";
      }

      updateWritePostButtonVisibility(targetId);
      window.location.hash = targetId;
    });
  });

  // 로고 클릭 이벤트 처리
  const logoLink = document.querySelector(".logo-link");
  if (logoLink) {
    logoLink.addEventListener("click", (e) => {
      e.preventDefault();
      showWelcome();
      window.location.hash = "welcome";
    });
  }
}
