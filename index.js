//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const credential=require("./credential");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

/*const dbURI="mongodb+srv://admin-senapathi:<password>@cluster0.3kxid12.mongodb.net/?retryWrites=true&w=majority/todolistDB";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));*/
    //mongoose.connect("mongodb+srv://admin-senapathi:<password>@cluster0.3kxid12.mongodb.net/?retryWrites=true&w=majority/todolistDB",{useNewUrlParser: true});





    const connectionParams={
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    mongoose.connect(process.env.pass,connectionParams)
        .then( () => {
            console.log('Connected to the database ')
        })
        .catch( (err) => {
            console.error(`Error connecting to the database. n${err}`);
        })

    const itemsSchema={
      name:String,
    };

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"welcome to your todolist"
});



const defaultItems=[item1];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);
app.get("/", function(req, res) {

 Item.find({},function(err,foundItems){

   if(foundItems.length===0){
     Item.insertMany(defaultItems,function(err){
       if(err){
         console.log(err);
       }else{
         console.log("success");
       }
     });
     res.redirect("/");
   }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
   }


 });


});

app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        //show an existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const nitem=new Item({
    name:itemName
  });
  if(listName==="Today"){
    nitem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(nitem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("successfully removed");
        res.redirect("/");
      }

    });

  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });

  }


});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
