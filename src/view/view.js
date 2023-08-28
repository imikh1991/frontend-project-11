/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import onChange from 'on-change';
// eslint-disable-next-line import/no-extraneous-dependencies
import _ from 'lodash';
import i18next from '../i18n.js';
import fetchXMLContent from '../utils/fetch.js';
// пробуем завести нужно обновлять посты
import getFeedAndPostsParsed from '../utils/parser.js';
// TO DO TOMORROW
// import updatePosts from '../utils/updater.js';

const handleValid = (elements, validationState) => {
  if (validationState) {
    elements.feedBack.textContent = i18next.t('success');
    elements.feedBack.classList.replace('text-danger', 'text-success');
    elements.inputField.classList.remove('is-invalid');
    elements.inputField.focus();
    elements.inputField.value = '';
  }
};

const handleError = (elements, errorState) => {
  if (errorState.length > 0) {
    elements.feedBack.textContent = i18next.t(errorState);
    elements.feedBack.classList.replace('text-success', 'text-danger');
    elements.inputField.classList.add('is-invalid');
  }
};

const renderFeeds = (elements, feed) => {
  if (!elements.feedsContainer.querySelector('.card')) {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    elements.feedsContainer.append(card);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    card.append(cardBody);
    const h2El = document.createElement('h2');
    h2El.classList.add('card-title', 'h4');
    h2El.textContent = 'Фиды';
    cardBody.append(h2El);
    const ulEl = document.createElement('ul');
    ulEl.classList.add('list-group', 'border-0', 'rounded-0');
    card.append(ulEl);
  }
  const { title } = feed;
  const { description } = feed;
  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
  elements.feedsContainer.querySelector('ul').prepend(liEl);
  const hEl = document.createElement('h3');
  hEl.classList.add('h6', 'm-0');
  hEl.textContent = title;
  const pEl = document.createElement('p');
  pEl.classList.add('m-0', 'small', 'text-black-50');
  pEl.textContent = description;
  liEl.append(hEl);
  liEl.append(pEl);
};

const renderPosts = (elements, posts) => {
  if (!elements.postsContainer.querySelector('.card')) {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    elements.postsContainer.append(card);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    card.append(cardBody);
    const h2El = document.createElement('h2');
    h2El.classList.add('card-title', 'h4');
    h2El.textContent = 'Посты';
    cardBody.append(h2El);
    const ulEl = document.createElement('ul');
    ulEl.classList.add('list-group', 'border-0', 'rounded-0');
    card.append(ulEl);
  }

  const ulEl = elements.postsContainer.querySelector('ul');

  posts.forEach((post) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('href', post.link);
    link.textContent = post.title;

    liEl.append(link);
    ulEl.appendChild(liEl);
  });
};

export default () => {
  const state = {
    url: [],
    isValid: null,
    error: '',
    status: 'none',
    feeds: [],
    posts: [],
  };

  const render = (elements) => (path, value) => {
    console.log(path);
    console.log(value);
    switch (path) {
      case 'isValid':
        handleValid(elements, value);
        break;
      case 'error':
        handleError(elements, value);
        break;
      case 'feeds':
        renderFeeds(elements, value[value.length - 1]);
        break;
      case 'posts':
        renderPosts(elements, value[value.length - 1]);
      // eslint-disable-next-line no-fallthrough
      default:
        break;
    }
  };

  const elements = {
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    inputForm: document.querySelector('.rss-form'),
    inputField: document.querySelector('#url-input'),
    feedBack: document.querySelector('.feedback'),
  };

  const watchedState = onChange(state, render(elements));

  const schema = yup.string().required()
    .url('invalidUrl')
    .notOneOf([watchedState.url], 'existingUrl');

  elements.inputForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get('url');
    // валидируем
    try {
      await schema.validate(url);
      // проверим дубликаты в списке
      // TO DO доделать отправку - по submit все равно отправляет
      if (watchedState.url.includes(url)) {
        watchedState.isValid = false;
        watchedState.error = i18next.t('existingUrl');
      } else {
        watchedState.isValid = true;
        watchedState.url.push(url);
        watchedState.error = '';
      }

      const xmlContent = fetchXMLContent(url);
      // fetched content- fulfilled -> needs to be parsed
      xmlContent
        .then(({ data }) => {
          const [feed, posts] = getFeedAndPostsParsed(data.contents);
          const newFeed = { ...feed, id: _.uniqueId(), url };
          const newPosts = posts.map((post) => ({ ...post, id: _.uniqueId(), feedId: newFeed.id }));
          watchedState.feeds.push(newFeed);
          // ATTENTION! REFACTOR THIS SHIT
          // PLEASE :)
          watchedState.posts.push(newPosts);
          watchedState.status = 'success';
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } catch (error) {
      watchedState.isValid = false;
      watchedState.error = error.message;
    }
  });
};
