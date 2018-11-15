$.get("/articles", function(articles) {
    console.log(articles);
    articles.forEach(article => {
        var articleRow = $("<div class='row'>");
        var articleColumn = $("<div class='col-md-12'>");

        var headline = $("<h3>");
        headline.text(article.headline);
        articleColumn.append(headline);

        var summary = $("<p>");
        summary.text(article.summary);
        articleColumn.append(summary);

        var link = $("<a>");
        link.attr("href", article.link);
        link.attr("target", "_blank");
        link.append("<h4>Link</h4>");
        articleColumn.append(link);

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
