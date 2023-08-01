// PART 1
const express = require('express')
const app = express()
app.use(express.json());
const cors = require('cors')
app.use(cors())

// PART 2 SET UP
require('dotenv').config();

// Test URI access
console.log(process.env.MONGO_URI)

const mongoose = require('mongoose')
//Connect to Database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Test for successful database connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

// PART 3
// Specifying Application port
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Your app is listening on port: ${port}`)
})

const CommentSchema = new mongoose.Schema({
    body: {type: String, required: true},
    date: { type: Date, default: Date.now }
  });

const Comment = mongoose.model("Comment", CommentSchema);

const LibrarySchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: String,
    address: {type: String, required: true},
    area: String,
    image: {type: String, required: true},
    area_director: String,
    website: String,
    year: Number,
    aa_town: Boolean,
    comments: [CommentSchema]
  });
  
const Library = mongoose.model("Library", LibrarySchema);

// under schema and model 
app.get('/libraries', async (request, response) => {
    const libraries = await Library.find({})
    try {
      response.send(libraries);
    } catch (error) {
      response.status(500).send(error);
    }
});

//testing params and find by id
app.get('/comments/:id', async (request, response) => {
    const id = request.params.id
    console.log(id)
    const comment = await Comment.findById(id)
    console.log(comment)
    try {
      response.send(comment);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.post("/libraries/:id/comments", async (request, response) => {
    // find library
    const id = request.params.id
    const library = await Library.findById(id)
    // create comment for library
    newComment = request.body
    library.comments.push({body: newComment.body})
    try {
      await library.save();
      response.send(library);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.put("/libraries/:libId/comment/:comId", async (request, response) => {
    const libId = request.params.libId
    const comId = request.params.comId
    const updatedComment = request.body
    console.log(libId, comId, updatedComment) // { body: 'edited comment' }
    // const library = await Library.findById(libId)
    // const libraries = await Library.find({})
    const updatedLibrary = await Library.updateOne(
        {_id: libId, "comments._id": comId}, 
        {$set: {"comments.$.body": updatedComment.body}})
    try {
      await updatedLibrary.save();
      response.send(updatedLibrary);
    } catch (error) {
      response.status(500).send(error);
    }
});