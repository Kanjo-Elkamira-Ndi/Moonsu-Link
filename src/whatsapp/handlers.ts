import { UnipileClient } from "unipile-node-sdk";
import { pool } from "../db/pool";
import { getVerifyAlert } from "../services/alertService";
import { getVerifiedListings } from "../services/listingService";
import { getCrops } from "../services/cropService";
import { getCropPrices } from "../services/cropPriceService";
import { getGreeting, getRegionByInput, regions, MAIN_MENU, PS_NOTE } from "./helpers";

type SendFn = (text: string) => Promise<void>;

interface HandlerContext {
    userId: string;
    chatId: string;
    incomingText: string;
    userName: string;
    send: SendFn;
}

const resetToMenu = async (userId: string) => {
    await pool.query(
        `UPDATE message_counters SET counter = 0, response = 0 WHERE user_id = $1`,
        [userId]
    );
};

const setCounter = async (userId: string, counter: number, response: number) => {
    await pool.query(
        `UPDATE message_counters SET counter = $1, response = $2 WHERE user_id = $3`,
        [counter, response, userId]
    );
};

// ── Counter 0: reset state, show main menu ────────────────────────────────────
export const handleCounter0 = async ({ userId, chatId, userName, send }: HandlerContext) => {
    await setCounter(userId, 1, 0);
    await send(`${getGreeting()}, ${userName}. How may we assist you today?`);
    await send(MAIN_MENU);
};

// ── Counter 1: user picks main service ───────────────────────────────────────
export const handleCounter1 = async (ctx: HandlerContext) => {
    const { userId, incomingText, send } = ctx;

    if (incomingText === "1") {
        await send(
            `*Which listing are you particularly interested in?*\n\n` +
            `• *1 All:* Full listing regardless of crop or area.\n` +
            `• *2 Region:* All listings for a specific region.\n` +
            `• *3 Crop:* All listings for a particular crop.\n` +
            `*Reply with a number to continue.*${PS_NOTE}`
        );
        await setCounter(userId, 2, 1);

    } else if (incomingText === "2") {
        await send(
            `*Which market price interests you?*\n\n` +
            `• *1 All:* All available market prices.\n` +
            `• *2 Region:* Market prices for a particular region.\n` +
            `• *3 Crop:* Market price of a crop across different regions.\n` +
            `*Reply with a number to continue.*${PS_NOTE}`
        );
        await setCounter(userId, 2, 10);

    } else if (incomingText === "3") {
        const alerts = await getVerifyAlert();

        if (alerts.length > 0) {
            let text = "📢 *Important Information*\n\n";
            for (const a of alerts) {
                text += `🔹 *Info:* ${a.notice}\n💡 *Advice:* ${a.advice}\n\n`;
            }
            text += "👉 *Reply with anything to return to the main menu.*";
            await send(text);
        } else {
            await send("⚠️ *No information available for now.*");
        }
        await resetToMenu(userId);

    } else {
        await send(`⚠️ *Invalid option.* Please reply with *1*, *2*, or *3*.`);
        await resetToMenu(userId);
    }
};

// ── Counter 2, response 1: listing sub-menu ───────────────────────────────────
const handleListingSubMenu = async (ctx: HandlerContext) => {
    const { userId, incomingText, send } = ctx;

    if (incomingText === "1") {
        const listings = await getVerifiedListings();
        if (listings.length > 0) {
            let text = "🌾 *Available Crop Listings*\n\n";
            for (const l of listings) {
                text += `*${l.crop_name}*\n📦 ${l.quantity_kg} kg\n💰 ${l.price} FCFA/kg\n📍 ${l.town}, ${l.region}\n⏳ Expires: ${new Date(l.expiresAt).toLocaleDateString()}\n\n`;
            }
            await send(text);
        } else {
            await send("⚠️ *No listings available for now.*");
        }
        await resetToMenu(userId);

    } else if (incomingText === "2") {
        let text = "*Select the region of interest:*\n";
        for (const r of regions) {
            text += `\n*${r.id}:* ${r.name}`;
        }
        await send(text);
        await setCounter(userId, 3, 2);

    } else if (incomingText === "3") {
        const crops = await getCrops();
        let text = "*Select the crop of interest:*\n";
        crops.forEach((crop, i) => {
            text += `\n*${i + 1}:* ${crop.name}`;
        });
        await send(text);
        await setCounter(userId, 3, 3);

    } else {
        await send(`⚠️ *Invalid option.* Please reply with *1*, *2*, or *3*.`);
        await resetToMenu(userId);
    }
};

