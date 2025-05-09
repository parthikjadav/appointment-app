require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { errorHandler, notFoundHandler } = require('./utils/handler');
const routes = require('./routes');
const path = require('path');
const cookieParser = require('cookie-parser');
const { webhook } = require('./utils/stripe');
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const app = express();
const port = 3000;

app.use(cors());
app.use(cookieParser());

// Serve static files (optional for CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Routes serving specific HTML pages
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.post("/webhook", express.raw({ type:'application/json' }), webhook)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"))
app.use(helmet())

app.use("/api", routes);

app.use(errorHandler);
app.use(notFoundHandler);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
