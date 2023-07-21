(async () => {
    // Check for correct page
    if (!window.location.href.startsWith('https://www.reddit.com/r/place/') && !window.location.href.startsWith('https://new.reddit.com/r/place/')) {
        return;
    }

    // Check for marker; only load the script once!
    if (document.head.querySelector('meta[name="zinnsoldat"]')) {
        console.warn('Script already loaded!');
        return;
    }
    const marker = document.createElement('meta');
    marker.setAttribute('name', 'zinnsoldat');
    document.head.appendChild(marker);

    const zs_style = document.createElement('style');
    zs_style.innerHTML = `
        .zs-pixeled {
            border: 3px solid #000000;
            box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.75);
            font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol',sans-serif;
            font-weight: 600;
        }
        .zs-button {
            position: fixed;
            width: 142px;
            height: 46px;
            bottom: 15px;
            left: 15px;
            z-index: 100;
            color: #fff;
        }
        .zs-startbutton {
            background-color: #FF4500;
        }
        .zs-startbutton:hover {
            background-color: #e63d00;
        }
        .zs-stopbutton {
            background-color: #00A368;
        }
        .zs-stopbutton:hover {
            background-color: #008f5b;
        }
        .zs-timeout {
            width: 125px;
            height: 5px;
            margin: auto;
            background: linear-gradient(-90deg, rgb(97, 97, 97) var(--zs_timeout), rgb(16, 173, 241) var(--zs_timeout));
        }
    `;
    document.head.appendChild(zs_style);

    let zs_running = true;
    let zs_initialized;
    let placeTimeout;

    const zs_version = "0.2";
    const zs_startButton = document.createElement('button');
    zs_startButton.innerText = `Zinnsoldat v${zs_version}`;
    zs_startButton.classList.add('zs-pixeled', 'zs-button', 'zs-stopbutton');
    document.body.appendChild(zs_startButton)

    const zs_timeout = document.createElement("div");
    zs_timeout.classList.add("zs-timeout");
    zs_timeout.style.setProperty("--zs_timeout", "0%");
    zs_startButton.appendChild(zs_timeout);

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
    const zs_info = (msg) => {
        Toastify({
            text: msg,
            duration: 5000,
            gravity: 'bottom',
            position: 'right',
            stopOnFocus: true,
            className: 'zs-pixeled',
            style: {
                background: '#383838',
                color: '#fff',
                'box-shadow': '8px 8px 0px rgba(0, 0, 0, 0.75)',
            },
        }).showToast();
    }
    const zs_warn = (msg) => {
        Toastify({
            text: msg,
            duration: 5000,
            gravity: 'bottom',
            position: 'right',
            stopOnFocus: true,
            className: 'zs-pixeled',
            style: {
                background: '#FFA800',
                color: '#000',
                'box-shadow': '8px 8px 0px rgba(0, 0, 0, 0.75)',
            },
        }).showToast();
    }
    const zs_error = (msg) => {
        Toastify({
            text: msg,
            duration: 5000,
            gravity: 'bottom',
            position: 'right',
            stopOnFocus: true,
            className: 'zs-pixeled',
            style: {
                background: '#d93a00',
                color: '#fff',
                'box-shadow': '8px 8px 0px rgba(0, 0, 0, 0.75)',
            },
        }).showToast();
    }
    const zs_success = (msg) => {
        Toastify({
            text: msg,
            duration: 5000,
            gravity: 'bottom',
            position: 'right',
            stopOnFocus: true,
            className: 'zs-pixeled',
            style: {
                background: '#00A368',
                color: '#fff',
                'box-shadow': '8px 8px 0px rgba(0, 0, 0, 0.75)',
            },
        }).showToast();
    }
    const zs_updateNotification = () => {
        Toastify({
            text: 'Neue Version auf https://place.army/ verfügbar!',
            destination: 'https://place.army/',
            duration: -1,
            gravity: 'bottom',
            position: 'right',
            stopOnFocus: true,
            className: 'zs-pixeled',
            style: {
                background: '#3690EA',
                color: '#fff',
                'box-shadow': '8px 8px 0px rgba(0, 0, 0, 0.75)',
            },
        }).showToast();
    }

    zs_info('Einer von uns!');

    // Override setTimeout to allow getting the time left
    const _setTimeout = setTimeout; 
    const _clearTimeout = clearTimeout; 
    const zs_allTimeouts = {};
    
    setTimeout = (callback, delay) => {
        let id = _setTimeout(callback, delay);
        zs_allTimeouts[id] = Date.now() + delay;
        return id;
    };

    clearTimeout = (id) => {
        _clearTimeout(id);
        zs_allTimeouts[id] = undefined;
    }
    
    const getTimeout = (id) => {
        if (zs_allTimeouts[id]) {
            return Math.max(
                zs_allTimeouts[id] - Date.now(),
                0 // Make sure we get no negative values for timeouts that are already done
            )
        }

        return NaN;
    }

    setInterval(() => {
        const theTimeout = getTimeout(placeTimeout)
        if (Number.isNaN(theTimeout)) {
            // Hide it
            zs_timeout.style.opacity = 0;
        }

        // Show it
        zs_timeout.style.opacity = 1;

        // Update the percentage
        const maxTimeout = 300000; // 5min
        const percentage = Math.min(Math.max(Math.round((theTimeout/maxTimeout) * 100), 0), 100)
        zs_timeout.style.setProperty("--zs_timeout", `${percentage}%`)
    }, 1)

    // Retrieve access token
    const zs_getAccessToken = async () => {
        const usingOldReddit = window.location.href.includes('new.reddit.com');
        const url = usingOldReddit ? 'https://new.reddit.com/r/place/' : 'https://www.reddit.com/r/place/';
        const response = await fetch(url);
        const responseText = await response.text();
    
        return responseText.match(/"accessToken":"(\\"|[^"]*)"/)[1];
    }
    zs_info('Erbitte Reddit um Zugriff...');
    let zs_accessToken = await zs_getAccessToken();
    zs_success('Zugriff gewährt!');

    const zs_getCanvasId = (x, y) => {
        if (y < 0) {
            return 1;
        }
        return 4;
    }

    const zs_getCanvasX = (x, y) => {
        return x + 500;
    }

    const zs_getCanvasY = (x, y) => {
        return zs_getCanvasId(x, y) < 3 ? y + 1000 : y;
    }

    let pixelsPlacedThisSession = 0;

    const zs_placePixel = async (x, y, color) => {
        console.log('Trying to place pixel at %s, %s in %s', x, y, color);
        const response = await fetch('https://gql-realtime-2.reddit.com/query', {
            method: 'POST',
            body: JSON.stringify({
                'operationName': 'setPixel',
                'variables': {
                    'input': {
                        'actionName': 'r/replace:set_pixel',
                        'PixelMessageData': {
                            'coordinate': {
                                'x': zs_getCanvasX(x, y),
                                'y': zs_getCanvasY(x, y)
                            },
                            'colorIndex': color,
                            'canvasIndex': zs_getCanvasId(x, y)
                        }
                    }
                },
                'query': `mutation setPixel($input: ActInput!) {
                    act(input: $input) {
                        data {
                            ... on BasicMessage {
                                id
                                data {
                                    ... on GetUserCooldownResponseMessageData {
                                        nextAvailablePixelTimestamp
                                        __typename
                                    }
                                    ... on SetPixelResponseMessageData {
                                        timestamp
                                        __typename
                                    }
                                    __typename
                                }
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                }
                `
            }),
            headers: {
                'origin': 'https://garlic-bread.reddit.com',
                'referer': 'https://garlic-bread.reddit.com/',
                'apollographql-client-name': 'garlic-bread',
                'Authorization': `Bearer ${zs_accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json()
        if (data.errors !== undefined) {
            if (data.errors[0].message === 'Ratelimited') {
                console.log('Could not place pixel at %s, %s in %s - Ratelimit', x, y, color);
                zs_warn('Du hast noch Abklingzeit!');
                return data.errors[0].extensions?.nextAvailablePixelTs;
            }
            console.log('Could not place pixel at %s, %s in %s - Response error', x, y, color);
            console.error(data.errors);
            zs_error('Fehler beim Platzieren des Pixels');
            return null;
        }
        console.log('Did place pixel at %s, %s in %s', x, y, color);
        pixelsPlacedThisSession += 1;
        zs_success(`Pixel (${x}, ${y}) platziert! (#${pixelsPlacedThisSession})`);
        return data?.data?.act?.data?.[0]?.data?.nextAvailablePixelTimestamp;
    }


    let c2;
    let tokens = ['Wololo']; // We only have one token

    const zs_requestJob = () => {
        if (c2.readyState !== c2.OPEN) {
            zs_error('Verbindung zum "Carpetbomber" abgebrochen. Verbinde...');
            zs_initCarpetbomberConnection();
            return;
        }
        if (!zs_running) {
            return;
        }
        c2.send(JSON.stringify({ type: "RequestJobs", tokens: tokens }));
    }

    const zs_processJobResponse = (jobs) => {
        if (!jobs || jobs === {}) {
            zs_warn('Kein verfügbarer Auftrag. Versuche in 60s erneut');
            clearTimeout(placeTimeout);
            placeTimeout = setTimeout(() => {
                zs_requestJob();
            }, 60000);
            return;
        }
        let [token, [job, code]] = Object.entries(jobs)[0];
        if (!job) {
            // Check if ratelimited and schedule retry
            const ratelimit = code?.Ratelimited?.until;
            if (ratelimit) {
                clearTimeout(placeTimeout);
            placeTimeout = setTimeout(() => {
                    zs_requestJob();
                }, Math.max(5000, Date.parse(ratelimit) + 2000 - Date.now()));
                return;
            }
            // Other error. No jobs left?
            zs_warn('Kein verfügbarer Auftrag. Versuche in 20s erneut');
            clearTimeout(placeTimeout);
            placeTimeout = setTimeout(() => {
                zs_requestJob();
            }, 20000);
            return;
        }
        // Execute job
        zs_placePixel(job.x, job.y, job.color - 1).then((nextTry) => {
            clearTimeout(placeTimeout);
            placeTimeout = setTimeout(() => {
                zs_requestJob();
            }, Math.max(5000, (nextTry || 5*60*1000) + 2000 - Date.now()));
        });
    }

    const zs_initCarpetbomberConnection = () => {
        c2 = new WebSocket("wss://carpetbomber.place.army");

        c2.onopen = () => {
            zs_initialized = true;
            zs_info('Verbinde mit "Carpetbomber"...');
            c2.send(JSON.stringify({ type: "Handshake", version: zs_version }));
            zs_requestJob();
            setInterval(() => c2.send(JSON.stringify({ type: "Wakeup"})), 40*1000);
        }
        
        c2.onerror = (error) => {
            zs_error('Verbindung zum "Carpetbomber" fehlgeschlagen! Versuche in 5s erneut');
            console.error(error);
            setTimeout(zs_initCarpetbomberConnection, 5000);
        }

        c2.onmessage = (event) => {
            data = JSON.parse(event.data)
            // console.log('received: %s', JSON.stringify(data));

            if (data.type === 'UpdateVersion') {
                zs_success('Verbindung aufgebaut!');
                if (data.version > zs_version) {
                    zs_updateNotification();
                }
            } else if (data.type == "Jobs") {
                zs_processJobResponse(data.jobs);
            }
        }
    }
    
    zs_initCarpetbomberConnection();

    const zs_startBot = () => {
        zs_running = true;
        zs_startButton.classList.remove('zs-startbutton');
        zs_startButton.classList.add('zs-stopbutton');
        if (zs_initialized) {
            zs_requestJob();
        }
    }

    const zs_stopBot = () => {
        zs_running = false;
        clearTimeout(placeTimeout);
        zs_startButton.classList.remove('zs-stopbutton');
        zs_startButton.classList.add('zs-startbutton');
    }

    zs_startButton.onclick = () => {
        if (zs_running) {
            zs_stopBot();
        } else {
            zs_startBot();
        }
    }
})();
