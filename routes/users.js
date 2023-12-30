const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = (connection) => {

    // let users = [];

    router.post("/register", async (req, res) => {
        const { username, password } = req.body.user;
        if (!username || !password) {
            return res.status(400).json({ message: "Incomplete data" });
        }
        // const hashedPassword = await bcrypt.hash(password, 10);
        connection.query('SELECT username FROM users WHERE username = ?', [username], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            } else if (result.length > 0) {
                return res.status(403).json({ message: "User already exists" });
            } else {
                connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (insertErr) => {
                    if (insertErr) {
                        return res.status(500).json({ message: "Database error on user creation" });
                    }
                    return res.status(200).json({ message: "User added successfully" });
                });
            }
        });
    });

    // router.post("/register", (req, res) => {
    //     const register = req.body.user;
    //     const filtered = users.filter((user) => user.username === register.username);
    //     if (!register.username || !register.password) {
    //         return res.status(400).json({ message: "Incomplete data" });
    //     } else if (filtered.length > 0) {
    //         return res.status(403).json({ message: "User already exists" });
    //     } else {
    //         users.push({ "username": register.username, "password": register.password });
    //         return res.status(200).json({ message: "User added successfully" });
    //     }
    // });

    router.post("/login", (req, res) => {
        const user = req.body.user;
        const filtered = users.filter((userData) => userData.username === user.username && userData.password === user.password);
        if (filtered.length < 1) { 
            return res.status(401).json({ message: false }) 
        }
        let accessToken = jwt.sign({ data: user }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 60 });
        req.session.authorization = { accessToken:accessToken };
        console.log('Session after setting JWT:', req.session.authorization['accessToken']);
        return res.status(200).json({ message: true });
    });

    router.get('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Error logging out' });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logout successful' });
        });
    });

    // module.exports = router;

return router

}