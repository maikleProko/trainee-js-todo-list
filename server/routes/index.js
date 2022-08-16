var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var router = express.Router();
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Получение массива TODO
router.get('/todos', function(req, res, next) {
  var todos_json = JSON.parse(fs.readFileSync("./todos.json"))
  res.json(todos_json);
});

//Создание нового TODO
router.post('/todos',(req, res)=>{
  var todos_json = JSON.parse(fs.readFileSync("./todos.json"))
  let newTodo = {}
  newTodo.id = todos_json.length
  newTodo.name = "New todo"
  newTodo.date = new Date()
  newTodo.status = 0;
  todos_json.push(newTodo)
  fs.writeFile("./todos.json", JSON.stringify(todos_json),function(err, result) {
    if(err) {
      console.log('error', err);
    }
    else {
      res.sendStatus(200)
    }
  });
});


//Изменение TODO
router.put('/todos',(req, res)=>{
  var todos_json = JSON.parse(fs.readFileSync("./todos.json"))
  var todo = req.body;
  for(let i = 0; i < todos_json.length; i++) {
    if(todo.id === todos_json[i].id) {
      todos_json[i] = todo;
    }
  }
  fs.writeFile("./todos.json", JSON.stringify(todos_json),function(err, result) {
    if(err) {
      console.log('error', err);
    }
    else {
      res.sendStatus(200)
    }
  });
});


//Удаление TODO
router.delete('/todos',(req,res, next)=>{
  var todos_json = JSON.parse(fs.readFileSync("./todos.json"))
  let todo = req.body;
  for(let i = 0; i < todos_json.length; i++) {
    if(todo.id === todos_json[i].id) {
      todos_json.splice(i,1);
    }
  }
  for(let i=0;i<todos_json.length;i++){
    todos_json[i].id = i;
  }
  fs.writeFile("./todos.json", JSON.stringify(todos_json),function(err, result) {
    if(err) {
      console.log('error', err);
    }
    else {
      res.sendStatus(200)
    }
  });
});

//Удаление всех TODO
router.delete('/clean',(req,res, next)=>{
  var todos_json = []
  fs.writeFile("./todos.json", JSON.stringify(todos_json),function(err, result) {
    if(err) {
      console.log('error', err);
    }
    else {
      res.sendStatus(200)
    }
  });
});

module.exports = router;
