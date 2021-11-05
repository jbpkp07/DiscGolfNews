# DiscGolfNews

This is a webserver application that hosts a client web page that scrapes for disc golf news and allows you to save/delete articles and notes associated with those articles in MongoDB.

### Run it locally:

You can clone this repository via command line (if you have Git installed) by typing:  

`git clone https://github.com/jbpkp07/DiscGolfNews`

If you already have Node.js installed, open your terminal, and browse to where you have cloned this Git repository and type:  

`node server.js` or if you have nodemon installed, `nodemon server.js`

If there are Node module dependencies that you are missing, please type `npm install` and it will reference the package.json file in this repository to automatically resolve those missing dependencies.

The main entry point for the server application is `server.js`, and the other auxillary files are used to provide Node modules that the application depends on.

To view the client hosted webpage, browse to http://localhost:3000 for the locally hosted page.


**Technologies used:**  Node.js, TypeScript, NPM, axios, cheerio, express, express-handlebars, mongoose, terminal-kit, MongoDB, HTML, CSS, jQuery

I am the sole developer of this application.


### Screenshots:

#### Saved articles (previously scraped):

![1](https://github.com/jbpkp07/DiscGolfNews/blob/master/public/assets/images/savedArticles.png)

#### Add or delete notes associated with an article:

![2](https://github.com/jbpkp07/DiscGolfNews/blob/master/public/assets/images/notes.png)
