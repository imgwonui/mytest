// window 객체에 homeModule이 없을 때만 선언
if (!window.homeModule) {
  window.homeModule = (function () {
    let currentNoticeIndex = 0;
    const noticesPerPage = 4;

    function updateHomeNotice() {
      const latestNotices = [...postsData.notices]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 4);

      if (latestNotices.length === 0) return;

      const notice = latestNotices[currentNoticeIndex];

      // DOM 요소 찾기
      const dateElement = document.querySelector(
        ".home-notice-bar .notice-date"
      );
      const titleElement = document.querySelector(
        ".home-notice-bar .notice-post-title"
      );
      const contentElement = document.querySelector(
        ".home-notice-bar .notice-post-content"
      );
      const dots = document.querySelectorAll(".home-notice-bar .dot");

      if (!dateElement || !titleElement || !contentElement || !dots) return;

      // 공지사항 내용 업데이트
      dateElement.textContent = new Date(notice.timestamp)
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, ".");

      titleElement.textContent = notice.title;
      contentElement.textContent = notice.content;

      // dots 업데이트
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentNoticeIndex);
      });
    }

    function setupHomeEventListeners() {
      const prevBtn = document.querySelector(
        ".notice-navigation .notice-prev-btn"
      );
      const nextBtn = document.querySelector(
        ".notice-navigation .notice-next-btn"
      );
      const dots = document.querySelectorAll(".notice-navigation .dot");

      // 이전 이벤트 리스너 제거
      if (prevBtn) {
        const oldPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(oldPrevBtn, prevBtn);

        oldPrevBtn.addEventListener("click", () => {
          const latestNotices = [...postsData.notices]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 4);

          currentNoticeIndex =
            (currentNoticeIndex - 1 + latestNotices.length) %
            latestNotices.length;
          updateHomeNotice();
        });
      }

      if (nextBtn) {
        const oldNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(oldNextBtn, nextBtn);

        oldNextBtn.addEventListener("click", () => {
          const latestNotices = [...postsData.notices]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 4);

          currentNoticeIndex = (currentNoticeIndex + 1) % latestNotices.length;
          updateHomeNotice();
        });
      }

      if (dots.length > 0) {
        dots.forEach((dot, index) => {
          const oldDot = dot.cloneNode(true);
          dot.parentNode.replaceChild(oldDot, dot);

          oldDot.addEventListener("click", () => {
            currentNoticeIndex = index;
            updateHomeNotice();
          });
        });
      }
    }

    return {
      updateHomeNotice,
      setupHomeEventListeners,
    };
  })();
}

// 지식공유와 자료실 업데이트 함수
function updateHomeKnowledgeAndData() {
  const knowledgeList = document.getElementById("home-knowledge-list");
  const dataList = document.getElementById("home-data-list");

  if (!knowledgeList || !dataList) return;

  // 지식공유 최신글 업데이트
  const latestKnowledge = [...(postsData["knowledge-sharing"] || [])]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4);

  knowledgeList.innerHTML = latestKnowledge
    .map(
      (post) => `
      <div class="home-post-item">
        <span class="post-title">${post.title}</span>
        <span class="post-date">${new Date(
          post.timestamp
        ).toLocaleDateString()}</span>
      </div>
    `
    )
    .join("");

  // 자료실 최신글 업데이트
  const latestData = [...(postsData["data-room"] || [])]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4);

  dataList.innerHTML = latestData
    .map(
      (post) => `
      <div class="home-post-item">
        <span class="post-title">${post.title}</span>
        <div class="post-file-info">
          <span class="post-filename">${post.fileName || "파일없음"}</span>
          <img src="downloadicon.png" alt="다운로드" 
               style="width: 13.5px; height: 13.5px; margin-left: 5px; opacity: 1;">
        </div>
      </div>
    `
    )
    .join("");
}

function setupViewMoreButtons() {
  // 공지사항 전체보기 버튼
  const noticeViewAllBtn = document.querySelector(".notice-view-all");
  if (noticeViewAllBtn) {
    noticeViewAllBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "index.html#notices";
    });
  }

  // 지식공유 더보기 버튼
  const knowledgeViewMoreBtn = document.querySelector(
    ".home-knowledge-bar .view-more-button"
  );
  if (knowledgeViewMoreBtn) {
    knowledgeViewMoreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "index.html#knowledge-sharing";
    });
  }

  // 자료실 더보기 버튼
  const dataViewMoreBtn = document.querySelector(
    ".home-data-bar .view-more-button"
  );
  if (dataViewMoreBtn) {
    dataViewMoreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "index.html#data-room";
    });
  }
}

// 초기화 함수
function initializeHome() {
  if (!window.postsData) {
    window.postsData = {
      notices: [],
      "knowledge-sharing": [],
      "data-room": [],
    };
  }

  homeModule.updateHomeNotice();
  updateHomeKnowledgeAndData();
  homeModule.setupHomeEventListeners();
  setupViewMoreButtons();
}

// DOM이 로드되면 초기화
document.addEventListener("DOMContentLoaded", initializeHome);

// welcome 섹션이 표시될 때마다 업데이트
document.addEventListener("sectionChange", (e) => {
  if (e.detail.section === "welcome") {
    initializeHome();
  }
});

// 일정 관리 모달 설정
document.addEventListener("DOMContentLoaded", () => {
  const createScheduleBtn = document.querySelector(".create-schedule-btn");
  const scheduleModal = document.getElementById("schedule-create-modal");
  const cancelBtn = document.querySelector(".schedule-cancel-btn");
  const submitBtn = document.querySelector(".schedule-submit-btn");

  if (createScheduleBtn && scheduleModal && cancelBtn) {
    // 모달 열기
    createScheduleBtn.addEventListener("click", () => {
      scheduleModal.style.display = "block";
    });

    // 모달 닫기
    cancelBtn.addEventListener("click", () => {
      scheduleModal.style.display = "none";
    });

    // 모달 외부 클릭시 닫기
    window.addEventListener("click", (e) => {
      if (e.target === scheduleModal) {
        scheduleModal.style.display = "none";
      }
    });

    // ESC 키로 모달 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && scheduleModal.style.display === "block") {
        scheduleModal.style.display = "none";
      }
    });
  }
});
