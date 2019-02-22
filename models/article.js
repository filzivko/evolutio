var mongoose = require("mongoose");
 
var articleSchema = new mongoose.Schema({
   title: String,
   image: String,
   articleBody: String,
   sources: String,
   created_at: {type: Date, required: true, default: Date.now },
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   key: String
});


module.exports = mongoose.model("Article", articleSchema);