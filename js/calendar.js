function initializeWelcomeCalendar() {
  const calendarEl = document.querySelector(".welcomecalendar");

  if (!calendarEl) {
    console.warn("Calendar element not found");
    return;
  }

  try {
    const welcomeCalendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "threeWeekView",
      height: 345,
      locale: "ko",
      contentHeight: "auto",
      aspectRatio: 1.8,
      dayMaxEvents: true,
      initialDate: new Date(),
      views: {
        threeWeekView: {
          type: "dayGrid",
          duration: { weeks: 4 }, // 3주에서 4주로 변경
          buttonText: "4주",
          visibleRange: function (currentDate) {
            let start = new Date(currentDate);
            start.setDate(currentDate.getDate() - 7);
            let end = new Date(currentDate);
            end.setDate(currentDate.getDate() + 21); // 14에서 21로 변경
            return { start, end };
          },
          dayCellDidMount: function (arg) {
            // 각 날짜 셀의 크기를 45px로 설정
            arg.el.style.height = "50px";
            arg.el.style.minHeight = "50px";
            arg.el.style.maxHeight = "50px";
          },
        },
      },
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
      eventContent: function (arg) {
        return {
          html: `<div class="event-color-block" style="background-color:${arg.event.backgroundColor}"></div>`,
        };
      },
      eventDidMount: function (info) {
        // 같은 날짜의 모든 이벤트 가져오기
        const date = info.event.start;
        const events = info.view.calendar.getEvents().filter((event) => {
          return event.start.toDateString() === date.toDateString();
        });

        // 커스텀 툴팁 생성
        const tooltip = document.createElement("div");
        tooltip.className = "custom-event-tooltip";

        // 날짜와 이벤트 수 표시
        const dateHeader = document.createElement("div");
        dateHeader.className = "tooltip-date-header";
        dateHeader.textContent = `${date.getDate()}일(${events.length})`;
        tooltip.appendChild(dateHeader);

        // 이벤트 목록 생성
        events.forEach((event) => {
          const eventRow = document.createElement("div");
          eventRow.className = "tooltip-event-row";

          const colorBlock = document.createElement("div");
          colorBlock.className = "tooltip-color-block";
          colorBlock.style.backgroundColor = event.backgroundColor;

          const title = document.createElement("div");
          title.className = "tooltip-event-title";
          title.textContent =
            event.title.length > 10
              ? event.title.substring(0, 10) + "..."
              : event.title;

          const details = document.createElement("div");
          details.className = "tooltip-event-details";
          details.textContent = `${event.extendedProps.location} | ${
            event.extendedProps.time.split(" ")[0]
          }`;

          eventRow.appendChild(colorBlock);
          eventRow.appendChild(title);
          eventRow.appendChild(details);
          tooltip.appendChild(eventRow);
        });

        // 툴팁 표시/숨김 이벤트
        info.el.addEventListener("mouseenter", () => {
          tooltip.style.display = "block";
          const rect = info.el.getBoundingClientRect();
          tooltip.style.left = `${rect.left}px`;
          tooltip.style.top = `${rect.top - tooltip.offsetHeight}px`;
          document.body.appendChild(tooltip);
        });

        info.el.addEventListener("mouseleave", () => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        });
      },
      viewDidMount: function (arg) {
        const titleEl = document.querySelector(
          ".welcomecalendar .fc-toolbar-title"
        );
        if (titleEl) {
          titleEl.style.height = "56px";
          titleEl.style.padding = "14px 24px";
          titleEl.style.background = "#FFFFFF";
          titleEl.style.fontFamily = "Pretendard";
          titleEl.style.color = "#26282B";
          titleEl.style.display = "flex";
          titleEl.style.alignItems = "center";
          titleEl.style.fontSize = "16px";
          titleEl.style.fontWeight = "600";
        }

        const headerRight = document.querySelector(
          ".welcomecalendar .fc-toolbar-chunk:last-child"
        );
        if (headerRight) {
          headerRight.style.display = "flex";
          headerRight.style.alignItems = "center";
          headerRight.style.gap = "8px";
        }
      },
      dayCellContent: function (info) {
        const number = document.createElement("div");
        number.classList.add("fc-daygrid-day-number");
        number.textContent = info.dayNumberText.replace("일", "");
        return { domNodes: [number] };
      },
    });

    welcomeCalendar.render();
    window.welcomeCalendar = welcomeCalendar;
  } catch (error) {
    console.error("Calendar initialization error:", error);
  }
}

