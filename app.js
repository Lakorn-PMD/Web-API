require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Server } = require("socket.io");
const app = express();
const mongoose = require('mongoose');
const { createServer } = require('http')
const { instrument } = require('@socket.io/admin-ui')
var useragent = require('express-useragent');
const server = createServer(app);
const io = new Server(server, {
    cors: ['*']
});
instrument(io, {
    auth: false
});
const { seatSchema } = require('./models/seat');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(useragent.express());
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use((req, res, next) => {
    res.setHeader('x-powered-by', 'LK/v1.0');
    req.io = io;
    next();
});

app.use('/api/seat', require('./routes/seat'));
app.use('/api/auth', require('./routes/auth'));

app.get('/status', (req, res) => {
    res.send('ok');
})

// SOCKET.IO

io.on('connection', async (socket) => {
    socket.on('updateSeat', async (seat) => {

    });
    // socket.disconnect(true)
});

mongoose.connect(process.env.MONGO_URL).then(() => {
    server.listen(4000, async () => {
        console.log(`Server is running on port ${4000}`);
    });
});
