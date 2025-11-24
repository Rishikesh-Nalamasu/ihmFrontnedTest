function getData(schoolname) {
  console.log("Getting data for:", schoolname);
}

// exactly ONE window.addEventListener
window.addEventListener("load", function () {
  getData("schoolname=ABC Public School");
});
// extra listener - BAD
window.addEventListener("click", function () {
  console.log("hello");
});