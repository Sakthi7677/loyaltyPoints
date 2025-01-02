// Import express.js
const express = require("express");
const { User } = require("./models/user");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', './app/views');
// Get the functions in the db.js file to use
const db = require('./services/db');
var session = require('express-session');
app.use(session({
  secret: 'secretkeysdfjsflyoifasd',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Create a route for root - /
// app.get("/", function(req, res) {
//    res.render("index");
// });

app.get("/", function(req, res) {
    console.log(req.session);
    if (req.session.uid) {
		res.send('Welcome back, ' + req.session.uid + '!');
	} else {
		res.send('Please login to view this page!');
	}
	res.end();
});

// Register
app.get('/register', function (req, res) {
    res.render('register');
});

// Login
app.get('/login', function (req, res) {
    res.render('index');
});

app.get("/aboutUs", function(req, res) {
    res.render("aboutUs");
 });
// app.get('/points/:username', (req, res) => {
//     var user = req.params.id;
//     sql = 'select * from loyaltypoints where username = ?';
//     db.query(sql).then(results => {
//         console.log(results)
//             results.filter((user)=>{
//              if (user.name===res.req.query.username && user.isRetail==="NO"){
//                 return res.render('card', { points:user.points,cusName:user.name});
//              }
//              else if(user.name===res.req.query.username && user.isRetail==="YES"){
//                 return res.render('userList',{users:results});
//              }
             
//         })

       
//     });
        
//   });
app.get('/points/retailer', function (req, res) {
    
    var sql = "select * from loyaltypoints where role = 'customer'";
    db.query(sql).then(results => {
        console.log(results)
        return res.render('userList',{users:results}); 
    })
       
    
});

app.get('/points/:userid', function (req, res) {
    var userid = req.params.userid;
    console.log(userid)
    var sql = 'select * from loyaltypoints where id = ?';
    db.query(sql, [userid]).then(results => {
        var row = results[0];
        console.log(row)
        if(row?.role==="customer"){
            return res.render('card', { points:row.points,cusName:row.name});
        }
            });
    
});

app.get('/retailer-view/:userid', function (req, res) {
    var userid = req.params.userid;
    console.log(userid)
    var sql = 'select * from loyaltypoints where id = ?';
    db.query(sql, [userid]).then(results => {
        var row = results[0];
        console.log(row)
        if(row.role==="customer"){
            return res.render('userInput', {
                 points:row.points,
                 cusName:row.name,
                 userid: row.id });
        }
            });
    
});

app.post('/modify-points/:userid', function (req, res) {
    var userid = req.params.userid;
    console.log(userid);
    
    var points = req.body['new_points']; // Get form data
    console.log('___+++', req.body)
    console.log(points);
    // Fetch user data from the database
    var sql = 'UPDATE loyaltypoints SET points = ? WHERE id = ?';
    db.query(sql, [points, userid]).then(results => {
        var row = results[0];
        if (results.affectedRows > 0) {
            res.render('submission', {
                successMessage: 'Points updated successfully!',
                userid: userid,
                points: points // Send current points to the template
            });
        } else {
            res.render('submission', {
                errorMessage: 'No points were updated. Please try again.',
                userid: userid,
                points: points
            });
        }
    }).catch(err => {
        console.error("Error fetching user:", err);
        res.send('Error fetching user');
    });
});

app.post('/set-password', async function (req, res) {
    params = req.body;
    var user = new User(params.email);
    try {
        uId = await user.getIdFromEmail();
        if (uId) {
            // If a valid, existing user is found, set the password and redirect to the users single-student page
            await user.setUserPassword(params.password);
            console.log(req.session.id);
            res.send('Password set successfully');
        }
        else {
            // If no existing user is found, add a new one
            newId = await user.addUser(params.name, params.email, params.password);
            res.send('Perhaps a page where a new user sets a programme would be good here');
        }
    } catch (err) {
        console.error(`Error while adding password `, err.message);
    }
});

app.post('/authenticate', async function (req, res) {
    
    params = req.body;
    var user = new User(params.email);
    try {
        uId = await user.getIdFromEmail();
        if (uId) {
            match = await user.authenticate(params.password);
            if (match) {
                req.session.uid = uId;
                req.session.loggedIn = true;
                console.log(req.session.id);
                var sql = "SELECT role FROM loyaltypoints WHERE id = ?";
                const result = await db.query(sql, [uId]); 
                console.log('&&&')
                console.log(result)
                if (result[0].role === 'customer') {
                    res.redirect('/points/' + uId);
                }
                if (result[0].role === 'retailer') {
                    res.redirect('/points/retailer');
                }
                
                // res.redirect('/single-student/' + uId);
            }
            else {
                // TODO improve the user journey here
                res.send('invalid password');
            }
        }
        else {
            res.send('invalid email');
        }
    } catch (err) {
        console.error(`Error while comparing `, err.message);
    }
});

// Logout
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
  });

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});