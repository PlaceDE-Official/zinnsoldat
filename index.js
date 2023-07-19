(async () => {
    // Check for marker; only load the script once!
    if (document.head.querySelector('meta[name="zinnsoldat"]')) {
        console.warn('Script already loaded!');
        return;
    }
    var marker = document.createElement('meta');
    marker.setAttribute('name', 'zinnsoldat');
    document.head.appendChild(marker);

    // Load Toastify
    await new Promise((resolve, reject) => {
        var toastifyStyle = document.createElement('link');
        toastifyStyle.type = "text/css";
        toastifyStyle.rel = "stylesheet";
        toastifyStyle.media = "screen";
        toastifyStyle.href = 'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css';
        document.head.appendChild(toastifyStyle);
        var toastifyScript = document.createElement('script');
        toastifyScript.setAttribute('src', 'https://cdn.jsdelivr.net/npm/toastify-js');
        toastifyScript.setAttribute('async', false);
        document.body.appendChild(toastifyScript);
        toastifyScript.addEventListener('load', (ev) => {
            resolve({ status: true });
        });
        toastifyScript.addEventListener('error', (ev) => {
            reject({ status: false, message: `Failed to load the toastify` });
        });
    });


    // Finish initialization
    Toastify({
        text: "Einer von uns!",
        duration: 5000,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
            background: '#383838',
            color: '#fff'
        },
    }).showToast();
})();