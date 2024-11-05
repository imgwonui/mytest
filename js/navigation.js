// 네비게이션 관리 기능

// 네비게이션 설정
function setupNavigationHandling() {
  const navLinks = document.querySelectorAll("nav ul li a");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");
      showSection(section);
    });
  });

  // 헤더 제목 클릭 시 환영 섹션 표시
  const headerTitle = document.querySelector("header h1");
  if (headerTitle) {
    headerTitle.addEventListener("click", (e) => {
      e.preventDefault();
      showWelcome();
    });
  }
}

// 헤더 제목 클릭 시 환영 섹션 표시
const headerTitle = document.getElementById("header-title");
if (headerTitle) {
  headerTitle.addEventListener("click", showWelcome);
}

// 섹션 표시
function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => section.classList.remove("active"));

  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = "block";
    section.classList.add("active");

    // 출근도장 섹션일 경우 캘린더 초기화
    if (sectionId === "attendance") {
      setTimeout(() => {
        initializeAttendanceCalendar();
      }, 100);
    }
  }

  updateWritePostButtonVisibility(sectionId);
}

// 섹션별 작성 버튼 표시 여부 업데이트
function updateWritePostButtonVisibility(sectionId) {
  const writePostButton = document.getElementById("write-post-button");
  if (!writePostButton) return;

  if (userRole === "admin") {
    const hideSections = ["welcome", "seat-map", "links", "leave-applications"];
    writePostButton.style.display = hideSections.includes(sectionId)
      ? "none"
      : "flex";
  } else if (userRole === "user") {
    const showSections = ["knowledge-sharing", "leave-applications"];
    writePostButton.style.display = showSections.includes(sectionId)
      ? "flex"
      : "none";
  } else {
    writePostButton.style.display = "none";
  }
}

// 환영 섹션 표시
function showWelcome() {
  // 모든 섹션을 먼저 숨김
  document.querySelectorAll(".section").forEach((section) => {
    section.style.display = "none";
  });

  // welcome 섹션만 표시
  const welcomeSection = document.getElementById("welcome");
  if (welcomeSection) {
    welcomeSection.style.display = "block";
  }

  // 글쓰기 버튼 숨김
  const writePostButton = document.getElementById("write-post-button");
  if (writePostButton) {
    writePostButton.style.display = "none";
  }

  initializeWelcomeCalendar();
  renderDashboardUpdates();
}

// 환영 캘린더 초기화
function initializeWelcomeCalendar() {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  const welcomeCalendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "auto",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    events: [],
  });

  welcomeCalendar.render();
}

// 페이지 기반 네비게이션
document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = sessionStorage.getItem("login") === "true";
  const currentHash = window.location.hash.substring(1);

  if (isLoggedIn && currentHash && currentHash !== "welcome") {
    const initialSection = document.getElementById(currentHash);
    if (initialSection) {
      handleSectionChange(currentHash);
    } else {
      handleSectionChange("welcome");
    }
  }
});

// 서브메뉴 관리
document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll("nav > ul > li");

  navItems.forEach((item) => {
    const link = item.querySelector("a");
    const submenu = item.querySelector(".submenu");

    if (submenu) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const isOpen = submenu.style.display === "block";
        document.querySelectorAll("nav .submenu").forEach((sub) => {
          sub.style.display = "none";
        });
        submenu.style.display = isOpen ? "none" : "block";
      });
    }
  });
});

// 로고 및 네비게이션 이벤트 처리
document.addEventListener("DOMContentLoaded", function () {
  const logoLink = document.getElementById("logo-link");
  const menuItems = document.querySelectorAll(".menu-item");

  function showSection(sectionId) {
    const sections = document.querySelectorAll(".section");
    sections.forEach((section) => {
      section.style.display = "none";
      section.classList.remove("active");
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = "block";
      targetSection.classList.add("active");

      // 모든 메뉴 아이템의 스타일 초기화
      menuItems.forEach((item) => {
        const icon = item.querySelector("img");
        const text = item.querySelector("span");
        if (item.getAttribute("data-section") === sectionId) {
          item.classList.add("active");
          if (icon)
            icon.style.filter =
              "brightness(0) saturate(100%) invert(37%) sepia(74%) saturate(1301%) hue-rotate(232deg) brightness(99%) contrast(93%)";
          if (text) text.style.color = "#7152ED";
        } else {
          item.classList.remove("active");
          if (icon) icon.style.filter = "";
          if (text) text.style.color = "";
        }
      });

      if (sectionId === "welcome") {
        initializeWelcomeCalendar();
        window.homeModule.updateHomeNotice();
        updateHomeKnowledgeAndData();
        window.homeModule.setupHomeEventListeners();
      } else if (sectionId === "attendance") {
        initializeAttendanceCalendar();
      }
    }
  }

  // 로고 클릭 이벤트
  logoLink.addEventListener("click", function (e) {
    e.preventDefault();
    showSection("welcome");
  });

  // 초기 페이지 로드 시 welcome 섹션 표시
  showSection("welcome");
});

// 섹션 전환 처리
function handleSectionChange(sectionId) {
  const isLoggedIn = sessionStorage.getItem("login") === "true";
  if (!isLoggedIn) return;

  const sections = document.querySelectorAll(".section");
  const menuItems = document.querySelectorAll(".menu-item");

  sections.forEach((sec) => {
    if (sec.id === sectionId) {
      sec.style.display = "block";
      sec.classList.add("active");

      // 메뉴 아이템 스타일 업데이트
      menuItems.forEach((item) => {
        const icon = item.querySelector("img");
        const text = item.querySelector("span");
        if (item.getAttribute("data-section") === sectionId) {
          item.classList.add("active");
          if (icon)
            icon.style.filter =
              "brightness(0) saturate(100%) invert(37%) sepia(74%) saturate(1301%) hue-rotate(232deg) brightness(99%) contrast(93%)";
          if (text) text.style.color = "#7152ED";
        } else {
          item.classList.remove("active");
          if (icon) icon.style.filter = "";
          if (text) text.style.color = "";
        }
      });

      if (sectionId === "attendance") {
        initializeAttendanceCalendar();
      } else if (sectionId === "welcome") {
        initializeWelcomeCalendar();
        if (window.homeModule) {
          window.homeModule.updateHomeNotice();
          updateHomeKnowledgeAndData();
          window.homeModule.setupHomeEventListeners();
        }
      }
    } else {
      sec.style.display = "none";
      sec.classList.remove("active");
    }
  });

  updateWritePostButtonVisibility(sectionId);
}
