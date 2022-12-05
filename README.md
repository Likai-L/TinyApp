# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

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
- Browse away at [localhost:8080](localhost:8080)!
  - Register and login with an email and a password. (Logging in is required to view, create, edit and delete URLs.)
  - View all your URLs at `/urls`.
  - Creata a new URL by clicking the `Create New URL` button at the top left and bottom left of the `/urls` page; or simply go to `urls/new`.
  - Edit an URL by clicking its `Edit` button at `/urls` and submitting the new URL on the new page. (You can only edit your own URLs!)
  - Delete an URL by clicking its `Delete` button at `/urls`. (You can only delete your own URLs!)
  - Use your shotr URLs to visit your favorite websites by entering [localhost:8080/u/shortURL](localhost:8080/u/shortURL) in the browser address bar. Remeber to replace `shortURL` with your actual short URL! <em><strong>Anyone can use this link to access the target website, share it with your family and friends!</strong></em>
  - You can also visit your websites by clicking the short URL links at `/url` or at the detail/edit page of each URL.
- Have fun!