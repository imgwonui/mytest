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

      // 게시글 작성 션 표시
      const writePostSection = document.getElementById("write-post-section");
      if (writePostSection) {
        writePostSection.style.display = "block";

        // 게시판 선택을 세법 검색으로 자동 설정
        const boardSelect = document.getElementById("board-select");
        if (boardSelect) {
          boardSelect.value = "tax-question-search";

          // 태그 섹션 표시
          const tagSection = document.getElementById("tag-section");
          if (tagSection) {
            tagSection.style.display = "flex";
          }
        }
      }
    });
  }

  // 네비게이션 메뉴 클릭 이벤트 처리 수정
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.getAttribute("data-section");

      if (section) {
        const targetSection = document.getElementById(section);

        // 현재 활성화된 섹션 확인
        const currentActiveSection = document.querySelector(
          ".section[style*='display: block']"
        );

        // 같은 섹션을 클릭한 경우, 해당 섹션의 데이터를 다시 로드
        if (currentActiveSection === targetSection) {
          // 섹션별 데이터 고침
          switch (section) {
            case "suggestions-section":
              renderSuggestionsPosts();
              break;
            case "notices-section":
              renderNoticesPosts();
              break;
            case "data-room-section":
              renderDataRoomPosts();
              break;
            case "knowledge-sharing-section":
              renderKnowledgePosts();
              break;
            case "tax-question-search-section":
              renderTaxQuestionPosts();
              break;
          }
          return;
        }

        // 다른 섹션으로 이동하는 경우
        document.querySelectorAll(".section").forEach((section) => {
          section.style.display = "none";
        });

        if (targetSection) {
          targetSection.style.display = "block";
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

  // 메 아이템 활성

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
      "knowledge-sharing": "지식공유",
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
        alert("댓글 용을 입력해주세요.");
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

// 공통 첨부파일 렌더링 함수
function renderAttachments(attachments, post) {
  if (!attachments) return;

  if (post.file) {
    attachments.style.display = "block";
    const attachmentsList = attachments.querySelector(".attachments-list");
    if (attachmentsList) {
      attachmentsList.innerHTML = "";
      const attachmentElement = createAttachmentElement(post.file);
      attachmentsList.appendChild(attachmentElement);
    }
  } else {
    attachments.style.display = "none";
  }
}

// knowledge-sharing 섹션의 게시글 렌더링을 위한 함수
function renderKnowledgePosts() {
  const postsContainer = document.querySelector(".knowledge-posts");
  const paginationContainer = document.querySelector(".knowledge-pagination");
  if (!postsContainer || !paginationContainer) return;

  postsContainer.innerHTML = "";

  if (!postsData["knowledge-sharing"]) {
    postsData["knowledge-sharing"] = [];
  }

  const posts = postsData["knowledge-sharing"].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  // 페이지네이션 관련 변수
  const POSTS_PER_PAGE = 10;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const currentPage = paginationData["knowledge-sharing"] || 1;

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  paginatedPosts.forEach((post, index) => {
    const actualIndex = startIndex + index;
    const postElement = document.createElement("div");
    postElement.className = "knowledge-post";

    postElement.innerHTML = `
      <span class="knowledge-no">${posts.length - actualIndex}</span>
      <span class="knowledge-title">${post.title}</span>
      <span class="knowledge-time">${new Date(
        post.timestamp
      ).toLocaleDateString()}</span>
    `;

    postElement.addEventListener("click", () => {
      currentSection = "knowledge-sharing-section";
      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
      });

      const detailSection = document.getElementById("post-detail-section");
      if (detailSection) {
        detailSection.style.display = "block";

        const title = detailSection.querySelector(".post-detail-title");
        const date = detailSection.querySelector(".post-date");
        const viewCount = detailSection.querySelector(".view-count");
        const content = detailSection.querySelector(".post-detail-content");
        const attachments = detailSection.querySelector(".post-attachments");

        if (title) title.textContent = post.title;
        if (date)
          date.textContent = new Date(post.timestamp).toLocaleDateString();
        if (viewCount) viewCount.textContent = post.viewCount || 0;
        if (content) content.textContent = post.content;

        renderAttachments(attachments, post);
      }
    });

    postsContainer.appendChild(postElement);
  });

  // 페이지네이션 부분 - createPaginationButtons 함수만 사용
  createPaginationButtons(
    currentPage,
    totalPages,
    paginationContainer,
    (newPage) => {
      paginationData["knowledge-sharing"] = newPage;
      savePaginationData(paginationData);
      renderKnowledgePosts();
    }
  );
}

