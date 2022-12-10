const { json } = require("express");
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator")
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route    POST api/profile
// @desc     create or update user profile
// @access   Private
router.post(
    '/',
    auth,
    check('status', 'Status is required').notEmpty(),
    check('skills', 'Skills is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            website,
            skills,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook,
            location,
            company,
            githubusername,
            bio,
            status

        } = req.body;
        //build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) {
            profileFields.company = company;
        }
        if (website) {
            profileFields.website = website;
        }
        if (location) {
            profileFields.location = location;
        }
        if (bio) {
            profileFields.bio = bio;
        }
        if (status) {
            profileFields.status = status;
        }
        if (githubusername) {
            profileFields.githubusername = githubusername;
        }
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
            // this will covert the comma separated list into array also remaves extra space
        }
        // Build social object
        profileFields.social = {};
        if (youtube) {
            profileFields.youtube = youtube;
        }
        if (twitter) {
            profileFields.twitter = twitter;
        }
        if (facebook) {
            profileFields.facebook = facebook;
        }
        if (linkedin) {
            profileFields.linkedin = linkedin;
        }
        if (instagram) {
            profileFields.instagram = instagram;
        }
        try {
            // Using upsert option (creates new doc if no match is found):
            let profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
            return res.json(profile);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error');
        }
    }
);

// @route    GET api/profile
// @desc     get all profiles
// @access   Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find()
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

// @route    GET api/profile/user/:user_id
// @desc     get  profile by user id
// @access   Public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id });
        if (!profile) {
            return res.status(400).json({ msg:"There is no profile for this user"})
        }
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
module.exports = router;