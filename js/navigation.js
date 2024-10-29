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
  // 요소가 존재할 경우에만 이벤트 리스너 추가
  headerTitle.addEventListener("click", showWelcome);
}

// 섹션 표시
function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => section.classList.remove("active")); // 'sec'를 'section'으로 수정

  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = "block"; // display 속성 추가
    section.classList.add("active");

    // 출근도장 섹션일 경우 캘린더 초기화
    if (sectionId === "attendance") {
      setTimeout(() => {
        // 섹션이 표시된 후 캘린더 초기화
        initializeAttendanceCalendar();
      }, 100);
    }
  }

  updateWritePostButtonVisibility(sectionId);
}

// 섹션별 작성 버튼 표시 여부 업데이트
function updateWritePostButtonVisibility(sectionId) {
  const writePostButton = document.getElementById("write-post-button");
  if (!writePostButton) return; // 요소가 존재하지 않으면 함수 종료

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
  // URL 해시가 welcome이 아닌 경우에만 처리
  if (window.location.hash !== "#welcome") {
    const sections = document.querySelectorAll(".section");
    sections.forEach((sec) => sec.classList.remove("active"));
    const welcomeSection = document.getElementById("welcome");
    if (welcomeSection) {
      welcomeSection.classList.add("active");
    }
    const writePostButton = document.getElementById("write-post-button");
    if (writePostButton) {
      writePostButton.style.display = "none";
    }
    initializeWelcomeCalendar();
    renderDashboardUpdates();
  }
}

// 환영 캘린더 초기화
function initializeWelcomeCalendar() {
  const calendarEl = document.getElementById("calendar");

  if (!calendarEl) return; // 요소가 존재하지 않으면 함수 종료

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

// 페이지 기반 네비게이션을 위한 스크립트

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

document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll("nav > ul > li");

  navItems.forEach((item) => {
    const link = item.querySelector("a");
    const submenu = item.querySelector(".submenu");

    if (submenu) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const isOpen = submenu.style.display === "block";

        // 모든 서브메뉴를 닫습니다
        document.querySelectorAll("nav .submenu").forEach((sub) => {
          sub.style.display = "none";
        });

        // 클릭된 메뉴의 서브메뉴를 토글합니다
        submenu.style.display = isOpen ? "none" : "block";
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const logoLink = document.getElementById("logo-link");
  const navItems = document.querySelectorAll("nav ul li a");

  function setActiveNavItem(targetSection) {
    navItems.forEach((item) => {
      if (item.getAttribute("href") === `#${targetSection}`) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  logoLink.addEventListener("click", function (e) {
    e.preventDefault();
    const welcomeSection = document.getElementById("welcome");
    const allSections = document.querySelectorAll(".section");

    allSections.forEach((section) => {
      section.classList.remove("active");
    });

    welcomeSection.classList.add("active");

    // 네비게이션 메뉴 항목의 활성 상태 업데이트
    setActiveNavItem("welcome");
  });

  // 네비게이션 메뉴 클릭 이벤트 처리
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const targetSection = this.getAttribute("href").substring(1);
      const allSections = document.querySelectorAll(".section");

      allSections.forEach((section) => {
        section.classList.remove("active");
      });

      document.getElementById(targetSection).classList.add("active");

      // 네비게이션 메뉴 항목의 활성 상태 업데이트
      setActiveNavItem(targetSection);
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll("nav ul li a");
  const submenuItems = document.querySelectorAll("nav ul .submenu li a");

  function closeAllSubmenus() {
    navItems.forEach((navItem) => {
      if (navItem.classList.contains("has-submenu")) {
        navItem.parentElement.classList.remove("open");
        const icon = navItem.querySelector(".submenu-icon");
        icon.src = "하단바.png";
      }
    });
  }

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      if (this.classList.contains("has-submenu")) {
        e.preventDefault();
        const parent = this.parentElement;
        const isOpen = parent.classList.contains("open");

        closeAllSubmenus();

        if (!isOpen) {
          parent.classList.add("open");
          const icon = this.querySelector(".submenu-icon");
          icon.src = "상단바.png";
        }
      } else {
        closeAllSubmenus();
      }
    });
  });

  submenuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.stopPropagation(); // 이벤트 버블링 방지
      closeAllSubmenus();
      const parentMenu = this.closest("li.has-submenu");
      if (parentMenu) {
        parentMenu.classList.add("open");
        const icon = parentMenu.querySelector(".submenu-icon");
        icon.src = "상단바.png";
      }
    });
  });

  // 문서의 다른 부분을 클릭했을 때 모든 서브메뉴 닫기
  document.addEventListener("click", function (e) {
    if (!e.target.closest("nav")) {
      closeAllSubmenus();
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // 모든 메뉴 아이템 선택
  const menuItems = document.querySelectorAll(".menu-item");
  const logoLink = document.getElementById("logo-link");

  // 모든 섹션을 숨기고 특정 섹션만 보여주는 함수
  function showSection(sectionId) {
    const sections = document.querySelectorAll(".section");
    sections.forEach((section) => {
      section.classList.remove("active");
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    // 활성화된 메뉴 스타일 적용
    menuItems.forEach((item) => {
      if (item.getAttribute("data-section") === sectionId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // 특정 섹션에 대한 추가 처리
    if (sectionId === "attendance") {
      if (typeof initializeAttendanceCalendar === "function") {
        initializeAttendanceCalendar();
      }
    }
  }

  // 메뉴 아이템 클릭 이벤트 처리
  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const sectionId = this.getAttribute("data-section");
      showSection(sectionId);
    });
  });

  // 로고 클릭 시 welcome 섹션으로 이동
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
  sections.forEach((sec) => {
    if (sec.id === sectionId) {
      sec.style.display = "block";
      sec.classList.add("active");

      if (sectionId === "attendance") {
        initializeAttendanceCalendar();
      }
    } else {
      sec.style.display = "none";
      sec.classList.remove("active");
    }
  });

  updateWritePostButtonVisibility(sectionId);
}
