const http = require('http');
const socketIo = require('socket.io');
const Routes = require('./routes');
const { logger } = require('./util');
const PORT = 3000;

const handler = function(request, response) {
  const defaultRoute = async(request, response) => response.end('Hello!');

  const routes = new Routes(io);
  const chosen = routes[request.method.toLowerCase()] || defaultRoute;
  
  return chosen.apply(routes, [request, response]);
}

const server = http.createServer(handler);
const io = socketIo(server, {
  cors: {
    origin: '*',
    credentials: false,
  }
})

io.on('connection', (socket) => logger.info('someone connected: ' + socket.id));

const startServer = () => {
  const { address, port } = server.address();
  logger.info(`Server is running at http://${address}:${port}`);
}

server.listen(PORT, startServer);