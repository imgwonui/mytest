// 캘린더 초기화 및 관리 기능

// 환영 캘린더 초기화
function initializeWelcomeCalendar() {
  const calendarEl = document.getElementById("calendar");

  if (!calendarEl) {
    console.warn("Calendar element not found");
    return;
  }

  try {
    const welcomeCalendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      height: "auto",
      headerToolbar: {
        left: "",
        center: "title",
        right: "prev,next today",
      },
      titleFormat: {
        year: "numeric",
        month: "long"
      },
      // 타이틀 스타일링을 위한 설정 추가
      viewDidMount: function(arg) {
        const titleEl = document.querySelector('.fc-toolbar-title');
        if (titleEl) {
          titleEl.style.width = '1920px';
          titleEl.style.height = '56px';
          titleEl.style.padding = '14px 24px';
          titleEl.style.background = '#FFFFFF';
          titleEl.style.borderBottom = '1px solid #E0E0E0';
          titleEl.style.fontFamily = 'Pretendard';
          titleEl.style.fontSize = '16px';
          titleEl.style.fontWeight = '600';
        }
      }
    });

    welcomeCalendar.render();
  } catch (error) {
    console.error("Calendar initialization error:", error);
  }
}
