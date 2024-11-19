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


app.get('/points', (req, res) => {
    sql = 'select * from loyaltypoints';
    db.query(sql).then(results => {
        console.log(results)
            results.filter((user)=>{
             if (user.name===res.req.query.username && user.isRetail==="NO"){
                return res.render('card', { points:user.points,cusName:user.name});
             }
        
             else if(user.name===res.req.query.username && user.isRetail==="YES"){
                return res.render('userList',{users:results});
             }
             
        })

       
    });
        
  });




// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});