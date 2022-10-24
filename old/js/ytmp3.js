(() => {
  
  var dlLink = document.querySelectorAll('a[href][rel="nofollow"]')[1];
  
  var waitFor = (elem, attr, func, timeout = 10000, checkFreq = 1000) => {
    var timeStart = Date.now();
    var loop = () => {
      console.log(elem.hasAttribute(attr));
      if(elem.hasAttribute(attr)) func();
      else{
        setTimeout(() => {
          if(Date.now() - timeStart >= timeout) return;
          loop();
        }, checkFreq);
      }
    };
    loop();
  }
  
  class YTMP3{
    #queries;
    constructor(){
      var params = location.search;
      if(params != '') this.#queries = new URLSearchParams(params);
    }
    
    queriesExist(){ return this.#queries != null; }
    
    #hasQuery(name){ return this.#getQuery(name) != null; }
    
    #getQuery(name){ return this.#queries.get(name); }
    
    downloadFully(){ return this.#hasQuery('full'); }
    
    build(){
      if(this.#queries != null){
        document.querySelector('#input').value = 'https://youtu.be/' + this.#getQuery('link');
        if(this.downloadFully()) document.querySelector('#mp4').click();
        document.querySelector('#submit').click();
        waitFor(dlLink, 'href', () => {
          dlLink.click();
          
        }, 20000);
      }
      else console.log('Could not get the URL query list');
    }
    
  }
  
  var apply = () => {
    dlLink.toggleAttribute('href');
    var program = new YTMP3();
    program.build();
  }
  
  apply();
  
})();
