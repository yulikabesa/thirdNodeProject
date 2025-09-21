const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Team = require('./team');
const { required } = require('nodemon/lib/config');

const memberSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error('password cannot contain "password"');
            }
        }
    },
    IDF_number: {
        type: Number,
        required: true, 
        trim: true,
        unique: true,
        validate(value) {
            if (value.toString().length !== 7) {
                throw new Error('length must be 7!');
            }
        }
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Team'
    },
    isLeader: {
        type: Boolean,
        default: false

    },
    enlistmentDate: {
        type: Date,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

memberSchema.methods.toJSON = function () {
    const member = this;
    const memberObject = member.toObject();

    delete memberObject.password;
    delete memberObject.tokens;

    return memberObject;
}

memberSchema.methods.generateAuthToken = async function() {
    const member = this;
    const token = jwt.sign({ _id: member.id.toString() }, process.env.JWT_SECRET);
    
    member.tokens = member.tokens.concat({ token });
    await member.save();

    return token;
}

memberSchema.statics.findByCredentials = async (IDF_number,password) => {
    const member = await Member.findOne({ IDF_number });

    if (!member) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, member.password);

    if (!isMatch){
        throw new Error('Unable to login');
    }

    return member;
}

// Hash the plain text password before saving
memberSchema.pre('save', async function (next) {
    const member = this;

    if (member.isModified('password')){
        member.password = await bcrypt.hash(member.password, 8);
    }

    next();
}); 

memberSchema.pre('remove', async function(next) {
    const member = this;
    if (member.team){
        const team = await Team.findOne({_id: member.team});
        if( team.leader.equals(member._id)){
            team.set('leader', undefined);
            await team.save();
        }
    }
    next();
})


const Member = mongoose.model('Member', memberSchema);
module.exports = Member;