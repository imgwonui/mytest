function renderPosts(section, filteredPosts = null) {
  const postsContainer = document.getElementById(`${section}-posts`);
  const emptyMessage = document.getElementById(`${section}-empty`);
  const paginationContainer = document.getElementById(`${section}-pagination`);

  if (!postsContainer || !emptyMessage || !paginationContainer) return;

  postsContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  let postsToRender = filteredPosts || postsData[section] || [];

  if (postsToRender.length === 0) {
    emptyMessage.style.display = "block";
    return;
  } else {
    emptyMessage.style.display = "none";
  }

  // 포스트를 최신순으로 정렬
  const sortedPosts = [...postsToRender].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  const POSTS_PER_PAGE = 10;
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const currentPage = paginationData[section] || 1;

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = sortedPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  paginatedPosts.forEach((post, index) => {
    const actualIndex = startIndex + index;
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.style.borderBottom =
      "1px solid var(--Foundation-Black-black-3, #EBEFF3)";
    postDiv.style.height = "64px"; // 높이를 40px로 고정
    postDiv.style.display = "flex"; // flex 추
    postDiv.style.alignItems = "center"; // 세로 중앙 정렬

    const postTitleDiv = document.createElement("div");
    postTitleDiv.className = "post-title";

    const postNumber = document.createElement("span");
    postNumber.className = "post-number";
    postNumber.textContent = `#${postsToRender.length - actualIndex}`;
    postTitleDiv.appendChild(postNumber);

    // 태그 추가
    if (section === "tax-question-search" && post.tag) {
      const tagSpan = document.createElement("span");
      tagSpan.className = "post-tag";
      tagSpan.textContent = post.tag;
      postTitleDiv.appendChild(tagSpan);
    }

    const postTitleText = document.createElement("span");
    postTitleText.className = "post-title-text";
    postTitleText.textContent = post.title;
    postTitleDiv.appendChild(postTitleText);

    const postDetails = document.createElement("span");
    postDetails.className = "post-details";
    postDetails.textContent = post.date;
    postTitleDiv.appendChild(postDetails);

    postDiv.appendChild(postTitleDiv);

    // 게시글 클릭 시 모달 열기로 변경
    postDiv.addEventListener("click", () => {
      showPost({
        ...post,
        board: section, // 게시판 정보 추가
      });
    });

    postsContainer.appendChild(postDiv);
  });

  // 페이징 처리
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      if (i === currentPage) {
        pageButton.disabled = true;
      }
      pageButton.addEventListener("click", () => {
        setPage(section, i);
        renderPosts(section);
      });
      paginationContainer.appendChild(pageButton);
    }
  }
}

// 페이지 설정 함수
function setPage(section, page) {
  paginationData[section] = page;
  savePaginationData(paginationData);
}

// 게시글 작성 버튼 클릭 이벤트 처리를 수정
document.addEventListener("DOMContentLoaded", () => {
  const writePostBtn = document.querySelector(".tax-write-post-btn");
  if (writePostBtn) {
    writePostBtn.addEventListener("click", () => {
      // 모든 섹션 숨기기
      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
      });

      // 게시글 작성 섹션 표시
      const writePostSection = document.getElementById("write-post-section");
      if (writePostSection) {
        writePostSection.style.display = "block";

        // 게시판 선택을 세법 검색으로 자동 설정
        const boardSelect = document.getElementById("board-select");
        if (boardSelect) {
          boardSelect.value = "tax-question-search";
        }

        // URL 해시 업데이트
        window.location.hash = "write-post";
      }
    });
  }

  // 네비게이션 메뉴 클릭 이벤트 처리
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault(); // 기본 이벤트 방지
      const section = item.getAttribute("data-section");

      if (section) {
        // 모든 섹션 숨기기
        document.querySelectorAll(".section").forEach((section) => {
          section.style.display = "none";
        });

        // 게시글 작성 섹션 숨기기
        const writePostSection = document.getElementById("write-post-section");
        if (writePostSection) {
          writePostSection.style.display = "none";
        }

        // 선택한 섹션 표시
        const selectedSection = document.getElementById(section);
        if (selectedSection) {
          selectedSection.style.display = "block";
        }

        // 메뉴 아이템 활성화 상태 업데이트
        document.querySelectorAll(".menu-item").forEach((menuItem) => {
          menuItem.classList.remove("active");
        });
        item.classList.add("active");

        // URL 해시 업데이트
        window.location.hash = section;
      }
    });
  });

  // 브라우저 뒤로가기/앞으로가기 이벤트 처리
  window.addEventListener("popstate", (event) => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      if (hash === "write-post") {
        // 게시글 작성 페이지로 이동
        document.querySelectorAll(".section").forEach((section) => {
          section.style.display = "none";
        });
        const writePostSection = document.getElementById("write-post-section");
        if (writePostSection) {
          writePostSection.style.display = "block";
        }
      } else {
        // 다른 섹션으로 이동
        document.getElementById("write-post-section").style.display = "none";
        const selectedSection = document.getElementById(hash);
        if (selectedSection) {
          document.querySelectorAll(".section").forEach((section) => {
            section.style.display = "none";
          });
          selectedSection.style.display = "block";
        }
      }
    }
  });
});

