// 게시글 상세 조회 기능

document.addEventListener("DOMContentLoaded", () => {
  loadPostDetails();
});

// 게시글 상세 페이지 로드
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
          commentInput.value = ""; // 입력 필드 초기화
        });
    } else {
      alert("존재하지 않는 게시글입니다.");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "index.html";
  }
}

// 페이지 로드 시 게시글 상세 정보 로드
document.addEventListener("DOMContentLoaded", loadPostDetails);
