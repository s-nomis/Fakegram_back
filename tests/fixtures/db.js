const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../../src/models/user.model');
const Photo = require('../../src/models/photo.model');
const Comment = require('../../src/models/comment.model');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    username: "userOne",
    email: "userOne@email.com",
    password: "azerty",
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
}

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    username: "userTwo",
    email: "userTwo@email.com",
    password: "azerty",
    token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
}

const userThreeId = new mongoose.Types.ObjectId();
const userThree = {
    _id: userThreeId,
    username: "userThree",
    email: "userThree@email.com",
    password: "azerty",
    token: jwt.sign({ _id: userThreeId }, process.env.JWT_SECRET),
}

const photoOneId = new mongoose.Types.ObjectId();
const photoOne = {
    _id: photoOneId,
    title: 'Photo 1',
    description: "String ficelle",
    image: "http://localhost:3000/photos/test-one.jpg",
    owner: userOneId
}

const photoTwoId = new mongoose.Types.ObjectId();
const photoTwo = {
    _id: photoTwoId,
    title: 'Photo 2',
    description: "String ficelle encore",
    image: "http://localhost:3000/photos/test-two.jpg",
    owner: userTwoId
}


const photoThreeId = new mongoose.Types.ObjectId();
const photoThree = {
    _id: photoThreeId,
    title: 'Photo 3',
    image: "http://localhost:3000/photos/test-three.jpg",
    owner: userThreeId
}

const commentOneId = new mongoose.Types.ObjectId();
const commentOne = {
    _id: commentOneId,
    content: 'salope',
    owner: userOneId,
    photo: photoOneId,
}

const commentTwoId = new mongoose.Types.ObjectId();
const commentTwo = {
    _id: commentTwoId,
    content: 'beau string',
    owner: userOneId,
    photo: photoTwoId,
}

const commentThreeId = new mongoose.Types.ObjectId();
const commentThree = {
    _id: commentThreeId,
    content: 'bon cul',
    owner: userThreeId,
    photo: photoTwoId,
}

const setupDB = async () => {
    await clearDB();

    await new User(userOne).save()
    await new User(userTwo).save()
    await new User(userThree).save()

    await new Photo(photoOne).save()
    await new Photo(photoTwo).save()
    await new Photo(photoThree).save()

    await new Comment(commentOne).save();
    await new Comment(commentTwo).save();
    await new Comment(commentThree).save();
}

const clearDB = async () => {
    await User.deleteMany();
    await Photo.deleteMany();
    await Comment.deleteMany();
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    userThreeId,
    userThree,
    photoOneId,
    photoOne,
    photoTwoId,
    photoTwo,
    photoThreeId,
    photoThree,
    commentOneId,
    commentOne,
    commentTwoId,
    commentTwo,
    commentThreeId,
    commentThree,
    setupDB,
    clearDB,
}