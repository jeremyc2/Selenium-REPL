function setClipboard(text) {
    var type = "text/plain";
    var blob = new Blob([text], { type });
    var data = [new ClipboardItem({ [type]: blob })];

    navigator.clipboard.write(data).then(
        function () {
            console.log(`"${text}" copied to clipboard`);
        },
        function () {
            console.error('Could not copy to clipboard');
        }
    );
}

document.addEventListener('contextmenu', e => {
    chrome.runtime.sendMessage({type: 'selector-value', data: finder(e.target)});
});

chrome.runtime.onMessage.addListener(
  ({type, data}) => {
    switch (type) {
        case 'copy':
            setClipboard(data);
            break;

        default:
            console.log('Unknown Message Received');
            break;
    }
  }
);