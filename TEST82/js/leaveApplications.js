// 휴가 신청 모달 초기화
document.addEventListener("DOMContentLoaded", () => {
  // Flatpickr 달력 초기화
  const leaveDateInput = document.getElementById("leave-date");
  if (leaveDateInput) {
    flatpickr(leaveDateInput, {
      enableTime: false,
      dateFormat: "Y-m-d",
      minDate: "today",
      locale: "ko",
    });
  }

  // 휴가 신청 제출 처리
  const leaveSubmitBtn = document.querySelector(".leave-submit-btn");
  if (leaveSubmitBtn) {
    leaveSubmitBtn.addEventListener("click", submitLeaveApplication);
  }

  // 휴가 신청 취소 처리
  const leaveCancelBtn = document.querySelector(".leave-cancel-btn");
  if (leaveCancelBtn) {
    leaveCancelBtn.addEventListener("click", () => {
      const modal = document.querySelector(".leave-modal");
      if (modal) {
        modal.style.display = "none";
      }
      clearLeaveForm();
    });
  }

  // 초기 휴가 신청 내역 렌더링
  renderLeaveApplications();

  // 휴가 현황 초기화 및 업데이트 함수
  initializeLeaveStatus();
});

// 휴가 신청 제출 함수
function submitLeaveApplication() {
  const leaveType = document.getElementById("leave-type").value;
  const leaveDate = document.getElementById("leave-date").value;
  const leaveReason = document.getElementById("leave-reason").value.trim();

  // 입력 유효성 검사
  if (!leaveType || !leaveDate || !leaveReason) {
    Swal.fire({
      title: "입력 오류",
      text: "모든 항목을 입력해주세요.",
      icon: "warning",
      confirmButtonColor: "#007AFF",
    });
    return;
  }

  // 잔여 휴가 확인
  const status = JSON.parse(localStorage.getItem("leaveStatus"));
  if (status.remaining <= 0) {
    Swal.fire({
      title: "신청 실패",
      text: "잔여 휴가가 없습니다.",
      icon: "error",
      confirmButtonColor: "#007AFF",
    });
    return;
  }

  try {
    // 휴가 상태 업데이트
    updateLeaveStatus("apply");

    // 휴가 신청 데이터 생성
    const leaveApplication = {
      id: Date.now(),
      type: leaveType,
      date: leaveDate,
      reason: leaveReason,
      status: "대기",
      submittedAt: new Date().toISOString(),
    };

    // 로컬 스토리지에 저장
    let leaveApplications = JSON.parse(
      localStorage.getItem("leaveApplications") || "[]"
    );
    leaveApplications.push(leaveApplication);
    localStorage.setItem(
      "leaveApplications",
      JSON.stringify(leaveApplications)
    );

    // 성공 메시지 표시
    Swal.fire({
      title: "신청 완료",
      text: "휴가 신청이 완료되었습니다.",
      icon: "success",
      confirmButtonColor: "#007AFF",
    }).then(() => {
      const modal = document.querySelector(".leave-modal");
      if (modal) {
        modal.style.display = "none";
      }
      clearLeaveForm();
      renderLeaveApplications();
    });
  } catch (error) {
    Swal.fire({
      title: "신청 실패",
      text: error.message,
      icon: "error",
      confirmButtonColor: "#007AFF",
    });
  }
}

function renderLeaveApplications() {
  const postsContainer = document.getElementById("leave-applications-posts");
  if (!postsContainer) return;

  // 로컬 스토리지에서 데이터 가져오기
  const leaveApplications = JSON.parse(
    localStorage.getItem("leaveApplications") || "[]"
  );

  // 날짜 기준 내림차순 정렬
  leaveApplications.sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  // HTML 생성
  const html = leaveApplications
    .map(
      (application, index) => `
    <div class="tax-board-row">
      <span class="board-no">${leaveApplications.length - index}</span>
      <span class="board-category">${getLeaveTypeName(application.type)}</span>
      <span class="board-date">${application.date}</span>
      <span class="board-status ${application.status.toLowerCase()}">${
        application.status
      }</span>
    </div>
  `
    )
    .join("");

  postsContainer.innerHTML = html;
}
// 휴가 유형 한글명 반환 함수
function getLeaveTypeName(type) {
  const types = {
    morning: "반차(오전)",
    afternoon: "반차(오후)",
    full: "연차",
  };
  return types[type] || type;
}

// 폼 초기화 함수
function clearLeaveForm() {
  const leaveType = document.getElementById("leave-type");
  const leaveDate = document.getElementById("leave-date");
  const leaveReason = document.getElementById("leave-reason");

  if (leaveType) leaveType.value = "";
  if (leaveDate) leaveDate.value = "";
  if (leaveReason) leaveReason.value = "";
}

// 관리자용 휴가 승인/반려 함수
function updateLeaveStatus(applicationId, newStatus) {
  if (!["승인", "반려"].includes(newStatus)) return;

  let leaveApplications = JSON.parse(
    localStorage.getItem("leaveApplications") || "[]"
  );
  const applicationIndex = leaveApplications.findIndex(
    (app) => app.id === applicationId
  );

  if (applicationIndex !== -1) {
    leaveApplications[applicationIndex].status = newStatus;
    localStorage.setItem(
      "leaveApplications",
      JSON.stringify(leaveApplications)
    );
    renderLeaveApplications();
  }
}

// 휴가 현황 초기화 및 업데이트 함수
function initializeLeaveStatus() {
  if (!localStorage.getItem("leaveStatus")) {
    const initialStatus = {
      pending: 0,
      remaining: 1,
      used: 0,
    };
    localStorage.setItem("leaveStatus", JSON.stringify(initialStatus));
  }
  updateLeaveStatusDisplay();
}

// 휴가 현황 표시 업데이트
function updateLeaveStatusDisplay() {
  const status = JSON.parse(localStorage.getItem("leaveStatus"));

  document.querySelector(
    ".attendance-status-box:nth-child(1) .status-content"
  ).textContent = status.pending;
  document.querySelector(
    ".attendance-status-box:nth-child(2) .status-content"
  ).textContent = status.remaining;
  document.querySelector(
    ".attendance-status-box:nth-child(3) .status-content"
  ).textContent = status.used;
}

// 휴가 신청 시 상태 업데이트
function updateLeaveStatus(action) {
  const status = JSON.parse(localStorage.getItem("leaveStatus"));

  if (action === "apply") {
    if (status.remaining > 0) {
      status.pending += 1;
      status.remaining -= 1;
    } else {
      throw new Error("잔여 휴가가 없습니다.");
    }
  } else if (action === "approve") {
    status.pending -= 1;
    status.used += 1;
  } else if (action === "reject") {
    status.pending -= 1;
    status.remaining += 1;
  }

  localStorage.setItem("leaveStatus", JSON.stringify(status));
  updateLeaveStatusDisplay();
}
