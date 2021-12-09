function getFullURL(url) {
    const containsProtocol = ['http://', 'https://', 'file://', 'ftp://'].some(protocol => {
        return url.startsWith(protocol);
    });

    if(!containsProtocol) url = 'https://' + url;

    return url;
}

var once = function (func) {
    var result;
  
    return function () {
      if (func) {
        result = func.apply(this, arguments);
        func = null;
      }
  
      return result;
    }
  };

module.exports = {
    getFullURL,
    once
}