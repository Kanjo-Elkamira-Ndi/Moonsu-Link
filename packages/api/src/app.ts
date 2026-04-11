// src/app.ts
import express from 'express';
import cors from 'cors';
import userRoute from './routes/userRoute';
import cropRoute from './routes/cropRoute';
import listingRoute from './routes/listingRoute';
import cropPriceRoute from './routes/cropPriceRoute';
import listingInterestRoute from './routes/listingInterestRoute';
import authRouter from './routes/authRoute'
import { sanitizeRequest } from './middleware/SanitizeMiddleware'
import alertRoute from './routes/alertRoute'

export const createApp = () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(sanitizeRequest())
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', ts: new Date().toISOString() });
    });
    // app.use('/', webhookRoute);
    app.use('/users', userRoute);
    app.use('/crops', cropRoute);
    app.use('/listings', listingRoute);
    app.use('/crop_prices', cropPriceRoute);
    app.use('/listing_interests', listingInterestRoute);
    app.use('/auth', authRouter)
    app.use('/alerts', alertRoute);

    return app;
};