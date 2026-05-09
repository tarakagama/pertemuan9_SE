const validateBuyTicket = (req, res, next) => {
    const { ticket_id, quantity } = req.body;
    if (!ticket_id || !quantity) {
        return res.status(400).json({ success: false, message: 'ticket_id dan quantity wajib diisi' });
    }
    if (quantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity minimal 1' });
    }
    next();
};

module.exports = { validateBuyTicket };