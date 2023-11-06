const path = require('path');
const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const moment = require('moment-timezone');
// moment.tz.setDefault('Asia/Tokyo');

const app = express();
const port = 3000;

const routes = require('./routes');
const db = require('./config/db');

//connect db
db.connect();

app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());
app.use(methodOverride('_method'));

//HTTP logger
app.use(morgan('combined'));

//Routes init
routes(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});