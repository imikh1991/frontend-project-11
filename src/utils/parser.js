const parse = (data) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, 'application/xml');
  console.log(xmlDoc);

  const title = xmlDoc.querySelector('channel > title').textContent.trim();
  const description = xmlDoc.querySelector('channel > description').textContent.trim();
  const items = xmlDoc.querySelectorAll('item');

  const posts = Array
    .from(items)
    .reduce((acc, item) => {
      const titlePost = item.querySelector('title').textContent.trim();
      const descriptionPost = item.querySelector('description').textContent.trim();
      const url = item.querySelector('link').textContent.trim();

      const post = { title: titlePost, description: descriptionPost, url };
      return [...acc, post];
    }, []);

  const feed = { title, description };
  return { feed, posts };
};

export default (res) => {
  const { contents } = res.data;
  try {
    return parse(contents);
  } catch (err) {
    err.name = 'notValidRSS';
    throw err;
  }
};
