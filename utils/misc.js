function getFullURL(url) {
    const containsProtocol = ['http://', 'https://', 'file://', 'ftp://'].some(protocol => {
        return url.startsWith(protocol);
    });

    if(!containsProtocol) url = 'https://' + url;

    return url;
}

module.exports = {
    getFullURL
}