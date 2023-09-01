/* eslint-disable no-param-reassign */
const renderStatus = (elements, validationState) => {
  console.log(validationState);
  switch (validationState) {
    case 'loading':
      elements.inputButton.disabled = true;
      elements.inputField.disabled = true;
      break;
    case 'success':
      elements.feedBack.textContent = ('RSS успешно загружен');
      elements.feedBack.classList.replace('text-danger', 'text-success');
      elements.inputField.classList.remove('is-invalid', 'text-info');
      elements.inputField.focus();
      elements.inputField.value = '';
      elements.inputButton.disabled = false;
      elements.inputField.disabled = false;

      break;
    case 'awaiting':
      elements.inputButton.disabled = false;
      elements.inputField.disabled = false;
      break;
    default:
      throw new Error(`Incorrect status - ${validationState}!`);
  }
};

export default renderStatus;
