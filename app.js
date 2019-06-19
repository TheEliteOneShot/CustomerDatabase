const express = require('express');
const fileUpload = require('express-fileupload');
var redis = require("redis");
var session = require('express-session');
var redisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
var cookieParser = require('cookie-parser');
var async = require("async");
const app = express();
var router = express.Router();
var client = redis.createClient();
var _ = require('underscore')

const { getPageSearchResults, getFirstSearchResults, getSearchPage, getEntireCustomerDatabase } = require('./routes/search');
const { getDashBoard } = require('./routes/index');
const { customerProfile, addCustomerPage, addCustomer, deleteCustomer, editCustomer, editCustomerPage } = require('./routes/customer');
const { registerPage, loginPage, logoutPage } = require('./routes/session');
const Pagination = require('./classes/pagination');
const handle_database = require('./functions/handle_database');
const port = 3000;

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({
    secret: 'CfxDr9AVCKDqgsfXaTLCMTtvm',
    // create new redis store.
    store: new redisStore({ host: 'localhost', port: 6379, client: client, ttl: 260 }),
    saveUninitialized: false,
    resave: false
}));

// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'masterchief0',
    database: 'coding_challenge'
});

global.db = db;

// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder

const nonSecurePaths = ['/login', '/register'];
const customerPaths = ['/', '/logout'];

// Session checker
var checkSession = function (req, res, next) {
    if (req.session.key) {
        if (req.session.key.is_admin) {
            next();
        } else if (_.contains(customerPaths, req.path)) {
            console.log("Didn't contain any secure paths!" + req.path);
            next();
        } else {
            res.redirect("/");
        }
    } else if (_.contains(nonSecurePaths, req.path)) {
        next();
    } else {
        res.render('login-page.ejs', {
            title: "Login Page",
            message: "Please login to continue.",
            userEmail: ""
        });
    };
};


app.all('*', checkSession);
app.use('/', router);


// routes for the app

router.get('/', getDashBoard);
router.get('/profile/:id', customerProfile);
router.get('/logout', logoutPage);
router.get('/search', getSearchPage);
router.get('/add', addCustomerPage);
router.get('/edit/:id', editCustomerPage);
router.get('/delete/:id', deleteCustomer);
router.get('/customers/:page', getEntireCustomerDatabase);
router.get('/search/:page', getPageSearchResults);

router.post('/edit/:id', editCustomer);
router.post('/login', loginPage);
router.post('/register', registerPage);
router.post('/add/', addCustomer);
router.post('/search', getFirstSearchResults);

// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});