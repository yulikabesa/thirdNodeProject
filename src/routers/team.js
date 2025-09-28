const express = require('express');
const Team = require('../models/team');
const Member = require('../models/member');
const router = new express.Router();
const {auth, teamleaderAuth} = require('../middleware/auth');

// create

router.post('', [auth, teamleaderAuth], async (req, res) => {
    if(req.body.leader){
        const leader = await Member.findOne({ IDF_number: req.body.leader});

        if (!leader){
            return res.status(400).send();
        }
        leader.isLeader = true; 
        await leader.save();
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
        await req.member.populate('team');
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

router.patch('/:id', [auth, teamleaderAuth], async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','leader'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates! '})
    }

    try {
        const team = await Team.findById(req.params.id);
        if(!team){
            return res.status(404).send();
        }

        if(req.body.leader){
            const leader = await Member.findOne({ IDF_number: req.body.leader});

            if (!leader){
                return res.status(400).send();
            }

            if (team.leader){
                await team.populate('leader');
                if (team.leader.id !== leader.id){
                    team.leader.isLeader = false;
                }
                team.leader.team = team;
                await team.leader.save();
            }

            leader.isLeader = true;
            await leader.save();
            req.body.leader = leader;
        }

        updates.forEach((update) => team[update] = req.body[update]);
        await team.save();
        return res.send(team);
    } catch (e) {
        res.status(400).send(e);
    }
});

// delete team by id

router.delete('/:id', [auth, teamleaderAuth], async (req, res) => {
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
         if (!team){
            res.status(400).send();
        } 
        await team.populate('members');
        res.send(team.members.length.toString());
    } catch (e) {
        res.status(400).send(e);
    }
});

// receives member and returns which team he belongs to

router.get('/member/:memberId', auth, async (req, res) => {
    try {
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