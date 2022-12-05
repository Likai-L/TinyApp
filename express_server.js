const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const methodOverride = require("method-override");
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers");

const urlDatabase = {};

const users = {};
// known bug: if the server restarts without the user logging out,
// the users database will be emptied but the cookies remain in the browser,
// so the user is logged in with old data, routes deem it logged in since cookies are present,
// the header deems it not logged in since the old user data is gone and the user object it receives is undefined.
// result: no logout button is shown so users cannot logout unless manually clearing cookies,
// if new urls are created in this state, their owners will be old users that can't be found in the users database

// middleware(s) before any route
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: "session",
  keys: ["spookyKey"]
}));

// put this before get /urls/:id so "new" isn't identified as a parameter
app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.userId]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const templateVars = {
      user: users[req.session.userId],
      message: "This URL doesn't exist."
    };
    return res.status(404).render("error", templateVars);
  }
  if (!req.session.userId) {
    const templateVars = {
      user: users[req.session.userId],
      message: "You need to login to view this URL."
    };
    return res.status(401).render("error", templateVars);
  }
  if (req.session.userId !== urlDatabase[req.params.id].userID) {
    const templateVars = {
      user: users[req.session.userId],
      message: "You cannot view a URL that doesn't belong to you."
    };
    return res.status(401).render("error", templateVars);
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.userId] };
  res.render("urls_show", templateVars);
});

app.put("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const templateVars = {
      user: users[req.session.userId],
      message: "This URL doesn't exist."
    };
    return res.status(404).render("error", templateVars);
  }
  if (!req.session.userId) {
    const templateVars = {
      user: users[req.session.userId],
      message: "You need to login to edit URLs."
    };
    return res.status(401).render("error", templateVars);
  }
  if (req.session.userId !== urlDatabase[req.params.id].userID) {
    const templateVars = {
      user: users[req.session.userId],
      message: "You cannot edit a URL that doesn't belong to you."
    };
    return res.status(401).render("error", templateVars);
  }
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect("/urls");
});

app.delete("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const templateVars = {
      user: users[req.session.userId],
      message: "This URL doesn't exist."
    };
    return res.status(404).render("error", templateVars);
  }
  if (!req.session.userId) {
    const templateVars = {
      user: users[req.session.userId],
      message: "You need to login to delete URLs."
    };
    return res.status(401).render("error", templateVars);
  }
  if (req.session.userId !== urlDatabase[req.params.id].userID) {
    const templateVars = {
      user: users[req.session.userId],
      message: "You cannot delete a URL that doesn't belong to you."
    };
    return res.status(401).render("error", templateVars);
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const templateVars = {
      user: users[req.session.userId],
      message: "This URL doesn't exist."
    };
    return res.status(404).render("error", templateVars);
  }
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL.startsWith("http://") || longURL.startsWith("https://")) {
    res.redirect(longURL);
  } else {
    res.redirect(`http://${longURL}`);
  }
});

app.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.userId] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  // sad path: no email or password
  if (!email || !password) {
    const templateVars = {
      user: users[req.session.userId],
      message: "Email/password cannot be empty."
    };
    return res.status(400).render("error", templateVars);
  }
  // sad path: email already resgistered
  if (getUserByEmail(email, users)) {
    const templateVars = {
      user: users[req.session.userId],
      message: "Email already registered. Please use another one."
    };
    return res.status(400).render("error", templateVars);
  }

  const randomId = generateRandomString(6);
  users[randomId] = {
    id: randomId,
    email: email,
    hashedPassword: hashedPassword
  };
  req.session.userId = randomId;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.userId] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // sad path 1: empty email or password
  if (!email || !password) {
    const templateVars = {
      user: users[req.session.userId],
      message: "Email/password cannot be empty."
    };
    return res.status(400).render("error", templateVars);
  }
  // sad path 2: email doesn't exist
  if (!getUserByEmail(email, users)) {
    const templateVars = {
      user: users[req.session.userId],
      message: "Email doesn't exist."
    };
    return res.status(403).render("error", templateVars);
  }
  // sad path 3: email and password doesn't match
  if (!bcrypt.compareSync(password, getUserByEmail(email, users).hashedPassword)) {
    const templateVars = {
      user: users[req.session.userId],
      message: "Incorrect password."
    };
    return res.status(403).render("error", templateVars);
  }
  // happy path
  req.session.userId = getUserByEmail(email, users).id;
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  if (!req.session.userId) {
    const templateVars = {
      user: users[req.session.userId],
      message: "You need to login to view URLs."
    };
    return res.status(401).render("error", templateVars);
  }
  const templateVars = { urls: urlsForUser(req.session.userId, urlDatabase), user: users[req.session.userId] }; // send the variables inside an object
  res.render("urls_index", templateVars); // don't include /views/... or the file extension ".ejs"
});

app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    const templateVars = {
      user: users[req.session.userId],
      message: "You need to login to create new URLs."
    };
    return res.status(401).render("error", templateVars);
  }
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = {"longURL": req.body.longURL, userID: req.session.userId };
  console.log(users, urlDatabase);
  res.redirect(`/urls/${shortUrl}`);
});

app.get("/", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("*", (req, res) => {
  const templateVars = {
    user: users[req.session.userId],
    message: "Oops, this page doesn't exist."
  };
  return res.status(404).render("error", templateVars);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});