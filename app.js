//jshint esversion:6
// delete in work..... route
const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require('mongoose');
const app = express();
require("dotenv").config()

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome"
});
const item2 = new Item({
  name: "Hi"
});
const item3 = new Item({
  name: "hello"
});

const defaultItems = [item1, item2, item3];

const ListSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", ListSchema);

app.get("/", async function(req, res) {
  const items = await Item.find({});
  if(items.length == 0){
   try{
     await Item.insertMany(defaultItems);
     console.log("insertion successful!")
   }catch(err){
     console.log(err);
   }
   res.redirect("/");
 }else{

   res.render("list", {listTitle: "today", newListItems: items});

 }


});

app.post("/", async function(req, res){
  console.log(req.body);
  const itemName = await req.body.newItem;
  if(!itemName) return res.redirect('/')
  const item = new Item({
    name: itemName
  })
  item.save();
  res.redirect("/");
});

app.post("/delete", async function(req,res){
  const checkedid =  req.body.checkbox
  console.log(req.body);
  try{
    await Item.findByIdAndRemove(checkedid);
  }catch(err){
    console.log(err);
  }
  if(req.body.pageId === 'today'){
    return res.redirect('/')
  }
  return res.redirect('/' + req.body.pageId);
});

app.get("/:CustomParams", async function(req,res){
  const customListName = req.params.CustomParams;
  const foundList = await List.findOne({name: customListName});
  if(foundList){
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        console.log("exist!");
  }else{
    console.log("doesn't exist");
   const list = new List({
     name: customListName,
     items: defaultItems});
     list.save();
     res.redirect("/"+ customListName);
   }


});


app.get("/about", function(req, res){
  res.render("about");
});

async function start(){

  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected")
    app.listen(process.env.PORT, function() {
      console.log("Server started on port", process.env.PORT);
    });
  }catch{
    console.log("SERVER CAN NOT START! CHECK DB CONN.");
  }

}
start()
