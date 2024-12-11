// pay.js
export function pay(data){

};


// ------------------------------------
// document.addEventListener('DOMContentLoaded', () => {
//     const paymentButton = document.getElementById('pay-button');

//     paymentButton.addEventListener('click', () => {
//         const amount = document.getElementById('amount').value;
//         const first_name = document.getElementById('first_name').value;
//         const last_name = document.getElementById('last_name').value;
//         const email = document.getElementById('email').value;
//         const phone = document.getElementById('phone').value;
//         const address = document.getElementById('address').value;
//         const city = document.getElementById('city').value;
//         const state = document.getElementById('state').value;
//         const zip = document.getElementById('zip').value;
//         const notes = document.getElementById('notes').value;
//         const user_id = document.getElementById('user_id').value;
//         const currency = 'INR'; // You can change this as needed

//         fetch('/create-order', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ amount, currency,first_name,last_name,email,phone,address,city,state,zip,notes,user_id })
//         })
//         .then(response => response.json())
//         .then(order => {
//             const options = {
//                 key: 'rzp_test_VozKLqA8klppsw', // Enter the Key ID generated from the Dashboard
//                 amount: order.amount,
//                 currency: order.currency,
//                 name: 'manikandan',
//                 description: 'Test Transaction',
//                 prefill: { //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
//         name: first_name, //your customer's name
//         email: email, 
//         contac: phone,
//     },
//                 order_id: order.id,
//                 handler: function(response) {
//                     window.location.href = '/';
//                 },
            
//                 theme: {
//                     color: '#223331'
//                 }
//             };
//             const rzp1 = new Razorpay(options);
//             rzp1.open();
//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
//     });
// });
