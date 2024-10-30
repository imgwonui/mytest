document.addEventListener("DOMContentLoaded", () => {
  const postForm = document.getElementById("post-form");
  const boardSelect = document.getElementById("board-select");
  const tagSection = document.getElementById("tag-section");
  const tagButtons = document.querySelectorAll(".tag-btn");
  const fileSelectBtn = document.querySelector(".file-select-btn");
  const fileInput = document.getElementById("post-file");
  const selectedFileSpan = document.querySelector(".selected-file");
  const submitBtn = document.querySelector(".submit-btn");
  const cancelBtn = document.querySelector(".cancel-btn");
  const writePostButtons = document.querySelectorAll(".tax-write-post-btn");

  // 휴가 신청 모달 관련 함수들
  function openLeaveModal() {
    const modal = document.getElementById("leave-application-modal");
    if (modal) {
      modal.style.display = "flex";
    }
  }

  function closeLeaveModal() {
    const modal = document.getElementById("leave-application-modal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  // 휴가 신청 제출 함수
  function submitLeaveApplication() {
    const leaveForm = document.getElementById("leave-form");
    const leaveType = leaveForm.querySelector(
      'input[name="leave-type"]:checked'
    )?.value;
    const leaveStart = leaveForm.querySelector("#leave-start").value;
    const leaveEnd = leaveForm.querySelector("#leave-end").value;
    const leaveReason = leaveForm.querySelector("#leave-reason").value;

    if (!leaveType || !leaveStart || !leaveEnd || !leaveReason) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    const leaveApplication = {
      type: leaveType,
      start: leaveStart,
      end: leaveEnd,
      reason: leaveReason,
      timestamp: new Date().getTime(),
    };

    // 휴가 신청 저장 로직 (예: 로컬 스토리지에 저장)
    let leaveData = JSON.parse(localStorage.getItem("leaveApplications")) || [];
    leaveData.push(leaveApplication);
    localStorage.setItem("leaveApplications", JSON.stringify(leaveData));

    alert("휴가 신청이 접수되었습니다.");
    leaveForm.reset();
  }

  // 게시글 작성 버튼 이벤트 리스너 추가
  writePostButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 현재 섹션의 ID를 가져옴
      const currentSection = button.closest(".section");
      const sectionId = currentSection.id;

      if (sectionId === "leave-applications") {
        openLeaveModal();
        return;
      }

      // 게시판 선택 업데이트
      if (boardSelect) {
        boardSelect.value = sectionId;
        // 태그 섹션 표시 여부 설정
        const showTagSection = [
          "tax-question-search",
          "knowledge-sharing",
          "notices",
        ].includes(sectionId);
        if (tagSection) {
          tagSection.style.display = showTagSection ? "flex" : "none";
        }
      }

      // 모든 섹션 숨기기
      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
      });

      // 게시글 작성 폼 표시
      const writePostSection = document.getElementById("write-post-section");
      if (writePostSection) {
        writePostSection.style.display = "block";
      }
    });
  });

  // 취소 버튼 이벤트 리스너
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      // 이전 섹션으로 돌아가기
      const boardValue = boardSelect.value;
      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = section.id === boardValue ? "block" : "none";
      });

      // 폼 초기화
      if (postForm) postForm.reset();
      if (tagSection) tagSection.style.display = "none";
      tagButtons.forEach((btn) => {
        btn.classList.remove("selected");
        btn.style.color = "";
        btn.style.borderColor = "";
      });
      if (selectedFileSpan) selectedFileSpan.textContent = "선택된 파일 없음";
    });
  }

  // 파일 선택 버튼 이벤트 리스너
  if (fileSelectBtn && fileInput) {
    fileSelectBtn.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      const fileName = fileInput.files[0]?.name || "선택된 파일 없음";
      if (selectedFileSpan) {
        selectedFileSpan.textContent = fileName;
      }
    });
  }

  // 게시판 선택 시 태그 섹션 표시/숨김 처리
  if (boardSelect) {
    boardSelect.addEventListener("change", (e) => {
      // tax-question-search, knowledge-sharing, notices일 때 태그 섹션 표시
      if (
        e.target.value === "tax-question-search" ||
        e.target.value === "knowledge-sharing" ||
        e.target.value === "notices"
      ) {
        tagSection.style.display = "flex";
      } else {
        tagSection.style.display = "none";
        // 태그 선택 초기화
        tagButtons.forEach((btn) => {
          btn.classList.remove("selected");
          btn.style.color = "";
          btn.style.borderColor = "";
        });
      }
    });
  }

  // 태그 버튼 클릭 이벤트
  tagButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tagButtons.forEach((otherBtn) => {
        otherBtn.classList.remove("selected");
        otherBtn.style.color = "";
        otherBtn.style.borderColor = "";
      });

      btn.classList.add("selected");
      btn.style.color = "#007AFF";
      btn.style.borderColor = "#007AFF";

      // data-tag 속성에서 태그 값을 가져옴
      selectedTag = btn.getAttribute("data-tag");
    });
  });

  // 게시글 등록
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const title = document.getElementById("post-title").value;
      const content = document.getElementById("post-content").value;
      const selectedBoard = boardSelect.value;
      const selectedTag =
        document.querySelector(".tag-btn.selected")?.dataset.tag;

      if (!selectedBoard || !title || !content) {
        alert("필수 항목을 모두 입력해주세요.");
        return;
      }

      if (
        (selectedBoard === "tax-question-search" ||
          selectedBoard === "knowledge-sharing" ||
          selectedBoard === "notices") &&
        !selectedTag
      ) {
        alert("태그를 선택해주세요.");
        return;
      }

      // 파일 처리
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const post = createPost(
            title,
            content,
            selectedBoard,
            selectedTag,
            e.target.result
          );
          savePost(post);
        };
        reader.readAsDataURL(file);
      } else {
        const post = createPost(title, content, selectedBoard, selectedTag);
        savePost(post);
      }
    });
  }

  // 휴가 신청 모달 닫기 버튼
  const leaveModalCancelBtn = document.querySelector(".leave-cancel-btn");
  if (leaveModalCancelBtn) {
    leaveModalCancelBtn.addEventListener("click", closeLeaveModal);
  }

  // 휴가 신청 제출 버튼
  const leaveModalSubmitBtn = document.querySelector(".leave-submit-btn");
  if (leaveModalSubmitBtn) {
    leaveModalSubmitBtn.addEventListener("click", () => {
      submitLeaveApplication();
      closeLeaveModal();
    });
  }
});

// 게시글 생성 함수
function createPost(title, content, board, tag, file = null) {
  const now = new Date();
  return {
    title,
    content,
    board,
    tag,
    file,
    timestamp: now.getTime(),
    date: now.toISOString().split("T")[0],
    comments: [],
  };
}

// 게시글 저장 함수
function savePost(post) {
  // 게시글 저장 로직 (예: 로컬 스토리지에 저장)
  let postsData = JSON.parse(localStorage.getItem("postsData")) || {};
  if (!postsData[post.board]) {
    postsData[post.board] = [];
  }
  postsData[post.board].push(post);
  localStorage.setItem("postsData", JSON.stringify(postsData));

  alert("게시글이 등록되었습니다.");

  // 게시글 작성 섹션 숨기기
  const writePostSection = document.getElementById("write-post-section");
  if (writePostSection) {
    writePostSection.style.display = "none";
  }

  // URL 해시 업데이트 및 페이지 새로고침
  window.location.href = "index.html#" + post.board;
  window.location.reload(); // 페이지 새로고침 추가
}
