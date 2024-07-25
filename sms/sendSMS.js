const AfricasTalking = require('africastalking');

// TODO: Initialize Africa's Talking

const africastalking = AfricasTalking({
  apiKey: 'atsk_2a9317603248d29d88192179c7da912db8181afe9bff9c05d84e55d106d29c6d7f0ea916', 
  username: 'sandbox'
});

module.exports = async function sendSMS(to,message) {
    
    // TODO: Send message
try {
  const result=await africastalking.SMS.send({
    to: to, 
    message: message,
    from: 'itike'
  });
  console.log(result);
} catch(ex) {
  console.error(ex);
}
};