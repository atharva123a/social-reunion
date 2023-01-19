const { User, Post } = require('./test');

let chaiHttp = require('chai-http');
const chai = require('chai');

const server = 'https://reunion-backend-atharva-salokhe.onrender.com'

/*
Since render can be slow sometimes, please feel free to run the application locally
*/

// const server = 'http://localhost:3000'

chai.should();

chai.use(chaiHttp);


// user object to check for user creation:
const user = new User("atharvarsalokhe2@gmail.com", "qwerty@1234", "")

// post object to test for post creation:
const post = new Post('Blue Lock', "A story about football that is more than just football!")

describe('Testing User APIs', () => {

    // Positive test that checks if bearer token is returned:
    it('Return the bearer token upon logging in', (done) => {
        chai.request(server)
            .post('/api/authenticate')
            .send(user)
            .end((err, response) => {
                response.should.have.status(200);

                response.body.should.be.a("object");
                response.body.should.have.property('success');
                response.body.success.should.be.eq(true);
                response.body.should.have.property('jwt');
                response.body.jwt.should.be.a('string');
                user.token = response.body.jwt;

                done();
            })
    })

    // positive test to check if a token was returned or not:
    it('Check if the user has been created inside DB using token', (done) => {
        chai.request(server).get('/api/user')
            .set({ "Authorization": `Bearer ${user.token}` }).end((err, response) => {
                response.should.have.status(200);
                response.body.should.be.a("object");
                response.body.should.have.property('success');
                response.body.success.should.be.eq(true);
                response.body.should.have.property('data');

                response.body.data.should.be.a("object");
                response.body.data.should.have.property('username');
                response.body.data.should.have.property('numOfFollowers');
                response.body.data.should.have.property('numOfFollowing');

                response.body.data.username.should.be.a('string')
                response.body.data.numOfFollowers.should.be.a('number')
                response.body.data.numOfFollowing.should.be.a('number')

                done();
            })

    })
})

describe('Testing for Posts APIs', () => {

    // Negative Test to check for post creation without title
    it('Should not create a post without title property', (done) => {

        // does not have post title:
        const post = {
            description: "The post description!"
        }

        // throws bad request and error message:
        chai.request(server)
            .post('/api/posts')
            .send(post)
            .set({ "Authorization": `Bearer ${user.token}` }).end((err, response) => {
                response.should.have.status(400);

                // testing for response object type:
                response.body.should.be.a("object");
                response.body.should.have.property('success');
                response.body.success.should.be.eq(false);
                response.body.should.have.property('message');
                response.body.message.should.be.eq('Please provide your post title!');

                done();
            })
    })

    // Positive Test case to check if a post was infact created:
    it('Create a post by passing in the right parameters', (done) => {

        chai.request(server)
            .post('/api/posts').send(post)
            .set({ "Authorization": `Bearer ${user.token}` }).end((err, response) => {
                response.should.have.status(200);
                // testing for response object type:
                response.body.should.be.a("object");
                response.body.should.have.property('success');
                response.body.success.should.be.eq(true);
                response.body.data.should.have.property('creationTime');
                response.body.data.should.have.property('title');
                response.body.data.should.have.property('desc');
                response.body.data.should.have.property('_id');

                response.body.data.creationTime.should.be.a('string');
                response.body.data.title.should.be.a('string');
                response.body.data.desc.should.be.a('string');
                response.body.data._id.should.be.a('string');

                // we will store this postId to check inside posts to see if it was actually generated:
                post._id = response.body.data._id;
                post.creationTime = response.body.data.creationTime;
                done();
            })
    })


    // Confirmation for post creation:
    it('Confirmationf for post creation', (done) => {
        chai.request(server).get(`/api/posts/${post._id}`)
            .end((err, response) => {
                response.should.have.status(200);

                response.body.should.have.property('success');
                response.body.success.should.be.eq(true);


                response.body.data.should.have.property('_id');
                response.body.data.should.have.property('title');
                response.body.data.should.have.property('desc');
                response.body.data.should.have.property('created_at');
                response.body.data.should.have.property('comments');
                response.body.data.should.have.property('likes');

                response.body.data._id.should.be.a('string');
                response.body.data.title.should.be.a('string');
                response.body.data.desc.should.be.a('string');
                response.body.data.created_at.should.be.a('string');
                // the comments are initially empty, so we test for that!
                response.body.data.comments.should.be.a('array').that.is.empty;
                response.body.data.likes.should.be.a('number');

                response.body.data._id.should.be.eq(post._id);
                response.body.data.title.should.be.eq(post.title);
                response.body.data.desc.should.be.eq(post.description);
                response.body.data.created_at.should.be.eq(post.creationTime);

                // since initially the likes will be 0:
                response.body.data.likes.should.be.eq(0);
                done()
            })
    })

})