const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// helper function 1: generate a random ID
const generateRandomString = (numOfChars) => {
  return Math.random().toString(36).substring(3, numOfChars + 3);
};

// helper function 2: look up an email in users
const lookUpEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

// helper function 3: filter urlDatabse based on userID
const urlsForUser = (id) => {
  const urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {}; // known bug: if the server restarts without the user logging out, users will be empty but the cookie remains, so it's logged in but header can't find user in users

// middleware(s) before any route
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  console.log(urlDatabase);
  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send("You need to login to create shortened URLs.");
  }
  console.log(req.body); // Log the POST request body to the console
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = {"longURL": req.body.longURL, userID: req.cookies["user_id"] };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`);

});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect("/urls");
});


app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("This URL doesn't exist.");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  console.log(longURL);
  if (longURL.startsWith("http://") || longURL.startsWith("https://")) {
    res.redirect(longURL);
  } else {
    res.redirect(`http://${longURL}`);
  }
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // sad path: no email or password
  if (!email || !password) {
    return res.status(400).send("Email/password cannot be empty");
  }

  // sad path: email already resgistered
  if (lookUpEmail(email)) {
    return res.status(400).send("Email already registered, please use a different one.");
  }

  const randomId = generateRandomString(6);
  users[randomId] = {
    id: randomId,
    email: email,
    password: password
  };
  console.log(users);
  res.cookie("user_id", randomId);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  console.log(templateVars.user);
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // sad path 1: empty email or password
  if (!email || !password) {
    return res.status(400).send("Email/password cannot be empty");
  }
  // sad path 2: email doesn't exist
  if (!lookUpEmail(email)) {
    return res.status(403).send("Email doesn't exist.");
  }
  // sad path 3: email and password doesn't match
  if (lookUpEmail(email).password !== password) {
    return res.status(403).send("Invalid password.");
  }
  // happy path
  res.cookie("user_id", lookUpEmail(email).id);
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send("You need to login to view shortened URLs.");
  }
  const templateVars = { urls: urlsForUser(req.cookies["user_id"]), user: users[req.cookies["user_id"]] }; // send the variables inside an object
  res.render("urls_index", templateVars); // don't include /views/... or the file extension ".ejs"
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("This URL doesn't exist.");
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("*", (req, res) => {
  res.send("Oops, this page doesn't exist.");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});