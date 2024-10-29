// 검색 기능 설정
function setupSearchFunctionality() {
  const searchButton = document.getElementById("search-button");
  const searchInput = document.getElementById("search-input");
  const searchModal = document.getElementById("search-modal");
  const searchResults = document.getElementById("search-results");
  const backButton = document.getElementById("back-search-results");
  const closeModalButton = document.getElementById("close-modal");

  if (searchButton) {
    searchButton.addEventListener("click", () => {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      if (query === "") {
        alert("검색어를 입력해주세요.");
        return;
      }
      const results = searchPosts(query);
      displaySearchResults(results);
    });
  }

  if (closeModalButton) {
    closeModalButton.addEventListener("click", () =>
      closeModal("search-modal")
    );
  }

  if (backButton) {
    backButton.addEventListener("click", () => {
      searchResults.innerHTML = "";
      backButton.style.display = "none";
    });
  }
}

// 검색 결과 표시
function displaySearchResults(results) {
  const modal = document.getElementById("search-modal");
  const resultsContainer = document.getElementById("search-results");
  const backButton = document.getElementById("back-search-results");

  if (!resultsContainer) return;

  resultsContainer.innerHTML = "";
  if (backButton) {
    backButton.style.display = "none";
  }

  if (results.length === 0) {
    resultsContainer.innerHTML = "<p>검색 결과가 없습니다.</p>";
  } else {
    results.forEach((result) => {
      const resultDiv = document.createElement("div");
      resultDiv.className = "result";
      const titleButton = document.createElement("button");
      titleButton.style.background = "none";
      titleButton.style.border = "none";
      titleButton.style.color = "#0071e3";
      titleButton.style.cursor = "pointer";
      titleButton.style.fontSize = "18px";
      titleButton.style.textAlign = "left";
      titleButton.style.padding = "5px 0";
      titleButton.innerHTML = `<strong>${
        result.title
      }</strong> <span style="font-size: 14px; color: #555;">(${getSectionName(
        result.section
      )})</span>`;
      titleButton.addEventListener("click", () => {
        openPostModal(result.section, result.index);
        closeModal("search-modal");
      });
      resultDiv.appendChild(titleButton);
      resultsContainer.appendChild(resultDiv);
    });
  }

  if (modal) {
    modal.style.display = "flex";
  }
}

// 게시판별 검색 기능 설정
function setupBoardSearchFunctionality() {
  const boardSearchButton = document.getElementById("board-search-button");
  const closeBoardSearchModalButton = document.getElementById(
    "close-board-search-modal"
  );

  if (boardSearchButton) {
    boardSearchButton.addEventListener("click", () => {
      const boardSearchModal = document.getElementById("board-search-modal");
      const sectionId = boardSearchModal
        ? boardSearchModal.dataset.sectionId
        : null;
      const boardSearchInput = document.getElementById("board-search-input");
      const query = boardSearchInput
        ? boardSearchInput.value.trim().toLowerCase()
        : "";

      if (query === "") {
        alert("검색어를 입력해주세요.");
        return;
      }

      if (!sectionId || !postsData[sectionId]) {
        alert("유효하지 않은 섹션입니다.");
        return;
      }

      const results = postsData[sectionId].filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      );

      displayBoardSearchResults(sectionId, results);
    });
  }

  if (closeBoardSearchModalButton) {
    closeBoardSearchModalButton.addEventListener("click", () =>
      closeModal("board-search-modal")
    );
  }
}

// 게시판별 검색 결과 표시
function displayBoardSearchResults(sectionId, results) {
  const resultsContainer = document.getElementById("board-search-results");
  if (!resultsContainer) return;
  resultsContainer.innerHTML = "";

  if (results.length === 0) {
    resultsContainer.innerHTML = "<p>검색 결과가 없습니다.</p>";
    return;
  }

  results.forEach((result) => {
    const resultDiv = document.createElement("div");
    resultDiv.className = "result";
    const titleButton = document.createElement("button");
    titleButton.style.background = "none";
    titleButton.style.border = "none";
    titleButton.style.color = "#0071e3";
    titleButton.style.cursor = "pointer";
    titleButton.style.fontSize = "18px";
    titleButton.style.textAlign = "left";
    titleButton.style.padding = "5px 0";
    titleButton.innerHTML = `<strong>${result.title}</strong>`;
    titleButton.addEventListener("click", () => {
      openPostModal(sectionId, postsData[sectionId].indexOf(result));
      closeModal("board-search-modal");
    });
    resultDiv.appendChild(titleButton);
    resultsContainer.appendChild(resultDiv);
  });
}

