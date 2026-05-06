
(function(){
  function lockDimensions(){
    document.documentElement.style.width = "1080px";
    document.documentElement.style.height = "1920px";
    document.documentElement.style.overflow = "hidden";
    document.body.style.width = "1080px";
    document.body.style.height = "1920px";
    document.body.style.overflow = "hidden";
    const frame = document.querySelector(".overlay-frame");
    if(frame){
      frame.style.width = "1080px";
      frame.style.height = "1920px";
      frame.style.left = "0px";
      frame.style.top = "0px";
      frame.style.position = "absolute";
      frame.style.transform = "none";
    }
  }
  window.addEventListener("load", lockDimensions);
  window.addEventListener("resize", lockDimensions);
  lockDimensions();
})();
