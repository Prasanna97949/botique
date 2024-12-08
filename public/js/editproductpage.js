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

// function previewImage(event) {
//     const file = event.target.files[0];
//     console.log(file,"testing file");
//     console.log(event,"testing event");
//     console.log("hii ")
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = function (e) {
//         const previewImage = document.querySelector('.preview-image');
//         const previewContainer = document.querySelector('.preview-container');
//         previewImage.src = e.target.result;
//         previewContainer.classList.remove('hidden');
//       };
//       reader.readAsDataURL(file);
//     }
//   }
  // function previewImage(event) {
  //   const input = event.target;
  //   const file = input.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = function (e) {
  //       const previewContainer = input.closest('td').querySelector('#previewContainer');
  //       const previewImage = previewContainer.querySelector('#previewImage');
  
  //       previewImage.src = e.target.result;
  //       previewContainer.classList.remove('hidden');
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }
  function previewImage(event) {
    console.log("hiii reathu")
    const input = event.target;
    
    const file = input.files[0];
    console.log("file",file);
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        console.log("on load",input)
        const td = input.closest("tr").querySelector(".image-container");
        console.log("td",td);
       
        const previewContainer = td.querySelector(".preview-container");
        console.log("testing privew",td);
        
        const previewImage = td.querySelector('.preview-image');
  
        previewImage.src = e.target.result;
        previewContainer.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  }
  function deleteImage() {
    const previewImage = document.getElementById('previewImage');
    const previewContainer = document.getElementById('previewContainer');
    previewImage.src = '';
    previewContainer.classList.add('hidden');
    document.getElementById('imageUpload').value = ''; // Clear the file input
  }