const africastalking = require('africastalking')({
    apiKey: 'YOUR_API_KEY',
    username: 'YOUR_USERNAME'
});

const payment = africastalking.PAYMENTS;

const initiatePayment = (phoneNumber, amount, callbackUrl) => {
    const options = {
        productName: 'BusTickets',
        providerChannel: 'MOBILE_MONEY',
        currencyCode: 'KES',
        recipients: [{
            phoneNumber,
            currencyCode: 'KES',
            amount,
            metadata: {
                reason: 'Bus ticket payment'
            }
        }]
    };

    return payment.mobileCheckout(options)
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(error => {
            console.error(error);
            throw error;
        });
};

module.exports = {
    initiatePayment
};
