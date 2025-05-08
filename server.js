require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { errorHandler, notFoundHandler } = require('./utils/handler');
const routes = require('./routes');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

app.use(cors());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(errorHandler);
app.use(notFoundHandler);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
