const request = require('supertest');
const app = require('../src/app');
const Comment = require('../src/models/comment.model');
const db = require('./fixtures/db');

beforeAll(() => {
    return db.setupDB();
});

afterAll(() => {
    return db.clearDB();
});

describe('POST /photos/:photoId/comments', function() {
    it('Should create a comment on a photo', async () => {
        const response = await request(app)
            .post('/photos/' + db.photoThreeId + '/comments')
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .send({
                content: 'Test commentaire'
            })
            .expect(201);

        const comment = await Comment.findById(response.body._id);
        expect(comment).not.toBeNull();
    });

    it('Should failed because photo is not found', async () => {
        const response = await request(app)
            .post('/photos/' + db.userOneId + '/comments')
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .send({
                content: 'Test commentaire'
            })
            .expect(404);
    });

    it('Should failed because user is not authenticated', async () => {
        const response = await request(app)
            .post('/photos/' + db.photoThreeId + '/comments')
            .send({
                content: 'Test commentaire'
            })
            .expect(501);
    });
});

describe('GET /photos/:photoId/comments', function() {
    it('Should get all comments on a photo', async () => {
        const response = await request(app)
            .get('/photos/' + db.photoTwoId + '/comments')
            .expect(200);
    });
});

describe('GET /photos/:photoId/comments/:commentId', function() {
    it('Should get a comment on a photo', async () => {
        const response = await request(app)
            .get('/photos/' + db.photoTwoId + '/comments/' + db.commentTwoId)
            .expect(200);
    });

    it('Should failed to get a comment with the id of another photo', async () => {
        const response = await request(app)
            .get('/photos/' + db.photoOneId + '/comments/' + db.commentTwoId)
            .expect(404);
    });

    it('Should failed to get a comment with wrong id', async () => {
        const response = await request(app)
            .get('/photos/' + db.photoOneId + '/comments/' + db.userOneId)
            .expect(404);
    });
});

describe('PATCH /photos/:photoId/comments/:commentId', function() {
    it('Should update the content of a comment', async () => {
        const response = await request(app)
            .patch('/photos/' + db.photoOneId + '/comments/' + db.commentOneId)
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .send({
                content: "First comment update"
            })
            .expect(200);

        const comment = await Comment.findById(response.body._id);
        expect(comment).not.toBeNull();
        expect(comment.content).toBe("First comment update");
    });

    it('Should failed to update the content of a comment because of invalid field', async () => {
        const response = await request(app)
            .patch('/photos/' + db.photoOneId + '/comments/' + db.commentOneId)
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .send({
                contents: "Failed update"
            })
            .expect(400);

        const comment = await Comment.findById(db.commentOneId);
        expect(comment).not.toBeNull();
        expect(comment.content).not.toBe("Failed update");
    });
});

describe('DELETE /photos/:photoId/comments/:commentId', function() {
    it('Should delete a comment', async () => {
        const response = await request(app)
            .delete('/photos/' + db.photoTwoId + '/comments/' + db.commentThreeId)
            .set('Authorization', `Bearer ${db.userThree.token}`)
            .expect(200);

        const comment = await Comment.findById(db.commentThreeId);
        expect(comment).toBeNull();
    });

    it('Should failed to delete a comment with a wrong photos id', async () => {
        const response = await request(app)
            .delete('/photos/' + db.photoOneId + '/comments/' + db.commentTwoId)
            .set('Authorization', `Bearer ${db.userThree.token}`)
            .expect(404);

        const comment = await Comment.findById(db.commentTwoId);
        expect(comment).not.toBeNull();
    });

    it('Should failed to delete a comment because of wrong owner', async () => {
        const response = await request(app)
            .delete('/photos/' + db.photoOneId + '/comments/' + db.commentOneId)
            .set('Authorization', `Bearer ${db.userThree.token}`)
            .expect(404);

        const comment = await Comment.findById(db.commentOneId);
        expect(comment).not.toBeNull();
    });
});