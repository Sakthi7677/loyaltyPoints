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

app.get("/", function(req, res) {
    res.redirect('/login')
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
    
    var sql = "select * from loyaltypoints where role = 'customer' and is_active = True";
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
                points: points,
                cusName:req.query.cusName
            });
        }
    }).catch(err => {
        console.error("Error fetching user:", err);
        res.send('Error fetching user');
    });
});

app.post('/set-password', async function (req, res) {
    const params = req.body;
    var user = new User(params.email);

    try {
        const uId = await user.getIdFromEmail();
        
        if (uId) {
            // If a valid, existing user is found, set the password and render confirmation page
            await user.setUserPassword(params.password);
            console.log(req.session.id);
            const message = 'Password set successfully!';
            res.render('confirmation', { message: message });  // Render confirmation page with message
        } else {
            // If no existing user is found, add a new one
            const newId = await user.addUser(params.name, params.email, params.password);
            const message = 'New user added successfully!';
            res.render('confirmation', { message: message });  // Render confirmation page with message
        }
    } catch (err) {
        console.error(`Error while adding password`, err.message);
        res.render('confirmation', { message: 'An error occurred. Please try again.' });  // Render error message
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
                if (result[0].role === 'customer') {
                    res.redirect('/points/' + uId);
                }
                if (result[0].role === 'retailer') {
                    res.redirect('/points/retailer');
                }
                
            }
            else {
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

app.post('/delete-user/:userid', async function (req, res) {
    var userId = req.params.userid;
    console.log('Deleting user with ID:', userId);

    try {
        // set the customer as in-active rather than deleting it from the database
        var sql = ' UPDATE loyaltypoints SET is_active = False WHERE id = ?';
        const result = await db.query(sql, [userId]);
        
        if (result.affectedRows > 0) {
            // Success: User deleted
            console.log('User successfully deleted');
            res.redirect('/points/retailer'); // Redirect to a confirmation page or message
        } else {
            // Failure: No user found with the given ID
            console.log('User deletion failed');
            res.redirect('/points/retailer'); // Redirect to an error page
        }
    } catch (err) {
        console.error(`Error while deleting user: ${err.message}`);
        res.redirect('/points/retailer'); // Handle error appropriately
    }
});


// Logout
app.post('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
  });

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});