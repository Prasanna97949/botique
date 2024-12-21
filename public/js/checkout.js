// sidemenu
var sidenav = document.getElementById("sidenav")
var menuicon = document.getElementById("menuicon")
var closenav = document.getElementById("close-nav")
menuicon.addEventListener("click",function(){
    sidenav.style.right=0
})
closenav.addEventListener("click",function(){
    sidenav.style.right="-50%"
})

// search bar
var searchbar = document.getElementById("searchbar")
var search = document.getElementById("search")
var search1 = document.getElementById("search1")
var closebar = document.getElementById("close-bar")
search.addEventListener("click",function(){
  searchbar.style.top=0
})
search1.addEventListener("click",function(){
  searchbar.style.top=0
})
closebar.addEventListener("click",function(){
  searchbar.style.top="-30%"
})


// Render cart items
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = ''; // Clear the cart list before re-rendering

    cartItems.forEach(item => {
        const totalItemPrice = (item.price * item.quantity).toFixed(2);
        const itemElement = document.createElement('li');
        itemElement.className = 'flex justify-between items-center border-b pb-4';
        itemElement.innerHTML = `
            <div>
                <h3 class="text-lg font-medium">${item.name}</h3>
                <p class="text-gray-600 text-sm">Quantity: ${item.quantity}</p>
            </div>
            <span class="text-lg font-semibold">$${totalItemPrice}</span>
        `;
        cartContainer.appendChild(itemElement);
    });

    // Update total price
    updateTotalPrice();
}

// Calculate and update the total price of all items in the cart
function updateTotalPrice() {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    document.getElementById('total-price').textContent = total;
}

// Handle form submission
document.getElementById('checkout-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;

    if (!name || !email || !address) {
        alert("Please fill in all shipping details.");
        return;
    }

    alert(`
        Order Placed Successfully!
        
        Shipping to:
        Name: ${name}
        Email: ${email}
        Address: ${address}
        
        Total: $${document.getElementById('total-price').textContent}
    `);

    // Reset the form
    document.getElementById('checkout-form').reset();
});

// Initial rendering of the cart
renderCart();
var loginmenu = document.getElementById("loginmenu")
var login = document.getElementById("login")
var login1 = document.getElementById("login1")
var closelog = document.getElementById("close-log")
login.addEventListener("click",function(){
    loginmenu.style.right=0
})
login1.addEventListener("click",function(){
    loginmenu.style.right=0
})
closelog.addEventListener("click",function(){
    loginmenu.style.right="-50%"
})