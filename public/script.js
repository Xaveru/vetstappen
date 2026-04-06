document.addEventListener('DOMContentLoaded', () => {
  const resetSearchButton = document.getElementById('reset-search');
  if (resetSearchButton) {
    resetSearchButton.addEventListener('click', () => {
      window.location.href = '/appointments';
    });
  }

  const avatarInput = document.getElementById('profile-avatar');
  const avatarPreview = document.getElementById('profile-avatar-preview');
  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener('change', () => {
      const [file] = avatarInput.files || [];
      if (!file) return;

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        window.alert('Please upload a JPG, PNG, GIF, or WEBP image only.');
        avatarInput.value = '';
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        window.alert('Please choose an avatar smaller than 2 MB.');
        avatarInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        avatarPreview.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const bookDialog = document.getElementById('book-dialog');
  const bookForm = document.getElementById('book-slot-form');
  const bookSlotId = document.getElementById('book-slot-id');
  const bookSlotSummary = document.getElementById('book-slot-summary');
  const bookOwnerName = document.getElementById('book-owner-name');
  const bookOwnerEmail = document.getElementById('book-owner-email');
  const anonymousFields = document.getElementById('anonymous-booking-fields');
  const bookCancel = document.getElementById('book-cancel');
  const bookingModeInputs = Array.from(document.querySelectorAll('input[name="bookingMode"]'));

  const toggleAnonymousFields = () => {
    if (!anonymousFields) return;

    const selectedMode = bookingModeInputs.find((input) => input.checked)?.value || 'anonymous';
    const useAnonymousFields = selectedMode === 'anonymous';
    anonymousFields.classList.toggle('hidden', !useAnonymousFields);

    if (bookOwnerName) bookOwnerName.required = useAnonymousFields;
    if (bookOwnerEmail) bookOwnerEmail.required = useAnonymousFields;
  };

  bookingModeInputs.forEach((input) => input.addEventListener('change', toggleAnonymousFields));
  toggleAnonymousFields();

  if (bookDialog && bookForm && bookSlotId && bookSlotSummary) {
    document.querySelectorAll('.book-trigger').forEach((button) => {
      button.addEventListener('click', () => {
        bookSlotId.value = button.dataset.slotId || '';
        bookSlotSummary.textContent = button.dataset.slotSummary || 'Selected slot';

        if (bookOwnerName && !bookOwnerName.value) {
          bookOwnerName.value = button.dataset.accountName || '';
        }
        if (bookOwnerEmail && !bookOwnerEmail.value) {
          bookOwnerEmail.value = button.dataset.accountEmail || '';
        }

        toggleAnonymousFields();

        if (typeof bookDialog.showModal === 'function') {
          bookDialog.showModal();
        } else {
          bookDialog.setAttribute('open', 'open');
        }
      });
    });
  }

  if (bookCancel && bookDialog) {
    bookCancel.addEventListener('click', () => {
      if (typeof bookDialog.close === 'function') {
        bookDialog.close();
      } else {
        bookDialog.removeAttribute('open');
      }
    });
  }

  if (bookForm) {
    bookForm.addEventListener('submit', (event) => {
      const selectedMode = bookingModeInputs.find((input) => input.checked)?.value || bookForm.querySelector('input[name="bookingMode"]')?.value || 'anonymous';
      if (selectedMode === 'anonymous') {
        if (bookOwnerName && !bookOwnerName.value.trim()) {
          event.preventDefault();
          window.alert('Anonymous bookings require the owner name.');
          bookOwnerName.focus();
          return;
        }

        if (bookOwnerEmail && !bookOwnerEmail.value.trim()) {
          event.preventDefault();
          window.alert('Anonymous bookings require an email address.');
          bookOwnerEmail.focus();
        }
      }
    });
  }

  const editDialog = document.getElementById('edit-dialog');
  const editForm = document.getElementById('edit-form');
  const editCancel = document.getElementById('edit-cancel');
  const editDate = document.getElementById('edit-date');
  const editTime = document.getElementById('edit-time');
  const editService = document.getElementById('edit-service');
  const editLookupEmail = document.getElementById('edit-lookup-email');
  const editLookupReference = document.getElementById('edit-lookup-reference');

  if (editDialog && editForm) {
    document.querySelectorAll('.edit-trigger').forEach((button) => {
      button.addEventListener('click', () => {
        editForm.action = button.dataset.editPath || '/reservations';
        if (editDate) editDate.value = button.dataset.date || '';
        if (editTime) editTime.value = button.dataset.time || '';
        if (editService) editService.value = button.dataset.service || '';
        if (editLookupEmail) editLookupEmail.value = button.dataset.lookupEmail || '';
        if (editLookupReference) editLookupReference.value = button.dataset.lookupReference || '';

        if (typeof editDialog.showModal === 'function') {
          editDialog.showModal();
        } else {
          editDialog.setAttribute('open', 'open');
        }
      });
    });
  }

  if (editCancel && editDialog) {
    editCancel.addEventListener('click', () => {
      if (typeof editDialog.close === 'function') {
        editDialog.close();
      } else {
        editDialog.removeAttribute('open');
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    const passwordInput = registerForm.querySelector('input[name="password"]');
    const confirmInput = registerForm.querySelector('input[name="confirm"]');
    const syncRegisterValidation = () => {
      if (!passwordInput || !confirmInput) return;
      if (confirmInput.value && passwordInput.value !== confirmInput.value) {
        confirmInput.setCustomValidity('Passwords do not match.');
      } else {
        confirmInput.setCustomValidity('');
      }
    };

    passwordInput?.addEventListener('input', syncRegisterValidation);
    confirmInput?.addEventListener('input', syncRegisterValidation);
  }

  const deleteInput = document.getElementById('confirm-delete');
  if (deleteInput) {
    deleteInput.addEventListener('input', () => {
      if (deleteInput.value !== 'DELETE') {
        deleteInput.setCustomValidity('Type DELETE exactly to confirm.');
      } else {
        deleteInput.setCustomValidity('');
      }
    });
  }
});