// 일정 생성 모달 관련 코드
function initializeScheduleModal() {
  const modal = document.getElementById("schedule-create-modal");
  const createBtn = document.querySelector(".create-schedule-btn");
  const cancelBtn = document.querySelector(".schedule-cancel-btn");
  const submitBtn = document.querySelector(".schedule-submit-btn");
  const colorCircles = document.querySelectorAll(".color-circle");
  let selectedColor = null;

  // Flatpickr 초기화
  const timeInputs = document.querySelectorAll(".schedule-time-input");
  timeInputs.forEach((input) => {
    flatpickr(input, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      locale: "ko",
    });
  });

  // 색상 선택 이벤트
  colorCircles.forEach((circle) => {
    circle.addEventListener("click", () => {
      colorCircles.forEach((c) => c.classList.remove("selected"));
      circle.classList.add("selected");
      selectedColor = getComputedStyle(circle).backgroundColor;
    });
  });

  // 모달 열기
  createBtn.addEventListener("click", () => {
    modal.style.display = "block";
    resetForm();
  });

  // 모달 닫기
  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
    resetForm();
  });

  // 일정 추가
  submitBtn.addEventListener("click", () => {
    if (!validateForm()) {
      return;
    }

    const title = document.querySelector(".schedule-title-input").value;
    const startDate = document.querySelectorAll(".schedule-date-input")[0]
      .value;
    const startTime = document.querySelectorAll(".schedule-time-input")[0]
      .value;
    const endDate = document.querySelectorAll(".schedule-date-input")[1].value;
    const endTime = document.querySelectorAll(".schedule-time-input")[1].value;
    const location = document.querySelector(".schedule-location-input").value;

    const event = {
      title: title,
      start: `${startDate}T${startTime}`,
      end: `${endDate}T${endTime}`,
      backgroundColor: selectedColor,
      borderColor: selectedColor,
      extendedProps: {
        location: location,
        time: `${startTime} - ${endTime}`,
      },
    };

    window.welcomeCalendar.addEvent(event);
    modal.style.display = "none";
    resetForm();
  });

  function validateForm() {
    const title = document.querySelector(".schedule-title-input").value;
    const startDate = document.querySelectorAll(".schedule-date-input")[0]
      .value;
    const startTime = document.querySelectorAll(".schedule-time-input")[0]
      .value;
    const endDate = document.querySelectorAll(".schedule-date-input")[1].value;
    const endTime = document.querySelectorAll(".schedule-time-input")[1].value;

    if (
      !title ||
      !startDate ||
      !startTime ||
      !endDate ||
      !endTime ||
      !selectedColor
    ) {
      Swal.fire({
        icon: "error",
        title: "입력 오류",
        text: "모든 필수 항목을 입력해주세요. (제목, 시작/종료 일시, 구분 색상)",
        confirmButtonText: "확인",
      });
      return false;
    }

    return true;
  }

  function resetForm() {
    document.querySelector(".schedule-title-input").value = "";
    document
      .querySelectorAll(".schedule-date-input")
      .forEach((input) => (input.value = ""));
    document
      .querySelectorAll(".schedule-time-input")
      .forEach((input) => (input.value = ""));
    document.querySelector(".schedule-location-input").value = "";
    colorCircles.forEach((circle) => circle.classList.remove("selected"));
    selectedColor = null;
  }
}

// DOM이 로드되면 초기화
document.addEventListener("DOMContentLoaded", () => {
  initializeScheduleModal();
});
