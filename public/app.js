$.get("/articles", function(articles) {
    console.log(articles);
    articles.forEach(article => {
        
        console.log(article.comments);

        var articleRow = $("<div class='row'>");
        var articleColumn = $("<div class='col-md-12'>");
        articleColumn.attr("id", article._id);

        var link = $("<a>");
        link.attr("href", article.link);
        link.attr("target", "_blank");
        link.append("<h3>" + article.headline + "</h3>");
        articleColumn.append(link);

        var summary = $("<p>");
        summary.text(article.summary);
        articleColumn.append(summary);

        var commentHeader = $("<h5>");
        commentHeader.text("Comments");
        articleColumn.append(commentHeader);

        var comments = $("<ul>");
        article.comments.forEach(comment => {
            var commentLi = $("<li>");
            commentLi.text(comment.body);
            comments.append(commentLi);
        });
        articleColumn.append(comments);

        var commentForm = $("<div class='form-group'>");

        var textField = $("<textarea>");
        textField.addClass("form-control");
        textField.attr("article-id", article._id);
        commentForm.append(textField);

        var post = $("<button class='btn btn-primary'>");
        post.text("Post comment")
        post.addClass("post-comment")
        post.attr("article-id", article._id);
        commentForm.append(post);

        articleColumn.append(commentForm);

        var divider = $("<hr>");
        articleColumn.append(divider);

        articleRow.append(articleColumn);
        $("#article-container").append(articleRow);
    })
});

$(document).on("click", "#scrape", function(event) {
    console.log("Button clicked!")
    $.get("/scrape", function() {
        location.reload();
    })
});

$(document).on("click", ".post-comment", function(event) {
    let articleId = $(this).attr("article-id");

    let comment = $("textarea[article-id=" + articleId + "]").val().trim();

    $.ajax({
        method: "POST",
        url: "/articles/" + articleId,
        data: {
            body: comment
        }
    })
    .then(function() {
        $("textarea[article-id=" + articleId + "]").val("");
        console.log("Added comment " + comment);
        location.reload();
    })
});
