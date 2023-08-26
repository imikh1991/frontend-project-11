import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';

export default () => {
  const state = {
    url: [],
    isValid: true,
    error: '',
  };

  i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: {
        translation: {
          success: 'RSS успешно загружен',
          invalidUrl: 'Ссылка должна быть валидным URL',
          existingUrl: 'RSS уже существует',
        },
      },
    },
  });

  const form = document.querySelector('.rss-form');
  const inputField = document.querySelector('#url-input');
  const feedbackElement = document.querySelector('.feedback');

  const watchedState = onChange(state, (path, value) => {
    console.log(path);
    console.log(value);
    if (watchedState.isValid) {
      feedbackElement.textContent = i18next.t('success');
      feedbackElement.classList.replace('text-danger', 'text-success');
      inputField.classList.remove('is-invalid');
      inputField.focus();
      inputField.value = '';
    } else {
      feedbackElement.textContent = i18next.t(value);
      feedbackElement.classList.replace('text-success', 'text-danger');
      inputField.classList.add('is-invalid');
    }
  });

  const schema = yup.string().required()
    .url('invalidUrl')
    .notOneOf([watchedState.url], 'existingUrl');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const url = formData.get('url');
    try {
      await schema.validate(url);
      watchedState.isValid = true;
      watchedState.url.push(url);
      watchedState.error = '';
    } catch (error) {
      watchedState.isValid = false;
      watchedState.error = error.message;
    }
  });
};