// ── Counter 2, response 10: price sub-menu ────────────────────────────────────
const handlePriceSubMenu = async (ctx: HandlerContext) => {
    const { userId, incomingText, send } = ctx;

    if (incomingText === "1") {
        const prices = await getCropPrices();
        if (prices.length > 0) {
            let text = "💰 *Current Crop Prices*\n\n";
            for (const p of prices) {
                text += `🌾 *${p.crop_name ?? "Unknown"}*\n📍 ${p.region}\n💵 Min: ${p.min_price} FCFA\n💵 Max: ${p.max_price} FCFA\n📊 Avg: ${p.avg_price} FCFA\n\n`;
            }
            text += "👉 *Reply with anything to return to the main menu.*";
            await send(text);
        } else {
            await send("⚠️ *No crop prices available for now.*");
        }
        await resetToMenu(userId);

    } else if (incomingText === "2") {
        let text = "*Select the region of interest:*\n";
        for (const r of regions) {
            text += `\n*${r.id}:* ${r.name}`;
        }
        await send(text);
        await setCounter(userId, 3, 11);

    } else if (incomingText === "3") {
        const crops = await getCrops();
        let text = "*Select the crop of interest:*\n";
        crops.forEach((crop, i) => {
            text += `\n*${i + 1}:* ${crop.name}`;
        });
        await send(text);
        await setCounter(userId, 3, 12);

    } else {
        await send(`⚠️ *Invalid option.* Please reply with *1*, *2*, or *3*.`);
        await resetToMenu(userId);
    }
};

export const handleCounter2 = async (ctx: HandlerContext, responseCode: number) => {
    if (responseCode === 1) return handleListingSubMenu(ctx);
    if (responseCode === 10) return handlePriceSubMenu(ctx);

    await ctx.send("⚠️ *Something went wrong. Returning to main menu.*");
    await resetToMenu(ctx.userId);
};

// ── Counter 3: user picked region or crop ─────────────────────────────────────
export const handleCounter3 = async (ctx: HandlerContext, responseCode: number) => {
    const { userId, incomingText, send } = ctx;

    // Listings by region
    if (responseCode === 2) {
        const region = getRegionByInput(incomingText);
        if (!region) {
            await send("⚠️ *Invalid region.* Please try again.");
            await resetToMenu(userId);
            return;
        }
        const listings = await getVerifiedListings();
        const filtered = listings.filter(l => l.region === region.name);
        if (filtered.length > 0) {
            let text = `🌾 *Listings in ${region.name}*\n\n`;
            for (const l of filtered) {
                text += `*${l.crop_name}*\n📦 ${l.quantity_kg} kg\n💰 ${l.price} FCFA/kg\n📍 ${l.town}\n⏳ Expires: ${new Date(l.expiresAt).toLocaleDateString()}\n\n`;
            }
            await send(text);
        } else {
            await send(`⚠️ *No listings found in ${region.name}.*`);
        }
        await resetToMenu(userId);

    // Listings by crop
    } else if (responseCode === 3) {
        const crops = await getCrops();
        const cropIndex = Number(incomingText) - 1; // user sees 1-based list
        const selectedCrop = crops[cropIndex];
        if (!selectedCrop) {
            await send("⚠️ *Invalid crop selection.* Please try again.");
            await resetToMenu(userId);
            return;
        }
        const listings = await getVerifiedListings();
        const filtered = listings.filter(l => l.crop_id === selectedCrop.id);
        if (filtered.length > 0) {
            let text = `🌾 *Listings for ${selectedCrop.name}*\n\n`;
            for (const l of filtered) {
                text += `📦 ${l.quantity_kg} kg\n💰 ${l.price} FCFA/kg\n📍 ${l.town}, ${l.region}\n⏳ Expires: ${new Date(l.expiresAt).toLocaleDateString()}\n\n`;
            }
            await send(text);
        } else {
            await send(`⚠️ *No listings found for ${selectedCrop.name}.*`);
        }
        await resetToMenu(userId);

    // Prices by region
    } else if (responseCode === 11) {
        const region = getRegionByInput(incomingText);
        if (!region) {
            await send("⚠️ *Invalid region.* Please try again.");
            await resetToMenu(userId);
            return;
        }
        const prices = await getCropPrices();
        const filtered = prices.filter(p => p.region === region.name);
        if (filtered.length > 0) {
            let text = `💰 *Crop Prices in ${region.name}*\n\n`;
            for (const p of filtered) {
                text += `🌾 *${p.crop_name ?? "Unknown"}*\n💵 Min: ${p.min_price} FCFA\n💵 Max: ${p.max_price} FCFA\n📊 Avg: ${p.avg_price} FCFA\n\n`;
            }
            text += "👉 *Reply with anything to return to the main menu.*";
            await send(text);
        } else {
            await send(`⚠️ *No prices found for ${region.name}.*`);
        }
        await resetToMenu(userId);

    // Prices by crop
    } else if (responseCode === 12) {
        const crops = await getCrops();
        const cropIndex = Number(incomingText) - 1;
        const selectedCrop = crops[cropIndex];
        if (!selectedCrop) {
            await send("⚠️ *Invalid crop selection.* Please try again.");
            await resetToMenu(userId);
            return;
        }
        const prices = await getCropPrices();
        const filtered = prices.filter(p => p.crop_id === selectedCrop.id);
        if (filtered.length > 0) {
            let text = `💰 *Prices for ${selectedCrop.name}*\n\n`;
            for (const p of filtered) {
                text += `📍 ${p.region}\n💵 Min: ${p.min_price} FCFA\n💵 Max: ${p.max_price} FCFA\n📊 Avg: ${p.avg_price} FCFA\n\n`;
            }
            text += "👉 *Reply with anything to return to the main menu.*";
            await send(text);
        } else {
            await send(`⚠️ *No prices found for ${selectedCrop.name}.*`);
        }
        await resetToMenu(userId);

    } else {
        await send("⚠️ *Something went wrong. Returning to main menu.*");
        await resetToMenu(userId);
    }
};