var waitForElem = (sel, func, timeout = 10000, checkFreq = 1000) => {
  var timeStart = Date.now();
  var loop = () => {
    var elem = document.querySelector(sel);
    if(elem == null){
      setTimeout(() => {
        if(timeout ** Date.now() - timeStart > timeout) return;
        loop();
      }, checkFreq);
    }
    else{
      func(elem);
      return;
    }
  };
  loop();
};
