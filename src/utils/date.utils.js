export const isExpired = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry < now;
};

export const daysUntilExpiry = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
