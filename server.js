var WebSocketServer = new require('ws');

const child_process = require('child_process');
// подключенные клиенты
var clients = {};

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({
  port: 8080
});
webSocketServer.on('connection', function(ws) {

  var id = Math.random();
  clients[id] = ws;
  console.log("новое соединение " + id);

  ws.on('message', function(message) {
    console.log('получено сообщение ' + message);

    exec(fromJson(message).bash);
  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });

});

function sender(data) {
  for (var key in clients) {
    clients[key].send(toJson(data));
  }
}

function exec(bash) {
  var workerProcess = child_process.exec(bash, function 
      (error, stdout, stderr) {
      
      if (error) {
        console.log(error.stack);
        console.log('Error code: ' + error.code);
        console.log('Signal received: ' + error.signal);
      }

      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);

      sender(stdout);
   });
 
   workerProcess.on('exit', function (code) {
      console.log('Child process exited with exit code ' + code);
   });
}

function fromJson(data) {
  return JSON.parse(data);
}

function rewriter(data) {
  data = data.split('<').join('*');
  data = data.split('>').join('*');
  return data;
}

function toJson(data) {
    let jsonData = {
        method: "bash",
        result: rewriter(data)
    };
    return JSON.stringify(jsonData);
}