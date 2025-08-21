import axios from "./axios"; // your pre-configured axios instance

export const listContacts = ({ q, type, tag, page, limit, sort }) => axios.get("/api/crm/contacts", { params }).then(r => r.data);

export const getContact = (id) =>
    axios.get(`/api/crm/contacts/${id}`).then(r => r.data);

export const createContact = (payload) =>
    axios.post("/api/crm/contacts", payload).then(r => r.data);

export const updateContact = (id, payload) =>
    axios.put(`/api/crm/contacts/${id}`, payload).then(r => r.data);

export const deleteContact = (id) =>
    axios.delete(`/api/crm/contacts/${id}`).then(r => r.data);

export const touchContact = (id, when) =>
    axios.post(`/api/crm/contacts/${id}/touch`, { when }).then(r => r.data);
