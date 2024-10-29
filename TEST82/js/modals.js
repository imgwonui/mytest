// modals.js

// 모달 열기 공통 함수
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// 모달 닫기 공통 함수
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// 모달 초기화 공통 함수
function setupModalClose(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // 이미 이벤트 리스너가 설정되어 있다면 추가하지 않음
  if (modal.dataset.initialized === 'true') return;
  
  const closeButton = modal.querySelector('.close-button');
  if (closeButton) {
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal(modalId);
    });
  }

  // 모달 외부 클릭 시 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modalId);
    }
  });

  // 모달 내부 클릭 시 이벤트 전파 중단
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // 초기화 완료 표시
  modal.dataset.initialized = 'true';
}

// ESC 키로 모달 닫기 이벤트
function setupEscapeKeyClose() {
  // 이미 이벤트 리스너가 설정되어 있다면 추가하지 않음
  if (document.body.dataset.escInitialized === 'true') return;
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modals = ['view-post-modal', 'search-results-modal', 'leave-approval-modal'];
      modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && modal.style.display === 'flex') {
          closeModal(modalId);
        }
      });
    }
  });

  // 초기화 완료 표시
  document.body.dataset.escInitialized = 'true';
}

// 모든 모달 초기화
document.addEventListener('DOMContentLoaded', () => {
  const modals = ['view-post-modal', 'search-results-modal', 'leave-approval-modal'];
  modals.forEach(modalId => setupModalClose(modalId));
  setupEscapeKeyClose();
});
