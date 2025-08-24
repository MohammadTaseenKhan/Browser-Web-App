const tg = window.Telegram?.WebApp;
// Event handlers
goBtn.onclick = () => navigate(urlInput.value, true);


backBtn.onclick = () => {
if (idx > 0) {
idx -= 1;
proxyToggle.checked = stack[idx].proxy;
iframe.src = buildSrc(stack[idx].url);
urlInput.value = stack[idx].url;
updateNav();
}
};


fwdBtn.onclick = () => {
if (idx < stack.length - 1) {
idx += 1;
proxyToggle.checked = stack[idx].proxy;
iframe.src = buildSrc(stack[idx].url);
urlInput.value = stack[idx].url;
updateNav();
}
};


reloadBtn.onclick = () => {
if (idx >= 0) iframe.src = buildSrc(stack[idx].url);
};


extBtn.onclick = () => {
if (idx >= 0) {
window.open(stack[idx].url, '_blank');
} else if (urlInput.value) {
window.open(urlInput.value, '_blank');
}
};


proxyToggle.onchange = () => {
if (idx >= 0) {
stack[idx].proxy = proxyToggle.checked;
iframe.src = buildSrc(stack[idx].url);
}
};


// Load from ?url=
const qp = new URLSearchParams(location.search);
const initial = qp.get('url') || 'https://example.com';
navigate(initial, true);
