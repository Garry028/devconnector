const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth")
const User = require('../../models/User')
const { check, body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config=require("config")

// @route   GET api/auth

router.get("/", auth, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

// POST api/auth
// authenticate user & get token
// public
router.post("/", [

    check("email", "please include valid email").isEmail(),
    check("password", "password is required").exists()
],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // see if user exists
            let user = await User.findOne({ email });
            if (!user) {
                res.status(400)
                    .json({ errors: [{ msg: "Invalid Credentials" }] });
            }
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                res.status(400)
                    .json({ errors: [{ msg: "Invalid Credentials" }] });
            }
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token })
                }
            )
 
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Server error");
        }

    })


module.exports = router;