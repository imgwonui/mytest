// 유틸리티 함수

// 공통 함수: 섹션 이름 가져오기
function getSectionName(sectionId) {
  const sectionNames = {
    notices: "공지사항",
    "tax-question-search": "세법 질문 검색",
    "system-question-search": "시스템 질문 검색",
    "review-method-search": "검토 방법 검색",
    "knowledge-sharing": "지식 공유",
    "data-room": "자료실",
    "leave-applications": "휴가 신청",
    "meeting-room-applications": "회의실 신청",
    suggestions: "건의사항",
    attendance: "출근도장",
    links: "각종 링크",
  };
  return sectionNames[sectionId] || "";
}

// 공통 함수: 액션 버튼 생성
function createActionButton(title, iconClass, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.innerHTML = `<i class="${iconClass}"></i>`;
  button.title = title;
  button.addEventListener("click", onClick);
  return button;
}

// 모달 관련 함수 추가
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
  }
}

// 데이터 저장 및 로드 함수
function savePostsData(data) {
  localStorage.setItem("postsData", JSON.stringify(data));
}

function loadPostsData() {
  const data = localStorage.getItem("postsData");
  return data ? JSON.parse(data) : defaultPostsData;
}

function savePaginationData(data) {
  localStorage.setItem("paginationData", JSON.stringify(data));
}

function loadPaginationData() {
  const data = localStorage.getItem("paginationData");
  return data ? JSON.parse(data) : {};
}

// 전역 변수 초기화
let postsData = loadPostsData();
let paginationData = loadPaginationData();
let selectedTaxTag = "all";
