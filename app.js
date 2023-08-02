const express = require("express")
const app = express()
const mongoose = require("mongoose")
const date = require(__dirname + "/date.js")  //exporting date.js from other file
const _ = require("lodash")

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
let day = date.getDate()   //the date.js is passed here

app.set("view engine", "ejs")   //used if you are using ejs templating

//mongoose.connect("mongodb://127.0.0.1:27017/todoListDB", {useNewUrlParser:true, useUnifiedTopology:true});

mongoose.connect("mongodb+srv://anubhutiprasad476:hello98@cluster0.si83g4i.mongodb.net/todoListDB",
 {useNewUrlParser:true, useUnifiedTopology:true});    //for running on mongoDB Atlas 

const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);    
const item1 = new Item({
  name: "Welcome to the todo-list!"
})
const item2 = new Item({
  name: "Hit the + button to add a new item."
})
const item3 = new Item({
  name: "<-- Hit this to delete an item."
})

const listSchema = new mongoose.Schema({       //this schema is for custom multiple pages
  name: String,
  items: [itemsSchema]      //nested schemas
})
const List = mongoose.model("List", listSchema);

//when we need multiple html pages then we must use html templates in which we can change certain parts of HTML 
//depending upon the logic in our server  

const defualtItem = [item1, item2, item3];
app.get("/", async(req, res) => {
   const founditems = await Item.find({})    //using await and async for item.find() and founditems is the variable that is to be find
   if(founditems === 0){
    Item.insertMany(defualtItem)
    .then(() => console.log("Successfully saved to DB") )
    .catch(err => console.error(err));
    res.redirect("/");
   }
   else
     res.render("list", {listTitle: "Today", newlistitems: founditems});   
  })

app.get("/:customListName", async function(req, res){    //express route used to make multiple web pages
  const customListName = _.capitalize(req.params.customListName) 
  try{
     const founditems = await List.findOne({name: customListName }) 
     if(!founditems){
      //Create a new list
       const list = new List({
         name: customListName,
         items: defualtItem
       })
       list.save();
       res.redirect("/" + customListName) 
      } 
     else{
       //Show an existing list 
       res.render("list", {listTitle: customListName, newlistitems: founditems.items})    
      }
    } catch(err){
        console.log(err);
       }                
})     

app.post("/", async function(req,res){
  const itemName = req.body.newItem
  const listName = req.body.list
   //console.log(listName)

  const item = new Item({                //creating new item which will be added in the list further using mongoDB
      name: itemName 
    })
  if( listName === "Today"){ 
     item.save();
     res.redirect("/")
    }
  else{
      const foundList = await List.findOne({ name: listName });
      foundList.items.push(item);              // Push the item into the array
      await foundList.save()                  // Save the parent document (foundList) to save the item
      res.redirect("/" + listName);
      console.log(foundList.items);
  }
})
app.post("/delete", async(req,res) => {
  const checkedItemID = req.body.checkbox
  const listName = req.body.listName

  if(listName === "Today"){
    const removedItem = await Item.findByIdAndRemove(checkedItemID)
     if(removedItem)
       console.log("Successfully deleted checked item - " + checkedItemID)
     res.redirect("/")
    }
  else(
     List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, {new: true})

      .then(updatedList => {
        console.log('Item deleted successfully.');
        console.log(updatedList); // The updated list document
        res.redirect("/" + listName) 
      })
      .catch(err => {
        console.error(err);
      })
    )
  })

app.listen(3000, function(){
    console.log("Server is running on port 3000");
})


