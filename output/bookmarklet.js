javascript: (async()=>{if(!window.location.href.startsWith("https://www.reddit.com/r/place/")&&!window.location.href.startsWith("https://new.reddit.com/r/place/")){return}if(document.head.querySelector('meta[name="zinnsoldat"]')){console.warn("Script already loaded!");return}const marker=document.createElement("meta");marker.setAttribute("name","zinnsoldat");document.head.appendChild(marker);const zs_style=document.createElement("style");zs_style.innerHTML=`
        .zs-hidden {
            display: none;
        }
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
            background: linear-gradient(-90deg, #C03400 var(--zs_timeout), #FF4500 var(--zs_timeout));
        }
        .zs-startbutton:hover {
            background: linear-gradient(-90deg, #802300 var(--zs_timeout), #E03D00 var(--zs_timeout));
        }
        .zs-stopbutton {
            background: linear-gradient(-90deg, #007B4E var(--zs_timeout), #00A368 var(--zs_timeout));
        }
        .zs-stopbutton:hover {
            background: linear-gradient(-90deg, #005234 var(--zs_timeout), #008F5B var(--zs_timeout));
        }
    `;document.head.appendChild(zs_style);await new Promise((resolve,reject)=>{var toastifyStyle=document.createElement("link");toastifyStyle.type="text/css";toastifyStyle.rel="stylesheet";toastifyStyle.media="screen";toastifyStyle.href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css";document.head.appendChild(toastifyStyle);var toastifyScript=document.createElement("script");toastifyScript.setAttribute("src","https://cdn.jsdelivr.net/npm/toastify-js");toastifyScript.setAttribute("async",false);document.body.appendChild(toastifyScript);toastifyScript.addEventListener("load",ev=>{resolve({status:true})});toastifyScript.addEventListener("error",ev=>{reject({status:false,message:`Failed to load the toastify`})})});class Toaster{static info=msg=>{Toastify({text:msg,duration:5e3,gravity:"bottom",position:"right",stopOnFocus:true,className:"zs-pixeled",style:{background:"#383838",color:"#fff","box-shadow":"8px 8px 0px rgba(0, 0, 0, 0.75)"}}).showToast()};static warn=msg=>{Toastify({text:msg,duration:5e3,gravity:"bottom",position:"right",stopOnFocus:true,className:"zs-pixeled",style:{background:"#FFA800",color:"#000","box-shadow":"8px 8px 0px rgba(0, 0, 0, 0.75)"}}).showToast()};static error=msg=>{Toastify({text:msg,duration:5e3,gravity:"bottom",position:"right",stopOnFocus:true,className:"zs-pixeled",style:{background:"#d93a00",color:"#fff","box-shadow":"8px 8px 0px rgba(0, 0, 0, 0.75)"}}).showToast()};static success=msg=>{Toastify({text:msg,duration:5e3,gravity:"bottom",position:"right",stopOnFocus:true,className:"zs-pixeled",style:{background:"#00A368",color:"#fff","box-shadow":"8px 8px 0px rgba(0, 0, 0, 0.75)"}}).showToast()};static update=()=>{Toastify({text:"Neue Version auf https://place.army/ verfügbar!",destination:"https://place.army/",duration:-1,gravity:"bottom",position:"right",stopOnFocus:true,className:"zs-pixeled",style:{background:"#3690EA",color:"#fff","box-shadow":"8px 8px 0px rgba(0, 0, 0, 0.75)"}}).showToast()};static place=(msg,x,y)=>{Toastify({text:msg,duration:5e3,gravity:"bottom",position:"right",stopOnFocus:true,className:"zs-pixeled",onClick:()=>location.href=`https://www.reddit.com/r/place/?cx=${x}&cy=${y}&px=18&screenmode=fullscreen`,style:{background:"#00A368",color:"#fff","box-shadow":"8px 8px 0px rgba(0, 0, 0, 0.75)"}}).showToast()}}let placeTimeout;const _setTimeout=setTimeout;const _clearTimeout=clearTimeout;const zs_allTimeouts={};setTimeout=(callback,delay)=>{let id=_setTimeout(callback,delay);zs_allTimeouts[id]=Date.now()+delay;return id};clearTimeout=id=>{_clearTimeout(id);zs_allTimeouts[id]=undefined};const getTimeout=id=>{if(zs_allTimeouts[id]){return Math.max(zs_allTimeouts[id]-Date.now(),0)}return NaN};setInterval(()=>{let theTimeout=getTimeout(placeTimeout);if(Number.isNaN(theTimeout)){theTimeout=0}const maxTimeout=3e5;const percentage=100-Math.min(Math.max(Math.round(theTimeout/maxTimeout*100),0),100);zs_startButton.style.setProperty("--zs_timeout",`${percentage}%`)},1);let zs_running=true;let zs_initialized;const zs_version="0.5";let zs_accessToken;let c2;class Canvas{static getCanvasId=(x,y)=>{if(y<0&&x<-500){return 0}else if(y<0&&x<500&&x>=-500){return 1}else if(y<0&&x>=500){return 2}else if(y>=0&&x<-500){return 3}else if(y>=0&&x<500&&x>=-500){return 4}else if(y>=0&&x>=500){return 5}console.error("Unknown canvas!");return 0};static getCanvasX=(x,y)=>{return Math.abs((x+1500)%1e3)};static getCanvasY=(x,y)=>{return Canvas.getCanvasId(x,y)<3?y+1e3:y};static placePixel=async(x,y,color)=>{console.log("Trying to place pixel at %s, %s in %s",x,y,color);const response=await fetch("https://gql-realtime-2.reddit.com/query",{method:"POST",body:JSON.stringify({operationName:"setPixel",variables:{input:{actionName:"r/replace:set_pixel",PixelMessageData:{coordinate:{x:Canvas.getCanvasX(x,y),y:Canvas.getCanvasY(x,y)},colorIndex:color,canvasIndex:Canvas.getCanvasId(x,y)}}},query:`mutation setPixel($input: ActInput!) {
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
                    `}),headers:{origin:"https://garlic-bread.reddit.com",referer:"https://garlic-bread.reddit.com/","apollographql-client-name":"garlic-bread",Authorization:`Bearer ${zs_accessToken}`,"Content-Type":"application/json"}});const data=await response.json();if(data.errors!==undefined){if(data.errors[0].message==="Ratelimited"){console.log("Could not place pixel at %s, %s in %s - Ratelimit",x,y,color);Toaster.warn("Du hast noch Abklingzeit!");return data.errors[0].extensions?.nextAvailablePixelTs}console.log("Could not place pixel at %s, %s in %s - Response error",x,y,color);console.error(data.errors);Toaster.error("Fehler beim Platzieren des Pixels");return null}console.log("Did place pixel at %s, %s in %s",x,y,color);Toaster.place(`Pixel (${x}, ${y}) platziert!`,x,y);return data?.data?.act?.data?.[0]?.data?.nextAvailablePixelTimestamp};static requestCooldown=async()=>{const response=await fetch("https://gql-realtime-2.reddit.com/query",{method:"POST",body:JSON.stringify({operationName:"getUserCooldown",variables:{input:{actionName:"r/replace:get_user_cooldown"}},query:`mutation getUserCooldown($input: ActInput!) {
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
                    }`}),headers:{origin:"https://garlic-bread.reddit.com",referer:"https://garlic-bread.reddit.com/","apollographql-client-name":"garlic-bread",Authorization:`Bearer ${zs_accessToken}`,"Content-Type":"application/json"}});const data=await response.json();if(data.errors!==undefined){console.error(data.errors);return null}const timestamp=data?.data?.act?.data?.[0]?.data?.nextAvailablePixelTimestamp;if(timestamp){Toaster.warn("Du hast noch Abklingzeit!");return timestamp}return null}}class RedditApi{static getAccessToken=async()=>{const usingOldReddit=window.location.href.includes("new.reddit.com");const url=usingOldReddit?"https://new.reddit.com/r/place/":"https://www.reddit.com/r/place/";const response=await fetch(url);const responseText=await response.text();return responseText.match(/"accessToken":"(\\"|[^"]*)"/)[1]}}class CarpetBomber{static getTokens=()=>{return["Wololo"]};static requestJob=()=>{if(c2.readyState!==c2.OPEN){Toaster.error('Verbindung zum "Carpetbomber" abgebrochen. Verbinde...');CarpetBomber.initCarpetbomberConnection();return}if(!zs_running){return}c2.send(JSON.stringify({type:"RequestJobs",tokens:CarpetBomber.getTokens()}))};static processJobResponse=jobs=>{if(!jobs||jobs==={}){Toaster.warn("Kein verfügbarer Auftrag. Versuche in 60s erneut");clearTimeout(placeTimeout);placeTimeout=setTimeout(()=>{CarpetBomber.requestJob()},6e4);return}let[token,[job,code]]=Object.entries(jobs)[0];if(!job){const ratelimit=code?.Ratelimited?.until;if(ratelimit){clearTimeout(placeTimeout);placeTimeout=setTimeout(()=>{CarpetBomber.requestJob()},Math.max(5e3,Date.parse(ratelimit)+2e3-Date.now()));return}Toaster.warn("Kein verfügbarer Auftrag. Versuche in 20s erneut");clearTimeout(placeTimeout);placeTimeout=setTimeout(()=>{CarpetBomber.requestJob()},2e4);return}Canvas.placePixel(job.x,job.y,job.color-1).then(nextTry=>{clearTimeout(placeTimeout);placeTimeout=setTimeout(()=>{CarpetBomber.requestJob()},Math.max(5e3,(nextTry||5*60*1e3)+2e3-Date.now()))})};static initCarpetbomberConnection=()=>{c2=new WebSocket("wss://carpetbomber.place.army");c2.onopen=()=>{zs_initialized=true;Toaster.info('Verbinde mit "Carpetbomber"...');c2.send(JSON.stringify({type:"Handshake",version:zs_version}));Canvas.requestCooldown().then(nextTry=>{if(!nextTry){CarpetBomber.requestJob()}else{clearTimeout(placeTimeout);placeTimeout=setTimeout(()=>{CarpetBomber.requestJob()},Math.max(5e3,nextTry+2e3-Date.now()))}});setInterval(()=>c2.send(JSON.stringify({type:"Wakeup"})),40*1e3)};c2.onerror=error=>{Toaster.error('Verbindung zum "Carpetbomber" fehlgeschlagen! Versuche in 5s erneut');console.error(error);setTimeout(zs_initCarpetbomberConnection,5e3)};c2.onmessage=event=>{const data=JSON.parse(event.data);if(data.type==="UpdateVersion"){Toaster.success("Verbindung aufgebaut!");if(data.version>zs_version){Toaster.update()}}else if(data.type=="Jobs"){CarpetBomber.processJobResponse(data.jobs)}}}}const zs_startButton=document.createElement("button");zs_startButton.innerText=`Zinnsoldat v${zs_version}`;zs_startButton.classList.add("zs-pixeled","zs-button","zs-stopbutton");zs_startButton.style.setProperty("--zs_timeout","100%");document.body.appendChild(zs_startButton);const zs_startBot=()=>{zs_running=true;zs_startButton.classList.remove("zs-startbutton");zs_startButton.classList.add("zs-stopbutton");if(zs_initialized){CarpetBomber.zs_requestJob()}};const zs_stopBot=()=>{zs_running=false;clearTimeout(placeTimeout);zs_startButton.classList.remove("zs-stopbutton");zs_startButton.classList.add("zs-startbutton")};zs_startButton.onclick=()=>{if(zs_running){zs_stopBot()}else{zs_startBot()}};Toaster.info("Erbitte Reddit um Zugriff...");zs_accessToken=await RedditApi.getAccessToken();Toaster.success("Zugriff gewährt!");CarpetBomber.initCarpetbomberConnection()})();