const express = require('express');
const Member = require('../models/member');
const Team = require('../models/team');
const router = new express.Router();
const {auth, teamleaderAuth} = require('../middleware/auth');
const moment = require('moment');

// sign up

router.post('',async (req, res) => {
    try {
        if(req.body.team){
            const team = await Team.findOne({ name: req.body.team});

            if (!team){
                return res.status(400).send();
            }
            req.body.team = team._id;
        }
        req.body.enlistmentDate = new Date(req.body.enlistmentDate);
        const member = new Member(req.body);
        await member.save();
        console.log(member);
        const token = await member.generateAuthToken();
        res.status(201).send({ member, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

// login

router.post('/login', async (req, res) => {
    try{
        const member = await Member.findByCredentials(req.body.IDF_number, req.body.password);
        const token = await member.generateAuthToken();
        res.send({ member, token });
    } catch (e){
        res.status(400).send();
    }
});

// logout

router.post('/logout', auth, async (req, res) => {
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

router.get('/me', auth, async (req, res) => {
    res.send(req.member);
});

// get all members that are not leaders

router.get('/notLeaders', auth, async (req, res) => {
    try {
        const notLeaders = await Member.find({ isLeader: false});
        const names = [];
        notLeaders.forEach((member) => {
            names.push(member.name);
        })
        res.send(names);
    } catch(e) {
        res.status(500).send();
    }
});

// // get all members that enlisted less than a year ago

router.get('/newMembers', auth, async (req, res) => {
    try {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() -1);
        const newMembers = await Member.find({ enlistmentDate : { $gt: oneYearAgo.getTime() } }).limit(5).skip(parseInt(req.query.skip));
        res.send(newMembers);
    } catch(e) {
        res.status(500).send();
    }
});

// sort members by time in service 

router.get('/dateSortMembers', auth, async (req, res) => {
    try {
        const sort = {};
        if (req.query.sortBy){
            sort.enlistmentDate = req.query.sortBy === "desc" ? -1 : 1;
        }
        const members = await Member.find({}).sort(sort);
        res.send(members);
    } catch(e) {
        res.status(500).send();
    }
});



// get by id

router.get('/:id', auth, async (req, res) => {
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

router.patch('/:id', [auth, teamleaderAuth], async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','IDF_number','password','team'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates! '})
    }

    try {
        if(!req.params.id){
            return res.status(400).send();
        }
        const member = await Member.findById(req.params.id);
        if(!member){
            return res.status(404).send();
        }
        if(req.body.team){
            const team = await Team.findOne({ name: req.body.team});

            if (!team){
                return res.status(400).send();
            }
            req.body.team = team._id;
        }
        updates.forEach((update) => member[update] = req.body[update]);
        await member.save();
        return res.send(member);
    } catch (e) {
        res.status(400).send(e);
    }
});

// delete by id

router.delete('/:id', [auth, teamleaderAuth], async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if(!member){
            return res.status(404).send();
        }
        await member.remove();
        res.send(member);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;