import API from "./index";

export const myTickets = (params) =>
    API.get("/api/support/my-tickets", { params }).then(r => r.data);

export const getMyTicket = (id) =>
    API.get(`/api/support/tickets/${id}`).then(r => r.data); // public msgs only

export const createMyTicket = (payload) =>
    API.post("/api/support/tickets", payload).then(r => r.data); // {subject, body, category, priority}

export const replyMyTicket = (id, payload) =>
    API.post(`/api/support/tickets/${id}/replies`, payload).then(r => r.data); // {body}
