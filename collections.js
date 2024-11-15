
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

// sidemenu
var filter = document.getElementById("filter")
var openfil = document.getElementById("openfil")
var closefil = document.getElementById("close-fil")
openfil.addEventListener("click",function(){
    filter.style.marginLeft=0
})
closefil.addEventListener("click",function(){
    filter.style.marginLeft="-40%"
})