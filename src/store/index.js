import { configureStore } from '@reduxjs/toolkit';
import whatsapp from './slices/whatsappSlice';
import alerts from './slices/alertsSlice';
import dealerSupportReducer from "./slices/dealerSupportSlice";


export default configureStore({
    reducer: {
        wa: whatsapp, alerts, dealerSupportReducer
    },
    middleware: (gDM) => gDM({ serializableCheck: false }),
    devTools: process.env.NODE_ENV !== "production",
});
