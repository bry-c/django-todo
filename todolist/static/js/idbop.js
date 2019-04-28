var dbPromise = idb.open('todo-db', 1, function(upgradeDb) {
    upgradeDb.createObjectStore('todos',{keyPath:'pk'});
});

//collect latest post from server and store in idb
fetch('/getdata').then(function(response){
    return response.json();
}).then(function(jsondata){
    dbPromise.then(function(db){
        var tx = db.transaction('todos', 'readwrite');
          var todosStore = tx.objectStore('todos');
          for(var key in jsondata){
              if (jsondata.hasOwnProperty(key)) {
                todosStore.put(jsondata[key]);	
              }
          }
    });
});

//retrive data from idb and display on page
var todos = "";
dbPromise.then(function(db){
    var tx = db.transaction('todos', 'readonly');
    var todosStore = tx.objectStore('todos');
    return todosStore.openCursor();
}).then(function logItems(cursor) {
    if (!cursor && todos != "") {
        document.getElementById('todos').innerHTML=todos;
        return;
    }

    if (!cursor) {
        return;
    }

    for (var field in cursor.value) {
        if (field=='pk') {
            var todoId = cursor.value[field]
        }

        if(field=='fields'){
            todosData=cursor.value[field];
            console.log(todosData);
            for(var key in todosData){
                if(key =='title'){
                    var title = todosData[key];
                }
                if(key =='done'){
                    var done = todosData[key];
                }
                if(key =='title'){
                    var title = todosData[key];
                }
            }

            if (done) {
                var todoLink = '<a href="done/' + todoId + '"><del>' + title + '</del></a>'
                todos = todos + '<li class="list-group-item done">' + todoLink + '<a href="delete/' +  todoId +'"><i class="fas fa-trash float-right"></i></a></li>';
            } else {
                var todoLink = '<a href="done/' + todoId + '">' + title + '</a>'
                todos = todos + '<li class="list-group-item">' + todoLink + '<a href="delete/' +  todoId +'"><i class="fas fa-trash float-right"></i></a></li>';
            }
        }
    }
    return cursor.continue().then(logItems);
});

    // <li class="list-group-item {% if todo.done %}done{% endif %}">
    //     <a href="{% url 'todolist:done' todo_id=todo.id %}">
    //         {% if todo.done %}
    //             <del>{{ todo.title }}</del>
    //         {% else %}
    //             {{ todo.title }}
    //         {% endif %}
    //     </a>

    //     <a href="{% url 'todolist:delete' todo_id=todo.id %}">
    //         <i class="fas fa-trash float-right"></i>
    //     </a>
    // </li>