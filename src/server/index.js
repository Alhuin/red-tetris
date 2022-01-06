const express = require('express');
const https = require('https');
const http = require('http');
const cors = require('cors');
const fs = require('fs');
const { Server } = require('socket.io');
const path = require('path');
const ngrok = require('ngrok');
const routes = require('./routes');
const handleSocket = require('./socketio');

const port = process.env.PORT || 4001;
const app = express();

app.use(cors());
app.options('*', cors());
app.use(routes);

// Create https server if node_env is production, else http
// eslint-disable-next-line max-len
// openssl req -x509 -sha256 -nodes -newkey rsa:2048 -days 365 -keyout localhost.key -out localhost.crt
const server = (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'production')
  ? https.createServer(
    {
      key: fs.readFileSync('/Users/julien/ssl/localhost.key'),
      cert: fs.readFileSync('/Users/julien/ssl/localhost.crt'),
    },
    app,
  ) : http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
  },
});
io.on('connection', (socket) => handleSocket(socket, io));

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'production') {
  // Launching ngrok forwarding
  ngrok.connect('https://localhost:4001')
    .then((url) => {
      const clientConfigPath = `${path.resolve()}/src/client/config.js`;

      console.log(`ngrok forwarding: ${url} => https://localhost:4001`);
      console.log(`editing ${clientConfigPath}...`);

      // Reading and editing client configuration file with ngrok url
      fs.readFile(clientConfigPath, 'utf-8', (readErr, data) => {
        if (readErr) throw readErr;
        const newValue = data.replace(
          /serverUrl = .*;$/gm,
          `serverUrl = '${url}';`,
        );

        fs.writeFile(clientConfigPath, newValue, 'utf-8', (writeErr) => {
          if (writeErr) throw writeErr;
          // Launching local server on https://localhost:4001
          server.listen(port, () => console.log(`Server listening on port ${port}\n
            \x1b[32mYou can now run \`npm run publish\` in another console !\x1b[0m\n
                -- server logs will be displayed below --\n`));
        });
      });
    })
    .catch(console.error);
} else {
  server.listen(port, () => console.log(`Listening on port ${port}`));
}
