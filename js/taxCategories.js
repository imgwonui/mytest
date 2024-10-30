// 세법 카테고리 버튼 관리 기능

const SEARCH_SECTIONS = [
  "tax-question-search",
  "system-question-search",
  "review-method-search",
  "knowledge-sharing", // 지식공유 섹션 추가
  "notices", // 공지사항 섹션 추가
];

// 카테고리 버튼 설정
function setupTaxCategoryButtons() {
  SEARCH_SECTIONS.forEach((section) => {
    const container = document.getElementById(section);
    if (!container) return;

    const categoryButtons = container.querySelectorAll(".tax-category-btn");
    const searchInput = container.querySelector(".tax-search-input");
    const searchButton = container.querySelector(".tax-search-button");

    // 검색 기능
    if (searchButton) {
      searchButton.addEventListener("click", () => {
        performTaxSearch(section);
      });
    }

    // 엔터키로 검색
    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          performTaxSearch(section);
        }
      });
    }

    // 카테고리 버튼 클릭 이벤트
    categoryButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // 기존 active 클래스 제거
        categoryButtons.forEach((btn) => btn.classList.remove("active"));
        // 새로운 active 클래스 추가
        this.classList.add("active");

        const category = this.textContent;
        filterPostsByCategory(section, category);
      });
    });
  });
}

// 검색 수행
function performTaxSearch(section) {
  const container = document.getElementById(section);
  const searchInput = container.querySelector(".tax-search-input");
  const query = searchInput.value.trim().toLowerCase();
  const activeCategory =
    container.querySelector(".tax-category-btn.active")?.textContent || "전체";

  if (query === "") {
    alert("검색어를 입력해주세요.");
    return;
  }

  // 검색어와 카테고리로 게시글 필터링
  let filteredPosts = postsData[section].filter((post) => {
    const matchesQuery =
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query);

    const matchesCategory =
      activeCategory === "전체" || post.tag === activeCategory;

    return matchesQuery && matchesCategory;
  });

  // 필터링된 결과 표시
  renderPosts(section, filteredPosts);
}

// 카테고리별 필터링
function filterPostsByCategory(section, category) {
  if (!postsData[section]) {
    return;
  }

  const container = document.getElementById(section);
  const searchInput = container.querySelector(".tax-search-input");
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

  let filteredPosts;

  if (category === "전체") {
    filteredPosts = postsData[section];
    if (query) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      );
    }
  } else {
    filteredPosts = postsData[section].filter((post) => {
      const matchesCategory = post.tag === category;
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query);
      return matchesCategory && matchesQuery; // 여기에 return 추가
    });
  }

  renderPosts(section, filteredPosts); // 필터링된 결과를 화면에 표시
}
// DOM이 로드되면 기능 초기화
document.addEventListener("DOMContentLoaded", () => {
  setupTaxCategoryButtons();
  // 초기 게시글 표시
  SEARCH_SECTIONS.forEach((section) => {
    renderPosts(section);
  });
});
