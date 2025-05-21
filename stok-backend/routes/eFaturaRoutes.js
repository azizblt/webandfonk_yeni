const express = require('express');
const router = express.Router();
const eFaturaService = require('../services/eFaturaService');

// Fatura gönderme
router.post('/send-invoice', async (req, res) => {
    try {
        const result = await eFaturaService.sendInvoice(req.body.inputDocumentList);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Uygulama yanıtı gönderme
router.post('/send-application-response', async (req, res) => {
    try {
        const result = await eFaturaService.sendApplicationResponse(req.body.inputDocumentList);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Giden faturaları sorgulama
router.get('/query-outbox', async (req, res) => {
    try {
        const { paramType, parameter, withXML } = req.query;
        const result = await eFaturaService.queryOutboxDocument(paramType, parameter, withXML);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gelen faturaları sorgulama
router.get('/query-inbox', async (req, res) => {
    try {
        const { paramType, parameter, withXML } = req.query;
        const result = await eFaturaService.queryInboxDocument(paramType, parameter, withXML);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fatura iptal etme
router.post('/cancel-invoice', async (req, res) => {
    try {
        const { invoiceUUID } = req.body;
        const result = await eFaturaService.cancelInvoice(invoiceUUID);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Müşteri kredi sayısı sorgulama
router.get('/customer-credit-count/:vkn_tckn', async (req, res) => {
    try {
        const result = await eFaturaService.getCustomerCreditCount(req.params.vkn_tckn);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 