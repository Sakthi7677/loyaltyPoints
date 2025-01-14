// Get the functions in the db.js file to use
const db = require('../services/db');
const bcrypt = require("bcryptjs");

class User {

    id;
    email;

    constructor(email) {
        this.email = email;
    }
    
    // Get an existing user id from an email address, or return false if not found
    async getIdFromEmail()  {
        var sql = "SELECT id FROM loyaltypoints WHERE email = ?";
        const result = await db.query(sql, [this.email]);
        if (JSON.stringify(result) != '[]') {
            this.id = result[0].id;
            return this.id;
        }
        else {
            return false;
        }
    
    }

    // Add a password to an existing user
    async setUserPassword(password) {
        const pw = await bcrypt.hash(password, 10);
        var sql = "UPDATE loyaltypoints SET password = ? WHERE id = ?"
        const result = await db.query(sql, [pw, this.id]);
        return true;

    }
    
    // Add a new record to the users table    
    async addUser(name, email,password) {
        const pw = await bcrypt.hash(password, 10);
        var sql = "INSERT INTO loyaltypoints (name, points, role, email, password) VALUES (?, 0, ?, ? , ?)";
        const result = await db.query(sql, [name, 'customer', email, pw]);
        console.log(result.insertId);
        this.id = result.insertId;
        return true;
    }

    // Test a submitted password against a stored password
    async authenticate(submitted) {
        var sql = "SELECT password FROM loyaltypoints WHERE id = ?";
        const result = await db.query(sql, [this.id]);
        const match = await bcrypt.compare(submitted, result[0].password);
        if (match == true) {
            return true;
        }
        else {
            return false;
        }

    }


}

module.exports  = {
    User
}