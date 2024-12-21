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
// cart functions
document.addEventListener("DOMContentLoaded", () => {
    const cartItems = document.querySelectorAll(".cart-item");
    // const grandTotalEl = document.getElementById("grand-total");
    // const totalItemsEl = document.getElementById("total-items");

    cartItems.forEach((item) => {
      const priceEl = item.querySelector(".product-price");
      const quantityInput = item.querySelector(".quantity-input");
      const itemTotalPriceEl = item.querySelector(".item-total-price");
      const decreaseBtn = item.querySelector(".decrease-btn");
      const increaseBtn = item.querySelector(".increase-btn");

      const updateItemTotal = () => {
        const price = parseFloat(priceEl.textContent);
        const quantity = parseInt(quantityInput.value);
        itemTotalPriceEl.textContent = (price * quantity).toFixed(2);
        updateCartSummary();
      };

      const updateCartSummary = () => {
        let totalItems = 0;
        let grandTotal = 0;

        cartItems.forEach((item) => {
          const quantity = parseInt(item.querySelector(".quantity-input").value);
          const itemTotal = parseFloat(
            item.querySelector(".item-total-price").textContent
          );
          totalItems += quantity;
          grandTotal += itemTotal;
        });

        totalItemsEl.textContent = totalItems;
        grandTotalEl.textContent = grandTotal.toFixed(2);
      };

      decreaseBtn.addEventListener("click", () => {
        if (quantityInput.value > 1) {
          quantityInput.value = parseInt(quantityInput.value) - 1;
          updateItemTotal();
        }
      });

      increaseBtn.addEventListener("click", () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
        updateItemTotal();
      });

      quantityInput.addEventListener("change", () => {
        if (quantityInput.value < 1) quantityInput.value = 1;
        updateItemTotal();
      });

      updateItemTotal(); // Initial calculation
    });
  });
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