// 데이터 초기화 및 관리

// 출석 신청 초기화
function initializeLeaveApplications() {
  const submitLeaveButton = document.getElementById("submit-leave-button");
  if (submitLeaveButton) {
    submitLeaveButton.addEventListener("click", () => {
      openModal("leave-application-modal");
      clearLeaveApplicationForm();
    });
  }

  const leaveDateInput = document.getElementById("leave-date");
  if (leaveDateInput) {
    flatpickr(leaveDateInput, {
      enableTime: false,
      dateFormat: "Y-m-d",
      minDate: "today",
    });
  }

  const closeLeaveApplicationModalButton = document.getElementById(
    "close-leave-application-modal"
  );
  if (closeLeaveApplicationModalButton) {
    closeLeaveApplicationModalButton.addEventListener("click", () => {
      closeModal("leave-application-modal");
    });
  }

  const submitLeaveApplicationButton = document.getElementById(
    "submit-leave-application"
  );
  if (submitLeaveApplicationButton) {
    submitLeaveApplicationButton.addEventListener(
      "click",
      submitLeaveApplication
    );
  }
}

// 휴가 신청 폼 초기화
function clearLeaveApplicationForm() {
  const leaveDateInput = document.getElementById("leave-date");
  const leaveReasonInput = document.getElementById("leave-reason");

  if (leaveDateInput) {
    leaveDateInput.value = "";
  }

  if (leaveReasonInput) {
    leaveReasonInput.value = "";
  }
}

// 휴가 신청 제출 함수
function submitLeaveApplication() {
  const leaveDateInput = document.getElementById("leave-date");
  const leaveReasonInput = document.getElementById("leave-reason");

  if (!leaveDateInput || !leaveReasonInput) {
    console.error("필요한 입력 필드를 찾을 수 없습니다.");
    return;
  }

  const leaveDate = leaveDateInput.value;
  const leaveReason = leaveReasonInput.value.trim();

  if (!leaveDate || !leaveReason) {
    alert("모든 필드를 입력해주세요.");
    return;
  }

  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

  const leaveApplication = {
    date: leaveDate,
    reason: leaveReason,
    submittedAt: formattedDate,
    status: "대기중",
  };

  if (!postsData["leave-applications"]) {
    postsData["leave-applications"] = [];
  }

  postsData["leave-applications"].push(leaveApplication);
  savePostsData(postsData);

  alert("휴가 신청이 제출되었습니다.");
  closeModal("leave-application-modal");
  renderPosts("leave-applications");
}

// 출근 데이터 저장소
const attendanceData = {
  checkIns: {},
  checkOuts: {}
};
