var express = require("express");
var mongoose = require("mongoose");


// Parses our HTML and helps us find elements
var cheerio = require("cheerio");
// Makes HTTP request for HTML page
var axios = require("axios");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsWebScraper"
mongoose.connect(MONGODB_URI);

app.get("/scrape", function(req, res) {
    // Making a request via axios for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
    axios.get("https://www.washingtonpost.com/?noredirect=on").then(function (response) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);

        // With cheerio, find each p-tag with the "title" class
        // (i: iterator. element: the current element)
        $("div.blurb").each(function (i, element) {

            // Save the text of the element in a "title" variable
            let headline = $(element).parent().children("div.headline").text();
            if (headline === "")
                headline = $(element).parent().parent().parent().children("div.headline").text();


            // In the currently selected element, look at its child elements (i.e., its a-tags),
            // then save the values for any "href" attributes that the child elements may have
            let link = $(element).parent().children("div.headline").children().attr("href");
            if (link === undefined)
                link = $(element).parent().parent().parent().children("div.headline").children().attr("href");

            const summary = $(element).text();

            // Save these results in an object that we'll push into the results array we defined earlier
            const result = {
                headline: headline,
                link: link,
                summary: summary
            };

            // Create a new Article using the `result` object built from scraping
            db.Article.find({ headline: headline })
                .then(function (match) {
                    if (!match[0]) {
                        db.Article.create(result)
                            .then(function (dbArticle) {
                                // View the added result in the console
                                console.log("Added article to the DB:")
                                res.end();
                            })
                            .catch(function (err) {
                                // If an error occurred, log it
                                console.log(err);
                            });
                    }
                })
                .catch(function (err) {
                    res.json(err);
                });
        });
    });
});

app.get("/articles/", function(req, res) {
    db.Article.find({})
        .populate("comments")
        .then(dbArticles => res.json(dbArticles))
        .catch(err => res.json(err));
});

app.get("/comment/:id", function(req, res) {
    db.Comment.find({_id: req.params.id})
        .then(dbComment => res.json(dbComment))
        .catch(err => res.json(err));
})

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    db.Comment.create(req.body)
        .then(comment => {
            db.Article.findOneAndUpdate(
                { "_id": req.params.id },
                { $push: { comments: comment._id } },
                { new: true })
                .then(article => {
                    res.json(article)
                })
        })
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
