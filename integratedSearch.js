// 통합 검색 기능
function initializeIntegratedSearch() {
  const searchIcon = document.querySelector(".search-icon");
  const searchInput = document.querySelector(".search-input");
  const searchResultsSection = document.querySelector(
    ".search-results-section"
  );

  // 검색 가능한 섹션 정의
  const searchableSections = [
    "knowledge-sharing",
    "tax-question-search",
    "review-method-search",
    "system-question-search",
    "notices",
    "suggestions",
    "data-room",
  ];

  // 섹션 이름 매핑
  const sectionNames = {
    "knowledge-sharing": "지식 공유",
    "tax-question-search": "세법 검색",
    "review-method-search": "검토법 검색",
    "system-question-search": "시스템 검색",
    notices: "공지사항",
    suggestions: "건의사항",
    "data-room": "자료실",
  };

  // postsData가 없을 경우를 대비한 초기화
  if (typeof postsData === "undefined") {
    postsData = {
      "knowledge-sharing": [],
      "tax-question-search": [],
      "review-method-search": [],
      "system-question-search": [],
      notices: [],
      suggestions: [],
      "data-room": [],
    };
  }

  function performSearch(query) {
    if (!query.trim()) return;

    const results = {};
    let totalCount = 0;

    searchableSections.forEach((section) => {
      const sectionResults =
        postsData[section]?.filter(
          (post) =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.content.toLowerCase().includes(query.toLowerCase())
        ) || [];

      if (sectionResults.length > 0) {
        results[section] = sectionResults;
        totalCount += sectionResults.length;
      }
    });

    // 검색 결과 섹션을 활성화하고 다른 섹션들을 비활성화
    const allSections = document.querySelectorAll(".section");
    allSections.forEach((section) => section.classList.remove("active"));

    const searchResultsSection = document.getElementById("search-results");
    searchResultsSection.classList.add("active");

    displaySearchResults(query, results, totalCount);
  }

  function displaySearchResults(query, results, totalCount) {
    const messageDiv = document.querySelector(".search-results-message");
    const menuButtonsDiv = document.querySelector(".menu-buttons");

    // 검색 결과 메시지 표시
    messageDiv.innerHTML =
      totalCount > 0
        ? `'<span class="highlight">${query}</span>'에 대한 <span class="highlight">${totalCount}</span>건의 검색결과가 있습니다.`
        : "검색 결과가 없습니다.";

    // 메뉴 버튼 생성
    menuButtonsDiv.innerHTML = "";

    // 통합검색 버튼 추가
    const allButton = document.createElement("button");
    allButton.className = "menu-button active";
    allButton.textContent = "통합검색";
    allButton.addEventListener("click", () => {
      // 모든 섹션 표시
      const sections = document.querySelectorAll(".search-section");
      sections.forEach((section) => (section.style.display = "block"));

      // 버튼 스타일 업데이트
      document
        .querySelectorAll(".menu-button")
        .forEach((btn) => btn.classList.remove("active"));
      allButton.classList.add("active");
    });
    menuButtonsDiv.appendChild(allButton);

    // 나머지 섹션 버튼들 추가
    Object.keys(results).forEach((section) => {
      const button = document.createElement("button");
      button.className = "menu-button";
      button.textContent = sectionNames[section];
      button.dataset.section = section;
      button.addEventListener("click", () => {
        filterResultsBySection(section);
        // 버튼 스타일 업데이트
        document
          .querySelectorAll(".menu-button")
          .forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      });
      menuButtonsDiv.appendChild(button);
    });

    // 전체 검색 결과 표시
    displayAllResults(results, query);
  }

  function displayAllResults(results, query) {
    const contentDiv = document.querySelector(".search-results-content");
    contentDiv.innerHTML = "";

    Object.entries(results).forEach(([section, posts]) => {
      const sectionDiv = createSectionResults(section, posts, query);
      contentDiv.appendChild(sectionDiv);
    });
  }

  function createSectionResults(section, posts, query) {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "search-section";

    const headerDiv = document.createElement("div");
    headerDiv.className = "section-header";
    headerDiv.innerHTML = `
      <span class="section-title">${sectionNames[section]}</span>
      <span class="section-count">${posts.length}</span>
    `;

    const resultsDiv = document.createElement("div");
    resultsDiv.className = "section-results";

    posts.forEach((post, index) => {
      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";
      resultItem.style.cursor = "pointer"; // 커서 스타일 추가

      const title = post.title.replace(
        new RegExp(query, "gi"),
        (match) => `<span class="highlight">${match}</span>`
      );

      resultItem.innerHTML = `
        <span class="post-number">#${posts.length - index}</span>
        <span class="post-keyword">${query}</span>
        <span class="post-title">${title}</span>
        <span class="post-date">${post.date}</span>
      `;

      // 클릭 이벤트 추가
      resultItem.addEventListener("click", () => {
        // 검색 결과 모달 닫기
        const searchResultsSection = document.getElementById("search-results");
        if (searchResultsSection) {
          searchResultsSection.classList.remove("active");
        }

        // 게시글 모달 열기
        const postIndex = postsData[section].findIndex(p => 
          p.title === post.title && p.date === post.date
        );
        if (postIndex !== -1) {
          showPost({
            ...post,
            board: section
          });
          openModal('view-post-modal');
        }
      });

      resultsDiv.appendChild(resultItem);
    });

    sectionDiv.appendChild(headerDiv);
    sectionDiv.appendChild(resultsDiv);
    return sectionDiv;
  }

  function filterResultsBySection(section) {
    const buttons = document.querySelectorAll(".menu-button");
    buttons.forEach((button) => {
      if (button.dataset.section === section) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });

    const contentDiv = document.querySelector(".search-results-content");
    const sections = contentDiv.querySelectorAll(".search-section");

    sections.forEach((sectionDiv) => {
      if (
        sectionDiv.querySelector(".section-title").textContent ===
        sectionNames[section]
      ) {
        sectionDiv.style.display = "block";
      } else {
        sectionDiv.style.display = "none";
      }
    });
  }

  // 이벤트 리스너 설정
  searchIcon.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query);
    }
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query);
      }
    }
  });
}

// DOM이 로드되면 초기화
document.addEventListener("DOMContentLoaded", initializeIntegratedSearch);
