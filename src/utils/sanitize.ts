export const sanitizeString = (value: string): string => {
    return value
        .trim()
        .replace(/[<>]/g, "") // basic XSS protection
        .replace(/"/g, "")
        .replace(/'/g, "");
};

export const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== "object") return obj;

    const sanitized: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        const value = obj[key];

        if (typeof value === "string") {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === "object") {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};