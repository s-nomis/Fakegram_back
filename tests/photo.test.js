const request = require('supertest');
const app = require('../src/app');
const db = require('./fixtures/db');
const Photo = require('../src/models/photo.model');

beforeAll(() => {
    return db.setupDB();
});


afterAll(() => {
    return db.clearDB();
})

describe('POST /photos', function() {
    it('Should create a photo for an authenticate user', async () => {
        const response = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .field('title', "Titre pour la photo test")
            .field('description', "Test description")
            .attach('image', "./tests/fixtures/image_test.jpg")
            .expect(201);

        const photo = await Photo.findById(response.body._id);
        expect(photo).not.toBeNull();
        expect(photo.title).toBe("Titre pour la photo test");
        expect(photo.description).toBe("Test description");
    });

    it('Should failed to create a photo without file', async() => {
        const response = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .field('title', "Titre pour la photo test")
            .field('description', "Test description")
            .expect(500);
    });

    it('Should failed to create a photo without authentication', async () => {
        const response = await request(app)
            .post('/photos')
            .field('title', "Titre pour la photo test")
            .field('description', "Test description")
            .attach('image', "./tests/fixtures/image_test.jpg")
            .expect(501);
    });
});

describe('GET /photos', function() {
    it('Should get all photos', async () => {
        const response = await request(app)
            .get('/photos/')
            .expect(200)
    });
});

describe('GET /photos/:photoId', function() {
    it('Should get a specific photo with its id', async () => {
        const response = await request(app)
            .get('/photos/' + db.photoOneId)
            .expect(200)
    });
});

describe('PATCH /photos/:photoId', function() {
    it('Should update all photos fields succesfully', async () => {
        const response = await request(app)
            .patch('/photos/' + db.photoOneId)
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .field('title', "Photo 1 updated")
            .field('description', "String ficelle old")
            .attach('image', "./tests/fixtures/image_test.jpg")
            .expect(200);

        const photo = await Photo.findById(db.photoOneId);
        expect(photo).not.toBeNull();
        expect(photo.title).toBe("Photo 1 updated");
        expect(photo.description).toBe("String ficelle old");
    });

    it('Should update some photos fields succesfully', async () => {
        const response = await request(app)
            .patch('/photos/' + db.photoTwoId)
            .set('Authorization', `Bearer ${db.userTwo.token}`)
            .send({
                title: "Photo 2 Updated",
                description: "Description 2"
            })
            .expect(200);

        const photo = await Photo.findById(db.photoTwoId);
        expect(photo).not.toBeNull();
        expect(photo.title).toBe("Photo 2 Updated");
        expect(photo.description).toBe("Description 2");
    });

    it('Should failed to update because owner is not authenticated', async () => {
        const response = await request(app)
            .patch('/photos/' + db.photoOneId)
            .field('title', "Photo 1 updated")
            .field('description', "String ficelle old")
            .attach('image', "./tests/fixtures/image_test.jpg")
            .expect(501);
    });

    it('Should failed to update because user is not the owner', async () => {
        const response = await request(app)
            .patch('/photos/' + db.photoThreeId)
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .send({
                title: "Photo 2 Updated",
                description: "Description 2"
            })
            .expect(404);
    });

    it('Should failed to update because of invalid fields', async () => {
        const response = await request(app)
            .patch('/photos/' + db.photoThreeId)
            .set('Authorization', `Bearer ${db.userOne.token}`)
            .send({
                titel: "Fake title"
            })
            .expect(400);
    });
});

describe('DELETE /photos/:photoId', function() {
    it('Should delete a photo from owner', async () => {
        const response = await request(app)
            .delete('/photos/' + db.photoThreeId)
            .set('Authorization', `Bearer ${db.userThree.token}`)
            .expect(200);

        const photo = await Photo.findById(db.photoThreeId);
        expect(photo).toBeNull();
    });

    it('Should failed to delete a photo because user is not the owner', async () => {
        const response = await request(app)
            .delete('/photos/' + db.photoTwoId)
            .set('Authorization', `Bearer ${db.userThree.token}`)
            .expect(404);

        const photo = await Photo.findById(db.photoTwoId);
        expect(photo).not.toBeNull();
    });

    it('Should failed to delete a photo because owner is not authenticated', async () => {
        const response = await request(app)
            .delete('/photos/' + db.photoOneId)
            .expect(501);

        const photo = await Photo.findById(db.photoOneId);
        expect(photo).not.toBeNull();
    });
});