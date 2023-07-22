// SOURCE: https://github.com/PlaceDE-Official/zinnsoldat/raw/main/output/placebot.user.js
const WebSocket = require("./ws");

(async () => {
    // ----------------------------------------
    // Basics
    // ----------------------------------------

    // 1. öffne die Entwicklerwerkzeuge ([F12] oder [links click, Q])
    // 2. führe folgenden Code aus: 'fetch("https://www.reddit.com/r/place/").then(res => res.text()).then(res => console.log(res.match(/"accessToken":"(\\"|[^"]*)"/)[1]));'
    // 3. kopiere Zeichenkette (sowas wie "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1Nj...") in zs_accessToken
    // WICHTIG: GIB NIEMANDEN DIESE ZEICHENKETTE, DIESER ERLAUBT ZUGRIFF AUF DEINEN ACCOUNT

    // 1. open developer tools ([F12] or [left click, Q])
    // 2. run following code: 'fetch("https://www.reddit.com/r/place/").then(res => res.text()).then(res => console.log(res.match(/"accessToken":"(\\"|[^"]*)"/)[1]));'
    // 3. copy string (something like "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1Nj...") to zs_accessToken
    // IMPORTANT: DONT GIVE THIS STRING TO ANYBODY, IT GIVES ACCESS TO YOUR ACCOUNT
    const zs_accessToken = "";

    const zs_version = "1.3";
    let c2;

    // ----------------------------------------
    // Toaster
    // ----------------------------------------

    class Toaster {
		static log = (conf, msg) => {
			console.log(`%s: ${conf}`, new Date().toISOString(), msg);
		}

		static info = (msg) => {
			this.log("\x1b[37m%s\x1b[0m", msg);
        }

        static warn = (msg) => {
			this.log("\x1b[33m%s\x1b[0m", msg);
        }

        static error = (msg) => {
			this.log("\x1b[31m%s\x1b[0m", msg);
        }

        static success = (msg) => {
			this.log("\x1b[32m%s\x1b[0m", msg);
        }

        static place = (msg, x, y) => {
			this.info(msg);
        }
    }

    // ----------------------------------------
    // Timer
    // ----------------------------------------

    // Override setTimeout to allow getting the time left
    let placeTimeout;
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

    // ----------------------------------------
    // Canvas
    // ----------------------------------------

    class Canvas {
        static getCanvasId = (x, y) => {
            if (y < 0 && x < -500) {
                return 0
            } else if (y < 0 && x < 500 && x >= -500) {
                return 1;
            } else if (y < 0 && x >= 500) {
                return 2;
            } else if (y >= 0 && x < -500) {
                return 3;
            } else if (y >= 0 && x < 500 && x >= -500) {
                return 4;
            } else if (y >= 0 && x >= 500) {
                return 5;
            }
            console.error("Unknown canvas!");
            return 0;
        }

        static getCanvasX = (x, y) => {
            return Math.abs((x + 1500) % 1000);
        }
    
        static getCanvasY = (x, y) => {
            return Canvas.getCanvasId(x, y) < 3 ? y + 1000 : y;
        }
    
        static placePixel = async (x, y, color) => {
            // console.log("Trying to place pixel at %s, %s in %s", x, y, color);
            const response = await fetch("https://gql-realtime-2.reddit.com/query", {
                method: "POST",
                body: JSON.stringify({
                    "operationName": "setPixel",
                    "variables": {
                        "input": {
                            "actionName": "r/replace:set_pixel",
                            "PixelMessageData": {
                                "coordinate": {
                                    "x": Canvas.getCanvasX(x, y),
                                    "y": Canvas.getCanvasY(x, y)
                                },
                                "colorIndex": color,
                                "canvasIndex": Canvas.getCanvasId(x, y)
                            }
                        }
                    },
                    "query": `mutation setPixel($input: ActInput!) {
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
                    "origin": "https://garlic-bread.reddit.com",
                    "referer": "https://garlic-bread.reddit.com/",
                    "apollographql-client-name": "garlic-bread",
                    "Authorization": `Bearer ${zs_accessToken}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json()
            if (data.errors !== undefined) {
                if (data.errors[0].message === "Ratelimited") {
                    // console.log("Could not place pixel at %s, %s in %s - Ratelimit", x, y, color);
					const timestamp = data.errors[0].extensions?.nextAvailablePixelTs;
					const timeLeft = new Date(timestamp - Date.now())
						.toISOString()
						.match(/T(.*)Z/)[1];
                    Toaster.warn(`Du hast noch Abklingzeit! (${timeLeft})`);
                    return {status: "Failture", timestamp: timestamp};
                }
                // console.log("Could not place pixel at %s, %s in %s - Response error", x, y, color);
                // console.error(data.errors);
                Toaster.error("Fehler beim Platzieren des Pixels");
				return {status: "Failture", timestamp: null};
            }
            // console.log("Did place pixel at %s, %s in %s", x, y, color);
            Toaster.place(`Pixel (${x}, ${y}) platziert!`, x, y);
			const timestamp = data?.data?.act?.data?.[0]?.data?.nextAvailablePixelTimestamp;
			return {status: "Success", timestamp: timestamp};
        }

        static requestCooldown = async () => {
            const response = await fetch("https://gql-realtime-2.reddit.com/query", {
                method: "POST",
                body: JSON.stringify({
                    "operationName": "getUserCooldown",
                    "variables": {
                        "input": {
                            "actionName": "r/replace:get_user_cooldown"
                        }
                    },
                    "query": `mutation getUserCooldown($input: ActInput!) {
                        act(input: $input) {
                            data {
                                ... on BasicMessage {
                                    id
                                    data {
                                        ... on GetUserCooldownResponseMessageData {
                                            nextAvailablePixelTimestamp
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
                    }`
                }),
                headers: {
                    "origin": "https://garlic-bread.reddit.com",
                    "referer": "https://garlic-bread.reddit.com/",
                    "apollographql-client-name": "garlic-bread",
                    "Authorization": `Bearer ${zs_accessToken}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (data.errors !== undefined) {
                // console.error(data.errors);
                return null;
            }
            const timestamp = data?.data?.act?.data?.[0]?.data?.nextAvailablePixelTimestamp;
            if (timestamp) {
				const timeLeft = new Date(timestamp - Date.now())
					.toISOString()
					.match(/T(.*)Z/)[1];
                Toaster.warn(`Du hast noch Abklingzeit! (${timeLeft})`);
                return timestamp;
            }
            return null;
        }
    }

    // ----------------------------------------
    // RedditAPI
    // ----------------------------------------

    class RedditApi {
        static getAccessToken = async () => {
			return zs_accessToken;
        }
    }

    // ----------------------------------------
    // CarpetBomber
    // ----------------------------------------

    class CarpetBomber {
        static getTokens = () => {
            return ["Wololo"];
        }

        static requestJob = () => {
            if (c2.readyState !== c2.OPEN) {
                Toaster.error("Verbindung zum \"Carpetbomber\" abgebrochen. Verbinde...");
                CarpetBomber.initCarpetbomberConnection();
                return;
            }
            c2.send(JSON.stringify({ type: "RequestJobs", tokens: CarpetBomber.getTokens() }));
        }

        static processJobResponse = (jobs) => {
            if (!jobs || jobs === {}) {
                Toaster.warn("Kein verfügbarer Auftrag. Versuche in 60s erneut");
                clearTimeout(placeTimeout);
                placeTimeout = setTimeout(() => {
                    CarpetBomber.requestJob();
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
                        CarpetBomber.requestJob();
                    }, Math.max(5000, Date.parse(ratelimit) + 2000 - Date.now()));
                    return;
                }
                // Other error. No jobs left?
                Toaster.warn("Kein verfügbarer Auftrag. Versuche in 20s erneut");
                clearTimeout(placeTimeout);
                placeTimeout = setTimeout(() => {
                    CarpetBomber.requestJob();
                }, 20000);
                return;
            }
            // Execute job
            Canvas.placePixel(job.x, job.y, job.color - 1).then((placeResult) => {
                const { status, timestamp } = placeResult;
                // Replay acknoledgement
                const token = CarpetBomber.getTokens()[0];
                c2.send(JSON.stringify({ type: "JobStatusReport", tokens: { [token]: status }}));
                // Schedule next job
                let nextTry = timestamp ? timestamp - Date.now() : 5*60*1000 + 2000 + Math.floor(Math.random()*8000);
                clearTimeout(placeTimeout);
                placeTimeout = setTimeout(() => {
                    CarpetBomber.requestJob();
                }, nextTry);
            });
        }

        static startRequestLoop = () => {
            Canvas.requestCooldown().then((nextTry) => {
                if(nextTry) {
                    clearTimeout(placeTimeout);
                    placeTimeout = setTimeout(() => {
                        CarpetBomber.requestJob();
                    }, Math.max(5000, nextTry + 2000 - Date.now()));
					return
                }
                CarpetBomber.requestJob();
            });
        }

        static initCarpetbomberConnection = () => {
            c2 = new WebSocket("wss://carpetbomber.place.army");

            c2.onopen = () => {
                Toaster.info("Verbinde mit \"Carpetbomber\"...");
                c2.send(JSON.stringify({ type: "Handshake", version: zs_version }));
                setInterval(() => c2.send(JSON.stringify({ type: "Wakeup"})), 40*1000);
            }
            
            c2.onerror = (error) => {
                Toaster.error("Verbindung zum \"Carpetbomber\" fehlgeschlagen! Versuche in 5s erneut");
                // console.error(error);
                setTimeout(() => {
					CarpetBomber.initCarpetbomberConnection();
				}, 5000);
            }

            c2.onmessage = (event) => {
                const data = JSON.parse(event.data)
                // console.log("received: %s", JSON.stringify(data));

                if (data.type === "UpdateVersion") {
					if(!data.version || data.version == "Unsupported") {
						Toaster.error("Neue Version verfürgbar!!!");
						return;
					}
                    Toaster.success("Verbindung aufgebaut!");
					CarpetBomber.startRequestLoop();
                } else if (data.type == "Jobs") {
                    CarpetBomber.processJobResponse(data.jobs);
                }
            }
        }
    }

    // ----------------------------------------
    // Run
    // ----------------------------------------

    CarpetBomber.initCarpetbomberConnection();
})();