// showSection 함수 (navigation.js에 있다면 수정하거나, 없다면 추가)
function showSection(sectionId) {
  // 모든 섹션 숨기기
  document.querySelectorAll(".section").forEach((section) => {
    section.style.display = "none";
  });

  // 선택한 섹션 표시
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.style.display = "block";
  }

  // 메뉴 아이템 활성화 상태 업데이트
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("data-section") === sectionId) {
      item.classList.add("active");
    }
  });
}

// 모달 관련 모든 이벤트 리스너를 하나의 함수로 통합
function initializeModalEvents() {
  const modal = document.getElementById("view-post-modal");
  const closeButton = modal.querySelector(".close-button");

  // X 버튼 클릭 시 모달 닫기
  closeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    closeModal("view-post-modal"); // modalId 전달
  });

  // 모달 외부 클릭 시 모달 닫기
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal("view-post-modal"); // modalId 전달
    }
  });

  // 모달 내부 클릭 시 이벤트 전파 중단
  modal.querySelector(".modal-content").addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

// 모달 열기 함수
function showPost(post) {
  const modal = document.getElementById("view-post-modal");
  if (!modal) return;

  // 모달 표시
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  const category = modal.querySelector(".post-category");
  const date = modal.querySelector(".post-date");
  const title = modal.querySelector(".modal-post-title");
  const content = modal.querySelector(".post-content");
  const commentsList = modal.querySelector(".modal-comments-list");

  // 게시판 종류에 따른 카테고리 텍스트 설정
  const categoryText =
    {
      "tax-question-search": "세법 검색",
      "review-method-search": "검토법 검색",
      "system-question-search": "시스템 검색",
      notices: "공지사항",
      suggestions: "건의사항",
      "data-room": "자료실",
    }[post.board] || "";

  if (category) category.textContent = categoryText;
  if (date) date.textContent = new Date(post.date).toLocaleDateString();
  if (title) title.textContent = post.title;
  if (content) content.textContent = post.content;

  // 댓글 목록 렌더링
  if (commentsList) {
    commentsList.innerHTML = "";
    if (post.comments && post.comments.length > 0) {
      post.comments.forEach((comment) => {
        const commentElement = renderComment(comment);
        commentsList.appendChild(commentElement);
      });
    }
  }

  // 댓글 입력 이벤트 설정
  const commentInput = modal.querySelector(".comment-input");
  const commentSubmitBtn = modal.querySelector(".comment-submit-btn");

  if (commentSubmitBtn) {
    // 기존 이벤트 리스너 제거
    const newCommentSubmitBtn = commentSubmitBtn.cloneNode(true);
    commentSubmitBtn.parentNode.replaceChild(
      newCommentSubmitBtn,
      commentSubmitBtn
    );

    newCommentSubmitBtn.addEventListener("click", () => {
      if (!commentInput || !commentInput.value.trim()) {
        alert("댓글 내용을 입력해주세요.");
        return;
      }

      const now = new Date();
      const newComment = {
        author: "user", // 실제 사용자 정보로 대체 필요
        text: commentInput.value.trim(),
        date: now.toLocaleDateString(),
      };

      // 댓글 배열이 없으면 생성
      if (!post.comments) {
        post.comments = [];
      }

      // 댓글 추가
      post.comments.push(newComment);

      // postsData 업데이트
      if (postsData[post.board]) {
        const postIndex = postsData[post.board].findIndex(
          (p) => p.title === post.title && p.date === post.date
        );
        if (postIndex !== -1) {
          postsData[post.board][postIndex] = post;
          savePostsData(postsData);
        }
      }

      // 새 댓글 렌더링
      const commentElement = renderComment(newComment);
      commentsList.appendChild(commentElement);

      // 입력창 초기화
      commentInput.value = "";
    });
  }
}

// 모달 닫기 함수
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// 댓글 등록 버튼 이벤트
document.addEventListener("DOMContentLoaded", () => {
  const commentSubmitBtn = document.querySelector(".comment-submit-btn");
  if (commentSubmitBtn) {
    commentSubmitBtn.addEventListener("click", () => {
      const commentInput = document.querySelector(".comment-input");
      const comment = commentInput.value.trim();

      if (comment) {
        // 댓글 저장 로직 구현
        // ...

        commentInput.value = "";
      }
    });
  }
});

// ESC 키 이벤트는 전역에 한 번만 등록
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal("view-post-modal"); // modalId 전달
  }
});

// DOM이 완전히 로드된 후 이벤트 리스너 초기화
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("view-post-modal");
  if (!modal) return;

  initializeModalEvents();

  // ESC 키 이벤트 리스너 등록
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal("view-post-modal"); // modalId 전달
    }
  });

  // 댓글 등록 버튼 이벤트
  const commentSubmitBtn = document.querySelector(".comment-submit-btn");
  if (commentSubmitBtn) {
    commentSubmitBtn.addEventListener("click", () => {
      const commentInput = document.querySelector(".comment-input");
      const comment = commentInput.value.trim();

      if (comment) {
        // 댓글 저장 로직 구현
        // ...

        commentInput.value = "";
      }
    });
  }
});
