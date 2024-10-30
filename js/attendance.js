// 출석 관리 기능

// 출석 캘린더 초기화
function initializeAttendanceCalendar() {
  const calendarEl = document.getElementById("attendance-calendar");

  if (!calendarEl) {
    console.error("출근도장 캘린더 요소를 찾을 수 없습니다.");
    return;
  }

  calendarEl.style.display = "block";
  calendarEl.style.height = "600px";

  try {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      height: "auto",
      locale: "ko",
      headerToolbar: {
        left: "title",
        center: "",
        right: "prev,next today",
      },
      buttonText: {
        today: "오늘",
      },
      titleFormat: {
        year: "numeric",
        month: "long",
      },
      dayHeaderFormat: {
        weekday: "short",
      },
      viewDidMount: function (arg) {
        const titleEl = document.querySelector(".fc-toolbar-title");
        if (titleEl) {
          titleEl.style.height = "56px";
          titleEl.style.padding = "14px 24px";
          titleEl.style.background = "#FFFFFF";
          titleEl.style.borderBottom = "1px solid #E0E0E0";
          titleEl.style.fontFamily = "Pretendard";
          titleEl.style.color = "#26282B";
          titleEl.style.display = "flex";
          titleEl.style.alignItems = "center";
        }

        // 버튼 컨테이너 조정
        const headerRight = document.querySelector(
          ".fc-toolbar-chunk:last-child"
        );
        if (headerRight) {
          headerRight.style.display = "flex";
          headerRight.style.alignItems = "center";
          headerRight.style.gap = "8px";
        }
      },
    });

    calendar.render();
    window.attendanceCalendar = calendar;
  } catch (error) {
    console.error("캘린더 초기화 중 오류 발생:", error);
  }
}

// 사용자의 IP 주소 가져오기
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

// 출근/퇴근 상태 업데이트 함수
function updateAttendanceStatus(isCheckedIn, isCheckedOut) {
  const sectionCheckIn = document.getElementById("section-check-in");
  const sectionCheckOut = document.getElementById("section-check-out");
  const navCheckIn = document.querySelector(".check-in-button");
  const statusText = document.getElementById("attendance-status-text");
  const statusImg = document.getElementById("attendance-status-img");

  if (isCheckedIn && !isCheckedOut) {
    // 출근 상태
    if (sectionCheckIn) sectionCheckIn.style.background = "#E7EBF1";
    if (sectionCheckIn) sectionCheckIn.style.color = "#91989F";
    if (sectionCheckOut) sectionCheckOut.style.background = "#6A4CED";
    if (sectionCheckOut) sectionCheckOut.style.color = "#FFFFFF";
    if (statusText)
      statusText.textContent =
        "출근이 등록되었습니다. 오늘도 힘찬 하루 보내세요!";
    if (statusImg) statusImg.src = "출퇴근등록.png";
    if (navCheckIn) {
      navCheckIn.textContent = "퇴근하기";
      navCheckIn.classList.add("check-out");
    }
  } else if (isCheckedIn && isCheckedOut) {
    // 퇴근 상태
    if (sectionCheckIn) sectionCheckIn.style.background = "#E7EBF1";
    if (sectionCheckIn) sectionCheckIn.style.color = "#91989F";
    if (sectionCheckOut) sectionCheckOut.style.background = "#E7EBF1";
    if (sectionCheckOut) sectionCheckOut.style.color = "#91989F";
    if (statusText)
      statusText.textContent =
        "퇴근이 등록되었습니다. 오늘 하루도 수고하셨습니다.";
    if (statusImg) statusImg.src = "출퇴근등록.png";
    if (navCheckIn) {
      navCheckIn.textContent = "출근하기";
      navCheckIn.classList.remove("check-out");
    }
  } else {
    // 초기 상태
    if (sectionCheckIn) sectionCheckIn.style.background = "#6A4CED";
    if (sectionCheckIn) sectionCheckIn.style.color = "#FFFFFF";
    if (sectionCheckOut) sectionCheckOut.style.background = "#E7EBF1";
    if (sectionCheckOut) sectionCheckOut.style.color = "#91989F";
    if (statusText) statusText.textContent = "출근을 등록해주세요.";
    if (statusImg) statusImg.src = "출근전.png";
    if (navCheckIn) {
      navCheckIn.textContent = "출근하기";
      navCheckIn.classList.remove("check-out");
    }
  }
}

