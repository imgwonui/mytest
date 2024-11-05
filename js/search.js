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

// 지식공유 검색 기능 설정
function setupKnowledgeSearchFunctionality() {
  const knowledgeSearchButton = document.querySelector(
    ".knowledge-search-button"
  );
  const knowledgeSearchInput = document.querySelector(
    ".knowledge-search-input"
  );

  if (knowledgeSearchButton && knowledgeSearchInput) {
    knowledgeSearchButton.addEventListener("click", () => {
      performKnowledgeSearch();
    });

    knowledgeSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performKnowledgeSearch();
      }
    });
  }
}

// 지식공유 검색 수행
function performKnowledgeSearch() {
  const searchInput = document.querySelector(".knowledge-search-input");
  const query = searchInput.value.trim().toLowerCase();

  if (query === "") {
    alert("검색어를 입력해주세요.");
    return;
  }

  // knowledge-sharing 데이터가 없으면 초기화
  if (!postsData["knowledge-sharing"]) {
    postsData["knowledge-sharing"] = [];
  }

  const results = postsData["knowledge-sharing"].filter(
    (post) =>
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
  );

  renderKnowledgeSearchResults(results);
}

// 지식공유 검색 결과 렌더링
function renderKnowledgeSearchResults(results) {
  const postsContainer = document.querySelector(".knowledge-posts");
  if (!postsContainer) return;

  postsContainer.innerHTML = "";

  if (results.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-results";
    emptyMessage.textContent = "검색 결과가 없습니다.";
    emptyMessage.style.textAlign = "center";
    emptyMessage.style.marginTop = "20px";
    postsContainer.appendChild(emptyMessage);
    return;
  }

  results.forEach((post, index) => {
    const postElement = document.createElement("div");
    postElement.className = "knowledge-post";

    postElement.innerHTML = `
      <span class="knowledge-no">${results.length - index}</span>
      <span class="knowledge-title">${post.title}</span>
      <span class="knowledge-time">${new Date(
        post.timestamp
      ).toLocaleDateString()}</span>
    `;

    postElement.addEventListener("click", () => {
      showPost({
        ...post,
        board: "knowledge-sharing",
      });
    });

    postsContainer.appendChild(postElement);
  });
}

// 공지사항 검색 기능 설정
function setupNoticesSearchFunctionality() {
  const searchInput = document.querySelector(".notices-search-input");
  const searchButton = document.querySelector(".notices-search-button");

  if (searchInput && searchButton) {
    const performSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      const postsData = JSON.parse(localStorage.getItem("postsData")) || {};
      const noticesPosts = postsData["notices"] || [];

      // 검색 결과 필터링
      const searchResults = noticesPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      );

      // 검색 결과 렌더링
      const postsContainer = document.querySelector(".notices-posts");
      if (postsContainer) {
        postsContainer.innerHTML = "";

        if (searchResults.length === 0) {
          postsContainer.innerHTML = `
            <div class="no-results">
              검색 결과가 없습니다.
            </div>
          `;
          return;
        }

        searchResults.forEach((post, index) => {
          const postElement = document.createElement("div");
          postElement.className = "notices-post";
          postElement.innerHTML = `
            <span class="notices-no">${searchResults.length - index}</span>
            <span class="notices-title">${post.title}</span>
            <span class="notices-time">${new Date(
              post.timestamp
            ).toLocaleDateString()}</span>
          `;

          postElement.addEventListener("click", () => {
            showPost({
              ...post,
              board: "notices",
            });
          });

          postsContainer.appendChild(postElement);
        });
      }
    };

    searchButton.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  }
}

// 자료실 검색 기능 설정
function setupDataRoomSearchFunctionality() {
  const searchInput = document.querySelector(".data-room-search-input");
  const searchButton = document.querySelector(".data-room-search-button");

  if (searchInput && searchButton) {
    const performSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      const postsData = JSON.parse(localStorage.getItem("postsData")) || {};
      const dataRoomPosts = postsData["data-room"] || [];

      // 검색 결과 필터링
      const searchResults = dataRoomPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      );

      // 검색 결과 렌더링
      const postsContainer = document.querySelector(".data-room-posts");
      if (postsContainer) {
        postsContainer.innerHTML = "";

        if (searchResults.length === 0) {
          postsContainer.innerHTML = `
            <div class="no-results">
              검색 결과가 없습니다.
            </div>
          `;
          return;
        }

        searchResults.forEach((post, index) => {
          const postElement = document.createElement("div");
          postElement.className = "data-room-post";
          postElement.innerHTML = `
            <span class="data-room-no">${searchResults.length - index}</span>
            <span class="data-room-title">${post.title}</span>
            <span class="data-room-time">${new Date(
              post.timestamp
            ).toLocaleDateString()}</span>
          `;

          postElement.addEventListener("click", () => {
            showPost({
              ...post,
              board: "data-room",
            });
          });

          postsContainer.appendChild(postElement);
        });
      }
    };

    searchButton.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  }
}

// 건의사항 검색 기능 설정
function setupSuggestionsSearchFunctionality() {
  const searchInput = document.querySelector(".suggestions-search-input");
  const searchButton = document.querySelector(".suggestions-search-button");

  if (searchInput && searchButton) {
    const performSearch = () => {
      const query = searchInput.value.trim().toLowerCase();

      if (query === "") {
        alert("검색어를 입력해주세요.");
        return;
      }

      const postsData = JSON.parse(localStorage.getItem("postsData")) || {};
      const suggestionsPosts = postsData["suggestions"] || [];

      // 검색 결과 필터링
      const searchResults = suggestionsPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      );

      // 검색 결과 렌더링
      renderSuggestionsSearchResults(searchResults);
    };

    searchButton.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  }
}

// 건의사항 검색 결과 렌더링
function renderSuggestionsSearchResults(results) {
  const postsContainer = document.querySelector(".suggestions-posts");
  if (!postsContainer) return;

  postsContainer.innerHTML = "";

  if (results.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "no-results";
    emptyMessage.textContent = "검색 결과가 없습니다.";
    emptyMessage.style.textAlign = "center";
    emptyMessage.style.marginTop = "20px";
    postsContainer.appendChild(emptyMessage);
    return;
  }

  results.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "suggestions-post";

    postElement.innerHTML = `
      <span class="suggestions-post-q">Q</span>
      <div class="suggestions-post-content">
        <div class="suggestions-post-title">${post.title}</div>
        <div class="suggestions-post-date">${post.date}</div>
      </div>
      <img src="하단바.png" alt="더보기" class="suggestions-post-icon">
    `;

    postElement.addEventListener("click", () => {
      showPost({
        ...post,
        board: "suggestions",
      });
    });

    postsContainer.appendChild(postElement);
  });

  // 검색 결과 수 업데이트
  const countElement = document.getElementById("suggestions-count");
  if (countElement) {
    countElement.textContent = results.length;
  }
}
