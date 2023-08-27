import axios from 'axios';
// import parser from './parser.js';
// TO DO
// - [ ] Проверка ошибки сети 5 seconds

const fetchXMLContent = (url) => new Promise((resolve, reject) => {
  axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
    .then((response) => {
      resolve(response.data.contents);
    })
    .catch((error) => {
      reject(new Error('Error fetching XML content:', error));
    });
});

export default fetchXMLContent;
