export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    if (hour >= 18 && hour < 22) return "Good evening";
    return "Good night";
};

export const regions: { id: number; name: string }[] = [
    { id: 0, name: 'General' },
    { id: 1, name: 'Adamawa' },
    { id: 2, name: 'Centre' },
    { id: 3, name: 'East' },
    { id: 4, name: 'Far North' },
    { id: 5, name: 'Littoral' },
    { id: 6, name: 'North' },
    { id: 7, name: 'North West' },
    { id: 8, name: 'West' },
    { id: 9, name: 'South' },
    { id: 10, name: 'South West' },
];

export const PS_NOTE = `\n_PS: Telegram offers a better experience — don't hesitate to link your account there._`;

export const MAIN_MENU = 
    `*We can provide you with:*\n\n` +
    `• *1 Product Listings:* Agricultural products across the country or specific regions.\n` +
    `• *2 Market Prices:* Real-time crop values across Cameroon.\n` +
    `• *3 Agriculture News:* Recent trends and updates in the farming world.\n` +
    `*Reply with a number to continue.*`;

// Safe region lookup — returns null if input is out of bounds
export const getRegionByInput = (input: string) => {
    const index = Number(input);
    if (isNaN(index)) return null;
    return regions.find(r => r.id === index) ?? null;
};