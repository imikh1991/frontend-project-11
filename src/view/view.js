/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from '../i18n.js';
import fetchXMLContent from '../utils/fetch.js';
// import parser from './parser.js';
// пробуем завести
// import getFeedAndPostsParsed from '../utils/parser.js';
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
  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  const link = document.createElement('a');
  link.classList.add('fw-bold');
  link.setAttribute('href', posts.link);
  link.textContent = posts.title;
  elements.postsContainer.querySelector('ul').append(liEl);
  liEl.append(link);
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
      console.log('xmlContent>>>>>', xmlContent);
      // updatePosts
      xmlContent
        .then(({ data }) => {
          const response = new DOMParser();
          const xmlDocument = response.parseFromString(data.contents, 'application/xml');
          if (!xmlDocument.querySelector('channel')) {
            watchedState.isValid = false;
            watchedState.error = 'notValidRSS';
          }
          // # TO DO REFACTOR
          /*
          const [feed, posts] = getFeedAndPosts(data.contents);
            const parser = new DOMParser();
            const feed = parser.parseFromString(data, 'application/xml').querySelector('rss');

            if (!feed) {
              console.log('Parser Error!');
              throw new Error('notRSS');
              }
              */
          const feed = {
            id: watchedState.feeds.length + 1,
            title: xmlDocument.querySelector('title').textContent,
            description: xmlDocument.querySelector('description').textContent,
          };
          watchedState.feeds.push(feed);

          const items = xmlDocument.querySelectorAll('item');
          items.forEach((item) => {
            const post = {
              id: feed.id,
              title: item.querySelector('title').textContent,
              link: item.querySelector('link').nextSibling.textContent,
            };
            watchedState.posts.push(post);
          });

          watchedState.status = 'parsing';
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
