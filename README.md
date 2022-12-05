
The page for editting existing URLs.# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product
<br>

!["The login page. Say hi to our welcome kitten!"](https://github.com/Likai-L/tinyapp/blob/main/docs/login-page.png?raw=true)
<p align="center">The login page. Say hi to our welcome kitten!</p>
<br>

!["The main index page containing all the URLs that you created."](https://github.com/Likai-L/tinyapp/blob/main/docs/urls-page.png?raw=true)
<p align="center">The main index page containing all the URLs that you created.</p>
<br>

!["The page for creating new URLs."](https://github.com/Likai-L/tinyapp/blob/main/docs/create-page.png?raw=true)
<p align="center">The page for creating new URLs.</p>
<br>

!["The page for editting existing URLs."](https://github.com/Likai-L/tinyapp/blob/main/docs/edit-page.png?raw=true)
<p align="center">The page for editting existing URLs.</p>
<br>

!["One of the error pages. Our error kitten is confused!"](https://github.com/Likai-L/tinyapp/blob/main/docs/404-page.png?raw=true)
<p align="center">One of the error pages. Our error kitten is confused!</p>
<br>

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Browse away at [localhost:8080](http://localhost:8080)!
  - Register and login with an email and a password. (Logging in is required to view, create, edit and delete URLs.)
  - View all your URLs at `/urls`.
  - Creata a new URL by clicking the `Create New URL` button at the top left and bottom left of the `/urls` page; or simply go to `urls/new`.
  - Edit an URL by clicking its `Edit` button at `/urls` and submitting the new URL on the new page. (You can only edit your own URLs!)
  - Delete an URL by clicking its `Delete` button at `/urls`. (You can only delete your own URLs!)
  - Use your shotr URLs to visit your favorite websites by entering [localhost:8080/u/shortURL](http://localhost:8080/u/shortURL) in the browser address bar. Remeber to replace `shortURL` with your actual short URL! <em><strong>Anyone can use this link to access the target website, share it with your family and friends!</strong></em>
  - You can also visit your websites by clicking the short URL links at `/url` or at the detail/edit page of each URL.
- Have fun!
