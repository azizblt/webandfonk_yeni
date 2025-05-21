const soap = require('soap');
const axios = require('axios');

class EFaturaService {
    constructor() {
        this.invoiceWS = 'https://servis.kolayentegrasyon.net/InvoiceService/InvoiceWS';
        this.queryWS = 'https://servis.kolayentegrasyon.net/QueryInvoiceService/QueryDocumentWS';
        this.loadWS = 'https://servis.kolayentegrasyon.net/InvoiceLoadingService/LoadInvoiceWS';
    }

    // Fatura gönderme
    async sendInvoice(inputDocumentList) {
        try {
            const client = await soap.createClient(this.invoiceWS + '?wsdl');
            
            // HTTP başlıkları ekleme
            client.addHttpHeader('Username', process.env.EFATURA_USERNAME);
            client.addHttpHeader('Password', process.env.EFATURA_PASSWORD);

            const result = await client.sendInvoiceAsync({
                inputDocumentList: inputDocumentList
            });

            return result[0];
        } catch (error) {
            throw new Error(`Fatura gönderme hatası: ${error.message}`);
        }
    }

    // Uygulama yanıtı gönderme
    async sendApplicationResponse(inputDocumentList) {
        try {
            const client = await soap.createClient(this.invoiceWS + '?wsdl');
            
            client.addHttpHeader('Username', process.env.EFATURA_USERNAME);
            client.addHttpHeader('Password', process.env.EFATURA_PASSWORD);

            const result = await client.sendApplicationResponseAsync({
                inputDocumentList: inputDocumentList
            });

            return result[0];
        } catch (error) {
            throw new Error(`Uygulama yanıtı gönderme hatası: ${error.message}`);
        }
    }

    // Giden faturaları sorgulama
    async queryOutboxDocument(paramType, parameter, withXML = 'NONE') {
        try {
            const client = await soap.createClient(this.queryWS + '?wsdl');
            
            client.addHttpHeader('Username', process.env.EFATURA_USERNAME);
            client.addHttpHeader('Password', process.env.EFATURA_PASSWORD);

            const result = await client.QueryOutboxDocumentAsync({
                paramType,
                parameter,
                withXML
            });

            return result[0];
        } catch (error) {
            throw new Error(`Giden fatura sorgulama hatası: ${error.message}`);
        }
    }

    // Gelen faturaları sorgulama
    async queryInboxDocument(paramType, parameter, withXML = 'NONE') {
        try {
            const client = await soap.createClient(this.queryWS + '?wsdl');
            
            client.addHttpHeader('Username', process.env.EFATURA_USERNAME);
            client.addHttpHeader('Password', process.env.EFATURA_PASSWORD);

            const result = await client.QueryInboxDocumentAsync({
                paramType,
                parameter,
                withXML
            });

            return result[0];
        } catch (error) {
            throw new Error(`Gelen fatura sorgulama hatası: ${error.message}`);
        }
    }

    // Fatura iptal etme
    async cancelInvoice(invoiceUUID) {
        try {
            const client = await soap.createClient(this.invoiceWS + '?wsdl');
            
            client.addHttpHeader('Username', process.env.EFATURA_USERNAME);
            client.addHttpHeader('Password', process.env.EFATURA_PASSWORD);

            const result = await client.cancelInvoiceAsync({
                invoiceUUID
            });

            return result[0];
        } catch (error) {
            throw new Error(`Fatura iptal hatası: ${error.message}`);
        }
    }

    // Müşteri kredi sayısı sorgulama
    async getCustomerCreditCount(vkn_tckn) {
        try {
            const client = await soap.createClient(this.invoiceWS + '?wsdl');
            
            client.addHttpHeader('Username', process.env.EFATURA_USERNAME);
            client.addHttpHeader('Password', process.env.EFATURA_PASSWORD);

            const result = await client.getCustomerCreditCountAsync({
                vkn_tckn
            });

            return result[0];
        } catch (error) {
            throw new Error(`Kredi sayısı sorgulama hatası: ${error.message}`);
        }
    }
}

module.exports = new EFaturaService(); 