function renderNoticesPosts() {
  const postsContainer = document.querySelector(".notices-posts");
  const paginationContainer = document.querySelector(".notices-pagination");
  if (!postsContainer || !paginationContainer) return;

  postsContainer.innerHTML = "";

  if (!postsData["notices"]) {
    postsData["notices"] = [];
  }

  const posts = postsData["notices"].sort((a, b) => b.timestamp - a.timestamp);

  // 페이지네이션 관련 변수
  const POSTS_PER_PAGE = 10;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const currentPage = paginationData["notices"] || 1;

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  paginatedPosts.forEach((post, index) => {
    const actualIndex = startIndex + index;
    const postElement = document.createElement("div");
    postElement.className = "notices-post";

    postElement.innerHTML = `
      <span class="notices-no">${posts.length - actualIndex}</span>
      <span class="notices-title">${post.title}</span>
      <span class="notices-time">${new Date(
        post.timestamp
      ).toLocaleDateString()}</span>
    `;

    // 게시글 클릭 이벤트 수정
    postElement.addEventListener("click", () => {
      currentSection = "notices-section"; // 현 섹션 저장
      // 모든 섹션 숨기기
      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
      });

      // 상세 페이지 섹션 표시
      const detailSection = document.getElementById("post-detail-section");
      if (detailSection) {
        detailSection.style.display = "block";

        // 게시글 상세 내용 표시
        const title = detailSection.querySelector(".post-detail-title");
        const date = detailSection.querySelector(".post-date");
        const viewCount = detailSection.querySelector(".view-count");
        const content = detailSection.querySelector(".post-detail-content");
        const attachments = detailSection.querySelector(".post-attachments");

        if (title) title.textContent = post.title;
        if (date)
          date.textContent = new Date(post.timestamp).toLocaleDateString();
        if (viewCount) viewCount.textContent = post.viewCount || 0;
        if (content) content.textContent = post.content;

        renderAttachments(attachments, post);
      }
    });
    postsContainer.appendChild(postElement);
  });

  // 페이지네이션 버튼 업데이트
  const prevBtn = paginationContainer.querySelector(".prev-btn");
  const nextBtn = paginationContainer.querySelector(".next-btn");

  if (prevBtn && nextBtn) {
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    prevBtn.onclick = () => {
      if (currentPage > 1) {
        paginationData["notices"] = currentPage - 1;
        renderNoticesPosts();
      }
    };

    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        paginationData["notices"] = currentPage + 1;
        renderNoticesPosts();
      }
    };
  }

  // 페이지네이션 부분만 수정
  createPaginationButtons(
    currentPage,
    totalPages,
    paginationContainer,
    (newPage) => {
      paginationData["notices"] = newPage;
      savePaginationData(paginationData);
      renderNoticesPosts();
    }
  );
}

// 자실 게시글 렌더링
function renderDataRoomPosts() {
  const postsContainer = document.querySelector(".data-room-posts");
  const paginationContainer = document.querySelector(".data-room-pagination");
  if (!postsContainer || !paginationContainer) return;

  postsContainer.innerHTML = "";

  if (!postsData["data-room"]) {
    postsData["data-room"] = [];
  }

  const posts = postsData["data-room"].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  // 페이지네이션 관련 변수
  const POSTS_PER_PAGE = 10;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const currentPage = paginationData["data-room"] || 1;

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  paginatedPosts.forEach((post, index) => {
    const actualIndex = startIndex + index;
    const postElement = document.createElement("div");
    postElement.className = "data-room-post";

    postElement.innerHTML = `
      <span class="data-room-no">${posts.length - actualIndex}</span>
      <span class="data-room-title">${post.title}</span>
      <span class="data-room-time">${new Date(
        post.timestamp
      ).toLocaleDateString()}</span>
    `;

    postElement.addEventListener("click", () => {
      currentSection = "data-room-section";
      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
      });

      const detailSection = document.getElementById("post-detail-section");
      if (detailSection) {
        detailSection.style.display = "block";

        const title = detailSection.querySelector(".post-detail-title");
        const date = detailSection.querySelector(".post-date");
        const viewCount = detailSection.querySelector(".view-count");
        const content = detailSection.querySelector(".post-detail-content");
        const attachments = detailSection.querySelector(".post-attachments");

        if (title) title.textContent = post.title;
        if (date)
          date.textContent = new Date(post.timestamp).toLocaleDateString();
        if (viewCount) viewCount.textContent = post.viewCount || 0;
        if (content) content.textContent = post.content;

        renderAttachments(attachments, post);
      }
    });

    postsContainer.appendChild(postElement);
  });

  // 페이지네이션 버튼 업데이트
  const prevBtn = paginationContainer.querySelector(".prev-btn");
  const nextBtn = paginationContainer.querySelector(".next-btn");

  if (prevBtn && nextBtn) {
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    prevBtn.onclick = () => {
      if (currentPage > 1) {
        paginationData["data-room"] = currentPage - 1;
        savePaginationData(paginationData);
        renderDataRoomPosts();
      }
    };

    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        paginationData["data-room"] = currentPage + 1;
        savePaginationData(paginationData);
        renderDataRoomPosts();
      }
    };
  }

  // 페이지네이션 부분만 수정
  createPaginationButtons(
    currentPage,
    totalPages,
    paginationContainer,
    (newPage) => {
      paginationData["data-room"] = newPage;
      savePaginationData(paginationData);
      renderDataRoomPosts();
    }
  );
}

function loadPostDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get("section");
  const index = parseInt(urlParams.get("index"), 10);

  if (section && !isNaN(index)) {
    const post = postsData[section][index];
    if (post) {
      document.getElementById("view-post-title").textContent = post.title;
      document.getElementById(
        "view-post-date"
      ).textContent = `작성일: ${post.date}`;
      document.getElementById("view-post-content").innerHTML =
        post.content.replace(/\n/g, "<br>");

      const img = document.getElementById("view-post-image");
      if (post.image) {
        img.src = post.image;
        img.style.display = "block";
      } else {
        img.style.display = "none";
      }

      // 댓글 로드
      const commentsList = document.getElementById("view-comments-list");
      commentsList.innerHTML = "";
      post.comments.forEach((comment) => {
        const commentDiv = document.createElement("div");
        commentDiv.className = "comment";
        commentDiv.innerHTML = `<p>${comment.content}</p><small>${comment.date}</small>`;
        commentsList.appendChild(commentDiv);
      });

      // 댓글 추가 버튼 설정
      document
        .getElementById("add-comment-button")
        .addEventListener("click", () => {
          const commentInput = document.getElementById("comment-input");
          const content = commentInput.value.trim();
          if (content === "") {
            alert("댓글 내용을 입력해주세요.");
            return;
          }

          const now = new Date();
          const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

          const newComment = {
            content,
            date: formattedDate,
          };

          postsData[section][index].comments.push(newComment);
          savePostsData(postsData);
          loadPostDetails(); // 댓글 목록 다시 로드
          commentInput.value = ""; // 입력 드 초기화
        });
    } else {
      alert("존재하지 않는 게시글입니다.");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "index.html";
  }
}

// DOM이 로드된 후 행
document.addEventListener("DOMContentLoaded", () => {
  const backToListBtn = document.getElementById("backToListBtn");
  if (backToListBtn) {
    backToListBtn.addEventListener("click", () => {
      // 모든 섹션 숨기기
      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
      });

      // URL의 해시값을 확인하여 이전 섹션 결정
      const hash = window.location.hash.slice(1);
      let targetSectionId;

      // 해시값이 있으면 해당 섹션으로, 없으면 notices 섹션으로
      if (hash && document.getElementById(hash)) {
        targetSectionId = hash;
      } else {
        targetSectionId = "notices-section";
      }

      // 해당 섹션 표시
      const targetSection = document.getElementById(targetSectionId);
      if (targetSection) {
        targetSection.style.display = "block";
      }

      // 게시글 상세 섹션 숨기기
      const postDetailSection = document.getElementById("post-detail-section");
      if (postDetailSection) {
        postDetailSection.style.display = "none";
      }
    });
  }
});

function createAttachmentElement(file) {
  const attachmentDiv = document.createElement("div");
  attachmentDiv.className = "attachment-item";

  const fileNameSpan = document.createElement("span");
  fileNameSpan.className = "attachment-name";
  fileNameSpan.textContent = file.name;

  const downloadButton = document.createElement("button");
  downloadButton.className = "download-icon";
  downloadButton.innerHTML = '<img src="download2.png" alt="다운로드">';

  downloadButton.addEventListener("click", (e) => {
    e.stopPropagation();
    downloadFile(file);
  });

  attachmentDiv.appendChild(fileNameSpan);
  attachmentDiv.appendChild(downloadButton);

  return attachmentDiv;
}

