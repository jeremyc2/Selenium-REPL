var selector;

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({id: "copy-css-selector", title: "Copy CSS Selector", contexts: ['all']});
});

chrome.runtime.onMessage.addListener(
  ({type, data}) => {
    switch (type) {
        case 'selector-value':
            selector = data;
            break;

        default:
            console.log('Unknown Message Received');
            break;
    }
  }
);

chrome.contextMenus.onClicked.addListener(() => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'copy', data: selector});
    });
});