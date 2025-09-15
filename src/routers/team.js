const express = require('express');
const Team = require('../models/team');
const Member = require('../models/member');
const router = new express.Router();
const auth = require('../middleware/auth');

// create

router.post('', auth, async (req, res) => {
    if(req.body.leader){
        const leader = await Member.findOne({ IDF_number: req.body.leader});

        if (!leader){
            return res.status(400).send();
        }
        req.body.leader = leader._id;
    }
    const team = new Team(req.body);
    try {
        await team.save();
        res.status(201).send(team);
    } catch (e) {
        res.status(400).send(e);
    }
});

// get all teams

router.get('', auth, async (req, res) => {
    try {
        const teams = await Team.find({});
        res.send(teams);
    } catch (e) {
        res.status(500).send();
    }
});

// get my team

router.get('/me', auth, async (req, res) => {
    try {
        res.send(req.member.team);
    } catch (e) {
        res.status(500).send();
    }
});

// get team by id

router.get('/:id', auth, async (req, res) => {
    try{
        const team = await Team.findById(req.params.id);

        if(!team){
            return res.status(404).send();
        }
        res.send(team);
    } catch (e) {
        res.status(500).send();
    }
});

// update team by id

router.patch('/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','leader'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(req.body.leader){
        const leader = await Member.findOne({ IDF_number: req.body.leader});

        if (!leader){
            return res.status(400).send();
        }
        req.body.leader = leader;
    }

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates! '})
    }

    try {
        const team = await Team.findById(req.params.id);
        if(!team){
            return res.status(404).send();
        }
        updates.forEach((update) => team[update] = req.body[update]);
        await team.save();
        return res.send(team);
    } catch (e) {
        res.status(400).send(e);
    }
});

// delete team by id

router.delete('/:id', auth, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team){
            return res.status(404).send();
        }
        await team.remove();
        res.send(team);
    } catch (e) {
        res.status(500).send(e);
    }
});

// receives team and returns its leader

router.get('/teamLeader/:teamId', auth, async (req, res) => {
    try{
        const team = await Team.findById(req.params.teamId);
        if (team.leader){
            await team.populate('leader');
            return res.send({leader: team.leader.name});
        }  
        res.status(400).send();
    } catch (e) {
        res.status(400).send(e);
    }
});

// receives team and returns its members number

router.get('/teamNum/:teamId', auth, async (req, res) => {
    try{
        const team = await Team.findById(req.params.teamId);
        await team.populate('members');
        // if (team){
        //     const count = await Member.countDocuments({ team: req.params.teamId });
        //     return res.send({count});
        // } 
        res.send(team.members.length);
    } catch (e) {
        res.status(400).send(e);
    }
});

// receives member and returns which team he belongs to

router.get('/member/:memberId', auth, async (req, res) => {
    try{
        const member = await Member.findById(req.params.memberId);
        if (member){
            await member.populate('team');
            return res.send({team: member.team.name});
        }  
        res.status(400).send();
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;