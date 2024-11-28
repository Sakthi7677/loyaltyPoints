// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));
app.set('view engine', 'pug');
app.set('views', './app/views');
// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - /
app.get("/", function(req, res) {
   res.render("index");
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
        if(row.role==="customer"){
            return res.render('card', { points:row.points,cusName:row.name});
        }
            });
    
});


// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});