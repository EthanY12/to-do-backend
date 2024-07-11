const request = require('supertest');
const app = require('../../server'); // Adjust the path to your server file
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './test-database.sqlite', // Use a separate database for tests
  logging: false,
});

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Sync all models
});

describe('User Registration and Login', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered');
  });

  it('should login an existing user', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
  });
});

describe('Ticket Endpoints', () => {
  let userId;
  beforeAll(async () => {
    const userResponse = await request(app)
      .post('/register')
      .send({
        username: 'ticketuser',
        password: 'password123'
      });
    userId = userResponse.body.id;


    const user = await request(app)
      .post('/login')
      .send({
        username: 'ticketuser',
        password: 'password123'
      });
    userId = user.body.user.id;
  });

  it('should create a new ticket', async () => {
    const response = await request(app)
      .post('/tickets')
      .send({
        title: 'Test Ticket',
        description: 'Test Description',
        date: '2024-06-25',
        time: '10:00 AM',
        userId: userId 
      });
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Test Ticket');
  });

  it('should get all tickets', async () => {
    const response = await request(app).get('/tickets');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should update a ticket', async () => {
    const ticket = await request(app)
      .post('/tickets')
      .send({
        title: 'Update Test Ticket',
        description: 'Test Description',
        date: '2024-06-25',
        time: '10:00 AM',
        userId: userId
      });
    const response = await request(app)
      .put(`/tickets/${ticket.body.id}`)
      .send({
        title: 'Updated Ticket Title'
      });
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Ticket Title');
  });

  it('should delete a ticket', async () => {
    const ticket = await request(app)
      .post('/tickets')
      .send({
        title: 'Delete Test Ticket',
        description: 'Test Description',
        date: '2024-06-25',
        time: '10:00 AM',
        userId: userId
      });
    const response = await request(app).delete(`/tickets/${ticket.body.id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Ticket deleted');
  });
});
