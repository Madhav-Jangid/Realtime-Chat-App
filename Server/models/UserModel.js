const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: false
    },
    userCreatedOn: {
        type: Date,
        default: Date.now()
    },
    friendList: [{
        type: String,
        required: false
    }],
    friendRequests: [{
        user: {
            type: String,
            required: true
        },
        isAccepted: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: Date.now()
        }
    }],
    groupRequests: [{
        user: {
            type: String,
            required: true
        },
        isAccepted: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: Date.now()
        }
    }],
    notifications: [{
        user: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        isRead: {
            type: Boolean,
            default: false
        }
    }]
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
