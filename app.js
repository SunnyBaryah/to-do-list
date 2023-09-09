const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const workList = [];
const item = "";
let day = "";
//Mongoose Section
mongoose.connect("mongodb://127.0.0.1:27017/toDoListDB");
const taskSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  tasks: [taskSchema],
});
const List = new mongoose.model("List", listSchema);
const Task = new mongoose.model("Task", taskSchema);

const task1 = new Task({
  name: "Welcome to your to-do list!",
});
const task2 = new Task({
  name: "Hit the + button to add an item",
});
const task3 = new Task({
  name: "<--Hit this to delete the item",
});
const defaultTasks = [task1, task2, task3];
//Previous
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.listen(3000, function () {
  console.log("Server started at port 3000");
});
//
app.get("/", function (req, res) {
  day = date.getDate();
  async function taskFinder() {
    const taskd = await Task.find({});
    if (taskd.length === 0) {
      Task.insertMany(defaultTasks);
      res.redirect("/");
    } else {
      res.render("list", { weekDay: day, newListItems: taskd });
    }
  }
  taskFinder();
});

app.get("/:newPath", function (req, res) {
  const pathname = _.capitalize(req.params.newPath);
  const list = new List({
    name: pathname,
    tasks: defaultTasks,
  });
  async function listFinder() {
    const liste = await List.findOne({ name: pathname });
    if (liste === null) {
      list.save();
      res.redirect("/" + pathname);
    } else {
      res.render("list", { weekDay: liste.name, newListItems: liste.tasks });
    }
  }
  listFinder();
});

app.get("/about", function (req, res) {
  res.render("about", {});
});
app.post("/", function (req, res) {
  const item = req.body.newItem;
  const page = req.body.button;
  const day = date.getDate();
  const newItem1 = new Task({
    name: item,
  });
  if (page === day) {
    newItem1.save();
    res.redirect("/");
  } else {
    async function listFinder() {
      const list = await List.findOne({ name: page });
      list.tasks.push(newItem1);
      list.save();
      res.redirect("/" + page);
    }
    listFinder();
  }
});
app.post("/delete", function (req, res) {
  const id = req.body.checkbox;
  const title = req.body.hidbtn;
  day = date.getDate();
  if (title === day) {
    async function taskDeleter() {
      await Task.deleteOne({ _id: id });
      res.redirect("/");
    }
    taskDeleter();
  } else {
    async function taskDeleter() {
      await List.findOneAndUpdate(
        { name: title },
        { $pull: { tasks: { _id: id } } }
      );
      res.redirect("/" + title);
    }
    taskDeleter();
  }
});
