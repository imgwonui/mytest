// 댓글 관리 기능

// 댓글 삭제 (관리자 전용 기능일 경우 추가)
function deleteComment(section, postIndex, commentIndex) {
  if (confirm("이 댓글을 삭제하시겠습니까?")) {
    postsData[section][postIndex].comments.splice(commentIndex, 1);
    savePostsData(postsData);
    loadPostDetails(); // 댓글 목록 다시 로드
  }
}

function renderComment(comment) {
  const commentElement = document.createElement('div');
  commentElement.className = 'modal-comment-item';
  
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
  const deleteBtn = commentElement.querySelector('.modal-comment-delete');
  deleteBtn.addEventListener('click', () => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      commentElement.remove();
      // 여기에 댓글 삭제 API 호출 로직 추가
    }
  });
  
  return commentElement;
}