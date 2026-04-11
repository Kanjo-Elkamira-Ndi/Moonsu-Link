// src/app.ts
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import userRoute from './routes/userRoute';
import cropRoute from './routes/cropRoute';
import listingRoute from './routes/listingRoute';
import cropPriceRoute from './routes/cropPriceRoute';
import listingInterestRoute from './routes/listingInterestRoute';
import authRouter from './routes/authRoute'
import alertRouter from './routes/alertRoute'
import { sanitizeRequest } from './middleware/SanitizeMiddleware'
import webhookRoute from './routes/webhookRoute'

export const createApp = () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(sanitizeRequest())

    app.use(session({
        secret: process.env.API_SECRET || 'your_secret_key', 
        resave: false,                
        saveUninitialized: false,      
        cookie: { 
            secure: false,              
            maxAge: 60000 * 60 * 2              
        }
    }));

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', ts: new Date().toISOString() });
    });
    app.use('/', webhookRoute);
    app.use('/alerts', alertRouter);
    app.use('/users', userRoute);
    app.use('/crops', cropRoute);
    app.use('/listings', listingRoute);
    app.use('/crop_prices', cropPriceRoute);
    app.use('/listing_interests', listingInterestRoute);
    app.use('/auth', authRouter)

    return app;
};