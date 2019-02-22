var middlewareObj   = {};
var Article         = require("../models/article");


//Middleware checks if the current user is the article owner/creator
middlewareObj.checkArticleOwnership = function(req, res, next){
     if(req.isAuthenticated()){
        Article.findById(req.params.id, function(err, foundArticle){
            if(err){
                res.redirect("/")
            } else {
                if(foundArticle.author.id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });        
    } else {
        res.redirect("back");
    };
};

//middleware checks if there is a user logged in
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next()
    } else {
    res.redirect("/login");
    }
    };



module.exports = middlewareObj;