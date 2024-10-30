document.addEventListener("DOMContentLoaded", () => {
  const postForm = document.getElementById("post-form");
  const postSection = document.getElementById("post-section");
  const taxTagsSection = document.getElementById("tax-tags-section");
  const taxTags = document.querySelectorAll(".tax-tag");
  let selectedTag = null;

  // 게시판 선택 시 태그 섹션 표시/숨김
  postSection.addEventListener("change", (e) => {
    if (e.target.value === "tax-question-search") {
      taxTagsSection.style.display = "block";
    } else {
      taxTagsSection.style.display = "none";
      selectedTag = null;
      taxTags.forEach((tag) => tag.classList.remove("selected"));
    }

    // 자료실 선택 시 파일 업로드 필드 표시
    if (e.target.value === "data-room") {
      document.getElementById("post-file").style.display = "block";
    } else {
      document.getElementById("post-file").style.display = "none";
    }
  });

  // 태그 선택 이벤트
  tagButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tagButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedTag = button.textContent.trim(); // textContent로 변경하고 trim() 추가
    });
  });

  // 게시글 등록
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const section = postSection.value;
    const title = document.getElementById("post-title").value.trim();
    const content = document.getElementById("post-content").value.trim();
    const imageInput = document.getElementById("post-image");
    const fileInput = document.getElementById("post-file");

    // 유효성 검사
    if (!section || !title || !content) {
      Swal.fire({
        title: "입력 오류",
        text: "모든 필수 항목을 입력해주세요.",
        icon: "warning",
        confirmButtonText: "확인",
        confirmButtonColor: "#007AFF",
      });
      return;
    }

    if (section === "tax-question-search" && !selectedTag) {
      Swal.fire({
        title: "태그 선택 필요",
        text: "세법 태그를 선택해주세요.",
        icon: "warning",
        confirmButtonText: "확인",
        confirmButtonColor: "#007AFF",
      });
      return;
    }

    try {
      // 이미지 처리
      let imageData = null;
      if (imageInput.files && imageInput.files[0]) {
        imageData = await readFileAsDataURL(imageInput.files[0]);
      }

      // 파일 처리 (자료실 전용)
      let fileData = null;
      if (section === "data-room" && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_FILE_SIZE) {
          Swal.fire({
            title: "파일 크기 초과",
            text: "파일 크기가 제한을 초과했습니다 (10MB).",
            icon: "error",
            confirmButtonText: "확인",
            confirmButtonColor: "#007AFF",
          });
          return;
        }
        fileData = await readFileAsDataURL(file);
      }

      // 게시글 생성
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const post = {
        title,
        content,
        timestamp: Date.now(),
        date: formattedDate,
        comments: [],
        image: imageData,
        file: fileData,
        tag: selectedTag,
      };

      // 게시글 저장
      if (!postsData[section]) {
        postsData[section] = [];
      }
      postsData[section].push(post);
      savePostsData(postsData);

      // 페이지네이션 초기화
      paginationData[section] = 1;
      savePaginationData(paginationData);

      // 성공 메시지 표시 후 해당 섹션으로 이동
      Swal.fire({
        title: "게시글 등록 완료",
        text: "게시글이 성공적으로 등록되었습니다.",
        icon: "success",
        confirmButtonText: "확인",
        confirmButtonColor: "#007AFF",
      }).then(() => {
        window.location.href = `index.html#${section}`;
      });
    } catch (error) {
      console.error("게시글 등록 중 오류 발생:", error);
      Swal.fire({
        title: "오류 발생",
        text: "게시글 등록 중 오류가 발생했습니다.",
        icon: "error",
        confirmButtonText: "확인",
        confirmButtonColor: "#007AFF",
      });
    }
  });
});

// 파일을 DataURL로 읽는 유틸리티 함수
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("파일 읽기 실패"));
    reader.readAsDataURL(file);
  });
}
