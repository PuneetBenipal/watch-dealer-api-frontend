import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { myTickets, getMyTicket, createMyTicket, replyMyTicket } from "../../api/dealerSupportApi";

export const fetchMyTickets = createAsyncThunk(
    "dealerSupport/fetchMyTickets",
    async (params, { rejectWithValue }) => {
        try { return await myTickets(params); }
        catch (e) { return rejectWithValue(e?.response?.data || { error: "fetch_failed" }); }
    }
);

export const fetchMyTicket = createAsyncThunk(
    "dealerSupport/fetchMyTicket",
    async (id, { rejectWithValue }) => {
        try { return await getMyTicket(id); }
        catch (e) { return rejectWithValue(e?.response?.data || { error: "fetch_failed" }); }
    }
);

export const createTicket = createAsyncThunk(
    "dealerSupport/createTicket",
    async (payload, { rejectWithValue }) => {
        try { return await createMyTicket(payload); } // → { ok:true, id }
        catch (e) { return rejectWithValue(e?.response?.data || { error: "create_failed" }); }
    }
);

export const sendDealerReply = createAsyncThunk(
    "dealerSupport/sendDealerReply",
    async ({ id, body }, { rejectWithValue }) => {
        try { return await replyMyTicket(id, { body }); } // public reply
        catch (e) { return rejectWithValue(e?.response?.data || { error: "reply_failed" }); }
    }
);

const initialState = {
    // list
    items: [], total: 0, loading: false, error: null,
    q: "", status: undefined, page: 1, limit: 20,

    // ticket
    ticket: null, ticketLoading: false,
    creating: false, replying: false,

    // UI
    newVisible: false, viewVisible: false,
};

const slice = createSlice({
    name: "dealerSupport",
    initialState,
    reducers: {
        setFilters(s, { payload }) { Object.assign(s, payload); if (payload.page === undefined) s.page = 1; },
        setQuery(s, { payload }) { s.q = payload; s.page = 1; },
        showNew(s, { payload }) { s.newVisible = payload; },
        showView(s, { payload }) { s.viewVisible = payload; if (!payload) s.ticket = null; },
    },
    extraReducers: (b) => {
        b.addCase(fetchMyTickets.pending, (s) => { s.loading = true; s.error = null; });
        b.addCase(fetchMyTickets.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload.items || []; s.total = payload.total || 0; });
        b.addCase(fetchMyTickets.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });

        b.addCase(fetchMyTicket.pending, (s) => { s.ticketLoading = true; });
        b.addCase(fetchMyTicket.fulfilled, (s, { payload }) => { s.ticketLoading = false; s.ticket = payload; });
        b.addCase(fetchMyTicket.rejected, (s) => { s.ticketLoading = false; });

        b.addCase(createTicket.pending, (s) => { s.creating = true; });
        b.addCase(createTicket.fulfilled, (s) => { s.creating = false; s.newVisible = false; });
        b.addCase(createTicket.rejected, (s) => { s.creating = false; });

        b.addCase(sendDealerReply.pending, (s) => { s.replying = true; });
        b.addCase(sendDealerReply.fulfilled, (s) => { s.replying = false; });
        b.addCase(sendDealerReply.rejected, (s) => { s.replying = false; });
    }
});

export const { setFilters, setQuery, showNew, showView } = slice.actions;
export default slice.reducer;
