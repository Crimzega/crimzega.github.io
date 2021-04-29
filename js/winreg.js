var elem = document.createElement('textarea'),  elem1 = document.createElement('input'), elem2 = document.createElement('button');
elem2.innerText = 'Convert to Windows Extends String Registry Type';

elem.style.width = '600px';
elem.style.height = '200px';
elem1.style.width = '400px';

class WindowsRegistry{

  static extendedString(str, name = ''){
    var arr = [];
    for(var ch of str) arr.push(ch.charCodeAt(0).toString(16).padStart(2, '0'), '00');
    arr.push('00', '00');
    var result = (name == ''? '@': '"' + name + '"') + '=hex(2):';
    var counter = result.length;
    for(var i = 0; i < arr.length; i++){
      var hx = arr[i];
      counter += 2;
      if(i < arr.length - 1){
        hx += ',';
        counter++;
      }
      if(counter > 76){
        counter = 0;
        hx += '\\\r\n  ';
        counter += 2;
      }
      result += hx;
    }
    return result;
  }

}

elem2.onclick = () => {
    elem.value = WindowsRegistry.extendedString(elem1.value);
};

document.body.appendChild(elem1);
document.body.appendChild(document.createElement('br'));
document.body.appendChild(elem2);
document.body.appendChild(document.createElement('br'));
document.body.appendChild(elem);
