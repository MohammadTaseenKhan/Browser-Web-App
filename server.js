import express from 'express';
}
});


// Inject a small helper to rewrite pushState/location changes
$('body').append(`
<script>
(function(){
const origPush = history.pushState;
const origReplace = history.replaceState;
function prox(url){
try { return '/proxy?url=' + encodeURIComponent(new URL(url, '${url}').toString()); }
catch(e){ return url; }
}
history.pushState = function(s, t, u){
if (typeof u === 'string') u = prox(u);
return origPush.apply(this, [s, t, u]);
};
history.replaceState = function(s, t, u){
if (typeof u === 'string') u = prox(u);
return origReplace.apply(this, [s, t, u]);
};
// Intercept window.open
const origOpen = window.open;
window.open = function(u, n, f){ return origOpen(prox(u), n, f); };
})();
</script>
`);


res.send($.html());
} catch (e) {
res.status(500).send(`Proxy error: ${e.message}`);
}
});


// Fallback → index.html
app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
console.log(`In‑App Browser running on http://localhost:${PORT}`);
});
