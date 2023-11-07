const router = require('express').Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Schema
const authSchema = require('../models/auth');

router.post('/register', async (req, res) => {

    try {
        // const { data } = req.body;
        // const { firstname, surname, email, username, password } = data;
        const { firstname, surname, email, username, password } = req.body;
        if (!firstname || !surname || !email || !username || !password) {
            return res.status(400).json({ status: false, message: 'Firstname, Surname, Email, Username, and Password are required' });
        }
        const decodedPassword = Buffer.from(password, 'base64').toString('utf8');
        const existingUser = await authSchema.find({
            $or: [{ email }, { username }]
        }, 'email username');

        if (existingUser.length > 0) {
            return res.status(409).json({ status: false, message: 'Email or username already exists' });
        }

        if (decodedPassword.length < 8) {
            return res.status(400).json({ status: false, message: 'Password must be at least 8 characters long' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(decodedPassword, salt);

        const newUser = new authSchema({
            firstname,
            surname,
            email,
            username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            status: true,
            message: 'Auth registered successfully',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ status: false, message: 'Email / Username and Password are required' });
        }

        const existingUser = await authSchema.findOne({
            $or: [
                { email: username },
                { username: username }
            ]
        });

        if (!existingUser) {
            return res.status(409).json({ status: false, message: "Can't find Username or Email on Server" });
        }
        var depassword = Buffer.from(password, 'base64').toString('utf8');

        const isPasswordCorrect = bcrypt.compareSync(depassword, existingUser.password);
        if (!isPasswordCorrect) {

            return res.status(401).json({ status: false, message: "Passwords do not match" });
        }

        const payload = {
            email: existingUser.email,
            name: existingUser.username,
            time: new Date()
        }

        const accessToken = jwt.sign(payload, fs.readFileSync(path.join(__dirname, '../key.pem')), { expiresIn: '12h' });

        if (accessToken !== existingUser.loginToken) {
            await authSchema.findOneAndUpdate({ email: existingUser.email, username: existingUser.username }, { loginToken: accessToken });
        }
        
        res.status(200).json({
            status: true,
            message: 'Successfully Login',
            accessToken: accessToken,
            // expiredIn: (new Date().getTime() + 12 * 60 * 60) / 1000, // 12 hours
            user: {
                firstname: existingUser.firstname,
                surname: existingUser.surname,
                email: existingUser.email,
                name: existingUser.username,
                role: existingUser.role,
            }
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Internal server error'
        });
    }
})

module.exports = router;