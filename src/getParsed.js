import axios from 'axios';

const processFeedItems = (feedItems) => feedItems.map((item) => ({
  title: item.querySelector('title').textContent,
  itemDescription: item.querySelector('description').textContent,
  link: item.querySelector('link').textContent,
}));

const getParsedData = async (url) => {
  try {
    const response = await axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`);
    const xml = response.data;

    console.log('xml>>>>>', xml);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml'); // Parse as text/xml

    const feed = xmlDoc.querySelector('rss');

    if (!feed) {
      console.log('Parser Error!');
      throw new Error('notRSS');
    }

    const channelName = feed.querySelector('channel > title').textContent;
    const description = feed.querySelector('description');

    const feedItemElements = [...feed.querySelectorAll('item')];
    const feedItems = processFeedItems(feedItemElements);

    return { channelName, content: { feedItems, description } };
  } catch (error) {
    throw new Error('Error fetching and parsing RSS feed:', error);
  }
};

export default getParsedData;
