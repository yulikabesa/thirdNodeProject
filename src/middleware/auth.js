const jwt = require('jsonwebtoken');
const Member = require('../models/member');

const auth = async (req, res, next) => {
    try {
        const token = req.header('authorization').replace('Bearer ','');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const member = await Member.findOne({ _id: decoded._id, 'tokens.token': token});

        if (!member){
            throw new Error();
        }

        req.token = token;
        req.member = member;
        next();

    } catch (e) {
        res.status(401).send({'error': 'Please authenticate'});
    }
}

const teamleaderAuth = async (req, res, next) => {
    try {
        if (!req.member.isLeader){
            throw new Error();
        }
        next();
    } catch (e) {
        res.status(401).send({'error': 'This action can only be done by a team leader'});
    }
}

module.exports = {auth, teamleaderAuth};