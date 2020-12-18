const express = require('express');

const app = express();
const HashMap = require('hashmap');

app.use(express.json());

var to_dos = new HashMap();

to_dos.set(1, {task: "Make to do list", completed : false, children:[2], parent: 0});
to_dos.set(2, {task: "Learn Node", completed: false, children : [3], parent: 1})
to_dos.set(3, {task : "Learn Express", completed : false, children:  [], parent : 2})
app.get('/', (req, res)=>{
    res.send("Hello World");
});
app.get('/to_dos', (req, res) =>{
    res.send(to_dos)
});

app.post('/to_dos/new/task', (req, res) => {
    var newKey = to_dos.size + 1;
    to_dos.set(newKey, {task: req.body.task, completed : false, children : [], parent : 0});
    res.send(to_dos);
});


app.post('/to_dos/new/subtask/:id', (req, res) => {
    var newKey = to_dos.size + 1;
    var id = parseInt(req.params.id);
    if (!to_dos.has(id)) {
        res.status(404).send(`Sorry, no to_do with such id ${id} present`);
        return;
    }
    var to_do = to_dos.get(id);
    to_do.children.push(newKey);
    to_dos.set(newKey, {task : req.body.task, completed : false, children : [], parent : id});
    res.send(to_dos);
});


function completeChildren(id) {
    var to_do = to_dos.get(id);
    to_do.completed = true;
    for (var child in to_do.children) {
        completeChildren(to_do.children[child]);
    }
}


app.put('/to_dos/completed/:id', (req, res) => {
    var id = parseInt(req.params.id);
    var to_do = to_dos.get(id);
    if (!to_dos.has(id)) {
        res.status(404).send(`Sorry, no to_do with such id ${id} present`);
        return;
    }
    to_do.completed = true;
    completeChildren(id);
    var done = true;
    while (to_do.parent != 0 && done) {
        to_do = to_dos.get(to_do.parent);
        id = to_do.id;
        for (var child in to_do.children) {
            if (!to_do.children[child]) {
                done = false;
            }
        }
        to_do.completed = done;
    }
    res.send(to_dos);
});

function deletingChildren(id) {
    var to_do = to_dos.get(id);

    for (var child in to_do.children) {
        deletingChildren(to_do.children[child]);
    } 
    to_dos.delete(id);
}

app.delete('/to_dos/delete/:id', (req, res) => {
    var id = parseInt(req.params.id);
    var par = to_dos.get(id).parent;
    if (par != id) {
        var to_do = to_dos.get(par);
        var index = to_do.children.indexOf(id);
        to_do.children.splice(index, 1);
    }
    deletingChildren(id);
    res.send(to_dos);
});


const port = process.env.PORT || 3000;
app.listen(port, () =>console.log(`Listening on port ${port}`));             