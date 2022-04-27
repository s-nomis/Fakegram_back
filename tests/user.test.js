const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const db = require('./fixtures/db');

beforeAll(() => {
    return db.setupDB();
});

afterAll(() => {
    return db.clearDB();
});

describe('POST /users', function() {
    it('Should sign up a new user', async () => {
        const response = await request(app)
            .post('/users')
            .send({
                username: "userFour",
                email: "userFour@test.com",
                password: "azerty",
            })
            .expect(201);

        const user = await User.findById(response.body.user._id);
        expect(user).not.toBeNull();
        expect(user.username).toBe(response.body.user.username);
        expect(user.email).toBe(response.body.user.email);
    });

    it('Should failed to sign up with username already in db', async () => {
        const response = await request(app)
            .post('/users')
            .send({
                username: "userOne",
                email: "userFive@test.com",
                password: "azerty"
            })
            .expect(500);
    });

    it('Should failed to sign up with email already in db', async () => {
        const response = await request(app)
            .post('/users')
            .send({
                username: "userSix",
                email: "userOne@email.com",
                password: "azerty"
            })
            .expect(500);
    });

    it('Should failed to sign up with missing fields', async () => {
        const response = await request(app)
            .post('/users')
            .send({
                username: "userSeven",
                password: "azerty"
            })
            .expect(500);
    });
});

describe('GET /users', function() {
    it('Should get authenticated user', async () => {
        const response = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .expect(200);
    });

    it('Should fail to get unanthenticated user', async () => {
        const response = await request(app)
            .get('/users')
            .expect(501);
    });
});

describe('PATCH /users', function() {
    it('Should update all authenticated users fields', async () => {
        const response = await request(app)
            .patch('/users')
            .set('Authorization', `Bearer ${db.userTwo.token}`)
            .send({
                username: "updatedUser",
                email: "update@email.com",
                password: "azertyupdate",
            })
            .expect(200);

        const user = await User.findById(db.userTwoId);
        expect(user).not.toBeNull();
        expect(user.username).toBe("updatedUser");
        expect(user.email).toBe("update@email.com");
        expect(user.password).not.toBe("azertyupdate");
    });
    
    it('Should update some authenticated users fields', async () => {
        const response = await request(app)
            .patch('/users')
            .set('Authorization', `Bearer ${db.userThree.token}`)
            .send({
                username: "updatedUserTwo",
            })
            .expect(200);

        const user = await User.findById(db.userThreeId);
        expect(user).not.toBeNull();
        expect(user.username).toBe("updatedUserTwo");
    });

    it('Should failed to update because of user is not authenticated', async () => {
        const response = await request(app)
            .patch('/users')
            .send({
                username: "updated",
            })
            .expect(501);
    });

    it('Should failed to update because of invalid field', async () => {
        const response = await request(app)
            .patch('/users')
            .set('Authorization', `Bearer ${db.userThree.token}`)
            .send({
                name: "userName",
            })
            .expect(400);
    });

    it('Should failed to update because new email is already taken', async () => {
        const response = await request(app)
            .patch('/users')
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .send({
                email: "userThree@email.com",
            })
            .expect(500);
    });
});

describe('DELETE /users', function() {
    it('Should delete authenticated user', async () => {
        const response = await request(app)
            .delete('/users')
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .expect(200);

        const user = await User.findById(db.userOneId);
        expect(user).toBeNull();
    });

    it('Should failed to remove unauthenticated user', async () => {
        const response = await request(app)
            .delete('/users')
            .expect(501);
    })
});