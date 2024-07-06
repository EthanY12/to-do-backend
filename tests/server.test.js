import axios from 'axios';
import ticketService from './ticketService';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

describe('ticketService', () => {
  afterEach(() => {
    mock.reset();
  });

  describe('getTickets', () => {
    it('should fetch all tickets', async () => {
      const mockTickets = [
        { id: 1, title: 'Test Ticket 1', description: 'Test Description 1' },
        { id: 2, title: 'Test Ticket 2', description: 'Test Description 2' },
      ];
      mock.onGet('http://localhost:5000/tickets').reply(200, mockTickets);

      const result = await ticketService.getTickets();

      expect(result.data).toEqual(mockTickets);
    });
  });

  describe('createTicket', () => {
    it('should create a new ticket', async () => {
      const newTicket = { title: 'New Ticket', description: 'New Description' };
      const mockResponse = { ...newTicket, id: 3 };
      mock.onPost('http://localhost:5000/tickets').reply(200, mockResponse);

      const result = await ticketService.createTicket(newTicket);

      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('updateTicket', () => {
    it('should update an existing ticket', async () => {
      const updatedTicket = { title: 'Updated Ticket', description: 'Updated Description' };
      mock.onPut('http://localhost:5000/tickets/1').reply(200, updatedTicket);

      const result = await ticketService.updateTicket(1, updatedTicket);

      expect(result.data).toEqual(updatedTicket);
    });
  });

  describe('deleteTicket', () => {
    it('should delete a ticket', async () => {
      mock.onDelete('http://localhost:5000/tickets/1').reply(200);

      const result = await ticketService.deleteTicket(1);

      expect(result.status).toBe(200);
    });
  });
});
