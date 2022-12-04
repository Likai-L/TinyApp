// helper function 1: generate a random ID
const generateRandomString = (numOfChars) => {
  return Math.random().toString(36).substring(3, numOfChars + 3);
};

// helper function 2: look up an email in users
const lookUpEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

// helper function 3: filter urlDatabse based on userID
const urlsForUser = (id, database) => {
  const urls = {};
  for (let url in database) {
    if (database[url].userID === id) {
      urls[url] = database[url];
    }
  }
  return urls;
};

module.exports = { generateRandomString, lookUpEmail, urlsForUser };