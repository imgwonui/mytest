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

  // 휴가 신청 버튼 이벤트 리스너
  writePostButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currentSection = button.closest(".section");
      const sectionId = currentSection.id;

      if (sectionId === "leave-applications") {
        openLeaveModal();
        return;
      }

      // 기존 게시글 작성 로직...
      if (boardSelect) {
        boardSelect.value = sectionId;
        const showTagSection = [
          "tax-question-search",
          "knowledge-sharing",
          "notices",
        ].includes(sectionId);
        if (tagSection) {
          tagSection.style.display = showTagSection ? "flex" : "none";
        }
      }

      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
      });

      const writePostSection = document.getElementById("write-post-section");
      if (writePostSection) {
        writePostSection.style.display = "block";
      }
    });
  });

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

  // 나머지 기존 코드...
});