// 인라인 검색 기능 설정
function setupInlineSearch() {
  const searchConfigs = [
    {
      inputId: "tax-search-input",
      buttonId: "tax-search-button",
      sectionId: "tax-question-search",
    },
    {
      inputId: "review-search-input",
      buttonId: "review-search-button",
      sectionId: "review-method-search",
    },
  ];

  searchConfigs.forEach(({ inputId, buttonId, sectionId }) => {
    const searchInput = document.getElementById(inputId);
    const searchButton = document.getElementById(buttonId);

    if (searchButton) {
      searchButton.addEventListener("click", () => {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        performInlineSearch(sectionId, query);
      });
    }

    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && searchButton) {
          searchButton.click();
        }
      });
    }
  });
}

// 인라인 검색 수행
function performInlineSearch(sectionId, query) {
  if (query === "") {
    alert("검색어를 입력해주세요.");
    return;
  }

  if (!postsData[sectionId]) {
    alert("유효하지 않은 섹션입니다.");
    return;
  }

  let filteredPosts = postsData[sectionId].filter((post) => {
    const matchesQuery =
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query);
    const matchesCategory =
      selectedTaxTag === "all" || post.tag === selectedTaxTag;
    return matchesQuery && matchesCategory;
  });

  filteredPosts.sort((a, b) => b.timestamp - a.timestamp);
  renderPosts(sectionId, filteredPosts);
}

// 공통 검색 함수
function searchPosts(query) {
  const allSections = Object.keys(postsData);
  let results = [];

  allSections.forEach((section) => {
    postsData[section].forEach((post, index) => {
      if (
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
      ) {
        results.push({ section, index, title: post.title });
      }
    });
  });

  return results;
}

// 통합 검색 기능 초기화
document.addEventListener("DOMContentLoaded", function () {
  const searchIcon = document.querySelector(".search-icon");
  const integratedSearch = document.getElementById("integrated-search");
  const searchButton = document.getElementById("search-button");
  const searchInput = document.getElementById("search-input");
  const searchResultsModal = document.getElementById("search-results-modal");
  const searchResultsList = document.getElementById("search-results-list");
  const closeSearchResultsModal = document.getElementById(
    "close-search-results-modal"
  );

  // 필요한 요소들이 모두 존재하는지 확인
  if (searchButton && searchInput && searchResultsModal && searchResultsList) {
    // 검색 버튼 클릭 이벤트
    searchButton.addEventListener("click", performSearch);

    // 검색 입력창 엔터키 이벤트
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch();
      }
    });

    // 모달 닫기 버튼 이벤트
    if (closeSearchResultsModal) {
      closeSearchResultsModal.addEventListener("click", () => {
        searchResultsModal.style.display = "none";
      });
    }

    // 외부 클릭 시 모달 닫기
    window.addEventListener("click", (event) => {
      if (event.target === searchResultsModal) {
        searchResultsModal.style.display = "none";
      }
    });
  }

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (query === "") {
      alert("검색어를 입력해주세요.");
      return;
    }

    // 검색 결과 초기화
    searchResultsList.innerHTML = "";

    // 검색 수행
    const results = [];
    for (const section in postsData) {
      postsData[section].forEach((post, index) => {
        if (post.title.toLowerCase().includes(query)) {
          results.push({ section, index, title: post.title });
        }
      });
    }

    // 검색 결과 표시
    if (results.length === 0) {
      searchResultsList.innerHTML = "<p>검색 결과가 없습니다.</p>";
    } else {
      results.forEach((result) => {
        const resultDiv = document.createElement("div");
        resultDiv.className = "result-item";

        const resultLink = document.createElement("a");
        resultLink.href = `view-post.html?section=${encodeURIComponent(
          result.section
        )}&index=${result.index}`;
        resultLink.textContent = result.title;
        resultLink.style.cursor = "pointer";
        resultLink.style.color = "#0071e3";
        resultLink.style.textDecoration = "none";
        resultLink.addEventListener("click", () => {
          searchResultsModal.style.display = "none";
        });

        resultDiv.appendChild(resultLink);
        searchResultsList.appendChild(resultDiv);
      });
    }

    // 검색 결과 모달 표시
    searchResultsModal.style.display = "flex";
  }
});
