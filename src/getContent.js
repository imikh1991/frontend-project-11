import axios from 'axios';

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
