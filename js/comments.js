// 댓글 관리 기능
function initializeDetailComments(post, section) {
  const commentInput = document.querySelector(".comment-input");
  const submitButton = document.querySelector(".comment-submit-btn");
  const commentsList = document.querySelector(".modal-comments-list");

  if (!commentInput || !submitButton) return;

  // 기존 이벤트 리스너 제거
  const newSubmitButton = submitButton.cloneNode(true);
  submitButton.parentNode.replaceChild(newSubmitButton, submitButton);

  const handleSubmit = () => {
    const text = commentInput.value.trim();

    if (!text) {
      Swal.fire({
        icon: "warning",
        text: "댓글 내용을 입력해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    const newComment = {
      author: "admin",
      text: text,
      date: new Date().toLocaleDateString("ko-KR"),
      timestamp: Date.now(),
    };

    // 댓글 배열이 없으면 생성
    if (!post.comments) {
      post.comments = [];
    }

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
  };

  // 이벤트 리스너 등록
  newSubmitButton.addEventListener("click", handleSubmit);
  commentInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  });
}

// 모달용 댓글 렌더링
function renderComment(comment) {
  const commentElement = document.createElement("div");
  commentElement.className = "modal-comment-item";

  commentElement.innerHTML = `
    <div class="modal-comment-profile">
      <img src="group.png" alt="프로필 이미지">
    </div>
    <div class="modal-comment-content">
      <div class="modal-comment-author">${comment.author}</div>
      <div class="modal-comment-date">${comment.date}</div>
      <div class="modal-comment-text">${comment.text}</div>
      <div class="modal-comment-delete">댓글 삭제</div>
    </div>
  `;

  // 댓글 삭제 이벤트 리스너
  const deleteBtn = commentElement.querySelector(".modal-comment-delete");
  deleteBtn.addEventListener("click", () => {
    if (confirm("댓글을 삭제하시겠습니까?")) {
      commentElement.remove();
      deleteComment(comment);
    }
  });

  return commentElement;
}

// 상세 페이지용 댓글 렌더링
function renderDetailComment(comment) {
  const commentElement = document.createElement("div");
  commentElement.className = "modal-comment-item";

  commentElement.innerHTML = `
    <div class="modal-comment-profile">
      <img src="group.png" alt="프로필 이미지">
    </div>
    <div class="modal-comment-content">
      <div class="modal-comment-author">${comment.author}</div>
      <div class="modal-comment-date">${comment.date}</div>
      <div class="modal-comment-text">${comment.text}</div>
      ${
        comment.author === "admin"
          ? '<div class="modal-comment-delete">댓글 삭제</div>'
          : ""
      }
    </div>
  `;

  // 삭제 버튼 이벤트 리스너
  const deleteBtn = commentElement.querySelector(".modal-comment-delete");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      deleteDetailComment(comment);
      commentElement.remove();
    });
  }

  return commentElement;
}

function deleteComment(comment) {
  const currentSection = document.querySelector(
    '.section[style*="display: block"]'
  ).id;
  const postTitle = document.querySelector(".modal-title").textContent;

  const post = postsData[currentSection].find((p) => p.title === postTitle);
  if (post && post.comments) {
    post.comments = post.comments.filter(
      (c) => c.timestamp !== comment.timestamp
    );
    savePostsData(postsData);
  }
}

function deleteDetailComment(comment) {
  const currentSection = document.querySelector(
    '.section[style*="display: block"]'
  ).id;
  const postTitle = document.querySelector(".post-detail-title").textContent;

  const post = postsData[currentSection].find((p) => p.title === postTitle);
  if (post && post.comments) {
    post.comments = post.comments.filter(
      (c) => c.timestamp !== comment.timestamp
    );
    savePostsData(postsData);
  }
}

function loadComments(post) {
  const commentsList = document.querySelector(".modal-comments-list");
  if (!commentsList) return;

  commentsList.innerHTML = "";

  if (post.comments && post.comments.length > 0) {
    post.comments.forEach((comment) => {
      const commentElement = renderComment(comment);
      commentsList.appendChild(commentElement);
    });
  }
}

function loadDetailComments(post) {
  const commentsList = document.querySelector(".modal-comments-list");
  if (!commentsList) return;

  commentsList.innerHTML = "";

  if (post.comments && post.comments.length > 0) {
    post.comments.forEach((comment) => {
      const commentElement = renderDetailComment(comment);
      commentsList.appendChild(commentElement);
    });
  }
}

// DOM이 로드된 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  const currentPost = getCurrentPost();
  if (currentPost) {
    initializeDetailComments(currentPost, getCurrentSection());
  }
});

function getCurrentPost() {
  const currentSection = document.querySelector(
    '.section[style*="display: block"]'
  ).id;
  const postTitle = document.querySelector(".post-detail-title")?.textContent;

  if (currentSection && postTitle) {
    return postsData[currentSection].find((p) => p.title === postTitle);
  }
  return null;
}

function getCurrentSection() {
  return document.querySelector('.section[style*="display: block"]').id;
}
