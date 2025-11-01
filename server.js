const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");

const app = new Koa();
app.use(bodyParser());
app.use(cors());

let tickets = [];
let idCounter = 1;

app.use(async (ctx) => {
  const { method } = ctx.query;
  switch (method) {
    case "allTickets": {
      ctx.body = tickets.map(({ id, name, status, created }) => ({
        id,
        name,
        status,
        created,
      }));
      break;
    }
    case "ticketById": {
      const ticketId = parseInt(ctx.query.id, 10);
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        ctx.body = ticket;
      } else {
        ctx.status = 404;
        ctx.body = { error: "Ticket not found" };
      }
      break;
    }
    case "createTicket": {
      const { name, description, status } = ctx.request.body;
      if (!name || !description) {
        ctx.status = 400;
        ctx.body = { error: "Name and description are required" };
        return;
      }
      const newTicket = {
        id: idCounter++,
        name,
        description,
        status: status || false,
        created: Date.now(),
      };
      tickets.push(newTicket);
      ctx.body = newTicket;
      break;
    }
    case "updateById": {
      const ticketId = parseInt(ctx.query.id, 10);
      const { name, description, status } = ctx.request.body;
      const ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket) {
        ctx.status = 404;
        ctx.body = { error: "Ticket not found" };
        return;
      }
      if (name !== undefined) ticket.name = name;
      if (description !== undefined) ticket.description = description;
      if (status !== undefined) ticket.status = status;
      ctx.body = ticket;
      break;
    }
    case "deleteById": {
      const ticketId = parseInt(ctx.query.id, 10);
      const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
      if (ticketIndex === -1) {
        ctx.status = 404;
        ctx.body = { error: "Ticket not found" };
        return;
      }
      tickets.splice(ticketIndex, 1);
      ctx.status = 204;
      break;
    }
    default: {
      ctx.status = 404;
      ctx.body = { error: "Method not found" };
      break;
    }
  }
});

app.listen(3000, () => console.log("Server is running on port 3000"));