// 출근도장 섹션의 출퇴근 버튼 기능
function setupSectionAttendanceButtons() {
  const sectionCheckIn = document.getElementById("section-check-in");
  const sectionCheckOut = document.getElementById("section-check-out");

  if (sectionCheckIn && sectionCheckOut) {
    sectionCheckIn.addEventListener("click", async () => {
      await handleAttendance("checkIn");
    });

    sectionCheckOut.addEventListener("click", async () => {
      await handleAttendance("checkOut");
    });
  }
}

// nav바 출근/퇴근 버튼 이벤트 핸들러
function handleNavAttendance() {
  const navCheckInButton = document.querySelector(".check-in-button");

  if (navCheckInButton) {
    navCheckInButton.addEventListener("click", async () => {
      const isCheckOut = navCheckInButton.classList.contains("check-out");
      await handleAttendance(isCheckOut ? "checkOut" : "checkIn");
    });
  }
}

// 공통 출퇴근 처리 함수
async function handleAttendance(action) {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const timeStr = today.toTimeString().split(" ")[0].slice(0, 5);

  if (action === "checkIn") {
    if (attendanceData.checkIns[dateStr]) {
      Swal.fire({
        title: "이미 출근했습니다",
        text: "오늘은 이미 출근 기록이 있습니다.",
        icon: "warning",
        confirmButtonColor: "#007AFF",
      });
      return;
    }

    const result = await Swal.fire({
      title: "출근하시겠습니까?",
      text: "출근 시간이 기록됩니다.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#007AFF",
      cancelButtonColor: "#73787E",
      confirmButtonText: "출근하기",
      cancelButtonText: "취소",
    });

    if (result.isConfirmed) {
      const userIP = await getUserIP();
      attendanceData.checkIns[dateStr] = timeStr;
      updateAttendanceStatus(true, false);

      const statusText = document.querySelector(".status-text");
      if (statusText) {
        statusText.textContent = "ON";
        statusText.classList.add("on");
      }

      Swal.fire({
        title: "출근이 기록되었습니다",
        text: `출근시간: ${timeStr} (IP: ${userIP})`,
        icon: "success",
        confirmButtonColor: "#007AFF",
      });

      if (window.attendanceCalendar) {
        window.attendanceCalendar.addEvent({
          title: `출근: ${timeStr}`,
          start: dateStr,
          classNames: ["fc-event-check-in"],
        });
      }
    }
  } else if (action === "checkOut") {
    if (!attendanceData.checkIns[dateStr]) {
      Swal.fire({
        title: "출근 기록이 없습니다",
        text: "먼저 출근을 등록해주세요.",
        icon: "warning",
        confirmButtonColor: "#007AFF",
      });
      return;
    }

    if (attendanceData.checkOuts[dateStr]) {
      Swal.fire({
        title: "이미 퇴근했습니다",
        text: "오늘은 이미 퇴근 기록이 있습니다.",
        icon: "warning",
        confirmButtonColor: "#007AFF",
      });
      return;
    }

    const result = await Swal.fire({
      title: "퇴근하시겠습니까?",
      text: "퇴근 시간이 기록됩니다.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#007AFF",
      cancelButtonColor: "#73787E",
      confirmButtonText: "퇴근하기",
      cancelButtonText: "취소",
    });

    if (result.isConfirmed) {
      const userIP = await getUserIP();
      attendanceData.checkOuts[dateStr] = timeStr;
      updateAttendanceStatus(true, true);

      const statusText = document.querySelector(".status-text");
      if (statusText) {
        statusText.textContent = "OFF";
        statusText.classList.remove("on");
      }

      Swal.fire({
        title: "퇴근이 기록되었습니다",
        text: `퇴근시간: ${timeStr} (IP: ${userIP})`,
        icon: "success",
        confirmButtonColor: "#007AFF",
      });

      if (window.attendanceCalendar) {
        window.attendanceCalendar.addEvent({
          title: `퇴근: ${timeStr}`,
          start: dateStr,
          classNames: ["fc-event-check-out"],
        });
      }
    }
  }
}

// DOM이 로드되면 출근도장 기능 초기화
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  const isCheckedIn = !!attendanceData.checkIns[today];
  const isCheckedOut = !!attendanceData.checkOuts[today];

  updateAttendanceStatus(isCheckedIn, isCheckedOut);
  setupSectionAttendanceButtons();
  handleNavAttendance();
});

// 메뉴 클릭 이벤트에 대한 리스너 추가
document.addEventListener("DOMContentLoaded", function () {
  const attendanceLink = document.querySelector('a[data-section="attendance"]');
  if (attendanceLink) {
    attendanceLink.addEventListener("click", function (e) {
      e.preventDefault();
      setTimeout(initializeAttendanceCalendar, 100);
    });
  }
});

// 출석 데이터 초기화
let attendanceData = {
  checkIns: {},
  checkOuts: {},
};
