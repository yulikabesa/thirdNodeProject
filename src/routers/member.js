const express = require('express');
const Member = require('../models/member');
const Team = require('../models/team');
const router = new express.Router();
const auth = require('../middleware/auth');

// sign up

router.post('/members',async (req, res) => {
    if(req.body.team){
        const team = await Team.findOne({ name: req.body.team});

        if (!team){
            return res.status(400).send();
        }
        req.body.team = team._id;
    }
    const member = new Member(req.body);

    try {
        await member.save();
        console.log(member);
        const token = await member.generateAuthToken();
        res.status(201).send({ member, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

// login

router.post('/members/login', async (req, res) => {
    try{
        const member = await Member.findByCredentials(req.body.IDF_number, req.body.password);
        const token = await member.generateAuthToken();
        res.send({ member, token });
    } catch (e){
        res.status(400).send();
    }
});

// logout

router.post('/members/logout', auth, async (req, res) => {
    try {
        req.member.tokens = req.member.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.member.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// get your member profile

router.get('/members/me', auth, async (req, res) => {
    res.send(req.member);
});


// get by id

router.get('/members/:id', auth, async (req, res) => {
    try{
        const member = await Member.findById(req.params.id);

        if(!member){
            return res.status(404).send();
        }
        res.send(member);
    } catch (e) {
        res.status(500).send();
    }
});

// update

router.patch('/members/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','IDF_number','password','team'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(req.body.team){
        const team = await Team.findOne({ name: req.body.team});

        if (!team){
            return res.status(400).send();
        }
        req.body.team = team._id;
    }

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates! '})
    }

    try {
        updates.forEach((update) => req.member[update] = req.body[update]);
        await req.member.save();
        return res.send(req.member);
    } catch (e) {
        res.status(400).send(e);
    }
});

// delete

router.delete('/members/me', auth, async (req, res) => {
    try {
        await req.member.remove();
        res.send(req.member);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;