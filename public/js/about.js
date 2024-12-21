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