//add namespace compatibility for firefox 
if (typeof chrome === 'undefined') {
    var chrome = browser;
}