function downloadFile(file) {
  // Base64 데이터를 Blob으로 변환
  const byteString = atob(file.data.split(",")[1]);
  const mimeString = file.data.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: mimeString });
  const url = window.URL.createObjectURL(blob);

  // 다운로드 링크 생성 및 클릭
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// posts.js 파일의 게시글 상세 보기 부분 수정
function showPostDetail(post, section) {
  document.querySelectorAll(".section").forEach((s) => {
    s.style.display = "none";
  });

  const detailSection = document.getElementById("post-detail-section");
  detailSection.style.display = "block";

  // 게시글 내용 표시
  detailSection.querySelector(".post-detail-title").textContent = post.title;
  detailSection.querySelector(".post-date").textContent = new Date(
    post.timestamp
  ).toLocaleDateString();
  detailSection.querySelector(".view-count").textContent = post.viewCount || 0;
  detailSection.querySelector(".post-detail-content").textContent =
    post.content;

  // 첨부파일 처리
  const attachments = detailSection.querySelector(".post-attachments");
  if (post.file) {
    attachments.style.display = "block";
    renderAttachments(attachments, post);
  } else {
    attachments.style.display = "none";
  }

  // 댓글 목록 초기화 및 표시
  const commentsList = detailSection.querySelector(".modal-comments-list");
  commentsList.innerHTML = "";

  if (post.comments && post.comments.length > 0) {
    post.comments.forEach((comment) => {
      const commentElement = renderDetailComment(comment);
      commentsList.appendChild(commentElement);
    });
  }

  // 댓글 입력 이벤트 설정
  const commentInput = detailSection.querySelector(".comment-input");
  const commentSubmitBtn = detailSection.querySelector(".comment-submit-btn");

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
        author: "user",
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
      const postIndex = postsData[section].findIndex(
        (p) => p.title === post.title && p.timestamp === post.timestamp
      );

      if (postIndex !== -1) {
        postsData[section][postIndex] = post;
        savePostsData(postsData);

        // 새 댓글 렌더링
        const commentElement = renderComment(newComment);
        commentsList.appendChild(commentElement);

        // 입력창 초기화
        commentInput.value = "";
      }
      // 댓글 입력 초기화
      initializeDetailComments(post, section);
    });
  }
}

function renderSectionPosts(section) {
  const postsContainer = document.getElementById(`${section}-posts`);
  const emptyMessage = document.getElementById(`${section}-empty`);
  const paginationContainer = document.getElementById(`${section}-pagination`);

  if (!postsContainer || !emptyMessage || !paginationContainer) return;

  postsContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  let postsToRender = postsData[section] || [];

  if (postsToRender.length === 0) {
    emptyMessage.style.display = "block";
    return;
  } else {
    emptyMessage.style.display = "none";
  }

  // 게시글을 최신순으로 정렬
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
    postDiv.className = `${section}-post`;
    // 스타일 및 내용 추가
    // 예시:
    postDiv.innerHTML = `
      <span class="${section}-no">#${sortedPosts.length - actualIndex}</span>
      <span class="${section}-title">${post.title}</span>
      <span class="${section}-time">${new Date(
      post.timestamp
    ).toLocaleDateString()}</span>
    `;

    postDiv.addEventListener("click", () => {
      showPost({
        ...post,
        board: section,
      });
    });

    postsContainer.appendChild(postDiv);
  });

  // 페이지네이션 처리
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      if (i === currentPage) {
        pageButton.disabled = true;
      }
      pageButton.addEventListener("click", () => {
        setPage(section, i);
        renderSectionPosts(section);
      });
      paginationContainer.appendChild(pageButton);
    }
  }
}

// 공통 페이지네이션 컴포넌트 생성 함수
function createPaginationButtons(
  currentPage,
  totalPages,
  paginationContainer,
  onPageChange
) {
  // 기존 페이지네이션 버튼들 초기화
  const prevBtn = paginationContainer.querySelector(".prev-btn");
  const nextBtn = paginationContainer.querySelector(".next-btn");

  // 기존 페이지 번호들 제거
  const oldPageNumbers = paginationContainer.querySelector(".page-numbers");
  if (oldPageNumbers) {
    oldPageNumbers.remove();
  }

  // 페이지 번호 컨테이너 생성
  const pageNumbers = document.createElement("div");
  pageNumbers.className = "pagination"; // page-numbers 대신 pagination 클래스 사용

  // 이전 버튼을 페이지 번호 컨테이너에 추가
  if (prevBtn) {
    pageNumbers.appendChild(prevBtn);
  }

  // 페이지 번호 버튼 생성
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    if (i === currentPage) {
      pageBtn.classList.add("active");
    }
    pageBtn.addEventListener("click", () => onPageChange(i));
    pageNumbers.appendChild(pageBtn);
  }

  // 다음 버튼을 페이지 번호 컨테이너에 추가
  if (nextBtn) {
    pageNumbers.appendChild(nextBtn);
  }

  // 이전/다음 버튼 상태 업데이트
  if (prevBtn && nextBtn) {
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // 이전 버튼 클릭 이벤트
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    };

    // 다음 버튼 클릭 이벤트
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    };
  }

  // 기존 컨테이너의 내용을 모두 지우고 새로운 페이지네이션 추가
  paginationContainer.innerHTML = "";
  paginationContainer.appendChild(pageNumbers);
}
