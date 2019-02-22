//Requiring Variables
var express                 = require("express"),
    mongoose                = require("mongoose"),
    bodyParser              = require('body-parser'),
    passport                = require("passport"),
    LocalStrategy           = require("passport-local"),
    User                    = require("./models/user"),
    Article                 = require("./models/article"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    methodOverride          = require("method-override"),
    middleware              = require("./middleware")
    

var app = express();

//Connecting to Database
mongoose.connect('mongodb://localhost:27017/evo_mag_v1',{useNewUrlParser: true});

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// Setting local variables
app.use(function(req, res, next){
    res.locals.currentUser=req.user;
    // res.locals.error= req.flash("error");
    // res.locals.success= req.flash("success");
    next();
});


// Passport Configuration
app.use(require("express-session")({
    secret: "this is a secret string",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Home Page Route
app.get("/", function(req, res){
    Article.find({}, function(err, allArticles){
    if (err){
        console.log(err);
    } else {
    res.render("home", {articles: allArticles, currentUser: req.user});        
    }
    });
});

// Create New Article Route
app.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("articles/new",  {currentUser: req.user});
});

app.get("/contactus", function(req, res){
    res.render("contact");
})

//Create Article Route
app.post("/", middleware.isLoggedIn, function(req, res){
    var title = req.body.title;
    var image = req.body.image;
    var articleBody = req.body.articleBody;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var key = req.body.key;
    var newArticle =  {title:title, image: image, articleBody:articleBody, author: author, key: key};
    Article.create(newArticle, function(err, newlyCreated){
        if (err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

//Edit Article Form Route
app.get("/articles/:id/edit", middleware.checkArticleOwnership, function(req, res){
        Article.findById(req.params.id, function(err, foundArticle){
            res.render("articles/edit", {article: foundArticle,  currentUser: req.user}); 
        });        
});

//Update Article
app.put("/articles/:id", middleware.checkArticleOwnership, function(req, res){
    Article.findByIdAndUpdate(req.params.id, req.body.article, function(err, updatedArticle){
    if(err){
        res.redirect("/");
        console.log("error");
    } else {
        res.redirect("/articles/" + req.params.id);
    }
    });
});

//Destroy article route
app.delete("/:id", middleware.checkArticleOwnership, function(req, res){
    Article.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/");
        } else {
            res.redirect("/");
        }
    });
});

// Article Page Route
app.get("/articles/:id", function(req, res){
    Article.findById(req.params.id, function(err, foundArticle){
       if(err){
           console.log(err);
       } else {
           Article.find({}, function(err, allArticles){
    if (err){
        console.log(err);
    } else {
    res.render("page", {article: foundArticle, articles: allArticles, currentUser: req.user});        
    }
    });
       }
    });
});

//Search Route
app.post("/search", function(req, res){
    Article.find({}, function(err, allArticles){
    if (err){
        console.log(err);
    } else {
    res.render("search", {search: req.body.search, articles: allArticles, currentUser: req.user});        
    }
    });
});

//Login Route
app.get("/login", function(req, res){
    res.render("login"); 
});

//Login Post Logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout logic route
app.get("/logout",function(req, res){
    req.logout();
    res.redirect("/");
});

// //Sign Up Route
// app.get("/signup", function(req, res){
//     res.render("signup");
// });

// //Handling Sign Up Route
// app.post("/signup", function(req, res){
//     req.body.username
//     req.body.password
//     User.register(new User({username: req.body.username}), req.body.password, function(err, user){
//         if(err){
//             console.log(err);
//             return res.render('signup');
//         }
//         passport.authenticate("local")(req, res, function(){
//             res.redirect("/");
//         });
//     });
// });


console.log("server is running");

app.listen(process.env.PORT, process.env.IP);

