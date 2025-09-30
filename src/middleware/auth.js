const jwt = require('jsonwebtoken');
const Member = require('../models/member');
const { StatusCodes } = require('http-status-codes');

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
        res.status(StatusCodes.UNAUTHORIZED).send({'error': 'Please authenticate'});
    }
}

const teamleaderAuth = (req, res, next) => {
    if (!req.member.isLeader){
        res.status(StatusCodes.UNAUTHORIZED).send({'error': 'This action can only be done by a team leader'});
    }
    next();
}

module.exports = {auth, teamleaderAuth};