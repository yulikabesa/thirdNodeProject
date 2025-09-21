const mongoose = require('mongoose');
const Member = require('./member');

const teamSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Member'
    }
});

teamSchema.virtual('members', {
    ref: 'Member',
    localField: '_id',
    foreignField: 'team'
});

// teamSchema.virtual('size').get(async function() {
//     await this.populate('members');
//     return this.members.length.toString();
// });

// when team is removed, deletes the team propery for every member that was in it
teamSchema.pre('remove', async function(next) {
    const team = this;
    const Member = require('./member');
    const members = await Member.find({team: team._id});
    console.log(members);
    for (const member of members) {
        if (member.team){
            await member.populate('team');
            member.set('team', undefined);
            await member.save();
        }
    }
    next();
})

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;